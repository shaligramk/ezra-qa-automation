import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Post-login landing page; owns the "Book a scan" entry point. */
export class DashboardPage extends BasePage {
  private get bookScanButton(): Locator {
    return this.page.getByRole('button', { name: /book a scan/i });
  }

  async goto(): Promise<void> {
    const dashboardPath = process.env.DASHBOARD_PATH || '/';
    await this.page.goto(dashboardPath);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickBookScan(): Promise<void> {
    await expect(this.bookScanButton).toBeVisible({ timeout: 15_000 });
    await this.bookScanButton.click();
  }

  /** Dashboard is ready when a new booking can be started. */
  async assertReady(): Promise<void> {
    await expect(this.bookScanButton).toBeVisible({ timeout: 15_000 });
  }
}
