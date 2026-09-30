# Requirement contract — TOOL-2: Customer registration, sign-in and account protection

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-29T22:20

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | description (identity API endpoints, token shape, Bearer header, web shop sign-in entry) and seven Gherkin scenarios |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | Registration creates the customer without echoing the password: given a new customer with a unique e-mail address, when their details are posted to POST /users/register, then the API responds 201 with the customer's details and an id, and the response does not contain the password | POST /users/register with a new customer's details and a unique e-mail address → 201; the response contains the customer's details and an id; the response does not contain the password | story.md#L23 |
| AC-2 | api | A registered e-mail address cannot register twice: given a customer already registered with an e-mail address, when the same e-mail address is registered again, then the API responds 409 with the message "A customer with this email address already exists." | registering an already registered e-mail address again → 409; message "A customer with this email address already exists." | story.md#L29 |
| AC-3 | api | Weak passwords are rejected with every broken rule listed: given a new customer whose password is "abc", when they register, then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number | registering a new customer with password "abc" → 422; the password errors state the rule: at least 8 characters; the password errors state the rule: upper and lower case letters; the password errors state the rule: a symbol; the password errors state the rule: a number | story.md#L34 |
| AC-4 | ui | Signing in on the web shop: given a registered customer on the web shop's sign-in page, when they sign in with their e-mail address and password, then they land on the "My account" page, and the navigation shows their first and last name | after signing in with the customer's e-mail address and password, they land on the "My account" page; the navigation shows the customer's first and last name | story.md#L39 |
| AC-5 | e2e | A wrong password is refused: given a registered customer, when they sign in with a wrong password, then POST /users/login responds 401, and the web shop shows "Invalid email or password" | signing in with a wrong password: POST /users/login responds 401; the web shop shows "Invalid email or password" | story.md#L45 |
| AC-6 | api | The account locks after five failed attempts: given a registered customer, when five sign-in attempts with a wrong password are made, then attempts one to five respond 401, and the sixth attempt, even with the correct password, responds 423 with a message that the account is locked | sign-in attempts one to five with a wrong password each respond 401; the sixth attempt with the correct password responds 423; the 423 answer carries a message saying the account is locked | story.md#L51 |
| AC-7 | api | Signing out invalidates the token: given a signed-in customer with an access token, when they sign out with GET /users/logout, then GET /users/me with the same token responds 401 | after GET /users/logout, GET /users/me with the same access token responds 401 | story.md#L57 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /users/register |  | 201 with the customer's details and an id, without the password (story.md#L26-L27) | story.md#L19 |
| POST /users/login |  | returns { "access_token", "token_type", "expires_in" } (status not stated) | story.md#L19 |
| GET /users/me | required |  | story.md#L19 |
| GET /users/logout | required |  | story.md#L19 |

## Rules and boundaries

- **R1** A password must satisfy four rules: at least 8 characters, upper and lower case letters, a symbol, a number; a registration that breaks them is answered 422 with every broken rule listed _(story.md#L34-L37)_
- **R2** After five failed sign-in attempts with a wrong password the account locks: the sixth attempt, even with the correct password, responds 423 with a message that the account is locked _(story.md#L51-L55)_
- **R3** Signing out with GET /users/logout invalidates the access token: GET /users/me with the same token responds 401 _(story.md#L57-L60)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | registering an e-mail address that is already registered | 409 | A customer with this email address already exists. | story.md#L32 |
| E2 | registering with a weak password ("abc"): the password errors state all four rules | 422 |  | story.md#L37 |
| E3 | signing in with a wrong password (POST /users/login); the web shop shows the message | 401 | Invalid email or password | story.md#L48-L49 |
| E4 | sign-in attempt after five failed attempts, even with the correct password: a message that the account is locked | 423 |  | story.md#L55 |
| E5 | GET /users/me with an access token that was signed out with GET /users/logout | 401 |  | story.md#L60 |

## Authentication

Bearer token: Authorization: Bearer <access_token>, the access_token returned by POST /users/login _(story.md#L19)_

## Test data

not stated in the sources; the scenarios speak of new customers with a unique e-mail address and of registered customers

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | web shop sign-in page: its route (the story says only "Sign in" in the navigation) and how the e-mail, password and submit elements and the error message are found | mechanics | yes | AC-4, AC-5 | story → aut | discovered-in-aut: The 'Sign in' navigation link goes to /auth/login (ready: heading 'Login'); e-mail getByTestId('email'), password getByTestId('password'), submit getByTestId('login-submit'); the page calls POST /users/login on the API host |
| G2 | "My account" page: how the page is recognised (route or heading) and where the navigation shows the customer's first and last name | mechanics | yes | AC-4 | story → aut | discovered-in-aut: After sign-in the address is /account and the page shows heading 'My account' (level 1); the navigation landmark (getByRole('navigation')) holds a menu item with the customer's name |
| G3 | where the password errors are in the 422 answer of POST /users/register (field or key that holds them) | mechanics | yes | AC-3 | story → aut | discovered-in-aut: The 422 answer holds the password errors as a list of strings under the top-level key 'password' |
| G4 | whether and when a locked account unlocks (lock duration or unlock procedure); the story does not say, so a locked test account may stay locked | oracle | no | AC-6 | story | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context |  |
| story.md#L19 | endpoint, auth, G1 |  |
| story.md#L23-L27 | AC-1 |  |
| story.md#L29-L32 | AC-2, E1 |  |
| story.md#L34-L37 | AC-3, R1, E2 |  |
| story.md#L39-L43 | AC-4 |  |
| story.md#L45-L49 | AC-5, E3 |  |
| story.md#L51-L55 | AC-6, R2, E4 |  |
| story.md#L57-L60 | AC-7, R3, E5 |  |
