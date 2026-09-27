# Hardening log — AE-1
**Tiers used:** tier 3 (bundled `heldout inspect` with `--steps-json`/`--probe`, `heldout api-probe`) for all locators and API mechanics; tier 2 (`heldout mcp-probe`, own Playwright MCP server) for one walk of the "jean" search, which could not press the search button (it has no accessible name, and Enter does not submit) — see tier2/search-jean.md. Tier 1 not available (no IDE browser tool); the session's native Playwright MCP tools were not used because other evaluators share that browser.
**AUT profile:** automation-exercise — https://automationexercise.com (UI and API) · **Date:** 2026-09-27 · **Draft frozen:** draft/ae-1.spec.ts

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-014..017 | search box | `getByPlaceholder('Search Product')` | `getByRole('textbox', { name: 'Search Product', exact: true })` | 1 match, visible, value "jean" after search | inspect-search-jean.md |
| SCN-014..017 | search button | `getByRole('button', { name: /search/i })` | `locator('#submit_search')` (button has no accessible name) | 1 match, visible | inspect-products.md, inspect-search-jean.md |
| SCN-014, 015, 017 | grid heading | `getByRole('heading', { name: /products/i }).first()` | `locator('.features_items h2.title')` | 1 match: "All Products" (empty term) / "Searched Products" (jean, zzqxv, Men Tshirt) | inspect-search-*.md |
| SCN-014..017 | product card names | `locator('.productinfo p')` | `locator('.features_items .productinfo p')`, whitespace collapsed | 3 (jean), 34 (empty), 0 (zzqxv), 1 (Men Tshirt) | inspect-search-*.md |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| GET /api/productsList: body `{ responseCode, products: [...] }`, served as `Content-Type: text/html` (JSON parsed from text) | ✔ 200 | api-productsList.md |
| G3 category: `category.category` = category name, `category.usertype.usertype` = audience | ✔ | api-productsList.md |
| G4 POST /api/searchProduct form `search_product=<term>`: body `{ responseCode, products }`, product identity = `id` | ✔ | api-search-jean.md, api-search-nomatch.md |
| G6 message field: body `message` | ✔ | api-search-missing.md |
| Missing parameter: request sent with no body at all (was an empty form) | ✔ | api-search-missing.md |

## Mechanics changed (non-locator)
- Search submission waits for the navigation to `/products?search=<term>` (the search is a full page load).
- Card names: whitespace collapsed ("Men Tshirt" renders as inline links: " Men  Tshirt").
- Third-party ad scripts are blocked on UI tests (`openProductsPage`): in stability run 02 they injected ad text into product names ("Sleeves Printed Top - WhiteManufacturing"), making SCN-015 and SCN-016.1 flaky. Run 03 (3 repeats × 2 workers): 0 flaky.
- `audienceOf` reads `category.usertype.usertype` (G3).

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-012 (@assumes:G2) | "rejected with response code 400" — read as HTTP status 400 (assumption G2) | HTTP 200 with body `{"responseCode":400,"message":"Bad request, search_product parameter is missing in POST request."}` (the other reading of G2) | api-search-missing.md, runs/01-harden, 03-harden-stability2 |
