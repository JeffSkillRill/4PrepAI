# 4Prep database state

Last regenerated: 28 July 2026 (Asia/Tashkent), after the US admissions schema and US-only catalogue migrations were applied and verified on Production.

This document describes the connected live database. The forward-only SQL files in `app/supabase/migrations/` are the source of truth.

## Connection and project

- Project name: `4PrepAi`
- Project reference: `pubhgajlqhdbpwqahtki`
- Branch/environment: `main` — Production
- Hosting: Supabase Cloud, Northeast Asia (Tokyo), AWS `ap-northeast-1`
- Compute: Nano
- Organization plan shown in the dashboard: Free
- Project URL: `https://pubhgajlqhdbpwqahtki.supabase.co`
- Secret names used by the system: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PPLX_API_KEY`, `PPLX_MODEL`
- No password, API key, service-role key, or other secret is included here.

## Live row counts

| Table | Rows |
|---|---:|
| `sources` | 50 |
| `universities` | 10 |
| `university_facts` | 110 |
| `programs` | 10 |
| `program_facts` | 0 |
| `requirements` | 60 |
| `scholarships` | 10 |
| `university_scholarships` | 10 |
| `student_profiles` | 0 |
| `saved_plans` | 0 |
| `counselor_strikes` | 0 |

The live country query returned 10 `United States` rows and zero rows whose country differs from `United States`. All former Central Asian and European universities, their dependent catalogue rows, and their now-orphaned sources were deleted by the forward migration.

Deleting the former universities cascades to `saved_plans`. The pre-migration and post-migration Production checks both returned zero saved plans, so no user plan was lost during this cutover.

## US catalogue and evidence coverage

“Sourced” and “unknown” cover the 17 admissions records stored for each university: 11 university facts and six requirements. Every known record has a non-null `source_id`; every unknown has a non-null reason and suggested next action. Scholarship amount unknowns are audited separately below because scholarship amounts use their own known-or-unknown constraint.

| University | Tier | Sourced | Explicit unknowns |
|---|---|---:|---:|
| Harvard University | Need-blind / full need | 15 | 2 |
| Yale University | Need-blind / full need | 13 | 4 |
| Princeton University | Need-blind / full need | 15 | 2 |
| Berea College | Private, unusually deep international funding | 12 | 5 |
| Illinois Wesleyan University | Private, published international merit | 14 | 3 |
| Clark University | Private, published international merit | 15 | 2 |
| University of Southern Mississippi | Public, published international merit | 17 | 0 |
| University of Alabama | Public, published international merit | 16 | 1 |
| University of Nebraska at Kearney | Public, published international merit | 16 | 1 |
| Houston City College | Community college / 2+2 transfer | 12 | 5 |

All 50 source rows are `verified`, use official university URLs, and have retrieval date `2026-07-28`. Every monetary figure in the US catalogue uses `USD`; no mixed-currency US record exists.

### Why this mix

- Harvard, Yale, and Princeton represent the very small need-blind/full-demonstrated-need tier for international applicants. Φ does not invent a personal aid amount for them; it labels the result as individualized.
- Berea, Illinois Wesleyan, and Clark add private options whose official pages publish material international funding or merit opportunities rather than leaving aid implicit.
- Southern Miss, Alabama, and UNK add public options with published international merit awards and lower starting prices than the private sticker-price tier.
- Houston City College adds a 60-credit Computer Science Associate of Science designed for university transfer. Its published one-year F-1 budget is `$22,980`, with `$7,980` assigned to tuition/fees in the official budget. Although still above an `$8,000` all-in budget, it is the catalogue’s lowest published-cost route and the only deliberate 2+2 option; students must plan separately for living costs and confirm any Foundation aid.

This spread avoids presenting ten versions of the same unaffordable pathway. It also prevents a low-budget student from seeing only four-year sticker prices while keeping every affordability claim honest.

## Facts, requirements, and enums

`university_fact_kind` now contains:

`tuition`, `living_cost`, `application_fee`, `deadline`, `scholarship`, `language`, `intake`, `room_board`, `fees`, `total_cost_of_attendance`, `aid_international`, `test_policy`, `financial_certification`.

`requirement_kind` now contains:

`ielts`, `toefl`, `duolingo`, `sat`, `act`, `gpa`.

The new enum values were added with `ALTER TYPE ... ADD VALUE` in migration `202607280005`. They are used only by the following migration, avoiding PostgreSQL’s same-transaction enum limitation.

The existing known-or-explicitly-unknown checks were not weakened:

- A known `university_facts` or `requirements` row requires a display value and real `source_id`, and cannot carry an unknown reason/action.
- An unknown row requires a null value/source plus both `unknown_reason` and `suggested_action`.
- Numeric value, currency, and amount period are structured metadata for known records; clients do not parse display text to invent numbers.
- Scholarship identity always has a source. Its amount independently obeys the same known-or-explicitly-unknown model.

Every university has one sourced programme with name, field, and degree. `program_facts` is intentionally empty because no unsourced duration or programme-level tuition was carried forward; university-level costs are shown instead.

## Core table and relationship summary

### Public catalogue

- `sources`: official evidence URL, retrieval date, and verification state.
- `universities`: identity and summary, with a required source.
- `university_facts`: one row per university/fact kind, with the known-or-unknown check.
- `programs`: university, programme name, degree, field, and required source.
- `program_facts`: optional sourced/unknown structured programme facts.
- `requirements`: one row per university/requirement kind, with the known-or-unknown check.
- `scholarships`: sourced scholarship identity plus independently sourced or explicitly unknown amount.
- `university_scholarships`: sourced university-to-scholarship link.
- `verified_universities`: security-invoker view that exposes only universities whose owning source is `verified`.

Catalogue foreign keys cascade from a deleted university to facts, programmes, requirements, scholarship links, and saved plans. The migration explicitly deletes now-unlinked scholarships and orphaned sources after the old catalogue is removed.

### Private and audit data

- `student_profiles`: one row per `auth.users.id`; includes destination, field, academic score, budget, `language_test`, language score, pathway preference, intake, consent, and timestamps.
- `saved_plans`: unique `(user_id, university_id)` relationship.
- `counselor_strikes`: server-written audit entries for untraceable counselor figures.

`student_profiles.language_test` accepts `ielts`, `toefl`, or `duolingo` when present. The score constraint is conditional on the selected scale: IELTS `0–9`, TOEFL `0–120`, and Duolingo `10–160`. A null test requires a null score. User-entered profile values do not carry source IDs.

## Row-level security verification

RLS policies and grants were not changed by the US migrations.

| Table group | Anonymous visitor | Authenticated user |
|---|---|---|
| All public catalogue tables | read | read |
| `student_profiles` | no privilege | own row only |
| `saved_plans` | no privilege | own rows only |
| `counselor_strikes` | no privilege | own strikes readable; service role writes |

Live `anon` client test on 28 July 2026:

- `universities`: success, exact count `10`.
- `student_profiles`: PostgreSQL `42501`, `permission denied for table student_profiles`.

The owner policies continue to compare `auth.uid()` to `user_id`; a signed-in user cannot select or mutate another user’s profile or saved plans.

## Production verification

Live SQL and anonymous API checks returned:

- Universities: `10`.
- Universities where `country <> 'United States'`: `0`.
- Student profiles: `0`.
- Saved plans: `0`.
- Migrations recorded: `202607280005,202607280006`.
- Fact coverage: exactly the sourced/unknown counts in the table above.

Three stored figures were reopened and matched against the cited official page:

1. Princeton: `$94,624` 2026–27 total cost of attendance; the page also lists `$68,140` tuition, `$13,010` housing, `$9,110` food, and `$314` fees — [Princeton Fees & Payment Options](https://admission.princeton.edu/cost-aid/fees-payment-options).
2. UNK: `$35,064` before aid, `$4,797` International Loper Scholarship, `$30,267` after aid, with the same `$35,064` serving as the published pre-aid minimum support for I-20 issuance — [UNK international costs](https://www.unk.edu/international/international-admissions/costs.php).
3. Houston City College: `$22,980` liquid financial support for a self-sponsored first-time F-1 student — [HCC financial requirements](https://www.hccs.edu/student-life--services/international-student-services/financial-requirements-for-international-students/).

## Explicit unknown audit

These are intentionally unknown in Production; no value was inferred or estimated.

- **Harvard:** current undergraduate I-20 financial-certification amount; minimum first-year GPA; individualized need-aid award amount.
- **Yale:** current application fee; one official total 2026–27 COA figure; undergraduate I-20 financial-certification amount; minimum first-year GPA; individualized need-aid award amount.
- **Princeton:** undergraduate I-20 financial-certification amount; minimum first-year GPA; individualized need-aid award amount.
- **Berea:** separately itemized mandatory fees; next international deadline; next intake term; post-aid I-20 financial-certification amount; minimum international first-year GPA.
- **Illinois Wesleyan:** one official 2026–27 international COA total; current 2026–27 financial-certification amount; minimum international first-year GPA.
- **Clark:** exact post-scholarship I-20 financial-certification amount; minimum international first-year GPA.
- **University of Alabama:** official 2026–27 nonresident undergraduate COA. The current international page instead publishes the I-20 funding total, which is stored separately.
- **UNK:** mandatory-fee component separated from the published `$18,193` tuition-and-fees bundle.
- **Houston City College:** international institutional/Foundation aid eligibility and amount; Duolingo acceptance/minimum; SAT expectation; ACT expectation; minimum GPA; Foundation scholarship amount.
- **Southern Miss:** no explicit unknown among the 17 required university facts and requirements.

Each database row contains the corresponding reason and next action (for example, contact the relevant admissions, financial-aid, international-student, testing, or student-accounts office). The migration contains the complete wording.

## Applied migrations

Applied to the live Production branch in order and recorded in `supabase_migrations.schema_migrations`:

1. `202607240001_initial_schema.sql`
2. `202607270002_public_mvp_schema.sql`
3. `202607270003_seed_verified_universities.sql`
4. `202607270004_record_migration_history.sql`
5. `202607280005_us_admissions_enums.sql`
6. `202607280006_us_catalogue.sql`

Migrations 005 and 006 were applied from the checked-in files through Supabase SQL Editor because this workspace has neither a Supabase access token nor a database password. Migration 006 runs as a single transaction and aborts unless `saved_plans` is still zero.

## ⚠ Needs Jeff

- Review the explicit unknown audit and request the listed current figures from each university. Update them only through a new forward migration with official source rows; do not edit migration 006.
- Supply a Perplexity API key. Add `PPLX_API_KEY` as a Supabase Edge Function secret; optionally set `PPLX_MODEL=sonar`. Never add either to a `VITE_` variable.
- Deploy `app/supabase/functions/counselor/index.ts` as the `counselor` Edge Function. The connected dashboard’s browser editor previously returned HTTP 400 even for its untouched minimal template and exposed no actionable error, so the function is not live. Use a Supabase access token/CLI or retry the dashboard deployment.
- Confirm the counselor function allows publishable/anonymous invocations (the checked-in `supabase/config.toml` sets `verify_jwt = false`). Add rate limiting before broad promotion if anonymous abuse becomes material.
- Configure Supabase Auth **Site URL** to `https://app.4prep.ai` and add the same origin plus any required Vercel preview URL to **Redirect URLs**.
- Configure production email delivery/SMTP. Supabase’s default email service is rate-limited and is not suitable for a public launch.
- The dashboard shows the organization on the Free plan and no database backups. Upgrade to a plan with automated backups/PITR and enable the desired retention before collecting student data.
- Supply the public privacy/support contact and choose the account-deletion process. The app’s privacy page deliberately calls this out instead of inventing contact details.
- Create/import the Vercel project, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, deploy `app/`, attach `app.4prep.ai`, and configure DNS. No Vercel credentials or connected project are available in this workspace.
