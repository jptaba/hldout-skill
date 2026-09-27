# AUT inspection (tier 3 — bundled inspector)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- URL: https://demoqa.com/login
- Title: demosite
- Captured: 2026-09-27T05:45:45.977Z
- testIdAttribute: `id`

## Accessibility snapshot

```yaml
- banner:
  - link:
    - /url: https://demoqa.com
    - img
- img
- text: Elements
- img
- img
- text: Forms
- img
- img
- text: Alerts, Frame & Windows
- img
- img
- text: Widgets
- img
- img
- text: Interactions
- img
- img
- text: Book Store Application
- img
- list:
  - listitem:
    - link "Login":
      - /url: /login
      - img
      - text: Login
  - listitem:
    - link "Book Store":
      - /url: /books
      - img
      - text: Book Store
  - listitem:
    - link "Profile":
      - /url: /profile
      - img
      - text: Profile
  - listitem:
    - link "Book Store API":
      - /url: /swagger
      - img
      - text: Book Store API
- heading "Login" [level=1]
- heading "Welcome," [level=2]
- heading "Login in Book Store" [level=5]
- text: "UserName :"
- textbox "UserName"
- text: "Password :"
- textbox "Password"
- button "Login"
- button "New User"
- contentinfo: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| div | Elements Forms Alerts, Frame & Windows Widgets Interactions Book Store Applicati | root | - | `getByTestId('root')` |
| link | - | - | - | `(no stable locator)` |
| li | Login | item-0 | - | `getByTestId('item-0') ⚠ matches 6` |
| link | Login | - | - | `getByRole('link', { name: 'Login', exact: true })` |
| li | Book Store | item-2 | - | `getByTestId('item-2') ⚠ matches 5` |
| link | Book Store | - | - | `getByRole('link', { name: 'Book Store', exact: true })` |
| li | Profile | item-3 | - | `getByTestId('item-3') ⚠ matches 5` |
| link | Profile | - | - | `getByRole('link', { name: 'Profile', exact: true })` |
| li | Book Store API | item-4 | - | `getByTestId('item-4') ⚠ matches 5` |
| link | Book Store API | - | - | `getByRole('link', { name: 'Book Store API', exact: true })` |
| heading | Login | - | - | `getByRole('heading', { name: 'Login', exact: true })` |
| form | Welcome, Login in Book Store UserName : Password : Login New User | userForm | - | `getByTestId('userForm')` |
| heading | Welcome, | - | - | `getByRole('heading', { name: 'Welcome,', exact: true })` |
| div | UserName : | userName-wrapper | - | `getByTestId('userName-wrapper')` |
| label | UserName : | userName-label | - | `getByTestId('userName-label')` |
| textbox | UserName | userName | text | `getByRole('textbox', { name: 'UserName', exact: true })` |
| div | Password : | password-wrapper | - | `getByTestId('password-wrapper')` |
| label | Password : | password-label | - | `getByTestId('password-label')` |
| textbox | Password | password | password | `getByRole('textbox', { name: 'Password', exact: true })` |
| button | Login | login | button | `getByRole('button', { name: 'Login', exact: true })` |
| button | New User | newUser | button | `getByRole('button', { name: 'New User', exact: true })` |
| section | - | RightSide_Advertisement | - | `getByTestId('RightSide_Advertisement')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('textbox', { name: /user ?name/i })` | 1 ✔ | true |  |
| `getByLabel(/password/i)` | 0 ✖ | false |  |
| `getByRole('button', { name: 'Login' })` | 1 ✔ | true | Login |
