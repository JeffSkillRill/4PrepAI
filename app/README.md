# 4Prep

React 19 + TypeScript + Vite + Tailwind CSS v4 prototype backed by Supabase.

## Local setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), then start and reset the local project:

   ```sh
   supabase start
   supabase db reset
   ```

   `db reset` applies `supabase/migrations/202607240001_initial_schema.sql` and then runs `supabase/seed.sql`.

3. Copy `.env.example` to `.env` and replace the anon key with the value printed by `supabase status`:

   ```sh
   cp .env.example .env
   ```

4. Start the app:

   ```sh
   npm run dev
   ```

The seed contains the six fictional composite universities that were present in the checked-in prototype. All are explicitly named `(sample)`, and every seed source is `unverified_sample`.

For a hosted project, link with the Supabase CLI, apply the migration, seed only if sample data is wanted, and place the hosted URL and anon key in `.env`. Never commit `.env`.

## Verification

```sh
npm run build
npm run test
npx vite build --ssr scripts/smoke.tsx --outDir .smoke-out
node .smoke-out/smoke.js
```

## EPIF Φ status

`src/scoring/phi.ts` exposes a stable, versioned interface. Its current internals are a documented monotonic placeholder because the academic-paper equations have not been supplied. Replace only the marked `TODO(EPIF)` internals when those equations are available.
