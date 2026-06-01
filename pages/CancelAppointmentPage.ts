import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { DashboardPage } from './DashboardPage';

/** Cancel-reservation flow: dashboard → schedule actions → cancel confirmation. */
export class CancelAppointmentPage extends BasePage {
  get rescheduleOrCancelButton(): Locator {
    return this.page.getByRole('button', { name: /reschedule or cancel/i });
  }

  get cancelChoiceButton(): Locator {
    return this.page.getByRole('button', { name: /^cancel$/i });
  }

  get reasonExpensive(): Locator {
    return this.page.getByText(/the screening is too expensive/i);
  }

  get amountInput(): Locator {
    return this.page.getByPlaceholder(/please enter an amount/i);
  }

  get cancelScanButton(): Locator {
    return this.page.getByRole('button', { name: /cancel scan/i });
  }

  /** True when the dashboard shows an active appointment; used to skip when nothing to cancel. */
  async hasActiveAppointment(): Promise<boolean> {
    return this.rescheduleOrCancelButton.isVisible({ timeout: 5_000 }).catch(() => false);
  }

  async openCancelConfirmation(): Promise<void> {
    await expect(this.rescheduleOrCancelButton).toBeVisible({ timeout: 15_000 });
    await this.rescheduleOrCancelButton.click();

    await expect(this.cancelChoiceButton).toBeVisible({ timeout: 10_000 });
    await this.cancelChoiceButton.click();

    await expect(this.cancelScanButton).toBeVisible({ timeout: 10_000 });
  }

  async fillCancelReason(amountText: string): Promise<void> {
    await this.reasonExpensive.click();
    await this.amountInput.fill(amountText);
  }

  async confirmCancel(): Promise<void> {
    await expect(this.cancelScanButton).toBeEnabled();
    await this.cancelScanButton.click();
  }

  async assertCancellationCompleted(): Promise<void> {
    await expect(this.page).not.toHaveURL(/schedule-actions/, { timeout: 15_000 });
  }

  async assertDashboardReady(): Promise<void> {
    await new DashboardPage(this.page).assertReady();
  }
}
