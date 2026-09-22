import type { Program } from '../../types'
import { MissingValue } from '../Trust'
import { useScrollReveal } from '../../motion/hooks'
import { ChartFrame } from './ChartFrame'

const levels: Program['degreeLevel'][] = ['bachelor', 'master', 'mba', 'phd']
const levelLabels: Record<Program['degreeLevel'], string> = { bachelor: 'Bachelor', master: 'Master', mba: 'MBA', phd: 'PhD' }

/**
 * Counts of sourced programmes per degree level.
 *
 * A level with no sourced programme gets no bar: the catalogue holding nothing
 * at that level is not the same claim as the university offering nothing, and
 * a zero bar would make the second claim.
 */
export function ProgrammeLevels({ programs }: { programs: Program[] }) {
  const { ref, revealed, animate } = useScrollReveal<HTMLDivElement>()
  const counts = levels
    .map((level) => ({ level, count: programs.filter((program) => program.degreeLevel === level).length }))
    .filter((entry) => entry.count > 0)

  if (counts.length === 0) {
    return (
      <MissingValue
        title="Coming soon"
        reason="No sourced programmes have been published for this university, so there is nothing to count by degree level."
        action="Check the university catalogue for its current programme list."
      />
    )
  }

  const max = Math.max(...counts.map((entry) => entry.count))
  const grown = animate ? (revealed ? 1 : 0) : 1
  const absent = levels.filter((level) => !counts.some((entry) => entry.level === level))

  return (
    <ChartFrame
      summary={`Sourced programmes by degree level. ${counts.map((entry) => `${levelLabels[entry.level]}: ${entry.count}`).join('. ')}.${absent.length > 0 ? ` No sourced programme is published at these levels: ${absent.map((level) => levelLabels[level]).join(', ')}.` : ''}`}
      tableCaption="Count of sourced programmes by degree level"
      rows={[
        ...counts.map((entry) => ({ label: levelLabels[entry.level], value: `${entry.count} programmes`, note: 'Sourced in the 4Prep catalogue' })),
        ...absent.map((level) => ({ label: levelLabels[level], value: 'None sourced', note: 'Not charted; the catalogue holds no programme at this level' })),
      ]}
      footer={absent.length > 0
        ? <>No bar is drawn for {absent.map((level) => levelLabels[level]).join(', ')}: the catalogue holds no sourced programme at {absent.length === 1 ? 'that level' : 'those levels'}, which is not the same as the university offering none.</>
        : <>Every degree level in the catalogue is represented.</>}
    >
      <div ref={ref} className="grid gap-3">
        {counts.map((entry) => (
          <div key={entry.level} className="grid grid-cols-[72px_1fr_34px] items-center gap-3 text-xs font-bold">
            <span className="truncate text-muted">{levelLabels[entry.level]}</span>
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
