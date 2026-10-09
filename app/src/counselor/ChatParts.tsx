// Chat building blocks shared by the full CounselorScreen and the floating
// CounselorWidget, so both render every answer type the same way.
import { ArrowUp, ArrowUpRight, Bot, Globe2, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react'
import { SafeMarkdown, webCitationDetails } from '../components/SafeMarkdown'
import { SourceChip } from '../components/Trust'
import { SCOPE_SUGGESTIONS } from '../../supabase/functions/counselor/scope'
import type { CounselorAnswer } from './conversation'

export const COUNSELOR_NAME = '4Prep counselor'
export const STARTER_SUGGESTIONS = SCOPE_SUGGESTIONS
export const CHAT_OPENER = 'Hi, I’m your 4Prep counselor. Ask me anything about applying to US universities: costs, requirements, deadlines, essays, aid or visas.'
export const MAX_MESSAGE_LENGTH = 1000

export function CounselorAvatar({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'size-7 rounded-lg' : 'size-9 rounded-xl'
  return (
    <span className={`grid ${box} shrink-0 place-items-center bg-band-mid text-white`} aria-hidden="true">
      <Bot size={size === 'sm' ? 15 : 18} />
    </span>
  )
}

export function CounselorBubble({ children, tone = 'default', compact = false }: { children: ReactNode; tone?: 'default' | 'error'; compact?: boolean }) {
  const surface = tone === 'error' ? 'border border-rose-200 bg-rose-50 text-rose-900' : 'border border-line bg-paper text-ink'
  return (
    <div className="flex items-end gap-2">
      <CounselorAvatar size={compact ? 'sm' : 'md'} />
      <div className={`min-w-0 max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-6 shadow-soft ${surface}`}>
        <p className="sr-only">{COUNSELOR_NAME}:</p>
        {children}
      </div>
    </div>
  )
}

export function StudentBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="min-w-0 max-w-[85%] rounded-2xl rounded-br-md bg-action px-4 py-3 text-sm leading-6 text-on-action">
        <p className="sr-only">You:</p>
        <p className="whitespace-pre-wrap break-words">{text}</p>
      </div>
    </div>
  )
}

export function TypingBubble({ compact = false }: { compact?: boolean }) {
  return (
    <CounselorBubble compact={compact}>
      <span role="status" className="flex h-6 items-center gap-1">
        <span className="sr-only">The counselor is typing</span>
        {[0, 1, 2].map((index) => <span key={index} aria-hidden="true" className="counselor-thinking-dot size-2 rounded-full bg-forest-700" />)}
      </span>
    </CounselorBubble>
  )
}

export function SuggestionChips({ suggestions, onSend, disabled = false }: { suggestions: string[]; onSend: (text: string) => void; disabled?: boolean }) {
  if (suggestions.length === 0) return null
  return (
    <ul className="ml-11 flex flex-wrap gap-2" aria-label="Suggested questions">
      {suggestions.map((suggestion) => (
        <li key={suggestion} className="max-w-full">
          <button type="button" disabled={disabled} onClick={() => onSend(suggestion)} className="min-h-9 max-w-full rounded-full border border-forest-200 bg-paper px-3 py-1.5 text-left text-xs font-bold leading-5 text-forest-800 transition hover:border-forest-500 hover:bg-forest-50 disabled:opacity-60">
            {suggestion}
          </button>
        </li>
      ))}
    </ul>
  )
}

/** One renderer for every answer type. */
export function CounselorAnswerMessage({ answer, onSend, compact = false, busy = false }: { answer: CounselorAnswer; onSend: (text: string) => void; compact?: boolean; busy?: boolean }) {
  // Lines source chips up with the bubble text, past the avatar.
  const indent = compact ? 'ml-9' : 'ml-11'
  const showChips = (answer.answerType === 'out_of_scope' || answer.answerType === 'greeting') && (answer.suggestions?.length ?? 0) > 0
  return (
    <div className="space-y-2">
      <CounselorBubble compact={compact}>
        <SafeMarkdown text={answer.answer} />
        {answer.answerType === 'general_guidance' && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-950">
            <Globe2 size={12} aria-hidden="true" /> General info · not verified 4Prep data
          </p>
        )}
      </CounselorBubble>
      {answer.answerType === 'verified_fact' && answer.recordCitations.length > 0 && (
        <div className={`${indent} flex flex-wrap gap-2`} aria-label="Sources">
          {answer.recordCitations.map((id) => <SourceChip key={id} sourceId={id} />)}
        </div>
      )}
      {answer.answerType === 'general_guidance' && answer.webCitations.length > 0 && (
        <ul className={`${indent} flex flex-wrap gap-x-3 text-xs`} aria-label="Web sources">
          {answer.webCitations.map((url, index) => {
            const citation = webCitationDetails(url, index)
            return (
              <li key={`${url}-${index}`}>
                {citation
                  ? <a href={citation.href} target="_blank" rel="noreferrer" aria-label={citation.accessibleName} className="inline-flex min-h-9 items-center gap-1 font-bold text-sky-800 underline">{citation.label} <ArrowUpRight size={12} /></a>
                  : <span className="inline-flex min-h-9 items-center text-muted">Source {index + 1}: unavailable link</span>}
              </li>
            )
          })}
        </ul>
      )}
      {showChips && !compact && <SuggestionChips suggestions={answer.suggestions ?? []} onSend={onSend} disabled={busy} />}
    </div>
  )
}

export function CounselorErrorMessage({ error, onRetry, compact = false, busy = false }: { error: string; onRetry: () => void; compact?: boolean; busy?: boolean }) {
  return (
    <CounselorBubble tone="error" compact={compact}>
      <p role="alert">{error}</p>
      <button type="button" onClick={onRetry} disabled={busy} className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-lg border border-rose-200 bg-paper px-3 text-xs font-bold text-rose-900 hover:bg-rose-100 disabled:opacity-60">
        <RotateCcw size={13} aria-hidden="true" /> Try again
      </button>
    </CounselorBubble>
  )
}

/**
 * Keeps the newest message in view, unless the student has scrolled up to
 * read something earlier.
 */
export function useStickToBottom<T extends HTMLElement>(dependency: unknown): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const pinned = useRef(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const onScroll = () => {
      pinned.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48
    }
    element.addEventListener('scroll', onScroll, { passive: true })
    return () => element.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    const element = ref.current
    if (element && pinned.current) element.scrollTop = element.scrollHeight
  }, [dependency])

  return ref
}

/** Auto-growing message box. Enter sends; Shift+Enter adds a new line. */
export function ChatComposer({
  id,
  label,
  value,
  onChange,
  onSend,
  busy,
  inputRef,
  placeholder = 'Message the counselor',
  compact = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onSend: () => void
  busy: boolean
  inputRef: RefObject<HTMLTextAreaElement | null>
  placeholder?: string
  compact?: boolean
}) {
  const remaining = MAX_MESSAGE_LENGTH - value.length
  const canSend = Boolean(value.trim()) && !busy

  const resize = useCallback(() => {
    const element = inputRef.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, compact ? 120 : 176)}px`
  }, [compact, inputRef])
  useLayoutEffect(resize, [resize, value])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (canSend) onSend()
      }}
    >
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-paper p-2 focus-within:border-forest-500 focus-within:ring-2 focus-within:ring-forest-100">
        <textarea
          ref={inputRef}
          id={id}
          rows={1}
          value={value}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={placeholder}
          aria-describedby={remaining <= 150 ? `${id}-budget` : undefined}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
            event.preventDefault()
            if (canSend) onSend()
          }}
          className="max-h-44 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 outline-none focus-visible:outline-none"
        />
        <button type="submit" disabled={!canSend} aria-label="Send message" className="grid size-10 min-h-0 min-w-0 shrink-0 place-items-center rounded-xl bg-action text-on-action disabled:bg-button-disabled disabled:text-muted">
          <ArrowUp size={18} />
        </button>
      </div>
      {remaining <= 150 && (
        <p id={`${id}-budget`} aria-live="polite" className={`mt-1 text-right text-xs font-bold ${remaining <= 50 ? 'text-rose-800' : 'text-muted'}`}>{remaining} characters left</p>
      )}
    </form>
  )
}
