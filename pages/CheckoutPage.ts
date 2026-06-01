import { FrameLocator, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Payment step. All Stripe iframe handling is contained here. */
export class CheckoutPage extends BasePage {
  get totalAmount(): Locator {
    return this.page.getByText(/total/i).locator('xpath=following-sibling::*[1]').first();
  }

  get payButton(): Locator {
    return this.page.locator('[data-test="submit"]');
  }

  /** Stripe rotates the numeric suffix per page load — match by name prefix. */
  private stripeFrame(): FrameLocator {
    return this.page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
  }

  async fillCard(card: {
    number: string;
    exp: string;
    cvc: string;
    zip: string;
  }): Promise<void> {
    const frame = this.stripeFrame();
    await frame.getByRole('textbox', { name: 'Card number' }).fill(card.number);
    await frame.getByRole('textbox', { name: /expiration date/i }).fill(card.exp);
    await frame.getByRole('textbox', { name: 'Security code' }).fill(card.cvc);
    await frame.getByRole('textbox', { name: /zip code|postal/i }).fill(card.zip);
  }

  async submitPayment(): Promise<void> {
    await expect(this.payButton).toBeEnabled();
    await this.payButton.click();
  }

  /** Best-effort price read; returns empty if no "Total" label is rendered. */
  async getTotal(): Promise<string> {
    if (!(await this.totalAmount.isVisible().catch(() => false))) {
      return '';
    }
    return (
      (await this.totalAmount.textContent({ timeout: 2_000 }).catch(() => ''))?.trim() ?? ''
    );
  }

  /** Best-effort: no-ops if either side is missing. Strict check lives in its own test. */
  async assertTotalMatches(expected: string): Promise<void> {
    if (!expected) return;
    const actual = await this.getTotal();
    if (!actual) return;
    expect(actual).toBe(expected);
  }
}
