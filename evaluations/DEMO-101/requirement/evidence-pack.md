# Evidence pack — DEMO-101

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DEMO-101
  L3   | summary: "Shopper can sign in, build a cart and complete checkout"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: [web-shop, checkout]
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DEMO-101
  L10  | fetchedAt: 2026-09-26T14:13:58.997Z
  L11  | ---
  L12  | 
  L13  | # DEMO-101: Shopper can sign in, build a cart and complete checkout
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## User story
  L18  | 
● L19  | As a **shopper**, I want to sign in, add products to my cart and complete checkout, so that I can buy products online.
  L20  | 
  L21  | ## Acceptance criteria
  L22  | 
● L23  | - **AC-1**: A registered shopper who signs in with valid credentials lands on the "Products" page, which lists the full catalogue of 6 products.
● L24  | - **AC-2**: A shopper whose account is locked cannot sign in. The error message "Your account has been locked. Please contact customer support." is shown and the shopper stays on the sign-in page.
● L25  | - **AC-3**: When the password is wrong, the error "Epic sadface: Username and password do not match any user in this service" is shown and, for security, both the Username and Password fields are cleared.
● L26  | - **AC-4**: The shopper can sort products by "Price (low to high)"; products are then displayed in ascending order of price.
● L27  | - **AC-5**: Adding a product to the cart increases the cart badge count by one; removing it decreases the count, and the badge is not shown when the cart is empty.
● L28  | - **AC-6**: At checkout, First Name, Last Name and Postal Code are mandatory. Continuing without a First Name shows "Error: First Name is required".
● L29  | - **AC-7**: The checkout overview shows the Item total, Tax and Total. Item total is the sum of the prices of the items in the cart; Tax is calculated according to the attached `pricing-rules.md`; Total = Item total + Tax.
● L30  | - **AC-8**: Finishing the order shows the confirmation "Thank you for your order!" and the cart is empty afterwards.
● L31  | - **AC-9**: Logging out returns the shopper to the sign-in page, and protected pages (e.g. the Products page URL) can no longer be opened without signing in again.
  L32  | 
  L33  | ## Notes
  L34  | 
● L35  | - Test accounts are in the attached `test-users.csv`.
● L36  | - Pricing and tax rules are owned by Finance and are in `pricing-rules.md`.
● L37  | - Out of scope: payment gateway, product detail page, mobile layout.
  L38  | 
  L39  | ## Attachments
  L40  | 
  L41  | | File | MIME | Bytes | How to read | Local path |
  L42  | | --- | --- | --- | --- | --- |
  L43  | | test-users.csv | text/csv | 176 | text — read directly | attachments/test-users.csv |
  L44  | | pricing-rules.md | text/markdown | 484 | text — read directly | attachments/pricing-rules.md |
  L45  | 
```

## attachments/pricing-rules.md

```text
  L1   | # Pricing rules — web shop (v2.3, owner: Finance)
  L2   | 
  L3   | ## Display
● L4   | - All prices are shown in USD with two decimals, prefixed with `$` (e.g. `$29.99`).
  L5   | 
  L6   | ## Item total
● L7   | - Item total = sum of the unit prices of every item in the cart (quantity 1 per product).
  L8   | 
  L9   | ## Tax
● L10  | - Sales tax is **10%** of the item total.
● L11  | - Tax is rounded half-up to 2 decimals.
  L12  | 
  L13  | ## Total
● L14  | - Total = Item total + Tax, shown with two decimals.
  L15  | 
  L16  | ## Shipping
● L17  | - Shipping is free for all orders and is not added to the total.
  L18  | 
```

## attachments/test-users.csv

```text
● L1   | role,username,password,notes
● L2   | standard,standard_user,secret_sauce,Happy-path shopper with no restrictions
● L3   | locked,locked_out_user,secret_sauce,Account locked by an administrator
  L4   | 
```
