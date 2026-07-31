# Codex Prompt — QA fixes + commit and push to GitHub

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
└─ docs/DATABASE_STATE.md   ← at the REPO ROOT, not inside app/
```

Do not scaffold a new project, create a parallel `app/`, add a second `package.json`, or create `app/docs/`. If a file you expect is missing, you are in the wrong directory — stop and report.

## Current state (verified before you start)

Build passes with zero TypeScript errors. **21/21 tests pass.** The SSR smoke test renders. The counselor is grounded and hardened (rate limiting, caching, timeout). No undefined design tokens, no debug code, no `any` types, no floating promises.

The bugs below are what a full QA sweep found. Fix them **without** breaking anything above.

**Non-negotiable — these must still hold when you finish:**
- A figure not present in the supplied records is rejected and logged to `counselor_strikes`.
- An answer containing a figure but no valid citation is rejected.
- A question whose figure is stored as `unknown` refuses **before** calling Perplexity.
- Every displayed number carries a source, or renders the designed missing-value state.

---

## B1 — SERIOUS: blank white page when environment is misconfigured

`src/data/client.ts` throws when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing. It is called unguarded in `src/auth/AuthProvider.tsx:22` inside a `useEffect`, and there is **no React error boundary** anywhere (`src/main.tsx` renders `AuthProvider > DataProvider > App` with no fallback).

Result: a single missing or typo'd env var on Vercel produces a completely blank page with no message — for users *and* for whoever is debugging the deploy. This is the most likely first-deploy failure.

**Fix:**
- Add a real React error boundary (class component with `componentDidCatch`) wrapping the app in `main.tsx`.
- Its fallback must be a **designed** state consistent with the existing `States.tsx` visual language — not a raw stack trace. It should say something went wrong, and offer a reload.
- Handle the configuration error **specifically**: when Supabase env vars are missing, show a clear "the app is not configured" message rather than a generic crash. In production the message must not leak env values or internals; in dev it may be more explicit.
- Make `AuthProvider` degrade gracefully rather than throwing during an effect: catch the configuration failure, stop the loading state, and surface it through the boundary or a designed state.
- Add a regression test proving the app renders a designed fallback (not a blank page, not a throw) when the Supabase env is absent.

## B2 — Accessibility: header search input has no accessible name

`src/App.tsx:65` — the `<label>` wraps the input but contains only a `<Search>` icon and the input. A `placeholder` is **not** an accessible name, so screen readers announce an unlabeled text field. This is a WCAG failure.

**Fix:** give the input a proper accessible name (visually-hidden label text or `aria-label`). Then audit the other form controls in `SearchScreen.tsx` (radios, the field `<select>`) and `AuthPrivacyScreens.tsx` for the same problem and fix any you find.

## B3 — Mobile: compare table forces 1040px horizontal scrolling

`src/screens/CompareScreen.tsx:66` uses `min-w-[1040px]` inside an `overflow-auto` wrapper. It does not break, but on a 375px phone — the primary target device — comparing universities means roughly three screens of horizontal scrolling.

**Fix:** below the `md` breakpoint, replace the wide table with a mobile-appropriate layout (for example, one card per university stacked vertically, or a criterion-by-criterion view). Keep the existing table for tablet and desktop. Do not remove any data or change what is compared — this is layout only, and the source chips and missing-value states must survive.

## B4 — Commit the uncommitted bug fixes

These files contain fixes that were never committed and would be lost by a stray checkout:

- `app/src/components/Trust.tsx` — source chip overflow fix (`rounded-full` on long labels created giant overlapping circles); `MissingValue` gained a `title` prop.
- `app/src/components/UniversityCard.tsx` — the "not calculated yet" fit state no longer mislabels itself "Not published".
- `app/src/screens/ProfileScreen.tsx`, `app/src/screens/CompareScreen.tsx` — same mislabel fixed.
- `app/src/index.css` — added the missing `--color-forest-950` token (its absence made the counselor hero render white-on-white).

Review them, keep them, and include them in your commits with clear messages.

## B5 — Add a linter

There is no ESLint config and no `lint` script. Add ESLint with the TypeScript and React Hooks plugins, a `lint` script in `app/package.json`, and fix what it reports. Do not suppress rules wholesale to make it pass — if a rule is genuinely wrong for this codebase, disable it explicitly with a one-line reason.

## B6 — Remove build litter

Delete `app/.smoke-out/` from the working tree and make sure it is gitignored (along with `dist`, `node_modules`, `.env*`, `*.tsbuildinfo`).

---

## Commit and push to GitHub

**This task is authorised to push — unlike previous sessions.** Push to `origin main`.

**Before pushing, verify secret hygiene. This is the highest-risk part of the task:**
1. Confirm `app/.env` is gitignored and has **never** been committed. Check history: `git log --all --full-history -- app/.env`. If it was ever committed, **stop and report immediately** — do not push, and tell Jeff the key must be rotated.
2. Grep the diff for anything resembling a live credential (`pplx-`, `eyJ`, `service_role`, long base64 blobs). `.env.example` must contain placeholders only.
3. Confirm no Perplexity key, Supabase service-role key, or database password appears in any tracked file.

Then:
- Make focused commits with clear messages (one per bug area, not one giant commit).
- Push to `origin main`.
- Report the pushed commit SHAs.

If the push is rejected because the remote has moved ahead, **do not force-push**. Pull, rebase or merge carefully, re-run the full verification, and report what changed.

## Verification — all must pass before pushing

- `npm run build` — zero TypeScript errors.
- `npx vitest run` — all tests green, including your new B1 regression test.
- SSR smoke: `npx vite build --ssr scripts/smoke.tsx --outDir .smoke-out && node .smoke-out/smoke.js`.
- `npm run lint` — clean.
- Manually confirm at 375px that Compare is usable without horizontal scrolling.
- Confirm the app still renders the catalogue, fit scores, and source chips correctly.

## Deliverable

Report: what you changed per bug, the commit SHAs pushed, the result of the secret-hygiene check, and anything you could not fix. Update `docs/DATABASE_STATE.md` only if the schema or data changed. List anything still blocked in **⚠ Needs Jeff**.
