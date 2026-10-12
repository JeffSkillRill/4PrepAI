import { describe, expect, it } from 'vitest'
import { validLeadBody } from './validation'
const valid = { p_lead_id: '11111111-1111-1111-1111-111111111111', p_name: 'Test student', p_contact: 'test@example.invalid', p_source: 'gap' }
describe('contact request validation', () => {
  it('accepts the browser contract', () => { expect(validLeadBody(valid)).toBe(true) })
  it.each([null, [], {}, { ...valid, p_lead_id: 'not-a-uuid' }, { ...valid, p_contact: null }, { ...valid, p_name: ' ' }, { ...valid, p_source: 'admin' }, { ...valid, p_note: 'x'.repeat(1001) }])('rejects malformed data before any database write', (body) => {
    expect(validLeadBody(body)).toBe(false)
  })
})
