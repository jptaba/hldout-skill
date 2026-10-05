# Requirement contract — TOOL-4: Favourites for signed-in customers

_Built by the evaluator from the story (title, description, acceptance criteria), the images they show and the pages they link. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5.5), 2026-10-05T12:16

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | description, AC-1..AC-6 |
| linked/confluence-880001-favourites-api.md | auth (Bearer token from POST /users/login), OpenAPI excerpt: GET/POST /favorites, DELETE /favorites/{favoriteId}, statuses 200/201/204/401/409, request field product_id |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | A signed-in customer adds a product to favourites with POST /favorites; the API responds 201 with the favourite (its id and the product id). | POST /favorites with a product_id → 201; the response body is the favourite and contains its id; the response body contains the product id that was added | story.md#L23 |
| AC-2 | api | Adding a product that is already a favourite is rejected and the list still contains it once. | adding the same product again → 409 (the product is already a favourite); GET /favorites afterwards contains that product exactly once | story.md#L24 |
| AC-3 | api | GET /favorites lists the customer's own favourites only; another customer's favourites are never included. | GET /favorites → 200; the list contains the customer's own favourites; no favourite of another customer is included | story.md#L25 |
| AC-4 | api | Every favourites endpoint responds 401 without a valid token. | GET /favorites without a token → 401; GET /favorites with an invalid token → 401; POST /favorites without a token → 401; POST /favorites with an invalid token → 401; DELETE /favorites/{favoriteId} without a token → 401; DELETE /favorites/{favoriteId} with an invalid token → 401 | story.md#L26 |
| AC-5 | ui | On the web shop, a signed-in customer who clicks "Add to favourites" on a product page sees "Product added to your favorites list." and the product then appears on the "Favorites" page of their account. | after clicking "Add to favourites" the message "Product added to your favorites list." is shown; the product then appears on the "Favorites" page of the customer's account | story.md#L27 |
| AC-6 | api | DELETE /favorites/{favoriteId} removes the favourite (204) and it no longer appears in GET /favorites. | DELETE /favorites/{favoriteId} → 204; the removed favourite no longer appears in GET /favorites | story.md#L28 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /favorites | required | 201 the favourite, with its id and the product id | linked/confluence-880001-favourites-api.md#L18 |
| GET /favorites | required | 200 the customer's own favourites | linked/confluence-880001-favourites-api.md#L12 |
| DELETE /favorites/{favoriteId} | required | 204 removed | linked/confluence-880001-favourites-api.md#L33-L34 |
| POST /users/login |  |  | linked/confluence-880001-favourites-api.md#L5 |

## Rules and boundaries

- **R1** Favourites are a personal list per signed-in customer: GET /favorites returns the customer's own favourites only. _(story.md#L17, story.md#L25, linked/confluence-880001-favourites-api.md#L13, linked/confluence-880001-favourites-api.md#L16)_
- **R2** A product can be a favourite only once per customer; adding it again is a conflict (409). _(story.md#L24, linked/confluence-880001-favourites-api.md#L32)_
- **R3** POST /favorites requires product_id (string) in its JSON body. _(linked/confluence-880001-favourites-api.md#L21-L28)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | Any favourites endpoint (GET /favorites, POST /favorites, DELETE /favorites/{favoriteId}) called without a valid token (no body stated) | 401 |  | story.md#L26, linked/confluence-880001-favourites-api.md#L17, linked/confluence-880001-favourites-api.md#L31, linked/confluence-880001-favourites-api.md#L39 |
| E2 | POST /favorites for a product that is already a favourite (a conflict; no body stated) | 409 |  | story.md#L24, linked/confluence-880001-favourites-api.md#L32 |

## Authentication

Bearer token: Authorization: Bearer <token> on every favourites call — credentials: the token from POST /users/login (the profile's accounts recipe signs each test's customer in) _(linked/confluence-880001-favourites-api.md#L5)_

## Test data

not stated in the sources: each test uses its own signed-in customer (seed.account()); favourites the criteria act on are created by the tests through POST /favorites

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | how a test finds the id of an existing product to put in product_id (no products endpoint or product is named) | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-6 | story → linked → aut | discovered-in-aut: Existing catalogue products from GET /products (page 1, data[].id, ULID strings); POST /favorites accepted such an id as product_id (201). Action pickCatalogueProducts; same GET /products as readWholeCatalogue, proven by TOOL-1 |
| G2 | web shop product page: its route and how the "Add to favourites" button and the confirmation message are found | mechanics | yes | AC-5 | story → aut | discovered-in-aut: Route /product/{productId}; the product's name is heading data-test=product-name; the button is getByRole('button', { name: 'Add to favourites', exact: true }) (data-test=add-to-favorites, 1 match); the confirmation is shown as the page's role=alert with the text (getByText matches 1); the click calls POST /favorites (201) |
| G3 | the "Favorites" page of the customer's account: its route and how the listed products are found | mechanics | yes | AC-5 | story → aut | discovered-in-aut: Route /account/favorites (account menu 'My favorites'), loads GET /favorites; each favourite is a card data-test=favorite-<favourite id> whose product name is data-test=product-name: locator('[data-test^="favorite-"]').getByTestId('product-name') |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context, R1 |  |
| story.md#L19 | context | pointer to the linked Favourites API page, which is captured on its own |
| story.md#L23 | AC-1 |  |
| story.md#L24 | AC-2, R2 |  |
| story.md#L25 | AC-3, R1 |  |
| story.md#L26 | AC-4, E1 |  |
| story.md#L27 | AC-5 |  |
| story.md#L28 | AC-6 |  |
| linked/confluence-880001-favourites-api.md#L5 | auth, endpoint |  |
| linked/confluence-880001-favourites-api.md#L7 | context | introduces the OpenAPI excerpt below |
| linked/confluence-880001-favourites-api.md#L10-L15 | endpoint, auth |  |
| linked/confluence-880001-favourites-api.md#L16 | AC-3, R1 |  |
| linked/confluence-880001-favourites-api.md#L17 | AC-4, E1 |  |
| linked/confluence-880001-favourites-api.md#L18-L20 | endpoint, auth |  |
| linked/confluence-880001-favourites-api.md#L21-L28 | endpoint, R3 |  |
| linked/confluence-880001-favourites-api.md#L29-L30 | AC-1 |  |
| linked/confluence-880001-favourites-api.md#L31 | AC-4, E1 |  |
| linked/confluence-880001-favourites-api.md#L32 | AC-2, E2, R2 |  |
| linked/confluence-880001-favourites-api.md#L33-L37 | endpoint, auth |  |
| linked/confluence-880001-favourites-api.md#L38 | AC-6 |  |
| linked/confluence-880001-favourites-api.md#L39 | AC-4, E1 |  |
