# Requirement contract — CL-4: Account security for contacts

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-29T11:15

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | description (auth scheme, owner field, endpoints), 8 Gherkin acceptance criteria with a Background, test data |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | Scenario Outline: Contacts endpoints require a session token. When a client calls <method> <path> without an Authorization header, then the response status is 401, the response body is {"error": "Please authenticate."} and no contact is created, changed or deleted. Examples: GET /contacts, POST /contacts, GET, PUT, PATCH and DELETE /contacts/{id of Secret Sam}. | GET /contacts without an Authorization header → status 401, body {"error": "Please authenticate."}; POST /contacts without an Authorization header → status 401, body {"error": "Please authenticate."}, and no contact is created; GET /contacts/{id of Secret Sam} without an Authorization header → status 401, body {"error": "Please authenticate."}; PUT /contacts/{id of Secret Sam} without an Authorization header → status 401, body {"error": "Please authenticate."}, and Secret Sam is not changed; PATCH /contacts/{id of Secret Sam} without an Authorization header → status 401, body {"error": "Please authenticate."}, and Secret Sam is not changed; DELETE /contacts/{id of Secret Sam} without an Authorization header → status 401, body {"error": "Please authenticate."}, and Secret Sam is not deleted | story.md#L29 |
| AC-2 | api | Scenario: A token that was not issued by the application is refused. When a client calls GET /contacts with "Authorization: Bearer" followed by a made-up or altered token, then the response status is 401 and the response body is {"error": "Please authenticate."} | GET /contacts with "Authorization: Bearer" followed by a made-up token → status 401, body {"error": "Please authenticate."}; GET /contacts with "Authorization: Bearer" followed by an altered token (an issued token changed) → status 401, body {"error": "Please authenticate."} | story.md#L45 |
| AC-3 | api | Scenario: Signing out ends the session. Given user "A" holds a token that returns A's contacts on GET /contacts, when user "A" calls POST /users/logout with that token, then the response status is 200, GET /contacts with the same token answers 401 and GET /users/me with the same token answers 401. | before signing out, GET /contacts with user A's token returns A's contacts; POST /users/logout with that token → status 200; GET /contacts with the same token → 401; GET /users/me with the same token → 401 | story.md#L51 |
| AC-4 | api | Scenario: A user cannot read another user's contact. When user "B" calls GET /contacts/{id of Secret Sam}, then the response status is 404 and GET /contacts for user "B" does not contain "Secret Sam". | GET /contacts/{id of Secret Sam} with user B's token → status 404; GET /contacts for user B does not contain "Secret Sam" | story.md#L59 |
| AC-5 | api | Scenario Outline: A user cannot change or delete another user's contact. When user "B" calls <method> /contacts/{id of Secret Sam} with a valid body, then the response status is 404 and GET /contacts/{id of Secret Sam} for user "A" still returns "Secret Sam" unchanged. Examples: PUT, PATCH, DELETE. | PUT /contacts/{id of Secret Sam} by user B with a valid body → status 404, and GET /contacts/{id of Secret Sam} for user A still returns "Secret Sam" unchanged; PATCH /contacts/{id of Secret Sam} by user B with a valid body → status 404, and GET /contacts/{id of Secret Sam} for user A still returns "Secret Sam" unchanged; DELETE /contacts/{id of Secret Sam} by user B → status 404, and GET /contacts/{id of Secret Sam} for user A still returns "Secret Sam" unchanged | story.md#L65 |
| AC-6 | api | Scenario: A new contact always belongs to its creator. When user "A" calls POST /contacts with a valid body that also contains "owner" set to the _id of user "B", then the response status is 201, the new contact's "owner" is the _id of user "A", and the new contact is listed for user "A" and not for user "B". | POST /contacts by user A with a valid body plus "owner" set to user B's _id → status 201; the new contact's "owner" is the _id of user A; GET /contacts for user A lists the new contact; GET /contacts for user B does not list the new contact | story.md#L77 |
| AC-7 | api | Scenario Outline: The owner of an existing contact cannot be changed. When user "A" calls <method> /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B", then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A", GET /contacts/{id of Secret Sam} for user "A" still answers 200, and GET /contacts for user "B" does not contain "Secret Sam". Examples: PUT with first name, last name and owner; PATCH with owner only. | PUT /contacts/{id of Secret Sam} by user A with first name, last name and "owner" set to user B's _id → either rejected with 400, or answered 200 with "owner" still the _id of user A; then GET /contacts/{id of Secret Sam} for user A still answers 200 and GET /contacts for user B does not contain "Secret Sam"; PATCH /contacts/{id of Secret Sam} by user A with "owner" only, set to user B's _id → either rejected with 400, or answered 200 with "owner" still the _id of user A; then GET /contacts/{id of Secret Sam} for user A still answers 200 and GET /contacts for user B does not contain "Secret Sam" | story.md#L84 |
| AC-8 | ui | Scenario: The contact list page only shows the signed-in user's contacts. Given user "B" has a contact "Bella Bee", when user "B" signs in on the login page, then the Contact List page shows "Bella Bee" and does not show "Secret Sam". | after user B signs in on the login page, the Contact List page shows "Bella Bee"; the Contact List page does not show "Secret Sam" | story.md#L96 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /users |  |  | story.md#L17, story.md#L105 |
| POST /users/login |  |  | story.md#L17 |
| GET /users/me |  |  | story.md#L17, story.md#L56 |
| POST /users/logout |  | 200 | story.md#L53 |
| DELETE /users/me |  |  | story.md#L105 |
| GET /contacts | required |  | story.md#L37, story.md#L17 |
| POST /contacts | required | 201 | story.md#L26, story.md#L38, story.md#L17 |
| GET /contacts/{id} | required | 200 | story.md#L39, story.md#L17 |
| PUT /contacts/{id} | required |  | story.md#L40, story.md#L17 |
| PATCH /contacts/{id} | required |  | story.md#L41, story.md#L17 |
| DELETE /contacts/{id} | required |  | story.md#L42, story.md#L17 |

## Rules and boundaries

- **R1** Every contacts endpoint must only work for a signed-in user. _(story.md#L17)_
- **R2** Signing out must really end the session. _(story.md#L17)_
- **R3** A user must never see or touch another user's contacts. _(story.md#L17)_
- **R4** Contacts carry an "owner" field with the _id of the user they belong to; the user's own _id is returned by sign-up, sign-in and GET /users/me. _(story.md#L17)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | a contacts endpoint called without an Authorization header | 401 | {"error": "Please authenticate."} | story.md#L30-L32 |
| E2 | GET /contacts with a made-up or altered Bearer token | 401 | {"error": "Please authenticate."} | story.md#L46-L48 |
| E3 | GET /contacts or GET /users/me with a token that was signed out with POST /users/logout | 401 |  | story.md#L55-L56 |
| E4 | a user calls GET, PUT, PATCH or DELETE on another user's contact | 404 |  | story.md#L60-L61, story.md#L66-L67 |
| E5 | PUT or PATCH on an existing contact with a body that sets "owner" to another user's _id: either rejected with 400, or answered 200 with the owner unchanged | 400 |  | story.md#L85-L86 |

## Authentication

Session token sent as "Authorization: Bearer <token>" — credentials: tokens are issued by POST /users (sign-up) and POST /users/login; users are created by the tests with the password from the environment variable CL_USER_PASSWORD _(story.md#L17, story.md#L105)_

## Test data

No accounts are provided: the tests create users "A" and "B" through sign-up (POST /users) with their own unique e-mail addresses, using the password from the environment variable CL_USER_PASSWORD for both. Background for every scenario: user "A" has a contact "Secret Sam" created with POST /contacts; AC-8 also needs user "B" to have a contact "Bella Bee".
- users "A" and "B" each sign up with their own unique e-mail address
- both users use the password from the environment variable CL_USER_PASSWORD
- the contact "Secret Sam" of user "A" is created with POST /contacts
- Cleanup: Delete both users afterwards with DELETE /users/me where possible.

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | the request body of a valid contact for POST /contacts, PUT /contacts/{id} and PATCH /contacts/{id}: its field names, how a contact named "Secret Sam" or "Bella Bee" maps to them, and the first name / last name fields of AC-7's PUT row | mechanics | yes | AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8 | story → attachments → aut | discovered-in-aut: a contact body is {firstName, lastName, …}; the story's names are first and last name |
| G2 | where a contact's id, its name and its "owner" are in the answers of POST /contacts, GET /contacts and GET /contacts/{id} (to get the id of Secret Sam, check "owner" and whether a list contains a contact) | mechanics | yes | AC-1, AC-3, AC-4, AC-5, AC-6, AC-7 | story → attachments → aut | discovered-in-aut: POST /contacts answers 201 with _id and owner; GET /contacts answers an array of contacts; GET /contacts/{id} the contact |
| G3 | the login page (AC-8): its route and how its e-mail, password and submit elements are found | mechanics | yes | AC-8 | story → config → aut | discovered-in-aut: the login page is / (Email, Password, Submit), saved as the profile's UI sign-in |
| G4 | the Contact List page (AC-8): its route and how the contacts it shows (their names) are found | mechanics | yes | AC-8 | story → config → aut | discovered-in-aut: /contactList: each contact is a table row with its name |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | R1, R2, R3, R4, auth, endpoint, context |  |
| story.md#L19 | context | explains that each scenario's tag is its acceptance-criterion id |
| story.md#L24-L26 | test-data, endpoint | Background shared by every scenario: two signed-up users and user A's contact Secret Sam created with POST /contacts |
| story.md#L28-L42 | AC-1, E1 |  |
| story.md#L44-L48 | AC-2, E2 |  |
| story.md#L50-L56 | AC-3, E3, endpoint |  |
| story.md#L58-L62 | AC-4, E4 |  |
| story.md#L64-L74 | AC-5, E4 |  |
| story.md#L76-L81 | AC-6 |  |
| story.md#L83-L93 | AC-7, E5 |  |
| story.md#L95-L100 | AC-8 |  |
| story.md#L105 | test-data, endpoint, auth |  |
