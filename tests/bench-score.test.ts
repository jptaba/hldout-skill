/**
 * The benchmark's score and report: a finding counts by the fault its tests fail on, a finding the clean
 * application also fails is a false positive, and the keys name text their stories hold and faults that exist.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { band, costOf, costOfStory, report, type Scored } from '../dev/bench';
import { FAULTS } from '../dev/bench/faults';
import { keyNames, keyProblems, readKey, score, type Evidence, type Key } from '../dev/bench/score';

const key: Key = {
  key: 'X-1', size: 'small', clean: ['PASS', 'PASS_WITH_WARNINGS'],
  faults: [{ id: 'F01', storyText: ['sorted by price'], seen: '' }, { id: 'F02', storyText: ['is refused'], seen: '' }, { id: 'F03', storyText: ['a total'], seen: '' }],
  traps: [],
};
const evidence = (e: Partial<Evidence>): Evidence => ({ on: ['F01', 'F02', 'F03'], verdict: 'FAIL', findings: [], questions: [], failsClean: [], failsWith: {}, ...e });

describe('the benchmark score', () => {
  it('finds a fault through a finding whose test fails with it on, and misses the rest', () => {
    const s = score(key, evidence({
      findings: [{ id: 'APP-1', title: '', tests: ['SCN-1', 'SCN-2'] }, { id: 'APP-2', title: '', tests: ['SCN-3'] }],
      questions: [{ id: 'SCN-4', title: '', tests: ['SCN-4'] }],
      failsWith: { F01: ['SCN-2'], F02: ['SCN-4'], F03: [] },
    }));
    assert.deepEqual([s.found, s.asQuestion, s.missed, s.falsePositives, s.unexplained], [['F01'], ['F02'], ['F03'], [], ['APP-2']]);
    assert.equal(s.verdictAsKeyed, true);
  });

  it('calls a finding a false positive when the application without faults fails its tests too', () => {
    const s = score(key, evidence({
      on: ['F01'], findings: [{ id: 'APP-1', title: '', tests: ['SCN-1'] }, { id: 'APP-2', title: '', tests: ['SCN-2'] }],
      failsClean: ['SCN-1'], failsWith: { F01: ['SCN-1', 'SCN-2'] },
    }));
    assert.deepEqual([s.found, s.falsePositives, s.missed], [['F01'], ['APP-1'], []]);
  });

  it('expects FAIL only for a fault of the story, and one of the clean verdicts otherwise', () => {
    assert.deepEqual(score(key, evidence({ on: [], verdict: 'PASS WITH WARNINGS' })).verdictAsKeyed, true);
    assert.deepEqual(score(key, evidence({ on: ['F09'], verdict: 'pass' })).expected, ['PASS', 'PASS_WITH_WARNINGS'], 'another story\'s fault');
    const wrong = score(key, evidence({ on: ['F01'], verdict: 'PASS' }));
    assert.deepEqual([wrong.verdictAsKeyed, wrong.expected, wrong.missed], [false, ['FAIL'], ['F01']]);
    assert.equal(score(key, evidence({ on: [], verdict: 'FAIL' })).verdictAsKeyed, false);
  });

  it('counts a fault as a question only when no finding has it', () => {
    const s = score(key, evidence({ on: ['F01'], findings: [{ id: 'APP-1', title: '', tests: ['SCN-1'] }], questions: [{ id: 'SCN-2', title: '', tests: ['SCN-2'] }], failsWith: { F01: ['SCN-1', 'SCN-2'] } }));
    assert.deepEqual([s.found, s.asQuestion], [['F01'], []]);
  });

  it('says what a key gets wrong', () => {
    const story = 'Products are  Sorted by\nprice. An empty name is refused.';
    assert.deepEqual(keyProblems({ ...key, faults: key.faults.slice(0, 2) }, story, ['F01', 'F02']), []);
    assert.deepEqual(keyProblems({ ...key, clean: ['FAIL'], traps: [{ kind: 'no-oracle', storyText: [], expected: '' }] }, story, ['F01', 'F02']),
      ['clean: PASS and/or PASS_WITH_WARNINGS', 'F03: no such fault', 'F03: "a total" is not in the story', 'trap 1: names no text of the story']);
  });
});

describe('the benchmark keys', () => {
  it('name text of their stories, faults of the catalogue, and each fault once', () => {
    const ids = FAULTS.map((f) => f.id);
    const used: string[] = [];
    for (const name of keyNames()) {
      const k = readKey(name);
      assert.equal(k.key, name);
      const dir = path.resolve(import.meta.dirname, '..', 'demo', 'stories', name);
      const story = fs.readdirSync(dir).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
      assert.deepEqual(keyProblems(k, story, ids), [], name);
      used.push(...k.faults.map((f) => f.id));
    }
    assert.deepEqual(used.filter((id, i) => used.indexOf(id) !== i), [], 'a fault belongs to one story');
    assert.deepEqual(ids.filter((id) => !used.includes(id)), [], 'every fault belongs to a story');
  });
});

describe('the benchmark report', () => {
  it('adds up what the headless runs of a story cost', () => {
    const c = costOf([
      { total_cost_usd: 1.234, duration_ms: 90_000, num_turns: 3, modelUsage: { a: { inputTokens: 10, outputTokens: 5, cacheCreationInputTokens: 100, cacheReadInputTokens: 1000 }, b: { outputTokens: 1 } } },
      { total_cost_usd: 0.5, duration_ms: 30_000, num_turns: 1 },
    ]);
    assert.deepEqual(c, { usd: 1.73, minutes: 2, turns: 4, runs: 2, newTokens: 116, outputTokens: 6, cachedTokens: 1000 });
  });

  it('adds up what a driven story\'s subagents cost, from its history', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bench-cost-')), 'history.jsonl');
    fs.writeFileSync(file, [
      { event: 'note', kind: 'usage', agent: 'heldout-operator', tokens: 1000, minutes: 2.5, usd: 1.2 },
      { event: 'note', kind: 'usage', agent: 'heldout-contract-reviewer', tokens: 500, minutes: 1 },
      { event: 'note', kind: 'tool-gap', text: 'x' }, { event: 'run', run: '01-eval' },
    ].map((e) => JSON.stringify(e)).join('\n'));
    assert.deepEqual(costOfStory(file), { usd: 1.2, minutes: 3.5, turns: 0, runs: 2, newTokens: 1500, outputTokens: 0, cachedTokens: 0 });
  });

  it('shows the band of unchanged runs of one story', () => {
    assert.deepEqual([band([3, 1, 2]), band([2, 2]), band([])], ['1–3', '2', '']);
    const one = (run: string, tests: number, found: string[]): Scored => ({
      run, key: 'X-1', on: ['F01', 'F02'], hits: {}, tests, failed: 2, openQuestions: 0, evidence: evidence({}),
      score: { expected: ['FAIL'], verdict: 'FAIL', verdictAsKeyed: true, found, asQuestion: [], missed: [], falsePositives: [], unexplained: [] },
      cost: { usd: tests / 10, minutes: tests, turns: 1, runs: 1, newTokens: tests * 10_000, outputTokens: 0, cachedTokens: 0 },
    });
    const text = report([one('b1', 20, ['F01', 'F02']), one('b2', 31, ['F01'])]);
    assert.match(text, /\| b2 \| X-1 \| F01 F02 \| FAIL \| 1 of 2 \|/);
    assert.match(text, /\| 2 runs \| X-1 \| F01 F02 \| 2 of 2 as keyed \| 1–2 \| 0 \| 0 \| 0 \| 0 \| 20–31 \| 2 \| 200–310k \| 20–31 \| 2–3.1 \|/);
    assert.doesNotMatch(report([one('b1', 20, [])]), /Unchanged runs/);
  });
});
