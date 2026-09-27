# Requirement contract — PB-1: Customer registration and sign-in

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T05:35

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, context (routes, REST base, test data, form fields), AC-1..AC-9, out of scope |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | Submitting the registration form with every field empty keeps the customer on the form and shows a message next to each required field: "First name is required.", "Last name is required.", "Address is required.", "City is required.", "State is required.", "Zip Code is required.", "Social Security Number is required.", "Username is required.", "Password is required.", "Password confirmation is required.". No message is shown for Phone #. | the customer stays on the registration form; "First name is required." next to First Name; "Last name is required." next to Last Name; "Address is required." next to Address; "City is required." next to City; "State is required." next to State; "Zip Code is required." next to Zip Code; "Social Security Number is required." next to SSN; "Username is required." next to Username; "Password is required." next to Password; "Password confirmation is required." next to Confirm; no message is shown for Phone # | story.md#L32 |
| AC-2 | e2e | When Password and Confirm differ, the form shows "Passwords did not match." and no customer is created (the user name cannot sign in afterwards). | the form shows "Passwords did not match."; no customer is created: the user name cannot sign in afterwards | story.md#L33 |
| AC-3 | ui | A complete, valid registration opens a page with the heading Welcome <username> (source: "Welcome _&lt;username&gt;_") and the text "Your account was created successfully. You are now logged in." The customer is signed in: the left panel greets them with Welcome <first name> <last name> (source: "Welcome _&lt;first name&gt; &lt;last name&gt;_") and shows the Account Services menu. | a page with the heading Welcome <username> (story: "Welcome _&lt;username&gt;_"); the text "Your account was created successfully. You are now logged in."; the left panel greets the customer with Welcome <first name> <last name> (story: "Welcome _&lt;first name&gt; &lt;last name&gt;_"); the left panel shows the Account Services menu | story.md#L34 |
| AC-4 | e2e | Registering again with a user name that is already taken shows "This username already exists." next to Username and does not change the existing customer (a REST login of the existing customer still returns their original first and last name). | "This username already exists." next to Username; a REST login of the existing customer still returns their original first and last name | story.md#L35 |
| AC-5 | ui | On the Customer Login panel, signing in with a wrong password shows an "Error!" page with "The username and password could not be verified."; signing in with both fields empty shows "Please enter a username and password." | wrong password: an "Error!" page with "The username and password could not be verified."; both fields empty: "Please enter a username and password." | story.md#L36 |
| AC-6 | ui | Signing in with the registered user name and password opens the Accounts Overview page, which lists at least one account for the new customer. "Log Out" returns to the home page with the Customer Login panel. | the Accounts Overview page opens; it lists at least one account for the new customer; "Log Out" returns to the home page with the Customer Login panel | story.md#L37 |
| AC-7 | api | GET /login/{username}/{password} with valid credentials answers 200 and returns the customer: id, firstName, lastName, address (street, city, state, zipCode) and phoneNumber, equal to the values entered at registration. With Accept: application/json the body is JSON; without it, XML with a customer root element. | 200; the body contains the customer's id; firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal the values entered at registration; with Accept: application/json the body is JSON; without Accept: application/json the body is XML with a customer root element | story.md#L38 |
| AC-8 | api | GET /login/{username}/{password} with a wrong password answers 400 with the body "Invalid username and/or password". | 400; body "Invalid username and/or password" | story.md#L39 |
| AC-9 | e2e | End to end: for a customer registered through the page, GET /customers/{id} (id from the login response) returns the same customer, and GET /customers/{id}/accounts returns the account(s) whose numbers are shown in the Accounts Overview. | GET /customers/{id} returns the same customer as the login response; GET /customers/{id}/accounts returns the account(s) whose numbers are shown in the Accounts Overview | story.md#L40 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /login/{username}/{password} |  | 200 | story.md#L38 |
| GET /customers/{id} |  |  | story.md#L40 |
| GET /customers/{id}/accounts |  |  | story.md#L40 |

## Rules and boundaries

- **R1** Registration form fields: First Name, Last Name, Address, City, State, Zip Code, Phone #, SSN, Username, Password, Confirm. Phone # is optional; all other fields are required. _(story.md#L26)_
- **R2** Every check starts by registering its own customer with a fresh, unique user name; the password comes from the environment variable PB_USER_PASSWORD (never hard-coded). _(story.md#L25)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | registration form submitted with every field empty (UI): one message per required field |  | "First name is required.", "Last name is required.", "Address is required.", "City is required.", "State is required.", "Zip Code is required.", "Social Security Number is required.", "Username is required.", "Password is required.", "Password confirmation is required." | story.md#L32 |
| E2 | Password and Confirm differ (UI) |  | Passwords did not match. | story.md#L33 |
| E3 | registration with a user name that is already taken (UI, next to Username) |  | This username already exists. | story.md#L35 |
| E4 | Customer Login panel, wrong password (UI "Error!" page) |  | The username and password could not be verified. | story.md#L36 |
| E5 | Customer Login panel, both fields empty (UI) |  | Please enter a username and password. | story.md#L36 |
| E6 | REST GET /login/{username}/{password} with a wrong password | 400 | Invalid username and/or password | story.md#L39 |

## Authentication

UI: user name and password on the Customer Login panel of the home page. REST: user name and password in the path of GET /login/{username}/{password}. — credentials: each check registers its own customer with a fresh, unique user name; password from the environment variable PB_USER_PASSWORD _(story.md#L23)_

## Test data

every check starts by registering its own customer with a fresh, unique user name (the shared demo database can be reset at any time)
- password from the environment variable PB_USER_PASSWORD, never hard-coded
- a fresh, unique user name per check

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | how an API-layer check creates its customer: the story states that every check registers its own customer, but names only the registration page (register.htm), no REST registration endpoint | mechanics | yes | AC-7, AC-8 | story → aut | discovered-in-aut: Customers are created through the registration page register.htm (UI seed wrapped in seed.create); no REST registration endpoint exists. No customer-deletion endpoint exists, so registered customers cannot be cleaned up |
| G2 | Customer Login panel locators (user name and password field labels, sign-in button), Accounts Overview route and how its account numbers are shown | mechanics | no | AC-5, AC-6, AC-9 | story → aut | discovered-in-aut: Login panel: input[name="username"], input[name="password"], button "Log In"; Accounts Overview route overview.htm, heading "Accounts Overview"; account numbers: links in #accountTable tbody |
| G3 | exact page/control locators on register.htm (submit button label, where each field message is rendered) and the left-panel element for the greeting and Account Services menu | mechanics | no | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-9 | story → aut | discovered-in-aut: Inputs by id ([id="customer.firstName"], … [id="customer.password"], [id="repeatedPassword"]); submit button "Register"; message = same table row as the field; greeting text + heading "Account Services" in the left panel |
| G4 | authentication for GET /customers/{id} and GET /customers/{id}/accounts: the story does not say whether these calls need credentials or how they are sent | mechanics | yes | AC-9 | story → aut | discovered-in-aut: No credentials are sent; both calls take only the customer id in the path |
| G5 | how "the user name cannot sign in afterwards" is observed: the story does not state what GET /login/{username}/{password} (or the Customer Login panel) answers for a user name that was never created | oracle | yes | AC-2 | story → user | assumed: Sign-in fails: GET /login/{username}/{password} with that user name and the password used does not answer 200 with a customer. No specific status or message is asserted. |
| G6 | what "returns the same customer" and "returns the account(s) whose numbers are shown" compare: which customer fields, and whether the account set must be equal or only contain the shown numbers | oracle | yes | AC-9 | story → user | assumed: GET /customers/{id} succeeds and its id, firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal those of the login response (the fields AC-7 lists); the account ids returned by GET /customers/{id}/accounts are exactly the account numbers shown in the Accounts Overview. |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17-L19 | context | user story: actor and goal; the REST authentication goal is made testable by AC-7 and AC-8 |
| story.md#L23 | context, auth | app root, registration page and link, Customer Login panel: entry points used by the UI ACs |
| story.md#L24 | endpoint | REST base and Accept: application/json header noted in each endpoint's request |
| story.md#L25 | test-data, R2 |  |
| story.md#L26 | R1 |  |
| story.md#L30 | not-a-requirement | table header row of the acceptance-criteria table |
| story.md#L32 | AC-1, E1 |  |
| story.md#L33 | AC-2, E2, G5 |  |
| story.md#L34 | AC-3 |  |
| story.md#L35 | AC-4, E3 |  |
| story.md#L36 | AC-5, E4, E5 |  |
| story.md#L37 | AC-6 |  |
| story.md#L38 | AC-7, endpoint |  |
| story.md#L39 | AC-8, E6 |  |
| story.md#L40 | AC-9, endpoint, G6 |  |
| story.md#L44 | out-of-scope |  |
