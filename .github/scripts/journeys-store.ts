/**
 * Journey fixtures: the reusable HOW of an application, shared by every story on it and kept per AUT profile in
 * journeys/<profile>/:
 *
 *   ui/<domain>.ts     UI fixtures of one area of the application (sign-in, catalogue, cart, checkout…): open a page and
 *                      wait until it is ready, fill a form, pick a row. Exported functions taking the Playwright page.
 *   api/<domain>.ts    API fixtures of one area: create / read / delete a record, find one, take a token. Exported
 *                      functions taking the `api` (and `seed`) fixtures.
 *   map/ui/*.json      the UI map: which fixture opens which route, waits on which anchor, uses which locators, and the
 *   map/api/*.json     API map: which fixture calls which endpoints; with the stories whose passing tests proved each.
 *
 * Fixtures are mechanics only. They never hold an expected value of a story: no [REQ …] assertion, no expectResponse, no
 * message the requirement says the application shows. The test author writes the tests from the requirement and calls
 * fixtures for the steps; the hardener makes fixtures work against the live application; the tests keep every
 * assertion of WHAT is expected.
 *
 * The maps are conflict-free by construction: every write (a story's harvest) is a NEW file, never an edit. Two people on
 * two branches write two files, and git merges them without a conflict. What the map says now is computed on read, by
 * folding every snapshot and fragment of a kind:
 *  - a record per fixture key and value (the same fixture with other locators is another value);
 *  - each record keeps the latest time it was proven (a passing test used it) and found stale, and the stories that
 *    proved it: merging keeps the latest of each time and the union of the stories, so the fold gives the same result in
 *    any order and a file folded twice changes nothing;
 *  - a value is stale when its latest stale mark is newer than its latest proof; of the others, the most recently proven
 *    comes first.
 * Compaction folds a kind's files into one snapshot and deletes the files it folded; snapshots fold like fragments.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, journeyPaths, type HeldoutConfig } from './config';
import type { RequirementContract } from './contract-model';

export type JourneyKind = 'ui' | 'api';
export const JOURNEY_KINDS: JourneyKind[] = ['ui', 'api'];
export type MapStatus = 'proven' | 'stale';

/** What the map says of one fixture: where it is, what it is for, and what of the application it touches. */
export interface FixtureInfo {
  kind: JourneyKind;
  domain: string;
  fixture: string;
  /** Path under journeys/<profile>/, e.g. "api/favorites.ts". */
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
}
type MapValue = Omit<FixtureInfo, 'kind' | 'domain' | 'fixture' | 'file'> & { domain: string; fixture: string; file: string };

/** One map entry, as written in a fragment file. `by` is the story key that proved it (or found it stale). */
export interface MapObservation { key: string; kind: JourneyKind; value: MapValue; status: MapStatus; at: string; by: string; evidence?: string }
export interface MapFragment { schema: 1; profile: string; kind: JourneyKind; by: string; at: string; entries: MapObservation[] }
export interface MapRecord { key: string; kind: JourneyKind; value: MapValue; provenAt?: string; staleAt?: string; stories: string[]; by: string[]; evidence?: string }
export interface MapSnapshot { schema: 1; profile: string; kind: JourneyKind; compactedAt: string; records: MapRecord[] }
/** A fixture key now: its best value and whether it is proven or stale. */
export interface MapEntry { key: string; kind: JourneyKind; status: MapStatus; best: MapRecord; alternatives: MapRecord[] }

export const fixtureKey = (kind: JourneyKind, domain: string, fixture: string) => `${kind}:${domain}.${fixture}`;
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

// ---- fold -----------------------------------------------------------------------------------------

function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical((v as Record<string, unknown>)[k])]).filter(([, x]) => x !== undefined));
  return v;
}
export const valueId = (key: string, value: unknown) => `${key}\u0000${JSON.stringify(canonical(value))}`;
const later = (a?: string, b?: string) => (!a ? b : !b ? a : a > b ? a : b);

export function recordOf(o: MapObservation): MapRecord {
  return {
    key: o.key, kind: o.kind, value: canonical(o.value) as MapValue,
    ...(o.status === 'proven' ? { provenAt: o.at } : { staleAt: o.at }),
    stories: o.status === 'proven' ? [o.by] : [], by: [o.by], ...(o.evidence ? { evidence: o.evidence } : {}),
  };
}

export function mergeRecords(a: MapRecord, b: MapRecord): MapRecord {
  const newest = (x: MapRecord) => later(x.provenAt, x.staleAt) ?? '';
  const out: MapRecord = {
    key: a.key, kind: a.kind, value: a.value,
    provenAt: later(a.provenAt, b.provenAt), staleAt: later(a.staleAt, b.staleAt),
    stories: [...new Set([...a.stories, ...b.stories])].sort(), by: [...new Set([...a.by, ...b.by])].sort(),
    evidence: newest(b) > newest(a) ? b.evidence ?? a.evidence : a.evidence ?? b.evidence,
  };
  for (const k of ['provenAt', 'staleAt', 'evidence'] as const) if (out[k] === undefined) delete out[k];
  return out;
}

export const statusOf = (r: MapRecord): MapStatus => (r.staleAt && r.staleAt > (r.provenAt ?? '') ? 'stale' : 'proven');

/** Fold fragments' entries and snapshots' records into one record per key + value. Order does not matter. */
export function fold(items: (MapObservation | MapRecord)[]): MapRecord[] {
  const byId = new Map<string, MapRecord>();
  for (const item of items) {
    const r = 'status' in item ? recordOf(item) : { ...item, value: canonical(item.value) as MapValue };
    const id = valueId(r.key, r.value);
    const prev = byId.get(id);
    byId.set(id, prev ? mergeRecords(prev, r) : r);
  }
  return [...byId.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Records grouped by key: the most recently proven live value first, then the other live ones. */
export function entries(records: MapRecord[]): MapEntry[] {
  const groups = new Map<string, MapRecord[]>();
  for (const r of records) groups.set(r.key, [...(groups.get(r.key) ?? []), r]);
  return [...groups.entries()].map(([key, rs]) => {
    const sorted = [...rs].sort((a, b) => (statusOf(a) === statusOf(b) ? (b.provenAt ?? b.staleAt ?? '').localeCompare(a.provenAt ?? a.staleAt ?? '') : statusOf(a) === 'proven' ? -1 : 1));
    const best = sorted[0];
    return { key, kind: best.kind, status: statusOf(best), best, alternatives: sorted.slice(1).filter((r) => statusOf(r) === 'proven') };
  }).sort((a, b) => JOURNEY_KINDS.indexOf(a.kind) - JOURNEY_KINDS.indexOf(b.kind) || a.key.localeCompare(b.key));
}

// ---- map files ------------------------------------------------------------------------------------

const stamp = (d = new Date()) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const rand = () => crypto.randomBytes(3).toString('hex');
const mapDir = (cfg: Pick<HeldoutConfig, 'journeysDir'>, profile: string, kind: JourneyKind) => path.join(journeyPaths(cfg, profile).map, kind);

export interface JourneyMap { records: MapRecord[]; files: string[]; snapshots: string[] }

export function loadMap(cfg: Pick<HeldoutConfig, 'journeysDir'>, profile: string): JourneyMap {
  const out: JourneyMap = { records: [], files: [], snapshots: [] };
  const items: (MapObservation | MapRecord)[] = [];
  for (const kind of JOURNEY_KINDS) {
    const dir = mapDir(cfg, profile, kind);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
      const file = path.join(dir, f);
      const body = JSON.parse(fs.readFileSync(file, 'utf8')) as MapFragment | MapSnapshot;
      if (/^snapshot-/.test(f)) { out.snapshots.push(file); items.push(...(body as MapSnapshot).records); } else { out.files.push(file); items.push(...(body as MapFragment).entries); }
    }
  }
  out.records = fold(items);
  return out;
}

/** Write a story's map entries as new fragment files, one per kind (never an existing file). Returns their paths. */
export function writeMap(cfg: Pick<HeldoutConfig, 'journeysDir'>, profile: string, by: string, list: MapObservation[]): string[] {
  const at = new Date();
  const written: string[] = [];
  for (const kind of JOURNEY_KINDS) {
    const mine = list.filter((o) => o.kind === kind);
    if (!mine.length) continue;
    const file = path.join(mapDir(cfg, profile, kind), `${stamp(at)}-${slug(by)}-${rand()}.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const body: MapFragment = { schema: 1, profile, kind, by, at: at.toISOString(), entries: mine };
    fs.writeFileSync(file, `${JSON.stringify(body, null, 2)}\n`);
    written.push(file);
  }
  return written;
}

/** Fold each kind's files into one new snapshot and delete the files it folded. */
export function compactMap(cfg: Pick<HeldoutConfig, 'journeysDir'>, profile: string): { snapshot: string; folded: number; records: number }[] {
  const out: { snapshot: string; folded: number; records: number }[] = [];
  for (const kind of JOURNEY_KINDS) {
    const dir = mapDir(cfg, profile, kind);
    if (!fs.existsSync(dir)) continue;
    const folded = fs.readdirSync(dir).filter((x) => x.endsWith('.json')).map((f) => path.join(dir, f));
    if (folded.length <= 1) continue;
    const items = folded.flatMap((f): (MapObservation | MapRecord)[] => { const b = JSON.parse(fs.readFileSync(f, 'utf8')) as MapFragment | MapSnapshot; return 'records' in b ? b.records : b.entries; });
    const records = fold(items);
    const at = new Date();
    const snapshot = path.join(dir, `snapshot-${stamp(at)}-${rand()}.json`);
    const body: MapSnapshot = { schema: 1, profile, kind, compactedAt: at.toISOString(), records };
    fs.writeFileSync(snapshot, `${JSON.stringify(body, null, 2)}\n`);
    for (const f of folded) fs.rmSync(f);
    out.push({ snapshot, folded: folded.length, records: records.length });
  }
  return out;
}

// ---- fixture code ---------------------------------------------------------------------------------

/** Every fixture file of a profile: journeys/<profile>/ui/*.ts and api/*.ts. */
export function journeyFiles(cfg: Pick<HeldoutConfig, 'journeysDir'>, profile: string): string[] {
  const jp = journeyPaths(cfg, profile);
  return [jp.ui, jp.api].flatMap((dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.ts')).sort().map((f) => path.join(dir, f)) : []));
}

/** The journey files a story's specs import, directly or through another journey file. */
export function journeysUsedBy(cfg: Pick<HeldoutConfig, 'journeysDir'>, specs: string[]): string[] {
  const root = path.resolve(ROOT, cfg.journeysDir) + path.sep;
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

const uniq = (xs: string[]) => [...new Set(xs)];

/** The top-level declaration starting at `index`: up to the next line that starts a new top-level statement. */
function topLevelBlock(src: string, index: number): string {
  const rest = src.slice(index);
  const next = rest.slice(1).search(/\n(?![\s})\]]|$)/);
  return next === -1 ? rest : rest.slice(0, next + 2);
}

/** The exported fixtures of one journey file, with what of the application each touches. */
export function fixturesIn(file: string, profileDir: string): (FixtureInfo & { body: string })[] {
  const src = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(profileDir, file).split(path.sep).join('/');
  const kind: JourneyKind = relFile.startsWith('api/') ? 'api' : 'ui';
  const domain = path.basename(file, '.ts');
  const decl = /^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(([^)]*)\)|^export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*(?::[^=]*)?=>/gm;
  const found = [...src.matchAll(decl)];
  return found.map((m) => {
    const start = m.index ?? 0;
    const body = topLevelBlock(src, start);
    const doc = src.slice(0, start).match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*$/)?.[1];
    // The first sentence: up to a full stop that ends a sentence (not "e.g." or "i.e."), or the first blank line.
    const summary = doc?.replace(/^\s*\*\s?/gm, '').trim().split(/(?<!\b(?:e\.g|i\.e|etc|vs|cf))(?<=[.!?])\s+(?=[A-Z`"'(])|\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim();
    const endpoints = uniq([...body.matchAll(/\bapi\.(get|post|put|patch|delete|head)\s*(?:<[^()]*?>)?\(\s*([`'"])([^`'"]+)\2/g)]
      .map((e) => `${e[1].toUpperCase()} ${e[3].replace(/\$\{[^}]*\}/g, '{}').replace(/\?.*$/, '')}`));
    const routes = uniq([...body.matchAll(/\b(?:gotoPage\(\s*\w+\s*,|\.goto\()\s*([`'"])([^`'"]+)\1/g)].map((r) => r[2].replace(/\$\{[^}]*\}/g, '{}')));
    const locators = uniq([...body.matchAll(/\b(?:page|\w+)\.((?:getBy\w+|locator)\((?:[^()]|\([^()]*\))*\))/g)].map((l) => l[1])).slice(0, 12);
    const info: FixtureInfo & { body: string } = {
      kind, domain, fixture: m[1] ?? m[3], file: relFile, body,
      ...(summary ? { summary } : {}),
      ...((m[2] ?? m[4] ?? m[5])?.trim() ? { params: (m[2] ?? m[4] ?? m[5]).replace(/\s+/g, ' ').trim() } : {}),
      ...(endpoints.length ? { endpoints } : {}), ...(routes.length ? { routes } : {}), ...(locators.length && kind === 'ui' ? { locators } : {}),
    };
    return info;
  });
}

/** Every fixture of a profile, from its code. */
export function profileFixtures(cfg: Pick<HeldoutConfig, 'journeysDir'>, profile: string): (FixtureInfo & { body: string })[] {
  const base = journeyPaths(cfg, profile).base;
  return journeyFiles(cfg, profile).flatMap((f) => fixturesIn(f, base));
}

/** The map value of a fixture (what the map records): its code-derived facts without the body. */
export const mapValueOf = (f: FixtureInfo & { body?: string }): MapValue => {
  const { kind, body, ...rest } = f;
  void kind; void body;
  return canonical(rest) as MapValue;
};

/**
 * Which fixtures each test of a story uses: the ones its test() code calls, through the spec's own helper functions
 * and through other fixtures. Returns fixture key → the scenario ids that use it.
 */
export function fixtureUse(fixtures: (FixtureInfo & { body: string })[], specs: string[], scenarios: { id: string; code: string }[]): Map<string, Set<string>> {
  // Units a name can lead to: the spec's top-level helpers and the fixtures.
  const units = new Map<string, string>();
  for (const file of specs) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*(?::[^=]*)?=>/gm)) {
      units.set(m[1] ?? m[2], topLevelBlock(src, m.index ?? 0));
    }
  }
  for (const f of fixtures) units.set(f.fixture, f.body);
  const fixtureNames = new Map(fixtures.map((f) => [f.fixture, fixtureKey(f.kind, f.domain, f.fixture)]));
  const calls = (code: string) => [...units.keys()].filter((n) => new RegExp(`(?<![\\w$.])${n.replace(/\$/g, '\\$')}\\s*(?:<[^()]*?>)?\\(`).test(code));
  const out = new Map<string, Set<string>>();
  for (const s of scenarios) {
    const seen = new Set<string>();
    const queue = calls(s.code);
    while (queue.length) {
      const n = queue.shift()!;
      if (seen.has(n)) continue;
      seen.add(n);
      queue.push(...calls(units.get(n) ?? ''));
    }
    for (const n of seen) { const k = fixtureNames.get(n); if (k) out.set(k, new Set([...(out.get(k) ?? []), s.id])); }
  }
  return out;
}

/** A content hash per journey file (project-relative path → hash): frozen with the draft, compared at the verdict. */
export function journeyHashes(files: string[]): Record<string, string> {
  return Object.fromEntries(files.map((f) => [path.relative(ROOT, f).split(path.sep).join('/'), crypto.createHash('sha256').update(fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 16)]));
}

// ---- oracle guard ---------------------------------------------------------------------------------

/**
 * Expected messages of a story (quoted in its outcomes, and its error bodies): text a fixture must never carry. A quoted
 * name (a page or button: "Favorites", "Contact List") is how to find something, not an answer: a message has three
 * words or more, or ends like a sentence.
 */
export function oracleLiterals(c?: RequirementContract): string[] {
  if (!c) return [];
  const texts = [...(c.acceptanceCriteria ?? []).flatMap((a) => a.outcomes ?? []), ...(c.errorModel ?? []).map((e) => e.body ?? '')];
  const message = (s: string) => s.split(/\s+/).length >= 3 || /[.!?]$/.test(s);
  // A quoted control ("Add to cart" button, the "Sort" menu) is where to click, not what the application answers.
  const control = /^\s*(button|link|icon|tab|field|menu|page|heading|column|checkbox|option|label|dropdown|select)\b/i;
  const controlBefore = /\b(button|link|icon|tab|field|menu|page|heading|column|checkbox|option|label|dropdown|select|press(es)?|click(s|ed)?|choos(e|es|ing)|select(s|ed)?)\s*$/i;
  const quoted = texts.flatMap((t) => [...t.matchAll(/["“]([^"”]{4,})["”]/g)]
    .filter((m) => !control.test(t.slice(m.index! + m[0].length)) && !controlBefore.test(t.slice(0, m.index)))
    .map((m) => m[1].trim())).filter(message);
  const bodies = (c.errorModel ?? []).map((e) => (e.body ?? '').trim()).filter((b) => b.length >= 4 && !/^[{[]/.test(b));
  return [...new Set([...quoted, ...bodies])].filter((l) => !/^\/|^[A-Z]+ \//.test(l));
}

export interface JourneyFinding { level: 'error' | 'warn'; code: string; message: string }

/**
 * The journey files a story uses hold HOW only: no requirement assertion, no expected answer of the story, no import of
 * a story's own code; every fixture says in a doc comment what it is for (the map shows it to the next test author).
 */
export function lintJourneys(files: string[], contract?: RequirementContract): JourneyFinding[] {
  const out: JourneyFinding[] = [];
  const literals = oracleLiterals(contract).map((l) => l.toLowerCase());
  for (const file of files) {
    const name = path.relative(ROOT, file).split(path.sep).join('/');
    const src = fs.readFileSync(file, 'utf8');
    if (/\[REQ\b/.test(src)) out.push({ level: 'error', code: 'req-assertion', message: `${name} has a [REQ …] assertion — what a story expects belongs in its test, never in a shared fixture` });
    if (/\bexpectResponse\(/.test(src)) out.push({ level: 'error', code: 'expect-response', message: `${name} calls expectResponse — return the answer and let the test assert it` });
    if (/@req-constants/.test(src)) out.push({ level: 'error', code: 'req-constants', message: `${name} has a @req-constants block — expected values belong in the story's spec` });
    const low = src.toLowerCase();
    for (const lit of literals) if (low.includes(lit)) out.push({ level: 'error', code: 'oracle-literal', message: `${name} contains "${lit}", an expected value of the story — locate the element by its role, test id or position, and leave the expectation to the test` });
    for (const m of src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) if (/\.spec(\.ts)?$|\/tests\//.test(m[1])) out.push({ level: 'error', code: 'imports-story', message: `${name} imports ${m[1]} — fixtures are shared by every story and import only heldout-support and other journey files` });
    for (const f of fixturesIn(file, path.dirname(path.dirname(file)))) if (!f.summary) out.push({ level: 'warn', code: 'no-summary', message: `${name}: ${f.fixture} has no /** doc comment */ — the map shows it to the next test author` });
  }
  return out;
}

// ---- relevance ------------------------------------------------------------------------------------

/** Whether a fixture concerns the story: it calls one of its endpoints' resources, opens a route it starts on, or its
 *  domain is a word of the story. */
export function relevantFixture(f: FixtureInfo, c?: RequirementContract): boolean {
  if (!c) return false;
  const seg = (p: string) => p.toLowerCase().split('/').filter(Boolean)[0] ?? '';
  const resources = new Set((c.endpoints ?? []).map((e) => seg(e.path)).filter(Boolean));
  if ((f.endpoints ?? []).some((e) => resources.has(seg(e.split(' ')[1] ?? '')))) return true;
  const starts = (c.acceptanceCriteria ?? []).map((a) => a.entryPoint ?? '').filter((e) => /^[/#]/.test(e.trim())).map(seg);
  if ((f.routes ?? []).some((r) => starts.includes(seg(r)))) return true;
  const text = JSON.stringify([c.title, c.context, c.acceptanceCriteria?.map((a) => [a.text, a.entryPoint]), c.testData]).toLowerCase();
  const word = f.domain.toLowerCase().replace(/s$/, '');
  return word.length >= 3 && new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text);
}

// ---- rendering ------------------------------------------------------------------------------------

export function describeFixture(f: FixtureInfo): string {
  return [
    f.summary ?? '(no doc comment)',
    f.endpoints?.length ? `calls ${f.endpoints.join(', ')}` : '',
    f.routes?.length ? `opens ${f.routes.join(', ')}` : '',
    f.locators?.length ? `uses ${f.locators.slice(0, 4).join(', ')}${f.locators.length > 4 ? ', …' : ''}` : '',
  ].filter(Boolean).join(' · ');
}
