# 4Prep MVP — current-phase handoff

Last updated: 28 July 2026 (Asia/Tashkent)

This is the working handoff for Claude or any engineer continuing the 4Prep public MVP. Read `README.md`, `src/types/index.ts`, and `../docs/DATABASE_STATE.md` before changing implementation or data.

## Current phase

**Phase: production enablement and launch QA.**

The core MVP implementation and production database foundation are complete. The remaining work depends mainly on third-party accounts, billing, secrets, deployment, DNS, and dashboard configuration. The owner plans to purchase or activate the required services on 28 July 2026 but had not completed those purchases when this report was written.

Do not interpret setup instructions discussed with the owner as confirmation that a dashboard change was completed. Re-check each external system.

## Confirmed complete

- The React 19 + TypeScript + Vite + Tailwind v4 application is implemented in this directory.
- The live Supabase Cloud database contains 10 real universities, 33 verified official sources, and explicit unknown states where facts could not be sourced.
- All public university facts preserve the `DataPoint<T>` known/unknown contract.
- Row-level security is enabled on every public table.
- Anonymous users can browse the public catalogue.
- Anonymous users cannot read student profiles, saved plans, or counselor audit strikes.
- Auth UI, private student-profile persistence, saved-plan persistence, and real URL routing are implemented.
- Φ v0.1 is deterministic and returns academic, financial, language, career, and geographic components with reasons.
- The grounded counselor client and Supabase Edge Function source are implemented.
- The counselor retrieves database evidence first, separates verified facts from general guidance, validates figures, refuses unsupported claims, and logs strikes.
- The seven screens use the repository/data-provider layer rather than `src/mock/sample-data.ts`.
- Known S1/S2/S3/M1/M2/M3 issues were addressed in the implementation.
- Privacy and consent UI exists, but final public contact and deletion-process details are still required.
- Repository hygiene, migrations, `.env.example`, Vercel configuration, tests, and local documentation are present.
- Baseline implementation was committed locally as `e0d8b64 feat: ship sourced public MVP foundation`.
- Nothing was pushed to GitHub and no pull request was opened.

## Verification snapshot

Re-run on 28 July 2026:

| Check | Result |
|---|---|
| `npm run build` | Passed with zero TypeScript errors |
| `npm run test` | Passed: 2 files, 11 tests |
| SSR Vite build and `node .smoke-out/smoke.js` | Passed; rendered 5,102 characters |

The counselor red-team test cannot be considered complete against production until the Edge Function is deployed and Perplexity billing/key setup is active.

## Live database

- Project: `4PrepAi`
- Project ref: `pubhgajlqhdbpwqahtki`
- Environment: Supabase Cloud, Production
- Region: AWS Tokyo (`ap-northeast-1`)
- Project URL: `https://pubhgajlqhdbpwqahtki.supabase.co`
- Current documented plan: Free
- Detailed schema, provenance rules, RLS policies, row counts, seeds, and migration history: `../docs/DATABASE_STATE.md`

Applied migrations, in order:

1. `supabase/migrations/202607240001_initial_schema.sql`
2. `supabase/migrations/202607270002_public_mvp_schema.sql`
3. `supabase/migrations/202607270003_seed_verified_universities.sql`
4. `supabase/migrations/202607270004_record_migration_history.sql`

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
10. Commit locally only unless the owner explicitly changes the no-push instruction.

## Non-negotiable product rules

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
- Do not build the four out-of-scope AI engines, an admin console, verification queue, outcome ledger, or desktop redesign.

## Key files

| Purpose | File |
|---|---|
| Product and local setup | `README.md` |
| Type/data contract | `src/types/index.ts` |
| Database state | `../docs/DATABASE_STATE.md` |
| Repository/data access | `src/data/repository.ts` |
| Data mapping | `src/data/mappers.ts` |
| Application data provider | `src/data/DataProvider.tsx` |
| Φ v0.1 | `src/scoring/phi.ts` |
| Φ tests | `src/scoring/phi.test.ts` |
| Auth state | `src/auth/AuthProvider.tsx` |
| Counselor UI | `src/screens/CounselorScreen.tsx` |
| Counselor server boundary | `supabase/functions/counselor/index.ts` |
| Production schema | `supabase/migrations/202607270002_public_mvp_schema.sql` |
| Verified catalogue seed | `supabase/migrations/202607270003_seed_verified_universities.sql` |
| Vercel configuration | `vercel.json` |
| Environment variable template | `.env.example` |

## Safe handoff note

Before changing external state, inspect the current Supabase, Perplexity, Resend, Vercel, and DNS dashboards. This report intentionally records no passwords, API keys, service-role credentials, or SMTP secrets.
