/**
 * The probe log of a story: probes numbered P1, P2…, reports kept in the record once a decision cites them.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { evalPaths } from '../.github/scripts/core/paths';
import { chainOfProbe, citeProbes, deliverProbe, duplicateProbeIds, readProbes, renumberDuplicateProbes, tableRows } from '../.github/scripts/core/probe-log';
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
    assert.equal(first.phase, 'harden');
    assert.ok(fs.existsSync(path.join(p.work.evidence, 'probes', 'P1.md')));
    assert.deepEqual(readProbes(p).map((x) => x.id), ['P1', 'P2']);
    assert.ok(!fs.existsSync(path.join(p.evidence, 'P1.md')), 'not kept until cited');
  });

  it('keeps the report of a cited probe in the record, and refuses an id the log does not have', () => {
    assert.deepEqual(citeProbes(cfg, 'ABC-1', 'P1 and run 03-eval'), ['P1']);
    assert.ok(fs.existsSync(path.join(p.evidence, 'P1.md')));
    assert.deepEqual(citeProbes(cfg, 'ABC-1', 'run 03-eval: the tests passed'), []);
    assert.throws(() => citeProbes(cfg, 'ABC-1', 'P9'), /P9 is not in/);
  });

  it('refuses a probe whose report is gone from the scratch area before anyone cited it', () => {
    fs.rmSync(path.join(p.work.evidence, 'probes', 'P2.md'));
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

  it('gives the later of two probes with one id (two merged branches) the next free id', () => {
    const q = { evidence: fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-probes-twice-')) };
    const line = (id: string, at: string) => JSON.stringify({ id, at, phase: 'harden', tool: 'api-probe', tier: 3, input: {}, digest: [at], report: '' });
    // A union merge puts the other branch's lines after ours, whatever their time.
    fs.writeFileSync(path.join(q.evidence, 'probes.jsonl'), [line('P1', '2026-01-01'), line('P2', '2026-01-03'), line('P2', '2026-01-02'), ''].join('\n'));
    assert.deepEqual(duplicateProbeIds(q), ['P2']);
    assert.deepEqual(renumberDuplicateProbes(q), [{ from: 'P2', to: 'P3' }]);
    assert.deepEqual(readProbes(q).map((e) => `${e.id} ${e.digest[0]}`), ['P1 2026-01-01', 'P3 2026-01-03', 'P2 2026-01-02']);
    assert.deepEqual(duplicateProbeIds(q), []);
    assert.deepEqual(renumberDuplicateProbes(q), []);
    fs.rmSync(q.evidence, { recursive: true, force: true });
  });
});
