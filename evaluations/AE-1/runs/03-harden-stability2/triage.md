# Triage — AE-1 / run 03-harden-stability2

Generated 2026-09-27T05:47:24.028Z

**19/20 passed**, 1 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | contract | AC-1 | passed | - | - | - |
| SCN-003 | contract | AC-1 | passed | - | - | - |
| SCN-004 | functional | AC-2 | passed | - | - | - |
| SCN-005.1 | functional | AC-3 | passed | - | - | - |
| SCN-005.2 | functional | AC-3 | passed | - | - | - |
| SCN-006 | functional | AC-4 | passed | - | - | - |
| SCN-007 | negative | AC-4 | passed | - | - | - |
| SCN-008 | negative | AC-4 | passed | - | - | - |
| SCN-009 | functional | AC-5 | passed | - | - | - |
| SCN-010 | negative | AC-5 | passed | - | - | - |
| SCN-011 | boundary | AC-6 | passed | - | - | - |
| SCN-012 | negative | AC-7 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-013 | negative | AC-7 | passed | - | - | - |
| SCN-014 | functional | AC-8 | passed | - | - | - |
| SCN-015 | integration | AC-9 | passed | - | - | - |
| SCN-016.1 | integration | AC-10 | passed | - | - | - |
| SCN-016.2 | integration | AC-10 | passed | - | - | - |
| SCN-016.3 | integration | AC-10 | passed | - | - | - |
| SCN-017 | functional | AC-11 | passed | - | - | - |

## SCN-012: A search without the search_product parameter is rejected with response code 400

- Requirement refs: AC-7 · type: negative · layer: api
- Failing step: Then the request is rejected with response code 400
- Repeats: failed **3 of 3**
- Error: `[REQ AC-7] response code 400`
- Expected: `400`
- Received: `200`
- Relevant API exchange (#1 of 1): `POST https://automationexercise.com/api/searchProduct` → **200**
  - request body: ``
  - response body: `{"responseCode":400,"message":"Bad request, search_product parameter is missing in POST request."}`
- Evidence: [screenshot](artifacts/AE-1-tests-ae-1-AE-1-Produ-ebe51-cted-with-response-code-400-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-1/runs/03-harden-stability2/artifacts/AE-1-tests-ae-1-AE-1-Produ-ebe51-cted-with-response-code-400-chromium-retry1/trace.zip` · [error-context](artifacts/AE-1-tests-ae-1-AE-1-Produ-ebe51-cted-with-response-code-400-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/searchProduct → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: 400
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.
