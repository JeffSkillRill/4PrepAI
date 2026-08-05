begin;

-- Administrative access is a grant history, not a mutable role flag. Re-granting
-- a previously revoked user creates a new row; revocation never deletes history.
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  granted_at timestamptz not null default now(),
  granted_by uuid,
  grant_reason text not null,
  revoked_at timestamptz,
  revoked_by uuid,
  revocation_reason text,
  constraint admin_users_id_user_unique unique (id, user_id),
  constraint admin_users_user_id_not_nil
    check (user_id <> '00000000-0000-0000-0000-000000000000'::uuid),
  constraint admin_users_grant_reason_code
    check (grant_reason ~ '^[a-z][a-z0-9_]{0,63}$'),
  constraint admin_users_revocation_reason_code
    check (
      revocation_reason is null
      or revocation_reason ~ '^[a-z][a-z0-9_]{0,63}$'
    ),
  constraint admin_users_revocation_order
    check (revoked_at is null or revoked_at >= granted_at),
  constraint admin_users_revocation_bundle
    check (
      (revoked_at is null and revoked_by is null and revocation_reason is null)
      or
      (revoked_at is not null and revocation_reason is not null)
    )
);

create unique index admin_users_one_active_grant_idx
  on public.admin_users (user_id)
  where revoked_at is null;

create index admin_users_granted_at_idx
  on public.admin_users (granted_at desc);

create index admin_users_revoked_at_idx
  on public.admin_users (revoked_at desc)
  where revoked_at is not null;

create function public.guard_admin_user_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Admin grant history cannot be deleted';
  end if;

  if old.id is distinct from new.id
    or old.user_id is distinct from new.user_id
    or old.granted_at is distinct from new.granted_at
    or old.granted_by is distinct from new.granted_by
    or old.grant_reason is distinct from new.grant_reason
  then
    raise exception 'An admin grant identity cannot be changed';
  end if;

  if old.revoked_at is not null then
    raise exception 'A revoked admin grant cannot be changed';
  end if;

  if new.revoked_at is null then
    raise exception 'The only permitted admin grant update is revocation';
  end if;

  return new;
end;
$$;

create trigger admin_users_preserve_history
before update or delete on public.admin_users
for each row execute function public.guard_admin_user_history();

-- This is an application audit ledger. actor_user_id is intentionally nullable:
-- missing, malformed, and expired credentials cannot be resolved to an Auth user,
-- but their denied request must still be recorded. Never store credentials,
-- headers, cookies, private record contents, or unredacted network addresses here.
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid,
  actor_admin_grant_id uuid,
  endpoint text not null,
  action text not null,
  resource_type text not null,
  resource_id text,
  target_user_id uuid,
  outcome text not null,
  reason_code text,
  metadata jsonb not null default '{}'::jsonb,
  constraint admin_audit_log_actor_grant_fk
    foreign key (actor_admin_grant_id, actor_user_id)
    references public.admin_users (id, user_id),
  constraint admin_audit_log_endpoint
    check (
      char_length(endpoint) between 1 and 128
      and endpoint ~ '^[a-z0-9][a-z0-9._/-]*$'
    ),
  constraint admin_audit_log_action
    check (
      char_length(action) between 1 and 96
      and action ~ '^[a-z][a-z0-9._-]*$'
    ),
  constraint admin_audit_log_resource_type
    check (
      char_length(resource_type) between 1 and 64
      and resource_type ~ '^[a-z][a-z0-9._-]*$'
    ),
  constraint admin_audit_log_resource_id
    check (
      resource_id is null
      or (
        char_length(resource_id) between 1 and 512
        and resource_id !~ '[[:cntrl:]]'
      )
    ),
  constraint admin_audit_log_outcome
    check (outcome in ('allowed', 'denied', 'failed')),
  constraint admin_audit_log_reason_code
    check (
      reason_code is null
      or reason_code ~ '^[a-z][a-z0-9_]{0,63}$'
    ),
  constraint admin_audit_log_outcome_reason
    check (
      (outcome = 'allowed' and reason_code is null)
      or
      (outcome in ('denied', 'failed') and reason_code is not null)
    ),
  constraint admin_audit_log_allowed_actor
    check (
      outcome <> 'allowed'
      or (actor_user_id is not null and actor_admin_grant_id is not null)
    ),
  constraint admin_audit_log_grant_requires_actor
    check (actor_admin_grant_id is null or actor_user_id is not null),
  constraint admin_audit_log_metadata_object
    check (jsonb_typeof(metadata) = 'object'),
  constraint admin_audit_log_metadata_bounded
    check (pg_column_size(metadata) <= 4096),
  constraint admin_audit_log_metadata_no_secret_keys
    check (
      not metadata ?| array[
        'authorization',
        'cookie',
        'token',
        'jwt',
        'access_token',
        'refresh_token',
        'service_role_key',
        'password',
        'email',
        'file_contents',
        'submission_text',
        'profile'
      ]
    )
);

create index admin_audit_log_request_idx
  on public.admin_audit_log (request_id, occurred_at);

create index admin_audit_log_actor_idx
  on public.admin_audit_log (actor_user_id, occurred_at desc)
  where actor_user_id is not null;

create index admin_audit_log_target_idx
  on public.admin_audit_log (target_user_id, occurred_at desc)
  where target_user_id is not null;

create index admin_audit_log_resource_idx
  on public.admin_audit_log (resource_type, resource_id, occurred_at desc);

create index admin_audit_log_denied_idx
  on public.admin_audit_log (occurred_at desc, reason_code)
  where outcome = 'denied';

create function public.reject_admin_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'The admin audit log is append-only';
end;
$$;

create trigger admin_audit_log_no_update_or_delete
before update or delete on public.admin_audit_log
for each statement execute function public.reject_admin_audit_mutation();

create trigger admin_audit_log_no_truncate
before truncate on public.admin_audit_log
for each statement execute function public.reject_admin_audit_mutation();

-- Rate-limit events contain only a stable request ID, a caller bucket, an
-- endpoint label, and the decision. caller_key is either a user UUID or a salted
-- SHA-256 IP hash; a raw IP address, JWT, or request body is never accepted.
create table public.admin_api_requests (
  request_id uuid primary key,
  actor_user_id uuid,
  caller_key text not null,
  endpoint text not null,
  allowed boolean not null,
  created_at timestamptz not null default now(),
  constraint admin_api_requests_caller_key
    check (
      caller_key ~ '^user:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or caller_key ~ '^ip:[0-9a-f]{64}$'
    ),
  constraint admin_api_requests_endpoint
    check (
      char_length(endpoint) between 1 and 128
      and endpoint ~ '^[a-z0-9][a-z0-9._/-]*$'
    )
);

create index admin_api_requests_caller_window_idx
  on public.admin_api_requests (caller_key, created_at desc);

create index admin_api_requests_endpoint_window_idx
  on public.admin_api_requests (endpoint, created_at desc);

create index admin_api_requests_created_at_idx
  on public.admin_api_requests (created_at desc);

alter table public.admin_users enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.admin_api_requests enable row level security;

-- There are deliberately no RLS policies for anon or authenticated. Browser
-- clients cannot discover admins, read the audit ledger, or call the limiter.
revoke all on public.admin_users
  from public, anon, authenticated, service_role;
revoke all on public.admin_audit_log
  from public, anon, authenticated, service_role;
revoke all on public.admin_api_requests
  from public, anon, authenticated, service_role;

grant select, insert on public.admin_users to service_role;
grant update (revoked_at, revoked_by, revocation_reason)
  on public.admin_users to service_role;
grant select, insert on public.admin_audit_log to service_role;
grant select on public.admin_api_requests to service_role;

create function public.begin_admin_api_request(
  p_request_id uuid,
  p_actor_user_id uuid,
  p_caller_key text,
  p_endpoint text,
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
  if p_request_id is null
    or p_caller_key is null
    or not (
      p_caller_key ~ '^user:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or p_caller_key ~ '^ip:[0-9a-f]{64}$'
    )
    or p_endpoint is null
    or char_length(p_endpoint) not between 1 and 128
    or p_endpoint !~ '^[a-z0-9][a-z0-9._/-]*$'
    or p_minute_limit is null
    or p_hour_limit is null
    or p_minute_limit < 1
    or p_hour_limit < p_minute_limit
  then
    raise exception 'Invalid admin API rate-limit parameters';
  end if;

  -- Serialize a caller's counters across every privileged endpoint. A hash
  -- collision can only make limiting more conservative; it cannot bypass it.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('admin-api:' || p_caller_key, 0)
  );

  select
    count(*) filter (
      where requests.allowed
        and requests.created_at >= v_now - interval '1 minute'
    )::integer,
    count(*) filter (where requests.allowed)::integer
  into v_minute_count, v_hour_count
  from public.admin_api_requests as requests
  where requests.caller_key = p_caller_key
    and requests.created_at >= v_now - interval '1 hour';

  v_allowed := v_minute_count < p_minute_limit
    and v_hour_count < p_hour_limit;

  insert into public.admin_api_requests (
    request_id,
    actor_user_id,
    caller_key,
    endpoint,
    allowed,
    created_at
  )
  values (
    p_request_id,
    p_actor_user_id,
    p_caller_key,
    p_endpoint,
    v_allowed,
    v_now
  );

  return query
  select
    v_allowed,
    v_minute_count + case when v_allowed then 1 else 0 end,
    v_hour_count + case when v_allowed then 1 else 0 end;
end;
$$;

create function public.prune_admin_api_requests()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows_deleted bigint;
begin
  delete from public.admin_api_requests
  where created_at < clock_timestamp() - interval '7 days';

  get diagnostics v_rows_deleted = row_count;
  return v_rows_deleted;
end;
$$;

revoke all on function public.guard_admin_user_history()
  from public, anon, authenticated, service_role;
revoke all on function public.reject_admin_audit_mutation()
  from public, anon, authenticated, service_role;
revoke all on function public.begin_admin_api_request(uuid, uuid, text, text, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.prune_admin_api_requests()
  from public, anon, authenticated, service_role;

grant execute on function public.begin_admin_api_request(uuid, uuid, text, text, integer, integer)
  to service_role;
grant execute on function public.prune_admin_api_requests()
  to service_role;

comment on table public.admin_users is
  'Service-role-only append-preserving history of manually granted admin access. Active access is a row whose revoked_at is null. user_id is a stable Auth UUID snapshot, deliberately retained if the Auth account is later removed.';
comment on column public.admin_users.granted_by is
  'Auth UUID of the granting admin when one exists; null is reserved for a trusted bootstrap SQL grant.';
comment on column public.admin_users.grant_reason is
  'Non-secret operational reason code such as initial_bootstrap or operator_access.';
comment on column public.admin_users.revoked_by is
  'Auth UUID of the revoking admin when one exists; null denotes a trusted direct SQL revocation.';
comment on table public.admin_audit_log is
  'Service-role-only immutable ledger for every denied admin authorization attempt and every privileged private read or action.';
comment on column public.admin_audit_log.actor_user_id is
  'Resolved Auth UUID, or null when missing, malformed, or expired credentials cannot safely identify a caller.';
comment on column public.admin_audit_log.metadata is
  'Bounded non-secret operational metadata only, such as result counts or stage IDs. Never store credentials, contact details, free text, profiles, homework contents, or file bytes.';
comment on table public.admin_api_requests is
  'Seven-day service-role-only request ledger used by the advisory-lock admin API rate limiter. Caller keys contain user UUIDs or salted IP hashes, never raw IPs or credentials.';
comment on function public.begin_admin_api_request(uuid, uuid, text, text, integer, integer) is
  'Atomically rate-limits a caller across all privileged endpoints and records the decision. Invoke only with the service role from an Edge Function.';
comment on function public.prune_admin_api_requests() is
  'Deletes admin API rate-limit events older than seven days. Run daily from a trusted scheduler or database administrator session; it never touches the append-only audit log.';

commit;
