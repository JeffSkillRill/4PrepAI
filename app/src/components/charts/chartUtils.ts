import type { DataPoint } from '../../types'
import { annualAmount } from '../../scoring/costs'

/**
 * Sequential forest ramp. Charts here are compositions of one thing (money,
 * programmes, positions), so a single-hue ramp reads as one quantity rather
 * than inviting a categorical reading the data does not support.
 */
export const chartPalette = ['fill-forest-800', 'fill-forest-600', 'fill-forest-400', 'fill-forest-200'] as const
export const chartSwatch = ['bg-forest-800', 'bg-forest-600', 'bg-forest-400', 'bg-forest-200'] as const

export const money = (currency: string, amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

export type PlottedAmount = {
  label: string
  amount: number
  currency: string
  sourceId: string
}

/**
 * Turns labelled data points into plottable amounts. A point without a sourced
 * numeric annual value is dropped rather than zeroed: an absent figure is not
 * a figure of zero, and a zero slice would assert a cost the university never
 * published.
 */
export function plottableAmounts(entries: Array<{ label: string; point: DataPoint<string> }>): PlottedAmount[] {
  return entries.flatMap(({ label, point }) => {
    const annual = annualAmount(point)
    return annual ? [{ label, amount: annual.amount, currency: annual.currency, sourceId: annual.sourceId }] : []
  })
}

/** Amounts in more than one currency cannot share a scale without misleading. */
export function singleCurrency(amounts: PlottedAmount[]): string | null {
  const currencies = new Set(amounts.map((item) => item.currency))
  return currencies.size === 1 ? amounts[0].currency : null
}

/**
 * A published percentage, or null. Only a point the source tagged as a
 * percentage qualifies; a bare number of unknown unit is never coerced.
 */
export function publishedPercentage(point: DataPoint<string>): { value: number; sourceId: string } | null {
  if (point.status === 'unknown') return null
  if (point.period !== 'percentage' || point.numericValue === undefined) return null
  if (!Number.isFinite(point.numericValue) || point.numericValue < 0 || point.numericValue > 100) return null
  return { value: point.numericValue, sourceId: point.sourceId }
}

/**
 * An exact published league position, or null. Only a plain position parses:
 * banded text such as "Top 50" or "51-100" names a range, and placing it on a
 * position scale would invent a precision the ranking body did not publish.
 */
export function exactRankPosition(rankDisplay: string): number | null {
  const match = /^#?\s*(\d{1,5})$/.exec(rankDisplay.trim())
  if (!match) return null
  const position = Number(match[1])
  return position > 0 ? position : null
}
