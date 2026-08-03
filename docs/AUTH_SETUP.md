# 4Prep authentication setup

The client supports email/password and Google sign-in. Password reset, email
confirmation, resend, OAuth return, anonymous-intake carry-over, and account
deletion are implemented in `app/`.

## Environment separation

Routine local development and launch QA must use either local Supabase or a
separate cloud QA project. The known production project is
`pubhgajlqhdbpwqahtki`; do not put its URL in a routine local `.env`.

Copy `app/.env.example` to the untracked `app/.env`, then set the URL and anon
key for the intended local/QA project. Development builds show a persistent
database-target banner. If a development build is pointed at the known
production ref, account deletion is blocked unless
`VITE_ALLOW_PRODUCTION_DESTRUCTIVE_OPERATIONS=true` is set explicitly. Keep
that override false for normal work.

Jeff has not yet provided a QA project ref, URL, or keys. Do not invent them.
Provisioning instructions and the required two-account test are in
`docs/QA_ENVIRONMENT.md`.

## Supabase URL configuration

Set **Authentication → URL Configuration → Site URL** to:

```text
https://app.4prep.ai
```

Add these **Redirect URLs**:

```text
http://127.0.0.1:5173/auth/callback
http://127.0.0.1:5173/reset-password
https://app.4prep.ai/auth/callback
https://app.4prep.ai/reset-password
```

The same local and production URLs are listed in `app/supabase/config.toml`.
Add the corresponding QA app URLs only after Jeff provisions the QA frontend
origin; the value is currently unknown.

## Google Cloud and Supabase

Create a Google OAuth 2.0 **Web application** client. Its exact authorized
redirect URIs are the Supabase Auth callbacks, not the 4Prep page routes:

```text
http://127.0.0.1:54321/auth/v1/callback
https://pubhgajlqhdbpwqahtki.supabase.co/auth/v1/callback
```

The second URI above is Production. A separate QA project has a different
callback URI; add the exact URI shown by that project's Supabase dashboard once
the project exists.

Use these authorized JavaScript origins for the local and production clients:

```text
http://127.0.0.1:5173
https://app.4prep.ai
```

Paste the Google client ID and client secret into **Supabase → Authentication →
Providers → Google**, then enable the provider. Never place the client secret in
the Vite environment or any client file.

Publish the Google OAuth consent screen to **Production**. Do not launch while
the consent screen remains in Testing.

## Consent and account linking

4Prep records explicit privacy consent before starting Google OAuth. A
tab-scoped pending-auth record preserves that consent, the safe internal return
destination, and any anonymous intake across the redirect. It is removed after
the signed-in profile is saved.

Supabase automatically links identities that return the same verified email to
one auth user. The signed-in Account screen also lets a Google user add an email
password to that existing user instead of creating a second account. Keep
Supabase's automatic identity linking enabled; do not implement a separate
client-side user merge.

## Email delivery

Configure production SMTP before launch. Supabase's default email sender is
rate-limited and is not suitable for password reset, confirmation, or resend in
a public product.

## Account deletion

Deploy `app/supabase/functions/delete-account`. The function requires JWT
verification, authenticates the caller again from the bearer token, and uses
`SUPABASE_SERVICE_ROLE_KEY` only inside the Edge Function. It removes objects
under the caller's private `learning-submissions/{user_id}` prefix, deletes the
auth user, and verifies that profile, saved-plan, learning-progress,
submission, submission-file, and Storage-object records are gone.

Do not exercise deletion from local development against Production. Prove it
first in QA with a disposable account containing a profile, saved plan,
progress row, submission metadata, and uploaded object. The production
deployment version has not been compared with the current working tree.
