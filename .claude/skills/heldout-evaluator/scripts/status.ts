/**
 * Where is each story in the pipeline, and what is the next command?
 *
 *   heldout status          all evaluations (one line each)
 *   heldout status KEY      one story, phase by phase
 */
import fs from 'node:fs';
import path from 'node:path';
import { NON_EVAL_RUN, ROOT, evalPaths, listRuns, loadConfig, main, parseArgs, readEvaluationMeta, readJson, type HeldoutConfig } from './lib/config';
import { checkContract, readContract } from './lib/contract';
import { checkReview, readReview } from './lib/evidence';

interface Phase { name: string; done: boolean; detail: string; next?: string }
const H = 'npm run heldout --';

function phasesOf(cfg: HeldoutConfig, key: string): Phase[] {
  const p = evalPaths(cfg, key);
  const specs = fs.existsSync(p.tests) ? fs.readdirSync(p.tests, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.spec.ts')) : [];
  const src = specs.map((f) => fs.readFileSync(path.join(p.tests, f), 'utf8')).join('\n');
  const contract = readContract(p.base);
  const contractErrors = contract && fs.existsSync(p.requirement) ? [...checkContract(contract, p.requirement), ...checkReview(contract, readReview(p.base), { requireReview: true })].filter((f) => f.level === 'error').length : 0;
  const runs = listRuns(p.runs);
  const evalRuns = runs.filter((r) => !NON_EVAL_RUN.test(r));
  const lastEval = evalRuns.at(-1);
  const meta = lastEval && fs.existsSync(path.join(p.runs, lastEval, 'run-meta.json')) ? readJson<{ stats?: { expected: number; unexpected: number; flaky: number } }>(path.join(p.runs, lastEval, 'run-meta.json')) : undefined;
  const triageFile = lastEval ? path.join(p.runs, lastEval, 'triage.json') : '';
  const triage = triageFile && fs.existsSync(triageFile) ? readJson<{ entries: { status: string; final?: unknown }[] }>(triageFile) : undefined;
  const failures = meta?.stats ? meta.stats.unexpected + meta.stats.flaky : 0;
  const pending = triage ? triage.entries.filter((e) => e.status !== 'passed' && !e.final).length : failures;
  const verdict = fs.existsSync(p.verdictJson) ? readJson<{ verdict: string; finalRun?: string; run?: string }>(p.verdictJson) : undefined;
  const verdictStale = verdict && lastEval && fs.statSync(p.verdictJson).mtimeMs < fs.statSync(path.join(p.runs, lastEval)).mtimeMs;
  const published = fs.existsSync(path.join(p.base, 'publish-log.json')) ? readJson<{ at: string; verdict: string }[]>(path.join(p.base, 'publish-log.json')).at(-1) : undefined;
  const integrity = fs.existsSync(p.integrity) ? readJson<{ status: string }>(p.integrity).status : undefined;
  const todo = (src.match(/TODO\(harden\)/g) ?? []).length;
  const bound = readEvaluationMeta(cfg, key).aut;

  return [
    { name: 'fetch', done: fs.existsSync(p.storyMd), detail: fs.existsSync(p.storyMd) ? `story + ${fs.existsSync(p.attachments) ? fs.readdirSync(p.attachments).length : 0} attachment(s)${bound ? ` · AUT ${bound}` : ''}` : 'not fetched', next: `${H} fetch ${key}` },
    { name: 'contract', done: Boolean(contract) && contractErrors === 0, detail: !contract ? 'missing' : contractErrors ? `${contractErrors} error(s) (incl. review)` : `${contract.acceptanceCriteria.length} AC · ${contract.gaps.length} gap(s) · reviewed`, next: contract ? `${H} contract ${key}   (extractor / reviewer subagents until clean)` : `${H} contract ${key} --pack` },
    { name: 'scenarios', done: fs.existsSync(p.scenarios), detail: fs.existsSync(p.scenarios) ? `${(fs.readFileSync(p.scenarios, 'utf8').match(/^\s*Scenario/gm) ?? []).length} scenario(s)` : 'missing', next: `${H} scaffold ${key}   (then complete scenarios.feature)` },
    { name: 'tests', done: specs.length > 0, detail: specs.length ? `${specs.length} spec file(s)` : 'missing', next: `write tests/*.spec.ts, then ${H} lint ${key} --fix-tags --allow-unhardened` },
    { name: 'freeze', done: fs.existsSync(p.draft) && fs.readdirSync(p.draft).some((f) => f.endsWith('.spec.ts')), detail: fs.existsSync(p.draft) ? 'draft frozen' : 'not frozen', next: `${H} integrity ${key} --snapshot` },
    { name: 'harden', done: todo === 0 && fs.existsSync(p.hardeningLog) && integrity !== 'VIOLATED', detail: `${todo} TODO(harden)${integrity ? ` · integrity ${integrity}` : ''}${fs.existsSync(p.hardeningLog) ? '' : ' · no hardening log'}`, next: `harden against the AUT, then ${H} integrity ${key}` },
    { name: 'run', done: Boolean(lastEval), detail: lastEval ? `${lastEval}${meta?.stats ? `: ${meta.stats.expected} passed, ${meta.stats.unexpected} failed, ${meta.stats.flaky} flaky` : ''}` : 'no evaluation run', next: `${H} run ${key}` },
    { name: 'triage', done: Boolean(lastEval) && (failures === 0 || (Boolean(triage) && pending === 0)), detail: !lastEval ? '-' : failures === 0 ? 'nothing to triage' : !triage ? 'not triaged' : `${pending} pending confirmation`, next: triage ? `reproduce live, then ${H} triage ${key} --set <SCN> --category …` : `${H} triage ${key}` },
    { name: 'verdict', done: Boolean(verdict) && !verdictStale, detail: verdict ? `${verdict.verdict}${verdictStale ? ' (older than the last run)' : ''}` : 'none', next: `${H} verdict ${key}` },
    { name: 'publish', done: Boolean(published) && (!verdict || published!.verdict === verdict.verdict) && !verdictStale, detail: published ? `${published.verdict} at ${published.at.slice(0, 16)}` : 'not published', next: `${H} publish ${key}` },
  ];
}

main(() => {
  const { _ } = parseArgs();
  const cfg = loadConfig();
  const dir = path.join(ROOT, cfg.evaluationsDir);
  const keys = _[0] ? [_[0]] : fs.existsSync(dir) ? fs.readdirSync(dir).filter((k) => /^[A-Z][A-Z0-9_]+-\d+$/.test(k)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
  if (!keys.length) {
    const mockIssues = path.join(ROOT, cfg.jira.mockRoot ?? 'mock-jira', 'issues');
    const waiting = cfg.jira.mode === 'mock' && fs.existsSync(mockIssues) ? fs.readdirSync(mockIssues).filter((k) => /^[A-Z][A-Z0-9_]+-\d+$/.test(k)) : [];
    if (waiting.length) console.log(`No evaluations yet. In the mock Jira, not fetched: ${waiting.join(', ')}. Start with: ${H} fetch ${waiting[0]}`);
    else console.log(`No evaluations yet. Start with: ${H} fetch ABC-123   (or ${H} new ABC-1 --from story.md for the mock Jira)`);
    return;
  }
  if (_[0]) {
    const phases = phasesOf(cfg, _[0]);
    console.log(`${_[0]}`);
    for (const ph of phases) console.log(`  ${ph.done ? '✔' : '·'} ${ph.name.padEnd(9)} ${ph.detail}`);
    const next = phases.find((ph) => !ph.done);
    console.log(next ? `\nNext: ${next.next}` : '\n✔ Complete.');
    return;
  }
  console.log(`${'Story'.padEnd(12)} ${'Phase'.padEnd(10)} ${'Verdict'.padEnd(20)} Next`);
  for (const key of keys) {
    const phases = phasesOf(cfg, key);
    const next = phases.find((ph) => !ph.done);
    const v = phases.find((ph) => ph.name === 'verdict')!;
    console.log(`${key.padEnd(12)} ${(next?.name ?? 'done').padEnd(10)} ${(v.done ? v.detail : '-').slice(0, 20).padEnd(20)} ${next?.next ?? ''}`);
  }
});
