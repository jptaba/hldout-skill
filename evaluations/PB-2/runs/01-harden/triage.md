# Triage — PB-2 / run 01-harden

Generated 2026-09-27T12:06:46.822Z

**7/13 passed**, 6 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | functional | AC-2 | failed | SCRIPT_DEFECT | high | ⏳ pending |
| SCN-003 | integration | AC-3, AC-6 | passed | - | - | - |
| SCN-004 | functional | AC-4 | failed | SCRIPT_DEFECT | high | ⏳ pending |
| SCN-005 | functional | AC-5 | passed | - | - | - |
| SCN-006 | integration | AC-5 | passed | - | - | - |
| SCN-007 | functional | AC-6 | passed | - | - | - |
| SCN-008 | functional | AC-6 | passed | - | - | - |
| SCN-009.1 | boundary | AC-6 | passed | - | - | - |
| SCN-009.2 | boundary | AC-6 | failed | BLOCKED | high | ⏳ pending |
| SCN-010.1 | boundary | AC-6 | failed | BLOCKED | high | ⏳ pending |
| SCN-010.2 | boundary | AC-6 | failed | BLOCKED | high | ⏳ pending |
| SCN-011 | security | AC-6 | failed | BLOCKED | high | ⏳ pending |

## SCN-002: Opening a SAVINGS account on the page confirms it and links to its details

- Requirement refs: AC-2 · type: functional · layer: ui
- Failing step: And the page shows "Your new account number:" followed by the new account number as a link
- Error: `[REQ AC-2] the new account number is a link`
- Locator: `getByText('Your new account number:').getByRole('link', { name: /^\d+$/ })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--42601-it-and-links-to-its-details-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/01-harden/artifacts/PB-2-tests-pb-2-PB-2-Open--42601-it-and-links-to-its-details-chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--42601-it-and-links-to-its-details-chromium-retry1/error-context.md)

**Auto: SCRIPT_DEFECT (high)**

- Target not found: getByText('Your new account number:').getByRole('link', { name: /^\d+$/ })
- Failure-time page snapshot DOES contain the target text: `- text: "Your new account number:"`
- …but with a different role than the locator's 'link'.

Next: The element exists but the locator does not match it — re-inspect at this step, fix the locator (HOW only), re-run.

## SCN-004: POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it

- Requirement refs: AC-4 · type: functional · layer: api
- Failing step: And the body is the new account with an id, the customer's customerId, type CHECKING and balance 100.00
- Error: `[REQ AC-4] body balance 100.00`
- Expected: `10000`
- Received: `0`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/20004` → **200**
  - request body: ``
  - response body: `{"id":20004,"customerId":14765,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/01-harden/artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/error-context.md)

**Auto: SCRIPT_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/20004 → 200
- GET /parabank/services/bank/accounts/20004 is not an endpoint the requirement declares (POST /createAccount, GET /customers/{customerId}/accounts, GET /accounts/{accountId}, GET /accounts/{accountId}/transactions, POST /transfer).
- Also failed: [REQ AC-4] GET returns the same values — expected { "balance": 0, "customerId": 14765, "id": 20004, "type": "CHECKING" }, received { "balance": 10000, "customerId": 14765, "id": 20004, "type": "CHECKING" }

Next: The test called the wrong endpoint/method. Align it with the declared contract (HOW only), probe it, re-run.

## SCN-009.2: The service opens an account only from a funding account holding at least 100.00 (99.99)

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: [SEED] second account holding exactly 99.99
- Error: `[SEED] second account holding exactly 99.99: precondition could not be established — read account 22002 (precondition)`
- Expected: `200`
- Received: `429`
- Relevant API exchange (#1 of undefined): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/22002` → **429**
  - request body: ``
  - response body: `{"type":"https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/","title":"Error 1015: You are being rate limited","status":429,"detail":"You are being rate-limited by the website owner's configuration.","instance":"a41a604e9fd85e76","error_code":1015,"error_name":"rate_limited","error_category":"rate_limit","ray_id":"a41a604e9fd85e76","timestamp":"2026-09-27T12:05:22Z","zone":"parabank.parasoft.com","cloudflare_error":true,"retryable":true,"retry_after":30,"owner_action_required":false,"what_you_should_do":"**Wait and retry.** This block …`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/01-harden/artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- Blocked: depends on SCN-004 (failed) — resolve that scenario first; this one was not evaluated.
- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] second account holding exactly 99.99: precondition could not be established — read account 22002 (precondition)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-010.1: The page opens an account only from a funding account holding at least 100.00 (100.00)

- Requirement refs: AC-6 · type: boundary · layer: e2e
- Failing step: [SEED] new customer (register.htm)
- Error: `[SEED] new customer (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--35d0e-ing-at-least-100-00-100-00--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/01-harden/artifacts/PB-2-tests-pb-2-PB-2-Open--35d0e-ing-at-least-100-00-100-00--chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--35d0e-ing-at-least-100-00-100-00--chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- Blocked: depends on SCN-004 (failed) — resolve that scenario first; this one was not evaluated.
- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] new customer (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-010.2: The page opens an account only from a funding account holding at least 100.00 (99.99)

- Requirement refs: AC-6 · type: boundary · layer: e2e
- Failing step: [SEED] new customer (register.htm)
- Error: `[SEED] new customer (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/01-harden/artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- Blocked: depends on SCN-004 (failed) — resolve that scenario first; this one was not evaluated.
- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] new customer (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-011: The service does not fund a new account from another customer's account

- Requirement refs: AC-6 · type: security · layer: api
- Failing step: [SEED] customer B (register.htm)
- Error: `[SEED] customer B (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/01-harden/artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- Blocked: depends on SCN-004 (failed) — resolve that scenario first; this one was not evaluated.
- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] customer B (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.
