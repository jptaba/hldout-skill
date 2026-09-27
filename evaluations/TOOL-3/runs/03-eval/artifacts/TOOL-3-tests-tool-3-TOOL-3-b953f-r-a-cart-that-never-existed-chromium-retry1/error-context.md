# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-3\tests\tool-3.spec.ts >> TOOL-3 Shopping cart for guests >> SCN-009.3: a remove product for a cart that never existed
- Location: evaluations\TOOL-3\tests\tool-3.spec.ts:173:5

# Error details

```
Error: [REQ AC-8] a remove product message

expect(received).toBe(expected) // Object.is equality

Expected: "Cart not found"
Received: "Cart doesnt exists"
```

# Test source

```ts
  79  |     await journey.step("Then the response status is 201 with the cart's id", async () => {
  80  |       expect(r.status, '[REQ AC-1] create cart → 201').toBe(REQ.STATUS.CREATED);
  81  |       expect(typeof r.body?.id === 'string' && r.body.id.length > 0, '[REQ AC-1] cart id returned').toBe(true);
  82  |     });
  83  |     await journey.step('And reading the cart lists no products', async () => { expect(await items(api, r.body.id!), '[REQ AC-1] new cart is empty').toEqual([]); });
  84  |   });
  85  | 
  86  |   REQ.QUANTITY_ACCEPTED.forEach((quantity, i) => {
  87  |     test(`SCN-002.${i + 1}: Adding a product with quantity ${quantity}`, { tag: ['@AC-2', '@type:boundary', '@layer:api'] }, async ({ api, journey, seed }) => {
  88  |       let cartId = ''; let product!: Product; let r!: ApiResponse;
  89  |       await journey.step('Given an empty cart and an in-stock product', async () => { product = await inStockProduct(seed, api); cartId = await newCart(seed, api); });
  90  |       await journey.step(`When I add the product with quantity ${quantity}`, async () => { r = await api.post(EP.cart(cartId), { data: { productId: product.id, quantity } }); });
  91  |       await journey.step('Then the response status is 200', async () => { expect(r.status, `[REQ AC-2] add quantity ${quantity} → 200`).toBe(REQ.STATUS.OK); });
  92  |       await journey.step(`And the cart lists the product with quantity ${quantity}`, async () => { expect(quantityOf(await items(api, cartId), product.id), `[REQ AC-2] cart holds quantity ${quantity}`).toEqual([quantity]); });
  93  |     });
  94  |   });
  95  | 
  96  |   test('SCN-003: Adding a product already in the cart increases its quantity', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey, seed }) => {
  97  |     let cartId = ''; let product!: Product;
  98  |     await journey.step('Given a cart holding an in-stock product with quantity 2', async () => { product = await inStockProduct(seed, api); cartId = await cartWith(seed, api, product, 2); });
  99  |     await journey.step('When I add the same product with quantity 3', async () => { await add(api, cartId, product.id, 3); });
  100 |     await journey.step('Then the cart lists the product once with quantity 5', async () => { expect(quantityOf(await items(api, cartId), product.id), '[REQ AC-2] quantities are summed').toEqual([5]); });
  101 |   });
  102 | 
  103 |   REQ.QUANTITY_REJECTED.forEach((quantity, i) => {
  104 |     test(`SCN-004.${i + 1}: A quantity of ${quantity} is rejected`, { tag: ['@AC-3', '@type:boundary', '@layer:api'] }, async ({ api, journey, seed }) => {
  105 |       let cartId = ''; let product!: Product; let r!: ApiResponse<{ errors?: Record<string, unknown> }>;
  106 |       await journey.step('Given a cart holding an in-stock product with quantity 1', async () => { product = await inStockProduct(seed, api); cartId = await cartWith(seed, api, product, 1); });
  107 |       await journey.step(`When I add the product with quantity ${quantity}`, async () => { r = await add(api, cartId, product.id, quantity) as typeof r; });
  108 |       await journey.step('Then the response status is 422 with an error for the quantity field', async () => {
  109 |         expect.soft(r.status, `[REQ AC-3] quantity ${quantity} → 422`).toBe(REQ.STATUS.UNPROCESSABLE);
  110 |         expect.soft(Object.keys(r.body?.errors ?? {}), '[REQ AC-3] error for the quantity field').toContain('quantity');
  111 |       });
  112 |       await journey.step('And the cart is unchanged', async () => { expect.soft(quantityOf(await items(api, cartId), product.id), '[REQ AC-3] cart unchanged').toEqual([1]); });
  113 |     });
  114 |   });
  115 | 
  116 |   test('SCN-005: Adding to the cart from a product page', { tag: ['@AC-4', '@type:functional', '@layer:ui'] }, async ({ page, api, journey, seed }) => {
  117 |     let product!: Product;
  118 |     await journey.step('Given I am on the product page of an in-stock product', async () => { product = await inStockProduct(seed, api); });
  119 |     await journey.step('When I choose quantity 2 and press "Add to cart"', async () => { await addOnProductPage(page, product, 2); });
  120 |     await journey.step('Then I see "Product added to shopping cart."', async () => { await expect(page.getByRole('alert'), '[REQ AC-4] added message').toHaveText(REQ.ADDED_TOAST); });
  121 |     await journey.step('And the cart icon shows 2', async () => { await expect(page.getByTestId('cart-quantity'), '[REQ AC-4] cart icon shows the number of items (G8: sum of quantities)').toHaveText('2'); });
  122 |   });
  123 | 
  124 |   test('SCN-006: The cart page lists quantity, unit price, line total and cart total', { tag: ['@AC-5', '@type:functional', '@layer:ui'] }, async ({ page, api, journey, seed }) => {
  125 |     let product!: Product;
  126 |     await journey.step('Given I added an in-stock product with quantity 3 on its product page', async () => {
  127 |       product = await inStockProduct(seed, api);
  128 |       await addOnProductPage(page, product, 3);
  129 |       await expect(page.getByTestId('cart-quantity')).toHaveText('3');
  130 |     });
  131 |     await journey.step('When I open the cart page', async () => { await gotoPage(page, '/checkout'); await expect(page.getByTestId('product-title').first()).toBeVisible(); }); // hardened: cart rows use product-title / product-price / line-price / cart-total (runs/01-harden)
  132 |     await journey.step('Then the product is listed with quantity 3, its unit price and line total = unit price × 3', async () => {
  133 |       const row = page.getByRole('row').filter({ hasText: product.name });
  134 |       const unit = money(await row.getByTestId('product-price').innerText());
  135 |       const line = money(await row.getByTestId('line-price').innerText());
  136 |       await expect(row.getByTestId('product-quantity'), '[REQ AC-5] quantity listed').toHaveValue('3');
  137 |       expect(unit, '[REQ AC-5] unit price listed').toBeGreaterThan(0);
  138 |       expect(line, `[REQ AC-5] line total = ${unit} × 3`).toBeCloseTo(unit * 3, 2);
  139 |     });
  140 |     await journey.step('And the cart total equals the sum of the line totals', async () => {
  141 |       const lines = (await page.getByTestId('line-price').allInnerTexts()).map(money);
  142 |       const total = money(await page.getByTestId('cart-total').innerText());
  143 |       expect(total, '[REQ AC-5] cart total = sum of line totals (G9)').toBeCloseTo(lines.reduce((a, b) => a + b, 0), 2);
  144 |     });
  145 |   });
  146 | 
  147 |   test('SCN-007: Removing a product from the cart', { tag: ['@AC-6', '@type:functional', '@layer:api'] }, async ({ api, journey, seed }) => {
  148 |     let cartId = ''; let product!: Product; let r!: ApiResponse;
  149 |     await journey.step('Given a cart holding an in-stock product', async () => { product = await inStockProduct(seed, api); cartId = await cartWith(seed, api, product, 1); });
  150 |     await journey.step('When I DELETE the product from the cart', async () => { r = await api.delete(EP.cartProduct(cartId, product.id)); });
  151 |     await journey.step('Then the response status is 204', async () => { expect(r.status, '[REQ AC-6] remove product → 204').toBe(REQ.STATUS.NO_CONTENT); });
  152 |     await journey.step('And the cart no longer lists the product', async () => { expect(quantityOf(await items(api, cartId), product.id), '[REQ AC-6] product removed').toEqual([]); });
  153 |   });
  154 | 
  155 |   test('SCN-008: Deleting a cart is idempotent', { tag: ['@AC-7', '@type:idempotency', '@layer:api'] }, async ({ api, journey, seed }) => {
  156 |     let cartId = ''; let first!: ApiResponse; let second!: ApiResponse;
  157 |     await journey.step('Given a cart', async () => { cartId = await newCart(seed, api); });
  158 |     await journey.step('When I delete the cart', async () => { first = await api.delete(EP.cart(cartId)); });
  159 |     await journey.step('Then the response status is 204', async () => { expect.soft(first.status, '[REQ AC-7] delete cart → 204').toBe(REQ.STATUS.NO_CONTENT); });
  160 |     await journey.step('And deleting the same cart again responds 204', async () => {
  161 |       second = await api.delete(EP.cart(cartId));
  162 |       expect.soft(second.status, '[REQ AC-7] deleting it again → 204 (G7)').toBe(REQ.STATUS.NO_CONTENT);
  163 |     });
  164 |   });
  165 | 
  166 |   const neverExisted = () => `nx${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  167 |   ([
  168 |     ['a read', (api: Api, id: string) => api.get(EP.cart(id))],
  169 |     ['an add product', (api: Api, id: string, p: Product) => add(api, id, p.id, 1)],
  170 |     ['a remove product', (api: Api, id: string, p: Product) => api.delete(EP.cartProduct(id, p.id))],
  171 |     ['a delete cart', (api: Api, id: string) => api.delete(EP.cart(id))],
  172 |   ] as const).forEach(([request, send], i) => {
  173 |     test(`SCN-009.${i + 1}: ${request} for a cart that never existed`, { tag: ['@AC-8', '@type:negative', '@layer:api'] }, async ({ api, journey, seed }) => {
  174 |       let id = ''; let product!: Product; let r!: ApiResponse<{ message?: string }>;
  175 |       await journey.step('Given a cart id that never existed', async () => { id = neverExisted(); product = await inStockProduct(seed, api); });
  176 |       await journey.step(`When I send ${request} for it`, async () => { r = await send(api, id, product) as ApiResponse<{ message?: string }>; });
  177 |       await journey.step('Then the response status is 404 with the message "Cart not found"', async () => {
  178 |         expect.soft(r.status, `[REQ AC-8] ${request} on a missing cart → 404`).toBe(REQ.STATUS.NOT_FOUND);
> 179 |         expect.soft(r.body?.message, `[REQ AC-8] ${request} message`).toBe(REQ.CART_NOT_FOUND);
      |                                                                       ^ Error: [REQ AC-8] a remove product message
  180 |       });
  181 |     });
  182 |   });
  183 | });
  184 | 
```