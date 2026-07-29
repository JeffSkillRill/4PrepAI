import { ArrowRight, Bookmark, BookmarkCheck, MapPin } from 'lucide-react'
import type { University } from '../types'
import { DataValue, ExpandableFit, MissingValue } from './Trust'
import { PublishedNetCost } from './CostSummary'
import { UniversityVisual } from './UniversityVisual'

export function UniversityCard({ university, saved, onSave, onOpen, fitsAfterScholarship = false }: { university: University; saved: boolean; onSave: () => void; onOpen: () => void; fitsAfterScholarship?: boolean }) {
  return (
    <article className="card interactive-card group overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-forest-800">
        <UniversityVisual university={university} className="absolute inset-0 transition duration-500 group-hover:scale-[1.035]" />
        <div className="image-scrim absolute inset-0" />
        <button onClick={onSave} className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/95 text-forest-800 shadow transition hover:scale-105" aria-label={saved ? `Remove ${university.name} from saved` : `Save ${university.name}`}>
          {saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
        </button>
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div className="min-w-0 text-white">
            <h3 className="display text-xl font-extrabold leading-tight">{university.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/85"><MapPin size={14} /> {university.city}, {university.country}</p>
          </div>
          {university.fit ? <ExpandableFit fit={university.fit} compact /> : null}
        </div>
      </div>
      <div className="p-5">
        {fitsAfterScholarship && <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">Fits ceiling after published scholarship</p>}
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted">{university.tagline}{university.fit ? `. ${university.fit.summary}` : ''}</p>
        {!university.fit && (
          <div className="mt-4">
            <MissingValue
              title="Your fit isn’t calculated yet"
              reason="We haven’t got your profile yet, so we can’t score this university for you."
              action="Complete the intake to see all five fit components."
            />
          </div>
        )}
        <div className="mt-4 space-y-4 border-y border-line py-4 text-sm">
          <div><span className="block text-xs font-semibold uppercase tracking-wide text-muted">Published cost of attendance</span><DataValue point={university.totalCostOfAttendance} className="mt-1 font-bold" /></div>
          <div><span className="block text-xs font-semibold uppercase tracking-wide text-muted">Aid-adjusted net-cost scenario</span><div className="mt-1 font-bold"><PublishedNetCost university={university} compact /></div></div>
          <div><span className="block text-xs font-semibold uppercase tracking-wide text-muted">Next intake</span><DataValue point={university.intake} className="mt-1 font-bold" /></div>
        </div>
        <button onClick={onOpen} className="mt-4 inline-flex w-full items-center justify-between rounded-xl bg-forest-50 px-4 py-3 text-sm font-bold text-forest-800 transition hover:bg-forest-100">
          Explore university <ArrowRight size={17} className="transition group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  )
}
