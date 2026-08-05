-- Run only against a disposable local/QA database after migration 013.
-- It proves owner isolation, idempotent sends, the rate limit, service access,
-- and account-deletion cascade. Every synthetic row is rolled back.
begin;

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated', 'support-a@rollback.invalid', now(), now()),
  ('00000000-0000-4000-8000-0000000000b2', 'authenticated', 'authenticated', 'support-b@rollback.invalid', now(), now());

do $$
begin
  if has_table_privilege('anon', 'public.support_threads', 'select')
    or has_table_privilege('anon', 'public.support_messages', 'select')
    or has_table_privilege('authenticated', 'public.support_threads', 'insert')
    or has_table_privilege('authenticated', 'public.support_messages', 'insert')
    or has_function_privilege('authenticated', 'public.list_support_inbox()', 'execute')
  then
    raise exception 'browser roles can bypass the support boundary';
  end if;
  if not has_table_privilege('authenticated', 'public.support_threads', 'select')
    or not has_table_privilege('authenticated', 'public.support_messages', 'select')
    or not has_function_privilege(
      'authenticated',
      'public.send_support_message(uuid,text)',
      'execute'
    )
  then
    raise exception 'student support privileges are incomplete';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
set local role authenticated;

do $$
declare
  v_status text;
  v_count integer;
begin
  select status into v_status
  from public.send_support_message(
    '10000000-0000-4000-8000-000000000001',
    'The dashboard is confusing.'
  );
  if v_status <> 'sent' then raise exception 'student A message was not sent'; end if;

  -- Retrying the same client UUID after a dropped response is idempotent.
  perform public.send_support_message(
    '10000000-0000-4000-8000-000000000001',
    'The dashboard is confusing.'
  );
  select count(*) into v_count from public.support_messages;
  if v_count <> 1 then raise exception 'idempotent retry duplicated a message'; end if;

  begin
    insert into public.support_messages (
      id, thread_id, sender_role, sender_user_id, body
    )
    select
      '10000000-0000-4000-8000-000000000099',
      id,
      'admin',
      '00000000-0000-4000-8000-0000000000a1',
      'forged admin reply'
    from public.support_threads;
    raise exception 'student inserted directly into support messages';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000b2', true);
set local role authenticated;

do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.support_threads;
  if v_count <> 0 then raise exception 'student B enumerated student A thread'; end if;
  select count(*) into v_count from public.support_messages;
  if v_count <> 0 then raise exception 'student B read student A messages'; end if;

  perform public.send_support_message(
    '20000000-0000-4000-8000-000000000001',
    'My own support question.'
  );
  select count(*) into v_count from public.support_threads;
  if v_count <> 1 then raise exception 'student B cannot read own thread'; end if;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
set local role authenticated;

do $$
declare
  v_index integer;
  v_status text;
  v_retry integer;
begin
  for v_index in 2..5 loop
    perform public.send_support_message(
      ('10000000-0000-4000-8000-' || lpad(v_index::text, 12, '0'))::uuid,
      'Rate-limit check ' || v_index::text
    );
  end loop;
  select status, retry_after_seconds into v_status, v_retry
  from public.send_support_message(
    '10000000-0000-4000-8000-000000000006',
    'This should remain queued.'
  );
  if v_status <> 'rate_limited' or v_retry < 1 then
    raise exception 'student rate limit did not return a helpful retry delay';
  end if;
end;
$$;

reset role;

do $$
declare
  v_thread_ids uuid[];
  v_remaining integer;
begin
  select array_agg(id) into v_thread_ids
  from public.support_threads
  where user_id = '00000000-0000-4000-8000-0000000000a1';

  delete from auth.users
  where id = '00000000-0000-4000-8000-0000000000a1';

  select count(*) into v_remaining
  from public.support_threads
  where user_id = '00000000-0000-4000-8000-0000000000a1';
  if v_remaining <> 0 then raise exception 'account deletion left a support thread'; end if;

  select count(*) into v_remaining
  from public.support_messages
  where thread_id = any(v_thread_ids);
  if v_remaining <> 0 then raise exception 'account deletion left support messages'; end if;
end;
$$;

rollback;
