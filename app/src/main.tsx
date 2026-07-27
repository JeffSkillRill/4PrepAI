import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { DataProvider } from './data/DataProvider'
import { AuthProvider } from './auth/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider><DataProvider><App /></DataProvider></AuthProvider>
  </StrictMode>,
)
