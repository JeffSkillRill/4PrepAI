/** Deployable closed vocabulary: no contacts, scores, budgets, free text, URLs, or user IDs. */
export const operationalEvents = [
  'app_crash', 'intake_started', 'intake_completed', 'intake_failed',
  'profile_saved', 'profile_save_failed', 'university_saved', 'university_save_failed',
  'handoff_shown', 'handoff_opened', 'lead_submitted', 'lead_failed',
] as const
export type OperationalEvent = typeof operationalEvents[number]
export function isOperationalEvent(value: unknown): value is OperationalEvent {
  return typeof value === 'string' && (operationalEvents as readonly string[]).includes(value)
}
