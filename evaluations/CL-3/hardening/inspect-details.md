# AUT inspection (tier 3 — bundled inspector)

- AUT: Contact List App (profile `thinking-tester-contact-list`) — https://thinking-tester-contact-list.herokuapp.com/
- URL: https://thinking-tester-contact-list.herokuapp.com/contactDetails
- Title: 
- Captured: 2026-09-28T19:12:10.546Z
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

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| POST | `/users/login` | 200 | (JSON not kept: the page moved on; read it with heldout api-probe) |
| GET | `/contacts` | 200 | `[{"_id":"string","firstName":"string","lastName":"string","birthdate":"string","email":"string","phone":"string","street1":"string","street2":"string","city":"string","stateProvince":"string","postalCode":"string","country":"string","owner":"string","__v":"number"}]` |
| GET | `/contacts/6ababc06d80def00157da6a3` | 200 | `{"_id":"string","firstName":"string","lastName":"string","birthdate":"string","email":"string","phone":"string","street1":"string","street2":"string","city":"string","stateProvince":"string","postalCode":"string","country":"string","owner":"string","__v":"number"}` |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | Contact Details | - | - | `getByRole('heading', { name: 'Contact Details', exact: true })` |
| button | Logout | - | - | `getByRole('button', { name: 'Logout', exact: true })` |
| button | Edit Contact | - | - | `getByRole('button', { name: 'Edit Contact', exact: true })` |
| button | Delete Contact | - | - | `getByRole('button', { name: 'Delete Contact', exact: true })` |
| button | Return to Contact List | - | - | `getByRole('button', { name: 'Return to Contact List', exact: true })` |

## Text with a stable id (read-only values: details, totals, messages)

| locator | text |
| --- | --- |
| `locator('#firstName')` | Jane |
| `locator('#lastName')` | Doe |
| `locator('#birthdate')` | 1985-07-14 |
| `locator('#email')` | jane.doe@example.com |
| `locator('#phone')` | 8005551234 |
| `locator('#street1')` | 1 Main St. |
| `locator('#street2')` | Apartment A |
| `locator('#city')` | Anytown |
| `locator('#stateProvince')` | KS |
| `locator('#postalCode')` | 12345 |
| `locator('#country')` | USA |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('button', { name: 'Delete Contact' })` | 1 ✔ | true | Delete Contact |
