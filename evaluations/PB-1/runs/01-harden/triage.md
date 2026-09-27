# Triage — PB-1 / run 01-harden

Generated 2026-09-27T05:46:05.834Z

**9/14 passed**, 3 failed, 2 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | negative | AC-1 | passed | - | - | - |
| SCN-002 | negative | AC-2 | passed | - | - | - |
| SCN-003 | integration | AC-2 | flaky | FLAKY | medium | ⏳ pending |
| SCN-004 | functional | AC-3 | flaky | FLAKY | medium | ⏳ pending |
| SCN-005 | negative | AC-4 | passed | - | - | - |
| SCN-006 | integration | AC-4 | passed | - | - | - |
| SCN-007 | negative | AC-5 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-008 | negative | AC-5 | passed | - | - | - |
| SCN-009 | functional | AC-6 | passed | - | - | - |
| SCN-010 | functional | AC-7 | failed | BLOCKED | high | ⏳ pending |
| SCN-011 | contract | AC-7 | passed | - | - | - |
| SCN-012 | negative | AC-8 | failed | BLOCKED | high | ⏳ pending |
| SCN-013 | integration | AC-9 | passed | - | - | - |
| SCN-014 | integration | AC-9 | passed | - | - | - |

## SCN-003: A registration rejected for mismatched passwords creates no customer

- Requirement refs: AC-2 · type: integration · layer: e2e
- Failing step: When I call GET /login/{username}/{password} with that user name and the Password I entered
- Error: `apiRequestContext.fetch: getaddrinfo ENOTFOUND parabank.parasoft.com`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-35900-sswords-creates-no-customer-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/01-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-35900-sswords-creates-no-customer-chromium/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-35900-sswords-creates-no-customer-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

## SCN-004: A complete, valid registration welcomes the new customer and signs them in

- Requirement refs: AC-3 · type: functional · layer: ui
- Failing step: Then the page shows the heading "Welcome <username>"
- Error: `[REQ AC-3] heading Welcome <username>`
- Locator: `getByRole('heading', { name: 'Welcome pb1hxeaaij3012xd' })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-51cd5--customer-and-signs-them-in-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/01-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-51cd5--customer-and-signs-them-in-chromium/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-51cd5--customer-and-signs-them-in-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

## SCN-007: Signing in with a wrong password shows the "Error!" page

- Requirement refs: AC-5 · type: negative · layer: ui
- Failing step: And it says "The username and password could not be verified."
- Error: `[REQ AC-5] could not be verified`
- Locator: `getByText('The username and password could not be verified.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/01-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByText('The username and password could not be verified.')
- Target text "The username and password could not be verified." is absent from the failure-time snapshot.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-010: REST login with valid credentials returns the registered customer as JSON

- Requirement refs: AC-7 · type: functional · layer: api
- Failing step: [SEED] customer registered via register.htm
- Error: `[SEED] customer registered via register.htm: precondition could not be established — registration succeeded (precondition)`
- Locator: `getByText('Your account was created successfully. You are now logged in.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-b5574-registered-customer-as-JSON-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/01-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-b5574-registered-customer-as-JSON-chromium-retry1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-b5574-registered-customer-as-JSON-chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] customer registered via register.htm: precondition could not be established — registration succeeded (precondition)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-012: REST login with a wrong password answers 400 "Invalid username and/or password"

- Requirement refs: AC-8 · type: negative · layer: api
- Failing step: [SEED] customer registered via register.htm
- Error: `[SEED] customer registered via register.htm: precondition could not be established — registration succeeded (precondition)`
- Locator: `getByText('Your account was created successfully. You are now logged in.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/PB-1-tests-pb-1-PB-1-Custo-d7574-d-username-and-or-password--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/PB-1/runs/01-harden/artifacts/PB-1-tests-pb-1-PB-1-Custo-d7574-d-username-and-or-password--chromium-retry1/trace.zip` · [error-context](artifacts/PB-1-tests-pb-1-PB-1-Custo-d7574-d-username-and-or-password--chromium-retry1/error-context.md)

**Auto: BLOCKED (high)**

- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] customer registered via register.htm: precondition could not be established — registration succeeded (precondition)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.
