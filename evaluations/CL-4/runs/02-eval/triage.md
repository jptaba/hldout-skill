# Triage — CL-4 / run 02-eval

Generated 2026-09-29T11:16:47.562Z

**16/17 passed**, 1 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001.1 | security | AC-1 | passed | - | - | - |
| SCN-001.2 | security | AC-1 | passed | - | - | - |
| SCN-001.3 | security | AC-1 | passed | - | - | - |
| SCN-001.4 | security | AC-1 | passed | - | - | - |
| SCN-001.5 | security | AC-1 | passed | - | - | - |
| SCN-001.6 | security | AC-1 | passed | - | - | - |
| SCN-002.1 | security | AC-2 | passed | - | - | - |
| SCN-002.2 | security | AC-2 | passed | - | - | - |
| SCN-003 | security | AC-3 | passed | - | - | - |
| SCN-004 | security | AC-4 | passed | - | - | - |
| SCN-005.1 | security | AC-5 | passed | - | - | - |
| SCN-005.2 | security | AC-5 | passed | - | - | - |
| SCN-005.3 | security | AC-5 | passed | - | - | - |
| SCN-006 | security | AC-6 | passed | - | - | - |
| SCN-007.1 | security | AC-7 | passed | - | - | - |
| SCN-007.2 | security | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-008 | security | AC-8 | passed | - | - | - |

## SCN-007.2: The owner of an existing contact cannot be changed (PATCH)

- Requirement refs: AC-7 · type: security · layer: api
- Failing step: Then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A"
- Error: `[REQ AC-7] PATCH /contacts/{id} setting owner to user B is rejected with 400 or keeps owner A`
- Expected: `/^(rejected with 400|answered 200 with owner still A)$/`
- Received: `"answered 200 with owner set to user B"`
- Relevant API exchange (#1 of 1): `PATCH https://thinking-tester-contact-list.herokuapp.com/contacts/6abb9e1a2f701c0015676bd2` → **200**
  - request body: `{"owner":"6abb9e1a2f701c0015676bd0"}`
  - response body: `{"_id":"6abb9e1a2f701c0015676bd2","firstName":"Secret","lastName":"Sam","owner":"6abb9e1a2f701c0015676bd0","__v":0}`
- Evidence: [screenshot](artifacts/CL-4-tests-cl-4-CL-4-Accou-41bda-ct-cannot-be-changed-PATCH--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/CL-4/runs/02-eval/artifacts/CL-4-tests-cl-4-CL-4-Accou-41bda-ct-cannot-be-changed-PATCH--chromium-retry1/trace.zip` · [error-context](artifacts/CL-4-tests-cl-4-CL-4-Accou-41bda-ct-cannot-be-changed-PATCH--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: PATCH /contacts/6abb9e1a2f701c0015676bd2 → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: /^(rejected with 400|answered 200 with owner still A)$/
- Received: "answered 200 with owner set to user B"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT** — AC-7: setting owner to user B's _id must be rejected with 400 or leave owner A. Live: user A's PATCH /contacts/{id} {owner: B's _id} answers 200 with owner = B; A then gets 404 for the contact and it is in B's list. The PUT example keeps owner A (passes).
