# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-1\tests\tool-1.spec.ts >> TOOL-1 Catalogue search, sorting and category filter >> SCN-007: Pages hold 12 products
- Location: evaluations\TOOL-1\tests\tool-1.spec.ts:152:3

# Error details

```
Error: [REQ AC-6] 12 products per page on the web shop

expect(locator).toHaveCount(expected) failed

Locator:  getByRole('link').filter({ has: getByTestId('product-name') })
Expected: 12
Received: 9
Timeout:  5000ms

Call log:
  - [REQ AC-6] 12 products per page on the web shop getByRole('link').filter({ has: getByTestId('product-name') }) with timeout 5000ms
  - waiting for getByRole('link').filter({ has: getByTestId('product-name') })
    14 × locator resolved to 9 elements
       - unexpected value "9"

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
          - generic [ref=e207]:
            - checkbox "some name" [ref=e208]
            - text: some name
          - generic [ref=e210]:
            - checkbox "Marca-4fd90912" [ref=e211]
            - text: Marca-4fd90912
          - generic [ref=e213]:
            - checkbox "Marca-caebf1a4" [ref=e214]
            - text: Marca-caebf1a4
          - generic [ref=e216]:
            - checkbox "MarcaAtualizada-aca3d45a" [ref=e217]
            - text: MarcaAtualizada-aca3d45a
          - generic [ref=e219]:
            - checkbox "some name" [ref=e220]
            - text: some name
          - generic [ref=e222]:
            - checkbox "Marca-9ba90354" [ref=e223]
            - text: Marca-9ba90354
          - generic [ref=e225]:
            - checkbox "Marca-c33ea16b" [ref=e226]
            - text: Marca-c33ea16b
          - generic [ref=e228]:
            - checkbox "MarcaAtualizada-d15011f6" [ref=e229]
            - text: MarcaAtualizada-d15011f6
        - heading "Sustainability:" [level=4] [ref=e231]
        - group "Eco-Friendly Products" [ref=e232]:
          - generic [ref=e235]:
            - checkbox "Show only eco-friendly products" [ref=e236]
            - text: Show only eco-friendly products
      - generic [ref=e237]:
        - generic [ref=e238]:
          - 'link "Combination Pliers Compare Combination Pliers CO₂: A B C D E $14.15" [ref=e239] [cursor=pointer]':
            - /url: /product/01M3FVQJG6E2QF0114BDA47REV
            - generic [ref=e240]:
              - img "Combination Pliers" [ref=e241]
              - button "Compare" [ref=e242]
            - generic [ref=e246]:
              - heading "Combination Pliers" [level=5] [ref=e247]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e248]:
                - text: "CO₂:"
                - generic [ref=e249]: A
                - generic [ref=e250]: B
                - generic [ref=e251]: C
                - generic [ref=e252]: D
                - generic [ref=e253]: E
            - generic [ref=e254]: $14.15
          - 'link "Pliers Compare Pliers CO₂: A B C D E $12.01" [ref=e256] [cursor=pointer]':
            - /url: /product/01M3FVQJGBYFCZNY6D67EHK8Z7
            - generic [ref=e257]:
              - img "Pliers" [ref=e258]
              - button "Compare" [ref=e259]
            - generic [ref=e263]:
              - heading "Pliers" [level=5] [ref=e264]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e265]:
                - text: "CO₂:"
                - generic [ref=e266]: A
                - generic [ref=e267]: B
                - generic [ref=e268]: C
                - generic [ref=e269]: D
                - generic [ref=e270]: E
            - generic [ref=e271]: $12.01
          - 'link "Bolt Cutters Compare Bolt Cutters CO₂: A B C D E $48.41" [ref=e273] [cursor=pointer]':
            - /url: /product/01M3FVQJGMA534HDGC0W330QGC
            - generic [ref=e274]:
              - img "Bolt Cutters" [ref=e275]
              - button "Compare" [ref=e276]
            - generic [ref=e280]:
              - heading "Bolt Cutters" [level=5] [ref=e281]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e282]:
                - text: "CO₂:"
                - generic [ref=e283]: A
                - generic [ref=e284]: B
                - generic [ref=e285]: C
                - generic [ref=e286]: D
                - generic [ref=e287]: E
            - generic [ref=e288]: $48.41
          - 'link "Long Nose Pliers Compare Long Nose Pliers CO₂: A B C D E Out of stock $14.24" [ref=e290] [cursor=pointer]':
            - /url: /product/01M3FVQJGR8BEJ2YKBBNS993YY
            - generic [ref=e291]:
              - img "Long Nose Pliers" [ref=e292]
              - button "Compare" [ref=e293]
            - generic [ref=e297]:
              - heading "Long Nose Pliers" [level=5] [ref=e298]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e299]:
                - text: "CO₂:"
                - generic [ref=e300]: A
                - generic [ref=e301]: B
                - generic [ref=e302]: C
                - generic [ref=e303]: D
                - generic [ref=e304]: E
            - generic [ref=e305]:
              - generic [ref=e306]: Out of stock
              - generic [ref=e307]: $14.24
          - 'link "Slip Joint Pliers Compare Slip Joint Pliers CO₂: A B C D E $9.17" [ref=e308] [cursor=pointer]':
            - /url: /product/01M3FVQJGYBHTFYFS5TGXVNGH0
            - generic [ref=e309]:
              - img "Slip Joint Pliers" [ref=e310]
              - button "Compare" [ref=e311]
            - generic [ref=e315]:
              - heading "Slip Joint Pliers" [level=5] [ref=e316]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e317]:
                - text: "CO₂:"
                - generic [ref=e318]: A
                - generic [ref=e319]: B
                - generic [ref=e320]: C
                - generic [ref=e321]: D
                - generic [ref=e322]: E
            - generic [ref=e323]: $9.17
          - 'link "Claw Hammer with Shock Reduction Grip Compare Claw Hammer with Shock Reduction Grip CO₂: A B C D E $13.41" [ref=e325] [cursor=pointer]':
            - /url: /product/01M3FVQJH1ENAMZYGWMYY5GC4R
            - generic [ref=e326]:
              - img "Claw Hammer with Shock Reduction Grip" [ref=e327]
              - button "Compare" [ref=e328]
            - generic [ref=e332]:
              - heading "Claw Hammer with Shock Reduction Grip" [level=5] [ref=e333]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e334]:
                - text: "CO₂:"
                - generic [ref=e335]: A
                - generic [ref=e336]: B
                - generic [ref=e337]: C
                - generic [ref=e338]: D
                - generic [ref=e339]: E
            - generic [ref=e340]: $13.41
          - 'link "Hammer Compare Hammer CO₂: A B C D E $12.58" [ref=e342] [cursor=pointer]':
            - /url: /product/01M3FVQJH4C2M0ZRHSQ4EK2BKF
            - generic [ref=e343]:
              - img "Hammer" [ref=e344]
              - button "Compare" [ref=e345]
            - generic [ref=e349]:
              - heading "Hammer" [level=5] [ref=e350]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e351]:
                - text: "CO₂:"
                - generic [ref=e352]: A
                - generic [ref=e353]: B
                - generic [ref=e354]: C
                - generic [ref=e355]: D
                - generic [ref=e356]: E
            - generic [ref=e357]: $12.58
          - 'link "Claw Hammer Compare Claw Hammer CO₂: A B C D E $11.48" [ref=e359] [cursor=pointer]':
            - /url: /product/01M3FVQJH703254T4MM3Q4829K
            - generic [ref=e360]:
              - img "Claw Hammer" [ref=e361]
              - button "Compare" [ref=e362]
            - generic [ref=e366]:
              - heading "Claw Hammer" [level=5] [ref=e367]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e368]:
                - text: "CO₂:"
                - generic [ref=e369]: A
                - generic [ref=e370]: B
                - generic [ref=e371]: C
                - generic [ref=e372]: D
                - generic [ref=e373]: E
            - generic [ref=e374]: $11.48
          - 'link "Thor Hammer Compare Thor Hammer CO₂: A B C D E $11.14" [ref=e376] [cursor=pointer]':
            - /url: /product/01M3FVQJH95HMM5PKD9BS7Y5JD
            - generic [ref=e377]:
              - img "Thor Hammer" [ref=e378]
              - button "Compare" [ref=e379]
            - generic [ref=e383]:
              - heading "Thor Hammer" [level=5] [ref=e384]
              - generic "A = most environmentally friendly, E = higher environmental impact" [ref=e385]:
                - text: "CO₂:"
                - generic [ref=e386]: A
                - generic [ref=e387]: B
                - generic [ref=e388]: C
                - generic [ref=e389]: D
                - generic [ref=e390]: E
            - generic [ref=e391]: $11.14
        - navigation [ref=e395]:
          - list [ref=e396]:
            - listitem [ref=e397]:
              - button "Previous": «
            - listitem [ref=e398]:
              - button "Page-1" [ref=e399] [cursor=pointer]: "1"
            - listitem [ref=e400]:
              - button "Page-2" [ref=e401] [cursor=pointer]: "2"
            - listitem [ref=e402]:
              - button "Page-3" [ref=e403] [cursor=pointer]: "3"
            - listitem [ref=e404]:
              - button "Page-4" [ref=e405] [cursor=pointer]: "4"
            - listitem [ref=e406]:
              - button "Page-5" [ref=e407] [cursor=pointer]: "5"
            - listitem [ref=e408]:
              - button "Next" [ref=e409] [cursor=pointer]: »
  - contentinfo [ref=e411]:
    - generic [ref=e413]:
      - generic [ref=e414]: Learn & Explore
      - generic [ref=e415]:
        - link "Learn Test Automation Hands-on courses for Playwright, Robot Framework, APIs and more" [ref=e417] [cursor=pointer]:
          - /url: https://onlinecourses.testsmith.io
          - generic [ref=e420]:
            - generic [ref=e421]: Learn Test Automation
            - text: Hands-on courses for Playwright, Robot Framework, APIs and more
        - link "API Spector Open-source API testing, mocking and contract testing" [ref=e423] [cursor=pointer]:
          - /url: https://api-spector.dev
          - generic [ref=e426]:
            - generic [ref=e427]: API Spector
            - text: Open-source API testing, mocking and contract testing
        - link "GitHub Source code, issues and contributions" [ref=e429] [cursor=pointer]:
          - /url: https://github.com/testsmith-io/practice-software-testing
          - generic [ref=e432]:
            - generic [ref=e433]: GitHub
            - text: Source code, issues and contributions
    - generic [ref=e434]:
      - generic [ref=e435]:
        - text: This is a DEMO application, used for software testing training purpose. |
        - link "Privacy Policy" [ref=e436] [cursor=pointer]:
          - /url: /privacy
        - text: "| Banner photo by"
        - link "Barn Images" [ref=e437] [cursor=pointer]:
          - /url: https://unsplash.com/@barnimages
        - text: "on"
        - link "Unsplash" [ref=e438] [cursor=pointer]:
          - /url: https://unsplash.com/photos/t5YUoHW6zRo
        - text: .
      - generic [ref=e439]: v2.5 | Built 2026-09-09 | Angular 20.0.5
  - button "Open chat" [ref=e441] [cursor=pointer]
  - button "Show live shop activity" [ref=e445] [cursor=pointer]
```

# Test source

```ts
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
> 156 |       expect.soft((await api.get<Page_>(EP.products)).body.per_page, '[REQ AC-6] API per_page').toBe(REQ.PER_PAGE);
      |                                                                                                 ^ Error: [REQ AC-6] API per_page
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