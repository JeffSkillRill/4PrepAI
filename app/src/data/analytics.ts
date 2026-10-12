import { getSupabaseClient } from './client'
import type { OperationalEvent } from '../../../shared/operational-events'

/**
 * Minimal operational measurement, not personal analytics. Production startup
 * registers a sink that sends only closed event names. Tests can replace it.
 */

export type AnalyticsEvent = OperationalEvent

export type AnalyticsProperties = Record<string, string | number | boolean | null>

type Sink = (event: AnalyticsEvent, properties: AnalyticsProperties) => void

let sink: Sink | null = null

export function initializeOperationalTelemetry() {
  const lastSent = new Map<AnalyticsEvent, number>()
  setAnalyticsSink((event) => {
    if (Date.now() - (lastSent.get(event) ?? 0) < 10_000) return
    lastSent.set(event, Date.now())
    // Ignore every property. Only a closed, non-personal event name leaves the device.
    void getSupabaseClient().functions.invoke('client-events', { body: { event } }).catch(() => {})
  })
}

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
