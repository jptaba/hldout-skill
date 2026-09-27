# Triage — DQ-2 / run 01-harden

Generated 2026-09-27T12:18:55.143Z

**27/28 passed**, 1 failed, 0 flaky, 0 skipped.

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
| SCN-011 | integration | AC-9 | failed | NEEDS_INVESTIGATION | low | **SCRIPT_DEFECT** |
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
- Failing step: And GET /Account/v1/User/{UUID} no longer lists 9781449325862 and still lists 9781593277574
- Error: `read my collection (GET /Account/v1/User/{UUID})`
- Expected: `200`
- Received: `401`
- Relevant API exchange (#1 of 1): `GET https://demoqa.com/Account/v1/User/eb7c7e3a-2e50-4686-bf52-da369a9e704f` → **401**
  - request body: ``
  - response body: `{"code":"1200","message":"User not authorized!"}`
- Evidence: [screenshot](artifacts/DQ-2-tests-dq-2-DQ-2-Perso-04148-page-removes-only-that-book-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-2/runs/01-harden/artifacts/DQ-2-tests-dq-2-DQ-2-Perso-04148-page-removes-only-that-book-chromium-retry1/trace.zip` · [error-context](artifacts/DQ-2-tests-dq-2-DQ-2-Perso-04148-page-removes-only-that-book-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Last API exchange: GET /Account/v1/User/eb7c7e3a-2e50-4686-bf52-da369a9e704f → 401
- Non-requirement assertion/action failed: read my collection (GET /Account/v1/User/{UUID})

Next: Inspect trace + snapshot; decide SCRIPT vs APPLICATION.

**Confirmed: SCRIPT_DEFECT** — The UI sign-in issued a new token and revoked the one the test got from GenerateToken in the seed; the follow-up GET /Account/v1/User/{UUID} used the revoked token (401). Mechanics, not the AC: confirmed with hardening/token-rotation.md (token A → 401 once token B is issued, B → 200).

Action: Take a fresh token (seed.step) after the UI sign-in and in user cleanup; integrity PRESERVED; 02-harden 84/84.
