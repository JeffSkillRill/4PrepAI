# Codex Prompt — 4Prep: switch the catalogue to US universities

Copy everything below the line into Codex.

---

You are working on **4Prep** (`app/`), a university-pathway platform for Central Asian students. It runs on **Supabase** (you are connected) with a React 19 + TypeScript + Vite front end. The live database currently holds 10 universities across Kazakhstan, Uzbekistan, Hungary, Türkiye, Estonia and Germany.

**Task: replace the entire catalogue with United States universities.** Every university in the product must be in the USA when you are done. No non-US institution may remain.

Read `docs/DATABASE_STATE.md` first — it describes the live schema, RLS, and current contents. Keep it accurate; regenerate it when you finish.

## ⚠ Working directory — do not get this wrong

A previous session was run in a **separate copy of this project**, which produced two divergent versions of the app that had to be manually merged. Do not repeat that. Work **only** in the existing repository, in place.

The repository root contains `app/`, `docs/`, and the planning documents. **The exact layout is:**

```
<repo root>/
├─ app/                          ← the React app lives HERE
│  ├─ package.json               ← the only package.json; run npm from app/
│  ├─ src/                       ← all front-end code
│  └─ supabase/                  ← migrations, functions, seed  (INSIDE app/)
│     ├─ migrations/
│     └─ functions/counselor/
└─ docs/
   └─ DATABASE_STATE.md          ← at the REPO ROOT, not inside app/
```

Note the asymmetry, because it is easy to get wrong: **`supabase/` is inside `app/`, but `docs/` is at the repo root.**

Rules:
- **Do not** create a new project, a fresh scaffold, a parallel `app/` copy, or a second working folder anywhere.
- **Do not** create `app/docs/`, a root-level `supabase/`, or a second `package.json`. If you think one is missing, you are in the wrong directory — stop and re-check.
- Modify the files that already exist. There is exactly one git repository, at the repo root, on branch `main`.
- Before your first edit, confirm you are in the right place: `app/src/scoring/phi.ts`, `app/supabase/migrations/`, and `docs/DATABASE_STATE.md` must all already exist. If any is missing, stop and report rather than creating it.
- Commit locally to `main`. Do not push, do not open PRs, do not start a new branch.

## The rules that still apply (unchanged, non-negotiable)

1. **Never fabricate.** Every figure must come from an official source you actually retrieved. If you cannot find and cite a value, store it as an explicit **unknown** with a `reason` and a `suggested_action`. Never guess, never estimate, never round a number you didn't read.
2. **Every known fact carries a non-null `source_id`** pointing at a real `sources` row with the true official URL and retrieval date. The database CHECK constraints already enforce known-or-explicitly-unknown — do not weaken them.
3. **Sources must be `verification = 'verified'`** and must be official university pages (or official government/scholarship pages). Not rankings sites, not blogs, not aggregators.
4. **Do not edit existing migration files.** Add new, forward-only migrations.

## The affordability problem — read this before choosing universities

4Prep's students are Central Asian families with budgets around **US$5,000–15,000 per year**. US sticker price is **$40,000–$80,000+**. If you seed expensive universities without aid data, Φ's financial component scores near zero for every school and the product becomes useless — it will tell every student that nothing is affordable.

Therefore **institutional financial aid for international students is a required field, not optional.** A university record is incomplete without either a sourced aid/scholarship figure or an explicit unknown explaining that the university does not publish aid for internationals.

## Selecting the 10 universities

Choose **10 real US universities that actually admit and fund international undergraduates**, with a deliberate spread across these tiers (roughly 2–3 from each):

- **Need-blind / full-need for international students** (a very small set — e.g. institutions that publicly commit to meeting full demonstrated need for internationals).
- **Private universities or liberal arts colleges with large published merit scholarships for internationals.**
- **Public universities with published international merit awards** and comparatively moderate out-of-state tuition.
- **A community college with a published university-transfer (2+2) pathway** — this is often the only realistic route at a $8k budget, and it belongs in an honest catalogue.

Do not pick 10 universities of the same type. The catalogue must contain at least one genuinely reachable option for a student at the low end of the budget range. Record your reasoning for the mix in `DATABASE_STATE.md`.

## Schema changes required (new migration)

The current schema was shaped for European/Central Asian institutions and cannot express US admissions. Extend it:

**`requirement_kind` enum** — currently only `'ielts'`. Add at minimum: `'toefl'`, `'duolingo'`, `'sat'`, `'act'`, `'gpa'`. (Use `alter type ... add value`; note these cannot run inside the same transaction as their use, so sequence the migration correctly.)

**`university_fact_kind` enum** — add the facts US applicants actually need:
- `'room_board'` — on-campus housing + meals, which US universities quote separately from tuition.
- `'fees'` — mandatory student fees, quoted separately from tuition.
- `'total_cost_of_attendance'` — the university's own published COA figure.
- `'aid_international'` — published institutional aid/scholarship available to international undergraduates.
- `'test_policy'` — test-optional / test-required / test-blind, with the cycle it applies to.
- `'financial_certification'` — the amount an international applicant must document for the I-20 / F-1 visa.

Keep every one of these under the same known-or-explicitly-unknown constraint used by existing facts.

**Currency:** all US figures are `USD`. Do not mix currencies in the US catalogue.

## Data to capture per university

For each of the 10, source and store: tuition, mandatory fees, room & board, total cost of attendance, application fee, application deadline (state which round — Early Action / Early Decision / Regular Decision), intake term, language of instruction, aid available to international students, test policy, required English test minimums (TOEFL and/or IELTS and/or Duolingo), SAT/ACT expectations, and the F-1 financial certification amount. Plus at least one programme per university with its field and degree.

**Anything you cannot source stays unknown with a reason and a next action.** A record with 6 sourced facts and 4 honest unknowns is correct. A record with 10 invented facts is a product failure.

## Migration and cleanup

- Write a forward-only migration that **removes all existing non-US universities and their dependent rows** (facts, programmes, programme facts, requirements, university↔scholarship links) and any `sources` rows left orphaned. Respect FK order / rely on existing `on delete cascade` where present.
- Insert the new US universities, sources, programmes, requirements and scholarships in the same migration set.
- `saved_plans` references `universities.id`; deleting the old catalogue will cascade. Note this in your summary — it is acceptable now because there are 0 saved plans, but confirm the live count is still 0 before you run it.
- Apply the migrations to the live Production branch, then verify with live queries.

## Front-end consequences to handle

- **Φ v0.1 (`src/scoring/phi.ts`) is calibrated for cheap European tuition.** With US costs, re-check the financial component: it must account for aid (net cost), not just sticker price, or every score will be wrong. Update the component and its unit tests. Keep Φ deterministic, keep `PHI_VERSION` bumped, and keep the `TODO(EPIF)` marker.
- The UI shows tuition and intake on cards. With US data, **cost of attendance and aid matter more than tuition alone** — make sure a student can see net cost, not just the sticker number, and that the two are clearly labeled.
- Anywhere the UI assumes IELTS, it must now handle TOEFL/Duolingo/SAT too.
- Country filters, flags and any hardcoded country lists must reflect a US-only catalogue.

## Verification (all must pass)

- `npm run build` — zero TypeScript errors. `npx vitest run` — all tests green, including updated Φ tests.
- Live query proving **zero non-US universities remain** and 10 US universities exist.
- Live query showing, per university, its count of sourced facts vs explicit unknowns.
- Confirm RLS is unchanged and still correct: anonymous can read the catalogue; anonymous cannot read `student_profiles`. Re-run the `anon` test and report the result.
- Spot-check 3 universities by opening their cited source URLs and confirming the stored figure matches the page.

## Deliverable

A US-only catalogue live in Supabase, the schema extended for US admissions, Φ corrected for US costs, and the front end coherent with the new data. Regenerate **`docs/DATABASE_STATE.md`** covering: new row counts, the 10 universities with sourced-vs-unknown counts, your tier-mix reasoning, the new enum values, the migrations applied, and an updated **⚠ Needs Jeff** section. In your final message, list every figure you could not source and why.
