# Codex Prompt — Build the Learning Portal

Copy everything below the line into Codex.

---

## ⚠ Working directory — do not get this wrong

Work **only** in the existing repository, in place. A previous session ran in a separate copy and created two divergent versions that had to be merged by hand. Do not repeat that.

```
<repo root>/
├─ app/
│  ├─ package.json          ← the only package.json
│  ├─ src/
│  │  ├─ App.tsx            ← routing + nav live here (hand-rolled, no router lib)
│  │  ├─ types/index.ts     ← the View union and DataPoint contract
│  │  ├─ data/repository.ts ← every DB read/write goes through here
│  │  ├─ screens/           ← one file per screen group
│  │  ├─ components/        ← Trust, States, CostSummary, UniversityCard
│  │  └─ auth/AuthProvider.tsx
│  └─ supabase/             ← migrations + Edge Functions live INSIDE app/
└─ docs/DATABASE_STATE.md   ← at the REPO ROOT, not inside app/
```

Do not scaffold a new project, create a parallel `app/`, add a second `package.json`, or create `app/docs/`. If a file you expect is missing, you are in the wrong directory — stop and report.

Migrations are **forward-only**. Never edit an applied one. Note that `202607310008_counselor_scope_outcome.sql` exists but is **not yet applied to the live database** — leave it alone, do not renumber it, and number your new migrations after it.

---

## Context

4Prep is a university-pathway platform for international students applying to US universities. The existing product answers *“which universities fit me?”* — a sourced catalogue, a five-component fit score, a grounded AI counselor, saved plans.

We are adding a **Learning Portal**: a structured course that teaches a student how to actually apply, module by module, with **homework the student uploads** at the end of each module. Ten modules, ordered as the application year runs. The concept note is `4Prep_Learning-Portal-Concept.pdf` at the repo root — read it first.

**The portal is free.** There is no paid tier, no paywall, no subscription, and no entitlement model — now or later. The only gate on any lesson, template, or assignment is having an account and having reached that point in the course. Do not build payment logic, plan checks, trial states, upgrade prompts, "premium" flags, or any schema column that anticipates them. If you catch yourself adding a `tier`, `plan`, or `is_premium` field, that is the mistake.

**Your job in this prompt is to build the entire delivery system for all ten modules.** Schema, storage, routes, screens, upload, progress, gating, tests, docs. When you are done, a signed-in student must be able to open a track, work through modules, watch or read lessons, download a template, upload homework, and see their submission recorded — for every one of the ten modules, with no dead ends.

### The user you are building for

A 17-year-old, **on a phone**, on mobile data or a slow connection, for whom English is a second or third language, whose family has never done this before. Every decision follows from that. A lesson that only works on good wifi excludes exactly the students this product exists for.

---

## ⚠ The two constraints that matter more than the features

### 1. Do not write the teaching content

You are building the **system**, not the curriculum. The instructional content is founder work and will be authored separately.

**Do not invent, estimate, paraphrase, or “fill in for now” any admissions fact.** No application deadlines. No test score requirements. No fees. No tuition figures. No visa amounts or processing times. No “typically students need around…”. Not in seed data, not in sample lessons, not in placeholder copy, not in tests, not in a comment. This product's entire position is that it never states an unsourced number, and seeded placeholder facts have a habit of surviving into production.

What you **should** seed for each of the ten modules: the module number, title, a one-line description of what it covers, its running order, and its assignment brief — all of which are given verbatim in the table below. Lesson bodies are **authoring slots**: create the lesson rows/records with titles and ordering, and leave the body explicitly empty with a status of `draft`, so it is visible in an admin listing as unwritten. A module whose lessons are all `draft` must render as *“Lessons are being written — the assignment is open”*, not as a broken or empty page. That state is a normal, designed state, not an error.

### 2. No grading in this prompt

Homework submissions are **stored and marked pending**. That is all.

Do not build auto-validation against the catalogue, do not build AI feedback, do not build a rubric engine, do not call the counselor Edge Function, do not call Perplexity. Those come in a later prompt and the schema below is designed to accept them without a rewrite. If you find yourself writing scoring logic, stop.

---

## Task 1 — Decide the content model, and defend the choice

Lesson and module content can live either **in Supabase tables** (like the catalogue — editable without a deploy, consistent with the existing architecture, needs RLS and eventually an admin UI) or **as MDX/JSON files in the repo** (versioned in git, authored in an editor, no admin tooling needed, requires a deploy to change).

**Pick one.** Both are defensible; an inconsistent hybrid is not. Write your reasoning into `docs/LEARNING_PORTAL.md` in three or four sentences — what you chose, what you gave up, and what would have to change to switch later.

Constraints on whichever you choose:

- Student-generated data (progress, submissions, files, future feedback) lives in **Supabase regardless**. That is not part of this decision.
- Content must be addressable by a stable slug, not a database UUID, so lesson URLs survive a re-seed.
- The authoring format must be something a non-engineer can edit without breaking the build.

## Task 2 — Schema and storage

New tables (adjust names to match existing conventions in the migrations, but keep the shape):

- `learning_tracks` — slug, title, description, order
- `learning_modules` — track, module number, slug, title, summary, order
- `learning_lessons` — module, slug, title, order, duration estimate, body/content ref, `status` (`draft` | `published`), transcript ref, media ref
- `learning_assignments` — module (one per module), slug, title, brief, submission type (`structured` | `checklist` | `artifact`), template ref, and a **nullable rubric column that stays unused in this prompt**
- `learning_submissions` — assignment, user, `status` (`pending` | `submitted` | `reviewed`), submitted_at, and a nullable feedback reference for later
- `learning_submission_files` — submission, storage path, original filename, mime type, byte size
- `learning_progress` — user, lesson, completed_at

Requirements:

- **RLS on every table.** Content tables (tracks/modules/lessons/assignments) are readable by anonymous visitors — a student must be able to see what the course covers before signing up. Everything user-written (`learning_submissions`, `learning_submission_files`, `learning_progress`) is **owner-only for select, insert, update, and delete**. No exceptions, no service-role shortcuts in client code.
- Add a **private Supabase Storage bucket** for submissions. Path convention `{user_id}/{assignment_slug}/{filename}`. Storage policies on `storage.objects` must enforce that a user can only read and write under their own `user_id` prefix. Verify this by attempting a cross-user read and showing that it is denied.
- **Enforce a MIME allowlist and a size cap** at the storage-policy level, not only in the UI. PDF, DOCX, and common image types for artifacts; CSV/XLSX for structured templates. A client-side check alone is not a control.
- One `pending` submission per user per assignment — resubmission replaces or versions, it does not create duplicates. Use a constraint, the way `saved_plans` already does.

## Task 3 — Account deletion must cover the portal

`supabase/functions/delete-account/index.ts` already deletes the auth user, `student_profiles`, and `saved_plans`. It does not know about any of the tables above.

Extend it to also remove `learning_submissions`, `learning_submission_files`, `learning_progress`, **and the user's objects in the storage bucket**. Orphaned files in storage after account deletion would break the commitment the Privacy Policy now makes. Prove in your summary that nothing is left behind — rows and objects both.

## Task 4 — Types, repository, routes

- Extend the `View` union in `src/types/index.ts` and the route table in `App.tsx`. **Do not add a router library.** The app uses hand-rolled path matching; follow it.
- Routes: `/learn` (track home), `/learn/:moduleSlug` (module), `/learn/:moduleSlug/:lessonSlug` (lesson), `/learn/:moduleSlug/assignment` (assignment + submission). These must be real, shareable, refresh-safe URLs — the existing `readRoute` handles a parameterised university path already; extend that pattern.
- All data access goes through `src/data/repository.ts`. No component talks to the Supabase client directly. Follow the existing repository and mapper structure, and add mapper tests alongside `mappers.test.ts`.
- Add **Learn** to the primary nav.

## Task 5 — Screens

Five screens plus their designed states. Build them **mobile-first at 375px**, then desktop — not the other way round, which is how the rest of the app was built and is now being corrected.

**Track home** — the ten modules in order, each showing its status (locked / available / lessons in progress / homework submitted). Overall progress. A clear “continue where you left off”.

**Module page** — lesson list with durations, the downloadable template, and the assignment entry point. Handles the all-lessons-draft state described above.

**Lesson view** — this is the one with the real constraints:
- The media component must be **provider-agnostic**. No video host has been chosen. Take a media URL plus a transcript and render appropriately; do not hardcode an embed for a specific vendor or add a vendor SDK.
- Every lesson needs a **readable text transcript** and an **audio-only option**, both reachable without playing video. This is a hard requirement, not an enhancement — many of our students cannot afford the data.
- Mark-as-complete writes to `learning_progress`.

**Assignment page** — the brief, the template download, the upload control, and what happens next stated plainly. Show the accepted file types and the size limit *before* the user picks a file, not as an error afterwards. Show upload progress; a silent upload on a slow connection looks broken.

**Submission view** — what was submitted, when, and an honest pending state. Since nothing is graded yet, the copy must say so clearly: their work is saved and review is not yet available. **Do not imply feedback is coming imminently, and do not fake a review timeline.**

## Task 6 — Progress, gating, and designed states

- Sequential unlock: a module opens when the previous module's assignment has been submitted. Add an escape hatch — a student who is short on time must be able to jump ahead with a clear warning, because a hard lock on a real deadline is worse than an incomplete course.
- Every screen needs **loading (skeletons matching final layout), empty, error, and offline** states, at 375px and desktop, using the existing `States.tsx` components. An upload that fails on a flaky connection must say the work was not lost and offer a retry.
- Signed-out visitors can browse the curriculum but not submit. The sign-in prompt must **return them to the exact assignment** afterwards — `pendingAuth.ts` already does this for other destinations; reuse it, do not reinvent it.

## Task 7 — Profile write-back: define the seam, wire nothing

Several assignments will eventually populate the student profile (the shortlist becomes a saved plan, the transcript pack becomes academic profile data, the budget sheet becomes the financial input). That is the strategic point of the portal.

**Do not implement any of it in this prompt** — it depends on parsing uploaded artifacts, which depends on the grading work that is deliberately out of scope. Instead, define the seam clearly: a documented interface in the repository layer showing where a reviewed submission would write back to `student_profiles` and `saved_plans`, with the write path left unimplemented and explicitly marked. Document it in `docs/LEARNING_PORTAL.md`. A clean seam now is worth more than a half-built pipeline.

---

## The ten modules — seed exactly this, add nothing

| # | Slug | Title | Covers | Assignment brief |
|---|---|---|---|---|
| 0 | `is-this-possible` | Is this possible for me? | How US pricing really works: sticker price versus net price, why aid exists, what the year looks like month by month | Timeline worksheet: your dates, working backward from application deadlines |
| 1 | `building-your-list` | Building your list | Types of institution, need-blind versus need-aware for internationals, reach/match/likely, the community-college transfer path | A shortlist with a net-cost column and a reason for each entry |
| 2 | `english-tests` | English tests | Which English tests exist, who accepts what, when to sit one, how to prepare | Test plan: which test, which date, target score, registration confirmed |
| 3 | `grades-and-transcripts` | Grades & transcripts | Translating your national system into something a US reader understands, credential evaluation, course rigor, predicted grades | Transcript pack: translated grades, school profile, subject list |
| 4 | `activities` | Activities | How US admissions reads extracurriculars, why depth beats breadth, describing work and family responsibility honestly | Activity list in the standard format, ranked by significance |
| 5 | `the-main-essay` | The main essay | What a personal statement is and is not, finding a real subject, the failure modes international applicants fall into most | Full first draft |
| 6 | `supplements` | Supplements & “why us” | Researching a specific university properly, writing short answers, reusing material without sounding recycled | Two supplement drafts for two shortlist universities |
| 7 | `recommendations` | Recommendations | Who to ask and how, what a US reader expects from a teacher letter, what to do when your school has no counselor | Recommender plan plus the brief you will give each one |
| 8 | `money` | Money | Institutional aid for internationals, merit scholarships, external scholarships, and the financial certification you must document | Family budget sheet plus an aid-form checklist per university |
| 9 | `submitting` | Submitting | Application platform mechanics, early versus regular rounds, fee waivers, portals, what happens after you press send | Submission tracker: every university, round, deadline, status |
| 10 | `after-the-decision` | After the decision | Comparing offers on net cost, asking for a review of aid, the enrollment document, visa application and interview, pre-departure | Offer comparison and decision memo |

Submission types: modules 0, 1, 8, 9 are `structured`; module 2 and 7 are `checklist`; modules 3, 4, 5, 6, 10 are `artifact`.

Templates are **empty files with correct headers and column names only** — a shortlist template may have a “net cost per year” column, but that column must be blank. Do not put example rows containing university names or figures into any template.

---

## Out of scope — do not build these

- Any grading, validation, scoring, or feedback, automated or AI
- Admin or instructor review queue
- Cohorts, start dates, peer review, certificates, streaks, gamification
- Video hosting integration or any vendor SDK
- Subtitle/localisation tooling beyond accepting a transcript
- Notification emails (SMTP is still not configured in production)
- Any change to the counselor, Φ scoring, or the university catalogue
- New heavy dependencies. Tailwind v4 core utilities only. If you believe a dependency is unavoidable, stop and ask rather than adding it.

## Definition of done

1. `npm run build` passes with zero TypeScript errors.
2. `npm run lint` passes with zero warnings.
3. `npm run test` passes, including **new** tests covering: route parsing for all four `/learn` paths, the repository mappers, module unlock logic, and the file-type/size validation.
4. The SSR smoke check still passes.
5. All seven existing screens still work. Auth, saved plans, counselor, and intake are untouched and unregressed.
6. Every one of the ten modules is reachable and has no dead end, with lessons in `draft`.
7. Cross-user access is denied — for table rows **and** for storage objects. Show the check you ran.
8. Account deletion leaves no orphaned rows or storage objects.
9. `docs/DATABASE_STATE.md` regenerated. `docs/LEARNING_PORTAL.md` created, covering the content-model decision, the schema, the storage layout, and the profile write-back seam.
10. New migrations are forward-only and numbered after `202607310008`.

## In your summary, state plainly

- Which content model you chose and what you traded away.
- Every new table, policy, bucket, and migration filename.
- **Which migrations you applied to the live database and which are pending.** Do not assume anything was applied.
- The exact commands you ran to prove cross-user denial and clean deletion, with their output.
- Anything you could not verify, and anything you had to guess.
- **Every place a fact, figure, date, or requirement would need to be authored by a human before this is shown to a real student.** This list is a deliverable, not an afterthought — it is the content brief the founder will work from.

If any instruction here conflicts with what you find in the repository, **stop and report the conflict rather than choosing for yourself.**
