/**
 * Phase 6 — Render the verdict (verdict.md + verdict.json) from the final run's triage + run history.
 *
 *   heldout verdict <KEY> [--run 03-eval] [--evaluator "name"] [--exit-code]
 *     --exit-code: exit 0 PASS / PASS_WITH_WARNINGS, 1 FAIL, 2 INCONCLUSIVE (CI gate)
 *
 * Verdict rules: see verdict-rules.ts (INCONCLUSIVE on integrity violation → FAIL on confirmed
 * application defects → INCONCLUSIVE on unexplained failures → PASS_WITH_WARNINGS → PASS).
 * Application defects that share a root-cause title (the title given when confirming them in triage) are grouped.
 */
import fs from 'node:fs';
import path from 'node:path';
import { checkIntegrity, readFreeze, type IntegrityResult } from '../hardening/integrity-check';
import { allJourneys, journeyUse, journeysUsedBy, readRegistry, storyJourneys } from '../authoring/journeys/registry';
import { TEST_TYPES, baseScenarioId, readSuite, specFiles } from '../authoring/spec-model';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { ROOT, rel, writeFile } from '../core/files';
import { readHistory, recordEvent } from '../core/history';
import { NON_EVAL_RUN, evalPaths, evalRunsOf, journeyPaths, movedRunNote, runFile, runRaw } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';
import { comboLabel, oracleDigest, readContract, variantCombinations } from '../contract/contract-model';
import { injectionSuspects } from '../contract/evidence';
import type { Category } from '../run/classify';
import { curlFor, exchangeLine, rerunCommand } from '../triage/repro';
import { readDecisions, readRunRecord, type Decisions, type TriageEntry } from '../run/run-record';
import { decideVerdict, holdsUnderAnyReading, type Verdict } from './verdict-rules';

const BADGE: Record<Verdict, string> = { PASS: '✅ PASS', PASS_WITH_WARNINGS: '⚠️ PASS WITH WARNINGS', FAIL: '❌ FAIL', INCONCLUSIVE: '❔ INCONCLUSIVE' };
const SEVERITY_ORDER = ['Critical', 'Major', 'Minor', 'Trivial'];
const cat = (e: TriageEntry): Category | undefined => e.final?.category ?? e.auto?.category;
const esc = (s = '') => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Untrusted content: the requirement lines that read like instructions to an agent, for the reviewer to weigh. */
export function suspectSection(reqDir: string): string[] {
  const suspects = fs.existsSync(reqDir) ? injectionSuspects(reqDir) : [];
  if (!suspects.length) return [];
  return ['## Requirement lines that read like instructions to an agent', '', 'Treated as data: quoted and covered like any other line, never followed. Check whether the story was meant to say this.', '',
    '| Source | Line |', '| --- | --- |', ...suspects.map((l) => `| ${l.file}#L${l.line} | ${esc(l.text.trim().slice(0, 200))} |`), ''];
}
const short = (v: unknown, n = 500) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s && s.length > n ? `${s.slice(0, n)}…` : s ?? ''; };

function frontMatter(file: string): Record<string, string> {
  const m = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/) : null;
  return Object.fromEntries((m?.[1] ?? '').split(/\r?\n/).map((l) => l.split(/:\s(.*)/s)).filter((x) => x.length > 1).map(([k, v]) => [k.trim(), v.trim().replace(/^"(.*)"$/, '$1')]));
}

/**
 * How the shared journeys took part: how many the tests call, how many earlier stories had proven, and the journeys
 * that changed after the freeze (hardening may fix HOW a journey works; the tests keep WHAT is expected).
 */
function journeysLine(cfg: HeldoutConfig, p: ReturnType<typeof evalPaths>, scenarios: { id: string; code: string }[], integrity: IntegrityResult): string {
  const specs = specFiles(p.hardened);
  if (!journeysUsedBy(cfg, cfg.autId, specs).length) return 'none used';
  const calls = [...journeyUse(allJourneys(cfg, cfg.autId), specs, scenarios).keys()];
  const registry = readRegistry(cfg, cfg.autId).journeys;
  const earlier = calls.filter((id) => registry[id]?.proven?.by.some((s) => s !== path.basename(p.base))).length;
  const changed = integrity.journeysChanged ?? [];
  return [
    `${calls.length} journey(s) from ${rel(journeyPaths(cfg, cfg.autId).fixtures)}/ (${earlier} proven by earlier stories, ${calls.length - earlier} new to the registry)`,
    ...(changed.length ? [`${changed.length} journey(s) changed after the freeze: ${changed.slice(0, 5).join(', ')}${changed.length > 5 ? ', …' : ''}`] : []),
  ].join(' · ');
}

export const spec: CommandSpec = {
  name: 'verdict', group: 'Report', usage: 'KEY [--run NN-label] [--evaluator <name>] [--exit-code]',
  about: 'render verdict.md / verdict.json',
  flags: ['evaluator', 'exit-code', 'run'],
};

/** The script defects confirmed in runs before the final one (the triage loop at work), with their status now. */
export function repairedDefects(decisions: Decisions, finalRun: string, now: Pick<TriageEntry, 'scenario' | 'status'>[]) {
  return Object.keys(decisions).filter((r) => r < finalRun).sort().flatMap((r) => Object.entries(decisions[r])
    .filter(([, d]) => d.category === 'SCRIPT_DEFECT').map(([scenario, d]) => ({ run: r, scenario, d, now: now.find((x) => x.scenario === scenario)?.status ?? 'n/a' })));
}

/** Every run of the story, in order, as its history recorded it (the last line of a run name wins). */
export function runsOfHistory(file: string): { run: string; grep?: string; stats?: { passed?: number; failed?: number; flaky?: number } }[] {
  const byName = new Map<string, { run: string; grep?: string; stats?: { passed?: number; failed?: number; flaky?: number } }>();
  for (const e of readHistory(file)) if (e.event === 'run' && typeof e.run === 'string') byName.set(e.run, { run: e.run, grep: typeof e.grep === 'string' ? e.grep : undefined, stats: (e.stats ?? undefined) as never });
  return [...byName.values()].sort((a, b) => a.run.localeCompare(b.run, undefined, { numeric: true }));
}

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  // The final evaluation run's record holds its tests and their evidence; earlier runs are told by the story's history
  // (each run's result) and the triager's decisions (the script defects repaired): their records are not kept.
  // Non-evaluation runs (hardening dry-runs, single-test reproductions, robustness probes) never become the final run.
  // Nor does a run of some of the tests: a verdict needs the whole suite.
  const evaluations = evalRunsOf(p.runs);
  const finalRun = flagStr(flags, 'run') ?? evaluations.at(-1);
  if (!finalRun || !fs.existsSync(runFile(p, finalRun))) throw new Error(movedRunNote(p, finalRun) ? `No record of ${finalRun} in the record${movedRunNote(p, finalRun)}` : `No evaluation run yet (hardening runs don't count). Run: npm run heldout -- run ${key} --label eval`);
  const history = runsOfHistory(p.history);
  const runs = history.map((r) => r.run);
  // Runs are numbered 01, 02…; a number the history lacks means a run went unrecorded, and its result with it.
  const numbers = runs.map((r) => Number(r.split('-')[0])).filter(Number.isFinite);
  const missingRuns = numbers.length ? Array.from({ length: Math.max(...numbers) }, (_, i) => i + 1).filter((n) => !numbers.includes(n)) : [];
  if (missingRuns.length) console.log(`⚠ run(s) ${missingRuns.map((n) => String(n).padStart(2, '0')).join(', ')} are missing from the story's history: the verdict says so`);

  const tri = readRunRecord(runFile(p, finalRun));
  const meta = tri.meta;
  // The screenshot a finding shows is kept with the verdict: the run's raw output is scratch.
  const kept = new Map<TriageEntry, string>();
  const verdictDir = path.dirname(p.verdictMd);
  const keptScreenshot = (e: TriageEntry): string => {
    if (kept.has(e)) return kept.get(e)!;
    const src = e.evidence.screenshot && path.join(ROOT, e.evidence.screenshot);
    const dest = path.join(verdictDir, `${finalRun}-${e.scenario}.png`);
    if (src && fs.existsSync(src)) { fs.mkdirSync(verdictDir, { recursive: true }); fs.copyFileSync(src, dest); }
    kept.set(e, fs.existsSync(dest) ? rel(dest) : '');
    return kept.get(e)!;
  };
  const story = frontMatter(p.storyMd);
  const contract = readContract(p.contract);
  if (!contract) throw new Error(`No requirement contract for ${key} — phase 1b first: heldout contract ${key} --pack`);
  const feature = readSuite(p.hardened, contract);
  const freeze = readFreeze(p.freeze);
  const integrity = checkIntegrity(p.tests, p.hardened, freeze, oracleDigest(contract), storyJourneys(cfg, cfg.autId, specFiles(p.hardened)));
  const journeys = journeysLine(cfg, p, feature.scenarios, integrity);
  // Links in verdict.md are relative to its own folder.
  const link = (projRel?: string) => (projRel ? path.relative(path.dirname(p.verdictMd), path.join(ROOT, projRel)).split(path.sep).join('/') : '');

  const failures = tri.entries.filter((e) => e.status === 'failed');
  // A confirmed failure whose expectation rests on an unsettled reading is a question for the owner, not a defect: an
  // assumed oracle value (@assumes:G<n>), or the literal reading of an open question (@needs-clarification).
  const assumesOf = (id: string): string[] => {
    const sc = feature.scenarios.find((x) => x.id === baseScenarioId(id));
    if (!sc) return [];
    if (sc.assumes.length) return sc.assumes;
    const open = contract.gaps.filter((g) => g.kind === 'oracle' && g.resolution === 'open' && g.affects.some((a) => sc.acs.includes(a))).map((g) => g.id);
    return sc.needsClarification ? (open.length ? open.map((g) => `${g} (literal reading)`) : ['literal reading (@needs-clarification)']) : [];
  };
  // …unless the failure does not depend on the reading (a server error, or the triager said so).
  const whateverTheReading = (e: typeof failures[number]) => holdsUnderAnyReading({ anyReading: e.final?.anyReading, apiStatus: e.evidence.api?.response.status });
  const contradicted = failures.filter((e) => cat(e) === 'APPLICATION_DEFECT' && e.final && assumesOf(e.scenario).length && !whateverTheReading(e));
  const appDefects = failures.filter((e) => cat(e) === 'APPLICATION_DEFECT' && !contradicted.includes(e))
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.final?.severity ?? 'Minor') - SEVERITY_ORDER.indexOf(b.final?.severity ?? 'Minor') || a.scenario.localeCompare(b.scenario, undefined, { numeric: true }));
  const confirmedApp = appDefects.filter((e) => e.final);
  const flaky = tri.entries.filter((e) => e.status === 'flaky');
  const other = failures.filter((e) => (cat(e) !== 'APPLICATION_DEFECT' || !e.final) && !contradicted.includes(e));
  const covered = new Set(feature.scenarios.flatMap((s) => s.acs));
  const uncovered = feature.acs.filter((a) => !covered.has(a.id));
  // Setups (criterion × the values of its variants), from the tests that actually ran: their tags, rows resolved.
  const setups = feature.acs.flatMap((ac) => variantCombinations(contract, ac.id).map((combo) => {
    const es = tri.entries.filter((e) => e.tags.includes(`@${ac.id}`) && Object.entries(combo).every(([k, v]) => e.tags.includes(`@variant:${k}=${v}`)));
    const status = !es.length ? 'not tested' : es.some((e) => e.status === 'failed') ? 'failed' : es.some((e) => e.status === 'flaky') ? 'flaky' : 'passed';
    return { criterion: ac.id, setup: comboLabel(combo), status, tests: es.map((e) => e.scenario) };
  }));
  const untestedSetups = setups.filter((s) => s.status === 'not tested');
  const clarifications = feature.scenarios.filter((s) => s.needsClarification);
  // One that passed means the application meets the requirement as written: the question stays for the owner, but it
  // doesn't hold up acceptance. Only a clarification scenario that didn't pass is a warning.
  // A clarification scenario already counted as a reading the application contradicts is not counted twice.
  const unsettled = clarifications.filter((s) => tri.entries.some((e) => baseScenarioId(e.scenario) === s.id && e.status !== 'passed' && !contradicted.includes(e)));

  // Group confirmed defects by root cause (same confirmed title) → one APP id per root cause.
  const groups = new Map<string, TriageEntry[]>();
  for (const e of appDefects) {
    const k = e.final?.title ?? `${e.scenario}`;
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  const appIds = new Map<TriageEntry, string>();
  [...groups.values()].forEach((g, i) => g.forEach((e) => appIds.set(e, `APP-${i + 1}`)));

  // Script defects confirmed in any earlier run, hardening included (evidence the triage loop worked).
  const repaired = repairedDefects(readDecisions(p.decisions), finalRun, tri.entries);

  // An open question about a non-required oracle gap is for the owner's information: "not required" means the criteria
  // it touches can be evaluated without the answer (the reviewer confirmed that), so acceptance doesn't wait on it.
  // An open question about a required gap is a warning.
  // A question that names no gap of the contract is one the test author raised beyond the reviewed requirement (a type
  // the criteria don't state): for the owner's information too. Only the contract decides what acceptance waits on.
  const informational = (q: string) => {
    const ids = (q.match(/\bG\d+\b/g) ?? []).filter((id) => contract.gaps.some((g) => g.id === id));
    return !ids.length || ids.every((id) => contract.gaps.some((g) => g.id === id && g.kind === 'oracle' && !g.required));
  };
  // A question a @needs-clarification scenario tests (its literal reading) is not "untested".
  const testedLiterally = (q: string) => {
    const ids = q.match(/\bG\d+\b/g) ?? [];
    return ids.length > 0 && ids.every((id) => {
      const g = contract.gaps.find((x) => x.id === id);
      return g && feature.scenarios.some((s) => s.needsClarification && s.acs.some((a) => g.affects.includes(a)));
    });
  };
  const blockingQuestions = feature.openQuestions.filter((q) => !informational(q) && !testedLiterally(q));
  // …unless the application contradicts a reading of it: then the answer decides a criterion, and the owner is asked.
  const contradictedBy = (q: string) => (q.match(/\bG\d+\b/g) ?? []).some((id) => contradicted.some((e) => assumesOf(e.scenario).some((a) => a.startsWith(id))));
  const infoQuestions = feature.openQuestions.filter((q) => informational(q) && !contradictedBy(q));
  const unverifiedNfrs = (contract.nonFunctional ?? []).filter((n) => !feature.scenarios.some((s) => s.nfrs.includes(n.id)));
  const { verdict, reason: decided } = decideVerdict({
    integrity: integrity.status,
    confirmedAppDefects: [...groups.values()].filter((g) => g.some((e) => e.final)).map((g) => ({ refs: [...new Set(g.flatMap((e) => e.requirementRefs))] })),
    failures: failures.length - contradicted.length, contradictedAssumptions: contradicted.length,
    environmentFailures: failures.filter((e) => e.final?.category === 'ENVIRONMENT_ISSUE').length, skipped: tri.summary.skipped, flaky: flaky.length, uncoveredAcs: uncovered.length, clarifications: unsettled.length, openQuestions: blockingQuestions.length, unverifiedRequirements: unverifiedNfrs.length, untestedSetups: untestedSetups.length,
  });
  // Questions the criteria can be judged without don't change the verdict, but nobody should have to find them at the
  // end of the report: the first line of the verdict (and of the summary posted to the story) says they are there.
  const reason = infoQuestions.length
    ? `${decided} ${infoQuestions.length === 1 ? 'One question for the story\'s owner is' : `${infoQuestions.length} questions for the story's owner are`} listed under "Requirement gaps, assumptions and open questions"; no criterion waits on ${infoQuestions.length === 1 ? 'it' : 'them'}.`
    : decided;

  const acText = (id: string) => feature.acs.find((a) => a.id === id)?.text ?? '';
  const scenarioOf = (id: string) => feature.scenarios.find((x) => x.id === baseScenarioId(id));
  const sourceOf = (id: string) => {
    const sc = scenarioOf(id);
    return sc?.sources.length ? sc.sources.join('; ') : `story ${(sc?.acs ?? []).join(', ')}`;
  };
  /** Several tests' sources, each once: one that another already contains ("story.md#L28" in "story.md#L28 (status: G3)") is dropped. */
  const sourcesOf = (ids: string[]): string => {
    const all = [...new Set(ids.flatMap((id) => sourceOf(id).split('; ')))];
    return all.filter((s) => !all.some((o) => o !== s && o.includes(s))).join('; ');
  };
  /** The data a test created (to recreate before reproducing); lookups, sign-ins and readiness waits replay as P1…Pn. */
  const seededOf = (e: TriageEntry) => (e.evidence.seed?.records ?? []).filter((r) => r.error || !['pre-step', 'auth', 'readiness'].includes(r.kind ?? ''));
  const typeOf = (e: TriageEntry): string => e.testType ?? scenarioOf(e.scenario)?.testType ?? '-';
  /** What the AUT actually did, phrased as an observation. */
  const actualOf = (x: TriageEntry): string => x.error?.received
    ?? (/element(s) not found|waiting for|Timeout d+ms/i.test(x.error?.message ?? '') && x.error?.locator ? `element not found: ${x.error.locator}` : x.error?.headline ?? '-');
  /** Replayable request sequence of one failing test (curl per exchange, secrets as placeholders). */
  const apiReproduction = (x: TriageEntry): string[] => {
    const seq = x.evidence.apiSequence ?? (x.evidence.api ? [x.evidence.api] : []);
    const preSeq = x.evidence.preSequence ?? [];
    const preBlock = preSeq.length ? [
      `**API pre-steps: ${x.scenario}** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):`, '',
      ...preSeq.flatMap((ex, n) => [`P${n + 1}. \`${exchangeLine(ex)}\``, '', '   ```bash', ...curlFor(ex).split('\n').map((l) => `   ${l}`), '   ```', '']),
    ] : [];
    if (!seq.length) return preBlock;
    const rel = x.evidence.apiRelevantIndex ?? seq.length - 1;
    return [
      ...preBlock,
      `**Via the API: ${x.scenario}** (the exact requests the test sent, in order; secrets replaced by placeholders). Request ${rel + 1} (⟵) is the one that contradicts the requirement:`, '',
      ...seq.flatMap((ex, n) => [`${n + 1}. \`${exchangeLine(ex)}\`${n === rel ? ' ⟵' : ''}`, '', '   ```bash', ...curlFor(ex).split('\n').map((l) => `   ${l}`), '   ```', '']),
      `Observed response of request ${rel + 1} (${x.scenario}):`, '', '```json', short(seq[rel].response.body, 600), '```', '',
    ];
  };
  // The journey steps of the test (a case of a table, SCN-012.2, has its values in the test title).
  const stepsOf = (id: string) => feature.scenarios.find((s) => s.id === baseScenarioId(id))?.steps ?? [];
  const durationS = meta.stats ? Math.round(meta.stats.duration / 1000) : Math.round((Date.parse(meta.finishedAt) - Date.parse(meta.startedAt)) / 1000);
  const reqCount = integrity.files.reduce((n, f) => n + f.currentAssertions, 0);
  const tiersUsed = fs.existsSync(p.hardeningLog) ? fs.readFileSync(p.hardeningLog, 'utf8').match(/^\*\*Tiers? used:\*\*[ \t]*(\S.*)$/m)?.[1] : undefined; // same line only: an empty value is "not recorded"
  // A table cell: the first sentence, capped; the full account stays in the hardening log.
  const firstSentence = tiersUsed?.replace(/`/g, '').split(/(?<=\.)\s/)[0]; // no code spans: a cut must not break markdown
  const tierLine = firstSentence && firstSentence.length > 160 ? `${firstSentence.slice(0, 160).replace(/\s+\S*$/, '')}… (see hardening log)` : firstSentence;
  const s = tri.summary;
  const integrityCell = {
    PRESERVED: `✅ PRESERVED — ${reqCount} requirement assertions identical to the pre-hardening draft`,
    AMENDED: `✅ PRESERVED WITH ${integrity.amended.length} AUDITED AMENDMENT(S) — ${reqCount} requirement assertions; see "Assertion amendments"`,
    VIOLATED: `❌ VIOLATED — ${integrity.changed.length + integrity.removed.length} requirement assertion(s) changed/removed without amendment${integrity.contractChanged ? '; expected outcomes in the requirement contract changed after the freeze' : ''}${integrity.journeyAssertions?.length ? `; ${integrity.journeyAssertions.length} requirement assertion(s) inside journeys, outside the freeze` : ''}`,
    NO_DRAFT: '⚠️ NO_DRAFT — no frozen draft to compare',
  }[integrity.status];

  const md: string[] = [
    `# Held-out Evaluation Verdict — ${key}`, '',
    `> **Verdict: ${BADGE[verdict]}** — ${reason}`, '',
    '| | |', '| --- | --- |',
    `| Story | [${key}](${story.url ?? '#'}) — ${esc(story.summary ?? feature.title)} |`,
    `| Application under test | ${esc(cfg.aut.name)} (profile \`${cfg.autId}\`) — UI ${cfg.aut.baseURL}${cfg.aut.apiBaseURL && cfg.aut.apiBaseURL !== cfg.aut.baseURL ? ` · API ${cfg.aut.apiBaseURL}` : ''} |`,
    `| Final run | \`${finalRun}\` · ${meta.startedAt} · ${durationS}s |`,
    `| Tests | ${s.total} total · ${s.passed} passed · ${s.failed} failed · ${s.flaky} flaky · ${s.skipped} skipped (from ${feature.scenarios.length} scenarios) |`,
    `| Held-out integrity | ${integrityCell} |`,
    ...(meta.preflight === 'skipped' ? ['| ⚠️ Preflight | **skipped** for the final run (--skip-preflight): the traceability lint and AUT healthcheck were not enforced |'] : []),
    `| Hardening | ${esc(tierLine ?? 'not recorded: the hardening log has no "Tiers used" line')} |`,
    `| Journeys | ${esc(journeys)} |`,
    ...(missingRuns.length ? [`| ⚠️ Run history | run(s) ${missingRuns.map((n) => String(n).padStart(2, '0')).join(', ')} were deleted: their results are not part of this record |`] : []),
    `| Evaluator | ${esc(flagStr(flags, 'evaluator') ?? 'Opus — heldout-evaluator skill')} |`,
    `| Generated | ${new Date().toISOString()} |`, '',
  ];

  md.push('> This verdict is the evaluator\'s **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.', '');

  if (appDefects.length) {
    md.push('## Findings summary', '', '| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |', '| --- | --- | --- | --- | --- | --- | --- |');
    for (const [title, g] of groups) {
      const f = g[0].final;
      md.push(`| ${appIds.get(g[0])} | ${f?.severity ?? 'TBD'} | ${[...new Set(g.flatMap((e) => e.requirementRefs))].join(', ')} | ${[...new Set(g.map(typeOf))].join(', ')} | ${esc(f ? title : `${title} (unconfirmed)`)} | ${g.map((e) => e.scenario).join(', ')} | ☐ confirm · ☐ reject · ☐ clarify |`);
    }
    md.push('');
  }

  md.push(`## Findings: suspected application defects (${groups.size} root cause(s), ${appDefects.length} failing test(s))`, '');
  if (!appDefects.length) md.push('_None — the application behaved as the requirement specifies in every executed scenario._', '');
  for (const [title, g] of groups) {
    const e = g[0];
    const f = e.final;
    const api = e.evidence.api;
    md.push(`### ${appIds.get(e)} · ${g.map((x) => x.scenario).join(', ')} · ${[...new Set(g.flatMap((x) => x.requirementRefs))].join(', ')} — ${esc(f ? title : e.title.replace(/^SCN-[\d.]+:\s*/, ''))}`, '',
      ...(f ? [] : ['> ⚠️ **Unconfirmed**: automatic classification only, not yet reproduced live. Does not count toward FAIL.', '']),
      '| | |', '| --- | --- |',
      `| Suggested severity | ${f?.severity ?? 'TBD'} |`,
      ...[...new Set(g.flatMap((x) => x.requirementRefs))].map((ac) => `| Requirement ${ac} | ${esc(acText(ac))} |`),
      `| Requirement source | ${esc(sourcesOf(g.map((x) => x.scenario)))} |`,
      `| Test type · layer | ${[...new Set(g.map(typeOf))].join(', ')} · ${[...new Set(g.map((x) => x.layer ?? scenarioOf(x.scenario)?.layer ?? '-'))].join(', ')} |`,
      ...g.map((x) => `| ${x.scenario}: expected (requirement) → actual (AUT) | \`${esc(x.error?.expected ?? '-')}\` → \`${esc(actualOf(x))}\` |`),
      ...g.flatMap((x) => (x.otherFailures ?? []).map((o) => `| ${x.scenario}: also failed | ${esc(o.headline)}${o.expected !== undefined ? ` — \`${esc(short(o.expected, 120))}\` → \`${esc(short(o.received, 160))}\`` : ''} |`)),
      `| Failing step | ${esc(e.failingStep ?? '-')} |`,
      `| Evaluator classification | ${f ? `APPLICATION_DEFECT (reproduced live${e.auto && e.auto.category !== 'APPLICATION_DEFECT' ? `; automatic triage said ${e.auto.category}, overridden after investigation` : ''})` : `auto: ${e.auto?.category} (${e.auto?.confidence})`} |`, '',
      '#### How to reproduce', '',
      ...(seededOf(e).length ? [
        `**Preconditions the test seeded** (tag \`${e.evidence.seed?.tag}\`; recreate equivalent data before reproducing):`, '',
        ...seededOf(e).map((r) => `- ${esc(r.label)}: \`${esc(short(r.created ?? '-', 160))}\` · cleanup: ${r.cleanup ?? 'pending'}${r.error ? ` (${esc(r.error)})` : ''}`), ''] : []),
      '**Manually (the test\'s steps):**', '', ...stepsOf(e.scenario).map((st, n) => `${n + 1}. ${st}`), '',
      ...g.flatMap((x) => apiReproduction(x)),
      '**Automated re-run of the failing test(s):**', '', '```bash', ...g.map((x) => rerunCommand(key, x.scenario)), '```', '',
      '#### Evidence', '',
      ...(!api && keptScreenshot(e) ? [`![${e.scenario} at the moment of failure](${link(keptScreenshot(e))})`, ''] : []),
      ...[e.evidence.snapshotExcerpt && `- The page at the failure (its accessibility tree) is in the run's record: ${rel(runFile(p, finalRun))}, test ${e.scenario}`,
        e.evidence.trace && fs.existsSync(path.join(ROOT, e.evidence.trace)) && `- Step-by-step trace, while the run's raw output is kept: \`npx playwright show-trace ${e.evidence.trace}\``,
        f?.evidence && `- Live re-check by the evaluator: ${esc(f.evidence)}`].filter(Boolean) as string[], '',
      `**Evaluator's analysis:** ${esc(f?.rationale ?? e.auto?.signals.join(' ') ?? '')}`, '',
      '**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification', '');
  }

  md.push(`## Script defects found and repaired (${repaired.length})`, '');
  if (!repaired.length) md.push('_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._', '');
  else {
    md.push('| Found in run | Test | Symptom | Diagnosis | Fix applied | Final run |', '| --- | --- | --- | --- | --- | --- |',
      ...repaired.map(({ run, scenario, d, now }) => `| \`${run}\` | ${scenario} | ${esc(d.failure?.slice(0, 120) ?? '-')} | ${esc(d.rationale)} | ${esc(d.action ?? '-')} | ${now === 'passed' ? '✅ passed' : now} |`), '');
  }

  if (integrity.amended.length) {
    md.push('## Assertion amendments (audited)', '', 'Fixes to how a requirement assertion was *implemented*. What it requires is unchanged. Each was approved with a reason before the official run.', '',
      '| Assertion | Draft | Amended | Reason |', '| --- | --- | --- | --- |',
      ...integrity.amended.map((a) => `| ${esc(a.assertion)} | \`${esc(a.draft)}\` | \`${esc(a.current)}\` | ${esc(a.reason)} |`), '');
  }

  md.push(...suspectSection(p.requirement));

  const refreezes = freeze?.refreezes ?? [];
  if (refreezes.length) {
    md.push('## Draft re-freezes (audited)', '', `The frozen draft was re-created after its first freeze, for example after a requirement revision. Each re-freeze has a logged reason; the draft it replaced is kept in [freeze.json](${link(rel(p.freeze))}).`, '',
      '| When | Reason | REQ changes absorbed | Draft it replaced |', '| --- | --- | --- | --- |',
      ...refreezes.map((r) => `| ${r.at} | ${esc(r.reason)} | ${[r.absorbed.added.length && `${r.absorbed.added.length} added`, r.absorbed.changed.length && `${r.absorbed.changed.length} changed`, r.absorbed.removed.length && `${r.absorbed.removed.length} removed`, r.absorbed.constantsChanged.length && 'constants block changed'].filter(Boolean).join(', ') || 'none'} | frozen ${r.previous.frozenAt} |`), '');
  }

  if (other.length || flaky.length) {
    md.push(`## Other findings (${other.length + flaky.length})`, '', '| Test | Status | Classification | Detail |', '| --- | --- | --- | --- |',
      ...[...other, ...flaky].map((e) => `| ${e.scenario} | ${e.status} | ${cat(e)}${e.final ? '' : ' (unconfirmed)'} | ${esc(e.final?.rationale ?? e.auto?.next ?? '')}${cat(e) === 'BLOCKED' && e.evidence.dependsOn?.some((d) => d.status !== 'passed') ? ` · **blocked by** ${e.evidence.dependsOn.filter((d) => d.status !== 'passed').map((d) => `${d.scenario} (${d.status})`).join(', ')}` : ''} |`), '');
  }

  md.push('## Test results', '', '| Test | Title | Criteria | Type | Result | Classification |', '| --- | --- | --- | --- | --- | --- |',
    ...tri.entries.map((e) => `| ${e.scenario} | ${esc(e.title.replace(/^SCN-[\d.]+:\s*/, ''))} | ${e.requirementRefs.join(', ')} | ${typeOf(e)} | ${e.status === 'passed' ? '✅ passed' : e.status === 'flaky' ? '⚠️ flaky' : e.status === 'skipped' ? '⏭ skipped' : '❌ failed'} | ${e.status === 'passed' ? '-' : `${cat(e)}${e.final ? '' : ' (auto)'}${appIds.has(e) ? ` · ${appIds.get(e)}` : ''}`} |`), '');

  md.push('## Requirement coverage', '', '| Criterion | Requirement | Tests | Result |', '| --- | --- | --- | --- |');
  for (const ac of feature.acs) {
    const es = tri.entries.filter((e) => e.requirementRefs.includes(ac.id));
    const res = !es.length ? '⚠️ not covered' : es.some((e) => e.status === 'failed' && cat(e) === 'APPLICATION_DEFECT' && e.final && !contradicted.includes(e)) ? '❌ not met'
      : es.some((e) => contradicted.includes(e)) ? '❔ reading contradicted (the owner decides)' : es.some((e) => e.status === 'failed') ? '❔ inconclusive' : '✅ met';
    const ids = es.map((e) => e.scenario);
    const compact = ids.length > 6 ? `${[...new Set(ids.map(baseScenarioId))].join(', ')} (${ids.length} tests)` : ids.join(', ');
    md.push(`| ${ac.id} | ${esc(ac.text)} | ${compact || '-'} | ${res} |`);
  }
  md.push('');

  // Traceability: requirement → source → scenario → type/layer → executed tests → result → defect.
  md.push('## Traceability matrix', '',
    'Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario\'s test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).', '',
    '| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
  const traceability = feature.acs.map((ac) => ({
    criterion: ac.id, text: ac.text,
    scenarios: feature.scenarios.filter((x) => x.acs.includes(ac.id)).map((sc) => {
      const es = tri.entries.filter((e) => baseScenarioId(e.scenario) === sc.id);
      const failedEs = es.filter((e) => e.status === 'failed');
      const result = !es.length ? 'not run' : failedEs.some((e) => appIds.has(e) && e.final) ? 'fails requirement'
        : failedEs.some((e) => contradicted.includes(e)) ? 'reading contradicted' : failedEs.length ? 'inconclusive' : es.some((e) => e.status === 'flaky') ? 'flaky' : 'meets requirement';
      return {
        id: sc.id, title: sc.title, type: sc.testType ?? null, layer: sc.layer ?? null, sources: sc.sources.length ? sc.sources : ['story'],
        passed: es.filter((e) => e.status === 'passed').length, total: es.length, result,
        defects: [...new Set(failedEs.map((e) => appIds.get(e)).filter((x): x is string => Boolean(x)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        tests: es.map((e) => ({ id: e.scenario, status: e.status, defect: appIds.get(e) ?? null })),
      };
    }),
  }));
  const ICON: Record<string, string> = { 'fails requirement': '❌', 'reading contradicted': '❔', inconclusive: '❔', flaky: '⚠️', 'meets requirement': '✅', 'not run': '⚠️' };
  for (const t of traceability) {
    if (!t.scenarios.length) { md.push(`| **${t.criterion}** | - | ⚠️ no scenario | - | - | 0/0 | not covered | - |`); continue; }
    t.scenarios.forEach((sc, i) => md.push(`| ${i === 0 ? `**${t.criterion}**` : '↳'} | ${esc(sc.sources.join('; '))} | ${sc.id} ${esc(sc.title)} | ${sc.type ?? '-'} | ${sc.layer ?? '-'} | ${sc.passed}/${sc.total} | ${ICON[sc.result]} ${sc.result} | ${sc.defects.join(', ') || '-'} |`));
  }
  md.push('');

  // The setups the story requires each criterion to be checked in (its variants), and how each fared.
  if (setups.length) {
    const SETUP_ICON: Record<string, string> = { passed: '✅', failed: '❌', flaky: '⚠️', 'not tested': '⚠️' };
    md.push('## Setups', '',
      `The story requires these criteria to be checked in each setup (${(contract.variants ?? []).map((v) => `${v.name}: ${v.values.map((x) => x.id).join(', ')}`).join('; ')}). ${untestedSetups.length ? `**${untestedSetups.length} of ${setups.length} were not tested.**` : `All ${setups.length} were tested.`}`, '',
      '| Criterion | Setup | Result | Tests |', '| --- | --- | --- | --- |',
      ...setups.map((s) => `| ${s.criterion} | ${esc(s.setup)} | ${SETUP_ICON[s.status]} ${s.status} | ${s.tests.join(', ') || '-'} |`), '');
  }

  // In the taxonomy's order, most specific first.
  const types = [...new Set(tri.entries.map(typeOf))]
    .sort((a, b) => (TEST_TYPES as readonly string[]).indexOf(a) - (TEST_TYPES as readonly string[]).indexOf(b));
  const coverageByType = types.map((t) => {
    const es = tri.entries.filter((e) => typeOf(e) === t);
    return {
      type: t, scenarios: new Set(es.map((e) => baseScenarioId(e.scenario))).size, tests: es.length,
      passed: es.filter((e) => e.status === 'passed').length, failed: es.filter((e) => e.status === 'failed').length,
      flaky: es.filter((e) => e.status === 'flaky').length,
      defects: [...new Set(es.map((e) => appIds.get(e)).filter((x): x is string => Boolean(x)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    };
  });
  md.push('## Coverage by test type', '', '| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |', '| --- | --- | --- | --- | --- | --- | --- |',
    ...coverageByType.map((c) => `| ${c.type} | ${c.scenarios} | ${c.tests} | ${c.passed} | ${c.failed} | ${c.flaky} | ${c.defects.join(', ') || '-'} |`), '');

  const nfrs = contract.nonFunctional ?? [];
  if (nfrs.length) {
    md.push('## Non-functional requirements', '', '| Requirement | Source | Verified by |', '| --- | --- | --- |',
      ...nfrs.map((n) => {
        const by = feature.scenarios.filter((s) => s.nfrs.includes(n.id)).map((s) => s.id);
        return `| ${n.id}: ${esc(n.text)} | ${n.source} | ${by.length ? by.join(', ') : '⚠ not verified by this evaluation: the owner decides how it is accepted'} |`;
      }), '');
  }

  const contractGaps = contract.gaps;
  if (feature.openQuestions.length || clarifications.length || feature.assumptions.length || contractGaps.length || contradicted.length) {
    md.push('## Requirement gaps, assumptions and open questions', '');
    if (contractGaps.length) {
      const how: Record<string, string> = { 'found-in-requirement': 'found elsewhere in the requirement', 'found-in-config': 'project configuration', 'discovered-in-aut': 'discovered from the AUT (mechanics only)', 'provided-by-user': 'answered by the story\'s owner', assumed: 'assumed', open: '❓ open' };
      md.push(`**Elements the story did not state, and how they were filled** ([contract.json](${link(rel(p.contract))})):`, '',
        '| Gap | Missing element | Kind | Affects | Resolution |', '| --- | --- | --- | --- | --- |',
        ...contractGaps.map((g) => `| ${g.id} | ${esc(g.element)} | ${g.kind === 'oracle' ? 'expected behaviour' : 'how to exercise'} | ${g.affects.join(', ')} | ${how[g.resolution] ?? g.resolution}${g.value ? `: ${esc(g.value)}` : ''} |`), '');
    }
    const poQuestions = feature.openQuestions.filter((q) => !infoQuestions.includes(q));
    // How each question was handled: tested under an assumption, covered by an assumption, tested literally, or not at all.
    const handled = (q: string) => {
      const ids: string[] = q.match(/\bG\d+\b/g) ?? [];
      const byAssumption = feature.scenarios.filter((s) => s.assumes.some((g) => ids.includes(g))).map((s) => s.id);
      if (byAssumption.length) return ` _(tested under the assumption below: ${byAssumption.join(', ')})_`;
      if (ids.length && ids.every((id) => feature.assumptions.some((a) => new RegExp(`^${id}\\b`).test(a)))) return ' _(handled by an assumption below)_';
      return testedLiterally(q) ? ' _(its literal reading is tested: see the scenarios needing clarification)_' : ' _(not tested)_';
    };
    if (poQuestions.length) md.push('**Open questions for the PO:**', '', ...poQuestions.map((q) => `- ❓ ${q}${handled(q)}`), '');
    if (infoQuestions.length) md.push('**For the owner\'s information** (questions the criteria can be judged without: gaps the review marked not required, and what the tests found the criteria leave unsaid; they don\'t affect the verdict):', '', ...infoQuestions.map((q) => `- ℹ️ ${q}`), '');
    if (clarifications.length) md.push('**Scenarios needing clarification** (each tests the literal reading of an open question):', '', ...clarifications.map((c) => `- ${c.id}: ${c.title}${unsettled.includes(c) ? ' — did not pass'
        : contradicted.some((e) => baseScenarioId(e.scenario) === c.id) ? ' — did not pass: the application contradicts the literal reading (see "Readings the application contradicts")'
        : ' — passed: the application meets the literal reading'}`), '');
    if (feature.assumptions.length) md.push('**Assumptions the evaluation made:**', '', ...feature.assumptions.map((a) => `- ${a}`), '');
    if (contradicted.length) md.push('**Readings the application contradicts** (the requirement does not settle these: an assumed value, or the literal reading of an open question; not reported as defects, the owner decides):', '',
      '| Test | Rests on | Expected (by that reading) | Actual |', '| --- | --- | --- | --- |',
      ...contradicted.map((e) => `| ${e.scenario} | ${assumesOf(e.scenario).join(', ')} | ${esc(e.error?.expected ?? '-')} | ${esc(actualOf(e))} |`), '');
  }
  if (feature.observations.length) {
    md.push('## Observations outside the acceptance criteria', '',
      'Seen while evaluating; no criterion states them, so they do not affect the verdict. The owner decides whether they matter:', '',
      ...feature.observations.map((o) => `- 🔎 ${o}`), '');
  }

  md.push('## How this verdict was produced', '',
    `1. The requirement (the story's title, description and acceptance criteria, the images they show and the Confluence pages they link) was fetched from Jira and turned into a requirement contract ([contract.json](${link(rel(p.contract))})): every criterion quoted from its source, the endpoints, error cases and gaps, checked by an independent reviewer.`,
    '2. Playwright TypeScript tests (UI and API) were written from the contract **only**, with no access to the AUT source or developer tests. Each test is tagged with the criteria it proves, its test type and the requirement source it comes from; expected values were copied verbatim from the requirement. Their steps call the shared actions of the application (how to reach pages and call endpoints, never what the application answers).',
    '3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only, in the tests and in the journeys they call. Expected outcomes were never aligned with AUT behaviour (integrity check above).',
    '4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.',
    ...(repaired.length ? ['5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.', ''] : ['5. No script defect needed repairing after hardening. This verdict reflects the final run.', '']),
    '| Run | Passed | Failed | Flaky |', '| --- | --- | --- | --- |',
    ...history.map(({ run: r, grep, stats: st }) => {
      const note = r === finalRun ? ' (final)' : /^\d+-harden/.test(r) ? ' (hardening dry-run)' : NON_EVAL_RUN.test(r) || grep ? ' (not an evaluation run: a reproduction, a repair check or some of the tests)' : ' (superseded by a later run)';
      return `| \`${r}\`${note} | ${st?.passed ?? '-'} | ${st?.failed ?? '-'} | ${st?.flaky ?? '-'} |`;
    }), '',
    '## Artifacts', '',
    `- Requirement: [story.md](${link(rel(p.storyMd))}) · contract: [contract.json](${link(rel(p.contract))}) · review: [review.json](${link(rel(p.review))})`,
    `- Tests: the frozen draft [${rel(p.tests)}/](${link(rel(p.tests))}/) ([freeze.json](${link(rel(p.freeze))})) · as hardened and run [${rel(p.hardened)}/](${link(rel(p.hardened))}/) · hardening: [hardening.md](${link(rel(p.hardeningLog))})`,
    `- Journeys: ${rel(journeyPaths(cfg, cfg.autId).fixtures)}/ · registry: ${rel(journeyPaths(cfg, cfg.autId).registry)}`,
    `- Final run: [${finalRun}.json](${link(rel(runFile(p, finalRun)))}) (its tests and the evidence of its failures; every run's result is in the history) · triage: [decisions.json](${link(rel(p.decisions))})`,
    `- History of the evaluation: [history.jsonl](${link(rel(p.history))})`,
    ...(fs.existsSync(path.join(runRaw(p, finalRun), 'html')) ? [`- HTML report, while the run's raw output is kept: \`npx playwright show-report ${rel(path.join(runRaw(p, finalRun), 'html'))}\``] : []), '');

  const out = md.join('\n');
  writeFile(p.verdictMd, out);
  const json = {
    key, verdict, reason, finalRun, generatedAt: new Date().toISOString(), autId: cfg.autId, aut: cfg.aut, summary: s,
    integrity: integrity.status, amendments: integrity.amended.length, journeys,
    applicationDefects: [...groups.entries()].map(([title, g]) => ({
      id: appIds.get(g[0]), title: g[0].final ? title : g[0].title, testType: typeOf(g[0]), source: sourcesOf(g.map((x) => x.scenario)), confirmed: Boolean(g[0].final), severity: g[0].final?.severity ?? null,
      criteria: [...new Set(g.flatMap((e) => e.requirementRefs))], tests: g.map((e) => e.scenario),
      expected: g[0].error?.expected ?? null, actual: actualOf(g[0]),
      rationale: g[0].final?.rationale ?? null, liveCheck: g[0].final?.evidence ?? null,
      steps: stepsOf(g[0].scenario), api: g[0].evidence.api ?? null,
      screenshot: keptScreenshot(g[0]) || null, apiSequence: g[0].evidence.apiSequence ?? null,
      reproduce: g.map((x) => rerunCommand(key, x.scenario)),
    })),
    // Confirmed failures whose expectation rests on an unsettled reading: questions for the owner, not defects.
    contradictedReadings: contradicted.map((e) => ({
      test: e.scenario, title: e.final?.title ?? e.title, criteria: e.requirementRefs, restsOn: assumesOf(e.scenario),
      expected: e.error?.expected ?? null, actual: actualOf(e), rationale: e.final?.rationale ?? null,
    })),
    scriptDefectsRepaired: repaired.map(({ run, scenario, d }) => ({ run, scenario, action: d.action ?? null })),
    uncoveredCriteria: uncovered.map((a) => a.id),
    coverageByType,
    traceability, setups,
    openQuestions: feature.openQuestions,
    observations: feature.observations,
    verdictFile: rel(p.verdictMd),
  };
  writeFile(p.verdictJson, `${JSON.stringify(json, null, 2)}\n`);
  recordEvent(p.history, 'verdict', {
    verdict, finalRun, integrity: integrity.status, summary: s, applicationDefects: json.applicationDefects.length,
    scriptDefectsRepaired: repaired.length, openQuestions: feature.openQuestions.length, uncoveredCriteria: json.uncoveredCriteria,
  });
  console.log(`Verdict for ${key}: ${BADGE[verdict]}\n  ${reason}\n  → ${rel(p.verdictMd)}\n  → ${rel(p.verdictJson)}`);
  if (flags['exit-code']) process.exit({ PASS: 0, PASS_WITH_WARNINGS: 0, FAIL: 1, INCONCLUSIVE: 2 }[verdict]);
}
