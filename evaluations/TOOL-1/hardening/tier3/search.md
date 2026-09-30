# AUT inspection (tier 3 — bundled inspector)

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) — https://practicesoftwaretesting.com/
- URL: https://practicesoftwaretesting.com/
- Title: Practice Software Testing - Toolshop - v5.0
- Captured: 2026-09-29T21:58:18.904Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | wait | `getByTestId('product-name').first()` | ✔ |
| 2 | fill | `getByTestId('search-query')` | ✔ |
| 3 | click | `getByTestId('search-submit')` | ✔ |
| 4 | wait | `getByText('Searched for')` | ✔ |

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 401 | `{"message":"string"}` |
| QUERY | `api.practicesoftwaretesting.com/products` | 200 | `{"current_page":"number","data":[{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","co2_rating":"string","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name":"string","by_url":"string","sour` |
| GET | `api.practicesoftwaretesting.com/product-specs/names` | 200 | `[{"name":"string","values":["string"],"unit":"null"}]` |
| GET | `api.practicesoftwaretesting.com/brands` | 200 | `[{"id":"string","name":"string","slug":"string"}]` |
| GET | `api.practicesoftwaretesting.com/categories/tree` | 200 | `[{"id":"string","name":"string","slug":"string","parent_id":"null","sub_categories":[{"id":"string","name":"string","slug":"string","parent_id":"string","sub_categories":[]}]}]` |
| QUERY | `api.practicesoftwaretesting.com/products/search` | 200 | `{"current_page":"number","data":[{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","co2_rating":"string","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name":"string","by_url":"string","sour` |

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
    - menuitem "Sign in":
      - link "Sign in":
        - /url: /auth/login
  - button "Select language": EN
- paragraph:
  - img "Banner"
- separator
- heading "Sort" [level=4]
- separator
- combobox "sort":
  - option [selected]
  - option "Name (A - Z)"
  - option "Name (Z - A)"
  - option "Price (High - Low)"
  - option "Price (Low - High)"
  - option "CO₂ Rating (A - E)"
  - option "CO₂ Rating (E - A)"
- heading "Price Range" [level=4]
- separator
- slider "ngx-slider"
- slider "ngx-slider-max"
- text: 0 200 1 100
- heading "Search" [level=4]
- separator
- text: Search
- textbox "Search"
- button "X"
- button "Search"
- heading "Filters" [level=4]
- separator
- heading "By category:" [level=4]
- group "Categories":
  - text: Categories
  - checkbox "Hand Tools"
  - text: Hand Tools
  - list:
    - group "Categories":
      - text: Categories
      - checkbox "Hammer"
      - text: Hammer
      - checkbox "Hand Saw"
      - text: Hand Saw
      - checkbox "Wrench"
      - text: Wrench
      - checkbox "Screwdriver"
      - text: Screwdriver
      - checkbox "Pliers"
      - text: Pliers
      - checkbox "Chisels"
      - text: Chisels
      - checkbox "Measures"
      - text: Measures
  - checkbox "Power Tools"
  - text: Power Tools
  - list:
    - group "Categories":
      - text: Categories
      - checkbox "Grinder"
      - text: Grinder
      - checkbox "Sander"
      - text: Sander
      - checkbox "Saw"
      - text: Saw
      - checkbox "Drill"
      - text: Drill
  - checkbox "Other"
  - text: Other
  - list:
    - group "Categories":
      - text: Categories
      - checkbox "Tool Belts"
      - text: Tool Belts
      - checkbox "Storage Solutions"
      - text: Storage Solutions
      - checkbox "Workbench"
      - text: Workbench
      - checkbox "Safety Gear"
      - text: Safety Gear
      - checkbox "Fasteners"
      - text: Fasteners
- heading "By brand:" [level=4]
- group "Brands":
  - text: Brands
  - checkbox "ForgeFlex Tools"
  - text: ForgeFlex Tools
  - checkbox "MightyCraft Hardware"
  - text: MightyCraft Hardware
  - checkbox "8836851880112875editado"
  - text: 8836851880112875editado
  - checkbox "335930291427100editado"
  - text: 335930291427100editado
  - checkbox "5473788903857655editado"
  - text: 5473788903857655editado
  - checkbox "6639640477480816editado"
  - text: 6639640477480816editado
  - checkbox "307699787211470editado"
  - text: 307699787211470editado
  - checkbox "6296268693466885editado"
  - text: 6296268693466885editado
  - checkbox "3562971265045431editado"
  - text: 3562971265045431editado
- heading "Sustainability:" [level=4]
- group "Eco-Friendly Products":
  - text: Eco-Friendly Products
  - checkbox "Show only eco-friendly products"
  - text: Show only eco-friendly products
- 'heading "Searched for: pliers" [level=3]'
- paragraph: 4 products found for 'pliers'
- 'link "Combination Pliers Compare Combination Pliers CO₂: A B C D E $14.15"':
  - /url: /product/01M3QFFYDYBMA969DZGCX7R8KV
  - img "Combination Pliers"
  - button "Compare"
  - heading "Combination Pliers" [level=5]
  - text: "CO₂: A B C D E $14.15"
- 'link "Pliers Compare Pliers CO₂: A B C D E $12.01"':
  - /url: /product/01M3QFFYE6Z3JQJEPE03J77CPJ
  - img "Pliers"
  - button "Compare"
  - heading "Pliers" [level=5]
  - text: "CO₂: A B C D E $12.01"
- 'link "Long Nose Pliers Compare Long Nose Pliers CO₂: A B C D E Out of stock $14.24"':
  - /url: /product/01M3QFFYECBA13KB1HKP2HR175
  - img "Long Nose Pliers"
  - button "Compare"
  - heading "Long Nose Pliers" [level=5]
  - text: "CO₂: A B C D E Out of stock $14.24"
- 'link "Slip Joint Pliers Compare Slip Joint Pliers CO₂: A B C D E $9.17"':
  - /url: /product/01M3QFFYEFDH1ABCY6YAQ9X2AT
  - img "Slip Joint Pliers"
  - button "Compare"
  - heading "Slip Joint Pliers" [level=5]
  - text: "CO₂: A B C D E $9.17"
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
  - text: . v2.5 | Built 2026-09-29 | Angular 20.0.5
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
| menuitem | Sign in | - | - | `getByRole('menuitem', { name: 'Sign in', exact: true })` |
| link | Sign in | nav-sign-in | - | `getByRole('link', { name: 'Sign in', exact: true })` |
| button | Select language | language-select | button | `getByRole('button', { name: 'Select language', exact: true })` |
| img | - | - | - | `(no stable locator)` |
| div | Sort Name (A - Z) Name (Z - A) Price (High - Low) Price (Low - High) CO₂ Rating | filters | - | `locator('#filters')` |
| combobox | sort | sort | - | `getByRole('combobox', { name: 'sort', exact: true })` |
| slider | ngx-slider | - | - | `getByRole('slider', { name: 'ngx-slider', exact: true })` |
| slider | ngx-slider-max | - | - | `getByRole('slider', { name: 'ngx-slider-max', exact: true })` |
| textbox | Search | search-query | text | `getByRole('textbox', { name: 'Search', exact: true })` |
| button | X | search-reset | reset | `getByRole('button', { name: 'X', exact: true })` |
| button | Search | search-submit | submit | `getByRole('button', { name: 'Search', exact: true })` |
| checkbox | Hand Tools | category-01M3QFFYBX9GGPF87TYS4JAZWT | checkbox | `getByRole('checkbox', { name: 'Hand Tools', exact: true })` |
| checkbox | Hammer | category-01M3QFFYCECVCZZ9QS48X58CZ2 | checkbox | `getByRole('checkbox', { name: 'Hammer', exact: true })` |
| checkbox | Hand Saw | category-01M3QFFYCECVCZZ9QS48X58CZ3 | checkbox | `getByRole('checkbox', { name: 'Hand Saw', exact: true })` |
| checkbox | Wrench | category-01M3QFFYCECVCZZ9QS48X58CZ4 | checkbox | `getByRole('checkbox', { name: 'Wrench', exact: true })` |
| checkbox | Screwdriver | category-01M3QFFYCECVCZZ9QS48X58CZ5 | checkbox | `getByRole('checkbox', { name: 'Screwdriver', exact: true })` |
| checkbox | Pliers | category-01M3QFFYCECVCZZ9QS48X58CZ6 | checkbox | `getByRole('checkbox', { name: 'Pliers', exact: true })` |
| checkbox | Chisels | category-01M3QFFYCECVCZZ9QS48X58CZ7 | checkbox | `getByRole('checkbox', { name: 'Chisels', exact: true })` |
| checkbox | Measures | category-01M3QFFYCECVCZZ9QS48X58CZ8 | checkbox | `getByRole('checkbox', { name: 'Measures', exact: true })` |
| checkbox | Power Tools | category-01M3QFFYBX9GGPF87TYS4JAZWV | checkbox | `getByRole('checkbox', { name: 'Power Tools', exact: true })` |
| checkbox | Grinder | category-01M3QFFYCECVCZZ9QS48X58CZ9 | checkbox | `getByRole('checkbox', { name: 'Grinder', exact: true })` |
| checkbox | Sander | category-01M3QFFYCECVCZZ9QS48X58CZA | checkbox | `getByRole('checkbox', { name: 'Sander', exact: true })` |
| checkbox | Saw | category-01M3QFFYCECVCZZ9QS48X58CZB | checkbox | `getByRole('checkbox', { name: 'Saw', exact: true })` |
| checkbox | Drill | category-01M3QFFYCECVCZZ9QS48X58CZC | checkbox | `getByRole('checkbox', { name: 'Drill', exact: true })` |
| checkbox | Other | category-01M3QFFYBX9GGPF87TYS4JAZWW | checkbox | `getByRole('checkbox', { name: 'Other', exact: true })` |
| checkbox | Tool Belts | category-01M3QFFYCECVCZZ9QS48X58CZD | checkbox | `getByRole('checkbox', { name: 'Tool Belts', exact: true })` |
| checkbox | Storage Solutions | category-01M3QFFYCECVCZZ9QS48X58CZE | checkbox | `getByRole('checkbox', { name: 'Storage Solutions', exact: true })` |
| checkbox | Workbench | category-01M3QFFYCECVCZZ9QS48X58CZF | checkbox | `getByRole('checkbox', { name: 'Workbench', exact: true })` |
| checkbox | Safety Gear | category-01M3QFFYCECVCZZ9QS48X58CZG | checkbox | `getByRole('checkbox', { name: 'Safety Gear', exact: true })` |
| checkbox | Fasteners | category-01M3QFFYCECVCZZ9QS48X58CZH | checkbox | `getByRole('checkbox', { name: 'Fasteners', exact: true })` |
| checkbox | ForgeFlex Tools | brand-01M3QFFY00B5MP6FYCQVFJ6NC1 | checkbox | `getByRole('checkbox', { name: 'ForgeFlex Tools', exact: true })` |
| checkbox | MightyCraft Hardware | brand-01M3QFFY01DZTR05FPMVS8BNEN | checkbox | `getByRole('checkbox', { name: 'MightyCraft Hardware', exact: true })` |
| checkbox | 8836851880112875editado | brand-01m3qfj4mts5fs1vnagfxs0ft6 | checkbox | `getByRole('checkbox', { name: '8836851880112875editado', exact: true })` |
| checkbox | 335930291427100editado | brand-01m3qfyvbhtcs40grbsdq8w1ry | checkbox | `getByRole('checkbox', { name: '335930291427100editado', exact: true })` |
| checkbox | 5473788903857655editado | brand-01m3qjmwv3r4aqnmfsh6p7skmr | checkbox | `getByRole('checkbox', { name: '5473788903857655editado', exact: true })` |
| checkbox | 6639640477480816editado | brand-01m3qjpaefck51y9c5ehbd0sns | checkbox | `getByRole('checkbox', { name: '6639640477480816editado', exact: true })` |
| checkbox | 307699787211470editado | brand-01m3qjqawm0xwec9hkn026619a | checkbox | `getByRole('checkbox', { name: '307699787211470editado', exact: true })` |
| checkbox | 6296268693466885editado | brand-01m3qjrvbqksem62r4skdrbptj | checkbox | `getByRole('checkbox', { name: '6296268693466885editado', exact: true })` |
| checkbox | 3562971265045431editado | brand-01m3qjsmedrx24r574kwctzttq | checkbox | `getByRole('checkbox', { name: '3562971265045431editado', exact: true })` |
| checkbox | Show only eco-friendly products | eco-friendly-filter | checkbox | `getByRole('checkbox', { name: 'Show only eco-friendly products', exact: true })` |
| heading | Searched for: pliers | search-caption | - | `getByRole('heading', { name: 'Searched for: pliers', exact: true })` |
| span | pliers | search-term | - | `getByTestId('search-term')` |
| p | 4 products found for 'pliers' | search-result-count | - | `getByTestId('search-result-count')` |
| div | Combination Pliers A B C D E $14.15 Pliers A B C D E $12.01 Long Nose Pliers A B | search_completed | - | `getByTestId('search_completed')` |
| link | Combination Pliers A B C D E $14.15 | product-01M3QFFYDYBMA969DZGCX7R8KV | - | `getByTestId('product-01M3QFFYDYBMA969DZGCX7R8KV')` |
| button | Compare | compare-btn | - | `getByRole('button', { name: 'Compare' }) ⚠ matches 4: add .nth() or scope it` |
| heading | Combination Pliers | product-name | - | `getByRole('heading', { name: 'Combination Pliers', exact: true })` |
| div | A B C D E | co2-rating-badge | - | `(no stable locator)` |
| span | $14.15 | product-price | - | `(no stable locator)` |
| link | Pliers A B C D E $12.01 | product-01M3QFFYE6Z3JQJEPE03J77CPJ | - | `getByTestId('product-01M3QFFYE6Z3JQJEPE03J77CPJ')` |
| heading | Pliers | product-name | - | `getByRole('heading', { name: 'Pliers', exact: true })` |
| span | $12.01 | product-price | - | `(no stable locator)` |
| link | Long Nose Pliers A B C D E Out of stock $14.24 | product-01M3QFFYECBA13KB1HKP2HR175 | - | `getByTestId('product-01M3QFFYECBA13KB1HKP2HR175')` |
| heading | Long Nose Pliers | product-name | - | `getByRole('heading', { name: 'Long Nose Pliers', exact: true })` |
| span | Out of stock | out-of-stock | - | `getByTestId('out-of-stock')` |
| span | $14.24 | product-price | - | `(no stable locator)` |
| link | Slip Joint Pliers A B C D E $9.17 | product-01M3QFFYEFDH1ABCY6YAQ9X2AT | - | `getByTestId('product-01M3QFFYEFDH1ABCY6YAQ9X2AT')` |
| heading | Slip Joint Pliers | product-name | - | `getByRole('heading', { name: 'Slip Joint Pliers', exact: true })` |
| span | $9.17 | product-price | - | `(no stable locator)` |
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
| `getByTestId('search-caption')` | 1 ✔ | true | Searched for: pliers |
| `getByText('Searched for: pliers')` | 1 ✔ | true | Searched for: pliers |
| `getByTestId('product-name')` | 4 ⚠ not unique | true | Combination Pliers |
