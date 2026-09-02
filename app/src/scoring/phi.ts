import type { DataPoint, FitComponent, FitDimension, FitScore, StudentProfile, University } from '../types'
import { admissionTestRanges } from '../types'
import {
  bestPublishedCostScenario,
  hasComprehensiveInternationalFunding,
  hasFullNeedPolicy,
} from './costs'

export const PHI_VERSION = 'phi-v0.3'

export type PhiWeights = {
  academic: number
  financial: number
  language: number
  career: number
  geographic: number
}

// Φ v0.3 weights. Academic and financial carry the most signal. Geographic is a
// near-constant while the catalogue is single-country, so it is a tie-breaker
// only and — like every component — drops out of the average when it cannot be
// resolved from published data, rather than being nudged to a neutral midpoint.
const ACADEMIC_WEIGHT = 0.3
const FINANCIAL_WEIGHT = 0.28
const LANGUAGE_WEIGHT = 0.22
const CAREER_WEIGHT = 0.15
const GEOGRAPHIC_WEIGHT = 0.05

export const PHI_WEIGHTS: PhiWeights = {
  academic: ACADEMIC_WEIGHT,
  financial: FINANCIAL_WEIGHT,
  language: LANGUAGE_WEIGHT,
  career: CAREER_WEIGHT,
  geographic: GEOGRAPHIC_WEIGHT,
}
export const DEFAULT_PHI_WEIGHTS = PHI_WEIGHTS

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function gradeForScore(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'A−'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C+'
  if (score >= 40) return 'C'
  return 'D'
}

function toneForScore(score: number): FitComponent['tone'] {
  if (score >= 70) return 'strong'
  if (score >= 45) return 'medium'
  return 'weak'
}

function component(label: string, score: number, reason: string, resolved = true): FitComponent {
  const bounded = clamp(score)
  const honestReason = reason.includes('not an admission prediction')
    ? reason
    : `${reason} This is guidance, not an admission prediction.`
  return { label, score: bounded, grade: gradeForScore(bounded), tone: toneForScore(bounded), reason: honestReason, resolved }
}

export function numericPart(point: DataPoint<string>): number | null {
  return point.status === 'known' && point.numericValue !== undefined ? point.numericValue : null
}

function matchingPrograms(profile: StudentProfile, university: University) {
  const wanted = profile.field.toLowerCase()
  return university.programs.filter((program) => {
    const field = program.field.toLowerCase()
    const name = program.name.toLowerCase()
    return field === wanted || field.includes(wanted) || wanted.includes(field) || name.includes(wanted)
  })
}

// Φ v0.3 is intentionally transparent, monotonic, bounded, and deterministic.
// It performs no currency conversion. Components that cannot be resolved from
// published, cited data are excluded from the overall (weights renormalize over
// the resolved ones) instead of being pushed to a neutral midpoint.
export function computeFit(
  profile: StudentProfile,
  university: University,
  weights: PhiWeights = PHI_WEIGHTS,
): FitScore {
  // --- Academic: student vs THIS university's published bar ------------------
  const testRange = profile.admissionTest ? admissionTestRanges[profile.admissionTest] : null
  const testBenchmark = profile.admissionTest ? numericPart(university[profile.admissionTest]) : null
  let testSub: number | null = null
  let testReason = ''
  if (profile.admissionTest && profile.admissionTestScore !== null && testRange && testBenchmark !== null) {
    const span = Math.max(testRange.max - testRange.min, 1)
    const studentScore = profile.admissionTestScore
    const margin = (studentScore - testBenchmark) / span
    testSub = clamp(70 + margin * 120)
    testReason = `your ${testRange.label} ${studentScore} ${studentScore >= testBenchmark ? 'is at or above' : 'is below'} this school's published ${testBenchmark} benchmark`
  }

  const gpaBenchmark = numericPart(university.gpa)
  let gpaSub: number | null = null
  let gpaReason = ''
  if (profile.gpa !== null && gpaBenchmark !== null) {
    const studentGpa = profile.gpa
    gpaSub = clamp(70 + ((studentGpa - gpaBenchmark) / 4) * 120)
    gpaReason = `your GPA ${studentGpa} ${studentGpa >= gpaBenchmark ? 'meets or exceeds' : 'is below'} the published ${gpaBenchmark} benchmark`
  }

  const academicSubs = [testSub, gpaSub].filter((value): value is number => value !== null)
  let academic: FitComponent
  if (academicSubs.length > 0) {
    const reasons = [testReason, gpaReason].filter((entry) => entry.length > 0)
    const mean = academicSubs.reduce((sum, value) => sum + value, 0) / academicSubs.length
    academic = component(
      'Academic fit',
      mean,
      `Compared with published admitted-student figures: ${reasons.join('; ')}. Based on published admitted ranges, not an admission prediction.`,
    )
  } else {
    const why = profile.admissionTest === null || profile.admissionTestScore === null
      ? 'no admission test score was entered and no comparable GPA benchmark is published'
      : 'this school publishes no comparable test or GPA benchmark to compare against'
    academic = component(
      'Academic fit',
      profile.academicScore ?? 50,
      `Academic fit is unresolved because ${why}; it is left out of the overall rather than guessed.`,
      false,
    )
  }

  // --- Financial (same logic; unknowns now drop out of the overall) ----------
  const costScenario = bestPublishedCostScenario(university)
  let financial: FitComponent
  if (profile.budgetMax === null || profile.budgetCurrency === null) {
    financial = component('Financial fit', 50, 'You have not set a budget and currency, so financial fit remains unresolved.', false)
  } else if (hasFullNeedPolicy(university)) {
    financial = component(
      'Financial fit',
      70,
      'The university publishes a full-demonstrated-need policy for international students; personal net cost requires an individual aid calculation and is not treated as zero.',
    )
  } else if (hasComprehensiveInternationalFunding(university)) {
    financial = component(
      'Financial fit',
      65,
      'The university publishes comprehensive funding for enrolled international students, but no single post-aid price; personal net cost is unresolved and is not treated as zero.',
    )
  } else if (costScenario === null) {
    financial = component('Financial fit', 50, 'A sourced annual cost of attendance or a computable aid-adjusted net cost is missing, so this option is not excluded.', false)
  } else if (costScenario.currency !== profile.budgetCurrency) {
    financial = component(
      'Financial fit',
      50,
      `Published costs cannot be compared with your ${profile.budgetCurrency} budget without an exchange-rate estimate, which Φ does not make.`,
      false,
    )
  } else {
    const ratio = profile.budgetMax / Math.max(costScenario.netCost, 1)
    const score = ratio >= 1 ? 70 + Math.min(30, (ratio - 1) * 30) : ratio * 70
    const aidLabel = costScenario.publishedAid > 0
      ? ` after subtracting the largest published annual institutional award (${costScenario.currency} ${costScenario.publishedAid.toLocaleString()}); award eligibility is not assumed`
      : ' before any unpublished or individualized aid'
    financial = component(
      'Financial fit',
      score,
      ratio >= 1
        ? `The published annual net-cost scenario fits your ${profile.budgetCurrency} ceiling${aidLabel}.`
        : `The published annual net-cost scenario is above your ${profile.budgetCurrency} ceiling${aidLabel}.`,
    )
  }

  // --- Language (same logic; unknowns now drop out of the overall) -----------
  const languagePoint = profile.languageTest ? university[profile.languageTest] : null
  const requiredLanguage = languagePoint ? numericPart(languagePoint) : null
  let language: FitComponent
  if (profile.languageScore === null || profile.languageTest === null) {
    language = component(
      'Language fit',
      profile.needsLanguagePathway ? 30 : 45,
      profile.needsLanguagePathway
        ? 'You asked for a language pathway; confirm whether one is available.'
        : 'No test score was entered, so language readiness remains unresolved.',
      false,
    )
  } else if (requiredLanguage === null) {
    language = component('Language fit', 50, `A numeric ${profile.languageTest.toUpperCase()} minimum is not published, so readiness cannot be confirmed.`, false)
  } else {
    const gap = profile.languageScore - requiredLanguage
    const scale = profile.languageTest === 'ielts' ? 40 : profile.languageTest === 'toefl' ? 1.5 : 1.2
    const testName = profile.languageTest === 'ielts'
      ? 'IELTS'
      : profile.languageTest === 'toefl'
        ? 'TOEFL'
        : 'Duolingo'
    language = component(
      'Language fit',
      70 + gap * scale,
      gap >= 0
        ? `Your entered ${testName} score meets the published ${requiredLanguage} benchmark.`
        : `Your entered ${testName} score is below the published ${requiredLanguage} benchmark.`,
    )
  }

  // --- Career: published-program depth for the student's field ---------------
  const matches = matchingPrograms(profile, university)
  const wanted = profile.field.toLowerCase()
  const hasExact = university.programs.some((program) => program.field.toLowerCase() === wanted || program.name.toLowerCase() === wanted)
  let career: FitComponent
  if (matches.length === 0) {
    career = component('Career fit', 50, `No published program clearly matches ${profile.field}; needs a course-by-course review.`, false)
  } else if (hasExact && matches.length >= 2) {
    career = component('Career fit', 85, `${matches.length} published programs match ${profile.field}, including an exact major; strong published course support.`)
  } else {
    career = component(
      'Career fit',
      60,
      `${matches.length} published program${matches.length === 1 ? '' : 's'} match${matches.length === 1 ? 'es' : ''} ${profile.field}${hasExact ? ', including an exact major' : ''}; some published course support.`,
    )
  }

  // --- Geographic: tie-breaker only; drops out when it equals the choice ------
  const geographicMatch = profile.country.toLowerCase() === university.country.toLowerCase()
  const geographic = geographicMatch
    ? component('Geographic fit', 100, `${university.country} matches your selected destination, so it is not a distinguishing factor here.`, false)
    : component('Geographic fit', 45, `${university.country} is outside your selected destination of ${profile.country}.`)

  // --- Overall: weighted mean over RESOLVED components only -------------------
  const components: Record<FitDimension, FitComponent> = { academic, financial, language, career, geographic }
  const resolvedEntries = (Object.entries(components) as [FitDimension, FitComponent][]).filter(([, item]) => item.resolved)
  const resolvedWeight = resolvedEntries.reduce((sum, [key]) => sum + weights[key], 0)
  const overall = resolvedWeight > 0
    ? clamp(resolvedEntries.reduce((sum, [key, item]) => sum + item.score * weights[key], 0) / resolvedWeight)
    : 50
  const grade = gradeForScore(overall)
  const label = overall >= 72 ? 'Strong fit' : overall >= 52 ? 'Promising fit' : 'Consider carefully'
  const confidencePrefix = resolvedEntries.length < 2 ? 'Limited data: ' : ''

  return {
    version: PHI_VERSION,
    overall,
    grade,
    label,
    summary: `${confidencePrefix}${label} for your entered ${profile.field} profile; open all five components before deciding.`,
    components,
    computedAt: 'deterministic:no-clock',
  }
}
