/**
 * Run a story's next steps, as far as scripts can take it: every deterministic step in order, stopping where a
 * subagent has work to do and naming it with its task. Run it again after each subagent; it picks the story up from
 * the files on disk.
 *
 *   heldout advance KEY [--aut <profile>]     from wherever the story is
 *   heldout advance KEY --rerun               after the hardener repaired confirmed script defects: run again first
 *
 * Scripts it runs: fetch, the contract's evidence pack, lint and the freeze, the integrity check and the evaluation
 * run, triage (the automatic classification), verdict, publish and the journeys harvest.
 * Where it stops: heldout-contract-extractor, heldout-contract-reviewer, heldout-test-author, heldout-hardener,
 * heldout-triager. Nothing stops it for a person: open questions about the requirement go into the tests and the
 * verdict, a story without acceptance criteria gets an INCONCLUSIVE verdict saying so, and the verdict is published
 * unless the project's config sets jira.publish to "manual".
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { NON_EVAL_RUN, SCRIPTS_DIR, assertIssueKey, evalPaths, flagStr, listRuns, loadConfig, main, parseArgs, readJson, rel, writeFile, type HeldoutConfig } from './config';
import { checkContract, notEvaluable, openQuestions, readContract, type RequirementContract } from './contract-model';
import { checkReview, readReview } from './evidence';
import { phasesOf } from './phases';

const H = 'npm run heldout --';
/** The repair loop is bounded: at most three repair → re-run cycles after the first evaluation run. */
const MAX_EVAL_RUNS = 4;

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

main(() => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const aut = flagStr(flags, 'aut');
  const heldout = (...args: string[]) => {
    console.log(`\n▶ heldout ${args.join(' ')}`);
    return spawnSync(process.execPath, [...process.execArgv, path.join(SCRIPTS_DIR, 'heldout.ts'), ...args], { stdio: 'inherit' }).status ?? 1;
  };
  /** Stop for a subagent: who, its task, and how to go on afterwards. */
  const handOver = (agent: string, task: string, why?: string) => {
    console.log(`\n■ Next: the ${agent} subagent${why ? ` — ${why}` : ''}`);
    console.log(`  Task: "${task}"`);
    console.log(`  Then: ${H} advance ${key}`);
  };
  const stuck = (what: string) => { throw new Error(`${what} — see the output above; fix it, then: ${H} advance ${key}`); };

  if (flags.rerun) {
    const cfg = loadConfig({ key, aut });
    const evalRuns = listRuns(evalPaths(cfg, key).runs).filter((r) => !NON_EVAL_RUN.test(r));
    if (!evalRuns.length) throw new Error(`--rerun follows a repair after an evaluation run; ${key} has none yet: ${H} advance ${key}`);
    if (evalRuns.length >= MAX_EVAL_RUNS) console.log(`• ${evalRuns.length} evaluation runs already: the repair loop is bounded, so no further re-run — going on to the verdict`);
    else { if (heldout('integrity', key) !== 0) stuck('integrity is not preserved after the repair'); heldout('run', key, '--label', 'rerun', '--quiet'); }
  }

  for (let step = 0; step < 16; step++) {
    const cfg = loadConfig({ key, aut });
    const p = evalPaths(cfg, key);
    // jira.publish "manual": publishing is left to a person, and the story goes on to the journeys harvest.
    const manualPublish = cfg.jira.publish === 'manual';
    const next = phasesOf(cfg, key).find((ph) => !ph.done && !(manualPublish && ph.name === 'publish'));
    if (!next) {
      console.log(`\n✔ ${key} is complete: ${rel(p.verdictMd)}`);
      if (manualPublish && phasesOf(cfg, key).some((ph) => ph.name === 'publish' && !ph.done)) console.log(`  Not published (jira.publish is "manual"): ${H} publish ${key}`);
      return;
    }
    const before = JSON.stringify(phasesOf(cfg, key));
    const moved = () => JSON.stringify(phasesOf(loadConfig({ key, aut }), key)) !== before;

    if (next.name === 'fetch') { if (heldout('fetch', key, ...(aut ? ['--aut', aut] : [])) !== 0 || !moved()) stuck('the story could not be fetched'); continue; }

    if (next.name === 'contract') {
      const contract = readContract(p.base);
      if (!contract || !fs.existsSync(path.join(p.requirement, 'evidence-pack.md'))) {
        if (heldout('contract', key, '--pack') !== 0) stuck('the evidence pack could not be built');
        return handOver('heldout-contract-extractor', `Build the requirement contract for ${key}`);
      }
      if (notEvaluable(contract)) {
        if (fs.existsSync(p.verdictJson) && readJson<{ notEvaluable?: boolean }>(p.verdictJson).notEvaluable) { console.log(`\n■ ${key} is not evaluable (no acceptance criteria), as its verdict says: ${rel(p.verdictMd)}`); return; }
        writeNotEvaluable(cfg, key, contract);
        console.log(`\n■ ${key} is not evaluable: the story states no acceptance criteria. Verdict INCONCLUSIVE: ${rel(p.verdictMd)}`);
        if (manualPublish) console.log(`  Not published (jira.publish is "manual"): ${H} publish ${key}`);
        else if (heldout('publish', key) !== 0) stuck('the verdict could not be published');
        return;
      }
      const built = checkContract(contract, p.requirement, { apiBaseURL: cfg.aut.apiBaseURL ?? cfg.aut.baseURL }).filter((f) => f.level === 'error');
      if (!contract.acceptanceCriteria.length) return handOver('heldout-contract-extractor', `Build the requirement contract for ${key}`);
      if (built.length) return handOver('heldout-contract-extractor', `Fix the requirement contract of ${key}: ${H} contract ${key} --allow-unreviewed lists ${built.length} error(s)`, built[0].message.slice(0, 160));
      const review = checkReview(contract, readReview(p.base), { requireReview: true }).filter((f) => f.level === 'error');
      if (review.some((f) => f.code === 'not-reviewed' || f.code === 'review-stale')) return handOver('heldout-contract-reviewer', `Review the requirement contract of ${key}`, 'in a fresh context, from the evidence only');
      return handOver('heldout-contract-extractor', `Fix the reviewer's findings on the requirement contract of ${key} (${H} contract ${key} lists them); it is then reviewed again`, review[0]?.message.slice(0, 160));
    }

    if (next.name === 'tests') return handOver('heldout-test-author', `Write the tests for ${key}`, 'from the reviewed contract, without a browser');

    if (next.name === 'freeze') {
      if (heldout('lint', key, '--allow-unhardened', '--no-health') !== 0) return handOver('heldout-test-author', `Fix the lint errors in the tests of ${key} (${H} lint ${key} --allow-unhardened --no-health)`, 'the draft is frozen only when it lints clean');
      if (heldout('integrity', key, '--snapshot') !== 0 || !moved()) stuck('the draft could not be frozen');
      return handOver('heldout-hardener', `Harden the tests for ${key}`, 'the draft is frozen');
    }

    if (next.name === 'harden') return handOver('heldout-hardener', `Harden the tests for ${key}`, next.detail);

    if (next.name === 'run') {
      if (heldout('integrity', key) !== 0) return handOver('heldout-hardener', `Integrity is not preserved for ${key}: restore what the tests expect, or report the assertion whose implementation is wrong (${H} integrity ${key})`);
      heldout('run', key, '--label', 'eval', '--quiet');
      if (!moved()) stuck('the evaluation run did not start (preflight)');
      continue;
    }

    if (next.name === 'triage') {
      const evalRuns = listRuns(p.runs).filter((r) => !NON_EVAL_RUN.test(r));
      const lastEval = evalRuns.at(-1)!;
      // The automatic classification first (a re-run takes over the decisions confirmed for identical failures): the
      // triager starts from it.
      if (!fs.existsSync(path.join(p.runs, lastEval, 'triage.json'))) { heldout('triage', key, '--run', lastEval, ...(evalRuns.length > 1 ? ['--carry-from', 'auto'] : [])); if (!moved()) return handOver('heldout-triager', `Triage run ${lastEval} of ${key}`); continue; }
      return handOver('heldout-triager', `Triage run ${lastEval} of ${key}`, 'each failure reproduced live before it is called a defect');
    }

    if (next.name === 'verdict') {
      // Confirmed script defects are repaired and the suite run again before the verdict, at most three times.
      const evalRuns = listRuns(p.runs).filter((r) => !NON_EVAL_RUN.test(r));
      const triageFile = path.join(p.runs, evalRuns.at(-1) ?? '', 'triage.json');
      const scriptDefects = fs.existsSync(triageFile) ? readJson<{ entries: { scenario: string; status: string; final?: { category: string; rationale?: string } }[] }>(triageFile).entries.filter((e) => e.status !== 'passed' && e.final?.category === 'SCRIPT_DEFECT') : [];
      if (scriptDefects.length && evalRuns.length < MAX_EVAL_RUNS) {
        console.log(`\n■ Next: the heldout-hardener subagent — ${scriptDefects.length} confirmed script defect(s) in ${evalRuns.at(-1)}`);
        console.log(`  Task: "Repair these script defects for ${key}: ${scriptDefects.map((e) => `${e.scenario} (${(e.final?.rationale ?? '').slice(0, 100)})`).join('; ')}"`);
        console.log(`  Then: ${H} advance ${key} --rerun`);
        return;
      }
      if (heldout('verdict', key) !== 0 || !moved()) stuck('the verdict could not be rendered');
      continue;
    }

    if (next.name === 'publish') { if (heldout('publish', key) !== 0 || !moved()) stuck('the verdict could not be published'); continue; }
    if (next.name === 'journeys') { if (heldout('journeys', key, '--harvest', '--apply') !== 0 || !moved()) stuck('the journeys could not be harvested'); continue; }
    stuck(`unknown phase ${next.name}`);
  }
  stuck('the story did not reach its end');
});
