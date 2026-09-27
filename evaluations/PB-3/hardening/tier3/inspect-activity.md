# AUT inspection (tier 3 — bundled inspector)

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — https://parabank.parasoft.com/parabank/
- URL: https://parabank.parasoft.com/parabank/activity.htm?id=39318
- Title: ParaBank | Account Activity
- Captured: 2026-09-27T12:35:40.349Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | goto | `index.htm` | ✔ |
| 2 | fill | `locator('input[name="username"]')` | ✔ |
| 3 | fill | `locator('input[name="password"]')` | ✔ |
| 4 | click | `getByRole('button', { name: 'Log In' })` | ✔ |
| 5 | wait | `getByRole('heading', { name: 'Accounts Overview' })` | ✔ |
| 6 | goto | `activity.htm?id=39318` | ✔ |
| 7 | wait | `locator('#transactionTable tbody tr')` | ✖ locator.waitFor: Error: strict mode violation: locator('#transactionTable tbody tr') resolved to 2 elements: |

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
- heading "Account Details" [level=1]
- table:
  - rowgroup:
    - 'row "Account Number: 39318"':
      - cell "Account Number:"
      - cell "39318"
    - 'row "Account Type: CHECKING"':
      - cell "Account Type:"
      - cell "CHECKING"
    - 'row "Balance: $390.00"':
      - cell "Balance:"
      - cell "$390.00"
    - 'row "Available: $390.00"':
      - cell "Available:"
      - cell "$390.00"
- heading "Account Activity" [level=1]
- table:
  - rowgroup:
    - 'row "Activity Period: All"':
      - cell "Activity Period:"
      - cell "All":
        - combobox:
          - option "All" [selected]
          - option "January"
          - option "February"
          - option "March"
          - option "April"
          - option "May"
          - option "June"
          - option "July"
          - option "August"
          - option "September"
          - option "October"
          - option "November"
          - option "December"
    - 'row "Type: All"':
      - cell "Type:"
      - cell "All":
        - combobox:
          - option "All" [selected]
          - option "Credit"
          - option "Debit"
    - row "Go":
      - cell
      - cell "Go":
        - button "Go"
- table:
  - rowgroup:
    - row "Date Transaction Debit (-) Credit (+)":
      - columnheader "Date"
      - columnheader "Transaction"
      - columnheader "Debit (-)"
      - columnheader "Credit (+)"
  - rowgroup:
    - row "09-26-2026 Funds Transfer Sent $100.00":
      - cell "09-26-2026"
      - cell "Funds Transfer Sent":
        - link "Funds Transfer Sent":
          - /url: transaction.htm?id=58987
      - cell "$100.00"
      - cell
    - row "09-26-2026 Funds Transfer Sent $25.50":
      - cell "09-26-2026"
      - cell "Funds Transfer Sent":
        - link "Funds Transfer Sent":
          - /url: transaction.htm?id=59653
      - cell "$25.50"
      - cell
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
| heading | Account Details | - | - | `getByRole('heading', { name: 'Account Details', exact: true })` |
| heading | Account Activity | - | - | `getByRole('heading', { name: 'Account Activity', exact: true })` |
| combobox | All January February March April May June July August September October November | - | - | `locator('#month')` |
| combobox | All Credit Debit | - | - | `locator('#transactionType')` |
| button | Go | - | submit | `getByRole('button', { name: 'Go', exact: true })` |
| link | Funds Transfer Sent | - | - | `getByRole('link', { name: 'Funds Transfer Sent' }) ⚠ matches 2: add .nth() or scope it` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Forum | - | - | `getByRole('link', { name: 'Forum', exact: true })` |
| link | Site Map | - | - | `getByRole('link', { name: 'Site Map', exact: true })` |
| link | Contact Us | - | - | `getByRole('link', { name: 'Contact Us', exact: true })` |
| link | www.parasoft.com | - | - | `getByRole('link', { name: 'www.parasoft.com', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('#transactionTable')` | 1 ✔ | true | Date	Transaction	Debit (-)	Credit (+) 09-26-2026	Funds Transfer Sent	$100.00	 09 |
| `locator('#transactionTable').getByRole('row').filter({ hasText: 'Funds Transfer Sent' })` | 2 ⚠ not unique | true | 09-26-2026	Funds Transfer Sent	$100.00	 |
| `locator('#transactionTable').getByRole('columnheader')` | 4 ⚠ not unique | true | Date |
