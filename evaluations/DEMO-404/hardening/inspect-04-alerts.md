# AUT inspection (tier 3 — bundled inspector)

- AUT: The Internet (UI test playground) (profile `the-internet`) — https://the-internet.herokuapp.com
- URL: https://the-internet.herokuapp.com/javascript_alerts
- Title: The Internet
- Captured: 2026-09-26T16:17:17.389Z
- testIdAttribute: `data-test`

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | JavaScript Alerts | - | - | `getByRole('heading', { name: 'JavaScript Alerts', exact: true })` |
| button | Click for JS Alert | - | - | `getByRole('button', { name: 'Click for JS Alert', exact: true })` |
| button | Click for JS Confirm | - | - | `getByRole('button', { name: 'Click for JS Confirm', exact: true })` |
| button | Click for JS Prompt | - | - | `getByRole('button', { name: 'Click for JS Prompt', exact: true })` |
| link | Elemental Selenium | - | - | `getByRole('link', { name: 'Elemental Selenium', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByText(/^You /)` | 0 ✖ | false |  |
| `locator('#result')` | 1 ✔ | false |  |
| `getByRole('button', { name: 'Click for JS Prompt' })` | 1 ✔ | true | Click for JS Prompt |
