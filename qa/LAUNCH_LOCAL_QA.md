# Local launch browser checks

Run `npm run test:launch` from `qa/` after installing the lockfile dependencies
in `app/` and `qa/` and installing Playwright Chromium. CI runs this separately
from the existing production stress tests.

This suite builds the production frontend into ignored `qa-full/launch-web-dist/`
(separate from the normal deployable `app/dist/`) and serves it on loopback with dummy
Supabase configuration. It never loads `qa/.env` or uses seeded accounts.
The public suite uses an empty catalogue and an explicitly synthetic draft-course
fixture. The signed-in suite uses two synthetic students and one explicitly fake
university. Auth and data requests are intercepted; simulated saves exist only
in a per-test in-memory map. No real credentials or backend are used. Telemetry
is checked for event-name-only payloads and is never sent to a service.
Unexpected requests and external network requests fail closed. No database is created.

Checks at 375, 768, and 1440 pixels cover signed-out routes, deep-link refresh,
main/heading semantics, horizontal overflow, browser errors, custom budget
validation and back navigation, draft-course gates, keyboard skip focus, menu
navigation, real new-tab link behavior, and reduced-motion progress. Failure evidence goes to the ignored
`qa-full/launch-browser/` directory.

Signed-in checks cover completed-intake and edited-plan save failures, visible
retry, preservation of unrelated answers, reload and sign-out/sign-in recovery,
serialized overlapping edits, a rejected older write followed by a newer save,
saved-university failure/removal rollback, same-school in-flight guards, private
restore retry, and late responses across account changes and cross-tab sign-out.
It also covers delayed results, failed-results retry, and pending anonymous-plan
replacement while another student signs in.
Replacement and ordinary edits share a write queue; the save-status notice also
settles correctly when a replacement was queued after an edit. Account-switch
regressions keep the original tab open while another tab signs out and in.

Account/file checks use an explicitly synthetic published lesson and separate
homework records for the two fake students; no real course is published. They
cover account-settings drafts/photo selection clearing on a cross-tab account
switch, old homework disappearing immediately, delayed private blobs being
discarded after a switch, and route changes suppressing a late browser download.
The photo picker and privacy page disclose that avatar images are public by URL.

Additional unit regressions cover foreign/ambiguous homework paths, signed-out
and wrong-owner downloads, account changes between upload and submission RPC,
pending avatar/user lookups, late auth startup sessions, an old support queue
stopping after unmount, and cancelled intake completions. Support sends explicitly
check the queue owner and pin its bearer token; they cannot silently become a
message from the next account. Sign-out events also clear device support queues.

Private learning screens and account settings are keyed by account (learning
detail screens also by route). Request-scope guards suppress late UI callbacks;
they do not revoke an already-issued JWT or cancel a server request already in
flight. An upload interrupted after Storage accepts it can leave an unlinked
object; the next account does not get a submission for it. Account-deletion file
cleanup already lists the owner's entire homework/avatar folder, not only rows.

The repository review checked owner RLS predicates for profiles, saved plans,
learning records/files, and support; homework Storage owner/path checks; the
invoker homework RPC; and explicit privileged-function grants/admin verification.
No new SQL policy or server-function change was made in this step. These are
checks of local definitions, not a refreshed cloud-policy inventory or live RLS
execution. The older rollback SQL harness assumes draft writes were permitted
and must not be used as launch proof under the new published-course guards.

Before hosted launch, use designated staging accounts to verify direct API
requests with student A, student B, anonymous, expired/deleted-user, non-admin,
and revoked-admin tokens. Test cross-owner SELECT/INSERT/UPDATE/DELETE, attempted
owner reassignment, homework RPC access, and Storage list/download/upload/update/
delete. Check both UPDATE USING and WITH CHECK. Homework must remain private;
avatar reads intentionally differ. Reconcile the cloud migration ledger and
deployed policies first. Do not run the live stress/security harness against
production merely because this local suite passed.

### Remaining local auth blocker

Inspection of the installed `@supabase/auth-js` `GoTrueClient._updateUser`
revealed an additional race beyond the new pre-update guards. It captures a
session, sends the user update, then saves that captured session and broadcasts
`USER_UPDATED`. If another tab signs out/in while the update itself is in flight,
the late SDK completion can restore the older session. Profile/password updates
and consent writes need coordinated or isolated auth-session mutation, including
a real-browser regression with a held Auth PUT response and an account switch.
The current passing tests do not cover or resolve that SDK-level race. This is
the next local fix and remains a launch blocker; do not label account isolation
fully solved because the homework/support safeguards passed.

During step 2 the browser tests reproduced a stale private restore that could
render a signed-out student's plan after a delayed response. Account changes now
invalidate pending restores before they can carry or publish private data.
Delayed results and pending plan replacements also check their original account
and request lifetime before updating the screen. Results-load errors now offer
retry instead of leaving an unhandled rejection and an apparent empty plan.
Removal failures now identify the failed remove action, rather than saying the
university could not be saved. Both have browser regression coverage.

## Step 2 checkpoint — 12 October 2026

- Full browser suite: 96 passed; the two strengthened cross-tab late-write cases
  were additionally rerun at all three viewports (6 passed).
- App: 586 tests, lint, production build, and SSR smoke passed after the last
  application edit. Admin: 13 tests passed. Whitespace checks passed.
- All changes remain local and uncommitted. No deployment, live account changes,
  live database writes, or new database creation occurred during this step.

## Step 3 checkpoint — 12 October 2026

- Final expanded browser suite: 108 passed at 375, 768, and 1440 pixels.
- App: 63 files / 613 tests passed; lint, production build, SSR smoke, and
  whitespace checks passed. Main application JS is 111.16 kB / 36.53 kB gzip.
- Account/file/support lifecycle safeguards and public-avatar disclosure are
  local, uncommitted changes. No deployment, real account/file operations, new
  database creation, or live database changes occurred during this step.
- The in-flight Auth user-update/session replay race above remains unresolved.
  Treat this as a partial security checkpoint, not completed launch approval.

These checks are not proof of live email delivery, Google sign-in, database
saves, account isolation, file uploads/deletion, reviewed catalogue accuracy,
or Vercel routing. Those still require designated staging accounts and a hosted
build. Keep local fixes separate from claims about production readiness.
