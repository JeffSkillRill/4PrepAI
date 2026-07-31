# 4Prep authentication setup

The client supports email/password and Google sign-in. Password reset, email
confirmation, resend, OAuth return, anonymous-intake carry-over, and account
deletion are implemented in `app/`.

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

## Google Cloud and Supabase

Create a Google OAuth 2.0 **Web application** client. Its exact authorized
redirect URIs are the Supabase Auth callbacks, not the 4Prep page routes:

```text
http://127.0.0.1:54321/auth/v1/callback
https://pubhgajlqhdbpwqahtki.supabase.co/auth/v1/callback
```

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
`SUPABASE_SERVICE_ROLE_KEY` only inside the Edge Function. After deleting the
auth user, it verifies that `student_profiles` and `saved_plans` contain zero
rows for that user. Both foreign keys already use `ON DELETE CASCADE`; no schema
migration is required.
