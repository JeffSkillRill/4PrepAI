import { expect } from '@playwright/test'

const appOrigin = 'http://127.0.0.1:4178'
const apiOrigin = 'http://127.0.0.1:54321'
export const schoolName = 'Synthetic Save Test University'
export const schoolId = 'synthetic-save-test'
export const students = ['a', 'b'].map((letter, index) => ({
  id: `00000000-0000-4000-8000-00000000000${index + 1}`,
  email: `synthetic-student-${letter}@example.invalid`,
  aud: 'authenticated', role: 'authenticated',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: `Synthetic Student ${letter.toUpperCase()}` },
  created_at: '2026-01-01T00:00:00Z',
}))

function sessionFor(user) {
  const expires = Math.floor(Date.now() / 1000) + 3600
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
  // Unsigned, synthetic test token. Intercepted locally; never sent to Supabase.
  const access_token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: expires })}.synthetic-only`
  return { access_token, refresh_token: `synthetic-refresh-${user.id}`, token_type: 'bearer', expires_in: 3600, expires_at: expires, user }
}

const originalProfile = {
  country: 'United States', field: 'Computer Science', academic_score: 72,
  budget_max: 12000, budget_currency: 'USD', language_test: 'ielts', language_score: 6.5,
  admission_test: 'sat', admission_test_score: 1400, gpa: 3.5,
  needs_language_pathway: false, intake: 'Fall 2027',
}
const university = {
  id: schoolId, name: schoolName, city: 'Synthetic City', state: null,
  country: 'United States', flag: '', tagline: 'Synthetic browser fixture only',
  description: 'Not a real institution.', photo_seed: '', highlights: [], source_id: 'synthetic-source',
  university_facts: [], requirements: [], university_scorecard_programs: [],
  university_scholarships: [], rankings: [], campuses: [],
}

export async function installSignedInFixture(context, { learningTrack = null, learningSubmissions = new Map() } = {}) {
  const sessions = students.map(sessionFor)
  const profiles = new Map(students.map((user, index) => [user.id, { ...originalProfile, budget_max: index ? 8000 : 12000 }]))
  const saved = new Map(students.map((user) => [user.id, new Set()]))
  const requests = []
  const events = []
  const failures = []
  const planned = new Map()
  const gates = []
  const capture = (page) => page.on('pageerror', (error) => failures.push(error.message))
  context.pages().forEach(capture)
  context.on('page', capture)

  const plan = (operation, action) => {
    planned.set(operation, [...(planned.get(operation) ?? []), action])
  }
  const holdNext = (operation, fail = false) => {
    let release
    const promise = new Promise((resolve) => { release = resolve })
    const gate = { promise, release, fail, started: false }
    gates.push(gate)
    plan(operation, gate)
    return gate
  }
  const act = async (operation, owner, body) => {
    const record = { operation, owner, body, done: false }
    requests.push(record)
    const action = planned.get(operation)?.shift()
    if (action?.promise) {
      action.started = true
      await action.promise
    }
    record.done = true
    return action?.fail ?? false
  }
  const deny = (route, message) => {
    failures.push(message)
    return route.fulfill({ status: 400, json: { message } })
  }
  await context.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    if (url.origin === appOrigin) return route.continue()
    if (url.origin !== apiOrigin) return deny(route, `Blocked external request: ${method} ${url.origin}${url.pathname}`)
    if (url.pathname === '/auth/v1/token' && method === 'POST' && url.searchParams.get('grant_type') === 'password') {
      const credentials = request.postDataJSON()
      const session = sessions.find((item) => item.user.email === credentials.email)
      if (!session || credentials.password !== 'synthetic-password-only') return deny(route, 'Unexpected credentials in local fixture')
      return route.fulfill({ json: session })
    }
    const session = sessions.find((item) => request.headers().authorization === `Bearer ${item.access_token}`)
    if (url.pathname === '/auth/v1/user' && method === 'GET' && session) return route.fulfill({ json: session.user })
    if (url.pathname === '/auth/v1/logout' && method === 'POST' && session) return route.fulfill({ status: 204 })
    if (url.pathname === '/functions/v1/client-events' && method === 'POST') {
      const payload = request.postDataJSON()
      if (Object.keys(payload).join() !== 'event' || ![
        'intake_started', 'intake_completed', 'intake_failed', 'profile_saved', 'profile_save_failed',
        'university_saved', 'university_save_failed', 'handoff_shown', 'handoff_opened',
      ].includes(payload.event)) return deny(route, 'Unexpected telemetry payload')
      events.push(payload.event)
      return route.fulfill({ json: { accepted: true } })
    }
    if (method === 'GET' && url.pathname === '/rest/v1/sources') return route.fulfill({ json: [] })
    if (method === 'GET' && url.pathname === '/rest/v1/universities') {
      if (await act('read:universities', session?.user.id ?? null, null)) return route.fulfill({ status: 400, json: { message: 'Synthetic catalogue failure' } })
      return route.fulfill({ json: [university] })
    }
    if (method === 'GET' && url.pathname === '/rest/v1/learning_tracks') return route.fulfill({ json: learningTrack ? [learningTrack] : [] })

    if (method === 'GET' && url.pathname.startsWith('/storage/v1/object/learning-submissions/')) {
      const path = decodeURIComponent(url.pathname.replace('/storage/v1/object/learning-submissions/', ''))
      if (!session || path.split('/')[0] !== session.user.id) return deny(route, 'Private file requested the wrong owner')
      if (await act('download:homework', session.user.id, path)) return route.fulfill({ status: 400, json: { message: 'Synthetic download failure' } })
      return route.fulfill({ contentType: 'application/pdf', body: '%PDF-1.4 synthetic-only' })
    }

    const table = url.pathname.replace('/rest/v1/', '')
    if (!session) return deny(route, `Private fixture request without synthetic session: ${method} ${table}`)
    const owner = session.user.id
    if (method === 'GET' && ['student_profiles', 'saved_plans', 'learning_progress', 'learning_submissions'].includes(table)) {
      if (url.searchParams.get('user_id') !== `eq.${owner}`) return deny(route, 'Private read requested the wrong owner')
      // Capture the old value before a deliberately delayed response.
      const profile = profiles.get(owner)
      const response = table === 'student_profiles' ? (profile ? [{ ...profile }] : [])
        : table === 'saved_plans' ? [...saved.get(owner)].map((id) => ({ university_id: id }))
          : table === 'learning_submissions' ? (learningSubmissions.get(owner) ?? []) : []
      if (await act(`read:${table}`, owner, null)) return route.fulfill({ status: 400, json: { message: 'Synthetic read failure' } })
      return route.fulfill({ json: response })
    }
    if (method === 'POST' && ['student_profiles', 'saved_plans'].includes(table)) {
      const body = request.postDataJSON()
      if (body.user_id !== owner) return deny(route, 'Private write requested the wrong owner')
      if (await act(`write:${table}`, owner, body)) return route.fulfill({ status: 400, json: { message: 'Synthetic save failure' } })
      if (table === 'student_profiles') profiles.set(owner, { ...body })
      else saved.get(owner).add(body.university_id)
      return route.fulfill({ status: 201 })
    }
    if (method === 'DELETE' && table === 'saved_plans') {
      if (url.searchParams.get('user_id') !== `eq.${owner}` || url.searchParams.get('university_id') !== `eq.${schoolId}`) return deny(route, 'Unexpected saved-university removal')
      if (await act('delete:saved_plans', owner, null)) return route.fulfill({ status: 400, json: { message: 'Synthetic removal failure' } })
      saved.get(owner).delete(schoolId)
      return route.fulfill({ status: 204 })
    }
    return deny(route, `Unexpected fixture request: ${method} ${url.pathname}`)
  })

  return {
    profiles, saved, requests, events, failures, holdNext,
    failNext: (operation) => plan(operation, { fail: true }),
    async signIn(page, index = 0) {
      await page.goto('/login')
      await page.getByLabel('Email', { exact: true }).fill(students[index].email)
      await page.getByLabel('Password', { exact: true }).fill('synthetic-password-only')
      await page.getByRole('button', { name: /^Sign in/, exact: false }).click()
      await expect(page).toHaveURL(`${appOrigin}/universities`)
      await page.goto('/login')
      await expect(page.getByRole('heading', { name: 'You’re signed in', exact: true })).toBeVisible()
    },
    async signOut(page) {
      await page.goto('/login')
      await page.getByRole('button', { name: 'Sign out', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Welcome back', exact: true })).toBeVisible()
    },
    releaseAll() { gates.forEach((gate) => gate.release()) },
  }
}

export async function editBudget(page, amount) {
  const row = page.getByRole('listitem').filter({ has: page.getByText('Annual budget', { exact: true }) })
  await row.getByRole('button', { name: 'Change', exact: true }).click()
  await row.getByRole('radio', { name: 'Custom amount', exact: true }).click()
  await row.getByLabel('Annual budget in USD').fill(String(amount))
  await row.getByRole('button', { name: 'Save this answer', exact: true }).click()
}

export async function expectBudget(page, amount) {
  const row = page.getByRole('listitem').filter({ has: page.getByText('Annual budget', { exact: true }) })
  // Presets display US$12,000; custom values display USD 23500.
  await expect.poll(async () => Number((await row.locator('p').nth(1).innerText()).replace(/[^\d.]/g, ''))).toBe(amount)
}
