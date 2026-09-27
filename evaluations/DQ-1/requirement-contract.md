# Requirement contract — DQ-1: Book Store accounts - create a user, get a token, sign in and sign out

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, context, account/test-data rules, password policy, out of scope, AC-1..AC-13 (custom field), PO clarification on AC-6 |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | Creating a user with POST /Account/v1/User and a JSON body { "userName", "password" } whose password satisfies the policy returns 201 Created. The body contains the new user's id (userID, a UUID), username equal to the requested user name, and an empty books list. | 201 Created; body contains `userID`, a UUID; body `username` equals the requested user name; body `books` is an empty list | story.md#L45 |
| AC-2 | api | A password that does not satisfy the policy (too short, or missing an uppercase letter, a lowercase letter, a digit or a special character) is rejected with 400, error code "1300" and the message "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer." No account is created (a token cannot be obtained for it). | each policy violation (too short; no uppercase letter; no lowercase letter; no digit; no special character) → 400; error `code` "1300"; message "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer."; no account is created: a token cannot be obtained for that user name and password | story.md#L47 |
| AC-3 | api | Creating a user whose user name already exists is rejected with 406, error code "1204" and the message "User exists!". | 406; error `code` "1204"; message "User exists!" | story.md#L49 |
| AC-4 | api | Creating a user without a user name or without a password is rejected with 400, error code "1200" and the message "UserName and Password required." | without a user name → 400, error `code` "1200", message "UserName and Password required."; without a password → 400, error `code` "1200", message "UserName and Password required." | story.md#L51 |
| AC-5 | api | POST /Account/v1/GenerateToken with the correct user name and password returns 200 with a non-empty token, status "Success", result "User authorized successfully." and an expires timestamp 7 days after the moment the token was issued. | 200; `token` is non-empty; `status` "Success"; `result` "User authorized successfully."; `expires` is a timestamp 7 days after the moment the token was issued | story.md#L53 |
| AC-6 | api | POST /Account/v1/GenerateToken with a wrong password issues no token: token and expires are null, status is "Failed" and result is "User authorization failed." | 401 Unauthorized (PO clarification, story.md#L75); `token` is null; `expires` is null; `status` "Failed"; `result` "User authorization failed." | story.md#L55 |
| AC-7 | api | The token must not disclose the user's password: decoding the token (a JWT) must not reveal the password in any part of it. | the token decodes as a JWT; no part of the decoded token (header, payload, signature) contains the user's password | story.md#L57 |
| AC-8 | api | POST /Account/v1/Authorized with { "userName", "password" } returns false for a newly created user who has not been issued a token yet, and true once a token has been generated for that user. With a wrong password it never returns true; it answers with the message "User not found!". | newly created user, no token issued yet → `false`; after a token has been generated for that user → `true`; wrong password → never `true`; wrong password → message "User not found!" | story.md#L59 |
| AC-9 | e2e | On the login page (/login), signing in with an account created through the API opens the profile page (/profile), which shows "User Name :" followed by that user's name. After this sign-in, POST /Account/v1/Authorized returns true for the account. | after signing in, the profile page `/profile` is open; the profile page shows "User Name :" followed by the user's name; `POST /Account/v1/Authorized` then returns `true` for the account | story.md#L61 |
| AC-10 | ui | Signing in with a wrong password keeps the user on the login page and shows the message "Invalid username or password!" in red below the form. | the user stays on the login page `/login`; message "Invalid username or password!" is shown below the form; the message is shown in red | story.md#L63 |
| AC-11 | ui | Clicking "Login" with an empty user name and an empty password does not sign in; both fields are highlighted as invalid. | clicking "Login" with both fields empty does not sign in (the user stays on the login page); the user name field is highlighted as invalid; the password field is highlighted as invalid | story.md#L65 |
| AC-12 | ui | Clicking "Logout" on the profile page signs the user out and returns to the login page. Opening /profile afterwards no longer shows the user name and shows "Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself." | clicking "Logout" on the profile page returns to the login page; opening `/profile` afterwards does not show the user name; opening `/profile` afterwards shows "Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself." | story.md#L67 |
| AC-13 | api | DELETE /Account/v1/User/{UUID}, authorized with the user's token, deletes the account and returns 204 No Content. Afterwards POST /Account/v1/GenerateToken for that user name returns status "Failed". | DELETE with the user's token → 204 No Content; afterwards `POST /Account/v1/GenerateToken` for that user name returns `status` "Failed" | story.md#L69 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /Account/v1/User |  | 201 Created | story.md#L45 |
| POST /Account/v1/GenerateToken |  | 200 | story.md#L53 |
| POST /Account/v1/Authorized |  |  | story.md#L59 |
| DELETE /Account/v1/User/{UUID} | required | 204 No Content | story.md#L69 |

## Rules and boundaries

- **R1** Password policy: at least 8 characters, with at least one uppercase letter, one lowercase letter, one digit and one special (non-alphanumeric) character; enforced when an account is created. _(story.md#L34, story.md#L27-L28)_
- **R2** Accounts are created through the API (POST /Account/v1/User) with a unique user name per run (for example qa-<timestamp>) and removed afterwards with DELETE /Account/v1/User/{UUID}. Accounts for sign-in are always created through the API. _(story.md#L32, story.md#L79)_
- **R3** The password for these accounts is taken from the environment variable DQ_USER_PASSWORD (it satisfies the password policy). Never hard-code a password. _(story.md#L33)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | creating a user with a password that does not satisfy the policy | 400 | code "1300", message "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer." | story.md#L47 |
| E2 | creating a user whose user name already exists | 406 | code "1204", message "User exists!" | story.md#L49 |
| E3 | creating a user without a user name or without a password | 400 | code "1200", message "UserName and Password required." | story.md#L51 |
| E4 | GenerateToken with a wrong password or an unknown user name | 401 | token null, expires null, status "Failed", result "User authorization failed." | story.md#L75 |
| E5 | Authorized with a wrong password |  | message "User not found!" | story.md#L59 |
| E6 | UI sign-in with a wrong password |  | "Invalid username or password!" in red below the form | story.md#L63 |

## Authentication

the user's token from POST /Account/v1/GenerateToken authorizes DELETE /Account/v1/User/{UUID}; how it is sent (header name/scheme) is not stated (G9) — credentials: user name created per run; password from environment variable DQ_USER_PASSWORD (story.md#L33) _(story.md#L69)_

## Test data

tests create their own accounts through POST /Account/v1/User with a unique user name per run (for example qa-<timestamp>); the password comes from the environment variable DQ_USER_PASSWORD
- never hard-code a password
- accounts for sign-in are always created through the API, not the registration form
- Cleanup: remove each created account with DELETE /Account/v1/User/{UUID}

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | HTTP status for a refused token request: AC-6 states only the body; the PO comment requires 401 Unauthorized for a wrong password or an unknown user name | oracle | yes | AC-6, AC-13 | story | found-in-requirement: 401 Unauthorized for GenerateToken with a wrong password or an unknown user name; body as in AC-6. AC-8 (Authorized) is unchanged. AC-13's outcome stays as written (status "Failed"); the 401 from L75 also applies to that request since the deleted user name is unknown |
| G2 | JSON field that carries the error message (story gives `code` as a field name but says only "the message") | mechanics | yes | AC-2, AC-3, AC-4, AC-8 | story → aut | discovered-in-aut: message |
| G3 | how "7 days after the moment the token was issued" is compared: the issue moment is not observable from the client, and the timestamp format/time zone and an acceptable tolerance are not stated | oracle | yes | AC-5 | story → user | assumed: the issue moment is taken as the time the GenerateToken request was sent/answered; `expires` (parsed as an ISO-8601 timestamp, UTC if no offset is given) must be 7 days after that moment, allowing only for clock difference between test client and server (a tolerance of a few minutes, not hours) |
| G4 | HTTP status (and body shape) of POST /Account/v1/Authorized with a wrong password; AC-8 states only the message "User not found!" | oracle | no | AC-8 | story → user | assumed: no specific status is asserted; the check is that the response is not `true` and carries the message "User not found!" |
| G5 | how to drive the login and profile pages: user name / password field labels or locators, the login button, where the profile shows "User Name :", how "highlighted as invalid" and "below the form" are rendered | mechanics | yes | AC-9, AC-10, AC-11, AC-12 | story → aut | discovered-in-aut: getByRole(textbox, UserName) · getByRole(textbox, Password) · getByRole(button, Login) · getByRole(button, Logout); profile text "User Name :" + name |
| G6 | request field names and body shape for POST /Account/v1/GenerateToken (story says only "user name and password") | mechanics | yes | AC-2, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-12, AC-13 | story → aut | discovered-in-aut: { "userName", "password" } |
| G7 | what "without a user name / without a password" means on the wire: field omitted, null, or empty string | oracle | no | AC-4 | story → user | assumed: "without" covers both the field being absent and the field being an empty string; each must give 400 / code "1200" / "UserName and Password required." |
| G8 | what counts as "in red" (AC-10) and "highlighted as invalid" (AC-11): the observable indicator is not specified | oracle | no | AC-10, AC-11 | story → user | assumed: "in red": the message text's rendered colour is a red hue (red channel clearly dominant); "highlighted as invalid": each empty field is visibly marked invalid by the page (e.g. an invalid-state style or indicator on that field) after clicking "Login" |
| G9 | how the user's token is sent to DELETE /Account/v1/User/{UUID} (header name and scheme) | mechanics | yes | AC-13 | story → aut | discovered-in-aut: Authorization: Bearer <token> |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17-L19 | context | user story: actor and goal; the testable behaviour is in AC-1..AC-13 |
| story.md#L23-L25 | context | system description, routes /login, /profile, API base /Account/v1 and Swagger UI location; each route/endpoint is captured in the ACs that use it |
| story.md#L27-L28 | context, R1 | summary of AC-2, AC-6, AC-8, AC-10 (wrong credentials) and of R1 (policy enforced at creation) |
| story.md#L32 | R2, test-data, endpoint |  |
| story.md#L33 | R3, test-data, auth |  |
| story.md#L34 | R1 |  |
| story.md#L36 | not-a-requirement | points to the Acceptance Criteria field, which is reproduced in this story at L45-L69 |
| story.md#L40-L41 | out-of-scope |  |
| story.md#L45 | AC-1, endpoint |  |
| story.md#L47 | AC-2, E1 |  |
| story.md#L49 | AC-3, E2 |  |
| story.md#L51 | AC-4, E3, G7 |  |
| story.md#L53 | AC-5, endpoint, G3 |  |
| story.md#L55 | AC-6, E4 |  |
| story.md#L57 | AC-7 |  |
| story.md#L59 | AC-8, endpoint, E5, G4 |  |
| story.md#L61 | AC-9 |  |
| story.md#L63 | AC-10, E6 |  |
| story.md#L65 | AC-11 |  |
| story.md#L67 | AC-12 |  |
| story.md#L69 | AC-13, endpoint, auth, G9 |  |
| story.md#L75 | G1, E4 |  |
| story.md#L77 | G1, G4 |  |
| story.md#L79 | out-of-scope, R2 |  |
