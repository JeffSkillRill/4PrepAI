/** One-off College Scorecard importer. No npm imports; it never connects to Supabase. */

type Metric = "selectivity" | "academics" | "completion" | "earnings";
type FactKind = "tuition" | "living_cost" | "application_fee" | "deadline" | "scholarship" | "language" | "intake" | "room_board" | "fees" | "total_cost_of_attendance" | "aid_international" | "test_policy" | "financial_certification";
type RequirementKind = "ielts" | "toefl" | "duolingo" | "sat" | "act" | "gpa";
type Period = "year" | "semester" | "month" | "one_time" | "percentage";

interface Config {
  dataYear: number;
  weights: Record<Metric, number>;
  topN: number;
  includeTerritories: boolean;
  existingSchoolUnitids: Record<string, number | null>;
  manualExclude: number[];
  manualInclude: number[];
}
interface Raw { [key: string]: unknown }
interface School {
  unitid: number; name: string; city: string; state: string; ownership: number;
  admissionRate: number | null; satAverage: number | null; completion: number | null; earnings: number | null;
  tuition: number | null; attendance: number | null; roomBoard: number | null;
  satReading25: number | null; satReading75: number | null; satMath25: number | null; satMath75: number | null; act25: number | null; act75: number | null;
  slug: string; existing: boolean; pct: Partial<Record<Metric, number>>; score: number; rank: number | null;
}
interface Fact { kind: FactKind; value: string | null; numeric: number | null; currency: string | null; source: string | null; reason: string | null; action: string | null; period: Period | null }
interface Requirement { kind: RequirementKind; value: string | null; numeric: number | null; source: string | null; reason: string | null; action: string | null }

const FACT_KINDS: FactKind[] = ["tuition", "living_cost", "application_fee", "deadline", "scholarship", "language", "intake", "room_board", "fees", "total_cost_of_attendance", "aid_international", "test_policy", "financial_certification"];
const REQUIREMENT_KINDS: RequirementKind[] = ["ielts", "toefl", "duolingo", "sat", "act", "gpa"];
const EXISTING_SLUGS = new Set(["berea", "brown", "clark", "columbia", "cornell", "duke", "harvard", "illinois-wesleyan", "jhu", "mit", "northwestern", "princeton", "stanford", "alabama", "unk", "upenn", "usm", "yale"]);
const ALL_EXISTING_IDS = new Set([...EXISTING_SLUGS, "hcc"]);
const STATES = new Set(["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"]);
const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};
const FIELDS = [
  "id", "school.name", "school.city", "school.state", "school.ownership", "school.operating", "school.degrees_awarded.predominant",
  "latest.admissions.admission_rate.overall", "latest.admissions.sat_scores.average.overall", "latest.completion.rate_suppressed.overall", "latest.earnings.10_yrs_after_entry.median",
  "latest.cost.tuition.out_of_state", "latest.cost.attendance.academic_year", "latest.cost.roomboard.oncampus",
  "latest.admissions.sat_scores.25th_percentile.critical_reading", "latest.admissions.sat_scores.75th_percentile.critical_reading",
  "latest.admissions.sat_scores.25th_percentile.math", "latest.admissions.sat_scores.75th_percentile.math",
  "latest.admissions.act_scores.25th_percentile.cumulative", "latest.admissions.act_scores.75th_percentile.cumulative",
].join(",");
const scriptsUrl = new URL("./", import.meta.url);
const configUrl = new URL("scorecard-ranking.config.json", scriptsUrl);
const csvUrl = new URL("top200-ranked.csv", scriptsUrl);
const logUrl = new URL("import-scorecard.log", scriptsUrl);
const migrationDir = new URL("../app/supabase/migrations/", scriptsUrl);
const RUN_DATE = new Date().toISOString().slice(0, 10);

function fail(message: string): never { throw new Error(`Scorecard import aborted: ${message}`); }
function at(row: Raw, path: string): unknown { if (row && typeof row === "object" && Object.prototype.hasOwnProperty.call(row, path)) return (row as Raw)[path]; return path.split(".").reduce<unknown>((v, key) => v && typeof v === "object" && !Array.isArray(v) ? (v as Raw)[key] : undefined, row); }
function numberAt(row: Raw, path: string): number | null { const v = at(row, path); if (v === null || v === undefined || v === "") return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function stringAt(row: Raw, path: string): string | null { const v = at(row, path); return typeof v === "string" && v.trim() ? v.trim() : null; }
function slug(name: string): string { const result = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); if (!result) fail(`cannot slugify ${JSON.stringify(name)}`); return result; }
function q(value: string | number | null): string { return value === null ? "null" : typeof value === "number" ? String(value) : `'${value.replaceAll("'", "''")}'`; }
function array(values: string[]): string { return values.length ? `array[${values.map(q).join(", ")}]::text[]` : "array[]::text[]"; }
function n(value: number): string { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value); }
function c(value: string | number | null): string { const text = value === null ? "" : String(value); return /[\",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
function nameCompare(a: string, b: string): number { a = a.toUpperCase(); b = b.toUpperCase(); return a < b ? -1 : a > b ? 1 : 0; }
function nowDate(): string { return RUN_DATE; }

function knownFact(kind: FactKind, value: string, source: string, numeric: number | null = null, currency: string | null = null, period: Period | null = null): Fact { return { kind, value, numeric, currency, source, reason: null, action: null, period }; }
function unknownFact(kind: FactKind, reason: string, action: string): Fact { return { kind, value: null, numeric: null, currency: null, source: null, reason, action, period: null }; }
function knownRequirement(kind: RequirementKind, value: string, source: string): Requirement { return { kind, value, numeric: null, source, reason: null, action: null }; }
function unknownRequirement(kind: RequirementKind, reason: string, action: string): Requirement { return { kind, value: null, numeric: null, source: null, reason, action }; }
function assertFact(row: Fact): void {
  const yes = row.value !== null && row.source !== null && row.reason === null && row.action === null;
  const no = row.value === null && row.numeric === null && row.currency === null && row.source === null && row.reason !== null && row.action !== null && row.period === null;
  if (!FACT_KINDS.includes(row.kind) || !(yes || no)) fail(`fact contract failed for ${row.kind}`);
}
function assertRequirement(row: Requirement): void {
  const yes = row.value !== null && row.source !== null && row.reason === null && row.action === null;
  const no = row.value === null && row.numeric === null && row.source === null && row.reason !== null && row.action !== null;
  if (!REQUIREMENT_KINDS.includes(row.kind) || !(yes || no)) fail(`requirement contract failed for ${row.kind}`);
}
function satRange(s: School, year: number): string | null {
  const reading = s.satReading25 === null || s.satReading75 === null ? null : `critical reading ${s.satReading25}–${s.satReading75}`;
  const math = s.satMath25 === null || s.satMath75 === null ? null : `math ${s.satMath25}–${s.satMath75}`;
  const parts = [reading, math].filter((x): x is string => x !== null);
  return parts.length ? `Middle-50% SAT ${parts.join("; ")} (Scorecard ${year})` : null;
}
function actRange(s: School, year: number): string | null { return s.act25 === null || s.act75 === null ? null : `Middle-50% ACT ${s.act25}–${s.act75} (Scorecard ${year})`; }
function scorecardSource(s: School): string { return `us-scorecard-${s.slug}`; }
function profileUrl(s: School): string { return `https://collegescorecard.ed.gov/school/?${s.unitid}-${slug(s.name).replaceAll("-", "_")}`; }

function facts(s: School, config: Config): Fact[] {
  const source = scorecardSource(s), admissions = `Check ${s.name}'s admissions pages.`, aid = `Check ${s.name}'s financial-aid pages.`, both = `Check ${s.name}'s admissions / financial-aid pages.`;
  const policy = [satRange(s, config.dataYear), actRange(s, config.dataYear)].filter((x): x is string => x !== null).join("; ");
  return [
    s.tuition === null ? unknownFact("tuition", "College Scorecard does not report out-of-state tuition.", aid) : knownFact("tuition", `$${n(s.tuition)} / year (Scorecard ${config.dataYear})`, source, s.tuition, "USD", "year"),
    unknownFact("living_cost", "College Scorecard does not report a separate living-cost amount for this import.", both),
    unknownFact("application_fee", "College Scorecard does not report the application fee.", admissions),
    unknownFact("deadline", "College Scorecard does not report the application deadline.", admissions),
    unknownFact("scholarship", "College Scorecard does not report scholarship terms for this import.", aid),
    unknownFact("language", "College Scorecard does not report English-language requirements.", admissions),
    unknownFact("intake", "College Scorecard does not report admission intakes.", admissions),
    s.roomBoard === null ? unknownFact("room_board", "College Scorecard does not report on-campus room and board.", aid) : knownFact("room_board", `$${n(s.roomBoard)} / year (Scorecard ${config.dataYear})`, source, s.roomBoard, "USD", "year"),
    unknownFact("fees", "College Scorecard does not report a separate fees amount for this import.", aid),
    s.attendance === null ? unknownFact("total_cost_of_attendance", "College Scorecard does not report academic-year cost of attendance.", aid) : knownFact("total_cost_of_attendance", `$${n(s.attendance)} / year (Scorecard ${config.dataYear})`, source, s.attendance, "USD", "year"),
    unknownFact("aid_international", "College Scorecard does not report international-student aid policy.", `Check ${s.name}'s international admissions / financial-aid pages.`),
    policy ? knownFact("test_policy", policy, source) : unknownFact("test_policy", "College Scorecard does not report a middle-50% SAT or ACT range.", admissions),
    unknownFact("financial_certification", "College Scorecard does not report an I-20 proof-of-funds amount.", `Ask ${s.name}'s international office for the amount after aid.`),
  ];
}
function requirements(s: School, config: Config): Requirement[] {
  const source = scorecardSource(s), action = `Check ${s.name}'s admissions pages.`;
  const sat = satRange(s, config.dataYear) ?? (s.satAverage === null ? null : `SAT average ${s.satAverage} (Scorecard ${config.dataYear})`), act = actRange(s, config.dataYear);
  return [
    unknownRequirement("ielts", "College Scorecard does not report an IELTS requirement.", action),
    unknownRequirement("toefl", "College Scorecard does not report a TOEFL requirement.", action),
    unknownRequirement("duolingo", "College Scorecard does not report a Duolingo requirement.", action),
    sat ? knownRequirement("sat", sat, source) : unknownRequirement("sat", "College Scorecard does not report an SAT midpoint or range.", action),
    act ? knownRequirement("act", act, source) : unknownRequirement("act", "College Scorecard does not report an ACT range.", action),
    unknownRequirement("gpa", "College Scorecard does not report a GPA requirement.", action),
  ];
}

function asSchool(row: Raw): School | null {
  const unitid = numberAt(row, "id"), name = stringAt(row, "school.name"), city = stringAt(row, "school.city"), state = stringAt(row, "school.state"), ownership = numberAt(row, "school.ownership");
  const operating = numberAt(row, "school.operating"), degree = numberAt(row, "school.degrees_awarded.predominant"), admissionRate = numberAt(row, "latest.admissions.admission_rate.overall"), satAverage = numberAt(row, "latest.admissions.sat_scores.average.overall");
  if (unitid === null || !Number.isInteger(unitid) || !name || !city || !state || ownership === null || operating !== 1 || (degree !== 3 && degree !== 4) || !STATES.has(state) || (admissionRate === null && satAverage === null)) return null;
  if (admissionRate !== null && (admissionRate < 0 || admissionRate > 1)) return null;
  return { unitid, name, city, state, ownership, admissionRate, satAverage, completion: numberAt(row, "latest.completion.rate_suppressed.overall"), earnings: numberAt(row, "latest.earnings.10_yrs_after_entry.median"), tuition: numberAt(row, "latest.cost.tuition.out_of_state"), attendance: numberAt(row, "latest.cost.attendance.academic_year"), roomBoard: numberAt(row, "latest.cost.roomboard.oncampus"), satReading25: numberAt(row, "latest.admissions.sat_scores.25th_percentile.critical_reading"), satReading75: numberAt(row, "latest.admissions.sat_scores.75th_percentile.critical_reading"), satMath25: numberAt(row, "latest.admissions.sat_scores.25th_percentile.math"), satMath75: numberAt(row, "latest.admissions.sat_scores.75th_percentile.math"), act25: numberAt(row, "latest.admissions.act_scores.25th_percentile.cumulative"), act75: numberAt(row, "latest.admissions.act_scores.75th_percentile.cumulative"), slug: "", existing: false, pct: {}, score: 0, rank: null };
}
function metric(s: School, name: Metric): number | null { return name === "selectivity" ? s.admissionRate === null ? null : 1 - s.admissionRate : name === "academics" ? s.satAverage : name === "completion" ? s.completion : s.earnings; }
function percentiles(schools: School[], name: Metric): void {
  const values = schools.map((s) => metric(s, name)).filter((v): v is number => v !== null).sort((a, b) => a - b);
  if (values.length === 1) { schools.forEach((s) => { if (metric(s, name) !== null) s.pct[name] = 1; }); return; }
  for (let start = 0; start < values.length;) {
    let end = start + 1; while (end < values.length && values[end] === values[start]) end++;
    const p = (start + (end - start - 1) / 2) / (values.length - 1), value = values[start];
    schools.forEach((s) => { if (metric(s, name) === value) s.pct[name] = p; }); start = end;
  }
}
function rank(schools: School[], config: Config): School[] {
  (Object.keys(config.weights) as Metric[]).forEach((name) => percentiles(schools, name));
  schools.forEach((s) => { let total = 0, present = 0; (Object.keys(config.weights) as Metric[]).forEach((name) => { const p = s.pct[name]; if (p !== undefined) { total += p * config.weights[name]; present += config.weights[name]; } }); if (!present) fail(`${s.name} has no metrics.`); s.score = total / present; });
  const includes = new Set(config.manualInclude), excludes = new Set(config.manualExclude), considered = schools.filter((s) => !excludes.has(s.unitid) || includes.has(s.unitid));
  includes.forEach((id) => { if (!considered.some((s) => s.unitid === id)) fail(`manualInclude UNITID ${id} is not eligible.`); });
  considered.sort((a, b) => b.score - a.score || (a.admissionRate ?? Infinity) - (b.admissionRate ?? Infinity) || (b.satAverage ?? -Infinity) - (a.satAverage ?? -Infinity) || nameCompare(a.name, b.name) || a.unitid - b.unitid);
  const ranked = considered.slice(0, config.topN); ranked.forEach((s, i) => s.rank = i + 1); return ranked;
}

function validateConfig(config: Config): void {
  if (!Number.isInteger(config.dataYear) || config.dataYear < 1900 || config.dataYear > 2100) fail("dataYear must be a four-digit Scorecard release year.");
  if (config.includeTerritories !== false) fail("includeTerritories must be false.");
  if (!Number.isInteger(config.topN) || config.topN < 1 || config.topN > 200) fail("topN must be 1 through 200.");
  const weightNames = Object.keys(config.weights).sort(); const expectedWeightNames = ["academics", "completion", "earnings", "selectivity"];
  const weights = Object.values(config.weights); if (weightNames.join(",") !== expectedWeightNames.join(",") || weights.some((w) => !Number.isFinite(w) || w < 0) || weights.reduce((a, b) => a + b, 0) <= 0) fail("weights must contain exactly the four finite, non-negative metrics and total above zero.");
  const slugs = Object.keys(config.existingSchoolUnitids); if (slugs.length !== EXISTING_SLUGS.size || slugs.some((s) => !EXISTING_SLUGS.has(s))) fail("existingSchoolUnitids must contain exactly the 18 existing four-year slugs.");
  for (const id of Object.values(config.existingSchoolUnitids)) if (!Number.isInteger(id) || (id as number) <= 0) fail("every existingSchoolUnitids value must be Jeff's human-confirmed positive UNITID.");
  if ([...config.manualExclude, ...config.manualInclude].some((id) => !Number.isInteger(id) || id <= 0)) fail("manual controls must contain positive integer UNITIDs.");
}
async function fetchRecords(apiKey: string): Promise<Raw[]> {
  const rows: Raw[] = []; let page = 0, total = 0;
  do {
    const url = new URL("https://api.data.gov/ed/collegescorecard/v1/schools.json");
    url.search = new URLSearchParams({ api_key: apiKey, per_page: "100", page: String(page), "school.operating": "1", fields: FIELDS }).toString();
    const response = await fetch(url); if (!response.ok) fail(`College Scorecard page ${page} returned HTTP ${response.status}.`);
    const payload = await response.json() as { results?: unknown; metadata?: { total?: unknown } }; if (!Array.isArray(payload.results)) fail(`College Scorecard page ${page} did not return results.`);
    rows.push(...payload.results.filter((r): r is Raw => r !== null && typeof r === "object")); total = Number(payload.metadata?.total); if (!Number.isFinite(total) || total < rows.length) fail(`College Scorecard page ${page} returned an invalid total.`); page++;
  } while (rows.length < total);
  return rows;
}
function assignIds(schools: School[], config: Config): void {
  const found = new Map(schools.map((s) => [s.unitid, s])), existing = new Map<number, string>();
  for (const [id, unitid] of Object.entries(config.existingSchoolUnitids)) { if (existing.has(unitid as number)) fail(`duplicate existing UNITID ${unitid}`); if (!found.has(unitid as number)) fail(`confirmed UNITID ${unitid} (${id}) was not eligible US four-year Scorecard data.`); existing.set(unitid as number, id); }
  const used = new Set(ALL_EXISTING_IDS); [...schools].sort((a, b) => a.unitid - b.unitid).forEach((s) => { const current = existing.get(s.unitid); if (current) { s.slug = current; s.existing = true; } else { const base = slug(s.name); s.slug = used.has(base) ? `${base}-${s.unitid}` : base; if (used.has(s.slug)) fail(`slug collision for UNITID ${s.unitid}`); used.add(s.slug); } });
}
async function migrationUrl(): Promise<URL> { let max = 0; for await (const e of Deno.readDir(migrationDir)) { const m = e.isFile && e.name.match(/^\d{8}(\d{4})_.*\.sql$/); if (m) max = Math.max(max, Number(m[1])); } return new URL(`${nowDate().replaceAll("-", "")}${String(max + 1).padStart(4, "0")}_scorecard_top200_us_universities.sql`, migrationDir); }
function writeSchool(lines: string[], s: School, config: Config): { known: number; unknown: number } {
  const fs = facts(s, config), rs = requirements(s, config); if (new Set(fs.map((x) => x.kind)).size !== FACT_KINDS.length || new Set(rs.map((x) => x.kind)).size !== REQUIREMENT_KINDS.length) fail(`${s.name} is missing a required row.`); fs.forEach(assertFact); rs.forEach(assertRequirement);
  const known = [...fs, ...rs].filter((x) => x.value !== null).length, unknown = fs.length + rs.length - known, source = scorecardSource(s);
  lines.push(`-- #${s.rank}: ${s.name} (UNITID ${s.unitid})`, "insert into public.sources (id, name, url, retrieved_at, verification) values", `  (${q(source)}, ${q(`College Scorecard — ${s.name}`)}, ${q(profileUrl(s))}, ${q(nowDate())}, 'verified')`, "on conflict (id) do nothing;");
  if (!s.existing) {
    const type = s.ownership === 1 ? "Public" : "Private", tuition = s.tuition === null ? "not reported" : `$${n(s.tuition)} / year`, sat = satRange(s, config.dataYear) ?? "not reported", rankingSource = `us-4prep-ranking-scorecard-${config.dataYear}`;
    const location = `${s.city}, ${STATE_NAMES[s.state]}`;
    lines.push("insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values", `  (${q(s.slug)}, ${q(s.name)}, ${q(location)}, 'United States', '🇺🇸', ${q(`${type} four-year institution in ${location}.`)},`, `  ${q(`${s.name}. College Scorecard (${config.dataYear}) reports out-of-state tuition ${tuition} and a middle-50% SAT range ${sat}.`)}, ${q(s.slug)}, ${array([])}, ${q(source)}, ${s.rank}, ${q(rankingSource)}, ${s.unitid})`, "on conflict (id) do nothing;", "insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values", fs.map((x) => `  (${q(s.slug)}, ${q(x.kind)}::public.university_fact_kind, ${q(x.value)}, ${q(x.numeric)}, ${q(x.currency)}, ${q(x.source)}, ${q(x.reason)}, ${q(x.action)}, ${q(x.period)})`).join(",\n"), "on conflict (university_id, kind) do nothing;", "insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values", rs.map((x) => `  (${q(s.slug)}, ${q(x.kind)}::public.requirement_kind, ${q(x.value)}, ${q(x.numeric)}, ${q(x.source)}, ${q(x.reason)}, ${q(x.action)})`).join(",\n"), "on conflict (university_id, kind) do nothing;");
  } else lines.push("-- Existing catalogue row: source, identity, facts, and requirements are intentionally untouched.");
  lines.push(""); return { known, unknown };
}
function sqlMigration(ranked: School[], eligible: School[], config: Config): { sql: string; known: number; unknown: number } {
  const ranking = `us-4prep-ranking-scorecard-${config.dataYear}`, lines = ["begin;", "", "-- Generated by scripts/import-scorecard.ts. Additive only; no deletes.", "alter table public.universities add column if not exists rank int;", "alter table public.universities add column if not exists rank_source_id text references public.sources(id);", "alter table public.universities add column if not exists unitid int;", "", "insert into public.sources (id, name, url, retrieved_at, verification) values", `  (${q(ranking)}, ${q(`4Prep ranking — computed from College Scorecard (${config.dataYear})`)}, 'https://collegescorecard.ed.gov/data/', ${q(nowDate())}, 'verified')`, "on conflict (id) do nothing;", ""];
  let known = 0, unknown = 0; ranked.forEach((s) => { const x = writeSchool(lines, s, config); known += x.known; unknown += x.unknown; });
  const rows = Object.entries(config.existingSchoolUnitids).sort(([a], [b]) => nameCompare(a, b)).map(([id, unitid]) => `  (${q(id)}, ${unitid}, ${eligible.find((s) => s.unitid === unitid)?.rank ?? null})`);
  lines.push("-- The only write to the 18 existing four-year catalogue rows: rank provenance and UNITID.", "update public.universities as university", "set rank = ranked.rank,", `    rank_source_id = case when ranked.rank is null then null else ${q(ranking)} end,`, "    unitid = ranked.unitid", "from (values", rows.join(",\n"), ") as ranked(id, unitid, rank)", "where university.id = ranked.id", `  and university.id in (${[...EXISTING_SLUGS].sort(nameCompare).map(q).join(", ")});`, "", "-- Required because this materialized view has no insert trigger.", "refresh materialized view public.university_search_index;", "commit;", "");
  return { sql: lines.join("\n"), known, unknown };
}
function csv(ranked: School[], counts: Map<number, { known: number; unknown: number }>): string { return ["rank,name,state,score,admission_rate,sat_average,completion_rate,earnings_10_year_median,known_fields,unknown_fields", ...ranked.map((s) => [s.rank, s.name, s.state, s.score.toFixed(8), s.admissionRate, s.satAverage, s.completion, s.earnings, counts.get(s.unitid)?.known ?? 0, counts.get(s.unitid)?.unknown ?? 0].map(c).join(","))].join("\n") + "\n"; }
async function main(): Promise<void> {
  const key = Deno.env.get("SCORECARD_API_KEY")?.trim(); if (!key || key.toUpperCase() === "DEMO_KEY") fail("set SCORECARD_API_KEY to a real api.data.gov key; DEMO_KEY is prohibited.");
  const config = JSON.parse(await Deno.readTextFile(configUrl)) as Config; validateConfig(config);
  const raw = await fetchRecords(key), eligible = raw.map(asSchool).filter((s): s is School => s !== null); if (!eligible.length) fail("no eligible US four-year schools returned."); assignIds(eligible, config);
  const ranked = rank(eligible, config); if (ranked.length !== Math.min(config.topN, eligible.length)) fail("unexpected ranked count.");
  const rendered = sqlMigration(ranked, eligible, config), counts = new Map(ranked.map((s) => { const rows = [...facts(s, config), ...requirements(s, config)]; return [s.unitid, { known: rows.filter((x) => x.value !== null).length, unknown: rows.filter((x) => x.value === null).length }]; })), migration = await migrationUrl();
  await Deno.writeTextFile(csvUrl, csv(ranked, counts)); await Deno.writeTextFile(migration, rendered.sql);
  const missing = (x: Metric) => eligible.filter((s) => metric(s, x) === null).length;
  await Deno.writeTextFile(logUrl, [`run_date=${new Date().toISOString()}`, `data_year=${config.dataYear}`, `api_records=${raw.length}`, `eligible_us_four_year=${eligible.length}`, `ranked=${ranked.length}`, `new_universities=${ranked.filter((s) => !s.existing).length}`, `existing_rank_backfills=${EXISTING_SLUGS.size}`, `known_fact_requirement_rows=${rendered.known}`, `unknown_fact_requirement_rows=${rendered.unknown}`, `missing_selectivity=${missing("selectivity")}`, `missing_academics=${missing("academics")}`, `missing_completion=${missing("completion")}`, `missing_earnings=${missing("earnings")}`, `csv=${csvUrl.pathname}`, `migration=${migration.pathname}`, "database_applied=false", ""].join("\n"));
  console.log(`Wrote ${csvUrl.pathname}, ${migration.pathname}, and ${logUrl.pathname}. Review the CSV and SQL before applying anything.`);
}
if (import.meta.main) await main();
