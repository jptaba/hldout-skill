# AUT inspection (tier 3 — bundled inspector)

- AUT: Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) — https://practicesoftwaretesting.com
- URL: https://practicesoftwaretesting.com/
- Title: Practice Software Testing - Toolshop - v5.0
- Captured: 2026-09-26T20:06:25.189Z
- testIdAttribute: `data-test`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | wait | `getByTestId('search-query')` | ✔ |
| 2 | fill | `getByTestId('search-query')` | ✔ |
| 3 | click | `getByTestId('search-submit')` | ✔ |

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
| checkbox | Hand Tools | category-01M3FMVTCWFBP4MK4QKA9XFN09 | checkbox | `getByRole('checkbox', { name: 'Hand Tools', exact: true })` |
| checkbox | Hammer | category-01M3FMVTD77ZCHSM4M5N10S60M | checkbox | `getByRole('checkbox', { name: 'Hammer', exact: true })` |
| checkbox | Hand Saw | category-01M3FMVTD77ZCHSM4M5N10S60N | checkbox | `getByRole('checkbox', { name: 'Hand Saw', exact: true })` |
| checkbox | Wrench | category-01M3FMVTD77ZCHSM4M5N10S60P | checkbox | `getByRole('checkbox', { name: 'Wrench', exact: true })` |
| checkbox | Screwdriver | category-01M3FMVTD77ZCHSM4M5N10S60Q | checkbox | `getByRole('checkbox', { name: 'Screwdriver', exact: true })` |
| checkbox | Pliers | category-01M3FMVTD77ZCHSM4M5N10S60R | checkbox | `getByRole('checkbox', { name: 'Pliers', exact: true })` |
| checkbox | Chisels | category-01M3FMVTD77ZCHSM4M5N10S60S | checkbox | `getByRole('checkbox', { name: 'Chisels', exact: true })` |
| checkbox | Measures | category-01M3FMVTD77ZCHSM4M5N10S60T | checkbox | `getByRole('checkbox', { name: 'Measures', exact: true })` |
| checkbox | Power Tools | category-01M3FMVTCWFBP4MK4QKA9XFN0A | checkbox | `getByRole('checkbox', { name: 'Power Tools', exact: true })` |
| checkbox | Grinder | category-01M3FMVTD77ZCHSM4M5N10S60V | checkbox | `getByRole('checkbox', { name: 'Grinder', exact: true })` |
| checkbox | Sander | category-01M3FMVTD77ZCHSM4M5N10S60W | checkbox | `getByRole('checkbox', { name: 'Sander', exact: true })` |
| checkbox | Saw | category-01M3FMVTD77ZCHSM4M5N10S60X | checkbox | `getByRole('checkbox', { name: 'Saw', exact: true })` |
| checkbox | Drill | category-01M3FMVTD77ZCHSM4M5N10S60Y | checkbox | `getByRole('checkbox', { name: 'Drill', exact: true })` |
| checkbox | Other | category-01M3FMVTCWFBP4MK4QKA9XFN0B | checkbox | `getByRole('checkbox', { name: 'Other', exact: true })` |
| checkbox | Tool Belts | category-01M3FMVTD77ZCHSM4M5N10S60Z | checkbox | `getByRole('checkbox', { name: 'Tool Belts', exact: true })` |
| checkbox | Storage Solutions | category-01M3FMVTD77ZCHSM4M5N10S610 | checkbox | `getByRole('checkbox', { name: 'Storage Solutions', exact: true })` |
| checkbox | Workbench | category-01M3FMVTD77ZCHSM4M5N10S611 | checkbox | `getByRole('checkbox', { name: 'Workbench', exact: true })` |
| checkbox | Safety Gear | category-01M3FMVTD77ZCHSM4M5N10S612 | checkbox | `getByRole('checkbox', { name: 'Safety Gear', exact: true })` |
| checkbox | Fasteners | category-01M3FMVTD77ZCHSM4M5N10S613 | checkbox | `getByRole('checkbox', { name: 'Fasteners', exact: true })` |
| checkbox | some name | brand-01m3fmvkv0ba3g8dqn644yqbrv | checkbox | `getByTestId('brand-01m3fmvkv0ba3g8dqn644yqbrv')` |
| checkbox | ForgeFlex Tools | brand-01M3FMVT1QNQ3VF32V7797JM37 | checkbox | `getByRole('checkbox', { name: 'ForgeFlex Tools', exact: true })` |
| checkbox | MightyCraft Hardware | brand-01M3FMVT1QNQ3VF32V7797JM38 | checkbox | `getByRole('checkbox', { name: 'MightyCraft Hardware', exact: true })` |
| checkbox | some name | brand-01m3fn4mkvvzw98c9wv9ydad16 | checkbox | `getByTestId('brand-01m3fn4mkvvzw98c9wv9ydad16')` |
| checkbox | Show only eco-friendly products | eco-friendly-filter | checkbox | `getByRole('checkbox', { name: 'Show only eco-friendly products', exact: true })` |
| heading | Searched for: zzqq | search-caption | - | `getByRole('heading', { name: 'Searched for: zzqq', exact: true })` |
| span | zzqq | search-term | - | `getByTestId('search-term')` |
| p | 0 products found for 'zzqq' | search-result-count | - | `getByTestId('search-result-count')` |
| div | There are no products found. | search_completed | - | `getByTestId('search_completed')` |
| div | There are no products found. | no-results | - | `getByTestId('no-results')` |
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
| `getByTestId('search-caption')` | 1 ✔ | true | Searched for: zzqq |
| `getByTestId('no-results')` | 1 ✔ | true | There are no products found. |
| `getByText('There are no products found.')` | 1 ✔ | true | There are no products found. |
