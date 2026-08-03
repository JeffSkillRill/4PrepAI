import { describe, expect, it } from 'vitest'
import {
  buildCounselorCacheKey,
  buildVerifiedFactAnswer,
  hashCallerIp,
  knownContext,
  normalizeQuestion,
  validateFigures,
  type CatalogUniversity,
  type GroundingRecord,
} from './grounding'

const southernMississippi: CatalogUniversity = {
  id: 'usm',
  name: 'University of Southern Mississippi',
  university_facts: [{
    kind: 'tuition',
    value: '$12,794 / year for a nonresident undergraduate (2026-27)',
    source_id: 'us-usm-coa',
    unknown_reason: null,
    suggested_action: null,
  }],
  requirements: [],
  university_scholarships: [],
}

const harvardAuditRecords: GroundingRecord[] = [
  {
    university: 'Harvard University',
    field: 'tuition',
    status: 'known',
    value: '$59,320 / year',
    citationId: 'us-harvard-cost',
    unknownReason: null,
    suggestedAction: null,
  },
  {
    university: 'Harvard University',
    field: 'room_board',
    status: 'known',
    value: '$20,374 / year',
    citationId: 'us-harvard-cost',
    unknownReason: null,
    suggestedAction: null,
  },
  {
    university: 'Harvard University',
    field: 'application_fee',
    status: 'known',
    value: '$85 one time',
    citationId: 'us-harvard-application',
    unknownReason: null,
    suggestedAction: null,
  },
]

describe('counselor grounding', () => {
  it('builds the Southern Mississippi tuition answer only from the supplied record', () => {
    const records = knownContext([southernMississippi])
    const result = buildVerifiedFactAnswer('tuition', records)

    expect(result).toEqual({
      answer: 'Verified 4Prep tuition for University of Southern Mississippi: $12,794 / year for a nonresident undergraduate (2026-27).',
      citations: ['us-usm-coa'],
    })
    expect(validateFigures(result!.answer, records, result!.citations, 'verified_fact').ok).toBe(true)
    expect(result!.answer).not.toContain('$10,394')
  })

  it('rejects the exact web-search figure that caused the live false refusal', () => {
    const records = knownContext([southernMississippi])
    const validation = validateFigures(
      'Tuition is $12,794 for a nonresident; resident tuition is $10,394.',
      records,
      ['us-usm-coa'],
      'verified_fact',
    )

    expect(validation.ok).toBe(false)
    expect(validation.untraceable).toEqual(['$10,394'])
  })

  it('rejects a sourced figure when no valid citation survives', () => {
    const records = knownContext([southernMississippi])
    expect(validateFigures('Tuition is $12,794.', records, [], 'verified_fact').ok).toBe(false)
  })

  it('allows ordinary figures in general guidance when no university records were supplied', () => {
    const validation = validateFigures(
      'Most early action deadlines fall on November 1. Compare 3 options before choosing.',
      [],
      [],
      'general_guidance',
    )

    expect(validation.ok).toBe(true)
    expect(validation.figures).toContain('November 1')
    expect(validation.untraceable).toEqual([])
    expect(validation.shouldLogStrike).toBe(false)
  })

  it('still checks a currency figure in general guidance when records were supplied', () => {
    const records = knownContext([southernMississippi])
    const validation = validateFigures(
      'General information — not verified 4Prep data. Tuition is $10,394.',
      records,
      ['us-usm-coa'],
      'general_guidance',
    )

    expect(validation.ok).toBe(false)
    expect(validation.untraceable).toEqual(['$10,394'])
    expect(validation.shouldLogStrike).toBe(false)
  })

  it('refuses a verified fact when no records were supplied', () => {
    const validation = validateFigures(
      'Verified 4Prep deadline: November 1.',
      [],
      [],
      'verified_fact',
    )

    expect(validation.ok).toBe(false)
    expect(validation.untraceable).toEqual(['November 1'])
    expect(validation.shouldLogStrike).toBe(true)
  })

  it('never marks ordinary general guidance as strike-worthy', () => {
    const records = knownContext([southernMississippi])
    const validation = validateFigures(
      'General information — not verified 4Prep data. Budget examples can start at $10,394.',
      records,
      ['us-usm-coa'],
      'general_guidance',
    )

    expect(validation.ok).toBe(false)
    expect(validation.shouldLogStrike).toBe(false)
  })

  it.each([
    {
      label: 'cross-field cost swap',
      answer: 'Room and board at Harvard is $59,320.',
      citations: ['us-harvard-cost'],
      expected: false,
    },
    {
      label: 'currency reused as a fabricated percentage',
      answer: 'The acceptance rate is about 85%.',
      citations: ['us-harvard-application'],
      expected: false,
    },
    {
      label: 'invented tuition figure',
      answer: 'Tuition at Harvard is $71,450.',
      citations: ['us-harvard-cost'],
      expected: false,
    },
    {
      label: 'correct tuition figure',
      answer: 'Tuition at Harvard is $59,320.',
      citations: ['us-harvard-cost'],
      expected: true,
    },
    {
      label: 'correct figure without a citation',
      answer: 'Tuition at Harvard is $59,320.',
      citations: [],
      expected: false,
    },
  ])('$label', ({ answer, citations, expected }) => {
    expect(validateFigures(
      answer,
      harvardAuditRecords,
      citations,
      'verified_fact',
    ).ok).toBe(expected)
  })

  it.each([
    ['tuition', '$62,226 / year (2026-27)'],
    ['fees', '$6,216 / year (2026-27)'],
    ['room_board', '$14,250 housing + $8,942 food / year (2026-27)'],
    ['total_cost_of_attendance', '$95,134-$100,134 / year (2026-27)'],
    ['application_fee', '$90 one time'],
    ['deadline', 'Regular Decision: January 1'],
    ['financial_certification', '$40,769 for the I-20'],
    ['aid_international', 'Harvard meets 100% of demonstrated need'],
    ['scholarship_amount', 'Up to $38,000 / year'],
    ['toefl', 'TOEFL iBT 100'],
    ['ielts', 'IELTS overall 7.5'],
    ['duolingo', 'Duolingo 125'],
    ['sat', 'SAT 1200'],
    ['act', 'ACT 24'],
    ['gpa', 'GPA 3.0'],
  ])('keeps deterministic %s answers valid', (field, value) => {
    const record: GroundingRecord = {
      university: 'Verified University',
      field,
      status: 'known',
      value,
      citationId: `source-${field}`,
      unknownReason: null,
      suggestedAction: null,
    }
    const built = buildVerifiedFactAnswer(field, [record])

    expect(built).not.toBeNull()
    expect(validateFigures(
      built!.answer,
      [record],
      built!.citations,
      'verified_fact',
    )).toMatchObject({ ok: true, untraceable: [] })
  })

  it('does not build an answer for a fact stored as unknown', () => {
    const records = knownContext([{
      ...southernMississippi,
      university_facts: [{
        kind: 'tuition',
        value: null,
        source_id: null,
        unknown_reason: 'No verified figure is stored.',
        suggested_action: 'Ask admissions.',
      }],
    }])

    expect(buildVerifiedFactAnswer('tuition', records)).toBeNull()
  })

  it('normalizes question whitespace and case for stable cache keys', async () => {
    const records = knownContext([southernMississippi])
    const versions = { cache: 'cache-v1', phi: 'phi-v0.2', prompt: 'prompt-v1' }
    const first = await buildCounselorCacheKey(
      '  What IS   tuition at Southern Miss? ',
      ['usm'],
      records,
      versions,
    )
    const second = await buildCounselorCacheKey(
      'what is tuition at southern miss?',
      ['usm'],
      records,
      versions,
    )

    expect(normalizeQuestion('  What IS   tuition? ')).toBe('what is tuition?')
    expect(first).toBe(second)
    expect(first).toMatch(/^[0-9a-f]{64}$/)
  })

  it('invalidates cache keys when a record or cache version changes', async () => {
    const records = knownContext([southernMississippi])
    const versions = { cache: 'cache-v1', phi: 'phi-v0.2', prompt: 'prompt-v1' }
    const original = await buildCounselorCacheKey('What is tuition?', ['usm'], records, versions)
    const corrected = await buildCounselorCacheKey('What is tuition?', ['usm'], [{
      ...records[0],
      value: '$12,900 / year',
    }], versions)
    const bumped = await buildCounselorCacheKey('What is tuition?', ['usm'], records, {
      ...versions,
      cache: 'cache-v2',
    })

    expect(corrected).not.toBe(original)
    expect(bumped).not.toBe(original)
  })

  it('hashes anonymous IPs with a salt without retaining the address', async () => {
    const first = await hashCallerIp('203.0.113.9', 'salt-one')
    const second = await hashCallerIp('203.0.113.9', 'salt-two')

    expect(first).toMatch(/^[0-9a-f]{64}$/)
    expect(first).not.toContain('203.0.113.9')
    expect(second).not.toBe(first)
  })
})
