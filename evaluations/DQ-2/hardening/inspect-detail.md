# AUT inspection (tier 3 — bundled inspector)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- URL: https://demoqa.com/books?search=9781449325862
- Title: demosite
- Captured: 2026-09-27T12:15:38.009Z
- testIdAttribute: `id`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | click | `getByRole('link', { name: 'Git Pocket Guide', exact: true })` | ✔ |
| 2 | wait | `getByText('Total Pages :')` | ✔ |

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
- heading "Book Store" [level=1]
- button "Login"
- text: "ISBN: 9781449325862 Title : Git Pocket Guide Sub Title : A Working Introduction Author : Richard E. Silverman Publisher : O'Reilly Media Total Pages : 234 Description : This pocket guide is the perfect on-the-job companion to Git, the distributed version control system. It provides a compact, readable introduction to Git for new users, as well as a reference to common commands and procedures for those of you with Git exp Website : http://chimera.labs.oreilly.com/books/1230000000561/index.html"
- button "Back To Book Store"
- contentinfo: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| div | Elements Text BoxCheck BoxRadio ButtonWeb TablesButtonsLinksBroken Links - Image | root | - | `getByTestId('root')` |
| link | - | - | - | `(no stable locator)` |
| li | Login | item-0 | - | `getByTestId('item-0') ⚠ matches 6` |
| link | Login | - | - | `getByRole('link', { name: 'Login', exact: true })` |
| li | Book Store | item-2 | - | `getByTestId('item-2') ⚠ matches 5` |
| link | Book Store | - | - | `getByRole('link', { name: 'Book Store', exact: true })` |
| li | Profile | item-3 | - | `getByTestId('item-3') ⚠ matches 5` |
| link | Profile | - | - | `getByRole('link', { name: 'Profile', exact: true })` |
| li | Book Store API | item-4 | - | `getByTestId('item-4') ⚠ matches 5` |
| link | Book Store API | - | - | `getByRole('link', { name: 'Book Store API', exact: true })` |
| heading | Book Store | - | - | `getByRole('heading', { name: 'Book Store', exact: true })` |
| div | Login | login-wrapper | - | `getByTestId('login-wrapper')` |
| button | Login | login | button | `getByRole('button', { name: 'Login', exact: true })` |
| div | ISBN: 9781449325862 | ISBN-wrapper | - | `getByTestId('ISBN-wrapper')` |
| label | 9781449325862 | userName-value | - | `getByLabel('9781449325862', { exact: true }) ⚠ matches 8` |
| div | Title : Git Pocket Guide | title-wrapper | - | `getByTestId('title-wrapper')` |
| label | Title : | title-label | - | `getByTestId('title-label')` |
| label | Git Pocket Guide | userName-value | - | `getByLabel('Git Pocket Guide', { exact: true }) ⚠ matches 8` |
| div | Sub Title : A Working Introduction | subtitle-wrapper | - | `getByTestId('subtitle-wrapper')` |
| label | Sub Title : | subtitle-label | - | `getByTestId('subtitle-label')` |
| label | A Working Introduction | userName-value | - | `getByLabel('A Working Introduction', { exact: true }) ⚠ matches 8` |
| div | Author : Richard E. Silverman | author-wrapper | - | `getByTestId('author-wrapper')` |
| label | Author : | author-label | - | `getByTestId('author-label')` |
| label | Richard E. Silverman | userName-value | - | `getByLabel('Richard E. Silverman', { exact: true }) ⚠ matches 8` |
| div | Publisher : O'Reilly Media | publisher-wrapper | - | `getByTestId('publisher-wrapper')` |
| label | Publisher : | publisher-label | - | `getByTestId('publisher-label')` |
| label | O'Reilly Media | userName-value | - | `getByLabel('O\'Reilly Media', { exact: true }) ⚠ matches 8` |
| div | Total Pages : 234 | pages-wrapper | - | `getByTestId('pages-wrapper')` |
| label | Total Pages : | pages-label | - | `getByTestId('pages-label')` |
| label | 234 | userName-value | - | `getByLabel('234', { exact: true }) ⚠ matches 8` |
| div | Description : This pocket guide is the perfect on-the-job companion to Git, the | description-wrapper | - | `getByTestId('description-wrapper')` |
| label | Description : | description-label | - | `getByTestId('description-label')` |
| label | This pocket guide is the perfect on-the-job companion to Git, the distributed ve | userName-value | - | `getByLabel('This pocket guide is the perfect on-the-job companion to Git, the distributed version control system. It provides a compact, readable introduction to Git for new users, as well as a reference to common commands and procedures for those of you with Git exp', { exact: true }) ⚠ matches 8` |
| div | Website : http://chimera.labs.oreilly.com/books/1230000000561/index.html | website-wrapper | - | `getByTestId('website-wrapper')` |
| label | http://chimera.labs.oreilly.com/books/1230000000561/index.html | userName-value | - | `getByLabel('http://chimera.labs.oreilly.com/books/1230000000561/index.html', { exact: true }) ⚠ matches 8` |
| button | Back To Book Store | addNewRecordButton | button | `getByRole('button', { name: 'Back To Book Store', exact: true })` |
| section | - | RightSide_Advertisement | - | `getByTestId('RightSide_Advertisement')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('#ISBN-wrapper')` | 1 ✔ | true | ISBN: 9781449325862 |
| `locator('#title-wrapper')` | 1 ✔ | true | Title : Git Pocket Guide |
| `locator('#subtitle-wrapper')` | 1 ✔ | true | Sub Title : A Working Introduction |
| `locator('#author-wrapper')` | 1 ✔ | true | Author : Richard E. Silverman |
| `locator('#publisher-wrapper')` | 1 ✔ | true | Publisher : O'Reilly Media |
| `locator('#pages-wrapper')` | 1 ✔ | true | Total Pages : 234 |
