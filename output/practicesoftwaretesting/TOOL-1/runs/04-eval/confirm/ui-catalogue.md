# AUT inspection (tier 3 — bundled inspector)

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) — https://practicesoftwaretesting.com/
- URL: https://practicesoftwaretesting.com/
- Title: Practice Software Testing - Toolshop - v5.0
- Captured: 2026-10-05T01:11:11.275Z
- testIdAttribute: `data-test`

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 401 | `{"message":"string"}` |
| GET | `api.practicesoftwaretesting.com/product-specs/names` | 200 | `[{"name":"string","values":["string"],"unit":"null"}]` |
| GET | `api.practicesoftwaretesting.com/brands` | 200 | `[{"id":"string","name":"string","slug":"string"}]` |
| QUERY | `api.practicesoftwaretesting.com/products` | 200 | `{"current_page":"number","data":[{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","co2_rating":"string","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name":"string","by_url":"string","sour` |
| GET | `api.practicesoftwaretesting.com/categories/tree` | 200 | `[{"id":"string","name":"string","slug":"string","parent_id":"null","sub_categories":[{"id":"string","name":"string","slug":"string","parent_id":"string","sub_categories":[]}]}]` |

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
| checkbox | Hand Tools | category-01M44S7HHNFT659P0TFBNW07SC | checkbox | `getByRole('checkbox', { name: 'Hand Tools', exact: true })` |
| checkbox | Hammer | category-01M44S7HKD1W1H60NZ2QSCWNXV | checkbox | `getByRole('checkbox', { name: 'Hammer', exact: true })` |
| checkbox | Hand Saw | category-01M44S7HKD1W1H60NZ2QSCWNXW | checkbox | `getByRole('checkbox', { name: 'Hand Saw', exact: true })` |
| checkbox | Wrench | category-01M44S7HKD1W1H60NZ2QSCWNXX | checkbox | `getByRole('checkbox', { name: 'Wrench', exact: true })` |
| checkbox | Screwdriver | category-01M44S7HKD1W1H60NZ2QSCWNXY | checkbox | `getByRole('checkbox', { name: 'Screwdriver', exact: true })` |
| checkbox | Pliers | category-01M44S7HKD1W1H60NZ2QSCWNXZ | checkbox | `getByRole('checkbox', { name: 'Pliers', exact: true })` |
| checkbox | Chisels | category-01M44S7HKD1W1H60NZ2QSCWNY0 | checkbox | `getByRole('checkbox', { name: 'Chisels', exact: true })` |
| checkbox | Measures | category-01M44S7HKD1W1H60NZ2QSCWNY1 | checkbox | `getByRole('checkbox', { name: 'Measures', exact: true })` |
| checkbox | Power Tools | category-01M44S7HHNFT659P0TFBNW07SD | checkbox | `getByRole('checkbox', { name: 'Power Tools', exact: true })` |
| checkbox | Grinder | category-01M44S7HKD1W1H60NZ2QSCWNY2 | checkbox | `getByRole('checkbox', { name: 'Grinder', exact: true })` |
| checkbox | Sander | category-01M44S7HKD1W1H60NZ2QSCWNY3 | checkbox | `getByRole('checkbox', { name: 'Sander', exact: true })` |
| checkbox | Saw | category-01M44S7HKD1W1H60NZ2QSCWNY4 | checkbox | `getByRole('checkbox', { name: 'Saw', exact: true })` |
| checkbox | Drill | category-01M44S7HKD1W1H60NZ2QSCWNY5 | checkbox | `getByRole('checkbox', { name: 'Drill', exact: true })` |
| checkbox | Other | category-01M44S7HHNFT659P0TFBNW07SE | checkbox | `getByRole('checkbox', { name: 'Other', exact: true })` |
| checkbox | Tool Belts | category-01M44S7HKD1W1H60NZ2QSCWNY6 | checkbox | `getByRole('checkbox', { name: 'Tool Belts', exact: true })` |
| checkbox | Storage Solutions | category-01M44S7HKD1W1H60NZ2QSCWNY7 | checkbox | `getByRole('checkbox', { name: 'Storage Solutions', exact: true })` |
| checkbox | Workbench | category-01M44S7HKD1W1H60NZ2QSCWNY8 | checkbox | `getByRole('checkbox', { name: 'Workbench', exact: true })` |
| checkbox | Safety Gear | category-01M44S7HKD1W1H60NZ2QSCWNY9 | checkbox | `getByRole('checkbox', { name: 'Safety Gear', exact: true })` |
| checkbox | Fasteners | category-01M44S7HKD1W1H60NZ2QSCWNYA | checkbox | `getByRole('checkbox', { name: 'Fasteners', exact: true })` |
| checkbox | ForgeFlex Tools | brand-01M44S7H5K05AGPCD8D42KAANY | checkbox | `getByRole('checkbox', { name: 'ForgeFlex Tools', exact: true })` |
| checkbox | MightyCraft Hardware | brand-01M44S7H5K05AGPCD8D42KAANZ | checkbox | `getByRole('checkbox', { name: 'MightyCraft Hardware', exact: true })` |
| checkbox | Show only eco-friendly products | eco-friendly-filter | checkbox | `getByRole('checkbox', { name: 'Show only eco-friendly products', exact: true })` |
| div | Combination Pliers A B C D E $14.15 Pliers A B C D E $12.01 Bolt Cutters A B C D | - | - | `(no stable locator)` |
| link | Combination Pliers A B C D E $14.15 | product-01M44S7HNKRSHDH155H9HZAP09 | - | `getByTestId('product-01M44S7HNKRSHDH155H9HZAP09')` |
| button | Compare | compare-btn | - | `getByRole('button', { name: 'Compare' }) ⚠ matches 9: add .nth() or scope it` |
| heading | Combination Pliers | product-name | - | `getByRole('heading', { name: 'Combination Pliers', exact: true })` |
| div | A B C D E | co2-rating-badge | - | `(no stable locator)` |
| span | $14.15 | product-price | - | `(no stable locator)` |
| link | Pliers A B C D E $12.01 | product-01M44S7HNTXH3H0CA6M8CQ58N5 | - | `getByTestId('product-01M44S7HNTXH3H0CA6M8CQ58N5')` |
| heading | Pliers | product-name | - | `getByRole('heading', { name: 'Pliers', exact: true })` |
| span | $12.01 | product-price | - | `(no stable locator)` |
| link | Bolt Cutters A B C D E $48.41 | product-01M44S7HNX667T7357AWKPMNX8 | - | `getByTestId('product-01M44S7HNX667T7357AWKPMNX8')` |
| heading | Bolt Cutters | product-name | - | `getByRole('heading', { name: 'Bolt Cutters', exact: true })` |
| span | $48.41 | product-price | - | `(no stable locator)` |
| link | Long Nose Pliers A B C D E Out of stock $14.24 | product-01M44S7HP0YJ984ZM4EA6CGHSQ | - | `getByTestId('product-01M44S7HP0YJ984ZM4EA6CGHSQ')` |
| heading | Long Nose Pliers | product-name | - | `getByRole('heading', { name: 'Long Nose Pliers', exact: true })` |
| span | Out of stock | out-of-stock | - | `getByTestId('out-of-stock')` |
| span | $14.24 | product-price | - | `(no stable locator)` |
| link | Slip Joint Pliers A B C D E $9.17 | product-01M44S7HP2KV0YCK2VXS2JSS20 | - | `getByTestId('product-01M44S7HP2KV0YCK2VXS2JSS20')` |
| heading | Slip Joint Pliers | product-name | - | `getByRole('heading', { name: 'Slip Joint Pliers', exact: true })` |
| span | $9.17 | product-price | - | `(no stable locator)` |
| link | Claw Hammer with Shock Reduction Grip A B C D E $13.41 | product-01M44S7HP49WXJ5XFK5YWEZMSV | - | `getByTestId('product-01M44S7HP49WXJ5XFK5YWEZMSV')` |
| heading | Claw Hammer with Shock Reduction Grip | product-name | - | `getByRole('heading', { name: 'Claw Hammer with Shock Reduction Grip', exact: true })` |
| span | $13.41 | product-price | - | `(no stable locator)` |
| link | Hammer A B C D E $12.58 | product-01M44S7HP6D6TJVKK7CYPHXQEZ | - | `getByTestId('product-01M44S7HP6D6TJVKK7CYPHXQEZ')` |
| heading | Hammer | product-name | - | `getByRole('heading', { name: 'Hammer', exact: true })` |
| span | $12.58 | product-price | - | `(no stable locator)` |
| link | Claw Hammer A B C D E $11.48 | product-01M44S7HP8GX13F83YS6TK00MQ | - | `getByTestId('product-01M44S7HP8GX13F83YS6TK00MQ')` |
| heading | Claw Hammer | product-name | - | `getByRole('heading', { name: 'Claw Hammer', exact: true })` |
| span | $11.48 | product-price | - | `(no stable locator)` |
| link | Thor Hammer A B C D E $11.14 | product-01M44S7HPBFKRDCSD3R3HK8C8Y | - | `getByTestId('product-01M44S7HPBFKRDCSD3R3HK8C8Y')` |
| heading | Thor Hammer | product-name | - | `getByRole('heading', { name: 'Thor Hammer', exact: true })` |
| span | $11.14 | product-price | - | `(no stable locator)` |
| button | Previous | pagination-prev | button | `getByRole('button', { name: 'Previous', exact: true })` |
| button | Page-1 | - | button | `getByRole('button', { name: 'Page-1', exact: true })` |
| button | Page-2 | - | button | `getByRole('button', { name: 'Page-2', exact: true })` |
| button | Page-3 | - | button | `getByRole('button', { name: 'Page-3', exact: true })` |
| button | Page-4 | - | button | `getByRole('button', { name: 'Page-4', exact: true })` |
| button | Page-5 | - | button | `getByRole('button', { name: 'Page-5', exact: true })` |
| button | Next | pagination-next | button | `getByRole('button', { name: 'Next', exact: true })` |
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
| `locator('a.card')` | 9 ⚠ not unique | true | Combination Pliers A B C D E $14.15 |
| `getByTestId('pagination-next')` | 1 ✔ | true | » |

Screenshot: output/practicesoftwaretesting/TOOL-1/runs/04-eval/confirm/ui-catalogue.png
