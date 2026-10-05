# AUT inspection (tier 3 — bundled inspector)

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) — https://practicesoftwaretesting.com/
- URL: https://practicesoftwaretesting.com/
- Title: Practice Software Testing - Toolshop - v5.0
- Captured: 2026-10-05T00:59:07.942Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | wait | `locator('a.card[data-test^="product-"]')` | ✔ |
| 2 | check | `getByRole('checkbox', { name: 'Hammer', exact: true })` | ✔ |
| 3 | select | `getByTestId('sort')` | ✔ |

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET | `api.practicesoftwaretesting.com/brands` | 200 | `[{"id":"string","name":"string","slug":"string"}]` |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 401 | `{"message":"string"}` |
| GET | `api.practicesoftwaretesting.com/product-specs/names` | 200 | `[{"name":"string","values":["string"],"unit":"null"}]` |
| GET | `api.practicesoftwaretesting.com/categories/tree` | 200 | `[{"id":"string","name":"string","slug":"string","parent_id":"null","sub_categories":[{"id":"string","name":"string","slug":"string","parent_id":"string","sub_categories":[]}]}]` |
| QUERY ×3 | `api.practicesoftwaretesting.com/products` | 200 | `{"current_page":"number","data":[{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","co2_rating":"string","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name":"string","by_url":"string","sour` |

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
| checkbox | Hand Tools | category-01M44NSB6QZJFHB9139H3QKSJK | checkbox | `getByRole('checkbox', { name: 'Hand Tools', exact: true })` |
| checkbox | Hammer | category-01M44NSB700A1N91T5WRW6YVJH | checkbox | `getByRole('checkbox', { name: 'Hammer', exact: true })` |
| checkbox | Hand Saw | category-01M44NSB700A1N91T5WRW6YVJJ | checkbox | `getByRole('checkbox', { name: 'Hand Saw', exact: true })` |
| checkbox | Wrench | category-01M44NSB700A1N91T5WRW6YVJK | checkbox | `getByRole('checkbox', { name: 'Wrench', exact: true })` |
| checkbox | Screwdriver | category-01M44NSB700A1N91T5WRW6YVJM | checkbox | `getByRole('checkbox', { name: 'Screwdriver', exact: true })` |
| checkbox | Pliers | category-01M44NSB700A1N91T5WRW6YVJN | checkbox | `getByRole('checkbox', { name: 'Pliers', exact: true })` |
| checkbox | Chisels | category-01M44NSB700A1N91T5WRW6YVJP | checkbox | `getByRole('checkbox', { name: 'Chisels', exact: true })` |
| checkbox | Measures | category-01M44NSB700A1N91T5WRW6YVJQ | checkbox | `getByRole('checkbox', { name: 'Measures', exact: true })` |
| checkbox | Power Tools | category-01M44NSB6QZJFHB9139H3QKSJM | checkbox | `getByRole('checkbox', { name: 'Power Tools', exact: true })` |
| checkbox | Grinder | category-01M44NSB700A1N91T5WRW6YVJR | checkbox | `getByRole('checkbox', { name: 'Grinder', exact: true })` |
| checkbox | Sander | category-01M44NSB700A1N91T5WRW6YVJS | checkbox | `getByRole('checkbox', { name: 'Sander', exact: true })` |
| checkbox | Saw | category-01M44NSB700A1N91T5WRW6YVJT | checkbox | `getByRole('checkbox', { name: 'Saw', exact: true })` |
| checkbox | Drill | category-01M44NSB700A1N91T5WRW6YVJV | checkbox | `getByRole('checkbox', { name: 'Drill', exact: true })` |
| checkbox | Other | category-01M44NSB6QZJFHB9139H3QKSJN | checkbox | `getByRole('checkbox', { name: 'Other', exact: true })` |
| checkbox | Tool Belts | category-01M44NSB700A1N91T5WRW6YVJW | checkbox | `getByRole('checkbox', { name: 'Tool Belts', exact: true })` |
| checkbox | Storage Solutions | category-01M44NSB700A1N91T5WRW6YVJX | checkbox | `getByRole('checkbox', { name: 'Storage Solutions', exact: true })` |
| checkbox | Workbench | category-01M44NSB700A1N91T5WRW6YVJY | checkbox | `getByRole('checkbox', { name: 'Workbench', exact: true })` |
| checkbox | Safety Gear | category-01M44NSB700A1N91T5WRW6YVJZ | checkbox | `getByRole('checkbox', { name: 'Safety Gear', exact: true })` |
| checkbox | Fasteners | category-01M44NSB700A1N91T5WRW6YVK0 | checkbox | `getByRole('checkbox', { name: 'Fasteners', exact: true })` |
| checkbox | ForgeFlex Tools | brand-01M44NSATNJ25ZNH4NTDW47XYT | checkbox | `getByRole('checkbox', { name: 'ForgeFlex Tools', exact: true })` |
| checkbox | MightyCraft Hardware | brand-01M44NSATNJ25ZNH4NTDW47XYV | checkbox | `getByRole('checkbox', { name: 'MightyCraft Hardware', exact: true })` |
| checkbox | Show only eco-friendly products | eco-friendly-filter | checkbox | `getByRole('checkbox', { name: 'Show only eco-friendly products', exact: true })` |
| div | Thor Hammer A B C D E $11.14 Claw Hammer A B C D E $11.48 Hammer A B C D E $12.5 | sorting_completed | - | `getByTestId('sorting_completed')` |
| link | Thor Hammer A B C D E $11.14 | product-01M44NSB8XV9HXVX5XG8AK1DFZ | - | `getByTestId('product-01M44NSB8XV9HXVX5XG8AK1DFZ')` |
| button | Compare | compare-btn | - | `getByRole('button', { name: 'Compare' }) ⚠ matches 7: add .nth() or scope it` |
| heading | Thor Hammer | product-name | - | `getByRole('heading', { name: 'Thor Hammer', exact: true })` |
| div | A B C D E | co2-rating-badge | - | `(no stable locator)` |
| span | $11.14 | product-price | - | `(no stable locator)` |
| link | Claw Hammer A B C D E $11.48 | product-01M44NSB8WEXVMWX9W2B8KSWD4 | - | `getByTestId('product-01M44NSB8WEXVMWX9W2B8KSWD4')` |
| heading | Claw Hammer | product-name | - | `getByRole('heading', { name: 'Claw Hammer', exact: true })` |
| span | $11.48 | product-price | - | `(no stable locator)` |
| link | Hammer A B C D E $12.58 | product-01M44NSB8T9R4VZ0CXX8JTR1Z9 | - | `getByTestId('product-01M44NSB8T9R4VZ0CXX8JTR1Z9')` |
| heading | Hammer | product-name | - | `getByRole('heading', { name: 'Hammer', exact: true })` |
| span | $12.58 | product-price | - | `(no stable locator)` |
| link | Claw Hammer with Shock Reduction Grip A B C D E $13.41 | product-01M44NSB8S6GCY0HV2JJX6EWDV | - | `getByTestId('product-01M44NSB8S6GCY0HV2JJX6EWDV')` |
| heading | Claw Hammer with Shock Reduction Grip | product-name | - | `getByRole('heading', { name: 'Claw Hammer with Shock Reduction Grip', exact: true })` |
| span | $13.41 | product-price | - | `(no stable locator)` |
| link | Sledgehammer A B C D E $17.75 | product-01M44NSB8ZPX7HMSBE3Q63X6FD | - | `getByTestId('product-01M44NSB8ZPX7HMSBE3Q63X6FD')` |
| heading | Sledgehammer | product-name | - | `getByRole('heading', { name: 'Sledgehammer', exact: true })` |
| span | $17.75 | product-price | - | `(no stable locator)` |
| link | Court Hammer A B C D E $18.63 | product-01M44NSB93A4A2V1S56QZNW05X | - | `getByTestId('product-01M44NSB93A4A2V1S56QZNW05X')` |
| heading | Court Hammer | product-name | - | `getByRole('heading', { name: 'Court Hammer', exact: true })` |
| span | $18.63 | product-price | - | `(no stable locator)` |
| link | Claw Hammer with Fiberglass Handle A B C D E $20.14 | product-01M44NSB91KPHP1VJ2QM96H8DS | - | `getByTestId('product-01M44NSB91KPHP1VJ2QM96H8DS')` |
| heading | Claw Hammer with Fiberglass Handle | product-name | - | `getByRole('heading', { name: 'Claw Hammer with Fiberglass Handle', exact: true })` |
| span | $20.14 | product-price | - | `(no stable locator)` |
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
| `locator('a.card[data-test^="product-"]').getByTestId('product-name')` | 7 ⚠ not unique | true | Thor Hammer |
| `locator('a.card[data-test^="product-"]').first().getByTestId('product-price')` | 1 ✔ | true | $11.14 |
