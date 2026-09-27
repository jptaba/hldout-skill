# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AE-1\tests\ae-1.spec.ts >> AE-1 Product search and catalogue on the shop and the public product API >> SCN-012: A search without the search_product parameter is rejected with response code 400
- Location: evaluations\AE-1\tests\ae-1.spec.ts:228:3

# Error details

```
Error: [REQ AC-7] response code 400

expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  135 |         lower = productsOf(await search(api, row.lower));
  136 |         expect((lower ?? []).length, `"${row.lower}" returns products (precondition: the comparison is meaningful)`).toBeGreaterThan(0);
  137 |       });
  138 |       await journey.step('Then both searches return the same products', async () => {
  139 |         expect(ids(upper), `[REQ AC-3] "${row.upper}" returns the same products as "${row.lower}"`).toEqual(ids(lower));
  140 |       });
  141 |     });
  142 |   });
  143 | 
  144 |   test('SCN-006: Searching "dress" returns every product with "dress" in its name or in a Dress category', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  145 |     let catalogue: Product[] = []; let found: Product[] = [];
  146 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  147 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  148 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  149 |     });
  150 |     await journey.step('When a client searches for "dress"', async () => { found = productsOf(await search(api, REQ.AC4_TERM)) ?? []; });
  151 |     await journey.step('Then every catalogue product whose name contains "dress" is returned', async () => {
  152 |       const got = new Set(ids(found));
  153 |       const missing = catalogue.filter((p) => contains(p.name, REQ.AC4_TERM) && !got.has(String(p.id))).map((p) => `${p.id} ${p.name}`);
  154 |       expect.soft(missing, '[REQ AC-4] every product whose name contains "dress" is returned').toEqual([]);
  155 |     });
  156 |     await journey.step('And every product in a "Dress" category is returned, including "Sleeves Top and Short - Blue & Pink" (Kids > Dress)', async () => {
  157 |       const got = new Set(ids(found));
  158 |       const missing = catalogue.filter((p) => contains(categoryNameOf(p), REQ.AC4_TERM) && !got.has(String(p.id)))
  159 |         .map((p) => `${p.id} ${p.name} (${categoryNameOf(p)})`);
  160 |       expect.soft(missing, '[REQ AC-4] every product in a "Dress" category is returned').toEqual([]);
  161 |       expect.soft(found.map((p) => p.name), '[REQ AC-4] "Sleeves Top and Short - Blue & Pink" (Kids > Dress) is returned').toContain(REQ.AC4_DRESS_EXAMPLE);
  162 |     });
  163 |   });
  164 | 
  165 |   test('SCN-007: Searching "dress" returns nothing else', { tag: ['@AC-4', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  166 |     let catalogue: Product[] = []; let found: Product[] = [];
  167 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  168 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  169 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  170 |     });
  171 |     await journey.step('When a client searches for "dress"', async () => { found = productsOf(await search(api, REQ.AC4_TERM)) ?? []; });
  172 |     await journey.step('Then every product returned has "dress" in its name or its category name', async () => {
  173 |       const byId = new Map(catalogue.map((p) => [String(p.id), p]));
  174 |       const extra = found.filter((p) => {
  175 |         const c = byId.get(String(p.id)) ?? p;
  176 |         return !contains(c.name, REQ.AC4_TERM) && !contains(categoryNameOf(c), REQ.AC4_TERM);
  177 |       }).map((p) => `${p.id} ${p.name} (${categoryNameOf(byId.get(String(p.id)) ?? p)})`);
  178 |       expect(extra, '[REQ AC-4] nothing without "dress" in its name or category name comes back').toEqual([]);
  179 |     });
  180 |   });
  181 | 
  182 |   test('SCN-008: The brand is not a search field', { tag: ['@AC-4', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
  183 |     let catalogue: Product[] = []; let found: Product[] = [];
  184 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  185 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  186 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  187 |     });
  188 |     await journey.step('When a client searches for "Polo"', async () => { found = productsOf(await search(api, REQ.AC4_BRAND_TERM)) ?? []; });
  189 |     await journey.step('Then exactly the products with "Polo" in their name or category name are returned', async () => {
  190 |       const expected = catalogue.filter((p) => contains(p.name, REQ.AC4_BRAND_TERM) || contains(categoryNameOf(p), REQ.AC4_BRAND_TERM));
  191 |       expect(ids(found), '[REQ AC-4] "Polo" finds only products with "Polo" in the name or category (brand not searched)').toEqual(ids(expected));
  192 |     });
  193 |   });
  194 | 
  195 |   test('SCN-009: A search that matches nothing returns an empty product list', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  196 |     let res!: ApiResponse;
  197 |     await journey.step('Given the public product API (no authentication)', async () => {});
  198 |     await journey.step('When a client searches for "zzqxv"', async () => { res = await search(api, REQ.AC5_NO_MATCH); });
  199 |     await journey.step('Then an empty product list is returned', async () => {
  200 |       const list = productsOf(res);
  201 |       expect(Array.isArray(list), '[REQ AC-5] a product list is returned').toBe(true);
  202 |       expect(list, '[REQ AC-5] the product list is empty').toEqual([]);
  203 |     });
  204 |   });
  205 | 
  206 |   test('SCN-010: A search that matches nothing is not an error', { tag: ['@AC-5', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  207 |     let res!: ApiResponse;
  208 |     await journey.step('Given the public product API (no authentication)', async () => {});
  209 |     await journey.step('When a client searches for "zzqxv"', async () => { res = await search(api, REQ.AC5_NO_MATCH); });
  210 |     await journey.step('Then the response is not an error: no error status and no error message', async () => {
  211 |       expect.soft(res.status, '[REQ AC-5] no error status (4xx/5xx)').toBeLessThan(400);
  212 |       expect.soft(messageOf(res), '[REQ AC-5] no error message').toBeUndefined();
  213 |     });
  214 |   });
  215 | 
  216 |   test('SCN-011: Searching with an empty value returns the whole catalogue', { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  217 |     let catalogue: Product[] = []; let res!: ApiResponse;
  218 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  219 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  220 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  221 |     });
  222 |     await journey.step('When a client posts search_product with an empty value', async () => { res = await search(api, ''); });
  223 |     await journey.step('Then the whole catalogue is returned, the same products as GET /api/productsList', async () => {
  224 |       expect(ids(productsOf(res)), '[REQ AC-6] an empty term returns the same products as GET /api/productsList').toEqual(ids(catalogue));
  225 |     });
  226 |   });
  227 | 
  228 |   test('SCN-012: A search without the search_product parameter is rejected with response code 400', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  229 |     let res!: ApiResponse;
  230 |     await journey.step('Given the public product API (no authentication)', async () => {});
  231 |     await journey.step('When a client posts to /api/searchProduct without the search_product parameter', async () => {
  232 |       res = await api.post(EP.searchProduct); // no body at all
  233 |     });
  234 |     await journey.step('Then the request is rejected with response code 400', async () => {
> 235 |       expect(res.status, '[REQ AC-7] response code 400').toBe(REQ.STATUS.BAD_REQUEST);
      |                                                          ^ Error: [REQ AC-7] response code 400
  236 |     });
  237 |   });
  238 | 
  239 |   test('SCN-013: A search without the search_product parameter explains what is missing', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  240 |     let res!: ApiResponse;
  241 |     await journey.step('Given the public product API (no authentication)', async () => {});
  242 |     await journey.step('When a client posts to /api/searchProduct without the search_product parameter', async () => {
  243 |       res = await api.post(EP.searchProduct); // no body at all
  244 |     });
  245 |     await journey.step('Then the message is "Bad request, search_product parameter is missing in POST request."', async () => {
  246 |       expect(messageOf(res), '[REQ AC-7] message').toBe(REQ.AC7_MESSAGE);
  247 |     });
  248 |   });
  249 | 
  250 |   test('SCN-014: A shopper searches "jean" on the Products page', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  251 |     await journey.step('Given a shopper on the Products page', async () => { await gotoPage(page, PRODUCTS_PAGE); });
  252 |     await journey.step('When they type "jean" in the search box and press the search button', async () => { await searchOnPage(page, REQ.AC2_TERM); });
  253 |     await journey.step('Then the product grid is headed "Searched Products"', async () => {
  254 |       await expect.soft(gridHeading(page), '[REQ AC-8] grid heading').toHaveText(REQ.HEADING_SEARCHED, { ignoreCase: true });
  255 |     });
  256 |     await journey.step('And the search box still shows "jean"', async () => {
  257 |       await expect.soft(searchBox(page), '[REQ AC-8] search box keeps the term').toHaveValue(REQ.AC2_TERM);
  258 |     });
  259 |     await journey.step('And exactly the three jeans products listed in AC-2 are shown', async () => {
  260 |       await expect.poll(() => shownNames(page), { message: '[REQ AC-8] exactly the three jeans are shown' }).toEqual([...REQ.AC2_JEANS].sort());
  261 |     });
  262 |   });
  263 | 
  264 |   test('SCN-015: A shopper searches without a term on the Products page and sees the whole catalogue', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, seed }) => {
  265 |     await journey.step('Given a shopper on the Products page', async () => { await gotoPage(page, PRODUCTS_PAGE); });
  266 |     await journey.step('When they leave the search box empty and press the search button', async () => { await searchOnPage(page, ''); });
  267 |     await journey.step('Then the grid is headed "All Products"', async () => {
  268 |       await expect.soft(gridHeading(page), '[REQ AC-9] grid heading').toHaveText(REQ.HEADING_ALL, { ignoreCase: true });
  269 |     });
  270 |     await journey.step('And every product of the catalogue (GET /api/productsList) is shown', async () => {
  271 |       const catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  272 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  273 |       await expect.poll(() => shownNames(page), { message: '[REQ AC-9] every catalogue product is shown' }).toEqual(names(catalogue));
  274 |     });
  275 |   });
  276 | 
  277 |   REQ.AC10_TERMS.forEach((term, i) => {
  278 |     test(`SCN-016.${i + 1}: The shop and the API agree on search results (${term})`, { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey }) => {
  279 |       await journey.step('Given a shopper on the Products page', async () => { await gotoPage(page, PRODUCTS_PAGE); });
  280 |       await journey.step(`When a shopper searches for "${term}" on the Products page`, async () => { await searchOnPage(page, term); });
  281 |       await journey.step(`Then the products shown are exactly the products POST /api/searchProduct returns for "${term}"`, async () => {
  282 |         const fromApi = productsOf(await search(api, term));
  283 |         expect(Array.isArray(fromApi), 'search API returned a product list (precondition)').toBe(true);
  284 |         await expect.poll(() => shownNames(page), { message: `[REQ AC-10] the page shows exactly what the API returns for "${term}"` }).toEqual(names(fromApi));
  285 |       });
  286 |     });
  287 |   });
  288 | 
  289 |   test('SCN-017: A search on the Products page that matches nothing shows no product', { tag: ['@AC-11', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  290 |     await journey.step('Given a shopper on the Products page', async () => { await gotoPage(page, PRODUCTS_PAGE); });
  291 |     await journey.step('When a shopper searches for "zzqxv" on the Products page', async () => { await searchOnPage(page, REQ.AC5_NO_MATCH); });
  292 |     await journey.step('Then the grid is headed "Searched Products"', async () => {
  293 |       await expect.soft(gridHeading(page), '[REQ AC-11] grid heading').toHaveText(REQ.HEADING_SEARCHED, { ignoreCase: true });
  294 |     });
  295 |     await journey.step('And no product is shown', async () => {
  296 |       await expect(cardNames(page), '[REQ AC-11] no product is shown').toHaveCount(0);
  297 |     });
  298 |   });
  299 | });
  300 | 
```