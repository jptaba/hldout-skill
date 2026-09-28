# AUT inspection (tier 3 — bundled inspector)

- AUT: demosite (profile `demoqa`) — https://demoqa.com/
- URL: https://demoqa.com/books?search=9781449325862
- Title: demosite
- Captured: 2026-09-28T19:24:17.492Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | click | `getByRole("link", { name: "Git Pocket Guide", exact: true })` | ✔ |

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET | `/BookStore/v1/Books` | 200 | `{"books":[{"isbn":"string","title":"string","subTitle":"string","author":"string","publish_date":"string","publisher":"string","pages":"number","description":"string","website":"string"}]}` |
| GET | `/BookStore/v1/Book?…` | 200 | `{"isbn":"string","title":"string","subTitle":"string","author":"string","publish_date":"string","publisher":"string","pages":"number","description":"string","website":"string"}` |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | - | - | - | `(no stable locator)` |
| link | Login | - | - | `getByRole('link', { name: 'Login', exact: true })` |
| link | Book Store | - | - | `getByRole('link', { name: 'Book Store', exact: true })` |
| link | Profile | - | - | `getByRole('link', { name: 'Profile', exact: true })` |
| link | Book Store API | - | - | `getByRole('link', { name: 'Book Store API', exact: true })` |
| heading | Book Store | - | - | `getByRole('heading', { name: 'Book Store', exact: true })` |
| button | Login | - | button | `getByRole('button', { name: 'Login', exact: true })` |
| button | Back To Book Store | - | button | `getByRole('button', { name: 'Back To Book Store', exact: true })` |

## Text with a stable id (read-only values: details, totals, messages)

| locator | text |
| --- | --- |
| `locator('#ISBN-wrapper')` | ISBN: 9781449325862 |
| `locator('#title-wrapper')` | Title : Git Pocket Guide |
| `locator('#subtitle-wrapper')` | Sub Title : A Working Introduction |
| `locator('#author-wrapper')` | Author : Richard E. Silverman |
| `locator('#publisher-wrapper')` | Publisher : O'Reilly Media |
| `locator('#pages-wrapper')` | Total Pages : 234 |
| `locator('#website-wrapper')` | Website : http://chimera.labs.oreilly.com/books/1230000000561/index.html |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('#ISBN-wrapper')` | 1 ✔ | true | ISBN: 9781449325862 |
| `locator('#pages-wrapper')` | 1 ✔ | true | Total Pages : 234 |
