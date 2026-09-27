# AUT inspection (tier 3 — bundled inspector)

- AUT: Swag Labs (saucedemo.com demo shop) — https://www.saucedemo.com
- URL: https://www.saucedemo.com/inventory.html
- Title: Swag Labs
- Captured: 2026-09-26T14:18:37.042Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole("textbox", { name: "Username", exact: true })` | ✔ |
| 2 | fill | `getByRole("textbox", { name: "Password", exact: true })` | ✔ |
| 3 | click | `getByRole("button", { name: "Login", exact: true })` | ✔ |
| 4 | click | `getByRole('button', { name: 'Open Menu' })` | ✔ |
| 5 | click | `getByRole('button', { name: 'Logout' })` | ✔ |
| 6 | goto | `inventory.html` | ✔ |

## Accessibility snapshot

```yaml
- text: Swag Labs
- main:
  - form "Login":
    - textbox "Username"
    - textbox "Password"
    - alert:
      - button "Dismiss error"
      - text: "Epic sadface: You can only access '/inventory.html' when you are logged in."
    - button "Login"
  - heading "Accepted usernames are:" [level=4]
  - text: standard_user locked_out_user problem_user performance_glitch_user error_user visual_user
  - heading "Password for all users:" [level=4]
  - text: password
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| main | Epic sadface: You can only access '/inventory.html' when you are logged in. Acce | login-container | - | `getByTestId('login-container')` |
| textbox | Username | username | text | `getByRole('textbox', { name: 'Username', exact: true })` |
| img | - | - | - | `(no stable locator)` |
| textbox | Password | password | password | `getByRole('textbox', { name: 'Password', exact: true })` |
| alert | Epic sadface: You can only access '/inventory.html' when you are logged in. | error | - | `getByTestId('error')` |
| button | Dismiss error | error-button | button | `getByRole('button', { name: 'Dismiss error', exact: true })` |
| button | Login | login-button | submit | `getByRole('button', { name: 'Login', exact: true })` |
| div | Accepted usernames are: standard_user locked_out_user problem_user performance_g | login-credentials-container | - | `getByTestId('login-credentials-container')` |
| div | Accepted usernames are: standard_user locked_out_user problem_user performance_g | login-credentials | - | `getByTestId('login-credentials')` |
| div | Password for all users: password | login-password | - | `getByTestId('login-password')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByTestId('title')` | 0 ✖ | false |  |
| `getByRole('button', { name: 'Login', exact: true })` | 1 ✔ | true | Login |
| `getByRole('alert')` | 1 ✔ | true | Epic sadface: You can only access '/inventory.html' when you are logged in. |
