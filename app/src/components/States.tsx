import { ArrowRight, CloudOff, FileQuestion, RefreshCw, SearchX, ShieldAlert, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DevState } from '../types'

function Illustration({ type }: { type: DevState }) {
  if (type === 'offline') return <CloudOff size={54} strokeWidth={1.5} />
  if (type === 'error') return <ShieldAlert size={54} strokeWidth={1.5} />
  if (type === 'refusal') return <FileQuestion size={54} strokeWidth={1.5} />
  if (type === 'no_results') return <SearchX size={54} strokeWidth={1.5} />
  return <Sparkles size={54} strokeWidth={1.5} />
}

export type LoadingKind = 'catalogue' | 'profile' | 'compare' | 'form' | 'private' | 'dashboard'

export function LoadingState({ kind = 'catalogue' }: { kind?: LoadingKind }) {
  if (kind === 'profile') {
    return (
      <section aria-label="Loading university profile" aria-live="polite">
        <h1 className="sr-only">Loading university profile</h1>
        <div className="h-[340px] skeleton sm:h-[440px]" />
        <div className="page-container grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="h-44 rounded-2xl skeleton" />
            <div className="h-72 rounded-2xl skeleton" />
          </div>
          <div className="h-80 rounded-2xl skeleton" />
        </div>
      </section>
    )
  }

  if (kind === 'compare') {
    return (
      <section className="page-container py-8" aria-label="Loading comparison" aria-live="polite">
        <h1 className="sr-only">Loading comparison</h1>
        <div className="h-10 w-4/5 max-w-lg rounded-lg skeleton" />
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-[520px] rounded-2xl skeleton" />)}
        </div>
      </section>
    )
  }

  if (kind === 'form' || kind === 'private') {
    return (
      <section className="page-container py-10" aria-label={kind === 'form' ? 'Loading form' : 'Loading private account data'} aria-live="polite">
        <h1 className="sr-only">{kind === 'form' ? 'Loading form' : 'Loading private account data'}</h1>
        <div className="mx-auto max-w-xl">
          <div className="h-5 w-36 rounded skeleton" />
          <div className="mt-5 h-10 w-4/5 rounded-lg skeleton" />
          <div className="mt-7 h-80 rounded-2xl skeleton" />
        </div>
      </section>
    )
  }

  if (kind === 'dashboard') {
    return (
      <section className="page-container py-8" aria-label="Loading dashboard" aria-live="polite">
        <h1 className="sr-only">Loading dashboard</h1>
        <div className="h-40 rounded-[24px] skeleton" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="h-64 rounded-2xl skeleton" />
          <div className="h-64 rounded-2xl skeleton" />
          <div className="h-44 rounded-2xl skeleton" />
          <div className="h-44 rounded-2xl skeleton" />
        </div>
      </section>
    )
  }

  return (
    <section className="page-container py-10" aria-label="Loading universities" aria-live="polite">
      <h1 className="sr-only">Loading universities</h1>
      <div className="mb-8 h-9 w-72 rounded-lg skeleton" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[260px_1fr_1fr_1fr]">
        <div className="hidden h-[520px] rounded-2xl skeleton lg:block" />
        {[0, 1, 2].map((i) => <div key={i} className="card overflow-hidden"><div className="aspect-video skeleton" /><div className="space-y-4 p-5"><div className="h-6 w-3/4 rounded skeleton" /><div className="h-4 w-full rounded skeleton" /><div className="h-4 w-4/5 rounded skeleton" /><div className="mt-6 h-12 rounded-xl skeleton" /></div></div>)}
      </div>
    </section>
  )
}

const stateCopy: Record<Exclude<DevState, 'ready' | 'loading' | 'partial'>, { title: string; body: string; action: string }> = {
  empty: { title: 'Your shortlist is ready for a first choice', body: 'Explore universities and save the ones that feel promising. Your evidence-backed shortlist will appear here.', action: 'Explore universities' },
  no_results: { title: 'No exact matches yet', body: 'Try widening your budget, choosing another country, or removing one filter. We will never invent a match just to fill the page.', action: 'Clear filters' },
  refusal: { title: 'We can’t make that decision for you', body: '4Prep can organize evidence and explain trade-offs, but it cannot guarantee admission or a visa outcome. Let’s build a balanced shortlist instead.', action: 'Build a shortlist' },
  error: { title: 'Something did not load correctly', body: 'Nothing new was saved by this failed request. Work confirmed earlier is unchanged. Try again before leaving this page.', action: 'Try again' },
  offline: { title: 'You appear to be offline', body: 'Information already on screen can stay open, but new saves, profile changes, counselor requests, lesson progress, and uploads need a connection.', action: 'Check connection' },
}

export function DesignedState({ state, headingLevel = 1, onReset }: { state: Exclude<DevState, 'ready' | 'loading' | 'partial'>; headingLevel?: 1 | 2; onReset: () => void }) {
  const copy = stateCopy[state]
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <section className="page-container py-16 lg:py-24">
      <div className="trust-static soft-grid mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-line bg-white px-6 py-14 text-center shadow-soft sm:px-12">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-forest-50 text-forest-700"><Illustration type={state} /></div>
        <Heading className="display mt-7 text-3xl font-extrabold sm:text-4xl">{copy.title}</Heading>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-muted">{copy.body}</p>
        <button onClick={onReset} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white transition hover:bg-forest-700">
          {state === 'error' || state === 'offline' ? <RefreshCw size={18} /> : null}{copy.action}<ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(() => (
    typeof navigator === 'undefined' ? true : navigator.onLine
  ))
  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  return online
}

export function ConnectionStatus() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="trust-static border-b border-amber-300 bg-amber-50" role="status" aria-live="polite">
      <div className="page-container flex items-start gap-3 py-3 text-sm leading-6 text-amber-950">
        <CloudOff size={18} className="mt-0.5 shrink-0" />
        <span><strong>Offline — keep this page open.</strong> Information already loaded remains visible. New saves, intake changes, counselor requests, lesson progress, and homework uploads are not saved until you reconnect.</span>
      </div>
    </div>
  )
}

export function PartialBanner() {
  return (
    <div className="page-container pt-5">
      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        <CloudOff size={18} className="mt-0.5 shrink-0" />
        <span><strong>Some details are unavailable.</strong> Available facts still show their sources; missing fields explain what to do next.</span>
      </div>
    </div>
  )
}

export type LearningLoadingKind = 'track' | 'module' | 'lesson' | 'assignment' | 'submission'

export function LearningLoadingState({ kind }: { kind: LearningLoadingKind }) {
  if (kind === 'lesson') {
    return (
      <section className="page-container max-w-5xl py-6 sm:py-10" aria-label="Loading lesson" aria-live="polite">
        <h1 className="sr-only">Loading lesson</h1>
        <div className="mb-5 h-5 w-36 rounded skeleton" />
        <div className="h-10 w-4/5 max-w-xl rounded-lg skeleton" />
        <div className="mt-6 aspect-video w-full rounded-2xl skeleton" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="h-64 rounded-2xl skeleton" />
          <div className="h-40 rounded-2xl skeleton" />
        </div>
      </section>
    )
  }

  if (kind === 'assignment' || kind === 'submission') {
    return (
      <section className="page-container max-w-4xl py-6 sm:py-10" aria-label={`Loading ${kind}`} aria-live="polite">
        <h1 className="sr-only">Loading {kind}</h1>
        <div className="h-5 w-36 rounded skeleton" />
        <div className="mt-5 h-10 w-4/5 rounded-lg skeleton" />
        <div className="mt-7 h-32 rounded-2xl skeleton" />
        <div className="mt-5 h-64 rounded-2xl skeleton" />
      </section>
    )
  }

  return (
    <section className="page-container py-6 sm:py-10" aria-label={`Loading ${kind}`} aria-live="polite">
      <h1 className="sr-only">Loading {kind}</h1>
      <div className="h-10 w-4/5 max-w-xl rounded-lg skeleton" />
      <div className="mt-4 h-5 w-full max-w-2xl rounded skeleton" />
      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-36 rounded-2xl skeleton" />
        ))}
      </div>
    </section>
  )
}

export function LearningDesignedState({
  state,
  title,
  body,
  action,
  onAction,
}: {
  state: 'empty' | 'error' | 'offline'
  title: string
  body: string
  action: string
  onAction: () => void
}) {
  return (
    <section className="page-container py-12 sm:py-20">
      <div className="mx-auto max-w-2xl rounded-[24px] border border-line bg-white px-5 py-10 text-center shadow-soft sm:px-10">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-forest-50 text-forest-700">
          <Illustration type={state} />
        </div>
        <h1 className="display mt-6 text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-muted">{body}</p>
        <button
          onClick={onAction}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white"
        >
          {state === 'error' || state === 'offline' ? <RefreshCw size={18} /> : null}
          {action}
        </button>
      </div>
    </section>
  )
}
