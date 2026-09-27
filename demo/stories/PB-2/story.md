# PB-2: Open a new CHECKING or SAVINGS account online

**As a** signed-in ParaBank customer
**I want** to open an additional checking or savings account funded from one of my existing accounts
**so that** I can separate my money without visiting a branch.

## Background

The "Open New Account" page (`openaccount.htm`, Account Services menu) lets the customer pick the type of the new account and the existing account that funds the opening deposit. Partner apps use the REST service `POST /parabank/services/bank/createAccount?customerId=…&newAccountType=…&fromAccountId=…` for the same operation (see the OpenAPI description published by the application for the parameter encoding). Accounts are read back with `GET /customers/{customerId}/accounts` and `GET /accounts/{accountId}`; transactions with `GET /accounts/{accountId}/transactions`. Send `Accept: application/json` for JSON.

The business rules for opening an account (types, minimum opening deposit, funding) are in the attached **account-rules.csv**; they apply to the page and to the service alike.

Test customers: the demo database is shared and reset from time to time, so each check registers its own customer first (`register.htm`, unique user name, password from the environment variable `PB_USER_PASSWORD`). A newly registered customer starts with one CHECKING account that has a positive balance.

## Acceptance criteria

1. **AC-1 (UI)** The Open New Account page offers exactly the account types CHECKING and SAVINGS, lists the customer's existing accounts as funding accounts, and tells the customer the minimum opening deposit from the rules ("A minimum of $100.00 must be deposited into this account at time of opening.").
2. **AC-2 (UI)** Opening a SAVINGS account funded from the customer's first account shows "Account Opened!", "Congratulations, your account is now open." and "Your new account number:" followed by the number as a link; the link opens the account's details page showing Account Type SAVINGS and a balance of $100.00.
3. **AC-3 (UI + API)** After opening, the new account is listed in Accounts Overview with a balance of $100.00, and the funding account's balance is lower by $100.00 than before; `GET /customers/{customerId}/accounts` returns the new account with the chosen `type` and a `balance` of 100.00, and the funding account with the reduced balance.
4. **AC-4 (API)** `POST /createAccount` for a CHECKING account answers 200 and returns the new account: its `id`, the `customerId`, `type` CHECKING and its opening `balance` (100.00). `GET /accounts/{id}` for the returned id answers 200 with the same values.
5. **AC-5 (API)** The opening deposit is recorded as transactions per rules R8 and R9: the funding account shows a Debit of 100.00 "Funds Transfer Sent" and the new account a Credit of 100.00 "Funds Transfer Received".
6. **AC-6 (UI + API)** Opening an account follows the funding rules in account-rules.csv on the page and through the service.

## Notes

- Loan accounts are opened through "Request Loan" and are not part of this story.
- Closing accounts is not available yet.
