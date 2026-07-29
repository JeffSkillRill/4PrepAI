import { AlertCircle, BookOpen, ChevronDown, Filter, Globe2, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { University } from '../types'
import { UniversityCard } from '../components/UniversityCard'
import { DesignedState, LoadingState } from '../components/States'
import { listUniversities } from '../data/repository'
import { useRepositoryData } from '../data/useRepositoryData'
import {
  bestPublishedCostScenario,
  hasComprehensiveInternationalFunding,
  hasFullNeedPolicy,
} from '../scoring/costs'

type Props = {
  query: string
  setQuery: (value: string) => void
  saved: Set<string>
  onToggleSave: (id: string) => void
  onOpen: (university: University) => void
}

type FilterProps = {
  budget: number
  setBudget: (value: number) => void
  country: string
  setCountry: (value: string) => void
  field: string
  setField: (value: string) => void
  countries: string[]
  fields: string[]
}

const flags: Record<string, string> = {
  'United States': '🇺🇸',
}

const budgetLimits = { min: 5000, max: 100000, step: 1000 }

function FilterContent({ budget, setBudget, country, setCountry, field, setField, countries, fields }: FilterProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-end justify-between gap-2">
          <label htmlFor="budget" className="text-sm font-bold">Annual budget ceiling <span className="block text-xs font-normal text-muted">after numeric published aid</span></label>
          <span className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-bold">USD only</span>
        </div>
        <p className="mt-2 text-right text-sm font-bold text-forest-700">USD {budget.toLocaleString()}</p>
        <input id="budget" type="range" min={budgetLimits.min} max={budgetLimits.max} step={budgetLimits.step} value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-3 w-full accent-forest-700" />
        <div className="mt-1 flex justify-between text-xs text-muted"><span>{budgetLimits.min.toLocaleString()}</span><span>{budgetLimits.max.toLocaleString()}</span></div>
      </div>
      <fieldset>
        <legend className="mb-3 text-sm font-bold">Country</legend>
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted"><input type="radio" name="country" checked={!country} onChange={() => setCountry('')} className="size-4 accent-forest-700" /> All countries</label>
          {countries.map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-ink">
              <input type="radio" name="country" checked={country === item} onChange={() => setCountry(item)} className="size-4 accent-forest-700" /> {flags[item]} {item}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-bold">Field of study
        <span className="relative mt-2 block"><select value={field} onChange={(event) => setField(event.target.value)} className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2.5 pr-9 text-sm font-normal text-ink"><option value="">All fields</option>{fields.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3 text-muted" /></span>
      </label>
      <p className="rounded-xl bg-forest-50 p-3 text-xs leading-5 text-muted"><strong className="block text-forest-900">Budget meaning</strong>Results compare official annual cost of attendance with the largest numeric institutional award published for international students. Competitive awards are scenarios, not promises. Full-need policies and incomplete figures stay visible for individual review.</p>
    </div>
  )
}

export function SearchScreen({ query, setQuery, saved, onToggleSave, onOpen }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [budget, setBudget] = useState(budgetLimits.max)
  const [country, setCountry] = useState('')
  const [field, setField] = useState('')
  const { data: universities, status, reload } = useRepositoryData(() => listUniversities(), [])

  const countries = useMemo(() => [...new Set((universities ?? []).map((item) => item.country))].sort(), [universities])
  const fields = useMemo(() => [...new Set((universities ?? []).flatMap((item) => item.programs.map((program) => program.field)))].sort(), [universities])
  const { filtered, unknownCostCount } = useMemo(() => {
    const items = (universities ?? []).flatMap((university) => {
      const haystack = `${university.name} ${university.city} ${university.country} ${university.programs.map((program) => `${program.name} ${program.field}`).join(' ')}`.toLowerCase()
      if (query.trim() && !haystack.includes(query.trim().toLowerCase())) return []
      if (country && university.country !== country) return []
      if (field && !university.programs.some((program) => program.field === field)) return []
      if (hasFullNeedPolicy(university) || hasComprehensiveInternationalFunding(university)) {
        return [{ university, fitsAfterScholarship: false, costUnknown: true }]
      }
      const scenario = bestPublishedCostScenario(university)
      if (scenario === null) {
        return [{ university, fitsAfterScholarship: false, costUnknown: true }]
      }
      if (scenario.netCost > budget) return []
      return [{
        university,
        fitsAfterScholarship: scenario.publishedAid > 0 && scenario.stickerCost > budget,
        costUnknown: false,
      }]
    })
    return { filtered: items, unknownCostCount: items.filter((item) => item.costUnknown).length }
  }, [universities, query, country, field, budget])

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />
  if (!universities) return null

  return (
    <>
      <section className="hero-grid relative overflow-hidden text-white">
        <div className="page-container relative z-10 py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur"><Globe2 size={16} /> Evidence before decisions</span>
            <h1 className="display mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">Find your path abroad</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">Compare requirements, costs, and timelines in one calm place—always with the source attached.</p>
            <label className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-2 pl-5 text-ink shadow-2xl shadow-black/20">
              <Search size={22} className="shrink-0 text-forest-700" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent py-3 outline-none placeholder:text-muted" placeholder="Search universities, countries, or subjects" aria-label="Search universities" />
              <button className="hidden rounded-xl bg-forest-800 px-6 py-3 font-bold text-white transition hover:bg-forest-700 sm:block">Search</button>
            </label>
          </div>
          <div className="mt-7 flex max-w-4xl flex-wrap gap-2">
            {countries.slice(0, 4).map((item) => <button key={item} onClick={() => setCountry(country === item ? '' : item)} className={`rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur transition ${country === item ? 'border-white bg-white text-forest-900' : 'border-white/25 bg-white/10 hover:bg-white/20'}`}>{flags[item]} {item}</button>)}
            {fields.slice(0, 2).map((item) => <button key={item} onClick={() => setField(field === item ? '' : item)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur transition ${field === item ? 'border-white bg-white text-forest-900' : 'border-white/25 bg-white/10 hover:bg-white/20'}`}><BookOpen size={14} /> {item}</button>)}
          </div>
        </div>
      </section>

      <main className="page-container py-10 lg:py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Explore your options</p><h2 className="display mt-1 text-3xl font-extrabold">Universities matched to your direction</h2></div>
          <button onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold lg:hidden"><Filter size={17} /> Filters</button>
        </div>
        {unknownCostCount > 0 && <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{unknownCostCount} result{unknownCostCount === 1 ? '' : 's'} with incomplete or different-currency cost evidence remain visible and are not filtered out.</span></div>}
        <div className="grid items-start gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="card sticky top-28 hidden p-5 lg:block">
            <div className="mb-5 flex items-center justify-between"><h3 className="display text-lg font-extrabold">Filters</h3><SlidersHorizontal size={18} className="text-forest-700" /></div>
            <FilterContent {...{ budget, setBudget, country, setCountry, field, setField, countries, fields }} />
          </aside>
          {filtered.length > 0 ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(({ university, fitsAfterScholarship }) => <UniversityCard key={university.id} university={university} fitsAfterScholarship={fitsAfterScholarship} saved={saved.has(university.id)} onSave={() => onToggleSave(university.id)} onOpen={() => onOpen(university)} />)}
          </div> : <DesignedState state="no_results" onReset={() => { setQuery(''); setCountry(''); setField(''); setBudget(budgetLimits.max) }} />}
        </div>
      </main>

      {filtersOpen && <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" role="dialog" aria-modal="true" aria-label="Search filters" onMouseDown={() => setFiltersOpen(false)}><aside className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white p-6" onMouseDown={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><h2 className="display text-2xl font-extrabold">Refine results</h2><button onClick={() => setFiltersOpen(false)} className="grid size-10 place-items-center rounded-full bg-canvas" aria-label="Close filters"><X size={20} /></button></div><FilterContent {...{ budget, setBudget, country, setCountry, field, setField, countries, fields }} /><button onClick={() => setFiltersOpen(false)} className="sticky bottom-4 mt-7 w-full rounded-xl bg-forest-800 py-3.5 font-bold text-white shadow-lg">Show results</button></aside></div>}
    </>
  )
}
