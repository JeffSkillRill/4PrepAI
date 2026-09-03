import { Bookmark, BookmarkCheck, CalendarDays, Check, Clock3, Languages, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import type { StudentProfile } from '../types'
import { DataValue, ExpandableFit, HonestGapCluster, MissingValue, SampleNotice } from '../components/Trust'
import { DesignedState, LoadingState } from '../components/States'
import { getUniversity } from '../data/repository'
import { useRepositoryData } from '../data/useRepositoryData'
import { computeFit } from '../scoring/phi'
import { UniversityVisual } from '../components/UniversityVisual'
import { CostSummary, PublishedNetCost } from '../components/CostSummary'

export function ProfileScreen({ universityId, profile, saved, onToggleSave }: { universityId: string; profile: StudentProfile | null; saved: boolean; onToggleSave: () => void }) {
  const { data, status, reload } = useRepositoryData(() => getUniversity(universityId), [universityId])
  const university = useMemo(() => data ? {
    ...data,
    ...(profile ? { fit: computeFit(profile, data) } : {}),
  } : null, [data, profile])

  if (status === 'loading') return <LoadingState kind="profile" />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />
  if (!university) return <DesignedState state="empty" onReset={reload} />

  return (
    <div>
      <section className="relative h-[390px] min-h-[340px] overflow-hidden bg-forest-900 sm:h-[440px]">
        <UniversityVisual university={university} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="page-container absolute inset-x-0 bottom-0 pb-8 text-white sm:pb-10">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl"><p className="flex items-center gap-2 text-sm font-semibold text-white/80"><MapPin size={17} /> {university.city}, {university.country} {university.flag}</p><h1 className="display mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">{university.name}</h1><p className="mt-3 text-lg text-white/80">{university.tagline}</p></div>
          </div>
        </div>
      </section>

      <nav className="sticky top-[73px] z-30 border-b border-line bg-canvas/95 backdrop-blur" aria-label="University sections">
        <div className="page-container flex gap-7 overflow-x-auto text-sm font-bold text-muted">
          {['Overview', 'Costs', 'Admissions', 'Scholarships'].map((tab, index) => <a key={tab} href={`#${tab.toLowerCase()}`} className={`whitespace-nowrap border-b-[3px] py-4 transition hover:text-forest-800 ${index === 0 ? 'border-forest-700 text-forest-800' : 'border-transparent'}`}>{tab}</a>)}
        </div>
      </nav>

      <div className="page-container motion-resolve pt-6">
        {university.fit ? (
          <div className="max-w-md"><ExpandableFit fit={university.fit} /></div>
        ) : (
          <MissingValue
            title="Your fit isn’t calculated yet"
            reason="We haven’t got your profile yet, so we can’t score this university for you."
            action="Complete the intake to see all five fit components."
            kind="profile"
          />
        )}
      </div>

      <div className="page-container grid items-start gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <SampleNotice verification={university.verification} />
          <HonestGapCluster items={[
            { label: 'Published cost of attendance', point: university.totalCostOfAttendance },
            { label: 'Mandatory fees', point: university.fees },
            { label: 'Room and board', point: university.roomBoard },
            { label: 'International aid', point: university.aidInternational },
            { label: 'F-1 financial certification', point: university.financialCertification },
            { label: 'Application deadline', point: university.deadline },
            { label: 'Duolingo requirement', point: university.duolingo },
            { label: 'GPA expectation', point: university.gpa },
          ]} contextRef={university.id} />
          <section id="overview" className="card scroll-mt-36 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Overview</p>
            <h2 className="display mt-2 text-3xl font-extrabold">Why this could fit your plan</h2>
            <p className="mt-4 leading-7 text-muted">{university.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">{university.highlights.map((highlight) => <div key={highlight} className="flex items-start gap-2 rounded-xl bg-forest-50 p-4 text-sm font-semibold text-forest-900"><Check size={17} className="mt-0.5 shrink-0 text-forest-600" />{highlight}</div>)}</div>
          </section>

          <section className="card p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Programs</p><h2 className="display mt-2 text-3xl font-extrabold">Courses to explore</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">{university.programs.map((program) => <div key={program.id} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><h3 className="font-bold">{program.name}</h3><p className="mt-1 text-sm text-muted">{program.degree}</p></div><div className="text-sm"><span className="block text-xs font-bold uppercase tracking-wide text-muted">Field</span><span className="mt-1 block font-semibold">{program.field}</span></div></div>)}</div>
          </section>

          <section id="costs" className="card scroll-mt-36 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Costs</p><h2 className="display mt-2 text-3xl font-extrabold">Build a complete budget</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Sticker cost and aid-adjusted cost are shown separately. The net figure uses only a numeric institutional award published for international students.</p>
            <div className="mt-6">
              <CostSummary university={university} />
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

          <section id="scholarships" className="card scroll-mt-36 p-6 sm:p-8"><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Scholarships</p><h2 className="display mt-2 text-3xl font-extrabold">International funding evidence</h2><div className="mt-5 rounded-2xl bg-forest-50 p-5"><DataValue point={university.aidInternational} className="font-bold" /><p className="mt-3 text-sm leading-6 text-muted"><a href="#published-aid-caution" className="font-bold text-forest-800 underline underline-offset-2">See the published-aid caution in Costs.</a></p></div></section>
        </div>

        <aside className="card sticky top-36 overflow-hidden">
          <div className="bg-forest-900 p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-200">At a glance</p></div>
          <div className="space-y-5 p-6"><Summary label="Published cost of attendance" value={<DataValue point={university.totalCostOfAttendance} />} /><Summary label="Aid-adjusted net-cost scenario" value={<PublishedNetCost university={university} compact />} /><Summary label="International aid" value={<DataValue point={university.aidInternational} />} /><Summary label="Test policy" value={<DataValue point={university.testPolicy} />} /><Summary label="Deadline" value={<DataValue point={university.deadline} />} />
            <button onClick={onToggleSave} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold transition ${saved ? 'bg-forest-100 text-forest-900' : 'bg-forest-800 text-white hover:bg-forest-700'}`}>{saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}{saved ? 'Saved to shortlist' : 'Save university'}</button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="rounded-xl border border-line p-4"><div className="flex items-center gap-2 text-sm font-bold text-muted"><span className="text-forest-600 [&>svg]:size-5">{icon}</span>{label}</div><div className="mt-3 font-bold text-ink">{value}</div></div>
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="border-b border-line pb-4 last:border-0"><span className="block text-xs font-bold uppercase tracking-wide text-muted">{label}</span><div className="mt-1 text-sm font-bold [&_.inline-flex]:mt-1">{value}</div></div>
}
