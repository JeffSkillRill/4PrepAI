# 4PrepAI — Stress & QA Report

**Status: INTERIM, 2026-10-07.** The campaign tooling is built and verified offline.
**No load scenario has run**: this machine's network DNS-filters both the app and its backend (§3.1).
Every number below is either measured (marked ✅) or derived from code (marked 📄). Nothing is guessed silently; estimates are labelled.

---

## 1. Verdict

1. **Can 4PrepAI handle 100 concurrent students today? Not determined by load testing yet.** The load runs couldn't start from this network. The code shows no write-side risk at 100 students (~2 writes/s). The read side (a multi-MB catalogue per screen) is the likely first failure.
2. **What breaks first, before any load:** on networks like this one, students **can't reach the app at all**. The ISP's DNS returns a dead address for both `*.vercel.app` and `*.supabase.co` ✅.
3. **What breaks first under load (expected, to be confirmed by A/B/C):** the full-catalogue endpoint on the shared-CPU Free database, then the **monthly egress cap**, which at the growth target would lock the project for the rest of the billing cycle 📄.

## 2. Results table

| Scenario | Status | p50 / p95 / p99 | Error rate | Notes |
|---|---|---|---|---|
| Step 0 — catalogue size | ⛔ blocked | — | — | Supabase host unreachable from this network |
| Step 0 — student view | ✅ measured | — | 100% | Chromium could not load `4-prep-ai2.vercel.app` (60 s timeout before first byte) |
| A Baseline | ⏸ not run | | | Tooling ready: `load/A_baseline.js` |
| B Stress ramp | ⏸ not run | | | `load/B_stress.js` |
| C Spike | ⏸ not run | | | `load/C_spike.js` |
| D Soak | ⏸ not run | | | `load/D_soak.js` |
| E Write storm | ⏸ not run | | | `load/E_writes.js` |
| F AI | ⏸ not run | | | 0 of 300 AI calls used, $0 spent |
| G Integrity | ⏸ not run | | | `e2e/reconcile.mjs` |
| H Races | ⏸ not run | | | 5 browser tests |
| I Resilience | ⏸ not run | | | 5 browser tests |
| J Tampering | ⏸ not run | | | 4 browser tests |
| K AuthZ | ⏸ not run | | | ~40 probes, `e2e/authz.mjs` |
| L Weak network | ⏸ not run | | | 3 browser tests |

## 3. Data-integrity and availability findings

### 3.1 CRITICAL — app unreachable on this network (DNS filtering) ✅

- **Evidence:** `results/step0-network.json`.
  - The system resolvers `79.137.196.192` and `79.137.248.105` answer `147.45.69.3` for both `pubhgajlqhdbpwqahtki.supabase.co` and `4-prep-ai2.vercel.app`.
  - `1.1.1.1` and `8.8.8.8` return the real Cloudflare/Vercel addresses.
  - TCP to `147.45.69.3` times out (curl exit 28).
- **Reproduce:** on this network, run `dscacheutil -q host -a name 4-prep-ai2.vercel.app`, then `dig +short @1.1.1.1 4-prep-ai2.vercel.app`, and compare.
- **Impact:** any student whose ISP uses these resolvers sees nothing. The browser never reaches 4Prep, so no 4Prep error message can be shown.
- **Unknown (owner to check):** which ISP this is, and how many of your students use it. If this is a major Uzbek ISP, it outweighs every load finding.
- **Note:** moving the frontend to `app.4prep.ai` alone would not fix it. The browser still calls `*.supabase.co` directly (`app/src/data/client.ts`).

### 3.2 HIGH — silent overwrite of a stored profile at sign-in 📄 (browser proof: `H5`)

- `resolveAccountProfile` (`app/src/auth/pendingAuth.ts:152-154`) saves **any** anonymous profile found in the tab over the student's stored profile, without asking.
- **Repro:** sign in on a device, complete the plan. Sign out, open `/intake` and answer with different scores. Sign in. The stored GPA/SAT/budget are replaced.
- This is lost student data (real scores entered earlier).

### 3.3 MEDIUM — queued support messages are lost when the tab closes 📄 (proof: `I3`)

- The offline queue lives in `sessionStorage` (`app/src/support/queue.ts:39-44`).
- The UI tells the student *"The message is queued in this tab and has not been sent"* (`SupportScreen.tsx`), so it is honest. But closing the tab drops the messages.

### 3.4 MEDIUM — consent timestamp is client-controlled 📄 (proof: `J1`)

- `saveStudentProfile` writes `consented_at: new Date().toISOString()` from the browser clock, and **resets it on every profile save** (`app/src/data/repository.ts:192`).
- The original consent time is lost, and a skewed or forged clock is stored as-is (no server default or check).

### 3.5 Homework submit is not transactional 📄 (proof: `H4`, `I1`)

- Four sequential client calls (row → Storage → file row → status) with compensating deletes (`repository.ts:468-541`).
- A crash or reload between steps can leave orphans. Severity depends on the test result.

## 4. Bottlenecks ranked by expected impact

| # | Bottleneck | Evidence | Why it ranks here |
|---|---|---|---|
| 1 | **Whole catalogue downloaded on every catalogue screen**, nested over 6 relations incl. all Scorecard programmes, no server-side paging or caching | `app/src/data/repository.ts:117-126` (`universitySelect` at `:43`); call sites in Search, Dashboard, SkillGap, Scholarships, Tools, Saved, and both comparison panels | Postgres builds multi-MB JSON per request on a **shared-CPU, 0.5 GB** Nano instance ([compute docs](https://supabase.com/docs/guides/platform/compute-and-disk)). Every screen visit repeats it. |
| 2 | **Free-plan egress cap** (5 GB uncached/month → restriction) | [Supabase egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress) | Break-even: 5 GB ÷ (1,500 students × 8 sessions × 4 catalogue loads) ≈ **0.1 MB per load**. The catalogue is far larger (the 210-university seed alone is 1.0 MB of SQL), so **the growth target is certain to exceed Free egress**, causing a weeks-long lockout. |
| 3 | **Counselor reads the full catalogue three times per question** (browser preflight + function + targeted lookup), and the function holds it in 256 MB / 2 s CPU | `CounselorScreen.tsx:86-95`; `counselor/index.ts:265`; [function limits](https://supabase.com/docs/guides/functions/limits) | CPU-time kills are likely under concurrency as the catalogue grows. |
| 4 | **Counselor only recognises 10 hard-coded universities** | `counselor/index.ts:62-73` | Not load, but wrong answers. Questions about ~200 Scorecard schools are refused (`prime.mjs` F3 measures it). |
| 5 | **Auth from shared IPs** (school Wi-Fi/NAT): 30 sign-ins / 5 min per IP | [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits) | A class of 100 signing in at once from one school IP: 70 are refused. This is the classroom spike (C) failure mode. |
| 6 | **Anonymous counselor limit keyed on IP** (8/min) | `counselor/index.ts:213-217` | The same school-NAT problem: one classroom shares 8 questions/min. |
| 7 | Main JS bundle 722 kB (201 kB gz) ✅ | `vite build` output | Weak devices (L). |

## 5. Security findings (K)

Not yet executed. Confirmed from code so far:

- **MEDIUM — global anonymous lead limiter is a denial-of-service lever.** `submit_lead` allows 30/h and 200/24 h for **all** anonymous visitors combined (`…0017_academy_handoff.sql:354`). Any one client can block every logged-out student's "talk to a human" request for up to a day. The SQL comment acknowledges the risk.
- **LOW — the public anon key was echoed into this session's tool output** during setup (a redaction mistake on my part). It is public by design (shipped in the JS bundle, protected by RLS), so no action is needed beyond awareness.
- **Positive (code review):**
  - RLS is enabled on all tables.
  - The QS ingest RPC is revoked from `public/anon/authenticated`.
  - `admin-api` does its own audited check.
  - No service-role key in client code.
  - `delete-account` acts on the JWT subject only (`verify_jwt = true`).

## 6. AI cost (estimate; F not run)

| Item | Value |
|---|---|
| Price basis | Sonar $1/M in + $1/M out, + $5 per 1k requests at low context ([pricing](https://docs.perplexity.ai/guides/pricing.md)) |
| Est. per live call | ~2k in + ~0.5k out tokens → **≈ $0.0075** (to be replaced by F0/F4 measurement) |
| Per student-session | 5 questions, no cache hits → **≈ $0.04** |
| Growth target | 1,500 students × 8 sessions/month → **≈ $450/month upper bound** (cache hits and off-topic refusals reduce it) |
| ⚠ Provider risk | Perplexity's changelog (July 2026): *"Sonar Chat Completions is now Agent API"*. The counselor still calls `/chat/completions` (`counselor/index.ts:378`). F0 checks whether it still works. |

## 7. Recommended fixes — status after the 2026-10-07 fix pass

Code changes are local and uncommitted. The migration is **written, not applied**, and the Edge Function is **not redeployed**.

| Severity | Fix | Status |
|---|---|---|
| CRITICAL | Make the app reachable from filtered networks | **Open (infrastructure).** Serve the frontend from `app.4prep.ai` (an A record, not a CNAME to `vercel.app`). Route the API through a domain you own, then re-test from the affected network: a Supabase custom domain CNAMEs to `*.supabase.co`, which a filtering resolver may still block. |
| CRITICAL (before growth) | Move off the Free plan | **Owner: Supabase Pro before production.** |
| HIGH | Stop shipping the whole catalogue per screen | **Fixed.** 5-min session cache for catalogue + sources (`repository.ts` `cachedLoad`); list query drops the 6 programme-outcome columns (`catalogueSelect`); outcomes still load on the profile page and are honestly labelled in list objects (`mapProgram`). |
| HIGH | Ask before replacing a stored profile at sign-in | **Fixed.** `resolveAccountProfile` returns a `conflict` instead of saving; `ProfileConflictBanner` lets the student keep or replace. |
| HIGH | Counselor recognises only 10 universities; loads the full catalogue per question | **Fixed.** `counselor/match.ts` matches the whole catalogue (longest name first, ambiguous short forms dropped), then loads evidence only for matched ids. Client preflight now does two small queries. **Needs `supabase functions deploy counselor`.** |
| MEDIUM | `consented_at` from the client clock, overwritten every save | **Fixed in migration** `20261007120000_profile_consent_server_time.sql` (trigger; server time on insert, immutable after). Proof script: `supabase/tests/profile_consent_rollback.sql`. **Needs applying.** |
| MEDIUM | Support queue lost on tab close | **Fixed.** Queue in `localStorage` per user, cleared on sign-out/account deletion; copy updated. |
| LOW | `PHI_VERSION` mismatch in counselor cache key | **Fixed** (`phi-v0.3`). Also fixed a pre-existing Deno type error (`ParsedProviderPayload`). |
| MEDIUM | Global anonymous lead limiter | **Open.** Needs per-caller limiting behind an Edge Function; not changed blind, because I couldn't verify which client-IP headers reach Postgres. |
| MEDIUM | Classroom logins (30 sign-ins / 5 min / IP) | **Open (dashboard setting).** Raise in Supabase Auth → Rate Limits before class use. |
| LOW | Homework submit not transactional | **Open.** |
| LOW | Sonar Chat Completions → Agent API | **Open.** Verify with the F0 liveness call before migrating. |
| LOW | 726 kB main bundle | **Open.** |

## 8. What could not be tested, and why

- **All load and browser scenarios (A–L).** This network DNS-filters `*.supabase.co` and `*.vercel.app`. Pinning the real addresses was not attempted: it would bypass the network's filter.
- **Seed/teardown/reconcile/authz.** These need the service-role key in `qa/.env`, which only the owner should add. Fetching it through the CLI was (correctly) blocked.
- **Server-side evidence** (DB CPU, `pg_stat_statements`, function logs, advisors). The Supabase MCP connection timed out repeatedly.
- **Current egress usage this month.** Unknown, so the campaign's egress allowance is set conservatively at 1.5 GB.
- **Vercel plan limits.** vercel.com was unreachable from this machine.

**To finish the campaign:**
1. Run `qa/` from a cloud VM (ideally in Tokyo, near `ap-northeast-1`) with the service-role key in `qa/.env`.
2. Follow `qa/README.md` top to bottom.
3. Send me the `qa/results/` folder, and I'll complete this report.
