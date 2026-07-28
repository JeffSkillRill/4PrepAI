import { Bookmark, BookmarkCheck, CalendarDays, Check, CircleDollarSign, Clock3, Languages, MapPin, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import type { StudentProfile } from '../types'
import { DataValue, ExpandableFit, FitBreakdown, MissingValue, SampleNotice } from '../components/Trust'
import { DesignedState, LoadingState } from '../components/States'
import { getUniversity } from '../data/repository'
import { useRepositoryData } from '../data/useRepositoryData'
import { computeFit } from '../scoring/phi'
import { UniversityVisual } from '../components/UniversityVisual'
import { PublishedNetCost } from '../components/CostSummary'

export function ProfileScreen({ universityId, profile, saved, onToggleSave }: { universityId: string; profile: StudentProfile | null; saved: boolean; onToggleSave: () => void }) {
  const { data, status, reload } = useRepositoryData(() => getUniversity(universityId), [universityId])
  const university = useMemo(() => data ? {
    ...data,
    ...(profile ? { fit: computeFit(profile, data) } : {}),
  } : null, [data, profile])

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />
  if (!university) return <DesignedState state="empty" onReset={reload} />

  return (
    <main>
      <section className="relative h-[390px] min-h-[340px] overflow-hidden bg-forest-900 sm:h-[440px]">
        <UniversityVisual university={university} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="page-container absolute inset-x-0 bottom-0 pb-8 text-white sm:pb-10">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl"><p className="flex items-center gap-2 text-sm font-semibold text-white/80"><MapPin size={17} /> {university.city}, {university.country} {university.flag}</p><h1 className="display mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">{university.name}</h1><p className="mt-3 text-lg text-white/80">{university.tagline}</p></div>
            {university.fit && <ExpandableFit fit={university.fit} />}
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
          <SampleNotice verification={university.verification} />
          <section id="overview" className="card scroll-mt-36 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Overview</p>
            <h2 className="display mt-2 text-3xl font-extrabold">Why this could fit your plan</h2>
            <p className="mt-4 leading-7 text-muted">{university.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">{university.highlights.map((highlight) => <div key={highlight} className="flex items-start gap-2 rounded-xl bg-forest-50 p-4 text-sm font-semibold text-forest-900"><Check size={17} className="mt-0.5 shrink-0 text-forest-600" />{highlight}</div>)}</div>
            <div className="mt-8 border-t border-line pt-7"><h3 className="display text-xl font-extrabold">4Prep fit report</h3>
              {university.fit ? <><p className="mt-1 text-sm text-muted">Calculated only from the profile you entered—not an admission prediction.</p><FitBreakdown fit={university.fit} /></> : <div className="mt-4"><MissingValue reason="Complete intake to see your fit." action="Build your pathway to calculate all five fit components." /></div>}
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Programs</p><h2 className="display mt-2 text-3xl font-extrabold">Courses to explore</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">{university.programs.map((program) => <div key={program.id} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><h3 className="font-bold">{program.name}</h3><p className="mt-1 text-sm text-muted">{program.degree}</p></div><div className="text-sm"><span className="block text-xs font-bold uppercase tracking-wide text-muted">Field</span><span className="mt-1 block font-semibold">{program.field}</span></div></div>)}</div>
          </section>

          <section id="costs" className="card scroll-mt-36 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Costs</p><h2 className="display mt-2 text-3xl font-extrabold">Build a complete budget</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Sticker cost and aid-adjusted cost are shown separately. The net figure uses only a numeric institutional award published for international students and never assumes you will receive it.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Fact icon={<CircleDollarSign />} label="Published cost of attendance" value={<DataValue point={university.totalCostOfAttendance} />} />
              <Fact icon={<Sparkles />} label="Aid-adjusted net-cost scenario" value={<PublishedNetCost university={university} />} />
              <Fact icon={<CircleDollarSign />} label="Tuition" value={<DataValue point={university.tuition} />} />
              <Fact icon={<CircleDollarSign />} label="Mandatory fees" value={<DataValue point={university.fees} />} />
              <Fact icon={<MapPin />} label="Room and board" value={<DataValue point={university.roomBoard} />} />
              <Fact icon={<Sparkles />} label="Aid for international students" value={<DataValue point={university.aidInternational} />} />
              <Fact icon={<CircleDollarSign />} label="Application fee" value={<DataValue point={university.applicationFee} />} />
              <Fact icon={<CircleDollarSign />} label="F-1 financial certification" value={<DataValue point={university.financialCertification} />} />
            </div>
          </section>

          <section id="admissions" className="card scroll-mt-36 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Admissions</p><h2 className="display mt-2 text-3xl font-extrabold">Key application checkpoints</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Fact icon={<CalendarDays />} label="Application deadline" value={<DataValue point={university.deadline} />} />
              <Fact icon={<CalendarDays />} label="Intake term" value={<DataValue point={university.intake} />} />
              <Fact icon={<Languages />} label="Teaching language" value={<DataValue point={university.language} />} />
              <Fact icon={<Clock3 />} label="Test policy" value={<DataValue point={university.testPolicy} />} />
              <Fact icon={<Languages />} label="TOEFL" value={<DataValue point={university.toefl} />} />
              <Fact icon={<Languages />} label="IELTS" value={<DataValue point={university.ielts} />} />
              <Fact icon={<Languages />} label="Duolingo" value={<DataValue point={university.duolingo} />} />
              <Fact icon={<Clock3 />} label="SAT expectation" value={<DataValue point={university.sat} />} />
              <Fact icon={<Clock3 />} label="ACT expectation" value={<DataValue point={university.act} />} />
              <Fact icon={<Clock3 />} label="GPA expectation" value={<DataValue point={university.gpa} />} />
            </div>
          </section>

          <section id="scholarships" className="card scroll-mt-36 p-6 sm:p-8"><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Scholarships</p><h2 className="display mt-2 text-3xl font-extrabold">International funding evidence</h2><div className="mt-5 rounded-2xl bg-amber-50 p-5"><DataValue point={university.aidInternational} className="font-bold" /><p className="mt-3 text-sm leading-6 text-muted">Competitive merit awards and need-based grants are not guaranteed. Open the source, confirm international eligibility, and get a personal aid offer before treating the displayed net-cost scenario as your price.</p></div></section>
        </div>

        <aside className="card sticky top-36 overflow-hidden">
          <div className="bg-forest-900 p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-200">At a glance</p><h2 className="display mt-2 text-2xl font-extrabold">Your route here</h2>{university.fit ? <p className="mt-2 text-sm leading-6 text-white/70">{university.fit.summary}</p> : <div className="mt-3"><MissingValue reason="No profile has been entered." action="Complete intake to see a profile-specific route." /></div>}</div>
          <div className="space-y-5 p-6"><Summary label="Published cost of attendance" value={<DataValue point={university.totalCostOfAttendance} />} /><Summary label="Aid-adjusted net-cost scenario" value={<PublishedNetCost university={university} compact />} /><Summary label="International aid" value={<DataValue point={university.aidInternational} />} /><Summary label="Test policy" value={<DataValue point={university.testPolicy} />} /><Summary label="Deadline" value={<DataValue point={university.deadline} />} />
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
