import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

// Deliberately independent of the live/stress QA config: never load qa/.env,
// seeded accounts, service-role credentials, or a production base URL.
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.mjs',
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: [['list']],
  outputDir: '../../qa-full/launch-browser',
  use: {
    baseURL: 'http://127.0.0.1:4178',
    browserName: 'chromium',
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run build -- --outDir ../qa-full/launch-web-dist && npm run preview -- --outDir ../qa-full/launch-web-dist --host 127.0.0.1 --port 4178 --strictPort',
    cwd: fileURLToPath(new URL('../../app', import.meta.url)),
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_SUPABASE_ANON_KEY: 'local-browser-test-placeholder',
    },
  },
})
