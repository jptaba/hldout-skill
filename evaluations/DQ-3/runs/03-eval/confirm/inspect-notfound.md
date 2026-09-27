# AUT inspection (tier 3 — bundled inspector)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- URL: https://demoqa.com/links
- Title: demosite
- Captured: 2026-09-27T12:41:03.644Z
- testIdAttribute: `id`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | goto | `links` | ✔ |
| 2 | wait | `getByRole('link', { name: 'Not Found', exact: true })` | ✔ |
| 3 | click | `getByRole('link', { name: 'Not Found', exact: true })` | ✔ |
| 4 | wait | `getByText('Link has responded')` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| div | Elements Text Box Check Box Radio Button Web Tables Buttons Links Broken Links - | root | - | `getByTestId('root')` |
| link | - | - | - | `(no stable locator)` |
| li | Text Box | item-0 | - | `(no stable locator)` |
| link | Text Box | - | - | `getByRole('link', { name: 'Text Box', exact: true })` |
| li | Check Box | item-1 | - | `(no stable locator)` |
| link | Check Box | - | - | `getByRole('link', { name: 'Check Box', exact: true })` |
| li | Radio Button | item-2 | - | `(no stable locator)` |
| link | Radio Button | - | - | `getByRole('link', { name: 'Radio Button', exact: true })` |
| li | Web Tables | item-3 | - | `(no stable locator)` |
| link | Web Tables | - | - | `getByRole('link', { name: 'Web Tables', exact: true })` |
| li | Buttons | item-4 | - | `(no stable locator)` |
| link | Buttons | - | - | `getByRole('link', { name: 'Buttons', exact: true })` |
| li | Links | item-5 | - | `(no stable locator)` |
| link | Links | - | - | `getByRole('link', { name: 'Links', exact: true })` |
| li | Broken Links - Images | item-6 | - | `(no stable locator)` |
| link | Broken Links - Images | - | - | `getByRole('link', { name: 'Broken Links - Images', exact: true })` |
| li | Upload and Download | item-7 | - | `(no stable locator)` |
| link | Upload and Download | - | - | `getByRole('link', { name: 'Upload and Download', exact: true })` |
| li | Dynamic Properties | item-8 | - | `(no stable locator)` |
| link | Dynamic Properties | - | - | `getByRole('link', { name: 'Dynamic Properties', exact: true })` |
| div | Links Following links will open new tab Home Home eFztl Following links will sen | linkWrapper | - | `getByTestId('linkWrapper')` |
| heading | Links | - | - | `getByRole('heading', { name: 'Links', exact: true })` |
| link | Home | simpleLink | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Home eFztl | dynamicLink | - | `getByTestId('dynamicLink')` |
| link | Created | created | - | `getByRole('link', { name: 'Created', exact: true })` |
| link | No Content | no-content | - | `getByRole('link', { name: 'No Content', exact: true })` |
| link | Moved | moved | - | `getByRole('link', { name: 'Moved', exact: true })` |
| link | Bad Request | bad-request | - | `getByRole('link', { name: 'Bad Request', exact: true })` |
| link | Unauthorized | unauthorized | - | `getByRole('link', { name: 'Unauthorized', exact: true })` |
| link | Forbidden | forbidden | - | `getByRole('link', { name: 'Forbidden', exact: true })` |
| link | Not Found | invalid-url | - | `getByRole('link', { name: 'Not Found', exact: true })` |
| p | Link has responded with staus 404 and status text Not Found | linkResponse | - | `getByTestId('linkResponse')` |
| section | - | RightSide_Advertisement | - | `getByTestId('RightSide_Advertisement')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByText('Link has responded')` | 1 ✔ | true | Link has responded with staus 404 and status text Not Found |
