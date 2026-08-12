# 4Prep — closing the gap from product to startup

**Date:** 10 August 2026 (Asia/Tashkent)
**Scope:** the three things standing between a well-built app and a business: an honest front door, a path to the Academy, and measurement.
**Method:** verified against the repository and the live site on 10 August. Nothing was modified while writing this.

---

## 0. The finding that reorders everything

`4prep.ai` **is deployed** — but it is not this app. It is a separate marketing site with a
waitlist, a `/build-path` prototype form, and a set of claims that the product in this repository
was deliberately engineered to refuse.

| Landing page says | The product does |
|---|---|
| "92% Path fit", "81%", "67%" on pathway cards | `DASHBOARD.md` — "No acceptance likelihood, admission prediction, readiness score" |
| "Risk level: Moderate — strong fit, IELTS needed" | Same refusal. Risk scoring does not exist and is on the refused list |
| "12-month plan · **on track**" | Same refusal — "on track" and "behind" are named explicitly as banned |
| "Germany / Netherlands (English-taught)", "DAAD, Holland Scholarship" | Catalogue is **10 US universities**, 100% `country = 'US'`. No EU records exist |
| "Trained on real advising" / "advising playbooks encoded into AI" | The counselor is retrieval-grounded on 50 official sources with a figure validator. Nothing is trained |
| Mockup labelled `app.4prep.ai / roadmap` | `app.4prep.ai` does not resolve to anything. The app is not deployed |

To be fair to the site: the prototype is labelled "Interactive prototype", "Sample Student
Profile", "Mock AI roadmap in 60s". That labelling is real and it matters. But a 17-year-old
skimming on a phone reads **92%** and **Germany**, not the word "sample" — and when they reach the
actual product they will find a US-only catalogue that refuses on principle to give them a
percentage.

This is the honesty contract — the single genuine moat in this codebase, enforced with database
check constraints — being contradicted at the front door by your own marketing. Every hour spent
on `DataPoint` provenance is undercut by the homepage. **Fix the copy before you drive a single
person to it.** It is the cheapest item on this entire list and the most damaging one to leave.

### On the Telegram question

You were right to push back, and I withdraw the suggestion. My reasoning was that a deep link
gets a student a human reply in minutes and needs no infrastructure — but you already own
`4prep.ai`, already run a waitlist form, and already publish `contact@4prep.ai`. Pushing students
off your own domain into a third-party chat app would mean you don't own the lead, can't attribute
it, and can't measure the funnel you're about to instrument. **Own the handoff.** Telegram, if it
ever appears, should be a reply channel you offer after capture — not the capture itself.

---

## 1. The build — one working day, in order

Total estimate **8.5 hours**. Sequenced so each step is independently shippable.

### A. Honest front door — 1.5 hrs

| # | Task | Est. |
|---|---|---:|
| A1 | Replace `92% / 81% / 67%` fit percentages and "Risk level" in the hero mockup with the real product's output shape: a named pathway, its five Φ components, and a visible source chip | 0.5 |
| A2 | Change "Germany / Netherlands", "DAAD, Holland Scholarship" to the US catalogue you actually hold. Say "10 US universities, 50 verified sources, gaps shown honestly" — that sentence is a stronger differentiator than a fake 92% | 0.5 |
| A3 | Drop "on track". Replace "Trained on real advising" with "Grounded in 50 verified official sources — it refuses to answer what it can't source" | 0.25 |
| A4 | Remove or gate the `app.4prep.ai / roadmap` label until that subdomain resolves | 0.25 |

### B. Owned handoff — 3 hrs

Placement, per your selection: **pathway results screen** and **university detail on a sourced gap**.

| # | Task | Est. |
|---|---|---:|
| B1 | Migration `202608100017_leads.sql`: `leads` table — `id`, `user_id` (nullable, `ON DELETE SET NULL`), `name`, `contact`, `context_type`, `context_ref`, `source`, `created_at`. RLS on, **zero policies** (deny-all, service-role only) — the same pattern already used for `counselor_requests` and `admin_audit_log` | 0.75 |
| B2 | `AskACounselor` component — name + contact + one prefilled context line. Follows the existing `DataPoint` visual language; states are idle / submitting / submitted / failed. No silent failure | 1.0 |
| B3 | Wire onto the results screen beneath the Φ breakdown, with `source='results'` and the pathway ref | 0.5 |
| B4 | Wire into `MissingValue` in `Trust.tsx` — when a gap renders, offer a person who can find it out. This is the on-brand placement: the honest gap *becomes* the handoff | 0.5 |
| B5 | Surface `leads` in the admin console list view. It already has an authorized read path via `admin-api` | 0.25 |

> **Why B4 is the good one.** Every other product hides its gaps. Yours displays them with a
> reason and a suggested action. Turning "we don't have this" into "we don't have this — a person
> can find out for you" is a conversion surface no competitor can copy without first building the
> provenance system.

### C. Instrumentation — 2.5 hrs

PostHog **EU cloud**, events only, no session replay, IPs anonymized — per your choice.

| # | Task | Est. |
|---|---|---:|
| C1 | PostHog EU project; init behind `VITE_POSTHOG_KEY` so a missing key is a no-op, not a crash. `person_profiles: 'identified_only'`, `disable_session_recording: true`, `mask_all_text: true` | 0.5 |
| C2 | Instrument exactly nine events, no more: `intake_started`, `intake_completed`, `pathway_generated`, `university_viewed`, `university_saved`, `counselor_asked`, `counselor_refused`, `lead_submitted`, `lesson_completed` | 1.0 |
| C3 | Sentry on `app/` and the three edge functions. `tracesSampleRate: 0.1`, `sendDefaultPii: false` | 0.75 |
| C4 | Add analytics + lead capture to the privacy policy screen **before** either ships. Non-negotiable: your users include minors | 0.25 |

### D. Then deploy — 1.5 hrs

| # | Task | Est. |
|---|---|---:|
| D1 | Point `app/.env` and `admin/.env` back at QA (`forrvcsttklmpmfhxums`). Still open from the 5 Aug audit — `npm run dev` currently reads and writes **production** rows | 0.25 |
| D2 | Vercel project from `app/`; add `app.4prep.ai` | 0.5 |
| D3 | Hostinger DNS: `CNAME app → cname.vercel-dns.com`. Verify the cert issues before announcing | 0.25 |
| D4 | Add `/support` to `app/vercel.json` rewrites — the catch-all covers it, but the list reads as exhaustive and isn't | 0.1 |
| D5 | Smoke the deployed build on a real Android phone on a real mobile network. Not a desktop viewport | 0.4 |

---

## 2. Tool decisions, settled

| Tool | Verdict | Why |
|---|---|---|
| **PostHog** (EU cloud, free tier) | Adopt now | Funnels + feature flags. Replay deferred until consent copy is live |
| **Sentry** (free tier) | Adopt now | Already budgeted in the plan as W8 "Wire Sentry · BUY" |
| **Vercel** | Adopt now | Already the assumed target — `vercel.json` exists in both deployables |
| **Resend** | Adopt at cohort | Supabase's default SMTP will spam-folder your first invite batch |
| **Supabase paid + PITR** | Adopt before cohort | Blast radius is one profile today, not tomorrow |
| **HubSpot / any CRM** | **Defer** | A `leads` table and the admin console are enough until a spreadsheet hurts |
| **Stripe / payments** | **Defer, but resolve the question** | Whether card rails reach your market at all constrains the business model. Worth confirming before designing any paid tier — if they don't, "free app, Academy monetizes" is forced rather than chosen |

---

## 3. Not in this day, still owed

Carried from the 5 Aug audit, unchanged and still true:

1. **`program_facts` is empty.** Intake offers four subjects; only Computer Science has programme
   coverage. A student picking Engineering gets a promise the data cannot keep — the most
   on-brand-violating gap in the codebase. Free fix: reduce the intake to what you can source.
2. **`docs/DATABASE_STATE.md` contradicts itself** on production migration state (line 15 vs
   lines 183–185). A source of truth that disagrees with itself licenses a confident wrong decision.
3. **`app/CLAUDE.md` omits three migrations** (`202608040013`, `014`, `015`) from its ordered list.
4. **588 kB main chunk** for a phone-first product on Central Asian mobile networks.
5. **`verified_universities` view exists and is unused** — switch the public read to it before a
   data researcher imports the first unverified row.
6. **Catalogue is 10 universities**, against a plan target of 15–20.

---

## 4. What "startup" actually requires next

The engineering is not the constraint and hasn't been for weeks. After this day of work you will
have, for the first time, a deployed product with a measurable funnel and a way for a student to
reach a human who can charge them. That is the minimum definition of a business.

The thing that follows it is not a feature. It is **ten real students**, recruited from the
existing Academy cohort, using the deployed app while you watch the funnel. Everything you build
after that should be chosen by what those ten people do — not by what the plan written on 24 July
guessed they would do.
