/**
 * `heldout stats` and `heldout note --usage` (docs/governance-plan.md, P5): a story's numbers from what it already
 * wrote, and what each subagent cost.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { readHistory } from '../.github/scripts/core/history';
import { parseUsage } from '../.github/scripts/flow/note';
import { storyStats, usageByAgent } from '../.github/scripts/flow/stats';

const DISPATCHER = path.join(import.meta.dirname, '..', '.github', 'scripts', 'heldout.ts');
const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
const { HELDOUT_AUT: _aut, ...ENV } = process.env; // the profile comes from each test's config, not the caller's shell
const heldout = (cwd: string, ...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, ...args], { cwd, encoding: 'utf8', env: { ...ENV, npm_lifecycle_event: '' } });
const roots: string[] = [];
after(() => { for (const r of roots) fs.rmSync(r, { recursive: true, force: true }); });

const at = (min: number) => new Date(Date.parse('2026-10-01T10:00:00Z') + min * 60_000).toISOString();
const lines = (rows: unknown[]) => `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`;

/** A story folder: its history, its run records (name → failed count, or raw text), its probes. */
function story(root: string, profile: string, key: string, events: unknown[], runs: Record<string, number | string> = {}, probes: string[] = []): string {
  const dir = path.join(root, 'output', profile, key);
  fs.mkdirSync(path.join(dir, '5-runs'), { recursive: true });
  fs.mkdirSync(path.join(dir, '4-evidence'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'history.jsonl'), typeof events[0] === 'string' ? `${events.join('\n')}\n` : lines(events));
  const entry = (scenario: string, status: string) => ({ scenario, title: `${scenario}: x`, file: 'a.spec.ts', status, tags: [], requirementRefs: ['AC-1'], otherFailures: [], evidence: { attempts: 1 } });
  for (const [run, failed] of Object.entries(runs)) {
    fs.writeFileSync(path.join(dir, '5-runs', `${run}.json`), typeof failed === 'string' ? failed : JSON.stringify({
      key, run, generatedAt: 'now', summary: { total: failed + 1, passed: 1, failed, flaky: 0, skipped: 0 },
      entries: [entry('SCN-001', 'passed'), ...Array.from({ length: failed }, (_, i) => entry(`SCN-00${i + 2}`, 'failed'))], meta: { label: run.slice(3), startedAt: at(40), grep: null, skill: 'abc' },
    }));
  }
  if (probes.length) fs.writeFileSync(path.join(dir, '4-evidence', 'probes.jsonl'), lines(probes.map((phase, i) => ({ id: `P${i + 1}`, phase }))));
  return dir;
}

function project(profiles = ['shop']): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-stats-'));
  roots.push(root);
  fs.writeFileSync(path.join(root, 'heldout.config.json'), JSON.stringify({ defaultAut: profiles[0], auts: Object.fromEntries(profiles.map((p) => [p, { name: p, baseURL: `https://${p}.test/`, journeysDir: `journeys-${p}` }])) }));
  return root;
}

const FULL = [
  { at: at(0), event: 'fetched' }, { at: at(5), event: 'review-bound' }, { at: at(15), event: 'draft-finished' },
  { at: at(16), event: 'frozen' }, { at: at(40), event: 'run', run: '01-harden' }, { at: at(46), event: 'run', run: '02-eval' },
  { at: at(50), event: 'decided', category: 'SCRIPT_DEFECT', tests: ['SCN-002', 'SCN-003'] }, { at: at(52), event: 'amended' },
  { at: at(53), event: 'note', kind: 'tool-gap', text: 'no command for X' }, { at: at(54), event: 'note', kind: 'remark', text: 'slow login' },
  { at: at(54), event: 'note', remark: 'P3 was in the probe log twice' }, { at: at(54), event: 'note', kind: 'isolation', text: 'inspect refused: not frozen' },
  { at: at(55), event: 'note', kind: 'usage', agent: 'heldout-hardener', tokens: 120000, minutes: 20.1 },
  { at: at(56), event: 'note', kind: 'usage', agent: 'heldout-hardener', tokens: 30000, minutes: 3.9 },
  { at: at(57), event: 'note', kind: 'usage', agent: 'heldout-triager', tokens: 50000 },
  { at: at(58), event: 'note', kind: 'usage', agent: 'heldout-triager', tokens: -5000, minutes: 1e999 },
  { at: at(60), event: 'verdict' },
];

describe('heldout stats', () => {
  it('reads a story\'s numbers from its history, runs and probes', () => {
    const dir = story(project(), 'shop', 'ABC-1', FULL, { '01-harden': 1, '02-eval': 1 }, ['harden', 'triage']);
    const s = storyStats(dir, 'shop', 'ABC-1');
    assert.deepEqual(s.runs, ['01-harden', '02-eval']);
    assert.equal(s.failed, 1);
    assert.equal(s.scriptDefects, 2);
    assert.deepEqual([s.amendments, s.reviews], [1, 1]);
    assert.deepEqual(s.times, { requirement: 5, tests: 10, harden: 30, triage: 14, total: 60 }, 'the eval run, not the harden run, ends hardening');
    assert.deepEqual(s.gaps, ['no command for X']);
    assert.deepEqual(s.refused, ['inspect refused: not frozen']);
    assert.deepEqual(s.remarks, ['slow login', 'P3 was in the probe log twice'], 'a note without a kind is a remark');
    // A negative or infinite figure (a hand-edited line) counts as nothing; minutes are rounded when summed.
    assert.deepEqual(usageByAgent(s.usage), [{ agent: 'heldout-hardener', tokens: 150000, minutes: 24 }, { agent: 'heldout-triager', tokens: 50000, minutes: 0 }]);
  });

  it('prints the table and, for one story, its details', () => {
    const root = project();
    story(root, 'shop', 'ABC-1', FULL, { '01-harden': 1, '02-eval': 1 }, ['harden', 'triage']);
    story(root, 'shop', 'ABC-2', [{ at: at(0), event: 'fetched' }, { at: at(3), event: 'review-bound' }]);
    fs.mkdirSync(path.join(root, 'output', 'shop', 'ABC-3'), { recursive: true }); // no history: not a story yet
    const all = heldout(root, 'stats');
    assert.equal(all.status, 0, all.stderr);
    assert.match(all.stdout, /^\| ABC-1 \| 2 \| 1 \| 2 \| 1 \/ 0 \| 1 \| 1 \/ 1 \| 5m \/ 10m \/ 30m \/ 14m \/ 60m \| 0 \| 1 \| 200k tok \/ 24m \|$/m);
    assert.match(all.stdout, /^\| ABC-2 \| 0 \| - \| 0 \| 0 \/ 0 \| 1 \| 0 \/ 0 \| 3m \/ - \/ - \/ - \/ 3m \| 0 \| 0 \| - \|$/m, 'a story still in its first phase');
    assert.doesNotMatch(all.stdout, /ABC-3/);
    const one = heldout(root, 'stats', 'ABC-1');
    assert.match(one.stdout, /^Subagent heldout-hardener: 150000 tokens, 24 minutes$/m);
    assert.match(one.stdout, /^Refused before the freeze: inspect refused: not frozen$/m);
    assert.match(one.stdout, /^Remark: P3 was in the probe log twice$/m);
    assert.notEqual(heldout(root, 'stats', 'XYZ-9').status, 0, 'an unknown story is an error');
    assert.notEqual(heldout(project(), 'stats').status, 0, 'a project with no story yet');
  });

  it('names the profile when there are several, and takes --aut for a key in two', () => {
    const root = project(['shop', 'bank']);
    story(root, 'shop', 'ABC-1', [{ at: at(0), event: 'fetched' }, { at: at(7), event: 'note', kind: 'remark', text: 'from shop' }]);
    story(root, 'bank', 'ABC-1', [{ at: at(0), event: 'fetched' }, { at: at(9), event: 'note', kind: 'remark', text: 'from bank' }]);
    const all = heldout(root, 'stats');
    assert.match(all.stdout, /^\| bank\/ABC-1 \|/m);
    assert.match(all.stdout, /^\| shop\/ABC-1 \|/m);
    const bank = heldout(root, 'stats', 'ABC-1', '--aut', 'bank');
    assert.equal(bank.status, 0, bank.stderr);
    assert.match(bank.stdout, /^Remark: from bank$/m);
    assert.doesNotMatch(bank.stdout, /from shop/);
  });

  it('counts an unreadable run record as unknown, names it, and goes on', () => {
    const root = project();
    story(root, 'shop', 'ABC-1', FULL, { '02-eval': '{ damaged' });
    story(root, 'shop', 'ABC-2', [{ at: at(0), event: 'fetched' }, 'null', '[1]', '{ half'].map((e) => (typeof e === 'string' ? e : JSON.stringify(e))));
    const r = heldout(root, 'stats');
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /^\| ABC-1 \| 1 \| \? \|/m);
    assert.match(r.stderr, /ABC-1: can't read .*02-eval\.json/);
    assert.match(r.stdout, /^\| ABC-2 \| 0 \|/m, 'a history with non-object lines still reads');
    assert.equal(readHistory(path.join(root, 'output', 'shop', 'ABC-2', 'history.jsonl')).length, 1);
  });

  it('records a subagent\'s cost with note --usage, and refuses a malformed one', () => {
    assert.deepEqual(parseUsage('heldout-triager tokens=42000 minutes=6.54'), { agent: 'heldout-triager', tokens: 42000, minutes: 6.5 });
    assert.deepEqual(parseUsage('heldout-test-author minutes=3'), { agent: 'heldout-test-author', minutes: 3 });
    for (const bad of ['heldout-triager', 'tokens=5', 'heldout-triager tokens=lots', 'a b tokens=1', 'x tokens=1 tokens=999', 'x tokens=99999999999999999999', 'x minutes=1000000']) {
      assert.throws(() => parseUsage(bad), Error, bad);
    }
    const root = project();
    const dir = story(root, 'shop', 'ABC-1', [{ at: at(0), event: 'fetched' }]);
    const r = heldout(root, 'note', 'ABC-1', '--usage', 'heldout-contract-reviewer tokens=9000 minutes=2');
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(storyStats(dir, 'shop', 'ABC-1').usage, [{ agent: 'heldout-contract-reviewer', tokens: 9000, minutes: 2 }]);
    assert.notEqual(heldout(root, 'note', 'ABC-1', '--usage', 'x tokens=1', '--remark', 'y').status, 0, 'one kind of note at a time');
  });
});
