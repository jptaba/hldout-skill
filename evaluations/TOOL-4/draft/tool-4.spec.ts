/**
 * Held-out acceptance tests for TOOL-4 — "Favourites for signed-in customers".
 * Written from evaluations/TOOL-4/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import { test, expect, expectResponse, gotoPage, signIn, type Account, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from TOOL-4 (never edit during hardening)
const REQ = {
  STATUS: { CREATED: 201, NO_CONTENT: 204, UNAUTHORIZED: 401, CONFLICT: 409 },
  ADDED_MESSAGE: 'Product added to your favorites list.',
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = { favorites: '/favorites', favorite: (id: string) => `/favorites/${id}` };

interface Favourite { id: string; product_id: string }
interface Product { id: string; name: string }

/** Existing products to favourite (the catalogue is public and not changed by these tests). */
async function products(api: Api, seed: Seed, n: number): Promise<Product[]> {
  return seed.step(`find ${n} product(s)`, async () => {
    const list = ((await api.get<{ data: Product[] }>('/products')).body.data ?? []).slice(0, n); // TODO(harden)
    expect(list.length, 'enough products in the catalogue (precondition)').toBe(n);
    return list;
  });
}
/** A favourite of this customer, removed after the test. */
async function favourite(api: Api, seed: Seed, me: Account, productId: string): Promise<Favourite> {
  return seed.create('favourite', async () => {
    const res = await api.post<Favourite>(EP.favorites, { headers: me.headers, data: { product_id: productId } });
    expect(res.status, 'add favourite (seed)').toBe(REQ.STATUS.CREATED);
    return res.body;
  }, (f) => api.delete(EP.favorite(f.id), { headers: me.headers }));
}
const listOf = async (api: Api, me: Account) => (await api.get<Favourite[]>(EP.favorites, { headers: me.headers })).body ?? [];

test.describe('TOOL-4 Favourites for signed-in customers', () => {
  test('SCN-001: A customer adds a product to favourites', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let p!: Product; let res!: ApiResponse<Favourite>;
    await journey.step('Given I am a signed-in customer and know an existing product', async () => { me = await seed.account(); [p] = await products(api, seed, 1); });
    await journey.step('When I POST /favorites with that product_id', async () => {
      res = await api.post(EP.favorites, { headers: me.headers, data: { product_id: p.id } });
      if (res.status === REQ.STATUS.CREATED) seed.track('favourite added by the scenario', res.body, (f) => api.delete(EP.favorite(f.id), { headers: me.headers }));
    });
    await journey.step('Then the answer is 201 with the favourite\'s id and the product id', async () => {
      expect.soft(res.status, '[REQ AC-1] POST /favorites → 201').toBe(REQ.STATUS.CREATED);
      expect.soft(typeof res.body?.id, '[REQ AC-1] POST /favorites answers the favourite\'s id').toBe('string');
      expect.soft(res.body?.product_id, '[REQ AC-1] POST /favorites answers the product id').toBe(p.id);
    });
  });

  test('SCN-002: Adding a product that is already a favourite is refused', { tag: ['@AC-2', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let p!: Product; let res!: ApiResponse;
    await journey.step('Given I am a signed-in customer with a product in my favourites', async () => { me = await seed.account(); [p] = await products(api, seed, 1); await favourite(api, seed, me, p.id); });
    await journey.step('When I POST /favorites with the same product_id again', async () => { res = await api.post(EP.favorites, { headers: me.headers, data: { product_id: p.id } }); });
    await journey.step('Then the answer is 409', async () => {
      expectResponse(res, { status: REQ.STATUS.CONFLICT }, '[REQ AC-2] POST /favorites duplicate');
    });
    await journey.step('And GET /favorites contains that product exactly once', async () => {
      expect((await listOf(api, me)).filter((f) => f.product_id === p.id), '[REQ AC-2] GET /favorites lists the product once').toHaveLength(1);
    });
  });

  test('SCN-003: Each customer sees only their own favourites', { tag: ['@AC-3', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let a!: Account; let b!: Account; let fa!: Favourite; let fb!: Favourite; let listA!: Favourite[]; let listB!: Favourite[];
    await journey.step('Given customer A has favourited one product and customer B another', async () => {
      const [p1, p2] = await products(api, seed, 2);
      a = await seed.account('customer A'); b = await seed.account('customer B');
      fa = await favourite(api, seed, a, p1.id); fb = await favourite(api, seed, b, p2.id);
    });
    await journey.step('When each of them requests GET /favorites', async () => { listA = await listOf(api, a); listB = await listOf(api, b); });
    await journey.step('Then A\'s list has A\'s favourite and not B\'s', async () => {
      expect.soft(listA.map((f) => f.id), '[REQ AC-3] GET /favorites for A lists A\'s favourite').toContain(fa.id);
      expect.soft(listA.map((f) => f.id), '[REQ AC-3] GET /favorites for A never lists B\'s favourite').not.toContain(fb.id);
    });
    await journey.step('And B\'s list has B\'s favourite and not A\'s', async () => {
      expect.soft(listB.map((f) => f.id), '[REQ AC-3] GET /favorites for B lists B\'s favourite').toContain(fb.id);
      expect.soft(listB.map((f) => f.id), '[REQ AC-3] GET /favorites for B never lists A\'s favourite').not.toContain(fa.id);
    });
  });

  const CALLS: { call: string; credential: string; send: (api: Api, headers: Record<string, string>, p: Product, f: Favourite) => Promise<ApiResponse> }[] = [
    ...(['without a token', 'with an invalid token'] as const).flatMap((credential) => [
      { call: 'POST /favorites', credential, send: (api: Api, h: Record<string, string>, p: Product) => api.post(EP.favorites, { headers: h, data: { product_id: p.id } }) },
      { call: 'GET /favorites', credential, send: (api: Api, h: Record<string, string>) => api.get(EP.favorites, { headers: h }) },
      { call: 'DELETE /favorites/{favoriteId}', credential, send: (api: Api, h: Record<string, string>, _p: Product, f: Favourite) => api.delete(EP.favorite(f.id), { headers: h }) },
    ]),
  ];
  CALLS.forEach((row, i) => {
    test(`SCN-004.${i + 1}: The favourites endpoints refuse calls without a valid token (${row.call} ${row.credential})`, { tag: ['@AC-4', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let me!: Account; let p!: Product; let f!: Favourite; let res!: ApiResponse;
      await journey.step('Given a customer has a favourite', async () => { me = await seed.account(); [p] = await products(api, seed, 1); f = await favourite(api, seed, me, p.id); });
      await journey.step(`When a client sends ${row.call} ${row.credential}`, async () => {
        const headers: Record<string, string> = row.credential === 'without a token' ? {} : { Authorization: `Bearer ${me.token!.slice(0, -6)}xxxxxx` };
        res = await row.send(api, headers, p, f);
      });
      await journey.step('Then the answer is 401', async () => {
        expectResponse(res, { status: REQ.STATUS.UNAUTHORIZED }, `[REQ AC-4] ${row.call} ${row.credential}`);
      });
    });
  });

  test('SCN-005: Adding to favourites in the web shop', { tag: ['@AC-5', '@type:integration', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let p!: Product;
    await journey.step('Given I am a signed-in customer on a product page', async () => {
      me = await seed.account(); [p] = await products(api, seed, 1);
      await signIn(page, me);
      await gotoPage(page, `/product/${p.id}`); // TODO(harden)
    });
    await journey.step('When I click "Add to favourites"', async () => {
      await page.getByTestId('add-to-favorites').click(); // TODO(harden)
      // Whatever the page does, the favourite it creates is removed after the test.
      await me.refresh();
      const added = await seed.step('find the favourite the web shop added', async () => (await listOf(api, me)).find((x) => x.product_id === p.id));
      if (added) seed.track('favourite added in the web shop', added, (x) => api.delete(EP.favorite(x.id), { headers: me.headers }));
    });
    await journey.step('Then I see "Product added to your favorites list."', async () => {
      await expect(page.getByText(REQ.ADDED_MESSAGE), '[REQ AC-5] "Product added to your favorites list." is shown').toBeVisible();
    });
    await journey.step('And the product appears on the "Favorites" page of my account', async () => {
      await gotoPage(page, '/account/favorites'); // TODO(harden)
      await expect(page.getByText(p.name, { exact: true }), '[REQ AC-5] the product is on the Favorites page').toBeVisible();
    });
  });

  test('SCN-006: Removing a favourite', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let f!: Favourite; let res!: ApiResponse;
    await journey.step('Given I am a signed-in customer with a product in my favourites', async () => { me = await seed.account(); const [p] = await products(api, seed, 1); f = await favourite(api, seed, me, p.id); });
    await journey.step('When I DELETE /favorites/{favoriteId}', async () => { res = await api.delete(EP.favorite(f.id), { headers: me.headers }); });
    await journey.step('Then the answer is 204', async () => {
      expectResponse(res, { status: REQ.STATUS.NO_CONTENT }, '[REQ AC-6] DELETE /favorites/{favoriteId}');
    });
    await journey.step('And GET /favorites no longer contains it', async () => {
      expect((await listOf(api, me)).map((x) => x.id), '[REQ AC-6] GET /favorites no longer lists the removed favourite').not.toContain(f.id);
    });
  });
});
