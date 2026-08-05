# 4Prep database state

Last source update: 5 August 2026 (Asia/Tashkent). Live Production observations below remain the 3 August snapshot unless explicitly superseded by a dated 5 August check.

This document is the launch source of truth for the connected production database. It distinguishes facts observed live from repository definitions and items that still require an authenticated QA environment.

## How this state was observed

No database or external-system write was made while regenerating this document.

On 5 August, a read-only CLI check against the currently linked QA database initially listed three remote-only versions (`202608040013`, `202608040014`, and `202608040015`). Their full recorded statement bundles were exported from `supabase_migrations.schema_migrations` and restored locally under their exact recorded names. Normalized SHA-256 comparisons matched for all three. The dry run then listed only support migration `202608050013`; the owner applied it to QA, and a subsequent read-only linked list confirmed matching local and remote versions through `202608050013`. Production was not changed.

Also on 5 August, the Production dashboard showed a restorable physical database backup from `2026-08-04 19:43:44 +0000`; the dashboard warns that database backups do not contain Storage object bytes. A disposable CLI workspace linked read-only to Production confirmed nine applied versions through `202607310009`. Its dry run listed exactly migrations `202608030010`, `202608030011`, `202608030012`, `202608040013`, `202608040014`, `202608040015`, and `202608050013`, with no seeds or roles. The disposable workspace was removed and the canonical checkout was confirmed still linked to QA. No Production migration was applied by these checks.

The Production preflight then found four historical `untraceable_figure` counselor strikes whose requests had already been pruned; every row had a null `user_id`. After bounded inspection, the owner deleted exactly those four irrecoverable orphan rows, consistent with migration `014`'s future `ON DELETE CASCADE` retention behavior, and rechecked that the orphan counts were zero. The owner then applied the seven reviewed migrations. A subsequent read-only linked list confirmed matching local and Production versions through `202608050013`. Production Edge Functions and browser configuration were not yet changed at this checkpoint.

The owner subsequently configured Production `ADMIN_IP_SALT` and local-only admin origins, deployed the functions, and created one manual Production admin grant. A read-only list confirmed active `admin-api` version 1 (`verify_jwt=false`) and `delete-account` version 6 (`verify_jwt=true`), with the same bundle hashes observed in QA. The ignored `app/.env` and `admin/.env` now contain matching Production URL/anon project references; local Production destructive operations remain disabled. The canonical CLI link was returned to QA after deployment. Production browser behavior remains to be exercised.

| Fact group | Observation method on 3 August 2026 |
|---|---|
| Applied migrations | Read-only `SELECT version FROM supabase_migrations.schema_migrations ORDER BY version` through the linked Supabase Management API. |
| Counselor outcome constraint | Read-only `pg_catalog` query using `pg_get_constraintdef` for `public.counselor_requests.counselor_requests_outcome_check`. |
| Learning tables | Read-only `information_schema.tables` query for `public.learning_%` base tables. |
| Storage buckets | Read-only `storage.buckets` query for ID, visibility, file limit, and MIME allow-list. |
| Row counts | Direct read-only `count(*)` queries against the named public tables and `storage.objects`. |
| Provenance and RLS design | Checked-in forward migrations and client contracts. These definitions are not a substitute for two-account live RLS tests. |
| Function deployment and authenticated behavior | Not changed or re-deployed in this remediation. The 3 August independent launch audit is the latest signed-out function evidence; authenticated behavior remains unverified. |

The production observation identified project `4PrepAi`, reference `pubhgajlqhdbpwqahtki`, at `https://pubhgajlqhdbpwqahtki.supabase.co`. The current ignored local app configuration points to the separate QA ref `forrvcsttklmpmfhxums` for Prompt 12 testing, so neither `.env` nor a remembered CLI link may be used to infer the target of a future command. Confirm the exact project ref before every database action. Region, plan, backups, SMTP, and OAuth dashboard settings were not refreshed in this regeneration and must not be inferred from schema queries.

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

These correspond to the first nine checked-in files under `app/supabase/migrations/`.

Production migrations now match the canonical source through `202608050013`. This includes the Learning Portal Storage policy corrections (`010`–`011`), admin control plane (`012`), recovered relational/search integrity work (`202608040013`–`015`), and support chat (`202608050013`). This is schema evidence only; Production functions, admin bootstrap, browser configuration, and live isolation checks remain separate gates.

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

The publicly readable curriculum metadata contains one track with eleven modules, eleven lessons, and eleven assignments; all eleven lesson authoring slots remain `draft`. There are currently no saved progress rows, submissions, submission-file rows, or Storage objects.

The existence of the Production tables, policies, and bucket does not itself prove cross-user isolation. In the separate QA project, migrations `010` and `011` are applied and two disposable accounts completed the full mirrored table/Storage isolation run with distinct real rows and objects. Production still needs a separately authorised migration/deployment and validation step; account deletion cleanup remains pending in QA.

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
- `support_threads` and `support_messages` after migration `013` (source-only; not yet live)

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

In QA on 5 August, the function list confirmed `admin-api` version 2 active with `verify_jwt=false` and `delete-account` version 1 active with `verify_jwt=true` after the owner deployment. This is deployment metadata, not proof of a successful admin reply or account-deletion cascade; those live QA checks remain pending. Production function state was not changed or refreshed.

## Launch implications

- F-03 is closed by direct schema observation: the Learning Portal schema and bucket are live.
- F-05 is closed as a schema-state concern: `202607310008` is applied and `out_of_scope` is permitted.
- Applying migrations `008` or `009` is **not** a current launch action and must not be repeated.
- Migrations `010` and `011` are proved in QA but still require a separately authorised Production review/application.
- Migration `012` was observed working in QA on 3 August and remains unapplied to Production; `docs/ADMIN.md` is its operational handoff.
- Migration `013` is written and intentionally unapplied; `docs/SUPPORT_CHAT.md` is its QA isolation, offline, audit, retention, and deletion handoff.
- QA migration history is reconciled and read-only confirmed through `202608050013`; the support migration remains unapplied to Production.
- Production deployment of the counselor validation change and the current `delete-account` source still requires a separate, explicitly authorized deployment step.
- Cross-user learning-table and Storage isolation is proved in QA. Auth-provider round trips, account deletion cleanup, and Production deployment evidence remain launch blockers.

## Needs Jeff

- Review/apply migration `012` and deploy/live-prove `admin-api` in QA following `docs/ADMIN.md`; do not use Production for routine development or QA.
- Complete the disposable-account deletion check in QA; two-account cross-user table/Storage isolation is already complete.
- After code review, deploy the updated counselor function and invalidate/avoid old counselor cache entries through its v2 cache namespace. Re-run the red-team table without weakening figure provenance.
- Compare and deploy the current `delete-account` function only after the QA project proves table, Storage, and deletion cleanup end to end.
- Verify production SMTP, Google OAuth, Auth redirect URLs, privacy contact, plan, backups/PITR, Vercel deployment, and DNS in their respective dashboards.
- Schedule `select * from public.prune_counselor_operational_data();` daily from a trusted scheduler.
- Review real counselor request/cache metrics before changing rate limits.
