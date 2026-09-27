# Requirement contract — TOOL-3: Shopping cart for guests

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-26T22:35

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | The whole requirement: description (guests, cart kept across page views, API shared with the mobile app, L17), the AC-1..AC-8 criteria table with layers (L19-L28) and the test-data note (in-stock product, anonymous carts that tests create and delete, L30). No attachments, no comments. |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | POST /carts creates an empty cart and responds 201 with its id. | POST /carts responds 201; the response body contains the cart's id; the new cart is empty (reading it via GET /carts/{id} lists no products) | story.md#L21 |
| AC-2 | api | POST /carts/{id} with product_id and a quantity from 1 to 99 adds the product (200); adding a product already in the cart increases its quantity by the amount added. | quantity 1 → 200 and the cart lists the product with quantity 1; quantity 99 → 200 and the cart lists the product with quantity 99; adding a product already in the cart increases its quantity by the amount added (the cart lists it once, with the summed quantity) | story.md#L22 |
| AC-3 | api | A quantity outside 1–99 is rejected with 422 and an error for the quantity field; the cart is unchanged. | quantity 0 → 422; quantity 100 → 422; the error response contains an error for the quantity field; the cart is unchanged after the rejected request (same products and quantities as before) | story.md#L23 |
| AC-4 | ui | On a product page, choosing a quantity and pressing "Add to cart" shows "Product added to shopping cart." and the cart icon in the navigation shows the total number of items. | the message "Product added to shopping cart." is shown; the cart icon in the navigation shows the total number of items in the cart | story.md#L24 |
| AC-5 | ui | The cart page (checkout step 1) lists each product with its quantity, unit price and line total (price × quantity), and the cart total. | every product in the cart is listed; each listed product shows its quantity; each listed product shows its unit price; each listed product shows its line total, equal to unit price × quantity; the cart total is shown | story.md#L25 |
| AC-6 | api | DELETE /carts/{id}/product/{productId} removes the product (204); the cart no longer lists it. | DELETE /carts/{id}/product/{productId} responds 204; the cart no longer lists the removed product | story.md#L26 |
| AC-7 | api | Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. | deleting a cart → 204; deleting the same cart again → 204 | story.md#L27 |
| AC-8 | api | Any request for a cart that does not exist responds 404 with the message "Cart not found". | a request for a cart id that never existed responds 404 (read, add product, remove product, delete cart); the response carries the message "Cart not found" | story.md#L28 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /carts | none | 201 with the new cart's id | story.md#L21 |
| POST /carts/{id} | none | 200, product added | story.md#L22 |
| DELETE /carts/{id}/product/{productId} | none | 204, product removed | story.md#L26 |
| GET /carts/{id} | none | the cart with its products and quantities | G2 |
| DELETE /carts/{id} | none | 204 | G3 |
| GET /products/search | none | matching products (used to pick an in-stock product as test data) | G6 |

## Rules and boundaries

- **R1** The web shop keeps the cart across page views. _(story.md#L17)_
- **R2** A quantity from 1 to 99 is accepted when adding a product; a quantity outside 1–99 is rejected and leaves the cart unchanged. _(story.md#L22-L23)_
- **R3** The cart is for guests (not signed in); carts are anonymous. _(story.md#L17, story.md#L30)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | adding a product with a quantity outside 1–99 | 422 | an error for the quantity field | story.md#L23 |
| E2 | any request for a cart that does not exist, including deleting a cart id that never existed (see G7 for deleting an already-deleted cart) | 404 | Cart not found | story.md#L28 |

## Authentication

none: guests are not signed in and carts are anonymous _(story.md#L17)_

## Test data

Each test creates its own anonymous cart via POST /carts and fills it via POST /carts/{id} (API) or the product page (UI); products are picked via GET /products/search.
- use any product that is in stock (story.md#L30)
- carts are anonymous: no user account is needed (story.md#L30)
- AC-5 needs a cart with more than one product and a quantity above 1, so line totals and the cart total are meaningful
- AC-8 needs a cart id that never existed (not one of a cart the test deleted)
- Cleanup: delete every cart the test created (DELETE /carts/{id}, G3) afterwards

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | API origin and web shop origin | mechanics | yes | * | story → config | found-in-config: API https://api.practicesoftwaretesting.com ; web shop https://practicesoftwaretesting.com |
| G2 | endpoint for reading a cart (needed to check that a cart is empty, lists a product, is unchanged, or no longer lists a product) | mechanics | yes | AC-1, AC-2, AC-3, AC-6, AC-8 | story → aut | discovered-in-aut: GET /carts/{id} |
| G3 | endpoint for deleting a cart | mechanics | yes | AC-7, AC-8 | story → aut | discovered-in-aut: DELETE /carts/{id} |
| G4 | request header scheme for the API (how to get JSON error responses) | mechanics | yes | AC-1, AC-2, AC-3, AC-6, AC-7, AC-8 | story → aut | discovered-in-aut: send Accept: application/json on every API request |
| G5 | web shop routes and controls: product page, quantity control, Add to cart button, confirmation toast, navigation cart badge, cart page | mechanics | yes | AC-4, AC-5 | story → aut | discovered-in-aut: product page /product/<id>; quantity [data-test=quantity], [data-test=increase-quantity]; button [data-test=add-to-cart]; toast role=alert; nav badge [data-test=cart-quantity]; cart page /checkout |
| G6 | how to find an in-stock product to use as test data | mechanics | yes | AC-2, AC-3, AC-4, AC-5, AC-6, AC-8 | story → aut | discovered-in-aut: GET /products/search, then pick a product that is in stock |
| G7 | conflict, limited to deleting a cart that was already deleted: AC-7 (L27) says the repeated delete responds 204, AC-8 (L28) says any request for a cart that does not exist responds 404 "Cart not found" | oracle | yes | AC-7, AC-8 | story → user | assumed: only for a cart that was already deleted: deleting it again responds 204 (AC-7, the more specific statement). Every other request for a cart that does not exist, including DELETE /carts/{id} on a cart id that never existed, responds 404 "Cart not found" (AC-8) |
| G8 | what "the total number of items" on the cart icon counts: the sum of the quantities, or the number of distinct products | oracle | yes | AC-4 | story → user | assumed: the cart icon shows the sum of the quantities of all products in the cart |
| G9 | how the cart total on the cart page is computed | oracle | yes | AC-5 | story → user | assumed: the cart total equals the sum of the line totals |
| G10 | what happens when adding a product already in the cart would take its quantity above 99 | oracle | no | AC-2 | story | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | R1, R3, auth, context | guests not signed in (auth none), cart kept across page views (R1); the mobile app using the cart API is context |
| story.md#L19 | not-a-requirement | header row of the criteria table (ID \| Criterion \| Layer) |
| story.md#L21 | AC-1, endpoint |  |
| story.md#L22 | AC-2, R2, endpoint, G10 |  |
| story.md#L23 | AC-3, R2, error-model |  |
| story.md#L24 | AC-4, G8 |  |
| story.md#L25 | AC-5, G9 |  |
| story.md#L26 | AC-6, endpoint |  |
| story.md#L27 | AC-7, G3, G7 |  |
| story.md#L28 | AC-8, error-model, G7 |  |
| story.md#L30 | test-data, R3, G6 |  |
