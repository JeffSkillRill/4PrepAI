# 4Prep — 3-Month Plan

> **Goal that matters:** a public soft launch at app.4prep.ai — accounts + a first cohort of real users, on real sourced data.
> **Window:** Mon Jul 27 → Sun Oct 18, 2026 (12 weeks). **Capacity:** ~20 hrs/week.

---

## ▶️ How to import this into Notion (2 minutes)

1. In Notion, open the page where you want this to live → click **•••** (top-right) or the **+** in the sidebar → **Import** → **Markdown & CSV**.
2. Import **`4Prep_Master-Plan.md`** (this file) → becomes this page.
3. Import **`4Prep_QA-Audit_2026-07-24.md`** → becomes the audit page. Drag it under this page to nest it.
4. Import **`4Prep_Weekly-Plan.csv`** → becomes a **database** with all 12 weeks. Drag it under this page too.
5. In the new database, fix two column types (Notion imports them as text): set **Status** → *Status* or *Select* (Not started / In progress / Done / Slipped), and **Due** → *Date*. Then add views: **By Week**, **By Status** (board), **This Month** (filter Month = current).
6. Optional: the **Tasks** column holds each week's checklist. To make them tickable, open a week's row and paste its Tasks into the page body — Notion turns `[ ]` into checkboxes.

Everything below is also in the database — this page is the readable version you can check off directly.

---

## The hour budget (why the plan is shaped this way)

**12 weeks × 20 hrs × 0.7 slack = 168 real hours.** That is the hard ceiling. The plan spends exactly 12 × 14 = 168.

The honest read: 168 hours ≈ four full-time weeks stretched over three months, solo. The brief's full vision — 300 universities, five AI systems, EPIF calibration, an admin console — **does not fit**. So "soft launch" here means the version that *is* buildable and still honest under your own rules: **one AI flow (Pathway Generator), ~15–20 truly-sourced universities, real accounts, deployed, in front of a small real cohort.** Narrow and real beats broad and fake — which is your own golden rule.

The head start that makes even this possible: the front-end (7-screen UI, trust primitives, the `DataPoint` contract) is done and good. You're putting a real spine into a real skin.

---

## Month 1 — Foundation & de-risking · Jul 27 – Aug 23
**Objective:** real data flows through real scoring into the existing UI — the prototype becomes a thin but genuine product. *(All "could-invalidate-everything" work is front-loaded here.)*

### Week 1 — Decide & set the foundation · Jul 27 – Aug 2 · 14h · ⚠ dependency-critical
- [ ] Lock the canonical stack in writing: Vite/React front-end + Supabase backend; retire the Lovable/Next.js ambiguity (2h) — **due Mon Jul 27**
- [ ] `git init` + GitHub remote + `.gitignore`; delete dead files: `dist/`, `__smoke.tsx`, root lockfile, `.DS_Store` (1h) — **due Mon Jul 27**
- [ ] Stand up Supabase; build the schema from `types/index.ts` with a non-null source FK on every fact field (5h) — **due Thu Jul 30**
- [ ] Extract the EPIF Φ equations from the paper into an implementation spec; log ambiguities (3h) — **due Fri Jul 31**
- [ ] Source ONE real university end-to-end and time it = your throughput baseline (3h) — **due Sun Aug 2**

**Deliverable:** repo + live schema + 1 real sourced university + Φ spec. **Done when:** schema deploys, one real record exists, minutes-per-university known.

### Week 2 — Φ engine + read contract · Aug 3 – Aug 9 · 14h · ⚠ dependency-critical
- [ ] Implement Φ as a deterministic, versioned function; unit-test against the paper's worked examples (6h) — **due Wed Aug 5**
- [ ] Resolve any underspecified normalization with founder; version the decision, don't improvise (2h) — **due Thu Aug 6**
- [ ] Define the minimal Gateway query: profile → candidate records + citation IDs (4h) — **due Sat Aug 8**
- [ ] Privacy/legal self-check: republishing sourced figures + storing student profiles (RLS) (2h) — **due Sun Aug 9**

**Deliverable:** Φ passing paper unit tests + a documented query function. **Done when:** `npm test` green on Φ; a profile returns real candidates from Supabase.

### Week 3 — Wire the UI to real data · Aug 10 – Aug 16 · 14h · ⚠ dependency-critical
- [ ] Swap `sample-data.ts` reads for Supabase queries behind the same `DataPoint` contract (6h) — **due Wed Aug 12**
- [ ] Make intake actually drive candidate selection + Φ ranking — kills the fixed-fixture bug **S1** (5h) — **due Fri Aug 14**
- [ ] Fix **S2** (contradictory fit display) + **S3** (budget vs scholarship semantics) (2h) — **due Sat Aug 15**
- [ ] Keep the ribbon + `DataValue`/`MissingValue` enforcement intact (1h) — **due Sun Aug 16**

**Deliverable:** the app ranks real universities from real data. **Done when:** changing intake answers changes the ranked list and fit — every number sourced.

### Week 4 — Data fill I + get help · Aug 17 – Aug 23 · 14h
- [ ] Shortlist the ~15–20 universities that matter (demand-first, with founder) (2h) — **due Mon Aug 17**
- [ ] Build the dead-simple entry path: Sheet template → CSV import, or a 1-screen form. **No admin console** (4h) — **due Wed Aug 19**
- [ ] Enter + source 6–8 universities yourself, refining the process (6h) — **due Sat Aug 22**
- [ ] Brief a 4Prep alum to source records to your standard — **buy, don't build** (2h) — **due Sun Aug 23**

**Deliverable:** ~8 verified universities live. **Done when:** 8 render with sourced figures, zero invented values.

---

## Month 2 — The real product · Aug 24 – Sep 20
**Objective:** a grounded, account-backed Pathway Generator on ~15–20 sourced universities — the product actually works for a real student.

### Week 5 — Data fill II + scholarships · Aug 24 – Aug 30 · 14h
- [ ] Reach ~15–20 universities total (you + helper) (8h) — **due Fri Aug 28**
- [ ] Enter the cohort's relevant scholarships, sourced (4h) — **due Sat Aug 29**
- [ ] Spot-audit 10% of records against their sources (2h) — **due Sun Aug 30**

**Deliverable:** ~15–20 universities + scholarships, sourced. **Done when:** coverage spans the cohort's targets; audit clears your accuracy bar.

### Week 6 — The grounded AI counselor · Aug 31 – Sep 6 · 14h · ★ core
- [ ] Wire Claude API Pathway Generator: profile + record bundle + Φ + citation IDs → structured, sourced narrative (8h) — **due Thu Sep 3**
- [ ] Build the claim validator: strip any figure/name/deadline with no citation; missing fact → the response says so (5h) — **due Sun Sep 6**

**Deliverable:** one real profile → a grounded, sourced pathway. **Done when:** a deliberately missing figure is provably stripped (red-team it once).

### Week 7 — Accounts + saved plans · Sep 7 – Sep 13 · 14h
- [ ] Supabase Auth (email) — **buy, don't build** (3h) — **due Tue Sep 8**
- [ ] Persist profiles + saved pathways per user; wire the Saved screen to real storage (6h) — **due Fri Sep 11**
- [ ] Replace in-memory routing with real routes/URLs so login + deep links work — fixes **R4** (4h) — **due Sun Sep 13**

**Deliverable:** sign up → run → save → log out → return tomorrow → still there. **Done when:** the brief's Phase-3 gate passes for a real account.

### Week 8 — Honesty & grounding pass · Sep 14 – Sep 20 · 14h
- [ ] Golden set of ~10 realistic profiles; verify every claim maps to a record and missing data → refusal (5h) — **due Wed Sep 16**
- [ ] Tune refusal/caveat behavior; flip verified records off "sample"; keep the ribbon accurate (4h) — **due Fri Sep 18**
- [ ] Fix **M1–M3** (em-dash for missing data, devState on Compare/Saved, duplicate saves) (3h) — **due Sat Sep 19**
- [ ] Wire Sentry — **buy** (2h) — **due Sun Sep 20**

**Deliverable:** passing manual grounding check + clean states. **Done when:** 10/10 golden profiles behave; zero uncited figures on screen.

---

## Month 3 — Harden, deploy, launch · Sep 21 – Oct 18
**Objective:** live at app.4prep.ai, real cohort using it, documented and defensible.

### Week 9 — Deploy + domain · Sep 21 – Sep 27 · 14h
- [ ] Deploy front-end (Vercel) + Supabase prod; wire app.4prep.ai DNS (5h) — **due Wed Sep 23**
- [ ] Production RLS check: the app reads only verified rows; profiles are private (3h) — **due Thu Sep 24**
- [ ] Enable backups; run one restore drill (2h) — **due Fri Sep 25**
- [ ] Responsive-desktop pass — *not* the Niche redesign, just not-broken on a laptop (4h) — **due Sun Sep 27**

**Deliverable:** live at app.4prep.ai on real data. **Done when:** you use it end-to-end on the real domain from a fresh device.

### Week 10 — Pre-launch hardening · Sep 28 – Oct 4 · 14h
- [ ] Privacy policy + consent copy **before** any real user (3h) — **due Tue Sep 29**
- [ ] Mobile QA on real phones; fix the top issues (4h) — **due Thu Oct 1**
- [ ] Evidence pack: dated screenshots, what's live, feature demos — brief deliverable + EB-1A evidence (4h) — **due Sat Oct 3**
- [ ] Founder sign-off that nothing on screen diverges from the paper/public narrative (3h) — **due Sun Oct 4**

**Deliverable:** launch-ready app + live privacy policy + evidence pack v1. **Done when:** you sign off; policy is live.

### Week 11 — Soft launch · Oct 5 – Oct 11 · 14h
- [ ] Invite a small first cohort (existing 4Prep leads/students) (2h) — **due Mon Oct 5**
- [ ] Instrument: pathway runs, refusal rate, saves, citation clicks, coverage-gap misses (5h) — **due Wed Oct 7**
- [ ] Support the cohort live; log every bug + data gap (5h) — **due Sat Oct 10**
- [ ] Daily triage (2h) — **due Sun Oct 11**

**Deliverable:** real users generating real pathways. **Done when:** a handful of real users have completed + saved a pathway; usage data + gap list in hand.

### Week 12 — Stabilize & ship the record · Oct 12 – Oct 18 · 14h · 🚀 launch
- [ ] Fix the top launch bugs; fill the specific gaps that blocked real users (7h) — **due Thu Oct 15**
- [ ] Finalize the evidence pack with real user counts + screenshots (4h) — **due Sat Oct 17**
- [ ] Write the public description that matches exactly what shipped (3h) — **due Sun Oct 18**

**Deliverable:** stable public soft launch + a provable evidence pack. **Done when:** it's live, real users have used it, every public claim maps to a working feature. **Shippable — not "almost."**

---

## Buy, don't build
- **Auth** → Supabase Auth
- **Hosting / DB / storage / backups** → Supabase + Vercel
- **Error monitoring** → Sentry (free tier)
- **Data-entry labor** → hire a 4Prep alum (your own proposal calls researchers "clearly outsourceable" — highest-leverage dollar you'll spend)
- **Source snapshots** → save manually for ~20 unis (skip the archiving pipeline)

## Tech debt to knowingly accept
- Φ with simplified normalization, versioned + self-signed (not full calibration)
- A manual golden-set grounding check instead of a CI eval harness — **but keep the runtime claim validator, non-negotiable**
- One of five AI tools
- ~15–20 universities, not 300
- Mobile-first; desktop responsive-passable, not the editorial redesign
- Supabase Studio / sheet-import instead of an admin console

## Cut list — not building, and why
- **The other four AI tools** (Scholarship Finder standalone, Skill Gap, Country Fit, Career Projection) — the Pathway Generator already surfaces scholarships + a plan; the rest are Phase-2 breadth you can't verify-fund in 168h.
- **The full Ground Truth admin console** (verification queue, extraction assist, coverage dashboard) — absurd overhead for 20 records; build it when data entry is actually the bottleneck.
- **Outcome Ledger + Φ calibration** — needs a sample size you won't have; premature fitting produces confident nonsense.
- **The 300-university target** — depth over breadth; sequence by real demand.
- **The Niche desktop redesign** (`codex-design-prompt.md`) — defensible cut: your success scene is literally a phone.
- **Multi-language (Uzbek/Russian/Kazakh)** — blocked on an unmade product-language decision.
- **Automated source monitoring, in-product correction loop, partner API** — all explicitly post-MVP.

## The honest risk
This fits only if weeks 1–3 hold. If Φ proves hard or your paper is ambiguous (**R5**), weeks 2–3 slip and eat the buffer — which is exactly why those items are front-loaded. **If you slip, cut universities (10 instead of 20), never the safeguards.** The grounding validator and "no invented numbers" are the whole point; they're the last thing to go.

*See the nested **QA Audit — Jul 24** page for the full Stage-1 review and the ranked issue checklist.*
