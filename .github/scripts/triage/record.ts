/**
 * The digest of a run's raw Playwright results into its record's tests: one line for a test that passed; for one that
 * didn't, the parsed error, the failing step, the page's ARIA excerpt, the API exchanges it made, its seed ledger and
 * an automatic classification. `heldout run` writes it into the run's record; triage, the verdict and every later
 * review read the record, never the raw output.
 */
import fs from 'node:fs';
import { allJourneys, journeysOfFiles, journeysUsedBy } from '../authoring/journeys/registry';
import { SCENARIO_ID_RE, baseScenarioId, normaliseTestType, readSuite, specFiles, type Endpoint } from '../authoring/spec-model';
import { readJson, rel } from '../core/files';
import { evalPaths, journeyPaths } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';
import { readContract, requestContracts } from '../requirement/contract-model';
import { classify, parseError, relevantExchange, type ApiExchange } from './classify';
import { correlateAuthPrecondition, correlateDegradedEnvironment, isRace, mergeRepeats, type HealthSample, type TriageEntry, type TriageReport } from './triage-model';

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

/** The calls the story's journeys (with their files' helpers) make: plumbing, like the spec's SEED-ENDPOINT lines. */
function journeyEndpoints(cfg: HeldoutConfig, specs: string[]): Endpoint[] {
  const used = journeysUsedBy(cfg, cfg.autId, specs);
  return journeysOfFiles(allJourneys(cfg, cfg.autId), used, journeyPaths(cfg, cfg.autId).base).flatMap((j) => (j.endpoints ?? []).map((e) => {
    const [method, p] = e.split(' ');
    return { method, path: p, note: `journey ${j.id}` };
  }));
}

/**
 * An answer's body as the record keeps it: whole up to `limit` characters, otherwise its start, marked as cut. The
 * classification has already read the whole body; the record keeps what a person needs to see what came back.
 */
function bounded(x: ApiExchange, limit: number): ApiExchange {
  const body = x.response?.body;
  const text = typeof body === 'string' ? body : JSON.stringify(body ?? null);
  if (text.length <= limit) return x;
  return { ...x, response: { ...x.response, body: `${text.slice(0, limit)}… [${text.length - limit} more characters, cut in the run record]` } };
}

/** Every test of a run's raw results, with the evidence and the automatic classification of each failure. */
export function digestRun(cfg: HeldoutConfig, key: string, runName: string, resultsFile: string, health: HealthSample[]): TriageReport {
  const p = evalPaths(cfg, key);
  const apiBasePath = new URL(cfg.aut.apiBaseURL ?? cfg.aut.baseURL).pathname;
  const results = readJson<{ suites: PwSuite[] }>(resultsFile);
  const contract = readContract(p.contract);
  const feature = readSuite(p.hardened, contract);
  const plumbing = [...feature.seedEndpoints, ...journeyEndpoints(cfg, specFiles(p.hardened))];
  const requests = requestContracts(contract);
  const entries: TriageEntry[] = [];
  for (const spec of specsOf(results.suites)) {
    for (const t of spec.tests) {
      const last = t.results.at(-1);
      const failedAttempt = [...t.results].reverse().find((r) => r.status !== 'passed' && r.status !== 'skipped');
      const scenario = spec.title.match(SCENARIO_ID_RE)?.[1] ?? spec.title;
      const tags = (spec.tags ?? []).map((x) => (x.startsWith('@') ? x : `@${x}`));
      const scn = feature.scenarios.find((s) => s.id === baseScenarioId(scenario));
      const testType = normaliseTestType(tags.find((x) => x.startsWith('@type:'))?.slice(6)) ?? scn?.testType;
      const race = isRace(t.status, testType, (failedAttempt?.errors?.length ? failedAttempt.errors : [failedAttempt?.error ?? {}]).map((x) => x.message ?? ''));
      const status = t.status === 'expected' ? 'passed' : t.status === 'unexpected' || race ? 'failed' : t.status;
      const entry: TriageEntry = {
        scenario, title: spec.title, file: spec.file, status,
        tags, requirementRefs: [...new Set([...tags.filter((x) => /^@AC-\d+$/.test(x)).map((x) => x.slice(1)), ...(scn?.acs ?? [])])],
        testType,
        layer: tags.find((x) => x.startsWith('@layer:'))?.slice(7) ?? scn?.layer,
        evidence: { attempts: t.results.length },
        otherFailures: [],
      };
      if ((status === 'failed' || status === 'flaky') && failedAttempt) {
        const messages = (failedAttempt.errors?.length ? failedAttempt.errors : [failedAttempt.error ?? {}]).map((x) => x.message ?? '').filter(Boolean);
        const parsed = messages.map(parseError);
        entry.error = parsed[0] ?? parseError('');
        entry.otherFailures = parsed.slice(1).map((x) => ({ headline: x.headline, reqTag: x.reqTag, expected: x.expected, received: x.received }));
        // A test of several criteria (a composition) fails the criteria whose [REQ AC-n] assertions failed, not all it is tagged with.
        const failedAcs = [...new Set(parsed.flatMap((x) => x.reqTag?.match(/\bAC-\d+\b/g) ?? []))];
        if (failedAcs.length) entry.requirementRefs = failedAcs;
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
        entry.auto = classify(entry.error, { snapshot, flaky: status === 'flaky', api: entry.evidence.api, endpoints: [...feature.endpoints, ...plumbing], requestContracts: requests, apiBasePath });
        if (entry.auto.category === 'APPLICATION_DEFECT' && (scn?.needsClarification || scn?.assumes.length)) {
          entry.auto.signals.push(`${scn.id} rests on an unsettled reading (${scn.assumes.length ? `assumed ${scn.assumes.join(', ')}` : '@needs-clarification: the literal reading of an open question'}). Confirm what the application does as usual; the verdict then lists it as a question for the owner, not as a defect.`);
        }
        if (race) entry.auto.signals.unshift(`Concurrency: the invariant broke on attempt ${t.results.indexOf(failedAttempt) + 1} of ${t.results.length} and held on a retry. Intermittent is how a race shows; reproduce the burst live before confirming.`);
        for (const o of entry.otherFailures) {
          entry.auto.signals.push(`Also failed: ${o.headline}${o.expected !== undefined ? ` — expected ${o.expected}, received ${o.received}` : ''}`);
        }
        // The record keeps the start of long answers: the exchange the failure is about at more length than the rest.
        if (entry.evidence.apiSequence) entry.evidence.apiSequence = entry.evidence.apiSequence.map((x) => bounded(x, x === entry.evidence.api ? 8000 : 2000));
        if (entry.evidence.api) entry.evidence.api = bounded(entry.evidence.api, 8000);
        if (entry.evidence.preSequence) entry.evidence.preSequence = entry.evidence.preSequence.map((x) => bounded(x, 1000));
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
  // Run-level environment correlation (the health checks before and after the run).
  const environmentNote = [correlateDegradedEnvironment(entries, health), correlateAuthPrecondition(entries)].filter(Boolean).join(' ') || undefined;
  const count = (s: TriageEntry['status']) => entries.filter((e) => e.status === s).length;
  return {
    key, run: runName, generatedAt: new Date().toISOString(),
    summary: { total: entries.length, passed: count('passed'), failed: count('failed'), flaky: count('flaky'), skipped: count('skipped') },
    ...(environmentNote ? { environmentNote } : {}),
    entries,
  };
}
