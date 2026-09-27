# Triage — DEMO-404 / run 05-rerun

Generated 2026-09-26T17:24:19.909Z

**3/15 passed**, 5 failed, 7 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-002.1 | negative | AC-2 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-002.2 | negative | AC-2 | flaky | FLAKY | medium | ⏳ pending |
| SCN-003 | functional | AC-3 | flaky | FLAKY | medium | ⏳ pending |
| SCN-004 | security | AC-3 | passed | - | - | - |
| SCN-005 | functional | AC-4 | flaky | FLAKY | medium | ⏳ pending |
| SCN-006 | functional | AC-5 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-007 | functional | AC-6 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-008.1 | functional | AC-7 | flaky | FLAKY | medium | ⏳ pending |
| SCN-008.2 | functional | AC-7 | passed | - | - | - |
| SCN-008.3 | functional | AC-7 | flaky | FLAKY | medium | ⏳ pending |
| SCN-009 | functional | AC-8 | flaky | FLAKY | medium | ⏳ pending |
| SCN-010 | functional | AC-9 | passed | - | - | - |
| SCN-011.1 | functional | AC-10 | flaky | FLAKY | medium | ⏳ pending |
| SCN-011.2 | functional | AC-10 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |

## SCN-001: The trainee signs in to the Secure Area

- Requirement refs: AC-1 · type: functional · layer: ui
- Failing step: When I sign in with the training account
- Error: `TimeoutError: locator.fill: Timeout 10000ms exceeded.`
- Locator: `getByLabel('Username')`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-f3bed-signs-in-to-the-Secure-Area-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-f3bed-signs-in-to-the-Secure-Area-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-f3bed-signs-in-to-the-Secure-Area-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByLabel('Username')
- Target text "Username" is absent from the failure-time snapshot.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-002.1: Wrong credentials are refused with a specific message (an unknown username)

- Requirement refs: AC-2 · type: negative · layer: ui
- Failing step: When I sign in with an unknown username
- Error: `TimeoutError: locator.fill: Timeout 10000ms exceeded.`
- Locator: `getByLabel('Username')`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-58e28-essage-an-unknown-username--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-58e28-essage-an-unknown-username--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-58e28-essage-an-unknown-username--chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByLabel('Username')
- Target text "Username" is absent from the failure-time snapshot.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-002.2: Wrong credentials are refused with a specific message (the trainee with a wrong password)

- Requirement refs: AC-2 · type: negative · layer: ui
- Failing step: When I sign in with the trainee with a wrong password
- Error: `TimeoutError: locator.click: Timeout 10000ms exceeded.`
- Locator: `getByRole('button', { name: 'Login' })`
- Evidence: trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

## SCN-003: Logging out returns to the Login page

- Requirement refs: AC-3 · type: functional · layer: ui
- Failing step: Given I am signed in as the trainee
- Error: `TimeoutError: locator.click: Timeout 10000ms exceeded.`
- Locator: `getByRole('button', { name: 'Login' })`
- Evidence: trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-958d7-t-returns-to-the-Login-page-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-958d7-t-returns-to-the-Login-page-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

## SCN-005: Checkboxes start in the documented state and toggle

- Requirement refs: AC-4 · type: functional · layer: ui
- Failing step: Then checkbox 1 is unchecked and checkbox 2 is checked
- Error: `[REQ AC-4] checkbox 1 initially unchecked`
- Locator: `getByRole('checkbox').first()`
- Expected: `not checked`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-c88ec-documented-state-and-toggle-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-c88ec-documented-state-and-toggle-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-c88ec-documented-state-and-toggle-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.
- Also failed: [REQ AC-4] checkbox 2 initially checked — expected checked, received undefined
- Also failed: TimeoutError: locator.click: Timeout 10000ms exceeded.

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

## SCN-006: The dropdown offers the documented options

- Requirement refs: AC-5 · type: functional · layer: ui
- Failing step: Then the options are "Please select an option", "Option 1" and "Option 2"
- Error: `[REQ AC-5] dropdown options`
- Locator: `getByRole('combobox').locator('option')`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-ecce7-fers-the-documented-options-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-ecce7-fers-the-documented-options-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-ecce7-fers-the-documented-options-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByRole('combobox').locator('option')

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-007: Dynamically loaded content appears within 10 seconds

- Requirement refs: AC-6 · type: functional · layer: ui
- Failing step: Then "Hello World!" is rendered within 10 seconds
- Error: `[REQ AC-6] "Hello World!" within 10 s`
- Locator: `getByText('Hello World!')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-ea8ed-t-appears-within-10-seconds-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-ea8ed-t-appears-within-10-seconds-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-ea8ed-t-appears-within-10-seconds-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByText('Hello World!')
- Target text "Hello World!" is absent from the failure-time snapshot.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-008.1: JavaScript dialogs report the user's choice (alert)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: When I accept the JS alert
- Error: `TimeoutError: locator.click: Timeout 10000ms exceeded.`
- Locator: `getByRole('button', { name: 'Click for JS Alert' })`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-0b685-rt-the-user-s-choice-alert--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-0b685-rt-the-user-s-choice-alert--chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-0b685-rt-the-user-s-choice-alert--chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

## SCN-008.3: JavaScript dialogs report the user's choice (prompt)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: When I accept the JS prompt
- Error: `TimeoutError: locator.click: Timeout 10000ms exceeded.`
- Locator: `getByRole('button', { name: 'Click for JS Prompt' })`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-b960b-t-the-user-s-choice-prompt--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-b960b-t-the-user-s-choice-prompt--chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-b960b-t-the-user-s-choice-prompt--chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

## SCN-009: One click on "Last Name" sorts the first table ascending

- Requirement refs: AC-8 · type: functional · layer: ui
- Failing step: -
- Error: `Test timeout of 60000ms exceeded.`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-eb46d-s-the-first-table-ascending-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-eb46d-s-the-first-table-ascending-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-eb46d-s-the-first-table-ascending-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.
- Also failed: locator.allInnerTexts: Target page, context or browser has been closed

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

## SCN-011.1: Key presses are reported (Tab)

- Requirement refs: AC-10 · type: functional · layer: ui
- Failing step: Then I see "You entered: TAB"
- Error: `Test timeout of 60000ms exceeded.`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-57bed-y-presses-are-reported-Tab--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-57bed-y-presses-are-reported-Tab--chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-57bed-y-presses-are-reported-Tab--chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.
- Also failed: [REQ AC-10] Tab reported — expected "You entered: TAB", received ""

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

## SCN-011.2: Key presses are reported (A)

- Requirement refs: AC-10 · type: functional · layer: ui
- Failing step: -
- Error: `Test timeout of 60000ms exceeded.`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-bf1f8-Key-presses-are-reported-A--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/05-rerun/artifacts/DEMO-404-tests-demo-404-DE-bf1f8-Key-presses-are-reported-A--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-bf1f8-Key-presses-are-reported-A--chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Whole-test timeout without a specific assertion.
- Also failed: [REQ AC-10] A reported — expected "You entered: A", received ""

Next: Open the trace; find the last completed step; re-inspect live.
