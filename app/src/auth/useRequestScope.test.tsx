// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, expect, it } from 'vitest'
import { useRequestScope } from './useRequestScope'

afterEach(cleanup)

it('invalidates both pending requests and queued callbacks after unmount', () => {
  const { result, unmount } = renderHook(useRequestScope)
  const capture = result.current
  const isCurrent = capture()
  expect(isCurrent()).toBe(true)
  unmount()
  expect(isCurrent()).toBe(false)
  expect(capture()()).toBe(false)
})

it('keeps the scope through ordinary rerenders and works in StrictMode', () => {
  const { result, rerender, unmount } = renderHook(useRequestScope, { wrapper: StrictMode })
  const isCurrent = result.current()
  act(rerender)
  expect(isCurrent()).toBe(true)
  unmount()
  expect(isCurrent()).toBe(false)
})
