import { ArrowRight, Bookmark, BookmarkCheck, MapPin } from 'lucide-react'
import type { University } from '../types'
import { DataValue, ExpandableFit, MissingValue } from './Trust'

export function UniversityCard({ university, saved, onSave, onOpen }: { university: University; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return (
    <article className="card interactive-card group overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-forest-800">
        <img src={`https://picsum.photos/seed/${university.id}/800/450`} alt="Sample campus" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
        <div className="image-scrim absolute inset-0" />
        <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur">Sample photo</span>
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
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted">{university.tagline}{university.fit ? `. ${university.fit.summary}` : ''}</p>
        {!university.fit && <div className="mt-4"><MissingValue reason="Complete intake to see your fit." action="Build your pathway to calculate all five fit components." /></div>}
        <div className="mt-4 grid grid-cols-2 gap-4 border-y border-line py-4 text-sm">
          <div><span className="block text-xs font-semibold uppercase tracking-wide text-muted">Tuition</span><DataValue point={university.tuition} className="mt-1 font-bold" /></div>
          <div><span className="block text-xs font-semibold uppercase tracking-wide text-muted">Next intake</span><DataValue point={university.intake} className="mt-1 font-bold" /></div>
        </div>
        <button onClick={onOpen} className="mt-4 inline-flex w-full items-center justify-between rounded-xl bg-forest-50 px-4 py-3 text-sm font-bold text-forest-800 transition hover:bg-forest-100">
          Explore university <ArrowRight size={17} className="transition group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  )
}
