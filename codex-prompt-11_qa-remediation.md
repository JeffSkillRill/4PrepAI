# Codex Prompt — Close the launch-QA findings

Copy everything below the line into Codex.

---

## ⚠ Working directory — do not get this wrong

Work **only** in the existing repository, in place. A previous session ran in a separate copy and created two divergent versions that had to be merged by hand. Do not repeat that.

```
<repo root>/
├─ app/
│  ├─ package.json          ← the only package.json
│  ├─ src/
│  │  ├─ index.css          ← design tokens + custom layer
│  │  ├─ App.tsx            ← routing + nav, hand-rolled, no router library
│  │  ├─ routes.ts          ← path parsing and building
│  │  ├─ types/index.ts     ← the View union and DataPoint contract
│  │  ├─ data/repository.ts ← every DB read/write goes through here
│  │  ├─ screens/           ← eleven screens across seven files
│  │  ├─ components/        ← States, Trust, CostSummary, UniversityCard
│  │  └─ learning/ · auth/ · scoring/ · dashboard/ · motion/
│  └─ supabase/
│     ├─ functions/counselor/  ← index.ts, grounding.ts, scope.ts
│     └─ migrations/
├─ docs/
└─ QA_LAUNCH_AUDIT_2026-08-03.md   ← read this first
```

Do not scaffold a new project, create a parallel `app/`, or add a second `package.json`. If a file you expect is missing, you are in the wrong directory — stop and report.

## Context

4Prep is a university-pathway platform for international students applying to US universities. It is feature-complete and has just been through an independent launch audit. The audit's verdict was **conditional go for a signed-out pilot, no-go for anything requiring accounts**.

**This prompt adds no new product surface at all.** Every task below closes a specific finding from `QA_LAUNCH_AUDIT_2026-08-03.md`. Read that report before you write any code — the findings carry evidence, reproduction steps, and file/line references that this prompt does not repeat in full.

Do not add features. Do not redesign working screens. Do not restructure the data layer.

### The user, again, because every decision follows from it

A 17-year-old in Tashkent, on a mid-range Android phone, on mobile data, on a connection that is often slow and sometimes drops. English is their second or third language. Their family has never done this before.

Two findings below (F-02, F-04) are about whether this student gets told the truth about money. Treat them as the most important thing in this prompt.

---

## ⚠ Three rules that override everything else here

### 1. Never loosen a trust guarantee to make a test pass

Several tasks below tighten or narrow validation logic. There is an obvious lazy fix for each one — delete the check. That is always the wrong answer.

The rule that must survive every change: **a university figure reaches a student only if it came from a verified 4Prep record, and it carries that record's citation.** If a change you are considering would let an unsourced tuition, fee, deadline, or test score render, the change is wrong regardless of what it fixes.

### 2. Do not touch the database or any external system

Do not apply migrations. Do not deploy Edge Functions. Do not change Supabase, Vercel, or DNS settings. Do not create users.

Two migrations are checked in and unapplied (`202607310008`, `202607310009`). Their true status is now in doubt — see Task 3. You will be **reading** the live database to establish facts. You will not be writing to it.

### 3. Every fix needs a test that fails before it and passes after

The audit could not run `npm run build`, `npm run test`, or the SSR smoke check — the installed `node_modules` is macOS-only and the auditor's sandbox was Linux. That gap is closed by running them yourself on this machine, but it means **the existing suite has not been observed passing recently**. Establish a green baseline first, then keep it green.

---

## Task 1 — The counselor refuses honest guidance and logs a false strike

**Closes F-02 (P1). This is the most damaging finding in the report.**

`validateFigures` in `supabase/functions/counselor/grounding.ts` checks every figure in an answer against `knownNumbers` — a flat set of every digit sequence across the supplied records. When no catalogue university matched the question, `records` is empty, so that set is empty, so **every figure is untraceable by construction**.

The audit executed this directly:

```
REFUSED | "Most early action deadlines fall on November 1."
          figures=["November 1"] untraceable=["November 1"]
```

Two things then go wrong. The student gets a generic refusal for an ordinary, correct piece of advice — and deadlines are among the most common questions this product exists to answer. And `logStrike(..., strike_type: 'untraceable_figure')` fires, writing a false positive into `counselor_strikes`, which is the table used to audit whether the counselor is trustworthy at all. `docs/DATABASE_STATE.md` recommends tuning rate limits from these counts.

**The fix is about intent, not about switching a check off.**

Think about what an empty record set actually means. The scope gate has already confirmed the question is in remit. `targetedKind` returned nothing, so the student did not ask for a specific university figure. `selectRelevant` matched no catalogue university. If they *had* asked for a figure about an unmatched university, `index.ts` already refuses earlier, before the provider is called. So empty records plus no targeted kind means one thing: **this is general advice, and it is already banner-labelled "General information — not verified 4Prep data."** A date in that answer is not a provenance violation.

Reason about the right boundary yourself, then implement it. The properties that must hold when you are done:

- General guidance with no matched university may contain ordinary numbers — dates, counts, score ranges — without being refused.
- A strike is recorded only for a genuine provenance violation: an answer presented as a verified 4Prep fact carrying a figure that no cited record supports. Ordinary advice must never write to `counselor_strikes`.
- Anything claiming to be a verified figure is validated exactly as strictly as it is today, or more strictly after Task 2.
- If the provider returns `verified_fact` when no records were supplied at all, that is incoherent and must be refused — do not let this become the hole through which unsourced figures escape.

Cover it in `grounding.test.ts` with, at minimum: general guidance containing a date passes; general guidance containing a currency figure while records exist is still checked; a `verified_fact` with no supplied records is refused; and no strike path is reachable from ordinary guidance.

## Task 2 — Figure validation checks number presence, not field correspondence

**Closes F-04 (P2).**

The current check asks "do these digits appear anywhere in the record set?" That is too weak. The audit demonstrated both failures by direct execution:

| Answer under test | Current validator |
|---|---|
| `"Room and board at Harvard is $59,320"` — that is the **tuition** figure | ✅ passes |
| `"The acceptance rate is about 85%"` — 85 came from the **$85 application fee** | ✅ passes |
| `"Tuition at Harvard is $71,450"` — invented | ❌ refused, correctly |

A swapped cost and a fabricated acceptance rate are exactly the errors this validator exists to catch, and it waves both through.

Two changes, and the second matters more than the first:

**Validate against the records the model actually cited, not against every record supplied.** The model returns `recordCitations`; `index.ts` already filters those to IDs present in the context. A figure should be traceable to one of *those* records. Citing the room-and-board record and then quoting the tuition number stops being valid.

**Make figure types incompatible across kinds.** A percentage must never trace to a currency record. A currency amount must never trace to a bare test score. A date must never trace to a number. Today `normalizeText` reduces `"85%"` and `"$85"` to the same string `"85"`, which is how the fabricated acceptance rate passes. Classify each extracted figure — currency, percentage, date, test score, GPA — and require the candidate record to carry a compatible type.

Note while you are here that acceptance rate is not a field the catalogue holds at all. Consider whether any percentage should be traceable to a verified fact today.

Keep the existing true-positive behaviour intact: the invented `$71,450` must still be refused, and a figure with zero citations must still be refused. Add the audit's full case table to `grounding.test.ts`, including the two cases that currently pass and must not.

Be careful not to over-tighten into a new version of F-02. The deterministic `buildVerifiedFactAnswer` path quotes record values verbatim and must keep passing its own validation — if your stricter rule refuses the app's own correct answers, the rule is wrong.

## Task 3 — Establish what is actually deployed, then make the docs true

**Closes F-03 (P2) and F-13 (P3).**

`docs/DATABASE_STATE.md:116` states that production has no `learning_*` tables and no Storage bucket, and lists migration `202607310009` as pending. **This is false.** The audit loaded `/learn` against production and it rendered eleven modules fetched live from `/rest/v1/learning_tracks`.

That single error is worse than it looks. This document is the designated source of truth for launch decisions, and it is wrong about which migrations are live. Migration `202607310008` is listed as pending in the same block — it may be equally stale, or genuinely pending. Nobody can currently tell, and `index.ts:234` writes `outcome: 'out_of_scope'`, which violates the `counselor_requests_outcome_check` constraint if `008` really has not been applied (F-05).

So: **do not edit the document to match a guess.** Query the live database, establish ground truth, and regenerate from what you find.

- Read `supabase_migrations.schema_migrations` for the applied version list.
- Read the actual `counselor_requests_outcome_check` constraint definition and record whether `out_of_scope` is permitted.
- Confirm which `learning_*` tables and which Storage buckets exist.
- Regenerate `docs/DATABASE_STATE.md` from observed state, and state in it how each fact was observed.

If `008` turns out to be genuinely unapplied, do not apply it. Record it as a blocking pre-deploy step for Jeff, with the exact consequence: every out-of-scope question fails its outcome write, silently losing the metric that justifies the scope gate.

While you are in the docs, `app/CLAUDE.md:41` claims the suite is "2 files, 11 tests." There are twelve test files. Run the suite and record the real counts.

## Task 4 — The no-results state nests a second `<main>` and a second `<h1>`

**Closes F-06 and F-07 (both P2).**

Search for something with no matches on `/universities` and the page ends up with two `<main>` landmarks and two `<h1>` elements — `"Find your path abroad"` and `"No exact matches yet"`. `components/States.tsx:90` renders its own `<main>` inside the one already opened by `screens/SearchScreen.tsx:127`. Clearing the filter returns it to 1/1, which confirms the source.

`States.tsx` opens a `<main>` in ten places. Audit all of them. A shared state component cannot know whether its caller already opened a landmark, so the landmark belongs to the screen and the state component should render a section. Fix the pattern, not just this instance.

Second, and on the same screen: filtering swaps the results with no announcement. `[aria-live], [role="status"], [role="alert"]` returns **zero matches** on `/universities`. A screen-reader user gets no signal that the count changed or that nothing matched — precisely when they most need the recovery guidance.

`CounselorScreen.tsx` already does this correctly with `role="status" aria-live="polite"` for loading and `role="alert"` for errors. The pattern exists; apply it. Announce result counts politely, and make sure the no-results message is announced rather than silently swapped in.

## Task 5 — Site navigation is built entirely from buttons

**Closes F-08 (P2).**

`nav a[href]` returns **zero**. `nav button` returns six. Every navigation control in the app — header, footer, university cards, learning modules — is a `<button>` driving `history.pushState`.

The routes themselves are real and work when typed directly; `routes.ts` parses them correctly. What is missing is the semantics. Nobody can Cmd-click or middle-click to open a university in a new tab, which is exactly how a student compares options. There is no `href` for a crawler or a link preview. Assistive technology announces "button" for what is unambiguously a link.

Convert navigation controls to real anchors with a correct `href`, intercepting left-click to keep client-side routing. Let the browser handle the rest: modified clicks, middle-click, and right-click must fall through to native behaviour rather than being swallowed by `preventDefault`.

Genuine actions — "Build my plan", form submits, disclosure toggles, filter chips — stay buttons. The test is whether the control navigates to a URL or performs an action.

Extend `routes.test.ts` to cover round-tripping: every view that has a path builds an `href` that `parseRoutePath` parses back to the same view.

## Task 6 — Counselor answers show raw markdown and twenty identical link labels

**Closes F-09 and F-10 (both P3, both visible to every student who asks a general question).**

General-guidance answers render markdown as literal text. One answer in the audit contained **fourteen literal `**` markers** — the student reads `**three parts**`, `**Introduction:**`, `**Body:**` on screen. `CounselorScreen.tsx:168` renders provider output as `whitespace-pre-wrap` plain text while the provider returns markdown.

Render it properly, but do not reach for a markdown library — the bundle budget on a mid-range Android phone does not have room, and arbitrary HTML from a provider response is not something to hand to `dangerouslySetInnerHTML`. Handle the small subset the provider actually emits — bold, bullet lists, paragraphs — and render it as React elements. Anything you do not explicitly support renders as text. Never interpret raw HTML from the provider.

Separately, that same answer carried **twenty web citations, every one labelled "Web source"**. A screen-reader user hears "Web source, link" twenty times with nothing to tell them apart, and nobody can judge a source's quality before clicking. Label each with something meaningful — the domain at minimum — and give each an accessible name that distinguishes it.

## Task 7 — Touch targets and skip link

**Closes F-11 (P3) and the missing skip link.**

At 375px the catalogue has **67 interactive targets under 44px**. Source chips measure 25–27px tall. The login consent checkbox is **16px**, below even the WCAG 2.5.8 minimum of 24px.

The source chip is the primary affordance for verifying a figure — it is the thing the whole trust model asks the student to tap. Enlarge the hit area without inflating the visual chip; padding or a pseudo-element overlay will do it. The consent checkbox is not negotiable at 16px.

There is also no skip-to-content link. Add one, visible on focus.

Do not sacrifice the mobile layout to hit a number. The audit found zero horizontal overflow at 375px across all seventeen routes — that result must survive this task.

## Task 8 — Unknown routes silently render the catalogue

**Closes F-12 (P3).**

`/does-not-exist` renders `/universities` while the URL bar keeps the bad path. `routes.ts:79` falls back to `'search'` for any unmatched path, so a typo is indistinguishable from success.

Add an explicit not-found view. Distinguish "this path means nothing" from "you asked for the catalogue." The learning portal already models this well — `/learn/foundations` correctly says *"That module was not found"* with a route back. Match that.

Check `vercel.json`'s SPA rewrite still behaves once a real not-found state exists.

## Task 9 — Local development points at the production database

**Closes F-01 (P1). Read this task carefully: most of it is not yours.**

`app/.env` sets `VITE_SUPABASE_URL` to the production project `pubhgajlqhdbpwqahtki`. Every local page load, every counselor question, and every piece of QA hits production. This is why the audit refused to test authentication at all: creating a test user would have created a real one, and cross-user RLS isolation — the likeliest source of a P0 — remains completely untested.

**Provisioning a separate project is Jeff's decision and Jeff's credentials. Do not create one, and do not put any new project's keys in the repository.**

What you can do in code:

- Make the target environment impossible to miss. A persistent, obvious indicator in non-production builds showing which Supabase project is connected. A developer should never again be three hours into a session unsure whether they are writing to production.
- Consider a guard that refuses destructive local operations — account deletion in particular — when the configured project is the known production ref, overridable by an explicit environment flag.
- Update `.env.example` and `docs/AUTH_SETUP.md` to describe the intended separation.
- Write `docs/QA_ENVIRONMENT.md`: what Jeff must provision, which migrations to apply to it in which order, what seed data it needs, and the two disposable accounts required to test cross-user isolation.

Do not invent project refs, URLs, or keys. If you do not know a value, say so in the document.

---

## Out of scope — do not build these

- Any new product feature. This prompt is remediation only
- Applying migrations, deploying functions, or changing Supabase, Vercel, or DNS
- Creating user accounts of any kind, in any environment
- A markdown library, an animation library, or any other new runtime dependency. If you believe one is unavoidable, **stop and ask** rather than adding it
- Changes to Φ scoring, the catalogue data, or the Learning Portal's data model
- Grading, feedback, or review of homework — still deliberately unbuilt
- A new palette, typeface, logo, or dark mode
- Rewriting the hand-rolled router as a routing library
- Rate-limit changes to the counselor. Tune only after real traffic, per `DATABASE_STATE.md`

## Definition of done

1. `npm run build`, `npm run lint` (zero warnings), `npm run test`, and the SSR smoke check all pass. Report the **real** test file and test counts, and reconcile them against `CLAUDE.md`.
2. **No regressions.** Every screen still works: search, profile, compare, intake, results, tools, saved, counselor, all four Learning Portal screens, dashboard, auth, privacy.
3. The audit's counselor red-team table reproduces green, including the two cases that must now flip:
   - general guidance containing a date is **answered**, not refused
   - a cross-field figure swap and a fabricated percentage are **refused**
4. `counselor_strikes` gains no rows from ordinary general guidance. State how you verified this without writing to production.
5. Zero horizontal overflow at 375px, 768px, and 1440px across all seventeen routes — the audit's result, preserved.
6. Exactly one `<main>` and one `<h1>` per route, **including the no-results state**.
7. Navigation is anchors; modified-click and middle-click open a new tab.
8. `docs/DATABASE_STATE.md` regenerated from observed live state, with each fact's method of observation recorded. `docs/QA_ENVIRONMENT.md` written.
9. Bundle size reported before and after.
10. New tests wherever behaviour changed — `grounding.test.ts` and `routes.test.ts` at minimum.

## In your summary, state plainly

- The rule you settled on for when figure validation applies, and why it cannot be used to smuggle an unsourced figure to a student.
- How your type-aware traceability handles the two cases that pass today, and whether it caused any correct answer to start failing.
- What the live database actually showed: applied migrations, the real `outcome` constraint, which `learning_*` tables and buckets exist. Say plainly whether `202607310008` is applied.
- Real test file and test counts, before and after.
- Bundle size before and after.
- How you verified 375px, the landmark fix, and the navigation change — the actual checks you ran, not an assertion that you ran them.
- Every finding in `QA_LAUNCH_AUDIT_2026-08-03.md` you did **not** close, and why.
- Anything you could not verify, especially anything that still needs a non-production environment or a real account.

Findings F-01 (partly), and every authenticated flow in Section 6 and Section 10 of the audit, **cannot be closed by code alone**. Do not report them as fixed. List them as still requiring Jeff.

If any instruction here conflicts with what you find in the repository, **stop and report the conflict rather than choosing for yourself.**
