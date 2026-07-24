import { BookOpen, ChevronDown, Filter, Globe2, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { countryChips, fieldChips, universities } from '../mock/sample-data'
import type { University } from '../types'
import { UniversityCard } from '../components/UniversityCard'

type Props = {
  query: string
  setQuery: (value: string) => void
  saved: Set<string>
  onToggleSave: (id: string) => void
  onOpen: (university: University) => void
}

function FilterContent() {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="budget" className="flex items-center justify-between text-sm font-bold"><span>Annual budget</span><span className="text-forest-700">Up to 25k</span></label>
        <input id="budget" type="range" min="5" max="50" defaultValue="25" className="mt-4 w-full accent-forest-700" />
        <div className="mt-1 flex justify-between text-xs text-muted"><span>5k</span><span>50k+</span></div>
      </div>
      <fieldset>
        <legend className="mb-3 text-sm font-bold">Country</legend>
        <div className="space-y-2.5">
          {countryChips.slice(0, 5).map((country, index) => (
            <label key={country.label} className="flex cursor-pointer items-center justify-between gap-2 text-sm text-muted hover:text-ink">
              <span className="flex items-center gap-2"><input type="checkbox" defaultChecked={index === 0} className="size-4 rounded accent-forest-700" /> {country.flag} {country.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-bold">Field of study
        <span className="relative mt-2 block"><select className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2.5 pr-9 text-sm font-normal text-ink"><option>All fields</option>{fieldChips.map((field) => <option key={field}>{field}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3 text-muted" /></span>
      </label>
      <label className="block text-sm font-bold">Teaching language
        <span className="relative mt-2 block"><select className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2.5 pr-9 text-sm font-normal"><option>Any language</option><option>English</option><option>German</option></select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3 text-muted" /></span>
      </label>
      <label className="block text-sm font-bold">IELTS level
        <span className="relative mt-2 block"><select className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2.5 pr-9 text-sm font-normal"><option>Any score</option><option>Up to 6.0</option><option>Up to 6.5</option></select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3 text-muted" /></span>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-forest-50 p-3 text-sm"><input type="checkbox" defaultChecked className="mt-0.5 size-4 accent-forest-700" /><span><strong className="block">Open deadlines</strong><span className="text-xs text-muted">Show pathways you can still prepare for</span></span></label>
    </div>
  )
}

export function SearchScreen({ query, setQuery, saved, onToggleSave, onOpen }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeChip, setActiveChip] = useState('')
  const filtered = useMemo(() => universities.filter((u) => {
    const haystack = `${u.name} ${u.city} ${u.country} ${u.programs.map((p) => p.name).join(' ')}`.toLowerCase()
    const terms = `${query} ${activeChip}`.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return terms.length === 0 || terms.some((term) => haystack.includes(term))
  }), [query, activeChip])

  return (
    <>
      <section className="hero-grid relative overflow-hidden text-white">
        <div className="page-container relative z-10 py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur"><Globe2 size={16} /> Evidence before decisions</span>
            <h1 className="display mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">Find your path abroad</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">Compare real requirements, costs, and timelines in one calm place—always with the source attached.</p>
            <label className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-2 pl-5 text-ink shadow-2xl shadow-black/20">
              <Search size={22} className="shrink-0 text-forest-700" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent py-3 outline-none placeholder:text-muted" placeholder="Search universities, countries, or subjects" aria-label="Search universities" />
              <button className="hidden rounded-xl bg-forest-800 px-6 py-3 font-bold text-white transition hover:bg-forest-700 sm:block">Search</button>
            </label>
          </div>
          <div className="mt-7 flex max-w-4xl flex-wrap gap-2">
            {countryChips.slice(0, 4).map((chip) => <button key={chip.label} onClick={() => setActiveChip(activeChip === chip.label ? '' : chip.label)} className={`rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur transition ${activeChip === chip.label ? 'border-white bg-white text-forest-900' : 'border-white/25 bg-white/10 hover:bg-white/20'}`}>{chip.flag} {chip.label}</button>)}
            {fieldChips.slice(0, 2).map((field) => <button key={field} onClick={() => setActiveChip(activeChip === field ? '' : field)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur transition ${activeChip === field ? 'border-white bg-white text-forest-900' : 'border-white/25 bg-white/10 hover:bg-white/20'}`}><BookOpen size={14} /> {field}</button>)}
          </div>
        </div>
      </section>

      <main className="page-container py-10 lg:py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Explore your options</p><h2 className="display mt-1 text-3xl font-extrabold">Universities matched to your direction</h2></div>
          <div className="flex items-center gap-3">
            <button onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold lg:hidden"><Filter size={17} /> Filters</button>
            <label className="flex items-center gap-2 text-sm text-muted">Sort <select className="rounded-xl border border-line bg-white px-3 py-2.5 font-semibold text-ink"><option>Best fit</option><option>Lowest tuition</option><option>Deadline</option></select></label>
          </div>
        </div>
        {activeChip && <div className="mb-5 flex"><button onClick={() => setActiveChip('')} className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-3 py-2 text-sm font-bold text-forest-800">{activeChip}<X size={14} /></button></div>}
        <div className="grid items-start gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="card sticky top-28 hidden p-5 lg:block">
            <div className="mb-5 flex items-center justify-between"><h3 className="display text-lg font-extrabold">Filters</h3><SlidersHorizontal size={18} className="text-forest-700" /></div>
            <FilterContent />
          </aside>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((university) => <UniversityCard key={university.id} university={university} saved={saved.has(university.id)} onSave={() => onToggleSave(university.id)} onOpen={() => onOpen(university)} />)}
          </div>
        </div>
      </main>

      {filtersOpen && <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" role="dialog" aria-modal="true" aria-label="Search filters" onMouseDown={() => setFiltersOpen(false)}><aside className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white p-6" onMouseDown={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><h2 className="display text-2xl font-extrabold">Refine results</h2><button onClick={() => setFiltersOpen(false)} className="grid size-10 place-items-center rounded-full bg-canvas" aria-label="Close filters"><X size={20} /></button></div><FilterContent /><button onClick={() => setFiltersOpen(false)} className="sticky bottom-4 mt-7 w-full rounded-xl bg-forest-800 py-3.5 font-bold text-white shadow-lg">Show results</button></aside></div>}
    </>
  )
}
