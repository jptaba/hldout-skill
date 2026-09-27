# AUT inspection (tier 3 — bundled inspector)

- AUT: The Internet (UI test playground) (profile `the-internet`) — https://the-internet.herokuapp.com
- URL: https://the-internet.herokuapp.com/key_presses
- Title: The Internet
- Captured: 2026-09-26T16:17:21.895Z
- testIdAttribute: `data-test`

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | Key Presses | - | - | `getByRole('heading', { name: 'Key Presses', exact: true })` |
| textbox | - | - | text | `locator('#target')` |
| link | Elemental Selenium | - | - | `getByRole('link', { name: 'Elemental Selenium', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('textbox')` | 1 ✔ | true |  |
| `locator('#target')` | 1 ✔ | true |  |
| `locator('#result')` | 1 ✔ | false |  |
