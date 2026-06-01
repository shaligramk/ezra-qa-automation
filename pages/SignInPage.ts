import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { DashboardPage } from './DashboardPage';

/** Member-portal sign-in at `/sign-in`. */
export class SignInPage extends BasePage {
  constructor(
    page: Page,
    private readonly baseUrl: string,
  ) {
    super(page);
  }

  private get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  private get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  private get cookieAcceptButton(): Locator {
    return this.page.getByRole('button', { name: /accept/i });
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/sign-in`);
    await this.dismissCookieBanner();
  }

  private async dismissCookieBanner(): Promise<void> {
    if (await this.cookieAcceptButton.isVisible().catch(() => false)) {
      await this.cookieAcceptButton.click();
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Delegates dashboard-readiness to DashboardPage so the selector lives in one place. */
  async waitForSignedIn(): Promise<void> {
    await this.page.waitForURL((url) => !/sign-in/.test(url.toString()), { timeout: 30_000 });
    await new DashboardPage(this.page).assertReady();
  }
}
