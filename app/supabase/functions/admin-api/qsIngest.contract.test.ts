import { parseQsIngestPayload } from './contract.ts'
import { describe, expect, it } from 'vitest'

const valid = { universityId: 'example', source: { url: 'https://www.topuniversities.com/universities/example' }, programmes: [{ name: 'Computer Science', degree: 'Bachelor of Science', degreeLevel: 'bachelor', subjectArea: 'Engineering and Technology' }] }
describe('QS ingest validation', () => {
  it('accepts a reviewed payload', () => {
    expect(parseQsIngestPayload(valid)).not.toBeNull()
  })

  it('rejects unknown enum values', () => {
    const invalid = structuredClone(valid)
    invalid.programmes[0].degreeLevel = 'foundation' as never
    expect(parseQsIngestPayload(invalid)).toBeNull()
  })
})
