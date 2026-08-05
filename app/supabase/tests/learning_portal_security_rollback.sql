-- Verification harness for 202607310009_learning_portal.sql and
-- migrations 202608030010 and 202608030011.
--
-- Run this immediately after the migration body inside one transaction, with
-- the migration's own BEGIN/COMMIT lines removed. The final deliberate
-- exception reports the observations and rolls back the migration, synthetic
-- users, bucket, objects, and rows.

create temporary table learning_verification (
  check_name text primary key,
  observed text not null
);
grant select, insert, update, delete on learning_verification to anon, authenticated;

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated', 'portal-a@rollback.invalid', now(), now()),
  ('00000000-0000-4000-8000-0000000000b2', 'authenticated', 'authenticated', 'portal-b@rollback.invalid', now(), now());

set local role anon;
insert into learning_verification
select 'anonymous_content_modules', count(*)::text
from learning_modules;
reset role;

insert into learning_verification
values
  ('seed_tracks', (select count(*)::text from learning_tracks)),
  ('seed_modules', (select count(*)::text from learning_modules)),
  ('seed_lessons', (select count(*)::text from learning_lessons)),
  (
    'seed_empty_draft_lessons',
    (
      select count(*)::text
      from learning_lessons
      where status = 'draft'
        and body is null
        and transcript is null
        and media_url is null
        and audio_url is null
        and duration_minutes is null
    )
  ),
  ('seed_assignments', (select count(*)::text from learning_assignments)),
  (
    'seed_unused_rubrics',
    (select count(*)::text from learning_assignments where rubric is null)
  ),
  (
    'seed_submission_types',
    (
      select string_agg(submission_type || ':' || amount, ',' order by submission_type)
      from (
        select submission_type, count(*)::text as amount
        from learning_assignments
        group by submission_type
      ) counts
    )
  );

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-0000000000a1',
  true
);
set local role authenticated;

insert into learning_submissions (
  id,
  assignment_id,
  user_id,
  status,
  submitted_at
)
select
  '10000000-0000-4000-8000-000000000001',
  id,
  '00000000-0000-4000-8000-0000000000a1',
  'pending',
  now()
from learning_assignments
where slug = 'is-this-possible';

insert into learning_progress (user_id, lesson_id)
select
  '00000000-0000-4000-8000-0000000000a1',
  lesson.id
from learning_lessons lesson
join learning_modules module on module.id = lesson.module_id
where module.slug = 'is-this-possible';

insert into storage.objects (bucket_id, name, owner_id, metadata)
values (
  'learning-submissions',
  '00000000-0000-4000-8000-0000000000a1/is-this-possible/homework.pdf',
  '00000000-0000-4000-8000-0000000000a1',
  '{"mimetype":"application/pdf","contentLength":128}'::jsonb
);

insert into learning_submission_files (
  submission_id,
  storage_path,
  original_filename,
  mime_type,
  byte_size
)
values (
  '10000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-0000000000a1/is-this-possible/homework.pdf',
  'homework.pdf',
  'application/pdf',
  128
);

insert into learning_verification
select 'owner_table_select', count(*)::text
from learning_submissions
where user_id = '00000000-0000-4000-8000-0000000000a1';

insert into learning_verification
select 'owner_storage_select', count(*)::text
from storage.objects
where name = '00000000-0000-4000-8000-0000000000a1/is-this-possible/homework.pdf';

with changed as (
  update storage.objects
  set metadata = '{"mimetype":"application/pdf","contentLength":128}'::jsonb
  where name = '00000000-0000-4000-8000-0000000000a1/is-this-possible/homework.pdf'
  returning id
)
insert into learning_verification
select 'owner_storage_update', count(*)::text
from changed;

reset role;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-0000000000b2',
  true
);
set local role authenticated;

insert into learning_verification
select 'cross_user_table_select', count(*)::text
from learning_submissions
where user_id = '00000000-0000-4000-8000-0000000000a1';

with changed as (
  update learning_submissions
  set status = 'submitted'
  where user_id = '00000000-0000-4000-8000-0000000000a1'
  returning id
)
insert into learning_verification
select 'cross_user_table_update', count(*)::text
from changed;

with removed as (
  delete from learning_submissions
  where user_id = '00000000-0000-4000-8000-0000000000a1'
  returning id
)
insert into learning_verification
select 'cross_user_table_delete', count(*)::text
from removed;

insert into learning_verification
select 'cross_user_storage_read', count(*)::text
from storage.objects
where name = '00000000-0000-4000-8000-0000000000a1/is-this-possible/homework.pdf';

with changed as (
  update storage.objects
  set metadata = '{"mimetype":"application/pdf","contentLength":128}'::jsonb
  where name = '00000000-0000-4000-8000-0000000000a1/is-this-possible/homework.pdf'
  returning id
)
insert into learning_verification
select 'cross_user_storage_update', count(*)::text
from changed;

do $verification$
begin
  begin
    insert into learning_submissions (assignment_id, user_id)
    select id, '00000000-0000-4000-8000-0000000000a1'
    from learning_assignments
    where slug = 'building-your-list';
    raise exception 'cross-user insert unexpectedly succeeded';
  exception when insufficient_privilege then
    insert into learning_verification
    values ('cross_user_table_insert', 'denied');
  end;

  begin
    insert into storage.objects (bucket_id, name, owner_id, metadata)
    values (
      'learning-submissions',
      '00000000-0000-4000-8000-0000000000b2/is-this-possible/bad.exe',
      '00000000-0000-4000-8000-0000000000b2',
      '{"mimetype":"application/octet-stream","contentLength":128}'::jsonb
    );
    raise exception 'invalid MIME unexpectedly succeeded';
  exception when insufficient_privilege then
    insert into learning_verification
    values ('storage_invalid_mime', 'denied');
  end;

  begin
    insert into storage.objects (bucket_id, name, owner_id, metadata)
    values (
      'learning-submissions',
      '00000000-0000-4000-8000-0000000000b2/is-this-possible/mismatch.exe',
      '00000000-0000-4000-8000-0000000000b2',
      '{"mimetype":"application/pdf","contentLength":128}'::jsonb
    );
    raise exception 'mismatched extension unexpectedly succeeded';
  exception when insufficient_privilege then
    insert into learning_verification
    values ('storage_mismatched_extension', 'denied');
  end;

  begin
    insert into storage.objects (bucket_id, name, owner_id, metadata)
    values (
      'learning-submissions',
      '00000000-0000-4000-8000-0000000000b2/is-this-possible/empty.pdf',
      '00000000-0000-4000-8000-0000000000b2',
      '{"mimetype":"application/pdf","contentLength":0}'::jsonb
    );
    raise exception 'empty object unexpectedly succeeded';
  exception when insufficient_privilege then
    insert into learning_verification
    values ('storage_empty', 'denied');
  end;

  begin
    insert into storage.objects (bucket_id, name, owner_id, metadata)
    values (
      'learning-submissions',
      '00000000-0000-4000-8000-0000000000b2/is-this-possible/too-large.pdf',
      '00000000-0000-4000-8000-0000000000b2',
      '{"mimetype":"application/pdf","contentLength":10485761}'::jsonb
    );
    raise exception 'oversized object unexpectedly succeeded';
  exception when insufficient_privilege then
    insert into learning_verification
    values ('storage_oversize', 'denied');
  end;
end
$verification$;

reset role;

-- This mirrors delete-account's order: auth deletion first (row cascades),
-- followed by privileged object removal through the Storage API. Direct SQL
-- deletion is protected in Production, so replication-role bypass is confined
-- to this rollback-only transaction to model the API's privileged removal.
delete from auth.users
where id = '00000000-0000-4000-8000-0000000000a1';

set local session_replication_role = replica;
delete from storage.objects
where bucket_id = 'learning-submissions'
  and (storage.foldername(name))[1] =
    '00000000-0000-4000-8000-0000000000a1';
set local session_replication_role = origin;

insert into learning_verification
values
  (
    'delete_profiles',
    (
      select count(*)::text
      from student_profiles
      where user_id = '00000000-0000-4000-8000-0000000000a1'
    )
  ),
  (
    'delete_saved_plans',
    (
      select count(*)::text
      from saved_plans
      where user_id = '00000000-0000-4000-8000-0000000000a1'
    )
  ),
  (
    'delete_submissions',
    (
      select count(*)::text
      from learning_submissions
      where user_id = '00000000-0000-4000-8000-0000000000a1'
    )
  ),
  (
    'delete_progress',
    (
      select count(*)::text
      from learning_progress
      where user_id = '00000000-0000-4000-8000-0000000000a1'
    )
  ),
  (
    'delete_submission_files',
    (
      select count(*)::text
      from learning_submission_files
      where submission_id = '10000000-0000-4000-8000-000000000001'
    )
  ),
  (
    'delete_storage_objects',
    (
      select count(*)::text
      from storage.objects
      where bucket_id = 'learning-submissions'
        and (storage.foldername(name))[1] =
          '00000000-0000-4000-8000-0000000000a1'
    )
  );

do $verification$
declare
  payload jsonb;
begin
  select jsonb_object_agg(check_name, observed order by check_name)
  into payload
  from learning_verification;

  raise exception using
    errcode = 'P0001',
    message = 'LEARNING_PORTAL_ROLLBACK_VERIFICATION ' || payload::text;
end
$verification$;
