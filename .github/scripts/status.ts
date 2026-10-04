/**
 * Where is each story in the pipeline, and what is the next command?
 *
 *   heldout status          every story under output/<profile>/ (one line each)
 *   heldout status KEY      one story, phase by phase
 */
import fs from 'node:fs';
import path from 'node:path';
import { NON_EVAL_RUN, ROOT, evalPaths, listRuns, listStories, loadConfig, main, parseArgs, readJson, type HeldoutConfig } from './config';
import { checkContract, readContract } from './contract-model';
import { checkReview, readReview } from './evidence';

interface Phase { name: string; done: boolean; detail: string; next?: string }
const H = 'npm run heldout --';

function phasesOf(cfg: HeldoutConfig, key: string): Phase[] {
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
  const harvested = fs.existsSync(harvestFile) ? readJson<{ finalRun: string; proven: number }>(harvestFile) : undefined;
  // Stale when a later evaluation run exists than the one the verdict judged (by run name: file times change with a
  // clone or a copy, the recorded final run does not).
  const verdictStale = Boolean(verdict && lastEval && verdict.finalRun && verdict.finalRun < lastEval);
  const published = fs.existsSync(path.join(p.base, 'publish-log.json')) ? readJson<{ at: string; verdict: string }[]>(path.join(p.base, 'publish-log.json')).at(-1) : undefined;
  const integrity = fs.existsSync(p.integrity) ? readJson<{ status: string }>(p.integrity).status : undefined;
  const todo = (src.match(/TODO\(harden\)/g) ?? []).length;
  const bound = fs.existsSync(p.base) ? cfg.autId : undefined;

  return [
    { name: 'fetch', done: fs.existsSync(p.storyMd), detail: fs.existsSync(p.storyMd) ? `story + ${fs.existsSync(p.linked) ? fs.readdirSync(p.linked).length : 0} linked file(s)${bound ? ` · AUT ${bound}` : ''}` : 'not fetched', next: `${H} fetch ${key}` },
    { name: 'contract', done: Boolean(contract) && contractErrors === 0, detail: !contract ? 'missing' : contractErrors ? `${contractErrors} error(s) (incl. review)` : `${contract.acceptanceCriteria.length} AC · ${contract.gaps.length} gap(s) · reviewed`, next: contract ? `${H} contract ${key}   (extractor / reviewer subagents until clean)` : `${H} contract ${key} --pack` },
    { name: 'tests', done: specs.length > 0 && !/TODO\(test\)/.test(src), detail: specs.length ? `${specs.length} spec file(s) · ${new Set([...src.matchAll(/\btest(?:\.\w+)?\(\s*[`'"](SCN-\d+)/g)].map((m) => m[1])).size} scenario id(s)${/TODO\(test\)/.test(src) ? ' · scaffold stubs left' : ''}` : 'missing', next: `heldout-test-author subagent (from the contract, with the journey fixtures: tests/*.spec.ts, lint clean with --allow-unhardened)` },
    { name: 'freeze', done: fs.existsSync(p.draft) && fs.readdirSync(p.draft).some((f) => f.endsWith('.spec.ts')), detail: fs.existsSync(p.draft) ? 'draft frozen' : 'not frozen', next: `${H} integrity ${key} --snapshot` },
    { name: 'harden', done: todo === 0 && fs.existsSync(p.hardeningLog) && integrity !== 'VIOLATED', detail: `${todo} TODO(harden)${integrity ? ` · integrity ${integrity}` : ''}${fs.existsSync(p.hardeningLog) ? '' : ' · no hardening log'}`, next: `heldout-hardener subagent (hardens against the AUT), then ${H} integrity ${key}` },
    { name: 'run', done: Boolean(lastEval), detail: lastEval ? `${lastEval}${meta?.stats ? `: ${meta.stats.expected} passed, ${meta.stats.unexpected} failed, ${meta.stats.flaky} flaky` : ''}` : 'no evaluation run', next: `${H} run ${key}` },
    { name: 'triage', done: Boolean(lastEval) && (failures === 0 || (Boolean(triage) && pending === 0)), detail: !lastEval ? '-' : failures === 0 ? 'nothing to triage' : !triage ? 'not triaged' : `${pending} pending confirmation`, next: `heldout-triager subagent (${triage ? 'reproduces each pending failure live and records it' : `runs ${H} triage ${key}, then reproduces each failure live`})` },
    { name: 'verdict', done: Boolean(verdict) && !verdictStale, detail: verdict ? `${verdict.verdict}${verdictStale ? ' (older than the last run)' : ''}` : 'none', next: `${H} verdict ${key}` },
    { name: 'publish', done: Boolean(published) && (!verdict || published!.verdict === verdict.verdict) && !verdictStale, detail: published ? `${published.verdict} at ${published.at.slice(0, 16)}` : 'not published', next: `${H} publish ${key}` },
    { name: 'journeys', done: Boolean(harvested) && harvested!.finalRun === verdict?.finalRun, detail: harvested ? `${harvested.proven} fixture(s) recorded in the UI / API maps${harvested.finalRun === verdict?.finalRun ? '' : ` (from ${harvested.finalRun}, an older run)`}` : 'map not harvested', next: `${H} journeys ${key} --harvest --apply` },
  ];
}

main(() => {
  const { _ } = parseArgs();
  const stories = listStories(loadConfig()).sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
  const keys = _[0] ? [{ key: _[0], profile: undefined as string | undefined }] : stories;
  if (!keys.length) {
    const cfg = loadConfig();
    const mockIssues = path.join(ROOT, cfg.jira.mockRoot ?? 'mock-jira', 'issues');
    const waiting = cfg.jira.mode === 'mock' && fs.existsSync(mockIssues) ? fs.readdirSync(mockIssues).filter((k) => /^[A-Z][A-Z0-9_]+-\d+$/.test(k)) : [];
    if (waiting.length) console.log(`No stories in ${cfg.outputDir}/ yet. In the mock Jira, not fetched: ${waiting.join(', ')}. Start with: ${H} fetch ${waiting[0]}`);
    else console.log(`No stories in ${cfg.outputDir}/ yet. Start with: ${H} fetch ABC-123   (or ${H} new ABC-1 --from story.md for the mock Jira)`);
    return;
  }
  if (_[0]) {
    const cfg = loadConfig({ key: _[0] });
    const phases = phasesOf(cfg, _[0]);
    console.log(`${_[0]} (${cfg.outputDir}/${cfg.autId}/${_[0]})`);
    for (const ph of phases) console.log(`  ${ph.done ? '✔' : '·'} ${ph.name.padEnd(9)} ${ph.detail}`);
    const next = phases.find((ph) => !ph.done);
    console.log(next ? `\nNext: ${next.next}` : '\n✔ Complete.');
    return;
  }
  console.log(`${'Story'.padEnd(12)} ${'Profile'.padEnd(24)} ${'Phase'.padEnd(10)} ${'Verdict'.padEnd(20)} Next`);
  for (const { key, profile } of keys) {
    const cfg = loadConfig({ key, aut: profile });
    const phases = phasesOf(cfg, key);
    const next = phases.find((ph) => !ph.done);
    const v = phases.find((ph) => ph.name === 'verdict')!;
    console.log(`${key.padEnd(12)} ${String(profile).slice(0, 24).padEnd(24)} ${(next?.name ?? 'done').padEnd(10)} ${(v.done ? v.detail : '-').slice(0, 20).padEnd(20)} ${next?.next ?? ''}`);
  }
});
