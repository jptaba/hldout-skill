# Triage — DEMO-202 / run 04-rerun

Generated 2026-09-26T15:32:12.938Z

**30/41 passed**, 11 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | accessibility | AC-1 | failed | APPLICATION_DEFECT | medium | **APPLICATION_DEFECT** |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | negative | AC-3 | passed | - | - | - |
| SCN-004.1 | boundary | AC-4 | passed | - | - | - |
| SCN-004.2 | boundary | AC-4 | passed | - | - | - |
| SCN-004.3 | boundary | AC-4 | passed | - | - | - |
| SCN-005 | functional | AC-5 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-006.1 | boundary | AC-4, AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-006.2 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.3 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.4 | boundary | AC-4, AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-006.5 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.6 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.7 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.8 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.9 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.10 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.11 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.12 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.13 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.14 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.15 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.16 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-006.17 | boundary | AC-4, AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-006.18 | boundary | AC-4, AC-6 | passed | - | - | - |
| SCN-007 | negative | AC-6 | passed | - | - | - |
| SCN-008 | negative | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-009 | security | AC-8 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-010 | security | AC-8 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-011 | functional | AC-8 | passed | - | - | - |
| SCN-012 | functional | AC-9 | passed | - | - | - |
| SCN-013 | negative | AC-9 | passed | - | - | - |
| SCN-014 | integration | AC-10 | passed | - | - | - |
| SCN-015 | contract | AC-11 | passed | - | - | - |
| SCN-016 | contract | AC-12 | passed | - | - | - |
| SCN-017 | negative | AC-12 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-018 | integration | AC-13 | passed | - | - | - |
| SCN-019 | accessibility | AC-14 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-020 | performance | AC-15 | passed | - | - | - |
| SCN-021 | idempotency | AC-16 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-022 | idempotency | AC-16 | passed | - | - | - |

## SCN-001: Contact form offers every field with an accessible label

- Requirement refs: AC-1 · type: accessibility · layer: ui
- Failing step: And the fields Name, Email, Phone, Subject and Message are each exposed with that accessible name
- Error: `[REQ AC-1 strict] Message field has an accessible label`
- Locator: `getByRole('textbox', { name: 'Message', exact: true })`
- Expected: `visible`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-1f36a-ld-with-an-accessible-label-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-1f36a-ld-with-an-accessible-label-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-1f36a-ld-with-an-accessible-label-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (medium)**

- Target not found: getByRole('textbox', { name: 'Message', exact: true })
- This is a strict requirement assertion: the locator itself encodes the requirement (accessible name / role / alt text), so "not found" means the element is not exposed as required.

Next: Confirm live that the element exists but lacks the required accessible name/role (or is absent), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — The strict AC-1 assertion requires every field to be exposed with its accessible name. Name/Email/Phone/Subject pass; Message has no accessible name. Root cause found live: <label for="message"> points to a non-existent id, while the textarea's id is "description", so screen readers announce an unlabeled edit field (WCAG 1.3.1/4.1.2). Automatic triage correctly flagged a strict-assertion failure. (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-005: Creating a valid enquiry returns 201 Created

- Requirement refs: AC-5 · type: functional · layer: api
- Failing step: Then the response status is 201
- Error: `[REQ AC-5] create enquiry → 201 Created`
- Expected: `201`
- Received: `200`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **200**
  - request body: `{"name":"QA Guest ijk39kji-1","email":"qa.guest@example.com","phone":"01234567890","subject":"QA Subject ijk39knf-2","description":"QA held-out evaluation enquiry — please ignore this message."}`
  - response body: `{"success":true}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-5439a-enquiry-returns-201-Created-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-5439a-enquiry-returns-201-Created-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-5439a-enquiry-returns-201-Created-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: 201
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — Valid enquiry is stored (body {"success":true} matches) but the status is 200; api-contract.md and AC-5 require 201 Created. Contract deviation that API clients relying on 201 would mis-handle. (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-006.1: The API enforces field boundaries (name 1 characters → rejected)

- Requirement refs: AC-4, AC-6 · type: boundary · layer: api
- Failing step: Then the enquiry is rejected
- Error: `[REQ AC-6] name 1 characters is rejected with 400`
- Expected: `400`
- Received: `200`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **200**
  - request body: `{"name":"q","email":"qa.guest@example.com","phone":"01234567890","subject":"QA Subject ijk3mjyi-2","description":"QA held-out evaluation enquiry — please ignore this message."}`
  - response body: `{"success":true}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-0cff5-me-1-characters-→-rejected--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-0cff5-me-1-characters-→-rejected--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-0cff5-me-1-characters-→-rejected--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — field-rules.csv requires Name 2–50 characters with the error 'Name must be between 2 and 50 characters.'. The API accepts 1- and 51-character names (200). Both boundary rows fail for the same missing rule; the 2 and 50 rows pass. (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-006.4: The API enforces field boundaries (name 51 characters → rejected)

- Requirement refs: AC-4, AC-6 · type: boundary · layer: api
- Failing step: Then the enquiry is rejected
- Error: `[REQ AC-6] name 51 characters is rejected with 400`
- Expected: `400`
- Received: `200`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **200**
  - request body: `{"name":"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq","email":"qa.guest@example.com","phone":"01234567890","subject":"QA Subject ijk5el45-2","description":"QA held-out evaluation enquiry — please ignore this message."}`
  - response body: `{"success":true}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-842eb-e-51-characters-→-rejected--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-842eb-e-51-characters-→-rejected--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-842eb-e-51-characters-→-rejected--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — field-rules.csv requires Name 2–50 characters with the error 'Name must be between 2 and 50 characters.'. The API accepts 1- and 51-character names (200). Both boundary rows fail for the same missing rule; the 2 and 50 rows pass. (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-006.17: The API enforces field boundaries (email "guest@example" → rejected)

- Requirement refs: AC-4, AC-6 · type: boundary · layer: api
- Failing step: Then the enquiry is rejected
- Error: `[REQ AC-6] email "guest@example" is rejected with 400`
- Expected: `400`
- Received: `200`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **200**
  - request body: `{"name":"QA Guest ijk9l0ug-1","email":"guest@example","phone":"01234567890","subject":"QA Subject ijk9l07k-2","description":"QA held-out evaluation enquiry — please ignore this message."}`
  - response body: `{"success":true}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-247ff-l-guest-example-→-rejected--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-247ff-l-guest-example-→-rejected--chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-247ff-l-guest-example-→-rejected--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 400
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — field-rules.csv explicitly states guest@example is invalid (a domain AND a top-level domain are required). The API accepts it with 200. (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-008: A malformed JSON body is a client error

- Requirement refs: AC-7 · type: negative · layer: api
- Failing step: Then the response status is 400
- Error: `[REQ AC-7] malformed JSON → 400 (never 5xx)`
- Expected: `400`
- Received: `500`
- Last API exchange (of 1): `POST https://automationintesting.online/api/message` → **500**
  - request body: `{"name": "QA malformed", "email": `
  - response body: `{"error":"Failed to create message"}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-98962-JSON-body-is-a-client-error-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-98962-JSON-body-is-a-client-error-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-98962-JSON-body-is-a-client-error-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/message → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-7: a non-JSON body is a client error and must be 400, never 5xx. The API answers 500 {"error":"Failed to create message"}: server-side failure on client input, which also pollutes error monitoring. (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-009: Listing enquiries without a staff token is refused

- Requirement refs: AC-8 · type: security · layer: api
- Failing step: Then the response status is 401
- Error: `[REQ AC-8] message list without token → 401`
- Expected: `401`
- Received: `200`
- Last API exchange (of 1): `GET https://automationintesting.online/api/message` → **200**
  - request body: ``
  - response body: `{"messages":[{"id":1,"name":"James Dean","read":false,"subject":"Booking enquiry"},{"id":2,"name":"ttt ttt","read":false,"subject":"You have a new booking!"},{"id":3,"name":"QA Guest ijjvtm33-1","read":false,"subject":"QA Subject ijjvtmxc-2"},{"id":4,"name":"QA Guest ijk109sz-3","read":false,"subject":"QA Subject ijk109c2-4"},{"id":5,"name":"q","read":false,"subject":"QA Subject ijk22yyz-4"},{"id":6,"name":"qq","read":false,"subject":"QA Subject ijk2roqb-6"},{"id":7,"name":"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq","read":false,"subject":"QA Subject ijk3azl5-8"},{"id":8,"name":"QA Gu…`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-d0702-ut-a-staff-token-is-refused-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-d0702-ut-a-staff-token-is-refused-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-d0702-ut-a-staff-token-is-refused-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/message → 200
- Requirement assertion [REQ AC-8] failed.
- Expected: 401
- Received: 200
- Also failed: [REQ AC-8] no message data without token — expected not "\"messages\"", received "{\"messages\":[{\"id\":1,\"name\":\"James Dean\",\"read\":false,\"subject\":\"Booking enquiry\"},{\"id\":2,\"name\":\"ttt ttt\",\"read\":false,\"subject\":\"You have a new booking!\"},{\"id\":3,\"name\":\"QA Guest ijjvtm33-1\",\"read\":false,\"subject\":\"QA Subject ijjvtmxc-2\"},{\"id\":4,\"name\":\"QA Guest ijk109sz-3\",\"read\":false,\"subject\":\"QA Subject ijk109c2-4\"},{\"id\":5,\"name\":\"q\",\"read\":false,\"subject\":\"QA Subject ijk22yyz-4\"},{\"id\":6,\"name\":\"qq\",\"read\":false,\"subject\":\"QA Subject ijk2roqb-6\"},{\"id\":7,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ijk3azl5-8\"},{\"id\":8,\"name\":\"QA Guest ijk39kji-1\",\"read\":false,\"subject\":\"QA Subject ijk39knf-2\"},{\"id\":9,\"name\":\"q\",\"read\":false,\"subject\":\"QA Subject ijk3mjyi-2\"},{\"id\":10,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ijk3n4o3-10\"},{\"id\":11,\"name\":\"QA Guest ijk5emgv-1\",\"read\":false,\"subject\":\"QA Subject ijk5enzp-2\"},{\"id\":12,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ijk5el45-2\"},{\"id\":13,\"name\":\"QA Guest ijk5invw-3\",\"read\":false,\"subject\":\"QA Subject ijk5in1p-4\"},{\"id\":14,\"name\":\"QA Guest ijk6mt2w-5\",\"read\":false,\"subject\":\"qqqqq\"},{\"id\":15,\"name\":\"QA Guest ijk77017-9\",\"read\":false,\"subject\":\"QA Subject ijk770l0-10\"},{\"id\":16,\"name\":\"QA Guest ijk7d5es-1\",\"read\":false,\"subject\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\"},{\"id\":17,\"name\":\"QA Guest ijk7gfak-9\",\"read\":false,\"subject\":\"QA Subject ijk7gf0i-10\"},{\"id\":18,\"name\":\"QA Guest ijk7w6lf-11\",\"read\":false,\"subject\":\"QA Subject ijk7w6dn-12\"},{\"id\":19,\"name\":\"QA Guest ijk7ydol-3\",\"read\":false,\"subject\":\"QA Subject ijk7ydb9-4\"},{\"id\":20,\"name\":\"QA Guest ijk9l0ug-1\",\"read\":false,\"subject\":\"QA Subject ijk9l07k-2\"}]}"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — AC-8: list and detail require a staff token and must return 401 without it. Both return 200 with data to anonymous callers; the detail includes guest e-mail, phone and message text (personal data). Security/privacy defect: the token is not checked on these endpoints. (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-010: Reading an enquiry without a staff token is refused

- Requirement refs: AC-8 · type: security · layer: api
- Failing step: Then the response status is 401
- Error: `[REQ AC-8] message detail without token → 401`
- Expected: `401`
- Received: `200`
- Last API exchange (of 3): `GET https://automationintesting.online/api/message/1` → **200**
  - request body: ``
  - response body: `{"description":"I would like to book a room at your place","email":"james@email.com","messageid":1,"name":"James Dean","phone":"01402 619211","subject":"Booking enquiry"}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-a5988-ut-a-staff-token-is-refused-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-a5988-ut-a-staff-token-is-refused-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-a5988-ut-a-staff-token-is-refused-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/message/1 → 200
- Requirement assertion [REQ AC-8] failed.
- Expected: 401
- Received: 200
- Also failed: [REQ AC-8] no personal data without token

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — AC-8: list and detail require a staff token and must return 401 without it. Both return 200 with data to anonymous callers; the detail includes guest e-mail, phone and message text (personal data). Security/privacy defect: the token is not checked on these endpoints. (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-017: An unknown room id returns 404

- Requirement refs: AC-12 · type: negative · layer: api
- Failing step: Then the response status is 404
- Error: `[REQ AC-12] unknown room → 404`
- Expected: `404`
- Received: `500`
- Last API exchange (of 2): `GET https://automationintesting.online/api/room/100003` → **500**
  - request body: ``
  - response body: `{"timestamp":"2026-09-26T15:25:23.937Z","status":500,"error":"Internal Server Error","path":"/room/100003"}`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-3a801-unknown-room-id-returns-404-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-3a801-unknown-room-id-returns-404-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-3a801-unknown-room-id-returns-404-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/room/100003 → 500
- Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.

Next: Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-12 / api-contract.md: an unknown id must return 404. The API returns 500 Internal Server Error, so an unhandled not-found condition surfaces as a server fault. (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-019: Room card images name their own room type

- Requirement refs: AC-14 · type: accessibility · layer: e2e
- Failing step: Then each room card's image has the alternative text "<Type> Room" for that card's type
- Error: `[REQ AC-14] Double card image alt text`
- Locator: `locator('.room-card').filter({ has: getByRole('heading', { name: 'Double', exact: true }) }).first().getByRole('img').first()`
- Expected: `"Double Room"`
- Received: `"Single Room"`
- Last API exchange (of 1): `GET https://automationintesting.online/api/room` → **200**
  - request body: ``
  - response body: `{"rooms":[{"accessible":true,"description":"Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.","features":["TV","WiFi","Safe"],"image":"/images/room1.jpg","roomName":"101","roomPrice":100,"roomid":1,"type":"Single"},{"accessible":true,"description":"Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl. ","features":["TV","Radio","Safe"],"image":"/images/room2.jpg","roomName":"102","roomPrice":150,"roomid":…`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-9696b-es-name-their-own-room-type-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-9696b-es-name-their-own-room-type-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-9696b-es-name-their-own-room-type-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/room → 200
- Requirement assertion [REQ AC-14] failed.
- Expected: "Double Room"
- Received: "Single Room"
- Also failed: [REQ AC-14] Suite card image alt text — expected "Suite Room", received "Single Room"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-14 / ux-copy.md: each card image's alt text must name that card's type. The Single card is correct by coincidence; the Double and Suite cards also say 'Single Room', which misinforms screen-reader users (WCAG 1.1.1). (Confirmed in run 03-eval; identical failure signature in 04-rerun.)

## SCN-021: A retried enquiry with the same Idempotency-Key is stored only once

- Requirement refs: AC-16 · type: idempotency · layer: api
- Failing step: And the authenticated message list contains that subject exactly once
- Error: `[REQ AC-16] retried enquiry stored only once`
- Expected: `1`
- Received: `2`
- Last API exchange (of 4): `GET https://automationintesting.online/api/message` → **200**
  - request body: ``
  - response body: `{"messages":[{"id":1,"name":"James Dean","read":false,"subject":"Booking enquiry"},{"id":2,"name":"ttt ttt","read":false,"subject":"You have a new booking!"},{"id":3,"name":"QA Guest ijjvtm33-1","read":false,"subject":"QA Subject ijjvtmxc-2"},{"id":4,"name":"QA Guest ijk109sz-3","read":false,"subject":"QA Subject ijk109c2-4"},{"id":5,"name":"q","read":false,"subject":"QA Subject ijk22yyz-4"},{"id":6,"name":"qq","read":false,"subject":"QA Subject ijk2roqb-6"},{"id":7,"name":"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq","read":false,"subject":"QA Subject ijk3azl5-8"},{"id":8,"name":"QA Gu…`
- Evidence: [screenshot](artifacts/DEMO-202-tests-demo-202-DE-2010a-ncy-Key-is-stored-only-once-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-202/runs/04-rerun/artifacts/DEMO-202-tests-demo-202-DE-2010a-ncy-Key-is-stored-only-once-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-202-tests-demo-202-DE-2010a-ncy-Key-is-stored-only-once-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/message → 200
- Requirement assertion [REQ AC-16] failed.
- Expected: 1
- Received: 2

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-16(a) / api-contract.md v1.5: repeating POST /api/message with the same Idempotency-Key must store the enquiry once. Both calls answered 2xx (that part passes) but the staff list contains the subject twice. The header is ignored, so double-clicks and network retries create duplicate enquiries (the support problem that triggered rev 2).
