# AUT inspection (tier 3 — bundled inspector)

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) — https://practicesoftwaretesting.com/
- URL: https://practicesoftwaretesting.com/
- Title: Practice Software Testing - Toolshop - v5.0
- Captured: 2026-09-29T22:06:47.207Z
- testIdAttribute: `data-test`

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET ×2 | `api.practicesoftwaretesting.com/users/me` | 401 | `{"message":"string"}` |
| GET | `api.practicesoftwaretesting.com/brands` | 200 | `[{"id":"string","name":"string","slug":"string"}]` |
| GET | `api.practicesoftwaretesting.com/product-specs/names` | 200 | `[{"name":"string","values":["string"],"unit":"null"}]` |
| GET | `api.practicesoftwaretesting.com/categories/tree` | 200 | `[{"id":"string","name":"string","slug":"string","parent_id":"null","sub_categories":[{"id":"string","name":"string","slug":"string","parent_id":"string","sub_categories":[]}]}]` |
| QUERY | `api.practicesoftwaretesting.com/products` | 200 | `{"current_page":"number","data":[{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","co2_rating":"string","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name":"string","by_url":"string","sour` |

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
| checkbox | Hand Tools | category-01M3QJXQDKQZQ8FE5HBKN18Z6K | checkbox | `getByRole('checkbox', { name: 'Hand Tools', exact: true })` |
| checkbox | Hammer | category-01M3QJXQDY5VCAEXK60SH7D9R7 | checkbox | `getByRole('checkbox', { name: 'Hammer', exact: true })` |
| checkbox | Hand Saw | category-01M3QJXQDY5VCAEXK60SH7D9R8 | checkbox | `getByRole('checkbox', { name: 'Hand Saw', exact: true })` |
| checkbox | Wrench | category-01M3QJXQDY5VCAEXK60SH7D9R9 | checkbox | `getByRole('checkbox', { name: 'Wrench', exact: true })` |
| checkbox | Screwdriver | category-01M3QJXQDY5VCAEXK60SH7D9RA | checkbox | `getByRole('checkbox', { name: 'Screwdriver', exact: true })` |
| checkbox | Pliers | category-01M3QJXQDY5VCAEXK60SH7D9RB | checkbox | `getByRole('checkbox', { name: 'Pliers', exact: true })` |
| checkbox | Chisels | category-01M3QJXQDY5VCAEXK60SH7D9RC | checkbox | `getByRole('checkbox', { name: 'Chisels', exact: true })` |
| checkbox | Measures | category-01M3QJXQDY5VCAEXK60SH7D9RD | checkbox | `getByRole('checkbox', { name: 'Measures', exact: true })` |
| checkbox | Power Tools | category-01M3QJXQDMQB6N0E4Q5Y8WVHWW | checkbox | `getByRole('checkbox', { name: 'Power Tools', exact: true })` |
| checkbox | Grinder | category-01M3QJXQDY5VCAEXK60SH7D9RE | checkbox | `getByRole('checkbox', { name: 'Grinder', exact: true })` |
| checkbox | Sander | category-01M3QJXQDY5VCAEXK60SH7D9RF | checkbox | `getByRole('checkbox', { name: 'Sander', exact: true })` |
| checkbox | Saw | category-01M3QJXQDY5VCAEXK60SH7D9RG | checkbox | `getByRole('checkbox', { name: 'Saw', exact: true })` |
| checkbox | Drill | category-01M3QJXQDY5VCAEXK60SH7D9RH | checkbox | `getByRole('checkbox', { name: 'Drill', exact: true })` |
| checkbox | Other | category-01M3QJXQDMQB6N0E4Q5Y8WVHWX | checkbox | `getByRole('checkbox', { name: 'Other', exact: true })` |
| checkbox | Tool Belts | category-01M3QJXQDY5VCAEXK60SH7D9RJ | checkbox | `getByRole('checkbox', { name: 'Tool Belts', exact: true })` |
| checkbox | Storage Solutions | category-01M3QJXQDY5VCAEXK60SH7D9RK | checkbox | `getByRole('checkbox', { name: 'Storage Solutions', exact: true })` |
| checkbox | Workbench | category-01M3QJXQDY5VCAEXK60SH7D9RM | checkbox | `getByRole('checkbox', { name: 'Workbench', exact: true })` |
| checkbox | Safety Gear | category-01M3QJXQDY5VCAEXK60SH7D9RN | checkbox | `getByRole('checkbox', { name: 'Safety Gear', exact: true })` |
| checkbox | Fasteners | category-01M3QJXQDY5VCAEXK60SH7D9RP | checkbox | `getByRole('checkbox', { name: 'Fasteners', exact: true })` |
| checkbox | ForgeFlex Tools | brand-01M3QJXQ2WXZF7CF3GAZWMA78Y | checkbox | `getByRole('checkbox', { name: 'ForgeFlex Tools', exact: true })` |
| checkbox | MightyCraft Hardware | brand-01M3QJXQ2WXZF7CF3GAZWMA78Z | checkbox | `getByRole('checkbox', { name: 'MightyCraft Hardware', exact: true })` |
| checkbox | 6093759406012449editado | brand-01m3qjygsadad6fm31peeafnt9 | checkbox | `getByRole('checkbox', { name: '6093759406012449editado', exact: true })` |
| checkbox | 3953685293243535editado | brand-01m3qk06qaa953bsw02qrjtecc | checkbox | `getByRole('checkbox', { name: '3953685293243535editado', exact: true })` |
| checkbox | 2678819973110232editado | brand-01m3qk1sh4n7tp57mj0wwvqdc0 | checkbox | `getByRole('checkbox', { name: '2678819973110232editado', exact: true })` |
| checkbox | 2906795977913862editado | brand-01m3qk3ddj7r3cr4ntdzbky1vb | checkbox | `getByRole('checkbox', { name: '2906795977913862editado', exact: true })` |
| checkbox | 2297250671477049editado | brand-01m3qk60r9v92knbdp74bybsem | checkbox | `getByRole('checkbox', { name: '2297250671477049editado', exact: true })` |
| checkbox | 4883203313273666editado | brand-01m3qk69ecjnd0cj5tj1b6tcbv | checkbox | `getByRole('checkbox', { name: '4883203313273666editado', exact: true })` |
| checkbox | 1241328064332006editado | brand-01m3qk6aee4hn54npdpje2h5xd | checkbox | `getByRole('checkbox', { name: '1241328064332006editado', exact: true })` |
| checkbox | 77229009903058editado | brand-01m3qk6z93me778xgqrz4r1z1q | checkbox | `getByRole('checkbox', { name: '77229009903058editado', exact: true })` |
| checkbox | 4866645365455969editado | brand-01m3qk7jkd7gv0tzm331wznc10 | checkbox | `getByRole('checkbox', { name: '4866645365455969editado', exact: true })` |
| checkbox | 1849230934467644editado | brand-01m3qk7pa4nh6dnnf0t9bh6mm5 | checkbox | `getByRole('checkbox', { name: '1849230934467644editado', exact: true })` |
| checkbox | 4714479057956791editado | brand-01m3qk977xddmsejkarsapk8qr | checkbox | `getByRole('checkbox', { name: '4714479057956791editado', exact: true })` |
| checkbox | Show only eco-friendly products | eco-friendly-filter | checkbox | `getByRole('checkbox', { name: 'Show only eco-friendly products', exact: true })` |
| div | Combination Pliers A B C D E $14.15 Pliers A B C D E $12.01 Bolt Cutters A B C D | - | - | `(no stable locator)` |
| link | Combination Pliers A B C D E $14.15 | product-01M3QJXQFBJC3M2NF6FXJT54CK | - | `getByTestId('product-01M3QJXQFBJC3M2NF6FXJT54CK')` |
| button | Compare | compare-btn | - | `getByRole('button', { name: 'Compare' }) ⚠ matches 9: add .nth() or scope it` |
| heading | Combination Pliers | product-name | - | `getByRole('heading', { name: 'Combination Pliers', exact: true })` |
| div | A B C D E | co2-rating-badge | - | `(no stable locator)` |
| span | $14.15 | product-price | - | `(no stable locator)` |
| link | Pliers A B C D E $12.01 | product-01M3QJXQFN6VFQVMSDHQEBX7M7 | - | `getByTestId('product-01M3QJXQFN6VFQVMSDHQEBX7M7')` |
| heading | Pliers | product-name | - | `getByRole('heading', { name: 'Pliers', exact: true })` |
| span | $12.01 | product-price | - | `(no stable locator)` |
| link | Bolt Cutters A B C D E $48.41 | product-01M3QJXQFXW5SQWGSHZWD66MDG | - | `getByTestId('product-01M3QJXQFXW5SQWGSHZWD66MDG')` |
| heading | Bolt Cutters | product-name | - | `getByRole('heading', { name: 'Bolt Cutters', exact: true })` |
| span | $48.41 | product-price | - | `(no stable locator)` |
| link | Long Nose Pliers A B C D E Out of stock $14.24 | product-01M3QJXQH97T1FGVF7GR6TGSMN | - | `getByTestId('product-01M3QJXQH97T1FGVF7GR6TGSMN')` |
| heading | Long Nose Pliers | product-name | - | `getByRole('heading', { name: 'Long Nose Pliers', exact: true })` |
| span | Out of stock | out-of-stock | - | `getByTestId('out-of-stock')` |
| span | $14.24 | product-price | - | `(no stable locator)` |
| link | Slip Joint Pliers A B C D E $9.17 | product-01M3QJXQHVBA2Z8E0YKDME4C94 | - | `getByTestId('product-01M3QJXQHVBA2Z8E0YKDME4C94')` |
| heading | Slip Joint Pliers | product-name | - | `getByRole('heading', { name: 'Slip Joint Pliers', exact: true })` |
| span | $9.17 | product-price | - | `(no stable locator)` |
| link | Claw Hammer with Shock Reduction Grip A B C D E $13.41 | product-01M3QJXQHY99WEBGDFT29MVA4B | - | `getByTestId('product-01M3QJXQHY99WEBGDFT29MVA4B')` |
| heading | Claw Hammer with Shock Reduction Grip | product-name | - | `getByRole('heading', { name: 'Claw Hammer with Shock Reduction Grip', exact: true })` |
| span | $13.41 | product-price | - | `(no stable locator)` |
| link | Hammer A B C D E $12.58 | product-01M3QJXQJ7Q49G49WH7K81VZ07 | - | `getByTestId('product-01M3QJXQJ7Q49G49WH7K81VZ07')` |
| heading | Hammer | product-name | - | `getByRole('heading', { name: 'Hammer', exact: true })` |
| span | $12.58 | product-price | - | `(no stable locator)` |
| link | Claw Hammer A B C D E $11.48 | product-01M3QJXQJCHH8D6SM3988HTD1Z | - | `getByTestId('product-01M3QJXQJCHH8D6SM3988HTD1Z')` |
| heading | Claw Hammer | product-name | - | `getByRole('heading', { name: 'Claw Hammer', exact: true })` |
| span | $11.48 | product-price | - | `(no stable locator)` |
| link | Thor Hammer A B C D E $11.14 | product-01M3QJXQJHDB71SAG06CVTHSEY | - | `getByTestId('product-01M3QJXQJHDB71SAG06CVTHSEY')` |
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
| `getByTestId('product-name')` | 9 ⚠ not unique | true | Combination Pliers |
| `getByRole('button', { name: 'Page-6', exact: true })` | 0 ✖ | false |  |
