# AUT inspection (tier 3 — bundled inspector)

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) — https://automationintesting.online
- URL: https://automationintesting.online/
- Title: Restful-booker-platform demo
- Captured: 2026-09-26T15:09:57.681Z
- testIdAttribute: `data-testid`

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | Shady Meadows B&B | - | - | `getByRole('link', { name: 'Shady Meadows B&B', exact: true })` |
| link | Rooms | - | - | `getByRole('link', { name: 'Rooms', exact: true }) ⚠ matches 2` |
| link | Booking | - | - | `getByRole('link', { name: 'Booking', exact: true }) ⚠ matches 2` |
| link | Amenities | - | - | `getByRole('link', { name: 'Amenities', exact: true })` |
| link | Location | - | - | `getByRole('link', { name: 'Location', exact: true })` |
| link | Contact | - | - | `getByRole('link', { name: 'Contact', exact: true }) ⚠ matches 2` |
| link | Admin | - | - | `getByRole('link', { name: 'Admin', exact: true })` |
| heading | Welcome to Shady Meadows B&B | - | - | `getByRole('heading', { name: 'Welcome to Shady Meadows B&B', exact: true })` |
| link | Book Now | - | - | `getByRole('link', { name: 'Book Now', exact: true })` |
| heading | Check Availability & Book Your Stay | - | - | `getByRole('heading', { name: 'Check Availability & Book Your Stay', exact: true })` |
| textbox | - | - | text | `(no stable locator)` |
| button | Check Availability | - | button | `getByRole('button', { name: 'Check Availability', exact: true })` |
| heading | Our Rooms | - | - | `getByRole('heading', { name: 'Our Rooms', exact: true })` |
| link | Book now | - | - | `getByRole('link', { name: 'Book now', exact: true }) ⚠ matches 3` |
| heading | Our Location | - | - | `getByRole('heading', { name: 'Our Location', exact: true })` |
| link | Pigeon | - | - | `getByRole('link', { name: 'Pigeon', exact: true })` |
| link | OpenStreetMap | - | - | `getByRole('link', { name: 'OpenStreetMap', exact: true })` |
| heading | Contact Information | - | - | `getByRole('heading', { name: 'Contact Information', exact: true })` |
| heading | Send Us a Message | - | - | `getByRole('heading', { name: 'Send Us a Message', exact: true })` |
| textbox | Name | ContactName | text | `getByRole('textbox', { name: 'Name', exact: true })` |
| textbox | Email | ContactEmail | email | `getByRole('textbox', { name: 'Email', exact: true })` |
| textbox | Phone | ContactPhone | tel | `getByRole('textbox', { name: 'Phone', exact: true })` |
| textbox | Subject | ContactSubject | text | `getByRole('textbox', { name: 'Subject', exact: true })` |
| textbox | - | ContactDescription | - | `getByTestId('ContactDescription')` |
| button | Submit | - | button | `getByRole('button', { name: 'Submit', exact: true })` |
| link | - | - | - | `(no stable locator)` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Mark Winteringham | - | - | `getByRole('link', { name: 'Mark Winteringham', exact: true })` |
| link | Cookie-Policy | - | - | `getByRole('link', { name: 'Cookie-Policy', exact: true })` |
| link | Privacy-Policy | - | - | `getByRole('link', { name: 'Privacy-Policy', exact: true })` |
| link | Admin panel | - | - | `getByRole('link', { name: 'Admin panel', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: 'Send Us a Message' })` | 1 ✔ | true | Send Us a Message |
| `getByLabel('Message', { exact: true })` | 0 ✖ | false |  |
| `getByRole('textbox', { name: 'Message', exact: true })` | 0 ✖ | false |  |
| `getByTestId('ContactDescription')` | 1 ✔ | true |  |
| `locator('#description')` | 1 ✔ | true |  |
| `getByRole('button', { name: 'Submit' })` | 1 ✔ | true | Submit |
| `locator('.room-card')` | 3 ⚠ not unique | true | Single  Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan a |
| `locator('.room-card').first().getByRole('img')` | 1 ✔ | true |  |
