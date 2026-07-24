import { AlertCircle, ArrowUpRight, Database, Info } from 'lucide-react'
import type { DataPoint, DataSource } from '../types'

export function SourceChip({ source }: { source: DataSource }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-1 text-[11px] font-semibold text-muted"
      title={`Checked ${source.checkedAt}`}
    >
      <Database size={11} aria-hidden="true" /> {source.label}
    </span>
  )
}

export function MissingValue({ reason, action }: { reason: string; action: string }) {
  return (
    <span className="block rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
      <span className="flex items-start gap-2 font-semibold"><AlertCircle size={16} className="mt-0.5 shrink-0" /> Not published</span>
      <span className="mt-1 block text-xs leading-5 text-amber-900">{reason}</span>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-forest-700">{action} <ArrowUpRight size={12} /></span>
    </span>
  )
}

export function DataValue<T>({ point, className = '' }: { point: DataPoint<T>; className?: string }) {
  if (point.value === null) {
    return <MissingValue reason={point.missingReason ?? 'This value is unavailable.'} action={point.nextAction ?? 'Verify with the university.'} />
  }
  return (
    <span className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span>{String(point.value)}</span>
      <SourceChip source={point.source} />
    </span>
  )
}

export function SampleNotice() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
      <Info size={15} className="mt-0.5 shrink-0" />
      <span><strong>Sample university.</strong> This fictional composite demonstrates 4Prep’s source-backed guidance. Verify all details before applying.</span>
    </div>
  )
}
