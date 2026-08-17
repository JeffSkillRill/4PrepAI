import { describe, expect, it } from 'vitest'
import type { AwardCondition, Scholarship, StudentProfile, University } from '../types'
import { known, unknown } from '../types'
import { analyseScholarships, evaluateAward, SCHOLARSHIP_MATCH_VERSION } from './scholarships'

function profile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    country: 'United States',
    field: 'Computer Science',
    academicScore: 80,
    budgetMax: 12000,
    budgetCurrency: 'USD',
    languageTest: 'ielts',
    languageScore: 6.5,
    admissionTest: null,
    admissionTestScore: null,
    gpa: null,
    needsLanguagePathway: false,
    intake: 'Fall 2027',
    ...overrides,
  }
}

function university(overrides: Partial<University> = {}): University {
  return {
    id: 'alabama',
    name: 'University of Alabama',
    scholarships: [],
    ...overrides,
  } as unknown as University
}

const condition = (
  kind: AwardCondition['kind'],
  minimum: number,
): AwardCondition => ({
  kind,
  minimum,
  publishedText: 'SAT 1420 begins the published $28,000 merit tier with GPA 3.5',
  sourceId: 'us-ua-scholarship',
})

function award(conditions: AwardCondition[]): Scholarship {
  return {
    id: 'alabama-automatic',
    name: 'Alabama Automatic Merit Scholarship',
    amount: known('Up to $28,000 / year', 'us-ua-scholarship', { numericValue: 28000, currency: 'USD', period: 'year' }),
    conditions,
  }
}

// The Alabama tier as published: a score OR the equivalent, AND a GPA.
const alabamaTier = [condition('sat', 1420), condition('act', 32), condition('gpa', 3.5)]

describe('an award is reachable only when every published condition is met', () => {
  it('reports reachable when the score and the GPA are both met', () => {
    const report = evaluateAward(
      profile({ admissionTest: 'sat', admissionTestScore: 1450, gpa: 3.6 }),
      award(alabamaTier),
      university(),
    )
    expect(report.status).toBe('reachable')
    expect(report.missing).toEqual([])
    expect(report.message).toContain('not an offer of the award')
  })

  // This is the specific lie the table exists to prevent. Meeting the score half
  // of a two-part tier must never render as success.
  it('never reports reachable when the score is met but the GPA is not', () => {
    const report = evaluateAward(
      profile({ admissionTest: 'sat', admissionTestScore: 1450, gpa: 2.9 }),
      award(alabamaTier),
      university(),
    )
    expect(report.status).toBe('partly_met')
    expect(report.missing.map((item) => item.kind)).toEqual(['gpa'])
    expect(report.missing[0].shortfall).toBe(0.6)
    expect(report.message).toContain('not all of it')
  })

  it('never reports reachable when the GPA is met but the score is not', () => {
    const report = evaluateAward(
      profile({ admissionTest: 'sat', admissionTestScore: 1100, gpa: 3.9 }),
      award(alabamaTier),
      university(),
    )
    expect(report.status).toBe('partly_met')
    expect(report.missing.map((item) => item.kind)).toEqual(['sat'])
    expect(report.missing[0].shortfall).toBe(320)
  })

  it('reports not yet when neither condition is met', () => {
    const report = evaluateAward(
      profile({ admissionTest: 'sat', admissionTestScore: 900, gpa: 2 }),
      award(alabamaTier),
      university(),
    )
    expect(report.status).toBe('not_yet')
    expect(report.metCount).toBe(0)
  })

  // SAT and ACT are alternatives, so an unmet ACT row must not sink a met SAT.
  it('treats the two admission tests as alternatives, not as two separate bars', () => {
    const report = evaluateAward(
      profile({ admissionTest: 'act', admissionTestScore: 33, gpa: 3.8 }),
      award(alabamaTier),
      university(),
    )
    expect(report.status).toBe('reachable')
    expect(report.missing).toEqual([])
  })
})

describe('an award with no published criteria is never presented as one you qualify for', () => {
  it('says plainly that the university publishes no criteria', () => {
    const report = evaluateAward(profile({ gpa: 4 }), award([]), university())
    expect(report.status).toBe('no_published_criteria')
    expect(report.missing).toEqual([])
    expect(report.message).toContain('cannot be assessed from published information')
  })

  it('carries the published reason for an unstated amount, in the university’s words', () => {
    const needBased: Scholarship = {
      id: 'yale-need-aid',
      name: 'Yale need-based grant aid',
      amount: unknown(
        'The award is individualized from demonstrated need, so Yale publishes no single amount.',
        'Ask the financial aid office for an estimate.',
      ),
      conditions: [],
    }
    const report = evaluateAward(profile(), needBased, university({ name: 'Yale University' }))
    expect(report.amountText).toBeNull()
    expect(report.amountUnknownReason).toContain('individualized from demonstrated need')
    expect(report.amountSuggestedAction).toBe('Ask the financial aid office for an estimate.')
  })
})

describe('missing student values are asked for, never assumed', () => {
  it('asks for the scores rather than reporting a gap the student never claimed', () => {
    const report = evaluateAward(profile(), award(alabamaTier), university())
    expect(report.status).toBe('needs_your_scores')
    expect(report.missing).toEqual([])
    expect(report.message).toContain('Add')
  })

  it('asks for GPA alone when only the GPA is absent', () => {
    const report = evaluateAward(
      profile({ admissionTest: 'sat', admissionTestScore: 1500 }),
      award(alabamaTier),
      university(),
    )
    expect(report.status).toBe('needs_your_scores')
    expect(report.message).toContain('GPA')
  })
})

describe('the report as a whole', () => {
  it('is versioned and puts actionable awards first', () => {
    const reachable = { ...award(alabamaTier), id: 'reachable' }
    const unconditioned = { ...award([]), id: 'unconditioned' }
    const report = analyseScholarships(
      profile({ admissionTest: 'sat', admissionTestScore: 1500, gpa: 3.9 }),
      [university({ scholarships: [unconditioned, reachable] })],
    )
    expect(report.version).toBe(SCHOLARSHIP_MATCH_VERSION)
    expect(report.awards.map((item) => item.scholarshipId)).toEqual(['reachable', 'unconditioned'])
    expect(report.reachableCount).toBe(1)
    expect(report.unconditionedCount).toBe(1)
  })

  it('never promises an award anywhere in its wording', () => {
    const forbidden = ['you qualify', 'you will receive', 'guaranteed', 'you have won', 'you are eligible']
    const report = analyseScholarships(
      profile({ admissionTest: 'sat', admissionTestScore: 1500, gpa: 3.9 }),
      [university({ scholarships: [award(alabamaTier), award([])] })],
    )
    const text = report.awards.map((item) => item.message).join(' ').toLowerCase()
    for (const phrase of forbidden) expect(text).not.toContain(phrase)
  })
})
