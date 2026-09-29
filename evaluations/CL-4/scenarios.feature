# Source: CL-4 — Account security for contacts
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Scenario Outline: Contacts endpoints require a session token. When a client calls <method> <path> without an Authorization header, then the response status is 401, the response body is {"error": "Please authenticate."} and no contact is created, changed or deleted. Examples: GET /contacts, POST /contacts, GET, PUT, PATCH and DELETE /contacts/{id of Secret Sam}.
# AC-2: Scenario: A token that was not issued by the application is refused. When a client calls GET /contacts with "Authorization: Bearer" followed by a made-up or altered token, then the response status is 401 and the response body is {"error": "Please authenticate."}
# AC-3: Scenario: Signing out ends the session. Given user "A" holds a token that returns A's contacts on GET /contacts, when user "A" calls POST /users/logout with that token, then the response status is 200, GET /contacts with the same token answers 401 and GET /users/me with the same token answers 401.
# AC-4: Scenario: A user cannot read another user's contact. When user "B" calls GET /contacts/{id of Secret Sam}, then the response status is 404 and GET /contacts for user "B" does not contain "Secret Sam".
# AC-5: Scenario Outline: A user cannot change or delete another user's contact. When user "B" calls <method> /contacts/{id of Secret Sam} with a valid body, then the response status is 404 and GET /contacts/{id of Secret Sam} for user "A" still returns "Secret Sam" unchanged. Examples: PUT, PATCH, DELETE.
# AC-6: Scenario: A new contact always belongs to its creator. When user "A" calls POST /contacts with a valid body that also contains "owner" set to the _id of user "B", then the response status is 201, the new contact's "owner" is the _id of user "A", and the new contact is listed for user "A" and not for user "B".
# AC-7: Scenario Outline: The owner of an existing contact cannot be changed. When user "A" calls <method> /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B", then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A", GET /contacts/{id of Secret Sam} for user "A" still answers 200, and GET /contacts for user "B" does not contain "Secret Sam". Examples: PUT with first name, last name and owner; PATCH with owner only.
# AC-8: Scenario: The contact list page only shows the signed-in user's contacts. Given user "B" has a contact "Bella Bee", when user "B" signs in on the login page, then the Contact List page shows "Bella Bee" and does not show "Secret Sam".
#
# ENDPOINT: GET /users/me
# ENDPOINT: POST /users/logout — 200
# ENDPOINT: GET /contacts
# ENDPOINT: POST /contacts — 201
# ENDPOINT: GET /contacts/{id} — 200
# ENDPOINT: PUT /contacts/{id}
# ENDPOINT: PATCH /contacts/{id}
# ENDPOINT: DELETE /contacts/{id}
#

# ASSUMPTION: users "A" and "B" are made per test by seed.account() (POST /users, deleted afterwards with DELETE /users/me); contacts a test makes go with their user
# ASSUMPTION: "Secret Sam" and "Bella Bee" are a contact's first and last name, made unique per test with the data prefix in another field only where the list must tell them apart

@story:CL-4
Feature: Account security for contacts

  # from story.md AC-1
  @SCN-001 @AC-1 @priority:P1 @type:security @layer:api
  Scenario Outline: Contacts endpoints require a session token (<method> <path>)
    Given user "A" has a contact "Secret Sam"
    When a client calls <method> <path> without an Authorization header
    Then the response status is 401
    And the response body is {"error": "Please authenticate."}
    And no contact is created, changed or deleted

    Examples:
      | method | path                         |
      | GET    | /contacts                    |
      | POST   | /contacts                    |
      | GET    | /contacts/{id of Secret Sam} |
      | PUT    | /contacts/{id of Secret Sam} |
      | PATCH  | /contacts/{id of Secret Sam} |
      | DELETE | /contacts/{id of Secret Sam} |

  # from story.md AC-2
  @SCN-002 @AC-2 @priority:P1 @type:security @layer:api
  Scenario Outline: A token that was not issued by the application is refused (<token>)
    Given user "A" has signed up
    When a client calls GET /contacts with "Authorization: Bearer" followed by <token>
    Then the response status is 401
    And the response body is {"error": "Please authenticate."}

    Examples:
      | token                                   |
      | a made-up token                         |
      | user A's token with its signature altered |

  # from story.md AC-3
  @SCN-003 @AC-3 @priority:P1 @type:security @layer:api
  Scenario: Signing out ends the session
    Given user "A" holds a token that returns A's contacts on GET /contacts
    When user "A" calls POST /users/logout with that token
    Then the response status is 200
    And GET /contacts with the same token answers 401
    And GET /users/me with the same token answers 401

  # from story.md AC-4
  @SCN-004 @AC-4 @priority:P1 @type:security @layer:api
  Scenario: A user cannot read another user's contact
    Given user "A" has a contact "Secret Sam" and user "B" has signed up
    When user "B" calls GET /contacts/{id of Secret Sam}
    Then the response status is 404
    And GET /contacts for user "B" does not contain "Secret Sam"

  # from story.md AC-5
  @SCN-005 @AC-5 @priority:P1 @type:security @layer:api
  Scenario Outline: A user cannot change or delete another user's contact (<method>)
    Given user "A" has a contact "Secret Sam" and user "B" has signed up
    When user "B" calls <method> /contacts/{id of Secret Sam} with a valid body
    Then the response status is 404
    And GET /contacts/{id of Secret Sam} for user "A" still returns "Secret Sam" unchanged

    Examples:
      | method |
      | PUT    |
      | PATCH  |
      | DELETE |

  # from story.md AC-6
  @SCN-006 @AC-6 @priority:P1 @type:security @layer:api
  Scenario: A new contact always belongs to its creator
    Given users "A" and "B" have signed up
    When user "A" calls POST /contacts with a valid body that also contains "owner" set to the _id of user "B"
    Then the response status is 201
    And the new contact's "owner" is the _id of user "A"
    And the new contact is listed for user "A" and not for user "B"

  # from story.md AC-7
  @SCN-007 @AC-7 @priority:P1 @type:security @layer:api
  Scenario Outline: The owner of an existing contact cannot be changed (<method>)
    Given user "A" has a contact "Secret Sam" and user "B" has signed up
    When user "A" calls <method> /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B" (<body>)
    Then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A"
    And GET /contacts/{id of Secret Sam} for user "A" still answers 200
    And GET /contacts for user "B" does not contain "Secret Sam"

    Examples:
      | method | body                            |
      | PUT    | first name, last name and owner |
      | PATCH  | owner only                      |

  # from story.md AC-8
  @SCN-008 @AC-8 @priority:P1 @type:security @layer:ui
  Scenario: The contact list page only shows the signed-in user's contacts
    Given user "A" has a contact "Secret Sam" and user "B" has a contact "Bella Bee"
    When user "B" signs in on the login page
    Then the Contact List page shows "Bella Bee"
    And it does not show "Secret Sam"
