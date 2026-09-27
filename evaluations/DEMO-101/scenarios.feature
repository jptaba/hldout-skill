# Source: DEMO-101 — Shopper can sign in, build a cart and complete checkout
# Fetched: 2026-09-26 (mock Jira)
# Attachments used:
#   test-users.csv   → accounts for the standard shopper and the locked shopper (test-data.json → users)
#   pricing-rules.md → Item total / Tax (10%, round half-up, 2 dp) / Total rules used by SCN-010
#
# Acceptance criteria (verbatim from the story — one line each, this list drives coverage):
# AC-1: A registered shopper who signs in with valid credentials lands on the "Products" page, which lists the full catalogue of 6 products.
# AC-2: A shopper whose account is locked cannot sign in. The error message "Your account has been locked. Please contact customer support." is shown and the shopper stays on the sign-in page.
# AC-3: When the password is wrong, the error "Epic sadface: Username and password do not match any user in this service" is shown and, for security, both the Username and Password fields are cleared.
# AC-4: The shopper can sort products by "Price (low to high)"; products are then displayed in ascending order of price.
# AC-5: Adding a product to the cart increases the cart badge count by one; removing it decreases the count, and the badge is not shown when the cart is empty.
# AC-6: At checkout, First Name, Last Name and Postal Code are mandatory. Continuing without a First Name shows "Error: First Name is required".
# AC-7: The checkout overview shows the Item total, Tax and Total. Item total is the sum of the prices of the items in the cart; Tax is calculated according to the attached pricing-rules.md; Total = Item total + Tax.
# AC-8: Finishing the order shows the confirmation "Thank you for your order!" and the cart is empty afterwards.
# AC-9: Logging out returns the shopper to the sign-in page, and protected pages (e.g. the Products page URL) can no longer be opened without signing in again.
#
# ASSUMPTION: The story names no specific products; cart scenarios use the first products listed in the catalogue.
# ASSUMPTION: Checkout personal details are not specified; neutral values from test-data.json are used.
# ASSUMPTION: AC-6 gives an exact message only for a missing First Name; for Last Name / Postal Code we only
#             assert that the shopper cannot continue and an error is shown (no wording asserted).
# ASSUMPTION: "cart is empty" (AC-8) is observed through the cart badge not being shown (AC-5 defines that signal).

@story:DEMO-101
Feature: Shopper can sign in, build a cart and complete checkout
  As a shopper
  I want to sign in, add products to my cart and complete checkout
  So that I can buy products online

  Background:
    Given I am on the sign-in page

  # from story AC-1, test-users.csv (standard)
  @SCN-001 @AC-1 @priority:P1 @type:positive @layer:ui
  Scenario: Standard shopper signs in and sees the full catalogue
    When I sign in as the "standard" shopper
    Then I am on the "Products" page
    And the catalogue lists 6 products

  # from story AC-2, test-users.csv (locked)
  @SCN-002 @AC-2 @priority:P1 @type:negative @layer:ui
  Scenario: Locked shopper cannot sign in and is told the account is locked
    When I sign in as the "locked" shopper
    Then I see the error "Your account has been locked. Please contact customer support."
    And I am still on the sign-in page

  # from story AC-3, test-users.csv (standard)
  @SCN-003 @AC-3 @priority:P2 @type:negative @layer:ui
  Scenario: Wrong password shows the credentials error
    When I sign in as the "standard" shopper with the password "wrong_password"
    Then I see the error "Epic sadface: Username and password do not match any user in this service"

  # from story AC-3
  @SCN-004 @AC-3 @priority:P2 @type:negative @layer:ui
  Scenario: Wrong password clears the credential fields for security
    When I sign in as the "standard" shopper with the password "wrong_password"
    Then the Username field is empty
    And the Password field is empty

  # from story AC-4
  @SCN-005 @AC-4 @priority:P2 @type:positive @layer:ui
  Scenario: Sorting by price low to high orders products by ascending price
    Given I am signed in as the "standard" shopper
    When I sort the products by "Price (low to high)"
    Then the product prices are displayed in ascending order

  # from story AC-5
  @SCN-006 @AC-5 @priority:P1 @type:positive @layer:ui
  Scenario: Adding products increases the cart badge by one each time
    Given I am signed in as the "standard" shopper
    And the cart badge is not shown
    When I add the 1st listed product to the cart
    Then the cart badge shows 1
    When I add the 2nd listed product to the cart
    Then the cart badge shows 2

  # from story AC-5
  @SCN-007 @AC-5 @priority:P2 @type:positive @layer:ui
  Scenario: Removing products decreases the cart badge and hides it when empty
    Given I am signed in as the "standard" shopper
    And I have added the 1st and 2nd listed products to the cart
    When I remove the 2nd listed product
    Then the cart badge shows 1
    When I remove the 1st listed product
    Then the cart badge is not shown

  # from story AC-6
  @SCN-008 @AC-6 @priority:P2 @type:negative @layer:ui
  Scenario: Checkout requires a First Name
    Given I am signed in as the "standard" shopper
    And I have added the 1st listed product to the cart
    When I open the cart and proceed to checkout
    And I continue with Last Name and Postal Code but no First Name
    Then I see the error "Error: First Name is required"

  # from story AC-6
  @SCN-009 @AC-6 @priority:P3 @type:negative @layer:ui
  Scenario: Checkout requires a Last Name and a Postal Code
    Given I am signed in as the "standard" shopper
    And I have added the 1st listed product to the cart
    When I open the cart and proceed to checkout
    And I continue with First Name and Postal Code but no Last Name
    Then I cannot continue and an error is shown
    When I continue with First Name and Last Name but no Postal Code
    Then I cannot continue and an error is shown

  # from story AC-7, pricing-rules.md §Item total, §Tax, §Total
  @SCN-010 @AC-7 @priority:P1 @type:positive @layer:ui
  Scenario: Checkout overview totals follow the pricing rules
    Given I am signed in as the "standard" shopper
    And I have added the 1st and 2nd listed products to the cart, noting their prices
    When I open the cart and proceed to checkout
    And I continue with my First Name, Last Name and Postal Code
    Then the Item total equals the sum of the noted prices
    And the Tax equals 10% of the Item total rounded half-up to 2 decimals
    And the Total equals the Item total plus the Tax

  # from story AC-8
  @SCN-011 @AC-8 @priority:P1 @type:positive @layer:ui
  Scenario: Finishing the order confirms it and empties the cart
    Given I am signed in as the "standard" shopper
    And I have added the 1st listed product to the cart
    When I open the cart and proceed to checkout
    And I continue with my First Name, Last Name and Postal Code
    And I finish the order
    Then I see the confirmation "Thank you for your order!"
    And the cart badge is not shown

  # from story AC-9
  @SCN-012 @AC-9 @priority:P1 @type:positive @layer:ui
  Scenario: Logging out returns to sign-in and protects the Products page
    Given I am signed in as the "standard" shopper
    And I note the address of the Products page
    When I log out
    Then I am on the sign-in page
    When I open the noted Products page address directly
    Then I am not shown the Products page
    And I am on the sign-in page
