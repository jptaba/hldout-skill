/**
 * Phase 1b — Requirement contract. The MODEL reads the story and builds the contract (any format); this command
 * prepares the evidence and checks, mechanically, that what the model wrote is grounded in it.
 *
 *   heldout contract KEY --pack           evidence pack (every source line numbered) + empty contract bound to this revision
 *   heldout contract KEY                  check: anchoring, coverage ledger, literal grounding, review status → requirement-contract.md
 *   heldout contract KEY --review-prompt  the independent reviewer's instructions (for the heldout-contract-reviewer subagent)
 *   heldout contract KEY --questions      open oracle gaps to ask the user (JSON)
 *   heldout contract KEY --resolve G1 --value "…" --evidence "hardening/api-x.md"   a mechanics gap found in the application
 *   heldout contract KEY --answer G4 --value "…" --by "<who>"                       the user's answer to an oracle gap (re-review)
 *   … --allow-unreviewed  accept a contract without an independent review (warning instead of error)
 *
 * --pack never overwrites an existing contract; it always refreshes the evidence pack.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SKILL_DIR, assertIssueKey, evalPaths, flagStr, loadConfig, main, parseArgs, rel, writeFile } from './lib/config';
import { CONTRACT_FILE, checkContract, openQuestions, readContract, requirementFiles, skeletonContract, toDiscover, type RequirementContract } from './lib/contract';
import { REVIEW_FILE, checkReview, contractHash, evidencePack, readReview, reviewRefs, type ContractReview } from './lib/evidence';

const BINARY = /\.(png|jpe?g|gif|webp|bmp|pdf|docx?|xlsx?|pptx?)$/i;

function render(c: RequirementContract, review: ContractReview | undefined, reviewOk: boolean): string {
  const gapRow = (g: RequirementContract['gaps'][number]) =>
    `| ${g.id} | ${g.element} | ${g.kind} | ${g.required ? 'yes' : 'no'} | ${g.affects.join(', ')} | ${g.tried.map((t) => t.where).join(' → ')} | ${g.resolution}${g.value ? `: ${g.value}` : ''} |`;
  const esc = (s: string) => s.replace(/\|/g, '\\|');
  return [
    `# Requirement contract — ${c.key}: ${c.title}`, '',
    '_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._', '',
    `**Independent review:** ${review ? `${reviewOk ? '✅ all items supported' : '❌ open findings'} — ${review.reviewer}, ${review.reviewedAt.slice(0, 16)}` : '⚠️ not reviewed'}`, '',
    '## Sources read', '', '| Source | Contributes |', '| --- | --- |',
    ...c.sourcesRead.map((s) => `| ${s.file} | ${s.contributes ?? ''} |`), '',
    '## Acceptance criteria', '', '| AC | Layer | Criterion | Observable outcomes | Source |', '| --- | --- | --- | --- | --- |',
    ...c.acceptanceCriteria.map((a) => `| ${a.id} | ${a.layer} | ${esc(a.text)} | ${esc(a.outcomes.join('; '))} | ${a.source} |`), '',
    ...(c.endpoints.length ? ['## Endpoints', '', '| Endpoint | Auth | Success | Source |', '| --- | --- | --- | --- |',
      ...c.endpoints.map((e) => `| ${e.method} ${e.path} | ${e.auth ?? ''} | ${esc(e.success ?? '')} | ${e.source} |`), ''] : []),
    ...(c.rules.length ? ['## Rules and boundaries', '', ...c.rules.map((r) => `- **${r.id}** ${r.text} _(${r.source})_`), ''] : []),
    ...(c.errorModel.length ? ['## Error model', '', '| # | Case | Status | Body | Source |', '| --- | --- | --- | --- | --- |',
      ...c.errorModel.map((e) => `| ${e.id} | ${e.case} | ${e.status ?? ''} | ${esc(e.body ?? '')} | ${e.source} |`), ''] : []),
    ...(c.auth ? ['## Authentication', '', `${c.auth.mechanism}${c.auth.credentials ? ` — credentials: ${c.auth.credentials}` : ''} _(${c.auth.source})_`, ''] : []),
    ...(c.testData ? ['## Test data', '', c.testData.strategy, ...(c.testData.constraints ?? []).map((x) => `- ${x}`), ...(c.testData.cleanup ? [`- Cleanup: ${c.testData.cleanup}`] : []), ''] : []),
    '## Gaps', '', ...(c.gaps.length
      ? ['| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |', '| --- | --- | --- | --- | --- | --- | --- |', ...c.gaps.map(gapRow)]
      : ['_None: the requirement states every element the evaluation needs._']), '',
    ...(c.coverage?.length ? ['## Coverage ledger (every source line accounted for)', '', '| Lines | Captured as | Note |', '| --- | --- | --- |',
      ...c.coverage.map((e) => `| ${e.lines} | ${e.as} | ${esc(e.note ?? '')} |`), ''] : []),
  ].join('\n');
}

main(async () => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const file = path.join(p.base, CONTRACT_FILE);
  const packFile = path.join(p.requirement, 'evidence-pack.md');
  if (!fs.existsSync(p.storyMd)) throw new Error(`No ${rel(p.storyMd)} — run: heldout fetch ${key}`);

  if (flags.pack) {
    const contract = skeletonContract(key, p.requirement);
    const binaries = requirementFiles(p.requirement).filter((f) => BINARY.test(f));
    writeFile(packFile, evidencePack(key, p.requirement, binaries, { profile: cfg.autId, name: cfg.aut.name, baseURL: cfg.aut.baseURL, apiBaseURL: cfg.aut.apiBaseURL }));
    const untranscribed = binaries.filter((b) => !fs.existsSync(path.join(p.requirement, 'transcripts', `${path.basename(b)}.md`)));
    if (fs.existsSync(file)) console.log(`= ${rel(file)} kept (your work so far; only the evidence pack is rebuilt)`);
    else { writeFile(file, `${JSON.stringify(contract, null, 2)}\n`); console.log(`✔ empty contract bound to this requirement revision → ${rel(file)}`); }
    console.log(`✔ evidence pack → ${rel(packFile)} (${contract.sourcesRead.length} source(s)${untranscribed.length ? `; ${untranscribed.length} non-text attachment(s) to transcribe first` : binaries.length ? `; ${binaries.length} transcript(s)` : ''})`);
    console.log('\nNext:');
    if (untranscribed.length) {
      console.log('  0. Transcribe each non-text attachment (open it with the Read tool; write everything it states, no interpretation):');
      for (const b of untranscribed) console.log(`     ${rel(path.join(p.requirement, 'transcripts', `${path.basename(b)}.md`))}   first line: transcribedFrom: attachments/${path.basename(b)}`);
      console.log(`     then run heldout contract ${key} --pack again so its lines are numbered (the extractor subagent can do this as its first step)`);
    }
    console.log(`  1. Build the contract from the evidence pack — delegate to the heldout-contract-extractor subagent, or follow ${rel(path.join(SKILL_DIR, 'references', 'requirement-contract.md'))}`);
    console.log(`  2. heldout contract ${key}                  (anchoring, coverage, grounded literals)`);
    console.log(`  3. Independent review — the heldout-contract-reviewer subagent writes ${REVIEW_FILE}; then re-run step 2`);
    return;
  }

  const c = readContract(p.base);
  if (!c) throw new Error(`No ${rel(file)} — run: heldout contract ${key} --pack`);

  if (flags.questions) {
    console.log(JSON.stringify(openQuestions(c).map((g) => ({ id: g.id, required: g.required, affects: g.affects, question: g.element, tried: g.tried })), null, 2));
    return;
  }
  // --resolve G<n>: a mechanics gap found in the application (no re-review). --answer G<n>: the user's answer to an
  // oracle gap (changes the oracle, so the contract goes back to the reviewer).
  const gapFlag = flagStr(flags, 'resolve') ? 'resolve' : flagStr(flags, 'answer') ? 'answer' : undefined;
  if (gapFlag) {
    const g = c.gaps.find((x) => x.id === flagStr(flags, gapFlag));
    if (!g) throw new Error(`No gap ${flagStr(flags, gapFlag)} in ${rel(file)} — gaps: ${c.gaps.map((x) => x.id).join(', ') || 'none'}`);
    const value = flagStr(flags, 'value');
    if (!value) throw new Error(`--${gapFlag} ${g.id} needs --value "<what was found / answered>"`);
    if (gapFlag === 'resolve') {
      if (g.kind !== 'mechanics') throw new Error(`${g.id} is an oracle gap (WHAT is correct): it is never read off the application. Ask the user, then: heldout contract ${key} --answer ${g.id} --value "…" --by "<who>"`);
      const evidence = flagStr(flags, 'evidence');
      if (!evidence) throw new Error(`--resolve ${g.id} needs --evidence "<probe report or run that shows it>"`);
      Object.assign(g, { resolution: 'discovered-in-aut', value, evidence });
      g.tried = [...g.tried.filter((t) => t.where !== 'aut'), { where: 'aut', result: value }];
    } else {
      const by = flagStr(flags, 'by');
      if (!by) throw new Error(`--answer ${g.id} needs --by "<who answered>"`);
      Object.assign(g, { resolution: 'provided-by-user', value, evidence: `${by}, ${new Date().toISOString().slice(0, 10)}` });
      g.tried = [...g.tried.filter((t) => t.where !== 'user'), { where: 'user', result: value }];
    }
    writeFile(file, `${JSON.stringify(c, null, 2)}\n`);
    console.log(`✔ ${g.id} → ${g.resolution}: ${value}${gapFlag === 'answer' ? '\n  The oracle changed: have the heldout-contract-reviewer subagent review the contract again.' : ''}\n`);
  }
  const findings = checkContract(c, p.requirement, { hasApiBase: Boolean(cfg.aut.apiBaseURL ?? cfg.aut.baseURL) });
  if (flags['review-prompt']) {
    // A review certifies a finished contract: an empty or ungrounded one goes back to the builder first.
    const blocking = findings.filter((f) => f.level === 'error');
    if (blocking.length) {
      console.log(`The contract for ${key} is not ready for review — ${blocking.length} error(s) from the mechanical checks:`);
      for (const f of blocking) console.log(`  ✖ [${f.code}] ${f.message}`);
      console.log(`\nDo not write a review. Reply that the contract must first pass: heldout contract ${key} --allow-unreviewed`);
      process.exit(1);
    }
    const tpl = fs.readFileSync(path.join(SKILL_DIR, 'templates', 'contract-review-prompt.md'), 'utf8');
    console.log(tpl.replaceAll('{{KEY}}', key).replaceAll('{{EVAL_DIR}}', rel(p.base)).replaceAll('{{PACK}}', rel(packFile))
      .replaceAll('{{CONTRACT}}', rel(file)).replaceAll('{{REVIEW}}', rel(path.join(p.base, REVIEW_FILE)))
      .replaceAll('{{HASH}}', contractHash(c)).replaceAll('{{REFS}}', reviewRefs(c).map((r) => `\`${r}\``).join(', ')));
    return;
  }

  const review = readReview(p.base);
  const reviewFindings = checkReview(c, review, { requireReview: !flags['allow-unreviewed'] });
  const listed = new Set(['oracle-gap-open', 'mechanics-to-discover']); // shown as the two lists below
  const all = [...findings, ...reviewFindings];
  console.log(`Requirement contract ${key}: ${c.acceptanceCriteria.length} AC(s), ${c.endpoints.length} endpoint(s), ${c.rules.length} rule(s), ${c.errorModel.length} error case(s), ${c.gaps.length} gap(s), ${c.coverage.length} coverage entr(ies) · hash ${contractHash(c)}`);
  for (const f of all.filter((x) => !listed.has(x.code))) console.log(`  ${f.level === 'error' ? '✖' : '⚠'} [${f.code}] ${f.message}`);
  if (!all.some((f) => f.level === 'error')) console.log(`  ✔ anchored (${c.acceptanceCriteria.length} quote(s) found at their cited lines), fully covered (every numbered line, in ${c.coverage.length} coverage entr${c.coverage.length === 1 ? 'y' : 'ies'}), grounded (every expected status, number, message and path found in the sources)${review && review.contractHash === contractHash(c) ? ' and independently reviewed' : '; the independent review is next (heldout-contract-reviewer subagent)'}`);
  const questions = openQuestions(c);
  if (questions.length) {
    console.log(`\nQuestions for the user (${questions.length}) — ask the user (AskUserQuestion in Claude Code, in the chat elsewhere); unanswered, the affected criteria are @needs-clarification or # OPEN-QUESTION:`);
    for (const g of questions) console.log(`  ${g.id}${g.required ? ' [required]' : ''} ${g.element} → affects ${g.affects.join(', ') || 'no criterion yet'}`);
  }
  const discover = toDiscover(c);
  if (discover.length) {
    console.log(`\nTo discover from the application during hardening (${discover.length}) — record each as discovered-in-aut with evidence:`);
    for (const g of discover) console.log(`  ${g.id} ${g.element} → affects ${g.affects.join(', ') || 'no criterion yet'}`);
  }
  if (!review && !findings.some((f) => f.level === 'error')) console.log(`\nNext: independent review — heldout-contract-reviewer subagent (instructions: heldout contract ${key} --review-prompt)`);
  writeFile(path.join(p.base, 'requirement-contract.md'), render(c, review, Boolean(review) && !reviewFindings.some((f) => f.level === 'error')));
  console.log(`  → ${rel(path.join(p.base, 'requirement-contract.md'))}`);
  if (all.some((f) => f.level === 'error')) process.exit(1);
});
