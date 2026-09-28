# Requirement contract — TOOL-4: Favourites for signed-in customers

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Sonnet 5), 2026-09-28T20:26

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | description, technical notes (endpoints, auth, duplicate status), AC-1..AC-6, PO clarification (409 for duplicates) |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | A signed-in customer adds a product to favourites with POST /favorites; the API responds 201 with the favourite (its id and the product id). | POST /favorites → 201; the response is the favourite, with its id; the response contains the product id that was added | story.md#L23 |
| AC-2 | api | Adding a product that is already a favourite is rejected and the list still contains it once. | adding the same product again with POST /favorites → 409 (story.md#L34, G1); GET /favorites contains the product once | story.md#L24 |
| AC-3 | api | GET /favorites lists the customer's own favourites only; another customer's favourites are never included. | GET /favorites lists the customer's own favourites; GET /favorites includes no favourite of another customer | story.md#L25 |
| AC-4 | api | Every favourites endpoint responds 401 without a valid token. | POST /favorites, GET /favorites and DELETE /favorites/{favoriteId} each called with no token → 401; POST /favorites, GET /favorites and DELETE /favorites/{favoriteId} each called with an invalid token → 401 | story.md#L26 |
| AC-5 | ui | On the web shop, a signed-in customer who clicks "Add to favourites" on a product page sees "Product added to your favorites list." and the product then appears on the "Favorites" page of their account. | after clicking "Add to favourites", the message "Product added to your favorites list." is shown; the product appears on the "Favorites" page of the customer's account | story.md#L27 |
| AC-6 | api | DELETE /favorites/{favoriteId} removes the favourite (204) and it no longer appears in GET /favorites. | DELETE /favorites/{favoriteId} → 204; the favourite no longer appears in GET /favorites | story.md#L28 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /favorites | required | 201 with the favourite (its id and the product id) (story.md#L23) | story.md#L19 |
| GET /favorites | required |  | story.md#L19 |
| DELETE /favorites/{favoriteId} | required | 204 (story.md#L28) | story.md#L19 |
| POST /users/login |  |  | story.md#L19 |

## Rules and boundaries

- **R1** A product is a customer's favourite at most once: a duplicate favourite is rejected, and the API answers 409 Conflict (not 422 as in the technical notes). _(story.md#L19, story.md#L24, story.md#L34)_
- **R2** A customer's list of favourite products is personal. _(story.md#L17, story.md#L25)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | adding a product that is already a favourite (duplicate favourite), through the API (status resolved by G1) | 409 |  | story.md#L34, story.md#L19 |
| E2 | any favourites endpoint called without a valid token | 401 |  | story.md#L26 |

## Authentication

Authorization: Bearer <token> header on every favourites endpoint — credentials: token from POST /users/login _(story.md#L19)_

## Test data

not stated in the sources

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | status for a duplicate favourite: the technical notes say 422, the PO comment says 409 | oracle | yes | AC-2 | story | found-in-requirement: 409 |
| G2 | which product a test adds to favourites and how it gets its product id (no source names a product or how to find one) | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 | story → aut | discovered-in-aut: GET /products (public) answers {data: [{id, name, …}]}; tests take existing products from it |
| G3 | field names in the favourite returned by POST /favorites and listed by GET /favorites (the favourite's id, the product id) and the shape of the GET /favorites list | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-6 | story → aut | discovered-in-aut: POST /favorites answers {id, product_id, …}; GET /favorites an array of those |
| G4 | how a web shop test signs the customer in (sign-in page route and fields, or how the API token becomes a web session) | mechanics | yes | AC-5 | story → aut | discovered-in-aut: /auth/login: getByTestId('email'), getByTestId('password'), getByTestId('login-submit'); lands on /account (the profile's UI sign-in) |
| G5 | product page: its route, how the "Add to favourites" control is found, and where the message "Product added to your favorites list." appears | mechanics | yes | AC-5 | story → aut | discovered-in-aut: /product/<id>; button getByTestId('add-to-favorites'); the message is shown as a toast |
| G6 | "Favorites" page of the customer's account: its route or navigation, and how the listed products are found | mechanics | yes | AC-5 | story → aut | discovered-in-aut: C:/Program Files/Git/account/favorites lists each favourite with its product name |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context, R2 | who and where (web shop product page, API for the mobile app); the personal list is R2 and checked by AC-3 |
| story.md#L19 | endpoint, auth, G1, R1 | endpoints and request body, Bearer token from POST /users/login; the 422 for duplicates is superseded by L34 (G1) |
| story.md#L23 | AC-1 |  |
| story.md#L24 | AC-2, R1 |  |
| story.md#L25 | AC-3, R2 |  |
| story.md#L26 | AC-4, E2 |  |
| story.md#L27 | AC-5 |  |
| story.md#L28 | AC-6 |  |
| story.md#L34 | G1, E1, R1, out-of-scope | 409 supersedes 422 for the API; the web shop's duplicate message is left as it is (outOfScope) |
