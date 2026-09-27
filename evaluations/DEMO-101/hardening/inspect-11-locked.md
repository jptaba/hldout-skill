# AUT inspection (tier 3 — bundled inspector)

- AUT: Swag Labs (saucedemo.com demo shop) — https://www.saucedemo.com
- URL: https://www.saucedemo.com/
- Title: Swag Labs
- Captured: 2026-09-26T14:18:47.183Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole("textbox", { name: "Username", exact: true })` | ✔ |
| 2 | fill | `getByRole("textbox", { name: "Password", exact: true })` | ✔ |
| 3 | click | `getByRole("button", { name: "Login", exact: true })` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| main | Epic sadface: Sorry, this user has been locked out. Accepted usernames are: stan | login-container | - | `getByTestId('login-container')` |
| textbox | Username | username | text | `getByRole('textbox', { name: 'Username', exact: true })` |
| img | - | - | - | `(no stable locator)` |
| textbox | Password | password | password | `getByRole('textbox', { name: 'Password', exact: true })` |
| alert | Epic sadface: Sorry, this user has been locked out. | error | - | `getByTestId('error')` |
| button | Dismiss error | error-button | button | `getByRole('button', { name: 'Dismiss error', exact: true })` |
| button | Login | login-button | submit | `getByRole('button', { name: 'Login', exact: true })` |
| div | Accepted usernames are: standard_user locked_out_user problem_user performance_g | login-credentials-container | - | `getByTestId('login-credentials-container')` |
| div | Accepted usernames are: standard_user locked_out_user problem_user performance_g | login-credentials | - | `getByTestId('login-credentials')` |
| div | Password for all users: password | login-password | - | `getByTestId('login-password')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('alert')` | 1 ✔ | true | Epic sadface: Sorry, this user has been locked out. |
| `getByRole('button', { name: 'Login', exact: true })` | 1 ✔ | true | Login |
