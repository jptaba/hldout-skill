# AUT inspection (tier 3 — bundled inspector)

- AUT: Contact List App (thinking-tester, UI + REST API) (profile `contact-list`) — https://thinking-tester-contact-list.herokuapp.com
- URL: https://thinking-tester-contact-list.herokuapp.com/contactDetails
- Title: 
- Captured: 2026-09-26T22:31:58.895Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `locator('#email')` | ✔ |
| 2 | fill | `locator('#password')` | ✔ |
| 3 | click | `locator('#submit')` | ✔ |
| 4 | click | `locator('tr.contactTableBodyRow >> nth=0')` | ✔ |
| 5 | wait | `getByRole('heading', { name: 'Contact Details' })` | ✔ |

## Accessibility snapshot

```yaml
- banner:
  - heading "Contact Details" [level=1]
  - button "Logout"
- paragraph:
  - button "Edit Contact"
  - button "Delete Contact"
  - button "Return to Contact List"
- paragraph: "First Name: Zed"
- paragraph: "Last Name: Adams"
- paragraph: "Date of Birth: 1990-05-17"
- paragraph: "Email:"
- paragraph: "Phone:"
- paragraph: "Street Address 1:"
- paragraph: "Street Address 2:"
- paragraph: "City:"
- paragraph: "State or Province:"
- paragraph: "Postal Code:"
- paragraph: "Country:"
- contentinfo:
  - paragraph: Created by Kristin Jackvony, Copyright 2021
  - img
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | Contact Details | - | - | `getByRole('heading', { name: 'Contact Details', exact: true })` |
| button | Logout | - | - | `getByRole('button', { name: 'Logout', exact: true })` |
| button | Edit Contact | - | - | `getByRole('button', { name: 'Edit Contact', exact: true })` |
| button | Delete Contact | - | - | `getByRole('button', { name: 'Delete Contact', exact: true })` |
| button | Return to Contact List | - | - | `getByRole('button', { name: 'Return to Contact List', exact: true })` |
