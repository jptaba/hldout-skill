# Triage — DEMO-404 / run 06-eval

Generated 2026-09-26T18:07:24.385Z

> ⚠️ **Environment:** AUT degraded around this run: https://the-internet.herokuapp.com/ failed (The operation was aborted due to timeout); 3 different tests timed out.

**12/15 passed**, 1 failed, 2 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002.1 | negative | AC-2 | passed | - | - | - |
| SCN-002.2 | negative | AC-2 | passed | - | - | - |
| SCN-003 | functional | AC-3 | failed | BLOCKED | high | ⏳ pending |
| SCN-004 | security | AC-3 | flaky | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-005 | functional | AC-4 | flaky | ENVIRONMENT_ISSUE | medium | ⏳ pending |
| SCN-006 | functional | AC-5 | passed | - | - | - |
| SCN-007 | functional | AC-6 | passed | - | - | - |
| SCN-008.1 | functional | AC-7 | passed | - | - | - |
| SCN-008.2 | functional | AC-7 | passed | - | - | - |
| SCN-008.3 | functional | AC-7 | passed | - | - | - |
| SCN-009 | functional | AC-8 | passed | - | - | - |
| SCN-010 | functional | AC-9 | passed | - | - | - |
| SCN-011.1 | functional | AC-10 | passed | - | - | - |
| SCN-011.2 | functional | AC-10 | passed | - | - | - |

## SCN-003: Logging out returns to the Login page

- Requirement refs: AC-3 · type: functional · layer: ui
- Failing step: [SEED] signed-in session (UI setup: the AUT has no API)
- Error: `[SEED] signed-in session (UI setup: the AUT has no API): precondition could not be established — locator.fill: Timeout 10000ms exceeded.`
- Locator: `getByLabel('Username')`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-958d7-t-returns-to-the-Login-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/06-eval/artifacts/DEMO-404-tests-demo-404-DE-958d7-t-returns-to-the-Login-page-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-958d7-t-returns-to-the-Login-page-chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- AUT degraded around this run: https://the-internet.herokuapp.com/ failed (The operation was aborted due to timeout); 3 different tests timed out.
- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] signed-in session (UI setup: the AUT has no API): precondition could not be established — locator.fill: Timeout 10000ms exceeded.

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-004: The Secure Area is not reachable while signed out

- Requirement refs: AC-3 · type: security · layer: ui
- Failing step: Then I am on the Login page
- Error: `[REQ AC-3] redirected to the Login page`
- Expected: `/\/login$/`
- Received: `"https://the-internet.herokuapp.com/secure"`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-33f4b--reachable-while-signed-out-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/06-eval/artifacts/DEMO-404-tests-demo-404-DE-33f4b--reachable-while-signed-out-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-33f4b--reachable-while-signed-out-chromium/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- AUT degraded around this run: https://the-internet.herokuapp.com/ failed (The operation was aborted due to timeout); 3 different tests timed out.
- (before correlation) Failed then passed on retry — nondeterministic.

Next: Re-run when the healthcheck is fast again. If the same tests still time out on a healthy AUT, investigate them individually.

## SCN-005: Checkboxes start in the documented state and toggle

- Requirement refs: AC-4 · type: functional · layer: ui
- Failing step: Then checkbox 1 is unchecked and checkbox 2 is checked
- Error: `[REQ AC-4] checkbox 1 initially unchecked`
- Locator: `getByRole('checkbox').first()`
- Expected: `not checked`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-c88ec-documented-state-and-toggle-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/06-eval/artifacts/DEMO-404-tests-demo-404-DE-c88ec-documented-state-and-toggle-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-c88ec-documented-state-and-toggle-chromium/error-context.md)

**Auto: ENVIRONMENT_ISSUE (medium)**

- AUT degraded around this run: https://the-internet.herokuapp.com/ failed (The operation was aborted due to timeout); 3 different tests timed out.
- (before correlation) Failed then passed on retry — nondeterministic.
- (before correlation) Also failed: [REQ AC-4] checkbox 2 initially checked — expected checked, received undefined
- (before correlation) Also failed: TimeoutError: locator.click: Timeout 10000ms exceeded.

Next: Re-run when the healthcheck is fast again. If the same tests still time out on a healthy AUT, investigate them individually.
