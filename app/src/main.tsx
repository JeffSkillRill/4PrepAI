import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { DataProvider } from './data/DataProvider'
import { AuthProvider } from './auth/AuthProvider'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { initializeOperationalTelemetry, track } from './data/analytics'

if (import.meta.env.PROD) initializeOperationalTelemetry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary onError={() => track('app_crash')}>
      <AuthProvider><DataProvider><App /></DataProvider></AuthProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
