# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-1\tests\tool-1.spec.ts >> TOOL-1 Catalogue search, sorting and category filter >> SCN-001: Searching the web shop shows only matching products and a caption
- Location: evaluations\TOOL-1\tests\tool-1.spec.ts:67:3

# Error details

```
Error: [REQ AC-1] search caption

expect(locator).toHaveText(expected) failed

Locator: getByTestId('search-title')
Expected: "Searched for: pliers"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - [REQ AC-1] search caption getByTestId('search-title') with timeout 5000ms
  - waiting for getByTestId('search-title')

```

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
  - checkbox "some name"
  - text: some name
  - checkbox "Marca 0da41408"
  - text: Marca 0da41408
  - checkbox "Marca f62735af"
  - text: Marca f62735af
  - checkbox "Marca Atualizada"
  - text: Marca Atualizada
  - checkbox "Marca Teste"
  - text: Marca Teste
  - checkbox "some name"
  - text: some name
  - checkbox "Marca 8d1726c1"
  - text: Marca 8d1726c1
  - checkbox "Marca 41fbfc1a"
  - text: Marca 41fbfc1a
  - checkbox "Marca bedf09c1"
  - text: Marca bedf09c1
  - checkbox "some name"
  - text: some name
  - checkbox "some name"
  - text: some name
  - checkbox "Marca-4fd90912"
  - text: Marca-4fd90912
  - checkbox "Marca-caebf1a4"
  - text: Marca-caebf1a4
  - checkbox "MarcaAtualizada-aca3d45a"
  - text: MarcaAtualizada-aca3d45a
  - checkbox "some name"
  - text: some name
  - checkbox "Marca-9ba90354"
  - text: Marca-9ba90354
  - checkbox "Marca-c33ea16b"
  - text: Marca-c33ea16b
  - checkbox "MarcaAtualizada-d15011f6"
  - text: MarcaAtualizada-d15011f6
- heading "Sustainability:" [level=4]
- group "Eco-Friendly Products":
  - text: Eco-Friendly Products
  - checkbox "Show only eco-friendly products"
  - text: Show only eco-friendly products
- 'heading "Searched for: pliers" [level=3]'
- paragraph: 4 products found for 'pliers'
- 'link "Combination Pliers Compare Combination Pliers CO₂: A B C D E $14.15"':
  - /url: /product/01M3FVQJG6E2QF0114BDA47REV
  - img "Combination Pliers"
  - button "Compare"
  - heading "Combination Pliers" [level=5]
  - text: "CO₂: A B C D E $14.15"
- 'link "Pliers Compare Pliers CO₂: A B C D E $12.01"':
  - /url: /product/01M3FVQJGBYFCZNY6D67EHK8Z7
  - img "Pliers"
  - button "Compare"
  - heading "Pliers" [level=5]
  - text: "CO₂: A B C D E $12.01"
- 'link "Long Nose Pliers Compare Long Nose Pliers CO₂: A B C D E Out of stock $14.24"':
  - /url: /product/01M3FVQJGR8BEJ2YKBBNS993YY
  - img "Long Nose Pliers"
  - button "Compare"
  - heading "Long Nose Pliers" [level=5]
  - text: "CO₂: A B C D E Out of stock $14.24"
- 'link "Slip Joint Pliers Compare Slip Joint Pliers CO₂: A B C D E $9.17"':
  - /url: /product/01M3FVQJGYBHTFYFS5TGXVNGH0
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
  - text: . v2.5 | Built 2026-09-09 | Angular 20.0.5
- button "Open chat":
  - img
- button "Show live shop activity"
```

# Test source

```ts
  1   | /**
  2   |  * Held-out acceptance tests for TOOL-1 — "Catalogue search, sorting and category filter".
  3   |  * Written from evaluations/TOOL-1/scenarios.feature (requirement + attachments only; never from the AUT's code).
  4   |  */
  5   | import { test, expect, gotoPage, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';
  6   | import type { Page } from '@playwright/test';
  7   | 
  8   | // @req-constants-start — expected outcomes copied verbatim from TOOL-1 (never edit during hardening)
  9   | const REQ = {
  10  |   STATUS: { OK: 200 },
  11  |   TERM: 'pliers',
  12  |   CAPTION: 'Searched for: pliers',
  13  |   NO_RESULTS: 'There are no products found.',
  14  |   SORT_LABEL: 'Price (Low - High)',
  15  |   CATEGORY: 'Hammer',
  16  |   PER_PAGE: 12,
  17  | } as const;
  18  | // @req-constants-end
  19  | 
  20  | // Endpoints exactly as declared in the requirement.
  21  | const EP = { products: '/products', search: '/products/search', categories: '/categories/tree' };
  22  | 
  23  | interface Product { id: string; name: string; price: number; category?: { name: string } }
  24  | interface Page_ { data: Product[]; total: number; per_page: number; last_page: number }
  25  | interface Category { id: string; name: string; sub_categories?: Category[] }
  26  | 
  27  | // ---- mechanics ------------------------------------------------------------------------------------
  28  | // hardened: product cards are links that contain a product name (getByTestId(/^product-/) also matched product-name/-price).
  29  | const cards = (page: Page) => page.getByRole('link').filter({ has: page.getByTestId('product-name') });
  30  | async function search(page: Page, term: string) {
  31  |   // hardened: results re-render after the caption appears — wait until the list differs from the unfiltered one.
  32  |   await expect(cards(page).first()).toBeVisible();
  33  |   const before = (await page.getByTestId('product-name').allInnerTexts()).join('|');
  34  |   await page.getByTestId('search-query').fill(term);
  35  |   await page.getByTestId('search-submit').click();
  36  |   await expect(page.getByTestId('search-caption')).toBeVisible();
  37  |   await expect.poll(async () => (await page.getByTestId('product-name').allInnerTexts()).join('|'), { timeout: 10_000 }).not.toBe(before);
  38  | }
  39  | async function shownNames(page: Page): Promise<string[]> {
  40  |   await expect(cards(page).first()).toBeVisible();
  41  |   return page.getByTestId('product-name').allInnerTexts().then((xs) => xs.map((x) => x.trim()));
  42  | }
  43  | async function shownPrices(page: Page): Promise<number[]> {
  44  |   await expect(cards(page).first()).toBeVisible();
  45  |   return page.getByTestId('product-price').allInnerTexts().then((xs) => xs.map((x) => Number(x.replace(/[^0-9.]/g, ''))));
  46  | }
  47  | const ascending = (xs: number[]) => xs.every((x, i) => i === 0 || xs[i - 1] <= x);
  48  | async function categoryId(seed: Seed, api: Api, name: string): Promise<string> {
  49  |   return seed.step(`look up the id of category "${name}"`, async () => {
  50  |     const r = await api.get<Category[]>(EP.categories);
  51  |     expect(r.status, 'categories tree (pre-step)').toBe(REQ.STATUS.OK);
  52  |     const walk = (cs: Category[]): Category | undefined => cs.map((c) => (c.name === name ? c : walk(c.sub_categories ?? []))).find(Boolean);
  53  |     const hit = walk(r.body);
  54  |     expect(hit, `category "${name}" exists (pre-step)`).toBeTruthy();
  55  |     return hit!.id;
  56  |   });
  57  | }
  58  | /** All products of a listing (every page). */
  59  | async function allPages(api: Api, params: Record<string, string>): Promise<Product[]> {
  60  |   const first = await api.get<Page_>(EP.products, { params: { ...params, page: 1 } });
  61  |   const out = [...first.body.data];
  62  |   for (let p = 2; p <= first.body.last_page; p++) out.push(...(await api.get<Page_>(EP.products, { params: { ...params, page: p } })).body.data);
  63  |   return out;
  64  | }
  65  | 
  66  | test.describe('TOOL-1 Catalogue search, sorting and category filter', () => {
  67  |   test('SCN-001: Searching the web shop shows only matching products and a caption', { tag: ['@AC-1', '@type:functional', '@layer:ui'] }, async ({ page, journey }) => {
  68  |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); });
  69  |     await journey.step('When I search for "pliers"', async () => { await search(page, REQ.TERM); });
  70  |     await journey.step('Then every product shown has "pliers" in its name', async () => {
  71  |       const names = await shownNames(page);
  72  |       expect(names.filter((n) => !n.toLowerCase().includes(REQ.TERM)), '[REQ AC-1] only matching products shown').toEqual([]);
  73  |     });
  74  |     await journey.step('And the caption reads "Searched for: pliers"', async () => {
> 75  |       await expect(page.getByTestId('search-title'), '[REQ AC-1] search caption').toHaveText(REQ.CAPTION);
      |                                                                                   ^ Error: [REQ AC-1] search caption
  76  |     });
  77  |   });
  78  | 
  79  |   test('SCN-002: The search API returns only matching products', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
  80  |     let r!: ApiResponse<Page_>;
  81  |     await journey.step('When I GET /products/search?q=pliers', async () => { r = await api.get(EP.search, { params: { q: REQ.TERM } }); });
  82  |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-2] search → 200').toBe(REQ.STATUS.OK); });
  83  |     await journey.step('And every product in data has "pliers" in its name', async () => {
  84  |       expect(r.body.data.length, 'the sample term finds products').toBeGreaterThan(0);
  85  |       expect(r.body.data.map((p) => p.name).filter((n) => !n.toLowerCase().includes(REQ.TERM)), '[REQ AC-2] only matching products').toEqual([]);
  86  |     });
  87  |   });
  88  | 
  89  |   test('SCN-003: The search API ignores letter case', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
  90  |     let upper: string[] = []; let lower: string[] = [];
  91  |     await journey.step('When I GET /products/search with q=PLIERS and with q=pliers', async () => {
  92  |       upper = (await api.get<Page_>(EP.search, { params: { q: REQ.TERM.toUpperCase() } })).body.data.map((p) => p.id).sort();
  93  |       lower = (await api.get<Page_>(EP.search, { params: { q: REQ.TERM } })).body.data.map((p) => p.id).sort();
  94  |     });
  95  |     await journey.step('Then both return the same products', async () => { expect(upper, '[REQ AC-2] case-insensitive search').toEqual(lower); });
  96  |   });
  97  | 
  98  |   test('SCN-004: A search without matches says so on the web shop and in the API', { tag: ['@AC-3', '@type:negative', '@layer:e2e'] }, async ({ page, api, journey }) => {
  99  |     const term = `zzq${Date.now().toString(36)}`;
  100 |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); });
  101 |     await journey.step('When I search for a term that matches nothing', async () => { await search(page, term); });
  102 |     await journey.step('Then the web shop shows "There are no products found."', async () => {
  103 |       await expect(page.getByTestId('no-results'), '[REQ AC-3] no-results message').toHaveText(REQ.NO_RESULTS);
  104 |     });
  105 |     await journey.step('And GET /products/search for that term returns 200 with an empty data list and total 0', async () => {
  106 |       const r = await api.get<Page_>(EP.search, { params: { q: term } });
  107 |       expect(r.status, '[REQ AC-3] no-match search → 200').toBe(REQ.STATUS.OK);
  108 |       expect({ data: r.body.data, total: r.body.total }, '[REQ AC-3] empty result').toEqual({ data: [], total: 0 });
  109 |     });
  110 |   });
  111 | 
  112 |   test('SCN-005: Sorting by price, low to high', { tag: ['@AC-4', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey }) => {
  113 |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
  114 |     await journey.step('When I choose "Price (Low - High)"', async () => {
  115 |       const before = await page.getByTestId('product-name').allInnerTexts();
  116 |       await page.getByTestId('sort').selectOption({ label: REQ.SORT_LABEL });
  117 |       await expect.poll(async () => (await page.getByTestId('product-name').allInnerTexts()).join('|')).not.toBe(before.join('|'));
  118 |     });
  119 |     await journey.step('Then the prices shown are in ascending order', async () => {
  120 |       const prices = await shownPrices(page);
  121 |       expect(ascending(prices), `[REQ AC-4] web shop prices ascending: ${prices.join(', ')}`).toBe(true);
  122 |     });
  123 |     await journey.step('And GET /products?sort=price,asc returns prices in ascending order', async () => {
  124 |       const prices = (await api.get<Page_>(EP.products, { params: { sort: 'price,asc' } })).body.data.map((p) => Number(p.price));
  125 |       expect(ascending(prices), `[REQ AC-4] API prices ascending: ${prices.join(', ')}`).toBe(true);
  126 |     });
  127 |   });
  128 | 
  129 |   test('SCN-006: Filtering by the category "Hammer"', { tag: ['@AC-5', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey, seed }) => {
  130 |     let id = ''; let hammers: Product[] = [];
  131 |     await journey.step('Given I know the id of the category "Hammer"', async () => {
  132 |       id = await categoryId(seed, api, REQ.CATEGORY);
  133 |       hammers = await seed.step('list the products of the category (all pages)', () => allPages(api, { by_category: id }));
  134 |     });
  135 |     await journey.step('And I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
  136 |     await journey.step('When I tick the category "Hammer"', async () => {
  137 |       const before = await page.getByTestId('product-name').allInnerTexts();
  138 |       await page.getByRole('checkbox', { name: REQ.CATEGORY, exact: true }).check();
  139 |       await expect.poll(async () => (await page.getByTestId('product-name').allInnerTexts()).join('|')).not.toBe(before.join('|'));
  140 |     });
  141 |     await journey.step('Then every product shown is a Hammer product', async () => {
  142 |       const allowed = new Set(hammers.map((p) => p.name));
  143 |       const names = await shownNames(page);
  144 |       expect(names.filter((n) => !allowed.has(n)), '[REQ AC-5] web shop shows only hammers').toEqual([]);
  145 |     });
  146 |     await journey.step('And GET /products?by_category=<Hammer id> returns only products in the category Hammer', async () => {
  147 |       expect(hammers.length, 'the category has products').toBeGreaterThan(0);
  148 |       expect(hammers.filter((p) => p.category?.name !== REQ.CATEGORY).map((p) => `${p.name} (${p.category?.name})`), '[REQ AC-5] API returns only Hammer products').toEqual([]);
  149 |     });
  150 |   });
  151 | 
  152 |   test('SCN-007: Pages hold 12 products', { tag: ['@AC-6', '@type:boundary', '@layer:e2e'] }, async ({ page, api, journey }) => {
  153 |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
  154 |     await journey.step('Then the first page shows 12 products', async () => { await expect.soft(cards(page), '[REQ AC-6] 12 products per page on the web shop').toHaveCount(REQ.PER_PAGE); });
  155 |     await journey.step('And GET /products reports per_page 12', async () => {
  156 |       expect.soft((await api.get<Page_>(EP.products)).body.per_page, '[REQ AC-6] API per_page').toBe(REQ.PER_PAGE);
  157 |     });
  158 |   });
  159 | 
  160 |   test('SCN-008: An empty search returns all products', { tag: ['@AC-7', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
  161 |     let empty!: ApiResponse<Page_>;
  162 |     await journey.step('When I GET /products/search with an empty q', async () => { empty = await api.get(EP.search, { params: { q: '' } }); });
  163 |     await journey.step('Then its total equals the total of GET /products', async () => {
  164 |       const all = (await api.get<Page_>(EP.products)).body.total;
  165 |       expect(empty.body.total, `[REQ AC-7] empty search returns all ${all} products`).toBe(all);
  166 |     });
  167 |   });
  168 | });
  169 | 
```