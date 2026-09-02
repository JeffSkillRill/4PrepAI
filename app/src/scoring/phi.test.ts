import { describe, expect, it } from 'vitest'
import type { StudentProfile, University } from '../types'
import { known, unknown } from '../types'
import { computeFit, PHI_VERSION } from './phi'

const university: University = {
  id: 'test',
  name: 'Test University (sample)',
  city: 'Test City',
  country: 'United States',
  flag: '🇺🇸',
  tagline: 'Test',
  description: 'Test fixture',
  photoSeed: 'test',
  verification: 'unverified_sample',
  tuition: known('US$10,000 / year', 'source', { numericValue: 10000, currency: 'USD', period: 'year' }),
  fees: known('US$1,000 / year', 'source', { numericValue: 1000, currency: 'USD', period: 'year' }),
  roomBoard: known('US$9,000 / year', 'source', { numericValue: 9000, currency: 'USD', period: 'year' }),
  totalCostOfAttendance: known('US$20,000 / year', 'cost-source', { numericValue: 20000, currency: 'USD', period: 'year' }),
  aidInternational: unknown('No institutional aid is published.', 'Ask financial aid.'),
  testPolicy: known('Test optional', 'source'),
  financialCertification: known('US$20,000', 'source', { numericValue: 20000, currency: 'USD', period: 'year' }),
  livingCost: known('US$10,000 / year', 'source', { numericValue: 10000, currency: 'USD', period: 'year' }),
  applicationFee: unknown('Not published.', 'Ask admissions.'),
  deadline: known('1 January 2027', 'source'),
  scholarship: unknown('Not published.', 'Check funding page.'),
  language: known('English', 'source'),
  ielts: known('6.5 overall', 'source', { numericValue: 6.5 }),
  toefl: known('80', 'source', { numericValue: 80 }),
  duolingo: known('110', 'source', { numericValue: 110 }),
  sat: known('Optional', 'source'),
  act: known('Optional', 'source'),
  gpa: unknown('Not published.', 'Ask admissions.'),
  intake: known('September 2027', 'source'),
  programs: [{
    id: 'cs',
    name: 'Computer Science',
    degree: 'BSc',
    field: 'Computer Science',
    duration: known('3 years', 'source'),
    tuition: known('US$10,000 / year', 'source', { numericValue: 10000, currency: 'USD', period: 'year' }),
  }],
  scholarships: [],
  highlights: [],
}

const profile: StudentProfile = {
  country: 'United States',
  field: 'Computer Science',
  academicScore: 80,
  budgetMax: 25000,
  budgetCurrency: 'USD',
  languageTest: 'ielts',
  languageScore: 6,
  admissionTest: null,
  admissionTestScore: null,
  gpa: null,
  needsLanguagePathway: false,
  intake: 'Autumn 2027',
}

describe('computeFit Φ v0.3 contract', () => {
  it('is deterministic, versioned, and exposes exactly five bounded components', () => {
    const first = computeFit(profile, university)
    const second = computeFit(profile, university)
    expect(first).toEqual(second)
    expect(first.version).toBe(PHI_VERSION)
    expect(PHI_VERSION).toBe('phi-v0.3')
    expect(Object.keys(first.components)).toEqual(['academic', 'financial', 'language', 'career', 'geographic'])
    expect(first.overall).toBeGreaterThanOrEqual(0)
    expect(first.overall).toBeLessThanOrEqual(100)
    for (const item of Object.values(first.components)) {
      expect(item.score).toBeGreaterThanOrEqual(0)
      expect(item.score).toBeLessThanOrEqual(100)
      expect(item.reason.length).toBeGreaterThan(10)
      expect(item.reason).toContain('not an admission prediction')
      expect(typeof item.resolved).toBe('boolean')
    }
  })

  it('improves financial fit monotonically as the budget ceiling rises', () => {
    const low = computeFit({ ...profile, budgetMax: 15000 }, university)
    const high = computeFit({ ...profile, budgetMax: 35000 }, university)
    expect(high.components.financial.score).toBeGreaterThan(low.components.financial.score)
  })

  it('improves language fit as the entered score clears the minimum', () => {
    const below = computeFit({ ...profile, languageScore: 5.5 }, university)
    const above = computeFit({ ...profile, languageScore: 7 }, university)
    expect(above.components.language.score).toBeGreaterThan(below.components.language.score)
  })

  it('changes fit when destination, field, or no-IELTS answers change', () => {
    const baseline = computeFit(profile, university)
    const otherDestination = computeFit({ ...profile, country: 'Canada' }, university)
    const otherField = computeFit({ ...profile, field: 'Engineering' }, university)
    const noIelts = computeFit({ ...profile, languageScore: null }, university)
    expect(baseline.components.geographic.score).toBeGreaterThan(otherDestination.components.geographic.score)
    expect(baseline.components.career.score).toBeGreaterThan(otherField.components.career.score)
    expect(baseline.components.language.score).toBeGreaterThan(noIelts.components.language.score)
  })

  it('keeps missing cost-of-attendance inputs explicit instead of treating them as zero', () => {
    const incomplete = {
      ...university,
      totalCostOfAttendance: unknown<string>('Cost of attendance is missing.', 'Ask the university.'),
    }
    const result = computeFit(profile, incomplete)
    expect(result.components.financial.score).toBe(50)
    expect(result.components.financial.reason).toContain('missing')
  })

  it('never compares unlike currencies', () => {
    const result = computeFit({ ...profile, budgetCurrency: 'EUR' }, university)
    expect(result.components.financial.score).toBe(50)
    expect(result.components.financial.reason).toContain('exchange-rate')
  })

  it('uses published dollar aid in a clearly conditional net-cost scenario', () => {
    const funded = {
      ...university,
      aidInternational: known('US$8,000 / year merit award', 'aid-source', { numericValue: 8000, currency: 'USD', period: 'year' }),
    }
    const without = computeFit({ ...profile, budgetMax: 16000 }, university)
    const withAward = computeFit({ ...profile, budgetMax: 16000 }, funded)
    expect(withAward.components.financial.score).toBeGreaterThan(without.components.financial.score)
    expect(withAward.components.financial.reason).toContain('eligibility is not assumed')
  })

  it('recognizes full-need international aid without inventing a personal net price', () => {
    const fullNeed = {
      ...university,
      aidInternational: known('Meets 100% of demonstrated financial need for international students', 'aid-source'),
    }
    const result = computeFit({ ...profile, budgetMax: 5000 }, fullNeed)
    expect(result.components.financial.score).toBe(70)
    expect(result.components.financial.reason).toContain('personal net cost')

    const princetonWording = {
      ...university,
      aidInternational: known('Full demonstrated need is met for admitted international students', 'aid-source'),
    }
    expect(computeFit({ ...profile, budgetMax: 5000 }, princetonWording).components.financial.score).toBe(70)
  })

  it('keeps comprehensive international funding visible without inventing a post-aid price', () => {
    const comprehensive = {
      ...university,
      aidInternational: known('100% funding to 100% of enrolled international students', 'aid-source'),
    }
    const result = computeFit({ ...profile, budgetMax: 5000 }, comprehensive)
    expect(result.components.financial.score).toBe(65)
    expect(result.components.financial.reason).toContain('personal net cost is unresolved')
  })

  it('scores academic fit against THIS university\'s published test bar', () => {
    const withSatBar: University = { ...university, sat: known('1300', 'source', { numericValue: 1300 }) }
    const above = computeFit({ ...profile, admissionTest: 'sat', admissionTestScore: 1450 }, withSatBar)
    const below = computeFit({ ...profile, admissionTest: 'sat', admissionTestScore: 1100 }, withSatBar)
    expect(above.components.academic.resolved).toBe(true)
    expect(below.components.academic.resolved).toBe(true)
    expect(above.components.academic.score).toBeGreaterThan(below.components.academic.score)
    expect(above.components.academic.reason).toContain('1300')
    expect(above.components.academic.reason).toContain('not an admission prediction')
  })

  it('gives the same student distinct labels for published university bars and costs', () => {
    const student = { ...profile, admissionTest: 'sat' as const, admissionTestScore: 1450, languageScore: 7 }
    const strongOption: University = {
      ...university,
      id: 'strong-option',
      sat: known('1200', 'source', { numericValue: 1200 }),
    }
    const stretchOption: University = {
      ...university,
      id: 'stretch-option',
      sat: known('1500', 'source', { numericValue: 1500 }),
      ielts: known('8.0 overall', 'source', { numericValue: 8 }),
      totalCostOfAttendance: known('US$60,000 / year', 'cost-source', { numericValue: 60000, currency: 'USD', period: 'year' }),
    }

    const strong = computeFit(student, strongOption)
    const stretch = computeFit(student, stretchOption)
    expect(strong.overall).toBeGreaterThan(stretch.overall)
    expect(strong.label).toBe('Strong fit')
    expect(stretch.label).toBe('Consider carefully')
  })

  it('leaves academic fit unresolved when no test/GPA benchmark can be compared', () => {
    const result = computeFit({ ...profile, admissionTest: null, admissionTestScore: null, gpa: null }, university)
    expect(result.components.academic.resolved).toBe(false)
    expect(result.components.academic.reason).toContain('unresolved')
  })

  it('drops geographic fit from the overall when it equals the chosen destination', () => {
    const sameCountry = computeFit(profile, university)
    expect(sameCountry.components.geographic.resolved).toBe(false)
    const otherCountry = computeFit({ ...profile, country: 'Canada' }, university)
    expect(otherCountry.components.geographic.resolved).toBe(true)
  })

  it('scores career fit by published program depth for the field', () => {
    const twoExact: University = {
      ...university,
      programs: [
        university.programs[0],
        { id: 'cs2', name: 'Computer Science and AI', degree: 'BSc', field: 'Computer Science', duration: known('4 years', 'source'), tuition: known('US$10,000 / year', 'source', { numericValue: 10000, currency: 'USD', period: 'year' }) },
      ],
    }
    const deep = computeFit(profile, twoExact)
    const shallow = computeFit(profile, university)
    const none = computeFit({ ...profile, field: 'Underwater Basket Weaving' }, university)
    expect(deep.components.career.score).toBe(85)
    expect(deep.components.career.reason).toContain('2 published programs')
    expect(shallow.components.career.score).toBe(60)
    expect(none.components.career.resolved).toBe(false)
    expect(deep.components.career.score).toBeGreaterThan(none.components.career.score)
  })

  it('excludes unresolved components and renormalizes over the resolved ones', () => {
    const onlyFinancial = computeFit({
      ...profile,
      admissionTest: null, admissionTestScore: null, gpa: null,
      languageTest: null, languageScore: null,
      field: 'Underwater Basket Weaving',
      country: 'United States',
      budgetMax: 25000, budgetCurrency: 'USD',
    }, university)
    expect(onlyFinancial.components.academic.resolved).toBe(false)
    expect(onlyFinancial.components.language.resolved).toBe(false)
    expect(onlyFinancial.components.career.resolved).toBe(false)
    expect(onlyFinancial.components.geographic.resolved).toBe(false)
    expect(onlyFinancial.components.financial.resolved).toBe(true)
    // A single resolved component means the overall equals that component's score,
    // not a midpoint diluted by neutral 50s.
    expect(onlyFinancial.overall).toBe(onlyFinancial.components.financial.score)
  })

  it('compares TOEFL and Duolingo on their own scales', () => {
    const toeflBelow = computeFit({ ...profile, languageTest: 'toefl', languageScore: 75 }, university)
    const toeflAbove = computeFit({ ...profile, languageTest: 'toefl', languageScore: 90 }, university)
    const detAbove = computeFit({ ...profile, languageTest: 'duolingo', languageScore: 120 }, university)
    expect(toeflAbove.components.language.score).toBeGreaterThan(toeflBelow.components.language.score)
    expect(toeflAbove.components.language.reason).toContain('TOEFL')
    expect(detAbove.components.language.reason).toContain('Duolingo')
  })
})
