import { describe, expect, it } from 'vitest'
import { mapFact, mapSource, mapUniversity, type RawUniversity } from './mappers'

describe('data mappers', () => {
  it('maps a known database fact to a source-backed DataPoint', () => {
    expect(mapFact({
      kind: 'tuition',
      value: '£10 / year',
      source_id: 'source-1',
      unknown_reason: null,
      suggested_action: null,
    }, 'Tuition')).toEqual({ status: 'known', value: '£10 / year', sourceId: 'source-1' })
  })

  it('round-trips an unknown database fact without inventing a fallback', () => {
    expect(mapFact({
      kind: 'scholarship',
      value: null,
      source_id: null,
      unknown_reason: 'No award is published.',
      suggested_action: 'Ask the funding office.',
    }, 'Scholarship')).toEqual({
      status: 'unknown',
      reason: 'No award is published.',
      suggestedAction: 'Ask the funding office.',
    })
  })

  it('maps source verification and retrieval metadata', () => {
    expect(mapSource({
      id: 'source-1',
      origin: 'University page',
      url: 'https://example.test',
      retrieved_at: '2026-07-18',
      verification: 'verified',
    })).toEqual({
      id: 'source-1',
      origin: 'University page',
      url: 'https://example.test',
      retrievedAt: '2026-07-18',
      verification: 'verified',
    })
  })

  it('creates explicit unknown points for absent joined facts', () => {
    const row: RawUniversity = {
      id: 'sample',
      name: 'Sample University',
      city: 'City',
      country: 'Country',
      flag: '🏳️',
      tagline: 'Tagline',
      description: 'Description',
      photo_seed: 'sample',
      highlights: [],
      source_id: 'source-1',
    }
    const university = mapUniversity(row)
    expect(university.tuition.status).toBe('unknown')
    expect(university.ielts.status).toBe('unknown')
  })
})
