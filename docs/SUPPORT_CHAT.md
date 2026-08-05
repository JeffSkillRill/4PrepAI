# 4Prep support chat

Last updated: 5 August 2026 (Asia/Tashkent).

This is a private, human platform-feedback channel: a student can report that 4Prep is broken or confusing and an authorised operator can reply. It is not an admissions-advice channel, does not generate automatic replies, and has no attachments, read receipts, typing indicators, or external notifications.

## Current deployment state

The source is implemented in the canonical repository. Migration `202608050013_support_chat.sql` was applied to QA by the owner on 5 August and confirmed immediately afterward by a read-only linked migration list showing matching local and remote versions. The updated functions were then deployed and confirmed active by a read-only function list: `admin-api` version 2 with `verify_jwt=false` (the function performs its own admin JWT boundary) and `delete-account` version 1 with `verify_jwt=true`. After the live QA isolation, audit, offline, rate-limit, deletion, and 375 px checks passed, Production migrations `202608030010` through `202608050013` were applied by the owner. A read-only linked list confirmed all local and remote versions match. Production then received the required admin secrets and active `admin-api` version 1 plus `delete-account` version 6 with source hashes matching QA. The ignored local browser environments now target Production while the CLI link was returned to QA as a safety guard. Production live browser proof remains pending. Deployment presence alone is not live RLS or deletion evidence.

A read-only linked migration check on 5 August initially found that QA contained remote versions `202608040013`, `202608040014`, and `202608040015` without corresponding local files. Their complete statement bundles were exported from `supabase_migrations.schema_migrations` and restored under their recorded names. Normalized SHA-256 comparisons between the export and all three files matched exactly. A subsequent linked dry run listed only `202608050013_support_chat.sql`; after the owner applied it, a second linked list confirmed that QA matched through that version. Production was not changed.

Local evidence from 5 August:

- The exact migration applied successfully to a disposable PostgreSQL instance. `support_chat_rollback.sql` completed its two-user owner/isolation, idempotency, rate-limit, service-access, and deletion checks with final output `ROLLBACK`; the disposable server was then stopped and removed.
- Student app: zero-warning lint, 23 files/249 tests, build, and SSR smoke (5,526 rendered characters) passed.
- Admin app: zero-warning lint, 3 files/13 tests, build, and SSR smoke (1,975 rendered characters) passed.
- The support route is lazy: 10.90 kB minified / 4.10 kB gzip. At the browser's 375 px override, the measured document width was 360 px, scroll width was 360 px, the 328 px support region and 294 px textarea fit without horizontal overflow, and keyboard focus produced a visible 3 px outline. A real Android software-keyboard check remains pending.
- An offline jsdom test queued a message without calling the send RPC. Live DevTools offline/reconnect proof remains pending until migration `013` exists in QA.
- Both browser apps were rebuilt with `SUPABASE_SERVICE_ROLE_KEY=4PREP_SERVICE_ROLE_CANARY_20260805`; `rg -n '4PREP_SERVICE_ROLE_CANARY_20260805|SUPABASE_SERVICE_ROLE_KEY|VITE_[A-Z0-9_]*(SECRET|SERVICE_ROLE)' app/dist admin/dist` returned no matches (exit 1).

## Realtime decision

The student and admin views poll every 15 seconds while visible instead of using Supabase Realtime. A dropped websocket can look connected while silently missing replies; bounded polling gives this pilot a simple, observable retry path, keeps existing messages usable after a failed refresh, and never labels a message sent until the database RPC confirms it.

## Data model and access

- `support_threads`: exactly one thread per Auth student (`user_id` is unique and cascades on account deletion).
- `support_messages`: message rows containing a client/server UUID, thread ID, sender role, sender Auth UUID, body, and database timestamp.
- Students receive `SELECT` only through owner-scoped RLS. A student cannot insert directly into either table or enumerate another student's thread.
- `send_support_message(uuid,text)` derives the owner from `auth.uid()`, creates the student's thread atomically, and inserts the message. A client-generated UUID makes retry after a dropped response idempotent.
- Admin access stays in `admin-api`. Its existing chain is valid JWT, resolved Auth user, active `admin_users` grant, service-role query. The service-role key is never sent to either browser.
- Inbox reads write `support.inbox.read`; thread reads write `support.thread.read`; reply-context reads and reply intent are also audited. If the audit insert fails, the private read/reply fails closed.

## Scope guardrail

The student entry point says this is for something broken or confusing, says it is not live chat, and links admissions questions to the grounded counselor. The operator inbox repeats that boundary and warns against unsourced university figures. There is intentionally no automated scope classifier: a human is responsible for routing the question, not a chatbot.

## Offline and rate-limit behavior

An unsent student message is stored in `sessionStorage` before the first network attempt. It survives same-tab refresh and navigation, is visibly labelled queued, and is removed only after the RPC confirms `sent`; a retry with the same UUID cannot duplicate it. The offline notice says the message has not been sent and that the tab must remain open until confirmation.

The database allows five student messages per rolling minute and fifty per rolling 24 hours. A limited call returns `rate_limited` with a retry delay instead of discarding the text; the UI keeps the message queued and uses a non-punitive “please wait” explanation.

## Retention and deletion

Support threads are retained for 12 months after their latest message, then `prune_expired_support_threads()` deletes the thread and cascades its messages. The admin inbox runs this prune opportunistically; before Production, schedule the function daily from a trusted Supabase scheduler so retention does not depend on an operator opening the inbox.

Account deletion is immediate, not 12 months: `support_threads.user_id` uses `ON DELETE CASCADE`, and the updated `delete-account` function explicitly checks the deleted user's former thread IDs for remaining thread/message rows. Chat supports no attachments, so there are no chat Storage objects to remove; homework Storage cleanup remains unchanged.

## QA apply and proof order

Use only the non-production project first and confirm the project ref before every command.

1. Confirm `npx supabase migration list --linked` still shows matching local/remote versions through `202608040015`.
2. Review `202608050013_support_chat.sql` and run `npx supabase db push --linked --dry-run`; it must list only `202608050013`.
3. Migration `202608050013` is already applied to QA; do not reapply or repair it.
4. The updated `admin-api` and `delete-account` functions are already confirmed active in QA; do not add any browser secret.
5. Build/deploy or run both QA browser apps against the QA Supabase URL and anon key.
6. Run `app/supabase/tests/support_chat_rollback.sql` only in a disposable transaction-capable QA/local environment.
7. With disposable students A and B, send one message each. Verify A can select only A's thread/messages, B can select only B's, and direct table inserts as `authenticated` fail.
8. Open A's thread as the admin and confirm `admin_audit_log` has the specific thread read. Reply and confirm A sees the database-timestamped reply after polling.
9. In DevTools, set Network to Offline, queue a message, refresh the same tab, and confirm it remains visibly queued and not sent. Restore network and confirm it changes to sent only after the RPC response.
10. Send six quick messages. Confirm the sixth stays queued with a retry delay and is not lost.
11. At 375 px, verify no horizontal overflow, the thread scrolls, the composer remains reachable with the software keyboard, focus is visible, and new messages are announced.
12. Delete one disposable account through the product. Verify Auth removal, zero matching support threads/messages, and zero chat Storage objects (the expected count is always zero because attachments are unsupported).
13. Schedule and observe the daily retention prune before any Production promotion.

## Production promotion gate

Do not copy the QA database or QA users into Production. Promote reviewed source in order: Production backup/PITR check, migration `013`, updated `admin-api`, updated `delete-account`, student app, admin app, then the same two-user isolation/audit/offline/deletion checks against disposable Production accounts. Stop and roll back the application deployment if the schema or functions are not confirmed live; never point a new browser bundle at an older database contract.
