# Triage — PB-1 / run 07-rerun

Generated 2026-09-27T16:55:41.181Z

**13/14 passed**, 1 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | negative | AC-1 | passed | - | - | - |
| SCN-002 | negative | AC-2 | passed | - | - | - |
| SCN-003 | integration | AC-2 | passed | - | - | - |
| SCN-004 | functional | AC-3 | passed | - | - | - |
| SCN-005 | negative | AC-4 | passed | - | - | - |
| SCN-006 | integration | AC-4 | passed | - | - | - |
| SCN-007 | negative | AC-5 | failed | NEEDS_INVESTIGATION | low | **APPLICATION_DEFECT** |
| SCN-008 | negative | AC-5 | passed | - | - | - |
| SCN-009 | functional | AC-6 | passed | - | - | - |
| SCN-010 | functional | AC-7 | passed | - | - | - |
| SCN-011 | contract | AC-7 | passed | - | - | - |
| SCN-012 | negative | AC-8 | passed | - | - | - |
| SCN-013 | integration | AC-9 | passed | - | - | - |
| SCN-014 | integration | AC-9 | passed | - | - | - |

## SCN-007: Signing in with a wrong password shows the "Error!" page

- Requirement refs: AC-5 · type: negative · layer: ui
- Failing step: And it says "The username and password could not be verified."
- Error: `[REQ AC-5] could not be verified`
- Locator: `getByText('The username and password could not be verified.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/07-rerun/artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByText('The username and password could not be verified.')
- Target text "The username and password could not be verified." is absent from the failure-time snapshot.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

**Confirmed: APPLICATION_DEFECT / Major** — Signing in on the Customer Login panel with a registered user name and a wrong password reaches the 'Error!' page (as AC-5 requires), but the page says 'An internal error has occurred and has been logged.' instead of the required 'The username and password could not be verified.'. Locators are verified (heading 'Error!' found; the required text is absent). Deterministic: same result in every harden run, in 04-eval, 05/06/07-rerun and in two live replays. The REST login with the same credentials correctly answers 400 'Invalid username and/or password', so the customer exists and only the password is wrong.
