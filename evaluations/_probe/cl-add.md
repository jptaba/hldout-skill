# AUT inspection (tier 3 — bundled inspector)

- AUT: Contact List App (thinking-tester, UI + REST API) (profile `contact-list`) — https://thinking-tester-contact-list.herokuapp.com
- URL: https://thinking-tester-contact-list.herokuapp.com/addContact
- Title: Add Contact
- Captured: 2026-09-26T22:29:20.703Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `locator('#email')` | ✔ |
| 2 | fill | `locator('#password')` | ✔ |
| 3 | click | `locator('#submit')` | ✔ |
| 4 | wait | `locator('#add-contact')` | ✔ |
| 5 | click | `locator('#add-contact')` | ✔ |
| 6 | wait | `locator('#firstName')` | ✔ |

## Accessibility snapshot

```yaml
- banner:
  - heading "Add Contact" [level=1]
  - button "Logout"
- paragraph:
  - text: "* First Name:"
  - textbox "* First Name:":
    - /placeholder: First Name
  - text: "* Last Name:"
  - textbox "* Last Name:":
    - /placeholder: Last Name
- paragraph:
  - text: "Date of Birth:"
  - textbox "Date of Birth:":
    - /placeholder: yyyy-MM-dd
- paragraph:
  - text: "Email:"
  - textbox "Email:":
    - /placeholder: example@email.com
  - text: "Phone:"
  - textbox "Phone:":
    - /placeholder: "8005551234"
- paragraph:
  - text: "Street Address 1:"
  - textbox "Street Address 1:":
    - /placeholder: Address 1
- paragraph:
  - text: "Street Address 2:"
  - textbox "Street Address 2:":
    - /placeholder: Address 2
- paragraph:
  - text: "City:"
  - textbox "City:":
    - /placeholder: City
  - text: "State or Province:"
  - textbox "State or Province:":
    - /placeholder: State or Province
- paragraph:
  - text: "Postal Code:"
  - textbox "Postal Code:":
    - /placeholder: Postal Code
  - text: "Country:"
  - textbox "Country:":
    - /placeholder: Country
- paragraph:
  - button "Submit"
  - button "Cancel"
- contentinfo:
  - paragraph: Created by Kristin Jackvony, Copyright 2021
  - img
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | Add Contact | - | - | `getByRole('heading', { name: 'Add Contact', exact: true })` |
| button | Logout | - | - | `getByRole('button', { name: 'Logout', exact: true })` |
| textbox | * First Name: | - | - | `getByRole('textbox', { name: '* First Name:', exact: true })` |
| textbox | * Last Name: | - | - | `getByRole('textbox', { name: '* Last Name:', exact: true })` |
| textbox | Date of Birth: | - | - | `getByRole('textbox', { name: 'Date of Birth:', exact: true })` |
| textbox | Email: | - | - | `getByRole('textbox', { name: 'Email:', exact: true })` |
| textbox | Phone: | - | - | `getByRole('textbox', { name: 'Phone:', exact: true })` |
| textbox | Street Address 1: | - | - | `getByRole('textbox', { name: 'Street Address 1:', exact: true })` |
| textbox | Street Address 2: | - | - | `getByRole('textbox', { name: 'Street Address 2:', exact: true })` |
| textbox | City: | - | - | `getByRole('textbox', { name: 'City:', exact: true })` |
| textbox | State or Province: | - | - | `getByRole('textbox', { name: 'State or Province:', exact: true })` |
| textbox | Postal Code: | - | - | `getByRole('textbox', { name: 'Postal Code:', exact: true })` |
| textbox | Country: | - | - | `getByRole('textbox', { name: 'Country:', exact: true })` |
| button | Submit | - | submit | `getByRole('button', { name: 'Submit', exact: true })` |
| button | Cancel | - | - | `getByRole('button', { name: 'Cancel', exact: true })` |
