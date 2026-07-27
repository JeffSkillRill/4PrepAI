import { Check, MapPin, Plus, X } from 'lucide-react'
import { useMemo } from 'react'
import type { StudentProfile, University } from '../types'
import { DataValue, ExpandableFit, MissingValue } from '../components/Trust'
import { DesignedState, LoadingState } from '../components/States'
import { listUniversities } from '../data/repository'
import { useRepositoryData } from '../data/useRepositoryData'
import { computeFit } from '../scoring/phi'
import { UniversityVisual } from '../components/UniversityVisual'

type Row = {
  label: string
  render: (university: University) => React.ReactNode
}

function CompareHeader({ university }: { university: University }) {
  return (
    <div className="min-w-[250px] overflow-hidden rounded-xl border border-line bg-white text-left">
      <div className="relative aspect-[2.2/1] overflow-hidden bg-forest-800"><UniversityVisual university={university} className="absolute inset-0" /><button className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90" aria-label={`Remove ${university.name}`}><X size={14} /></button></div>
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
    { label: '4Prep fit', render: (university) => university.fit ? <ExpandableFit fit={university.fit} compact /> : <MissingValue reason="No profile has been entered." action="Complete intake to calculate this comparison." /> },
    { label: 'Tuition', render: (university) => <DataValue point={university.tuition} /> },
    { label: 'Living costs', render: (university) => <DataValue point={university.livingCost} /> },
    { label: 'Next intake', render: (university) => <DataValue point={university.intake} /> },
    { label: 'Deadline', render: (university) => <DataValue point={university.deadline} /> },
    { label: 'IELTS minimum', render: (university) => <DataValue point={university.ielts} /> },
    { label: 'Scholarship', render: (university) => <DataValue point={university.scholarship} /> },
    { label: 'Application fee', render: (university) => <DataValue point={university.applicationFee} /> },
    { label: 'Highlights', render: (university) => <ul className="space-y-2 text-sm">{university.highlights.map((highlight) => <li key={highlight} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-forest-600" />{highlight}</li>)}</ul> },
  ]

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />
  if (compared.length === 0) return <DesignedState state="empty" onReset={reload} />

  return (
    <main className="page-container py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Compare</p><h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">See the trade-offs clearly</h1><p className="mt-4 max-w-2xl leading-7 text-muted">Every figure keeps its source. Fit opens into all five components instead of appearing as a bare score.</p></div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 font-bold text-forest-800 transition hover:bg-forest-100"><Plus size={18} /> Add university</button>
      </div>
      <div className="mt-8 rounded-2xl border border-line bg-white shadow-soft">
        <div className="compare-scroll max-h-[calc(100vh-120px)] overflow-auto snap-x snap-mandatory md:snap-none">
          <table className="compare-table w-full min-w-[1040px] border-separate border-spacing-0 text-left">
            <thead className="bg-canvas"><tr><th className="w-[190px] border-b border-r border-line bg-canvas p-5 align-bottom"><span className="text-xs font-bold uppercase tracking-[.14em] text-muted">Criteria</span></th>{compared.map((university) => <th key={university.id} className="w-[280px] snap-start border-b border-line bg-canvas p-4 align-top"><CompareHeader university={university} /></th>)}</tr></thead>
            <tbody>{rows.map((row, index) => <tr key={row.label} className={index % 2 === 0 ? 'bg-white' : 'bg-canvas/50'}><th className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#fcfbf9]'} border-b border-r border-line p-5 text-sm font-extrabold align-top`}>{row.label}</th>{compared.map((university) => <td key={university.id} className="border-b border-line p-5 align-top text-sm leading-6">{row.render(university)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted md:hidden">Swipe horizontally to compare universities</p>
    </main>
  )
}
