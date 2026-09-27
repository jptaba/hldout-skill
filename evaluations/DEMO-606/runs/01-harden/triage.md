# Triage — DEMO-606 / run 01-harden

Generated 2026-09-26T18:06:17.424Z

**0/2 passed**, 2 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-002 | functional | AC-2 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |

## SCN-001: Every notification uses approved copy

- Requirement refs: AC-1 · type: functional · layer: ui
- Failing step: When I click "Click here" 12 times, reading the notification after each click
- Error: `TimeoutError: locator.innerText: Timeout 10000ms exceeded.`
- Locator: `getByRole('alert').first()`
- Evidence: [screenshot](artifacts/DEMO-606-tests-demo-606-DE-cd7a9-fication-uses-approved-copy-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-606/runs/01-harden/artifacts/DEMO-606-tests-demo-606-DE-cd7a9-fication-uses-approved-copy-chromium/trace.zip` · [error-context](artifacts/DEMO-606-tests-demo-606-DE-cd7a9-fication-uses-approved-copy-chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByRole('alert').first()

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-002: Both outcomes occur across repeated clicks

- Requirement refs: AC-2 · type: functional · layer: ui
- Failing step: When I click "Click here" 12 times, noting each outcome
- Error: `TimeoutError: locator.innerText: Timeout 10000ms exceeded.`
- Locator: `getByRole('alert').first()`
- Evidence: [screenshot](artifacts/DEMO-606-tests-demo-606-DE-d15c0-ccur-across-repeated-clicks-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-606/runs/01-harden/artifacts/DEMO-606-tests-demo-606-DE-d15c0-ccur-across-repeated-clicks-chromium/trace.zip` · [error-context](artifacts/DEMO-606-tests-demo-606-DE-d15c0-ccur-across-repeated-clicks-chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByRole('alert').first()

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.
