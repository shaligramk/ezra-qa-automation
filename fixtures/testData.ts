/**
 * Test data lives here — never inline in specs.
 *
 * Stripe test cards: https://docs.stripe.com/testing
 *  - 4242 4242 4242 4242 → success (used here)
 *  - 4000 0000 0000 0002 → generic decline
 *  - 4000 0000 0000 9995 → insufficient funds
 *  - 4000 0025 0000 3155 → 3DS authentication required
 *
 * Scalability note: static fixtures are fine for ~10–20 tests. As the suite
 * grows, migrate to a builder pattern + per-test data factory:
 *
 *   const profile = aProfile().withDob('1990-01-15').withSex('Female').build();
 *
 * This keeps specs readable and prevents data collisions between parallel tests.
 */
import { env } from '../utils/env';

export const eligibleProfile = {
  dob: env.testDob,            // YYYY-MM-DD
  sexAtBirth: env.testSex,     // 'Male' | 'Female'
};

export const stripeCards = {
  success: {
    number: '4242 4242 4242 4242',
    exp: '12 / 34',
    cvc: '123',
    zip: env.testZip,
  },
} as const;

/**
 * Booking selection preferences. We deliberately do NOT hardcode a center name
 * (e.g. "QA Automation Center") — the test picks the first available center
 * and asserts persistence rather than a specific value.
 */
export const bookingPrefs = {
  scan: 'MRI Scan' as const,
};
