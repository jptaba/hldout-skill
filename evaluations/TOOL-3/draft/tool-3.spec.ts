/**
 * Held-out acceptance tests for TOOL-3 — "Shopping cart for guests".
 * Written from evaluations/TOOL-3/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Page } from '@playwright/test';
import { test, expect, expectResponse, gotoPage, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from TOOL-3 (never edit during hardening)
const REQ = {
  STATUS: { OK: 200, CREATED: 201, NO_CONTENT: 204, NOT_FOUND: 404, UNPROCESSABLE: 422 },
  QTY_ACCEPTED: [1, 99],
  QTY_REJECTED: [0, 100],
  QTY_FIELD: 'quantity',
  ADD_FIRST: 2, ADD_AGAIN: 3, ADD_TOTAL: 5,
  UI_QTY: 3,
  ADDED_MESSAGE: 'Product added to shopping cart.',
  CART_NOT_FOUND: 'Cart not found',
  CART_QTYS: [2, 3],
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement (# ENDPOINT), plus the seed endpoints (# SEED-ENDPOINT).
const EP = {
  /** POST /carts */ carts: '/carts',
  /** POST /carts/{id} */ cartsById: (id: string | number) => `/carts/${id}`,
  /** DELETE /carts/{id}/product/{productId} */ cartsProductByIdAndProductId: (id: string | number, productId: string | number) => `/carts/${id}/product/${productId}`,
  /** GET /carts/{id} (G1) and DELETE /carts/{id} (G2) */ cart: (id: string | number) => `/carts/${id}`, // TODO(harden) confirm the read and delete calls
  /** GET /products (G3) */ products: '/products', // TODO(harden)
};

type Product = { id: string; name: string; price: number };
type Line = { productId: string; quantity: number };

/** G3: products that are in stock, from the catalogue. */
async function inStockProducts(seed: Seed, api: Api, count: number): Promise<Product[]> {
  return seed.step(`find ${count} in-stock product(s) (GET /products)`, async () => {
    const r = await api.get<{ data: Array<{ id: string; name: string; price: number; in_stock?: boolean; is_rental?: boolean }> }>(EP.products); // TODO(harden) paging / stock field
    expect(r.status, 'catalogue answers (precondition)').toBe(200);
    const list = (r.body.data ?? []).filter((p) => p.in_stock !== false && !p.is_rental);
    expect(list.length, 'enough in-stock products (precondition)').toBeGreaterThanOrEqual(count);
    // pick at random so parallel tests don't all use the same product
    const start = Math.floor(Math.random() * (list.length - count + 1));
    return list.slice(start, start + count).map((p) => ({ id: String(p.id), name: p.name, price: Number(p.price) }));
  });
}

/** G1: the products and quantities a cart lists. */
function linesOf(body: unknown): Line[] {
  const b = body as { cart_items?: Array<{ product_id?: string; quantity?: number }> }; // TODO(harden) cart answer shape
  return (b.cart_items ?? []).map((l) => ({ productId: String(l.product_id), quantity: Number(l.quantity) }));
}

async function readCart(api: Api, id: string): Promise<ApiResponse> {
  return api.get(EP.cart(id));
}

async function deleteCart(api: Api, id: string): Promise<ApiResponse> {
  return api.delete(EP.cart(id));
}

/** Given: a fresh cart (deleted after the test), optionally holding products. */
async function seedCart(seed: Seed, api: Api, items: Array<{ product: Product; quantity: number }> = []): Promise<string> {
  return seed.create(`guest cart${items.length ? ` with ${items.map((i) => `${i.quantity}× ${i.product.name}`).join(', ')}` : ''}`, async () => {
    const r = await api.post<{ id?: string }>(EP.carts);
    expect(r.status, 'create cart (seed)').toBeLessThan(300);
    expect(r.body?.id, 'cart id (seed)').toBeTruthy();
    const id = String(r.body.id);
    for (const it of items) {
      const a = await api.post(EP.cartsById(id), { data: { product_id: it.product.id, quantity: it.quantity } });
      expect(a.status, `add ${it.product.name} (seed)`).toBeLessThan(300);
    }
    return id;
  }, (id) => deleteCart(api, id));
}

/** Given: a cart id that does not exist (G7): create a cart, then delete it. */
async function goneCartId(seed: Seed, api: Api): Promise<string> {
  return seed.step('a cart id that does not exist (create a cart, then delete it)', async () => {
    const r = await api.post<{ id?: string }>(EP.carts);
    expect(r.body?.id, 'cart id (seed)').toBeTruthy();
    const id = String(r.body.id);
    const d = await deleteCart(api, id);
    expect(d.status, 'delete cart (seed)').toBeLessThan(300);
    return id;
  });
}

/** Does the error answer name the quantity field? */
function namesField(body: unknown, field: string): boolean {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  const errs = (b.errors ?? b) as Record<string, unknown>; // TODO(harden) error envelope
  return Object.prototype.hasOwnProperty.call(errs, field);
}

function messageOf(body: unknown): string | undefined {
  return (body as { message?: string } | undefined)?.message; // TODO(harden) message field
}

/** G6: put a guest cart that holds products into the browser. */
async function openWithCart(page: Page, cartId: string): Promise<void> {
  await gotoPage(page, '/');
  await page.evaluate((id) => { localStorage.setItem('cart_id', id); }, cartId); // TODO(harden)
}

/** "€12.50" / "$ 1,234.00" → 12.5 */
const money = (text: string): number => Number((text.match(/-?\d[\d,]*(?:\.\d+)?/)?.[0] ?? 'NaN').replace(/,/g, ''));

test.describe('TOOL-3 Shopping cart for guests', () => {
  test('SCN-001: A guest creates an empty cart', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let res!: ApiResponse<{ id?: string }>;
    await journey.step('Given I am not signed in', async () => { /* the api fixture sends no token */ });
    await journey.step('When I POST /carts', async () => {
      res = await api.post<{ id?: string }>(EP.carts);
      if (res.body?.id) seed.track('cart under test', String(res.body.id), (id) => deleteCart(api, id));
    });
    await journey.step('Then the response status is 201', async () => {
      expectResponse(res, { status: REQ.STATUS.CREATED }, '[REQ AC-1] POST /carts responds 201');
    });
    await journey.step("And the response contains the cart's id", async () => {
      expect(res.body?.id, '[REQ AC-1] POST /carts responds with the cart id').toBeTruthy();
    });
    await journey.step('And reading the cart lists no products', async () => {
      const r = await readCart(api, String(res.body.id));
      expect(r.status, 'read cart (precondition)').toBe(200);
      expect(linesOf(r.body), '[REQ AC-1] POST /carts creates an empty cart').toEqual([]);
    });
  });

  REQ.QTY_ACCEPTED.forEach((quantity, i) => {
    test(`SCN-002.${i + 1}: Adding a product with a quantity on the limits of 1–99 (quantity ${quantity})`, { tag: ['@AC-2', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let id = ''; let product!: Product; let res!: ApiResponse;
      await journey.step('Given I created an empty cart', async () => { id = await seedCart(seed, api); });
      await journey.step('And a product that is in stock', async () => { [product] = await inStockProducts(seed, api, 1); });
      await journey.step(`When I POST /carts/{id} with the product_id and quantity ${quantity}`, async () => {
        res = await api.post(EP.cartsById(id), { data: { product_id: product.id, quantity } });
      });
      await journey.step('Then the response status is 200', async () => {
        expectResponse(res, { status: REQ.STATUS.OK }, `[REQ AC-2] POST /carts/{id} quantity ${quantity} responds 200`);
      });
      await journey.step(`And the cart lists the product with quantity ${quantity}`, async () => {
        const r = await readCart(api, id);
        expect(linesOf(r.body), `[REQ AC-2] POST /carts/{id} adds the product with quantity ${quantity}`).toEqual([{ productId: product.id, quantity }]);
      });
    });
  });

  test('SCN-003: Adding a product already in the cart increases its quantity by the amount added', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let id = ''; let product!: Product;
    await journey.step('Given I created a cart holding 2 of a product that is in stock', async () => {
      [product] = await inStockProducts(seed, api, 1);
      id = await seedCart(seed, api, [{ product, quantity: REQ.ADD_FIRST }]);
    });
    await journey.step('When I POST /carts/{id} with the same product_id and quantity 3', async () => {
      await api.post(EP.cartsById(id), { data: { product_id: product.id, quantity: REQ.ADD_AGAIN } });
    });
    await journey.step('Then the cart lists the product once, with quantity 5', async () => {
      const r = await readCart(api, id);
      expect(linesOf(r.body), '[REQ AC-2] POST /carts/{id} again increases the quantity by the amount added').toEqual([{ productId: product.id, quantity: REQ.ADD_TOTAL }]);
    });
  });

  REQ.QTY_REJECTED.forEach((quantity, i) => {
    test(`SCN-004.${i + 1}: A quantity just outside 1–99 is rejected and the cart is unchanged (quantity ${quantity})`, { tag: ['@AC-3', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let id = ''; let first!: Product; let other!: Product; let res!: ApiResponse;
      await journey.step('Given I created a cart holding 1 of a product that is in stock', async () => {
        [first, other] = await inStockProducts(seed, api, 2);
        id = await seedCart(seed, api, [{ product: first, quantity: 1 }]);
      });
      await journey.step('And another product that is in stock', async () => { expect(other.id, 'second product (precondition)').not.toBe(first.id); });
      await journey.step(`When I POST /carts/{id} with the other product's product_id and quantity ${quantity}`, async () => {
        res = await api.post(EP.cartsById(id), { data: { product_id: other.id, quantity } });
      });
      await journey.step('Then the response status is 422', async () => {
        expectResponse(res, { status: REQ.STATUS.UNPROCESSABLE }, `[REQ AC-3] POST /carts/{id} quantity ${quantity} responds 422`);
      });
      await journey.step('And the response has an error for the quantity field', async () => {
        expect.soft(namesField(res.body, REQ.QTY_FIELD), `[REQ AC-3] POST /carts/{id} quantity ${quantity} has an error for the quantity field`).toBe(true);
      });
      await journey.step('And the cart still lists only the first product, with quantity 1', async () => {
        const r = await readCart(api, id);
        expect(linesOf(r.body), `[REQ AC-3] after POST /carts/{id} quantity ${quantity} the cart is unchanged`).toEqual([{ productId: first.id, quantity: 1 }]);
      });
    });
  });

  // ---- UI -------------------------------------------------------------------------------------------

  async function addFromProductPage(page: Page, journey: { step: <T>(t: string, b: () => Promise<T>) => Promise<T> }, product: Product) {
    await journey.step('And I am on the product page of a product that is in stock', async () => {
      await gotoPage(page, `/product/${product.id}`); // TODO(harden)
      await expect(page.getByRole('heading', { name: product.name }), 'product page shown (precondition)').toBeVisible(); // TODO(harden)
    });
    await journey.step('When I choose quantity 3', async () => {
      await page.getByLabel('Quantity').fill(String(REQ.UI_QTY)); // TODO(harden)
    });
    await journey.step('And I press "Add to cart"', async () => {
      await page.getByRole('button', { name: 'Add to cart' }).click(); // TODO(harden)
    });
  }

  test('SCN-005: Adding a product from its product page shows the confirmation', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let product!: Product;
    await journey.step('Given I am a guest with an empty cart', async () => { [product] = await inStockProducts(seed, api, 1); });
    await addFromProductPage(page, journey, product);
    await journey.step('Then I see "Product added to shopping cart."', async () => {
      await expect(page.getByText(REQ.ADDED_MESSAGE), '[REQ AC-4] confirmation "Product added to shopping cart." shown').toBeVisible(); // TODO(harden)
    });
  });

  test('SCN-006: The cart icon shows the total number of items after adding from the product page', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, api, journey, seed }) => {
    let product!: Product;
    await journey.step('Given I am a guest with an empty cart', async () => { [product] = await inStockProducts(seed, api, 1); });
    await addFromProductPage(page, journey, product);
    await journey.step('Then the cart icon in the navigation shows 3', async () => {
      await expect(page.getByRole('navigation').getByRole('link', { name: /cart/i }), '[REQ AC-4] cart icon shows the total number of items (3)').toHaveText(new RegExp(`\\b${REQ.UI_QTY}\\b`)); // TODO(harden)
    });
  });

  async function givenCartInBrowser(page: Page, api: Api, seed: Seed): Promise<Array<{ product: Product; quantity: number }>> {
    const [a, b] = await inStockProducts(seed, api, 2);
    const items = [{ product: a, quantity: REQ.CART_QTYS[0] }, { product: b, quantity: REQ.CART_QTYS[1] }];
    const id = await seedCart(seed, api, items);
    await seed.step('put the guest cart into the browser', () => openWithCart(page, id));
    return items;
  }

  const cartRow = (page: Page, name: string) => page.getByRole('row').filter({ hasText: name }); // TODO(harden)
  const cartTotal = (page: Page) => page.getByText(/total/i).last(); // TODO(harden)

  test('SCN-007: The cart page lists each product with quantity, unit price and line total', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let items: Array<{ product: Product; quantity: number }> = [];
    await journey.step('Given I am a guest whose cart holds 2 of one in-stock product and 3 of another', async () => { items = await givenCartInBrowser(page, api, seed); });
    await journey.step('When I open the cart page (checkout step 1)', async () => {
      await gotoPage(page, '/checkout'); // TODO(harden)
      await expect(cartRow(page, items[0].product.name), 'cart page shows the cart (precondition)').toBeVisible();
    });
    await journey.step('Then each product is listed with its quantity', async () => {
      for (const it of items) {
        await expect.soft(cartRow(page, it.product.name).getByRole('spinbutton'), `[REQ AC-5] ${it.product.name} listed with quantity ${it.quantity}`).toHaveValue(String(it.quantity)); // TODO(harden)
      }
    });
    await journey.step('And each product is listed with its unit price', async () => {
      for (const it of items) {
        const text = await cartRow(page, it.product.name).getByRole('cell').nth(2).innerText(); // TODO(harden)
        expect.soft(money(text), `[REQ AC-5] ${it.product.name} listed with unit price ${it.product.price}`).toBeCloseTo(it.product.price, 2);
      }
    });
    await journey.step('And each product is listed with its line total, equal to price × quantity', async () => {
      for (const it of items) {
        const text = await cartRow(page, it.product.name).getByRole('cell').nth(3).innerText(); // TODO(harden)
        expect.soft(money(text), `[REQ AC-5] ${it.product.name} line total = price × quantity`).toBeCloseTo(it.product.price * it.quantity, 2);
      }
    });
    await journey.step('And the cart total is shown', async () => {
      await expect(cartTotal(page), '[REQ AC-5] the cart total is shown').toBeVisible();
      expect(Number.isFinite(money(await cartTotal(page).innerText())), '[REQ AC-5] the cart total is an amount').toBe(true);
    });
  });

  test('SCN-008: The cart total equals the sum of the line totals', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, api, journey, seed }) => {
    let items: Array<{ product: Product; quantity: number }> = [];
    await journey.step('Given I am a guest whose cart holds 2 of one in-stock product and 3 of another', async () => { items = await givenCartInBrowser(page, api, seed); });
    await journey.step('When I open the cart page (checkout step 1)', async () => {
      await gotoPage(page, '/checkout'); // TODO(harden)
      await expect(cartRow(page, items[0].product.name), 'cart page shows the cart (precondition)').toBeVisible();
    });
    await journey.step('Then the cart total equals the sum of the line totals', async () => {
      const expected = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
      expect(money(await cartTotal(page).innerText()), '[REQ AC-5] cart total = sum of the line totals').toBeCloseTo(expected, 2);
    });
  });

  // ---- API: remove, delete, not found ---------------------------------------------------------------

  test('SCN-009: Removing a product from the cart', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let id = ''; let a!: Product; let b!: Product; let res!: ApiResponse;
    await journey.step('Given I created a cart holding 1 each of two products that are in stock', async () => {
      [a, b] = await inStockProducts(seed, api, 2);
      id = await seedCart(seed, api, [{ product: a, quantity: 1 }, { product: b, quantity: 1 }]);
    });
    await journey.step('When I DELETE /carts/{id}/product/{productId} for the first product', async () => {
      res = await api.delete(EP.cartsProductByIdAndProductId(id, a.id));
    });
    await journey.step('Then the response status is 204', async () => {
      expectResponse(res, { status: REQ.STATUS.NO_CONTENT }, '[REQ AC-6] DELETE /carts/{id}/product/{productId} responds 204');
    });
    let lines: Line[] = [];
    await journey.step('And the cart no longer lists the first product', async () => {
      lines = linesOf((await readCart(api, id)).body);
      expect.soft(lines.map((l) => l.productId), '[REQ AC-6] after DELETE /carts/{id}/product/{productId} the cart no longer lists it').not.toContain(a.id);
    });
    await journey.step('And the cart still lists the second product', async () => {
      expect(lines.map((l) => l.productId), 'the other product stays (precondition of a targeted removal)').toContain(b.id);
    });
  });

  test('SCN-010: Deleting a cart', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let id = ''; let res!: ApiResponse;
    await journey.step('Given I created an empty cart', async () => { id = await seedCart(seed, api); });
    await journey.step('When I delete the cart', async () => { res = await deleteCart(api, id); });
    await journey.step('Then the response status is 204', async () => {
      expectResponse(res, { status: REQ.STATUS.NO_CONTENT }, '[REQ AC-7] DELETE /carts/{id} responds 204');
    });
  });

  test('SCN-011: Deleting a cart that was already deleted', { tag: ['@AC-7', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let id = ''; let res!: ApiResponse;
    await journey.step('Given I created a cart and deleted it', async () => { id = await goneCartId(seed, api); });
    await journey.step('When I delete the cart again', async () => { res = await deleteCart(api, id); });
    await journey.step('Then the response status is 204', async () => {
      expectResponse(res, { status: REQ.STATUS.NO_CONTENT }, '[REQ AC-7] DELETE /carts/{id} of an already-deleted cart responds 204');
    });
  });

  const MISSING: Array<{ request: string; call: (api: Api, id: string, productId: string) => Promise<ApiResponse> }> = [
    { request: 'add the product (POST /carts/{id})', call: (api, id, pid) => api.post(EP.cartsById(id), { data: { product_id: pid, quantity: 1 } }) },
    { request: 'remove the product (DELETE /carts/{id}/product/{productId})', call: (api, id, pid) => api.delete(EP.cartsProductByIdAndProductId(id, pid)) },
    { request: 'read the cart', call: (api, id) => readCart(api, id) },
  ];

  MISSING.forEach((row, i) => {
    test(`SCN-012.${i + 1}: A request for a cart that does not exist is answered 404 "Cart not found" (${row.request})`, { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let id = ''; let product!: Product; let res!: ApiResponse;
      await journey.step('Given a cart id that does not exist (a cart I created and deleted)', async () => { id = await goneCartId(seed, api); });
      await journey.step('And a product that is in stock', async () => { [product] = await inStockProducts(seed, api, 1); });
      await journey.step(`When I ${row.request} for that cart`, async () => { res = await row.call(api, id, product.id); });
      await journey.step('Then the response status is 404', async () => {
        expectResponse(res, { status: REQ.STATUS.NOT_FOUND }, `[REQ AC-8] ${row.request} of a missing cart responds 404`);
      });
      await journey.step('And the message is "Cart not found"', async () => {
        expect(messageOf(res.body), `[REQ AC-8] ${row.request} of a missing cart says "Cart not found"`).toBe(REQ.CART_NOT_FOUND);
      });
    });
  });

  test('SCN-013: Deleting a cart that does not exist is answered 404 "Cart not found"', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    let id = ''; let res!: ApiResponse;
    await journey.step('Given a cart id that does not exist (a cart I created and deleted)', async () => { id = await goneCartId(seed, api); });
    await journey.step('When I delete that cart', async () => { res = await deleteCart(api, id); });
    await journey.step('Then the response status is 404', async () => {
      expectResponse(res, { status: REQ.STATUS.NOT_FOUND }, '[REQ AC-8] DELETE /carts/{id} of a missing cart responds 404');
    });
    await journey.step('And the message is "Cart not found"', async () => {
      expect(messageOf(res.body), '[REQ AC-8] DELETE /carts/{id} of a missing cart says "Cart not found"').toBe(REQ.CART_NOT_FOUND);
    });
  });

  test('SCN-014: A guest cart from creation to deletion', { tag: ['@AC-1', '@AC-2', '@AC-6', '@AC-7', '@type:composition', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let product!: Product; let id = ''; let res!: ApiResponse;
    await journey.step('Given a product that is in stock', async () => { [product] = await inStockProducts(seed, api, 1); });
    await journey.step('When I POST /carts', async () => {
      const r = await api.post<{ id?: string }>(EP.carts);
      expect(r.body?.id, '[REQ AC-1] POST /carts responds with the cart id').toBeTruthy();
      id = String(r.body.id);
      seed.track('cart under test', id, (c) => deleteCart(api, c));
    });
    await journey.step('And I add 2 of the product to the cart I created', async () => {
      await api.post(EP.cartsById(id), { data: { product_id: product.id, quantity: REQ.ADD_FIRST } });
    });
    await journey.step('Then the cart lists the product with quantity 2', async () => {
      expect(linesOf((await readCart(api, id)).body), '[REQ AC-2] POST /carts/{id} adds the product to the created cart').toEqual([{ productId: product.id, quantity: REQ.ADD_FIRST }]);
    });
    await journey.step('When I remove the product from that cart', async () => {
      await api.delete(EP.cartsProductByIdAndProductId(id, product.id));
    });
    await journey.step('Then that cart lists no products', async () => {
      expect(linesOf((await readCart(api, id)).body), '[REQ AC-6] DELETE /carts/{id}/product/{productId} removes it from the created cart').toEqual([]);
    });
    await journey.step('When I delete that cart', async () => { res = await deleteCart(api, id); });
    await journey.step('Then the response status is 204', async () => {
      expectResponse(res, { status: REQ.STATUS.NO_CONTENT }, '[REQ AC-7] DELETE /carts/{id} of the emptied cart responds 204');
    });
  });
});
