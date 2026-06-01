import { test as base, Page } from '@playwright/test';

/**
 * `loggedInPage` fixture — a Page that already has the authenticated session
 * loaded via `storageState` (configured in playwright.config.ts).
 *
 * Today this is a thin pass-through, but it's the seam where the suite scales:
 *
 *   - Per-test user provisioning: replace the pass-through with a call to a
 *     factory that hits the member-portal API (myezra-staging.ezra.com) to
 *     create a fresh user, sign them in, and return their page. This unlocks
 *     `fullyParallel: true` because tests no longer share account state.
 *   - Feature-flag overrides: inject cookies / headers per test.
 *   - Response interception: stub Stripe or other third-party endpoints via
 *     `page.route` for deterministic happy-path coverage.
 *
 * Specs do not change when these are added — they keep consuming `loggedInPage`.
 */
type Fixtures = {
  loggedInPage: Page;
};

export const test = base.extend<Fixtures>({
  loggedInPage: async ({ page }, use) => {
    // storageState in playwright.config.ts already populates auth cookies.
    await use(page);
  },
});
