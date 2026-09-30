# Requirement contract — TOOL-3: Shopping cart for guests

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-29T22:46

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | description, AC-1..AC-8 table, test data line |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | POST /carts creates an empty cart and responds 201 with its id. | POST /carts responds 201; the response contains the cart's id; the new cart is empty | story.md#L21 |
| AC-2 | api | POST /carts/{id} with product_id and a quantity from 1 to 99 adds the product (200); adding a product already in the cart increases its quantity by the amount added. | quantity 1 → 200 and the product is in the cart with that quantity; quantity 99 → 200 and the product is in the cart with that quantity; adding a product already in the cart → 200 and its quantity increases by the amount added (one line for the product) | story.md#L22 |
| AC-3 | api | A quantity outside 1–99 is rejected with 422 and an error for the quantity field; the cart is unchanged. | quantity 0 → 422 with an error for the quantity field; quantity 100 → 422 with an error for the quantity field; after each rejected request the cart is unchanged | story.md#L23 |
| AC-4 | ui | On a product page, choosing a quantity and pressing "Add to cart" shows "Product added to shopping cart." and the cart icon in the navigation shows the total number of items. | pressing "Add to cart" shows "Product added to shopping cart."; the cart icon in the navigation shows the total number of items | story.md#L24 |
| AC-5 | ui | The cart page (checkout step 1) lists each product with its quantity, unit price and line total (price × quantity), and the cart total. | each product in the cart is listed with its quantity; each listed product shows its unit price; each listed product shows its line total, equal to price × quantity; the cart total is shown | story.md#L25 |
| AC-6 | api | DELETE /carts/{id}/product/{productId} removes the product (204); the cart no longer lists it. | DELETE /carts/{id}/product/{productId} responds 204; the cart no longer lists the product | story.md#L26 |
| AC-7 | api | Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. | deleting a cart → 204; deleting the same cart again → 204 | story.md#L27 |
| AC-8 | api | Any request for a cart that does not exist responds 404 with the message "Cart not found". | adding a product to a cart that does not exist → 404 with the message "Cart not found"; removing a product from a cart that does not exist → 404 with the message "Cart not found"; reading a cart that does not exist → 404 with the message "Cart not found"; deleting a cart that does not exist → 404 with the message "Cart not found" | story.md#L28 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /carts | none | 201 {id} | story.md#L21 |
| POST /carts/{id} | none | 200 | story.md#L22 |
| DELETE /carts/{id}/product/{productId} | none | 204 | story.md#L26 |

## Rules and boundaries

- **R1** The quantity added to a cart must be from 1 to 99; a quantity outside 1–99 is rejected. _(story.md#L22, story.md#L23)_
- **R2** The web shop keeps the cart across page views. _(story.md#L17)_
- **R3** Guests (not signed in) can collect products in a cart; carts are anonymous. _(story.md#L17, story.md#L30)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | quantity outside 1–99 when adding a product to a cart; the cart is unchanged | 422 | an error for the `quantity` field | story.md#L23 |
| E2 | any request for a cart that does not exist (see G8 for deleting an already deleted cart) | 404 | Cart not found | story.md#L28 |

## Test data

carts are anonymous, so tests create and delete their own (POST /carts); products: any product that is in stock
- any product that is in stock (read-only catalogue data, not seeded)
- Cleanup: tests delete the carts they create (the endpoint for deleting a cart is G2)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | endpoint for reading a cart and where its products and quantities are in the answer (to check a cart is empty, lists a product with its quantity, is unchanged, no longer lists a product) | mechanics | yes | AC-1, AC-2, AC-3, AC-6, AC-8 | story → attachments → aut | discovered-in-aut: GET /carts/{id} → 200 {id, cart_items: [{product_id, quantity, product{…}}]} |
| G2 | endpoint for deleting a cart (method and path) | mechanics | yes | AC-7, AC-8 | story → attachments → aut | discovered-in-aut: DELETE /carts/{id} (no body, no auth) |
| G3 | how a test finds a product that is in stock (its product_id, and its product page) | mechanics | yes | AC-2, AC-3, AC-4, AC-5, AC-6, AC-8 | story → attachments → aut | discovered-in-aut: GET /products (first page, envelope data[]) items carry id, name, price and in_stock; product page is /product/{id} |
| G4 | product page: route, and how the quantity control, the "Add to cart" button, the confirmation and the cart icon in the navigation are found | mechanics | yes | AC-4 | story → aut | discovered-in-aut: route /product/{id}; ready: heading level 1 = product name; quantity getByRole('spinbutton', { name: 'Quantity', exact: true }); button getByTestId('add-to-cart'); confirmation toast text; cart icon getByTestId('nav-cart') (count in getByTestId('cart-quantity')) |
| G5 | cart page (checkout step 1): route, and how each product row, its quantity, unit price and line total, and the cart total are found | mechanics | yes | AC-5 | story → aut | discovered-in-aut: route /checkout (step 1 'Cart'); row = table row with getByTestId('product-title'); cells getByTestId('product-quantity') (input), 'product-price', 'line-price'; total getByTestId('cart-total') |
| G6 | how a UI test gets a guest cart with products into the web shop (adding through product pages, or linking a cart created through the API to the browser) | mechanics | yes | AC-5 | story → aut | discovered-in-aut: the web shop keeps the guest cart id in sessionStorage 'cart_id'; set it to a cart made through the API, then open /checkout |
| G7 | an id for a cart that does not exist (the id format the cart endpoints accept) | mechanics | yes | AC-8 | story → aut | discovered-in-aut: cart ids are lowercase ULIDs from POST /carts; a missing id = a cart created then deleted |
| G8 | status for deleting a cart that was already deleted: AC-7 says 204 (idempotent), AC-8 says any request for a cart that does not exist responds 404 with the message "Cart not found" | oracle | yes | AC-7, AC-8 | story → attachments → user | open |
| G9 | what "the total number of items" on the cart icon counts: the sum of the quantities, or the number of different products | oracle | no | AC-4 | story → user | open |
| G10 | what the cart total on the cart page must equal (the sum of the line totals, or with anything else such as shipping, tax or discounts) | oracle | no | AC-5 | story → user | open |
| G11 | whether the 1–99 limit applies to the amount added or to the resulting quantity of a product already in the cart (adding to an existing line so the total goes past 99) | oracle | no | AC-2, AC-3 | story → user | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context, R2, R3 |  |
| story.md#L21 | AC-1, endpoint |  |
| story.md#L22 | AC-2, R1, endpoint, G11 |  |
| story.md#L23 | AC-3, R1, E1 |  |
| story.md#L24 | AC-4, G9 |  |
| story.md#L25 | AC-5, G10 |  |
| story.md#L26 | AC-6, endpoint |  |
| story.md#L27 | AC-7, G2, G8 |  |
| story.md#L28 | AC-8, E2, G8 |  |
| story.md#L30 | test-data, R3 |  |
