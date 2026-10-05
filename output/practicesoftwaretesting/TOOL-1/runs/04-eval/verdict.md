# Held-out Evaluation Verdict — TOOL-1

> **Verdict: ❌ FAIL** — 2 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-6, AC-7. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [TOOL-1](https://jira.example.com/browse/TOOL-1) — Catalogue search, sorting and category filter |
| Application under test | Practice Software Testing (profile `practicesoftwaretesting`) — UI https://practicesoftwaretesting.com/ · API https://api.practicesoftwaretesting.com |
| Final run | `04-eval` · 2026-10-05T01:08:53.776Z · 37s |
| Tests | 15 total · 10 passed · 5 failed · 0 flaky · 0 skipped (from 14 scenarios) |
| Held-out integrity | ✅ PRESERVED WITH 1 AUDITED AMENDMENT(S) — 28 requirement assertions; see "Assertion amendments" |
| Hardening | tier 2 (Playwright MCP, loaded natively: walked search, no-results, sort and category filter on the live web shop and read the API calls the page made) for… (see hardening log) |
| Actions | 7 action(s) from actions/practicesoftwaretesting/ (0 proven by earlier stories, 7 new to the map) · 8 action file(s) changed after the freeze: api/categories/find-category-id.ts, api/products/_shared.ts, api/products/read-whole-catalogue.ts, ui/catalogue/_shared.ts, ui/catalogue/choose-sort-order.ts, … |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-10-05T01:19:05.281Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-6 | functional, boundary | Catalogue paginates 9 products per page, not 12 (web shop and API) | SCN-011, SCN-012, SCN-013.1, SCN-013.2 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Major | AC-7 | functional | Empty search returns no products instead of the whole catalogue | SCN-014 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (2 root cause(s), 5 failing test(s))

### APP-1 · SCN-011, SCN-012, SCN-013.1, SCN-013.2 · AC-6 — Catalogue paginates 9 products per page, not 12 (web shop and API)

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. |
| Requirement source | story.md#L28 (status: G3, provided by the user) |
| Test type · layer | functional, boundary · ui, api |
| SCN-011: expected (requirement) → actual (AUT) | `12` → `9` |
| SCN-012: expected (requirement) → actual (AUT) | `12` → `9` |
| SCN-013.1: expected (requirement) → actual (AUT) | `12` → `9` |
| SCN-013.2: expected (requirement) → actual (AUT) | `5` → `6` |
| SCN-012: also failed | [REQ AC-6] GET /products holds 12 products in data on a full page — `12` → `9` |
| SCN-012: also failed | [REQ AC-6] GET /products/search?q=pliers returns per_page 12 — `12` → `9` |
| SCN-013.2: also failed | [REQ AC-6] GET /products last page holds the rest of the 50 products at 12 per page — `2` → `9` |
| Failing step | Then it shows 12 products |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (the test's steps):**

1. Given the catalogue has more than 12 products (GET /products)
2. When I open the web shop catalogue page
3. Then it shows 12 products

**API pre-steps: SCN-011** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /products → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-012** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /products → 200` ⟵

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products'
   ```

2. `GET /products/search → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products/search?q=pliers'
   ```

Observed response of request 1 (SCN-012):

```json
{"current_page":1,"data":[{"id":"01M44S7HNKRSHDH155H9HZAP09","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold e…
```

**API pre-steps: SCN-013.1** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /products → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-013.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /products → 200` ⟵

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products?page=4'
   ```

Observed response of request 1 (SCN-013.1):

```json
{"current_page":4,"data":[{"id":"01M44S7HT7C127C53MT93F5WQ0","name":"Protective Gloves","description":"Heavy-duty leather work gloves engineered to deliver an optimal combination of cut resistance, abrasion protection, and manual dexterity for demanding industrial and construction tasks. The full-grain cowhide leather palm provides excellent grip and wear resistance when handling rough timber, sharp metal edges, concrete blocks, and hot materials. Reinforced fingertips and a padded knuckle guard protect the most vulnerable areas of the hand and significantly extend the service life of the glov…
```

**API pre-steps: SCN-013.2** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /products → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-013.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /products → 200` ⟵

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products?page=5'
   ```

Observed response of request 1 (SCN-013.2):

```json
{"current_page":5,"data":[{"id":"01M44S7HWAYRQ4YG7KS27PXASE","name":"Washers","description":"Assorted pack of 150 zinc-plated steel flat washers in popular metric sizes ranging from M4 to M10, covering the most commonly needed sizes for workshop, garage, and job site fastener work. These washers distribute the clamping force of bolts and nuts over a larger surface area, preventing damage to soft materials like wood, plastic, and painted or powder-coated metal surfaces. The smooth, burr-free finish on both faces ensures a flat, stable seating surface that maximizes friction and prevents fastene…
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run TOOL-1 --label repro --grep "SCN-011:"
npm run heldout -- run TOOL-1 --label repro --grep "SCN-012:"
npm run heldout -- run TOOL-1 --label repro --grep "SCN-013\.1:"
npm run heldout -- run TOOL-1 --label repro --grep "SCN-013\.2:"
```

#### Evidence

![SCN-011 at the moment of failure](../../runs/04-eval/artifacts/practicesoftwaretesting-TO-2ef8c-s-on-a-full-page-of-results-chromium-retry1/test-failed-1.png)

- [Page/test context at failure](../../runs/04-eval/artifacts/practicesoftwaretesting-TO-2ef8c-s-on-a-full-page-of-results-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/04-eval/artifacts/practicesoftwaretesting-TO-2ef8c-s-on-a-full-page-of-results-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-10-05 (tier 3): api-probe chain confirm/api-repro.md: GET /products, ?page=4, ?page=6 and /products/search?q=pliers all answer 200 with per_page 9, total 50, last_page 6 (page 6 from 46 to 50); inspect confirm/ui-catalogue.md + ui-catalogue.png: web shop root shows 9 product cards (a.card) with a Next button, i.e. a full page of 9. Pre/post healthchecks OK; the public demo has no page-size setting, nothing points at the sandbox.

**Evaluator's analysis:** Web shop catalogue reached (cards rendered, pagination Next present), locator a.card counts the product cards; a full page shows 9, AC-6 requires 12.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-014 · AC-7 — Empty search returns no products instead of the whole catalogue

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-7 | An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. |
| Requirement source | story.md#L29 (status G3, meaning G4, request G5: provided by the user) |
| Test type · layer | functional · api |
| SCN-014: expected (requirement) → actual (AUT) | `50` → `0` |
| Failing step | Then the answer is 200 and its total equals the whole catalogue |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (the test's steps):**

1. Given the whole catalogue's total from GET /products
2. When I GET /products/search?q= (no term)
3. Then the answer is 200 and its total equals the whole catalogue

**API pre-steps: SCN-014** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /products → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-014** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /products/search → 200` ⟵

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products/search?q='
   ```

Observed response of request 1 (SCN-014):

```json
{"current_page":1,"data":[],"from":null,"last_page":1,"per_page":9,"to":null,"total":0}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run TOOL-1 --label repro --grep "SCN-014:"
```

#### Evidence

- [Page/test context at failure](../../runs/04-eval/artifacts/practicesoftwaretesting-TO-13e19--equals-the-catalogue-total-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-1/runs/04-eval/artifacts/practicesoftwaretesting-TO-13e19--equals-the-catalogue-total-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-10-05 (tier 3, api-probe chain confirm/api-repro.md steps 1, 5, 6): GET /products total 50; GET /products/search?q= -> 200 {data:[], total:0, per_page:9, last_page:1}; GET /products/search (no q) -> 200 total 0. Healthchecks OK.

**Evaluator's analysis:** GET /products/search?q= (the empty search as defined by G5) answers 200 with total 0 and data [], while GET /products total is 50. AC-7 (with G4) requires a paginated answer whose total equals the catalogue total. Omitting q also returns total 0, so no reading of 'empty search' is met. Mobile 'All tools' screen cannot reuse the search endpoint; workaround is GET /products.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Assertion amendments (audited)

Fixes to how a requirement assertion was *implemented*. What it requires is unchanged. Each was approved with a reason before the official run.

| Assertion | Draft | Amended | Reason |
| --- | --- | --- | --- |
| tool-1.spec.ts: [REQ AC-6] GET /products last page holds the rest of the ${total} products at 12 per page | `.toBe(total - REQ.PER_PAGE * (lastPage - 1))` | `.toBe(total - REQ.PER_PAGE * (reqLastPage() - 1))` | The expected count was computed from the application own last_page; it now comes from the requirement alone (total / 12 rounded up), read from that page |

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A shopper searches the web shop and sees only matching products and the caption | AC-1 | functional | ✅ passed | - |
| SCN-002 | The web shop search for "PLIERS" shows the products the API finds for "pliers" | AC-1, AC-2 | integration | ✅ passed | - |
| SCN-003 | GET /products/search finds only products whose name contains the term, in any letter case | AC-2 | functional | ✅ passed | - |
| SCN-004 | The catalogue API answers with the paginated shape { current_page, data, per_page, total, last_page } | AC-2, AC-6, AC-7 | contract | ✅ passed | - |
| SCN-005 | A web shop search without matches shows "There are no products found." | AC-3 | functional | ✅ passed | - |
| SCN-006 | GET /products/search without matches returns 200, an empty data list and total 0 | AC-3 | functional | ✅ passed | - |
| SCN-007 | Choosing "Price (Low - High)" lists the web shop products by ascending price | AC-4 | functional | ✅ passed | - |
| SCN-008 | GET /products?sort=price,asc returns the products in ascending price order | AC-4 | functional | ✅ passed | - |
| SCN-009 | Filtering the web shop by the category "Hammer" shows only hammers | AC-5 | functional | ✅ passed | - |
| SCN-010 | GET /products?by_category=<id of Hammer> returns only products in that category | AC-5 | functional | ✅ passed | - |
| SCN-011 | The web shop shows 12 products on a full page of results | AC-6 | functional | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-012 | GET /products answers per_page 12 with 12 products on a full page | AC-6 | functional | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-013.1 | GET /products pagination at 12 per page: the page before the last holds exactly 12 products | AC-6 | boundary | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-013.2 | GET /products pagination at 12 per page: the last page holds the rest (1 to 12) and last_page is total / 12 rounded up | AC-6 | boundary | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-014 | An empty search (q= with no value) returns all products: total equals the catalogue total | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>". | SCN-001, SCN-002 | ✅ met |
| AC-2 | GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers"). | SCN-002, SCN-003, SCN-004 | ✅ met |
| AC-3 | A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0. | SCN-005, SCN-006 | ✅ met |
| AC-4 | Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order. | SCN-007, SCN-008 | ✅ met |
| AC-5 | Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category. | SCN-009, SCN-010 | ✅ met |
| AC-6 | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. | SCN-004, SCN-011, SCN-012, SCN-013.1, SCN-013.2 | ❌ not met |
| AC-7 | An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. | SCN-004, SCN-014 | ❌ not met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L23 (letter case: G6, provided by the user) | SCN-001 A shopper searches the web shop and sees only matching products and the caption | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L18 (R1: the web shop and the API behave the same), story.md#L23-L24, G6 | SCN-002 The web shop search for "PLIERS" shows the products the API finds for "pliers" | integration | ui | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L18 (R1: the web shop and the API behave the same), story.md#L23-L24, G6 | SCN-002 The web shop search for "PLIERS" shows the products the API finds for "pliers" | integration | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L24 | SCN-003 GET /products/search finds only products whose name contains the term, in any letter case | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L20 (the answer's shape), story.md#L24, story.md#L28-L29 | SCN-004 The catalogue API answers with the paginated shape { current_page, data, per_page, total, last_page } | contract | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L25 | SCN-005 A web shop search without matches shows "There are no products found." | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L25 | SCN-006 GET /products/search without matches returns 200, an empty data list and total 0 | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L26 | SCN-007 Choosing "Price (Low - High)" lists the web shop products by ascending price | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L26 (status: G3, provided by the user) | SCN-008 GET /products?sort=price,asc returns the products in ascending price order | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L27, story.md#L32 (R2: category ids from GET /categories/tree) | SCN-009 Filtering the web shop by the category "Hammer" shows only hammers | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L27, story.md#L32 (status: G3, provided by the user) | SCN-010 GET /products?by_category=<id of Hammer> returns only products in that category | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L20 (the answer's shape), story.md#L24, story.md#L28-L29 | SCN-004 The catalogue API answers with the paginated shape { current_page, data, per_page, total, last_page } | contract | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L28 | SCN-011 The web shop shows 12 products on a full page of results | functional | ui | 0/1 | ❌ fails requirement | APP-1 |
| ↳ | story.md#L28 (status: G3, provided by the user) | SCN-012 GET /products answers per_page 12 with 12 products on a full page | functional | api | 0/1 | ❌ fails requirement | APP-1 |
| ↳ | story.md#L28 | SCN-013 GET /products pagination at 12 per page | boundary | api | 0/2 | ❌ fails requirement | APP-1 |
| **AC-7** | story.md#L20 (the answer's shape), story.md#L24, story.md#L28-L29 | SCN-004 The catalogue API answers with the paginated shape { current_page, data, per_page, total, last_page } | contract | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L29 (status G3, meaning G4, request G5: provided by the user) | SCN-014 An empty search (q= with no value) returns all products: total equals the catalogue total | functional | api | 0/1 | ❌ fails requirement | APP-2 |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 1 | 2 | 0 | 2 | 0 | APP-1 |
| contract | 1 | 1 | 1 | 0 | 0 | - |
| integration | 1 | 1 | 1 | 0 | 0 | - |
| functional | 11 | 11 | 8 | 3 | 0 | APP-1, APP-2 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | web shop catalogue page: its route and how the search field, the search caption, the no-results message, the sort control, the category filter, the product cards (name, price) and the page of results are found | how to exercise | AC-1, AC-3, AC-4, AC-5, AC-6 | discovered from the AUT (mechanics only): Catalogue page is the site root '/'; search field getByTestId('search-query'), submit getByTestId('search-submit'); caption getByTestId('search-caption') (text 'Searched for: <term>'); no-results getByTestId('no-results'); sort control getByTestId('sort') (select, options by label); category filter getByRole('checkbox', { name: <category>, exact: true }); product cards a.card[data-test^='product-'] with getByTestId('product-name') and getByTestId('product-price') ('$14.15'); the page loads lists with HTTP QUERY /products and QUERY /products/search; page of results via pagination-next/prev, API ?page=N |
| G2 | where the id of the category "Hammer" is in the GET /categories/tree answer (nesting, field names), and how a product's category is seen in the product data and on the web shop to check "only hammers" | how to exercise | AC-5 | discovered from the AUT (mechanics only): GET /categories/tree answers a JSON array of top-level nodes {id, name, slug, parent_id, sub_categories:[nodes]}; 'Hammer' is a sub-category of 'Hand Tools' (id 01M44NSB700A1N91T5WRW6YVJH, a string ULID). A product's category is the nested object category {id, name, slug} in the product data; on the web shop the card shows no category, so 'only hammers' is checked against the API's products whose category.id is the Hammer id |
| G3 | exact success status of GET /products (sort, by_category, pagination) and of the empty search: the story states 200 only for GET /products/search with a term (AC-2, AC-3) | expected behaviour | AC-4, AC-5, AC-6, AC-7 | answered by the user: GET /products (sort, filter, pagination) and the empty search return 200 |
| G4 | what "returns all products" means for an empty search given that results are paginated (AC-6): a paginated answer whose total equals the whole catalogue (the total of GET /products), or every product in one answer? Proposed reading: paginated, total equals the catalogue total | expected behaviour | AC-7 | answered by the user: a normal paginated answer whose total equals the whole catalogue (the same total as GET /products) |
| G5 | what counts as an empty search (no term): q present but empty, q left out, or both must return all products | expected behaviour | AC-7 | answered by the user: an empty search is the search endpoint called with q= with no value |
| G6 | whether the web shop search must also ignore letter case: AC-2 states it for the API only, while story.md#L18 says the web shop and the API must behave the same way | expected behaviour | AC-1 | answered by the user: yes, the web shop search must also ignore letter case, like the API (R1) |

**Assumptions the evaluation made:**

- product lists are compared one page at a time (the first page of each answer); the search term used ("pliers") is expected to fit one page.

## How this verdict was produced

1. The requirement (the story's title, description and acceptance criteria, the images they show and the Confluence pages they link) was fetched from Jira and turned into a requirement contract ([requirement-contract.md](../../requirement-contract.md)): every criterion quoted from its source, the endpoints, error cases and gaps, checked by an independent reviewer.
2. Playwright TypeScript tests (UI and API) were written from the contract **only**, with no access to the AUT source or developer tests. Each test is tagged with the criteria it proves, its test type and the requirement source it comes from; expected values were copied verbatim from the requirement. Their steps call the shared actions of the application (how to reach pages and call endpoints, never what the application answers).
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only, in the tests and in the actions they call. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 10 | 5 | 0 |
| `02-harden` (hardening dry-run) | 27 | 18 | 0 |
| `03-harden` (hardening dry-run) | 30 | 15 | 0 |
| `04-eval` (final) | 10 | 5 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md) · contract: [requirement-contract.md](../../requirement-contract.md)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Actions: actions/practicesoftwaretesting/
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/04-eval/triage.md](../../runs/04-eval/triage.md) · JUnit: runs/04-eval/junit.xml
- HTML report: `npx playwright show-report output/practicesoftwaretesting/TOOL-1/runs/04-eval/html`
