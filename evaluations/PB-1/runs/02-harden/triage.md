# Triage — PB-1 / run 02-harden

Generated 2026-09-27T05:51:45.528Z

**0/14 passed**, 1 failed, 13 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | negative | AC-1 | flaky | FLAKY | medium | ⏳ pending |
| SCN-002 | negative | AC-2 | flaky | FLAKY | medium | ⏳ pending |
| SCN-003 | integration | AC-2 | flaky | FLAKY | medium | ⏳ pending |
| SCN-004 | functional | AC-3 | flaky | FLAKY | medium | ⏳ pending |
| SCN-005 | negative | AC-4 | flaky | FLAKY | medium | ⏳ pending |
| SCN-006 | integration | AC-4 | flaky | FLAKY | medium | ⏳ pending |
| SCN-007 | negative | AC-5 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-008 | negative | AC-5 | flaky | FLAKY | medium | ⏳ pending |
| SCN-009 | functional | AC-6 | flaky | FLAKY | medium | ⏳ pending |
| SCN-010 | functional | AC-7 | flaky | FLAKY | medium | ⏳ pending |
| SCN-011 | contract | AC-7 | flaky | FLAKY | medium | ⏳ pending |
| SCN-012 | negative | AC-8 | flaky | FLAKY | medium | ⏳ pending |
| SCN-013 | integration | AC-9 | flaky | FLAKY | medium | ⏳ pending |
| SCN-014 | integration | AC-9 | flaky | FLAKY | medium | ⏳ pending |

## SCN-001: Submitting an empty registration form shows a required message next to every required field

- Requirement refs: AC-1 · type: negative · layer: ui
- Failing step: Given I am on the registration page register.htm
- Repeats: failed **1 of 3**
- Error: `registration form shown (precondition)`
- Locator: `getByRole('button', { name: 'Register', exact: true })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-1af1c-ext-to-every-required-field-chromium-retry1-repeat2/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-1af1c-ext-to-every-required-field-chromium-retry1-repeat2/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-1af1c-ext-to-every-required-field-chromium-retry1-repeat2/error-context.md)

**Auto: FLAKY (medium)**

- Failed 1 of 3 repeats — nondeterministic.
- Failure cause seen: NEEDS_INVESTIGATION: registration form shown (precondition)

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-002: Registering with a Confirm that differs from Password shows "Passwords did not match."

- Requirement refs: AC-2 · type: negative · layer: ui
- Failing step: Given I am on the registration page register.htm
- Repeats: failed **1 of 3**
- Error: `registration form shown (precondition)`
- Locator: `getByRole('button', { name: 'Register', exact: true })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-ffc84-ws-Passwords-did-not-match--chromium-retry1-repeat2/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-ffc84-ws-Passwords-did-not-match--chromium-retry1-repeat2/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-ffc84-ws-Passwords-did-not-match--chromium-retry1-repeat2/error-context.md)

**Auto: FLAKY (medium)**

- Failed 1 of 3 repeats — nondeterministic.
- Failure cause seen: NEEDS_INVESTIGATION: registration form shown (precondition)

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-003: A registration rejected for mismatched passwords creates no customer

- Requirement refs: AC-2 · type: integration · layer: e2e
- Failing step: [SEED] registration with mismatched Confirm submitted via register.htm
- Repeats: failed **1 of 3**
- Error: `[SEED] registration with mismatched Confirm submitted via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-35900-sswords-creates-no-customer-chromium-retry1-repeat2/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-35900-sswords-creates-no-customer-chromium-retry1-repeat2/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-35900-sswords-creates-no-customer-chromium-retry1-repeat2/error-context.md)

**Auto: FLAKY (medium)**

- Failed 1 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] registration with mismatched Confirm submitted via register.htm: precondition could not be es

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-004: A complete, valid registration welcomes the new customer and signs them in

- Requirement refs: AC-3 · type: functional · layer: ui
- Failing step: Then the page shows the heading "Welcome <username>"
- Repeats: failed **2 of 3**
- Error: `[REQ AC-3] heading Welcome <username>`
- Locator: `getByRole('heading', { name: 'Welcome pb1hxebz0t102jd9' })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-51cd5--customer-and-signs-them-in-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-51cd5--customer-and-signs-them-in-chromium/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-51cd5--customer-and-signs-them-in-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: FLAKY: [REQ AC-3] heading Welcome <username>
- Failure cause seen: NEEDS_INVESTIGATION: registration form shown (precondition)

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-005: Registering with a user name that is already taken shows "This username already exists."

- Requirement refs: AC-4 · type: negative · layer: ui
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **1 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-e475d-is-username-already-exists--chromium-retry1-repeat2/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-e475d-is-username-already-exists--chromium-retry1-repeat2/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-e475d-is-username-already-exists--chromium-retry1-repeat2/error-context.md)

**Auto: FLAKY (medium)**

- Failed 1 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: T

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-006: A duplicate registration does not change the existing customer

- Requirement refs: AC-4 · type: integration · layer: e2e
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **2 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-c4d3f-hange-the-existing-customer-chromium-retry1-repeat1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-c4d3f-hange-the-existing-customer-chromium-retry1-repeat1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-c4d3f-hange-the-existing-customer-chromium-retry1-repeat1/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: T

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-007: Signing in with a wrong password shows the "Error!" page

- Requirement refs: AC-5 · type: negative · layer: ui
- Failing step: And it says "The username and password could not be verified."
- Repeats: failed **3 of 3**
- Error: `[REQ AC-5] could not be verified`
- Locator: `getByText('The username and password could not be verified.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByText('The username and password could not be verified.')
- Target text "The username and password could not be verified." is absent from the failure-time snapshot.
- Failed all 3 repeats with 2 different causes:
- NEEDS_INVESTIGATION: [REQ AC-5] could not be verified
- BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: T

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-008: Signing in with both fields empty asks for a user name and password

- Requirement refs: AC-5 · type: negative · layer: ui
- Failing step: Given I am on the home page as a signed-out visitor
- Repeats: failed **2 of 3**
- Error: `Customer Login panel shown (precondition)`
- Locator: `getByRole('button', { name: 'Log In', exact: true })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-24df0-or-a-user-name-and-password-chromium-retry1-repeat1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-24df0-or-a-user-name-and-password-chromium-retry1-repeat1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-24df0-or-a-user-name-and-password-chromium-retry1-repeat1/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: NEEDS_INVESTIGATION: Customer Login panel shown (precondition)

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-009: Signing in opens the Accounts Overview and Log Out returns to the home page

- Requirement refs: AC-6 · type: functional · layer: ui
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **2 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-b99fc-ut-returns-to-the-home-page-chromium-retry1-repeat1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-b99fc-ut-returns-to-the-home-page-chromium-retry1-repeat1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-b99fc-ut-returns-to-the-home-page-chromium-retry1-repeat1/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: T

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-010: REST login with valid credentials returns the registered customer as JSON

- Requirement refs: AC-7 · type: functional · layer: api
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **2 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-b5574-registered-customer-as-JSON-chromium-retry1-repeat1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-b5574-registered-customer-as-JSON-chromium-retry1-repeat1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-b5574-registered-customer-as-JSON-chromium-retry1-repeat1/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: T

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-011: REST login without Accept: application/json returns XML with a customer root element

- Requirement refs: AC-7 · type: contract · layer: api
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **2 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-78588-ith-a-customer-root-element-chromium-retry1-repeat1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-78588-ith-a-customer-root-element-chromium-retry1-repeat1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-78588-ith-a-customer-root-element-chromium-retry1-repeat1/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: T

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-012: REST login with a wrong password answers 400 "Invalid username and/or password"

- Requirement refs: AC-8 · type: negative · layer: api
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **2 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-d7574-d-username-and-or-password--chromium-retry1-repeat1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-d7574-d-username-and-or-password--chromium-retry1-repeat1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-d7574-d-username-and-or-password--chromium-retry1-repeat1/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: T

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-013: The customer and accounts services return the customer registered through the page

- Requirement refs: AC-9 · type: integration · layer: e2e
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **2 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-a28c3-registered-through-the-page-chromium-retry1-repeat1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-a28c3-registered-through-the-page-chromium-retry1-repeat1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-a28c3-registered-through-the-page-chromium-retry1-repeat1/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: T

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-014: The customer and accounts services match the login response and the Accounts Overview exactly

- Requirement refs: AC-9 · type: integration · layer: e2e
- Failing step: [SEED] customer registered via register.htm
- Repeats: failed **2 of 3**
- Error: `[SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `locator('[id="customer.firstName"]')`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-eca54-e-Accounts-Overview-exactly-chromium-retry1-repeat1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/02-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-eca54-e-Accounts-Overview-exactly-chromium-retry1-repeat1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-eca54-e-Accounts-Overview-exactly-chromium-retry1-repeat1/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: BLOCKED: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: T

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.
