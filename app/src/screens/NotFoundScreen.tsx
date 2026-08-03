import { ArrowLeft, FileQuestion } from 'lucide-react'
import { AppLink } from '../components/AppLink'
import { viewPaths } from '../routes'

export function NotFoundScreen({ onReturn }: { onReturn: () => void }) {
  return (
    <div className="page-container py-12 sm:py-20">
      <section className="soft-grid mx-auto max-w-2xl rounded-[24px] border border-line bg-white px-6 py-12 text-center shadow-soft sm:px-10">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-forest-50 text-forest-700">
          <FileQuestion size={40} strokeWidth={1.5} />
        </div>
        <h1 className="display mt-6 text-3xl font-extrabold">That page was not found</h1>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-muted">
          The address may be incomplete or out of date. Your saved work has not been changed.
        </p>
        <AppLink
          href={viewPaths.search as string}
          onNavigate={onReturn}
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white"
        >
          <ArrowLeft size={18} /> Return to universities
        </AppLink>
      </section>
    </div>
  )
}
