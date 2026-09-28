/** Triage data model + repeat merging (pure; unit tested). The CLI lives in scripts/triage.ts. */
import type { ApiExchange, AutoClassification, Category, ParsedError } from './classify';

export interface TriageEntry {
  scenario: string;
  title: string;
  file: string;
  status: 'passed' | 'failed' | 'flaky' | 'skipped';
  tags: string[];
  requirementRefs: string[];
  /** Test type from the taxonomy (@type:<t> on the test, else the scenario's). */
  testType?: string;
  layer?: string;
  failingStep?: string;
  error?: ParsedError;
  /** Further failures in the same attempt (e.g. several expect.soft). */
  otherFailures: { headline: string; reqTag?: string; expected?: string; received?: string }[];
  /** api = the exchange the failing assertion is about (apiRelevantIndex into apiSequence), not necessarily the last one. */
  evidence: {
    screenshot?: string; trace?: string; errorContext?: string; snapshotExcerpt?: string; api?: ApiExchange; apiSequence?: ApiExchange[];
    apiRelevantIndex?: number; apiCalls?: number; attempts: number;
    /** API calls made by preconditions (seed.create/step/once/until), in order — replayed before the scenario calls. */
    preSequence?: ApiExchange[];
    /** Scenarios this one depends on (@depends:SCN-x) and their status in the same run. */
    dependsOn?: { scenario: string; status: string }[];
    /** Present when the run used --repeat-each: how many repeats ran / failed, and the distinct failure causes. */
    repeats?: { runs: number; failed: number; causes: string[] };
    /** Seed ledger of the failing attempt: precondition data the test created (and whether it was cleaned up). */
    seed?: { tag: string; records: { label: string; kind?: string; created?: unknown; cleanup?: string; reused?: boolean; error?: string }[] };
  };
  auto?: AutoClassification;
  final?: { category: Category; severity?: string; title?: string; rationale: string; evidence?: string; action?: string; confirmedAt: string };
}

export interface TriageReport {
  key: string; run: string; generatedAt: string;
  summary: { total: number; passed: number; failed: number; flaky: number; skipped: number };
  /** Set when triage found the AUT degraded around the run (see correlateDegradedEnvironment). */
  environmentNote?: string;
  entries: TriageEntry[];
}


export interface HealthSample { url: string; ok: boolean; status?: number; ms: number; error?: string }

/**
 * Run-level environment correlation: if the AUT was measurably degraded around the run (a pre/post
 * healthcheck failed or took longer than slowMs) and ≥ 2 different tests failed on timeouts, those
 * timeout failures (auto NEEDS_INVESTIGATION / SCRIPT from "element not found") are re-labelled
 * ENVIRONMENT_ISSUE. Requirement assertions that received a concrete wrong value are never touched.
 */
export function correlateDegradedEnvironment(entries: TriageEntry[], health: HealthSample[], slowMs = 5000): string | undefined {
  const bad = health.filter((h) => !h.ok || h.ms > slowMs);
  if (!bad.length) return undefined;
  const isTimeout = (e: TriageEntry) => /Timeout \d+ms exceeded|Test timeout of/i.test(e.error?.message ?? e.error?.headline ?? '')
    && (e.error?.received === undefined || /element\(s\) not found/.test(e.error.received));
  // Failed AND flaky tests count (a degraded AUT often makes tests pass only on retry).
  const timedOut = (e: TriageEntry) => isTimeout(e)
    || e.otherFailures.some((o) => /Timeout \d+ms exceeded|Test timeout of/i.test(o.headline))
    || (e.evidence.repeats?.causes ?? []).some((c) => /Timeout \d+ms exceeded|Test timeout of/i.test(c));
  // Failed tests that timed out, and FLAKY tests of any kind: flaky while the AUT is measurably degraded = environment.
  const hit = (e: TriageEntry) => Boolean(e.auto) && e.auto!.category !== 'APPLICATION_DEFECT'
    && ((e.status === 'failed' && timedOut(e)) || e.status === 'flaky');
  const timeouts = entries.filter(hit);
  if (new Set(timeouts.map((e) => e.scenario)).size < 2) return undefined;
  const note = `AUT degraded around this run: ${bad.map((h) => `${h.url} ${h.ok ? `took ${h.ms} ms` : `failed (${h.error ?? h.status})`}`).join('; ')}; ${timeouts.length} different tests timed out.`;
  for (const e of timeouts) {
    if (e.auto!.category === 'BLOCKED') { e.auto!.signals.unshift(note); continue; } // stays BLOCKED (not evaluated), with the likely cause
    e.auto = { category: 'ENVIRONMENT_ISSUE', confidence: 'medium', signals: [note, ...(e.auto?.signals ?? []).map((s) => `(before correlation) ${s}`)],
      next: 'Re-run when the healthcheck is fast again. If the same tests still time out on a healthy AUT, investigate them individually.' };
  }
  return note;
}

/**
 * Run-level auth-precondition correlation: when an auth pre-step (seed.once/step of kind "auth") failed in
 * this run, the credentials/test data are suspect. Failures whose relevant request hits that same endpoint
 * are re-labelled NEEDS_INVESTIGATION (they look like app defects but are probably bad credentials), and
 * every other failure gets a warning signal.
 */
export function correlateAuthPrecondition(entries: TriageEntry[]): string | undefined {
  const authBlocked = entries.filter((e) => e.auto?.category === 'BLOCKED' && e.evidence.seed?.records.some((r) => r.kind === 'auth' && r.error));
  if (!authBlocked.length) return undefined;
  // Only the call the auth pre-step failed on (the last pre-step call before the [SEED] error) — not every
  // precondition call of that test (e.g. a booking seed made before it).
  const authCalls = new Set(authBlocked.map((e) => e.evidence.preSequence?.at(-1)).filter((x): x is NonNullable<typeof x> => Boolean(x))
    .map((x) => `${x.request.method} ${new URL(x.request.url).pathname}`));
  const note = `An auth pre-step failed in this run (${authBlocked.map((e) => e.scenario).join(', ')}${authCalls.size ? `; ${[...authCalls].join(', ')}` : ''}) — check the credentials in test-data.json / .env before attributing auth-related failures to the application.`;
  for (const e of entries.filter((x) => x.status === 'failed' && x.auto && x.auto.category !== 'BLOCKED')) {
    const call = e.evidence.api ? `${e.evidence.api.request.method} ${new URL(e.evidence.api.request.url).pathname}` : '';
    if (call && authCalls.has(call) && e.auto!.category === 'APPLICATION_DEFECT') {
      e.auto = { category: 'NEEDS_INVESTIGATION', confidence: 'low', signals: [note, `This failure is on the same endpoint (${call}) as the failed auth pre-step.`, ...e.auto!.signals.map((s) => `(before correlation) ${s}`)],
        next: 'Verify the credentials with api-probe.ts. Wrong credentials → SCRIPT (test data); correct credentials rejected → APPLICATION.' };
    } else {
      e.auto!.signals.unshift(note);
    }
  }
  return note;
}

/**
 * --repeat-each produces one entry per repeat. Merge them into one entry per test id:
 *   all passed → passed · all failed → failed (first failure's evidence) · mixed → FLAKY ("failed k of n").
 */
export function mergeRepeats(entries: TriageEntry[]): TriageEntry[] {
  const groups = new Map<string, TriageEntry[]>();
  for (const e of entries) groups.set(e.scenario, [...(groups.get(e.scenario) ?? []), e]);
  return [...groups.values()].map((g) => {
    if (g.length === 1) return g[0];
    const failedEs = g.filter((e) => e.status === 'failed' || e.status === 'flaky');
    const causes = [...new Set(failedEs.map((e) => `${e.auto?.category ?? '?'}: ${e.error?.headline.slice(0, 100) ?? ''}`))];
    const base = failedEs[0] ?? g[0];
    const merged: TriageEntry = { ...base, evidence: { ...base.evidence, repeats: { runs: g.length, failed: failedEs.length, causes } } };
    if (!failedEs.length) merged.status = 'passed';
    else if (failedEs.length < g.length && failedEs.every((e) => e.auto?.category === 'ENVIRONMENT_ISSUE')) {
      merged.status = 'flaky';
      merged.auto = { category: 'ENVIRONMENT_ISSUE', confidence: 'medium',
        signals: [`Failed ${failedEs.length} of ${g.length} repeats, every time with a network/availability error — the environment, not the test or the app.`, ...causes],
        next: 'Re-run at lower load (fewer workers/repeats) or when the AUT is healthy.' };
    } else if (failedEs.length < g.length) {
      merged.status = 'flaky';
      merged.auto = { category: 'FLAKY', confidence: 'medium',
        signals: [`Failed ${failedEs.length} of ${g.length} repeats — nondeterministic.`, ...causes.map((c) => `Failure cause seen: ${c}`)],
        next: 'Decide per cause: ENVIRONMENT (network/5xx under load) → re-run; missing synchronisation → SCRIPT (fix and repeat); the app itself intermittently wrong → APPLICATION.' };
    } else if (causes.length > 1) {
      merged.auto = { ...base.auto!, signals: [...(base.auto?.signals ?? []), `Failed all ${g.length} repeats with ${causes.length} different causes:`, ...causes] };
    }
    return merged;
  });
}


/**
 * Mask values a test generates per run (unique names, slugs, ids, timestamps) so that the same failure in the
 * next run has the same signature: "Heldout-irl8v63eb2-74248" → "Heldout-<id>-<n>". Short numbers such as
 * status codes (401) and AC ids are kept.
 */
export function maskVolatile(s?: string): string | undefined {
  return s?.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/g, '<ts>')
    .replace(/\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{6,}\b/g, '<id>')
    .replace(/\b\d{4,}\b/g, '<n>');
}

/**
 * Failure signature used to decide whether a confirmed decision still applies to a later run: the failure itself
 * (assertion, expected, received, locator), never what triage derived from it — a better triage must not drop a
 * human's confirmed decision.
 */
export const signature = (e: TriageEntry) => JSON.stringify([e.error?.reqTag, maskVolatile(e.error?.headline), maskVolatile(e.error?.expected), maskVolatile(e.error?.received), maskVolatile(e.error?.locator)]);

interface PwSpec { title: string; tests: { status: string; results: { error?: { message?: string } }[] }[] }
interface PwSuite { suites?: PwSuite[]; specs?: PwSpec[] }

/** Failed and flaky tests with the first line of their (last) error, for the compact run digest. */
export function failedTests(results: unknown): { title: string; error: string; flaky: boolean }[] {
  const specs = (s: PwSuite): PwSpec[] => [...(s.specs ?? []), ...(s.suites ?? []).flatMap(specs)];
  // eslint-disable-next-line no-control-regex
  const plain = (m = '') => m.replace(/\x1b\[[0-9;]*m/g, '').split('\n').find((l) => l.trim())?.trim().slice(0, 300) ?? '';
  return specs(results as PwSuite).flatMap((sp) => sp.tests.filter((t) => t.status === 'unexpected' || t.status === 'flaky').map((t) => ({
    title: sp.title,
    error: plain([...t.results].reverse().find((r) => r.error)?.error?.message),
    flaky: t.status === 'flaky',
  })));
}
