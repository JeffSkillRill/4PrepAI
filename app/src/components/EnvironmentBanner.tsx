import { Database, ShieldAlert, X } from 'lucide-react'
import { useState } from 'react'
import { describeSupabaseTarget } from '../data/environment'

const dismissalStorageKey = '4prep.environment-banner-dismissed.v1'

function readDismissal() {
  try {
    return typeof window !== 'undefined' && window.sessionStorage.getItem(dismissalStorageKey) === 'true'
  } catch {
    return false
  }
}

export function EnvironmentBanner() {
  const [dismissed, setDismissed] = useState(readDismissal)
  if (!import.meta.env.DEV) return null
  const target = describeSupabaseTarget(import.meta.env.VITE_SUPABASE_URL as string | undefined)
  if (dismissed) return null
  const dismiss = () => {
    setDismissed(true)
    try {
      window.sessionStorage.setItem(dismissalStorageKey, 'true')
    } catch {
      // The pill can still be dismissed when storage is unavailable.
    }
  }
  return (
    <div
      className={`fixed top-3 left-3 z-[60] flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full py-1.5 pr-1.5 pl-3 shadow-lg ${target.production ? 'bg-rose-700 text-white' : 'bg-amber-200 text-amber-950'}`}
      role="status"
    >
      {target.production ? <ShieldAlert size={16} className="shrink-0" /> : <Database size={15} className="shrink-0" />}
      <span className="min-w-0 text-xs font-extrabold">DEV · {target.label}</span>
      <button type="button" onClick={dismiss} className="grid size-7 shrink-0 place-items-center rounded-full hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-current" aria-label="Dismiss development environment banner"><X size={14} /></button>
    </div>
  )
}
