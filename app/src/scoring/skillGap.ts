import type { DataPoint, StudentProfile, University } from '../types'

export const SKILL_GAP_VERSION = 'skill-gap-v0.1'

/** The tests a student can hold a score for, in the order a student meets them. */
export type SkillGapTest = 'ielts' | 'toefl' | 'duolingo' | 'sat' | 'act' | 'gpa'

export const SKILL_GAP_TESTS: readonly SkillGapTest[] = [
  'ielts',
  'toefl',
  'duolingo',
  'sat',
  'act',
  'gpa',
]

export const testLabels: Record<SkillGapTest, string> = {
  ielts: 'IELTS',
  toefl: 'TOEFL iBT',
  duolingo: 'Duolingo',
  sat: 'SAT',
  act: 'ACT',
  gpa: 'GPA',
}

/**
 * What the comparison could honestly conclude.
 *
 * `met` and `short` are the ONLY outcomes that assert anything about whether a
 * student clears a bar, and they are reachable only from an `admission_minimum`.
 * Everything else records why no such claim can be made.
 */
export type SkillGapStatus =
  /** Student's score is at or above a published admission minimum. */
  | 'met'
  /** Student's score is below a published admission minimum. */
  | 'short'
  /** A figure is published but the university states it is not a cutoff. */
  | 'not_a_cutoff'
  /** The number gates a scholarship or an English route, not admission. */
  | 'other_purpose'
  /** The university publishes no comparable number. */
  | 'not_published'
  /** The student has not given us a score to compare. */
  | 'no_student_score'

export type SkillGapItem = {
  test: SkillGapTest
  label: string
  status: SkillGapStatus
  /** The student's own score, when they have entered one. */
  studentScore: number | null
  /** The published number, when one exists. Never invented. */
  publishedValue: number | null
  /** The published text in full, so the qualifier travels with the number. */
  publishedText: string | null
  /**
   * How far below the minimum the student is. Non-null ONLY when status is
   * 'short', because a distance to a bar that does not exist is meaningless.
   */
  shortfall: number | null
  sourceId: string | null
  /** Present when the university publishes nothing, straight from the source. */
  unknownReason: string | null
  suggestedAction: string | null
  /** One plain sentence a seventeen year old can act on. */
  message: string
}

export type SkillGapReport = {
  version: string
  universityId: string
  universityName: string
  items: SkillGapItem[]
  /** Counts of the only two statuses that assert a bar was cleared or missed. */
  metCount: number
  shortCount: number
  /** True when nothing could be compared at all. */
  hasNoComparableRequirement: boolean
  /** True when the student holds no score, so there is nothing to compare from. */
  hasNoStudentScores: boolean
  summary: string
}

/** Rounds to two decimals so 0.30000000000000004 never reaches a student. */
function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function studentScoreFor(profile: StudentProfile, test: SkillGapTest): number | null {
  if (test === 'gpa') return profile.gpa
  if (test === 'sat' || test === 'act') {
    return profile.admissionTest === test ? profile.admissionTestScore : null
  }
  return profile.languageTest === test ? profile.languageScore : null
}

/**
 * The tests worth reporting on for this student.
 *
 * A student sits one English test and at most one admission test, so listing
 * all six turns a short, actionable page into five rows of filler per
 * university. Only tests the student actually holds a score for are reported;
 * the rest are surfaced once, as a prompt to add a score, rather than repeated
 * as empty rows against every university.
 */
export function relevantTests(profile: StudentProfile): SkillGapTest[] {
  const tests: SkillGapTest[] = []
  if (profile.languageTest !== null && profile.languageScore !== null) tests.push(profile.languageTest)
  if (profile.admissionTest !== null && profile.admissionTestScore !== null) tests.push(profile.admissionTest)
  if (profile.gpa !== null) tests.push('gpa')
  return tests
}

/**
 * Compares one published requirement against one student score.
 *
 * The order of these branches is the safety property: the classification is
 * consulted BEFORE any arithmetic, so a figure that is not an admission minimum
 * can never reach the comparison that produces 'met' or 'short'.
 */
export function evaluateRequirement(
  test: SkillGapTest,
  point: DataPoint<string>,
  studentScore: number | null,
): SkillGapItem {
  const label = testLabels[test]

  if (point.status === 'unknown') {
    return {
      test,
      label,
      status: 'not_published',
      studentScore,
      publishedValue: null,
      publishedText: null,
      shortfall: null,
      sourceId: null,
      unknownReason: point.reason,
      suggestedAction: point.suggestedAction,
      message: `${label}: this university has not published a figure, so there is nothing to measure yourself against.`,
    }
  }

  const publishedText = point.value
  const sourceId = point.sourceId
  const publishedValue = point.numericValue ?? null
  const benchmark = point.benchmark ?? 'none'

  if (publishedValue === null || benchmark === 'none') {
    return {
      test,
      label,
      status: 'not_published',
      studentScore,
      publishedValue: null,
      publishedText,
      shortfall: null,
      sourceId,
      unknownReason: null,
      suggestedAction: null,
      message: `${label}: the university publishes guidance but no number, so no gap can be measured.`,
    }
  }

  if (benchmark === 'indicative') {
    return {
      test,
      label,
      status: 'not_a_cutoff',
      studentScore,
      publishedValue,
      publishedText,
      shortfall: null,
      sourceId,
      unknownReason: null,
      suggestedAction: null,
      message: `${label}: ${publishedValue} is published as a guide, and the university states it is not a minimum. Being under it does not mean you fall short.`,
    }
  }

  if (benchmark === 'scholarship_threshold') {
    return {
      test,
      label,
      status: 'other_purpose',
      studentScore,
      publishedValue,
      publishedText,
      shortfall: null,
      sourceId,
      unknownReason: null,
      suggestedAction: null,
      message: `${label}: ${publishedValue} opens a published scholarship, not admission. Reaching it is money, not entry.`,
    }
  }

  if (benchmark === 'english_proficiency_alternative') {
    return {
      test,
      label,
      status: 'other_purpose',
      studentScore,
      publishedValue,
      publishedText,
      shortfall: null,
      sourceId,
      unknownReason: null,
      suggestedAction: null,
      message: `${label}: ${publishedValue} is one way to satisfy the English requirement, not an admission bar.`,
    }
  }

  // Only an admission_minimum reaches here.
  if (studentScore === null) {
    return {
      test,
      label,
      status: 'no_student_score',
      studentScore: null,
      publishedValue,
      publishedText,
      shortfall: null,
      sourceId,
      unknownReason: null,
      suggestedAction: null,
      message: `${label}: the published minimum is ${publishedValue}. Add your score to see where you stand.`,
    }
  }

  const difference = round2(studentScore - publishedValue)
  if (difference >= 0) {
    return {
      test,
      label,
      status: 'met',
      studentScore,
      publishedValue,
      publishedText,
      shortfall: null,
      sourceId,
      unknownReason: null,
      suggestedAction: null,
      message: `${label}: your ${studentScore} meets the published minimum of ${publishedValue}.`,
    }
  }

  return {
    test,
    label,
    status: 'short',
    studentScore,
    publishedValue,
    publishedText,
    shortfall: round2(Math.abs(difference)),
    sourceId,
    unknownReason: null,
    suggestedAction: null,
    message: `${label}: your ${studentScore} is ${round2(Math.abs(difference))} below the published minimum of ${publishedValue}.`,
  }
}

/**
 * Builds the full report for one university.
 *
 * Deterministic and clock-free, like Φ. It states what is published and what the
 * student entered; it never predicts an admission decision, and it never
 * produces a gap against a number the university did not set as a bar.
 */
export function analyseSkillGap(
  profile: StudentProfile,
  university: University,
): SkillGapReport {
  const tests = relevantTests(profile)
  const items = tests.map((test) =>
    evaluateRequirement(test, university[test], studentScoreFor(profile, test)),
  )

  const metCount = items.filter((item) => item.status === 'met').length
  const shortCount = items.filter((item) => item.status === 'short').length
  const comparable = items.filter(
    (item) => item.status === 'met' || item.status === 'short' || item.status === 'no_student_score',
  )
  const hasNoStudentScores = tests.length === 0
  const hasNoComparableRequirement = !hasNoStudentScores && comparable.length === 0

  let summary: string
  if (hasNoStudentScores) {
    summary = 'Add a test score to your plan and your gaps for this university appear here.'
  } else if (hasNoComparableRequirement) {
    summary = `${university.name} publishes no admission minimum among these tests, so there is no gap to close. That is the university's choice not to publish, not a gap in your record.`
  } else if (shortCount === 0 && metCount > 0) {
    summary = `You meet every published minimum ${university.name} states, ${metCount === 1 ? 'on the one test' : `across ${metCount} tests`} we can compare. Meeting a minimum is not an admission decision.`
  } else if (shortCount > 0) {
    summary = `${shortCount} published minimum${shortCount === 1 ? '' : 's'} at ${university.name} ${shortCount === 1 ? 'is' : 'are'} above your entered score${shortCount === 1 ? '' : 's'}. Each one below is a specific, closeable number.`
  } else {
    summary = `${university.name} publishes minimums, but you have not entered a score to compare yet.`
  }

  return {
    version: SKILL_GAP_VERSION,
    universityId: university.id,
    universityName: university.name,
    items,
    metCount,
    shortCount,
    hasNoComparableRequirement,
    hasNoStudentScores,
    summary,
  }
}

/** Reports for a set of universities, ordered as supplied. */
export function analyseSkillGaps(
  profile: StudentProfile,
  universities: readonly University[],
): SkillGapReport[] {
  return universities.map((university) => analyseSkillGap(profile, university))
}
