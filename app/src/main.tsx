import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { DataProvider } from './data/DataProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider><App /></DataProvider>
  </StrictMode>,
)
