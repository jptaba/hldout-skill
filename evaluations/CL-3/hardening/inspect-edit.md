# AUT inspection (tier 3 — bundled inspector)

- AUT: Contact List App (profile `thinking-tester-contact-list`) — https://thinking-tester-contact-list.herokuapp.com/
- URL: https://thinking-tester-contact-list.herokuapp.com/editContact
- Title: 
- Captured: 2026-09-28T19:12:14.992Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole('textbox', { name: 'Email', exact: true })` | ✔ |
| 2 | fill | `getByRole('textbox', { name: 'Password', exact: true })` | ✔ |
| 3 | click | `getByRole('button', { name: 'Submit', exact: true })` | ✔ |
| 4 | wait | `url:/contactList` | ✔ |
| 5 | click | `getByRole('row').filter({ hasText: 'Jane Doe' }).first()` | ✔ |
| 6 | wait | `url:/contactDetails` | ✔ |
| 7 | click | `getByRole('button', { name: 'Edit Contact' })` | ✔ |
| 8 | wait | `url:/editContact` | ✔ |

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| POST | `/users/login` | 200 | (JSON not kept: the page moved on; read it with heldout api-probe) |
| GET | `/contacts` | 200 | `[{"_id":"string","firstName":"string","lastName":"string","birthdate":"string","email":"string","phone":"string","street1":"string","street2":"string","city":"string","stateProvince":"string","postalCode":"string","country":"string","owner":"string","__v":"number"}]` |
| GET | `/contacts/6ababc06d80def00157da6a3` | 200 | (JSON not kept: the page moved on; read it with heldout api-probe) |
| GET | `/contacts/6ababc06d80def00157da6a3` | 200 | `{"_id":"string","firstName":"string","lastName":"string","birthdate":"string","email":"string","phone":"string","street1":"string","street2":"string","city":"string","stateProvince":"string","postalCode":"string","country":"string","owner":"string","__v":"number"}` |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | Edit Contact | - | - | `getByRole('heading', { name: 'Edit Contact', exact: true })` |
| button | Logout | - | - | `getByRole('button', { name: 'Logout', exact: true })` |
| textbox | First Name: | - | - | `getByRole('textbox', { name: 'First Name:', exact: true })` |
| textbox | Last Name: | - | - | `getByRole('textbox', { name: 'Last Name:', exact: true })` |
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
| `locator('#firstName')` | 1 ✔ | true | Jane |
| `locator('#error')` | 1 ✔ | false |  |
