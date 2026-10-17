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
import { allJourneys, journeyUse, journeysUsedBy, ownCodeOf, readRegistry, statusOf } from '../authoring/journeys/registry';
import { readSuite, specFiles } from '../authoring/spec-model';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { SCRIPTS_DIR, assertIssueKey, loadConfig } from '../core/config';
import { readJson, rel, writeFile } from '../core/files';
import { evalPaths, evalRunsOf, journeyPaths, listRuns } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';
import { checkContract, notEvaluable, openQuestions, readContract, type RequirementContract } from '../requirement/contract-model';
import { checkReview, readReview } from '../requirement/evidence';
import { guessesNotSettled, journeyGuessesNotSettled } from '../run/fast-harden';
import { phasesOf } from './phases';

const H = 'npm run heldout --';
/** The repair loop is bounded: at most three repair → re-run cycles in a row. */
const MAX_REPAIRS = 3;
/**
 * How many of the latest evaluation runs, counted back from the last, ended in a confirmed script defect: the repairs
 * tried in a row. An evaluation run without one (an earlier verdict, a re-run for another reason) starts the count anew.
 */
function repairsTried(runsDir: string, evalRuns: string[]): number {
  let n = 0;
  for (const r of [...evalRuns].reverse()) {
    const f = path.join(runsDir, r, 'triage.json');
    const script = fs.existsSync(f) && readJson<{ entries: { status: string; final?: { category: string } }[] }>(f).entries.some((e) => e.status !== 'passed' && e.final?.category === 'SCRIPT_DEFECT');
    if (!script) break;
    n++;
  }
  return n;
}

/** What the tests stand on: which scenarios use which journey, and the journeys that are new with this story. */
interface Known { use: Map<string, Set<string>>; fresh: Set<string> }

/** The story's journey files that hold a guess, and what a run can say about those guesses (see journeyGuessesNotSettled). */
function journeyGuesses(cfg: HeldoutConfig, key: string, k: Known, results?: { scenario: string; status: string }[]): { files: string[]; why?: string } {
  const p = evalPaths(cfg, key);
  const files = journeysUsedBy(cfg, cfg.autId, specFiles(p.tests)).filter((f) => /TODO\(harden\)/.test(fs.readFileSync(f, 'utf8')));
  if (!files.length) return { files };
  const journeys = allJourneys(cfg, cfg.autId); const base = journeyPaths(cfg, cfg.autId).base;
  const own = files.flatMap((f) => [...ownCodeOf(f, journeys, base)].map(([id, code]) => ({ id, code })));
  const marks = files.reduce((n, f) => n + (fs.readFileSync(f, 'utf8').match(/TODO\(harden\)/g) ?? []).length, 0);
  return { files, why: journeyGuessesNotSettled(own, marks, k.fresh, k.use, results) };
}

/**
 * Nothing left to discover that a run can't settle: every journey the tests call is in the registry as proven,
 * unchanged since, or is new with this story (never proven, never changed after a proof); and a guess the draft left
 * in a journey sits where a run settles it (a new journey's own statement that acts on what it locates). A guess left
 * in a test is settled by that test's run (see specGuessesHeld). Returns which scenarios use which journey.
 */
function knownMechanics(cfg: HeldoutConfig, key: string): Known | undefined {
  const p = evalPaths(cfg, key);
  const specs = specFiles(p.tests);
  const journeys = allJourneys(cfg, cfg.autId);
  const use = journeyUse(journeys, specs, readSuite(p.tests, readContract(p.base)).scenarios);
  const registry = readRegistry(cfg, cfg.autId).journeys;
  const hashOf = new Map(journeys.map((j) => [j.id, j.hash]));
  const status = (id: string) => (registry[id] ? statusOf(registry[id], hashOf.get(id)) : 'unproven');
  if (!use.size || [...use.keys()].some((id) => status(id) !== 'proven' && status(id) !== 'unproven')) return undefined;
  const fresh = new Set([...use.keys()].filter((id) => status(id) === 'unproven'));
  // A story on new ground is the hardener's: the run settles a few new journeys beside proven ones, not a whole draft.
  if (fresh.size && fresh.size * 2 > use.size) return undefined;
  return journeyGuesses(cfg, key, { use, fresh }).why ? undefined : { use, fresh };
}

/**
 * The guesses the draft left in its tests (a locator built from a text the requirement gives), judged by the run: each
 * sits in a test that passed every time, on a line that acts on or positively expects what it locates. A locator
 * that matched nothing would have failed that line. A guess in a failing test, in a negative check ("is not shown")
 * or outside any test is not settled by a run. Returns why not, or the spec files whose marks may go.
 */
function specGuessesHeld(cfg: HeldoutConfig, key: string, entries: { scenario: string; status: string }[]): string | string[] {
  const p = evalPaths(cfg, key);
  const marked = specFiles(p.tests).filter((f) => /TODO\(harden\)/.test(fs.readFileSync(f, 'utf8')));
  if (!marked.length) return [];
  const inFiles = marked.reduce((n, f) => n + (fs.readFileSync(f, 'utf8').match(/TODO\(harden\)/g) ?? []).length, 0);
  return guessesNotSettled(readSuite(p.tests, readContract(p.base)).scenarios, inFiles, entries) ?? marked;
}

/**
 * Hardening without the hardener, when nothing is left to discover: the stability run is the proof. Every test must
 * pass or fail on a requirement assertion alone; anything else (a locator, a precondition, a flaky test) means a
 * proven journey no longer holds, and the hardener takes over. Returns false in that case.
 */
function hardenFromRegistry(cfg: HeldoutConfig, key: string, known: Known, heldout: (...a: string[]) => number): string | true {
  const { use, fresh } = known;
  const p = evalPaths(cfg, key);
  const before = new Set(listRuns(p.runs));
  heldout('run', key, '--label', 'harden', '--repeat-each', '2', '--workers', '2', '--quiet');
  const run = listRuns(p.runs).find((r) => !before.has(r));
  if (!run) return 'the stability run did not start (preflight)';
  heldout('triage', key, '--run', run);
  const triageFile = path.join(p.runs, run, 'triage.json');
  if (!fs.existsSync(triageFile)) return `${run} could not be classified`;
  const entries = readJson<{ entries: { scenario: string; status: string; auto?: { category: string } }[] }>(triageFile).entries;
  const bad = entries.filter((e) => e.status !== 'passed' && e.status !== 'skipped' && e.auto?.category !== 'APPLICATION_DEFECT');
  if (bad.length) return `the proven journeys did not hold in ${run}: ${bad.slice(0, 6).map((e) => `${e.scenario} (${e.auto?.category ?? e.status})`).join(', ')}`;
  // A journey that is new with this story has no proof but this run: every test that uses it passed each time.
  const passedAll = (s: string) => { const runs = entries.filter((e) => e.scenario === s || e.scenario.replace(/\.\d+$/, '') === s); return runs.length > 0 && runs.every((e) => e.status === 'passed'); };
  const unproved = [...fresh].find((id) => ![...(use.get(id) ?? [])].every(passedAll));
  if (unproved) return `${unproved} is new with this story and a test that uses it did not pass every time (run ${run})`;
  const inJourneys = journeyGuesses(cfg, key, known, entries);
  if (inJourneys.why) return `${inJourneys.why} (run ${run})`;
  const inSpec = specGuessesHeld(cfg, key, entries);
  if (typeof inSpec === 'string') return `${inSpec} (run ${run})`;
  const guesses = [...inSpec, ...inJourneys.files];
  for (const f of guesses) if (heldout('confirm', key, '--file', rel(f), '--evidence', `run ${run}: the tests that use these guesses passed each time, on lines that act on or expect what they locate`) !== 0) return 'the confirmed guesses could not be recorded';

  // The open mechanics gaps are answered by the journeys the tests of their criteria call.
  const contract = readContract(p.base)!;
  const registry = readRegistry(cfg, cfg.autId).journeys;
  const scenarios = readSuite(p.tests, contract).scenarios;
  const proofOf = (ids: string[]) => [...new Set(ids.flatMap((id) => registry[id]?.proven?.by ?? []))].join(', ');
  const answers = contract.gaps.filter((g) => g.kind === 'mechanics' && g.resolution === 'open').map((g) => {
    const tests = new Set(scenarios.filter((s) => g.affects.includes('*') || s.acs.some((a) => g.affects.includes(a))).map((s) => s.id));
    const ids = [...use].filter(([, by]) => [...by].some((s) => tests.has(s))).map(([id]) => id).sort();
    const journeys = ids.length ? ids : [...use.keys()].sort();
    return { id: g.id, value: `as the journeys the tests call do it: ${journeys.join(', ')}`, evidence: `journeys/registry.yml (proven by ${proofOf(journeys) || 'earlier stories'}${journeys.some((id) => fresh.has(id)) ? '; the ones new with this story by the run' : ''}); run ${run}` };
  });
  if (answers.length) {
    const file = path.join(p.hardening, 'gaps-from-registry.json');
    writeFile(file, `${JSON.stringify(answers, null, 2)}\n`);
    if (heldout('contract', key, '--resolve-from', file) !== 0) return 'the mechanics gaps could not be recorded';
  }
  const failed = entries.filter((e) => e.status !== 'passed' && e.status !== 'skipped').map((e) => e.scenario);
  const proven = [...use.keys()].filter((id) => !fresh.has(id));
  const tiers = `**Tiers used:** none — nothing was left to discover: ${guesses.length ? `the guesses the draft left in its tests${inJourneys.files.length ? ' and in its new journeys' : ''} were settled by the run (each in a test that passed every time, on a line that acts on or expects what it locates), ` : 'the draft marks no guess '}and the ${proven.length} journey(s) its tests call are proven in the registry as they are (by ${proofOf(proven) || 'earlier stories'})${fresh.size ? `; ${fresh.size} journey(s) are new with this story, and every test that uses one passed each time (${[...fresh].sort().join(', ')})` : ''}. Stability: run ${run}, each test twice; ${failed.length ? `${failed.join(', ')} failed on a requirement assertion each time (left for triage), the others passed` : 'every test passed'}. Written by \`heldout advance\`, no hardener.`;
  const log = fs.existsSync(p.hardeningLog) ? fs.readFileSync(p.hardeningLog, 'utf8') : `# Hardening log — ${key}\n**Tiers used:** \n`;
  writeFile(p.hardeningLog, `${log.replace(/^\*\*Tiers? used:\*\*.*$/m, tiers).replace(/\s+$/, '')}\n\n## Journeys reused as proven (nothing fixed)\n${proven.sort().map((id) => `- ${id} — proven by ${registry[id]?.proven?.by?.join(', ') ?? '-'}`).join('\n')}\n${fresh.size ? `\n## Journeys new with this story (as drafted; proven by run ${run})\n${[...fresh].sort().map((id) => `- ${id} — used by ${[...(use.get(id) ?? [])].sort().join(', ')}`).join('\n')}\n` : ''}`);
  return heldout('integrity', key) === 0 ? true : 'integrity is not preserved';
}

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

export const spec: CommandSpec = {
  name: 'advance', group: 'Setup', usage: 'KEY [--aut id] [--rerun]',
  about: 'run the story\'s next script steps, up to the next subagent (run it again after each one)',
  flags: ['aut', 'rerun'],
};

export function run({ _, flags }: Args): void {
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
    const runsDir = evalPaths(cfg, key).runs;
    const evalRuns = evalRunsOf(runsDir);
    if (!evalRuns.length) throw new Error(`--rerun follows a repair after an evaluation run; ${key} has none yet: ${H} advance ${key}`);
    if (repairsTried(runsDir, evalRuns) > MAX_REPAIRS) console.log(`• ${MAX_REPAIRS} evaluation runs in a row ended in confirmed script defects: the repair loop is bounded, so no further re-run — going on to the verdict`);
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

    if (next.name === 'tests') {
      // A spec that is there but not marked finished: its author was cut off (a session limit, a crash) before the end.
      const started = fs.existsSync(p.tests) && specFiles(p.tests).some((f) => !/TODO\(test\)/.test(fs.readFileSync(f, 'utf8')));
      return started
        ? handOver('heldout-test-author', `Finish the tests for ${key}: a draft is there but was not marked finished. Check it against the contract, complete it, and end with: ${H} lint ${key} --allow-unhardened --no-health --draft-finished`, 'its author did not reach the end')
        : handOver('heldout-test-author', `Write the tests for ${key}`, 'from the reviewed contract, without a browser');
    }

    if (next.name === 'freeze') {
      if (heldout('lint', key, '--allow-unhardened', '--no-health') !== 0) return handOver('heldout-test-author', `Fix the lint errors in the tests of ${key} (${H} lint ${key} --allow-unhardened --no-health)`, 'the draft is frozen only when it lints clean');
      if (heldout('integrity', key, '--snapshot') !== 0 || !moved()) stuck('the draft could not be frozen');
      continue;
    }

    if (next.name === 'harden') {
      // Nothing to discover and no harden run yet: the stability run is the hardening, no subagent needed.
      const known = listRuns(p.runs).length ? undefined : knownMechanics(cfg, key);
      if (known) {
        console.log(`\n• nothing left to discover that a run can't settle: ${known.use.size - known.fresh.size} journey(s) the tests call are proven as they are${known.fresh.size ? `, ${known.fresh.size} are new with this story` : ''} — proving stability without the hardener (a guess left in a test, or in a new journey's own acting statement, is settled by the run)`);
        const done = hardenFromRegistry(cfg, key, known, heldout);
        if (done === true && moved()) continue;
        return handOver('heldout-hardener', `Harden the tests for ${key}`, done === true ? next.detail : done);
      }
      return handOver('heldout-hardener', `Harden the tests for ${key}`, listRuns(p.runs).length ? next.detail : 'the draft is frozen');
    }

    if (next.name === 'run') {
      if (heldout('integrity', key) !== 0) return handOver('heldout-hardener', `Integrity is not preserved for ${key}: restore what the tests expect, or report the assertion whose implementation is wrong (${H} integrity ${key})`);
      heldout('run', key, '--label', 'eval', '--quiet');
      if (!moved()) stuck('the evaluation run did not start (preflight)');
      continue;
    }

    if (next.name === 'triage') {
      const evalRuns = evalRunsOf(p.runs);
      const lastEval = evalRuns.at(-1)!;
      // The automatic classification first (a re-run takes over the decisions confirmed for identical failures): the
      // triager starts from it.
      if (!fs.existsSync(path.join(p.runs, lastEval, 'triage.json'))) { heldout('triage', key, '--run', lastEval, ...(evalRuns.length > 1 ? ['--carry-from', 'auto'] : [])); if (!moved()) return handOver('heldout-triager', `Triage run ${lastEval} of ${key}`); continue; }
      return handOver('heldout-triager', `Triage run ${lastEval} of ${key}`, 'each failure reproduced live before it is called a defect');
    }

    if (next.name === 'verdict') {
      // Confirmed script defects are repaired and the suite run again before the verdict, at most three times.
      const evalRuns = evalRunsOf(p.runs);
      const triageFile = path.join(p.runs, evalRuns.at(-1) ?? '', 'triage.json');
      const scriptDefects = fs.existsSync(triageFile) ? readJson<{ entries: { scenario: string; status: string; final?: { category: string; rationale?: string } }[] }>(triageFile).entries.filter((e) => e.status !== 'passed' && e.final?.category === 'SCRIPT_DEFECT') : [];
      if (scriptDefects.length && repairsTried(p.runs, evalRuns) <= MAX_REPAIRS) {
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
}
