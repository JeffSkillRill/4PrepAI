# Codex Prompt — UI polish, motion, and a student dashboard

Copy everything below the line into Codex.

---

## ⚠ Working directory — do not get this wrong

Work **only** in the existing repository, in place. A previous session ran in a separate copy and created two divergent versions that had to be merged by hand. Do not repeat that.

```
<repo root>/
├─ app/
│  ├─ package.json          ← the only package.json
│  ├─ src/
│  │  ├─ index.css          ← design tokens + custom layer. Motion belongs here
│  │  ├─ App.tsx            ← routing + nav, hand-rolled, no router library
│  │  ├─ types/index.ts     ← the View union and DataPoint contract
│  │  ├─ data/repository.ts ← every DB read/write goes through here
│  │  ├─ screens/           ← eleven screens across seven files
│  │  ├─ components/        ← States, Trust, CostSummary, UniversityCard
│  │  ├─ learning/          ← portal logic + download helper
│  │  └─ auth/
│  └─ supabase/
└─ docs/
```

Do not scaffold a new project, create a parallel `app/`, or add a second `package.json`. If a file you expect is missing, you are in the wrong directory — stop and report.

## Context

4Prep is a university-pathway platform for international students applying to US universities. It is feature-complete for its first launch: a sourced catalogue with a five-component fit score, a grounded AI counselor, intake and pathway, saved plans, auth, and a Learning Portal with eleven modules and homework upload.

**This prompt adds no new product surface except one dashboard.** Everything else is refinement of what exists. Do not add features, do not rewrite working screens, do not restructure the data layer.

### The user, again, because every decision follows from it

A 17-year-old in Tashkent, **on a mid-range Android phone**, on mobile data, on a connection that is often slow and sometimes drops. English is their second or third language. Their family has never done this before.

Read that twice before you write a single animation. This user is the reason most of the rules below exist.

---

## ⚠ Three rules that override everything else in this prompt

### 1. Motion must never delay content

Do not add entrance animations that hide content until JavaScript runs. No fade-in-on-mount wrappers, no staggered reveal of a page's primary content, no scroll-triggered reveals of things that were already on screen.

On a fast laptop these look refined. On a slow phone they mean the student stares at a blank screen wondering whether the app is broken — and then leaves. **Content renders immediately; motion decorates transitions the user initiated.** If an animation can make the first paint later or emptier, it is the wrong animation.

### 2. Animate only `transform` and `opacity`

Anything else — `height`, `width`, `top`, `margin`, `box-shadow` on large surfaces, filters — forces layout or paint on every frame and drops frames on a cheap Android device. For expanding sections use the `grid-template-rows: 0fr → 1fr` technique, which is compositor-friendly, rather than animating height or `max-height`.

Target 60fps on a low-end device. If you cannot achieve an effect within `transform` and `opacity`, drop the effect.

### 3. Honour reduced motion properly

`src/index.css` already has a global `prefers-reduced-motion: reduce` block that collapses CSS animation and transition durations. Keep it, and be aware of its limit: **it does not stop JavaScript-driven motion.** Any Web Animations API call, `requestAnimationFrame` loop, or timer-based sequence must check `window.matchMedia('(prefers-reduced-motion: reduce)')` itself and degrade to an instant state change.

Reduced motion means *no motion*, not *fast motion*. A user who sets that preference often has a vestibular disorder; a 10ms slide is still a slide.

---

## Task 1 — A motion system, not scattered transitions

Right now motion in this app is close to accidental: a `.interactive-card` transition, a shimmer keyframe for skeletons, and a single `animate-spin`. Anything you add ad-hoc will drift.

Define the system in `src/index.css` alongside the existing `@theme` tokens:

- **Duration tokens.** Roughly three steps — something near 120ms for state feedback like hover and press, near 200ms for element transitions like expanding a fit score, near 300ms as the ceiling for the largest transition. Nothing in this app should animate for longer than that; slow is not premium, slow is slow.
- **Easing tokens.** A standard ease-out for things entering, and something with a small overshoot reserved for genuine celebration. Do not put a bouncy easing on routine interactions.
- **A small set of named keyframes** you actually reuse, rather than one-off animations per component.

Then document the system in `docs/UI_MOTION.md`: the tokens, when to use each, and the rules above. A future contributor should be able to add a component without inventing new motion.

**Where motion earns its place in this product:**

- Press and tap feedback on every interactive element. On a phone with a slow connection, immediate visual acknowledgement of a tap is the single highest-value animation in the app — it is the difference between "I tapped it" and "did I tap it?"
- Expand and collapse: the fit-score breakdown, cost components, module lesson lists.
- Skeletons resolving into content, so the change reads as loading finishing rather than the layout jumping.
- Upload progress in the Learning Portal, which already exists and should feel continuous.
- Exactly one moment of celebration: submitting homework. Real accomplishment, acknowledged once. Not on every tap, not on every save.

**Where motion must not go:** the honest-gap treatment, the counselor's refusal state, error and offline states, source chips, and anything that would make a missing figure feel like a malfunction. Those states are deliberate honesty. Animating them makes them feel broken.

## Task 2 — Fix the known usability problems

These are real, documented problems in `4Prep_Frontend-Designer-Brief.md`, not hypotheticals. Fix them in this order.

**a) The mobile pass at 375px.** The app was built desktop-first and the user is on a phone. Go screen by screen at 375px: the nav, the university card, the intake flow, the counselor chat, the Learning Portal screens, and especially the compare view — a wide table does not work at 375px and needs a genuinely different layout, not horizontal scrolling. Verify every touch target is at least 44px and that nothing overflows horizontally at 320px either.

**b) The honest-gap system reads like an error.** When a university has not published a figure, we show a reason and a suggested action — and it currently renders as an amber warning box that looks like something went wrong. It should read as *deliberate honesty*.

This matters commercially, not just aesthetically: our most affordable universities have the most gaps, so if gaps look broken, budget-constrained students bounce off exactly the options they need most.

Design one consistent treatment covering a single missing value inline, a cluster of gaps on one profile, and — this is the part that currently confuses people — the visual difference between **"the university has not published this"** and **"we cannot calculate this until you finish intake."** Those two are currently indistinguishable and mean completely different things to the student. Work within `components/Trust.tsx`.

**c) Cost clarity.** US sticker prices are far beyond our student's budget, and the first number they see determines whether they keep reading. `components/CostSummary.tsx` should lead with net cost after published aid, keep the sticker price secondary, make the components expandable rather than front-loaded, and stay honest where aid is individually assessed and no personal figure can be stated.

**d) Fit score comprehension.** The rule is absolute: **the score is never shown as a bare number.** The compact badge must always be expandable into the five component reasons, and it must degrade honestly before the student has completed intake. `ExpandableFit` and `FitBreakdown` in `components/Trust.tsx` are the place.

**e) Counselor trust hierarchy.** The counselor returns exactly three kinds of answer — a verified fact from our sourced database, general guidance from the web, and a refusal where we have no sourced answer and will not guess. These must be **instantly distinguishable at a glance**. This is a trust problem, not decoration. The refusal in particular must read as honest and useful, never as an error.

**f) Source chips on mobile.** Every figure carries a provenance chip. In a dense card grid at 375px this becomes clutter. Decide how much provenance to show inline before it overwhelms, and make the chip work in the card grid and the compare view.

## Task 3 — The student dashboard

**You decide what this is.** I am giving you the constraints and the raw material, not a layout.

### What data already exists to draw on

- `student_profiles` — the intake profile, which may be partial or absent
- `saved_plans` — saved universities
- The ranked pathway and its five fit components, derived from the profile
- `learning_progress`, `learning_submissions` — portal progress and homework state
- The sourced catalogue, including its honest gaps
- Counselor request history

### The constraint that should drive your design

**At launch, the most common dashboard is an empty one.** A new student has no profile, no saved universities, no lessons complete, no homework submitted. Most first views of this screen will be that view.

So the empty state is the *primary* state, not an edge case to bolt on afterwards. A dashboard that only looks good full is a dashboard that fails almost every real user on their first visit. Design the empty state first, then the partial state, then the full one. Partial matters too — a student with a profile but no saved plans is extremely common.

### Non-negotiables

- **No invented numbers.** Every figure traces to sourced data or a real user action. No made-up completion percentages, no estimated chances, no invented deadline countdowns. Where something is not yet known, use the same honest-gap treatment as the rest of the app.
- **Never imply we can predict an admission outcome.** No "likelihood of acceptance", no readiness score, no ranking of how well they are doing. We help students find and apply; we do not predict decisions, and pretending otherwise would be both dishonest and cruel.
- **It must earn its place in the nav.** There are already six nav items. If the dashboard is worth adding, say what it replaces or how the nav reorganises. Do not just append a seventh.
- **Decide whether it becomes the landing screen for signed-in users** — and if so, do not break the pending-auth return path. A student who signed in from an assignment page must still land back on that assignment, not on the dashboard. `auth/pendingAuth.ts` handles this; extend it rather than working around it.
- Signed-out visitors must get something coherent, whether that is a redirect or an honest explanation of what signing in gives them.
- Mobile-first at 375px, like everything else.

Write your reasoning into `docs/DASHBOARD.md`: what you built, what you deliberately left off, and what you would add once real usage data exists.

## Task 4 — Loading, empty, error, offline

Every screen needs all four, at 375px and desktop, using and extending `components/States.tsx`. Skeletons must match the shape of the content that replaces them, otherwise the page jumps and the transition reads as a glitch rather than a load completing.

Offline deserves specific attention. This user loses connection regularly, and the app must always say what was and was not saved. Never leave them guessing whether their work survived.

---

## Out of scope — do not build these

- New features beyond the one dashboard
- Any animation library. **No framer-motion, no GSAP, no react-spring, no lottie.** CSS and, where genuinely necessary, the Web Animations API
- Any new palette, typeface, or logo — the tokens in `src/index.css` are settled, design to them
- Dark mode
- Changes to the counselor's grounding logic, Φ scoring, the catalogue, or the Learning Portal's data model
- Grading, feedback, or review of homework — still deliberately unbuilt
- Payments or tiers of any kind. The product and the portal are free
- Any new heavy dependency. Tailwind v4 core utilities only. If you believe a dependency is unavoidable, stop and ask rather than adding it

## Definition of done

1. `npm run build`, `npm run lint` (zero warnings), and `npm run test` all pass. The SSR smoke check still passes.
2. **No regressions.** Every existing screen still works: search, profile, compare, intake, results, tools, saved, counselor, all four Learning Portal screens, auth, privacy.
3. Bundle size is reported before and after. A polish pass that meaningfully grows the bundle has cost this user more than it gave them.
4. Every screen verified at 375px and 1280px, with no horizontal overflow at 320px.
5. `prefers-reduced-motion: reduce` produces **no motion at all**, including anything JavaScript-driven. State the specific check you ran.
6. Keyboard navigation works with visible focus throughout, WCAG AA contrast holds, and touch targets are at least 44px.
7. New tests where behaviour changed — dashboard state derivation and the reduced-motion branch at minimum.
8. `docs/UI_MOTION.md` and `docs/DASHBOARD.md` written.

## In your summary, state plainly

- The motion tokens you defined and where each is used.
- What the dashboard is, what you left off, and why. Justify its place in the nav.
- Whether it became the signed-in landing screen, and how you kept the pending-auth return path intact.
- Bundle size before and after.
- How you verified reduced motion, 375px, and 320px — the actual checks, not an assertion that you did them.
- Every screen you touched, and every screen you deliberately did not.
- Anything you could not verify.

If any instruction here conflicts with what you find in the repository, **stop and report the conflict rather than choosing for yourself.**
