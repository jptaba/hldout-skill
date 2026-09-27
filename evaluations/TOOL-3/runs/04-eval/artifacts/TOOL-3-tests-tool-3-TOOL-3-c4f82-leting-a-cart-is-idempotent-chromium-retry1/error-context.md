# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-3\tests\tool-3.spec.ts >> TOOL-3 Shopping cart for guests >> SCN-008: Deleting a cart is idempotent
- Location: evaluations\TOOL-3\tests\tool-3.spec.ts:156:3

# Error details

```
Error: [REQ AC-7] deleting it again → 204 (G7)

expect(received).toBe(expected) // Object.is equality

Expected: 204
Received: 404
```

# Test source

```ts
  63  | const quantityOf = (xs: Item[], productId: string) => xs.filter((i) => i.product_id === productId).map((i) => i.quantity);
  64  | const money = (s: string) => Number(s.replace(/[^0-9.]/g, ''));
  65  | async function addOnProductPage(page: Page, product: Product, quantity: number) {
  66  |   await gotoPage(page, `/product/${product.id}`);
  67  |   const q = page.getByTestId('quantity');
  68  |   await q.fill(String(quantity));
  69  |   await page.getByTestId('add-to-cart').click();
  70  | }
  71  | 
  72  | test.describe('TOOL-3 Shopping cart for guests', () => {
  73  |   test('SCN-001: Creating a cart', { tag: ['@AC-1', '@type:functional', '@layer:api'] }, async ({ api, journey, seed }) => {
  74  |     let r!: ApiResponse<{ id?: string }>;
  75  |     await journey.step('When I POST /carts', async () => {
  76  |       r = await api.post(EP.carts);
  77  |       if (r.body?.id) seed.track('cart', r.body.id, (id) => deleteCart(api, id));
  78  |     });
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
  90  |       // Repaired (triage 03-eval, SCRIPT_DEFECT): the contract declares product_id, not productId.
  91  |       await journey.step(`When I add the product with quantity ${quantity}`, async () => { r = await api.post(EP.cart(cartId), { data: { product_id: product.id, quantity } }); });
  92  |       await journey.step('Then the response status is 200', async () => { expect(r.status, `[REQ AC-2] add quantity ${quantity} → 200`).toBe(REQ.STATUS.OK); });
  93  |       await journey.step(`And the cart lists the product with quantity ${quantity}`, async () => { expect(quantityOf(await items(api, cartId), product.id), `[REQ AC-2] cart holds quantity ${quantity}`).toEqual([quantity]); });
  94  |     });
  95  |   });
  96  | 
  97  |   test('SCN-003: Adding a product already in the cart increases its quantity', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey, seed }) => {
  98  |     let cartId = ''; let product!: Product;
  99  |     await journey.step('Given a cart holding an in-stock product with quantity 2', async () => { product = await inStockProduct(seed, api); cartId = await cartWith(seed, api, product, 2); });
  100 |     await journey.step('When I add the same product with quantity 3', async () => { await add(api, cartId, product.id, 3); });
  101 |     await journey.step('Then the cart lists the product once with quantity 5', async () => { expect(quantityOf(await items(api, cartId), product.id), '[REQ AC-2] quantities are summed').toEqual([5]); });
  102 |   });
  103 | 
  104 |   REQ.QUANTITY_REJECTED.forEach((quantity, i) => {
  105 |     test(`SCN-004.${i + 1}: A quantity of ${quantity} is rejected`, { tag: ['@AC-3', '@type:boundary', '@layer:api'] }, async ({ api, journey, seed }) => {
  106 |       let cartId = ''; let product!: Product; let r!: ApiResponse<{ errors?: Record<string, unknown> }>;
  107 |       await journey.step('Given a cart holding an in-stock product with quantity 1', async () => { product = await inStockProduct(seed, api); cartId = await cartWith(seed, api, product, 1); });
  108 |       await journey.step(`When I add the product with quantity ${quantity}`, async () => { r = await add(api, cartId, product.id, quantity) as typeof r; });
  109 |       await journey.step('Then the response status is 422 with an error for the quantity field', async () => {
  110 |         expect.soft(r.status, `[REQ AC-3] quantity ${quantity} → 422`).toBe(REQ.STATUS.UNPROCESSABLE);
  111 |         expect.soft(Object.keys(r.body?.errors ?? {}), '[REQ AC-3] error for the quantity field').toContain('quantity');
  112 |       });
  113 |       await journey.step('And the cart is unchanged', async () => { expect.soft(quantityOf(await items(api, cartId), product.id), '[REQ AC-3] cart unchanged').toEqual([1]); });
  114 |     });
  115 |   });
  116 | 
  117 |   test('SCN-005: Adding to the cart from a product page', { tag: ['@AC-4', '@type:functional', '@layer:ui'] }, async ({ page, api, journey, seed }) => {
  118 |     let product!: Product;
  119 |     await journey.step('Given I am on the product page of an in-stock product', async () => { product = await inStockProduct(seed, api); });
  120 |     await journey.step('When I choose quantity 2 and press "Add to cart"', async () => { await addOnProductPage(page, product, 2); });
  121 |     await journey.step('Then I see "Product added to shopping cart."', async () => { await expect(page.getByRole('alert'), '[REQ AC-4] added message').toHaveText(REQ.ADDED_TOAST); });
  122 |     await journey.step('And the cart icon shows 2', async () => { await expect(page.getByTestId('cart-quantity'), '[REQ AC-4] cart icon shows the number of items (G8: sum of quantities)').toHaveText('2'); });
  123 |   });
  124 | 
  125 |   test('SCN-006: The cart page lists quantity, unit price, line total and cart total', { tag: ['@AC-5', '@type:functional', '@layer:ui'] }, async ({ page, api, journey, seed }) => {
  126 |     let product!: Product;
  127 |     await journey.step('Given I added an in-stock product with quantity 3 on its product page', async () => {
  128 |       product = await inStockProduct(seed, api);
  129 |       await addOnProductPage(page, product, 3);
  130 |       await expect(page.getByTestId('cart-quantity')).toHaveText('3');
  131 |     });
  132 |     await journey.step('When I open the cart page', async () => { await gotoPage(page, '/checkout'); await expect(page.getByTestId('product-title').first()).toBeVisible(); }); // hardened: cart rows use product-title / product-price / line-price / cart-total (runs/01-harden)
  133 |     await journey.step('Then the product is listed with quantity 3, its unit price and line total = unit price × 3', async () => {
  134 |       const row = page.getByRole('row').filter({ hasText: product.name });
  135 |       const unit = money(await row.getByTestId('product-price').innerText());
  136 |       const line = money(await row.getByTestId('line-price').innerText());
  137 |       await expect(row.getByTestId('product-quantity'), '[REQ AC-5] quantity listed').toHaveValue('3');
  138 |       expect(unit, '[REQ AC-5] unit price listed').toBeGreaterThan(0);
  139 |       expect(line, `[REQ AC-5] line total = ${unit} × 3`).toBeCloseTo(unit * 3, 2);
  140 |     });
  141 |     await journey.step('And the cart total equals the sum of the line totals', async () => {
  142 |       const lines = (await page.getByTestId('line-price').allInnerTexts()).map(money);
  143 |       const total = money(await page.getByTestId('cart-total').innerText());
  144 |       expect(total, '[REQ AC-5] cart total = sum of line totals (G9)').toBeCloseTo(lines.reduce((a, b) => a + b, 0), 2);
  145 |     });
  146 |   });
  147 | 
  148 |   test('SCN-007: Removing a product from the cart', { tag: ['@AC-6', '@type:functional', '@layer:api'] }, async ({ api, journey, seed }) => {
  149 |     let cartId = ''; let product!: Product; let r!: ApiResponse;
  150 |     await journey.step('Given a cart holding an in-stock product', async () => { product = await inStockProduct(seed, api); cartId = await cartWith(seed, api, product, 1); });
  151 |     await journey.step('When I DELETE the product from the cart', async () => { r = await api.delete(EP.cartProduct(cartId, product.id)); });
  152 |     await journey.step('Then the response status is 204', async () => { expect(r.status, '[REQ AC-6] remove product → 204').toBe(REQ.STATUS.NO_CONTENT); });
  153 |     await journey.step('And the cart no longer lists the product', async () => { expect(quantityOf(await items(api, cartId), product.id), '[REQ AC-6] product removed').toEqual([]); });
  154 |   });
  155 | 
  156 |   test('SCN-008: Deleting a cart is idempotent', { tag: ['@AC-7', '@type:idempotency', '@layer:api'] }, async ({ api, journey, seed }) => {
  157 |     let cartId = ''; let first!: ApiResponse; let second!: ApiResponse;
  158 |     await journey.step('Given a cart', async () => { cartId = await newCart(seed, api); });
  159 |     await journey.step('When I delete the cart', async () => { first = await api.delete(EP.cart(cartId)); });
  160 |     await journey.step('Then the response status is 204', async () => { expect.soft(first.status, '[REQ AC-7] delete cart → 204').toBe(REQ.STATUS.NO_CONTENT); });
  161 |     await journey.step('And deleting the same cart again responds 204', async () => {
  162 |       second = await api.delete(EP.cart(cartId));
> 163 |       expect.soft(second.status, '[REQ AC-7] deleting it again → 204 (G7)').toBe(REQ.STATUS.NO_CONTENT);
      |                                                                             ^ Error: [REQ AC-7] deleting it again → 204 (G7)
  164 |     });
  165 |   });
  166 | 
  167 |   const neverExisted = () => `nx${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  168 |   ([
  169 |     ['a read', (api: Api, id: string) => api.get(EP.cart(id))],
  170 |     ['an add product', (api: Api, id: string, p: Product) => add(api, id, p.id, 1)],
  171 |     ['a remove product', (api: Api, id: string, p: Product) => api.delete(EP.cartProduct(id, p.id))],
  172 |     ['a delete cart', (api: Api, id: string) => api.delete(EP.cart(id))],
  173 |   ] as const).forEach(([request, send], i) => {
  174 |     test(`SCN-009.${i + 1}: ${request} for a cart that never existed`, { tag: ['@AC-8', '@type:negative', '@layer:api'] }, async ({ api, journey, seed }) => {
  175 |       let id = ''; let product!: Product; let r!: ApiResponse<{ message?: string }>;
  176 |       await journey.step('Given a cart id that never existed', async () => { id = neverExisted(); product = await inStockProduct(seed, api); });
  177 |       await journey.step(`When I send ${request} for it`, async () => { r = await send(api, id, product) as ApiResponse<{ message?: string }>; });
  178 |       await journey.step('Then the response status is 404 with the message "Cart not found"', async () => {
  179 |         expect.soft(r.status, `[REQ AC-8] ${request} on a missing cart → 404`).toBe(REQ.STATUS.NOT_FOUND);
  180 |         expect.soft(r.body?.message, `[REQ AC-8] ${request} message`).toBe(REQ.CART_NOT_FOUND);
  181 |       });
  182 |     });
  183 |   });
  184 | });
  185 | 
```