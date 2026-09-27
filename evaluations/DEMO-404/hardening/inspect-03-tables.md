# AUT inspection (tier 3 — bundled inspector)

- AUT: The Internet (UI test playground) (profile `the-internet`) — https://the-internet.herokuapp.com
- URL: https://the-internet.herokuapp.com/tables
- Title: The Internet
- Captured: 2026-09-26T16:17:13.144Z
- testIdAttribute: `data-test`

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| heading | Data Tables | - | - | `getByRole('heading', { name: 'Data Tables', exact: true })` |
| link | edit | - | - | `getByRole('link', { name: 'edit', exact: true }) ⚠ matches 8` |
| link | delete | - | - | `getByRole('link', { name: 'delete', exact: true }) ⚠ matches 8` |
| link | Elemental Selenium | - | - | `getByRole('link', { name: 'Elemental Selenium', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('table').first()` | 1 ✔ | true | Last Name	First Name	Email	Due	Web Site	Action Smith	John	jsmith@gmail.com	$50.0 |
| `locator('#table1')` | 1 ✔ | true | Last Name	First Name	Email	Due	Web Site	Action Smith	John	jsmith@gmail.com	$50.0 |
| `locator('#table1').getByRole('columnheader', { name: 'Last Name' })` | 1 ✔ | true | Last Name |
| `locator('#table1 thead th.header')` | 6 ⚠ not unique | true | Last Name |
| `locator('#table1 thead th').filter({ hasText: 'Last Name' })` | 1 ✔ | true | Last Name |
