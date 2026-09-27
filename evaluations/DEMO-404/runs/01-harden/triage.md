# Triage — DEMO-404 / run 01-harden

Generated 2026-09-26T16:16:31.102Z

**10/15 passed**, 5 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | failed | SCRIPT_DEFECT | high | ⏳ pending |
| SCN-002.1 | negative | AC-2 | failed | SCRIPT_DEFECT | medium | ⏳ pending |
| SCN-002.2 | negative | AC-2 | failed | SCRIPT_DEFECT | medium | ⏳ pending |
| SCN-003 | functional | AC-3 | failed | SCRIPT_DEFECT | medium | ⏳ pending |
| SCN-004 | security | AC-3 | failed | SCRIPT_DEFECT | medium | ⏳ pending |
| SCN-005 | functional | AC-4 | passed | - | - | - |
| SCN-006 | functional | AC-5 | passed | - | - | - |
| SCN-007 | functional | AC-6 | passed | - | - | - |
| SCN-008.1 | functional | AC-7 | passed | - | - | - |
| SCN-008.2 | functional | AC-7 | passed | - | - | - |
| SCN-008.3 | functional | AC-7 | passed | - | - | - |
| SCN-009 | functional | AC-8 | passed | - | - | - |
| SCN-010 | functional | AC-9 | passed | - | - | - |
| SCN-011.1 | functional | AC-10 | passed | - | - | - |
| SCN-011.2 | functional | AC-10 | passed | - | - | - |

## SCN-001: The trainee signs in to the Secure Area

- Requirement refs: AC-1 · type: functional · layer: ui
- Failing step: Then I am on the Secure Area with the heading "Secure Area"
- Error: `[REQ AC-1] "Secure Area" heading`
- Locator: `getByRole('heading', { name: 'Secure Area' })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-f3bed-signs-in-to-the-Secure-Area-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/01-harden/artifacts/DEMO-404-tests-demo-404-DE-f3bed-signs-in-to-the-Secure-Area-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-f3bed-signs-in-to-the-Secure-Area-chromium/error-context.md)

**Auto: SCRIPT_DEFECT (high)**

- Locator resolved to multiple elements (strict mode violation).

Next: Scope/refine the locator so it is unique; verify with a probe; re-run.

## SCN-002.1: Wrong credentials are refused with a specific message (an unknown username)

- Requirement refs: AC-2 · type: negative · layer: ui
- Failing step: Then I see "Your username is invalid!"
- Error: `[REQ AC-2] an unknown username message`
- Locator: `getByRole('alert')`
- Expected: `"Your username is invalid!"`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-58e28-essage-an-unknown-username--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/01-harden/artifacts/DEMO-404-tests-demo-404-DE-58e28-essage-an-unknown-username--chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-58e28-essage-an-unknown-username--chromium/error-context.md)

**Auto: SCRIPT_DEFECT (medium)**

- Target not found: getByRole('alert')
- The expected text "Your username is invalid!" IS on the page (`# step: FAILED Then I see "Your username is invalid!"`, `- text:  Your username is invalid!`) — the locator targets a different element.

Next: Re-locate the element that actually carries the expected text (probe it), fix the locator (HOW only), re-run.

## SCN-002.2: Wrong credentials are refused with a specific message (the trainee with a wrong password)

- Requirement refs: AC-2 · type: negative · layer: ui
- Failing step: Then I see "Your password is invalid!"
- Error: `[REQ AC-2] the trainee with a wrong password message`
- Locator: `getByRole('alert')`
- Expected: `"Your password is invalid!"`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/01-harden/artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-43c96-inee-with-a-wrong-password--chromium/error-context.md)

**Auto: SCRIPT_DEFECT (medium)**

- Target not found: getByRole('alert')
- The expected text "Your password is invalid!" IS on the page (`# step: FAILED Then I see "Your password is invalid!"`, `- text:  Your password is invalid!`) — the locator targets a different element.

Next: Re-locate the element that actually carries the expected text (probe it), fix the locator (HOW only), re-run.

## SCN-003: Logging out returns to the Login page

- Requirement refs: AC-3 · type: functional · layer: ui
- Failing step: And I see "You logged out of the secure area!"
- Error: `[REQ AC-3] signed-out message`
- Locator: `getByRole('alert')`
- Expected: `"You logged out of the secure area!"`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-958d7-t-returns-to-the-Login-page-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/01-harden/artifacts/DEMO-404-tests-demo-404-DE-958d7-t-returns-to-the-Login-page-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-958d7-t-returns-to-the-Login-page-chromium/error-context.md)

**Auto: SCRIPT_DEFECT (medium)**

- Target not found: getByRole('alert')
- The expected text "You logged out of the secure area!" IS on the page (`# step: FAILED And I see "You logged out of the secure area!"`, `- text:  You logged out of the secure area!`) — the locator targets a different element.

Next: Re-locate the element that actually carries the expected text (probe it), fix the locator (HOW only), re-run.

## SCN-004: The Secure Area is not reachable while signed out

- Requirement refs: AC-3 · type: security · layer: ui
- Failing step: And I see "You must login to view the secure area!"
- Error: `[REQ AC-3] must-login message`
- Locator: `getByRole('alert')`
- Expected: `"You must login to view the secure area!"`
- Evidence: [screenshot](artifacts/DEMO-404-tests-demo-404-DE-33f4b--reachable-while-signed-out-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-404/runs/01-harden/artifacts/DEMO-404-tests-demo-404-DE-33f4b--reachable-while-signed-out-chromium/trace.zip` · [error-context](artifacts/DEMO-404-tests-demo-404-DE-33f4b--reachable-while-signed-out-chromium/error-context.md)

**Auto: SCRIPT_DEFECT (medium)**

- Target not found: getByRole('alert')
- The expected text "You must login to view the secure area!" IS on the page (`# step: FAILED And I see "You must login to view the secure area!"`, `- text:  You must login to view the secure area!`) — the locator targets a different element.

Next: Re-locate the element that actually carries the expected text (probe it), fix the locator (HOW only), re-run.
