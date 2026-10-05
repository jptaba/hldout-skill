# Hardening log — TOOL-1

**Tiers used:** tier 2 (Playwright MCP, loaded natively: walked search, no-results, sort and category filter on the live web shop and read the API calls the page made) for discovery, and tier 3 (`heldout inspect` probes and `heldout api-probe`) for verification and evidence. No IDE browser tool (tier 1) was available in this session. The native MCP snapshots were written under the agent's own working folder, not this project, so the saved evidence is the tier-3 reports under `hardening/tier3/`.
**AUT profile:** practicesoftwaretesting — https://practicesoftwaretesting.com/ · API https://api.practicesoftwaretesting.com · **Date:** 2026-10-05 · **Draft frozen:** draft/tool-1.spec.ts

## UI locators

| Test(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| all UI | catalogue page | `gotoPage('/')` | `gotoPage('/')` + wait for the first product list answer | page root shows the product overview | tier3/search.md |
| SCN-001, 002, 005 | search field / submit | `getByTestId('search-query')`, `getByTestId('search-submit')` | unchanged | 1 match each | tier3/search.md |
| SCN-001 | caption | `getByText('Searched for: <term>')` (spec, [REQ]) | unchanged | 1 match, "Searched for: PLIERS" (data-test `search-caption`) | tier3/search.md |
| SCN-005 | no-results message | `getByText('There are no products found.')` (spec, [REQ]) | unchanged | 1 match (data-test `no-results`) | tier3/no-results.md |
| SCN-007 | sort control | `getByTestId('sort')` `selectOption({ label })` | unchanged | 1 match; option "Price (Low - High)" = value `price,asc` | tier3/search.md, tier3/filter-sort.md |
| SCN-009 | category checkbox | `getByRole('checkbox', { name, exact: true })` | unchanged | 1 match for "Hammer" | tier3/search.md, tier3/filter-sort.md |
| all UI | product cards | `locator('a.card')` | `locator('a.card[data-test^="product-"]')` | 9 on the overview, 4 for PLIERS, 7 for Hammer, 0 for no match | tier3/*.md |
| all UI | card name / price | `getByTestId('product-name')`, `getByTestId('product-price')` | unchanged | inside each card; price text `$14.15` parsed by `parsePrice` | tier3/filter-sort.md |

## API mechanics

| Item | Verified | Evidence |
| --- | --- | --- |
| GET /categories/tree: array of `{id, name, slug, parent_id, sub_categories}`; "Hammer" is a sub-category of "Hand Tools" | 200 | tier3/api-cat-tree.md |
| A product's category: nested `category: {id, name, slug}` | 200 | tier3/api-by-category-hammer.md |
| GET /products `page=N` query parameter (spec SCN-008, SCN-013; action readWholeCatalogue) | 200, `current_page` 6 for page=6 | tier3/api-products-page6.md, tier3/api-sort-price-page2.md |
| GET /products/search `q=` (empty) | 200 | tier3/api-search-empty.md |
| Price is a JSON number | yes | tier3/api-by-category-hammer.md |
| The web shop asks for its lists with HTTP method **QUERY** on /products and /products/search (filters in the body), not GET | seen in the page's calls | tier3/search.md (API calls table) |

## Actions (reused, fixed, added)

| Action | Change | Why | Evidence |
| --- | --- | --- | --- |
| ui:catalogue `_shared.productListAnswer` | matches any method (not only GET) on the exact path, fetch/xhr only | the web shop uses QUERY; GET-only waits would time out; exact path keeps `/products` from matching `/products/search` | tier3/search.md |
| ui:catalogue `_shared.productCards` | `a.card[data-test^="product-"]` | narrower than `a.card`, tied to the product test id | tier3/*.md |
| ui:catalogue.openCatalogue | waits for the first product list answer before the cards | live walk: a sort chosen right after loading was overwritten by the late first answer (unsorted cards shown) | tier 2 walk |
| ui:catalogue.searchCatalogue, chooseSortOrder, filterCatalogueByCategory | TODO marks removed, locators verified | | tier3/search.md, tier3/filter-sort.md |
| ui:catalogue.readProductCards | reused unchanged | | |
| api:categories.findCategoryId | node type completed (`slug`, `parent_id`); recursion into `sub_categories` confirmed | | tier3/api-cat-tree.md |
| api:products `_shared` | `categoryIdOf` reads `category.id` (the guessed `category_id` field does not exist) | | tier3/api-by-category-hammer.md |
| api:products.readWholeCatalogue | `page` parameter confirmed | | tier3/api-products-page6.md |

No action added or marked stale.

## Mechanics changed (non-locator)

- Spec: removed the two `// TODO(harden)` marks on the `page` query parameter (verified) and updated the G1/G2 comment. No assertion, expected value or `@req-constants` touched.
- Gaps G1 and G2 resolved as discovered-in-aut.

## Stability

- 01-harden (single): 10 passed, 5 failed (all observed deviations below).
- 02-harden (`--repeat-each 3 --workers 2`): the deviations ×3, plus SCN-002, SCN-003 and SCN-010 failing in the first repetition only (q=PLIERS answered 0 products; by_category with the Hammer id answered 0). Investigated live: the demo **resets its data and gives the categories new ids** (the Hammer id changed from 01M44NSB700A1N91T5WRW6YVJH to 01M44S7HKD1W1H60NZ2QSCWNXV between probes), so for a while after a reset an id from GET /categories/tree did not match the products. That is the shared environment, not the tests.
- 03-harden (`--repeat-each 3 --workers 2`): 30 passed, 15 failed: exactly the 5 deviation tests ×3, nothing else. Stable.

## Observed deviations (assertions intentionally left unchanged)

| Test | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-011 | AC-6: a full page shows 12 products on the web shop | 9 product cards | runs/03-harden |
| SCN-012 | AC-6: GET /products per_page 12, 12 products in data | per_page 9, 9 products | tier3/api-products-page6.md, runs/03-harden |
| SCN-013.1 | AC-6: the page before the last holds 12 | 9 | runs/03-harden |
| SCN-013.2 | AC-6: last_page = ceil(total / 12) | total 50, last_page 6 (= ceil(50 / 9)) | runs/03-harden |
| SCN-014 | AC-7: GET /products/search?q= returns all products (total = GET /products total, 50) | 200 with total 0 and empty data | tier3/api-search-empty.md |

## Assertion implementation to review (not amended)

SCN-013.2, second `[REQ AC-6]` assertion: the expected count of the last page is computed from the application's own `last_page` (`total - 12 * (lastPage - 1)`), and the page fetched is the application's last page. When the application pages differently it asks for a meaningless number (-10 here). An expected value built only from the requirement would be `total - 12 * (Math.ceil(total / 12) - 1)`, read from page `Math.ceil(total / 12)`. It still fails today either way. The main agent decides whether to amend.
