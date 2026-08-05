# 4Prep admin foundation

Last updated: 3 August 2026 (Asia/Tashkent).

## Current status

Prompt 12.1 is implemented in source. Migration `202608030012_admin_foundation.sql` is written and locally validated but **not applied** to QA or Production. The `admin-api` Edge Function is written but **not deployed**. The separate `admin/` Vite app therefore cannot complete a live privileged request yet.

Local validation used a disposable PostgreSQL 14 instance: migration `012` was applied, `app/supabase/tests/admin_foundation_rollback.sql` ran with exact output `BEGIN`, `DO`, `ROLLBACK`, and all three admin-table counts were zero after rollback. The disposable server was then stopped. This proves local SQL behavior only, not remote application.

Do not describe the admin console as live until Jeff deliberately applies the migration, grants an existing Auth user, configures the Edge Function secrets/origin, deploys the function, and records the live checks in the final section of this document.

## Authorization chain

```text
Admin browser
  -> normal Supabase Auth session
  -> POST /functions/v1/admin-api with user JWT
  -> resolve JWT with the anon Auth client
  -> caller rate limit: resolved user UUID or salted IP bucket (30/minute, 1,000/hour)
  -> active admin_users grant lookup
  -> required audit event
  -> service-role read of the requested private records
  -> bounded response with no service-role credential
```

The browser has only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. It calls Auth and the `admin-api` function; `admin/src` contains no direct student-table, Storage, or RPC query.

`SUPABASE_SERVICE_ROLE_KEY` exists only in the Edge Function environment. Before an active admin grant is proved, that client is limited to the control-plane operations which must also cover rejected callers: the rate-limit ledger, denied-request audit, and the `admin_users` lookup itself. No profile, plan, progress, submission, Auth roster, or Storage object is read before authorization succeeds.

Missing authorization, an expired token, a valid non-admin, and a revoked admin all receive the same HTTP 403 body: `{"error":"Not available."}`. Internally they receive non-secret denial reason codes. An exhausted rate bucket also fails before the grant lookup with that same generic 403, so rate-limit state cannot become an admin-discovery oracle. The caller is never told whether an Auth user or historical admin grant exists. `supabase/config.toml` deliberately lets `admin-api` perform this check itself so these paths are uniform and auditable.

Revocation is evaluated on every request. A row with `revoked_at is not null` is inactive immediately for the next request; there is no browser role cache. The admin app also re-checks the grant every 10 seconds while visible, immediately after the first session response, and whenever the window regains focus. It hides cached private UI while the tab is not visible and until a focus check succeeds. One continuously visible tab uses at most about 360 heartbeat requests of the 1,000-request hourly allowance; two tabs remain below the cap and still leave headroom for operator work.

## Privileged API

One deliberately “fat” Edge Function keeps the authorization helper unavoidable and provides five typed actions:

| Action | Private operation | Audit action |
|---|---|---|
| `access` | Lightweight current-grant recheck; no student data | None; the rate ledger records the request |
| `session` | Auth totals and the small active/work metrics set | `cohort.metrics.read` |
| `cohort` | Searchable pilot roster, stage, goal, last recorded activity, waiting homework | `cohort.roster.read` |
| `student` | One student plus submission, assignment brief, rubric, and file metadata | `student.detail.read` |
| `file_url` | Exact file-row lookup and a signed private Storage URL | `homework.file.lookup`, then `homework.file.open` |

Every private read writes an `allowed` audit row before the data query. If the query then fails, a second `failed` event is appended. Audit failure itself fails closed. A file URL is not minted unless the required audit insert succeeds.

For a homework file, the operator's **Open secure file** action creates the destination tab first, calls `file_url`, writes `homework.file.lookup` and `homework.file.open`, and only then navigates that tab to the minted URL. The URL is not retained in React state. The `homework.file.open` event therefore means an authorized operator open action and signed-URL issuance. The downstream Storage HTTP GET is not separately observable by `admin-api`; a browser/network failure after issuance can still prevent the bytes from being displayed.

Homework URLs expire after **60 seconds**. This is long enough for an operator to request and open a file on a normal laptop connection while keeping a copied URL short-lived. The admin UI never retains the URL in component state and clears its “opened” status when the TTL elapses. Before signing, the function requires a canonical recorded Storage path whose first segment equals the submission owner's UUID; controls, traversal segments, backslashes, percent encoding, query delimiters, and fragments fail closed. New student uploads remove those reserved delimiters from stored object filenames, and the signed-download filename is separately sanitized. The bucket remains private and its student owner-only policies are unchanged. Supabase documents that `createSignedUrl(path, 60)` creates a URL valid for one minute: <https://supabase.com/docs/reference/javascript/file-buckets-createsignedurl>.

## Tables and retention

Migration `012` creates three service-role-only, RLS-enabled tables with no anon or authenticated policies:

- `admin_users`: immutable grant history. Revocation updates one active row; re-granting creates a new row.
- `admin_audit_log`: append-only history for denied authorization, private reads, and privileged actions. It rejects secret-shaped metadata keys and stores no headers, JWTs, raw IP addresses, profile bodies, homework contents, or file bytes.
- `admin_api_requests`: salted caller buckets and rate-limit decisions only. `prune_admin_api_requests()` removes rows older than seven days.

Audit history has no automatic deletion in 12.1. That is intentional: it is the record used to answer who accessed a minor's private work. A retention/legal review is required before introducing audit deletion. The seven-day limiter ledger is operational data, not the access ledger.

## Active-user definitions

The definitions are returned by the server and displayed next to every number:

- **Signed up:** student Auth users currently present in the project. Any Auth identity with admin grant history is excluded so operator accounts do not inflate the cohort.
- **Signed in in 30 days:** those student Auth users whose `last_sign_in_at` falls in the trailing 30 days.
- **Acted in 30 days:** users with a profile save/update, saved plan, completed lesson, or homework submission recorded in the trailing 30 days. Page views are not counted.
- **Homework waiting:** submitted homework with no feedback reference and a `pending` or `submitted` status.

“Last recorded activity” uses the same saved product events. It does not pretend that a page view or a still-open browser tab is activity.

## Shared stage model

`shared/dashboard-stage.ts` is the one derivation used by the student dashboard and the privileged cohort response. It accepts only primitive recorded signals—a completed-intake boolean plus saved-plan, completed-lesson, submitted-homework, and feedback counts—and returns the same serializable ID, label, and description to both views.

The furthest recorded signal wins: `feedback_received`, `homework_submitted`, `learning`, `planning`, then `not_started`. It never grades work, predicts an admission outcome, or invents progress. Feedback is already represented in the model for Prompt 12.3, but 12.1 creates no feedback.

## Grant and revoke access

There is no signup, invite, role-management UI, or self-service grant path. Jeff runs reviewed SQL against the exact intended project after confirming the Auth user's UUID.

Bootstrap an existing Auth user:

```sql
insert into public.admin_users (
  user_id,
  granted_by,
  grant_reason
)
values (
  '<EXISTING_AUTH_USER_UUID>'::uuid,
  null,
  'initial_bootstrap'
)
returning id, user_id, granted_at, revoked_at;
```

Revoke access while preserving history:

```sql
update public.admin_users
set revoked_at = now(),
    revoked_by = null,
    revocation_reason = 'operator_access_removed'
where user_id = '<EXISTING_AUTH_USER_UUID>'::uuid
  and revoked_at is null
returning id, user_id, granted_at, revoked_at;
```

Use the acting admin's UUID for `granted_by`/`revoked_by` when one exists. `null` is reserved for a trusted bootstrap or direct database-administrator action. Never delete an old grant to revoke it.

## Jeff's ordered QA apply and deploy handoff

Run from `app/` only after confirming the linked ref is QA `forrvcsttklmpmfhxums`:

1. `supabase migration list --linked`
2. `supabase db push --linked --dry-run`
3. Confirm the dry run lists `202608030012` only. If it lists an unexpected migration, stop.
4. Jeff applies the reviewed migration with `supabase db push --linked`.
5. Create a dedicated admin Auth account through the normal trusted Auth process, then grant its exact UUID with the SQL above. Do not promote either disposable student QA account.
6. Set `ADMIN_IP_SALT` to a random server-side secret and `ADMIN_ALLOWED_ORIGINS` to the exact deployed admin origin. Keep the existing Supabase URL, anon key, and service-role key in Edge Function secrets—not in `admin/.env`.
7. Deploy `admin-api` from the checked-in source and `config.toml`.
8. Deploy `admin/` separately with only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
9. Schedule `select public.prune_admin_api_requests();` once daily from a trusted scheduler and verify only rate-ledger rows older than seven days are removed. Do not prune `admin_audit_log`.

The Supabase CLI supports `db push --dry-run` to list pending migrations without applying them: <https://supabase.com/docs/reference/cli/supabase-db-push>. Function deployment and per-function `config.toml` settings are documented at <https://supabase.com/docs/guides/functions/deploy>.

Production remains a separate authorization after QA evidence. Production currently needs migrations `010`, `011`, and `012` reviewed in order; do not infer that QA application authorizes Production.

## Client-bundle secret evidence

Both client builds were run with a fake server-only canary set as `SUPABASE_SERVICE_ROLE_KEY`, then scanned for the canary and privileged markers. The actual service-role key is neither known nor stored in this repository, so it could not and should not be printed for comparison.

```text
SUPABASE_SERVICE_ROLE_KEY=4PREP_SERVICE_ROLE_CANARY_20260803 npm run build
rg -n '4PREP_SERVICE_ROLE_CANARY_20260803|service_role|SUPABASE_SERVICE_ROLE_KEY|VITE_[A-Z0-9_]*(SECRET|SERVICE_ROLE)' dist
```

Exact scan output after both builds:

```text
app/dist { canary: 0, serviceRole: 0, serviceRoleEnv: 0, viteSecret: 0 }
admin/dist { canary: 0, serviceRole: 0, serviceRoleEnv: 0, viteSecret: 0 }
admin/src direct student-data query scan: 0 matches
```

## Required live evidence after deployment

- Active admin: `access`, `session`, `cohort`, `student`, and `file_url` succeed.
- Non-admin: every action returns the same 403 and the UI shows only “Not available.”
- Revoked admin: an already-open admin browser loses access on its next request.
- Denied, roster, student, and file-link requests each appear in `admin_audit_log` with no secret metadata.
- A file link works before 60 seconds and fails after expiry.
- `admin_users`, `admin_audit_log`, and `admin_api_requests` remain unreadable to anon/authenticated browser clients.
- Student A and B dashboards show the same stage returned in the roster for those exact users.
- The service-role marker/credential scan remains empty in both built client bundles.

These live checks are still pending because Prompt 12.1 forbids Codex from applying migrations or deploying functions.
