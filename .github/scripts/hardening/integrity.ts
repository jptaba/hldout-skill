/**
 * Held-out integrity guard (phase 3 bookends + audited amendments). The freeze also records the journeys the draft
 * uses: they may change while hardening (HOW), and the verdict lists the ones that did.
 *
 *   heldout integrity <KEY> --snapshot [--reason "…"]   # freeze the draft (re-freeze needs a reason; audited)
 *   heldout integrity <KEY>              # AFTER hardening / repairs: verify
 *   heldout integrity <KEY> --propose "<assertion>" --reason "<why>"   # the hardener: I fixed its implementation
 *   heldout integrity <KEY> --amend "<assertion>" --reason "<why>"     # the triager, in a fresh context: approved
 *   heldout integrity <KEY> --reject "<assertion>" --reason "<why>"    # the triager: not approved, restore it
 *        # an amendment fixes a requirement assertion's IMPLEMENTATION (never to match AUT behaviour); --amend takes
 *        # only a proposal for the assertion as it is now, so whoever fixed it never approves it alone.
 *        # <assertion> is the key printed under "changed:" (e.g. "demo.spec.ts: [REQ AC-3] errors mention ${field}")
 *
 * Exit 2 if any [REQ …] assertion or the @req-constants block changed without an amendment,
 * or TODO(harden) markers remain.
 */
import fs from 'node:fs';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel, writeFile } from '../core/files';
import { readHistory, recordChange, recordEvent } from '../core/history';
import { evalPaths, type StoryPaths } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';
import { storyJourneys } from '../authoring/journeys/registry';
import { typeErrors } from '../authoring/preflight';
import { specFiles } from '../authoring/spec-model';
import { oracleDigest, readContract } from '../contract/contract-model';
import { amendmentReviews, copyDraft, draftOf, earlierRejections, readFreeze, revisionOf, storyIntegrity, writeFreeze, type Freeze } from './integrity-check';

export const spec: CommandSpec = {
  name: 'integrity', group: 'Tests', usage: 'KEY [--snapshot [--reason …] | --propose|--amend|--reject "<assertion>" --reason …]',
  about: 'freeze the draft / verify nothing expected changed / review an assertion fix',
  flags: ['amend', 'propose', 'reason', 'reject', 'snapshot'],
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
  // The same check advance makes (storyIntegrity), so the two can't drift apart.
  const checkIntegrity = () => storyIntegrity(cfg, key);

  if (flags.snapshot) {
    // What gets frozen must compile: a broken draft would be frozen and then "repaired" outside the audit.
    const broken = typeErrors(p.tests);
    if (broken.length) throw new Error(`The draft doesn't compile — fix it before freezing:\n  ${broken.join('\n  ')}`);
    const draft = draftOf(p.tests, oracle, journeys(p.tests));
    if (!Object.keys(draft.specs).length) throw new Error(`No *.spec.ts under ${rel(p.tests)}`);
    let next: Freeze = { ...draft, refreezes: [], amendments: [] };
    if (freeze) {
      // Re-freeze (e.g. requirement revision added scenarios): audited, never silent.
      const reason = flagStr(flags, 'reason');
      if (!reason || reason.length < 20) throw new Error('A draft already exists. Re-freezing needs --reason "<requirement revision / why>" (it is logged and shown in the verdict).');
      const before = revisionOf(freeze, p.tests);
      const { refreezes, amendments, ...previous } = freeze;
      next = { ...draft, amendments, refreezes: [...refreezes, { at: draft.frozenAt, reason, previous, absorbed: {
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

  const given = { propose: flagStr(flags, 'propose'), amend: flagStr(flags, 'amend'), reject: flagStr(flags, 'reject') };
  const step = (['propose', 'amend', 'reject'] as const).filter((f) => flags[f] !== undefined);
  if (step.length > 1) throw new Error('Give one of --propose, --amend and --reject.');
  if (step.length) {
    const which = step[0];
    const asked = given[which];
    if (!asked) throw new Error(`--${which} takes the changed assertion's key, as \`heldout integrity ${key}\` prints it under "changed:".`);
    const reason = flagStr(flags, 'reason');
    if (!reason || reason.length < 20) throw new Error(which === 'reject'
      ? '--reason is required: say why the change alters what the assertion requires.'
      : '--reason is required: explain why the assertion implementation was wrong and why the requirement is unchanged.');
    // The key is "<spec file>: <assertion message>"; the message alone is enough when only one spec has it.
    const changed = checkIntegrity().changed;
    const exact = changed.filter((c) => c.assertion === asked);
    const matches = exact.length ? exact : changed.filter((c) => c.assertion.endsWith(`: ${asked}`));
    if (matches.length > 1) throw new Error(`"${asked}" is changed in ${matches.length} spec files — give the full key:\n${matches.map((c) => `  ${c.assertion}`).join('\n')}`);
    const pending = matches[0];
    if (!pending) throw new Error(`"${asked}" is not a changed assertion. Run: heldout integrity ${key} to list changed keys.`);
    const review = amendmentReviews([pending], readHistory(p.history)).get(pending.assertion);
    if (which === 'propose') {
      // A rejection stands for the text it judged: asking again for the same change would shop for an approver.
      if (review === 'rejected') throw new Error(`The amendment of ${pending.assertion} as it is now was rejected: restore the assertion as the draft has it, or change it again and propose that.`);
      recordEvent(p.history, 'amend-proposed', { assertion: pending.assertion, draft: pending.draft, current: pending.current, reason });
      console.log(`✔ Amendment proposed for ${pending.assertion}\n  draft:   ${pending.draft}\n  current: ${pending.current}\n  a fresh triager reviews it (heldout advance ${key} hands it over); you never approve it yourself`);
      return;
    }
    // Only a proposal for the assertion as it is now is reviewed: whoever changed it said why, and someone else decides.
    if (review !== 'proposed') throw new Error(`No pending proposal for ${pending.assertion} as it is now${review === 'rejected' ? ' (it was rejected: the hardener restores it)' : ''}. The agent that fixed it proposes first: heldout integrity ${key} --propose "${pending.assertion}" --reason "…"`);
    if (which === 'reject') {
      recordEvent(p.history, 'amend-rejected', { assertion: pending.assertion, draft: pending.draft, current: pending.current, reason });
      console.log(`✔ Amendment rejected for ${pending.assertion}: the hardener restores what the assertion requires`);
      return;
    }
    const amendment = { ...pending, reason, approvedAt: new Date().toISOString() };
    writeFreeze(p.freeze, { ...freeze, amendments: [...freeze.amendments.filter((a) => a.assertion !== pending.assertion), amendment] });
    recordEvent(p.history, 'amended', { assertion: pending.assertion, reason });
    console.log(`✔ Amendment recorded for ${pending.assertion}\n  draft:   ${pending.draft}\n  current: ${pending.current}\n  → ${rel(p.freeze)}`);
    return;
  }

  const r = checkIntegrity();
  recordChange(p.history, 'integrity', {
    status: r.status, changed: r.changed.map((c) => c.assertion), removed: r.removed, constantsChanged: r.constantsChanged,
    contractChanged: Boolean(r.contractChanged), amended: r.amended.length, journeysChanged: r.journeysChanged ?? [], unhardened: r.unhardenedMarkers.length,
  });
  console.log(`Held-out integrity: ${r.status}`);
  for (const f of r.files) console.log(`  ${f.file}: ${f.draftAssertions} REQ assertions in draft → ${f.currentAssertions} now`);
  for (const x of r.draftChanged) console.log(`  ✖ the frozen draft changed: ${rel(p.tests)}/${x} — the draft stays as frozen; hardening edits ${rel(p.hardened)}/`);
  for (const x of r.removed) console.log(`  ✖ removed:  ${x}`);
  const events = readHistory(p.history);
  const reviews = amendmentReviews(r.changed, events);
  const state = { proposed: ' (amendment proposed: a fresh triager reviews it)', rejected: ' (amendment rejected: restore it)', none: '' };
  for (const x of r.changed) {
    console.log(`  ✖ changed:  ${x.assertion}${state[reviews.get(x.assertion) ?? 'none']}\n      draft:   ${x.draft}\n      current: ${x.current}`);
    for (const e of earlierRejections(x, events)) console.log(`      rejected before: ${e.current} — ${e.reason}`);
  }
  for (const x of r.constantsChanged) console.log(`  ✖ @req-constants block changed in ${x}`);
  if (r.contractChanged) console.log('  ✖ requirement contract oracle (ACs / outcomes / rules / error model / oracle gaps) changed since the freeze — only a requirement revision justifies that (re-freeze with --reason)');
  for (const x of r.amended) console.log(`  ✎ amended:  ${x.assertion} — ${x.reason}`);
  for (const x of r.added) console.log(`  + added:    ${x}`);
  for (const x of r.journeyAssertions ?? []) console.log(`  ✖ requirement assertion in a journey file (outside the freeze): ${x} — move it into the test`);
  for (const x of r.journeysChanged ?? []) console.log(`  • journey changed since the freeze (HOW; listed in the verdict): ${x}`);
  for (const m of r.unhardenedMarkers) console.log(`  ⚠ unhardened: ${m.file}:${m.line} ${m.text}`);
  if (r.status === 'VIOLATED' || r.unhardenedMarkers.length) process.exit(2);
}
