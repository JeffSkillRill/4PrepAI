import {
  ArrowUpRight,
  BadgeCheck,
  Compass,
  Database,
  FileQuestion,
  GitCompareArrows,
  Globe2,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { type CounselorAnswer, useCounselorConversation } from '../counselor/conversation'
import { requestCounselorAnswer } from '../counselor/request'
import { CounselorComparison, UniversityPickerModal } from '../counselor/UniversityComparison'
import type { StudentProfile } from '../types'
import { SourceChip } from '../components/Trust'
import { SafeMarkdown, webCitationDetails } from '../components/SafeMarkdown'

export function CounselorScreen({ profile, saved }: { profile: StudentProfile | null; saved: ReadonlySet<string> }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [comparisonPickerOpen, setComparisonPickerOpen] = useState(false)
  const { turns, addTurn, addComparison, updateComparison, clearTurns } = useCounselorConversation()
  const remainingCharacters = 1000 - message.length
  const budgetTone = remainingCharacters <= 100 ? 'text-rose-800' : remainingCharacters <= 250 ? 'text-chart-awaiting' : 'text-muted'

  const ask = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return
    const question = message.trim()
    setLoading(true)
    const result = await requestCounselorAnswer(question)
    setLoading(false)
    addTurn({ question, answer: result.answer, error: result.error })
    setMessage('')
  }

  return (
    <div>
      <section className="border-b border-line bg-band text-white">
        <div className="page-container py-12 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold"><ShieldCheck size={16} /> Grounded by verified 4Prep records</span>
          <h1 className="display mt-5 text-4xl font-extrabold sm:text-5xl">Ask the 4Prep counselor</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">University figures come only from the database records shown in 4Prep. General guidance is clearly separated and links to its web sources.</p>
        </div>
      </section>
      <section className="page-container py-10">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <form onSubmit={(event) => void ask(event)} className="card p-5 sm:p-7">
              <label htmlFor="counselor-message" className="display text-xl font-extrabold">What would you like to know?</label>
              <textarea id="counselor-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} rows={5} aria-describedby="counselor-budget" placeholder="For example: What is Princeton’s 2026–27 cost of attendance?" className="mt-4 w-full resize-y rounded-xl border border-line bg-paper p-4 leading-7 outline-none focus:border-forest-500 focus-visible:ring-2 focus-visible:ring-forest-200" />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <span className="text-muted">University facts are checked against sourced records first.</span>
                <span id="counselor-budget" className={`shrink-0 font-bold ${budgetTone}`} aria-live="polite">{remainingCharacters} left</span>
              </div>
              <button disabled={loading || !message.trim()} aria-busy={loading} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-action px-5 py-3 font-bold text-on-action disabled:bg-button-disabled disabled:text-muted">{loading ? 'Request received · checking' : 'Ask counselor'} <Send size={17} /></button>
            </form>

            {loading && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-forest-200 bg-paper p-5 shadow-soft" role="status" aria-live="polite" aria-atomic="true">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700"><Database size={20} /></span>
                <div>
                  <p className="font-extrabold">Checking sourced records first</p>
                  <p className="mt-1 text-sm leading-6 text-muted">Your question was received. 4Prep is checking verified records before any clearly labelled general guidance. It will not guess.</p>
                  <span className="mt-3 inline-flex items-center gap-1" aria-hidden="true">
                    {[0, 1, 2].map((index) => <span key={index} className="counselor-thinking-dot size-2 rounded-full bg-forest-700" />)}
                  </span>
                </div>
              </div>
            )}
            {turns.length > 0 && <section className="mt-6" aria-label="Counselor conversation">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-extrabold">Conversation</h2><p className="mt-1 text-xs text-muted">The last 20 turns stay visible in this browser tab.</p></div><button type="button" onClick={clearTurns} className="min-h-0 rounded-lg px-2 py-1 text-sm font-bold text-muted underline hover:text-forest-800">Clear chat</button></div>
              <div className="space-y-5">{turns.map((turn) => turn.type === 'comparison' ? <CounselorComparison key={turn.id} universityIds={turn.universityIds} profile={profile} saved={saved} onRemoveUniversity={(universityId) => updateComparison(turn.id, turn.universityIds.filter((id) => id !== universityId))} /> : <article key={turn.id}>
                <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-action px-4 py-3 text-sm leading-6 text-on-action"><p className="text-xs font-extrabold uppercase tracking-[.12em] text-on-action/75">You</p><p className="mt-1 whitespace-pre-wrap">{turn.question}</p></div>
                {turn.answer ? <CounselorResponse answer={turn.answer} onSuggestion={setMessage} /> : turn.error ? <p role="alert" className="trust-static mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">{turn.error}</p> : null}
              </article>)}</div>
            </section>}
          </div>
          <aside className="card p-5">
            <h2 className="font-extrabold">What the counselor will do</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <li>• Answer only questions about US admissions and studying abroad.</li>
              <li>• Retrieve relevant verified records first.</li>
              <li>• Attach database sources to university figures.</li>
              <li>• Refuse when a requested figure is unknown.</li>
              <li>• Label web-assisted study or visa guidance as general information.</li>
              <li>• Never compute your Φ fit score.</li>
            </ul>
            <div className="mt-6 border-t border-line pt-5">
              <h2 className="font-extrabold">Ready to compare?</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Review verified costs, deadlines, and requirements side by side.</p>
              <button type="button" onClick={() => setComparisonPickerOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-bold text-forest-800 transition hover:bg-forest-100">
                <GitCompareArrows size={17} /> Compare universities
              </button>
            </div>
          </aside>
        </div>
      </section>
      {comparisonPickerOpen && <UniversityPickerModal saved={saved} onClose={() => setComparisonPickerOpen(false)} onConfirm={(universityIds) => { addComparison(universityIds); setComparisonPickerOpen(false) }} />}
    </div>
  )
}

function CounselorResponse({ answer, onSuggestion }: { answer: CounselorAnswer; onSuggestion: (suggestion: string) => void }) {
  if (answer.answerType === 'verified_fact') {
    return (
      <div className="motion-resolve mt-3 overflow-hidden rounded-2xl border border-forest-200 bg-paper">
        <div className="flex items-center gap-2 bg-band-mid px-5 py-3 text-sm font-extrabold text-white"><BadgeCheck size={18} /> Verified 4Prep fact</div>
        <div className="p-5"><SafeMarkdown text={answer.answer} className="text-sm leading-7 text-ink" /><div className="mt-4 flex flex-wrap gap-2">{answer.recordCitations.map((id) => <SourceChip key={id} sourceId={id} />)}</div></div>
      </div>
    )
  }

  if (answer.answerType === 'general_guidance') {
    return (
      <div className="motion-resolve mt-3 overflow-hidden rounded-2xl border border-sky-200 bg-paper">
        <div className="flex items-center gap-2 bg-sky-100 px-5 py-3 text-sm font-extrabold text-sky-950"><Globe2 size={18} /> General web guidance · not verified 4Prep data</div>
        <div className="p-5">
          <SafeMarkdown text={answer.answer} className="text-sm leading-7 text-sky-950" />
          {answer.webCitations.length > 0 && <ul className="mt-4 space-y-2 text-sm">{answer.webCitations.map((url, index) => {
            const citation = webCitationDetails(url, index)
            return <li key={`${url}-${index}`}>{citation ? <a href={citation.href} target="_blank" rel="noreferrer" aria-label={citation.accessibleName} className="inline-flex min-h-11 items-center gap-1 font-bold text-sky-800 underline">{citation.label} <ArrowUpRight size={13} /></a> : <span className="inline-flex min-h-11 items-center text-muted">Source {index + 1}: unavailable link</span>}</li>
          })}</ul>}
        </div>
      </div>
    )
  }

  if (answer.answerType === 'out_of_scope') {
    return (
      <div className="trust-static soft-grid mt-3 rounded-2xl border border-forest-200 bg-paper p-6">
        <Compass size={36} className="text-forest-700" />
        <h3 className="display mt-4 text-2xl font-extrabold">That is outside what I advise on</h3>
        <SafeMarkdown text={answer.answer} className="mt-3 leading-7 text-muted" />
        {answer.suggestions && answer.suggestions.length > 0 && <><p className="mt-6 text-sm font-bold text-forest-900">Try asking instead:</p><ul className="mt-3 grid gap-2">{answer.suggestions.map((suggestion) => <li key={suggestion}><button type="button" onClick={() => onSuggestion(suggestion)} className="w-full rounded-xl border border-line px-4 py-3 text-left text-sm leading-6 text-forest-900 transition hover:border-forest-500 hover:bg-forest-50">{suggestion}</button></li>)}</ul></>}
      </div>
    )
  }

  return (
    <div className="trust-static soft-grid mt-3 rounded-2xl border border-forest-100 bg-paper p-6">
      <FileQuestion size={36} className="text-forest-700" />
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[.13em] text-forest-700">Honest refusal · no guess</p>
      <h3 className="display mt-1 text-2xl font-extrabold">Verified answer unavailable</h3>
      <SafeMarkdown text={answer.answer} className="mt-3 leading-7 text-muted" />
      <p className="mt-4 rounded-xl bg-canvas p-3 text-xs leading-5 text-muted">No citation is attached because no verified figure was used. Confirm the requested detail with the university office named above.</p>
    </div>
  )
}
