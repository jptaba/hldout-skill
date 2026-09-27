# Source: TOOL-3 — Shopping cart for guests
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: POST /carts creates an empty cart and responds 201 with its id.
# AC-2: POST /carts/{id} with product_id and a quantity from 1 to 99 adds the product (200); adding a product already in the cart increases its quantity by the amount added.
# AC-3: A quantity outside 1–99 is rejected with 422 and an error for the quantity field; the cart is unchanged.
# AC-4: On a product page, choosing a quantity and pressing "Add to cart" shows "Product added to shopping cart." and the cart icon in the navigation shows the total number of items.
# AC-5: The cart page (checkout step 1) lists each product with its quantity, unit price and line total (price × quantity), and the cart total.
# AC-6: DELETE /carts/{id}/product/{productId} removes the product (204); the cart no longer lists it.
# AC-7: Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204.
# AC-8: Any request for a cart that does not exist responds 404 with the message "Cart not found".
#
# ENDPOINT: POST /carts — 201 with the new cart's id
# ENDPOINT: POST /carts/{id} — 200, product added
# ENDPOINT: DELETE /carts/{id}/product/{productId} — 204, product removed
# ENDPOINT: GET /carts/{id} — the cart with its products and quantities
# ENDPOINT: DELETE /carts/{id} — 204
# ENDPOINT: GET /products/search — matching products (used to pick an in-stock product as test data)
#
# ASSUMPTION: G7 — conflict, limited to deleting a cart that was already deleted: AC-7 (L27) says the repeated delete responds 204, AC-8 (L28) says any request for a cart that does not exist responds 404 "Cart not found": only for a cart that was already deleted: deleting it again responds 204 (AC-7, the more specific statement). Every other request for a cart that does not exist, including DELETE /carts/{id} on a cart id that never existed, responds 404 "Cart not found" (AC-8)
# ASSUMPTION: G8 — what "the total number of items" on the cart icon counts: the sum of the quantities, or the number of distinct products: the cart icon shows the sum of the quantities of all products in the cart
# ASSUMPTION: G9 — how the cart total on the cart page is computed: the cart total equals the sum of the line totals
# OPEN-QUESTION: G10 — what happens when adding a product already in the cart would take its quantity above 99

# ASSUMPTION: Each API scenario creates its own anonymous cart (POST /carts) and deletes it afterwards; the product is an in-stock product found via GET /products/search (contract G6).

@story:TOOL-3
Feature: Shopping cart for guests

  # from story.md#L21
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: Creating a cart
    When I POST /carts
    Then the response status is 201 with the cart's id
    And reading the cart lists no products

  # from story.md#L22
  @SCN-002 @AC-2 @priority:P1 @type:boundary @layer:api
  Scenario Outline: Adding a product with quantity <quantity>
    Given an empty cart and an in-stock product
    When I add the product with quantity <quantity>
    Then the response status is 200
    And the cart lists the product with quantity <quantity>
    Examples:
      | quantity |
      | 1        |
      | 99       |

  # from story.md#L22
  @SCN-003 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario: Adding a product already in the cart increases its quantity
    Given a cart holding an in-stock product with quantity 2
    When I add the same product with quantity 3
    Then the cart lists the product once with quantity 5

  # from story.md#L23
  @SCN-004 @AC-3 @priority:P1 @type:boundary @layer:api
  Scenario Outline: A quantity of <quantity> is rejected
    Given a cart holding an in-stock product with quantity 1
    When I add the product with quantity <quantity>
    Then the response status is 422 with an error for the quantity field
    And the cart is unchanged
    Examples:
      | quantity |
      | 0        |
      | 100      |

  # from story.md#L24
  @SCN-005 @AC-4 @priority:P1 @type:functional @layer:ui
  Scenario: Adding to the cart from a product page
    Given I am on the product page of an in-stock product
    When I choose quantity 2 and press "Add to cart"
    Then I see "Product added to shopping cart."
    And the cart icon shows 2

  # from story.md#L25
  @SCN-006 @AC-5 @priority:P1 @type:functional @layer:ui
  Scenario: The cart page lists quantity, unit price, line total and cart total
    Given I added an in-stock product with quantity 3 on its product page
    When I open the cart page
    Then the product is listed with quantity 3, its unit price and line total = unit price × 3
    And the cart total equals the sum of the line totals

  # from story.md#L26
  @SCN-007 @AC-6 @priority:P1 @type:functional @layer:api
  Scenario: Removing a product from the cart
    Given a cart holding an in-stock product
    When I DELETE the product from the cart
    Then the response status is 204
    And the cart no longer lists the product

  # from story.md#L27
  @SCN-008 @AC-7 @priority:P1 @type:idempotency @layer:api
  Scenario: Deleting a cart is idempotent
    Given a cart
    When I delete the cart
    Then the response status is 204
    And deleting the same cart again responds 204

  # from story.md#L28
  @SCN-009 @AC-8 @priority:P2 @type:negative @layer:api
  Scenario Outline: <request> for a cart that never existed
    Given a cart id that never existed
    When I send <request> for it
    Then the response status is 404 with the message "Cart not found"
    Examples:
      | request             |
      | a read              |
      | an add product      |
      | a remove product    |
      | a delete cart       |
