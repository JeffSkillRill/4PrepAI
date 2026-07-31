# Codex Prompt — Complete the login / sign-up experience

Copy everything below the line into Codex.

---

## ⚠ Working directory — do not get this wrong

Work **only** in the existing repository, in place. A previous session ran in a separate copy and created two divergent versions that had to be merged manually. Do not repeat that.

```
<repo root>/
├─ app/
│  ├─ package.json          ← the only package.json
│  ├─ src/
│  │  ├─ auth/AuthProvider.tsx
│  │  └─ screens/AuthPrivacyScreens.tsx
│  └─ supabase/             ← migrations + functions live INSIDE app/
└─ docs/DATABASE_STATE.md   ← at the REPO ROOT, not inside app/
```

Do not scaffold a new project, create a parallel `app/`, add a second `package.json`, or create `app/docs/`. If a file you expect is missing, you are in the wrong directory — stop and report. Add new **forward-only** migrations; never edit an applied one.

## Context

4Prep is a university-pathway platform for Central Asian students applying to US universities. Auth is Supabase Auth (email + password), already wired in `src/auth/AuthProvider.tsx` and `src/screens/AuthPrivacyScreens.tsx`.

**What already works — keep it:** sign in, sign up, a sign-up consent checkbox covering stored student data, a "check your email to confirm" state, error display, sign out, and RLS restricting `student_profiles` and `saved_plans` to their owner.

**Users are on phones, often on poor connections, sometimes on shared devices, and English may be their second or third language.** Copy must be plain and short. Never show a raw provider error.

**Dependency to be aware of:** production SMTP is not yet configured (Supabase's default email is rate-limited). Everything email-dependent below must be *built* now and will start working once SMTP is set up. Note this clearly in your summary.

---

## Task 1 — Password reset (highest priority)

There is **no password reset at all**. A user who forgets their password is permanently locked out of their profile and saved plans. This is the single biggest gap.

Build the full flow:
- A "Forgot your password?" link on the sign-in form.
- A request screen: enter email → send the Supabase reset email. **Always show the same confirmation message whether or not the account exists** — do not reveal which emails are registered.
- A reset-completion screen that handles the recovery link the user clicks from their email (Supabase returns a recovery session), lets them set a new password, and confirms success.
- Add `resetPassword` and `updatePassword` to `AuthProvider`.
- Route these properly (e.g. `/reset-password`) so the emailed link lands correctly.

## Task 2 — Account deletion

`PrivacyScreen` currently states that a self-service deletion flow "must be added before accepting production accounts." That is a launch blocker for a public product handling minors' academic and financial data.

- Add an account-deletion option in the signed-in view.
- Require explicit confirmation (type the email, or a clear two-step confirm) — this is irreversible.
- Deletion must remove the auth user **and** their `student_profiles` and `saved_plans` rows. Deleting an auth user requires the service role, so implement this as a **Supabase Edge Function** invoked by the signed-in user; never expose the service-role key client-side.
- Verify the cascade actually leaves no orphaned rows, and prove it in your summary.
- Update the Privacy Policy text to describe the real, now-existing process, and remove the "must be added" caveat.

## Task 3 — Email confirmation: resend and landing

Currently, if the confirmation email never arrives, the user is stuck with no recovery path.

- Add a "Resend confirmation email" action on the confirmation screen, rate-limited client-side (e.g. a 60-second cooldown) so it cannot be spammed.
- Handle the confirmation link landing: when a user returns via the emailed link, show a clear "your email is confirmed — you can sign in" state rather than dropping them on a generic screen.
- Let the user correct a mistyped email without losing their place (a "wrong email? go back" affordance).

## Task 4 — Preserve the user's place and their work

Two problems:

**a) Redirect is hardcoded.** `AuthPrivacyScreens.tsx:46` always calls `onNavigate('saved')` after auth. A user who was reading a university profile and hit "Sign in" is dumped somewhere unrelated. Capture the intended destination and return the user there after login.

**b) Anonymous work is lost.** A visitor can complete the intake and get a pathway without an account. If they then sign up, their entered profile should be **carried into their new account**, not discarded. Losing it is a serious conversion problem — they did the work, then it vanished. Persist the in-progress profile client-side (in memory/state as the app already does) and write it to `student_profiles` immediately after successful sign-up.

## Task 5 — Friendly, safe error messages

`AuthPrivacyScreens.tsx:48` renders `reason.message` — the raw Supabase error. Map provider errors to short, human messages, and never leak internals:

- Wrong email/password → one neutral message ("Email or password is incorrect."). Do **not** distinguish "no such user" from "wrong password" — that leaks which emails are registered.
- Unconfirmed email → say so, and offer the resend action.
- Rate-limited → say to wait and try again shortly.
- Network/offline → say the connection failed, and that nothing was lost.
- Anything unmapped → a generic apology plus a retry, with the real error logged to the console in dev only.

## Task 6 — Password and form usability

- Show/hide password toggle (essential on mobile keyboards).
- Communicate the password requirement **before** submission, not as a post-hoc error. Currently only `minLength={8}` exists silently.
- Keep `autoComplete` attributes correct (they are currently right — do not regress them).
- Disable the submit button while in flight (already done) and make sure the loading state is announced to screen readers.
- Ensure the whole flow is keyboard-navigable with visible focus, and that errors use `role="alert"` (already partly done).
- On a shared device, make sign-out obvious and complete.

## Task 7 — Google sign-in (add alongside email/password, do not replace it)

Most Central Asian students already have a Google account, and Google sign-in **needs no email delivery at all** — so it works even before production SMTP is configured. It should become the primary, most prominent path.

- Enable the **Google provider** through Supabase Auth (`signInWithOAuth({ provider: 'google' })`). Do not hand-roll OAuth.
- Put a **"Continue with Google"** button at the top of the auth card, above the email/password form, with a clear "or" divider. Use Google's official mark and follow their branding rules (correct logo, no recolouring, adequate padding).
- **Keep email/password fully working.** Some students will not have or want a Google account. Google is an addition, not a replacement.
- **Account linking — handle this explicitly.** If someone signs up with email/password and later clicks "Continue with Google" using the same address (or the reverse), they must end up in **one account**, not two. Decide and document the behaviour, and make sure a user can never silently strand their saved plans in a duplicate account. If Supabase's automatic linking is relied upon, verify it actually behaves that way rather than assuming.
- **Consent still applies.** The sign-up consent checkbox exists for a legal reason. A first-time Google user must still explicitly consent to 4Prep storing their profile data before an account is created — capture it on the auth screen before redirecting, or on first return.
- **Handle the OAuth return properly:** the redirect back, the loading state while the session resolves, a user cancelling at Google's screen, and the anonymous-intake carry-over from Task 4 must all still work.
- Redirect URIs must be correct for local development *and* production (`app.4prep.ai`), and configured in both Google Cloud Console and Supabase.

## Constraints

- **Do not** add magic links, phone auth, or providers other than Google — Google plus email/password only.
- **Do not** weaken RLS or expose the service-role key to the client.
- **Do not** change the grounding, Φ scoring, or catalogue behaviour.
- Keep the existing visual language (`forest` palette, `card`, `States.tsx` patterns). This is functionality, not a redesign.
- TypeScript stays strict with zero errors.

## Verification

- `npm run build` — zero TypeScript errors. `npx vitest run` — all tests green.
- Add tests for: the error-message mapping, and the anonymous-profile-to-account carry-over.
- Manually verify end-to-end and report results: sign up → confirm → sign in → forgot password → reset → sign in with the new password → delete account.
- Verify the Google path end-to-end: Continue with Google → consent → account created → anonymous intake carried over → sign out → sign back in with Google → same account and same saved plans.
- Verify account linking: create an account with email/password, then sign in with Google using that same address. Confirm the result is **one** account with the saved plans intact, and report exactly what happened.
- Confirm after deletion that no `student_profiles` or `saved_plans` rows remain for that user.
- Confirm the reset flow reveals nothing about whether an email is registered.
- Check the whole flow at **375px** on a phone-sized viewport.

## Deliverable

Report what you built per task, the new Edge Function and any migrations, the routes added, and the test results including the manual end-to-end run. Document the account-linking behaviour you observed. Update `docs/DATABASE_STATE.md` if schema changed.

List anything blocked in **⚠ Needs Jeff**, including:
- Production SMTP — password reset, email confirmation and resend do not deliver until it is configured.
- **Google Cloud Console setup** Jeff must do himself: create the OAuth client, set the authorised redirect URIs for local dev and `app.4prep.ai`, and paste the client ID and secret into Supabase → Authentication → Providers → Google. Give him the **exact redirect URI** your implementation expects.
- **The OAuth consent screen must be published to Production, not left in Testing.** In Testing mode Google hard-caps the app at 100 users and expires each authorisation after 7 days — which would silently break sign-in for real students. Basic `email`/`profile` scopes do not require the lengthy verification review, but the app must still be moved out of Testing.
