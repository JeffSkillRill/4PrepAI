import { describe, expect, it, vi } from 'vitest'
import type { StudentProfile } from '../types'
import {
  PENDING_AUTH_STORAGE_KEY,
  readPendingAuth,
  resolveAccountProfile,
  writePendingAuth,
} from './pendingAuth'

const anonymousProfile: StudentProfile = {
  country: 'Uzbekistan',
  field: 'Computer Science',
  academicScore: 89,
  budgetMax: 12_000,
  budgetCurrency: 'USD',
  languageTest: 'ielts',
  languageScore: 7,
  needsLanguagePathway: false,
  intake: 'Fall 2027',
}

describe('resolveAccountProfile', () => {
  it('writes anonymous intake work to the newly authenticated account before returning it', async () => {
    const saveProfile = vi.fn(async () => undefined)
    const storedProfile = { ...anonymousProfile, field: 'Economics' }

    const result = await resolveAccountProfile({
      userId: 'new-user-id',
      anonymousProfile,
      storedProfile,
      saveProfile,
    })

    expect(saveProfile).toHaveBeenCalledOnce()
    expect(saveProfile).toHaveBeenCalledWith('new-user-id', anonymousProfile)
    expect(result).toEqual({ profile: anonymousProfile, carried: true })
  })

  it('keeps the account profile when there is no anonymous intake to carry', async () => {
    const saveProfile = vi.fn(async () => undefined)

    const result = await resolveAccountProfile({
      userId: 'returning-user-id',
      anonymousProfile: null,
      storedProfile: anonymousProfile,
      saveProfile,
    })

    expect(saveProfile).not.toHaveBeenCalled()
    expect(result).toEqual({ profile: anonymousProfile, carried: false })
  })
})

describe('learning pending-auth destination', () => {
  it('round-trips the exact assignment route', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value) },
      removeItem: (key: string) => { values.delete(key) },
    }

    writePendingAuth(storage, {
      destination: {
        view: 'learn_assignment',
        universityId: null,
        moduleSlug: 'building-your-list',
        lessonSlug: null,
      },
      profile: null,
    })

    expect(values.has(PENDING_AUTH_STORAGE_KEY)).toBe(true)
    expect(readPendingAuth(storage)?.destination).toEqual({
      view: 'learn_assignment',
      universityId: null,
      moduleSlug: 'building-your-list',
      lessonSlug: null,
    })
  })
})
