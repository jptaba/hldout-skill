# PB-3: Transfer funds between my own accounts

As a signed-in ParaBank customer I want to move money between my own accounts, on the "Transfer Funds" page (`transfer.htm`) or through the REST service `POST /parabank/services/bank/transfer?fromAccountId=…&toAccountId=…&amount=…`, so that I can cover payments from the right account.

Balances are read on Accounts Overview and the account details page (Account Activity), or with `GET /accounts/{accountId}` and `GET /accounts/{accountId}/transactions` (JSON with `Accept: application/json`).

Test data: the shared demo database may be reset at any time. Each scenario registers its own customer (unique user name, password from the environment variable `PB_USER_PASSWORD`) and opens a second account for that customer with "Open New Account", so that the customer owns two accounts A (the first account) and B (the newly opened one).

```gherkin
Feature: Transfer funds between own accounts

  Background:
    Given a newly registered customer who owns accounts A and B
    And the balances of A and B are known

  Scenario: AC-1 Transfer on the Transfer Funds page
    When the customer transfers 25.50 from A to B on the Transfer Funds page
    Then the page shows "Transfer Complete!"
    And the page shows "$25.50 has been transferred from account #<A> to account #<B>."
    And Accounts Overview shows the balance of A lower by $25.50 and the balance of B higher by $25.50
    And the total shown on Accounts Overview is unchanged

  Scenario: AC-2 Transfer through the REST service
    When the service is called with fromAccountId A, toAccountId B and amount 12.34
    Then it answers 200 with the text "Successfully transferred $12.34 from account #<A> to account #<B>"
    And GET /accounts/<A> returns a balance lower by 12.34 and GET /accounts/<B> a balance higher by 12.34

  Scenario: AC-3 Transfers are listed as transactions on both accounts
    Given the customer transferred 25.50 from A to B on the Transfer Funds page
    Then GET /accounts/<A>/transactions contains a "Debit" of 25.50 described "Funds Transfer Sent"
    And GET /accounts/<B>/transactions contains a "Credit" of 25.50 described "Funds Transfer Received"
    And the Account Activity of A on the web page lists "Funds Transfer Sent" with $25.50 in the Debit (-) column

  Scenario Outline: AC-4 Amount missing or not a number on the Transfer Funds page
    When the customer enters "<amount>" as the amount and presses Transfer
    Then the Transfer Funds form stays on screen with the message "<message>"
    And no balance changes

    Examples:
      | amount | message                      |
      |        | The amount cannot be empty.  |
      | abc    | Please enter a valid amount. |

  Scenario Outline: AC-5 Zero or negative amounts are refused
    When the customer transfers <amount> from A to B on the Transfer Funds page or through the service
    Then the transfer is refused
    And the balances of A and B do not change

    Examples:
      | amount |
      | 0      |
      | -10.00 |

  Scenario: AC-6 Amount larger than the balance of the source account
    Given the balance of A is lower than 1000.00
    When the customer transfers 1000.00 from A to B through the service
    Then the transfer is refused because of insufficient funds
    And the balances of A and B do not change

  Scenario: AC-7 Unknown destination account
    When the service is called with fromAccountId A, toAccountId 99999999 and amount 5.00
    Then it answers 400 with the text "Could not find account number <A> and/or 99999999"
    And the balance of A does not change
```

Transfers to other customers' accounts are out of scope (a separate "Pay someone" story will cover them).
