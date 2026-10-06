import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { RequirementContract } from '../.github/scripts/contract-model';
import { checkIntegrity, snapshotDraft } from '../.github/scripts/integrity-check';
import {
  allJourneys, allRequires, conflictSides, directRequires, duplicateJourneys, emptyRegistry, journeyUse, journeysIn, journeysUsedBy, kebab, lintJourneys, mergeRegistries,
  observedRequires, oracleLiterals, parseRegistry, relevantJourney, renderRegistry, statusOf, storyJourneys, syncRegistry, type Registry,
} from '../.github/scripts/journeys-store';
import { readSuite } from '../.github/scripts/spec-model';

const SUPPORT = `'../../heldout-support/fixtures'`;
const FILES: Record<string, string> = {
  'fixtures/favorites.ts': `import { expect, type Api, type Seed, type Account } from ${SUPPORT};

const favouritesIn = (body: unknown) => (Array.isArray(body) ? body : []);

/** Add a product to a customer's favourites; removed after the test. */
export async function addFavourite(api: Api, seed: Seed, me: Account, productId: string) {
  return seed.create('favourite', async () => {
    const res = await api.post<{ id: string }>('/favorites', { headers: me.headers, data: { product_id: productId } });
    expect(res.ok, 'add favourite (seed)').toBe(true);
    return res.body;
  }, (f) => api.delete(\`/favorites/\${f.id}\`, { headers: me.headers }));
}

/** The customer's favourites. */
export const listFavourites = async (api: Api, me: Account) => favouritesIn((await api.get<unknown[]>('/favorites', { headers: me.headers })).body);
`,
  'fixtures/product.ts': `import { expect, gotoPage, type Page } from ${SUPPORT};

/** Open a product's page and wait until it shows the product. */
export async function openProduct(page: Page, id: string) {
  await gotoPage(page, \`/product/\${id}\`);
  await expect(page.getByTestId('product-name')).toBeVisible();
}

export async function clickFavourite(page: Page) {
  await page.getByTestId('add-to-favorites').click();
}

/** Open a product and add it to the favourites from its page. */
export async function favouriteFromPage(page: Page, id: string) {
  await openProduct(page, id);
  await clickFavourite(page);
}
`,
};
const SPEC = `import { test, signIn } from '../../../../heldout-support/fixtures';
import { addFavourite, listFavourites } from '../../../../journeys/fixtures/favorites';
import { openProduct, clickFavourite, favouriteFromPage } from '../../../../journeys/fixtures/product';

const favouriteOf = (api, me, id) => addFavourite(api, null, me, id);

test('SCN-001: adds a favourite', { tag: ['@AC-1', '@type:functional', '@layer:api'] }, async ({ api, seed }) => {
  const me = await seed.account();
  await favouriteOf(api, me, '1');
});
test('SCN-002: lists favourites', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api, seed }) => {
  const me = await seed.account();
  await addFavourite(api, seed, me, '1');
  await listFavourites(api, me);
});
test('SCN-003: favourite in the shop', { tag: ['@AC-3', '@type:integration', '@layer:ui'] }, async ({ page, seed }) => {
  const me = await seed.account();
  await signIn(page, me);
  await openProduct(page, '1');
  await clickFavourite(page);
});
test('SCN-004: favourite from the page', { tag: ['@AC-3', '@type:functional', '@layer:ui'] }, async ({ page, seed }) => {
  await signIn(page, await seed.account());
  await favouriteFromPage(page, '2');
});
`;

/** A project folder with journeys/fixtures/<domain>.ts and one story's spec under output/shop/ABC-1/tests. */
function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-j-'));
  const cfg = { journeysDir: path.join(root, 'journeys'), auts: {} };
  const base = path.join(root, 'journeys');
  for (const [f, src] of Object.entries(FILES)) { fs.mkdirSync(path.dirname(path.join(base, f)), { recursive: true }); fs.writeFileSync(path.join(base, f), src); }
  const tests = path.join(root, 'output', 'shop', 'ABC-1', 'tests');
  fs.mkdirSync(tests, { recursive: true });
  fs.writeFileSync(path.join(tests, 'abc-1.spec.ts'), SPEC);
  return { root, cfg, base, tests, spec: path.join(tests, 'abc-1.spec.ts') };
}
const byName = (cfg: ReturnType<typeof project>['cfg'], name: string) => allJourneys(cfg, 'shop').find((j) => j.name === name)!;

describe('journeys: what the code says', () => {
  const { cfg, base } = project();
  it('reads a domain file: id, kind, doc comment, parameters, calls, routes and locators', () => {
    const [add, list] = journeysIn(path.join(base, 'fixtures', 'favorites.ts'), base);
    assert.equal(add.id, 'api.favorites.add-favourite');
    assert.equal(add.kind, 'api');
    assert.equal(add.domain, 'favorites');
    assert.equal(add.file, 'fixtures/favorites.ts');
    assert.equal(add.summary, "Add a product to a customer's favourites; removed after the test.");
    assert.deepEqual(add.endpoints, ['POST /favorites', 'DELETE /favorites/{}']);
    assert.equal(list.id, 'api.favorites.list-favourites');
    const open = byName(cfg, 'openProduct');
    assert.equal(open.id, 'ui.product.open-product');
    assert.deepEqual(open.routes, ['/product/{}']);
    assert.deepEqual(open.locators, ["getByTestId('product-name')"]);
  });
  it('reads endpoints through the paths a file names once, and hashes code without its comments', () => {
    const file = path.join(base, 'fixtures', 'wishlist.ts');
    const src = "const WISHES = '/wishes';\nconst wish = (id: string) => `/wishes/${id}`;\n/** Add a wish. */\nexport async function addWish(api) {\n  return api.post(WISHES, {});\n}\n/** Drop a wish. */\nexport async function dropWish(api, id) { return api.delete(wish(id)); }\n";
    fs.writeFileSync(file, src);
    const [add, drop] = journeysIn(file, base);
    assert.deepEqual(add.endpoints, ['POST /wishes']);
    assert.deepEqual(drop.endpoints, ['DELETE /wishes/{}']);
    fs.writeFileSync(file, src.replace('  return api.post(WISHES, {});', '  // the fields the API takes\n  return api.post(WISHES, {}); // TODO(harden) the field names'));
    assert.equal(journeysIn(file, base)[0].hash, add.hash, 'a comment is not a change');
    fs.rmSync(file);
  });
  it('the file\'s own helpers are part of the journeys that call them, not journeys themselves', () => {
    assert.ok(!allJourneys(cfg, 'shop').some((j) => j.name === 'favouritesIn'));
  });
  it('a journey calling other journeys lists them, and takes in their routes and locators only through its own code', () => {
    const fav = byName(cfg, 'favouriteFromPage');
    assert.equal(fav.kind, 'ui');
    assert.deepEqual(fav.calls, ['ui.product.click-favourite', 'ui.product.open-product']);
  });
  it('a doc comment\'s first sentence is its summary, and "e.g." does not end it', () => {
    const file = path.join(base, 'fixtures', 'cart.ts');
    fs.writeFileSync(file, '/** Remove every cart line of a product (cleanup of lines added without an id, e.g. by the UI). More detail. */\nexport async function clearCart(api) { await api.delete(\'/carts\'); }\n');
    assert.equal(journeysIn(file, base)[0].summary, 'Remove every cart line of a product (cleanup of lines added without an id, e.g. by the UI).');
    fs.rmSync(file);
  });
  it('lints: HOW only — no expectation of a story in a shared journey', () => {
    const bad = path.join(base, 'fixtures', 'bad.ts');
    fs.writeFileSync(bad, "/** x */\nexport async function bad(page) { await expect(page.getByText('Product added to your favorites list.'), '[REQ AC-5] shown').toBeVisible(); }\n");
    const contract = { acceptanceCriteria: [{ id: 'AC-5', outcomes: ['the message "Product added to your favorites list." is shown'] }], errorModel: [] } as unknown as RequirementContract;
    assert.deepEqual(oracleLiterals(contract), ['Product added to your favorites list.']);
    const pressing = { acceptanceCriteria: [{ id: 'AC-4', outcomes: ['after pressing "Add to cart" the message "Product added to shopping cart." appears', 'clicking "Proceed to checkout" opens the cart'] }], errorModel: [] } as unknown as RequirementContract;
    assert.deepEqual(oracleLiterals(pressing), ['Product added to shopping cart.'], 'a control named after pressing/clicking is where to click, not an answer');
    const codes = lintJourneys([bad], contract, base).map((f) => f.code);
    assert.ok(codes.includes('oracle-literal') && codes.includes('req-assertion'));
    fs.rmSync(bad);
  });
  it('lints the layout: one file per domain directly in fixtures/, every journey documented', () => {
    assert.deepEqual(lintJourneys([path.join(base, 'fixtures', 'product.ts')], undefined, base).map((f) => f.code), ['no-summary']);
    const nested = path.join(base, 'fixtures', 'ui', 'cart.ts');
    fs.mkdirSync(path.dirname(nested), { recursive: true });
    fs.writeFileSync(nested, '/** a */\nexport function cart(page) {}\n');
    assert.deepEqual(lintJourneys([nested], undefined, base).map((f) => f.code), ['layout']);
    fs.rmSync(path.dirname(nested), { recursive: true });
    assert.equal(kebab('addToFavouritesOnProductPage'), 'add-to-favourites-on-product-page');
  });
  it('finds the same journey added twice under two names (two branches)', () => {
    const twin = path.join(base, 'fixtures', 'wishlist.ts');
    fs.writeFileSync(twin, "/** Favourite a product. */\nexport async function createFavourite(api, seed, me, id) { return seed.create('f', async () => (await api.post('/favorites', {})).body, (f) => api.delete(`/favorites/${f.id}`, {})); }\n");
    assert.deepEqual(duplicateJourneys(allJourneys(cfg, 'shop')).map((g) => g.map((a) => a.name).sort()), [['addFavourite', 'createFavourite']]);
    fs.rmSync(twin);
    assert.deepEqual(duplicateJourneys(allJourneys(cfg, 'shop')), []);
  });
  it('a journey concerns a story by the resources it calls, the routes it opens, or its domain', () => {
    const add = byName(cfg, 'addFavourite');
    const story = (o: object) => ({ title: 'x', acceptanceCriteria: [], endpoints: [], ...o }) as unknown as RequirementContract;
    assert.ok(relevantJourney(add, story({ endpoints: [{ method: 'DELETE', path: '/favorites/{id}' }] })));
    assert.ok(relevantJourney(add, story({ title: 'Favorites for signed-in customers' })));
    assert.ok(!relevantJourney(add, story({ title: 'Checkout', endpoints: [{ method: 'POST', path: '/carts' }] })));
  });
});

describe('journeys: which tests use them, and what runs before them', () => {
  const { cfg, root, tests, spec } = project();
  const scenarios = readSuite(tests).scenarios;
  it('follows the spec\'s imports into journeys/', () => {
    assert.deepEqual(journeysUsedBy(cfg, 'shop', [spec]).map((f) => path.relative(root, f).split(path.sep).join('/')), ['journeys/fixtures/favorites.ts', 'journeys/fixtures/product.ts']);
  });
  it('maps each journey to the tests that use it: through the spec\'s helpers and through other journeys', () => {
    const use = journeyUse(allJourneys(cfg, 'shop'), [spec], scenarios);
    assert.deepEqual([...use.get('api.favorites.add-favourite')!], ['SCN-001', 'SCN-002']);
    assert.deepEqual([...use.get('api.favorites.list-favourites')!], ['SCN-002']);
    assert.deepEqual([...use.get('ui.product.open-product')!], ['SCN-003', 'SCN-004']);
    assert.deepEqual([...use.get('ui.product.favourite-from-page')!], ['SCN-004']);
  });
  it('requires: what ran before a journey in every test that called it, the fixtures included', () => {
    const req = observedRequires(allJourneys(cfg, 'shop'), [spec], scenarios);
    assert.deepEqual(req.get('api.favorites.add-favourite'), ['support.account']);
    assert.deepEqual(req.get('api.favorites.list-favourites'), ['support.account', 'api.favorites.add-favourite']);
    assert.deepEqual(req.get('ui.product.click-favourite'), ['support.account', 'support.sign-in', 'ui.product.open-product']);
    assert.deepEqual(req.get('ui.product.favourite-from-page'), ['support.account', 'support.sign-in']);
    assert.deepEqual(req.get('ui.product.open-product'), ['support.account', 'support.sign-in'], 'called inside favouriteFromPage it is not the test\'s own call');
  });
  it('the freeze records a hash per journey the story uses; a changed journey is listed, an assertion in one is a violation', () => {
    const draft = path.join(root, 'draft');
    const used = storyJourneys(cfg, 'shop', [spec]);
    assert.equal(Object.keys(used.hashes).length, 5);
    snapshotDraft(tests, draft, 'oracle', used);
    assert.deepEqual(checkIntegrity(tests, draft, undefined, 'oracle', storyJourneys(cfg, 'shop', [spec])).journeysChanged, []);
    const file = path.join(root, 'journeys', 'fixtures', 'product.ts');
    const src = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, src.replace("getByTestId('add-to-favorites')", "getByRole('button', { name: 'Favourite' })"));
    assert.deepEqual(checkIntegrity(tests, draft, undefined, 'oracle', storyJourneys(cfg, 'shop', [spec])).journeysChanged, ['ui.product.click-favourite']);
    fs.writeFileSync(file, `${src}\nexport async function seen(page) { await expect(page.getByText('x'), '[REQ AC-1] x').toBeVisible(); }\n`);
    assert.equal(checkIntegrity(tests, draft, undefined, 'oracle', storyJourneys(cfg, 'shop', [spec])).status, 'VIOLATED');
    fs.writeFileSync(file, src);
  });
});

describe('registry.yml', () => {
  const { cfg } = project();
  const journeys = allJourneys(cfg, 'shop');
  const proof = (by: string[], at = '2026-10-01T00:00:00.000Z', hash = byName(cfg, 'addFavourite').hash) => ({ at, by, evidence: '05-eval: SCN-001 passed', hash });
  it('sync: an entry per journey with the code\'s facts; gone journeys dropped, proofs kept', () => {
    const start: Registry = { schema: 1, journeys: { 'api.gone.old': { fixture: 'fixtures/gone.ts#old', kind: 'api', status: 'proven' } } };
    const s = syncRegistry(start, journeys, 'Shop');
    assert.deepEqual(s.removed, ['api.gone.old']);
    assert.equal(s.added.length, 5);
    assert.deepEqual(s.registry.journeys['ui.product.favourite-from-page'].calls, ['ui.product.click-favourite', 'ui.product.open-product']);
    assert.equal(s.registry.journeys['api.favorites.add-favourite'].fixture, 'fixtures/favorites.ts#addFavourite');
    assert.equal(s.registry.journeys['api.favorites.add-favourite'].status, 'unproven');
    const again = syncRegistry(s.registry, journeys);
    assert.deepEqual([again.added, again.removed, again.updated], [[], [], []], 'in step: nothing to write');
  });
  it('round-trips through the file it writes', () => {
    const { registry } = syncRegistry(emptyRegistry(), journeys, 'Shop: "the demo"');
    registry.journeys['api.favorites.add-favourite'].requires = ['support.account'];
    registry.journeys['api.favorites.add-favourite'].proven = proof(['ABC-1']);
    registry.journeys['api.favorites.add-favourite'].stale = { at: '2026-09-01T00:00:00.000Z', by: 'ABC-0', evidence: 'POST /favorites → 500: "boom"' };
    const text = renderRegistry(registry);
    assert.match(text, /^ {2}api\.favorites\.add-favourite:\n {4}fixture: "fixtures\/favorites\.ts#addFavourite"\n {4}kind: api\n/m);
    assert.match(text, /requires: \["support\.account"\]/);
    assert.deepEqual(parseRegistry(text), registry);
    assert.deepEqual(parseRegistry(text.replace(/\n/g, '\r\n')), registry, 'a CRLF checkout reads the same');
  });
  it('status: proven, changed when the code moved on, stale after a later stale mark', () => {
    const h = byName(cfg, 'addFavourite').hash;
    assert.equal(statusOf({ proven: proof(['A']) }, h), 'proven');
    assert.equal(statusOf({ proven: proof(['A'], undefined, 'other') }, h), 'changed');
    assert.equal(statusOf({ proven: proof(['A']), stale: { at: '2026-10-02T00:00:00.000Z', by: 'B' } }, h), 'stale');
    assert.equal(statusOf({ proven: proof(['A'], '2026-10-03T00:00:00.000Z'), stale: { at: '2026-10-02T00:00:00.000Z', by: 'B' } }, h), 'proven');
    assert.equal(statusOf({}), 'unproven');
  });
  it('keeps only the direct prerequisites, and can still give all of them', () => {
    const reg: Registry = { schema: 1, journeys: {
      'api.favorites.ensure': { fixture: 'f#a', kind: 'api', status: 'proven', requires: ['support.account', 'api.products.find'] },
      'api.favorites.post': { fixture: 'f#b', kind: 'api', status: 'proven', requires: ['support.account', 'api.products.find', 'api.favorites.ensure'] },
    } };
    directRequires(reg);
    assert.deepEqual(reg.journeys['api.favorites.post'].requires, ['api.favorites.ensure']);
    assert.deepEqual(allRequires(reg, 'api.favorites.post'), ['support.account', 'api.products.find', 'api.favorites.ensure']);
  });
  it('a merge conflict: both sides kept, the later proof wins, every story kept, only the prerequisites both agree on', () => {
    const base = syncRegistry(emptyRegistry(), journeys).registry;
    const ours = structuredClone(base);
    const theirs = structuredClone(base);
    ours.journeys['api.favorites.add-favourite'] = { ...ours.journeys['api.favorites.add-favourite'], proven: proof(['ABC-1']), requires: ['support.account', 'ui.product.open-product'] };
    theirs.journeys['api.favorites.add-favourite'] = { ...theirs.journeys['api.favorites.add-favourite'], proven: proof(['ABC-2'], '2026-10-02T00:00:00.000Z'), requires: ['support.account'] };
    theirs.journeys['api.wishlist.share'] = { fixture: 'fixtures/wishlist.ts#share', kind: 'api', status: 'unproven' };
    const lines = (r: Registry) => renderRegistry(r).split('\n');
    const [o, t] = [lines(ours), lines(theirs)];
    // A conflict file as git writes it: the common lines, then each differing hunk as <<<<<<< ours ======= theirs >>>>>>>.
    let text = '';
    for (let i = 0, j = 0; i < o.length || j < t.length;) {
      if (o[i] === t[j]) { text += `${o[i]}\n`; i++; j++; continue; }
      const oi = i; const tj = j;
      while (i < o.length && !t.slice(j).includes(o[i])) i++;
      while (j < t.length && t[j] !== o[i]) j++;
      text += `<<<<<<< HEAD\n${o.slice(oi, i).join('\n')}\n=======\n${t.slice(tj, j).join('\n')}\n>>>>>>> branch\n`;
    }
    assert.throws(() => parseRegistry(text), /--resolve/);
    const [a, b] = conflictSides(text).map(parseRegistry);
    const m = mergeRegistries(a, b).journeys;
    assert.deepEqual(m['api.favorites.add-favourite'].proven?.by, ['ABC-1', 'ABC-2']);
    assert.equal(m['api.favorites.add-favourite'].proven?.at, '2026-10-02T00:00:00.000Z');
    assert.deepEqual(m['api.favorites.add-favourite'].requires, ['support.account']);
    assert.ok(m['api.wishlist.share']);
  });
});
