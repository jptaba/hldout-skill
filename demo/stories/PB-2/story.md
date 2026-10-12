# PB-2: Moving money: transfers between my accounts and bill payments

As a ParaBank customer I want to transfer money between my own accounts and pay bills from them in online banking, and afterwards see exactly what happened on each account, so that I can trust the balances I'm shown. The mobile app does the same through the bank services API, so whatever holds on the pages has to hold there too.

What we expect:

- A customer with two accounts can transfer an amount from one to the other on "Transfer Funds". The sending account goes down by exactly that amount and the receiving account goes up by exactly that amount, the page confirms the amount and both account numbers, and the Accounts Overview shows the new balances.
- Each transfer shows up in the activity of both accounts: as money sent on the one and money received on the other, with the amount and the date the transfer was made. Opening an entry shows its details.
- An amount is a positive amount of money with at most two decimals. Anything else (nothing entered, text, zero, a negative amount, fractions of a cent) moves no money and leaves no entry in the history, and the customer is told what is wrong with the amount.
- Nobody can send or pay more than the account holds. A transfer or a payment never takes an account below zero; it is refused and the balances stay as they were.
- The sending and the receiving account have to be two different accounts.
- On "Bill Pay" the customer pays a bill from one of their accounts by giving the payee (name, address, city, state, zip code, phone number, and the payee's account number entered twice to avoid typing mistakes) and the amount. All payee details are required; a payment without them is not made. A payment lowers the account by exactly the amount, the page confirms payee, amount and account, and the account's activity shows the payment with the payee's name.
- With "Find Transactions" the customer finds entries of one of their accounts by transaction id, by date, by a date range or by amount, and gets the entries that match and no others. A search that matches nothing shows an empty result, not an error.
- A customer only moves money out of their own accounts and only sees the history of their own accounts. Another customer, or somebody who is not signed in, can do neither.

Notes from refinement: the API side is the bank services API under `/parabank/services/bank` (transfer, bill payment, an account's transactions and the searches on them, a single transaction); its description is linked from the site's pages. Scheduled and recurring payments, saved payees and transfers to other banks are not part of this. Test customers have to be registered for the purpose through the registration page, and a second account comes from "Open New Account"; please don't use customers that already exist.
