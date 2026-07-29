import { describe, expect, it } from 'vitest'
import {
  buildVerifiedFactAnswer,
  knownContext,
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
})
