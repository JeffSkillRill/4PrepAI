import type { University } from '../types'
import {
  bestPublishedCostScenario,
  hasComprehensiveInternationalFunding,
  hasFullNeedPolicy,
} from '../scoring/costs'
import { SourceChip } from './Trust'

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
