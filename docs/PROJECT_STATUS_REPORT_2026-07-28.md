# 4Prep.ai Project Status Report

**Date:** 28 July 2026  
**Repository:** `/Users/abdujafar/Desktop/SAT/4PrepAI`  
**Assessment basis:** founder roadmap, Ground Truth proposal, later delivery plans/prompts, repository history, current code, automated checks, local browser inspection, and read-only checks against the configured Supabase project.

## Executive summary

4Prep.ai is no longer just a mock UI. It is a working **pre-launch MVP implementation** with:

- a responsive React/Vite interface;
- a live Supabase catalogue containing 10 real universities and 33 verified sources;
- source-backed known/unknown data states;
- deterministic five-component fit scoring;
- email-authentication and private profile/saved-plan code;
- a grounded-counselor client and Edge Function source;
- passing build, unit-test, and SSR smoke checks.

It is **not publicly launched**. `app.4prep.ai` currently has no DNS record, the counselor Edge Function returns `404 NOT_FOUND`, production email/backups are not confirmed, and the privacy page still says that a real support contact and deletion process must be added before accepting production accounts.

The newest project instruction is a **pivot to a US-only catalogue**. That pivot has not been implemented. The live database and application are still based on the earlier Kazakhstan/Uzbekistan/Europe/Türkiye catalogue. The repository is therefore at a transition point:

> The first real-data MVP foundation is built; production enablement is incomplete; the proposed US-catalogue replacement is the next unstarted phase.

## Status at a glance

| Area | Status | Evidence |
|---|---|---|
| Frontend | Working locally | Responsive search, profile, compare, intake, results, tools, saved, counselor, auth, and privacy screens |
| Live catalogue | Working, old scope | 10 non-US/European/Central Asian universities; 33 verified sources |
| Provenance model | Strong foundation | Known facts require a source; unknown facts require a reason and action |
| Φ scoring | Partial | Deterministic `phi-v0.1`, but not the EPIF paper equations |
| Pathway personalization | Partial | Ranking changes with profile; the six application milestones are static |
| Auth and persistence | Implemented in code | Supabase Auth, owner-only profiles, unique saved plans, URL routing |
| AI counselor | Code only | Client and Edge Function exist; live endpoint is not deployed |
| Public deployment | Not live | `app.4prep.ai` is NXDOMAIN |
| Privacy operations | Incomplete | No final public contact or account-deletion process |
| Backups/SMTP | Unverified/pending | Handoff and database-state documents list them as blockers |
| US-only migration | Not started | No new migration; UI, schema, Φ, seed, and counselor remain on the old catalogue |
| Automated checks | Passing | Build passes; 2 test files/11 tests pass; SSR smoke passes |

## How the scope evolved

### 1. Founder roadmap: the full product

The roadmap defines a four-layer product:

1. Supabase data;
2. EPIF methodology;
3. Niche-style search and browse;
4. grounded AI orchestration.

The final vision is approximately 300 deeply sourced universities, five AI systems, accounts, saved pathways, real users, and a month-by-month plan. Its central rule is that every displayed fact must be real, sourced, and defensible.

### 2. Ground Truth proposal: make grounding enforceable

The proposal reframes the most important infrastructure as:

- a provenance-enforced schema;
- a sourcing and verification workflow;
- a single Grounding Gateway;
- a deterministic EPIF service;
- an unsupported-claim validator;
- a grounding evaluation suite.

That proposal is strategically consistent with the roadmap, but its full internal console, outcome ledger, calibration system, and 20–26 week schedule were later cut from the MVP.

### 3. Twelve-week delivery plan: narrow and real

The 12-week plan reduces the first launch to:

- one AI flow;
- roughly 15–20 sourced universities;
- accounts and saved plans;
- a grounded counselor;
- a small real cohort.

### 4. Three-week MVP plan: maximum compression

The later three-week plan supersedes the 12-week schedule and reduces the build to:

- 10 real universities;
- Φ v0.1;
- one Perplexity-powered counselor;
- auth, privacy, RLS, deployment, and a public launch.

Most of the implementation now in the repository came from this phase.

### 5. US-only catalogue prompt: newest direction

The newest prompt asks to delete the current catalogue and replace it with 10 US institutions spanning:

- need-blind/full-need institutions;
- private institutions with large international merit aid;
- public institutions with international awards;
- at least one community-college transfer path.

It also requires new US admissions facts, English-test types, net-cost scoring, updated UI, new counselor aliases, and a regenerated database-state document. None of those changes are currently present.

## What is implemented

### Layer 1 — Data

Implemented:

- Supabase production project connected to the app.
- 10 real universities.
- 33 source rows, all marked `verified`.
- 70 university facts, 10 programmes, 20 programme facts, 10 requirements, and 10 scholarships documented.
- Known-or-explicitly-unknown database constraints.
- Owner-only RLS for `student_profiles` and `saved_plans`.
- A uniqueness constraint preventing duplicate saved plans.
- Anonymous catalogue access.
- Anonymous profile access correctly denied.

Read-only live verification on 28 July confirmed:

- exactly 10 universities;
- exactly 33 sources;
- all 33 sources marked verified;
- anonymous `student_profiles` access fails with `permission denied`.

Important limitation:

- Public catalogue policies read the base tables without a database-level `verified` predicate. This is safe only while every public row is verified. A future unverified import could become anonymously readable unless policies or the read path are tightened.

### Layer 2 — Methodology

Implemented:

- pure, deterministic `computeFit`;
- version `phi-v0.1`;
- five weighted components;
- bounded scores and plain-language reasons;
- tests for determinism, bounds, monotonicity, missing values, currencies, and percentage scholarships.

Not implemented:

- the EPIF paper’s exact equations, weights, normalization, or worked-example tests;
- real grade normalization;
- calibration against historical outcomes.

The current scoring engine is a transparent heuristic. It should continue to be described publicly as **Φ v0.1 / an interim fit model**, not as a faithful implementation of the academic EPIF equations.

### Layer 3 — Search and browse UI

Implemented:

- responsive top navigation and desktop page layout;
- search hero, filters, and card grid;
- university detail pages;
- source chips and explicit missing-data states;
- comparison table;
- profile intake;
- ranked results;
- saved plans;
- auth and privacy pages;
- designed loading, empty, offline, error, and refusal states.

The old audit’s claim that the product is mobile-only is no longer accurate. A local browser inspection confirmed a polished desktop layout and live rendering of all 10 Supabase universities with source links.

Remaining product gaps:

- Compare always shows the first three catalogue records. “Add university” and per-column remove controls are not wired.
- Only Computer Science is represented in the current programme rows, while intake offers four subject choices.
- The ranked list is personalized, but the six pathway milestones are the same static text for every student and university.
- There is no instrumentation for pathway runs, saves, citation clicks, refusals, or coverage gaps.
- Sentry is not installed.

### Layer 4 — AI counselor

Implemented in source:

- database retrieval before the model call;
- separation of verified facts from general web guidance;
- citation IDs in the model contract;
- refusal states;
- server-side Perplexity key handling;
- a figure validator;
- strike logging with a service-role client.

Not live:

- `OPTIONS /functions/v1/counselor` returned `404 NOT_FOUND`.
- Perplexity billing/key configuration is not confirmed.
- The required production red-team refusal test has not happened.

Guardrail limitations to address before deployment:

- The function does not filter records by source verification.
- It uses hardcoded aliases for the old 10 universities.
- The validator is regex/substring based. It can miss alternative number/date phrasing and verifies only that figures appear somewhere in supplied records, not that every factual sentence is attached to the correct citation.
- `verify_jwt = false` and wildcard CORS make the function publicly callable; rate limiting is still required to control abuse and cost.

## Current live catalogue

The configured production database still contains:

- Astana IT University;
- Constructor University;
- Eötvös Loránd University;
- Kazakh-British Technical University;
- Nazarbayev University;
- New Uzbekistan University;
- Sabancı University;
- University of Debrecen;
- University of Tartu;
- Westminster International University in Tashkent.

There are currently **zero US universities** in the catalogue.

The application remains coupled to this list:

- intake destinations are Kazakhstan, Uzbekistan, Hungary, Estonia, Germany, and Türkiye;
- search flags and currencies are hardcoded for the same market;
- requirements and UI are IELTS-only;
- counselor aliases and example copy reference KBTU and the current institutions;
- Φ financial scoring applies only tuition, living cost, and a published percentage scholarship.

## Verification results

Run from `app/` on 28 July 2026:

| Check | Result |
|---|---|
| `npm run build` | Pass; 1,723 modules transformed |
| TypeScript | Pass; zero build errors |
| `npm run test` | Pass; 2 files, 11 tests |
| SSR build | Pass |
| SSR render | Pass; 5,102 characters |
| Live catalogue query | Pass; 10 universities |
| Live sources query | Pass; 33 verified, 0 unverified |
| Anonymous profile read | Correctly denied |
| Counselor Edge Function | Fail/not deployed; 404 |
| `app.4prep.ai` DNS | Not configured; NXDOMAIN |

## Repository state

The repository is on `main`.

- Local branch is three commits ahead of `origin/main`.
- The main MVP foundation commit is `e0d8b64`.
- Two later local commits add and relocate the engineering handoff.
- The newest 3-week and US prompts are untracked.
- Five UI source files contain uncommitted copy/layout improvements.
- The 3-month workbook is modified and the 3-week workbook is untracked.
- `.env`, build output, smoke output, macOS files, and TypeScript build metadata are correctly ignored.

This is not a clean handoff state yet. Current work should be consolidated and committed only after the intended next scope is confirmed.

## Highest-priority issues

### P0 — blocks any public launch

1. Deploy the frontend and create `app.4prep.ai` DNS.
2. Deploy the counselor Edge Function and configure its server-side secrets.
3. Configure production SMTP and test confirmation/recovery.
4. Enable appropriate backups/PITR before collecting student profiles.
5. Add the real privacy/support contact and account-deletion process.
6. Run production QA on auth, persistence, cross-user RLS, counselor refusal, and real phones.

### P1 — product-integrity risks

1. Decide whether the US-only pivot is now authoritative.
2. Do not claim faithful EPIF implementation until the paper equations are implemented and reproduced in tests.
3. Make pathway milestones depend on the student, intake, deadlines, and selected universities.
4. Enforce verified-only catalogue reads at the database/Gateway boundary.
5. Strengthen counselor claim-to-citation validation.
6. Wire real compare selection/removal.
7. Expand programme coverage or narrow intake choices honestly.
8. Add freshness/expiry handling for deadlines and annual cost data.

### P2 — operational maturity

1. Add analytics for launch success metrics.
2. Add Sentry or equivalent monitoring.
3. Add rate limiting to the public counselor.
4. Replace overlapping, stale planning artifacts with one current execution plan.
5. Clean and commit the working tree before the next database migration.

## Recommended next sequence

### If the US-only pivot is confirmed

1. Preserve a recoverable export of the current catalogue before destructive migration.
2. Add forward-only enum/schema migrations for US admissions facts and tests.
3. Source the 10-US-university dataset from official pages, with explicit unknowns.
4. Update TypeScript types, mappers, repository queries, source coverage report, and UI.
5. Update Φ to use sourced aid and net cost; bump its version and expand tests.
6. Update intake, filters, English-test handling, counselor aliases, validator, and example copy.
7. Apply the migration only after local/staging verification and a confirmed zero saved-plan count.
8. Regenerate `docs/DATABASE_STATE.md`.
9. Complete the P0 production work and launch QA.

### If the US-only pivot is not confirmed

1. Finish production enablement for the current catalogue.
2. Fix the verified-only boundary and counselor guardrails.
3. Add dynamic pathway milestones and real compare selection.
4. Launch to a small controlled cohort before expanding catalogue breadth.

## Claims that are safe today

- 4Prep has a working source-backed university discovery MVP.
- The live database contains 10 real universities and 33 verified official sources.
- Student profiles and saved plans have owner-only database policies.
- Fit scoring is deterministic and explains five components.
- The app can display known facts with sources and honest unknown states.

## Claims that are not yet safe

- “The public app is live.”
- “The AI counselor is operational.”
- “The catalogue is US-only.”
- “The scoring engine implements the EPIF paper.”
- “The pathway is fully personalized month by month.”
- “The five AI systems are implemented.”
- “The product covers 300 universities.”
- “Real students are actively using the product.”

## Bottom line

The project has crossed the most important early threshold: it is a **real, testable software product with a real database**, not a presentation-only prototype. The remaining gap is no longer “build a backend.” It is:

1. choose and execute the new catalogue direction;
2. finish production infrastructure and privacy operations;
3. close the remaining integrity gaps between the public narrative and what the code actually guarantees;
4. launch to real users and collect evidence.

The foundation is credible. The product is not yet launched, the counselor is not yet live, and the newest US scope has not yet begun.

