/**
 * Small tool gaps agents worked around in rounds (specs/011-round-44-gaps).
 */
import { spawn, spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { literalOpenAfter, specOutline } from '../.github/scripts/authoring/spec-model';
import { strongSecret } from '../.github/scripts/core/redact';
import { otherAnswers } from '../.github/scripts/probe/api-probe';

const DISPATCHER = path.join(import.meta.dirname, '..', '.github', 'scripts', 'heldout.ts');
const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-gaps-'));
after(() => fs.rmSync(root, { recursive: true, force: true }));

describe('a parallel step\'s other answers', () => {
  const ok = { status: 200, json: { id: 1 }, text: '' };
  it('lists each that differs from the first, once with its count', () => {
    assert.deepEqual(otherAnswers([ok, { status: 400, text: 'no funds' }, ok, { status: 400, text: 'no funds' }], 100), ['   also ×2: `400 no funds`']);
  });
  it('says nothing when all answered alike, or for one call', () => {
    assert.deepEqual(otherAnswers([ok, { ...ok }], 100), []);
    assert.deepEqual(otherAnswers([ok], 100), []);
  });
  it('masks what the first answer would have masked', () => {
    const [line] = otherAnswers([ok, { status: 200, json: { id: 2, token: 'should-not-show' }, text: '' }], 200);
    assert.doesNotMatch(line, /should-not-show/);
  });
});

describe('contract --resolve-from', () => {
  const story = path.join(root, 'output', 'shop', 'ABC-1');
  const heldout = (...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });
  const probe = (id: string) => JSON.stringify({ id, at: '2026-11-03T00:00:00.000Z', phase: 'hardening', tool: 'api-probe', tier: 3, input: {}, digest: [], report: '' });
  fs.writeFileSync(path.join(root, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/' } } }));
  for (const d of ['1-requirement', '2-contract', '4-hardening']) fs.mkdirSync(path.join(story, d), { recursive: true });
  fs.writeFileSync(path.join(story, '1-requirement', 'story.md'), 'A story\n');
  fs.writeFileSync(path.join(story, '2-contract', 'contract.json'), JSON.stringify({
    key: 'ABC-1', title: 'A story', acceptanceCriteria: [], testData: { strategy: 'seed', cleanup: 'delete' }, rules: [], errorModel: [], endpoints: [], coverage: [], sourcesRead: [],
    gaps: ['G1', 'G2'].map((id) => ({ id, element: 'a route', kind: 'mechanics', required: true, affects: ['*'], tried: [], resolution: 'open' })),
  }));
  fs.writeFileSync(path.join(story, '4-hardening', 'probes.jsonl'), `${probe('P1')}\n`);
  const scratch = path.join(root, '.heldout', 'shop', 'ABC-1', '4-hardening', 'probes');
  fs.mkdirSync(scratch, { recursive: true });
  fs.writeFileSync(path.join(scratch, 'P1.md'), '# P1');
  const gaps = path.join(root, 'gaps.json');

  const resolve = (list: unknown[]) => { fs.writeFileSync(gaps, JSON.stringify(list)); return heldout('contract', 'ABC-1', '--resolve-from', 'gaps.json'); };
  const contract = () => JSON.parse(fs.readFileSync(path.join(story, '2-contract', 'contract.json'), 'utf8')) as { gaps: { resolution: string }[] };
  const kept = path.join(story, '4-hardening', 'P1.md');

  it('keeps no report and writes nothing when a later gap\'s evidence is refused', () => {
    for (const later of ['P99', 'M1a2b3c']) {
      const r = resolve([{ id: 'G1', value: 'a', evidence: 'P1' }, { id: 'G2', value: 'b', evidence: later }]);
      assert.notEqual(r.status, 0, later);
      assert.ok(!fs.existsSync(kept), `${later}: no report kept`);
      assert.deepEqual(contract().gaps.map((g) => g.resolution), ['open', 'open'], later);
    }
  });

  it('refuses a gap that rests on the map though another gap cites a probe', () => {
    const r = resolve([{ id: 'G1', value: 'a', evidence: 'P1' }, { id: 'G2', value: 'b', evidence: 'M1a2b3c' }]);
    assert.match(r.stderr, /what an earlier story saw/);
  });

  it('keeps the reports and resolves them all when every citation holds', () => {
    // The command goes on to check the contract, which this bare one fails: what it wrote is what counts here.
    resolve([{ id: 'G1', value: 'a', evidence: 'P1' }, { id: 'G2', value: 'b', evidence: 'P1 and more' }]);
    assert.ok(fs.existsSync(kept));
    assert.deepEqual(contract().gaps.map((g) => g.resolution), ['discovered-in-aut', 'discovered-in-aut']);
  });
});

describe('what an api-probe chain saves', () => {
  it('logs neither a secret\'s name nor a harmless name on a secret\'s field', async () => {
    const dir = fs.mkdtempSync(path.join(root, 'chain-'));
    const server = http.createServer((_req, res) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ id: 7, token: strongSecret(), sessionid: strongSecret() })); });
    await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve); });
    try {
      const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
      fs.writeFileSync(path.join(dir, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: base } } }));
      const story = path.join(dir, 'output', 'shop', 'ABC-1');
      fs.mkdirSync(path.join(story, '3-tests'), { recursive: true });
      fs.writeFileSync(path.join(story, '3-tests', 'freeze.json'), '{"frozenAt":"2026-11-04"}');
      fs.writeFileSync(path.join(dir, 'c.chain.json'), JSON.stringify({ steps: [{ method: 'GET', path: 'x', save: { order: 'id', tok: 'token', sessionid: 'sessionid' } }] }));
      const code = await new Promise<number | null>((resolve) => { spawn(process.execPath, [TSX, DISPATCHER, 'api-probe', '--key', 'ABC-1', '--chain', 'c.chain.json'], { cwd: dir, stdio: 'ignore', env: { ...process.env, npm_lifecycle_event: '' } }).on('close', resolve); });
      assert.equal(code, 0);
      const log = fs.readFileSync(path.join(story, '4-hardening', 'probes.jsonl'), 'utf8');
      assert.deepEqual((JSON.parse(log) as { input: { saved: unknown } }).input.saved, { order: '7' });
    } finally { server.close(); }
  });
});

describe('the outline of a spec', () => {
  const outlineOf = (src: string) => { const f = path.join(root, 'outline.spec.ts'); fs.writeFileSync(f, src); return specOutline(f); };
  it('isn\'t misled by a backtick in a string or a comment', () => {
    const { tests } = outlineOf([
      "test('SCN-001: one', async () => {",
      '  const a = "it`s"; // and a ` here',
      '  await go(a);',
      '});',
      '',
      "test('SCN-002: two', async () => {",
      '  await go(`b`);',
      '});',
    ].join('\n'));
    assert.deepEqual(tests.map((t) => [t.name, t.from, t.to]), [['SCN-001', 1, 4], ['SCN-002', 6, 8]]);
  });
  it('gives a top-level declaration holding a multi-line literal all its lines, at any indent', () => {
    const { declarations, tests } = outlineOf(['const TEXT = `first', 'second at the margin', '}', 'last`;', 'const OTHER = 1;', '', "test('SCN-001: one', async () => {", '  await go();', '});'].join('\n'));
    assert.deepEqual(declarations.map((d) => [d.name, d.from, d.to]), [['TEXT', 1, 4], ['OTHER', 5, 5]]);
    assert.deepEqual(tests.map((t) => [t.from, t.to]), [[7, 9]]);
  });
  it('still follows a call whose literal is one of its arguments', () => {
    const { declarations } = outlineOf(['const R = make(`a', 'b`, {', '  c: 1,', '});', 'const S = 2;'].join('\n'));
    assert.deepEqual(declarations.map((d) => [d.name, d.from, d.to]), [['R', 1, 4], ['S', 5, 5]]);
  });
  it('reads a bracket at the end of a literal\'s line as its text', () => {
    const { declarations } = outlineOf(['const BODY = `{', '  "a": 1', '}`;', 'const S = 2;'].join('\n'));
    assert.deepEqual(declarations.map((d) => [d.name, d.from, d.to]), [['BODY', 1, 3], ['S', 4, 4]]);
  });
  it('isn\'t misled by a backtick in a block comment, on one line or several', () => {
    const { tests } = outlineOf([
      "test('SCN-001: one', async () => {",
      '  /* a ` tick */',
      '  /**',
      '   * another ` tick',
      '   */',
      '  await go();',
      '});',
    ].join('\n'));
    assert.deepEqual(tests.map((t) => [t.from, t.to]), [[1, 7]]);
  });
  it('doesn\'t end a bracket early at a literal inside it', () => {
    const { declarations } = outlineOf(['const R = {', '  a: `x', '  y`', '};', 'const S = 2;'].join('\n'));
    assert.deepEqual(declarations.map((d) => [d.name, d.from, d.to]), [['R', 1, 4], ['S', 5, 5]]);
  });
  it('tells where a literal is open', () => {
    assert.equal(literalOpenAfter('const a = `x', false), true);
    assert.equal(literalOpenAfter('x` + `y`', true), false);
    assert.equal(literalOpenAfter("const a = 'it`s';", false), false);
    assert.equal(literalOpenAfter('go(); // a ` here', false), false);
    assert.equal(literalOpenAfter('still \\` inside', true), true);
  });
});

describe('inspect', () => {
  it('fills a --probe\'s per-run values and no secret, as its text can come back in the report', () => {
    const src = fs.readFileSync(path.join(import.meta.dirname, '..', '.github', 'scripts', 'probe', 'inspect.ts'), 'utf8');
    assert.match(src, /locate\(page, fillVars\(expr\)\)/);
    assert.doesNotMatch(src, /locate\(page, env\(expr\)\)/);
  });
});
