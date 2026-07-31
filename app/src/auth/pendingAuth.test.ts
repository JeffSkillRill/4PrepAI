import { describe, expect, it, vi } from 'vitest'
import type { StudentProfile } from '../types'
import { resolveAccountProfile } from './pendingAuth'

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
