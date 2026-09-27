
> hldout-skill@1.1.0 heldout
> tsx .claude/skills/heldout-evaluator/scripts/heldout.ts inspect --key PB-1 --url register.htm --steps-json [{"do":"fill","target":"locator('[id=\"customer.firstName\"]')","value":"Mia"},{"do":"fill","target":"locator('[id=\"customer.lastName\"]')","value":"Dup"},{"do":"fill","target":"locator('[id=\"customer.address.street\"]')","value":"1 A St"},{"do":"fill","target":"locator('[id=\"customer.address.city\"]')","value":"X"},{"do":"fill","target":"locator('[id=\"customer.address.state\"]')","value":"CA"},{"do":"fill","target":"locator('[id=\"customer.address.zipCode\"]')","value":"1"},{"do":"fill","target":"locator('[id=\"customer.ssn\"]')","value":"1"},{"do":"fill","target":"locator('[id=\"customer.username\"]')","value":"pb1h487730mm"},{"do":"fill","target":"locator('[id=\"customer.password\"]')","value":"${env:PB_USER_PASSWORD}"},{"do":"fill","target":"locator('[id=\"repeatedPassword\"]')","value":"Mismatch-9x"},{"do":"click","target":"getByRole('button', { name: 'Register', exact: true })"}] --probe getByText('Passwords did not match.') --probe locator('tr').filter({ has: locator('#repeatedPassword') })

# AUT inspection (tier 3 — bundled inspector)

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — https://parabank.parasoft.com/parabank/
- URL: https://parabank.parasoft.com/parabank/register.htm
- Title: ParaBank | Register for Free Online Account Access
- Captured: 2026-09-27T05:44:16.037Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `locator('[id="customer.firstName"]')` | ✔ |
| 2 | fill | `locator('[id="customer.lastName"]')` | ✔ |
| 3 | fill | `locator('[id="customer.address.street"]')` | ✔ |
| 4 | fill | `locator('[id="customer.address.city"]')` | ✔ |
| 5 | fill | `locator('[id="customer.address.state"]')` | ✔ |
| 6 | fill | `locator('[id="customer.address.zipCode"]')` | ✔ |
| 7 | fill | `locator('[id="customer.ssn"]')` | ✔ |
| 8 | fill | `locator('[id="customer.username"]')` | ✔ |
| 9 | fill | `locator('[id="customer.password"]')` | ✔ |
| 10 | fill | `locator('[id="repeatedPassword"]')` | ✔ |
| 11 | click | `getByRole('button', { name: 'Register', exact: true })` | ✔ |

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
- heading "Customer Login" [level=2]
- paragraph: Username
- textbox
- paragraph: Password
- textbox
- button "Log In"
- paragraph:
  - link "Forgot login info?":
    - /url: lookup.htm
- paragraph:
  - link "Register":
    - /url: register.htm
- heading "Signing up is easy!" [level=1]
- paragraph: If you have an account with us you can sign-up for free instant online access. You will have to provide some personal information.
- table:
  - rowgroup:
    - 'row "First Name: Mia"':
      - cell "First Name:"
      - cell "Mia":
        - textbox: Mia
      - cell
    - 'row "Last Name: Dup"':
      - cell "Last Name:"
      - cell "Dup":
        - textbox: Dup
      - cell
    - 'row "Address: 1 A St"':
      - cell "Address:"
      - cell "1 A St":
        - textbox: 1 A St
      - cell
    - 'row "City: X"':
      - cell "City:"
      - cell "X":
        - textbox: X
      - cell
    - 'row "State: CA"':
      - cell "State:"
      - cell "CA":
        - textbox: CA
      - cell
    - 'row "Zip Code: 1"':
      - cell "Zip Code:"
      - cell "1":
        - textbox: "1"
      - cell
    - 'row "Phone #:"':
      - 'cell "Phone #:"'
      - cell:
        - textbox
      - cell
    - 'row "SSN: 1"':
      - cell "SSN:"
      - cell "1":
        - textbox: "1"
      - cell
    - row:
      - cell
    - 'row "Username: pb1h487730mm"':
      - cell "Username:"
      - cell "pb1h487730mm":
        - textbox: pb1h487730mm
      - cell
    - row "Password:":
      - cell "Password:"
      - cell:
        - textbox
      - cell
    - 'row "Confirm: Passwords did not match."':
      - cell "Confirm:"
      - cell:
        - textbox
      - cell "Passwords did not match."
    - row "Register":
      - cell
      - cell "Register":
        - button "Register"
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
| heading | Customer Login | - | - | `getByRole('heading', { name: 'Customer Login', exact: true })` |
| textbox | - | - | text | `(no stable locator)` |
| textbox | - | - | password | `(no stable locator)` |
| button | Log In | - | submit | `getByRole('button', { name: 'Log In', exact: true })` |
| link | Forgot login info? | - | - | `getByRole('link', { name: 'Forgot login info?', exact: true })` |
| link | Register | - | - | `getByRole('link', { name: 'Register', exact: true })` |
| heading | Signing up is easy! | - | - | `getByRole('heading', { name: 'Signing up is easy!', exact: true })` |
| textbox | - | - | text | `locator('#customer.firstName') ⚠ matches 0` |
| textbox | - | - | text | `locator('#customer.lastName') ⚠ matches 0` |
| textbox | - | - | text | `locator('#customer.address.street') ⚠ matches 0` |
| textbox | - | - | text | `locator('#customer.address.city') ⚠ matches 0` |
| textbox | - | - | text | `locator('#customer.address.state') ⚠ matches 0` |
| textbox | - | - | text | `locator('#customer.address.zipCode') ⚠ matches 0` |
| textbox | - | - | text | `locator('#customer.phoneNumber') ⚠ matches 0` |
| textbox | - | - | text | `locator('#customer.ssn') ⚠ matches 0` |
| textbox | - | - | text | `locator('#customer.username') ⚠ matches 0` |
| textbox | - | - | password | `locator('#customer.password') ⚠ matches 0` |
| textbox | - | - | password | `locator('#repeatedPassword')` |
| button | Register | - | submit | `getByRole('button', { name: 'Register', exact: true })` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Forum | - | - | `getByRole('link', { name: 'Forum', exact: true })` |
| link | Site Map | - | - | `getByRole('link', { name: 'Site Map', exact: true })` |
| link | Contact Us | - | - | `getByRole('link', { name: 'Contact Us', exact: true })` |
| link | www.parasoft.com | - | - | `getByRole('link', { name: 'www.parasoft.com', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByText('Passwords did not match.')` | 1 ✔ | true | Passwords did not match. |
| `locator('tr').filter({ has: locator('#repeatedPassword') })` | 1 ✔ | true | Confirm:		Passwords did not match. |

