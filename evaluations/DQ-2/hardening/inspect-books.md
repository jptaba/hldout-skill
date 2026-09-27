# AUT inspection (tier 3 — bundled inspector)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- URL: https://demoqa.com/books
- Title: demosite
- Captured: 2026-09-27T12:15:24.250Z
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
- textbox "Type to search"
- button:
  - img
- button "Login"
- table:
  - rowgroup:
    - row "Image Title Author Publisher":
      - columnheader "Image"
      - columnheader "Title"
      - columnheader "Author"
      - columnheader "Publisher"
  - rowgroup:
    - row "book-image Git Pocket Guide Richard E. Silverman O'Reilly Media":
      - cell "book-image":
        - img "book-image"
      - cell "Git Pocket Guide":
        - link "Git Pocket Guide":
          - /url: /books?search=9781449325862
      - cell "Richard E. Silverman"
      - cell "O'Reilly Media"
    - row "book-image Learning JavaScript Design Patterns Addy Osmani O'Reilly Media":
      - cell "book-image":
        - img "book-image"
      - cell "Learning JavaScript Design Patterns":
        - link "Learning JavaScript Design Patterns":
          - /url: /books?search=9781449331818
      - cell "Addy Osmani"
      - cell "O'Reilly Media"
    - row "book-image Designing Evolvable Web APIs with ASP.NET Glenn Block et al. O'Reilly Media":
      - cell "book-image":
        - img "book-image"
      - cell "Designing Evolvable Web APIs with ASP.NET":
        - link "Designing Evolvable Web APIs with ASP.NET":
          - /url: /books?search=9781449337711
      - cell "Glenn Block et al."
      - cell "O'Reilly Media"
    - row "book-image Speaking JavaScript Axel Rauschmayer O'Reilly Media":
      - cell "book-image":
        - img "book-image"
      - cell "Speaking JavaScript":
        - link "Speaking JavaScript":
          - /url: /books?search=9781449365035
      - cell "Axel Rauschmayer"
      - cell "O'Reilly Media"
    - row "book-image You Don't Know JS Kyle Simpson O'Reilly Media":
      - cell "book-image":
        - img "book-image"
      - cell "You Don't Know JS":
        - link "You Don't Know JS":
          - /url: /books?search=9781491904244
      - cell "Kyle Simpson"
      - cell "O'Reilly Media"
    - row "book-image Programming JavaScript Applications Eric Elliott O'Reilly Media":
      - cell "book-image":
        - img "book-image"
      - cell "Programming JavaScript Applications":
        - link "Programming JavaScript Applications":
          - /url: /books?search=9781491950296
      - cell "Eric Elliott"
      - cell "O'Reilly Media"
    - row "book-image Eloquent JavaScript, Second Edition Marijn Haverbeke No Starch Press":
      - cell "book-image":
        - img "book-image"
      - cell "Eloquent JavaScript, Second Edition":
        - link "Eloquent JavaScript, Second Edition":
          - /url: /books?search=9781593275846
      - cell "Marijn Haverbeke"
      - cell "No Starch Press"
    - row "book-image Understanding ECMAScript 6 Nicholas C. Zakas No Starch Press":
      - cell "book-image":
        - img "book-image"
      - cell "Understanding ECMAScript 6":
        - link "Understanding ECMAScript 6":
          - /url: /books?search=9781593277574
      - cell "Nicholas C. Zakas"
      - cell "No Starch Press"
- button "Previous" [disabled]
- text: Page 1 of 1
- button "Next" [disabled]
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
| div | Login | searchBox-wrapper | - | `getByTestId('searchBox-wrapper')` |
| textbox | Type to search | searchBox | text | `getByRole('textbox', { name: 'Type to search', exact: true })` |
| button | - | - | button | `(no stable locator)` |
| button | Login | login | button | `getByRole('button', { name: 'Login', exact: true })` |
| span | Git Pocket Guide | see-book-Git Pocket Guide | - | `getByTestId('see-book-Git Pocket Guide')` |
| link | Git Pocket Guide | - | - | `getByRole('link', { name: 'Git Pocket Guide', exact: true })` |
| span | Learning JavaScript Design Patterns | see-book-Learning JavaScript Design Patterns | - | `getByTestId('see-book-Learning JavaScript Design Patterns')` |
| link | Learning JavaScript Design Patterns | - | - | `getByRole('link', { name: 'Learning JavaScript Design Patterns', exact: true })` |
| span | Designing Evolvable Web APIs with ASP.NET | see-book-Designing Evolvable Web APIs with ASP.NET | - | `getByTestId('see-book-Designing Evolvable Web APIs with ASP.NET')` |
| link | Designing Evolvable Web APIs with ASP.NET | - | - | `getByRole('link', { name: 'Designing Evolvable Web APIs with ASP.NET', exact: true })` |
| span | Speaking JavaScript | see-book-Speaking JavaScript | - | `getByTestId('see-book-Speaking JavaScript')` |
| link | Speaking JavaScript | - | - | `getByRole('link', { name: 'Speaking JavaScript', exact: true })` |
| span | You Don't Know JS | see-book-You Don't Know JS | - | `getByTestId('see-book-You Don\'t Know JS')` |
| link | You Don't Know JS | - | - | `getByRole('link', { name: 'You Don\'t Know JS', exact: true })` |
| span | Programming JavaScript Applications | see-book-Programming JavaScript Applications | - | `getByTestId('see-book-Programming JavaScript Applications')` |
| link | Programming JavaScript Applications | - | - | `getByRole('link', { name: 'Programming JavaScript Applications', exact: true })` |
| span | Eloquent JavaScript, Second Edition | see-book-Eloquent JavaScript, Second Edition | - | `getByTestId('see-book-Eloquent JavaScript, Second Edition')` |
| link | Eloquent JavaScript, Second Edition | - | - | `getByRole('link', { name: 'Eloquent JavaScript, Second Edition', exact: true })` |
| span | Understanding ECMAScript 6 | see-book-Understanding ECMAScript 6 | - | `getByTestId('see-book-Understanding ECMAScript 6')` |
| link | Understanding ECMAScript 6 | - | - | `getByRole('link', { name: 'Understanding ECMAScript 6', exact: true })` |
| button | Previous | - | button | `getByRole('button', { name: 'Previous', exact: true })` |
| button | Next | - | button | `getByRole('button', { name: 'Next', exact: true })` |
| section | - | RightSide_Advertisement | - | `getByTestId('RightSide_Advertisement')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('link', { name: 'Git Pocket Guide', exact: true })` | 1 ✔ | true | Git Pocket Guide |
| `getByRole('link', { name: 'Git Pocket Guide' })` | 1 ✔ | true | Git Pocket Guide |
| `getByText('Git Pocket Guide')` | 1 ✔ | true | Git Pocket Guide |
| `getByRole('row')` | 9 ⚠ not unique | true | Image	Title	Author	Publisher |
