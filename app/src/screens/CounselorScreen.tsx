import { ChevronDown, GitCompareArrows } from 'lucide-react'
import { useState } from 'react'
import {
  CHAT_OPENER,
  COUNSELOR_NAME,
  ChatComposer,
  CounselorAnswerMessage,
  CounselorAvatar,
  CounselorBubble,
  CounselorErrorMessage,
  STARTER_SUGGESTIONS,
  StudentBubble,
  SuggestionChips,
  TypingBubble,
  useStickToBottom,
} from '../counselor/ChatParts'
import { CounselorComparison, UniversityPickerModal } from '../counselor/UniversityComparison'
import { useCounselorChat } from '../counselor/useCounselorChat'
import type { StudentProfile } from '../types'

export function CounselorScreen({ profile, saved }: { profile: StudentProfile | null; saved: ReadonlySet<string> }) {
  const [comparisonPickerOpen, setComparisonPickerOpen] = useState(false)
  const { turns, addComparison, updateComparison, clearTurns, draft, setDraft, pending, busy, send, retry, inputRef } = useCounselorChat()
  const listRef = useStickToBottom<HTMLDivElement>(`${turns.length}:${pending ?? ''}`)

  return (
    <div>
      <section className="border-b border-line bg-band text-white">
        <div className="page-container flex items-center gap-3 py-5">
          <CounselorAvatar />
          <div className="min-w-0">
            <h1 className="display text-2xl font-extrabold">{COUNSELOR_NAME}</h1>
            <p className="text-sm text-white/75">US admissions help for international students</p>
          </div>
        </div>
      </section>
      <section className="page-container py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="card flex h-[calc(100dvh-14rem)] min-h-[28rem] flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
              <h2 className="text-sm font-extrabold">Chat</h2>
              {turns.length > 0 && <button type="button" onClick={clearTurns} className="min-h-0 rounded-lg px-2 py-1 text-xs font-bold text-muted underline hover:text-forest-800">Clear chat</button>}
            </div>
            <div ref={listRef} role="log" aria-live="polite" aria-label="Counselor conversation" className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-4 py-5">
              {turns.length === 0 && !pending && (
                <div className="space-y-3">
                  <CounselorBubble><p>{CHAT_OPENER}</p></CounselorBubble>
                  <SuggestionChips suggestions={STARTER_SUGGESTIONS} onSend={(text) => void send(text)} disabled={busy} />
                </div>
              )}
              {turns.map((turn) => turn.type === 'comparison'
                ? <CounselorComparison key={turn.id} universityIds={turn.universityIds} profile={profile} saved={saved} onRemoveUniversity={(universityId) => updateComparison(turn.id, turn.universityIds.filter((id) => id !== universityId))} />
                : (
                  <article key={turn.id} className="space-y-3">
                    <StudentBubble text={turn.question} />
                    {turn.answer
                      ? <CounselorAnswerMessage answer={turn.answer} onSend={(text) => void send(text)} busy={busy} />
                      : turn.error ? <CounselorErrorMessage error={turn.error} onRetry={() => retry(turn)} busy={busy} /> : null}
                  </article>
                ))}
              {pending && (
                <div className="space-y-3">
                  <StudentBubble text={pending} />
                  <TypingBubble />
                </div>
              )}
            </div>
            <div className="border-t border-line bg-canvas p-3">
              <ChatComposer id="counselor-message" label="Message the counselor" value={draft} onChange={setDraft} onSend={() => void send(draft)} busy={busy} inputRef={inputRef} placeholder="Ask about costs, requirements, deadlines…" />
            </div>
          </div>
          <aside className="card h-fit p-5">
            <h2 className="font-extrabold">Ready to compare?</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Review costs, deadlines, and requirements side by side.</p>
            <button type="button" onClick={() => setComparisonPickerOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-bold text-forest-800 transition hover:bg-forest-100">
              <GitCompareArrows size={17} /> Compare universities
            </button>
            <details className="group mt-6 border-t border-line pt-4 text-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-bold text-forest-900">
                How answers are sourced <ChevronDown size={16} className="transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-2 leading-6 text-muted">University figures such as fees, deadlines and test requirements come only from 4Prep’s university records, with the source shown under the answer. General advice on essays, visas or study is marked “General info · not verified 4Prep data”.</p>
            </details>
          </aside>
        </div>
      </section>
      {comparisonPickerOpen && <UniversityPickerModal saved={saved} onClose={() => setComparisonPickerOpen(false)} onConfirm={(universityIds) => { addComparison(universityIds); setComparisonPickerOpen(false) }} />}
    </div>
  )
}
