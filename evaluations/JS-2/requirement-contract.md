# Requirement contract — JS-2: Customer registration, login and basket

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ⚠️ not reviewed

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | context, AC-1..AC-6 table, out of scope, PO comment with password rules |
| attachments/api-contract.md | endpoints, request/response shapes, Bearer auth, duplicate e-mail error |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | Registering with a unique e-mail, a rule-compliant password (sent as both password and passwordRepeat), and a security question id + security answer creates the customer: the response is HTTP 201 and its body describes the new user with the submitted email and role = customer. | HTTP 201; body data.email equals the submitted e-mail; body data.role = "customer" | story.md#L33 |
| AC-2 | api | Registering with an e-mail that already belongs to a customer is rejected with HTTP 400 and a validation error whose message states the e-mail must be unique. No second account is created. | second registration with the same e-mail → HTTP 400; validation error whose message states the e-mail must be unique; no second account is created | story.md#L34 |
| AC-3 | api | Registration enforces the password rules in the PO comment: a password shorter than the minimum length (5 characters) is rejected with HTTP 400 and the customer is not created (a follow-up login with that e-mail/password fails). | 4-character password → HTTP 400; 3-character password → HTTP 400; the customer is not created: a follow-up login with that e-mail/password fails | story.md#L35 |
| AC-4 | api | Logging in via POST /rest/user/login with a registered customer's correct e-mail and password returns HTTP 200 and a body containing an authentication token (a JWT used as a Bearer token) and the customer's basket id (bid). | HTTP 200; body authentication.token is present and is a JWT; body authentication.bid (the customer's basket id) is present | story.md#L36 |
| AC-5 | e2e | Using their own token, a customer can add a product to their own basket via POST /api/BasketItems; after that customer logs in through the UI, the basket page at /#/basket lists that product with the quantity that was added. | POST /api/BasketItems with the customer's own token and own bid adds the product to that basket; after the customer logs in through the UI, /#/basket lists that product; the listed quantity equals the quantity that was added | story.md#L37 |
| AC-6 | api | Basket contents are private to their owner: a customer must be able to read only their own basket. A request to GET /rest/basket/{id} authenticated as customer A but targeting customer B's basket id must be refused and must not return B's basket. Verify with two customers you create. | customer A can read A's own basket via GET /rest/basket/{A's bid}; GET /rest/basket/{B's bid} with A's token is refused; that response does not return B's basket (not B's basket id, UserId or Products) | story.md#L38 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /api/Users |  | HTTP 201, body { "data": { "id", "email", "role": "customer" } } | attachments/api-contract.md#L7 |
| GET /api/SecurityQuestions |  |  | attachments/api-contract.md#L24 |
| POST /rest/user/login |  | HTTP 200, body { "authentication": { "token": <JWT>, "bid": <basket id>, "umail": <e-mail> } } | attachments/api-contract.md#L27 |
| POST /api/BasketItems | required |  | attachments/api-contract.md#L38 |
| GET /rest/basket/{id} | required |  | attachments/api-contract.md#L45 |
| GET /api/Products |  |  | attachments/api-contract.md#L48 |

## Rules and boundaries

- **R1** The password must be at least 5 characters long; anything shorter than 5 characters must be rejected at registration and the account not created. _(story.md#L50)_
- **R2** The password must be at most 40 characters long (no status or message stated for a longer password; no AC exercises it). _(story.md#L50)_
- **R3** Treat the password as case-sensitive and store it hashed; per the PO this is not to be tested beyond a too-short password being refused. _(story.md#L51)_
- **R4** Each customer has exactly one basket. _(story.md#L20)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | Registering with an e-mail that already belongs to a customer: validation error whose message states the e-mail must be unique (exact wording not stated, see G6) | 400 |  | story.md#L34 |
| E2 | Registering with a password shorter than the minimum length (5 characters); the customer is not created | 400 |  | story.md#L35 |
| E3 | GET /rest/basket/{id} authenticated as customer A targeting customer B's basket id: refused, B's basket not returned (status not stated, see G4) |  |  | story.md#L38 |

## Authentication

Authorization: Bearer <token>, where token is the JWT returned by POST /rest/user/login in authentication.token — credentials: customers created by the tests themselves: unique e-mail per run, password from environment variable JS_USER_PASSWORD _(attachments/api-contract.md#L4)_

## Test data

Tests create their own customers via POST /api/Users with a unique e-mail per run; the password comes from environment variable JS_USER_PASSWORD (satisfies the password rules). Security-question ids from GET /api/SecurityQuestions; product ids from GET /api/Products. AC-6 uses two customers created by the test.
- unique e-mail per run
- password from JS_USER_PASSWORD (well above the 5-character minimum)
- AC-3 reject cases use a 3- or 4-character password

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | UI login journey for AC-5: login page route, e-mail/password field labels and submit control | mechanics | yes | AC-5 | story → attachments | open |
| G2 | how the basket page at /#/basket identifies a product (e.g. which product attribute is shown) and where it shows the quantity | mechanics | yes | AC-5 | story → attachments | open |
| G3 | success status/body of POST /api/BasketItems | oracle | no | AC-5 | story → attachments | open |
| G4 | what "refused" means for customer A reading customer B's basket (status and body not stated) | oracle | no | AC-6 | story → attachments | assumed: refused = the response is not a success (not 2xx); no specific status is asserted. The "must not return B's basket" outcome is asserted independently. |
| G5 | what a failed follow-up login looks like in AC-3 (status/body not stated) | oracle | no | AC-3 | story → attachments | assumed: the login fails = POST /rest/user/login does not answer HTTP 200 with an authentication token; no specific error status is asserted |
| G6 | exact wording of the duplicate e-mail validation message | oracle | no | AC-2 | story → attachments | assumed: the error message mentions that the e-mail must be unique (contains "unique", case-insensitive); no exact text is asserted |
| G7 | how to observe that no second account is created after a duplicate registration (no user lookup endpoint is named) | mechanics | no | AC-2 | story → attachments | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19-L22 | context, R4 | story context; L20 states one basket per customer |
| story.md#L24 | context | pointer to the attachment api-contract.md, which is part of this story's sources |
| story.md#L25 | context, test-data | pointer to the PO comment (L48-L54) and start of the test data statement |
| story.md#L26-L27 | test-data |  |
| story.md#L31 | not-a-requirement | table header row of the acceptance criteria table |
| story.md#L33 | AC-1 |  |
| story.md#L34 | AC-2, E1 |  |
| story.md#L35 | AC-3, E2 |  |
| story.md#L36 | AC-4 |  |
| story.md#L37 | AC-5, G1, G2 |  |
| story.md#L38 | AC-6, E3 |  |
| story.md#L42 | out-of-scope |  |
| story.md#L48 | context | PO comment intro: clarifies the password rules referenced by AC-1 and AC-3 (captured as R1, R2) |
| story.md#L50 | R1, R2, AC-3 |  |
| story.md#L51 | R3, out-of-scope | PO says case-sensitivity and hashing are not to be tested here |
| story.md#L53 | AC-3, example | 3- or 4-character password as reject cases |
| story.md#L54 | test-data, AC-1 | JS_USER_PASSWORD is well above the minimum, so AC-1 happy path is unaffected |
| attachments/api-contract.md#L3-L4 | context, auth |  |
| attachments/api-contract.md#L7 | endpoint |  |
| attachments/api-contract.md#L9-L18 | endpoint | POST /api/Users request body |
| attachments/api-contract.md#L19-L20 | AC-1, endpoint |  |
| attachments/api-contract.md#L22 | AC-2, E1, G6 |  |
| attachments/api-contract.md#L24 | endpoint, test-data |  |
| attachments/api-contract.md#L27 | endpoint |  |
| attachments/api-contract.md#L29 | endpoint |  |
| attachments/api-contract.md#L31-L35 | AC-4, endpoint, auth |  |
| attachments/api-contract.md#L38 | endpoint, auth |  |
| attachments/api-contract.md#L40 | endpoint |  |
| attachments/api-contract.md#L42 | AC-5, G3 |  |
| attachments/api-contract.md#L45 | endpoint, auth |  |
| attachments/api-contract.md#L47 | AC-6, endpoint |  |
| attachments/api-contract.md#L48 | endpoint, test-data |  |
