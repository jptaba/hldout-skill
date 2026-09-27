/**
 * Lightweight reader for the evaluator's scenario format (Gherkin with ID/AC tags).
 * Not a full Gherkin parser — it understands exactly the conventions in references/scenario-format.md:
 *   # AC-n: <text>                 acceptance criteria (verbatim)
 *   # ENDPOINT: METHOD /path/{id}  API endpoints declared by the requirement
 *   # SEED-ENDPOINT: METHOD /path    plumbing-only endpoints used to seed / clean up data
 *   # ASSUMPTION: … / # OPEN-QUESTION: …  surfaced in the verdict
 *   @SCN-nnn @AC-n @type:<t> …     scenario tags; Scenario Outline + Examples → tests SCN-nnn.1 … .n
 *   # from <source> …              requirement source(s) of the next scenario (story section / attachment)
 */
import fs from 'node:fs';

/** Test-type taxonomy — every scenario declares exactly one @type:<t> (aliases are normalised). */
export const TEST_TYPES = ['functional', 'negative', 'boundary', 'security', 'idempotency', 'performance', 'accessibility', 'integration', 'contract', 'usability', 'compatibility', 'resilience'] as const;
export type TestType = typeof TEST_TYPES[number];
const TYPE_ALIASES: Record<string, TestType> = { positive: 'functional', happy: 'functional', a11y: 'accessibility', e2e: 'integration', 'cross-layer': 'integration', schema: 'contract', perf: 'performance', validation: 'negative', auth: 'security' };
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
  /** Normalised @type:<t>; undefined when missing/unknown (lint error). */
  testType?: TestType;
  rawType?: string;
  /** @layer:ui|api|e2e */
  layer?: string;
  /** @depends:SCN-x — scenarios whose success this one's preconditions rely on. */
  depends: string[];
  /** Requirement sources from the '# from …' comment(s) right above the scenario. */
  sources: string[];
  steps: string[];
  needsClarification: boolean;
  outline: boolean;
  /** Examples rows (header first) for Scenario Outlines. */
  examples: string[][];
}
export interface FeatureDoc {
  feature: string; story?: string;
  acs: AcceptanceCriterion[]; endpoints: Endpoint[]; seedEndpoints: Endpoint[]; assumptions: string[]; openQuestions: string[];
  background: string[]; scenarios: Scenario[];
}

/** "SCN-006.3" → "SCN-006" */
export const baseScenarioId = (id: string) => id.replace(/\.\d+$/, '');
export const SCENARIO_ID_RE = /^(SCN-\d+(?:\.\d+)?)/;

const cells = (line: string) => line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function readFeature(file: string): FeatureDoc {
  const doc: FeatureDoc = { feature: '', acs: [], endpoints: [], seedEndpoints: [], assumptions: [], openQuestions: [], background: [], scenarios: [] };
  if (!fs.existsSync(file)) return doc;
  let pendingTags: string[] = [];
  let current: Scenario | undefined;
  let inBackground = false;
  let inExamples = false;
  let pendingSources: string[] = [];
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    const ac = line.match(/^#\s*(AC-\d+)\s*:\s*(.+)$/);
    if (ac) { doc.acs.push({ id: ac[1], text: ac[2] }); continue; }
    const ep = line.match(/^#\s*ENDPOINT:\s*([A-Z]+)\s+(\S+)\s*(?:[—-]+\s*(.*))?$/);
    if (ep) { doc.endpoints.push({ method: ep[1], path: ep[2], note: ep[3] }); continue; }
    // Plumbing-only endpoints used to seed/clean up data (not part of the requirement's contract).
    const sep = line.match(/^#\s*SEED-ENDPOINT:\s*([A-Z]+)\s+(\S+)\s*(?:[—-]+\s*(.*))?$/);
    if (sep) { doc.seedEndpoints.push({ method: sep[1], path: sep[2], note: sep[3] }); continue; }
    const as = line.match(/^#\s*ASSUMPTION:\s*(.+)$/);
    if (as) { doc.assumptions.push(as[1]); continue; }
    const oq = line.match(/^#\s*OPEN-QUESTION:\s*(.+)$/);
    if (oq) { doc.openQuestions.push(oq[1]); continue; }
    const src = line.match(/^#\s*from\s+(.+)$/i);
    if (src) { pendingSources.push(src[1].trim()); continue; }
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('@')) {
      pendingTags.push(...line.split(/\s+/).filter((t) => t.startsWith('@')));
      const story = pendingTags.find((t) => t.startsWith('@story:'));
      if (story && !doc.story) doc.story = story.slice(7);
      continue;
    }
    const feat = line.match(/^Feature:\s*(.+)$/);
    if (feat) { doc.feature = feat[1]; pendingTags = []; continue; }
    const scn = line.match(/^Scenario( Outline| Template)?:\s*(.+)$/);
    if (scn) {
      inBackground = false; inExamples = false;
      const id = pendingTags.find((t) => /^@SCN-\d+$/.test(t))?.slice(1)
        ?? `SCN-${String(doc.scenarios.length + 1).padStart(3, '0')}`;
      current = {
        id,
        title: scn[2],
        tags: pendingTags,
        acs: pendingTags.filter((t) => /^@AC-\d+$/.test(t)).map((t) => t.slice(1)),
        priority: pendingTags.find((t) => t.startsWith('@priority:'))?.slice(10),
        rawType: pendingTags.find((t) => t.startsWith('@type:'))?.slice(6),
        testType: normaliseTestType(pendingTags.find((t) => t.startsWith('@type:'))?.slice(6)),
        layer: pendingTags.find((t) => t.startsWith('@layer:'))?.slice(7),
        depends: pendingTags.filter((t) => t.startsWith('@depends:')).map((t) => t.slice(9)),
        sources: pendingSources,
        steps: [],
        needsClarification: pendingTags.includes('@needs-clarification'),
        outline: Boolean(scn[1]),
        examples: [],
      };
      doc.scenarios.push(current);
      pendingTags = [];
      pendingSources = [];
      continue;
    }
    if (/^Background:/.test(line)) { current = undefined; inBackground = true; pendingTags = []; continue; }
    if (/^(Examples|Scenarios):/.test(line)) { inExamples = Boolean(current); pendingTags = []; continue; }
    if (/^Rule:/.test(line)) { current = undefined; inBackground = false; inExamples = false; pendingTags = []; continue; }
    if (inExamples && current && line.startsWith('|')) { current.examples.push(cells(line)); continue; }
    if (/^(Given|When|Then|And|But|\*|\||""")/.test(line)) {
      if (current) current.steps.push(line);
      else if (inBackground) doc.background.push(line);
    }
  }
  return doc;
}

/** Match "/api/room/7" against declared templates like "/api/room/{id}". */
export function matchEndpoint(endpoints: Endpoint[], method: string, pathname: string): Endpoint | undefined {
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  return endpoints.find((e) => e.method === method.toUpperCase()
    && new RegExp(`^${norm(e.path).replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{[^}]+\\?\}|:[A-Za-z_]+/g, '[^/]+')}$`).test(norm(pathname)));
}
