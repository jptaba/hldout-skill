# AUT inspection (tier 3 — bundled inspector)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- URL: https://demoqa.com/links
- Title: demosite
- Captured: 2026-09-27T12:31:03.160Z
- testIdAttribute: `id`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | goto | `links` | ✔ |
| 2 | wait | `getByRole('link', { name: 'Created', exact: true })` | ✔ |
| 3 | click | `getByRole('link', { name: 'No Content', exact: true })` | ✔ |
| 4 | wait | `getByText('Link has responded')` | ✔ |

## Accessibility snapshot

```yaml
- banner:
  - link:
    - /url: https://demoqa.com
    - img
- img
- text: Elements
- img
- list:
  - listitem:
    - link "Text Box":
      - /url: /text-box
      - img
      - text: Text Box
  - listitem:
    - link "Check Box":
      - /url: /checkbox
      - img
      - text: Check Box
  - listitem:
    - link "Radio Button":
      - /url: /radio-button
      - img
      - text: Radio Button
  - listitem:
    - link "Web Tables":
      - /url: /webtables
      - img
      - text: Web Tables
  - listitem:
    - link "Buttons":
      - /url: /buttons
      - img
      - text: Buttons
  - listitem:
    - link "Links":
      - /url: /links
      - img
      - text: Links
  - listitem:
    - link "Broken Links - Images":
      - /url: /broken
      - img
      - text: Broken Links - Images
  - listitem:
    - link "Upload and Download":
      - /url: /upload-download
      - img
      - text: Upload and Download
  - listitem:
    - link "Dynamic Properties":
      - /url: /dynamic-properties
      - img
      - text: Dynamic Properties
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
- heading "Links" [level=1]
- heading "Following links will open new tab" [level=5]:
  - strong: Following links will open new tab
- paragraph:
  - link "Home":
    - /url: https://demoqa.com
- paragraph:
  - link "HomeEGziD":
    - /url: https://demoqa.com
- heading "Following links will send an api call" [level=5]:
  - strong: Following links will send an api call
- paragraph:
  - link "Created":
    - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
- paragraph:
  - link "No Content":
    - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
- paragraph:
  - link "Moved":
    - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
- paragraph:
  - link "Bad Request":
    - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
- paragraph:
  - link "Unauthorized":
    - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
- paragraph:
  - link "Forbidden":
    - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
- paragraph:
  - link "Not Found":
    - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
- paragraph: Link has responded with staus 204 and status text No Content
- contentinfo: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```

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
| div | Links Following links will open new tab Home Home EGziD Following links will sen | linkWrapper | - | `getByTestId('linkWrapper')` |
| heading | Links | - | - | `getByRole('heading', { name: 'Links', exact: true })` |
| link | Home | simpleLink | - | `getByRole('link', { name: 'Home', exact: true })` |
| link | Home EGziD | dynamicLink | - | `getByTestId('dynamicLink')` |
| link | Created | created | - | `getByRole('link', { name: 'Created', exact: true })` |
| link | No Content | no-content | - | `getByRole('link', { name: 'No Content', exact: true })` |
| link | Moved | moved | - | `getByRole('link', { name: 'Moved', exact: true })` |
| link | Bad Request | bad-request | - | `getByRole('link', { name: 'Bad Request', exact: true })` |
| link | Unauthorized | unauthorized | - | `getByRole('link', { name: 'Unauthorized', exact: true })` |
| link | Forbidden | forbidden | - | `getByRole('link', { name: 'Forbidden', exact: true })` |
| link | Not Found | invalid-url | - | `getByRole('link', { name: 'Not Found', exact: true })` |
| p | Link has responded with staus 204 and status text No Content | linkResponse | - | `getByTestId('linkResponse')` |
| section | - | RightSide_Advertisement | - | `getByTestId('RightSide_Advertisement')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: 'Links', exact: true })` | 1 ✔ | true | Links |
| `getByText('Following links will open new tab', { exact: true })` | 1 ✔ | true | Following links will open new tab |
| `getByText('Following links will send an api call', { exact: true })` | 1 ✔ | true | Following links will send an api call |
| `locator('xpath=//h5[normalize-space()="Following links will send an api call"]/following-sibling::p//a')` | 7 ⚠ not unique | true | Created |
| `locator('xpath=//h5[normalize-space()="Following links will open new tab"]/following-sibling::p[following-sibling::h5[normalize-space()="Following links will send an api call"]]//a')` | 2 ⚠ not unique | true | Home |
| `getByText('Link has responded')` | 1 ✔ | true | Link has responded with staus 204 and status text No Content |
| `getByRole('link', { name: 'Home', exact: true })` | 1 ✔ | true | Home |
