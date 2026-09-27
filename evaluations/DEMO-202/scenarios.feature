# Source: DEMO-202 — Guest enquiries — contact form, rooms catalogue and messages API
# Fetched: 2026-09-26 (mock Jira)
# Attachments used:
#   field-rules.csv   → boundaries + exact length messages (SCN-004, SCN-006)
#   api-contract.md   → status codes, Room schema, auth cookie (SCN-005…SCN-017)
#   ux-copy.md        → confirmation copy, price format, image alt text (SCN-002, SCN-018, SCN-019)
#   test-accounts.csv → staff credentials (test-data.json → staff, secret in .env)
# Requirement review: requirement-review.md
# Requirement revision: rev 2 adds AC-16 (see requirement/CHANGES.md) → SCN-021, SCN-022
#
# Acceptance criteria (verbatim from the story — one line each, this list drives coverage):
# AC-1: The home page contains a "Send Us a Message" form with the fields Name, Email, Phone, Subject and Message and a "Submit" button. Every field has a programmatically associated label that screen readers announce (WCAG 2.2 SC 1.3.1 / 4.1.2).
# AC-2: Submitting a valid form replaces it with the heading "Thanks for getting in touch <Name>!" followed by "We'll get back to you about <Subject> as soon as possible." (exact copy in ux-copy.md).
# AC-3: Submitting the form with every field empty keeps the form on screen and shows validation errors that mention every one of the five fields. Nothing is sent to staff.
# AC-4: Field rules and boundaries are defined in the attached field-rules.csv. The UI and the API enforce the same rules. A value exactly on a boundary is valid; one character outside it is invalid.
# AC-5: POST /api/message with a body that satisfies every field rule creates the enquiry. The response is 201 Created with the JSON body {"success": true}.
# AC-6: POST /api/message with one or more invalid fields responds 400 Bad Request. The body is a JSON array of human-readable error strings containing, for each violated length rule, the exact message from field-rules.csv. The enquiry is not stored.
# AC-7: A request body that is not valid JSON is a client error. POST /api/message responds 400 Bad Request, never a 5xx.
# AC-8: GET /api/message (list) and GET /api/message/{id} (detail) contain guests' personal data and require a valid staff token. Without a token they respond 401 Unauthorized and return no message data. With a valid token (cookie token, obtained from POST /api/auth/login) the list responds 200 with {"messages": [{"id", "name", "subject", "read"}]}.
# AC-9: POST /api/auth/login with valid staff credentials responds 200 with {"token": "<non-empty string>"}. Invalid credentials respond 401 with {"error": "Invalid credentials"}.
# AC-10: An enquiry submitted through the UI form can be read by staff: it appears in the authenticated GET /api/message list with the same name and subject.
# AC-11: GET /api/room responds 200 with {"rooms": [...]}. Every room follows the Room schema in api-contract.md: roomid integer, roomName string, type one of Single, Twin, Double, Family, Suite, accessible boolean, roomPrice integer greater than 0, features array of strings, image string, description string.
# AC-12: GET /api/room/{id} responds 200 with a single Room for an existing id, and 404 Not Found for an id that does not exist.
# AC-13: Every room returned by GET /api/room is shown in "Our Rooms" with its type and its price formatted as "£<roomPrice> per night".
# AC-14: Each room card image has alternative text that names that room's type, e.g. "Double Room" (WCAG 2.2 SC 1.1.1).
# AC-15: (NFR-1) GET /api/room responds in under 3000 ms for each of 5 consecutive requests from the test environment.
# AC-16: (rev 2) Retries are safe. (a) Repeating POST /api/message with the same Idempotency-Key request header (e.g. a network retry or double-click) stores the enquiry only once: every repeat answers 2xx and no duplicate appears in the staff list. (b) GET endpoints are idempotent: repeating GET /api/room/{id} returns an identical body.
#
# ENDPOINT: POST /api/message — create enquiry (public)
# ENDPOINT: GET /api/message — list enquiries (staff token)
# ENDPOINT: GET /api/message/{id} — enquiry detail (staff token)
# ENDPOINT: POST /api/auth/login — staff login (public)
# ENDPOINT: GET /api/room — list rooms (public)
# ENDPOINT: GET /api/room/{id} — room detail (public)
# SEED-ENDPOINT: DELETE /api/message/{id} — cleanup of enquiries created by the tests (staff token; not part of the requirement)
#
# ASSUMPTION: Boundary rows assert "accepted" (2xx, no error list) for valid values; the exact 201 is asserted only by SCN-005 (one root cause → one failure).
# ASSUMPTION: For e-mail format only 400 + a non-empty error list is asserted — field-rules.csv gives exact wording for length rules only.
# ASSUMPTION: AC-1 "programmatically associated label" = the field is exposed to assistive technology with that accessible name.
# ASSUMPTION: The unknown room id is (highest roomid from GET /api/room) + 100000.
# OPEN-QUESTION: Whitespace trimming before length validation — PO to confirm; deliberately not tested (story "Open questions").

@story:DEMO-202
Feature: Guest enquiries — contact form, rooms catalogue and messages API
  As a guest I want to contact the B&B and see its rooms,
  and as staff I want to read enquiries securely.

  # ---------------- Contact form (UI) ----------------

  # from story AC-1, ux-copy.md §Contact form
  @SCN-001 @AC-1 @priority:P2 @type:accessibility @layer:ui
  Scenario: Contact form offers every field with an accessible label
    Given I am on the home page
    Then I see the "Send Us a Message" form
    And the fields Name, Email, Phone, Subject and Message are each exposed with that accessible name
    And I see a "Submit" button

  # from story AC-2, ux-copy.md §Confirmation
  @SCN-002 @AC-2 @priority:P1 @type:functional @layer:ui
  Scenario: A valid enquiry shows the personalised confirmation
    Given I am on the home page
    When I submit the contact form with a unique name, a valid email, phone, a unique subject and a 20+ character message
    Then I see the heading "Thanks for getting in touch <Name>!" with my name
    And I see "We'll get back to you about <Subject> as soon as possible." with my subject
    And the contact form is no longer shown

  # from story AC-3
  @SCN-003 @AC-3 @priority:P2 @type:negative @layer:ui
  Scenario: An empty submission keeps the form and reports every field
    Given I am on the home page
    When I submit the contact form with every field empty
    Then the contact form is still shown
    And the validation errors mention Name, Email, Phone, Subject and Message

  # from story AC-4, field-rules.csv (UI sample of the shared rules)
  @SCN-004 @AC-4 @priority:P2 @type:boundary @layer:ui
  Scenario Outline: The UI rejects a value one character outside a boundary
    Given I am on the home page
    When I submit the contact form with a valid enquiry whose <field> is <length> characters long
    Then the form shows the error "<message>"

    Examples:
      | field   | length | message                                          |
      | Phone   | 10     | Phone must be between 11 and 21 characters.      |
      | Subject | 101    | Subject must be between 5 and 100 characters.    |
      | Message | 19     | Message must be between 20 and 2000 characters.  |

  # ---------------- Messages API ----------------

  # from story AC-5, api-contract.md §POST /api/message
  @SCN-005 @AC-5 @priority:P1 @type:functional @layer:api
  Scenario: Creating a valid enquiry returns 201 Created
    When I POST a valid enquiry to /api/message
    Then the response status is 201
    And the response body is {"success": true}

  # from story AC-4 / AC-6, field-rules.csv (full boundary matrix)
  @SCN-006 @AC-4 @AC-6 @priority:P1 @type:boundary @layer:api
  Scenario Outline: The API enforces field boundaries
    When I POST a valid enquiry to /api/message whose <field> is <value>
    Then the enquiry is <outcome>
    And when rejected, the error list contains "<message>"

    Examples:
      | field   | value                 | outcome  | message                                         |
      | name    | 1 character           | rejected | Name must be between 2 and 50 characters.       |
      | name    | 2 characters          | accepted |                                                 |
      | name    | 50 characters         | accepted |                                                 |
      | name    | 51 characters         | rejected | Name must be between 2 and 50 characters.       |
      | phone   | 10 characters         | rejected | Phone must be between 11 and 21 characters.     |
      | phone   | 11 characters         | accepted |                                                 |
      | phone   | 21 characters         | accepted |                                                 |
      | phone   | 22 characters         | rejected | Phone must be between 11 and 21 characters.     |
      | subject | 4 characters          | rejected | Subject must be between 5 and 100 characters.   |
      | subject | 5 characters          | accepted |                                                 |
      | subject | 100 characters        | accepted |                                                 |
      | subject | 101 characters        | rejected | Subject must be between 5 and 100 characters.   |
      | message | 19 characters         | rejected | Message must be between 20 and 2000 characters. |
      | message | 20 characters         | accepted |                                                 |
      | message | 2000 characters       | accepted |                                                 |
      | message | 2001 characters       | rejected | Message must be between 20 and 2000 characters. |
      | email   | "guest@example"       | rejected |                                                 |
      | email   | "guest@example.com"   | accepted |                                                 |

  # from story AC-6, api-contract.md §POST /api/message
  @SCN-007 @AC-6 @priority:P2 @type:negative @layer:api
  Scenario: A rejected enquiry is not stored
    Given I am authenticated as staff
    When I POST an enquiry with a unique subject and a too-short phone to /api/message
    Then the response status is 400
    And the authenticated message list does not contain that subject

  # from story AC-7, api-contract.md §POST /api/message
  @SCN-008 @AC-7 @priority:P2 @type:negative @layer:api
  Scenario: A malformed JSON body is a client error
    When I POST a body that is not valid JSON to /api/message
    Then the response status is 400

  # from story AC-8, api-contract.md §GET /api/message
  @SCN-009 @AC-8 @priority:P1 @type:security @layer:api
  Scenario: Listing enquiries without a staff token is refused
    When I GET /api/message without a token
    Then the response status is 401
    And the response contains no message data

  # from story AC-8, api-contract.md §GET /api/message/{id}
  @SCN-010 @AC-8 @priority:P1 @type:security @layer:api
  Scenario: Reading an enquiry without a staff token is refused
    Given I am authenticated as staff and know the id of an existing enquiry
    When I GET /api/message/{id} without a token
    Then the response status is 401
    And the response contains no personal data

  # from story AC-8, api-contract.md §GET /api/message
  @SCN-011 @AC-8 @priority:P1 @type:functional @layer:api
  Scenario: Staff can list enquiries with a valid token
    Given I am authenticated as staff
    When I GET /api/message with the token cookie
    Then the response status is 200
    And every message has id, name, subject and read

  # from story AC-9, api-contract.md §POST /api/auth/login, test-accounts.csv
  @SCN-012 @AC-9 @priority:P1 @type:functional @layer:api
  Scenario: Valid staff credentials return a token
    When I POST the staff credentials to /api/auth/login
    Then the response status is 200
    And the body contains a non-empty "token"

  # from story AC-9, api-contract.md §POST /api/auth/login
  @SCN-013 @AC-9 @priority:P2 @type:negative @layer:api
  Scenario: Invalid staff credentials are refused
    When I POST the staff username with a wrong password to /api/auth/login
    Then the response status is 401
    And the body is {"error": "Invalid credentials"}

  # ---------------- Cross-layer ----------------

  # from story AC-10
  @SCN-014 @AC-10 @priority:P1 @type:integration @layer:e2e
  Scenario: An enquiry sent from the UI is readable by staff through the API
    Given I am on the home page
    When I submit the contact form with a unique name and a unique subject
    And I see the confirmation
    Then the authenticated message list contains an enquiry with that name and subject

  # ---------------- Rooms catalogue ----------------

  # from story AC-11, api-contract.md §Room schema
  @SCN-015 @AC-11 @priority:P1 @type:contract @layer:api
  Scenario: The rooms list follows the Room schema
    When I GET /api/room
    Then the response status is 200
    And every room matches the Room schema

  # from story AC-12, api-contract.md §GET /api/room/{id}
  @SCN-016 @AC-12 @priority:P2 @type:contract @layer:api
  Scenario: An existing room can be fetched by id
    Given I know the id of a room from GET /api/room
    When I GET /api/room/{id}
    Then the response status is 200
    And the body is that room and matches the Room schema

  # from story AC-12, api-contract.md §GET /api/room/{id}
  @SCN-017 @AC-12 @priority:P2 @type:negative @layer:api
  Scenario: An unknown room id returns 404
    Given I know an id that no room has
    When I GET /api/room/{id}
    Then the response status is 404

  # from story AC-13, ux-copy.md §Rooms list
  @SCN-018 @AC-13 @priority:P1 @type:integration @layer:e2e
  Scenario: Every API room is shown with its type and nightly price
    Given the rooms returned by GET /api/room
    When I open the home page
    Then each room's type is shown on a room card
    And that card shows "£<roomPrice> per night"

  # from story AC-14, ux-copy.md §Rooms list
  @SCN-019 @AC-14 @priority:P2 @type:accessibility @layer:e2e
  Scenario: Room card images name their own room type
    Given the rooms returned by GET /api/room
    When I open the home page
    Then each room card's image has the alternative text "<Type> Room" for that card's type

  # from story NFR-1 (AC-15), api-contract.md §Performance
  @SCN-020 @AC-15 @priority:P3 @type:performance @layer:api
  Scenario: The rooms list responds quickly
    When I GET /api/room 5 times in a row
    Then every response arrives in under 3000 ms

  # ---------------- Reliability (rev 2) ----------------

  # from story AC-16, api-contract.md §Idempotency (v1.5)
  @SCN-021 @AC-16 @priority:P1 @type:idempotency @layer:api
  Scenario: A retried enquiry with the same Idempotency-Key is stored only once
    Given I am authenticated as staff
    And a valid enquiry with a unique subject and a unique Idempotency-Key
    When I POST that enquiry to /api/message twice with the same Idempotency-Key
    Then both responses are 2xx
    And the authenticated message list contains that subject exactly once

  # from story AC-16, api-contract.md §Idempotency (v1.5)
  @SCN-022 @AC-16 @priority:P3 @type:idempotency @layer:api
  Scenario: Repeating GET /api/room/{id} returns an identical body
    Given I know the id of a room from GET /api/room
    When I GET /api/room/{id} three times
    Then all three responses are 200 with identical bodies
