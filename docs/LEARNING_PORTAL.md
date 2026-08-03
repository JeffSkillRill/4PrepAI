# 4Prep Learning Portal

## Content model decision

Curriculum content lives in Supabase tables, matching the catalogue’s editable-data architecture and allowing a non-engineer to update lesson fields without rebuilding the application. Stable track, module, lesson, and assignment slugs are the public identifiers, so URLs do not depend on database UUIDs. The tradeoff is more schema, RLS, and eventual authoring-interface work than repository files would require. Switching later would require a versioned file schema, a slug-preserving export/import, and a repository adapter that replaces the content-table reads while leaving progress, submissions, and files in Supabase.

## Scope and deliberate boundaries

This release is a delivery system, not authored curriculum. It contains the ordered module metadata and assignment briefs supplied by the founder, one empty `draft` lesson authoring slot per module, blank templates, progress, sequential unlocks with an explicit jump-ahead escape hatch, and pending homework storage. It contains no grading, validation, rubric execution, AI feedback, counselor calls, payment logic, entitlement logic, or profile write-back.

The brief calls the course “ten modules” but provides rows numbered 0 through 10. The migration preserves all 11 supplied rows exactly rather than dropping one or inventing a reconciliation.

## Schema

Migration `app/supabase/migrations/202607310009_learning_portal.sql` creates:

| Table | Purpose | Access |
|---|---|---|
| `learning_tracks` | Track metadata and stable slug | Anonymous and authenticated read |
| `learning_modules` | Ordered module metadata and stable slug | Anonymous and authenticated read |
| `learning_lessons` | Ordered authoring slots, body, transcript, media/audio references, duration, and `draft`/`published` status | Anonymous and authenticated read |
| `learning_assignments` | One assignment per module, brief, submission type, template reference, and nullable unused `rubric` | Anonymous and authenticated read |
| `learning_submissions` | One owner submission record per assignment, pending state, submission time, and nullable future `feedback_ref` | Owner-only select, insert, update, delete |
| `learning_submission_files` | Versioned object metadata for each submission | Owner-only select, insert, update, delete through the parent submission |
| `learning_progress` | One completion record per owner and lesson | Owner-only select, insert, update, delete |

Every table has RLS enabled. Content grants are read-only; authenticated users receive only the CRUD grants needed for their own rows. `unique (user_id, assignment_id)` prevents duplicate pending submission records, while multiple `learning_submission_files` rows preserve resubmission versions.

A lesson may remain a fully empty draft. Changing a lesson to `published` requires non-empty lesson text, readable transcript, media URL, and audio-only URL, which prevents an inaccessible partial publication.

## Storage

`learning-submissions` is a private Supabase Storage bucket. Objects use:

```text
{user_id}/{assignment_slug}/{unique-prefix}-{sanitized-original-filename}
```

Storage object policies require the first folder and `owner_id` to match `auth.uid()` for select, insert, update, and delete. Both the bucket and object-write policies cap each object at 10 MiB and accept only PDF, DOCX, CSV, XLSX, JPEG, PNG, WEBP, GIF, HEIC, and HEIF MIME types; the object policy also requires a matching filename extension. The database metadata table repeats the MIME and byte-size constraints, and the UI performs the same check early so a student sees the rules before choosing a file.

Assignment templates are static, blank application assets in `app/public/learning-templates/`. The interface exposes a template download only to a signed-in student who has reached the module or accepted the jump-ahead warning; no plan or payment state exists.

## Routes and designed states

The existing hand-rolled route parser now owns these refresh-safe paths:

```text
/learn
/learn/:moduleSlug
/learn/:moduleSlug/:lessonSlug
/learn/:moduleSlug/assignment
```

`pendingAuth.ts` stores the module and lesson slugs with the pending destination, so a signed-out student who chooses the assignment sign-in action returns to that exact assignment. Track, module, lesson, assignment, and submission views use the shared learning skeleton and designed empty, error, and offline states. Draft modules show “Lessons are being written — the assignment is open.” rather than an error.

## Progress, unlocks, and submissions

The first module is available immediately. Each later module becomes available when the previous module has a submission timestamp; the record remains `pending` because review is not part of this release. A locked module can be opened after a clear warning, so course order never becomes a deadline-blocking hard lock.

Lesson completion writes only to `learning_progress`. Uploads use an `XMLHttpRequest` adapter inside the repository so the interface can show real byte progress on a slow connection. A failed upload keeps the selected local file in the control, states that the work was not lost, and offers the same upload action as a retry.

## Account deletion

The updated `delete-account` function:

1. authenticates the caller and derives the user ID from the access token;
2. lists every object under that user’s `learning-submissions` prefix and records every stored path referenced by submission metadata;
3. deletes the auth user, allowing foreign-key cascades to remove `student_profiles`, `saved_plans`, `learning_submissions`, `learning_submission_files`, and `learning_progress`;
4. removes the prefetched objects through the Storage API; and
5. recounts all five row groups and relists the prefix, returning success only when `orphanedRows` and `orphanedObjects` are both zero.

The source change must be deployed only after migration `009` is applied; deploying it against the current live schema would make account deletion depend on tables and a bucket that do not yet exist.

## Profile write-back seam

`src/data/repository.ts` exports:

```ts
type ReviewedLearningSubmissionWriteBackContext = {
  submission: LearningSubmission
  profileTarget: 'student_profiles' | 'saved_plans'
}

type ReviewedLearningSubmissionWriteBack = (
  context: ReviewedLearningSubmissionWriteBackContext,
) => Promise<void>

const reviewedLearningSubmissionWriteBack: ReviewedLearningSubmissionWriteBack | null = null
```

The `null` adapter is intentional. A later reviewed-artifact parser can implement this contract, but uploads in this release never mutate `student_profiles` or `saved_plans`.

## Verification without a live migration

Production currently records migrations only through `202607290007`; `202607310008_counselor_scope_outcome.sql` and `202607310009_learning_portal.sql` remain pending. Because this machine has no Docker, Deno, or Supabase CLI, migration `009` was validated through the connected database in one rollback-only transaction: the migration body was run after `BEGIN`, two synthetic users exercised RLS and storage policies, deletion cascades plus the same privileged object-removal step were checked, and a deliberate final exception rolled back every change.

The observed verification payload was:

```json
{
  "anonymous_content_modules": "11",
  "seed_tracks": "1",
  "seed_modules": "11",
  "seed_lessons": "11",
  "seed_empty_draft_lessons": "11",
  "seed_assignments": "11",
  "seed_unused_rubrics": "11",
  "seed_submission_types": "artifact:5,checklist:2,structured:4",
  "owner_table_select": "1",
  "owner_storage_select": "1",
  "cross_user_table_select": "0",
  "cross_user_table_insert": "denied",
  "cross_user_table_update": "0",
  "cross_user_table_delete": "0",
  "cross_user_storage_read": "0",
  "storage_invalid_mime": "denied",
  "storage_mismatched_extension": "denied",
  "storage_oversize": "denied",
  "delete_profiles": "0",
  "delete_saved_plans": "0",
  "delete_submissions": "0",
  "delete_submission_files": "0",
  "delete_progress": "0",
  "delete_storage_objects": "0"
}
```

The follow-up live query returned:

```json
{
  "learning_tables_absent": true,
  "learning_bucket_absent": true,
  "synthetic_users_absent": true,
  "migration_record_absent": true
}
```

This proves the migration SQL, RLS behavior, storage-object policy predicates, cascades, and expected cleanup result without changing Production. It does not replace an end-to-end Storage API upload or an invocation of the newly deployed `delete-account` function; those checks remain mandatory immediately after migrations `008` and `009` are deliberately applied in order and the function is deployed.

## Human authoring and launch checklist

Before the portal is shown to a real student, a human must supply or approve every item below:

- Each lesson’s final title and ordering if the single module-title authoring slot will be split into multiple lessons.
- Every lesson body. Any application rule, deadline, fee, test requirement, score, cost, aid condition, visa requirement, document amount, processing time, or other changing fact must include a current official source and a human verification date; no such facts are seeded.
- A complete readable transcript for every published lesson.
- A lightweight audio-only file and its URL for every published lesson.
- A provider-agnostic media file or URL for every published lesson after a host is chosen.
- A realistic duration estimate for every published lesson.
- Founder review of the track title and description and of all 11 supplied module summaries and assignment briefs.
- Founder review of every blank template’s headers, field order, terminology, and mobile usability. No example student, university, date, deadline, score, fee, cost, aid amount, or visa figure is present.
- Founder approval of the 10 MiB per-file limit and the accepted MIME list, including whether HEIC/HEIF should remain accepted for the target devices.
- Privacy-policy wording for homework files, resubmission versions, retention, backups, deletion, and who can access the private bucket after review tooling exists.
- A support route for failed uploads and inaccessible media; the UI currently offers retry but no notification email or instructor queue.
- Any language simplification or translation beyond the current English interface.
- A deliberate Production rollout: apply `008`, then `009`; upload/deploy the matching application and `delete-account` function; run real two-account API checks; and record the resulting deployment and migration versions.

No review promise, review timeline, score, grade, certificate, or profile update should be authored until those later systems actually exist.
