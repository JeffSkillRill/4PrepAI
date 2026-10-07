-- Homework submission becomes one database transaction.
--
-- Before this migration the browser made four sequential calls (submission row,
-- Storage upload, file row, status update) and undid earlier steps by hand when a
-- later one failed (src/data/repository.ts submitLearningAssignment). A closed
-- tab or crash between calls left a pending submission with no file, or a file
-- row whose submission never completed.
--
-- Now the browser uploads the object first, then calls this function, which
-- checks the object exists and belongs to the caller, upserts the submission and
-- records the file row together. Either both rows change or neither does.
-- The only remaining partial state is an uploaded object with no rows, which no
-- screen lists and the browser deletes when this call fails.
--
-- SECURITY INVOKER: the existing owner-only RLS policies on both tables and on
-- storage.objects still decide what the caller may read and write.

create or replace function public.submit_learning_assignment(
  p_assignment_id uuid,
  p_storage_path text,
  p_original_filename text,
  p_mime_type text,
  p_byte_size bigint
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_submission_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from storage.objects object
    where object.bucket_id = 'learning-submissions'
      and object.name = p_storage_path
      and object.owner_id = v_user_id::text
  ) then
    raise exception 'The uploaded homework file was not found' using errcode = 'P0002';
  end if;

  insert into public.learning_submissions (assignment_id, user_id, status, submitted_at, feedback_ref)
  values (p_assignment_id, v_user_id, 'pending', pg_catalog.now(), null)
  on conflict (user_id, assignment_id) do update
  set status = 'pending',
      submitted_at = excluded.submitted_at,
      feedback_ref = null
  returning id into v_submission_id;

  insert into public.learning_submission_files (
    submission_id,
    storage_path,
    original_filename,
    mime_type,
    byte_size
  )
  values (
    v_submission_id,
    p_storage_path,
    p_original_filename,
    pg_catalog.lower(p_mime_type),
    p_byte_size
  );

  return v_submission_id;
end;
$$;

revoke all on function public.submit_learning_assignment(uuid, text, text, text, bigint)
  from public, anon;
grant execute on function public.submit_learning_assignment(uuid, text, text, text, bigint)
  to authenticated;

comment on function public.submit_learning_assignment(uuid, text, text, text, bigint) is
  'Records an already-uploaded homework object: upserts the caller''s submission and inserts its file row in one transaction. Runs as the caller, so owner-only RLS applies.';
