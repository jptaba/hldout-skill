# Requirement contract — AE-2: Customer account lifecycle through the partner Account API, with shop sign-in

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | description, team notes (test data, login page, out of scope), AC-1..AC-12 |
| attachments/account-api-contract.md | base URL, encoding, response envelope (responseCode vs HTTP 200), endpoints, required fields, exact messages |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | The system shall create a customer account when the partner calls createAccount with all required fields and an e-mail address not yet registered, answering responseCode 201 with the message "User created!". | createAccount with all required fields and a new e-mail -> responseCode 201; message "User created!" | story.md#L30 |
| AC-2 | api | The system shall refuse to create a second account for an e-mail address that is already registered, answering responseCode 400 with the message "Email already exists!". | createAccount with an already registered e-mail -> responseCode 400; message "Email already exists!" | story.md#L31 |
| AC-3 | api | The system shall treat e-mail addresses case-insensitively for uniqueness: registering an address that differs from an existing account's address only in letter case shall be refused exactly as in AC-2. | createAccount with an existing account's e-mail differing only in letter case -> responseCode 400; message "Email already exists!" | story.md#L32 |
| AC-4 | api | The system shall refuse createAccount when any required field of the contract is missing, answering responseCode 400 with the message naming the missing parameter, and shall not create the account. | createAccount without one required field (name, email, password, firstname, lastname, address1, country, zipcode, state, city, mobile_number) -> responseCode 400; message "Bad request, <field> parameter is missing in POST request." naming the missing field (e.g. "Bad request, city parameter is missing in POST request."); the account is not created: getUserDetailByEmail for that e-mail gives responseCode 404 "Account not found with this email, try another email!" | story.md#L33 |
| AC-5 | api | The system shall refuse createAccount when the e-mail address is not a valid e-mail address (for example it has no "@"), answering responseCode 400, and shall not create the account. | createAccount with an e-mail that has no @ -> responseCode 400 (message not fixed by the contract); the account is not created: getUserDetailByEmail for that address gives responseCode 404 | story.md#L34 |
| AC-6 | api | The system shall answer verifyLogin as the contract states: valid e-mail and password give responseCode 200 "User exists!"; a wrong password or an unknown e-mail give responseCode 404 "User not found!"; a missing e-mail or password gives responseCode 400 "Bad request, email or password parameter is missing in POST request."; the DELETE method gives responseCode 405 "This request method is not supported.". | valid e-mail and password -> responseCode 200 "User exists!"; wrong password -> responseCode 404 "User not found!"; unknown e-mail -> responseCode 404 "User not found!"; e-mail missing -> responseCode 400 "Bad request, email or password parameter is missing in POST request."; password missing -> responseCode 400 "Bad request, email or password parameter is missing in POST request."; DELETE method on verifyLogin -> responseCode 405 "This request method is not supported." | story.md#L35 |
| AC-7 | api | The system shall return the customer's profile from getUserDetailByEmail with every field listed in the contract, holding the values given at registration, and shall never return the password; an unknown e-mail gives responseCode 404 "Account not found with this email, try another email!". | known e-mail -> responseCode 200 with a user object; the user object has every field: id, name, email, title, birth_day, birth_month, birth_year, first_name, last_name, company, address1, address2, country, state, city, zipcode, mobile_number; each field holds the value given at registration (request-to-response name mapping per G3); the password is never returned; unknown e-mail -> responseCode 404 "Account not found with this email, try another email!" | story.md#L36 |
| AC-8 | api | The system shall apply updateAccount as a partial update: with the correct e-mail and password, only the fields sent change (responseCode 200 "User updated!") and the change is visible through getUserDetailByEmail; with a wrong password the answer is responseCode 404 "Account not found!" and nothing changes. | updateAccount with correct e-mail and password and some fields -> responseCode 200 "User updated!"; getUserDetailByEmail shows the sent fields changed and every field not sent unchanged; updateAccount with a wrong password -> responseCode 404 "Account not found!"; after the wrong-password update getUserDetailByEmail shows nothing changed | story.md#L37 |
| AC-9 | api | The system shall close the account on deleteAccount with the correct e-mail and password (responseCode 200 "Account deleted!"), after which verifyLogin and getUserDetailByEmail answer 404 for that e-mail; with a wrong password the answer is responseCode 404 "Account not found!" and the account remains usable. | deleteAccount with correct e-mail and password -> responseCode 200 "Account deleted!"; afterwards verifyLogin for that e-mail -> responseCode 404 "User not found!"; afterwards getUserDetailByEmail for that e-mail -> responseCode 404 "Account not found with this email, try another email!"; deleteAccount with a wrong password -> responseCode 404 "Account not found!"; after the wrong-password delete the account remains usable (reading per G4: verifyLogin with the correct password -> responseCode 200 "User exists!" and getUserDetailByEmail -> responseCode 200) | story.md#L38 |
| AC-10 | e2e | The system shall let a customer created through the API sign in on the shop's login page with the same e-mail and password; after sign-in the header shows "Logged in as <name>", where <name> is the account's current name (including a name changed through updateAccount). | a customer created through createAccount signs in on /login with the same e-mail and password; after sign-in the header shows "Logged in as <name>" with the name given at registration; after the name is changed through updateAccount, sign-in shows "Logged in as <name>" with the new name | story.md#L39 |
| AC-11 | e2e | The system shall refuse shop sign-in with a wrong password, staying on the login page and showing "Your email or password is incorrect!". | sign-in with a wrong password is refused and the browser stays on the login page (/login); the message "Your email or password is incorrect!" is shown | story.md#L40 |
| AC-12 | e2e | The system shall refuse shop sign-in for an account closed through deleteAccount, showing the same message as AC-11. | sign-in with the e-mail and password of an account closed through deleteAccount is refused; the message "Your email or password is incorrect!" is shown | story.md#L41 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /api/createAccount | none | HTTP 200, body {"responseCode": 201, "message": "User created!"} | story.md#L23, attachments/account-api-contract.md#L30 |
| POST /api/verifyLogin | none | HTTP 200, body responseCode 200 "User exists!" | attachments/account-api-contract.md#L59 |
| DELETE /api/verifyLogin | none | not supported: responseCode 405 "This request method is not supported." | attachments/account-api-contract.md#L68 |
| GET /api/getUserDetailByEmail | none | HTTP 200, body responseCode 200 and a user object | attachments/account-api-contract.md#L70 |
| PUT /api/updateAccount | none | HTTP 200, body responseCode 200 "User updated!" | attachments/account-api-contract.md#L84 |
| DELETE /api/deleteAccount | none | HTTP 200, body responseCode 200 "Account deleted!" | attachments/account-api-contract.md#L94 |

## Rules and boundaries

- **R1** Every response of the Account API endpoints is delivered with HTTP status 200; the business outcome is carried in the JSON body as responseCode (integer) and message (string). All codes in the contract, and in the acceptance criteria, refer to responseCode, never to the HTTP status. _(attachments/account-api-contract.md#L16-L26)_
- **R2** Messages in the contract are exact. _(attachments/account-api-contract.md#L23)_
- **R3** createAccount required fields: name, email, password, firstname, lastname, address1, country, zipcode, state, city, mobile_number. Optional: title (Mr, Mrs or Miss), birth_date, birth_month, birth_year, company, address2. _(attachments/account-api-contract.md#L32-L50)_
- **R4** email must be a valid e-mail address and is unique across customers, compared case-insensitively. _(attachments/account-api-contract.md#L35, story.md#L32)_
- **R5** name is the display name shown in the shop header after sign-in. _(attachments/account-api-contract.md#L34, story.md#L39)_
- **R6** getUserDetailByEmail returns a user object with id, name, email, title, birth_day, birth_month, birth_year, first_name, last_name, company, address1, address2, country, state, city, zipcode, mobile_number; the password is never returned. _(attachments/account-api-contract.md#L72-L76)_
- **R7** updateAccount is a partial update: email and password identify and authorise the customer; fields not sent keep their value. _(attachments/account-api-contract.md#L86, story.md#L37)_
- **R8** Customers created by the partner can sign in to the shop straight away with the same e-mail and password; a closed account can no longer sign in. _(story.md#L17)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | createAccount: e-mail already registered (any letter case) | 400 | Email already exists! | attachments/account-api-contract.md#L55, story.md#L31-L32 |
| E2 | createAccount: required field missing | 400 | Bad request, <field> parameter is missing in POST request. | attachments/account-api-contract.md#L56, story.md#L33 |
| E3 | createAccount: e-mail not a valid address (message not fixed) | 400 |  | attachments/account-api-contract.md#L57, story.md#L34 |
| E4 | verifyLogin: unknown e-mail or wrong password | 404 | User not found! | attachments/account-api-contract.md#L66, story.md#L35 |
| E5 | verifyLogin: email or password missing | 400 | Bad request, email or password parameter is missing in POST request. | attachments/account-api-contract.md#L67, story.md#L35 |
| E6 | verifyLogin: DELETE method used | 405 | This request method is not supported. | attachments/account-api-contract.md#L68, story.md#L35 |
| E7 | getUserDetailByEmail: no account for that e-mail | 404 | Account not found with this email, try another email! | attachments/account-api-contract.md#L81, story.md#L36 |
| E8 | getUserDetailByEmail: email missing (no AC covers it, see G5) | 400 | Bad request, email parameter is missing in GET request. | attachments/account-api-contract.md#L82 |
| E9 | updateAccount: e-mail/password pair does not match an account | 404 | Account not found! | attachments/account-api-contract.md#L91, story.md#L37 |
| E10 | updateAccount: password missing (no AC covers it, see G5) | 400 | Bad request, password parameter is missing in PUT request. | attachments/account-api-contract.md#L92 |
| E11 | deleteAccount: e-mail/password pair does not match an account | 404 | Account not found! | attachments/account-api-contract.md#L101, story.md#L38 |
| E12 | deleteAccount: email or password missing (no AC covers it, see G5) | 400 | Bad request, <field> parameter is missing in DELETE request. | attachments/account-api-contract.md#L102 |
| E13 | shop sign-in with a wrong password, or for an account closed through deleteAccount: stays on the login page |  | Your email or password is incorrect! | story.md#L40-L41 |

## Authentication

None at transport level. Account operations are authorised by the customer's email + password pair sent with the request. _(attachments/account-api-contract.md#L11)_

## Test data

Tests create their own customers through the API (POST /api/createAccount); there is no pre-provisioned account.
- use a fresh, unique e-mail address for every customer
- the password for customers created for acceptance comes from the environment variable AE_USER_PASSWORD; never hard-code it
- Cleanup: close (delete) every customer created, through DELETE /api/deleteAccount

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | full request paths of the Account API endpoints: the contract gives the base URL https://automationexercise.com/api and paths relative to it | mechanics | yes | * | story → attachments | found-in-requirement: /api/createAccount, /api/verifyLogin, /api/getUserDetailByEmail, /api/updateAccount, /api/deleteAccount (base URL path /api + contract endpoint path) |
| G2 | UI mechanics of the shop sign-in: e-mail and password inputs and submit button of the "Login to your account" form, where the "Logged in as <name>" header text and the error message appear | mechanics | yes | AC-10, AC-11, AC-12 | story → attachments → aut | discovered-in-aut: login form = locator('form') holding getByRole('button', { name: 'Login', exact: true }); inputs by placeholder 'Email Address' and 'Password' within it; 'Logged in as <name>' is text inside the page <header>; the sign-in error is text inside the login form |
| G3 | which registration request field each getUserDetailByEmail response field must hold: the contract says "some response names differ from the request names" but gives no mapping (request birth_date/firstname/lastname vs response birth_day/first_name/last_name); id has no registration value | oracle | yes | AC-7 | story → attachments | assumed: response fields correspond to the same-named request fields, and birth_day = birth_date, first_name = firstname, last_name = lastname; id is checked for presence only; optional fields not sent are checked for presence only |
| G4 | what "the account remains usable" means after a deleteAccount with a wrong password | oracle | no | AC-9 | story → attachments | assumed: the account still exists and still accepts its credentials: verifyLogin with the correct e-mail and password gives responseCode 200 "User exists!" and getUserDetailByEmail gives responseCode 200 |
| G5 | the contract states error answers that no acceptance criterion covers: getUserDetailByEmail without email (400 "Bad request, email parameter is missing in GET request."), updateAccount without password (400 "Bad request, password parameter is missing in PUT request."), deleteAccount without email or password (400 "Bad request, <field> parameter is missing in DELETE request."). Are they in scope for this story? | oracle | no |  | story → attachments | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context, R8 |  |
| story.md#L19 | context | points to the attached contract, which is part of this story's sources, and to the AC field below |
| story.md#L21 | not-a-requirement | heading of the team notes list |
| story.md#L23 | test-data, endpoint, G1 |  |
| story.md#L24 | test-data |  |
| story.md#L25 | AC-10, AC-11, AC-12, G2 | entry point of the shop sign-in journeys |
| story.md#L26 | out-of-scope |  |
| story.md#L30 | AC-1 |  |
| story.md#L31 | AC-2, E1 |  |
| story.md#L32 | AC-3, R4 |  |
| story.md#L33 | AC-4, E2 |  |
| story.md#L34 | AC-5, E3 |  |
| story.md#L35 | AC-6, E4, E5, E6 |  |
| story.md#L36 | AC-7, E7, G3 |  |
| story.md#L37 | AC-8, E9, R7 |  |
| story.md#L38 | AC-9, E11, G4 |  |
| story.md#L39 | AC-10, R5 |  |
| story.md#L40 | AC-11, E13 |  |
| story.md#L41 | AC-12, E13 |  |
| attachments/account-api-contract.md#L3 | context | ownership and status (agreed) of the API contract |
| attachments/account-api-contract.md#L7 | not-a-requirement | table header row |
| attachments/account-api-contract.md#L9 | endpoint, G1 |  |
| attachments/account-api-contract.md#L10 | endpoint | request encoding: form fields in the body for every method, query string only for GET (in each endpoint's request) |
| attachments/account-api-contract.md#L11 | auth |  |
| attachments/account-api-contract.md#L12 | R1 |  |
| attachments/account-api-contract.md#L16 | R1 |  |
| attachments/account-api-contract.md#L18-L20 | example | illustrates the response envelope of R1 |
| attachments/account-api-contract.md#L22-L24 | R1, R2 |  |
| attachments/account-api-contract.md#L26 | R1 |  |
| attachments/account-api-contract.md#L32 | not-a-requirement | table header row of the createAccount field table |
| attachments/account-api-contract.md#L34 | R3, R5, endpoint |  |
| attachments/account-api-contract.md#L35 | R3, R4, endpoint |  |
| attachments/account-api-contract.md#L36-L50 | R3, endpoint, AC-4 |  |
| attachments/account-api-contract.md#L52 | not-a-requirement | table header row |
| attachments/account-api-contract.md#L54 | AC-1 |  |
| attachments/account-api-contract.md#L55 | AC-2, AC-3, E1 |  |
| attachments/account-api-contract.md#L56 | AC-4, E2 |  |
| attachments/account-api-contract.md#L57 | AC-5, E3 |  |
| attachments/account-api-contract.md#L61 | endpoint |  |
| attachments/account-api-contract.md#L63 | not-a-requirement | table header row |
| attachments/account-api-contract.md#L65 | AC-6 |  |
| attachments/account-api-contract.md#L66 | AC-6, E4 |  |
| attachments/account-api-contract.md#L67 | AC-6, E5 |  |
| attachments/account-api-contract.md#L68 | AC-6, E6, endpoint |  |
| attachments/account-api-contract.md#L72-L74 | AC-7, R6, G3 |  |
| attachments/account-api-contract.md#L76 | AC-7, R6 |  |
| attachments/account-api-contract.md#L78 | not-a-requirement | table header row |
| attachments/account-api-contract.md#L80 | AC-7 |  |
| attachments/account-api-contract.md#L81 | AC-7, E7 |  |
| attachments/account-api-contract.md#L82 | E8, G5 |  |
| attachments/account-api-contract.md#L86 | AC-8, R7, endpoint |  |
| attachments/account-api-contract.md#L88 | not-a-requirement | table header row |
| attachments/account-api-contract.md#L90 | AC-8 |  |
| attachments/account-api-contract.md#L91 | AC-8, E9 |  |
| attachments/account-api-contract.md#L92 | E10, G5 |  |
| attachments/account-api-contract.md#L96 | endpoint |  |
| attachments/account-api-contract.md#L98 | not-a-requirement | table header row |
| attachments/account-api-contract.md#L100 | AC-9 |  |
| attachments/account-api-contract.md#L101 | AC-9, E11, G4 |  |
| attachments/account-api-contract.md#L102 | E12, G5 |  |
| attachments/account-api-contract.md#L106-L114 | example, endpoint, G1 | sample createAccount request/response; confirms the /api prefix, form encoding and HTTP 200 with responseCode 201 |
