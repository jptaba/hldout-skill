# AUT inspection (tier 3 — bundled inspector)

- AUT: Contact List App (thinking-tester, UI + REST API) (profile `contact-list`) — https://thinking-tester-contact-list.herokuapp.com
- URL: https://thinking-tester-contact-list.herokuapp.com/addContact?
- Title: Add Contact
- Captured: 2026-09-26T22:32:32.799Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `locator('#email')` | ✔ |
| 2 | fill | `locator('#password')` | ✔ |
| 3 | click | `locator('#submit')` | ✔ |
| 4 | click | `locator('#add-contact')` | ✔ |
| 5 | fill | `locator('#firstName')` | ✔ |
| 6 | click | `locator('#submit')` | ✔ |
| 7 | wait | `locator('#error')` | ✖ locator.waitFor: Timeout 30000ms exceeded. |

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

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('#error')` | 1 ✔ | false |  |
