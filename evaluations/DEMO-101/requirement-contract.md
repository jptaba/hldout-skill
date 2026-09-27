# Requirement contract — DEMO-101: Shopper can sign in, build a cart and complete checkout

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-26T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, AC-1..AC-9, notes (test accounts, pricing owner, out of scope) |
| attachments/pricing-rules.md | display, item total, tax, total and shipping rules (R1-R6) used by AC-7 |
| attachments/test-users.csv | test accounts: standard_user and locked_out_user, password secret_sauce |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | A registered shopper who signs in with valid credentials lands on the "Products" page, which lists the full catalogue of 6 products. | after signing in the "Products" page is shown; the Products page lists 6 products (the full catalogue) | story.md#L23 |
| AC-2 | ui | A shopper whose account is locked cannot sign in. The error message "Your account has been locked. Please contact customer support." is shown and the shopper stays on the sign-in page. | the locked shopper is not signed in; error message "Your account has been locked. Please contact customer support." is shown; the shopper stays on the sign-in page | story.md#L24 |
| AC-3 | ui | When the password is wrong, the error "Epic sadface: Username and password do not match any user in this service" is shown and, for security, both the Username and Password fields are cleared. | error "Epic sadface: Username and password do not match any user in this service" is shown; the Username field is cleared (empty); the Password field is cleared (empty) | story.md#L25 |
| AC-4 | ui | The shopper can sort products by "Price (low to high)"; products are then displayed in ascending order of price. | sorting by "Price (low to high)" is available; after sorting, the displayed products are in ascending order of price (each price is not lower than the one before it) | story.md#L26 |
| AC-5 | ui | Adding a product to the cart increases the cart badge count by one; removing it decreases the count, and the badge is not shown when the cart is empty. | each product added increases the cart badge count by one; removing a product decreases the cart badge count; the cart badge is not shown when the cart is empty | story.md#L27 |
| AC-6 | ui | At checkout, First Name, Last Name and Postal Code are mandatory. Continuing without a First Name shows "Error: First Name is required". | continuing without a First Name shows "Error: First Name is required"; checkout does not continue past the information step while First Name, Last Name or Postal Code is missing | story.md#L28 |
| AC-7 | ui | The checkout overview shows the Item total, Tax and Total. Item total is the sum of the prices of the items in the cart; Tax is calculated according to the attached pricing-rules.md; Total = Item total + Tax. | the overview shows Item total, Tax and Total; Item total = sum of the unit prices of the items in the cart (quantity 1 per product); Tax = 10% of the item total, rounded half-up to 2 decimals; Total = Item total + Tax, shown with two decimals; no shipping is added; amounts are shown in USD with two decimals, prefixed with $ | story.md#L29 |
| AC-8 | ui | Finishing the order shows the confirmation "Thank you for your order!" and the cart is empty afterwards. | confirmation "Thank you for your order!" is shown; the cart is empty afterwards | story.md#L30 |
| AC-9 | ui | Logging out returns the shopper to the sign-in page, and protected pages (e.g. the Products page URL) can no longer be opened without signing in again. | after logging out the shopper is on the sign-in page; opening the Products page URL after logging out does not show the Products page until the shopper signs in again | story.md#L31 |

## Rules and boundaries

- **R1** All prices are shown in USD with two decimals, prefixed with $ (e.g. $29.99). _(attachments/pricing-rules.md#L4)_
- **R2** Item total = sum of the unit prices of every item in the cart (quantity 1 per product). _(attachments/pricing-rules.md#L7)_
- **R3** Sales tax is 10% of the item total. _(attachments/pricing-rules.md#L10)_
- **R4** Tax is rounded half-up to 2 decimals. _(attachments/pricing-rules.md#L11)_
- **R5** Total = Item total + Tax, shown with two decimals. _(attachments/pricing-rules.md#L14)_
- **R6** Shipping is free for all orders and is not added to the total. _(attachments/pricing-rules.md#L17)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | sign-in with a locked account (AC-2) |  | Your account has been locked. Please contact customer support. | story.md#L24 |
| E2 | sign-in with a wrong password (AC-3) |  | Epic sadface: Username and password do not match any user in this service | story.md#L25 |
| E3 | checkout information step continued without a First Name (AC-6) |  | Error: First Name is required | story.md#L28 |

## Authentication

UI sign-in form (username + password); logout from the menu — credentials: attachments/test-users.csv: standard_user / secret_sauce (happy path), locked_out_user / secret_sauce (locked) _(attachments/test-users.csv#L1-L3)_

## Test data

No seeding: the accounts pre-exist (test-users.csv) and the cart is built through the UI in each test. Each test starts from a fresh browser session (empty cart).
- AC-1, AC-4..AC-9: standard_user / secret_sauce (test-users.csv#L2)
- AC-2: locked_out_user / secret_sauce (test-users.csv#L3)
- AC-3: username standard_user with any password other than secret_sauce
- AC-7: put at least two different products in the cart (quantity 1 each) so the item total is a real sum
- Cleanup: none needed (no persistent data is created; the cart lives in the browser session)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | where the web shop is and where the sign-in page is (origin / route) | mechanics | yes | AC-1, AC-2, AC-3, AC-9 | story → attachments → config | found-in-config: origin https://www.saucedemo.com; sign-in page at the root of the origin |
| G2 | UI labels and controls for each step (sign-in form, Products title, sort control, cart badge and cart entry, add/remove buttons, checkout fields and buttons, overview totals, menu and logout) | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9 | story → attachments → aut | discovered-in-aut: Username / Password textboxes, sign-in button "Login"; page title testid title; product cards testid inventory-item, prices testid inventory-item-price; sort combobox "Sort products" with option "Price (low to high)"; per-card buttons "Add to cart" / "Remove"; cart badge testid shopping-cart-badge; cart entry testid shopping-cart-link; "Checkout" button; textboxes "First Name", "Last Name", "Zip/Postal Code" (= Postal Code); "Continue" / "Finish" buttons; totals testids subtotal-label, tax-label, total-label; error area role alert; menu button "Open Menu" then button "Logout" |
| G3 | page routes: the Products page URL (needed by AC-9) and the checkout step pages | mechanics | yes | AC-1, AC-6, AC-7, AC-8, AC-9 | story → attachments → aut | discovered-in-aut: Products /inventory.html; checkout information /checkout-step-one.html; overview /checkout-step-two.html; confirmation /checkout-complete.html |
| G4 | AC-6: what is shown when Last Name or Postal Code is missing (the story states a message only for a missing First Name) | oracle | no | AC-6 | story → attachments | open |
| G5 | AC-9: what the shopper sees when opening a protected page while signed out (redirect to the sign-in page? a message?); the story says only that it can no longer be opened | oracle | no | AC-9 | story → attachments | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19 | context | user story: actor and goal |
| story.md#L23 | AC-1 |  |
| story.md#L24 | AC-2 |  |
| story.md#L25 | AC-3 |  |
| story.md#L26 | AC-4 |  |
| story.md#L27 | AC-5 |  |
| story.md#L28 | AC-6 |  |
| story.md#L29 | AC-7 |  |
| story.md#L30 | AC-8 |  |
| story.md#L31 | AC-9 |  |
| story.md#L35 | test-data | points to test-users.csv |
| story.md#L36 | context | pricing/tax rules owned by Finance; captured as R1-R6 from pricing-rules.md |
| story.md#L37 | out-of-scope |  |
| attachments/pricing-rules.md#L4 | R1 |  |
| attachments/pricing-rules.md#L7 | R2 |  |
| attachments/pricing-rules.md#L10 | R3 |  |
| attachments/pricing-rules.md#L11 | R4 |  |
| attachments/pricing-rules.md#L14 | R5 |  |
| attachments/pricing-rules.md#L17 | R6 |  |
| attachments/test-users.csv#L1-L3 | test-data auth | standard_user (happy path) and locked_out_user (AC-2), password secret_sauce |
