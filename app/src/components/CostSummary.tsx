import { ChevronDown, CircleDollarSign, Landmark, Maximize2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { University } from '../types'
import {
  annualAmount,
  bestPublishedCostScenario,
  hasComprehensiveInternationalFunding,
  hasFullNeedPolicy,
} from '../scoring/costs'
import { DataValue, SourceChip } from './Trust'
import type { DataPoint } from '../types'

const money = (currency: string, amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)

export function PublishedNetCost({ university, compact = false, showSources = true }: { university: University; compact?: boolean; showSources?: boolean }) {
  if (hasFullNeedPolicy(university)) {
    const sourceId = university.aidInternational.status === 'known'
      ? university.aidInternational.sourceId
      : null
    return (
      <span className="flex min-w-0 max-w-full flex-wrap items-start gap-1.5">
        <span className="min-w-0 break-words">Individual after full-need aid</span>
        {showSources && sourceId && <SourceChip sourceId={sourceId} />}
      </span>
    )
  }

  if (hasComprehensiveInternationalFunding(university)) {
    const sourceId = university.aidInternational.status === 'known'
      ? university.aidInternational.sourceId
      : null
    return (
      <span className="flex min-w-0 max-w-full flex-wrap items-start gap-1.5">
        <span className="min-w-0 break-words">Individual after comprehensive funding</span>
        {showSources && sourceId && <SourceChip sourceId={sourceId} />}
      </span>
    )
  }

  const scenario = bestPublishedCostScenario(university)
  if (!scenario) {
    return (
      <span title="A sourced numeric cost of attendance and aid amount are needed for this calculation.">
        Not computable from published figures
      </span>
    )
  }

  const sourceIds = [...new Set([
    scenario.costSourceId,
    ...(scenario.aidSourceId ? [scenario.aidSourceId] : []),
  ])]
  return (
    <span>
      <span className="flex min-w-0 max-w-full flex-wrap items-start gap-1.5">
        <span className="min-w-0 break-words">{money(scenario.currency, scenario.netCost)} / year</span>
        {showSources && sourceIds.map((sourceId) => <SourceChip key={sourceId} sourceId={sourceId} />)}
      </span>
      {scenario.publishedAid > 0 && (
        <span className={`block font-normal text-muted ${compact ? 'mt-1 text-[11px] leading-4' : 'mt-1 text-xs leading-5'}`}>
          Best published scenario if the {money(scenario.currency, scenario.publishedAid)} annual award is received.
        </span>
      )}
      {scenario.publishedAid === 0 && (
        <span className={`block font-normal text-muted ${compact ? 'mt-1 text-[11px] leading-4' : 'mt-1 text-xs leading-5'}`}>
          No numeric institutional award was subtracted.
        </span>
      )}
    </span>
  )
}

export function CostSummary({
  university,
  compact = false,
}: {
  university: University
  compact?: boolean
}) {
  const [componentsOpen, setComponentsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!componentsOpen || typeof document === 'undefined') return
    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef.current
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setComponentsOpen(false)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      trigger?.focus()
    }
  }, [componentsOpen])

  return (
    <section className={`rounded-2xl border border-forest-100 bg-forest-50/60 ${compact ? 'p-2.5' : 'p-5 sm:p-6'}`}>
      <div className={`flex items-start ${compact ? 'gap-2' : 'gap-3'}`}>
        <span className={`grid shrink-0 place-items-center bg-forest-700 text-white ${compact ? 'size-8 rounded-lg' : 'size-11 rounded-xl'}`}>
          <CircleDollarSign size={compact ? 18 : 21} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`${compact ? 'sr-only' : 'text-[11px]'} font-extrabold uppercase tracking-[.13em] text-forest-700`}>Start with the aid-adjusted view</p>
          <div className={`${compact ? 'text-xs leading-5' : 'mt-1 text-xl'} font-extrabold text-forest-950`}>
            <PublishedNetCost university={university} compact={compact} showSources={!compact} />
          </div>
          {!compact && <p id="published-aid-caution" className="mt-2 text-xs leading-5 text-muted">Published aid is not your personal offer. Confirm eligibility and ask for an offer.</p>}
        </div>
      </div>

      {!compact && <CostCompositionChart university={university} />}

      {!compact && <div className="mt-4 border-t border-forest-100 pt-4">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-muted">Published sticker cost · before aid</p>
        <div className="mt-1 text-sm font-bold">
          <DataValue point={university.totalCostOfAttendance} />
        </div>
      </div>}

      {compact ? (
        <button ref={triggerRef} type="button" onClick={() => setComponentsOpen(true)} aria-label="Cost components and visa funds" aria-haspopup="dialog" aria-expanded={componentsOpen} className="mt-2 flex min-h-9 w-full items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-left text-xs font-bold text-forest-800 transition hover:border-forest-300 hover:bg-canvas">
          <Landmark size={15} />
          Cost details
          <Maximize2 size={14} className="ml-auto shrink-0" />
        </button>
      ) : (
        <details className="group mt-4 rounded-xl border border-line bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-forest-800">
            <Landmark size={17} />
            Cost components and visa funds
            <ChevronDown size={16} className="ml-auto transition group-open:rotate-180" />
          </summary>
          <div className="motion-disclosure">
            <div className="overflow-hidden">
              <CostComponents university={university} className="border-t border-line px-4" />
            </div>
          </div>
        </details>
      )}
      {componentsOpen && typeof document !== 'undefined' && createPortal(
        <div className="cost-modal-backdrop fixed inset-0 z-[80] grid place-items-center bg-ink/65 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setComponentsOpen(false) }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="cost-modal-dialog flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
            <div className="flex items-start gap-4 border-b border-line bg-canvas px-5 py-4 sm:px-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-700 text-white"><Landmark size={20} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-forest-700">Published evidence</p>
                <h2 id={titleId} className="display mt-1 text-xl font-extrabold text-forest-950 sm:text-2xl">{university.name} cost components and visa funds</h2>
              </div>
              <button ref={closeRef} type="button" onClick={() => setComponentsOpen(false)} className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-white text-forest-800 transition hover:bg-forest-50" aria-label="Close cost components"><X size={19} /></button>
            </div>
            <div className="overflow-y-auto px-5 sm:px-6">
              <div className="border-b border-line py-4">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-muted">Published annual cost of attendance</p>
                <DataValue point={university.totalCostOfAttendance} className="mt-1 text-sm font-bold" />
              </div>
              <CostComponents university={university} />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  )
}

function CostComponents({ university, className = '' }: { university: University; className?: string }) {
  return (
    <dl className={`divide-y divide-line ${className}`}>
      <CostRow label="Tuition" value={<DataValue point={university.tuition} />} />
      <CostRow label="Mandatory fees" value={<DataValue point={university.fees} />} />
      <CostRow label="Room and board" value={<DataValue point={university.roomBoard} />} />
      <CostRow label="International aid policy or award" value={<DataValue point={university.aidInternational} />} />
      <CostRow label="F-1 financial certification" value={<DataValue point={university.financialCertification} />} />
    </dl>
  )
}

function CostCompositionChart({ university }: { university: University }) {
  const components: Array<{ label: string; point: DataPoint<string> }> = [
    { label: 'Tuition', point: university.tuition },
    { label: 'Mandatory fees', point: university.fees },
    { label: 'Room and board', point: university.roomBoard },
  ]
  const rows = components.map((component) => ({
    ...component,
    annual: annualAmount(component.point),
  }))
  const known = rows.filter((row) => row.annual !== null)
  const currencies = new Set(known.map((row) => row.annual?.currency))
  if (known.length === 0) {
    return <p className="mt-4 rounded-xl border border-line bg-white p-3 text-xs leading-5 text-muted">Cost-component chart not shown: no component has a sourced numeric annual value. The labelled gaps remain available below.</p>
  }
  if (currencies.size !== 1) {
    return <p className="mt-4 rounded-xl border border-line bg-white p-3 text-xs leading-5 text-muted">Cost-component chart not shown: published components use different currencies, so placing them on one scale would mislead.</p>
  }
  const max = Math.max(...known.map((row) => row.annual?.amount ?? Number.NEGATIVE_INFINITY))
  const currency = known[0].annual?.currency ?? ''
  const label = rows.map((row) => row.annual
    ? `${row.label}: ${money(row.annual.currency, row.annual.amount)} per year.`
    : `${row.label}: not charted because no sourced numeric annual value exists.`).join(' ')

  return (
    <div className="chart-focusable mt-5 rounded-xl border border-line bg-white p-4" role="img" aria-label={`Published annual cost components on the same scale. ${label}`} tabIndex={0}>
      <p className="text-xs font-extrabold uppercase tracking-[.12em] text-muted">Published annual components · same {currency} scale</p>
      <div className="mt-3 grid gap-3" aria-hidden="true">
        {rows.map((row) => row.annual ? (
          <div key={row.label}>
            <div className="flex items-center justify-between gap-3 text-xs font-bold"><span>{row.label}</span><span>{money(row.annual.currency, row.annual.amount)}</span></div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full border border-line bg-canvas"><span className="block h-full rounded-full bg-forest-700" style={{ width: `${max > 0 ? (row.annual.amount / max) * 100 : 100}%` }} /></div>
            <div className="mt-1"><SourceChip sourceId={row.annual.sourceId} /></div>
          </div>
        ) : (
          <div key={row.label} className="rounded-lg border border-dashed border-muted p-3 text-xs text-muted">
            <strong className="text-ink">{row.label}: labelled gap</strong>
            <span className="mt-1 block">Not charted because a sourced numeric annual value is unavailable.</span>
          </div>
        ))}
      </div>
      <div className="sr-only"><table>
        <caption>Published annual cost components</caption>
        <thead><tr><th>Component</th><th>Value</th><th>Source</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.label}><th>{row.label}</th><td>{row.annual ? `${money(row.annual.currency, row.annual.amount)} per year` : 'Not charted; sourced numeric annual value unavailable'}</td><td>{row.annual?.sourceId ?? 'No source used'}</td></tr>)}</tbody>
      </table></div>
    </div>
  )
}

function CostRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 text-sm sm:grid-cols-[150px_1fr] sm:gap-3">
      <dt className="font-bold text-muted">{label}</dt>
      <dd className="min-w-0 font-semibold text-ink">{value}</dd>
    </div>
  )
}
