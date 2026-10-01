import { renderToString } from 'react-dom/server'
import { AdminConsole } from '../src/components/AdminConsole'

const html = renderToString(
  <AdminConsole
    session={{
      admin: { id: 'smoke-admin', email: 'operator@example.invalid' },
    }}
    onNotAvailable={() => undefined}
    onSignOut={() => undefined}
  />,
)

if (!html.includes('Admin console') || !html.includes('Students')) {
  throw new Error('Admin SSR smoke output did not contain the expected students roster.')
}

console.log(`Admin SSR smoke rendered ${html.length} characters without a live database.`)
