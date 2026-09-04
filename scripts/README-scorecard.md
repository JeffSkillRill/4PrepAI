# College Scorecard top-200 importer

This is a one-off local generator. It never connects to Supabase and never
applies a migration. Run it only from a normal internet-connected terminal.

## Review gates before running

1. Get a free key at [api.data.gov](https://api.data.gov/signup/), then export
   it without committing it:

   ```sh
   export SCORECARD_API_KEY='your-real-api.data.gov-key'
   ```

   `DEMO_KEY` is deliberately rejected.

2. Replace every `null` in `scorecard-ranking.config.json`'s
   `existingSchoolUnitids` with Jeff's **human-confirmed** College Scorecard
   UNITID for that existing catalogue slug. The importer refuses to run with a
   missing, duplicate, or non-eligible mapping. The database has no UNITID
   today, so matching a Scorecard record by name would be unsafe.

3. Replace the `null` `dataYear` with the Scorecard data-release year that Jeff
   has verified for the API result. It labels the source ID and copied-value
   strings. The default weights are selectivity 0.30, academics 0.25,
   completion 0.20, and earnings 0.25. `topN` cannot exceed 200 and territories
   are permanently disabled.

## Generate and review

From the repository root:

```sh
deno run --allow-env --allow-net --allow-read --allow-write scripts/import-scorecard.ts
```

The importer requests 100 records per page, walks every operating Scorecard
record, and filters locally to US states/DC, degree predominance 3 or 4, and an
admission rate or SAT average. It writes:

- `scripts/top200-ranked.csv` — the review list: score, source metrics, and
  known/unknown fact-and-requirement counts.
- `scripts/import-scorecard.log` — cohort and coverage summary.
- `app/supabase/migrations/YYYYMMDDNNNN_scorecard_top200_us_universities.sql`
  — additive SQL. `NNNN` is one higher than the largest existing migration
  sequence at run time.

The repository intentionally does not ship a fake review CSV or migration:
those outputs only exist after Scorecard data and all validation checks are
available. Review both generated files before applying the SQL.

## Ranking method (verbatim)

Eligibility (a school is rankable only if ALL hold):

- school.operating = 1
- school.degrees_awarded.predominant in (3,4)
- in a US state or DC
- has at least one of latest.admissions.admission_rate.overall OR
  latest.admissions.sat_scores.average.overall present.

Metrics (all real Scorecard fields):

- selectivity = 1 − latest.admissions.admission_rate.overall  (higher = more selective)
- academics   = latest.admissions.sat_scores.average.overall
- completion  = latest.completion.rate_suppressed.overall
- earnings    = latest.earnings.10_yrs_after_entry.median

Normalization: convert each metric to its PERCENTILE (0–1) among all eligible
schools that HAVE that metric. A missing metric is excluded from that school's
average — never treated as 0.

Composite: score = Σ(wᵢ·pctlᵢ) / Σ(wᵢ) over present metrics. Default weights
(put in the config so Jeff can tweak & re-run): selectivity 0.30, academics
0.25, completion 0.20, earnings 0.25.

Order: score descending; ties broken by admission_rate asc, then sat average
desc, then name A–Z. Take top 200; assign rank = 1..200.

For reproducibility, the implementation uses tied mid-rank percentiles:
`(count lower + (count equal - 1) / 2) / (n - 1)`; a one-school metric cohort
is 1. Equal values receive equal percentiles, and missing values are excluded
from both that metric's cohort and the school's score denominator.

This is a **Scorecard-derived ranking** and **WILL differ from US News / QS /
THE — by design**.

`manualExclude` and `manualInclude` default to empty. An included UNITID still
must meet every eligibility rule. Any non-empty manual control changes the
cohort and should have a documented data-quality reason before it is used for a
canonical ranking.

## Data contract and migration behavior

Every generated university has all 13 fact kinds and all six requirement kinds.
Known rows are copied from a returned Scorecard field and carry that school's
Scorecard-profile source. Every other row is an explicit unknown with a reason
and suggested action; no information is guessed. SAT policy/requirement strings
use directly reported SAT critical-reading/math ranges or ACT composite ranges,
never a derived total. The importer validates the known-or-unknown check and
enum lists before writing any output.

The SQL adds `rank`, `rank_source_id`, and `unitid` only if absent, registers a
verified ranking source and per-school verified Scorecard sources, and inserts
only new universities/facts/requirements. For the 18 existing four-year
catalogue rows, its only update is `rank`, `rank_source_id`, and `unitid`; `hcc`
is untouched. It contains no `delete from`.

At the end of its transaction, the generated migration runs:

```sql
refresh materialized view public.university_search_index;
```

This is intentionally non-concurrent. Do not replace it with
`public.refresh_university_search_index()` or `REFRESH ... CONCURRENTLY`: a
concurrent refresh cannot run inside the migration transaction.

After review, apply the generated migration only through the normal verified
Supabase workflow. Before any `db push`, reconcile the CLI project reference,
`VITE_SUPABASE_URL`, and the remote migration ledger.
