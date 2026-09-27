# AUT inspection (tier 3 — bundled inspector)

- AUT: Swag Labs (saucedemo.com demo shop) — https://www.saucedemo.com
- URL: https://www.saucedemo.com/checkout-step-one.html
- Title: Swag Labs
- Captured: 2026-09-26T14:17:47.257Z
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

## Accessibility snapshot

```yaml
- banner:
  - button "Open Menu"
  - img "Open Menu"
  - text: Swag Labs
  - button "Cart, 2 items": "2"
  - text: "Checkout: Your Information"
- main:
  - form "Checkout information":
    - textbox "First Name"
    - textbox "Last Name"
    - textbox "Zip/Postal Code"
    - button "Cancel"
    - button "Continue"
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
| header | Open Menu Swag Labs 2 Checkout: Your Information | header-container | - | `getByTestId('header-container')` |
| div | Open Menu Swag Labs 2 | primary-header | - | `getByTestId('primary-header')` |
| button | Open Menu | - | button | `getByRole('button', { name: 'Open Menu', exact: true })` |
| img | Open Menu | open-menu | - | `getByRole('img', { name: 'Open Menu', exact: true })` |
| button | Cart, 2 items | shopping-cart-link | - | `getByRole('button', { name: 'Cart, 2 items', exact: true })` |
| span | 2 | shopping-cart-badge | - | `getByTestId('shopping-cart-badge')` |
| div | Checkout: Your Information | secondary-header | - | `getByTestId('secondary-header')` |
| span | Checkout: Your Information | title | - | `getByTestId('title')` |
| main | Cancel | checkout-info-container | - | `getByTestId('checkout-info-container')` |
| textbox | First Name | firstName | text | `getByRole('textbox', { name: 'First Name', exact: true })` |
| textbox | Last Name | lastName | text | `getByRole('textbox', { name: 'Last Name', exact: true })` |
| textbox | Zip/Postal Code | postalCode | text | `getByRole('textbox', { name: 'Zip/Postal Code', exact: true })` |
| button | Cancel | cancel | - | `getByRole('button', { name: 'Cancel', exact: true })` |
| button | Continue | continue | submit | `getByRole('button', { name: 'Continue', exact: true })` |
| footer | X Facebook LinkedIn © 2026 Sauce Labs. All Rights Reserved. Terms of Service \| P | footer | - | `getByTestId('footer')` |
| link | X | social-x | - | `getByRole('link', { name: 'X', exact: true })` |
| link | Facebook | social-facebook | - | `getByRole('link', { name: 'Facebook', exact: true })` |
| link | LinkedIn | social-linkedin | - | `getByRole('link', { name: 'LinkedIn', exact: true })` |
| div | © 2026 Sauce Labs. All Rights Reserved. Terms of Service \| Privacy Policy | footer-copy | - | `getByTestId('footer-copy')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByLabel('First Name')` | 1 ✔ | true |  |
| `getByLabel('Last Name')` | 1 ✔ | true |  |
| `getByLabel('Postal Code')` | 1 ✔ | true |  |
| `getByRole('button', { name: 'Continue' })` | 1 ✔ | true | Continue |
