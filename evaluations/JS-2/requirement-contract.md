# Requirement contract — JS-2: Customer registration, login and basket

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-28T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | context, AC-1..AC-6, out of scope, PO comment with the password rules, test data |
| attachments/api-contract.md | endpoints (register, security questions, login, add basket item, read basket, products), request/response bodies, Bearer auth, duplicate e-mail error |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | Registering with a unique e-mail, a rule-compliant password (sent as both password and passwordRepeat), and a security question id + security answer creates the customer: the response is HTTP 201 and its body describes the new user with the submitted email and role = customer. | HTTP 201; the body describes the new user with the submitted `email` (in `data`, attachments/api-contract.md#L19-L20); the new user has `role` = `customer` | story.md#L33 |
| AC-2 | api | Registering with an e-mail that already belongs to a customer is rejected with HTTP 400 and a validation error whose message states the e-mail must be unique. No second account is created. | registering an already registered e-mail → HTTP 400; a validation error whose message states the e-mail must be unique; no second account is created for that e-mail | story.md#L34 |
| AC-3 | api | Registration enforces the password rules in the PO comment: a password shorter than the minimum length is rejected with HTTP 400 and the customer is not created (a follow-up login with that e-mail/password fails). | registering with a 4-character password → HTTP 400 (minimum is 5 characters, story.md#L50, story.md#L53); registering with a 3-character password → HTTP 400 (story.md#L53); the customer is not created: a follow-up login with that e-mail/password fails | story.md#L35 |
| AC-4 | api | Logging in via POST /rest/user/login with a registered customer's correct e-mail and password returns HTTP 200 and a body containing an authentication token (a JWT used as a Bearer token) and the customer's basket id (bid). | HTTP 200; the body contains an authentication `token` that is a JWT (`authentication.token`, attachments/api-contract.md#L33); the body contains the customer's basket id `bid` (`authentication.bid`, attachments/api-contract.md#L33) | story.md#L36 |
| AC-5 | e2e | Using their own token, a customer can add a product to their own basket via POST /api/BasketItems; after that customer logs in through the UI, the basket page at /#/basket lists that product with the quantity that was added. | the customer adds a product to their own basket (`BasketId` = their `bid`) via POST /api/BasketItems with their own token; after the customer logs in through the UI, the basket page at /#/basket lists that product; the basket page shows that product with the quantity that was added | story.md#L37 |
| AC-6 | api | Basket contents are private to their owner: a customer must be able to read only their own basket. A request to GET /rest/basket/{id} authenticated as customer A but targeting customer B's basket id must be refused and must not return B's basket. Verify with two customers you create. | customer A can read their own basket via GET /rest/basket/{id} with A's basket id; GET /rest/basket/{id} authenticated as customer A with customer B's basket id is refused; that response does not return B's basket | story.md#L38 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /api/SecurityQuestions |  | the list of valid security-question ids (status not stated) | attachments/api-contract.md#L24 |
| POST /api/Users |  | 201 {data:{id, email, role:"customer"}} | attachments/api-contract.md#L7 |
| POST /rest/user/login |  | 200 {authentication:{token, bid, umail}} | attachments/api-contract.md#L27 |
| GET /api/Products |  | valid product ids (status not stated) | attachments/api-contract.md#L48 |
| POST /api/BasketItems | required | adds the product to that basket (status not stated) | attachments/api-contract.md#L38 |
| GET /rest/basket/{id} | required | the basket identified by {id}, including its `Products` array and the owning `UserId` (status not stated) | attachments/api-contract.md#L45 |

## Rules and boundaries

- **R1** Each customer has exactly one basket. _(story.md#L20)_
- **R2** The password must be at least 5 characters long (and at most 40). Anything shorter than 5 characters must be rejected at registration and the account not created; a 3- or 4-character password is a clear reject case. _(story.md#L50, story.md#L53)_
- **R3** The password is case-sensitive and stored hashed (not tested here beyond that a too-short password is refused). _(story.md#L51)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | registering an e-mail that already belongs to a customer | 400 | a validation error whose message states the e-mail must be unique | story.md#L34, attachments/api-contract.md#L22 |
| E2 | registering with a password shorter than 5 characters | 400 |  | story.md#L35, story.md#L50 |
| E3 | reading another customer's basket (GET /rest/basket/{id} as customer A with customer B's basket id): refused, B's basket not returned (status not stated, see G4) |  |  | story.md#L38 |

## Authentication

Authorization: Bearer <token>, the JWT `token` returned by POST /rest/user/login — credentials: customers the tests register themselves with a unique e-mail per run; the password comes from the environment variable JS_USER_PASSWORD _(attachments/api-contract.md#L4, attachments/api-contract.md#L35, story.md#L25-L27)_

## Test data

tests create their own customers with a unique e-mail per run (POST /api/Users); the password is provided out of band via the environment variable JS_USER_PASSWORD, a value that satisfies the password rules
- JS_USER_PASSWORD is well above the 5-character minimum (story.md#L53-L54)
- valid security-question ids come from GET /api/SecurityQuestions
- valid product ids come from GET /api/Products (existing catalogue, not seeded)
- AC-6 is verified with two customers the tests create
- Cleanup: not stated in the sources

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | UI login page: its route and how the e-mail, password and log-in controls are found | mechanics | yes | AC-5 | story → attachments → aut | discovered-in-aut: #/login: #email, #password, #loginButton; lands on #/search (the profile's UI sign-in; its overlays close the welcome and cookie banners) |
| G2 | basket page /#/basket: how the listed products and their quantities are found | mechanics | yes | AC-5 | story → attachments → aut | discovered-in-aut: #/basket: a row per product (role row with its name), quantity in mat-cell.mat-column-quantity |
| G3 | how to observe that no second account was created for an already registered e-mail | mechanics | yes | AC-2 | story → attachments → aut | discovered-in-aut: logging in with the e-mail still signs in the first customer (same user id): no second account |
| G4 | what answer counts as 'refused' when customer A requests customer B's basket: no status or error body is stated (401, 403, 404, or an error in a 200 body?). The outcome is judged as written: the request is refused and B's basket is not returned | oracle | no | AC-6 | story → attachments | open |
| G5 | success status of POST /api/BasketItems is not stated; AC-5 is judged by the basket page listing the product | oracle | no | AC-5 | story → attachments | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19 | context |  |
| story.md#L20 | context, R1 |  |
| story.md#L21-L22 | context |  |
| story.md#L24 | context |  |
| story.md#L25 | context, test-data |  |
| story.md#L26-L27 | test-data, auth |  |
| story.md#L33 | AC-1 |  |
| story.md#L34 | AC-2, E1 |  |
| story.md#L35 | AC-3, E2 |  |
| story.md#L36 | AC-4 |  |
| story.md#L37 | AC-5 |  |
| story.md#L38 | AC-6, E3, test-data |  |
| story.md#L42 | out-of-scope |  |
| story.md#L48 | context | introduces the PO's password rules for AC-1 and AC-3 (captured as R2) |
| story.md#L50 | R2, E2 |  |
| story.md#L51 | R3, out-of-scope |  |
| story.md#L53 | AC-3, R2, test-data |  |
| story.md#L54 | test-data |  |
| attachments/api-contract.md#L3-L4 | endpoint, auth |  |
| attachments/api-contract.md#L7 | endpoint |  |
| attachments/api-contract.md#L9 | endpoint |  |
| attachments/api-contract.md#L11-L17 | endpoint |  |
| attachments/api-contract.md#L19-L20 | endpoint, AC-1 |  |
| attachments/api-contract.md#L22 | E1, AC-2 |  |
| attachments/api-contract.md#L24 | endpoint, test-data |  |
| attachments/api-contract.md#L27 | endpoint |  |
| attachments/api-contract.md#L29 | endpoint |  |
| attachments/api-contract.md#L31 | endpoint, AC-4 |  |
| attachments/api-contract.md#L33 | endpoint, AC-4 |  |
| attachments/api-contract.md#L35 | auth, AC-4 |  |
| attachments/api-contract.md#L38 | endpoint, auth |  |
| attachments/api-contract.md#L40 | endpoint |  |
| attachments/api-contract.md#L42 | endpoint, G5 |  |
| attachments/api-contract.md#L45 | endpoint, auth |  |
| attachments/api-contract.md#L47 | endpoint, AC-6 |  |
| attachments/api-contract.md#L48 | endpoint, test-data |  |
