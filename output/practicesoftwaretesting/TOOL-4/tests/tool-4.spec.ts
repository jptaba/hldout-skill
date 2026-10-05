/**
 * Held-out acceptance tests for TOOL-4 — "Favourites for signed-in customers".
 * Written from requirement-contract.json (the requirement only; never from the AUT's code). The steps call the
 * actions in actions/practicesoftwaretesting/ (npm run heldout -- actions TOOL-4); every expectation stays here.
 */
import { test, expect, expectResponse, signIn, type Account, type Api, type ApiResponse, type Seed } from '../../../../heldout-support/fixtures';
import { pickCatalogueProducts } from '../../../../actions/practicesoftwaretesting/api/products/pick-catalogue-products';
import { addFavourite } from '../../../../actions/practicesoftwaretesting/api/favorites/add-favourite';
import { deleteFavourite, favouriteIdOf, favouritesIn, productIdOf } from '../../../../actions/practicesoftwaretesting/api/favorites/_shared';
import { openProductPage } from '../../../../actions/practicesoftwaretesting/ui/product/open-product-page';
import { clickAddToFavourites } from '../../../../actions/practicesoftwaretesting/ui/product/click-add-to-favourites';
import { openFavoritesPage } from '../../../../actions/practicesoftwaretesting/ui/account/open-favorites-page';
import { readFavoriteProductNames } from '../../../../actions/practicesoftwaretesting/ui/account/read-favorite-product-names';

// Accounts: every test takes its own customer from seed.account() (the profile's recipe: created per test, kept,
// named with the data prefix); a second customer, where a test needs one, is a second seed.account().

// G1 (mechanics, discovered in the AUT): the tests pick existing catalogue products (reference data, never changed)
//   from GET /products page 1; their ids are what POST /favorites takes as product_id.
// G2 (mechanics, discovered in the AUT): the product page is /product/{id}; its "Add to favourites" button is the
//   button of that name; the confirmation is shown as the page's alert.
// G3 (mechanics, discovered in the AUT): the Favorites page is /account/favorites; each favourite is a card
//   data-test="favorite-<id>" showing its product's name.
// ASSUMPTION: the exact success statuses are asserted once each: 201 of POST /favorites in SCN-001, 200 of
//   GET /favorites in SCN-003, 204 of DELETE /favorites/{favoriteId} in SCN-006. The other tests only need those calls
//   to succeed (a precondition, or "accepted" in the composition SCN-009) and check what their own criterion names.
// ASSUMPTION: the favourite's id and its product id are read where the answer carries them (the favourite's `id`; its
//   `product_id`, or the id of a nested product): the requirement names the values, not their field names; the
//   hardener confirms where they are.
// OPEN-QUESTION: what DELETE /favorites/{favoriteId} must answer for another customer's favourite (no criterion says;
//   not tested).
// OPEN-QUESTION: whether adding the same product twice at the same moment must also leave it in the list once (AC-2
//   speaks of a product that is already a favourite; not tested).
// OPEN-QUESTION: what POST /favorites must answer without product_id (R3 makes it required) or for an unknown product,
//   and DELETE for an unknown favourite id (no status stated; not tested).

// @req-constants-start — expected outcomes copied verbatim from TOOL-4 (never edit during hardening)
const REQ = {
  STATUS: { S200: 200, S201: 201, S204: 204, S401: 401, S409: 409 },
  ADDED_MESSAGE: 'Product added to your favorites list.',
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** POST, GET /favorites */ favorites: '/favorites',
  /** DELETE /favorites/{favoriteId} */ favoritesByFavoriteId: (favoriteId: string | number) => `/favorites/${favoriteId}`,
};

/** A token no sign-in ever issued (input of the "invalid token" cases). */
const INVALID_TOKEN = 'hldout-not-a-valid-token';

/** Track a favourite the scenario itself added (the POST under test) so it is removed after the test. */
function trackAdded(api: Api, seed: Seed, me: Account, res: ApiResponse): void {
  const id = favouriteIdOf(res.body);
  if (res.ok && id) seed.track(`favourite ${id}`, id, (fid) => deleteFavourite(api, me.headers, fid));
}

/** Cleanup of favourites a web-shop test added: look them up as the customer and remove them after the test. */
async function removeFavouritesOf(api: Api, seed: Seed, me: Account, productId: string): Promise<void> {
  await me.refresh(); // the UI sign-in may have revoked the API token
  const ids = await seed.step('look up the favourites the web shop added (GET /favorites)', async () =>
    favouritesIn((await api.get(EP.favorites, { headers: me.headers })).body).filter((f) => productIdOf(f) === productId).map((f) => favouriteIdOf(f) ?? '').filter(Boolean));
  for (const id of ids) seed.track(`favourite ${id}`, id, (fid) => deleteFavourite(api, me.headers, fid));
}

/** How many favourites of a GET /favorites answer are of the product. */
const countOfProduct = (body: unknown, productId: string): number => favouritesIn(body).filter((f) => productIdOf(f) === productId).length;
/** The favourite ids of a GET /favorites answer. */
const idsIn = (body: unknown): string[] => favouritesIn(body).map((f) => favouriteIdOf(f) ?? '');

test.describe('TOOL-4 Favourites for signed-in customers', () => {
  // ---- first pass: one test per criterion ------------------------------------------------------------------------

  // from story.md#L23, linked/confluence-880001-favourites-api.md#L18-L30
  test('SCN-001: A signed-in customer adds a product to favourites and gets 201 with that product', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let productId = ''; let res!: ApiResponse;
    await journey.step('Given I am a signed-in customer and a product of the catalogue', async () => {
      me = await seed.account();
      [{ id: productId }] = await pickCatalogueProducts(api, seed, 1);
    });
    await journey.step('When I POST /favorites with that product_id', async () => {
      res = await api.post(EP.favorites, { headers: me.headers, data: { product_id: productId } });
      trackAdded(api, seed, me, res);
    });
    await journey.step('Then the answer is 201 with the favourite of that product', async () => {
      expectResponse(res, { status: REQ.STATUS.S201 }, '[REQ AC-1] POST /favorites');
      expect.soft(productIdOf(res.body), '[REQ AC-1] POST /favorites returns the product id that was added').toBe(productId);
    });
  });

  // from story.md#L24, linked/confluence-880001-favourites-api.md#L32
  test('SCN-002: Adding a product that is already a favourite again is rejected with 409 and it stays listed once', { tag: ['@AC-2', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let productId = ''; let again!: ApiResponse;
    await journey.step('Given I am a signed-in customer and a product of the catalogue', async () => {
      me = await seed.account();
      [{ id: productId }] = await pickCatalogueProducts(api, seed, 1);
    });
    await journey.step('When I POST /favorites with that product_id', async () => {
      const first = await api.post(EP.favorites, { headers: me.headers, data: { product_id: productId } });
      trackAdded(api, seed, me, first);
      expect(first.ok, `the first add succeeded (precondition): ${first.status}`).toBe(true);
    });
    await journey.step('And I POST /favorites with the same product_id again', async () => {
      again = await api.post(EP.favorites, { headers: me.headers, data: { product_id: productId } });
      trackAdded(api, seed, me, again); // removed after the test if the application wrongly accepted it
    });
    await journey.step('Then the second add is rejected with 409', async () => {
      expectResponse(again, { status: REQ.STATUS.S409 }, '[REQ AC-2] POST /favorites for a product that is already a favourite');
    });
    await journey.step('And GET /favorites lists that product exactly once', async () => {
      const list = await api.get(EP.favorites, { headers: me.headers });
      expect(list.ok, `GET /favorites answered (precondition): ${list.status}`).toBe(true);
      expect(countOfProduct(list.body, productId), '[REQ AC-2] GET /favorites contains the product exactly once').toBe(1);
    });
  });

  // from story.md#L25, linked/confluence-880001-favourites-api.md#L12-L16
  test('SCN-003: GET /favorites answers 200 with the customer\'s own favourites', { tag: ['@AC-3', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; const mine: { id: string; productId: string }[] = []; let res!: ApiResponse;
    await journey.step('Given I am a signed-in customer with two favourite products', async () => {
      me = await seed.account();
      const products = await pickCatalogueProducts(api, seed, 2);
      for (const p of products) mine.push(await addFavourite(api, seed, me, p.id));
    });
    await journey.step('When I GET /favorites', async () => {
      res = await api.get(EP.favorites, { headers: me.headers });
    });
    await journey.step('Then the answer is 200 and lists both my favourites', async () => {
      expectResponse(res, { status: REQ.STATUS.S200 }, '[REQ AC-3] GET /favorites');
      expect.soft(idsIn(res.body), '[REQ AC-3] GET /favorites lists my own favourites').toEqual(expect.arrayContaining(mine.map((f) => f.id)));
    });
  });

  // A table of cases: every favourites endpoint, without a token and with an invalid one (SCN-004.1 … .6)
  const AUTH_CASES = [
    { method: 'GET', token: 'none' },
    { method: 'GET', token: 'invalid' },
    { method: 'POST', token: 'none' },
    { method: 'POST', token: 'invalid' },
    { method: 'DELETE', token: 'none' },
    { method: 'DELETE', token: 'invalid' },
  ] as const;
  AUTH_CASES.forEach((row, i) => {
    const call = row.method === 'DELETE' ? 'DELETE /favorites/{favoriteId}' : `${row.method} /favorites`;
    const how = row.token === 'none' ? 'without a token' : 'with an invalid token';
    // from story.md#L26, linked/confluence-880001-favourites-api.md#L17, #L31, #L39
    test(`SCN-004.${i + 1}: ${call} ${how} answers 401`, { tag: ['@AC-4', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      const headers: Record<string, string> = row.token === 'invalid' ? { Authorization: `Bearer ${INVALID_TOKEN}` } : {};
      let productId = ''; let favouriteId = ''; let res!: ApiResponse;
      await journey.step(row.method === 'DELETE' ? 'Given a customer\'s existing favourite' : 'Given a product of the catalogue', async () => {
        [{ id: productId }] = await pickCatalogueProducts(api, seed, 1);
        if (row.method === 'DELETE') favouriteId = (await addFavourite(api, seed, await seed.account(), productId)).id;
      });
      await journey.step(`When I call ${call} ${how}`, async () => {
        if (row.method === 'GET') res = await api.get(EP.favorites, { headers });
        else if (row.method === 'POST') res = await api.post(EP.favorites, { headers, data: { product_id: productId } });
        else res = await api.delete(EP.favoritesByFavoriteId(favouriteId), { headers });
      });
      await journey.step('Then the answer is 401', async () => {
        expectResponse(res, { status: REQ.STATUS.S401 }, `[REQ AC-4] ${call} ${how}`);
      });
    });
  });

  // from story.md#L27
  test('SCN-005: In the web shop, a customer adds a product to favourites on its page and finds it on the Favorites page', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let product!: { id: string; name: string };
    await journey.step('Given I am a signed-in customer on a product page of the web shop', async () => {
      me = await seed.account();
      [product] = await pickCatalogueProducts(api, seed, 1);
      await signIn(page, me);
      await openProductPage(page, product.id);
    });
    await journey.step('When I click "Add to favourites"', async () => {
      await clickAddToFavourites(page);
    });
    await journey.step('Then I see "Product added to your favorites list."', async () => {
      await expect(page.getByText(REQ.ADDED_MESSAGE), '[REQ AC-5] the confirmation message is shown').toBeVisible({ timeout: 10_000 });
    });
    await journey.step('And the product is listed on the "Favorites" page of my account', async () => {
      await openFavoritesPage(page);
      await expect.poll(() => readFavoriteProductNames(page), { message: '[REQ AC-5] the Favorites page lists the product', timeout: 10_000 }).toContain(product.name);
    });
    await removeFavouritesOf(api, seed, me, product.id);
  });

  // from story.md#L28, linked/confluence-880001-favourites-api.md#L33-L38
  test('SCN-006: DELETE /favorites/{favoriteId} removes the favourite with 204 and GET /favorites no longer lists it', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let fav!: { id: string; productId: string }; let res!: ApiResponse;
    await journey.step('Given I am a signed-in customer with a favourite product', async () => {
      me = await seed.account();
      const [p] = await pickCatalogueProducts(api, seed, 1);
      fav = await addFavourite(api, seed, me, p.id);
    });
    await journey.step('When I DELETE /favorites/{favoriteId} of that favourite', async () => {
      res = await api.delete(EP.favoritesByFavoriteId(fav.id), { headers: me.headers });
    });
    await journey.step('Then the answer is 204', async () => {
      expectResponse(res, { status: REQ.STATUS.S204 }, '[REQ AC-6] DELETE /favorites/{favoriteId}');
    });
    await journey.step('And GET /favorites no longer lists that favourite', async () => {
      const list = await api.get(EP.favorites, { headers: me.headers });
      expect(list.ok, `GET /favorites answered (precondition): ${list.status}`).toBe(true);
      expect(idsIn(list.body), '[REQ AC-6] GET /favorites no longer contains the removed favourite').not.toContain(fav.id);
    });
  });

  // ---- second pass: the types the criteria state or imply ---------------------------------------------------------

  // from story.md#L23, linked/confluence-880001-favourites-api.md#L29-L30
  test('SCN-007: POST /favorites answers with the favourite: its id and its product id', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    let me!: Account; let productId = ''; let res!: ApiResponse;
    await journey.step('Given I am a signed-in customer and a product of the catalogue', async () => {
      me = await seed.account();
      [{ id: productId }] = await pickCatalogueProducts(api, seed, 1);
    });
    await journey.step('When I POST /favorites with that product_id', async () => {
      res = await api.post(EP.favorites, { headers: me.headers, data: { product_id: productId } });
      trackAdded(api, seed, me, res);
      expect(res.ok, `the product was added (precondition): ${res.status}`).toBe(true);
    });
    await journey.step('Then the answer carries the favourite\'s id and the product id', async () => {
      expect.soft(favouriteIdOf(res.body), '[REQ AC-1] POST /favorites returns the favourite\'s id').toBeTruthy();
      expect.soft(typeof productIdOf(res.body), '[REQ AC-1] POST /favorites returns the product id').toBe('string');
    });
  });

  // from story.md#L25, story.md#L17, linked/confluence-880001-favourites-api.md#L16
  test('SCN-008: GET /favorites never includes another customer\'s favourites', { tag: ['@AC-3', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let theirs!: { id: string; productId: string }; let res!: ApiResponse;
    await journey.step('Given I am a signed-in customer with a favourite product', async () => {
      const [mineProduct] = await pickCatalogueProducts(api, seed, 1);
      me = await seed.account('me');
      await addFavourite(api, seed, me, mineProduct.id);
    });
    await journey.step('And another customer has a favourite of a product I did not add', async () => {
      const [, theirProduct] = await pickCatalogueProducts(api, seed, 2);
      theirs = await addFavourite(api, seed, await seed.account('another customer'), theirProduct.id);
    });
    await journey.step('When I GET /favorites', async () => {
      res = await api.get(EP.favorites, { headers: me.headers });
      expect(res.ok, `GET /favorites answered (precondition): ${res.status}`).toBe(true);
    });
    await journey.step('Then the other customer\'s favourite is not in my list', async () => {
      expect.soft(idsIn(res.body), '[REQ AC-3] GET /favorites does not include another customer\'s favourite').not.toContain(theirs.id);
      expect.soft(countOfProduct(res.body, theirs.productId), '[REQ AC-3] GET /favorites lists no product only another customer added').toBe(0);
    });
  });

  // from story.md#L23, story.md#L25, story.md#L28
  test('SCN-009: A favourite added with POST is listed by GET and removed with its id by DELETE', { tag: ['@AC-1', '@AC-3', '@AC-6', '@type:composition', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    let me!: Account; let productId = ''; let favouriteId = '';
    await journey.step('Given I am a signed-in customer and a product of the catalogue', async () => {
      me = await seed.account();
      [{ id: productId }] = await pickCatalogueProducts(api, seed, 1);
    });
    await journey.step('When I POST /favorites with that product_id', async () => {
      const res = await api.post(EP.favorites, { headers: me.headers, data: { product_id: productId } });
      trackAdded(api, seed, me, res);
      favouriteId = favouriteIdOf(res.body) ?? '';
      expect(favouriteId, '[REQ AC-1] POST /favorites returns the id of the new favourite').toBeTruthy();
    });
    await journey.step('Then GET /favorites lists the favourite with that id and product', async () => {
      const list = await api.get(EP.favorites, { headers: me.headers });
      const listed = favouritesIn(list.body).find((f) => favouriteIdOf(f) === favouriteId);
      expect(productIdOf(listed), '[REQ AC-3] GET /favorites lists the added favourite with its product').toBe(productId);
    });
    await journey.step('When I DELETE /favorites/{favoriteId} with the id POST answered', async () => {
      const del = await api.delete(EP.favoritesByFavoriteId(favouriteId), { headers: me.headers });
      expect(del.ok, `[REQ AC-6] DELETE /favorites/{favoriteId} accepts the id POST /favorites answered: ${del.status}`).toBe(true);
    });
    await journey.step('Then GET /favorites no longer lists it', async () => {
      const list = await api.get(EP.favorites, { headers: me.headers });
      expect(idsIn(list.body), '[REQ AC-6] GET /favorites no longer contains the removed favourite').not.toContain(favouriteId);
    });
  });

  // from story.md#L27, story.md#L17 (one personal list, from the web shop and through the API)
  test('SCN-010: A product added to favourites in the web shop is in the customer\'s GET /favorites', { tag: ['@AC-5', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let product!: { id: string; name: string };
    await journey.step('Given I am a signed-in customer on a product page of the web shop', async () => {
      me = await seed.account();
      [product] = await pickCatalogueProducts(api, seed, 1);
      await signIn(page, me);
      await openProductPage(page, product.id);
    });
    await journey.step('When I click "Add to favourites" and the shop confirms it', async () => {
      await clickAddToFavourites(page);
      await expect(page.getByText(REQ.ADDED_MESSAGE), 'the shop confirmed the add (precondition)').toBeVisible({ timeout: 10_000 });
    });
    await journey.step('Then GET /favorites, as the same customer, lists the product', async () => {
      await me.refresh(); // the UI sign-in may have revoked the API token
      await expect.poll(async () => countOfProduct((await api.get(EP.favorites, { headers: me.headers })).body, product.id), { message: '[REQ AC-5] GET /favorites lists the product added in the web shop', timeout: 10_000 }).toBe(1);
    });
    await removeFavouritesOf(api, seed, me, product.id);
  });
});
