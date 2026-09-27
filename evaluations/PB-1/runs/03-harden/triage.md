# Triage — PB-1 / run 03-harden

Generated 2026-09-27T05:56:15.039Z

**10/14 passed**, 1 failed, 3 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | negative | AC-1 | passed | - | - | - |
| SCN-002 | negative | AC-2 | passed | - | - | - |
| SCN-003 | integration | AC-2 | passed | - | - | - |
| SCN-004 | functional | AC-3 | passed | - | - | - |
| SCN-005 | negative | AC-4 | flaky | FLAKY | medium | ⏳ pending |
| SCN-006 | integration | AC-4 | passed | - | - | - |
| SCN-007 | negative | AC-5 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-008 | negative | AC-5 | passed | - | - | - |
| SCN-009 | functional | AC-6 | passed | - | - | - |
| SCN-010 | functional | AC-7 | flaky | FLAKY | medium | ⏳ pending |
| SCN-011 | contract | AC-7 | passed | - | - | - |
| SCN-012 | negative | AC-8 | passed | - | - | - |
| SCN-013 | integration | AC-9 | passed | - | - | - |
| SCN-014 | integration | AC-9 | flaky | FLAKY | medium | ⏳ pending |

## SCN-005: Registering with a user name that is already taken shows "This username already exists."

- Requirement refs: AC-4 · type: negative · layer: ui
- Failing step: Then "This username already exists." is shown next to Username
- Repeats: failed **1 of 3**
- Error: `[REQ AC-4] "This username already exists." next to Username`
- Locator: `locator('tr').filter({ has: locator('[id="customer.username"]') })`
- Expected: `"This username already exists."`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-e475d-is-username-already-exists--chromium-retry1-repeat1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/03-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-e475d-is-username-already-exists--chromium-retry1-repeat1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-e475d-is-username-already-exists--chromium-retry1-repeat1/error-context.md)

**Auto: FLAKY (medium)**

- Failed 1 of 3 repeats — nondeterministic.
- Failure cause seen: NEEDS_INVESTIGATION: [REQ AC-4] "This username already exists." next to Username

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-007: Signing in with a wrong password shows the "Error!" page

- Requirement refs: AC-5 · type: negative · layer: ui
- Failing step: And it says "The username and password could not be verified."
- Repeats: failed **3 of 3**
- Error: `[REQ AC-5] could not be verified`
- Locator: `getByText('The username and password could not be verified.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/03-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByText('The username and password could not be verified.')
- Target text "The username and password could not be verified." is absent from the failure-time snapshot.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-010: REST login with valid credentials returns the registered customer as JSON

- Requirement refs: AC-7 · type: functional · layer: api
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **1 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — registration succeeded (precondition)`
- Locator: `getByText('Your account was created successfully. You are now logged in.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-b5574-registered-customer-as-JSON-chromium-retry1-repeat2/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/03-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-b5574-registered-customer-as-JSON-chromium-retry1-repeat2/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-b5574-registered-customer-as-JSON-chromium-retry1-repeat2/error-context.md)

**Auto: FLAKY (medium)**

- Failed 1 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — registration su

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-014: The customer and accounts services match the login response and the Accounts Overview exactly

- Requirement refs: AC-9 · type: integration · layer: e2e
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **1 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — registration succeeded (precondition)`
- Locator: `getByText('Your account was created successfully. You are now logged in.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-eca54-e-Accounts-Overview-exactly-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/03-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-eca54-e-Accounts-Overview-exactly-chromium/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-eca54-e-Accounts-Overview-exactly-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed 1 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — registration su

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.
