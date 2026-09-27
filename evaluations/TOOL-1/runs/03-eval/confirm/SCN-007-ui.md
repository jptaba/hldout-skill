# AUT inspection (tier 3 — bundled inspector)

- AUT: Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) — https://practicesoftwaretesting.com
- URL: https://practicesoftwaretesting.com/
- Title: Practice Software Testing - Toolshop - v5.0
- Captured: 2026-09-26T22:35:57.723Z
- testIdAttribute: `data-test`

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
| checkbox | Hand Tools | category-01M3FVQJEJY55HP50FJD58SX8N | checkbox | `getByRole('checkbox', { name: 'Hand Tools', exact: true })` |
| checkbox | Hammer | category-01M3FVQJF35CXZSV0KWKN4P92S | checkbox | `getByRole('checkbox', { name: 'Hammer', exact: true })` |
| checkbox | Hand Saw | category-01M3FVQJF35CXZSV0KWKN4P92T | checkbox | `getByRole('checkbox', { name: 'Hand Saw', exact: true })` |
| checkbox | Wrench | category-01M3FVQJF35CXZSV0KWKN4P92V | checkbox | `getByRole('checkbox', { name: 'Wrench', exact: true })` |
| checkbox | Screwdriver | category-01M3FVQJF35CXZSV0KWKN4P92W | checkbox | `getByRole('checkbox', { name: 'Screwdriver', exact: true })` |
| checkbox | Pliers | category-01M3FVQJF35CXZSV0KWKN4P92X | checkbox | `getByRole('checkbox', { name: 'Pliers', exact: true })` |
| checkbox | Chisels | category-01M3FVQJF35CXZSV0KWKN4P92Y | checkbox | `getByRole('checkbox', { name: 'Chisels', exact: true })` |
| checkbox | Measures | category-01M3FVQJF35CXZSV0KWKN4P92Z | checkbox | `getByRole('checkbox', { name: 'Measures', exact: true })` |
| checkbox | Power Tools | category-01M3FVQJEJY55HP50FJD58SX8P | checkbox | `getByRole('checkbox', { name: 'Power Tools', exact: true })` |
| checkbox | Grinder | category-01M3FVQJF35CXZSV0KWKN4P930 | checkbox | `getByRole('checkbox', { name: 'Grinder', exact: true })` |
| checkbox | Sander | category-01M3FVQJF35CXZSV0KWKN4P931 | checkbox | `getByRole('checkbox', { name: 'Sander', exact: true })` |
| checkbox | Saw | category-01M3FVQJF35CXZSV0KWKN4P932 | checkbox | `getByRole('checkbox', { name: 'Saw', exact: true })` |
| checkbox | Drill | category-01M3FVQJF35CXZSV0KWKN4P933 | checkbox | `getByRole('checkbox', { name: 'Drill', exact: true })` |
| checkbox | Other | category-01M3FVQJEJY55HP50FJD58SX8Q | checkbox | `getByRole('checkbox', { name: 'Other', exact: true })` |
| checkbox | Tool Belts | category-01M3FVQJF35CXZSV0KWKN4P934 | checkbox | `getByRole('checkbox', { name: 'Tool Belts', exact: true })` |
| checkbox | Storage Solutions | category-01M3FVQJF35CXZSV0KWKN4P935 | checkbox | `getByRole('checkbox', { name: 'Storage Solutions', exact: true })` |
| checkbox | Workbench | category-01M3FVQJF35CXZSV0KWKN4P936 | checkbox | `getByRole('checkbox', { name: 'Workbench', exact: true })` |
| checkbox | Safety Gear | category-01M3FVQJF35CXZSV0KWKN4P937 | checkbox | `getByRole('checkbox', { name: 'Safety Gear', exact: true })` |
| checkbox | Fasteners | category-01M3FVQJF35CXZSV0KWKN4P938 | checkbox | `getByRole('checkbox', { name: 'Fasteners', exact: true })` |
| checkbox | ForgeFlex Tools | brand-01M3FVQJ4FMSC42TYW9PNY8GQ0 | checkbox | `getByRole('checkbox', { name: 'ForgeFlex Tools', exact: true })` |
| checkbox | MightyCraft Hardware | brand-01M3FVQJ4FMSC42TYW9PNY8GQ1 | checkbox | `getByRole('checkbox', { name: 'MightyCraft Hardware', exact: true })` |
| checkbox | some name | brand-01m3fvx5npc2xn5kg3cvj6xsjd | checkbox | `getByTestId('brand-01m3fvx5npc2xn5kg3cvj6xsjd')` |
| checkbox | Marca 0da41408 | brand-01m3fw46d4kxgq2kx6cfn595bn | checkbox | `getByRole('checkbox', { name: 'Marca 0da41408', exact: true })` |
| checkbox | Marca f62735af | brand-01m3fw474nzbmtnqk7vkc9f76h | checkbox | `getByRole('checkbox', { name: 'Marca f62735af', exact: true })` |
| checkbox | Marca Atualizada | brand-01m3fw48kw6e6c5qk8wekc7efw | checkbox | `getByRole('checkbox', { name: 'Marca Atualizada', exact: true })` |
| checkbox | Marca Teste | brand-01m3fw4a5yf4mqgxcsfmqre83x | checkbox | `getByRole('checkbox', { name: 'Marca Teste', exact: true })` |
| checkbox | some name | brand-01m3fw66abed1n4az3k4j4zxjb | checkbox | `getByTestId('brand-01m3fw66abed1n4az3k4j4zxjb')` |
| checkbox | Marca 8d1726c1 | brand-01m3fw6cn963806h7kkq0mh63s | checkbox | `getByRole('checkbox', { name: 'Marca 8d1726c1', exact: true })` |
| checkbox | Marca 41fbfc1a | brand-01m3fw6dctxm88mbzszzdzgjwn | checkbox | `getByRole('checkbox', { name: 'Marca 41fbfc1a', exact: true })` |
| checkbox | Marca bedf09c1 | brand-01m3fw6evtmhffw19aq2r8mch0 | checkbox | `getByRole('checkbox', { name: 'Marca bedf09c1', exact: true })` |
| checkbox | some name | brand-01m3fwf6wncjwvt66fv39b1xp2 | checkbox | `getByTestId('brand-01m3fwf6wncjwvt66fv39b1xp2')` |
| checkbox | some name | brand-01m3fwr7ars2t8hyzvcvd8egm4 | checkbox | `getByTestId('brand-01m3fwr7ars2t8hyzvcvd8egm4')` |
| checkbox | Marca-4fd90912 | brand-01m3fwrn5zeq3yt9ap74gzahzn | checkbox | `getByRole('checkbox', { name: 'Marca-4fd90912', exact: true })` |
| checkbox | Marca-caebf1a4 | brand-01m3fwrnxeya0996qn69pfgjkb | checkbox | `getByRole('checkbox', { name: 'Marca-caebf1a4', exact: true })` |
| checkbox | MarcaAtualizada-aca3d45a | brand-01m3fwrqbzxa2fa8ytm0nkvr7z | checkbox | `getByRole('checkbox', { name: 'MarcaAtualizada-aca3d45a', exact: true })` |
| checkbox | some name | brand-01m3fx1bzr1mnknpvemqsr8ab1 | checkbox | `getByTestId('brand-01m3fx1bzr1mnknpvemqsr8ab1')` |
| checkbox | Marca-9ba90354 | brand-01m3fx2jyrhkagabehxfzb0k3r | checkbox | `getByRole('checkbox', { name: 'Marca-9ba90354', exact: true })` |
| checkbox | Marca-c33ea16b | brand-01m3fx2kq5jh1bbj5p2bad1qe6 | checkbox | `getByRole('checkbox', { name: 'Marca-c33ea16b', exact: true })` |
| checkbox | MarcaAtualizada-d15011f6 | brand-01m3fx2n5yeb7m2kx3nrzmy7d3 | checkbox | `getByRole('checkbox', { name: 'MarcaAtualizada-d15011f6', exact: true })` |
| checkbox | Show only eco-friendly products | eco-friendly-filter | checkbox | `getByRole('checkbox', { name: 'Show only eco-friendly products', exact: true })` |
| div | Combination Pliers A B C D E $14.15 Pliers A B C D E $12.01 Bolt Cutters A B C D | - | - | `(no stable locator)` |
| link | Combination Pliers A B C D E $14.15 | product-01M3FVQJG6E2QF0114BDA47REV | - | `getByTestId('product-01M3FVQJG6E2QF0114BDA47REV')` |
| button | Compare | compare-btn | - | `getByRole('button', { name: 'Compare', exact: true }) ⚠ matches 9` |
| heading | Combination Pliers | product-name | - | `getByRole('heading', { name: 'Combination Pliers', exact: true })` |
| div | A B C D E | co2-rating-badge | - | `getByTestId('co2-rating-badge') ⚠ matches 9` |
| span | $14.15 | product-price | - | `getByTestId('product-price') ⚠ matches 9` |
| link | Pliers A B C D E $12.01 | product-01M3FVQJGBYFCZNY6D67EHK8Z7 | - | `getByTestId('product-01M3FVQJGBYFCZNY6D67EHK8Z7')` |
| heading | Pliers | product-name | - | `getByRole('heading', { name: 'Pliers', exact: true })` |
| span | $12.01 | product-price | - | `getByTestId('product-price') ⚠ matches 9` |
| link | Bolt Cutters A B C D E $48.41 | product-01M3FVQJGMA534HDGC0W330QGC | - | `getByTestId('product-01M3FVQJGMA534HDGC0W330QGC')` |
| heading | Bolt Cutters | product-name | - | `getByRole('heading', { name: 'Bolt Cutters', exact: true })` |
| span | $48.41 | product-price | - | `getByTestId('product-price') ⚠ matches 9` |
| link | Long Nose Pliers A B C D E Out of stock $14.24 | product-01M3FVQJGR8BEJ2YKBBNS993YY | - | `getByTestId('product-01M3FVQJGR8BEJ2YKBBNS993YY')` |
| heading | Long Nose Pliers | product-name | - | `getByRole('heading', { name: 'Long Nose Pliers', exact: true })` |
| span | Out of stock | out-of-stock | - | `getByTestId('out-of-stock')` |
| span | $14.24 | product-price | - | `getByTestId('product-price') ⚠ matches 9` |
| link | Slip Joint Pliers A B C D E $9.17 | product-01M3FVQJGYBHTFYFS5TGXVNGH0 | - | `getByTestId('product-01M3FVQJGYBHTFYFS5TGXVNGH0')` |
| heading | Slip Joint Pliers | product-name | - | `getByRole('heading', { name: 'Slip Joint Pliers', exact: true })` |
| span | $9.17 | product-price | - | `getByTestId('product-price') ⚠ matches 9` |
| link | Claw Hammer with Shock Reduction Grip A B C D E $13.41 | product-01M3FVQJH1ENAMZYGWMYY5GC4R | - | `getByTestId('product-01M3FVQJH1ENAMZYGWMYY5GC4R')` |
| heading | Claw Hammer with Shock Reduction Grip | product-name | - | `getByRole('heading', { name: 'Claw Hammer with Shock Reduction Grip', exact: true })` |
| span | $13.41 | product-price | - | `getByTestId('product-price') ⚠ matches 9` |
| link | Hammer A B C D E $12.58 | product-01M3FVQJH4C2M0ZRHSQ4EK2BKF | - | `getByTestId('product-01M3FVQJH4C2M0ZRHSQ4EK2BKF')` |
| heading | Hammer | product-name | - | `getByRole('heading', { name: 'Hammer', exact: true })` |
| span | $12.58 | product-price | - | `getByTestId('product-price') ⚠ matches 9` |
| link | Claw Hammer A B C D E $11.48 | product-01M3FVQJH703254T4MM3Q4829K | - | `getByTestId('product-01M3FVQJH703254T4MM3Q4829K')` |
| heading | Claw Hammer | product-name | - | `getByRole('heading', { name: 'Claw Hammer', exact: true })` |
| span | $11.48 | product-price | - | `getByTestId('product-price') ⚠ matches 9` |
| link | Thor Hammer A B C D E $11.14 | product-01M3FVQJH95HMM5PKD9BS7Y5JD | - | `getByTestId('product-01M3FVQJH95HMM5PKD9BS7Y5JD')` |
| heading | Thor Hammer | product-name | - | `getByRole('heading', { name: 'Thor Hammer', exact: true })` |
| span | $11.14 | product-price | - | `getByTestId('product-price') ⚠ matches 9` |
| button | Previous | pagination-prev | - | `getByRole('button', { name: 'Previous', exact: true })` |
| button | Page-1 | - | - | `getByRole('button', { name: 'Page-1', exact: true })` |
| button | Page-2 | - | - | `getByRole('button', { name: 'Page-2', exact: true })` |
| button | Page-3 | - | - | `getByRole('button', { name: 'Page-3', exact: true })` |
| button | Page-4 | - | - | `getByRole('button', { name: 'Page-4', exact: true })` |
| button | Page-5 | - | - | `getByRole('button', { name: 'Page-5', exact: true })` |
| button | Next | pagination-next | - | `getByRole('button', { name: 'Next', exact: true })` |
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
| `getByRole('link').filter({ has: getByTestId('product-name') })` | 9 ⚠ not unique | true | Combination Pliers A B C D E $14.15 |
