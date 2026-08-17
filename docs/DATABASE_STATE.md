# 4Prep database state

Last source update: 17 August 2026 (Asia/Tashkent). Read the 17 August section immediately below first — it supersedes every earlier dated observation in this file where the two disagree. Everything after it is retained as history, not as current state.

This document is the launch source of truth for the connected production database. It distinguishes facts observed live from repository definitions and items that still require an authenticated QA environment.

## 17 August 2026 — current state

Verified by read-only query against both projects on this date, plus two applied migrations described below.

**Migration history is now identical across the repository, QA and Production**, for the first time since 5 August. All three list the same nineteen versions, ending `202608050016`, `202608050017`, `202608100017`. Two things changed today to make that true.

First, `202608100017_academy_handoff.sql` was applied. It had been written on 10 August and committed on 12 August but never applied to any database, so the `leads` table, `submit_lead`, `list_lead_queue` and `prune_resolved_leads` did not exist anywhere while the application code that calls them sat in `main`. It was applied to QA first and exercised there — anonymous submission, idempotent retry, rejection of an invalid `source`, rejection of an over-short `contact`, rejection of an id reused with a different contact, and the service-role queue projection — then applied to Production. The QA test row was deleted afterward; both `public.leads` tables are empty. PostgREST schema cache was reloaded on both projects.

Second, migrations `202608050016_support_inbox_bounds` and `202608050017_scheduled_retention` were **recovered into the repository**. Both had been applied to QA and Production on 5 August, but their source files were never committed and are absent from every branch and from the entire git history — the databases were two migrations ahead of the source. Their recorded statement bundles were exported from `supabase_migrations.schema_migrations` and restored under their exact recorded versions and names, with a provenance header added to each. The restored bodies were checked against live Production objects: the 3-argument `list_support_inbox`, the `support_threads_activity_idx` index, the `pg_cron` extension, and the `prune-expired-support-threads` (03:30) and `refresh-university-search-index` (03:45) cron jobs all match, alongside the pre-existing `prune-counselor-operational-data-daily` (03:17).

`public.leads` posture in Production, verified directly: RLS enabled, zero policies, `select` denied to both `anon` and `authenticated`, `submit_lead` executable by `anon` and `authenticated`, `list_lead_queue` executable by neither. This is the intended deny-all-at-rest design and matches `counselor_requests`, `counselor_cache`, `admin_users`, `admin_audit_log` and `admin_api_requests`. The Supabase security advisor reports `rls_enabled_no_policy` for `leads` and `anon_security_definer_function_executable` for `submit_lead`; both are expected consequences of that design, not findings.

Row counts in Production on this date: `sources` 50, `universities` 10, `programs` 10, `program_facts` 0, `scholarships` 10, `university_scholarships` 10, `requirements` 60, `student_profiles` 3, `saved_plans` 5, `leads` 0.

**Edge Functions were also redeployed today.** They had been behind `main`: Production was running `admin-api` v3 and `delete-account` v8, neither of which contained any Academy-handoff code, so the admin console's "Academy requests" tab had no server endpoint to call. Note for the record that `delete-account` v8 did **not** reference `leads`, so the table's earlier absence never affected account deletion.

Both functions were rebuilt from `main` and deployed to QA first, then to Production with the identical payload:

| Function | QA | Production | Bundle SHA-256 |
|---|---|---|---|
| `delete-account` | v2 | v9 | `535f8211…e337a2e` |
| `admin-api` | v3 | v4 | `790b6948…56f55f0` |

The two environments returned **identical `ezbr_sha256` bundle hashes** for each function, which is the evidence that both carry the same code. `verify_jwt` was preserved: `true` for `delete-account`, `false` for `admin-api` (which authorizes through `authorizeAdmin` instead). `admin-api` was deployed with its four source files under the same paths as the previous version — `app/supabase/functions/admin-api/index.ts` (entrypoint), `app/supabase/functions/admin-api/contract.ts`, `app/supabase/functions/_shared/adminAuth.ts` and `shared/dashboard-stage.ts` — because `index.ts` resolves the shared stage module through `../../../../shared/`. Only `admin-api/index.ts` and `delete-account/index.ts` differ from the previously deployed versions; the other three files were unchanged.

The full operator journey was then exercised against QA at the database level: submit → claim → mark answered → queue projections agree (`new` 0, `answered` 1) → `prune_resolved_leads()` correctly returns 0 for a freshly answered lead. The `leads_claim_bundle` and `leads_answered_bundle` constraints both accept the exact column sets `leadClaimResponse` and `leadResolveResponse` write. The QA test row was deleted; both `leads` tables are empty.

Before the app build was accepted, `npm ci` from the committed lockfile, `npm run build` and `npm run test` were run in a clean Linux sandbox: build exit 0, **29 test files, 278 tests, all passing**.

## 17 August 2026 — requirement benchmarks (Skill Gap Analyzer)

`202608170018_requirement_benchmark.sql` was applied to QA and then Production on the same day, taking both to twenty migrations.

**The problem it fixes.** `requirements.numeric_value` stored a bare number, and three genuinely different things looked identical in it:

| Row | Published text | What the number is |
|---|---|---|
| Alabama IELTS 6.0 | "Minimum IELTS 6.0" | a real admission bar |
| Yale IELTS 7.0 | "typically…; this is not stated as a minimum" | **not** a bar |
| Alabama SAT 1420 | "begins the published $28,000 merit tier" | money, not entry |
| UNK SAT 1030 | "can satisfy English proficiency" | English route, not entry |

Any feature comparing a student's score against `numeric_value` without that distinction would have told a student she fell short of a Yale requirement that Yale does not publish. Parsing the English description at read time was considered and rejected: a researcher phrasing row 11 differently would silently reintroduce the false requirement and no test could catch it.

**What was added.** A `public.requirement_benchmark` enum — `admission_minimum`, `indicative`, `scholarship_threshold`, `english_proficiency_alternative`, `none` — and a `benchmark` column on `public.requirements`. Only `admission_minimum` may be treated as a bar.

The classification is enforced, not merely documented. `requirements_benchmark_matches_number` requires that a row with a number carries a real classification and a row without one carries `none`. Both directions were tested against QA: inserting a numeric requirement without a classification, and inserting a numberless row claiming to be a minimum, were each refused, with the row count unchanged at 60.

All 60 existing rows were classified from their own published text: 18 `admission_minimum`, 7 `indicative`, 4 `scholarship_threshold`, 2 `english_proficiency_alternative`, 29 `none` (no number published). Identical counts on QA and Production.

**Verified against real Production rows.** For a student holding IELTS 6.5, the rules produce five met minimums (Alabama 6.0, Berea 6.0, Illinois Wesleyan 6.5 — exactly meeting counts as met, UNK 5.5, USM 6.0), `not_a_cutoff` for Yale 7.0 and Clark 6.5 with **no shortfall**, and `not_published` for Harvard, HCC and Princeton. Dropping the same student to IELTS 5.0 produces five genuine, specific gaps (+0.5 UNK, +1.0 Alabama, +1.0 Berea, +1.0 USM, +1.5 Illinois Wesleyan) while Yale and Clark still correctly produce none. The tool is useful where a real bar exists and silent where one does not.

## 17 August 2026 — real student scores, and the plan becomes editable

`202608170019_profile_real_scores.sql` was applied to QA and then Production, taking both to twenty-one migrations.

**The problem it fixes.** The intake offered three fixed buttons — "IELTS 6.5", "TOEFL iBT 90", "Duolingo 120" — so every student who chose IELTS was stored as exactly 6.5. The Skill Gap Analyzer was therefore comparing published university minimums against a number the student never gave. Recording an invented score and then telling a student what it means is the same failure as inventing a university figure, and it silently undid the benchmark work done earlier the same day.

`student_profiles` also had no SAT, ACT or GPA columns at all, so those three rows in the analyzer could never say anything.

**What was added.** `admission_test`, `admission_test_score` and `gpa`, with constraints that are enforced rather than documented:

- `student_profiles_admission_test_pair` — a test and its score are set together or not at all; half a pair is a row nothing can compare.
- `student_profiles_admission_test_kind` — `sat` or `act` only. A student never holds both, because a single column holds the choice.
- `student_profiles_admission_test_range` — SAT 400–1600, ACT 1–36, checked against the chosen test.
- `student_profiles_gpa_range` — 0 to 4.0.
- The same pairing, kind and range rules were added for `language_test` / `language_score`, which had previously been unguarded, and validated against the existing rows.

Four bad writes were attempted against QA and all four were refused: a test with no score, an ACT-scale value stored as an SAT, a TOEFL-scale value stored as IELTS, and a GPA above 4.0. Row counts were unchanged.

**Application changes made alongside.** The intake now asks the student to choose a test and type the score they actually received, with an optional SAT-or-ACT step and an optional GPA step. A new `/plan` page lists every saved answer with its own Change control, so a student edits the budget without disturbing their scores; every "Build my plan" entry point in the app now routes to that page once a plan exists, and the wizard is reachable only through an explicit "Rebuild my plan". The Skill Gap Analyzer reports only the tests the student actually holds instead of all six.

Build, lint at zero warnings, **32 test files and 314 tests passing**, and the SSR smoke rendered without a live database.

## 17 August 2026 — award conditions (Scholarship Finder)

`202608170020_award_conditions.sql` was applied to QA and then Production, taking both to twenty-two migrations.

**The problem it fixes.** The ten scholarships in the catalogue carry an amount and a source but **no eligibility criteria of any kind** — no nationality, field, deadline or grade rules. A finder that said "you qualify for these" would have invented eligibility outright.

The only real eligibility signal in the catalogue came from migration 018: four requirement rows classified as `scholarship_threshold`. But those conditions are **compound**, and only half of each was structured:

> Alabama: "SAT 1420 begins the published $28,000 merit tier **with GPA 3.5**"
> USM: "SAT 1420 **with GPA 3.25** can reach the published full-tuition merit tier"

The score was a number in a column; the GPA condition existed only inside the sentence. A finder comparing the score alone would tell a student with SAT 1420 and GPA 2.9 that she reaches a $28,000 award she does not reach.

**What was added.** `public.award_conditions` — one row per published condition, tied to a named scholarship, carrying the measure, the minimum, the university's verbatim sentence and a source. Public read like the rest of the catalogue; writes are migrations and the service role. A unique constraint on `(scholarship_id, kind)` prevents two contradictory bars for the same measure.

Six rows were seeded, covering the two published merit tiers: SAT, ACT and GPA conditions for `alabama-automatic` and `usm-academic`.

**The rule the application enforces.** An award is reported as reachable only when *every* condition it publishes is met. Score conditions are alternatives to one another, since a university accepts the SAT or the ACT; a GPA condition applies in addition. An award with no rows in this table is reported as having no published criteria and is never described as one the student qualifies for.

**Verified against real Production rows.** Three students were run against the live conditions:

| Student | Alabama | USM |
|---|---|---|
| SAT 1500, GPA 3.9 | reachable | reachable |
| SAT 1500, GPA 2.9 | **not** reachable — GPA short | **not** reachable — GPA short |
| SAT 1100, GPA 3.9 | **not** reachable — score short | **not** reachable — score short |

Meeting one half of a compound tier never produces a reachable verdict.

Build, lint at zero warnings, **34 test files and 331 tests passing**, SSR smoke clean.

**Still open.** Neither the app nor the admin console is deployed to a public URL, so no student can reach the handoff yet and it remains unproven in a browser. The 588 kB main bundle warning from the 5 August analysis persists (now 612 kB). Production Auth still has leaked-password protection disabled — a free toggle in the dashboard worth turning on before a real cohort.

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
