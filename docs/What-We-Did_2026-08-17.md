# What we did — 17 August 2026

Plain-language summary. No technical terms.

---

## The short version

Two new tools went live, the "talk to a human" button finally got connected, and we found and fixed three places where the app would have told students things that weren't true.

Nothing is on the internet yet. That hasn't changed.

---

## 1. Connected the "talk to a real person" button

You built this on 12 August. It was never switched on — the place those requests get stored didn't exist, so the button led nowhere for five days.

It works now. A student who gets stuck can ask 4Prep Academy for help, and the request lands safely where only your admin console can read it.

**Why it matters:** this is the only path from "free app user" to "paying Academy client". It was the missing link in how the business earns money.

---

## 2. Found that your records didn't match reality

Two changes made to your live database on 5 August were never written down. Your project folder said one thing, your database said another.

That's how a future update breaks in a way nobody can explain. We recovered the missing paperwork out of the database itself and filed it properly. Everything now agrees.

---

## 3. Built the Skill Gap Analyzer

Tells a student exactly what stands between them and each university. "You need 0.5 more on IELTS for this one."

**But first we had to fix something serious.** Your database stored university numbers as plain numbers — and those numbers mean different things:

- Alabama says *"minimum IELTS 6.0"* — a real bar
- Yale says *"our strongest applicants usually have 7, but this is not a minimum"* — **not** a bar
- Alabama also lists SAT 1420 — but that's for a **scholarship**, not for getting in

All three looked identical to a computer. Without fixing this, the tool would have told a 17-year-old that she "falls short of Yale's requirement" — a requirement **Yale doesn't have**.

So we taught the database what each number actually means, and locked it down: anyone adding a new university now *must* say what each number is, or the system refuses it. That protection matters most later, when a hired researcher is entering 300 universities.

---

## 4. Fixed the plan — it was restarting every time

Three problems you spotted, all real:

- **You could redo your plan endlessly.** There was no "my plan" anywhere, and changing one answer meant redoing all six questions. Now there's a plan page where every answer has its own Change button — change your budget without touching your scores.
- **The app never asked for your real score.** It offered three fixed buttons: "IELTS 6.5", "TOEFL 90", "Duolingo 120". Everyone who picked IELTS was recorded as exactly 6.5 — so the new Skill Gap tool was comparing universities against a made-up number. Students now type what they actually got.
- **It showed all six tests at once.** You take one English test and maybe one of SAT/ACT. Now you only see what you actually hold.

---

## 5. Built the Scholarship Finder

Shows all ten real awards with real amounts and sources.

**The catch we had to solve:** your scholarships have amounts but no eligibility rules at all. The only real signal was in the merit tiers — and those have *two* conditions. Alabama's $28,000 award needs SAT 1420 **and** GPA 3.5. Only the score was stored properly; the GPA part was buried in a sentence.

So a careless version would tell a student with SAT 1500 and GPA 2.9 that she'd reached a $28,000 award. She hasn't.

Now every condition is checked. That student sees *"part way there — still short on GPA by 0.6"*. An award only shows as reached when **all** its conditions are met.

It works two ways: signed in, using your saved scores — or as a visitor with no account, typing two numbers and seeing results immediately.

---

## 6. Fixed the missing menu

**Tools wasn't in your navigation.** It had a page, but no menu link — so both new tools were only reachable by typing a web address. It's in the menu now.

---

## Where the project stands

| Phase | Status |
|---|---|
| Foundation | Database done. **Not online.** Marketing page still needs work |
| The five AI tools | **4 of 5 done.** Two of them today |
| Accounts and plans | Essentially done |
| Real data and launch | 10 universities of 300. Launch not started |

**Two tools genuinely cannot be built yet:** Country Fit needs European universities (you have none), and Career Projection needs career outcome data (you have none). Building either would mean inventing facts.

---

## What's still waiting

1. **Nothing is online.** Everything above is unreachable by any student. This is the one that decides whether the rest counted.
2. **Today's work isn't saved to your project history.** Four database changes are live; the matching code sits on one laptop. Worth a local commit.
3. **290 more universities.** The biggest job in the whole project, and the actual product.
4. **No way to measure anything** — visits, sign-ups, leads.
5. Small free win: leaked-password protection is switched off in your live login settings.

---

## The numbers

- 4 database changes, applied to both the test and live systems, each tested first
- 335 automated checks passing, up from 278 this morning
- 3 separate places where the app would have stated something untrue, caught and closed
