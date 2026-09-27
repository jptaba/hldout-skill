# Triage — DEMO-606 / run 03-harden-stability

Generated 2026-09-26T18:10:17.395Z

**1/2 passed**, 1 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-002 | functional | AC-2 | passed | - | - | - |

## SCN-001: Every notification uses approved copy

- Requirement refs: AC-1 · type: functional · layer: ui
- Failing step: And every notification text is one of the approved messages
- Repeats: failed **3 of 3**
- Error: `[REQ AC-1] only approved copy (seen: Action unsuccesful, please try again | Action successful)`
- Expected: `[Array []]`
- Received: `["Action unsuccesful, please try again"]`
- Evidence: [screenshot](artifacts/DEMO-606-tests-demo-606-DE-cd7a9-fication-uses-approved-copy-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-606/runs/03-harden-stability/artifacts/DEMO-606-tests-demo-606-DE-cd7a9-fication-uses-approved-copy-chromium/trace.zip` · [error-context](artifacts/DEMO-606-tests-demo-606-DE-cd7a9-fication-uses-approved-copy-chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-1] failed on a located element.
- Expected: [Array []]
- Received: ["Action unsuccesful, please try again"]
- Failed all 3 repeats with 2 different causes:
- APPLICATION_DEFECT: [REQ AC-1] only approved copy (seen: Action unsuccesful, please try again | Action successful)
- APPLICATION_DEFECT: [REQ AC-1] only approved copy (seen: Action successful | Action unsuccesful, please try again)

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.
