// L — Weak network + weak device. Chromium CDP throttling, measured end to end.
// Profiles (stated explicitly, DevTools-style):
//   slow4g: 150 ms RTT, 1.6 Mbps down, 750 kbps up
//   fast3g: 562 ms RTT, 1.44 Mbps down, 675 kbps up
import { expect, test } from '@playwright/test'
import { login, note, takeUser, users } from './helpers.mjs'
import { writeResult } from '../lib/target.mjs'

const profiles = {
  slow4g: { latency: 150, downloadThroughput: (1.6e6) / 8, uploadThroughput: (750e3) / 8 },
  fast3g: { latency: 562, downloadThroughput: (1.44e6) / 8, uploadThroughput: (675e3) / 8 },
}
const measurements = []

async function throttle(page, profile) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, ...profile })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  return cdp
}

async function instrument(page) {
  await page.addInitScript(() => {
    window.__longTasks = []
    new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__longTasks.push(Math.round(e.duration)) })
      .observe({ type: 'longtask', buffered: true })
  })
}

async function collect(page) {
  return page.evaluate(() => ({
    longTasksOver1s: window.__longTasks.filter((d) => d > 1000).length,
    longestTaskMs: Math.max(0, ...window.__longTasks),
    jsHeapMb: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
    transferredKb: Math.round(performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
  }))
}

for (const [label, profile] of Object.entries(profiles)) {
  test(`L ${label} + CPU 4×: anonymous time to first university card`, async ({ page }, info) => {
    await instrument(page)
    await throttle(page, profile)
    const started = Date.now()
    await page.goto('/universities', { timeout: 120_000 })
    await page.getByRole('button', { name: /^Save / }).first().waitFor({ timeout: 120_000 })
    const firstCardMs = Date.now() - started
    const m = { profile: label, flow: 'anon_first_card', firstCardMs, ...(await collect(page)) }
    measurements.push(m); note(info, 'observed', m)
    expect(firstCardMs).toBeLessThan(6000)
    expect(m.longTasksOver1s).toBe(0)
  })
}

test('L slow4g + CPU 4×: signed-in dashboard with Φ ranking rendered', async ({ page }, info) => {
  test.skip(!users.length, 'needs seeded users')
  const user = takeUser()
  await login(page, user) // log in unthrottled so the measurement is the dashboard itself
  await instrument(page)
  await throttle(page, profiles.slow4g)
  const started = Date.now()
  await page.goto('/dashboard', { timeout: 120_000 })
  await page.getByText(/fit/i).first().waitFor({ timeout: 120_000 })
  const dashboardMs = Date.now() - started
  const m = { profile: 'slow4g', flow: 'dashboard_ranked', dashboardMs, ...(await collect(page)) }
  measurements.push(m); note(info, 'observed', m)
  expect(dashboardMs).toBeLessThan(10_000)
})

test.afterAll(() => writeResult('L_weak_device', { at: new Date().toISOString(), measurements }))
