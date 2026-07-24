import type { DataPoint, FitComponent, FitDimension, FitScore, StudentProfile, University } from '../types'

export const PHI_VERSION = 'phi-placeholder-v1'

export type PhiWeights = Record<FitDimension, number> & {
  computedAt?: string
}

export const DEFAULT_PHI_WEIGHTS: PhiWeights = {
  academic: 0.25,
  financial: 0.25,
  language: 0.2,
  career: 0.15,
  geographic: 0.15,
}

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
  if (point.status === 'unknown') return null
  const match = point.value.replaceAll(',', '').match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : null
}

function fieldMatches(profile: StudentProfile, university: University) {
  const wanted = profile.field.toLowerCase()
  return university.programs.some((program) => {
    const field = program.field.toLowerCase()
    const name = program.name.toLowerCase()
    return field === wanted || field.includes(wanted) || wanted.includes(field) || name.includes(wanted)
  })
}

// TODO(EPIF): replace internals with paper equations.
// This placeholder is intentionally transparent, monotonic, bounded, and deterministic.
// The cost comparison uses published sticker-price numbers before scholarships and performs
// no currency conversion; it is a ranking scaffold, not a financial estimate.
export function computeFit(
  profile: StudentProfile,
  university: University,
  weights: PhiWeights = DEFAULT_PHI_WEIGHTS,
): FitScore {
  const match = fieldMatches(profile, university)
  const academicReadiness = profile.academicScore ?? 55
  const academic = component(
    'Academic fit',
    match ? (academicReadiness + 90) / 2 : academicReadiness * 0.65,
    match
      ? `A published program matches your ${profile.field} direction; formal entry evidence still needs review.`
      : `No published program directly matches your ${profile.field} direction, so academic alignment needs review.`,
  )

  const tuition = numericPart(university.tuition)
  const living = numericPart(university.livingCost)
  let financial: FitComponent
  if (profile.budgetMax === null) {
    financial = component('Financial fit', 50, 'You have not set a budget ceiling, so financial fit remains unresolved.')
  } else if (tuition === null || living === null) {
    financial = component('Financial fit', 50, 'A published sticker-price cost is missing, so this option is not excluded.')
  } else {
    const sticker = tuition + living
    const ratio = profile.budgetMax / Math.max(sticker, 1)
    const score = ratio >= 1 ? 70 + Math.min(30, (ratio - 1) * 30) : ratio * 70
    financial = component(
      'Financial fit',
      score,
      ratio >= 1
        ? 'Published tuition plus living-cost minimum fits your ceiling before scholarships.'
        : 'Published tuition plus living-cost minimum is above your ceiling before scholarships.',
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
        ? `Your entered IELTS level meets the published ${requiredLanguage.toFixed(1)} sample minimum.`
        : `Your entered IELTS level is below the published ${requiredLanguage.toFixed(1)} sample minimum.`,
    )
  }

  const career = component(
    'Career fit',
    match ? 85 : 50,
    match
      ? 'The published course list supports your stated study direction.'
      : 'Career alignment needs a closer course-by-course review.',
  )

  const geographicMatch = profile.country === university.country
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
    computedAt: weights.computedAt ?? 'not-recorded',
  }
}
