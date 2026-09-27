# AUT inspection (tier 3 — bundled inspector)

- AUT: Toolshop release candidate (with-bugs build) (profile `toolshop-rc`) — https://with-bugs.practicesoftwaretesting.com
- URL: https://with-bugs.practicesoftwaretesting.com/#/product/1
- Title: Practice Software Testing - Toolshop - v5.0 with bugs
- Captured: 2026-09-26T20:12:48.589Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | wait | `getByTestId('product-1')` | ✔ |
| 2 | click | `getByTestId('product-1')` | ✔ |
| 3 | wait | `getByTestId('add-to-cart')` | ✔ |
| 4 | click | `getByTestId('add-to-cart')` | ✔ |
| 5 | wait | `getByRole('alert')` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| div | View the Documentation for this application. | notification-bar | - | `getByTestId('notification-bar')` |
| link | Documentation | - | - | `getByRole('link', { name: 'Documentation', exact: true })` |
| button | Bug Hunting Guide | - | - | `getByRole('button', { name: 'Bug Hunting Guide', exact: true })` |
| link | Practice Software Testing - Toolshop | - | - | `getByRole('link', { name: 'Practice Software Testing - Toolshop', exact: true })` |
| menubar | Main menu | - | - | `getByRole('menubar', { name: 'Main menu', exact: true })` |
| menuitem | Home | - | - | `getByRole('menuitem', { name: 'Home', exact: true })` |
| link | Home | nav-home | - | `getByRole('link', { name: 'Home', exact: true })` |
| menuitem | Categories | - | - | `getByRole('menuitem', { name: 'Categories', exact: true })` |
| button | Categories | nav-categories | - | `getByRole('button', { name: 'Categories', exact: true })` |
| menuitem | Contakt | - | - | `getByRole('menuitem', { name: 'Contakt', exact: true })` |
| link | Contakt | nav-contact | - | `getByRole('link', { name: 'Contakt', exact: true })` |
| menuitem | Sign in | - | - | `getByRole('menuitem', { name: 'Sign in', exact: true })` |
| link | Sign in | nav-sign-in | - | `getByRole('link', { name: 'Sign in', exact: true })` |
| menuitem | 1 | - | - | `getByRole('menuitem', { name: '1', exact: true }) ⚠ matches 0` |
| link | cart | nav-cart | - | `getByRole('link', { name: 'cart', exact: true })` |
| span | 1 | cart-quantity | - | `getByTestId('cart-quantity')` |
| span | ECO | eco-badge | - | `getByTestId('eco-badge')` |
| link | Helinton Fantin | - | - | `getByRole('link', { name: 'Helinton Fantin', exact: true })` |
| link | Unsplash | - | - | `getByRole('link', { name: 'Unsplash', exact: true }) ⚠ matches 2` |
| heading | Combination Pliers | product-name | - | `getByRole('heading', { name: 'Combination Pliers', exact: true })` |
| div | A B C D E | co2-rating-badge | - | `getByTestId('co2-rating-badge')` |
| span | unit-price | unit-price | - | `getByTestId('unit-price')` |
| p | Versatile combination pliers designed for gripping, bending, and cutting wire wi | product-description | - | `getByTestId('product-description')` |
| button | - | decrease-quantity | - | `getByTestId('decrease-quantity')` |
| spinbutton | - | quantity | number | `getByTestId('quantity')` |
| button | - | increase-quantity | - | `getByTestId('increase-quantity')` |
| button | Add to cart | add-to-cart | - | `getByTestId('add-to-cart')` |
| button | Add to favourites | add-to-favorites | - | `getByTestId('add-to-favorites')` |
| heading | Reltded products | - | - | `getByRole('heading', { name: 'Reltded products', exact: true })` |
| link | Pliers More information | - | - | `getByRole('link', { name: 'Pliers More information', exact: true })` |
| link | More information | - | - | `getByRole('link', { name: 'More information', exact: true }) ⚠ matches 4` |
| link | Long Nose Pliers More information | - | - | `getByRole('link', { name: 'Long Nose Pliers More information', exact: true })` |
| link | Bolt Cutters More information | - | - | `getByRole('link', { name: 'Bolt Cutters More information', exact: true })` |
| link | Slip Joint Pliers More information | - | - | `getByRole('link', { name: 'Slip Joint Pliers More information', exact: true })` |
| div | LEARN & EXPLORE Learn Test Automation Hands-on courses for Playwright, Robot Fra | footer-explore | - | `getByTestId('footer-explore')` |
| link | Learn Test Automation Hands-on courses for Playwright, Robot Framework, APIs and | footer-learn-courses | - | `getByTestId('footer-learn-courses')` |
| link | API Spector Open-source API testing, mocking and contract testing | footer-learn-spector | - | `getByRole('link', { name: 'API Spector Open-source API testing, mocking and contract testing', exact: true })` |
| link | GitHub Source code, issues and contributions | footer-learn-github | - | `getByRole('link', { name: 'GitHub Source code, issues and contributions', exact: true })` |
| link | Barn Images | - | - | `getByRole('link', { name: 'Barn Images', exact: true })` |
| alert | Oeps, something went wrong. | - | - | `getByRole('alert', { name: 'Oeps, something went wrong.', exact: true }) ⚠ matches 0` |
| button | Open chat | chat-toggle | - | `getByRole('button', { name: 'Open chat', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('alert')` | 1 ✔ | true | Oeps, something went wrong. |
| `getByTestId('cart-quantity')` | 1 ✔ | true | 1 |
