-- Indexes every previously unindexed foreign key in the catalogue, learning,
-- and private-student groups. Purely additive: creates no table, drops nothing,
-- changes no policy, grant, constraint, or row, and alters no query result.
-- See app/supabase/migrations/202608040013_relational_indexes.sql for the full
-- rationale per index.

create index universities_source_id_idx
  on public.universities (source_id);

create index university_facts_source_id_idx
  on public.university_facts (source_id);

create index programs_source_id_idx
  on public.programs (source_id);

create index program_facts_source_id_idx
  on public.program_facts (source_id);

create index requirements_source_id_idx
  on public.requirements (source_id);

create index scholarships_source_id_idx
  on public.scholarships (source_id);

create index scholarships_amount_source_id_idx
  on public.scholarships (amount_source_id);

create index university_scholarships_source_id_idx
  on public.university_scholarships (source_id);

create index programs_university_id_idx
  on public.programs (university_id);

create index university_scholarships_scholarship_id_idx
  on public.university_scholarships (scholarship_id);

create index saved_plans_university_id_idx
  on public.saved_plans (university_id);

-- The `strike owner can read` RLS policy filters on exactly this column.
create index counselor_strikes_user_id_idx
  on public.counselor_strikes (user_id)
  where user_id is not null;

create index counselor_requests_user_id_idx
  on public.counselor_requests (user_id)
  where user_id is not null;

create index learning_submissions_assignment_id_idx
  on public.learning_submissions (assignment_id);

-- The four `learning_submission_files` owner policies all resolve ownership
-- through this column. It is the single highest-value index in this migration.
create index learning_submission_files_submission_id_idx
  on public.learning_submission_files (submission_id);

create index learning_progress_lesson_id_idx
  on public.learning_progress (lesson_id);

create index admin_audit_log_actor_grant_idx
  on public.admin_audit_log (actor_admin_grant_id, actor_user_id)
  where actor_admin_grant_id is not null;

comment on index public.counselor_strikes_user_id_idx is
  'Serves the strike owner RLS policy filter. Partial because service-role writes may record a null user for anonymous callers.';
comment on index public.learning_submission_files_submission_id_idx is
  'Serves the owner-only submission-file RLS policies, which resolve ownership through learning_submissions.';
comment on index public.programs_university_id_idx is
  'Serves the per-university program read on every catalogue card and the university delete cascade.';
