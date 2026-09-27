# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-1\tests\tool-1.spec.ts >> TOOL-1 Catalogue search, sorting and category filter >> SCN-008: An empty search returns all products
- Location: evaluations\TOOL-1\tests\tool-1.spec.ts:155:3

# Error details

```
Error: [REQ AC-7] empty search returns all 50 products

expect(received).toBe(expected) // Object.is equality

Expected: 50
Received: 0
```

# Test source

```ts
  60  | 
  61  | test.describe('TOOL-1 Catalogue search, sorting and category filter', () => {
  62  |   test('SCN-001: Searching the web shop shows only matching products and a caption', { tag: ['@AC-1', '@type:functional', '@layer:ui'] }, async ({ page, journey }) => {
  63  |     await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); });
  64  |     await journey.step('When I search for "pliers"', async () => { await search(page, REQ.TERM); });
  65  |     await journey.step('Then every product shown has "pliers" in its name', async () => {
  66  |       const names = await shownNames(page);
  67  |       expect(names.filter((n) => !n.toLowerCase().includes(REQ.TERM)), '[REQ AC-1] only matching products shown').toEqual([]);
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
> 160 |       expect(empty.body.total, `[REQ AC-7] empty search returns all ${all} products`).toBe(all);
      |                                                                                       ^ Error: [REQ AC-7] empty search returns all 50 products
  161 |     });
  162 |   });
  163 | });
  164 | 
```