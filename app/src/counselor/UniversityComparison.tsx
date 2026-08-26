import { Check, MapPin, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { PublishedNetCost } from '../components/CostSummary'
import { DesignedState, LoadingState } from '../components/States'
import { DataValue, ExpandableFit, MissingValue, SourceChip } from '../components/Trust'
import { listUniversities } from '../data/repository'
import { useRepositoryData } from '../data/useRepositoryData'
import { computeFit } from '../scoring/phi'
import { bestPublishedCostScenario, hasComprehensiveInternationalFunding, hasFullNeedPolicy } from '../scoring/costs'
import type { StudentProfile, University } from '../types'

type Criterion = { label: string; render: (university: University) => ReactNode }

function comparisonGridClass(count: number) {
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}

function UniversityHeader({ university, onRemove }: { university: University; onRemove: () => void }) {
  return <div className="flex min-w-0 items-start justify-between gap-3 px-1 py-1"><div className="min-w-0"><h4 className="display text-base font-extrabold leading-tight text-forest-950">{university.name}</h4><p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={13} />{university.city}, {university.country}</p></div><button type="button" onClick={onRemove} className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-white text-forest-800 transition hover:border-forest-400 hover:bg-forest-50" aria-label={`Remove ${university.name} from comparison`}><X size={16} /></button></div>
}

export function CounselorComparison({ universityIds, profile, saved, onRemoveUniversity }: { universityIds: string[]; profile: StudentProfile | null; saved: ReadonlySet<string>; onRemoveUniversity: (universityId: string) => void }) {
  const { data, status, reload } = useRepositoryData(() => listUniversities(), [])
  const compared = useMemo(() => {
    const byId = new Map((data ?? []).map((university) => [university.id, university]))
    return universityIds.flatMap((id) => { const university = byId.get(id); return university ? [profile ? { ...university, fit: computeFit(profile, university) } : university] : [] })
  }, [data, profile, universityIds])
  const criteria: Criterion[] = [
    { label: '4Prep fit', render: (university) => university.fit ? <ExpandableFit fit={university.fit} compact /> : <MissingValue title="Your fit isn’t calculated yet" reason="No profile has been entered yet." action="Complete the intake to compare fit across these universities." kind="profile" /> },
    { label: 'Aid-adjusted net-cost scenario', render: (university) => <PublishedNetCost university={university} compact /> },
    { label: 'Cost of attendance', render: (university) => <DataValue point={university.totalCostOfAttendance} /> },
    { label: 'Tuition', render: (university) => <DataValue point={university.tuition} /> },
    { label: 'Mandatory fees', render: (university) => <DataValue point={university.fees} /> },
    { label: 'Room and board', render: (university) => <DataValue point={university.roomBoard} /> },
    { label: 'International aid', render: (university) => <DataValue point={university.aidInternational} /> },
    { label: 'F-1 financial certification', render: (university) => <DataValue point={university.financialCertification} /> },
    { label: 'Next intake', render: (university) => <DataValue point={university.intake} /> },
    { label: 'Deadline', render: (university) => <DataValue point={university.deadline} /> },
    { label: 'Test policy', render: (university) => <DataValue point={university.testPolicy} /> },
    { label: 'TOEFL', render: (university) => <DataValue point={university.toefl} /> },
    { label: 'IELTS', render: (university) => <DataValue point={university.ielts} /> },
    { label: 'Duolingo', render: (university) => <DataValue point={university.duolingo} /> },
    { label: 'SAT', render: (university) => <DataValue point={university.sat} /> },
    { label: 'ACT', render: (university) => <DataValue point={university.act} /> },
    { label: 'GPA', render: (university) => <DataValue point={university.gpa} /> },
    { label: 'Application fee', render: (university) => <DataValue point={university.applicationFee} /> },
    { label: 'Highlights', render: (university) => <ul className="space-y-2 text-sm">{university.highlights.map((highlight) => <li key={highlight} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-forest-600" />{highlight}</li>)}</ul> },
  ]
  if (status === 'loading') return <LoadingState kind="compare" />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />
  if (compared.length === 0) return <DesignedState state="empty" onReset={reload} />
  const gridClass = comparisonGridClass(compared.length)
  return <section className="comparison-turn-pop mt-3 rounded-2xl border border-forest-200 bg-white p-4 shadow-soft sm:p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700"><MapPin size={18} /></span><div><p className="text-xs font-extrabold uppercase tracking-[.12em] text-forest-700">Deterministic comparison</p><h3 className="display mt-1 text-xl font-extrabold">See the trade-offs clearly</h3><p className="mt-1 text-sm leading-6 text-muted">Current catalogue records are shown with their sources. Fit opens into all five components.</p></div></div><div className="sticky top-[76px] z-20 -mx-4 mt-5 border-y border-line bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-5 sm:px-5"><div data-testid="comparison-university-header" className={`grid gap-3 ${gridClass}`}>{compared.map((university) => <UniversityHeader key={university.id} university={university} onRemove={() => onRemoveUniversity(university.id)} />)}</div></div><NetCostComparisonChart universities={compared} savedSelection={saved.size > 0} /><div className="mt-6 grid gap-4">{criteria.map((criterion) => <section key={criterion.label} className="rounded-xl border border-line bg-canvas/35 p-4"><h4 className="text-xs font-extrabold uppercase tracking-[.12em] text-forest-800">{criterion.label}</h4><div className={`mt-3 grid gap-3 ${gridClass}`}>{compared.map((university) => <div key={university.id} role="group" aria-label={`${university.name}: ${criterion.label}`} className="min-w-0 rounded-lg border border-line bg-white p-3"><span className="sr-only">{university.name}</span><div className="text-sm leading-6 text-ink">{criterion.render(university)}</div></div>)}</div></section>)}</div></section>
}

export function NetCostComparisonChart({ universities, savedSelection }: { universities: University[]; savedSelection: boolean }) {
  const rows = universities.map((university) => { const individualized = hasFullNeedPolicy(university) || hasComprehensiveInternationalFunding(university); return { university, scenario: individualized ? null : bestPublishedCostScenario(university), reason: individualized ? 'Aid is individually assessed; no personal net figure is published.' : 'A sourced numeric annual total and aid amount are not both available.' } })
  const known = rows.filter((row) => row.scenario !== null)
  const currencies = new Set(known.map((row) => row.scenario?.currency))
  if (known.length === 0 || currencies.size !== 1) return <section className="mt-6 rounded-xl border border-line bg-canvas/35 p-4"><h4 className="display text-lg font-extrabold">Aid-adjusted cost comparison</h4><p className="mt-2 text-sm leading-6 text-muted">No comparison chart is drawn because these universities do not share comparable, sourced numeric net-cost scenarios. The sourced values and labelled gaps remain below.</p></section>
  const max = Math.max(...known.map((row) => row.scenario?.netCost ?? Number.NEGATIVE_INFINITY))
  const currency = known[0].scenario?.currency ?? ''
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 })
  const label = rows.map((row) => row.scenario ? `${row.university.name}: ${money.format(row.scenario.netCost)} per year.` : `${row.university.name}: not charted. ${row.reason}`).join(' ')
  return <section className="chart-focusable mt-6 rounded-xl border border-line bg-white p-4 sm:p-5" role="img" aria-label={`Aid-adjusted ${savedSelection ? 'saved-university' : 'catalogue'} comparison. ${label}`} tabIndex={0}><p className="text-xs font-extrabold uppercase tracking-[.12em] text-forest-700">{savedSelection ? 'Saved universities' : 'Catalogue examples'} · same {currency} scale</p><h4 className="display mt-1 text-lg font-extrabold">Published aid-adjusted scenarios</h4><p className="mt-2 text-xs leading-5 text-muted">These are published scenarios, not personal aid estimates. Missing or individualized figures are labelled instead of plotted as zero.</p><div className="mt-5 grid gap-4" aria-hidden="true">{rows.map((row) => row.scenario ? <div key={row.university.id}><div className="flex items-end justify-between gap-3 text-sm"><strong>{row.university.name}</strong><span className="font-bold text-forest-800">{money.format(row.scenario.netCost)}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full border border-line bg-canvas"><span className="block h-full rounded-full bg-forest-700" style={{ width: `${max > 0 ? (row.scenario.netCost / max) * 100 : 100}%` }} /></div><div className="mt-1 flex flex-wrap gap-1">{[row.scenario.costSourceId, row.scenario.aidSourceId].filter((id): id is string => Boolean(id)).map((id) => <SourceChip key={id} sourceId={id} />)}</div></div> : <p key={row.university.id} className="rounded-lg border border-dashed border-muted p-3 text-xs leading-5 text-muted"><strong className="text-ink">{row.university.name}: labelled gap.</strong> {row.reason}</p>)}</div><ul className="sr-only">{rows.map((row) => <li key={row.university.id}>{row.university.name}: {row.scenario ? `${money.format(row.scenario.netCost)} per year` : `Not charted. ${row.reason}`}</li>)}</ul></section>
}

export function UniversityPickerModal({ saved, onClose, onConfirm }: { saved: ReadonlySet<string>; onClose: () => void; onConfirm: (universityIds: string[]) => void }) {
  const { data, status, reload } = useRepositoryData(() => listUniversities(), [])
  const dialogRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const universities = useMemo(() => data ?? [], [data])
  const defaultIds = useMemo(() => (saved.size > 0 ? universities.filter((university) => saved.has(university.id)) : universities).slice(0, 3).map((university) => university.id), [saved, universities])
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null)
  const [query, setQuery] = useState('')
  const activeIds = selectedIds ?? defaultIds
  const selectedUniversities = universities.filter((university) => activeIds.includes(university.id))
  const filteredUniversities = useMemo(() => { const normalized = query.trim().toLowerCase(); return normalized ? universities.filter((university) => [university.name, university.city, university.country].some((value) => value.toLowerCase().includes(normalized))) : universities }, [query, universities])
  useEffect(() => { searchRef.current?.focus() }, [])
  const toggleUniversity = (id: string) => setSelectedIds((current) => { const selected = current ?? defaultIds; if (selected.includes(id)) return selected.filter((selectedId) => selectedId !== id); return selected.length < 3 ? [...selected, id] : selected })
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => { if (event.key === 'Escape') { event.preventDefault(); onClose(); return }; if (event.key !== 'Tab') return; const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])') ?? []); if (focusable.length === 0) return; const current = focusable.indexOf(document.activeElement as HTMLElement); const next = event.shiftKey ? (current <= 0 ? focusable.length - 1 : current - 1) : (current === focusable.length - 1 ? 0 : current + 1); event.preventDefault(); focusable[next].focus() }
  return <div className="fixed inset-0 z-[70] grid place-items-end bg-ink/50 p-4 sm:place-items-center" role="presentation" onMouseDown={onClose}><section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="comparison-picker-title" className="comparison-picker-pop max-h-[min(760px,calc(100vh-2rem))] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-raised sm:p-6" onMouseDown={(event) => event.stopPropagation()} onKeyDown={handleKeyDown}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.12em] text-forest-700">Compare in this chat</p><h2 id="comparison-picker-title" className="display mt-1 text-2xl font-extrabold">Choose universities</h2><p className="mt-1 text-sm text-muted">Compare up to three universities at a time.</p></div><button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full border border-line" aria-label="Close university picker"><X size={17} /></button></div>{status === 'loading' ? <LoadingState kind="compare" /> : status === 'error' || status === 'offline' ? <DesignedState state={status} onReset={reload} /> : universities.length === 0 ? <DesignedState state="empty" onReset={reload} /> : <><div className="mt-5"><p className="text-sm font-bold text-forest-900">{activeIds.length} of 3 selected</p><div className="mt-3 flex flex-wrap gap-2" aria-label="Selected universities">{selectedUniversities.map((university) => <button key={university.id} type="button" onClick={() => toggleUniversity(university.id)} className="inline-flex items-center gap-1 rounded-full border border-forest-200 bg-forest-50 px-3 py-2 text-sm font-bold text-forest-900" aria-label={`Remove ${university.name} from selection`}>{university.name}<X size={14} /></button>)}</div></div><div className="mt-5"><label htmlFor="comparison-university-search" className="text-sm font-extrabold text-forest-900">Search universities</label><input ref={searchRef} id="comparison-university-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, city, or country" className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-forest-500 focus-visible:ring-2 focus-visible:ring-forest-200" /></div>{activeIds.length >= 3 && <p className="mt-4 rounded-xl bg-canvas p-3 text-sm text-muted">Three selected — remove one before adding another.</p>}<div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{filteredUniversities.map((university) => { const selected = activeIds.includes(university.id); return <button key={university.id} type="button" onClick={() => toggleUniversity(university.id)} disabled={!selected && activeIds.length >= 3} aria-pressed={selected} className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-55 ${selected ? 'border-forest-500 bg-forest-50 font-extrabold text-forest-900' : 'border-line font-bold text-forest-900 hover:border-forest-500 hover:bg-forest-50'}`}><span className="block">{university.name}</span><span className="mt-1 block text-xs font-normal text-muted">{university.city}, {university.country}</span></button> })}</div>{filteredUniversities.length === 0 && <p className="mt-4 text-sm text-muted">No universities match that search.</p>}<div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-line px-4 py-3 text-sm font-bold text-forest-800">Cancel</button><button type="button" disabled={activeIds.length === 0} onClick={() => onConfirm(activeIds)} className="rounded-xl bg-forest-800 px-4 py-3 text-sm font-bold text-white disabled:bg-button-disabled disabled:text-muted">Add comparison to chat</button></div></>}</section></div>
}
