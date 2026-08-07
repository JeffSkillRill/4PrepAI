# Codex Prompt — 4Prep 3-Week Public MVP (Supabase + Perplexity counselor)

Copy everything below the line into Codex.

---

You are building the **public MVP of 4Prep**, a university-pathway platform for Central Asian students, in `app/`. Stack: **React 19 + TypeScript + Vite + Tailwind CSS v4**, with **Supabase** (you are already connected to it) and the **Perplexity API** for the AI counselor.

Today the app is a finished **UI prototype rendering entirely from mock data** (`src/mock/sample-data.ts`). There is no backend, no auth, and no AI. **In three weeks this must be live and public at app.4prep.ai.** Scope is deliberately tiny: 10 universities, one chat counselor, one fit score.

**Do NOT push to GitHub or open PRs.** Work on files only; commit locally.

## The rules that define this product (never break them)

1. **Never fabricate.** No invented universities, tuition, deadlines, scholarships, or statistics. If a value isn't known, render the designed "missing" state — never a zero, an em-dash, or an estimate.
2. **Every number carries a source.** Each fact is a `DataPoint<T>`: either `known` with a `sourceId` pointing at a real `sources` row, or `unknown` with a reason + suggested action. Values reach the screen only through `<DataValue>` → `<SourceChip>` / `<MissingValue>`.
3. **The fit score is never a bare number** — it always expands into the five components with plain-language reasons.
4. **The counselor may not invent facts.** See the grounding contract in Task 5. This is the single highest-risk part of this build.

Read `app/README.md` and `src/types/index.ts` first. **`src/types/index.ts` is the contract — keep its shapes.** If you must extend it, preserve the `DataPoint` union and justify it in your summary.

## Deliverable 0 — the database status file (do this, and keep it current)

You are connected to Supabase; I am not. So **you are my only window into the database.** Create and maintain **`docs/DATABASE_STATE.md`**, regenerated at the end of every task that touches the DB. It must always contain:

1. **Connection/project info** — project ref, region, environment (local vs cloud). **Never** include service-role keys, passwords, or secrets — names only.
2. **Every table** — column name, type, nullable, default, and FK targets.
3. **The provenance rule, table by table** — which fact-bearing columns carry a non-null `source_id`, and which are allowed to be null (with their `unknown` reason/action columns).
4. **RLS policies** — per table: is RLS on, what can `anon` read, what can an authenticated user read/write. Explicitly state whether a logged-out visitor can read student profiles (**it must be "no"**).
5. **Row counts per table** + the list of seeded universities (name, country, and how many of its fact fields are sourced vs unknown).
6. **Migrations applied**, in order, with filenames.
7. **A "⚠ Needs Jeff" section** — anything you couldn't do, anything requiring a dashboard click, keys I must supply, or decisions I must make.

Write it as plain Markdown a non-DBA can read. Also keep `supabase/migrations/*.sql` in the repo as the source of truth — never change the schema only through the dashboard.

## Tasks (in this order)

### 1. Repo hygiene
Add a proper `.gitignore` (`node_modules`, `dist`, `.env*`, `.DS_Store`, `*.log`, `.smoke-out`). Delete: root `package-lock.json`, `.DS_Store`, `app/dist/`, `app/src/__smoke.tsx`, `app/.smoke-out/`. Add `vitest` and a `test` script. Commit locally.

### 2. Supabase schema + RLS
Write migrations mirroring `src/types/index.ts`: `sources`, `universities`, `programs`, `requirements`, `scholarships`, plus scholarship↔university linkage. Rules:
- Every fact-bearing value is either **known with a non-null `source_id`**, or **explicitly unknown** with `reason` + `suggested_action` columns so `<MissingValue>` survives the round-trip.
- `sources` carries `name`, `url`, `retrieved_at`, `verification` (`unverified_sample` | `verified`).
- **RLS on every table.** Public/anon may read university/program/scholarship/source rows. Student profiles and saved plans are readable/writable **only by their owner**.
- Then regenerate `docs/DATABASE_STATE.md`.

### 3. Seed 10 real universities
Replace the fictional composites with **10 real universities** relevant to Central Asian students. For every figure (tuition, living cost, application fee, deadline, IELTS minimum, scholarships) you must record a real `source` row with the actual URL and retrieval date. **If you cannot find and cite a figure, store it as `unknown` with a reason — do not fill it in.** A partially-sourced record is correct; an invented one is a product failure. List what you sourced vs left unknown in `DATABASE_STATE.md`.

### 4. Φ v0.1 — the fit score (deterministic, NOT AI)
`src/scoring/phi.ts`: a **pure, deterministic, versioned** module exporting `PHI_VERSION`, a `PhiWeights` object, and `computeFit(profile, university, weights): FitScore` returning the five components (`academic, financial, language, career, geographic`), each 0–100 with a plain-language `reason`, plus `overall`.
- Simple, documented, defensible: e.g. language readiness from the student's score vs the university's minimum; financial fit from (tuition + living) vs budget, accounting for scholarships; geographic from the student's preference order.
- **The AI must never compute this.** Φ is deterministic so it is reproducible and auditable.
- Put every weight in one exported constant with a comment explaining it, and mark `// TODO(EPIF): calibrate against the paper's equations`.
- Unit-test with `vitest`: bounds 0–100, monotonicity, and correct handling of unknown inputs.

### 5. The Perplexity chat counselor — the grounding contract
Add a chat counselor UI (reuse the existing `AIResponseBlock` visual language) backed by the Perplexity API. **Perplexity searches the web, so left unconstrained it will answer university questions from random pages — which breaks rule 1.** Therefore:

- **Retrieve first, then ask.** On every user message, query Supabase for the relevant verified records and pass them into the prompt as explicit context with their citation IDs.
- **System prompt must state:** answer questions about tuition, fees, deadlines, IELTS/admission requirements, and scholarship amounts **only** from the supplied records. If the answer isn't in them, say so plainly and say what you'd need — **never** substitute a web figure and never estimate.
- **Two visually distinct answer types:** (a) *sourced facts* from our database, each rendering a `<SourceChip>`; (b) *general guidance* (essay tips, visa process, study advice) which may draw on Perplexity's web results and **must be labeled as general information, not verified 4Prep data**, with its web citations shown.
- **Refusal is a first-class, designed state**, not an error — reuse the existing refusal UI.
- **Post-response validator:** before display, scan for currency amounts, dates, and IELTS-style numbers; any such figure not traceable to a supplied record's citation must be stripped or the response replaced with the honest refusal. Log every strike so I can review.
- Keep the API key **server-side only** (a Supabase Edge Function or serverless route). It must never appear in the client bundle. Add `.env.example`; never commit real keys.

### 6. Wire all seven screens off mock data
Add `src/data/` (`client.ts`, `repository.ts`, `mappers.ts`, `DataProvider.tsx`) returning the existing types with `DataPoint`s intact. Then:
- **Intake** must actually drive results: on finish, fetch candidates and run Φ (`Intake.tsx:105` currently always attaches `samplePathway` — this is bug **S1**).
- Drive `loading / empty / error / no_results` from **real fetch state** on every screen, including Compare and Saved (bug **M2**).
- `<SourceChip>` must resolve sources from loaded DB rows, not the static import.
- No screen may import `src/mock/sample-data.ts` when you're done.

### 7. Fix the known bugs
- **S2** (`UniversityProfile.tsx`): it shows a sample fit score *and* a "needs your profile" message at once, mixing two different students. Compute fit for the entered profile; with no profile, show only the missing-state.
- **S3** (`Search.tsx:51–64`): the budget ceiling ignores scholarships, so a scholarship-funded top pick disappears under its own filter. Make the semantics explicit in the UI (label it "before scholarships" and/or flag "fits after scholarship").
- **M1**: replace the `"—"` fallbacks (`UniversityProfile.tsx:140`, `Saved.tsx:99`) with proper missing-states.
- **M3**: guard against saving the same plan twice (`Results.tsx:186`).

### 8. Auth, persistence, routing
Supabase Auth (email). Persist the student profile and saved plans per user, protected by RLS. Replace the in-memory router in `state.tsx` with real URLs so login redirects and deep links work. Update `DATABASE_STATE.md` with the new tables and their policies.

### 9. Ship it publicly
Production build on Vercel + Supabase prod; document the env vars I must set. Because this is **public with real student data (grades, budgets)**: confirm RLS blocks cross-user reads, add a privacy policy page and consent copy at signup, and turn on backups. Mobile QA at 375px. Verify the app is usable by a logged-out visitor browsing universities.

## Constraints
- **Do not** build the other four AI tools as real engines — leave them on sample content or hide them.
- **Do not** do the desktop/Niche redesign; stay mobile-first.
- **Do not** build an admin console, verification queue, or outcome ledger.
- **Do not** let AI compute the fit score, and **do not** invent data anywhere.
- **Do not** commit secrets. TypeScript stays **strict** with zero errors.

## Verification (all must pass)
- `npm run build` — zero TS errors. `npm run test` — Φ tests green.
- SSR smoke test passes (`npx vite build --ssr scripts/smoke.tsx --outDir .smoke-out && node .smoke-out/smoke.js`).
- Manual: complete intake with a **non-sample** profile → the ranked list and fit reflect *those* answers, every figure carrying a source chip.
- **Red-team the counselor:** ask it for a tuition figure you deliberately left `unknown`. It must refuse honestly and cite nothing. Paste the transcript into your summary.

## Deliverable
A public-ready MVP: real Supabase data, Φ v0.1, a grounded Perplexity counselor, auth, and all seven screens on live data — plus **`docs/DATABASE_STATE.md`** kept current. In your final summary give me: what changed per file, the migrations you applied, the red-team transcript, the exact env vars and dashboard steps I must do myself, and anything in **⚠ Needs Jeff**.
