/**
 * Global setup runs once before the suite. We log in and persist the
 * authenticated session to `storage/auth.json` so each test starts logged in
 * without re-running the sign-in flow.
 */
import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { SignInPage } from './pages/SignInPage';
import { env } from './utils/env';

async function globalSetup(_config: FullConfig): Promise<void> {
  const storageDir = path.resolve(__dirname, 'storage');
  const storagePath = path.join(storageDir, 'auth.json');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // Set `headless: false, slowMo: 250` to debug the sign-in flow visually.
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const signIn = new SignInPage(page, env.baseUrl);
    await signIn.goto();
    await signIn.signIn(env.userEmail, env.userPwd);
    await signIn.waitForSignedIn();

    await context.storageState({ path: storagePath });
    // eslint-disable-next-line no-console
    console.log(`[global-setup] Auth state saved to ${storagePath}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
