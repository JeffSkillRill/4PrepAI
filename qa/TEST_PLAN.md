# 4PrepAI — Stress & QA Test Plan (Phase 1)

Status: **DRAFT, awaiting owner approval.** Nothing in this plan has been executed.
Inputs: `qa/SYSTEM_MAP.md` (Phase 0).

---

## 0. Ground rules for this campaign

### 0.1 Environment decision (owner-authorised, 2026-10-07)

The owner confirmed there is **no QA Supabase project**. All testing targets the single live project `pubhgajlqhdbpwqahtki`, with written permission.
Hard Safety Rule 1 is therefore **waived by the owner**. To keep real students safe, this plan replaces it with the guardrails below.

| Target | Value |
|---|---|
| Frontend | `https://4-prep-ai2.vercel.app` |
| Supabase | `https://pubhgajlqhdbpwqahtki.supabase.co` (**PRODUCTION**, Free plan per `app/CLAUDE.md`) |

Every script prints both values and the word `PRODUCTION` before it starts. It refuses to run unless `QA_ALLOW_PRODUCTION=yes-owner-approved` is set in the shell for that run.

### 0.2 Production guardrails (apply to every scenario)

1. **Egress budget, the binding constraint.** The Free plan includes 5 GB uncached egress/month. Exceeding it leads to a grace period, then **project restriction until the next billing cycle** ([Supabase: Manage Egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress), [Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq)). That would be an outage for real students lasting weeks, not seconds.
   - Phase 2 Step 0 measures the real catalogue response size (1 anonymous request, compressed and uncompressed).
   - From that number, `qa/load/budget.js` computes every scenario's projected egress. The campaign total must stay under a **ceiling the owner sets.** Proposal: **≤ 2.0 GB, and ≤ 50% of what's left this month.**
   - Each k6 run tracks `data_received` live and **aborts at its scenario's egress allowance.**
2. **Auto-abort (k6 `abortOnFail`)** at any of:
   - HTTP error rate > 5% over 30 s
   - catalogue p95 > 3× the Scenario A baseline
   - any 5xx burst > 20/10 s

   Exception: Scenario B *intends* to find the break, so it aborts **at** the first crossing and ramps to zero within 10 s. Real users should see at most ~60 s of degradation.
3. **Watchdog.** A separate process probes the public catalogue as a normal anonymous user every 10 s with a tiny `limit=1` query. If that probe fails 3 times in a row, it kills k6. This is our proxy for "real students are hurting".
4. **Run window.** Run only in the lowest-traffic window the owner chooses. Avoid 03:30–03:45 UTC (`pg_cron` retention jobs, `…0017_scheduled_retention.sql`).
5. **No anonymous writes.** Every write is made by a seeded `qa_load_*` user, so teardown can find it. Exceptions are explained in §0.4.
6. **Shared global limiters are never exhausted on production.** The anonymous lead limiter is global (30/h for all anonymous users, `…0017_academy_handoff.sql:354`). Exhausting it would block real students' lead requests, so scenario K proves it **analytically and with a single probe only.**
7. **AI budget:** $5 / 300 calls, with a hard counter in `qa/load/ai-ledger.json`. Every call that could reach Perplexity is counted before it is sent.

### 0.3 Scope adaptation (no test-taking engine exists)

Per Phase 0 B2, the test flow (start test → autosave → timer → submit) does not exist.
Unless the owner points to another codebase, every scenario is mapped to the **real** student flows:

| Brief concept | Mapped to |
|---|---|
| "Start test" | Open app → Search/Dashboard (full catalogue load + Φ ranking) |
| "Load questions" | Catalogue + university profile + learning track reads |
| "Answer / autosave" | Profile save, save/unsave universities, lesson complete, **support offline queue** (the only real queued-write mechanism) |
| "Submit" | Homework assignment submit (multi-step: row → Storage upload → file row → status) |
| "Results" | Ranked pathway (`getRankedPathway`) and the profile fit rationale |
| "Timer" | None exists. **J is re-scoped to client-clock and local-state tampering** (`consented_at` is written from the client clock, `retryNotBefore` is client-side, the pending-auth profile lives in sessionStorage) |
| "AI features" | `counselor` Edge Function (chat → Perplexity) and `profile_rationale` (deterministic, no AI) |

### 0.4 Test users and data

- Seed: `qa/seed/seed.ts` creates `qa_load_0001@test.local … qa_load_NNNN@test.local` through the Admin API (`auth.admin.createUser`, `email_confirm: true`), so **no email is sent** (built-in SMTP allows 2/h).
  It writes a deterministic `student_profiles` row per user and records the user IDs in `qa/.state/users.json` (gitignored).
- Tokens: password sign-in is limited to 30/5 min per IP ([Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)), so minting 1,500 sessions would take ~4 h. Options, owner to pick:
  - **(a)** Sign JWTs locally with the project JWT secret, if the project still has an HS256 secret. No auth calls needed.
  - **(b)** Pre-mint at the allowed rate before the run, then refresh (150/5 min per IP).
  - **(c)** Cap concurrent *authenticated* virtual users at the pool size we can mint, and make the rest anonymous browsers.
- Writes tagged for teardown:
  - Everything authenticated is owned by a `qa_load_` user ID.
  - Leads (single probe only) use contact `qa_load_lead@test.local`.
  - Support messages start with `[qa_load]`.
  - Storage objects live under the user-ID prefix.
- Teardown (`qa/teardown/teardown.ts`):
  - Delete each seeded user via `auth.admin.deleteUser` (FK cascades remove profile, plans, support, learning, counselor rows; verified in Phase 2 Step 0 by reading the FKs).
  - Remove their Storage objects, and delete leads whose contact matches `qa_load_%`.
  - Then **assert zero rows** referencing seeded IDs in every user-linked table, and zero `qa_load_` auth users.
- Unavoidable residue: anonymous `counselor_requests` rows from the watchdog/anonymous browse VUs carry only a salted IP hash. Teardown cannot attribute them safely, so they are **left for the built-in 7-day retention job** (`…0007_counselor_hardening.sql:165`) and reported.
- Secrets in `qa/.env` (gitignored): `QA_SUPABASE_URL`, `QA_SUPABASE_ANON_KEY`, `QA_SUPABASE_SERVICE_ROLE_KEY`, optional `QA_SUPABASE_JWT_SECRET`. No Perplexity key is needed: AI calls go through the deployed function.

---

## 1. Virtual-student journeys (shared by A–E)

Think times are randomised. Every request sends `Accept-Encoding: gzip, br`, as browsers do.

| Journey | Mix | Steps (calls from SYSTEM_MAP §2) | Iteration length |
|---|---|---|---|
| **J-Browse** (anonymous) | 30% | static shell (once) → `sources` → **catalogue** → 2× `getUniversity` profile → think | ~3 min |
| **J-Student** (authenticated) | 55% | restore (`student_profiles`, `saved_plans`) → Dashboard (**catalogue** + Φ) → 2× profile + `profile_rationale` → save 2 / unsave 1 → learning reads → 1 lesson complete → think | ~4 min |
| **J-Support** (authenticated) | 10% | J-Student lite + support page **polling every 15 s** + 1 queued message per 5 min | continuous |
| **J-Counselor** (authenticated) | 5% (A/D only) | ask 1 question per 4 min from the **cache-prime bank** (see F). **0 Perplexity calls** in A–E | ~4 min |

Every write is logged client-side to a per-VU **write ledger** (`qa/results/ledger/<vu>.jsonl`): op, key, intended value, client timestamp, HTTP status, server response. G reconciles against it.

---

## 2. Load scenarios (k6, protocol level)

`C` = measured MB per catalogue load (on the wire). The egress column uses an **illustrative C = 0.6 MB** (≈ 4 MB of JSON gzipped). Phase 2 Step 0 replaces it with the measured value, and anything over budget is shrunk before running.

### A. Baseline

- **Simulates:** realistic peak, 100 students active in the same session.
- **Shape:** ramp 0→100 over 2 min, hold **15 min**, ramp down 1 min. Journey mix per §1.
- **Metrics:**
  - per-endpoint p50/p95/p99
  - error rate by status
  - `data_received`
  - DB CPU, active connections, pooler clients (from the Supabase dashboard/metrics endpoint)
  - top queries by total time (`pg_stat_statements`)
- **Egress (est.):** ~100 VUs × ~5 catalogue loads × C ≈ **0.3 GB**.
- **Pass:**

| Metric | Proposed threshold |
|---|---|
| Small reads (profile, saved, sources, support poll) p95 | < 800 ms |
| **Catalogue / ranked pathway p95** | **< 2,500 ms** (proposed separate threshold: it's a multi-MB nested aggregate, and the default 800 ms would fail by design. Owner to decide.) |
| Writes p95 | < 1,500 ms |
| Error rate | < 1% |
| Lost writes (G) | 0 |

### B. Stress ramp

- **Simulates:** finding the breaking point toward the 1,500-student growth target.
- **Shape:** +25 VUs every 2 min from 100, max 1,500.
- **Stop at the first of:** error rate > 5%, catalogue p95 > 3× A, the watchdog firing, or the egress allowance reached. Then ramp to 0 in 10 s.
- **Records:** the exact VU count and timestamp of the break, **which endpoint failed first**, and the failure mode. Expected candidates:
  - DB CPU saturation on the catalogue aggregate
  - pooler client cap of 200 ([compute docs](https://supabase.com/docs/guides/platform/compute-and-disk))
  - Edge Function 2 s CPU limit on `counselor`/`profile_rationale`
  - PostgREST 5xx/timeouts
- **Egress:** dominated by catalogue loads. Hard-capped by its allowance.
- **Pass/fail:** informational. It must report the break number. **FAIL if the break is below 100 VUs** (realistic peak) or below 300 (3× safety margin, proposed).

### C. Spike: "the whole class opens the app at once"

- **Shape:** 0 → **100 VUs within 5 s**. Each VU does an immediate cold start (shell + `sources` + catalogue + private restore), then J-Student for 3 min.
- **Repeat:** at **300 in 5 s** (3×) after a 5 min cooldown, if A/B leave headroom.
- **Metrics:**
  - time-to-catalogue for the first and last VU
  - errors in the first 30 s
  - auth/token errors
  - pooler queueing (connection wait)
- **Pass:**
  - p95 cold-start catalogue < 5 s
  - error rate < 1%
  - no VU left on an error state without a successful retry

### D. Soak

- **Shape:** 100 VUs for **60 min**, journey mix per §1, J-Support polling all the time.
- **Watch:**
  - latency drift: compare p95 for minutes 0–10 with minutes 50–60
  - connection count drift
  - Edge Function memory/CPU errors
  - token refresh at ~60 min (default JWT expiry): every authenticated VU must refresh successfully once
- **Egress (est.):** ~100 × ~15 catalogue loads × C ≈ **0.9 GB**. The largest consumer. **If Step 0 measures C > 0.6 MB, D is cut to 30 min or 50 VUs first.**
- **Pass:**
  - p95 drift < +25%
  - zero refresh failures
  - connections stable (± 10%)
  - errors < 1%

### E. Write storm (the "autosave" analogue)

- **Simulates:** the most write-intensive real behaviour all at once.
- **Shape:** 100 authenticated VUs for 10 min. Each loops with no think time:
  - toggle save/unsave on 5 universities
  - profile upsert with changing values
  - lesson complete (idempotent upsert)
  - support send. The server rate-limits it via `send_support_message`, which is expected to answer `rate_limited` with `retry_after_seconds`; the VU must honour that.
- **Verifies:**
  - write throughput and latency under contention
  - that rate limiting returns 200 + `rate_limited` (not 5xx)
  - that idempotency keys (support/lead UUIDs) suppress duplicates
- **Note:** there is no client debounce to verify (none exists). The finding is *how many writes a realistic UI could generate* versus what the server allows.
- **Egress:** small (no catalogue loads).
- **Pass:**
  - write p95 < 1,500 ms, errors < 1%
  - every `rate_limited` response is well-formed
  - **0 lost / 0 duplicated** writes in G

### F. AI endpoint (`counselor`)

Calls are budgeted against the ledger: **$5 cap, 300 calls max.**
The function's provider URL is hard-coded (`counselor/index.ts:378`), so a true mock would need a code change, which is forbidden. Instead, the code paths that **never reach Perplexity** stand in for the mock:

| Step | What | Perplexity calls | Shape |
|---|---|---|---|
| **F0 — Liveness** | 1 real in-scope question about a catalogue-alias university (e.g. "How do Yale's essays work?"). **If it fails, every live AI step is skipped and the report says why. This checks the Sonar → Agent API migration risk.** | 1 | single |
| **F1 — Out-of-scope path** | Off-topic questions → rate limiter + regex scope gate only | 0 | 20 authenticated VUs, 3 min, ~1 req/s total |
| **F2 — Cache path ("mock")** | 1 priming call per question for 10 questions, then concurrent repeats → `take_counselor_cache_hit` (full DB path incl. the **3× catalogue reads**, no provider) | 10 | 50 VUs → realistic 25 req/min, then **3× = 75 req/min**, 5 min each |
| **F3 — Local refusal path** | Questions about Scorecard universities *not* in the 10-name alias list (e.g. "Caltech tuition") → expected wrong refusal (Phase 0 finding) | 0 | 20 requests; correctness, not load |
| **F4 — Live calibration** | Unique in-scope questions, realistic 25 req/min for 3 min | ~75 | real |
| **F5 — Live 3×** | 75 req/min for 2 min. Exceeds Perplexity's documented 50 req/min default ([changelog](https://docs.perplexity.ai/changelog)), so provider 429s are expected | ~150 | real |
| **Total live** | | **≈ 236 ≤ 300** | Est. ~$0.0075/call → **≈ $1.80** (verified on F0) |

- **Metrics:**
  - latency split into local path / cache path / live path
  - 429s from our limiter versus provider failures
  - 25 s timeout hits (`PERPLEXITY_TIMEOUT_MS`)
  - `counselor_requests.outcome` distribution
  - cost per call, from response token usage where returned
- **Pass:**
  - non-provider paths p95 < 1,500 ms
  - live p95 < 10 s, errors (excluding intended 429s) < 2%
  - every 429 carries `Retry-After`
  - **no unverified figure ever returned** (validator strikes logged)
- **Stop:** if the ledger reaches 300 calls or $5, the remaining live steps are skipped and logged.

---

## 3. Correctness under stress (Playwright, browser level, run while A/D/E load runs)

### G. Data integrity reconciliation (most important)

After A, D, and E, `qa/e2e/reconcile.ts` compares each VU's write ledger with the stored state, using the service role, read-only, seeded users only:

| Data | Expected | Reports |
|---|---|---|
| `saved_plans` | Final set = replay of acknowledged saves/unsaves in client order | lost / phantom / resurrected rows |
| `student_profiles` | Equals the **last acknowledged** upsert | lost update, stale overwrite (out-of-order) |
| `support_messages` | Each client UUID **exactly once**, server order = send order | lost / duplicate / reordered |
| `learning_progress` | Every acknowledged completion present once | lost / duplicate |
| `learning_submissions` + files + Storage | Each acknowledged submission has 1 row, 1 file row, 1 object. Every failed one has **none** (compensating deletes worked) | orphans, half-submits |

- Any acknowledged write that's missing = **CRITICAL**.
- Unacknowledged writes (timeouts) are classified separately: applied or not, and whether the UI told the truth.

### H. Race conditions

1. Double-click **save** on the same university (twice within 20 ms). Expect 1 row, consistent UI.
2. **Two tabs, same user**: tab A saves X while tab B unsaves X. Then reload both. Expect convergence, with UI matching the DB.
3. **Double-click "Send"** in support, and the same queued UUID sent from two tabs. Expect exactly one message (idempotency).
4. **Double-click homework submit**, and submit while a previous upload is mid-flight. Expect one submission with no orphan objects.
5. **Login race**: an anonymous profile in sessionStorage while a stored profile exists, then rapid login → logout → login (guards at `App.tsx:227-276`). Expect no cross-user data shown and no stored profile overwritten without intent.
6. **Intake submit during private-data restore** (slow network). Expect the final profile = the intake answers.

### I. Resilience

1. Reload mid homework upload. Expect no half-submission (row without file or object), and a retry succeeds.
2. **Offline 30 s with 3 queued support messages**, then reconnect. Expect all 3 delivered exactly once, in order.
3. **Close the tab with queued support messages, then reopen.** The queue is in **sessionStorage** (`support/queue.ts`), so we expect them **lost**. If confirmed, it's reported as student data loss. (Severity is for the owner to judge: these are support messages, not answers.)
4. **Access token expires mid-session** (force an expired JWT): the next write must refresh and succeed. No silent failure, no logout loop.
5. Kill the network mid **profile save**. Expect the UI to report failure truthfully, and a retry to succeed.

### J. Client authority and tampering (re-scoped "timer integrity")

1. Skew the client clock by ±2 days, then save the profile. **`consented_at` is written from the client clock** (`repository.ts:192`). Records whether the server accepts a future/past consent time.
2. Skew the clock with queued support messages (`retryNotBefore` is computed on the client). Expect the server rate limit to still hold.
3. Tamper with the sessionStorage pending-auth profile (out-of-range GPA/scores, extra fields), then log in. Expect DB constraints to reject invalid values (check constraints from `…0019_profile_real_scores.sql`).
4. Tamper with the support queue's `userId` to another user's ID. Expect the server to reject sending as someone else.
5. Pause JS for 5 min (DevTools) with the support page open, then resume. Expect no burst of duplicate sends.

### K. Authorization under load (run during A)

Student A's token (and the anon key) attempt **direct PostgREST/Storage/RPC/function calls** against student B's data. **Every one must fail** (return 0 rows, 401/403, or an RLS error):

| Target | Read | Write |
|---|---|---|
| `student_profiles` (B) | ✔ | upsert as B |
| `saved_plans` (B) | ✔ | insert/delete for B |
| `support_threads` / `support_messages` (B) | ✔ | `send_support_message` posing as B; insert directly |
| `learning_progress` / `learning_submissions` / files (B) | ✔ | update B's submission status |
| Storage `learning-submissions/<B>/…` | download | upload/overwrite/delete |
| Storage `avatars/<B>/…` | (public read, by design) | **overwrite/delete B's avatar** |
| `counselor_requests` / `counselor_cache` / `counselor_strikes` / `leads` / `admin_*` | ✔ | ✔ |
| `admin-api` (non-admin A) | every action | must return uniform 403 + audit row |
| `delete-account` for B | — | must delete only the caller |
| RPCs | enumerate `rpc/*` exposed to anon/authenticated | each callable function checked for caller binding |

- **Lead limiter DoS** (global anonymous 30/h): proven by reading the SQL plus **one** probe submission (tagged). **Not exhausted on production** (it would block real students for up to an hour, per §0.2).
- **Pass:** 0 successful cross-user reads or writes. Any success = **CRITICAL**.

### L. Weak network / weak device

Playwright Chromium with CDP: **Slow 4G** (~1.6 Mbps down, 150 ms RTT) and **Fast 3G**, plus **CPU 4× slowdown**.

- **Measures:**
  - time to first university card (cold)
  - time to dashboard Φ ranking rendered (full catalogue download + parse + client Φ over ~210 universities)
  - main-thread long tasks
  - JS heap
  - whether the support queue/polling keeps up
  - whether a profile save completes with a truthful status
- **Pass (proposed):**
  - first card < 6 s on Slow 4G
  - dashboard ranked < 10 s
  - no long task > 1 s after load
  - no lost writes

---

## 4. Server-side evidence (collected during A–F)

| Evidence | How |
|---|---|
| DB CPU, memory, connections, pooler clients | Supabase dashboard metrics / Prometheus metrics endpoint (service role); screenshot fallback |
| Slowest queries | `pg_stat_statements` before/after diff (read-only SQL via service role or MCP) |
| Edge Function errors, CPU-limit kills, durations | Supabase function logs (`counselor`, `admin-api`, `delete-account`) |
| Auth errors / rate-limit hits | Auth logs |
| Advisors | Supabase security + performance advisors, before and after |
| Egress consumed | Usage page snapshot before/after, plus k6 `data_received` |

The Supabase MCP connection timed out earlier this session. If it can't be reconnected, I'll need the service role key in `qa/.env` (read-only SQL), or you'll export these metrics from the dashboard.

---

## 5. Tooling (all inside `/qa`, nothing imported by the app)

- `qa/package.json` (own deps: `@supabase/supabase-js`, `@playwright/test`, `tsx`)
- k6 installed via Homebrew (`brew install k6`; currently missing)
- Playwright Chromium via `npx playwright install chromium`
- `qa/README.md` with one-line commands per scenario
- `qa/results/<scenario>.json` written after each run

## 6. Run order and time estimate

Step 0 (measure size, verify FKs/cascades, snapshot usage + advisors) → seed → **F0** → A (+K, +G) → C → E (+H, +G) → D (+I, +J, +G) → F1–F5 → B (last: most disruptive) → L → teardown + zero-row check.
≈ 4–5 hours of wall clock, plus token minting if option (b).

---

## 7. Decisions needed before Phase 2

1. **Egress ceiling** for the whole campaign. Proposal: ≤ 2 GB **and** ≤ 50% of what's left this month. Please check *Dashboard → Organization → Usage* and tell me how much egress is used so far this cycle.
   **Alternative:** upgrade to Pro for the test window. Egress then becomes billed overage instead of a project restriction ([pricing](https://supabase.com/pricing)), and the 4.5 GB risk disappears.
2. **Run window** (lowest real-student traffic, your timezone).
3. **Catalogue threshold**: accept p95 < 2.5 s for the full-catalogue endpoints (vs 800 ms for other reads)?
4. **B's ceiling**: OK to ramp toward 1,500 on production, accepting up to ~60 s of degradation for real users at the break?
5. **Token strategy**: (a) JWT secret in `qa/.env`, (b) slow pre-mint, or (c) a smaller authenticated pool.
6. **Secrets**: put `QA_SUPABASE_SERVICE_ROLE_KEY` (and optionally the JWT secret) in `qa/.env` yourself. I won't ask you to paste them into chat.
7. **Scope**: confirm there is no separate test-engine codebase, so scenarios stay mapped as in §0.3.
8. **Tooling installs**: OK to `brew install k6` and `npx playwright install chromium`?
