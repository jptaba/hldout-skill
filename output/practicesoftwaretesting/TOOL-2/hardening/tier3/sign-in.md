# AUT inspection (tier 3 — bundled inspector)

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) — https://practicesoftwaretesting.com/
- URL: https://practicesoftwaretesting.com/account
- Title: Overview - Practice Software Testing - Toolshop - v5.0
- Captured: 2026-10-05T01:42:12.246Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | goto | `auth/login` | ✔ |
| 2 | wait | `getByTestId('email')` | ✔ |
| 3 | fill | `getByTestId('email')` | ✔ |
| 4 | fill | `getByTestId('password')` | ✔ |
| 5 | click | `getByTestId('login-submit')` | ✔ |
| 6 | wait | `url:/account` | ✔ |

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 401 | `{"message":"string"}` |
| POST | `api.practicesoftwaretesting.com/users/login` | 200 | (JSON not kept: the page moved on; read it with heldout api-probe) |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 200 | `{"id":"string","provider":"null","first_name":"string","last_name":"string","phone":"string","dob":"string","email":"string","totp_enabled":"boolean","created_at":"string","address":{"street":"string","house_number":"null","city":"string","state":"string","country":"string","postal_code":"string"}}` |

## Browser storage

| storage | key | value |
| --- | --- | --- |
| localStorage | `auth-token` | (395 characters) |

## Accessibility snapshot

```yaml
- text: View the
- link "Documentation":
  - /url: https://testsmith-io.github.io/practice-software-testing/#/
- text: for this application. Practice Black Box Testing & Bug Hunting
- button "Testing Guide"
- button "🐛 Bug Hunting"
- navigation:
  - link "Practice Software Testing - Toolshop":
    - /url: /
    - img
  - menubar "Main menu":
    - menuitem "Home":
      - link "Home":
        - /url: /
    - menuitem "Categories":
      - button "Categories"
    - menuitem "Contact":
      - link "Contact":
        - /url: /contact
    - menuitem "Hldout Tester":
      - button "Hldout Tester"
  - button "Select language": EN
- heading "My account" [level=1]
- paragraph: Here you can manage your profile, favorites and orders.
- link "Favorites":
  - /url: /account/favorites
- link "Profile":
  - /url: /account/profile
- link "Invoices":
  - /url: /account/invoices
- link "Messages":
  - /url: /account/messages
- contentinfo:
  - text: Learn & Explore
  - link "Learn Test Automation Hands-on courses for Playwright, Robot Framework, APIs and more":
    - /url: https://onlinecourses.testsmith.io
  - link "API Spector Open-source API testing, mocking and contract testing":
    - /url: https://api-spector.dev
  - link "GitHub Source code, issues and contributions":
    - /url: https://github.com/testsmith-io/practice-software-testing
  - text: This is a DEMO application, used for software testing training purpose. |
  - link "Privacy Policy":
    - /url: /privacy
  - text: "| Banner photo by"
  - link "Barn Images":
    - /url: https://unsplash.com/@barnimages
  - text: "on"
  - link "Unsplash":
    - /url: https://unsplash.com/photos/t5YUoHW6zRo
  - text: . v2.5 | Built 2026-10-04 | Angular 20.0.5
- button "Open chat":
  - img
- button "Show live shop activity"
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| div | View the Documentation for this application. | notification-bar | - | `getByTestId('notification-bar')` |
| link | Documentation | - | - | `getByRole('link', { name: 'Documentation', exact: true })` |
| button | Testing Guide | - | - | `getByRole('button', { name: 'Testing Guide', exact: true })` |
| button | 🐛 Bug Hunting | - | - | `getByRole('button', { name: '🐛 Bug Hunting', exact: true })` |
| link | Practice Software Testing - Toolshop | - | - | `getByRole('link', { name: 'Practice Software Testing - Toolshop', exact: true })` |
| menubar | Main menu | - | - | `getByRole('menubar', { name: 'Main menu', exact: true })` |
| menuitem | Home | - | - | `getByRole('menuitem', { name: 'Home', exact: true })` |
| link | Home | nav-home | - | `getByRole('link', { name: 'Home', exact: true })` |
| menuitem | Categories Hand Tools Power Tools Other Special Tools Rentals | - | - | `(no stable locator)` |
| button | Categories | nav-categories | button | `getByRole('button', { name: 'Categories', exact: true })` |
| menuitem | Contact | - | - | `getByRole('menuitem', { name: 'Contact', exact: true })` |
| link | Contact | nav-contact | - | `getByRole('link', { name: 'Contact', exact: true })` |
| menuitem | Hldout Tester My account My favorites My profile My invoices My messages Sign ou | - | - | `(no stable locator)` |
| button | Hldout Tester | nav-menu | button | `getByRole('button', { name: 'Hldout Tester', exact: true })` |
| button | Select language | language-select | button | `getByRole('button', { name: 'Select language', exact: true })` |
| img | - | - | - | `(no stable locator)` |
| heading | My account | page-title | - | `getByRole('heading', { name: 'My account', exact: true })` |
| link | Favorites | nav-favorites | - | `getByRole('link', { name: 'Favorites', exact: true })` |
| link | Profile | nav-profile | - | `getByRole('link', { name: 'Profile', exact: true })` |
| link | Invoices | nav-invoices | - | `getByRole('link', { name: 'Invoices', exact: true })` |
| link | Messages | nav-messages | - | `getByRole('link', { name: 'Messages', exact: true })` |
| div | Learn & Explore Learn Test Automation Hands-on courses for Playwright, Robot Fra | footer-explore | - | `getByTestId('footer-explore')` |
| link | Learn Test Automation Hands-on courses for Playwright, Robot Framework, APIs and | footer-learn-courses | - | `getByTestId('footer-learn-courses')` |
| link | API Spector Open-source API testing, mocking and contract testing | footer-learn-spector | - | `getByRole('link', { name: 'API Spector Open-source API testing, mocking and contract testing', exact: true })` |
| link | GitHub Source code, issues and contributions | footer-learn-github | - | `getByRole('link', { name: 'GitHub Source code, issues and contributions', exact: true })` |
| link | Privacy Policy | - | - | `getByRole('link', { name: 'Privacy Policy', exact: true })` |
| link | Barn Images | - | - | `getByRole('link', { name: 'Barn Images', exact: true })` |
| link | Unsplash | - | - | `getByRole('link', { name: 'Unsplash', exact: true })` |
| button | Open chat | chat-toggle | - | `getByRole('button', { name: 'Open chat', exact: true })` |
| button | Show live shop activity | live-activity-toggle | button | `getByRole('button', { name: 'Show live shop activity', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: 'My account' })` | 1 ✔ | true | My account |
| `getByTestId('nav-menu')` | 1 ✔ | true | Hldout Tester  |
| `getByRole('navigation').first()` | 1 ✔ | true | Home Categories  Contact Hldout Tester   EN  |
| `getByRole('navigation')` | 1 ✔ | true | Home Categories  Contact Hldout Tester   EN  |
