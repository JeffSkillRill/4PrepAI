import type { DataPoint, FitComponent, FitDimension, FitScore, StudentProfile, University } from '../types'

export const PHI_VERSION = 'phi-v0.1'

export type PhiWeights = {
  academic: number
  financial: number
  language: number
  career: number
  geographic: number
}

// Academic preparation matters, but is not treated as a proxy for admission.
const ACADEMIC_WEIGHT = 0.25
// Affordability receives equal weight because an unaffordable option is not actionable.
const FINANCIAL_WEIGHT = 0.25
// Language readiness is a material, separately remediable constraint.
const LANGUAGE_WEIGHT = 0.2
// Programme-to-goal alignment is useful but relies on the student's broad field choice.
const CAREER_WEIGHT = 0.15
// Destination preference matters while remaining the easiest preference to change.
const GEOGRAPHIC_WEIGHT = 0.15

// TODO(EPIF): calibrate against the paper's equations.
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

function component(label: string, score: number, reason: string): FitComponent {
  const bounded = clamp(score)
  return { label, score: bounded, grade: gradeForScore(bounded), tone: toneForScore(bounded), reason }
}

export function numericPart(point: DataPoint<string>): number | null {
  return point.status === 'known' && point.numericValue !== undefined ? point.numericValue : null
}

function annualAmount(point: DataPoint<string>): { amount: number; currency: string } | null {
  if (
    point.status === 'unknown'
    || point.numericValue === undefined
    || !point.currency
    || !point.period
  ) return null
  const multiplier = point.period === 'month' ? 12 : point.period === 'semester' ? 2 : point.period === 'year' ? 1 : null
  return multiplier === null ? null : { amount: point.numericValue * multiplier, currency: point.currency }
}

function maximumPublishedScholarshipPercent(university: University): number {
  return Math.max(0, ...university.scholarships.map(({ amount }) =>
    amount.status === 'known' && amount.period === 'percentage' && amount.numericValue !== undefined
      ? amount.numericValue
      : 0))
}

function fieldMatches(profile: StudentProfile, university: University) {
  const wanted = profile.field.toLowerCase()
  return university.programs.some((program) => {
    const field = program.field.toLowerCase()
    const name = program.name.toLowerCase()
    return field === wanted || field.includes(wanted) || wanted.includes(field) || name.includes(wanted)
  })
}

// Φ v0.1 is intentionally transparent, monotonic, bounded, and deterministic.
// It performs no currency conversion. Unknown or incomparable inputs receive a neutral
// 50 with an explicit reason, rather than being treated as zero.
export function computeFit(
  profile: StudentProfile,
  university: University,
  weights: PhiWeights = PHI_WEIGHTS,
): FitScore {
  const match = fieldMatches(profile, university)
  const academicReadiness = profile.academicScore
  const academic = component(
    'Academic fit',
    academicReadiness === null ? 50 : match ? academicReadiness : academicReadiness * 0.7,
    academicReadiness === null
      ? 'No academic score was entered, so academic readiness remains unresolved.'
      : match
        ? `Your entered academic score is ${academicReadiness}/100 and a published programme matches ${profile.field}; admission is not predicted.`
        : `Your entered academic score is ${academicReadiness}/100, but no published programme directly matches ${profile.field}.`,
  )

  const tuition = annualAmount(university.tuition)
  const living = annualAmount(university.livingCost)
  let financial: FitComponent
  if (profile.budgetMax === null || profile.budgetCurrency === null) {
    financial = component('Financial fit', 50, 'You have not set a budget and currency, so financial fit remains unresolved.')
  } else if (tuition === null || living === null) {
    financial = component('Financial fit', 50, 'Published annual tuition or living-cost metadata is missing, so this option is not excluded.')
  } else if (tuition.currency !== living.currency || tuition.currency !== profile.budgetCurrency) {
    financial = component(
      'Financial fit',
      50,
      `Published costs cannot be compared with your ${profile.budgetCurrency} budget without an exchange-rate estimate, which Φ does not make.`,
    )
  } else {
    const scholarshipPercent = maximumPublishedScholarshipPercent(university)
    const payableTuition = tuition.amount * (1 - Math.min(scholarshipPercent, 100) / 100)
    const annualCost = payableTuition + living.amount
    const ratio = profile.budgetMax / Math.max(annualCost, 1)
    const score = ratio >= 1 ? 70 + Math.min(30, (ratio - 1) * 30) : ratio * 70
    financial = component(
      'Financial fit',
      score,
      ratio >= 1
        ? `Published annual costs fit your ${profile.budgetCurrency} ceiling${scholarshipPercent ? ` after a published ${scholarshipPercent}% tuition reduction` : ' before scholarships'}.`
        : `Published annual costs are above your ${profile.budgetCurrency} ceiling${scholarshipPercent ? ` even after a published ${scholarshipPercent}% tuition reduction` : ' before scholarships'}.`,
    )
  }

  const requiredLanguage = numericPart(university.ielts)
  let language: FitComponent
  if (profile.languageScore === null) {
    language = component(
      'Language fit',
      profile.needsLanguagePathway ? 30 : 45,
      profile.needsLanguagePathway
        ? 'You asked for a language pathway; confirm whether one is available.'
        : 'No test score was entered, so language readiness remains unresolved.',
    )
  } else if (requiredLanguage === null) {
    language = component('Language fit', 50, 'The language minimum is not published, so readiness cannot be confirmed.')
  } else {
    const gap = profile.languageScore - requiredLanguage
    language = component(
      'Language fit',
      70 + gap * 40,
      gap >= 0
        ? `Your entered IELTS level meets the published ${requiredLanguage.toFixed(1)} minimum.`
        : `Your entered IELTS level is below the published ${requiredLanguage.toFixed(1)} minimum.`,
    )
  }

  const career = component(
    'Career fit',
    match ? 85 : 50,
    match
      ? 'The published course list supports your stated study direction.'
      : 'Career alignment needs a closer course-by-course review.',
  )

  const geographicMatch = profile.country.toLowerCase() === university.country.toLowerCase()
  const geographic = component(
    'Geographic fit',
    geographicMatch ? 100 : 45,
    geographicMatch
      ? `${university.country} matches your selected destination.`
      : `${university.country} is outside your selected destination of ${profile.country}.`,
  )

  const components = { academic, financial, language, career, geographic }
  const weightTotal = Object.keys(components).reduce(
    (sum, key) => sum + weights[key as FitDimension],
    0,
  )
  const overall = clamp(
    Object.entries(components).reduce(
      (sum, [key, value]) => sum + value.score * weights[key as FitDimension],
      0,
    ) / (weightTotal || 1),
  )
  const grade = gradeForScore(overall)
  const label = overall >= 75 ? 'Strong fit' : overall >= 55 ? 'Promising fit' : 'Consider with care'

  return {
    version: PHI_VERSION,
    overall,
    grade,
    label,
    summary: `${label} for your entered ${profile.field} profile; open all five components before deciding.`,
    components,
    computedAt: 'deterministic:no-clock',
  }
}
