# 4Prep database state

Last regenerated: 3 August 2026 (Asia/Tashkent).

This document is the launch source of truth for the connected production database. It distinguishes facts observed live from repository definitions and items that still require an authenticated QA environment.

## How this state was observed

No database or external-system write was made while regenerating this document.

| Fact group | Observation method on 3 August 2026 |
|---|---|
| Applied migrations | Read-only `SELECT version FROM supabase_migrations.schema_migrations ORDER BY version` through the linked Supabase Management API. |
| Counselor outcome constraint | Read-only `pg_catalog` query using `pg_get_constraintdef` for `public.counselor_requests.counselor_requests_outcome_check`. |
| Learning tables | Read-only `information_schema.tables` query for `public.learning_%` base tables. |
| Storage buckets | Read-only `storage.buckets` query for ID, visibility, file limit, and MIME allow-list. |
| Row counts | Direct read-only `count(*)` queries against the named public tables and `storage.objects`. |
| Provenance and RLS design | Checked-in forward migrations and client contracts. These definitions are not a substitute for two-account live RLS tests. |
| Function deployment and authenticated behavior | Not changed or re-deployed in this remediation. The 3 August independent launch audit is the latest signed-out function evidence; authenticated behavior remains unverified. |

The linked project metadata identifies project `4PrepAi`, reference `pubhgajlqhdbpwqahtki`. The project URL is `https://pubhgajlqhdbpwqahtki.supabase.co`. The repository and local `.env` identify this as Production. Region, plan, backups, SMTP, and OAuth dashboard settings were not refreshed in this regeneration and must not be inferred from schema queries.

No password, API key, service-role key, or other secret is included here.

## Applied migrations

Production `supabase_migrations.schema_migrations` returned these versions, in order:

1. `202607240001`
2. `202607270002`
3. `202607270003`
4. `202607270004`
5. `202607280005`
6. `202607280006`
7. `202607290007`
8. `202607310008`
9. `202607310009`

These correspond to the nine checked-in files under `app/supabase/migrations/`.

**`202607310008` is applied.** It is not a blocking pre-deploy step. **`202607310009` is also applied.** There are no checked-in pending migrations as of this snapshot.

## Counselor outcome constraint

The live constraint is validated and its exact definition is:

```sql
CHECK (outcome = ANY (ARRAY[
  'started'::text,
  'local_response'::text,
  'cache_hit'::text,
  'live_call'::text,
  'out_of_scope'::text,
  'rate_limited'::text,
  'provider_failure'::text,
  'server_failure'::text
]))
```

Therefore the counselor's `outcome: 'out_of_scope'` update is permitted in Production. Finding F-05's conditional failure is not present in the observed schema.

## Live row-count snapshot

Counts are time-specific and will drift with real use.

| Table | Rows observed 3 August 2026 |
|---|---:|
| `sources` | 50 |
| `universities` | 10 |
| `university_facts` | 110 |
| `programs` | 10 |
| `program_facts` | 0 |
| `requirements` | 60 |
| `scholarships` | 10 |
| `university_scholarships` | 10 |
| `student_profiles` | 1 |
| `saved_plans` | 4 |
| `counselor_strikes` | 4 |
| `counselor_requests` | 28 |
| `counselor_cache` | 8 |
| `learning_tracks` | 1 |
| `learning_modules` | 11 |
| `learning_lessons` | 11 |
| `learning_assignments` | 11 |
| `learning_progress` | 0 |
| `learning_submissions` | 0 |
| `learning_submission_files` | 0 |
| `storage.objects` | 0 |

Private-table counts are recorded only as totals; no student row or uploaded object was read.

## Learning Portal state

The following seven `public` base tables exist live:

- `learning_assignments`
- `learning_lessons`
- `learning_modules`
- `learning_progress`
- `learning_submission_files`
- `learning_submissions`
- `learning_tracks`

The live `learning-submissions` Storage bucket exists. It is private (`public = false`), has a `10,485,760` byte (10 MiB) file limit, and allows the MIME types defined by migration `202607310009` for PDF, DOCX, CSV/Excel, and the supported image formats.

The published curriculum contains one track with eleven modules, eleven lessons, and eleven assignments. There are currently no saved progress rows, submissions, submission-file rows, or Storage objects.

The existence of the tables, policies, and bucket does not prove cross-user isolation. Owner-only table access, owner-only Storage access, upload validation, persistence, and deletion cleanup still require two disposable accounts in a non-production environment.

## Catalogue and provenance contract

Migration `202607280006_us_catalogue.sql` is the checked-in catalogue definition. The live table counts align with its ten-university US catalogue and fifty official source records.

The trust boundary remains:

- Known university facts require a display value and a non-null verified source ID.
- Unknown facts require a null value/source plus a reason and a suggested next action.
- Numeric value, currency, and period metadata may accompany only known records.
- Scholarship identity is sourced; its amount independently follows the known-or-explicitly-unknown rule.
- Client data maps through `DataPoint<T>` and renders known values with source chips or unknown values with reason/action guidance.
- No missing value may be represented as zero, a bare dash, or an invented estimate.

The database holds no acceptance-rate field. A percentage cannot be accepted merely because the same digits occur in a currency or score record.

## Core table groups

### Public catalogue

- `sources`
- `universities`
- `university_facts`
- `programs`
- `program_facts`
- `requirements`
- `scholarships`
- `university_scholarships`
- `verified_universities` security-invoker view

### Private student data

- `student_profiles`
- `saved_plans`
- `learning_progress`
- `learning_submissions`
- `learning_submission_files`
- objects under `learning-submissions/{user_id}/...`

### Counselor operational data

- `counselor_strikes`
- `counselor_requests`
- `counselor_cache`

Migration `202607290007` defines caller rate limiting, cache operations, service-role-only operational access, and seven-day pruning. Migration `202607310008` adds `out_of_scope` to the outcome constraint. The checked-in counselor source keeps anonymous access deliberate through `[functions.counselor] verify_jwt = false`.

The repository now uses `counselor-cache-v2` after tightening figure validation. That source change was not deployed in this remediation, so the production function must not be described as running v2 until a separate deployment is observed.

## Row-level security and deletion evidence

The checked-in migrations define public read access for catalogue/curriculum rows and owner-only access for profiles, saved plans, progress, submissions, submission-file metadata, and Storage objects. Counselor request/cache tables are service-role-only; strike reads are limited to the owning user.

Historical signed-out checks established that anonymous catalogue reads succeed and anonymous private-table reads fail. They do not establish User A versus User B isolation.

The checked-in `delete-account` function authenticates the bearer token, derives the user ID server-side, deletes the exact auth user, removes uploaded objects, and checks for remaining profile, plan, learning, and Storage records. The deployed function version was not compared with the working tree on 3 August. No authenticated destructive test was run against Production.

## Launch implications

- F-03 is closed by direct schema observation: the Learning Portal schema and bucket are live.
- F-05 is closed as a schema-state concern: `202607310008` is applied and `out_of_scope` is permitted.
- Applying migrations `008` or `009` is **not** a current launch action and must not be repeated.
- Production deployment of the counselor validation change and the current `delete-account` source still requires a separate, explicitly authorized deployment step.
- Auth, account deletion, learning persistence, file isolation, and cross-user RLS remain launch blockers until tested with two disposable non-production accounts.

## Needs Jeff

- Provision a separate Supabase QA project and follow `docs/QA_ENVIRONMENT.md`. Do not reuse Production for routine development or QA.
- Provide two disposable confirmed QA accounts and mailboxes for cross-user and deletion tests.
- After code review, deploy the updated counselor function and invalidate/avoid old counselor cache entries through its v2 cache namespace. Re-run the red-team table without weakening figure provenance.
- Compare and deploy the current `delete-account` function only after the QA project proves table, Storage, and deletion cleanup end to end.
- Verify production SMTP, Google OAuth, Auth redirect URLs, privacy contact, plan, backups/PITR, Vercel deployment, and DNS in their respective dashboards.
- Schedule `select * from public.prune_counselor_operational_data();` daily from a trusted scheduler.
- Review real counselor request/cache metrics before changing rate limits.
