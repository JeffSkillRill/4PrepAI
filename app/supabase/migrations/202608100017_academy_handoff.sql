begin;

-- The app→Academy handoff. A student who reaches a sourced gap, or the end of a
-- pathway, can ask a human at 4Prep Academy to look into it. This is the only
-- table in the product that holds a contact detail a student typed for the
-- purpose of being contacted back, and its subjects are frequently minors, so it
-- is deny-all at rest and written only through the boundary function below.
create table public.leads (
  id uuid primary key,
  -- Nullable on purpose. The catalogue and the counselor are both public, so a
  -- student can reach a gap without an account; forcing signup at the highest
  -- intent moment in the product would cost exactly the leads worth having.
  -- Cascade rather than set null: name and contact live in plain columns here,
  -- so nulling the reference would not anonymise the row. "Delete my account"
  -- has to mean the lead goes too.
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  -- One free field on purpose: phone, Telegram handle, or email. A seventeen
  -- year old should not have to pick a channel before asking a question.
  contact text not null,
  source text not null check (source in ('results', 'gap', 'counselor_refusal')),
  -- Product-derived only (university id, field name, pathway ref). Never free
  -- text from the student; note is the field for that.
  context_ref text,
  note text,
  status text not null default 'new'
    check (status in ('new', 'claimed', 'answered', 'closed')),
  claimed_by uuid,
  claimed_at timestamptz,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint leads_name_length
    check (char_length(btrim(name)) between 1 and 120),
  constraint leads_contact_length
    check (char_length(btrim(contact)) between 3 and 200),
  constraint leads_note_length
    check (note is null or char_length(btrim(note)) between 1 and 1000),
  constraint leads_context_ref_length
    check (context_ref is null or char_length(btrim(context_ref)) between 1 and 200),
  -- Status and its timestamps must agree, so an operator queue can never be
  -- read two different ways depending on which column it trusts.
  constraint leads_claim_bundle check (
    (status = 'new' and claimed_by is null and claimed_at is null)
    or (status <> 'new' and claimed_by is not null and claimed_at is not null)
  ),
  constraint leads_answered_bundle check (
    (answered_at is null and status in ('new', 'claimed'))
    or (answered_at is not null and status in ('answered', 'closed'))
  )
);

alter table public.leads enable row level security;

-- No policies, deliberately. Deny-all at rest for anon and authenticated, the
-- same pattern already applied to counselor_requests, counselor_cache,
-- admin_users, admin_audit_log and admin_api_requests. Inserts arrive through
-- public.submit_lead; reads happen only through the service role in admin-api.
revoke all on public.leads from public, anon, authenticated;
grant all on public.leads to service_role;

-- The operator work queue: oldest unanswered first.
create index leads_queue_idx
  on public.leads (created_at asc)
  where status = 'new';

-- Rate-limit window scans and retention sweeps.
create index leads_recent_idx on public.leads (created_at desc);

-- Per-student limit checks and the account-deletion re-count.
create index leads_user_idx
  on public.leads (user_id, created_at desc)
  where user_id is not null;

-- Idempotent, rate-limited submission boundary.
--
-- Rate-limiting caveat, stated here so the next reader does not assume more than
-- is true: Postgres cannot see the caller's IP address, so the anonymous limit
-- below is a global ceiling rather than a per-caller one. It bounds total damage
-- from a spam burst but will not distinguish one abusive client from many honest
-- ones. That is a deliberate v1 trade at current volume, where a junk row costs
-- one operator glance. If anonymous abuse ever appears, move this write behind an
-- edge function so it can salt the IP into a caller key and reuse the counselor's
-- per-caller limiter, exactly as public.begin_counselor_request already does.
create function public.submit_lead(
  p_lead_id uuid,
  p_name text,
  p_contact text,
  p_source text,
  p_context_ref text default null,
  p_note text default null
)
returns table (
  status text,
  lead_id uuid,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_name text := btrim(p_name);
  v_contact text := btrim(p_contact);
  v_context_ref text := nullif(btrim(coalesce(p_context_ref, '')), '');
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_existing public.leads%rowtype;
  v_hour_count integer;
  v_day_count integer;
  v_retry_seconds integer := 0;
  v_lock_key text;
begin
  if p_lead_id is null
    or p_source is null
    or p_source not in ('results', 'gap', 'counselor_refusal')
    or char_length(v_name) not between 1 and 120
    or char_length(v_contact) not between 3 and 200
    or (v_note is not null and char_length(v_note) > 1000)
    or (v_context_ref is not null and char_length(v_context_ref) > 200)
  then
    raise exception 'Invalid lead submission' using errcode = '22023';
  end if;

  -- An operator asking to be contacted by the Academy is always a mistake or a
  -- test; refuse it rather than let it enter the student queue.
  if v_user_id is not null and exists (
    select 1 from public.admin_users where user_id = v_user_id
  ) then
    raise exception 'Admin identities cannot submit Academy leads'
      using errcode = '42501';
  end if;

  v_lock_key := case
    when v_user_id is null then 'academy-lead:anonymous'
    else 'academy-lead:' || v_user_id::text
  end;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_lock_key, 0)
  );

  -- Idempotency before rate limiting: a client retrying after a dropped response
  -- must not be punished for the first attempt having succeeded.
  select lead.*
  into v_existing
  from public.leads as lead
  where lead.id = p_lead_id;

  if found then
    if v_existing.user_id is distinct from v_user_id
      or v_existing.source <> p_source
      or v_existing.contact <> v_contact
    then
      raise exception 'Lead identifier conflict' using errcode = '23505';
    end if;
    return query select 'submitted'::text, v_existing.id, 0;
    return;
  end if;

  if v_user_id is null then
    select
      count(*) filter (
        where lead.created_at >= clock_timestamp() - interval '1 hour'
      )::integer,
      count(*)::integer
    into v_hour_count, v_day_count
    from public.leads as lead
    where lead.user_id is null
      and lead.created_at >= clock_timestamp() - interval '24 hours';

    if v_hour_count >= 30 then
      select greatest(
        1,
        ceil(extract(
          epoch from min(lead.created_at) + interval '1 hour' - clock_timestamp()
        ))::integer
      )
      into v_retry_seconds
      from public.leads as lead
      where lead.user_id is null
        and lead.created_at >= clock_timestamp() - interval '1 hour';
    elsif v_day_count >= 200 then
      select greatest(
        1,
        ceil(extract(
          epoch from min(lead.created_at) + interval '24 hours' - clock_timestamp()
        ))::integer
      )
      into v_retry_seconds
      from public.leads as lead
      where lead.user_id is null
        and lead.created_at >= clock_timestamp() - interval '24 hours';
    end if;
  else
    select
      count(*) filter (
        where lead.created_at >= clock_timestamp() - interval '1 hour'
      )::integer,
      count(*)::integer
    into v_hour_count, v_day_count
    from public.leads as lead
    where lead.user_id = v_user_id
      and lead.created_at >= clock_timestamp() - interval '24 hours';

    if v_hour_count >= 3 then
      select greatest(
        1,
        ceil(extract(
          epoch from min(lead.created_at) + interval '1 hour' - clock_timestamp()
        ))::integer
      )
      into v_retry_seconds
      from public.leads as lead
      where lead.user_id = v_user_id
        and lead.created_at >= clock_timestamp() - interval '1 hour';
    elsif v_day_count >= 10 then
      select greatest(
        1,
        ceil(extract(
          epoch from min(lead.created_at) + interval '24 hours' - clock_timestamp()
        ))::integer
      )
      into v_retry_seconds
      from public.leads as lead
      where lead.user_id = v_user_id
        and lead.created_at >= clock_timestamp() - interval '24 hours';
    end if;
  end if;

  if v_retry_seconds > 0 then
    return query select 'rate_limited'::text, p_lead_id, v_retry_seconds;
    return;
  end if;

  insert into public.leads (
    id,
    user_id,
    name,
    contact,
    source,
    context_ref,
    note
  ) values (
    p_lead_id,
    v_user_id,
    v_name,
    v_contact,
    p_source,
    v_context_ref,
    v_note
  );

  return query select 'submitted'::text, p_lead_id, 0;
end;
$$;

revoke all on function public.submit_lead(uuid, text, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.submit_lead(uuid, text, text, text, text, text)
  to anon, authenticated;

-- Retention. A contact detail belonging to a seventeen year old should not sit
-- here indefinitely because nobody wrote the sweep. Only resolved rows expire;
-- an unanswered lead is never deleted by age, because silently dropping a
-- student's unanswered question is the one outcome this feature exists to avoid.
create function public.prune_resolved_leads()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.leads
  where status in ('answered', 'closed')
    and coalesce(answered_at, created_at) < clock_timestamp() - interval '180 days';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.prune_resolved_leads()
  from public, anon, authenticated, service_role;
grant execute on function public.prune_resolved_leads() to service_role;

-- Service-role-only operator queue projection. Bounded, oldest first, and it
-- returns the waiting age so the console can show the one number that describes
-- the health of this mechanism: how long the oldest unanswered student has been
-- waiting.
create function public.list_lead_queue(
  p_status text default 'new',
  p_limit integer default 50
)
returns table (
  id uuid,
  user_id uuid,
  name text,
  contact text,
  source text,
  context_ref text,
  note text,
  status text,
  claimed_by uuid,
  claimed_at timestamptz,
  answered_at timestamptz,
  created_at timestamptz,
  waiting_hours numeric
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status is null
    or p_status not in ('new', 'claimed', 'answered', 'closed')
    or p_limit is null
    or p_limit not between 1 and 200
  then
    raise exception 'Invalid lead queue request' using errcode = '22023';
  end if;

  return query
  select
    lead.id,
    lead.user_id,
    lead.name,
    lead.contact,
    lead.source,
    lead.context_ref,
    lead.note,
    lead.status,
    lead.claimed_by,
    lead.claimed_at,
    lead.answered_at,
    lead.created_at,
    round(
      extract(epoch from clock_timestamp() - lead.created_at)::numeric / 3600,
      1
    ) as waiting_hours
  from public.leads as lead
  where lead.status = p_status
  order by lead.created_at asc
  limit p_limit;
end;
$$;

revoke all on function public.list_lead_queue(text, integer)
  from public, anon, authenticated, service_role;
grant execute on function public.list_lead_queue(text, integer) to service_role;

comment on table public.leads is
  'App→Academy handoff requests. Deny-all at rest; written only through public.submit_lead and read only by the service role. Resolved rows are pruned after 180 days; unanswered rows are never pruned by age.';
comment on function public.submit_lead(uuid, text, text, text, text, text) is
  'Idempotent lead submission boundary. Authenticated: 3/hour and 10/24h per user. Anonymous: a global 30/hour and 200/24h ceiling, because Postgres cannot see the caller IP — move behind an edge function for per-caller limits if abuse appears.';
comment on function public.prune_resolved_leads() is
  'Deletes answered and closed leads 180 days after resolution. Never deletes an unanswered lead.';
comment on function public.list_lead_queue(text, integer) is
  'Service-role-only bounded operator queue projection, oldest first, with waiting hours.';

commit;
