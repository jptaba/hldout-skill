/**
 * The brief of the subagent a story waits for: its role and task, the slice of the story and of what is known of the
 * application its work touches, and where the rules of its step are. Printed by the tool, so an agent reads what its
 * step needs and nothing else; `advance` names it with each stop.
 *
 *   heldout brief KEY
 */
import fs from 'node:fs';
import type { Args, CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel } from '../core/files';
import { evalPaths, evalRunsOf, knowledgeIds, runFile } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';
import { checksOf } from '../contract/checks';
import { checkContract, readContract, toDiscover } from '../contract/contract-model';
import { checkReview, readReview } from '../contract/evidence';
import { HEADER, entryLine, knowledgeIndex, readKnowledge, type Entry } from '../probe/knowledge';
import { pendingOf, readRunRecord } from '../run/run-record';
import { failureGroups } from '../triage/triage-report';
import { phasesOf } from './phases';

const H = 'npm run heldout --';
/** Above this many entries the brief lists the store's domains instead of printing it. */
const AT_ONCE = 40;

/** What is known of the application, as much as a brief carries: entries of the kinds given, or the domains. */
export function knowledgeSlice(cfg: Pick<HeldoutConfig, 'autId'>, kinds?: Entry['kind'][]): string[] {
  const all = readKnowledge(cfg).filter((e) => !kinds || kinds.includes(e.kind));
  if (!all.length) return ['Nothing is known of the application yet: what you learn of it goes in with `map --add`.'];
  if (all.length <= AT_ONCE) return [HEADER, ...all.map((e) => `  [${e.domain}] ${entryLine(e)}`)];
  return [HEADER, `  ${knowledgeIndex(cfg).map((d) => `${d.domain} (${d.entries})`).join(', ')}`, `  Read a domain you work on: ${H} map KEY --domain <domain>`];
}

/** The brief of the story's next stop, as lines. */
export function briefOf(cfg: HeldoutConfig, key: string): string[] {
  const p = evalPaths(cfg, key);
  const next = phasesOf(cfg, key).find((ph) => !ph.done);
  if (!next) return [`${key} is complete: no subagent waits.`];
  const contract = readContract(p.contract);
  const out: string[] = [];
  const known = (kinds?: Entry['kind'][]) => { out.push('', '## What is known of the application', ...knowledgeSlice(cfg, kinds)); };
  const rule = 'The story says what is correct. You may use the live application to understand what the story talks about or how it is operated; where the two differ, the story wins, and the difference is a discrepancy for the verdict (`note KEY --discrepancy`), never a value.';

  if (next.name === 'contract' || next.name === 'fetch') {
    // As advance decides: a contract that is built, checked and has its checks waits for its review.
    const built = contract && fs.existsSync(p.requirement) && contract.acceptanceCriteria.length && checksOf(contract).length
      && !checkContract(contract, p.requirement, { apiBaseURL: cfg.aut.apiBaseURL ?? cfg.aut.baseURL, knowledgeIds: knowledgeIds(cfg) }).some((f) => f.level === 'error');
    const reviewing = Boolean(built) && checkReview(contract!, readReview(p.review), { requireReview: true }).some((f) => f.code === 'not-reviewed' || f.code === 'review-stale');
    out.push(`# Brief: ${reviewing ? 'heldout-contract-reviewer' : 'heldout-contract-extractor'} for ${key}`, '', rule, '');
    if (reviewing) out.push('Your instructions, the items to review and the contract\'s hash:', `  ${H} contract ${key} --review-prompt`);
    else out.push(`Source: the evidence pack, ${rel(p.work.evidencePack)}`, `Contract: ${rel(p.contract)} (${contract ? `${contract.acceptanceCriteria.length} criteria, ${checksOf(contract).length} checks` : 'not built yet'})`, `Check it: ${H} contract ${key} --allow-unreviewed`, 'Procedure and shape: references/requirement-contract.md');
    known(['about']);
    return out;
  }

  out.push(`# Brief: heldout-operator for ${key} — ${next.name === 'triage' ? 'triage' : next.name === 'verdict' ? 'repair' : 'make the tests run'}`, '', rule, '');
  if (next.name === 'triage' || next.name === 'verdict') {
    const run = evalRunsOf(p.runs).at(-1);
    const record = run && fs.existsSync(runFile(p, run)) ? readRunRecord(runFile(p, run)) : undefined;
    const pending = record ? pendingOf(record) : [];
    out.push(`Run: ${run ?? '-'}; ${pending.length} failure(s) undecided, in ${record ? failureGroups({ entries: pending }).length : 0} group(s): ${H} show ${key} triage ${run} --group <n>`,
      `Decide each: ${H} triage ${key} --set SCN-n --category … --rationale … --evidence Pn`, 'Categories, the decision tree, the commands: references/triage.md');
  } else {
    out.push(`Tests: ${rel(p.hardened)}/ (every step marked TODO(harden) is yours); one test: ${H} show ${key} spec --test SCN-n`, `Journeys this story concerns: ${H} journeys ${key}`, 'Procedure, tiers and tools: references/hardening.md; probes: references/probes.md');
    const checks = contract ? checksOf(contract) : [];
    if (checks.length) {
      out.push('', '## The checks to make run (what each expects is in the contract, never in a test)');
      for (const { ac, check } of checks) out.push(`- ${check.id} (${ac}, ${check.layer}): ${check.title}${check.rows?.length ? ` — ${check.rows.length} rows` : ''}`, ...check.expect.map((e) => `    ${e.id}: read ${e.what}`));
    }
    const gaps = contract ? toDiscover(contract) : [];
    if (gaps.length) out.push('', '## Mechanics to discover (record each: contract KEY --resolve G<n> --value … --evidence Pn)', ...gaps.map((g) => `- ${g.id}: ${g.element}`));
  }
  known();
  return out;
}

export const spec: CommandSpec = {
  name: 'brief', group: 'Setup', usage: 'KEY',
  about: 'the brief of the subagent the story waits for: its task, the slice of the story and of what is known it needs',
  flags: [],
};

export function run({ _ }: Args): void {
  const key = assertIssueKey(_[0]);
  console.log(briefOf(loadConfig({ key }), key).join('\n'));
}
