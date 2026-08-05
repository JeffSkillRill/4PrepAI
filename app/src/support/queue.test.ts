import { describe, expect, it } from 'vitest'
import {
  canRetryQueuedMessage,
  createQueuedSupportMessage,
  helpfulRetryMessage,
  readSupportQueue,
  retryTimeFromNow,
  writeSupportQueue,
} from './queue'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}

describe('support offline queue', () => {
  const userId = '11111111-1111-4111-8111-111111111111'
  const id = '22222222-2222-4222-8222-222222222222'
  const now = new Date('2026-08-05T10:00:00.000Z')

  it('persists only the current user queue and removes an empty queue', () => {
    const storage = memoryStorage()
    const queued = createQueuedSupportMessage(userId, '  The page is confusing.  ', now, id)
    writeSupportQueue(storage, userId, [queued])
    expect(readSupportQueue(storage, userId)).toEqual([{ ...queued, body: 'The page is confusing.' }])
    expect(readSupportQueue(storage, '33333333-3333-4333-8333-333333333333')).toEqual([])
    writeSupportQueue(storage, userId, [])
    expect(readSupportQueue(storage, userId)).toEqual([])
  })

  it('keeps a rate-limited message queued until its retry time', () => {
    const queued = {
      ...createQueuedSupportMessage(userId, 'Help', now, id),
      retryNotBefore: retryTimeFromNow(90, now),
    }
    expect(canRetryQueuedMessage(queued, new Date('2026-08-05T10:01:00.000Z'))).toBe(false)
    expect(canRetryQueuedMessage(queued, new Date('2026-08-05T10:01:30.000Z'))).toBe(true)
    expect(helpfulRetryMessage(90)).toContain('2 minutes')
  })
})
