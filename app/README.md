# 4Prep — app.4prep.ai frontend (Phase 1)

Mobile-first UI for the 4Prep pathway product. UI and interaction design only:
no backend, no auth, no API calls. Everything renders from `src/mock/sample-data.ts`.

## Run

```bash
cd app
npm install
npm run dev      # open the printed URL; use 375px viewport in devtools
npm run build    # type-check + production build
```

## What's here

Seven screens, all navigable from the bottom nav on a 375px viewport:

1. **Profile intake** — six steps, one decision per screen, progress bar,
   "no IELTS yet" as a first-class path.
2. **Pathway results** — AI strategy summary, ranked cards with expandable
   five-component fit breakdown, month-by-month plan, sticky save.
3. **University profile** — sourced costs, deadlines, programs, scholarships,
   and "how you compare" against requirements from the entered profile.
4. **Search & browse** — budget ceiling, country, field, language, IELTS,
   open-deadline filters in a bottom sheet.
5. **Compare** — 2–3 universities as horizontally paged, snap-scrolling columns.
6. **Tools** — five AI tools with structured (never prose-wall) results and a
   designed refusal state each.
7. **Saved plans** — with logged-out and empty states.

## The rules, and where they're enforced

- **No invented data** — every fact lives in `src/mock/sample-data.ts` as a
  `DataPoint<T>`: either `known` with a `sourceId`, or `unknown` with a reason
  and suggested action. Universities are fictional composites; all sources are
  labeled `SAMPLE`. The amber ribbon renders on every screen.
- **Every number carries a source** — `<DataValue>` refuses to render a value
  without routing it through `<SourceChip>` (tap to see origin + retrieval
  date) or `<MissingValue>`.
- **Missing data is designed** — `<MissingValue>` renders the reason
  ("Not published by the university") plus a next action. No em-dashes, zeros,
  or estimates.
- **The AI can say it doesn't know** — set the dev-state switcher (in the
  ribbon) to `refusal` and open any tool: the counselor explains what data it
  lacks and asks a clarifying question instead.
- **No invented trust signals** — there are no marketing statistics anywhere;
  verified by grep in CI-able form (`grep -rni "students served\|success rate" src/`).

## Dev-state switcher

The dropdown in the amber ribbon forces every screen's designed states:
`loading · empty · partial · no_results · refusal · error · offline`.

## Structure

```
src/types/index.ts       — backend contract (DataPoint, University, FitScore, Pathway…)
src/mock/sample-data.ts  — the only place sample content lives
src/components/          — primitives: SourceChip, FitScoreBadge, FitBreakdown,
                           MissingValue, UniversityCard, FilterSheet, AIResponseBlock
src/screens/             — the seven screens
src/state.tsx            — in-memory routing + app state (no localStorage)
scripts/smoke.tsx        — SSR render smoke test
```

## Notes

- Fit score is never a bare number: `<ExpandableFit>` always exposes the five
  components with one-line plain-language reasons. The internal composite name
  does not appear in the student UI.
- State is held in React only (per constraint: no localStorage/sessionStorage).
- Out of scope, deliberately absent: auth, database, real AI, payments, i18n.
