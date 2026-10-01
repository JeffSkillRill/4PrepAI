import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { setThemePreference, useThemePreference, type ThemePreference } from './theme'

const options: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

/** `className` must carry the display utility (default `flex`), so callers can hide it responsively. */
export function ThemeToggle({ className = 'flex' }: { className?: string }) {
  const preference = useThemePreference()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const current = options.find((option) => option.value === preference) ?? options[2]

  useEffect(() => {
    if (!open) return
    // Open on the current choice, as a native select would.
    itemRefs.current[options.findIndex((option) => option.value === preference)]?.focus()
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    return () => document.removeEventListener('pointerdown', closeOnOutside)
    // Focus only when the menu opens, not on every preference change while open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const close = (restoreFocus: boolean) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  const choose = (value: ThemePreference) => {
    const rect = triggerRef.current?.getBoundingClientRect()
    close(true)
    if (value === preference) return
    setThemePreference(value, rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined)
  }

  const moveFocus = (event: React.KeyboardEvent, index: number) => {
    const last = options.length - 1
    const next = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key]
    if (next !== undefined) {
      event.preventDefault()
      itemRefs.current[next]?.focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Colour theme: ${current.label}`}
        title="Colour theme"
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-forest-800 transition hover:bg-canvas ${open ? 'border-forest-200 bg-canvas' : 'border-line'}`}
      >
        <current.Icon key={current.value} size={17} aria-hidden="true" className="theme-icon-swap" />
        <ChevronDown size={14} aria-hidden="true" className={`text-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Colour theme"
          className="theme-menu absolute right-0 top-[calc(100%+.5rem)] z-50 grid w-44 gap-0.5 rounded-xl border border-line bg-elevated p-1.5 shadow-raised"
        >
          {options.map(({ value, label, Icon }, index) => {
            const active = value === preference
            return (
              <button
                key={value}
                ref={(node) => { itemRefs.current[index] = node }}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                tabIndex={-1}
                onClick={() => choose(value)}
                onKeyDown={(event) => moveFocus(event, index)}
                className={`flex items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition hover:bg-canvas focus-visible:bg-canvas ${active ? 'text-forest-800' : 'text-muted hover:text-ink'}`}
              >
                <Icon size={17} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {active && <Check size={16} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
