# 4Prep.ai — Team, Launch & Profitability Plan

**Prepared for:** Abdiaziz (Jeff) Abdishukurov, Founder — 4Prep Academy / 4Prep.ai
**Date:** 1 August 2026
**Basis:** repository audit (18 commits, ~8,200 LOC), live working tree, `docs/DATABASE_STATE.md`, `docs/PROJECT_STATUS_REPORT_2026-07-28.md`, `docs/LEARNING_PORTAL.md`, `app/CLAUDE.md`, the Roadmap Brief, the Ground Truth proposal, the 3-week and 12-week workbooks, the Learning Portal concept note, the Designer and Data Researcher briefs, and DNS checks on `4prep.ai` / `app.4prep.ai`.

---

## 0. Read this part first

You asked me to design a team that helps you "acquire paying customers and begin generating profit." Then you told me the platform must be free and profit comes from another source.

Those two statements do not fit together, and the gap between them is the most important thing in this document.

**If the app is free forever, the app has no customers. It has users — and every user is a cost line.** That is a perfectly good model. It is roughly how Niche, Zillow, and every lead-generation product works. But it inverts almost every hiring instinct:

- No hire can be justified by "they will bring in revenue." None of them will. Revenue happens at 4Prep Academy.
- Success makes your costs go *up*, not down. A hit counselor is a Perplexity bill.
- The thing that decides whether this project ever pays for itself is not in your codebase.

And here is the finding that should stop you before you hire anyone:

> **There is no connection whatsoever between the app and 4Prep Academy.** I grepped the entire source tree. There is no "talk to a counselor" CTA, no contact route, no consultation booking, no WhatsApp or Telegram handoff, no lead capture, no mention of the Academy anywhere in the UI. The only outbound links in the product are university source citations and assignment templates.

You have spent roughly 168 planned hours building a beautiful, honest, sourced free product that cannot pass a single person to the business that makes money. Under your own stated model, that is not a missing feature. It is the entire mechanism, and it does not exist.

Build that before you hire a designer.

---

## 1. Current project assessment

### 1.1 What stage you are actually at

**Late pre-launch MVP. Code-complete in the core, zero public existence.**

Concretely, as of today:

| Dimension | State | Evidence |
|---|---|---|
| Application code | Real and working locally | 6,962 LOC `src/`, 1,264 LOC edge functions, build + 11 tests passing |
| Public deployment | **None** | `app.4prep.ai` and `4prep.ai` both return no DNS record |
| Counselor | Code complete, not deployed | Edge function source present; last verified state `404 NOT_FOUND` |
| Database | Live, Free plan, **no backups** | Supabase `pubhgajlqhdbpwqahtki`, Tokyo, Nano compute |
| Catalogue | 10 US universities, 50 verified sources, 110 facts, 60 requirements | `docs/DATABASE_STATE.md` |
| Real users | 1 student profile, 4 saved plans — your own testing | Live row counts |
| Revenue infrastructure | **None, and by your decision none is needed** | No payment, entitlement, or tier code anywhere |
| Academy handoff | **None** | No CTA or contact path in any screen |
| Uncommitted work | **~2,200 lines living only on your laptop** | 24 modified files + untracked `dashboard/`, `learning/`, `motion/`, `routes.ts`, `public/` |

You are approximately two to three weeks of focused work from being live. You are considerably further from being useful to the Academy.

### 1.2 What is genuinely strong

I want to be precise here, because most of what I am about to say in Section 1.3 is critical, and it would be misleading to leave the impression that this is a weak project. It is not. Several things here are better than what I see in funded seed-stage companies.

**The provenance architecture is the real asset.** The `DataPoint<T>` known/unknown contract, enforced at the database level with check constraints, surfaced through `DataValue` → `SourceChip`/`MissingValue`, with a hard rule against zero/em-dash/estimate fallbacks — this is a genuine competitive moat and it is architecturally enforced rather than promised. Ten universities with 50 verified official sources and *documented, reasoned gaps* is worth more than 300 universities scraped from US News. You were right to build this first, and right to refuse the shortcut.

**The counselor hardening is unusually disciplined.** Scope gate runs before the provider call so off-topic questions cost one regex pass. Database retrieval precedes the model. Figures are validated against supplied records. Unsupported claims produce refusals and log strikes. There is a real rate limiter (`begin_counselor_request` RPC, 8/min and 40/hr anonymous, 20/min and 200/hr authenticated), a response cache keyed on prompt/Φ/cache version, IP salting, and seven-day pruning. Most teams shipping an "AI counselor" in 2026 have none of this.

**Security posture is sound.** RLS on every table. Owner-only policies on profiles, saved plans, submissions, and progress. Anonymous profile reads verified as denied against production. Storage policies that check both folder ownership and `owner_id`, with MIME and size caps enforced in the bucket policy, the object policy, the metadata table, *and* the UI. The learning portal migration was verified by executing it inside a transaction against production and deliberately rolling it back. That is a level of care I rarely see.

**Φ is deterministic, versioned, and unit-tested,** and you have consistently refused to let AI compute it. You have also been honest in your own documents that it is not the EPIF paper's exact equations. Keep that honesty; it costs you nothing and protects the academic claim.

**Your documentation is your cheapest hiring asset.** `DATABASE_STATE.md`, `LEARNING_PORTAL.md`, `CLAUDE.md`, the two role briefs, the QA audit workbooks. A new engineer can be productive here in two days instead of two weeks. That is worth thousands of dollars and you already paid for it.

**And the thing that is not in the repo at all: six years of 4Prep Academy, real placements, real students, an existing list.** That is your only distribution. It is also, under a free-platform model, your only revenue. Everything in this plan is oriented around connecting the software to it.

### 1.3 Gaps

**Business model — the largest gap by a wide margin.**

- No app→Academy handoff exists (covered above). Nothing to fix it in any current plan document.
- Your own Learning Portal concept note lists "Is this the paid tier?" as an open question. You have now answered "no, everything free" — but that answer has not been propagated into any plan, and it makes the Portal's economics much harder, not easier. The Portal's expensive component is open-artifact essay review, which your own note says is "high" cost to serve and "should probably be gated behind the paid tier from day one." With no paid tier, either that feature does not get built, or it is subsidised by the Academy, or it becomes an Academy service. Decide which.
- "Profit from another source" is not written down anywhere I can find. There is no document stating what the Academy charges, what an enrolled student is worth, or how many the app needs to produce to justify its cost. Without that number, no hiring decision in this document can be validated — including mine.

**Technical.**

- ~2,200 lines uncommitted. Single point of failure. This is a 20-minute fix and it is the highest risk-per-minute item in the entire project.
- Migrations `008` (counselor scope outcome) and `009` (learning portal) are written and unapplied. `008` in particular must ship before redeploying the counselor, or every off-topic question fails its outcome write.
- **Supabase Free plan with no backups, holding real student grades, budgets, and profiles.** You currently have 1 profile so the blast radius is nil. The day you soft-launch it is not. This is not a "should"; do not put a cohort on this.
- No error monitoring. No Sentry, no analytics, no instrumentation of any kind. Under a lead-generation model this is not a nice-to-have — if you cannot measure the funnel, you cannot prove to yourself that the app produces Academy leads, and you will be guessing at every subsequent decision.
- Counselor is public (`verify_jwt = false`) and calls a metered paid API. The rate limiting and caching you built are good and materially reduce this. But Perplexity does not document a hard spend cap; your own `DATABASE_STATE.md` correctly identifies "keep auto-reload off, keep a small prepaid balance" as the backstop. Under a free-platform model this is your single largest variable cost and it scales directly with success.

**Product.**

- Ten universities is thin for a returning-visitor product. A student exhausts it in one session.
- Programme coverage: `program_facts` has 0 rows and only Computer Science is represented, while intake offers four subject choices. That is a promise the data cannot keep.
- Pathway milestones are static text for every student and university — the "month-by-month plan" in your Roadmap Brief's success scene is not yet personalised.
- Mobile. Your user is a 17-year-old on a phone; the app was built desktop-first. Your own designer brief flags that the two *most affordable* universities (Berea, Houston City College) have the most gaps, and gaps currently render as amber boxes that read like errors. That is a conversion leak aimed precisely at the students you most want.

**Design.** Covered by your existing brief, which is good. It is a two-to-three week freelance job, not a hire.

**Security & compliance.**

- Privacy contact and account-deletion process are still placeholders. You cannot collect production accounts without them.
- **Your target user is 17.** You are collecting grades, budget, and language scores from minors. That carries obligations beyond a generic privacy page, and it varies by jurisdiction. I am not a lawyer and you should not treat this document as legal advice, but this is worth one paid hour with someone who is, before the cohort — not after.
- Public catalogue RLS policies read base tables without a `verified` predicate. Safe today because all 50 sources are verified; unsafe the moment a researcher imports an unverified row. Since you are about to hire a data researcher, this becomes live risk in week 3.

### 1.4 The biggest risks preventing launch or revenue, ranked

1. **No app→Academy path.** Under your model, launching without it produces zero return on the entire investment. Rank 1 by a distance.
2. **Not deployed.** Everything else is theoretical until `app.4prep.ai` resolves.
3. **No instrumentation.** You will not be able to tell whether the app works as a lead source, so you will not be able to decide anything after launch.
4. **Founder capacity.** 20 h/week, and your first three hires will consume 8–10 h/week in briefing and review before they return a single hour. Your build velocity goes *down* in weeks 1–3. Plan for it.
5. **Bus factor / no backups.** 2,200 uncommitted lines and a Free-tier database holding student data.
6. **Unvalidated demand.** Zero people outside you have used this. Every plan in the repo assumes students want it. That is the assumption most likely to be wrong and the cheapest to test.
7. **Free-product cost scaling.** Success increases the Perplexity bill with no offsetting revenue in the app.
8. **Content production for the Portal is founder-bound** — 40+ scripted, recorded, captioned lessons that no hire can do for you. Do not start it before the paper pilot passes.

---

## 2. Hiring priorities

### 2.1 The test every hire must pass

Under a free platform, "will this person generate revenue?" is the wrong question — nobody in the app generates revenue. Use this instead. A hire is justified only if they do at least one of:

- **Buy back founder hours** on work that is not your differentiated contribution.
- **Increase Academy conversion** from app users.
- **Retire a specific risk** that would embarrass the product or the public record.

Anything that fails all three is a hire you are making because startups have that role. Don't.

### 2.2 Hire immediately (weeks 1–2)

**1. Part-time full-stack engineer (Supabase + React/TS).** The one recurring technical person. Justification: buys back founder hours. You have 20 h/week and you are the only person who can do the methodology, the data standard, and the operator-knowledge encoding. Every hour you spend on DNS records and SMTP DKIM is an hour stolen from the only work that is actually yours.

**2. Product designer — fixed-scope freelance project, not a hire.** Justification: Academy conversion. Your user is on a phone, the app is desktop-first, and honest gaps currently look like errors on your cheapest universities. The brief is already written, which cuts the cost substantially.

### 2.3 Hire at soft launch (weeks 4–5)

**3. Academy conversion / student success lead — part-time, ideally a reassignment, not a new headcount.** Justification: this is the only role connected to profit. They run the pilot cohort, give the Module 1 paper-pilot feedback by hand, and are the human on the other end of the app→Academy handoff. Hire them *when there is a cohort*, not before — hiring in week 1 buys you a person with nothing to convert.

**4. Data researcher — part-time freelance.** Justification: buys back founder hours and deepens the moat. Brief already written. Cheapest high-leverage role in the plan. Deliberately placed after launch because catalogue breadth does not matter until someone is browsing it, and because it forces the verified-only RLS fix first.

### 2.4 Explicitly do not hire yet

| Role | Why not |
|---|---|
| Growth marketer | Your distribution is the Academy list. You already own it. A marketer with no product-market evidence burns cash learning what one pilot cohort would tell you free. |
| Product manager | With one part-time engineer and one designer, you are the PM. Adding one adds a translation layer between you and two people. |
| DevOps / SRE | Supabase + Vercel *is* your ops. Buy, don't build — as your own workbook says. |
| Backend specialist | Your backend is 420 lines of edge function and some SQL. It does not need an owner. |
| Video/content producer | Blocked on the Phase 0 paper pilot. If students will not finish one written module, recording video is a five-figure mistake. |
| QA engineer | Your test suite plus a designer's mobile pass plus a pilot cohort covers this at your scale. |
| Second engineer | Not until the first one is saturated *and* the funnel shows the app matters. |

### 2.5 Exact hiring order

```
Day 0-2    (You, free)      Commit and push everything. Zero cost. Do it today.
Week 1     Hire #1          Part-time full-stack engineer starts — launch ops first
Week 1     Post #2          Designer brief out to 3-5 candidates, paid trial task
Week 2     Hire #2          Designer starts the mobile pass
Week 4-5   Hire #3          Academy conversion lead — timed to the pilot cohort
Week 5-6   Hire #4          Data researcher — after verified-only RLS is enforced
```

### 2.6 Engagement type for each

| Role | Type | Why |
|---|---|---|
| Full-stack engineer | **Part-time contract, 20 h/wk, monthly renewable** | You cannot afford full-time and cannot supervise it at 20 h/wk. Monthly renewal keeps the exit cheap. |
| Designer | **Fixed-scope freelance project** | Finite deliverable with a written brief. Do not put design on retainer. |
| Academy conversion lead | **Part-time employee or reassignment** | Needs Academy context, trust, and continuity with students. Not a freelance relationship. |
| Data researcher | **Freelance, per-university piece rate** | Piece rate aligns incentives with your quality bar. Pay per *accepted, sourced* record, not per hour. |

### 2.7 What you must keep doing yourself — permanently

These are non-delegable, and two of them are non-delegable for reasons that have nothing to do with skill:

- **EPIF / Φ methodology, weights, and versioning.** It is the moat, it is the paper, and it is your named contribution.
- **Operator knowledge encoding** — which universities admit which profiles. Six years of cases. Nobody else has it.
- **The data verification standard** — the final "is this source acceptable" call. Delegate the sourcing labour, never the standard.
- **Counselor product rules and refusal policy** — including "the counselor presents options and never decides for the student." That is your method, stated in your own words, and it should not drift.
- **Business model, pricing, and the Academy relationship.**
- **Curriculum authorship** for the Learning Portal.
- **Anything that appears in the public record or the EB-1A petition as your original contribution.** This is a real constraint that argues for a *smaller* team than budget alone would suggest. Hires should take execution surface — deployment, pixels, data entry — not authorship of the contribution. A team that builds the methodology *for* you weakens the exact claim the product exists to support.

---

## 3. Role-by-role recommendations

### Role 1 — Part-time Full-Stack Engineer (Supabase / React / TypeScript)

**Seniority:** Mid-level (3–5 years). Not junior — they will work unsupervised against production. Not senior — the work is well-specified and a senior will be bored and expensive.

**Workload:** 20 h/week, 12 weeks, monthly renewable.

**Main responsibilities**

- Weeks 1–2: production enablement. Apply migrations `008` and `009`; deploy the counselor edge function with server-side secrets; Supabase Pro + backups/PITR; Resend SMTP with SPF/DKIM; Vercel project and `app.4prep.ai` DNS; Sentry; privacy-safe analytics.
- Build the **app→Academy handoff** and its instrumentation. Highest-value single task in the plan.
- Implement the designer's mobile pass.
- Enforce verified-only catalogue reads at the database boundary before the researcher starts importing.
- Own the counselor cost dashboard: cache hit rate, spend per active user, alerting.
- Learning Portal Phase 0/1 support — only after the paper pilot gate passes.

**Required technical skills**

- TypeScript, strict mode, zero-error discipline (your codebase demands it)
- React 19, hooks, no state-management library — your app uses a hand-rolled router and provider pattern
- Supabase: RLS policy authoring, forward-only migrations, edge functions on Deno, storage policies
- Tailwind v4 core utilities only
- Vercel deploy, DNS, SMTP/DKIM basics
- Enough security instinct to not put a service-role key in a `VITE_` variable

**Required soft skills**

- Will say "the source doesn't publish that" rather than filling a gap. Non-negotiable — it is the whole product.
- Works from written briefs asynchronously. You have 20 h/week; you cannot pair.
- Comfortable being told "don't build that." Your cut list is long and it must hold.

**Deliverables**

*Day 30* — App live at `app.4prep.ai`. Counselor deployed and passing a red-team refusal test on a deliberately unknown figure. Backups on and one restore drill completed. SMTP verified end-to-end with a non-team address. Sentry and analytics reporting. **Academy handoff live and instrumented.** Working tree committed and pushed.

*Day 60* — Mobile pass implemented at 375px across all seven screens. Verified-only reads enforced at the DB boundary. Full funnel instrumented end to end. Counselor cost dashboard live with alerting. Compare screen selection/removal wired. Programme coverage either expanded or intake choices honestly narrowed.

*Day 90* — Pilot cohort feedback shipped. Pathway milestones personalised by student and intake. Learning Portal Phase 1 live *if and only if* the paper pilot passed its gate. A written handover doc in the style of `CLAUDE.md`.

**Contribution to launch/revenue:** Indirect but decisive. They are the reason launch happens in week 2 instead of week 8, and they build the only mechanism that turns app usage into Academy conversations.

**Interview questions**

1. "This app shows a university's tuition. The university's official page doesn't publish it. What does the screen show?" — *Listening for:* an explicit unknown state with a reason and a next action. If they say "N/A", "—", "0", or "we could estimate from similar schools," end the interview. This is the single best filter for this project.
2. "A public edge function calls a paid API with no auth required. How do you keep the bill bounded?" — *Listening for:* rate limiting, caching, a cheap pre-filter before the paid call, prepaid balance, alerting. Bonus if they ask about per-IP vs per-user limits.
3. "Walk me through how you'd verify an RLS policy actually prevents cross-user reads — not that you wrote it, that it works."
4. "You've been asked to add a feature that's on the founder's explicit cut list, and you think it's a good idea. What do you do?"
5. "You have 20 hours a week and I'm asleep in a different timezone half your day. How does that work?"

**Practical test task (paid, 3–4 hours, ~$120–200)**

> Here is our repo and `docs/DATABASE_STATE.md`. In a branch: (a) add a `contact_requests` table with RLS such that an authenticated user can insert and read only their own rows and anonymous users can insert but read nothing; (b) add a minimal "Talk to a 4Prep counselor" component that writes to it, with the app's existing loading, error, and offline states; (c) write a migration that is forward-only and safe to run twice; (d) write one test that proves the cross-user read is denied. Do not add dependencies. Do not touch the design tokens.

*Why this task:* it is real work you need, it exercises RLS + migrations + your design system + your state discipline in one pass, and the deliverable is directly usable if they pass.

---

### Role 2 — Product Designer (fixed-scope freelance)

**Seniority:** Mid to senior, mobile-first product designer. Must have shipped consumer mobile web.

**Workload:** 2–3 weeks, roughly 60–80 hours total.

**Main responsibilities:** exactly what is in your existing `docs/planning/4Prep_Frontend-Designer-Brief.md` — mobile at 375px, the honest-gap system, net-cost-first cost display, fit-score comprehension, counselor trust hierarchy, source chips, designed states. Plus one addition the brief does not currently contain: **design the Academy handoff** — where it appears, how it reads, and how it avoids feeling like a bait-and-switch on a product that promised to be free.

**Required skills:** Figma; designing to existing tokens rather than inventing a palette; WCAG AA, visible focus, 44px targets; comfort designing *absence* — empty, missing, refused, offline. Ability to make honesty look deliberate rather than broken is the actual job.

**Soft skills:** accepts constraint. The brief says no new palette, no new typeface, no chat-first redesign. A designer who argues with that in week one is the wrong designer.

**Deliverables**

*Day 30 (project complete)* — Figma at 375px and 1280px for all seven screens plus auth and privacy; the gap/missing-data system documented as a reusable pattern; component specs mapped to existing `index.css` tokens; interaction notes; Academy handoff designed in three placements.

*Day 60* — Two review passes on the engineer's implementation; adjustments from real-device testing.

*Day 90* — Optional small retainer for pilot-cohort-driven fixes. Do not carry them further unless there is specific work.

**Contribution:** Direct conversion impact. Your affordable universities have the most gaps; if gaps look like errors, budget-constrained students bounce off exactly the options they need — and never reach the Academy handoff.

**Interview questions**

1. "Show me a screen where you designed the state when data was missing." — *Listening for:* whether they have ever thought about this at all. Most have not.
2. "Our student sees $85,000 as a sticker price and has $8,000. She's on a phone. What's the first thing on screen?"
3. "How do you make 'we don't know this' feel like a feature instead of a bug?"
4. "The app is free and always will be, but we want users to talk to our paid consulting service. How do you design that without it feeling like a trap?"

**Practical test task (paid, ~$150–250)**

> One screen — the university profile for Berea College at 375px — using our existing tokens from `index.css`. Berea has five honest gaps. Show real values from our catalogue only; no invented figures anywhere, including in wireframes. Deliver the gap treatment as a documented pattern, not a one-off.

*Why this task:* it is the hardest screen in the product (most gaps, most affordable, most important), and the "no invented numbers even in mockups" rule filters out the majority of designers immediately.

---

### Role 3 — Academy Conversion / Student Success Lead (part-time)

**This is the only role connected to profit. If you hire exactly one person, and the platform is free, it is arguably this one and not the engineer.**

**Seniority:** Mid. Needs admissions domain knowledge and student-facing warmth far more than seniority. Strong candidate profile: a 4Prep Academy alum who went through the process themselves, or an existing Academy team member reassigned part-time.

**Workload:** 10 h/week, starting week 4–5.

**Main responsibilities**

- Recruit and run the pilot cohort from the existing Academy list.
- Be the human on the other end of the app→Academy handoff. Response time is the product here.
- Run the Learning Portal **Phase 0 paper pilot**: Module 1 only, written lesson, shortlist template, feedback given by hand. This is the cheapest and most important experiment in the entire roadmap.
- Own the conversion funnel from app user to Academy consultation to enrolment, and report it weekly.
- Feed real student language back into product decisions.

**Required skills:** US admissions process fluency; Uzbek/Russian and English; comfortable with a spreadsheet CRM (do not buy a CRM at this stage); can give structured written feedback on a student shortlist.

**Soft skills:** patient with anxious 17-year-olds and their parents; will not oversell. A conversion person who promises admission outcomes destroys the honesty positioning that is the entire product.

**Deliverables**

*Day 30* — 25–40 pilot students recruited and onboarded. Funnel tracking sheet live. First 10 handoff conversations completed with logged outcomes.

*Day 60* — Phase 0 paper pilot run with 15 students, against a **completion threshold you set before it starts, not after**. First Academy conversions attributed to app-sourced students. Written objection log from real conversations.

*Day 90* — Documented conversion rate from app user → consultation → enrolment. A go/no-go recommendation on Learning Portal Phase 1 based on paper-pilot completion. Repeatable playbook for the handoff.

**Contribution:** This is the profit mechanism. Everyone else builds the machine; this person is the only one who turns its output into money.

**Interview questions**

1. "A student's shortlist has ten universities and none are financially reachable on their family budget. Walk me through that conversation."
2. "A parent asks whether we can get their child into Harvard. What do you say?" — *Listening for:* honesty under commercial pressure. Anyone who hedges toward yes is disqualifying.
3. "How would you get 30 students from our existing list to try a product that has never been public?"
4. "A student finishes Module 1 homework and it's poor. How do you give feedback that keeps them going?"

**Practical test task (paid, ~4 hours)**

> Take three real (anonymised) student profiles. For each, write the feedback you would give on their university shortlist using only our sourced catalogue of 10 universities, and draft the message that invites them to an Academy consultation without pressuring them or promising an outcome.

---

### Role 4 — Data Researcher (part-time freelance, piece rate)

**Seniority:** Junior. This is deliberately a junior role with a senior-grade written standard — your brief is excellent and does the supervision for you.

**Workload:** 10–15 h/week. Pay per accepted university record, not per hour.

**Main responsibilities:** exactly your `docs/planning/4Prep_Data-Researcher-Brief.pdf`. Source the 17 admissions records per university from official pages only; record link, date checked, and saved PDF; write an explicit reason and next action for every gap.

**Required skills:** meticulous; reads English university websites accurately; distinguishes "minimum IELTS 7 required" from "our strongest applicants usually have IELTS 7" — your brief already flags this and it is the whole job.

**Soft skills:** comfortable reporting a gap as a finished answer. A researcher who feels bad about blanks will quietly guess, and one guessed tuition figure destroys the product's central claim.

**Deliverables**

*Day 30* — 8–10 new universities fully sourced to standard. Process timed so you know your true minutes-per-university.
*Day 60* — 25–30 universities total in the catalogue. 10% spot-audit passing.
*Day 90* — 40–50 universities. Coverage spanning the cohort's actual target profiles, driven by what pilot students search for.

**Contribution:** Indirect. Deepens the moat and makes the app worth returning to. Cheapest leverage in the plan.

**Interview questions**

1. "Yale's admissions page doesn't publish a single F-1 financial-certification amount. What do you write?" — *Listening for:* the reason-plus-action pattern from the brief, not "N/A."
2. "You find the tuition on Niche and it looks right. Can you use it?"
3. "A university lists tuition, fees, room, and board separately but no total. Do you add them up?" — *Correct answer: no, never.*

**Practical test task (paid, ~$30–50)**

> Source one university we don't have — Berry College — for all 17 items in the brief. Every answer needs a link, a date, and a saved PDF. Every gap needs a reason and an action.

*Grade on:* zero invented values, link precision (not homepages), and whether gaps are written as finished answers.

---

## 4. Three lean team structures

Costs use grounded market data: Uzbekistan software developer average ≈ $26,600/yr, junior $15,960–21,280, senior $31,920–47,880; remote-market UZ developers median ≈ $45,895; Eastern European freelance $40–80/hr. Sources listed at the end.

### Plan A — Minimum budget (~$5,000–7,500 / 90 days)

| Role | Engagement | Cost |
|---|---|---|
| Launch contractor | Fixed scope, ~40 h @ $45–60 | $1,800–2,400 |
| Designer | Cut to 3 critical screens | $700–1,200 |
| Data researcher | Piece rate, ~15 universities | $600–900 |
| Academy conversion | Reassigned Academy staff / commission only | $0–1,500 |
| Infrastructure (Supabase Pro, Vercel, Perplexity, domain, Sentry) | 3 months | $250–450 |
| **Total** | | **$3,350–6,450** |

**Advantages:** Barely dents your budget. Leaves $10k+ in reserve for after you know whether this works. Forces ruthless scope.

**Risks:** You remain the only engineer. After launch, iteration speed is capped at your 20 h/week, and pilot feedback will arrive faster than you can act on it. Learning Portal Phase 1 does not happen in 90 days.

**Launch speed:** 3–4 weeks.

---

### Plan B — Balanced ⭐ **recommended** (~$10,000–14,500 / 90 days)

| Role | Engagement | Cost |
|---|---|---|
| Full-stack engineer | 20 h/wk × 12 wks, mid-level local market | $5,400–7,500 |
| Designer | Full brief, fixed scope | $1,500–2,500 |
| Academy conversion lead | 10 h/wk × 8 wks | $1,300–2,200 |
| Data researcher | Piece rate, ~30 universities | $900–1,400 |
| Paid trial tasks (4 candidates) | One-off | $300–500 |
| Infrastructure | 3 months | $250–450 |
| **Total** | | **$9,650–14,550** |

**Advantages:** Fits your stated budget with genuine reserve. Launch in 2–3 weeks *and* capacity to act on pilot feedback. All four functions covered without a single full-time salary. Your hours go to methodology and operator knowledge — the things only you can do and the things the public record rests on.

**Risks:** Four people at 20 h/week of founder time is close to your management ceiling. Mitigate with written briefs (you are already good at this) and one weekly 45-minute call each, not daily standups. Second risk: the engineer becomes a bottleneck in weeks 5–8 when designer output and researcher output both land on them. Sequence the designer's implementation ahead of the researcher's import work.

**Launch speed:** 2–3 weeks to public, week 5 to pilot cohort.

---

### Plan C — Faster launch (~$22,000–33,000 / 90 days)

| Role | Engagement | Cost |
|---|---|---|
| Senior full-stack engineer | Full-time, remote market rate | $12,000–18,000 |
| Designer | Full brief + retainer | $3,000–4,500 |
| Academy conversion lead | 20 h/wk | $2,600–4,400 |
| Data researchers ×2 | Piece rate | $1,800–2,800 |
| Video/content production | Portal Phase 1 | $3,000–5,000 |
| Infrastructure | 3 months | $400–700 |
| **Total** | | **$22,800–35,400** |

**Advantages:** Live in under two weeks. Portal Phase 1 with real video by day 90. Catalogue past 60 universities.

**Risks — and I recommend against this:**

- It exceeds your stated budget by roughly 2×.
- It front-loads video production *before* the Phase 0 paper pilot tells you whether students finish a written module. Your own concept note names this as the make-or-break risk and prescribes the cheap test first. Plan C skips the test.
- You cannot manage five people at 20 h/week. You will become the bottleneck and pay full-time rates for partially-blocked people.
- Highest burn against completely unvalidated demand. Zero people have used this product.
- Under a free-platform model there is no revenue ramp to grow into. Plan C's burn is repaid only by Academy conversions that do not yet exist.

**Launch speed:** 10–14 days. Which buys you almost nothing, because the constraint is not launch date — it is whether students want this.

---

### Comparison

| | Plan A | **Plan B** ⭐ | Plan C |
|---|---|---|---|
| 90-day cost | $3.4–6.5k | **$9.7–14.6k** | $22.8–35.4k |
| Public launch | Week 3–4 | **Week 2–3** | Week 2 |
| Pilot cohort | Week 6 | **Week 5** | Week 4 |
| Post-launch iteration | Founder only | **20 h/wk** | 40 h/wk |
| Catalogue at day 90 | ~25 | **~40** | ~60 |
| Portal progress | Phase 0 only | **Phase 0, Phase 1 if gate passes** | Phase 1 regardless |
| Founder mgmt load | ~4 h/wk | **~8 h/wk** | ~15 h/wk (over ceiling) |
| Risk if demand is weak | Low | **Contained** | Severe |

---

## 5. Launch and profitability plan

### 5.1 Must be complete before launch

**Non-negotiable, in order:**

1. Commit and push the working tree. Today. Free.
2. Apply migration `008`, then `009`.
3. Supabase Pro ($25/mo — includes daily backups with 7-day retention, which is sufficient at your scale). One restore drill actually performed. **Do not buy PITR** — it is a $100/mo add-on and you do not need it until you have real transaction volume worth recovering to the second.
4. Counselor edge function deployed; `PPLX_API_KEY` as a server-side secret only; prepaid balance small; auto-reload **off**; spend alert configured.
5. Vercel deploy, `app.4prep.ai` DNS, browser-safe env vars only.
6. Resend SMTP with SPF/DKIM verified; confirmation and recovery tested with a non-team address; link tracking disabled.
7. Real privacy contact and a documented account-deletion process. Plus one hour of actual legal advice on collecting data from 17-year-olds.
8. **The app→Academy handoff, built and instrumented.** Under your model this gates launch as hard as the deploy does.
9. Sentry plus privacy-respecting analytics covering the full funnel.
10. Counselor red-team test in production: a deliberately unknown tuition figure must produce a plain refusal citing nothing.
11. Mobile QA at 375px on real phones on real Uzbek mobile data — not a desktop browser resized.

### 5.2 Can be postponed

Everything else, and specifically: the remaining ~290 universities; the exact EPIF paper equations; the other four AI engines; the admin console, verification queue, and outcome ledger; Learning Portal Phases 1–3; AI essay feedback; cohorts and peer review; desktop redesign; subtitles and localisation; personalised pathway milestones (week 6–8, not launch); programme breadth beyond Computer Science (narrow the intake choices honestly instead).

### 5.3 Sequence from today to first attributed revenue

**Weeks 1–2 — Get it live.** Engineer runs the launch checklist. You write the Academy handoff copy and the pilot invitation. Designer starts. Gate: `app.4prep.ai` resolves, counselor refuses correctly, backups on, handoff instrumented.

**Weeks 3–4 — Get it usable on a phone.** Designer delivers; engineer implements the top mobile fixes. You personally run five students through the product while watching them. Gate: a student completes intake on their own phone without help.

**Weeks 5–6 — Pilot cohort.** Conversion lead recruits 25–40 from the Academy list. Full funnel instrumented. Gate: ≥60% complete intake, ≥40% save a plan, ≥15% click the Academy handoff.

**Weeks 7–8 — The paper pilot.** Module 1 only. Written lesson, shortlist template, feedback by hand. Set the completion threshold before you start. Gate: ≥50% submit the shortlist homework. If it fails, do not record a single video — and that failure will have cost you about two weeks instead of $5,000.

**Weeks 9–10 — Convert.** Conversion lead works the handoff queue. Researcher expands the catalogue toward what pilot students actually searched for. Gate: first Academy consultations attributable to app-sourced students.

**Weeks 11–12 — Measure and decide.** Attribution report. Portal go/no-go. Decide whether to renew the engineer.

### 5.4 What "profitability" means for a free platform

Since no money moves through the app, the only honest definition is:

```
Monthly Academy revenue attributable to app-sourced students
  >  app infrastructure cost + app team cost
```

Your infrastructure floor is small and knowable — roughly **$85–150/month** at pilot scale: Supabase Pro $25 (daily backups included; skip the $100 PITR add-on), Vercel, domain, Sentry free tier, and Perplexity usage, which is the only genuinely variable term. Against that, a handful of Academy enrolments covers the running cost easily.

**The number I cannot supply and you must:** what one enrolled Academy student is worth to you. Everything downstream depends on it. If an enrolment nets $500, Plan B's ~$4,000/month all-in needs about 8 app-sourced enrolments a month to break even on the *team*; at $1,500 it needs under 3. Until that figure is written down, no one — including me — can tell you whether Plan B is affordable or a bargain.

Once the team contracts end, the ongoing bar drops to roughly $150/month, which is one enrolment a year. The 90-day team cost is best understood as a one-time build investment, not a recurring burn.

### 5.5 KPIs

**North star:** qualified Academy consultations generated by the app per month.

**Funnel:** visitors → intake started → intake completed → plan saved → account created → **handoff clicked** → consultation booked → enrolled. Instrument every step; the handoff click is the one that matters.

**Cost:** total infra $/month; Perplexity spend per active user; counselor cache hit rate (target >30%); refusal rate (a healthy number, not a failure).

**Quality/trust:** counselor strike rate (target near zero); % of displayed facts with a live source; catalogue coverage against what students actually search.

**Engagement:** 7-day and 30-day return rate; Module 1 completion in the paper pilot.

**Milestones:** Week 2 live · Week 5 first 25 users · Week 6 first handoff click · Week 8 paper-pilot verdict · Week 10 first attributed consultation · Week 12 attribution report and renew/stop decision.

### 5.6 Which hires touch acquisition, retention, and profitability

| | Acquisition | Retention | Profitability |
|---|---|---|---|
| Engineer | Indirect (builds the handoff) | Indirect (mobile, speed) | Indirect |
| Designer | **Direct** (mobile conversion) | Indirect | Indirect |
| Conversion lead | **Direct** | **Direct** | **Direct — the only one** |
| Data researcher | Indirect | **Direct** (reason to return) | No |

Note what this table says: three of your four hires have no direct line to profit. That is correct and unavoidable for a free product — but it is also why you should not add a fifth.

### 5.7 When to make additional hires

| Trigger | Hire |
|---|---|
| Paper pilot ≥50% completion **and** ≥5 attributed enrolments/month | Video/content producer for Portal Phase 1 |
| Handoff volume exceeds 10 h/week of response time | Conversion lead to 20 h/week, or a second |
| Engineer consistently blocked with >2 weeks of queued work | Engineer to full-time (not a second engineer) |
| Catalogue demand outruns one researcher | Second researcher, piece rate |
| 500+ monthly active users **and** proven attribution | *Then* consider a growth role — not before |

**Do not hire on user growth alone.** Under a free model, users without attributed conversions are a cost. Growth is only a hiring trigger once the handoff is provably converting.

---

## 6. Final recommendation

### The team

**Plan B, four people, none of them full-time:**

1. **Part-time full-stack engineer** — 20 h/wk, 12 weeks, monthly renewable — $5,400–7,500
2. **Product designer** — fixed-scope freelance, 2–3 weeks — $1,500–2,500
3. **Academy conversion lead** — 10 h/wk from week 4, ideally reassigned — $1,300–2,200
4. **Data researcher** — piece rate from week 5 — $900–1,400

**Total ≈ $9,650–14,550**, inside your budget with reserve. No full-time salaries. Every engagement exits cheaply if the pilot says stop.

### The sequence

```
Today      Commit and push. Then write the Academy handoff copy.
Week 1     Engineer starts (launch ops). Designer brief goes out.
Week 2     Designer starts. → APP GOES LIVE
Week 4     Conversion lead starts. Pilot recruitment begins.
Week 5     Data researcher starts. → PILOT COHORT LIVE
Week 7     Paper pilot runs.
Week 12    Attribution report. Renew or stop.
```

### The 90-day execution plan

| Weeks | Focus | Gate to proceed |
|---|---|---|
| 1–2 | Launch checklist + Academy handoff built | `app.4prep.ai` live, counselor refuses correctly, backups on, handoff instrumented |
| 3–4 | Mobile pass implemented | A real student completes intake unaided on their own phone |
| 5–6 | Pilot cohort of 25–40 | ≥60% complete intake, ≥40% save a plan, ≥15% click the handoff |
| 7–8 | Paper pilot, Module 1 only | ≥50% submit homework — **or no video gets recorded** |
| 9–10 | Conversion + catalogue depth | First attributed Academy consultations |
| 11–12 | Measure, decide, document | Written attribution report; renew/stop call on each engagement |

### The three things I would change about how you are thinking

**1. You have been hiring in your head for the product, not the business.** You wrote two excellent role briefs — designer and data researcher — and neither of them connects the app to money. Both roles belong in the plan. Neither belongs first. The first thing you build is the handoff, and the first person you should be certain about is the one answering it.

**2. Free changes the definition of done.** A free product that nobody converts is a cost centre with good architecture. Before you spend $10,000, write down what an enrolled Academy student is worth and how many the app must produce to justify itself. If that number turns out to be uncomfortable, the honest response is to run Plan A, prove the funnel with the pilot cohort, and hire against evidence.

**3. Your instinct to keep the team small is right, and for a reason you may not have priced in.** The EB-1A dimension means the product is evidence of *your* original contribution. Hires who take deployment, pixels, and data entry strengthen that. Hires who take the methodology, the operator knowledge, or the counselor's product rules quietly weaken it. Keep Φ, the data standard, the refusal policy, and the curriculum. Delegate everything that a competent stranger could do from a written brief — which, thanks to your documentation habit, is more than most founders can delegate.

---

## Assumptions, and how different answers change the plan

| Assumption | If it's wrong |
|---|---|
| No external funding; hires paid from Academy cash | Funding would justify Plan C — but I would still gate video production on the paper pilot |
| You stay at ~20 h/week | At 40 h/week, drop the engineer to 10 h/wk and save ~$3,000 |
| Academy list is 100+ contactable students | Under ~50, the pilot cohort is too small to be conclusive — recruit externally first, and delay the researcher |
| Hiring from Tashkent / Central Asia + remote EE | Hiring at US rates multiplies every figure 3–5×; Plan A becomes the only option |
| An enrolled Academy student nets ≥$500 | Materially below that and the app must be run at Plan A cost indefinitely |
| Free means free forever, including the Portal | If the Portal could ever be paid, add payment rails in the week-9–12 window — retrofitting entitlements later is far more expensive than designing for them now |
| Students can reach Academy via existing channels | If not, the handoff needs a booking system, adding ~15 engineering hours |

Two things in this document are recommendations in areas where I am not qualified to advise: the note about collecting data from minors is a flag to consult a lawyer, not legal advice; and the cost figures are market ranges, not quotes.

---

## Sources

- [Software Developer Salary in Uzbekistan 2026 — Jobicy](https://jobicy.com/salaries/uz/software-developer)
- [Software Engineer Salary in Uzbekistan — Levels.fyi](https://www.levels.fyi/t/software-engineer/locations/uzbekistan)
- [Salary: Software Developer in Tashkent, Uzbekistan 2026 — Glassdoor](https://www.glassdoor.com/Salaries/tashkent-uzbekistan-software-developer-salary-SRCH_IL.0,19_IM3104_KO20,38.htm)
- [Salary data for Software Developer in Uzbekistan — Plane](https://plane.com/salaries/software-developer/uzbekistan)
- [Freelance Software Developer Rates by Country in 2026 — Index.dev](https://www.index.dev/blog/freelance-developer-rates)
- [European Developer Hourly Rates in 2026 — Index.dev](https://www.index.dev/blog/european-developer-hourly-rates)
- [Supabase Pricing 2026 — MetaCTO](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [Supabase Pricing in 2026 — Makerkit](https://makerkit.dev/blog/saas/supabase-pricing)

Internal: `docs/PROJECT_STATUS_REPORT_2026-07-28.md`, `docs/DATABASE_STATE.md`, `docs/LEARNING_PORTAL.md`, `app/CLAUDE.md`, `docs/planning/4Prep_AI_Roadmap_Brief.docx`, `docs/planning/4Prep_GroundTruth_Project_Proposal.docx`, `docs/planning/4Prep_Learning-Portal-Concept.pdf`, `docs/planning/4Prep_Frontend-Designer-Brief.md`, `docs/planning/4Prep_Data-Researcher-Brief.pdf`, `docs/planning/4Prep_3-Month-Plan.xlsx`, `docs/planning/4Prep_3-Week-MVP-Plan.xlsx`.
