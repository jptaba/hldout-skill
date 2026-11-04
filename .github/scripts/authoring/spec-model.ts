/**
 * Reads the traceability of a story's held-out specs (3-tests/*.spec.ts). The tests are written straight from the
 * reviewed requirement contract, so the specs carry everything a scenario file would:
 *   test('SCN-003: <title>', { tag: ['@AC-3', '@type:negative', '@layer:api'] }, …)   one scenario per test
 *   test(`SCN-004.${i + 1}: …`, …) in a loop                                           a table of cases (SCN-004.1 … .n)
 *   // from story AC-3, linked/confluence-1-api.md §Errors                             requirement source(s), above the test
 *   await journey.step('Given …' / 'When …' / 'Then …', …)                              the journey's steps
 *   // ASSUMPTION: … / // OPEN-QUESTION: … / // OBSERVATION: …                         surfaced in the verdict
 *   // SEED-ENDPOINT: METHOD /path — why                                               plumbing-only endpoints
 *   tag: ['@variant:user-type=guest'] · `@variant:category=${row.cat}` + // cases: category=hammer|wrench   setups
 * The acceptance criteria and the declared endpoints come from the contract itself.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { RequirementContract } from '../contract/contract-model';

/**
 * Test-type taxonomy. Every test declares exactly one type, @type:<t>: what it truly proves (it drives triage and the
 * verdict's counts). Aliases are normalised. Ordered from the most specific to the most general: a test that seems to
 * fit two types takes the earlier one, and one that really proves two things is two tests.
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
  /** Normalised @type:<t>; undefined when missing/unknown (lint error). */
  testType?: TestType;
  rawType?: string;
  /** Every @type: tag as written (more than one is a lint error). */
  rawTypes: string[];
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
  /**
   * The variant values each test() call covers, one entry per call: `@variant:user-type=guest` tags it with one value;
   * a table whose tag is built from its rows (`@variant:user-type=${row.role}`) covers the values its
   * `// cases: user-type=guest|customer, category=hammer|wrench` line lists (every combination of them).
   */
  cases: Record<string, string[]>[];
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

/** The tags of a test() call, from what comes before its body: `tag: [...]` or `tag: '@x'`. */
const tagsOf = (head: string) => [...(head.match(/\btag:\s*\[([^\]]*)\]/)?.[1] ?? head.match(/\btag:\s*(['"`]@[^'"`]+['"`])/)?.[1] ?? '').matchAll(/['"`](@[^'"`]+)['"`]/g)].map((t) => t[1]);

/** One spec file's scenarios and its comment lines. */
function readSpec(file: string, into: Suite): void {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);
  // A note may wrap onto the plain // lines right below it (not a "// from …" source or another LABEL: line).
  let open: string[] | undefined;
  for (const line of lines) {
    const more = open && line.match(/^\s*\/\/\s+(.+?)\s*$/)?.[1];
    if (open && more && !/^[A-Z][A-Z-]+[:(]/.test(more) && !/^from\s/i.test(more)) { open[open.length - 1] += ` ${more}`; continue; }
    open = undefined;
    for (const [label, list] of [['ASSUMPTION', into.assumptions], ['OPEN-QUESTION', into.openQuestions], ['OBSERVATION', into.observations]] as const) {
      const m = line.match(COMMENT(label));
      if (m && /^\s*\/\//.test(line)) { list.push(m[1]); open = list; } else if (m) list.push(m[1]);
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
    const tags = tagsOf(head);
    // Sources: the "// from …" lines directly above the call (other comment lines in between are fine); and the
    // "// cases: …" line of a table whose variant tags come from its rows. Inside a loop the comment may sit above it.
    const sources: string[] = [];
    for (let l = lineAt(start) - 1, loop = false, table = 12; l >= 0; l--) {
      const text = lines[l].trim();
      // A table's comments may sit above the loop that declares its tests, or above the rows declared just before it
      // (`const CASES = [ … ];`, at most a dozen lines).
      if (!loop && !sources.length && /^for\s*(await\s*)?\(|\.(forEach|map)\(/.test(text)) { loop = true; continue; }
      if (loop && !sources.length && !text.startsWith('//') && table-- > 0 && /^(const\s|[{[\]}]|['"`\w].*,$)|[,;[]$/.test(text)) continue;
      if (!text.startsWith('//')) break;
      const from = text.match(/^\/\/\s*from\s+(.+)$/i);
      if (from) sources.unshift(from[1].trim());
    }
    let casesLine: string | undefined;
    for (let l = lineAt(start) - 1; l >= Math.max(0, lineAt(start) - 8); l--) {
      const cs = lines[l].trim().match(/^\/\/\s*cases:\s*(.+)$/i);
      if (cs) { casesLine = cs[1]; break; }
    }
    const listed = Object.fromEntries((casesLine ?? '').split(/\s*[,;]\s*/).map((p) => p.match(/^([a-z][a-z0-9-]*)\s*=\s*(.+)$/)).filter((x): x is RegExpMatchArray => Boolean(x))
      .map((x) => [x[1], x[2].split('|').map((v) => v.trim()).filter(Boolean)]));
    const covers: Record<string, string[]> = {};
    for (const t of tags.filter((x) => x.startsWith('@variant:'))) {
      const [key, value] = t.slice(9).split('=');
      if (!key || value === undefined) continue;
      covers[key] = value.includes('${') ? listed[key] ?? [] : [...new Set([...(covers[key] ?? []), value])];
    }
    const code = src.slice(start, end);
    const steps = [...code.matchAll(STEP_CALL)].map((s) => unescape(s[2]));
    const outline = Boolean(m[3]);
    const known = into.scenarios.find((s) => s.id === id);
    if (known) {
      known.code += `\n${code}`;
      known.declarations += outline && known.outline ? 0 : 1;
      known.tags = [...new Set([...known.tags, ...tags])];
      known.cases.push(covers);
      if (!known.steps.length) known.steps = steps;
      if (!known.sources.length) known.sources = sources;
      return;
    }
    into.scenarios.push({
      id,
      // A table's per-case part (`… (${row.x})`, `…: ${row.name}`) is dropped: the scenario title is what the cases
      // share. A value inside the title (`of ${row.length} characters`, `the rule "${rule.text}"`) reads "…".
      title: unescape(m[4]).replace(/\s*\(\$\{[^}]*\}[^)]*\)\s*$/, '').replace(/\s*[:—–-]\s*\$\{[^}]*\}\s*$/, '')
        .replace(/(["']?)\$\{[^}]*\}\1/g, '…').trim(),
      tags,
      acs: [],
      rawTypes: [],
      depends: [],
      sources,
      steps,
      needsClarification: false,
      assumes: [],
      nfrs: [],
      outline,
      cases: [covers],
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

/** A part of a spec file, by its 1-based lines: a test's block or a top-level declaration. */
export interface SpecRange { name: string; from: number; to: number }
export interface SpecOutline { declarations: SpecRange[]; hooks: SpecRange[]; tests: (SpecRange & { title: string; tags: string[] })[] }

/** A declaration of the file or of a describe body; deeper ones are a test's own. */
const DECLARATION = /^(?: {2})?(?:export\s+)?(?:async\s+)?(?:function\*?|const|let|type|interface|class)\s+([A-Za-z_$][\w$]*)/;
const HOOK = /^\s*(test\.(?:beforeEach|afterEach|beforeAll|afterAll|use))\(/;
const LOOP = /^\s*for\s*(await\s*)?\(|\.(forEach|map)\(/;
const indentOf = (line: string) => line.length - line.trimStart().length;
/** A line that leaves a bracket or a list of arguments open: a closing line ends what it starts. */
const leftOpen = (line: string) => /[{[(,]$/.test(line.replace(/\s*\/\/[^'"`]*$/, '').trimEnd());

/**
 * Whether a template literal is open after this line, given whether one was before it. A backtick in a string or a
 * comment says nothing, nor does one on a line of a block comment (which starts with its `*`). A regex holding a quote
 * hides the rest of its line, as a line this reads no further.
 */
export function literalOpenAfter(line: string, open: boolean): boolean {
  let quote = open ? '`' : '';
  const inBlock = !open && /^\s*\*/.test(line);
  const closes = line.indexOf('*/');
  if (inBlock && closes === -1) return false;
  for (let i = inBlock ? closes + 2 : 0; i < line.length; i++) {
    const c = line[i];
    if (c === '\\') { i++; continue; }
    if (quote) { if (c === quote) quote = ''; continue; }
    if (c === '/' && line[i + 1] === '/') break;
    if (c === '/' && line[i + 1] === '*') {
      const end = line.indexOf('*/', i + 2);
      if (end === -1) break;
      i = end + 1;
      continue;
    }
    if (c === '\'' || c === '"' || c === '`') quote = c;
  }
  return quote === '`';
}

/** The last line (0-based) of the statement that starts at this line, by the closing line at its own indent. */
function statementEnd(lines: string[], at: number): number {
  const opensLiteral = literalOpenAfter(lines[at], false);
  // A bracket at the end of a line that ends inside a literal is the literal's text.
  if (!opensLiteral && !leftOpen(lines[at])) {
    // Not left open, but it may go on on the lines indented below it (a sum, a chained call).
    let end = at;
    while (lines[end + 1]?.trim() && indentOf(lines[end + 1]) > indentOf(lines[at])) end++;
    return end;
  }
  // A template literal's lines and a comment may sit at any indent: only a closing line, outside a literal, says anything.
  let inLiteral = opensLiteral;
  for (let i = at + 1; i < lines.length; i++) {
    const wasInLiteral = inLiteral;
    inLiteral = literalOpenAfter(lines[i], inLiteral);
    // A statement that opens with a literal ends where the literal closes, unless that line leaves something open.
    if (opensLiteral && wasInLiteral && !inLiteral && !leftOpen(lines[i])) return i;
    if (wasInLiteral || !/^\s*[}\])]/.test(lines[i])) continue;
    if (indentOf(lines[i]) < indentOf(lines[at])) return i - 1;
    if (indentOf(lines[i]) === indentOf(lines[at]) && !leftOpen(lines[i])) return i;
  }
  return at;
}

/**
 * Where everything is in a spec file, so an agent reads a test rather than the file. A test's block starts above its
 * test() call, at the comments, rows and loop that belong to it (a blank line, the end of what comes before it or a
 * hook ends them), and ends where its call, or the loop around it, does. A table's calls are one block.
 */
export function specOutline(file: string): SpecOutline {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);
  const ranges = (pattern: RegExp) => lines.flatMap((line, i) => {
    const name = line.match(pattern)?.[1];
    return name ? [{ name, from: i + 1, to: statementEnd(lines, i) + 1 }] : [];
  });
  // An indented declaration is the file's only directly in a describe body: not a helper's local, and not a test's own
  // (a block's rows are found by the walk below).
  const describes = lines.flatMap((l, i) => (/^test\.describe\b/.test(l) ? [[i, statementEnd(lines, i)]] : []));
  const insideTests = (at: number) => [...src.matchAll(TEST_CALL)].some((m) => { const l = lineAt(m.index ?? 0); return at > l && at <= statementEnd(lines, l); });
  const theFiles = (at: number) => !/^\s/.test(lines[at]) || (describes.some(([from, to]) => at > from && at <= to) && !insideTests(at));
  const lineAt = (index: number) => src.slice(0, index).split('\n').length - 1;
  const starts = new Map<string, { title: string; tags: string[]; at: number; end: number }>();
  let lastEnd = -1;
  const floors = new Map<string, number>();
  for (const m of src.matchAll(TEST_CALL)) {
    const at = lineAt(m.index ?? 0);
    const end = statementEnd(lines, at);
    const known = starts.get(m[2]);
    if (known) known.end = end;
    else {
      starts.set(m[2], { title: unescape(m[4]), tags: tagsOf(src.slice(m.index ?? 0, src.indexOf('=>', m.index ?? 0))), at, end });
      floors.set(m[2], lastEnd);
    }
    lastEnd = Math.max(lastEnd, end);
  }
  const blocks = [...starts.entries()].map(([name, s]) => {
    let from = s.at;
    // Up through the comments, the rows and the loop above the call. An array's closing line takes its whole statement:
    // its rows may span lines and close with a bracket of their own.
    for (;;) {
      const above = lines[from - 1];
      if (from - 1 <= floors.get(name)! || !above?.trim() || /^\s*[})]/.test(above) || /\btest\.(describe|beforeEach|afterEach|beforeAll|afterAll|use)\b/.test(above)) break;
      if (/^\s*\]/.test(above)) {
        let open = from - 2;
        while (open > floors.get(name)! && !(indentOf(lines[open]) === indentOf(above) && /\[$/.test(lines[open].trimEnd()))) open--;
        if (open <= floors.get(name)!) break;
        from = open;
      } else from--;
    }
    const loop = lines.slice(from, s.at).findIndex((l) => LOOP.test(l));
    return { name, ...s, from, end: loop === -1 ? s.end : Math.max(s.end, statementEnd(lines, from + loop)) };
  });
  return {
    declarations: ranges(DECLARATION).filter((d) => theFiles(d.from - 1)),
    hooks: ranges(HOOK),
    tests: blocks.map((b) => ({ name: b.name, title: b.title, tags: b.tags, from: b.from + 1, to: b.end + 1 })),
  };
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
  // A declared path that begins with a word may leave out its leading slash (a journey's `accounts/${id}`).
  const rooted = (p: string) => (/^[/{:]/.test(p) ? p : `/${p}`);
  // A path that begins with a placeholder (`${accountPath}/amount/${amount}` reads as "{}/amount/{}") names its end
  // only: the placeholder stands for whatever path comes before.
  const pattern = (p: string) => norm(rooted(p)).replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/^\\?\{[^}]*\\?\}(?=\/)/, '.+').replace(/\\?\{[^}]*\\?\}|:[A-Za-z_]+/g, '[^/]+');
  return endpoints.find((e) => e.method === method.toUpperCase() && candidates.some((c) => new RegExp(`^${pattern(e.path)}$`).test(c)));
}
