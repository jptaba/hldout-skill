# Triage — TOOL-1 / run 04-eval

Generated 2026-10-05T01:11:38.006Z

**10/15 passed**, 5 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | integration | AC-1, AC-2 | passed | - | - | - |
| SCN-003 | functional | AC-2 | passed | - | - | - |
| SCN-004 | contract | AC-2, AC-6, AC-7 | passed | - | - | - |
| SCN-005 | functional | AC-3 | passed | - | - | - |
| SCN-006 | functional | AC-3 | passed | - | - | - |
| SCN-007 | functional | AC-4 | passed | - | - | - |
| SCN-008 | functional | AC-4 | passed | - | - | - |
| SCN-009 | functional | AC-5 | passed | - | - | - |
| SCN-010 | functional | AC-5 | passed | - | - | - |
| SCN-011 | functional | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-012 | functional | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-013.1 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-013.2 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-014 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |

## SCN-011: The web shop shows 12 products on a full page of results

- Requirement refs: AC-6 · type: functional · layer: ui
- Failing step: Then it shows 12 products
- Error: `[REQ AC-6] a full page of results shows 12 products`
- Expected: `12`
- Received: `9`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-2ef8c-s-on-a-full-page-of-results-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/04-eval/artifacts/practicesoftwaretesting-TO-2ef8c-s-on-a-full-page-of-results-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-2ef8c-s-on-a-full-page-of-results-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-012 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Requirement assertion [REQ AC-6] failed on a located element.
- Expected: 12
- Received: 9

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Web shop catalogue reached (cards rendered, pagination Next present), locator a.card counts the product cards; a full page shows 9, AC-6 requires 12.

## SCN-012: GET /products answers per_page 12 with 12 products on a full page

- Requirement refs: AC-6 · type: functional · layer: api
- Failing step: Then GET /products answers 200 with per_page 12 and 12 products in data
- Error: `[REQ AC-6] GET /products returns per_page 12`
- Expected: `12`
- Received: `9`
- Relevant API exchange (#1 of 2): `GET https://api.practicesoftwaretesting.com/products` → **200**
  - request body: ``
  - response body: `{"current_page":1,"data":[{"id":"01M44S7HNKRSHDH155H9HZAP09","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold e…`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-54935--12-products-on-a-full-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/04-eval/artifacts/practicesoftwaretesting-TO-54935--12-products-on-a-full-page-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-54935--12-products-on-a-full-page-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /products → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 12
- Received: 9
- Also failed: [REQ AC-6] GET /products holds 12 products in data on a full page — expected 12, received 9
- Also failed: [REQ AC-6] GET /products/search?q=pliers returns per_page 12 — expected 12, received 9

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Declared GET /products answers 200 with per_page 9 and 9 items in data on a full page; GET /products/search?q=pliers also per_page 9. AC-6 requires per_page 12.

## SCN-013.1: GET /products pagination at 12 per page: the page before the last holds exactly 12 products

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the page before the last holds exactly 12 products
- Error: `[REQ AC-6] GET /products page 4 (before the last) holds 12 products`
- Expected: `12`
- Received: `9`
- Relevant API exchange (#1 of 1): `GET https://api.practicesoftwaretesting.com/products?page=4` → **200**
  - request body: ``
  - response body: `{"current_page":4,"data":[{"id":"01M44S7HT7C127C53MT93F5WQ0","name":"Protective Gloves","description":"Heavy-duty leather work gloves engineered to deliver an optimal combination of cut resistance, abrasion protection, and manual dexterity for demanding industrial and construction tasks. The full-grain cowhide leather palm provides excellent grip and wear resistance when handling rough timber, sharp metal edges, concrete blocks, and hot materials. Reinforced fingertips and a padded knuckle guard protect the most vulnerable areas of the hand and significantly extend the service life of the glov…`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-2bb34-t-holds-exactly-12-products-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/04-eval/artifacts/practicesoftwaretesting-TO-2bb34-t-holds-exactly-12-products-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-2bb34-t-holds-exactly-12-products-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-012 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /products → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 12
- Received: 9

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Declared GET /products?page=4 (before the last at 12/page) answers 9 items because the API pages by 9; AC-6 requires 12 per page. Same root cause as SCN-012.

## SCN-013.2: GET /products pagination at 12 per page: the last page holds the rest (1 to 12) and last_page is total / 12 rounded up

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the last page holds the rest (1 to 12) and last_page is total / 12 rounded up
- Error: `[REQ AC-6] GET /products last_page is the total (50) / 12 rounded up`
- Expected: `5`
- Received: `6`
- Relevant API exchange (#1 of 1): `GET https://api.practicesoftwaretesting.com/products?page=5` → **200**
  - request body: ``
  - response body: `{"current_page":5,"data":[{"id":"01M44S7HWAYRQ4YG7KS27PXASE","name":"Washers","description":"Assorted pack of 150 zinc-plated steel flat washers in popular metric sizes ranging from M4 to M10, covering the most commonly needed sizes for workshop, garage, and job site fastener work. These washers distribute the clamping force of bolts and nuts over a larger surface area, preventing damage to soft materials like wood, plastic, and painted or powder-coated metal surfaces. The smooth, burr-free finish on both faces ensures a flat, stable seating surface that maximizes friction and prevents fastene…`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-6a742-page-is-total-12-rounded-up-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/04-eval/artifacts/practicesoftwaretesting-TO-6a742-page-is-total-12-rounded-up-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-6a742-page-is-total-12-rounded-up-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-012 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /products → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 5
- Received: 6
- Also failed: [REQ AC-6] GET /products last page holds the rest of the 50 products at 12 per page — expected 2, received 9

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — GET /products last_page is 6 (50/9 rounded up) instead of 5 (50/12), and the last page under the test's page arithmetic holds 9 instead of 2: consequence of per_page 9 instead of 12. Same root cause as SCN-012.

## SCN-014: An empty search (q= with no value) returns all products: total equals the catalogue total

- Requirement refs: AC-7 · type: functional · layer: api
- Failing step: Then the answer is 200 and its total equals the whole catalogue
- Error: `[REQ AC-7] GET /products/search?q= returns all products: total equals GET /products total`
- Expected: `50`
- Received: `0`
- Relevant API exchange (#1 of 1): `GET https://api.practicesoftwaretesting.com/products/search?q=` → **200**
  - request body: ``
  - response body: `{"current_page":1,"data":[],"from":null,"last_page":1,"per_page":9,"to":null,"total":0}`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-13e19--equals-the-catalogue-total-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/04-eval/artifacts/practicesoftwaretesting-TO-13e19--equals-the-catalogue-total-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-13e19--equals-the-catalogue-total-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-012 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /products/search → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: 50
- Received: 0

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — GET /products/search?q= (the empty search as defined by G5) answers 200 with total 0 and data [], while GET /products total is 50. AC-7 (with G4) requires a paginated answer whose total equals the catalogue total. Omitting q also returns total 0, so no reading of 'empty search' is met. Mobile 'All tools' screen cannot reuse the search endpoint; workaround is GET /products.
