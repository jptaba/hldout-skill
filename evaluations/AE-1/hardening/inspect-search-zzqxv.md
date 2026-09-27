# AUT inspection (tier 3 — bundled inspector)

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — https://automationexercise.com
- URL: https://automationexercise.com/products?search=zzqxv
- Title: Automation Exercise - All Products
- Captured: 2026-09-27T05:42:03.397Z
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
| heading | These are topics related to the article that might interest you | - | - | `getByRole('heading', { name: 'These are topics related to the article that might interest you', exact: true }) ⚠ matches 2` |
| link | Manufacturing | - | - | `getByRole('link', { name: 'Manufacturing', exact: true })` |
| link | Saree | - | - | `getByRole('link', { name: 'Saree', exact: true })` |
| link | Dresses | - | - | `getByRole('link', { name: 'Dresses', exact: true })` |
| link | Sarees | - | - | `getByRole('link', { name: 'Sarees', exact: true })` |
| link | T SHIRT | - | - | `getByRole('link', { name: 'T SHIRT', exact: true })` |
| link | Tshirt | - | - | `getByRole('link', { name: 'Tshirt', exact: true })` |
| link | T-Shirts | - | - | `getByRole('link', { name: 'T-Shirts', exact: true })` |
| link | South Asians & Diaspora | - | - | `getByRole('link', { name: 'South Asians & Diaspora', exact: true })` |
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
| heading | SUBSCRIPTION | - | - | `getByRole('heading', { name: 'SUBSCRIPTION', exact: true }) ⚠ matches 0` |
| textbox | Your email address | - | email | `getByRole('textbox', { name: 'Your email address', exact: true })` |
| button | - | - | submit | `locator('#subscribe')` |
| link | Polo | - | - | `getByRole('link', { name: 'Polo', exact: true })` |
| link | Apparel | - | - | `getByRole('link', { name: 'Apparel', exact: true })` |
| link | Textiles & Nonwovens | - | - | `getByRole('link', { name: 'Textiles & Nonwovens', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('.features_items h2.title')` | 1 ✔ | true | SEARCHED PRODUCTS |
| `locator('.features_items .productinfo p')` | 0 ✖ | false |  |
| `locator('.productinfo p')` | 0 ✖ | false |  |
