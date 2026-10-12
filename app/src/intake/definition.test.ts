import { describe, expect, it } from 'vitest'
import { customBudgetAmount, draftFromProfile, emptyDraft, isStepAnswered, profileFromDraft } from './definition'

describe('custom annual budget', () => {
  it('round trips a real non-preset USD amount without replacing it with unsure', () => {
    const profile = profileFromDraft({ ...emptyDraft, budget: 'USD 32750.5' })
    expect(profile.budgetMax).toBe(32750.5)
    expect(profile.budgetCurrency).toBe('USD')
    expect(draftFromProfile(profile).budget).toBe('USD 32750.5')
  })
  it.each(['USD ', 'USD 0', 'USD -10', 'USD NaN', 'USD Infinity', 'Custom amount'])('rejects invalid amount %s', (budget) => {
    expect(customBudgetAmount(budget)).toBeNull()
    expect(isStepAnswered({ ...emptyDraft, budget }, 'budget')).toBe(false)
  })
  it('retains the unsure answer without inventing a budget', () => {
    expect(isStepAnswered({ ...emptyDraft, budget: 'Still working it out' }, 'budget')).toBe(true)
    expect(profileFromDraft({ ...emptyDraft, budget: 'Still working it out' }).budgetMax).toBeNull()
  })
})
