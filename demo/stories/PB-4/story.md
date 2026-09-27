# PB-4: Pay a bill and find the payment afterwards

Customers pay their utility and card bills from a ParaBank account on the "Bill Pay" page (`billpay.htm`) and look payments up later on "Find Transactions" (`findtrans.htm`). Partner apps use the REST service under `/parabank/services/bank`: `POST /billpay?accountId=…&amount=…` with the payee as the request body, and `GET /accounts/{accountId}/transactions/amount/{amount}` to look payments up (JSON with `Accept: application/json`).

Test customers are created by registering on `register.htm` with a unique user name and the password from the environment variable `PB_USER_PASSWORD`; the shared demo database may be reset at any time, so no pre-existing customer may be assumed.

## Requirements

The Bill Pay page shall require all payee fields and the payment data: when the customer presses "Send Payment" with the form empty, the system shall keep the form on screen, make no payment, and show next to the fields "Payee name is required.", "Address is required.", "City is required.", "State is required.", "Zip Code is required.", "Phone number is required.", "Account number is required." (for both Account # and Verify Account #) and "The amount cannot be empty.".

When the account number in "Verify Account #" differs from "Account #", the system shall show "The account numbers do not match." and shall not make the payment.

When the payee account number is not a number (letters such as "abcd"), the system shall show "Please enter a valid number."; when the amount is not a number at all (letters such as "ten"), it shall show "Please enter a valid amount."; in both cases no payment shall be made.

When the form is complete and valid, the system shall pay the bill from the account selected in "From account #" and shall show "Bill Payment Complete" and "Bill Payment to *&lt;payee name&gt;* in the amount of $*&lt;amount&gt;* from account *&lt;account number&gt;* was successful.", with the amount shown with two decimals.

The balance of the paying account shall decrease by the paid amount, both on Accounts Overview and in `GET /accounts/{accountId}`.

Find Transactions shall find the payment by amount: for the paying account and the paid amount, the results shall list a row with the description "Bill Payment to *&lt;payee name&gt;*" and the amount in the "Debit (-)" column. For an amount that is not a number, Find Transactions shall show "Invalid amount" instead of results.

The REST service shall return the same payment: `GET /accounts/{accountId}/transactions/amount/{amount}` shall answer 200 with a list containing a transaction of type "Debit", the paid amount, and the description "Bill Payment to *&lt;payee name&gt;*"; for an amount with no payment, it shall answer 200 with an empty list.

A payment made through `POST /billpay` shall answer 200 with the `payeeName`, `amount` and `accountId` of the payment, and shall afterwards be found on the Find Transactions page by its amount like a payment made on the page.

Bill payments shall reach the payee no later than the next business day after the customer submits them.
