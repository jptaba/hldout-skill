/**
 * A large story hardened a domain at a time (specs/008-hardening-sessions): the plan, the next session, the view.
 */
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { lastEvent, recordEvent } from '../.github/scripts/core/history';
import { evalPaths } from '../.github/scripts/core/paths';
import type { HeldoutConfig } from '../.github/scripts/core/profile';
import { allowsGuesses, lintEvaluation } from '../.github/scripts/authoring/preflight';
import { guessesByDomain, hardeningSession, mayHardenWithoutHardener, MIN_GUESSES, nextSession, plannedDomains, stabilityProven, testsOfDomain } from '../.github/scripts/hardening/sessions';

const DISPATCHER = path.join(import.meta.dirname, '..', '.github', 'scripts', 'heldout.ts');
const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
const roots: string[] = [];
after(() => { for (const r of roots) fs.rmSync(r, { recursive: true, force: true }); });

const marks = (n: number) => Array.from({ length: n }, (_, i) => `  await page.getByRole('button', { name: 'b${i}' }).click(); // TODO(harden)`).join('\n');
const SPEC = `import { test } from '../../../../heldout-support/fixtures';
import { openCart } from '../../../../journeys/fixtures/cart';
import { placeOrder } from '../../../../journeys/fixtures/orders';

test('SCN-001: the cart', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page }) => { await openCart(page); });
test('SCN-002: an order', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page }) => { await placeOrder(page); });
for (const row of [1, 2]) test(\`SCN-003.\${row}: both\`, { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page }) => { await openCart(page); await placeOrder(page); });
`;

/** A project with a frozen story: two journey domains, the second calling the first. */
function project(cartMarks: number, orderMarks: number): { root: string; cfg: HeldoutConfig } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-sessions-'));
  roots.push(root);
  const fixtures = path.join(root, 'journeys', 'fixtures');
  fs.mkdirSync(fixtures, { recursive: true });
  fs.writeFileSync(path.join(fixtures, 'cart.ts'), `import type { Page } from '@playwright/test';\n/** Opens the cart. */\nexport async function openCart(page: Page) {\n${marks(cartMarks)}\n}\n/** Empties it. */\nexport async function emptyCart(page: Page) {\n  await page.goto('/cart');\n}\n`);
  fs.writeFileSync(path.join(fixtures, 'orders.ts'), `import type { Page } from '@playwright/test';\n/** Places an order. */\nexport async function placeOrder(page: Page) {\n${marks(orderMarks)}\n}\n`);
  fs.writeFileSync(path.join(fixtures, 'stock.ts'), `import type { Page } from '@playwright/test';\n/** No test uses this. */\nexport async function readStock(page: Page) {\n  await page.goto('/stock');\n}\n`);
  fs.writeFileSync(path.join(root, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/' } } }));
  const cfg = { outputDir: path.join(root, 'output'), autId: 'shop', aut: { name: 'Shop', baseURL: 'https://shop.test/' }, journeysDir: path.join(root, 'journeys') } as unknown as HeldoutConfig;
  const p = evalPaths(cfg, 'ABC-1');
  fs.mkdirSync(p.hardened, { recursive: true });
  fs.mkdirSync(p.tests, { recursive: true });
  fs.writeFileSync(path.join(p.hardened, 'abc-1.spec.ts'), SPEC);
  fs.writeFileSync(p.freeze, '{}');
  return { root, cfg };
}

describe('the plan', () => {
  const found = (...d: [string, number, number][]) => d.map(([domain, m, tests]) => ({ domain, marks: m, tests }));

  it('keeps a story one session can hold in one', () => {
    assert.deepEqual(plannedDomains(found(['cart', 40, 9])), [], 'one domain');
    assert.deepEqual(plannedDomains(found(['cart', 5, 9], ['orders', MIN_GUESSES - 6, 2])), [], 'few guesses');
    assert.deepEqual(plannedDomains([]), []);
  });

  it('gives each domain with guesses a session, those most tests use first, by name when level', () => {
    assert.deepEqual(plannedDomains(found(['orders', 10, 2], ['cart', 5, 9], ['bills', 5, 2])), ['cart', 'bills', 'orders']);
  });

  it('names the next domain that holds guesses, the same one when it still does, then the last session', () => {
    const planned = ['cart', 'orders'];
    assert.match(nextSession('ABC-1', planned, found(['cart', 2, 9], ['orders', 5, 2])).task, /"cart" journeys for ABC-1, session 1 of 3.*show ABC-1 spec --domain cart/);
    assert.match(nextSession('ABC-1', planned, found(['orders', 5, 2])).task, /"orders" journeys for ABC-1, session 2 of 3/);
    assert.match(nextSession('ABC-1', planned, []).task, /Finish hardening ABC-1, session 3 of 3.*prove stability/);
  });

  it('takes a domain the plan does not have, when a session left guesses there', () => {
    assert.match(nextSession('ABC-1', ['cart'], found(['extras', 1, 1])).task, /"extras" journeys/);
  });

  it('names no view that would refuse, for a domain no test calls', () => {
    const { task } = nextSession('ABC-1', ['cart', 'orders'], found(['orders', 3, 0]));
    assert.doesNotMatch(task, /--domain/);
    assert.match(task, /start from the file/);
  });
});

describe('a story on disk', () => {
  it('finds each domain\'s guesses and the tests that use it, directly or through a table', () => {
    const { cfg } = project(12, 10);
    assert.deepEqual(guessesByDomain(cfg, 'ABC-1').sort((a, b) => a.domain.localeCompare(b.domain)), [{ domain: 'cart', marks: 12, tests: 2 }, { domain: 'orders', marks: 10, tests: 2 }]);
    assert.deepEqual([...testsOfDomain(cfg, 'ABC-1', evalPaths(cfg, 'ABC-1').hardened, 'cart')].sort(), ['SCN-001', 'SCN-003']);
  });

  it('plans once, before any run, and says so in the history', () => {
    const { cfg } = project(12, 10);
    const p = evalPaths(cfg, 'ABC-1');
    assert.match(hardeningSession(cfg, 'ABC-1')!.task, /session 1 of 3/);
    assert.deepEqual(lastEvent<{ domains: string[] }>(p.history, 'hardening-planned')?.domains, ['cart', 'orders']);
    hardeningSession(cfg, 'ABC-1');
    assert.equal(fs.readFileSync(p.history, 'utf8').trim().split('\n').length, 1, 'once');
  });

  it('plans nothing for a small story, or for one whose hardening has already started', () => {
    assert.equal(hardeningSession(project(2, 2).cfg, 'ABC-1'), undefined);
    const { cfg } = project(12, 10);
    const p = evalPaths(cfg, 'ABC-1');
    fs.mkdirSync(p.runs, { recursive: true });
    fs.writeFileSync(path.join(p.runs, '01-harden.json'), '{}');
    assert.equal(hardeningSession(cfg, 'ABC-1'), undefined);
    assert.equal(lastEvent(p.history, 'hardening-planned'), undefined);
  });

  it('a planned story isn\'t hardened before a stability run; a probe run is no such run; an unplanned one has no such rule', () => {
    const { cfg } = project(12, 10);
    const { history } = evalPaths(cfg, 'ABC-1');
    assert.equal(stabilityProven(history), true, 'not planned');
    hardeningSession(cfg, 'ABC-1');
    assert.equal(stabilityProven(history), false);
    const stats = { passed: 1, failed: 0, flaky: 0, skipped: 0, seconds: 1 };
    recordEvent(history, 'run', { run: '01-probe', repeatEach: 2, stats });
    assert.equal(stabilityProven(history), false, 'a trial');
    recordEvent(history, 'run', { run: '02-harden', grep: 'SCN-001', stats });
    assert.equal(stabilityProven(history), false, 'no repeats');
    recordEvent(history, 'run', { run: '03-harden', repeatEach: 2, stats: null });
    assert.equal(stabilityProven(history), false, 'no results');
    recordEvent(history, 'run', { run: '04-harden', grep: 'SCN-00', repeatEach: 2, stats });
    assert.equal(stabilityProven(history), true, 'a part counts: a long stability run is made in parts');
  });

  it('a trial run passes the preflight with guesses left and the log empty; an evaluation doesn\'t', () => {
    const { cfg } = project(12, 10);
    const p = evalPaths(cfg, 'ABC-1');
    fs.mkdirSync(p.contractDir, { recursive: true });
    fs.writeFileSync(p.contract, JSON.stringify({
      key: 'ABC-1', title: 'Shop', acceptanceCriteria: [{ id: 'AC-1', layer: 'ui', text: 'shops', outcomes: ['shops'], source: 'story.md#L3', quote: 'shops' }],
      testData: { strategy: 'seed', cleanup: 'delete' }, rules: [], errorModel: [], endpoints: [], gaps: [], coverage: [], sourcesRead: [],
    }));
    fs.writeFileSync(p.hardeningLog, '# log\n**Tiers used:** \n');
    const errors = (label: string) => lintEvaluation(cfg, 'ABC-1', { allowUnhardened: allowsGuesses(label) }).filter((f) => f.level === 'error').map((f) => f.code);
    for (const code of ['unhardened', 'hardening-log-empty']) {
      assert.ok(!errors('probe').includes(code), `probe: ${code}`);
      assert.ok(!errors('harden').includes(code), `harden: ${code}`);
      assert.ok(errors('eval').includes(code), `eval: ${code}`);
    }
  });

  it('the path with no hardener leaves a planned story alone, and a story with a run', () => {
    const { cfg } = project(12, 10);
    const p = evalPaths(cfg, 'ABC-1');
    assert.equal(mayHardenWithoutHardener(p), true);
    hardeningSession(cfg, 'ABC-1');
    assert.equal(mayHardenWithoutHardener(p), false, 'planned');
    const other = evalPaths(project(1, 1).cfg, 'ABC-1');
    fs.mkdirSync(other.runs, { recursive: true });
    fs.writeFileSync(path.join(other.runs, '01-harden.json'), '{}');
    assert.equal(mayHardenWithoutHardener(other), false, 'a run');
    assert.match(fs.readFileSync(path.join(import.meta.dirname, '..', '.github', 'scripts', 'flow', 'advance.ts'), 'utf8'), /const known = mayHardenWithoutHardener\(p\) \?/, 'advance asks');
  });

  it('tells the last session which domains were covered, and any session that integrity is violated', () => {
    const { cfg } = project(12, 10);
    const p = evalPaths(cfg, 'ABC-1');
    assert.doesNotMatch(hardeningSession(cfg, 'ABC-1')!.task, /VIOLATED/);
    recordEvent(p.history, 'integrity', { status: 'VIOLATED' });
    assert.match(hardeningSession(cfg, 'ABC-1')!.task, /First: integrity is VIOLATED/);
    recordEvent(p.history, 'integrity', { status: 'PRESERVED' });
    assert.doesNotMatch(hardeningSession(cfg, 'ABC-1')!.task, /VIOLATED/);
    assert.match(nextSession('ABC-1', ['cart', 'orders'], []).task, /sessions covered cart, orders/);
  });

  it('`status` says a planned story still needs its stability run, even with the log filled in', () => {
    const { root, cfg } = project(0, 0);
    const p = evalPaths(cfg, 'ABC-1');
    fs.writeFileSync(p.hardeningLog, '# log\n**Tiers used:** tier 3\n');
    recordEvent(p.history, 'hardening-planned', { domains: ['cart', 'orders'] });
    const status = spawnSync(process.execPath, [TSX, DISPATCHER, 'status', 'ABC-1'], { cwd: root, encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });
    assert.match(status.stdout, /no stability run yet/, status.stderr);
  });
});

describe('heldout show KEY spec --domain', () => {
  const show = (root: string, ...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, 'show', 'ABC-1', 'spec', ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });

  it('lists only the tests that use that domain, and the file\'s declarations', () => {
    const { root } = project(1, 1);
    const cart = show(root, '--domain', 'cart');
    assert.equal(cart.status, 0, cart.stderr);
    assert.match(cart.stdout, /SCN-001/);
    assert.match(cart.stdout, /SCN-003/);
    assert.doesNotMatch(cart.stdout, /SCN-002/);
    assert.match(show(root).stdout, /SCN-002/, 'all of them without the flag');
  });

  it('refuses a domain no test uses, and the flag left empty', () => {
    const { root } = project(1, 1);
    for (const [args, says] of [[['--domain', 'stock'], /No test of ABC-1 uses the "stock" journeys/], [['--domain'], /--domain needs a domain/]] as [string[], RegExp][]) {
      const r = show(root, ...args);
      assert.notEqual(r.status, 0);
      assert.match(r.stderr, says);
    }
  });
});
