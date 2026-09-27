# AUT inspection (tier 3 — bundled inspector)

- AUT: Swag Labs (saucedemo.com demo shop) — https://www.saucedemo.com
- URL: https://www.saucedemo.com/inventory.html
- Title: Swag Labs
- Captured: 2026-09-26T14:17:41.391Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole("textbox", { name: "Username", exact: true })` | ✔ |
| 2 | fill | `getByRole("textbox", { name: "Password", exact: true })` | ✔ |
| 3 | click | `getByRole("button", { name: "Login", exact: true })` | ✔ |
| 4 | click | `getByTestId("inventory-item").nth(0).getByRole("button", { name: "Add to cart" })` | ✔ |
| 5 | click | `getByTestId("inventory-item").nth(1).getByRole("button", { name: "Add to cart" })` | ✔ |

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
| button | Cart, 2 items | shopping-cart-link | - | `getByRole('button', { name: 'Cart, 2 items', exact: true })` |
| span | 2 | shopping-cart-badge | - | `getByTestId('shopping-cart-badge')` |
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
| button | Remove | remove-sauce-labs-backpack | - | `getByTestId('remove-sauce-labs-backpack')` |
| div | Sauce Labs Bike Light A red light isn't the desired state in testing but it sure | inventory-item | - | `getByTestId('inventory-item') ⚠ matches 6` |
| button | View details for Sauce Labs Bike Light | item-0-img-link | - | `getByTestId('item-0-img-link')` |
| div | Sauce Labs Bike Light A red light isn't the desired state in testing but it sure | inventory-item-description | - | `getByTestId('inventory-item-description') ⚠ matches 6` |
| button | View details for Sauce Labs Bike Light | item-0-title-link | - | `getByTestId('item-0-title-link')` |
| div | Sauce Labs Bike Light | inventory-item-name | - | `getByTestId('inventory-item-name') ⚠ matches 6` |
| div | A red light isn't the desired state in testing but it sure helps when riding you | inventory-item-desc | - | `getByTestId('inventory-item-desc') ⚠ matches 6` |
| div | $9.99 | inventory-item-price | - | `getByTestId('inventory-item-price') ⚠ matches 6` |
| button | Remove | remove-sauce-labs-bike-light | - | `getByTestId('remove-sauce-labs-bike-light')` |
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
| `locator('.cart-badge')` | 0 ✖ | false |  |
| `getByTestId('shopping-cart-badge')` | 1 ✔ | true | 2 |
| `getByTestId('inventory-item').nth(1).getByRole('button', { name: 'Remove' })` | 1 ✔ | true | Remove |
| `getByTestId('inventory-item').nth(0).getByTestId('inventory-item-price')` | 1 ✔ | true | $29.99 |
