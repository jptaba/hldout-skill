# AUT inspection (tier 3 — bundled inspector)

- AUT: demosite (profile `demoqa`) — https://demoqa.com/
- URL: https://demoqa.com/books
- Title: demosite
- Captured: 2026-09-28T19:24:12.670Z
- testIdAttribute: `data-testid`

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET | `/BookStore/v1/Books` | 200 | `{"books":[{"isbn":"string","title":"string","subTitle":"string","author":"string","publish_date":"string","publisher":"string","pages":"number","description":"string","website":"string"}]}` |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | - | - | - | `(no stable locator)` |
| link | Login | - | - | `getByRole('link', { name: 'Login', exact: true })` |
| link | Book Store | - | - | `getByRole('link', { name: 'Book Store', exact: true })` |
| link | Profile | - | - | `getByRole('link', { name: 'Profile', exact: true })` |
| link | Book Store API | - | - | `getByRole('link', { name: 'Book Store API', exact: true })` |
| textbox | Type to search | - | text | `getByRole('textbox', { name: 'Type to search', exact: true })` |
| button | - | - | button | `(no stable locator)` |
| button | Login | - | button | `getByRole('button', { name: 'Login', exact: true })` |
| link | Git Pocket Guide | - | - | `getByRole('link', { name: 'Git Pocket Guide', exact: true })` |
| link | Learning JavaScript Design Patterns | - | - | `getByRole('link', { name: 'Learning JavaScript Design Patterns', exact: true })` |
| link | Designing Evolvable Web APIs with ASP.NET | - | - | `getByRole('link', { name: 'Designing Evolvable Web APIs with ASP.NET', exact: true })` |
| link | Speaking JavaScript | - | - | `getByRole('link', { name: 'Speaking JavaScript', exact: true })` |
| link | You Don't Know JS | - | - | `getByRole('link', { name: 'You Don\'t Know JS', exact: true })` |
| link | Programming JavaScript Applications | - | - | `getByRole('link', { name: 'Programming JavaScript Applications', exact: true })` |
| link | Eloquent JavaScript, Second Edition | - | - | `getByRole('link', { name: 'Eloquent JavaScript, Second Edition', exact: true })` |
| link | Understanding ECMAScript 6 | - | - | `getByRole('link', { name: 'Understanding ECMAScript 6', exact: true })` |
| button | Previous | - | button | `getByRole('button', { name: 'Previous', exact: true })` |
| button | Next | - | button | `getByRole('button', { name: 'Next', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('row').filter({ has: getByRole('link') })` | 8 ⚠ not unique | true | 	 Git Pocket Guide 	Richard E. Silverman	O'Reilly Media |
| `getByPlaceholder('Type to search')` | 1 ✔ | true |  |
