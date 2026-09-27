# AUT inspection (tier 3 — bundled inspector)

- AUT: The Internet (UI test playground) (profile `the-internet`) — https://the-internet.herokuapp.com
- URL: https://the-internet.herokuapp.com/secure
- Title: The Internet
- Captured: 2026-09-26T16:16:48.140Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole("textbox", { name: "Username" })` | ✔ |
| 2 | fill | `getByRole("textbox", { name: "Password" })` | ✔ |
| 3 | click | `getByRole("button", { name: "Login" })` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | × | - | - | `getByRole('link', { name: '×', exact: true })` |
| heading | Secure Area | - | - | `getByRole('heading', { name: 'Secure Area', exact: true })` |
| link | Logout | - | - | `getByRole('link', { name: 'Logout', exact: true })` |
| link | Elemental Selenium | - | - | `getByRole('link', { name: 'Elemental Selenium', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: 'Secure Area' })` | 2 ⚠ not unique | true | Secure Area |
| `getByRole('heading', { name: 'Secure Area', exact: true })` | 1 ✔ | true | Secure Area |
| `locator('h2')` | 1 ✔ | true | Secure Area |
| `locator('#flash')` | 1 ✔ | true |  You logged into a secure area! × |
| `getByRole('link', { name: 'Logout' })` | 1 ✔ | true | Logout |
