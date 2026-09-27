# Triage — PB-2 / run 06-rerun

Generated 2026-09-27T16:55:18.012Z

**9/13 passed**, 4 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | integration | AC-3, AC-6 | passed | - | - | - |
| SCN-004 | functional | AC-4 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-005 | functional | AC-5 | passed | - | - | - |
| SCN-006 | integration | AC-5 | passed | - | - | - |
| SCN-007 | functional | AC-6 | passed | - | - | - |
| SCN-008 | functional | AC-6 | passed | - | - | - |
| SCN-009.1 | boundary | AC-6 | passed | - | - | - |
| SCN-009.2 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-010.1 | boundary | AC-6 | passed | - | - | - |
| SCN-010.2 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-011 | security | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |

## SCN-004: POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it

- Requirement refs: AC-4 · type: functional · layer: api
- Failing step: And the body is the new account with an id, the customer's customerId, type CHECKING and balance 100.00
- Error: `[REQ AC-4] body balance 100.00`
- Expected: `10000`
- Received: `0`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/30216` → **200**
  - request body: ``
  - response body: `{"id":30216,"customerId":19427,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/30216 → 200
- Requirement assertion [REQ AC-4] failed.
- Expected: 10000
- Received: 0
- Also failed: [REQ AC-4] GET returns the same values — expected { "balance": 0, "customerId": 19427, "id": 30216, "type": "CHECKING" }, received { "balance": 10000, "customerId": 19427, "id": 30216, "type": "CHECKING" }

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Auto-triage called this a SCRIPT_DEFECT because it matched GET /parabank/services/bank/accounts/{id} against the declared GET /accounts/{accountId} without the API base path; the endpoint is declared. The failing assertion is on the POST /createAccount body: balance 0 where AC-4/R6 require the opening balance 100.00. The account itself is funded: GET /accounts/{id} right after returns balance 100, so the 'same values' check fails from the same root cause. id, customerId and type are correct. (Confirmed in run 05-eval; identical failure signature in 06-rerun.)

## SCN-009.2: The service opens an account only from a funding account holding at least 100.00 (99.99)

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the new account is not opened
- Error: `[REQ AC-6] R5: funding 99.99 → not opened`
- Expected: `2`
- Received: `3`
- Relevant API exchange (#3 of 3): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/33435` → **200**
  - request body: ``
  - response body: `{"id":33435,"customerId":20870,"type":"CHECKING","balance":-0.01}`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-004 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /parabank/services/bank/accounts/33435 → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 2
- Received: 3
- Also failed: [REQ AC-6] R5/R7: funding balance after is 99.99 — expected 9999, received -1

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Precondition verified: the funding account held exactly 99.99 (seed read-back). POST /createAccount from it opened a third account and left the funding account at -0.01; R5 says the account is not opened and nothing moves. Auto SCRIPT_DEFECT is a false alarm: GET /accounts/{accountId} is a declared endpoint (the matcher does not strip the API base path /parabank/services/bank).

## SCN-010.2: The page opens an account only from a funding account holding at least 100.00 (99.99)

- Requirement refs: AC-6 · type: boundary · layer: e2e
- Failing step: Then the page shows an error instead of the opening
- Error: `[REQ AC-6] R5: funding 99.99 → an error is shown`
- Locator: `getByText(/error/i).first()`
- Expected: `visible`
- Received: `hidden`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-004 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Requirement assertion [REQ AC-6] failed on a located element.
- Expected: visible
- Received: hidden
- Also failed: [REQ AC-6] R5: funding 99.99 → no "Account Opened!" — expected hidden, received visible
- Also failed: [REQ AC-6] R5: accounts the same as before — expected 2, received 3

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Precondition verified (funding account at exactly 99.99 via GET /accounts/{id}). Opening SAVINGS from it on openaccount.htm shows 'Account Opened!' and no error; R5 says the account is not opened and the customer gets an error. The accounts/balance steps fail from the same root cause. Auto SCRIPT_DEFECT was wrong: the page shows the success confirmation, there is no error element to locate. (Confirmed in run 05-eval; identical failure signature in 06-rerun.)

## SCN-011: The service does not fund a new account from another customer's account

- Requirement refs: AC-6 · type: security · layer: api
- Failing step: Then no new account is opened for customer A
- Error: `[REQ AC-6] R4: no account opened from another customer's account`
- Expected: `1`
- Received: `2`
- Relevant API exchange (#3 of 3): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/36765` → **200**
  - request body: ``
  - response body: `{"id":36765,"customerId":22424,"type":"CHECKING","balance":415.5}`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-004 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /parabank/services/bank/accounts/36765 → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 1
- Received: 2
- Also failed: [REQ AC-6] R4: another customer's account is not debited — expected 51550, received 41550

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — R4: the opening deposit is moved from one existing account of the same customer. The service opened an account for customer A funded from customer B's account and debited B by 100.00. The exact refusal response is open (G7, @needs-clarification), but no reading of R4 allows debiting another customer's account. Auto SCRIPT_DEFECT (undeclared endpoint) was wrong: GET /accounts/{accountId} is declared. (Confirmed in run 05-eval; identical failure signature in 06-rerun.)
