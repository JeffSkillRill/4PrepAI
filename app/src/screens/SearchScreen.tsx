import {
  ArrowRight,
  BadgeDollarSign,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Compass,
  Filter,
  GitCompareArrows,
  Lightbulb,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import type { University } from '../types'
import { UniversityCard } from '../components/UniversityCard'
import { DesignedState } from '../components/States'
import { listUniversities } from '../data/repository'
import { useRepositoryData } from '../data/useRepositoryData'
import { fieldOptions } from '../intake/definition'
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

type StateOption = { code: string; name: string }

type FilterProps = {
  budget: number
  setBudget: (value: number) => void
  field: string
  setField: (value: string) => void
  fields: string[]
  selectedStates: string[]
  setSelectedStates: (value: string[]) => void
  stateOptions: StateOption[]
}

type CatalogueFilters = {
  query: string
  budget: number
  field: string
  states: readonly string[]
}

export type CatalogueResult = {
  university: University
  fitsAfterScholarship: boolean
  costUnknown: boolean
}

export const budgetLimits = { min: 5000, max: 100000, step: 1000 } as const

const featureItems = [
  { icon: GitCompareArrows, title: 'Compare universities', detail: 'Find the best fit' },
  { icon: BadgeDollarSign, title: 'View real costs', detail: 'No hidden fees' },
  { icon: CalendarCheck, title: 'Admission information', detail: 'Requirements & deadlines' },
  { icon: Compass, title: 'Personalized guidance', detail: 'Plan with confidence' },
]

// Reference chips. The catalogue is sourced US-only, so the region chips are
// labels, not filters; the subject chips drive the existing major filter.
const regionChips = [
  { label: 'USA', note: 'The catalogue currently covers United States universities only.' },
  { label: 'UK', note: 'No United Kingdom universities are in the sourced catalogue yet.' },
  { label: 'Canada', note: 'No Canadian universities are in the sourced catalogue yet.' },
  { label: 'Australia', note: 'No Australian universities are in the sourced catalogue yet.' },
]

const primaryFieldChips = [
  { label: 'Business', value: 'Business & Management' },
  { label: 'Computer Science', value: 'Computer Science' },
  { label: 'Engineering', value: 'Engineering' },
]

const extraFieldChips = fieldOptions
  .filter((option) => !primaryFieldChips.some((chip) => chip.value === option))
  .map((option) => ({ label: option, value: option }))

export function filterCatalogueUniversities(
  universities: readonly University[],
  filters: CatalogueFilters,
): CatalogueResult[] {
  const normalizedQuery = filters.query.trim().toLowerCase()
  const results: CatalogueResult[] = []
  universities.forEach((university) => {
    if (normalizedQuery && !university.name.toLowerCase().includes(normalizedQuery)) return
    if (filters.states.length > 0 && (!university.state || !filters.states.includes(university.state))) return
    if (filters.field && !university.programs.some((program) => program.field === filters.field)) return
    if (hasFullNeedPolicy(university) || hasComprehensiveInternationalFunding(university)) {
      results.push({ university, fitsAfterScholarship: false, costUnknown: true })
      return
    }
    const scenario = bestPublishedCostScenario(university)
    if (scenario === null) {
      results.push({ university, fitsAfterScholarship: false, costUnknown: true })
      return
    }
    if (scenario.netCost > filters.budget) return
    results.push({
      university,
      fitsAfterScholarship: scenario.publishedAid > 0 && scenario.stickerCost > filters.budget,
      costUnknown: false,
    })
  })
  return results
}

function FilterContent({
  budget,
  setBudget,
  field,
  setField,
  fields,
  selectedStates,
  setSelectedStates,
  stateOptions,
}: FilterProps) {
  const budgetId = useId()
  const budgetHeadingId = useId()
  const stateHeadingId = useId()
  const [stateSearch, setStateSearch] = useState('')
  const shownStates = stateOptions.filter((option) => {
    const query = stateSearch.trim().toLowerCase()
    return !query || option.name.toLowerCase().includes(query) || option.code.toLowerCase().includes(query)
  })
  const toggleState = (code: string) => {
    setSelectedStates(selectedStates.includes(code)
      ? selectedStates.filter((item) => item !== code)
      : [...selectedStates, code])
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-end justify-between gap-2">
          <label id={budgetHeadingId} htmlFor={budgetId} className="text-sm font-bold">Annual budget ceiling <span className="block text-xs font-normal text-muted">after numeric published aid</span></label>
          <span className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-bold">USD only</span>
        </div>
        <p className="mt-2 text-right text-sm font-bold text-forest-700">USD {budget.toLocaleString()}</p>
        <input id={budgetId} type="range" min={budgetLimits.min} max={budgetLimits.max} step={budgetLimits.step} value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-3 w-full accent-forest-700" />
        <div className="mt-1 flex justify-between text-xs text-muted"><span>{budgetLimits.min.toLocaleString()}</span><span>{budgetLimits.max.toLocaleString()}</span></div>
      </section>

      <section>
        <h3 id={stateHeadingId} className="text-sm font-bold">Filter by state</h3>
        {stateOptions.length > 0 ? <>
          <label className="relative mt-2 block">
            <Search size={15} className="pointer-events-none absolute left-3 top-3 text-muted" aria-hidden="true" />
            <span className="sr-only">Search available states</span>
            <input type="search" value={stateSearch} onChange={(event) => setStateSearch(event.target.value)} placeholder="Search states" className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-forest-500" aria-label="Search available states" />
          </label>
          <fieldset className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-xl border border-line bg-white p-2">
            <legend className="sr-only">States in the loaded university data</legend>
            {shownStates.length > 0 ? shownStates.map((option) => (
              <label key={option.code} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm hover:bg-canvas">
                <input type="checkbox" checked={selectedStates.includes(option.code)} onChange={() => toggleState(option.code)} className="size-4 accent-forest-700" aria-label={`${option.name} (${option.code})`} />
                <span className="min-w-0 flex-1">{option.name}</span>
                <span className="text-xs font-bold text-muted">{option.code}</span>
              </label>
            )) : <p className="px-2 py-3 text-xs text-muted">No loaded state matches that search.</p>}
          </fieldset>
        </> : <p className="mt-2 rounded-xl border border-dashed border-line p-3 text-xs leading-5 text-muted">No source-backed state values are available in the loaded data yet.</p>}
      </section>

      <label className="block text-sm font-bold">Major
        <span className="relative mt-2 block"><select value={field} onChange={(event) => setField(event.target.value)} className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2.5 pr-9 text-sm font-normal text-ink"><option value="">All majors</option>{fields.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3 text-muted" /></span>
      </label>

      <details className="group rounded-xl border border-forest-100 bg-forest-50">
        <summary className="flex min-h-10 cursor-pointer list-none items-center px-3 py-2 text-xs font-bold text-forest-800">
          What does this budget mean?
          <ChevronDown size={15} className="ml-auto shrink-0 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p className="border-t border-forest-100 px-3 py-2 text-xs leading-5 text-muted">Results compare official annual cost of attendance with the largest numeric institutional award published for international students. Competitive awards are scenarios, not promises. Full-need policies and incomplete figures stay visible for individual review.</p>
      </details>
    </div>
  )
}

export function SearchScreen({ query, setQuery, saved, onToggleSave, onOpen }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [showMoreChips, setShowMoreChips] = useState(false)
  const [budget, setBudget] = useState<number>(budgetLimits.max)
  const [field, setField] = useState('')
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const { data: universities, status, reload } = useRepositoryData(() => listUniversities(), [])
  const availableUniversities = useMemo(() => universities ?? [], [universities])
  const loadState = status === 'error' || status === 'offline' ? status : null

  const fields = useMemo(
    () => [...new Set([...fieldOptions, ...availableUniversities.flatMap((item) => item.programs.map((program) => program.field))])],
    [availableUniversities],
  )
  const stateOptions = useMemo(() => {
    const options = new Map<string, string>()
    availableUniversities.forEach((university) => {
      if (university.state && university.stateName) options.set(university.state, university.stateName)
    })
    return [...options].map(([code, name]) => ({ code, name })).sort((left, right) => left.name.localeCompare(right.name))
  }, [availableUniversities])
  const filtered = useMemo(
    () => filterCatalogueUniversities(availableUniversities, { query, budget, field, states: selectedStates }),
    [availableUniversities, query, budget, field, selectedStates],
  )
  const unknownCostCount = filtered.filter((item) => item.costUnknown).length
  const hasActiveFilters = budget !== budgetLimits.max || selectedStates.length > 0 || Boolean(field)

  const resetAll = () => {
    setQuery('')
    setBudget(budgetLimits.max)
    setSelectedStates([])
    setField('')
  }
  const filterProps = { budget, setBudget, field, setField, fields, selectedStates, setSelectedStates, stateOptions }
  const shownFieldChips = showMoreChips ? [...primaryFieldChips, ...extraFieldChips] : primaryFieldChips
  const moreFieldChips = extraFieldChips

  return (
    <div className="motion-resolve">
      <section className="university-search-hero">
        <p className="hero-script pointer-events-none absolute right-8 top-16 hidden max-w-[16rem] text-right text-2xl leading-8 text-forest-700 lg:block xl:text-3xl xl:leading-10" aria-hidden="true">A brighter future starts here</p>
        <div className="page-container relative z-10 flex min-h-[31rem] flex-col justify-center py-12 sm:min-h-[35rem] sm:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-forest-700 sm:text-sm">University search</p>
            <h1 className="display mt-3 text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">Find your <span className="text-forest-700">next university</span></h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink sm:text-lg">Explore top universities, compare costs, and find the best fit for your future.</p>
          </div>
          <form className="mt-8 max-w-4xl" role="search" onSubmit={(event) => event.preventDefault()}>
            <label className="flex min-w-0 items-center gap-3 rounded-full border border-line bg-white p-2 pl-5 shadow-soft focus-within:border-forest-500 focus-within:ring-2 focus-within:ring-forest-200">
              <Search size={21} className="shrink-0 text-muted" aria-hidden="true" />
              <span className="sr-only">Search universities by name</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent py-2 outline-none placeholder:text-muted" placeholder="Type a university name (e.g. Harvard, NYU, USC)" aria-label="Search universities by name" autoComplete="off" />
              {query ? <button type="button" onClick={() => setQuery('')} className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-canvas hover:text-forest-800" aria-label="Clear university search"><X size={18} /></button> : null}
              <button type="submit" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-forest-800 px-5 font-bold text-white transition hover:bg-forest-900 sm:px-7" aria-label="Search universities"><span className="hidden sm:inline">Search</span><ArrowRight size={17} /></button>
            </label>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-forest-900">
              <span className="font-bold">Popular:</span>
              {regionChips.map((chip) => <span key={chip.label} className="rounded-full border border-white/70 bg-white/55 px-3.5 py-1.5 font-semibold text-forest-900 backdrop-blur" title={chip.note}>{chip.label}</span>)}
              {shownFieldChips.map((chip) => <button key={chip.label} type="button" onClick={() => setField(chip.value)} className={`min-h-0 rounded-full border px-3.5 py-1.5 font-semibold backdrop-blur transition ${field === chip.value ? 'border-forest-800 bg-forest-800 text-white' : 'border-white/70 bg-white/55 text-forest-900 hover:bg-white/80'}`} aria-pressed={field === chip.value}>{chip.label}</button>)}
              {moreFieldChips.length > 0 && <button type="button" onClick={() => setShowMoreChips(!showMoreChips)} className="inline-flex min-h-0 items-center gap-1 rounded-full border border-white/70 bg-white/55 px-3.5 py-1.5 font-semibold text-forest-900 backdrop-blur transition hover:bg-white/80" aria-expanded={showMoreChips}>More <ChevronDown size={14} className={showMoreChips ? 'rotate-180 transition' : 'transition'} aria-hidden="true" /></button>}
            </div>
          </form>
          <p className="mt-8 inline-flex items-center gap-1.5 self-end rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-forest-900 backdrop-blur">
            <MapPin size={14} aria-hidden="true" /> Dream · Learn · Grow
          </p>
        </div>
      </section>

      <section className="border-b border-line bg-white" aria-label="Catalogue features">
        <div className="page-container grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {featureItems.map(({ icon: Icon, title, detail }) => <div key={title} className="flex items-center gap-3 bg-white px-4 py-5 sm:px-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest-50 text-forest-700"><Icon size={19} aria-hidden="true" /></span>
            <span><strong className="block text-sm text-forest-950">{title}</strong><span className="mt-0.5 block text-xs text-muted">{detail}</span></span>
          </div>)}
        </div>
      </section>

      <div className="page-container pt-5">
        {unknownCostCount > 0 && <details className="trust-static group rounded-2xl border border-forest-100 bg-forest-50 text-sm text-forest-950">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 font-bold sm:px-5">
            <Lightbulb size={19} className="shrink-0 text-forest-700" aria-hidden="true" />
            <span>{unknownCostCount} school{unknownCostCount === 1 ? '' : 's'} don’t publish a full numeric cost — Why?</span>
            <ChevronRight size={18} className="ml-auto shrink-0 text-forest-700 transition group-open:rotate-90" aria-hidden="true" />
          </summary>
          <p className="border-t border-forest-100 px-4 py-3 leading-6 text-muted sm:px-5">They stay in your results because no published numeric net cost lets us compare them to your ceiling. Open each school’s evidence to see the published funding or cost facts and the labelled gaps.</p>
        </details>}
      </div>

      <div className="page-container py-6 sm:py-8 lg:py-10">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {status === 'loading'
            ? 'Loading universities. Search and filters are ready while the list loads.'
            : filtered.length > 0
              ? `${filtered.length} ${filtered.length === 1 ? 'university matches' : 'universities match'} the current search and filters.`
              : 'No universities match the current search and filters. Remove or reset active selections to continue.'}
        </p>
        <div className="grid items-start gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="card sticky top-24 hidden p-5 lg:block" aria-label="University filters">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="display text-lg font-extrabold">Filters</h2>
              <div className="flex items-center gap-2">
                {(hasActiveFilters || query) && <button type="button" onClick={resetAll} className="text-xs font-bold text-forest-700 underline underline-offset-4">Reset</button>}
                <SlidersHorizontal size={18} className="text-forest-700" aria-hidden="true" />
              </div>
            </div>
            <FilterContent {...filterProps} />
          </aside>

          <section className="min-w-0" aria-labelledby="catalogue-results-heading">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.14em] text-forest-700">US university catalogue</p>
                <h2 id="catalogue-results-heading" className="display mt-1 text-2xl font-extrabold sm:text-3xl">{status === 'loading' ? 'Loading universities' : `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}`}</h2>
              </div>
              <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold lg:hidden"><Filter size={17} /> Filters{hasActiveFilters ? ` (${selectedStates.length + Number(Boolean(field)) + Number(budget !== budgetLimits.max)})` : ''}</button>
            </div>

            {hasActiveFilters && <div className="mb-5 flex min-w-0 flex-wrap gap-2" aria-label="Active filters">
              {budget !== budgetLimits.max && <ActiveFilterChip label={`Budget: at most $${budget.toLocaleString()} / year`} icon={<BadgeDollarSign size={14} />} onClear={() => setBudget(budgetLimits.max)} />}
              {selectedStates.map((code) => {
                const option = stateOptions.find((item) => item.code === code)
                return <ActiveFilterChip key={code} label={`${option?.name ?? code} (${code})`} icon={<MapPin size={14} />} onClear={() => setSelectedStates(selectedStates.filter((item) => item !== code))} />
              })}
              {field && <ActiveFilterChip label={field} icon={<BookOpen size={14} />} onClear={() => setField('')} />}
              <button type="button" onClick={resetAll} className="min-h-10 px-2 text-sm font-bold text-forest-700 underline underline-offset-4">Reset all</button>
            </div>}

            {status === 'loading' ? <CatalogueListSkeleton /> : loadState ? (
              <DesignedState state={loadState} headingLevel={2} onReset={reload} />
            ) : filtered.length > 0 ? <div className="grid gap-6" data-testid="university-results">
              {filtered.map(({ university, fitsAfterScholarship }) => <UniversityCard key={university.id} university={university} layout="list" fitsAfterScholarship={fitsAfterScholarship} saved={saved.has(university.id)} onSave={() => onToggleSave(university.id)} onOpen={() => onOpen(university)} />)}
            </div> : <CatalogueEmptyState onReset={resetAll} />}
          </section>
        </div>
      </div>

      {filtersOpen && <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" role="dialog" aria-modal="true" aria-label="Search filters" onMouseDown={() => setFiltersOpen(false)}><aside className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white p-6" onMouseDown={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between gap-3"><h2 className="display text-2xl font-extrabold">Refine results</h2><div className="flex items-center gap-2">{(hasActiveFilters || query) && <button type="button" onClick={resetAll} className="min-h-10 px-2 text-sm font-bold text-forest-700 underline underline-offset-4">Reset</button>}<button type="button" onClick={() => setFiltersOpen(false)} className="grid size-10 place-items-center rounded-full bg-canvas" aria-label="Close filters"><X size={20} /></button></div></div><FilterContent {...filterProps} /><button type="button" onClick={() => setFiltersOpen(false)} className="sticky bottom-4 mt-7 w-full rounded-xl bg-forest-800 py-3.5 font-bold text-white shadow-lg">Show {filtered.length} {filtered.length === 1 ? 'result' : 'results'}</button></aside></div>}
    </div>
  )
}

function ActiveFilterChip({ label, icon, onClear }: { label: string; icon: React.ReactNode; onClear: () => void }) {
  return <button type="button" onClick={onClear} className="inline-flex min-h-10 min-w-0 max-w-full items-center gap-1.5 rounded-full border border-forest-700 bg-forest-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-forest-900" aria-label={`Remove filter: ${label}`}>{icon}<span className="truncate">{label}</span><X size={14} className="shrink-0" aria-hidden="true" /></button>
}

function CatalogueEmptyState({ onReset }: { onReset: () => void }) {
  return <section className="soft-grid rounded-[28px] border border-line bg-white px-6 py-14 text-center shadow-soft sm:px-12"><div className="mx-auto grid size-20 place-items-center rounded-full bg-forest-50 text-forest-700"><Search size={42} strokeWidth={1.5} /></div><h2 className="display mt-6 text-3xl font-extrabold">No exact matches yet</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-muted">Try removing one or more active search or filter selections. We will never invent a match just to fill the page.</p><button type="button" onClick={onReset} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white transition hover:bg-forest-700">Reset search and filters <ArrowRight size={18} /></button></section>
}

function CatalogueListSkeleton() {
  return (
    <section aria-label="Loading university list" aria-live="polite">
      <h2 className="sr-only">Loading university list</h2>
      <div className="grid gap-6">
        {[0, 1, 2].map((item) => (
          <article key={item} className="card overflow-hidden md:grid md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="h-48 skeleton md:h-auto md:min-h-[290px]" />
            <div className="space-y-4 p-5">
              <div className="h-6 w-3/4 rounded skeleton" />
              <div className="h-4 w-full rounded skeleton" />
              <div className="h-4 w-4/5 rounded skeleton" />
              <div className="mt-6 h-12 rounded-xl skeleton" />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
