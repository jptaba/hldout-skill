/**
 * Held-out integrity guard (phase 3 bookends). The freeze also records the journeys the draft uses: they may change
 * while hardening (HOW), and the verdict lists the ones that did.
 *
 *   heldout integrity <KEY> --snapshot [--reason "…"]   # freeze the draft (re-freeze needs a reason; audited)
 *   heldout integrity <KEY>              # AFTER hardening / repairs: verify
 *
 * Exit 2 if an expectation of the draft is gone, changed or added, the contract changed, or TODO(harden) markers remain.
 */
import fs from 'node:fs';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel, writeFile } from '../core/files';
import { recordChange, recordEvent } from '../core/history';
import { evalPaths, type StoryPaths } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';
import { storyJourneys } from '../authoring/journeys/registry';
import { typeErrors } from '../authoring/preflight';
import { specFiles } from '../authoring/spec-model';
import { oracleDigest, readContract } from '../contract/contract-model';
import { checkIntegrity as checkWith, copyDraft, draftOf, readFreeze, revisionOf, writeFreeze, type Freeze } from './integrity-check';

export const spec: CommandSpec = {
  name: 'integrity', group: 'Tests', usage: 'KEY [--snapshot [--reason …]]',
  about: 'freeze the draft / verify nothing expected changed',
  flags: ['reason', 'snapshot'],
};

/** The hardening log's template, at the start of hardening: the layout of references/hardening.md §5. */
function startHardeningLog(cfg: HeldoutConfig, key: string, p: StoryPaths): void {
  if (fs.existsSync(p.hardeningLog)) return;
  writeFile(p.hardeningLog, [
    `# Hardening log — ${key}`, '**Tiers used:** ', `**AUT profile:** ${cfg.autId} — ${cfg.aut.baseURL}${cfg.aut.apiBaseURL && cfg.aut.apiBaseURL !== cfg.aut.baseURL ? ` · ${cfg.aut.apiBaseURL}` : ''} · **Date:** `, '',
    '## UI locators', '| Test(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |', '| --- | --- | --- | --- | --- | --- |',
    '## API mechanics', '| Item | Verified | Evidence |', '| --- | --- | --- |',
    '## Journeys (reused, fixed, added)', '| Journey | Change | Why | Evidence |', '| --- | --- | --- | --- |',
    '## Mechanics changed (non-locator)', '',
    '## Observed deviations (assertions intentionally left unchanged)', '| Test | Requirement says | AUT shows | Evidence |', '| --- | --- | --- | --- |', '',
  ].join('\n'));
}

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const contract = readContract(p.contract);
  if (!contract) throw new Error(`No requirement contract for ${key} — phase 1b first: heldout contract ${key} --pack`);
  const oracle = oracleDigest(contract);
  const journeys = (dir: string) => storyJourneys(cfg, cfg.autId, specFiles(dir));
  const freeze = readFreeze(p.freeze);
  const checkIntegrity = () => checkWith(p.tests, p.hardened, freeze, oracle, journeys(p.hardened));

  if (flags.snapshot) {
    // What gets frozen must compile: a broken draft would be frozen and then "repaired" outside the audit.
    const broken = typeErrors(p.tests);
    if (broken.length) throw new Error(`The draft doesn't compile — fix it before freezing:\n  ${broken.join('\n  ')}`);
    const draft = draftOf(p.tests, oracle, journeys(p.tests));
    if (!Object.keys(draft.specs).length) throw new Error(`No *.spec.ts under ${rel(p.tests)}`);
    let next: Freeze = { ...draft, refreezes: [] };
    if (freeze) {
      // Re-freeze (e.g. requirement revision added scenarios): audited, never silent.
      const reason = flagStr(flags, 'reason');
      if (!reason || reason.length < 20) throw new Error('A draft already exists. Re-freezing needs --reason "<requirement revision / why>" (it is logged and shown in the verdict).');
      const before = revisionOf(freeze, p.tests);
      const { refreezes, ...previous } = freeze;
      next = { ...draft, refreezes: [...refreezes, { at: draft.frozenAt, reason, previous, absorbed: {
        ...before, ...(freeze.contractOracle !== oracle ? { contractOracleChanged: true } : {}) } }] };
      if (before.changed.length || before.removed.length) console.log(`⚠ re-freeze absorbs ${before.changed.length} changed / ${before.removed.length} removed REQ assertion(s) — logged for the verdict.`);
    }
    writeFreeze(p.freeze, next);
    // Hardening starts from a copy: the draft stays as frozen, the hardener edits only its own folder.
    const copied = copyDraft(p.tests, p.hardened);
    startHardeningLog(cfg, key, p);
    recordEvent(p.history, freeze ? 'refrozen' : 'frozen', { specs: Object.keys(draft.specs), journeys: Object.keys(draft.journeys).length, ...(freeze ? { reason: flagStr(flags, 'reason') } : {}) });
    const n = Object.keys(draft.journeys).length;
    console.log(`✔ Draft frozen (${Object.keys(draft.specs).length} spec file(s) + the requirement contract's oracle${n ? ` + the hashes of ${n} journey(s)` : ''}${freeze ? '; the previous draft\'s hashes are kept in it as a re-freeze' : ''}) → ${rel(p.freeze)}`);
    console.log(`✔ the hardener's copy (${copied.join(', ')}) → ${rel(p.hardened)}/${freeze ? ' (written over the earlier copy: harden it again)' : ''}`);
    return;
  }
  if (!freeze) throw new Error(`${key} has no frozen draft yet — freeze it first: heldout integrity ${key} --snapshot`);

  const r = checkIntegrity();
  recordChange(p.history, 'integrity', {
    status: r.status, changed: r.changed.map((c) => c.assertion), removed: r.removed, constantsChanged: r.constantsChanged,
    contractChanged: Boolean(r.contractChanged), journeysChanged: r.journeysChanged ?? [], unhardened: r.unhardenedMarkers.length,
  });
  console.log(`Held-out integrity: ${r.status}`);
  for (const f of r.files) console.log(`  ${f.file}: ${f.draftAssertions} REQ assertions in draft → ${f.currentAssertions} now`);
  for (const x of r.draftChanged) console.log(`  ✖ the frozen draft changed: ${rel(p.tests)}/${x} — the draft stays as frozen; hardening edits ${rel(p.hardened)}/`);
  for (const x of r.removed) console.log(`  ✖ removed:  ${x}`);
  for (const x of r.changed) console.log(`  ✖ changed:  ${x.assertion}\n      draft:   ${x.draft}\n      current: ${x.current}`);
  for (const x of r.constantsChanged) console.log(`  ✖ @req-constants block changed in ${x}`);
  if (r.contractChanged) console.log('  ✖ requirement contract oracle (ACs / outcomes / rules / error model / oracle gaps) changed since the freeze — only a requirement revision justifies that (re-freeze with --reason)');
  for (const x of r.added) console.log(`  + added:    ${x}`);
  for (const x of r.journeyAssertions ?? []) console.log(`  ✖ requirement assertion in a journey file (outside the freeze): ${x} — move it into the test`);
  for (const x of r.journeysChanged ?? []) console.log(`  • journey changed since the freeze (HOW; listed in the verdict): ${x}`);
  for (const m of r.unhardenedMarkers) console.log(`  ⚠ unhardened: ${m.file}:${m.line} ${m.text}`);
  if (r.status === 'VIOLATED' || r.unhardenedMarkers.length) process.exit(2);
}
