# Source: PB-3 — Transfer funds between my own accounts
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Transfer on the Transfer Funds page: when the customer transfers 25.50 from A to B on the Transfer Funds page, the page shows "Transfer Complete!" and "$25.50 has been transferred from account #<A> to account #<B>."; Accounts Overview shows the balance of A lower by $25.50 and the balance of B higher by $25.50, and the total shown on Accounts Overview is unchanged.
# AC-2: Transfer through the REST service: called with fromAccountId A, toAccountId B and amount 12.34, the service answers 200 with the text "Successfully transferred $12.34 from account #<A> to account #<B>"; GET /accounts/<A> returns a balance lower by 12.34 and GET /accounts/<B> a balance higher by 12.34.
# AC-3: Transfers are listed as transactions on both accounts: after the customer transferred 25.50 from A to B on the Transfer Funds page, GET /accounts/<A>/transactions contains a "Debit" of 25.50 described "Funds Transfer Sent", GET /accounts/<B>/transactions contains a "Credit" of 25.50 described "Funds Transfer Received", and the Account Activity of A on the web page lists "Funds Transfer Sent" with $25.50 in the Debit (-) column.
# AC-4: Amount missing or not a number on the Transfer Funds page: when the customer enters "<amount>" as the amount and presses Transfer, the Transfer Funds form stays on screen with the message "<message>" and no balance changes (empty amount: "The amount cannot be empty."; abc: "Please enter a valid amount."). The PO comment confirms the input messages stay as written (story.md#L91).
# AC-5: Zero or negative amounts are refused: when the customer transfers 0 or -10.00 from A to B on the Transfer Funds page or through the service, the transfer is refused and the balances of A and B do not change. The PO comment confirms zero and negative amounts must still be refused (story.md#L91).
# AC-6: Amount larger than the balance of the source account, as replaced by the Product Owner comment of 2026-09-26 (story.md#L86-L89): given the balance of A is lower than 1000.00, a transfer of 1000.00 from A to B completes like any other transfer (same confirmation on the page, 200 from the service); the balance of A then goes negative by the difference and B is credited with the full amount.
# AC-7: Unknown destination account: called with fromAccountId A, toAccountId 99999999 and amount 5.00, the service answers 400 with the text "Could not find account number <A> and/or 99999999" and the balance of A does not change.
#
# ENDPOINT: POST /transfer — 200
# ENDPOINT: GET /accounts/{accountId}
# ENDPOINT: GET /accounts/{accountId}/transactions
#
# ASSUMPTION: G1 — AC-6 is tested as replaced by the PO comment of 2026-09-26 (an overdrawing own-account transfer completes; A goes negative by the difference, B is credited in full).
# ASSUMPTION: AC-6 through the service — "the same confirmation as any other transfer" is the AC-2 sentence for the amount 1000.00; the story states no format for amounts of 1000 or more, so "$1000.00" and "$1,000.00" are both accepted.
# ASSUMPTION: each successful transfer asserts only the confirmation its own AC states (AC-1/AC-6 page: "Transfer Complete!"; AC-2/AC-6 service: 200 + confirmation text); AC-3 does not re-assert the AC-1 confirmation (one root cause, one failure).
# ASSUMPTION: G2 — for amounts 0 and -10.00 no message, status code or body is asserted (not asserted); "refused" is checked as "no success confirmation" plus "balances of A and B unchanged".
# OPEN-QUESTION: G2 — what "the transfer is refused" looks like for amount 0 and -10.00: the message on the Transfer Funds page, and the HTTP status and body from the service

@story:PB-3
Feature: Transfer funds between my own accounts
  As a signed-in ParaBank customer
  I want to move money between my own accounts on the Transfer Funds page or through the REST service
  So that I can cover payments from the right account

  Background:
    Given a newly registered customer who owns accounts A and B
    And the balances of A and B are known

  # from story.md#L30-L35 (AC-1)
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:ui
  Scenario: The customer transfers 25.50 from A to B on the Transfer Funds page
    Given I am signed in as a newly registered customer who owns accounts A and B
    And Accounts Overview shows the balances of A and B and the total
    And I am on the Transfer Funds page
    When I transfer 25.50 from A to B
    Then the page shows "Transfer Complete!"
    And the page shows "$25.50 has been transferred from account #<A> to account #<B>."
    And Accounts Overview shows the balance of A lower by $25.50
    And Accounts Overview shows the balance of B higher by $25.50
    And the total shown on Accounts Overview is unchanged

  # from story.md#L37-L40 (AC-2)
  @SCN-002 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario: The REST service transfers 12.34 from A to B
    Given a newly registered customer who owns accounts A and B
    And the balances of A and B are read with GET /accounts/{accountId}
    When the service is called with fromAccountId A, toAccountId B and amount 12.34
    Then it answers 200
    And the body is the text "Successfully transferred $12.34 from account #<A> to account #<B>"
    And GET /accounts/<A> returns a balance lower by 12.34
    And GET /accounts/<B> returns a balance higher by 12.34

  # from story.md#L42-L46 (AC-3)
  @SCN-003 @AC-3 @priority:P1 @type:integration @layer:e2e
  Scenario: A transfer made on the page is listed as a transaction on both accounts
    Given I am signed in as a newly registered customer who owns accounts A and B
    And I transferred 25.50 from A to B on the Transfer Funds page
    Then GET /accounts/<A>/transactions contains a "Debit" of 25.50 described "Funds Transfer Sent"
    And GET /accounts/<B>/transactions contains a "Credit" of 25.50 described "Funds Transfer Received"
    And the Account Activity of A lists "Funds Transfer Sent" with $25.50 in the Debit (-) column

  # from story.md#L48-L56 (AC-4)
  @SCN-004 @AC-4 @priority:P2 @type:negative @layer:ui
  Scenario Outline: An empty or non-numeric amount keeps the Transfer Funds form on screen
    Given I am signed in as a newly registered customer who owns accounts A and B
    And the balances of A and B are read with GET /accounts/{accountId}
    And I am on the Transfer Funds page
    When I enter "<amount>" as the amount and press Transfer
    Then the Transfer Funds form stays on screen with the message "<message>"
    And the balances of A and B do not change
    Examples:
      | amount | message                      |
      |        | The amount cannot be empty.  |
      | abc    | Please enter a valid amount. |

  # from story.md#L58-L66 (AC-5), story.md#L91
  @SCN-005 @AC-5 @priority:P1 @type:boundary @layer:ui
  Scenario Outline: A zero or negative amount is refused on the Transfer Funds page
    Given I am signed in as a newly registered customer who owns accounts A and B
    And the balances of A and B are read with GET /accounts/{accountId}
    And I am on the Transfer Funds page
    When I transfer <amount> from A to B
    Then the transfer is refused (the page does not show "Transfer Complete!")
    And the balances of A and B do not change
    Examples:
      | amount |
      | 0      |
      | -10.00 |

  # from story.md#L58-L66 (AC-5), story.md#L91
  @SCN-006 @AC-5 @priority:P1 @type:boundary @layer:api
  Scenario Outline: A zero or negative amount is refused by the REST service
    Given a newly registered customer who owns accounts A and B
    And the balances of A and B are read with GET /accounts/{accountId}
    When the service is called with fromAccountId A, toAccountId B and amount <amount>
    Then the transfer is refused (the service does not answer with the success confirmation of AC-2)
    And the balances of A and B do not change
    Examples:
      | amount |
      | 0      |
      | -10.00 |

  # from story.md#L68 (AC-6), PO comment story.md#L86-L89
  @SCN-007 @AC-6 @priority:P1 @type:boundary @layer:api
  Scenario: The REST service completes a transfer of 1000.00, more than the balance of A
    Given a newly registered customer who owns accounts A and B
    And the balance of A is lower than 1000.00
    When the service is called with fromAccountId A, toAccountId B and amount 1000.00
    Then it answers 200 with the same confirmation as any other transfer
    And the balance of A goes negative by the difference
    And B is credited with the full amount

  # from story.md#L68 (AC-6), PO comment story.md#L86-L89
  @SCN-008 @AC-6 @priority:P1 @type:boundary @layer:e2e
  Scenario: The Transfer Funds page completes a transfer of 1000.00, more than the balance of A
    Given I am signed in as a newly registered customer who owns accounts A and B
    And the balance of A is lower than 1000.00
    And I am on the Transfer Funds page
    When I transfer 1000.00 from A to B
    Then the page shows "Transfer Complete!"
    And the balance of A goes negative by the difference
    And B is credited with the full amount

  # from story.md#L74-L77 (AC-7)
  @SCN-009 @AC-7 @priority:P2 @type:negative @layer:api
  Scenario: The REST service refuses an unknown destination account
    Given a newly registered customer who owns account A
    And the balance of A is read with GET /accounts/{accountId}
    When the service is called with fromAccountId A, toAccountId 99999999 and amount 5.00
    Then it answers 400
    And the body is the text "Could not find account number <A> and/or 99999999"
    And the balance of A does not change
