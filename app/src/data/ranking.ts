import type { Ranking, University } from '../types'

/** The one ranking that orders the catalogue. Rows carry this exact label. */
export const QS_WORLD_LABEL = 'QS World University Rankings'

/** The university's QS World ranking row, or null when QS does not rank it. */
export function qsWorldRanking(university: University): Ranking | null {
  return university.rankings.find((ranking) => ranking.label === QS_WORLD_LABEL && ranking.rankSort !== null) ?? null
}

/** QS-ranked universities first by position (bands by their lower bound), then the rest by name. */
export function compareByQsRank(left: University, right: University): number {
  const leftRank = qsWorldRanking(left)?.rankSort ?? Number.POSITIVE_INFINITY
  const rightRank = qsWorldRanking(right)?.rankSort ?? Number.POSITIVE_INFINITY
  if (leftRank !== rightRank) return leftRank < rightRank ? -1 : 1
  return left.name.localeCompare(right.name)
}
