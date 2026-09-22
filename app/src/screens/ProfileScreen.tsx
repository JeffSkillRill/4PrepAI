import {
  Award,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileSearch,
  GraduationCap,
  Languages,
  MapPin,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { DataPoint, Program, StudentProfile, University } from '../types'
import { AIResponseBlock, DataValue, ExpandableFit, MissingValue, SampleNotice, SourceChip } from '../components/Trust'
import { DesignedState, LoadingState } from '../components/States'
import { getUniversity } from '../data/repository'
import { getSupabaseClient } from '../data/client'
import { useRepositoryData } from '../data/useRepositoryData'
import { computeFit } from '../scoring/phi'
import { UniversityVisual } from '../components/UniversityVisual'
import { CostSummary } from '../components/CostSummary'
import { useCountUp, useScrollReveal } from '../motion/hooks'
import { FitGauge, FitRadar } from '../components/charts/FitCharts'
import { BudgetComposition } from '../components/charts/BudgetComposition'
import { LivingCostDonut } from '../components/charts/LivingCostDonut'
import { ProgrammeLevels } from '../components/charts/ProgrammeLevels'
import { EmployabilityGauge } from '../components/charts/EmployabilityGauge'
import { RankingComparison } from '../components/charts/RankingComparison'

/**
 * Reading order, not database order. A student arrives asking "is this for
 * me?", then "can I get in?", then "can I afford it?", then "what would I
 * study?". Sections that exist mainly to admit a gap sit at the end.
 */
const sections = [
  'Fit',
  'Overview',
  'Admissions',
  'Tuition Fees',
  'Cost of Living',
  'Programmes',
  'Scholarships',
  'Employability',
  'Rankings & Ratings',
  'Campus Locations',
  'Videos & Media',
] as const

const levels: Program['degreeLevel'][] = ['bachelor', 'master', 'mba', 'phd']
const levelLabels: Record<Program['degreeLevel'], string> = { bachelor: 'Bachelor', master: 'Master', mba: 'MBA', phd: 'PhD' }
const idFor = (title: string) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '')

/** Tests the catalogue does not carry as a field at all, kept in one strip
 *  rather than six cards that each announce the same absence. */
const untrackedTests = ['GRE', 'GMAT', 'ATAR', 'IB', 'PTE', 'Cambridge']

export function filterProgrammes(programs: Program[], query: string) { const q = query.trim().toLowerCase(); return q ? programs.filter((program) => program.name.toLowerCase().includes(q)) : programs }
export function groupProgrammes(programs: Program[]) { return levels.flatMap((level) => { const atLevel = programs.filter((program) => program.degreeLevel === level); return atLevel.length ? [{ level, programs: atLevel, subjects: [...new Set(atLevel.map((program) => program.subjectArea))].map((subjectArea) => ({ subjectArea, programs: atLevel.filter((program) => program.subjectArea === subjectArea) })) }] : [] }) }

export function ProfileScreen({ universityId, profile, saved, onToggleSave }: { universityId: string; profile: StudentProfile | null; saved: boolean; onToggleSave: () => void }) {
  const { data, status, reload } = useRepositoryData(() => getUniversity(universityId), [universityId])
  const university = useMemo(() => data ? { ...data, ...(profile ? { fit: computeFit(profile, data) } : {}) } : null, [data, profile])
  const [active, setActive] = useState(idFor(sections[0]))
  useEffect(() => { if (typeof IntersectionObserver === 'undefined') return; const observer = new IntersectionObserver((entries) => { const visible = entries.find((entry) => entry.isIntersecting); if (visible) setActive(visible.target.id) }, { rootMargin: '-20% 0px -65% 0px' }); const elements = sections.map((section) => document.getElementById(idFor(section))).filter((item): item is HTMLElement => Boolean(item)); elements.forEach((item) => observer.observe(item)); return () => observer.disconnect() }, [university?.id])
  if (status === 'loading') return <LoadingState kind="profile" />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />
  if (!university) return <DesignedState state="empty" onReset={reload} />
  const topRanking = university.rankings[0]

  return <div>
    <ProfileHero university={university} />

    <div className="page-container grid items-start gap-8 py-8 lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-line bg-white p-4 lg:block">
        <p className="px-2 text-xs font-extrabold uppercase tracking-[.14em] text-forest-700">Table of contents</p>
        <nav className="mt-3 grid" aria-label="University profile sections">
          {sections.map((section) => <a key={section} href={`#${idFor(section)}`} className={`rounded-lg px-2 py-2 text-sm font-bold transition ${active === idFor(section) ? 'bg-forest-50 text-forest-800' : 'text-muted hover:bg-canvas'}`}>{section}</a>)}
        </nav>
      </aside>

      <main className="min-w-0 space-y-8">
        <SampleNotice verification={university.verification} />

        <Section title="Fit" eyebrow="Fit" heading="How this university scores against your profile">
          {university.fit && profile ? <div className="mt-6 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
              <FitGauge fit={university.fit} />
              <FitRadar fit={university.fit} />
            </div>
            <ExpandableFit fit={university.fit} />
            <FitRationale university={university} profile={profile} />
          </div> : <div className="mt-6 max-w-xl">
            <MissingValue title="Your fit isn’t calculated yet" reason="We haven’t got your profile yet, so we can’t score this university for you." action="Complete the intake to see all five fit components." kind="profile" />
          </div>}
        </Section>

        <Section title="Overview" heading="Why this could fit your plan">
          <p className="mt-4 leading-7 text-muted">{university.description}</p>
          {university.highlights.length > 0 && <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {university.highlights.map((highlight) => <div key={highlight} className="flex items-start gap-2 rounded-xl bg-forest-50 p-4 text-sm font-semibold text-forest-900"><Check size={17} className="mt-0.5 shrink-0 text-forest-600" />{highlight}</div>)}
          </div>}
          <div className="mt-6 max-w-sm">
            <p className="text-sm font-bold text-muted">Faculty</p>
            <div className="mt-1 font-bold"><DataValue point={university.facultyCount} /></div>
          </div>
        </Section>

        <Admissions university={university} />

        <Section title="Tuition Fees" heading="Build a complete budget">
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">The bar shows how the published components sit inside the published total. The panel beneath keeps the aid-adjusted view and every figure’s source.</p>
          <div className="mt-6"><BudgetComposition university={university} /></div>
          <div className="mt-5"><CostSummary university={university} /></div>
        </Section>

        <Section title="Cost of Living" heading="Living costs">
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Published living-cost details are shown separately from tuition, because universities publish them on a different basis.</p>
          <div className="mt-6"><LivingCostDonut university={university} /></div>
          <FactGroup items={[
            { label: 'Accommodation', point: university.livingAccommodation },
            { label: 'Food', point: university.livingFood },
            { label: 'Transport', point: university.livingTransport },
            { label: 'Utilities', point: university.livingUtilities },
            { label: 'Room and board', point: university.roomBoard },
            { label: 'Published living cost', point: university.livingCost },
          ]} />
        </Section>

        <Programmes university={university} />
        <Scholarships university={university} />

        <Section title="Employability" heading="Published career outcomes">
          <div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-start">
            <EmployabilityGauge university={university} />
            <div>
              <p className="text-sm font-bold text-muted">Employability summary</p>
              <div className="mt-2 font-bold"><DataValue point={university.employabilitySummary} /></div>
            </div>
          </div>
        </Section>

        <Section title="Rankings & Ratings" heading="Rankings & ratings">
          {university.rankings.length === 0 ? <div className="mt-6"><MissingValue title="Coming soon" reason="No sourced ranking records have been published for this university." action="Check back when a ranking source is added." /></div> : <>
            <div className="mt-6"><RankingComparison rankings={university.rankings} /></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {university.rankings.map((ranking) => <div key={ranking.id} className="rounded-xl border border-line p-4">
                <p className="text-sm font-bold text-muted">{ranking.label}</p>
                <p className="display mt-2 text-2xl font-extrabold">{ranking.rankDisplay}</p>
                {ranking.year && <p className="mt-1 text-sm text-muted">{ranking.year}</p>}
                <div className="mt-3"><SourceChip sourceId={ranking.sourceId} /></div>
              </div>)}
            </div>
          </>}
        </Section>

        <Section title="Campus Locations" heading="Campus locations">
          {university.campuses.length === 0 ? <div className="mt-6"><MissingValue title="Coming soon" reason="No sourced campus records have been published for this university." action="Check the university’s official locations page." /></div> : <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {university.campuses.map((campus) => <div key={campus.id} className="rounded-xl border border-line p-4">
              <h3 className="font-bold">{campus.name}</h3>
              <p className="mt-1 text-sm text-muted">{campus.city}, {campus.country}</p>
              <div className="mt-3"><SourceChip sourceId={campus.sourceId} /></div>
            </div>)}
          </div>}
        </Section>

        <Section title="Videos & Media" heading="Videos & media">
          <div className="mt-6"><MissingValue title="Coming soon" reason="University videos and media have not been published in 4Prep yet." action="Check back when sourced university content is published." /></div>
        </Section>

        <button onClick={onToggleSave} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold transition sm:w-auto ${saved ? 'bg-forest-100 text-forest-900' : 'bg-forest-800 text-white hover:bg-forest-700'}`}>
          {saved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}{saved ? 'Saved to shortlist' : 'Save university'}
        </button>
        {topRanking && <p className="sr-only">Highest listed ranking: {topRanking.label} {topRanking.rankDisplay}.</p>}
      </main>
    </div>
  </div>
}

function ProfileHero({ university }: { university: University }) {
  const { ref, revealed, animate } = useScrollReveal<HTMLDivElement>()
  const programmeCount = useCountUp(university.programs.length, animate, revealed)
  const topRanking = university.rankings[0]
  return (
    <section className="relative h-[410px] min-h-[360px] overflow-hidden bg-forest-900 sm:h-[460px]">
      <UniversityVisual university={university} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
      <div ref={ref} className="page-container absolute inset-x-0 bottom-0 pb-8 text-white sm:pb-10">
        <p className="flex items-center gap-2 text-sm font-semibold text-white/80"><MapPin size={17} /> {university.city}, {university.country} {university.flag}</p>
        <h1 className="display mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">{university.name}</h1>
        <p className="mt-3 max-w-3xl text-lg text-white/80">{university.tagline}</p>
        <div className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
          <HeroStat label="Available programmes" value={String(Math.round(animate ? programmeCount : university.programs.length))} />
          <HeroStat label="Top ranking" value={topRanking?.rankDisplay ?? 'Coming soon'} sourceId={topRanking?.sourceId} />
          <HeroStat label="International students" point={university.internationalStudentPct} />
        </div>
      </div>
    </section>
  )
}

/**
 * Sections fade up as they arrive. The reveal classes are only attached when
 * motion is allowed, so a reduced-motion reader's first paint is the final
 * state rather than an opacity-zero block waiting on an observer.
 */
function Section({ title, eyebrow, heading, children }: { title: string; eyebrow?: string; heading: string; children: React.ReactNode }) {
  const { ref, revealed, animate } = useScrollReveal<HTMLElement>()
  const reveal = animate ? `reveal-section ${revealed ? 'is-revealed' : ''}` : ''
  return (
    <section ref={ref} id={idFor(title)} className={`card scroll-mt-28 p-6 sm:p-8 ${reveal}`}>
      <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">{eyebrow ?? title}</p>
      <h2 className="display mt-2 text-3xl font-extrabold">{heading}</h2>
      {children}
    </section>
  )
}

function HeroStat({ label, value, sourceId, point }: { label: string; value?: string; sourceId?: string; point?: DataPoint<string> }) {
  return <div className="rounded-xl border border-white/20 bg-black/20 p-3 backdrop-blur">
    <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-white/65">{label}</p>
    {point && point.status === 'unknown'
      ? <><p className="mt-1 text-sm font-bold text-white/90">Not published</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.1em] text-white/45">Official data gap</p></>
      : point
        ? <DataValue point={point} className="mt-1 text-sm font-bold" />
        : <p className="mt-1 text-sm font-bold">{value}{sourceId && <span className="ml-2 inline-block align-middle"><SourceChip sourceId={sourceId} /></span>}</p>}
  </div>
}

type LabelledPoint = { label: string; point: DataPoint<string> }

function Fact({ icon, label, point }: { icon?: React.ReactNode; label: string; point: DataPoint<string> }) {
  return <div className="rounded-xl border border-line p-4">
    <div className="flex items-center gap-2 text-sm font-bold text-muted">{icon && <span className="text-forest-600 [&>svg]:size-5">{icon}</span>}{label}</div>
    <div className="mt-3 font-bold text-ink"><DataValue point={point} /></div>
  </div>
}

/**
 * Published figures get a card each; the gaps share one collapsed panel.
 *
 * Every gap keeps its own published reason and suggested action inside the
 * panel — this de-emphasises absence visually without hiding or softening it.
 */
function FactGroup({ items, icon }: { items: LabelledPoint[]; icon?: React.ReactNode }) {
  const known = items.filter((item) => item.point.status === 'known')
  const gaps = items.filter((item) => item.point.status === 'unknown')
  return <>
    {known.length > 0 && <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {known.map((item) => <Fact key={item.label} icon={icon} label={item.label} point={item.point} />)}
    </div>}
    {gaps.length > 0 && <details className="trust-static group mt-4 rounded-xl border border-forest-100 bg-canvas">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-bold text-forest-800">
        <FileSearch size={15} className="shrink-0" aria-hidden="true" />
        {gaps.length} figure{gaps.length === 1 ? '' : 's'} not published: {gaps.map((item) => item.label).join(', ')}
        <ChevronDown size={15} className="ml-auto shrink-0 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="grid gap-3 border-t border-forest-100 p-3 sm:grid-cols-2">
        {gaps.map((item) => <div key={item.label}>
          <p className="text-xs font-bold text-muted">{item.label}</p>
          <div className="mt-1.5"><DataValue point={item.point} /></div>
        </div>)}
      </div>
    </details>}
  </>
}

function Admissions({ university }: { university: University }) {
  const groups: Array<{ heading: string; icon: React.ReactNode; items: LabelledPoint[] }> = [
    {
      heading: 'Dates, language and logistics',
      icon: <CalendarDays />,
      items: [
        { label: 'Application deadline', point: university.deadline },
        { label: 'Intake term', point: university.intake },
        { label: 'Teaching language', point: university.language },
        { label: 'Application fee', point: university.applicationFee },
      ],
    },
    {
      heading: 'English proficiency',
      icon: <Languages />,
      items: [
        { label: 'TOEFL', point: university.toefl },
        { label: 'IELTS', point: university.ielts },
        { label: 'Duolingo', point: university.duolingo },
      ],
    },
    {
      heading: 'Standardised tests and academics',
      icon: <Clock3 />,
      items: [
        { label: 'Test policy', point: university.testPolicy },
        { label: 'SAT', point: university.sat },
        { label: 'ACT', point: university.act },
        { label: 'GPA', point: university.gpa },
      ],
    },
  ]

  return (
    <Section title="Admissions" heading="Key application checkpoints">
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Grouped the way an application is actually assembled: when to apply, how English is evidenced, and which academic tests the university publishes.</p>
      <div className="mt-6 space-y-7">
        {groups.map((group) => <div key={group.heading}>
          <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[.1em] text-forest-800">
            <span className="text-forest-600 [&>svg]:size-[18px]">{group.icon}</span>{group.heading}
          </h3>
          <FactGroup items={group.items} />
        </div>)}
        <div className="rounded-xl border border-dashed border-line p-4">
          <p className="text-sm font-bold text-muted">Not a 4Prep catalogue field yet</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {untrackedTests.map((label) => <li key={label} className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">{label}</li>)}
          </ul>
          <p className="mt-3 text-xs leading-5 text-muted">These tests are not tracked as fields in the 4Prep catalogue, so their absence here says nothing about whether this university accepts them. Check the university’s admissions pages.</p>
        </div>
      </div>
    </Section>
  )
}

function toggle<T>(current: Set<T>, value: T) { const next = new Set(current); if (next.has(value)) next.delete(value); else next.add(value); return next }

/** Grid-rows collapse keeps the panel mounted so it can animate; `inert`
 *  keeps a closed panel out of the tab order while it is visually collapsed. */
function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return <div className={`motion-collapse ${open ? 'is-open' : ''}`} inert={!open}><div>{children}</div></div>
}

function Programmes({ university }: { university: University }) {
  const [query, setQuery] = useState('')
  const [openLevels, setOpenLevels] = useState<Set<Program['degreeLevel']>>(new Set())
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set())
  const [all, setAll] = useState<Set<string>>(new Set())
  const searching = Boolean(query.trim())
  const groups = groupProgrammes(filterProgrammes(university.programs, query))

  return <Section title="Programmes" heading="Courses to explore">
    {university.programs.length > 0 && <div className="mt-6 max-w-xl"><ProgrammeLevels programs={university.programs} /></div>}
    <label className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-white px-3">
      <Search size={18} className="text-muted" />
      <span className="sr-only">Search university programmes</span>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search university programmes" className="min-h-12 w-full bg-transparent text-sm outline-none" />
    </label>
    {groups.length === 0 ? <div className="mt-5"><MissingValue title="Coming soon" reason={university.programs.length === 0 ? 'No sourced programmes have been published for this university.' : 'No sourced programme matches that search.'} action="Check the university catalogue or try another search." /></div> : <div className="mt-5 space-y-3">
      {groups.map((group) => {
        const levelOpen = searching || openLevels.has(group.level)
        return <div key={group.level} className="overflow-hidden rounded-xl border border-line">
          <button type="button" onClick={() => setOpenLevels((current) => toggle(current, group.level))} aria-expanded={levelOpen} className="flex min-h-12 w-full items-center gap-3 px-4 text-left font-bold transition hover:bg-canvas">
            <GraduationCap size={17} className="shrink-0 text-forest-600" aria-hidden="true" />
            {levelLabels[group.level]} ({group.programs.length})
            <ChevronDown className={`ml-auto size-4 shrink-0 transition ${levelOpen ? 'rotate-180' : ''}`} />
          </button>
          <Collapse open={levelOpen}>
            <div className="space-y-2 border-t border-line p-3">
              {group.subjects.map((subject) => {
                const key = `${group.level}:${subject.subjectArea}`
                const subjectOpen = searching || openSubjects.has(key)
                const rows = all.has(key) || searching ? subject.programs : subject.programs.slice(0, 6)
                return <div key={key} className="overflow-hidden rounded-lg bg-canvas">
                  <button type="button" onClick={() => setOpenSubjects((current) => toggle(current, key))} aria-expanded={subjectOpen} className="flex min-h-11 w-full items-center gap-3 px-3 text-left text-sm font-bold">
                    {subject.subjectArea} ({subject.programs.length})
                    <ChevronDown className={`ml-auto size-4 shrink-0 transition ${subjectOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <Collapse open={subjectOpen}>
                    <div className="divide-y divide-line border-t border-line bg-white">
                      {rows.map((program) => <ProgramRow key={program.id} program={program} />)}
                      {subject.programs.length > 6 && !searching && <button type="button" className="w-full px-3 py-3 text-left text-sm font-bold text-forest-800" onClick={() => setAll((current) => toggle(current, key))}>{all.has(key) ? 'Show less' : `View all ${subject.programs.length}`}</button>}
                    </div>
                  </Collapse>
                </div>
              })}
            </div>
          </Collapse>
        </div>
      })}
    </div>}
  </Section>
}

function ProgramRow({ program }: { program: Program }) {
  return <details className="group px-3">
    <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 py-2 text-sm font-bold">{program.name}<ChevronDown className="ml-auto size-4 shrink-0 transition group-open:rotate-180" /></summary>
    <div className="motion-disclosure">
      <div className="overflow-hidden">
        <div className="grid gap-3 border-t border-line py-3 sm:grid-cols-2">
          <div><p className="text-xs font-bold text-muted">Duration</p><DataValue point={program.duration} className="mt-1" /></div>
          <div><p className="text-xs font-bold text-muted">Tuition</p><DataValue point={program.tuition} className="mt-1" /></div>
        </div>
      </div>
    </div>
  </details>
}

function Scholarships({ university }: { university: University }) {
  return <Section title="Scholarships" heading="University scholarships">
    {university.scholarships.length === 0 ? <div className="mt-6"><MissingValue title="Coming soon" reason="No sourced scholarships are linked to this university." action="Check the university’s financial-aid pages." /></div> : <div className="mt-6 space-y-4">
      {university.scholarships.map((award) => <article key={award.id} className="rounded-xl border border-line p-4">
        <h3 className="flex items-start gap-2 font-bold"><Award size={18} className="mt-0.5 shrink-0 text-forest-600" aria-hidden="true" />{award.name}</h3>
        <div className="mt-3"><DataValue point={award.amount} /></div>
        {award.conditions.length > 0 && <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">
          {award.conditions.map((condition) => <li key={`${condition.kind}:${condition.publishedText}`}>{condition.publishedText} <SourceChip sourceId={condition.sourceId} /></li>)}
        </ul>}
      </article>)}
    </div>}
  </Section>
}

type Rationale = { answer: string; recordCitations: string[] }

function FitRationale({ university, profile }: { university: University; profile: StudentProfile }) {
  const [result, setResult] = useState<Rationale | null>(null)
  useEffect(() => {
    let alive = true
    getSupabaseClient().functions.invoke('counselor', { body: { mode: 'profile_rationale', universityId: university.id, profile, fit: university.fit } }).then(({ data }) => {
      if (alive && data && typeof data.answer === 'string' && Array.isArray(data.recordCitations)) setResult({ answer: data.answer, recordCitations: data.recordCitations.filter((id: unknown): id is string => typeof id === 'string') })
    }).catch(() => undefined)
    return () => { alive = false }
  }, [university.id, university.fit, profile])
  return result ? <AIResponseBlock><p>{result.answer}</p><div className="mt-3 flex flex-wrap gap-2">{result.recordCitations.map((id) => <SourceChip key={id} sourceId={id} />)}</div></AIResponseBlock> : null
}
