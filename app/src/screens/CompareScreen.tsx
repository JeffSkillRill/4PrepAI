import { Check, ChevronDown, MapPin, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StudentProfile, University } from '../types'
import { DataValue, ExpandableFit, MissingValue, SourceChip } from '../components/Trust'
import { DesignedState, LoadingState } from '../components/States'
import { listUniversities } from '../data/repository'
import { useRepositoryData } from '../data/useRepositoryData'
import { computeFit } from '../scoring/phi'
import { UniversityVisual } from '../components/UniversityVisual'
import { CostSummary, PublishedNetCost } from '../components/CostSummary'
import {
  bestPublishedCostScenario,
  hasComprehensiveInternationalFunding,
  hasFullNeedPolicy,
} from '../scoring/costs'

type Row = {
  label: string
  render: (university: University) => React.ReactNode
}

function CompareHeader({ university, onRemove }: { university: University; onRemove: () => void }) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-line bg-white text-left">
      <div className="relative aspect-[2.2/1] overflow-hidden bg-forest-800"><UniversityVisual university={university} className="absolute inset-0" /><button type="button" onClick={onRemove} className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-white/90" aria-label={`Remove ${university.name}`}><X size={16} /></button></div>
      <div className="p-3"><h3 className="display text-base font-extrabold leading-tight">{university.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={12} />{university.city}, {university.country}</p></div>
    </div>
  )
}

export function CompareScreen({ profile, saved }: { profile: StudentProfile | null; saved: ReadonlySet<string> }) {
  const { data, status, reload } = useRepositoryData(() => listUniversities(), [])
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const universities = useMemo(() => data ?? [], [data])
  const defaultIds = useMemo(() => {
    const initial = saved.size > 0
      ? universities.filter((university) => saved.has(university.id))
      : universities
    return initial.slice(0, 3).map((university) => university.id)
  }, [saved, universities])
  const activeIds = selectedIds ?? defaultIds
  const compared = useMemo(() => {
    const byId = new Map(universities.map((university) => [university.id, university]))
    return activeIds.flatMap((id) => {
      const university = byId.get(id)
      if (!university) return []
      return [profile ? {
    ...university,
    fit: computeFit(profile, university),
      } : university]
    })
  }, [activeIds, profile, universities])
  const available = universities.filter((university) => !activeIds.includes(university.id))
  const removeUniversity = (id: string) => {
    setSelectedIds(activeIds.filter((selectedId) => selectedId !== id))
    setIsPickerOpen(true)
  }
  const addUniversity = (id: string) => {
    if (activeIds.length >= 3 || activeIds.includes(id)) return
    const next = [...activeIds, id]
    setSelectedIds(next)
    if (next.length >= 3) setIsPickerOpen(false)
  }
  const rows: Row[] = [
    { label: '4Prep fit', render: (university) => university.fit ? <ExpandableFit fit={university.fit} compact /> : <MissingValue title="Your fit isn’t calculated yet" reason="No profile has been entered yet." action="Complete the intake to compare fit across these universities." kind="profile" /> },
    { label: 'Aid-adjusted net-cost scenario', render: (university) => <PublishedNetCost university={university} compact /> },
    { label: 'Cost of attendance', render: (university) => <DataValue point={university.totalCostOfAttendance} /> },
    { label: 'Tuition', render: (university) => <DataValue point={university.tuition} /> },
    { label: 'Mandatory fees', render: (university) => <DataValue point={university.fees} /> },
    { label: 'Room and board', render: (university) => <DataValue point={university.roomBoard} /> },
    { label: 'International aid', render: (university) => <DataValue point={university.aidInternational} /> },
    { label: 'F-1 financial certification', render: (university) => <DataValue point={university.financialCertification} /> },
    { label: 'Next intake', render: (university) => <DataValue point={university.intake} /> },
    { label: 'Deadline', render: (university) => <DataValue point={university.deadline} /> },
    { label: 'Test policy', render: (university) => <DataValue point={university.testPolicy} /> },
    { label: 'TOEFL', render: (university) => <DataValue point={university.toefl} /> },
    { label: 'IELTS', render: (university) => <DataValue point={university.ielts} /> },
    { label: 'Duolingo', render: (university) => <DataValue point={university.duolingo} /> },
    { label: 'SAT', render: (university) => <DataValue point={university.sat} /> },
    { label: 'ACT', render: (university) => <DataValue point={university.act} /> },
    { label: 'GPA', render: (university) => <DataValue point={university.gpa} /> },
    { label: 'Application fee', render: (university) => <DataValue point={university.applicationFee} /> },
    { label: 'Highlights', render: (university) => <ul className="space-y-2 text-sm">{university.highlights.map((highlight) => <li key={highlight} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-forest-600" />{highlight}</li>)}</ul> },
  ]

  if (status === 'loading') return <LoadingState kind="compare" />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />
  if (universities.length === 0) return <DesignedState state="empty" onReset={reload} />

  return (
    <div className="page-container motion-resolve py-8 sm:py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Compare</p><h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">See the trade-offs clearly</h1><p className="mt-4 max-w-2xl leading-7 text-muted">Every figure keeps its source. Fit opens into all five components instead of appearing as a bare score.</p></div>
        <button type="button" onClick={() => setIsPickerOpen((open) => !open)} aria-expanded={isPickerOpen} aria-controls="compare-university-picker" className="inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 font-bold text-forest-800 transition hover:bg-forest-100"><Plus size={18} /> Add university</button>
      </div>
      {isPickerOpen && (
        <section id="compare-university-picker" className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-soft" aria-label="Choose universities to compare">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="display text-xl font-extrabold">Choose universities</h2><p className="mt-1 text-sm text-muted">Compare up to three universities at a time.</p></div>
            <button type="button" onClick={() => setIsPickerOpen(false)} className="grid size-11 shrink-0 place-items-center rounded-full border border-line" aria-label="Close university picker"><X size={17} /></button>
          </div>
          {activeIds.length >= 3 ? (
            <p className="mt-4 rounded-xl bg-canvas p-4 text-sm text-muted">Three universities are selected. Remove one before adding another.</p>
          ) : available.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {available.map((university) => <button key={university.id} type="button" onClick={() => addUniversity(university.id)} className="min-h-12 rounded-xl border border-line px-4 py-3 text-left text-sm font-bold text-forest-900 transition hover:border-forest-500 hover:bg-forest-50">{university.name}<span className="mt-1 block text-xs font-normal text-muted">{university.city}, {university.country}</span></button>)}
            </div>
          ) : <p className="mt-4 text-sm text-muted">Every available university is already selected.</p>}
        </section>
      )}
      {compared.length > 0 ? <NetCostComparisonChart universities={compared} savedSelection={saved.size > 0} /> : (
        <section className="mt-8 rounded-2xl border border-dashed border-forest-300 bg-forest-50 p-6 text-center"><h2 className="display text-xl font-extrabold">Add a university to begin</h2><p className="mt-2 text-sm text-muted">Use the Add university button to build a new comparison.</p></section>
      )}
      <div className="mt-8 space-y-6 md:hidden">
        {compared.map((university) => (
          <article key={university.id} className="card overflow-hidden">
            <div className="bg-canvas p-4">
              <CompareHeader university={university} onRemove={() => removeUniversity(university.id)} />
            </div>
            <div className="space-y-4 p-4">
              <section>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-muted">Five-part fit</p>
                {university.fit ? <ExpandableFit fit={university.fit} compact /> : <MissingValue title="Your fit isn’t calculated yet" reason="No profile has been entered yet." action="Complete intake to compare the five fit reasons." kind="profile" />}
              </section>
              <CostSummary university={university} compact />
              <CompareMobileSection title="Admissions and timing">
                <MobileFact label="Next intake" value={<DataValue point={university.intake} />} />
                <MobileFact label="Deadline" value={<DataValue point={university.deadline} />} />
                <MobileFact label="Test policy" value={<DataValue point={university.testPolicy} />} />
                <MobileFact label="TOEFL" value={<DataValue point={university.toefl} />} />
                <MobileFact label="IELTS" value={<DataValue point={university.ielts} />} />
                <MobileFact label="Duolingo" value={<DataValue point={university.duolingo} />} />
                <MobileFact label="GPA" value={<DataValue point={university.gpa} />} />
              </CompareMobileSection>
              <CompareMobileSection title="Why it is on the list">
                <ul className="grid gap-2 text-sm">
                  {university.highlights.map((highlight) => <li key={highlight} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-forest-600" />{highlight}</li>)}
                </ul>
              </CompareMobileSection>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8 hidden rounded-2xl border border-line bg-white shadow-soft md:block">
        <div className="compare-scroll max-h-[calc(100vh-120px)] overflow-auto">
          <table className="compare-table w-full min-w-[1040px] border-separate border-spacing-0 text-left">
            <thead className="bg-canvas"><tr><th className="w-[190px] border-b border-r border-line bg-canvas p-5 align-bottom"><span className="text-xs font-bold uppercase tracking-[.14em] text-muted">Criteria</span></th>{compared.map((university) => <th key={university.id} className="w-[280px] snap-start border-b border-line bg-canvas p-4 align-top"><CompareHeader university={university} onRemove={() => removeUniversity(university.id)} /></th>)}</tr></thead>
            <tbody>{rows.map((row, index) => <tr key={row.label} className={index % 2 === 0 ? 'bg-white' : 'bg-canvas/50'}><th className={`${index % 2 === 0 ? 'bg-white' : 'bg-canvas'} border-b border-r border-line p-5 text-sm font-extrabold align-top`}>{row.label}</th>{compared.map((university) => <td key={university.id} className="border-b border-line p-5 align-top text-sm leading-6">{row.render(university)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function NetCostComparisonChart({ universities, savedSelection }: { universities: University[]; savedSelection: boolean }) {
  const rows = universities.map((university) => {
    const individualized = hasFullNeedPolicy(university) || hasComprehensiveInternationalFunding(university)
    return {
      university,
      scenario: individualized ? null : bestPublishedCostScenario(university),
      reason: individualized ? 'Aid is individually assessed; no personal net figure is published.' : 'A sourced numeric annual total and aid amount are not both available.',
    }
  })
  const known = rows.filter((row) => row.scenario !== null)
  const currencies = new Set(known.map((row) => row.scenario?.currency))
  if (known.length === 0 || currencies.size !== 1) {
    return (
      <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="display text-xl font-extrabold">Aid-adjusted cost comparison</h2>
        <p className="mt-2 text-sm leading-6 text-muted">No comparison chart is drawn because these universities do not share comparable, sourced numeric net-cost scenarios. The sourced values and labelled gaps remain below.</p>
      </section>
    )
  }
  const max = Math.max(...known.map((row) => row.scenario?.netCost ?? Number.NEGATIVE_INFINITY))
  const currency = known[0].scenario?.currency ?? ''
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 })
  const label = rows.map((row) => row.scenario ? `${row.university.name}: ${money.format(row.scenario.netCost)} per year.` : `${row.university.name}: not charted. ${row.reason}`).join(' ')
  return (
    <section className="chart-focusable mt-8 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6" role="img" aria-label={`Aid-adjusted ${savedSelection ? 'saved-university' : 'catalogue'} comparison. ${label}`} tabIndex={0}>
      <p className="text-xs font-extrabold uppercase tracking-[.12em] text-forest-700">{savedSelection ? 'Saved universities' : 'Catalogue examples'} · same {currency} scale</p>
      <h2 className="display mt-1 text-xl font-extrabold">Published aid-adjusted scenarios</h2>
      <p className="mt-2 text-xs leading-5 text-muted">These are published scenarios, not personal aid estimates. Missing or individualized figures are labelled instead of plotted as zero.</p>
      <div className="mt-5 grid gap-4" aria-hidden="true">
        {rows.map((row) => row.scenario ? (
          <div key={row.university.id}>
            <div className="flex items-end justify-between gap-3 text-sm"><strong>{row.university.name}</strong><span className="font-bold text-forest-800">{money.format(row.scenario.netCost)}</span></div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border border-line bg-canvas"><span className="block h-full rounded-full bg-forest-700" style={{ width: `${max > 0 ? (row.scenario.netCost / max) * 100 : 100}%` }} /></div>
            <div className="mt-1 flex flex-wrap gap-1">{[row.scenario.costSourceId, row.scenario.aidSourceId].filter((id): id is string => Boolean(id)).map((id) => <SourceChip key={id} sourceId={id} />)}</div>
          </div>
        ) : <p key={row.university.id} className="rounded-xl border border-dashed border-muted p-3 text-xs leading-5 text-muted"><strong className="text-ink">{row.university.name}: labelled gap.</strong> {row.reason}</p>)}
      </div>
      <div className="sr-only"><table><caption>Aid-adjusted university comparison</caption><tbody>{rows.map((row) => <tr key={row.university.id}><th>{row.university.name}</th><td>{row.scenario ? `${money.format(row.scenario.netCost)} per year` : `Not charted. ${row.reason}`}</td></tr>)}</tbody></table></div>
    </section>
  )
}

function CompareMobileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-line bg-white">
      <summary className="flex min-h-12 cursor-pointer list-none items-center px-4 py-3 text-sm font-bold text-forest-800">
        {title}
        <ChevronDown size={16} className="ml-auto transition group-open:rotate-180" />
      </summary>
      <div className="motion-disclosure">
        <div className="overflow-hidden">
          <div className="grid gap-3 border-t border-line p-4">{children}</div>
        </div>
      </div>
    </details>
  )
}

function MobileFact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.1em] text-muted">{label}</p>
      <div className="mt-1 text-sm leading-6">{value}</div>
    </div>
  )
}
