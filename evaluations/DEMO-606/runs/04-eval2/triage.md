# Triage — DEMO-606 / run 04-eval2

Generated 2026-09-26T18:11:28.706Z

**1/2 passed**, 1 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-002 | functional | AC-2 | passed | - | - | - |

## SCN-001: Every notification uses approved copy

- Requirement refs: AC-1 · type: functional · layer: ui
- Failing step: And every notification text is one of the approved messages
- Error: `[REQ AC-1] only approved copy (seen: Action successful | Action unsuccesful, please try again)`
- Expected: `[Array []]`
- Received: `["Action unsuccesful, please try again"]`
- Evidence: [screenshot](artifacts/DEMO-606-tests-demo-606-DE-cd7a9-fication-uses-approved-copy-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-606/runs/04-eval2/artifacts/DEMO-606-tests-demo-606-DE-cd7a9-fication-uses-approved-copy-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-606-tests-demo-606-DE-cd7a9-fication-uses-approved-copy-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-1] failed on a located element.
- Expected: [Array []]
- Received: ["Action unsuccesful, please try again"]

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-1 / ux-copy.md: every notification must be approved copy. The failure outcome reads 'Action unsuccesful, please try again' (missing 'c') instead of the approved 'Action unsuccessful, please try again'. It is intermittent by design, because the server picks the outcome at random; sampling 12 clicks per run made it reproduce every time (3/3 stability repeats and the official run). The success copy is correct, and both outcomes occur (AC-2 passes).
