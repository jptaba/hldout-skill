# AUT inspection (tier 3 — bundled inspector)

- AUT: Swag Labs (saucedemo.com demo shop) — https://www.saucedemo.com
- URL: https://www.saucedemo.com/checkout-complete.html
- Title: Swag Labs
- Captured: 2026-09-26T14:18:10.305Z
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
| 12 | click | `getByRole("button", { name: "Finish" })` | ✔ |

## Accessibility snapshot

```yaml
- banner:
  - button "Open Menu"
  - img "Open Menu"
  - text: Swag Labs
  - button "Cart, empty"
  - text: "Checkout: Complete!"
- main:
  - img "Pony Express"
  - heading "Thank you for your order!" [level=2]
  - text: Your order has been dispatched, and will arrive just as fast as the pony can get there!
  - button "Back Home"
  - button "Generate PDF order"
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
| header | Open Menu Swag Labs Checkout: Complete! | header-container | - | `getByTestId('header-container')` |
| div | Open Menu Swag Labs | primary-header | - | `getByTestId('primary-header')` |
| button | Open Menu | - | button | `getByRole('button', { name: 'Open Menu', exact: true })` |
| img | Open Menu | open-menu | - | `getByRole('img', { name: 'Open Menu', exact: true })` |
| button | Cart, empty | shopping-cart-link | - | `getByRole('button', { name: 'Cart, empty', exact: true })` |
| div | Checkout: Complete! | secondary-header | - | `getByTestId('secondary-header')` |
| span | Checkout: Complete! | title | - | `getByTestId('title')` |
| main | Thank you for your order! Your order has been dispatched, and will arrive just a | checkout-complete-container | - | `getByTestId('checkout-complete-container')` |
| heading | Thank you for your order! | complete-header | - | `getByRole('heading', { name: 'Thank you for your order!', exact: true })` |
| div | Your order has been dispatched, and will arrive just as fast as the pony can get | complete-text | - | `getByTestId('complete-text')` |
| button | Back Home | back-to-products | - | `getByRole('button', { name: 'Back Home', exact: true })` |
| button | Generate PDF order | generate-pdf-order | - | `getByRole('button', { name: 'Generate PDF order', exact: true })` |
| footer | X Facebook LinkedIn © 2026 Sauce Labs. All Rights Reserved. Terms of Service \| P | footer | - | `getByTestId('footer')` |
| link | X | social-x | - | `getByRole('link', { name: 'X', exact: true })` |
| link | Facebook | social-facebook | - | `getByRole('link', { name: 'Facebook', exact: true })` |
| link | LinkedIn | social-linkedin | - | `getByRole('link', { name: 'LinkedIn', exact: true })` |
| div | © 2026 Sauce Labs. All Rights Reserved. Terms of Service \| Privacy Policy | footer-copy | - | `getByTestId('footer-copy')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: 'Thank you for your order!' })` | 1 ✔ | true | Thank you for your order! |
| `getByTestId('shopping-cart-badge')` | 0 ✖ | false |  |
