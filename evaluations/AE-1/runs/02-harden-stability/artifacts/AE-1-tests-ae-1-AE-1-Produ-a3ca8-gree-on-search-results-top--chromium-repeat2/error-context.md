# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AE-1\tests\ae-1.spec.ts >> AE-1 Product search and catalogue on the shop and the public product API >> SCN-016.1: The shop and the API agree on search results (top)
- Location: evaluations\AE-1\tests\ae-1.spec.ts:278:5

# Error details

```
Error: [REQ AC-10] the page shows exactly what the API returns for "top"

[REQ AC-10] the page shows exactly what the API returns for "top"

expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

@@ -2,15 +2,15 @@
    "Blue Top",
    "Colour Blocked Shirt – Sky Blue",
    "Fancy Green Top",
    "Frozen Tops For Kids",
    "Full Sleeves Top Cherry - Pink",
-   "Half Sleeves Top Schiffli Detailing - Pink",
+   "Half Sleeves Top Schiffli Detailing - PinkApparel",
    "Lace Top For Women",
    "Little Girls Mr. Panda Shirt",
    "Madame Top For Women",
    "Printed Off Shoulder Top - White",
-   "Sleeves Printed Top - White",
+   "Sleeves Printed Top - WhiteEconomics",
    "Sleeves Top and Short - Blue & Pink",
    "Summer White Top",
    "Winter Top",
  ]

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=f18e1]:
  - banner [ref=f18e2]:
    - generic [ref=f18e5]:
      - link [ref=f18e8] [cursor=pointer]:
        - /url: /
        - img "Website for automation practice" [ref=f18e9]
      - list [ref=f18e12]:
        - listitem [ref=f18e13]:
          - link " Home" [ref=f18e14] [cursor=pointer]:
            - /url: /
            - generic [ref=f18e15]: 
            - text: Home
        - listitem [ref=f18e16]:
          - link " Products" [ref=f18e17] [cursor=pointer]:
            - /url: /products
            - generic [ref=f18e18]: 
            - text: Products
        - listitem [ref=f18e19]:
          - link " Cart" [ref=f18e20] [cursor=pointer]:
            - /url: /view_cart
            - generic [ref=f18e21]: 
            - text: Cart
        - listitem [ref=f18e22]:
          - link " Signup / Login" [ref=f18e23] [cursor=pointer]:
            - /url: /login
            - generic [ref=f18e24]: 
            - text: Signup / Login
        - listitem [ref=f18e25]:
          - link " Test Cases" [ref=f18e26] [cursor=pointer]:
            - /url: /test_cases
            - generic [ref=f18e27]: 
            - text: Test Cases
        - listitem [ref=f18e28]:
          - link " API Testing" [ref=f18e29] [cursor=pointer]:
            - /url: /api_list
            - generic [ref=f18e30]: 
            - text: API Testing
        - listitem [ref=f18e31]:
          - link " Video Tutorials" [ref=f18e32] [cursor=pointer]:
            - /url: https://www.youtube.com/c/AutomationExercise
            - generic [ref=f18e33]: 
            - text: Video Tutorials
        - listitem [ref=f18e34]:
          - link " Contact us" [ref=f18e35] [cursor=pointer]:
            - /url: /contact_us
            - generic [ref=f18e36]: 
            - text: Contact us
  - generic [ref=f18e38]:
    - img "Website for practice" [ref=f18e39]
    - textbox "Search Product" [ref=f18e40]: top
    - button "" [ref=f18e41] [cursor=pointer]
  - generic [ref=f18e45]:
    - generic [ref=f18e47]:
      - heading "Category" [level=2] [ref=f18e48]
      - generic [ref=f18e49]:
        - heading [level=4] [ref=f18e52]:
          - link " Women" [ref=f18e53] [cursor=pointer]:
            - /url: "#Women"
            - generic [ref=f18e54]: 
            - text: Women
        - heading [level=4] [ref=f18e58]:
          - link " Men" [ref=f18e59] [cursor=pointer]:
            - /url: "#Men"
            - generic [ref=f18e60]: 
            - text: Men
        - heading [level=4] [ref=f18e64]:
          - link " Kids" [ref=f18e65] [cursor=pointer]:
            - /url: "#Kids"
            - generic [ref=f18e66]: 
            - text: Kids
      - insertion [ref=f18e69]:
        - generic [ref=f18e72]:
          - heading "These are topics related to the article that might interest you" [level=2] [ref=f18e74]: Discover more
          - link "Casual Apparel" [ref=f18e75] [cursor=pointer]
          - link "Tshirt" [ref=f18e80] [cursor=pointer]
          - link "South Asians & Diaspora" [ref=f18e85] [cursor=pointer]
          - link "Jeans" [ref=f18e90] [cursor=pointer]
          - link "Women's Clothing" [ref=f18e95] [cursor=pointer]
          - link "T SHIRT" [ref=f18e100] [cursor=pointer]
          - link "Dresses" [ref=f18e105] [cursor=pointer]
          - link "Saree" [ref=f18e110] [cursor=pointer]
      - generic [ref=f18e115]:
        - heading "Brands" [level=2] [ref=f18e116]
        - list [ref=f18e118]:
          - listitem [ref=f18e119]:
            - link "(6) Polo" [ref=f18e120] [cursor=pointer]:
              - /url: /brand_products/Polo
              - generic [ref=f18e121]: (6)
              - text: Polo
          - listitem [ref=f18e122]:
            - link "(5) H&M" [ref=f18e123] [cursor=pointer]:
              - /url: /brand_products/H&M
              - generic [ref=f18e124]: (5)
              - text: H&M
          - listitem [ref=f18e125]:
            - link "(5) Madame" [ref=f18e126] [cursor=pointer]:
              - /url: /brand_products/Madame
              - generic [ref=f18e127]: (5)
              - text: Madame
          - listitem [ref=f18e128]:
            - link "(3) Mast & Harbour" [ref=f18e129] [cursor=pointer]:
              - /url: /brand_products/Mast & Harbour
              - generic [ref=f18e130]: (3)
              - text: Mast & Harbour
          - listitem [ref=f18e131]:
            - link "(4) Babyhug" [ref=f18e132] [cursor=pointer]:
              - /url: /brand_products/Babyhug
              - generic [ref=f18e133]: (4)
              - text: Babyhug
          - listitem [ref=f18e134]:
            - link "(3) Allen Solly Junior" [ref=f18e135] [cursor=pointer]:
              - /url: /brand_products/Allen Solly Junior
              - generic [ref=f18e136]: (3)
              - text: Allen Solly Junior
          - listitem [ref=f18e137]:
            - link "(3) Kookie Kids" [ref=f18e138] [cursor=pointer]:
              - /url: /brand_products/Kookie Kids
              - generic [ref=f18e139]: (3)
              - text: Kookie Kids
          - listitem [ref=f18e140]:
            - link "(5) Biba" [ref=f18e141] [cursor=pointer]:
              - /url: /brand_products/Biba
              - generic [ref=f18e142]: (5)
              - text: Biba
    - generic [ref=f18e144]:
      - heading "Searched Products" [level=2] [ref=f18e145]
      - generic [ref=f18e147]:
        - generic [ref=f18e148]:
          - generic [ref=f18e149]:
            - img "ecommerce website products" [ref=f18e150]
            - heading "Rs. 500" [level=2] [ref=f18e151]
            - paragraph [ref=f18e152]: Blue Top
            - generic [ref=f18e153] [cursor=pointer]:
              - generic [ref=f18e154]: 
              - text: Add to cart
          - generic [ref=f18e155]:
            - heading "Rs. 500" [level=2] [ref=f18e156]
            - paragraph [ref=f18e157]: Blue Top
            - generic [ref=f18e158] [cursor=pointer]:
              - generic [ref=f18e159]: 
              - text: Add to cart
        - list [ref=f18e161]:
          - listitem [ref=f18e162]:
            - link " View Product" [ref=f18e163] [cursor=pointer]:
              - /url: /product_details/1
              - generic [ref=f18e164]: 
              - text: View Product
      - generic [ref=f18e166]:
        - generic [ref=f18e167]:
          - generic [ref=f18e168]:
            - img "ecommerce website products" [ref=f18e169]
            - heading "Rs. 600" [level=2] [ref=f18e170]
            - paragraph [ref=f18e171]: Winter Top
            - generic [ref=f18e172] [cursor=pointer]:
              - generic [ref=f18e173]: 
              - text: Add to cart
          - generic [ref=f18e174]:
            - heading "Rs. 600" [level=2] [ref=f18e175]
            - paragraph [ref=f18e176]: Winter Top
            - generic [ref=f18e177] [cursor=pointer]:
              - generic [ref=f18e178]: 
              - text: Add to cart
        - list [ref=f18e180]:
          - listitem [ref=f18e181]:
            - link " View Product" [ref=f18e182] [cursor=pointer]:
              - /url: /product_details/5
              - generic [ref=f18e183]: 
              - text: View Product
      - generic [ref=f18e185]:
        - generic [ref=f18e186]:
          - generic [ref=f18e187]:
            - img "ecommerce website products" [ref=f18e188]
            - heading "Rs. 400" [level=2] [ref=f18e189]
            - paragraph [ref=f18e190]: Summer White Top
            - generic [ref=f18e191] [cursor=pointer]:
              - generic [ref=f18e192]: 
              - text: Add to cart
          - generic [ref=f18e193]:
            - heading "Rs. 400" [level=2] [ref=f18e194]
            - paragraph [ref=f18e195]: Summer White Top
            - generic [ref=f18e196] [cursor=pointer]:
              - generic [ref=f18e197]: 
              - text: Add to cart
        - list [ref=f18e199]:
          - listitem [ref=f18e200]:
            - link " View Product" [ref=f18e201] [cursor=pointer]:
              - /url: /product_details/6
              - generic [ref=f18e202]: 
              - text: View Product
      - generic [ref=f18e204]:
        - generic [ref=f18e205]:
          - generic [ref=f18e206]:
            - img "ecommerce website products" [ref=f18e207]
            - heading "Rs. 1000" [level=2] [ref=f18e208]
            - paragraph [ref=f18e209]: Madame Top For Women
            - generic [ref=f18e210] [cursor=pointer]:
              - generic [ref=f18e211]: 
              - text: Add to cart
          - generic [ref=f18e212]:
            - heading "Rs. 1000" [level=2] [ref=f18e213]
            - paragraph [ref=f18e214]: Madame Top For Women
            - generic [ref=f18e215] [cursor=pointer]:
              - generic [ref=f18e216]: 
              - text: Add to cart
        - list [ref=f18e218]:
          - listitem [ref=f18e219]:
            - link " View Product" [ref=f18e220] [cursor=pointer]:
              - /url: /product_details/7
              - generic [ref=f18e221]: 
              - text: View Product
      - generic [ref=f18e223]:
        - generic [ref=f18e224]:
          - generic [ref=f18e225]:
            - img "ecommerce website products" [ref=f18e226]
            - heading "Rs. 700" [level=2] [ref=f18e227]
            - paragraph [ref=f18e228]: Fancy Green Top
            - generic [ref=f18e229] [cursor=pointer]:
              - generic [ref=f18e230]: 
              - text: Add to cart
          - generic [ref=f18e231]:
            - heading "Rs. 700" [level=2] [ref=f18e232]
            - paragraph [ref=f18e233]: Fancy Green Top
            - generic [ref=f18e234] [cursor=pointer]:
              - generic [ref=f18e235]: 
              - text: Add to cart
        - list [ref=f18e237]:
          - listitem [ref=f18e238]:
            - link " View Product" [ref=f18e239] [cursor=pointer]:
              - /url: /product_details/8
              - generic [ref=f18e240]: 
              - text: View Product
      - generic [ref=f18e242]:
        - generic [ref=f18e243]:
          - generic [ref=f18e244]:
            - img "ecommerce website products" [ref=f18e245]
            - heading "Rs. 499" [level=2] [ref=f18e246]
            - paragraph [ref=f18e247]:
              - text: Sleeves Printed Top - White
              - link "Economics" [ref=f18e248] [cursor=pointer]
            - generic [ref=f18e252] [cursor=pointer]:
              - generic [ref=f18e253]: 
              - text: Add to cart
          - generic [ref=f18e254]:
            - heading "Rs. 499" [level=2] [ref=f18e255]
            - paragraph [ref=f18e256]: Sleeves Printed Top - White
            - generic [ref=f18e257] [cursor=pointer]:
              - generic [ref=f18e258]: 
              - text: Add to cart
        - list [ref=f18e260]:
          - listitem [ref=f18e261]:
            - link " View Product" [ref=f18e262] [cursor=pointer]:
              - /url: /product_details/11
              - generic [ref=f18e263]: 
              - text: View Product
      - generic [ref=f18e265]:
        - generic [ref=f18e266]:
          - generic [ref=f18e267]:
            - img "ecommerce website products" [ref=f18e268]
            - heading "Rs. 359" [level=2] [ref=f18e269]
            - paragraph [ref=f18e270]:
              - text: Half Sleeves Top Schiffli Detailing - Pink
              - link "Apparel" [ref=f18e271] [cursor=pointer]
            - generic [ref=f18e275] [cursor=pointer]:
              - generic [ref=f18e276]: 
              - text: Add to cart
          - generic [ref=f18e277]:
            - heading "Rs. 359" [level=2] [ref=f18e278]
            - paragraph [ref=f18e279]: Half Sleeves Top Schiffli Detailing - Pink
            - generic [ref=f18e280] [cursor=pointer]:
              - generic [ref=f18e281]: 
              - text: Add to cart
        - list [ref=f18e283]:
          - listitem [ref=f18e284]:
            - link " View Product" [ref=f18e285] [cursor=pointer]:
              - /url: /product_details/12
              - generic [ref=f18e286]: 
              - text: View Product
      - generic [ref=f18e288]:
        - generic [ref=f18e289]:
          - generic [ref=f18e290]:
            - img "ecommerce website products" [ref=f18e291]
            - heading "Rs. 278" [level=2] [ref=f18e292]
            - paragraph [ref=f18e293]: Frozen Tops For Kids
            - generic [ref=f18e294] [cursor=pointer]:
              - generic [ref=f18e295]: 
              - text: Add to cart
          - generic [ref=f18e296]:
            - heading "Rs. 278" [level=2] [ref=f18e297]
            - paragraph [ref=f18e298]: Frozen Tops For Kids
            - generic [ref=f18e299] [cursor=pointer]:
              - generic [ref=f18e300]: 
              - text: Add to cart
        - list [ref=f18e302]:
          - listitem [ref=f18e303]:
            - link " View Product" [ref=f18e304] [cursor=pointer]:
              - /url: /product_details/13
              - generic [ref=f18e305]: 
              - text: View Product
      - generic [ref=f18e307]:
        - generic [ref=f18e308]:
          - generic [ref=f18e309]:
            - img "ecommerce website products" [ref=f18e310]
            - heading "Rs. 679" [level=2] [ref=f18e311]
            - paragraph [ref=f18e312]: Full Sleeves Top Cherry - Pink
            - generic [ref=f18e313] [cursor=pointer]:
              - generic [ref=f18e314]: 
              - text: Add to cart
          - generic [ref=f18e315]:
            - heading "Rs. 679" [level=2] [ref=f18e316]
            - paragraph [ref=f18e317]: Full Sleeves Top Cherry - Pink
            - generic [ref=f18e318] [cursor=pointer]:
              - generic [ref=f18e319]: 
              - text: Add to cart
        - list [ref=f18e321]:
          - listitem [ref=f18e322]:
            - link " View Product" [ref=f18e323] [cursor=pointer]:
              - /url: /product_details/14
              - generic [ref=f18e324]: 
              - text: View Product
      - generic [ref=f18e326]:
        - generic [ref=f18e327]:
          - generic [ref=f18e328]:
            - img "ecommerce website products" [ref=f18e329]
            - heading "Rs. 315" [level=2] [ref=f18e330]
            - paragraph [ref=f18e331]: Printed Off Shoulder Top - White
            - generic [ref=f18e332] [cursor=pointer]:
              - generic [ref=f18e333]: 
              - text: Add to cart
          - generic [ref=f18e334]:
            - heading "Rs. 315" [level=2] [ref=f18e335]
            - paragraph [ref=f18e336]: Printed Off Shoulder Top - White
            - generic [ref=f18e337] [cursor=pointer]:
              - generic [ref=f18e338]: 
              - text: Add to cart
        - list [ref=f18e340]:
          - listitem [ref=f18e341]:
            - link " View Product" [ref=f18e342] [cursor=pointer]:
              - /url: /product_details/15
              - generic [ref=f18e343]: 
              - text: View Product
      - generic [ref=f18e345]:
        - generic [ref=f18e346]:
          - generic [ref=f18e347]:
            - img "ecommerce website products" [ref=f18e348]
            - heading "Rs. 478" [level=2] [ref=f18e349]
            - paragraph [ref=f18e350]: Sleeves Top and Short - Blue & Pink
            - generic [ref=f18e351] [cursor=pointer]:
              - generic [ref=f18e352]: 
              - text: Add to cart
          - generic [ref=f18e353]:
            - heading "Rs. 478" [level=2] [ref=f18e354]
            - paragraph [ref=f18e355]: Sleeves Top and Short - Blue & Pink
            - generic [ref=f18e356] [cursor=pointer]:
              - generic [ref=f18e357]: 
              - text: Add to cart
        - list [ref=f18e359]:
          - listitem [ref=f18e360]:
            - link " View Product" [ref=f18e361] [cursor=pointer]:
              - /url: /product_details/16
              - generic [ref=f18e362]: 
              - text: View Product
      - generic [ref=f18e364]:
        - generic [ref=f18e365]:
          - generic [ref=f18e366]:
            - img "ecommerce website products" [ref=f18e367]
            - heading "Rs. 1200" [level=2] [ref=f18e368]
            - paragraph [ref=f18e369]: Little Girls Mr. Panda Shirt
            - generic [ref=f18e370] [cursor=pointer]:
              - generic [ref=f18e371]: 
              - text: Add to cart
          - generic [ref=f18e372]:
            - heading "Rs. 1200" [level=2] [ref=f18e373]
            - paragraph [ref=f18e374]: Little Girls Mr. Panda Shirt
            - generic [ref=f18e375] [cursor=pointer]:
              - generic [ref=f18e376]: 
              - text: Add to cart
        - list [ref=f18e378]:
          - listitem [ref=f18e379]:
            - link " View Product" [ref=f18e380] [cursor=pointer]:
              - /url: /product_details/18
              - generic [ref=f18e381]: 
              - text: View Product
      - generic [ref=f18e383]:
        - generic [ref=f18e384]:
          - generic [ref=f18e385]:
            - img "ecommerce website products" [ref=f18e386]
            - heading "Rs. 849" [level=2] [ref=f18e387]
            - paragraph [ref=f18e388]: Colour Blocked Shirt – Sky Blue
            - generic [ref=f18e389] [cursor=pointer]:
              - generic [ref=f18e390]: 
              - text: Add to cart
          - generic [ref=f18e391]:
            - heading "Rs. 849" [level=2] [ref=f18e392]
            - paragraph [ref=f18e393]: Colour Blocked Shirt – Sky Blue
            - generic [ref=f18e394] [cursor=pointer]:
              - generic [ref=f18e395]: 
              - text: Add to cart
        - list [ref=f18e397]:
          - listitem [ref=f18e398]:
            - link " View Product" [ref=f18e399] [cursor=pointer]:
              - /url: /product_details/24
              - generic [ref=f18e400]: 
              - text: View Product
      - generic [ref=f18e402]:
        - generic [ref=f18e403]:
          - generic [ref=f18e404]:
            - img "ecommerce website products" [ref=f18e405]
            - heading "Rs. 1400" [level=2] [ref=f18e406]
            - paragraph [ref=f18e407]: Lace Top For Women
            - generic [ref=f18e408] [cursor=pointer]:
              - generic [ref=f18e409]: 
              - text: Add to cart
          - generic [ref=f18e410]:
            - heading "Rs. 1400" [level=2] [ref=f18e411]
            - paragraph [ref=f18e412]: Lace Top For Women
            - generic [ref=f18e413] [cursor=pointer]:
              - generic [ref=f18e414]: 
              - text: Add to cart
        - list [ref=f18e416]:
          - listitem [ref=f18e417]:
            - link " View Product" [ref=f18e418] [cursor=pointer]:
              - /url: /product_details/42
              - generic [ref=f18e419]: 
              - text: View Product
  - insertion [ref=f18e421]
  - contentinfo [ref=f18e423]:
    - generic [ref=f18e428]:
      - heading "Subscription" [level=2] [ref=f18e429]
      - generic [ref=f18e430]:
        - textbox "Your email address" [ref=f18e431]
        - button "" [ref=f18e432] [cursor=pointer]
        - paragraph [ref=f18e434]: Get the most recent updates from our site and be updated your self...
    - paragraph [ref=f18e438]: Copyright © 2021 All rights reserved
  - text: 
```

# Test source

```ts
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
  235 |       expect(res.status, '[REQ AC-7] response code 400').toBe(REQ.STATUS.BAD_REQUEST);
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
> 284 |         await expect.poll(() => shownNames(page), { message: `[REQ AC-10] the page shows exactly what the API returns for "${term}"` }).toEqual(names(fromApi));
      |                                                                                                                                         ^ Error: [REQ AC-10] the page shows exactly what the API returns for "top"
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