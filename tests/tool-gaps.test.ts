/**
 * Small tool gaps agents worked around in rounds (specs/011-round-44-gaps).
 */
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
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

describe('inspect', () => {
  it('fills a --probe\'s per-run values and no secret, as its text can come back in the report', () => {
    const src = fs.readFileSync(path.join(import.meta.dirname, '..', '.github', 'scripts', 'probe', 'inspect.ts'), 'utf8');
    assert.match(src, /locate\(page, fillVars\(expr\)\)/);
    assert.doesNotMatch(src, /locate\(page, env\(expr\)\)/);
  });
});
