import type { Program } from '../../types'
import { MissingValue } from '../Trust'
import { useScrollReveal } from '../../motion/hooks'
import { ChartFrame } from './ChartFrame'

/**
 * Counts of sourced programmes per credential level.
 *
 * The levels are read from the data, not from a fixed list. College Scorecard
 * reports nine credential levels and names each one, so a level the university
 * does not offer simply does not appear — the chart makes no claim about it
 * either way. Each bar counts what the catalogue holds, which is not the same
 * claim as what the university offers.
 */
export function ProgrammeLevels({ programs }: { programs: Program[] }) {
  const { ref, revealed, animate } = useScrollReveal<HTMLDivElement>()
  const counts = [...new Map(programs.map((program) => [program.degreeLevel, program.degree])).entries()]
    .sort(([left], [right]) => left - right)
    .map(([level, label]) => ({
      level,
      label,
      count: programs.filter((program) => program.degreeLevel === level).length,
    }))
    .filter((entry) => entry.count > 0)

  if (counts.length === 0) {
    return (
      <MissingValue
        title="Coming soon"
        reason="No sourced programmes have been published for this university, so there is nothing to count by credential level."
        action="Check the university catalogue for its current programme list."
      />
    )
  }

  const max = Math.max(...counts.map((entry) => entry.count))
  const grown = animate ? (revealed ? 1 : 0) : 1

  return (
    <ChartFrame
      summary={`Sourced programmes by credential level. ${counts.map((entry) => `${entry.label}: ${entry.count}`).join('. ')}.`}
      tableCaption="Count of sourced programmes by credential level"
      rows={counts.map((entry) => ({
        label: entry.label,
        value: `${entry.count} programmes`,
        note: 'Sourced in the 4Prep catalogue',
      }))}
      footer={<>Only credential levels the source reports for this university are charted. A level that is absent is one College Scorecard does not publish here, which is not the same as the university offering none.</>}
    >
      <div ref={ref} className="grid gap-3">
        {counts.map((entry) => (
          <div key={entry.level} className="grid grid-cols-[150px_1fr_42px] items-center gap-3 text-xs font-bold">
            <span className="truncate text-muted" title={entry.label}>{entry.label}</span>
            <span className="h-3 overflow-hidden rounded-full border border-line bg-canvas">
              <span
                className="chart-grow block h-full rounded-full bg-forest-700"
                style={{ width: `${(entry.count / max) * 100 * grown}%` }}
              />
            </span>
            <span className="text-right text-forest-800">{entry.count}</span>
          </div>
        ))}
      </div>
    </ChartFrame>
  )
}
