import { useCallback, useRef, useState } from 'react'
import { historyFromTurns, type CounselorQuestionTurn, useCounselorConversation } from './conversation'
import { requestCounselorAnswer } from './request'

/** Sending, pending and retry state shared by the counselor screen and widget. */
export function useCounselorChat() {
  const conversation = useCounselorConversation()
  const { turns, addTurn, removeTurn } = conversation
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const busy = pending !== null

  const send = useCallback(async (text: string, previousTurns = turns) => {
    const question = text.trim()
    if (!question || busy) return
    setPending(question)
    setDraft('')
    const result = await requestCounselorAnswer(question, historyFromTurns(previousTurns))
    addTurn({ question, answer: result.answer, error: result.error })
    setPending(null)
    inputRef.current?.focus()
  }, [addTurn, busy, turns])

  const retry = useCallback((turn: CounselorQuestionTurn) => {
    removeTurn(turn.id)
    void send(turn.question, turns.filter((item) => item.id !== turn.id))
  }, [removeTurn, send, turns])

  return { ...conversation, draft, setDraft, pending, busy, send, retry, inputRef }
}
