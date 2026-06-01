# Q2 — Privacy

Being privacy-focused is integral to Ezra's culture and business model. Below are integration test cases that prevent members from accessing other members' medical data, the HTTP requests to implement them, and a strategy for managing security across 100+ sensitive endpoints.

---

## Part 1 — Integration test cases

| Test case | Steps | Expected result |
|---|---|---|
| **Prevent questionnaire completion for another person under the same account.** | 1. Log in as User A. 2. Start Medical Questionnaire. 3. Select "Another person." 4. Click Continue. | Users are blocked, shown the "Each person needs their own account" page, and cannot create or continue a questionnaire for another patient from the same account. |
| **Prevent cross-member access to another user's questionnaire submission via direct API call.** | 1. Log in as Member A, click Begin Medical Questionnaire, capture their submission ID (e.g. `5407`) from the `POST /diagnostics/api/medicaldata/forms/mq/submissions/{id}/data` request. 2. Log in as Member B in a separate session and capture their bearer token. 3. Replay the same POST against `/submissions/5407/data` using Member B's token. | API returns **403 Forbidden** or **404 Not Found**.  |
| **Block questionnaire access via direct URL when the user is not the owner.** | 1. Log in as Member A, open the Medical Questionnaire, copy the in-progress URL from the address bar. 2. Sign out completely. 3. Sign in as Member B. 4. Paste Member A's URL. | Member B is redirected to their own dashboard or shown a "Not authorized" page. The questionnaire page does not render Member A's answers. Status code should return 403/404. |
| **Reject expired or missing tokens against the questionnaire endpoint.** | 1. Log in as Member A and capture their bearer access token from a `submissions/{id}/data` request. 2. Wait until the token's expiration claim has passed. 3. Replay the POST request with the expired token.  | Both requests return **401 Unauthorized**.  The user is forced to re-authenticate again. |

---

## Part 2 — HTTP requests

All three target the same endpoint pattern captured live on staging during the Begin Medical Questionnaire flow.

**Shared request details:**

- **Method & path:** `POST /diagnostics/api/medicaldata/forms/mq/submissions/{id}/data`
- **Host:** `stage-api.ezra.com`
- **Content-Type:** `application/json`
- **Body:** `{ "key": "understandScreeningOnly", "value": "\"yes\"", "hasAnswer": true }`

| # | Test | Submission ID | Authorization header | Expected response | Notes |
|---|---|---|---|---|---|
| 1 | Cross-member write (the core test) | `5407` (Member A's) | `Bearer <MEMBER_B_TOKEN>` | `403` or `404` | A `200` means Member B wrote into Member A's medical record. Broken access control. |
| 2 | Unauthenticated | `5407` (Member A's) | *(none)* | `401` | Confirms auth is required at all. |
| 3 | Adjacent submission ID | `5406` | `Bearer <MEMBER_B_TOKEN>` | `403` or `404` | Response timing should match a known-nonexistent ID. Different timings leak whether the neighbor exists. |

---

## Part 3 — Managing security across 100+ sensitive endpoints

I’d treat the 100+ endpoints as a shared security surface, not one-off tests. First, I’d classify them by sensitivity and risk (PII, payments, admin) and focus on the deepest checks there. Then I’d build reusable tests for authentication, object-level authorization, input validation, response exposure, encryption, and audit logging, using a shared library instead of individual checks per endpoint.

For **tooling**, I’d use Postman for quick exploration and collaboration, but rely on Python-based integration tests in CI for scalable regression, plus static analysis and dependency scanning in CI/CD to catch insecure patterns and libraries early.

The main **tradeoff** is speed and velocity vs depth.. manual/Postman flows are fast but don’t scale, while automated tests and pipeline checks require more upfront work but give lasting coverage. The biggest risks are false confidence from partial coverage, undocumented ‘shadow’ endpoints, and business-logic issues, so I’d add regular reviews of high‑risk APIs and targeted bug bounty or pen tests on critical flows.

