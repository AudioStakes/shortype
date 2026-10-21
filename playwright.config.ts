import { defineConfig, devices } from '@playwright/test'

const externalURL = process.env['PLAYWRIGHT_BASE_URL']
const baseURL = externalURL || 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports/playwright' }],
  ],
  outputDir: 'test-results',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(externalURL
    ? {}
    : {
        webServer: {
          command:
            'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
          url: baseURL,
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }),
})
