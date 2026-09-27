# AUT inspection (tier 3 — bundled inspector)

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — https://automationexercise.com
- URL: https://automationexercise.com/
- Title: Automation Exercise
- Captured: 2026-09-27T06:03:48.814Z
- testIdAttribute: `data-qa`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | goto | `login` | ✔ |
| 2 | fill | `locator('form').filter({ has: getByRole('button', { name: 'Login', exact: true }) }).getByPlaceholder('Email Address')` | ✔ |
| 3 | fill | `locator('form').filter({ has: getByRole('button', { name: 'Login', exact: true }) }).getByPlaceholder('Password')` | ✔ |
| 4 | click | `getByRole('button', { name: 'Login', exact: true })` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | - | - | - | `(no stable locator)` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true }) ⚠ matches 0` |
| link |  Products | - | - | `getByRole('link', { name: ' Products', exact: true })` |
| link | Cart | - | - | `getByRole('link', { name: 'Cart', exact: true }) ⚠ matches 0` |
| link | Logout | - | - | `getByRole('link', { name: 'Logout', exact: true }) ⚠ matches 0` |
| link | Delete Account | - | - | `getByRole('link', { name: 'Delete Account', exact: true }) ⚠ matches 0` |
| link | Test Cases | - | - | `getByRole('link', { name: 'Test Cases', exact: true })` |
| link | API Testing | - | - | `getByRole('link', { name: 'API Testing', exact: true }) ⚠ matches 0` |
| link | Video Tutorials | - | - | `getByRole('link', { name: 'Video Tutorials', exact: true }) ⚠ matches 0` |
| link | Contact us | - | - | `getByRole('link', { name: 'Contact us', exact: true }) ⚠ matches 0` |
| a | Logged in as QA Probe UI | - | - | `(no stable locator)` |
| heading | AutomationExercise | - | - | `getByRole('heading', { name: 'AutomationExercise', exact: true })` |
| heading | Full-Fledged practice website for Automation Engineers | - | - | `getByRole('heading', { name: 'Full-Fledged practice website for Automation Engineers', exact: true })` |
| button | Test Cases | - | button | `getByRole('button', { name: 'Test Cases', exact: true })` |
| link | APIs list for practice | - | - | `getByRole('link', { name: 'APIs list for practice', exact: true })` |
| button | APIs list for practice | - | button | `getByRole('button', { name: 'APIs list for practice', exact: true })` |
| heading | Category | - | - | `getByRole('heading', { name: 'Category', exact: true })` |
| link | Women | - | - | `getByRole('link', { name: 'Women', exact: true }) ⚠ matches 0` |
| link | Men | - | - | `getByRole('link', { name: 'Men', exact: true }) ⚠ matches 0` |
| link | Kids | - | - | `getByRole('link', { name: 'Kids', exact: true }) ⚠ matches 0` |
| heading | Brands | - | - | `getByRole('heading', { name: 'Brands', exact: true })` |
| link | (6)Polo | - | - | `getByRole('link', { name: '(6)Polo', exact: true }) ⚠ matches 0` |
| link | (5)H&M | - | - | `getByRole('link', { name: '(5)H&M', exact: true }) ⚠ matches 0` |
| link | (5)Madame | - | - | `getByRole('link', { name: '(5)Madame', exact: true }) ⚠ matches 0` |
| link | (3)Mast & Harbour | - | - | `getByRole('link', { name: '(3)Mast & Harbour', exact: true }) ⚠ matches 0` |
| link | (4)Babyhug | - | - | `getByRole('link', { name: '(4)Babyhug', exact: true }) ⚠ matches 0` |
| link | (3)Allen Solly Junior | - | - | `getByRole('link', { name: '(3)Allen Solly Junior', exact: true }) ⚠ matches 0` |
| link | (3)Kookie Kids | - | - | `getByRole('link', { name: '(3)Kookie Kids', exact: true }) ⚠ matches 0` |
| link | (5)Biba | - | - | `getByRole('link', { name: '(5)Biba', exact: true }) ⚠ matches 0` |
| heading | Features Items | - | - | `getByRole('heading', { name: 'Features Items', exact: true })` |
| heading | Rs. 500 | - | - | `getByRole('heading', { name: 'Rs. 500', exact: true }) ⚠ matches 2` |
| a | Add to cart | - | - | `(no stable locator)` |
| link | View Product | - | - | `getByRole('link', { name: 'View Product', exact: true }) ⚠ matches 0` |
| heading | Rs. 400 | - | - | `getByRole('heading', { name: 'Rs. 400', exact: true }) ⚠ matches 5` |
| heading | Rs. 1000 | - | - | `getByRole('heading', { name: 'Rs. 1000', exact: true }) ⚠ matches 6` |
| heading | Rs. 1500 | - | - | `getByRole('heading', { name: 'Rs. 1500', exact: true }) ⚠ matches 5` |
| heading | Rs. 600 | - | - | `getByRole('heading', { name: 'Rs. 600', exact: true }) ⚠ matches 3` |
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
| heading | recommended items | - | - | `getByRole('heading', { name: 'recommended items', exact: true })` |
| heading | Subscription | - | - | `getByRole('heading', { name: 'Subscription', exact: true })` |
| textbox | Your email address | - | email | `getByRole('textbox', { name: 'Your email address', exact: true })` |
| button | - | - | submit | `locator('#subscribe')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('header').getByText('Logged in as QA Probe UI')` | 1 ✔ | true |  Logged in as QA Probe UI |
| `getByRole('banner').getByText('Logged in as QA Probe UI')` | 1 ✔ | true |  Logged in as QA Probe UI |
| `getByText('Logged in as QA Probe UI')` | 1 ✔ | true |  Logged in as QA Probe UI |
| `locator('header')` | 1 ✔ | true |  Home  Products  Cart  Logout  Delete Account  Test Cases  API Testing  Video T |
