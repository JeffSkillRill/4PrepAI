begin;

create table public.counselor_requests (
  request_id uuid primary key,
  user_id uuid references auth.users(id) on delete set null,
  caller_key text not null,
  outcome text not null default 'started'
    check (outcome in (
      'started',
      'local_response',
      'cache_hit',
      'live_call',
      'rate_limited',
      'provider_failure',
      'server_failure'
    )),
  cache_key text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint counselor_requests_caller_key_nonempty
    check (char_length(caller_key) > 0),
  constraint counselor_requests_cache_key_hash
    check (cache_key is null or cache_key ~ '^[0-9a-f]{64}$')
);

create index counselor_requests_caller_window_idx
  on public.counselor_requests (caller_key, created_at desc);

create index counselor_requests_outcome_created_idx
  on public.counselor_requests (outcome, created_at desc);

create table public.counselor_cache (
  cache_key text primary key
    check (cache_key ~ '^[0-9a-f]{64}$'),
  response_payload jsonb not null,
  created_at timestamptz not null default now(),
  hit_count bigint not null default 0
    check (hit_count >= 0)
);

create index counselor_cache_created_at_idx
  on public.counselor_cache (created_at desc);

alter table public.counselor_requests enable row level security;
alter table public.counselor_cache enable row level security;

revoke all on public.counselor_requests from public, anon, authenticated;
revoke all on public.counselor_cache from public, anon, authenticated;
grant all on public.counselor_requests to service_role;
grant all on public.counselor_cache to service_role;

create or replace function public.begin_counselor_request(
  p_request_id uuid,
  p_user_id uuid,
  p_caller_key text,
  p_minute_limit integer,
  p_hour_limit integer
)
returns table (
  allowed boolean,
  minute_count integer,
  hour_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_minute_count integer;
  v_hour_count integer;
  v_allowed boolean;
begin
  if p_caller_key is null
    or char_length(p_caller_key) = 0
    or p_minute_limit < 1
    or p_hour_limit < p_minute_limit
  then
    raise exception 'Invalid counselor rate-limit parameters';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_caller_key, 0)
  );

  select
    count(*) filter (
      where created_at >= v_now - interval '1 minute'
    )::integer,
    count(*)::integer
  into v_minute_count, v_hour_count
  from public.counselor_requests
  where caller_key = p_caller_key
    and created_at >= v_now - interval '1 hour'
    and outcome <> 'rate_limited';

  v_allowed := v_minute_count < p_minute_limit
    and v_hour_count < p_hour_limit;

  insert into public.counselor_requests (
    request_id,
    user_id,
    caller_key,
    outcome,
    created_at,
    completed_at
  )
  values (
    p_request_id,
    p_user_id,
    p_caller_key,
    case when v_allowed then 'started' else 'rate_limited' end,
    v_now,
    case when v_allowed then null else v_now end
  );

  return query
  select
    v_allowed,
    v_minute_count + case when v_allowed then 1 else 0 end,
    v_hour_count + case when v_allowed then 1 else 0 end;
end;
$$;

create or replace function public.take_counselor_cache_hit(
  p_cache_key text,
  p_ttl_seconds integer
)
returns table (
  response_payload jsonb,
  hit_count bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_cache_key !~ '^[0-9a-f]{64}$' or p_ttl_seconds < 1 then
    raise exception 'Invalid counselor cache parameters';
  end if;

  return query
  update public.counselor_cache as cache
  set hit_count = cache.hit_count + 1
  where cache.cache_key = p_cache_key
    and cache.created_at >= clock_timestamp() - pg_catalog.make_interval(secs => p_ttl_seconds)
  returning cache.response_payload, cache.hit_count;
end;
$$;

create or replace function public.prune_counselor_operational_data()
returns table (
  request_rows_deleted bigint,
  cache_rows_deleted bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request_rows bigint;
  v_cache_rows bigint;
begin
  delete from public.counselor_requests
  where created_at < clock_timestamp() - interval '7 days';
  get diagnostics v_request_rows = row_count;

  delete from public.counselor_cache
  where created_at < clock_timestamp() - interval '7 days';
  get diagnostics v_cache_rows = row_count;

  return query select v_request_rows, v_cache_rows;
end;
$$;

revoke all on function public.begin_counselor_request(uuid, uuid, text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.take_counselor_cache_hit(text, integer)
  from public, anon, authenticated;
revoke all on function public.prune_counselor_operational_data()
  from public, anon, authenticated;

grant execute on function public.begin_counselor_request(uuid, uuid, text, integer, integer)
  to service_role;
grant execute on function public.take_counselor_cache_hit(text, integer)
  to service_role;
grant execute on function public.prune_counselor_operational_data()
  to service_role;

comment on table public.counselor_requests is
  'Seven-day operational log for counselor rate limiting and cost visibility. Caller keys are user IDs or salted IP hashes; raw IPs and question text are never stored.';
comment on table public.counselor_cache is
  'Validated counselor responses cached by a SHA-256 key. Entries are served for 24 hours by the Edge Function and pruned after seven days.';
comment on function public.prune_counselor_operational_data() is
  'Deletes counselor request and cache rows older than seven days. Run daily with select * from public.prune_counselor_operational_data(); from a trusted scheduler or database administrator session.';

commit;
