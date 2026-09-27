# AUT inspection (tier 3 — bundled inspector)

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — https://parabank.parasoft.com/parabank/
- URL: https://parabank.parasoft.com/parabank/overview.htm
- Title: ParaBank | Accounts Overview
- Captured: 2026-09-27T13:08:53.489Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | goto | `register.htm` | ✔ |
| 2 | fill | `locator('[id="customer.firstName"]')` | ✔ |
| 3 | fill | `locator('[id="customer.lastName"]')` | ✔ |
| 4 | fill | `locator('[id="customer.address.street"]')` | ✔ |
| 5 | fill | `locator('[id="customer.address.city"]')` | ✔ |
| 6 | fill | `locator('[id="customer.address.state"]')` | ✔ |
| 7 | fill | `locator('[id="customer.address.zipCode"]')` | ✔ |
| 8 | fill | `locator('[id="customer.phoneNumber"]')` | ✔ |
| 9 | fill | `locator('[id="customer.ssn"]')` | ✔ |
| 10 | fill | `locator('[id="customer.username"]')` | ✔ |
| 11 | fill | `locator('[id="customer.password"]')` | ✔ |
| 12 | fill | `locator('#repeatedPassword')` | ✔ |
| 13 | click | `getByRole('button', { name: 'Register', exact: true })` | ✔ |
| 14 | wait | `getByText('Your account was created successfully')` | ✔ |
| 15 | goto | `openaccount.htm` | ✔ |
| 16 | wait | `locator('#fromAccountId:has(option)')` | ✔ |
| 17 | click | `getByRole('button', { name: 'Open New Account' })` | ✔ |
| 18 | wait | `locator('#newAccountId')` | ✔ |
| 19 | goto | `overview.htm` | ✔ |
| 20 | wait | `locator('#accountTable a')` | ✖ locator.waitFor: Error: strict mode violation: locator('#accountTable a') resolved to 2 elements: |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | About Us | - | - | `getByRole('link', { name: 'About Us' }) ⚠ matches 2: add .nth() or scope it` |
| link | Services | - | - | `getByRole('link', { name: 'Services' }) ⚠ matches 2: add .nth() or scope it` |
| link | Products | - | - | `getByRole('link', { name: 'Products' }) ⚠ matches 2: add .nth() or scope it` |
| link | Locations | - | - | `getByRole('link', { name: 'Locations' }) ⚠ matches 2: add .nth() or scope it` |
| link | Admin Page | - | - | `getByRole('link', { name: 'Admin Page', exact: true })` |
| link | home | - | - | `getByRole('link', { name: 'home', exact: true })` |
| link | about | - | - | `getByRole('link', { name: 'about', exact: true })` |
| link | contact | - | - | `getByRole('link', { name: 'contact', exact: true })` |
| heading | Account Services | - | - | `getByRole('heading', { name: 'Account Services', exact: true })` |
| link | Open New Account | - | - | `getByRole('link', { name: 'Open New Account', exact: true })` |
| link | Accounts Overview | - | - | `getByRole('link', { name: 'Accounts Overview', exact: true })` |
| link | Transfer Funds | - | - | `getByRole('link', { name: 'Transfer Funds', exact: true })` |
| link | Bill Pay | - | - | `getByRole('link', { name: 'Bill Pay', exact: true })` |
| link | Find Transactions | - | - | `getByRole('link', { name: 'Find Transactions', exact: true })` |
| link | Update Contact Info | - | - | `getByRole('link', { name: 'Update Contact Info', exact: true })` |
| link | Request Loan | - | - | `getByRole('link', { name: 'Request Loan', exact: true })` |
| link | Log Out | - | - | `getByRole('link', { name: 'Log Out', exact: true })` |
| heading | Accounts Overview | - | - | `getByRole('heading', { name: 'Accounts Overview', exact: true })` |
| link | 17673 | - | - | `getByRole('link', { name: '17673', exact: true })` |
| link | 17784 | - | - | `getByRole('link', { name: '17784', exact: true })` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Forum | - | - | `getByRole('link', { name: 'Forum', exact: true })` |
| link | Site Map | - | - | `getByRole('link', { name: 'Site Map', exact: true })` |
| link | Contact Us | - | - | `getByRole('link', { name: 'Contact Us', exact: true })` |
| link | www.parasoft.com | - | - | `getByRole('link', { name: 'www.parasoft.com', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('#accountTable a')` | 2 ⚠ not unique | true | 17673 |
