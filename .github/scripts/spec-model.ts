/**
 * Reads the traceability of a story's held-out specs (tests/*.spec.ts). The tests are written straight from the
 * reviewed requirement contract, so the specs carry everything a scenario file would:
 *   test('SCN-003: <title>', { tag: ['@AC-3', '@type:negative', '@layer:api'] }, …)   one scenario per test
 *   test(`SCN-004.${i + 1}: …`, …) in a loop                                           a table of cases (SCN-004.1 … .n)
 *   // from story AC-3, linked/confluence-1-api.md §Errors                             requirement source(s), above the test
 *   await journey.step('Given …' / 'When …' / 'Then …', …)                              the journey's steps
 *   // ASSUMPTION: … / // OPEN-QUESTION: … / // OBSERVATION: …                         surfaced in the verdict
 *   // SEED-ENDPOINT: METHOD /path — why                                               plumbing-only endpoints
 * The acceptance criteria and the declared endpoints come from the contract itself.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { RequirementContract } from './contract-model';

/**
 * Test-type taxonomy. Every test declares exactly one main type, @type:<t> (it drives triage and the verdict's counts),
 * and any number of @also:<t>, other types it also gives evidence for (shown, never counted twice). Aliases are
 * normalised. Ordered from the most specific to the most general: when a test fits two types, the earlier one is its
 * main type.
 */
export const TEST_TYPES = ['concurrency', 'idempotency', 'security', 'boundary', 'contract', 'composition', 'integration', 'accessibility', 'negative', 'functional'] as const;
export type TestType = typeof TEST_TYPES[number];
const TYPE_ALIASES: Record<string, TestType> = { positive: 'functional', happy: 'functional', a11y: 'accessibility', e2e: 'integration', 'cross-layer': 'integration', schema: 'contract', validation: 'negative', auth: 'security', race: 'concurrency', parallel: 'concurrency', workflow: 'composition', chain: 'composition' };
export function normaliseTestType(raw?: string): TestType | undefined {
  if (!raw) return undefined;
  const t = raw.toLowerCase();
  return (TEST_TYPES as readonly string[]).includes(t) ? (t as TestType) : TYPE_ALIASES[t];
}

export interface AcceptanceCriterion { id: string; text: string }
export interface Endpoint { method: string; path: string; note?: string }
export interface Scenario {
  id: string;
  title: string;
  tags: string[];
  acs: string[];
  priority?: string;
  /** Normalised @type:<t>, the main type; undefined when missing/unknown (lint error). */
  testType?: TestType;
  rawType?: string;
  /** Every @type: tag as written (more than one is a lint error: the others go in @also:). */
  rawTypes: string[];
  /** @also:<t>, normalised: other types the test also gives evidence for. */
  also: TestType[];
  /** @also:<t> values that are not in the taxonomy (lint error). */
  rawAlsoUnknown: string[];
  /** @layer:ui|api|e2e */
  layer?: string;
  /** @depends:SCN-x — scenarios whose success this one's preconditions rely on. */
  depends: string[];
  /** Requirement sources from the '// from …' comment(s) right above the test. */
  sources: string[];
  /** The journey.step titles, in order. */
  steps: string[];
  needsClarification: boolean;
  /** @assumes:G<n> — the expectation rests on an assumed oracle value (a contract gap), not on the requirement. */
  assumes: string[];
  /** @NFR-n — the contract's non-functional requirements this scenario verifies. */
  nfrs: string[];
  /** A table of cases: tests SCN-nnn.1 … .n. */
  outline: boolean;
  /** How many test() calls declare this id (more than one, without case numbers, is a duplicate). */
  declarations: number;
  /** Spec file (project-relative path is up to the caller). */
  file: string;
  /** The source of its test() call(s): what it calls. */
  code: string;
}
export interface Suite {
  title: string;
  acs: AcceptanceCriterion[]; endpoints: Endpoint[]; seedEndpoints: Endpoint[];
  assumptions: string[]; openQuestions: string[]; observations: string[];
  scenarios: Scenario[];
  files: string[];
}

/** "SCN-006.3" → "SCN-006" */
export const baseScenarioId = (id: string) => id.replace(/\.\d+$/, '');
export const SCENARIO_ID_RE = /^(SCN-\d+(?:\.\d+)?)/;

export const specFiles = (dir: string): string[] => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.spec.ts')).sort().map((f) => path.join(dir, f))
  : []);

const COMMENT = (label: string) => new RegExp(`^\\s*(?:\\/\\/|\\*)\\s*${label}:\\s*(.+?)\\s*(?:\\*\\/)?$`);
const ENDPOINT_LINE = /^([A-Z]+)\s+(\S+)\s*(?:[—-]+\s*(.*))?$/;
/** test('SCN-001: title', …) / test(`SCN-004.${i + 1}: title`, …) — the id, an optional case suffix, the title. */
const TEST_CALL = /\btest(?:\.\w+)?\(\s*([`'"])(SCN-\d+)(\.\$\{[^}]*\}|\.\d+)?:?\s*((?:(?!\1)[^\\]|\\.)*)\1/g;
const STEP_CALL = /\bjourney\.step\(\s*([`'"])((?:(?!\1)[^\\]|\\.)*)\1/g;

const unescape = (s: string) => s.replace(/\\(['"`\\])/g, '$1');

/** One spec file's scenarios and its comment lines. */
function readSpec(file: string, into: Suite): void {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);
  for (const line of lines) {
    for (const [label, list] of [['ASSUMPTION', into.assumptions], ['OPEN-QUESTION', into.openQuestions], ['OBSERVATION', into.observations]] as const) {
      const m = line.match(COMMENT(label));
      if (m) list.push(m[1]);
    }
    const sep = line.match(COMMENT('SEED-ENDPOINT'))?.[1].match(ENDPOINT_LINE);
    if (sep) into.seedEndpoints.push({ method: sep[1], path: sep[2], note: sep[3] });
  }
  const lineAt = (index: number) => src.slice(0, index).split('\n').length - 1;
  const calls = [...src.matchAll(TEST_CALL)];
  calls.forEach((m, i) => {
    const id = m[2];
    const start = m.index ?? 0;
    const end = calls[i + 1]?.index ?? src.length;
    // Tags: the { tag: [...] } (or tag: '@x') of this call, before its body starts.
    const head = src.slice(start, Math.min(end, src.indexOf('=>', start) === -1 ? end : src.indexOf('=>', start)));
    const list = head.match(/\btag:\s*\[([^\]]*)\]/)?.[1] ?? head.match(/\btag:\s*(['"`]@[^'"`]+['"`])/)?.[1] ?? '';
    const tags = [...list.matchAll(/['"`](@[^'"`]+)['"`]/g)].map((t) => t[1]);
    // Sources: the "// from …" lines directly above the call (other comment lines in between are fine).
    const sources: string[] = [];
    for (let l = lineAt(start) - 1; l >= 0; l--) {
      const text = lines[l].trim();
      if (!text.startsWith('//')) break;
      const from = text.match(/^\/\/\s*from\s+(.+)$/i);
      if (from) sources.unshift(from[1].trim());
    }
    const code = src.slice(start, end);
    const steps = [...code.matchAll(STEP_CALL)].map((s) => unescape(s[2]));
    const outline = Boolean(m[3]);
    const known = into.scenarios.find((s) => s.id === id);
    if (known) {
      known.code += `\n${code}`;
      known.declarations += outline && known.outline ? 0 : 1;
      known.tags = [...new Set([...known.tags, ...tags])];
      if (!known.steps.length) known.steps = steps;
      if (!known.sources.length) known.sources = sources;
      return;
    }
    into.scenarios.push({
      id,
      title: unescape(m[4]).replace(/\s*\(\$\{[^}]*\}[^)]*\)\s*$/, '').trim(),
      tags,
      acs: [],
      rawTypes: [],
      also: [],
      rawAlsoUnknown: [],
      depends: [],
      sources,
      steps,
      needsClarification: false,
      assumes: [],
      nfrs: [],
      outline,
      declarations: 1,
      file,
      code,
    });
  });
}

/** Tag-derived fields, once every declaration of a scenario has been read. */
function fromTags(s: Scenario): void {
  const tags = s.tags;
  const type = tags.find((t) => t.startsWith('@type:'))?.slice(6);
  s.acs = tags.filter((t) => /^@AC-\d+$/.test(t)).map((t) => t.slice(1));
  s.priority = tags.find((t) => t.startsWith('@priority:'))?.slice(10) ?? tags.find((t) => /^@P[1-3]$/.test(t))?.slice(1);
  s.rawType = type;
  s.testType = normaliseTestType(type);
  s.rawTypes = tags.filter((t) => t.startsWith('@type:')).map((t) => t.slice(6));
  const also = tags.filter((t) => t.startsWith('@also:')).map((t) => t.slice(6));
  s.also = [...new Set(also.map(normaliseTestType).filter((t): t is TestType => Boolean(t)))];
  s.rawAlsoUnknown = also.filter((t) => !normaliseTestType(t));
  s.layer = tags.find((t) => t.startsWith('@layer:'))?.slice(7);
  s.depends = tags.filter((t) => t.startsWith('@depends:')).map((t) => t.slice(9));
  s.needsClarification = tags.includes('@needs-clarification');
  s.assumes = tags.filter((t) => /^@assumes:G\d+$/.test(t)).map((t) => t.slice(9));
  s.nfrs = tags.filter((t) => /^@NFR-\d+$/.test(t)).map((t) => t.slice(1));
}

/** The story's suite: its specs' scenarios, with the criteria and endpoints of its contract. */
export function readSuite(testsDir: string, contract?: RequirementContract): Suite {
  const suite: Suite = {
    title: contract?.title ?? '',
    acs: (contract?.acceptanceCriteria ?? []).map((a) => ({ id: a.id, text: a.text })),
    endpoints: (contract?.endpoints ?? []).map((e) => ({ method: e.method.toUpperCase(), path: e.path, note: e.request })),
    seedEndpoints: [], assumptions: [], openQuestions: [], observations: [], scenarios: [], files: specFiles(testsDir),
  };
  for (const f of suite.files) readSpec(f, suite);
  suite.scenarios.forEach(fromTags);
  suite.scenarios.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return suite;
}

/**
 * Match "/api/room/7" against declared templates like "/api/room/{id}". Declared paths may be relative to the API
 * base URL: with basePath "/shop/services", "/shop/services/rooms/7" also matches "/rooms/{id}".
 */
export function matchEndpoint(endpoints: Endpoint[], method: string, pathname: string, basePath = ''): Endpoint | undefined {
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  const full = norm(pathname);
  const base = norm(basePath);
  const candidates = [full, ...(base !== '/' && full.startsWith(`${base}/`) ? [full.slice(base.length)] : [])];
  return endpoints.find((e) => e.method === method.toUpperCase() && candidates.some((c) =>
    new RegExp(`^${norm(e.path).replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{[^}]+\\?\}|:[A-Za-z_]+/g, '[^/]+')}$`).test(c)));
}
