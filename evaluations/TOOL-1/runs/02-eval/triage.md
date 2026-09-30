# Triage — TOOL-1 / run 02-eval

Generated 2026-09-29T22:06:29.994Z

**10/14 passed**, 4 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | functional | AC-2 | passed | - | - | - |
| SCN-004 | negative | AC-3 | passed | - | - | - |
| SCN-005 | negative | AC-3 | passed | - | - | - |
| SCN-006 | functional | AC-4 | passed | - | - | - |
| SCN-007 | functional | AC-4 | passed | - | - | - |
| SCN-008 | functional | AC-5 | passed | - | - | - |
| SCN-009 | functional | AC-5 | passed | - | - | - |
| SCN-010 | functional | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-011 | contract | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-012.1 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-012.2 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-013 | integration | AC-1, AC-2 | passed | - | - | - |

## SCN-010: The web shop shows 12 products per page

- Requirement refs: AC-6 · type: functional · layer: ui
- Failing step: Then page 1 shows 12 products
- Error: `[REQ AC-6] web shop page 1 shows 12 products`
- Locator: `getByTestId('product-name')`
- Expected: `12`
- Received: `9`
- Evidence: [screenshot](artifacts/TOOL-1-tests-tool-1-TOOL-1-5a4d7--shows-12-products-per-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-1/runs/02-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-5a4d7--shows-12-products-per-page-chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-1-tests-tool-1-TOOL-1-5a4d7--shows-12-products-per-page-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-6] failed on a located element.
- Expected: 12
- Received: 9

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-6 states 12 products per page on the web shop. The unfiltered catalogue (50 products per the API total) shows 9 product cards on page 1, with pagination to Page-5; the list rendered fully (readiness anchor seen) and the locator counts every card.

## SCN-011: The catalogue API pages its answers with 12 products per page

- Requirement refs: AC-6 · type: contract · layer: api
- Failing step: And each answer has per_page 12
- Error: `[REQ AC-6] GET /products per_page 12`
- Expected: `12`
- Received: `9`
- Relevant API exchange (#1 of 2): `GET https://api.practicesoftwaretesting.com/products` → **200**
  - request body: ``
  - response body: `{"current_page":1,"data":[{"id":"01M3QJXQFBJC3M2NF6FXJT54CK","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold e…`
- Evidence: [screenshot](artifacts/TOOL-1-tests-tool-1-TOOL-1-7d804-s-with-12-products-per-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-1/runs/02-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-7d804-s-with-12-products-per-page-chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-1-tests-tool-1-TOOL-1-7d804-s-with-12-products-per-page-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /products → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 12
- Received: 9
- Also failed: [REQ AC-6] GET /products/search per_page 12 — expected 12, received 9
- Also failed: [REQ AC-6] GET /products page 1 holds 12 products — expected 12, received 9

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-6 states per_page 12 in the API. GET /products answers per_page 9 with 9 items (total 50, last_page 6) and GET /products/search?q=pliers answers per_page 9. The response shape itself (current_page, data, per_page, total, last_page) is as stated.

## SCN-012.1: An empty search returns all products (q omitted)

- Requirement refs: AC-7 · type: functional · layer: api
- Failing step: Then its total equals the total of the unfiltered GET /products
- Error: `[REQ AC-7] GET /products/search (q omitted) returns all products`
- Expected: `50`
- Received: `0`
- Relevant API exchange (#2 of 2): `GET https://api.practicesoftwaretesting.com/products/search` → **200**
  - request body: ``
  - response body: `{"current_page":1,"data":[],"from":null,"last_page":1,"per_page":9,"to":null,"total":0}`
- Evidence: [screenshot](artifacts/TOOL-1-tests-tool-1-TOOL-1-34229-rns-all-products-q-omitted--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-1/runs/02-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-34229-rns-all-products-q-omitted--chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-1-tests-tool-1-TOOL-1-34229-rns-all-products-q-omitted--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /products/search → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: 50
- Received: 0
- SCN-012 rests on an unsettled reading (@needs-clarification: the literal reading of an open question). Confirm what the application does as usual; the verdict then lists it as a question for the owner, not as a defect.

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Literal reading of AC-7 (open question G4, @needs-clarification): a search with no term should return all products (total equal to the unfiltered GET /products total, 50). GET /products/search with q omitted and with q= both answer 200 with data [] and total 0. Whether 'no term' means q omitted or empty, and how 'all products' is judged, is a question for the owner.

## SCN-012.2: An empty search returns all products (q empty (""))

- Requirement refs: AC-7 · type: functional · layer: api
- Failing step: Then its total equals the total of the unfiltered GET /products
- Error: `[REQ AC-7] GET /products/search (q empty ("")) returns all products`
- Expected: `50`
- Received: `0`
- Relevant API exchange (#2 of 2): `GET https://api.practicesoftwaretesting.com/products/search?q=` → **200**
  - request body: ``
  - response body: `{"current_page":1,"data":[],"from":null,"last_page":1,"per_page":9,"to":null,"total":0}`
- Evidence: [screenshot](artifacts/TOOL-1-tests-tool-1-TOOL-1-c3dbe-turns-all-products-q-empty--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-1/runs/02-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-c3dbe-turns-all-products-q-empty--chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-1-tests-tool-1-TOOL-1-c3dbe-turns-all-products-q-empty--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /products/search → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: 50
- Received: 0
- SCN-012 rests on an unsettled reading (@needs-clarification: the literal reading of an open question). Confirm what the application does as usual; the verdict then lists it as a question for the owner, not as a defect.

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Literal reading of AC-7 (open question G4, @needs-clarification): a search with no term should return all products (total equal to the unfiltered GET /products total, 50). GET /products/search with q omitted and with q= both answer 200 with data [] and total 0. Whether 'no term' means q omitted or empty, and how 'all products' is judged, is a question for the owner.
