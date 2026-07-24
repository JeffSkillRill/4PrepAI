import { ArrowRight, CloudOff, FileQuestion, RefreshCw, SearchX, ShieldAlert, Sparkles } from 'lucide-react'
import type { DevState } from '../types'

function Illustration({ type }: { type: DevState }) {
  if (type === 'offline') return <CloudOff size={54} strokeWidth={1.5} />
  if (type === 'error') return <ShieldAlert size={54} strokeWidth={1.5} />
  if (type === 'refusal') return <FileQuestion size={54} strokeWidth={1.5} />
  if (type === 'no_results') return <SearchX size={54} strokeWidth={1.5} />
  return <Sparkles size={54} strokeWidth={1.5} />
}

export function LoadingState() {
  return (
    <main className="page-container py-10" aria-label="Loading results" aria-live="polite">
      <div className="mb-8 h-9 w-72 rounded-lg skeleton" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[260px_1fr_1fr_1fr]">
        <div className="hidden h-[520px] rounded-2xl skeleton lg:block" />
        {[0, 1, 2].map((i) => <div key={i} className="card overflow-hidden"><div className="aspect-video skeleton" /><div className="space-y-4 p-5"><div className="h-6 w-3/4 rounded skeleton" /><div className="h-4 w-full rounded skeleton" /><div className="h-4 w-4/5 rounded skeleton" /><div className="mt-6 h-12 rounded-xl skeleton" /></div></div>)}
      </div>
    </main>
  )
}

const stateCopy: Record<Exclude<DevState, 'ready' | 'loading' | 'partial'>, { title: string; body: string; action: string }> = {
  empty: { title: 'Your shortlist is ready for a first choice', body: 'Explore universities and save the ones that feel promising. Your evidence-backed shortlist will appear here.', action: 'Explore universities' },
  no_results: { title: 'No exact matches yet', body: 'Try widening your budget, choosing another country, or removing one filter. We will never invent a match just to fill the page.', action: 'Clear filters' },
  refusal: { title: 'We can’t make that decision for you', body: '4Prep can organize evidence and explain trade-offs, but it cannot guarantee admission or a visa outcome. Let’s build a balanced shortlist instead.', action: 'Build a shortlist' },
  error: { title: 'Something did not load correctly', body: 'Your choices are still safe in this session. Try the page again; no new facts will be shown until their sources are available.', action: 'Try again' },
  offline: { title: 'You appear to be offline', body: 'Source-backed details need a connection before they can be checked. Reconnect and refresh to continue.', action: 'Check connection' },
}

export function DesignedState({ state, onReset }: { state: Exclude<DevState, 'ready' | 'loading' | 'partial'>; onReset: () => void }) {
  const copy = stateCopy[state]
  return (
    <main className="page-container py-16 lg:py-24">
      <section className="soft-grid mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-line bg-white px-6 py-14 text-center shadow-soft sm:px-12">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-forest-50 text-forest-700"><Illustration type={state} /></div>
        <h1 className="display mt-7 text-3xl font-extrabold sm:text-4xl">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-muted">{copy.body}</p>
        <button onClick={onReset} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white transition hover:bg-forest-700">
          {state === 'error' || state === 'offline' ? <RefreshCw size={18} /> : null}{copy.action}<ArrowRight size={18} />
        </button>
      </section>
    </main>
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
