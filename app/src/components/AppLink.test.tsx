// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppLink } from './AppLink'

afterEach(cleanup)

describe('AppLink', () => {
  it('exposes a real href and intercepts an ordinary left click', () => {
    const navigate = vi.fn()
    render(<AppLink href="/universities/harvard" onNavigate={navigate}>Harvard</AppLink>)

    const link = screen.getByRole('link', { name: 'Harvard' })
    expect(link.getAttribute('href')).toBe('/universities/harvard')
    expect(fireEvent.click(link, { button: 0 })).toBe(false)
    expect(navigate).toHaveBeenCalledOnce()
  })

  it.each([
    { label: 'Command-click', event: { button: 0, metaKey: true } },
    { label: 'Control-click', event: { button: 0, ctrlKey: true } },
    { label: 'Shift-click', event: { button: 0, shiftKey: true } },
    { label: 'Alt-click', event: { button: 0, altKey: true } },
    { label: 'middle-click', event: { button: 1 } },
  ])('leaves $label to the browser', ({ event }) => {
    const navigate = vi.fn()
    render(<AppLink href="/counselor" onNavigate={navigate}>Counselor</AppLink>)

    document.addEventListener('click', (nativeEvent) => nativeEvent.preventDefault(), { once: true })
    fireEvent.click(screen.getByRole('link', { name: 'Counselor' }), event)
    expect(navigate).not.toHaveBeenCalled()
  })
})
