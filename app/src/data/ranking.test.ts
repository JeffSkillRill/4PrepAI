import { describe, expect, it } from 'vitest'
import type { Ranking, University } from '../types'
import { compareByQsRank, QS_WORLD_LABEL, qsWorldRanking } from './ranking'

const qs = (rankSort: number | null, label = QS_WORLD_LABEL): Ranking =>
  ({ id: label, label, rankDisplay: rankSort === null ? 'Unranked' : `#${rankSort}`, rankSort, year: 2027, sourceId: 'source-1' })
const uni = (name: string, rankings: Ranking[] = []) => ({ name, rankings }) as unknown as University

describe('QS ranking order', () => {
  it('puts ranked universities first by position, then unranked ones by name', () => {
    const sorted = [uni('Zeta'), uni('Beta', [qs(601)]), uni('Alpha'), uni('Gamma', [qs(12)])].sort(compareByQsRank)

    expect(sorted.map((university) => university.name)).toEqual(['Gamma', 'Beta', 'Alpha', 'Zeta'])
  })

  it('breaks ties on the same position by name', () => {
    const sorted = [uni('Yale', [qs(21)]), uni('Columbia', [qs(21)])].sort(compareByQsRank)

    expect(sorted.map((university) => university.name)).toEqual(['Columbia', 'Yale'])
  })

  it('ignores other ranking tables and rows without a numeric position', () => {
    expect(qsWorldRanking(uni('A', [qs(3, 'US News National Universities')]))).toBeNull()
    expect(qsWorldRanking(uni('B', [qs(null)]))).toBeNull()
  })
})
