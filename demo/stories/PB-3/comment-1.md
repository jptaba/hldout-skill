Author: Dana Whitfield (Product Owner)

Update after the review with Risk & Compliance on Tuesday: transfers between a customer's **own** accounts are allowed to overdraw the source account — the overdraft is covered by the customer's overdraft agreement and settled at end of day. So please treat scenario AC-6 as replaced by this:

- A transfer larger than the balance of the source account **completes** like any other transfer (same confirmation on the page, 200 from the service).
- The source account's balance then goes negative by the difference, and the destination account is credited with the full amount.

Nothing else changes: zero and negative amounts must still be refused (AC-5), and the input messages in AC-4 stay as written.
