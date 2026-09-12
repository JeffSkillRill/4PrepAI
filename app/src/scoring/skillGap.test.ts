import { describe, expect, it } from 'vitest'
import type { DataPoint, StudentProfile, University } from '../types'
import { known, unknown } from '../types'
import {
  analyseSkillGap,
  evaluateRequirement,
  SKILL_GAP_TESTS,
  SKILL_GAP_VERSION,
} from './skillGap'

function university(overrides: Partial<University> = {}): University {
  const base: University = {
    id: 'test',
    name: 'Test University (sample)',
    city: 'Test City',
    country: 'United States',
    flag: '🇺🇸',
    tagline: 'Test',
    description: 'Test fixture',
    photoSeed: 'test',
    verification: 'unverified_sample',
    tuition: unknown('Not published.', 'Ask admissions.'),
    fees: unknown('Not published.', 'Ask admissions.'),
    roomBoard: unknown('Not published.', 'Ask admissions.'),
    totalCostOfAttendance: unknown('Not published.', 'Ask admissions.'),
    aidInternational: unknown('Not published.', 'Ask financial aid.'),
    testPolicy: unknown('Not published.', 'Ask admissions.'),
    financialCertification: unknown('Not published.', 'Ask admissions.'),
    livingCost: unknown('Not published.', 'Ask admissions.'),
    applicationFee: unknown('Not published.', 'Ask admissions.'),
    deadline: unknown('Not published.', 'Ask admissions.'),
    scholarship: unknown('Not published.', 'Ask funding.'),
    language: unknown('Not published.', 'Ask admissions.'),
    ielts: unknown('Not published.', 'Ask admissions.'),
    toefl: unknown('Not published.', 'Ask admissions.'),
    duolingo: unknown('Not published.', 'Ask admissions.'),
    sat: unknown('Not published.', 'Ask admissions.'),
    act: unknown('Not published.', 'Ask admissions.'),
    gpa: unknown('Not published.', 'Ask admissions.'),
    intake: unknown('Not published.', 'Ask admissions.'),
    internationalStudentPct: unknown('Not published.', 'Ask admissions.'),
    livingAccommodation: unknown('Not published.', 'Ask admissions.'),
    livingFood: unknown('Not published.', 'Ask admissions.'),
    livingTransport: unknown('Not published.', 'Ask admissions.'),
    livingUtilities: unknown('Not published.', 'Ask admissions.'),
    employabilityRate: unknown('Not published.', 'Ask admissions.'),
    employabilitySummary: unknown('Not published.', 'Ask admissions.'),
    facultyCount: unknown('Not published.', 'Ask admissions.'),
    programs: [],
    scholarships: [],
    rankings: [],
    campuses: [],
    highlights: [],
  }
  return { ...base, ...overrides }
}

function profile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    country: 'United States',
    field: 'Computer Science',
    academicScore: 80,
    budgetMax: 25000,
    budgetCurrency: 'USD',
    languageTest: 'ielts',
    languageScore: 6.5,
    admissionTest: null,
    admissionTestScore: null,
    gpa: null,
    needsLanguagePathway: false,
    intake: 'Autumn 2027',
    ...overrides,
  }
}

const minimum = (value: string, numericValue: number): DataPoint<string> =>
  known(value, 'src', { numericValue, benchmark: 'admission_minimum' })

describe('skill gap contract', () => {
  it('is versioned and deterministic', () => {
    const target = university({ ielts: minimum('Minimum IELTS 6.0', 6) })
    const first = analyseSkillGap(profile(), target)
    const second = analyseSkillGap(profile(), target)
    expect(first).toEqual(second)
    expect(first.version).toBe(SKILL_GAP_VERSION)
  })
})

// A student sits one English test and at most one admission test. Reporting all
// six turns a short, actionable page into five rows of filler per university.
describe('only the tests the student actually holds are reported', () => {
  it('reports the student’s own English test and neither of the other two', () => {
    const report = analyseSkillGap(
      profile({ languageTest: 'ielts', languageScore: 6.5 }),
      university({
        ielts: minimum('Minimum IELTS 6.0', 6),
        toefl: minimum('Minimum TOEFL iBT 80', 80),
        duolingo: minimum('Minimum Duolingo 110', 110),
      }),
    )
    expect(report.items.map((item) => item.test)).toEqual(['ielts'])
  })

  it('reports the admission test the student sat and never the other one', () => {
    const report = analyseSkillGap(
      profile({ admissionTest: 'sat', admissionTestScore: 1200 }),
      university({
        sat: minimum('Minimum SAT 980', 980),
        act: minimum('Minimum ACT 19', 19),
      }),
    )
    expect(report.items.map((item) => item.test)).toEqual(['ielts', 'sat'])
    expect(report.items.find((item) => item.test === 'sat')?.status).toBe('met')
  })

  it('includes GPA only when the student provided one', () => {
    const withoutGpa = analyseSkillGap(profile(), university({ gpa: minimum('Minimum 3.0 GPA', 3) }))
    expect(withoutGpa.items.map((item) => item.test)).toEqual(['ielts'])

    const withGpa = analyseSkillGap(profile({ gpa: 2.8 }), university({ gpa: minimum('Minimum 3.0 GPA', 3) }))
    expect(withGpa.items.map((item) => item.test)).toEqual(['ielts', 'gpa'])
    const gpa = withGpa.items.find((item) => item.test === 'gpa')
    expect(gpa?.status).toBe('short')
    expect(gpa?.shortfall).toBe(0.2)
  })

  it('reports nothing and says so when the student holds no scores at all', () => {
    const report = analyseSkillGap(
      profile({ languageTest: null, languageScore: null }),
      university({ ielts: minimum('Minimum IELTS 6.0', 6) }),
    )
    expect(report.items).toEqual([])
    expect(report.hasNoStudentScores).toBe(true)
    expect(report.summary).toContain('Add a test score')
  })

  it('exposes the full test list for callers that need it', () => {
    expect([...SKILL_GAP_TESTS]).toEqual(['ielts', 'toefl', 'duolingo', 'sat', 'act', 'gpa'])
  })
})

describe('a published admission minimum is the only bar a student is measured against', () => {
  it('reports met when the student is at or above the minimum', () => {
    const report = analyseSkillGap(
      profile({ languageScore: 6.5 }),
      university({ ielts: minimum('Minimum IELTS 6.0', 6) }),
    )
    const ielts = report.items.find((item) => item.test === 'ielts')
    expect(ielts?.status).toBe('met')
    expect(ielts?.shortfall).toBeNull()
    expect(report.metCount).toBe(1)
    expect(report.shortCount).toBe(0)
  })

  it('treats exactly meeting the minimum as met, not short', () => {
    const report = analyseSkillGap(
      profile({ languageScore: 6 }),
      university({ ielts: minimum('Minimum IELTS 6.0', 6) }),
    )
    expect(report.items.find((item) => item.test === 'ielts')?.status).toBe('met')
  })

  it('reports the exact shortfall when the student is below the minimum', () => {
    const report = analyseSkillGap(
      profile({ languageScore: 5.5 }),
      university({ ielts: minimum('Minimum IELTS 6.5', 6.5) }),
    )
    const ielts = report.items.find((item) => item.test === 'ielts')
    expect(ielts?.status).toBe('short')
    expect(ielts?.shortfall).toBe(1)
    expect(ielts?.message).toContain('1 below the published minimum of 6.5')
  })

  it('does not leak floating point noise into the shortfall a student reads', () => {
    const report = analyseSkillGap(
      profile({ languageScore: 6.2 }),
      university({ ielts: minimum('Minimum IELTS 6.5', 6.5) }),
    )
    const ielts = report.items.find((item) => item.test === 'ielts')
    expect(ielts?.shortfall).toBe(0.3)
    expect(ielts?.message).not.toContain('0.30000000000000004')
  })
})

// These are the cases the whole design exists for. Yale publishes IELTS 7 and
// states plainly that it is not a minimum. A student with 6.5 must never be told
// she falls short of a Yale requirement, because Yale has not set one.
describe('a figure that is not an admission minimum can never fail a student', () => {
  it('never returns short for an indicative figure, even well below it', () => {
    const report = analyseSkillGap(
      profile({ languageScore: 5 }),
      university({
        name: 'Yale University',
        ielts: known('Most competitive applicants typically have IELTS 7; this is not stated as a minimum', 'src', {
          numericValue: 7,
          benchmark: 'indicative',
        }),
      }),
    )
    const ielts = report.items.find((item) => item.test === 'ielts')
    expect(ielts?.status).toBe('not_a_cutoff')
    expect(ielts?.shortfall).toBeNull()
    expect(ielts?.message).toContain('not a minimum')
    expect(report.shortCount).toBe(0)
  })

  it('never returns short for a scholarship threshold', () => {
    const item = evaluateRequirement(
      'sat',
      known('Optional for admission; SAT 1420 begins the published $28,000 merit tier', 'src', {
        numericValue: 1420,
        benchmark: 'scholarship_threshold',
      }),
      900,
    )
    expect(item.status).toBe('other_purpose')
    expect(item.shortfall).toBeNull()
    expect(item.message).toContain('not admission')
  })

  it('never returns short for an English-proficiency alternative', () => {
    const item = evaluateRequirement(
      'sat',
      known('Not required for admission; SAT 1030 can satisfy English proficiency', 'src', {
        numericValue: 1030,
        benchmark: 'english_proficiency_alternative',
      }),
      800,
    )
    expect(item.status).toBe('other_purpose')
    expect(item.shortfall).toBeNull()
  })

  // The failure this guards against: a numeric requirement reaching the app
  // without a classification must fall back to silence, never to a cutoff.
  it('refuses to compare a number that carries no classification', () => {
    const item = evaluateRequirement('ielts', known('IELTS 6.5', 'src', { numericValue: 6.5 }), 5)
    expect(item.status).toBe('not_published')
    expect(item.shortfall).toBeNull()
  })

  it('refuses to compare a number explicitly classified as none', () => {
    const item = evaluateRequirement(
      'ielts',
      known('IELTS 6.5', 'src', { numericValue: 6.5, benchmark: 'none' }),
      5,
    )
    expect(item.status).toBe('not_published')
  })

  it('never produces a shortfall for any status other than short', () => {
    const points: DataPoint<string>[] = [
      unknown('Not published.', 'Ask admissions.'),
      known('Guidance only', 'src'),
      known('IELTS 7', 'src', { numericValue: 7, benchmark: 'indicative' }),
      known('SAT 1420', 'src', { numericValue: 1420, benchmark: 'scholarship_threshold' }),
      known('SAT 1030', 'src', { numericValue: 1030, benchmark: 'english_proficiency_alternative' }),
      known('IELTS 6.0', 'src', { numericValue: 6, benchmark: 'admission_minimum' }),
    ]
    for (const point of points) {
      for (const score of [null, 1, 5, 10, 2000]) {
        const item = evaluateRequirement('ielts', point, score)
        if (item.status !== 'short') expect(item.shortfall).toBeNull()
        else expect(item.shortfall).toBeGreaterThan(0)
      }
    }
  })
})

describe('gaps in published data are attributed to the university, not the student', () => {
  it('carries the university reason and suggested action through unchanged', () => {
    const report = analyseSkillGap(
      // The student holds a GPA, so the row is reported and the university's own
      // explanation for having no published minimum reaches them.
      profile({ gpa: 3.4 }),
      university({
        gpa: unknown(
          'Yale does not publish a minimum first-year GPA on the retrieved admissions pages.',
          'Ask admissions directly.',
        ),
      }),
    )
    const gpa = report.items.find((item) => item.test === 'gpa')
    expect(gpa?.status).toBe('not_published')
    expect(gpa?.unknownReason).toContain('does not publish a minimum first-year GPA')
    expect(gpa?.suggestedAction).toBe('Ask admissions directly.')
  })

  it('says so plainly when a university sets no minimum at all', () => {
    const report = analyseSkillGap(profile(), university({ name: 'Harvard University' }))
    expect(report.hasNoComparableRequirement).toBe(true)
    expect(report.metCount).toBe(0)
    expect(report.shortCount).toBe(0)
    expect(report.summary).toContain('not a gap in your record')
  })
})

describe('the student is only measured on the test they actually sat', () => {
  it('does not compare a published IELTS minimum against a TOEFL score', () => {
    const report = analyseSkillGap(
      profile({ languageTest: 'toefl', languageScore: 100 }),
      university({ ielts: minimum('Minimum IELTS 6.0', 6) }),
    )
    // The IELTS minimum is simply not reported: this student sat the TOEFL.
    expect(report.items.map((item) => item.test)).toEqual(['toefl'])
    expect(report.items[0].status).toBe('not_published')
  })

  it('asks for a score rather than guessing when none was entered', () => {
    const report = analyseSkillGap(
      profile({ languageTest: null, languageScore: null }),
      university({ toefl: minimum('Minimum TOEFL iBT 80', 80) }),
    )
    expect(report.hasNoStudentScores).toBe(true)
    expect(report.shortCount).toBe(0)
  })
})

describe('the summary never claims an admission outcome', () => {
  it('states that meeting a minimum is not a decision', () => {
    const report = analyseSkillGap(
      profile({ languageScore: 8 }),
      university({ ielts: minimum('Minimum IELTS 6.0', 6) }),
    )
    expect(report.summary).toContain('not an admission decision')
  })

  it('never uses predictive language in any message', () => {
    const forbidden = ['you will be admitted', 'guaranteed', 'likely to be accepted', 'you will get in']
    const reports = [
      analyseSkillGap(profile({ languageScore: 9 }), university({ ielts: minimum('Minimum IELTS 6.0', 6) })),
      analyseSkillGap(profile({ languageScore: 4 }), university({ ielts: minimum('Minimum IELTS 6.0', 6) })),
      analyseSkillGap(profile(), university()),
    ]
    for (const report of reports) {
      const text = [report.summary, ...report.items.map((item) => item.message)].join(' ').toLowerCase()
      for (const phrase of forbidden) expect(text).not.toContain(phrase)
    }
  })
})
