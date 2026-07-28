import type { DataPoint, University } from '../types'

export type AnnualAmount = {
  amount: number
  currency: string
  sourceId: string
}

export type PublishedCostScenario = {
  stickerCost: number
  publishedAid: number
  netCost: number
  currency: string
  costSourceId: string
  aidSourceId?: string
}

export function annualAmount(point: DataPoint<string>): AnnualAmount | null {
  if (
    point.status === 'unknown'
    || point.numericValue === undefined
    || !point.currency
    || !point.period
  ) return null
  const multiplier = point.period === 'month'
    ? 12
    : point.period === 'semester'
      ? 2
      : point.period === 'year'
        ? 1
        : null
  return multiplier === null
    ? null
    : { amount: point.numericValue * multiplier, currency: point.currency, sourceId: point.sourceId }
}

function largestAnnualScholarship(university: University, currency: string): AnnualAmount | null {
  const candidates = university.scholarships
    .map(({ amount }) => annualAmount(amount))
    .filter((amount): amount is AnnualAmount => amount !== null && amount.currency === currency)
  return candidates.reduce<AnnualAmount | null>(
    (largest, amount) => largest === null || amount.amount > largest.amount ? amount : largest,
    null,
  )
}

function publishedAid(university: University, currency: string): AnnualAmount | null {
  const institutional = annualAmount(university.aidInternational)
  if (institutional?.currency === currency) return institutional
  return largestAnnualScholarship(university, currency)
}

export function hasFullNeedPolicy(university: University): boolean {
  return university.aidInternational.status === 'known'
    && (
      /\b(?:meets?|meeting)\s+(?:100%\s+of\s+)?(?:full\s+)?demonstrated\s+(?:financial\s+)?need\b/i.test(university.aidInternational.value)
      || /\bfull demonstrated (?:financial )?need is met\b/i.test(university.aidInternational.value)
    )
}

export function hasComprehensiveInternationalFunding(university: University): boolean {
  return university.aidInternational.status === 'known'
    && /\b100%\s+funding\s+(?:to|for)\s+100%\s+of\s+enrolled international students\b/i.test(university.aidInternational.value)
}

export function bestPublishedCostScenario(university: University): PublishedCostScenario | null {
  const sticker = annualAmount(university.totalCostOfAttendance)
  if (!sticker) return null
  const aid = publishedAid(university, sticker.currency)
  const publishedAidAmount = aid?.amount ?? 0
  return {
    stickerCost: sticker.amount,
    publishedAid: publishedAidAmount,
    netCost: Math.max(0, sticker.amount - publishedAidAmount),
    currency: sticker.currency,
    costSourceId: sticker.sourceId,
    ...(aid ? { aidSourceId: aid.sourceId } : {}),
  }
}
