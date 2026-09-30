# Hardening log — TOOL-3

**Tiers used:** tier 2 Playwright MCP (loaded natively: guest cart storage, the /checkout table and its data-test ids, putting an API cart into the browser) and tier 3 bundled tools (`heldout api-probe --chain` for every cart call, `heldout inspect` for the product page and the add-to-cart walk, `heldout run --label harden`). No tier-1 IDE browser tool in this session.
**AUT profile:** practicesoftwaretesting — https://practicesoftwaretesting.com/ · https://api.practicesoftwaretesting.com/ · **Date:** 2026-09-29 · **Draft frozen:** draft/tool-3.spec.ts

App knowledge consulted after the freeze (`heldout knowledge TOOL-3`, then `--all`): GET /products + product item shape, the cart endpoints (incl. GET and DELETE /carts/{id}, only in `--all`), and the note that the demo regenerates its ids. Each one was re-probed (api-cart-chain.md) before use.

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-005/006 | product page | `/product/{id}` + heading by name | `/product/{id}` + `getByRole('heading', { level: 1, name, exact: true })` | 1 match | tier3/product-page.md |
| SCN-005/006 | quantity | `getByLabel('Quantity')` | `getByRole('spinbutton', { name: 'Quantity', exact: true })` | 1 match | tier3/add-to-cart.md |
| SCN-005/006 | Add to cart | `getByRole('button', { name: 'Add to cart' })` | `getByTestId('add-to-cart')` | 1 match | tier3/add-to-cart.md |
| SCN-005 | confirmation | `getByText('Product added to shopping cart.')` | unchanged | 1 match, visible | tier3/add-to-cart.md |
| SCN-006 | cart icon | `getByRole('navigation').getByRole('link', { name: /cart/i })` | `getByTestId('nav-cart')` | 1 match, text "3" | tier3/add-to-cart.md |
| SCN-007/008 | cart row | `getByRole('row').filter({ hasText: name })` | row filtered by `getByTestId('product-title')` with the exact name ("Pliers" matched "Combination Pliers") | MCP snapshot | tier 2 (below) |
| SCN-007 | quantity / unit price / line total | spinbutton, cell 3, cell 4 | `product-quantity` / `product-price` / `line-price` test ids | MCP evaluate | tier 2 |
| SCN-007/008 | cart total | `getByText(/total/i).last()` (would read the "Total" label) | `getByTestId('cart-total')` | MCP evaluate | tier 2 |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| G1 read cart: GET /carts/{id} → `{ id, cart_items: [{ product_id, quantity, … }] }` | ✔ | api-cart-chain.md |
| G2 delete cart: DELETE /carts/{id} | ✔ | api-cart-chain.md |
| G3 in-stock product: GET /products `data[]` with `in_stock`, `is_rental` | ✔ | api-cart-chain.md |
| G6 guest cart in the browser: `sessionStorage.cart_id` (set, then open /checkout) | ✔ | tier 2 MCP: after Add to cart sessionStorage = { cart_id, cart_quantity }; an API cart with 2+3 items shown on /checkout |
| G7 missing cart: create + delete; ids are lowercase ULIDs | ✔ | api-cart-chain.md |
| validation envelope `errors.quantity: string[]`, error `message` | ✔ | api-cart-chain.md |

## Mechanics changed (non-locator)
- `inStockProducts` filters on `in_stock === true` and skips rentals and "Thor Hammer" (see OBSERVATION: that product refuses more than one per cart; hardening/api-thor-hammer.md). Test data choice only; every AC-2 check is unchanged.
- The UI add-to-cart helper tracks the cart the web shop makes (sessionStorage.cart_id) for cleanup.
- Profile paced after HTTP 429 in run 01: `maxWorkers 1`, `minTestIntervalMs 6000`.

## Environment notes
- Run 01-harden: HTTP 429 from the shared demo (4 workers). Live-app side effect.
- Run 03-harden-stability: two seeds answered 422 "The selected product id is invalid." and one cleanup 500 — the demo regenerated its catalogue during the run (product ids changed from 01M3QJX… to 01M3QPB…, the leftover cart was gone afterwards: api-seed-422.md). Live-app side effect; run 04 (same scenarios, ×2) passed 14/14. Run 04 was started by accident (a command meant only to read run 03), kept as history.

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-011 (AC-7, G8) | deleting an already-deleted cart → 204 | 404 `{"message":"Cart doesnt exists"}` | api-cart-chain.md step 13 |
| SCN-012.2 (AC-8) | 404 "Cart not found" | 404 "Cart doesnt exists" (DELETE /carts/{id}/product/{productId}) | step 16 |
| SCN-012.3 (AC-8) | 404 "Cart not found" | 404 "Requested item not found" (GET /carts/{id}) | step 14 |
| SCN-013 (AC-8, G8) | 404 "Cart not found" | 404 "Cart doesnt exists" (DELETE /carts/{id}) | step 13 |
