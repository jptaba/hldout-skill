/**
 * Reading a story's record with `heldout show`, instead of a script of one's own.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const DISPATCHER = path.join(import.meta.dirname, '..', '.github', 'scripts', 'heldout.ts');
const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');

function project(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-show-'));
  fs.writeFileSync(path.join(root, 'heldout.config.json'), JSON.stringify({
    defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/', accounts: { existing: [{ username: 'admin@shop.test', password: '${env:ADMIN_PW}', role: 'admin', shared: true }] } } },
  }));
  const story = path.join(root, 'output', 'shop', 'ABC-1');
  fs.mkdirSync(path.join(story, '5-run'), { recursive: true });
  fs.mkdirSync(path.join(story, '2-contract'), { recursive: true });
  fs.writeFileSync(path.join(story, '2-contract', 'contract.json'), JSON.stringify({
    key: 'ABC-1', title: 'Search', acceptanceCriteria: [{ id: 'AC-1', layer: 'api', text: 'finds', outcomes: ['200'], source: 'story.md#L3', quote: 'finds' }, { id: 'AC-2', layer: 'ui', text: 'sorts', outcomes: ['sorted'], source: 'story.md#L4', quote: 'sorts' }],
    rules: [], errorModel: [], endpoints: [], gaps: [{ id: 'G1', element: 'the route', kind: 'mechanics', required: false, affects: ['AC-2'], tried: [], resolution: 'open' }], coverage: [], sourcesRead: [],
  }));
  const entry = (scenario: string, status: string, extra = {}) => ({ scenario, title: `${scenario}: x`, file: 'a.spec.ts', status, tags: [], requirementRefs: ['AC-1'], otherFailures: [], evidence: { attempts: 1 }, ...extra });
  fs.writeFileSync(path.join(story, '5-run', '01-eval.json'), JSON.stringify({
    key: 'ABC-1', run: '01-eval', generatedAt: 'now', summary: { total: 2, passed: 1, failed: 1, flaky: 0, skipped: 0 },
    entries: [entry('SCN-001', 'passed'), entry('SCN-002', 'failed', { error: { headline: '[REQ AC-1] finds' }, auto: { category: 'APPLICATION_DEFECT', confidence: 'high', signals: [], next: '' } })],
    meta: { label: 'eval', startedAt: '2026-10-01T10:00:00Z', grep: null, skill: 'abc' },
  }));
  fs.writeFileSync(path.join(story, 'history.jsonl'), `${JSON.stringify({ at: '2026-10-01T10:00:00Z', event: 'run', skill: 'abc', run: '01-eval' })}\n`);
  return root;
}
const show = (cwd: string, ...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, 'show', ...args], { cwd, encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });

describe('heldout show', () => {
  const root = project();
  it('prints the criteria and gaps asked for', () => {
    const r = show(root, 'ABC-1', 'contract', '--ac', 'AC-2', '--gaps', 'open');
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /AC-2 \[ui\] sorts/);
    assert.doesNotMatch(r.stdout, /AC-1 \[api\]/);
    assert.match(r.stdout, /G1 mechanics · open/);
  });
  it('gives the profile with its secrets as references', () => {
    const r = show(root, 'config');
    assert.match(r.stdout, /existing admin@shop\.test \(admin\) shared password \$\{env:ADMIN_PW\}/);
  });
  it('lists a run\'s failures and the pending decisions, and one test in full as JSON', () => {
    assert.match(show(root, 'ABC-1', 'run', '--failed').stdout, /SCN-002\s+failed\s+APPLICATION_DEFECT \(auto, high\)/);
    assert.match(show(root, 'ABC-1', 'triage', '--pending').stdout, /1 pending/);
    assert.equal(JSON.parse(show(root, 'ABC-1', 'run', '01-eval', '--test', 'SCN-002').stdout).scenario, 'SCN-002');
  });
  it('prints the history, and as JSON', () => {
    assert.match(show(root, 'ABC-1', 'history').stdout, /run\s+\{"run":"01-eval"\}/);
    assert.equal(JSON.parse(show(root, 'ABC-1', 'history', '--json').stdout)[0].event, 'run');
  });
});
