import { Database, ShieldAlert } from 'lucide-react'
import { describeSupabaseTarget } from '../data/environment'

export function EnvironmentBanner() {
  if (!import.meta.env.DEV) return null
  const target = describeSupabaseTarget(import.meta.env.VITE_SUPABASE_URL as string | undefined)
  return (
    <div
      className={`fixed bottom-3 left-3 right-3 z-[60] rounded-xl shadow-lg sm:left-auto sm:max-w-lg ${target.production ? 'bg-rose-700 text-white' : 'bg-amber-200 text-amber-950'}`}
      role="status"
    >
      <div className="flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-center text-xs font-extrabold sm:text-sm">
        {target.production ? <ShieldAlert size={16} className="shrink-0" /> : <Database size={15} className="shrink-0" />}
        <span>Development build · Database: {target.label}{target.production ? ' · destructive operations blocked' : ''}</span>
      </div>
    </div>
  )
}
