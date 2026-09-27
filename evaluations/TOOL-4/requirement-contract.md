# Requirement contract — TOOL-4: Favourites for signed-in customers

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-26T22:29

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | context (L17); technical notes: favourites endpoints, request body, Bearer auth from POST /users/login, 422 for duplicates (L19); AC-1…AC-6 from the acceptance-criteria custom field (L23-L28); PO clarification: duplicate → 409 Conflict superseding 422, web-shop duplicate message unchanged (L34) |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | A signed-in customer adds a product to favourites with POST /favorites; the API responds 201 with the favourite (its id and the product id). | 201; the body is the favourite, with its id; the body carries the product id that was sent | story.md#L23 |
| AC-2 | api | Adding a product that is already a favourite is rejected and the list still contains it once. | adding the same product again with POST /favorites → 409 (Conflict); GET /favorites contains the product once | story.md#L24 |
| AC-3 | api | GET /favorites lists the customer's own favourites only; another customer's favourites are never included. | GET /favorites lists the favourites the customer added; a favourite added by another customer is not included | story.md#L25 |
| AC-4 | api | Every favourites endpoint responds 401 without a valid token. | POST /favorites without a token → 401; GET /favorites without a token → 401; DELETE /favorites/{favoriteId} without a token → 401; each of them with an invalid token → 401 | story.md#L26 |
| AC-5 | ui | On the web shop, a signed-in customer who clicks "Add to favourites" on a product page sees "Product added to your favorites list." and the product then appears on the "Favorites" page of their account. | clicking "Add to favourites" shows "Product added to your favorites list."; the product appears on the "Favorites" page of the customer's account | story.md#L27 |
| AC-6 | api | DELETE /favorites/{favoriteId} removes the favourite (204) and it no longer appears in GET /favorites. | DELETE /favorites/{favoriteId} → 204; GET /favorites afterwards no longer contains that favourite | story.md#L28 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /favorites | required | 201 with the favourite (its id and the product id) | story.md#L19 |
| GET /favorites | required | the customer's own favourites | story.md#L19 |
| DELETE /favorites/{favoriteId} | required | 204 | story.md#L19 |
| POST /users/login | none | token for Authorization: Bearer <token> | story.md#L19 |
| POST /users/register | none |  | G3 |
| GET /products/search | none |  | G4 |

## Rules and boundaries

- **R1** A duplicate favourite is a conflict: the API must answer 409 Conflict (the PO clarification supersedes the 422 in the technical notes). _(story.md#L34)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | Adding a product that is already a favourite (POST /favorites) | 409 |  | story.md#L34 |
| E2 | Any favourites endpoint called without a valid token | 401 |  | story.md#L26 |

## Authentication

Authorization: Bearer <token>, the token obtained from POST /users/login; required by all favourites endpoints — credentials: a freshly registered test customer per test (G3) _(story.md#L19)_

## Test data

Register fresh customers through POST /users/register (G3) and sign them in with POST /users/login for a Bearer token; pick existing product ids from GET /products/search (G4). AC-3 uses two customers. AC-5 signs the registered customer in on the web shop (G5).
- unique e-mail address per registered customer (run-scoped)
- each test uses its own customer so favourites lists start empty and are not shared between tests
- Cleanup: favourites created through the API are removed with DELETE /favorites/{favoriteId}; registered test customers are left in place (unique per run)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | status for a duplicate favourite: the technical notes say 422, the PO comment says 409 | oracle | yes | AC-2 | story | found-in-requirement: 409 |
| G2 | API origin (the story gives paths only) | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-6 | story → config | found-in-config: https://api.practicesoftwaretesting.com (web shop https://practicesoftwaretesting.com) |
| G3 | how to create a test customer who can sign in | mechanics | yes | AC-1, AC-2, AC-3, AC-5, AC-6 | story → aut | discovered-in-aut: POST /users/register |
| G4 | how to obtain a product id to add to favourites | mechanics | yes | AC-1, AC-2, AC-3, AC-5, AC-6 | story → aut | discovered-in-aut: GET /products/search |
| G5 | web-shop sign-in route and form, product page route and the "Add to favourites" control, where the confirmation appears (AC-5) | mechanics | yes | AC-5 | story → aut | discovered-in-aut: /auth/login (data-test email / password / login-submit); /product/<id> with data-test add-to-favorites; toast role=alert |
| G6 | where the account's "Favorites" page lives and how its entries are marked (AC-5) | mechanics | yes | AC-5 | story → aut | discovered-in-aut: /account/favorites, entries data-test product-name |
| G7 | response field names for the favourite's id and the product id (AC-1) | mechanics | no | AC-1 | story | assumed: id for the favourite's id, product_id for the product id (same name as the request field in story.md#L19) |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context | who the feature is for and the two channels (web shop product page, API for the mobile app) — frames AC-5 (ui) vs the API criteria |
| story.md#L19 | endpoint auth G1 | POST /favorites (body product_id), GET /favorites, DELETE /favorites/{favoriteId}; Bearer token from POST /users/login; 422 for duplicates is superseded by L34 (G1) |
| story.md#L23 | AC-1 |  |
| story.md#L24 | AC-2 |  |
| story.md#L25 | AC-3 |  |
| story.md#L26 | AC-4 error-model |  |
| story.md#L27 | AC-5 |  |
| story.md#L28 | AC-6 |  |
| story.md#L34 | G1 R1 error-model out-of-scope | 409 Conflict for duplicates, explicitly superseding the 422 of L19; the web shop's duplicate message is left as is (out of scope) |
