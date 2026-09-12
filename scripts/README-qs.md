# QS TopUniversities importer

`import-qs.ts` is a review-only generator: it has no Supabase client, database URL, credential, `VITE_` variable, or apply command. It reads QS HTML only when `robots.txt` allows the path, and emits idempotent SQL and review reports.

## Quarterly run

1. Copy `qs-universities.config.example.json` to `qs-universities.config.json`. Replace its rejected placeholder with the contactable User-Agent covered by your QS permission.
2. Export the current catalogue identity to `qs-catalogue-snapshot.json` with `{ "universities": [{ "id": "existing-id", "name": "Existing name", "unitid": null }] }`. The generator must not query Production, so this is the reviewable matching input. When QS explicitly exposes a UNITID, it matches on that; otherwise it uses case/punctuation-insensitive names. No match means no SQL write.
3. QS robots.txt required a 10-second delay when checked on 2026-09-04; the importer never goes faster. It aborts on Cloudflare rather than bypassing it. If the JS listing has no profile links, use reviewed `profileUrls` or QS-approved structured access.

```sh
deno run --allow-net --allow-read --allow-write scripts/import-qs.ts scripts/qs-universities.config.json
```

Outputs are `app/supabase/migrations/YYYYMMDDNNNN_qs_topuniversities_review_seed.sql` and `scripts/qs-import-YYYY-MM-DD.{md,json}`. Candidate counts are not live database counts.

For the quarterly cadence, schedule that same command every three months only after refreshing the reviewed catalogue snapshot. For example, use your existing scheduler with `0 3 1 1,4,7,10 *` and retain its generated SQL/report as the approval artifact; it must not auto-apply the SQL.

## Contract

- Exactly one per-run source per matched university: `QS Top Universities`, exact profile URL, run date, always `unverified_sample`.
- Rank changes only when the page publishes an integer rank; existing verified rank sources win.
- IELTS, TOEFL, Duolingo, SAT, ACT, and GPA are known rows only when shown. Omitted values become UNKNOWN with the specified reason/action. Typical/average wording is `indicative`; other admission values are `admission_minimum`.
- Degree-conflicting values become reported UNKNOWNs, never an invented single number.
- Enrollment, UG/PG, international student, faculty, and GRE data are reported only, never stored.
- Requirement upserts are idempotent and refuse to downgrade an existing `verified` source. No delete exists.

Review the output and apply it only through the normal verified Supabase release workflow.
