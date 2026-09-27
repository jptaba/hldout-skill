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
# ENDPOINT: POST /favorites — 201 with the favourite (its id and the product id)
# ENDPOINT: GET /favorites — the customer's own favourites
# ENDPOINT: DELETE /favorites/{favoriteId} — 204
# ENDPOINT: POST /users/login — token for Authorization: Bearer <token>
# ENDPOINT: POST /users/register
# ENDPOINT: GET /products/search
#
# ASSUMPTION: G7 — response field names for the favourite's id and the product id (AC-1): id for the favourite's id, product_id for the product id (same name as the request field in story.md#L19)

# ASSUMPTION: G1 — duplicates answer 409: the Product Owner's comment explicitly supersedes the technical note's 422 (story.md#L34).
# ASSUMPTION: Each scenario registers its own customer(s) via POST /users/register and signs in via POST /users/login; favourites are removed after the test.

@story:TOOL-4
Feature: Favourites for signed-in customers

  # from story.md#L23
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: A signed-in customer adds a favourite
    Given I am a signed-in customer and know an in-stock product
    When I POST the product to /favorites
    Then the response status is 201
    And the favourite has an id and the product id I sent

  # from story.md#L24, story.md#L34
  @SCN-002 @AC-2 @priority:P1 @type:negative @layer:api
  Scenario: Adding the same favourite twice is rejected with 409
    Given I am a signed-in customer with the product in my favourites
    When I POST the same product to /favorites again
    Then the response status is 409
    And GET /favorites contains the product once

  # from story.md#L25
  @SCN-003 @AC-3 @priority:P1 @type:security @layer:api
  Scenario: A customer sees only their own favourites
    Given another customer has a favourite product
    And I am a signed-in customer with a different favourite
    When I GET /favorites
    Then my favourite is listed
    And the other customer's favourite is not

  # from story.md#L26
  @SCN-004 @AC-4 @priority:P1 @type:security @layer:api
  Scenario Outline: <request> with <credentials> is refused with 401
    When I send <request> with <credentials>
    Then the response status is 401
    Examples:
      | request                  | credentials       |
      | POST /favorites          | no token          |
      | GET /favorites           | no token          |
      | DELETE /favorites/{id}   | no token          |
      | POST /favorites          | an invalid token  |
      | GET /favorites           | an invalid token  |
      | DELETE /favorites/{id}   | an invalid token  |

  # from story.md#L27
  @SCN-005 @AC-5 @priority:P1 @type:integration @layer:e2e
  Scenario: Adding a favourite on the web shop
    Given I am signed in on the web shop as a registered customer
    And I am on the product page of an in-stock product
    When I click "Add to favourites"
    Then I see "Product added to your favorites list."
    And the product appears on the Favorites page of my account

  # from story.md#L28
  @SCN-006 @AC-6 @priority:P1 @type:functional @layer:api
  Scenario: Removing a favourite
    Given I am a signed-in customer with the product in my favourites
    When I DELETE the favourite
    Then the response status is 204
    And GET /favorites no longer contains it
