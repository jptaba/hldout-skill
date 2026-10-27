/**
 * Phase 1b — Requirement contract. The MODEL reads the story and builds the contract (any format); this command
 * prepares the evidence and checks, mechanically, that what the model wrote is grounded in it.
 *
 *   heldout contract KEY --pack           evidence pack (every source line numbered) + empty contract bound to this revision
 *   heldout contract KEY                  check: anchoring, coverage ledger, literal grounding, review status (+ a copy to read, in the scratch area)
 *   heldout contract KEY --review-prompt  the independent reviewer's instructions (for the heldout-contract-reviewer subagent)
 *   heldout contract KEY --review-bind    the reviewer's last step: binds its review to the contract (hash, time) and checks
 *   heldout contract KEY --questions      open oracle gaps: the questions the verdict puts to the story's owner (JSON)
 *   heldout contract KEY --resolve G1 --value "…" --evidence P7   a mechanics gap found in the application (the probe
 *                                         that shows it: its report is kept in 4-hardening/; or the run that showed it)
 *   heldout contract KEY --resolve-from gaps.json    several of them at once: [{ "id", "value", "evidence" }, …]
 *   heldout contract KEY --answer G4 --value "…" --by "<who>"                       the owner's answer to a verdict's open question, before the next evaluation (re-review)
 *   … --allow-unreviewed  accept a contract without an independent review (warning instead of error)
 *
 * --pack never overwrites an existing contract; it always refreshes the evidence pack.
 */
import fs from 'node:fs';
import path from 'node:path';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { SKILL_DIR, assertIssueKey, loadConfig } from '../core/config';
import { rel, writeFile } from '../core/files';
import { readHistory, recordChange, recordEvent } from '../core/history';
import { citeProbes } from '../core/probe-log';
import { evalPaths } from '../core/paths';
import { accountRoles, createsAccounts, type AccountRecipe } from '../core/profile';
import { checkContract, openQuestions, readContract, requirementFiles, skeletonContract, toDiscover } from './contract-model';
import { renderContract } from './contract-render';
import { changedSinceReview, checkReview, contractHash, evidencePack, readReview, reviewItemHashes, reviewRefs } from './evidence';

const BINARY = /\.(png|jpe?g|gif|webp|bmp|pdf|docx?|xlsx?|pptx?)$/i;


/** What the profile's accounts recipe already provides, for the evidence pack (no user names, no secrets). */
function accountsLine(r?: AccountRecipe): string | undefined {
  if (!r || !(r.existing?.length || r.token || r.signIn || createsAccounts(r))) return undefined;
  const roles = [...accountRoles(r)].map(([role, n]) => `${n} ${role}`).join(', ');
  const who = createsAccounts(r) ? 'the tests create their own users' : `${r.existing?.length ?? 0} existing account(s)${roles ? ` (${roles})` : ''}`;
  const how = [r.token && 'sign-in over the API', r.signIn && 'sign-in on the web application'].filter(Boolean).join(' and ');
  // The header a signed-in call carries is the recipe's business: named here, so nobody records it as a gap.
  const header = r.token ? `; a signed-in call sends \`${r.authHeader ?? 'Authorization: Bearer ${token}'}\`` : '';
  return `${who}${how ? `, with ${how} saved in the profile's accounts recipe${header}` : '; how they sign in is found while hardening and saved in the profile for every later story'}`;
}

export const spec: CommandSpec = {
  name: 'contract', group: 'Requirement',
  usage: 'KEY [--pack | --review-prompt | --questions | --resolve G1 --value … --evidence … | --resolve-from gaps.json | --answer G2 --value … --by … | --allow-unreviewed]',
  about: 'evidence pack + checks for the model-built, independently reviewed requirement contract',
  flags: ['allow-unreviewed', 'answer', 'by', 'evidence', 'pack', 'questions', 'resolve', 'resolve-from', 'review-bind', 'review-prompt', 'value'],
};

export async function run({ _, flags }: Args): Promise<void> {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const file = p.contract;
  const packFile = p.work.evidencePack;
  if (!fs.existsSync(p.storyMd)) throw new Error(`No ${rel(p.storyMd)} — run: heldout fetch ${key}`);

  if (flags.pack) {
    const contract = skeletonContract(key, p.requirement);
    const binaries = requirementFiles(p.requirement).filter((f) => BINARY.test(f));
    writeFile(packFile, evidencePack(key, p.requirement, binaries, { profile: cfg.autId, name: cfg.aut.name, baseURL: cfg.aut.baseURL, apiBaseURL: cfg.aut.apiBaseURL, accounts: accountsLine(cfg.aut.accounts) }));
    const untranscribed = binaries.filter((b) => !fs.existsSync(path.join(p.requirement, 'transcripts', `${path.basename(b)}.md`)));
    if (fs.existsSync(file)) console.log(`= ${rel(file)} kept (your work so far; only the evidence pack is rebuilt)`);
    else { writeFile(file, `${JSON.stringify(contract, null, 2)}\n`); console.log(`✔ empty contract bound to this requirement revision → ${rel(file)}`); }
    console.log(`✔ evidence pack → ${rel(packFile)} (${contract.sourcesRead.length} source(s)${untranscribed.length ? `; ${untranscribed.length} image(s) to transcribe first` : binaries.length ? `; ${binaries.length} transcript(s)` : ''})`);
    console.log('\nNext:');
    if (untranscribed.length) {
      console.log('  0. Transcribe each image (open it; write all the text it shows and what it shows without words, no interpretation):');
      for (const b of untranscribed) console.log(`     ${rel(path.join(p.requirement, 'transcripts', `${path.basename(b)}.md`))}   first line: transcribedFrom: linked/${path.basename(b)}`);
      console.log(`     then run heldout contract ${key} --pack again so its lines are numbered (the extractor subagent can do this as its first step)`);
    }
    console.log(`  1. Build the contract from the evidence pack — delegate to the heldout-contract-extractor subagent, or follow ${rel(path.join(SKILL_DIR, 'references', 'requirement-contract.md'))}`);
    console.log(`  2. heldout contract ${key} --allow-unreviewed   (the builder's check: anchoring, coverage, grounded literals)`);
    console.log(`  3. Independent review — the heldout-contract-reviewer subagent writes ${rel(p.review)}; then: heldout contract ${key}   (clean, including the review)`);
    return;
  }

  const c = readContract(p.contract);
  if (!c) throw new Error(`No ${rel(file)} — run: heldout contract ${key} --pack`);

  if (flags.questions) {
    console.log(JSON.stringify(openQuestions(c).map((g) => ({ id: g.id, required: g.required, affects: g.affects, question: g.element, tried: g.tried })), null, 2));
    return;
  }
  // --resolve G<n>: a mechanics gap found in the application (no re-review). --answer G<n>: the owner's answer to an
  // oracle gap (changes the oracle, so the contract goes back to the reviewer).
  // --resolve-from <file>: several mechanics gaps in one call, [{ "id": "G1", "value": "…", "evidence": "…" }, …].
  const resolveFile = flagStr(flags, 'resolve-from');
  if (resolveFile) {
    const list = JSON.parse(fs.readFileSync(resolveFile, 'utf8')) as { id: string; value: string; evidence: string }[];
    if (!Array.isArray(list) || !list.length) throw new Error(`${resolveFile} holds no gaps: [{ "id": "G1", "value": "…", "evidence": "…" }]`);
    for (const r of list) {
      const g = c.gaps.find((x) => x.id === r.id);
      if (!g) throw new Error(`No gap ${r.id} in ${rel(file)} — gaps: ${c.gaps.map((x) => x.id).join(', ') || 'none'}`);
      if (g.kind !== 'mechanics') throw new Error(`${g.id} is an oracle gap (WHAT is correct): it is never read off the application. Nothing was written.`);
      if (!r.value || !r.evidence) throw new Error(`${r.id} needs a "value" (what was found) and an "evidence" (the probe that shows it, Pn, or the proven journey and the run that used it). Nothing was written.`);
    }
    for (const r of list) citeProbes(cfg, key, r.evidence);
    for (const r of list) {
      const g = c.gaps.find((x) => x.id === r.id)!;
      Object.assign(g, { resolution: 'discovered-in-aut', value: r.value, evidence: r.evidence });
      g.tried = [...g.tried.filter((t) => t.where !== 'aut'), { where: 'aut', result: r.value }];
      console.log(`✔ ${g.id} → discovered-in-aut: ${r.value}`);
    }
    writeFile(file, `${JSON.stringify(c, null, 2)}\n`);
    console.log('');
  }
  const gapFlag = flagStr(flags, 'resolve') ? 'resolve' : flagStr(flags, 'answer') ? 'answer' : undefined;
  if (gapFlag) {
    const g = c.gaps.find((x) => x.id === flagStr(flags, gapFlag));
    if (!g) throw new Error(`No gap ${flagStr(flags, gapFlag)} in ${rel(file)} — gaps: ${c.gaps.map((x) => x.id).join(', ') || 'none'}`);
    const value = flagStr(flags, 'value');
    if (!value) throw new Error(`--${gapFlag} ${g.id} needs --value "<what was found / answered>"`);
    if (gapFlag === 'resolve') {
      if (g.kind !== 'mechanics') throw new Error(`${g.id} is an oracle gap (WHAT is correct): it is never read off the application. Leave it open: the verdict puts it to the story's owner, whose answer is recorded with: heldout contract ${key} --answer ${g.id} --value "…" --by "<who>"`);
      const evidence = flagStr(flags, 'evidence');
      if (!evidence) throw new Error(`--resolve ${g.id} needs --evidence "<the probe that shows it (Pn), or the run>"`);
      citeProbes(cfg, key, evidence);
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
  const findings = checkContract(c, p.requirement, { hasApiBase: Boolean(cfg.aut.apiBaseURL ?? cfg.aut.baseURL), apiBaseURL: cfg.aut.apiBaseURL ?? cfg.aut.baseURL });
  if (flags['review-prompt']) {
    // A review certifies a finished contract: an empty or ungrounded one goes back to the builder first.
    const blocking = findings.filter((f) => f.level === 'error');
    if (blocking.length) {
      console.log(`The contract for ${key} is not ready for review — ${blocking.length} error(s) from the mechanical checks:`);
      for (const f of blocking) console.log(`  ✖ [${f.code}] ${f.message}`);
      console.log(`\nDo not write a review. Reply that the contract must first pass: heldout contract ${key} --allow-unreviewed`);
      process.exit(1);
    }
    const tpl = fs.readFileSync(path.join(SKILL_DIR, 'references', 'contract-review-prompt.md'), 'utf8');
    // A re-review: name what changed since the last matching review. Every item is still checked and given a verdict.
    const earlier = readReview(p.review);
    const changed = earlier && earlier.contractHash !== contractHash(c) ? changedSinceReview(c, earlier) : undefined;
    const changedNote = changed?.length
      ? `\nThis is a re-review. Changed since the last review (${earlier?.reviewedAt}): ${changed.map((r) => `\`${r}\``).join(', ')}. Check these in full against the pack, and read the pack once more for anything the change now misses; every other item is unchanged since that review, so its verdict there carries over.\n`
      : '';
    console.log(tpl.replaceAll('{{CHANGED}}', changedNote).replaceAll('{{KEY}}', key).replaceAll('{{EVAL_DIR}}', rel(p.base)).replaceAll('{{PACK}}', rel(packFile))
      .replaceAll('{{CONTRACT}}', rel(file)).replaceAll('{{REVIEW}}', rel(p.review))
      .replaceAll('{{HASH}}', contractHash(c)).replaceAll('{{REFS}}', reviewRefs(c).map((r) => `\`${r}\``).join(', ')));
    return;
  }

  // --review-bind: the reviewer's last step. The review is bound to the contract as it is now, and stamped with the
  // time: the reviewer never writes a hash or a time itself.
  if (flags['review-bind']) {
    const written = readReview(p.review);
    if (!written) throw new Error(`No review at ${rel(p.review)} to bind — the heldout-contract-reviewer subagent writes it first`);
    const bound = { ...written, contractHash: contractHash(c), reviewedAt: new Date().toISOString(), itemHashes: reviewItemHashes(c) };
    writeFile(p.review, `${JSON.stringify(bound, null, 2)}\n`);
    const findings = bound.items.filter((i) => i.verdict !== 'supported');
    recordEvent(p.history, 'review-bound', {
      hash: bound.contractHash, round: readHistory(p.history).filter((e) => e.event === 'review-bound').length + 1, items: bound.items.length,
      findings: findings.map((i) => `${i.ref}:${i.verdict}`), missed: bound.missed.length,
    });
    console.log(`✔ review bound to the contract (hash ${bound.contractHash}, ${bound.items.length} item(s), ${findings.length} finding(s), ${bound.missed.length} missed line(s))`);
  }
  const review = readReview(p.review);
  // A review that matches the contract gets a hash per item, so a later change names the items to re-check.
  if (review && review.contractHash === contractHash(c) && !review.itemHashes) {
    review.itemHashes = reviewItemHashes(c);
    writeFile(p.review, `${JSON.stringify(review, null, 2)}\n`);
  }
  const reviewFindings = checkReview(c, review, { requireReview: !flags['allow-unreviewed'] });
  const listed = new Set(['oracle-gap-open', 'mechanics-to-discover']); // shown as the two lists below
  const all = [...findings, ...reviewFindings];
  const count = <T>(xs: T[], by: (x: T) => string) => xs.reduce<Record<string, number>>((n, x) => ({ ...n, [by(x)]: (n[by(x)] ?? 0) + 1 }), {});
  // One line per change of outcome: a check run again on the same contract with the same result adds nothing.
  recordChange(p.history, 'contract-checked', {
    hash: contractHash(c), errors: all.filter((f) => f.level === 'error').map((f) => f.code), warnings: all.filter((f) => f.level !== 'error').length,
    acceptanceCriteria: c.acceptanceCriteria.length, gaps: count(c.gaps, (g) => `${g.kind}:${g.resolution}`),
    reviewed: Boolean(review && review.contractHash === contractHash(c)),
  });
  console.log(`Requirement contract ${key}: ${c.acceptanceCriteria.length} AC(s), ${c.endpoints.length} endpoint(s), ${c.rules.length} rule(s), ${c.errorModel.length} error case(s), ${c.gaps.length} gap(s), ${c.coverage.length} coverage entr(ies) · hash ${contractHash(c)}`);
  for (const f of all.filter((x) => !listed.has(x.code))) console.log(`  ${f.level === 'error' ? '✖' : '⚠'} [${f.code}] ${f.message}`);
  if (!all.some((f) => f.level === 'error')) console.log(`  ✔ anchored (${c.acceptanceCriteria.length} quote(s) found at their cited lines), fully covered (every numbered line, in ${c.coverage.length} coverage entr${c.coverage.length === 1 ? 'y' : 'ies'}), grounded (every expected status, number, message and path found in the sources)${review && review.contractHash === contractHash(c) ? ' and independently reviewed' : '; the independent review is next (heldout-contract-reviewer subagent)'}`);
  const questions = openQuestions(c);
  const discover = toDiscover(c);
  // After recording one gap, the lists would repeat themselves: say what is left in a line.
  if (gapFlag && !all.some((f) => f.level === 'error')) {
    console.log(`  still to discover: ${discover.map((g) => g.id).join(', ') || 'nothing'} · open questions: ${questions.map((g) => g.id).join(', ') || 'none'}   (heldout contract ${key} lists them)`);
    writeFile(p.work.contractMd, renderContract(c, review, Boolean(review) && !reviewFindings.some((f) => f.level === 'error')));
    return;
  }
  if (questions.length) {
    console.log(`\nOpen questions about the requirement (${questions.length}) — nobody is asked now: the affected criteria are @needs-clarification or carry // OPEN-QUESTION:, and the verdict puts each question to the story's owner:`);
    for (const g of questions) console.log(`  ${g.id}${g.required ? ' [required]' : ''} ${g.element} → affects ${g.affects.join(', ') || 'no criterion'}`);
  }
  if (discover.length) {
    console.log(`\nTo discover from the application during hardening (${discover.length}) — record each as discovered-in-aut with evidence:`);
    for (const g of discover) console.log(`  ${g.id} ${g.element} → affects ${g.affects.join(', ') || 'no criterion'}`);
  }
  if (!review && !findings.some((f) => f.level === 'error')) console.log(`\nNext: independent review — heldout-contract-reviewer subagent (instructions: heldout contract ${key} --review-prompt)`);
  writeFile(p.work.contractMd, renderContract(c, review, Boolean(review) && !reviewFindings.some((f) => f.level === 'error')));
  console.log(`  → ${rel(p.work.contractMd)} (the contract for people to read; rendered again by every check)`);
  if (all.some((f) => f.level === 'error')) process.exit(1);
}
