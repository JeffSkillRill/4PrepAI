-- Run only against a disposable local database after migration 20261007120000.
-- Proves consented_at is set from the server clock on insert and never changes on
-- update or upsert, whatever the client sends. Every synthetic row is rolled back.
begin;

insert into auth.users (id, aud, role, email, created_at, updated_at)
values ('00000000-0000-4000-8000-0000000000c3', 'authenticated', 'authenticated', 'consent@rollback.invalid', now(), now());

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000c3', true);
set local role authenticated;

do $$
declare
  v_first timestamptz;
  v_after timestamptz;
begin
  insert into public.student_profiles (user_id, country, field, intake, consented_at)
  values ('00000000-0000-4000-8000-0000000000c3', 'United States', 'Biology', 'Fall 2027', '2099-01-01T00:00:00Z');
  select consented_at into v_first from public.student_profiles where user_id = '00000000-0000-4000-8000-0000000000c3';
  if v_first > clock_timestamp() or v_first < clock_timestamp() - interval '1 minute' then
    raise exception 'insert stored a client-supplied consent time: %', v_first;
  end if;

  update public.student_profiles set consented_at = '1990-01-01T00:00:00Z', field = 'Economics'
  where user_id = '00000000-0000-4000-8000-0000000000c3';
  insert into public.student_profiles (user_id, country, field, intake, consented_at)
  values ('00000000-0000-4000-8000-0000000000c3', 'United States', 'History', 'Fall 2027', '2099-01-01T00:00:00Z')
  on conflict (user_id) do update set field = excluded.field, consented_at = excluded.consented_at;
  select consented_at into v_after from public.student_profiles where user_id = '00000000-0000-4000-8000-0000000000c3';
  if v_after <> v_first then
    raise exception 'consent time changed on update/upsert: % -> %', v_first, v_after;
  end if;
end;
$$;

rollback;
