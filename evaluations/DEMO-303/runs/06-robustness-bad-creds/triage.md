# Triage — DEMO-303 / run 06-robustness-bad-creds

Generated 2026-09-26T17:55:42.475Z

> ⚠️ **Environment:** An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.

**9/27 passed**, 18 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-002 | security | AC-2 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-003 | functional | AC-3 | passed | - | - | - |
| SCN-004 | functional | AC-4 | passed | - | - | - |
| SCN-005 | negative | AC-4 | failed | BLOCKED | high | ⏳ pending |
| SCN-006 | functional | AC-5 | passed | - | - | - |
| SCN-007.1 | negative | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-007.2 | negative | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-007.3 | negative | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-007.4 | negative | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-008.1 | boundary | AC-6 | passed | - | - | - |
| SCN-008.2 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-008.3 | boundary | AC-6 | passed | - | - | - |
| SCN-008.4 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-008.5 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-009.1 | security | AC-7 | passed | - | - | - |
| SCN-009.2 | security | AC-7 | passed | - | - | - |
| SCN-009.3 | security | AC-7 | passed | - | - | - |
| SCN-010.1 | functional | AC-7, AC-8 | failed | BLOCKED | high | ⏳ pending |
| SCN-010.2 | functional | AC-7, AC-8 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-011 | idempotency | AC-8 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-012 | functional | AC-9 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-013 | functional | AC-10 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-014.1 | negative | AC-11 | failed | BLOCKED | high | ⏳ pending |
| SCN-014.2 | negative | AC-11 | failed | BLOCKED | high | ⏳ pending |
| SCN-014.3 | negative | AC-11 | failed | BLOCKED | high | ⏳ pending |
| SCN-015 | performance | AC-12 | passed | - | - | - |

## SCN-001: Valid partner credentials return a token

- Requirement refs: AC-1 · type: functional · layer: api
- Failing step: And the body contains a non-empty "token"
- Error: `[REQ AC-1] token returned`
- Expected: `[Array []]`
- Received: `["value.token is missing"]`
- Relevant API exchange (#1 of 1): `POST https://restful-booker.herokuapp.com/auth` → **200**
  - request body: `{"username":"admin","password":"***redacted***"}`
  - response body: `{"reason":"Bad credentials"}`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-77c4b--credentials-return-a-token-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-77c4b--credentials-return-a-token-chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-77c4b--credentials-return-a-token-chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- This failure is on the same endpoint (POST /auth) as the failed auth pre-step.
- (before correlation) Last API exchange: POST /auth → 200
- (before correlation) Requirement assertion [REQ AC-1] failed.
- (before correlation) Expected: [Array []]
- (before correlation) Received: ["value.token is missing"]

Next: Verify the credentials with api-probe.ts. Wrong credentials → SCRIPT (test data); correct credentials rejected → APPLICATION.

## SCN-002: Invalid credentials are refused with 401

- Requirement refs: AC-2 · type: security · layer: api
- Failing step: Then the response status is 401
- Error: `[REQ AC-2] invalid auth → 401`
- Expected: `401`
- Received: `200`
- Relevant API exchange (#1 of 1): `POST https://restful-booker.herokuapp.com/auth` → **200**
  - request body: `{"username":"admin","password":"***redacted***"}`
  - response body: `{"reason":"Bad credentials"}`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-422b9-ntials-are-refused-with-401-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-422b9-ntials-are-refused-with-401-chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-422b9-ntials-are-refused-with-401-chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- This failure is on the same endpoint (POST /auth) as the failed auth pre-step.
- (before correlation) Last API exchange: POST /auth → 200
- (before correlation) Requirement assertion [REQ AC-2] failed.
- (before correlation) Expected: 401
- (before correlation) Received: 200

Next: Verify the credentials with api-probe.ts. Wrong credentials → SCRIPT (test data); correct credentials rejected → APPLICATION.

## SCN-005: Reading a booking that does not exist returns 404

- Requirement refs: AC-4 · type: negative · layer: api
- Failing step: [SEED] booking id that no longer exists
- Error: `[SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)`
- Expected: `true`
- Received: `false`
- Relevant API exchange (#1 of undefined): `DELETE https://restful-booker.herokuapp.com/booking/1331` → **403**
  - request body: ``
  - response body: `Forbidden`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-52d4d--does-not-exist-returns-404-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-52d4d--does-not-exist-returns-404-chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-52d4d--does-not-exist-returns-404-chromium/error-context.md)

**Auto: BLOCKED (high)**

- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-007.1: A booking missing a required field is rejected with 400 (firstname)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 400
- Error: `[REQ AC-6] missing firstname → 400`
- Expected: `400`
- Received: `500`
- Relevant API exchange (#1 of 1): `POST https://restful-booker.herokuapp.com/booking` → **500**
  - request body: `{"lastname":"Heldout ioudukch-2","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Internal Server Error`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-71608-ejected-with-400-firstname--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-71608-ejected-with-400-firstname--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-71608-ejected-with-400-firstname--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: POST /booking → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

## SCN-007.2: A booking missing a required field is rejected with 400 (lastname)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 400
- Error: `[REQ AC-6] missing lastname → 400`
- Expected: `400`
- Received: `500`
- Relevant API exchange (#1 of 1): `POST https://restful-booker.herokuapp.com/booking` → **500**
  - request body: `{"firstname":"QA ioudtwkl-1","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Internal Server Error`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-33d86-rejected-with-400-lastname--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-33d86-rejected-with-400-lastname--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-33d86-rejected-with-400-lastname--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: POST /booking → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

## SCN-007.3: A booking missing a required field is rejected with 400 (depositpaid)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 400
- Error: `[REQ AC-6] missing depositpaid → 400`
- Expected: `400`
- Received: `500`
- Relevant API exchange (#1 of 2): `POST https://restful-booker.herokuapp.com/booking` → **500**
  - request body: `{"firstname":"QA ioudalr3-5","lastname":"Heldout ioudal0u-6","totalprice":150,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Internal Server Error`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-6138e-ected-with-400-depositpaid--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-6138e-ected-with-400-depositpaid--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-6138e-ected-with-400-depositpaid--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: POST /booking → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

## SCN-007.4: A booking missing a required field is rejected with 400 (bookingdates.checkin)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 400
- Error: `[REQ AC-6] missing bookingdates.checkin → 400`
- Expected: `400`
- Received: `500`
- Relevant API exchange (#1 of 2): `POST https://restful-booker.herokuapp.com/booking` → **500**
  - request body: `{"firstname":"QA ioue739l-1","lastname":"Heldout ioue73cg-2","totalprice":150,"depositpaid":true,"bookingdates":{"checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Internal Server Error`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-fb51f-h-400-bookingdates-checkin--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-fb51f-h-400-bookingdates-checkin--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-fb51f-h-400-bookingdates-checkin--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: POST /booking → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

## SCN-008.2: Price and date boundaries are enforced (totalprice -1 → rejected)

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the booking is rejected
- Error: `[REQ AC-6] totalprice -1 rejected with 400`
- Expected: `400`
- Received: `200`
- Relevant API exchange (#2 of 2): `GET https://restful-booker.herokuapp.com/booking?firstname=QA+ioufdisc-1&lastname=Heldout+ioufdixp-2` → **200**
  - request body: ``
  - response body: `[{"bookingid":1357}]`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-56d82-d-totalprice--1-→-rejected--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-56d82-d-totalprice--1-→-rejected--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-56d82-d-totalprice--1-→-rejected--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: GET /booking → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200
- Also failed: [REQ AC-6] totalprice -1 not stored — expected [Array []], received [1357]

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-008.4: Price and date boundaries are enforced (checkout = checkin (same day) → rejected)

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the booking is rejected
- Error: `[REQ AC-6] checkout = checkin (same day) rejected with 400`
- Expected: `400`
- Received: `200`
- Relevant API exchange (#2 of 2): `GET https://restful-booker.herokuapp.com/booking?firstname=QA+iouflrmp-1&lastname=Heldout+iouflr33-2` → **200**
  - request body: ``
  - response body: `[{"bookingid":1362}]`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-6f55b-heckin-same-day-→-rejected--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-6f55b-heckin-same-day-→-rejected--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-6f55b-heckin-same-day-→-rejected--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: GET /booking → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200
- Also failed: [REQ AC-6] checkout = checkin (same day) not stored — expected [Array []], received [1362]

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-008.5: Price and date boundaries are enforced (checkout = checkin - 4 days → rejected)

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the booking is rejected
- Error: `[REQ AC-6] checkout = checkin - 4 days rejected with 400`
- Expected: `400`
- Received: `200`
- Relevant API exchange (#2 of 2): `GET https://restful-booker.herokuapp.com/booking?firstname=QA+ioufp6x0-3&lastname=Heldout+ioufp6w6-4` → **200**
  - request body: ``
  - response body: `[{"bookingid":1363}]`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-b2307-heckin---4-days-→-rejected--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-b2307-heckin---4-days-→-rejected--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-b2307-heckin---4-days-→-rejected--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: GET /booking → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200
- Also failed: [REQ AC-6] checkout = checkin - 4 days not stored — expected [Array []], received [1363]

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-010.1: A full update succeeds with either authentication method (token cookie)

- Requirement refs: AC-7, AC-8 · type: functional · layer: api
- Failing step: [SEED] partner token (POST /auth)
- Error: `[SEED] partner token (POST /auth): precondition could not be established — auth returned a token (precondition)`
- Expected: `true`
- Received: `false`
- Relevant API exchange (#1 of undefined): `POST https://restful-booker.herokuapp.com/auth` → **200**
  - request body: `{"username":"admin","password":"***redacted***"}`
  - response body: `{"reason":"Bad credentials"}`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-2ea53-cation-method-token-cookie--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-2ea53-cation-method-token-cookie--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-2ea53-cation-method-token-cookie--chromium/error-context.md)

**Auto: BLOCKED (high)**

- Blocked: depends on SCN-001 (failed) — resolve that scenario first; this one was not evaluated.
- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] partner token (POST /auth): precondition could not be established — auth returned a token (precondition)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-010.2: A full update succeeds with either authentication method (Basic auth)

- Requirement refs: AC-7, AC-8 · type: functional · layer: api
- Failing step: Then the response status is 200
- Error: `[REQ AC-7] PUT with Basic auth → 200`
- Expected: `200`
- Received: `403`
- Relevant API exchange (#1 of 1): `PUT https://restful-booker.herokuapp.com/booking/1383` → **403**
  - request body: `{"firstname":"QA iougytcd-1","lastname":"Updated iougyty1-3","totalprice":222,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Forbidden`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-63e73-tication-method-Basic-auth--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-63e73-tication-method-Basic-auth--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-63e73-tication-method-Basic-auth--chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Note: depends on SCN-001 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: PUT /booking/1383 → 403
- Request was rejected as unauthenticated/unauthorised although success was expected — verify the test authenticated as the requirement specifies.

Next: Check the auth plumbing (token/cookie) with api-probe.ts. Wrong plumbing → SCRIPT; correct credentials rejected → APPLICATION.

## SCN-011: Repeating the same PUT is idempotent

- Requirement refs: AC-8 · type: idempotency · layer: api
- Failing step: Then both responses are 200 with identical bodies
- Error: `[REQ AC-8] repeated PUT → 200 both times`
- Expected: `[200, 200]`
- Received: `[403, 403]`
- Relevant API exchange (#2 of 3): `PUT https://restful-booker.herokuapp.com/booking/1378` → **403**
  - request body: `{"firstname":"QA iougpjow-7","lastname":"Heldout iougpjq2-8","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Late checkout"}`
  - response body: `Forbidden`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-fcff8--the-same-PUT-is-idempotent-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-fcff8--the-same-PUT-is-idempotent-chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-fcff8--the-same-PUT-is-idempotent-chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: PUT /booking/1378 → 403
- Request was rejected as unauthenticated/unauthorised although success was expected — verify the test authenticated as the requirement specifies.
- Also failed: [REQ AC-8] stored state after repeated PUT — expected { "additionalneeds": "Late checkout", "bookingdates": Object {, "checkin": "2026-11-10", "checkout": "2026-11-14", "depositpaid": true }, received { "additionalneeds": "Breakfast", "bookingdates": Object {, "checkin": "2026-11-10", "checkout": "2026-11-14", "depositpaid": true }

Next: Check the auth plumbing (token/cookie) with api-probe.ts. Wrong plumbing → SCRIPT; correct credentials rejected → APPLICATION.

## SCN-012: PATCH changes only the supplied fields

- Requirement refs: AC-9 · type: functional · layer: api
- Failing step: Then the response status is 200
- Error: `[REQ AC-9] PATCH → 200`
- Expected: `200`
- Received: `403`
- Relevant API exchange (#1 of 1): `PATCH https://restful-booker.herokuapp.com/booking/1397` → **403**
  - request body: `{"firstname":"Patched"}`
  - response body: `Forbidden`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-93972-es-only-the-supplied-fields-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-93972-es-only-the-supplied-fields-chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-93972-es-only-the-supplied-fields-chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: PATCH /booking/1397 → 403
- Request was rejected as unauthenticated/unauthorised although success was expected — verify the test authenticated as the requirement specifies.

Next: Check the auth plumbing (token/cookie) with api-probe.ts. Wrong plumbing → SCRIPT; correct credentials rejected → APPLICATION.

## SCN-013: Cancelling a booking returns 204 and removes it

- Requirement refs: AC-10 · type: functional · layer: api
- Failing step: Then the response status is 204
- Error: `[REQ AC-10] DELETE → 204`
- Expected: `204`
- Received: `403`
- Relevant API exchange (#1 of 2): `DELETE https://restful-booker.herokuapp.com/booking/1389` → **403**
  - request body: ``
  - response body: `Forbidden`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-83bf2--returns-204-and-removes-it-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-83bf2--returns-204-and-removes-it-chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-83bf2--returns-204-and-removes-it-chromium/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.
- Last API exchange: DELETE /booking/1389 → 403
- Request was rejected as unauthenticated/unauthorised although success was expected — verify the test authenticated as the requirement specifies.
- Also failed: [REQ AC-10] deleted booking → 404 — expected 404, received 200

Next: Check the auth plumbing (token/cookie) with api-probe.ts. Wrong plumbing → SCRIPT; correct credentials rejected → APPLICATION.

## SCN-014.1: Writing to a booking that does not exist returns 404 (PUT)

- Requirement refs: AC-11 · type: negative · layer: api
- Failing step: [SEED] booking id that no longer exists
- Error: `[SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)`
- Expected: `true`
- Received: `false`
- Relevant API exchange (#1 of undefined): `DELETE https://restful-booker.herokuapp.com/booking/1401` → **403**
  - request body: ``
  - response body: `Forbidden`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-11cd6--not-exist-returns-404-PUT--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-11cd6--not-exist-returns-404-PUT--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-11cd6--not-exist-returns-404-PUT--chromium/error-context.md)

**Auto: BLOCKED (high)**

- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-014.2: Writing to a booking that does not exist returns 404 (PATCH)

- Requirement refs: AC-11 · type: negative · layer: api
- Failing step: [SEED] booking id that no longer exists
- Error: `[SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)`
- Expected: `true`
- Received: `false`
- Relevant API exchange (#1 of undefined): `DELETE https://restful-booker.herokuapp.com/booking/1400` → **403**
  - request body: ``
  - response body: `Forbidden`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-a9822-ot-exist-returns-404-PATCH--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-a9822-ot-exist-returns-404-PATCH--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-a9822-ot-exist-returns-404-PATCH--chromium/error-context.md)

**Auto: BLOCKED (high)**

- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.

## SCN-014.3: Writing to a booking that does not exist returns 404 (DELETE)

- Requirement refs: AC-11 · type: negative · layer: api
- Failing step: [SEED] booking id that no longer exists
- Error: `[SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)`
- Expected: `true`
- Received: `false`
- Relevant API exchange (#1 of undefined): `DELETE https://restful-booker.herokuapp.com/booking/1410` → **403**
  - request body: ``
  - response body: `Forbidden`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-33978-t-exist-returns-404-DELETE--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/06-robustness-bad-creds/artifacts/DEMO-303-tests-demo-303-DE-33978-t-exist-returns-404-DELETE--chromium/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-33978-t-exist-returns-404-DELETE--chromium/error-context.md)

**Auto: BLOCKED (high)**

- Precondition data could not be seeded, so the scenario was not evaluated: [SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)

Next: Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.
