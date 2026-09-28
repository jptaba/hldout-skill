# Source: CL-3 — Edit and delete a contact
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: "Edit Contact" on the Contact Details page opens the Edit Contact page with every field pre-filled with the contact's current values.
# AC-2: Changing a value (for example the city) and pressing Submit saves the change and returns the user to the Contact Details page, which shows the new value.
# AC-3: After an edit in the web app, GET /contacts/{id} returns the new value. Emptying an optional field in the edit form (for example the phone) removes that value: the Contact Details page shows it empty and the API returns null for it.
# AC-4: Submitting the edit form with an invalid e-mail address (for example not-an-email) keeps the user on the Edit Contact page with a message containing "Email is invalid", and the stored contact is not changed.
# AC-5: PUT /contacts/{id} replaces the contact as described in the contract: 200 with the full updated contact; optional fields that are not in the body are cleared (null).
# AC-6: PATCH /contacts/{id} changes only the fields in the body: 200 with the updated contact, and all other fields keep their previous values.
# AC-7: A PUT or PATCH that would leave the contact without a first name or last name (field missing from a PUT body, or sent as an empty string) is rejected with 400 and the stored contact stays exactly as it was.
# AC-8: "Delete Contact" asks "Are you sure you want to delete this contact?". Cancelling keeps the contact and the user stays on the Contact Details page; confirming deletes it and returns the user to the Contact List page, where the contact is no longer listed.
# AC-9: DELETE /contacts/{id} answers 200 with the body Contact deleted.
# AC-10: A deleted contact is gone for good: GET /contacts/{id} answers 404, it is not part of GET /contacts, and a second DELETE, a PUT or a PATCH on it also answer 404.
# AC-11: A malformed contact id (for example abc) on GET, PUT, PATCH or DELETE /contacts/{id} is answered with 400 and the body Invalid Contact ID.
#
# ENDPOINT: GET /contacts/{id} — 200 with the contact
# ENDPOINT: PUT /contacts/{id} — 200 the full updated contact
# ENDPOINT: PATCH /contacts/{id} — 200 the updated contact
# ENDPOINT: DELETE /contacts/{id} — 200 text Contact deleted
# ENDPOINT: GET /contacts
# ENDPOINT: POST /contacts
#
# OPEN-QUESTION: G6 — An emptied optional field: AC-3 says the API returns null for it; the contract attachment says an optional field without a value is either absent or null. Must the field be null, or is absent also acceptable?
# OPEN-QUESTION: G7 — No acceptance criterion covers the Return to Contact List button on the Contact Details page or the Cancel button on the Edit Contact page; are they in scope, and what must they do?
# OPEN-QUESTION: G8 — No acceptance criterion covers these stated error cases: 401 {"error": "Please authenticate."} for a missing or invalid token, 404 for a contact that belongs to another user, and 400 with a JSON message for an invalid e-mail on PUT or PATCH; are they in scope?

# ASSUMPTION: every test signs up its own user (seed.account(), deleted afterwards) and creates the contacts it needs through POST /contacts, deleting them afterwards.

@story:CL-3
Feature: Edit and delete a contact

  # from story.md AC-1
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:ui
  Scenario: The edit form is pre-filled with the contact's current values
    Given I am signed in and have a contact with every field filled
    And I opened that contact's Contact Details page from the Contact List
    When I press "Edit Contact"
    Then the Edit Contact page shows every field with the contact's current value

  # from story.md AC-2
  @SCN-002 @AC-2 @priority:P1 @type:functional @layer:ui
  Scenario: Editing the city saves it and shows it on the Contact Details page
    Given I am signed in and have a contact in Anytown
    And I am on that contact's Edit Contact page
    When I change the city to a new value and press Submit
    Then I am on the Contact Details page
    And it shows the new city

  # from story.md AC-3
  @SCN-003 @AC-3 @priority:P1 @type:integration @layer:e2e
  Scenario: An edit in the web app is what the API returns
    Given I am signed in and have a contact in Anytown
    And I am on that contact's Edit Contact page
    When I change the city to a new value and press Submit
    Then GET /contacts/{id} returns 200 with the new city

  # from story.md AC-3
  @SCN-004 @AC-3 @priority:P2 @type:integration @layer:e2e
  Scenario: Emptying the phone in the web app clears it
    Given I am signed in and have a contact with a phone number
    And I am on that contact's Edit Contact page
    When I empty the phone and press Submit
    Then the Contact Details page shows no phone
    And GET /contacts/{id} returns null for the phone

  # from story.md AC-4
  @SCN-005 @AC-4 @priority:P1 @type:negative @layer:ui
  Scenario: An invalid e-mail is refused and nothing is stored
    Given I am signed in and have a contact
    And I am on that contact's Edit Contact page
    When I enter the e-mail "not-an-email" and press Submit
    Then I stay on the Edit Contact page
    And a message containing "Email is invalid" is shown
    And GET /contacts/{id} returns the contact unchanged

  # from story.md AC-5
  @SCN-006 @AC-5 @priority:P1 @type:functional @layer:api
  Scenario: PUT replaces the contact
    Given I have a contact with every field filled
    When I PUT a complete contact with new values to /contacts/{id}
    Then the answer is 200 with the full updated contact

  # from story.md AC-5, attachment L30
  @SCN-007 @AC-5 @priority:P2 @type:functional @layer:api
  Scenario: PUT clears the optional fields it does not send
    Given I have a contact with every field filled
    When I PUT only a first and a last name to /contacts/{id}
    Then the answer is 200 and every optional field is null

  # from story.md AC-6
  @SCN-008 @AC-6 @priority:P1 @type:functional @layer:api
  Scenario: PATCH changes only the fields it sends
    Given I have a contact with every field filled
    When I PATCH a new city to /contacts/{id}
    Then the answer is 200 with the new city
    And every other field keeps its previous value

  # from story.md AC-7, attachment L35/L47
  @SCN-009 @AC-7 @priority:P1 @type:negative @layer:api
  Scenario Outline: An update that would lose the first or last name is refused
    Given I have a contact with every field filled
    When I send <request>
    Then the answer is 400 with a JSON message
    And the stored contact is exactly as it was

    Examples:
      | request                        |
      | PUT without firstName          |
      | PUT without lastName           |
      | PUT with firstName ""          |
      | PATCH with lastName ""         |

  # from story.md AC-8
  @SCN-010 @AC-8 @priority:P2 @type:functional @layer:ui
  Scenario: Cancelling the delete keeps the contact
    Given I am signed in and on a contact's Contact Details page
    When I press "Delete Contact" and cancel "Are you sure you want to delete this contact?"
    Then I stay on the Contact Details page
    And the contact still exists

  # from story.md AC-8
  @SCN-011 @AC-8 @priority:P1 @type:functional @layer:ui
  Scenario: Confirming the delete removes the contact
    Given I am signed in and on a contact's Contact Details page
    When I press "Delete Contact" and confirm "Are you sure you want to delete this contact?"
    Then I am on the Contact List page
    And the contact is no longer listed

  # from story.md AC-9
  @SCN-012 @AC-9 @priority:P1 @type:functional @layer:api
  Scenario: DELETE answers "Contact deleted"
    Given I have a contact
    When I send DELETE /contacts/{id}
    Then the answer is 200 with the body "Contact deleted"

  # from story.md AC-10
  @SCN-013 @AC-10 @priority:P1 @type:negative @layer:api
  Scenario: A deleted contact is gone for good
    Given I had a contact and deleted it with DELETE /contacts/{id}
    Then GET /contacts/{id} answers 404 with an empty body
    And GET /contacts does not list it
    And a second DELETE, a PUT and a PATCH on it answer 404 with an empty body

  # from story.md AC-11
  @SCN-014 @AC-11 @priority:P2 @type:negative @layer:api
  Scenario Outline: A malformed contact id is refused
    When I send <method> /contacts/abc
    Then the answer is 400 with the body "Invalid Contact ID"

    Examples:
      | method |
      | GET    |
      | PUT    |
      | PATCH  |
      | DELETE |
