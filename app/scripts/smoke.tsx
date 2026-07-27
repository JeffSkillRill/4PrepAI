import { renderToString } from 'react-dom/server'
import App from '../src/App'
import { DataProvider } from '../src/data/DataProvider'
import { AuthProvider } from '../src/auth/AuthProvider'

const html = renderToString(<AuthProvider><DataProvider><App /></DataProvider></AuthProvider>)
if (!html.includes('4Prep') || !html.includes('Loading results')) {
  throw new Error('SSR smoke output did not contain the expected trust UI.')
}
console.log(`SSR smoke rendered ${html.length} characters without a live database.`)
