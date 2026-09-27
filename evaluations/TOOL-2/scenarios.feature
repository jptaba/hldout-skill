# Source: TOOL-2 — Customer registration, sign-in and account protection
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Scenario: Registration creates the customer without echoing the password. Given a new customer with a unique e-mail address, When their details are posted to POST /users/register, Then the API responds 201 with the customer's details and an id, And the response does not contain the password
# AC-2: Scenario: A registered e-mail address cannot register twice. Given a customer already registered with an e-mail address, When the same e-mail address is registered again, Then the API responds 409 with the message "A customer with this email address already exists."
# AC-3: Scenario: Weak passwords are rejected with every broken rule listed. Given a new customer whose password is "abc", When they register, Then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number
# AC-4: Scenario: Signing in on the web shop. Given a registered customer on the web shop's sign-in page, When they sign in with their e-mail address and password, Then they land on the "My account" page, And the navigation shows their first and last name
# AC-5: Scenario: A wrong password is refused. Given a registered customer, When they sign in with a wrong password, Then POST /users/login responds 401, And the web shop shows "Invalid email or password"
# AC-6: Scenario: The account locks after five failed attempts. Given a registered customer, When five sign-in attempts with a wrong password are made, Then attempts one to five respond 401, And the sixth attempt, even with the correct password, responds 423 with a message that the account is locked
# AC-7: Scenario: Signing out invalidates the token. Given a signed-in customer with an access token, When they sign out with GET /users/logout, Then GET /users/me with the same token responds 401
#
# ENDPOINT: POST /users/register — 201 with the customer's details and an id, without the password (AC-1)
# ENDPOINT: POST /users/login — returns { "access_token", "token_type", "expires_in" }
# ENDPOINT: GET /users/me
# ENDPOINT: GET /users/logout
#
# ASSUMPTION: G4 — exact wording / shape of the password errors for AC-3: the story says the errors "state all four rules" but gives no messages: A rule counts as stated when the 422 response's password errors include a message that names it: the 8-character minimum, upper and lower case letters, a symbol, a number. Exact wording is not checked.
# ASSUMPTION: G5 — which "customer's details" the AC-1 response must contain: The response contains an id and echoes the submitted details (at least first name, last name and e-mail address) with the values posted.
# ASSUMPTION: G6 — exact wording of the account-locked message for AC-6 (the story says only "a message that the account is locked"): The 423 response carries a message that says the account is locked (contains the word "locked", case-insensitive); exact wording is not checked.

# ASSUMPTION: Each scenario registers its own customer through POST /users/register (contract G8); the lockout scenario's customer is dedicated to it because it gets locked.

@story:TOOL-2
Feature: Customer registration, sign-in and account protection

  # from story.md#L23
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: Registration creates the customer without echoing the password
    When I post a new customer with a unique e-mail address to POST /users/register
    Then the response status is 201
    And the response has an id and my first name, last name and e-mail address
    And the response does not contain the password

  # from story.md#L29
  @SCN-002 @AC-2 @priority:P1 @type:negative @layer:api
  Scenario: A registered e-mail address cannot register twice
    Given a customer already registered with an e-mail address
    When the same e-mail address is registered again
    Then the response status is 409
    And the message is "A customer with this email address already exists."

  # from story.md#L34
  @SCN-003 @AC-3 @priority:P1 @type:negative @layer:api
  Scenario: Weak passwords are rejected with every broken rule listed
    When a new customer registers with the password "abc"
    Then the response status is 422
    And the password errors name the 8-character minimum, upper and lower case letters, a symbol and a number

  # from story.md#L39
  @SCN-004 @AC-4 @priority:P1 @type:functional @layer:e2e
  Scenario: Signing in on the web shop
    Given a registered customer on the web shop's sign-in page
    When they sign in with their e-mail address and password
    Then they land on the "My account" page
    And the navigation shows their first and last name

  # from story.md#L45
  @SCN-005 @AC-5 @priority:P1 @type:security @layer:api
  Scenario: A wrong password is refused by the API
    Given a registered customer
    When they POST their e-mail address with a wrong password to /users/login
    Then the response status is 401

  # from story.md#L45
  @SCN-006 @AC-5 @priority:P2 @type:negative @layer:ui
  Scenario: A wrong password is refused on the web shop
    Given a registered customer on the web shop's sign-in page
    When they sign in with a wrong password
    Then the web shop shows "Invalid email or password"

  # from story.md#L51
  @SCN-007 @AC-6 @priority:P1 @type:security @layer:api
  Scenario: The account locks after five failed attempts
    Given a registered customer used only by this scenario
    When five sign-in attempts with a wrong password are made
    Then attempts one to five each respond 401
    And the sixth attempt, with the correct password, responds 423 with a message that the account is locked

  # from story.md#L57
  @SCN-008 @AC-7 @priority:P1 @type:security @layer:api
  Scenario: Signing out invalidates the token
    Given a signed-in customer with an access token
    When they sign out with GET /users/logout
    Then GET /users/me with the same token responds 401
