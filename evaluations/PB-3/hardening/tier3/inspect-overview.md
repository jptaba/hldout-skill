# AUT inspection (tier 3 — bundled inspector)

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — https://parabank.parasoft.com/parabank/
- URL: https://parabank.parasoft.com/parabank/overview.htm
- Title: ParaBank | Accounts Overview
- Captured: 2026-09-27T12:33:02.977Z
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
| 15 | goto | `overview.htm` | ✔ |

## Accessibility snapshot

```yaml
- link:
  - /url: admin.htm
  - img
- link "ParaBank":
  - /url: index.htm
  - img "ParaBank"
- paragraph: Experience the difference
- list:
  - listitem: Solutions
  - listitem:
    - link "About Us":
      - /url: about.htm
  - listitem:
    - link "Services":
      - /url: services.htm
  - listitem:
    - link "Products":
      - /url: http://www.parasoft.com/jsp/products.jsp
  - listitem:
    - link "Locations":
      - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
  - listitem:
    - link "Admin Page":
      - /url: admin.htm
- list:
  - listitem:
    - link "home":
      - /url: index.htm
  - listitem:
    - link "about":
      - /url: about.htm
  - listitem:
    - link "contact":
      - /url: contact.htm
- paragraph: Welcome Heldout Tester
- heading "Account Services" [level=2]
- list:
  - listitem:
    - link "Open New Account":
      - /url: openaccount.htm
  - listitem:
    - link "Accounts Overview":
      - /url: overview.htm
  - listitem:
    - link "Transfer Funds":
      - /url: transfer.htm
  - listitem:
    - link "Bill Pay":
      - /url: billpay.htm
  - listitem:
    - link "Find Transactions":
      - /url: findtrans.htm
  - listitem:
    - link "Update Contact Info":
      - /url: updateprofile.htm
  - listitem:
    - link "Request Loan":
      - /url: requestloan.htm
  - listitem:
    - link "Log Out":
      - /url: logout.htm
- heading "Accounts Overview" [level=1]
- table:
  - rowgroup:
    - row "Account Balance* Available Amount":
      - columnheader "Account"
      - columnheader "Balance*"
      - columnheader "Available Amount"
  - rowgroup:
    - row "39318 $515.50 $515.50":
      - cell "39318":
        - link "39318":
          - /url: activity.htm?id=39318
      - cell "$515.50"
      - cell "$515.50"
    - row "Total $515.50":
      - cell "Total"
      - cell "$515.50"
      - cell
  - rowgroup:
    - row "*Balance includes deposits that may be subject to holds":
      - cell "*Balance includes deposits that may be subject to holds"
- list:
  - listitem:
    - link "Home":
      - /url: index.htm
    - text: "|"
  - listitem:
    - link "About Us":
      - /url: about.htm
    - text: "|"
  - listitem:
    - link "Services":
      - /url: services.htm
    - text: "|"
  - listitem:
    - link "Products":
      - /url: http://www.parasoft.com/jsp/products.jsp
    - text: "|"
  - listitem:
    - link "Locations":
      - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
    - text: "|"
  - listitem:
    - link "Forum":
      - /url: http://forums.parasoft.com/
    - text: "|"
  - listitem:
    - link "Site Map":
      - /url: sitemap.htm
    - text: "|"
  - listitem:
    - link "Contact Us":
      - /url: contact.htm
- paragraph: © Parasoft. All rights reserved.
- list:
  - listitem: "Visit us at:"
  - listitem:
    - link "www.parasoft.com":
      - /url: http://www.parasoft.com/
```

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
| link | 39318 | - | - | `getByRole('link', { name: '39318', exact: true })` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Forum | - | - | `getByRole('link', { name: 'Forum', exact: true })` |
| link | Site Map | - | - | `getByRole('link', { name: 'Site Map', exact: true })` |
| link | Contact Us | - | - | `getByRole('link', { name: 'Contact Us', exact: true })` |
| link | www.parasoft.com | - | - | `getByRole('link', { name: 'www.parasoft.com', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: 'Welcome pb3h512379' })` | 0 ✖ | false |  |
| `locator('#accountTable')` | 1 ✔ | true | Account	Balance*	Available Amount 39318	$515.50	$515.50 Total	$515.50	  *Balance |
