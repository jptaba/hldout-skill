# AUT inspection (tier 3 — bundled inspector)

- AUT: Toolshop release candidate (with-bugs build) (profile `toolshop-rc`) — https://with-bugs.practicesoftwaretesting.com
- URL: https://with-bugs.practicesoftwaretesting.com/#/
- Title: Practice Software Testing - Toolshop - v5.0 with bugs
- Captured: 2026-09-26T20:11:17.899Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | wait | `getByTestId('search-query')` | ✔ |
| 2 | fill | `getByTestId('search-query')` | ✔ |
| 3 | click | `getByTestId('search-submit')` | ✔ |
| 4 | wait | `getByTestId('search-caption')` | ✔ |

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| div | View the Documentation for this application. | notification-bar | - | `getByTestId('notification-bar')` |
| link | Documentation | - | - | `getByRole('link', { name: 'Documentation', exact: true })` |
| button | Bug Hunting Guide | - | - | `getByRole('button', { name: 'Bug Hunting Guide', exact: true })` |
| link | Practice Software Testing - Toolshop | - | - | `getByRole('link', { name: 'Practice Software Testing - Toolshop', exact: true })` |
| menubar | Main menu | - | - | `getByRole('menubar', { name: 'Main menu', exact: true })` |
| menuitem | Home | - | - | `getByRole('menuitem', { name: 'Home', exact: true })` |
| link | Home | nav-home | - | `getByRole('link', { name: 'Home', exact: true })` |
| menuitem | Categories | - | - | `getByRole('menuitem', { name: 'Categories', exact: true })` |
| button | Categories | nav-categories | - | `getByRole('button', { name: 'Categories', exact: true })` |
| menuitem | Contakt | - | - | `getByRole('menuitem', { name: 'Contakt', exact: true })` |
| link | Contakt | nav-contact | - | `getByRole('link', { name: 'Contakt', exact: true })` |
| menuitem | Sign in | - | - | `getByRole('menuitem', { name: 'Sign in', exact: true })` |
| link | Sign in | nav-sign-in | - | `getByRole('link', { name: 'Sign in', exact: true })` |
| div | Sorth Name (A - Z) Name (Z - A) Price (High - Low) Price (Low - High) CO₂ Rating | filters | - | `getByTestId('filters') ⚠ matches 2` |
| combobox | Name (A - Z) Name (Z - A) Price (High - Low) Price (Low - High) CO₂ Rating (Best | sort | - | `getByTestId('sort')` |
| slider | ngx-slider | - | - | `getByRole('slider', { name: 'ngx-slider', exact: true })` |
| slider | ngx-slider-max | - | - | `getByRole('slider', { name: 'ngx-slider-max', exact: true })` |
| textbox | - | search-query | text | `getByTestId('search-query')` |
| button | X | search-reset | reset | `getByRole('button', { name: 'X', exact: true })` |
| button | Serch | search-submit | submit | `getByRole('button', { name: 'Serch', exact: true })` |
| checkbox | Hammer | category-3 | checkbox | `getByRole('checkbox', { name: 'Hammer', exact: true })` |
| checkbox | Hand Saw | category-4 | checkbox | `getByRole('checkbox', { name: 'Hand Saw', exact: true })` |
| checkbox | Wrench | category-5 | checkbox | `getByRole('checkbox', { name: 'Wrench', exact: true })` |
| checkbox | Screwdriver | category-6 | checkbox | `getByRole('checkbox', { name: 'Screwdriver', exact: true })` |
| checkbox | Pliers | category-7 | checkbox | `getByRole('checkbox', { name: 'Pliers', exact: true })` |
| checkbox | Grinder | category-8 | checkbox | `getByRole('checkbox', { name: 'Grinder', exact: true })` |
| checkbox | Sander | category-9 | checkbox | `getByRole('checkbox', { name: 'Sander', exact: true })` |
| checkbox | Saw | category-10 | checkbox | `getByRole('checkbox', { name: 'Saw', exact: true })` |
| checkbox | Drill | category-11 | checkbox | `getByRole('checkbox', { name: 'Drill', exact: true })` |
| checkbox | Other | category-12 | checkbox | `getByRole('checkbox', { name: 'Other', exact: true })` |
| checkbox | Brand name 1 | brand-1 | checkbox | `getByRole('checkbox', { name: 'Brand name 1', exact: true })` |
| checkbox | Brand name 2 | brand-2 | checkbox | `getByRole('checkbox', { name: 'Brand name 2', exact: true })` |
| checkbox | Brand name 3 | brand-3 | checkbox | `getByRole('checkbox', { name: 'Brand name 3', exact: true })` |
| checkbox | Brand name 4 | brand-4 | checkbox | `getByRole('checkbox', { name: 'Brand name 4', exact: true })` |
| checkbox | Brand name 5 | brand-5 | checkbox | `getByRole('checkbox', { name: 'Brand name 5', exact: true })` |
| checkbox | Brand name 6 | brand-6 | checkbox | `getByRole('checkbox', { name: 'Brand name 6', exact: true })` |
| checkbox | Brand name 7 | brand-7 | checkbox | `getByRole('checkbox', { name: 'Brand name 7', exact: true })` |
| checkbox | Brand name 8 | brand-8 | checkbox | `getByRole('checkbox', { name: 'Brand name 8', exact: true })` |
| checkbox | Brand name 9 | brand-9 | checkbox | `getByRole('checkbox', { name: 'Brand name 9', exact: true })` |
| checkbox | Brand name 10 | brand-10 | checkbox | `getByRole('checkbox', { name: 'Brand name 10', exact: true })` |
| checkbox | Show only eco-friendly products | eco-friendly-filter | checkbox | `getByRole('checkbox', { name: 'Show only eco-friendly products', exact: true })` |
| heading | Searched for: pliers | search-caption | - | `getByRole('heading', { name: 'Searched for: pliers', exact: true })` |
| span | pliers | search-term | - | `getByTestId('search-term')` |
| p | 4 products found for 'pliers' | search-result-count | - | `getByTestId('search-result-count')` |
| div | ECO Combination Pliers A B C D E $14.15 ECO Long Nose Pliers A B C D E Out of st | search_completed | - | `getByTestId('search_completed')` |
| link | ECO Combination Pliers A B C D E $14.15 | product-1 | - | `getByTestId('product-1')` |
| span | ECO | eco-badge | - | `getByTestId('eco-badge') ⚠ matches 4` |
| heading | Combination Pliers | product-name | - | `getByRole('heading', { name: 'Combination Pliers', exact: true })` |
| div | A B C D E | co2-rating-badge | - | `getByTestId('co2-rating-badge') ⚠ matches 4` |
| span | $14.15 | product-price | - | `getByTestId('product-price') ⚠ matches 4` |
| link | ECO Long Nose Pliers A B C D E Out of stock $14.24 | product-4 | - | `getByTestId('product-4')` |
| heading | Long Nose Pliers | product-name | - | `getByRole('heading', { name: 'Long Nose Pliers', exact: true })` |
| span | Out of stock | out-of-stock | - | `getByTestId('out-of-stock')` |
| span | $14.24 | product-price | - | `getByTestId('product-price') ⚠ matches 4` |
| link | ECO Pliers A B C D E $12.01 | product-2 | - | `getByTestId('product-2')` |
| heading | Pliers | product-name | - | `getByRole('heading', { name: 'Pliers', exact: true })` |
| span | $12.01 | product-price | - | `getByTestId('product-price') ⚠ matches 4` |
| link | ECO Slip Joint Pliers A B C D E $9.17 | product-5 | - | `getByTestId('product-5')` |
| heading | Slip Joint Pliers | product-name | - | `getByRole('heading', { name: 'Slip Joint Pliers', exact: true })` |
| span | $9.17 | product-price | - | `getByTestId('product-price') ⚠ matches 4` |
| div | LEARN & EXPLORE Learn Test Automation Hands-on courses for Playwright, Robot Fra | footer-explore | - | `getByTestId('footer-explore')` |
| link | Learn Test Automation Hands-on courses for Playwright, Robot Framework, APIs and | footer-learn-courses | - | `getByTestId('footer-learn-courses')` |
| link | API Spector Open-source API testing, mocking and contract testing | footer-learn-spector | - | `getByRole('link', { name: 'API Spector Open-source API testing, mocking and contract testing', exact: true })` |
| link | GitHub Source code, issues and contributions | footer-learn-github | - | `getByRole('link', { name: 'GitHub Source code, issues and contributions', exact: true })` |
| link | Barn Images | - | - | `getByRole('link', { name: 'Barn Images', exact: true })` |
| link | Unsplash | - | - | `getByRole('link', { name: 'Unsplash', exact: true })` |
| button | Open chat | chat-toggle | - | `getByRole('button', { name: 'Open chat', exact: true })` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByTestId('search-caption')` | 1 ✔ | true | Searched for: pliers |
| `getByTestId('product-name')` | 4 ⚠ not unique | true | Combination Pliers |
