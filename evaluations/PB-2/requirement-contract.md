# Requirement contract — PB-2: Open a new CHECKING or SAVINGS account online

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, background (page, REST service and read-back endpoints, Accept header), test customers, AC-1..AC-6, notes (out of scope) |
| attachments/account-rules.csv | business rules R1..R9 (types, minimum opening deposit, funding, balances, transactions) |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | The Open New Account page offers exactly the account types CHECKING and SAVINGS, lists the customer's existing accounts as funding accounts, and tells the customer the minimum opening deposit from the rules ("A minimum of $100.00 must be deposited into this account at time of opening."). | the account type choices are exactly CHECKING and SAVINGS; the funding account choices list the customer's existing accounts; the page shows "A minimum of $100.00 must be deposited into this account at time of opening." | story.md#L31 |
| AC-2 | ui | Opening a SAVINGS account funded from the customer's first account shows "Account Opened!", "Congratulations, your account is now open." and "Your new account number:" followed by the number as a link; the link opens the account's details page showing Account Type SAVINGS and a balance of $100.00. | the page shows "Account Opened!"; the page shows "Congratulations, your account is now open."; the page shows "Your new account number:" followed by the new account number as a link; the link opens the account's details page showing Account Type SAVINGS; the details page shows a balance of $100.00 | story.md#L32 |
| AC-3 | e2e | After opening, the new account is listed in Accounts Overview with a balance of $100.00, and the funding account's balance is lower by $100.00 than before; GET /customers/{customerId}/accounts returns the new account with the chosen type and a balance of 100.00, and the funding account with the reduced balance. | Accounts Overview lists the new account with a balance of $100.00; Accounts Overview shows the funding account's balance lower by $100.00 than before opening; GET /customers/{customerId}/accounts returns the new account with the chosen type; GET /customers/{customerId}/accounts returns the new account with a balance of 100.00; GET /customers/{customerId}/accounts returns the funding account with its balance reduced by 100.00 | story.md#L33 |
| AC-4 | api | POST /createAccount for a CHECKING account answers 200 and returns the new account: its id, the customerId, type CHECKING and its opening balance (100.00). GET /accounts/{id} for the returned id answers 200 with the same values. | POST /createAccount for a CHECKING account answers 200; the body is the new account with its id; the body's customerId is the customer's id; the body's type is CHECKING; the body's balance is 100.00; GET /accounts/{id} for the returned id answers 200; GET /accounts/{id} returns the same id, customerId, type and balance | story.md#L34 |
| AC-5 | api | The opening deposit is recorded as transactions per rules R8 and R9: the funding account shows a Debit of 100.00 "Funds Transfer Sent" and the new account a Credit of 100.00 "Funds Transfer Received". | the funding account's transactions include a Debit of 100.00 "Funds Transfer Sent"; the new account's transactions include a Credit of 100.00 "Funds Transfer Received" | story.md#L35 |
| AC-6 | e2e | Opening an account follows the funding rules in account-rules.csv on the page and through the service. | R4: the opening deposit is moved from the funding account chosen by the customer, one of the customer's own existing accounts (page and service); R5: with a funding account holding at least 100.00 (balance >= 100.00) the new account is opened (page and service); R5: with a funding account holding less than 100.00 the new account is not opened and the customer gets an error (page and service); R7: after opening, the funding account balance is the previous balance minus the opening deposit (page and service) | story.md#L36 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /createAccount |  | 200 | story.md#L23, story.md#L34 |
| GET /customers/{customerId}/accounts |  |  | story.md#L23 |
| GET /accounts/{accountId} |  | 200 | story.md#L23 |
| GET /accounts/{accountId}/transactions |  |  | story.md#L23 |
| POST /transfer |  |  | G5 |

## Rules and boundaries

- **R1** CHECKING: can be opened online by a signed-in customer (yes; page + service). _(attachments/account-rules.csv#L2)_
- **R2** SAVINGS: can be opened online by a signed-in customer (yes; page + service). _(attachments/account-rules.csv#L3)_
- **R3** All types: minimum opening deposit (USD) 100.00 (page + service). _(attachments/account-rules.csv#L4)_
- **R4** All types: the opening deposit is moved from one existing account of the same customer (the funding account), chosen by the customer (page + service). _(attachments/account-rules.csv#L5)_
- **R5** All types: the funding account must hold at least the minimum opening deposit (balance >= 100.00); otherwise the new account is not opened and the customer gets an error (page + service). _(attachments/account-rules.csv#L6)_
- **R6** All types: the opening balance of the new account is equal to the opening deposit (100.00) (page + service). _(attachments/account-rules.csv#L7)_
- **R7** All types: funding account balance after opening is the previous balance minus the opening deposit (page + service). _(attachments/account-rules.csv#L8)_
- **R8** All types: transaction recorded on the funding account: Debit 100.00 'Funds Transfer Sent' (page + service). _(attachments/account-rules.csv#L9)_
- **R9** All types: transaction recorded on the new account: Credit 100.00 'Funds Transfer Received' (page + service). _(attachments/account-rules.csv#L10)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | the funding account holds less than the minimum opening deposit (100.00): the new account is not opened and the customer gets an error (page and service). The sources state no message, status or body (G6) |  |  | attachments/account-rules.csv#L6 |

## Authentication

UI: a signed-in customer (each check registers its own customer on register.htm first). REST: the sources state no authentication scheme for the service (G3). — credentials: unique user name per check; password from the environment variable PB_USER_PASSWORD _(story.md#L17, story.md#L27)_

## Test data

each check registers its own customer first on register.htm (unique user name, password from the environment variable PB_USER_PASSWORD); the demo database is shared and reset from time to time
- a fresh, unique user name per check
- password from the environment variable PB_USER_PASSWORD, never hard-coded
- a newly registered customer starts with one CHECKING account that has a positive balance (amount not stated, G5)
- Cleanup: none stated; closing accounts is not available yet (story.md#L41), so opened accounts stay

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | request encoding for POST /createAccount (how customerId, newAccountType and fromAccountId are sent, and how the types CHECKING/SAVINGS are encoded in newAccountType), and confirmation that the read-back endpoints sit under the same service base /parabank/services/bank | mechanics | yes | AC-4, AC-5, AC-6 | story → aut | discovered-in-aut: query parameters customerId, newAccountType (0 = CHECKING, 1 = SAVINGS), fromAccountId; base /parabank/services/bank for every endpoint |
| G2 | how a check obtains the customerId and the ids of the customer's existing accounts for the customer it registered on register.htm | mechanics | yes | AC-3, AC-4, AC-5, AC-6 | story → aut | discovered-in-aut: customerId and first account id from the Accounts Overview page's own GET customers/{customerId}/accounts request after registration |
| G3 | authentication for the REST service calls (POST /createAccount and the GET read-backs): whether credentials are needed and how they are sent | mechanics | yes | AC-3, AC-4, AC-5, AC-6 | story → aut | discovered-in-aut: no credentials are sent (the service accepts unauthenticated calls) |
| G4 | UI mechanics: how the registered customer is signed in, the controls on openaccount.htm (account type and funding account choices, the submit button label), the Accounts Overview route and how balances are shown, and the labels on the account details page | mechanics | no | AC-1, AC-2, AC-3, AC-6 | story → aut | discovered-in-aut: sign in by registering; #type/#fromAccountId/"Open New Account"; overview.htm table (account link, balance in column 2); activity.htm #accountType/#balance |
| G5 | how to get funding accounts with a known balance: at least 100.00 for the opening checks, and below 100.00 for the R5 rejection check (a new customer's CHECKING account has a positive balance of unstated amount) | mechanics | yes | AC-2, AC-3, AC-4, AC-5, AC-6 | story → attachments → aut | discovered-in-aut: second account via POST /createAccount + POST /transfer of the difference; exact balance verified before the action |
| G6 | what "the customer gets an error" looks like when the funding account holds less than 100.00: the page message, and the service's HTTP status and body | oracle | no | AC-6 | story → attachments | open |
| G7 | what must happen when the service is asked to fund the new account from an account that does not belong to the customer (R4: "one existing account of the same customer"): no outcome, status or message is stated | oracle | no | AC-6 | story → attachments | open |
| G8 | how a transaction's Debit/Credit, amount and description ("Funds Transfer Sent" / "Funds Transfer Received") are represented in the GET /accounts/{accountId}/transactions response (field names) | mechanics | no | AC-5 | story → aut | discovered-in-aut: fields type (Debit/Credit), amount (number), description (string) |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17-L19 | context | user story: signed-in customer opens an additional checking or savings account funded from an existing account |
| story.md#L23 | endpoint, context, G1 | page openaccount.htm, POST createAccount with its parameters, read-back and transactions endpoints, Accept: application/json |
| story.md#L25 | context, AC-6 | pointer to account-rules.csv; the rules are captured as R1..R9 and apply to page and service |
| story.md#L27 | test-data, auth, G2, G5 |  |
| story.md#L31 | AC-1 |  |
| story.md#L32 | AC-2 |  |
| story.md#L33 | AC-3 |  |
| story.md#L34 | AC-4 |  |
| story.md#L35 | AC-5 |  |
| story.md#L36 | AC-6 |  |
| story.md#L40-L41 | out-of-scope |  |
| attachments/account-rules.csv#L1 | not-a-requirement | CSV header row (column names) |
| attachments/account-rules.csv#L2 | R1, AC-1 |  |
| attachments/account-rules.csv#L3 | R2, AC-1 |  |
| attachments/account-rules.csv#L4 | R3, AC-1 |  |
| attachments/account-rules.csv#L5 | R4, AC-6, G7 |  |
| attachments/account-rules.csv#L6 | R5, AC-6, E1, G6 |  |
| attachments/account-rules.csv#L7 | R6, AC-2, AC-3, AC-4 |  |
| attachments/account-rules.csv#L8 | R7, AC-3, AC-6 |  |
| attachments/account-rules.csv#L9 | R8, AC-5 |  |
| attachments/account-rules.csv#L10 | R9, AC-5 |  |
