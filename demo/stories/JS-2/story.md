# JS-2: Customer registration, login and basket

## Context
A visitor can become a customer by registering, then log in to receive an authentication token, and use that
token to manage their shopping basket. Each customer has exactly one basket. This story covers the
registration rules, the login token, adding an item to one's **own** basket, and the isolation between
different customers' baskets.

The registration and login request/response details are in the attachment **api-contract.md**. Field-level
password rules are clarified by the product owner in the comment on this story. Tests create their own
customers with a unique e-mail per run; the password to use is provided out of band via the environment
variable `JS_USER_PASSWORD` (a value that satisfies the password rules).

## Acceptance criteria

| ID   | Criterion | Layer |
|------|-----------|-------|
| AC-1 | Registering with a unique e-mail, a rule-compliant password (sent as both `password` and `passwordRepeat`), and a security question id + security answer creates the customer: the response is **HTTP 201** and its body describes the new user with the submitted `email` and `role` = `customer`. | API |
| AC-2 | Registering with an e-mail that already belongs to a customer is rejected with **HTTP 400** and a validation error whose message states the e-mail must be unique. No second account is created. | API |
| AC-3 | Registration enforces the password rules in the PO comment: a password shorter than the minimum length is rejected with **HTTP 400** and the customer is **not** created (a follow-up login with that e-mail/password fails). | API |
| AC-4 | Logging in via `POST /rest/user/login` with a registered customer's correct e-mail and password returns **HTTP 200** and a body containing an authentication **token** (a JWT used as a `Bearer` token) and the customer's basket id (`bid`). | API |
| AC-5 | Using their own token, a customer can add a product to their own basket via `POST /api/BasketItems`; after that customer logs in through the UI, the basket page at `/#/basket` lists that product with the quantity that was added. | API + UI |
| AC-6 | Basket contents are private to their owner: a customer must be able to read only their **own** basket. A request to `GET /rest/basket/{id}` authenticated as customer A but targeting customer B's basket id must be refused and must not return B's basket. Verify with two customers you create. | API (security) |

## Out of scope
Checkout and payment; coupons; password reset; the "Remember me" option; deleting a basket item.
