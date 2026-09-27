# Triage — DQ-1 / run 01-harden

Generated 2026-09-27T05:51:45.721Z

**24/27 passed**, 3 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002.1 | negative | AC-2 | passed | - | - | - |
| SCN-002.2 | negative | AC-2 | passed | - | - | - |
| SCN-002.3 | negative | AC-2 | passed | - | - | - |
| SCN-002.4 | negative | AC-2 | passed | - | - | - |
| SCN-002.5 | negative | AC-2 | passed | - | - | - |
| SCN-003 | negative | AC-3 | passed | - | - | - |
| SCN-004.1 | negative | AC-4 | passed | - | - | - |
| SCN-004.2 | negative | AC-4 | passed | - | - | - |
| SCN-005 | functional | AC-5 | passed | - | - | - |
| SCN-006.1 | negative | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-006.2 | negative | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-007 | security | AC-7 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-008 | functional | AC-8 | passed | - | - | - |
| SCN-009 | integration | AC-9 | passed | - | - | - |
| SCN-010 | negative | AC-10 | passed | - | - | - |
| SCN-011 | negative | AC-11 | passed | - | - | - |
| SCN-012 | functional | AC-12 | passed | - | - | - |
| SCN-013 | functional | AC-13 | passed | - | - | - |
| SCN-014.1 | boundary | AC-2, AC-1 | passed | - | - | - |
| SCN-014.2 | boundary | AC-2, AC-1 | passed | - | - | - |
| SCN-015.1 | negative | AC-4 | passed | - | - | - |
| SCN-015.2 | negative | AC-4 | passed | - | - | - |
| SCN-016 | contract | AC-5 | passed | - | - | - |
| SCN-017 | negative | AC-8 | passed | - | - | - |
| SCN-018 | usability | AC-10 | passed | - | - | - |
| SCN-019 | usability | AC-11 | passed | - | - | - |

## SCN-006.1: GenerateToken with wrong credentials issues no token and answers 401 (the correct user name and a wrong password)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 401
- Error: `[REQ AC-6] refused token request → 401 Unauthorized`
- Expected: `401`
- Received: `200`
- Relevant API exchange (#1 of 1): `POST https://demoqa.com/Account/v1/GenerateToken` → **200**
  - request body: `{"userName":"qa-dq1-hxeh4wu50-mujeh4wv1","password":"***redacted***"}`
  - response body: `{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}`
- Evidence: [screenshot](artifacts/DQ-1-tests-dq-1-DQ-1-Book--bc0ed--name-and-a-wrong-password--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-1/runs/01-harden/artifacts/DQ-1-tests-dq-1-DQ-1-Book--bc0ed--name-and-a-wrong-password--chromium-retry1/trace.zip` · [error-context](artifacts/DQ-1-tests-dq-1-DQ-1-Book--bc0ed--name-and-a-wrong-password--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /Account/v1/GenerateToken → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 401
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-006.2: GenerateToken with wrong credentials issues no token and answers 401 (an unknown user name and the account password)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 401
- Error: `[REQ AC-6] refused token request → 401 Unauthorized`
- Expected: `401`
- Received: `200`
- Relevant API exchange (#1 of 1): `POST https://demoqa.com/Account/v1/GenerateToken` → **200**
  - request body: `{"userName":"qa-dq1-hxeh2jz40-mujeh2k11-unknown","password":"***redacted***"}`
  - response body: `{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}`
- Evidence: [screenshot](artifacts/DQ-1-tests-dq-1-DQ-1-Book--85a51-e-and-the-account-password--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-1/runs/01-harden/artifacts/DQ-1-tests-dq-1-DQ-1-Book--85a51-e-and-the-account-password--chromium-retry1/trace.zip` · [error-context](artifacts/DQ-1-tests-dq-1-DQ-1-Book--85a51-e-and-the-account-password--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /Account/v1/GenerateToken → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 401
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-007: The issued token does not disclose the user's password

- Requirement refs: AC-7 · type: security · layer: api
- Failing step: And no part of the token or of its decoded header, payload and signature contains the password
- Error: `[REQ AC-7] the password appears in no part of the token`
- Expected: `0`
- Received: `1`
- Relevant API exchange (#1 of 1): `POST https://demoqa.com/Account/v1/GenerateToken` → **200**
  - request body: `{"userName":"qa-dq1-hxeh7t760-mujeh7t81","password":"***redacted***"}`
  - response body: `{"token":"***redacted***","expires":"2026-10-04T05:51:01.590Z","status":"Success","result":"User authorized successfully."}`
- Evidence: [screenshot](artifacts/DQ-1-tests-dq-1-DQ-1-Book--eba10-isclose-the-user-s-password-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-1/runs/01-harden/artifacts/DQ-1-tests-dq-1-DQ-1-Book--eba10-isclose-the-user-s-password-chromium-retry1/trace.zip` · [error-context](artifacts/DQ-1-tests-dq-1-DQ-1-Book--eba10-isclose-the-user-s-password-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /Account/v1/GenerateToken → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: 0
- Received: 1

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.
