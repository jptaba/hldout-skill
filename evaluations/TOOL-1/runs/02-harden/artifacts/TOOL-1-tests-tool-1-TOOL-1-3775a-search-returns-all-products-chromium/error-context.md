# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-1\tests\tool-1.spec.ts >> TOOL-1 Catalogue search, sorting and category filter >> SCN-008: An empty search returns all products
- Location: evaluations\TOOL-1\tests\tool-1.spec.ts:160:3

# Error details

```
Error: [REQ AC-7] empty search returns all 50 products

expect(received).toBe(expected) // Object.is equality

Expected: 50
Received: 0
```

# Test source

```ts
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
  75  |       await expect(page.getByTestId('search-title'), '[REQ AC-1] search caption').toHaveText(REQ.CAPTION);
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
> 165 |       expect(empty.body.total, `[REQ AC-7] empty search returns all ${all} products`).toBe(all);
      |                                                                                       ^ Error: [REQ AC-7] empty search returns all 50 products
  166 |     });
  167 |   });
  168 | });
  169 | 
```