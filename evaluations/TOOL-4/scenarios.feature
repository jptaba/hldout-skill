# Source: TOOL-4 — Favourites for signed-in customers
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: A signed-in customer adds a product to favourites with POST /favorites; the API responds 201 with the favourite (its id and the product id).
# AC-2: Adding a product that is already a favourite is rejected and the list still contains it once.
# AC-3: GET /favorites lists the customer's own favourites only; another customer's favourites are never included.
# AC-4: Every favourites endpoint responds 401 without a valid token.
# AC-5: On the web shop, a signed-in customer who clicks "Add to favourites" on a product page sees "Product added to your favorites list." and the product then appears on the "Favorites" page of their account.
# AC-6: DELETE /favorites/{favoriteId} removes the favourite (204) and it no longer appears in GET /favorites.
#
# ENDPOINT: POST /favorites — 201 with the favourite (its id and the product id) (story.md#L23)
# ENDPOINT: GET /favorites
# ENDPOINT: DELETE /favorites/{favoriteId} — 204 (story.md#L28)
#

# SEED-ENDPOINT: GET /products — find existing products to favourite (G2)
# SEED-ENDPOINT: POST /users/register — each test's own customer (the accounts recipe)
# ASSUMPTION: every test registers its own customer (seed.account()); customers the application doesn't let tests delete are kept, named hldout-….
# ASSUMPTION: favourites a test adds are removed afterwards (DELETE /favorites/{favoriteId}); one added in the web shop is found through GET /favorites and removed the same way.

@story:TOOL-4
Feature: Favourites for signed-in customers

  # from story.md AC-1
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: A customer adds a product to favourites
    Given I am a signed-in customer and know an existing product
    When I POST /favorites with that product_id
    Then the answer is 201 with the favourite's id and the product id

  # from story.md AC-2, PO comment (story.md#L34)
  @SCN-002 @AC-2 @priority:P1 @type:idempotency @layer:api
  Scenario: Adding a product that is already a favourite is refused
    Given I am a signed-in customer with a product in my favourites
    When I POST /favorites with the same product_id again
    Then the answer is 409
    And GET /favorites contains that product exactly once

  # from story.md AC-3
  @SCN-003 @AC-3 @priority:P1 @type:security @layer:api
  Scenario: Each customer sees only their own favourites
    Given customer A has favourited one product and customer B another
    When each of them requests GET /favorites
    Then A's list has A's favourite and not B's
    And B's list has B's favourite and not A's

  # from story.md AC-4
  @SCN-004 @AC-4 @priority:P1 @type:security @layer:api
  Scenario Outline: The favourites endpoints refuse calls without a valid token
    Given a customer has a favourite
    When a client sends <call> <credential>
    Then the answer is 401

    Examples:
      | call                               | credential            |
      | POST /favorites                    | without a token       |
      | GET /favorites                     | without a token       |
      | DELETE /favorites/{favoriteId}     | without a token       |
      | POST /favorites                    | with an invalid token |
      | GET /favorites                     | with an invalid token |
      | DELETE /favorites/{favoriteId}     | with an invalid token |

  # from story.md AC-5
  @SCN-005 @AC-5 @priority:P1 @type:integration @layer:ui
  Scenario: Adding to favourites in the web shop
    Given I am a signed-in customer on a product page
    When I click "Add to favourites"
    Then I see "Product added to your favorites list."
    And the product appears on the "Favorites" page of my account

  # from story.md AC-6
  @SCN-006 @AC-6 @priority:P1 @type:functional @layer:api
  Scenario: Removing a favourite
    Given I am a signed-in customer with a product in my favourites
    When I DELETE /favorites/{favoriteId}
    Then the answer is 204
    And GET /favorites no longer contains it
