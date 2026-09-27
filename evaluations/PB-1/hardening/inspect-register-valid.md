
> hldout-skill@1.1.0 heldout
> tsx .claude/skills/heldout-evaluator/scripts/heldout.ts inspect --key PB-1 --url register.htm --steps-json [{"do":"fill","target":"locator(\"[id=\\\"customer.firstName\\\"]\")","value":"Hana"},{"do":"fill","target":"locator(\"[id=\\\"customer.lastName\\\"]\")","value":"Probe"},{"do":"fill","target":"locator(\"[id=\\\"customer.address.street\\\"]\")","value":"12 Heldout Lane"},{"do":"fill","target":"locator(\"[id=\\\"customer.address.city\\\"]\")","value":"Testville"},{"do":"fill","target":"locator(\"[id=\\\"customer.address.state\\\"]\")","value":"CA"},{"do":"fill","target":"locator(\"[id=\\\"customer.address.zipCode\\\"]\")","value":"94016"},{"do":"fill","target":"locator(\"[id=\\\"customer.phoneNumber\\\"]\")","value":"5551234567"},{"do":"fill","target":"locator(\"[id=\\\"customer.ssn\\\"]\")","value":"123-45-6789"},{"do":"fill","target":"locator(\"[id=\\\"customer.username\\\"]\")","value":"pb1h487730"},{"do":"fill","target":"locator(\"[id=\\\"customer.password\\\"]\")","value":"${env:PB_USER_PASSWORD}"},{"do":"fill","target":"locator(\"[id=\\\"repeatedPassword\\\"]\")","value":"${env:PB_USER_PASSWORD}"},{"do":"click","target":"getByRole(\"button\", { name: \"Register\", exact: true })"}] --probe getByRole('heading', { name: 'Welcome pb1h487730' }) --probe getByText('Welcome Hana Probe') --probe getByRole('heading', { name: 'Account Services' }) --probe getByText('Your account was created successfully. You are now logged in.') --probe getByRole('link', { name: 'Log Out' }) --probe getByRole('link', { name: 'Accounts Overview' })

# AUT inspection (tier 3 — bundled inspector)

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — https://parabank.parasoft.com/parabank/
- URL: https://parabank.parasoft.com/parabank/register.htm
- Title: ParaBank | Customer Created
- Captured: 2026-09-27T05:42:13.723Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `locator("[id=\"customer.firstName\"]")` | ✔ |
| 2 | fill | `locator("[id=\"customer.lastName\"]")` | ✔ |
| 3 | fill | `locator("[id=\"customer.address.street\"]")` | ✔ |
| 4 | fill | `locator("[id=\"customer.address.city\"]")` | ✔ |
| 5 | fill | `locator("[id=\"customer.address.state\"]")` | ✔ |
| 6 | fill | `locator("[id=\"customer.address.zipCode\"]")` | ✔ |
| 7 | fill | `locator("[id=\"customer.phoneNumber\"]")` | ✔ |
| 8 | fill | `locator("[id=\"customer.ssn\"]")` | ✔ |
| 9 | fill | `locator("[id=\"customer.username\"]")` | ✔ |
| 10 | fill | `locator("[id=\"customer.password\"]")` | ✔ |
| 11 | fill | `locator("[id=\"repeatedPassword\"]")` | ✔ |
| 12 | click | `getByRole("button", { name: "Register", exact: true })` | ✔ |

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
- paragraph: Welcome Hana Probe
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
- heading "Welcome pb1h487730" [level=1]
- paragraph: Your account was created successfully. You are now logged in.
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
| link | About Us | - | - | `getByRole('link', { name: 'About Us', exact: true }) ⚠ matches 2` |
| link | Services | - | - | `getByRole('link', { name: 'Services', exact: true }) ⚠ matches 2` |
| link | Products | - | - | `getByRole('link', { name: 'Products', exact: true }) ⚠ matches 2` |
| link | Locations | - | - | `getByRole('link', { name: 'Locations', exact: true }) ⚠ matches 2` |
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
| heading | Welcome pb1h487730 | - | - | `getByRole('heading', { name: 'Welcome pb1h487730', exact: true })` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Forum | - | - | `getByRole('link', { name: 'Forum', exact: true })` |
| link | Site Map | - | - | `getByRole('link', { name: 'Site Map', exact: true })` |
| link | Contact Us | - | - | `getByRole('link', { name: 'Contact Us', exact: true })` |
| link | www.parasoft.com | - | - | `getByRole('link', { name: 'www.parasoft.com', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: 'Welcome pb1h487730' })` | 1 ✔ | true | Welcome pb1h487730 |
| `getByText('Welcome Hana Probe')` | 1 ✔ | true | Welcome Hana Probe |
| `getByRole('heading', { name: 'Account Services' })` | 1 ✔ | true | Account Services |
| `getByText('Your account was created successfully. You are now logged in.')` | 1 ✔ | true | Your account was created successfully. You are now logged in. |
| `getByRole('link', { name: 'Log Out' })` | 1 ✔ | true | Log Out |
| `getByRole('link', { name: 'Accounts Overview' })` | 1 ✔ | true | Accounts Overview |

