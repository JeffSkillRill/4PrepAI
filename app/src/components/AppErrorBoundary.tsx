import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw, ShieldAlert } from 'lucide-react'
import { isConfigurationError } from '../data/client'

type Props = {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

type State = {
  error: Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (!this.state.error) return this.props.children

    const configurationFailure = isConfigurationError(this.state.error)
    const title = configurationFailure ? 'The app isn’t configured yet' : 'Something went wrong'
    const body = configurationFailure
      ? import.meta.env.DEV
        ? 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to app/.env, restart the development server, and reload this page.'
        : '4Prep can’t connect to its data service. The project owner needs to finish the deployment configuration, then reload this page.'
      : '4Prep couldn’t open this page. Reload to try again; no unsourced information will be shown while the app is unavailable.'

    return (
      <main className="soft-grid grid min-h-screen place-items-center bg-canvas px-4 py-16">
        <section
          className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-line bg-white px-6 py-14 text-center shadow-soft sm:px-12"
          role="alert"
        >
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-forest-50 text-forest-700">
            <ShieldAlert size={54} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h1 className="display mt-7 text-3xl font-extrabold sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted">{body}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white transition hover:bg-forest-700"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Reload page
          </button>
        </section>
      </main>
    )
  }
}
