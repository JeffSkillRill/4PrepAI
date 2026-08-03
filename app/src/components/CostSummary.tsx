import { ChevronDown, CircleDollarSign, Landmark } from 'lucide-react'
import type { University } from '../types'
import {
  bestPublishedCostScenario,
  hasComprehensiveInternationalFunding,
  hasFullNeedPolicy,
} from '../scoring/costs'
import { DataValue, SourceChip } from './Trust'

const money = (currency: string, amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)

export function PublishedNetCost({ university, compact = false }: { university: University; compact?: boolean }) {
  if (hasFullNeedPolicy(university)) {
    const sourceId = university.aidInternational.status === 'known'
      ? university.aidInternational.sourceId
      : null
    return (
      <span className="flex min-w-0 max-w-full flex-wrap items-start gap-1.5">
        <span className="min-w-0 break-words">Individual after full-need aid</span>
        {sourceId && <SourceChip sourceId={sourceId} />}
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
        {sourceId && <SourceChip sourceId={sourceId} />}
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
        {sourceIds.map((sourceId) => <SourceChip key={sourceId} sourceId={sourceId} />)}
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
  return (
    <section className={`rounded-2xl border border-forest-100 bg-forest-50/60 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-700 text-white">
          <CircleDollarSign size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[.13em] text-forest-700">Start with the aid-adjusted view</p>
          <div className={`${compact ? 'mt-1 text-base' : 'mt-1 text-xl'} font-extrabold text-forest-950`}>
            <PublishedNetCost university={university} compact={compact} />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-forest-100 pt-4">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-muted">Published sticker cost · before aid</p>
        <div className="mt-1 text-sm font-bold">
          <DataValue point={university.totalCostOfAttendance} />
        </div>
      </div>

      <details className="group mt-4 rounded-xl border border-line bg-white">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-forest-800">
          <Landmark size={17} />
          Cost components and visa funds
          <ChevronDown size={16} className="ml-auto transition group-open:rotate-180" />
        </summary>
        <div className="motion-disclosure">
          <div className="overflow-hidden">
            <dl className="divide-y divide-line border-t border-line px-4">
              <CostRow label="Tuition" value={<DataValue point={university.tuition} />} />
              <CostRow label="Mandatory fees" value={<DataValue point={university.fees} />} />
              <CostRow label="Room and board" value={<DataValue point={university.roomBoard} />} />
              <CostRow label="International aid policy or award" value={<DataValue point={university.aidInternational} />} />
              <CostRow label="F-1 financial certification" value={<DataValue point={university.financialCertification} />} />
            </dl>
          </div>
        </div>
      </details>
    </section>
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
