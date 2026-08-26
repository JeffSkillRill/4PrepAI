import { useCallback, useEffect, useRef, useState } from 'react'

export type CounselorAnswer = {
  answerType: 'verified_fact' | 'general_guidance' | 'refusal' | 'out_of_scope'
  answer: string
  recordCitations: string[]
  webCitations: string[]
  suggestions?: string[]
  requestId: string
}

export type CounselorChatTurn = {
  id: string
  question: string
  answer: CounselorAnswer | null
  error: string | null
}

const STORAGE_KEY = '4prep.counselor-conversation.v1'
const MAX_TURNS = 20
const CHANGE_EVENT = '4prep:counselor-conversation-change'

function isAnswer(value: unknown): value is CounselorAnswer {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CounselorAnswer>
  return ['verified_fact', 'general_guidance', 'refusal', 'out_of_scope'].includes(candidate.answerType ?? '')
    && typeof candidate.answer === 'string'
    && Array.isArray(candidate.recordCitations)
    && Array.isArray(candidate.webCitations)
    && typeof candidate.requestId === 'string'
}

function readTurns(): CounselorChatTurn[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((value) => {
      if (!value || typeof value !== 'object') return []
      const turn = value as Partial<CounselorChatTurn>
      if (
        typeof turn.id !== 'string'
        || typeof turn.question !== 'string'
        || (turn.answer !== null && !isAnswer(turn.answer))
        || (turn.error !== null && typeof turn.error !== 'string')
      ) return []
      return [{
        id: turn.id,
        question: turn.question,
        answer: turn.answer ?? null,
        error: turn.error ?? null,
      }]
    }).slice(-MAX_TURNS)
  } catch {
    return []
  }
}

function writeTurns(turns: CounselorChatTurn[]) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns))
  } catch {
    // Conversation history is an enhancement; a blocked storage area must not stop counseling.
  }
}

export function useCounselorConversation() {
  const [turns, setTurns] = useState<CounselorChatTurn[]>(readTurns)
  const turnsRef = useRef(turns)

  useEffect(() => {
    turnsRef.current = turns
  }, [turns])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sync = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : readTurns()
      if (!Array.isArray(detail)) return
      turnsRef.current = detail as CounselorChatTurn[]
      setTurns(turnsRef.current)
    }
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const publish = useCallback((next: CounselorChatTurn[]) => {
    writeTurns(next)
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }))
  }, [])

  const addTurn = useCallback((turn: Omit<CounselorChatTurn, 'id'>) => {
    const next = [...turnsRef.current, { ...turn, id: crypto.randomUUID() }].slice(-MAX_TURNS)
    turnsRef.current = next
    setTurns(next)
    publish(next)
  }, [publish])

  const clearTurns = useCallback(() => {
    turnsRef.current = []
    setTurns([])
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // The in-memory history has still been cleared.
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: [] }))
  }, [])

  return { turns, addTurn, clearTurns }
}
