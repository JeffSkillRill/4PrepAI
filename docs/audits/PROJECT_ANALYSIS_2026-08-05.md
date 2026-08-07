# 4PrepAI — Full Project Analysis

**Date:** 5 August 2026
**Method:** Cold read of the repository from scratch — every directory, all 16 migrations, all 4 edge functions, both frontends, all 7 `docs/` files, all 11 codex prompts, the QA audit, the hiring plan, and both planning workbooks. Build, tests, lint, and SSR smoke executed in a clean Linux sandbox against a fresh `npm ci` from the committed lockfile.
**Nothing was modified.** No migration applied, no deployment, no commit, no external system touched.

---

## 1. What this project is

4Prep is a mobile-first university-pathway product for Central Asian students applying to US universities. It is a monorepo containing three deployables and one database:

| Piece | Path | Size | Purpose |
|---|---|---:|---|
| Student web app | `app/` | 8,411 LOC | Public catalogue, Φ fit scoring, counselor, learning portal, accounts |
| Operator console | `admin/` | 1,416 LOC | Separate Vite deployable for one trusted operator |
| Edge functions | `app/supabase/functions/` | 2,844 LOC | `counselor`, `admin-api`, `delete-account`, shared admin auth |
| Database | `app/supabase/migrations/` | 2,889 lines, 16 files | Postgres schema, RLS, seeds, RPCs |
| Documentation | `docs/` + root | 4,278 lines | State, runbooks, plans, briefs, audits |

Stack: React 19.1.1, TypeScript 5.8.3 (strict), Vite 7, Tailwind v4, Supabase JS 2.110.8, Deno edge functions, Perplexity `sonar` as the only model call.

21 commits. Working tree clean. **`de046b7` ("feat: ship admin support chat") is committed locally but not pushed to `origin/main`** — consistent with the standing no-push instruction in `app/CLAUDE.md`, but it means one day of work exists only on this laptop.

---

## 2. Verified build state (I ran these)

The 3 August QA audit could not execute build/test/SSR because `node_modules` was macOS-installed and its sandbox was Linux. I hit the identical `@rollup/rollup-linux-arm64-gnu` failure, then worked around it by copying the source to a scratch directory and running `npm ci` from the committed lockfile. **These results are real, not inherited from documentation.**

| Check | `app/` | `admin/` |
|---|---|---|
| `npm ci` from lockfile | ✅ clean, 255 packages | ✅ clean |
| `npm run build` (`tsc -b && vite build`) | ✅ exit 0, zero TS errors | ✅ exit 0 |
| `npm run test` | ✅ **23 files, 249 tests, all passing** | ✅ 3 files, 13 tests |
| `npm run lint` (`--max-warnings 0`) | ✅ exit 0 | ✅ exit 0 |
| SSR smoke (`node .smoke-out/smoke.js`) | ✅ rendered 5,526 chars without a live DB | n/a |

The lockfile is reproducible and the project is genuinely green. `app/CLAUDE.md` says "21 files, 243 tests" — mildly stale, the real numbers are higher.

**One build observation:** the main chunk is **588 kB (164 kB gzipped)**, above Vite's 500 kB warning. Only `DashboardScreen` and `SupportScreen` are lazy-loaded. For a product whose stated user is "a 17-year-old reading on a phone in a second language" on Central Asian mobile networks, that is the wrong shape. `lucide-react` and the Supabase client are the likely bulk. This is a half-day fix with `manualChunks` plus lazy-loading the learning and counselor routes.

---

## 3. Architecture

### Frontend

`App.tsx` (565 lines) is the single root: it owns view state, profile, pathway, saved set, and private-data loading, and switches on a `View` union. Routing is hand-rolled — `routes.ts` maps `View` ↔ path and drives `history.pushState`; `AppLink` renders real `<a href>` so Cmd-click and middle-click work. No router library. At this size that is a defensible choice, but `App.tsx` is the file that will resist a second engineer, and it already carries 15 `useState` hooks and 8 `useEffect`s.

Data access is properly layered: `data/repository.ts` (516 lines) is the only module that talks to Supabase, `data/mappers.ts` converts rows to `DataPoint<T>`, `DataProvider` supplies sources by context, and screens never touch the client. Φ scoring lives in `scoring/phi.ts` as a pure, versioned, unit-tested function.

### Backend

The counselor edge function is the most carefully built thing in the repository. Its request path is: rate-limit RPC → regex scope gate (before any provider call, so an off-topic question costs one regex pass) → catalogue retrieval → deterministic answer for targeted factual questions (never reaches the LLM) → cache lookup → Perplexity with `disable_search` when records exist and `temperature: 0` → figure validator → strike log on failure. Every branch writes an outcome to `counselor_requests`.

`admin-api` runs its own uniform authorization (`verify_jwt=false` by design so that missing, expired, non-admin, and revoked callers all get the same audited 403), rate-limits before authorizing, audits denials, and only reaches student data after an active grant is proven. Origin is allow-listed via `ADMIN_ALLOWED_ORIGINS`. This is a genuinely good server-side boundary.

`delete-account` removes storage objects in batches of 100, then submissions, threads, files, profiles, plans, progress, then calls `auth.admin.deleteUser`, then re-counts every table to verify. Thorough.

---

## 4. The real asset: the provenance architecture

This is what separates the project from every other "AI college advisor."

`DataPoint<T>` is a discriminated union: `{status:'known', value, sourceId}` or `{status:'unknown', reason, suggestedAction}`. There is no third state and no fallback. A known value must carry a real `sourceId`; an unknown one must explain itself and say what would close the gap. Values reach the screen only through `DataValue` → `SourceChip` or `MissingValue`. Zero, em-dash, and estimate are banned as fallbacks.

Crucially this is **enforced at the database level with check constraints**, not just promised in TypeScript. 10 universities, 50 verified official sources, 110 facts, 60 requirements — with documented, reasoned gaps rather than filler.

**Ten universities with 50 verified sources and honest gaps is worth more than 300 scraped rows.** That judgment was correct and it is the only part of this product a competitor cannot copy in a weekend.

---

## 5. Security posture

Independently checked, and it is sound.

- **Secrets: clean.** No `.env` is tracked. No `.env` in any commit in history. No `service_role`, `pplx-`, or provider key anywhere in tracked files or in either built bundle. The only JWT in `app/dist` decodes to `role=anon`. `PPLX_API_KEY` exists in `app/.env` but is **empty**, and it is gitignored.
- **RLS enabled on all 25 public tables.** 38 policies. Owner-only (`auth.uid() = user_id`) on profiles, saved plans, submissions, submission files, progress, support threads and messages. Public read on catalogue tables only. Tables with RLS and *zero* policies — `counselor_cache`, `counselor_requests`, `admin_users`, `admin_audit_log`, `admin_api_requests` — are deny-all by default and reachable only by service role. That is the correct pattern, deliberately applied.
- **Storage policies check both folder ownership and `owner_id`**, with MIME and size caps enforced in the bucket policy, the object policy, the metadata table, and the UI.
- **No XSS surface.** Zero uses of `dangerouslySetInnerHTML`, `innerHTML`, or `eval` in application code. `SafeMarkdown` renders markdown without raw HTML.
- **A production guard exists in code.** `data/environment.ts` hard-codes the production project ref and blocks destructive operations in development unless `VITE_ALLOW_PRODUCTION_DESTRUCTIVE_OPERATIONS` is explicitly set. Good instinct, added in response to QA finding F-01.
- **`admin/index.html` carries `noindex, nofollow`.** Correct.

### The five QA findings that were open on 3 August are closed

I verified each in source rather than trusting the changelog:

| Finding | Status |
|---|---|
| F-02 counselor refuses legitimate guidance, logs false strikes | ✅ Fixed — `validateFigures` now exempts `general_guidance` when `records.length === 0`, and `shouldLogStrike` fires only for `verified_fact` |
| F-04 validator checks number presence, not field correspondence | ✅ Fixed — `semanticFields()` + `recordFieldMatches()` now require the figure's sentence context to match the record's field; `acceptance rate` is explicitly marked unsupported |
| F-06 nested `<main>`/`<h1>` in empty state | ✅ Fixed — `States.tsx` uses `<section>` with `sr-only` headings |
| F-07 no `aria-live` on search results | ✅ Fixed — `SearchScreen.tsx:132` |
| F-08 nav uses `<button>` not `<a href>` | ✅ Fixed — `AppLink.tsx` |
| F-09 raw markdown rendered literally | ✅ Fixed — `SafeMarkdown` |
| F-10 all web citations labelled "Web source" | ✅ Fixed — `webCitationDetails` |
| F-12 unknown routes silently render the catalogue | ✅ Fixed — `/404` route and `NotFoundScreen` |

The remediation was real and complete. That is worth saying plainly.

---

## 6. What I found that is not in any existing document

### 6a. `docs/DATABASE_STATE.md` contradicts itself about production state

This file is designated "the launch source of truth." It currently says all of the following:

- **Line 15:** the owner "applied the seven reviewed migrations" to Production, and a read-only list "confirmed matching local and Production versions through `202608050013`."
- **Line 29:** "The current ignored local app configuration points to the separate QA ref `forrvcsttklmpmfhxums`."
- **Line 183:** migration `012` "remains unapplied to Production."
- **Line 184:** migration `013` "is written and intentionally unapplied."
- **Line 185:** "the support migration remains unapplied to Production."

Line 29 is verifiably false right now — `app/.env` and `admin/.env` both point at `pubhgajlqhdbpwqahtki` (Production); only `app/.env.save` holds the QA ref. Lines 183–185 directly contradict line 15.

The QA audit's finding F-03 was exactly this class of error, it was closed, and the same drift has already reappeared four days later. **A source of truth that contradicts itself is worse than no source of truth**, because it licenses a confident wrong decision. The "Launch implications" and "How this state was observed" sections need to be rewritten as one dated narrative rather than appended to.

### 6b. `app/CLAUDE.md`'s migration list is missing three files

The "Migration files, in order" table lists 13 entries and jumps from `202608030012_admin_foundation` to `202608050013_support_chat`. It omits `202608040013_relational_indexes`, `202608040014_counselor_strike_request_fk`, and `202608040015_catalogue_search_index` — all three of which exist on disk and are discussed elsewhere in the same file. Anyone applying migrations from that list would skip three.

Separately, migration `0013` is used **twice** (`202608040013` and `202608050013`). Filename sort still produces the correct order, and Supabase keys on the full version string, so this is not a live bug — but it is a trap for the next person.

### 6c. Local development points at Production

`app/.env` and `admin/.env` both target `pubhgajlqhdbpwqahtki`. The Supabase CLI is linked to QA (`forrvcsttklmpmfhxums`) — deliberately, per `CLAUDE.md`. So **the CLI and the browser now point at different projects.** The in-code production guard means a dev session can't run destructive operations, but `npm run dev` still reads and writes live production rows, and any account created during testing is a real one. This was QA finding F-01; a QA project now exists, so switching `.env` back to it is a one-line fix.

Related: `app/dist/` on disk was built against the **QA** project while `app/.env` now points at Production. Stale artifact, gitignored, harmless — but do not deploy from it.

### 6d. `program_facts` has zero rows, and the intake promises four fields

The original seed (`202607270003`) populated `program_facts` for a Central Asian / European catalogue. Migration `202607280006` deletes that catalogue and replaces it with 10 US universities, inserting `programs` but **no `program_facts`**. Meanwhile `FlowScreens.tsx` offers the student four subjects: Computer Science, Business & Management, Engineering, Data & Analytics. Only Computer Science has any programme coverage.

A student who picks Engineering gets a promise the data cannot keep. Given that the product's entire premise is not making promises it can't source, this is the most on-brand-violating gap in the codebase.

### 6e. No OpenGraph tags, no favicon, no robots.txt

`app/index.html` has a title, description, viewport, and theme-color — and nothing else. Under the stated distribution model, this app will be shared as a link in WhatsApp and Telegram by the Academy. **Every one of those shares will render as a blank grey box.** Roughly 20 minutes of work sitting directly on the only distribution channel that exists.

### 6f. `/support` is missing from `app/vercel.json`

Every other route has an explicit rewrite. `/support` does not. The trailing `/(.*)` catch-all covers it, so nothing breaks — but the list reads as exhaustive and isn't.

### 6g. The 3-month plan workbook has stopped tracking reality

`docs/planning/4Prep_3-Month-Plan.xlsx` shows **42 of 45 tasks "Not started"**, including W1–W8 work that is demonstrably finished in code. The actual project has sprinted far past the plan; the plan has not been touched. `docs/planning/4Prep_3-Week-MVP-Plan.xlsx` is better maintained (7 Done, 2 In progress, 2 Not started). Either retire the 3-month workbook or bring it current — a tracker that says "not started" about finished work will cost you the next time you use it to decide something.

### 6h. Zero instrumentation

No Sentry, no PostHog, no Plausible, no analytics of any kind. Confirmed by grep. If the app's purpose is to feed the Academy, the funnel is invisible from the first day it is live.

---

## 7. The gap that dominates everything else

I re-ran the grep from the 1 August hiring plan. **It is still true four days later:**

> There is no connection whatsoever between the app and 4Prep Academy. No "talk to a counselor" CTA, no contact route, no consultation booking, no WhatsApp or Telegram handoff, no lead capture, no mention of the Academy anywhere in the UI.

Zero matches for `academy`, `whatsapp`, `telegram`, `mailto:`, `consultation`, or `book a call` across `app/src` and `admin/src`.

Under a free-platform model where revenue happens at the Academy, this is not a missing feature. It is the mechanism, and it does not exist. The engineering quality of everything above is high enough that this stands out sharply: a great deal of careful work has been done on a product that currently cannot pass a single person to the business that pays for it.

Everything else in this document is a day or less of work. This is the one that decides whether the other 168 hours return anything.

---

## 8. Honest scorecard

| Dimension | Assessment |
|---|---|
| Code quality | **Strong.** Strict TS, zero lint warnings, 249 passing tests, clean layering, no dead abstractions |
| Trust/provenance architecture | **Exceptional.** DB-enforced, not just promised. The genuine moat |
| Counselor safety engineering | **Exceptional.** Scope gate, retrieval-first, deterministic fact path, figure validator, strike audit, rate limit, cache. Better than most funded teams ship |
| Security posture | **Sound.** RLS everywhere, clean secrets, real server-side admin boundary, no XSS surface |
| Backend/edge functions | **Strong.** Audited, rate-limited, fails closed |
| Documentation | **Voluminous and drifting.** 4,278 lines; the designated source of truth now contradicts itself |
| Data coverage | **Thin and uneven.** 10 universities, `program_facts` empty, 3 of 4 offered subjects unsupported |
| Mobile performance | **Not yet addressed.** 588 kB main chunk for a phone-first product on slow networks |
| Observability | **Absent.** No monitoring, no analytics, no funnel |
| Business mechanism | **Absent.** No app→Academy path of any kind |
| Deployment | **Not live.** No public URL |

---

## 9. What I would do next, in order

**This week — cheap, high leverage:**

1. **Push `de046b7`.** One command. Removes the single-laptop risk on a day of work.
2. **Point `app/.env` and `admin/.env` at QA.** The QA project exists now; there is no remaining reason for a browser session to read production.
3. **Rewrite `docs/DATABASE_STATE.md` as one current dated statement** rather than an append log, and fix the missing three migrations in `app/CLAUDE.md`. Two documents, one hour, and every future decision rests on them.
4. **Add OpenGraph tags and a favicon.** Twenty minutes on your only distribution channel.

**Before any cohort touches it:**

5. **Build the Academy handoff.** Even the crudest version — one honest CTA and a Telegram/WhatsApp link with a source parameter — converts this from a portfolio piece into a lead source. Nothing else in this list matters as much.
6. **Add instrumentation** at the same time, so the handoff is measurable from day one.
7. **Fix the intake/data mismatch:** either seed `program_facts` for the other three subjects or reduce the intake to the fields you can actually source. The second option is free and consistent with the product's own rules.
8. **Confirm backups/PITR on a paid Supabase plan** before real student grades and budgets exist. Blast radius is one profile today; it will not be tomorrow.
9. **Split the bundle.** Lazy-load counselor and learning routes, `manualChunks` for vendor. Half a day, and it targets exactly the user you designed for.

**Structural, when you have help:**

10. Decompose `App.tsx` before a second engineer touches it.
11. Switch the public catalogue read to the `verified_universities` view before a data researcher imports the first unverified row — the view already exists and is unused; the policies still read base tables.

---

## 10. Bottom line

This is a well-engineered project. The provenance contract, the counselor hardening, and the security posture are better than a lot of funded seed-stage work, and the QA remediation was thorough and real — I checked each fix in source rather than taking the changelog's word. The build is green, the tests pass, and the secrets are clean.

What it is missing is not quality. It is **contact with reality**: it is not deployed, no one outside the founder has used it, nothing measures it, and it has no path to the business that pays for it. Those are all cheap to fix relative to what has already been built, and none of them get cheaper by waiting.

The documentation drift is the one thing I would treat as urgent beyond its apparent size. Three contradictory claims about production migration state, four days after the same class of error was formally closed, means the drift is systemic rather than incidental. At this level of care everywhere else, that is the failure mode most likely to actually hurt you.
