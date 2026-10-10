/**
 * Where a story is in the pipeline: each phase, whether it is done, and what comes next. Read from the files of the
 * story's folder alone, so `heldout status` and `heldout advance` agree and a session can pick a story up anywhere.
 */
import fs from 'node:fs';
import path from 'node:path';
import { NON_EVAL_RUN, evalPaths, listRuns, readJson, type HeldoutConfig } from './config';
import { checkContract, readContract } from './contract-model';
import { checkReview, readReview } from './evidence';
import { journeysUsedBy } from './journeys-store';

export interface Phase { name: string; done: boolean; detail: string; next?: string }
const H = 'npm run heldout --';

export function phasesOf(cfg: HeldoutConfig, key: string): Phase[] {
  const p = evalPaths(cfg, key);
  const specs = fs.existsSync(p.tests) ? fs.readdirSync(p.tests, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.spec.ts')) : [];
  const src = specs.map((f) => fs.readFileSync(path.join(p.tests, f), 'utf8')).join('\n');
  const contract = readContract(p.base);
  // cfg is resolved for the story's own profile folder (its API origin grounds the paths its sources state under it).
  const profile = cfg.aut;
  const contractErrors = contract && fs.existsSync(p.requirement) ? [...checkContract(contract, p.requirement, { apiBaseURL: profile.apiBaseURL ?? profile.baseURL }), ...checkReview(contract, readReview(p.base), { requireReview: true })].filter((f) => f.level === 'error').length : 0;
  const runs = listRuns(p.runs);
  const evalRuns = runs.filter((r) => !NON_EVAL_RUN.test(r));
  const lastEval = evalRuns.at(-1);
  const meta = lastEval && fs.existsSync(path.join(p.runs, lastEval, 'run-meta.json')) ? readJson<{ stats?: { expected: number; unexpected: number; flaky: number } }>(path.join(p.runs, lastEval, 'run-meta.json')) : undefined;
  const triageFile = lastEval ? path.join(p.runs, lastEval, 'triage.json') : '';
  const triage = triageFile && fs.existsSync(triageFile) ? readJson<{ entries: { status: string; final?: unknown }[] }>(triageFile) : undefined;
  const failures = meta?.stats ? meta.stats.unexpected + meta.stats.flaky : 0;
  const pending = triage ? triage.entries.filter((e) => e.status !== 'passed' && !e.final).length : failures;
  const verdict = fs.existsSync(p.verdictJson) ? readJson<{ verdict: string; finalRun?: string; run?: string; generatedAt?: string }>(p.verdictJson) : undefined;
  const harvestFile = path.join(p.hardening, 'journeys-harvest.json');
  const harvested = fs.existsSync(harvestFile) ? readJson<{ finalRun: string; proven: string[] }>(harvestFile) : undefined;
  // Stale when a later evaluation run exists than the one the verdict judged (by run name: file times change with a
  // clone or a copy, the recorded final run does not).
  const verdictStale = Boolean(verdict && lastEval && verdict.finalRun && verdict.finalRun < lastEval);
  const published = fs.existsSync(path.join(p.base, 'publish-log.json')) ? readJson<{ at: string; verdict: string }[]>(path.join(p.base, 'publish-log.json')).at(-1) : undefined;
  const integrity = fs.existsSync(p.integrity) ? readJson<{ status: string }>(p.integrity).status : undefined;
  // Guessed mechanics left in the spec or in the journeys it imports.
  const journeySrc = fs.existsSync(p.tests) ? journeysUsedBy(cfg, cfg.autId, specs.map((f) => path.join(p.tests, f))).map((f) => fs.readFileSync(f, 'utf8')).join('\n') : '';
  const todo = ([src, journeySrc].join('\n').match(/TODO\(harden\)/g) ?? []).length;
  // The scaffold writes the log's template: it counts once the hardener has filled in the tiers it used.
  const hardened = fs.existsSync(p.hardeningLog) && /^\*\*Tiers? used:\*\*[ \t]*\S/m.test(fs.readFileSync(p.hardeningLog, 'utf8'));
  const bound = fs.existsSync(p.base) ? cfg.autId : undefined;

  return [
    { name: 'fetch', done: fs.existsSync(p.storyMd), detail: fs.existsSync(p.storyMd) ? `story + ${fs.existsSync(p.linked) ? fs.readdirSync(p.linked).length : 0} linked file(s)${bound ? ` · AUT ${bound}` : ''}` : 'not fetched', next: `${H} fetch ${key}` },
    { name: 'contract', done: Boolean(contract) && contractErrors === 0, detail: !contract ? 'missing' : contractErrors ? `${contractErrors} error(s) (incl. review)` : `${contract.acceptanceCriteria.length} AC · ${contract.gaps.length} gap(s) · reviewed`, next: contract ? `${H} contract ${key}   (extractor / reviewer subagents until clean)` : `${H} contract ${key} --pack` },
    { name: 'tests', done: specs.length > 0 && !/TODO\(test\)/.test(src), detail: specs.length ? `${specs.length} spec file(s) · ${new Set([...src.matchAll(/\btest(?:\.\w+)?\(\s*[`'"](SCN-\d+)/g)].map((m) => m[1])).size} scenario id(s)${/TODO\(test\)/.test(src) ? ' · scaffold stubs left' : ''}` : 'missing', next: `heldout-test-author subagent (from the contract, with the journeys: tests/*.spec.ts, lint clean with --allow-unhardened)` },
    { name: 'freeze', done: fs.existsSync(p.draft) && fs.readdirSync(p.draft).some((f) => f.endsWith('.spec.ts')), detail: fs.existsSync(p.draft) ? 'draft frozen' : 'not frozen', next: `${H} integrity ${key} --snapshot` },
    { name: 'harden', done: todo === 0 && hardened && integrity !== 'VIOLATED', detail: `${todo} TODO(harden)${integrity ? ` · integrity ${integrity}` : ''}${hardened ? '' : ' · hardening log not filled in ("Tiers used")'}`, next: `heldout-hardener subagent (hardens against the AUT), then ${H} integrity ${key}` },
    { name: 'run', done: Boolean(lastEval), detail: lastEval ? `${lastEval}${meta?.stats ? `: ${meta.stats.expected} passed, ${meta.stats.unexpected} failed, ${meta.stats.flaky} flaky` : ''}` : 'no evaluation run', next: `${H} run ${key}` },
    { name: 'triage', done: Boolean(lastEval) && (failures === 0 || (Boolean(triage) && pending === 0)), detail: !lastEval ? '-' : failures === 0 ? 'nothing to triage' : !triage ? 'not triaged' : `${pending} pending confirmation`, next: `heldout-triager subagent (${triage ? 'reproduces each pending failure live and records it' : `runs ${H} triage ${key}, then reproduces each failure live`})` },
    { name: 'verdict', done: Boolean(verdict) && !verdictStale, detail: verdict ? `${verdict.verdict}${verdictStale ? ' (older than the last run)' : ''}` : 'none', next: `${H} verdict ${key}` },
    { name: 'publish', done: Boolean(published) && (!verdict || published!.verdict === verdict.verdict) && !verdictStale, detail: published ? `${published.verdict} at ${published.at.slice(0, 16)}` : 'not published', next: `${H} publish ${key}` },
    { name: 'journeys', done: Boolean(harvested) && harvested!.finalRun === verdict?.finalRun, detail: harvested ? `${harvested.proven.length} journey(s) recorded in the registry${harvested.finalRun === verdict?.finalRun ? '' : ` (from ${harvested.finalRun}, an older run)`}` : 'not harvested', next: `${H} journeys ${key} --harvest --apply` },
  ];
}
