# Source: PB-2 — Open a new CHECKING or SAVINGS account online
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
# Attachments used: account-rules.csv (rules R1..R9: types, minimum opening deposit, funding, balances, transactions)
#
# Acceptance criteria (verbatim from the contract):
# AC-1: The Open New Account page offers exactly the account types CHECKING and SAVINGS, lists the customer's existing accounts as funding accounts, and tells the customer the minimum opening deposit from the rules ("A minimum of $100.00 must be deposited into this account at time of opening.").
# AC-2: Opening a SAVINGS account funded from the customer's first account shows "Account Opened!", "Congratulations, your account is now open." and "Your new account number:" followed by the number as a link; the link opens the account's details page showing Account Type SAVINGS and a balance of $100.00.
# AC-3: After opening, the new account is listed in Accounts Overview with a balance of $100.00, and the funding account's balance is lower by $100.00 than before; GET /customers/{customerId}/accounts returns the new account with the chosen type and a balance of 100.00, and the funding account with the reduced balance.
# AC-4: POST /createAccount for a CHECKING account answers 200 and returns the new account: its id, the customerId, type CHECKING and its opening balance (100.00). GET /accounts/{id} for the returned id answers 200 with the same values.
# AC-5: The opening deposit is recorded as transactions per rules R8 and R9: the funding account shows a Debit of 100.00 "Funds Transfer Sent" and the new account a Credit of 100.00 "Funds Transfer Received".
# AC-6: Opening an account follows the funding rules in account-rules.csv on the page and through the service.
#
# ENDPOINT: POST /createAccount — 200
# ENDPOINT: GET /customers/{customerId}/accounts
# ENDPOINT: GET /accounts/{accountId} — 200
# ENDPOINT: GET /accounts/{accountId}/transactions
# SEED-ENDPOINT: POST /transfer — moves money between a test customer's own accounts to give a funding account an exact balance (G5; plumbing only)
#
# ASSUMPTION: "funded from the customer's first account" (AC-2) is the account created at registration, listed first among the funding accounts.
# ASSUMPTION: the R5 refusal is checked through what the rule states (no new account, funding balance unchanged); on the page an error must be shown instead of the confirmation. The error's text and the service's status code are not asserted (G6).
# ASSUMPTION: closing accounts is not available (story Notes), so opened accounts cannot be cleaned up; every check registers its own customer with a unique user name.
# OPEN-QUESTION: G6 — what "the customer gets an error" looks like when the funding account holds less than 100.00: the page message, and the service's HTTP status and body
# OPEN-QUESTION: G7 — what must happen when the service is asked to fund the new account from an account that does not belong to the customer (R4: "one existing account of the same customer"): no outcome, status or message is stated

@story:PB-2
Feature: Open a new CHECKING or SAVINGS account online
  As a signed-in ParaBank customer
  I want to open an additional checking or savings account funded from one of my existing accounts
  So that I can separate my money without visiting a branch

  # from story AC-1, account-rules.csv R1 R2 R3
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:ui @depends:SCN-004
  Scenario: The Open New Account page offers CHECKING and SAVINGS, the customer's accounts and the minimum deposit
    Given I registered a new customer who has a second account
    And I am on the Open New Account page
    Then the account type choices are exactly CHECKING and SAVINGS
    And the funding account choices are exactly the customer's two accounts
    And the page shows "A minimum of $100.00 must be deposited into this account at time of opening."

  # from story AC-2, account-rules.csv R2 R6
  @SCN-002 @AC-2 @priority:P1 @type:functional @layer:ui
  Scenario: Opening a SAVINGS account on the page confirms it and links to its details
    Given I registered a new customer
    And I am on the Open New Account page
    When I open a SAVINGS account funded from my first account
    Then the page shows "Account Opened!"
    And the page shows "Congratulations, your account is now open."
    And the page shows "Your new account number:" followed by the new account number as a link
    When I follow the new account number link
    Then the account details page shows Account Type SAVINGS
    And the account details page shows a balance of $100.00

  # from story AC-3, account-rules.csv R1 R6 R7
  @SCN-003 @AC-3 @AC-6 @priority:P1 @type:integration @layer:e2e
  Scenario: After opening a CHECKING account on the page, Accounts Overview and the service show both balances
    Given I registered a new customer
    And I noted the funding account's balance in Accounts Overview and through the service
    And I am on the Open New Account page
    When I open a CHECKING account funded from my first account
    Then Accounts Overview lists the new account with a balance of $100.00
    And Accounts Overview shows the funding account's balance lower by $100.00 than before
    And GET /customers/{customerId}/accounts returns the new account with type CHECKING and a balance of 100.00
    And GET /customers/{customerId}/accounts returns the funding account with its balance reduced by 100.00

  # from story AC-4, account-rules.csv R1 R6
  @SCN-004 @AC-4 @priority:P1 @type:functional @layer:api
  Scenario: POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it
    Given I registered a new customer and know its customer id and first account id
    When I POST /createAccount for a CHECKING account funded from the first account
    Then the response status is 200
    And the body is the new account with an id, the customer's customerId, type CHECKING and balance 100.00
    When I GET /accounts/{id} for the returned id
    Then the response status is 200
    And it returns the same id, customerId, type and balance

  # from story AC-5, account-rules.csv R8 R9 (channel: service)
  @SCN-005 @AC-5 @priority:P1 @type:functional @layer:api @depends:SCN-004
  Scenario: Opening through the service records the transfer on both accounts
    Given I registered a new customer and know its customer id and first account id
    When I POST /createAccount for a SAVINGS account funded from the first account
    Then the funding account's transactions include a Debit of 100.00 "Funds Transfer Sent"
    And the new account's transactions include a Credit of 100.00 "Funds Transfer Received"

  # from story AC-5, account-rules.csv R8 R9 (channel: page)
  @SCN-006 @AC-5 @priority:P2 @type:integration @layer:e2e
  Scenario: Opening on the page records the transfer on both accounts
    Given I registered a new customer
    And I am on the Open New Account page
    When I open a CHECKING account funded from my first account
    Then the funding account's transactions include a Debit of 100.00 "Funds Transfer Sent"
    And the new account's transactions include a Credit of 100.00 "Funds Transfer Received"

  # from story AC-6, account-rules.csv R4 R7 (channel: service)
  @SCN-007 @AC-6 @priority:P1 @type:functional @layer:api @depends:SCN-004
  Scenario: The service takes the opening deposit from the funding account the customer chose
    Given I registered a new customer who has a second account
    And I noted the balances of both accounts
    When I POST /createAccount for a SAVINGS account funded from the second account
    Then the second account's balance is its previous balance minus 100.00
    And the first account's balance is unchanged

  # from story AC-6, account-rules.csv R4 R7 (channel: page)
  @SCN-008 @AC-6 @priority:P1 @type:functional @layer:e2e @depends:SCN-004
  Scenario: The page takes the opening deposit from the funding account the customer chose
    Given I registered a new customer who has a second account
    And I noted the balances of both accounts
    And I am on the Open New Account page
    When I open a CHECKING account funded from the second account
    Then the page shows "Account Opened!"
    And the second account's balance is its previous balance minus 100.00
    And the first account's balance is unchanged

  # from account-rules.csv R5 (balance >= 100.00; channel: service)
  @SCN-009 @AC-6 @priority:P1 @type:boundary @layer:api @depends:SCN-004
  Scenario Outline: The service opens an account only from a funding account holding at least 100.00
    Given I registered a new customer who has a funding account holding exactly <funding balance>
    When I POST /createAccount for a CHECKING account funded from that account
    Then the new account is <outcome>
    And the funding account's balance is <balance after>
    Examples:
      | funding balance | outcome    | balance after |
      | 100.00          | opened     | 0.00          |
      | 99.99           | not opened | 99.99         |

  # from account-rules.csv R5 (balance >= 100.00; channel: page). The error's form is G6.
  @SCN-010 @AC-6 @priority:P1 @type:boundary @layer:e2e @depends:SCN-004 @needs-clarification
  Scenario Outline: The page opens an account only from a funding account holding at least 100.00
    Given I registered a new customer who has a funding account holding exactly <funding balance>
    And I am on the Open New Account page
    When I open a SAVINGS account funded from that account
    Then the page shows <page outcome>
    And the customer's accounts are <accounts after>
    And the funding account's balance is <balance after>
    Examples:
      | funding balance | page outcome                     | accounts after       | balance after |
      | 100.00          | "Account Opened!"                | one more than before | 0.00          |
      | 99.99           | an error instead of the opening  | the same as before   | 99.99         |

  # from account-rules.csv R4 ("one existing account of the same customer"); the expected outcome is G7 (open)
  @SCN-011 @AC-6 @priority:P1 @type:security @layer:api @depends:SCN-004 @needs-clarification
  Scenario: The service does not fund a new account from another customer's account
    Given I registered customer A and customer B
    And I noted the balance of customer B's account
    When I POST /createAccount for customer A funded from customer B's account
    Then no new account is opened for customer A
    And customer B's account balance is unchanged
