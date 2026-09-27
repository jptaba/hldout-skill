# Triage — PB-3 / run 04-harden-stability

Generated 2026-09-27T12:59:49.693Z

**6/12 passed**, 6 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | integration | AC-3 | passed | - | - | - |
| SCN-004.1 | negative | AC-4 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-004.2 | negative | AC-4 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-005.1 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-005.2 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-006.1 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-006.2 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-007 | boundary | AC-6 | passed | - | - | - |
| SCN-008 | boundary | AC-6 | passed | - | - | - |
| SCN-009 | negative | AC-7 | passed | - | - | - |

## SCN-004.1: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "")

- Requirement refs: AC-4 · type: negative · layer: ui
- Failing step: Then the Transfer Funds form stays on screen with the message "The amount cannot be empty."
- Repeats: failed **2 of 2**
- Error: `[REQ AC-4] message "The amount cannot be empty." shown`
- Locator: `getByText('The amount cannot be empty.', { exact: true })`
- Expected: `visible`
- Received: `hidden`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/57522` → **200**
  - request body: ``
  - response body: `{"id":57522,"customerId":32303,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-eabcd-unds-form-on-screen-amount--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/04-harden-stability/artifacts/PB-3-tests-pb-3-PB-3-Trans-eabcd-unds-form-on-screen-amount--chromium/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-eabcd-unds-form-on-screen-amount--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/57522 → 200
- Requirement assertion [REQ AC-4] failed.
- Expected: visible
- Received: hidden
- Also failed: [REQ AC-4] Transfer Funds form stays on screen — expected visible, received undefined

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-004.2: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "abc")

- Requirement refs: AC-4 · type: negative · layer: ui
- Failing step: Then the Transfer Funds form stays on screen with the message "Please enter a valid amount."
- Repeats: failed **2 of 2**
- Error: `[REQ AC-4] message "Please enter a valid amount." shown`
- Locator: `getByText('Please enter a valid amount.', { exact: true })`
- Expected: `visible`
- Received: `hidden`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/57855` → **200**
  - request body: ``
  - response body: `{"id":57855,"customerId":32525,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-99fbe--form-on-screen-amount-abc--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/04-harden-stability/artifacts/PB-3-tests-pb-3-PB-3-Trans-99fbe--form-on-screen-amount-abc--chromium/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-99fbe--form-on-screen-amount-abc--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/57855 → 200
- Requirement assertion [REQ AC-4] failed.
- Expected: visible
- Received: hidden
- Also failed: [REQ AC-4] Transfer Funds form stays on screen — expected visible, received undefined

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-005.1: A zero or negative amount is refused on the Transfer Funds page (0)

- Requirement refs: AC-5 · type: boundary · layer: ui
- Failing step: Then the transfer is refused (the page does not show "Transfer Complete!") — bounded 5 s wait for the confirmation
- Repeats: failed **2 of 2**
- Error: `[REQ AC-5] page does not show "Transfer Complete!"`
- Expected: `false`
- Received: `true`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/58410` → **200**
  - request body: ``
  - response body: `{"id":58410,"customerId":32747,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-602d9--the-Transfer-Funds-page-0--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/04-harden-stability/artifacts/PB-3-tests-pb-3-PB-3-Trans-602d9--the-Transfer-Funds-page-0--chromium/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-602d9--the-Transfer-Funds-page-0--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/58410 → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: false
- Received: true

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-005.2: A zero or negative amount is refused on the Transfer Funds page (-10.00)

- Requirement refs: AC-5 · type: boundary · layer: ui
- Failing step: Then the transfer is refused (the page does not show "Transfer Complete!") — bounded 5 s wait for the confirmation
- Repeats: failed **2 of 2**
- Error: `[REQ AC-5] page does not show "Transfer Complete!"`
- Expected: `false`
- Received: `true`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/58632` → **200**
  - request body: ``
  - response body: `{"id":58632,"customerId":32858,"type":"CHECKING","balance":90}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-bb4eb-Transfer-Funds-page--10-00--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/04-harden-stability/artifacts/PB-3-tests-pb-3-PB-3-Trans-bb4eb-Transfer-Funds-page--10-00--chromium/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-bb4eb-Transfer-Funds-page--10-00--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/58632 → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: false
- Received: true
- Also failed: [REQ AC-5] GET /accounts/<A> balance unchanged — expected 415.5, received 425.5
- Also failed: [REQ AC-5] GET /accounts/<B> balance unchanged — expected 100, received 90

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-006.1: A zero or negative amount is refused by the REST service (0)

- Requirement refs: AC-5 · type: boundary · layer: api
- Failing step: Then the transfer is refused (the service does not answer with the success confirmation of AC-2)
- Repeats: failed **2 of 2**
- Error: `[REQ AC-5] POST /transfer does not answer with the success confirmation`
- Expected: `not /^\s*Successfully transferred/`
- Received: `"Successfully transferred $0 from account #58743 to account #58854"`
- Relevant API exchange (#1 of 3): `POST https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=58743&toAccountId=58854&amount=0` → **200**
  - request body: ``
  - response body: `Successfully transferred $0 from account #58743 to account #58854`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-47981-used-by-the-REST-service-0--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/04-harden-stability/artifacts/PB-3-tests-pb-3-PB-3-Trans-47981-used-by-the-REST-service-0--chromium/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-47981-used-by-the-REST-service-0--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /parabank/services/bank/transfer → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: not /^\s*Successfully transferred/
- Received: "Successfully transferred $0 from account #58743 to account #58854"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-006.2: A zero or negative amount is refused by the REST service (-10.00)

- Requirement refs: AC-5 · type: boundary · layer: api
- Failing step: Then the transfer is refused (the service does not answer with the success confirmation of AC-2)
- Repeats: failed **2 of 2**
- Error: `[REQ AC-5] POST /transfer does not answer with the success confirmation`
- Expected: `not /^\s*Successfully transferred/`
- Received: `"Successfully transferred $-10.00 from account #58965 to account #59076"`
- Relevant API exchange (#1 of 3): `POST https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=58965&toAccountId=59076&amount=-10.00` → **200**
  - request body: ``
  - response body: `Successfully transferred $-10.00 from account #58965 to account #59076`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-44d19-by-the-REST-service--10-00--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/04-harden-stability/artifacts/PB-3-tests-pb-3-PB-3-Trans-44d19-by-the-REST-service--10-00--chromium/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-44d19-by-the-REST-service--10-00--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /parabank/services/bank/transfer → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: not /^\s*Successfully transferred/
- Received: "Successfully transferred $-10.00 from account #58965 to account #59076"
- Also failed: [REQ AC-5] GET /accounts/<A> balance unchanged — expected 415.5, received 425.5
- Also failed: [REQ AC-5] GET /accounts/<B> balance unchanged — expected 100, received 90

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.
