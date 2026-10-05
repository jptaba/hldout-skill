# Triage — TOOL-1 / run 01-harden

Generated 2026-10-05T01:00:23.240Z

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
| SCN-011 | functional | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-012 | functional | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-013.1 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-013.2 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-014 | functional | AC-7 | failed | APPLICATION_DEFECT | high | ⏳ pending |

## SCN-011: The web shop shows 12 products on a full page of results

- Requirement refs: AC-6 · type: functional · layer: ui
- Failing step: Then it shows 12 products
- Error: `[REQ AC-6] a full page of results shows 12 products`
- Expected: `12`
- Received: `9`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-2ef8c-s-on-a-full-page-of-results-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/01-harden/artifacts/practicesoftwaretesting-TO-2ef8c-s-on-a-full-page-of-results-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-2ef8c-s-on-a-full-page-of-results-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-012 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Requirement assertion [REQ AC-6] failed on a located element.
- Expected: 12
- Received: 9

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

## SCN-012: GET /products answers per_page 12 with 12 products on a full page

- Requirement refs: AC-6 · type: functional · layer: api
- Failing step: Then GET /products answers 200 with per_page 12 and 12 products in data
- Error: `[REQ AC-6] GET /products returns per_page 12`
- Expected: `12`
- Received: `9`
- Relevant API exchange (#1 of 2): `GET https://api.practicesoftwaretesting.com/products` → **200**
  - request body: ``
  - response body: `{"current_page":1,"data":[{"id":"01M44NSB8F5H6AYX8DH9W40E75","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold e…`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-54935--12-products-on-a-full-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/01-harden/artifacts/practicesoftwaretesting-TO-54935--12-products-on-a-full-page-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-54935--12-products-on-a-full-page-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /products → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 12
- Received: 9
- Also failed: [REQ AC-6] GET /products holds 12 products in data on a full page — expected 12, received 9
- Also failed: [REQ AC-6] GET /products/search?q=pliers returns per_page 12 — expected 12, received 9

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-013.1: GET /products pagination at 12 per page: the page before the last holds exactly 12 products

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the page before the last holds exactly 12 products
- Error: `[REQ AC-6] GET /products page 5 (before the last) holds 12 products`
- Expected: `12`
- Received: `9`
- Relevant API exchange (#1 of 1): `GET https://api.practicesoftwaretesting.com/products?page=5` → **200**
  - request body: ``
  - response body: `{"current_page":5,"data":[{"id":"01M44NSBAF0PSK1BHD817BP8S0","name":"Washers","description":"Assorted pack of 150 zinc-plated steel flat washers in popular metric sizes ranging from M4 to M10, covering the most commonly needed sizes for workshop, garage, and job site fastener work. These washers distribute the clamping force of bolts and nuts over a larger surface area, preventing damage to soft materials like wood, plastic, and painted or powder-coated metal surfaces. The smooth, burr-free finish on both faces ensures a flat, stable seating surface that maximizes friction and prevents fastene…`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-2bb34-t-holds-exactly-12-products-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/01-harden/artifacts/practicesoftwaretesting-TO-2bb34-t-holds-exactly-12-products-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-2bb34-t-holds-exactly-12-products-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-012 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /products → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 12
- Received: 9

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-013.2: GET /products pagination at 12 per page: the last page holds the rest (1 to 12) and last_page is total / 12 rounded up

- Requirement refs: AC-6 · type: boundary · layer: api
- Failing step: Then the last page holds the rest (1 to 12) and last_page is total / 12 rounded up
- Error: `[REQ AC-6] GET /products last_page is the total (50) / 12 rounded up`
- Expected: `5`
- Received: `6`
- Relevant API exchange (#1 of 1): `GET https://api.practicesoftwaretesting.com/products?page=6` → **200**
  - request body: ``
  - response body: `{"current_page":6,"data":[{"id":"01M44NSBAYDZH66D42V5ENHBYH","name":"Random Orbit Sander","description":"Electric random orbit sander combining 14,000 RPM pad rotation with an eccentric 2.5mm orbital action pattern that produces a completely swirl-free finish on wood, lacquer, paint, and primer surfaces. The 125mm hook-and-loop pad accepts standard multi-hole sanding discs from 60 to 400 grit for quick, tool-free abrasive changes between roughing and finishing passes. A responsive 300W motor delivers consistent sanding power at every speed setting, from aggressive stock removal at full speed t…`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-6a742-page-is-total-12-rounded-up-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/01-harden/artifacts/practicesoftwaretesting-TO-6a742-page-is-total-12-rounded-up-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-6a742-page-is-total-12-rounded-up-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-012 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /products → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 5
- Received: 6
- Also failed: [REQ AC-6] GET /products last page holds the rest of the 50 products at 12 per page — expected -10, received 5

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-014: An empty search (q= with no value) returns all products: total equals the catalogue total

- Requirement refs: AC-7 · type: functional · layer: api
- Failing step: Then the answer is 200 and its total equals the whole catalogue
- Error: `[REQ AC-7] GET /products/search?q= returns all products: total equals GET /products total`
- Expected: `50`
- Received: `0`
- Relevant API exchange (#1 of 1): `GET https://api.practicesoftwaretesting.com/products/search?q=` → **200**
  - request body: ``
  - response body: `{"current_page":1,"data":[],"from":null,"last_page":1,"per_page":9,"to":null,"total":0}`
- Evidence: [screenshot](artifacts/practicesoftwaretesting-TO-13e19--equals-the-catalogue-total-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/01-harden/artifacts/practicesoftwaretesting-TO-13e19--equals-the-catalogue-total-chromium-retry1/trace.zip` · [error-context](artifacts/practicesoftwaretesting-TO-13e19--equals-the-catalogue-total-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-012 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /products/search → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: 50
- Received: 0

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.
