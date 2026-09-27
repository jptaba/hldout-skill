/**
 * Held-out acceptance tests for AE-1 — "Product search and catalogue on the shop and the public product API".
 * Written from evaluations/AE-1/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Page } from '@playwright/test';
import { test, expect, gotoPage, checkShape, type Api, type ApiResponse, type ShapeRule } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from AE-1 (never edit during hardening)
const REQ = {
  STATUS: { BAD_REQUEST: 400 },
  AC1_PRICE: /^Rs\. \d+(\.\d+)?$/,
  AC2_TERM: 'jean',
  AC2_JEANS: ['Soft Stretch Jeans', 'Regular Fit Straight Jeans', 'Grunt Blue Slim Fit Jeans'],
  AC3_PAIRS: [{ upper: 'TOP', lower: 'top' }, { upper: 'Top', lower: 'top' }],
  AC4_TERM: 'dress',
  AC4_DRESS_EXAMPLE: 'Sleeves Top and Short - Blue & Pink',
  AC4_BRAND_TERM: 'Polo',
  AC5_NO_MATCH: 'zzqxv',
  AC7_MESSAGE: 'Bad request, search_product parameter is missing in POST request.',
  HEADING_SEARCHED: 'Searched Products',
  HEADING_ALL: 'All Products',
  AC10_TERMS: ['top', 'dress', 'Men Tshirt'],
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** GET /api/productsList */ productsList: '/api/productsList',
  /** POST /api/searchProduct */ searchProduct: '/api/searchProduct',
};
const PRODUCTS_PAGE = '/products';

type Product = { id: number | string; name: string; price: string; brand: string; category: Record<string, unknown> };

// ---- API plumbing (mechanics) -----------------------------------------------------------------
/** Parsed JSON body, whatever content type the server declares. */
function bodyOf(res: ApiResponse): Record<string, unknown> {
  // The AUT answers JSON with Content-Type text/html (hardening/api-productsList.md), so the fixture hands back text.
  if (typeof res.body === 'string') { try { return JSON.parse(res.text) as Record<string, unknown>; } catch { return {}; } }
  return (res.body ?? {}) as Record<string, unknown>;
}
/** The product list carried by a list/search response (G4). */
const productsOf = (res: ApiResponse): Product[] | undefined => bodyOf(res).products as Product[] | undefined; // G4: { products: [...] }, identity = id
/** The category name inside a product's category (G3). */
const categoryNameOf = (p: Product): string => String((p.category as Record<string, unknown>)?.category ?? ''); // G3: category.category
/** The audience inside a product's category. */
const audienceOf = (p: Product): unknown => {
  const u = (p.category as Record<string, unknown>)?.usertype; // G3: category.usertype = { usertype: 'Women' }
  return u && typeof u === 'object' ? (u as Record<string, unknown>).usertype : u;
};
/** The error message carried by an error response (G6). */
const messageOf = (res: ApiResponse): unknown => bodyOf(res).message; // G6: body field "message"

const ids = (list: Product[] | undefined) => (list ?? []).map((p) => String(p.id)).sort();
const names = (list: Product[] | undefined) => (list ?? []).map((p) => p.name).sort();
const contains = (s: string, term: string) => s.toLowerCase().includes(term.toLowerCase());

const listCatalogue = (api: Api) => api.get(EP.productsList);
const search = (api: Api, term: string) => api.post(EP.searchProduct, { form: { search_product: term } });

const nonEmpty: ShapeRule = (v) => (v !== null && v !== '' && v !== undefined) || 'is empty';
const PRODUCT: Record<string, ShapeRule> = { id: nonEmpty, name: 'string', price: 'string', brand: 'string', category: 'object' };

// ---- UI plumbing (mechanics) ------------------------------------------------------------------
const searchBox = (page: Page) => page.getByRole('textbox', { name: 'Search Product', exact: true });
const searchButton = (page: Page) => page.locator('#submit_search'); // the button has no accessible name
const gridHeading = (page: Page) => page.locator('.features_items h2.title');
const cardNames = (page: Page) => page.locator('.features_items .productinfo p');
async function shownNames(page: Page): Promise<string[]> {
  // Some names render as inline links with extra spaces (" Men  Tshirt"): collapse whitespace.
  return (await cardNames(page).allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim()).sort();
}
async function searchOnPage(page: Page, term: string) {
  await searchBox(page).fill(term);
  await Promise.all([page.waitForURL(/[?&]search=/, { waitUntil: 'domcontentloaded' }), searchButton(page).click()]);
}

/** Third-party ad scripts inject ad text into the product cards (e.g. "Sleeves Printed Top - WhiteManufacturing"); block them. */
const AD_HOSTS = /googlesyndication|doubleclick|googleadservices|adservice\.google|fundingchoicesmessages|googletagservices|adtrafficquality/;

async function openProductsPage(page: Page) {
  await page.route((url) => AD_HOSTS.test(url.hostname), (route) => route.abort());
  await gotoPage(page, PRODUCTS_PAGE);
}

test.describe('AE-1 Product search and catalogue on the shop and the public product API', () => {
  test('SCN-001: A client lists the catalogue through the API', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: ApiResponse;
    await journey.step('Given the public product API (no authentication)', async () => {});
    await journey.step('When a client calls GET /api/productsList', async () => { res = await listCatalogue(api); });
    await journey.step('Then the response lists the products of the catalogue in a "products" array', async () => {
      const list = bodyOf(res).products;
      expect(Array.isArray(list), '[REQ AC-1] body has a "products" array').toBe(true);
      expect((list as unknown[]).length, '[REQ AC-1] the catalogue lists products').toBeGreaterThan(0);
    });
  });

  test('SCN-002: Every catalogue product carries id, name, price, brand and category with audience and category name', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let list: Product[] = [];
    await journey.step('Given the public product API (no authentication)', async () => {});
    await journey.step('When a client calls GET /api/productsList', async () => {
      list = productsOf(await listCatalogue(api)) ?? [];
      expect(list.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
    });
    await journey.step('Then every product has an "id", a "name", a "price", a "brand" and a "category"', async () => {
      const violations = list.flatMap((p, i) => checkShape(p, PRODUCT, `products[${i}]`));
      expect(violations, '[REQ AC-1] every product has id, name, price, brand and category').toEqual([]);
    });
    await journey.step('And every category holds the audience "usertype" and the category name', async () => {
      const bad = list.filter((p) => !audienceOf(p) || !categoryNameOf(p)).map((p) => `${p.id}: ${JSON.stringify(p.category)}`);
      expect(bad, '[REQ AC-1] every category holds the audience (usertype) and the category name').toEqual([]);
    });
  });

  test('SCN-003: Every catalogue price is written as "Rs. " followed by the amount', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
    let list: Product[] = [];
    await journey.step('Given the public product API (no authentication)', async () => {});
    await journey.step('When a client calls GET /api/productsList', async () => {
      list = productsOf(await listCatalogue(api)) ?? [];
      expect(list.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
    });
    await journey.step('Then every price is written as "Rs. " followed by the amount, e.g. "Rs. 500"', async () => {
      const bad = list.filter((p) => !REQ.AC1_PRICE.test(String(p.price))).map((p) => `${p.id}: ${JSON.stringify(p.price)}`);
      expect(bad, '[REQ AC-1] every price is "Rs. " followed by the amount').toEqual([]);
    });
  });

  test('SCN-004: Searching "jean" through the API returns exactly the three jeans', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: ApiResponse;
    await journey.step('Given the public product API (no authentication)', async () => {});
    await journey.step('When a client posts search_product = "jean" to /api/searchProduct', async () => { res = await search(api, REQ.AC2_TERM); });
    await journey.step('Then exactly these products are returned: "Soft Stretch Jeans", "Regular Fit Straight Jeans", "Grunt Blue Slim Fit Jeans"', async () => {
      expect(names(productsOf(res)), '[REQ AC-2] exactly the three jeans are returned').toEqual([...REQ.AC2_JEANS].sort());
    });
  });

  REQ.AC3_PAIRS.forEach((row, i) => {
    test(`SCN-005.${i + 1}: Search ignores letter case (${row.upper} / ${row.lower})`, { tag: ['@AC-3', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
      let upper: Product[] | undefined; let lower: Product[] | undefined;
      await journey.step('Given the public product API (no authentication)', async () => {});
      await journey.step(`When a client searches for "${row.upper}" and for "${row.lower}"`, async () => {
        upper = productsOf(await search(api, row.upper));
        lower = productsOf(await search(api, row.lower));
        expect((lower ?? []).length, `"${row.lower}" returns products (precondition: the comparison is meaningful)`).toBeGreaterThan(0);
      });
      await journey.step('Then both searches return the same products', async () => {
        expect(ids(upper), `[REQ AC-3] "${row.upper}" returns the same products as "${row.lower}"`).toEqual(ids(lower));
      });
    });
  });

  test('SCN-006: Searching "dress" returns every product with "dress" in its name or in a Dress category', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let catalogue: Product[] = []; let found: Product[] = [];
    await journey.step('Given the catalogue from GET /api/productsList', async () => {
      catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
      expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
    });
    await journey.step('When a client searches for "dress"', async () => { found = productsOf(await search(api, REQ.AC4_TERM)) ?? []; });
    await journey.step('Then every catalogue product whose name contains "dress" is returned', async () => {
      const got = new Set(ids(found));
      const missing = catalogue.filter((p) => contains(p.name, REQ.AC4_TERM) && !got.has(String(p.id))).map((p) => `${p.id} ${p.name}`);
      expect.soft(missing, '[REQ AC-4] every product whose name contains "dress" is returned').toEqual([]);
    });
    await journey.step('And every product in a "Dress" category is returned, including "Sleeves Top and Short - Blue & Pink" (Kids > Dress)', async () => {
      const got = new Set(ids(found));
      const missing = catalogue.filter((p) => contains(categoryNameOf(p), REQ.AC4_TERM) && !got.has(String(p.id)))
        .map((p) => `${p.id} ${p.name} (${categoryNameOf(p)})`);
      expect.soft(missing, '[REQ AC-4] every product in a "Dress" category is returned').toEqual([]);
      expect.soft(found.map((p) => p.name), '[REQ AC-4] "Sleeves Top and Short - Blue & Pink" (Kids > Dress) is returned').toContain(REQ.AC4_DRESS_EXAMPLE);
    });
  });

  test('SCN-007: Searching "dress" returns nothing else', { tag: ['@AC-4', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let catalogue: Product[] = []; let found: Product[] = [];
    await journey.step('Given the catalogue from GET /api/productsList', async () => {
      catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
      expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
    });
    await journey.step('When a client searches for "dress"', async () => { found = productsOf(await search(api, REQ.AC4_TERM)) ?? []; });
    await journey.step('Then every product returned has "dress" in its name or its category name', async () => {
      const byId = new Map(catalogue.map((p) => [String(p.id), p]));
      const extra = found.filter((p) => {
        const c = byId.get(String(p.id)) ?? p;
        return !contains(c.name, REQ.AC4_TERM) && !contains(categoryNameOf(c), REQ.AC4_TERM);
      }).map((p) => `${p.id} ${p.name} (${categoryNameOf(byId.get(String(p.id)) ?? p)})`);
      expect(extra, '[REQ AC-4] nothing without "dress" in its name or category name comes back').toEqual([]);
    });
  });

  test('SCN-008: The brand is not a search field', { tag: ['@AC-4', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    let catalogue: Product[] = []; let found: Product[] = [];
    await journey.step('Given the catalogue from GET /api/productsList', async () => {
      catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
      expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
    });
    await journey.step('When a client searches for "Polo"', async () => { found = productsOf(await search(api, REQ.AC4_BRAND_TERM)) ?? []; });
    await journey.step('Then exactly the products with "Polo" in their name or category name are returned', async () => {
      const expected = catalogue.filter((p) => contains(p.name, REQ.AC4_BRAND_TERM) || contains(categoryNameOf(p), REQ.AC4_BRAND_TERM));
      expect(ids(found), '[REQ AC-4] "Polo" finds only products with "Polo" in the name or category (brand not searched)').toEqual(ids(expected));
    });
  });

  test('SCN-009: A search that matches nothing returns an empty product list', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: ApiResponse;
    await journey.step('Given the public product API (no authentication)', async () => {});
    await journey.step('When a client searches for "zzqxv"', async () => { res = await search(api, REQ.AC5_NO_MATCH); });
    await journey.step('Then an empty product list is returned', async () => {
      const list = productsOf(res);
      expect(Array.isArray(list), '[REQ AC-5] a product list is returned').toBe(true);
      expect(list, '[REQ AC-5] the product list is empty').toEqual([]);
    });
  });

  test('SCN-010: A search that matches nothing is not an error', { tag: ['@AC-5', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
    let res!: ApiResponse;
    await journey.step('Given the public product API (no authentication)', async () => {});
    await journey.step('When a client searches for "zzqxv"', async () => { res = await search(api, REQ.AC5_NO_MATCH); });
    await journey.step('Then the response is not an error: no error status and no error message', async () => {
      expect.soft(res.status, '[REQ AC-5] no error status (4xx/5xx)').toBeLessThan(400);
      expect.soft(messageOf(res), '[REQ AC-5] no error message').toBeUndefined();
    });
  });

  test('SCN-011: Searching with an empty value returns the whole catalogue', { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let catalogue: Product[] = []; let res!: ApiResponse;
    await journey.step('Given the catalogue from GET /api/productsList', async () => {
      catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
      expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
    });
    await journey.step('When a client posts search_product with an empty value', async () => { res = await search(api, ''); });
    await journey.step('Then the whole catalogue is returned, the same products as GET /api/productsList', async () => {
      expect(ids(productsOf(res)), '[REQ AC-6] an empty term returns the same products as GET /api/productsList').toEqual(ids(catalogue));
    });
  });

  test('SCN-012: A search without the search_product parameter is rejected with response code 400', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: ApiResponse;
    await journey.step('Given the public product API (no authentication)', async () => {});
    await journey.step('When a client posts to /api/searchProduct without the search_product parameter', async () => {
      res = await api.post(EP.searchProduct); // no body at all
    });
    await journey.step('Then the request is rejected with response code 400', async () => {
      expect(res.status, '[REQ AC-7] response code 400').toBe(REQ.STATUS.BAD_REQUEST);
    });
  });

  test('SCN-013: A search without the search_product parameter explains what is missing', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: ApiResponse;
    await journey.step('Given the public product API (no authentication)', async () => {});
    await journey.step('When a client posts to /api/searchProduct without the search_product parameter', async () => {
      res = await api.post(EP.searchProduct); // no body at all
    });
    await journey.step('Then the message is "Bad request, search_product parameter is missing in POST request."', async () => {
      expect(messageOf(res), '[REQ AC-7] message').toBe(REQ.AC7_MESSAGE);
    });
  });

  test('SCN-014: A shopper searches "jean" on the Products page', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
    await journey.step('Given a shopper on the Products page', async () => { await openProductsPage(page); });
    await journey.step('When they type "jean" in the search box and press the search button', async () => { await searchOnPage(page, REQ.AC2_TERM); });
    await journey.step('Then the product grid is headed "Searched Products"', async () => {
      await expect.soft(gridHeading(page), '[REQ AC-8] grid heading').toHaveText(REQ.HEADING_SEARCHED, { ignoreCase: true });
    });
    await journey.step('And the search box still shows "jean"', async () => {
      await expect.soft(searchBox(page), '[REQ AC-8] search box keeps the term').toHaveValue(REQ.AC2_TERM);
    });
    await journey.step('And exactly the three jeans products listed in AC-2 are shown', async () => {
      await expect.poll(() => shownNames(page), { message: '[REQ AC-8] exactly the three jeans are shown' }).toEqual([...REQ.AC2_JEANS].sort());
    });
  });

  test('SCN-015: A shopper searches without a term on the Products page and sees the whole catalogue', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, seed }) => {
    await journey.step('Given a shopper on the Products page', async () => { await openProductsPage(page); });
    await journey.step('When they leave the search box empty and press the search button', async () => { await searchOnPage(page, ''); });
    await journey.step('Then the grid is headed "All Products"', async () => {
      await expect.soft(gridHeading(page), '[REQ AC-9] grid heading').toHaveText(REQ.HEADING_ALL, { ignoreCase: true });
    });
    await journey.step('And every product of the catalogue (GET /api/productsList) is shown', async () => {
      const catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
      expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
      await expect.poll(() => shownNames(page), { message: '[REQ AC-9] every catalogue product is shown' }).toEqual(names(catalogue));
    });
  });

  REQ.AC10_TERMS.forEach((term, i) => {
    test(`SCN-016.${i + 1}: The shop and the API agree on search results (${term})`, { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey }) => {
      await journey.step('Given a shopper on the Products page', async () => { await openProductsPage(page); });
      await journey.step(`When a shopper searches for "${term}" on the Products page`, async () => { await searchOnPage(page, term); });
      await journey.step(`Then the products shown are exactly the products POST /api/searchProduct returns for "${term}"`, async () => {
        const fromApi = productsOf(await search(api, term));
        expect(Array.isArray(fromApi), 'search API returned a product list (precondition)').toBe(true);
        await expect.poll(() => shownNames(page), { message: `[REQ AC-10] the page shows exactly what the API returns for "${term}"` }).toEqual(names(fromApi));
      });
    });
  });

  test('SCN-017: A search on the Products page that matches nothing shows no product', { tag: ['@AC-11', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given a shopper on the Products page', async () => { await openProductsPage(page); });
    await journey.step('When a shopper searches for "zzqxv" on the Products page', async () => { await searchOnPage(page, REQ.AC5_NO_MATCH); });
    await journey.step('Then the grid is headed "Searched Products"', async () => {
      await expect.soft(gridHeading(page), '[REQ AC-11] grid heading').toHaveText(REQ.HEADING_SEARCHED, { ignoreCase: true });
    });
    await journey.step('And no product is shown', async () => {
      await expect(cardNames(page), '[REQ AC-11] no product is shown').toHaveCount(0);
    });
  });
});
