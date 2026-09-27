# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-1\tests\tool-1.spec.ts >> TOOL-1 Catalogue search, sorting and category filter >> SCN-008: An empty search returns all products
- Location: evaluations\TOOL-1\tests\tool-1.spec.ts:161:3

# Error details

```
Error: [REQ AC-7] empty search returns all 50 products

expect(received).toBe(expected) // Object.is equality

Expected: 50
Received: 0
```

# Test source

```ts
  66  | test.describe('TOOL-1 Catalogue search, sorting and category filter', () => {
  67  |   test('SCN-001: Searching the web shop shows only matching products and a caption', { tag: ['@AC-1', '@type:functional', '@layer:ui'] }, async ({ page, journey }) => {
  68  |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); });
  69  |     await journey.step('When I search for "pliers"', async () => { await search(page, REQ.TERM); });
  70  |     await journey.step('Then every product shown has "pliers" in its name', async () => {
  71  |       const names = await shownNames(page);
  72  |       expect(names.filter((n) => !n.toLowerCase().includes(REQ.TERM)), '[REQ AC-1] only matching products shown').toEqual([]);
  73  |     });
  74  |     await journey.step('And the caption reads "Searched for: pliers"', async () => {
  75  |       // Repaired (triage 03-eval, SCRIPT_DEFECT): the caption's test id is search-caption, not search-title.
  76  |       await expect(page.getByTestId('search-caption'), '[REQ AC-1] search caption').toHaveText(REQ.CAPTION);
  77  |     });
  78  |   });
  79  | 
  80  |   test('SCN-002: The search API returns only matching products', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
  81  |     let r!: ApiResponse<Page_>;
  82  |     await journey.step('When I GET /products/search?q=pliers', async () => { r = await api.get(EP.search, { params: { q: REQ.TERM } }); });
  83  |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-2] search → 200').toBe(REQ.STATUS.OK); });
  84  |     await journey.step('And every product in data has "pliers" in its name', async () => {
  85  |       expect(r.body.data.length, 'the sample term finds products').toBeGreaterThan(0);
  86  |       expect(r.body.data.map((p) => p.name).filter((n) => !n.toLowerCase().includes(REQ.TERM)), '[REQ AC-2] only matching products').toEqual([]);
  87  |     });
  88  |   });
  89  | 
  90  |   test('SCN-003: The search API ignores letter case', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
  91  |     let upper: string[] = []; let lower: string[] = [];
  92  |     await journey.step('When I GET /products/search with q=PLIERS and with q=pliers', async () => {
  93  |       upper = (await api.get<Page_>(EP.search, { params: { q: REQ.TERM.toUpperCase() } })).body.data.map((p) => p.id).sort();
  94  |       lower = (await api.get<Page_>(EP.search, { params: { q: REQ.TERM } })).body.data.map((p) => p.id).sort();
  95  |     });
  96  |     await journey.step('Then both return the same products', async () => { expect(upper, '[REQ AC-2] case-insensitive search').toEqual(lower); });
  97  |   });
  98  | 
  99  |   test('SCN-004: A search without matches says so on the web shop and in the API', { tag: ['@AC-3', '@type:negative', '@layer:e2e'] }, async ({ page, api, journey }) => {
  100 |     const term = `zzq${Date.now().toString(36)}`;
  101 |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); });
  102 |     await journey.step('When I search for a term that matches nothing', async () => { await search(page, term); });
  103 |     await journey.step('Then the web shop shows "There are no products found."', async () => {
  104 |       await expect(page.getByTestId('no-results'), '[REQ AC-3] no-results message').toHaveText(REQ.NO_RESULTS);
  105 |     });
  106 |     await journey.step('And GET /products/search for that term returns 200 with an empty data list and total 0', async () => {
  107 |       const r = await api.get<Page_>(EP.search, { params: { q: term } });
  108 |       expect(r.status, '[REQ AC-3] no-match search → 200').toBe(REQ.STATUS.OK);
  109 |       expect({ data: r.body.data, total: r.body.total }, '[REQ AC-3] empty result').toEqual({ data: [], total: 0 });
  110 |     });
  111 |   });
  112 | 
  113 |   test('SCN-005: Sorting by price, low to high', { tag: ['@AC-4', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey }) => {
  114 |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
  115 |     await journey.step('When I choose "Price (Low - High)"', async () => {
  116 |       const before = await page.getByTestId('product-name').allInnerTexts();
  117 |       await page.getByTestId('sort').selectOption({ label: REQ.SORT_LABEL });
  118 |       await expect.poll(async () => (await page.getByTestId('product-name').allInnerTexts()).join('|')).not.toBe(before.join('|'));
  119 |     });
  120 |     await journey.step('Then the prices shown are in ascending order', async () => {
  121 |       const prices = await shownPrices(page);
  122 |       expect(ascending(prices), `[REQ AC-4] web shop prices ascending: ${prices.join(', ')}`).toBe(true);
  123 |     });
  124 |     await journey.step('And GET /products?sort=price,asc returns prices in ascending order', async () => {
  125 |       const prices = (await api.get<Page_>(EP.products, { params: { sort: 'price,asc' } })).body.data.map((p) => Number(p.price));
  126 |       expect(ascending(prices), `[REQ AC-4] API prices ascending: ${prices.join(', ')}`).toBe(true);
  127 |     });
  128 |   });
  129 | 
  130 |   test('SCN-006: Filtering by the category "Hammer"', { tag: ['@AC-5', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey, seed }) => {
  131 |     let id = ''; let hammers: Product[] = [];
  132 |     await journey.step('Given I know the id of the category "Hammer"', async () => {
  133 |       id = await categoryId(seed, api, REQ.CATEGORY);
  134 |       hammers = await seed.step('list the products of the category (all pages)', () => allPages(api, { by_category: id }));
  135 |     });
  136 |     await journey.step('And I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
  137 |     await journey.step('When I tick the category "Hammer"', async () => {
  138 |       const before = await page.getByTestId('product-name').allInnerTexts();
  139 |       await page.getByRole('checkbox', { name: REQ.CATEGORY, exact: true }).check();
  140 |       await expect.poll(async () => (await page.getByTestId('product-name').allInnerTexts()).join('|')).not.toBe(before.join('|'));
  141 |     });
  142 |     await journey.step('Then every product shown is a Hammer product', async () => {
  143 |       const allowed = new Set(hammers.map((p) => p.name));
  144 |       const names = await shownNames(page);
  145 |       expect(names.filter((n) => !allowed.has(n)), '[REQ AC-5] web shop shows only hammers').toEqual([]);
  146 |     });
  147 |     await journey.step('And GET /products?by_category=<Hammer id> returns only products in the category Hammer', async () => {
  148 |       expect(hammers.length, 'the category has products').toBeGreaterThan(0);
  149 |       expect(hammers.filter((p) => p.category?.name !== REQ.CATEGORY).map((p) => `${p.name} (${p.category?.name})`), '[REQ AC-5] API returns only Hammer products').toEqual([]);
  150 |     });
  151 |   });
  152 | 
  153 |   test('SCN-007: Pages hold 12 products', { tag: ['@AC-6', '@type:boundary', '@layer:e2e'] }, async ({ page, api, journey }) => {
  154 |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
  155 |     await journey.step('Then the first page shows 12 products', async () => { await expect.soft(cards(page), '[REQ AC-6] 12 products per page on the web shop').toHaveCount(REQ.PER_PAGE); });
  156 |     await journey.step('And GET /products reports per_page 12', async () => {
  157 |       expect.soft((await api.get<Page_>(EP.products)).body.per_page, '[REQ AC-6] API per_page').toBe(REQ.PER_PAGE);
  158 |     });
  159 |   });
  160 | 
  161 |   test('SCN-008: An empty search returns all products', { tag: ['@AC-7', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
  162 |     let empty!: ApiResponse<Page_>;
  163 |     await journey.step('When I GET /products/search with an empty q', async () => { empty = await api.get(EP.search, { params: { q: '' } }); });
  164 |     await journey.step('Then its total equals the total of GET /products', async () => {
  165 |       const all = (await api.get<Page_>(EP.products)).body.total;
> 166 |       expect(empty.body.total, `[REQ AC-7] empty search returns all ${all} products`).toBe(all);
      |                                                                                       ^ Error: [REQ AC-7] empty search returns all 50 products
  167 |     });
  168 |   });
  169 | });
  170 | 
```