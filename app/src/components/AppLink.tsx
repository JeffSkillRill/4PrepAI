import type { AnchorHTMLAttributes, MouseEvent } from 'react'

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  onNavigate: () => void
}

function shouldUseClientNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return !event.defaultPrevented
    && event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey
    && event.currentTarget.target !== '_blank'
    && !event.currentTarget.hasAttribute('download')
}

export function AppLink({ href, onNavigate, onClick, ...props }: AppLinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (!shouldUseClientNavigation(event)) return
        event.preventDefault()
        onNavigate()
      }}
    />
  )
}
