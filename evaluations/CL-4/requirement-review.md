# Requirement review — CL-4

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | description (auth scheme, owner field, endpoints), 8 Gherkin acceptance criteria with a Background, test data |

## Testability decisions

_How each criterion is verified (write the decision after the arrow)._

- **AC-1** (api) Scenario Outline: Contacts endpoints require a session token. When a client calls <method> <path> without an Authorization header, then t… →
- **AC-2** (api) Scenario: A token that was not issued by the application is refused. When a client calls GET /contacts with "Authorization: Bearer" follo… →
- **AC-3** (api) Scenario: Signing out ends the session. Given user "A" holds a token that returns A's contacts on GET /contacts, when user "A" calls POST… →
- **AC-4** (api) Scenario: A user cannot read another user's contact. When user "B" calls GET /contacts/{id of Secret Sam}, then the response status is 40… →
- **AC-5** (api) Scenario Outline: A user cannot change or delete another user's contact. When user "B" calls <method> /contacts/{id of Secret Sam} with a… →
- **AC-6** (api) Scenario: A new contact always belongs to its creator. When user "A" calls POST /contacts with a valid body that also contains "owner" se… →
- **AC-7** (api) Scenario Outline: The owner of an existing contact cannot be changed. When user "A" calls <method> /contacts/{id of Secret Sam} with a bo… →
- **AC-8** (ui) Scenario: The contact list page only shows the signed-in user's contacts. Given user "B" has a contact "Bella Bee", when user "B" signs i… →

## Ambiguities / open questions

- G1 (mechanics, required): the request body of a valid contact for POST /contacts, PUT /contacts/{id} and PATCH /contacts/{id}: its field names, how a contact named "Secret Sam" or "Bella Bee" maps to them, and the first name / last name fields of AC-7's PUT row — open
- G2 (mechanics, required): where a contact's id, its name and its "owner" are in the answers of POST /contacts, GET /contacts and GET /contacts/{id} (to get the id of Secret Sam, check "owner" and whether a list contains a contact) — open
- G3 (mechanics, required): the login page (AC-8): its route and how its e-mail, password and submit elements are found — open
- G4 (mechanics, required): the Contact List page (AC-8): its route and how the contacts it shows (their names) are found — open
