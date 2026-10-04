import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { RequirementContract } from '../.github/scripts/contract-model';
import {
  compactMap, entries, fixtureKey, fixtureUse, fixturesIn, fold, journeysUsedBy, lintJourneys, loadMap, mapValueOf, oracleLiterals,
  profileFixtures, relevantFixture, writeMap, type MapObservation,
} from '../.github/scripts/journeys-store';
import { readSuite } from '../.github/scripts/spec-model';

const API = `import { expect, type Api, type Seed, type Account } from '../../../heldout-support/fixtures';

/** Add a product to a customer's favourites; removed after the test. */
export async function addFavourite(api: Api, seed: Seed, me: Account, productId: string) {
  return seed.create('favourite', async () => {
    const res = await api.post<{ id: string }>('/favorites', { headers: me.headers, data: { product_id: productId } });
    expect(res.ok, 'add favourite (seed)').toBe(true);
    return res.body;
  }, (f) => api.delete(\`/favorites/\${f.id}\`, { headers: me.headers }));
}

/** The customer's favourites. */
export const listFavourites = async (api: Api, me: Account) => (await api.get<unknown[]>('/favorites', { headers: me.headers })).body;
`;
const UI = `import { expect, gotoPage, type Page } from '../../../heldout-support/fixtures';

/** Open a product's page and wait until it shows the product. */
export async function openProduct(page: Page, id: string) {
  await gotoPage(page, \`/product/\${id}\`);
  await expect(page.getByTestId('product-name')).toBeVisible();
}

export async function clickFavourite(page: Page) {
  await page.getByTestId('add-to-favorites').click();
}
`;
const SPEC = `import { test, expect, expectResponse } from '../../../../heldout-support/fixtures';
import { addFavourite, listFavourites } from '../../../../journeys/shop/api/favorites';
import { openProduct, clickFavourite } from '../../../../journeys/shop/ui/product';

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

/** A project folder with journeys/shop/{api,ui} and one story's spec under output/shop/ABC-1/tests. */
function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-j-'));
  const cfg = { journeysDir: path.join(root, 'journeys'), outputDir: path.join(root, 'output') };
  fs.mkdirSync(path.join(root, 'journeys', 'shop', 'api'), { recursive: true });
  fs.mkdirSync(path.join(root, 'journeys', 'shop', 'ui'), { recursive: true });
  fs.writeFileSync(path.join(root, 'journeys', 'shop', 'api', 'favorites.ts'), API);
  fs.writeFileSync(path.join(root, 'journeys', 'shop', 'ui', 'product.ts'), UI);
  const tests = path.join(root, 'output', 'shop', 'ABC-1', 'tests');
  fs.mkdirSync(tests, { recursive: true });
  fs.writeFileSync(path.join(tests, 'abc-1.spec.ts'), SPEC);
  return { root, cfg, tests, spec: path.join(tests, 'abc-1.spec.ts') };
}

const obs = (key: string, at: string, by: string, value = { domain: 'favorites', fixture: 'addFavourite', file: 'api/favorites.ts' }, status: 'proven' | 'stale' = 'proven'): MapObservation =>
  ({ key, kind: 'api', value, status, at, by });

describe('journey fixtures: what the code says', () => {
  const { cfg, root } = project();
  it('reads each exported fixture with its doc comment, parameters, calls, routes and locators', () => {
    const api = fixturesIn(path.join(root, 'journeys', 'shop', 'api', 'favorites.ts'), path.join(root, 'journeys', 'shop'));
    assert.deepEqual(api.map((f) => f.fixture), ['addFavourite', 'listFavourites']);
    assert.equal(api[0].kind, 'api');
    assert.equal(api[0].domain, 'favorites');
    assert.equal(api[0].file, 'api/favorites.ts');
    assert.equal(api[0].summary, "Add a product to a customer's favourites; removed after the test.");
    assert.deepEqual(api[0].endpoints, ['POST /favorites', 'DELETE /favorites/{}']);
    assert.deepEqual(api[1].endpoints, ['GET /favorites']);
    const [open, click] = profileFixtures(cfg, 'shop').filter((f) => f.kind === 'ui');
    assert.deepEqual(open.routes, ['/product/{}']);
    assert.deepEqual(open.locators, ["getByTestId('product-name')"]);
    assert.equal(click.summary, undefined);
  });
  it('a doc comment\'s first sentence is its summary, and "e.g." does not end it', () => {
    const { root } = project();
    const file = path.join(root, 'journeys', 'shop', 'api', 'carts.ts');
    fs.writeFileSync(file, '/** Remove every cart line of a product (cleanup of lines added without an id, e.g. by the UI). More detail. */\nexport async function clearCart() {}\n');
    assert.equal(fixturesIn(file, path.join(root, 'journeys', 'shop'))[0].summary, 'Remove every cart line of a product (cleanup of lines added without an id, e.g. by the UI).');
  });
  it('lints: every fixture documented; no expectation of a story in a shared fixture', () => {
    const files = [path.join(root, 'journeys', 'shop', 'ui', 'product.ts')];
    assert.deepEqual(lintJourneys(files).map((f) => f.code), ['no-summary']);
    const bad = path.join(root, 'journeys', 'shop', 'ui', 'bad.ts');
    fs.writeFileSync(bad, "/** x */\nexport async function f(page) { await expect(page.getByText('Product added to your favorites list.'), '[REQ AC-5] shown').toBeVisible(); }\n");
    const contract = { acceptanceCriteria: [{ id: 'AC-5', outcomes: ['the message "Product added to your favorites list." is shown'] }], errorModel: [] } as unknown as RequirementContract;
    assert.deepEqual(oracleLiterals(contract), ['Product added to your favorites list.']);
    assert.deepEqual(lintJourneys([bad], contract).map((f) => f.code).sort(), ['oracle-literal', 'req-assertion']);
    fs.rmSync(bad);
  });
  it('a fixture concerns a story by the resources it calls, the routes it opens, or its domain', () => {
    const add = profileFixtures(cfg, 'shop').find((f) => f.fixture === 'addFavourite')!;
    const story = (o: object) => ({ title: 'x', acceptanceCriteria: [], endpoints: [], ...o }) as unknown as RequirementContract;
    assert.ok(relevantFixture(add, story({ endpoints: [{ method: 'DELETE', path: '/favorites/{id}' }] })));
    assert.ok(relevantFixture(add, story({ title: 'Favorites for signed-in customers' })));
    assert.ok(!relevantFixture(add, story({ title: 'Checkout', endpoints: [{ method: 'POST', path: '/carts' }] })));
  });
});

describe('journey fixtures: which tests use them', () => {
  const { cfg, root, tests, spec } = project();
  it('follows the spec\'s imports into journeys/, not elsewhere', () => {
    const used = journeysUsedBy(cfg, [spec]).map((f) => path.relative(root, f).split(path.sep).join('/'));
    assert.deepEqual(used, ['journeys/shop/api/favorites.ts', 'journeys/shop/ui/product.ts']);
  });
  it('maps each fixture to the tests that call it, through the spec\'s own helpers', () => {
    const use = fixtureUse(profileFixtures(cfg, 'shop'), [spec], readSuite(tests).scenarios);
    assert.deepEqual([...use.get(fixtureKey('api', 'favorites', 'addFavourite'))!], ['SCN-001']);
    assert.deepEqual([...use.get(fixtureKey('api', 'favorites', 'listFavourites'))!], ['SCN-002']);
    assert.deepEqual([...use.get(fixtureKey('ui', 'product', 'openProduct'))!], ['SCN-003']);
    assert.deepEqual([...use.get(fixtureKey('ui', 'product', 'clickFavourite'))!], ['SCN-003']);
  });
});

describe('journey maps: many people, no merge conflicts', () => {
  it('folds fragments in any order to the same records, and a file folded twice changes nothing', () => {
    const k = fixtureKey('api', 'favorites', 'addFavourite');
    const a = [obs(k, '2026-01-01T00:00:00Z', 'ABC-1'), obs(k, '2026-02-01T00:00:00Z', 'ABC-2')];
    assert.deepEqual(fold(a), fold([...a].reverse()));
    assert.deepEqual(fold([...a, ...a]), fold(a));
    const [r] = fold(a);
    assert.deepEqual(r.stories, ['ABC-1', 'ABC-2']);
    assert.equal(r.provenAt, '2026-02-01T00:00:00Z');
  });
  it('a stale mark newer than the last proof makes the fixture stale; a later proof clears it', () => {
    const k = fixtureKey('api', 'favorites', 'addFavourite');
    const stale = obs(k, '2026-03-01T00:00:00Z', 'ABC-3', undefined, 'stale');
    assert.equal(entries(fold([obs(k, '2026-01-01T00:00:00Z', 'ABC-1'), stale]))[0].status, 'stale');
    assert.equal(entries(fold([obs(k, '2026-01-01T00:00:00Z', 'ABC-1'), stale, obs(k, '2026-04-01T00:00:00Z', 'ABC-4')]))[0].status, 'proven');
  });
  it('the newest proven value of a changed fixture comes first', () => {
    const k = fixtureKey('api', 'favorites', 'addFavourite');
    const changed = { domain: 'favorites', fixture: 'addFavourite', file: 'api/favorites.ts', endpoints: ['POST /favorites'] };
    const [e] = entries(fold([obs(k, '2026-01-01T00:00:00Z', 'ABC-1'), obs(k, '2026-02-01T00:00:00Z', 'ABC-2', changed)]));
    assert.deepEqual(e.best.value.endpoints, ['POST /favorites']);
    assert.equal(e.alternatives.length, 1);
  });
  it('each harvest is new files under map/ui and map/api; compaction folds them into a snapshot per kind', () => {
    const { cfg } = project();
    const all = profileFixtures(cfg, 'shop');
    const add = all.find((f) => f.fixture === 'addFavourite')!;
    const open = all.find((f) => f.fixture === 'openProduct')!;
    const one = (by: string, f: typeof add): MapObservation => ({ key: fixtureKey(f.kind, f.domain, f.fixture), kind: f.kind, value: mapValueOf(f), status: 'proven', at: new Date().toISOString(), by });
    const w1 = writeMap(cfg, 'shop', 'ABC-1', [one('ABC-1', add), one('ABC-1', open)]);
    const w2 = writeMap(cfg, 'shop', 'ABC-2', [one('ABC-2', add)]);
    assert.equal(w1.length, 2);
    assert.equal(new Set([...w1, ...w2]).size, 3, 'never the same file twice');
    assert.ok(w1.some((f) => f.includes(`${path.sep}map${path.sep}ui${path.sep}`)) && w1.some((f) => f.includes(`${path.sep}map${path.sep}api${path.sep}`)));
    const before = entries(loadMap(cfg, 'shop').records);
    assert.deepEqual(before.find((e) => e.key === fixtureKey('api', 'favorites', 'addFavourite'))?.best.stories, ['ABC-1', 'ABC-2']);
    const c = compactMap(cfg, 'shop');
    assert.deepEqual(c.map((x) => x.folded), [2]); // map/api had two files; map/ui only one
    assert.deepEqual(entries(loadMap(cfg, 'shop').records), before);
  });
});
