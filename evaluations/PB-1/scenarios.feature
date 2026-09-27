# Source: PB-1 — Customer registration and sign-in
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Submitting the registration form with every field empty keeps the customer on the form and shows a message next to each required field: "First name is required.", "Last name is required.", "Address is required.", "City is required.", "State is required.", "Zip Code is required.", "Social Security Number is required.", "Username is required.", "Password is required.", "Password confirmation is required.". No message is shown for Phone #.
# AC-2: When Password and Confirm differ, the form shows "Passwords did not match." and no customer is created (the user name cannot sign in afterwards).
# AC-3: A complete, valid registration opens a page with the heading Welcome <username> (source: "Welcome _&lt;username&gt;_") and the text "Your account was created successfully. You are now logged in." The customer is signed in: the left panel greets them with Welcome <first name> <last name> (source: "Welcome _&lt;first name&gt; &lt;last name&gt;_") and shows the Account Services menu.
# AC-4: Registering again with a user name that is already taken shows "This username already exists." next to Username and does not change the existing customer (a REST login of the existing customer still returns their original first and last name).
# AC-5: On the Customer Login panel, signing in with a wrong password shows an "Error!" page with "The username and password could not be verified."; signing in with both fields empty shows "Please enter a username and password."
# AC-6: Signing in with the registered user name and password opens the Accounts Overview page, which lists at least one account for the new customer. "Log Out" returns to the home page with the Customer Login panel.
# AC-7: GET /login/{username}/{password} with valid credentials answers 200 and returns the customer: id, firstName, lastName, address (street, city, state, zipCode) and phoneNumber, equal to the values entered at registration. With Accept: application/json the body is JSON; without it, XML with a customer root element.
# AC-8: GET /login/{username}/{password} with a wrong password answers 400 with the body "Invalid username and/or password".
# AC-9: End to end: for a customer registered through the page, GET /customers/{id} (id from the login response) returns the same customer, and GET /customers/{id}/accounts returns the account(s) whose numbers are shown in the Accounts Overview.
#
# ENDPOINT: GET /login/{username}/{password} — 200
# ENDPOINT: GET /customers/{id}
# ENDPOINT: GET /customers/{id}/accounts
#
# ASSUMPTION: G5 — how "the user name cannot sign in afterwards" is observed: the story does not state what GET /login/{username}/{password} (or the Customer Login panel) answers for a user name that was never created: Sign-in fails: GET /login/{username}/{password} with that user name and the password used does not answer 200 with a customer. No specific status or message is asserted.
# ASSUMPTION: G6 — what "returns the same customer" and "returns the account(s) whose numbers are shown" compare: which customer fields, and whether the account set must be equal or only contain the shown numbers: GET /customers/{id} succeeds and its id, firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal those of the login response (the fields AC-7 lists); the account ids returned by GET /customers/{id}/accounts are exactly the account numbers shown in the Accounts Overview.
# ASSUMPTION: AC-7 "without Accept: application/json" is exercised with "Accept: */*" (the test client always sends an Accept header; */* does not ask for JSON).
# ASSUMPTION: every scenario registers its own customer through register.htm (the story names no REST registration endpoint, gap G1). The story offers no way to delete a customer, so registered customers stay in the shared demo DB with unique pb1… user names.
# ASSUMPTION: one root cause, one failure: the exact success texts of registration are asserted only in SCN-004; other scenarios that register a customer treat registration as a precondition.

@story:PB-1
Feature: Customer registration and sign-in
  As a prospective ParaBank customer
  I want to register for online banking and sign in with my own user name and password
  So that I can manage my accounts online, and partner apps can authenticate me through the banking REST service

  # from story.md#L32 (AC-1), story.md#L26 (R1)
  @SCN-001 @AC-1 @priority:P2 @type:negative @layer:ui
  Scenario: Submitting an empty registration form shows a required message next to every required field
    Given I am on the registration page register.htm
    When I submit the registration form with every field empty
    Then I am still on the registration form
    And "First name is required." is shown next to First Name
    And "Last name is required." is shown next to Last Name
    And "Address is required." is shown next to Address
    And "City is required." is shown next to City
    And "State is required." is shown next to State
    And "Zip Code is required." is shown next to Zip Code
    And "Social Security Number is required." is shown next to SSN
    And "Username is required." is shown next to Username
    And "Password is required." is shown next to Password
    And "Password confirmation is required." is shown next to Confirm
    And no message is shown for Phone #

  # from story.md#L33 (AC-2)
  @SCN-002 @AC-2 @priority:P1 @type:negative @layer:ui
  Scenario: Registering with a Confirm that differs from Password shows "Passwords did not match."
    Given I am on the registration page register.htm
    When I submit a complete registration with a fresh user name whose Confirm differs from Password
    Then the form shows "Passwords did not match."

  # from story.md#L33 (AC-2), gap G5
  @SCN-003 @AC-2 @priority:P1 @type:integration @layer:e2e @assumes:G5
  Scenario: A registration rejected for mismatched passwords creates no customer
    Given I submitted a complete registration with a fresh user name whose Confirm differs from Password
    When I call GET /login/{username}/{password} with that user name and the Password I entered
    Then the call does not answer 200 with a customer

  # from story.md#L34 (AC-3)
  @SCN-004 @AC-3 @priority:P1 @type:functional @layer:ui
  Scenario: A complete, valid registration welcomes the new customer and signs them in
    Given I am on the registration page register.htm
    When I submit a complete, valid registration with a fresh user name
    Then the page shows the heading "Welcome <username>"
    And the page shows "Your account was created successfully. You are now logged in."
    And the left panel greets me with "Welcome <first name> <last name>"
    And the left panel shows the Account Services menu

  # from story.md#L35 (AC-4)
  @SCN-005 @AC-4 @priority:P1 @type:negative @layer:ui
  Scenario: Registering with a user name that is already taken shows "This username already exists."
    Given a customer is registered with a fresh user name
    And I am on the registration page register.htm as a new visitor
    When I submit a complete registration with the same user name and a different first and last name
    Then "This username already exists." is shown next to Username

  # from story.md#L35 (AC-4)
  @SCN-006 @AC-4 @priority:P1 @type:integration @layer:e2e
  Scenario: A duplicate registration does not change the existing customer
    Given a customer is registered with a fresh user name
    And a second registration with the same user name and a different first and last name was submitted
    When I call GET /login/{username}/{password} for the existing customer
    Then the response returns the original first and last name

  # from story.md#L36 (AC-5)
  @SCN-007 @AC-5 @priority:P1 @type:negative @layer:ui
  Scenario: Signing in with a wrong password shows the "Error!" page
    Given a customer is registered with a fresh user name
    And I am on the home page as a signed-out visitor
    When I sign in on the Customer Login panel with that user name and a wrong password
    Then an "Error!" page is shown
    And it says "The username and password could not be verified."

  # from story.md#L36 (AC-5)
  @SCN-008 @AC-5 @priority:P2 @type:negative @layer:ui
  Scenario: Signing in with both fields empty asks for a user name and password
    Given I am on the home page as a signed-out visitor
    When I sign in on the Customer Login panel with both fields empty
    Then the page says "Please enter a username and password."

  # from story.md#L37 (AC-6)
  @SCN-009 @AC-6 @priority:P1 @type:functional @layer:ui
  Scenario: Signing in opens the Accounts Overview and Log Out returns to the home page
    Given a customer is registered with a fresh user name
    And I am on the home page as a signed-out visitor
    When I sign in on the Customer Login panel with that user name and password
    Then the Accounts Overview page opens
    And it lists at least one account
    When I click "Log Out"
    Then I am on the home page with the Customer Login panel

  # from story.md#L38 (AC-7)
  @SCN-010 @AC-7 @priority:P1 @type:functional @layer:api
  Scenario: REST login with valid credentials returns the registered customer as JSON
    Given a customer is registered with a fresh user name, a full address and a Phone #
    When I call GET /login/{username}/{password} with Accept: application/json
    Then the response status is 200
    And the body is JSON
    And it contains the customer's id
    And firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal the values entered at registration

  # from story.md#L38 (AC-7)
  @SCN-011 @AC-7 @priority:P2 @type:contract @layer:api
  Scenario: REST login without Accept: application/json returns XML with a customer root element
    Given a customer is registered with a fresh user name
    When I call GET /login/{username}/{password} without Accept: application/json
    Then the response status is 200
    And the body is XML with a customer root element

  # from story.md#L39 (AC-8)
  @SCN-012 @AC-8 @priority:P1 @type:negative @layer:api
  Scenario: REST login with a wrong password answers 400 "Invalid username and/or password"
    Given a customer is registered with a fresh user name
    When I call GET /login/{username}/{password} with a wrong password
    Then the response status is 400
    And the body is "Invalid username and/or password"

  # from story.md#L40 (AC-9)
  @SCN-013 @AC-9 @priority:P1 @type:integration @layer:e2e
  Scenario: The customer and accounts services return the customer registered through the page
    Given a customer is registered through the registration page with a fresh user name
    And I noted the account numbers shown in the Accounts Overview
    And I obtained the customer id from GET /login/{username}/{password}
    When I call GET /customers/{id}
    Then it returns the customer with the same id, first name and last name as the login response
    When I call GET /customers/{id}/accounts
    Then every account number shown in the Accounts Overview is returned

  # from story.md#L40 (AC-9), gap G6
  @SCN-014 @AC-9 @priority:P2 @type:integration @layer:e2e @assumes:G6
  Scenario: The customer and accounts services match the login response and the Accounts Overview exactly
    Given a customer is registered through the registration page with a fresh user name
    And I noted the account numbers shown in the Accounts Overview
    And I obtained the customer id from GET /login/{username}/{password}
    When I call GET /customers/{id}
    Then its id, firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal the login response
    When I call GET /customers/{id}/accounts
    Then the account ids returned are exactly the account numbers shown in the Accounts Overview
