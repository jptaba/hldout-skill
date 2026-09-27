# Requirement contract — TOOL-2: Customer registration, sign-in and account protection

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (claude-sonnet-5), 2026-09-26T23:15

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | User story (L17), identity API endpoints, login response shape, Bearer auth and web shop sign-in entry (L19), and the seven Gherkin acceptance criteria (L23-L60). No attachments, no comments. |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | Scenario: Registration creates the customer without echoing the password. Given a new customer with a unique e-mail address, When their details are posted to POST /users/register, Then the API responds 201 with the customer's details and an id, And the response does not contain the password | POST /users/register responds 201; the response contains the customer's details and an id; the response does not contain the password | story.md#L23 |
| AC-2 | api | Scenario: A registered e-mail address cannot register twice. Given a customer already registered with an e-mail address, When the same e-mail address is registered again, Then the API responds 409 with the message "A customer with this email address already exists." | second registration with the same e-mail address responds 409; message "A customer with this email address already exists." | story.md#L29 |
| AC-3 | api | Scenario: Weak passwords are rejected with every broken rule listed. Given a new customer whose password is "abc", When they register, Then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number | registering with password "abc" responds 422; the password errors state the rule: at least 8 characters; the password errors state the rule: upper and lower case letters; the password errors state the rule: a symbol; the password errors state the rule: a number | story.md#L34 |
| AC-4 | e2e | Scenario: Signing in on the web shop. Given a registered customer on the web shop's sign-in page, When they sign in with their e-mail address and password, Then they land on the "My account" page, And the navigation shows their first and last name | after signing in they land on the "My account" page; the navigation shows the customer's first and last name | story.md#L39 |
| AC-5 | e2e | Scenario: A wrong password is refused. Given a registered customer, When they sign in with a wrong password, Then POST /users/login responds 401, And the web shop shows "Invalid email or password" | POST /users/login with a wrong password responds 401; the web shop shows "Invalid email or password" | story.md#L45 |
| AC-6 | api | Scenario: The account locks after five failed attempts. Given a registered customer, When five sign-in attempts with a wrong password are made, Then attempts one to five respond 401, And the sixth attempt, even with the correct password, responds 423 with a message that the account is locked | wrong-password sign-in attempts one to five each respond 401; the sixth attempt, even with the correct password, responds 423; the sixth attempt's response has a message that the account is locked | story.md#L51 |
| AC-7 | api | Scenario: Signing out invalidates the token. Given a signed-in customer with an access token, When they sign out with GET /users/logout, Then GET /users/me with the same token responds 401 | after GET /users/logout, GET /users/me with the same token responds 401 | story.md#L57 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /users/register | none | 201 with the customer's details and an id, without the password (AC-1) | story.md#L19 |
| POST /users/login | none | returns { "access_token", "token_type", "expires_in" } | story.md#L19 |
| GET /users/me | required |  | story.md#L19 |
| GET /users/logout | required |  | story.md#L19 |

## Rules and boundaries

- **R1** Password rules: at least 8 characters, upper and lower case letters, a symbol, a number; a registration breaking them is rejected with 422 and every broken rule listed _(story.md#L34-L37)_
- **R2** An e-mail address can be registered only once; a second registration responds 409 _(story.md#L29-L32)_
- **R3** The account locks after five failed sign-in attempts: attempts one to five respond 401, the sixth attempt responds 423 even with the correct password _(story.md#L51-L55)_
- **R4** The registration response never contains the password _(story.md#L27)_
- **R5** Signing out invalidates the access token: GET /users/me with that token then responds 401 _(story.md#L57-L60)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | registering an e-mail address that is already registered (POST /users/register) | 409 | A customer with this email address already exists. | story.md#L32 |
| E2 | registering with a weak password (POST /users/register): password errors state every broken rule | 422 |  | story.md#L37 |
| E3 | signing in with a wrong password (POST /users/login), including failed attempts one to five | 401 |  | story.md#L48, story.md#L54 |
| E4 | signing in with a wrong password on the web shop: message shown on the sign-in page (UI text, not an API body) |  | Invalid email or password | story.md#L49 |
| E5 | sign-in after five failed attempts, even with the correct password (POST /users/login): message that the account is locked (wording not specified, G6) | 423 |  | story.md#L55 |
| E6 | GET /users/me with a token that was signed out via GET /users/logout | 401 |  | story.md#L60 |

## Authentication

Authorization: Bearer <access_token> on GET /users/me and GET /users/logout; the access_token comes from POST /users/login — credentials: per-test customers registered via POST /users/register (G8) _(story.md#L19)_

## Test data

Each test registers its own customer via POST /users/register with a unique e-mail address at example.com and the payload fields of G1; signed-in state comes from POST /users/login with that customer's e-mail address and password.
- E-mail addresses must be unique per run (AC-1 requires a new customer; AC-2 relies on a first registration succeeding)
- The lockout scenario (AC-6) locks its customer: use a dedicated customer and never reuse it
- Customers cannot delete themselves (deleting a user needs the admin role), so created customers stay in the shared sandbox
- Cleanup: none possible without admin rights; unique e-mail addresses keep runs independent

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | registration request fields (the story says only "their details") | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 | story → aut | discovered-in-aut: first_name, last_name, dob, address{street, city, state, country, postal_code}, phone, email, password |
| G2 | API origin and web shop origin (the story gives paths only) | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 | story → config | found-in-config: API https://api.practicesoftwaretesting.com; web shop https://practicesoftwaretesting.com |
| G3 | web shop sign-in page mechanics: route, form fields, submit button, error element, and where the account page title and the navigation name are shown | mechanics | yes | AC-4, AC-5 | story → aut | discovered-in-aut: "Sign in" link → /auth/login; data-test email, password, login-submit; error element data-test login-error; account page title data-test page-title; navigation menu data-test nav-menu |
| G4 | exact wording / shape of the password errors for AC-3: the story says the errors "state all four rules" but gives no messages | oracle | no | AC-3 | story | assumed: A rule counts as stated when the 422 response's password errors include a message that names it: the 8-character minimum, upper and lower case letters, a symbol, a number. Exact wording is not checked. |
| G5 | which "customer's details" the AC-1 response must contain | oracle | no | AC-1 | story | assumed: The response contains an id and echoes the submitted details (at least first name, last name and e-mail address) with the values posted. |
| G6 | exact wording of the account-locked message for AC-6 (the story says only "a message that the account is locked") | oracle | no | AC-6 | story | assumed: The 423 response carries a message that says the account is locked (contains the word "locked", case-insensitive); exact wording is not checked. |
| G7 | sign-in request fields for POST /users/login (the story says "e-mail address and password") | mechanics | yes | AC-5, AC-6, AC-7 | story → aut | discovered-in-aut: email, password |
| G8 | how test customers are created and cleaned up | mechanics | yes | AC-1, AC-2, AC-4, AC-5, AC-6, AC-7 | story → aut | discovered-in-aut: create via POST /users/register with unique example.com e-mail addresses; no self-delete, no cleanup |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context | user story; the password-guessing protection is specified by AC-6 |
| story.md#L19 | endpoint, auth, G3 | four identity endpoints, login response shape, Bearer auth for /users/me and /users/logout, web shop "Sign in" entry point |
| story.md#L23-L27 | AC-1, R4 |  |
| story.md#L29-L32 | AC-2, R2 |  |
| story.md#L34-L37 | AC-3, R1 |  |
| story.md#L39-L43 | AC-4 |  |
| story.md#L45-L49 | AC-5 |  |
| story.md#L51-L55 | AC-6, R3 |  |
| story.md#L57-L60 | AC-7, R5 |  |
