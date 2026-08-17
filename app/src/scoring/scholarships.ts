import type { AwardCondition, Scholarship, StudentProfile, University } from '../types'

export const SCHOLARSHIP_MATCH_VERSION = 'scholarship-match-v0.1'

/**
 * The only student data award conditions are ever checked against.
 *
 * Deliberately narrower than StudentProfile: a visitor can use this tool without
 * an account, a destination, a budget or a subject, so the function must not
 * require values nobody has given it. A full StudentProfile satisfies this shape.
 */
export type AwardScores = Pick<
  StudentProfile,
  'languageTest' | 'languageScore' | 'admissionTest' | 'admissionTestScore' | 'gpa'
>

export const emptyAwardScores: AwardScores = {
  languageTest: null,
  languageScore: null,
  admissionTest: null,
  admissionTestScore: null,
  gpa: null,
}

/** True when nothing has been entered, so no condition can be checked. */
export function hasAnyScore(scores: AwardScores): boolean {
  return scores.languageScore !== null || scores.admissionTestScore !== null || scores.gpa !== null
}

/**
 * Where a student stands against ONE published condition of an award.
 */
export type ConditionOutcome = {
  kind: AwardCondition['kind']
  label: string
  minimum: number
  studentValue: number | null
  status: 'met' | 'short' | 'no_student_value'
  shortfall: number | null
  publishedText: string
  sourceId: string
}

/**
 * How an award relates to this student.
 *
 * `reachable` is the only value that says the student meets what the award
 * publishes, and it requires EVERY published condition to be met. `partly_met`
 * exists so that meeting the score half of a two-part tier is never rendered as
 * success — that was the specific way this tool could have lied.
 */
export type AwardStatus =
  /** Every published condition is met. */
  | 'reachable'
  /** At least one condition met, at least one missed. */
  | 'partly_met'
  /** No condition met. */
  | 'not_yet'
  /** Conditions are published but the student has not given us the values. */
  | 'needs_your_scores'
  /** The university publishes no criteria for this award at all. */
  | 'no_published_criteria'

export type AwardReport = {
  scholarshipId: string
  name: string
  universityId: string
  universityName: string
  /** The published amount, or null when the university publishes no single figure. */
  amountText: string | null
  amountNumeric: number | null
  currency: string | null
  amountSourceId: string | null
  /** The university's own reason for publishing no amount. Never our words. */
  amountUnknownReason: string | null
  amountSuggestedAction: string | null
  status: AwardStatus
  conditions: ConditionOutcome[]
  metCount: number
  /** Conditions the student misses. Empty unless status is partly_met or not_yet. */
  missing: ConditionOutcome[]
  message: string
}

export type ScholarshipReport = {
  version: string
  awards: AwardReport[]
  reachableCount: number
  /** Awards whose universities publish no criteria we can check. */
  unconditionedCount: number
}

const conditionLabels: Record<AwardCondition['kind'], string> = {
  ielts: 'IELTS',
  toefl: 'TOEFL iBT',
  duolingo: 'Duolingo',
  sat: 'SAT',
  act: 'ACT',
  gpa: 'GPA',
}

/** Score conditions are alternatives to one another; GPA applies in addition. */
const scoreKinds: AwardCondition['kind'][] = ['sat', 'act', 'ielts', 'toefl', 'duolingo']

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function studentValueFor(scores: AwardScores, kind: AwardCondition['kind']): number | null {
  if (kind === 'gpa') return scores.gpa
  if (kind === 'sat' || kind === 'act') {
    return scores.admissionTest === kind ? scores.admissionTestScore : null
  }
  return scores.languageTest === kind ? scores.languageScore : null
}

function evaluateCondition(scores: AwardScores, condition: AwardCondition): ConditionOutcome {
  const label = conditionLabels[condition.kind]
  const studentValue = studentValueFor(scores, condition.kind)
  const base = {
    kind: condition.kind,
    label,
    minimum: condition.minimum,
    studentValue,
    publishedText: condition.publishedText,
    sourceId: condition.sourceId,
  }
  if (studentValue === null) {
    return { ...base, status: 'no_student_value', shortfall: null }
  }
  if (studentValue >= condition.minimum) {
    return { ...base, status: 'met', shortfall: null }
  }
  return { ...base, status: 'short', shortfall: round2(condition.minimum - studentValue) }
}

/**
 * Evaluates one award for one student.
 *
 * The rule that matters: an award is `reachable` only when every condition it
 * publishes is satisfied. Alabama's $28,000 tier names SAT 1420 AND GPA 3.5, so
 * a student with SAT 1420 and GPA 2.9 is reported as partly met, with the GPA
 * named as what is missing — never as someone who reaches the award.
 */
export function evaluateAward(
  scores: AwardScores,
  scholarship: Scholarship,
  university: University,
): AwardReport {
  const conditions = (scholarship.conditions ?? []).map((condition) =>
    evaluateCondition(scores, condition),
  )
  const amount = scholarship.amount

  const base = {
    scholarshipId: scholarship.id,
    name: scholarship.name,
    universityId: university.id,
    universityName: university.name,
    amountText: amount.status === 'known' ? amount.value : null,
    amountNumeric: amount.status === 'known' ? amount.numericValue ?? null : null,
    currency: amount.status === 'known' ? amount.currency ?? null : null,
    amountSourceId: amount.status === 'known' ? amount.sourceId : null,
    amountUnknownReason: amount.status === 'unknown' ? amount.reason : null,
    amountSuggestedAction: amount.status === 'unknown' ? amount.suggestedAction : null,
    conditions,
  }

  if (conditions.length === 0) {
    return {
      ...base,
      status: 'no_published_criteria',
      metCount: 0,
      missing: [],
      message: `${university.name} publishes this award but not the criteria for it. It cannot be assessed from published information alone.`,
    }
  }

  // A student reaching the SAT bar has satisfied the score family even though the
  // ACT row is unmet, because the university offers them as alternatives.
  const scoreConditions = conditions.filter((item) => scoreKinds.includes(item.kind))
  const otherConditions = conditions.filter((item) => !scoreKinds.includes(item.kind))
  const scoreSatisfied = scoreConditions.length === 0 || scoreConditions.some((item) => item.status === 'met')
  const scoreAttempted = scoreConditions.some((item) => item.status !== 'no_student_value')
  const othersSatisfied = otherConditions.every((item) => item.status === 'met')
  const othersAttempted = otherConditions.every((item) => item.status !== 'no_student_value')

  const missing = [
    ...(scoreSatisfied ? [] : scoreConditions.filter((item) => item.status === 'short')),
    ...otherConditions.filter((item) => item.status === 'short'),
  ]
  const metCount = conditions.filter((item) => item.status === 'met').length

  if (!scoreAttempted || !othersAttempted) {
    const needed = [
      ...(scoreAttempted ? [] : [scoreConditions.map((item) => item.label).join(' or ')]),
      ...(othersAttempted ? [] : otherConditions.filter((item) => item.status === 'no_student_value').map((item) => item.label)),
    ].filter(Boolean)
    return {
      ...base,
      status: 'needs_your_scores',
      metCount,
      missing: [],
      message: `This award publishes conditions on ${needed.join(' and ')}. Add ${needed.length === 1 ? 'that' : 'those'} to your plan to see where you stand.`,
    }
  }

  if (scoreSatisfied && othersSatisfied) {
    return {
      ...base,
      status: 'reachable',
      metCount,
      missing: [],
      message: `You meet every condition ${university.name} publishes for this award. Meeting published conditions is not an offer of the award.`,
    }
  }

  const missingText = missing.map((item) => `${item.label} by ${item.shortfall}`).join(' and ')
  if (metCount > 0) {
    return {
      ...base,
      status: 'partly_met',
      metCount,
      missing,
      message: `You meet part of what this award publishes, but not all of it. Still short on ${missingText}.`,
    }
  }
  return {
    ...base,
    status: 'not_yet',
    metCount,
    missing,
    message: `You do not yet meet the conditions this award publishes. Short on ${missingText}.`,
  }
}

export function analyseScholarships(
  scores: AwardScores,
  universities: readonly University[],
): ScholarshipReport {
  const awards = universities.flatMap((university) =>
    university.scholarships.map((scholarship) => evaluateAward(scores, scholarship, university)),
  )
  // Awards the student can act on come first; awards nobody can assess come last.
  const order: Record<AwardStatus, number> = {
    reachable: 0,
    partly_met: 1,
    not_yet: 2,
    needs_your_scores: 3,
    no_published_criteria: 4,
  }
  awards.sort((left, right) => order[left.status] - order[right.status])

  return {
    version: SCHOLARSHIP_MATCH_VERSION,
    awards,
    reachableCount: awards.filter((award) => award.status === 'reachable').length,
    unconditionedCount: awards.filter((award) => award.status === 'no_published_criteria').length,
  }
}
