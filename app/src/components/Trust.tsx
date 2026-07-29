import { AlertCircle, ArrowUpRight, ChevronDown, Database, Info, Sparkles } from 'lucide-react'
import type { DataPoint, FitComponent, FitDimension, FitScore, Verification } from '../types'
import { useSource } from '../data/DataProvider'

export function SourceChip({ sourceId }: { sourceId: string }) {
  const source = useSource(sourceId)
  if (!source) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-1 text-[11px] font-semibold text-muted">
        <Database size={11} aria-hidden="true" /> Source loading
      </span>
    )
  }
  const label = source.verification === 'verified' ? source.origin : `${source.origin} · sample`
  const content = (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-canvas px-2 py-1 text-[11px] font-semibold text-muted"
      title={`${label} · retrieved ${source.retrievedAt}`}
    >
      <Database size={11} aria-hidden="true" className="shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
      <span className="shrink-0 text-muted/70">· {source.retrievedAt}</span>
    </span>
  )
  return source.url ? (
    <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex min-w-0 max-w-full">
      {content}
    </a>
  ) : (
    content
  )
}

export function MissingValue({
  reason,
  action,
  title = 'Not published',
}: {
  reason: string
  action: string
  /** Heading for the gap. Use "Not published" only for data the institution has not released. */
  title?: string
}) {
  return (
    <span className="block rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
      <span className="flex items-start gap-2 font-semibold"><AlertCircle size={16} className="mt-0.5 shrink-0" /> {title}</span>
      <span className="mt-1 block text-xs leading-5 text-amber-900">{reason}</span>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-forest-700">{action} <ArrowUpRight size={12} /></span>
    </span>
  )
}

export function DataValue<T>({ point, className = '' }: { point: DataPoint<T>; className?: string }) {
  if (point.status === 'unknown') {
    return <MissingValue reason={point.reason} action={point.suggestedAction} />
  }
  return (
    <span className={`flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1.5 ${className}`}>
      <span className="min-w-0 break-words">{String(point.value)}</span>
      <SourceChip sourceId={point.sourceId} />
    </span>
  )
}

const componentOrder: FitDimension[] = ['academic', 'financial', 'language', 'career', 'geographic']

function FitComponentRow({ item }: { item: FitComponent }) {
  const colors = item.tone === 'strong' ? 'bg-emerald-100 text-emerald-800' : item.tone === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line p-3">
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${colors}`}>{item.grade}</span>
      <span>
        <span className="block font-bold">{item.label} · {item.score}/100</span>
        <span className="mt-1 block text-xs leading-5 text-muted">{item.reason}</span>
      </span>
    </div>
  )
}

export function FitBreakdown({ fit }: { fit: FitScore }) {
  return (
    <div className="mt-3 grid gap-2">
      {componentOrder.map((key) => <FitComponentRow key={key} item={fit.components[key]} />)}
      <p className="text-[11px] text-muted">Scoring model: {fit.version}. This is guidance, not an admission prediction.</p>
    </div>
  )
}

export function ExpandableFit({ fit, compact = false }: { fit: FitScore; compact?: boolean }) {
  return (
    <details className="group rounded-xl bg-white text-forest-900 shadow-lg ring-1 ring-black/5">
      <summary className={`flex cursor-pointer list-none items-center gap-2 ${compact ? 'p-1.5 pr-2.5' : 'p-2 pr-3'}`}>
        <span className={`grid place-items-center rounded-lg bg-forest-600 font-extrabold text-white ${compact ? 'size-8 text-sm' : 'size-11 text-lg'}`}>{fit.grade}</span>
        <span className="text-left">
          <span className="block text-[10px] font-bold uppercase tracking-[.12em] text-muted">4Prep fit · {fit.overall}/100</span>
          <span className="block text-xs font-bold">{fit.label}</span>
        </span>
        <ChevronDown size={14} className="ml-auto transition group-open:rotate-180" />
      </summary>
      <div className="w-[min(360px,calc(100vw-40px))] border-t border-line p-3"><FitBreakdown fit={fit} /></div>
    </details>
  )
}

export function AIResponseBlock({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-forest-200 bg-forest-50 p-5"><span className="flex items-center gap-2 text-sm font-bold text-forest-800"><Sparkles size={16} /> AI-assisted explanation</span><div className="mt-3 text-sm leading-6 text-muted">{children}</div></div>
}

export function SampleNotice({ verification = 'unverified_sample' }: { verification?: Verification }) {
  if (verification === 'verified') return null
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
      <Info size={15} className="mt-0.5 shrink-0" />
      <span><strong>Sample university — not verified.</strong> This fictional composite demonstrates 4Prep’s source-backed guidance. Verify all details before applying.</span>
    </div>
  )
}
