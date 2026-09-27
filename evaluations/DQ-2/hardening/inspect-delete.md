# AUT inspection (tier 3 — bundled inspector)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- URL: https://demoqa.com/profile
- Title: demosite
- Captured: 2026-09-27T12:16:37.882Z
- testIdAttribute: `id`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole('textbox', { name: 'UserName' })` | ✔ |
| 2 | fill | `getByRole('textbox', { name: 'Password' })` | ✔ |
| 3 | click | `getByRole('button', { name: 'Login', exact: true })` | ✔ |
| 4 | wait | `getByRole('link', { name: 'Git Pocket Guide', exact: true })` | ✔ |
| 5 | click | `getByRole('row').filter({ has: page.getByRole('link', { name: 'Git Pocket Guide', exact: true }) }).getByTitle('Delete')` | ✔ |
| 6 | wait | `getByText('Do you want to delete this book?')` | ✔ |

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
- text: "Books : User Name : qa-dq2-walk-1790511350"
- button "Logout"
- textbox "Type to search"
- button:
  - img
- table:
  - rowgroup:
    - row "Image Title Author Publisher Action":
      - columnheader "Image"
      - columnheader "Title"
      - columnheader "Author"
      - columnheader "Publisher"
      - columnheader "Action"
  - rowgroup:
    - row "book-image Git Pocket Guide Richard E. Silverman O'Reilly Media Delete":
      - cell "book-image":
        - img "book-image"
      - cell "Git Pocket Guide":
        - link "Git Pocket Guide":
          - /url: /books?search=9781449325862
      - cell "Richard E. Silverman"
      - cell "O'Reilly Media"
      - cell "Delete":
        - img
    - row "book-image Understanding ECMAScript 6 Nicholas C. Zakas No Starch Press Delete":
      - cell "book-image":
        - img "book-image"
      - cell "Understanding ECMAScript 6":
        - link "Understanding ECMAScript 6":
          - /url: /books?search=9781593277574
      - cell "Nicholas C. Zakas"
      - cell "No Starch Press"
      - cell "Delete":
        - img
- button "Previous" [disabled]
- text: Page 1 of 1
- button "Next" [disabled]
- button "Go To Book Store"
- button "Delete Account"
- button "Delete All Books"
- contentinfo: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
- dialog "Delete Book":
  - text: Delete Book
  - button "Close"
  - text: Do you want to delete this book?
  - button "OK"
  - button "Cancel"
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
| div | Books : User Name : qa-dq2-walk-1790511350Logout | books-wrapper | - | `getByTestId('books-wrapper')` |
| label | Books : | userName-label | - | `getByLabel('Books :', { exact: true }) ⚠ matches 2` |
| label | User Name : | userName-label | - | `getByLabel('User Name :', { exact: true }) ⚠ matches 2` |
| label | qa-dq2-walk-1790511350 | userName-value | - | `getByTestId('userName-value')` |
| button | Logout | submit | button | `getByRole('button', { name: 'Logout', exact: true })` |
| textbox | Type to search | searchBox | text | `getByRole('textbox', { name: 'Type to search', exact: true })` |
| button | - | - | button | `(no stable locator)` |
| span | Git Pocket Guide | see-book-Git Pocket Guide | - | `getByTestId('see-book-Git Pocket Guide')` |
| link | Git Pocket Guide | - | - | `getByRole('link', { name: 'Git Pocket Guide', exact: true })` |
| span | Delete | delete-record-9781449325862 | - | `getByTestId('delete-record-9781449325862')` |
| span | Understanding ECMAScript 6 | see-book-Understanding ECMAScript 6 | - | `getByTestId('see-book-Understanding ECMAScript 6')` |
| link | Understanding ECMAScript 6 | - | - | `getByRole('link', { name: 'Understanding ECMAScript 6', exact: true })` |
| span | Delete | delete-record-9781593277574 | - | `getByTestId('delete-record-9781593277574')` |
| button | Previous | - | button | `getByRole('button', { name: 'Previous', exact: true })` |
| button | Next | - | button | `getByRole('button', { name: 'Next', exact: true })` |
| button | Go To Book Store | gotoStore | button | `getByRole('button', { name: 'Go To Book Store', exact: true })` |
| button | Delete Account | submit | button | `getByRole('button', { name: 'Delete Account', exact: true })` |
| button | Delete All Books | submit | button | `getByRole('button', { name: 'Delete All Books', exact: true })` |
| section | - | RightSide_Advertisement | - | `getByTestId('RightSide_Advertisement')` |
| dialog | Delete Book | - | - | `getByRole('dialog', { name: 'Delete Book', exact: true })` |
| div | Delete Book | example-modal-sizes-title-sm | - | `getByTestId('example-modal-sizes-title-sm')` |
| button | Close | - | button | `getByRole('button', { name: 'Close', exact: true })` |
| button | OK | closeSmallModal-ok | button | `getByRole('button', { name: 'OK', exact: true })` |
| button | Cancel | closeSmallModal-cancel | button | `getByRole('button', { name: 'Cancel', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('dialog')` | 1 ✔ | true | Delete Book Do you want to delete this book? OK Cancel |
| `getByText('Do you want to delete this book?')` | 1 ✔ | true | Do you want to delete this book? |
| `getByRole('button', { name: 'OK', exact: true })` | 1 ✔ | true | OK |
| `getByRole('dialog').getByRole('button', { name: 'OK' })` | 1 ✔ | true | OK |
