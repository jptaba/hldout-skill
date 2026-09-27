/**
 * Held-out acceptance tests for TOOL-1 — "Catalogue search, sorting and category filter".
 * Written from evaluations/TOOL-1/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import { test, expect, gotoPage, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';
import type { Page } from '@playwright/test';

// @req-constants-start — expected outcomes copied verbatim from TOOL-1 (never edit during hardening)
const REQ = {
  STATUS: { OK: 200 },
  TERM: 'pliers',
  CAPTION: 'Searched for: pliers',
  NO_RESULTS: 'There are no products found.',
  SORT_LABEL: 'Price (Low - High)',
  CATEGORY: 'Hammer',
  PER_PAGE: 12,
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = { products: '/products', search: '/products/search', categories: '/categories/tree' };

interface Product { id: string; name: string; price: number; category?: { name: string } }
interface Page_ { data: Product[]; total: number; per_page: number; last_page: number }
interface Category { id: string; name: string; sub_categories?: Category[] }

// ---- mechanics ------------------------------------------------------------------------------------
const cards = (page: Page) => page.getByTestId(/^product-/);
async function search(page: Page, term: string) {
  await page.getByTestId('search-query').fill(term);
  await page.getByTestId('search-submit').click();
  await expect(page.getByTestId('search-caption')).toBeVisible();
}
async function shownNames(page: Page): Promise<string[]> {
  await expect(cards(page).first()).toBeVisible();
  return page.getByTestId('product-name').allInnerTexts().then((xs) => xs.map((x) => x.trim()));
}
async function shownPrices(page: Page): Promise<number[]> {
  await expect(cards(page).first()).toBeVisible();
  return page.getByTestId('product-price').allInnerTexts().then((xs) => xs.map((x) => Number(x.replace(/[^0-9.]/g, ''))));
}
const ascending = (xs: number[]) => xs.every((x, i) => i === 0 || xs[i - 1] <= x);
async function categoryId(seed: Seed, api: Api, name: string): Promise<string> {
  return seed.step(`look up the id of category "${name}"`, async () => {
    const r = await api.get<Category[]>(EP.categories);
    expect(r.status, 'categories tree (pre-step)').toBe(REQ.STATUS.OK);
    const walk = (cs: Category[]): Category | undefined => cs.map((c) => (c.name === name ? c : walk(c.sub_categories ?? []))).find(Boolean);
    const hit = walk(r.body);
    expect(hit, `category "${name}" exists (pre-step)`).toBeTruthy();
    return hit!.id;
  });
}
/** All products of a listing (every page). */
async function allPages(api: Api, params: Record<string, string>): Promise<Product[]> {
  const first = await api.get<Page_>(EP.products, { params: { ...params, page: 1 } });
  const out = [...first.body.data];
  for (let p = 2; p <= first.body.last_page; p++) out.push(...(await api.get<Page_>(EP.products, { params: { ...params, page: p } })).body.data);
  return out;
}

test.describe('TOOL-1 Catalogue search, sorting and category filter', () => {
  test('SCN-001: Searching the web shop shows only matching products and a caption', { tag: ['@AC-1', '@type:functional', '@layer:ui'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); });
    await journey.step('When I search for "pliers"', async () => { await search(page, REQ.TERM); });
    await journey.step('Then every product shown has "pliers" in its name', async () => {
      const names = await shownNames(page);
      expect(names.filter((n) => !n.toLowerCase().includes(REQ.TERM)), '[REQ AC-1] only matching products shown').toEqual([]);
    });
    await journey.step('And the caption reads "Searched for: pliers"', async () => {
      await expect(page.getByTestId('search-title'), '[REQ AC-1] search caption').toHaveText(REQ.CAPTION);
    });
  });

  test('SCN-002: The search API returns only matching products', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
    let r!: ApiResponse<Page_>;
    await journey.step('When I GET /products/search?q=pliers', async () => { r = await api.get(EP.search, { params: { q: REQ.TERM } }); });
    await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-2] search → 200').toBe(REQ.STATUS.OK); });
    await journey.step('And every product in data has "pliers" in its name', async () => {
      expect(r.body.data.length, 'the sample term finds products').toBeGreaterThan(0);
      expect(r.body.data.map((p) => p.name).filter((n) => !n.toLowerCase().includes(REQ.TERM)), '[REQ AC-2] only matching products').toEqual([]);
    });
  });

  test('SCN-003: The search API ignores letter case', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
    let upper: string[] = []; let lower: string[] = [];
    await journey.step('When I GET /products/search with q=PLIERS and with q=pliers', async () => {
      upper = (await api.get<Page_>(EP.search, { params: { q: REQ.TERM.toUpperCase() } })).body.data.map((p) => p.id).sort();
      lower = (await api.get<Page_>(EP.search, { params: { q: REQ.TERM } })).body.data.map((p) => p.id).sort();
    });
    await journey.step('Then both return the same products', async () => { expect(upper, '[REQ AC-2] case-insensitive search').toEqual(lower); });
  });

  test('SCN-004: A search without matches says so on the web shop and in the API', { tag: ['@AC-3', '@type:negative', '@layer:e2e'] }, async ({ page, api, journey }) => {
    const term = `zzq${Date.now().toString(36)}`;
    await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); });
    await journey.step('When I search for a term that matches nothing', async () => { await search(page, term); });
    await journey.step('Then the web shop shows "There are no products found."', async () => {
      await expect(page.getByTestId('no-results'), '[REQ AC-3] no-results message').toHaveText(REQ.NO_RESULTS);
    });
    await journey.step('And GET /products/search for that term returns 200 with an empty data list and total 0', async () => {
      const r = await api.get<Page_>(EP.search, { params: { q: term } });
      expect(r.status, '[REQ AC-3] no-match search → 200').toBe(REQ.STATUS.OK);
      expect({ data: r.body.data, total: r.body.total }, '[REQ AC-3] empty result').toEqual({ data: [], total: 0 });
    });
  });

  test('SCN-005: Sorting by price, low to high', { tag: ['@AC-4', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey }) => {
    await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
    await journey.step('When I choose "Price (Low - High)"', async () => {
      const before = await page.getByTestId('product-name').allInnerTexts();
      await page.getByTestId('sort').selectOption({ label: REQ.SORT_LABEL });
      await expect.poll(async () => (await page.getByTestId('product-name').allInnerTexts()).join('|')).not.toBe(before.join('|'));
    });
    await journey.step('Then the prices shown are in ascending order', async () => {
      const prices = await shownPrices(page);
      expect(ascending(prices), `[REQ AC-4] web shop prices ascending: ${prices.join(', ')}`).toBe(true);
    });
    await journey.step('And GET /products?sort=price,asc returns prices in ascending order', async () => {
      const prices = (await api.get<Page_>(EP.products, { params: { sort: 'price,asc' } })).body.data.map((p) => Number(p.price));
      expect(ascending(prices), `[REQ AC-4] API prices ascending: ${prices.join(', ')}`).toBe(true);
    });
  });

  test('SCN-006: Filtering by the category "Hammer"', { tag: ['@AC-5', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey, seed }) => {
    let id = ''; let hammers: Product[] = [];
    await journey.step('Given I know the id of the category "Hammer"', async () => {
      id = await categoryId(seed, api, REQ.CATEGORY);
      hammers = await seed.step('list the products of the category (all pages)', () => allPages(api, { by_category: id }));
    });
    await journey.step('And I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
    await journey.step('When I tick the category "Hammer"', async () => {
      const before = await page.getByTestId('product-name').allInnerTexts();
      await page.getByRole('checkbox', { name: REQ.CATEGORY, exact: true }).check();
      await expect.poll(async () => (await page.getByTestId('product-name').allInnerTexts()).join('|')).not.toBe(before.join('|'));
    });
    await journey.step('Then every product shown is a Hammer product', async () => {
      const allowed = new Set(hammers.map((p) => p.name));
      const names = await shownNames(page);
      expect(names.filter((n) => !allowed.has(n)), '[REQ AC-5] web shop shows only hammers').toEqual([]);
    });
    await journey.step('And GET /products?by_category=<Hammer id> returns only products in the category Hammer', async () => {
      expect(hammers.length, 'the category has products').toBeGreaterThan(0);
      expect(hammers.filter((p) => p.category?.name !== REQ.CATEGORY).map((p) => `${p.name} (${p.category?.name})`), '[REQ AC-5] API returns only Hammer products').toEqual([]);
    });
  });

  test('SCN-007: Pages hold 12 products', { tag: ['@AC-6', '@type:boundary', '@layer:e2e'] }, async ({ page, api, journey }) => {
    await journey.step('Given I am on the web shop catalogue', async () => { await gotoPage(page, '/'); await expect(cards(page).first()).toBeVisible(); });
    await journey.step('Then the first page shows 12 products', async () => { await expect.soft(cards(page), '[REQ AC-6] 12 products per page on the web shop').toHaveCount(REQ.PER_PAGE); });
    await journey.step('And GET /products reports per_page 12', async () => {
      expect.soft((await api.get<Page_>(EP.products)).body.per_page, '[REQ AC-6] API per_page').toBe(REQ.PER_PAGE);
    });
  });

  test('SCN-008: An empty search returns all products', { tag: ['@AC-7', '@type:functional', '@layer:api'] }, async ({ api, journey }) => {
    let empty!: ApiResponse<Page_>;
    await journey.step('When I GET /products/search with an empty q', async () => { empty = await api.get(EP.search, { params: { q: '' } }); });
    await journey.step('Then its total equals the total of GET /products', async () => {
      const all = (await api.get<Page_>(EP.products)).body.total;
      expect(empty.body.total, `[REQ AC-7] empty search returns all ${all} products`).toBe(all);
    });
  });
});
