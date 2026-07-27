# 4Prep database state

Last regenerated: 27 July 2026 (Asia/Tashkent), after applying the public MVP schema, real-university seed, and migration ledger.

This document describes the connected live database in plain language. The SQL files in `app/supabase/migrations/` are the source of truth.

## Connection and project

- Project name: `4PrepAi`
- Project reference: `pubhgajlqhdbpwqahtki`
- Branch/environment: `main` — Production
- Hosting: Supabase Cloud (not local)
- Region: Northeast Asia (Tokyo), AWS `ap-northeast-1`
- Compute: Nano
- Organization plan shown in the dashboard: Free
- Project URL: `https://pubhgajlqhdbpwqahtki.supabase.co`
- Secret names used by the system: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PPLX_API_KEY`, `PPLX_MODEL`
- No password, API key, service-role key, or other secret is included here.

## Live row counts

| Table | Rows |
|---|---:|
| `sources` | 33 |
| `universities` | 10 |
| `university_facts` | 70 |
| `programs` | 10 |
| `program_facts` | 20 |
| `requirements` | 10 |
| `scholarships` | 10 |
| `university_scholarships` | 10 |
| `student_profiles` | 0 |
| `saved_plans` | 0 |
| `counselor_strikes` | 0 |

## Seeded universities and evidence coverage

“Sourced” and “unknown” below cover the eight launch facts shown in the product: tuition, living cost, application fee, deadline, scholarship, teaching language, intake, and IELTS minimum. An unknown is stored with both a reason and a suggested next action. It is not stored as zero or placeholder text.

| University | Country | Sourced facts | Explicit unknowns |
|---|---|---:|---:|
| Astana IT University | Kazakhstan | 4 | 4 |
| Constructor University | Germany | 8 | 0 |
| Eötvös Loránd University | Hungary | 6 | 2 |
| Kazakh-British Technical University | Kazakhstan | 3 | 5 |
| Nazarbayev University | Kazakhstan | 7 | 1 |
| New Uzbekistan University | Uzbekistan | 5 | 3 |
| Sabancı University | Türkiye | 6 | 2 |
| University of Debrecen | Hungary | 8 | 0 |
| University of Tartu | Estonia | 7 | 1 |
| Westminster International University in Tashkent | Uzbekistan | 5 | 3 |

All 33 source rows are marked `verified` and contain the real official-page URL and retrieval date. No `unverified_sample` source or fictional university remains in the live catalogue.

## Tables and columns

`nullable` means the database permits an empty value. Defaults are applied by PostgreSQL when the application omits the column.

### `sources`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `id` | text | no | none | — |
| `name` | text | no | none | — |
| `url` | text | yes | none | — |
| `retrieved_at` | date | no | none | — |
| `verification` | `source_verification` enum | no | `unverified_sample` | — |

Provenance rule: a verified source must have a URL. The source is the root evidence record, so it does not itself carry `source_id`.

### `universities`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `id` | text | no | none | — |
| `name` | text | no | none | — |
| `city` | text | no | none | — |
| `country` | text | no | none | — |
| `flag` | text | no | none | — |
| `tagline` | text | no | none | — |
| `description` | text | no | none | — |
| `photo_seed` | text | no | none | — |
| `highlights` | text array | no | empty array | — |
| `source_id` | text | no | none | `sources.id` |

Provenance rule: every university identity/summary row has a non-null `source_id`. Numeric and time-sensitive facts are not stored here; they live in `university_facts`.

### `university_facts`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `university_id` | text | no | none | `universities.id` |
| `kind` | `university_fact_kind` enum | no | none | — |
| `value` | text | yes | none | — |
| `numeric_value` | numeric | yes | none | — |
| `currency` | text | yes | none | — |
| `source_id` | text | yes | none | `sources.id` |
| `unknown_reason` | text | yes | none | — |
| `suggested_action` | text | yes | none | — |
| `amount_period` | text | yes | none | — |

Provenance rule: a known fact requires non-null `value` and `source_id`, with no unknown reason/action. An unknown fact requires null `value` and `source_id`, plus non-null `unknown_reason` and `suggested_action`. Numeric value, currency, and period are optional metadata for known amounts; Φ will not infer them from display text.

### `programs`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `id` | text | no | none | — |
| `university_id` | text | no | none | `universities.id` |
| `name` | text | no | none | — |
| `degree` | text | no | none | — |
| `field` | text | no | none | — |
| `source_id` | text | no | none | `sources.id` |

Provenance rule: every named programme has a non-null `source_id`.

### `program_facts`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `program_id` | text | no | none | `programs.id` |
| `kind` | `program_fact_kind` enum | no | none | — |
| `value` | text | yes | none | — |
| `numeric_value` | numeric | yes | none | — |
| `currency` | text | yes | none | — |
| `source_id` | text | yes | none | `sources.id` |
| `unknown_reason` | text | yes | none | — |
| `suggested_action` | text | yes | none | — |
| `amount_period` | text | yes | none | — |

Provenance rule: the same known-or-explicitly-unknown constraint as `university_facts`.

### `requirements`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `id` | bigint identity | no | generated identity | — |
| `university_id` | text | no | none | `universities.id` |
| `kind` | `requirement_kind` enum | no | none | — |
| `value` | text | yes | none | — |
| `numeric_value` | numeric | yes | none | — |
| `source_id` | text | yes | none | `sources.id` |
| `unknown_reason` | text | yes | none | — |
| `suggested_action` | text | yes | none | — |

Provenance rule: a known requirement requires `value` and `source_id`; an unknown requires reason and action. The launch enum currently contains IELTS only.

### `scholarships`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `id` | text | no | none | — |
| `name` | text | no | none | — |
| `amount_value` | text | yes | none | — |
| `amount_numeric` | numeric | yes | none | — |
| `currency` | text | yes | none | — |
| `amount_source_id` | text | yes | none | `sources.id` |
| `amount_unknown_reason` | text | yes | none | — |
| `amount_suggested_action` | text | yes | none | — |
| `source_id` | text | no | none | `sources.id` |
| `amount_period` | text | yes | none | — |

Provenance rule: `source_id` always proves the scholarship’s identity. Its amount is independently a DataPoint: a known amount has non-null `amount_value` and `amount_source_id`; an unknown amount has a null value/source and non-null reason/action.

### `university_scholarships`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `university_id` | text | no | none | `universities.id` |
| `scholarship_id` | text | no | none | `scholarships.id` |
| `source_id` | text | no | none | `sources.id` |

Provenance rule: every university-to-scholarship claim has its own non-null `source_id`.

### `student_profiles`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `user_id` | UUID | no | none | `auth.users.id` |
| `country` | text | no | none | — |
| `field` | text | no | none | — |
| `academic_score` | numeric | yes | none | — |
| `budget_max` | numeric | yes | none | — |
| `budget_currency` | text | yes | none | — |
| `language_score` | numeric | yes | none | — |
| `needs_language_pathway` | boolean | no | false | — |
| `intake` | text | no | none | — |
| `consented_at` | timestamp with time zone | no | none | — |
| `created_at` | timestamp with time zone | no | `now()` | — |
| `updated_at` | timestamp with time zone | no | `now()` | — |

Provenance rule: these are user-entered preferences and self-reported values, not university facts, so they do not carry source IDs. Academic score, budget, and language score may be null when the student says they do not know. A non-null budget must have a three-letter currency.

### `saved_plans`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `id` | UUID | no | `gen_random_uuid()` | — |
| `user_id` | UUID | no | none | `auth.users.id` |
| `university_id` | text | no | none | `universities.id` |
| `created_at` | timestamp with time zone | no | `now()` | — |

Provenance rule: this is a user-owned relationship, not a fact. `(user_id, university_id)` is unique, preventing the same plan from being saved twice.

### `counselor_strikes`

| Column | Type | Nullable | Default | Foreign key |
|---|---|---|---|---|
| `id` | UUID | no | `gen_random_uuid()` | — |
| `request_id` | UUID | no | none | — |
| `user_id` | UUID | yes | none | `auth.users.id` |
| `strike_type` | text | no | none | — |
| `detail` | text | no | none | — |
| `created_at` | timestamp with time zone | no | `now()` | — |

Provenance rule: this is an audit record created when the counselor validator detects an untraceable figure. It is not displayed as a university fact.

### `verified_universities` view

This security-invoker view exposes only universities whose owning source has `verification = 'verified'`. It does not add storage of its own.

## Row-level security

RLS is enabled on every public table.

| Table | Anonymous visitor | Authenticated user |
|---|---|---|
| `sources` | read | read |
| `universities` | read | read |
| `university_facts` | read | read |
| `programs` | read | read |
| `program_facts` | read | read |
| `requirements` | read | read |
| `scholarships` | read | read |
| `university_scholarships` | read | read |
| `student_profiles` | no privileges; no rows readable | owner can select, insert, update, and delete only their own row |
| `saved_plans` | no privileges; no rows readable | owner can select, insert, and delete only their own rows |
| `counselor_strikes` | no privileges | owner can select their own strikes; the server-side service role writes strikes |

**Can a logged-out visitor read student profiles? No.** A live test using the `anon` role failed with PostgreSQL error `42501: permission denied for table student_profiles`.

A second live test using the `anon` role successfully read 10 universities, 33 sources, and 10 programmes, so logged-out catalogue browsing remains usable.

The owner policies compare `auth.uid()` with each row’s `user_id`; therefore a signed-in user cannot select or mutate a different user’s profile or saved plans. Direct anonymous grants were also revoked from all three private tables.

## Applied migrations

Applied to the live Production branch in this order and recorded in `supabase_migrations.schema_migrations`:

1. `202607240001_initial_schema.sql`
2. `202607270002_public_mvp_schema.sql`
3. `202607270003_seed_verified_universities.sql`
4. `202607270004_record_migration_history.sql`

The 27 July migrations were applied from the checked-in files through Supabase SQL Editor because this workspace does not have a Supabase access token or database password.

## ⚠ Needs Jeff

- Supply a Perplexity API key. Add `PPLX_API_KEY` as a Supabase Edge Function secret; optionally set `PPLX_MODEL=sonar`. Never add either to a `VITE_` variable.
- Deploy `app/supabase/functions/counselor/index.ts` as the `counselor` Edge Function. The connected dashboard’s browser editor returned HTTP 400 even for its untouched minimal template and exposed no actionable error, so the function is not live. Use a Supabase access token/CLI or retry the dashboard deployment.
- Confirm the counselor function allows publishable/anonymous invocations (the checked-in `supabase/config.toml` sets `verify_jwt = false`). Add rate limiting before broad promotion if anonymous abuse becomes material.
- Configure Supabase Auth **Site URL** to `https://app.4prep.ai` and add the same origin plus any required Vercel preview URL to **Redirect URLs**.
- Configure production email delivery/SMTP. Supabase’s default email service is rate-limited and is not suitable for a public launch.
- The dashboard shows the organization on the Free plan and no database backups. Upgrade to a plan with automated backups/PITR and enable the desired retention before collecting student data.
- Supply the public privacy/support contact and choose the account-deletion process. The app’s privacy page deliberately calls this out instead of inventing contact details.
- Create/import the Vercel project, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, deploy `app/`, attach `app.4prep.ai`, and configure DNS. No Vercel credentials or connected project are available in this workspace.
