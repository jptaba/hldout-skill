# PB-1: Opening a new account online

As a ParaBank customer I want to open an additional checking or savings account myself in online banking, funded from an account I already have, so that I don't have to visit a branch. The mobile app team needs the same through the bank services API.

## Background

Every new account must receive the minimum opening deposit. The deposit is taken from one of the customer's existing accounts, chosen by the customer when opening. The amount of the minimum deposit is set by the bank and is shown on the "Open New Account" page.

Web: "Open New Account" and "Accounts Overview" in the Account Services menu, after signing in.
API: the bank services API under `/parabank/services/bank` (its description is linked from the site's pages): opening an account, the list of a customer's accounts, one account's details and its transactions.

Test customers: register new ones through the registration page ("Register" on the home page). Don't use customers that already exist.

## Acceptance criteria

1. A signed-in customer can open a checking account or a savings account on the "Open New Account" page by choosing the account type and one of their own existing accounts to fund it from.
2. Opening the account moves exactly the minimum opening deposit from the funding account to the new account: the new account starts with that amount, the funding account is lower by that amount, and the total over all the customer's accounts is the same as before.
3. The confirmation shows the new account's number. Following it leads to the new account's details, with the right account type and balance.
4. The new account is listed in the Accounts Overview straight away with its balance, next to the funding account with its reduced balance, and the total shown is the sum of the listed balances.
5. When the funding account does not hold the minimum opening deposit, no account is opened, the customer is told why, and no balance changes. Opening an account never takes an account below zero.
6. Only checking and savings accounts can be opened this way. Loan accounts exist only as the result of an approved loan request. A request for any other account type is refused with a clear reason and nothing is created.
7. The same is available through the API: an account can be opened for a customer with an account type and a funding account, and the answer is the new account as it stands after opening (number, owner, type and opening balance). The customer's list of accounts and the account's own details show the same numbers as the web pages.
8. A customer opens accounts only for themselves and funds them only from their own accounts. Nobody else, signed in as a different customer or not signed in at all, can open an account in a customer's name or use a customer's money to fund one. This holds on the web pages and in the API.
9. The opening deposit is visible in the history of both accounts: as money sent from the funding account and as money received in the new account, for the same amount.

## Out of scope

Closing accounts, joint accounts, and changing the minimum deposit.
