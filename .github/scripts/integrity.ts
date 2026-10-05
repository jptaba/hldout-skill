/**
 * Held-out integrity guard (phase 3 bookends + audited amendments). The freeze also records the action files the draft
 * uses: they may change while hardening (HOW), and the verdict lists the ones that did.
 *
 *   heldout integrity <KEY> --snapshot [--reason "…"]   # freeze the draft (re-freeze needs a reason; audited)
 *   heldout integrity <KEY>              # AFTER hardening / repairs: verify
 *   heldout integrity <KEY> --amend "<assertion>" --reason "<why>"
 *        # approve a fix to a requirement assertion's IMPLEMENTATION (never to match AUT behaviour);
 *        # <assertion> is the key printed under "changed:" (e.g. "demo.spec.ts: [REQ AC-3] errors mention ${field}")
 *
 * Exit 2 if any [REQ …] assertion or the @req-constants block changed without an amendment,
 * or TODO(harden) markers remain.
 */
import { assertIssueKey, evalPaths, flagStr, loadConfig, main, parseArgs, rel, writeFile } from './config';
import { oracleDigest, readContract } from './contract-model';
import { checkIntegrity as checkWith, readAmendments, snapshotDraft } from './integrity-check';
import { actionsUsedBy } from './actions-store';
import { typeErrors } from './preflight';
import { specFiles } from './spec-model';
import fs from 'node:fs';
import path from 'node:path';

main(() => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const amendmentsFile = path.join(p.hardening, 'amendments.json');
  const contract = readContract(p.base);
  if (!contract) throw new Error(`No requirement contract for ${key} — phase 1b first: heldout contract ${key} --pack`);
  const oracle = oracleDigest(contract);
  const actions = () => actionsUsedBy(cfg, specFiles(p.tests));
  const checkIntegrity = (tests: string, draft: string, amendments: string, o: string) => checkWith(tests, draft, amendments, o, actions());

  if (flags.snapshot) {
    // What gets frozen must compile: a broken draft would be frozen and then "repaired" outside the audit.
    const broken = typeErrors(p.tests);
    if (broken.length) throw new Error(`The draft doesn't compile — fix it before freezing:\n  ${broken.join('\n  ')}`);
    const refreezeLog = path.join(p.hardening, 'refreeze-log.json');
    if (fs.existsSync(p.draft) && fs.readdirSync(p.draft).length) {
      // Re-freeze (e.g. requirement revision added scenarios): audited, never silent.
      const reason = flagStr(flags, 'reason');
      if (!reason || reason.length < 20) throw new Error('A draft already exists. Re-freezing needs --reason "<requirement revision / why>" (it is logged and shown in the verdict).');
      const before = checkIntegrity(p.tests, p.draft, amendmentsFile, oracle);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archive = path.join(p.hardening, 'draft-history', stamp);
      fs.cpSync(p.draft, archive, { recursive: true });
      const log = fs.existsSync(refreezeLog) ? JSON.parse(fs.readFileSync(refreezeLog, 'utf8')) : [];
      log.push({ at: new Date().toISOString(), reason, previousDraft: rel(archive), absorbed: {
        changed: before.changed.map((c) => c.assertion), removed: before.removed, constantsChanged: before.constantsChanged, added: before.added,
        ...(before.contractChanged ? { contractOracleChanged: true } : {}) } });
      writeFile(refreezeLog, `${JSON.stringify(log, null, 2)}\n`);
      if (before.changed.length || before.removed.length) console.log(`⚠ re-freeze absorbs ${before.changed.length} changed / ${before.removed.length} removed REQ assertion(s) — logged for the verdict.`);
      console.log(`  previous draft archived → ${rel(archive)}`);
    }
    const used = actions();
    const files = snapshotDraft(p.tests, p.draft, oracle, used);
    if (!files.length) throw new Error(`No *.spec.ts under ${rel(p.tests)}`);
    console.log(`✔ Draft frozen (${files.length} spec file(s) + requirement-contract oracle${used.length ? ` + the hashes of ${used.length} action file(s)` : ''}) → ${rel(p.draft)}/`);
    return;
  }

  const amend = flagStr(flags, 'amend');
  if (amend) {
    const reason = flagStr(flags, 'reason');
    if (!reason || reason.length < 20) throw new Error('--reason is required: explain why the assertion implementation was wrong and why the requirement is unchanged.');
    const pending = checkIntegrity(p.tests, p.draft, amendmentsFile, oracle).changed.find((c) => c.assertion === amend);
    if (!pending) throw new Error(`"${amend}" is not a changed assertion. Run: heldout integrity ${key} to list changed keys.`);
    const all = readAmendments(amendmentsFile).filter((a) => a.assertion !== amend);
    all.push({ ...pending, reason, approvedAt: new Date().toISOString() });
    writeFile(amendmentsFile, `${JSON.stringify(all, null, 2)}\n`);
    console.log(`✔ Amendment recorded for ${amend}\n  draft:   ${pending.draft}\n  current: ${pending.current}\n  → ${rel(amendmentsFile)}`);
    return;
  }

  const r = checkIntegrity(p.tests, p.draft, amendmentsFile, oracle);
  writeFile(p.integrity, `${JSON.stringify(r, null, 2)}\n`);
  console.log(`Held-out integrity: ${r.status}`);
  for (const f of r.files) console.log(`  ${f.file}: ${f.draftAssertions} REQ assertions in draft → ${f.currentAssertions} now`);
  for (const x of r.removed) console.log(`  ✖ removed:  ${x}`);
  for (const x of r.changed) console.log(`  ✖ changed:  ${x.assertion}\n      draft:   ${x.draft}\n      current: ${x.current}`);
  for (const x of r.constantsChanged) console.log(`  ✖ @req-constants block changed in ${x}`);
  if (r.contractChanged) console.log('  ✖ requirement contract oracle (ACs / outcomes / rules / error model / oracle gaps) changed since the freeze — only a requirement revision justifies that (re-freeze with --reason)');
  for (const x of r.amended) console.log(`  ✎ amended:  ${x.assertion} — ${x.reason}`);
  for (const x of r.added) console.log(`  + added:    ${x}`);
  for (const x of r.actionAssertions ?? []) console.log(`  ✖ requirement assertion in an action (outside the freeze): ${x} — move it into the test`);
  for (const x of r.actionsChanged ?? []) console.log(`  • action file changed since the freeze (HOW; listed in the verdict): ${x}`);
  for (const m of r.unhardenedMarkers) console.log(`  ⚠ unhardened: ${m.file}:${m.line} ${m.text}`);
  console.log(`  → ${rel(p.integrity)}`);
  if (r.status === 'VIOLATED' || r.unhardenedMarkers.length) process.exit(2);
});
