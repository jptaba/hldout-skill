# Triage — TOOL-1 / run 04-eval

Generated 2026-09-26T22:36:55.152Z

**6/8 passed**, 2 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | functional | AC-2 | passed | - | - | - |
| SCN-004 | negative | AC-3 | passed | - | - | - |
| SCN-005 | functional | AC-4 | passed | - | - | - |
| SCN-006 | functional | AC-5 | passed | - | - | - |
| SCN-007 | boundary | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-008 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |

## SCN-007: Pages hold 12 products

- Requirement refs: AC-6 · type: boundary · layer: e2e
- Failing step: Then the first page shows 12 products
- Error: `[REQ AC-6] 12 products per page on the web shop`
- Locator: `getByRole('link').filter({ has: getByTestId('product-name') })`
- Expected: `12`
- Received: `9`
- Relevant API exchange (#1 of 1): `GET https://api.practicesoftwaretesting.com/products` → **200**
  - request body: ``
  - response body: `{"current_page":1,"data":[{"id":"01M3FVQJG6E2QF0114BDA47REV","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold e…`
- Evidence: [screenshot](artifacts/TOOL-1-tests-tool-1-TOOL-1-8eab2--007-Pages-hold-12-products-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-1/runs/04-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-8eab2--007-Pages-hold-12-products-chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-1-tests-tool-1-TOOL-1-8eab2--007-Pages-hold-12-products-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /products → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: 12
- Received: 9
- Also failed: [REQ AC-6] API per_page — expected 12, received 9

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — Reproduced live: the web shop's first page shows 9 product cards and GET /products reports per_page 9 (data.length 9). AC-6 requires 12 per page on both. (Confirmed in run 03-eval; identical failure signature in 04-eval.)

## SCN-008: An empty search returns all products

- Requirement refs: AC-7 · type: functional · layer: api
- Failing step: Then its total equals the total of GET /products
- Error: `[REQ AC-7] empty search returns all 50 products`
- Expected: `50`
- Received: `0`
- Relevant API exchange (#2 of 2): `GET https://api.practicesoftwaretesting.com/products` → **200**
  - request body: ``
  - response body: `{"current_page":1,"data":[{"id":"01M3FVQJG6E2QF0114BDA47REV","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold e…`
- Evidence: [screenshot](artifacts/TOOL-1-tests-tool-1-TOOL-1-3775a-search-returns-all-products-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-1/runs/04-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-3775a-search-returns-all-products-chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-1-tests-tool-1-TOOL-1-3775a-search-returns-all-products-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /products → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: 50
- Received: 0

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: GET /products/search?q= and GET /products/search both return total 0 while GET /products has total 50. AC-7: an empty search returns all products (G5/G6 assumptions recorded). (Confirmed in run 03-eval; identical failure signature in 04-eval.)
