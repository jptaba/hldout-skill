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
# ENDPOINT: POST /carts — 201 {id}
# ENDPOINT: POST /carts/{id} — 200
# ENDPOINT: DELETE /carts/{id}/product/{productId} — 204
#
# SEED-ENDPOINT: GET /carts/{id} — read a cart back (G1; the story names no read call; path confirmed while hardening)
# SEED-ENDPOINT: DELETE /carts/{id} — delete a cart (G2; the story names no path; cleanup, and the call under test for AC-7/AC-8)
# SEED-ENDPOINT: GET /products — find a product that is in stock (G3)
#
# ASSUMPTION: rule 5 — only SCN-002 asserts the exact 200 of adding a product; SCN-003 and the composition assert the resulting cart contents.
# ASSUMPTION: a cart "that does not exist" is seeded by creating a cart and deleting it (G7); never a guessed id.
# ASSUMPTION: the cart and its reads are anonymous (story: "carts are anonymous"); no scenario sends a token.
# OBSERVATION: the in-stock product "Thor Hammer" refuses a quantity of 2 (and a second add of 1) with 400 "You can only have one Thor Hammer in the cart." (hardening/api-thor-hammer.md; also seen on its product page). AC-2 states 1–99 for adding a product and the test data line allows "any product that is in stock"; the story names no per-product limit. The tests use other in-stock products; the owner should say whether per-product limits are intended.
# OPEN-QUESTION: G8 — status for deleting a cart that was already deleted: AC-7 says 204 (idempotent), AC-8 says any request for a cart that does not exist responds 404 with the message "Cart not found". Both literal readings are tested (SCN-011, SCN-013) and tagged @needs-clarification.
# OPEN-QUESTION: G9 — what "the total number of items" on the cart icon counts: the sum of the quantities, or the number of different products. SCN-006 tests the sum of the quantities (@needs-clarification).
# OPEN-QUESTION: G10 — what the cart total on the cart page must equal (the sum of the line totals, or with anything else such as shipping, tax or discounts). SCN-008 tests the sum of the line totals (@needs-clarification).
# OPEN-QUESTION: G11 — whether the 1–99 limit applies to the amount added or to the resulting quantity of a product already in the cart (adding to an existing line so the total goes past 99). Not tested.

@story:TOOL-3
Feature: Shopping cart for guests
  As a guest (not signed in)
  I want to collect products in a cart before checkout
  So that I can buy them together

  # from story.md#L21
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: A guest creates an empty cart
    Given I am not signed in
    When I POST /carts
    Then the response status is 201
    And the response contains the cart's id
    And reading the cart lists no products

  # from story.md#L22
  @SCN-002 @AC-2 @priority:P1 @type:boundary @layer:api
  Scenario Outline: Adding a product with a quantity on the limits of 1–99
    Given I created an empty cart
    And a product that is in stock
    When I POST /carts/{id} with the product_id and quantity <quantity>
    Then the response status is 200
    And the cart lists the product with quantity <quantity>
    Examples:
      | quantity |
      | 1        |
      | 99       |

  # from story.md#L22
  @SCN-003 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario: Adding a product already in the cart increases its quantity by the amount added
    Given I created a cart holding 2 of a product that is in stock
    When I POST /carts/{id} with the same product_id and quantity 3
    Then the cart lists the product once, with quantity 5

  # from story.md#L23
  @SCN-004 @AC-3 @priority:P1 @type:boundary @layer:api
  Scenario Outline: A quantity just outside 1–99 is rejected and the cart is unchanged
    Given I created a cart holding 1 of a product that is in stock
    And another product that is in stock
    When I POST /carts/{id} with the other product's product_id and quantity <quantity>
    Then the response status is 422
    And the response has an error for the quantity field
    And the cart still lists only the first product, with quantity 1
    Examples:
      | quantity |
      | 0        |
      | 100      |

  # from story.md#L24
  @SCN-005 @AC-4 @priority:P1 @type:functional @layer:ui
  Scenario: Adding a product from its product page shows the confirmation
    Given I am a guest with an empty cart
    And I am on the product page of a product that is in stock
    When I choose quantity 3
    And I press "Add to cart"
    Then I see "Product added to shopping cart."

  # from story.md#L24
  @SCN-006 @AC-4 @priority:P2 @type:functional @layer:ui @needs-clarification
  Scenario: The cart icon shows the total number of items after adding from the product page
    Given I am a guest with an empty cart
    And I am on the product page of a product that is in stock
    When I choose quantity 3
    And I press "Add to cart"
    Then the cart icon in the navigation shows 3

  # from story.md#L25
  @SCN-007 @AC-5 @priority:P1 @type:functional @layer:ui
  Scenario: The cart page lists each product with quantity, unit price and line total
    Given I am a guest whose cart holds 2 of one in-stock product and 3 of another
    When I open the cart page (checkout step 1)
    Then each product is listed with its quantity
    And each product is listed with its unit price
    And each product is listed with its line total, equal to price × quantity
    And the cart total is shown

  # from story.md#L25
  @SCN-008 @AC-5 @priority:P2 @type:functional @layer:ui @needs-clarification
  Scenario: The cart total equals the sum of the line totals
    Given I am a guest whose cart holds 2 of one in-stock product and 3 of another
    When I open the cart page (checkout step 1)
    Then the cart total equals the sum of the line totals

  # from story.md#L26
  @SCN-009 @AC-6 @priority:P1 @type:functional @layer:api
  Scenario: Removing a product from the cart
    Given I created a cart holding 1 each of two products that are in stock
    When I DELETE /carts/{id}/product/{productId} for the first product
    Then the response status is 204
    And the cart no longer lists the first product
    And the cart still lists the second product

  # from story.md#L27
  @SCN-010 @AC-7 @priority:P1 @type:functional @layer:api
  Scenario: Deleting a cart
    Given I created an empty cart
    When I delete the cart
    Then the response status is 204

  # from story.md#L27
  @SCN-011 @AC-7 @priority:P1 @type:idempotency @layer:api @needs-clarification
  Scenario: Deleting a cart that was already deleted
    Given I created a cart and deleted it
    When I delete the cart again
    Then the response status is 204

  # from story.md#L28
  @SCN-012 @AC-8 @priority:P1 @type:negative @layer:api
  Scenario Outline: A request for a cart that does not exist is answered 404 "Cart not found"
    Given a cart id that does not exist (a cart I created and deleted)
    And a product that is in stock
    When I <request> for that cart
    Then the response status is 404
    And the message is "Cart not found"
    Examples:
      | request                                    |
      | add the product (POST /carts/{id})         |
      | remove the product (DELETE /carts/{id}/product/{productId}) |
      | read the cart                              |

  # from story.md#L28
  @SCN-013 @AC-8 @priority:P2 @type:negative @layer:api @needs-clarification
  Scenario: Deleting a cart that does not exist is answered 404 "Cart not found"
    Given a cart id that does not exist (a cart I created and deleted)
    When I delete that cart
    Then the response status is 404
    And the message is "Cart not found"

  # from story.md#L21, story.md#L22, story.md#L26, story.md#L27
  @SCN-014 @AC-1 @AC-2 @AC-6 @AC-7 @priority:P1 @type:composition @layer:api
  Scenario: A guest cart from creation to deletion
    Given a product that is in stock
    When I POST /carts
    And I add 2 of the product to the cart I created
    Then the cart lists the product with quantity 2
    When I remove the product from that cart
    Then that cart lists no products
    When I delete that cart
    Then the response status is 204
