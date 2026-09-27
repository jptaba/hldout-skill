# Triage — PB-2 / run 04-harden

Generated 2026-09-27T12:12:05.044Z

**2/3 passed**, 1 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-010.1 | boundary | AC-6 | passed | - | - | - |
| SCN-010.2 | boundary | AC-6 | failed | SCRIPT_DEFECT | high | ⏳ pending |

## SCN-010.2: The page opens an account only from a funding account holding at least 100.00 (99.99)

- Requirement refs: AC-6 · type: boundary · layer: e2e
- Failing step: Then the page shows an error instead of the opening
- Error: `[REQ AC-6] R5: funding 99.99 → an error is shown`
- Locator: `getByText(/error/i).first()`
- Expected: `visible`
- Received: `hidden`
- Relevant API exchange (#11 of 11): `GET https://parabank.parasoft.com/parabank/services/bank/customers/16097/accounts` → **200**
  - request body: ``
  - response body: `[{"id":23112,"customerId":16097,"type":"CHECKING","balance":415.51},{"id":23223,"customerId":16097,"type":"CHECKING","balance":-0.01},{"id":23334,"customerId":16097,"type":"SAVINGS","balance":100}]`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/04-harden/artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/error-context.md)

**Auto: SCRIPT_DEFECT (high)**

- Note: depends on SCN-004 (not run), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /parabank/services/bank/customers/16097/accounts → 200
- GET /parabank/services/bank/customers/16097/accounts is not an endpoint the requirement declares (POST /createAccount, GET /customers/{customerId}/accounts, GET /accounts/{accountId}, GET /accounts/{accountId}/transactions, POST /transfer).
- Also failed: [REQ AC-6] R5: funding 99.99 → no "Account Opened!" — expected hidden, received visible
- Also failed: [REQ AC-6] R5: accounts the same as before — expected 2, received 3

Next: The test called the wrong endpoint/method. Align it with the declared contract (HOW only), probe it, re-run.
