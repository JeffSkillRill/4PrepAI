import type { AdmissionTest, LanguageTest, StudentProfile } from '../types'
import { admissionTestRanges, languageTestRanges } from '../types'

/**
 * The single definition of what the intake asks.
 *
 * The wizard and the per-answer editor on the plan page both read this list, so
 * a question can never mean one thing when first answered and another when
 * changed later. Adding a question here adds it to both places at once.
 */
export type IntakeStepId =
  | 'country'
  | 'field'
  | 'academic'
  | 'budget'
  | 'language'
  | 'admissionTest'
  | 'gpa'
  | 'intake'

export type IntakeDraft = {
  country: string | null
  field: string | null
  academic: string | null
  budget: string | null
  languageTest: LanguageTest | null
  languageScore: number | null
  needsLanguagePathway: boolean
  languageAnswered: boolean
  admissionTest: AdmissionTest | null
  admissionTestScore: number | null
  admissionAnswered: boolean
  gpa: number | null
  gpaAnswered: boolean
  intake: string | null
}

export const emptyDraft: IntakeDraft = {
  country: null,
  field: null,
  academic: null,
  budget: null,
  languageTest: null,
  languageScore: null,
  needsLanguagePathway: false,
  languageAnswered: false,
  admissionTest: null,
  admissionTestScore: null,
  admissionAnswered: false,
  gpa: null,
  gpaAnswered: false,
  intake: null,
}

export const countryOptions = ['United States']
export const fieldOptions = ['Computer Science', 'Business & Management', 'Engineering', 'Data & Analytics']
export const academicOptions = ['Strong in relevant subjects', 'Generally on track', 'Some gaps to address', 'I am not sure yet']
export const budgetOptions = ['US$5,000', 'US$8,000', 'US$12,000', 'US$15,000', 'Still working it out']
export const intakeOptions = ['Spring 2027', 'Fall 2027', 'I am flexible']

const academicMap: Record<string, number | null> = {
  'Strong in relevant subjects': 90,
  'Generally on track': 72,
  'Some gaps to address': 50,
  'I am not sure yet': null,
}

const budgetMap: Record<string, { amount: number | null; currency: string | null }> = {
  'US$5,000': { amount: 5000, currency: 'USD' },
  'US$8,000': { amount: 8000, currency: 'USD' },
  'US$12,000': { amount: 12000, currency: 'USD' },
  'US$15,000': { amount: 15000, currency: 'USD' },
  'Still working it out': { amount: null, currency: null },
}

function academicLabelFor(score: number | null): string {
  const found = Object.entries(academicMap).find(([, value]) => value === score)
  return found ? found[0] : 'I am not sure yet'
}

function budgetLabelFor(amount: number | null): string {
  const found = Object.entries(budgetMap).find(([, value]) => value.amount === amount)
  return found ? found[0] : 'Still working it out'
}

export type IntakeStep = {
  id: IntakeStepId
  eyebrow: string
  title: string
  detail: string
  /** Short label used on the plan summary. */
  summaryLabel: string
  /** Optional steps can be left unanswered without blocking the plan. */
  optional: boolean
}

export const intakeSteps: IntakeStep[] = [
  { id: 'country', eyebrow: 'Your destination', title: 'Where would you like to study?', detail: 'This catalogue is currently dedicated to United States pathways.', summaryLabel: 'Destination', optional: false },
  { id: 'field', eyebrow: 'Your subject', title: 'What do you want to study?', detail: 'Pick a broad field for now—we will match against published programs.', summaryLabel: 'Subject', optional: false },
  { id: 'academic', eyebrow: 'Your academics', title: 'How ready is your academic record?', detail: 'This is a self-assessment only. Formal requirements still need evidence.', summaryLabel: 'Academic readiness', optional: false },
  { id: 'budget', eyebrow: 'Your budget', title: 'What annual budget feels realistic?', detail: 'US catalogue figures are stored in USD. Φ compares published net-cost scenarios without inventing exchange rates.', summaryLabel: 'Annual budget', optional: false },
  { id: 'language', eyebrow: 'Your English test', title: 'Which English test do you have, and what did you score?', detail: 'Enter the score you actually received. We compare it only against minimums a university genuinely publishes.', summaryLabel: 'English test', optional: false },
  { id: 'admissionTest', eyebrow: 'Your admission test', title: 'Do you have an SAT or ACT score?', detail: 'Most students sit one or neither. Many US universities are test-optional, so skipping this is a normal answer.', summaryLabel: 'SAT or ACT', optional: true },
  { id: 'gpa', eyebrow: 'Your grades', title: 'What is your GPA?', detail: 'On the 0 to 4.0 scale. Skip it if your school uses a different scale and you have not converted it.', summaryLabel: 'GPA', optional: true },
  { id: 'intake', eyebrow: 'Your timing', title: 'When would you like to begin?', detail: 'We will keep this preference in your pathway summary.', summaryLabel: 'Start date', optional: false },
]

/** A step counts as answered when it holds a value, or was deliberately skipped. */
export function isStepAnswered(draft: IntakeDraft, id: IntakeStepId): boolean {
  switch (id) {
    case 'country': return draft.country !== null
    case 'field': return draft.field !== null
    case 'academic': return draft.academic !== null
    case 'budget': return draft.budget !== null
    case 'language': return draft.languageAnswered
    case 'admissionTest': return draft.admissionAnswered
    case 'gpa': return draft.gpaAnswered
    case 'intake': return draft.intake !== null
  }
}

export function isDraftComplete(draft: IntakeDraft): boolean {
  return intakeSteps.every((step) => step.optional || isStepAnswered(draft, step.id))
}

export function profileFromDraft(draft: IntakeDraft): StudentProfile {
  const budget = budgetMap[draft.budget ?? 'Still working it out'] ?? { amount: null, currency: null }
  return {
    country: draft.country ?? 'United States',
    field: draft.field ?? fieldOptions[0],
    academicScore: academicMap[draft.academic ?? 'I am not sure yet'] ?? null,
    budgetMax: budget.amount,
    budgetCurrency: budget.currency,
    // The pair is kept whole in both directions; the database refuses half of it.
    languageTest: draft.languageScore === null ? null : draft.languageTest,
    languageScore: draft.languageTest === null ? null : draft.languageScore,
    admissionTest: draft.admissionTestScore === null ? null : draft.admissionTest,
    admissionTestScore: draft.admissionTest === null ? null : draft.admissionTestScore,
    gpa: draft.gpa,
    needsLanguagePathway: draft.needsLanguagePathway,
    intake: draft.intake ?? intakeOptions[0],
  }
}

export function draftFromProfile(profile: StudentProfile): IntakeDraft {
  return {
    country: profile.country,
    field: profile.field,
    academic: academicLabelFor(profile.academicScore),
    budget: budgetLabelFor(profile.budgetMax),
    languageTest: profile.languageTest,
    languageScore: profile.languageScore,
    needsLanguagePathway: profile.needsLanguagePathway,
    languageAnswered: true,
    admissionTest: profile.admissionTest,
    admissionTestScore: profile.admissionTestScore,
    admissionAnswered: true,
    gpa: profile.gpa,
    gpaAnswered: true,
    intake: profile.intake,
  }
}

/** One-line answer for the plan summary. Never invents a value it does not hold. */
export function summaryValue(draft: IntakeDraft, id: IntakeStepId): string {
  switch (id) {
    case 'country': return draft.country ?? 'Not set'
    case 'field': return draft.field ?? 'Not set'
    case 'academic': return draft.academic ?? 'Not set'
    case 'budget': return draft.budget ?? 'Not set'
    case 'language':
      if (draft.needsLanguagePathway) return 'Needs a language pathway'
      if (draft.languageTest === null || draft.languageScore === null) return 'No test yet'
      return `${languageTestRanges[draft.languageTest].label} ${draft.languageScore}`
    case 'admissionTest':
      if (draft.admissionTest === null || draft.admissionTestScore === null) return 'Not taken'
      return `${admissionTestRanges[draft.admissionTest].label} ${draft.admissionTestScore}`
    case 'gpa': return draft.gpa === null ? 'Not provided' : `${draft.gpa} / 4.0`
    case 'intake': return draft.intake ?? 'Not set'
  }
}

/**
 * Validates a typed score against the published reporting range for its test.
 * Returns an error message a student can act on, or null when acceptable.
 * Mirrors the database check constraints so the two cannot disagree.
 */
export function validateScore(
  test: LanguageTest | AdmissionTest | null,
  raw: string,
): string | null {
  if (test === null) return null
  if (raw.trim() === '') return 'Enter your score'
  const value = Number(raw)
  if (!Number.isFinite(value)) return 'Enter a number'
  const range = test in languageTestRanges
    ? languageTestRanges[test as LanguageTest]
    : admissionTestRanges[test as AdmissionTest]
  if (value < range.min || value > range.max) {
    return `${range.label} scores run from ${range.min} to ${range.max}`
  }
  return null
}

export function validateGpa(raw: string): string | null {
  if (raw.trim() === '') return null
  const value = Number(raw)
  if (!Number.isFinite(value)) return 'Enter a number'
  if (value < 0 || value > 4) return 'GPA runs from 0 to 4.0'
  return null
}
