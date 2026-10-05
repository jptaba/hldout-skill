# AUT inspection (tier 3 — bundled inspector)

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) — https://practicesoftwaretesting.com/
- URL: https://practicesoftwaretesting.com/account/favorites
- Title: Favorites - Practice Software Testing - Toolshop - v5.0
- Captured: 2026-10-05T12:23:41.202Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | goto | `auth/login` | ✔ |
| 2 | fill | `getByTestId('email')` | ✔ |
| 3 | fill | `getByTestId('password')` | ✔ |
| 4 | click | `getByTestId('login-submit')` | ✔ |
| 5 | wait | `url:/account` | ✔ |
| 6 | goto | `account/favorites` | ✔ |
| 7 | wait | `getByTestId('product-name')` | ✔ |

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 401 | `{"message":"string"}` |
| POST | `api.practicesoftwaretesting.com/users/login` | 200 | (JSON not kept: the page moved on; read it with heldout api-probe) |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 200 | `{"id":"string","provider":"null","first_name":"string","last_name":"string","phone":"string","dob":"string","email":"string","totp_enabled":"boolean","created_at":"string","address":{"street":"string","house_number":"null","city":"string","state":"string","country":"string","postal_code":"string"}}` |
| GET | `api.practicesoftwaretesting.com/favorites` | 200 | `[{"id":"string","user_id":"string","product_id":"string","product":{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","co2_rating":"string","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name` |

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
- heading "Favorites" [level=1]
- img "Combination Pliers"
- heading "Combination Pliers" [level=5]
- paragraph: Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. T...
- button
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
| heading | Favorites | page-title | - | `getByRole('heading', { name: 'Favorites', exact: true })` |
| div | Combination Pliers Versatile combination pliers designed for gripping, bending, | favorite-01m4609fg3smq79nz72aw55b6x | - | `getByTestId('favorite-01m4609fg3smq79nz72aw55b6x')` |
| heading | Combination Pliers | product-name | - | `getByRole('heading', { name: 'Combination Pliers', exact: true })` |
| p | Versatile combination pliers designed for gripping, bending, and cutting wire wi | product-description | - | `getByTestId('product-description')` |
| button | - | delete | - | `getByTestId('delete')` |
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
| `getByTestId('product-name')` | 1 ✔ | true | Combination Pliers |
| `getByRole('heading', { name: 'Favorites' })` | 1 ✔ | true | Favorites |
