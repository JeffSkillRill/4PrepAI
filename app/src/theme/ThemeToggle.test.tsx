// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { THEME_STORAGE_KEY } from './theme'
import { ThemeToggle } from './ThemeToggle'

const root = document.documentElement
const trigger = (scope: Pick<typeof screen, 'getByRole'> = screen) =>
  scope.getByRole('button', { name: /^Colour theme:/ })
const choose = (label: string) => {
  fireEvent.click(trigger())
  fireEvent.click(screen.getByRole('menuitemradio', { name: label }))
}

afterEach(() => {
  cleanup()
  root.removeAttribute('data-theme')
  window.localStorage.clear()
})

describe('ThemeToggle', () => {
  it('starts on system when nothing is saved, with the menu closed', () => {
    render(<ThemeToggle />)
    expect(trigger().getAttribute('aria-label')).toBe('Colour theme: System')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('reflects a choice saved in an earlier visit', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    render(<ThemeToggle />)
    expect(trigger().getAttribute('aria-label')).toBe('Colour theme: Dark')
    fireEvent.click(trigger())
    expect(screen.getByRole('menuitemradio', { name: 'Dark' }).getAttribute('aria-checked')).toBe('true')
  })

  it('applies and persists dark, then light, then hands back to the system', () => {
    render(<ThemeToggle />)

    choose('Dark')
    expect(root.getAttribute('data-theme')).toBe('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger())

    choose('Light')
    expect(root.getAttribute('data-theme')).toBe('light')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    choose('System')
    expect(root.hasAttribute('data-theme')).toBe(false)
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
    expect(trigger().getAttribute('aria-label')).toBe('Colour theme: System')
  })

  it('opens on the current choice, moves with the arrow keys, and closes on Escape', () => {
    render(<ThemeToggle />)
    fireEvent.click(trigger())
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'System' }))

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'Light' }))
    fireEvent.keyDown(document.activeElement!, { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'System' }))

    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger())
    expect(root.hasAttribute('data-theme')).toBe(false)
  })

  it('closes when the pointer goes down outside it', () => {
    render(<><ThemeToggle /><p>Elsewhere</p></>)
    fireEvent.click(trigger())
    fireEvent.pointerDown(screen.getByText('Elsewhere'))
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('keeps the header and mobile-menu toggles in step', () => {
    render(<><div data-testid="header"><ThemeToggle /></div><div data-testid="menu"><ThemeToggle /></div></>)
    const header = within(screen.getByTestId('header'))
    const menu = within(screen.getByTestId('menu'))

    fireEvent.click(trigger(menu))
    fireEvent.click(menu.getByRole('menuitemradio', { name: 'Dark' }))
    expect(trigger(header).getAttribute('aria-label')).toBe('Colour theme: Dark')
  })

  it('follows a change made in another tab', () => {
    render(<ThemeToggle />)
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
    fireEvent(window, new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'light' }))
    expect(trigger().getAttribute('aria-label')).toBe('Colour theme: Light')
    expect(root.getAttribute('data-theme')).toBe('light')
  })
})
