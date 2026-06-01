import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { DashboardPage } from './DashboardPage';

/** Step 1 of the booking funnel: pick a scan, advance via Continue. */
export class BookingPage extends BasePage {
  private get continueButton(): Locator {
    return this.page.getByTestId('select-plan-submit-btn');
  }

  private get dobInput(): Locator {
    return this.page.getByLabel(/date of birth|dob/i);
  }

  private get totalValue(): Locator {
    return this.page.getByText(/total/i).locator('xpath=following-sibling::*[1]').first();
  }

  private scanTile(scanName: string): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: new RegExp(`^${escapeRegex(scanName)}$`) })
      .first();
  }

  private scanTileAncestor(scanName: string, depth: number): Locator {
    return this.page
      .getByText(scanName, { exact: true })
      .first()
      .locator(`xpath=ancestor::*[${depth}]`);
  }

  private sexOption(label: string): Locator {
    const pattern = new RegExp(label, 'i');
    return this.page
      .getByRole('radio', { name: pattern })
      .or(this.page.getByRole('button', { name: pattern }));
  }

  async goto(): Promise<void> {
    const dashboard = new DashboardPage(this.page);
    await dashboard.goto();
    await dashboard.assertReady();
    await dashboard.clickBookScan();
  }

  /** No-op when DOB/sex inputs aren't rendered (usually prefilled from the member profile). */
  async setProfile(profile: { dob: string; sexAtBirth: string }): Promise<void> {
    if (await this.dobInput.isVisible().catch(() => false)) {
      await this.dobInput.fill(profile.dob);
    }
    const sex = this.sexOption(profile.sexAtBirth).first();
    if (await sex.isVisible().catch(() => false)) {
      await sex.click();
    }
  }

  /** Click the scan tile; walk ancestors when a "Review your Scan" tier picker appears. */
  async selectScan(scanName: string): Promise<void> {
    const continueBtn = this.continueButton;

    await this.scanTile(scanName).click();
    if (await continueBtn.isEnabled({ timeout: 5_000 }).catch(() => false)) return;

    for (let depth = 1; depth <= 6; depth += 1) {
      const target = this.scanTileAncestor(scanName, depth);
      if (!(await target.isVisible({ timeout: 1_000 }).catch(() => false))) continue;

      await target.click({ trial: false }).catch(() => undefined);
      if (await continueBtn.isEnabled({ timeout: 2_000 }).catch(() => false)) return;
    }

    throw new Error(
      `selectScan("${scanName}"): Continue never enabled after walking 6 ancestor levels.`,
    );
  }

  async clickContinue(): Promise<void> {
    await expect(this.continueButton).toBeEnabled();
    await this.continueButton.click();
  }

  /** Returns the displayed total, or empty string if no "Total" label is rendered. */
  async getDisplayedTotal(): Promise<string> {
    if (!(await this.totalValue.isVisible().catch(() => false))) {
      return '';
    }
    return (await this.totalValue.textContent({ timeout: 2_000 }).catch(() => ''))?.trim() ?? '';
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
