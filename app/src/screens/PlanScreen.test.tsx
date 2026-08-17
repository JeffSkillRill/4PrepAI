// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StudentProfile } from '../types'
import { PlanScreen } from './PlanScreen'

const profile: StudentProfile = {
  country: 'United States',
  field: 'Computer Science',
  academicScore: 90,
  budgetMax: 12000,
  budgetCurrency: 'USD',
  languageTest: 'ielts',
  languageScore: 6.5,
  admissionTest: 'sat',
  admissionTestScore: 1200,
  gpa: 3.4,
  needsLanguagePathway: false,
  intake: 'Fall 2027',
}

afterEach(cleanup)

function renderPlan(onSave = vi.fn()) {
  render(<PlanScreen profile={profile} onSave={onSave} onNavigate={vi.fn()} onRebuild={vi.fn()} />)
  return onSave
}

describe('PlanScreen', () => {
  it('shows every saved answer as its real value', () => {
    renderPlan()
    expect(screen.getByText('United States')).toBeTruthy()
    expect(screen.getByText('Computer Science')).toBeTruthy()
    expect(screen.getByText('US$12,000')).toBeTruthy()
    expect(screen.getByText('IELTS 6.5')).toBeTruthy()
    expect(screen.getByText('SAT 1200')).toBeTruthy()
    expect(screen.getByText('3.4 / 4.0')).toBeTruthy()
    expect(screen.getByText('Fall 2027')).toBeTruthy()
  })

  it('opens one question at a time rather than the whole wizard', () => {
    renderPlan()
    expect(screen.getAllByRole('button', { name: /Change/ })).toHaveLength(8)
    fireEvent.click(screen.getAllByRole('button', { name: /Change/ })[3])
    expect(screen.getByText('What annual budget feels realistic?')).toBeTruthy()
    expect(screen.queryByText('Where would you like to study?')).toBeNull()
  })

  // The whole point of per-answer editing: changing the budget must not wipe
  // the scores the student entered earlier.
  it('changes one answer and leaves every other answer untouched', () => {
    const onSave = renderPlan()
    fireEvent.click(screen.getAllByRole('button', { name: /Change/ })[3])
    fireEvent.click(screen.getByRole('radio', { name: 'US$5,000' }))
    fireEvent.click(screen.getByRole('button', { name: /Save this answer/ }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0][0]).toEqual({
      ...profile,
      budgetMax: 5000,
      budgetCurrency: 'USD',
    })
  })

  it('discards an edit without saving when cancelled', () => {
    const onSave = renderPlan()
    fireEvent.click(screen.getAllByRole('button', { name: /Change/ })[3])
    fireEvent.click(screen.getByRole('radio', { name: 'US$5,000' }))
    fireEvent.click(screen.getByRole('button', { name: /Discard/ }))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText('US$12,000')).toBeTruthy()
  })

  it('refuses to save a score outside the published range', () => {
    const onSave = renderPlan()
    fireEvent.click(screen.getAllByRole('button', { name: /Change/ })[4])
    fireEvent.change(screen.getByLabelText('Your IELTS score'), { target: { value: '12' } })
    expect(screen.getByRole('alert').textContent).toContain('IELTS scores run from 0 to 9')
    fireEvent.click(screen.getByRole('button', { name: /Save this answer/ }))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('records a real typed score rather than a preset', () => {
    const onSave = renderPlan()
    fireEvent.click(screen.getAllByRole('button', { name: /Change/ })[4])
    fireEvent.change(screen.getByLabelText('Your IELTS score'), { target: { value: '7.5' } })
    fireEvent.click(screen.getByRole('button', { name: /Save this answer/ }))
    expect(onSave.mock.calls[0][0].languageScore).toBe(7.5)
  })

  // A student holds the SAT or the ACT, never both.
  it('replaces the admission test rather than holding two', () => {
    const onSave = renderPlan()
    fireEvent.click(screen.getAllByRole('button', { name: /Change/ })[5])
    fireEvent.click(screen.getByRole('radio', { name: 'ACT' }))
    fireEvent.change(screen.getByLabelText('Your ACT score'), { target: { value: '28' } })
    fireEvent.click(screen.getByRole('button', { name: /Save this answer/ }))

    const saved = onSave.mock.calls[0][0] as StudentProfile
    expect(saved.admissionTest).toBe('act')
    expect(saved.admissionTestScore).toBe(28)
  })
})
