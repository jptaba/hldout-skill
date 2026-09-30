# Hardening log — TOOL-1
**Tiers used:** tier 3 (bundled `heldout inspect` with steps files and locator probes, `heldout api-probe`), after one tier-2 navigation. The native Playwright MCP server saves its snapshots in the agent session's working folder (outside this project), so the walks were redone with tier 3, whose reports land in `hardening/tier3/`. No tier-1 IDE browser tool was available.
**AUT profile:** practicesoftwaretesting — https://practicesoftwaretesting.com/ (UI), https://api.practicesoftwaretesting.com/ (API) · **Date:** 2026-09-29 · **Draft frozen:** draft/tool-1.spec.ts

**App knowledge consulted after the freeze** (`heldout knowledge TOOL-1`): app:api-docs, page:/auth/login, api:GET /categories/tree, api:GET /products, api:GET /products/search, all `seen` by `doctor --learn`. Each endpoint was probed (200) and the API document was read for the `by_category` parameter. The listing offered no entry for the start page's catalogue (it had no anchor), nor any query parameter of the GET endpoints; both were discovered and recorded with `--add`.

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| all UI | catalogue entry + readiness | `gotoPage('/')` | `gotoPage('/')` + first `getByTestId('product-name')` visible | 9 cards | tier3/home.md, home-count.md |
| SCN-001, 004, 013 | search box | `getByPlaceholder('Search')` | `getByTestId('search-query')` | 1 ✔ | tier3/home.md |
| SCN-001, 004, 013 | search button | `getByRole('button', { name: 'Search' })` | `getByTestId('search-submit')` + wait for the web shop's `/products/search` answer | 1 ✔ | tier3/search.md |
| SCN-001 | caption | `getByText('Searched for: pliers')` | unchanged | 1 ✔ | tier3/search.md |
| SCN-001, 008, 010, 013 | product names | `getByTestId('product-name')` | unchanged | 4 (search), 7 (Hammer), 9 (home) | tier3/*.md |
| SCN-006 | product prices | `getByTestId('product-price')` | unchanged | 9 | tier3/sort.md |
| SCN-004 | no-results text | `getByText('There are no products found.')` | unchanged | 1 ✔ | tier3/nomatch.md |
| SCN-006 | sort | `getByTestId('sort')` selectOption label | unchanged + wait for the `/products` answer | 1 ✔ | tier3/sort.md |
| SCN-008 | Hammer filter | `getByRole('checkbox', { name: 'Hammer', exact: true })` | unchanged + wait for the `/products` answer | 1 ✔ | tier3/hammer.md |
| SCN-010 | page 2 | `getByRole('button', { name: '2' })` | `getByRole('button', { name: 'Page-2', exact: true })` | 1 ✔ | tier3/sort.md |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| G2 item fields: id, name, price (number), category {id,name,slug} | ✔ | api-products.md |
| Paging envelope current_page/data/from/last_page/per_page/to/total | ✔ (at the end of the body: needs `--body-limit`) | api-products.md |
| G3 GET /categories/tree: array with sub_categories; Hammer is under Hand Tools | ✔ | api-categories-tree.md, api-categories-tree-2.md |
| GET /products `by_category` = category id (query, string) | ✔ | api-docs.md (L2544) |
| Case: q=PLIERS | ✔ 200, 4 products | api-search-upper.md |

## Mechanics changed (non-locator)
- The web shop reads its lists with HTTP method QUERY; the tests wait for that answer after search / sort / filter before reading cards (no requirement text is used as a wait).
- The shared demo regenerated its data during hardening (about 22:00 UTC): the Hammer id changed from 01M3QFFYCECVCZZ9QS48X58CZ2 to 01M3QJXQDY5VCAEXK60SH7D9R7; one GET /products?by_category= call at that moment answered 500, and later calls with the old id answered an empty list (api-hammer.md, api-hammer-2.md, api-hammer-3.md, api-pliers-cat.md). With the id read at run time (as the test does) the filter works (run 01-harden, SCN-009 ×3 passed). Live-app side effect, not a finding.

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-010 | web shop: 12 products per page | 9 product cards on page 1 | tier3/home-count.md; runs/01-harden |
| SCN-011 | per_page 12; page 1 holds 12 | per_page 9, 9 items (GET /products and /products/search) | api-products.md, api-search-noq.md |
| SCN-012.1/.2 (@needs-clarification, G4) | empty search returns all products (total = unfiltered total, 50) | total 0, data [] for q omitted and q="" | api-search-noq.md, api-search-emptyq.md |
