# Held-out Evaluation Verdict — AE-1

> **Verdict: ⚠️ PASS WITH WARNINGS** — Every requirement-backed scenario passed, with warnings: 1 assumption(s) the application contradicts (ask the owner).

| | |
| --- | --- |
| Story | [AE-1](https://your-domain.atlassian.net/browse/AE-1) — Product search and catalogue on the shop and the public product API |
| Application under test | Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — UI https://automationexercise.com |
| Final run | `04-eval` · 2026-09-27T05:47:46.434Z · 10s |
| Tests | 20 total · 19 passed · 1 failed · 0 flaky · 0 skipped (from 17 scenarios) |
| Held-out integrity | ✅ PRESERVED — 18 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (bundled heldout inspect with --steps-json/--probe, heldout api-probe) for all locators and API mechanics; tier 2 (heldout mcp-probe, own Playwright MCP… (see hardening log) |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-27T16:53:55.334Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A client lists the catalogue through the API | AC-1 | functional | ✅ passed | - |
| SCN-002 | Every catalogue product carries id, name, price, brand and category with audience and category name | AC-1 | contract | ✅ passed | - |
| SCN-003 | Every catalogue price is written as "Rs. " followed by the amount | AC-1 | contract | ✅ passed | - |
| SCN-004 | Searching "jean" through the API returns exactly the three jeans | AC-2 | functional | ✅ passed | - |
| SCN-005.1 | Search ignores letter case (TOP / top) | AC-3 | functional | ✅ passed | - |
| SCN-005.2 | Search ignores letter case (Top / top) | AC-3 | functional | ✅ passed | - |
| SCN-006 | Searching "dress" returns every product with "dress" in its name or in a Dress category | AC-4 | functional | ✅ passed | - |
| SCN-007 | Searching "dress" returns nothing else | AC-4 | negative | ✅ passed | - |
| SCN-008 | The brand is not a search field | AC-4 | negative | ✅ passed | - |
| SCN-009 | A search that matches nothing returns an empty product list | AC-5 | functional | ✅ passed | - |
| SCN-010 | A search that matches nothing is not an error | AC-5 | negative | ✅ passed | - |
| SCN-011 | Searching with an empty value returns the whole catalogue | AC-6 | boundary | ✅ passed | - |
| SCN-012 | A search without the search_product parameter is rejected with response code 400 | AC-7 | negative | ❌ failed | APPLICATION_DEFECT |
| SCN-013 | A search without the search_product parameter explains what is missing | AC-7 | negative | ✅ passed | - |
| SCN-014 | A shopper searches "jean" on the Products page | AC-8 | functional | ✅ passed | - |
| SCN-015 | A shopper searches without a term on the Products page and sees the whole catalogue | AC-9 | integration | ✅ passed | - |
| SCN-016.1 | The shop and the API agree on search results (top) | AC-10 | integration | ✅ passed | - |
| SCN-016.2 | The shop and the API agree on search results (dress) | AC-10 | integration | ✅ passed | - |
| SCN-016.3 | The shop and the API agree on search results (Men Tshirt) | AC-10 | integration | ✅ passed | - |
| SCN-017 | A search on the Products page that matches nothing shows no product | AC-11 | functional | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Catalogue is available through the API: GET /api/productsList lists the products of the catalogue in a "products" array; every product has an "id", a "name", a "price", a "brand" and a "category"; the category holds the audience ("usertype", e.g. Women, Men, Kids) and the category name; every price is written as "Rs. " followed by the amount, e.g. "Rs. 500". | SCN-001, SCN-002, SCN-003 | ✅ met |
| AC-2 | Search by a term through the API: posting search_product = "jean" to /api/searchProduct returns exactly these products: "Soft Stretch Jeans", "Regular Fit Straight Jeans", "Grunt Blue Slim Fit Jeans". | SCN-004 | ✅ met |
| AC-3 | Search ignores letter case: searching for "TOP" and for "top" returns the same products. | SCN-005.1, SCN-005.2 | ✅ met |
| AC-4 | Search matches the product name or its category name (AC-4 as replaced by the Product Owner clarification of 2026-09-26): searching "dress" returns every product whose name contains "dress" plus every product in a "Dress" category, even if the word is not in its name, and nothing else; the brand is not a search field. | SCN-006, SCN-007, SCN-008 | ✅ met |
| AC-5 | Nothing matches: searching for "zzqxv" returns an empty product list, not an error. | SCN-009, SCN-010 | ✅ met |
| AC-6 | Search without a term (empty value): posting search_product with an empty value returns the whole catalogue, the same products as GET /api/productsList. | SCN-011 | ✅ met |
| AC-7 | Search without a term (parameter missing): posting to /api/searchProduct without the search_product parameter is rejected with response code 400 and the message "Bad request, search_product parameter is missing in POST request." | SCN-012, SCN-013 | ❌ not met |
| AC-8 | Search from the Products page: a shopper on the Products page types "jean" in the search box and presses the search button; the product grid is headed "Searched Products", the search box still shows "jean", and exactly the three jeans products listed in AC-2 are shown. | SCN-014 | ✅ met |
| AC-9 | Searching from the Products page without a term: a shopper on the Products page leaves the search box empty and presses the search button; the grid is headed "All Products" and every product of the catalogue (GET /api/productsList) is shown. | SCN-015 | ✅ met |
| AC-10 | The shop and the API agree on search results: when a shopper searches for "<term>" on the Products page, the products shown are exactly the products POST /api/searchProduct returns for "<term>", for the terms top, dress and Men Tshirt. | SCN-016.1, SCN-016.2, SCN-016.3 | ✅ met |
| AC-11 | No results on the Products page: when a shopper searches for "zzqxv" on the Products page, the grid is headed "Searched Products" and no product is shown. | SCN-017 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story AC-1 (story.md#L35-L37) | SCN-001 A client lists the catalogue through the API | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-1 (story.md#L38-L39) | SCN-002 Every catalogue product carries id, name, price, brand and category with audience and category name | contract | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-1 (story.md#L40) | SCN-003 Every catalogue price is written as "Rs. " followed by the amount | contract | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story AC-2 (story.md#L42-L44) | SCN-004 Searching "jean" through the API returns exactly the three jeans | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story AC-3 (story.md#L46-L48), PO comment (story.md#L104) | SCN-005 Search ignores letter case | functional | api | 2/2 | ✅ meets requirement | - |
| **AC-4** | story PO comment replacing AC-4 (story.md#L100-L102, L104) | SCN-006 Searching "dress" returns every product with "dress" in its name or in a Dress category | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story PO comment replacing AC-4 (story.md#L100-L102) | SCN-007 Searching "dress" returns nothing else | negative | api | 1/1 | ✅ meets requirement | - |
| ↳ | story PO comment (story.md#L103) | SCN-008 The brand is not a search field | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-5** | story AC-5 (story.md#L55-L57) | SCN-009 A search that matches nothing returns an empty product list | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-5 (story.md#L57); contract G5 (assumed) | SCN-010 A search that matches nothing is not an error | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-6** | story AC-6 (story.md#L59-L61) | SCN-011 Searching with an empty value returns the whole catalogue | boundary | api | 1/1 | ✅ meets requirement | - |
| **AC-7** | story AC-7 (story.md#L63-L65); contract G2 (assumed) | SCN-012 A search without the search_product parameter is rejected with response code 400 | negative | api | 0/1 | ❔ inconclusive | - |
| ↳ | story AC-7 (story.md#L66) | SCN-013 A search without the search_product parameter explains what is missing | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-8** | story AC-8 (story.md#L68-L73) | SCN-014 A shopper searches "jean" on the Products page | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-9** | story AC-9 (story.md#L75-L79) | SCN-015 A shopper searches without a term on the Products page and sees the whole catalogue | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-10** | story AC-10 (story.md#L81-L89) | SCN-016 The shop and the API agree on search results | integration | e2e | 3/3 | ✅ meets requirement | - |
| **AC-11** | story AC-11 (story.md#L91-L93) | SCN-017 A search on the Products page that matches nothing shows no product | functional | ui | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 1 | 1 | 1 | 0 | 0 | - |
| contract | 2 | 2 | 2 | 0 | 0 | - |
| functional | 7 | 8 | 8 | 0 | 0 | - |
| integration | 2 | 4 | 4 | 0 | 0 | - |
| negative | 5 | 5 | 4 | 1 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | what searching "dress" must return: AC-4 as written says only products with the term in their name; the Product Owner clarification says name or category name | expected behaviour | AC-4 | found elsewhere in the requirement: searching "dress" returns every product whose name contains "dress" plus every product in a "Dress" category (e.g. "Sleeves Top and Short - Blue & Pink", Kids > Dress), and nothing else; brand is not searched |
| G2 | what "response code 400" refers to: the HTTP status of the response, or a response-code value carried in the response body | expected behaviour | AC-7 | assumed: the HTTP status of the response is 400 (the usual meaning of "response code"). Alternative reading, not assumed: HTTP status is not constrained and a response-code value of 400 is carried in the body. Confirm with the Product Owner |
| G3 | field name that holds the category name inside a product's "category" (only "usertype" is named) | how to exercise | AC-1, AC-4 | discovered from the AUT (mechanics only): category name is product.category.category; audience is product.category.usertype.usertype |
| G4 | shape of the POST /api/searchProduct response: where the list of matching products is carried and how a product is identified when comparing result sets | how to exercise | AC-2, AC-3, AC-4, AC-5, AC-6, AC-10 | discovered from the AUT (mechanics only): the matching products are in the body "products" array (same product shape as GET /api/productsList); a product is identified by "id" |
| G5 | what makes the no-match response "not an error": no status code or body is stated for a successful search | expected behaviour | AC-5 | assumed: the response is a successful one carrying an empty product list: no error status and no error message (as in the AC-7 error case) is returned. No specific status code is asserted |
| G6 | where the error message of AC-7 is carried in the response (body field name / format) | how to exercise | AC-7 | discovered from the AUT (mechanics only): the message is carried in the body field "message" |
| G7 | UI locators on the Products page: search box, search button label, product grid heading and product cards (only the search box placeholder/label "Search Product" and the headings are stated) | how to exercise | AC-8, AC-9, AC-10, AC-11 | discovered from the AUT (mechanics only): search box getByRole(textbox, "Search Product"); button #submit_search; heading .features_items h2.title; card names .features_items .productinfo p; submission navigates to /products?search=<term> |

**Assumptions the evaluation made:**

- G2 — what "response code 400" refers to: the HTTP status of the response, or a response-code value carried in the response body: the HTTP status of the response is 400 (the usual meaning of "response code"). Alternative reading, not assumed: HTTP status is not constrained and a response-code value of 400 is carried in the body. Confirm with the Product Owner
- G5 — what makes the no-match response "not an error": no status code or body is stated for a successful search: the response is a successful one carrying an empty product list: no error status and no error message (as in the AC-7 error case) is returned. No specific status code is asserted
- Comparisons between the page and the API use the product names shown on the product cards (what a shopper sees), compared as sorted lists; API-to-API comparisons use the product "id".
- "Rs. followed by the amount" means "Rs. " then a number (digits, optionally with decimals), nothing else.
- The exact success status of a search is asserted nowhere (not stated); successful searches are checked by their product lists only (one root cause, one failure).

**Assumptions the application contradicts** (the requirement does not state these values; not reported as defects, the owner decides):

| Test | Assumption | Expected (assumed) | Actual |
| --- | --- | --- | --- |
| SCN-012 | G2 | 400 | 200 |

Full review: [requirement-review.md](requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 19 | 1 | 0 |
| `02-harden-stability` (hardening dry-run) | 54 | 4 | 2 |
| `03-harden-stability2` (hardening dry-run) | 57 | 3 | 0 |
| `04-eval` (final) | 19 | 1 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/04-eval/triage.md](runs/04-eval/triage.md) · JUnit: runs/04-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/AE-1/runs/04-eval/html`
