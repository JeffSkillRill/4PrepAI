import { renderToString } from 'react-dom/server'
import App from '../src/App'
import { DataProvider } from '../src/data/DataProvider'

const html = renderToString(<DataProvider><App /></DataProvider>)
if (!html.includes('SAMPLE DATA') || !html.includes('4Prep')) {
  throw new Error('SSR smoke output did not contain the expected trust UI.')
}
console.log(`SSR smoke rendered ${html.length} characters without a live database.`)
