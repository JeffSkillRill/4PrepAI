/** Review-only QS importer. It never connects to or applies Supabase. */

export type RequirementKind =
  | "ielts"
  | "toefl"
  | "duolingo"
  | "sat"
  | "act"
  | "gpa";
type Benchmark = "admission_minimum" | "indicative";
export interface CatalogueUniversity {
  id: string;
  name: string;
  unitid?: number | null;
}
export interface CatalogueSnapshot {
  universities: CatalogueUniversity[];
}
export interface Config {
  userAgent: string;
  listingUrl: string;
  profileUrls?: string[];
  catalogueSnapshot: string;
  crawlDelayMs?: number;
  maxProfiles?: number;
}
export interface Requirement {
  kind: RequirementKind;
  value: string | null;
  numericValue: number | null;
  sourceId: string | null;
  unknownReason: string | null;
  suggestedAction: string | null;
  benchmark: Benchmark | "none";
}
interface Observation {
  kind: RequirementKind | "gre";
  rawValue: string;
  numericValue: number;
  degree: string | null;
  indicative: boolean;
}
interface UnmappedField {
  field: string;
  value: string;
  context: string | null;
}
export interface Profile {
  url: string;
  name: string;
  unitid: number | null;
  rank: number | null;
  requirements: Requirement[];
  unmappedFields: UnmappedField[];
  ambiguousRequirements: Array<
    { kind: RequirementKind; observations: Observation[] }
  >;
}
interface MatchedProfile {
  profile: Profile;
  university: CatalogueUniversity;
  sourceId: string;
}
interface RobotsGroup {
  agents: string[];
  rules: Array<{ allow: boolean; path: string }>;
  crawlDelaySeconds: number | null;
}
interface Robots {
  groups: RobotsGroup[];
}

const REQUIREMENT_KINDS: RequirementKind[] = [
  "ielts",
  "toefl",
  "duolingo",
  "sat",
  "act",
  "gpa",
];
const QS_NAME = "QS Top Universities",
  UNKNOWN_REASON = "Not published on the QS profile page",
  UNKNOWN_ACTION = "Check the university's official admissions page";
const scriptsUrl = new URL("./", import.meta.url),
  defaultConfigUrl = new URL("qs-universities.config.json", scriptsUrl),
  migrationDir = new URL("../app/supabase/migrations/", scriptsUrl);
function fail(message: string): never {
  throw new Error(`QS import aborted: ${message}`);
}
function q(value: string | number | null): string {
  return value === null
    ? "null"
    : typeof value === "number"
    ? String(value)
    : `'${value.replaceAll("'", "''")}'`;
}
function dateToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function normaliseName(name: string): string {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(
      /\s+/g,
      " ",
    );
}
function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
function sourceId(profile: Profile, runDate: string): string {
  return `qs-topuniversities-${runDate}-${stableHash(profile.url)}`;
}
function resolvePath(base: URL, value: string): URL {
  return new URL(value, base);
}
function isQsProfileUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.hostname === "www.topuniversities.com" &&
      /^\/universities\/[^/?#]+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}
function decodeEntities(value: string): string {
  return value.replace(
    /&(?:nbsp|amp|quot|apos|#39);|&#(x[\da-fA-F]+|\d+);/g,
    (entity) => {
      const named: Record<string, string> = {
        "&nbsp;": " ",
        "&amp;": "&",
        "&quot;": '"',
        "&apos;": "'",
        "&#39;": "'",
      };
      if (named[entity] !== undefined) return named[entity];
      const body = entity.slice(2, -1),
        number = body.startsWith("x") || body.startsWith("X")
          ? Number.parseInt(body.slice(1), 16)
          : Number.parseInt(body, 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
    },
  );
}
export function htmlLines(html: string): string[] {
  const text = html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(
    /<style\b[\s\S]*?<\/style>/gi,
    " ",
  ).replace(
    /<(?:br|\/p|\/h[1-6]|\/li|\/div|\/section|\/article|\/tr|\/td|\/th)\b[^>]*>/gi,
    "\n",
  ).replace(/<[^>]+>/g, " ");
  return decodeEntities(text).replace(/\r/g, "\n").split("\n").map((line) =>
    line.replace(/\s+/g, " ").trim()
  ).filter(Boolean);
}
function headingValue(lines: string[], heading: string): string | null {
  const index = lines.findIndex((line) =>
    line.toLowerCase() === heading.toLowerCase()
  );
  return index >= 0 && lines[index + 1] ? lines[index + 1] : null;
}
function numberFrom(value: string): number | null {
  const match = value.replaceAll(",", "").match(
    /(?:^|\s)(\d+(?:\.\d+)?)(?:\s*\+)?(?:\s|$|[;,/])/,
  );
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
function admissionSlice(lines: string[]): string[] {
  const start = lines.findIndex((line) => /^admission$/i.test(line));
  if (start < 0) return [];
  const after = lines.slice(start + 1),
    end = after.findIndex((line) =>
      /^(students?\s*&\s*staff|scholarships|rankings?\s*&\s*ratings)$/i.test(
        line,
      )
    );
  return end < 0 ? after : after.slice(0, end);
}
function requirementLabel(line: string): RequirementKind | "gre" | null {
  const value = line.toLowerCase();
  if (/^ielts(?:\s|$)/.test(value)) return "ielts";
  if (/^toefl(?:\s|$)/.test(value)) return "toefl";
  if (/^(duolingo(?: english test)?|det)(?:\s|$)/.test(value)) {
    return "duolingo";
  }
  if (/^sat(?:\s|$)/.test(value)) return "sat";
  if (/^act(?:\s|$)/.test(value)) return "act";
  if (/^gpa(?:\s|$)/.test(value)) return "gpa";
  if (/^gre(?:\s|$)/.test(value)) return "gre";
  return null;
}
function readAdmissionObservations(lines: string[]): Observation[] {
  const observations: Observation[] = [];
  let degree: string | null = null;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (
      /^(bachelor|master|phd|doctoral|undergraduate|postgraduate)$/i.test(line)
    ) {
      degree = line;
      continue;
    }
    const kind = requirementLabel(line);
    if (!kind) continue;
    const inline = line.replace(
        /^(ielts|toefl|duolingo(?: english test)?|det|sat|act|gpa|gre)\b\s*/i,
        "",
      ),
      rawValue = numberFrom(inline) === null
        ? lines.slice(index + 1, index + 3).find((candidate) =>
          numberFrom(candidate) !== null
        ) ?? ""
        : inline,
      numericValue = numberFrom(rawValue);
    if (numericValue === null) continue;
    observations.push({
      kind,
      rawValue,
      numericValue,
      degree,
      indicative: /\b(average|typical|usually|recommended|indicative)\b/i.test(
        `${line} ${rawValue}`,
      ),
    });
  }
  return observations;
}
function unknownRequirement(kind: RequirementKind): Requirement {
  return {
    kind,
    value: null,
    numericValue: null,
    sourceId: null,
    unknownReason: UNKNOWN_REASON,
    suggestedAction: UNKNOWN_ACTION,
    benchmark: "none",
  };
}
function selectedRequirements(
  observations: Observation[],
): {
  requirements: Requirement[];
  ambiguous: Array<{ kind: RequirementKind; observations: Observation[] }>;
} {
  const requirements: Requirement[] = [],
    ambiguous: Array<{ kind: RequirementKind; observations: Observation[] }> =
      [];
  for (const kind of REQUIREMENT_KINDS) {
    const rows = observations.filter((
        row,
      ): row is Observation & { kind: RequirementKind } => row.kind === kind
      ),
      numericValues = [...new Set(rows.map((row) => row.numericValue))];
    if (!rows.length) {
      requirements.push(unknownRequirement(kind));
      continue;
    }
    if (numericValues.length !== 1) {
      ambiguous.push({ kind, observations: rows });
      requirements.push({
        kind,
        value: null,
        numericValue: null,
        sourceId: null,
        unknownReason:
          "QS profile publishes degree-specific, conflicting values that this schema cannot represent.",
        suggestedAction:
          "Extend requirements to record degree level, then import the published values.",
        benchmark: "none",
      });
      continue;
    }
    const first = rows[0];
    requirements.push({
      kind,
      value: `QS profile admission value: ${first.rawValue}`,
      numericValue: first.numericValue,
      sourceId: "",
      unknownReason: null,
      suggestedAction: null,
      benchmark: rows.some((row) => row.indicative)
        ? "indicative"
        : "admission_minimum",
    });
  }
  return { requirements, ambiguous };
}
function unmapped(
  lines: string[],
  observations: Observation[],
): UnmappedField[] {
  const fields: UnmappedField[] = [],
    labels: Array<[string, string]> = [
      ["total_enrollment", "Total students"],
      ["ug_pg_split", "UG students"],
      ["ug_pg_split", "PG students"],
      ["international_student_count_or_percent", "International students"],
      ["faculty_count", "Total faculty staff"],
      ["domestic_faculty_split", "Domestic staff"],
      ["international_faculty_split", "Int'l staff"],
      ["international_faculty_split", "Intl staff"],
    ];
  for (const [field, label] of labels) {
    const value = headingValue(lines, label);
    if (value !== null) fields.push({ field, value, context: label });
  }
  for (const row of observations.filter((row) => row.kind === "gre")) {
    fields.push({
      field: "gre_minimum",
      value: row.rawValue,
      context: row.degree,
    });
  }
  return fields;
}
export function parseProfileHtml(url: string, html: string): Profile {
  const lines = htmlLines(html),
    h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i),
    name = h1 ? htmlLines(h1[1]).join(" ") : "";
  if (!name) fail(`profile ${url} has no university name`);
  const rankMatch = lines.join("\n").match(
      /#\s*(\d+)\s+QS World University Rankings/i,
    ),
    rank = rankMatch ? Number(rankMatch[1]) : null,
    unitidMatch = lines.join("\n").match(/\bUNITID\s*[:#]?\s*(\d+)\b/i),
    unitid = unitidMatch ? Number(unitidMatch[1]) : null;
  if (rank !== null && (!Number.isInteger(rank) || rank < 1)) {
    fail(`profile ${url} has an invalid QS rank`);
  }
  if (unitid !== null && (!Number.isInteger(unitid) || unitid < 1)) {
    fail(`profile ${url} has an invalid UNITID`);
  }
  const observations = readAdmissionObservations(admissionSlice(lines)),
    selected = selectedRequirements(observations);
  return {
    url,
    name,
    unitid,
    rank,
    requirements: selected.requirements,
    unmappedFields: unmapped(lines, observations),
    ambiguousRequirements: selected.ambiguous,
  };
}

export function parseRobots(text: string): Robots {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  for (const sourceLine of text.split(/\r?\n/)) {
    const line = sourceLine.replace(/#.*/, "").trim();
    if (!line) {
      current = null;
      continue;
    }
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim().toLowerCase(), value = match[2].trim();
    if (key === "user-agent") {
      if (
        !current || current.rules.length || current.crawlDelaySeconds !== null
      ) {
        current = { agents: [], rules: [], crawlDelaySeconds: null };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      continue;
    }
    if (!current) continue;
    if (key === "allow" || key === "disallow") {
      current.rules.push({ allow: key === "allow", path: value });
    }
    if (key === "crawl-delay" && /^\d+(?:\.\d+)?$/.test(value)) {
      current.crawlDelaySeconds = Number(value);
    }
  }
  return { groups };
}
function robotsGroup(robots: Robots, userAgent: string): RobotsGroup | null {
  const token = userAgent.split(/[\s/]/)[0].toLowerCase(),
    exact = robots.groups.find((group) =>
      group.agents.some((agent) => agent !== "*" && token.includes(agent))
    );
  return exact ?? robots.groups.find((group) => group.agents.includes("*")) ??
    null;
}
export function robotsAllows(
  robots: Robots,
  url: URL,
  userAgent: string,
): boolean {
  const group = robotsGroup(robots, userAgent);
  if (!group) return true;
  const path = `${url.pathname}${url.search}`,
    matches = group.rules.filter((rule) =>
      rule.path && path.startsWith(rule.path)
    );
  if (!matches.length) return true;
  matches.sort((a, b) =>
    b.path.length - a.path.length || Number(b.allow) - Number(a.allow)
  );
  return matches[0].allow;
}
function robotsDelayMs(robots: Robots, userAgent: string): number {
  return Math.ceil(
    (robotsGroup(robots, userAgent)?.crawlDelaySeconds ?? 0) * 1000,
  );
}
class PoliteFetcher {
  private lastRequestAt = 0;
  constructor(
    private readonly robots: Robots,
    private readonly userAgent: string,
    private readonly delayMs: number,
  ) {}
  async text(url: URL): Promise<string> {
    if (!robotsAllows(this.robots, url, this.userAgent)) {
      fail(`robots.txt disallows ${url.href}`);
    }
    const wait = this.lastRequestAt + this.delayMs - Date.now();
    if (wait > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, wait));
    }
    this.lastRequestAt = Date.now();
    const response = await fetch(url, {
      headers: {
        "user-agent": this.userAgent,
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (response.status === 403 || response.headers.get("cf-mitigated")) {
      fail(
        `QS returned a bot challenge for ${url.href}. Do not bypass it; use the approved QS access method or ask QS to allow the configured User-Agent.`,
      );
    }
    if (!response.ok) {
      fail(`QS returned HTTP ${response.status} for ${url.href}`);
    }
    return await response.text();
  }
}
function profileUrlsFromListing(html: string, listingUrl: URL): string[] {
  const urls = new Set<string>();
  for (const match of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    const url = new URL(match[1], listingUrl);
    if (isQsProfileUrl(url.href)) urls.add(url.href);
  }
  return [...urls].sort();
}
function validateConfig(config: Config): void {
  if (
    !config.userAgent ||
    /your[- ](?:organization|email)|example\.invalid/i.test(config.userAgent)
  ) {
    fail(
      "config.userAgent must be a real, contactable QS-approved User-Agent; the example placeholder is rejected.",
    );
  }
  if (
    !/^https:\/\/www\.topuniversities\.com\/world-university-rankings\/?$/.test(
      config.listingUrl,
    )
  ) fail("listingUrl must be the QS World University Rankings URL.");
  if (!config.catalogueSnapshot) {
    fail(
      "catalogueSnapshot is required; this review-only importer cannot query Production to discover catalogue rows.",
    );
  }
  if (
    config.crawlDelayMs !== undefined &&
    (!Number.isInteger(config.crawlDelayMs) || config.crawlDelayMs < 0)
  ) fail("crawlDelayMs must be a non-negative integer.");
  if (
    config.maxProfiles !== undefined &&
    (!Number.isInteger(config.maxProfiles) || config.maxProfiles < 1)
  ) fail("maxProfiles must be a positive integer.");
  if (
    config.profileUrls && config.profileUrls.some((url) => !isQsProfileUrl(url))
  ) {
    fail(
      "profileUrls may contain only https://www.topuniversities.com/universities/... URLs.",
    );
  }
}
function validateCatalogue(snapshot: CatalogueSnapshot): void {
  if (!Array.isArray(snapshot.universities) || !snapshot.universities.length) {
    fail("catalogue snapshot needs a non-empty universities array.");
  }
  const ids = new Set<string>(), names = new Set<string>();
  for (const row of snapshot.universities) {
    if (
      !row || typeof row.id !== "string" || !row.id.trim() ||
      typeof row.name !== "string" || !row.name.trim()
    ) fail("every catalogue row needs non-empty id and name.");
    if (ids.has(row.id)) fail(`catalogue snapshot repeats id ${row.id}`);
    ids.add(row.id);
    const normalised = normaliseName(row.name);
    if (names.has(normalised)) {
      fail(`catalogue snapshot has an ambiguous normalized name: ${row.name}`);
    }
    names.add(normalised);
    if (
      row.unitid !== undefined && row.unitid !== null &&
      (!Number.isInteger(row.unitid) || row.unitid <= 0)
    ) {
      fail(
        `catalogue unitid for ${row.id} must be a positive integer or null.`,
      );
    }
  }
}
async function nextMigrationUrl(runDate: string): Promise<URL> {
  let max = 0;
  for await (const entry of Deno.readDir(migrationDir)) {
    const match = entry.isFile && entry.name.match(/^\d{8}(\d{4})_.*\.sql$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return new URL(
    `${runDate.replaceAll("-", "")}${
      String(max + 1).padStart(4, "0")
    }_qs_topuniversities_review_seed.sql`,
    migrationDir,
  );
}
function requirementSql(match: MatchedProfile): string {
  const rows = match.profile.requirements.map((requirement) => {
    const known = requirement.value !== null;
    return `  (${q(match.university.id)}, ${
      q(requirement.kind)
    }::public.requirement_kind, ${q(requirement.value)}, ${
      q(requirement.numericValue)
    }, ${q(known ? match.sourceId : null)}, ${q(requirement.unknownReason)}, ${
      q(requirement.suggestedAction)
    }, ${q(requirement.benchmark)}::public.requirement_benchmark)`;
  });
  return [
    "insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action, benchmark) values",
    rows.join(",\n"),
    "on conflict (university_id, kind) do update",
    "set value = excluded.value, numeric_value = excluded.numeric_value, source_id = excluded.source_id, unknown_reason = excluded.unknown_reason, suggested_action = excluded.suggested_action, benchmark = excluded.benchmark",
    "where coalesce((select source.verification from public.sources as source where source.id = public.requirements.source_id), 'unverified_sample'::public.source_verification) <> 'verified'::public.source_verification;",
  ].join("\n");
}
function sqlSeed(matches: MatchedProfile[], runDate: string): string {
  const lines = [
    "begin;",
    "",
    "-- Generated by scripts/import-qs.ts. The script never applies this SQL.",
    "-- QS rows are deliberately unverified_sample. Existing verified facts and ranks always win.",
    "-- Additive/upsert-only: no deletes, no schema changes, and no Production connection.",
    "",
  ];
  for (const match of matches) {
    const profile = match.profile;
    lines.push(
      `-- ${match.university.id}: ${profile.name}`,
      "insert into public.sources (id, name, url, retrieved_at, verification) values",
      `  (${q(match.sourceId)}, ${q(QS_NAME)}, ${q(profile.url)}, ${
        q(runDate)
      }, 'unverified_sample'::public.source_verification)`,
      "on conflict (id) do update set name = excluded.name, url = excluded.url, retrieved_at = excluded.retrieved_at, verification = 'unverified_sample'::public.source_verification;",
      "",
    );
    if (profile.rank !== null) {
      lines.push(
        "update public.universities as university",
        `set rank = ${profile.rank}, rank_source_id = ${q(match.sourceId)}`,
        `where university.id = ${q(match.university.id)}`,
        "  and coalesce((select source.verification from public.sources as source where source.id = university.rank_source_id), 'unverified_sample'::public.source_verification) <> 'verified'::public.source_verification;",
        "",
      );
    }
    lines.push(requirementSql(match), "");
  }
  lines.push("commit;", "");
  return lines.join("\n");
}
function reportMarkdown(
  runDate: string,
  profiles: Profile[],
  matches: MatchedProfile[],
  unmatched: Profile[],
  migration: URL,
  discoveryMode: string,
): string {
  const requirements = matches.flatMap((match) => match.profile.requirements),
    known = requirements.filter((row) => row.value !== null).length,
    unknown = requirements.length - known,
    unmapped = profiles.flatMap((profile) =>
      profile.unmappedFields.map((field) => ({ profile, field }))
    ),
    ambiguous = profiles.flatMap((profile) =>
      profile.ambiguousRequirements.map((entry) => ({ profile, entry }))
    );
  return [
    "# QS TopUniversities import review report",
    "",
    `Run date: ${runDate}`,
    `Discovery: ${discoveryMode}`,
    "",
    "## Generated SQL candidates (not applied)",
    "",
    `- sources: ${matches.length} upsert candidates`,
    `- universities.rank: ${
      matches.filter((match) => match.profile.rank !== null).length
    } guarded update candidates`,
    `- requirements: ${known} known and ${unknown} unknown guarded upsert candidates`,
    "- university_facts: 0 (QS fields requested for this import map only to rank and requirements)",
    `- SQL: ${migration.pathname}`,
    "",
    "Candidate counts are not live database results. The generator never reads or writes Supabase; actual added/updated rows remain unverified until reviewed SQL is applied. Every SQL update has a verified-source guard.",
    "",
    "## Unmatched universities",
    "",
    ...(unmatched.length
      ? unmatched.map((profile) =>
        `- ${profile.name} | rank: ${
          profile.rank ?? "not published"
        } | ${profile.url}`
      )
      : ["- None in the supplied catalogue snapshot."]),
    "",
    "## Unmapped fields (reported, never stored)",
    "",
    ...(unmapped.length
      ? unmapped.map(({ profile, field }) =>
        `- ${profile.name}: ${field.field} = ${field.value}${
          field.context ? ` (${field.context})` : ""
        }`
      )
      : ["- None found."]),
    "",
    "## Ambiguous admission values (written as UNKNOWN, never guessed)",
    "",
    ...(ambiguous.length
      ? ambiguous.map(({ profile, entry }) =>
        `- ${profile.name}: ${entry.kind} -> ${
          entry.observations.map((value) =>
            `${value.degree ?? "unlabelled"}: ${value.rawValue}`
          ).join("; ")
        }`
      )
      : ["- None found."]),
    "",
    "database_applied=false",
    "",
  ].join("\n");
}
function reportJson(
  runDate: string,
  profiles: Profile[],
  matches: MatchedProfile[],
  unmatched: Profile[],
  migration: URL,
  discoveryMode: string,
): string {
  const requirements = matches.flatMap((match) => match.profile.requirements);
  return JSON.stringify(
    {
      runDate,
      databaseApplied: false,
      discoveryMode,
      generatedSql: migration.pathname,
      candidates: {
        sources: matches.length,
        universityRankUpdates: matches.filter((match) =>
          match.profile.rank !== null
        ).length,
        requirementsKnown:
          requirements.filter((row) => row.value !== null).length,
        requirementsUnknown:
          requirements.filter((row) => row.value === null).length,
        universityFacts: 0,
      },
      unmatchedUniversities: unmatched.map((profile) => ({
        name: profile.name,
        rank: profile.rank,
        url: profile.url,
      })),
      unmappedFields: profiles.flatMap((profile) =>
        profile.unmappedFields.map((field) => ({
          university: profile.name,
          url: profile.url,
          ...field,
        }))
      ),
      ambiguousRequirements: profiles.flatMap((profile) =>
        profile.ambiguousRequirements.map((entry) => ({
          university: profile.name,
          url: profile.url,
          kind: entry.kind,
          observations: entry.observations,
        }))
      ),
    },
    null,
    2,
  ) + "\n";
}
async function main(): Promise<void> {
  const configPath = Deno.args[0]
      ? new URL(Deno.args[0], `file://${Deno.cwd()}/`)
      : defaultConfigUrl,
    config = JSON.parse(await Deno.readTextFile(configPath)) as Config;
  validateConfig(config);
  const catalogueUrl = resolvePath(configPath, config.catalogueSnapshot),
    catalogue = JSON.parse(
      await Deno.readTextFile(catalogueUrl),
    ) as CatalogueSnapshot;
  validateCatalogue(catalogue);
  const listingUrl = new URL(config.listingUrl),
    robotsUrl = new URL("/robots.txt", listingUrl),
    robotsResponse = await fetch(robotsUrl, {
      headers: { "user-agent": config.userAgent, accept: "text/plain" },
    });
  if (!robotsResponse.ok) {
    fail(`could not read robots.txt: HTTP ${robotsResponse.status}`);
  }
  const robots = parseRobots(await robotsResponse.text()),
    policyDelay = robotsDelayMs(robots, config.userAgent),
    crawlDelayMs = Math.max(config.crawlDelayMs ?? policyDelay, policyDelay),
    fetcher = new PoliteFetcher(robots, config.userAgent, crawlDelayMs),
    listingHtml = await fetcher.text(listingUrl),
    fromListing = profileUrlsFromListing(listingHtml, listingUrl),
    urls = [...new Set([...fromListing, ...(config.profileUrls ?? [])])].sort(),
    capped = config.maxProfiles === undefined
      ? urls
      : urls.slice(0, config.maxProfiles);
  if (!urls.length) {
    fail(
      "the QS listing HTML contained no profile links. Supply reviewed profileUrls in config or use QS's approved structured access; the importer will not bypass its JS/Cloudflare delivery.",
    );
  }
  const profiles: Profile[] = [];
  for (const url of capped) {
    profiles.push(parseProfileHtml(url, await fetcher.text(new URL(url))));
  }
  const byName = new Map(
      catalogue.universities.map((
        university,
      ) => [normaliseName(university.name), university]),
    ),
    byUnitid = new Map(
      catalogue.universities.filter((university) =>
        university.unitid !== null && university.unitid !== undefined
      ).map((university) => [university.unitid as number, university]),
    ),
    runDate = dateToday(),
    matches: MatchedProfile[] = [],
    unmatched: Profile[] = [];
  for (const profile of profiles) {
    const university = profile.unitid === null
      ? byName.get(normaliseName(profile.name))
      : byUnitid.get(profile.unitid);
    if (!university) unmatched.push(profile);
    else {matches.push({
        profile: {
          ...profile,
          requirements: profile.requirements.map((row) =>
            row.value === null
              ? row
              : { ...row, sourceId: sourceId(profile, runDate) }
          ),
        },
        university,
        sourceId: sourceId(profile, runDate),
      });}
  }
  const ids = new Set<string>();
  for (const match of matches) {
    if (ids.has(match.university.id)) {
      fail(`more than one QS profile matched ${match.university.id}`);
    }
    ids.add(match.university.id);
  }
  const migration = await nextMigrationUrl(runDate),
    reportBase = new URL(`qs-import-${runDate}`, scriptsUrl),
    markdown = new URL(`${reportBase.pathname}.md`, "file:///"),
    json = new URL(`${reportBase.pathname}.json`, "file:///");
  await Deno.writeTextFile(migration, sqlSeed(matches, runDate));
  await Deno.writeTextFile(
    markdown,
    reportMarkdown(
      runDate,
      profiles,
      matches,
      unmatched,
      migration,
      fromListing.length
        ? "listing links"
        : "reviewed config.profileUrls fallback",
    ),
  );
  await Deno.writeTextFile(
    json,
    reportJson(
      runDate,
      profiles,
      matches,
      unmatched,
      migration,
      fromListing.length
        ? "listing links"
        : "reviewed config.profileUrls fallback",
    ),
  );
  console.log(
    `Wrote ${migration.pathname}, ${markdown.pathname}, and ${json.pathname}. Review before applying; database_applied=false.`,
  );
}
if (import.meta.main) await main();
