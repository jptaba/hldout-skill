# AUT inspection (tier 3 — bundled inspector)

- AUT: Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) — https://practicesoftwaretesting.com
- URL: https://practicesoftwaretesting.com/product/01M3FMVTF643HM73TTG5SBFASC
- Title: Pliers - Practice Software Testing - Toolshop - v5.0
- Captured: 2026-09-26T20:07:11.697Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | wait | `getByTestId('add-to-cart')` | ✔ |
| 2 | click | `getByTestId('increase-quantity')` | ✔ |
| 3 | click | `getByTestId('add-to-cart')` | ✔ |
| 4 | wait | `getByRole('alert')` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| div | View the Documentation for this application. | notification-bar | - | `getByTestId('notification-bar')` |
| link | Documentation | - | - | `getByRole('link', { name: 'Documentation', exact: true })` |
| button | Testing Guide | - | - | `getByRole('button', { name: 'Testing Guide', exact: true })` |
| button | 🐛 Bug Hunting | - | - | `getByRole('button', { name: '🐛 Bug Hunting', exact: true })` |
| link | Practice Software Testing - Toolshop | - | - | `getByRole('link', { name: 'Practice Software Testing - Toolshop', exact: true })` |
| menubar | Main menu | - | - | `getByRole('menubar', { name: 'Main menu', exact: true })` |
| menuitem | Home | - | - | `getByRole('menuitem', { name: 'Home', exact: true })` |
| link | Home | nav-home | - | `getByRole('link', { name: 'Home', exact: true })` |
| menuitem | Categories | - | - | `getByRole('menuitem', { name: 'Categories', exact: true })` |
| button | Categories | nav-categories | button | `getByRole('button', { name: 'Categories', exact: true })` |
| menuitem | Contact | - | - | `getByRole('menuitem', { name: 'Contact', exact: true })` |
| link | Contact | nav-contact | - | `getByRole('link', { name: 'Contact', exact: true })` |
| menuitem | Sign in | - | - | `getByRole('menuitem', { name: 'Sign in', exact: true })` |
| link | Sign in | nav-sign-in | - | `getByRole('link', { name: 'Sign in', exact: true })` |
| menuitem | 2 | - | - | `getByRole('menuitem', { name: '2', exact: true }) ⚠ matches 0` |
| link | cart | nav-cart | - | `getByRole('link', { name: 'cart', exact: true })` |
| img | - | - | - | `(no stable locator)` |
| span | 2 | cart-quantity | - | `getByTestId('cart-quantity')` |
| button | Select language | language-select | button | `getByRole('button', { name: 'Select language', exact: true })` |
| link | Everyday basics | - | - | `getByRole('link', { name: 'Everyday basics', exact: true })` |
| link | Unsplash | - | - | `getByRole('link', { name: 'Unsplash', exact: true }) ⚠ matches 2` |
| heading | Pliers | product-name | - | `getByRole('heading', { name: 'Pliers', exact: true })` |
| span | unit-price | unit-price | - | `getByTestId('unit-price')` |
| div | A B C D E | co2-rating-badge | - | `getByTestId('co2-rating-badge')` |
| p | Reliable general-purpose pliers crafted from drop-forged carbon steel for long-l | product-description | - | `getByTestId('product-description')` |
| button | Decrease quantity | decrease-quantity | - | `getByRole('button', { name: 'Decrease quantity', exact: true })` |
| spinbutton | Quantity | quantity | number | `getByRole('spinbutton', { name: 'Quantity', exact: true })` |
| button | Increase quantity | increase-quantity | - | `getByRole('button', { name: 'Increase quantity', exact: true })` |
| button | Add to cart | add-to-cart | - | `getByRole('button', { name: 'Add to cart', exact: true })` |
| button | Add to favourites | add-to-favorites | - | `getByRole('button', { name: 'Add to favourites', exact: true })` |
| button | Compare | add-to-compare | - | `getByRole('button', { name: 'Compare', exact: true })` |
| heading | Specifications | specs-title | - | `getByRole('heading', { name: 'Specifications', exact: true })` |
| table | Handle Material Rubber Length 180mm Material Carbon Steel Warranty 1years Weight | product-specs | - | `getByTestId('product-specs')` |
| tr | Handle Material Rubber | spec-row | - | `getByTestId('spec-row') ⚠ matches 5` |
| td | Handle Material | spec-name | - | `getByTestId('spec-name') ⚠ matches 5` |
| td | Rubber | spec-value | - | `getByTestId('spec-value') ⚠ matches 5` |
| span | Rubber | spec-value-text | - | `getByTestId('spec-value-text') ⚠ matches 5` |
| tr | Length 180mm | spec-row | - | `getByTestId('spec-row') ⚠ matches 5` |
| td | Length | spec-name | - | `getByTestId('spec-name') ⚠ matches 5` |
| td | 180mm | spec-value | - | `getByTestId('spec-value') ⚠ matches 5` |
| span | 180 | spec-value-text | - | `getByTestId('spec-value-text') ⚠ matches 5` |
| span | mm | spec-unit | - | `getByTestId('spec-unit') ⚠ matches 3` |
| tr | Material Carbon Steel | spec-row | - | `getByTestId('spec-row') ⚠ matches 5` |
| td | Material | spec-name | - | `getByTestId('spec-name') ⚠ matches 5` |
| td | Carbon Steel | spec-value | - | `getByTestId('spec-value') ⚠ matches 5` |
| span | Carbon Steel | spec-value-text | - | `getByTestId('spec-value-text') ⚠ matches 5` |
| tr | Warranty 1years | spec-row | - | `getByTestId('spec-row') ⚠ matches 5` |
| td | Warranty | spec-name | - | `getByTestId('spec-name') ⚠ matches 5` |
| td | 1years | spec-value | - | `getByTestId('spec-value') ⚠ matches 5` |
| span | 1 | spec-value-text | - | `getByTestId('spec-value-text') ⚠ matches 5` |
| span | years | spec-unit | - | `getByTestId('spec-unit') ⚠ matches 3` |
| tr | Weight 280g | spec-row | - | `getByTestId('spec-row') ⚠ matches 5` |
| td | Weight | spec-name | - | `getByTestId('spec-name') ⚠ matches 5` |
| td | 280g | spec-value | - | `getByTestId('spec-value') ⚠ matches 5` |
| span | 280 | spec-value-text | - | `getByTestId('spec-value-text') ⚠ matches 5` |
| span | g | spec-unit | - | `getByTestId('spec-unit') ⚠ matches 3` |
| heading | Related products | - | - | `getByRole('heading', { name: 'Related products', exact: true })` |
| link | Combination Pliers More information | - | - | `getByRole('link', { name: 'Combination Pliers More information', exact: true }) ⚠ matches 0` |
| link | More information | - | - | `getByRole('link', { name: 'More information', exact: true }) ⚠ matches 4` |
| link | Bolt Cutters More information | - | - | `getByRole('link', { name: 'Bolt Cutters More information', exact: true }) ⚠ matches 0` |
| link | Long Nose Pliers More information | - | - | `getByRole('link', { name: 'Long Nose Pliers More information', exact: true }) ⚠ matches 0` |
| link | Slip Joint Pliers More information | - | - | `getByRole('link', { name: 'Slip Joint Pliers More information', exact: true }) ⚠ matches 0` |
| div | LEARN & EXPLORE Learn Test Automation Hands-on courses for Playwright, Robot Fra | footer-explore | - | `getByTestId('footer-explore')` |
| link | Learn Test Automation Hands-on courses for Playwright, Robot Framework, APIs and | footer-learn-courses | - | `getByTestId('footer-learn-courses')` |
| link | API Spector Open-source API testing, mocking and contract testing | footer-learn-spector | - | `getByRole('link', { name: 'API Spector Open-source API testing, mocking and contract testing', exact: true })` |
| link | GitHub Source code, issues and contributions | footer-learn-github | - | `getByRole('link', { name: 'GitHub Source code, issues and contributions', exact: true })` |
| link | Privacy Policy | - | - | `getByRole('link', { name: 'Privacy Policy', exact: true })` |
| link | Barn Images | - | - | `getByRole('link', { name: 'Barn Images', exact: true })` |
| button | Open chat | chat-toggle | - | `getByRole('button', { name: 'Open chat', exact: true })` |
| button | Show live shop activity | live-activity-toggle | button | `getByRole('button', { name: 'Show live shop activity', exact: true })` |
| alert | Product added to shopping cart. | - | - | `getByRole('alert', { name: 'Product added to shopping cart.', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('alert')` | 1 ✔ | true | Product added to shopping cart. |
| `getByTestId('cart-quantity')` | 1 ✔ | true | 2 |
| `getByTestId('unit-price')` | 1 ✔ | true | 12.01 |
| `getByTestId('add-to-favorites')` | 1 ✔ | true |  Add to favourites |
| `getByTestId('product-name')` | 1 ✔ | true | Pliers |
