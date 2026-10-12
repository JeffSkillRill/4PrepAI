import { expect, test as base } from '@playwright/test'

const appOrigin = 'http://127.0.0.1:4178'
const mockApiOrigin = 'http://127.0.0.1:54321'

// Synthetic fixture only. No university facts, student records, or published
// lessons are invented; it exercises the draft-only course gate.
const draftTrack = {
  id: 'synthetic-track', slug: 'application-year', title: 'Synthetic draft track',
  description: '', sort_order: 1,
  learning_modules: [{
    id: 'synthetic-module', track_id: 'synthetic-track', module_number: 1,
    slug: 'synthetic-module', title: 'Synthetic module', summary: '', sort_order: 1,
    learning_lessons: [{
      id: 'synthetic-lesson', module_id: 'synthetic-module', slug: 'synthetic-lesson',
      title: 'Synthetic draft lesson', sort_order: 1, duration_minutes: null,
      body: null, status: 'draft', transcript: null, media_url: null, audio_url: null,
    }],
    learning_assignments: [{
      id: 'synthetic-assignment', module_id: 'synthetic-module', slug: 'assignment',
      title: 'Synthetic assignment', brief: '', submission_type: 'artifact',
      template_ref: '', rubric: null,
    }],
  }],
}

const test = base.extend({
  page: async ({ page, context }, use) => {
    const failures = []
    const captureErrors = (surface) => {
      surface.on('pageerror', (error) => failures.push(error.message))
      surface.on('console', (message) => {
        if (message.type() === 'error') failures.push(message.text())
      })
    }
    captureErrors(page)
    context.on('page', captureErrors)
    await context.route('**/*', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      if (url.origin === appOrigin) return route.continue()
      if (url.origin === mockApiOrigin && request.method() === 'GET') {
        if (['/rest/v1/sources', '/rest/v1/universities'].includes(url.pathname)) {
          return route.fulfill({ json: [] })
        }
        if (url.pathname === '/rest/v1/learning_tracks') {
          return route.fulfill({ json: [draftTrack] })
        }
      }
      if (url.origin === mockApiOrigin && url.pathname === '/functions/v1/client-events' && request.method() === 'POST') {
        const payload = request.postDataJSON()
        expect(Object.keys(payload)).toEqual(['event'])
        expect(['intake_started', 'intake_completed', 'intake_failed']).toContain(payload.event)
        return route.fulfill({ json: { accepted: true } })
      }
      // Fail closed: unexpected auth/writes/egress never reach any backend.
      failures.push(`Unexpected request: ${request.method()} ${url.origin}${url.pathname}`)
      return route.fulfill({ status: 400, json: { message: 'Blocked by isolated launch QA' } })
    })
    await use(page)
    expect(failures, 'browser errors or unexpected backend/network activity').toEqual([])
  },
})

async function ready(page) {
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(/^Loading/)
}

async function noOverflow(page) {
  const sizes = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }))
  expect(sizes.content, 'page must not scroll horizontally').toBeLessThanOrEqual(sizes.viewport + 1)
}

for (const path of [
  '/universities', '/login', '/reset-password', '/privacy', '/intake',
  '/support', '/tools', '/saved', '/learn', '/does-not-exist',
]) {
  test(`signed-out deep link and refresh: ${path}`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response.status()).toBe(200)
    await ready(page)
    await noOverflow(page)
    await page.reload()
    await ready(page)
    await noOverflow(page)
  })
}

test('draft course stays unavailable even on a direct lesson/assignment link', async ({ page }) => {
  for (const path of ['/learn', '/learn/synthetic-module/synthetic-lesson', '/learn/synthetic-module/assignment']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'The admission course is coming soon' })).toBeVisible()
    await expect(page.getByRole('button', { name: /start lesson|mark.*complete|submit homework/i })).toHaveCount(0)
    await expect(page.locator('input[type="file"]')).toHaveCount(0)
  }
})

test('custom budget validation and back navigation preserve a non-preset amount', async ({ page }) => {
  await page.goto('/intake')
  for (const option of ['United States', 'Computer Science', 'Generally on track']) {
    await page.getByRole('radio', { name: option, exact: true }).click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
  }
  await page.getByRole('radio', { name: 'Custom amount', exact: true }).click()
  const budget = page.getByLabel('Annual budget in USD')
  const next = page.getByRole('button', { name: 'Continue', exact: true })
  await expect(next).toBeDisabled()
  await budget.fill('0')
  await expect(next).toBeDisabled()
  await budget.fill('-10')
  await expect(next).toBeDisabled()
  await budget.fill('23500')
  await expect(next).toBeEnabled()
  await next.click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('English test')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(budget).toHaveValue('23500')
  await expect(page.getByRole('radio', { name: 'Custom amount', exact: true })).toHaveAttribute('aria-checked', 'true')
  await noOverflow(page)
})

test('keyboard skip link moves focus into the main landmark', async ({ page }) => {
  await page.goto('/login')
  await ready(page)
  const skip = page.getByRole('link', { name: 'Skip to main content' })
  await skip.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
})

test('navigation links retain real URLs and mobile menu controls are usable', async ({ page }) => {
  await page.goto('/login')
  await ready(page)
  const menu = page.getByRole('button', { name: 'Toggle menu' })
  if (await menu.isVisible()) {
    const box = await menu.boundingBox()
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    await menu.focus()
    await page.keyboard.press('Enter')
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    const admission = page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Admission' })
    await expect(admission).toHaveAttribute('href', '/learn')
    await admission.click()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
  } else {
    const admission = page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Admission' })
    await expect(admission).toHaveAttribute('href', '/learn')
    await admission.click()
  }
  await expect(page).toHaveURL(/\/learn$/)
  await expect(page.getByRole('heading', { name: 'The admission course is coming soon' })).toBeVisible()
  await noOverflow(page)
})

test('reduced motion disables intake progress transitions', async ({ page }) => {
  await page.goto('/intake')
  await ready(page)
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  const duration = await page.locator('.motion-progress').evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(duration.split(',').every((value) => parseFloat(value) <= 0.001)).toBe(true)
})

test('deep links retain a real URL when opened in a new tab', async ({ page }) => {
  await page.goto('/login')
  await ready(page)
  const privacy = page.getByRole('link', { name: 'Privacy', exact: true })
  await expect(privacy).toHaveAttribute('href', '/privacy')
  // A real target exercises the browser's native new-tab path deterministically.
  // AppLink's unit tests separately assert that modified clicks are not intercepted.
  await privacy.evaluate((link) => { link.target = '_blank' })
  const [newTab] = await Promise.all([
    page.waitForEvent('popup'),
    privacy.click(),
  ])
  await newTab.waitForLoadState()
  await expect(newTab).toHaveURL(`${appOrigin}/privacy`)
  await expect(newTab.getByRole('heading', { level: 1 })).toHaveText('4Prep Privacy Policy')
  await expect(page).toHaveURL(`${appOrigin}/login`)
  await newTab.close()
})
