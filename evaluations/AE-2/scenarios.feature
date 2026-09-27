# Source: AE-2 — Customer account lifecycle through the partner Account API, with shop sign-in
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: The system shall create a customer account when the partner calls createAccount with all required fields and an e-mail address not yet registered, answering responseCode 201 with the message "User created!".
# AC-2: The system shall refuse to create a second account for an e-mail address that is already registered, answering responseCode 400 with the message "Email already exists!".
# AC-3: The system shall treat e-mail addresses case-insensitively for uniqueness: registering an address that differs from an existing account's address only in letter case shall be refused exactly as in AC-2.
# AC-4: The system shall refuse createAccount when any required field of the contract is missing, answering responseCode 400 with the message naming the missing parameter, and shall not create the account.
# AC-5: The system shall refuse createAccount when the e-mail address is not a valid e-mail address (for example it has no "@"), answering responseCode 400, and shall not create the account.
# AC-6: The system shall answer verifyLogin as the contract states: valid e-mail and password give responseCode 200 "User exists!"; a wrong password or an unknown e-mail give responseCode 404 "User not found!"; a missing e-mail or password gives responseCode 400 "Bad request, email or password parameter is missing in POST request."; the DELETE method gives responseCode 405 "This request method is not supported.".
# AC-7: The system shall return the customer's profile from getUserDetailByEmail with every field listed in the contract, holding the values given at registration, and shall never return the password; an unknown e-mail gives responseCode 404 "Account not found with this email, try another email!".
# AC-8: The system shall apply updateAccount as a partial update: with the correct e-mail and password, only the fields sent change (responseCode 200 "User updated!") and the change is visible through getUserDetailByEmail; with a wrong password the answer is responseCode 404 "Account not found!" and nothing changes.
# AC-9: The system shall close the account on deleteAccount with the correct e-mail and password (responseCode 200 "Account deleted!"), after which verifyLogin and getUserDetailByEmail answer 404 for that e-mail; with a wrong password the answer is responseCode 404 "Account not found!" and the account remains usable.
# AC-10: The system shall let a customer created through the API sign in on the shop's login page with the same e-mail and password; after sign-in the header shows "Logged in as <name>", where <name> is the account's current name (including a name changed through updateAccount).
# AC-11: The system shall refuse shop sign-in with a wrong password, staying on the login page and showing "Your email or password is incorrect!".
# AC-12: The system shall refuse shop sign-in for an account closed through deleteAccount, showing the same message as AC-11.
#
# ENDPOINT: POST /api/createAccount — HTTP 200, body {"responseCode": 201, "message": "User created!"}
# ENDPOINT: POST /api/verifyLogin — HTTP 200, body responseCode 200 "User exists!"
# ENDPOINT: DELETE /api/verifyLogin — not supported: responseCode 405 "This request method is not supported."
# ENDPOINT: GET /api/getUserDetailByEmail — HTTP 200, body responseCode 200 and a user object
# ENDPOINT: PUT /api/updateAccount — HTTP 200, body responseCode 200 "User updated!"
# ENDPOINT: DELETE /api/deleteAccount — HTTP 200, body responseCode 200 "Account deleted!"
#
# ASSUMPTION: G3 — which registration request field each getUserDetailByEmail response field must hold: the contract says "some response names differ from the request names" but gives no mapping (request birth_date/firstname/lastname vs response birth_day/first_name/last_name); id has no registration value: response fields correspond to the same-named request fields, and birth_day = birth_date, first_name = firstname, last_name = lastname; id is checked for presence only; optional fields not sent are checked for presence only
# ASSUMPTION: G4 — what "the account remains usable" means after a deleteAccount with a wrong password: the account still exists and still accepts its credentials: verifyLogin with the correct e-mail and password gives responseCode 200 "User exists!" and getUserDetailByEmail gives responseCode 200
# OPEN-QUESTION: G5 — the contract states error answers that no acceptance criterion covers: getUserDetailByEmail without email (400 "Bad request, email parameter is missing in GET request."), updateAccount without password (400 "Bad request, password parameter is missing in PUT request."), deleteAccount without email or password (400 "Bad request, <field> parameter is missing in DELETE request."). Are they in scope for this story?
#
# ASSUMPTION: Every API outcome is asserted on the body's responseCode and message (R1). The HTTP-200 envelope itself is asserted once (SCN-002), so an envelope deviation is one finding, not one per scenario.
# ASSUMPTION: Test customers are created through POST /api/createAccount (the story's only data source) with a unique lower-case e-mail and the AE_USER_PASSWORD password, and closed through DELETE /api/deleteAccount in cleanup. Scenarios that seed that way depend on SCN-001.
# ASSUMPTION: "The account is not created" (AC-4, AC-5) is observed as getUserDetailByEmail answering 404 for the address; for the AC-4 row without an e-mail there is no address to look up, so only the refusal is asserted.
# ASSUMPTION: A "wrong password" is the customer's password with extra characters appended; an "unknown e-mail" is a unique address that was never registered.

@story:AE-2
Feature: Customer account lifecycle through the partner Account API, with shop sign-in
  As the loyalty/CRM partner
  I want to create, check, read, update and close Automation Exercise customer accounts through the Account API
  So that the customers I manage can sign in to the shop with the same credentials, until their account is closed

  # from story.md#L30 (AC-1), account-api-contract.md §2.1
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: The partner creates a customer with all required fields and a new e-mail
    Given a unique e-mail address that is not registered
    When the partner calls createAccount with every required and optional field and that e-mail
    Then the responseCode is 201
    And the message is "User created!"

  # from account-api-contract.md §1.1 (R1), example §3
  @SCN-002 @AC-1 @priority:P2 @type:contract @layer:api @depends:SCN-001
  Scenario: createAccount answers with the documented response envelope
    Given a unique e-mail address that is not registered
    When the partner calls createAccount with all required fields and that e-mail
    Then the HTTP status is 200
    And the body is a JSON object with an integer responseCode and a string message

  # from story.md#L31 (AC-2), account-api-contract.md §2.1
  @SCN-003 @AC-2 @priority:P1 @type:negative @layer:api @depends:SCN-001
  Scenario: A second account for an already registered e-mail is refused
    Given a customer exists with a unique e-mail address
    When the partner calls createAccount again with the same e-mail address
    Then the responseCode is 400
    And the message is "Email already exists!"

  # from story.md#L32 (AC-3), account-api-contract.md §2.1 (email: compared case-insensitively)
  @SCN-004 @AC-3 @priority:P1 @type:negative @layer:api @depends:SCN-001
  Scenario: An e-mail that differs from a registered one only in letter case is refused
    Given a customer exists with a unique lower-case e-mail address
    When the partner calls createAccount with the same e-mail address in upper case
    Then the responseCode is 400
    And the message is "Email already exists!"

  # from story.md#L33 (AC-4), account-api-contract.md §2.1 (required fields, missing-field message)
  @SCN-005 @AC-4 @priority:P1 @type:negative @layer:api
  Scenario Outline: createAccount without a required field is refused and creates nothing
    Given a unique e-mail address that is not registered
    When the partner calls createAccount with all required fields except <field>
    Then the responseCode is 400
    And the message is "<message>"
    And getUserDetailByEmail for that e-mail answers responseCode 404 "Account not found with this email, try another email!"
    Examples:
      | field         | message                                                        |
      | name          | Bad request, name parameter is missing in POST request.          |
      | email         | Bad request, email parameter is missing in POST request.         |
      | password      | Bad request, password parameter is missing in POST request.      |
      | firstname     | Bad request, firstname parameter is missing in POST request.     |
      | lastname      | Bad request, lastname parameter is missing in POST request.      |
      | address1      | Bad request, address1 parameter is missing in POST request.      |
      | country       | Bad request, country parameter is missing in POST request.       |
      | zipcode       | Bad request, zipcode parameter is missing in POST request.       |
      | state         | Bad request, state parameter is missing in POST request.         |
      | city          | Bad request, city parameter is missing in POST request.          |
      | mobile_number | Bad request, mobile_number parameter is missing in POST request. |

  # from story.md#L34 (AC-5: "for example it has no @"), account-api-contract.md §2.1
  @SCN-006 @AC-5 @priority:P1 @type:negative @layer:api
  Scenario: createAccount with an e-mail that has no "@" is refused and creates nothing
    Given a unique address without "@"
    When the partner calls createAccount with all required fields and that address
    Then the responseCode is 400
    And getUserDetailByEmail for that address answers responseCode 404

  # from story.md#L34 (AC-5: "not a valid e-mail address"), account-api-contract.md §2.1 (email: must be a valid e-mail address)
  @SCN-007 @AC-5 @priority:P2 @type:boundary @layer:api @needs-clarification
  Scenario Outline: createAccount with an e-mail that has an "@" but is still invalid is refused and creates nothing
    Given a unique address with <shape>
    When the partner calls createAccount with all required fields and that address
    Then the responseCode is 400
    And getUserDetailByEmail for that address answers responseCode 404
    Examples:
      | shape                          |
      | no domain after the "@"        |
      | no local part before the "@"   |

  # from story.md#L35 (AC-6), account-api-contract.md §2.2
  @SCN-008 @AC-6 @priority:P1 @type:functional @layer:api @depends:SCN-001
  Scenario: verifyLogin with a valid e-mail and password confirms the customer
    Given a customer exists with a unique e-mail address
    When the partner calls verifyLogin with that e-mail and the correct password
    Then the responseCode is 200
    And the message is "User exists!"

  # from story.md#L35 (AC-6), account-api-contract.md §2.2
  @SCN-009 @AC-6 @priority:P1 @type:negative @layer:api @depends:SCN-001
  Scenario: verifyLogin with a wrong password is refused
    Given a customer exists with a unique e-mail address
    When the partner calls verifyLogin with that e-mail and a wrong password
    Then the responseCode is 404
    And the message is "User not found!"

  # from story.md#L35 (AC-6), account-api-contract.md §2.2
  @SCN-010 @AC-6 @priority:P1 @type:negative @layer:api
  Scenario: verifyLogin with an unknown e-mail is refused
    Given a unique e-mail address that is not registered
    When the partner calls verifyLogin with that e-mail and a password
    Then the responseCode is 404
    And the message is "User not found!"

  # from story.md#L35 (AC-6), account-api-contract.md §2.2
  @SCN-011 @AC-6 @priority:P2 @type:negative @layer:api
  Scenario Outline: verifyLogin without the <missing> parameter is refused
    Given a unique e-mail address that is not registered
    When the partner calls verifyLogin without the <missing> parameter
    Then the responseCode is 400
    And the message is "Bad request, email or password parameter is missing in POST request."
    Examples:
      | missing  |
      | email    |
      | password |

  # from story.md#L35 (AC-6), account-api-contract.md §2.2 (Method DELETE used on /verifyLogin)
  @SCN-012 @AC-6 @priority:P2 @type:contract @layer:api
  Scenario: verifyLogin called with the DELETE method is not supported
    Given a unique e-mail address that is not registered
    When the partner calls verifyLogin with the DELETE method
    Then the responseCode is 405
    And the message is "This request method is not supported."

  # from story.md#L36 (AC-7), account-api-contract.md §2.3 (field list)
  @SCN-013 @AC-7 @priority:P1 @type:contract @layer:api @depends:SCN-001
  Scenario: getUserDetailByEmail returns a user object with every field of the contract
    Given a customer exists with every registration field filled
    When the partner calls getUserDetailByEmail with that e-mail
    Then the responseCode is 200
    And the user object has the fields id, name, email, title, birth_day, birth_month, birth_year, first_name, last_name, company, address1, address2, country, state, city, zipcode, mobile_number

  # from story.md#L36 (AC-7: "holding the values given at registration"), account-api-contract.md §2.1, §2.3
  @SCN-014 @AC-7 @priority:P1 @type:functional @layer:api @depends:SCN-001
  Scenario: getUserDetailByEmail returns the registration values of the same-named fields
    Given a customer exists with every registration field filled
    When the partner calls getUserDetailByEmail with that e-mail
    Then the responseCode is 200
    And name, email, title, birth_month, birth_year, company, address1, address2, country, state, city, zipcode and mobile_number hold the registration values

  # from story.md#L36 (AC-7), account-api-contract.md §2.3 ("some response names differ from the request names"); mapping per G3
  @SCN-015 @AC-7 @priority:P2 @type:functional @layer:api @assumes:G3 @depends:SCN-001
  Scenario: getUserDetailByEmail returns the registration values of the renamed fields
    Given a customer exists with every registration field filled
    When the partner calls getUserDetailByEmail with that e-mail
    Then the responseCode is 200
    And birth_day holds the registered birth_date, first_name the registered firstname and last_name the registered lastname

  # from story.md#L36 (AC-7: "shall never return the password"), account-api-contract.md §2.3
  @SCN-016 @AC-7 @priority:P1 @type:security @layer:api @depends:SCN-001
  Scenario: getUserDetailByEmail never returns the password
    Given a customer exists with every registration field filled
    When the partner calls getUserDetailByEmail with that e-mail
    Then the responseCode is 200
    And the user object has no password field
    And the response does not contain the customer's password

  # from story.md#L36 (AC-7), account-api-contract.md §2.3
  @SCN-017 @AC-7 @priority:P2 @type:negative @layer:api
  Scenario: getUserDetailByEmail for an unknown e-mail is refused
    Given a unique e-mail address that is not registered
    When the partner calls getUserDetailByEmail with that e-mail
    Then the responseCode is 404
    And the message is "Account not found with this email, try another email!"

  # from story.md#L37 (AC-8), account-api-contract.md §2.4 (partial update)
  @SCN-018 @AC-8 @priority:P1 @type:functional @layer:api @depends:SCN-001
  Scenario: updateAccount changes only the fields sent
    Given a customer exists with every registration field filled
    And I read the customer's profile through getUserDetailByEmail
    When the partner calls updateAccount with the correct e-mail and password and a new name and city only
    Then the responseCode is 200
    And the message is "User updated!"
    And getUserDetailByEmail shows the new name and city
    And getUserDetailByEmail shows every other field unchanged

  # from story.md#L37 (AC-8), account-api-contract.md §2.4
  @SCN-019 @AC-8 @priority:P1 @type:negative @layer:api @depends:SCN-001
  Scenario: updateAccount with a wrong password is refused and changes nothing
    Given a customer exists with every registration field filled
    And I read the customer's profile through getUserDetailByEmail
    When the partner calls updateAccount with the e-mail, a wrong password and a new name and city
    Then the responseCode is 404
    And the message is "Account not found!"
    And getUserDetailByEmail shows the profile unchanged

  # from story.md#L38 (AC-9), account-api-contract.md §2.5, §2.2, §2.3
  @SCN-020 @AC-9 @priority:P1 @type:functional @layer:api @depends:SCN-001
  Scenario: deleteAccount with the correct credentials closes the account
    Given a customer exists with a unique e-mail address
    When the partner calls deleteAccount with the correct e-mail and password
    Then the responseCode is 200
    And the message is "Account deleted!"
    And verifyLogin for that e-mail and password answers responseCode 404 "User not found!"
    And getUserDetailByEmail for that e-mail answers responseCode 404 "Account not found with this email, try another email!"

  # from story.md#L38 (AC-9), account-api-contract.md §2.5
  @SCN-021 @AC-9 @priority:P1 @type:negative @layer:api @depends:SCN-001
  Scenario: deleteAccount with a wrong password is refused
    Given a customer exists with a unique e-mail address
    When the partner calls deleteAccount with the e-mail and a wrong password
    Then the responseCode is 404
    And the message is "Account not found!"

  # from story.md#L38 (AC-9: "the account remains usable"); reading per G4
  @SCN-022 @AC-9 @priority:P2 @type:negative @layer:api @assumes:G4 @depends:SCN-001
  Scenario: After a refused deleteAccount the account remains usable
    Given a customer exists with a unique e-mail address
    When the partner calls deleteAccount with the e-mail and a wrong password
    Then verifyLogin with the correct e-mail and password answers responseCode 200 "User exists!"
    And getUserDetailByEmail for that e-mail answers responseCode 200

  # from story.md#L17, #L25, #L39 (AC-10), account-api-contract.md §2.1 (name shown in the shop header)
  @SCN-023 @AC-10 @priority:P1 @type:integration @layer:e2e @depends:SCN-001
  Scenario: A customer created through the API signs in on the shop and sees their name
    Given a customer exists with a unique e-mail address and a unique name
    And I am on the Signup / Login page
    When I sign in in the "Login to your account" form with that e-mail and password
    Then the header shows "Logged in as <name>" with the registered name

  # from story.md#L39 (AC-10: "including a name changed through updateAccount")
  @SCN-024 @AC-10 @priority:P1 @type:integration @layer:e2e @depends:SCN-001 @depends:SCN-018
  Scenario: After a name change through updateAccount the shop header shows the new name
    Given a customer exists with a unique e-mail address and a unique name
    And the customer's name was changed through updateAccount to a new unique name
    And I am on the Signup / Login page
    When I sign in in the "Login to your account" form with that e-mail and password
    Then the header shows "Logged in as <name>" with the new name

  # from story.md#L25, #L40 (AC-11)
  @SCN-025 @AC-11 @priority:P1 @type:negative @layer:e2e @depends:SCN-001
  Scenario: Shop sign-in with a wrong password is refused on the login page
    Given a customer exists with a unique e-mail address
    And I am on the Signup / Login page
    When I sign in in the "Login to your account" form with that e-mail and a wrong password
    Then I am still on the login page
    And the message "Your email or password is incorrect!" is shown

  # from story.md#L17, #L41 (AC-12)
  @SCN-026 @AC-12 @priority:P1 @type:negative @layer:e2e @depends:SCN-001 @depends:SCN-020
  Scenario: Shop sign-in for an account closed through deleteAccount is refused
    Given a customer existed with a unique e-mail address and was closed through deleteAccount
    And I am on the Signup / Login page
    When I sign in in the "Login to your account" form with that e-mail and password
    Then the message "Your email or password is incorrect!" is shown
