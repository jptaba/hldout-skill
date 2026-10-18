/**
 * The probes' composition options: steps put together from an earlier probe, step files and single steps; the
 * recorded sign-in; generated text; and the list views of an API answer (--pages, --where, --pick, --count).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { evalPaths } from '../.github/scripts/core/paths';
import { deliverProbe } from '../.github/scripts/core/probe-log';
import type { AccountRecipe, HeldoutConfig } from '../.github/scripts/core/profile';
import { expandGenerated, textOf } from '../.github/scripts/core/secrets';
import { listView } from '../.github/scripts/probe/api-probe';
import { composeSteps, signInSteps } from '../.github/scripts/probe/compose';

const profile = `compose-test-${process.pid}`;
const recipe: AccountRecipe = {
  existing: [{ username: 'admin@shop.test', password: '${env:ADMIN_PASSWORD}', role: 'admin' }],
  signIn: { path: '/login', steps: [{ fill: "getByLabel('Email')", value: '${username}' }, { fill: "getByLabel('Password')", value: '${password}' }, { click: "getByRole('button', { name: 'Sign in' })" }], done: "getByText('My account') | url" },
};
const cfg = { outputDir: fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-compose-')), autId: profile, aut: { accounts: recipe } } as unknown as HeldoutConfig;
after(() => fs.rmSync(path.dirname(evalPaths(cfg, 'ABC-1').work.base), { recursive: true, force: true }));
const quietly = <T>(fn: () => T): T => { const log = console.log; console.log = () => {}; try { return fn(); } finally { console.log = log; } };

describe('generated text', () => {
  it('is exactly N characters and starts with the data prefix', () => {
    assert.equal(textOf(300, 'shop').length, 300);
    assert.ok(textOf(300, 'shop').startsWith('shop '));
    assert.equal(textOf(3, 'shop').length, 3);
    assert.ok(!textOf(40).endsWith(' '));
    assert.equal(expandGenerated('{"name":"${text:12}"}', 'ab'), `{"name":"${textOf(12, 'ab')}"}`);
    assert.match(expandGenerated('${now}'), /^\d{4}-\d\d-\d\dT/);
  });
});

describe('composed steps', () => {
  it('signs in as an existing account by role or user name, the password left a reference', () => {
    const steps = signInSteps(recipe, 'admin');
    assert.deepEqual(steps[0], { do: 'goto', url: '/login' });
    assert.deepEqual(steps[2], { do: 'fill', target: "getByLabel('Password')", value: '${env:ADMIN_PASSWORD}' });
    assert.deepEqual(steps.at(-1), { do: 'wait', target: "getByText('My account')" });
    assert.equal(signInSteps(recipe, 'admin@shop').length, steps.length);
    assert.throws(() => signInSteps(recipe, 'clerk'), /no existing account/);
    assert.throws(() => signInSteps({}, 'admin'), /no UI sign-in recorded/);
  });

  it('puts sign-in, an earlier walk (or its first k steps), step files and --then together in order', () => {
    quietly(() => deliverProbe(cfg, 'ABC-1', { tool: 'inspect', tier: 2, input: { steps: [{ do: 'goto', url: '/a' }, { do: 'click', target: 'x' }, { do: 'click', target: 'y' }] }, report: '# walk', digest: [] }));
    const file = path.join(cfg.outputDir, 'more.json');
    fs.writeFileSync(file, JSON.stringify([{ do: 'snapshot' }]));
    const steps = composeSteps(cfg, { key: 'ABC-1', from: 'P1:2', steps: [file], then: ['{"do":"screenshot"}'] }, 'admin');
    assert.deepEqual(steps.slice(-4), [{ do: 'goto', url: '/a' }, { do: 'click', target: 'x' }, { do: 'snapshot' }, { do: 'screenshot' }]);
    assert.deepEqual(steps[0], { do: 'goto', url: '/login' });
    assert.equal(composeSteps(cfg, { key: 'ABC-1', from: 'P1' }).length, 3);
    assert.throws(() => composeSteps(cfg, { key: 'ABC-1', from: 'P7' }), /P7 is not a walk/);
  });
});

describe('the list views of an API answer', () => {
  const items = (from: number, n: number) => Array.from({ length: n }, (_, i) => ({ id: from + i, category: { name: i % 2 ? 'Hand tools' : 'Power tools' } }));
  const noPages = async () => { throw new Error('not paged'); };

  it('counts, filters and picks the items of the first list field', async () => {
    const lines = await listView({ where: ['category.name~^hand'], pick: ['id'] }, { data: items(1, 4), total: 4 }, noPages);
    assert.deepEqual(lines, ['count where category.name~^hand: 2 of 4', '1. id = 2', '2. id = 4']);
    assert.deepEqual(await listView({ count: true }, items(1, 3), noPages), ['count: 3 of 3']);
    assert.deepEqual(await listView({}, items(1, 3), noPages), []);
  });

  it('picks from the body when the answer holds no list', async () => {
    assert.deepEqual(await listView({ pick: ['total'] }, { total: 9 }, noPages), ['total = 9']);
  });

  it('follows the pages until last_page, an empty page or the end of the range', async () => {
    const asked: number[] = [];
    const site = async (_param: string, n: number) => { asked.push(n); return { data: n <= 3 ? items(n * 10, 2) : [], last_page: 3 }; };
    assert.equal((await listView({ pages: 'page' }, undefined, site))[0], 'pages page=1..3: 6 item(s)');
    assert.deepEqual(asked, [1, 2, 3]);
    assert.equal((await listView({ pages: 'page=2..2', count: true }, undefined, site))[1], 'count: 2 of 2');
    const endless = async (_p: string, n: number) => (n <= 2 ? items(n, 1) : []);
    assert.equal((await listView({ pages: 'p' }, undefined, endless))[0], 'pages p=1..3: 2 item(s)');
  });
});
