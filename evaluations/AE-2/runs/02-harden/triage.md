# Triage — AE-2 / run 02-harden

Generated 2026-09-27T06:07:35.773Z

**32/38 passed**, 6 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | contract | AC-1 | passed | - | - | - |
| SCN-003 | negative | AC-2 | passed | - | - | - |
| SCN-004 | negative | AC-3 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-005.1 | negative | AC-4 | passed | - | - | - |
| SCN-005.2 | negative | AC-4 | passed | - | - | - |
| SCN-005.3 | negative | AC-4 | passed | - | - | - |
| SCN-005.4 | negative | AC-4 | passed | - | - | - |
| SCN-005.5 | negative | AC-4 | passed | - | - | - |
| SCN-005.6 | negative | AC-4 | passed | - | - | - |
| SCN-005.7 | negative | AC-4 | passed | - | - | - |
| SCN-005.8 | negative | AC-4 | passed | - | - | - |
| SCN-005.9 | negative | AC-4 | passed | - | - | - |
| SCN-005.10 | negative | AC-4 | passed | - | - | - |
| SCN-005.11 | negative | AC-4 | passed | - | - | - |
| SCN-006 | negative | AC-5 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-007.1 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-007.2 | boundary | AC-5 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-008 | functional | AC-6 | passed | - | - | - |
| SCN-009 | negative | AC-6 | passed | - | - | - |
| SCN-010 | negative | AC-6 | passed | - | - | - |
| SCN-011.1 | negative | AC-6 | passed | - | - | - |
| SCN-011.2 | negative | AC-6 | passed | - | - | - |
| SCN-012 | contract | AC-6 | passed | - | - | - |
| SCN-013 | contract | AC-7 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-014 | functional | AC-7 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-015 | functional | AC-7 | passed | - | - | - |
| SCN-016 | security | AC-7 | passed | - | - | - |
| SCN-017 | negative | AC-7 | passed | - | - | - |
| SCN-018 | functional | AC-8 | passed | - | - | - |
| SCN-019 | negative | AC-8 | passed | - | - | - |
| SCN-020 | functional | AC-9 | passed | - | - | - |
| SCN-021 | negative | AC-9 | passed | - | - | - |
| SCN-022 | negative | AC-9 | passed | - | - | - |
| SCN-023 | integration | AC-10 | passed | - | - | - |
| SCN-024 | integration | AC-10 | passed | - | - | - |
| SCN-025 | negative | AC-11 | passed | - | - | - |
| SCN-026 | negative | AC-12 | passed | - | - | - |

## SCN-004: An e-mail that differs from a registered one only in letter case is refused

- Requirement refs: AC-3 · type: negative · layer: api
- Failing step: Then the responseCode is 400
- Repeats: failed **3 of 3**
- Error: `[REQ AC-3] e-mail differing only in case → responseCode 400`
- Expected: `400`
- Received: `201`
- Relevant API exchange (#1 of 1): `POST https://automationexercise.com/api/createAccount` → **200**
  - request body: `{"name":"QA Customer jf0l48d8-2","email":"HXF0KU420.MUJF0KU5BWDP1@EXAMPLE.COM","password":"***redacted***","title":"Mrs","birth_date":"12","birth_month":"March","birth_year":"1991","firstname":"Asha","lastname":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","zipcode":"560001","state":"Karnataka","city":"Bengaluru","mobile_number":"9800000000"}`
  - response body: `{"responseCode":201,"message":"User created!"}`
- Evidence: [screenshot](artifacts/AE-2-tests-ae-2-AE-2-Custo-b5c52-y-in-letter-case-is-refused-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-2/runs/02-harden/artifacts/AE-2-tests-ae-2-AE-2-Custo-b5c52-y-in-letter-case-is-refused-chromium-retry1/trace.zip` · [error-context](artifacts/AE-2-tests-ae-2-AE-2-Custo-b5c52-y-in-letter-case-is-refused-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/createAccount → 200
- Requirement assertion [REQ AC-3] failed.
- Expected: 400
- Received: 201

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-006: createAccount with an e-mail that has no "@" is refused and creates nothing

- Requirement refs: AC-5 · type: negative · layer: api
- Failing step: Then the responseCode is 400
- Repeats: failed **3 of 3**
- Error: `[REQ AC-5] e-mail without "@" → responseCode 400`
- Expected: `400`
- Received: `201`
- Relevant API exchange (#1 of 1): `POST https://automationexercise.com/api/createAccount` → **200**
  - request body: `{"name":"QA Customer jf0pe6cf-1","email":"hxf0pe550.mujf0pe6km3p1.at.example.com","password":"***redacted***","title":"Mrs","birth_date":"12","birth_month":"March","birth_year":"1991","firstname":"Asha","lastname":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","zipcode":"560001","state":"Karnataka","city":"Bengaluru","mobile_number":"9800000000"}`
  - response body: `{"responseCode":201,"message":"User created!"}`
- Evidence: [screenshot](artifacts/AE-2-tests-ae-2-AE-2-Custo-03816-refused-and-creates-nothing-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-2/runs/02-harden/artifacts/AE-2-tests-ae-2-AE-2-Custo-03816-refused-and-creates-nothing-chromium-retry1/trace.zip` · [error-context](artifacts/AE-2-tests-ae-2-AE-2-Custo-03816-refused-and-creates-nothing-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/createAccount → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: 400
- Received: 201

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-007.1: createAccount with an e-mail that has an "@" but is still invalid is refused and creates nothing (no domain after the "@")

- Requirement refs: AC-5 · type: boundary · layer: api
- Failing step: Then the responseCode is 400
- Repeats: failed **3 of 3**
- Error: `[REQ AC-5] invalid e-mail (no domain after the "@") → responseCode 400`
- Expected: `400`
- Received: `201`
- Relevant API exchange (#1 of 1): `POST https://automationexercise.com/api/createAccount` → **200**
  - request body: `{"name":"QA Customer jf0pe9pr-1","email":"hxf0pe740.mujf0pe8zbhb1@","password":"***redacted***","title":"Mrs","birth_date":"12","birth_month":"March","birth_year":"1991","firstname":"Asha","lastname":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","zipcode":"560001","state":"Karnataka","city":"Bengaluru","mobile_number":"9800000000"}`
  - response body: `{"responseCode":201,"message":"User created!"}`
- Evidence: [screenshot](artifacts/AE-2-tests-ae-2-AE-2-Custo-238db-othing-no-domain-after-the--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-2/runs/02-harden/artifacts/AE-2-tests-ae-2-AE-2-Custo-238db-othing-no-domain-after-the--chromium-retry1/trace.zip` · [error-context](artifacts/AE-2-tests-ae-2-AE-2-Custo-238db-othing-no-domain-after-the--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/createAccount → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: 400
- Received: 201

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-007.2: createAccount with an e-mail that has an "@" but is still invalid is refused and creates nothing (no local part before the "@")

- Requirement refs: AC-5 · type: boundary · layer: api
- Failing step: Then the responseCode is 400
- Repeats: failed **3 of 3**
- Error: `[REQ AC-5] invalid e-mail (no local part before the "@") → responseCode 400`
- Expected: `400`
- Received: `201`
- Relevant API exchange (#1 of 1): `POST https://automationexercise.com/api/createAccount` → **200**
  - request body: `{"name":"QA Customer jf0sn48o-1","email":"@hxf0sn280.mujf0sn3gcl81.example.com","password":"***redacted***","title":"Mrs","birth_date":"12","birth_month":"March","birth_year":"1991","firstname":"Asha","lastname":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","zipcode":"560001","state":"Karnataka","city":"Bengaluru","mobile_number":"9800000000"}`
  - response body: `{"responseCode":201,"message":"User created!"}`
- Evidence: [screenshot](artifacts/AE-2-tests-ae-2-AE-2-Custo-cd8e1-g-no-local-part-before-the--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-2/runs/02-harden/artifacts/AE-2-tests-ae-2-AE-2-Custo-cd8e1-g-no-local-part-before-the--chromium-retry1/trace.zip` · [error-context](artifacts/AE-2-tests-ae-2-AE-2-Custo-cd8e1-g-no-local-part-before-the--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/createAccount → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: 400
- Received: 201

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-013: getUserDetailByEmail returns a user object with every field of the contract

- Requirement refs: AC-7 · type: contract · layer: api
- Failing step: And the user object has the fields id, name, email, title, birth_day, birth_month, birth_year, first_name, last_name, company, address1, address2, country, state, city, zipcode, mobile_number
- Repeats: failed **3 of 3**
- Error: `[REQ AC-7] user object has every contract field`
- Expected: `[Array []]`
- Received: `["user.mobile_number is missing"]`
- Relevant API exchange (#1 of 1): `GET https://automationexercise.com/api/getUserDetailByEmail?email=hxf0v13100.mujf0v14jx8h1%40example.com` → **200**
  - request body: ``
  - response body: `{"responseCode":200,"user":{"id":2937163,"name":"QA Customer jf0v14nl-1","email":"hxf0v13100.mujf0v14jx8h1@example.com","title":"Mrs","birth_day":"12","birth_month":"March","birth_year":"1991","first_name":"Asha","last_name":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","state":"Karnataka","city":"Bengaluru","zipcode":"560001"}}`
- Evidence: [screenshot](artifacts/AE-2-tests-ae-2-AE-2-Custo-e3e65-every-field-of-the-contract-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-2/runs/02-harden/artifacts/AE-2-tests-ae-2-AE-2-Custo-e3e65-every-field-of-the-contract-chromium-retry1/trace.zip` · [error-context](artifacts/AE-2-tests-ae-2-AE-2-Custo-e3e65-every-field-of-the-contract-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/getUserDetailByEmail → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: [Array []]
- Received: ["user.mobile_number is missing"]

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-014: getUserDetailByEmail returns the registration values of the same-named fields

- Requirement refs: AC-7 · type: functional · layer: api
- Failing step: And name, email, title, birth_month, birth_year, company, address1, address2, country, state, city, zipcode and mobile_number hold the registration values
- Repeats: failed **3 of 3**
- Error: `[REQ AC-7] user.mobile_number holds the registration value`
- Expected: `"9800000000"`
- Received: `"undefined"`
- Relevant API exchange (#1 of 1): `GET https://automationexercise.com/api/getUserDetailByEmail?email=hxf0w21110.mujf0w227jhq1%40example.com` → **200**
  - request body: ``
  - response body: `{"responseCode":200,"user":{"id":2937164,"name":"QA Customer jf0w22u1-1","email":"hxf0w21110.mujf0w227jhq1@example.com","title":"Mrs","birth_day":"12","birth_month":"March","birth_year":"1991","first_name":"Asha","last_name":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","state":"Karnataka","city":"Bengaluru","zipcode":"560001"}}`
- Evidence: [screenshot](artifacts/AE-2-tests-ae-2-AE-2-Custo-02dd4-es-of-the-same-named-fields-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-2/runs/02-harden/artifacts/AE-2-tests-ae-2-AE-2-Custo-02dd4-es-of-the-same-named-fields-chromium-retry1/trace.zip` · [error-context](artifacts/AE-2-tests-ae-2-AE-2-Custo-02dd4-es-of-the-same-named-fields-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/getUserDetailByEmail → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: "9800000000"
- Received: "undefined"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.
