# AUT inspection (tier 3 — bundled inspector)

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — https://parabank.parasoft.com/parabank/
- URL: https://parabank.parasoft.com/parabank/register.htm
- Title: ParaBank | Register for Free Online Account Access
- Captured: 2026-09-27T12:32:42.648Z
- testIdAttribute: `data-testid`

## Accessibility snapshot

```yaml
- link:
  - /url: admin.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
  - img
- link "ParaBank":
  - /url: index.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
  - img "ParaBank"
- paragraph: Experience the difference
- list:
  - listitem: Solutions
  - listitem:
    - link "About Us":
      - /url: about.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
  - listitem:
    - link "Services":
      - /url: services.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
  - listitem:
    - link "Products":
      - /url: http://www.parasoft.com/jsp/products.jsp
  - listitem:
    - link "Locations":
      - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
  - listitem:
    - link "Admin Page":
      - /url: admin.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
- list:
  - listitem:
    - link "home":
      - /url: index.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
  - listitem:
    - link "about":
      - /url: about.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
  - listitem:
    - link "contact":
      - /url: contact.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
- heading "Customer Login" [level=2]
- paragraph: Username
- textbox
- paragraph: Password
- textbox
- button "Log In"
- paragraph:
  - link "Forgot login info?":
    - /url: lookup.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
- paragraph:
  - link "Register":
    - /url: register.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
- heading "Signing up is easy!" [level=1]
- paragraph: If you have an account with us you can sign-up for free instant online access. You will have to provide some personal information.
- table:
  - rowgroup:
    - row "First Name:":
      - cell "First Name:"
      - cell:
        - textbox
      - cell
    - row "Last Name:":
      - cell "Last Name:"
      - cell:
        - textbox
      - cell
    - row "Address:":
      - cell "Address:"
      - cell:
        - textbox
      - cell
    - row "City:":
      - cell "City:"
      - cell:
        - textbox
      - cell
    - row "State:":
      - cell "State:"
      - cell:
        - textbox
      - cell
    - row "Zip Code:":
      - cell "Zip Code:"
      - cell:
        - textbox
      - cell
    - 'row "Phone #:"':
      - 'cell "Phone #:"'
      - cell:
        - textbox
      - cell
    - row "SSN:":
      - cell "SSN:"
      - cell:
        - textbox
      - cell
    - row:
      - cell
    - row "Username:":
      - cell "Username:"
      - cell:
        - textbox
      - cell
    - row "Password:":
      - cell "Password:"
      - cell:
        - textbox
      - cell
    - row "Confirm:":
      - cell "Confirm:"
      - cell:
        - textbox
      - cell
    - row "Register":
      - cell
      - cell "Register":
        - button "Register"
- list:
  - listitem:
    - link "Home":
      - /url: index.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
    - text: "|"
  - listitem:
    - link "About Us":
      - /url: about.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
    - text: "|"
  - listitem:
    - link "Services":
      - /url: services.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
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
      - /url: sitemap.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
    - text: "|"
  - listitem:
    - link "Contact Us":
      - /url: contact.htm;jsessionid=5FCA1981BEF9DA792265AE7DC8F04E12
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
| heading | Customer Login | - | - | `getByRole('heading', { name: 'Customer Login', exact: true })` |
| textbox | - | - | text | `(no stable locator)` |
| textbox | - | - | password | `(no stable locator)` |
| button | Log In | - | submit | `getByRole('button', { name: 'Log In', exact: true })` |
| link | Forgot login info? | - | - | `getByRole('link', { name: 'Forgot login info?', exact: true })` |
| link | Register | - | - | `getByRole('link', { name: 'Register', exact: true })` |
| heading | Signing up is easy! | - | - | `getByRole('heading', { name: 'Signing up is easy!', exact: true })` |
| textbox | - | - | text | `locator('[id="customer.firstName"]')` |
| textbox | - | - | text | `locator('[id="customer.lastName"]')` |
| textbox | - | - | text | `locator('[id="customer.address.street"]')` |
| textbox | - | - | text | `locator('[id="customer.address.city"]')` |
| textbox | - | - | text | `locator('[id="customer.address.state"]')` |
| textbox | - | - | text | `locator('[id="customer.address.zipCode"]')` |
| textbox | - | - | text | `locator('[id="customer.phoneNumber"]')` |
| textbox | - | - | text | `locator('[id="customer.ssn"]')` |
| textbox | - | - | text | `locator('[id="customer.username"]')` |
| textbox | - | - | password | `locator('[id="customer.password"]')` |
| textbox | - | - | password | `locator('#repeatedPassword')` |
| button | Register | - | submit | `getByRole('button', { name: 'Register', exact: true })` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Forum | - | - | `getByRole('link', { name: 'Forum', exact: true })` |
| link | Site Map | - | - | `getByRole('link', { name: 'Site Map', exact: true })` |
| link | Contact Us | - | - | `getByRole('link', { name: 'Contact Us', exact: true })` |
| link | www.parasoft.com | - | - | `getByRole('link', { name: 'www.parasoft.com', exact: true })` |
