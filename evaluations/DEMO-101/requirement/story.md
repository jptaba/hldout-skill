---
key: DEMO-101
summary: "Shopper can sign in, build a cart and complete checkout"
type: Story
status: Ready for QA
priority: High
labels: [web-shop, checkout]
source: mock-jira
url: https://your-domain.atlassian.net/browse/DEMO-101
fetchedAt: 2026-09-26T14:13:58.997Z
---

# DEMO-101: Shopper can sign in, build a cart and complete checkout

## Description

## User story

As a **shopper**, I want to sign in, add products to my cart and complete checkout, so that I can buy products online.

## Acceptance criteria

- **AC-1**: A registered shopper who signs in with valid credentials lands on the "Products" page, which lists the full catalogue of 6 products.
- **AC-2**: A shopper whose account is locked cannot sign in. The error message "Your account has been locked. Please contact customer support." is shown and the shopper stays on the sign-in page.
- **AC-3**: When the password is wrong, the error "Epic sadface: Username and password do not match any user in this service" is shown and, for security, both the Username and Password fields are cleared.
- **AC-4**: The shopper can sort products by "Price (low to high)"; products are then displayed in ascending order of price.
- **AC-5**: Adding a product to the cart increases the cart badge count by one; removing it decreases the count, and the badge is not shown when the cart is empty.
- **AC-6**: At checkout, First Name, Last Name and Postal Code are mandatory. Continuing without a First Name shows "Error: First Name is required".
- **AC-7**: The checkout overview shows the Item total, Tax and Total. Item total is the sum of the prices of the items in the cart; Tax is calculated according to the attached `pricing-rules.md`; Total = Item total + Tax.
- **AC-8**: Finishing the order shows the confirmation "Thank you for your order!" and the cart is empty afterwards.
- **AC-9**: Logging out returns the shopper to the sign-in page, and protected pages (e.g. the Products page URL) can no longer be opened without signing in again.

## Notes

- Test accounts are in the attached `test-users.csv`.
- Pricing and tax rules are owned by Finance and are in `pricing-rules.md`.
- Out of scope: payment gateway, product detail page, mobile layout.

## Attachments

| File | MIME | Bytes | How to read | Local path |
| --- | --- | --- | --- | --- |
| test-users.csv | text/csv | 176 | text — read directly | attachments/test-users.csv |
| pricing-rules.md | text/markdown | 484 | text — read directly | attachments/pricing-rules.md |
