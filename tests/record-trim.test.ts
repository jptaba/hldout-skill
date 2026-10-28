/**
 * What outlives the runs' records once the verdict is due (specs/001-phase-separation, US2): every run's result in the
 * history, the repairs in the decisions, run numbers never used twice, and the probes a kept text names.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { keepNamedProbes, readProbes, savedOf, trimProbeLogs } from '../.github/scripts/core/probe-log';
import type { HeldoutConfig } from '../.github/scripts/core/profile';
import { evalPaths } from '../.github/scripts/core/paths';
import { repairsTried } from '../.github/scripts/flow/advance';
import { dropUnshownScreenshots, repairedDefects, reproducedBy, runsOfHistory, showsScreenshot } from '../.github/scripts/verdict/verdict';
import { contextCall } from '../.github/scripts/run/record';
import { nextRunNumber } from '../.github/scripts/run/run';

const profile = `record-trim-${process.pid}`;
const cfg = { outputDir: fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-trim-')), autId: profile } as unknown as HeldoutConfig;
const p = evalPaths(cfg, 'ABC-1');
after(() => { fs.rmSync(cfg.outputDir, { recursive: true, force: true }); fs.rmSync(path.dirname(p.work.base), { recursive: true, force: true }); });
const line = (o: object) => `${JSON.stringify({ at: 'now', skill: 'x', ...o })}\n`;
const history = (...events: object[]) => { fs.mkdirSync(p.base, { recursive: true }); fs.writeFileSync(p.history, events.map(line).join('')); };
const decide = (d: object) => { fs.mkdirSync(p.triage, { recursive: true }); fs.writeFileSync(p.decisions, JSON.stringify(d)); };

describe('after the verdict\'s tidy', () => {
  it('numbers the next run past every run the story had, whatever record is left', () => {
    history({ event: 'run', run: '01-harden' }, { event: 'run', run: '02-eval' }, { event: 'run', run: '03-repro', grep: 'SCN-1' });
    fs.mkdirSync(p.runs, { recursive: true });
    fs.writeFileSync(path.join(p.runs, '02-eval.json'), '{}');
    assert.equal(nextRunNumber(p), 4, 'the history knows 03 though its record is gone');
    fs.mkdirSync(p.work.runs, { recursive: true });
    fs.writeFileSync(path.join(p.work.runs, '05-repro.json'), '{}');
    assert.equal(nextRunNumber(p), 6, 'and a record moved to scratch');
  });

  it('lists every run from the history, and the repairs from the decisions', () => {
    history({ event: 'run', run: '01-harden', stats: { passed: 3, failed: 1 } }, { event: 'run', run: '02-eval', stats: { passed: 2, failed: 2 } }, { event: 'run', run: '03-rerun', stats: { passed: 4, failed: 0 } });
    assert.deepEqual(runsOfHistory(p.history).map((r) => [r.run, r.stats?.passed]), [['01-harden', 3], ['02-eval', 2], ['03-rerun', 4]]);
    const d = { category: 'SCRIPT_DEFECT' as const, rationale: 'locator', failure: 'locator not found', confirmedAt: 'now' };
    const repaired = repairedDefects({ '02-eval': { 'SCN-2': d, 'SCN-3': { ...d, category: 'APPLICATION_DEFECT' } }, '03-rerun': { 'SCN-9': d } }, '03-rerun', [{ scenario: 'SCN-2', status: 'passed' }]);
    assert.deepEqual(repaired.map((r) => [r.run, r.scenario, r.d.failure, r.now]), [['02-eval', 'SCN-2', 'locator not found', 'passed']], 'earlier runs only, script defects only');
  });

  it('writes out the requests of one test per finding: the first that sent any', () => {
    const call = { request: { method: 'GET', url: 'https://x.test/a' }, response: { status: 200, body: '' } } as never;
    const page = { scenario: 'SCN-1', evidence: {} }, api = { scenario: 'SCN-2', evidence: { apiSequence: [call] } };
    const pre = { scenario: 'SCN-3', evidence: { preSequence: [call] } };
    assert.equal(reproducedBy([page, api, pre]).scenario, 'SCN-2');
    assert.equal(reproducedBy([page, pre]).scenario, 'SCN-3', 'pre-steps alone are requests too');
    assert.equal(reproducedBy([page]).scenario, 'SCN-1', 'a finding of pages only: its first test');
  });

  it('keeps a screenshot for a page finding only, and the headers of the call a failure is about', () => {
    assert.equal(showsScreenshot({ evidence: { attempts: 1, screenshot: 'a.png' } }), true);
    assert.equal(showsScreenshot({ evidence: { attempts: 1, screenshot: 'a.png', api: { request: { method: 'GET', url: 'u' }, response: { status: 500 } } } }), false, 'its call is the evidence');
    assert.equal(showsScreenshot({ evidence: { attempts: 1 } }), false);
    const call = { request: { method: 'GET', url: 'u' }, response: { status: 302, headers: { date: 'today', 'Content-Type': 'text/html', location: '/x', connection: 'close' } } };
    assert.deepEqual(contextCall(call).response.headers, { 'Content-Type': 'text/html', location: '/x' });
    assert.deepEqual(contextCall({ request: call.request, response: { status: 200 } }).response, { status: 200 });
  });

  it('removes the screenshots an earlier verdict kept, and keeps the ones this one shows', () => {
    const dir = path.join(p.base, 'shots');
    fs.mkdirSync(dir, { recursive: true });
    for (const f of ['02-eval-SCN-1.png', '02-eval-SCN-2.png', 'verdict.md']) fs.writeFileSync(path.join(dir, f), 'x');
    dropUnshownScreenshots(dir, [path.join('out', '02-eval-SCN-1.png'), '']);
    assert.deepEqual(fs.readdirSync(dir).sort(), ['02-eval-SCN-1.png', 'verdict.md'], 'a shown one stays even when its source is gone');
  });

  it('counts the repairs tried in a row from the history and the decisions', () => {
    history({ event: 'run', run: '02-eval' }, { event: 'run', run: '03-repro', grep: 'SCN-1' }, { event: 'run', run: '04-rerun' }, { event: 'run', run: '05-rerun' });
    decide({ '02-eval': { 'SCN-1': { category: 'SCRIPT_DEFECT' } }, '04-rerun': { 'SCN-1': { category: 'SCRIPT_DEFECT' } }, '05-rerun': { 'SCN-2': { category: 'SCRIPT_DEFECT' } } });
    assert.equal(repairsTried(p), 3, 'a run of some tests is no evaluation run');
    decide({ '02-eval': { 'SCN-1': { category: 'SCRIPT_DEFECT' } }, '04-rerun': { 'SCN-1': { category: 'APPLICATION_DEFECT' } }, '05-rerun': { 'SCN-2': { category: 'SCRIPT_DEFECT' } } });
    assert.equal(repairsTried(p), 1, 'a run without one starts the count anew');
  });

  it('keeps the report of a probe a kept text names, and says a trimmed probe was trimmed', () => {
    fs.mkdirSync(p.hardened, { recursive: true });
    const probe = (id: string) => JSON.stringify({ id, at: 'now', phase: 'hardening', tool: 'api-probe', tier: 3, input: { chain: { steps: [] }, saved: { id: '7' } }, digest: ['d', 'more'], report: '' });
    fs.writeFileSync(path.join(p.hardened, 'probes.jsonl'), `${probe('P1')}\n${probe('P2')}\n`);
    for (const id of ['P1', 'P2']) { fs.mkdirSync(path.join(p.work.hardening, 'probes'), { recursive: true }); fs.writeFileSync(path.join(p.work.hardening, 'probes', `${id}.md`), `# ${id}`); }
    assert.deepEqual(keepNamedProbes(p, ['| SCN-4 | the total | 12 | 13 | P2 |']), { kept: ['P2'], lost: [] });
    fs.rmSync(path.join(p.work.hardening, 'probes', 'P1.md'));
    assert.deepEqual(keepNamedProbes(p, ['P1 and P2']), { kept: [], lost: ['P1'] }, 'a named report already gone is said');
    assert.ok(fs.existsSync(path.join(p.hardened, 'P2.md')));
    assert.equal(trimProbeLogs(p), 1);
    assert.deepEqual(readProbes(p).map((e) => [e.id, e.input === undefined]), [['P1', true], ['P2', false]]);
    assert.deepEqual(readProbes(p).map((e) => e.digest), [['d'], ['d']], 'a kept report holds the rest of a cited digest');
    assert.deepEqual(savedOf(cfg, 'ABC-1', 'P2'), { id: '7' });
    assert.throws(() => savedOf(cfg, 'ABC-1', 'P1'), /P1 was trimmed to its digest/);
  });
});
