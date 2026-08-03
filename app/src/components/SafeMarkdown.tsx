import type { ReactNode } from 'react'

function inlineBold(text: string, keyPrefix: string): ReactNode[] {
  const output: ReactNode[] = []
  const pattern = /\*\*([^*\n]+)\*\*/g
  let cursor = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) output.push(text.slice(cursor, match.index))
    output.push(<strong key={`${keyPrefix}-${match.index}`}>{match[1]}</strong>)
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) output.push(text.slice(cursor))
  return output
}

export function SafeMarkdown({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    if (!lines[index].trim()) {
      index += 1
      continue
    }
    if (/^\s*[-*]\s+/.test(lines[index])) {
      const items: string[] = []
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ''))
        index += 1
      }
      const blockIndex = blocks.length
      blocks.push(
        <ul key={`list-${blockIndex}`} className="list-disc space-y-1 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`${blockIndex}-${itemIndex}`}>{inlineBold(item, `list-${blockIndex}-${itemIndex}`)}</li>
          ))}
        </ul>,
      )
      continue
    }

    const paragraph: string[] = []
    while (
      index < lines.length
      && lines[index].trim()
      && !/^\s*[-*]\s+/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    const blockIndex = blocks.length
    blocks.push(
      <p key={`paragraph-${blockIndex}`}>{inlineBold(paragraph.join(' '), `paragraph-${blockIndex}`)}</p>,
    )
  }

  return <div className={`space-y-3 ${className}`.trim()}>{blocks}</div>
}

export function webCitationDetails(url: string, index: number) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    const domain = parsed.hostname.replace(/^www\./i, '')
    if (!domain) return null
    const label = `Source ${index + 1}: ${domain}`
    return {
      href: parsed.href,
      label,
      accessibleName: `${label} (opens in a new tab)`,
    }
  } catch {
    return null
  }
}
