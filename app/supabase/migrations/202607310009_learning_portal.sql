begin;

create table public.learning_tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint learning_tracks_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint learning_tracks_sort_order_non_negative
    check (sort_order >= 0)
);

create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.learning_tracks(id) on delete cascade,
  module_number integer not null,
  slug text not null,
  title text not null,
  summary text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (track_id, module_number),
  unique (track_id, slug),
  constraint learning_modules_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint learning_modules_number_non_negative
    check (module_number >= 0),
  constraint learning_modules_sort_order_non_negative
    check (sort_order >= 0)
);

create table public.learning_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  sort_order integer not null,
  duration_minutes integer,
  body text,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  transcript text,
  media_url text,
  audio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug),
  constraint learning_lessons_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint learning_lessons_sort_order_non_negative
    check (sort_order >= 0),
  constraint learning_lessons_duration_positive
    check (duration_minutes is null or duration_minutes > 0),
  constraint published_learning_lesson_has_text_access
    check (
      status = 'draft'
      or (
        body is not null
        and char_length(btrim(body)) > 0
        and transcript is not null
        and char_length(btrim(transcript)) > 0
        and media_url is not null
        and char_length(btrim(media_url)) > 0
        and audio_url is not null
        and char_length(btrim(audio_url)) > 0
      )
    )
);

create table public.learning_assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null unique references public.learning_modules(id) on delete cascade,
  slug text not null unique,
  title text not null,
  brief text not null,
  submission_type text not null
    check (submission_type in ('structured', 'checklist', 'artifact')),
  template_ref text not null,
  rubric jsonb,
  created_at timestamptz not null default now(),
  constraint learning_assignments_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.learning_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.learning_assignments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'reviewed')),
  submitted_at timestamptz,
  feedback_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, assignment_id)
);

create table public.learning_submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.learning_submissions(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  byte_size bigint not null,
  created_at timestamptz not null default now(),
  constraint learning_submission_files_path_nonempty
    check (char_length(btrim(storage_path)) > 0),
  constraint learning_submission_files_filename_nonempty
    check (char_length(btrim(original_filename)) > 0),
  constraint learning_submission_files_size_positive
    check (byte_size > 0 and byte_size <= 10485760),
  constraint learning_submission_files_mime_allowlist
    check (mime_type in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif'
    ))
);

create table public.learning_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create trigger learning_lessons_set_updated_at
before update on public.learning_lessons
for each row execute function public.set_updated_at();

create trigger learning_submissions_set_updated_at
before update on public.learning_submissions
for each row execute function public.set_updated_at();

alter table public.learning_tracks enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.learning_assignments enable row level security;
alter table public.learning_submissions enable row level security;
alter table public.learning_submission_files enable row level security;
alter table public.learning_progress enable row level security;

create policy "read learning tracks"
on public.learning_tracks
for select
to anon, authenticated
using (true);

create policy "read learning modules"
on public.learning_modules
for select
to anon, authenticated
using (true);

create policy "read learning lessons"
on public.learning_lessons
for select
to anon, authenticated
using (true);

create policy "read learning assignments"
on public.learning_assignments
for select
to anon, authenticated
using (true);

create policy "learning submission owner can read"
on public.learning_submissions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "learning submission owner can insert"
on public.learning_submissions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "learning submission owner can update"
on public.learning_submissions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "learning submission owner can delete"
on public.learning_submissions
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "learning submission file owner can read"
on public.learning_submission_files
for select
to authenticated
using (
  exists (
    select 1
    from public.learning_submissions submission
    where submission.id = submission_id
      and submission.user_id = (select auth.uid())
  )
);

create policy "learning submission file owner can insert"
on public.learning_submission_files
for insert
to authenticated
with check (
  exists (
    select 1
    from public.learning_submissions submission
    where submission.id = submission_id
      and submission.user_id = (select auth.uid())
  )
);

create policy "learning submission file owner can update"
on public.learning_submission_files
for update
to authenticated
using (
  exists (
    select 1
    from public.learning_submissions submission
    where submission.id = submission_id
      and submission.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.learning_submissions submission
    where submission.id = submission_id
      and submission.user_id = (select auth.uid())
  )
);

create policy "learning submission file owner can delete"
on public.learning_submission_files
for delete
to authenticated
using (
  exists (
    select 1
    from public.learning_submissions submission
    where submission.id = submission_id
      and submission.user_id = (select auth.uid())
  )
);

create policy "learning progress owner can read"
on public.learning_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "learning progress owner can insert"
on public.learning_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "learning progress owner can update"
on public.learning_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "learning progress owner can delete"
on public.learning_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.learning_tracks from public, anon, authenticated;
revoke all on public.learning_modules from public, anon, authenticated;
revoke all on public.learning_lessons from public, anon, authenticated;
revoke all on public.learning_assignments from public, anon, authenticated;
revoke all on public.learning_submissions from public, anon, authenticated;
revoke all on public.learning_submission_files from public, anon, authenticated;
revoke all on public.learning_progress from public, anon, authenticated;

grant select on public.learning_tracks to anon, authenticated;
grant select on public.learning_modules to anon, authenticated;
grant select on public.learning_lessons to anon, authenticated;
grant select on public.learning_assignments to anon, authenticated;
grant select, insert, update, delete on public.learning_submissions to authenticated;
grant select, insert, update, delete on public.learning_submission_files to authenticated;
grant select, insert, update, delete on public.learning_progress to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'learning-submissions',
  'learning-submissions',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "learning submission object owner can read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'learning-submissions'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
);

create policy "learning submission object owner can insert allowed file"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'learning-submissions'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
  and lower(coalesce(metadata->>'mimetype', '')) in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  )
  and case lower(coalesce(metadata->>'mimetype', ''))
    when 'application/pdf' then lower(storage.extension(name)) = 'pdf'
    when 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      then lower(storage.extension(name)) = 'docx'
    when 'text/csv' then lower(storage.extension(name)) = 'csv'
    when 'application/vnd.ms-excel' then lower(storage.extension(name)) = 'csv'
    when 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      then lower(storage.extension(name)) = 'xlsx'
    when 'image/jpeg' then lower(storage.extension(name)) in ('jpg', 'jpeg')
    when 'image/png' then lower(storage.extension(name)) = 'png'
    when 'image/webp' then lower(storage.extension(name)) = 'webp'
    when 'image/gif' then lower(storage.extension(name)) = 'gif'
    when 'image/heic' then lower(storage.extension(name)) = 'heic'
    when 'image/heif' then lower(storage.extension(name)) = 'heif'
    else false
  end
  and (metadata->>'size')::bigint between 1 and 10485760
);

create policy "learning submission object owner can update allowed file"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'learning-submissions'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'learning-submissions'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
  and lower(coalesce(metadata->>'mimetype', '')) in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  )
  and case lower(coalesce(metadata->>'mimetype', ''))
    when 'application/pdf' then lower(storage.extension(name)) = 'pdf'
    when 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      then lower(storage.extension(name)) = 'docx'
    when 'text/csv' then lower(storage.extension(name)) = 'csv'
    when 'application/vnd.ms-excel' then lower(storage.extension(name)) = 'csv'
    when 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      then lower(storage.extension(name)) = 'xlsx'
    when 'image/jpeg' then lower(storage.extension(name)) in ('jpg', 'jpeg')
    when 'image/png' then lower(storage.extension(name)) = 'png'
    when 'image/webp' then lower(storage.extension(name)) = 'webp'
    when 'image/gif' then lower(storage.extension(name)) = 'gif'
    when 'image/heic' then lower(storage.extension(name)) = 'heic'
    when 'image/heif' then lower(storage.extension(name)) = 'heif'
    else false
  end
  and (metadata->>'size')::bigint between 1 and 10485760
);

create policy "learning submission object owner can delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'learning-submissions'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
);

with inserted_track as (
  insert into public.learning_tracks (slug, title, description, sort_order)
  values (
    'application-year',
    'Application year',
    'The 4Prep learning track for the US university application process.',
    0
  )
  returning id
)
insert into public.learning_modules (
  track_id,
  module_number,
  slug,
  title,
  summary,
  sort_order
)
select inserted_track.id, seed.module_number, seed.slug, seed.title, seed.summary, seed.sort_order
from inserted_track
cross join (
  values
    (0, 'is-this-possible', 'Is this possible for me?', 'How US pricing really works: sticker price versus net price, why aid exists, what the year looks like month by month', 0),
    (1, 'building-your-list', 'Building your list', 'Types of institution, need-blind versus need-aware for internationals, reach/match/likely, the community-college transfer path', 1),
    (2, 'english-tests', 'English tests', 'Which English tests exist, who accepts what, when to sit one, how to prepare', 2),
    (3, 'grades-and-transcripts', 'Grades & transcripts', 'Translating your national system into something a US reader understands, credential evaluation, course rigor, predicted grades', 3),
    (4, 'activities', 'Activities', 'How US admissions reads extracurriculars, why depth beats breadth, describing work and family responsibility honestly', 4),
    (5, 'the-main-essay', 'The main essay', 'What a personal statement is and is not, finding a real subject, the failure modes international applicants fall into most', 5),
    (6, 'supplements', 'Supplements & “why us”', 'Researching a specific university properly, writing short answers, reusing material without sounding recycled', 6),
    (7, 'recommendations', 'Recommendations', 'Who to ask and how, what a US reader expects from a teacher letter, what to do when your school has no counselor', 7),
    (8, 'money', 'Money', 'Institutional aid for internationals, merit scholarships, external scholarships, and the financial certification you must document', 8),
    (9, 'submitting', 'Submitting', 'Application platform mechanics, early versus regular rounds, fee waivers, portals, what happens after you press send', 9),
    (10, 'after-the-decision', 'After the decision', 'Comparing offers on net cost, asking for a review of aid, the enrollment document, visa application and interview, pre-departure', 10)
) as seed(module_number, slug, title, summary, sort_order);

insert into public.learning_lessons (
  module_id,
  slug,
  title,
  sort_order,
  duration_minutes,
  body,
  status,
  transcript,
  media_url,
  audio_url
)
select
  module.id,
  module.slug,
  module.title,
  0,
  null,
  null,
  'draft',
  null,
  null,
  null
from public.learning_modules module
join public.learning_tracks track on track.id = module.track_id
where track.slug = 'application-year';

insert into public.learning_assignments (
  module_id,
  slug,
  title,
  brief,
  submission_type,
  template_ref,
  rubric
)
select
  module.id,
  module.slug,
  module.title,
  seed.brief,
  seed.submission_type,
  seed.template_ref,
  null
from public.learning_modules module
join public.learning_tracks track on track.id = module.track_id
join (
  values
    ('is-this-possible', 'Timeline worksheet: your dates, working backward from application deadlines', 'structured', '/learning-templates/is-this-possible.xlsx'),
    ('building-your-list', 'A shortlist with a net-cost column and a reason for each entry', 'structured', '/learning-templates/building-your-list.xlsx'),
    ('english-tests', 'Test plan: which test, which date, target score, registration confirmed', 'checklist', '/learning-templates/english-tests.xlsx'),
    ('grades-and-transcripts', 'Transcript pack: translated grades, school profile, subject list', 'artifact', '/learning-templates/grades-and-transcripts.docx'),
    ('activities', 'Activity list in the standard format, ranked by significance', 'artifact', '/learning-templates/activities.docx'),
    ('the-main-essay', 'Full first draft', 'artifact', '/learning-templates/the-main-essay.docx'),
    ('supplements', 'Two supplement drafts for two shortlist universities', 'artifact', '/learning-templates/supplements.docx'),
    ('recommendations', 'Recommender plan plus the brief you will give each one', 'checklist', '/learning-templates/recommendations.xlsx'),
    ('money', 'Family budget sheet plus an aid-form checklist per university', 'structured', '/learning-templates/money.xlsx'),
    ('submitting', 'Submission tracker: every university, round, deadline, status', 'structured', '/learning-templates/submitting.xlsx'),
    ('after-the-decision', 'Offer comparison and decision memo', 'artifact', '/learning-templates/after-the-decision.docx')
) as seed(slug, brief, submission_type, template_ref)
  on seed.slug = module.slug
where track.slug = 'application-year';

comment on table public.learning_tracks is
  'Public learning-portal track metadata. Curriculum content is stored in Supabase so it can be edited without an application deploy.';
comment on table public.learning_modules is
  'Public ordered curriculum modules addressed by stable slugs.';
comment on table public.learning_lessons is
  'Public lesson authoring records. Draft rows may intentionally have empty bodies, transcripts, and media references.';
comment on table public.learning_assignments is
  'Public assignment briefs and template references. Rubrics are reserved for later work and remain null in this release.';
comment on table public.learning_submissions is
  'Private owner-only submission state. One row per user and assignment; file uploads may add versions without creating duplicate pending submissions.';
comment on table public.learning_submission_files is
  'Private owner-only metadata for objects stored in the learning-submissions bucket.';
comment on table public.learning_progress is
  'Private owner-only lesson completion records.';

commit;
