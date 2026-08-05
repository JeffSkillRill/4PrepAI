import { renderToString } from 'react-dom/server'
import { AdminConsole } from '../src/components/AdminConsole'

const html = renderToString(
  <AdminConsole
    session={{
      admin: { id: 'smoke-admin', email: 'operator@example.invalid' },
      metrics: {
        signedUpTotal: 0,
        signedIn30d: 0,
        acted30d: 0,
        waitingReview: 0,
      },
      definitions: {
        signedUpTotal: 'Smoke definition.',
        signedIn30d: 'Smoke definition.',
        acted30d: 'Smoke definition.',
        waitingReview: 'Smoke definition.',
      },
    }}
    onNotAvailable={() => undefined}
    onSignOut={() => undefined}
  />,
)

if (!html.includes('Admin console') || !html.includes('Support inbox')) {
  throw new Error('Admin SSR smoke output did not contain the expected operator navigation.')
}

console.log(`Admin SSR smoke rendered ${html.length} characters without a live database.`)
