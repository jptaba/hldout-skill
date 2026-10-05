# Triage — TOOL-2 / run 03-eval

Generated 2026-10-05T01:49:56.427Z

**16/17 passed**, 1 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | negative | AC-2 | passed | - | - | - |
| SCN-003 | negative | AC-3 | passed | - | - | - |
| SCN-004 | functional | AC-4 | passed | - | - | - |
| SCN-005 | security | AC-5 | passed | - | - | - |
| SCN-006 | security | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007 | security | AC-7 | passed | - | - | - |
| SCN-008 | security | AC-1 | passed | - | - | - |
| SCN-009 | concurrency | AC-2 | passed | - | - | - |
| SCN-010.1 | boundary | AC-3 | passed | - | - | - |
| SCN-010.2 | boundary | AC-3 | passed | - | - | - |
| SCN-011.1 | negative | AC-3 | passed | - | - | - |
| SCN-011.2 | negative | AC-3 | passed | - | - | - |
| SCN-011.3 | negative | AC-3 | passed | - | - | - |
| SCN-011.4 | negative | AC-3 | passed | - | - | - |
| SCN-012 | negative | AC-5 | passed | - | - | - |
| SCN-013 | functional | AC-7 | passed | - | - | - |

## SCN-006: After five failed sign-ins the account is locked: the sixth, with the correct password, gets 423

- Requirement refs: AC-6 · type: security · layer: api
- Failing step: Then attempts one to five respond 401
- Error: `[REQ AC-6] POST /users/login wrong-password attempt 4 responds 401`
- Expected: `401`
- Received: `423`
- Relevant API exchange (#6 of 6): `POST https://api.practicesoftwaretesting.com/users/login` → **423**
  - request body: `{"email":"hldout-ulcprnun-1@example.com","password":"***redacted:3ce5***"}`
  - response body: `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-0acda-e-correct-password-gets-423-chromium-once/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-2/runs/03-eval/artifacts/practicesoftwaretesting-TO-0acda-e-correct-password-gets-423-chromium-once/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-0acda-e-correct-password-gets-423-chromium-once/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /users/login → 423
- Requirement assertion [REQ AC-6] failed.
- Expected: 401
- Received: 423
- Also failed: [REQ AC-6] POST /users/login wrong-password attempt 5 responds 401 — expected 401, received 423

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-6 requires wrong-password attempts one to five to respond 401 and the sixth (correct password) to respond 423. The test registered a fresh customer (no prior attempts) and called the declared endpoint POST /users/login with the declared body; attempts 1-3 answered 401, attempts 4 and 5 already answered 423 'Account locked, too many failed attempts. Please contact the administrator.'. The request mechanics are correct (same endpoint and body shape answer 401 for attempts 1-3 and the 423 message and status at the end match AC-6), so the app locks after three failures, not five. The lock threshold is server-side; the public demo exposes no settings page that governs it, so this is not a changed sandbox setting.
