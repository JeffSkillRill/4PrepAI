import { describe, expect, it } from 'vitest'
import { buildOperationsEmail } from './message'
describe('operations email', () => {
  it('includes aggregate counters but never unknown or personal fields', () => {
    const mail = buildOperationsEmail({ crashes_24h: 2, contact: 'private@example.invalid', free_text: 'private message' }, 'reachable', '2026-10-12T04')
    expect(mail.subject).toContain('[Action needed]')
    expect(mail.text).toContain('crashes_24h: 2')
    expect(mail.text).not.toContain('private')
  })
  it('marks a failed uptime probe as requiring attention', () => {
    expect(buildOperationsEmail({}, 'unreachable', 'period').subject).toContain('[Action needed]')
  })
})
