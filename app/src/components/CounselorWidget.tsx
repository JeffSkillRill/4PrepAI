import { ArrowUpRight, Bot, ChevronDown, Send, X } from 'lucide-react'
import { useState } from 'react'
import { useCounselorConversation } from '../counselor/conversation'
import { SafeMarkdown } from './SafeMarkdown'
import { requestCounselorAnswer } from '../screens/CounselorScreen'

export function CounselorWidget({ onOpenCounselor }: { onOpenCounselor?: () => void }) {
  const [open, setOpen] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { turns, addTurn, clearTurns } = useCounselorConversation()

  const ask = async (event: React.FormEvent) => {
    event.preventDefault()
    const question = message.trim()
    if (!question || loading) return
    setLoading(true)
    const result = await requestCounselorAnswer(question)
    setLoading(false)
    addTurn({ question, answer: result.answer, error: result.error })
    setMessage('')
  }

  return (
    <aside className="counselor-widget fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6" aria-label="4Prep counselor">
      {open ? (
        <section className="counselor-widget-panel w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl border border-forest-200 bg-white shadow-raised" aria-live="polite">
          <header className="flex items-start gap-3 bg-forest-800 px-4 py-3 text-white">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/15"><Bot size={20} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold">4Prep counselor</h2>
              <p className="mt-0.5 text-xs leading-5 text-white/75">Ask about universities, costs, or applications.</p>
            </div>
            {onOpenCounselor && <button type="button" onClick={() => { setOpen(false); onOpenCounselor() }} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white" aria-label="Open full counselor chat">Open chat <ArrowUpRight size={14} /></button>}
            <button type="button" onClick={() => setOpen(false)} className="grid size-9 min-h-0 min-w-0 place-items-center rounded-lg text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white" aria-label="Close counselor"><X size={18} /></button>
          </header>
          <div className="max-h-72 overflow-y-auto px-4 py-3 text-sm leading-6 text-ink" aria-live="polite">
            {turns.length > 0 ? <div className="space-y-3">{turns.map((turn) => <div key={turn.id} className="space-y-2"><div className="ml-5 rounded-xl rounded-br-sm bg-forest-800 px-3 py-2 text-white"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-white/65">You</p><p>{turn.question}</p></div><div className="mr-5 rounded-xl rounded-bl-sm bg-canvas px-3 py-2"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-muted">4Prep counselor</p>{turn.answer ? <SafeMarkdown text={turn.answer.answer} className="mt-1" /> : <p className="mt-1 text-rose-900">{turn.error ?? 'No verified answer is available right now.'}</p>}</div></div>)}</div> : <p>Hi, I can help you understand verified university information. What would you like to know?</p>}
            {loading && <p className="mt-2 text-muted">Checking sourced records...</p>}
          </div>
          <form onSubmit={(event) => void ask(event)} className="border-t border-line p-3">
            {turns.length > 0 && <button type="button" onClick={clearTurns} className="mb-2 min-h-0 px-1 py-1 text-xs font-bold text-muted underline hover:text-forest-800">Clear chat</button>}
            <label className="sr-only" htmlFor="counselor-widget-message">Ask the counselor</label>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 focus-within:border-forest-500 focus-within:ring-2 focus-within:ring-forest-100">
              <input id="counselor-widget-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} placeholder="Ask a question" className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none" />
              <button type="submit" disabled={!message.trim() || loading} className="grid size-9 min-h-0 min-w-0 place-items-center rounded-lg bg-forest-800 text-white disabled:bg-button-disabled disabled:text-muted" aria-label="Send question"><Send size={16} /></button>
            </div>
          </form>
        </section>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="counselor-widget-launcher grid size-14 place-items-center rounded-full bg-forest-800 text-white shadow-raised hover:bg-forest-700 focus-visible:ring-4 focus-visible:ring-forest-200" aria-label="Open 4Prep counselor"><Bot size={25} /></button>
      )}
      {open && <button type="button" onClick={() => setOpen(false)} className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-bold text-forest-800 shadow-soft hover:bg-forest-50 focus-visible:ring-2 focus-visible:ring-forest-500"><ChevronDown size={14} /> Hide counselor</button>}
    </aside>
  )
}
