# Triage — TOOL-2 / run 03-eval

Generated 2026-09-29T22:31:55.854Z

**8/10 passed**, 2 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | security | AC-1 | passed | - | - | - |
| SCN-003 | negative | AC-2 | passed | - | - | - |
| SCN-004 | negative | AC-3 | passed | - | - | - |
| SCN-005 | functional | AC-4 | passed | - | - | - |
| SCN-006 | negative | AC-5 | passed | - | - | - |
| SCN-007 | security | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-008 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-009 | security | AC-7 | passed | - | - | - |
| SCN-010 | composition | AC-1, AC-7 | passed | - | - | - |

## SCN-007: Five wrong passwords lock the account, even against the correct password

- Requirement refs: AC-6 · type: security · layer: api
- Failing step: Then attempts one to five respond 401
- Error: `[REQ AC-6] POST /users/login attempts one to five with a wrong password respond 401`
- Expected: `[401, 401, 401, 401, 401]`
- Received: `[401, 401, 401, 423, 423]`
- Relevant API exchange (#3 of 6): `POST https://api.practicesoftwaretesting.com/users/login` → **401**
  - request body: `{"email":"hldout-n9409oxb-1@example.com","password":"***redacted***"}`
  - response body: `{"error":"Unauthorized"}`
- Evidence: [screenshot](artifacts/TOOL-2-tests-tool-2-TOOL-2-d97ae-gainst-the-correct-password-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-2/runs/03-eval/artifacts/TOOL-2-tests-tool-2-TOOL-2-d97ae-gainst-the-correct-password-chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-2-tests-tool-2-TOOL-2-d97ae-gainst-the-correct-password-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /users/login → 401
- Requirement assertion [REQ AC-6] failed.
- Expected: [401, 401, 401, 401, 401]
- Received: [401, 401, 401, 423, 423]

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-6 states attempts one to five with a wrong password respond 401 and the sixth responds 423. On a freshly registered customer, attempts 1-3 respond 401 and attempt 4 already responds 423 ('Account locked, too many failed attempts...'), so attempts 4 and 5 are 423 instead of 401. The sixth attempt (correct password) does respond 423 with a message about the lock, as required. A control customer registered right after gets 401 on its first wrong attempt, so this is a per-account lock, not a client rate limit. Same result in 01-harden, 02-harden (3/3 repeats) and 03-eval.

## SCN-008: Four wrong passwords do not lock the account

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the fifth attempt is not refused as locked and returns an access token
- Error: `[REQ AC-6] POST /users/login after four failures is not refused as locked`
- Expected: `not 423`
- Received: `423`
- Relevant API exchange (#5 of 5): `POST https://api.practicesoftwaretesting.com/users/login` → **423**
  - request body: `{"email":"hldout-n9409qlz-1@example.com","password":"***redacted***"}`
  - response body: `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
- Evidence: [screenshot](artifacts/TOOL-2-tests-tool-2-TOOL-2-47386-rds-do-not-lock-the-account-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-2/runs/03-eval/artifacts/TOOL-2-tests-tool-2-TOOL-2-47386-rds-do-not-lock-the-account-chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-2-tests-tool-2-TOOL-2-47386-rds-do-not-lock-the-account-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /users/login → 423
- Requirement assertion [REQ AC-6] failed.
- Expected: not 423
- Received: 423
- Also failed: [REQ AC-6] POST /users/login after four failures returns an access_token — expected "string", received "undefined"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Boundary one step inside AC-6's limit of five: after four failed attempts the correct password must still sign in. The application answers 423 (locked) with no access_token after four failures, because it locks after the third failure (same root cause as SCN-007).
