# AUT inspection (tier 3 — bundled inspector)

- AUT: The Internet (UI test playground) (profile `the-internet`) — https://the-internet.herokuapp.com
- URL: https://the-internet.herokuapp.com/hovers
- Title: The Internet
- Captured: 2026-09-26T18:07:59.703Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | hover | `getByRole("img", { name: "User Avatar" }).nth(1)` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | Hovers | - | - | `getByRole('heading', { name: 'Hovers', exact: true })` |
| link | View profile | - | - | `getByRole('link', { name: 'View profile', exact: true })` |
| link | Elemental Selenium | - | - | `getByRole('link', { name: 'Elemental Selenium', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('img', { name: 'User Avatar' })` | 3 ⚠ not unique | true |  |
| `locator('.figure')` | 3 ⚠ not unique | true |  |
| `getByRole('heading', { name: 'name: user2' })` | 1 ✔ | true | name: user2 |
| `getByRole('link', { name: 'View profile' })` | 1 ✔ | true | View profile |
| `locator('.figure').nth(1).getByRole('link', { name: 'View profile' })` | 1 ✔ | true | View profile |
