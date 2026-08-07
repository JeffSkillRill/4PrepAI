import {
  ArrowUpRight,
  BadgeCheck,
  Compass,
  Database,
  FileQuestion,
  Globe2,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { SourceChip } from '../components/Trust'
import { SafeMarkdown, webCitationDetails } from '../components/SafeMarkdown'
import { getSupabaseClient } from '../data/client'

type CounselorAnswer = {
  /**
   * `refusal` means 4Prep has no verified figure for an admissions question.
   * `out_of_scope` means the question was not an admissions question at all.
   * They read very differently to a student, so they render differently.
   */
  answerType: 'verified_fact' | 'general_guidance' | 'refusal' | 'out_of_scope'
  answer: string
  recordCitations: string[]
  webCitations: string[]
  /** Example questions returned with an out-of-scope reply. */
  suggestions?: string[]
  requestId: string
}

function isCounselorAnswer(value: unknown): value is CounselorAnswer {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CounselorAnswer>
  return ['verified_fact', 'general_guidance', 'refusal', 'out_of_scope'].includes(candidate.answerType ?? '')
    && typeof candidate.answer === 'string'
    && Array.isArray(candidate.recordCitations)
    && Array.isArray(candidate.webCitations)
    && typeof candidate.requestId === 'string'
}

type FunctionErrorResponse = Pick<Response, 'status' | 'clone'>

function responseFromFunctionError(error: unknown): FunctionErrorResponse | null {
  if (!error || typeof error !== 'object' || !('context' in error)) return null
  const context: unknown = (error as { context: unknown }).context
  if (!context || typeof context !== 'object') return null
  if (!('status' in context) || typeof context.status !== 'number') return null
  if (!('clone' in context) || typeof context.clone !== 'function') return null
  return context as FunctionErrorResponse
}

async function counselorAnswerFromResponse(response: FunctionErrorResponse): Promise<CounselorAnswer | null> {
  try {
    const payload: unknown = await response.clone().json()
    return isCounselorAnswer(payload) ? payload : null
  } catch {
    return null
  }
}

type PreflightUniversity = {
  id: string
  name: string
  university_facts: Array<{
    kind: string
    value: string | null
    unknown_reason: string | null
    suggested_action: string | null
  }>
  requirements: Array<{
    kind: string
    value: string | null
    unknown_reason: string | null
    suggested_action: string | null
  }>
}

function requestedKind(message: string): string | null {
  if (/\bapplication fee\b|\bapply fee\b/i.test(message)) return 'application_fee'
  if (/\btotal cost\b|\bcost of attendance\b|\bcoa\b/i.test(message)) return 'total_cost_of_attendance'
  if (/\broom\b.*\bboard\b|\bhousing\b.*\bmeal/i.test(message)) return 'room_board'
  if (/\bmandatory fee\b|\bstudent fee\b/i.test(message)) return 'fees'
  if (/\btuition\b|\bstudy fee\b/i.test(message)) return 'tuition'
  if (/\bdeadline\b/i.test(message)) return 'deadline'
  if (/\bfinancial certification\b|\bproof of funds\b|\bi-20\b/i.test(message)) return 'financial_certification'
  if (/\baid\b|\bscholarship\b|\bfunding\b/i.test(message)) return 'aid_international'
  if (/\btest optional\b|\btest required\b|\btesting policy\b/i.test(message)) return 'test_policy'
  if (/\btoefl\b/i.test(message)) return 'toefl'
  if (/\bielts\b/i.test(message)) return 'ielts'
  if (/\bduolingo\b|\bdet\b/i.test(message)) return 'duolingo'
  if (/\bsat\b/i.test(message)) return 'sat'
  if (/\bact\b/i.test(message)) return 'act'
  if (/\bgpa\b/i.test(message)) return 'gpa'
  return null
}

async function preflightUnknown(message: string): Promise<CounselorAnswer | null> {
  const kind = requestedKind(message)
  if (!kind) return null
  const { data, error } = await getSupabaseClient()
    .from('universities')
    .select('id,name,university_facts(kind,value,unknown_reason,suggested_action),requirements(kind,value,unknown_reason,suggested_action)')
  if (error) return null
  const normalized = message.toLowerCase()
  const university = (data as unknown as PreflightUniversity[]).find((item) =>
    normalized.includes(item.id.toLowerCase())
    || normalized.includes(item.name.toLowerCase()))
  if (!university) return null
  const record = [...university.university_facts, ...university.requirements]
    .find((fact) => fact.kind === kind)
  if (!record || record.value !== null) return null
  return {
    answerType: 'refusal',
    answer: `4Prep does not have a verified ${kind.replaceAll('_', ' ')} figure for ${university.name}.${record.suggested_action ? ` ${record.suggested_action}` : ' Please confirm it with the university.'}`,
    recordCitations: [],
    webCitations: [],
    requestId: crypto.randomUUID(),
  }
}

export function CounselorScreen() {
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState<CounselorAnswer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const remainingCharacters = 1000 - message.length
  const budgetTone = remainingCharacters <= 100 ? 'text-rose-800' : remainingCharacters <= 250 ? 'text-chart-awaiting' : 'text-muted'

  const ask = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    setAnswer(null)
    const preflight = await preflightUnknown(message.trim())
    if (preflight) {
      setAnswer(preflight)
      setLoading(false)
      return
    }
    const { data, error: functionError } = await getSupabaseClient().functions.invoke('counselor', {
      body: { message: message.trim() },
    })
    setLoading(false)
    if (functionError) {
      const errorResponse = responseFromFunctionError(functionError)
      if (errorResponse) {
        const safeAnswer = await counselorAnswerFromResponse(errorResponse)
        if (safeAnswer) {
          setAnswer(safeAnswer)
          return
        }
        if (errorResponse.status === 404) {
          setError('The grounded counselor is not configured for this environment. The counselor function was not found; no unverified answer was displayed.')
          return
        }
      }
      if (typeof functionError === 'object' && 'name' in functionError && functionError.name === 'FunctionsFetchError') {
        setError('The grounded counselor is not configured or cannot be reached from this environment. No unverified answer was displayed.')
        return
      }
      setError('The grounded counselor is unavailable. No unverified answer was displayed.')
      return
    }
    if (isCounselorAnswer(data)) {
      setAnswer(data)
      return
    }
    setError('The grounded counselor returned an invalid response. No unverified answer was displayed.')
  }

  return (
    <div>
      <section className="border-b border-line bg-forest-950 text-white">
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
              <textarea id="counselor-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} rows={5} aria-describedby="counselor-budget" placeholder="For example: What is Princeton’s 2026–27 cost of attendance?" className="mt-4 w-full resize-y rounded-xl border border-line bg-white p-4 leading-7 outline-none focus:border-forest-500 focus-visible:ring-2 focus-visible:ring-forest-200" />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <span className="text-muted">University facts are checked against sourced records first.</span>
                <span id="counselor-budget" className={`shrink-0 font-bold ${budgetTone}`} aria-live="polite">{remainingCharacters} left</span>
              </div>
              <button disabled={loading || !message.trim()} aria-busy={loading} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white disabled:bg-button-disabled disabled:text-muted">{loading ? 'Request received · checking' : 'Ask counselor'} <Send size={17} /></button>
            </form>

            {loading && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-forest-200 bg-white p-5 shadow-soft" role="status" aria-live="polite" aria-atomic="true">
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
            {error && <p role="alert" className="trust-static mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">{error}</p>}
            {answer?.answerType === 'verified_fact' && (
              <div className="motion-resolve mt-6 overflow-hidden rounded-2xl border border-forest-200 bg-white">
                <div className="flex items-center gap-2 bg-forest-800 px-5 py-3 text-sm font-extrabold text-white"><BadgeCheck size={18} /> Verified 4Prep fact</div>
                <div className="p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-ink">{answer.answer}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{answer.recordCitations.map((id) => <SourceChip key={id} sourceId={id} />)}</div>
                </div>
              </div>
            )}
            {answer?.answerType === 'general_guidance' && (
              <div className="motion-resolve mt-6 overflow-hidden rounded-2xl border border-sky-200 bg-white">
                <div className="flex items-center gap-2 bg-sky-100 px-5 py-3 text-sm font-extrabold text-sky-950"><Globe2 size={18} /> General web guidance · not verified 4Prep data</div>
                <div className="p-5">
                  <SafeMarkdown text={answer.answer} className="text-sm leading-7 text-sky-950" />
                  {answer.webCitations.length > 0 && <ul className="mt-4 space-y-2 text-sm">{answer.webCitations.map((url, index) => {
                    const citation = webCitationDetails(url, index)
                    return (
                      <li key={`${url}-${index}`}>
                        {citation ? (
                          <a href={citation.href} target="_blank" rel="noreferrer" aria-label={citation.accessibleName} className="inline-flex min-h-11 items-center gap-1 font-bold text-sky-800 underline">
                            {citation.label} <ArrowUpRight size={13} />
                          </a>
                        ) : <span className="inline-flex min-h-11 items-center text-muted">Source {index + 1}: unavailable link</span>}
                      </li>
                    )
                  })}</ul>}
                </div>
              </div>
            )}
            {answer?.answerType === 'out_of_scope' && (
              <div className="trust-static soft-grid mt-6 rounded-2xl border border-forest-200 bg-white p-6">
                <Compass size={36} className="text-forest-700" />
                <h2 className="display mt-4 text-2xl font-extrabold">That is outside what I advise on</h2>
                <p className="mt-3 leading-7 text-muted">{answer.answer}</p>
                {answer.suggestions && answer.suggestions.length > 0 && (
                  <>
                    <p className="mt-6 text-sm font-bold text-forest-900">Try asking instead:</p>
                    <ul className="mt-3 grid gap-2">
                      {answer.suggestions.map((suggestion) => (
                        <li key={suggestion}>
                          <button
                            type="button"
                            onClick={() => { setMessage(suggestion); setAnswer(null) }}
                            className="w-full rounded-xl border border-line px-4 py-3 text-left text-sm leading-6 text-forest-900 transition hover:border-forest-500 hover:bg-forest-50"
                          >
                            {suggestion}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            {answer?.answerType === 'refusal' && (
              <div className="trust-static soft-grid mt-6 rounded-2xl border border-forest-100 bg-white p-6">
                <FileQuestion size={36} className="text-forest-700" />
                <p className="mt-4 text-xs font-extrabold uppercase tracking-[.13em] text-forest-700">Honest refusal · no guess</p>
                <h2 className="display mt-1 text-2xl font-extrabold">Verified answer unavailable</h2>
                <p className="mt-3 leading-7 text-muted">{answer.answer}</p>
                <p className="mt-4 rounded-xl bg-canvas p-3 text-xs leading-5 text-muted">No citation is attached because no verified figure was used. Confirm the requested detail with the university office named above.</p>
              </div>
            )}
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
          </aside>
        </div>
      </section>
    </div>
  )
}
