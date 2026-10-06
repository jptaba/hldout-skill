/**
 * Journeys: the reusable HOW of an application, shared by every story on it, in one folder per application
 * (journeysDir, "journeys" by default):
 *
 *   fixtures/<domain>.ts   the journeys of one area of the application (products, cart, favorites, auth…): UI journeys
 *                          (open a page and wait until it is ready, fill a form, pick a row) and API journeys (create /
 *                          read / delete a record, find one, take a token), each an exported, documented function.
 *                          Helpers a domain's journeys share stay in the file, not exported.
 *   registry.yml           the mapping, written by the tools: every journey's id, where it is, what of the application
 *                          it touches (endpoints, routes, locators), the journeys it calls, the journeys that must run
 *                          before it, and which stories proved it.
 *
 * A journey's id is <kind>.<domain>.<name>: ui.favorites.open-favourites, api.favorites.add-favourite. Its kind is ui
 * when it drives a page, api otherwise. `support.sign-in` and `support.account` stand for the fixtures' signIn() and
 * seed.account() in what must run before a journey.
 *
 * Journeys are mechanics only. They never hold an expected value of a story: no [REQ …] assertion, no expectResponse,
 * no message the requirement says the application shows. The tests keep every assertion of WHAT is expected.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, journeyPaths, type HeldoutConfig } from './config';
import type { RequirementContract } from './contract-model';

export type JourneyKind = 'ui' | 'api';
export const JOURNEY_KINDS: JourneyKind[] = ['ui', 'api'];
type Dirs = Pick<HeldoutConfig, 'journeysDir' | 'auts'>;

/** What the code says of one journey: where it is, what it is for, and what of the application it touches. */
export interface JourneyInfo {
  id: string;
  kind: JourneyKind;
  domain: string;
  /** Its exported name, e.g. addFavourite. */
  name: string;
  /** Path under the journeys folder, e.g. "fixtures/favorites.ts". */
  file: string;
  /** First sentence of its doc comment. */
  summary?: string;
  /** Its parameters, as written. */
  params?: string;
  /** API: the calls it makes ("POST /favorites"; path parameters as {}). */
  endpoints?: string[];
  /** UI: the routes it opens. */
  routes?: string[];
  /** UI: the locators it uses. */
  locators?: string[];
  /** The journeys it calls itself. */
  calls?: string[];
}
export type JourneyCode = JourneyInfo & { body: string; hash: string };

/** The fixtures every story has (heldout-support/fixtures.ts), as they appear among what must run before a journey. */
export const SUPPORT_CALLS: { id: string; pattern: RegExp }[] = [
  { id: 'support.account', pattern: /\bseed\.account\s*\(/g },
  { id: 'support.sign-in', pattern: /(?<![\w$.])signIn\s*\(/g },
];

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
/** "addFavourite" → "add-favourite". */
export const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
export const journeyId = (kind: JourneyKind, domain: string, name: string) => `${kind}.${domain}.${kebab(name)}`;
/** A hash of a journey's code: comments and blank lines left out, so a note (a TODO(harden) taken off) changes nothing. */
const hashOf = (s: string) => crypto.createHash('sha256')
  .update(s.replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1').split('\n').map((l) => l.trimEnd()).filter((l) => l.trim()).join('\n'))
  .digest('hex').slice(0, 12);
const uniq = (xs: string[]) => [...new Set(xs)];
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** A call of `name(` (or `name<T>(`), not a property of something else. */
const callOf = (name: string, flags = '') => new RegExp(`(?<![\\w$.])${escapeRe(name)}\\s*(?:<[^()]*?>)?\\(`, flags);

// ---- journey code ---------------------------------------------------------------------------------

const tsFilesUnder = (dir: string): string[] => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.ts')).sort().map((f) => path.join(dir, f))
  : []);

/** Every code file under the journeys folder's fixtures/ (one per domain; lint flags any other place). */
export function journeyFiles(cfg: Dirs, profile: string): string[] {
  return tsFilesUnder(journeyPaths(cfg, profile).fixtures);
}

/** The journey files a story's specs import, directly or through another journey file. */
export function journeysUsedBy(cfg: Dirs, profile: string, specs: string[]): string[] {
  const root = journeyPaths(cfg, profile).base + path.sep;
  const seen = new Set<string>();
  const queue = [...specs];
  while (queue.length) {
    const file = queue.shift()!;
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const base = path.resolve(path.dirname(file), m[1]);
      const target = [base, `${base}.ts`, path.join(base, 'index.ts')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile());
      if (target && target.startsWith(root) && !seen.has(target)) { seen.add(target); queue.push(target); }
    }
  }
  return [...seen].sort();
}

/** The top-level declaration starting at `index`: up to the next line that starts a new top-level statement. */
function topLevelBlock(src: string, index: number): string {
  const rest = src.slice(index);
  const next = rest.slice(1).search(/\n(?![\s})\]]|$)/);
  return next === -1 ? rest : rest.slice(0, next + 2);
}

const EXPORTED_FUNCTION = /^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(([^)]*)\)|^export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*(?::[^=]*)?=>/gm;
const LOCAL_FUNCTION = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*(?::[^=]*)?=>/gm;

/** UI when it drives a page (takes a Page, opens a route or uses the page), API otherwise. */
const kindOf = (params: string, body: string): JourneyKind => (/\bPage\b/.test(params) || /\bgotoPage\s*\(|\bpage\.\w/.test(body) ? 'ui' : 'api');

/**
 * The exported functions of one domain file, with what of the application each touches. The file's own helpers (not
 * exported) count as part of the journeys that call them.
 */
export function journeysIn(file: string, base: string): JourneyCode[] {
  const src = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(base, file).split(path.sep).join('/');
  const domain = path.basename(file, '.ts');
  const helpers = new Map([...src.matchAll(LOCAL_FUNCTION)].map((m) => [m[1] ?? m[2], topLevelBlock(src, m.index ?? 0)] as const));
  // Paths the file names once: `const FAVORITES = '/favorites'`, `const favorite = (id: string) => \`/favorites/${id}\``.
  const paths = new Map([...src.matchAll(/^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]*)?=\s*(?:\([^)]*\)\s*(?::[^=]*)?=>\s*)?([`'"])(\/[^`'"]*)\2/gm)]
    .map((m) => [m[1], m[3]] as const));
  // A journey's code with the file's helpers it calls (and theirs), so their calls and locators are its own.
  const withHelpers = (body: string) => {
    const seen = new Set<string>();
    const queue = [body];
    let all = body;
    while (queue.length) {
      const code = queue.shift()!;
      for (const [n, b] of helpers) if (!seen.has(n) && callOf(n).test(code)) { seen.add(n); all += `\n${b}`; queue.push(b); }
    }
    return all;
  };
  return [...src.matchAll(EXPORTED_FUNCTION)].map((m) => {
    const start = m.index ?? 0;
    const own = topLevelBlock(src, start);
    const body = withHelpers(own);
    const doc = src.slice(0, start).match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*$/)?.[1];
    // The first sentence: up to a full stop that ends a sentence (not "e.g." or "i.e."), or the first blank line.
    const summary = doc?.replace(/^\s*\*\s?/gm, '').trim().split(/(?<!\b(?:e\.g|i\.e|etc|vs|cf))(?<=[.!?])\s+(?=[A-Z`"'(])|\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim();
    const endpoints = uniq([...body.matchAll(/\bapi\.(get|post|put|patch|delete|head)\s*(?:<[^()]*?>)?\(\s*(?:([`'"])([^`'"]+)\2|([A-Za-z_$][\w$]*))/g)]
      .map((e) => [e[1], e[3] ?? paths.get(e[4])] as const).filter(([, p]) => p !== undefined)
      .map(([method, p]) => `${method.toUpperCase()} ${p!.replace(/\$\{[^}]*\}/g, '{}').replace(/\?.*$/, '')}`));
    const routes = uniq([...body.matchAll(/\b(?:gotoPage\(\s*\w+\s*,|\.goto\()\s*([`'"])([^`'"]+)\1/g)].map((r) => r[2].replace(/\$\{[^}]*\}/g, '{}')));
    const params = (m[2] ?? m[4] ?? m[5])?.replace(/\s+/g, ' ').trim() ?? '';
    const kind = kindOf(params, body);
    const locators = kind === 'ui' ? uniq([...body.matchAll(/\b(?:page|\w+)\.((?:getBy\w+|locator)\((?:[^()]|\([^()]*\))*\))/g)].map((l) => l[1])).slice(0, 12) : [];
    const name = m[1] ?? m[3];
    return {
      id: journeyId(kind, domain, name), kind, domain, name, file: relFile, body, hash: hashOf(own),
      ...(summary ? { summary } : {}), ...(params ? { params } : {}),
      ...(endpoints.length ? { endpoints } : {}), ...(routes.length ? { routes } : {}), ...(locators.length ? { locators } : {}),
    };
  });
}

/** Every journey of an application, with the journeys each calls. */
export function allJourneys(cfg: Dirs, profile: string): JourneyCode[] {
  const base = journeyPaths(cfg, profile).base;
  const all = journeyFiles(cfg, profile).flatMap((f) => journeysIn(f, base));
  for (const j of all) {
    const calls = all.filter((o) => o !== j && callOf(o.name).test(j.body)).map((o) => o.id);
    if (calls.length) j.calls = calls.sort();
  }
  return all;
}

/** A content hash per journey (id → hash): frozen with the draft, compared at the verdict. */
export function journeyHashes(journeys: JourneyCode[]): Record<string, string> {
  return Object.fromEntries(journeys.map((j) => [j.id, j.hash]).sort(([a], [b]) => a.localeCompare(b)));
}

/** The journeys defined in the given files (the ones a story's specs import). */
export const journeysOfFiles = (journeys: JourneyCode[], files: string[], base: string) =>
  journeys.filter((j) => files.includes(path.join(base, j.file)));

/** The journey files a story's specs use and a hash per journey in them: what the freeze records and integrity compares. */
export function storyJourneys(cfg: Dirs, profile: string, specs: string[]): { files: string[]; hashes: Record<string, string> } {
  const files = journeysUsedBy(cfg, profile, specs);
  return { files, hashes: journeyHashes(journeysOfFiles(allJourneys(cfg, profile), files, journeyPaths(cfg, profile).base)) };
}

// ---- which tests use which journeys ---------------------------------------------------------------

/** The spec's own top-level helper functions, by name. */
function specHelpers(specs: string[]): Map<string, string> {
  const units = new Map<string, string>();
  for (const file of specs) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*(?::[^=]*)?=>/gm)) {
      units.set(m[1] ?? m[2], topLevelBlock(src, m.index ?? 0));
    }
  }
  return units;
}

/**
 * The journeys and support fixtures a test's code runs, in order: its own calls, through the spec's helper functions
 * (a journey's own calls are its `calls`, not part of the test's sequence).
 */
export function callSequence(journeys: JourneyCode[], helpers: Map<string, string>, code: string, seen = new Set<string>()): string[] {
  const hits: { at: number; ids: string[] }[] = [];
  // A call runs when its arguments are done: `signIn(page, await seed.account())` takes the account first.
  const at = (m: RegExpMatchArray) => callEnd(code, (m.index ?? 0) + m[0].length - 1);
  for (const j of journeys) for (const m of code.matchAll(callOf(j.name, 'g'))) hits.push({ at: at(m), ids: [j.id] });
  for (const s of SUPPORT_CALLS) for (const m of code.matchAll(s.pattern)) hits.push({ at: at(m), ids: [s.id] });
  for (const [n, body] of helpers) {
    if (seen.has(n) || journeys.some((j) => j.name === n)) continue;
    for (const m of code.matchAll(callOf(n, 'g'))) hits.push({ at: at(m), ids: callSequence(journeys, helpers, body, new Set([...seen, n])) });
  }
  return hits.sort((a, b) => a.at - b.at).flatMap((h) => h.ids);
}

/** Where the call whose "(" is at `open` ends (its matching ")"), skipping strings and template literals. */
function callEnd(code: string, open: number): number {
  let depth = 0;
  let quote = '';
  for (let i = open; i < code.length; i++) {
    const c = code[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return i;
  }
  return code.length;
}

/** Which journeys each test of a story uses: journey id → the scenario ids that use it (directly or through others). */
export function journeyUse(journeys: JourneyCode[], specs: string[], scenarios: { id: string; code: string }[]): Map<string, Set<string>> {
  const helpers = specHelpers(specs);
  const byId = new Map(journeys.map((j) => [j.id, j]));
  const out = new Map<string, Set<string>>();
  for (const s of scenarios) {
    const queue = callSequence(journeys, helpers, s.code).filter((id) => byId.has(id));
    const seen = new Set<string>();
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      queue.push(...(byId.get(id)?.calls ?? []));
    }
    for (const id of seen) out.set(id, new Set([...(out.get(id) ?? []), s.id]));
  }
  return out;
}

/**
 * What ran before each journey in the given tests: for each journey a test calls itself, the journeys and support
 * fixtures before it — kept only where every one of those tests agrees (what it needs, not what one test happened to do).
 */
export function observedRequires(journeys: JourneyCode[], specs: string[], scenarios: { id: string; code: string }[]): Map<string, string[]> {
  const helpers = specHelpers(specs);
  const out = new Map<string, string[]>();
  for (const s of scenarios) {
    const seq = callSequence(journeys, helpers, s.code);
    const firstAt = new Map<string, number>();
    seq.forEach((id, i) => { if (!firstAt.has(id)) firstAt.set(id, i); });
    for (const [id, i] of firstAt) {
      if (id.startsWith('support.')) continue;
      const before = uniq(seq.slice(0, i)).filter((x) => x !== id);
      out.set(id, out.has(id) ? out.get(id)!.filter((x) => before.includes(x)) : before);
    }
  }
  return out;
}

// ---- oracle guard and layout ----------------------------------------------------------------------

/**
 * Expected messages of a story (quoted in its outcomes, and its error bodies): text a journey must never carry. A
 * quoted name (a page or button: "Favorites", "Contact List") is how to find something, not an answer: a message has
 * three words or more, or ends like a sentence.
 */
export function oracleLiterals(c?: RequirementContract): string[] {
  if (!c) return [];
  const texts = [...(c.acceptanceCriteria ?? []).flatMap((a) => a.outcomes ?? []), ...(c.errorModel ?? []).map((e) => e.body ?? '')];
  const message = (s: string) => s.split(/\s+/).length >= 3 || /[.!?]$/.test(s);
  // A quoted control ("Add to cart" button, the "Sort" menu) is where to click, not what the application answers.
  const control = /^\s*(button|link|icon|tab|field|menu|page|heading|column|checkbox|option|label|dropdown|select)\b/i;
  const controlBefore = /\b(button|link|icon|tab|field|menu|page|heading|column|checkbox|option|label|dropdown|select|press(es|ed|ing)?|click(s|ed|ing)?|tap(s|ped|ping)?|hit(s|ting)?|choos(e|es|ing)|select(s|ed|ing)?)\s*$/i;
  const quoted = texts.flatMap((t) => [...t.matchAll(/["“]([^"”]{4,})["”]/g)]
    .filter((m) => !control.test(t.slice(m.index! + m[0].length)) && !controlBefore.test(t.slice(0, m.index)))
    .map((m) => m[1].trim())).filter(message);
  const bodies = (c.errorModel ?? []).map((e) => (e.body ?? '').trim()).filter((b) => b.length >= 4 && !/^[{[]/.test(b));
  return [...new Set([...quoted, ...bodies])].filter((l) => !/^\/|^[A-Z]+ \//.test(l));
}

export interface JourneyFinding { level: 'error' | 'warn'; code: string; message: string }

/**
 * The journey files a story uses hold HOW only (no requirement assertion, no expected answer of the story, no import of
 * a story's own code), and keep the layout: one file per domain directly in fixtures/, every journey documented.
 */
export function lintJourneys(files: string[], contract?: RequirementContract, base?: string): JourneyFinding[] {
  const out: JourneyFinding[] = [];
  const literals = oracleLiterals(contract).map((l) => l.toLowerCase());
  for (const file of files) {
    const name = path.relative(ROOT, file).split(path.sep).join('/');
    const src = fs.readFileSync(file, 'utf8');
    if (/\[REQ\b/.test(src)) out.push({ level: 'error', code: 'req-assertion', message: `${name} has a [REQ …] assertion — what a story expects belongs in its test, never in a shared journey` });
    if (/\bexpectResponse\(/.test(src)) out.push({ level: 'error', code: 'expect-response', message: `${name} calls expectResponse — return the answer and let the test assert it` });
    if (/@req-constants/.test(src)) out.push({ level: 'error', code: 'req-constants', message: `${name} has a @req-constants block — expected values belong in the story's spec` });
    const low = src.toLowerCase();
    for (const lit of literals) if (low.includes(lit)) out.push({ level: 'error', code: 'oracle-literal', message: `${name} contains "${lit}", an expected value of the story — locate the element by its role, test id or position, and leave the expectation to the test` });
    for (const m of src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) if (/\.spec(\.ts)?$|\/tests\//.test(m[1])) out.push({ level: 'error', code: 'imports-story', message: `${name} imports ${m[1]} — journeys are shared by every story and import only heldout-support and other domains' journeys` });
    const root = base ?? path.resolve(path.dirname(file), '..');
    const relFile = path.relative(root, file).split(path.sep).join('/');
    if (!/^fixtures\/[a-z0-9][a-z0-9-]*\.ts$/.test(relFile) || path.basename(file) === 'index.ts') {
      out.push({ level: 'warn', code: 'layout', message: `${name}: journeys live in fixtures/<domain>.ts, one file per area of the application named in lower case (fixtures/products.ts), no sub-folders or index files` });
    }
    for (const j of journeysIn(file, root)) if (!j.summary) out.push({ level: 'warn', code: 'no-summary', message: `${name}: ${j.name} has no /** doc comment */ — the registry shows it to the next test author` });
  }
  return out;
}

/**
 * Journeys that look like the same journey under two names (two people added it on two branches): the same kind and
 * the same calls, or the same routes and locators. Each group is a candidate to merge into one.
 */
export function duplicateJourneys(journeys: JourneyInfo[]): JourneyInfo[][] {
  // What a journey calls includes what the journeys it calls do: listing favourites is not removing them by a list.
  const byId = new Map(journeys.map((j) => [j.id, j]));
  const calls = (a: JourneyInfo, seen = new Set<string>([a.id])): string[] => uniq([...(a.endpoints ?? []),
    ...(a.calls ?? []).filter((id) => !seen.has(id) && seen.add(id)).flatMap((id) => (byId.has(id) ? calls(byId.get(id)!, seen) : []))]);
  const sig = (a: JourneyInfo) => (calls(a).length ? `${a.kind}|calls|${calls(a).sort().join(',')}`
    : a.routes?.length || a.locators?.length ? `${a.kind}|ui|${[...(a.routes ?? [])].sort().join(',')}|${[...(a.locators ?? [])].sort().join(',')}` : '');
  const groups = new Map<string, JourneyInfo[]>();
  // A journey that only calls others (a wrapper) adds no calls of its own: it is not a second copy of them.
  const own = (a: JourneyInfo) => Boolean(a.endpoints?.length || a.routes?.length || a.locators?.length);
  for (const a of journeys.filter(own)) { const s = sig(a); if (s) groups.set(s, [...(groups.get(s) ?? []), a]); }
  return [...groups.values()].filter((g) => g.length > 1);
}

/** Whether a journey concerns the story: it calls one of its endpoints' resources, opens a route it starts on, or its
 *  domain is a word of the story. */
export function relevantJourney(a: JourneyInfo, c?: RequirementContract): boolean {
  if (!c) return false;
  const seg = (p: string) => p.toLowerCase().split('/').filter(Boolean)[0] ?? '';
  const resources = new Set((c.endpoints ?? []).map((e) => seg(e.path)).filter(Boolean));
  if ((a.endpoints ?? []).some((e) => resources.has(seg(e.split(' ')[1] ?? '')))) return true;
  const starts = (c.acceptanceCriteria ?? []).map((x) => x.entryPoint ?? '').filter((e) => /^[/#]/.test(e.trim())).map(seg);
  if ((a.routes ?? []).some((r) => starts.includes(seg(r)))) return true;
  const text = JSON.stringify([c.title, c.context, c.acceptanceCriteria?.map((x) => [x.text, x.entryPoint]), c.testData]).toLowerCase();
  const word = a.domain.toLowerCase().replace(/s$/, '');
  return word.length >= 3 && new RegExp(`\\b${escapeRe(word)}`).test(text);
}

export function describeJourney(a: Pick<JourneyInfo, 'summary' | 'endpoints' | 'routes' | 'locators'>): string {
  return [
    a.summary ?? '(no doc comment)',
    a.endpoints?.length ? `calls ${a.endpoints.join(', ')}` : '',
    a.routes?.length ? `opens ${a.routes.join(', ')}` : '',
    a.locators?.length ? `uses ${a.locators.slice(0, 4).join(', ')}${a.locators.length > 4 ? ', …' : ''}` : '',
  ].filter(Boolean).join(' · ');
}

// ---- registry.yml ---------------------------------------------------------------------------------

export type JourneyStatus = 'unproven' | 'proven' | 'changed' | 'stale';
export interface Proof { at: string; by: string[]; evidence?: string; hash: string }
export interface StaleMark { at: string; by: string; evidence?: string }
/** One journey in the registry: the code's facts, what must run before it, and what the stories learned. */
export interface RegistryEntry {
  fixture: string;
  kind: JourneyKind;
  summary?: string;
  params?: string;
  endpoints?: string[];
  routes?: string[];
  locators?: string[];
  calls?: string[];
  requires?: string[];
  status: JourneyStatus;
  proven?: Proof;
  stale?: StaleMark;
}
export interface Registry { schema: 1; app?: string; journeys: Record<string, RegistryEntry> }

export const emptyRegistry = (app?: string): Registry => ({ schema: 1, ...(app ? { app } : {}), journeys: {} });

/** proven, unless a later stale mark says otherwise; changed when the code differs from what was proven. */
export function statusOf(e: Pick<RegistryEntry, 'proven' | 'stale'>, hash?: string): JourneyStatus {
  if (e.stale && (!e.proven || e.stale.at > e.proven.at)) return 'stale';
  if (!e.proven) return 'unproven';
  return hash && e.proven.hash !== hash ? 'changed' : 'proven';
}

const BARE = /^[A-Za-z][\w.-]*$/;
const scalar = (v: string) => (BARE.test(v) && !/^(true|false|null|yes|no|on|off)$/i.test(v) ? v : JSON.stringify(v));
const list = (xs: string[]) => `[${xs.map((x) => JSON.stringify(x)).join(', ')}]`;

/** registry.yml as text: one block per journey, sorted by id; strings in JSON quoting (valid YAML), lists inline. */
export function renderRegistry(reg: Registry): string {
  const lines = [
    '# Journey registry: every journey in fixtures/<domain>.ts, what it touches, what it calls, what must run before it',
    '# (requires) and which stories proved it. Written by `npm run heldout -- journeys --sync` and the harvest; don\'t edit.',
    '# A merge conflict in this file: npm run heldout -- journeys --resolve',
    'schema: 1',
    ...(reg.app ? [`app: ${scalar(reg.app)}`] : []),
    'journeys:',
  ];
  for (const id of Object.keys(reg.journeys).sort()) {
    const e = reg.journeys[id];
    lines.push(`  ${id}:`, `    fixture: ${scalar(e.fixture)}`, `    kind: ${e.kind}`);
    if (e.summary) lines.push(`    summary: ${JSON.stringify(e.summary)}`);
    if (e.params) lines.push(`    params: ${JSON.stringify(e.params)}`);
    for (const k of ['endpoints', 'routes', 'locators', 'calls', 'requires'] as const) if (e[k]?.length) lines.push(`    ${k}: ${list(e[k]!)}`);
    lines.push(`    status: ${e.status}`);
    if (e.proven) {
      lines.push('    proven:', `      at: ${JSON.stringify(e.proven.at)}`, `      by: ${list(e.proven.by)}`);
      if (e.proven.evidence) lines.push(`      evidence: ${JSON.stringify(e.proven.evidence)}`);
      lines.push(`      hash: ${JSON.stringify(e.proven.hash)}`);
    }
    if (e.stale) {
      lines.push('    stale:', `      at: ${JSON.stringify(e.stale.at)}`, `      by: ${JSON.stringify(e.stale.by)}`);
      if (e.stale.evidence) lines.push(`      evidence: ${JSON.stringify(e.stale.evidence)}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

export const CONFLICT = /^(<{7}|={7}|>{7}|\|{7})( |$)/m;

/** Read registry.yml as renderRegistry writes it (block mappings by indentation; JSON-quoted strings and lists). */
export function parseRegistry(text: string): Registry {
  if (CONFLICT.test(text)) throw new Error('registry.yml has merge-conflict markers — run: npm run heldout -- journeys --resolve');
  const root: Record<string, unknown> = {};
  const stack: { indent: number; obj: Record<string, unknown> }[] = [{ indent: -1, obj: root }];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim() || /^\s*#/.test(line)) return;
    const m = line.match(/^( *)([^\s:][^:]*):(?:\s+(.*))?$/);
    if (!m) throw new Error(`registry.yml line ${i + 1} is not "key: value": ${line.trim()}`);
    const indent = m[1].length;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    const raw = (m[3] ?? '').trim();
    if (!raw) { const obj: Record<string, unknown> = {}; parent[m[2].trim()] = obj; stack.push({ indent, obj }); return; }
    let value: unknown;
    try { value = /^["[{]/.test(raw) ? JSON.parse(raw) : /^\d+$/.test(raw) ? Number(raw) : raw; } catch { throw new Error(`registry.yml line ${i + 1}: can't read ${raw}`); }
    parent[m[2].trim()] = value;
  });
  const reg = root as unknown as Registry;
  reg.journeys ??= {};
  reg.schema = 1;
  return reg;
}

export function readRegistry(cfg: Dirs, profile: string): Registry {
  const file = journeyPaths(cfg, profile).registry;
  return fs.existsSync(file) ? parseRegistry(fs.readFileSync(file, 'utf8')) : emptyRegistry();
}

export function writeRegistry(cfg: Dirs, profile: string, reg: Registry): string {
  const file = journeyPaths(cfg, profile).registry;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderRegistry(reg));
  return file;
}

/**
 * The registry brought in line with the code: every journey in the code gets an entry with the code's facts (kept:
 * requires and what the stories learned); entries whose journey is gone are dropped. Returns what changed.
 */
export function syncRegistry(reg: Registry, journeys: JourneyCode[], app?: string): { registry: Registry; added: string[]; removed: string[]; updated: string[] } {
  const next: Registry = { schema: 1, ...(app ?? reg.app ? { app: app ?? reg.app } : {}), journeys: {} };
  const added: string[] = [];
  const updated: string[] = [];
  for (const j of journeys) {
    const was = reg.journeys[j.id];
    const e: RegistryEntry = {
      fixture: `${j.file}#${j.name}`, kind: j.kind,
      ...(j.summary ? { summary: j.summary } : {}), ...(j.params ? { params: j.params } : {}),
      ...(j.endpoints ? { endpoints: j.endpoints } : {}), ...(j.routes ? { routes: j.routes } : {}), ...(j.locators ? { locators: j.locators } : {}),
      ...(j.calls ? { calls: j.calls } : {}), ...(was?.requires?.length ? { requires: was.requires } : {}),
      status: 'unproven', ...(was?.proven ? { proven: was.proven } : {}), ...(was?.stale ? { stale: was.stale } : {}),
    };
    e.status = statusOf(e, j.hash);
    if (!was) added.push(j.id);
    else if (renderRegistry({ schema: 1, journeys: { x: was } }) !== renderRegistry({ schema: 1, journeys: { x: e } })) updated.push(j.id);
    next.journeys[j.id] = e;
  }
  const removed = Object.keys(reg.journeys).filter((id) => !next.journeys[id]);
  return { registry: next, added, removed, updated };
}

/** Everything that must run before a journey: its prerequisites, theirs, and so on. */
export function allRequires(reg: Registry, id: string, seen = new Set<string>()): string[] {
  const out: string[] = [];
  for (const r of reg.journeys[id]?.requires ?? []) {
    if (seen.has(r)) continue;
    seen.add(r);
    out.push(...allRequires(reg, r, seen), r);
  }
  return uniq(out);
}

/**
 * Only the direct prerequisites: one a journey needs because another of its prerequisites needs it is left to that
 * one. post-favourite requiring ensure-not-favourite, which requires support.account, lists only the former.
 */
export function directRequires(reg: Registry): Registry {
  const full = new Map(Object.keys(reg.journeys).map((id) => [id, new Set(allRequires(reg, id))]));
  for (const e of Object.values(reg.journeys)) {
    if (!e.requires?.length) continue;
    const reqs = e.requires;
    e.requires = reqs.filter((r) => !reqs.some((o) => o !== r && full.get(o)?.has(r)));
  }
  return reg;
}

/** Two registries of one application merged (both sides of a merge): later proofs and stale marks, every story kept,
 *  and only the prerequisites both sides agree on. */
export function mergeRegistries(a: Registry, b: Registry): Registry {
  const out: Registry = { schema: 1, ...(a.app ?? b.app ? { app: a.app ?? b.app } : {}), journeys: { ...a.journeys } };
  for (const [id, y] of Object.entries(b.journeys)) {
    const x = out.journeys[id];
    if (!x) { out.journeys[id] = y; continue; }
    const proven = x.proven && y.proven
      ? { ...(x.proven.at >= y.proven.at ? x.proven : y.proven), by: uniq([...x.proven.by, ...y.proven.by]).sort() }
      : x.proven ?? y.proven;
    const stale = x.stale && y.stale ? (x.stale.at >= y.stale.at ? x.stale : y.stale) : x.stale ?? y.stale;
    const [ax, by] = [allRequires(a, id), allRequires(b, id)];
    const requires = x.requires && y.requires ? ax.filter((r) => by.includes(r)) : x.requires ?? y.requires;
    const e: RegistryEntry = { ...x, ...(requires?.length ? { requires } : {}), ...(proven ? { proven } : {}), ...(stale ? { stale } : {}) };
    if (!requires?.length) delete e.requires;
    e.status = statusOf(e);
    out.journeys[id] = e;
  }
  return directRequires(out);
}

/** The two sides of a file with git conflict markers (a diff3 base section is dropped). */
export function conflictSides(text: string): [string, string] {
  const ours: string[] = [];
  const theirs: string[] = [];
  let side: 'both' | 'ours' | 'base' | 'theirs' = 'both';
  for (const line of text.split(/\r?\n/)) {
    if (/^<{7}( |$)/.test(line)) { side = 'ours'; continue; }
    if (/^\|{7}( |$)/.test(line)) { side = 'base'; continue; }
    if (/^={7}$/.test(line)) { side = 'theirs'; continue; }
    if (/^>{7}( |$)/.test(line)) { side = 'both'; continue; }
    if (side === 'both' || side === 'ours') ours.push(line);
    if (side === 'both' || side === 'theirs') theirs.push(line);
  }
  return [ours.join('\n'), theirs.join('\n')];
}
