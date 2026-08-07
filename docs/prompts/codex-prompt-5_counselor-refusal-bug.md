# Codex Prompt — BUG: counselor refuses every answer, including fully-sourced ones

Copy everything below the line into Codex.

---

## ⚠ Working directory — do not get this wrong

Work **only** in the existing repository, in place. A previous session ran in a separate copy and created two divergent versions that had to be merged manually. Do not repeat that.

```
<repo root>/
├─ app/
│  ├─ package.json          ← the only package.json
│  ├─ src/
│  └─ supabase/             ← migrations + functions live INSIDE app/
│     └─ functions/counselor/index.ts   ← the file in question
└─ docs/DATABASE_STATE.md   ← at the REPO ROOT, not inside app/
```

Do not scaffold a new project, create a parallel `app/`, add a second `package.json`, or create `app/docs/`. If a file you expect is missing, you are in the wrong directory — stop and report. Commit locally to `main`; do not push or branch.

## The bug

The Perplexity-backed counselor Edge Function (`app/supabase/functions/counselor/index.ts`) **refuses every question**, including ones whose figures are fully sourced in the database.

**Reproduction:** ask *"What is tuition at the University of Southern Mississippi?"*
The University of Southern Mississippi has **17 sourced facts and zero unknowns** — tuition is present, `known`, with a valid `source_id`. The counselor should return a verified figure with citations.

**Actual result:** the UI shows *"Verified answer unavailable — I cannot verify that figure from the records supplied to me. Please use the university page in 4Prep or ask admissions directly."*

That exact string is returned from **one place only**: the `if (!validation.ok)` branch after `validateFigures(...)`. So the request reaches Perplexity, gets a response, and is then rejected by our own validator. This is a false rejection, not a grounding success.

## What has already been changed (and did not fix it)

`validateFigures` was already edited to:
- accept citations from the structured `recordCitations` array instead of requiring inline `[id]` markers in the prose;
- compare figures format-insensitively (so `$11,700`, `USD 11700` and `11,700` are equal);
- normalize numeric tokens before comparison.

The system prompt was updated to tell the model to quote figures exactly and put IDs in `recordCitations`. Inline `[id]` markers are now stripped before display.

**The symptom persists.** Do not assume these edits are correct or that they are live — verify both.

## Diagnose before you change anything

Work through these in order and report findings at each step. **Do not "fix" anything until you can state the exact failing condition.**

1. **Is the deployed function actually the current file?** Edge Functions run server-side; local edits do nothing until redeployed. Compare the deployed version with the working tree and confirm the deployment timestamp is after the edits above. If it was never redeployed, that alone may be the bug — deploy, retest, and report.

2. **Read the evidence we already have.** Query the `counselor_strikes` table. Every false rejection logs `detail` as JSON containing `untraceable`, `figures` and `citations` from the failed attempt. This tells you precisely which condition failed:
   - `citations: []` → the model's returned IDs did not survive the `allowedCitationIds` filter.
   - `untraceable: [...]` → figure matching failed; the listed values are what did not match.
   Report the raw rows.

3. **Log the raw model response.** Temporarily log the unparsed Perplexity response body, the parsed `answerType`, `answer`, and `recordCitations`, and the computed `allowedCitationIds`. Then run the Southern Mississippi question live and paste the actual output. Remove the temporary logging before you finish.

4. **Check the citation-ID round trip specifically.** `allowedCitationIds` is built from `records.map(r => r.citationId)`. Confirm what the model actually returns (e.g. `us-southernmiss-cost`) and whether those strings match the `source_id` values exactly. Mismatches in case, prefix, whitespace, or the model returning a URL/university name instead of the ID will empty the `citations` array and force a refusal.

5. **Check the record payload itself.** Confirm the Supabase query in the function actually returns Southern Mississippi's tuition row with a non-null `source_id`, and that `knownContext()` maps it to `status: 'known'`. If `status` is `'unknown'` for a sourced fact, the bug is upstream of the model entirely.

6. **Verify the JSON-schema response format** is supported by the configured model (`PPLX_MODEL`, default `sonar`). If the provider ignores or rejects `response_format`, `parsed.answer` may be empty or malformed — which would also produce a refusal.

## Fix

Fix the root cause you identified. Constraints:

- **Do not weaken the safety guarantee.** After your fix, all of these must still hold:
  - A figure that does **not** appear in the supplied records is rejected and logged as a strike.
  - An answer containing a figure but **no valid citation** is rejected.
  - A question whose figure is stored as `unknown` still refuses **before** calling Perplexity.
- Do not delete the validator or make it pass-through.
- Do not add web-sourced figures for university facts under any circumstances.
- Keep the three answer types (`verified_fact`, `general_guidance`, `refusal`) intact.

If the correct fix is to make the model's job easier (e.g. returning a compact citation token per record rather than making it echo long IDs), that is acceptable — but the mapping back to a real `source_id` must be exact and server-side.

## Prove it works — paste real transcripts

Run these against the **live deployed** function and paste the actual answers, the `answerType`, and the citations returned:

1. *"What is tuition at the University of Southern Mississippi?"* → must return the **sourced figure with citations**. (This is the currently-failing case.)
2. *"What is the minimum GPA for international students at Berea College?"* → stored as `unknown` → must **refuse** and cite nothing.
3. *"How much money do I need to show for the I-20 at Princeton?"* → stored as `unknown` → must **refuse**; the model knows a plausible web figure, so this proves the guard holds.
4. *"How do I write a good personal essay for US applications?"* → must return **`general_guidance`**, labelled as not-verified, with web citations.
5. *"What is tuition at Stanford?"* → not in the catalogue → must say so, **not** answer from the web.

Also confirm `counselor_strikes` contains no new rows for cases 1 and 4, and that any row written for 2/3 is a legitimate catch.

## Deliverable

State the root cause in one sentence, the fix, and why it could not have been caught by the existing unit tests. Add a regression test covering the exact failure so it cannot recur. Update `docs/DATABASE_STATE.md` only if schema or data changed. Report anything still blocked in **⚠ Needs Jeff**.
