# 4Prep public MVP

4Prep is a mobile-first university-pathway product for Central Asian students. This directory contains the public MVP: ten verified universities, deterministic Φ v0.1 fit scoring, email authentication, private saved plans/profiles, and a grounded counselor boundary.

## Product data contract

`src/types/index.ts` is the application contract. A displayable university figure is always a `DataPoint<T>`:

- `known`: a value and a real `sourceId`
- `unknown`: a reason and suggested action

Known numeric values may also carry `numericValue`, `currency`, and `period`. This preserves the original known/unknown union while allowing Φ to calculate without parsing display strings. UI facts render through `DataValue`, which resolves to `SourceChip` or `MissingValue`.

Never add a fallback number, estimate, or unsourced university fact.

## Local setup

Requirements: Node 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Set these browser-safe variables in `.env`:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Do not place `PPLX_API_KEY` in `.env` for Vite. It belongs only in Supabase Edge Function secrets.

## Verification

```bash
npm run build
npm run test
npx vite build --ssr scripts/smoke.tsx --outDir .smoke-out
node .smoke-out/smoke.js
```

## Database

Apply the files in `supabase/migrations/` in filename order. `supabase/seed.sql` is deliberately empty because the real catalogue is versioned in the migration chain.

The current live schema, RLS policies, row counts, and launch blockers are recorded in [`../docs/DATABASE_STATE.md`](../docs/DATABASE_STATE.md).

## Φ v0.1

`src/scoring/phi.ts` is pure, deterministic, and versioned. It returns academic, financial, language, career, and geographic components plus overall fit. Each component is bounded to 0–100 and has a plain-language reason.

Φ:

- never calls AI;
- never converts currencies;
- annualizes only typed, cited amount metadata;
- applies only a published numeric percentage scholarship;
- gives unknown/incomparable inputs a neutral score with an explicit reason.

The weights live in one exported `PHI_WEIGHTS` constant. The `TODO(EPIF)` marker is retained for later paper-equation calibration.

## Grounded counselor

The client invokes the Supabase `counselor` Edge Function. Its source is in `supabase/functions/counselor/index.ts`.

The function retrieves relevant catalogue records before calling Perplexity. University figures may come only from supplied records. General guidance is separately labeled and shows web citations. A validator scans for currency amounts, dates, and IELTS-style figures; an untraceable figure produces an honest refusal and writes a `counselor_strikes` audit record.

Set these only as Edge Function secrets:

```text
PPLX_API_KEY=...
PPLX_MODEL=sonar
```

## Vercel

Use `app/` as the Vercel root directory. `vercel.json` supplies the Vite build and SPA deep-link rewrites.

Set:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Then attach `app.4prep.ai`. Also configure the production origin in Supabase Auth Site URL and Redirect URLs.
