/**
 * SAMPLE DATA — DESIGN FIXTURES ONLY. NOT VERIFIED.
 *
 * Every figure below is a placeholder for a value the real backend will
 * retrieve and source. No number in this file should be treated as true.
 * Sources are explicitly labeled as sample fixtures and every screen renders
 * the "Sample data — not verified" ribbon while this file is in use.
 */

import {
  DataPoint,
  FitScore,
  Pathway,
  Scholarship,
  Source,
  StudentProfile,
  University,
  known,
  unknown,
} from "../types";

// ── Sources (all sample fixtures) ──────────────────────────────────────────

export const sources: Source[] = [
  {
    id: "src-uni-site",
    name: "SAMPLE — stands in for: university official website",
    url: "https://example.com/placeholder",
    retrievedAt: "2026-07-01",
    verification: "unverified_sample",
  },
  {
    id: "src-scholarship-portal",
    name: "SAMPLE — stands in for: scholarship program portal",
    url: "https://example.com/placeholder",
    retrievedAt: "2026-06-28",
    verification: "unverified_sample",
  },
  {
    id: "src-gov-agency",
    name: "SAMPLE — stands in for: national education agency",
    url: "https://example.com/placeholder",
    retrievedAt: "2026-06-15",
    verification: "unverified_sample",
  },
  {
    id: "src-numbeo-like",
    name: "SAMPLE — stands in for: cost-of-living database",
    url: "https://example.com/placeholder",
    retrievedAt: "2026-07-05",
    verification: "unverified_sample",
  },
];

export const sourceById = (id: string): Source | undefined =>
  sources.find((s) => s.id === id);

// ── Universities ───────────────────────────────────────────────────────────
// Names are fictional composites so no real institution is misrepresented
// by sample figures.

export const universities: University[] = [
  {
    id: "uni-danubia",
    name: "Danubia Technical University",
    city: "Debrecen",
    country: "Hungary",
    countryCode: "HU",
    founded: known(1912, "src-uni-site"),
    languagesOfInstruction: ["English", "Hungarian"],
    tuitionPerYear: known(
      { amount: 6500, currency: "USD", period: "year" },
      "src-uni-site"
    ),
    livingCostPerYear: known(
      { amount: 4800, currency: "USD", period: "year" },
      "src-numbeo-like"
    ),
    applicationFee: known(
      { amount: 150, currency: "USD", period: "one_time" },
      "src-uni-site"
    ),
    acceptanceRate: unknown(
      "Not published by the university",
      "Ask the admissions office directly — we can draft the email"
    ),
    applicationDeadline: known("2026-11-15", "src-uni-site"),
    ieltsMinimum: known(6.0, "src-uni-site"),
    requirements: [
      {
        id: "req-dan-ielts",
        key: "ielts_min",
        label: "IELTS overall",
        requirement: known(6.0, "src-uni-site"),
      },
      {
        id: "req-dan-gpa",
        key: "gpa_min",
        label: "Secondary school GPA",
        requirement: known("3.5 / 5.0 equivalent", "src-uni-site"),
      },
      {
        id: "req-dan-exam",
        key: "entrance_exam",
        label: "Entrance examination",
        requirement: known("Online math + logic test", "src-uni-site"),
      },
      {
        id: "req-dan-docs",
        key: "document",
        label: "Motivation letter",
        requirement: known("Required, max 500 words", "src-uni-site"),
      },
    ],
    programs: [
      {
        id: "prog-dan-cs",
        name: "BSc Computer Science Engineering",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 3.5,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 6500, currency: "USD", period: "year" },
          "src-uni-site"
        ),
      },
      {
        id: "prog-dan-ee",
        name: "BSc Electrical Engineering",
        degree: "bachelor",
        field: "Engineering",
        durationYears: 3.5,
        languageOfInstruction: "English",
        tuitionPerYear: unknown(
          "Not published by the university",
          "Check the faculty page or contact admissions"
        ),
      },
    ],
    scholarshipIds: ["sch-state-hu", "sch-danubia-merit"],
    about:
      "A public technical university with a large international cohort and English-taught engineering programs.",
  },
  {
    id: "uni-hangang",
    name: "Hangang National University",
    city: "Seoul",
    country: "South Korea",
    countryCode: "KR",
    founded: known(1954, "src-uni-site"),
    languagesOfInstruction: ["English", "Korean"],
    tuitionPerYear: known(
      { amount: 5900, currency: "USD", period: "year" },
      "src-uni-site"
    ),
    livingCostPerYear: known(
      { amount: 7200, currency: "USD", period: "year" },
      "src-numbeo-like"
    ),
    applicationFee: known(
      { amount: 80, currency: "USD", period: "one_time" },
      "src-uni-site"
    ),
    acceptanceRate: known(0.34, "src-uni-site"),
    applicationDeadline: known("2026-09-30", "src-uni-site"),
    ieltsMinimum: known(5.5, "src-uni-site"),
    requirements: [
      {
        id: "req-han-ielts",
        key: "ielts_min",
        label: "IELTS overall",
        requirement: known(5.5, "src-uni-site"),
        notes: "TOPIK 3+ accepted as an alternative for Korean-taught tracks",
      },
      {
        id: "req-han-gpa",
        key: "gpa_min",
        label: "Secondary school GPA",
        requirement: unknown(
          "Not published by the university",
          "Admissions reviews transcripts holistically — contact them for guidance"
        ),
      },
      {
        id: "req-han-docs",
        key: "document",
        label: "Two recommendation letters",
        requirement: known("Required", "src-uni-site"),
      },
    ],
    programs: [
      {
        id: "prog-han-cs",
        name: "BEng Software Convergence",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 5900, currency: "USD", period: "year" },
          "src-uni-site"
        ),
      },
      {
        id: "prog-han-biz",
        name: "BBA Global Business",
        degree: "bachelor",
        field: "Business",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 5400, currency: "USD", period: "year" },
          "src-uni-site"
        ),
      },
    ],
    scholarshipIds: ["sch-gks", "sch-hangang-intl"],
    about:
      "A private university in Seoul known for engineering and a structured international student track.",
  },
  {
    id: "uni-anatolia",
    name: "Anatolia Institute of Technology",
    city: "Ankara",
    country: "Türkiye",
    countryCode: "TR",
    founded: known(1967, "src-uni-site"),
    languagesOfInstruction: ["English"],
    tuitionPerYear: known(
      { amount: 3800, currency: "USD", period: "year" },
      "src-uni-site"
    ),
    livingCostPerYear: known(
      { amount: 3600, currency: "USD", period: "year" },
      "src-numbeo-like"
    ),
    applicationFee: unknown(
      "Not published by the university",
      "The application portal shows the fee at checkout — verify before paying"
    ),
    acceptanceRate: known(0.21, "src-uni-site"),
    applicationDeadline: known("2026-08-10", "src-uni-site"),
    ieltsMinimum: known(6.5, "src-uni-site"),
    requirements: [
      {
        id: "req-ana-ielts",
        key: "ielts_min",
        label: "IELTS overall",
        requirement: known(6.5, "src-uni-site"),
      },
      {
        id: "req-ana-exam",
        key: "entrance_exam",
        label: "SAT or institutional exam",
        requirement: known("SAT 1200+ or AIT entrance exam", "src-uni-site"),
      },
      {
        id: "req-ana-gpa",
        key: "gpa_min",
        label: "Secondary school GPA",
        requirement: known("4.0 / 5.0 equivalent", "src-uni-site"),
      },
    ],
    programs: [
      {
        id: "prog-ana-cs",
        name: "BSc Computer Engineering",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 3800, currency: "USD", period: "year" },
          "src-uni-site"
        ),
      },
      {
        id: "prog-ana-ai",
        name: "BSc Artificial Intelligence Engineering",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 4100, currency: "USD", period: "year" },
          "src-uni-site"
        ),
      },
    ],
    scholarshipIds: ["sch-turkiye-gov", "sch-ana-merit"],
    about:
      "A selective, research-oriented institute with all instruction in English and strong CS placement.",
  },
  {
    id: "uni-alatau",
    name: "Alatau International University",
    city: "Almaty",
    country: "Kazakhstan",
    countryCode: "KZ",
    founded: known(1998, "src-uni-site"),
    languagesOfInstruction: ["English", "Russian", "Kazakh"],
    tuitionPerYear: known(
      { amount: 2900, currency: "USD", period: "year" },
      "src-uni-site"
    ),
    livingCostPerYear: known(
      { amount: 2400, currency: "USD", period: "year" },
      "src-numbeo-like"
    ),
    applicationFee: known(
      { amount: 25, currency: "USD", period: "one_time" },
      "src-uni-site"
    ),
    acceptanceRate: unknown("Not published by the university"),
    applicationDeadline: known("2027-01-20", "src-uni-site"),
    ieltsMinimum: known(5.5, "src-uni-site"),
    requirements: [
      {
        id: "req-ala-ielts",
        key: "ielts_min",
        label: "IELTS overall",
        requirement: known(5.5, "src-uni-site"),
        notes: "Internal English placement test accepted if no IELTS",
      },
      {
        id: "req-ala-docs",
        key: "document",
        label: "School diploma + transcript",
        requirement: known("Notarized translation required", "src-uni-site"),
      },
    ],
    programs: [
      {
        id: "prog-ala-cs",
        name: "BSc Information Systems",
        degree: "bachelor",
        field: "Computer Science",
        durationYears: 4,
        languageOfInstruction: "English",
        tuitionPerYear: known(
          { amount: 2900, currency: "USD", period: "year" },
          "src-uni-site"
        ),
      },
    ],
    scholarshipIds: ["sch-alatau-regional"],
    about:
      "A regional university close to home with an English-taught IT track and an internal English pathway for students without IELTS.",
  },
];

export const universityById = (id: string): University | undefined =>
  universities.find((u) => u.id === id);

// ── Scholarships ───────────────────────────────────────────────────────────

export const scholarships: Scholarship[] = [
  {
    id: "sch-state-hu",
    name: "State Bilateral Scholarship (sample)",
    provider: "Government program",
    type: "government",
    award: known({ kind: "full_ride" }, "src-gov-agency"),
    deadline: known("2027-01-15", "src-gov-agency"),
    eligibilitySummary:
      "Citizens of partner countries applying to state universities; requires separate government application.",
    universityIds: ["uni-danubia"],
  },
  {
    id: "sch-danubia-merit",
    name: "Danubia Merit Award (sample)",
    provider: "Danubia Technical University",
    type: "merit",
    award: known({ kind: "percent_tuition", percent: 50 }, "src-uni-site"),
    deadline: unknown(
      "Not published by the university",
      "Usually announced with admission results — ask admissions to confirm"
    ),
    eligibilitySummary:
      "Automatic consideration for applicants above the entrance exam threshold.",
    universityIds: ["uni-danubia"],
  },
  {
    id: "sch-gks",
    name: "Global Korea-style Government Scholarship (sample)",
    provider: "Government program",
    type: "government",
    award: known({ kind: "full_ride" }, "src-gov-agency"),
    deadline: known("2026-10-01", "src-gov-agency"),
    eligibilitySummary:
      "Highly competitive; covers tuition, stipend, and a language year. Applied through embassy or university track.",
    universityIds: ["uni-hangang"],
  },
  {
    id: "sch-hangang-intl",
    name: "Hangang International Excellence (sample)",
    provider: "Hangang National University",
    type: "university",
    award: known({ kind: "percent_tuition", percent: 30 }, "src-uni-site"),
    deadline: known("2026-09-30", "src-uni-site"),
    eligibilitySummary:
      "All international applicants with IELTS 6.0+ considered automatically.",
    universityIds: ["uni-hangang"],
  },
  {
    id: "sch-turkiye-gov",
    name: "National Scholarship Program (sample)",
    provider: "Government program",
    type: "government",
    award: known({ kind: "full_ride" }, "src-gov-agency"),
    deadline: known("2027-02-20", "src-gov-agency"),
    eligibilitySummary:
      "Covers tuition, housing, and stipend. Separate portal; essays and interview required.",
    universityIds: ["uni-anatolia"],
  },
  {
    id: "sch-ana-merit",
    name: "AIT Dean's Scholarship (sample)",
    provider: "Anatolia Institute of Technology",
    type: "merit",
    award: unknown(
      "Award amount not published",
      "Amounts vary by year — admissions confirms with the offer letter"
    ),
    deadline: known("2026-08-10", "src-uni-site"),
    eligibilitySummary: "Top entrance-exam performers; no separate application.",
    universityIds: ["uni-anatolia"],
  },
  {
    id: "sch-alatau-regional",
    name: "Alatau Regional Talent Grant (sample)",
    provider: "Alatau International University",
    type: "need",
    award: known({ kind: "percent_tuition", percent: 25 }, "src-uni-site"),
    deadline: known("2026-12-15", "src-uni-site"),
    eligibilitySummary:
      "Central Asian citizens with demonstrated financial need; short form plus household income letter.",
    universityIds: ["uni-alatau"],
  },
];

export const scholarshipById = (id: string): Scholarship | undefined =>
  scholarships.find((s) => s.id === id);

// ── Sample student profile (the intake flow pre-fills from this in dev) ────

export const sampleProfile: StudentProfile = {
  gpa: { value: 4.4, scale: 5 },
  budgetPerYear: { amount: 8000, currency: "USD", period: "year" },
  english: { kind: "ielts", score: 6.5 },
  fieldOfInterest: "Computer Science",
  careerGoal: "Software engineer",
  geographyPreference: ["HU", "KR", "TR"],
  homeCity: "Tashkent",
};

// ── Fit scores for the sample profile ──────────────────────────────────────

export const sampleFitScores: FitScore[] = [
  {
    universityId: "uni-danubia",
    overall: 86,
    computedAt: "2026-07-20",
    components: [
      {
        key: "academic",
        label: "Academic fit",
        score: 88,
        reason: "Your 4.4/5 GPA is above their 3.5/5 equivalent minimum",
      },
      {
        key: "financial",
        label: "Financial fit",
        score: 82,
        reason:
          "Tuition + living (~$11,300/yr sample) exceeds your $8,000 budget — the state scholarship closes the gap",
      },
      {
        key: "language",
        label: "Language readiness",
        score: 95,
        reason: "Your IELTS 6.5 clears their 6.0 minimum",
      },
      {
        key: "career",
        label: "Career alignment",
        score: 84,
        reason: "English-taught CS engineering matches your software goal",
      },
      {
        key: "geographic",
        label: "Geographic alignment",
        score: 80,
        reason: "Hungary is your first-choice region",
      },
    ],
  },
  {
    universityId: "uni-anatolia",
    overall: 79,
    computedAt: "2026-07-20",
    components: [
      {
        key: "academic",
        label: "Academic fit",
        score: 72,
        reason:
          "Their SAT/entrance-exam requirement is a hurdle you haven't cleared yet",
      },
      {
        key: "financial",
        label: "Financial fit",
        score: 90,
        reason: "Tuition + living (~$7,400/yr sample) fits inside your $8,000 budget",
      },
      {
        key: "language",
        label: "Language readiness",
        score: 78,
        reason: "Your IELTS 6.5 meets their 6.5 minimum exactly — no margin",
      },
      {
        key: "career",
        label: "Career alignment",
        score: 88,
        reason: "Dedicated AI engineering program aligns with your goal",
      },
      {
        key: "geographic",
        label: "Geographic alignment",
        score: 68,
        reason: "Türkiye is your third-choice region",
      },
    ],
  },
  {
    universityId: "uni-hangang",
    overall: 74,
    computedAt: "2026-07-20",
    components: [
      {
        key: "academic",
        label: "Academic fit",
        score: 80,
        reason: "No published GPA minimum; your transcript is competitive",
      },
      {
        key: "financial",
        label: "Financial fit",
        score: 58,
        reason:
          "Seoul living costs push the total (~$13,100/yr sample) well past your budget without a major scholarship",
      },
      {
        key: "language",
        label: "Language readiness",
        score: 92,
        reason: "Your IELTS 6.5 clears their 5.5 minimum comfortably",
      },
      {
        key: "career",
        label: "Career alignment",
        score: 82,
        reason: "Software Convergence program matches your goal",
      },
      {
        key: "geographic",
        label: "Geographic alignment",
        score: 74,
        reason: "South Korea is your second-choice region",
      },
    ],
  },
  {
    universityId: "uni-alatau",
    overall: 71,
    computedAt: "2026-07-20",
    components: [
      {
        key: "academic",
        label: "Academic fit",
        score: 85,
        reason: "Your GPA is well above their published requirements",
      },
      {
        key: "financial",
        label: "Financial fit",
        score: 96,
        reason: "Total cost (~$5,300/yr sample) is far inside your budget",
      },
      {
        key: "language",
        label: "Language readiness",
        score: 93,
        reason: "Your IELTS 6.5 clears their 5.5 minimum",
      },
      {
        key: "career",
        label: "Career alignment",
        score: 60,
        reason:
          "Information Systems is adjacent to, not exactly, your software engineering goal",
      },
      {
        key: "geographic",
        label: "Geographic alignment",
        score: 55,
        reason: "Kazakhstan wasn't in your preference list — it's the close-to-home option",
      },
    ],
  },
];

// ── Sample pathway ─────────────────────────────────────────────────────────

export const samplePathway: Pathway = {
  id: "pathway-sample-1",
  createdAt: "2026-07-20",
  profileSnapshot: sampleProfile,
  strategySummary:
    "Your strongest route is Hungary: your IELTS and GPA already clear Danubia's bar, and the state scholarship — deadline January — is the single highest-leverage application you can make. Anatolia is your value pick if you can prepare for their entrance exam by August. Keep Hangang only if you're willing to chase the government scholarship; without it, Seoul breaks your budget. Alatau is a solid close-to-home fallback that needs almost nothing extra from you.",
  rankedUniversityIds: ["uni-danubia", "uni-anatolia", "uni-hangang", "uni-alatau"],
  fitScores: sampleFitScores,
  matchedScholarshipIds: [
    "sch-state-hu",
    "sch-turkiye-gov",
    "sch-danubia-merit",
    "sch-gks",
    "sch-alatau-regional",
  ],
  actionPlan: [
    {
      month: "2026-08",
      title: "Lock the target list",
      items: [
        "Confirm Anatolia entrance-exam date — their deadline is Aug 10",
        "Request notarized translations of your transcript",
        "Draft one master motivation letter to adapt per university",
      ],
    },
    {
      month: "2026-09",
      title: "First applications",
      items: [
        "Submit Hangang application (deadline Sep 30)",
        "Register for the government scholarship portal (Korea track, opens Oct 1)",
      ],
    },
    {
      month: "2026-10",
      title: "Scholarship season",
      items: [
        "Submit Korea government scholarship application",
        "Ask two teachers for recommendation letters",
      ],
    },
    {
      month: "2026-11",
      title: "Hungary deadline",
      items: [
        "Submit Danubia application (deadline Nov 15)",
        "Book IELTS retake only if a program asks for a higher band",
      ],
    },
    {
      month: "2027-01",
      title: "Government scholarships",
      items: [
        "Submit State Bilateral Scholarship (deadline Jan 15)",
        "Submit Alatau application as fallback (deadline Jan 20)",
      ],
    },
    {
      month: "2027-02",
      title: "Final applications",
      items: ["Submit National Scholarship Program, Türkiye (deadline Feb 20)"],
    },
    {
      month: "2027-04",
      title: "Decisions",
      items: [
        "Compare offers with the family using the Compare tool",
        "Confirm scholarship terms in writing before accepting",
      ],
    },
    {
      month: "2027-06",
      title: "Visa & housing",
      items: [
        "Start student visa application the week the acceptance letter arrives",
        "Apply for dormitory — cheapest options fill first",
      ],
    },
    {
      month: "2027-08",
      title: "Departure",
      items: [
        "Book flights 6+ weeks ahead",
        "Carry originals + notarized copies of every document",
      ],
    },
  ],
};
