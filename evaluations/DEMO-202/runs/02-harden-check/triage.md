# Triage — DEMO-202 / run 02-harden-check

Generated 2026-09-26T15:13:53.426Z

**28/39 passed**, 11 failed, 0 flaky, 0 skipped.

| Scenario | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- |
| SCN-001 | failed | APPLICATION_DEFECT | medium | ⏳ pending |
| SCN-002 | passed | - | - | - |
| SCN-003 | failed | SCRIPT_DEFECT | medium | ⏳ pending |
| SCN-004.1 | passed | - | - | - |
| SCN-004.2 | passed | - | - | - |
| SCN-004.3 | passed | - | - | - |
| SCN-005 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-006.1 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-006.2 | passed | - | - | - |
| SCN-006.3 | passed | - | - | - |
| SCN-006.4 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-006.5 | passed | - | - | - |
| SCN-006.6 | passed | - | - | - |
| SCN-006.7 | passed | - | - | - |
| SCN-006.8 | passed | - | - | - |
| SCN-006.9 | passed | - | - | - |
| SCN-006.10 | passed | - | - | - |
| SCN-006.11 | passed | - | - | - |
| SCN-006.12 | passed | - | - | - |
| SCN-006.13 | passed | - | - | - |
| SCN-006.14 | passed | - | - | - |
| SCN-006.15 | passed | - | - | - |
| SCN-006.16 | passed | - | - | - |
| SCN-006.17 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-006.18 | passed | - | - | - |
| SCN-007 | passed | - | - | - |
| SCN-008 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-009 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-010 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-011 | passed | - | - | - |
| SCN-012 | passed | - | - | - |
| SCN-013 | passed | - | - | - |
| SCN-014 | passed | - | - | - |
| SCN-015 | passed | - | - | - |
| SCN-016 | passed | - | - | - |
| SCN-017 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-018 | passed | - | - | - |
| SCN-019 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-020 | passed | - | - | - |

## SCN-001: Contact form offers every field with an accessible label

- Requirement refs: AC-1
- Failing step: And the fields Name, Email, Phone, Subject and Message are each exposed with that accessible name
- Error: `[REQ AC-1 strict] Message field has an accessible label`
- Locator: `getByRole('textbox', { name: 'Message', exact: true })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-1f36a-ld-with-an-accessible-label-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-1f36a-ld-with-an-accessible-label-chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-1f36a-ld-with-an-accessible-label-chromium/error-context.md)

**Auto: APPLICATION_DEFECT (medium)**

- Target not found: getByRole('textbox', { name: 'Message', exact: true })
- This is a strict requirement assertion: the locator itself encodes the requirement (accessible name / role / alt text), so "not found" means the element is not exposed as required.

Next: Confirm live that the element exists but lacks the required accessible name/role (or is absent), then record with --set.

## SCN-003: An empty submission keeps the form and reports every field

- Requirement refs: AC-3
- Failing step: And the validation errors mention Name, Email, Phone, Subject and Message
- Error: `[REQ AC-3] validation errors mention Email`
- Locator: `locator('.alert-danger')`
- Expected: `/\bEmail\b/i`
- Received: `"Message must be between 20 and 2000 characters.Message may not be blankEmail may not be blankPhone may not be blankPhone must be between 11 and 21 characters.Subject must be between 5 and 100 characters.Name may not be blankSubject may not be blank"`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-8bad5-orm-and-reports-every-field-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-8bad5-orm-and-reports-every-field-chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-8bad5-orm-and-reports-every-field-chromium/error-context.md)

**Auto: SCRIPT_DEFECT (medium)**

- Requirement assertion [REQ AC-3] failed on a located element.
- Expected: /\bEmail\b/i
- Received: "Message must be between 20 and 2000 characters.Message may not be blankEmail may not be blankPhone may not be blankPhone must be between 11 and 21 characters.Subject must be between 5 and 100 characters.Name may not be blankSubject may not be blank"
- The received text DOES contain the expected content when the pattern is relaxed (/Email/i matches) — the assertion is stricter than the requirement.
- Also failed: [REQ AC-3] validation errors mention Phone — expected /\bPhone\b/i, received "Message must be between 20 and 2000 characters.Message may not be blankEmail may not be blankPhone may not be blankPhone must be between 11 and 21 characters.Subject must be between 5 and 100 characters.Name may not be blankSubject may not be blank"

Next: Fix the assertion implementation (e.g. drop word boundaries/anchors) without changing what it requires; record it with integrity.ts --amend, then re-run.

## SCN-005: Creating a valid enquiry returns 201 Created

- Requirement refs: AC-5
- Failing step: Then the response status is 201
- Error: `[REQ AC-5] create enquiry → 201 Created`
- Expected: `201`
- Received: `200`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **200**
  - request body: `{"name":"QA Guest ij2zovny-5","email":"qa.guest@example.com","phone":"01234567890","subject":"QA Subject ij2zovzp-6","description":"QA held-out evaluation enquiry — please ignore this message."}`
  - response body: `{"success":true}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-5439a-enquiry-returns-201-Created-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-5439a-enquiry-returns-201-Created-chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-5439a-enquiry-returns-201-Created-chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: 201
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-006.1: The API enforces field boundaries (name 1 characters → rejected)

- Requirement refs: AC-4, AC-6
- Failing step: Then the enquiry is rejected
- Error: `[REQ AC-6] name 1 characters is rejected with 400`
- Expected: `400`
- Received: `200`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **200**
  - request body: `{"name":"q","email":"qa.guest@example.com","phone":"01234567890","subject":"QA Subject ij31inza-2","description":"QA held-out evaluation enquiry — please ignore this message."}`
  - response body: `{"success":true}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-0cff5-me-1-characters-→-rejected--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-0cff5-me-1-characters-→-rejected--chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-0cff5-me-1-characters-→-rejected--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-006.4: The API enforces field boundaries (name 51 characters → rejected)

- Requirement refs: AC-4, AC-6
- Failing step: Then the enquiry is rejected
- Error: `[REQ AC-6] name 51 characters is rejected with 400`
- Expected: `400`
- Received: `200`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **200**
  - request body: `{"name":"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq","email":"qa.guest@example.com","phone":"01234567890","subject":"QA Subject ij31hzu9-8","description":"QA held-out evaluation enquiry — please ignore this message."}`
  - response body: `{"success":true}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-842eb-e-51-characters-→-rejected--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-842eb-e-51-characters-→-rejected--chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-842eb-e-51-characters-→-rejected--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-006.17: The API enforces field boundaries (email "guest@example" → rejected)

- Requirement refs: AC-4, AC-6
- Failing step: Then the enquiry is rejected
- Error: `[REQ AC-6] email "guest@example" is rejected with 400`
- Expected: `400`
- Received: `200`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **200**
  - request body: `{"name":"QA Guest ij34kk8e-7","email":"guest@example","phone":"01234567890","subject":"QA Subject ij34kkwg-8","description":"QA held-out evaluation enquiry — please ignore this message."}`
  - response body: `{"success":true}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-247ff-l-guest-example-→-rejected--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-247ff-l-guest-example-→-rejected--chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-247ff-l-guest-example-→-rejected--chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-008: A malformed JSON body is a client error

- Requirement refs: AC-7
- Failing step: Then the response status is 400
- Error: `[REQ AC-7] malformed JSON → 400 (never 5xx)`
- Expected: `400`
- Received: `500`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **500**
  - request body: `{"name": "QA malformed", "email": `
  - response body: `{"error":"Failed to create message"}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-98962-JSON-body-is-a-client-error-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-98962-JSON-body-is-a-client-error-chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-98962-JSON-body-is-a-client-error-chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

## SCN-009: Listing enquiries without a staff token is refused

- Requirement refs: AC-8
- Failing step: Then the response status is 401
- Error: `[REQ AC-8] message list without token → 401`
- Expected: `401`
- Received: `200`
- Last API exchange (of 1): `GET https://automationintesting.online/api/message` → **200**
  - request body: ``
  - response body: `{"messages":[{"id":1,"name":"James Dean","read":false,"subject":"Booking enquiry"},{"id":2,"name":"QA Probe","read":false,"subject":"QA probe subject"},{"id":3,"name":"QA probe","read":false,"subject":"QA probe subject"},{"id":4,"name":"QA Guest ij2v6b6g-1","read":false,"subject":"QA Subject ij2v6b78-2"},{"id":5,"name":"QA Guest ij2zovny-5","read":false,"subject":"QA Subject ij2zovzp-6"},{"id":6,"name":"qq","read":false,"subject":"QA Subject ij30xqya-6"},{"id":7,"name":"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq","read":false,"subject":"QA Subject ij31hzu9-8"},{"id":8,"name":"q","read…`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-d0702-ut-a-staff-token-is-refused-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-d0702-ut-a-staff-token-is-refused-chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-d0702-ut-a-staff-token-is-refused-chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/message → 200
- Requirement assertion [REQ AC-8] failed.
- Expected: 401
- Received: 200
- Also failed: [REQ AC-8] no message data without token — expected not "\"messages\"", received "{\"messages\":[{\"id\":1,\"name\":\"James Dean\",\"read\":false,\"subject\":\"Booking enquiry\"},{\"id\":2,\"name\":\"QA Probe\",\"read\":false,\"subject\":\"QA probe subject\"},{\"id\":3,\"name\":\"QA probe\",\"read\":false,\"subject\":\"QA probe subject\"},{\"id\":4,\"name\":\"QA Guest ij2v6b6g-1\",\"read\":false,\"subject\":\"QA Subject ij2v6b78-2\"},{\"id\":5,\"name\":\"QA Guest ij2zovny-5\",\"read\":false,\"subject\":\"QA Subject ij2zovzp-6\"},{\"id\":6,\"name\":\"qq\",\"read\":false,\"subject\":\"QA Subject ij30xqya-6\"},{\"id\":7,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ij31hzu9-8\"},{\"id\":8,\"name\":\"q\",\"read\":false,\"subject\":\"QA Subject ij31inza-2\"},{\"id\":9,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ij31u420-2\"},{\"id\":10,\"name\":\"QA Guest ij32am21-3\",\"read\":false,\"subject\":\"QA Subject ij32amyp-4\"},{\"id\":11,\"name\":\"QA Guest ij331zwi-1\",\"read\":false,\"subject\":\"QA Subject ij331z0t-2\"},{\"id\":12,\"name\":\"QA Guest ij33l52w-3\",\"read\":false,\"subject\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\"},{\"id\":13,\"name\":\"QA Guest ij33k9cy-9\",\"read\":false,\"subject\":\"qqqqq\"},{\"id\":14,\"name\":\"QA Guest ij342z4l-5\",\"read\":false,\"subject\":\"QA Subject ij342z13-6\"},{\"id\":15,\"name\":\"QA Guest ij344xlg-11\",\"read\":false,\"subject\":\"QA Subject ij344xqk-12\"},{\"id\":16,\"name\":\"QA Guest ij34loyg-13\",\"read\":false,\"subject\":\"QA Subject ij34loz4-14\"},{\"id\":17,\"name\":\"QA Guest ij34kk8e-7\",\"read\":false,\"subject\":\"QA Subject ij34kkwg-8\"}]}"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-010: Reading an enquiry without a staff token is refused

- Requirement refs: AC-8
- Failing step: Then the response status is 401
- Error: `[REQ AC-8] message detail without token → 401`
- Expected: `401`
- Received: `200`
- Last API exchange (of 3): `GET https://automationintesting.online/api/message/1` → **200**
  - request body: ``
  - response body: `{"description":"I would like to book a room at your place","email":"james@email.com","messageid":1,"name":"James Dean","phone":"01402 619211","subject":"Booking enquiry"}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-a5988-ut-a-staff-token-is-refused-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-a5988-ut-a-staff-token-is-refused-chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-a5988-ut-a-staff-token-is-refused-chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/message/1 → 200
- Requirement assertion [REQ AC-8] failed.
- Expected: 401
- Received: 200
- Also failed: [REQ AC-8] no personal data without token

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-017: An unknown room id returns 404

- Requirement refs: AC-12
- Failing step: Then the response status is 404
- Error: `[REQ AC-12] unknown room → 404`
- Expected: `404`
- Received: `500`
- Last API exchange (of 2): `GET https://automationintesting.online/api/room/100003` → **500**
  - request body: ``
  - response body: `{"timestamp":"2026-09-26T15:12:01.988Z","status":500,"error":"Internal Server Error","path":"/room/100003"}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-3a801-unknown-room-id-returns-404-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-3a801-unknown-room-id-returns-404-chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-3a801-unknown-room-id-returns-404-chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/room/100003 → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

## SCN-019: Room card images name their own room type

- Requirement refs: AC-14
- Failing step: Then each room card's image has the alternative text "<Type> Room" for that card's type
- Error: `[REQ AC-14] Double card image alt text`
- Locator: `locator('.room-card').filter({ has: getByRole('heading', { name: 'Double', exact: true }) }).first().getByRole('img').first()`
- Expected: `"Double Room"`
- Received: `"Single Room"`
- Last API exchange (of 1): `GET https://automationintesting.online/api/room` → **200**
  - request body: ``
  - response body: `{"rooms":[{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"},{"accessible":true,"description":"Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl. ","features":["TV","Radio","Safe"],"image":"/images/room2.jpg","roomName":"102","roomPrice":150,"roomid":…`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-9696b-es-name-their-own-room-type-chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/02-harden-check/artifacts/DEMO-202-tests-demo-202-DE-9696b-es-name-their-own-room-type-chromium/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-9696b-es-name-their-own-room-type-chromium/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/room → 200
- Requirement assertion [REQ AC-14] failed.
- Expected: "Double Room"
- Received: "Single Room"
- Also failed: [REQ AC-14] Suite card image alt text — expected "Suite Room", received "Single Room"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.
