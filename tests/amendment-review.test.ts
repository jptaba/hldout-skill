import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { integrityHandover, repairDue } from '../.github/scripts/flow/advance';
import { readHistory } from '../.github/scripts/core/history';
import { amendmentReviews, draftOf, earlierRejections, writeFreeze } from '../.github/scripts/hardening/integrity-check';
import { oracleDigest, type RequirementContract } from '../.github/scripts/contract/contract-model';
import { evalPaths } from '../.github/scripts/core/paths';
import type { HeldoutConfig } from '../.github/scripts/core/profile';
import { phasesOf } from '../.github/scripts/flow/phases';

// specs/017-lean-coordinator US2: the hardener proposes an amendment, a fresh triager amends or rejects it.
const A = 'a.spec.ts: [REQ AC-1] message shown';
const changed = [{ assertion: A, draft: '.toHaveText(REQ.MSG)', current: '.toContainText(REQ.MSG)' }];
const ev = (event: string, current = changed[0].current, draft = changed[0].draft) => ({ event, assertion: A, draft, current });

describe('where a changed assertion stands in its review', () => {
  it('nobody proposed it, a proposal is pending, or it was rejected', () => {
    assert.equal(amendmentReviews(changed, []).get(A), 'none');
    assert.equal(amendmentReviews(changed, [ev('amend-proposed')]).get(A), 'proposed');
    assert.equal(amendmentReviews(changed, [ev('amend-proposed'), ev('amend-rejected')]).get(A), 'rejected');
  });
  it('is bound to the assertion as it is now: a proposal for another text does not count', () => {
    assert.equal(amendmentReviews(changed, [ev('amend-proposed', '.toBeVisible()')]).get(A), 'none');
    assert.equal(amendmentReviews(changed, [ev('amend-proposed'), ev('amend-rejected', '.toBeVisible()')]).get(A), 'proposed');
    assert.equal(amendmentReviews(changed, [ev('amend-rejected', changed[0].current, '.toHaveText(REQ.OLD)')]).get(A), 'none', 'a re-freeze changed the draft: reviewed anew');
  });
  it('lists the rejections of other texts of the assertion, not of this one or of an older draft', () => {
    const rejected = (current: string, draft = changed[0].draft) => ({ ...ev('amend-rejected', current, draft), reason: `no: ${current}` });
    assert.deepEqual(earlierRejections(changed[0], [rejected('.toBeVisible()'), rejected(changed[0].current), rejected('.toBeAttached()', '.toHaveText(REQ.OLD)')]),
      [{ current: '.toBeVisible()', reason: 'no: .toBeVisible()' }]);
  });
});

describe('advance, when integrity is not preserved', () => {
  it('hands a proposed amendment to the triager, in a fresh context', () => {
    const h = integrityHandover('ABC-1', changed, [ev('amend-proposed')]);
    assert.equal(h.agent, 'heldout-triager');
    assert.match(h.task, /^Review the proposed amendment\(s\) for ABC-1: "a\.spec\.ts: \[REQ AC-1\] message shown"/);
    assert.match(h.why ?? '', /fresh context/);
  });
  it('sends a rejected one, or a change nobody proposed, back to the hardener', () => {
    const rejected = integrityHandover('ABC-1', changed, [ev('amend-proposed'), ev('amend-rejected')]);
    assert.equal(rejected.agent, 'heldout-hardener');
    assert.match(rejected.task, /^Restore the assertion\(s\) of ABC-1 whose amendment the triager rejected/);
    const unproposed = integrityHandover('ABC-1', changed, []);
    assert.equal(unproposed.agent, 'heldout-hardener');
    assert.match(unproposed.task, /propose its amendment/);
    assert.equal(integrityHandover('ABC-1', [], []).agent, 'heldout-hardener', 'a marker left or a removed assertion');
  });
});

describe('a story hardened but not preserved waits on its integrity, not on the hardener', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-blocked-'));
  // An absolute output folder: the story lives in the temporary project, whatever the working directory.
  const cfg = { autId: 'shop', outputDir: path.join(root, 'output'), aut: { name: 'Shop', baseURL: 'https://shop.test/' }, jira: {}, auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/' } }, defaultAut: 'shop' } as unknown as HeldoutConfig;
  after(() => fs.rmSync(root, { recursive: true, force: true }));
  const harden = () => phasesOf(cfg, 'ABC-1').find((ph) => ph.name === 'harden')!;
  it('marks the phase blocked by integrity only when everything else in it is done', () => {
    const p = evalPaths(cfg, 'ABC-1');
    fs.mkdirSync(p.hardened, { recursive: true });
    fs.writeFileSync(path.join(p.hardened, 'a.spec.ts'), "test('SCN-001: a', async () => {});\n");
    fs.mkdirSync(path.dirname(p.history), { recursive: true });
    fs.writeFileSync(p.history, `${JSON.stringify({ at: 'now', event: 'integrity', skill: 'x', status: 'VIOLATED' })}\n`);
    fs.writeFileSync(p.hardeningLog, '# Hardening log\n**Tiers used:** \n');
    assert.equal(harden().blockedBy, undefined, 'the log is not filled in: still the hardener\'s');
    fs.writeFileSync(p.hardeningLog, '# Hardening log\n**Tiers used:** tier 3\n');
    assert.deepEqual([harden().done, harden().blockedBy], [false, 'integrity']);
    fs.writeFileSync(path.join(p.hardened, 'a.spec.ts'), "test('SCN-001: a', async () => {}); // TODO(harden)\n");
    assert.equal(harden().blockedBy, undefined, 'a guess left: still the hardener\'s');
  });
  it('advance checks integrity again there and routes by the review, on both paths', () => {
    const src = fs.readFileSync(path.join(import.meta.dirname, '..', '.github', 'scripts', 'flow', 'advance.ts'), 'utf8');
    assert.match(src, /if \(next\.blockedBy === 'integrity'\) \{\s*if \(heldout\('integrity', key\) === 0 && moved\(\)\) continue;[^\n]*\n[^\n]*\n\s*return integrityTo\(repairDue\(p\)\.length \? ' --rerun' : ''\);/);
    assert.match(src, /if \(heldout\('integrity', key\) !== 0\) return integrityTo\(' --rerun'\);/);
    assert.match(src, /if \(heldout\('integrity', key\) !== 0\) return integrityTo\(\);\s*heldout\('run', key, '--label', 'eval'/);
    assert.match(src, /const h = integrityHandover\(key, storyIntegrity\(cfg, key\)\.changed, readHistory\(evalPaths\(cfg, key\)\.history\)\);/);
  });
});

describe('a repair under way, so that what follows it is a re-run', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-repair-'));
  const p = { runs: path.join(dir, '5-run'), history: path.join(dir, 'history.jsonl'), decisions: path.join(dir, 'decisions.json') };
  after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const record = (run: string, category?: string) => fs.writeFileSync(path.join(p.runs, `${run}.json`), JSON.stringify({
    key: 'ABC-1', run, generatedAt: 'now', meta: {}, summary: { total: 1, passed: 0, failed: 1, flaky: 0, skipped: 0 },
    entries: [{ scenario: 'SCN-002', title: 'SCN-002: x', file: 'a.spec.ts', status: 'failed', tags: [], requirementRefs: ['AC-1'], otherFailures: [], evidence: {}, ...(category ? { final: { category, title: 't', rationale: 'r', evidence: 'P1' } } : {}) }],
  }));
  it('is due when the last evaluation run has a confirmed script defect, and not before the first one', () => {
    fs.mkdirSync(p.runs, { recursive: true });
    assert.deepEqual(repairDue(p), [], 'no evaluation run yet: the first hardening');
    record('01-harden', 'SCRIPT_DEFECT');
    assert.deepEqual(repairDue(p), [], 'a harden run is not an evaluation');
    record('02-eval', 'APPLICATION_DEFECT');
    assert.deepEqual(repairDue(p), []);
    record('03-eval', 'SCRIPT_DEFECT');
    assert.deepEqual(repairDue(p).map((e) => e.scenario), ['SCN-002']);
  });
  it('is not due once three repairs in a row are spent: the loop is bounded', () => {
    // Evaluation runs in the history, each ending in a confirmed script defect: the repairs tried in a row.
    const tried = (runs: string[]) => {
      fs.writeFileSync(p.history, runs.map((run) => JSON.stringify({ at: 'now', event: 'run', skill: 'x', run })).join('\n') + '\n');
      fs.writeFileSync(p.decisions, JSON.stringify(Object.fromEntries(runs.map((r) => [r, { 'SCN-002': { category: 'SCRIPT_DEFECT' } }]))));
      for (const r of runs) record(r, 'SCRIPT_DEFECT');
    };
    tried(['04-eval', '05-rerun', '06-rerun']);
    assert.deepEqual(repairDue(p).map((e) => e.scenario), ['SCN-002'], 'three tried: one more is allowed');
    tried(['04-eval', '05-rerun', '06-rerun', '07-rerun']);
    assert.deepEqual(repairDue(p), [], 'four tried: on to the verdict');
  });
  it('is what both the verdict and the blocked hardening go by', () => {
    const src = fs.readFileSync(path.join(import.meta.dirname, '..', '.github', 'scripts', 'flow', 'advance.ts'), 'utf8');
    assert.match(src, /const scriptDefects = repairDue\(p\);\s*if \(scriptDefects\.length\) \{/);
    assert.match(src, /if \(!evalRuns\.length \|\| repairsTried\(p\) > MAX_REPAIRS\) return \[\];/);
  });
});

describe('heldout integrity --propose, --amend and --reject', () => {
  const DISPATCHER = path.join(import.meta.dirname, '..', '.github', 'scripts', 'heldout.ts');
  const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-amend-'));
  const story = path.join(root, 'output', 'shop', 'ABC-1');
  const history = path.join(story, 'history.jsonl');
  const heldout = (...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, 'integrity', 'ABC-1', ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });
  const SPEC = (a: string, b: string) => `test('SCN-001: a', async () => {\n  await expect(page.getByTestId('m'), '[REQ AC-1] message shown')${a};\n  await expect(page.getByTestId('n'), '[REQ AC-2] name shown')${b};\n});\n`;
  const REASON = 'the regex required a word boundary the page does not render';
  before(() => {
    fs.writeFileSync(path.join(root, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/' } } }));
    const contract = { key: 'ABC-1', acceptanceCriteria: [], rules: [], errorModel: [], gaps: [] } as unknown as RequirementContract;
    fs.mkdirSync(path.join(story, '2-contract'), { recursive: true });
    fs.writeFileSync(path.join(story, '2-contract', 'contract.json'), JSON.stringify(contract));
    fs.mkdirSync(path.join(story, '3-tests'), { recursive: true });
    fs.writeFileSync(path.join(story, '3-tests', 'a.spec.ts'), SPEC('.toHaveText(/\\bHello\\b/)', '.toHaveText(/\\bAda\\b/)'));
    writeFreeze(path.join(story, '3-tests', 'freeze.json'), { ...draftOf(path.join(story, '3-tests'), oracleDigest(contract)), refreezes: [], amendments: [] });
    fs.mkdirSync(path.join(story, '4-hardening'), { recursive: true });
    fs.writeFileSync(path.join(story, '4-hardening', 'a.spec.ts'), SPEC('.toContainText(\'Hello\')', '.toContainText(\'Ada\')'));
  });
  after(() => fs.rmSync(root, { recursive: true, force: true }));

  it('refuses an amendment nobody proposed', () => {
    const r = heldout('--amend', '[REQ AC-1] message shown', '--reason', REASON);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /No pending proposal for a\.spec\.ts: \[REQ AC-1\] message shown/);
    assert.match(heldout('--reject', '[REQ AC-1] message shown', '--reason', REASON).stderr, /No pending proposal/);
  });
  it('refuses two steps at once, and a step without a reason', () => {
    assert.match(heldout('--propose', '[REQ AC-1] message shown', '--amend', '[REQ AC-1] message shown', '--reason', REASON).stderr, /one of --propose, --amend and --reject/);
    assert.match(heldout('--propose', '[REQ AC-1] message shown').stderr, /--reason is required/);
    assert.match(heldout('--propose', '[REQ AC-9] nothing', '--reason', REASON).stderr, /is not a changed assertion/);
  });
  it('records a proposal, then the triager amends one and rejects the other', () => {
    for (const a of ['[REQ AC-1] message shown', '[REQ AC-2] name shown']) assert.equal(heldout('--propose', a, '--reason', REASON).status, 0);
    const pending = heldout();
    assert.equal(pending.status, 2);
    assert.match(pending.stdout, /changed: {2}a\.spec\.ts: \[REQ AC-1\] message shown \(amendment proposed: a fresh triager reviews it\)/);
    assert.equal(heldout('--amend', '[REQ AC-1] message shown', '--reason', REASON).status, 0);
    assert.equal(heldout('--reject', '[REQ AC-2] name shown', '--reason', 'containing the name is weaker than showing it').status, 0);
    const after = heldout();
    assert.match(after.stdout, /amended: {2}a\.spec\.ts: \[REQ AC-1\] message shown/);
    assert.match(after.stdout, /changed: {2}a\.spec\.ts: \[REQ AC-2\] name shown \(amendment rejected: restore it\)/);
    assert.match(heldout('--amend', '[REQ AC-2] name shown', '--reason', REASON).stderr, /it was rejected: the hardener restores it/);
    // A rejection stands: the same change can't be put to another triager.
    const again = heldout('--propose', '[REQ AC-2] name shown', '--reason', REASON);
    assert.notEqual(again.status, 0);
    assert.match(again.stderr, /was rejected: restore the assertion/);
    assert.deepEqual(readHistory(history).map((e) => e.event).filter((e) => e !== 'integrity'), ['amend-proposed', 'amend-proposed', 'amended', 'amend-rejected']);
  });
  it('takes a new proposal once the rejected assertion is changed again, and shows the reviewer the rejection', () => {
    fs.writeFileSync(path.join(story, '4-hardening', 'a.spec.ts'), SPEC('.toContainText(\'Hello\')', '.toHaveText(/Ada/)'));
    assert.equal(heldout('--propose', '[REQ AC-2] name shown', '--reason', REASON).status, 0);
    const out = heldout().stdout;
    assert.match(out, /\[REQ AC-2\] name shown \(amendment proposed/);
    assert.match(out, /rejected before: \.toContainText\('Ada'\) — containing the name is weaker than showing it/);
  });
  it('closes the hardening once the amended assertion stays and the rejected one is restored', () => {
    const cfg = { autId: 'shop', outputDir: path.join(root, 'output'), aut: { name: 'Shop', baseURL: 'https://shop.test/' }, jira: {} } as unknown as HeldoutConfig;
    fs.writeFileSync(path.join(story, '4-hardening', 'hardening.md'), '# Hardening log\n**Tiers used:** tier 3\n');
    const harden = () => phasesOf(cfg, 'ABC-1').find((ph) => ph.name === 'harden')!;
    assert.equal(harden().blockedBy, 'integrity', 'AC-2 still proposed');
    fs.writeFileSync(path.join(story, '4-hardening', 'a.spec.ts'), SPEC('.toContainText(\'Hello\')', '.toHaveText(/\\bAda\\b/)'));
    const r = heldout();
    assert.equal(r.status, 0, r.stdout);
    assert.match(r.stdout, /Held-out integrity: AMENDED/);
    assert.deepEqual([harden().done, harden().blockedBy], [true, undefined]);
  });
});
