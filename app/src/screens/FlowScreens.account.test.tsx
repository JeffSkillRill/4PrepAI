// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Pathway, StudentProfile } from '../types'
import { emptyDraft, intakeSteps, profileFromDraft } from '../intake/definition'
import { IntakeScreen } from './FlowScreens'

const mock = vi.hoisted(() => ({ getRankedPathway: vi.fn(), track: vi.fn() }))
vi.mock('../data/repository', () => ({ getRankedPathway: mock.getRankedPathway }))
vi.mock('../data/analytics', () => ({ track: mock.track }))
const profile = profileFromDraft({ ...emptyDraft, country: 'United States', field: 'Computer Science', academic: 'Generally on track', budget: 'USD 23500', intake: 'Fall 2027' })
const pathway = { profile, milestones: [], universities: [] } as unknown as Pathway
beforeEach(() => { mock.getRankedPathway.mockReset(); mock.track.mockClear() })
afterEach(cleanup)
function finish(onComplete: (profile: StudentProfile, pathway: Pathway) => void) {
  const view = render(<IntakeScreen initialProfile={profile} onComplete={onComplete} />)
  for (let step = 0; step < intakeSteps.length - 1; step += 1) fireEvent.click(screen.getByRole('button', { name: /^Continue$/ }))
  fireEvent.click(screen.getByRole('button', { name: /^Build my plan$/ }))
  return view
}

it('publishes the plan when its intake screen is still active', async () => {
  mock.getRankedPathway.mockResolvedValue(pathway)
  const onComplete = vi.fn()
  finish(onComplete)
  await vi.waitFor(() => expect(onComplete).toHaveBeenCalledOnce())
})

it.each(['resolve', 'reject'])('does not publish old private answers after the intake screen unmounts (%s)', async (outcome) => {
  let resolve!: (value: Pathway) => void
  let reject!: (reason: Error) => void
  mock.getRankedPathway.mockImplementation(() => new Promise((done, failed) => { resolve = done; reject = failed }))
  const onComplete = vi.fn()
  const view = finish(onComplete)
  expect(mock.getRankedPathway).toHaveBeenCalledOnce()
  view.unmount()
  await act(async () => { if (outcome === 'resolve') resolve(pathway); else reject(new Error('Synthetic delayed failure')) })
  expect(onComplete).not.toHaveBeenCalled()
  expect(mock.track).not.toHaveBeenCalledWith('intake_completed')
  expect(mock.track).not.toHaveBeenCalledWith('intake_failed')
})
