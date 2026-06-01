import { defineConfig, devices } from '@playwright/test';
import { env } from './utils/env';

/**
 * Playwright config.
 *
 * Notes:
 *  - We use `globalSetup` to log in once and persist the session via
 *    `storageState`. This removes login flake from individual tests and
 *    keeps the suite fast.
 *  - `trace: 'retain-on-failure'` makes failures debuggable without bloating
 *    artifacts on green runs.
 *  - `fullyParallel: false` for now because we share one staging user account.
 *    Once per-test user provisioning lands (see auth.fixture.ts seam), flip to
 *    `fullyParallel: true` and bump `workers`. CI sharding via
 *    `playwright test --shard=1/N` scales horizontally without code changes.
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./global-setup'),
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: env.baseUrl,
    storageState: 'storage/auth.json',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Record video for every test. Switch to 'retain-on-failure' to save space
    // once the suite is stable.
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 },
    },
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Cross-browser coverage scales by adding entries here — no spec changes
    // required since POs use device-agnostic locators. Examples:
    //   { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
    //   { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    //   { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
