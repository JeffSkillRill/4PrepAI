/**
 * Deliberately minimal event shim.
 *
 * The handoff needs to be measurable from the day it ships, but no analytics
 * provider is wired yet (PostHog EU is scheduled separately). Rather than ship
 * the placements uninstrumented and retrofit call sites later — which is how
 * funnels end up with gaps nobody notices — the call sites go in now against
 * this shim, and wiring a provider becomes a single-file change.
 *
 * Until then every call is a no-op in production. No network request, no
 * identifier, no storage.
 */

export type AnalyticsEvent =
  | 'handoff_shown'
  | 'handoff_opened'
  | 'lead_submitted'
  | 'lead_failed'

export type AnalyticsProperties = Record<string, string | number | boolean | null>

type Sink = (event: AnalyticsEvent, properties: AnalyticsProperties) => void

let sink: Sink | null = null

/**
 * Register the real provider. Called once at startup when a key is configured;
 * tests use it to assert that a placement reported what it should.
 */
export function setAnalyticsSink(next: Sink | null): void {
  sink = next
}

export function track(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {},
): void {
  if (!sink) return
  try {
    sink(event, properties)
  } catch {
    // Measurement must never break the thing it measures. A failing provider
    // costs an event, not a student's request.
  }
}
