import { ArrowUpRight, FileQuestion, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { AIResponseBlock, SourceChip } from '../components/Trust'
import { getSupabaseClient } from '../data/client'

type CounselorAnswer = {
  answerType: 'verified_fact' | 'general_guidance' | 'refusal'
  answer: string
  recordCitations: string[]
  webCitations: string[]
  requestId: string
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
      if (functionError instanceof FunctionsHttpError
        && functionError.context instanceof Response
        && functionError.context.status === 429) {
        try {
          setAnswer(await functionError.context.json() as CounselorAnswer)
          return
        } catch {
          // Fall through to the safe generic transport error.
        }
      }
      setError('The grounded counselor is unavailable. No unverified answer was displayed.')
      return
    }
    setAnswer(data as CounselorAnswer)
  }

  return (
    <main>
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
              <textarea id="counselor-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} rows={5} placeholder="For example: What is Princeton’s 2026–27 cost of attendance?" className="mt-4 w-full resize-y rounded-xl border border-line p-4 leading-7 outline-none focus:border-forest-500" />
              <button disabled={loading || !message.trim()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? 'Checking verified records…' : 'Ask counselor'} <Send size={17} /></button>
            </form>

            {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">{error}</p>}
            {answer?.answerType === 'verified_fact' && (
              <div className="mt-6">
                <AIResponseBlock>
                  <p className="font-bold text-forest-900">Verified 4Prep data</p>
                  <p className="mt-2 whitespace-pre-wrap">{answer.answer}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{answer.recordCitations.map((id) => <SourceChip key={id} sourceId={id} />)}</div>
                </AIResponseBlock>
              </div>
            )}
            {answer?.answerType === 'general_guidance' && (
              <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <p className="flex items-center gap-2 font-bold text-sky-950"><Sparkles size={17} /> General information — not verified 4Prep data</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-sky-950">{answer.answer}</p>
                {answer.webCitations.length > 0 && <ul className="mt-4 space-y-2 text-sm">{answer.webCitations.map((url) => <li key={url}><a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-sky-800 underline">Web source <ArrowUpRight size={13} /></a></li>)}</ul>}
              </div>
            )}
            {answer?.answerType === 'refusal' && (
              <div className="soft-grid mt-6 rounded-2xl border border-amber-200 bg-white p-6">
                <FileQuestion size={36} className="text-amber-700" />
                <h2 className="display mt-4 text-2xl font-extrabold">Verified answer unavailable</h2>
                <p className="mt-3 leading-7 text-muted">{answer.answer}</p>
                <p className="mt-4 text-xs text-muted">No database or web citation is attached because no verified figure was used.</p>
              </div>
            )}
          </div>
          <aside className="card p-5">
            <h2 className="font-extrabold">What the counselor will do</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <li>• Retrieve relevant verified records first.</li>
              <li>• Attach database sources to university figures.</li>
              <li>• Refuse when a requested figure is unknown.</li>
              <li>• Label web-assisted study or visa guidance as general information.</li>
              <li>• Never compute your Φ fit score.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  )
}
