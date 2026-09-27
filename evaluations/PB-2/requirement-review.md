# Requirement review — PB-2: Open a new CHECKING or SAVINGS account online

Written from `requirement/story.md`, `requirement/attachments/account-rules.csv` and the reviewed
`requirement-contract.json`, before any access to the application.

## Sources used

| Source | Contributes |
| --- | --- |
| story.md (Description, Background) | the actor (signed-in customer), the page `openaccount.htm`, the service `POST /createAccount` with `customerId`, `newAccountType`, `fromAccountId`, the read-back endpoints and `Accept: application/json`; the test-customer strategy (register per check, password from `PB_USER_PASSWORD`) |
| story.md (Acceptance criteria) | AC-1..AC-6, with the page copy ("A minimum of $100.00 must be deposited into this account at time of opening.", "Account Opened!", "Congratulations, your account is now open.", "Your new account number:") and the amounts |
| story.md (Notes) | out of scope: loan accounts, closing accounts (so opened accounts cannot be cleaned up) |
| attachments/account-rules.csv | business rules R1..R9: types, minimum opening deposit 100.00, funding from one of the customer's own accounts, the R5 rejection (funding balance >= 100.00), opening balance, funding balance after opening, the two transactions. Every rule applies to "page + service" |

## Testability decisions

| Clause | How it is verified |
| --- | --- |
| AC-1 "offers exactly the account types CHECKING and SAVINGS" | the type choice's option texts equal the set {CHECKING, SAVINGS} (no LOAN, nothing else) |
| AC-1 "lists the customer's existing accounts as funding accounts" | a customer seeded with two accounts: the funding choices equal exactly those two account numbers |
| AC-1 minimum-deposit text | the literal message is visible on the page |
| AC-2 confirmation + link | open SAVINGS from the first account on the page; the three texts are visible; the number after "Your new account number:" is a link; following it shows Account Type SAVINGS and balance $100.00 |
| AC-3 "funding account's balance is lower by $100.00 than before" | the funding balance is read (Accounts Overview and the API) right before opening and compared after; the test customer is private to the test, so nothing else moves the balance |
| AC-3 API part | `GET /customers/{customerId}/accounts` after the page opening: the new account has the chosen type and balance 100.00, the funding account has the previous balance minus 100.00 |
| AC-4 | the service call is the action; the response body's `id`, `customerId`, `type`, `balance` are checked, then `GET /accounts/{id}` must return the same four values |
| AC-5 | after an opening (service and page), `GET /accounts/{id}/transactions` of the funding account contains a Debit of 100.00 "Funds Transfer Sent" and that of the new account a Credit of 100.00 "Funds Transfer Received" |
| AC-6 R4 | a customer with two accounts opens a new account funded from the second (not the first) account: only the chosen account is debited (page and service) |
| AC-6 R5 (>= 100.00 opens) | boundary: a funding account holding exactly 100.00 opens the account (service and page) |
| AC-6 R5 (< 100.00 refused) | boundary: a funding account holding 99.99 is refused: no new account, funding balance unchanged, and an error is reported (page: no "Account Opened!" confirmation and an error is shown; service: the call does not answer 200 with a new account). G6 is open, so no message or status code is asserted |
| AC-6 R7 | covered by the AC-3 scenario (page) and a service scenario comparing the funding balance before/after |
| R1/R2 on both channels | CHECKING and SAVINGS are each opened on the page and through the service across the scenarios |

Seeding (mechanics, discovered during hardening): customers are registered on `register.htm` (the only
route the story gives); the customer id and account ids, funding accounts with an exact balance (100.00,
99.99) and the service's authentication are open mechanics gaps G1–G5, G8.

## Ambiguities / open questions

| Gap | Handling |
| --- | --- |
| G6 — what the R5 error looks like (message, status, body) | open oracle gap: the R5 rejection scenarios assert only what the rule states (not opened, no money moved, an error is reported in some form) and are tagged `@needs-clarification`; no message or status code is asserted |
| G7 — funding from another customer's account through the service | open oracle gap: tested with the most literal reading of R4 ("moved from one existing account of the same customer": the other customer's account must not be debited and no account is opened from it), tagged `@needs-clarification` |
| "funded from the customer's first account" (AC-2) | read as the first account the customer has (the one created at registration, first in the funding list) |
| cleanup | closing accounts is not available (story Notes), so opened accounts and registered customers remain; every customer has a unique user name |

## Revisions

None.
