# Source: DQ-1 — Book Store accounts - create a user, get a token, sign in and sign out
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Creating a user with POST /Account/v1/User and a JSON body { "userName", "password" } whose password satisfies the policy returns 201 Created. The body contains the new user's id (userID, a UUID), username equal to the requested user name, and an empty books list.
# AC-2: A password that does not satisfy the policy (too short, or missing an uppercase letter, a lowercase letter, a digit or a special character) is rejected with 400, error code "1300" and the message "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer." No account is created (a token cannot be obtained for it).
# AC-3: Creating a user whose user name already exists is rejected with 406, error code "1204" and the message "User exists!".
# AC-4: Creating a user without a user name or without a password is rejected with 400, error code "1200" and the message "UserName and Password required."
# AC-5: POST /Account/v1/GenerateToken with the correct user name and password returns 200 with a non-empty token, status "Success", result "User authorized successfully." and an expires timestamp 7 days after the moment the token was issued.
# AC-6: POST /Account/v1/GenerateToken with a wrong password issues no token: token and expires are null, status is "Failed" and result is "User authorization failed."
# AC-7: The token must not disclose the user's password: decoding the token (a JWT) must not reveal the password in any part of it.
# AC-8: POST /Account/v1/Authorized with { "userName", "password" } returns false for a newly created user who has not been issued a token yet, and true once a token has been generated for that user. With a wrong password it never returns true; it answers with the message "User not found!".
# AC-9: On the login page (/login), signing in with an account created through the API opens the profile page (/profile), which shows "User Name :" followed by that user's name. After this sign-in, POST /Account/v1/Authorized returns true for the account.
# AC-10: Signing in with a wrong password keeps the user on the login page and shows the message "Invalid username or password!" in red below the form.
# AC-11: Clicking "Login" with an empty user name and an empty password does not sign in; both fields are highlighted as invalid.
# AC-12: Clicking "Logout" on the profile page signs the user out and returns to the login page. Opening /profile afterwards no longer shows the user name and shows "Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself."
# AC-13: DELETE /Account/v1/User/{UUID}, authorized with the user's token, deletes the account and returns 204 No Content. Afterwards POST /Account/v1/GenerateToken for that user name returns status "Failed".
#
# ENDPOINT: POST /Account/v1/User — 201 Created
# ENDPOINT: POST /Account/v1/GenerateToken — 200
# ENDPOINT: POST /Account/v1/Authorized
# ENDPOINT: DELETE /Account/v1/User/{UUID} — 204 No Content
#
# ASSUMPTION: G3 — how "7 days after the moment the token was issued" is compared: the issue moment is not observable from the client, and the timestamp format/time zone and an acceptable tolerance are not stated: the issue moment is taken as the time the GenerateToken request was sent/answered; `expires` (parsed as an ISO-8601 timestamp, UTC if no offset is given) must be 7 days after that moment, allowing only for clock difference between test client and server (a tolerance of a few minutes, not hours)
# ASSUMPTION: G4 — HTTP status (and body shape) of POST /Account/v1/Authorized with a wrong password; AC-8 states only the message "User not found!": no specific status is asserted; the check is that the response is not `true` and carries the message "User not found!"
# ASSUMPTION: G7 — what "without a user name / without a password" means on the wire: field omitted, null, or empty string: "without" covers both the field being absent and the field being an empty string; each must give 400 / code "1200" / "UserName and Password required."
# ASSUMPTION: G8 — what counts as "in red" (AC-10) and "highlighted as invalid" (AC-11): the observable indicator is not specified: "in red": the message text's rendered colour is a red hue (red channel clearly dominant); "highlighted as invalid": each empty field is visibly marked invalid by the page (e.g. an invalid-state style or indicator on that field) after clicking "Login"

# ASSUMPTION: OQ-2 — negative-test passwords are literal invalid strings (they cannot create an account); the 8-character valid boundary password is derived at runtime from DQ_USER_PASSWORD, so no valid password is hard-coded
# ASSUMPTION: one root cause, one failure — the full success body of a create is asserted only in SCN-001; the accepted boundary row (SCN-014.2) asserts only the 201 that AC-1 defines as "accepted"
# OPEN-QUESTION: OQ-1 — what DELETE /Account/v1/User/{UUID} answers without a token or with another user's token is not stated; not tested
#
# SEED-ENDPOINT: POST /Account/v1/User — create the account a scenario needs (R2: accounts are always created through the API)
# SEED-ENDPOINT: POST /Account/v1/GenerateToken — token for cleanup / preconditions
# SEED-ENDPOINT: DELETE /Account/v1/User/{UUID} — remove every created account (R2)

@story:DQ-1
Feature: Book Store accounts - create a user, get a token, sign in and sign out
  As a reader of the Book Store
  I want an account I can create through the Book Store API and use to sign in on the web site
  So that I can keep a personal book collection

  # from story.md#L45 (AC-1), story.md#L32-L33 (accounts and data)
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: A client creates a user with a policy-compliant password and gets 201 with the new user
    Given a unique user name and the password from DQ_USER_PASSWORD
    When I POST /Account/v1/User with that user name and password
    Then the response status is 201
    And the body contains a userID that is a UUID
    And the body username equals the requested user name
    And the body books is an empty list

  # from story.md#L47 (AC-2), story.md#L34 (password policy)
  @SCN-002 @AC-2 @priority:P1 @type:negative @layer:api
  Scenario Outline: A password that breaks the policy is rejected and no account is created
    Given a unique user name
    When I POST /Account/v1/User with the password "<password>" that is <violation>
    Then the response status is 400
    And the error code is "1300"
    And the error message is the password-policy message
    And a token cannot be obtained for that user name and password
    Examples:
      | violation              | password  |
      | too short              | Qa1!xyz   |
      | missing an uppercase   | qa1!xyzw9 |
      | missing a lowercase    | QA1!XYZW9 |
      | missing a digit        | Qa!xyzwv# |
      | missing a special char | Qa1xyzw9k |

  # from story.md#L34 (R1 "at least 8 characters"), story.md#L47 (AC-2), story.md#L45 (AC-1)
  @SCN-014 @AC-2 @AC-1 @priority:P2 @type:boundary @layer:api
  Scenario Outline: The 8-character minimum length is enforced exactly at the boundary
    Given a unique user name
    When I POST /Account/v1/User with a password of <length> characters containing every required character class
    Then the account is <outcome>
    Examples:
      | length | outcome                         |
      | 7      | rejected with 400 and code 1300 |
      | 8      | accepted with 201               |

  # from story.md#L49 (AC-3)
  @SCN-003 @AC-3 @priority:P1 @type:negative @layer:api
  Scenario: Creating a user whose user name already exists is rejected with 406
    Given a user was created through the API
    When I POST /Account/v1/User again with the same user name
    Then the response status is 406
    And the error code is "1204"
    And the error message is "User exists!"

  # from story.md#L51 (AC-4)
  @SCN-004 @AC-4 @priority:P1 @type:negative @layer:api
  Scenario Outline: Creating a user without a user name or without a password is rejected with 400
    Given a unique user name and the password from DQ_USER_PASSWORD
    When I POST /Account/v1/User without the <field> field
    Then the response status is 400
    And the error code is "1200"
    And the error message is "UserName and Password required."
    Examples:
      | field    |
      | userName |
      | password |

  # from story.md#L51 (AC-4), contract G7 (assumed: an empty string also counts as "without")
  @SCN-015 @AC-4 @priority:P2 @type:negative @layer:api @assumes:G7
  Scenario Outline: An empty user name or empty password counts as missing and is rejected with 400
    Given a unique user name and the password from DQ_USER_PASSWORD
    When I POST /Account/v1/User with an empty <field>
    Then the response status is 400
    And the error code is "1200"
    And the error message is "UserName and Password required."
    Examples:
      | field    |
      | userName |
      | password |

  # from story.md#L53 (AC-5)
  @SCN-005 @AC-5 @priority:P1 @type:functional @layer:api
  Scenario: GenerateToken with the correct credentials returns a token
    Given a user was created through the API
    When I POST /Account/v1/GenerateToken with the correct user name and password
    Then the response status is 200
    And the token is non-empty
    And the status is "Success"
    And the result is "User authorized successfully."

  # from story.md#L53 (AC-5), contract G3 (assumed tolerance and time format)
  @SCN-016 @AC-5 @priority:P2 @type:contract @layer:api @assumes:G3
  Scenario: The token expires 7 days after it was issued
    Given a user was created through the API
    When I POST /Account/v1/GenerateToken with the correct user name and password
    Then expires is a timestamp 7 days after the moment the token was issued

  # from story.md#L55 (AC-6), story.md#L75 (PO clarification: 401 for a wrong password or an unknown user name)
  @SCN-006 @AC-6 @priority:P1 @type:negative @layer:api
  Scenario Outline: GenerateToken with wrong credentials issues no token and answers 401
    Given a user was created through the API
    When I POST /Account/v1/GenerateToken with <credentials>
    Then the response status is 401
    And token is null
    And expires is null
    And the status is "Failed"
    And the result is "User authorization failed."
    Examples:
      | credentials                                   |
      | the correct user name and a wrong password    |
      | an unknown user name and the account password |

  # from story.md#L57 (AC-7)
  @SCN-007 @AC-7 @priority:P1 @type:security @layer:api
  Scenario: The issued token does not disclose the user's password
    Given a user was created through the API
    When I POST /Account/v1/GenerateToken with the correct user name and password
    Then the token decodes as a JWT
    And no part of the token or of its decoded header, payload and signature contains the password

  # from story.md#L59 (AC-8)
  @SCN-008 @AC-8 @priority:P1 @type:functional @layer:api
  Scenario: Authorized is false before a token is issued and true afterwards
    Given a user was created through the API and no token has been issued for it
    When I POST /Account/v1/Authorized with the user name and password
    Then the answer is false
    When I generate a token for that user
    And I POST /Account/v1/Authorized with the user name and password again
    Then the answer is true

  # from story.md#L59 (AC-8), contract G4 (no status asserted)
  @SCN-017 @AC-8 @priority:P1 @type:negative @layer:api
  Scenario: Authorized with a wrong password never answers true
    Given a user was created through the API and a token was generated for it
    When I POST /Account/v1/Authorized with the user name and a wrong password
    Then the answer is not true
    And the message is "User not found!"

  # from story.md#L61 (AC-9)
  @SCN-009 @AC-9 @priority:P1 @type:integration @layer:e2e
  Scenario: Signing in on the web site with an API-created account opens the profile
    Given a user was created through the API
    And I am on the login page /login
    When I sign in with that user name and password
    Then the profile page /profile is open
    And the profile shows "User Name :" followed by the user name
    And POST /Account/v1/Authorized returns true for the account

  # from story.md#L63 (AC-10)
  @SCN-010 @AC-10 @priority:P1 @type:negative @layer:ui
  Scenario: Signing in with a wrong password keeps the user on the login page with an error
    Given a user was created through the API
    And I am on the login page /login
    When I sign in with that user name and a wrong password
    Then I am still on the login page /login
    And the message "Invalid username or password!" is shown below the form

  # from story.md#L63 (AC-10), contract G8 (assumed meaning of "in red")
  @SCN-018 @AC-10 @priority:P3 @type:usability @layer:ui @assumes:G8
  Scenario: The wrong-credentials message is shown in red
    Given a user was created through the API
    And I am on the login page /login
    When I sign in with that user name and a wrong password
    Then the message "Invalid username or password!" is rendered in red

  # from story.md#L65 (AC-11)
  @SCN-011 @AC-11 @priority:P2 @type:negative @layer:ui
  Scenario: Clicking Login with both fields empty does not sign in
    Given I am not signed in
    And I am on the login page /login
    When I click "Login" with an empty user name and an empty password
    Then I am still on the login page /login

  # from story.md#L65 (AC-11), contract G8 (assumed meaning of "highlighted as invalid")
  @SCN-019 @AC-11 @priority:P3 @type:usability @layer:ui @assumes:G8
  Scenario: Both empty fields are highlighted as invalid after clicking Login
    Given I am not signed in
    And I am on the login page /login
    When I click "Login" with an empty user name and an empty password
    Then the user name field is highlighted as invalid
    And the password field is highlighted as invalid

  # from story.md#L67 (AC-12)
  @SCN-012 @AC-12 @priority:P1 @type:functional @layer:ui
  Scenario: Logging out returns to the login page and the profile no longer shows the user
    Given a user was created through the API
    And I am signed in on the web site and on the profile page /profile
    When I click "Logout"
    Then I am on the login page /login
    When I open /profile
    Then the user name is not shown
    And the text "Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself." is shown

  # from story.md#L69 (AC-13)
  @SCN-013 @AC-13 @priority:P1 @type:functional @layer:api
  Scenario: Deleting the account with the user's token returns 204 and the account can no longer get a token
    Given a user was created through the API and a token was generated for it
    When I DELETE /Account/v1/User/{UUID} with the user's token
    Then the response status is 204
    And POST /Account/v1/GenerateToken for that user name returns status "Failed"
