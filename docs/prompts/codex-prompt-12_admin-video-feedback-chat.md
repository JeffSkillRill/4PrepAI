# Codex Prompt — Admin console, lesson video, AI homework feedback, and support chat

**Four sequenced prompts. Run them in order. Each is independently shippable — do not start the next until the previous one's Definition of done is met.**

| # | Prompt | Ships |
|---|---|---|
| 12.1 | Admin foundation and the shared stage model | Admin app, privileged boundary, homework access, cohort view, student stage + goal |
| 12.2 | Lesson video pipeline | Admin video upload, student playback |
| 12.3 | AI homework feedback | Generated feedback, guardrails, student surface |
| 12.4 | Support chat | Student ↔ admin platform-feedback thread |

Copy the shared preamble plus **one** numbered prompt into Codex at a time.

---

# SHARED PREAMBLE — include this with every one of the four prompts

## ⚠ Working directory — do not get this wrong

Work **only** in the existing repository, in place. A previous session ran in a separate copy and created two divergent versions that had to be merged by hand. Do not repeat that.

```
<repo root>/
├─ app/                      ← the student app. Exists. Do not restructure it
│  ├─ package.json           ← currently the only package.json
│  ├─ src/
│  │  ├─ App.tsx · routes.ts · index.css
│  │  ├─ types/index.ts      ← the View union and DataPoint contract
│  │  ├─ data/repository.ts  ← every student-app DB read/write goes through here
│  │  ├─ dashboard/logic.ts  ← deriveDashboardStage lives here
│  │  ├─ screens/DashboardScreen.tsx
│  │  ├─ learning/logic.ts   ← submission validation, module gating
│  │  └─ auth/ · components/ · scoring/ · motion/
│  └─ supabase/
│     ├─ functions/counselor/    ← the pattern to copy for privileged functions
│     └─ migrations/
├─ admin/                    ← YOU CREATE THIS in 12.1. Second deployable
└─ docs/
   ├─ audits/QA_LAUNCH_AUDIT_2026-08-03.md
   ├─ planning/   ← briefs, proposals, workbooks
   └─ prompts/codex-prompt-11_qa-remediation.md
```

If a file you expect is missing, you are in the wrong directory — stop and report.

## Context

4Prep is a university-pathway platform for international students applying to US universities. It has a sourced catalogue with a five-component deterministic fit score (Φ), a grounded AI counselor, intake and pathway, saved plans, auth, and an eleven-module Learning Portal with homework upload.

These four prompts add the operator side of the product and close the loop for students.

### The user, again, because every decision follows from it

A 17-year-old in Tashkent, on a mid-range Android phone, on mobile data, on a connection that is often slow and sometimes drops. English is their second or third language. Their family has never done this before.

There is now a second user: **the 4Prep operator**, on a laptop, on a good connection. Build for both, and never let the operator's convenience cost the student performance.

---

## ⚠ Four rules that override everything else in these prompts

### 1. Two standing product rules are being deliberately reversed. Do not stop.

`app/CLAUDE.md:205` currently says: *"Do not build the four out-of-scope AI engines, **an admin console**, verification queue, outcome ledger, or desktop redesign."*
`docs/prompts/codex-prompt-10` lists: *"Grading, feedback, or review of homework — still deliberately unbuilt."*

**Both reversals are authorised by the product owner.** The admin console and homework feedback are now in scope. Prompts 9–11 instruct you to stop and report conflicts with the repository — this paragraph is the resolution of that conflict for these two items *only*.

In 12.1, update `app/CLAUDE.md` to record the reversal, the date, and what remains out of scope. Do not silently leave a document contradicting the code.

Everything else in `CLAUDE.md`'s non-negotiable rules still binds — especially never fabricating a university figure, the `DataPoint` contract, and Φ never being computed by AI.

### 2. The service-role key never reaches a browser. Ever.

The admin app is a **separate deployable** that authenticates a human admin and calls **privileged Supabase Edge Functions**. Those functions hold `SUPABASE_SERVICE_ROLE_KEY` and verify admin identity server-side before touching anything.

The admin app itself must never contain the service-role key, never receive it from an API, and never be able to obtain it. If your design has the key in a browser bundle, in a `VITE_` variable, or returned from any endpoint, the design is wrong — start over.

Every privileged function verifies the caller in this order: valid JWT → resolve user → confirm that user is an admin → only then use the service-role client. A missing or failed check must return 403 and write an audit row.

### 3. Reading a student's private data is an audited event

Homework, profiles, progress, and chat are the private records of a minor in most cases. Every privileged read of student data writes an audit row: who read, what, when. No exceptions, no silent reads, no "just this one query."

This is not bureaucracy. It is the only way to answer "who looked at my child's work" — a question this product will eventually be asked.

### 4. Do not build on unverified RLS

`docs/audits/QA_LAUNCH_AUDIT_2026-08-03.md` Section 10 records that **cross-user isolation has never been tested**. Every RLS policy in `202607310009_learning_portal.sql` is owner-only (`auth.uid() = user_id`) and none of it has been exercised with two real accounts.

You are about to add the first-ever legitimate cross-user read path. Doing that on top of unverified isolation is how a P0 happens.

**Precondition for 12.1:** a non-production Supabase project exists (see `docs/prompts/codex-prompt-11` Task 9 and `docs/QA_ENVIRONMENT.md`), and cross-user isolation is verified with two disposable accounts. If that environment does not exist, **stop and report** — do not proceed against production.

---
---

# PROMPT 12.1 — Admin foundation and the shared stage model

Ships: the admin app, the privileged boundary, homework access, the cohort view, active-user counts, and the student's own stage-and-goal dashboard.

## Task 1 — Admin identity

There is no role concept anywhere in the schema today. Every policy is owner-only. You are adding the first one.

Create an `admin_users` table that is readable and writable by **the service role only** — no anon or authenticated policy grants access to it at all. Seed it manually via SQL; there must be no self-service path to becoming an admin, no invite flow, no signup toggle, and no way for the student app to write to it.

Record enough to answer "who is this and when were they granted access." Consider whether you need a revocation timestamp rather than deleting rows, so that history survives.

Write a migration. **Do not apply it** — hand it to Jeff with instructions, per the shared preamble.

## Task 2 — The privileged Edge Function boundary

This is the security surface of the whole feature set. Design it once, properly, and make every later prompt reuse it.

Copy the shape of `supabase/functions/counselor/` — it already demonstrates the pattern: request ID, structured outcome logging, service-role client used only server-side, secrets read from `Deno.env`, never returned.

Build a shared admin-auth helper that every privileged function calls first. It resolves the caller's JWT, confirms admin status against `admin_users`, and returns a typed result. A function must not be able to skip it by accident — make the safe path the easy one and the unsafe path awkward to write.

Decide and document how you handle: no `Authorization` header, an expired token, a valid token for a non-admin, and a valid admin whose access was revoked. All four must fail closed, return 403, and be indistinguishable to the caller — do not leak whether a user exists or whether they were ever an admin.

Rate-limit privileged endpoints. An admin account is a higher-value target than a student account, and the counselor already shows the advisory-lock rate-limiter pattern you can follow.

## Task 3 — The admin app

Create `admin/` as a second deployable. It may share the design tokens in `app/src/index.css`, but it is its own Vite + React + TypeScript app with its own `package.json`.

It authenticates an admin through normal Supabase auth, then talks **only** to privileged Edge Functions. It never queries student tables directly with the anon key, because that would silently depend on RLS gaps rather than explicit authorization.

If a signed-in user is not an admin, the app shows a plain "not available" state and nothing else — no navigation, no data shapes, no hints about what exists.

This app runs on a laptop, so the mobile-first constraints that bind the student app do not apply. Do not spend effort making it beautiful. Make it legible, fast to scan, and hard to misuse.

## Task 4 — The shared stage model

The product owner wants the admin to see "which user is at which stage," and the student to see "what stage am I at." **These must be the same derivation.** If the admin's view and the student's view can disagree about where a student is, both are worthless.

`app/src/dashboard/logic.ts` already has `deriveDashboardStage` with tests in `logic.test.ts`. Extend that, do not duplicate it. Extract it into something both apps import — a shared module, a workspace package, whatever fits with least ceremony. Do not copy-paste it into `admin/`.

Think about what a stage actually means for this product before you extend it. The signals available are: intake profile completeness, saved plans, lesson completion, homework submitted, and now feedback received. A stage is only meaningful if a student would recognise themselves in it.

**Report recorded actions only.** The dashboard must never invent progress, imply grading that has not happened, or predict an admission outcome. That rule already governs `DashboardScreen.tsx` and it now governs the admin roster too.

## Task 5 — The cohort view

The admin needs a roster: who is signed up, what stage each student is at, when they were last active, and whether they have homework waiting.

Make "homework waiting for review" the thing the eye lands on first. That is the operator's actual job; everything else is context.

Support finding one student quickly. Do not build faceted filtering, saved views, or bulk operations — this is a pilot cohort, not a CRM.

## Task 6 — Homework access

An admin opens a student's submission and reads it. Files live in the private `learning-submissions` bucket with owner-only Storage policies.

Serve them through **short-lived signed URLs minted inside a privileged function** after the admin check. Do not loosen the Storage policies to grant admin read, and do not make the bucket public. The existing owner-only policies are correct and must stay exactly as they are.

Every file opened writes an audit row (preamble rule 3).

Show the submission with its assignment brief and rubric alongside it. An operator reviewing work should not have to go find what was asked.

## Task 7 — Active users

The owner asked how many active users there are. Decide what "active" honestly means for this product and **write the definition into the UI next to the number**, so nobody later mistakes one metric for another.

Signed-up, signed-in-recently, and did-something-recently are three very different numbers. Pick the ones that would actually change an operator's decision. Resist building an analytics dashboard — a small number of honest counts beats a wall of charts nobody trusts.

Do not add an analytics dependency or any third-party tracking. This product holds the private data of minors.

## Task 8 — The student's stage and goal

The student dashboard already exists at `app/src/screens/DashboardScreen.tsx`. Extend it; do not rewrite it.

Two additions. **Where they are:** their stage, from the shared model in Task 4, in plain language a 17-year-old reading in a second language will understand. **What they are working toward:** their goal, drawn from the intake profile already in `student_profiles` — destination, field, budget, intake term — with a route back to intake to change it.

If they have not completed intake, that absence *is* the state. Say so and link to intake. Do not show an empty goal card.

Keep the existing empty, partial, and loading states working. Keep the "recorded actions only" rule.

## Out of scope for 12.1

- Video, feedback generation, or chat — those are 12.2, 12.3, 12.4
- Editing lesson or catalogue content from the admin app
- Any self-service admin invite or role-management UI
- Impersonating a student
- Analytics libraries or third-party tracking of any kind
- Bulk operations, CSV export, saved views
- Applying migrations or deploying functions
- Changing Φ, the catalogue, the counselor, or the `DataPoint` contract
- Making the `learning-submissions` bucket public, or relaxing any existing owner-only policy

## Definition of done for 12.1

1. `npm run build`, `npm run lint` (zero warnings), `npm run test`, and the SSR smoke check pass in `app/`. The admin app builds and lints clean.
2. **No student-app regressions.** Search, profile, compare, intake, results, tools, saved, counselor, all four Learning Portal screens, dashboard, auth, privacy all still work.
3. **Prove the service-role key is absent from both client bundles.** Grep the built output for the key, for `service_role`, and for any `VITE_`-prefixed secret. State the exact command and its output.
4. Cross-user isolation verified in the QA environment with two disposable accounts: student A cannot read B's profile, saved plans, progress, submissions, or Storage objects. State the actual checks.
5. A non-admin signed into the admin app receives 403 from every privileged function and sees no data shapes.
6. A revoked admin loses access immediately.
7. Every privileged read of student data writes an audit row. Demonstrate one.
8. Signed URLs for homework files expire. State the TTL and why.
9. Student dashboard and admin roster report the **same stage** for the same student, from the same code path. Test it.
10. `app/CLAUDE.md` updated to record the reversal. `docs/ADMIN.md` written: authorization model, privileged endpoints, audit schema, and how Jeff grants and revokes admin access.
11. Migrations written and **not applied**, with an ordered apply-instruction for Jeff.

## In your summary for 12.1, state plainly

- The full authorization chain from admin click to database row, and where it fails closed.
- Your evidence that the service-role key cannot reach a browser.
- Your definition of "active user" and why you chose it.
- What a stage means, what signals feed it, and how you kept the two views identical.
- What is audited and what is not.
- Anything you could not verify, especially anything still needing Jeff.

---
---

# PROMPT 12.2 — Lesson video pipeline

Ships: admin uploads a lesson video; students watch it on a slow connection without the app falling over.

**Precondition:** 12.1 is shipped and its Definition of done is met.

## The decision that is already made

Videos are hosted on an **external streaming provider with adaptive bitrate** — Mux or Cloudflare Stream. This is settled; do not re-litigate it, and do not fall back to storing MP4s in Supabase Storage.

The reason is the student. A single large MP4 served from object storage to a mid-range Android on Tashkent mobile data buffers until they give up. Adaptive bitrate degrades resolution instead of stalling. That difference is the whole point of paying a vendor.

Compare Mux and Cloudflare Stream on pricing at pilot scale, signed-playback support, and how much client JavaScript each requires. **Recommend one, justify it in two or three sentences, and implement that one.** If the two are close, prefer the smaller player bundle — that is the student's download.

## Task 1 — Upload

Admin uploads from the admin app via a **signed direct upload**: a privileged function mints a short-lived upload URL, the browser uploads straight to the provider. The video file must not proxy through an Edge Function, and the provider's API secret must never reach the browser.

Supabase stores **only** the playback identifier, duration, status, and provider name against the lesson. No video bytes in Postgres, none in Supabase Storage.

`learning_lessons` already has `media_url`, `audio_url`, `transcript`, and a `draft`/`published` status. Work out whether `media_url` can carry a playback ID honestly or whether you need explicit provider columns — and say which you chose and why. Do not overload a column in a way that makes its meaning ambiguous later.

Uploads take time and connections drop. Show real progress, survive a page refresh, and make a failed upload obviously retryable. Never leave a lesson pointing at a video that does not exist.

## Task 2 — Playback

The student player must:

- Not block the lesson. Text renders immediately; the player hydrates after. A student on a slow connection reads the lesson while the video loads — this follows the existing rule that motion and media never delay content.
- Default to a data-conscious quality and let the student choose. Some are paying per megabyte.
- Handle failure honestly. If the video cannot load, say so and leave the rest of the lesson usable. Never a spinner that never resolves.
- Be keyboard operable with visible focus, and captioned if a transcript exists. `learning_lessons.transcript` already exists — use it, and show it as readable text for students who would rather read than stream.

Respect `prefers-reduced-motion`: no autoplay, ever.

## Task 3 — Access control

Decide whether lesson videos are public or signed-playback only, and justify it. Signed playback prevents link-sharing and is the safer default for paid-for content, at the cost of a token round-trip before playback.

Whatever you choose, the sequential module gating in `app/src/learning/logic.ts` must hold: a student must not be able to play a video from a locked module by guessing a URL. Verify this, do not assume it.

## Out of scope for 12.2

- Transcoding, editing, trimming, or thumbnail generation in-app — the provider does this
- Live streaming
- Downloadable or offline video
- Auto-generated captions or transcripts. Transcripts stay an authoring slot
- DRM
- Video analytics beyond what the provider gives you free
- Writing lesson content

## Definition of done for 12.2

1. Build, lint, test, SSR smoke all pass in both apps.
2. Provider API secret absent from both client bundles. State the command and output.
3. A lesson video uploads, stores only its playback ID, and plays in the student app.
4. **Verified on a throttled connection** — simulate slow 3G, state what you did and what happened. This is the acceptance test that matters.
5. Player bundle cost reported: student-app bundle size before and after.
6. Lesson text renders before the player hydrates. Show how you verified it.
7. A locked module's video cannot be played by direct URL.
8. Player is keyboard operable with visible focus; transcript renders when present; no autoplay under reduced motion.
9. Upload failure and playback failure both degrade honestly. Demonstrate both.
10. `docs/VIDEO.md`: provider chosen and why, upload flow, what is stored where, access-control model, and the cost model at pilot scale.

## In your summary for 12.2, state plainly

- Which provider, and the two or three sentences of justification.
- What is stored in Postgres versus at the provider.
- Bundle size before and after, and the throttled-connection result.
- Your access-control choice and how you proved locked modules stay locked.
- The expected monthly cost at pilot scale, with the assumptions behind it.

---
---

# PROMPT 12.3 — AI homework feedback

Ships: a student submits homework and receives feedback without waiting for a human.

**Precondition:** 12.1 is shipped.

## ⚠ Read this before you design anything

The product owner has chosen **AI-generated feedback delivered to the student without human review**. That decision is made. Your job is to make it safe.

Understand what you are building. A 17-year-old, often the first in their family to apply abroad, reading critique of their own work in a second or third language, with no person having checked what they are about to read. Feedback that is wrong, harsh, or invented does real damage — and the student has no way to know it was wrong.

Every constraint below exists because of that. None is optional.

### The guarantees that must hold for every piece of feedback

**It is visibly AI-generated, every time.** Not a footnote. Not a tooltip on hover. The student must never believe a person read their work when none did. The counselor's `AIResponseBlock` and its labelled-banner pattern already establish how this product marks machine output — follow it.

**It never predicts admission.** Not "this would get you into Harvard," not "this is not competitive enough," not a probability, not a grade that implies one. `CLAUDE.md` forbids this everywhere and homework feedback is not an exception.

**It never decides for the student.** The founder's rule, verbatim from `CLAUDE.md`: *"I want the applicant to make the decision, not me."* Feedback lays out what is strong, what is unclear, and what would strengthen it. It does not tell them which university to pick, which essay to submit, or which path to take.

**It invents nothing.** No deadline, fee, tuition figure, test-score requirement, scholarship, or statistic that is not in 4Prep's verified records. If feedback references a university figure at all, it comes from the catalogue with its citation, exactly as the counselor does — reuse that grounding discipline rather than reinventing it. If it cannot be grounded, it is not said.

**Every gap is paired with what would close it.** Again from `CLAUDE.md`: *"Where there is a gap, pair it with what would close it. Do not flatter and do not discourage."* Naming a weakness without a next step is not feedback, it is discouragement.

**It refuses rather than guesses.** If the submission is a photo it cannot read, a corrupt file, an empty document, or in a language it cannot handle, it says so plainly and tells the student what to upload instead. It must never produce confident feedback about content it could not actually read. This is the single most likely failure mode — design against it first.

**The student can flag it.** One obvious control on every piece of feedback: this is wrong, or this was unhelpful. Flags route to the admin queue. This is the only safety net between a bad generation and a student who believes it.

**The admin can see and retract.** Every generated piece of feedback is visible in the admin app, and an admin can retract one so the student no longer sees it. Retraction is honest — the student is told it was withdrawn, not left with a silent gap.

**It is auditable.** Store model, prompt version, submission reference, and timestamp with every generation, the way the counselor stores `PROMPT_VERSION` and `CACHE_VERSION`. When feedback is wrong you must be able to determine what produced it.

## Task 1 — Generation

Feedback generates server-side in a privileged Edge Function, triggered on submission. The provider key stays server-side. Reuse the counselor's structural patterns: timeout, abort, typed response parsing, and a refusal path that never falls back to an unverified answer.

Ground the generation in the assignment's `brief` and `rubric` — both already exist on `learning_assignments`. Feedback must address what was actually asked, not offer generic essay advice.

**Cap the cost.** Feedback generation is unbounded spend triggered by user action. Rate-limit per user, cap regeneration, and make the ceiling explicit in `docs/`. `DATABASE_STATE.md` already records that Perplexity billing has no hard cap — do not add a second uncapped spend path.

Generation takes time. The student must never sit on a blocked screen: submission succeeds immediately, feedback arrives when ready, and the pending state is honest about what is happening.

## Task 2 — The student surface

Feedback appears on the submission and is reflected on the dashboard, using the stage model from 12.1. Receiving feedback is a stage change — a student who has been given feedback is somewhere new.

Write the pending, ready, failed, and retracted states as designed states, not afterthoughts. Failed generation must be recoverable and must never look like the student did something wrong.

Format it so it is usable on a phone in a second language: short paragraphs, plain sentences, no jargon it has not explained. Reading level matters more here than anywhere else in the product.

## Task 3 — Admin oversight

The admin sees every piece of generated feedback, every flag a student raised, and can retract. Flagged feedback is a queue an operator works through — make it the second thing they see after homework awaiting review.

Retraction and flags are audited like every other privileged action.

## Out of scope for 12.3

- Human-written feedback, rubric scoring UI, or grades. Not in this prompt
- Any numeric score, letter grade, or percentage on homework
- AI touching Φ. Φ is deterministic and must never be computed by AI — this rule is absolute
- Feedback on anything other than a Learning Portal submission
- Auto-retry loops that generate spend without a human deciding
- Notification email or SMS. In-app only for now

## Definition of done for 12.3

1. Build, lint, test, SSR smoke pass in both apps.
2. Provider key absent from both client bundles. State the command and output.
3. Each of the eight guarantees above is demonstrated, individually, with the check you ran. A list of assertions is not evidence.
4. **Refusal path proven** with an unreadable submission — a photo of handwriting, an empty file, a corrupt file. State what the student saw. This is the most important test in this prompt.
5. No generated feedback contains a university figure absent from verified records. State how you tested it.
6. Cost ceiling implemented and documented. State the per-user limit and the worst-case monthly spend.
7. Pending, ready, failed, and retracted all render correctly at 375px.
8. Student flag reaches the admin queue; admin retraction removes it from the student's view and tells them it was withdrawn.
9. Submission never blocks on generation.
10. `docs/FEEDBACK.md`: guarantees, prompt design, grounding rules, cost model, audit schema, and the escalation path when feedback is wrong.

## In your summary for 12.3, state plainly

- How each of the eight guarantees is enforced in code — not that you followed them, but where the enforcement lives.
- What happens with a submission the model cannot read, and how you tested it.
- Your grounding approach for university figures, and how it relates to the counselor's.
- The cost ceiling and worst-case monthly spend.
- Every failure mode you identified and did not fully mitigate. Be honest here — this is the part a human will need to watch in the pilot.

---
---

# PROMPT 12.4 — Support chat

Ships: a student can tell the operator that something on the platform is broken or confusing, and get a reply.

**Precondition:** 12.1 is shipped.

## What this is, and what it is not

This is a **platform-feedback channel**. "The video will not load." "I do not understand what this module is asking." "The cost figure looks wrong."

It is explicitly **not** an admissions advice channel. The grounded counselor answers admissions questions, with its scope gate and its grounding contract. If chat becomes a side door to unsourced admissions advice from a human typing quickly, it defeats every guarantee this product makes about provenance.

Design against that drift. Make the entry point say what the channel is for and route admissions questions to the counselor. Do not build a scope gate — a human is on the other end — but make the intended use obvious enough that misuse is rare.

## Task 1 — Model and access

One thread per student, admin on the other side. No student-to-student messaging, no group threads.

RLS: a student reads and writes only their own thread. Admin access goes through the privileged boundary from 12.1, and reading a thread is audited like any other student-data read.

Messages from a minor are private records. Decide retention and write it into `docs/` and the privacy page — `app/src/screens/AuthPrivacyScreens.tsx` already carries the privacy policy, and `CLAUDE.md` notes the real contact and deletion process are still owed. Chat must be covered by account deletion: check `supabase/functions/delete-account/index.ts` and extend it. A deletion that leaves chat history behind is a broken promise.

## Task 2 — Student side

A small, unobtrusive entry point. This is a support channel, not the product — it must not compete with the counselor for attention.

Set expectations honestly: say when a reply is likely, and never imply someone is watching in real time when nobody is.

Handle offline properly. This student loses connection regularly. A message must never be silently lost — queue it, show its state, and always say clearly what was and was not sent.

Rate-limit to prevent abuse, with a message that does not read as punishment.

## Task 3 — Admin side

An inbox: which threads are waiting, oldest first, with the student's stage visible so the operator has context before replying.

Optimise for reading and replying quickly. No canned responses, no tagging, no assignment, no SLA tracking. One operator, a pilot cohort.

## Task 4 — Realtime, or honestly not

Decide whether to use Supabase Realtime or polling, and justify it against the student's connection quality — a dropped websocket that silently stops delivering is worse than polling that visibly retries.

Whatever you choose, the UI must never claim delivery it cannot confirm. If it says sent, it was sent.

## Out of scope for 12.4

- Student-to-student messaging, group threads, or public forums
- File or image attachments in chat
- Voice or video calling
- Push, email, or SMS notification
- Chatbots or auto-replies of any kind. A human replies, or nobody does
- Read receipts and typing indicators — the operator is one person, not a support desk
- Using chat to deliver homework feedback. That is 12.3

## Definition of done for 12.4

1. Build, lint, test, SSR smoke pass in both apps.
2. Cross-user isolation verified with two disposable accounts: student A cannot read, write to, or enumerate B's thread. State the checks.
3. Admin thread reads are audited.
4. **Account deletion removes chat history.** Demonstrate it, including any Storage side-effects.
5. Offline behaviour verified: message queued, state visible, nothing silently lost. State how you simulated it.
6. Rate limit works and reads as helpful.
7. Entry point makes the channel's purpose clear and routes admissions questions to the counselor.
8. Works at 375px: thread scrolls, composer stays reachable, keyboard does not obscure input, no horizontal overflow.
9. Keyboard operable with visible focus; new messages announced via `aria-live`.
10. Privacy page and `docs/` updated with retention and deletion.

## In your summary for 12.4, state plainly

- Realtime or polling, and the justification against connection quality.
- How you prevented drift into an admissions-advice channel.
- Your retention policy and how deletion was verified.
- Offline behaviour and how you tested it.
- Anything you could not verify.

---
---

# Applies to all four prompts

## Out of scope throughout

- Applying migrations, deploying Edge Functions, or changing Supabase, Vercel, or DNS settings
- Creating user accounts in production
- Any new heavy runtime dependency without asking first
- Changes to Φ scoring, the catalogue data, the counselor's grounding contract, or the `DataPoint` contract
- Payments, tiers, or subscriptions. The product is free
- Dark mode, a new palette, a new typeface
- Rewriting the hand-rolled router as a routing library

## Non-negotiables that still bind

Every rule under "Non-negotiable product rules" in `app/CLAUDE.md` remains in force except the two reversals named in the preamble. In particular: never fabricate a university figure; every displayed fact stays a `DataPoint`; known facts need a real `sourceId` and unknown facts need a reason and suggested action; never use zero, an em dash, or an estimate as a missing-data fallback; never show a bare fit score; **Φ is deterministic and must never be computed by AI**; API keys stay server-side; strict TypeScript with zero build errors.

If any instruction here conflicts with what you find in the repository — other than the two authorised reversals — **stop and report the conflict rather than choosing for yourself.**
