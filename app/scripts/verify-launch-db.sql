-- Run only against the disposable fixture, after the launch migration. Rolls back all records.
begin;
do $$
begin
  if has_function_privilege('anon','public.submit_lead_internal(uuid,text,text,text,text,text)','execute') then raise exception 'Anon bypasses edge rate protection'; end if;
  if has_function_privilege('authenticated','public.submit_lead_for_caller(uuid,text,text,text,text,uuid,text,text)','execute') then raise exception 'Student impersonates a caller'; end if;
  if has_table_privilege('anon','public.operational_events','select') then raise exception 'Public telemetry access'; end if;
  if has_function_privilege('authenticated','public.launch_ops_snapshot()','execute') then raise exception 'Public operations access'; end if;
end;
$$;
do $$
declare r record;
begin
  for i in 1..3 loop
    select * into r from public.submit_lead_for_caller(gen_random_uuid(),'Fixture student','test@example.invalid','gap',repeat('a',64));
    if r.status <> 'submitted' then raise exception 'Valid lead rejected'; end if;
  end loop;
  select * into r from public.submit_lead_for_caller(gen_random_uuid(),'Fixture student','test@example.invalid','gap',repeat('a',64));
  if r.status <> 'rate_limited' then raise exception 'Caller cap failed'; end if;
  select * into r from public.submit_lead_for_caller(gen_random_uuid(),'Other fixture','other@example.invalid','gap',repeat('b',64));
  if r.status <> 'submitted' then raise exception 'One caller blocks another'; end if;
  select * into r from public.submit_lead_for_caller((select lead_id from public.lead_caller_requests where caller_key = repeat('a',64) limit 1),'Fixture student','test@example.invalid','gap',repeat('a',64));
  if r.status <> 'submitted' then raise exception 'Idempotent retry was rate-limited'; end if;
end;
$$;

insert into auth.users values ('11111111-1111-1111-1111-111111111111');
insert into public.account_deletion_jobs(user_id) values ('11111111-1111-1111-1111-111111111111');
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',true);
set local role authenticated;
do $$begin
  begin
    insert into storage.objects(bucket_id,name) values('avatars','11111111-1111-1111-1111-111111111111/late.jpg');
    raise exception 'Upload while deleting was allowed';
  exception when insufficient_privilege then null; end;
end$$;
reset role;
update public.account_deletion_jobs set stage = 'finished', finished_at = now();
set local role authenticated;
insert into storage.objects(bucket_id,name) values('avatars','11111111-1111-1111-1111-111111111111/test.jpg');
reset role;

insert into public.learning_lessons(id,module_id,status) values('22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333','draft');
insert into public.learning_assignments(id,module_id) values('44444444-4444-4444-4444-444444444444','33333333-3333-3333-3333-333333333333');
set local role authenticated;
do $$begin
  begin
    insert into public.learning_progress(lesson_id) values('22222222-2222-2222-2222-222222222222');
    raise exception 'Draft lesson could be completed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.learning_submissions(assignment_id) values('44444444-4444-4444-4444-444444444444');
    raise exception 'Draft module accepted homework';
  exception when insufficient_privilege then null; end;
end$$;
reset role;
update public.learning_lessons set status = 'published';
set local role authenticated;
insert into public.learning_progress(lesson_id) values('22222222-2222-2222-2222-222222222222');
insert into public.learning_submissions(assignment_id) values('44444444-4444-4444-4444-444444444444');
reset role;
do $$begin
  for i in 1..35 loop perform public.record_operational_event('app_crash',repeat('c',64)); end loop;
  if (select count(*) from public.operational_events) <> 30 then raise exception 'Telemetry limiter failed'; end if;
  if public.launch_ops_snapshot()->>'crashes_24h' <> '30' then raise exception 'Operations snapshot failed'; end if;
end$$;
rollback;
select 'Launch database guard checks passed' as result;
