import {
  ArrowUpRight,
  ChevronDown,
  ClipboardList,
  Database,
  FileSearch,
  Info,
  Sparkles,
} from 'lucide-react'
import type { DataPoint, FitComponent, FitDimension, FitScore, Verification } from '../types'
import { useSource } from '../data/DataProvider'

export function SourceChip({ sourceId }: { sourceId: string }) {
  const source = useSource(sourceId)
  if (!source) {
    return (
      <span className="trust-static inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-1 text-[11px] font-semibold text-muted">
        <Database size={11} aria-hidden="true" /> Source loading
      </span>
    )
  }
  const label = source.verification === 'verified' ? source.origin : `${source.origin} · sample`
  const content = (
    <span
      className="trust-static inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-canvas px-2 py-1 text-[11px] font-semibold text-muted"
      title={`${label} · retrieved ${source.retrievedAt}`}
    >
      <Database size={11} aria-hidden="true" className="shrink-0" />
      <span className="sm:hidden">Source</span>
      <span className="hidden min-w-0 truncate sm:inline">{label}</span>
      <span className="hidden shrink-0 text-muted/70 sm:inline">· {source.retrievedAt}</span>
    </span>
  )
  return source.url ? (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className="trust-static -my-2 inline-flex min-h-11 min-w-0 max-w-full items-center py-2"
      aria-label={`${label}, retrieved ${source.retrievedAt}. Opens official source.`}
    >
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
  kind = 'institution',
}: {
  reason: string
  action: string
  /** Heading for the gap. Use "Not published" only for data the institution has not released. */
  title?: string
  kind?: 'institution' | 'profile'
}) {
  const Icon = kind === 'profile' ? ClipboardList : FileSearch
  const eyebrow = kind === 'profile' ? 'Needs your answers' : 'Official data gap'
  const tone = kind === 'profile'
    ? 'border-sky-200 bg-sky-50/70 text-sky-950'
    : 'border-forest-100 bg-canvas text-forest-950'
  return (
    <span className={`trust-static block rounded-xl border p-3 text-sm ${tone}`}>
      <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[.13em] opacity-70">{eyebrow}</span>
      <span className="flex items-start gap-2 font-semibold"><Icon size={16} className="mt-0.5 shrink-0" /> {title}</span>
      <span className="mt-1 block text-xs leading-5 opacity-80">{reason}</span>
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

type HonestGapItem = {
  label: string
  point: DataPoint<unknown>
}

export function HonestGapCluster({ items }: { items: HonestGapItem[] }) {
  const gaps = items.flatMap(({ label, point }) => (
    point.status === 'unknown' ? [{ label, reason: point.reason, action: point.suggestedAction }] : []
  ))
  if (gaps.length === 0) return null

  return (
    <details className="trust-static rounded-2xl border border-forest-100 bg-white">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 text-left">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700">
          <FileSearch size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-extrabold uppercase tracking-[.13em] text-forest-700">Published-data coverage</span>
          <span className="block text-sm font-bold">{gaps.length} official figure{gaps.length === 1 ? ' is' : 's are'} not published</span>
        </span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div className="border-t border-line p-4">
        <p className="text-sm leading-6 text-muted">These are deliberate gaps in the university’s published information, not app errors.</p>
        <ul className="mt-4 grid gap-3">
          {gaps.map((gap) => (
            <li key={gap.label} className="rounded-xl bg-canvas p-3">
              <p className="font-bold">{gap.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{gap.reason}</p>
              <p className="mt-2 text-xs font-bold text-forest-700">{gap.action}</p>
            </li>
          ))}
        </ul>
      </div>
    </details>
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
  const components = componentOrder.map((key) => fit.components[key])
  const chartLabel = components.map((item) => `${item.label}: ${item.score} of 100, grade ${item.grade}. ${item.reason}`).join(' ')
  return (
    <div className="mt-3 grid gap-2">
      <div className="chart-focusable rounded-xl border border-line bg-canvas p-3" role="img" aria-label={`Five deterministic fit components. ${chartLabel}`} tabIndex={0}>
        <div className="grid gap-2" aria-hidden="true">
          {components.map((item) => (
            <div key={item.label} className="grid grid-cols-[78px_1fr_38px] items-center gap-2 text-[11px] font-bold">
              <span className="truncate text-muted">{item.label}</span>
              <span className="h-2.5 overflow-hidden rounded-full border border-line bg-white">
                <span className="block h-full origin-left rounded-full bg-forest-700" style={{ width: `${item.score}%` }} />
              </span>
              <span className="text-right text-forest-800">{item.score}</span>
            </div>
          ))}
        </div>
        <div className="sr-only"><table>
          <caption>Five deterministic fit components with reasons</caption>
          <thead><tr><th>Component</th><th>Score</th><th>Grade</th><th>Reason</th></tr></thead>
          <tbody>{components.map((item) => <tr key={item.label}><th>{item.label}</th><td>{item.score} of 100</td><td>{item.grade}</td><td>{item.reason}</td></tr>)}</tbody>
        </table></div>
      </div>
      {componentOrder.map((key) => <FitComponentRow key={key} item={fit.components[key]} />)}
      <p className="text-[11px] text-muted">Scoring model: {fit.version}. This is guidance, not an admission prediction.</p>
    </div>
  )
}

export function ExpandableFit({ fit, compact = false }: { fit: FitScore; compact?: boolean }) {
  return (
    <details className="group w-full rounded-xl bg-white text-forest-900 shadow-lg ring-1 ring-black/5">
      <summary className={`flex min-h-11 cursor-pointer list-none items-center gap-2 ${compact ? 'p-1.5 pr-2.5' : 'p-2 pr-3'}`}>
        <span className={`grid place-items-center rounded-lg bg-forest-600 font-extrabold text-white ${compact ? 'size-8 text-sm' : 'size-11 text-lg'}`}>{fit.grade}</span>
        <span className="min-w-0 text-left">
          <span className="block text-[10px] font-bold uppercase tracking-[.12em] text-muted">4Prep fit · {fit.overall}/100</span>
          <span className="block truncate text-xs font-bold">{fit.label} · open five reasons</span>
        </span>
        <ChevronDown size={14} className="ml-auto transition group-open:rotate-180" />
      </summary>
      <div className="motion-disclosure">
        <div className="overflow-hidden">
          <div className="border-t border-line p-3"><FitBreakdown fit={fit} /></div>
        </div>
      </div>
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
