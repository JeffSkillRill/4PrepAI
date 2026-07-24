import { Bookmark, BookmarkCheck, CalendarDays, Check, CircleDollarSign, Clock3, Languages, MapPin, Sparkles } from 'lucide-react'
import type { FitComponent, University } from '../types'
import { DataValue, SampleNotice } from '../components/Trust'
import { FitBadge } from '../components/UniversityCard'

function Grade({ item }: { item: FitComponent }) {
  const colors = item.tone === 'strong' ? 'bg-emerald-100 text-emerald-800' : item.tone === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
  return <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${colors}`}>{item.grade}</span>
}

export function ProfileScreen({ university, saved, onToggleSave }: { university: University; saved: boolean; onToggleSave: () => void }) {
  return (
    <main>
      <section className="relative h-[390px] min-h-[340px] overflow-hidden bg-forest-900 sm:h-[440px]">
        <img src={`https://picsum.photos/seed/${university.id}/1800/700`} alt="Sample campus banner" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <span className="absolute right-5 top-5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">Sample photo</span>
        <div className="page-container absolute inset-x-0 bottom-0 pb-8 text-white sm:pb-10">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl"><p className="flex items-center gap-2 text-sm font-semibold text-white/80"><MapPin size={17} /> {university.city}, {university.country} {university.flag}</p><h1 className="display mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">{university.name}</h1><p className="mt-3 text-lg text-white/80">{university.tagline}</p></div>
            <FitBadge grade={university.fit.grade} label={university.fit.label} />
          </div>
        </div>
      </section>

      <nav className="sticky top-[73px] z-30 border-b border-line bg-canvas/95 backdrop-blur" aria-label="University sections">
        <div className="page-container flex gap-7 overflow-x-auto text-sm font-bold text-muted">
          {['Overview', 'Costs', 'Admissions', 'Scholarships'].map((tab, index) => <a key={tab} href={`#${tab.toLowerCase()}`} className={`whitespace-nowrap border-b-[3px] py-4 transition hover:text-forest-800 ${index === 0 ? 'border-forest-700 text-forest-800' : 'border-transparent'}`}>{tab}</a>)}
        </div>
      </nav>

      <div className="page-container grid items-start gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <SampleNotice />
          <section id="overview" className="card scroll-mt-36 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Overview</p>
            <h2 className="display mt-2 text-3xl font-extrabold">Why this could fit your plan</h2>
            <p className="mt-4 leading-7 text-muted">{university.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">{university.highlights.map((highlight) => <div key={highlight} className="flex items-start gap-2 rounded-xl bg-forest-50 p-4 text-sm font-semibold text-forest-900"><Check size={17} className="mt-0.5 shrink-0 text-forest-600" />{highlight}</div>)}</div>
            <div className="mt-8 border-t border-line pt-7"><h3 className="display text-xl font-extrabold">4Prep fit report</h3><p className="mt-1 text-sm text-muted">A reasoned comparison against your sample intake profile—not an admission prediction.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">{university.fit.components.map((item) => <div key={item.label} className="flex items-start gap-3 rounded-xl border border-line p-4"><Grade item={item} /><div><h4 className="font-bold">{item.label}</h4><p className="mt-1 text-sm leading-5 text-muted">{item.reason}</p></div></div>)}</div>
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Programs</p><h2 className="display mt-2 text-3xl font-extrabold">Courses to explore</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">{university.programs.map((program) => <div key={program.name} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><h3 className="font-bold">{program.name}</h3><p className="mt-1 text-sm text-muted">{program.degree}</p></div><div className="text-sm"><span className="block text-xs font-bold uppercase tracking-wide text-muted">Duration</span><DataValue point={program.duration} className="mt-1 font-semibold" /></div><div className="text-sm"><span className="block text-xs font-bold uppercase tracking-wide text-muted">Tuition</span><DataValue point={program.tuition} className="mt-1 font-semibold" /></div></div>)}</div>
          </section>

          <section id="costs" className="card scroll-mt-36 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Costs</p><h2 className="display mt-2 text-3xl font-extrabold">Build a complete budget</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2"><Fact icon={<CircleDollarSign />} label="Tuition" value={<DataValue point={university.tuition} />} /><Fact icon={<MapPin />} label="Estimated living costs" value={<DataValue point={university.livingCost} />} /><Fact icon={<Sparkles />} label="Application fee" value={<DataValue point={university.applicationFee} />} /><Fact icon={<CalendarDays />} label="Scholarship sample" value={<DataValue point={university.scholarship} />} /></div>
          </section>

          <section id="admissions" className="card scroll-mt-36 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Admissions</p><h2 className="display mt-2 text-3xl font-extrabold">Key application checkpoints</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3"><Fact icon={<CalendarDays />} label="Sample deadline" value={<DataValue point={university.deadline} />} /><Fact icon={<Languages />} label="Teaching language" value={<DataValue point={university.language} />} /><Fact icon={<Clock3 />} label="IELTS sample" value={<DataValue point={university.ielts} />} /></div>
          </section>

          <section id="scholarships" className="card scroll-mt-36 p-6 sm:p-8"><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Scholarships</p><h2 className="display mt-2 text-3xl font-extrabold">Funding evidence</h2><div className="mt-5 rounded-2xl bg-amber-50 p-5"><DataValue point={university.scholarship} className="font-bold" /><p className="mt-3 text-sm leading-6 text-muted">Funding can change by course, nationality, and intake. Open the source and confirm eligibility before including an award in your budget.</p></div></section>
        </div>

        <aside className="card sticky top-36 overflow-hidden">
          <div className="bg-forest-900 p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-200">At a glance</p><h2 className="display mt-2 text-2xl font-extrabold">Your route here</h2><p className="mt-2 text-sm leading-6 text-white/70">{university.fit.summary}</p></div>
          <div className="space-y-5 p-6"><Summary label="Next intake" value={<DataValue point={university.intake} />} /><Summary label="Tuition" value={<DataValue point={university.tuition} />} /><Summary label="IELTS sample" value={<DataValue point={university.ielts} />} /><Summary label="Deadline" value={<DataValue point={university.deadline} />} />
            <button onClick={onToggleSave} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold transition ${saved ? 'bg-forest-100 text-forest-900' : 'bg-forest-800 text-white hover:bg-forest-700'}`}>{saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}{saved ? 'Saved to shortlist' : 'Save university'}</button>
          </div>
        </aside>
      </div>
    </main>
  )
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="rounded-xl border border-line p-4"><div className="flex items-center gap-2 text-sm font-bold text-muted"><span className="text-forest-600 [&>svg]:size-18">{icon}</span>{label}</div><div className="mt-3 font-bold text-ink">{value}</div></div>
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="border-b border-line pb-4 last:border-0"><span className="block text-xs font-bold uppercase tracking-wide text-muted">{label}</span><div className="mt-1 text-sm font-bold [&_.inline-flex]:mt-1">{value}</div></div>
}
