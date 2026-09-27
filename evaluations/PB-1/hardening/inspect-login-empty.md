
> hldout-skill@1.1.0 heldout
> tsx .claude/skills/heldout-evaluator/scripts/heldout.ts inspect --key PB-1 --url index.htm --steps-json [{"do":"click","target":"getByRole(\"button\", { name: \"Log In\", exact: true })"}] --probe getByText('Please enter a username and password.') --probe getByRole('heading', { name: 'Error!' })

# AUT inspection (tier 3 — bundled inspector)

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — https://parabank.parasoft.com/parabank/
- URL: https://parabank.parasoft.com/parabank/login.htm;jsessionid=204A832B518D430CAE39560B6995C85C
- Title: ParaBank | Error
- Captured: 2026-09-27T05:43:02.531Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | click | `getByRole("button", { name: "Log In", exact: true })` | ✔ |

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
- heading "Error!" [level=1]
- paragraph: Please enter a username and password.
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
| heading | Error! | - | - | `getByRole('heading', { name: 'Error!', exact: true })` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Forum | - | - | `getByRole('link', { name: 'Forum', exact: true })` |
| link | Site Map | - | - | `getByRole('link', { name: 'Site Map', exact: true })` |
| link | Contact Us | - | - | `getByRole('link', { name: 'Contact Us', exact: true })` |
| link | www.parasoft.com | - | - | `getByRole('link', { name: 'www.parasoft.com', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByText('Please enter a username and password.')` | 1 ✔ | true | Please enter a username and password. |
| `getByRole('heading', { name: 'Error!' })` | 1 ✔ | true | Error! |

