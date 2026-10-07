import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

// Workers inherit this process's env, so load qa/.env once here.
try { process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))) } catch { /* rely on the shell env */ }

// One worker: UI logins share Supabase Auth's 30 sign-ins / 5 min / IP budget.
export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.mjs/,
  workers: 1,
  timeout: 6 * 60_000,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: '../results/e2e.json' }]],
  use: {
    baseURL: process.env.QA_APP_URL || 'https://4-prep-ai2.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 390, height: 844 },
  },
  outputDir: '../results/e2e-artifacts',
})
