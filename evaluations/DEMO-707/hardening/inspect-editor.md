# AUT inspection (tier 3 — bundled inspector)

- AUT: Conduit (RealWorld demo, Angular + JSON API) (profile `conduit`) — https://conduit.bondaracademy.com
- URL: https://conduit.bondaracademy.com/editor
- Title: Conduit | Practice Test Automation
- Captured: 2026-09-26T18:59:04.516Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByPlaceholder('Email')` | ✔ |
| 2 | fill | `getByPlaceholder('Password')` | ✔ |
| 3 | click | `getByRole('button', { name: 'Sign in' })` | ✔ |
| 4 | wait | `getByRole('link', { name: 'New Article' })` | ✔ |
| 5 | click | `getByRole('link', { name: 'New Article' })` | ✔ |

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
      - link " New Article":
        - /url: /editor
    - listitem:
      - link " Settings":
        - /url: /settings
    - listitem:
      - link "qaprobe1790449139":
        - /url: /profile/qaprobe1790449139
        - img
        - text: qaprobe1790449139
- list
- group:
  - group:
    - textbox "Article Title"
  - group:
    - textbox "What's this article about?"
  - group:
    - textbox "Write your article (in markdown)"
  - group:
    - textbox "Enter tags"
  - button "Publish Article"
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
| link | New Article | - | - | `getByRole('link', { name: 'New Article', exact: true }) ⚠ matches 0` |
| link | Settings | - | - | `getByRole('link', { name: 'Settings', exact: true }) ⚠ matches 0` |
| link | qaprobe1790449139 | - | - | `getByRole('link', { name: 'qaprobe1790449139', exact: true })` |
| textbox | Article Title | - | text | `getByRole('textbox', { name: 'Article Title', exact: true })` |
| textbox | What's this article about? | - | text | `getByRole('textbox', { name: 'What\'s this article about?', exact: true })` |
| textbox | Write your article (in markdown) | - | - | `getByRole('textbox', { name: 'Write your article (in markdown)', exact: true })` |
| textbox | Enter tags | - | text | `getByRole('textbox', { name: 'Enter tags', exact: true })` |
| button | Publish Article | - | button | `getByRole('button', { name: 'Publish Article', exact: true })` |
| link | RealWorld OSS Project | - | - | `getByRole('link', { name: 'RealWorld OSS Project', exact: true })` |
| link | Bondar Academy | - | - | `getByRole('link', { name: 'Bondar Academy', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('link', { name: 'qaprobe1790449139' })` | 1 ✔ | true | qaprobe1790449139 |
| `getByPlaceholder('Article Title')` | 1 ✔ | true |  |
| `getByPlaceholder("What's this article about?")` | 1 ✔ | true |  |
| `getByPlaceholder('Write your article (in markdown)')` | 1 ✔ | true |  |
| `getByPlaceholder('Enter tags')` | 1 ✔ | true |  |
| `getByRole('button', { name: 'Publish Article' })` | 1 ✔ | true | Publish Article |
