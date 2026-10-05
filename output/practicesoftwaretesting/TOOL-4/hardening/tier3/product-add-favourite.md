# AUT inspection (tier 3 — bundled inspector)

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) — https://practicesoftwaretesting.com/
- URL: https://practicesoftwaretesting.com/product/01M45YZK4F8P54Y5ZZ5DDEXFRF
- Title: Combination Pliers - Practice Software Testing - Toolshop - v5.0
- Captured: 2026-10-05T12:23:20.281Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | goto | `auth/login` | ✔ |
| 2 | fill | `getByTestId('email')` | ✔ |
| 3 | fill | `getByTestId('password')` | ✔ |
| 4 | click | `getByTestId('login-submit')` | ✔ |
| 5 | wait | `url:/account` | ✔ |
| 6 | goto | `product/${var:pid}` | ✔ |
| 7 | wait | `getByTestId('product-name')` | ✔ |
| 8 | click | `getByTestId('add-to-favorites')` | ✔ |
| 9 | wait | `getByText('Product added to your favorites list.')` | ✔ |

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 401 | `{"message":"string"}` |
| POST | `api.practicesoftwaretesting.com/users/login` | 200 | (JSON not kept: the page moved on; read it with heldout api-probe) |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 200 | `{"id":"string","provider":"null","first_name":"string","last_name":"string","phone":"string","dob":"string","email":"string","totp_enabled":"boolean","created_at":"string","address":{"street":"string","house_number":"null","city":"string","state":"string","country":"string","postal_code":"string"}}` |
| GET | `api.practicesoftwaretesting.com/products/01M45YZK4F8P54Y5ZZ5DDEXFRF` | 200 | `{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","co2_rating":"string","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name":"string","by_url":"string","source_name":"string","source_url":"s` |
| GET | `api.practicesoftwaretesting.com/products/01M45YZK4F8P54Y5ZZ5DDEXFRF/related` | 200 | `[{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name":"string","by_url":"string","source_name":"string","source_url":"string","file_name":"s` |
| POST | `api.practicesoftwaretesting.com/favorites` | 201 | `{"product_id":"string","user_id":"string","id":"string"}` |

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
- figure "Photo by Helinton Fantin on Unsplash.":
  - img "Combination Pliers"
  - text: Photo by
  - link "Helinton Fantin":
    - /url: https://unsplash.com/@fantin
  - text: "on"
  - link "Unsplash":
    - /url: https://unsplash.com/photos/W8BNwvOvW4M
  - text: .
- heading "Combination Pliers" [level=1]
- paragraph: Pliers ForgeFlex Tools
- text: "$14.15 CO₂: A B C D E"
- paragraph: Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold even with oily or gloved hands. The joint is precisely fitted to eliminate play and ensure smooth operation over thousands of cycles. Ideal for electricians, mechanics, and DIY enthusiasts tackling everyday projects around the workshop or job site.
- button "Decrease quantity"
- text: Quantity
- spinbutton "Quantity": "1"
- button "Increase quantity"
- button "Add to cart"
- button "Add to favourites"
- button "Compare"
- heading "Specifications" [level=3]
- table:
  - rowgroup:
    - row "Handle Material Bi-component":
      - cell "Handle Material"
      - cell "Bi-component"
    - row "Length 200mm":
      - cell "Length"
      - cell "200mm"
    - row "Material Chrome Vanadium Steel":
      - cell "Material"
      - cell "Chrome Vanadium Steel"
    - row "Warranty 2years":
      - cell "Warranty"
      - cell "2years"
    - row "Weight 340g":
      - cell "Weight"
      - cell "340g"
- separator
- heading "Related products" [level=2]
- link "Pliers Pliers More information":
  - /url: /product/01M45YZK4PXYYM18CM4FH025VP
  - img "Pliers"
  - heading "Pliers" [level=5]
  - link "More information":
    - /url: "#"
- link "Bolt Cutters Bolt Cutters More information":
  - /url: /product/01M45YZK4SECJ5Z8BRCW7PDV4E
  - img "Bolt Cutters"
  - heading "Bolt Cutters" [level=5]
  - link "More information":
    - /url: "#"
- link "Long Nose Pliers Long Nose Pliers More information":
  - /url: /product/01M45YZK4YY1AN5HTN8RQYH2Y8
  - img "Long Nose Pliers"
  - heading "Long Nose Pliers" [level=5]
  - link "More information":
    - /url: "#"
- link "Slip Joint Pliers Slip Joint Pliers More information":
  - /url: /product/01M45YZK51BT4TZD6ERSX5G4V0
  - img "Slip Joint Pliers"
  - heading "Slip Joint Pliers" [level=5]
  - link "More information":
    - /url: "#"
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
- alert "Product added to your favorites list."
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
| link | Helinton Fantin | - | - | `getByRole('link', { name: 'Helinton Fantin', exact: true })` |
| link | Unsplash | - | - | `getByRole('link', { name: 'Unsplash' }) ⚠ matches 2: add .nth() or scope it` |
| heading | Combination Pliers | product-name | - | `getByRole('heading', { name: 'Combination Pliers', exact: true })` |
| span | unit-price | unit-price | - | `getByTestId('unit-price')` |
| div | A B C D E | co2-rating-badge | - | `getByTestId('co2-rating-badge')` |
| p | Versatile combination pliers designed for gripping, bending, and cutting wire wi | product-description | - | `getByTestId('product-description')` |
| button | Decrease quantity | decrease-quantity | - | `getByRole('button', { name: 'Decrease quantity', exact: true })` |
| spinbutton | Quantity | quantity | number | `getByRole('spinbutton', { name: 'Quantity', exact: true })` |
| button | Increase quantity | increase-quantity | - | `getByRole('button', { name: 'Increase quantity', exact: true })` |
| button | Add to cart | add-to-cart | - | `getByRole('button', { name: 'Add to cart', exact: true })` |
| button | Add to favourites | add-to-favorites | - | `getByRole('button', { name: 'Add to favourites', exact: true })` |
| button | Compare | add-to-compare | - | `getByRole('button', { name: 'Compare', exact: true })` |
| heading | Specifications | specs-title | - | `getByRole('heading', { name: 'Specifications', exact: true })` |
| table | Handle Material Bi-component Length 200 mm Material Chrome Vanadium Steel Warran | product-specs | - | `getByTestId('product-specs')` |
| tr | Handle Material Bi-component | spec-row | - | `(no stable locator)` |
| td | Handle Material | spec-name | - | `(no stable locator)` |
| td | Bi-component | spec-value | - | `(no stable locator)` |
| span | Bi-component | spec-value-text | - | `(no stable locator)` |
| tr | Length 200 mm | spec-row | - | `(no stable locator)` |
| td | Length | spec-name | - | `(no stable locator)` |
| td | 200 mm | spec-value | - | `(no stable locator)` |
| span | 200 | spec-value-text | - | `(no stable locator)` |
| span | mm | spec-unit | - | `(no stable locator)` |
| tr | Material Chrome Vanadium Steel | spec-row | - | `(no stable locator)` |
| td | Material | spec-name | - | `(no stable locator)` |
| td | Chrome Vanadium Steel | spec-value | - | `(no stable locator)` |
| span | Chrome Vanadium Steel | spec-value-text | - | `(no stable locator)` |
| tr | Warranty 2 years | spec-row | - | `(no stable locator)` |
| td | Warranty | spec-name | - | `(no stable locator)` |
| td | 2 years | spec-value | - | `(no stable locator)` |
| span | 2 | spec-value-text | - | `(no stable locator)` |
| span | years | spec-unit | - | `(no stable locator)` |
| tr | Weight 340 g | spec-row | - | `(no stable locator)` |
| td | Weight | spec-name | - | `(no stable locator)` |
| td | 340 g | spec-value | - | `(no stable locator)` |
| span | 340 | spec-value-text | - | `(no stable locator)` |
| span | g | spec-unit | - | `(no stable locator)` |
| heading | Related products | - | - | `getByRole('heading', { name: 'Related products', exact: true })` |
| link | Pliers More information | - | - | `getByRole('link', { name: 'Pliers More information' }) ⚠ matches 3: add .nth() or scope it` |
| link | More information | - | - | `getByRole('link', { name: 'More information' }) ⚠ matches 8: add .nth() or scope it` |
| link | Bolt Cutters More information | - | - | `getByRole('link', { name: 'Bolt Cutters More information' })` |
| link | Long Nose Pliers More information | - | - | `getByRole('link', { name: 'Long Nose Pliers More information' })` |
| link | Slip Joint Pliers More information | - | - | `getByRole('link', { name: 'Slip Joint Pliers More information' })` |
| div | Learn & Explore Learn Test Automation Hands-on courses for Playwright, Robot Fra | footer-explore | - | `getByTestId('footer-explore')` |
| link | Learn Test Automation Hands-on courses for Playwright, Robot Framework, APIs and | footer-learn-courses | - | `getByTestId('footer-learn-courses')` |
| link | API Spector Open-source API testing, mocking and contract testing | footer-learn-spector | - | `getByRole('link', { name: 'API Spector Open-source API testing, mocking and contract testing', exact: true })` |
| link | GitHub Source code, issues and contributions | footer-learn-github | - | `getByRole('link', { name: 'GitHub Source code, issues and contributions', exact: true })` |
| link | Privacy Policy | - | - | `getByRole('link', { name: 'Privacy Policy', exact: true })` |
| link | Barn Images | - | - | `getByRole('link', { name: 'Barn Images', exact: true })` |
| button | Open chat | chat-toggle | - | `getByRole('button', { name: 'Open chat', exact: true })` |
| button | Show live shop activity | live-activity-toggle | button | `getByRole('button', { name: 'Show live shop activity', exact: true })` |
| alert | Product added to your favorites list. | - | - | `getByRole('alert', { name: 'Product added to your favorites list.', exact: true })` |

## Text with a stable id (read-only values: details, totals, messages)

| locator | text |
| --- | --- |
| `locator('#toast-container')` | Product added to your favorites list. |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByTestId('product-name')` | 1 ✔ | true | Combination Pliers |
| `getByTestId('add-to-favorites')` | 1 ✔ | true |  Add to favourites |
| `getByRole('button', { name: 'Add to favourites' })` | 1 ✔ | true |  Add to favourites |
| `getByText('Product added to your favorites list.')` | 1 ✔ | true | Product added to your favorites list. |
| `getByRole('alert')` | 1 ✔ | true | Product added to your favorites list. |
