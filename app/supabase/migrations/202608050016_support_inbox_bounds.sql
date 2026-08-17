-- Bounds the support inbox and closes an unhandled collision path in
-- send_support_message.
--
-- RECOVERED FILE. This migration was applied to both QA and Production on
-- 5 August 2026 but the file was never committed to the repository. The body
-- below was exported verbatim from supabase_migrations.schema_migrations on
-- 17 August 2026 and restored under its recorded version and name. It is
-- reproduced exactly as applied; do not "tidy" it without re-checking both
-- databases first.

begin;

create index support_threads_activity_idx
  on public.support_threads (last_message_at desc, id desc)
  where last_message_at is not null;

drop function public.list_support_inbox();

create function public.list_support_inbox(
  p_limit integer default 50,
  p_offset integer default 0,
  p_waiting_only boolean default false
)
returns table (
  thread_id uuid,
  user_id uuid,
  last_message_at timestamptz,
  last_sender_role text,
  latest_message_body text,
  total_count bigint,
  waiting_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with bounded as (
    select
      least(greatest(coalesce(p_limit, 50), 1), 200) as row_limit,
      greatest(coalesce(p_offset, 0), 0) as row_offset
  ),
  matched as (
    select thread.*
    from public.support_threads as thread
    where thread.last_message_at is not null
      and (not coalesce(p_waiting_only, false) or thread.last_sender_role = 'student')
  ),
  counted as (
    select
      matched.*,
      count(*) over () as total_count,
      count(*) filter (where matched.last_sender_role = 'student') over () as waiting_count
    from matched
  ),
  page as (
    select counted.*
    from counted, bounded
    -- Mirrors the sort the admin console previously performed in JavaScript:
    -- threads awaiting a reply first and oldest wait first, so the student who
    -- has been waiting longest is never pushed off the page; everything else by
    -- most recent activity. `id` is the tiebreaker that keeps paging stable.
    order by
      (counted.last_sender_role = 'student') desc,
      case when counted.last_sender_role = 'student' then counted.last_message_at end asc,
      counted.last_message_at desc,
      counted.id desc
    limit (select row_limit from bounded)
    offset (select row_offset from bounded)
  )
  select
    page.id,
    page.user_id,
    page.last_message_at,
    page.last_sender_role,
    latest.body,
    page.total_count,
    page.waiting_count
  from page
  join lateral (
    select message.body
    from public.support_messages as message
    where message.thread_id = page.id
    order by message.created_at desc, message.id desc
    limit 1
  ) as latest on true
  order by
    (page.last_sender_role = 'student') desc,
    case when page.last_sender_role = 'student' then page.last_message_at end asc,
    page.last_message_at desc,
    page.id desc;
$$;

revoke all on function public.list_support_inbox(integer, integer, boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.list_support_inbox(integer, integer, boolean) to service_role;

create or replace function public.send_support_message(
  p_message_id uuid,
  p_body text
)
returns table (
  status text,
  message_id uuid,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_body text := btrim(p_body);
  v_thread_id uuid;
  v_existing public.support_messages%rowtype;
  v_minute_count integer;
  v_day_count integer;
  v_retry_seconds integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_message_id is null
    or p_body is null
    or char_length(v_body) not between 1 and 2000
  then
    raise exception 'Invalid support message' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.admin_users where user_id = v_user_id
  ) then
    raise exception 'Admin identities cannot open student support threads'
      using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('support-chat:' || v_user_id::text, 0)
  );

  select message.*
  into v_existing
  from public.support_messages as message
  join public.support_threads as thread on thread.id = message.thread_id
  where message.id = p_message_id
    and thread.user_id = v_user_id;

  if found then
    if v_existing.sender_role <> 'student'
      or v_existing.sender_user_id <> v_user_id
      or v_existing.body <> v_body
    then
      raise exception 'Message identifier conflict' using errcode = '23505';
    end if;
    return query select 'sent'::text, v_existing.id, 0;
    return;
  end if;

  select
    count(*) filter (where message.created_at >= clock_timestamp() - interval '1 minute')::integer,
    count(*)::integer
  into v_minute_count, v_day_count
  from public.support_messages as message
  where message.sender_user_id = v_user_id
    and message.sender_role = 'student'
    and message.created_at >= clock_timestamp() - interval '24 hours';

  if v_minute_count >= 5 then
    select greatest(
      1,
      ceil(extract(epoch from min(message.created_at) + interval '1 minute' - clock_timestamp()))::integer
    )
    into v_retry_seconds
    from public.support_messages as message
    where message.sender_user_id = v_user_id
      and message.sender_role = 'student'
      and message.created_at >= clock_timestamp() - interval '1 minute';
  elsif v_day_count >= 50 then
    select greatest(
      1,
      ceil(extract(epoch from min(message.created_at) + interval '24 hours' - clock_timestamp()))::integer
    )
    into v_retry_seconds
    from public.support_messages as message
    where message.sender_user_id = v_user_id
      and message.sender_role = 'student'
      and message.created_at >= clock_timestamp() - interval '24 hours';
  end if;

  if v_retry_seconds > 0 then
    return query select 'rate_limited'::text, p_message_id, v_retry_seconds;
    return;
  end if;

  insert into public.support_threads (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  select thread.id
  into strict v_thread_id
  from public.support_threads as thread
  where thread.user_id = v_user_id;

  -- A message id that already exists on another student's thread misses the
  -- owner-scoped lookup above and would otherwise surface the raw primary-key
  -- violation, including the colliding identifier, to the caller. Answer it the
  -- same way a same-user body mismatch is answered.
  begin
    insert into public.support_messages (
      id,
      thread_id,
      sender_role,
      sender_user_id,
      body
    ) values (
      p_message_id,
      v_thread_id,
      'student',
      v_user_id,
      v_body
    );
  exception
    when unique_violation then
      raise exception 'Message identifier conflict' using errcode = '23505';
  end;

  return query select 'sent'::text, p_message_id, 0;
end;
$$;

revoke all on function public.send_support_message(uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function public.send_support_message(uuid, text) to authenticated;

comment on function public.list_support_inbox(integer, integer, boolean) is
  'Service-role-only bounded support inbox. Orders threads awaiting a reply first and oldest wait first, so a limit cannot hide a waiting student, then everything else by most recent activity. Returns total_count and waiting_count for the whole inbox, not the page. Limit is clamped to 1..200.';
comment on index public.support_threads_activity_idx is
  'Serves the non-waiting half of the support inbox ordering. The waiting half is served by support_threads_waiting_idx.';

commit;
