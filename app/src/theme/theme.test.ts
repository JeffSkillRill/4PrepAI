// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import {
  applyThemePreference,
  readThemePreference,
  THEME_STORAGE_KEY,
  writeThemePreference,
} from './theme'
import html from '../../index.html?raw'

// Vitest blanks CSS imports (even ?raw), and the app tsconfig has no Node
// types, so the stylesheet is read through a narrowly typed fs import.
// Vitest runs from the package root (app/).
const fs: { readFileSync(path: string, encoding: 'utf8'): string } = await import(`node:${'fs'}`)
const css = fs.readFileSync('src/index.css', 'utf8')

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
    values,
  }
}

const throwingStorage = {
  getItem: () => { throw new Error('blocked') },
  setItem: () => { throw new Error('blocked') },
  removeItem: () => { throw new Error('blocked') },
}

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  window.localStorage.clear()
})

describe('theme preference storage', () => {
  it('reads an explicit choice and treats anything else as system', () => {
    expect(readThemePreference(memoryStorage({ [THEME_STORAGE_KEY]: 'dark' }))).toBe('dark')
    expect(readThemePreference(memoryStorage({ [THEME_STORAGE_KEY]: 'light' }))).toBe('light')
    expect(readThemePreference(memoryStorage({ [THEME_STORAGE_KEY]: 'sepia' }))).toBe('system')
    expect(readThemePreference(memoryStorage())).toBe('system')
    expect(readThemePreference(null)).toBe('system')
  })

  it('stores light and dark, and stores nothing for system', () => {
    const storage = memoryStorage()
    writeThemePreference(storage, 'dark')
    expect(storage.values.get(THEME_STORAGE_KEY)).toBe('dark')
    writeThemePreference(storage, 'system')
    expect(storage.values.has(THEME_STORAGE_KEY)).toBe(false)
  })

  it('never throws when storage is blocked', () => {
    expect(readThemePreference(throwingStorage)).toBe('system')
    expect(() => writeThemePreference(throwingStorage, 'dark')).not.toThrow()
  })

  it('sets data-theme for an explicit choice and removes it for system', () => {
    const root = document.documentElement
    applyThemePreference('dark', root)
    expect(root.getAttribute('data-theme')).toBe('dark')
    applyThemePreference('system', root)
    expect(root.hasAttribute('data-theme')).toBe(false)
  })
})

describe('pre-paint script in index.html', () => {
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? ''

  it('runs in <head>, before the app bundle, with the shared storage key', () => {
    expect(html.indexOf(script)).toBeLessThan(html.indexOf('</head>'))
    expect(script).toContain(`'${THEME_STORAGE_KEY}'`)
  })

  it('applies a saved choice and leaves system to the stylesheet', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    new Function(script)()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    document.documentElement.removeAttribute('data-theme')
    window.localStorage.setItem(THEME_STORAGE_KEY, '<img>')
    new Function(script)()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})

describe('theme scopes in index.css', () => {
  /** The body of `selector { ... }`, up to the brace at the selector's own indentation. */
  const block = (selector: string) => {
    const open = css.indexOf(`${selector} {`)
    expect(open, selector).toBeGreaterThan(-1)
    const indent = css.slice(css.lastIndexOf('\n', open) + 1, open)
    const body = css.slice(open + selector.length + 2)
    return body.slice(0, body.indexOf(`\n${indent}}`))
  }
  const declarations = (text: string) => text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('--') || line.startsWith('color-scheme'))
  const names = (text: string) => new Set(declarations(text).map((line) => line.split(':')[0]))

  it('keeps the OS-dark block and the explicit dark block identical', () => {
    const media = block(':root:not([data-theme="light"])')
    const explicit = block(':root[data-theme="dark"]')
    expect(media.split('\n').map((line: string) => line.replace(/^ {2}/, '')).join('\n')).toBe(explicit)
  })

  it('gives every themed token a dark value', () => {
    const light = names(block(':root,\n:root[data-theme="light"]'))
    const dark = names(block(':root[data-theme="dark"]'))
    for (const name of light) expect(dark.has(name), `${name} has no dark value`).toBe(true)
  })
})
