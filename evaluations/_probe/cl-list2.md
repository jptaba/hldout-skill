# AUT inspection (tier 3 — bundled inspector)

- AUT: Contact List App (thinking-tester, UI + REST API) (profile `contact-list`) — https://thinking-tester-contact-list.herokuapp.com
- URL: https://thinking-tester-contact-list.herokuapp.com/contactList
- Title: My Contacts
- Captured: 2026-09-26T22:31:01.488Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `locator('#email')` | ✔ |
| 2 | fill | `locator('#password')` | ✔ |
| 3 | click | `locator('#submit')` | ✔ |
| 4 | wait | `locator('#add-contact')` | ✔ |
| 5 | wait | `getByRole('table')` | ✔ |

## Accessibility snapshot

```yaml
- banner:
  - heading "Contact List" [level=1]
  - button "Logout"
- paragraph: Click on any contact to view the Contact Details
- paragraph:
  - button "Add a New Contact"
- table:
  - rowgroup:
    - row "Name Birthdate Email Phone Address City, State/Province, Postal Code Country":
      - columnheader "Name"
      - columnheader "Birthdate"
      - columnheader "Email"
      - columnheader "Phone"
      - columnheader "Address"
      - columnheader "City, State/Province, Postal Code"
      - columnheader "Country"
  - rowgroup
- contentinfo:
  - paragraph: Created by Kristin Jackvony, Copyright 2021
  - img
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | Contact List | - | - | `getByRole('heading', { name: 'Contact List', exact: true })` |
| button | Logout | - | - | `getByRole('button', { name: 'Logout', exact: true })` |
| button | Add a New Contact | - | - | `getByRole('button', { name: 'Add a New Contact', exact: true })` |
