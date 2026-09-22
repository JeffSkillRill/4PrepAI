import type { FitDimension, FitScore } from '../../types'
import { useCountUp, useScrollReveal } from '../../motion/hooks'
import { ChartFrame } from './ChartFrame'
import { RadialGauge } from './RadialGauge'

const order: FitDimension[] = ['academic', 'financial', 'language', 'career', 'geographic']

const CENTRE_X = 100
const CENTRE_Y = 88
const MAX_RADIUS = 58
const LABEL_RADIUS = 74

const axisPoint = (index: number, radius: number) => {
  const angle = (-90 + index * 72) * (Math.PI / 180)
  return { x: CENTRE_X + Math.cos(angle) * radius, y: CENTRE_Y + Math.sin(angle) * radius }
}

const axisLabel = (label: string) => label.replace(/\s*fit$/i, '')

export function resolvedFitComponents(fit: FitScore) {
  return order.filter((key) => fit.components[key]?.resolved)
}

/** Overall fit as an arc. `fit.overall` is already the resolved-only weighted score. */
export function FitGauge({ fit }: { fit: FitScore }) {
  const resolved = resolvedFitComponents(fit)
  const rows = order.map((key) => {
    const item = fit.components[key]
    return {
      label: item.label,
      value: item.resolved ? `${item.score} of 100, grade ${item.grade}` : 'Unresolved',
      note: item.reason,
    }
  })

  return (
    <ChartFrame
      summary={`Overall 4Prep fit ${fit.overall} of 100, grade ${fit.grade}. ${resolved.length} of five components are resolved from published data and weighted into this score.`}
      tableCaption="Overall 4Prep fit and the state of each component"
      rows={[{ label: 'Overall fit', value: `${fit.overall} of 100, grade ${fit.grade}`, note: fit.summary }, ...rows]}
      footer={<>Weighted from the {resolved.length} component{resolved.length === 1 ? '' : 's'} that could be resolved from published data. Unresolved components are left out rather than guessed. Scoring model {fit.version}; guidance, not an admission prediction.</>}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <RadialGauge value={fit.overall} eyebrow={`Grade ${fit.grade}`} caption="Overall fit out of 100" />
        <div className="min-w-0 flex-1">
          <p className="display text-xl font-extrabold text-forest-950">{fit.label}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{fit.summary}</p>
        </div>
      </div>
    </ChartFrame>
  )
}

/**
 * The five components as a radar.
 *
 * Only resolved components get a vertex. An unresolved component carries a
 * placeholder score inside the scoring model, so plotting it would draw a
 * number the student's data never produced; its spoke is drawn empty instead.
 */
export function FitRadar({ fit }: { fit: FitScore }) {
  const { ref, revealed, animate } = useScrollReveal<HTMLDivElement>()
  const progress = useCountUp(1, animate, revealed)
  const grown = animate ? progress : 1

  const resolved = order.flatMap((key, index) => {
    const item = fit.components[key]
    return item.resolved ? [{ key, index, item }] : []
  })
  const unresolved = order.filter((key) => !fit.components[key].resolved)
  if (resolved.length < 3) return null

  const vertices = resolved
    .map(({ index, item }) => axisPoint(index, (item.score / 100) * MAX_RADIUS * grown))
    .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ')

  return (
    <ChartFrame
      summary={`Radar of the fit components resolved from published data. ${resolved.map(({ item }) => `${item.label}: ${item.score} of 100`).join('. ')}.${unresolved.length > 0 ? ` Not plotted because they are unresolved: ${unresolved.map((key) => fit.components[key].label).join(', ')}.` : ''}`}
      tableCaption="Resolved fit components plotted on the radar"
      rows={order.map((key) => ({
        label: fit.components[key].label,
        value: fit.components[key].resolved ? `${fit.components[key].score} of 100` : 'Not plotted',
        note: fit.components[key].resolved ? fit.components[key].grade : 'Unresolved, so no point is drawn',
      }))}
      footer={unresolved.length > 0
        ? <>{unresolved.map((key) => axisLabel(fit.components[key].label)).join(', ')} {unresolved.length === 1 ? 'is' : 'are'} unresolved, so {unresolved.length === 1 ? 'its axis carries' : 'their axes carry'} no point. Read the reason beside each component below.</>
        : <>All five components are resolved from published data.</>}
    >
      <div ref={ref}>
        <svg viewBox="0 0 200 176" className="mx-auto block w-full max-w-[280px]" aria-hidden="true">
          {[0.25, 0.5, 0.75, 1].map((step) => (
            <polygon
              key={step}
              points={order.map((_, index) => {
                const point = axisPoint(index, MAX_RADIUS * step)
                return `${point.x.toFixed(2)},${point.y.toFixed(2)}`
              }).join(' ')}
              className="fill-none stroke-line"
              strokeWidth="1"
            />
          ))}
          {order.map((key, index) => {
            const edge = axisPoint(index, MAX_RADIUS)
            const isResolved = fit.components[key].resolved
            return (
              <line
                key={key}
                x1={CENTRE_X}
                y1={CENTRE_Y}
                x2={edge.x}
                y2={edge.y}
                className={isResolved ? 'stroke-line' : 'stroke-muted/60'}
                strokeWidth="1"
                strokeDasharray={isResolved ? undefined : '3 3'}
              />
            )
          })}
          <polygon points={vertices} className="fill-forest-500/25 stroke-forest-700" strokeWidth="2" strokeLinejoin="round" />
          {resolved.map(({ key, index, item }) => {
            const point = axisPoint(index, (item.score / 100) * MAX_RADIUS * grown)
            return <circle key={key} cx={point.x} cy={point.y} r="3.5" className="fill-forest-800" />
          })}
          {order.map((key, index) => {
            const point = axisPoint(index, LABEL_RADIUS)
            const anchor = point.x > CENTRE_X + 2 ? 'start' : point.x < CENTRE_X - 2 ? 'end' : 'middle'
            const isResolved = fit.components[key].resolved
            return (
              <text
                key={key}
                x={point.x}
                y={point.y + 3}
                textAnchor={anchor}
                className={`text-[9px] font-bold uppercase tracking-[.08em] ${isResolved ? 'fill-forest-800' : 'fill-muted'}`}
              >
                {axisLabel(fit.components[key].label)}
                {!isResolved && <tspan className="fill-muted"> ·</tspan>}
              </text>
            )
          })}
        </svg>
      </div>
    </ChartFrame>
  )
}
