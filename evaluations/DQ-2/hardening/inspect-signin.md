# AUT inspection (tier 3 — bundled inspector)

- AUT: demosite (profile `demoqa`) — https://demoqa.com/
- URL: https://demoqa.com/profile
- Title: demosite
- Captured: 2026-09-28T19:23:09.803Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole('textbox', { name: 'UserName', exact: true })` | ✔ |
| 2 | fill | `getByRole('textbox', { name: 'Password', exact: true })` | ✔ |
| 3 | click | `getByRole('button', { name: 'Login', exact: true })` | ✔ |
| 4 | wait | `url:/profile` | ✔ |

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| POST | `/Account/v1/GenerateToken` | 200 | `{"token":"string","expires":"string","status":"string","result":"string"}` |
| POST | `/Account/v1/Login` | 200 | `{"userId":"string","username":"string","password":"string","token":"string","expires":"string","created_date":"string","isActive":"boolean"}` |
| GET | `/Account/v1/User/6e276455-1354-4799-b6ff-8fe70fd227aa` | 200 | `{"userId":"string","username":"string","books":[]}` |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | - | - | - | `(no stable locator)` |
| link | Login | - | - | `getByRole('link', { name: 'Login', exact: true })` |
| link | Book Store | - | - | `getByRole('link', { name: 'Book Store', exact: true })` |
| link | Profile | - | - | `getByRole('link', { name: 'Profile', exact: true })` |
| link | Book Store API | - | - | `getByRole('link', { name: 'Book Store API', exact: true })` |
| button | Logout | - | button | `getByRole('button', { name: 'Logout', exact: true })` |
| textbox | Type to search | - | text | `getByRole('textbox', { name: 'Type to search', exact: true })` |
| button | - | - | button | `(no stable locator)` |
| button | Previous | - | button | `getByRole('button', { name: 'Previous', exact: true })` |
| button | Next | - | button | `getByRole('button', { name: 'Next', exact: true })` |
| button | Go To Book Store | - | button | `getByRole('button', { name: 'Go To Book Store', exact: true })` |
| button | Delete Account | - | button | `getByRole('button', { name: 'Delete Account', exact: true })` |
| button | Delete All Books | - | button | `getByRole('button', { name: 'Delete All Books', exact: true })` |
