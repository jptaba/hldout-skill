# Source: DEMO-303 — Partner booking API — authenticate, create, amend and cancel bookings
# Attachments used: booking-rules.csv (R1–R6 validation + boundaries), partner-accounts.csv (credentials)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim):
# AC-1: POST /auth with valid partner credentials responds 200 with {"token": "<non-empty string>"}.
# AC-2: POST /auth with invalid credentials responds 401 Unauthorized with {"reason": "Bad credentials"}.
# AC-3: POST /booking with a valid booking responds 200 with {"bookingid": <integer>, "booking": <the booking exactly as sent>}.
# AC-4: GET /booking/{id} responds 200 with the stored booking, identical to what was created. An id that does not exist responds 404.
# AC-5: GET /booking?firstname=<f>&lastname=<l> responds 200 with a JSON array of {"bookingid"} objects that includes every booking with that name.
# AC-6: A booking that breaks any rule in booking-rules.csv is rejected with 400 Bad Request (never 5xx) and is not stored. A value exactly on a boundary is valid.
# AC-7: PUT, PATCH and DELETE require authentication, either the cookie token=<token from /auth> or Authorization: Basic <base64 of partner credentials>. Without it they respond 403 Forbidden and change nothing.
# AC-8: PUT /booking/{id} replaces the whole booking and responds 200 with the updated booking. Repeating the same PUT is idempotent: same response, same stored state.
# AC-9: PATCH /booking/{id} changes only the fields supplied. All other fields keep their values.
# AC-10: DELETE /booking/{id} with authentication responds 204 No Content. Afterwards GET /booking/{id} responds 404.
# AC-11: PUT, PATCH or DELETE of a booking id that does not exist responds 404 Not Found.
# AC-12: GET /booking/{id} responds in under 3000 ms for each of 5 consecutive requests.
#
# ENDPOINT: POST /auth — obtain a token
# ENDPOINT: POST /booking — create a booking
# ENDPOINT: GET /booking — search by name
# ENDPOINT: GET /booking/{id} — read a booking
# ENDPOINT: PUT /booking/{id} — replace (auth)
# ENDPOINT: PATCH /booking/{id} — partial update (auth)
# ENDPOINT: DELETE /booking/{id} — cancel (auth)
#
# ASSUMPTION: "does not exist" ids are obtained by creating then deleting a booking (no guessing on a shared sandbox).
# ASSUMPTION: Scenarios that need an existing booking create it through POST /booking (SCN-003's endpoint) as an API pre-step — tagged @depends:SCN-003 so a broken create is reported as blocking them.
# ASSUMPTION: AC-6 states no error body, so only the status and "not stored" are asserted.

@story:DEMO-303
Feature: Partner booking API
  As a partner system I want to obtain a token and manage bookings,
  and operations want invalid bookings rejected.

  # from story AC-1, partner-accounts.csv
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: Valid partner credentials return a token
    When I POST the partner credentials to /auth
    Then the response status is 200
    And the body contains a non-empty "token"

  # from story AC-2
  @SCN-002 @AC-2 @priority:P1 @type:security @layer:api
  Scenario: Invalid credentials are refused with 401
    When I POST the partner username with a wrong password to /auth
    Then the response status is 401
    And the body is {"reason": "Bad credentials"}

  # from story AC-3, story §API contract (booking JSON)
  @SCN-003 @AC-3 @priority:P1 @type:functional @layer:api
  Scenario: Creating a valid booking echoes it with an id
    When I POST a valid booking with a unique name to /booking
    Then the response status is 200
    And the body has an integer "bookingid" and "booking" equal to what I sent

  # from story AC-4
  @SCN-004 @AC-4 @priority:P1 @type:functional @layer:api @depends:SCN-003
  Scenario: A created booking can be read back unchanged
    Given I created a valid booking
    When I GET /booking/{id}
    Then the response status is 200
    And the body equals the booking I created

  # from story AC-4
  @SCN-005 @AC-4 @priority:P2 @type:negative @layer:api @depends:SCN-003
  Scenario: Reading a booking that does not exist returns 404
    Given the id of a booking that no longer exists
    When I GET /booking/{id}
    Then the response status is 404

  # from story AC-5
  @SCN-006 @AC-5 @priority:P2 @type:functional @layer:api @depends:SCN-003
  Scenario: Searching by name finds the booking
    Given I created a valid booking with a unique first and last name
    When I GET /booking with that firstname and lastname
    Then the response status is 200
    And the result contains the created booking id

  # from story AC-6, booking-rules.csv R1 R2 R4 R5
  @SCN-007 @AC-6 @priority:P1 @type:negative @layer:api
  Scenario Outline: A booking missing a required field is rejected with 400
    When I POST a valid booking without <field>
    Then the response status is 400
    And the booking is not stored

    Examples:
      | field                |
      | firstname            |
      | lastname             |
      | depositpaid          |
      | bookingdates.checkin |

  # from story AC-6, booking-rules.csv R3 R6
  @SCN-008 @AC-6 @priority:P1 @type:boundary @layer:api
  Scenario Outline: Price and date boundaries are enforced
    When I POST a valid booking with <change>
    Then the booking is <outcome>

    Examples:
      | change                          | outcome  |
      | totalprice 0                    | accepted |
      | totalprice -1                   | rejected |
      | checkout = checkin + 1 day      | accepted |
      | checkout = checkin (same day)   | rejected |
      | checkout = checkin - 4 days     | rejected |

  # from story AC-7
  @SCN-009 @AC-7 @priority:P1 @type:security @layer:api @depends:SCN-003
  Scenario Outline: Writes without authentication are refused and change nothing
    Given I created a valid booking
    When I <method> /booking/{id} without authentication
    Then the response status is 403
    And the stored booking is unchanged

    Examples:
      | method |
      | PUT    |
      | PATCH  |
      | DELETE |

  # from story AC-7, AC-8
  @SCN-010 @AC-7 @AC-8 @priority:P1 @type:functional @layer:api @depends:SCN-003 @depends:SCN-001
  Scenario Outline: A full update succeeds with either authentication method
    Given I created a valid booking
    When I PUT a changed booking to /booking/{id} authenticated with <auth>
    Then the response status is 200
    And the body equals the changed booking

    Examples:
      | auth         |
      | token cookie |
      | Basic auth   |

  # from story AC-8
  @SCN-011 @AC-8 @priority:P2 @type:idempotency @layer:api @depends:SCN-003
  Scenario: Repeating the same PUT is idempotent
    Given I created a valid booking
    When I PUT the same changed booking twice
    Then both responses are 200 with identical bodies
    And GET /booking/{id} returns that changed booking

  # from story AC-9
  @SCN-012 @AC-9 @priority:P2 @type:functional @layer:api @depends:SCN-003
  Scenario: PATCH changes only the supplied fields
    Given I created a valid booking
    When I PATCH only the firstname
    Then the response status is 200
    And only the firstname differs from the original booking

  # from story AC-10
  @SCN-013 @AC-10 @priority:P1 @type:functional @layer:api @depends:SCN-003
  Scenario: Cancelling a booking returns 204 and removes it
    Given I created a valid booking
    When I DELETE /booking/{id} with Basic authentication
    Then the response status is 204
    And GET /booking/{id} responds 404

  # from story AC-11
  @SCN-014 @AC-11 @priority:P2 @type:negative @layer:api @depends:SCN-003
  Scenario Outline: Writing to a booking that does not exist returns 404
    Given the id of a booking that no longer exists
    When I <method> /booking/{id} with authentication
    Then the response status is 404

    Examples:
      | method |
      | PUT    |
      | PATCH  |
      | DELETE |

  # from story AC-12
  @SCN-015 @AC-12 @priority:P3 @type:performance @layer:api @depends:SCN-003
  Scenario: Reading a booking is fast
    Given I created a valid booking
    When I GET /booking/{id} 5 times in a row
    Then every response arrives in under 3000 ms
