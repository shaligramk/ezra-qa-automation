/**
 * Test: Successful booking happy path
 * Maps to: Part 1, Test Case #1 (Priority 1 — Critical Flow / Money Path)
 *
 * Why automated:
 *  - This is the core revenue path. Failure here means users cannot book.
 *  - Best-effort price-integrity sanity check across steps. The funnel
 *    rarely surfaces a "Total" label before checkout, so this no-ops when
 *    either side is missing — strict price integrity lives in Test Case #3.
 *
 * Trade-offs:
 *  - Uses Stripe test card 4242 against the real Stripe iframe. This is
 *    the most flake-prone test in the suite.
 *  - Leaves a fake reservation on staging. The portal docs explicitly allow
 *    this ("create members as you please"), and we run the suite serially to
 *    avoid colliding state.
 */
import { test } from '../fixtures/auth.fixture';
import { BookingPage } from '../pages/BookingPage';
import { CenterDateTimePage } from '../pages/CenterDateTimePage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { eligibleProfile, stripeCards, bookingPrefs } from '../fixtures/testData';

test.describe('Booking — happy path', () => {
  test('eligible user can book and pay successfully', async ({ loggedInPage }) => {
    const booking = new BookingPage(loggedInPage);
    await booking.goto();
    await booking.setProfile(eligibleProfile);
    await booking.selectScan(bookingPrefs.scan);

    // Capture displayed total at the plan-review step. The funnel only shows
    // an explicit "Total" label on the checkout step, so this may be empty
    // here. We use it best-effort for the downstream price-integrity check.
    const totalAfterSelection = await booking.getDisplayedTotal();

    await booking.clickContinue();

    const scheduling = new CenterDateTimePage(loggedInPage);
    await scheduling.waitForLoaded();
    await scheduling.selectFirstAvailableCenter();
    await scheduling.selectFirstAvailableDate();
    await scheduling.selectFirstAvailableTime();
    await scheduling.clickContinue();

    const checkout = new CheckoutPage(loggedInPage);

    // Price integrity check (best-effort). Strict price-integrity coverage
    // lives in its own dedicated test (Test Case #3 in Part 1).
    await checkout.assertTotalMatches(totalAfterSelection);

    await checkout.fillCard(stripeCards.success);
    await checkout.submitPayment();

    const confirmation = new ConfirmationPage(loggedInPage);
    await confirmation.assertReached();
  });
});
