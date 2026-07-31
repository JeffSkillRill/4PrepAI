# 4Prep — Front-End Designer Brief

**Product:** 4Prep.ai — a university-pathway platform for Central Asian students applying to US universities. A student enters their profile (grades, budget, English level, goals) and gets ranked universities with an explainable fit score, real scholarships, and a plan.

**Status:** the app is built and working on real data (React 19 + TypeScript + Vite + Tailwind v4). This is not a greenfield design job — it is a **refinement pass on a live product**. Ten real US universities, every figure sourced from official pages.

**Primary user:** a 17-year-old in Tashkent, **on a phone**, with a family budget around **$5,000–15,000/year**, deciding whether US study is even possible.

---

## The one thing that makes this product different

**Every number on screen is either sourced from an official university page, or explicitly marked as not published — with a reason and a next action. We never invent, estimate, or round a figure.**

Across our 10 universities we currently have **145 sourced facts and 25 honest gaps**. Those gaps are not bugs to hide; they are the proof the product is trustworthy. **Designing how honesty looks is the core of this brief.**

⚠️ **Please do not put invented numbers in mockups.** No placeholder tuition, no sample fit scores, no fake statistics — even in a wireframe. Use real values from the app or clearly non-numeric placeholders. Invented figures have a habit of surviving into production, and that would break the product's central promise.

---

## What already exists (do not redo)

- **Design system is set.** Fonts: Manrope (display) + DM Sans (body). Palette: forest green (`forest-50` → `forest-950`), cream canvas `#faf9f7`, paper white, coral accent, amber for gaps. Tokens live in `app/src/index.css` — **design to these tokens**, don't introduce a new palette or typeface.
- **Seven screens built:** Search/browse · University profile · Compare · Intake flow · Results/pathway · Counselor (AI chat) · Saved. Plus auth and privacy pages.
- **A desktop layout exists** — sticky top nav, card grid, ~1200px container.

---

## Tasks, in priority order

### 1. Mobile pass at 375px — **highest priority**
The app was built desktop-first, but our user is on a phone. Every screen needs a real mobile design: navigation, the university card, the compare table (a table does not work at 375px), the intake flow, and the counselor chat. Deliver 375px alongside 1280px for each screen.

### 2. The "honest gap" system
When a university hasn't published a figure, we show a reason and a suggested action. Today it renders as an **amber warning box that reads like an error**. It should read as *deliberate honesty*, not breakage.

Design a consistent treatment for:
- A single missing value inline (e.g. tuition unknown on a card)
- A cluster of gaps on a profile page (Berea and Houston City College each have 5)
- The visual difference between **"the university hasn't published this"** and **"we can't calculate this until you finish intake"** — currently these look identical and confuse people

This matters commercially: our two most *affordable* universities have the most gaps. If gaps look broken, budget-constrained students bounce off exactly the options they need most.

### 3. Cost clarity — net price, not sticker shock
US universities publish tuition, mandatory fees, and room & board **separately**, plus a total cost of attendance. Sticker prices run **$40,000–$85,000/year**. Our student has $8,000.

If the first number they see is $85,000, they leave — even when aid would make the school reachable. Design a cost display that:
- Leads with **net cost after published aid**, with sticker price secondary
- Makes the components (tuition / fees / room & board) expandable, not front-loaded
- Handles "aid is individually assessed" honestly (Harvard, Yale and Princeton are need-blind for internationals — we cannot state a personal figure)
- Shows the F-1 visa financial-certification amount, which students must document

### 4. Fit score comprehension
Each university gets a 0–100 fit score built from **five components**: Academic, Financial, Language, Career, Geographic — each with a letter grade and a one-line plain-language reason.

Rule: **the score is never shown as a bare number.** It must always be expandable into the five reasons. Design the compact badge (on cards), the expanded breakdown, and how it degrades before the student completes intake.

### 5. Counselor trust hierarchy
The AI counselor returns exactly three kinds of answer. They must be **instantly distinguishable at a glance** — this is a trust problem, not decoration:

| Type | Meaning | Must feel |
|---|---|---|
| **Verified fact** | From our sourced database, with source chips | Authoritative, citable |
| **General guidance** | From the web, with web links | Helpful but clearly *not* verified 4Prep data |
| **Refusal** | We don't have a sourced answer, and won't guess | Honest and useful — not an error |

Design all three states, plus the loading state and the input affordance.

### 6. Source chips
Every figure carries a chip showing origin + retrieval date, linking to the official page. Design question: how much provenance to show inline before it becomes clutter — and how the chip behaves on mobile, in dense card grids, and in the compare view.

### 7. Designed states
Loading (skeletons matching final layout), empty results, error, and offline. Every one should look intentional at both 375px and desktop.

---

## Deliverables

- Figma file, **375px and 1280px** for each of the seven screens
- Component specs mapped to the **existing Tailwind tokens** in `index.css` (spacing, colour, radius, type scale) so implementation is mechanical
- The gap/missing-data system documented as a reusable pattern
- Interaction notes: hover, focus (keyboard accessibility matters), expand/collapse, transitions

## Out of scope

- New palette, typography, or logo
- Rebranding, marketing site, illustration system
- Making the product chat-first — the counselor is one feature among seven, not the main interface
- Anything requiring data we don't have

## Constraints

- Tailwind v4 core utilities only; no new heavy dependencies
- WCAG AA contrast, visible focus states, 44px minimum touch targets
- Must degrade gracefully — any figure can legitimately be missing
