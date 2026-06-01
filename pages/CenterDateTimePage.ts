import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Step 2 of the booking funnel: pick center → date → time. */
export class CenterDateTimePage extends BasePage {
  get continueButton(): Locator {
    return this.page.locator('[data-test="submit"]');
  }

  get firstAvailableCenter(): Locator {
    return this.page.getByText(/recommended/i).first();
  }

  /** Available cells report `aria-disabled="false"`; greyed cells report `true`. */
  get firstAvailableDate(): Locator {
    return this.page
      .locator('[data-testid$="-cal-day-content"]:not([aria-disabled="true"])')
      .first();
  }

  /** Time-slot label, excluding any whose ancestor input is disabled. */
  get firstAvailableTime(): Locator {
    return this.page
      .locator('label')
      .filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
      .filter({ hasNot: this.page.locator('input[disabled]') })
      .first();
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.firstAvailableCenter).toBeVisible({ timeout: 15_000 });
  }

  async selectFirstAvailableCenter(): Promise<string> {
    const center = this.firstAvailableCenter;
    const centerName = (await center.textContent())?.trim() ?? '';
    await center.click();
    await expect(this.firstAvailableDate).toBeVisible({ timeout: 35_000 });
    return centerName;
  }

  /** Greyed dates can lie about aria-disabled; click iteratively until time slots appear. */
  async selectFirstAvailableDate(): Promise<void> {
    const cells = await this.page.locator('[data-testid$="-cal-day-content"]').all();

    if (cells.length === 0) {
      throw new Error('No date cells found on the calendar.');
    }

    for (const cell of cells) {
      if (!(await cell.isVisible().catch(() => false))) continue;

      const ariaDisabled = await cell.getAttribute('aria-disabled');
      if (ariaDisabled === 'true') continue;

      await cell.click();

      const timeAppeared = await this.firstAvailableTime
        .isVisible({ timeout: 3_000 })
        .catch(() => false);
      if (timeAppeared) return;
    }

    throw new Error('No date revealed time slots — calendar may have no availability.');
  }

  async selectFirstAvailableTime(): Promise<string> {
    const slot = this.firstAvailableTime;
    const timeText = (await slot.textContent())?.trim() ?? '';
    await slot.click();
    return timeText;
  }

  async clickContinue(): Promise<void> {
    await expect(this.continueButton).toBeEnabled();
    await this.continueButton.click();
  }
}
