# Requirement review — JS-2

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | context, AC-1..AC-6, out of scope, PO comment with the password rules, test data |
| attachments/api-contract.md | endpoints (register, security questions, login, add basket item, read basket, products), request/response bodies, Bearer auth, duplicate e-mail error |

## Testability decisions

_How each criterion is verified (write the decision after the arrow)._

- **AC-1** (api) Registering with a unique e-mail, a rule-compliant password (sent as both password and passwordRepeat), and a security question id + secu… →
- **AC-2** (api) Registering with an e-mail that already belongs to a customer is rejected with HTTP 400 and a validation error whose message states the e… →
- **AC-3** (api) Registration enforces the password rules in the PO comment: a password shorter than the minimum length is rejected with HTTP 400 and the … →
- **AC-4** (api) Logging in via POST /rest/user/login with a registered customer's correct e-mail and password returns HTTP 200 and a body containing an a… →
- **AC-5** (e2e) Using their own token, a customer can add a product to their own basket via POST /api/BasketItems; after that customer logs in through th… →
- **AC-6** (api) Basket contents are private to their owner: a customer must be able to read only their own basket. A request to GET /rest/basket/{id} aut… →

## Ambiguities / open questions

- G1 (mechanics, required): UI login page: its route and how the e-mail, password and log-in controls are found — open
- G2 (mechanics, required): basket page /#/basket: how the listed products and their quantities are found — open
- G3 (mechanics, required): how to observe that no second account was created for an already registered e-mail — open
- G4 (oracle): what answer counts as 'refused' when customer A requests customer B's basket: no status or error body is stated (401, 403, 404, or an error in a 200 body?). The outcome is judged as written: the request is refused and B's basket is not returned — open
- G5 (oracle): success status of POST /api/BasketItems is not stated; AC-5 is judged by the basket page listing the product — open
