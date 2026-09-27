# AUT inspection (tier 3 — bundled inspector)

- AUT: The Internet (UI test playground) (profile `the-internet`) — https://the-internet.herokuapp.com
- URL: https://the-internet.herokuapp.com/login
- Title: The Internet
- Captured: 2026-09-26T16:16:52.191Z
- testIdAttribute: `data-test`

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | Login Page | - | - | `getByRole('heading', { name: 'Login Page', exact: true })` |
| textbox | Username | - | text | `getByRole('textbox', { name: 'Username', exact: true })` |
| textbox | Password | - | password | `getByRole('textbox', { name: 'Password', exact: true })` |
| button | Login | - | submit | `getByRole('button', { name: 'Login', exact: true }) ⚠ matches 0` |
| link | Elemental Selenium | - | - | `getByRole('link', { name: 'Elemental Selenium', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByLabel('Username')` | 1 ✔ | true |  |
| `getByRole('textbox', { name: 'Username' })` | 1 ✔ | true |  |
| `getByLabel('Password')` | 1 ✔ | true |  |
| `getByRole('button', { name: 'Login' })` | 1 ✔ | true |  Login |
