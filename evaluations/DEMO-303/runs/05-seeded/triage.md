# Triage — DEMO-303 / run 05-seeded

Generated 2026-09-26T17:20:38.254Z

**15/27 passed**, 12 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | security | AC-2 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-003 | functional | AC-3 | passed | - | - | - |
| SCN-004 | functional | AC-4 | passed | - | - | - |
| SCN-005 | negative | AC-4 | passed | - | - | - |
| SCN-006 | functional | AC-5 | passed | - | - | - |
| SCN-007.1 | negative | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.2 | negative | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.3 | negative | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.4 | negative | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-008.1 | boundary | AC-6 | passed | - | - | - |
| SCN-008.2 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-008.3 | boundary | AC-6 | passed | - | - | - |
| SCN-008.4 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-008.5 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-009.1 | security | AC-7 | passed | - | - | - |
| SCN-009.2 | security | AC-7 | passed | - | - | - |
| SCN-009.3 | security | AC-7 | passed | - | - | - |
| SCN-010.1 | functional | AC-7, AC-8 | passed | - | - | - |
| SCN-010.2 | functional | AC-7, AC-8 | passed | - | - | - |
| SCN-011 | idempotency | AC-8 | passed | - | - | - |
| SCN-012 | functional | AC-9 | passed | - | - | - |
| SCN-013 | functional | AC-10 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-014.1 | negative | AC-11 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-014.2 | negative | AC-11 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-014.3 | negative | AC-11 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-015 | performance | AC-12 | passed | - | - | - |

## SCN-002: Invalid credentials are refused with 401

- Requirement refs: AC-2 · type: security · layer: api
- Failing step: Then the response status is 401
- Error: `[REQ AC-2] invalid auth → 401`
- Expected: `401`
- Received: `200`
- Relevant API exchange (#1 of 1): `POST https://restful-booker.herokuapp.com/auth` → **200**
  - request body: `{"username":"admin","password":"***redacted***"}`
  - response body: `{"reason":"Bad credentials"}`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-422b9-ntials-are-refused-with-401-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-422b9-ntials-are-refused-with-401-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-422b9-ntials-are-refused-with-401-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /auth → 200
- Requirement assertion [REQ AC-2] failed.
- Expected: 401
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-2 requires 401 Unauthorized for bad credentials. The API answers 200 OK with {"reason":"Bad credentials"} (the body matches; the status does not). Partner systems keying on the status would treat a failed login as success. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-007.1: A booking missing a required field is rejected with 400 (firstname)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 400
- Error: `[REQ AC-6] missing firstname → 400`
- Expected: `400`
- Received: `500`
- Relevant API exchange (#1 of 1): `POST https://restful-booker.herokuapp.com/booking` → **500**
  - request body: `{"lastname":"Heldout ino0axg3-2","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Internal Server Error`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-71608-ejected-with-400-firstname--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-71608-ejected-with-400-firstname--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-71608-ejected-with-400-firstname--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /booking → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-6 / booking-rules.csv R1 R2 R4 R5: a missing required field must be rejected with 400, never 5xx. Every missing-field variant returns 500 Internal Server Error, so input validation is absent and the server fails on client input. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-007.2: A booking missing a required field is rejected with 400 (lastname)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 400
- Error: `[REQ AC-6] missing lastname → 400`
- Expected: `400`
- Received: `500`
- Relevant API exchange (#1 of 1): `POST https://restful-booker.herokuapp.com/booking` → **500**
  - request body: `{"firstname":"QA ino18nyt-1","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Internal Server Error`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-33d86-rejected-with-400-lastname--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-33d86-rejected-with-400-lastname--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-33d86-rejected-with-400-lastname--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /booking → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-6 / booking-rules.csv R1 R2 R4 R5: a missing required field must be rejected with 400, never 5xx. Every missing-field variant returns 500 Internal Server Error, so input validation is absent and the server fails on client input. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-007.3: A booking missing a required field is rejected with 400 (depositpaid)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 400
- Error: `[REQ AC-6] missing depositpaid → 400`
- Expected: `400`
- Received: `500`
- Relevant API exchange (#1 of 2): `POST https://restful-booker.herokuapp.com/booking` → **500**
  - request body: `{"firstname":"QA ino17wdj-1","lastname":"Heldout ino17wqy-2","totalprice":150,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Internal Server Error`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-6138e-ected-with-400-depositpaid--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-6138e-ected-with-400-depositpaid--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-6138e-ected-with-400-depositpaid--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /booking → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-6 / booking-rules.csv R1 R2 R4 R5: a missing required field must be rejected with 400, never 5xx. Every missing-field variant returns 500 Internal Server Error, so input validation is absent and the server fails on client input. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-007.4: A booking missing a required field is rejected with 400 (bookingdates.checkin)

- Requirement refs: AC-6 · type: negative · layer: api
- Failing step: Then the response status is 400
- Error: `[REQ AC-6] missing bookingdates.checkin → 400`
- Expected: `400`
- Received: `500`
- Relevant API exchange (#1 of 2): `POST https://restful-booker.herokuapp.com/booking` → **500**
  - request body: `{"firstname":"QA ino383nh-1","lastname":"Heldout ino383xd-2","totalprice":150,"depositpaid":true,"bookingdates":{"checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Internal Server Error`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-fb51f-h-400-bookingdates-checkin--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-fb51f-h-400-bookingdates-checkin--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-fb51f-h-400-bookingdates-checkin--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /booking → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-6 / booking-rules.csv R1 R2 R4 R5: a missing required field must be rejected with 400, never 5xx. Every missing-field variant returns 500 Internal Server Error, so input validation is absent and the server fails on client input. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-008.2: Price and date boundaries are enforced (totalprice -1 → rejected)

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the booking is rejected
- Error: `[REQ AC-6] totalprice -1 rejected with 400`
- Expected: `400`
- Received: `200`
- Relevant API exchange (#2 of 2): `GET https://restful-booker.herokuapp.com/booking?firstname=QA+ino4ecs0-1&lastname=Heldout+ino4ecqg-2` → **200**
  - request body: ``
  - response body: `[{"bookingid":4966}]`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-56d82-d-totalprice--1-→-rejected--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-56d82-d-totalprice--1-→-rejected--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-56d82-d-totalprice--1-→-rejected--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /booking → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200
- Also failed: [REQ AC-6] totalprice -1 not stored

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — booking-rules.csv R3: totalprice must be an integer ≥ 0 (0 is valid and passes). totalprice −1 is accepted with 200 and stored, where AC-6 requires 400 and not stored. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-008.4: Price and date boundaries are enforced (checkout = checkin (same day) → rejected)

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the booking is rejected
- Error: `[REQ AC-6] checkout = checkin (same day) rejected with 400`
- Expected: `400`
- Received: `200`
- Relevant API exchange (#2 of 2): `GET https://restful-booker.herokuapp.com/booking?firstname=QA+ino45tpy-1&lastname=Heldout+ino45tpf-2` → **200**
  - request body: ``
  - response body: `[{"bookingid":4963}]`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-6f55b-heckin-same-day-→-rejected--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-6f55b-heckin-same-day-→-rejected--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-6f55b-heckin-same-day-→-rejected--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /booking → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200
- Also failed: [REQ AC-6] checkout = checkin (same day) not stored

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — booking-rules.csv R6: checkout must be strictly after checkin (checkin+1 is valid and passes). Same-day and earlier check-outs are accepted with 200 and stored, where AC-6 requires 400. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-008.5: Price and date boundaries are enforced (checkout = checkin - 4 days → rejected)

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the booking is rejected
- Error: `[REQ AC-6] checkout = checkin - 4 days rejected with 400`
- Expected: `400`
- Received: `200`
- Relevant API exchange (#2 of 2): `GET https://restful-booker.herokuapp.com/booking?firstname=QA+ino4phlb-1&lastname=Heldout+ino4phqa-2` → **200**
  - request body: ``
  - response body: `[{"bookingid":4972}]`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-b2307-heckin---4-days-→-rejected--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-b2307-heckin---4-days-→-rejected--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-b2307-heckin---4-days-→-rejected--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /booking → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200
- Also failed: [REQ AC-6] checkout = checkin - 4 days not stored

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — booking-rules.csv R6: checkout must be strictly after checkin (checkin+1 is valid and passes). Same-day and earlier check-outs are accepted with 200 and stored, where AC-6 requires 400. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-013: Cancelling a booking returns 204 and removes it

- Requirement refs: AC-10 · type: functional · layer: api
- Failing step: Then the response status is 204
- Error: `[REQ AC-10] DELETE → 204`
- Expected: `204`
- Received: `201`
- Relevant API exchange (#1 of 2): `DELETE https://restful-booker.herokuapp.com/booking/5026` → **201**
  - request body: ``
  - response body: `Created`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-83bf2--returns-204-and-removes-it-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-83bf2--returns-204-and-removes-it-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-83bf2--returns-204-and-removes-it-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: DELETE /booking/5026 → 201
- Requirement assertion [REQ AC-10] failed.
- Expected: 204
- Received: 201

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-10 requires 204 No Content for an authenticated DELETE. The cancellation works (a GET afterwards returns 404, which passes), but the API answers 201 Created, a status that means a resource was created. This finding was hidden in run 02 behind a test auth-plumbing defect and surfaced after the repair. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-014.1: Writing to a booking that does not exist returns 404 (PUT)

- Requirement refs: AC-11 · type: negative · layer: api
- Failing step: Then the response status is 404
- Error: `[REQ AC-11] PUT unknown id → 404`
- Expected: `404`
- Received: `405`
- Relevant API exchange (#1 of 1): `PUT https://restful-booker.herokuapp.com/booking/5025` → **405**
  - request body: `{"firstname":"QA ino8493d-3","lastname":"Heldout ino84989-4","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}`
  - response body: `Method Not Allowed`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-11cd6--not-exist-returns-404-PUT--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-11cd6--not-exist-returns-404-PUT--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-11cd6--not-exist-returns-404-PUT--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: PUT /booking/5025 → 405
- Requirement assertion [REQ AC-11] failed.
- Expected: 404
- Received: 405

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-11: PUT, PATCH or DELETE of a non-existent booking must answer 404. The API answers 405 Method Not Allowed, which wrongly tells partners the method is unsupported rather than that the booking is gone. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-014.2: Writing to a booking that does not exist returns 404 (PATCH)

- Requirement refs: AC-11 · type: negative · layer: api
- Failing step: Then the response status is 404
- Error: `[REQ AC-11] PATCH unknown id → 404`
- Expected: `404`
- Received: `405`
- Relevant API exchange (#1 of 1): `PATCH https://restful-booker.herokuapp.com/booking/5036` → **405**
  - request body: `{"firstname":"Ghost"}`
  - response body: `Method Not Allowed`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-a9822-ot-exist-returns-404-PATCH--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-a9822-ot-exist-returns-404-PATCH--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-a9822-ot-exist-returns-404-PATCH--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: PATCH /booking/5036 → 405
- Requirement assertion [REQ AC-11] failed.
- Expected: 404
- Received: 405

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-11: PUT, PATCH or DELETE of a non-existent booking must answer 404. The API answers 405 Method Not Allowed, which wrongly tells partners the method is unsupported rather than that the booking is gone. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

## SCN-014.3: Writing to a booking that does not exist returns 404 (DELETE)

- Requirement refs: AC-11 · type: negative · layer: api
- Failing step: Then the response status is 404
- Error: `[REQ AC-11] DELETE unknown id → 404`
- Expected: `404`
- Received: `405`
- Relevant API exchange (#1 of 1): `DELETE https://restful-booker.herokuapp.com/booking/5038` → **405**
  - request body: ``
  - response body: `Method Not Allowed`
- Evidence: [screenshot](artifacts/DEMO-303-tests-demo-303-DE-33978-t-exist-returns-404-DELETE--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-33978-t-exist-returns-404-DELETE--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-303-tests-demo-303-DE-33978-t-exist-returns-404-DELETE--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: DELETE /booking/5038 → 405
- Requirement assertion [REQ AC-11] failed.
- Expected: 404
- Received: 405

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-11: PUT, PATCH or DELETE of a non-existent booking must answer 404. The API answers 405 Method Not Allowed, which wrongly tells partners the method is unsupported rather than that the booking is gone. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)
