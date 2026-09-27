
> hldout-skill@1.1.0 heldout
> tsx .claude/skills/heldout-evaluator/scripts/heldout.ts inspect --key PB-1 --url register.htm --steps-json [{"do":"click","target":"getByRole(\"button\", { name: \"Register\", exact: true })"}] --probe locator('tr').filter({ has: locator('[id="customer.firstName"]') }) --probe locator('[id="customer.phoneNumber"]')

# AUT inspection (tier 3 — bundled inspector)

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — https://parabank.parasoft.com/parabank/
- URL: https://parabank.parasoft.com/parabank/register.htm
- Title: ParaBank | Register for Free Online Account Access
- Captured: 2026-09-27T05:41:57.758Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | click | `getByRole("button", { name: "Register", exact: true })` | ✔ |

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
    - 'row "First Name: First name is required."':
      - cell "First Name:"
      - cell:
        - textbox
      - cell "First name is required."
    - 'row "Last Name: Last name is required."':
      - cell "Last Name:"
      - cell:
        - textbox
      - cell "Last name is required."
    - 'row "Address: Address is required."':
      - cell "Address:"
      - cell:
        - textbox
      - cell "Address is required."
    - 'row "City: City is required."':
      - cell "City:"
      - cell:
        - textbox
      - cell "City is required."
    - 'row "State: State is required."':
      - cell "State:"
      - cell:
        - textbox
      - cell "State is required."
    - 'row "Zip Code: Zip Code is required."':
      - cell "Zip Code:"
      - cell:
        - textbox
      - cell "Zip Code is required."
    - 'row "Phone #:"':
      - 'cell "Phone #:"'
      - cell:
        - textbox
      - cell
    - 'row "SSN: Social Security Number is required."':
      - cell "SSN:"
      - cell:
        - textbox
      - cell "Social Security Number is required."
    - row:
      - cell
    - 'row "Username: Username is required."':
      - cell "Username:"
      - cell:
        - textbox
      - cell "Username is required."
    - 'row "Password: Password is required."':
      - cell "Password:"
      - cell:
        - textbox
      - cell "Password is required."
    - 'row "Confirm: Password confirmation is required."':
      - cell "Confirm:"
      - cell:
        - textbox
      - cell "Password confirmation is required."
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
| `locator('tr').filter({ has: locator('[id="customer.firstName"]') })` | 1 ✔ | true | First Name:		First name is required. |
| `locator('[id="customer.phoneNumber"]')` | 1 ✔ | true |  |

