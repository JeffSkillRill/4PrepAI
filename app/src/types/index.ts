/**
 * 4Prep type contracts.
 * These interfaces are the contract the real backend will implement.
 * Core principle: no bare numbers. Every fact is a DataPoint that either
 * carries a source or explicitly declares itself unknown.
 */

// ── Sources ────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  /** Human-readable origin, e.g. "University official website" */
  name: string;
  url?: string;
  /** ISO date the value was retrieved */
  retrievedAt: string;
  /** Phase 1 fixtures are always 'unverified_sample' */
  verification: "unverified_sample" | "verified";
}

/**
 * A fact that is either known-with-source or explicitly unknown.
 * The UI must never render a value without its source, and must render
 * unknowns as a designed state (see <MissingValue />).
 */
export type DataPoint<T> =
  | { status: "known"; value: T; sourceId: string }
  | { status: "unknown"; reason: string; suggestedAction?: string };

export const known = <T,>(value: T, sourceId: string): DataPoint<T> => ({
  status: "known",
  value,
  sourceId,
});

export const unknown = <T,>(
  reason: string,
  suggestedAction?: string
): DataPoint<T> => ({ status: "unknown", reason, suggestedAction });

// ── Money ──────────────────────────────────────────────────────────────────

export type CurrencyCode = "USD" | "EUR" | "HUF" | "KRW" | "TRY" | "KZT" | "UZS";

export interface Money {
  amount: number;
  currency: CurrencyCode;
  /** What the amount covers */
  period: "year" | "semester" | "one_time" | "month";
}

// ── Student profile ────────────────────────────────────────────────────────

export type EnglishTestKind = "ielts" | "toefl" | "none";

export interface EnglishStatus {
  kind: EnglishTestKind;
  /** Present only when kind is a test the student has taken */
  score?: number;
  /** Set when the student plans to take a test later */
  plannedTestDate?: string;
}

export interface StudentProfile {
  /** e.g. { value: 4.2, scale: 5 } — grading scales differ by country */
  gpa?: { value: number; scale: number };
  budgetPerYear: Money;
  english: EnglishStatus;
  fieldOfInterest: string;
  careerGoal: string;
  /** Ordered preference of destination country codes; empty = open to anywhere */
  geographyPreference: string[];
  homeCity?: string;
}

// ── Universities ───────────────────────────────────────────────────────────

export type DegreeLevel = "bachelor" | "master";

export interface Program {
  id: string;
  name: string;
  degree: DegreeLevel;
  field: string;
  durationYears: number;
  languageOfInstruction: string;
  tuitionPerYear: DataPoint<Money>;
}

export type RequirementKey =
  | "ielts_min"
  | "toefl_min"
  | "gpa_min"
  | "entrance_exam"
  | "document"
  | "application_fee";

export interface Requirement {
  id: string;
  key: RequirementKey;
  label: string;
  /** Threshold or descriptive value ("6.0", "Motivation letter") */
  requirement: DataPoint<string | number>;
  notes?: string;
}

export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  founded: DataPoint<number>;
  languagesOfInstruction: string[];
  tuitionPerYear: DataPoint<Money>;
  livingCostPerYear: DataPoint<Money>;
  applicationFee: DataPoint<Money>;
  acceptanceRate: DataPoint<number>; // 0–1
  applicationDeadline: DataPoint<string>; // ISO date
  ieltsMinimum: DataPoint<number>;
  requirements: Requirement[];
  programs: Program[];
  scholarshipIds: string[];
  about?: string;
}

// ── Scholarships ───────────────────────────────────────────────────────────

export type ScholarshipAward =
  | { kind: "percent_tuition"; percent: number }
  | { kind: "amount"; money: Money }
  | { kind: "full_ride" };

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  type: "merit" | "need" | "government" | "university";
  award: DataPoint<ScholarshipAward>;
  deadline: DataPoint<string>;
  eligibilitySummary: string;
  universityIds: string[];
  applicationUrl?: string;
}

// ── Fit score ──────────────────────────────────────────────────────────────
// Student-facing name is simply "fit". Internal composite name must not
// appear in student UI.

export type FitComponentKey =
  | "academic"
  | "financial"
  | "language"
  | "career"
  | "geographic";

export interface FitComponent {
  key: FitComponentKey;
  /** Plain-English label, e.g. "Financial fit" */
  label: string;
  /** 0–100 */
  score: number;
  /** One-line plain-language reason, e.g. "Your IELTS 6.5 clears their 6.0 minimum" */
  reason: string;
}

export interface FitScore {
  universityId: string;
  /** 0–100 — never displayed without the five components available on expand */
  overall: number;
  components: [
    FitComponent,
    FitComponent,
    FitComponent,
    FitComponent,
    FitComponent
  ];
  computedAt: string;
}

// ── Pathway ────────────────────────────────────────────────────────────────

export interface PathwayMonth {
  /** "2026-08" */
  month: string;
  title: string;
  items: string[];
}

export interface Pathway {
  id: string;
  createdAt: string;
  profileSnapshot: StudentProfile;
  /** AI-written strategy summary (sample fixture in Phase 1) */
  strategySummary: string;
  rankedUniversityIds: string[];
  fitScores: FitScore[];
  matchedScholarshipIds: string[];
  actionPlan: PathwayMonth[];
  savedAt?: string;
}

// ── AI tools ───────────────────────────────────────────────────────────────

export type AIToolId =
  | "pathway_generator"
  | "scholarship_finder"
  | "skill_gap"
  | "country_fit"
  | "career_projection";

/** Structured AI output. `refusal` is a first-class, designed outcome. */
export type AIResult<T> =
  | { status: "ok"; data: T; caveats?: string[] }
  | {
      status: "refusal";
      /** What the counselor does not have data for */
      explanation: string;
      /** The clarifying question it asks instead */
      clarifyingQuestion: string;
    };
