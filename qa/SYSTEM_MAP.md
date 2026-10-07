# 4PrepAI — System Map (Phase 0)

Generated 2026-10-07 from the code at `afbd8b2` plus uncommitted `SearchScreen`/`DashboardScreen` changes.
Read-only analysis. No network calls were made to the target environment.

---

## ⛔ Two blockers before Phase 1/2

### B1. The supplied target is PRODUCTION

| Supplied | Value | Status |
|---|---|---|
| Supabase ref | `pubhgajlqhdbpwqahtki` | **Production.** `app/CLAUDE.md` § "Live database": *"Project ref: pubhgajlqhdbpwqahtki — Environment: Supabase Cloud, Production"*. It is also hard-coded in `qs-ingest-extension/manifest.json` `host_permissions`. |
| Frontend | `https://4-prep-ai2.vercel.app/universities` | Path `/universities` matches `app/src/routes.ts` (`search: '/universities'`), so this is this app. Its Supabase target is whatever `VITE_SUPABASE_URL` was baked in at build time. Given B1, assume Production. |

Under Hard Safety Rule 1, **no scenario (A–L) can run against this target**. A QA/staging Supabase project exists (`app/CLAUDE.md` refers to "QA" throughout, and the canonical CLI is "relinked to QA"), but its ref and a matching frontend deployment were not supplied.
**Needed from you:** the QA Supabase ref, plus a Vercel preview URL built against it (or approval to run the frontend locally with `npm run dev` pointed at QA).

### B2. The product has no test-taking feature

The campaign brief describes a test flow: *start test → load questions → answer/autosave → timer sync → module transition → submit → results*. **None of it exists in this codebase.**

- `grep -rniE "timer|countdown|attempt|autosave|debounce"` over `app/src` and `admin/src` finds only UI timeouts, an auth resend countdown (`AuthPrivacyScreens.tsx:186`) and the support poll (`SupportScreen.tsx:157`).
- The 31 tables in `app/supabase/migrations/` contain no `tests`, `attempts`, `questions`, `answers`, `modules` (test sense), or `scores` tables. Full list in §1.
- What 4PrepAI actually is: a US university **discovery and planning** app. It has a catalogue, the Φ fit score, a plan wizard, scholarships, skill gap, an AI counselor, a learning portal with homework upload, and support chat.

The test engine may live in another repo or deployment (e.g. the "2" in `4-prep-ai2`). If so, point me at it. Otherwise, the plan in Phase 1 adapts scenarios A–L to the real hot paths below. Scenarios G–J (answer integrity, attempt races, timer integrity) then have **no direct target** and would be re-scoped to the stateful writes that do exist (profile, saved plans, support queue, homework upload).

---

## 1. Stack (cited)

| Layer | What | Evidence |
|---|---|---|
| Frontend | React 19 + TypeScript 5.8 + Vite 7 + Tailwind v4, client-rendered SPA, pushState routing | `app/package.json`, `app/src/routes.ts`, `app/src/App.tsx` |
| Admin frontend | Separate React 19 SPA | `admin/package.json`, `admin/src/` |
| Hosting | Vercel (SPA rewrite), with an alternative Docker+nginx image | `app/vercel.json`, `app/Dockerfile`, `app/nginx.conf`, `docker-compose.yml` |
| Backend | No custom server. The browser talks directly to Supabase PostgREST, Storage, Auth, and Edge Functions | `app/src/data/repository.ts`, `app/src/data/client.ts` |
| Database | Supabase Postgres 15, RLS on every public table, `pg_cron` retention jobs | `app/supabase/config.toml` (`major_version = 15`), migrations `…0017_scheduled_retention.sql` |
| Auth | Supabase Auth: email+password, Google OAuth, `persistSession`, `autoRefreshToken` | `app/src/auth/AuthProvider.tsx:92-248`, `app/src/data/client.ts:29` |
| Storage | Buckets `avatars` (public read) and `learning-submissions` (private, owner-only) | migrations `202609020021_avatar_storage.sql`, `202607310009_learning_portal.sql` |
| Edge Functions | `counselor` (`verify_jwt=false`, public), `admin-api` (`verify_jwt=false`, does its own admin check), `delete-account` (`verify_jwt=true`) | `app/supabase/config.toml`, `app/supabase/functions/*` |
| AI provider | Perplexity `sonar` via `POST https://api.perplexity.ai/chat/completions`, 25 s abort, JSON-schema response | `counselor/index.ts:24,374-387` |
| Plan | Supabase **Free** ("Current documented plan: Free"). Re-verify. | `app/CLAUDE.md` § Live database |

Tables: `admin_api_requests, admin_audit_log, admin_users, award_conditions, campuses, counselor_cache, counselor_requests, counselor_strikes, leads, learning_assignments, learning_lessons, learning_modules, learning_progress, learning_submission_files, learning_submissions, learning_tracks, program_facts, programs, rankings, requirements, saved_plans, scholarships, sources, student_profiles, support_messages, support_threads, universities, university_facts, university_scholarships, university_scorecard, university_scorecard_programs`.

---

## 2. Hot paths: real student session, in order

PostgREST = `GET/POST/PATCH/DELETE {SUPABASE_URL}/rest/v1/<table>`. RPC = `POST /rest/v1/rpc/<fn>`. Sizes marked *est.* must be measured in Phase 2 on QA.

| # | Step | Call(s) | Method | Payload (est.) | Frequency |
|---|---|---|---|---|---|
| 1 | Open app | Vercel static: `index.html` 1.9 kB, JS **722 kB (201 kB gz)**, CSS 81 kB (15 kB gz), lazy chunks Dashboard 28 kB and Support 11 kB | GET | ~220 kB gz | once per cold load |
| 2 | Sources context | `sources?select=id,name,url,retrieved_at,verification` (`DataProvider.tsx:25`) | GET | small (tens of kB) | once per app mount |
| 3 | Catalogue (Search `/universities`) | `listUniversities()` = **`universities` with nested `university_facts, requirements, university_scorecard_programs, university_scholarships→scholarships→award_conditions, rankings, campuses`** **+ `sources` again** (`repository.ts:117-126, 80`) | GET ×2 | **est. 2–6 MB JSON.** ~210 universities, ~4k facts rows (`…0022` = 1.0 MB SQL), plus every Scorecard programme row. Not paginated server-side. | **every mount** of Search, Dashboard, SkillGap, Scholarships, Tools, Saved, and both Comparison panels (`grep listUniversities`). No client cache. |
| 4 | Sign in | `POST /auth/v1/token?grant_type=password` | POST | <1 kB | once |
| 5 | Private data restore | `student_profiles?user_id=eq.X`, `saved_plans?user_id=eq.X`; upsert `student_profiles` if an anonymous profile is merged (`App.tsx:248-268`) | GET ×2, POST ×0–1 | <2 kB | once per login |
| 6 | Dashboard | `getRankedPathway()` → full catalogue (#3) + client-side Φ over every university (`repository.ts:142`, `DashboardScreen.tsx:78`) | GET ×2 | same as #3 | per visit |
| 7 | University profile | `getUniversity(id)` (catalogue select, `.eq(id)`) + `sources` + **`functions/v1/counselor` `{mode:'profile_rationale'}`** (`ProfileScreen.tsx:88,445`). Deterministic, **no AI, no rate limit**, 1 DB read in the function | GET ×2, POST ×1 | 10–60 kB | per profile view (signed-in with a profile) |
| 8 | Intake → results | `student_profiles` upsert + `getRankedPathway` (#3) | POST + GET ×2 | | once per plan build |
| 9 | Save / unsave | `saved_plans` upsert (ignoreDuplicates) / delete | POST / DELETE | <1 kB | user-driven |
| 10 | Counselor message | (a) client preflight: **full `universities` + facts + requirements** if the message names a fact kind (`CounselorScreen.tsx:86-95`); (b) `functions/v1/counselor`: `auth.getUser` → `rpc begin_counselor_request` (INSERT) → scope regex → **full catalogue query again** (`index.ts:265`) → `rpc take_counselor_cache_hit` → Perplexity (≤25 s) → `counselor_cache` upsert → `counselor_requests` UPDATE (± `counselor_strikes` INSERT) | GET + POST | request <1 kB; Perplexity tokens est. 1.5–3k in / 300–600 out | user-driven; capped 20/min & 200/h (auth), 8/min & 40/h (anon) |
| 11 | Support chat | Poll **every 15 s while visible**: `support_threads` + `support_messages` (`SupportScreen.tsx:157`, `queue.ts:2`). Send: `rpc send_support_message` (idempotent client UUID) | GET ×2 per 15 s; POST | small | **8 reads/min** while the tab is open |
| 12 | Learning | `learning_tracks` (nested), `learning_progress`, `learning_submissions`; complete lesson → `learning_progress` upsert | GET ×3, POST | 10–100 kB | per visit |
| 13 | Homework submit | `learning_submissions` upsert → Storage `POST /storage/v1/object/learning-submissions/…` (XHR with progress) → `learning_submission_files` INSERT → `learning_submissions` UPDATE. Compensating deletes on failure (`repository.ts:468-541`) | 4 calls | file size | rare |
| 14 | Lead ("talk to a human") | `rpc submit_lead` (idempotent UUID) | POST | <2 kB | rare |
| 15 | Token refresh | `POST /auth/v1/token?grant_type=refresh_token` (supabase-js auto) | POST | <1 kB | ~1×/h per session (default 3600 s JWT) |
| 16 | Account deletion | `functions/v1/delete-account` (pages storage in batches of 100) | POST | | rare |

The brief's hot-path items (start test, load questions, autosave, timer sync, module transition, submit, results) have **no corresponding calls**. See B2.

---

## 3. Writes per student per minute

There is no autosave, so writes are rare and user-driven. Reads dominate.

**Engaged 20-minute session (realistic upper-middle case):**

| Action | Count | DB writes each | Total |
|---|---|---|---|
| Profile save (intake) | 1 | 1 | 1 |
| Save/unsave university | 5 | 1 | 5 |
| Counselor questions (live path) | 5 | 3 (request INSERT, cache upsert, request UPDATE) | 15 |
| Lesson complete | 2 | 1 | 2 |
| Support message | 1 | ~2 (message + thread bump, inside RPC) | 2 |
| **Total** | | | **25 writes / 20 min ≈ 1.25 writes/student/min** |

- **100 students:** ≈ 125 writes/min ≈ **2 writes/s**. Trivial for Postgres.
- **1,500 students:** ≈ 1,900 writes/min ≈ **31 writes/s**. Still modest.
- **Abusive ceiling per authenticated user:** counselor capped at 20/min → ~60 writes/min.

**Reads are the real load.** Every catalogue-bearing screen mount pulls the whole catalogue (#3).
If a student opens ~4 such screens in 20 min, that's 4 × (2–6 MB) ≈ **8–24 MB per student per session**, and the Postgres side must build the full nested JSON each time.
100 students opening Search within the same minute ≈ **200–600 MB of JSON** generated in that minute. **This, not writes, is what drives the stress plan.**

---

## 4. Stateful and timing-sensitive logic

| Item | Where | Notes for testing |
|---|---|---|
| Private-data load race guard | `App.tsx:227-276` (`privateLoadRunRef`) | Only the newest load may write state. A target for H/I (rapid login/logout, tab switching). |
| Anonymous → account profile merge | `auth/pendingAuth.ts` `resolveAccountProfile` | Merges a sessionStorage profile into the DB at login. A risk of overwriting a stored profile. Target for G/H. |
| Profile upsert sets `consented_at = now()` on every save | `repository.ts:192` | Overwrites the original consent timestamp. A data-correctness question, not load. |
| Support offline queue + retry | `support/queue.ts`, `SupportScreen.tsx:120-218` | sessionStorage queue, client-generated UUID, `retryNotBefore`. Idempotent on the server. **This is the closest thing to "autosave".** Target for E/G/I. |
| Support polling | `SUPPORT_POLL_INTERVAL_MS = 15_000` | Only while visible and online. Soak/connection target. |
| Homework upload | `repository.ts:468-541` | Multi-step and non-transactional, with compensating deletes. Partial failure can orphan rows or objects. Target for H/I. |
| Counselor rate limiter | `begin_counselor_request` (`…0007_counselor_hardening.sql:52-112`) | Sliding 1 min / 1 h window via `count(*)` on `counselor_requests`. **Anonymous key = salted hash of the first `x-forwarded-for` IP** (`index.ts:213-217`). From one load-generator IP, all anonymous virtual users share 8/min. |
| Counselor cache | `take_counselor_cache_hit`, 24 h TTL, key includes `PHI_VERSION='phi-v0.2'` while the client is `phi-v0.3` | Cache hits skip Perplexity. Load tests must vary questions or they only measure the cache. |
| Lead limiter | `submit_lead` (`…0017_academy_handoff.sql:354`) | **Anonymous limit is GLOBAL: 30/h, 200/24 h for all anonymous users combined.** One actor can exhaust it for everyone. Security/K finding candidate. |
| Retention jobs | `pg_cron` 03:30 / 03:45 (`prune-expired-support-threads`, `refresh-university-search-index`) | Avoid running soak tests across these times, or tag the results. |
| Scoring | `scoring/phi.ts` (Φ v0.3), deterministic, client-side, over the whole catalogue | CPU cost on weak devices (scenario L). |
| Timers / attempt locking / server-authoritative clock | **None exist** | See B2. |

---

## 5. Platform limits

| Limit | Value | Source |
|---|---|---|
| DB max direct connections (Nano/Free and Micro) | **60** | [Supabase compute docs](https://supabase.com/docs/guides/platform/compute-and-disk) |
| Pooler (Supavisor) max clients (Nano/Micro) | **200** | same |
| DB CPU / RAM (Nano, Free plan) | **Shared CPU, up to 0.5 GB RAM** | same |
| Edge Function wall clock | **150 s Free**, 400 s paid | [Edge Function limits](https://supabase.com/docs/guides/functions/limits) |
| Edge Function CPU time | **2 s per request** (excludes async I/O) | same |
| Edge Function memory | **256 MB** | same. Relevant: the counselor loads the full nested catalogue into memory per request. |
| Edge Function request idle timeout | 150 s → 504 | same |
| Edge Function invocations | **500k/month on Free, no overage** (hard stop) | [Functions pricing](https://supabase.com/docs/guides/functions/pricing) |
| Auth sign-in/sign-up | **30 req / 5 min per IP** | [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits) |
| Auth token refresh | 150 req / 5 min per IP (burst 30) | same |
| Auth email (built-in SMTP) | **2 emails/hour per project** | same. The production SMTP setup is unverified per `app/CLAUDE.md` §4. |
| PostgREST max rows | 1000 top-level rows per request | `app/supabase/config.toml` `max_rows` (local). Hosted default is the same unless changed. |
| Perplexity `sonar` rate limit | **50 req/min** default ("increased our default rate limit for the sonar online models to 50 requests/min for all users", Nov 2024). Newer tier tables list Agent API QPS (Tier 0 = 1 QPS) and don't clearly apply to Sonar. | [Perplexity changelog](https://docs.perplexity.ai/changelog), [usage tiers](https://docs.perplexity.ai/guides/usage-tiers) |
| Perplexity `sonar` price | $1/M input + $1/M output tokens, + request fee $5 / $8 / $12 per 1k (low/med/high search context) | [Perplexity pricing](https://docs.perplexity.ai/guides/pricing.md) |
| ⚠ Perplexity API status | Changelog, July 2026: *"Sonar Chat Completions is now Agent API"* (migration). A third-party source cites support "until September 27, 2026"; that date is **not confirmed** in official docs. The counselor calls `/chat/completions` (`index.ts:378`). **The live endpoint may already be retired. Calibrate before trusting any F results.** | [Perplexity changelog](https://docs.perplexity.ai/changelog), [third-party note](https://developer.puter.com/tutorials/perplexity-api-pricing/) |
| Vercel Hobby limits | **Not retrieved.** vercel.com refused connections from this machine (ECONNREFUSED ×2). The Vercel plan for `4-prep-ai2` is also unknown, and Hobby is non-commercial use only. To verify in Phase 1. | — |

### What these limits mean for the test design

1. **Login can't be load-tested from one IP:** 30 sign-ins / 5 min per IP. Seed users must get tokens minted once through the admin API, or logins must be spread over time. Otherwise A/C measure the auth limiter, not the app.
2. **Seeding must not send email** (2/hour). Create users with `auth.admin.createUser({ email_confirm: true })` using the service role from env.
3. **Anonymous counselor load from one IP is capped at 8/min.** Load must use authenticated virtual users (20/min each) or the IP limit will dominate F.
4. **The DB is a shared-CPU 0.5 GB Nano instance.** Nested-JSON aggregation of a multi-MB catalogue × 100 concurrent requests is the prime breaking-point candidate for A/B/C.
5. **AI budget math ($5 / 300 calls):** est. ~2k in + ~0.5k out tokens ≈ $0.0025, plus a $0.005 request fee (low context; the code sets no `search_context_size`) ≈ **$0.0075/call → 300 calls ≈ $2.25**, under the $5 cap. Must be verified on the first calibration calls.
6. **Edge invocations are a hard monthly cap** (500k). A 1,500-user soak with profile-rationale calls on every profile view could consume a meaningful share. Count invocations.
