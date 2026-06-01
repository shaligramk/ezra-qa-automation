# Ezra QA Take-Home — Shawn Shaligram

Full submission for the Ezra Senior QA Engineer take-home.

## Question 1 + Question 2
- [Q1 — Booking flow test cases](./Q1-test-cases.md)
- [Q2 — Privacy & security](./Q2-privacy.md)

## Question 3 / Part 3: Automation with Playwright

TypeScript + Playwright suite for the Ezra booking flow, organized as a Page Object Model.

### Setup

Requires Node 18+.

```bash
npm ci
npx playwright install chromium
cp .env.example .env   # then fill in BASE_URL, USER_EMAIL, USER_PWD
```

### Run

```bash
npm test              # run everything
npm run test:headed   # watch the browser
npm run test:ui       # Playwright UI mode
npm run report        # open last HTML report
```

### What's tested

- **`01-cancel-existing-appointment`** — cleanup step. Cancels any active appointment from a prior run; skips if none.
- **`02-booking-happy-path`** (P0) — eligible member books and pays through the full funnel with a Stripe test card.

Cleanup runs first so each `npm test` leaves the account in the same state it started in.

### Architecture

```
├── playwright.config.ts     # config, storageState, globalSetup
├── global-setup.ts          # logs in once → storage/auth.json
├── tests/                   # specs only, no selectors
├── pages/                   # Page Object Model (Dashboard, SignIn, Booking, Checkout, ...)
├── fixtures/                # auth fixture + test data
└── utils/env.ts             # fail-fast env validation
```

Key decisions:

- **POM** — tests consume page methods, never raw selectors. All `expect()`s live on page methods.
- **Role-based locators** (`getByRole` / `getByLabel`) over CSS/XPath.
- **No `waitForTimeout`** — every wait anchors to a DOM state or network response.
- **Stripe iframe isolation** — all `frameLocator` logic lives in `CheckoutPage`.
- **Auth via `storageState`** — log in once, every test starts authenticated.
- **No hardcoded staging data** — picks the first available center/date/time at runtime.
- **Fail-fast env** — missing `BASE_URL`/creds errors immediately with a pointer to `.env.example`.

### Tradeoffs

- Drives the real Stripe iframe with a test card. Stubbing via `page.route` would be more deterministic — next step.
- Runs serially (`workers: 1`) because both tests share one staging account. Per-test user provisioning would unlock parallelism.
- Staging shows different intermediate pages depending on account history; POMs detect and advance past these where possible.

### Next steps

- API smoke tests below the UI suite for faster signal.
- GitHub Actions CI with sharded runs and trace artifacts.
- Cross-browser projects (Safari, Firefox).
- Per-test user provisioning + test data factories.

### Evidence

<img width="1154" height="312" alt="Test run screenshot" src="https://github.com/user-attachments/assets/381aad1d-1525-4e1a-8e87-df4936d4c8be" />

[Recording](https://github.com/user-attachments/assets/c3825637-543e-48d2-9ba9-27b648ea5ae2)
