# Triage — TOOL-2 / run 02-eval

Generated 2026-09-26T22:39:25.372Z

**7/8 passed**, 1 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | negative | AC-2 | passed | - | - | - |
| SCN-003 | negative | AC-3 | passed | - | - | - |
| SCN-004 | functional | AC-4 | passed | - | - | - |
| SCN-005 | security | AC-5 | passed | - | - | - |
| SCN-006 | negative | AC-5 | passed | - | - | - |
| SCN-007 | security | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-008 | security | AC-7 | passed | - | - | - |

## SCN-007: The account locks after five failed attempts

- Requirement refs: AC-6 · type: security · layer: api
- Failing step: Then attempts one to five each respond 401
- Error: `[REQ AC-6] attempts one to five → 401`
- Expected: `[401, 401, 401, 401, 401]`
- Received: `[401, 401, 401, 423, 423]`
- Relevant API exchange (#3 of 6): `POST https://api.practicesoftwaretesting.com/users/login` → **401**
  - request body: `{"email":"qamuiz257l7fq1@example.com","password":"***redacted***"}`
  - response body: `{"error":"Unauthorized"}`
- Evidence: [screenshot](artifacts/TOOL-2-tests-tool-2-TOOL-2-a30bc--after-five-failed-attempts-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-2/runs/02-eval/artifacts/TOOL-2-tests-tool-2-TOOL-2-a30bc--after-five-failed-attempts-chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-2-tests-tool-2-TOOL-2-a30bc--after-five-failed-attempts-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /users/login → 401
- Requirement assertion [REQ AC-6] failed.
- Expected: [401, 401, 401, 401, 401]
- Received: [401, 401, 401, 423, 423]

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live with a dedicated customer: attempts 1–3 → 401, attempts 4 and 5 already → 423 "Account locked, too many failed attempts". AC-6: attempts one to five respond 401 and the sixth responds 423. Customers are locked out two attempts early.
