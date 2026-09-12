import {
  htmlLines,
  parseProfileHtml,
  parseRobots,
  robotsAllows,
} from "./import-qs.ts";

function assertEquals<T>(actual: T, expected: T): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `expected ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }`,
    );
  }
}

Deno.test("parses QS fields without inventing ambiguous values", () => {
  const html =
    `<h1>California Institute of Technology (Caltech)</h1><h3># 7 QS World University Rankings</h3><h2>Admission</h2><h4>Bachelor</h4><p>SAT</p><p>1520+</p><p>GPA</p><p>3+</p><p>TOEFL</p><p>100+</p><p>Duolingo English Test</p><p>130+</p><p>IELTS</p><p>7+</p><h4>Master</h4><p>GRE</p><p>329+</p><p>GPA</p><p>3.5+</p><h2>Students &amp; Staff</h2><p>Total students</p><p>2,430</p><p>UG students</p><p>40.6%</p><p>PG students</p><p>59.4%</p><p>International students</p><p>810</p><p>Total faculty staff</p><p>914</p><p>Domestic staff</p><p>44%</p><p>Int'l staff</p><p>56%</p>`;
  const profile = parseProfileHtml(
    "https://www.topuniversities.com/universities/california-institute-technology-caltech",
    html,
  );
  assertEquals(profile.name, "California Institute of Technology (Caltech)");
  assertEquals(profile.rank, 7);
  assertEquals(
    profile.requirements.find((row) => row.kind === "ielts")?.numericValue,
    7,
  );
  assertEquals(
    profile.requirements.find((row) => row.kind === "sat")?.numericValue,
    1520,
  );
  assertEquals(
    profile.requirements.find((row) => row.kind === "act")?.unknownReason,
    "Not published on the QS profile page",
  );
  assertEquals(
    profile.requirements.find((row) => row.kind === "gpa")?.unknownReason,
    "QS profile publishes degree-specific, conflicting values that this schema cannot represent.",
  );
  assertEquals(
    profile.unmappedFields.map((field) => field.field).sort(),
    [
      "domestic_faculty_split",
      "faculty_count",
      "gre_minimum",
      "international_faculty_split",
      "international_student_count_or_percent",
      "total_enrollment",
      "ug_pg_split",
      "ug_pg_split",
    ].sort(),
  );
});
Deno.test("robots permits QS profiles and blocks private paths", () => {
  const robots = parseRobots(
    "User-agent: *\nCrawl-delay: 10\nDisallow: /admin/\nDisallow: /qs-profiles/rank-data/\n",
  );
  assertEquals(
    robotsAllows(
      robots,
      new URL("https://www.topuniversities.com/universities/example"),
      "4PrepAI-QS-Importer/1.0",
    ),
    true,
  );
  assertEquals(
    robotsAllows(
      robots,
      new URL("https://www.topuniversities.com/admin/example"),
      "4PrepAI-QS-Importer/1.0",
    ),
    false,
  );
  assertEquals(htmlLines("<p>A&amp;B</p><p>7+</p>"), ["A&B", "7+"]);
});
