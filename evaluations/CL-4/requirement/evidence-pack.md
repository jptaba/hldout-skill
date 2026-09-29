# Evidence pack — CL-4

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).
This pack is the whole requirement: the story, its acceptance-criteria field, comments and text attachments (`requirement/raw-issue.json` is the tracker's raw answer they came from; nothing to read there).

**Project configuration** (heldout.config.json: not requirement, nothing to cite or cover; a gap it answers is `found-in-config`):

- AUT profile `thinking-tester-contact-list` "Contact List App": web https://thinking-tester-contact-list.herokuapp.com/ (API on the same origin)


## story.md

```text
  L1   | ---
  L2   | key: CL-4
  L3   | summary: "Account security for contacts"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/CL-4
  L10  | fetchedAt: 2026-09-29T11:08:36.755Z
  L11  | ---
  L12  | 
  L13  | # CL-4: Account security for contacts
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | Contact data is personal data. Every contacts endpoint must only work for a signed-in user, signing out must really end the session, and a user must never see or touch another user's contacts. Session tokens are issued by `POST /users` (sign-up) and `POST /users/login` and are sent as `Authorization: Bearer <token>`. Contacts carry an `owner` field with the `_id` of the user they belong to; the user's own `_id` is returned by sign-up, sign-in and `GET /users/me`.
  L18  | 
● L19  | The acceptance criteria are written as scenarios; the tag on each scenario is its acceptance-criterion id.
  L20  | 
  L21  | ```gherkin
  L22  | Feature: Account security for contacts
  L23  | 
● L24  |   Background:
● L25  |     Given user "A" and user "B" have each signed up with their own unique e-mail address
● L26  |     And user "A" has a contact "Secret Sam" created with POST /contacts
  L27  | 
● L28  |   @AC-1
● L29  |   Scenario Outline: Contacts endpoints require a session token
● L30  |     When a client calls <method> <path> without an Authorization header
● L31  |     Then the response status is 401
● L32  |     And the response body is {"error": "Please authenticate."}
● L33  |     And no contact is created, changed or deleted
  L34  | 
● L35  |     Examples:
● L36  |       | method | path                            |
● L37  |       | GET    | /contacts                       |
● L38  |       | POST   | /contacts                       |
● L39  |       | GET    | /contacts/{id of Secret Sam}    |
● L40  |       | PUT    | /contacts/{id of Secret Sam}    |
● L41  |       | PATCH  | /contacts/{id of Secret Sam}    |
● L42  |       | DELETE | /contacts/{id of Secret Sam}    |
  L43  | 
● L44  |   @AC-2
● L45  |   Scenario: A token that was not issued by the application is refused
● L46  |     When a client calls GET /contacts with "Authorization: Bearer" followed by a made-up or altered token
● L47  |     Then the response status is 401
● L48  |     And the response body is {"error": "Please authenticate."}
  L49  | 
● L50  |   @AC-3
● L51  |   Scenario: Signing out ends the session
● L52  |     Given user "A" holds a token that returns A's contacts on GET /contacts
● L53  |     When user "A" calls POST /users/logout with that token
● L54  |     Then the response status is 200
● L55  |     And GET /contacts with the same token answers 401
● L56  |     And GET /users/me with the same token answers 401
  L57  | 
● L58  |   @AC-4
● L59  |   Scenario: A user cannot read another user's contact
● L60  |     When user "B" calls GET /contacts/{id of Secret Sam}
● L61  |     Then the response status is 404
● L62  |     And GET /contacts for user "B" does not contain "Secret Sam"
  L63  | 
● L64  |   @AC-5
● L65  |   Scenario Outline: A user cannot change or delete another user's contact
● L66  |     When user "B" calls <method> /contacts/{id of Secret Sam} with a valid body
● L67  |     Then the response status is 404
● L68  |     And GET /contacts/{id of Secret Sam} for user "A" still returns "Secret Sam" unchanged
  L69  | 
● L70  |     Examples:
● L71  |       | method |
● L72  |       | PUT    |
● L73  |       | PATCH  |
● L74  |       | DELETE |
  L75  | 
● L76  |   @AC-6
● L77  |   Scenario: A new contact always belongs to its creator
● L78  |     When user "A" calls POST /contacts with a valid body that also contains "owner" set to the _id of user "B"
● L79  |     Then the response status is 201
● L80  |     And the new contact's "owner" is the _id of user "A"
● L81  |     And the new contact is listed for user "A" and not for user "B"
  L82  | 
● L83  |   @AC-7
● L84  |   Scenario Outline: The owner of an existing contact cannot be changed
● L85  |     When user "A" calls <method> /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B"
● L86  |     Then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A"
● L87  |     And GET /contacts/{id of Secret Sam} for user "A" still answers 200
● L88  |     And GET /contacts for user "B" does not contain "Secret Sam"
  L89  | 
● L90  |     Examples:
● L91  |       | method | body                                                        |
● L92  |       | PUT    | first name, last name and owner                             |
● L93  |       | PATCH  | owner only                                                  |
  L94  | 
● L95  |   @AC-8
● L96  |   Scenario: The contact list page only shows the signed-in user's contacts
● L97  |     Given user "B" has a contact "Bella Bee"
● L98  |     When user "B" signs in on the login page
● L99  |     Then the Contact List page shows "Bella Bee"
● L100 |     And it does not show "Secret Sam"
  L101 | ```
  L102 | 
  L103 | ## Test data
  L104 | 
● L105 | No accounts are provided: create users "A" and "B" through sign-up (`POST /users`) with unique e-mail addresses, using the password from the environment variable `CL_USER_PASSWORD` for both. Delete both users afterwards with `DELETE /users/me` where possible.
  L106 | 
  L107 | ## Attachments
  L108 | 
  L109 | _None_
  L110 | 
```
