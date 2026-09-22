import type { University } from '../../types'
import { MissingValue, SourceChip } from '../Trust'
import { annualAmount } from '../../scoring/costs'
import { useScrollReveal } from '../../motion/hooks'
import { ChartFrame } from './ChartFrame'
import { chartSwatch, money, plottableAmounts, singleCurrency } from './chartUtils'

/**
 * Published budget components stacked against the published total.
 *
 * The bar plots only components the university published. When the total is
 * larger than the components, the gap is left visibly unfilled and named as
 * "not itemised" rather than being filled with a derived figure.
 */
export function BudgetComposition({ university }: { university: University }) {
  const { ref, revealed, animate } = useScrollReveal<HTMLDivElement>()
  const segments = plottableAmounts([
    { label: 'Tuition', point: university.tuition },
    { label: 'Mandatory fees', point: university.fees },
    { label: 'Room and board', point: university.roomBoard },
  ])
  const total = annualAmount(university.totalCostOfAttendance)
  const currency = segments.length > 0 ? singleCurrency(segments) : null

  if (segments.length === 0) {
    return (
      <MissingValue
        title="Budget composition not published"
        reason="No tuition, fee or room-and-board component has a sourced numeric annual value, so there is nothing to compose a bar from."
        action="Ask the university for its itemised published cost of attendance."
      />
    )
  }
  if (!currency) {
    return (
      <MissingValue
        title="Budget components cannot share one bar"
        reason="The published budget components use different currencies, so stacking them on one scale would mislead."
        action="Compare the individual figures in their own published currencies."
      />
    )
  }

  const componentSum = segments.reduce((sum, segment) => sum + segment.amount, 0)
  // Only a total in the same currency can act as the scale for these parts.
  const scaleTotal = total && total.currency === currency ? Math.max(total.amount, componentSum) : componentSum
  const unitemised = total && total.currency === currency ? Math.max(0, total.amount - componentSum) : 0
  const grown = animate ? (revealed ? 1 : 0) : 1
  const missingLabels = (['Tuition', 'Mandatory fees', 'Room and board'] as const)
    .filter((label) => !segments.some((segment) => segment.label === label))

  return (
    <ChartFrame
      summary={`Published annual budget components on one ${currency} scale. ${segments.map((segment) => `${segment.label}: ${money(currency, segment.amount)}`).join('. ')}.${total && total.currency === currency ? ` Published total cost of attendance: ${money(currency, total.amount)}.` : ''}${unitemised > 0 ? ` ${money(currency, unitemised)} of that total is not itemised in the published components.` : ''}${missingLabels.length > 0 ? ` Not in the bar because no sourced numeric value is published: ${missingLabels.join(', ')}.` : ''}`}
      tableCaption="Published annual budget components against the published total"
      rows={[
        ...segments.map((segment) => ({
          label: segment.label,
          value: money(segment.currency, segment.amount),
          note: `${Math.round((segment.amount / scaleTotal) * 100)}% of the scale`,
        })),
        ...(unitemised > 0 ? [{ label: 'Not itemised in published components', value: money(currency, unitemised), note: 'Difference between the published total and the published components' }] : []),
        ...missingLabels.map((label) => ({ label, value: 'Not published', note: 'Excluded from the bar; no sourced numeric annual value' })),
        ...(total && total.currency === currency ? [{ label: 'Published total cost of attendance', value: money(currency, total.amount), note: 'Scale for the bar' }] : []),
      ]}
      footer={missingLabels.length > 0
        ? <>{missingLabels.join(', ')} {missingLabels.length === 1 ? 'is' : 'are'} absent from the bar because no sourced numeric annual value is published — the bar is a partial view, not the whole budget.</>
        : <>All three published components are shown{total && total.currency === currency ? ' against the published total cost of attendance' : ''}.</>}
    >
      <div ref={ref}>
        <div className="flex h-9 w-full overflow-hidden rounded-full border border-line bg-canvas">
          {segments.map((segment, index) => (
            <span
              key={segment.label}
              className={`chart-grow block h-full ${chartSwatch[index % chartSwatch.length]}`}
              style={{ width: `${(segment.amount / scaleTotal) * 100 * grown}%` }}
            />
          ))}
          {unitemised > 0 && (
            <span
              className="chart-grow chart-unitemised block h-full"
              style={{ width: `${(unitemised / scaleTotal) * 100 * grown}%` }}
            />
          )}
        </div>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {segments.map((segment, index) => (
            <li key={segment.label} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className={`size-3 shrink-0 rounded-full ${chartSwatch[index % chartSwatch.length]}`} aria-hidden="true" />
              <span className="font-bold">{segment.label}</span>
              <span className="text-muted">{money(segment.currency, segment.amount)}</span>
              <SourceChip sourceId={segment.sourceId} />
            </li>
          ))}
          {unitemised > 0 && total && (
            <li className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="chart-unitemised size-3 shrink-0 rounded-full border border-line" aria-hidden="true" />
              <span className="font-bold">Not itemised</span>
              <span className="text-muted">{money(currency, unitemised)} of the published total</span>
              <SourceChip sourceId={total.sourceId} />
            </li>
          )}
        </ul>
      </div>
    </ChartFrame>
  )
}
