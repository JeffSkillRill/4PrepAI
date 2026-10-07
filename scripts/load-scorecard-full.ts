/**
 * Loads the COMPLETE College Scorecard record for every catalogue university.
 *
 * Unlike import-scorecard.ts, this one does not pass a `fields` filter: the API
 * returns the entire record and it is stored verbatim as jsonb. Nothing is added,
 * nothing is inferred, nothing is normalised, nothing is dropped.
 *
 * It writes over the network rather than emitting a migration, because the payload
 * is ~160 MB for 205 schools and a SQL migration file cannot carry that.
 *
 * Run from an internet-connected terminal, repo root:
 *   export SCORECARD_API_KEY='your-api.data.gov-key'
 *   export SUPABASE_URL='https://<project>.supabase.co'
 *   export SUPABASE_SERVICE_ROLE_KEY='<service-role-key>'
 *   export SCORECARD_DATA_YEAR='2023'
 *   deno run --allow-env --allow-net --allow-write scripts/load-scorecard-full.ts
 *
 * Add --dry-run to fetch and report without writing anything.
 */

interface Raw { [key: string]: unknown }
interface Target { id: string; unitid: number }
interface ProgramRow {
  university_id: string; cip_code: string; credential_level: number;
  credential_title: string | null; title: string | null;
  awards_ipeds1: number | null; awards_ipeds2: number | null;
  distance: number | null; earnings: unknown; debt: unknown; source_id: string;
}

const DRY = Deno.args.includes("--dry-run");
const logUrl = new URL("load-scorecard-full.log", new URL("./", import.meta.url));

function fail(message: string): never { throw new Error(`Scorecard full load aborted: ${message}`); }

function env(name: string): string {
  const v = Deno.env.get(name)?.trim();
  if (!v) fail(`set ${name}`);
  return v;
}

const API_KEY = env("SCORECARD_API_KEY");
if (API_KEY.toUpperCase() === "DEMO_KEY") fail("DEMO_KEY is prohibited; get a free key at api.data.gov/signup");
const SUPABASE_URL = env("SUPABASE_URL").replace(/\/+$/, "");
const SERVICE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
const DATA_YEAR = Number(env("SCORECARD_DATA_YEAR"));
if (!Number.isInteger(DATA_YEAR)) fail("SCORECARD_DATA_YEAR must be an integer, e.g. 2023");

const SOURCE_ID = `us-scorecard-full-${DATA_YEAR}`;
const restHeaders: HeadersInit = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function rest(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...restHeaders, ...(init.headers ?? {}) },
  });
  if (!res.ok) fail(`${init.method ?? "GET"} ${path} -> ${res.status} ${await res.text()}`);
  return res;
}

async function upsert(table: string, rows: unknown): Promise<void> {
  if (DRY) return;
  await rest(table, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
}

/**
 * Null-safe coercions. Number(null) is 0 and String(null) is "null", so every
 * conversion checks for absence FIRST. A value Scorecard does not report must
 * stay null in the database — it must never arrive as 0 or "".
 */
function intOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function strOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Counts every leaf value, so the log shows how much actually landed. */
function leafCount(value: unknown): number {
  let n = 0;
  (function walk(x: unknown): void {
    if (x && typeof x === "object") { for (const k of Object.keys(x as Raw)) walk((x as Raw)[k]); }
    else n++;
  })(value);
  return n;
}

async function fetchSchool(unitid: number): Promise<Raw | null> {
  const url = new URL("https://api.data.gov/ed/collegescorecard/v1/schools/");
  // No `fields` parameter: this is deliberate. It is what makes the record complete.
  url.search = new URLSearchParams({ api_key: API_KEY, id: String(unitid) }).toString();
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url);
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, attempt * 4000)); continue; }
    if (!res.ok) fail(`Scorecard ${unitid} -> ${res.status} ${await res.text()}`);
    const body = await res.json() as { results?: Raw[] };
    return body.results?.[0] ?? null;
  }
  fail(`Scorecard ${unitid} kept failing after 4 attempts`);
}

interface ProgramResult { rows: ProgramRow[]; skippedNoKey: number }

function programRows(universityId: string, record: Raw): ProgramResult {
  const latest = record.latest as Raw | undefined;
  const programs = (latest?.programs as Raw | undefined)?.cip_4_digit;
  if (!Array.isArray(programs)) return { rows: [], skippedNoKey: 0 };

  const seen = new Set<string>();
  const rows: ProgramRow[] = [];
  let skippedNoKey = 0;

  for (const entry of programs as Raw[]) {
    const credential = entry.credential as Raw | undefined;
    const code = strOrNull(entry.code);
    const level = intOrNull(credential?.level);
    // The primary key is (university_id, cip_code, credential_level), so a row
    // without both cannot be indexed here. It is NOT lost: the entry is still in
    // university_scorecard.payload verbatim. The count is reported in the log.
    if (code === null || level === null) { skippedNoKey++; continue; }

    const key = `${code}:${level}`;
    if (seen.has(key)) { skippedNoKey++; continue; }
    seen.add(key);

    const counts = entry.counts as Raw | undefined;
    rows.push({
      university_id: universityId,
      cip_code: code,
      credential_level: level,
      credential_title: strOrNull(credential?.title),
      title: strOrNull(entry.title),            // stored exactly as reported, trailing period included
      awards_ipeds1: intOrNull(counts?.ipeds_awards1),
      awards_ipeds2: intOrNull(counts?.ipeds_awards2),
      distance: intOrNull(entry.distance),      // raw code, never coerced to boolean
      earnings: entry.earnings ?? null,
      debt: entry.debt ?? null,
      source_id: SOURCE_ID,
    });
  }
  return { rows, skippedNoKey };
}

async function main(): Promise<void> {
  const targets = await (await rest(
    "universities?select=id,unitid&unitid=not.is.null&order=id",
  )).json() as Target[];
  if (!targets.length) fail("no universities with a unitid; run import-scorecard.ts first");

  await upsert("sources", [{
    id: SOURCE_ID,
    name: "US Department of Education, College Scorecard API (complete institution record)",
    url: "https://collegescorecard.ed.gov/data/documentation/",
    retrieved_at: new Date().toISOString().slice(0, 10),
    verification: "verified",
  }]);

  let schools = 0, leaves = 0, programs = 0, skipped = 0, missing = 0;
  const absent: number[] = [];

  for (const target of targets) {
    const record = await fetchSchool(target.unitid);
    if (!record) { missing++; absent.push(target.unitid); continue; }

    const count = leafCount(record);
    await upsert("university_scorecard", [{
      university_id: target.id,
      unitid: target.unitid,
      data_year: DATA_YEAR,
      payload: record,
      leaf_count: count,
      fetched_at: new Date().toISOString(),
      source_id: SOURCE_ID,
    }]);

    const { rows, skippedNoKey } = programRows(target.id, record);
    if (rows.length && !DRY) {
      await rest(`university_scorecard_programs?university_id=eq.${encodeURIComponent(target.id)}`, { method: "DELETE" });
      // chunked: a single school can carry 300+ programs with nested earnings
      for (let i = 0; i < rows.length; i += 100) await upsert("university_scorecard_programs", rows.slice(i, i + 100));
    }

    schools++; leaves += count; programs += rows.length; skipped += skippedNoKey;
    console.log(`${schools}/${targets.length} ${target.id} unitid=${target.unitid} leaves=${count} programs=${rows.length}${skippedNoKey ? ` unkeyed=${skippedNoKey}` : ""}`);
  }

  const log = [
    `run_at=${new Date().toISOString()}`,
    `dry_run=${DRY}`,
    `data_year=${DATA_YEAR}`,
    `source_id=${SOURCE_ID}`,
    `targets=${targets.length}`,
    `schools_loaded=${schools}`,
    `schools_missing_from_scorecard=${missing}`,
    `missing_unitids=${absent.join(" ")}`,
    `total_leaf_values=${leaves}`,
    `program_rows=${programs}`,
    `program_entries_unkeyed_still_in_payload=${skipped}`,
    "",
  ].join("\n");
  await Deno.writeTextFile(logUrl, log);
  console.log(`\n${log}`);
}

await main();
