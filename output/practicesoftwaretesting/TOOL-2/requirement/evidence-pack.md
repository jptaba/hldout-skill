# Evidence pack — TOOL-2

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).
This pack is the whole requirement: the story's title, description and acceptance criteria, the screenshots they show, and the Confluence pages they link (`linked/confluence-*.md`). Comments and other attachments are not part of it, and there is no API document unless one of these sources contains it (`requirement/raw-issue.json` is the tracker's raw answer; nothing to read there).

**Project configuration** (heldout.config.json: not requirement, nothing to cite or cover; a gap it answers is `found-in-config`):

- AUT profile `practicesoftwaretesting` "Practice Software Testing": web https://practicesoftwaretesting.com/, API https://api.practicesoftwaretesting.com


## story.md

```text
  L1   | ---
  L2   | key: TOOL-2
  L3   | summary: "Customer registration, sign-in and account protection"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://jira.example.com/browse/TOOL-2
  L10  | fetchedAt: 2026-10-05T01:19:22.613Z
  L11  | ---
  L12  | 
  L13  | # TOOL-2: Customer registration, sign-in and account protection
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | As a customer I want to register and sign in, and I want my account protected against password guessing.
  L18  | 
● L19  | Identity API: `POST /users/register`, `POST /users/login` (returns `{ "access_token", "token_type", "expires_in" }`), `GET /users/me` and `GET /users/logout` (both need `Authorization: Bearer <access_token>`). Web shop sign-in page: "Sign in" in the navigation.
  L20  | 
  L21  | ## Acceptance criteria
  L22  | 
● L23  | Scenario: Registration creates the customer without echoing the password
● L24  |   Given a new customer with a unique e-mail address
● L25  |   When their details are posted to POST /users/register
● L26  |   Then the API responds 201 with the customer's details and an id
● L27  |   And the response does not contain the password
  L28  | 
● L29  | Scenario: A registered e-mail address cannot register twice
● L30  |   Given a customer already registered with an e-mail address
● L31  |   When the same e-mail address is registered again
● L32  |   Then the API responds 409 with the message "A customer with this email address already exists."
  L33  | 
● L34  | Scenario: Weak passwords are rejected with every broken rule listed
● L35  |   Given a new customer whose password is "abc"
● L36  |   When they register
● L37  |   Then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number
  L38  | 
● L39  | Scenario: Signing in on the web shop
● L40  |   Given a registered customer on the web shop's sign-in page
● L41  |   When they sign in with their e-mail address and password
● L42  |   Then they land on the "My account" page
● L43  |   And the navigation shows their first and last name
  L44  | 
● L45  | Scenario: A wrong password is refused
● L46  |   Given a registered customer
● L47  |   When they sign in with a wrong password
● L48  |   Then POST /users/login responds 401
● L49  |   And the web shop shows "Invalid email or password"
  L50  | 
● L51  | Scenario: The account locks after five failed attempts
● L52  |   Given a registered customer
● L53  |   When five sign-in attempts with a wrong password are made
● L54  |   Then attempts one to five respond 401
● L55  |   And the sixth attempt, even with the correct password, responds 423 with a message that the account is locked
  L56  | 
● L57  | Scenario: Signing out invalidates the token
● L58  |   Given a signed-in customer with an access token
● L59  |   When they sign out with GET /users/logout
● L60  |   Then GET /users/me with the same token responds 401
  L61  | 
  L62  | ## Linked pages
  L63  | 
  L64  | _None_
  L65  | 
  L66  | ## Screenshots
  L67  | 
  L68  | _None_
  L69  | 
```
