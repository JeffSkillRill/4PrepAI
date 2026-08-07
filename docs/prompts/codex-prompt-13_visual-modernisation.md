# Codex Prompt — Visual modernisation: design language, brand assets, progress charts, and a counselor that feels alive

Copy everything below the line into Codex.

---

## ⚠ Working directory — do not get this wrong

Work **only** in the existing repository, in place. A previous session ran in a separate copy and created two divergent versions that had to be merged by hand. Do not repeat that.

```
<repo root>/
├─ app/                          ← the student app. This prompt is almost entirely here
│  ├─ index.html                 ← currently has NO favicon and no social preview
│  ├─ package.json
│  └─ src/
│     ├─ index.css               ← @theme tokens + motion system + custom layer
│     ├─ App.tsx                 ← hand-rolled router, Navbar, Footer, Logo (line ~64)
│     ├─ routes.ts · types/index.ts
│     ├─ motion/preference.ts    ← shouldAnimateMotion(), the reduced-motion gate
│     ├─ dashboard/logic.ts      ← re-exports the shared stage model
│     ├─ screens/                ← twelve screens across eight files
│     ├─ components/             ← Trust, States, CostSummary, UniversityCard, UniversityVisual
│     ├─ learning/logic.ts       ← deriveLearningModuleStates, findLearningContinueModule
│     └─ data/repository.ts      ← every DB read/write goes through here
├─ admin/                        ← operator console. Keep it working; do not beautify it
├─ shared/dashboard-stage.ts     ← the five-stage model both apps import
└─ docs/
   ├─ ADMIN.md · SUPPORT_CHAT.md · LEARNING_PORTAL.md · DATABASE_STATE.md
   └─ prompts/codex-prompt-10_ui-polish-and-dashboard.md   ← read this first
```

Do not scaffold a new project, create a parallel `app/`, or add a third `package.json`. If a file you expect is missing, you are in the wrong directory — stop and report.

## Context

4Prep is a university-pathway platform for international students applying to US universities. It has a sourced catalogue with a five-component deterministic fit score (Φ), a grounded AI counselor, intake and pathway, saved plans, auth, an eleven-module Learning Portal with homework upload, a student dashboard, an admin console, and human support chat.

The product works. It does not yet look like a product a 17-year-old would screenshot and send to a friend. **This prompt is about how it looks and how it moves.** It adds no new data, no new backend surface, and no new product capability except charts that visualise records the database already holds.

Prompt 10 shipped a motion system — duration and easing tokens, `motion-resolve`, `motion-disclosure`, `motion-celebrate`, `motion-progress`, the `trust-static` escape hatch, and a global reduced-motion block. All of it is in `src/index.css` and all of it still binds. **Read `docs/prompts/codex-prompt-10_ui-polish-and-dashboard.md` in full before you write anything.** This prompt extends it; it does not replace it.

### The user, again, because every decision follows from it

A 17-year-old in Tashkent, on a mid-range Android phone, on mobile data, on a connection that is often slow and sometimes drops. English is their second or third language. Their family has never done this before.

"Modern" for this user does not mean heavy. Every kilobyte you add is a second they wait. A design that looks premium on your laptop and takes eleven seconds to paint on a Redmi is a failed design, not a trade-off.

---

## ⚠ Two authorised reversals, and four rules that override everything else

### Reversal 1 — the palette and typeface freeze is lifted

Prompt 10 listed out of scope: *"Any new palette, typeface, or logo — the tokens in `src/index.css` are settled, design to them."*

**That freeze is lifted by the product owner for this prompt.** You may propose and implement a new palette, new type scale, and new typefaces. See Task 1 for how — this is a licence to redesign deliberately, not a licence to improvise per screen.

### Reversal 2 — the dependency ban is conditionally lifted for charts only

Prompt 10 banned new runtime dependencies outright. For **charting only**, you may evaluate a library and adopt one **if you can justify it on the numbers**. See Task 3. Everything else stays banned: no framer-motion, no GSAP, no react-spring, no lottie, no UI kit, no icon set beyond the `lucide-react` already present.

### Rule 1 — motion must never delay content

No entrance animations that hide content until JavaScript runs. No fade-in-on-mount wrappers, no staggered reveal of a page's primary content, no scroll-triggered reveals of things already on screen, no chart that leaves a blank rectangle until an animation finishes.

On a fast laptop these look refined. On a slow phone the student stares at an empty screen wondering whether the app is broken, and leaves. **Content renders immediately; motion decorates transitions the user initiated.**

### Rule 2 — animate only `transform` and `opacity`

Anything else — `height`, `width`, `top`, `margin`, `box-shadow` on large surfaces, `filter`, `backdrop-filter` — forces layout or paint every frame and drops frames on a cheap Android. Use the existing `grid-template-rows: 0fr → 1fr` disclosure technique for expansion. SVG chart draw-in must use `stroke-dashoffset` or a `transform` scale, never per-frame geometry recalculation in JavaScript.

Target 60fps on a low-end device. If you cannot achieve an effect within `transform` and `opacity`, drop the effect.

### Rule 3 — reduced motion means no motion

`src/index.css` has a global `prefers-reduced-motion: reduce` block. Keep it, and remember its limit: **it does not stop JavaScript-driven motion.** Any Web Animations API call, `requestAnimationFrame` loop, timer sequence, View Transition, or chart animation must consult `shouldAnimateMotion()` in `src/motion/preference.ts` and degrade to an instant final state.

A user who sets that preference often has a vestibular disorder. A 10ms slide is still a slide. If you adopt a chart library, its animations are almost certainly on by default — turning them off under reduced motion is your job, and it is a Definition-of-done item.

### Rule 4 — a chart is a claim, and every claim must be true

This is the rule most likely to be broken in this prompt, so read it twice.

Charts invite invention. A line needs points, so it is tempting to interpolate. An axis needs a range, so it is tempting to pick a flattering one. A gauge needs a maximum, so it is tempting to guess what "done" means.

**Every pixel of every chart must trace to a recorded action or a sourced figure.** No interpolated points between real ones. No projected trend line. No "on track" or "behind" judgement. No completion percentage against a denominator you invented. No zero-baseline substitute for a missing value — `CLAUDE.md` already forbids zero, an em dash, or an estimate as a missing-data fallback, and that applies inside a chart exactly as it does inside a table.

And the standing rule from `CLAUDE.md`, absolute here: **never imply we can predict an admission outcome.** No readiness score, no acceptance likelihood, no chart whose shape reads as "you are winning" or "you are losing."

---

## Task 1 — A design language, decided once

Right now the app is coherent but conservative: forest green, DM Sans and Manrope, `#faf9f7` canvas, soft shadows, 1rem radii. It reads as trustworthy. It does not read as *current*.

You have licence to change this. Use it deliberately.

**Work through `@theme` in `src/index.css`.** Every colour, font, shadow, radius, and duration stays a token. If a component hard-codes a hex value, the redesign has already failed — a future contributor will not find it. The `admin/` app may share these tokens, so a token you rename you must fix on both sides.

**Before you change a single token, write the proposal into `docs/UI_DESIGN.md`:** the palette with contrast ratios, the type scale, the elevation and radius scale, and two or three sentences on why this reads as modern to a 17-year-old rather than to a designer. Then implement it. A redesign you cannot justify in writing is a redesign nobody can maintain after you.

**Constraints on whatever you choose:**

- **WCAG AA holds everywhere.** Not "mostly" — state the measured ratio for body text, muted text, every button state, and every chart colour against its background. Muted grey on tinted surfaces is where this normally breaks.
- **Typefaces cost bandwidth.** Two families and a bounded set of weights, `font-display: swap`, subset if you can, and self-host rather than round-tripping to Google Fonts if that measures faster. Report the total font payload before and after. A gorgeous variable font that adds 180KB is a worse decision than the DM Sans you already have.
- **Never colour alone.** Verified fact, general guidance, refusal, honest gap, saved, locked — each must be distinguishable without colour vision. Icon, label, shape, or position.
- **The honest-gap treatment must not read as an error.** Prompt 10 fixed this in `components/Trust.tsx` and a palette change can silently undo it. Our most affordable universities have the most gaps; if gaps look broken, budget-constrained students bounce off exactly the options they need most. Re-verify after every palette change.
- **Do not build dark mode.** Still out of scope. But do not paint yourself into a corner that makes it impossible later.

## Task 2 — Brand assets from the logo folder

Jeff is adding a folder of **4Prep brand assets** to the repository. Find it, list exactly what is in it, and report what you found before you use it. Do not guess at filenames; do not proceed on an empty folder — stop and report.

Today the logo is a CSS construction in `App.tsx` around line 64: a rotated rounded square with a "4" and an amber dot. It appears in the navbar and the footer. There is **no favicon at all** and **no social preview image** — `index.html` has neither.

What to do with the real assets:

- **Replace the CSS logo** in the navbar and footer. Pick the variant that suits each context — a full wordmark has no business rendering at 24px, and an icon alone has no business being the only brand mark on the sign-in screen.
- **Ship a favicon set** and a social preview image, wired into `index.html`. Someone will paste an `app.4prep.ai` link into Telegram and what appears there is the first impression for most of this audience.
- **Serve the right weight.** SVG where it is a vector, and if a raster is unavoidable, sized correctly with explicit `width` and `height` so it never causes layout shift. Do not ship a 900KB PNG to a phone on mobile data to draw a 36px mark.
- **Keep it accessible and SSR-safe.** The mark needs an accessible name, decorative parts need `aria-hidden`, and the whole thing must survive the `npm run ssr:smoke` check.
- **If the folder gives you a colour system** — a brand green, an accent — reconcile it with Task 1 rather than running two palettes side by side. If brand and accessibility conflict, accessibility wins and you say so in `docs/UI_DESIGN.md`.

**University logos are not in scope.** They are third-party trademarks with licensing implications and you do not have permission to source or embed them. `components/UniversityVisual.tsx` generates gradient placeholders today; improve those as generated art if you like, but do not fetch, scrape, or bundle a real university's mark.

## Task 3 — Charts: learning progress and universities

The dashboard at `src/screens/DashboardScreen.tsx` currently reports counts as sentences: *"3 lessons complete · 1 homework submitted."* True, honest, and forgettable. Make it legible at a glance without making it dishonest.

### First: decide the library question, on the numbers

Compare hand-rolled inline SVG against one lightweight charting library. Report **the actual bundle delta you measured**, tree-shaken, in the production build — not the marketing number from the library's homepage. Also weigh how much of the library's default behaviour you will have to fight: tooltips that assume a mouse, animations that ignore `prefers-reduced-motion`, colours that are not your tokens, and accessibility that is usually an afterthought.

**Recommend one, justify it in three sentences, implement that one.** If the two are close, hand-rolled wins — it costs the student nothing and these charts are simple shapes. If you adopt a library, its animations must route through `shouldAnimateMotion()` and its palette must come from your tokens.

### What the data actually supports

Verify each of these against `data/repository.ts` and the live schema before you draw it. **Do not draw a chart whose data does not exist.**

- **Lesson completion across the eleven modules** — `learning_progress` and `deriveLearningModuleStates` give you real per-module state, including which modules are locked by sequential gating. A locked module is not an incomplete module and must not look like one.
- **Homework: submitted, awaiting feedback, feedback received** — real states from `learning_submissions`.
- **The five-stage journey** — `shared/dashboard-stage.ts` defines `not_started → planning → learning → homework_submitted → feedback_received`. This is a position, not a score, and it must render as a position. The admin roster shows the same stage from the same code path; do not let a visual layer make the two disagree.
- **The five Φ components for a route** — the natural chart in this product, and the most dangerous. `ExpandableFit` and `FitBreakdown` already own this. **The absolute rule is unchanged: the score is never shown as a bare number, and a chart is not an exemption.** Every component visual carries its one-line reason, and it degrades honestly before intake is complete. **Φ is deterministic and must never be computed by AI.**
- **Cost composition and saved-university comparison** — tuition, fees, room and board, net after published aid, from `CostSummary` and the catalogue. Every figure keeps its source chip. A missing component is a visible, labelled gap in the chart — not a zero, not a gap in the bar, not silently dropped from the total.

**On time series, be careful.** "Progress over time" needs real timestamps. Check whether `learning_progress` and `learning_submissions` actually record them at the granularity a line chart implies. If they do, chart real events. If they do not, **do not draw a timeline** — and say in your summary that you did not, and what would need to be recorded first.

### How every chart must behave

- **The empty chart is the primary state.** Most students have completed nothing. A chart that only works full is a chart that fails almost every real first visit. Design empty first, then partial, then full — the same order prompt 10 required of the dashboard itself.
- **Never a chart alone.** Every chart has a text equivalent a screen reader reaches: a visually-hidden table, or `role="img"` with an `aria-label` that states the actual values. Someone must be able to get the information without seeing it.
- **Touch, not hover.** Hover-only tooltips do not exist on the student's phone. Values are readable without interaction, or reachable by tap and by keyboard with visible focus.
- **375px first.** A chart that needs 900px is a chart this product cannot use. Check 320px for overflow too.
- **Colour is never the only encoding.** Label, pattern, or position as well.
- **Draw-in animation is optional and gated.** Under reduced motion the chart appears complete, instantly.

Write what you built and what you deliberately refused to chart into `docs/DASHBOARD.md`.

## Task 4 — The counselor should feel like it is thinking

`src/screens/CounselorScreen.tsx` is the most impressive thing this product does and currently the least impressive thing to look at: a textarea, a button, and a static box with a `Database` icon while the request is in flight. A student who does not know an Edge Function is running assumes the app has frozen.

**The four answer types must stay instantly distinguishable at a glance.** `verified_fact`, `general_guidance`, `out_of_scope`, `refusal` — this is a trust hierarchy, not a colour scheme, and it is the whole reason anyone should believe this product. Whatever you do visually must make the distinction sharper, never softer.

**Where motion belongs here:**

- **The waiting state.** Something that communicates *checking sourced records*, honestly and continuously, with an accurate `aria-live` announcement. Not a bare spinner. Not a fake progress bar that implies knowledge of how long this takes.
- **The answer arriving.** A verified fact resolving into place should feel like a result, not a page repaint. `motion-resolve` exists; consider whether it is enough.
- **Source chips settling** after the answer, so provenance reads as attached to the answer rather than decoration beside it.
- **The composer.** It is a bare textarea. Make it feel like the front door of the product: real focus treatment, visible character budget as they approach the 1000-character limit, and a submit state that acknowledges the tap instantly.

**Where motion must not go — this is not negotiable:**

The **refusal** state. It already carries `trust-static` for exactly this reason. A refusal is 4Prep saying *we do not have a verified figure and we will not guess* — the single most valuable thing this product does. Animate it and it reads as a malfunction. Same for `out_of_scope`, error states, offline states, and the honest-gap treatment.

**Explicitly out of scope for the counselor:** conversation threading, message history, memory across turns, streaming token-by-token output, a floating chat bubble on other screens, and any change whatsoever to the grounding contract, the scope gate, the preflight unknown-check, or the refusal logic. This task is the surface. The behaviour is settled and hard-won — leave it alone.

## Task 5 — Transitions and loading, throughout

The router in `App.tsx` is hand-rolled and view changes are instant swaps. Content jumps. Nothing tells the student their tap registered while the next screen's data loads.

- **View transitions.** If you use the View Transitions API, treat it as progressive enhancement: unsupported browsers get today's instant swap, reduced motion gets no transition, and nothing waits on JavaScript to become readable. Scroll position and focus must land correctly on the new view — a transition that loses keyboard focus is a regression, not a polish.
- **Tap acknowledgement before navigation.** On a slow connection, the gap between tap and new screen is where the student taps again, or leaves. The `:active` scale in `index.css` is a start; nav items and primary CTAs need a pending state when the destination is still loading.
- **Skeletons that match their content.** `components/States.tsx` owns these. Where a skeleton's shape differs from what replaces it, the page jumps and the load reads as a glitch. Add chart skeletons that match the chart's real footprint.
- **Upload progress** in the Learning Portal already exists via `motion-progress`. Verify it is still continuous and honest after the redesign.
- **Exactly one celebration.** Submitting homework. `motion-celebrate` exists for it. Do not add a second one, and do not put celebratory easing on routine interactions.
- **Offline.** This student loses connection regularly. The app must always say what was and was not saved. Never leave them guessing. `useOnlineStatus` is already there — make its states designed, not apologetic.

## Task 6 — The consistency sweep

Once the language is set, go screen by screen and make them agree: search, university profile, compare, intake, results, tools, saved, counselor, all four Learning Portal screens, dashboard, support, auth, privacy, not-found.

For each: 375px and 1280px, no horizontal overflow at 320px, touch targets at least 44px, visible keyboard focus, loading and empty and error and offline all present and all designed.

Compare is the hardest — a wide table at 375px. If prompt 10's solution survived, keep it; if the redesign broke it, fix it properly rather than falling back to horizontal scrolling.

**Keep `admin/` working and legible.** Shared tokens will shift under it. Do not spend effort making it beautiful — prompt 12.1 said so deliberately — but do not leave it broken either.

---

## Out of scope — do not build these

- Any new product feature. Charts visualise existing records; they do not introduce new ones
- Dark mode
- Any dependency other than the one charting library you justify in Task 3. No animation library, no UI kit, no second icon set
- University logos, or any third-party trademark, fetched or bundled
- Counselor threading, history, memory, or streaming output
- Changes to Φ scoring, the catalogue, the counselor's grounding contract, the `DataPoint` contract, RLS policies, or the Learning Portal's data model
- Rewriting the hand-rolled router as a routing library
- Applying migrations, deploying Edge Functions, or changing Supabase, Vercel, or DNS settings
- Analytics, telemetry, or third-party tracking of any kind. This product holds the private data of minors
- Payments or tiers. The product is free

## Definition of done

1. `npm run build`, `npm run lint` (zero warnings), `npm run test`, and `npm run ssr:smoke` all pass in `app/`. The `admin/` app builds and lints clean.
2. **No regressions.** Every screen still works: search, profile, compare, intake, results, tools, saved, counselor, all four Learning Portal screens, dashboard, support chat, auth, privacy, not-found. Admin console still loads and functions.
3. **Bundle size reported before and after**, broken down: CSS, JS, fonts, images, and the charting decision's share. State the numbers, not an impression.
4. **Every screen verified at 375px and 1280px, no horizontal overflow at 320px.** Name the screens you actually opened.
5. **`prefers-reduced-motion: reduce` produces no motion at all** — including chart animation, view transitions, and anything a chart library does by default. State the specific check you ran, not that you ran one.
6. **WCAG AA holds** across the new palette. State measured contrast ratios for body text, muted text, every button state, and every chart series.
7. **Every chart has a non-visual equivalent** and is usable by keyboard and by touch without hover. Demonstrate one with a screen reader or the accessibility tree.
8. **No chart contains an invented value.** State how you verified this, including what you refused to chart and why.
9. **The four counselor answer types are distinguishable at a glance**, and the refusal state carries no animation. Show both.
10. **Brand assets:** what was in the folder, what you used where, favicon and social preview wired up, no layout shift, total image payload stated.
11. New tests where behaviour changed — chart data derivation and the reduced-motion branch at minimum.
12. **`docs/UI_DESIGN.md` written** (palette, type scale, elevation, rationale, contrast table). **`docs/UI_MOTION.md` updated** — note that prompt 10 required this file and it does not currently exist in `docs/`; if the motion system shipped without its documentation, write it now from what is actually in `index.css`. **`docs/DASHBOARD.md` updated** with the charts, likewise.

## In your summary, state plainly

- The palette, type scale, and typefaces you chose, and why they read as modern to this user rather than to a designer.
- Hand-rolled charts or a library, the measured bundle delta, and the three sentences of justification.
- Every chart you built, its exact data source, and **every chart you refused to build because the data would have been invented.** This is the most important line in your summary.
- What was in the logo folder, what you used where, and the total image and font payload before and after.
- What you changed on the counselor, and how you kept the four answer types distinguishable and the refusal static.
- Bundle size before and after, in full.
- How you verified reduced motion, 375px, 320px, and contrast — the actual checks, not an assertion that you did them.
- Every screen you touched and every screen you deliberately did not.
- Anything you could not verify.

## Non-negotiables that still bind

Every rule under "Non-negotiable product rules" in `app/CLAUDE.md` remains in force. In particular: never fabricate a university figure; every displayed fact stays a `DataPoint`; known facts need a real `sourceId` and unknown facts need a reason and a suggested action; never use zero, an em dash, or an estimate as a missing-data fallback; never show a bare fit score; **Φ is deterministic and must never be computed by AI**; the counselor never guesses; the dashboard reports recorded actions only and never predicts an admission outcome; API keys stay server-side; strict TypeScript with zero build errors.

If any instruction here conflicts with what you find in the repository — other than the two authorised reversals named at the top — **stop and report the conflict rather than choosing for yourself.**
