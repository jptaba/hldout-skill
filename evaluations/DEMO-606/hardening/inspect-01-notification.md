# AUT inspection (tier 3 — bundled inspector)

- AUT: The Internet (UI test playground) (profile `the-internet`) — https://the-internet.herokuapp.com
- URL: https://the-internet.herokuapp.com/notification_message_rendered
- Title: The Internet
- Captured: 2026-09-26T18:08:03.492Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | click | `getByRole("link", { name: "Click here" })` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | × | - | - | `getByRole('link', { name: '×', exact: true })` |
| heading | Notification Message | - | - | `getByRole('heading', { name: 'Notification Message', exact: true })` |
| link | Click here | - | - | `getByRole('link', { name: 'Click here', exact: true })` |
| link | Elemental Selenium | - | - | `getByRole('link', { name: 'Elemental Selenium', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('alert')` | 0 ✖ | false |  |
| `locator('#flash')` | 1 ✔ | true |  Action successful × |
| `locator('#flash-messages .flash')` | 1 ✔ | true |  Action successful × |
| `getByRole('link', { name: 'Click here' })` | 1 ✔ | true | Click here |
