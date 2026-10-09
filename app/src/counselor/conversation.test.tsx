// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { historyFromTurns, useCounselorConversation, type CounselorChatTurn } from './conversation'

afterEach(() => window.sessionStorage.clear())

describe('counselor comparison turns', () => {
  it('persists only selected university IDs and restores the comparison after a remount', () => {
    const first = renderHook(() => useCounselorConversation())
    act(() => first.result.current.addComparison(['alpha', 'beta']))

    const stored = JSON.parse(window.sessionStorage.getItem('4prep.counselor-conversation.v1') ?? '[]')
    expect(stored).toEqual([expect.objectContaining({ type: 'comparison', universityIds: ['alpha', 'beta'] })])
    expect(JSON.stringify(stored)).not.toContain('tuition')
    first.unmount()

    const restored = renderHook(() => useCounselorConversation())
    expect(restored.result.current.turns).toEqual([expect.objectContaining({ type: 'comparison', universityIds: ['alpha', 'beta'] })])
  })

  it('drops malformed comparison turns from session storage', () => {
    window.sessionStorage.setItem('4prep.counselor-conversation.v1', JSON.stringify([
      { id: 'bad', type: 'comparison', universityIds: ['alpha', 'alpha'] },
    ]))

    const { result } = renderHook(() => useCounselorConversation())
    expect(result.current.turns).toEqual([])
  })
})

describe('historyFromTurns', () => {
  const answer = (text: string) => ({ answerType: 'verified_fact' as const, answer: text, recordCitations: [], webCitations: [], requestId: text })

  it('sends the last six answered questions and skips comparisons and errors', () => {
    const turns: CounselorChatTurn[] = [
      ...Array.from({ length: 7 }, (_, index) => ({ id: `q${index}`, type: 'question' as const, question: `Q${index}`, answer: answer(`A${index}`), error: null })),
      { id: 'c', type: 'comparison', universityIds: ['alpha'] },
      { id: 'e', type: 'question', question: 'Broken', answer: null, error: 'Failed' },
    ]
    const history = historyFromTurns(turns)
    expect(history).toHaveLength(12)
    expect(history[0]).toEqual({ role: 'user', content: 'Q1' })
    expect(history.at(-1)).toEqual({ role: 'assistant', content: 'A6' })
    expect(JSON.stringify(history)).not.toContain('Broken')
  })

  it('restores a stored greeting turn', () => {
    window.sessionStorage.setItem('4prep.counselor-conversation.v1', JSON.stringify([
      { id: 'g', type: 'question', question: 'hi', answer: { ...answer('Hello!'), answerType: 'greeting' }, error: null },
    ]))
    const { result } = renderHook(() => useCounselorConversation())
    expect(result.current.turns).toHaveLength(1)
  })
})
