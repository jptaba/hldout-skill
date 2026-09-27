/**
 * Held-out acceptance tests for TOOL-3 — "Shopping cart for guests".
 * Written from evaluations/TOOL-3/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import { test, expect, gotoPage, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';
import type { Page } from '@playwright/test';

// @req-constants-start — expected outcomes copied verbatim from TOOL-3 (never edit during hardening)
const REQ = {
  STATUS: { OK: 200, CREATED: 201, NO_CONTENT: 204, NOT_FOUND: 404, UNPROCESSABLE: 422 },
  QUANTITY_ACCEPTED: [1, 99],
  QUANTITY_REJECTED: [0, 100],
  ADDED_TOAST: 'Product added to shopping cart.',
  CART_NOT_FOUND: 'Cart not found',
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement (G2/G3: GET and DELETE /carts/{id} from the API docs).
const EP = {
  carts: '/carts',
  cart: (id: string) => `/carts/${id}`,
  cartProduct: (id: string, productId: string) => `/carts/${id}/product/${productId}`,
  search: '/products/search',
};

interface Item { quantity: number; product_id: string; product?: { name: string; price: number } }
interface Cart { id: string; cart_items?: Item[] }
interface Product { id: string; name: string; price: number; in_stock?: boolean }

// ---- mechanics -----------------------------------------------------------------------------------
// G4: validation errors come back as JSON only with Accept: application/json — the api fixture always sends it.
async function inStockProduct(seed: Seed, api: Api): Promise<Product> {
  return seed.once('toolshop-in-stock-product', 'find an in-stock product (GET /products/search)', async () => {
    const r = await api.get<{ data: Product[] }>(EP.search, { params: { q: 'pliers' } });
    expect(r.status, 'product search (pre-step)').toBe(REQ.STATUS.OK);
    const p = r.body.data.find((x) => x.in_stock !== false);
    expect(p, 'an in-stock product exists (pre-step)').toBeTruthy();
    return p!;
  });
}
async function deleteCart(api: Api, id: string) {
  const r = await api.delete(EP.cart(id));
  if (![REQ.STATUS.NO_CONTENT, REQ.STATUS.NOT_FOUND].includes(r.status as never)) throw new Error(`cleanup DELETE /carts/${id} → ${r.status}`);
}
async function newCart(seed: Seed, api: Api, label = 'empty cart (POST /carts)'): Promise<string> {
  return seed.create(label, async () => {
    const r = await api.post<{ id?: string }>(EP.carts);
    expect(r.status, 'create cart (pre-step)').toBe(REQ.STATUS.CREATED);
    expect(typeof r.body?.id, 'cart id (pre-step)').toBe('string');
    return r.body.id!;
  }, (id) => deleteCart(api, id));
}
const add = (api: Api, cartId: string, productId: string, quantity: number) => api.post(EP.cart(cartId), { data: { product_id: productId, quantity } });
async function cartWith(seed: Seed, api: Api, product: Product, quantity: number): Promise<string> {
  const id = await newCart(seed, api);
  await seed.step(`add the product with quantity ${quantity}`, async () => { expect((await add(api, id, product.id, quantity)).status, 'add (pre-step)').toBe(REQ.STATUS.OK); });
  return id;
}
async function items(api: Api, cartId: string): Promise<Item[]> {
  const r = await api.get<Cart>(EP.cart(cartId));
  return r.body?.cart_items ?? [];
}
const quantityOf = (xs: Item[], productId: string) => xs.filter((i) => i.product_id === productId).map((i) => i.quantity);
const money = (s: string) => Number(s.replace(/[^0-9.]/g, ''));
async function addOnProductPage(page: Page, product: Product, quantity: number) {
  await gotoPage(page, `/product/${product.id}`);
  const q = page.getByTestId('quantity');
  await q.fill(String(quantity));
  await page.getByTestId('add-to-cart').click();
}

test.describe('TOOL-3 Shopping cart for guests', () => {
  test('SCN-001: Creating a cart', { tag: ['@AC-1', '@type:functional', '@layer:api'] }, async ({ api, journey, seed }) => {
    let r!: ApiResponse<{ id?: string }>;
    await journey.step('When I POST /carts', async () => {
      r = await api.post(EP.carts);
      if (r.body?.id) seed.track('cart', r.body.id, (id) => deleteCart(api, id));
    });
    await journey.step("Then the response status is 201 with the cart's id", async () => {
      expect(r.status, '[REQ AC-1] create cart → 201').toBe(REQ.STATUS.CREATED);
      expect(typeof r.body?.id === 'string' && r.body.id.length > 0, '[REQ AC-1] cart id returned').toBe(true);
    });
    await journey.step('And reading the cart lists no products', async () => { expect(await items(api, r.body.id!), '[REQ AC-1] new cart is empty').toEqual([]); });
  });

  REQ.QUANTITY_ACCEPTED.forEach((quantity, i) => {
    test(`SCN-002.${i + 1}: Adding a product with quantity ${quantity}`, { tag: ['@AC-2', '@type:boundary', '@layer:api'] }, async ({ api, journey, seed }) => {
      let cartId = ''; let product!: Product; let r!: ApiResponse;
      await journey.step('Given an empty cart and an in-stock product', async () => { product = await inStockProduct(seed, api); cartId = await newCart(seed, api); });
      await journey.step(`When I add the product with quantity ${quantity}`, async () => { r = await api.post(EP.cart(cartId), { data: { productId: product.id, quantity } }); });
      await journey.step('Then the response status is 200', async () => { expect(r.status, `[REQ AC-2] add quantity ${quantity} → 200`).toBe(REQ.STATUS.OK); });
      await journey.step(`And the cart lists the product with quantity ${quantity}`, async () => { expect(quantityOf(await items(api, cartId), product.id), `[REQ AC-2] cart holds quantity ${quantity}`).toEqual([quantity]); });
    });
  });

  test('SCN-003: Adding a product already in the cart increases its quantity', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey, seed }) => {
    let cartId = ''; let product!: Product;
    await journey.step('Given a cart holding an in-stock product with quantity 2', async () => { product = await inStockProduct(seed, api); cartId = await cartWith(seed, api, product, 2); });
    await journey.step('When I add the same product with quantity 3', async () => { await add(api, cartId, product.id, 3); });
    await journey.step('Then the cart lists the product once with quantity 5', async () => { expect(quantityOf(await items(api, cartId), product.id), '[REQ AC-2] quantities are summed').toEqual([5]); });
  });

  REQ.QUANTITY_REJECTED.forEach((quantity, i) => {
    test(`SCN-004.${i + 1}: A quantity of ${quantity} is rejected`, { tag: ['@AC-3', '@type:boundary', '@layer:api'] }, async ({ api, journey, seed }) => {
      let cartId = ''; let product!: Product; let r!: ApiResponse<{ errors?: Record<string, unknown> }>;
      await journey.step('Given a cart holding an in-stock product with quantity 1', async () => { product = await inStockProduct(seed, api); cartId = await cartWith(seed, api, product, 1); });
      await journey.step(`When I add the product with quantity ${quantity}`, async () => { r = await add(api, cartId, product.id, quantity); });
      await journey.step('Then the response status is 422 with an error for the quantity field', async () => {
        expect.soft(r.status, `[REQ AC-3] quantity ${quantity} → 422`).toBe(REQ.STATUS.UNPROCESSABLE);
        expect.soft(Object.keys(r.body?.errors ?? {}), '[REQ AC-3] error for the quantity field').toContain('quantity');
      });
      await journey.step('And the cart is unchanged', async () => { expect.soft(quantityOf(await items(api, cartId), product.id), '[REQ AC-3] cart unchanged').toEqual([1]); });
    });
  });

  test('SCN-005: Adding to the cart from a product page', { tag: ['@AC-4', '@type:functional', '@layer:ui'] }, async ({ page, api, journey, seed }) => {
    let product!: Product;
    await journey.step('Given I am on the product page of an in-stock product', async () => { product = await inStockProduct(seed, api); });
    await journey.step('When I choose quantity 2 and press "Add to cart"', async () => { await addOnProductPage(page, product, 2); });
    await journey.step('Then I see "Product added to shopping cart."', async () => { await expect(page.getByRole('alert'), '[REQ AC-4] added message').toHaveText(REQ.ADDED_TOAST); });
    await journey.step('And the cart icon shows 2', async () => { await expect(page.getByTestId('cart-quantity'), '[REQ AC-4] cart icon shows the number of items (G8: sum of quantities)').toHaveText('2'); });
  });

  test('SCN-006: The cart page lists quantity, unit price, line total and cart total', { tag: ['@AC-5', '@type:functional', '@layer:ui'] }, async ({ page, api, journey, seed }) => {
    let product!: Product;
    await journey.step('Given I added an in-stock product with quantity 3 on its product page', async () => {
      product = await inStockProduct(seed, api);
      await addOnProductPage(page, product, 3);
      await expect(page.getByTestId('cart-quantity')).toHaveText('3');
    });
    await journey.step('When I open the cart page', async () => { await gotoPage(page, '/checkout'); await expect(page.getByTestId('product-title').first()).toBeVisible(); }); // TODO(harden) cart row test ids
    await journey.step('Then the product is listed with quantity 3, its unit price and line total = unit price × 3', async () => {
      const row = page.getByRole('row').filter({ hasText: product.name });
      const unit = money(await row.getByTestId('product-price').innerText());
      const line = money(await row.getByTestId('line-price').innerText());
      await expect(row.getByTestId('product-quantity'), '[REQ AC-5] quantity listed').toHaveValue('3');
      expect(unit, '[REQ AC-5] unit price listed').toBeGreaterThan(0);
      expect(line, `[REQ AC-5] line total = ${unit} × 3`).toBeCloseTo(unit * 3, 2);
    });
    await journey.step('And the cart total equals the sum of the line totals', async () => {
      const lines = (await page.getByTestId('line-price').allInnerTexts()).map(money);
      const total = money(await page.getByTestId('cart-total').innerText());
      expect(total, '[REQ AC-5] cart total = sum of line totals (G9)').toBeCloseTo(lines.reduce((a, b) => a + b, 0), 2);
    });
  });

  test('SCN-007: Removing a product from the cart', { tag: ['@AC-6', '@type:functional', '@layer:api'] }, async ({ api, journey, seed }) => {
    let cartId = ''; let product!: Product; let r!: ApiResponse;
    await journey.step('Given a cart holding an in-stock product', async () => { product = await inStockProduct(seed, api); cartId = await cartWith(seed, api, product, 1); });
    await journey.step('When I DELETE the product from the cart', async () => { r = await api.delete(EP.cartProduct(cartId, product.id)); });
    await journey.step('Then the response status is 204', async () => { expect(r.status, '[REQ AC-6] remove product → 204').toBe(REQ.STATUS.NO_CONTENT); });
    await journey.step('And the cart no longer lists the product', async () => { expect(quantityOf(await items(api, cartId), product.id), '[REQ AC-6] product removed').toEqual([]); });
  });

  test('SCN-008: Deleting a cart is idempotent', { tag: ['@AC-7', '@type:idempotency', '@layer:api'] }, async ({ api, journey, seed }) => {
    let cartId = ''; let first!: ApiResponse; let second!: ApiResponse;
    await journey.step('Given a cart', async () => { cartId = await newCart(seed, api); });
    await journey.step('When I delete the cart', async () => { first = await api.delete(EP.cart(cartId)); });
    await journey.step('Then the response status is 204', async () => { expect.soft(first.status, '[REQ AC-7] delete cart → 204').toBe(REQ.STATUS.NO_CONTENT); });
    await journey.step('And deleting the same cart again responds 204', async () => {
      second = await api.delete(EP.cart(cartId));
      expect.soft(second.status, '[REQ AC-7] deleting it again → 204 (G7)').toBe(REQ.STATUS.NO_CONTENT);
    });
  });

  const neverExisted = () => `nx${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  ([
    ['a read', (api: Api, id: string) => api.get(EP.cart(id))],
    ['an add product', (api: Api, id: string, p: Product) => add(api, id, p.id, 1)],
    ['a remove product', (api: Api, id: string, p: Product) => api.delete(EP.cartProduct(id, p.id))],
    ['a delete cart', (api: Api, id: string) => api.delete(EP.cart(id))],
  ] as const).forEach(([request, send], i) => {
    test(`SCN-009.${i + 1}: ${request} for a cart that never existed`, { tag: ['@AC-8', '@type:negative', '@layer:api'] }, async ({ api, journey, seed }) => {
      let id = ''; let product!: Product; let r!: ApiResponse<{ message?: string }>;
      await journey.step('Given a cart id that never existed', async () => { id = neverExisted(); product = await inStockProduct(seed, api); });
      await journey.step(`When I send ${request} for it`, async () => { r = await send(api, id, product) as ApiResponse<{ message?: string }>; });
      await journey.step('Then the response status is 404 with the message "Cart not found"', async () => {
        expect.soft(r.status, `[REQ AC-8] ${request} on a missing cart → 404`).toBe(REQ.STATUS.NOT_FOUND);
        expect.soft(r.body?.message, `[REQ AC-8] ${request} message`).toBe(REQ.CART_NOT_FOUND);
      });
    });
  });
});
