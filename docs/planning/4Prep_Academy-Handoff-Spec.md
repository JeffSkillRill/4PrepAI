# 4Prep — Academy handoff build spec

**Date:** 10 August 2026 (Asia/Tashkent)
**Status: BUILT 10 August.** All six pieces are in the working tree, unapplied and uncommitted.
App: 29 test files / 277 tests, tsc, lint `--max-warnings 0`, and the SSR smoke all pass from a fresh
`npm ci`. Admin: 3 files / 13 tests, tsc, lint, build all pass.

**One gate remains before this can go live:** the migration has never been executed. It was checked
structurally (balanced blocks, every function revoked/granted/commented, discriminated-union narrowing
in `admin-api` proven with a compiled negative control) but no Postgres was available in the build
sandbox. Run it once against a real database before Production. Nothing was applied, deployed,
committed, or pushed.
**Revised estimate: 6.5 hours** — up from the 3 hours in `4Prep_Startup-Gap-Plan_2026-08-10.md` §1B.
That estimate covered the happy path and missed rate limiting, retention, account-deletion integration,
and tests. Those aren't optional on a public endpoint holding a minor's contact details.

---

## 0. What "the handoff" actually is

Six pieces. Only the first three are the feature; the last three are what make it safe and measurable.

| # | Piece | Hrs |
|---|---|---:|
| 1 | `leads` table + `submit_lead` RPC with rate limiting | 2.0 |
| 2 | `AskACounselor` component with real states | 1.25 |
| 3 | Two placements: results screen, and `MissingValue` | 0.75 |
| 4 | Admin inbox surface + audit | 0.75 |
| 5 | Retention, account-deletion integration, privacy copy | 1.0 |
| 6 | Instrumentation + tests | 0.75 |
| | **Total** | **6.5** |

The thing that is *not* on this list, and matters more than any of it: **a human who replies within a
day.** That is Hire 1's job. A handoff that captures leads nobody answers is worse than no handoff,
because it teaches a student that the honest product doesn't follow through.

---

## 1. Data layer

### 1.1 Table — follow the counselor/support pattern exactly

RLS on, **zero policies**, revoked from `anon` and `authenticated`, granted to `service_role` only.
Writes go through a `security definer` RPC. This is the same shape as `counselor_requests` and
`support_messages`, and it is the right one here: the browser must be able to insert but must never be
able to read anyone's leads, including its own.

```sql
-- 202608100017_academy_handoff.sql
begin;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  -- Nullable: an anonymous browser hitting a gap is the highest-intent moment
  -- in the product and must not be forced through signup first.
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  contact text not null,
  -- Where in the product the student asked from. Drives attribution.
  source text not null check (source in ('results', 'gap', 'counselor_refusal')),
  -- University id, field name, or pathway ref. Never free text from the student.
  context_ref text,
  note text,
  status text not null default 'new'
    check (status in ('new', 'claimed', 'answered', 'closed')),
  claimed_by uuid,
  claimed_at timestamptz,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint leads_name_length check (char_length(btrim(name)) between 1 and 120),
  constraint leads_contact_length check (char_length(btrim(contact)) between 3 and 200),
  constraint leads_note_length check (note is null or char_length(btrim(note)) <= 1000),
  constraint leads_context_ref_length check (context_ref is null or char_length(context_ref) <= 200),
  -- Status and its timestamps must agree. Same bundle-check discipline as
  -- support_threads_last_message_bundle.
  constraint leads_claim_bundle check (
    (status = 'new' and claimed_by is null and claimed_at is null)
    or (status <> 'new' and claimed_by is not null and claimed_at is not null)
  ),
  constraint leads_answered_bundle check (
    (answered_at is null and status in ('new', 'claimed'))
    or (answered_at is not null and status in ('answered', 'closed'))
  )
);

alter table public.leads enable row level security;
revoke all on public.leads from public, anon, authenticated;
grant all on public.leads to service_role;

-- Oldest unclaimed first: this is the operator's work queue.
create index leads_queue_idx on public.leads (created_at asc) where status = 'new';
create index leads_rate_idx on public.leads (created_at desc);
create index leads_user_idx on public.leads (user_id, created_at desc) where user_id is not null;

commit;
```

**Note `on delete cascade`, not `set null`.** A lead holds a name and a contact in plain columns —
nulling `user_id` would not anonymise it. If a student deletes their account, the lead goes. That is
the only reading of "delete my account" that is honest.

### 1.2 `submit_lead` RPC

Model it on `send_support_message`: `security definer`, `set search_path = ''`, validates, rate-limits
under an advisory lock, returns a status rather than raising for the expected-failure cases.

```
submit_lead(p_lead_id uuid, p_name text, p_contact text,
            p_source text, p_context_ref text, p_note text)
  returns table (status text, lead_id uuid, retry_after_seconds integer)
```

Behaviour:

- `p_lead_id` is client-generated so a retry is idempotent — same as `send_support_message`. Re-submitting an existing id returns `status='duplicate'`, not a second row.
- Trim and length-check every field; raise `22023` on malformed input.
- Take `pg_advisory_xact_lock` on the caller key, count recent rows, then insert — the `begin_counselor_request` pattern.
- **Limits:** authenticated — 3/hour, 10/day per `user_id`. Anonymous — 5/hour globally per install is meaningless without an IP, so see the caveat below.
- Reject a submission from an admin identity, as `send_support_message` does.

**The anonymous rate-limiting caveat, stated plainly.** Postgres cannot see the caller's IP, so an
RPC can only rate-limit anonymous submissions weakly. Two honest options:

- **v1 (ship this):** accept anonymous leads through the RPC with a global hourly ceiling, a hidden honeypot field, and a client-side submit throttle. At your volume — under 50 students — this is proportionate, and a junk lead costs one operator glance.
- **v2 (trigger: first spam burst):** move the write behind an edge function, exactly like `counselor`, so it can salt the IP into a `caller_key` and reuse the counselor's limiter. Roughly 1.5 hours when you need it.

Do not pretend v1 is airtight. Write the limitation into the migration comment so the next person
doesn't assume it is.

---

## 2. Component — `AskACounselor`

One component, used in both placements, taking `source` and `contextRef` as props.

**Fields:** name, contact (one field — phone, Telegram handle, or email; do not make a 17-year-old
choose a channel), optional one-line note. Plus a hidden honeypot input that must stay empty.

**States**, matching the existing `States.tsx` discipline — no silent failure anywhere:

| State | Behaviour |
|---|---|
| `idle` | The ask, plus the honest framing in §4 |
| `submitting` | Disabled, spinner, no double-submit |
| `submitted` | Confirms **what happens next** — "a counsellor from 4Prep Academy will be in touch". No time window (decided 10 Aug). Do not say "thanks!" and vanish |
| `duplicate` | Treated as success. The student does not need to know about idempotency |
| `rate_limited` | Names the wait, using `retry_after_seconds`. Never a generic error |
| `failed` | Says it failed, keeps the typed values, offers retry. Falls back to showing `contact@4prep.ai` so the student is never dead-ended |
| `offline` | Reuse `useOnlineStatus()` — the app already has this |

**Constraints:** existing tokens in `index.css` only — no new palette. 44px touch targets. Visible
focus. Real `<label>`s. `aria-live` on the state change, matching what `SearchScreen.tsx:132` already
does for results.

---

## 3. Placements

### 3.1 Results screen — `source='results'`

Below `FitBreakdown`, after the student has seen their five components. Not above — let them get the
sourced answer first, then offer the human. `context_ref` = the pathway ref.

### 3.2 `MissingValue` — `source='gap'`

**This is the one that matters.** `MissingValue` already renders a `reason` and an `action`. Today the
action is a static string. Make it optionally a trigger that opens the component inline, with
`context_ref` = `universityId:fieldName`.

Gate it to `kind='institution'`. A `kind='profile'` gap means "finish intake" — the student can resolve
that themselves in ten seconds, and offering a human there is noise.

Do not attach it to every gap on a page. Berea and Houston City College have five each; five identical
CTAs reads as desperate. **One per cluster** — put it on `HonestGapCluster`, not on each `MissingValue`
inside it.

### 3.3 Counselor refusal — `source='counselor_refusal'`, deferred

The refusal path is the third natural placement and the schema allows it. Hold it until the first two
have a week of data — three placements at once means you learn nothing about which one works.

---

## 4. The copy

The hardest part, and the part no engineer will get right for you.

Your product's promise is that it never invents and never oversells. A CTA that reads
"Get expert help now!" breaks that in four words. Constraints from `4prep-counselor-voice`: the
counselor presents options and never decides for the student — the handoff inherits that.

**Say:** what the Academy is · what the student is asking for · that the app stays free either way.

**Never say:** anything about admission odds · "expert" · urgency · anything implying the free product
is degraded without it.

**Decided 10 Aug:** no pricing language, and **no stated reply window**. The confirmation says a
counsellor will be in touch, without a time. Revisit the window when Hire 1 starts and someone is
actually watching the queue — a stated time nobody meets costs more than no time at all.

A working draft for the gap placement:

> **This one isn't published.**
> Berea College doesn't publish an international student fee schedule, so we won't guess at it.
> A counsellor at 4Prep Academy — the same team behind this app — can contact the university and
> find out. The app stays free either way.
> *[Ask them to look into it]*

That reads as the honest product following through on its own gap, which is exactly what it is.

---

## 5. Admin surface

Add to `admin-api`, following the `chat_inbox` / `chat_thread` / `chat_reply` shape already there:

- `lead_inbox` — unclaimed first, `leads_queue_idx` order
- `lead_claim` — sets `status='claimed'`, `claimed_by`, `claimed_at`
- `lead_resolve` — sets `answered` or `closed` with `answered_at`

Every action audited via the existing `audit()` helper with `resourceType: 'lead'`. Authorization,
rate limiting, and the uniform 403 all come free from `_shared/adminAuth.ts` — do not write new auth.

The one number to show at the top of the list: **oldest unclaimed lead, in hours.** That is the health
metric for the whole mechanism.

---

## 6. Retention, deletion, privacy

Three items that are easy to skip and expensive to skip.

1. **Retention.** `prune_old_leads()` deleting `closed` rows older than 180 days, modelled on the counselor's 7-day prune. A minor's contact details should not sit in a table forever because nobody wrote the job.
2. **Account deletion.** `delete-account` currently removes storage objects, submissions, threads, files, profiles, plans, and progress, then re-counts to verify. **Add `leads` to both the delete list and the verification re-count.** The `on delete cascade` handles it automatically once the user row goes — but the function's explicit re-count is the thing that proves it, and that list is hand-maintained.
3. **Privacy policy.** Name lead capture: what is collected, who sees it, how long it is kept, how to have it removed. Ships *before* the first placement goes live, not after.

---

## 7. Instrumentation

Four events, using the nine-event set from the gap plan:

- `handoff_shown` — with `source`. The denominator; without it a conversion rate is meaningless
- `handoff_opened` — the form was expanded
- `lead_submitted` — with `source` and whether the student was authenticated
- `lead_failed` — with the failure state

**The funnel that decides everything:** `handoff_shown → handoff_opened → lead_submitted → replied →
consultation → enrolled`. The last three live in the admin console and the operator's sheet, not in
PostHog. Stitch them on `lead_id`.

---

## 8. Tests

Matching the existing 28-file suite:

- RLS proof: an anonymous client and a signed-in client each `select` from `leads` and get nothing. This is the test that matters most — the table holds minors' contact details
- The rate limiter returns `rate_limited` with a sane `retry_after_seconds` past the threshold
- Re-submitting the same `p_lead_id` returns `duplicate` and does not create a second row
- Both status bundle constraints reject an inconsistent row
- Component: each of the seven states renders, and `failed` preserves typed values
- `delete-account` re-count includes `leads` and returns zero after deletion

---

## 9. Order of build

```
1. Migration + RPC + RLS test          2.0   ← nothing else works without this
2. Privacy policy copy                 0.25  ← must precede any live placement
3. Component + states + tests          1.25
4. Gap placement (HonestGapCluster)    0.5   ← ship this one first, it's the better one
5. Results placement                   0.25
6. Admin inbox + audit                 0.75
7. Retention + delete-account          0.75
8. Instrumentation                     0.75
                                       ────
                                       6.5 hrs
```

Ship after step 5 if you must — but only if a human is watching the table, and only for a day or two.
Steps 6–8 are what make it a mechanism rather than a demo.
