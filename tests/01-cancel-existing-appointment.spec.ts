/**
 * Test: Cancel an existing appointment
 * Maps to: Custom test case ("Cancel reservation lifecycle"), priority P1.
 *   - Closely related to Test #15 (P3 — modal close/cancel/refresh
 *     behavior) but the cancel-an-active-appointment flow has higher
 *     business impact: a broken cancel creates refund disputes and
 *     customer-support load.
 *
 * Why automated:
 *  - Pairs with booking-happy-path to exercise the full lifecycle:
 *    cancel any leftover appointment → book a fresh one → next run cancels
 *    that and books again. Each suite run leaves the account in the same
 *    state it started in.
 *  - Cancellation is operationally critical and a common production hotspot.
 *  - Independent of Stripe iframe details — focuses on appointment state
 *    transitions.
 *
 * Trade-offs / pre-conditions:
 *  - This test runs FIRST in the suite (the "01-" filename prefix). It
 *    serves as a cleanup step: any leftover booking from a previous run
 *    gets cancelled here, leaving the account clean for the happy-path
 *    test that follows.
 *  - If no appointment is present (a fresh account), the test SKIPS with
 *    a clear pre-condition message rather than failing on a selector miss.
 */
import { test } from '../fixtures/auth.fixture';
import { CancelAppointmentPage } from '../pages/CancelAppointmentPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Booking — cancel appointment', () => {
  test('user can cancel an existing appointment from the dashboard', async ({ loggedInPage }) => {
    const dashboard = new DashboardPage(loggedInPage);
    const cancel = new CancelAppointmentPage(loggedInPage);

    await dashboard.goto();

    if (!(await cancel.hasActiveAppointment())) {
      test.skip(
        true,
        'No active appointment on the account — nothing to cancel. ' +
          'This test will run on subsequent suite invocations after the ' +
          'happy-path test creates one.',
      );
    }

    await cancel.openCancelConfirmation();
    await cancel.fillCancelReason('100');
    await cancel.confirmCancel();

    await cancel.assertCancellationCompleted();
    await cancel.assertDashboardReady();
  });
});
