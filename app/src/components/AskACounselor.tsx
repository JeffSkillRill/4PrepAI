import { useEffect, useId, useRef, useState } from 'react'
import { CheckCircle2, CloudOff, MessageSquareText, Send } from 'lucide-react'
import type { LeadSource } from '../types'
import { submitLead } from '../data/repository'
import { track } from '../data/analytics'
import { useOnlineStatus } from './States'

/**
 * The app→Academy handoff.
 *
 * Placed where the product has just been honest about something it cannot
 * answer, so it reads as the same promise being kept by a person rather than as
 * an upsell. Two rules govern the copy and neither is negotiable:
 *
 *   1. No claim about admission outcomes, and no urgency. The counselor
 *      presents options and never decides for the student; this inherits that.
 *   2. The app is free with or without this. Say so where the student can see
 *      it before they type anything.
 */

type Phase =
  | 'idle'
  | 'submitting'
  | 'submitted'
  | 'rate_limited'
  | 'failed'

const RESULTS_PROMPT = 'These are the universities your answers support. A counsellor at 4Prep Academy — the same team behind this app — can talk through what they would mean for you.'
const GAP_PROMPT = 'We will not guess at a figure a university has not published. A counsellor at 4Prep Academy — the same team behind this app — can contact them and ask.'
const REFUSAL_PROMPT = 'This is outside what we can answer from a published source. A counsellor at 4Prep Academy — the same team behind this app — may be able to help.'

function promptFor(source: LeadSource): string {
  if (source === 'gap') return GAP_PROMPT
  if (source === 'counselor_refusal') return REFUSAL_PROMPT
  return RESULTS_PROMPT
}

function newLeadId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Only reached on browsers without randomUUID. The value is an idempotency
  // key, not a security token, so a timestamped random string is sufficient.
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

function waitLabel(seconds: number): string {
  if (seconds <= 90) return 'a moment'
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'}`
}

export function AskACounselor({
  source,
  contextRef = null,
  label = 'Ask a 4Prep counsellor',
}: {
  source: LeadSource
  contextRef?: string | null
  label?: string
}) {
  const online = useOnlineStatus()
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [note, setNote] = useState('')
  // Bot bait. A real student never sees or fills this; a scripted submitter
  // fills every field it finds.
  const [company, setCompany] = useState('')
  const [retryAfter, setRetryAfter] = useState(0)
  const leadIdRef = useRef<string>(newLeadId())
  const fieldId = useId()

  useEffect(() => {
    track('handoff_shown', { source, has_context: Boolean(contextRef) })
  }, [source, contextRef])

  const canSubmit =
    name.trim().length > 0
    && contact.trim().length >= 3
    && phase !== 'submitting'
    && online

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    if (company.trim().length > 0) {
      // Silently accept and drop. Telling a bot it was detected only teaches
      // whoever wrote it to try again differently.
      setPhase('submitted')
      return
    }
    setPhase('submitting')
    try {
      const result = await submitLead(
        leadIdRef.current,
        source,
        {
          name: name.trim(),
          contact: contact.trim(),
          note: note.trim() || undefined,
        },
        contextRef,
      )
      if (result.status === 'rate_limited') {
        setRetryAfter(result.retryAfterSeconds)
        setPhase('rate_limited')
        track('lead_failed', { source, reason: 'rate_limited' })
        return
      }
      setPhase('submitted')
      track('lead_submitted', { source, has_note: note.trim().length > 0 })
    } catch {
      setPhase('failed')
      track('lead_failed', { source, reason: 'error' })
    }
  }

  if (phase === 'submitted') {
    return (
      <div
        className="trust-static rounded-2xl border border-forest-200 bg-forest-50 p-4"
        role="status"
        aria-live="polite"
      >
        <p className="flex items-start gap-2 font-bold text-forest-950">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> Your request has been sent
        </p>
        <p className="mt-1 text-sm leading-6 text-forest-900">
          A counsellor from 4Prep Academy will be in touch using the contact you gave.
          Everything in the app stays free and open to you in the meantime.
        </p>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          track('handoff_opened', { source })
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm font-bold text-forest-700 transition-colors hover:bg-forest-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
      >
        <MessageSquareText size={16} aria-hidden="true" /> {label}
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="trust-static rounded-2xl border border-forest-200 bg-white p-4"
    >
      <p className="text-sm font-bold text-forest-950">{label}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{promptFor(source)}</p>

      <div className="mt-4 grid gap-3">
        <div>
          <label htmlFor={`${fieldId}-name`} className="block text-xs font-bold uppercase tracking-[.1em] text-muted">
            Your name
          </label>
          <input
            id={`${fieldId}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={120}
            autoComplete="name"
            className="mt-1 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
          />
        </div>

        <div>
          <label htmlFor={`${fieldId}-contact`} className="block text-xs font-bold uppercase tracking-[.1em] text-muted">
            How to reach you
          </label>
          <input
            id={`${fieldId}-contact`}
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            required
            minLength={3}
            maxLength={200}
            aria-describedby={`${fieldId}-contact-hint`}
            className="mt-1 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
          />
          <p id={`${fieldId}-contact-hint`} className="mt-1 text-xs text-muted">
            Phone, Telegram, or email — whichever you actually check.
          </p>
        </div>

        <div>
          <label htmlFor={`${fieldId}-note`} className="block text-xs font-bold uppercase tracking-[.1em] text-muted">
            Anything you want them to know <span className="font-normal normal-case">(optional)</span>
          </label>
          <textarea
            id={`${fieldId}-note`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1000}
            rows={3}
            className="mt-1 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
          />
        </div>

        <div aria-hidden="true" className="hidden">
          <label htmlFor={`${fieldId}-company`}>Company</label>
          <input
            id={`${fieldId}-company`}
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
      </div>

      <div aria-live="polite">
        {!online && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-canvas p-3 text-sm leading-6 text-muted">
            <CloudOff size={16} className="mt-0.5 shrink-0" />
            You are offline. Your answers stay on this page — send it once you reconnect.
          </p>
        )}
        {phase === 'rate_limited' && (
          <p className="mt-3 rounded-xl bg-canvas p-3 text-sm leading-6 text-muted">
            That request has already been sent. Try again in about {waitLabel(retryAfter)}.
          </p>
        )}
        {phase === 'failed' && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-950">
            We could not send that just now, and your answers are still here — you can try again.
            If it keeps failing, email{' '}
            <a className="font-bold underline" href="mailto:contact@4prep.ai">contact@4prep.ai</a>.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
        >
          <Send size={16} aria-hidden="true" />
          {phase === 'submitting' ? 'Sending…' : 'Send request'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 text-sm font-bold text-muted underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
        >
          Not now
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted">
        Your name and contact go to 4Prep Academy so a counsellor can reply. Nothing else is shared,
        and the app stays free either way.
      </p>
    </form>
  )
}
