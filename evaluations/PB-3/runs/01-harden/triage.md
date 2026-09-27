# Triage — PB-3 / run 01-harden

Generated 2026-09-27T12:41:08.903Z

> ⚠️ **Environment:** AUT degraded around this run: https://parabank.parasoft.com/parabank/index.htm failed (rate limited (429, retry after 202 s) — wait, then run again); https://parabank.parasoft.com/parabank/services/bank/openapi.yaml failed (rate limited (429, retry after 202 s) — wait, then run again); 2 different tests timed out.

**4/12 passed**, 8 failed, 0 flaky, 0 skipped.

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
| SCN-008 | boundary | AC-6 | failed | BLOCKED | high | ⏳ pending |
| SCN-009 | negative | AC-7 | failed | BLOCKED | high | ⏳ pending |

## SCN-004.1: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "")

- Requirement refs: AC-4 · type: negative · layer: ui
- Failing step: Then the Transfer Funds form stays on screen with the message "The amount cannot be empty."
- Error: `[REQ AC-4] message "The amount cannot be empty." shown`
- Locator: `getByText('The amount cannot be empty.', { exact: true })`
- Expected: `visible`
- Received: `hidden`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/44535` → **200**
  - request body: ``
  - response body: `{"id":44535,"customerId":25754,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-eabcd-unds-form-on-screen-amount--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/01-harden/artifacts/PB-3-tests-pb-3-PB-3-Trans-eabcd-unds-form-on-screen-amount--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-eabcd-unds-form-on-screen-amount--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/44535 → 200
- Requirement assertion [REQ AC-4] failed.
- Expected: visible
- Received: hidden
- Also failed: [REQ AC-4] Transfer Funds form stays on screen — expected visible, received undefined

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-004.2: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "abc")

- Requirement refs: AC-4 · type: negative · layer: ui
- Failing step: Then the Transfer Funds form stays on screen with the message "Please enter a valid amount."
- Error: `[REQ AC-4] message "Please enter a valid amount." shown`
- Locator: `getByText('Please enter a valid amount.', { exact: true })`
- Expected: `visible`
- Received: `hidden`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/45090` → **200**
  - request body: ``
  - response body: `{"id":45090,"customerId":26087,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-99fbe--form-on-screen-amount-abc--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/01-harden/artifacts/PB-3-tests-pb-3-PB-3-Trans-99fbe--form-on-screen-amount-abc--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-99fbe--form-on-screen-amount-abc--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/45090 → 200
- Requirement assertion [REQ AC-4] failed.
- Expected: visible
- Received: hidden
- Also failed: [REQ AC-4] Transfer Funds form stays on screen — expected visible, received undefined

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-005.1: A zero or negative amount is refused on the Transfer Funds page (0)

- Requirement refs: AC-5 · type: boundary · layer: ui
- Failing step: Then the transfer is refused (the page does not show "Transfer Complete!") — bounded 5 s wait for the confirmation
- Error: `[REQ AC-5] page does not show "Transfer Complete!"`
- Expected: `false`
- Received: `true`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/45645` → **200**
  - request body: ``
  - response body: `{"id":45645,"customerId":26420,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-602d9--the-Transfer-Funds-page-0--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/01-harden/artifacts/PB-3-tests-pb-3-PB-3-Trans-602d9--the-Transfer-Funds-page-0--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-602d9--the-Transfer-Funds-page-0--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/45645 → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: false
- Received: true

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-005.2: A zero or negative amount is refused on the Transfer Funds page (-10.00)

- Requirement refs: AC-5 · type: boundary · layer: ui
- Failing step: Then the transfer is refused (the page does not show "Transfer Complete!") — bounded 5 s wait for the confirmation
- Error: `[REQ AC-5] page does not show "Transfer Complete!"`
- Expected: `false`
- Received: `true`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/46089` → **200**
  - request body: ``
  - response body: `{"id":46089,"customerId":26642,"type":"CHECKING","balance":90}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-bb4eb-Transfer-Funds-page--10-00--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/01-harden/artifacts/PB-3-tests-pb-3-PB-3-Trans-bb4eb-Transfer-Funds-page--10-00--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-bb4eb-Transfer-Funds-page--10-00--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/46089 → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: false
- Received: true
- Also failed: [REQ AC-5] GET /accounts/<A> balance unchanged — expected 415.5, received 425.5
- Also failed: [REQ AC-5] GET /accounts/<B> balance unchanged — expected 100, received 90

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-006.1: A zero or negative amount is refused by the REST service (0)

- Requirement refs: AC-5 · type: boundary · layer: api
- Failing step: Then the transfer is refused (the service does not answer with the success confirmation of AC-2)
- Error: `[REQ AC-5] POST /transfer does not answer with the success confirmation`
- Expected: `not /^\s*Successfully transferred/`
- Received: `"Successfully transferred $0 from account #46533 to account #46644"`
- Relevant API exchange (#1 of 3): `POST https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=46533&toAccountId=46644&amount=0` → **200**
  - request body: ``
  - response body: `Successfully transferred $0 from account #46533 to account #46644`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-47981-used-by-the-REST-service-0--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/01-harden/artifacts/PB-3-tests-pb-3-PB-3-Trans-47981-used-by-the-REST-service-0--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-47981-used-by-the-REST-service-0--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /parabank/services/bank/transfer → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: not /^\s*Successfully transferred/
- Received: "Successfully transferred $0 from account #46533 to account #46644"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-006.2: A zero or negative amount is refused by the REST service (-10.00)

- Requirement refs: AC-5 · type: boundary · layer: api
- Failing step: Then the transfer is refused (the service does not answer with the success confirmation of AC-2)
- Error: `[REQ AC-5] POST /transfer does not answer with the success confirmation`
- Expected: `not /^\s*Successfully transferred/`
- Received: `"Successfully transferred $-10.00 from account #46977 to account #47088"`
- Relevant API exchange (#1 of 3): `POST https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=46977&toAccountId=47088&amount=-10.00` → **200**
  - request body: ``
  - response body: `Successfully transferred $-10.00 from account #46977 to account #47088`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-44d19-by-the-REST-service--10-00--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/01-harden/artifacts/PB-3-tests-pb-3-PB-3-Trans-44d19-by-the-REST-service--10-00--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-44d19-by-the-REST-service--10-00--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /parabank/services/bank/transfer → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: not /^\s*Successfully transferred/
- Received: "Successfully transferred $-10.00 from account #46977 to account #47088"
- Also failed: [REQ AC-5] GET /accounts/<A> balance unchanged — expected 415.5, received 425.5
- Also failed: [REQ AC-5] GET /accounts/<B> balance unchanged — expected 100, received 90

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-008: The Transfer Funds page completes a transfer of 1000.00, more than the balance of A

- Requirement refs: AC-6 · type: boundary · layer: e2e
- Failing step: [SEED] customer who owns accounts A and B (register + Open New Account)
- Error: `[SEED] customer who owns accounts A and B (register + Open New Account): precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-88c42--more-than-the-balance-of-A-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/01-harden/artifacts/PB-3-tests-pb-3-PB-3-Trans-88c42--more-than-the-balance-of-A-chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-88c42--more-than-the-balance-of-A-chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- AUT degraded around this run: https://parabank.parasoft.com/parabank/index.htm failed (rate limited (429, retry after 202 s) — wait, then run again); https://parabank.parasoft.com/parabank/services/bank/openapi.yaml failed (rate limited (429, retry after 202 s) — wait, then run again); 2 different tests timed out.
- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] customer who owns accounts A and B (register + Open New Account): precondition could not be established — locator.fill: Timeout 10000ms exceeded.

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-009: The REST service refuses an unknown destination account

- Requirement refs: AC-7 · type: negative · layer: api
- Failing step: [SEED] customer who owns accounts A and B (register + Open New Account)
- Error: `[SEED] customer who owns accounts A and B (register + Open New Account): precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-8d0be-unknown-destination-account-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/01-harden/artifacts/PB-3-tests-pb-3-PB-3-Trans-8d0be-unknown-destination-account-chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-8d0be-unknown-destination-account-chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- AUT degraded around this run: https://parabank.parasoft.com/parabank/index.htm failed (rate limited (429, retry after 202 s) — wait, then run again); https://parabank.parasoft.com/parabank/services/bank/openapi.yaml failed (rate limited (429, retry after 202 s) — wait, then run again); 2 different tests timed out.
- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] customer who owns accounts A and B (register + Open New Account): precondition could not be established — locator.fill: Timeout 10000ms exceeded.

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.
