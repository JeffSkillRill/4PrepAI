# QA Audit — Jul 24, 2026

> Stage-1 review of the 4Prep repo (docs + `app/`). Verified by running the toolchain, not just reading: **`tsc --noEmit` passes (0 errors)**, **`vite build` passes (42 modules, 261 KB / 78 KB gzipped)**, **SSR smoke test passes 4/4**.
>
> **Framing:** the app is explicitly a Phase-1 UI prototype ("no backend, no auth; everything renders from mock data"). So there are no "build is broken" blockers — it compiles, builds, and renders with every state designed. The real blockers are the gap between this prototype and the brief's "done," which is what the 3-Month Plan addresses.

---

## ✅ Fix checklist (sorted by severity)

*Tick these off as you go. Severity, file, and rough hours are in each line. These are wired into the weekly plan where noted.*

### Serious
- [ ] **S1 — Results ignore intake answers.** `Intake.tsx:105` always attaches `samplePathway`; any off-sample profile gets the canned CS/Hungary/IELTS-6.5 result. Undercuts the "real, functional, demonstrable" bar tied to the EB-1A record. Real fix = Phase 2 (Week 3); interim honesty badge ~2h.
- [ ] **S2 — University profile shows a fit score with no profile, and contradicts itself.** `UniversityProfile.tsx` renders `sampleFitScores` (L132/274) *and* a "Fit score needs your profile" state (L288) at once; the fit reflects the *sample* profile while "how you compare" uses the *real* one — two students on one screen. ~1–2h (Week 3).
- [ ] **S3 — Budget filter and ranking disagree.** `Search.tsx:51–64` filters on tuition+living only, excluding scholarships, so the pathway's #1 pick (Danubia, $11,300) vanishes at an $8,000 ceiling even though the pathway calls it affordable. Looks like a data bug. Decide net-of-scholarship vs "sticker price" and label it. ~2–3h (Week 3).

### Minor
- [ ] **M1 — Em-dash for missing data**, violating your own rule: `UniversityProfile.tsx:140` (founded year), `Saved.tsx:99` (top match). ~15m (Week 8).
- [ ] **M2 — Compare & Saved ignore `devState`** — loading/error/offline undesigned there. ~1h (Week 8).
- [ ] **M3 — Duplicate saves**: saving the same plan twice appends twice (`Results.tsx:186`). Guard it. ~30m (Week 8).
- [ ] **M4 — Repo hygiene**: delete root `package-lock.json`, `.DS_Store`, `app/dist/`, `app/src/__smoke.tsx`; add `.gitignore`. ~30m (Week 1).
- [ ] **M5 — `fmtMoney` only symbolizes USD/EUR** though the type allows HUF/KRW/TRY/KZT/UZS. Fine now; will look off with real local-currency data. ~30m.
- [ ] **M6 — No linter, no test runner** beyond the smoke test. ~1h.

### Cleanup I left behind
- [ ] Remove `app/.smoke-out/` — a build folder I created during the audit and couldn't delete (sandbox permission quirk).

---

## A. Inventory

**Root**
- `4Prep_AI_Roadmap_Brief.docx` — founder's v1.0 brief; source of truth (4 layers, 4 phases, working rules). Reference, finished.
- `4Prep_GroundTruth_Project_Proposal.docx` — ~40-page proposal reframing the project around an internal "Ground Truth" data-ops platform + Grounding Gateway. Finished as a doc, but proposes a *different stack/scope* than both the brief and the code.
- `codex-design-prompt.md` — prompt to redesign the app from mobile-only to a desktop Niche-style platform. Spec only; **not executed**.
- `package-lock.json` (86 bytes) — stray near-empty lockfile, no root `package.json`. **Dead — delete.**
- `.DS_Store` — macOS junk. **Dead — delete + gitignore.**

**app/ — the product (Vite + React 19 + TS + Tailwind v4, mock-data only)**
- `src/types/index.ts` — backend contract: `DataPoint<T>`, University/Program/Scholarship/FitScore/Pathway/AIResult. **Finished, high quality — strongest asset.**
- `src/mock/sample-data.ts` — 4 fictional universities, 7 scholarships, 1 profile, 4 fit scores, 1 pathway. Finished; minor internal issues.
- `src/state.tsx` — in-memory context (route/profile/pathway/saved/compare/devState/login). Finished; no URL routing, no persistence (by design).
- `src/components/primitives.tsx` — SourceChip, MissingValue, DataValue, FitScoreBadge/Breakdown/ExpandableFit, AIResponseBlock, skeletons, Empty/Error/Offline. **Finished, excellent — trust rules live here.**
- `src/components/UniversityCard.tsx`, `FilterSheet.tsx` — finished.
- `src/screens/` — Intake, Results, UniversityProfile, Search, Compare, Tools, Saved — all finished as UI; issues above.
- `src/App.tsx`, `main.tsx`, `index.css` — dev ribbon + state switcher + bottom nav + routing; theme tokens. Finished.
- `scripts/smoke.tsx` — 11-line SSR smoke test, 4 assertions. Finished, passes.
- `src/__smoke.tsx` — intentionally empty pointer comment. **Effectively dead.**
- `app/dist/` — stale build from Jul 22 (pre-existing). **Dead — gitignore/delete.**
- Config + `README.md` — finished; README is genuinely excellent. No lint/test scripts.

**Finished / half-built / dead:** the entire 7-screen mobile UI, trust primitives, type contract, dataset, dev-state system, build + smoke — finished. Nothing is half-*coded*. What's half-built is the *product*: no backend, no auth, no real Φ, no real AI, and intake→results is a fixed fixture. Dead to delete: root `package-lock.json`, `.DS_Store`, `app/dist/`, `app/src/__smoke.tsx`, `app/.smoke-out/`.

## B. QA findings (test cases)

| Area | What I checked | Result |
|---|---|---|
| Build & type-check | Ran `tsc --noEmit` + `vite build` | **PASS** (0 TS errors, 42 modules, 78 KB gz) |
| SSR render | Ran smoke test | **PASS** (ribbon, intake Q1, progress, nav) |
| Intake → Results nav | Traced | **PASS** |
| Save → appears in Saved | Traced | **PASS** |
| Compare add/remove, cap 3 | Traced | **PASS** |
| "No IELTS yet" path | Traced | **PASS** (first-class, tailored note) |
| Compare <2 unis / 0 search results | Traced | **PASS** (designed empty states) |
| Off-sample profile | Traced | **FAIL (integrity)** — inputs ignored (S1) |
| Error/loading/offline/refusal states | Traced | **PASS** on Results/Search/Tools/Profile; **FAIL (minor)** on Compare/Saved (M2) |
| Auth / permissions | Traced | **N/A by design** — simulated login only (Phase-3 gap) |
| Every number carries a source | Traced | **PASS** — structurally enforced by `DataValue` |
| Mock cost totals vs fit reasons | Checked | **PASS** — internally consistent |
| "No em-dash for missing data" rule | Checked | **FAIL** — 2 spots (M1) |
| Fit shown without profile | Traced | **FAIL** — contradictory (S2) |
| Performance at 10× | Reasoned | **PASS** at N=4; **CAN'T TELL** at 300+ (no pagination; revisit at data-fill) |
| Mobile responsive | Traced | **PASS** (careful: safe-area, 44px targets, focus-visible, aria) |
| Desktop | Traced | **FAIL vs intent** — capped ~448px; desktop redesign unbuilt |

## D. Risks that could force a rewrite later
- **R1 — Three conflicting stack stories.** Brief = Lovable/Supabase; proposal = Next.js + Node Φ service on Fly.io; code = Vite + React 19, no backend. Two are throwaway. Pick the real target in Week 1. **#1 month-3 risk.**
- **R2 — Desktop redesign not started.** Build depth on the mobile shell then run the redesign = re-touch all 7 screens. Sequence, or pay twice.
- **R3 — No source control.** No `.git` here at all. Init git + remote in hour one.
- **R4 — In-memory routing.** No URLs/persistence; every `navigate({name})` reworks when accounts/deep links land (Phase 3). Cheap now.
- **R5 — No Φ engine exists.** Fit numbers are hand-authored. Until Φ is real code tested against the paper, the "defensible/calibrated" claim can't be made. Load-bearing for everything downstream.

## E. Naming & coherence
Product language is consistent and good ("pathway," "fit score," "sourced"); the student-facing "fit score" correctly hides the internal EPIF/Φ name. Three flags:
1. **"Ground Truth" appears nowhere in the code** — the proposal's platform isn't built; the app is Layer-3 only. Write one sentence: *app = Layer-3 prototype; Ground Truth = the unbuilt Layer-1 + contract.*
2. **Lovable vs Vite** — brief calls it a Lovable project; repo is Vite. Pick one canonical, retire the other reference.
3. **"Three months" is hedged in your own proposal** (flagged as an assumption, not a committed deadline). You're treating it as hard — worth being explicit with yourself.
