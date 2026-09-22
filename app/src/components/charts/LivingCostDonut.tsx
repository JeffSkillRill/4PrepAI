import type { University } from '../../types'
import { MissingValue, SourceChip } from '../Trust'
import { useCountUp, useScrollReveal } from '../../motion/hooks'
import { ChartFrame } from './ChartFrame'
import { chartPalette, chartSwatch, money, plottableAmounts, singleCurrency } from './chartUtils'

const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Published living-cost components as a donut.
 *
 * A single published component is a figure, not a breakdown, so the donut only
 * appears once at least two components share one currency. Everything else
 * falls back to the labelled gap.
 */
export function LivingCostDonut({ university }: { university: University }) {
  const { ref, revealed, animate } = useScrollReveal<HTMLDivElement>()
  const slices = plottableAmounts([
    { label: 'Accommodation', point: university.livingAccommodation },
    { label: 'Food', point: university.livingFood },
    { label: 'Transport', point: university.livingTransport },
    { label: 'Utilities', point: university.livingUtilities },
  ])
  const currency = slices.length > 0 ? singleCurrency(slices) : null
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0)
  const counted = useCountUp(total, animate, revealed)

  if (slices.length < 2) {
    return (
      <MissingValue
        title="Living-cost breakdown not published"
        reason={`A breakdown chart needs at least two sourced annual living-cost components; ${slices.length === 0 ? 'none is' : 'only one is'} published for this university.`}
        action="Read the individual living-cost figures below and ask the university for the rest."
      />
    )
  }
  if (!currency || total <= 0) {
    return (
      <MissingValue
        title="Living-cost components cannot share one chart"
        reason="The published living-cost components use different currencies, so placing them in one breakdown would mislead."
        action="Compare the individual figures below in their own published currencies."
      />
    )
  }

  const grown = animate ? (revealed ? 1 : 0) : 1
  const arcs = slices.reduce<Array<{ label: string; index: number; length: number; offset: number }>>((acc, slice, index) => {
    const previous = acc[acc.length - 1]
    const offset = previous ? previous.offset + previous.length : 0
    return [...acc, { label: slice.label, index, length: (slice.amount / total) * CIRCUMFERENCE, offset }]
  }, [])

  return (
    <ChartFrame
      summary={`Published annual living costs totalling ${money(currency, total)}. ${slices.map((slice) => `${slice.label}: ${money(currency, slice.amount)}, ${Math.round((slice.amount / total) * 100)} percent`).join('. ')}.`}
      tableCaption="Published annual living-cost components"
      rows={slices.map((slice) => ({
        label: slice.label,
        value: money(slice.currency, slice.amount),
        note: `${Math.round((slice.amount / total) * 100)}% of the published components shown`,
      }))}
      footer={<>The centre total is the sum of the {slices.length} published components shown, not a published cost-of-living figure.</>}
    >
      <div ref={ref} className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
        <svg viewBox="0 0 120 120" className="w-[152px] shrink-0" aria-hidden="true">
          <circle cx="60" cy="60" r={RADIUS} className="fill-none stroke-canvas" strokeWidth="16" />
          {arcs.map(({ label, index, length, offset: start }) => (
            <circle
              key={label}
              cx="60"
              cy="60"
              r={RADIUS}
              className={`chart-arc fill-none ${chartPalette[index % chartPalette.length].replace('fill-', 'stroke-')}`}
              strokeWidth="16"
              strokeDasharray={`${(length * grown).toFixed(2)} ${CIRCUMFERENCE}`}
              strokeDashoffset={-start * grown}
              transform="rotate(-90 60 60)"
            />
          ))}
          <text x="60" y="57" textAnchor="middle" className="display fill-forest-950 text-[15px] font-extrabold">
            {money(currency, Math.round(animate ? counted : total))}
          </text>
          <text x="60" y="72" textAnchor="middle" className="fill-muted text-[8px] font-bold uppercase tracking-[.12em]">
            Components shown
          </text>
        </svg>
        <ul className="min-w-0 flex-1 space-y-2.5">
          {slices.map((slice, index) => (
            <li key={slice.label} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className={`size-3 shrink-0 rounded-full ${chartSwatch[index % chartSwatch.length]}`} aria-hidden="true" />
              <span className="font-bold">{slice.label}</span>
              <span className="text-muted">{money(slice.currency, slice.amount)} / year</span>
              <SourceChip sourceId={slice.sourceId} />
            </li>
          ))}
        </ul>
      </div>
    </ChartFrame>
  )
}
