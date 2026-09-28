# Triage — JS-2 / run 02-eval

Generated 2026-09-28T23:03:23.981Z

**4/8 passed**, 4 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | negative | AC-2 | passed | - | - | - |
| SCN-003.1 | boundary | AC-3 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-003.2 | boundary | AC-3 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-005 | functional | AC-4 | passed | - | - | - |
| SCN-006 | integration | AC-5 | passed | - | - | - |
| SCN-007 | security | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-008 | security | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |

## SCN-003.1: A password shorter than 5 characters is rejected and no customer is created (4 characters)

- Requirement refs: AC-3 · type: boundary · layer: api
- Failing step: Then registering with a 4-character password → HTTP 400
- Error: `[REQ AC-3] POST /api/Users with a 4-character password (minimum 5) → 400`
- Expected: `400`
- Received: `201`
- Relevant API exchange (#1 of 2): `POST http://localhost:3000/api/Users` → **201**
  - request body: `{"email":"hldout-lusnrxtg-1@example.com","password":"Qx9!","passwordRepeat":"Qx9!","securityQuestion":{"id":1},"securityAnswer":"heldout"}`
  - response body: `{"status":"success","data":{"username":"","role":"customer","deluxeToken":"***redacted***","lastLoginIp":"0.0.0.0","profileImage":"/assets/public/images/uploads/default.svg","isActive":true,"id":145,"email":"hldout-lusnrxtg-1@example.com","updatedAt":"2026-09-28T23:03:15.657Z","createdAt":"2026-09-28T23:03:15.657Z","deletedAt":null}}`
- Evidence: [screenshot](artifacts/JS-2-tests-js-2-JS-2-Custo-37f44-er-is-created-4-characters--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/JS-2/runs/02-eval/artifacts/JS-2-tests-js-2-JS-2-Custo-37f44-er-is-created-4-characters--chromium-retry1/trace.zip` · [error-context](artifacts/JS-2-tests-js-2-JS-2-Custo-37f44-er-is-created-4-characters--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/Users → 201
- Requirement assertion [REQ AC-3] failed.
- Expected: 400
- Received: 201
- Also failed: [REQ AC-3] POST /rest/user/login after a 4-character registration fails (no customer was created) — expected false, received true

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT** — AC-3 with the PO comment requires a password shorter than 5 characters to be rejected with 400 and no customer created. Live: a 4- and a 3-character password are answered 201 and the customer can log in.

## SCN-003.2: A password shorter than 5 characters is rejected and no customer is created (3 characters)

- Requirement refs: AC-3 · type: boundary · layer: api
- Failing step: Then registering with a 3-character password → HTTP 400
- Error: `[REQ AC-3] POST /api/Users with a 3-character password (minimum 5) → 400`
- Expected: `400`
- Received: `201`
- Relevant API exchange (#1 of 2): `POST http://localhost:3000/api/Users` → **201**
  - request body: `{"email":"hldout-lusnrzii-1@example.com","password":"Qx9","passwordRepeat":"Qx9","securityQuestion":{"id":1},"securityAnswer":"heldout"}`
  - response body: `{"status":"success","data":{"username":"","role":"customer","deluxeToken":"***redacted***","lastLoginIp":"0.0.0.0","profileImage":"/assets/public/images/uploads/default.svg","isActive":true,"id":144,"email":"hldout-lusnrzii-1@example.com","updatedAt":"2026-09-28T23:03:15.652Z","createdAt":"2026-09-28T23:03:15.652Z","deletedAt":null}}`
- Evidence: [screenshot](artifacts/JS-2-tests-js-2-JS-2-Custo-4e62c-er-is-created-3-characters--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/JS-2/runs/02-eval/artifacts/JS-2-tests-js-2-JS-2-Custo-4e62c-er-is-created-3-characters--chromium-retry1/trace.zip` · [error-context](artifacts/JS-2-tests-js-2-JS-2-Custo-4e62c-er-is-created-3-characters--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/Users → 201
- Requirement assertion [REQ AC-3] failed.
- Expected: 400
- Received: 201
- Also failed: [REQ AC-3] POST /rest/user/login after a 3-character registration fails (no customer was created) — expected false, received true

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT** — AC-3 with the PO comment requires a password shorter than 5 characters to be rejected with 400 and no customer created. Live: a 4- and a 3-character password are answered 201 and the customer can log in.

## SCN-007: A customer reads their own basket but never another customer's

- Requirement refs: AC-6 · type: security · layer: api
- Failing step: And the request for B's basket does not return B's basket
- Error: `[REQ AC-6] GET /rest/basket/{id} for B's basket with A's token does not return B's basket`
- Expected: `not 115`
- Received: `115`
- Relevant API exchange (#2 of 2): `GET http://localhost:3000/rest/basket/115` → **200**
  - request body: ``
  - response body: `{"status":"success","data":{"id":115,"coupon":null,"UserId":147,"createdAt":"2026-09-28T23:03:17.101Z","updatedAt":"2026-09-28T23:03:17.101Z","Products":[{"id":1,"name":"Apple Juice (1000ml)","description":"The all-time classic.","price":1.99,"deluxePrice":0.99,"image":"apple_juice.jpg","createdAt":"2026-09-28T20:32:12.935Z","updatedAt":"2026-09-28T20:32:12.935Z","deletedAt":null,"BasketItem":{"ProductId":1,"BasketId":115,"id":43,"quantity":1,"createdAt":"2026-09-28T23:03:17.156Z","updatedAt":"2026-09-28T23:03:17.156Z"}}]}}`
- Evidence: [screenshot](artifacts/JS-2-tests-js-2-JS-2-Custo-1ac60-ut-never-another-customer-s-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/JS-2/runs/02-eval/artifacts/JS-2-tests-js-2-JS-2-Custo-1ac60-ut-never-another-customer-s-chromium-retry1/trace.zip` · [error-context](artifacts/JS-2-tests-js-2-JS-2-Custo-1ac60-ut-never-another-customer-s-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /rest/basket/115 → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: not 115
- Received: 115

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT** — AC-6: a request authenticated as A for B's basket must be refused and must not return B's basket. Live: A's token on B's basket id answers 200 with B's basket (its UserId is B's).

## SCN-008: A request for another customer's basket is refused

- Requirement refs: AC-6 · type: security · layer: api
- Failing step: Then the request is refused with a non-2xx status
- Error: `[REQ AC-6] GET /rest/basket/{id} for B's basket with A's token is refused (not 2xx)`
- Expected: `not /^2\d\d$/`
- Received: `"200"`
- Relevant API exchange (#1 of 1): `GET http://localhost:3000/rest/basket/119` → **200**
  - request body: ``
  - response body: `{"status":"success","data":{"id":119,"coupon":null,"UserId":151,"createdAt":"2026-09-28T23:03:18.566Z","updatedAt":"2026-09-28T23:03:18.566Z","Products":[{"id":1,"name":"Apple Juice (1000ml)","description":"The all-time classic.","price":1.99,"deluxePrice":0.99,"image":"apple_juice.jpg","createdAt":"2026-09-28T20:32:12.935Z","updatedAt":"2026-09-28T20:32:12.935Z","deletedAt":null,"BasketItem":{"ProductId":1,"BasketId":119,"id":45,"quantity":1,"createdAt":"2026-09-28T23:03:18.610Z","updatedAt":"2026-09-28T23:03:18.610Z"}}]}}`
- Evidence: [screenshot](artifacts/JS-2-tests-js-2-JS-2-Custo-13744-ustomer-s-basket-is-refused-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/JS-2/runs/02-eval/artifacts/JS-2-tests-js-2-JS-2-Custo-13744-ustomer-s-basket-is-refused-chromium-retry1/trace.zip` · [error-context](artifacts/JS-2-tests-js-2-JS-2-Custo-13744-ustomer-s-basket-is-refused-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /rest/basket/119 → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: not /^2\d\d$/
- Received: "200"
- SCN-008 rests on an unsettled reading (assumed G4). Confirm what the application does as usual; the verdict then lists it as a question for the owner, not as a defect.

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT** — Same root cause as SCN-007: the request is not refused (200).
