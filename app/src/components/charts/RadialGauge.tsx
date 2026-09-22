import { useCountUp, useScrollReveal } from '../../motion/hooks'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * A single published or computed percentage drawn as a 0-100 arc.
 *
 * The arc and the number animate together from the same progress, so the
 * figure a reader sees mid-animation always matches the arc, and both settle
 * on the real value.
 */
export function RadialGauge({
  value,
  caption,
  eyebrow,
  suffix = '',
  decimals = 0,
  size = 148,
}: {
  value: number
  caption: string
  eyebrow?: string
  suffix?: string
  decimals?: number
  size?: number
}) {
  const { ref, revealed, animate } = useScrollReveal<HTMLDivElement>()
  const counted = useCountUp(value, animate, revealed)
  const filled = Math.max(0, Math.min(100, animate ? (revealed ? value : 0) : value))
  const shown = animate ? counted : value

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={RADIUS} className="fill-none stroke-forest-50" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          className="chart-arc fill-none stroke-forest-700"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - filled / 100)}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="58" textAnchor="middle" className="display fill-forest-950 text-[26px] font-extrabold">
          {shown.toFixed(decimals)}{suffix}
        </text>
        {eyebrow && (
          <text x="60" y="76" textAnchor="middle" className="fill-muted text-[9px] font-bold uppercase tracking-[.14em]">
            {eyebrow}
          </text>
        )}
      </svg>
      <p className="mt-2 text-center text-xs font-semibold text-muted">{caption}</p>
    </div>
  )
}
