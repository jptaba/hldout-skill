import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { RequirementContract } from '../.github/scripts/contract-model';
import {
  actionKey, actionUse, actionsIn, actionsUsedBy, compactMap, duplicateActions, entries, fold, kebab, lintActions, loadMap, mapValueOf,
  oracleLiterals, profileActions, relevantAction, writeMap, type MapObservation,
} from '../.github/scripts/actions-store';
import { readSuite } from '../.github/scripts/spec-model';

const SUPPORT = `'../../../../heldout-support/fixtures'`;
const FILES: Record<string, string> = {
  'api/favorites/add-favourite.ts': `import { expect, type Api, type Seed, type Account } from ${SUPPORT};

/** Add a product to a customer's favourites; removed after the test. */
export async function addFavourite(api: Api, seed: Seed, me: Account, productId: string) {
  return seed.create('favourite', async () => {
    const res = await api.post<{ id: string }>('/favorites', { headers: me.headers, data: { product_id: productId } });
    expect(res.ok, 'add favourite (seed)').toBe(true);
    return res.body;
  }, (f) => api.delete(\`/favorites/\${f.id}\`, { headers: me.headers }));
}
`,
  'api/favorites/list-favourites.ts': `import { type Api, type Account } from ${SUPPORT};
import { favouritesIn } from './_shared';

/** The customer's favourites. */
export const listFavourites = async (api: Api, me: Account) => favouritesIn((await api.get<unknown[]>('/favorites', { headers: me.headers })).body);
`,
  'api/favorites/_shared.ts': `/** The favourites of a GET /favorites answer. */
export const favouritesIn = (body: unknown) => (Array.isArray(body) ? body : []);
`,
  'ui/product/open-product.ts': `import { expect, gotoPage, type Page } from ${SUPPORT};

/** Open a product's page and wait until it shows the product. */
export async function openProduct(page: Page, id: string) {
  await gotoPage(page, \`/product/\${id}\`);
  await expect(page.getByTestId('product-name')).toBeVisible();
}
`,
  'ui/product/click-favourite.ts': `import { type Page } from ${SUPPORT};

export async function clickFavourite(page: Page) {
  await page.getByTestId('add-to-favorites').click();
}
`,
};
const SPEC = `import { test } from '../../../../heldout-support/fixtures';
import { addFavourite } from '../../../../actions/shop/api/favorites/add-favourite';
import { listFavourites } from '../../../../actions/shop/api/favorites/list-favourites';
import { openProduct } from '../../../../actions/shop/ui/product/open-product';
import { clickFavourite } from '../../../../actions/shop/ui/product/click-favourite';

const favouriteOf = (api, me, id) => addFavourite(api, null, me, id);

test('SCN-001: adds a favourite', { tag: ['@AC-1', '@type:functional', '@layer:api'] }, async ({ api }) => {
  await favouriteOf(api, {}, '1');
});
test('SCN-002: lists favourites', { tag: ['@AC-2', '@type:functional', '@layer:api'] }, async ({ api }) => {
  await listFavourites(api, {});
});
test('SCN-003: favourite in the shop', { tag: ['@AC-3', '@type:integration', '@layer:ui'] }, async ({ page }) => {
  await openProduct(page, '1');
  await clickFavourite(page);
});
`;

/** A project folder with actions/shop/{api,ui}/<domain>/<action>.ts and one story's spec under output/shop/ABC-1/tests. */
function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-a-'));
  const cfg = { actionsDir: path.join(root, 'actions'), outputDir: path.join(root, 'output') };
  const base = path.join(root, 'actions', 'shop');
  for (const [f, src] of Object.entries(FILES)) { fs.mkdirSync(path.dirname(path.join(base, f)), { recursive: true }); fs.writeFileSync(path.join(base, f), src); }
  const tests = path.join(root, 'output', 'shop', 'ABC-1', 'tests');
  fs.mkdirSync(tests, { recursive: true });
  fs.writeFileSync(path.join(tests, 'abc-1.spec.ts'), SPEC);
  return { root, cfg, base, tests, spec: path.join(tests, 'abc-1.spec.ts') };
}

const obs = (key: string, at: string, by: string, value = { domain: 'favorites', action: 'addFavourite', file: 'api/favorites/add-favourite.ts' }, status: 'proven' | 'stale' = 'proven'): MapObservation =>
  ({ key, kind: 'api', value, status, at, by });

describe('actions: what the code says', () => {
  const { cfg, base } = project();
  it('reads each action file: domain from its folder, doc comment, parameters, calls, routes and locators', () => {
    const [add] = actionsIn(path.join(base, 'api', 'favorites', 'add-favourite.ts'), base);
    assert.equal(add.kind, 'api');
    assert.equal(add.domain, 'favorites');
    assert.equal(add.action, 'addFavourite');
    assert.equal(add.file, 'api/favorites/add-favourite.ts');
    assert.equal(add.summary, "Add a product to a customer's favourites; removed after the test.");
    assert.deepEqual(add.endpoints, ['POST /favorites', 'DELETE /favorites/{}']);
    const open = profileActions(cfg, 'shop').find((a) => a.action === 'openProduct')!;
    assert.deepEqual(open.routes, ['/product/{}']);
    assert.deepEqual(open.locators, ["getByTestId('product-name')"]);
  });
  it('a domain\'s shared `_` file is not an action, unless asked for', () => {
    assert.ok(!profileActions(cfg, 'shop').some((a) => a.action === 'favouritesIn'));
    assert.ok(profileActions(cfg, 'shop', true).find((a) => a.action === 'favouritesIn')?.shared);
  });
  it('a doc comment\'s first sentence is its summary, and "e.g." does not end it', () => {
    const file = path.join(base, 'api', 'favorites', 'clear-cart.ts');
    fs.writeFileSync(file, '/** Remove every cart line of a product (cleanup of lines added without an id, e.g. by the UI). More detail. */\nexport async function clearCart() {}\n');
    assert.equal(actionsIn(file, base)[0].summary, 'Remove every cart line of a product (cleanup of lines added without an id, e.g. by the UI).');
    fs.rmSync(file);
  });
  it('lints: HOW only — no expectation of a story in a shared action', () => {
    const bad = path.join(base, 'ui', 'product', 'bad.ts');
    fs.writeFileSync(bad, "/** x */\nexport async function bad(page) { await expect(page.getByText('Product added to your favorites list.'), '[REQ AC-5] shown').toBeVisible(); }\n");
    const contract = { acceptanceCriteria: [{ id: 'AC-5', outcomes: ['the message "Product added to your favorites list." is shown'] }], errorModel: [] } as unknown as RequirementContract;
    assert.deepEqual(oracleLiterals(contract), ['Product added to your favorites list.']);
    const pressing = { acceptanceCriteria: [{ id: 'AC-4', outcomes: ['after pressing "Add to cart" the message "Product added to shopping cart." appears', 'clicking "Proceed to checkout" opens the cart'] }], errorModel: [] } as unknown as RequirementContract;
    assert.deepEqual(oracleLiterals(pressing), ['Product added to shopping cart.'], 'a control named after pressing/clicking is where to click, not an answer');
    const codes = lintActions([bad], contract, base).map((f) => f.code);
    assert.ok(codes.includes('oracle-literal') && codes.includes('req-assertion'));
    fs.rmSync(bad);
  });
  it('lints the layout that keeps many people\'s new actions in files of their own', () => {
    assert.deepEqual(lintActions([path.join(base, 'ui', 'product', 'click-favourite.ts')], undefined, base).map((f) => f.code), ['no-summary']);
    assert.deepEqual(lintActions([path.join(base, 'api', 'favorites', '_shared.ts')], undefined, base), [], 'a shared file may hold several helpers');
    const two = path.join(base, 'api', 'favorites', 'favourites.ts');
    fs.writeFileSync(two, '/** a */\nexport function addOne() {}\n/** b */\nexport function removeOne() {}\n');
    assert.deepEqual(lintActions([two], undefined, base).map((f) => f.code), ['one-action-per-file']);
    fs.rmSync(two);
    const misnamed = path.join(base, 'api', 'favorites', 'helper.ts');
    fs.writeFileSync(misnamed, '/** a */\nexport function removeFavourite() {}\n');
    assert.deepEqual(lintActions([misnamed], undefined, base).map((f) => f.code), ['file-name']);
    fs.rmSync(misnamed);
    const flat = path.join(base, 'ui', 'cart.ts');
    fs.writeFileSync(flat, '/** a */\nexport function cart() {}\n');
    assert.deepEqual(lintActions([flat], undefined, base).map((f) => f.code), ['no-domain-folder']);
    fs.rmSync(flat);
    assert.equal(kebab('addToFavouritesOnProductPage'), 'add-to-favourites-on-product-page');
    assert.equal(kebab('readCartTotal'), 'read-cart-total');
  });
  it('finds the same action added twice under two names (two branches)', () => {
    const twin = path.join(base, 'api', 'favorites', 'create-favourite.ts');
    fs.writeFileSync(twin, "/** Favourite a product. */\nexport async function createFavourite(api, seed, me, id) { return seed.create('f', async () => (await api.post('/favorites', {})).body, (f) => api.delete(`/favorites/${f.id}`, {})); }\n");
    const groups = duplicateActions(profileActions(cfg, 'shop'));
    assert.deepEqual(groups.map((g) => g.map((a) => a.action).sort()), [['addFavourite', 'createFavourite']]);
    fs.rmSync(twin);
    assert.deepEqual(duplicateActions(profileActions(cfg, 'shop')), []);
  });
  it('an action concerns a story by the resources it calls, the routes it opens, or its domain', () => {
    const add = profileActions(cfg, 'shop').find((a) => a.action === 'addFavourite')!;
    const story = (o: object) => ({ title: 'x', acceptanceCriteria: [], endpoints: [], ...o }) as unknown as RequirementContract;
    assert.ok(relevantAction(add, story({ endpoints: [{ method: 'DELETE', path: '/favorites/{id}' }] })));
    assert.ok(relevantAction(add, story({ title: 'Favorites for signed-in customers' })));
    assert.ok(!relevantAction(add, story({ title: 'Checkout', endpoints: [{ method: 'POST', path: '/carts' }] })));
  });
});

describe('actions: which tests use them', () => {
  const { cfg, root, tests, spec } = project();
  it('follows the spec\'s imports into actions/, and on into a domain\'s shared file', () => {
    const used = actionsUsedBy(cfg, [spec]).map((f) => path.relative(root, f).split(path.sep).join('/'));
    assert.deepEqual(used, ['actions/shop/api/favorites/_shared.ts', 'actions/shop/api/favorites/add-favourite.ts', 'actions/shop/api/favorites/list-favourites.ts', 'actions/shop/ui/product/click-favourite.ts', 'actions/shop/ui/product/open-product.ts']);
  });
  it('maps each action to the tests that call it, through the spec\'s own helpers', () => {
    const use = actionUse(profileActions(cfg, 'shop', true), [spec], readSuite(tests).scenarios);
    assert.deepEqual([...use.get(actionKey('api', 'favorites', 'addFavourite'))!], ['SCN-001']);
    assert.deepEqual([...use.get(actionKey('api', 'favorites', 'listFavourites'))!], ['SCN-002']);
    assert.deepEqual([...use.get(actionKey('ui', 'product', 'openProduct'))!], ['SCN-003']);
    assert.deepEqual([...use.get(actionKey('ui', 'product', 'clickFavourite'))!], ['SCN-003']);
    assert.equal(use.get(actionKey('api', 'favorites', 'favouritesIn')), undefined, 'shared helpers are not mapped');
  });
});

describe('action maps: many people, no merge conflicts', () => {
  it('folds fragments in any order to the same records, and a file folded twice changes nothing', () => {
    const k = actionKey('api', 'favorites', 'addFavourite');
    const a = [obs(k, '2026-01-01T00:00:00Z', 'ABC-1'), obs(k, '2026-02-01T00:00:00Z', 'ABC-2')];
    assert.deepEqual(fold(a), fold([...a].reverse()));
    assert.deepEqual(fold([...a, ...a]), fold(a));
    const [r] = fold(a);
    assert.deepEqual(r.stories, ['ABC-1', 'ABC-2']);
    assert.equal(r.provenAt, '2026-02-01T00:00:00Z');
  });
  it('a stale mark newer than the last proof makes the action stale; a later proof clears it', () => {
    const k = actionKey('api', 'favorites', 'addFavourite');
    const stale = obs(k, '2026-03-01T00:00:00Z', 'ABC-3', undefined, 'stale');
    assert.equal(entries(fold([obs(k, '2026-01-01T00:00:00Z', 'ABC-1'), stale]))[0].status, 'stale');
    assert.equal(entries(fold([obs(k, '2026-01-01T00:00:00Z', 'ABC-1'), stale, obs(k, '2026-04-01T00:00:00Z', 'ABC-4')]))[0].status, 'proven');
  });
  it('the newest proven value of a changed action comes first', () => {
    const k = actionKey('api', 'favorites', 'addFavourite');
    const changed = { domain: 'favorites', action: 'addFavourite', file: 'api/favorites/add-favourite.ts', endpoints: ['POST /favorites'] };
    const [e] = entries(fold([obs(k, '2026-01-01T00:00:00Z', 'ABC-1'), obs(k, '2026-02-01T00:00:00Z', 'ABC-2', changed)]));
    assert.deepEqual(e.best.value.endpoints, ['POST /favorites']);
    assert.equal(e.alternatives.length, 1);
  });
  it('each harvest is new files under map/ui and map/api; compaction folds them into a snapshot per kind', () => {
    const { cfg } = project();
    const all = profileActions(cfg, 'shop');
    const add = all.find((a) => a.action === 'addFavourite')!;
    const open = all.find((a) => a.action === 'openProduct')!;
    const one = (by: string, a: typeof add): MapObservation => ({ key: actionKey(a.kind, a.domain, a.action), kind: a.kind, value: mapValueOf(a), status: 'proven', at: new Date().toISOString(), by });
    const w1 = writeMap(cfg, 'shop', 'ABC-1', [one('ABC-1', add), one('ABC-1', open)]);
    const w2 = writeMap(cfg, 'shop', 'ABC-2', [one('ABC-2', add)]);
    assert.equal(w1.length, 2);
    assert.equal(new Set([...w1, ...w2]).size, 3, 'never the same file twice');
    const before = entries(loadMap(cfg, 'shop').records);
    assert.deepEqual(before.find((e) => e.key === actionKey('api', 'favorites', 'addFavourite'))?.best.stories, ['ABC-1', 'ABC-2']);
    const c = compactMap(cfg, 'shop');
    assert.deepEqual(c.map((x) => x.folded), [2]); // map/api had two files; map/ui only one
    assert.deepEqual(entries(loadMap(cfg, 'shop').records), before);
  });
});
