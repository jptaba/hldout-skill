# Requirement contract — TOOL-2: Customer registration, sign-in and account protection

_Built by the evaluator from the story (title, description, acceptance criteria), the images they show and the pages they link. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5.5), 2026-10-05T01:31

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, identity API endpoints and auth, web shop sign-in entry point, seven Gherkin scenarios |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | Registration creates the customer without echoing the password: given a new customer with a unique e-mail address, when their details are posted to POST /users/register, then the API responds 201 with the customer's details and an id, and the response does not contain the password. | 201; the response contains the customer's details; the response contains an id; the response does not contain the password | story.md#L23 |
| AC-2 | api | A registered e-mail address cannot register twice: given a customer already registered with an e-mail address, when the same e-mail address is registered again, then the API responds 409 with the message "A customer with this email address already exists." | 409; message "A customer with this email address already exists." | story.md#L29 |
| AC-3 | api | Weak passwords are rejected with every broken rule listed: given a new customer whose password is "abc", when they register, then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number. | registering with password "abc" responds 422; the password errors state the rule: at least 8 characters; the password errors state the rule: upper and lower case letters; the password errors state the rule: a symbol; the password errors state the rule: a number | story.md#L34 |
| AC-4 | ui | Signing in on the web shop: given a registered customer on the web shop's sign-in page, when they sign in with their e-mail address and password, then they land on the "My account" page and the navigation shows their first and last name. | after signing in, the customer is on the "My account" page; the navigation shows the customer's first and last name | story.md#L39 |
| AC-5 | e2e | A wrong password is refused: given a registered customer, when they sign in with a wrong password, then POST /users/login responds 401 and the web shop shows "Invalid email or password". | POST /users/login with a wrong password responds 401; the web shop shows "Invalid email or password" | story.md#L45 |
| AC-6 | api | The account locks after five failed attempts: given a registered customer, when five sign-in attempts with a wrong password are made, then attempts one to five respond 401, and the sixth attempt, even with the correct password, responds 423 with a message that the account is locked. | sign-in attempts one to five with a wrong password each respond 401; the sixth attempt, with the correct password, responds 423; the 423 response carries a message saying the account is locked | story.md#L51 |
| AC-7 | api | Signing out invalidates the token: given a signed-in customer with an access token, when they sign out with GET /users/logout, then GET /users/me with the same token responds 401. | GET /users/logout responds any 2xx success (body not checked) (G4, provided by the user); after GET /users/logout, GET /users/me with the same token responds 401 | story.md#L57 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /users/register |  | 201 with the customer's details and an id, without the password (story.md#L26-L27) | story.md#L19 |
| POST /users/login |  | returns { "access_token", "token_type", "expires_in" } | story.md#L19 |
| GET /users/me | required |  | story.md#L19 |
| GET /users/logout | required |  | story.md#L19 |

## Rules and boundaries

- **R1** Password rules: at least 8 characters, upper and lower case letters, a symbol, a number _(story.md#L37)_
- **R2** An e-mail address can be registered only once _(story.md#L29-L32)_
- **R3** The account locks after five failed sign-in attempts; while locked, sign-in responds 423 even with the correct password _(story.md#L51-L55)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | registering an e-mail address that is already registered | 409 | A customer with this email address already exists. | story.md#L32 |
| E2 | registering with a weak password ("abc"): the password errors state all four rules | 422 |  | story.md#L37 |
| E3 | signing in with a wrong password (attempts one to five); the web shop shows "Invalid email or password" | 401 |  | story.md#L48-L49, story.md#L54 |
| E4 | signing in to a locked account (the sixth attempt, even with the correct password), with a message that the account is locked | 423 |  | story.md#L55 |
| E5 | GET /users/me with a token that was signed out | 401 |  | story.md#L60 |

## Authentication

Bearer token: Authorization: Bearer <access_token>, the access_token returned by POST /users/login _(story.md#L19)_

## Test data

not stated in the sources; AC-1 and AC-3 post a new customer with a unique e-mail address, AC-2 needs a customer already registered with an e-mail address, AC-6 needs a registered customer whose account the test locks

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | web shop sign-in page: its route (reached through "Sign in" in the navigation), how the e-mail, password and submit elements are found, and where the "Invalid email or password" message appears | mechanics | yes | AC-4, AC-5 | story → aut | discovered-in-aut: Route /auth/login (the navigation's "Sign in" link, href /auth/login). Fields by test id: getByTestId('email'), getByTestId('password'), submit getByTestId('login-submit') (label 'Password *' so getByLabel('Password', {exact:true}) matches nothing). A wrong password shows 'Invalid email or password' in getByTestId('login-error') under the form; the page stays on /auth/login |
| G2 | "My account" page and navigation: how the page is recognised, where the navigation shows the customer's name, and where the signed-in customer's first and last name come from (the seeded account's details) | mechanics | yes | AC-4 | story → aut | discovered-in-aut: After sign-in the app goes to /account; the page is recognised by heading 'My account' (h1, test id page-title, getByRole('heading', { name: 'My account' }) unique). The single navigation landmark (getByRole('navigation')) shows the signed-in customer's 'first_name last_name' as the nav-menu button; the name is the one the customer registered with (POST /users/register first_name/last_name, echoed by GET /users/me) |
| G3 | where the error responses carry their messages: the 409 message (AC-2), the 422 password errors (AC-3) and the 423 lock message (AC-6) | mechanics | yes | AC-2, AC-3, AC-6 | story → aut | discovered-in-aut: JSON bodies: 409 {"email": ["<message>"]}; 422 {"password": ["<one message per broken rule>"]} (other fields' errors under their own field names); 423 {"error": "<message>"}; 401 from /users/login {"error": "Unauthorized"} |
| G4 | what GET /users/logout itself must respond (status, body) when the customer signs out | oracle | no | AC-7 | story → user | provided-by-user: GET /users/logout must return any 2xx success; its body is not checked |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context |  |
| story.md#L19 | endpoint, auth, G1 |  |
| story.md#L23-L27 | AC-1 |  |
| story.md#L29-L32 | AC-2, R2, E1 |  |
| story.md#L34-L37 | AC-3, R1, E2 |  |
| story.md#L39-L43 | AC-4 |  |
| story.md#L45-L49 | AC-5, E3 |  |
| story.md#L51-L55 | AC-6, R3, E4 |  |
| story.md#L57-L60 | AC-7, E5 |  |
