# Evidence pack — JS-2

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).
This pack is the whole requirement: the story, its acceptance-criteria field, comments and text attachments (`requirement/raw-issue.json` is the tracker's raw answer they came from; nothing to read there).

**Project configuration** (heldout.config.json: not requirement, nothing to cite or cover; a gap it answers is `found-in-config`):

- AUT profile `owasp-juice-shop` "OWASP Juice Shop": web http://localhost:3000/ (API on the same origin)


## story.md

```text
  L1   | ---
  L2   | key: JS-2
  L3   | summary: "Customer registration, login and basket"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/JS-2
  L10  | fetchedAt: 2026-09-28T20:52:37.839Z
  L11  | ---
  L12  | 
  L13  | # JS-2: Customer registration, login and basket
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## Context
  L18  | 
● L19  | A visitor can become a customer by registering, then log in to receive an authentication token, and use that  
● L20  | token to manage their shopping basket. Each customer has exactly one basket. This story covers the  
● L21  | registration rules, the login token, adding an item to one's **own** basket, and the isolation between  
● L22  | different customers' baskets.
  L23  | 
● L24  | The registration and login request/response details are in the attachment **api-contract.md**. Field-level  
● L25  | password rules are clarified by the product owner in the comment on this story. Tests create their own  
● L26  | customers with a unique e-mail per run; the password to use is provided out of band via the environment  
● L27  | variable `JS_USER_PASSWORD` (a value that satisfies the password rules).
  L28  | 
  L29  | ## Acceptance criteria
  L30  | 
  L31  | | ID | Criterion | Layer |
  L32  | | --- | --- | --- |
● L33  | | AC-1 | Registering with a unique e-mail, a rule-compliant password (sent as both `password` and `passwordRepeat`), and a security question id + security answer creates the customer: the response is **HTTP 201** and its body describes the new user with the submitted `email` and `role` = `customer`. | API |
● L34  | | AC-2 | Registering with an e-mail that already belongs to a customer is rejected with **HTTP 400** and a validation error whose message states the e-mail must be unique. No second account is created. | API |
● L35  | | AC-3 | Registration enforces the password rules in the PO comment: a password shorter than the minimum length is rejected with **HTTP 400** and the customer is **not** created (a follow-up login with that e-mail/password fails). | API |
● L36  | | AC-4 | Logging in via `POST /rest/user/login` with a registered customer's correct e-mail and password returns **HTTP 200** and a body containing an authentication **token** (a JWT used as a `Bearer` token) and the customer's basket id (`bid`). | API |
● L37  | | AC-5 | Using their own token, a customer can add a product to their own basket via `POST /api/BasketItems`; after that customer logs in through the UI, the basket page at `/#/basket` lists that product with the quantity that was added. | API + UI |
● L38  | | AC-6 | Basket contents are private to their owner: a customer must be able to read only their **own** basket. A request to `GET /rest/basket/{id}` authenticated as customer A but targeting customer B's basket id must be refused and must not return B's basket. Verify with two customers you create. | API (security) |
  L39  | 
  L40  | ## Out of scope
  L41  | 
● L42  | Checkout and payment; coupons; password reset; the "Remember me" option; deleting a basket item.
  L43  | 
  L44  | ## Comments (clarifications from the issue)
  L45  | 
  L46  | **Dana Ortiz (Product Owner)** — 2026-09-28:
  L47  | 
● L48  | Clarifying the password rules for AC-1 and AC-3, since the description just said "rule-compliant":
  L49  | 
● L50  | - The password must be **at least 5 characters** long (and at most 40). Anything shorter than 5 characters must be rejected at registration — the account should not be created.
● L51  | - Treat the password as case-sensitive and store it hashed (not our concern to test here beyond that a too-short password is refused).
  L52  | 
● L53  | So for AC-3, a 3- or 4-character password is a clear reject case. The `JS_USER_PASSWORD` value the tests use  
● L54  | is well above the minimum, so the happy-path AC-1 should not be affected.
  L55  | 
  L56  | 
  L57  | ## Attachments
  L58  | 
  L59  | | File | MIME | Bytes | How to read | Local path |
  L60  | | --- | --- | --- | --- | --- |
  L61  | | api-contract.md | text/markdown | 1645 | text — read directly | attachments/api-contract.md |
  L62  | 
```

## attachments/api-contract.md

```text
  L1   | # JS-2 API contract — registration, login, basket
  L2   | 
● L3   | All endpoints are on the shop's own origin. Request and response bodies are JSON
● L4   | (`Content-Type: application/json`). Authenticated calls use `Authorization: Bearer <token>`.
  L5   | 
  L6   | ## Register a customer
● L7   | `POST /api/Users`
  L8   | 
● L9   | Request body:
  L10  | ```json
● L11  | {
● L12  |   "email": "<unique e-mail>",
● L13  |   "password": "<password>",
● L14  |   "passwordRepeat": "<password>",
● L15  |   "securityQuestion": { "id": <one of the ids from GET /api/SecurityQuestions> },
● L16  |   "securityAnswer": "<answer>"
● L17  | }
  L18  | ```
● L19  | Success: **HTTP 201**, body `{ "status"?: ..., "data": { "id": <n>, "email": "...", "role": "customer", ... } }`
● L20  | (the response echoes the submitted e-mail and assigns `role` = `customer`).
  L21  | 
● L22  | Duplicate e-mail: **HTTP 400** with a validation error indicating the e-mail must be unique.
  L23  | 
● L24  | The list of valid security-question ids is available from `GET /api/SecurityQuestions`.
  L25  | 
  L26  | ## Log in
● L27  | `POST /rest/user/login`
  L28  | 
● L29  | Request body: `{ "email": "...", "password": "..." }`
  L30  | 
● L31  | Success: **HTTP 200**, body:
  L32  | ```json
● L33  | { "authentication": { "token": "<JWT>", "bid": <basket id>, "umail": "<e-mail>" } }
  L34  | ```
● L35  | The `token` is used as a `Bearer` token for authenticated calls. `bid` is the caller's basket id.
  L36  | 
  L37  | ## Add an item to a basket
● L38  | `POST /api/BasketItems`  (requires `Authorization: Bearer <token>`)
  L39  | 
● L40  | Request body: `{ "BasketId": <bid>, "ProductId": <product id>, "quantity": <n> }`
  L41  | 
● L42  | Adds the product to that basket.
  L43  | 
  L44  | ## Read a basket
● L45  | `GET /rest/basket/{id}`  (requires `Authorization: Bearer <token>`)
  L46  | 
● L47  | Returns the basket identified by `{id}`, including its `Products` array and the owning `UserId`.
● L48  | Valid product ids can be taken from `GET /api/Products`.
  L49  | 
```
