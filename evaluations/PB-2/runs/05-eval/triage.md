# Triage — PB-2 / run 05-eval

Generated 2026-09-27T12:19:48.524Z

**9/13 passed**, 4 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | integration | AC-3, AC-6 | passed | - | - | - |
| SCN-004 | functional | AC-4 | failed | SCRIPT_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-005 | functional | AC-5 | passed | - | - | - |
| SCN-006 | integration | AC-5 | passed | - | - | - |
| SCN-007 | functional | AC-6 | passed | - | - | - |
| SCN-008 | functional | AC-6 | passed | - | - | - |
| SCN-009.1 | boundary | AC-6 | passed | - | - | - |
| SCN-009.2 | boundary | AC-6 | failed | BLOCKED | high | **ENVIRONMENT_ISSUE** |
| SCN-010.1 | boundary | AC-6 | passed | - | - | - |
| SCN-010.2 | boundary | AC-6 | failed | SCRIPT_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-011 | security | AC-6 | failed | SCRIPT_DEFECT | high | **APPLICATION_DEFECT** |

## SCN-004: POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it

- Requirement refs: AC-4 · type: functional · layer: api
- Failing step: And the body is the new account with an id, the customer's customerId, type CHECKING and balance 100.00
- Error: `[REQ AC-4] body balance 100.00`
- Expected: `10000`
- Received: `0`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/24444` → **200**
  - request body: ``
  - response body: `{"id":24444,"customerId":16652,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/05-eval/artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/error-context.md)

**Auto: SCRIPT_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/24444 → 200
- GET /parabank/services/bank/accounts/24444 is not an endpoint the requirement declares (POST /createAccount, GET /customers/{customerId}/accounts, GET /accounts/{accountId}, GET /accounts/{accountId}/transactions, POST /transfer).
- Also failed: [REQ AC-4] GET returns the same values — expected { "balance": 0, "customerId": 16652, "id": 24444, "type": "CHECKING" }, received { "balance": 10000, "customerId": 16652, "id": 24444, "type": "CHECKING" }

Next: The test called the wrong endpoint/method. Align it with the declared contract (HOW only), probe it, re-run.

**Confirmed: APPLICATION_DEFECT / Major** — Auto-triage called this a SCRIPT_DEFECT because it matched GET /parabank/services/bank/accounts/{id} against the declared GET /accounts/{accountId} without the API base path; the endpoint is declared. The failing assertion is on the POST /createAccount body: balance 0 where AC-4/R6 require the opening balance 100.00. The account itself is funded: GET /accounts/{id} right after returns balance 100, so the 'same values' check fails from the same root cause. id, customerId and type are correct.

## SCN-009.2: The service opens an account only from a funding account holding at least 100.00 (99.99)

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: [SEED] new customer (register.htm)
- Error: `[SEED] new customer (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/05-eval/artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- Blocked: depends on SCN-004 (failed) — resolve that scenario first; this one was not evaluated.
- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] new customer (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

**Confirmed: ENVIRONMENT_ISSUE** — Seed step hit Cloudflare 'Error 1015 You are being rate limited' on register.htm in both attempts (the shared sandbox bans bursts, also from other clients); the scenario was not evaluated. The same rule on the service was reproduced live separately (see SCN-010.2 evidence), but the test must re-run.

## SCN-010.2: The page opens an account only from a funding account holding at least 100.00 (99.99)

- Requirement refs: AC-6 · type: boundary · layer: e2e
- Failing step: Then the page shows an error instead of the opening
- Error: `[REQ AC-6] R5: funding 99.99 → an error is shown`
- Locator: `getByText(/error/i).first()`
- Expected: `visible`
- Received: `hidden`
- Relevant API exchange (#11 of 11): `GET https://parabank.parasoft.com/parabank/services/bank/customers/17984/accounts` → **200**
  - request body: ``
  - response body: `[{"id":27108,"customerId":17984,"type":"CHECKING","balance":415.51},{"id":27219,"customerId":17984,"type":"CHECKING","balance":-0.01},{"id":27330,"customerId":17984,"type":"SAVINGS","balance":100}]`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/05-eval/artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--c36af-ding-at-least-100-00-99-99--chromium-retry1/error-context.md)

**Auto: SCRIPT_DEFECT (high)**

- Note: depends on SCN-004 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /parabank/services/bank/customers/17984/accounts → 200
- GET /parabank/services/bank/customers/17984/accounts is not an endpoint the requirement declares (POST /createAccount, GET /customers/{customerId}/accounts, GET /accounts/{accountId}, GET /accounts/{accountId}/transactions, POST /transfer).
- Also failed: [REQ AC-6] R5: funding 99.99 → no "Account Opened!" — expected hidden, received visible
- Also failed: [REQ AC-6] R5: accounts the same as before — expected 2, received 3

Next: The test called the wrong endpoint/method. Align it with the declared contract (HOW only), probe it, re-run.

**Confirmed: APPLICATION_DEFECT / Critical** — Precondition verified (funding account at exactly 99.99 via GET /accounts/{id}). Opening SAVINGS from it on openaccount.htm shows 'Account Opened!' and no error; R5 says the account is not opened and the customer gets an error. The accounts/balance steps fail from the same root cause. Auto SCRIPT_DEFECT was wrong: the page shows the success confirmation, there is no error element to locate.

## SCN-011: The service does not fund a new account from another customer's account

- Requirement refs: AC-6 · type: security · layer: api
- Failing step: Then no new account is opened for customer A
- Error: `[REQ AC-6] R4: no account opened from another customer's account`
- Expected: `1`
- Received: `2`
- Relevant API exchange (#3 of 3): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/27774` → **200**
  - request body: ``
  - response body: `{"id":27774,"customerId":18317,"type":"CHECKING","balance":415.5}`
- Evidence: [screenshot](artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-2/runs/05-eval/artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/trace.zip` · [error-context](artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/error-context.md)

**Auto: SCRIPT_DEFECT (high)**

- Note: depends on SCN-004 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /parabank/services/bank/accounts/27774 → 200
- GET /parabank/services/bank/accounts/27774 is not an endpoint the requirement declares (POST /createAccount, GET /customers/{customerId}/accounts, GET /accounts/{accountId}, GET /accounts/{accountId}/transactions, POST /transfer).
- Also failed: [REQ AC-6] R4: another customer's account is not debited — expected 51550, received 41550

Next: The test called the wrong endpoint/method. Align it with the declared contract (HOW only), probe it, re-run.

**Confirmed: APPLICATION_DEFECT / Critical** — R4: the opening deposit is moved from one existing account of the same customer. The service opened an account for customer A funded from customer B's account and debited B by 100.00. The exact refusal response is open (G7, @needs-clarification), but no reading of R4 allows debiting another customer's account. Auto SCRIPT_DEFECT (undeclared endpoint) was wrong: GET /accounts/{accountId} is declared.
