# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AE-1\tests\ae-1.spec.ts >> AE-1 Product search and catalogue on the shop and the public product API >> SCN-012: A search without the search_product parameter is rejected with response code 400
- Location: evaluations\AE-1\tests\ae-1.spec.ts:236:3

# Error details

```
Error: [REQ AC-7] response code 400

expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  143 |         lower = productsOf(await search(api, row.lower));
  144 |         expect((lower ?? []).length, `"${row.lower}" returns products (precondition: the comparison is meaningful)`).toBeGreaterThan(0);
  145 |       });
  146 |       await journey.step('Then both searches return the same products', async () => {
  147 |         expect(ids(upper), `[REQ AC-3] "${row.upper}" returns the same products as "${row.lower}"`).toEqual(ids(lower));
  148 |       });
  149 |     });
  150 |   });
  151 | 
  152 |   test('SCN-006: Searching "dress" returns every product with "dress" in its name or in a Dress category', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  153 |     let catalogue: Product[] = []; let found: Product[] = [];
  154 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  155 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  156 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  157 |     });
  158 |     await journey.step('When a client searches for "dress"', async () => { found = productsOf(await search(api, REQ.AC4_TERM)) ?? []; });
  159 |     await journey.step('Then every catalogue product whose name contains "dress" is returned', async () => {
  160 |       const got = new Set(ids(found));
  161 |       const missing = catalogue.filter((p) => contains(p.name, REQ.AC4_TERM) && !got.has(String(p.id))).map((p) => `${p.id} ${p.name}`);
  162 |       expect.soft(missing, '[REQ AC-4] every product whose name contains "dress" is returned').toEqual([]);
  163 |     });
  164 |     await journey.step('And every product in a "Dress" category is returned, including "Sleeves Top and Short - Blue & Pink" (Kids > Dress)', async () => {
  165 |       const got = new Set(ids(found));
  166 |       const missing = catalogue.filter((p) => contains(categoryNameOf(p), REQ.AC4_TERM) && !got.has(String(p.id)))
  167 |         .map((p) => `${p.id} ${p.name} (${categoryNameOf(p)})`);
  168 |       expect.soft(missing, '[REQ AC-4] every product in a "Dress" category is returned').toEqual([]);
  169 |       expect.soft(found.map((p) => p.name), '[REQ AC-4] "Sleeves Top and Short - Blue & Pink" (Kids > Dress) is returned').toContain(REQ.AC4_DRESS_EXAMPLE);
  170 |     });
  171 |   });
  172 | 
  173 |   test('SCN-007: Searching "dress" returns nothing else', { tag: ['@AC-4', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  174 |     let catalogue: Product[] = []; let found: Product[] = [];
  175 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  176 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  177 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  178 |     });
  179 |     await journey.step('When a client searches for "dress"', async () => { found = productsOf(await search(api, REQ.AC4_TERM)) ?? []; });
  180 |     await journey.step('Then every product returned has "dress" in its name or its category name', async () => {
  181 |       const byId = new Map(catalogue.map((p) => [String(p.id), p]));
  182 |       const extra = found.filter((p) => {
  183 |         const c = byId.get(String(p.id)) ?? p;
  184 |         return !contains(c.name, REQ.AC4_TERM) && !contains(categoryNameOf(c), REQ.AC4_TERM);
  185 |       }).map((p) => `${p.id} ${p.name} (${categoryNameOf(byId.get(String(p.id)) ?? p)})`);
  186 |       expect(extra, '[REQ AC-4] nothing without "dress" in its name or category name comes back').toEqual([]);
  187 |     });
  188 |   });
  189 | 
  190 |   test('SCN-008: The brand is not a search field', { tag: ['@AC-4', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
  191 |     let catalogue: Product[] = []; let found: Product[] = [];
  192 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  193 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  194 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  195 |     });
  196 |     await journey.step('When a client searches for "Polo"', async () => { found = productsOf(await search(api, REQ.AC4_BRAND_TERM)) ?? []; });
  197 |     await journey.step('Then exactly the products with "Polo" in their name or category name are returned', async () => {
  198 |       const expected = catalogue.filter((p) => contains(p.name, REQ.AC4_BRAND_TERM) || contains(categoryNameOf(p), REQ.AC4_BRAND_TERM));
  199 |       expect(ids(found), '[REQ AC-4] "Polo" finds only products with "Polo" in the name or category (brand not searched)').toEqual(ids(expected));
  200 |     });
  201 |   });
  202 | 
  203 |   test('SCN-009: A search that matches nothing returns an empty product list', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  204 |     let res!: ApiResponse;
  205 |     await journey.step('Given the public product API (no authentication)', async () => {});
  206 |     await journey.step('When a client searches for "zzqxv"', async () => { res = await search(api, REQ.AC5_NO_MATCH); });
  207 |     await journey.step('Then an empty product list is returned', async () => {
  208 |       const list = productsOf(res);
  209 |       expect(Array.isArray(list), '[REQ AC-5] a product list is returned').toBe(true);
  210 |       expect(list, '[REQ AC-5] the product list is empty').toEqual([]);
  211 |     });
  212 |   });
  213 | 
  214 |   test('SCN-010: A search that matches nothing is not an error', { tag: ['@AC-5', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  215 |     let res!: ApiResponse;
  216 |     await journey.step('Given the public product API (no authentication)', async () => {});
  217 |     await journey.step('When a client searches for "zzqxv"', async () => { res = await search(api, REQ.AC5_NO_MATCH); });
  218 |     await journey.step('Then the response is not an error: no error status and no error message', async () => {
  219 |       expect.soft(res.status, '[REQ AC-5] no error status (4xx/5xx)').toBeLessThan(400);
  220 |       expect.soft(messageOf(res), '[REQ AC-5] no error message').toBeUndefined();
  221 |     });
  222 |   });
  223 | 
  224 |   test('SCN-011: Searching with an empty value returns the whole catalogue', { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  225 |     let catalogue: Product[] = []; let res!: ApiResponse;
  226 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  227 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  228 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  229 |     });
  230 |     await journey.step('When a client posts search_product with an empty value', async () => { res = await search(api, ''); });
  231 |     await journey.step('Then the whole catalogue is returned, the same products as GET /api/productsList', async () => {
  232 |       expect(ids(productsOf(res)), '[REQ AC-6] an empty term returns the same products as GET /api/productsList').toEqual(ids(catalogue));
  233 |     });
  234 |   });
  235 | 
  236 |   test('SCN-012: A search without the search_product parameter is rejected with response code 400', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  237 |     let res!: ApiResponse;
  238 |     await journey.step('Given the public product API (no authentication)', async () => {});
  239 |     await journey.step('When a client posts to /api/searchProduct without the search_product parameter', async () => {
  240 |       res = await api.post(EP.searchProduct); // no body at all
  241 |     });
  242 |     await journey.step('Then the request is rejected with response code 400', async () => {
> 243 |       expect(res.status, '[REQ AC-7] response code 400').toBe(REQ.STATUS.BAD_REQUEST);
      |                                                          ^ Error: [REQ AC-7] response code 400
  244 |     });
  245 |   });
  246 | 
  247 |   test('SCN-013: A search without the search_product parameter explains what is missing', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  248 |     let res!: ApiResponse;
  249 |     await journey.step('Given the public product API (no authentication)', async () => {});
  250 |     await journey.step('When a client posts to /api/searchProduct without the search_product parameter', async () => {
  251 |       res = await api.post(EP.searchProduct); // no body at all
  252 |     });
  253 |     await journey.step('Then the message is "Bad request, search_product parameter is missing in POST request."', async () => {
  254 |       expect(messageOf(res), '[REQ AC-7] message').toBe(REQ.AC7_MESSAGE);
  255 |     });
  256 |   });
  257 | 
  258 |   test('SCN-014: A shopper searches "jean" on the Products page', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  259 |     await journey.step('Given a shopper on the Products page', async () => { await openProductsPage(page); });
  260 |     await journey.step('When they type "jean" in the search box and press the search button', async () => { await searchOnPage(page, REQ.AC2_TERM); });
  261 |     await journey.step('Then the product grid is headed "Searched Products"', async () => {
  262 |       await expect.soft(gridHeading(page), '[REQ AC-8] grid heading').toHaveText(REQ.HEADING_SEARCHED, { ignoreCase: true });
  263 |     });
  264 |     await journey.step('And the search box still shows "jean"', async () => {
  265 |       await expect.soft(searchBox(page), '[REQ AC-8] search box keeps the term').toHaveValue(REQ.AC2_TERM);
  266 |     });
  267 |     await journey.step('And exactly the three jeans products listed in AC-2 are shown', async () => {
  268 |       await expect.poll(() => shownNames(page), { message: '[REQ AC-8] exactly the three jeans are shown' }).toEqual([...REQ.AC2_JEANS].sort());
  269 |     });
  270 |   });
  271 | 
  272 |   test('SCN-015: A shopper searches without a term on the Products page and sees the whole catalogue', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, seed }) => {
  273 |     await journey.step('Given a shopper on the Products page', async () => { await openProductsPage(page); });
  274 |     await journey.step('When they leave the search box empty and press the search button', async () => { await searchOnPage(page, ''); });
  275 |     await journey.step('Then the grid is headed "All Products"', async () => {
  276 |       await expect.soft(gridHeading(page), '[REQ AC-9] grid heading').toHaveText(REQ.HEADING_ALL, { ignoreCase: true });
  277 |     });
  278 |     await journey.step('And every product of the catalogue (GET /api/productsList) is shown', async () => {
  279 |       const catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  280 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  281 |       await expect.poll(() => shownNames(page), { message: '[REQ AC-9] every catalogue product is shown' }).toEqual(names(catalogue));
  282 |     });
  283 |   });
  284 | 
  285 |   REQ.AC10_TERMS.forEach((term, i) => {
  286 |     test(`SCN-016.${i + 1}: The shop and the API agree on search results (${term})`, { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey }) => {
  287 |       await journey.step('Given a shopper on the Products page', async () => { await openProductsPage(page); });
  288 |       await journey.step(`When a shopper searches for "${term}" on the Products page`, async () => { await searchOnPage(page, term); });
  289 |       await journey.step(`Then the products shown are exactly the products POST /api/searchProduct returns for "${term}"`, async () => {
  290 |         const fromApi = productsOf(await search(api, term));
  291 |         expect(Array.isArray(fromApi), 'search API returned a product list (precondition)').toBe(true);
  292 |         await expect.poll(() => shownNames(page), { message: `[REQ AC-10] the page shows exactly what the API returns for "${term}"` }).toEqual(names(fromApi));
  293 |       });
  294 |     });
  295 |   });
  296 | 
  297 |   test('SCN-017: A search on the Products page that matches nothing shows no product', { tag: ['@AC-11', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  298 |     await journey.step('Given a shopper on the Products page', async () => { await openProductsPage(page); });
  299 |     await journey.step('When a shopper searches for "zzqxv" on the Products page', async () => { await searchOnPage(page, REQ.AC5_NO_MATCH); });
  300 |     await journey.step('Then the grid is headed "Searched Products"', async () => {
  301 |       await expect.soft(gridHeading(page), '[REQ AC-11] grid heading').toHaveText(REQ.HEADING_SEARCHED, { ignoreCase: true });
  302 |     });
  303 |     await journey.step('And no product is shown', async () => {
  304 |       await expect(cardNames(page), '[REQ AC-11] no product is shown').toHaveCount(0);
  305 |     });
  306 |   });
  307 | });
  308 | 
```