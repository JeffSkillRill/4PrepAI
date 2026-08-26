// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useCounselorConversation } from './conversation'

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
