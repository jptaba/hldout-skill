# Triage — DEMO-505 / run 01-harden

Generated 2026-09-26T18:07:44.678Z

**3/6 passed**, 3 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001.1 | functional | AC-1 | passed | - | - | - |
| SCN-001.2 | functional | AC-1 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-001.3 | functional | AC-1 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | negative | AC-2 | passed | - | - | - |
| SCN-004 | functional | AC-3 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |

## SCN-001.2: Hovering an avatar reveals that user's caption (avatar 2)

- Requirement refs: AC-1 · type: functional · layer: ui
- Failing step: Then I see "name: user2" and a "View profile" link
- Error: `[REQ AC-1] "View profile" link for avatar 2`
- Locator: `getByRole('link', { name: 'View profile' }).nth(1)`
- Expected: `visible`
- Evidence: [screenshot](artifacts/DEMO-505-tests-demo-505-DE-7e614-at-user-s-caption-avatar-2--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-505/runs/01-harden/artifacts/DEMO-505-tests-demo-505-DE-7e614-at-user-s-caption-avatar-2--chromium/trace.zip` · [error-context](artifacts/DEMO-505-tests-demo-505-DE-7e614-at-user-s-caption-avatar-2--chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByRole('link', { name: 'View profile' }).nth(1)
- No failure-time snapshot available.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-001.3: Hovering an avatar reveals that user's caption (avatar 3)

- Requirement refs: AC-1 · type: functional · layer: ui
- Failing step: Then I see "name: user3" and a "View profile" link
- Error: `[REQ AC-1] "View profile" link for avatar 3`
- Locator: `getByRole('link', { name: 'View profile' }).nth(2)`
- Expected: `visible`
- Evidence: [screenshot](artifacts/DEMO-505-tests-demo-505-DE-cd82f-at-user-s-caption-avatar-3--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-505/runs/01-harden/artifacts/DEMO-505-tests-demo-505-DE-cd82f-at-user-s-caption-avatar-3--chromium/trace.zip` · [error-context](artifacts/DEMO-505-tests-demo-505-DE-cd82f-at-user-s-caption-avatar-3--chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByRole('link', { name: 'View profile' }).nth(2)
- No failure-time snapshot available.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-004: Clicking "Click here" shows a notification

- Requirement refs: AC-3 · type: functional · layer: ui
- Failing step: Then exactly one non-empty notification is shown
- Error: `[REQ AC-3] exactly one notification`
- Locator: `getByRole('alert')`
- Expected: `1`
- Received: `0`
- Evidence: [screenshot](artifacts/DEMO-505-tests-demo-505-DE-18acb-k-here-shows-a-notification-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-505/runs/01-harden/artifacts/DEMO-505-tests-demo-505-DE-18acb-k-here-shows-a-notification-chromium/trace.zip` · [error-context](artifacts/DEMO-505-tests-demo-505-DE-18acb-k-here-shows-a-notification-chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByRole('alert')

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.
