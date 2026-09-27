# AUT inspection (tier 3 — bundled inspector)

- AUT: Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) — https://practicesoftwaretesting.com
- URL: https://practicesoftwaretesting.com/account/favorites
- Title: Favorites - Practice Software Testing - Toolshop - v5.0
- Captured: 2026-09-26T20:08:30.642Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | wait | `getByTestId('email')` | ✔ |
| 2 | fill | `getByTestId('email')` | ✔ |
| 3 | fill | `getByTestId('password')` | ✔ |
| 4 | click | `getByTestId('login-submit')` | ✔ |
| 5 | wait | `getByTestId('page-title')` | ✔ |
| 6 | goto | `account/favorites` | ✔ |
| 7 | wait | `getByTestId('page-title')` | ✔ |

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
    - menuitem "Probe User":
      - button "Probe User"
  - button "Select language": EN
- heading "Favorites" [level=1]
- img "Pliers"
- heading "Pliers" [level=5]
- paragraph: Reliable general-purpose pliers crafted from drop-forged carbon steel for long-lasting durability in demanding working conditions. The serrated jaws provide a firm grip on a variety of materials including wire, nails, small fasteners, and irregularly...
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
  - text: . v2.5 | Built 2026-09-09 | Angular 20.0.5
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
| menuitem | Categories | - | - | `getByRole('menuitem', { name: 'Categories', exact: true })` |
| button | Categories | nav-categories | button | `getByRole('button', { name: 'Categories', exact: true })` |
| menuitem | Contact | - | - | `getByRole('menuitem', { name: 'Contact', exact: true })` |
| link | Contact | nav-contact | - | `getByRole('link', { name: 'Contact', exact: true })` |
| menuitem | Probe User | - | - | `getByRole('menuitem', { name: 'Probe User', exact: true })` |
| button | Probe User | nav-menu | button | `getByRole('button', { name: 'Probe User', exact: true })` |
| button | Select language | language-select | button | `getByRole('button', { name: 'Select language', exact: true })` |
| img | - | - | - | `(no stable locator)` |
| heading | Favorites | page-title | - | `getByRole('heading', { name: 'Favorites', exact: true })` |
| div | Pliers Reliable general-purpose pliers crafted from drop-forged carbon steel for | favorite-01m3fna5mf90d92qt0tetg31p3 | - | `getByTestId('favorite-01m3fna5mf90d92qt0tetg31p3')` |
| heading | Pliers | product-name | - | `getByRole('heading', { name: 'Pliers', exact: true })` |
| p | Reliable general-purpose pliers crafted from drop-forged carbon steel for long-l | product-description | - | `getByTestId('product-description')` |
| button | - | delete | - | `getByTestId('delete')` |
| div | LEARN & EXPLORE Learn Test Automation Hands-on courses for Playwright, Robot Fra | footer-explore | - | `getByTestId('footer-explore')` |
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
| `getByTestId('page-title')` | 1 ✔ | true | Favorites |
| `getByTestId('product-name')` | 1 ✔ | true | Pliers |
| `getByTestId('delete')` | 1 ✔ | true |  |
