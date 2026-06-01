# Q1 — Booking Flow Test Cases

The booking flow on Ezra is the core revenue path. Below are the 15 most important test cases I'd cover across the first three steps of the booking process (scan/add-on selection, scheduling, and payment), prioritized P0 through P3.

## Priority key

- **P0** — release blocker. Revenue or safety stops if this fails. Must pass before every deploy.
- **P1** — high impact. Causes lost bookings, billing disputes, or operational failure. Fix in current sprint.
- **P2** — medium impact. Functional but degraded UX or recoverable data issues. Fix soon.
- **P3** — low impact. Edge cases, content links, or polish. Backlog.

---

## Part 1 — Test cases (most important to least important)

### Critical flow

| # | Priority | Test case | Why it matters |
|---|---|---|---|
| 1 | **P0** | Complete happy path booking for an eligible user: select DOB + sex, choose MRI, add Heart CT, answer all screening questions with allowed responses, select center/date/time, pay by card, and confirm reservation. | Core money path. If this fails, users cannot book and revenue is lost immediately. |
| 2 | **P0** | Verify ineligible answers in the Heart CT questionnaire block continuation or clearly redirect the user before purchase. | Top medical-safety test. A logic bug could allow unsafe or non-compliant bookings regulatory risk on top of harm. |
| 3 | **P1** | Verify total price and appointment summary stay correct from selected scan/add-on through checkout. | Price integrity is a trust and billing issue. Wrong totals create payment disputes and broken fulfillment. |
| 4 | **P2** | Verify "Continue" remains disabled until all mandatory selections are made, then enables exactly when valid. | Prevents incomplete state transitions and reduces backend errors caused by partial booking data. |
| 5 | **P1** | Verify selected center, date, and time persist correctly into the reserve appointment page and final order summary. | Losing scheduling state is a common funnel defect; users book the wrong slot or abandon. |

### Selection logic

| # | Priority | Test case | Why it matters |
|---|---|---|---|
| 6 | **P1** | Verify scan availability changes correctly based on DOB and sex-at-birth inputs. | The page tailors available scans using those inputs; incorrect filtering could expose the wrong medical products or hide valid ones. |
| 7 | **P2** | Verify add-on selection behavior: selecting Heart CT highlights the card, opens the questionnaire, and adds it only after valid completion. | Covers the main dependency between product selection and gating questions — likely source of state bugs. |
| 8 | **P3** | Verify incompatible or substituted center offerings are clearly communicated, e.g. "Available instead · MRI Scan with Spine." | Mismatched offerings lead to false expectations and post-booking support burden. |
| 9 | **P3** | Verify "What's Included" and "Learn More" actions open the correct content for the chosen scan/add-on. | Influences purchase confidence and reduces confusion for expensive medical services. |
| 10 | **P2** | Verify state filter and "Find closest centers to me" update the center list correctly, including permission-denied and no-results cases. | Major discovery feature. If it fails, users may think no appointments exist. |

### Scheduling integrity

| # | Priority | Test case | Why it matters |
|---|---|---|---|
| 11 | **P1** | Verify unavailable dates/times cannot be selected and that only active slots allow progression. | Scheduling defects create overbooking, invalid reservations, and operational failures at the imaging center. |
| 12 | **P1** | Verify timezone handling is accurate across the UI and summary, since slots are shown in Eastern Standard Time and the confirmation shows EDT. | High-severity booking defect — users may arrive at the wrong time even when payment succeeds. |
| 13 | **P2** | Verify back navigation preserves prior selections without duplicating charges, clearing required answers, or changing the selected package. | Multi-step funnels often break on back/forward; silent state corruption is costly to debug. |

### Payment and resilience

| # | Priority | Test case | Why it matters |
|---|---|---|---|
| 14 | **P1** | Verify payment validation and failures for card details, ZIP, promo code, and alternate payment methods like Bank, Google Pay, and Affirm. | Payment is the final conversion step. Failure handling must be correct to avoid lost revenue and duplicate retries. |
| 15 | **P3** | Verify modal close/cancel behavior, page refresh, and session recovery do not create orphaned selections or inconsistent summaries. | Less frequent, but still matters for real-world robustness and supportability. |

### Distribution

- **P0 (2):** #1 happy path, #2 medical eligibility
- **P1 (6):** #3 price, #5 schedule persistence, #6 scan filtering, #11 unavailable slots, #12 timezone, #14 payment failures
- **P2 (4):** #4 continue gating, #7 add-on state, #10 location filter, #13 back navigation
- **P3 (3):** #8 incompatible centers, #9 learn-more content, #15 session recovery

---

## Part 2 — Top 3 rationale

### #1 (P0) — Complete happy path booking

This is the core revenue path. A failure here means users cannot book, and revenue stops immediately. The test also touches every dependency in the funnel: auth, scan catalog, scheduling availability, Stripe payment, and reservation creation — so a single end-to-end pass gives the highest confidence-per-test ratio of any test in the suite. If only one test could run before a deploy, this would be it.

### #2 (P0) — Heart CT eligibility blocking

The CAC prescreen modal asks medical-eligibility questions (pacemaker, prior stents, recent CAC scans, etc.) that determine whether a member can safely undergo the scan. A logic bug that lets ineligible members through is both a patient-safety incident and a regulatory exposure (HIPAA-adjacent record-keeping, potential FDA implications). Unlike a payment bug, this can't be cleaned up with a refund — it requires incident response. That's why it sits alongside #1 at P0 even though it doesn't directly affect revenue.

### #3 (P1) — Price integrity across steps

Price drift between scan selection and checkout is the single most common source of post-purchase complaints in any e-commerce funnel: users see one number, get charged another. Beyond the direct revenue impact, it erodes trust and generates disputes that have to be handled by customer support and refunded manually. The test is cheap to automate (capture displayed total at two points and compare) and protects against a class of bugs that are easy to introduce when adding promo codes, tax logic, or new add-ons.
