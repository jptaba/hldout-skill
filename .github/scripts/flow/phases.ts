/**
 * Where a story is in the pipeline: each phase, the folder it fills, whether it is done, and what comes next. Read from
 * the story's folder alone (its files, and its history for what no file shows), so `heldout status` and
 * `heldout advance` agree and a session can pick a story up anywhere.
 */
import fs from 'node:fs';
import path from 'node:path';
import { draftFinished } from '../authoring/draft';
import { readFreeze } from '../hardening/integrity-check';
import { journeysUsedBy } from '../authoring/journeys/registry';
import { readJson, rel } from '../core/files';
import { lastEvent, readHistory } from '../core/history';
import { PHASE_FOLDERS, evalPaths, evalRunsOf, runFile } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';
import { checkContract, readContract } from '../contract/contract-model';
import { checkReview, readReview } from '../contract/evidence';
import { pendingOf, readRunRecord } from '../run/run-record';

export interface Phase { name: string; folder: string; done: boolean; detail: string; next?: string }
const H = 'npm run heldout --';
const [REQUIREMENT, CONTRACT, TESTS, HARDENING, RUN, TRIAGE, VERDICT] = PHASE_FOLDERS;
const specsIn = (dir: string) => (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.spec.ts')) : []);

export function phasesOf(cfg: HeldoutConfig, key: string): Phase[] {
  const p = evalPaths(cfg, key);
  const specs = specsIn(p.tests);
  const src = specs.map((f) => fs.readFileSync(path.join(p.tests, f), 'utf8')).join('\n');
  // The hardener's copy of the draft, made at the freeze.
  const hardenedSpecs = specsIn(p.hardened).map((f) => path.join(p.hardened, f));
  const hardenedSrc = hardenedSpecs.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const contract = readContract(p.contract);
  // cfg is resolved for the story's own profile folder (its API origin grounds the paths its sources state under it).
  const profile = cfg.aut;
  const contractErrors = contract && fs.existsSync(p.requirement) ? [...checkContract(contract, p.requirement, { apiBaseURL: profile.apiBaseURL ?? profile.baseURL }), ...checkReview(contract, readReview(p.review), { requireReview: true })].filter((f) => f.level === 'error').length : 0;
  const evalRuns = evalRunsOf(p.runs);
  const lastEval = evalRuns.at(-1);
  const record = lastEval ? readRunRecord(runFile(p, lastEval)) : undefined;
  const meta = record?.meta;
  // Triaged: the triage command went over the run (it carries earlier decisions and writes the replay chains).
  const triage = Boolean(lastEval) && readHistory(p.history).some((e) => e.event === 'triaged' && e.run === lastEval);
  const failures = meta?.stats ? meta.stats.unexpected + meta.stats.flaky : 0;
  const pending = record ? pendingOf(record).length : failures;
  const verdict = fs.existsSync(p.verdictJson) ? readJson<{ verdict: string; finalRun?: string; run?: string; generatedAt?: string }>(p.verdictJson) : undefined;
  const harvested = lastEvent<{ finalRun: string; proven: string[] }>(p.history, 'harvested');
  // Stale when a later evaluation run exists than the one the verdict judged (by run name: file times change with a
  // clone or a copy, the recorded final run does not).
  const verdictStale = Boolean(verdict && lastEval && verdict.finalRun && verdict.finalRun < lastEval);
  const published = lastEvent<{ verdict: string }>(p.history, 'published');
  const integrity = lastEvent<{ status: string }>(p.history, 'integrity')?.status;
  // Guessed mechanics left in the hardened copy or in the journeys it imports.
  const journeySrc = journeysUsedBy(cfg, cfg.autId, hardenedSpecs).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const todo = ([hardenedSrc, journeySrc].join('\n').match(/TODO\(harden\)/g) ?? []).length;
  // The freeze writes the log's template: it counts once the hardener has filled in the tiers it used.
  const hardened = fs.existsSync(p.hardeningLog) && /^\*\*Tiers? used:\*\*[ \t]*\S/m.test(fs.readFileSync(p.hardeningLog, 'utf8'));
  const bound = fs.existsSync(p.base) ? cfg.autId : undefined;
  const frozen = Boolean(readFreeze(p.freeze));
  const finished = draftFinished(p);

  return [
    { name: 'fetch', folder: REQUIREMENT, done: fs.existsSync(p.storyMd), detail: fs.existsSync(p.storyMd) ? `story + ${fs.existsSync(p.linked) ? fs.readdirSync(p.linked).length : 0} linked file(s)${bound ? ` · AUT ${bound}` : ''}` : 'not fetched', next: `${H} fetch ${key}` },
    { name: 'contract', folder: CONTRACT, done: Boolean(contract) && contractErrors === 0, detail: !contract ? 'missing' : contractErrors ? `${contractErrors} error(s) (incl. review)` : `${contract.acceptanceCriteria.length} AC · ${contract.gaps.length} gap(s) · reviewed`, next: contract ? `${H} contract ${key}   (extractor / reviewer subagents until clean)` : `${H} contract ${key} --pack` },
    // Once the draft is frozen, the author's "finished" mark has done its job (hardening may change the spec's HOW).
    { name: 'tests', folder: TESTS, done: specs.length > 0 && !/TODO\(test\)/.test(src) && (frozen || finished), detail: specs.length ? `${specs.length} spec file(s) · ${new Set([...src.matchAll(/\btest(?:\.\w+)?\(\s*[`'"](SCN-\d+)/g)].map((m) => m[1])).size} scenario id(s)${/TODO\(test\)/.test(src) ? ' · scaffold stubs left' : ''}${!frozen && !finished ? ' · not marked finished by its author' : ''}` : 'missing', next: `heldout-test-author subagent (from the contract, with the journeys: ${rel(p.tests)}/*.spec.ts; its last step marks the draft finished: ${H} lint ${key} --allow-unhardened --no-health --draft-finished)` },
    { name: 'freeze', folder: TESTS, done: frozen, detail: frozen ? 'draft frozen' : 'not frozen', next: `${H} integrity ${key} --snapshot` },
    { name: 'harden', folder: HARDENING, done: hardenedSpecs.length > 0 && todo === 0 && hardened && integrity !== 'VIOLATED', detail: `${todo} TODO(harden)${integrity ? ` · integrity ${integrity}` : ''}${hardened ? '' : ' · hardening log not filled in ("Tiers used")'}`, next: `heldout-hardener subagent (hardens against the AUT), then ${H} integrity ${key}` },
    { name: 'run', folder: RUN, done: Boolean(lastEval), detail: lastEval ? `${lastEval}${meta?.stats ? `: ${meta.stats.expected} passed, ${meta.stats.unexpected} failed, ${meta.stats.flaky} flaky` : ''}` : 'no evaluation run', next: `${H} run ${key}` },
    { name: 'triage', folder: TRIAGE, done: Boolean(lastEval) && (failures === 0 || (Boolean(triage) && pending === 0)), detail: !lastEval ? '-' : failures === 0 ? 'nothing to triage' : !triage ? 'not triaged' : `${pending} pending confirmation`, next: `heldout-triager subagent (${triage ? 'reproduces each pending failure live and records it' : `runs ${H} triage ${key}, then reproduces each failure live`})` },
    { name: 'verdict', folder: VERDICT, done: Boolean(verdict) && !verdictStale, detail: verdict ? `${verdict.verdict}${verdictStale ? ' (older than the last run)' : ''}` : 'none', next: `${H} verdict ${key}` },
    { name: 'publish', folder: VERDICT, done: Boolean(published) && (!verdict || published!.verdict === verdict.verdict) && !verdictStale, detail: published ? `${published.verdict} at ${published.at.slice(0, 16)}` : 'not published', next: `${H} publish ${key}` },
    { name: 'journeys', folder: VERDICT, done: Boolean(harvested) && harvested!.finalRun === verdict?.finalRun, detail: harvested ? `${harvested.proven.length} journey(s) recorded in the registry${harvested.finalRun === verdict?.finalRun ? '' : ` (from ${harvested.finalRun}, an older run)`}` : 'not harvested', next: `${H} journeys ${key} --harvest --apply` },
  ];
}
