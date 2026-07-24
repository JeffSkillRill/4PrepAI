# Codex Prompt — 4Prep "Make it Real" (Phase 2: backend + real data)

Copy everything below the line into Codex.

---

You are working on **4Prep**, a university-pathway platform for Central Asian students, in `app/`. Stack: **React 19 + TypeScript + Vite + Tailwind CSS v4**. Right now the app is a finished **UI prototype that renders entirely from mock data** in `src/mock/sample-data.ts`. Your job in this phase is to **replace that mock foundation with a real backend and make every screen run on real data** — without breaking the product's trust guarantees.

**Do NOT push to GitHub or open PRs.** Work on files only. Verify with `npm run build`, `npm run test`, and the SSR smoke test. Initialize a local git repo (see Task A) but do not configure remotes or push.

## The non-negotiable rules (these define the product — never break them)

1. **Never fabricate.** No invented universities, scholarships, tuition, deadlines, or statistics anywhere. If a value isn't known, it stays a designed "missing" state — never a zero, an em-dash, or an estimate.
2. **Every number carries a source.** Every fact-bearing value is a `DataPoint<T>` that is either `known` (with a `sourceId` pointing at a real `Source` row) or `unknown` (with a reason + suggested action). The UI renders values only through `<DataValue>` → `<SourceChip>` / `<MissingValue>`. Keep this intact.
3. **The fit score is never a bare number.** It always expands into its five EPIF components with plain-language reasons (`<ExpandableFit>` / `<FitBreakdown>`).
4. **Keep the "sample data — not verified" ribbon** and the dev-state switcher. Until a record is verified, it must still read as sample.

Read `app/README.md` and `src/types/index.ts` before writing code. `src/types/index.ts` is the backend contract — **treat it as the source of truth and do not change its shape** unless strictly necessary; if you must extend it, keep the `DataPoint` discriminated union and justify the change in your summary.

## What I will provide (and how to proceed if I haven't yet)

- **Supabase credentials** in `app/.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. If they're absent, **build against Supabase local dev** (`supabase init` / `supabase start`) and write everything so it works the moment real credentials are dropped in. Never hardcode or commit secrets; add `.env.example`.
- **The EPIF Φ equations** from my academic paper. If I haven't pasted them into this prompt, implement the Φ engine as a **documented, unit-tested stub** behind a stable interface (see Task F) with a `// TODO(EPIF): replace internals with paper equations` marker — so swapping in the real formula later changes no callers.

## Architecture to add

Introduce a clean data layer; keep the existing components and their rendering contract unchanged wherever possible.

```
src/data/client.ts        — Supabase client from env (single instance)
src/data/repository.ts     — async functions returning data already shaped into the existing DataPoint<T> types
src/data/DataProvider.tsx  — loads Sources into memory; exposes a sources lookup so <SourceChip> keeps working
src/data/mappers.ts        — map raw DB rows → University / Scholarship / Program / DataPoint<T>
src/scoring/phi.ts         — deterministic, versioned Φ engine (pure functions)
src/scoring/phi.test.ts    — unit tests (vitest)
supabase/migrations/*.sql  — schema
supabase/seed.sql (or seed.ts) — the current sample universities as seed data
```

Principle: **the repository returns the same `University`, `Scholarship`, `FitScore`, `Pathway` shapes the screens already consume.** Screens change from importing static arrays to calling async repository functions and holding results in React state — the JSX that renders each `DataPoint` should barely change.

## Tasks

### A. Repo hygiene + git
- `git init` in the repo root; add a proper `.gitignore` (`node_modules`, `dist`, `.env`, `.DS_Store`, `*.log`, `.smoke-out`, `app/dist`).
- Delete dead files: root `package-lock.json` (no root `package.json`), `.DS_Store`, `app/dist/`, `app/src/__smoke.tsx`, and `app/.smoke-out/` if present.
- Make an initial commit locally. Do not add a remote or push.
- **Acceptance:** `git status` clean-ish; dead files gone; `.env` is gitignored.

### B. Supabase schema + migrations + seed
- Write migrations that mirror `src/types/index.ts`: `sources`, `universities`, `programs`, `requirements`, `scholarships`, `cost`/`tuition` fields, plus join data for scholarships↔universities. **Every fact-bearing column that maps to a `DataPoint` must reference a non-null `source_id` when the value is known**, and support an explicit "unknown" representation (nullable value + reason + suggested_action) so `MissingValue` survives the round-trip.
- Add a `verification` field on sources (`unverified_sample` | `verified`) exactly as the type defines it.
- Enable **RLS**: the anon/read role can read rows, but design it so that later only `verified` rows are exposed to the public read path (for now, seed rows are `unverified_sample`, so the ribbon still shows).
- Convert the current contents of `src/mock/sample-data.ts` into **seed data** (SQL or a seed script) so the dev database is populated with the same four fictional universities, scholarships, and sources. Keep the "(sample)" naming and `unverified_sample` sources.
- **Acceptance:** running migrations + seed against a fresh Supabase (local or cloud) produces a database the app can read; the four sample universities appear with their sourced figures and their known "unknown" fields.

### C. Data-access layer + DataProvider
- `client.ts`: create the Supabase client from env; fail loudly with a clear message if env is missing.
- `repository.ts`: async functions — `listUniversities(filters)`, `getUniversity(id)`, `listScholarshipsForUniversity(id)`, `listSources()`, and a `getRankedPathway(profile)` that fetches candidates, runs Φ, and assembles a `Pathway`. Each returns the existing types with `DataPoint`s intact; map DB nulls/unknowns into `unknown(...)`.
- `mappers.ts`: pure row→type mappers, well-tested-friendly.
- `DataProvider.tsx`: on mount, load all `Source`s into memory and expose a `useSource(id)` hook (or populate a module cache) so **`<SourceChip>` resolves sources from loaded state instead of the static `sourceById` import**. Replace the `sourceById` import in `primitives.tsx` accordingly, keeping the component's props/behavior identical.
- **Acceptance:** no screen imports from `src/mock/sample-data.ts` anymore (that file becomes seed-only or is removed after seeding); `<SourceChip>` still shows origin + retrieval date from real source rows.

### D. Wire the seven screens off mock data (this kills bug S1)
Currently `Intake.tsx:105` always attaches `samplePathway` regardless of the six answers, so any off-sample profile gets a canned result. Fix the whole data flow:
- **Intake:** on finish, persist the profile to state and call `repository.getRankedPathway(profile)` → a **real** pathway computed from the entered answers. Keep the existing loading state (the dev-state `loading` design) while it resolves.
- **Results, Search, University Profile, Compare, Saved, Tools:** fetch via the repository; drive the existing `loading / empty / error / offline / no_results` designed states from **real fetch status** (Compare and Saved currently ignore `devState` — make them honor real loading/error too, which also covers bug M2).
- Search filters run against real data; the budget filter fix is in Task E.
- **Acceptance:** changing intake answers (field, geography, budget, "no IELTS") changes the ranked list and the fit scores; every rendered number still carries a source; no screen depends on `sample-data.ts`.

### E. Fix the two data-integrity bugs
- **S2 — contradictory fit (`UniversityProfile.tsx`):** today it renders `sampleFitScores` (a fixed sample) *and* a "fit needs your profile" message at once, and the fit reflects the sample profile while "how you compare" uses the real one. Fix: compute fit **for the entered profile** via Φ; when there is no profile, show only the `<MissingValue>` "complete intake to see your fit" state — never a sample score. One profile per screen.
- **S3 — budget filter vs scholarships (`Search.tsx:51–64`):** the ceiling filter uses tuition+living only and excludes scholarships, so a scholarship-funded top pick disappears under its own budget filter. Decide and implement clearly: filter on **sticker price** but **label the control "before scholarships"**, and/or add an explicit "fits after a scholarship" indicator. Whatever you choose, the filter's meaning must be unambiguous in the UI.
- **Acceptance:** a university with an unknown cost is never silently dropped without explanation; the budget control's semantics are labeled; no screen shows a fit score for a profile that wasn't entered.

### F. Φ scoring engine (scaffold + tests)
- `src/scoring/phi.ts`: a **pure, deterministic, versioned** module. Export `PHI_VERSION`, a `PhiWeights` type, and `computeFit(profile, university, weights): FitScore` returning the five components (`academic, financial, language, career, geographic`) each with `score` (0–100) and a plain-language `reason`, plus the `overall`. No randomness, no dates baked in beyond `computedAt`.
- If I supplied the EPIF equations, implement them faithfully and add unit tests that reproduce the paper's worked examples exactly.
- If I did **not** supply them, implement a clearly-documented placeholder that is monotonic and sane (e.g. language readiness rises as the student's score clears the minimum; financial fit rises as cost fits budget), mark it `// TODO(EPIF)`, and write tests that lock the **interface and sanity properties** (bounds 0–100, monotonicity, missing-input handling) so the real formula can drop in without breaking callers.
- Add `vitest` + a `test` script to `package.json`.
- **Acceptance:** `npm run test` is green; Φ is a pure function with a version stamp; callers depend only on its exported interface.

### G. Preserve the trust system and designed states
- Keep `<DataValue>`, `<SourceChip>`, `<MissingValue>`, `<ExpandableFit>`, `<AIResponseBlock>`, the amber ribbon, and the dev-state switcher. Restyle nothing; only change where their data comes from.
- Missing data must still round-trip from the DB as an `unknown` `DataPoint` and render via `<MissingValue>` — never as null/0/"—". While you're in the files, fix bug **M1** (the two `"—"` fallbacks at `UniversityProfile.tsx:140` and `Saved.tsx:99`) and bug **M3** (duplicate saves at `Results.tsx:186` — guard against saving the same plan twice).

## Constraints — do NOT do these
- **Do not** build the other four AI tools' real logic (Scholarship Finder as a standalone engine, Skill Gap, Country Fit, Career Projection) — leave their screens on sample content for now.
- **Do not** do the desktop/Niche visual redesign — this phase is data, not looks. Keep the current mobile-first UI.
- **Do not** build the Claude AI counselor or a claim validator yet (that's the next phase).
- **Do not** change the `DataPoint` contract's shape, remove the ribbon, or invent any data.
- **Do not** commit secrets; keep `.env` gitignored and provide `.env.example`.
- Keep TypeScript **strict** with **zero** errors.

## Verification (must all pass before you call it done)
- `npm run build` — zero TypeScript errors, production build succeeds.
- `npm run test` — Φ (and mapper) unit tests green.
- SSR smoke test still passes (`npx vite build --ssr scripts/smoke.tsx --outDir .smoke-out && node .smoke-out/smoke.js`) — the app must render server-side without a live DB (the intake screen shouldn't require data; guard the data layer so SSR doesn't crash).
- Manual check: run the app, complete intake with a **non-sample** profile, and confirm the ranked list, fit scores, and plan reflect *those* answers, with a source chip behind every number.

## Deliverable
All seven screens running on the real data layer, the Φ engine scaffolded and tested, S1/S2/S3 and M1/M3 fixed, git initialized and clean. When done, produce a short summary: **what changed per file**, the schema you created, how to run migrations + seed, exactly what you still need from me (Supabase creds and/or the EPIF equations), and any place you had to touch `src/types/index.ts` and why. Do not commit to a remote or push.
