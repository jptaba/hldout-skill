/**
 * Phase 6 — Triage failures: SCRIPT defect vs APPLICATION defect (vs environment / flaky / unknown).
 *
 *   heldout triage <KEY> [--run 02-eval]
 *        → writes runs/<run>/triage.json + triage.md with an evidence-based *automatic* classification.
 *
 *   heldout triage <KEY> --carry-from <run|auto>
 *        → reuse confirmed decisions for failures with an identical signature ("auto" = latest earlier run with confirmations)
 *
 *   heldout triage <KEY> --set SCN-002[,SCN-003…] (or SCN-007: every failing row of that outline) --category APPLICATION_DEFECT --severity Major \
 *        --rationale "..." [--evidence "..."] [--action "..."] [--title "..."]
 *        → records the evaluator's *confirmed* classification after live re-investigation.
 *
 * The automatic pass never has the last word on an APPLICATION_DEFECT: policy requires a live
 * reproduction in the AUT (tier 1/2/3 browser, or api-probe.ts for API) before --set confirms it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, assertIssueKey, evalPaths, flagStr, listRuns, loadConfig, main, parseArgs, readJson, rel, writeFile } from './lib/config';
import { CATEGORIES, classify, parseError, relevantExchange, type ApiExchange, type AutoClassification, type Category, type ParsedError } from './lib/classify';
import { SCENARIO_ID_RE, baseScenarioId, normaliseTestType, readFeature } from './lib/gherkin';
import { readContract, requestContracts } from './lib/contract';
import { correlateAuthPrecondition, correlateDegradedEnvironment, mergeRepeats, signature, type HealthSample, type TriageEntry, type TriageReport } from './lib/triage-model';

export type { TriageEntry, TriageReport };

export type { Category };

// ---- Playwright JSON reporter shapes (subset) ----
interface PwError { message?: string; stack?: string }
interface PwStep { title: string; error?: PwError; steps?: PwStep[] }
interface PwAttachment { name: string; path?: string; body?: string; contentType: string }
interface PwResult { status: string; retry: number; errors?: PwError[]; error?: PwError; steps?: PwStep[]; attachments?: PwAttachment[] }
interface PwTest { status: 'expected' | 'unexpected' | 'flaky' | 'skipped'; results: PwResult[] }
interface PwSpec { title: string; file: string; tags?: string[]; tests: PwTest[] }
interface PwSuite { title: string; file?: string; specs?: PwSpec[]; suites?: PwSuite[] }

function* specsOf(suites: PwSuite[] = []): Generator<PwSpec> {
  for (const s of suites) { yield* s.specs ?? []; yield* specsOf(s.suites); }
}

function deepestFailingStep(steps: PwStep[] = []): string | undefined {
  for (const s of steps) {
    if (!s.error) continue;
    return deepestFailingStep(s.steps) ?? s.title;
  }
  return undefined;
}

const attachmentText = (a?: PwAttachment) => (!a ? '' : a.body ? Buffer.from(a.body, 'base64').toString('utf8')
  : a.path && fs.existsSync(a.path) ? fs.readFileSync(a.path, 'utf8') : '');

function buildReport(key: string, runName: string, resultsFile: string, scenarioFile: string, apiBasePath: string): TriageReport {
  const results = readJson<{ suites: PwSuite[] }>(resultsFile);
  const feature = readFeature(scenarioFile);
  const requests = requestContracts(readContract(path.dirname(scenarioFile)));
  const entries: TriageEntry[] = [];
  for (const spec of specsOf(results.suites)) {
    for (const t of spec.tests) {
      const last = t.results.at(-1);
      const failedAttempt = [...t.results].reverse().find((r) => r.status !== 'passed' && r.status !== 'skipped');
      const scenario = spec.title.match(SCENARIO_ID_RE)?.[1] ?? spec.title;
      const tags = (spec.tags ?? []).map((x) => (x.startsWith('@') ? x : `@${x}`));
      const scn = feature.scenarios.find((s) => s.id === baseScenarioId(scenario));
      const status = t.status === 'expected' ? 'passed' : t.status === 'unexpected' ? 'failed' : t.status;
      const entry: TriageEntry = {
        scenario, title: spec.title, file: spec.file, status,
        tags, requirementRefs: [...new Set([...tags.filter((x) => /^@AC-\d+$/.test(x)).map((x) => x.slice(1)), ...(scn?.acs ?? [])])],
        testType: normaliseTestType(tags.find((x) => x.startsWith('@type:'))?.slice(6)) ?? scn?.testType,
        layer: tags.find((x) => x.startsWith('@layer:'))?.slice(7) ?? scn?.layer,
        evidence: { attempts: t.results.length },
        otherFailures: [],
      };
      if ((status === 'failed' || status === 'flaky') && failedAttempt) {
        const messages = (failedAttempt.errors?.length ? failedAttempt.errors : [failedAttempt.error ?? {}]).map((x) => x.message ?? '').filter(Boolean);
        const parsed = messages.map(parseError);
        entry.error = parsed[0] ?? parseError('');
        entry.otherFailures = parsed.slice(1).map((x) => ({ headline: x.headline, reqTag: x.reqTag, expected: x.expected, received: x.received }));
        entry.failingStep = deepestFailingStep(failedAttempt.steps);
        const att = (name: RegExp) => failedAttempt.attachments?.find((a) => name.test(a.name) && a.path)?.path;
        entry.evidence.screenshot = att(/^screenshot$/) && rel(att(/^screenshot$/)!);
        entry.evidence.trace = att(/^trace$/) && rel(att(/^trace$/)!);
        const ctx = att(/^error-context$/);
        entry.evidence.errorContext = ctx && rel(ctx);
        // Only the page's ARIA tree is evidence — error-context.md also carries test source and call logs.
        const ctxText = ctx && fs.existsSync(ctx) ? fs.readFileSync(ctx, 'utf8') : '';
        let snapshot = ctxText.match(/# Page snapshot\s*```(?:yaml)?\r?\n([\s\S]*?)```/)?.[1] ?? '';
        if (!snapshot) snapshot = attachmentText(failedAttempt.attachments?.filter((a) => /^aria-snapshot .*failed/i.test(a.name)).at(-1));
        entry.evidence.snapshotExcerpt = snapshot ? snapshot.split('\n').slice(0, 60).join('\n') : undefined;
        const seedText = attachmentText(failedAttempt.attachments?.find((a) => a.name === 'seed-ledger'));
        if (seedText) { try { entry.evidence.seed = JSON.parse(seedText); } catch { /* ignore */ } }
        // Evidence = exchanges of the scenario itself; seed/cleanup plumbing ("[seed]"/"[cleanup]") is excluded.
        const apiAtts = failedAttempt.attachments?.filter((a) => a.name.startsWith('api-exchange ') && !/\[(seed|cleanup)\]/.test(a.name)) ?? [];
        entry.evidence.apiCalls = apiAtts.length || undefined;
        // Full request sequence (already redacted by the fixture) — lets a reviewer replay the finding step by step.
        const sequence = apiAtts.map((a) => { try { return JSON.parse(attachmentText(a)) as ApiExchange; } catch { return undefined; } })
          .filter((x): x is ApiExchange => Boolean(x));
        if (sequence.length) {
          entry.evidence.apiSequence = sequence;
          // A failing assertion on a page element is about the page: the API calls are context, none of them
          // "the one that contradicts the requirement" (unless the assertion names its call).
          const onPage = Boolean(entry.error.locator) && !/\b(GET|POST|PUT|PATCH|DELETE)\s+\//.test(entry.error.headline);
          if (!onPage) {
            const idx = relevantExchange(sequence, entry.error);
            entry.evidence.apiRelevantIndex = idx;
            entry.evidence.api = sequence[idx];
          }
        }
        // Precondition calls (API pre-steps) — kept separately so the verdict can show them as "run these first".
        const preSeq = (failedAttempt.attachments ?? []).filter((a) => a.name.startsWith('api-exchange ') && /\[seed\]/.test(a.name))
          .map((a) => { try { return JSON.parse(attachmentText(a)) as ApiExchange; } catch { return undefined; } })
          .filter((x): x is ApiExchange => Boolean(x));
        if (preSeq.length) entry.evidence.preSequence = preSeq;
        // A BLOCKED precondition that went through the API: the relevant exchange is the last seed call.
        // A transport error (no answer at all) has no exchange: the last seed call that did answer is not the culprit.
        const noAnswer = /socket hang up|ECONNRESET|ETIMEDOUT|ECONNREFUSED|EPIPE|ENOTFOUND|fetch failed/i.test(entry.error.message);
        if (!entry.evidence.api && preSeq.length && /\[SEED\]/.test(entry.error.message) && !noAnswer) {
          entry.evidence.api = preSeq.at(-1);
          entry.evidence.apiRelevantIndex = preSeq.length - 1;
        }
        entry.auto = classify(entry.error, { snapshot, flaky: status === 'flaky', api: entry.evidence.api, endpoints: [...feature.endpoints, ...feature.seedEndpoints], requestContracts: requests, apiBasePath });
        if (entry.auto.category === 'APPLICATION_DEFECT' && (scn?.needsClarification || scn?.assumes.length)) {
          entry.auto.signals.push(`${scn.id} rests on an unsettled reading (${scn.assumes.length ? `assumed ${scn.assumes.join(', ')}` : '@needs-clarification: the literal reading of an open question'}). Confirm what the application does as usual; the verdict then lists it as a question for the owner, not as a defect.`);
        }
        for (const o of entry.otherFailures) {
          entry.auto.signals.push(`Also failed: ${o.headline}${o.expected !== undefined ? ` — expected ${o.expected}, received ${o.received}` : ''}`);
        }
      }
      if (last?.status === 'skipped') entry.status = 'skipped';
      entries.push(entry);
    }
  }
  const merged = mergeRepeats(entries);
  entries.length = 0;
  entries.push(...merged);
  // Scenario dependencies (@depends:SCN-x): attach the dependency's status; a BLOCKED/failed dependant names its cause.
  for (const e of entries) {
    const deps = feature.scenarios.find((s) => s.id === baseScenarioId(e.scenario))?.depends ?? [];
    if (!deps.length) continue;
    e.evidence.dependsOn = deps.map((d) => ({ scenario: d, status: entries.filter((x) => baseScenarioId(x.scenario) === d).map((x) => x.status).find((st) => st !== 'passed') ?? (entries.some((x) => baseScenarioId(x.scenario) === d) ? 'passed' : 'not run') }));
    const broken = e.evidence.dependsOn.filter((d) => d.status !== 'passed');
    if (e.auto && broken.length) {
      e.auto.signals.unshift(e.auto.category === 'BLOCKED'
        ? `Blocked: depends on ${broken.map((d) => `${d.scenario} (${d.status})`).join(', ')} — resolve that scenario first; this one was not evaluated.`
        : `Note: depends on ${broken.map((d) => `${d.scenario} (${d.status})`).join(', ')}, but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.`);
    }
  }
  entries.sort((a, b) => a.scenario.localeCompare(b.scenario, undefined, { numeric: true }));
  // Run-level environment correlation (pre/post healthchecks recorded by run.ts).
  const metaFile = path.join(path.dirname(resultsFile), 'run-meta.json');
  const meta = fs.existsSync(metaFile) ? readJson<{ preflight?: { health?: HealthSample[] } | string; postflight?: { health?: HealthSample[] } }>(metaFile) : {};
  const health = [...(typeof meta.preflight === 'object' ? meta.preflight.health ?? [] : []), ...(meta.postflight?.health ?? [])];
  const environmentNote = [correlateDegradedEnvironment(entries, health), correlateAuthPrecondition(entries)].filter(Boolean).join(' ') || undefined;
  const count = (s: TriageEntry['status']) => entries.filter((e) => e.status === s).length;
  return {
    key, run: runName, generatedAt: new Date().toISOString(),
    summary: { total: entries.length, passed: count('passed'), failed: count('failed'), flaky: count('flaky'), skipped: count('skipped') },
    ...(environmentNote ? { environmentNote } : {}),
    entries,
  };
}

const short = (v: unknown, n = 600) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s && s.length > n ? `${s.slice(0, n)}…` : s ?? ''; };

/** @param runDir absolute run folder — evidence links are written relative to it (triage.md lives there). */
export function renderTriageMd(r: TriageReport, runDir: string): string {
  const link = (projRel: string) => path.relative(runDir, path.join(ROOT, projRel)).split(path.sep).join('/');
  const out = [`# Triage — ${r.key} / run ${r.run}`, '', `Generated ${r.generatedAt}`, '', ...(r.environmentNote ? [`> ⚠️ **Environment:** ${r.environmentNote}`, ''] : []),
    `**${r.summary.passed}/${r.summary.total} passed**, ${r.summary.failed} failed, ${r.summary.flaky} flaky, ${r.summary.skipped} skipped.`, '',
    '| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |', '| --- | --- | --- | --- | --- | --- | --- |',
    ...r.entries.map((e) => `| ${e.scenario} | ${e.testType ?? '-'} | ${e.requirementRefs.join(', ')} | ${e.status} | ${e.auto?.category ?? '-'} | ${e.auto?.confidence ?? '-'} | ${e.final ? `**${e.final.category}**` : e.auto ? '⏳ pending' : '-'} |`), ''];
  for (const e of r.entries.filter((x) => x.error)) {
    const api = e.evidence.api;
    out.push(`## ${e.title}`, '', `- Requirement refs: ${e.requirementRefs.join(', ') || '-'} · type: ${e.testType ?? '-'} · layer: ${e.layer ?? '-'}`, `- Failing step: ${e.failingStep ?? '-'}`,
      ...(e.evidence.repeats ? [`- Repeats: failed **${e.evidence.repeats.failed} of ${e.evidence.repeats.runs}**`] : []),
      `- Error: \`${e.error!.headline}\``, ...(e.error!.locator ? [`- Locator: \`${e.error!.locator}\``] : []),
      ...(e.error!.expected !== undefined ? [`- Expected: \`${e.error!.expected}\``] : []), ...(e.error!.received !== undefined ? [`- Received: \`${e.error!.received}\``] : []),
      ...(api ? [`- Relevant API exchange (${e.evidence.apiCalls ? '' : 'precondition '}#${(e.evidence.apiRelevantIndex ?? 0) + 1} of ${e.evidence.apiCalls ?? e.evidence.preSequence?.length ?? 1}): \`${api.request.method} ${api.request.url}\` → **${api.response.status}**`,
        `  - request body: \`${short(api.request.body)}\``, `  - response body: \`${short(api.response.body)}\``] : []),
      `- Evidence: ${[e.evidence.screenshot && `[screenshot](${link(e.evidence.screenshot)})`, e.evidence.trace && `trace: \`npx playwright show-trace ${e.evidence.trace}\``, e.evidence.errorContext && `[error-context](${link(e.evidence.errorContext)})`].filter(Boolean).join(' · ') || '-'}`,
      '', `**Auto: ${e.auto!.category} (${e.auto!.confidence})**`, '', ...e.auto!.signals.map((s) => `- ${s}`), '', `Next: ${e.auto!.next}`, '');
    if (e.final) out.push(`**Confirmed: ${e.final.category}${e.final.severity ? ` / ${e.final.severity}` : ''}** — ${e.final.rationale}`, ...(e.final.action ? ['', `Action: ${e.final.action}`] : []), '');
  }
  return out.join('\n');
}

export { signature };

main(() => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const runs = listRuns(p.runs);
  const runName = flagStr(flags, 'run') ?? runs.at(-1);
  if (!runName) throw new Error(`No runs under ${rel(p.runs)}`);
  const runDir = path.join(p.runs, runName);
  const triageJson = path.join(runDir, 'triage.json');

  const setId = flagStr(flags, 'set');
  if (setId) {
    const report = readJson<TriageReport>(triageJson);
    // One decision per root cause: "SCN-007.1,SCN-007.2", or an outline's base id "SCN-007" for all its failing rows.
    const entries = setId.split(',').map((x) => x.trim()).flatMap((id) => {
      const hit = report.entries.filter((e) => e.scenario === id || (e.error && baseScenarioId(e.scenario) === id));
      if (!hit.length) throw new Error(`${id} not in ${rel(triageJson)} (have: ${report.entries.filter((e) => e.error).map((e) => e.scenario).join(', ')})`);
      return hit;
    });
    const category = flagStr(flags, 'category') as Category;
    if (!CATEGORIES.includes(category)) throw new Error(`--category must be one of ${CATEGORIES.join(', ')}`);
    const rationale = flagStr(flags, 'rationale');
    if (!rationale) throw new Error('--rationale is required (explain the evidence).');
    const decision = { category, severity: flagStr(flags, 'severity'), title: flagStr(flags, 'title'), rationale,
      evidence: flagStr(flags, 'evidence'), action: flagStr(flags, 'action'), confirmedAt: new Date().toISOString() };
    for (const e of entries) e.final = { ...decision };
    writeFile(triageJson, `${JSON.stringify(report, null, 2)}\n`);
    writeFile(path.join(runDir, 'triage.md'), renderTriageMd(report, runDir));
    console.log(`✔ ${entries.map((e) => e.scenario).join(', ')} confirmed as ${category} in ${rel(triageJson)}`);
    return;
  }

  const report = buildReport(key, runName, path.join(runDir, 'results.json'), p.scenarios, new URL(cfg.aut.apiBaseURL ?? cfg.aut.baseURL).pathname);
  if (fs.existsSync(triageJson)) { // keep previously confirmed decisions for unchanged failures
    const prev = readJson<TriageReport>(triageJson);
    for (const e of report.entries) {
      const old = prev.entries.find((x) => x.scenario === e.scenario && x.status === e.status);
      if (old?.final && (e.status !== 'failed' || signature(old) === signature(e))) e.final = old.final;
    }
  }
  // --carry-from <run|auto>: reuse confirmed decisions from an earlier run, only for identical failure signatures.
  let carryFrom = flagStr(flags, 'carry-from');
  if (carryFrom === 'auto') {
    carryFrom = runs.filter((r) => r < runName && fs.existsSync(path.join(p.runs, r, 'triage.json'))
      && readJson<TriageReport>(path.join(p.runs, r, 'triage.json')).entries.some((x) => x.final)).at(-1);
    if (!carryFrom) console.log('  (no earlier run with confirmed decisions — nothing to carry)');
  }
  if (carryFrom) {
    const prev = readJson<TriageReport>(path.join(p.runs, carryFrom, 'triage.json'));
    for (const e of report.entries.filter((x) => x.status === 'failed' && !x.final)) {
      const old = prev.entries.find((x) => x.scenario === e.scenario && x.final && signature(x) === signature(e));
      if (old?.final) {
        e.final = { ...old.final, rationale: `${old.final.rationale.replace(/ \(Confirmed in run .*\)$/, '')} (Confirmed in run ${carryFrom}; identical failure signature in ${runName}.)` };
        console.log(`  ↻ ${e.scenario}: carried ${old.final.category} from ${carryFrom} (identical signature)`);
      }
    }
  }
  writeFile(triageJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(path.join(runDir, 'triage.md'), renderTriageMd(report, runDir));

  console.log(`Triage ${key} / ${runName}: ${report.summary.passed}/${report.summary.total} passed, ${report.summary.failed} failed, ${report.summary.flaky} flaky\n`);
  for (const e of report.entries.filter((x) => x.auto)) {
    // A confirmed decision is what counts: show it, not the automatic suggestion it replaced.
    const shown = e.final ? `${e.final.category.padEnd(20)} ✔ confirmed  ` : `${e.auto!.category.padEnd(20)} (${e.auto!.confidence.padEnd(6)}) ⏳ pending `;
    console.log(`  ${e.scenario.padEnd(10)} ${shown} ${e.error!.headline.slice(0, 80)}`);
  }
  console.log(`\n  ${rel(path.join(runDir, 'triage.md'))}`);
  // Failures an earlier run already confirmed, identically: say so, rather than asking for the investigation again.
  const earlier = carryFrom ? undefined : runs.filter((r) => r < runName && fs.existsSync(path.join(p.runs, r, 'triage.json'))
    && readJson<TriageReport>(path.join(p.runs, r, 'triage.json')).entries.some((x) => x.final)).at(-1);
  const same = earlier ? report.entries.filter((e) => e.status === 'failed' && !e.final && readJson<TriageReport>(path.join(p.runs, earlier, 'triage.json')).entries.some((x) => x.scenario === e.scenario && x.final && signature(x) === signature(e))) : [];
  if (same.length) console.log(`\n↻ ${same.map((e) => e.scenario).join(', ')}: the same failure${same.length > 1 ? 's were' : ' was'} confirmed in ${earlier} (identical signature). Reuse ${same.length > 1 ? 'those decisions' : 'that decision'}: npm run heldout -- triage ${key} --carry-from auto`);
  if (report.entries.some((x) => x.auto && !x.final && !same.includes(x))) console.log('\nNext: investigate each pending failure live (references/triage.md), then confirm with --set.');
});
