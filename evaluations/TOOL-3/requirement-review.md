# Requirement review — TOOL-3

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | description, AC-1..AC-8 table, test data line |

## Testability decisions

_How each criterion is verified._

- **AC-1** (api) POST /carts creates an empty cart and responds 201 with its id. → POST /carts; assert 201 and an `id` in the answer; read the new cart back (read call = G1, discovered while hardening) and assert it lists no products.
- **AC-2** (api) POST /carts/{id} with product_id and a quantity from 1 to 99 adds the product (200); adding a product already in the cart increases its q… → boundary rows 1 and 99 on a fresh cart (200, product listed with that quantity); a separate functional scenario adds 2 then 3 of the same product and expects one line with quantity 5. Product = an in-stock product found through the catalogue (G3).
- **AC-3** (api) A quantity outside 1–99 is rejected with 422 and an error for the quantity field; the cart is unchanged. → boundary rows 0 and 100 on a cart that already holds 1 of a product; assert 422, an error naming `quantity`, and that the cart still holds exactly that one line with quantity 1.
- **AC-4** (ui) On a product page, choosing a quantity and pressing "Add to cart" shows "Product added to shopping cart." and the cart icon in the navigation shows the total number of items. → deep-link to an in-stock product's page as a guest (fresh browser), set quantity 3, press "Add to cart"; one scenario asserts the message; a second (@needs-clarification, G9) asserts the cart icon shows 3 (literal reading: total number of items = sum of quantities).
- **AC-5** (ui) The cart page (checkout step 1) lists each product with its quantity, unit price and line total (price × quantity), and the cart total. → a guest cart with two different products (quantities 2 and 3) in the browser (G6), unit prices read from the catalogue; assert each row shows quantity, unit price and line total = price × quantity, and that a cart total is shown. Whether the cart total equals the sum of the line totals is G10: a separate @needs-clarification scenario tests that literal reading.
- **AC-6** (api) DELETE /carts/{id}/product/{productId} removes the product (204); the cart no longer lists it. → cart with two products; delete one; assert 204 and that the cart lists only the other.
- **AC-7** (api) Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. → delete a fresh cart → 204 (functional); delete it again → 204 (idempotency, @needs-clarification because of G8).
- **AC-8** (api) Any request for a cart that does not exist responds 404 with the message "Cart not found". → a "must-not-exist" id seeded by creating and deleting a cart; outline over add product / remove product / read cart → 404 + "Cart not found"; the delete-cart row is @needs-clarification (G8).
- A composition scenario chains AC-1 → AC-2 → AC-6 → AC-7 on one cart (create, add, remove, delete).

## Ambiguities / open questions

- G1–G7 (mechanics): discovered while hardening (read-cart and delete-cart calls, an in-stock product, product and cart page mechanics, getting an API cart into the browser, the id of a cart that does not exist).
- G8 (oracle, required): AC-7 (204 on an already-deleted cart) contradicts AC-8 (404 "Cart not found" for any request on a cart that does not exist). No product owner available: both literal readings are tested and tagged @needs-clarification; a failure of either is a question for the owner, not a defect.
- G9 (oracle): cart icon count = sum of quantities or number of different products — literal reading (sum of quantities) tested, @needs-clarification.
- G10 (oracle): cart total = sum of line totals, or more — literal reading (sum of line totals; the story names nothing else) tested, @needs-clarification; the requirement-backed part (a cart total is shown) is asserted separately.
- G11 (oracle): whether the 1–99 limit applies to the amount added or to the resulting quantity — OPEN-QUESTION, not tested (no scenario takes a line past 99).
