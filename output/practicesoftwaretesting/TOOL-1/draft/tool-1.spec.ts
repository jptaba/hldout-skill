/**
 * Held-out acceptance tests for TOOL-1 — "Catalogue search, sorting and category filter".
 * Written from requirement-contract.json (the requirement only; never from the AUT's code). The steps call the
 * actions in actions/practicesoftwaretesting/ (npm run heldout -- actions TOOL-1); every expectation stays here.
 */
import { test, expect, expectResponse, checkShape, unique, type ApiResponse, type ShapeRule } from '../../../../heldout-support/fixtures';
import { openCatalogue } from '../../../../actions/practicesoftwaretesting/ui/catalogue/open-catalogue';
import { searchCatalogue } from '../../../../actions/practicesoftwaretesting/ui/catalogue/search-catalogue';
import { chooseSortOrder } from '../../../../actions/practicesoftwaretesting/ui/catalogue/choose-sort-order';
import { filterCatalogueByCategory } from '../../../../actions/practicesoftwaretesting/ui/catalogue/filter-catalogue-by-category';
import { readProductCards } from '../../../../actions/practicesoftwaretesting/ui/catalogue/read-product-cards';
import { readWholeCatalogue } from '../../../../actions/practicesoftwaretesting/api/products/read-whole-catalogue';
import { findCategoryId } from '../../../../actions/practicesoftwaretesting/api/categories/find-category-id';
import { categoryIdOf, priceOf, type ProductPage } from '../../../../actions/practicesoftwaretesting/api/products/_shared';

// G3 (provided by the user): GET /products (sort, filter, pagination) and the empty search return 200.
// G4 (provided by the user): an empty search is a normal paginated answer whose total equals the whole catalogue
//   (the same total as GET /products).
// G5 (provided by the user): an empty search is the search endpoint called with q= with no value.
// G6 (provided by the user): the web shop search must also ignore letter case, like the API (R1).
// G1, G2 (mechanics, open): the catalogue page's route and locators, where the Hammer id sits in GET /categories/tree
//   and how a product's category shows: guessed in the actions, marked TODO(harden), discovered while hardening.
// ASSUMPTION: product lists are compared one page at a time (the first page of each answer); the search term used
//   ("pliers") is expected to fit one page.

// @req-constants-start — expected outcomes copied verbatim from TOOL-1 (never edit during hardening)
const REQ = {
  SEARCH_CAPTION: 'Searched for: <term>',
  NO_RESULTS: 'There are no products found.',
  SORT_PRICE_ASC: 'Price (Low - High)',
  PER_PAGE: 12,
  STATUS: { OK: 200 },
  PAGINATED_FIELDS: ['current_page', 'data', 'per_page', 'total', 'last_page'],
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** GET /products */ products: '/products',
  /** GET /products/search */ productsSearch: '/products/search',
  /** GET /categories/tree */ categoriesTree: '/categories/tree',
};

type Answer = ApiResponse<ProductPage>;
const containsTerm = (name: string, term: string) => name.toLowerCase().includes(term.toLowerCase());
const isAscending = (xs: number[]) => xs.every((x, i) => i === 0 || xs[i - 1] <= x);
const byName = (a: string, b: string) => a.localeCompare(b);

test.describe('TOOL-1 Catalogue search, sorting and category filter', () => {
  // ---- AC-1 ------------------------------------------------------------------------------------------------------

  // from story.md#L23 (letter case: G6, provided by the user)
  test('SCN-001: A shopper searches the web shop and sees only matching products and the caption', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
    const term: string = data.search.term;
    await journey.step('Given I am on the web shop catalogue page', () => openCatalogue(page));
    await journey.step(`When I search for "${term}"`, () => searchCatalogue(page, term));
    await journey.step(`Then I see the caption "Searched for: ${term}"`, async () => {
      await expect(page.getByText(REQ.SEARCH_CAPTION.replace('<term>', term)), '[REQ AC-1] the caption "Searched for: <term>" is shown').toBeVisible();
    });
    await journey.step(`Then every product shown has a name that contains "${term}", in any letter case`, async () => {
      await expect.poll(async () => {
        const cards = await readProductCards(page);
        return cards.length === 0 ? ['(no products shown)'] : cards.filter((c) => !containsTerm(c.name, term)).map((c) => c.name);
      }, { message: `[REQ AC-1] every product shown has a name containing "${term}" (products shown that don't)`, timeout: 10_000 }).toEqual([]);
    });
  });

  // from story.md#L18 (R1: the web shop and the API behave the same), story.md#L23-L24, G6
  test('SCN-002: The web shop search for "PLIERS" shows the products the API finds for "pliers"', { tag: ['@AC-1', '@AC-2', '@type:integration', '@layer:ui', '@P2'] }, async ({ page, api, journey, data }) => {
    const upper: string = data.search.termUpperCase; const lower: string = data.search.term;
    let apiNames: string[] = [];
    await journey.step(`Given the mobile app searches GET /products/search?q=${lower}`, async () => {
      const res = await api.get<ProductPage>(EP.productsSearch, { params: { q: lower } });
      expect(res.ok && Array.isArray(res.body?.data), `GET /products/search?q=${lower} lists products (precondition; SCN-003 checks the answer)`).toBe(true);
      apiNames = res.body.data.map((p) => p.name).sort(byName);
      expect(apiNames.length, `the API finds products for "${lower}" (precondition: test data)`).toBeGreaterThan(0);
    });
    await journey.step('Given I am on the web shop catalogue page', () => openCatalogue(page));
    await journey.step(`When I search the web shop for "${upper}"`, () => searchCatalogue(page, upper));
    await journey.step(`Then the web shop shows the same products as GET /products/search?q=${lower}`, async () => {
      await expect.poll(async () => (await readProductCards(page)).map((c) => c.name).sort(byName),
        { message: `[REQ AC-1] the web shop search for "${upper}" shows the products GET /products/search?q=${lower} returns`, timeout: 10_000 }).toEqual(apiNames);
    });
  });

  // ---- AC-2 ------------------------------------------------------------------------------------------------------

  // from story.md#L24
  test('SCN-003: GET /products/search finds only products whose name contains the term, in any letter case', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    const lower: string = data.search.term; const upper: string = data.search.termUpperCase;
    let resLower!: Answer; let resUpper!: Answer;
    await journey.step(`When I GET /products/search?q=${lower}`, async () => { resLower = await api.get<ProductPage>(EP.productsSearch, { params: { q: lower } }); });
    await journey.step(`When I GET /products/search?q=${upper}`, async () => { resUpper = await api.get<ProductPage>(EP.productsSearch, { params: { q: upper } }); });
    await journey.step('Then both answer 200', async () => {
      expectResponse(resLower, { status: REQ.STATUS.OK }, `[REQ AC-2] GET /products/search?q=${lower}`);
      expectResponse(resUpper, { status: REQ.STATUS.OK }, `[REQ AC-2] GET /products/search?q=${upper}`);
    });
    await journey.step(`Then every product in data has a name that contains "${lower}"`, async () => {
      const found = resLower.body?.data ?? [];
      expect(found.length, `GET /products/search?q=${lower} finds products (precondition: test data)`).toBeGreaterThan(0);
      expect.soft(found.filter((p) => !containsTerm(p.name, lower)).map((p) => p.name),
        `[REQ AC-2] GET /products/search?q=${lower} returns only products whose name contains the term (those that don't)`).toEqual([]);
    });
    await journey.step(`Then searching "${upper}" finds the same products as "${lower}"`, async () => {
      const ids = (r: Answer) => (r.body?.data ?? []).map((p) => String(p.id)).sort();
      expect.soft(ids(resUpper), `[REQ AC-2] GET /products/search?q=${upper} finds the same products as q=${lower}`).toEqual(ids(resLower));
    });
  });

  // from story.md#L20 (the answer's shape), story.md#L24, story.md#L28-L29
  test('SCN-004: The catalogue API answers with the paginated shape { current_page, data, per_page, total, last_page }', { tag: ['@AC-2', '@AC-6', '@AC-7', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
    const present: ShapeRule = () => true;
    const schema = Object.fromEntries(REQ.PAGINATED_FIELDS.map((f) => [f, f === 'data' ? 'array' : present])) as Record<string, ShapeRule>;
    const calls: { ac: string; label: string; path: string; params?: Record<string, string> }[] = [
      { ac: 'AC-2', label: `GET /products/search?q=${data.search.term}`, path: EP.productsSearch, params: { q: data.search.term } },
      { ac: 'AC-7', label: 'GET /products/search?q=', path: `${EP.productsSearch}?q=` },
      { ac: 'AC-6', label: 'GET /products', path: EP.products },
    ];
    for (const c of calls) {
      let res!: ApiResponse;
      await journey.step(`When I ${c.label}`, async () => { res = await api.get(c.path, c.params ? { params: c.params } : {}); });
      await journey.step('Then the answer has current_page, data (a list), per_page, total and last_page', async () => {
        expect.soft(checkShape(res.body, schema, c.label), `[REQ ${c.ac}] ${c.label} returns { current_page, data: [products], per_page, total, last_page }`).toEqual([]);
      });
    }
  });

  // ---- AC-3 ------------------------------------------------------------------------------------------------------

  // from story.md#L25
  test('SCN-005: A web shop search without matches shows "There are no products found."', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
    const nothing = unique('nomatch'); // a term no product name contains
    await journey.step('Given I am on the web shop catalogue page', () => openCatalogue(page));
    await journey.step(`When I search for "${nothing}", which no product matches`, () => searchCatalogue(page, nothing));
    await journey.step('Then I see "There are no products found."', async () => {
      await expect(page.getByText(REQ.NO_RESULTS), '[REQ AC-3] "There are no products found." is shown').toBeVisible();
    });
  });

  // from story.md#L25
  test('SCN-006: GET /products/search without matches returns 200, an empty data list and total 0', { tag: ['@AC-3', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    const nothing = unique('nomatch'); // a term no product name contains
    let res!: Answer;
    await journey.step(`When I GET /products/search?q=${nothing}`, async () => { res = await api.get<ProductPage>(EP.productsSearch, { params: { q: nothing } }); });
    await journey.step('Then the answer is 200 with an empty data list and total 0', async () => {
      expectResponse(res, { status: REQ.STATUS.OK }, '[REQ AC-3] GET /products/search without matches');
      expect.soft(res.body?.data, '[REQ AC-3] GET /products/search without matches returns an empty data list').toEqual([]);
      expect.soft(res.body?.total, '[REQ AC-3] GET /products/search without matches returns total 0').toBe(0);
    });
  });

  // ---- AC-4 ------------------------------------------------------------------------------------------------------

  // from story.md#L26
  test('SCN-007: Choosing "Price (Low - High)" lists the web shop products by ascending price', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the web shop catalogue page', () => openCatalogue(page));
    await journey.step('When I choose "Price (Low - High)"', () => chooseSortOrder(page, REQ.SORT_PRICE_ASC));
    await journey.step('Then the products are listed by ascending price', async () => {
      await expect.poll(async () => {
        const prices = (await readProductCards(page)).map((c) => c.price);
        return prices.length > 0 && isAscending(prices) ? 'ascending' : prices.join(', ') || '(no products shown)';
      }, { message: '[REQ AC-4] after choosing "Price (Low - High)" the products are listed by ascending price (prices shown otherwise)', timeout: 10_000 }).toBe('ascending');
    });
  });

  // from story.md#L26 (status: G3, provided by the user)
  test('SCN-008: GET /products?sort=price,asc returns the products in ascending price order', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let first!: Answer; let second: Answer | undefined;
    await journey.step('When I GET /products?sort=price,asc, and its second page', async () => {
      first = await api.get<ProductPage>(EP.products, { params: { sort: 'price,asc' } });
      if ((first.body?.last_page ?? 1) >= 2) second = await api.get<ProductPage>(EP.products, { params: { sort: 'price,asc', page: 2 } }); // TODO(harden)
    });
    await journey.step('Then the answer is 200', async () => {
      expectResponse(first, { status: REQ.STATUS.OK }, '[REQ AC-4] GET /products?sort=price,asc');
    });
    await journey.step('Then the products come in ascending price order, across the pages', async () => {
      const prices = [...(first.body?.data ?? []), ...(second?.body?.data ?? [])].map(priceOf);
      expect(prices.length, 'GET /products?sort=price,asc lists products (precondition)').toBeGreaterThan(0);
      expect.soft(prices, '[REQ AC-4] GET /products?sort=price,asc returns the products in ascending price order').toEqual([...prices].sort((a, b) => a - b));
    });
  });

  // ---- AC-5 ------------------------------------------------------------------------------------------------------

  // from story.md#L27, story.md#L32 (R2: category ids from GET /categories/tree)
  test('SCN-009: Filtering the web shop by the category "Hammer" shows only hammers', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P1', '@depends:SCN-012'] }, async ({ page, api, journey, data, seed }) => {
    const category: string = data.category;
    let hammers = new Set<string>();
    await journey.step(`Given the catalogue's products in the category "${category}" (GET /categories/tree, GET /products)`, async () => {
      const id = await findCategoryId(api, seed, category);
      hammers = new Set((await readWholeCatalogue(api, seed)).filter((p) => categoryIdOf(p) === id).map((p) => p.name));
      expect(hammers.size, `the catalogue has products in "${category}" (precondition)`).toBeGreaterThan(0);
    });
    await journey.step('Given I am on the web shop catalogue page', () => openCatalogue(page));
    await journey.step(`When I filter by the category "${category}"`, () => filterCatalogueByCategory(page, category));
    await journey.step('Then only hammers are shown', async () => {
      await expect.poll(async () => {
        const names = (await readProductCards(page)).map((c) => c.name);
        return names.length === 0 ? ['(no products shown)'] : names.filter((n) => !hammers.has(n));
      }, { message: `[REQ AC-5] filtering by "${category}" shows only products in that category (products shown that aren't)`, timeout: 10_000 }).toEqual([]);
    });
  });

  // from story.md#L27, story.md#L32 (status: G3, provided by the user)
  test('SCN-010: GET /products?by_category=<id of Hammer> returns only products in that category', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    const category: string = data.category;
    let id = ''; let res!: Answer;
    await journey.step(`Given the id of the category "${category}" from GET /categories/tree`, async () => { id = await findCategoryId(api, seed, category); });
    await journey.step(`When I GET /products?by_category=<id of ${category}>`, async () => { res = await api.get<ProductPage>(EP.products, { params: { by_category: id } }); });
    await journey.step('Then the answer is 200', async () => {
      expectResponse(res, { status: REQ.STATUS.OK }, '[REQ AC-5] GET /products?by_category=<id of Hammer>');
    });
    await journey.step(`Then every product in data is in the category "${category}"`, async () => {
      const found = res.body?.data ?? [];
      expect(found.length, `GET /products?by_category lists products (precondition: the catalogue has ${category} products)`).toBeGreaterThan(0);
      expect.soft(found.filter((p) => categoryIdOf(p) !== id).map((p) => p.name),
        '[REQ AC-5] GET /products?by_category=<id of Hammer> returns only products in that category (those that aren\'t)').toEqual([]);
    });
  });

  // ---- AC-6 ------------------------------------------------------------------------------------------------------

  // from story.md#L28
  test('SCN-011: The web shop shows 12 products on a full page of results', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P1', '@depends:SCN-012'] }, async ({ page, api, journey, seed }) => {
    await journey.step('Given the catalogue has more than 12 products (GET /products)', async () => {
      await seed.step('catalogue total (GET /products)', async () => {
        const res = await api.get<ProductPage>(EP.products);
        expect(Number(res.body?.total), 'the catalogue fills its first page (precondition)').toBeGreaterThan(REQ.PER_PAGE);
      });
    });
    await journey.step('When I open the web shop catalogue page', () => openCatalogue(page));
    await journey.step('Then it shows 12 products', async () => {
      await expect.poll(async () => (await readProductCards(page)).length,
        { message: '[REQ AC-6] a full page of results shows 12 products', timeout: 10_000 }).toBe(REQ.PER_PAGE);
    });
  });

  // from story.md#L28 (status: G3, provided by the user)
  test('SCN-012: GET /products answers per_page 12 with 12 products on a full page', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    let list!: Answer; let search!: Answer;
    await journey.step('When I GET /products', async () => { list = await api.get<ProductPage>(EP.products); });
    await journey.step(`When I GET /products/search?q=${data.search.term}`, async () => { search = await api.get<ProductPage>(EP.productsSearch, { params: { q: data.search.term } }); });
    await journey.step('Then GET /products answers 200 with per_page 12 and 12 products in data', async () => {
      expectResponse(list, { status: REQ.STATUS.OK }, '[REQ AC-6] GET /products');
      expect.soft(list.body?.per_page, '[REQ AC-6] GET /products returns per_page 12').toBe(REQ.PER_PAGE);
      expect(Number(list.body?.total), 'the catalogue fills its first page (precondition)').toBeGreaterThanOrEqual(REQ.PER_PAGE);
      expect.soft(list.body?.data?.length, '[REQ AC-6] GET /products holds 12 products in data on a full page').toBe(REQ.PER_PAGE);
    });
    await journey.step('Then GET /products/search answers per_page 12 too', async () => {
      expect.soft(search.body?.per_page, `[REQ AC-6] GET /products/search?q=${data.search.term} returns per_page 12`).toBe(REQ.PER_PAGE);
    });
  });

  // A table of cases: the pages around the limit of 12 per page (SCN-013.1 … .2)
  const PAGE_CASES = [
    { name: 'the page before the last holds exactly 12 products', which: 'before-last' },
    { name: 'the last page holds the rest (1 to 12) and last_page is total / 12 rounded up', which: 'last' },
  ] as const;
  PAGE_CASES.forEach((row, i) => {
    // from story.md#L28
    test(`SCN-013.${i + 1}: GET /products pagination at 12 per page: ${row.name}`, { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P2', '@depends:SCN-012'] }, async ({ api, journey, seed }) => {
      let total = 0; let lastPage = 0; let res!: Answer;
      await journey.step('Given the catalogue holds more than 12 products (GET /products)', async () => {
        await seed.step('catalogue total and last page (GET /products)', async () => {
          const r = await api.get<ProductPage>(EP.products);
          total = Number(r.body?.total); lastPage = Number(r.body?.last_page);
          expect(total, 'the catalogue spans more than one page (precondition)').toBeGreaterThan(REQ.PER_PAGE);
          expect(lastPage, 'GET /products names its last page (precondition)').toBeGreaterThanOrEqual(1);
        });
      });
      const pageNo = () => (row.which === 'last' ? lastPage : lastPage - 1);
      await journey.step(`When I GET /products for ${row.which === 'last' ? 'the last page' : 'the page before the last'}`, async () => {
        res = await api.get<ProductPage>(EP.products, { params: { page: pageNo() } }); // TODO(harden)
      });
      await journey.step(`Then ${row.name}`, async () => {
        if (row.which === 'before-last') {
          expect.soft(res.body?.data?.length, `[REQ AC-6] GET /products page ${pageNo()} (before the last) holds 12 products`).toBe(REQ.PER_PAGE);
        } else {
          expect.soft(lastPage, `[REQ AC-6] GET /products last_page is the total (${total}) / 12 rounded up`).toBe(Math.ceil(total / REQ.PER_PAGE));
          expect.soft(res.body?.data?.length, `[REQ AC-6] GET /products last page holds the rest of the ${total} products at 12 per page`).toBe(total - REQ.PER_PAGE * (lastPage - 1));
        }
      });
    });
  });

  // ---- AC-7 ------------------------------------------------------------------------------------------------------

  // from story.md#L29 (status G3, meaning G4, request G5: provided by the user)
  test('SCN-014: An empty search (q= with no value) returns all products: total equals the catalogue total', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1', '@depends:SCN-012'] }, async ({ api, journey, seed }) => {
    let catalogueTotal = 0; let res!: Answer;
    await journey.step('Given the whole catalogue\'s total from GET /products', async () => {
      catalogueTotal = await seed.step('catalogue total (GET /products)', async () => {
        const r = await api.get<ProductPage>(EP.products);
        expect(Number(r.body?.total), 'GET /products has a total (precondition)').toBeGreaterThan(0);
        return Number(r.body.total);
      });
    });
    await journey.step('When I GET /products/search?q= (no term)', async () => { res = await api.get<ProductPage>(`${EP.productsSearch}?q=`); });
    await journey.step('Then the answer is 200 and its total equals the whole catalogue', async () => {
      expectResponse(res, { status: REQ.STATUS.OK }, '[REQ AC-7] GET /products/search?q=');
      expect.soft(res.body?.total, '[REQ AC-7] GET /products/search?q= returns all products: total equals GET /products total').toBe(catalogueTotal);
    });
  });
});
