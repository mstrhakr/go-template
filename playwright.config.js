import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:18080';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 2,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'go run ./cmd/server',
    url: `${baseURL}/healthz`,
    env: { APP_ADDR: '127.0.0.1:18080' },
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: 'js', testMatch: 'js/**/*.spec.js' },
    {
      name: 'chromium',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Pixel 7'] },
    },
  ],
});