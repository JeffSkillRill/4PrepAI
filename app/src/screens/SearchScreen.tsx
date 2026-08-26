import { BookOpen, ChevronDown, FileSearch, Filter, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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

type FilterProps = {
  budget: number
  setBudget: (value: number) => void
  field: string
  setField: (value: string) => void
  fields: string[]
}

const budgetLimits = { min: 5000, max: 100000, step: 1000 }

function FilterContent({ budget, setBudget, field, setField, fields }: FilterProps) {
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
      <label className="block text-sm font-bold">Field of study
        <span className="relative mt-2 block"><select value={field} onChange={(event) => setField(event.target.value)} className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2.5 pr-9 text-sm font-normal text-ink"><option value="">All fields</option>{fields.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3 text-muted" /></span>
      </label>
      <p className="rounded-xl bg-forest-50 p-3 text-xs leading-5 text-muted"><strong className="block text-forest-900">Budget meaning</strong>Results compare official annual cost of attendance with the largest numeric institutional award published for international students. Competitive awards are scenarios, not promises. Full-need policies and incomplete figures stay visible for individual review.</p>
    </div>
  )
}

export function SearchScreen({ query, setQuery, saved, onToggleSave, onOpen }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchPinned, setSearchPinned] = useState(false)
  const [budget, setBudget] = useState(budgetLimits.max)
  const [field, setField] = useState('')
  const { data: universities, status, reload } = useRepositoryData(() => listUniversities(), [])
  const availableUniversities = useMemo(() => universities ?? [], [universities])
  const loadState = status === 'error' || status === 'offline' ? status : null

  useEffect(() => {
    const updatePinnedState = () => {
      const hero = document.querySelector<HTMLElement>('.university-search-hero')
      setSearchPinned((hero?.getBoundingClientRect().bottom ?? Infinity) <= 72)
    }
    updatePinnedState()
    window.addEventListener('scroll', updatePinnedState, { passive: true })
    return () => window.removeEventListener('scroll', updatePinnedState)
  }, [])

  const fields = useMemo(() => [...new Set([...fieldOptions, ...availableUniversities.flatMap((item) => item.programs.map((program) => program.field))])], [availableUniversities])
  const { filtered, unknownCostCount } = useMemo(() => {
    const items = availableUniversities.flatMap((university) => {
      const haystack = university.name.toLowerCase()
      if (query.trim() && !haystack.includes(query.trim().toLowerCase())) return []
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
  }, [availableUniversities, query, field, budget])

  return (
    <div className="motion-resolve">
      <section className="university-search-hero">
        <div className="page-container relative z-10 flex min-h-80 flex-col justify-start pt-10 sm:min-h-[24rem] sm:pt-12">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[.14em] text-white/80">University search</p>
            <h1 className="display mt-1 text-3xl font-extrabold text-white">Find your next university</h1>
          </div>
        </div>
      </section>

      <section className={`catalogue-search-shell -mt-48 sticky top-[72px] z-30 sm:-mt-56 ${searchPinned ? 'is-pinned' : ''}`} aria-label="University search controls">
        <div className="page-container py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="catalogue-search-input flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-line bg-white px-4 py-2 shadow-soft focus-within:border-forest-500">
              <Search size={20} className="shrink-0 text-forest-700" aria-hidden="true" />
              <span className="sr-only">Search universities by name</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent outline-none placeholder:text-muted" placeholder="Type a university name" aria-label="Search universities by name" autoComplete="off" />
              {query ? <button type="button" onClick={() => setQuery('')} className="grid size-10 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-forest-800" aria-label="Clear university search"><X size={18} /></button> : null}
            </label>
            <button onClick={() => setFiltersOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold lg:hidden"><Filter size={17} /> Filters</button>
          </div>
          {field ? <div className="mt-3 flex min-w-0 max-w-4xl flex-wrap gap-2">
            <button type="button" onClick={() => setField('')} className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-forest-700 bg-forest-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-forest-900" aria-label={`Clear field of study filter: ${field}`}><BookOpen size={14} className="shrink-0" /><span className="truncate">{field}</span><X size={14} className="shrink-0" aria-hidden="true" /></button>
          </div> : null}
        </div>
      </section>

      <div className="page-container mt-40 py-6 sm:py-8 lg:py-10">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {status === 'loading'
            ? 'Loading universities. Search is ready while the list loads.'
            : filtered.length > 0
            ? `${filtered.length} ${filtered.length === 1 ? 'university matches' : 'universities match'} the current filters.`
            : 'No universities match the current filters. Clear filters or widen the budget or field to continue.'}
        </p>
        {unknownCostCount > 0 && <div className="trust-static mb-5 flex items-start gap-2 rounded-xl border border-forest-100 bg-white p-4 text-sm text-forest-950"><FileSearch size={17} className="mt-0.5 shrink-0 text-forest-700" /><span><strong>Kept visible on purpose:</strong> {unknownCostCount} result{unknownCostCount === 1 ? '' : 's'} cannot be filtered by a published numeric net cost. Open the evidence to see what the university has and has not published.</span></div>}
        <div className="grid items-start gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className={`card sticky hidden p-5 lg:block ${searchPinned ? 'top-[220px]' : 'top-44'}`}>
            <div className="mb-5 flex items-center justify-between"><h3 className="display text-lg font-extrabold">Filters</h3><SlidersHorizontal size={18} className="text-forest-700" /></div>
            <FilterContent {...{ budget, setBudget, field, setField, fields }} />
          </aside>
          {status === 'loading' ? <CatalogueListSkeleton /> : loadState ? (
            <DesignedState state={loadState} headingLevel={2} onReset={reload} />
          ) : filtered.length > 0 ? <div className="grid gap-6" data-testid="university-results">
            {filtered.map(({ university, fitsAfterScholarship }, index) => <UniversityCard key={university.id} university={university} layout="list" revealIndex={index} fitsAfterScholarship={fitsAfterScholarship} saved={saved.has(university.id)} onSave={() => onToggleSave(university.id)} onOpen={() => onOpen(university)} />)}
          </div> : <DesignedState state="no_results" headingLevel={2} onReset={() => { setQuery(''); setField(''); setBudget(budgetLimits.max) }} />}
        </div>
      </div>

      {filtersOpen && <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" role="dialog" aria-modal="true" aria-label="Search filters" onMouseDown={() => setFiltersOpen(false)}><aside className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white p-6" onMouseDown={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><h2 className="display text-2xl font-extrabold">Refine results</h2><button onClick={() => setFiltersOpen(false)} className="grid size-10 place-items-center rounded-full bg-canvas" aria-label="Close filters"><X size={20} /></button></div><FilterContent {...{ budget, setBudget, field, setField, fields }} /><button onClick={() => setFiltersOpen(false)} className="sticky bottom-4 mt-7 w-full rounded-xl bg-forest-800 py-3.5 font-bold text-white shadow-lg">Show results</button></aside></div>}
    </div>
  )
}

function CatalogueListSkeleton() {
  return (
    <section aria-label="Loading university list" aria-live="polite">
      <h2 className="sr-only">Loading university list</h2>
      <div className="grid gap-6">
        {[0, 1, 2].map((item) => (
          <article key={item} className="card overflow-hidden">
            <div className="h-40 skeleton sm:h-52" />
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
