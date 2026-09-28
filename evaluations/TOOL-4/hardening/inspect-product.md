# AUT inspection (tier 3 — bundled inspector)

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) — https://practicesoftwaretesting.com/
- URL: https://practicesoftwaretesting.com/product/01M3MSNAZE6S13ANG13HA5VGE6
- Title: Combination Pliers - Practice Software Testing - Toolshop - v5.0
- Captured: 2026-09-28T20:27:44.427Z
- testIdAttribute: `data-test`

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET | `api.practicesoftwaretesting.com/users/me` | 401 | `{"message":"string"}` |
| GET | `api.practicesoftwaretesting.com/users/me` | 401 | `{"message":"string"}` |
| GET | `api.practicesoftwaretesting.com/products/01M3MSNAZE6S13ANG13HA5VGE6` | 200 | `{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","co2_rating":"string","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name":"string","by_url":"string","source_name":"string","source_url":"s` |
| GET | `api.practicesoftwaretesting.com/products/01M3MSNAZE6S13ANG13HA5VGE6/related` | 200 | `[{"id":"string","name":"string","description":"string","price":"number","is_location_offer":"boolean","is_rental":"boolean","in_stock":"boolean","is_eco_friendly":"boolean","product_image":{"id":"string","by_name":"string","by_url":"string","source_name":"string","source_url":"string","file_name":"s` |

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

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByTestId('add-to-favorites')` | 1 ✔ | true |  Add to favourites |
