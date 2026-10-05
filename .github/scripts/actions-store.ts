/**
 * Actions: the reusable HOW of an application, shared by every story on it and kept per AUT profile in
 * actions/<profile>/:
 *
 *   ui/<domain>/<action>.ts    one UI action per file (open a page and wait until it is ready, fill a form, pick a
 *                              row), in the folder of the area it works on (auth, catalogue, cart, checkout…).
 *   api/<domain>/<action>.ts   one API action per file (create / read / delete a record, find one, take a token).
 *   <kind>/<domain>/_*.ts      helpers and types the actions of a domain share (not actions themselves).
 *   map/ui/*.json              the UI map: which action opens which route and uses which locators; and the
 *   map/api/*.json             API map: which action calls which endpoints; with the stories whose passing tests
 *                              proved each.
 *
 * Built for many people on the same application, each adding the actions of their own stories:
 *  - one action per file, so a new action is a new file: two branches that add actions never touch the same file, and
 *    git merges them on its own. Only two people changing the same action meet in one file, which is a real
 *    decision to make together. No index or barrel file: specs import each action file directly.
 *  - the maps are written, never edited: every harvest adds new files, and what the map says is computed on read by
 *    folding every snapshot and fragment of a kind (latest proof and stale mark per action and value, union of the
 *    stories). Compaction folds a kind's files into one snapshot; snapshots fold like fragments.
 *  - two people who add the same action under two names are told: `heldout actions --check` (and doctor) lists
 *    actions that call the same endpoints or open the same route with the same locators.
 *
 * Actions are mechanics only. They never hold an expected value of a story: no [REQ …] assertion, no expectResponse,
 * no message the requirement says the application shows. The tests keep every assertion of WHAT is expected.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, actionPaths, type HeldoutConfig } from './config';
import type { RequirementContract } from './contract-model';

export type ActionKind = 'ui' | 'api';
export const ACTION_KINDS: ActionKind[] = ['ui', 'api'];
export type MapStatus = 'proven' | 'stale';
type Dirs = Pick<HeldoutConfig, 'actionsDir'>;

/** What the map says of one action: where it is, what it is for, and what of the application it touches. */
export interface ActionInfo {
  kind: ActionKind;
  domain: string;
  action: string;
  /** Path under actions/<profile>/, e.g. "api/favorites/add-favourite.ts". */
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
/** An exported function of an action file, or of a domain's shared `_` file (`shared`). */
export type ActionCode = ActionInfo & { body: string; shared?: boolean };
type MapValue = Omit<ActionInfo, 'kind'>;

/** One map entry, as written in a fragment file. `by` is the story key that proved it (or found it stale). */
export interface MapObservation { key: string; kind: ActionKind; value: MapValue; status: MapStatus; at: string; by: string; evidence?: string }
export interface MapFragment { schema: 1; profile: string; kind: ActionKind; by: string; at: string; entries: MapObservation[] }
export interface MapRecord { key: string; kind: ActionKind; value: MapValue; provenAt?: string; staleAt?: string; stories: string[]; by: string[]; evidence?: string }
export interface MapSnapshot { schema: 1; profile: string; kind: ActionKind; compactedAt: string; records: MapRecord[] }
/** An action key now: its best value and whether it is proven or stale. */
export interface MapEntry { key: string; kind: ActionKind; status: MapStatus; best: MapRecord; alternatives: MapRecord[] }

export const actionKey = (kind: ActionKind, domain: string, action: string) => `${kind}:${domain}.${action}`;
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
/** "addFavourite" → "add-favourite": the file name of an action. */
export const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

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
  }).sort((a, b) => ACTION_KINDS.indexOf(a.kind) - ACTION_KINDS.indexOf(b.kind) || a.key.localeCompare(b.key));
}

// ---- map files ------------------------------------------------------------------------------------

const stamp = (d = new Date()) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const rand = () => crypto.randomBytes(3).toString('hex');
const mapDir = (cfg: Dirs, profile: string, kind: ActionKind) => path.join(actionPaths(cfg, profile).map, kind);

export interface ActionMap { records: MapRecord[]; files: string[]; snapshots: string[] }

export function loadMap(cfg: Dirs, profile: string): ActionMap {
  const out: ActionMap = { records: [], files: [], snapshots: [] };
  const items: (MapObservation | MapRecord)[] = [];
  for (const kind of ACTION_KINDS) {
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
export function writeMap(cfg: Dirs, profile: string, by: string, list: MapObservation[]): string[] {
  const at = new Date();
  const written: string[] = [];
  for (const kind of ACTION_KINDS) {
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
export function compactMap(cfg: Dirs, profile: string): { snapshot: string; folded: number; records: number }[] {
  const out: { snapshot: string; folded: number; records: number }[] = [];
  for (const kind of ACTION_KINDS) {
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

// ---- action code ----------------------------------------------------------------------------------

const tsFilesUnder = (dir: string): string[] => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.ts')).sort().map((f) => path.join(dir, f))
  : []);

/** Every code file of a profile's actions: actions/<profile>/ui/** and api/** (actions and shared `_` files). */
export function actionFiles(cfg: Dirs, profile: string): string[] {
  const ap = actionPaths(cfg, profile);
  return [...tsFilesUnder(ap.ui), ...tsFilesUnder(ap.api)];
}

/** A domain's shared helpers and types: a file whose name starts with "_". */
export const isShared = (file: string) => path.basename(file).startsWith('_');

/** The action files a story's specs import, directly or through another action file. */
export function actionsUsedBy(cfg: Dirs, specs: string[]): string[] {
  const root = path.resolve(ROOT, cfg.actionsDir) + path.sep;
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

const EXPORTED_FUNCTION = /^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(([^)]*)\)|^export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*(?::[^=]*)?=>/gm;

/** Where a file sits: its kind (ui/api) and domain (the folder under the kind). */
function placeOf(relFile: string): { kind: ActionKind; domain: string; inDomain: boolean } {
  const parts = relFile.split('/');
  const kind: ActionKind = parts[0] === 'api' ? 'api' : 'ui';
  return parts.length >= 3 ? { kind, domain: parts[1], inDomain: true } : { kind, domain: path.basename(relFile, '.ts'), inDomain: false };
}

/** The exported functions of one action file (or shared file), with what of the application each touches. */
export function actionsIn(file: string, profileDir: string): ActionCode[] {
  const src = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(profileDir, file).split(path.sep).join('/');
  const { kind, domain } = placeOf(relFile);
  const found = [...src.matchAll(EXPORTED_FUNCTION)];
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
    const params = (m[2] ?? m[4] ?? m[5])?.replace(/\s+/g, ' ').trim();
    return {
      kind, domain, action: m[1] ?? m[3], file: relFile, body, ...(isShared(file) ? { shared: true } : {}),
      ...(summary ? { summary } : {}), ...(params ? { params } : {}),
      ...(endpoints.length ? { endpoints } : {}), ...(routes.length ? { routes } : {}), ...(locators.length && kind === 'ui' ? { locators } : {}),
    };
  });
}

/** Every exported function of a profile's action files; `withShared` adds the domains' shared `_` helpers. */
export function profileActions(cfg: Dirs, profile: string, withShared = false): ActionCode[] {
  const base = actionPaths(cfg, profile).base;
  return actionFiles(cfg, profile).flatMap((f) => actionsIn(f, base)).filter((a) => withShared || !a.shared);
}

/** The map value of an action (what the map records): its code-derived facts without the body. */
export const mapValueOf = (a: ActionCode): MapValue => {
  const { kind, body, shared, ...rest } = a;
  void kind; void body; void shared;
  return canonical(rest) as MapValue;
};

/**
 * Which actions each test of a story uses: the ones its test() code calls, through the spec's own helper functions,
 * other actions and the domains' shared helpers. Returns action key → the scenario ids that use it.
 */
export function actionUse(actions: ActionCode[], specs: string[], scenarios: { id: string; code: string }[]): Map<string, Set<string>> {
  // Units a name can lead to: the spec's top-level helpers, the actions and the shared helpers.
  const units = new Map<string, string>();
  for (const file of specs) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*(?::[^=]*)?=>/gm)) {
      units.set(m[1] ?? m[2], topLevelBlock(src, m.index ?? 0));
    }
  }
  for (const a of actions) units.set(a.action, a.body);
  const actionNames = new Map(actions.filter((a) => !a.shared).map((a) => [a.action, actionKey(a.kind, a.domain, a.action)]));
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
    for (const n of seen) { const k = actionNames.get(n); if (k) out.set(k, new Set([...(out.get(k) ?? []), s.id])); }
  }
  return out;
}

/** A content hash per action file (project-relative path → hash): frozen with the draft, compared at the verdict. */
export function actionHashes(files: string[]): Record<string, string> {
  return Object.fromEntries(files.map((f) => [path.relative(ROOT, f).split(path.sep).join('/'), crypto.createHash('sha256').update(fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 16)]));
}

// ---- oracle guard ---------------------------------------------------------------------------------

/**
 * Expected messages of a story (quoted in its outcomes, and its error bodies): text an action must never carry. A
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

export interface ActionFinding { level: 'error' | 'warn'; code: string; message: string }

/**
 * The action files a story uses hold HOW only (no requirement assertion, no expected answer of the story, no import of
 * a story's own code), and keep the layout that lets many people add actions without merge conflicts: one documented
 * action per file, named after it, in its domain's folder, no index files.
 */
export function lintActions(files: string[], contract?: RequirementContract, profileDir?: string): ActionFinding[] {
  const out: ActionFinding[] = [];
  const literals = oracleLiterals(contract).map((l) => l.toLowerCase());
  for (const file of files) {
    const name = path.relative(ROOT, file).split(path.sep).join('/');
    const src = fs.readFileSync(file, 'utf8');
    if (/\[REQ\b/.test(src)) out.push({ level: 'error', code: 'req-assertion', message: `${name} has a [REQ …] assertion — what a story expects belongs in its test, never in a shared action` });
    if (/\bexpectResponse\(/.test(src)) out.push({ level: 'error', code: 'expect-response', message: `${name} calls expectResponse — return the answer and let the test assert it` });
    if (/@req-constants/.test(src)) out.push({ level: 'error', code: 'req-constants', message: `${name} has a @req-constants block — expected values belong in the story's spec` });
    const low = src.toLowerCase();
    for (const lit of literals) if (low.includes(lit)) out.push({ level: 'error', code: 'oracle-literal', message: `${name} contains "${lit}", an expected value of the story — locate the element by its role, test id or position, and leave the expectation to the test` });
    for (const m of src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) if (/\.spec(\.ts)?$|\/tests\//.test(m[1])) out.push({ level: 'error', code: 'imports-story', message: `${name} imports ${m[1]} — actions are shared by every story and import only heldout-support, other actions and their domain's shared files` });
    // Layout: what keeps many people's new actions in files of their own.
    const base = profileDir ?? path.resolve(path.dirname(file), '..', '..');
    const relFile = path.relative(base, file).split(path.sep).join('/');
    const place = placeOf(relFile);
    const fns = actionsIn(file, base);
    if (path.basename(file) === 'index.ts') out.push({ level: 'warn', code: 'index-file', message: `${name}: no index files — every new action would edit it (a merge conflict for everyone); specs import each action file directly` });
    else if (!place.inDomain) out.push({ level: 'warn', code: 'no-domain-folder', message: `${name} is not in a domain folder — move it to ${place.kind}/<domain>/<action>.ts` });
    if (!isShared(file) && fns.length > 1) out.push({ level: 'warn', code: 'one-action-per-file', message: `${name} exports ${fns.length} actions (${fns.map((f) => f.action).join(', ')}) — one per file, so two people adding actions never edit the same file: move each to ${place.kind}/${place.domain}/<its-name>.ts, and what they share to ${place.kind}/${place.domain}/_shared.ts` });
    if (!isShared(file) && fns.length === 1 && path.basename(file, '.ts') !== kebab(fns[0].action)) out.push({ level: 'warn', code: 'file-name', message: `${name}: name the file after its action, ${kebab(fns[0].action)}.ts (two people adding the same action then meet in one file instead of two copies)` });
    if (!isShared(file)) for (const f of fns) if (!f.summary) out.push({ level: 'warn', code: 'no-summary', message: `${name}: ${f.action} has no /** doc comment */ — the map shows it to the next test author` });
  }
  return out;
}

/**
 * Actions that look like the same action under two names (two people added it on two branches): the same kind and the
 * same calls, or the same routes and locators. Each group is a candidate to merge into one.
 */
export function duplicateActions(actions: ActionInfo[]): ActionInfo[][] {
  const sig = (a: ActionInfo) => (a.endpoints?.length ? `${a.kind}|calls|${[...a.endpoints].sort().join(',')}`
    : a.routes?.length || a.locators?.length ? `${a.kind}|ui|${[...(a.routes ?? [])].sort().join(',')}|${[...(a.locators ?? [])].sort().join(',')}` : '');
  const groups = new Map<string, ActionInfo[]>();
  for (const a of actions) { const s = sig(a); if (s) groups.set(s, [...(groups.get(s) ?? []), a]); }
  return [...groups.values()].filter((g) => g.length > 1);
}

// ---- relevance ------------------------------------------------------------------------------------

/** Whether an action concerns the story: it calls one of its endpoints' resources, opens a route it starts on, or its
 *  domain is a word of the story. */
export function relevantAction(a: ActionInfo, c?: RequirementContract): boolean {
  if (!c) return false;
  const seg = (p: string) => p.toLowerCase().split('/').filter(Boolean)[0] ?? '';
  const resources = new Set((c.endpoints ?? []).map((e) => seg(e.path)).filter(Boolean));
  if ((a.endpoints ?? []).some((e) => resources.has(seg(e.split(' ')[1] ?? '')))) return true;
  const starts = (c.acceptanceCriteria ?? []).map((x) => x.entryPoint ?? '').filter((e) => /^[/#]/.test(e.trim())).map(seg);
  if ((a.routes ?? []).some((r) => starts.includes(seg(r)))) return true;
  const text = JSON.stringify([c.title, c.context, c.acceptanceCriteria?.map((x) => [x.text, x.entryPoint]), c.testData]).toLowerCase();
  const word = a.domain.toLowerCase().replace(/s$/, '');
  return word.length >= 3 && new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text);
}

// ---- rendering ------------------------------------------------------------------------------------

export function describeAction(a: Pick<ActionInfo, 'summary' | 'endpoints' | 'routes' | 'locators'>): string {
  return [
    a.summary ?? '(no doc comment)',
    a.endpoints?.length ? `calls ${a.endpoints.join(', ')}` : '',
    a.routes?.length ? `opens ${a.routes.join(', ')}` : '',
    a.locators?.length ? `uses ${a.locators.slice(0, 4).join(', ')}${a.locators.length > 4 ? ', …' : ''}` : '',
  ].filter(Boolean).join(' · ');
}
