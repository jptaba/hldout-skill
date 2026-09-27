# Triage — DEMO-404 / run 02-harden-stability

Generated 2026-09-26T16:26:54.744Z

**5/15 passed**, 0 failed, 10 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | flaky | FLAKY | medium | ⏳ pending |
| SCN-002.1 | negative | AC-2 | passed | - | - | - |
| SCN-002.2 | negative | AC-2 | flaky | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-003 | functional | AC-3 | passed | - | - | - |
| SCN-004 | security | AC-3 | flaky | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-005 | functional | AC-4 | flaky | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-006 | functional | AC-5 | passed | - | - | - |
| SCN-007 | functional | AC-6 | flaky | FLAKY | medium | ⏳ pending |
| SCN-008.1 | functional | AC-7 | flaky | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-008.2 | functional | AC-7 | flaky | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-008.3 | functional | AC-7 | passed | - | - | - |
| SCN-009 | functional | AC-8 | flaky | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-010 | functional | AC-9 | flaky | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-011.1 | functional | AC-10 | passed | - | - | - |
| SCN-011.2 | functional | AC-10 | flaky | FLAKY | medium | ⏳ pending |

## SCN-001: The trainee signs in to the Secure Area

- Requirement refs: AC-1 · type: functional · layer: ui
- Failing step: Then I am on the Secure Area with the heading "Secure Area"
- Repeats: failed **2 of 8**
- Error: `[REQ AC-1] "Secure Area" heading`
- Locator: `getByRole('heading', { name: 'Secure Area', exact: true })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-f3bed-signs-in-to-the-Secure-Area-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-f3bed-signs-in-to-the-Secure-Area-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-f3bed-signs-in-to-the-Secure-Area-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 8 repeats — nondeterministic.
- Failure cause seen: SCRIPT_DEFECT: [REQ AC-1] "Secure Area" heading
- Failure cause seen: ENVIRONMENT_ISSUE: page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/login

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-002.2: Wrong credentials are refused with a specific message (the trainee with a wrong password)

- Requirement refs: AC-2 · type: negative · layer: ui
- Failing step: Given I am on the Login page
- Repeats: failed **1 of 8**
- Error: `page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/login`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium-repeat2/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium-repeat2/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium-repeat2/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- Failed 1 of 8 repeats, every time with a network/availability error — the environment, not the test or the app.
- ENVIRONMENT_ISSUE: page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/login

Next: Re-run at lower load (fewer workers/repeats) or when the AUT is healthy.

## SCN-004: The Secure Area is not reachable while signed out

- Requirement refs: AC-3 · type: security · layer: ui
- Failing step: When I open /secure without signing in
- Repeats: failed **1 of 8**
- Error: `page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/secure`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-33f4b--reachable-while-signed-out-chromium-repeat4/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-33f4b--reachable-while-signed-out-chromium-repeat4/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-33f4b--reachable-while-signed-out-chromium-repeat4/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- Failed 1 of 8 repeats, every time with a network/availability error — the environment, not the test or the app.
- ENVIRONMENT_ISSUE: page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/secure

Next: Re-run at lower load (fewer workers/repeats) or when the AUT is healthy.

## SCN-005: Checkboxes start in the documented state and toggle

- Requirement refs: AC-4 · type: functional · layer: ui
- Failing step: Given I am on the Checkboxes page
- Repeats: failed **1 of 8**
- Error: `page.goto: net::ERR_CONNECTION_RESET at https://the-internet.herokuapp.com/checkboxes`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-c88ec-documented-state-and-toggle-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-c88ec-documented-state-and-toggle-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-c88ec-documented-state-and-toggle-chromium/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- Failed 1 of 8 repeats, every time with a network/availability error — the environment, not the test or the app.
- ENVIRONMENT_ISSUE: page.goto: net::ERR_CONNECTION_RESET at https://the-internet.herokuapp.com/checkboxes

Next: Re-run at lower load (fewer workers/repeats) or when the AUT is healthy.

## SCN-007: Dynamically loaded content appears within 10 seconds

- Requirement refs: AC-6 · type: functional · layer: ui
- Failing step: Then "Hello World!" is rendered within 10 seconds
- Repeats: failed **2 of 8**
- Error: `[REQ AC-6] "Hello World!" within 10 s`
- Locator: `getByText('Hello World!')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-ea8ed-t-appears-within-10-seconds-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-ea8ed-t-appears-within-10-seconds-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-ea8ed-t-appears-within-10-seconds-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 8 repeats — nondeterministic.
- Failure cause seen: NEEDS_INVESTIGATION: [REQ AC-6] "Hello World!" within 10 s
- Failure cause seen: ENVIRONMENT_ISSUE: page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/dynamic_loading/2

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-008.1: JavaScript dialogs report the user's choice (alert)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Given I am on the JavaScript Alerts page
- Repeats: failed **1 of 8**
- Error: `page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/javascript_alerts`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-0b685-rt-the-user-s-choice-alert--chromium-repeat3/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-0b685-rt-the-user-s-choice-alert--chromium-repeat3/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-0b685-rt-the-user-s-choice-alert--chromium-repeat3/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- Failed 1 of 8 repeats, every time with a network/availability error — the environment, not the test or the app.
- ENVIRONMENT_ISSUE: page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/javascript_alerts

Next: Re-run at lower load (fewer workers/repeats) or when the AUT is healthy.

## SCN-008.2: JavaScript dialogs report the user's choice (confirm)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Given I am on the JavaScript Alerts page
- Repeats: failed **2 of 8**
- Error: `page.goto: net::ERR_CONNECTION_RESET at https://the-internet.herokuapp.com/javascript_alerts`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-252e7--the-user-s-choice-confirm--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-252e7--the-user-s-choice-confirm--chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-252e7--the-user-s-choice-confirm--chromium/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- Failed 2 of 8 repeats, every time with a network/availability error — the environment, not the test or the app.
- ENVIRONMENT_ISSUE: page.goto: net::ERR_CONNECTION_RESET at https://the-internet.herokuapp.com/javascript_alerts
- ENVIRONMENT_ISSUE: page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/javascript_alerts

Next: Re-run at lower load (fewer workers/repeats) or when the AUT is healthy.

## SCN-009: One click on "Last Name" sorts the first table ascending

- Requirement refs: AC-8 · type: functional · layer: ui
- Failing step: Given I am on the Data Tables page
- Repeats: failed **1 of 8**
- Error: `page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/tables`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-eb46d-s-the-first-table-ascending-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-eb46d-s-the-first-table-ascending-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-eb46d-s-the-first-table-ascending-chromium/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- Failed 1 of 8 repeats, every time with a network/availability error — the environment, not the test or the app.
- ENVIRONMENT_ISSUE: page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/tables

Next: Re-run at lower load (fewer workers/repeats) or when the AUT is healthy.

## SCN-010: Elements are added and removed one at a time

- Requirement refs: AC-9 · type: functional · layer: ui
- Failing step: Given I am on the Add/Remove Elements page
- Repeats: failed **1 of 8**
- Error: `page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/add_remove_elements/`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-3d4c3-d-and-removed-one-at-a-time-chromium-repeat2/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-3d4c3-d-and-removed-one-at-a-time-chromium-repeat2/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-3d4c3-d-and-removed-one-at-a-time-chromium-repeat2/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- Failed 1 of 8 repeats, every time with a network/availability error — the environment, not the test or the app.
- ENVIRONMENT_ISSUE: page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/add_remove_elements/

Next: Re-run at lower load (fewer workers/repeats) or when the AUT is healthy.

## SCN-011.2: Key presses are reported (A)

- Requirement refs: AC-10 · type: functional · layer: ui
- Failing step: Given I am on the Key Presses page
- Repeats: failed **2 of 8**
- Error: `page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/key_presses`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-bf1f8-Key-presses-are-reported-A--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/02-harden-stability/artifacts/DEMO-404-tests-demo-404-DE-bf1f8-Key-presses-are-reported-A--chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-bf1f8-Key-presses-are-reported-A--chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 8 repeats — nondeterministic.
- Failure cause seen: ENVIRONMENT_ISSUE: page.goto: net::ERR_EMPTY_RESPONSE at https://the-internet.herokuapp.com/key_presses
- Failure cause seen: NEEDS_INVESTIGATION: [REQ AC-10] A reported

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.
