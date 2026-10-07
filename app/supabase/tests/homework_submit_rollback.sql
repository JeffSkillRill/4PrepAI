-- Run only against a disposable local database after migration 20261008090000.
-- Proves submit_learning_assignment records the submission and its file row
-- together, refuses a path with no uploaded object (writing nothing), and refuses
-- another student's object. Every synthetic row is rolled back.
begin;

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-4000-8000-0000000000d1', 'authenticated', 'authenticated', 'homework-a@rollback.invalid', now(), now()),
  ('00000000-0000-4000-8000-0000000000d2', 'authenticated', 'authenticated', 'homework-b@rollback.invalid', now(), now());

-- One object per student, as Storage would record them after an upload.
insert into storage.objects (bucket_id, name, owner_id, metadata)
values
  ('learning-submissions', '00000000-0000-4000-8000-0000000000d1/rollback/a-essay.pdf',
   '00000000-0000-4000-8000-0000000000d1', '{"mimetype":"application/pdf","size":10}'),
  ('learning-submissions', '00000000-0000-4000-8000-0000000000d2/rollback/b-essay.pdf',
   '00000000-0000-4000-8000-0000000000d2', '{"mimetype":"application/pdf","size":10}');

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000d1', true);
set local role authenticated;

do $$
declare
  v_assignment uuid := (select id from public.learning_assignments limit 1);
  v_submission uuid;
  v_files integer;
begin
  if v_assignment is null then
    raise exception 'seed at least one learning assignment before running this proof';
  end if;

  -- A path with no uploaded object is refused and leaves no submission behind.
  begin
    perform public.submit_learning_assignment(
      v_assignment, '00000000-0000-4000-8000-0000000000d1/rollback/missing.pdf',
      'missing.pdf', 'application/pdf', 10);
    raise exception 'a missing object was accepted';
  exception when sqlstate 'P0002' then null;
  end;
  if exists (select 1 from public.learning_submissions where assignment_id = v_assignment) then
    raise exception 'a refused submission left a row behind';
  end if;

  -- Another student's object is invisible to this caller, so it is refused too.
  begin
    perform public.submit_learning_assignment(
      v_assignment, '00000000-0000-4000-8000-0000000000d2/rollback/b-essay.pdf',
      'b-essay.pdf', 'application/pdf', 10);
    raise exception 'another student''s object was accepted';
  exception when sqlstate 'P0002' then null;
  end;

  -- The caller's own object records the submission and its file row together.
  v_submission := public.submit_learning_assignment(
    v_assignment, '00000000-0000-4000-8000-0000000000d1/rollback/a-essay.pdf',
    'a-essay.pdf', 'APPLICATION/PDF', 10);
  select count(*) into v_files from public.learning_submission_files where submission_id = v_submission;
  if v_files <> 1 then
    raise exception 'expected one file row, found %', v_files;
  end if;
  if not exists (
    select 1 from public.learning_submissions
    where id = v_submission and status = 'pending' and submitted_at is not null
  ) then
    raise exception 'the submission was not marked as submitted';
  end if;

  -- A file-row failure (here a duplicate path) rolls back the submission upsert too.
  update public.learning_submissions set feedback_ref = 'kept' where id = v_submission;
  begin
    perform public.submit_learning_assignment(
      v_assignment, '00000000-0000-4000-8000-0000000000d1/rollback/a-essay.pdf',
      'a-essay.pdf', 'application/pdf', 10);
    raise exception 'a duplicate file row was accepted';
  exception when unique_violation then null;
  end;
  if not exists (select 1 from public.learning_submissions where id = v_submission and feedback_ref = 'kept') then
    raise exception 'a failed file insert still changed the submission row';
  end if;
end;
$$;

rollback;
