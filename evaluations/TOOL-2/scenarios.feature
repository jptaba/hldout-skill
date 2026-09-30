# Source: TOOL-2 — Customer registration, sign-in and account protection
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
# Attachments used: none
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Registration creates the customer without echoing the password: given a new customer with a unique e-mail address, when their details are posted to POST /users/register, then the API responds 201 with the customer's details and an id, and the response does not contain the password
# AC-2: A registered e-mail address cannot register twice: given a customer already registered with an e-mail address, when the same e-mail address is registered again, then the API responds 409 with the message "A customer with this email address already exists."
# AC-3: Weak passwords are rejected with every broken rule listed: given a new customer whose password is "abc", when they register, then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number
# AC-4: Signing in on the web shop: given a registered customer on the web shop's sign-in page, when they sign in with their e-mail address and password, then they land on the "My account" page, and the navigation shows their first and last name
# AC-5: A wrong password is refused: given a registered customer, when they sign in with a wrong password, then POST /users/login responds 401, and the web shop shows "Invalid email or password"
# AC-6: The account locks after five failed attempts: given a registered customer, when five sign-in attempts with a wrong password are made, then attempts one to five respond 401, and the sixth attempt, even with the correct password, responds 423 with a message that the account is locked
# AC-7: Signing out invalidates the token: given a signed-in customer with an access token, when they sign out with GET /users/logout, then GET /users/me with the same token responds 401
#
# ENDPOINT: POST /users/register — 201 with the customer's details and an id, without the password (story.md#L26-L27)
# ENDPOINT: POST /users/login — returns { "access_token", "token_type", "expires_in" } (status not stated)
# ENDPOINT: GET /users/me
# ENDPOINT: GET /users/logout
#
# ASSUMPTION: every precondition customer is registered by the test itself through POST /users/register (the story names no other way), with a unique e-mail address; the application offers customers no stated way to delete themselves, so these customers are kept (tagged hldout-…).
# ASSUMPTION: "the customer's details" (AC-1) are the details that were posted, other than the password: the answer must carry the posted e-mail address, first name and last name. Which other fields registration needs is mechanics (found while hardening); their values are not asserted.
# ASSUMPTION: the password rules of AC-3 are stated as meanings, not as texts: each rule counts as stated when the password errors mention it (8 characters / upper and lower case / symbol / number), whatever the exact wording.
# ASSUMPTION: AC-6's "a message that the account is locked" is judged as a meaning: the 423 answer mentions that the account is locked.
# ASSUMPTION: one root cause, one failure (rule 5): the 201 status of registration is asserted in SCN-001 only; SCN-002 asserts only that the password is absent.
# OPEN-QUESTION: G4 — whether and when a locked account unlocks (lock duration or unlock procedure); the story does not say, so a locked test account may stay locked. Not tested; every lock scenario uses a customer of its own.

@story:TOOL-2
Feature: Customer registration, sign-in and account protection
  As a customer
  I want to register and sign in, with my account protected against password guessing
  So that only I can use my account

  # from story.md#L23 (Scenario: Registration creates the customer without echoing the password)
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: A new customer registers and gets their details and an id back
    Given a new customer with a unique e-mail address
    When their details are posted to POST /users/register
    Then the API responds 201
    And the response contains the customer's e-mail address, first name and last name and an id

  # from story.md#L23 (Scenario: Registration creates the customer without echoing the password)
  @SCN-002 @AC-1 @priority:P1 @type:security @layer:api
  Scenario: The registration answer does not contain the password
    Given a new customer with a unique e-mail address
    When their details are posted to POST /users/register
    Then the response does not contain the password

  # from story.md#L29
  @SCN-003 @AC-2 @priority:P1 @type:negative @layer:api
  Scenario: Registering an already registered e-mail address again is refused
    Given a customer already registered with a unique e-mail address
    When a new customer registers with the same e-mail address
    Then the API responds 409
    And the message is "A customer with this email address already exists."

  # from story.md#L34
  @SCN-004 @AC-3 @priority:P1 @type:negative @layer:api
  Scenario: A weak password lists every broken password rule
    Given a new customer with a unique e-mail address whose password is "abc"
    When they register with POST /users/register
    Then the API responds 422
    And the password errors state the rule: at least 8 characters
    And the password errors state the rule: upper and lower case letters
    And the password errors state the rule: a symbol
    And the password errors state the rule: a number

  # from story.md#L39
  @SCN-005 @AC-4 @priority:P1 @type:functional @layer:ui
  Scenario: A registered customer signs in on the web shop
    Given a registered customer with a first and last name
    And I am on the web shop's sign-in page
    When I sign in with the customer's e-mail address and password
    Then I land on the "My account" page
    And the navigation shows the customer's first and last name

  # from story.md#L45
  @SCN-006 @AC-5 @priority:P1 @type:negative @layer:e2e
  Scenario: Signing in on the web shop with a wrong password is refused
    Given a registered customer
    And I am on the web shop's sign-in page
    When I sign in with the customer's e-mail address and a wrong password
    Then POST /users/login responds 401
    And the web shop shows "Invalid email or password"

  # from story.md#L51
  @SCN-007 @AC-6 @priority:P1 @type:security @layer:api
  Scenario: Five wrong passwords lock the account, even against the correct password
    Given a registered customer
    When five sign-in attempts with a wrong password are made with POST /users/login
    Then attempts one to five respond 401
    And the sixth attempt, with the correct password, responds 423
    And the 423 answer says that the account is locked

  # from story.md#L51 — one step inside the stated limit of five
  @SCN-008 @AC-6 @priority:P2 @type:boundary @layer:api
  Scenario: Four wrong passwords do not lock the account
    Given a registered customer
    When four sign-in attempts with a wrong password are made with POST /users/login
    And a fifth attempt is made with the correct password
    Then the fifth attempt is not refused as locked and returns an access token

  # from story.md#L57
  @SCN-009 @AC-7 @priority:P1 @type:security @layer:api
  Scenario: A token no longer works after signing out
    Given a signed-in customer with an access token
    When they sign out with GET /users/logout
    Then GET /users/me with the same token responds 401

  # from story.md#L23, story.md#L57 — the customer registered in AC-1 is the one who signs in and out
  @SCN-010 @AC-1 @AC-7 @priority:P2 @type:composition @layer:api
  Scenario: A customer registers, signs in, sees their own account, signs out and loses access
    Given a new customer with a unique e-mail address
    When their details are posted to POST /users/register
    Then the API responds 201 with an id
    When they sign in with POST /users/login using the registered e-mail address and password
    Then GET /users/me with the access token shows the registered customer's id
    When they sign out with GET /users/logout
    Then GET /users/me with the same token responds 401
