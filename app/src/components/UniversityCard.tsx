import { ArrowRight, ArrowUpRight, Bookmark, BookmarkCheck, Info, MapPin } from 'lucide-react'
import type { University } from '../types'
import { DataValue, ExpandableFit, MissingValue } from './Trust'
import { CostSummary } from './CostSummary'
import { UniversityVisual } from './UniversityVisual'
import { AppLink } from './AppLink'
import { useSource } from '../data/DataProvider'

function institutionLabel(university: University): string {
  const fourYear = university.tagline.match(/^(Public|Private) four-year institution\b/i)
  if (fourYear) return `${fourYear[1][0].toUpperCase()}${fourYear[1].slice(1).toLowerCase()} · 4-year`
  if (/\btwo-year\b/i.test(university.tagline)) return '2-year institution'
  return 'Institution type not verified'
}

function locationLabel(university: University): string {
  if (!university.stateName) return `${university.city}, State unknown, ${university.country}`
  const cityAlreadyIncludesState = university.city.toLowerCase().endsWith(`, ${university.stateName.toLowerCase()}`)
  return cityAlreadyIncludesState
    ? `${university.city}, ${university.country}`
    : `${university.city}, ${university.stateName}, ${university.country}`
}

export function UniversityCard({ university, saved, onSave, onOpen, fitsAfterScholarship = false, layout = 'grid' }: { university: University; saved: boolean; onSave: () => void; onOpen: () => void; fitsAfterScholarship?: boolean; layout?: 'grid' | 'list' }) {
  const isList = layout === 'list'
  const source = useSource(university.sourceId)

  if (isList) {
    return (
      <article className="card interactive-card group overflow-hidden md:grid md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="relative min-h-52 overflow-hidden bg-forest-900 md:min-h-full">
          <img src="/images/university-search-campus.png" alt="" className="motion-media absolute inset-0 size-full object-cover group-hover:scale-[1.025]" />
          <div className="image-scrim absolute inset-0" />
          <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-forest-950/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">{institutionLabel(university)}</span>
          <button onClick={onSave} className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-white/95 text-forest-800 shadow transition hover:scale-105" aria-label={saved ? `Remove ${university.name} from saved` : `Save ${university.name}`}>
            {saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
          </button>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="display text-2xl font-extrabold leading-tight text-forest-950">{university.name}</h3>
              <p className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-muted"><MapPin size={15} className="mt-0.5 shrink-0 text-forest-700" aria-hidden="true" /> <span>{locationLabel(university)}</span></p>
            </div>
            <span className="trust-static inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-bold text-muted" aria-label="Ranking: Not currently verified in this catalogue"><Info size={13} aria-hidden="true" />Not currently verified</span>
          </div>

          {fitsAfterScholarship && <p className="mt-4 inline-flex rounded-full bg-forest-100 px-3 py-1 text-xs font-bold text-forest-900">Fits ceiling after published scholarship</p>}
          <div className="mt-4"><CostSummary university={university} compact /></div>
          <p className="mt-4 line-clamp-1 text-sm leading-6 text-muted">{university.tagline}</p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AppLink href={`/universities/${encodeURIComponent(university.id)}`} onNavigate={onOpen} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-bold text-forest-900 transition hover:border-forest-300 hover:bg-forest-50">
              Explore university <ArrowRight size={17} />
            </AppLink>
            {source?.url ? <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 px-2 text-sm font-bold text-forest-700 underline underline-offset-4">
              View on official website <ArrowUpRight size={15} />
            </a> : <span className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-muted">External source link unavailable</span>}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="card interactive-card group overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-forest-800">
        <UniversityVisual university={university} className="motion-media absolute inset-0 group-hover:scale-[1.025]" />
        <div className="image-scrim absolute inset-0" />
        <button onClick={onSave} className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-white/95 text-forest-800 shadow transition hover:scale-105" aria-label={saved ? `Remove ${university.name} from saved` : `Save ${university.name}`}>
          {saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
        </button>
        <div className="absolute inset-x-4 bottom-4">
          <div className="min-w-0 text-white">
            <h3 className="display text-xl font-extrabold leading-tight">{university.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/85"><MapPin size={14} /> {university.city}, {university.country}</p>
          </div>
        </div>
      </div>
      <div className="min-w-0 p-5">
        {fitsAfterScholarship && <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">Fits ceiling after published scholarship</p>}
        {university.fit ? <ExpandableFit fit={university.fit} compact /> : null}
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted">{university.tagline}{university.fit ? `. ${university.fit.summary}` : ''}</p>
        {!university.fit && (
          <div className="mt-4">
            <MissingValue
              title="Your fit isn’t calculated yet"
              reason="We haven’t got your profile yet, so we can’t score this university for you."
              action="Complete the intake to see all five fit components."
              kind="profile"
            />
          </div>
        )}
        <div className="mt-4">
          <CostSummary university={university} />
        </div>
        <div className="mt-4 border-y border-line py-4 text-sm">
          <div><span className="block text-xs font-semibold uppercase tracking-wide text-muted">Next intake</span><DataValue point={university.intake} className="mt-1 font-bold" /></div>
        </div>
        <AppLink href={`/universities/${encodeURIComponent(university.id)}`} onNavigate={onOpen} className="mt-4 inline-flex w-full items-center justify-between rounded-xl bg-forest-50 px-4 py-3 text-sm font-bold text-forest-800 transition hover:bg-forest-100">
          Explore university <ArrowRight size={17} className="transition group-hover:translate-x-1" />
        </AppLink>
      </div>
    </article>
  )
}
