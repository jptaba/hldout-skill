/**
 * The probe log of a story: probes numbered P1, P2…, reports kept in the record once a decision cites them.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { evalPaths } from '../.github/scripts/core/paths';
import { chainOfProbe, citeProbes, deliverProbe, duplicateProbeIds, probingPhase, readProbes, trimProbeLogs, renumberDuplicateProbes, requireFrozen, savedOf, tableRows } from '../.github/scripts/core/probe-log';
import type { HeldoutConfig } from '../.github/scripts/core/profile';

// The record goes to a temporary folder; the scratch area is the project's (.heldout/), under a profile of its own.
const profile = `probe-log-test-${process.pid}`;
const cfg = { outputDir: fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-probes-')), autId: profile } as unknown as HeldoutConfig;
const p = evalPaths(cfg, 'ABC-1');
after(() => fs.rmSync(path.dirname(p.work.base), { recursive: true, force: true }));
const quietly = <T>(fn: () => T): T => { const log = console.log; console.log = () => {}; try { return fn(); } finally { console.log = log; } };

describe('the probe log', () => {
  it('numbers the probes of a story and writes their reports to the scratch area', () => {
    const first = quietly(() => deliverProbe(cfg, 'ABC-1', { tool: 'api-probe', tier: 3, input: { call: ['GET', 'products'] }, report: '# P\nGET → 200', digest: ['GET products → 200'] }))!;
    const second = quietly(() => deliverProbe(cfg, 'ABC-1', { tool: 'api-probe', tier: 3, input: { chain: { steps: [{ method: 'POST', path: 'users' }] } }, report: '# chain', digest: ['1. POST users → 201'] }))!;
    assert.deepEqual([first.id, second.id], ['P1', 'P2']);
    assert.equal(first.phase, 'hardening');
    assert.ok(fs.existsSync(path.join(p.work.hardening, 'probes', 'P1.md')));
    assert.deepEqual(readProbes(p).map((x) => x.id), ['P1', 'P2']);
    assert.ok(!fs.existsSync(path.join(p.hardened, 'P1.md')), 'not kept until cited');
  });

  it('keeps the report of a cited probe in its phase\'s folder, and refuses an id the log does not have', () => {
    assert.deepEqual(citeProbes(cfg, 'ABC-1', 'P1 and run 03-eval'), ['P1']);
    assert.ok(fs.existsSync(path.join(p.hardened, 'P1.md')));
    assert.deepEqual(citeProbes(cfg, 'ABC-1', 'run 03-eval: the tests passed'), []);
    assert.throws(() => citeProbes(cfg, 'ABC-1', 'P9'), /P9 is not in/);
  });

  it('logs a probe made after the evaluation run as triage\'s, numbered on from hardening\'s', () => {
    fs.mkdirSync(p.runs, { recursive: true });
    fs.writeFileSync(path.join(p.runs, '01-eval.json'), JSON.stringify({ meta: {} }));
    const t = quietly(() => deliverProbe(cfg, 'ABC-1', { tool: 'inspect', tier: 3, input: {}, report: '# walk', digest: [] }))!;
    assert.deepEqual([t.id, t.phase], ['P3', 'triage']);
    assert.deepEqual(readProbes(p, 'triage').map((x) => x.id), ['P3']);
    citeProbes(cfg, 'ABC-1', 'P3');
    assert.ok(fs.existsSync(path.join(p.triage, 'P3.md')) && !fs.existsSync(path.join(p.hardened, 'P3.md')));
    fs.rmSync(p.runs, { recursive: true });
  });

  it('gives a probe back to hardening for a repair, or after the draft was frozen anew', () => {
    const q = evalPaths({ ...cfg, autId: `${profile}-phase` } as HeldoutConfig, 'ABC-3');
    fs.mkdirSync(q.runs, { recursive: true });
    const entry = (scenario: string) => ({ scenario, status: 'failed', auto: { category: 'SCRIPT_DEFECT' } });
    fs.writeFileSync(path.join(q.runs, '02-eval.json'), JSON.stringify({ meta: { startedAt: '2026-10-02' }, entries: [entry('SCN-1'), entry('SCN-2')] }));
    assert.equal(probingPhase(q), 'triage', 'failures not decided yet');
    const decide = (d: object) => { fs.mkdirSync(q.triage, { recursive: true }); fs.writeFileSync(q.decisions, JSON.stringify({ '02-eval': d })); };
    decide({ 'SCN-1': { category: 'SCRIPT_DEFECT' } });
    assert.equal(probingPhase(q), 'triage', 'one still pending');
    decide({ 'SCN-1': { category: 'SCRIPT_DEFECT' }, 'SCN-2': { category: 'APPLICATION_DEFECT' } });
    assert.equal(probingPhase(q), 'hardening', 'every failure decided, a script defect to repair');
    decide({ 'SCN-1': { category: 'APPLICATION_DEFECT' }, 'SCN-2': { category: 'APPLICATION_DEFECT' } });
    assert.equal(probingPhase(q), 'triage', 'nothing to repair');
    fs.mkdirSync(path.dirname(q.freeze), { recursive: true });
    fs.writeFileSync(q.freeze, JSON.stringify({ frozenAt: '2026-10-03' }));
    assert.equal(probingPhase(q), 'hardening', 'frozen anew after the run');
    fs.rmSync(path.join(cfg.outputDir, `${profile}-phase`), { recursive: true, force: true });
  });

  it('refuses a probe whose report is gone from the scratch area before anyone cited it', () => {
    fs.rmSync(path.join(p.work.hardening, 'probes', 'P2.md'));
    assert.throws(() => citeProbes(cfg, 'ABC-1', 'P2'), /report of P2 is gone/);
  });

  it('gives the chain a probe ran back as a file', () => {
    const file = chainOfProbe(cfg, 'ABC-1', 'P2');
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { steps: [{ method: 'POST', path: 'users' }] });
    assert.throws(() => chainOfProbe(cfg, 'ABC-1', 'P1'), /not an api-probe chain/);
  });

  it('takes the rows of the named tables of a report for its digest', () => {
    const report = '## Setup steps\n\n| # | action |\n| --- | --- |\n| 1 | goto ✔ |\n\n## Accessibility snapshot\n\n| x | y |\n## Locator probes\n\n| expression | count |\n| `a` | 1 ✔ |';
    assert.deepEqual(tableRows(report, ['Setup steps', 'Locator probes']), ['| 1 | goto ✔ |', '| `a` | 1 ✔ |']);
  });

  it('refuses a probe for a story whose draft is not frozen, and notes it in the story\'s history', () => {
    const q = { ...cfg, autId: `${profile}-frozen` } as HeldoutConfig;
    const s = evalPaths(q, 'ABC-2');
    fs.mkdirSync(path.dirname(s.freeze), { recursive: true });
    assert.throws(() => requireFrozen(q, 'ABC-2', 'inspect'), /inspect refused: the draft of ABC-2 is not frozen yet.*integrity ABC-2 --snapshot/s);
    assert.match(fs.readFileSync(s.history, 'utf8'), /"event":"note".*"kind":"isolation"/);
    fs.writeFileSync(s.freeze, '{}');
    assert.doesNotThrow(() => requireFrozen(q, 'ABC-2', 'inspect'));
    assert.doesNotThrow(() => requireFrozen(q, undefined, 'api-probe'), 'a probe for no story stays open');
    assert.throws(() => requireFrozen(q, 'NEW-1', 'api-probe'), /not frozen/);
    assert.ok(!fs.existsSync(evalPaths(q, 'NEW-1').base), 'a story that does not exist gets no folder');
    assert.throws(() => requireFrozen(q, '../..', 'inspect'), /KEY|key/, 'a key that is no story key goes nowhere');
    fs.rmSync(path.join(q.outputDir, q.autId), { recursive: true, force: true });
  });

  it('gives back what a chain saved, for a later chain or walk', () => {
    const e = quietly(() => deliverProbe(cfg, 'ABC-1', { tool: 'api-probe', tier: 3, input: { chain: { steps: [] }, saved: { brandId: '01K7' } }, report: '# chain', digest: [] }))!;
    assert.deepEqual(savedOf(cfg, 'ABC-1', e.id), { brandId: '01K7' });
    assert.throws(() => savedOf(cfg, 'ABC-1', 'P1'), /saved no values/);
  });

  it('trims the probes nobody cites to their digest at the end, keeping ids and counts', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-probes-trim-'));
    const q = { hardened: path.join(dir, '4-hardening'), triage: path.join(dir, '6-triage') };
    fs.mkdirSync(q.hardened); fs.mkdirSync(q.triage);
    const line = (id: string, phase: string) => JSON.stringify({ id, at: 'now', phase, tool: 'inspect', tier: 3, input: { steps: ['…'.repeat(50)] }, digest: ['first', 'second'], report: 'scratch' });
    fs.writeFileSync(path.join(q.hardened, 'probes.jsonl'), `${line('P1', 'hardening')}\n${line('P2', 'hardening')}\n`);
    fs.writeFileSync(path.join(q.triage, 'probes.jsonl'), `${line('P3', 'triage')}\n`);
    fs.writeFileSync(path.join(q.hardened, 'P2.md'), '# cited');
    assert.equal(trimProbeLogs(q), 2);
    const [p1, p2] = readProbes(q, 'hardening');
    assert.deepEqual([p1.id, p1.input, p1.digest], ['P1', undefined, ['first']], 'uncited: id, tool and first digest line');
    assert.deepEqual(p2.input, { steps: ['…'.repeat(50)] }, 'cited: kept in full');
    assert.deepEqual(readProbes(q).map((e) => e.id), ['P1', 'P2', 'P3']);
    assert.equal(trimProbeLogs(q), 0, 'trimmed once');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('gives the later of two probes with one id (two merged branches) the next free id', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-probes-twice-'));
    const q = { hardened: dir, triage: path.join(dir, 'none') };
    const line = (id: string, at: string) => JSON.stringify({ id, at, phase: 'hardening', tool: 'api-probe', tier: 3, input: {}, digest: [at], report: '' });
    // A union merge puts the other branch's lines after ours, whatever their time.
    fs.writeFileSync(path.join(dir, 'probes.jsonl'), [line('P1', '2026-01-01'), line('P2', '2026-01-03'), line('P2', '2026-01-02'), ''].join('\n'));
    assert.deepEqual(duplicateProbeIds(q), ['P2']);
    assert.deepEqual(renumberDuplicateProbes(q), [{ from: 'P2', to: 'P3' }]);
    assert.deepEqual(readProbes(q).map((e) => `${e.id} ${e.digest[0]}`), ['P1 2026-01-01', 'P3 2026-01-03', 'P2 2026-01-02']);
    assert.deepEqual(duplicateProbeIds(q), []);
    assert.deepEqual(renumberDuplicateProbes(q), []);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
