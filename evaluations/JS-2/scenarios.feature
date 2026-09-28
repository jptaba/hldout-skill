# Source: JS-2 — Customer registration, login and basket
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Registering with a unique e-mail, a rule-compliant password (sent as both password and passwordRepeat), and a security question id + security answer creates the customer: the response is HTTP 201 and its body describes the new user with the submitted email and role = customer.
# AC-2: Registering with an e-mail that already belongs to a customer is rejected with HTTP 400 and a validation error whose message states the e-mail must be unique. No second account is created.
# AC-3: Registration enforces the password rules in the PO comment: a password shorter than the minimum length is rejected with HTTP 400 and the customer is not created (a follow-up login with that e-mail/password fails).
# AC-4: Logging in via POST /rest/user/login with a registered customer's correct e-mail and password returns HTTP 200 and a body containing an authentication token (a JWT used as a Bearer token) and the customer's basket id (bid).
# AC-5: Using their own token, a customer can add a product to their own basket via POST /api/BasketItems; after that customer logs in through the UI, the basket page at /#/basket lists that product with the quantity that was added.
# AC-6: Basket contents are private to their owner: a customer must be able to read only their own basket. A request to GET /rest/basket/{id} authenticated as customer A but targeting customer B's basket id must be refused and must not return B's basket. Verify with two customers you create.
#
# ENDPOINT: GET /api/SecurityQuestions — the list of valid security-question ids (status not stated)
# ENDPOINT: POST /api/Users — 201 {data:{id, email, role:"customer"}}
# ENDPOINT: POST /rest/user/login — 200 {authentication:{token, bid, umail}}
# ENDPOINT: GET /api/Products — valid product ids (status not stated)
# ENDPOINT: POST /api/BasketItems — adds the product to that basket (status not stated)
# ENDPOINT: GET /rest/basket/{id} — the basket identified by {id}, including its `Products` array and the owning `UserId` (status not stated)
#
# OPEN-QUESTION: G4 — what answer counts as 'refused' when customer A requests customer B's basket: no status or error body is stated (401, 403, 404, or an error in a 200 body?). The outcome is judged as written: the request is refused and B's basket is not returned
# OPEN-QUESTION: G5 — success status of POST /api/BasketItems is not stated; AC-5 is judged by the basket page listing the product

# SEED-ENDPOINT: DELETE /api/BasketItems/{id} — removes a basket item the test added (cleanup; found while hardening)
#
# ASSUMPTION: a follow-up login "fails" when it does not answer 200 with a token (AC-4 defines a successful login); no particular status is asserted
# ASSUMPTION: G4 — "refused" means an answer that is not 2xx; that part is tested separately (@assumes:G4), while "must not return B's basket" is tested literally
# ASSUMPTION: customers the tests register are kept when the application doesn't let tests delete them, named hldout-…@example.com

@story:JS-2
Feature: Customer registration, login and basket

  # from story.md AC-1
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: A visitor registers with a unique e-mail and a rule-compliant password
    Given I know a valid security question id from GET /api/SecurityQuestions
    When I POST /api/Users with a unique e-mail, the password as password and passwordRepeat, the security question id and an answer
    Then registration → HTTP 201
    And the response body describes the new user with the submitted email
    And the new user's role = customer

  # from story.md AC-2
  @SCN-002 @AC-2 @priority:P1 @type:negative @layer:api
  Scenario: Registering an e-mail that already belongs to a customer is rejected
    Given a customer registered with a unique e-mail
    When I POST /api/Users again with the same e-mail
    Then registering an e-mail that already belongs to a customer → HTTP 400
    And the body carries a validation error whose message states the e-mail must be unique
    And no second account is created for that e-mail: logging in with it still signs in the first customer

  # from story.md AC-3 and the PO comment (story.md#L50, L53)
  @SCN-003 @AC-3 @priority:P1 @type:boundary @layer:api
  Scenario Outline: A password shorter than 5 characters is rejected and no customer is created (<length> characters)
    Given I know a valid security question id from GET /api/SecurityQuestions
    When I POST /api/Users with a unique e-mail and a <length>-character password
    Then registering with a <length>-character password → HTTP 400
    And the customer is not created: a follow-up login with that e-mail and password fails

    Examples:
      | length |
      | 4      |
      | 3      |

  # from story.md AC-4 and attachments/api-contract.md#L31-L33
  @SCN-005 @AC-4 @priority:P1 @type:functional @layer:api
  Scenario: A registered customer logs in and receives a JWT and their basket id
    Given a customer registered with a unique e-mail and a password
    When I POST /rest/user/login with that e-mail and password
    Then login with the correct e-mail and password → HTTP 200
    And the body contains an authentication token that is a JWT
    And the body contains the customer's basket id bid

  # from story.md AC-5
  @SCN-006 @AC-5 @priority:P1 @type:integration @layer:e2e
  Scenario: A product added to one's own basket through the API is listed on the basket page after a UI login
    Given I am a customer with my own token and basket id, and know an existing product
    When I POST /api/BasketItems with my token, my basket id, that product and quantity 3
    And I log in through the UI and open /#/basket
    Then the product is added to my basket
    And the basket page lists that product
    And the listed product shows quantity 3

  # from story.md AC-6
  @SCN-007 @AC-6 @priority:P1 @type:security @layer:api
  Scenario: A customer reads their own basket but never another customer's
    Given customers A and B, and B has a product in their basket
    When A requests GET /rest/basket/{id} with A's token for A's basket id
    And A requests GET /rest/basket/{id} with A's token for B's basket id
    Then A reading their own basket gets it
    And the request for B's basket does not return B's basket

  # from story.md AC-6, "must be refused" (G4 assumed: not 2xx)
  @SCN-008 @AC-6 @priority:P1 @type:security @layer:api @assumes:G4
  Scenario: A request for another customer's basket is refused
    Given customers A and B
    When A requests GET /rest/basket/{id} with A's token for B's basket id
    Then the request is refused with a non-2xx status
