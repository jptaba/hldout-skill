# AUT inspection (tier 3 — bundled inspector)

- AUT: Swag Labs (saucedemo.com demo shop) — https://www.saucedemo.com
- URL: https://www.saucedemo.com/inventory.html
- Title: Swag Labs
- Captured: 2026-09-26T14:17:16.545Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole("textbox", { name: "Username", exact: true })` | ✔ |
| 2 | fill | `getByRole("textbox", { name: "Password", exact: true })` | ✔ |
| 3 | click | `getByRole("button", { name: "Login", exact: true })` | ✔ |

## Accessibility snapshot

```yaml
- banner:
  - button "Open Menu"
  - img "Open Menu"
  - text: Swag Labs
  - button "Cart, empty"
  - text: Products Name (A to Z)
  - combobox "Sort products":
    - option "Name (A to Z)" [selected]
    - option "Name (Z to A)"
    - option "Price (low to high)"
    - option "Price (high to low)"
- main:
  - button "View details for Sauce Labs Backpack":
    - img "Sauce Labs Backpack"
  - button "View details for Sauce Labs Backpack": Sauce Labs Backpack
  - text: carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection. $29.99
  - button "Add to cart"
  - button "View details for Sauce Labs Bike Light":
    - img "Sauce Labs Bike Light"
  - button "View details for Sauce Labs Bike Light": Sauce Labs Bike Light
  - text: A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included. $9.99
  - button "Add to cart"
  - button "View details for Sauce Labs Bolt T-Shirt":
    - img "Sauce Labs Bolt T-Shirt"
  - button "View details for Sauce Labs Bolt T-Shirt": Sauce Labs Bolt T-Shirt
  - text: Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt. $15.99
  - button "Add to cart"
  - button "View details for Sauce Labs Fleece Jacket":
    - img "Sauce Labs Fleece Jacket"
  - button "View details for Sauce Labs Fleece Jacket": Sauce Labs Fleece Jacket
  - text: It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office. $49.99
  - button "Add to cart"
  - button "View details for Sauce Labs Onesie":
    - img "Sauce Labs Onesie"
  - button "View details for Sauce Labs Onesie": Sauce Labs Onesie
  - text: Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel. $7.99
  - button "Add to cart"
  - button "View details for Test.allTheThings() T-Shirt (Red)":
    - img "Test.allTheThings() T-Shirt (Red)"
  - button "View details for Test.allTheThings() T-Shirt (Red)": Test.allTheThings() T-Shirt (Red)
  - text: This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton. $15.99
  - button "Add to cart"
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
| header | Open Menu All Items Dynamic Catalog About Logout Reset App State Close Menu Swag | header-container | - | `getByTestId('header-container')` |
| div | Open Menu All Items Dynamic Catalog About Logout Reset App State Close Menu Swag | primary-header | - | `getByTestId('primary-header')` |
| button | Open Menu | - | button | `getByRole('button', { name: 'Open Menu', exact: true })` |
| img | Open Menu | open-menu | - | `getByRole('img', { name: 'Open Menu', exact: true })` |
| button | All Items | inventory-sidebar-link | - | `getByTestId('inventory-sidebar-link')` |
| button | Dynamic Catalog | dynamic-catalog-sidebar-link | - | `getByTestId('dynamic-catalog-sidebar-link')` |
| link | About | about-sidebar-link | - | `getByTestId('about-sidebar-link')` |
| button | Logout | logout-sidebar-link | - | `getByTestId('logout-sidebar-link')` |
| button | Reset App State | reset-sidebar-link | - | `getByTestId('reset-sidebar-link')` |
| button | Close Menu | - | button | `locator('#react-burger-cross-btn')` |
| img | Close Menu | close-menu | - | `getByTestId('close-menu')` |
| button | Cart, empty | shopping-cart-link | - | `getByRole('button', { name: 'Cart, empty', exact: true })` |
| div | Products Name (A to Z) Name (A to Z) Name (Z to A) Price (low to high) Price (hi | secondary-header | - | `getByTestId('secondary-header')` |
| span | Products | title | - | `getByTestId('title')` |
| span | Name (A to Z) | active-option | - | `getByTestId('active-option')` |
| combobox | Sort products | product-sort-container | - | `getByRole('combobox', { name: 'Sort products', exact: true })` |
| main | Sauce Labs Backpack carry.allTheThings() with the sleek, streamlined Sly Pack th | - | - | `getByRole('main', { name: 'Sauce Labs Backpack carry.allTheThings() with the sleek, streamlined Sly Pack th', exact: true }) ⚠ matches 2` |
| div | Sauce Labs Backpack carry.allTheThings() with the sleek, streamlined Sly Pack th | inventory-container | - | `getByTestId('inventory-container')` |
| div | Sauce Labs Backpack carry.allTheThings() with the sleek, streamlined Sly Pack th | inventory-list | - | `getByTestId('inventory-list')` |
| div | Sauce Labs Backpack carry.allTheThings() with the sleek, streamlined Sly Pack th | inventory-item | - | `getByTestId('inventory-item') ⚠ matches 6` |
| button | View details for Sauce Labs Backpack | item-4-img-link | - | `getByTestId('item-4-img-link')` |
| div | Sauce Labs Backpack carry.allTheThings() with the sleek, streamlined Sly Pack th | inventory-item-description | - | `getByTestId('inventory-item-description') ⚠ matches 6` |
| button | View details for Sauce Labs Backpack | item-4-title-link | - | `getByTestId('item-4-title-link')` |
| div | Sauce Labs Backpack | inventory-item-name | - | `getByTestId('inventory-item-name') ⚠ matches 6` |
| div | carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromis | inventory-item-desc | - | `getByTestId('inventory-item-desc') ⚠ matches 6` |
| div | $29.99 | inventory-item-price | - | `getByTestId('inventory-item-price') ⚠ matches 6` |
| button | Add to cart | add-to-cart-sauce-labs-backpack | - | `getByTestId('add-to-cart-sauce-labs-backpack')` |
| div | Sauce Labs Bike Light A red light isn't the desired state in testing but it sure | inventory-item | - | `getByTestId('inventory-item') ⚠ matches 6` |
| button | View details for Sauce Labs Bike Light | item-0-img-link | - | `getByTestId('item-0-img-link')` |
| div | Sauce Labs Bike Light A red light isn't the desired state in testing but it sure | inventory-item-description | - | `getByTestId('inventory-item-description') ⚠ matches 6` |
| button | View details for Sauce Labs Bike Light | item-0-title-link | - | `getByTestId('item-0-title-link')` |
| div | Sauce Labs Bike Light | inventory-item-name | - | `getByTestId('inventory-item-name') ⚠ matches 6` |
| div | A red light isn't the desired state in testing but it sure helps when riding you | inventory-item-desc | - | `getByTestId('inventory-item-desc') ⚠ matches 6` |
| div | $9.99 | inventory-item-price | - | `getByTestId('inventory-item-price') ⚠ matches 6` |
| button | Add to cart | add-to-cart-sauce-labs-bike-light | - | `getByTestId('add-to-cart-sauce-labs-bike-light')` |
| div | Sauce Labs Bolt T-Shirt Get your testing superhero on with the Sauce Labs bolt T | inventory-item | - | `getByTestId('inventory-item') ⚠ matches 6` |
| button | View details for Sauce Labs Bolt T-Shirt | item-1-img-link | - | `getByTestId('item-1-img-link')` |
| div | Sauce Labs Bolt T-Shirt Get your testing superhero on with the Sauce Labs bolt T | inventory-item-description | - | `getByTestId('inventory-item-description') ⚠ matches 6` |
| button | View details for Sauce Labs Bolt T-Shirt | item-1-title-link | - | `getByTestId('item-1-title-link')` |
| div | Sauce Labs Bolt T-Shirt | inventory-item-name | - | `getByTestId('inventory-item-name') ⚠ matches 6` |
| div | Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Ap | inventory-item-desc | - | `getByTestId('inventory-item-desc') ⚠ matches 6` |
| div | $15.99 | inventory-item-price | - | `getByTestId('inventory-item-price') ⚠ matches 6` |
| button | Add to cart | add-to-cart-sauce-labs-bolt-t-shirt | - | `getByTestId('add-to-cart-sauce-labs-bolt-t-shirt')` |
| div | Sauce Labs Fleece Jacket It's not every day that you come across a midweight qua | inventory-item | - | `getByTestId('inventory-item') ⚠ matches 6` |
| button | View details for Sauce Labs Fleece Jacket | item-5-img-link | - | `getByTestId('item-5-img-link')` |
| div | Sauce Labs Fleece Jacket It's not every day that you come across a midweight qua | inventory-item-description | - | `getByTestId('inventory-item-description') ⚠ matches 6` |
| button | View details for Sauce Labs Fleece Jacket | item-5-title-link | - | `getByTestId('item-5-title-link')` |
| div | Sauce Labs Fleece Jacket | inventory-item-name | - | `getByTestId('inventory-item-name') ⚠ matches 6` |
| div | It's not every day that you come across a midweight quarter-zip fleece jacket ca | inventory-item-desc | - | `getByTestId('inventory-item-desc') ⚠ matches 6` |
| div | $49.99 | inventory-item-price | - | `getByTestId('inventory-item-price') ⚠ matches 6` |
| button | Add to cart | add-to-cart-sauce-labs-fleece-jacket | - | `getByTestId('add-to-cart-sauce-labs-fleece-jacket')` |
| div | Sauce Labs Onesie Rib snap infant onesie for the junior automation engineer in d | inventory-item | - | `getByTestId('inventory-item') ⚠ matches 6` |
| button | View details for Sauce Labs Onesie | item-2-img-link | - | `getByTestId('item-2-img-link')` |
| div | Sauce Labs Onesie Rib snap infant onesie for the junior automation engineer in d | inventory-item-description | - | `getByTestId('inventory-item-description') ⚠ matches 6` |
| button | View details for Sauce Labs Onesie | item-2-title-link | - | `getByTestId('item-2-title-link')` |
| div | Sauce Labs Onesie | inventory-item-name | - | `getByTestId('inventory-item-name') ⚠ matches 6` |
| div | Rib snap infant onesie for the junior automation engineer in development. Reinfo | inventory-item-desc | - | `getByTestId('inventory-item-desc') ⚠ matches 6` |
| div | $7.99 | inventory-item-price | - | `getByTestId('inventory-item-price') ⚠ matches 6` |
| button | Add to cart | add-to-cart-sauce-labs-onesie | - | `getByTestId('add-to-cart-sauce-labs-onesie')` |
| div | Test.allTheThings() T-Shirt (Red) This classic Sauce Labs t-shirt is perfect to | inventory-item | - | `getByTestId('inventory-item') ⚠ matches 6` |
| button | View details for Test.allTheThings() T-Shirt (Red) | item-3-img-link | - | `getByTestId('item-3-img-link')` |
| div | Test.allTheThings() T-Shirt (Red) This classic Sauce Labs t-shirt is perfect to | inventory-item-description | - | `getByTestId('inventory-item-description') ⚠ matches 6` |
| button | View details for Test.allTheThings() T-Shirt (Red) | item-3-title-link | - | `getByTestId('item-3-title-link')` |
| div | Test.allTheThings() T-Shirt (Red) | inventory-item-name | - | `getByTestId('inventory-item-name') ⚠ matches 6` |
| div | This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keybo | inventory-item-desc | - | `getByTestId('inventory-item-desc') ⚠ matches 6` |
| button | Add to cart | add-to-cart-test.allthethings()-t-shirt-(red) | - | `getByTestId('add-to-cart-test.allthethings()-t-shirt-(red)')` |
| footer | X Facebook LinkedIn © 2026 Sauce Labs. All Rights Reserved. Terms of Service \| P | footer | - | `getByTestId('footer')` |
| link | X | social-x | - | `getByRole('link', { name: 'X', exact: true })` |
| link | Facebook | social-facebook | - | `getByRole('link', { name: 'Facebook', exact: true })` |
| link | LinkedIn | social-linkedin | - | `getByRole('link', { name: 'LinkedIn', exact: true })` |
| div | © 2026 Sauce Labs. All Rights Reserved. Terms of Service \| Privacy Policy | footer-copy | - | `getByTestId('footer-copy')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: 'Products' })` | 0 ✖ | false |  |
| `getByTestId('title')` | 1 ✔ | true | Products |
| `getByRole('listitem')` | 3 ⚠ not unique | true | X |
| `getByTestId('inventory-item')` | 6 ⚠ not unique | true | Sauce Labs Backpack carry.allTheThings() with the sleek, streamlined Sly Pack th |
| `getByText(/^\$\d+\.\d{2}$/)` | 6 ⚠ not unique | true | $29.99 |
| `getByTestId('inventory-item-price')` | 6 ⚠ not unique | true | $29.99 |
| `getByRole('combobox', { name: 'Sort' })` | 1 ✔ | true | Name (A to Z) Name (Z to A) Price (low to high) Price (high to low) |
| `getByTestId('product-sort-container')` | 1 ✔ | true | Name (A to Z) Name (Z to A) Price (low to high) Price (high to low) |
| `getByRole('link', { name: /cart/i })` | 0 ✖ | false |  |
| `getByTestId('shopping-cart-link')` | 1 ✔ | true |  |
| `getByRole('button', { name: 'Open Menu' })` | 1 ✔ | true | Open Menu |
