import type { Ranking } from '../../types'
import { MissingValue, SourceChip } from '../Trust'
import { useScrollReveal } from '../../motion/hooks'
import { ChartFrame } from './ChartFrame'
import { exactRankPosition } from './chartUtils'

/**
 * Published league positions side by side.
 *
 * Only an exact position is plotted. Banded text such as "Top 50" names a
 * range, and placing it on a position scale would assert a precision the
 * ranking body did not publish, so those entries stay as text.
 */
export function RankingComparison({ rankings }: { rankings: Ranking[] }) {
  const { ref, revealed, animate } = useScrollReveal<HTMLDivElement>()
  const plotted = rankings.flatMap((ranking) => {
    const position = exactRankPosition(ranking.rankDisplay)
    return position === null ? [] : [{ ranking, position }]
  })

  if (plotted.length < 2) {
    return (
      <MissingValue
        title="Rankings cannot be compared visually"
        reason={`A comparison needs at least two rankings published as an exact position; ${plotted.length === 0 ? 'none of the sourced rankings gives one' : 'only one of the sourced rankings gives one'}.`}
        action="Read each published ranking and its source below."
      />
    )
  }

  const worst = Math.max(...plotted.map((entry) => entry.position))
  const grown = animate ? (revealed ? 1 : 0) : 1
  const share = (position: number) => worst <= 1 ? 100 : (1 - (position - 1) / worst) * 100
  const excluded = rankings.filter((ranking) => exactRankPosition(ranking.rankDisplay) === null)

  return (
    <ChartFrame
      summary={`Published ranking positions compared. ${plotted.map((entry) => `${entry.ranking.label}: position ${entry.position}${entry.ranking.year ? ` in ${entry.ranking.year}` : ''}`).join('. ')}. A longer bar means a position closer to first.${excluded.length > 0 ? ` Not plotted because they publish a band rather than a position: ${excluded.map((ranking) => `${ranking.label} ${ranking.rankDisplay}`).join(', ')}.` : ''}`}
      tableCaption="Published ranking positions"
      rows={[
        ...plotted.map((entry) => ({
          label: entry.ranking.label,
          value: entry.ranking.rankDisplay,
          note: entry.ranking.year ? `Published for ${entry.ranking.year}` : 'Year not published',
        })),
        ...excluded.map((ranking) => ({ label: ranking.label, value: ranking.rankDisplay, note: 'Not plotted; a band rather than an exact position' })),
      ]}
      footer={<>Bar length reflects the published position against the lowest position shown; longer is closer to first. Different ranking bodies measure different things, so the bars compare positions, not quality.{excluded.length > 0 && <> {excluded.length} further ranking{excluded.length === 1 ? '' : 's'} publish{excluded.length === 1 ? 'es' : ''} a band rather than a position and {excluded.length === 1 ? 'is' : 'are'} listed below instead.</>}</>}
    >
      <div ref={ref} className="grid gap-3.5">
        {plotted.map((entry) => (
          <div key={entry.ranking.id}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-bold">
              <span className="min-w-0 truncate text-muted">{entry.ranking.label}{entry.ranking.year ? ` · ${entry.ranking.year}` : ''}</span>
              <span className="text-forest-800">{entry.ranking.rankDisplay}</span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full border border-line bg-canvas">
              <span className="chart-grow block h-full rounded-full bg-forest-700" style={{ width: `${share(entry.position) * grown}%` }} />
            </div>
            <div className="mt-1.5"><SourceChip sourceId={entry.ranking.sourceId} /></div>
          </div>
        ))}
      </div>
    </ChartFrame>
  )
}
