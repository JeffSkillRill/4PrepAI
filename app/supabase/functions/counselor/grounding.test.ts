import { describe, expect, it } from 'vitest'
import {
  buildCounselorCacheKey,
  buildVerifiedFactAnswer,
  hashCallerIp,
  knownContext,
  normalizeQuestion,
  validateFigures,
  type CatalogUniversity,
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

describe('counselor grounding', () => {
  it('builds the Southern Mississippi tuition answer only from the supplied record', () => {
    const records = knownContext([southernMississippi])
    const result = buildVerifiedFactAnswer('tuition', records)

    expect(result).toEqual({
      answer: 'Verified 4Prep tuition for University of Southern Mississippi: $12,794 / year for a nonresident undergraduate (2026-27).',
      citations: ['us-usm-coa'],
    })
    expect(validateFigures(result!.answer, records, result!.citations).ok).toBe(true)
    expect(result!.answer).not.toContain('$10,394')
  })

  it('rejects the exact web-search figure that caused the live false refusal', () => {
    const records = knownContext([southernMississippi])
    const validation = validateFigures(
      'Tuition is $12,794 for a nonresident; resident tuition is $10,394.',
      records,
      ['us-usm-coa'],
    )

    expect(validation.ok).toBe(false)
    expect(validation.untraceable).toEqual(['$10,394'])
  })

  it('rejects a sourced figure when no valid citation survives', () => {
    const records = knownContext([southernMississippi])
    expect(validateFigures('Tuition is $12,794.', records, []).ok).toBe(false)
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
