import { describe, expect, it } from 'vitest'
import type { StudentProfile, University } from '../types'
import { known, unknown } from '../types'
import { computeFit, PHI_VERSION } from './phi'

const university: University = {
  id: 'test',
  name: 'Test University (sample)',
  city: 'Test City',
  country: 'Germany',
  flag: '🇩🇪',
  tagline: 'Test',
  description: 'Test fixture',
  photoSeed: 'test',
  verification: 'unverified_sample',
  tuition: known('10,000 / year', 'source'),
  livingCost: known('10,000 / year', 'source'),
  applicationFee: unknown('Not published.', 'Ask admissions.'),
  deadline: known('1 January 2027', 'source'),
  scholarship: unknown('Not published.', 'Check funding page.'),
  language: known('English', 'source'),
  ielts: known('6.5 overall', 'source'),
  intake: known('September 2027', 'source'),
  programs: [{
    id: 'cs',
    name: 'Computer Science',
    degree: 'BSc',
    field: 'Computer Science',
    duration: known('3 years', 'source'),
    tuition: known('10,000 / year', 'source'),
  }],
  scholarships: [],
  highlights: [],
}

const profile: StudentProfile = {
  country: 'Germany',
  field: 'Computer Science',
  academicScore: 80,
  budgetMax: 25000,
  languageScore: 6,
  needsLanguagePathway: false,
  intake: 'Autumn 2027',
}

describe('computeFit placeholder contract', () => {
  it('is deterministic, versioned, and exposes exactly five bounded components', () => {
    const first = computeFit(profile, university)
    const second = computeFit(profile, university)
    expect(first).toEqual(second)
    expect(first.version).toBe(PHI_VERSION)
    expect(Object.keys(first.components)).toEqual(['academic', 'financial', 'language', 'career', 'geographic'])
    expect(first.overall).toBeGreaterThanOrEqual(0)
    expect(first.overall).toBeLessThanOrEqual(100)
    for (const item of Object.values(first.components)) {
      expect(item.score).toBeGreaterThanOrEqual(0)
      expect(item.score).toBeLessThanOrEqual(100)
      expect(item.reason.length).toBeGreaterThan(10)
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
    expect(baseline.components.academic.score).toBeGreaterThan(otherField.components.academic.score)
    expect(baseline.components.language.score).toBeGreaterThan(noIelts.components.language.score)
  })

  it('keeps missing cost inputs explicit instead of treating them as zero', () => {
    const incomplete = {
      ...university,
      livingCost: unknown<string>('Living cost is missing.', 'Ask the university.'),
    }
    const result = computeFit(profile, incomplete)
    expect(result.components.financial.score).toBe(50)
    expect(result.components.financial.reason).toContain('missing')
  })
})
