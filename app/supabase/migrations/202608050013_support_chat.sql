begin;

-- One private platform-support thread per student. This is deliberately not an
-- admissions-advice channel and contains no attachments or delivery/read state.
create table public.support_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  last_sender_role text,
  constraint support_threads_last_sender_role
    check (last_sender_role is null or last_sender_role in ('student', 'admin')),
  constraint support_threads_last_message_bundle
    check (
      (last_message_at is null and last_sender_role is null)
      or (last_message_at is not null and last_sender_role is not null)
    )
);

create table public.support_messages (
  id uuid primary key,
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  sender_role text not null check (sender_role in ('student', 'admin')),
  -- Kept as an immutable identifier rather than an Auth foreign key: deleting
  -- an operator account must not erase their replies from every student thread.
  -- A student's whole thread still cascades through support_threads.user_id.
  sender_user_id uuid not null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint support_messages_body_length
    check (char_length(btrim(body)) between 1 and 2000)
);

create index support_threads_waiting_idx
  on public.support_threads (last_message_at asc)
  where last_sender_role = 'student';

create index support_messages_thread_time_idx
  on public.support_messages (thread_id, created_at asc, id asc);

create index support_messages_student_rate_idx
  on public.support_messages (sender_user_id, created_at desc)
  where sender_role = 'student';

create function public.update_support_thread_from_message()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.support_threads
  set updated_at = greatest(updated_at, new.created_at),
      last_message_at = greatest(coalesce(last_message_at, new.created_at), new.created_at),
      last_sender_role = case
        when last_message_at is null or new.created_at >= last_message_at
          then new.sender_role
        else last_sender_role
      end
  where id = new.thread_id;
  return new;
end;
$$;

create trigger support_message_updates_thread
after insert on public.support_messages
for each row execute function public.update_support_thread_from_message();

alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

create policy "support thread owner can read"
on public.support_threads
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "support message thread owner can read"
on public.support_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_threads as thread
    where thread.id = thread_id
      and thread.user_id = (select auth.uid())
  )
);

revoke all on public.support_threads from public, anon, authenticated, service_role;
revoke all on public.support_messages from public, anon, authenticated, service_role;

grant select on public.support_threads to authenticated;
grant select on public.support_messages to authenticated;
grant select, insert, update, delete on public.support_threads to service_role;
grant select, insert, delete on public.support_messages to service_role;

-- Keep the operator's 15-second inbox poll bounded: one indexed latest-message
-- lookup per thread instead of downloading the full chat history.
create function public.list_support_inbox()
returns table (
  thread_id uuid,
  user_id uuid,
  last_message_at timestamptz,
  last_sender_role text,
  latest_message_body text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    thread.id,
    thread.user_id,
    thread.last_message_at,
    thread.last_sender_role,
    latest.body
  from public.support_threads as thread
  join lateral (
    select message.body
    from public.support_messages as message
    where message.thread_id = thread.id
    order by message.created_at desc, message.id desc
    limit 1
  ) as latest on true
  where thread.last_message_at is not null;
$$;

revoke all on function public.list_support_inbox()
  from public, anon, authenticated, service_role;
grant execute on function public.list_support_inbox() to service_role;

-- Student writes are atomic, idempotent, owner-derived, and rate-limited in the
-- database. A client-generated message UUID makes an offline retry safe: the
-- same queued message cannot be delivered twice after a dropped response.
create function public.send_support_message(
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

  return query select 'sent'::text, p_message_id, 0;
end;
$$;

revoke all on function public.send_support_message(uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function public.send_support_message(uuid, text) to authenticated;

-- Retention policy: delete a thread twelve months after its latest message (or
-- creation when empty). Account deletion removes it immediately via the user FK.
create function public.prune_expired_support_threads()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.support_threads
  where coalesce(last_message_at, created_at) < clock_timestamp() - interval '12 months';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.prune_expired_support_threads()
  from public, anon, authenticated, service_role;
grant execute on function public.prune_expired_support_threads() to service_role;

comment on table public.support_threads is
  'One private platform-support thread per student; retained for 12 months after its latest message.';
comment on table public.support_messages is
  'Private human support messages with no attachments, read receipts, or automated replies.';
comment on function public.send_support_message(uuid, text) is
  'Owner-derived idempotent student send boundary: five messages/minute and fifty/24 hours.';
comment on function public.list_support_inbox() is
  'Service-role-only bounded support inbox projection with one latest message per thread.';

commit;
