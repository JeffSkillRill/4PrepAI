import { afterEach, describe, expect, it, vi } from 'vitest'
const invoke = vi.hoisted(() => vi.fn().mockResolvedValue({ data: null, error: null }))
vi.mock('./client', () => ({ getSupabaseClient: () => ({ functions: { invoke } }) }))
import { initializeOperationalTelemetry, setAnalyticsSink, track } from './analytics'
afterEach(() => { setAnalyticsSink(null); invoke.mockClear() })
describe('privacy-safe operational telemetry', () => {
  it('drops all supplied properties, including contacts and private scores', () => {
    initializeOperationalTelemetry()
    track('profile_saved', { contact: 'private@example.invalid', gpa: 3.6, budget: 12000 })
    expect(invoke).toHaveBeenCalledWith('client-events', { body: { event: 'profile_saved' } })
  })
  it('throttles repeated events without breaking the application', () => {
    initializeOperationalTelemetry()
    track('app_crash'); track('app_crash')
    expect(invoke).toHaveBeenCalledTimes(1)
  })
})
