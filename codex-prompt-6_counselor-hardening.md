# Codex Prompt — Harden the counselor for public launch (rate limit · cache · timeout)

Copy everything below the line into Codex.

---

## ⚠ Working directory — do not get this wrong

Work **only** in the existing repository, in place. A previous session ran in a separate copy and created two divergent versions that had to be merged manually. Do not repeat that.

```
<repo root>/
├─ app/
│  ├─ package.json          ← the only package.json
│  ├─ src/
│  └─ supabase/             ← migrations + functions live INSIDE app/
│     ├─ migrations/
│     └─ functions/counselor/index.ts
└─ docs/DATABASE_STATE.md   ← at the REPO ROOT, not inside app/
```

Do not scaffold a new project, create a parallel `app/`, add a second `package.json`, or create `app/docs/`. If a file you expect is missing, you are in the wrong directory — stop and report. Commit locally to `main`; do not push or branch. Add new **forward-only** migrations; never edit an applied one.

## Context

The counselor Edge Function is working and grounded. It is **not yet safe to expose publicly**:

- `supabase/config.toml` sets `[functions.counselor] verify_jwt = false`, so **anyone on the internet can invoke it anonymously**.
- There is **no rate limiting**, **no caching**, and **no timeout** on the Perplexity call.
- Every invocation costs real money (Perplexity is prepaid credit).

An attacker — or an accidental client-side loop — can drain the API balance. Fix this before the app is deployed to `app.4prep.ai`.

**Do not break the grounding guarantees while doing this.** After your changes, all of these must still hold:
- A figure not present in the supplied records is rejected and logged to `counselor_strikes`.
- An answer containing a figure but no valid citation is rejected.
- A question whose figure is stored as `unknown` refuses **before** calling Perplexity.
- The three answer types (`verified_fact`, `general_guidance`, `refusal`) are unchanged.

## Task 1 — Rate limiting (highest priority)

Keep the counselor usable without an account (anonymous browsing is a deliberate product decision), but stop abuse.

- Add a `counselor_requests` table (new forward migration): request id, nullable `user_id`, a caller key, `created_at`. Index it for fast time-window counts.
- **Caller key:** signed-in users key on `auth.uid()`. Anonymous callers key on a **salted hash of the client IP** (from `x-forwarded-for`). Store the hash, never the raw IP — this is personal data and the app has a privacy policy.
- Enforce two windows, e.g. **per-minute burst** and **per-hour total**, with signed-in users getting a higher allowance than anonymous. Put the limits in named constants at the top of the file so they are trivial to tune.
- On limit exceeded: return HTTP **429** with a friendly, designed message (not a raw error), and **do not call Perplexity**.
- RLS: the table must not be readable by `anon`. Writes happen server-side with the service role.
- Add a retention note — these rows are operational and should be pruned (e.g. delete rows older than 7 days); include the cleanup SQL in the migration or document it.

## Task 2 — Answer caching

Identical questions are common ("What is tuition at Harvard?") and currently cost a full API call every time.

- Add a `counselor_cache` table: cache key, the stored response payload, `created_at`, and a hit counter.
- **Cache key** = hash of (normalized question + the set of university IDs matched + `PHI`/prompt version). Normalize by lowercasing and collapsing whitespace. The key **must** change when the supplied records change, so a data correction can never serve a stale figure.
- Only cache `verified_fact` and `general_guidance` responses. **Never cache a refusal** — refusals are often caused by transient conditions and must stay live.
- TTL: default **24 hours**, in a named constant. Serve a cached answer without calling Perplexity; increment the hit counter.
- Add a way to invalidate: bump a `CACHE_VERSION` constant, and state in your summary that any catalogue migration should bump it.
- RLS: not readable by `anon`.

## Task 3 — Timeout and failure handling

- Wrap the Perplexity `fetch` in an `AbortController` with a **25-second** timeout in a named constant.
- On timeout, non-2xx, malformed JSON, or a provider outage: return the existing **designed refusal state** — never a raw error string, never a partial answer, never a web-sourced figure.
- Do not retry automatically more than once, and never retry a request that already produced a validator strike.

## Task 4 — Operational visibility

- Log to `counselor_requests`: whether the response was a cache hit, a live call, a rate-limit rejection, or a provider failure. This is what tells Jeff his real cost per question.
- Do **not** log question text containing personal details beyond what is needed; if you store the question for cache keying, store the hash, not raw prose tied to a user.

## Verification — paste real evidence

Run against the deployed function and paste actual output:

1. **Grounding still intact** — *"What is tuition at the University of Southern Mississippi?"* returns the sourced figure with citations.
2. **Unknown still refuses** — *"What is the minimum GPA for international students at Berea College?"* refuses, cites nothing, and does **not** call Perplexity.
3. **Cache works** — ask question 1 twice. Second response is a cache hit, is identical, and makes **no** API call. Show the hit counter incrementing.
4. **Rate limit works** — exceed the anonymous burst limit and show the 429 with the friendly message, and confirm no Perplexity call was made.
5. **Refusals are not cached** — confirm a refusal is re-evaluated live on repeat.
6. **RLS** — confirm `anon` cannot read `counselor_requests` or `counselor_cache`.

## Deliverable

Report the limits and TTL you chose and why, the estimated cost reduction from caching, the new tables with their RLS, and the migrations applied. Regenerate `docs/DATABASE_STATE.md` (new tables, columns, RLS, row counts, retention) and update **⚠ Needs Jeff** — including whether Jeff should set a hard spending cap in the Perplexity dashboard as a final backstop.
