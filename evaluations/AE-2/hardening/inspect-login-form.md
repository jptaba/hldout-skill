# AUT inspection (tier 3 — bundled inspector)

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — https://automationexercise.com
- URL: https://automationexercise.com/login
- Title: Automation Exercise - Signup / Login
- Captured: 2026-09-27T06:03:42.619Z
- testIdAttribute: `data-qa`

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | - | - | - | `(no stable locator)` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true }) ⚠ matches 0` |
| link |  Products | - | - | `getByRole('link', { name: ' Products', exact: true })` |
| link | Cart | - | - | `getByRole('link', { name: 'Cart', exact: true }) ⚠ matches 0` |
| link | Signup / Login | - | - | `getByRole('link', { name: 'Signup / Login', exact: true }) ⚠ matches 0` |
| link | Test Cases | - | - | `getByRole('link', { name: 'Test Cases', exact: true }) ⚠ matches 0` |
| link | API Testing | - | - | `getByRole('link', { name: 'API Testing', exact: true }) ⚠ matches 0` |
| link | Video Tutorials | - | - | `getByRole('link', { name: 'Video Tutorials', exact: true }) ⚠ matches 0` |
| link | Contact us | - | - | `getByRole('link', { name: 'Contact us', exact: true }) ⚠ matches 0` |
| heading | Login to your account | - | - | `getByRole('heading', { name: 'Login to your account', exact: true })` |
| textbox | Email Address | login-email | email | `getByTestId('login-email')` |
| textbox | Password | login-password | password | `getByRole('textbox', { name: 'Password', exact: true })` |
| button | Login | login-button | submit | `getByRole('button', { name: 'Login', exact: true })` |
| heading | OR | - | - | `getByRole('heading', { name: 'OR', exact: true })` |
| heading | New User Signup! | - | - | `getByRole('heading', { name: 'New User Signup!', exact: true })` |
| textbox | Name | signup-name | text | `getByRole('textbox', { name: 'Name', exact: true })` |
| textbox | Email Address | signup-email | email | `getByTestId('signup-email')` |
| button | Signup | signup-button | submit | `getByRole('button', { name: 'Signup', exact: true })` |
| heading | Subscription | - | - | `getByRole('heading', { name: 'Subscription', exact: true })` |
| textbox | Your email address | - | email | `getByRole('textbox', { name: 'Your email address', exact: true })` |
| button | - | - | submit | `locator('#subscribe')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('form').filter({ has: getByRole('button', { name: 'Login', exact: true }) })` | 1 ✔ | true | Login |
| `getByTestId('login-email')` | 1 ✔ | true |  |
| `getByTestId('login-password')` | 1 ✔ | true |  |
| `getByTestId('login-button')` | 1 ✔ | true | Login |
| `getByRole('button', { name: 'Login', exact: true })` | 1 ✔ | true | Login |
| `getByRole('textbox', { name: 'Password' })` | 1 ✔ | true |  |
