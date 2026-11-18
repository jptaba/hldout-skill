/**
 * Each finding checked once more before it is published: the agent that made a check working is inclined to blame the
 * application when it fails, so a finding is reproduced again, unchanged, before the verdict calls it a defect. A
 * finding the tool replayed outside the test (twice, the same answer) is reproduced already; the others' tests run
 * again on their own. A finding whose tests don't fail the same way again is not published as a defect: it becomes
 * NEEDS_INVESTIGATION, saying why, and the verdict shows the verification of each finding.
 *
 *   heldout verify KEY          the final evaluation run's findings (advance runs it after the triage)
 *
 * Writes 6-triage/verification.json: the run, and per finding its tests, whether it held and how.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import type { Args, CommandSpec } from '../core/cli';
import { SCRIPTS_DIR, assertIssueKey, loadConfig } from '../core/config';
import { rel, writeFile } from '../core/files';
import { recordEvent } from '../core/history';
import { evalPaths, evalRunsOf, listRuns, runFile } from '../core/paths';
import { readRunRecord, writeRunRecord, type TriageEntry } from '../run/run-record';
import { findingsOf, heldAgain, replayed, verificationFile, type Verification } from './verification';

export const spec: CommandSpec = {
  name: 'verify', group: 'Run', usage: 'KEY',
  about: 'reproduce each finding once more before the verdict: replayed by the tool, or its tests run again on their own',
  flags: [],
};

export function run({ _ }: Args): void {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const finalRun = evalRunsOf(p.runs).at(-1);
  if (!finalRun) throw new Error(`${key} has no evaluation run to verify`);
  const file = runFile(p, finalRun);
  const record = readRunRecord(file);
  const findings = findingsOf(record.entries);
  const out: Verification = { run: finalRun, at: new Date().toISOString(), findings: [] };
  const rerun = [...findings.values()].filter((g) => !g.every(replayed)).flat();
  let again: TriageEntry[] = []; let rerunName: string | undefined;
  if (rerun.length) {
    const before = new Set(listRuns(p.runs));
    const grep = [...new Set(rerun.map((e) => e.scenario))].map((s) => `${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d.])`).join('|');
    console.log(`▶ heldout run ${key} --label repro-verify --grep … (${rerun.length} test(s) of ${findings.size} finding(s), on their own)`);
    spawnSync(process.execPath, [...process.execArgv, path.join(SCRIPTS_DIR, 'heldout.ts'), 'run', key, '--label', 'repro-verify', '--grep', grep, '--quiet'], { stdio: 'inherit' });
    rerunName = listRuns(p.runs).find((r) => !before.has(r));
    again = rerunName ? readRunRecord(runFile(p, rerunName)).entries : [];
  }
  const undone: TriageEntry[] = [];
  for (const [title, tests] of findings) {
    if (tests.every(replayed)) { out.findings.push({ title, tests: tests.map((e) => e.scenario), held: true, by: 'replayed by the tool outside the test, twice' }); continue; }
    const why = rerunName ? heldAgain(tests, again) : 'its tests could not be run again (the run did not start)';
    out.findings.push({ title, tests: tests.map((e) => e.scenario), held: !why, by: rerunName ? `its tests run again on their own (${rerunName})` : 'no run', ...(why ? { why } : {}) });
    if (!why) continue;
    // Not published as a defect: the decision says why, and the verdict counts it as not settled.
    for (const e of tests) {
      e.final = { ...e.final!, category: 'NEEDS_INVESTIGATION', rationale: `Not reproduced when verified before publishing: ${why}. As decided first: ${e.final!.rationale}`, confirmedAt: new Date().toISOString() };
      undone.push(e);
    }
  }
  if (undone.length) {
    writeRunRecord(file, record);
    recordEvent(p.history, 'decided', { run: finalRun, tests: undone.map((e) => e.scenario), category: 'NEEDS_INVESTIGATION', by: 'verification' });
  }
  writeFile(verificationFile(p), `${JSON.stringify(out, null, 2)}\n`);
  recordEvent(p.history, 'verified', { run: finalRun, findings: out.findings.length, held: out.findings.filter((f) => f.held).length, ...(rerunName ? { rerun: rerunName } : {}) });
  for (const f of out.findings) console.log(`${f.held ? '✔' : '✖'} ${f.title}: ${f.held ? f.by : f.why}`);
  console.log(`✔ ${out.findings.filter((f) => f.held).length} of ${out.findings.length} finding(s) held → ${rel(verificationFile(p))}`);
}
