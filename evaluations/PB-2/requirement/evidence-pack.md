# Evidence pack — PB-2

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: PB-2
  L3   | summary: "Open a new CHECKING or SAVINGS account online"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/PB-2
  L10  | fetchedAt: 2026-09-27T05:31:48.128Z
  L11  | ---
  L12  | 
  L13  | # PB-2: Open a new CHECKING or SAVINGS account online
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | **As a** signed-in ParaBank customer  
● L18  | **I want** to open an additional checking or savings account funded from one of my existing accounts  
● L19  | **so that** I can separate my money without visiting a branch.
  L20  | 
  L21  | ## Background
  L22  | 
● L23  | The "Open New Account" page (`openaccount.htm`, Account Services menu) lets the customer pick the type of the new account and the existing account that funds the opening deposit. Partner apps use the REST service `POST /parabank/services/bank/createAccount?customerId=…&newAccountType=…&fromAccountId=…` for the same operation (see the OpenAPI description published by the application for the parameter encoding). Accounts are read back with `GET /customers/{customerId}/accounts` and `GET /accounts/{accountId}`; transactions with `GET /accounts/{accountId}/transactions`. Send `Accept: application/json` for JSON.
  L24  | 
● L25  | The business rules for opening an account (types, minimum opening deposit, funding) are in the attached **account-rules.csv**; they apply to the page and to the service alike.
  L26  | 
● L27  | Test customers: the demo database is shared and reset from time to time, so each check registers its own customer first (`register.htm`, unique user name, password from the environment variable `PB_USER_PASSWORD`). A newly registered customer starts with one CHECKING account that has a positive balance.
  L28  | 
  L29  | ## Acceptance criteria
  L30  | 
● L31  | 1. **AC-1 (UI)** The Open New Account page offers exactly the account types CHECKING and SAVINGS, lists the customer's existing accounts as funding accounts, and tells the customer the minimum opening deposit from the rules ("A minimum of $100.00 must be deposited into this account at time of opening.").
● L32  | 2. **AC-2 (UI)** Opening a SAVINGS account funded from the customer's first account shows "Account Opened!", "Congratulations, your account is now open." and "Your new account number:" followed by the number as a link; the link opens the account's details page showing Account Type SAVINGS and a balance of $100.00.
● L33  | 3. **AC-3 (UI + API)** After opening, the new account is listed in Accounts Overview with a balance of $100.00, and the funding account's balance is lower by $100.00 than before; `GET /customers/{customerId}/accounts` returns the new account with the chosen `type` and a `balance` of 100.00, and the funding account with the reduced balance.
● L34  | 4. **AC-4 (API)** `POST /createAccount` for a CHECKING account answers 200 and returns the new account: its `id`, the `customerId`, `type` CHECKING and its opening `balance` (100.00). `GET /accounts/{id}` for the returned id answers 200 with the same values.
● L35  | 5. **AC-5 (API)** The opening deposit is recorded as transactions per rules R8 and R9: the funding account shows a Debit of 100.00 "Funds Transfer Sent" and the new account a Credit of 100.00 "Funds Transfer Received".
● L36  | 6. **AC-6 (UI + API)** Opening an account follows the funding rules in account-rules.csv on the page and through the service.
  L37  | 
  L38  | ## Notes
  L39  | 
● L40  | - Loan accounts are opened through "Request Loan" and are not part of this story.
● L41  | - Closing accounts is not available yet.
  L42  | 
  L43  | ## Attachments
  L44  | 
  L45  | | File | MIME | Bytes | How to read | Local path |
  L46  | | --- | --- | --- | --- | --- |
  L47  | | account-rules.csv | text/csv | 985 | text — read directly | attachments/account-rules.csv |
  L48  | 
```

## attachments/account-rules.csv

```text
● L1   | rule_id,account_type,rule,value,channel
● L2   | R1,CHECKING,Can be opened online by a signed-in customer,yes,page + service
● L3   | R2,SAVINGS,Can be opened online by a signed-in customer,yes,page + service
● L4   | R3,ALL,Minimum opening deposit (USD),100.00,page + service
● L5   | R4,ALL,Opening deposit is moved from one existing account of the same customer (the funding account),funding account chosen by the customer,page + service
● L6   | R5,ALL,The funding account must hold at least the minimum opening deposit; otherwise the new account is not opened and the customer gets an error,balance >= 100.00,page + service
● L7   | R6,ALL,Opening balance of the new account,equal to the opening deposit (100.00),page + service
● L8   | R7,ALL,Funding account balance after opening,previous balance minus the opening deposit,page + service
● L9   | R8,ALL,Transaction recorded on the funding account,Debit 100.00 'Funds Transfer Sent',page + service
● L10  | R9,ALL,Transaction recorded on the new account,Credit 100.00 'Funds Transfer Received',page + service
  L11  | 
```
