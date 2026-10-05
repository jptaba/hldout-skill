# Hardening log — TOOL-4

**Tiers used:** tier 3 (bundled `heldout inspect` for the web shop pages and `heldout api-probe` chains for the favourites API). No IDE browser tool in this session; Playwright MCP was not used: the walks were short and tier 3 records its evidence in the story folder directly.
**AUT profile:** practicesoftwaretesting — UI https://practicesoftwaretesting.com/, API https://api.practicesoftwaretesting.com · **Date:** 2026-10-05 · **Draft frozen:** draft/tool-4.spec.ts

## UI locators

| Test(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-005, SCN-010 | "Add to favourites" button on the product page | `getByTestId('add-to-favorites')` | `getByRole('button', { name: 'Add to favourites', exact: true })` (the requirement's label), in the new action `clickAddToFavourites` | 1 match, visible | [tier3/product-add-favourite.md](tier3/product-add-favourite.md) |
| SCN-005, SCN-010 | confirmation "Product added to your favorites list." | `getByText(REQ.ADDED_MESSAGE)` | unchanged ([REQ] assertion); shown as the page's `role=alert` | 1 match, visible | [tier3/product-add-favourite.md](tier3/product-add-favourite.md) |
| SCN-005, SCN-010 | product page readiness (product name) | `getByTestId('product-name')` | unchanged: the product heading, 1 match (related products carry no such test id) | 1 match, visible | [tier3/product-add-favourite.md](tier3/product-add-favourite.md) |
| SCN-005 | product names on the Favorites page | `getByTestId('product-name')` | `locator('[data-test^="favorite-"]').getByTestId('product-name')` (scoped to the favourite cards) | 1 match for 1 favourite | [tier3/favorites-page.md](tier3/favorites-page.md), [tier3/favorites-page-scoped.md](tier3/favorites-page-scoped.md) |

## API mechanics

| Item | Verified | Evidence |
| --- | --- | --- |
| G1: product ids from GET /products page 1 (`data[].id`, ULID strings) are accepted as `product_id` | POST /favorites → 201 | [tier3/favorites-api.md](tier3/favorites-api.md) |
| POST /favorites answer: object `{product_id, user_id, id}`: favourite id in `id`, product id in `product_id` | shape | [tier3/favorites-api.md](tier3/favorites-api.md) |
| GET /favorites answer: a bare list of `{id, user_id, product_id, product{…}}` | shape | [tier3/favorites-api.md](tier3/favorites-api.md) |
| DELETE /favorites/{id} with the owner's Bearer token (cleanup) | 204 | [tier3/favorites-api.md](tier3/favorites-api.md), [tier3/probe-cleanup.md](tier3/probe-cleanup.md) |
| Bearer auth: `Authorization: Bearer <access_token>` from POST /users/login (accounts recipe) | used by every call above | [tier3/favorites-api.md](tier3/favorites-api.md) |

## Actions (reused, fixed, added)

| Action | Change | Why | Evidence |
| --- | --- | --- | --- |
| accounts recipe (`seed.account()`, UI `signIn`) | reused unprobed (proven by TOOL-2) | checked by the harden runs | runs/01-harden, runs/02-harden |
| `api/products/pickCatalogueProducts` | reused, TODO-free; not probed separately (same GET /products as `readWholeCatalogue`, proven by TOOL-1); the chain confirmed page 1's ids | G1 | [tier3/favorites-api.md](tier3/favorites-api.md) |
| `api/favorites/addFavourite` | reused, no change | the POST /favorites answer carries `id` as it reads it | [tier3/favorites-api.md](tier3/favorites-api.md) |
| `api/favorites/_shared` (`favouriteIdOf`, `productIdOf`, `favouritesIn`) | TODO(harden) marks replaced by the confirmed fields (no logic change) | answer shapes probed | [tier3/favorites-api.md](tier3/favorites-api.md) |
| `ui/product/openProductPage` | TODO marks removed: route `/product/{id}` and the readiness locator confirmed | G2 | [tier3/product-add-favourite.md](tier3/product-add-favourite.md) |
| `ui/product/clickAddToFavourites` | **added**: clicks the product page's "Add to favourites" button | a step later stories on favourites need; replaces the inline test-id click | [tier3/product-add-favourite.md](tier3/product-add-favourite.md) |
| `ui/account/openFavoritesPage` | TODO marks removed: route `/account/favorites` and its GET /favorites load confirmed | G3 | [tier3/favorites-page.md](tier3/favorites-page.md) |
| `ui/account/readFavoriteProductNames` | locator scoped to the favourite cards (`data-test="favorite-<id>"`) | so it reads only listed favourites | [tier3/favorites-page-scoped.md](tier3/favorites-page-scoped.md) |

## Mechanics changed (non-locator)

- Header comments of the spec now record G1–G3 as discovered in the AUT.
- Contract gaps G1, G2, G3 resolved with `contract --resolve` (discovered-in-aut, evidence above).

## Stability

- runs/01-harden (before the changes, `--capture`): 15 passed, 0 failed.
- runs/02-harden (`--repeat-each 3 --workers 2`): 45 passed, 0 failed, 0 flaky; test data 75 created, 39 cleaned up, 36 accounts kept by design (no delete in the application), 0 left behind.
- Integrity: PRESERVED (20 REQ assertions in draft → 20 now).

## Observed deviations (assertions intentionally left unchanged)

| Test | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| — | none observed while hardening | every test passed 3 times | runs/02-harden |

Probe side effects on the live app: one probe customer (`hldout-probe-…@example.com`) registered and kept (no delete in the application); its favourite removed again.
