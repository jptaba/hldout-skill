# Triage — DEMO-404 / run 04-eval

Generated 2026-09-26T16:36:18.572Z

> ⚠️ **Environment:** AUT degraded around this run: https://the-internet.herokuapp.com/ took 8891 ms; 5 different tests timed out.

**8/15 passed**, 7 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002.1 | negative | AC-2 | passed | - | - | - |
| SCN-002.2 | negative | AC-2 | failed | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-003 | functional | AC-3 | passed | - | - | - |
| SCN-004 | security | AC-3 | passed | - | - | - |
| SCN-005 | functional | AC-4 | passed | - | - | - |
| SCN-006 | functional | AC-5 | passed | - | - | - |
| SCN-007 | functional | AC-6 | failed | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-008.1 | functional | AC-7 | failed | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-008.2 | functional | AC-7 | passed | - | - | - |
| SCN-008.3 | functional | AC-7 | passed | - | - | - |
| SCN-009 | functional | AC-8 | failed | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-010 | functional | AC-9 | failed | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-011.1 | functional | AC-10 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-011.2 | functional | AC-10 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |

## SCN-002.2: Wrong credentials are refused with a specific message (the trainee with a wrong password)

- Requirement refs: AC-2 · type: negative · layer: ui
- Failing step: -
- Error: `Test timeout of 60000ms exceeded.`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/04-eval/artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium-retry1/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- AUT degraded around this run: https://the-internet.herokuapp.com/ took 8891 ms; 5 different tests timed out.
- (before correlation) Whole-test timeout without a specific assertion.
- (before correlation) Also failed: locator.fill: Target page, context or browser has been closed

Next: Re-run when the healthcheck is fast again. If the same tests still time out on a healthy AUT, investigate them individually.

## SCN-007: Dynamically loaded content appears within 10 seconds

- Requirement refs: AC-6 · type: functional · layer: ui
- Failing step: -
- Error: `Test timeout of 60000ms exceeded.`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-ea8ed-t-appears-within-10-seconds-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/04-eval/artifacts/DEMO-404-tests-demo-404-DE-ea8ed-t-appears-within-10-seconds-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-ea8ed-t-appears-within-10-seconds-chromium-retry1/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- AUT degraded around this run: https://the-internet.herokuapp.com/ took 8891 ms; 5 different tests timed out.
- (before correlation) Whole-test timeout without a specific assertion.
- (before correlation) Also failed: locator.click: Test timeout of 60000ms exceeded.

Next: Re-run when the healthcheck is fast again. If the same tests still time out on a healthy AUT, investigate them individually.

## SCN-008.1: JavaScript dialogs report the user's choice (alert)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: When I accept the JS alert
- Error: `TimeoutError: locator.click: Timeout 10000ms exceeded.`
- Locator: `getByRole('button', { name: 'Click for JS Alert' })`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-0b685-rt-the-user-s-choice-alert--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/04-eval/artifacts/DEMO-404-tests-demo-404-DE-0b685-rt-the-user-s-choice-alert--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-0b685-rt-the-user-s-choice-alert--chromium-retry1/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- AUT degraded around this run: https://the-internet.herokuapp.com/ took 8891 ms; 5 different tests timed out.
- (before correlation) Target not found: getByRole('button', { name: 'Click for JS Alert' })
- (before correlation) Target text "Click for JS Alert" is absent from the failure-time snapshot.

Next: Re-run when the healthcheck is fast again. If the same tests still time out on a healthy AUT, investigate them individually.

## SCN-009: One click on "Last Name" sorts the first table ascending

- Requirement refs: AC-8 · type: functional · layer: ui
- Failing step: When I click the "Last Name" header of the first table once
- Error: `TimeoutError: locator.click: Timeout 10000ms exceeded.`
- Locator: `getByRole('table').first().getByRole('columnheader', { name: 'Last Name' })`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-eb46d-s-the-first-table-ascending-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/04-eval/artifacts/DEMO-404-tests-demo-404-DE-eb46d-s-the-first-table-ascending-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-eb46d-s-the-first-table-ascending-chromium-retry1/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- AUT degraded around this run: https://the-internet.herokuapp.com/ took 8891 ms; 5 different tests timed out.
- (before correlation) Target not found: getByRole('table').first().getByRole('columnheader', { name: 'Last Name' })
- (before correlation) Target text "Last Name" is absent from the failure-time snapshot.

Next: Re-run when the healthcheck is fast again. If the same tests still time out on a healthy AUT, investigate them individually.

## SCN-010: Elements are added and removed one at a time

- Requirement refs: AC-9 · type: functional · layer: ui
- Failing step: -
- Error: `Test timeout of 60000ms exceeded.`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-3d4c3-d-and-removed-one-at-a-time-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/04-eval/artifacts/DEMO-404-tests-demo-404-DE-3d4c3-d-and-removed-one-at-a-time-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-3d4c3-d-and-removed-one-at-a-time-chromium-retry1/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- AUT degraded around this run: https://the-internet.herokuapp.com/ took 8891 ms; 5 different tests timed out.
- (before correlation) Whole-test timeout without a specific assertion.
- (before correlation) Also failed: locator.click: Test timeout of 60000ms exceeded.

Next: Re-run when the healthcheck is fast again. If the same tests still time out on a healthy AUT, investigate them individually.

## SCN-011.1: Key presses are reported (Tab)

- Requirement refs: AC-10 · type: functional · layer: ui
- Failing step: Then I see "You entered: TAB"
- Error: `[REQ AC-10] Tab reported`
- Locator: `locator('#result')`
- Expected: `"You entered: TAB"`
- Received: `""`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-57bed-y-presses-are-reported-Tab--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/04-eval/artifacts/DEMO-404-tests-demo-404-DE-57bed-y-presses-are-reported-Tab--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-57bed-y-presses-are-reported-Tab--chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Requirement assertion [REQ AC-10] failed on a located element.
- Expected: "You entered: TAB"
- Received: ""
- The located element has NO text at all — the locator may be matching the wrong (e.g. empty placeholder/live-region) element.

Next: Probe the locator at this step: if it matches an empty/unrelated element while the expected text is elsewhere → SCRIPT; if the expected text is truly absent → APPLICATION.

## SCN-011.2: Key presses are reported (A)

- Requirement refs: AC-10 · type: functional · layer: ui
- Failing step: Then I see "You entered: A"
- Error: `[REQ AC-10] A reported`
- Locator: `locator('#result')`
- Expected: `"You entered: A"`
- Received: `""`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-bf1f8-Key-presses-are-reported-A--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/04-eval/artifacts/DEMO-404-tests-demo-404-DE-bf1f8-Key-presses-are-reported-A--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-bf1f8-Key-presses-are-reported-A--chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Requirement assertion [REQ AC-10] failed on a located element.
- Expected: "You entered: A"
- Received: ""
- The located element has NO text at all — the locator may be matching the wrong (e.g. empty placeholder/live-region) element.

Next: Probe the locator at this step: if it matches an empty/unrelated element while the expected text is elsewhere → SCRIPT; if the expected text is truly absent → APPLICATION.
