---
key: CL-4
summary: "Account security for contacts"
type: Story
status: Ready for QA
priority: High
labels: []
source: mock-jira
url: https://your-domain.atlassian.net/browse/CL-4
fetchedAt: 2026-09-29T11:08:36.755Z
---

# CL-4: Account security for contacts

## Description

Contact data is personal data. Every contacts endpoint must only work for a signed-in user, signing out must really end the session, and a user must never see or touch another user's contacts. Session tokens are issued by `POST /users` (sign-up) and `POST /users/login` and are sent as `Authorization: Bearer <token>`. Contacts carry an `owner` field with the `_id` of the user they belong to; the user's own `_id` is returned by sign-up, sign-in and `GET /users/me`.

The acceptance criteria are written as scenarios; the tag on each scenario is its acceptance-criterion id.

```gherkin
Feature: Account security for contacts

  Background:
    Given user "A" and user "B" have each signed up with their own unique e-mail address
    And user "A" has a contact "Secret Sam" created with POST /contacts

  @AC-1
  Scenario Outline: Contacts endpoints require a session token
    When a client calls <method> <path> without an Authorization header
    Then the response status is 401
    And the response body is {"error": "Please authenticate."}
    And no contact is created, changed or deleted

    Examples:
      | method | path                            |
      | GET    | /contacts                       |
      | POST   | /contacts                       |
      | GET    | /contacts/{id of Secret Sam}    |
      | PUT    | /contacts/{id of Secret Sam}    |
      | PATCH  | /contacts/{id of Secret Sam}    |
      | DELETE | /contacts/{id of Secret Sam}    |

  @AC-2
  Scenario: A token that was not issued by the application is refused
    When a client calls GET /contacts with "Authorization: Bearer" followed by a made-up or altered token
    Then the response status is 401
    And the response body is {"error": "Please authenticate."}

  @AC-3
  Scenario: Signing out ends the session
    Given user "A" holds a token that returns A's contacts on GET /contacts
    When user "A" calls POST /users/logout with that token
    Then the response status is 200
    And GET /contacts with the same token answers 401
    And GET /users/me with the same token answers 401

  @AC-4
  Scenario: A user cannot read another user's contact
    When user "B" calls GET /contacts/{id of Secret Sam}
    Then the response status is 404
    And GET /contacts for user "B" does not contain "Secret Sam"

  @AC-5
  Scenario Outline: A user cannot change or delete another user's contact
    When user "B" calls <method> /contacts/{id of Secret Sam} with a valid body
    Then the response status is 404
    And GET /contacts/{id of Secret Sam} for user "A" still returns "Secret Sam" unchanged

    Examples:
      | method |
      | PUT    |
      | PATCH  |
      | DELETE |

  @AC-6
  Scenario: A new contact always belongs to its creator
    When user "A" calls POST /contacts with a valid body that also contains "owner" set to the _id of user "B"
    Then the response status is 201
    And the new contact's "owner" is the _id of user "A"
    And the new contact is listed for user "A" and not for user "B"

  @AC-7
  Scenario Outline: The owner of an existing contact cannot be changed
    When user "A" calls <method> /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B"
    Then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A"
    And GET /contacts/{id of Secret Sam} for user "A" still answers 200
    And GET /contacts for user "B" does not contain "Secret Sam"

    Examples:
      | method | body                                                        |
      | PUT    | first name, last name and owner                             |
      | PATCH  | owner only                                                  |

  @AC-8
  Scenario: The contact list page only shows the signed-in user's contacts
    Given user "B" has a contact "Bella Bee"
    When user "B" signs in on the login page
    Then the Contact List page shows "Bella Bee"
    And it does not show "Secret Sam"
```

## Test data

No accounts are provided: create users "A" and "B" through sign-up (`POST /users`) with unique e-mail addresses, using the password from the environment variable `CL_USER_PASSWORD` for both. Delete both users afterwards with `DELETE /users/me` where possible.

## Attachments

_None_
