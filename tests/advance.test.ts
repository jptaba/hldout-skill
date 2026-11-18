import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { evalRunsOf } from '../.github/scripts/core/paths';
import { draftFinished, markDraftFinished } from '../.github/scripts/authoring/draft';
import { readHistory } from '../.github/scripts/core/history';
import { printStop, repairsTried } from '../.github/scripts/flow/steps';
import { agentArgs, promptOf, usageOf } from '../.github/scripts/flow/drive';

describe('which runs are evaluations', () => {
  it('never a hardening, reproduction or repair run, and never a run of some of the tests', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'runs-'));
    // A run is its record, 5-run/NN-label.json, which says how it was made.
    const run = (name: string, meta: object = {}) => fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify({ meta }));
    run('01-harden', { grep: null });
    run('02-eval', { grep: null });
    run('03-repair', { grep: 'SCN-010|SCN-014' });
    run('04-check', { grep: 'SCN-010' });
    run('05-rerun', {});
    run('06-repro');
    run('07-repro-verify', { grep: 'SCN-001(?![\\d.])' });
    fs.mkdirSync(path.join(dir, '08-eval')); // a folder is not a run
    assert.deepEqual(evalRunsOf(dir), ['02-eval', '05-rerun']);
  });
});

describe('the repair loop', () => {
  it('counts the evaluation runs in a row, back from the last, that ended in a confirmed script defect', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repairs-'));
    const history = path.join(dir, 'history.jsonl'); const decisions = path.join(dir, 'decisions.json');
    fs.writeFileSync(history, ['01-eval', '02-rerun', '03-repro-x', '04-rerun'].map((run) => JSON.stringify({ at: 'now', event: 'run', run })).join('\n'));
    const script = { category: 'SCRIPT_DEFECT', rationale: 'x', confirmedAt: 'now' };
    fs.writeFileSync(decisions, JSON.stringify({ '01-eval': { 'SCN-1': { ...script, category: 'APPLICATION_DEFECT' } }, '02-rerun': { 'SCN-1': script }, '04-rerun': { 'SCN-2': script } }));
    assert.equal(repairsTried({ history, decisions }), 2);
  });
});

describe('a stop', () => {
  it('names the subagent, its task, its brief and the command that follows', () => {
    const out: string[] = []; const log = console.log; console.log = (s: string) => out.push(s);
    try { printStop('ABC-1', { kind: 'agent', agent: 'heldout-operator', task: 'Make the tests of ABC-1 run', why: 'the draft is frozen', then: 'npm run heldout -- advance ABC-1' }); } finally { console.log = log; }
    assert.deepEqual(out, ['\n■ Next: the heldout-operator subagent — the draft is frozen', '  Task: "Make the tests of ABC-1 run"', '  Brief: npm run heldout -- brief ABC-1', '  Then: npm run heldout -- advance ABC-1']);
  });
});

describe('a story driven with nobody watching', () => {
  it('starts the subagent with its own agent file, Opus, the project\'s servers and approvals, and its brief', () => {
    const args = agentArgs('heldout-operator', ['Bash(npm run heldout:*)', 'mcp__playwright']);
    assert.deepEqual(args.slice(0, 5), ['-p', '--agent', 'heldout-operator', '--model', 'opus']);
    assert.ok(args.includes('--strict-mcp-config'));
    assert.deepEqual(args.slice(args.indexOf('--allowedTools') + 1), ['Bash(npm run heldout:*)', 'PowerShell(npm run heldout:*)', 'mcp__playwright']);
    assert.match(promptOf('ABC-1', { kind: 'agent', agent: 'heldout-operator', task: 'Make the tests of ABC-1 run', then: '' }), /^Make the tests of ABC-1 run\. Start with: npm run heldout -- brief ABC-1\. Ask nothing/);
  });
  it('records what the app says a subagent cost: new tokens and minutes', () => {
    assert.deepEqual(usageOf({ duration_ms: 90_000, modelUsage: { opus: { inputTokens: 10, cacheCreationInputTokens: 1000, outputTokens: 500 }, haiku: { inputTokens: 5 } } }), { tokens: 1515, minutes: 1.5 });
    assert.deepEqual(usageOf({}), { tokens: 0, minutes: 0 });
  });
});

describe('the draft marked finished', () => {
  const story = () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-draft-'));
    fs.mkdirSync(path.join(base, '3-tests'));
    fs.writeFileSync(path.join(base, '3-tests', 'x.spec.ts'), "test('SCN-001: …', async () => {});\n");
    return { history: path.join(base, 'history.jsonl'), tests: path.join(base, '3-tests') };
  };
  it('a draft without the mark is not finished (its generation was cut off)', () => {
    assert.equal(draftFinished(story()), false);
  });
  it('the mark holds for the spec as it was when it was made, and is kept in the history', () => {
    const s = story();
    markDraftFinished(s);
    assert.equal(draftFinished(s), true);
    fs.appendFileSync(path.join(s.tests, 'x.spec.ts'), "test('SCN-002: …', async () => {});\n");
    assert.equal(draftFinished(s), false, 'the spec changed after the mark');
    markDraftFinished(s);
    assert.equal(draftFinished(s), true);
    assert.deepEqual(readHistory(s.history).map((e) => e.event), ['draft-finished', 'draft-finished']);
  });
});
