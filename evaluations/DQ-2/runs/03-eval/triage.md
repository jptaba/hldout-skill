# Triage — DQ-2 / run 03-eval

Generated 2026-09-27T12:28:56.852Z

**27/28 passed**, 0 failed, 1 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | contract | AC-1 | passed | - | - | - |
| SCN-003.1 | functional | AC-2 | passed | - | - | - |
| SCN-003.2 | functional | AC-2 | passed | - | - | - |
| SCN-003.3 | functional | AC-2 | passed | - | - | - |
| SCN-004 | integration | AC-3 | passed | - | - | - |
| SCN-005.1 | functional | AC-4 | passed | - | - | - |
| SCN-005.2 | functional | AC-4 | passed | - | - | - |
| SCN-005.3 | functional | AC-4 | passed | - | - | - |
| SCN-005.4 | functional | AC-4 | passed | - | - | - |
| SCN-006 | negative | AC-4 | passed | - | - | - |
| SCN-007 | functional | AC-5 | passed | - | - | - |
| SCN-008 | functional | AC-6 | passed | - | - | - |
| SCN-009 | integration | AC-7 | passed | - | - | - |
| SCN-010 | idempotency | AC-8 | passed | - | - | - |
| SCN-011 | integration | AC-9 | flaky | FLAKY | medium | **SCRIPT_DEFECT** |
| SCN-012 | functional | AC-10 | passed | - | - | - |
| SCN-013 | negative | AC-10 | passed | - | - | - |
| SCN-014 | negative | AC-11 | passed | - | - | - |
| SCN-015 | negative | AC-11 | passed | - | - | - |
| SCN-016.1 | security | AC-12 | passed | - | - | - |
| SCN-016.2 | security | AC-12 | passed | - | - | - |
| SCN-016.3 | security | AC-12 | passed | - | - | - |
| SCN-016.4 | security | AC-12 | passed | - | - | - |
| SCN-016.5 | security | AC-12 | passed | - | - | - |
| SCN-016.6 | security | AC-12 | passed | - | - | - |
| SCN-016.7 | security | AC-12 | passed | - | - | - |
| SCN-016.8 | security | AC-12 | passed | - | - | - |

## SCN-011: Deleting one book on the Profile page removes only that book

- Requirement refs: AC-9 · type: integration · layer: e2e
- Failing step: And I signed in on /login and I am on the Profile page
- Error: `signed in and on the Profile page (precondition)`
- Expected: `/\/profile/`
- Received: `"https://demoqa.com/login"`
- Evidence: [screenshot](artifacts/DQ-2-tests-dq-2-DQ-2-Perso-04148-page-removes-only-that-book-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-2/runs/03-eval/artifacts/DQ-2-tests-dq-2-DQ-2-Perso-04148-page-removes-only-that-book-chromium/trace.zip` · [error-context](artifacts/DQ-2-tests-dq-2-DQ-2-Perso-04148-page-removes-only-that-book-chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed then passed on retry — nondeterministic.

Next: Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.

**Confirmed: SCRIPT_DEFECT** — Failed in the Given (plain precondition, not [REQ]): after clicking Login the page still showed 'Loading...' at the 5 s expect timeout (screenshot), then the retry passed. The sign-in simply answers slowly (GenerateToken takes ~1.5 s, see hardening/api-mechanics.md); the test's wait for /profile was too short. Mechanics, not AC-9.

Action: Precondition waits for /profile up to 20 s (SCN-009 and SCN-011); integrity PRESERVED; full re-run.
