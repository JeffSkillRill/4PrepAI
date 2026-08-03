// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SafeMarkdown, webCitationDetails } from './SafeMarkdown'

afterEach(cleanup)

describe('SafeMarkdown', () => {
  it('renders the supported markdown subset as React elements', () => {
    const { container } = render(
      <SafeMarkdown text={'A **clear plan** helps.\n\n- Draft once\n- Revise twice'} />,
    )

    expect(screen.getByText('clear plan').tagName).toBe('STRONG')
    expect(container.querySelectorAll('ul')).toHaveLength(1)
    expect(container.querySelectorAll('li')).toHaveLength(2)
    expect(container.textContent).not.toContain('**')
  })

  it('renders raw HTML and unsupported markdown as text', () => {
    const { container } = render(
      <SafeMarkdown text={'<img src=x onerror=alert(1)>\n\n[not a link](javascript:alert(1))'} />,
    )

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
    expect(container.textContent).toContain('[not a link](javascript:alert(1))')
  })
})

describe('web citation labels', () => {
  it('uses a numbered domain label and only accepts HTTP(S)', () => {
    expect(webCitationDetails('https://www.commonapp.org/apply/essay-prompts', 1)).toEqual({
      href: 'https://www.commonapp.org/apply/essay-prompts',
      label: 'Source 2: commonapp.org',
      accessibleName: 'Source 2: commonapp.org (opens in a new tab)',
    })
    expect(webCitationDetails('javascript:alert(1)', 0)).toBeNull()
  })
})
