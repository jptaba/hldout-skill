/**
 * A story's next steps, as far as scripts can take it (`heldout advance`, and `heldout drive`, which starts each
 * subagent too): every deterministic step in order, up to the next stop. Scripts it runs: fetch, the contract's evidence pack, the tests generated from the contract's checks, lint and the
 * freeze, the integrity check and the evaluation run, triage (the automatic classification and the replays), the
 * verification of each finding, verdict, publish and the journeys harvest. Before the verdict it moves files the
 * record's layout doesn't have to the scratch area's stray/ and gives a probe id found twice (two merged branches) a
 * new number; before publishing it checks the story's files for secret values, as `heldout scrub` does.
 * Where it stops: heldout-contract-extractor, heldout-contract-reviewer, heldout-operator. Nothing stops it for a
 * person: open questions about the requirement go into the tests and the verdict, a story without acceptance criteria
 * gets an INCONCLUSIVE verdict saying so, and the verdict is published unless the project's config sets jira.publish
 * to "manual". `heldout drive` runs the same steps and starts each subagent itself.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { SCRIPTS_DIR, loadConfig } from '../core/config';
import { readJson, rel, removeDir, writeFile } from '../core/files';
import { readHistory, recordEvent } from '../core/history';
import { NON_EVAL_RUN, evalPaths, evalRunsOf, knowledgeIds, moveStrayFiles, moveSupersededRuns, runFile } from '../core/paths';
import { keepNamedProbes, renumberDuplicateProbes, trimProbeLogs } from '../core/probe-log';
import type { HeldoutConfig } from '../core/profile';
import { hasChecks } from '../contract/checks';
import { checkContract, notEvaluable, openQuestions, readContract, type RequirementContract } from '../contract/contract-model';
import { checkReview, readReview } from '../contract/evidence';
import { readDecisions, readRunRecord } from '../run/run-record';
import { phasesOf } from './phases';

const H = 'npm run heldout --';
/** The repair loop is bounded: at most three repair → re-run cycles in a row. */
const MAX_REPAIRS = 3;
/** The subagents a story is handed to. */
export const OPERATOR = 'heldout-operator';

/**
 * How many of the latest evaluation runs, counted back from the last, ended in a confirmed script defect: the repairs
 * tried in a row. An evaluation run without one (an earlier verdict, a re-run for another reason) starts the count anew.
 * Read from the history and the decisions, which outlive the runs' records.
 */
export function repairsTried(p: Pick<ReturnType<typeof evalPaths>, 'history' | 'decisions'>): number {
  const decisions = readDecisions(p.decisions);
  const evalRuns = [...new Set(readHistory(p.history).filter((e) => e.event === 'run' && typeof e.run === 'string' && !e.grep && !NON_EVAL_RUN.test(e.run)).map((e) => String(e.run)))];
  let n = 0;
  for (const r of evalRuns.reverse()) {
    if (!Object.values(decisions[r] ?? {}).some((d) => d.category === 'SCRIPT_DEFECT')) break;
    n++;
  }
  return n;
}

/** A story's next stop: a subagent with its task (then the command that follows it), or the end. */
export type Stop =
  | { kind: 'agent'; agent: string; task: string; why?: string; then: string }
  | { kind: 'complete'; verdict: string; notPublished?: boolean }
  | { kind: 'not-evaluable'; verdict: string };

/** A story that is not evaluable: nothing is tested, and the verdict puts the question to the story's owner. */
function writeNotEvaluable(cfg: HeldoutConfig, key: string, c: RequirementContract): void {
  const p = evalPaths(cfg, key);
  const questions = openQuestions(c).map((g) => `${g.id}: ${g.element}`);
  const reason = 'The story states no acceptance criteria, so nothing could be tested. Criteria are never invented and never read off the application.';
  writeFile(p.verdictMd, [
    `# Held-out evaluation of ${key}: INCONCLUSIVE (recommendation)`, '', `**${c.title ?? key}**`, '', reason, '',
    `Application: ${cfg.aut.name} (${cfg.aut.baseURL})`, '', '## Open questions for the story\'s owner', '',
    ...questions.map((q) => `- ❓ ${q}`), '',
    `Once the story states its criteria, evaluate it again: \`${H} fetch ${key}\` reads the revision, then \`${H} advance ${key}\`.`, '',
  ].join('\n'));
  writeFile(p.verdictJson, `${JSON.stringify({
    key, verdict: 'INCONCLUSIVE', reason, finalRun: '-', integrity: 'not applicable', notEvaluable: true, generatedAt: new Date().toISOString(),
    aut: { name: cfg.aut.name, baseURL: cfg.aut.baseURL }, summary: { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0 },
    applicationDefects: [], scriptDefectsRepaired: [], uncoveredCriteria: [], openQuestions: questions,
  }, null, 2)}\n`);
}

/** Runs a heldout command in this project, its output shown, and gives its exit status. */
export const heldoutCommand = (...args: string[]): number => {
  console.log(`\n▶ heldout ${args.join(' ')}`);
  return spawnSync(process.execPath, [...process.execArgv, path.join(SCRIPTS_DIR, 'heldout.ts'), ...args], { stdio: 'inherit' }).status ?? 1;
};

/** Every script step that comes next, up to the story's next stop. Throws when a step fails for a reason a person must see. */
export function advanceStory(key: string, o: { aut?: string; rerun?: boolean } = {}, heldout: (...a: string[]) => number = heldoutCommand): Stop {
  const { aut } = o;
  const agent = (name: string, task: string, why?: string, then = `${H} advance ${key}`): Stop => ({ kind: 'agent', agent: name, task, why, then });
  const stuck = (what: string): never => { throw new Error(`${what} — see the output above; fix it, then: ${H} advance ${key}`); };
  /** No secret value goes out with the verdict: checked, scrubbed if one is found, and checked again. */
  const publish = () => {
    if (heldout('scrub', key, '--check') !== 0 && (heldout('scrub', key) !== 0 || heldout('scrub', key, '--check') !== 0)) stuck('a secret value is still in the story\'s files after scrubbing');
    return heldout('publish', key);
  };
  /**
   * The record as its layout has it, before the verdict: stray files to the scratch area, each probe id once, and only
   * what the verdict and a reader use (the final evaluation run; the probes something cites, in full).
   */
  const tidy = (p: ReturnType<typeof evalPaths>) => {
    const moved = moveStrayFiles(p);
    if (moved.length) { recordEvent(p.history, 'stray-moved', { files: moved }); console.log(`• moved ${moved.length} file(s) the record's layout doesn't have to ${rel(p.work.stray)}/: ${moved.slice(0, 5).join(', ')}${moved.length > 5 ? ', …' : ''}`); }
    for (const r of renumberDuplicateProbes(p)) { recordEvent(p.history, 'note', { kind: 'remark', text: `${r.from} was in the probe log twice: the later one is now ${r.to}; citations of ${r.from} mean the earlier` }); console.log(`• ${r.from} was in the probe log twice: the later one is now ${r.to}`); }
    const superseded = moveSupersededRuns(p);
    // A probe the log, a decision or a gap names keeps its report, as one cited with --evidence does.
    const read = (f: string) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
    const named = keepNamedProbes(p, [read(p.hardeningLog), read(p.decisions), read(p.contract)]);
    if (named.lost.length) {
      recordEvent(p.history, 'note', { kind: 'remark', text: `named but their reports were gone from the scratch area before they were kept: ${named.lost.join(', ')}` });
      console.log(`⚠ ${named.lost.join(', ')} named in the log, a decision or the contract, but their reports were gone before they were kept`);
    }
    const trimmed = trimProbeLogs(p);
    if (superseded.length || trimmed) {
      recordEvent(p.history, 'record-trimmed', { runs: superseded, probes: trimmed });
      console.log(`• the record keeps the final run and the cited probes: ${superseded.length} earlier run record(s) to ${rel(p.work.runs)}/ (their results stay in the history), ${trimmed} uncited probe(s) trimmed to their digest`);
    }
  };

  if (o.rerun) {
    const cfg = loadConfig({ key, aut });
    const sp = evalPaths(cfg, key);
    if (!evalRunsOf(sp.runs).length) throw new Error(`--rerun follows a repair after an evaluation run; ${key} has none yet: ${H} advance ${key}`);
    if (repairsTried(sp) > MAX_REPAIRS) console.log(`• ${MAX_REPAIRS} evaluation runs in a row ended in confirmed script defects: the repair loop is bounded, so no further re-run — going on to the verdict`);
    else { if (heldout('integrity', key) !== 0) stuck('integrity is not preserved after the repair'); heldout('run', key, '--label', 'rerun', '--quiet'); }
  }

  for (let step = 0; step < 16; step++) {
    const cfg = loadConfig({ key, aut });
    const p = evalPaths(cfg, key);
    // jira.publish "manual": publishing is left to a person, and the story goes on to the journeys harvest.
    const manualPublish = cfg.jira.publish === 'manual';
    const next = phasesOf(cfg, key).find((ph) => !ph.done && !(manualPublish && ph.name === 'publish'));
    if (!next) {
      // The scratch area (raw run output, views, working files) goes with the story's end; the record stays.
      if (!cfg.keepScratch) {
        const freed = removeDir(p.work.base);
        if (freed) { recordEvent(p.history, 'pruned', { bytes: freed }); console.log(`  scratch area removed (${(freed / 1024 / 1024).toFixed(1)} MB); "keepScratch": true in heldout.config.json keeps it`); }
      }
      return { kind: 'complete', verdict: rel(p.verdictMd), notPublished: manualPublish && phasesOf(cfg, key).some((ph) => ph.name === 'publish' && !ph.done) };
    }
    const before = JSON.stringify(phasesOf(cfg, key));
    const moved = () => JSON.stringify(phasesOf(loadConfig({ key, aut }), key)) !== before;

    if (next.name === 'fetch') { if (heldout('fetch', key, ...(aut ? ['--aut', aut] : [])) !== 0 || !moved()) stuck('the story could not be fetched'); continue; }

    if (next.name === 'contract') {
      const contract = readContract(p.contract);
      // The evidence pack is a view in the scratch area: built again whenever it is missing (it never touches the contract).
      if (!fs.existsSync(p.work.evidencePack) && heldout('contract', key, '--pack') !== 0) stuck('the evidence pack could not be built');
      if (!contract) return agent('heldout-contract-extractor', `Build the requirement contract for ${key}`);
      if (notEvaluable(contract)) {
        if (!(fs.existsSync(p.verdictJson) && readJson<{ notEvaluable?: boolean }>(p.verdictJson).notEvaluable)) {
          writeNotEvaluable(cfg, key, contract);
          if (!manualPublish && publish() !== 0) stuck('the verdict could not be published');
        }
        return { kind: 'not-evaluable', verdict: rel(p.verdictMd) };
      }
      const built = checkContract(contract, p.requirement, { apiBaseURL: cfg.aut.apiBaseURL ?? cfg.aut.baseURL, knowledgeIds: knowledgeIds(cfg) }).filter((f) => f.level === 'error');
      if (!contract.acceptanceCriteria.length) return agent('heldout-contract-extractor', `Build the requirement contract for ${key}`);
      if (built.length) return agent('heldout-contract-extractor', `Fix the requirement contract of ${key}: ${H} contract ${key} --allow-unreviewed lists ${built.length} error(s)`, built[0].message.slice(0, 160));
      // The tests are generated from the contract's checks: a contract without them is not finished.
      if (!hasChecks(contract)) return agent('heldout-contract-extractor', `Add the checks to the requirement contract of ${key}: for each criterion the fewest that could prove it false (references/requirement-contract.md, "Checks")`, 'the contract states the criteria and not yet what is tested');
      const review = checkReview(contract, readReview(p.review), { requireReview: true }).filter((f) => f.level === 'error');
      if (review.some((f) => f.code === 'not-reviewed' || f.code === 'review-stale')) return agent('heldout-contract-reviewer', `Review the requirement contract of ${key}`, 'in a fresh context, from the evidence');
      return agent('heldout-contract-extractor', `Fix the reviewer's findings on the requirement contract of ${key} (${H} contract ${key} lists them); it is then reviewed again`, review[0]?.message.slice(0, 160));
    }

    if (next.name === 'tests') {
      // The tests are generated from the reviewed contract's checks; what they expect stays in the contract.
      if (heldout('scaffold', key, '--force') !== 0 || heldout('lint', key, '--allow-unhardened', '--no-health', '--draft-finished') !== 0 || !moved()) stuck('the tests could not be generated from the contract\'s checks');
      continue;
    }

    if (next.name === 'freeze') {
      if (heldout('lint', key, '--allow-unhardened', '--no-health') !== 0) stuck('the generated tests do not lint');
      if (heldout('integrity', key, '--snapshot') !== 0 || !moved()) stuck('the draft could not be frozen');
      continue;
    }

    if (next.name === 'harden') return agent(OPERATOR, `Make the tests of ${key} run`, next.detail);

    if (next.name === 'run') {
      if (heldout('integrity', key) !== 0) return agent(OPERATOR, `Integrity is not preserved for ${key}: restore what the tests expect, or report the check that can't be right (${H} integrity ${key})`);
      heldout('run', key, '--label', 'eval', '--quiet');
      if (!moved()) stuck('the evaluation run did not start (preflight)');
      continue;
    }

    if (next.name === 'triage') {
      const evalRuns = evalRunsOf(p.runs);
      const lastEval = evalRuns.at(-1)!;
      // The automatic classification and the replays first (a re-run takes over the decisions confirmed for identical
      // failures): the operator starts from what they leave.
      if (!readHistory(p.history).some((e) => e.event === 'triaged' && e.run === lastEval)) { heldout('triage', key, '--run', lastEval, '--replay', ...(evalRuns.length > 1 ? ['--carry-from', 'auto'] : [])); if (!moved()) return agent(OPERATOR, `Triage run ${lastEval} of ${key}`); continue; }
      return agent(OPERATOR, `Triage run ${lastEval} of ${key}`, 'each failure reproduced live before it is called a defect');
    }

    if (next.name === 'verify') { if (heldout('verify', key) !== 0 || !moved()) stuck('the findings could not be verified'); continue; }

    if (next.name === 'verdict') {
      // Confirmed script defects are repaired and the suite run again before the verdict, at most three times.
      const evalRuns = evalRunsOf(p.runs);
      const scriptDefects = evalRuns.length ? readRunRecord(runFile(p, evalRuns.at(-1)!)).entries.filter((e) => e.status !== 'passed' && e.final?.category === 'SCRIPT_DEFECT') : [];
      if (scriptDefects.length && repairsTried(p) <= MAX_REPAIRS) {
        return agent(OPERATOR, `Repair these script defects for ${key}: ${scriptDefects.map((e) => `${e.scenario} (${(e.final?.rationale ?? '').slice(0, 100)})`).join('; ')}`, `${scriptDefects.length} confirmed script defect(s) in ${evalRuns.at(-1)}`, `${H} advance ${key} --rerun`);
      }
      tidy(p);
      if (heldout('verdict', key) !== 0 || !moved()) stuck('the verdict could not be rendered');
      continue;
    }

    if (next.name === 'publish') { if (publish() !== 0 || !moved()) stuck('the verdict could not be published'); continue; }
    if (next.name === 'journeys') { if (heldout('journeys', key, '--harvest', '--apply') !== 0 || !moved()) stuck('the journeys could not be harvested'); continue; }
    stuck(`unknown phase ${next.name}`);
  }
  return stuck('the story did not reach its end');
}

/** A stop as a person or the coordinating agent reads it. */
export function printStop(key: string, s: Stop): void {
  if (s.kind === 'agent') {
    console.log(`\n■ Next: the ${s.agent} subagent${s.why ? ` — ${s.why}` : ''}`);
    console.log(`  Task: "${s.task}"`);
    console.log(`  Brief: ${H} brief ${key}`);
    console.log(`  Then: ${s.then}`);
  } else if (s.kind === 'not-evaluable') console.log(`\n■ ${key} is not evaluable: the story states no acceptance criteria. Verdict INCONCLUSIVE: ${s.verdict}`);
  else {
    console.log(`\n✔ ${key} is complete: ${s.verdict}`);
    if (s.notPublished) console.log(`  Not published (jira.publish is "manual"): ${H} publish ${key}`);
  }
}

