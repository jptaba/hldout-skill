# AUT inspection (tier 3 — bundled inspector)

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) — https://automationintesting.online
- URL: https://automationintesting.online/
- Title: Restful-booker-platform demo
- Captured: 2026-09-26T15:10:09.429Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole("textbox", { name: "Name", exact: true })` | ✔ |
| 2 | fill | `getByRole("textbox", { name: "Email", exact: true })` | ✔ |
| 3 | fill | `getByRole("textbox", { name: "Phone", exact: true })` | ✔ |
| 4 | fill | `getByRole("textbox", { name: "Subject", exact: true })` | ✔ |
| 5 | fill | `getByTestId('ContactDescription')` | ✔ |
| 6 | click | `getByRole('button', { name: 'Submit' })` | ✔ |
| 7 | wait | `getByRole('heading', { name: /Thanks for getting in touch/ })` | ✔ |

## Accessibility snapshot

```yaml
- navigation:
  - link "Shady Meadows B&B":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /#rooms
    - listitem:
      - link "Booking":
        - /url: /#booking
    - listitem:
      - link "Amenities":
        - /url: /#amenities
    - listitem:
      - link "Location":
        - /url: /#location
    - listitem:
      - link "Contact":
        - /url: /#contact
    - listitem:
      - link "Admin":
        - /url: /admin
- heading "Welcome to Shady Meadows B&B" [level=1]
- paragraph: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- link "Book Now":
  - /url: "#booking"
- heading "Check Availability & Book Your Stay" [level=3]
- text: Check In
- textbox: 26/09/2026
- text: Check Out
- textbox: 27/09/2026
- button "Check Availability"
- heading "Our Rooms" [level=2]
- paragraph: Comfortable beds and delightful breakfast from locally sourced ingredients
- img "Single Room"
- heading "Single" [level=5]
- paragraph: Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.
- text:  TV  WiFi  Safe £100 per night
- link "Book now":
  - /url: /reservation/1?checkin=2026-09-26&checkout=2026-09-27
- img "Single Room"
- heading "Double" [level=5]
- paragraph: Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl.
- text:  TV  Radio  Safe £150 per night
- link "Book now":
  - /url: /reservation/2?checkin=2026-09-26&checkout=2026-09-27
- img "Single Room"
- heading "Suite" [level=5]
- paragraph: Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex.
- text:  Radio  WiFi  Safe £225 per night
- link "Book now":
  - /url: /reservation/3?checkin=2026-09-26&checkout=2026-09-27
- heading "Our Location" [level=2]
- paragraph: Find us in the beautiful Newingtonfordburyshire countryside
- img
- link "Pigeon":
  - /url: https://pigeon-maps.js.org/
- text: "| ©"
- link "OpenStreetMap":
  - /url: https://www.openstreetmap.org/copyright
- text: contributors
- heading "Contact Information" [level=3]
- text: 
- heading "Address" [level=5]
- paragraph: Shady Meadows B&B, Shadows valley, Newingtonfordburyshire, Dilbery, N1 1AA
- text: 
- heading "Phone" [level=5]
- paragraph: "012345678901"
- text: 
- heading "Email" [level=5]
- paragraph: fake@fakeemail.com
- separator
- heading "Getting Here" [level=4]
- paragraph: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- heading "Thanks for getting in touch QA Probe!" [level=3]
- paragraph: We'll get back to you about
- paragraph: QA probe subject
- paragraph: as soon as possible.
- contentinfo:
  - heading "Shady Meadows B&B" [level=5]
  - paragraph: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
  - link "":
    - /url: "#"
  - link "":
    - /url: "#"
  - link "":
    - /url: "#"
  - heading "Contact Us" [level=5]
  - list:
    - listitem:  Shady Meadows B&B, Shadows valley, Newingtonfordburyshire, Dilbery, N1 1AA
    - listitem:  012345678901
    - listitem:  fake@fakeemail.com
  - heading "Quick Links" [level=5]
  - list:
    - listitem:
      - link "Home":
        - /url: "#"
    - listitem:
      - link "Rooms":
        - /url: "#"
    - listitem:
      - link "Booking":
        - /url: "#"
    - listitem:
      - link "Contact":
        - /url: "#"
  - separator
  - text: restful-booker-platform v2.2 Created by
  - link "Mark Winteringham":
    - /url: http://www.mwtestconsultancy.co.uk
  - text: "- © 2019-26"
  - link "Cookie-Policy":
    - /url: /cookie
  - text: "-"
  - link "Privacy-Policy":
    - /url: /privacy
  - text: "-"
  - link "Admin panel":
    - /url: /admin
- alert
```

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
| heading | Thanks for getting in touch QA Probe! | - | - | `getByRole('heading', { name: 'Thanks for getting in touch QA Probe!', exact: true })` |
| link | - | - | - | `(no stable locator)` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Mark Winteringham | - | - | `getByRole('link', { name: 'Mark Winteringham', exact: true })` |
| link | Cookie-Policy | - | - | `getByRole('link', { name: 'Cookie-Policy', exact: true })` |
| link | Privacy-Policy | - | - | `getByRole('link', { name: 'Privacy-Policy', exact: true })` |
| link | Admin panel | - | - | `getByRole('link', { name: 'Admin panel', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: /Thanks for getting in touch/ })` | 1 ✔ | true | Thanks for getting in touch QA Probe! |
| `locator('section, div').filter({ has: page.getByRole('heading', { name: /Thanks for getting in touch/ }) }).last()` | 1 ✔ | true | Thanks for getting in touch QA Probe!  We'll get back to you about  QA probe sub |
| `locator('.card-body').filter({ has: page.getByRole('heading', { name: /Thanks for getting in touch/ }) })` | 1 ✔ | true | Thanks for getting in touch QA Probe!  We'll get back to you about  QA probe sub |
| `getByRole('button', { name: 'Submit' })` | 0 ✖ | false |  |
