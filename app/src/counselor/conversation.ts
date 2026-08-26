import { useCallback, useEffect, useRef, useState } from 'react'

export type CounselorAnswer = {
  answerType: 'verified_fact' | 'general_guidance' | 'refusal' | 'out_of_scope'
  answer: string
  recordCitations: string[]
  webCitations: string[]
  suggestions?: string[]
  requestId: string
}

export type CounselorQuestionTurn = {
  id: string
  type: 'question'
  question: string
  answer: CounselorAnswer | null
  error: string | null
}

export type CounselorComparisonTurn = {
  id: string
  type: 'comparison'
  universityIds: string[]
}

export type CounselorChatTurn = CounselorQuestionTurn | CounselorComparisonTurn

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

function isUniversityIds(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length > 0
    && value.length <= 3
    && value.every((id) => typeof id === 'string' && id.length > 0)
    && new Set(value).size === value.length
}

function readTurns(): CounselorChatTurn[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const turns: CounselorChatTurn[] = []
    for (const value of parsed) {
      if (!value || typeof value !== 'object') continue
      const turn = value as Record<string, unknown>
      if (typeof turn.id !== 'string') continue
      if (turn.type === 'comparison') {
        if (isUniversityIds(turn.universityIds)) turns.push({ id: turn.id, type: 'comparison', universityIds: turn.universityIds })
        continue
      }
      if (
        (turn.type !== undefined && turn.type !== 'question')
        ||
        typeof turn.question !== 'string'
        || (turn.answer !== null && !isAnswer(turn.answer))
        || (turn.error !== null && typeof turn.error !== 'string')
      ) continue
      turns.push({
        id: turn.id,
        type: 'question',
        question: turn.question,
        answer: turn.answer ?? null,
        error: turn.error ?? null,
      })
    }
    return turns.slice(-MAX_TURNS)
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
    const sync = () => {
      const next = readTurns()
      turnsRef.current = next
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

  const addTurn = useCallback((turn: Omit<CounselorQuestionTurn, 'id' | 'type'>) => {
    const next = [...turnsRef.current, { ...turn, id: crypto.randomUUID(), type: 'question' as const }].slice(-MAX_TURNS)
    turnsRef.current = next
    setTurns(next)
    publish(next)
  }, [publish])

  const addComparison = useCallback((universityIds: string[]) => {
    if (!isUniversityIds(universityIds)) return
    const next = [...turnsRef.current, { id: crypto.randomUUID(), type: 'comparison' as const, universityIds: [...universityIds] }].slice(-MAX_TURNS)
    turnsRef.current = next
    setTurns(next)
    publish(next)
  }, [publish])

  const updateComparison = useCallback((turnId: string, universityIds: string[]) => {
    const next = turnsRef.current.flatMap((turn) => {
      if (turn.id !== turnId || turn.type !== 'comparison') return [turn]
      if (universityIds.length === 0) return []
      return isUniversityIds(universityIds) ? [{ ...turn, universityIds: [...universityIds] }] : [turn]
    })
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

  return { turns, addTurn, addComparison, updateComparison, clearTurns }
}
