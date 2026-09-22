import type { University } from '../../types'
import { MissingValue, SourceChip } from '../Trust'
import { ChartFrame } from './ChartFrame'
import { RadialGauge } from './RadialGauge'
import { publishedPercentage } from './chartUtils'

/**
 * The published employability rate as a dial.
 *
 * Only a figure the source tagged as a percentage is drawn. A rate described
 * in prose but not published as a number stays prose.
 */
export function EmployabilityGauge({ university }: { university: University }) {
  const rate = publishedPercentage(university.employabilityRate)
  if (!rate) {
    return (
      <MissingValue
        title="Employment rate not published as a figure"
        reason={university.employabilityRate.status === 'unknown'
          ? university.employabilityRate.reason
          : 'The published employment rate is not recorded as a numeric percentage, so it cannot be drawn on a dial without inventing precision.'}
        action={university.employabilityRate.status === 'unknown'
          ? university.employabilityRate.suggestedAction
          : 'Read the published wording below and ask the university for the underlying figure.'}
      />
    )
  }

  return (
    <ChartFrame
      summary={`Published employment rate: ${rate.value} percent of graduates.`}
      tableCaption="Published employment rate"
      rows={[{ label: 'Employment rate', value: `${rate.value}%`, note: 'Published by the university or its reporting source' }]}
      footer={<span className="flex flex-wrap items-center gap-2">Published rate, reported by the institution. <SourceChip sourceId={rate.sourceId} /></span>}
    >
      <RadialGauge value={rate.value} suffix="%" caption="Published employment rate" />
    </ChartFrame>
  )
}
