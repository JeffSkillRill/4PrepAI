# 4Prep admin app

This directory is a separate Vite deployable for a trusted 4Prep operator. It authenticates through normal Supabase Auth and reads student data only through the privileged `admin-api` Edge Function.

```bash
npm install
cp .env.example .env
npm run dev
```

Only these browser-safe settings belong in `admin/.env`:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Never add `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_IP_SALT`, or another server secret to a `VITE_` variable. See [`../docs/ADMIN.md`](../docs/ADMIN.md) for authorization, migration, grant/revoke, deployment, audit, and verification instructions.
