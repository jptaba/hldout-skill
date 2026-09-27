# Triage — PB-1 / run 06-rerun

Generated 2026-09-27T06:03:15.827Z

**11/14 passed**, 2 failed, 1 flaky, 0 skipped.

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
| SCN-011 | contract | AC-7 | failed | BLOCKED | high | ⏳ pending |
| SCN-012 | negative | AC-8 | passed | - | - | - |
| SCN-013 | integration | AC-9 | flaky | BLOCKED | high | ⏳ pending |
| SCN-014 | integration | AC-9 | passed | - | - | - |

## SCN-007: Signing in with a wrong password shows the "Error!" page

- Requirement refs: AC-5 · type: negative · layer: ui
- Failing step: And it says "The username and password could not be verified."
- Error: `[REQ AC-5] could not be verified`
- Locator: `getByText('The username and password could not be verified.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/06-rerun/artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByText('The username and password could not be verified.')
- Target text "The username and password could not be verified." is absent from the failure-time snapshot.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

**Confirmed: APPLICATION_DEFECT / Major** — The Customer Login panel reaches the 'Error!' page as AC-5 requires, but the page text is 'An internal error has occurred and has been logged.' instead of the required 'The username and password could not be verified.'. Locators are verified (heading Error! found; the required text is absent from the page). Same result in 01-harden, 02-harden, 03-harden (all repeats) and 04-eval, so it is deterministic, not environmental. The REST login for the same credentials correctly answers 400 'Invalid username and/or password', so the customer exists and the password is really wrong. (Confirmed in run 05-rerun; identical failure signature in 06-rerun.)

## SCN-011: REST login without Accept: application/json returns XML with a customer root element

- Requirement refs: AC-7 · type: contract · layer: api
- Failing step: [SEED] customer registered via register.htm
- Error: `[SEED] customer registered via register.htm: precondition could not be established — registered customer can sign in (precondition fallback)`
- Locator: `getByRole('heading', { name: 'Accounts Overview' })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-78588-ith-a-customer-root-element-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/06-rerun/artifacts/PB-1-tests-pb-1-PB-1-Custo-78588-ith-a-customer-root-element-chromium-retry1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-78588-ith-a-customer-root-element-chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] customer registered via register.htm: precondition could not be established — registered customer can sign in (precondition fallback)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-013: The customer and accounts services return the customer registered through the page

- Requirement refs: AC-9 · type: integration · layer: e2e
- Failing step: [SEED] customer registered via register.htm
- Error: `[SEED] customer registered via register.htm: precondition could not be established — registered customer can sign in (precondition fallback)`
- Locator: `getByRole('heading', { name: 'Accounts Overview' })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-a28c3-registered-through-the-page-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/06-rerun/artifacts/PB-1-tests-pb-1-PB-1-Custo-a28c3-registered-through-the-page-chromium/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-a28c3-registered-through-the-page-chromium/error-context.md)

**Auto: BLOCKED (high)**

- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] customer registered via register.htm: precondition could not be established — registered customer can sign in (precondition fallback)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.
