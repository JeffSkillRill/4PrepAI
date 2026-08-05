# 4Prep MVP — current-phase handoff

Last updated: 5 August 2026 (Asia/Tashkent)

This is the working handoff for Claude or any engineer continuing the 4Prep public MVP. Read `README.md`, `src/types/index.ts`, and `../docs/DATABASE_STATE.md` before changing implementation or data.

## Current phase

**Phase: production enablement, launch QA, and the authorised Prompt 12 operator work.**

On 3 August 2026, the product owner explicitly reversed two earlier scope rules: the admin console and homework feedback are authorised under Prompt 12. On 5 August the owner deferred lesson video and AI homework feedback, and explicitly chose to implement only the existing admin foundation plus Prompt 12.4 human support chat before Production promotion. Do not resume 12.2 or 12.3 without a new owner instruction. The other exclusions below still bind.

The 5 August QA migration-history mismatch for versions `202608040013`–`015` was resolved by exporting their recorded statement bundles and restoring exact normalized-SHA-matching source files. The owner then applied `202608050013_support_chat.sql` to QA, and a read-only linked list confirmed the local/remote match. The reviewed chain was subsequently applied to Production as described below.

The owner also deployed the updated QA functions on 5 August; a read-only function list confirmed active `admin-api` version 2 (`verify_jwt=false`, with its own server-side admin boundary) and `delete-account` version 1 (`verify_jwt=true`). The owner then reported successful two-user isolation, admin audit, offline retry, rate-limit, disposable-account deletion, and 375 px checks in QA.

After QA chat checks passed, the owner applied the reviewed Production migration chain through `202608050013`; a read-only linked list confirmed the Production match. Four inspected, userless orphan counselor strikes were removed first so migration `014` could establish its intended request-retention cascade. Production functions and an admin grant were then deployed/configured, and ignored local browser environments were switched to the matching Production URL/anon project. The canonical CLI was relinked to QA for safety. Production live browser proof remains pending.

The core MVP implementation and production database foundation are complete. The remaining work depends mainly on third-party accounts, billing, secrets, deployment, DNS, and dashboard configuration. Their current external state is time-sensitive and must be rechecked rather than inferred from an earlier setup plan.

Do not interpret setup instructions discussed with the owner as confirmation that a dashboard change was completed. Re-check each external system.

## Confirmed complete

- The React 19 + TypeScript + Vite + Tailwind v4 application is implemented in this directory.
- The live Supabase Cloud database contains 10 real universities, 50 verified official sources, and explicit unknown states where facts could not be sourced.
- All public university facts preserve the `DataPoint<T>` known/unknown contract.
- Row-level security is enabled on every public table.
- Anonymous users can browse the public catalogue.
- Anonymous users cannot read student profiles, saved plans, or counselor audit strikes.
- Auth UI, private student-profile persistence, saved-plan persistence, and real URL routing are implemented.
- Φ v0.2 is deterministic and returns academic, financial, language, career, and geographic components with reasons.
- The grounded counselor client and Supabase Edge Function source are implemented.
- The counselor retrieves database evidence first, separates verified facts from general guidance, validates figures, refuses unsupported claims, and logs strikes.
- Student product screens use the repository/data-provider layer rather than `src/mock/sample-data.ts`.
- Known S1/S2/S3/M1/M2/M3 issues were addressed in the implementation.
- Privacy and consent UI exists, but final public contact and deletion-process details are still required.
- Repository hygiene, migrations, `.env.example`, Vercel configuration, tests, and local documentation are present.
- Repository history includes the earlier `e0d8b64 feat: ship sourced public MVP foundation` baseline.
- At this snapshot, `HEAD` and `origin/main` are both `e84622329f5c88af502abddaa460b031bb203937`. The current Prompt 12 worktree changes are uncommitted and unpushed.

## Verification snapshot

Re-run on 3 August 2026 after launch-QA remediation:

| Check | Result |
|---|---|
| `npm run build` | Passed with zero TypeScript errors |
| `npm run lint` | Passed with zero warnings |
| `npm run test` | Passed: 21 files, 243 tests |
| SSR Vite build and `node .smoke-out/smoke.js` | Passed; rendered 5,487 characters |

The separate `admin/` deployable also passed its build and zero-warning lint;
its Vitest suite passed 3 files and 13 tests. These are local source checks,
not evidence that migration `012` or `admin-api` is live.

The counselor red-team test cannot be considered complete against production until the Edge Function is deployed and Perplexity billing/key setup is active.

## Live database

- Project: `4PrepAi`
- Project ref: `pubhgajlqhdbpwqahtki`
- Environment: Supabase Cloud, Production
- Region: AWS Tokyo (`ap-northeast-1`)
- Project URL: `https://pubhgajlqhdbpwqahtki.supabase.co`
- Current documented plan: Free
- Detailed schema, provenance rules, RLS policies, row counts, seeds, and migration history: `../docs/DATABASE_STATE.md`

Migration files, in order:

1. `supabase/migrations/202607240001_initial_schema.sql`
2. `supabase/migrations/202607270002_public_mvp_schema.sql`
3. `supabase/migrations/202607270003_seed_verified_universities.sql`
4. `supabase/migrations/202607270004_record_migration_history.sql`
5. `supabase/migrations/202607280005_us_admissions_enums.sql`
6. `supabase/migrations/202607280006_us_catalogue.sql`
7. `supabase/migrations/202607290007_counselor_hardening.sql`
8. `supabase/migrations/202607310008_counselor_scope_outcome.sql`
9. `supabase/migrations/202607310009_learning_portal.sql`
10. `supabase/migrations/202608030010_learning_storage_upload_policy.sql`
11. `supabase/migrations/202608030011_learning_storage_update_preflight.sql`
12. `supabase/migrations/202608030012_admin_foundation.sql`
13. `supabase/migrations/202608050013_support_chat.sql`

Versions `008` and `009` were confirmed applied to Production by a read-only
query of `supabase_migrations.schema_migrations` on 3 August. Migrations `010`
and `011` are applied and live-proved in QA. Together they
adapt the existing owner-only create and update policies to the Storage API's
`contentLength` preflight metadata without relaxing ownership. Neither is
recorded as applied to Production. Migration `012` was applied and exercised in
QA on 3 August but is not applied to Production. Migration `013` is source-only
and was not applied to QA or Production in the 5 August implementation pass.
The live outcome constraint permits `out_of_scope`; seven `learning_*` tables
and the private `learning-submissions` bucket exist. See
`../docs/DATABASE_STATE.md` for exact methods and current counts.

Regenerate `../docs/DATABASE_STATE.md` after every task that touches the database.

## External setup still pending or unverified

### 1. Perplexity

- Purchase/fund Perplexity API usage.
- Generate the production API key.
- Store it only as the Supabase Edge Function secret `PPLX_API_KEY`.
- Optionally store `PPLX_MODEL=sonar`.
- Never expose either value through a `VITE_` variable, client code, logs, or Git.

### 2. Counselor Edge Function

- Deploy `supabase/functions/counselor/index.ts` as `counselor`.
- The checked-in `supabase/config.toml` sets `verify_jwt = false` so logged-out visitors can use the public counselor.
- Confirm the deployment is reachable, preserves server-side secrets, and writes validator strikes.
- Add/confirm suitable rate limiting before broad public promotion.
- Run the required red-team question for a deliberately unknown tuition figure. The response must refuse plainly and cite nothing.

### 3. Supabase plan and backups

- Upgrade to a Supabase plan that provides the required production backup capability.
- Enable and confirm backup retention or PITR appropriate for grades, budgets, and student profiles.
- Record the final plan and backup state in `../docs/DATABASE_STATE.md`.

### 4. Production SMTP

The owner received a Resend-based setup path, but completion is not verified.

Recommended dedicated sending domain:

```text
auth.4prep.ai
```

Recommended sender:

```text
4Prep <no-reply@auth.4prep.ai>
```

Resend SMTP values:

```text
Host: smtp.resend.com
Port: 465
Username: resend
Password: <Resend API key entered only in Supabase>
```

Required actions:

- Activate the SMTP provider.
- Verify SPF and DKIM DNS records.
- Configure Supabase Authentication SMTP settings.
- Keep email confirmation enabled.
- Test confirmation and password recovery with a non-team email address.
- Disable link tracking if the provider enables it, because rewritten single-use auth links can break.

### 5. Supabase Auth URLs

The owner received these values, but dashboard completion is not independently verified:

```text
Site URL: https://app.4prep.ai
Redirect URL: https://app.4prep.ai
Local redirect: http://localhost:5173/**
```

The Vercel preview wildcard is intentionally deferred until a Vercel team/account slug exists:

```text
https://*-<team-or-account-slug>.vercel.app/**
```

`/**` is an allow-list wildcard, not part of a URL to visit in a browser.

### 6. Vercel and DNS

- Create or import the Vercel project with `app/` as its root directory.
- Set the two browser-safe production environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

- Deploy the production build.
- Attach `app.4prep.ai`.
- Configure and verify DNS.
- Add the real Vercel preview redirect wildcard to Supabase Auth after the team/account slug is known.
- Do not put the Supabase service-role secret or Perplexity key in Vercel’s client environment.

### 7. Privacy operations

- Supply the real privacy/support contact.
- Decide and document the user account/data deletion process.
- Update the privacy page with those real operational details.
- Do not invent a contact address or process.

### 8. Admin foundation

- Migration `012` and the core admin console were observed in QA on 3 August; recheck rather than reapplying the migration.
- Configure `ADMIN_IP_SALT` and the exact `ADMIN_ALLOWED_ORIGINS` only as Edge Function secrets.
- Grant one trusted existing Auth user through reviewed SQL; there is no browser grant path.
- Deploy `admin-api`, then deploy `admin/` separately with only the URL and anon key.
- Complete the non-admin, revoked-admin, audit-row, signed-URL-expiry, and shared-stage live checks in `../docs/ADMIN.md`.

### 9. Human support chat

- Review/apply migration `013` in QA, then deploy the updated `admin-api` and `delete-account` functions.
- Prove two-student isolation, audited admin reads, offline queue/retry, the helpful rate limit, 375 px behavior, and account-deletion cascade using `../docs/SUPPORT_CHAT.md`.
- Schedule `prune_expired_support_threads()` daily before Production; the admin inbox's opportunistic prune is not a substitute for the retention job.

## Recommended next execution order

1. Activate Perplexity API billing and create the production key.
2. Upgrade Supabase and confirm backups/PITR.
3. Configure and verify production SMTP and its DNS records.
4. Deploy the counselor Edge Function with server-side secrets.
5. Deploy `app/` to Vercel and attach `app.4prep.ai`.
6. finalize Supabase Auth production and preview redirect URLs.
7. Add the real privacy contact and deletion procedure.
8. Run full production QA: build, tests, SSR smoke, mobile at 375 px, logged-out browsing, signup/email confirmation, persistence, cross-user RLS, and counselor red-team refusal.
9. Regenerate `../docs/DATABASE_STATE.md` after any database change.
10. Apply/deploy and live-prove Prompt 12.4 support chat in QA following `../docs/SUPPORT_CHAT.md`.
11. Commit locally only unless the owner explicitly changes the no-push instruction.

## Non-negotiable product rules

- The counselor answers only US admissions and international-study questions. Anything else is refused by `supabase/functions/counselor/scope.ts` before the provider is called.
- The counselor lays out realistic options and their consequences. It never tells a student which university, programme, or path to choose — per the founder's stated method, "I want the applicant to make the decision, not me."
- 4Prep Academy also serves Canada, Europe, and China, but this MVP's verified catalogue is US-only and the scope gate is US-only to match. Revisit both together, never one alone.
- Never fabricate a university, fee, tuition amount, living cost, deadline, IELTS requirement, scholarship, or statistic.
- Every displayed fact must remain a `DataPoint<T>`.
- Known facts require a real `sourceId`; unknown facts require a reason and suggested action.
- Values reach the screen only through `DataValue` and then `SourceChip` or `MissingValue`.
- Never use zero, an em dash, or an estimate as a missing-data fallback.
- Never show a bare fit score; always expose all five components and plain-language reasons.
- Φ is deterministic and must never be computed by AI.
- The counselor may use university figures only from supplied verified records.
- Unsupported figures must produce an honest refusal, not a web substitute or estimate.
- Keep API keys server-side and out of Git.
- Maintain strict TypeScript with zero build errors.
- The admin console, Prompt 12.3 homework feedback, and Prompt 12.4 human support chat are authorised scope reversals. The owner deferred 12.2 and 12.3 on 5 August; do not build them without a new instruction. Do not build the remaining out-of-scope AI engines, verification queue, outcome ledger, or a student-app desktop redesign.

## Key files

| Purpose | File |
|---|---|
| Product and local setup | `README.md` |
| Type/data contract | `src/types/index.ts` |
| Database state | `../docs/DATABASE_STATE.md` |
| Repository/data access | `src/data/repository.ts` |
| Data mapping | `src/data/mappers.ts` |
| Application data provider | `src/data/DataProvider.tsx` |
| Φ v0.2 | `src/scoring/phi.ts` |
| Φ tests | `src/scoring/phi.test.ts` |
| Auth state | `src/auth/AuthProvider.tsx` |
| Counselor UI | `src/screens/CounselorScreen.tsx` |
| Counselor server boundary | `supabase/functions/counselor/index.ts` |
| Counselor topic scope gate | `supabase/functions/counselor/scope.ts` |
| Production schema | `supabase/migrations/202607270002_public_mvp_schema.sql` |
| Verified catalogue seed | `supabase/migrations/202607270003_seed_verified_universities.sql` |
| Vercel configuration | `vercel.json` |
| Environment variable template | `.env.example` |
| Shared student/admin stage model | `../shared/dashboard-stage.ts` |
| Admin browser app | `../admin/` |
| Privileged admin function | `supabase/functions/admin-api/index.ts` |
| Admin authorization helper | `supabase/functions/_shared/adminAuth.ts` |
| Admin operations runbook | `../docs/ADMIN.md` |

## Safe handoff note

Before changing external state, inspect the current Supabase, Perplexity, Resend, Vercel, and DNS dashboards. This report intentionally records no passwords, API keys, service-role credentials, or SMTP secrets.
