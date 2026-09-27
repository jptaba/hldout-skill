# AUT inspection (tier 3 — bundled inspector)

- AUT: Swag Labs (saucedemo.com demo shop) — https://www.saucedemo.com
- URL: https://www.saucedemo.com/checkout-step-two.html
- Title: Swag Labs
- Captured: 2026-09-26T14:18:05.190Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole("textbox", { name: "Username", exact: true })` | ✔ |
| 2 | fill | `getByRole("textbox", { name: "Password", exact: true })` | ✔ |
| 3 | click | `getByRole("button", { name: "Login", exact: true })` | ✔ |
| 4 | click | `getByTestId("inventory-item").nth(0).getByRole("button", { name: "Add to cart" })` | ✔ |
| 5 | click | `getByTestId("inventory-item").nth(1).getByRole("button", { name: "Add to cart" })` | ✔ |
| 6 | click | `getByTestId("shopping-cart-link")` | ✔ |
| 7 | click | `getByRole("button", { name: "Checkout" })` | ✔ |
| 8 | fill | `getByRole("textbox", { name: "First Name", exact: true })` | ✔ |
| 9 | fill | `getByRole("textbox", { name: "Last Name", exact: true })` | ✔ |
| 10 | fill | `getByRole("textbox", { name: "Zip/Postal Code", exact: true })` | ✔ |
| 11 | click | `getByRole("button", { name: "Continue" })` | ✔ |

## Accessibility snapshot

```yaml
- banner:
  - button "Open Menu"
  - img "Open Menu"
  - text: Swag Labs
  - button "Cart, 2 items": "2"
  - text: "Checkout: Overview"
- main:
  - text: QTY Description 1
  - button "View details for Sauce Labs Backpack": Sauce Labs Backpack
  - text: carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection. $29.99 1
  - button "View details for Sauce Labs Bike Light": Sauce Labs Bike Light
  - text: "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included. $9.99 Payment Information: SauceCard #31337 Shipping Information: Free Pony Express Delivery! Price Total Item total: $39.98 Tax: $3.20 Total: $43.18"
  - button "Cancel"
  - button "Finish"
- contentinfo:
  - list:
    - listitem:
      - link "X":
        - /url: https://x.com/saucelabs
    - listitem:
      - link "Facebook":
        - /url: https://www.facebook.com/saucelabs
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/sauce-labs/
  - text: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| header | Open Menu Swag Labs 2 Checkout: Overview | header-container | - | `getByTestId('header-container')` |
| div | Open Menu Swag Labs 2 | primary-header | - | `getByTestId('primary-header')` |
| button | Open Menu | - | button | `getByRole('button', { name: 'Open Menu', exact: true })` |
| img | Open Menu | open-menu | - | `getByRole('img', { name: 'Open Menu', exact: true })` |
| button | Cart, 2 items | shopping-cart-link | - | `getByRole('button', { name: 'Cart, 2 items', exact: true })` |
| span | 2 | shopping-cart-badge | - | `getByTestId('shopping-cart-badge')` |
| div | Checkout: Overview | secondary-header | - | `getByTestId('secondary-header')` |
| span | Checkout: Overview | title | - | `getByTestId('title')` |
| main | QTYDescription 1 Sauce Labs Backpack carry.allTheThings() with the sleek, stream | checkout-summary-container | - | `getByTestId('checkout-summary-container')` |
| div | QTYDescription 1 Sauce Labs Backpack carry.allTheThings() with the sleek, stream | cart-list | - | `getByTestId('cart-list')` |
| div | QTY | cart-quantity-label | - | `getByTestId('cart-quantity-label')` |
| div | Description | cart-desc-label | - | `getByTestId('cart-desc-label')` |
| div | 1 Sauce Labs Backpack carry.allTheThings() with the sleek, streamlined Sly Pack | inventory-item | - | `getByTestId('inventory-item') ⚠ matches 2` |
| div | 1 | item-quantity | - | `getByTestId('item-quantity') ⚠ matches 2` |
| button | View details for Sauce Labs Backpack | item-4-title-link | - | `getByRole('button', { name: 'View details for Sauce Labs Backpack', exact: true })` |
| div | Sauce Labs Backpack | inventory-item-name | - | `getByTestId('inventory-item-name') ⚠ matches 2` |
| div | carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromis | inventory-item-desc | - | `getByTestId('inventory-item-desc') ⚠ matches 2` |
| div | $29.99 | inventory-item-price | - | `getByTestId('inventory-item-price') ⚠ matches 2` |
| div | 1 Sauce Labs Bike Light A red light isn't the desired state in testing but it su | inventory-item | - | `getByTestId('inventory-item') ⚠ matches 2` |
| button | View details for Sauce Labs Bike Light | item-0-title-link | - | `getByRole('button', { name: 'View details for Sauce Labs Bike Light', exact: true })` |
| div | Sauce Labs Bike Light | inventory-item-name | - | `getByTestId('inventory-item-name') ⚠ matches 2` |
| div | A red light isn't the desired state in testing but it sure helps when riding you | inventory-item-desc | - | `getByTestId('inventory-item-desc') ⚠ matches 2` |
| div | $9.99 | inventory-item-price | - | `getByTestId('inventory-item-price') ⚠ matches 2` |
| div | Payment Information: | payment-info-label | - | `getByTestId('payment-info-label')` |
| div | SauceCard #31337 | payment-info-value | - | `getByTestId('payment-info-value')` |
| div | Shipping Information: | shipping-info-label | - | `getByTestId('shipping-info-label')` |
| div | Free Pony Express Delivery! | shipping-info-value | - | `getByTestId('shipping-info-value')` |
| div | Price Total | total-info-label | - | `getByTestId('total-info-label')` |
| div | Item total: $39.98 | subtotal-label | - | `getByTestId('subtotal-label')` |
| div | Tax: $3.20 | tax-label | - | `getByTestId('tax-label')` |
| div | Total: $43.18 | total-label | - | `getByTestId('total-label')` |
| button | Cancel | cancel | - | `getByRole('button', { name: 'Cancel', exact: true })` |
| button | Finish | finish | - | `getByRole('button', { name: 'Finish', exact: true })` |
| footer | X Facebook LinkedIn © 2026 Sauce Labs. All Rights Reserved. Terms of Service \| P | footer | - | `getByTestId('footer')` |
| link | X | social-x | - | `getByRole('link', { name: 'X', exact: true })` |
| link | Facebook | social-facebook | - | `getByRole('link', { name: 'Facebook', exact: true })` |
| link | LinkedIn | social-linkedin | - | `getByRole('link', { name: 'LinkedIn', exact: true })` |
| div | © 2026 Sauce Labs. All Rights Reserved. Terms of Service \| Privacy Policy | footer-copy | - | `getByTestId('footer-copy')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByText(/Item total/)` | 1 ✔ | true | Item total: $39.98 |
| `getByText(/^Tax/)` | 1 ✔ | true | Tax: $3.20 |
| `getByText(/^Total/)` | 1 ✔ | true | Total: $43.18 |
| `getByTestId('subtotal-label')` | 1 ✔ | true | Item total: $39.98 |
| `getByTestId('tax-label')` | 1 ✔ | true | Tax: $3.20 |
| `getByTestId('total-label')` | 1 ✔ | true | Total: $43.18 |
| `getByRole('button', { name: 'Finish' })` | 1 ✔ | true | Finish |
