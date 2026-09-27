# Triage — PB-3 / run 05-eval

Generated 2026-09-27T16:55:47.255Z

**6/12 passed**, 6 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | integration | AC-3 | passed | - | - | - |
| SCN-004.1 | negative | AC-4 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-004.2 | negative | AC-4 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-005.1 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-005.2 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-006.1 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-006.2 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007 | boundary | AC-6 | passed | - | - | - |
| SCN-008 | boundary | AC-6 | passed | - | - | - |
| SCN-009 | negative | AC-7 | passed | - | - | - |

## SCN-004.1: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "")

- Requirement refs: AC-4 · type: negative · layer: ui
- Failing step: Then the Transfer Funds form stays on screen with the message "The amount cannot be empty."
- Error: `[REQ AC-4] message "The amount cannot be empty." shown`
- Locator: `getByText('The amount cannot be empty.', { exact: true })`
- Expected: `visible`
- Received: `hidden`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-eabcd-unds-form-on-screen-amount--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/05-eval/artifacts/PB-3-tests-pb-3-PB-3-Trans-eabcd-unds-form-on-screen-amount--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-eabcd-unds-form-on-screen-amount--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-4] failed on a located element.
- Expected: visible
- Received: hidden
- Also failed: [REQ AC-4] Transfer Funds form stays on screen — expected visible, received undefined

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — The requirement (AC-4, story.md#L48-L56; PO comment L91 keeps the messages) says an empty or non-numeric amount keeps the Transfer Funds form on screen with 'The amount cannot be empty.' / 'Please enter a valid amount.'. Live, pressing Transfer with an empty amount or 'abc' replaces the page with 'Error! An internal error has occurred and has been logged.'; the form is gone and both messages exist only as hidden elements. Seeds, locators and the entry point worked (form filled, accounts selected); balances stay unchanged, so only the message/form outcome fails.

## SCN-004.2: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "abc")

- Requirement refs: AC-4 · type: negative · layer: ui
- Failing step: Then the Transfer Funds form stays on screen with the message "Please enter a valid amount."
- Error: `[REQ AC-4] message "Please enter a valid amount." shown`
- Locator: `getByText('Please enter a valid amount.', { exact: true })`
- Expected: `visible`
- Received: `hidden`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-99fbe--form-on-screen-amount-abc--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/05-eval/artifacts/PB-3-tests-pb-3-PB-3-Trans-99fbe--form-on-screen-amount-abc--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-99fbe--form-on-screen-amount-abc--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-4] failed on a located element.
- Expected: visible
- Received: hidden
- Also failed: [REQ AC-4] Transfer Funds form stays on screen — expected visible, received undefined

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — The requirement (AC-4, story.md#L48-L56; PO comment L91 keeps the messages) says an empty or non-numeric amount keeps the Transfer Funds form on screen with 'The amount cannot be empty.' / 'Please enter a valid amount.'. Live, pressing Transfer with an empty amount or 'abc' replaces the page with 'Error! An internal error has occurred and has been logged.'; the form is gone and both messages exist only as hidden elements. Seeds, locators and the entry point worked (form filled, accounts selected); balances stay unchanged, so only the message/form outcome fails.

## SCN-005.1: A zero or negative amount is refused on the Transfer Funds page (0)

- Requirement refs: AC-5 · type: boundary · layer: ui
- Failing step: Then the transfer is refused (the page does not show "Transfer Complete!") — bounded 5 s wait for the confirmation
- Error: `[REQ AC-5] page does not show "Transfer Complete!"`
- Expected: `false`
- Received: `true`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/15453` → **200**
  - request body: ``
  - response body: `{"id":15453,"customerId":13322,"type":"CHECKING","balance":100}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-602d9--the-Transfer-Funds-page-0--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/05-eval/artifacts/PB-3-tests-pb-3-PB-3-Trans-602d9--the-Transfer-Funds-page-0--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-602d9--the-Transfer-Funds-page-0--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/15453 → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: false
- Received: true

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — AC-5 (story.md#L58-L66, re-confirmed by the PO at L91) requires 0 and -10.00 to be refused on the page and through the service with balances unchanged. Live, the page shows 'Transfer Complete!' ('$0.00 has been transferred…', '-$10.00 has been transferred…') and the service answers 200 'Successfully transferred $0 …' / 'Successfully transferred $-10.00 …'. For -10.00 the balance of A rises by 10.00 and B falls by 10.00 (money moved in reverse). Declared endpoint, correct parameters; nothing script-side.

## SCN-005.2: A zero or negative amount is refused on the Transfer Funds page (-10.00)

- Requirement refs: AC-5 · type: boundary · layer: ui
- Failing step: Then the transfer is refused (the page does not show "Transfer Complete!") — bounded 5 s wait for the confirmation
- Error: `[REQ AC-5] page does not show "Transfer Complete!"`
- Expected: `false`
- Received: `true`
- Relevant API exchange (#2 of 2): `GET https://parabank.parasoft.com/parabank/services/bank/accounts/15897` → **200**
  - request body: ``
  - response body: `{"id":15897,"customerId":13544,"type":"CHECKING","balance":90}`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-bb4eb-Transfer-Funds-page--10-00--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/05-eval/artifacts/PB-3-tests-pb-3-PB-3-Trans-bb4eb-Transfer-Funds-page--10-00--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-bb4eb-Transfer-Funds-page--10-00--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /parabank/services/bank/accounts/15897 → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: false
- Received: true
- Also failed: [REQ AC-5] GET /accounts/<A> balance unchanged — expected 415.5, received 425.5
- Also failed: [REQ AC-5] GET /accounts/<B> balance unchanged — expected 100, received 90

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — AC-5 (story.md#L58-L66, re-confirmed by the PO at L91) requires 0 and -10.00 to be refused on the page and through the service with balances unchanged. Live, the page shows 'Transfer Complete!' ('$0.00 has been transferred…', '-$10.00 has been transferred…') and the service answers 200 'Successfully transferred $0 …' / 'Successfully transferred $-10.00 …'. For -10.00 the balance of A rises by 10.00 and B falls by 10.00 (money moved in reverse). Declared endpoint, correct parameters; nothing script-side.

## SCN-006.1: A zero or negative amount is refused by the REST service (0)

- Requirement refs: AC-5 · type: boundary · layer: api
- Failing step: Then the transfer is refused (the service does not answer with the success confirmation of AC-2)
- Error: `[REQ AC-5] POST /transfer does not answer with the success confirmation`
- Expected: `not /^\s*Successfully transferred/`
- Received: `"Successfully transferred $0 from account #16230 to account #16341"`
- Relevant API exchange (#1 of 3): `POST https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=16230&toAccountId=16341&amount=0` → **200**
  - request body: ``
  - response body: `Successfully transferred $0 from account #16230 to account #16341`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-47981-used-by-the-REST-service-0--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/05-eval/artifacts/PB-3-tests-pb-3-PB-3-Trans-47981-used-by-the-REST-service-0--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-47981-used-by-the-REST-service-0--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /parabank/services/bank/transfer → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: not /^\s*Successfully transferred/
- Received: "Successfully transferred $0 from account #16230 to account #16341"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — AC-5 (story.md#L58-L66, re-confirmed by the PO at L91) requires 0 and -10.00 to be refused on the page and through the service with balances unchanged. Live, the page shows 'Transfer Complete!' ('$0.00 has been transferred…', '-$10.00 has been transferred…') and the service answers 200 'Successfully transferred $0 …' / 'Successfully transferred $-10.00 …'. For -10.00 the balance of A rises by 10.00 and B falls by 10.00 (money moved in reverse). Declared endpoint, correct parameters; nothing script-side.

## SCN-006.2: A zero or negative amount is refused by the REST service (-10.00)

- Requirement refs: AC-5 · type: boundary · layer: api
- Failing step: Then the transfer is refused (the service does not answer with the success confirmation of AC-2)
- Error: `[REQ AC-5] POST /transfer does not answer with the success confirmation`
- Expected: `not /^\s*Successfully transferred/`
- Received: `"Successfully transferred $-10.00 from account #16674 to account #16785"`
- Relevant API exchange (#1 of 3): `POST https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=16674&toAccountId=16785&amount=-10.00` → **200**
  - request body: ``
  - response body: `Successfully transferred $-10.00 from account #16674 to account #16785`
- Evidence: [screenshot](artifacts/PB-3-tests-pb-3-PB-3-Trans-44d19-by-the-REST-service--10-00--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-3/runs/05-eval/artifacts/PB-3-tests-pb-3-PB-3-Trans-44d19-by-the-REST-service--10-00--chromium-retry1/trace.zip` · [error-context](artifacts/PB-3-tests-pb-3-PB-3-Trans-44d19-by-the-REST-service--10-00--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /parabank/services/bank/transfer → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: not /^\s*Successfully transferred/
- Received: "Successfully transferred $-10.00 from account #16674 to account #16785"
- Also failed: [REQ AC-5] GET /accounts/<A> balance unchanged — expected 415.5, received 425.5
- Also failed: [REQ AC-5] GET /accounts/<B> balance unchanged — expected 100, received 90

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — AC-5 (story.md#L58-L66, re-confirmed by the PO at L91) requires 0 and -10.00 to be refused on the page and through the service with balances unchanged. Live, the page shows 'Transfer Complete!' ('$0.00 has been transferred…', '-$10.00 has been transferred…') and the service answers 200 'Successfully transferred $0 …' / 'Successfully transferred $-10.00 …'. For -10.00 the balance of A rises by 10.00 and B falls by 10.00 (money moved in reverse). Declared endpoint, correct parameters; nothing script-side.
