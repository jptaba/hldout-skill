/**
 * Held-out acceptance tests for TOOL-1 — "Catalogue search, sorting and category filter".
 * Written from evaluations/TOOL-1/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Page } from '@playwright/test';
import { test, expect, expectResponse, gotoPage, checkShape, uniqueId, type Api, type ApiResponse } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from TOOL-1 (never edit during hardening)
const REQ = {
  TERM: 'pliers',
  TERM_UPPER: 'PLIERS',
  CAPTION: (term: string) => `Searched for: ${term}`,
  NO_RESULTS: 'There are no products found.',
  SORT_OPTION: 'Price (Low - High)',
  SORT_PARAM: 'price,asc',
  CATEGORY: 'Hammer',
  PER_PAGE: 12,
  STATUS_OK: 200,
  EMPTY_TOTAL: 0,
  SHAPE_KEYS: ['current_page', 'data', 'per_page', 'total', 'last_page'],
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** GET /products */ products: '/products',
  /** GET /products/search */ productsSearch: '/products/search',
  /** GET /categories/tree */ categoriesTree: '/categories/tree',
};

// ---- plumbing (HOW): where things are in the answers and on the page (G1, G2, G3) ----

type Product = Record<string, unknown>;
interface Paged { current_page: number; data: Product[]; per_page: number; total: number; last_page: number }

// G2 (hardening/api-products.md): data[] items carry id, name, price (number) and category { id, name, slug }
const nameOf = (p: Product) => String(p.name);
const priceOf = (p: Product) => Number(p.price);
const idOf = (p: Product) => String(p.id);
const categoryNameOf = (p: Product) => String((p.category as Record<string, unknown> | undefined)?.name);

/** Every page of a paged answer (page 1 … last_page). */
async function allPages(api: Api, path: string, params: Record<string, string | number> = {}): Promise<{ first: ApiResponse<Paged>; items: Product[] }> {
  const first = await api.get<Paged>(path, { params: { ...params, page: 1 } });
  const items: Product[] = [...(first.body?.data ?? [])];
  const last = Number(first.body?.last_page ?? 1);
  for (let n = 2; n <= last; n++) {
    const next = await api.get<Paged>(path, { params: { ...params, page: n } });
    expect(next.status, `precondition: ${path} page ${n} answers`).toBe(200);
    items.push(...(next.body?.data ?? []));
  }
  return { first, items };
}

/** The id of a category by name, anywhere in the GET /categories/tree answer (G3). */
// G3 (hardening/api-categories-tree.md): an array of { id, name, slug, parent_id, sub_categories: [...] }; "Hammer" is a sub-category
function findCategoryId(tree: unknown, name: string): string | undefined {
  const nodes: unknown[] = Array.isArray(tree) ? [...tree] : [];
  while (nodes.length) {
    const n = nodes.shift() as Record<string, unknown>;
    if (n && n.name === name) return String(n.id);
    for (const v of Object.values(n ?? {})) if (Array.isArray(v)) nodes.push(...v);
  }
  return undefined;
}

// G1 (hardening/tier3/*.md): the catalogue is the start page; it is ready once the first product card is shown
const productNames = (page: Page) => page.getByTestId('product-name');
const productPrices = (page: Page) => page.getByTestId('product-price');
async function catalogue(page: Page) {
  await gotoPage(page, '/');
  await expect(productNames(page).first(), 'the catalogue has loaded (precondition)').toBeVisible({ timeout: 15_000 });
}

async function search(page: Page, term: string) {
  await page.getByTestId('search-query').fill(term);
  // the web shop asks its API for the results; waiting for that answer (not for any requirement text) shows the search was handled
  const answered = page.waitForResponse((r) => new URL(r.url()).pathname.endsWith('/products/search'), { timeout: 20_000 });
  await page.getByTestId('search-submit').click();
  await answered;
}

const money = (s: string) => Number(s.replace(/[^0-9.]/g, ''));

test.describe('TOOL-1 Catalogue search, sorting and category filter', () => {
  test('SCN-001: A shopper searches the web shop for "pliers" and sees only matching products with the caption', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the web shop catalogue', () => catalogue(page));
    await journey.step('When I search for "pliers"', () => search(page, REQ.TERM));
    await journey.step('Then the caption "Searched for: pliers" is shown', async () => {
      await expect(page.getByText(REQ.CAPTION(REQ.TERM)), '[REQ AC-1] caption "Searched for: pliers"').toBeVisible();
    });
    await journey.step('And every product shown has a name that contains "pliers"', async () => {
      await expect(productNames(page).first(), 'precondition: the search shows at least one product').toBeVisible();
      const names = await productNames(page).allInnerTexts();
      const wrong = names.filter((n) => !n.toLowerCase().includes(REQ.TERM.toLowerCase()));
      expect(wrong, '[REQ AC-1] every product shown has a name that contains "pliers"').toEqual([]);
    });
  });

  test('SCN-002: The search API returns only products whose name contains the term', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: { first: ApiResponse<Paged>; items: Product[] };
    await journey.step('When I call GET /products/search?q=pliers', async () => { res = await allPages(api, EP.productsSearch, { q: REQ.TERM }); });
    await journey.step('Then the response status is 200', async () => {
      expectResponse(res.first, { status: REQ.STATUS_OK }, '[REQ AC-2] GET /products/search?q=pliers returns 200');
    });
    await journey.step('And every product in data, on every page, has a name that contains "pliers" ignoring letter case', async () => {
      expect(res.items.length, 'precondition: the search finds at least one product').toBeGreaterThan(0);
      const wrong = res.items.map(nameOf).filter((n) => !n.toLowerCase().includes(REQ.TERM.toLowerCase()));
      expect(wrong, '[REQ AC-2] GET /products/search?q=pliers returns only products whose name contains "pliers"').toEqual([]);
    });
  });

  test('SCN-003: The search API ignores letter case', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let upper!: { first: ApiResponse<Paged>; items: Product[] };
    let lower!: { first: ApiResponse<Paged>; items: Product[] };
    await journey.step('When I call GET /products/search?q=PLIERS and GET /products/search?q=pliers', async () => {
      upper = await allPages(api, EP.productsSearch, { q: REQ.TERM_UPPER });
      lower = await allPages(api, EP.productsSearch, { q: REQ.TERM });
    });
    await journey.step('Then both responses have status 200', async () => {
      expectResponse(upper.first, { status: REQ.STATUS_OK }, '[REQ AC-2] GET /products/search?q=PLIERS returns 200');
      expectResponse(lower.first, { status: REQ.STATUS_OK }, '[REQ AC-2] GET /products/search?q=pliers returns 200');
    });
    await journey.step('And both find the same products', async () => {
      expect(lower.items.length, 'precondition: "pliers" finds at least one product').toBeGreaterThan(0);
      expect(upper.items.map(idOf).sort(), '[REQ AC-2] GET /products/search?q=PLIERS finds the same products as "pliers"').toEqual(lower.items.map(idOf).sort());
    });
  });

  test('SCN-004: A web shop search without matches says there are no products', { tag: ['@AC-3', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
    const term = uniqueId();
    await journey.step('Given I am on the web shop catalogue', () => catalogue(page));
    await journey.step('When I search for a term no product name contains', () => search(page, term));
    await journey.step('Then "There are no products found." is shown', async () => {
      await expect(page.getByText(REQ.NO_RESULTS), '[REQ AC-3] "There are no products found." is shown').toBeVisible();
    });
    await journey.step('And no product is shown', async () => {
      // the message above is the sign the search was handled
      await expect(productNames(page), '[REQ AC-3] no product is shown').toHaveCount(0);
    });
  });

  test('SCN-005: The search API answers a search without matches with an empty list', { tag: ['@AC-3', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: ApiResponse<Paged>;
    await journey.step('When I call GET /products/search with a term no product name contains', async () => { res = await api.get<Paged>(EP.productsSearch, { params: { q: uniqueId() } }); });
    await journey.step('Then the response status is 200', async () => {
      expectResponse(res, { status: REQ.STATUS_OK }, '[REQ AC-3] GET /products/search?q=<no match> returns 200');
    });
    await journey.step('And data is an empty list', async () => {
      expect.soft(res.body?.data, '[REQ AC-3] GET /products/search?q=<no match> returns an empty data list').toEqual([]);
    });
    await journey.step('And total is 0', async () => {
      expect(res.body?.total, '[REQ AC-3] GET /products/search?q=<no match> returns total 0').toBe(REQ.EMPTY_TOTAL);
    });
  });

  test('SCN-006: Sorting the web shop by "Price (Low - High)" lists products by ascending price', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the web shop catalogue', () => catalogue(page));
    await journey.step('When I choose the sort "Price (Low - High)"', async () => {
      const answered = page.waitForResponse((r) => new URL(r.url()).pathname.endsWith('/products'), { timeout: 20_000 });
      await page.getByTestId('sort').selectOption({ label: REQ.SORT_OPTION });
      await answered; // the web shop re-reads its product list after the sort changes
    });
    await journey.step('Then the products shown are listed by ascending price', async () => {
      await expect(productPrices(page).first(), 'precondition: products are shown').toBeVisible();
      await expect.poll(async () => {
        const prices = (await productPrices(page).allInnerTexts()).map(money);
        return prices.length > 1 && prices.every((p, i) => i === 0 || prices[i - 1] <= p);
      }, { message: '[REQ AC-4] web shop lists the products by ascending price', timeout: 10_000 }).toBe(true);
    });
  });

  test('SCN-007: GET /products?sort=price,asc returns products in ascending price order', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let p1!: ApiResponse<Paged>;
    let p2!: ApiResponse<Paged>;
    await journey.step('When I call GET /products?sort=price,asc for pages 1 and 2', async () => {
      p1 = await api.get<Paged>(EP.products, { params: { sort: REQ.SORT_PARAM, page: 1 } });
      p2 = await api.get<Paged>(EP.products, { params: { sort: REQ.SORT_PARAM, page: 2 } });
      expect(p1.status, 'precondition: page 1 answers').toBe(200);
      expect(p2.status, 'precondition: page 2 answers').toBe(200);
    });
    await journey.step('Then the products are in ascending price order within page 1 and across the page boundary', async () => {
      const prices = [...(p1.body?.data ?? []), ...(p2.body?.data ?? [])].map(priceOf);
      expect(prices.length, 'precondition: the catalogue has more than one product').toBeGreaterThan(1);
      const breaks = prices.flatMap((p, i) => (i > 0 && prices[i - 1] > p ? [`${prices[i - 1]} > ${p} at #${i}`] : []));
      expect(breaks, '[REQ AC-4] GET /products?sort=price,asc returns the products in ascending price order').toEqual([]);
    });
  });

  test('SCN-008: Filtering the web shop by the category "Hammer" shows only hammers', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey }) => {
    const categoryByName = new Map<string, string>();
    await journey.step('Given I know the category of every product from the unfiltered catalogue', async () => {
      const all = await allPages(api, EP.products);
      expect(all.first.status, 'precondition: GET /products answers').toBe(200);
      for (const p of all.items) categoryByName.set(nameOf(p).trim(), categoryNameOf(p));
    });
    await journey.step('And I am on the web shop catalogue', () => catalogue(page));
    await journey.step('When I filter by the category "Hammer"', async () => {
      const answered = page.waitForResponse((r) => new URL(r.url()).pathname.endsWith('/products'), { timeout: 20_000 });
      await page.getByRole('checkbox', { name: REQ.CATEGORY, exact: true }).check();
      await answered; // the web shop re-reads its product list after the filter changes
      await expect(productNames(page).first(), 'the filtered list is shown (precondition)').toBeVisible();
    });
    await journey.step('Then every product shown is in the category "Hammer"', async () => {
      await expect(productNames(page).first(), 'precondition: products are shown').toBeVisible();
      await expect.poll(async () => {
        const names = await productNames(page).allInnerTexts();
        return names.filter((n) => categoryByName.get(n.trim()) !== REQ.CATEGORY);
      }, { message: '[REQ AC-5] web shop filtered by "Hammer" shows only hammers', timeout: 10_000 }).toEqual([]);
    });
  });

  test('SCN-009: GET /products?by_category=<id of Hammer> returns only hammers', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let hammerId = '';
    let res!: { first: ApiResponse<Paged>; items: Product[] };
    await journey.step('Given I read the id of the category "Hammer" from GET /categories/tree', async () => {
      hammerId = await seed.step('id of the category "Hammer"', async () => {
        const tree = await api.get(EP.categoriesTree);
        const id = findCategoryId(tree.body, REQ.CATEGORY);
        expect(id, 'precondition: GET /categories/tree lists the category "Hammer"').toBeTruthy();
        return id!;
      });
    });
    await journey.step('When I call GET /products?by_category=<id of Hammer>', async () => { res = await allPages(api, EP.products, { by_category: hammerId }); });
    await journey.step('Then every product in data, on every page, is in the category "Hammer"', async () => {
      expect(res.first.status, 'precondition: GET /products?by_category answers').toBe(200);
      expect(res.items.length, 'precondition: the filter returns at least one product').toBeGreaterThan(0);
      const wrong = res.items.filter((p) => categoryNameOf(p) !== REQ.CATEGORY).map((p) => `${nameOf(p)} (${categoryNameOf(p)})`);
      expect(wrong, '[REQ AC-5] GET /products?by_category=<id of Hammer> returns only products in that category').toEqual([]);
    });
  });

  test('SCN-010: The web shop shows 12 products per page', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the web shop catalogue', () => catalogue(page));
    await journey.step('Then page 1 shows 12 products', async () => {
      await expect(productNames(page).first(), 'precondition: products are shown').toBeVisible();
      await expect(productNames(page), '[REQ AC-6] web shop page 1 shows 12 products').toHaveCount(REQ.PER_PAGE);
    });
    await journey.step('And a further page of results can be opened', async () => {
      const firstNames = await productNames(page).allInnerTexts();
      await page.getByRole('button', { name: 'Page-2', exact: true }).click();
      await expect.poll(async () => (await productNames(page).allInnerTexts()).join('|') !== firstNames.join('|'),
        { message: '[REQ AC-6] the web shop opens a further page of results', timeout: 10_000 }).toBe(true);
    });
  });

  test('SCN-011: The catalogue API pages its answers with 12 products per page', { tag: ['@AC-6', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
    let list!: ApiResponse<Paged>;
    let found!: ApiResponse<Paged>;
    await journey.step('When I call GET /products and GET /products/search?q=pliers', async () => {
      list = await api.get<Paged>(EP.products);
      found = await api.get<Paged>(EP.productsSearch, { params: { q: REQ.TERM } });
    });
    const SHAPE = { current_page: 'integer', data: 'array', per_page: 'integer', total: 'integer', last_page: 'integer' } as const;
    await journey.step('Then each answer has current_page, data, per_page, total and last_page', async () => {
      expect.soft(checkShape(list.body, SHAPE, 'GET /products'), '[REQ AC-6] GET /products has current_page, data, per_page, total, last_page').toEqual([]);
      expect.soft(checkShape(found.body, SHAPE, 'GET /products/search'), '[REQ AC-6] GET /products/search has current_page, data, per_page, total, last_page').toEqual([]);
    });
    await journey.step('And each answer has per_page 12', async () => {
      expect.soft(Number(list.body?.per_page), '[REQ AC-6] GET /products per_page 12').toBe(REQ.PER_PAGE);
      expect.soft(Number(found.body?.per_page), '[REQ AC-6] GET /products/search per_page 12').toBe(REQ.PER_PAGE);
    });
    await journey.step('And GET /products page 1 holds 12 products', async () => {
      expect(Number(list.body?.total), 'precondition: the catalogue has more than 12 products').toBeGreaterThan(REQ.PER_PAGE);
      expect(list.body?.data?.length, '[REQ AC-6] GET /products page 1 holds 12 products').toBe(REQ.PER_PAGE);
    });
  });

  const EMPTY_TERMS: { label: string; params: Record<string, string> }[] = [
    { label: 'q omitted', params: {} },
    { label: 'q empty ("")', params: { q: '' } },
  ];
  EMPTY_TERMS.forEach((row, i) => {
    test(`SCN-012.${i + 1}: An empty search returns all products (${row.label})`, { tag: ['@AC-7', '@type:functional', '@layer:api', '@P2', '@needs-clarification'] }, async ({ api, journey }) => {
      let allTotal = -1;
      let res!: ApiResponse<Paged>;
      await journey.step('Given I read the total of the unfiltered GET /products', async () => {
        const all = await api.get<Paged>(EP.products);
        expect(all.status, 'precondition: GET /products answers').toBe(200);
        allTotal = Number(all.body?.total);
        expect(allTotal, 'precondition: the catalogue has products').toBeGreaterThan(0);
      });
      await journey.step(`When I call GET /products/search with ${row.label}`, async () => { res = await api.get<Paged>(EP.productsSearch, { params: row.params }); });
      await journey.step('Then its total equals the total of the unfiltered GET /products', async () => {
        expect(Number((res.body as Partial<Paged> | undefined)?.total), `[REQ AC-7] GET /products/search (${row.label}) returns all products`).toBe(allTotal);
      });
    });
  });

  test('SCN-013: The web shop and the search API find the same products', { tag: ['@AC-1', '@AC-2', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey }) => {
    let apiNames: string[] = [];
    await journey.step('Given I call GET /products/search?q=pliers', async () => {
      const res = await api.get<Paged>(EP.productsSearch, { params: { q: REQ.TERM } });
      expect(res.status, 'precondition: the search API answers').toBe(200);
      apiNames = (res.body?.data ?? []).map((p) => nameOf(p).trim()).sort();
    });
    await journey.step('And I am on the web shop catalogue', () => catalogue(page));
    await journey.step('When I search the web shop for "pliers"', () => search(page, REQ.TERM));
    await journey.step('Then the web shop shows the same products as the first page of the API answer', async () => {
      await expect(productNames(page).first(), 'precondition: the web shop shows products').toBeVisible();
      await expect.poll(async () => (await productNames(page).allInnerTexts()).map((n) => n.trim()).sort(),
        { message: '[REQ AC-1] the web shop shows the same products as GET /products/search?q=pliers', timeout: 10_000 }).toEqual(apiNames);
    });
  });
});
