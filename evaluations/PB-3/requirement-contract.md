# Requirement contract — PB-3: Transfer funds between my own accounts

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, page and REST service, read-back endpoints and Accept header, test data, Gherkin AC-1..AC-7, out of scope, PO clarification replacing AC-6 |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | Transfer on the Transfer Funds page: when the customer transfers 25.50 from A to B on the Transfer Funds page, the page shows "Transfer Complete!" and "$25.50 has been transferred from account #<A> to account #<B>."; Accounts Overview shows the balance of A lower by $25.50 and the balance of B higher by $25.50, and the total shown on Accounts Overview is unchanged. | the page shows "Transfer Complete!"; the page shows "$25.50 has been transferred from account #<A> to account #<B>."; Accounts Overview shows the balance of A lower by $25.50 than before; Accounts Overview shows the balance of B higher by $25.50 than before; the total shown on Accounts Overview is unchanged | story.md#L30 |
| AC-2 | api | Transfer through the REST service: called with fromAccountId A, toAccountId B and amount 12.34, the service answers 200 with the text "Successfully transferred $12.34 from account #<A> to account #<B>"; GET /accounts/<A> returns a balance lower by 12.34 and GET /accounts/<B> a balance higher by 12.34. | the service answers 200; the body is the text "Successfully transferred $12.34 from account #<A> to account #<B>"; GET /accounts/<A> returns a balance lower by 12.34 than before; GET /accounts/<B> returns a balance higher by 12.34 than before | story.md#L37 |
| AC-3 | e2e | Transfers are listed as transactions on both accounts: after the customer transferred 25.50 from A to B on the Transfer Funds page, GET /accounts/<A>/transactions contains a "Debit" of 25.50 described "Funds Transfer Sent", GET /accounts/<B>/transactions contains a "Credit" of 25.50 described "Funds Transfer Received", and the Account Activity of A on the web page lists "Funds Transfer Sent" with $25.50 in the Debit (-) column. | GET /accounts/<A>/transactions contains a "Debit" of 25.50 described "Funds Transfer Sent"; GET /accounts/<B>/transactions contains a "Credit" of 25.50 described "Funds Transfer Received"; the Account Activity of A on the web page lists "Funds Transfer Sent" with $25.50 in the Debit (-) column | story.md#L42 |
| AC-4 | ui | Amount missing or not a number on the Transfer Funds page: when the customer enters "<amount>" as the amount and presses Transfer, the Transfer Funds form stays on screen with the message "<message>" and no balance changes (empty amount: "The amount cannot be empty."; abc: "Please enter a valid amount."). The PO comment confirms the input messages stay as written (story.md#L91). | empty amount: the Transfer Funds form stays on screen with the message "The amount cannot be empty."; amount abc: the Transfer Funds form stays on screen with the message "Please enter a valid amount."; no balance changes (A and B keep their balances) | story.md#L48 |
| AC-5 | e2e | Zero or negative amounts are refused: when the customer transfers 0 or -10.00 from A to B on the Transfer Funds page or through the service, the transfer is refused and the balances of A and B do not change. The PO comment confirms zero and negative amounts must still be refused (story.md#L91). | amount 0 on the Transfer Funds page: the transfer is refused (the page does not show "Transfer Complete!"); amount -10.00 on the Transfer Funds page: the transfer is refused (the page does not show "Transfer Complete!"); amount 0 through the service: the transfer is refused (the service does not answer with the success confirmation of AC-2); amount -10.00 through the service: the transfer is refused (the service does not answer with the success confirmation of AC-2); the balances of A and B do not change | story.md#L58 |
| AC-6 | e2e | Amount larger than the balance of the source account, as replaced by the Product Owner comment of 2026-09-26 (story.md#L86-L89): given the balance of A is lower than 1000.00, a transfer of 1000.00 from A to B completes like any other transfer (same confirmation on the page, 200 from the service); the balance of A then goes negative by the difference and B is credited with the full amount. | precondition: the balance of A is lower than 1000.00; through the service: a transfer of 1000.00 from A to B completes with 200 and the same confirmation text as any other transfer (the AC-2 confirmation, for the amount 1000.00); on the Transfer Funds page: a transfer of 1000.00 from A to B completes with the same confirmation as any other transfer ("Transfer Complete!"); the balance of A goes negative by the difference (previous balance of A minus 1000.00); B is credited with the full amount (balance of B higher by 1000.00) | story.md#L68 |
| AC-7 | api | Unknown destination account: called with fromAccountId A, toAccountId 99999999 and amount 5.00, the service answers 400 with the text "Could not find account number <A> and/or 99999999" and the balance of A does not change. | the service answers 400; the body is the text "Could not find account number <A> and/or 99999999"; the balance of A does not change | story.md#L74 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /transfer |  | 200 | story.md#L17 |
| GET /accounts/{accountId} |  |  | story.md#L19 |
| GET /accounts/{accountId}/transactions |  |  | story.md#L19 |

## Rules and boundaries

- **R1** Transfers between a customer's own accounts are allowed to overdraw the source account; the overdraft is covered by the customer's overdraft agreement and settled at end of day. A transfer larger than the balance of the source account completes like any other transfer (same confirmation on the page, 200 from the service); the source account's balance then goes negative by the difference, and the destination account is credited with the full amount. This replaces AC-6 as written. _(story.md#L86, story.md#L88-L89)_
- **R2** Zero and negative amounts are refused, on the Transfer Funds page and through the service, and the balances of A and B do not change; this still applies after the AC-6 change. _(story.md#L58-L66, story.md#L91)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | Transfer Funds page, amount empty: the form stays on screen, no balance changes |  | The amount cannot be empty. | story.md#L55, story.md#L48-L51 |
| E2 | Transfer Funds page, amount not a number (abc): the form stays on screen, no balance changes |  | Please enter a valid amount. | story.md#L56, story.md#L48-L51 |
| E3 | Amount 0 or -10.00, on the page or through the service: the transfer is refused and the balances do not change (message, status and body not stated, G2) |  |  | story.md#L58-L66 |
| E4 | Service called with an unknown destination account (toAccountId 99999999): the balance of A does not change | 400 | Could not find account number <A> and/or 99999999 | story.md#L74-L77 |

## Authentication

UI: a signed-in customer (each scenario registers its own customer first). REST: the sources state no authentication scheme for the service (G4). — credentials: unique user name per scenario; password from the environment variable PB_USER_PASSWORD _(story.md#L17, story.md#L21)_

## Test data

each scenario registers its own customer (unique user name, password from the environment variable PB_USER_PASSWORD) and opens a second account with "Open New Account", so the customer owns account A (the first account) and B (the newly opened one); the balances of A and B are read before the action
- the shared demo database may be reset at any time
- a fresh, unique user name per scenario
- password from the environment variable PB_USER_PASSWORD, never hard-coded
- A is the customer's first account, B the account opened with "Open New Account"
- AC-6 needs the balance of A to be lower than 1000.00 (starting balance not stated, G8)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | AC-6 as written (story.md#L68-L72: a transfer larger than the balance is refused because of insufficient funds, balances unchanged) conflicts with the PO comment (story.md#L86-L89: it completes, the source goes negative, the destination is credited in full) | oracle | yes | AC-6 | story | found-in-requirement: the transfer completes (same confirmation on the page, 200 from the service); A goes negative by the difference and B is credited with the full 1000.00 |
| G2 | what "the transfer is refused" looks like for amount 0 and -10.00: the message on the Transfer Funds page, and the HTTP status and body from the service | oracle | no | AC-5 | story → attachments | open |
| G3 | whether GET /accounts/{accountId} and GET /accounts/{accountId}/transactions sit under the same REST service base /parabank/services/bank as the transfer service, and how the transfer parameters are sent (query string as written, or form body) | mechanics | yes | AC-2, AC-3, AC-5, AC-6, AC-7 | story → aut | discovered-in-aut: all three endpoints under the REST base /parabank/services/bank (the profile's apiBaseURL); transfer parameters sent in the query string |
| G4 | authentication for the REST service calls (POST transfer and the GET read-backs): whether credentials are needed and how they are sent | mechanics | yes | AC-2, AC-3, AC-5, AC-6, AC-7 | story → aut | discovered-in-aut: no credentials are needed for the REST calls (sent without auth) |
| G5 | UI mechanics: registration page and fields, signing in, the "Open New Account" controls, the Transfer Funds form controls (amount, from and to accounts, the Transfer button), the Accounts Overview route and how balances and the total are shown, and the Account Activity page with its Debit (-) column | mechanics | yes | AC-1, AC-3, AC-4, AC-5, AC-6 | story → aut | discovered-in-aut: register.htm (ids customer.*), openaccount.htm (#fromAccountId, 'Open New Account', #newAccountId), transfer.htm (#amount, #fromAccountId, #toAccountId, 'Transfer'), overview.htm (#accountTable with a Total row), activity.htm?id=<account> (#transactionTable) |
| G6 | how a scenario obtains the account numbers of A and B (and any customer id) for the customer it registered | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 | story → aut | discovered-in-aut: A = the first account link on Accounts Overview right after registration; B = #newAccountId after 'Open New Account' |
| G7 | JSON field names: the balance in GET /accounts/{accountId}, and the type ("Debit"/"Credit"), amount and description in GET /accounts/{accountId}/transactions | mechanics | yes | AC-2, AC-3, AC-5, AC-6, AC-7 | story → aut | discovered-in-aut: GET /accounts/{accountId} -> balance; GET /accounts/{accountId}/transactions -> array of {type, amount, description} |
| G8 | how to make sure the balance of A is lower than 1000.00 for AC-6 (a newly registered customer's starting balance, and what opening B moves, are not stated) | mechanics | yes | AC-6 | story → aut | discovered-in-aut: no extra step needed: A's balance after registration and opening B is below 1000.00; the test asserts it as a precondition (BLOCKED otherwise) |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context, endpoint, auth, G3, G5 | user story: signed-in customer, Transfer Funds page transfer.htm, POST transfer service with its parameters |
| story.md#L19 | endpoint, context, G3, G7 | Accounts Overview, Account Activity, GET account and transactions endpoints, Accept: application/json |
| story.md#L21 | test-data, auth, G6, G8 |  |
| story.md#L23 | not-a-requirement | opening code fence of the Gherkin block |
| story.md#L24 | context | Gherkin feature title, same as the story summary |
| story.md#L26-L28 | test-data, context | Background shared by AC-1..AC-7: a newly registered customer owning A and B with known balances |
| story.md#L30-L35 | AC-1 |  |
| story.md#L37-L40 | AC-2 |  |
| story.md#L42-L46 | AC-3 |  |
| story.md#L48-L56 | AC-4, E1, E2 |  |
| story.md#L58-L66 | AC-5, R2, E3, G2 |  |
| story.md#L68-L72 | AC-6, G1, G8 |  |
| story.md#L74-L77 | AC-7, E4 |  |
| story.md#L78 | not-a-requirement | closing code fence of the Gherkin block |
| story.md#L80 | out-of-scope |  |
| story.md#L86 | G1, R1 | PO comment: own-account transfers may overdraw the source (captured in R1); AC-6 is replaced (G1). The reason given, that the overdraft "is covered by the customer's overdraft agreement and settled at end of day", is recorded in R1 as rationale; no criterion checks the agreement or the end-of-day settlement, which happens outside a scenario and has no stated observable outcome |
| story.md#L88-L89 | R1, AC-6, G1 |  |
| story.md#L91 | G1, R2, AC-4, AC-5 | nothing else changes: AC-5 refusals and AC-4 messages stay as written |
