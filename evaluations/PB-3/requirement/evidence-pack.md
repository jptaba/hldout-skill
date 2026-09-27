# Evidence pack — PB-3

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: PB-3
  L3   | summary: "Transfer funds between my own accounts"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/PB-3
  L10  | fetchedAt: 2026-09-27T05:31:48.841Z
  L11  | ---
  L12  | 
  L13  | # PB-3: Transfer funds between my own accounts
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | As a signed-in ParaBank customer I want to move money between my own accounts, on the "Transfer Funds" page (`transfer.htm`) or through the REST service `POST /parabank/services/bank/transfer?fromAccountId=…&toAccountId=…&amount=…`, so that I can cover payments from the right account.
  L18  | 
● L19  | Balances are read on Accounts Overview and the account details page (Account Activity), or with `GET /accounts/{accountId}` and `GET /accounts/{accountId}/transactions` (JSON with `Accept: application/json`).
  L20  | 
● L21  | Test data: the shared demo database may be reset at any time. Each scenario registers its own customer (unique user name, password from the environment variable `PB_USER_PASSWORD`) and opens a second account for that customer with "Open New Account", so that the customer owns two accounts A (the first account) and B (the newly opened one).
  L22  | 
● L23  | ```gherkin
● L24  | Feature: Transfer funds between own accounts
  L25  | 
● L26  |   Background:
● L27  |     Given a newly registered customer who owns accounts A and B
● L28  |     And the balances of A and B are known
  L29  | 
● L30  |   Scenario: AC-1 Transfer on the Transfer Funds page
● L31  |     When the customer transfers 25.50 from A to B on the Transfer Funds page
● L32  |     Then the page shows "Transfer Complete!"
● L33  |     And the page shows "$25.50 has been transferred from account #<A> to account #<B>."
● L34  |     And Accounts Overview shows the balance of A lower by $25.50 and the balance of B higher by $25.50
● L35  |     And the total shown on Accounts Overview is unchanged
  L36  | 
● L37  |   Scenario: AC-2 Transfer through the REST service
● L38  |     When the service is called with fromAccountId A, toAccountId B and amount 12.34
● L39  |     Then it answers 200 with the text "Successfully transferred $12.34 from account #<A> to account #<B>"
● L40  |     And GET /accounts/<A> returns a balance lower by 12.34 and GET /accounts/<B> a balance higher by 12.34
  L41  | 
● L42  |   Scenario: AC-3 Transfers are listed as transactions on both accounts
● L43  |     Given the customer transferred 25.50 from A to B on the Transfer Funds page
● L44  |     Then GET /accounts/<A>/transactions contains a "Debit" of 25.50 described "Funds Transfer Sent"
● L45  |     And GET /accounts/<B>/transactions contains a "Credit" of 25.50 described "Funds Transfer Received"
● L46  |     And the Account Activity of A on the web page lists "Funds Transfer Sent" with $25.50 in the Debit (-) column
  L47  | 
● L48  |   Scenario Outline: AC-4 Amount missing or not a number on the Transfer Funds page
● L49  |     When the customer enters "<amount>" as the amount and presses Transfer
● L50  |     Then the Transfer Funds form stays on screen with the message "<message>"
● L51  |     And no balance changes
  L52  | 
● L53  |     Examples:
● L54  |       | amount | message                      |
● L55  |       |        | The amount cannot be empty.  |
● L56  |       | abc    | Please enter a valid amount. |
  L57  | 
● L58  |   Scenario Outline: AC-5 Zero or negative amounts are refused
● L59  |     When the customer transfers <amount> from A to B on the Transfer Funds page or through the service
● L60  |     Then the transfer is refused
● L61  |     And the balances of A and B do not change
  L62  | 
● L63  |     Examples:
● L64  |       | amount |
● L65  |       | 0      |
● L66  |       | -10.00 |
  L67  | 
● L68  |   Scenario: AC-6 Amount larger than the balance of the source account
● L69  |     Given the balance of A is lower than 1000.00
● L70  |     When the customer transfers 1000.00 from A to B through the service
● L71  |     Then the transfer is refused because of insufficient funds
● L72  |     And the balances of A and B do not change
  L73  | 
● L74  |   Scenario: AC-7 Unknown destination account
● L75  |     When the service is called with fromAccountId A, toAccountId 99999999 and amount 5.00
● L76  |     Then it answers 400 with the text "Could not find account number <A> and/or 99999999"
● L77  |     And the balance of A does not change
● L78  | ```
  L79  | 
● L80  | Transfers to other customers' accounts are out of scope (a separate "Pay someone" story will cover them).
  L81  | 
  L82  | ## Comments (clarifications from the issue)
  L83  | 
  L84  | **Dana Whitfield (Product Owner)** — 2026-09-26:
  L85  | 
● L86  | Update after the review with Risk & Compliance on Tuesday: transfers between a customer's **own** accounts are allowed to overdraw the source account — the overdraft is covered by the customer's overdraft agreement and settled at end of day. So please treat scenario AC-6 as replaced by this:
  L87  | 
● L88  | - A transfer larger than the balance of the source account **completes** like any other transfer (same confirmation on the page, 200 from the service).
● L89  | - The source account's balance then goes negative by the difference, and the destination account is credited with the full amount.
  L90  | 
● L91  | Nothing else changes: zero and negative amounts must still be refused (AC-5), and the input messages in AC-4 stay as written.
  L92  | 
  L93  | 
  L94  | ## Attachments
  L95  | 
  L96  | _None_
  L97  | 
```
