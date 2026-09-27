# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-1\tests\tool-1.spec.ts >> TOOL-1 Catalogue search, sorting and category filter >> SCN-007: Pages hold 12 products
- Location: evaluations\TOOL-1\tests\tool-1.spec.ts:147:3

# Error details

```
Error: [REQ AC-6] 12 products per page on the web shop

expect(locator).toHaveCount(expected) failed

Locator:  getByTestId(/^product-/)
Expected: 12
Received: 27
Timeout:  5000ms

Call log:
  - [REQ AC-6] 12 products per page on the web shop getByTestId(/^product-/) with timeout 5000ms
  - waiting for getByTestId(/^product-/)
    14 × locator resolved to 27 elements
       - unexpected value "27"

```

```
Error: [REQ AC-6] API per_page

expect(received).toBe(expected) // Object.is equality

Expected: 12
Received: 9
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
          - button "Search" [ref=e91] [cursor=pointer]
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
        - generic [ref=e214]:
          - 'link "Combination Pliers Compare Combination Pliers CO₂: A B C D E $14.15" [ref=e215] [cursor=pointer]':
            - /url: /product/01M3FVQJG6E2QF0114BDA47REV
            - generic [ref=e216]:
              - img "Combination Pliers" [ref=e217]
              - button "Compare" [ref=e218]
            - generic [ref=e222]:
              - heading "Combination Pliers" [level=5] [ref=e223]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e224]:
                - text: "CO₂:"
                - generic [ref=e225]: A
                - generic [ref=e226]: B
                - generic [ref=e227]: C
                - generic [ref=e228]: D
                - generic [ref=e229]: E
            - generic [ref=e230]: $14.15
          - 'link "Pliers Compare Pliers CO₂: A B C D E $12.01" [ref=e232] [cursor=pointer]':
            - /url: /product/01M3FVQJGBYFCZNY6D67EHK8Z7
            - generic [ref=e233]:
              - img "Pliers" [ref=e234]
              - button "Compare" [ref=e235]
            - generic [ref=e239]:
              - heading "Pliers" [level=5] [ref=e240]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e241]:
                - text: "CO₂:"
                - generic [ref=e242]: A
                - generic [ref=e243]: B
                - generic [ref=e244]: C
                - generic [ref=e245]: D
                - generic [ref=e246]: E
            - generic [ref=e247]: $12.01
          - 'link "Bolt Cutters Compare Bolt Cutters CO₂: A B C D E $48.41" [ref=e249] [cursor=pointer]':
            - /url: /product/01M3FVQJGMA534HDGC0W330QGC
            - generic [ref=e250]:
              - img "Bolt Cutters" [ref=e251]
              - button "Compare" [ref=e252]
            - generic [ref=e256]:
              - heading "Bolt Cutters" [level=5] [ref=e257]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e258]:
                - text: "CO₂:"
                - generic [ref=e259]: A
                - generic [ref=e260]: B
                - generic [ref=e261]: C
                - generic [ref=e262]: D
                - generic [ref=e263]: E
            - generic [ref=e264]: $48.41
          - 'link "Long Nose Pliers Compare Long Nose Pliers CO₂: A B C D E Out of stock $14.24" [ref=e266] [cursor=pointer]':
            - /url: /product/01M3FVQJGR8BEJ2YKBBNS993YY
            - generic [ref=e267]:
              - img "Long Nose Pliers" [ref=e268]
              - button "Compare" [ref=e269]
            - generic [ref=e273]:
              - heading "Long Nose Pliers" [level=5] [ref=e274]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e275]:
                - text: "CO₂:"
                - generic [ref=e276]: A
                - generic [ref=e277]: B
                - generic [ref=e278]: C
                - generic [ref=e279]: D
                - generic [ref=e280]: E
            - generic [ref=e281]:
              - generic [ref=e282]: Out of stock
              - generic [ref=e283]: $14.24
          - 'link "Slip Joint Pliers Compare Slip Joint Pliers CO₂: A B C D E $9.17" [ref=e284] [cursor=pointer]':
            - /url: /product/01M3FVQJGYBHTFYFS5TGXVNGH0
            - generic [ref=e285]:
              - img "Slip Joint Pliers" [ref=e286]
              - button "Compare" [ref=e287]
            - generic [ref=e291]:
              - heading "Slip Joint Pliers" [level=5] [ref=e292]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e293]:
                - text: "CO₂:"
                - generic [ref=e294]: A
                - generic [ref=e295]: B
                - generic [ref=e296]: C
                - generic [ref=e297]: D
                - generic [ref=e298]: E
            - generic [ref=e299]: $9.17
          - 'link "Claw Hammer with Shock Reduction Grip Compare Claw Hammer with Shock Reduction Grip CO₂: A B C D E $13.41" [ref=e301] [cursor=pointer]':
            - /url: /product/01M3FVQJH1ENAMZYGWMYY5GC4R
            - generic [ref=e302]:
              - img "Claw Hammer with Shock Reduction Grip" [ref=e303]
              - button "Compare" [ref=e304]
            - generic [ref=e308]:
              - heading "Claw Hammer with Shock Reduction Grip" [level=5] [ref=e309]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e310]:
                - text: "CO₂:"
                - generic [ref=e311]: A
                - generic [ref=e312]: B
                - generic [ref=e313]: C
                - generic [ref=e314]: D
                - generic [ref=e315]: E
            - generic [ref=e316]: $13.41
          - 'link "Hammer Compare Hammer CO₂: A B C D E $12.58" [ref=e318] [cursor=pointer]':
            - /url: /product/01M3FVQJH4C2M0ZRHSQ4EK2BKF
            - generic [ref=e319]:
              - img "Hammer" [ref=e320]
              - button "Compare" [ref=e321]
            - generic [ref=e325]:
              - heading "Hammer" [level=5] [ref=e326]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e327]:
                - text: "CO₂:"
                - generic [ref=e328]: A
                - generic [ref=e329]: B
                - generic [ref=e330]: C
                - generic [ref=e331]: D
                - generic [ref=e332]: E
            - generic [ref=e333]: $12.58
          - 'link "Claw Hammer Compare Claw Hammer CO₂: A B C D E $11.48" [ref=e335] [cursor=pointer]':
            - /url: /product/01M3FVQJH703254T4MM3Q4829K
            - generic [ref=e336]:
              - img "Claw Hammer" [ref=e337]
              - button "Compare" [ref=e338]
            - generic [ref=e342]:
              - heading "Claw Hammer" [level=5] [ref=e343]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e344]:
                - text: "CO₂:"
                - generic [ref=e345]: A
                - generic [ref=e346]: B
                - generic [ref=e347]: C
                - generic [ref=e348]: D
                - generic [ref=e349]: E
            - generic [ref=e350]: $11.48
          - 'link "Thor Hammer Compare Thor Hammer CO₂: A B C D E $11.14" [ref=e352] [cursor=pointer]':
            - /url: /product/01M3FVQJH95HMM5PKD9BS7Y5JD
            - generic [ref=e353]:
              - img "Thor Hammer" [ref=e354]
              - button "Compare" [ref=e355]
            - generic [ref=e359]:
              - heading "Thor Hammer" [level=5] [ref=e360]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e361]:
                - text: "CO₂:"
                - generic [ref=e362]: A
                - generic [ref=e363]: B
                - generic [ref=e364]: C
                - generic [ref=e365]: D
                - generic [ref=e366]: E
            - generic [ref=e367]: $11.14
        - navigation [ref=e371]:
          - list [ref=e372]:
            - listitem [ref=e373]:
              - button "Previous": «
            - listitem [ref=e374]:
              - button "Page-1" [ref=e375] [cursor=pointer]: "1"
            - listitem [ref=e376]:
              - button "Page-2" [ref=e377] [cursor=pointer]: "2"
            - listitem [ref=e378]:
              - button "Page-3" [ref=e379] [cursor=pointer]: "3"
            - listitem [ref=e380]:
              - button "Page-4" [ref=e381] [cursor=pointer]: "4"
            - listitem [ref=e382]:
              - button "Page-5" [ref=e383] [cursor=pointer]: "5"
            - listitem [ref=e384]:
              - button "Next" [ref=e385] [cursor=pointer]: »
  - contentinfo [ref=e387]:
    - generic [ref=e389]:
      - generic [ref=e390]: Learn & Explore
      - generic [ref=e391]:
        - link "Learn Test Automation Hands-on courses for Playwright, Robot Framework, APIs and more" [ref=e393] [cursor=pointer]:
          - /url: https://onlinecourses.testsmith.io
          - generic [ref=e396]:
            - generic [ref=e397]: Learn Test Automation
            - text: Hands-on courses for Playwright, Robot Framework, APIs and more
        - link "API Spector Open-source API testing, mocking and contract testing" [ref=e399] [cursor=pointer]:
          - /url: https://api-spector.dev
          - generic [ref=e402]:
            - generic [ref=e403]: API Spector
            - text: Open-source API testing, mocking and contract testing
        - link "GitHub Source code, issues and contributions" [ref=e405] [cursor=pointer]:
          - /url: https://github.com/testsmith-io/practice-software-testing
          - generic [ref=e408]:
            - generic [ref=e409]: GitHub
            - text: Source code, issues and contributions
    - generic [ref=e410]:
      - generic [ref=e411]:
        - text: This is a DEMO application, used for software testing training purpose. |
        - link "Privacy Policy" [ref=e412] [cursor=pointer]:
          - /url: /privacy
        - text: "| Banner photo by"
        - link "Barn Images" [ref=e413] [cursor=pointer]:
          - /url: https://unsplash.com/@barnimages
        - text: "on"
        - link "Unsplash" [ref=e414] [cursor=pointer]:
          - /url: https://unsplash.com/photos/t5YUoHW6zRo
        - text: .
      - generic [ref=e415]: v2.5 | Built 2026-09-09 | Angular 20.0.5
  - button "Open chat" [ref=e417] [cursor=pointer]
  - button "Show live shop activity" [ref=e421] [cursor=pointer]
```

# Test source

```ts
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
> 151 |       expect.soft((await api.get<Page_>(EP.products)).body.per_page, '[REQ AC-6] API per_page').toBe(REQ.PER_PAGE);
      |                                                                                                 ^ Error: [REQ AC-6] API per_page
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