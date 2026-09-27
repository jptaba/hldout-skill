# Triage — AE-1 / run 02-harden-stability

Generated 2026-09-27T05:46:02.451Z

**17/20 passed**, 1 failed, 2 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | contract | AC-1 | passed | - | - | - |
| SCN-003 | contract | AC-1 | passed | - | - | - |
| SCN-004 | functional | AC-2 | passed | - | - | - |
| SCN-005.1 | functional | AC-3 | passed | - | - | - |
| SCN-005.2 | functional | AC-3 | passed | - | - | - |
| SCN-006 | functional | AC-4 | passed | - | - | - |
| SCN-007 | negative | AC-4 | passed | - | - | - |
| SCN-008 | negative | AC-4 | passed | - | - | - |
| SCN-009 | functional | AC-5 | passed | - | - | - |
| SCN-010 | negative | AC-5 | passed | - | - | - |
| SCN-011 | boundary | AC-6 | passed | - | - | - |
| SCN-012 | negative | AC-7 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-013 | negative | AC-7 | passed | - | - | - |
| SCN-014 | functional | AC-8 | passed | - | - | - |
| SCN-015 | integration | AC-9 | flaky | FLAKY | medium | ⏳ pending |
| SCN-016.1 | integration | AC-10 | flaky | FLAKY | medium | ⏳ pending |
| SCN-016.2 | integration | AC-10 | passed | - | - | - |
| SCN-016.3 | integration | AC-10 | passed | - | - | - |
| SCN-017 | functional | AC-11 | passed | - | - | - |

## SCN-012: A search without the search_product parameter is rejected with response code 400

- Requirement refs: AC-7 · type: negative · layer: api
- Failing step: Then the request is rejected with response code 400
- Repeats: failed **3 of 3**
- Error: `[REQ AC-7] response code 400`
- Expected: `400`
- Received: `200`
- Relevant API exchange (#1 of 1): `POST https://automationexercise.com/api/searchProduct` → **200**
  - request body: ``
  - response body: `{"responseCode":400,"message":"Bad request, search_product parameter is missing in POST request."}`
- Evidence: [screenshot](artifacts/AE-1-tests-ae-1-AE-1-Produ-ebe51-cted-with-response-code-400-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-1/runs/02-harden-stability/artifacts/AE-1-tests-ae-1-AE-1-Produ-ebe51-cted-with-response-code-400-chromium-retry1/trace.zip` · [error-context](artifacts/AE-1-tests-ae-1-AE-1-Produ-ebe51-cted-with-response-code-400-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/searchProduct → 200
- Requirement assertion [REQ AC-7] failed.
- Expected: 400
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

## SCN-015: A shopper searches without a term on the Products page and sees the whole catalogue

- Requirement refs: AC-9 · type: integration · layer: e2e
- Failing step: And every product of the catalogue (GET /api/productsList) is shown
- Repeats: failed **1 of 3**
- Error: `[REQ AC-9] every catalogue product is shown`
- Expected: `["Colour Blocked Shirt – Sky Blue", "Cotton Mull Embroidered Dress", "Cotton Silk Hand Block Print Saree", "Fancy Green Top", "Frozen Tops For Kids", "Full Sleeves Top Cherry - Pink", "GRAPHIC DESIGN MEN T SHIRT - BLUE", "Green Side Placket Detail T-Shirt", "Grunt Blue Slim Fit Jeans", "Half Sleeves Top Schiffli Detailing - Pink", "Lace Top For Women", "Little Girls Mr. Panda Shirt", "Long Maxi Tulle Fancy Dress Up Outfits -Pink", "Madame Top For Women", "Men Tshirt", "Premium Polo T-Shirts", "Printed Off Shoulder Top - White", "Pure Cotton Neon Green Tshirt", "Pure Cotton V-Neck T-Shirt", "Regular Fit Straight Jeans", "Rose Pink Embroidered Maxi Dress", "Rust Red Linen Saree", "Sleeveless Dress", "Sleeveless Unicorn Patch Gown - Pink", "Sleeveless Unicorn Print Fit & Flare Net Dress - Multi", "Sleeves Printed Top - White", "Sleeves Top and Short - Blue & Pink", "Soft Stretch Jeans", "Stylish Dress", "Summer White Top", "Winter Top", Timeout 5000ms exceeded while waiting on the predicate]`
- Received: `["Colour Blocked Shirt – Sky Blue", "Cotton Mull Embroidered Dress", "Cotton Silk Hand Block Print Saree", "Fancy Green Top", "Frozen Tops For Kids", "Full Sleeves Top Cherry - PinkClothing", "GRAPHIC DESIGN MEN T SHIRT - BLUEApparel", "Green Side Placket Detail T-Shirt", "Grunt Blue Slim Fit Jeans", "Half Sleeves Top Schiffli Detailing - PinkT-Shirts", "Lace Top For Women", "Little Girls Mr. Panda Shirt", "Long Maxi Tulle Fancy Dress Up Outfits -PinkTextiles & Nonwovens", "Madame Top For Women", "Men Tshirt", "Premium Polo T-Shirts", "Printed Off Shoulder Top - White", "Pure Cotton Neon Green Tshirt", "Pure Cotton V-Neck T-Shirt", "Regular Fit Straight Jeans", "Rose Pink Embroidered Maxi Dress", "Rust Red Linen Saree", "Sleeveless Dress", "Sleeveless Unicorn Patch Gown - PinkApparel", "Sleeveless Unicorn Print Fit & Flare Net Dress - MultiClothing", "Sleeves Printed Top - WhiteManufacturing", "Sleeves Top and Short - Blue & Pink", "Soft Stretch Jeans", "Stylish Dress", "Summer White Top", "Winter Top"]`
- Evidence: [screenshot](artifacts/AE-1-tests-ae-1-AE-1-Produ-44196-nd-sees-the-whole-catalogue-chromium-repeat2/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-1/runs/02-harden-stability/artifacts/AE-1-tests-ae-1-AE-1-Produ-44196-nd-sees-the-whole-catalogue-chromium-repeat2/trace.zip` · [error-context](artifacts/AE-1-tests-ae-1-AE-1-Produ-44196-nd-sees-the-whole-catalogue-chromium-repeat2/error-context.md)

**Auto: FLAKY (medium)**

- Failed 1 of 3 repeats — nondeterministic.
- Failure cause seen: FLAKY: [REQ AC-9] every catalogue product is shown

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.

## SCN-016.1: The shop and the API agree on search results (top)

- Requirement refs: AC-10 · type: integration · layer: e2e
- Failing step: Then the products shown are exactly the products POST /api/searchProduct returns for "top"
- Repeats: failed **2 of 3**
- Error: `[REQ AC-10] the page shows exactly what the API returns for "top"`
- Expected: `["Blue Top", "Colour Blocked Shirt – Sky Blue", "Fancy Green Top", "Frozen Tops For Kids", "Full Sleeves Top Cherry - Pink", "Half Sleeves Top Schiffli Detailing - Pink", "Lace Top For Women", "Little Girls Mr. Panda Shirt", "Madame Top For Women", "Printed Off Shoulder Top - White", "Sleeves Printed Top - White", "Sleeves Top and Short - Blue & Pink", "Summer White Top", "Winter Top", Timeout 5000ms exceeded while waiting on the predicate]`
- Received: `["Blue Top", "Colour Blocked Shirt – Sky Blue", "Fancy Green Top", "Frozen Tops For Kids", "Full Sleeves Top Cherry - Pink", "Half Sleeves Top Schiffli Detailing - PinkApparel", "Lace Top For Women", "Little Girls Mr. Panda Shirt", "Madame Top For Women", "Printed Off Shoulder Top - White", "Sleeves Printed Top - WhiteIndustrial & Product Design", "Sleeves Top and Short - Blue & Pink", "Summer White Top", "Winter Top"]`
- Relevant API exchange (#1 of 1): `POST https://automationexercise.com/api/searchProduct` → **200**
  - request body: `{"search_product":"top"}`
  - response body: `{"responseCode":200,"products":[{"id":1,"name":"Blue Top","price":"Rs. 500","brand":"Polo","category":{"usertype":{"usertype":"Women"},"category":"Tops"}},{"id":5,"name":"Winter Top","price":"Rs. 600","brand":"Mast & Harbour","category":{"usertype":{"usertype":"Women"},"category":"Tops"}},{"id":6,"name":"Summer White Top","price":"Rs. 400","brand":"H&M","category":{"usertype":{"usertype":"Women"},"category":"Tops"}},{"id":7,"name":"Madame Top For Women","price":"Rs. 1000","brand":"Madame","category":{"usertype":{"usertype":"Women"},"category":"Tops"}},{"id":8,"name":"Fancy Green Top","price":"…`
- Evidence: [screenshot](artifacts/AE-1-tests-ae-1-AE-1-Produ-a3ca8-gree-on-search-results-top--chromium/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-1/runs/02-harden-stability/artifacts/AE-1-tests-ae-1-AE-1-Produ-a3ca8-gree-on-search-results-top--chromium/trace.zip` · [error-context](artifacts/AE-1-tests-ae-1-AE-1-Produ-a3ca8-gree-on-search-results-top--chromium/error-context.md)

**Auto: FLAKY (medium)**

- Failed 2 of 3 repeats — nondeterministic.
- Failure cause seen: FLAKY: [REQ AC-10] the page shows exactly what the API returns for "top"
- Failure cause seen: APPLICATION_DEFECT: [REQ AC-10] the page shows exactly what the API returns for "top"

Next: Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.
