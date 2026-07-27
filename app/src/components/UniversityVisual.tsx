import type { University } from '../types'

const palettes = [
  'from-forest-950 via-forest-800 to-emerald-500',
  'from-slate-950 via-forest-900 to-teal-500',
  'from-forest-900 via-emerald-800 to-amber-400',
]

export function UniversityVisual({
  university,
  className = '',
}: {
  university: University
  className?: string
}) {
  const palette = palettes[university.id.length % palettes.length]
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${palette} ${className}`}
      role="img"
      aria-label={`${university.name}, ${university.city}`}
    >
      <div className="absolute -right-12 -top-16 size-52 rounded-full border-[28px] border-white/10" />
      <div className="absolute -bottom-20 -left-16 size-64 rounded-full bg-white/10 blur-2xl" />
      <span className="absolute right-5 top-4 text-5xl opacity-90" aria-hidden="true">{university.flag}</span>
      <span className="display absolute bottom-3 left-4 text-6xl font-extrabold text-white/10" aria-hidden="true">
        {university.name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}
