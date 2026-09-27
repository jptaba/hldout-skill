# Requirement contract — TOOLB-2: Release-candidate check — shopping cart for guests

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ⚠️ not reviewed

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | Acceptance-criteria table (L21-L30, AC-1..AC-8), context and auth (L17, L19), test data (L32). No attachments (L36). |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | POST /carts creates an empty cart and responds 201 with its id. | POST /carts → 201; the response contains the new cart's id; the new cart is empty (no products) | story.md#L23 |
| AC-2 | api | POST /carts/{id} with product_id and a quantity from 1 to 99 adds the product (200); adding a product already in the cart increases its quantity by the amount added. | quantity 1 → 200 and the cart contains the product with quantity 1; quantity 99 → 200 and the cart contains the product with quantity 99; adding a product that is already in the cart increases its quantity by the amount added | story.md#L24 |
| AC-3 | api | A quantity outside 1–99 is rejected with 422 and an error for the quantity field; the cart is unchanged. | quantity 0 → 422; quantity 100 → 422; the response carries an error for the `quantity` field; the cart is unchanged (same products and quantities as before the rejected request) | story.md#L25 |
| AC-4 | ui | On a product page, choosing a quantity and pressing "Add to cart" shows "Product added to shopping cart." and the cart icon in the navigation shows the total number of items. | the message "Product added to shopping cart." is shown; the cart icon in the navigation shows the total number of items in the cart (meaning of "total number of items": G5) | story.md#L26 |
| AC-5 | ui | The cart page (checkout step 1) lists each product with its quantity, unit price and line total (price × quantity), and the cart total. | every product in the cart is listed with its quantity; every listed product shows its unit price; every listed product shows a line total equal to unit price × quantity; the cart total is shown (how it is computed: G6) | story.md#L27 |
| AC-6 | api | DELETE /carts/{id}/product/{productId} removes the product (204); the cart no longer lists it. | DELETE /carts/{id}/product/{productId} → 204; the cart no longer lists the removed product | story.md#L28 |
| AC-7 | api | Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. | deleting a cart → 204; deleting the same, already deleted cart again → 204 | story.md#L29 |
| AC-8 | api | Any request for a cart that does not exist responds 404 with the message "Cart not found". | each request for a cart id that does not exist → 404; the response carries the message "Cart not found" | story.md#L30 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /carts | none | 201 with the cart's id (AC-1) | story.md#L23 |
| POST /carts/{id} | none | 200 (AC-2) | story.md#L24 |
| DELETE /carts/{id}/product/{productId} | none | 204 (AC-6) | story.md#L28 |

## Rules and boundaries

- **R1** The quantity added to a cart must be from 1 to 99; a quantity outside 1–99 is rejected. _(story.md#L24)_
- **R2** Line total = price × quantity. _(story.md#L27)_
- **R3** The web shop keeps the cart across page views. _(story.md#L19)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | quantity outside 1–99 when adding a product to a cart | 422 | an error for the quantity field | story.md#L25 |
| E2 | any request for a cart that does not exist | 404 | Cart not found | story.md#L30 |

## Authentication

none: guests are not signed in and carts are anonymous _(story.md#L19)_

## Test data

Each test creates its own anonymous cart (POST /carts) and deletes it afterwards; products: any product that is in stock (how to find one: G3).
- use only products that are in stock
- carts are anonymous: never reuse another test's cart
- AC-8 needs a cart id that does not exist (e.g. a cart this test created and deleted), see G7 for DELETE of a cart
- Cleanup: delete every cart the test created (endpoint: G1)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | endpoint (method and path) for deleting a cart | mechanics | yes | AC-7 | story → attachments | open |
| G2 | endpoint (method and path) for reading a cart's contents (products and quantities) | mechanics | yes | AC-1, AC-2, AC-3, AC-6, AC-8 | story → attachments | open |
| G3 | how to find an in-stock product (its id for product_id, and its product page) | mechanics | yes | AC-2, AC-3, AC-4, AC-5, AC-6 | story → attachments | open |
| G4 | web shop routes and controls: product page, quantity control, cart icon in the navigation, cart page (checkout step 1) and its per-product quantity / unit price / line total and cart total | mechanics | yes | AC-4, AC-5 | story → attachments | open |
| G5 | what "the total number of items" on the cart icon counts: the sum of the quantities in the cart, or the number of distinct products | oracle | yes | AC-4 | story → attachments | assumed: the sum of the quantities of all products in the cart (each unit counts as an item) |
| G6 | how "the cart total" on the cart page is computed (sum of the line totals? anything added or deducted?) | oracle | yes | AC-5 | story → attachments | assumed: the cart total equals the sum of the line totals |
| G7 | conflict: AC-7 (L29) says deleting a cart that was already deleted responds 204; AC-8 (L30) says any request for a cart that does not exist responds 404. Which applies to DELETE of a deleted (or never-created) cart? | oracle | yes | AC-7, AC-8 | story → attachments | assumed: AC-7 is the specific exception for deleting a cart: DELETE of an already deleted cart → 204. AC-8 (404, "Cart not found") is checked with the other requests for a non-existent cart (read, add product, remove product). DELETE of a cart id that was never created is not evaluated. |
| G8 | does the 1–99 limit apply to the resulting quantity when a product already in the cart is added again (e.g. a line at 99 plus 1)? | oracle | no | AC-2, AC-3 | story → attachments | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context | Target environment (release candidate, AUT profile toolshop-rc) and cross-reference to TOOL-3; the criteria themselves are listed in full at L23-L30 and are cited from there. |
| story.md#L19 | R3, auth, context | Guests not signed in → no auth; "keeps the cart across page views" → R3 (exercised by the AC-4 → AC-5 journey); mobile-app use of the cart API is context. |
| story.md#L21 | not-a-requirement | Header row of the acceptance-criteria table (ID \| Criterion \| Layer). |
| story.md#L23 | AC-1 |  |
| story.md#L24 | AC-2, R1 |  |
| story.md#L25 | AC-3, R1 |  |
| story.md#L26 | AC-4 |  |
| story.md#L27 | AC-5, R2 |  |
| story.md#L28 | AC-6 |  |
| story.md#L29 | AC-7, G7 |  |
| story.md#L30 | AC-8, G7 |  |
| story.md#L32 | test-data, auth | Any in-stock product; carts are anonymous, tests create and delete their own. |
