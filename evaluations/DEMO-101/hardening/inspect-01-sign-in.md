# AUT inspection (tier 3 — bundled inspector)

- AUT: Swag Labs (saucedemo.com demo shop) — https://www.saucedemo.com
- URL: https://www.saucedemo.com/
- Title: Swag Labs
- Captured: 2026-09-26T14:16:52.627Z
- testIdAttribute: `data-test`

## Accessibility snapshot

```yaml
- text: Swag Labs
- main:
  - form "Login":
    - textbox "Username"
    - textbox "Password"
    - button "Login"
  - heading "Accepted usernames are:" [level=4]
  - text: standard_user locked_out_user problem_user performance_glitch_user error_user visual_user
  - heading "Password for all users:" [level=4]
  - text: password
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| main | Accepted usernames are: standard_user locked_out_user problem_user performance_g | login-container | - | `getByTestId('login-container')` |
| textbox | Username | username | text | `getByRole('textbox', { name: 'Username', exact: true })` |
| textbox | Password | password | password | `getByRole('textbox', { name: 'Password', exact: true })` |
| button | Login | login-button | submit | `getByRole('button', { name: 'Login', exact: true })` |
| div | Accepted usernames are: standard_user locked_out_user problem_user performance_g | login-credentials-container | - | `getByTestId('login-credentials-container')` |
| div | Accepted usernames are: standard_user locked_out_user problem_user performance_g | login-credentials | - | `getByTestId('login-credentials')` |
| div | Password for all users: password | login-password | - | `getByTestId('login-password')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByLabel('Username')` | 1 ✔ | true |  |
| `getByLabel('Password')` | 1 ✔ | true |  |
| `getByRole('button', { name: 'Sign in' })` | 0 ✖ | false |  |
