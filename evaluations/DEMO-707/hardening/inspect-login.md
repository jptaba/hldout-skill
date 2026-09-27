# AUT inspection (tier 3 — bundled inspector)

- AUT: Conduit (RealWorld demo, Angular + JSON API) (profile `conduit`) — https://conduit.bondaracademy.com
- URL: https://conduit.bondaracademy.com/login
- Title: Conduit | Practice Test Automation
- Captured: 2026-09-26T18:58:36.774Z
- testIdAttribute: `data-testid`

## Accessibility snapshot

```yaml
- navigation:
  - link "conduit":
    - /url: /
  - list:
    - listitem:
      - link "Home":
        - /url: /
    - listitem:
      - link "Sign in":
        - /url: /login
    - listitem:
      - link "Sign up":
        - /url: /register
- heading "Sign in" [level=1]
- paragraph:
  - link "Need an account?":
    - /url: /register
- list
- group:
  - group
  - group:
    - textbox "Email"
  - group:
    - textbox "Password"
  - button "Sign in" [disabled]
- contentinfo:
  - link "conduit":
    - /url: /
  - text: © 2026. An interactive learning project from
  - link "RealWorld OSS Project":
    - /url: https://github.com/gothinkster/realworld
  - text: . Code licensed under MIT. Hosted by
  - link "Bondar Academy":
    - /url: https://bondaracademy.com
  - text: .
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | conduit | - | - | `getByRole('link', { name: 'conduit', exact: true }) ⚠ matches 2` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Sign in | - | - | `getByRole('link', { name: 'Sign in', exact: true })` |
| link | Sign up | - | - | `getByRole('link', { name: 'Sign up', exact: true })` |
| heading | Sign in | - | - | `getByRole('heading', { name: 'Sign in', exact: true })` |
| link | Need an account? | - | - | `getByRole('link', { name: 'Need an account?', exact: true })` |
| textbox | Email | - | text | `getByRole('textbox', { name: 'Email', exact: true })` |
| textbox | Password | - | password | `getByRole('textbox', { name: 'Password', exact: true })` |
| button | Sign in | - | submit | `getByRole('button', { name: 'Sign in', exact: true })` |
| link | RealWorld OSS Project | - | - | `getByRole('link', { name: 'RealWorld OSS Project', exact: true })` |
| link | Bondar Academy | - | - | `getByRole('link', { name: 'Bondar Academy', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByPlaceholder('Email')` | 1 ✔ | true |  |
| `getByPlaceholder('Password')` | 1 ✔ | true |  |
| `getByRole('button', { name: 'Sign in' })` | 1 ✔ | true | Sign in |
