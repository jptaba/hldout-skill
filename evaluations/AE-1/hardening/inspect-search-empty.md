# AUT inspection (tier 3 — bundled inspector)

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — https://automationexercise.com
- URL: https://automationexercise.com/products?search=
- Title: Automation Exercise - All Products
- Captured: 2026-09-27T05:41:54.292Z
- testIdAttribute: `data-qa`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole('textbox', { name: 'Search Product', exact: true })` | ✔ |
| 2 | click | `locator('#submit_search')` | ✔ |

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
| heading | ALL PRODUCTS | - | - | `getByRole('heading', { name: 'ALL PRODUCTS', exact: true }) ⚠ matches 0` |
| heading | Rs. 500 | - | - | `getByRole('heading', { name: 'Rs. 500', exact: true }) ⚠ matches 2` |
| a | Add to cart | - | - | `(no stable locator)` |
| link | View Product | - | - | `getByRole('link', { name: 'View Product', exact: true }) ⚠ matches 0` |
| heading | Rs. 400 | - | - | `getByRole('heading', { name: 'Rs. 400', exact: true }) ⚠ matches 4` |
| heading | Rs. 1000 | - | - | `getByRole('heading', { name: 'Rs. 1000', exact: true }) ⚠ matches 6` |
| heading | Rs. 1500 | - | - | `getByRole('heading', { name: 'Rs. 1500', exact: true }) ⚠ matches 4` |
| heading | Rs. 600 | - | - | `getByRole('heading', { name: 'Rs. 600', exact: true }) ⚠ matches 2` |
| heading | Rs. 700 | - | - | `getByRole('heading', { name: 'Rs. 700', exact: true }) ⚠ matches 2` |
| heading | Rs. 499 | - | - | `getByRole('heading', { name: 'Rs. 499', exact: true }) ⚠ matches 2` |
| heading | Rs. 359 | - | - | `getByRole('heading', { name: 'Rs. 359', exact: true }) ⚠ matches 2` |
| heading | Rs. 278 | - | - | `getByRole('heading', { name: 'Rs. 278', exact: true }) ⚠ matches 2` |
| heading | Rs. 679 | - | - | `getByRole('heading', { name: 'Rs. 679', exact: true }) ⚠ matches 2` |
| heading | Rs. 315 | - | - | `getByRole('heading', { name: 'Rs. 315', exact: true }) ⚠ matches 2` |
| heading | Rs. 478 | - | - | `getByRole('heading', { name: 'Rs. 478', exact: true }) ⚠ matches 2` |
| heading | Rs. 1200 | - | - | `getByRole('heading', { name: 'Rs. 1200', exact: true }) ⚠ matches 4` |
| heading | Rs. 1050 | - | - | `getByRole('heading', { name: 'Rs. 1050', exact: true }) ⚠ matches 2` |
| heading | Rs. 1190 | - | - | `getByRole('heading', { name: 'Rs. 1190', exact: true }) ⚠ matches 2` |
| heading | Rs. 1530 | - | - | `getByRole('heading', { name: 'Rs. 1530', exact: true }) ⚠ matches 2` |
| heading | Rs. 1600 | - | - | `getByRole('heading', { name: 'Rs. 1600', exact: true }) ⚠ matches 2` |
| heading | Rs. 1100 | - | - | `getByRole('heading', { name: 'Rs. 1100', exact: true }) ⚠ matches 2` |
| heading | Rs. 849 | - | - | `getByRole('heading', { name: 'Rs. 849', exact: true }) ⚠ matches 2` |
| heading | Rs. 1299 | - | - | `getByRole('heading', { name: 'Rs. 1299', exact: true }) ⚠ matches 2` |
| heading | Rs. 850 | - | - | `getByRole('heading', { name: 'Rs. 850', exact: true }) ⚠ matches 2` |
| heading | Rs. 799 | - | - | `getByRole('heading', { name: 'Rs. 799', exact: true }) ⚠ matches 2` |
| heading | Rs. 1400 | - | - | `getByRole('heading', { name: 'Rs. 1400', exact: true }) ⚠ matches 4` |
| heading | Rs. 2300 | - | - | `getByRole('heading', { name: 'Rs. 2300', exact: true }) ⚠ matches 2` |
| heading | Rs. 3000 | - | - | `getByRole('heading', { name: 'Rs. 3000', exact: true }) ⚠ matches 2` |
| heading | Rs. 3500 | - | - | `getByRole('heading', { name: 'Rs. 3500', exact: true }) ⚠ matches 2` |
| heading | Rs. 5000 | - | - | `getByRole('heading', { name: 'Rs. 5000', exact: true }) ⚠ matches 2` |
| heading | Rs. 1389 | - | - | `getByRole('heading', { name: 'Rs. 1389', exact: true }) ⚠ matches 2` |
| heading | SUBSCRIPTION | - | - | `getByRole('heading', { name: 'SUBSCRIPTION', exact: true }) ⚠ matches 0` |
| textbox | Your email address | - | email | `getByRole('textbox', { name: 'Your email address', exact: true })` |
| button | - | - | submit | `locator('#subscribe')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('.features_items h2.title')` | 1 ✔ | true | ALL PRODUCTS |
| `locator('.features_items .productinfo p')` | 34 ⚠ not unique | true | Blue Top |
| `locator('.productinfo p')` | 34 ⚠ not unique | true | Blue Top |
