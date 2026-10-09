import { ArrowUpRight, Bot, ChevronDown, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  CHAT_OPENER,
  COUNSELOR_NAME,
  ChatComposer,
  CounselorAnswerMessage,
  CounselorBubble,
  CounselorErrorMessage,
  StudentBubble,
  TypingBubble,
  useStickToBottom,
} from '../counselor/ChatParts'
import { useCounselorChat } from '../counselor/useCounselorChat'

export function CounselorWidget({ onOpenCounselor }: { onOpenCounselor?: () => void }) {
  const [open, setOpen] = useState(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const hasOpenedRef = useRef(false)
  const { turns, clearTurns, draft, setDraft, pending, busy, send, retry, inputRef } = useCounselorChat()
  const listRef = useStickToBottom<HTMLDivElement>(`${open}:${turns.length}:${pending ?? ''}`)

  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true
      inputRef.current?.focus()
    } else if (hasOpenedRef.current) {
      launcherRef.current?.focus()
    }
  }, [inputRef, open])

  return (
    <aside className="counselor-widget fixed top-24 right-4 z-50 flex flex-col items-end sm:top-auto sm:bottom-6 sm:right-6" aria-label="4Prep counselor">
      {open ? (
        <section className="counselor-widget-panel w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl border border-forest-200 bg-elevated shadow-raised">
          <header className="flex items-start gap-3 bg-band-mid px-4 py-3 text-white">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/15"><Bot size={20} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold">{COUNSELOR_NAME}</h2>
              <p className="mt-0.5 text-xs leading-5 text-white/75">Ask about universities, costs, or applications.</p>
            </div>
            {onOpenCounselor && <button type="button" onClick={() => { setOpen(false); onOpenCounselor() }} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white" aria-label="Open full counselor chat">Open chat <ArrowUpRight size={14} /></button>}
            <button type="button" onClick={() => setOpen(false)} className="grid size-9 min-h-0 min-w-0 place-items-center rounded-lg text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white" aria-label="Close counselor"><X size={18} /></button>
          </header>
          <div ref={listRef} role="log" aria-live="polite" aria-label="Counselor conversation" className="max-h-80 space-y-3 overflow-y-auto overflow-x-hidden px-3 py-3">
            {turns.length === 0 && !pending && <CounselorBubble compact><p>{CHAT_OPENER}</p></CounselorBubble>}
            {turns.map((turn) => turn.type === 'comparison'
              ? <CounselorBubble key={turn.id} compact><p className="font-bold">University comparison added</p><p className="mt-1 text-xs text-muted">Open the full chat to review it.</p></CounselorBubble>
              : (
                <div key={turn.id} className="space-y-2">
                  <StudentBubble text={turn.question} />
                  {turn.answer
                    ? <CounselorAnswerMessage answer={turn.answer} onSend={(text) => void send(text)} compact busy={busy} />
                    : turn.error ? <CounselorErrorMessage error={turn.error} onRetry={() => retry(turn)} compact busy={busy} /> : null}
                </div>
              ))}
            {pending && <div className="space-y-2"><StudentBubble text={pending} /><TypingBubble compact /></div>}
          </div>
          <div className="border-t border-line p-3">
            {turns.length > 0 && <button type="button" onClick={clearTurns} className="mb-2 min-h-0 px-1 py-1 text-xs font-bold text-muted underline hover:text-forest-800">Clear chat</button>}
            <ChatComposer id="counselor-widget-message" label="Ask the counselor" value={draft} onChange={setDraft} onSend={() => void send(draft)} busy={busy} inputRef={inputRef} placeholder="Ask a question" compact />
          </div>
        </section>
      ) : (
        <button ref={launcherRef} type="button" onClick={() => setOpen(true)} className="counselor-widget-launcher grid size-14 place-items-center rounded-full bg-action text-on-action shadow-raised hover:bg-action focus-visible:ring-4 focus-visible:ring-forest-200" aria-label="Open 4Prep counselor"><Bot size={25} /></button>
      )}
      {open && <button type="button" onClick={() => setOpen(false)} className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-full bg-paper px-3 text-xs font-bold text-forest-800 shadow-soft hover:bg-forest-50 focus-visible:ring-2 focus-visible:ring-forest-500"><ChevronDown size={14} /> Hide counselor</button>}
    </aside>
  )
}
