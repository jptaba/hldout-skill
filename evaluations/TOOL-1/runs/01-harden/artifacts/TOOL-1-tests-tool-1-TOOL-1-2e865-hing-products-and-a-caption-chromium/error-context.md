# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-1\tests\tool-1.spec.ts >> TOOL-1 Catalogue search, sorting and category filter >> SCN-001: Searching the web shop shows only matching products and a caption
- Location: evaluations\TOOL-1\tests\tool-1.spec.ts:62:3

# Error details

```
Error: [REQ AC-1] only matching products shown

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 7

- Array []
+ Array [
+   "Bolt Cutters",
+   "Claw Hammer with Shock Reduction Grip",
+   "Hammer",
+   "Claw Hammer",
+   "Thor Hammer",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - text: View the
    - link "Documentation" [ref=e4] [cursor=pointer]:
      - /url: https://testsmith-io.github.io/practice-software-testing/#/
    - text: for this application.
  - generic [ref=e5]:
    - generic [ref=e7]:
      - generic [ref=e8]: Practice Black Box Testing & Bug Hunting
      - button "Testing Guide" [ref=e9] [cursor=pointer]
      - button "🐛 Bug Hunting" [ref=e10] [cursor=pointer]
    - navigation [ref=e11]:
      - generic [ref=e12]:
        - link "Practice Software Testing - Toolshop" [ref=e13] [cursor=pointer]:
          - /url: /
        - generic [ref=e32]:
          - menubar "Main menu" [ref=e33]:
            - menuitem [ref=e34]:
              - link "Home" [ref=e35] [cursor=pointer]:
                - /url: /
            - menuitem [ref=e36]:
              - button "Categories" [ref=e37] [cursor=pointer]
            - menuitem [ref=e38]:
              - link "Contact" [ref=e39] [cursor=pointer]:
                - /url: /contact
            - menuitem [ref=e40]:
              - link "Sign in" [ref=e41] [cursor=pointer]:
                - /url: /auth/login
          - button "Select language" [ref=e43] [cursor=pointer]: EN
  - generic [ref=e48]:
    - generic [ref=e49]:
      - paragraph [ref=e50]:
        - img "Banner" [ref=e51]
      - separator [ref=e52]
    - generic [ref=e53]:
      - generic [ref=e54]:
        - heading [level=4] [ref=e55]
        - separator [ref=e59]
        - combobox "sort" [ref=e62]:
          - option [selected]
          - option "Name (A - Z)"
          - option "Name (Z - A)"
          - option "Price (High - Low)"
          - option "Price (Low - High)"
          - option "CO₂ Rating (A - E)"
          - option "CO₂ Rating (E - A)"
        - heading [level=4] [ref=e63]
        - separator [ref=e67]
        - generic "ngx-slider" [ref=e69]:
          - slider "ngx-slider" [ref=e74] [cursor=pointer]
          - slider "ngx-slider-max" [ref=e75] [cursor=pointer]
          - generic [ref=e76]: "0"
          - generic [ref=e77]: "200"
          - generic [ref=e78]: "1"
          - generic [ref=e79]: "100"
        - heading [level=4] [ref=e81]
        - separator [ref=e85]
        - generic [ref=e87]:
          - generic [ref=e88]: Search
          - textbox "Search" [ref=e89]
          - button "X" [ref=e90] [cursor=pointer]
          - button "Search" [active] [ref=e91] [cursor=pointer]
        - heading [level=4] [ref=e92]
        - separator [ref=e96]
        - heading "By category:" [level=4] [ref=e97]
        - group "Categories" [ref=e98]:
          - generic [ref=e100]:
            - generic [ref=e101]:
              - checkbox "Hand Tools" [ref=e102]
              - text: Hand Tools
            - list [ref=e103]:
              - group "Categories" [ref=e104]:
                - generic [ref=e107]:
                  - checkbox "Hammer" [ref=e108]
                  - text: Hammer
                - generic [ref=e110]:
                  - checkbox "Hand Saw" [ref=e111]
                  - text: Hand Saw
                - generic [ref=e113]:
                  - checkbox "Wrench" [ref=e114]
                  - text: Wrench
                - generic [ref=e116]:
                  - checkbox "Screwdriver" [ref=e117]
                  - text: Screwdriver
                - generic [ref=e119]:
                  - checkbox "Pliers" [ref=e120]
                  - text: Pliers
                - generic [ref=e122]:
                  - checkbox "Chisels" [ref=e123]
                  - text: Chisels
                - generic [ref=e125]:
                  - checkbox "Measures" [ref=e126]
                  - text: Measures
          - generic [ref=e127]:
            - generic [ref=e128]:
              - checkbox "Power Tools" [ref=e129]
              - text: Power Tools
            - list [ref=e130]:
              - group "Categories" [ref=e131]:
                - generic [ref=e134]:
                  - checkbox "Grinder" [ref=e135]
                  - text: Grinder
                - generic [ref=e137]:
                  - checkbox "Sander" [ref=e138]
                  - text: Sander
                - generic [ref=e140]:
                  - checkbox "Saw" [ref=e141]
                  - text: Saw
                - generic [ref=e143]:
                  - checkbox "Drill" [ref=e144]
                  - text: Drill
          - generic [ref=e145]:
            - generic [ref=e146]:
              - checkbox "Other" [ref=e147]
              - text: Other
            - list [ref=e148]:
              - group "Categories" [ref=e149]:
                - generic [ref=e152]:
                  - checkbox "Tool Belts" [ref=e153]
                  - text: Tool Belts
                - generic [ref=e155]:
                  - checkbox "Storage Solutions" [ref=e156]
                  - text: Storage Solutions
                - generic [ref=e158]:
                  - checkbox "Workbench" [ref=e159]
                  - text: Workbench
                - generic [ref=e161]:
                  - checkbox "Safety Gear" [ref=e162]
                  - text: Safety Gear
                - generic [ref=e164]:
                  - checkbox "Fasteners" [ref=e165]
                  - text: Fasteners
        - heading "By brand:" [level=4] [ref=e167]
        - group "Brands" [ref=e168]:
          - generic [ref=e171]:
            - checkbox "ForgeFlex Tools" [ref=e172]
            - text: ForgeFlex Tools
          - generic [ref=e174]:
            - checkbox "MightyCraft Hardware" [ref=e175]
            - text: MightyCraft Hardware
          - generic [ref=e177]:
            - checkbox "some name" [ref=e178]
            - text: some name
          - generic [ref=e180]:
            - checkbox "Marca 0da41408" [ref=e181]
            - text: Marca 0da41408
          - generic [ref=e183]:
            - checkbox "Marca f62735af" [ref=e184]
            - text: Marca f62735af
          - generic [ref=e186]:
            - checkbox "Marca Atualizada" [ref=e187]
            - text: Marca Atualizada
          - generic [ref=e189]:
            - checkbox "Marca Teste" [ref=e190]
            - text: Marca Teste
          - generic [ref=e192]:
            - checkbox "some name" [ref=e193]
            - text: some name
          - generic [ref=e195]:
            - checkbox "Marca 8d1726c1" [ref=e196]
            - text: Marca 8d1726c1
          - generic [ref=e198]:
            - checkbox "Marca 41fbfc1a" [ref=e199]
            - text: Marca 41fbfc1a
          - generic [ref=e201]:
            - checkbox "Marca bedf09c1" [ref=e202]
            - text: Marca bedf09c1
          - generic [ref=e204]:
            - checkbox "some name" [ref=e205]
            - text: some name
        - heading "Sustainability:" [level=4] [ref=e207]
        - group "Eco-Friendly Products" [ref=e208]:
          - generic [ref=e211]:
            - checkbox "Show only eco-friendly products" [ref=e212]
            - text: Show only eco-friendly products
      - generic [ref=e213]:
        - 'heading "Searched for: pliers" [level=3] [ref=e214]'
        - paragraph [ref=e215]: 4 products found for 'pliers'
        - generic [ref=e216]:
          - 'link "Combination Pliers Compare Combination Pliers CO₂: A B C D E $14.15" [ref=e217] [cursor=pointer]':
            - /url: /product/01M3FVQJG6E2QF0114BDA47REV
            - generic [ref=e218]:
              - img "Combination Pliers" [ref=e219]
              - button "Compare" [ref=e220]
            - generic [ref=e224]:
              - heading "Combination Pliers" [level=5] [ref=e225]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e226]:
                - text: "CO₂:"
                - generic [ref=e227]: A
                - generic [ref=e228]: B
                - generic [ref=e229]: C
                - generic [ref=e230]: D
                - generic [ref=e231]: E
            - generic [ref=e232]: $14.15
          - 'link "Pliers Compare Pliers CO₂: A B C D E $12.01" [ref=e234] [cursor=pointer]':
            - /url: /product/01M3FVQJGBYFCZNY6D67EHK8Z7
            - generic [ref=e235]:
              - img "Pliers" [ref=e236]
              - button "Compare" [ref=e237]
            - generic [ref=e241]:
              - heading "Pliers" [level=5] [ref=e242]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e243]:
                - text: "CO₂:"
                - generic [ref=e244]: A
                - generic [ref=e245]: B
                - generic [ref=e246]: C
                - generic [ref=e247]: D
                - generic [ref=e248]: E
            - generic [ref=e249]: $12.01
          - 'link "Long Nose Pliers Compare Long Nose Pliers CO₂: A B C D E Out of stock $14.24" [ref=e251] [cursor=pointer]':
            - /url: /product/01M3FVQJGR8BEJ2YKBBNS993YY
            - generic [ref=e252]:
              - img "Long Nose Pliers" [ref=e253]
              - button "Compare" [ref=e254]
            - generic [ref=e258]:
              - heading "Long Nose Pliers" [level=5] [ref=e259]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e260]:
                - text: "CO₂:"
                - generic [ref=e261]: A
                - generic [ref=e262]: B
                - generic [ref=e263]: C
                - generic [ref=e264]: D
                - generic [ref=e265]: E
            - generic [ref=e266]:
              - generic [ref=e267]: Out of stock
              - generic [ref=e268]: $14.24
          - 'link "Slip Joint Pliers Compare Slip Joint Pliers CO₂: A B C D E $9.17" [ref=e269] [cursor=pointer]':
            - /url: /product/01M3FVQJGYBHTFYFS5TGXVNGH0
            - generic [ref=e270]:
              - img "Slip Joint Pliers" [ref=e271]
              - button "Compare" [ref=e272]
            - generic [ref=e276]:
              - heading "Slip Joint Pliers" [level=5] [ref=e277]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e278]:
                - text: "CO₂:"
                - generic [ref=e279]: A
                - generic [ref=e280]: B
                - generic [ref=e281]: C
                - generic [ref=e282]: D
                - generic [ref=e283]: E
            - generic [ref=e284]: $9.17
  - contentinfo [ref=e287]:
    - generic [ref=e289]:
      - generic [ref=e290]: Learn & Explore
      - generic [ref=e291]:
        - link "Learn Test Automation Hands-on courses for Playwright, Robot Framework, APIs and more" [ref=e293] [cursor=pointer]:
          - /url: https://onlinecourses.testsmith.io
          - generic [ref=e296]:
            - generic [ref=e297]: Learn Test Automation
            - text: Hands-on courses for Playwright, Robot Framework, APIs and more
        - link "API Spector Open-source API testing, mocking and contract testing" [ref=e299] [cursor=pointer]:
          - /url: https://api-spector.dev
          - generic [ref=e302]:
            - generic [ref=e303]: API Spector
            - text: Open-source API testing, mocking and contract testing
        - link "GitHub Source code, issues and contributions" [ref=e305] [cursor=pointer]:
          - /url: https://github.com/testsmith-io/practice-software-testing
          - generic [ref=e308]:
            - generic [ref=e309]: GitHub
            - text: Source code, issues and contributions
    - generic [ref=e310]:
      - generic [ref=e311]:
        - text: This is a DEMO application, used for software testing training purpose. |
        - link "Privacy Policy" [ref=e312] [cursor=pointer]:
          - /url: /privacy
        - text: "| Banner photo by"
        - link "Barn Images" [ref=e313] [cursor=pointer]:
          - /url: https://unsplash.com/@barnimages
        - text: "on"
        - link "Unsplash" [ref=e314] [cursor=pointer]:
          - /url: https://unsplash.com/photos/t5YUoHW6zRo
        - text: .
      - generic [ref=e315]: v2.5 | Built 2026-09-09 | Angular 20.0.5
  - button "Open chat" [ref=e317] [cursor=pointer]
  - button "Show live shop activity" [ref=e321] [cursor=pointer]
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
  28  | const cards = (page: Page) => page.getByTestId(/^product-/);
  29  | async function search(page: Page, term: string) {
  30  |   await page.getByTestId('search-query').fill(term);
  31  |   await page.getByTestId('search-submit').click();
  32  |   await expect(page.getByTestId('search-caption')).toBeVisible();
  33  | }
  34  | async function shownNames(page: Page): Promise<string[]> {
  35  |   await expect(cards(page).first()).toBeVisible();
  36  |   return page.getByTestId('product-name').allInnerTexts().then((xs) => xs.map((x) => x.trim()));
  37  | }
  38  | async function shownPrices(page: Page): Promise<number[]> {
  39  |   await expect(cards(page).first()).toBeVisible();
  40  |   return page.getByTestId('product-price').allInnerTexts().then((xs) => xs.map((x) => Number(x.replace(/[^0-9.]/g, ''))));
  41  | }
  42  | const ascending = (xs: number[]) => xs.every((x, i) => i === 0 || xs[i - 1] <= x);
  43  | async function categoryId(seed: Seed, api: Api, name: string): Promise<string> {
  44  |   return seed.step(`look up the id of category "${name}"`, async () => {
  45  |     const r = await api.get<Category[]>(EP.categories);
  46  |     expect(r.status, 'categories tree (pre-step)').toBe(REQ.STATUS.OK);
  47  |     const walk = (cs: Category[]): Category | undefined => cs.map((c) => (c.name === name ? c : walk(c.sub_categories ?? []))).find(Boolean);
  48  |     const hit = walk(r.body);
  49  |     expect(hit, `category "${name}" exists (pre-step)`).toBeTruthy();
  50  |     return hit!.id;
  51  |   });
  52  | }
  53  | /** All products of a listing (every page). */
  54  | async function allPages(api: Api, params: Record<string, string>): Promise<Product[]> {
  55  |   const first = await api.get<Page_>(EP.products, { params: { ...params, page: 1 } });
  56  |   const out = [...first.body.data];
  57  |   for (let p = 2; p <= first.body.last_page; p++) out.push(...(await api.get<Page_>(EP.products, { params: { ...params, page: p } })).body.data);
  58  |   return out;
  59  | }
  60  | 
  61  | test.describe('TOOL-1 Catalogue search, sorting and category filter', () => {
  62  |   test('SCN-001: Searching the web shop shows only matching products and a caption', { tag: ['@AC-1', '@type:functional', '@layer:ui'] }, async ({ page, journey }) => {
  63  |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); });
  64  |     await journey.step('When I search for "pliers"', async () => { await search(page, REQ.TERM); });
  65  |     await journey.step('Then every product shown has "pliers" in its name', async () => {
  66  |       const names = await shownNames(page);
> 67  |       expect(names.filter((n) => !n.toLowerCase().includes(REQ.TERM)), '[REQ AC-1] only matching products shown').toEqual([]);
      |                                                                                                                   ^ Error: [REQ AC-1] only matching products shown
  68  |     });
  69  |     await journey.step('And the caption reads "Searched for: pliers"', async () => {
  70  |       await expect(page.getByTestId('search-title'), '[REQ AC-1] search caption').toHaveText(REQ.CAPTION);
  71  |     });
  72  |   });
  73  | 
  74  |   test('SCN-002: The search API returns only matching products', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
  75  |     let r!: ApiResponse<Page_>;
  76  |     await journey.step('When I GET /products/search?q=pliers', async () => { r = await api.get(EP.search, { params: { q: REQ.TERM } }); });
  77  |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-2] search → 200').toBe(REQ.STATUS.OK); });
  78  |     await journey.step('And every product in data has "pliers" in its name', async () => {
  79  |       expect(r.body.data.length, 'the sample term finds products').toBeGreaterThan(0);
  80  |       expect(r.body.data.map((p) => p.name).filter((n) => !n.toLowerCase().includes(REQ.TERM)), '[REQ AC-2] only matching products').toEqual([]);
  81  |     });
  82  |   });
  83  | 
  84  |   test('SCN-003: The search API ignores letter case', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
  85  |     let upper: string[] = []; let lower: string[] = [];
  86  |     await journey.step('When I GET /products/search with q=PLIERS and with q=pliers', async () => {
  87  |       upper = (await api.get<Page_>(EP.search, { params: { q: REQ.TERM.toUpperCase() } })).body.data.map((p) => p.id).sort();
  88  |       lower = (await api.get<Page_>(EP.search, { params: { q: REQ.TERM } })).body.data.map((p) => p.id).sort();
  89  |     });
  90  |     await journey.step('Then both return the same products', async () => { expect(upper, '[REQ AC-2] case-insensitive search').toEqual(lower); });
  91  |   });
  92  | 
  93  |   test('SCN-004: A search without matches says so on the web shop and in the API', { tag: ['@AC-3', '@type:negative', '@layer:e2e'] }, async ({ page, api, journey }) => {
  94  |     const term = `zzq${Date.now().toString(36)}`;
  95  |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); });
  96  |     await journey.step('When I search for a term that matches nothing', async () => { await search(page, term); });
  97  |     await journey.step('Then the web shop shows "There are no products found."', async () => {
  98  |       await expect(page.getByTestId('no-results'), '[REQ AC-3] no-results message').toHaveText(REQ.NO_RESULTS);
  99  |     });
  100 |     await journey.step('And GET /products/search for that term returns 200 with an empty data list and total 0', async () => {
  101 |       const r = await api.get<Page_>(EP.search, { params: { q: term } });
  102 |       expect(r.status, '[REQ AC-3] no-match search → 200').toBe(REQ.STATUS.OK);
  103 |       expect({ data: r.body.data, total: r.body.total }, '[REQ AC-3] empty result').toEqual({ data: [], total: 0 });
  104 |     });
  105 |   });
  106 | 
  107 |   test('SCN-005: Sorting by price, low to high', { tag: ['@AC-4', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey }) => {
  108 |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
  109 |     await journey.step('When I choose "Price (Low - High)"', async () => {
  110 |       const before = await page.getByTestId('product-name').allInnerTexts();
  111 |       await page.getByTestId('sort').selectOption({ label: REQ.SORT_LABEL });
  112 |       await expect.poll(async () => (await page.getByTestId('product-name').allInnerTexts()).join('|')).not.toBe(before.join('|'));
  113 |     });
  114 |     await journey.step('Then the prices shown are in ascending order', async () => {
  115 |       const prices = await shownPrices(page);
  116 |       expect(ascending(prices), `[REQ AC-4] web shop prices ascending: ${prices.join(', ')}`).toBe(true);
  117 |     });
  118 |     await journey.step('And GET /products?sort=price,asc returns prices in ascending order', async () => {
  119 |       const prices = (await api.get<Page_>(EP.products, { params: { sort: 'price,asc' } })).body.data.map((p) => Number(p.price));
  120 |       expect(ascending(prices), `[REQ AC-4] API prices ascending: ${prices.join(', ')}`).toBe(true);
  121 |     });
  122 |   });
  123 | 
  124 |   test('SCN-006: Filtering by the category "Hammer"', { tag: ['@AC-5', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey, seed }) => {
  125 |     let id = ''; let hammers: Product[] = [];
  126 |     await journey.step('Given I know the id of the category "Hammer"', async () => {
  127 |       id = await categoryId(seed, api, REQ.CATEGORY);
  128 |       hammers = await seed.step('list the products of the category (all pages)', () => allPages(api, { by_category: id }));
  129 |     });
  130 |     await journey.step('And I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
  131 |     await journey.step('When I tick the category "Hammer"', async () => {
  132 |       const before = await page.getByTestId('product-name').allInnerTexts();
  133 |       await page.getByRole('checkbox', { name: REQ.CATEGORY, exact: true }).check();
  134 |       await expect.poll(async () => (await page.getByTestId('product-name').allInnerTexts()).join('|')).not.toBe(before.join('|'));
  135 |     });
  136 |     await journey.step('Then every product shown is a Hammer product', async () => {
  137 |       const allowed = new Set(hammers.map((p) => p.name));
  138 |       const names = await shownNames(page);
  139 |       expect(names.filter((n) => !allowed.has(n)), '[REQ AC-5] web shop shows only hammers').toEqual([]);
  140 |     });
  141 |     await journey.step('And GET /products?by_category=<Hammer id> returns only products in the category Hammer', async () => {
  142 |       expect(hammers.length, 'the category has products').toBeGreaterThan(0);
  143 |       expect(hammers.filter((p) => p.category?.name !== REQ.CATEGORY).map((p) => `${p.name} (${p.category?.name})`), '[REQ AC-5] API returns only Hammer products').toEqual([]);
  144 |     });
  145 |   });
  146 | 
  147 |   test('SCN-007: Pages hold 12 products', { tag: ['@AC-6', '@type:boundary', '@layer:e2e'] }, async ({ page, api, journey }) => {
  148 |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
  149 |     await journey.step('Then the first page shows 12 products', async () => { await expect.soft(cards(page), '[REQ AC-6] 12 products per page on the web shop').toHaveCount(REQ.PER_PAGE); });
  150 |     await journey.step('And GET /products reports per_page 12', async () => {
  151 |       expect.soft((await api.get<Page_>(EP.products)).body.per_page, '[REQ AC-6] API per_page').toBe(REQ.PER_PAGE);
  152 |     });
  153 |   });
  154 | 
  155 |   test('SCN-008: An empty search returns all products', { tag: ['@AC-7', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
  156 |     let empty!: ApiResponse<Page_>;
  157 |     await journey.step('When I GET /products/search with an empty q', async () => { empty = await api.get(EP.search, { params: { q: '' } }); });
  158 |     await journey.step('Then its total equals the total of GET /products', async () => {
  159 |       const all = (await api.get<Page_>(EP.products)).body.total;
  160 |       expect(empty.body.total, `[REQ AC-7] empty search returns all ${all} products`).toBe(all);
  161 |     });
  162 |   });
  163 | });
  164 | 
```