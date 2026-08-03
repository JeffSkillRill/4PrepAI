import { Check, ChevronDown, MapPin, Plus, X } from 'lucide-react'
import { useMemo } from 'react'
import type { StudentProfile, University } from '../types'
import { DataValue, ExpandableFit, MissingValue } from '../components/Trust'
import { DesignedState, LoadingState } from '../components/States'
import { listUniversities } from '../data/repository'
import { useRepositoryData } from '../data/useRepositoryData'
import { computeFit } from '../scoring/phi'
import { UniversityVisual } from '../components/UniversityVisual'
import { CostSummary, PublishedNetCost } from '../components/CostSummary'

type Row = {
  label: string
  render: (university: University) => React.ReactNode
}

function CompareHeader({ university }: { university: University }) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-line bg-white text-left">
      <div className="relative aspect-[2.2/1] overflow-hidden bg-forest-800"><UniversityVisual university={university} className="absolute inset-0" /><button className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-white/90" aria-label={`Remove ${university.name}`}><X size={16} /></button></div>
      <div className="p-3"><h3 className="display text-base font-extrabold leading-tight">{university.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={12} />{university.city}, {university.country}</p></div>
    </div>
  )
}

export function CompareScreen({ profile }: { profile: StudentProfile | null }) {
  const { data, status, reload } = useRepositoryData(() => listUniversities(), [])
  const compared = useMemo(() => (data ?? []).slice(0, 3).map((university) => profile ? {
    ...university,
    fit: computeFit(profile, university),
  } : university), [data, profile])
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
  if (compared.length === 0) return <DesignedState state="empty" onReset={reload} />

  return (
    <div className="page-container motion-resolve py-8 sm:py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Compare</p><h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">See the trade-offs clearly</h1><p className="mt-4 max-w-2xl leading-7 text-muted">Every figure keeps its source. Fit opens into all five components instead of appearing as a bare score.</p></div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 font-bold text-forest-800 transition hover:bg-forest-100"><Plus size={18} /> Add university</button>
      </div>
      <div className="mt-8 space-y-6 md:hidden">
        {compared.map((university) => (
          <article key={university.id} className="card overflow-hidden">
            <div className="bg-canvas p-4">
              <CompareHeader university={university} />
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
            <thead className="bg-canvas"><tr><th className="w-[190px] border-b border-r border-line bg-canvas p-5 align-bottom"><span className="text-xs font-bold uppercase tracking-[.14em] text-muted">Criteria</span></th>{compared.map((university) => <th key={university.id} className="w-[280px] snap-start border-b border-line bg-canvas p-4 align-top"><CompareHeader university={university} /></th>)}</tr></thead>
            <tbody>{rows.map((row, index) => <tr key={row.label} className={index % 2 === 0 ? 'bg-white' : 'bg-canvas/50'}><th className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#fcfbf9]'} border-b border-r border-line p-5 text-sm font-extrabold align-top`}>{row.label}</th>{compared.map((university) => <td key={university.id} className="border-b border-line p-5 align-top text-sm leading-6">{row.render(university)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
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
