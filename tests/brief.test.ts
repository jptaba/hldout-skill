import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { SKILL_DIR } from '../.github/scripts/core/config';
import { ROLES } from '../.github/scripts/core/roles';
import { procedureOf } from '../.github/scripts/flow/brief';

// specs/020-brief-per-role US1: one command says what a role needs now.
describe('heldout brief', () => {
  const DISPATCHER = path.join(import.meta.dirname, '..', '.github', 'scripts', 'heldout.ts');
  const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-brief-'));
  const story = path.join(root, 'output', 'shop', 'ABC-1');
  const heldout = (...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });
  before(() => {
    fs.writeFileSync(path.join(root, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/' } } }));
    // A frozen story, with a map entry and a rule that only `heldout map KEY` may show.
    fs.mkdirSync(path.join(story, '3-tests'), { recursive: true });
    fs.writeFileSync(path.join(story, '3-tests', 'freeze.json'), '{"frozenAt":"2026-11-03"}');
    const map = path.join(root, 'application-map', 'shop');
    fs.mkdirSync(map, { recursive: true });
    fs.writeFileSync(path.join(map, 'cart.jsonl'), `${JSON.stringify({ id: 'M1a2b3c', at: '2026-11-03T00:00:00.000Z', domain: 'cart', text: 'a line answers plain text', story: 'ABC-0', probes: ['P4'] })}\n`);
    fs.writeFileSync(path.join(map, 'app.yml'), [
      'schema: 1', 'overview:', `- ${JSON.stringify({ id: 'Oaaaaaa', part: 'purpose', text: 'a shop for tools', at: '2026-11-03T00:00:00.000Z' })}`,
      'rules:', `- ${JSON.stringify({ id: 'Bbbbbbb', kind: 'observed', text: 'a cart keeps its lines after sign-out', story: 'ABC-0', source: ['P5'], at: '2026-11-03T00:00:00.000Z' })}`, '',
    ].join('\n'));
  });
  after(() => fs.rmSync(root, { recursive: true, force: true }));

  it('prints the folders, where the story stands, the overview and the procedure, in that order', () => {
    const r = heldout('brief', 'ABC-1', '--role', 'heldout-hardener');
    assert.equal(r.status, 0, r.stderr);
    const at = (s: string) => { const i = r.stdout.indexOf(s); assert.ok(i >= 0, s); return i; };
    const order = [at('Brief for heldout-hardener — story ABC-1, application Shop'), at('record:  output/shop/ABC-1/'), at('scratch: .heldout/shop/ABC-1/'),
      at('Where the story stands'), at('✔ freeze'), at('What Shop is.'), at('Oaaaaaa  a shop for tools'), at('Your procedure (heldout-hardener)'), at('You make one story\'s frozen tests work')];
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
    assert.match(r.stdout, /never evidence/, 'the overview keeps its warning');
  });

  it('writes the story\'s key where the procedure says KEY, so a command runs as printed', () => {
    const out = heldout('brief', 'ABC-1', '--role', 'heldout-triager').stdout;
    assert.ok(out.includes('npm run heldout -- triage ABC-1 --run <run>'));
    assert.ok(!/\bKEY\b/.test(out.slice(out.indexOf('Your procedure'))), 'no KEY left in the procedure');
  });

  it('is the text the skill keeps for the role, unchanged but for the key', () => {
    for (const role of Object.keys(ROLES)) {
      const kept = fs.readFileSync(path.join(SKILL_DIR, 'briefs', `${role}.md`), 'utf8').replace(/\r\n/g, '\n').trimEnd();
      assert.equal(procedureOf(role, 'KEY'), kept, role);
      assert.ok(heldout('brief', 'ABC-1', '--role', role).stdout.includes(procedureOf(role, 'ABC-1')), role);
    }
  });

  it('prints no map entry and no rule, frozen or not: those stay behind heldout map KEY', () => {
    for (const role of Object.keys(ROLES)) {
      const out = heldout('brief', 'ABC-1', '--role', role).stdout;
      for (const kept of ['M1a2b3c', 'a line answers plain text', 'Bbbbbbb', 'a cart keeps its lines']) assert.ok(!out.includes(kept), `${role}: ${kept}`);
    }
    assert.match(heldout('map', 'ABC-1').stdout, /M1a2b3c/, 'the fixture\'s entry is one the map shows');
  });

  it('refuses a missing role, an unknown one and the coordinator, naming the roles', () => {
    for (const args of [[], ['--role', 'heldout-evaluator'], ['--role', 'hardener']]) {
      const r = heldout('brief', 'ABC-1', ...args);
      assert.notEqual(r.status, 0, args.join(' '));
      assert.match(r.stderr, /heldout-contract-extractor, heldout-contract-reviewer, heldout-test-author, heldout-hardener, heldout-triager/);
      assert.equal(r.stdout.trim(), '');
    }
  });
});
