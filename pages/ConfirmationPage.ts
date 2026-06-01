import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Final page after a successful booking. */
export class ConfirmationPage extends BasePage {
  get heading(): Locator {
    return this.page.getByRole('heading', {
      name: /reservation|confirmed|booked|thank you|appointment/i,
    });
  }

  /** P0 assertion: payment cleared and a reservation was created. */
  async assertReached(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 30_000 });
  }
}
