# 4Prep QA environment

Last updated: 3 August 2026 (Asia/Tashkent).

This is the non-production environment Jeff must provision before account-based launch QA can be completed. No QA project exists in the verified repository state, so its project ref, URL, anon key, service-role key, database password, and frontend origin are all **unknown**.

## Jeff must provision

1. Create a separate Supabase cloud project clearly named as QA or staging. It must not reuse production project `pubhgajlqhdbpwqahtki`.
2. Record its project ref and URL in Jeff's password manager or deployment configuration, not in Git.
3. Configure Auth Site URL and redirect URLs for the QA frontend origin and local `http://127.0.0.1:5173` callback/reset routes.
4. Configure a test-capable SMTP sender and Google OAuth client for QA. Their secrets stay in Supabase/Google dashboards.
5. Set Edge Function secrets in the QA project only. Do not expose service-role or provider keys through `VITE_` variables.
6. Deploy the `counselor` and `delete-account` functions to QA after the migrations below are applied.
7. Provide two disposable, confirmed QA accounts with mailboxes Jeff controls. Do not create them in Production.

## Migration order

Apply the checked-in migrations to an empty QA project in this exact order:

1. `202607240001_initial_schema.sql`
2. `202607270002_public_mvp_schema.sql`
3. `202607270003_seed_verified_universities.sql`
4. `202607270004_record_migration_history.sql`
5. `202607280005_us_admissions_enums.sql`
6. `202607280006_us_catalogue.sql`
7. `202607290007_counselor_hardening.sql`
8. `202607310008_counselor_scope_outcome.sql`
9. `202607310009_learning_portal.sql`

Use a dry run first and confirm the target project ref before applying anything. Do not copy production data into QA.

`app/supabase/seed.sql` is intentionally empty. The verified ten-university catalogue is created by migrations `003` and `006`; the one-track, eleven-module Learning Portal curriculum is created by migration `009`. No synthetic admissions figure should be added for QA.

## Local app configuration

Copy `app/.env.example` to the untracked `app/.env` and set:

```text
VITE_SUPABASE_URL=<QA project URL supplied by Jeff>
VITE_SUPABASE_ANON_KEY=<QA anon key supplied by Jeff>
VITE_ALLOW_PRODUCTION_DESTRUCTIVE_OPERATIONS=false
```

The development banner must show the QA ref and must not say `PRODUCTION`. If it says Production, stop before signing up, saving data, asking the counselor, uploading, or deleting.

## Seed the two disposable accounts

Jeff must supply two confirmed accounts, called User A and User B in the test record. For each account, create only QA data through the real app flows:

- a distinct student profile;
- at least one distinct saved university;
- distinct lesson progress;
- a learning submission with an allowed file under 10 MiB;
- one uploaded object owned by that account.

Use visibly different values and filenames so accidental cross-user reads cannot be mistaken for the current user's data. Do not use real grades, budgets, identity documents, or student work.

## Required isolation checks

Run every check both through the UI and, where appropriate, with the signed-in user's anon client:

- User A can read and update A's profile, saved plans, progress, submissions, submission-file metadata, and Storage objects.
- User A cannot read, update, delete, download, or list User B's corresponding data or object paths.
- Repeat the same checks from User B against User A.
- Signed-out requests cannot read either user's private rows or Storage objects.
- Public catalogue and published curriculum remain readable signed out.
- A malicious client-supplied user ID cannot redirect a write or deletion to the other account.

Any cross-user read or mutation is a P0 and blocks launch.

## Required auth and deletion checks

- Email sign-up, confirmation, correct and incorrect sign-in, sign-out, resend, and password recovery round-trip.
- Account-enumeration-resistant error wording with known and unknown addresses.
- Google OAuth round-trip and malformed/cancelled callback failure.
- Anonymous intake carry-over into the newly confirmed account.
- Profile and saved plans persist across refresh, sign-out, and sign-in.
- File validation rejects empty, oversized, disallowed-MIME, and extension/MIME-mismatched uploads; accepted types upload successfully.
- Deleting User A removes A's auth user, profile, saved plans, progress, submissions, submission-file rows, and Storage objects while User B remains intact.
- User A cannot sign in after deletion. User B can still sign in and access B's unchanged data.

Record exact pass/fail evidence. Do not infer a pass from policy text or a rollback-only harness.

## Counselor checks in QA

- Re-run the complete launch-audit red-team table.
- Confirm general guidance with no matched university can contain ordinary dates and ranges without refusal.
- Confirm cross-field currency swaps, currency-to-percentage reuse, invented figures, and zero-citation verified facts are refused.
- Compare `counselor_strikes` before and after ordinary general guidance: it must not gain a row.
- Confirm an actual unsupported verified figure does create a strike.
- Test timeout/provider failure and 429 UI without consuming Production limits.

## Completion evidence

The QA environment is ready only when Jeff records:

- the QA project ref and frontend origin;
- applied migration versions through `202607310009`;
- deployed function versions;
- two-account isolation results;
- auth/email/OAuth results;
- deletion row and Storage cleanup results;
- counselor red-team results;
- confirmation that no test touched Production.
