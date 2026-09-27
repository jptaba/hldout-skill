# AUT inspection (tier 3 — bundled inspector)

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — https://automationexercise.com
- URL: https://automationexercise.com/products?search=jean
- Title: Automation Exercise - All Products
- Captured: 2026-09-27T05:41:35.664Z
- testIdAttribute: `data-qa`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole("textbox", { name: "Search Product", exact: true })` | ✔ |
| 2 | click | `locator("#submit_search")` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | - | - | - | `(no stable locator)` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true }) ⚠ matches 0` |
| link |  Products | - | - | `getByRole('link', { name: ' Products', exact: true })` |
| link | Cart | - | - | `getByRole('link', { name: 'Cart', exact: true }) ⚠ matches 0` |
| link | Signup / Login | - | - | `getByRole('link', { name: 'Signup / Login', exact: true }) ⚠ matches 0` |
| link | Test Cases | - | - | `getByRole('link', { name: 'Test Cases', exact: true }) ⚠ matches 0` |
| link | API Testing | - | - | `getByRole('link', { name: 'API Testing', exact: true }) ⚠ matches 0` |
| link | Video Tutorials | - | - | `getByRole('link', { name: 'Video Tutorials', exact: true }) ⚠ matches 0` |
| link | Contact us | - | - | `getByRole('link', { name: 'Contact us', exact: true }) ⚠ matches 0` |
| textbox | Search Product | - | text | `getByRole('textbox', { name: 'Search Product', exact: true })` |
| button | - | - | button | `locator('#submit_search')` |
| heading | CATEGORY | - | - | `getByRole('heading', { name: 'CATEGORY', exact: true }) ⚠ matches 0` |
| link | WOMEN | - | - | `getByRole('link', { name: 'WOMEN', exact: true }) ⚠ matches 0` |
| link | MEN | - | - | `getByRole('link', { name: 'MEN', exact: true }) ⚠ matches 0` |
| link | KIDS | - | - | `getByRole('link', { name: 'KIDS', exact: true }) ⚠ matches 0` |
| heading | BRANDS | - | - | `getByRole('heading', { name: 'BRANDS', exact: true }) ⚠ matches 0` |
| link | (6) POLO | - | - | `getByRole('link', { name: '(6) POLO', exact: true }) ⚠ matches 0` |
| link | (5) H&M | - | - | `getByRole('link', { name: '(5) H&M', exact: true })` |
| link | (5) MADAME | - | - | `getByRole('link', { name: '(5) MADAME', exact: true }) ⚠ matches 0` |
| link | (3) MAST & HARBOUR | - | - | `getByRole('link', { name: '(3) MAST & HARBOUR', exact: true }) ⚠ matches 0` |
| link | (4) BABYHUG | - | - | `getByRole('link', { name: '(4) BABYHUG', exact: true }) ⚠ matches 0` |
| link | (3) ALLEN SOLLY JUNIOR | - | - | `getByRole('link', { name: '(3) ALLEN SOLLY JUNIOR', exact: true }) ⚠ matches 0` |
| link | (3) KOOKIE KIDS | - | - | `getByRole('link', { name: '(3) KOOKIE KIDS', exact: true }) ⚠ matches 0` |
| link | (5) BIBA | - | - | `getByRole('link', { name: '(5) BIBA', exact: true }) ⚠ matches 0` |
| heading | SEARCHED PRODUCTS | - | - | `getByRole('heading', { name: 'SEARCHED PRODUCTS', exact: true }) ⚠ matches 0` |
| heading | Rs. 799 | - | - | `getByRole('heading', { name: 'Rs. 799', exact: true }) ⚠ matches 2` |
| a | Add to cart | - | - | `(no stable locator)` |
| link | View Product | - | - | `getByRole('link', { name: 'View Product', exact: true }) ⚠ matches 0` |
| heading | Rs. 1200 | - | - | `getByRole('heading', { name: 'Rs. 1200', exact: true }) ⚠ matches 2` |
| heading | Rs. 1400 | - | - | `getByRole('heading', { name: 'Rs. 1400', exact: true }) ⚠ matches 2` |
| heading | SUBSCRIPTION | - | - | `getByRole('heading', { name: 'SUBSCRIPTION', exact: true }) ⚠ matches 0` |
| textbox | Your email address | - | email | `getByRole('textbox', { name: 'Your email address', exact: true })` |
| button | - | - | submit | `locator('#subscribe')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('textbox', { name: 'Search Product', exact: true })` | 1 ✔ | true | jean |
| `locator('#submit_search')` | 1 ✔ | true |  |
| `locator('.features_items h2.title')` | 1 ✔ | true | SEARCHED PRODUCTS |
| `locator('.features_items .productinfo p')` | 3 ⚠ not unique | true | Soft Stretch Jeans |
| `locator('.productinfo p')` | 3 ⚠ not unique | true | Soft Stretch Jeans |
| `getByRole('heading', { name: 'Searched Products' })` | 1 ✔ | true | SEARCHED PRODUCTS |
