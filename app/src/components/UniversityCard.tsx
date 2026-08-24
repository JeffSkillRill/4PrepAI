import { ArrowRight, Bookmark, BookmarkCheck, MapPin } from 'lucide-react'
import type { University } from '../types'
import { DataValue, ExpandableFit, MissingValue } from './Trust'
import { CostSummary } from './CostSummary'
import { UniversityVisual } from './UniversityVisual'
import { AppLink } from './AppLink'

export function UniversityCard({ university, saved, onSave, onOpen, fitsAfterScholarship = false, layout = 'grid' }: { university: University; saved: boolean; onSave: () => void; onOpen: () => void; fitsAfterScholarship?: boolean; layout?: 'grid' | 'list' }) {
  const isList = layout === 'list'
  return (
    <article className={`card interactive-card group overflow-hidden ${isList ? 'md:grid md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]' : ''}`}>
      <div className={`relative aspect-video overflow-hidden bg-forest-800 ${isList ? 'md:aspect-auto md:min-h-[220px]' : ''}`}>
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
      <div className={`min-w-0 ${isList ? 'p-4 sm:p-5' : 'p-5'}`}>
        {fitsAfterScholarship && <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">Fits ceiling after published scholarship</p>}
        {!isList && university.fit ? <ExpandableFit fit={university.fit} compact /> : null}
        <p className={`${isList ? 'line-clamp-1' : 'line-clamp-2 min-h-12'} text-sm leading-6 text-muted`}>{university.tagline}{!isList && university.fit ? `. ${university.fit.summary}` : ''}</p>
        {isList && <p className="mt-1.5 text-xs text-muted"><span className="font-bold text-ink">Ranking:</span> Not currently verified in this catalogue</p>}
        {!isList && !university.fit && (
          <div className="mt-4">
            <MissingValue
              title="Your fit isn’t calculated yet"
              reason="We haven’t got your profile yet, so we can’t score this university for you."
              action="Complete the intake to see all five fit components."
              kind="profile"
            />
          </div>
        )}
        <div className={isList ? 'mt-3' : 'mt-4'}>
          <CostSummary university={university} compact={isList} />
        </div>
        {!isList && <div className="mt-4 border-y border-line py-4 text-sm">
          <div><span className="block text-xs font-semibold uppercase tracking-wide text-muted">Next intake</span><DataValue point={university.intake} className="mt-1 font-bold" /></div>
        </div>}
        <AppLink href={`/universities/${encodeURIComponent(university.id)}`} onNavigate={onOpen} className={`${isList ? 'mt-3 py-2.5' : 'mt-4 py-3'} inline-flex w-full items-center justify-between rounded-xl bg-forest-50 px-4 text-sm font-bold text-forest-800 transition hover:bg-forest-100`}>
          Explore university <ArrowRight size={17} className="transition group-hover:translate-x-1" />
        </AppLink>
      </div>
    </article>
  )
}
