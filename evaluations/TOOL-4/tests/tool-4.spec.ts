/**
 * Held-out acceptance tests for TOOL-4 — "Favourites for signed-in customers".
 * Written from evaluations/TOOL-4/scenarios.feature (requirement + attachments + PO comment only; never from the AUT's code).
 */
import { test, expect, gotoPage, type Api, type ApiResponse, type Seed, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from TOOL-4 (never edit during hardening)
const REQ = {
  STATUS: { CREATED: 201, NO_CONTENT: 204, UNAUTHORIZED: 401, CONFLICT: 409 },
  ADDED_TOAST: 'Product added to your favorites list.',
  FAVORITES_PAGE: 'Favorites',
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement (register / search: contract gaps G3 / G4).
const EP = { favorites: '/favorites', favorite: (id: string) => `/favorites/${id}`, login: '/users/login', register: '/users/register', search: '/products/search' };

interface Product { id: string; name: string; in_stock?: boolean }
interface Favorite { id: string; product_id: string; product?: { name: string } }
interface Customer { email: string; password: string; first_name: string; last_name: string; token: string }

// ---- mechanics -----------------------------------------------------------------------------------
let seq = 0;
async function customer(seed: Seed, api: Api, data: TestData, label = 'signed-in customer'): Promise<Customer> {
  return seed.create(`${label} (register + login; customers cannot be deleted)`, async () => {
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}${++seq}`;
    const c = { first_name: 'Qa', last_name: `Fav${id}`, dob: '1990-01-01', phone: '0612345678', email: `qafav${id}@example.com`, password: data.customerPassword as string,
      address: { street: 'Main 1', city: 'Utrecht', state: 'UT', country: 'NL', postal_code: '1234AB' } };
    expect((await api.post(EP.register, { data: c })).status, 'register (pre-step)').toBe(201);
    const r = await api.post<{ access_token?: string }>(EP.login, { data: { email: c.email, password: c.password } });
    expect(typeof r.body.access_token, 'login token (pre-step)').toBe('string');
    return { ...c, token: r.body.access_token! };
  });
}
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
async function products(seed: Seed, api: Api): Promise<Product[]> {
  return seed.once('toolshop-products-pliers', 'find in-stock products (GET /products/search)', async () => {
    const r = await api.get<{ data: Product[] }>(EP.search, { params: { q: 'pliers' } });
    const ps = r.body.data.filter((p) => p.in_stock !== false);
    expect(ps.length, 'at least two in-stock products (pre-step)').toBeGreaterThanOrEqual(2);
    return ps;
  });
}
async function removeFavorite(api: Api, token: string, id: string) {
  const r = await api.delete(EP.favorite(id), { headers: auth(token) });
  if (![204, 404].includes(r.status)) throw new Error(`cleanup DELETE /favorites/${id} → ${r.status}`);
}
async function favorite(seed: Seed, api: Api, c: Customer, p: Product): Promise<Favorite> {
  return seed.create(`favourite ${p.name}`, async () => {
    const r = await api.post<Favorite>(EP.favorites, { data: { product_id: p.id }, headers: auth(c.token) });
    expect(r.status, 'add favourite (pre-step)').toBe(REQ.STATUS.CREATED);
    return r.body;
  }, (f) => removeFavorite(api, c.token, f.id));
}
const listFor = async (api: Api, token: string) => (await api.get<Favorite[]>(EP.favorites, { headers: auth(token) })).body ?? [];

test.describe('TOOL-4 Favourites for signed-in customers', () => {
  test('SCN-001: A signed-in customer adds a favourite', { tag: ['@AC-1', '@type:functional', '@layer:api'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let p!: Product; let r!: ApiResponse<Favorite>;
    await journey.step('Given I am a signed-in customer and know an in-stock product', async () => { c = await customer(seed, api, data); p = (await products(seed, api))[0]; });
    await journey.step('When I POST the product to /favorites', async () => {
      r = await api.post(EP.favorites, { data: { product_id: p.id }, headers: auth(c.token) });
      if (r.body?.id) seed.track('favourite', r.body.id, (id) => removeFavorite(api, c.token, id));
    });
    await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-1] add favourite → 201').toBe(REQ.STATUS.CREATED); });
    await journey.step('And the favourite has an id and the product id I sent', async () => {
      expect({ hasId: Boolean(r.body?.id), product_id: r.body?.product_id }, '[REQ AC-1] favourite id and product id').toEqual({ hasId: true, product_id: p.id });
    });
  });

  test('SCN-002: Adding the same favourite twice is rejected with 409', { tag: ['@AC-2', '@type:negative', '@layer:api'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let p!: Product; let r!: ApiResponse;
    await journey.step('Given I am a signed-in customer with the product in my favourites', async () => { c = await customer(seed, api, data); p = (await products(seed, api))[0]; await favorite(seed, api, c, p); });
    await journey.step('When I POST the same product to /favorites again', async () => { r = await api.post(EP.favorites, { data: { product_id: p.id }, headers: auth(c.token) }); });
    await journey.step('Then the response status is 409', async () => { expect.soft(r.status, '[REQ AC-2] duplicate → 409 (G1)').toBe(REQ.STATUS.CONFLICT); });
    await journey.step('And GET /favorites contains the product once', async () => {
      expect.soft((await listFor(api, c.token)).filter((f) => f.product_id === p.id).length, '[REQ AC-2] listed once').toBe(1);
    });
  });

  test('SCN-003: A customer sees only their own favourites', { tag: ['@AC-3', '@type:security', '@layer:api'] }, async ({ api, journey, data, seed }) => {
    let other!: Customer; let me!: Customer; let mine!: Favorite; let theirs!: Favorite; let list: Favorite[] = [];
    await journey.step('Given another customer has a favourite product', async () => { other = await customer(seed, api, data, 'other customer'); theirs = await favorite(seed, api, other, (await products(seed, api))[1]); });
    await journey.step('And I am a signed-in customer with a different favourite', async () => { me = await customer(seed, api, data); mine = await favorite(seed, api, me, (await products(seed, api))[0]); });
    await journey.step('When I GET /favorites', async () => { list = await listFor(api, me.token); });
    await journey.step('Then my favourite is listed', async () => { expect(list.map((f) => f.id), '[REQ AC-3] own favourite listed').toContain(mine.id); });
    await journey.step("And the other customer's favourite is not", async () => { expect(list.map((f) => f.id), "[REQ AC-3] another customer's favourite never included").not.toContain(theirs.id); });
  });

  const requests = [['POST /favorites', 'POST'], ['GET /favorites', 'GET'], ['DELETE /favorites/{id}', 'DELETE']] as const;
  const credentials = [['no token', {}], ['an invalid token', { Authorization: 'Bearer not-a-valid-token' }]] as const;
  credentials.forEach(([cred, headers], ci) => requests.forEach(([request, method], ri) => {
    test(`SCN-004.${ci * 3 + ri + 1}: ${request} with ${cred} is refused with 401`, { tag: ['@AC-4', '@type:security', '@layer:api'] }, async ({ api, journey, seed }) => {
      let r!: ApiResponse;
      await journey.step(`When I send ${request} with ${cred}`, async () => {
        const productId = (await products(seed, api))[0].id;
        r = method === 'POST' ? await api.post(EP.favorites, { data: { product_id: productId }, headers })
          : method === 'GET' ? await api.get(EP.favorites, { headers })
          : await api.delete(EP.favorite('01jnonexistentfavorite00'), { headers });
      });
      await journey.step('Then the response status is 401', async () => { expect(r.status, `[REQ AC-4] ${request} with ${cred} → 401`).toBe(REQ.STATUS.UNAUTHORIZED); });
    });
  }));

  test('SCN-005: Adding a favourite on the web shop', { tag: ['@AC-5', '@type:integration', '@layer:e2e'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer; let p!: Product;
    await journey.step('Given I am signed in on the web shop as a registered customer', async () => {
      c = await customer(seed, api, data);
      await seed.step('sign in on the web shop', async () => {
        await gotoPage(page, '/auth/login');
        await page.getByTestId('email').fill(c.email);
        await page.getByTestId('password').fill(c.password);
        await page.getByTestId('login-submit').click();
        await expect(page.getByTestId('page-title')).toBeVisible();
      });
    });
    await journey.step('And I am on the product page of an in-stock product', async () => { p = (await products(seed, api))[0]; await gotoPage(page, `/product/${p.id}`); });
    await journey.step('When I click "Add to favourites"', async () => {
      await page.getByTestId('add-to-favorites').click();
      seed.track('favourites added in the UI', c.token, async (token) => { for (const f of await listFor(api, token)) await removeFavorite(api, token, f.id); });
    });
    await journey.step('Then I see "Product added to your favorites list."', async () => { await expect(page.getByRole('alert'), '[REQ AC-5] added message').toHaveText(REQ.ADDED_TOAST); });
    await journey.step('And the product appears on the Favorites page of my account', async () => {
      await gotoPage(page, '/account/favorites');
      await expect(page.getByTestId('page-title')).toHaveText(REQ.FAVORITES_PAGE);
      await expect(page.getByTestId('product-name'), '[REQ AC-5] product on the Favorites page').toContainText([p.name]);
    });
  });

  test('SCN-006: Removing a favourite', { tag: ['@AC-6', '@type:functional', '@layer:api'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let f!: Favorite; let r!: ApiResponse;
    await journey.step('Given I am a signed-in customer with the product in my favourites', async () => { c = await customer(seed, api, data); f = await favorite(seed, api, c, (await products(seed, api))[0]); });
    await journey.step('When I DELETE the favourite', async () => { r = await api.delete(EP.favorite(f.id), { headers: auth(c.token) }); });
    await journey.step('Then the response status is 204', async () => { expect(r.status, '[REQ AC-6] remove favourite → 204').toBe(REQ.STATUS.NO_CONTENT); });
    await journey.step('And GET /favorites no longer contains it', async () => { expect((await listFor(api, c.token)).map((x) => x.id), '[REQ AC-6] favourite gone').not.toContain(f.id); });
  });
});
