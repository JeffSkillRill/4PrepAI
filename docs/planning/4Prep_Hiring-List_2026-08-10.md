# 4Prep — revised hiring list

**Date:** 10 August 2026 (Asia/Tashkent)
**Supersedes:** the hiring section (§2–§4, §6) of `4Prep_Hiring-and-Launch-Plan.md`, 1 August 2026.
Everything else in that document still stands and is not repeated here.
**Basis:** repository state verified 10 August, live check of `4prep.ai`, and three answers from Abduaziz.

---

## 0. What changed since 1 August

Three things, and two of them push in opposite directions.

**1. You out-built the plan.** Five feature commits in ten days, solo: learning portal + QA remediation,
admin foundation, admin support chat, UI modernisation, doc reorganisation. `app/` + `admin/` is now
~9,000 LOC with 28 test files, build and lint green. The 1 August plan's Day-30 engineer deliverables
are substantially *already done* — and the admin console it explicitly told you not to build, you built
anyway, well.

> This is the single most important input to this list. An engineer was ranked first on 1 August because
> engineering looked like the constraint. Ten days of evidence says it isn't. **You are not
> engineering-constrained. Stop hiring as if you are.**

**2. `4prep.ai` is live, and it isn't this app.** The 1 August plan states both domains return no DNS
record. That's now false: a marketing site with a waitlist and a `/build-path` mock is deployed and
advertising "92% Path fit", "Risk level: Moderate", "on track", "Germany / Netherlands", and "DAAD" —
all of which the product refuses or cannot serve. Built in-house by Abduaziz, so there is no third party
to brief. See `4Prep_Startup-Gap-Plan_2026-08-10.md` §0.

**3. The Academy list is under 50 contactable students.** The 1 August plan named this as an assumption
and said what to do if it broke:

> *"Academy list is 100+ contactable students — if under ~50, the pilot cohort is too small to be
> conclusive: recruit externally first, and delay the researcher."*

The assumption broke. **Distribution is not an asset you own. It is the thing you have least of.**
That reorders the entire list below.

And one number is still blank: what an enrolled Academy student is worth. Until it exists, no budget on
this page can be validated — including mine.

---

## 1. Before any hire — three founder tasks that gate the rest

None of these cost money. All three change who you hire.

| # | Task | Time | Why it gates hiring |
|---|---|---:|---|
| G1 | **Write down the enrolment economics.** What the Academy charges, net margin per enrolled student, and how many app-sourced enrolments justify a given team cost | 2 hrs | Every figure below is unverifiable without it. If net is under ~$500, most of this list is unaffordable and the honest answer is to hire nobody yet |
| G2 | **Ship the honest front door + handoff + instrumentation + deploy** | 8.5 hrs | You cannot brief a recruiter to send students to a product that isn't live, and you cannot pay anyone on conversion you can't measure |
| G3 | **Prove 10 students want this.** Watch ten real teenagers use the deployed app on their own phones | ~6 hrs | If they don't finish intake, no hire on this page helps. This is the cheapest experiment available and it hasn't been run |

**If G3 fails, hire nobody.** That outcome would cost you two weeks instead of $10,000, and it is the
whole reason to run it first.

---

## 2. The revised list

Ranked by what is actually scarce, not by what a startup usually staffs.

### Hire 1 — Student Recruitment & Success Lead (part-time)

**The only role that addresses your binding constraint.** On 1 August this was ranked third and framed
as an *Academy conversion* lead — a person who works an existing list. With under 50 contactable
students, the job is no longer conversion. It is **recruitment first, conversion second.**

- **Seniority:** mid. Admissions fluency and credibility with teenagers matters far more than years.
- **Profile:** a recent 4Prep alum, or someone embedded in Uzbek/Central Asian student communities — school counsellors, EducationUSA advising centres, olympiad and IELTS prep groups, university-bound Telegram and Instagram communities.
- **Engagement:** part-time employee or reassignment, 10–15 h/wk. Not freelance — needs continuity and trust with students.
- **Scope:** grow the contactable list from <50 to 150+; recruit and run a 30–40 student pilot; be the human answering the handoff; own the funnel sheet and report it weekly.
- **Day 30:** contactable list past 100. 25+ pilot students onboarded. Funnel sheet live.
- **Day 60:** 30–40 students through intake. First handoff conversations logged with outcomes. A written objection log in students' actual words.
- **Day 90:** documented app-user → consultation → enrolment rate. That number, not a feature, is the deliverable.
- **Test task (paid, ~4 hrs):** *"Here is our deployed app. Bring us 10 students who are not on our current list and get 5 of them through intake. Tell us where you found them and what they said."* Pays for itself if they pass, and tells you in a week what a CV cannot.

**Why first:** every other hire produces something for an audience that doesn't exist yet.

---

### Hire 2 — Part-time Full-Stack Engineer (Supabase / React / TS)

**Still yes — but half the hours and a different job than 1 August described.**

The launch-ops scope is largely gone; you did it. What remains is the work that keeps *your* hours on
methodology, operator knowledge, and students.

- **Seniority:** mid (3–5 yrs). Unchanged and still correct — they work unsupervised against production.
- **Engagement:** **10 h/wk** (down from 20), monthly renewable. Revisit upward only when they are provably saturated.
- **Scope, in order:** deploy + DNS + Supabase Pro/backups + Resend SMTP · handoff and instrumentation if G2 hasn't shipped · split the 588 kB bundle · enforce verified-only catalogue reads before any researcher imports · seed `program_facts` or narrow the intake · decompose `App.tsx` · fix the `DATABASE_STATE.md` contradiction and the three missing migrations in `CLAUDE.md`.
- **Do not** brief them on: the admin console, support chat, learning portal, auth, dashboard, or routing. All shipped. Read the code before writing the JD.
- **Interview filter, unchanged and still the best one on this page:** *"Our app shows a university's tuition. The official page doesn't publish it. What does the screen show?"* If the answer is "N/A", "—", "0", or "estimate from similar schools" — end the interview.
- **Test task:** the `contact_requests` task in the 1 August plan is now real work you need. Keep it verbatim.

---

### Hire 3 — Product Designer — **cut. You already did the job.**

Reversed on 10 August after checking the brief's five priorities against the shipped code. Four of the
five are done, by you, in the 7 August UI pass:

| Designer brief says | Code says (verified 10 Aug) |
|---|---|
| §2 "renders as an **amber warning box that reads like an error**" | No amber token exists anywhere in `index.css`. `MissingValue` renders `border-forest-100 bg-canvas` with an "Official data gap" eyebrow and a `FileSearch` icon |
| §2 "'not published' and 'finish intake' **look identical and confuse people**" | `kind` prop splits them: institution → forest/canvas + `FileSearch`; profile → sky + `ClipboardList` + "Needs your answers" |
| §2 "a cluster of gaps on a profile page" | `HonestGapCluster` shipped |
| §3 "lead with **net cost after published aid**, sticker secondary" | `PublishedNetCost` renders first; sticker labelled "Published sticker cost · before aid" below it |
| §4 "score **never shown as a bare number**, always expandable into five reasons" | `ExpandableFit` + `FitBreakdown`, with a screen-reader table per `DASHBOARD.md` |
| §1 mobile pass at 375px | **The one genuinely open item.** Handled reactively so far (three mobile fix commits), never systematically |

The brief is also now stale in ways that would actively mislead a candidate: it specifies Manrope + DM
Sans, a coral accent, amber gaps, and cream `#faf9f7` — none of which exist since the 7 Aug palette
change to mint/evergreen on `#F6F8F7`, with contrast ratios computed and documented in `UI_DESIGN.md`.
It also lists "Counselor (AI chat)" as a screen; the counselor is structured-only and has no chat window.

**What remains is not a design project.** It is one mobile QA pass at 375px on real Android phones on
real Uzbek mobile data — which is item G3 on this page, already scheduled, and better done by watching
ten students than by commissioning a Figma file. The 588 kB bundle is the more likely mobile problem
and it's an engineering fix.

**Revisit only if** the ten sessions surface a specific, named design failure. Then commission a
one-screen fixed-scope fix against a rewritten brief — not the 2–3 week pass.

**Freed: $1,500–2,500.** Move it to Hire 1.

---

### Hire 3 — Data Researcher (piece rate) — **trigger-based, not calendar-based**

Do not hire on a date. Hire when this fires:

> **Trigger:** pilot students search for universities that aren't in the catalogue, and you can name them.

Ten universities is thin, but breadth is worthless until someone is browsing. Piece rate per *accepted,
sourced* record, junior seniority, brief already written. Prerequisite: verified-only reads enforced at
the DB boundary first — otherwise the first unverified row reaches the public catalogue.

---

### Not a hire — one paid hour with a lawyer

You are collecting grades, budgets, and language scores from 17-year-olds. This is a flag to get advice,
not advice. Before the pilot cohort, not after. Bundle it with the privacy-policy update in G2.

---

## 3. Do not hire

Unchanged from 1 August, plus two additions:

| Role | Why not |
|---|---|
| Growth marketer | Your problem is 10 validated students, not 10,000 unvalidated ones. Hire 1 covers this at a tenth the cost |
| Product manager | With one part-time engineer, you are the PM |
| DevOps / SRE | Supabase + Vercel *is* your ops |
| Backend specialist | It's a few edge functions and some SQL |
| Video / content producer | Blocked on the paper pilot, which is blocked on having a cohort. **You already have someone available — keep them on standby, don't start them.** The cost of starting early isn't their fee, it's your curriculum-authorship hours (non-delegable) spent on 40 lessons before you know whether students finish one |
| **Product designer** | *Changed 10 Aug.* Four of the five brief priorities are already shipped. See Hire 3 above |
| QA engineer | 28 test files, a designer pass, and a pilot cohort cover it |
| Second engineer | Not until the first is saturated *and* the funnel shows the app matters |
| **Marketing / copywriter** | *New.* The landing copy needs 1.5 hours of honest rewriting, not a hire. And per the EB-1A logic in the 1 Aug plan, the public claims about your method should stay in your own words |
| **Anyone, if G3 fails** | *New.* If ten students won't finish intake, the answer is not more people |

---

## 4. Order and budget

```
Now        G1 enrolment economics · G2 front door + handoff + deploy · G3 ten students
           ── gate: do the ten students finish intake? ──
Week 1     Hire 1  Recruitment & success lead starts
Week 2     Hire 2  Engineer starts, 10 h/wk
Trigger    Hire 3  Data researcher, when students ask for schools you lack
Standby            Video producer — available, starts only if the paper pilot passes
Cut                Product designer — the work is done
```

**90-day cost, revised down from Plan B:**

| Role | Engagement | Cost |
|---|---|---|
| Recruitment & success lead | 15 h/wk × 12 wks | $2,000–3,300 |
| Full-stack engineer | 10 h/wk × 12 wks | $2,700–3,750 |
| Data researcher | Piece rate, if triggered | $0–900 |
| Designer | **Cut — four of five brief items already shipped** | $0 |
| Video producer | Already available; standby until the paper-pilot gate | $0 until triggered |
| Paid trial tasks (2–3 candidates) | One-off | $200–400 |
| Legal hour | One-off | $150–400 |
| Infrastructure, 3 months | Supabase Pro, Vercel, Sentry, PostHog, Perplexity | $250–450 |
| **Total** | | **$5,300–9,200** |

Roughly **$4,500–5,400 below the 1 August Plan B** — from halving the engineer and cutting the designer
outright. Neither is austerity. Both are the dividend of work you already did, and both should be spent
on the thing you have least of: students. The designer saving alone buys the recruitment lead an extra
three hours a week for the whole quarter.

Cost ranges are market estimates for Tashkent / Central Asia plus remote Eastern Europe, carried from
the 1 August plan's sources. They are not quotes. At US rates, multiply by 3–5× and only the recruitment
lead survives.

---

## 5. The honest read

The 1 August plan told you to build the Academy handoff before hiring a designer. Ten days later the
handoff still doesn't exist, and you shipped an admin console instead. That is not a criticism of the
work — the admin console is well built. It is a pattern worth naming, because it will decide this
project: **when the choice is between something you can build alone and something that requires talking
to strangers, the code wins every time.**

Every role on this page is chosen to break that pattern. Hire 1 exists because you cannot code your way
to 150 students. The engineer is halved because engineering is the thing you demonstrably do not need
help with. The designer waits because ten real sessions will brief them better than you can. And the
three gates come first because the cheapest possible outcome is discovering, for free, that the thing
needs changing before four people are paid to build it.

You have under 50 students, an unknown enrolment value, and a product nobody outside you has used. Those
three facts, not the codebase, are what a hiring plan has to solve.
