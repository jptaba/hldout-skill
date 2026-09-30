/**
 * App knowledge: what the evaluator has learned about HOW to drive an application, kept per AUT profile in
 * aut-knowledge/<profile>/ and shared by every story on that application.
 *
 * Mechanics only — routes and how to reach a page, readiness anchors, proven locators, endpoints with their auth and
 * request fields, seed and cleanup recipes, notes on pacing or plumbing. Never what the application answers: statuses,
 * messages, limits and values are the oracle, and the oracle comes from the requirement alone. The kinds below have no
 * field for an answer, and free text is checked for one.
 *
 * Conflict-free by construction: every write (doctor --learn, a story's harvest) is a NEW file in facts/, never an edit.
 * Two people on two branches write two files, and git merges them without a conflict. What the knowledge says now is
 * computed on read, by folding every snapshot and fact file:
 *
 *  - a record per entry key and value (the same page with another readiness anchor is another value);
 *  - each record keeps the latest time it was seen (doctor), proven (a passing test used it) and found stale, and the
 *    stories that proved it: merging keeps the maximum of each time and the union of the stories, so the fold gives the
 *    same result in any order and a file folded twice changes nothing;
 *  - a value is stale when its latest stale mark is newer than its latest sighting or proof; of the other values of a
 *    key, the proven one used most recently comes first, and the rest are shown as alternatives until a later story
 *    settles them.
 *
 * Compaction folds everything into one snapshot file and deletes the files it folded; snapshots fold like fact files,
 * so two compactions on two branches lose nothing.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, unmangleMsysPath } from './config';
import type { RequirementContract } from './contract';

export const KNOWLEDGE_DIR = 'aut-knowledge';
export type KnowledgeKind = 'app' | 'page' | 'locator' | 'endpoint' | 'seed' | 'note';
export type KnowledgeStatus = 'seen' | 'proven' | 'stale';
export const KINDS: KnowledgeKind[] = ['app', 'page', 'locator', 'endpoint', 'seed', 'note'];

/** One observation, as written in a fact file. `by` is "doctor" or the story key that proved it. */
export interface Observation {
  key: string;
  kind: KnowledgeKind;
  value: Record<string, unknown>;
  status: KnowledgeStatus;
  at: string;
  by: string;
  evidence?: string;
}
export interface FactFile { schema: 1; profile: string; by: string; at: string; facts: Observation[] }

/** One key + value after the fold. */
export interface KnowledgeRecord {
  key: string;
  kind: KnowledgeKind;
  value: Record<string, unknown>;
  seenAt?: string;
  provenAt?: string;
  staleAt?: string;
  /** Stories whose passing tests used this value. */
  stories: string[];
  /** Who reported it (doctor, story keys). */
  by: string[];
  evidence?: string;
}
export interface Snapshot { schema: 1; profile: string; compactedAt: string; records: KnowledgeRecord[] }

/** What a key says now: its best value, other live values, and whether every value is stale. */
export interface KnowledgeEntry { key: string; kind: KnowledgeKind; status: KnowledgeStatus; best: KnowledgeRecord; alternatives: KnowledgeRecord[] }

// ---- keys -----------------------------------------------------------------------------------------

/** Path parameters in any spelling ({id}, :id, <id>) become {}, so /contacts/{id} and /contacts/:contactId match. */
export const normPath = (p: string) => (unmangleMsysPath(p).replace(/\{[^}]*\}|<[^>]*>|:[A-Za-z_]\w*/g, '{}').replace(/(.)\/+$/, '$1') || '/');
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
/** A route as stored: starts with "/", keeps a hash route ("/#/login"), no trailing slash. Git Bash's rewriting of a
 *  "/route" argument into a Windows path is undone. */
export const normRoute = (r: string) => {
  const t = unmangleMsysPath(r.trim()).replace(/^\.?\/?/, '/');
  return t.replace(/(.)\/+$/, '$1') || '/';
};
export const keys = {
  app: (name: string) => `app:${slug(name)}`,
  page: (route: string) => `page:${normRoute(route)}`,
  locator: (route: string, element: string) => `locator:${normRoute(route)} ${slug(element)}`,
  endpoint: (method: string, p: string) => `api:${method.toUpperCase()} ${normPath(p)}`,
  seed: (entity: string) => `seed:${slug(entity)}`,
  note: (topic: string) => `note:${slug(topic)}`,
};

// ---- fold -----------------------------------------------------------------------------------------

function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical((v as Record<string, unknown>)[k])]).filter(([, x]) => x !== undefined));
  return v;
}
export const valueId = (key: string, value: unknown) => `${key}\u0000${JSON.stringify(canonical(value))}`;
const later = (a?: string, b?: string) => (!a ? b : !b ? a : a > b ? a : b);

export function recordOf(o: Observation): KnowledgeRecord {
  return {
    key: o.key, kind: o.kind, value: canonical(o.value) as Record<string, unknown>,
    ...(o.status === 'seen' ? { seenAt: o.at } : o.status === 'proven' ? { provenAt: o.at } : { staleAt: o.at }),
    stories: o.status === 'proven' && o.by !== 'doctor' ? [o.by] : [], by: [o.by], ...(o.evidence ? { evidence: o.evidence } : {}),
  };
}

export function mergeRecords(a: KnowledgeRecord, b: KnowledgeRecord): KnowledgeRecord {
  const newest = (x: KnowledgeRecord) => later(later(x.seenAt, x.provenAt), x.staleAt) ?? '';
  const out: KnowledgeRecord = {
    key: a.key, kind: a.kind, value: a.value,
    seenAt: later(a.seenAt, b.seenAt), provenAt: later(a.provenAt, b.provenAt), staleAt: later(a.staleAt, b.staleAt),
    stories: [...new Set([...a.stories, ...b.stories])].sort(), by: [...new Set([...a.by, ...b.by])].sort(),
    evidence: (newest(b) > newest(a) ? b.evidence ?? a.evidence : a.evidence ?? b.evidence),
  };
  for (const k of ['seenAt', 'provenAt', 'staleAt', 'evidence'] as const) if (out[k] === undefined) delete out[k];
  return out;
}

export const statusOf = (r: KnowledgeRecord): KnowledgeStatus =>
  (r.staleAt && r.staleAt > (later(r.seenAt, r.provenAt) ?? '') ? 'stale' : r.provenAt ? 'proven' : 'seen');

/** Fold observations and records (fact files, snapshots) into one record per key + value. Order does not matter. */
export function fold(items: (Observation | KnowledgeRecord)[]): KnowledgeRecord[] {
  const byId = new Map<string, KnowledgeRecord>();
  for (const item of items) {
    const r = 'status' in item ? recordOf(item as Observation) : { ...(item as KnowledgeRecord), value: canonical(item.value) as Record<string, unknown> };
    const id = valueId(r.key, r.value);
    const prev = byId.get(id);
    byId.set(id, prev ? mergeRecords(prev, r) : r);
  }
  return [...byId.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Records grouped by key: the best live value first (proven before seen, most recent first), then alternatives. */
export function entries(records: KnowledgeRecord[]): KnowledgeEntry[] {
  const groups = new Map<string, KnowledgeRecord[]>();
  for (const r of records) groups.set(r.key, [...(groups.get(r.key) ?? []), r]);
  const rank = (r: KnowledgeRecord) => ({ proven: 0, seen: 1, stale: 2 }[statusOf(r)]);
  const recent = (r: KnowledgeRecord) => later(r.provenAt, r.seenAt) ?? r.staleAt ?? '';
  return [...groups.entries()].map(([key, rs]) => {
    const sorted = [...rs].sort((a, b) => rank(a) - rank(b) || recent(b).localeCompare(recent(a)));
    const best = sorted[0];
    // Alternatives are values as good as the best: under a proven value, what was only seen is not offered.
    const live = sorted.filter((r) => statusOf(r) !== 'stale' && (statusOf(best) !== 'proven' || statusOf(r) === 'proven'));
    return { key, kind: best.kind, status: statusOf(best), best, alternatives: live.filter((r) => r !== best) };
  }).sort((a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.key.localeCompare(b.key));
}

// ---- files ----------------------------------------------------------------------------------------

export const knowledgeDir = (profile: string, root = ROOT) => path.join(root, KNOWLEDGE_DIR, profile);
const stamp = (d = new Date()) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const rand = () => crypto.randomBytes(3).toString('hex');

export interface KnowledgeStore { records: KnowledgeRecord[]; files: string[]; snapshots: string[] }

export function loadKnowledge(profile: string, root = ROOT): KnowledgeStore {
  const dir = knowledgeDir(profile, root);
  const factsDir = path.join(dir, 'facts');
  const snapshots = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^snapshot-.*\.json$/.test(f)).sort().map((f) => path.join(dir, f)) : [];
  const files = fs.existsSync(factsDir) ? fs.readdirSync(factsDir).filter((f) => f.endsWith('.json')).sort().map((f) => path.join(factsDir, f)) : [];
  const items: (Observation | KnowledgeRecord)[] = [];
  for (const f of snapshots) items.push(...(JSON.parse(fs.readFileSync(f, 'utf8')) as Snapshot).records);
  for (const f of files) items.push(...(JSON.parse(fs.readFileSync(f, 'utf8')) as FactFile).facts);
  return { records: fold(items), files, snapshots };
}

/** Write observations as a new fact file (never an existing one). Returns its path, or undefined when there is nothing. */
export function writeFacts(profile: string, by: string, facts: Observation[], root = ROOT): string | undefined {
  if (!facts.length) return undefined;
  const at = new Date();
  const file = path.join(knowledgeDir(profile, root), 'facts', `${stamp(at)}-${slug(by)}-${rand()}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body: FactFile = { schema: 1, profile, by, at: at.toISOString(), facts };
  fs.writeFileSync(file, `${JSON.stringify(body, null, 2)}\n`);
  return file;
}

/** Fold every file into one new snapshot and delete the files it folded. */
export function compact(profile: string, root = ROOT): { snapshot: string; folded: number; records: number } | undefined {
  const store = loadKnowledge(profile, root);
  const folded = [...store.snapshots, ...store.files];
  if (folded.length <= 1) return undefined;
  const at = new Date();
  const snapshot = path.join(knowledgeDir(profile, root), `snapshot-${stamp(at)}-${rand()}.json`);
  const body: Snapshot = { schema: 1, profile, compactedAt: at.toISOString(), records: store.records };
  fs.writeFileSync(snapshot, `${JSON.stringify(body, null, 2)}\n`);
  for (const f of folded) fs.rmSync(f);
  return { snapshot, folded: folded.length, records: store.records.length };
}

// ---- oracle guard ---------------------------------------------------------------------------------

/**
 * Free text in an entry (a note, a seed or endpoint description) must not carry what the application answers: a
 * status code stated as an answer, or an expected message of the story. Returns the reason, or undefined.
 */
export function oracleLeak(o: Pick<Observation, 'kind' | 'value'>, contract?: RequirementContract): string | undefined {
  // A locator can carry an answer too: getByText('There are no products found.') is the story's expected message.
  const located = ['locator', 'ready'].map((k) => o.value[k]).filter((v): v is string => typeof v === 'string').join('\n').toLowerCase();
  for (const lit of oracleLiterals(contract)) if (located && located.includes(lit.toLowerCase())) return `the locator looks for "${lit}", an expected value of the story (locate the element by its role, test id or position instead)`;
  const free = ['text', 'reach', 'note'].map((k) => o.value[k]).filter((v): v is string => typeof v === 'string').join('\n');
  if (!free) return undefined;
  const status = free.match(/\b(?:status|returns?|respond(?:s|ed)?|answer(?:s|ed)?|http|code)\b[^.\n]{0,20}?\b([1-5]\d\d)\b/i);
  if (status) return `it states an answer (${status[0].trim()}): statuses are the oracle and come from the requirement`;
  const low = free.toLowerCase();
  for (const lit of oracleLiterals(contract)) if (low.includes(lit.toLowerCase())) return `it contains "${lit}", an expected value of the story`;
  return undefined;
}

/**
 * Expected messages of a story (quoted in its outcomes, and its error bodies): the text an entry must never carry. A
 * quoted name (a page or button: "Favorites", "Contact List") is how to find something, not an answer: a message has
 * three words or more, or ends like a sentence.
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

/**
 * Whether test code uses a locator expression: the same calls, where a quoted name may be a constant in the test
 * (REQ.MY_ACCOUNT) and an options object may carry more (exact: true). Spacing and quote style don't matter.
 */
export function usesLocator(source: string, expr: string): boolean {
  const squash = (s: string) => s.replace(/\s+/g, '').replace(/["`]/g, "'");
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const src = squash(source);
  // A trailing .first() / .nth(0) is how one test picks among matches: the locator is the same.
  const core = squash(expr).replace(/^page\./, '').replace(/(\.(first|last)\(\)|\.nth\(\d+\))+$/, '');
  const pattern = core.split(/('(?:[^'\\]|\\.)*')/)
    .map((part, i) => (i % 2 ? `(?:${esc(part)}|[A-Za-z_$][\\w.$]*)` : esc(part).replace(/\\\}/g, '(?:,[^}]*)?\\}'))).join('');
  if (new RegExp(pattern).test(src)) return true;
  // A name built from a variable ({ name, exact: true }): the same call with the same first argument, and a name.
  const head = core.match(/^(getBy\w+\('[^']*')(,\{name:)?/);
  return Boolean(head?.[2]) && new RegExp(`${esc(head![1])},\\{name[,:}]`).test(src);
}

// ---- relevance ------------------------------------------------------------------------------------

/**
 * The entries a story needs: the endpoints its contract names or its gaps and criteria mention, reading back and deleting
 * the records it works on, a list call of what its test data needs; the pages its criteria start on (a route, or a page
 * name) and their locators; seed recipes for the things it talks about; notes about those endpoints and pages (or
 * recorded app-wide); and the start, sign-in and sign-up pages and the API document.
 */
export function relevantTo(all: KnowledgeEntry[], c: RequirementContract): KnowledgeEntry[] {
  const eps = (c.endpoints ?? []).map((e) => `${e.method.toUpperCase()} ${normPath(e.path)}`);
  const segments = (p: string) => p.toLowerCase().split('/').filter(Boolean);
  // The story's resources (/carts, /carts/{} for POST /carts and POST /carts/{}): reading one back and deleting it are
  // what its gaps usually ask for, so their GET and DELETE are shown, no deeper than the story goes; and the paths its
  // gaps, criteria and test data mention.
  const depth = new Map<string, number>();
  for (const e of eps) { const s = segments(e.split(' ')[1]); if (s[0]) depth.set(s[0], Math.max(depth.get(s[0]) ?? 0, s.length)); }
  const makes = new Set(eps.filter((e) => /^(POST|PUT|PATCH|DELETE) /.test(e)).map((e) => segments(e.split(' ')[1])[0]).filter(Boolean));
  const mentioned = JSON.stringify([c.gaps?.map((g) => [g.element, g.value, g.tried?.map((t) => t.result)]), c.acceptanceCriteria?.map((a) => [a.text, a.outcomes]), c.testData]);
  // "DELETE /carts/{id}" is that call; a bare "/carts/{id}" is reading or deleting it.
  const mentions = [...mentioned.matchAll(/(?:\b(GET|POST|PUT|PATCH|DELETE|QUERY)\s+)?(?<![\w.])(\/[A-Za-z][\w\-/{}:<>]*)/g)].map((m) => ({ method: m[1], path: normPath(m[2]).toLowerCase() }));
  const mentionedPaths = new Set(mentions.map((m) => m.path));
  // Nouns of the test data ("any product that is in stock"): a list call of that resource finds one.
  const dataText = JSON.stringify(c.testData ?? '').toLowerCase();
  const epMatch = (key: string) => {
    const [km, kp] = key.slice('api:'.length).split(' ');
    if (eps.some((e) => { const [m, p] = e.split(' '); return m === km && (kp === p || kp.endsWith(p) || p.endsWith(kp)); })) return true;
    const read = km === 'GET' || km === 'QUERY';
    if (mentions.some((m) => m.path === kp.toLowerCase() && (m.method ? m.method === km : read || km === 'DELETE'))) return true;
    const s = segments(kp);
    // One record of a collection the story uses counts too (POST /contacts → GET and DELETE /contacts/{}).
    // Deleting only where the story makes records (a read-only story needs no cleanup call).
    if ((read || (km === 'DELETE' && makes.has(s[0]))) && depth.has(s[0]) && (s.length <= depth.get(s[0])! || (s.length === depth.get(s[0])! + 1 && s.at(-1) === '{}'))) return true;
    return read && s.length === 1 && s[0].length >= 4 && new RegExp(`\\b${s[0].replace(/s$/, '')}`).test(dataText);
  };
  const entryPoints = (c.acceptanceCriteria ?? []).map((a) => a.entryPoint ?? '').filter(Boolean);
  const routes = entryPoints.filter((e) => /^[/#]/.test(e.trim())).map(normRoute);
  const words = entryPoints.filter((e) => !/^[/#]/.test(e.trim())).map((e) => e.toLowerCase());
  const text = JSON.stringify([c.title, c.context, c.acceptanceCriteria?.map((a) => a.text), c.testData]).toLowerCase();
  /** Whether the story names the page (a route it starts on, or its name). */
  const pageMatch = (e: KnowledgeEntry) => {
    const v = e.best.value as { route?: string; name?: string; heading?: string; purpose?: string };
    const route = normRoute(String(v.route ?? ''));
    if (routes.includes(route)) return true;
    // By name: where a journey starts ("the Contact List page"), or the story naming it as a page, screen or form.
    const names = [v.name, v.heading].filter((n): n is string => Boolean(n)).map((n) => n.toLowerCase());
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (names.some((n) => n.length >= 3 && (words.some((w) => new RegExp(`\\b${esc(n)}\\b`).test(w)) || new RegExp(`\\b${esc(n)} (page|screen|form|tab|dialog)\\b`).test(text)))) return true;
    // A distinctive word of its name where a journey starts ("Catalogue (start page)" ↔ "the web shop catalogue").
    const distinctive = names.flatMap((n) => n.match(/[a-z]{5,}/g) ?? []).filter((w) => !['start', 'page', 'pages', 'screen'].includes(w));
    return distinctive.some((d) => words.some((w) => new RegExp(`\\b${esc(d)}`).test(w)));
  };
  const named = all.filter((e) => e.kind === 'page' && pageMatch(e));
  // The start page and the sign-in / sign-up pages are shown too (most journeys begin there), but their locators only
  // when the story names the page.
  const common = all.filter((e) => e.kind === 'page' && !named.includes(e) && ((e.best.value as { purpose?: string }).purpose || normRoute(String((e.best.value as { route?: string }).route ?? '')) === '/'));
  const pages = [...named, ...common];
  // …or talks about what the page is for (signing in, registering).
  const purposeNamed = (e: KnowledgeEntry) => {
    const purpose = (e.best.value as { purpose?: string }).purpose;
    return (purpose === 'sign-in' && /\b(sign(ed|s)?[- ]?in|log(ged|s)?[- ]?in|credentials)\b/.test(text)) || (purpose === 'sign-up' && /\b(sign(ed|s)?[- ]?up|regist\w*)\b/.test(text));
  };
  const pageRoutes = new Set([...routes, ...[...named, ...common.filter(purposeNamed)].map((e) => normRoute(String((e.best.value as { route?: string }).route ?? '')))]);
  // A locator on a page no entry describes yet: shown when the story talks about what the route names ("/product" → product).
  const routeNamed = (r: string) => r.split(/[/#]/).filter((s) => s.length >= 4 && !s.includes('{')).some((s) => {
    const w = s.toLowerCase().replace(/s$/, '');
    return words.some((x) => x.includes(w)) || new RegExp(`\\b${w}s?( details?)? (page|screen|form)\\b`).test(text);
  });
  // A note is shown when it applies to the whole application, or talks about the story's endpoints or pages. A note that
  // names paths is about those paths; one that names none, about the words of its topic (two of them in the story).
  const GENERIC = new Set(['route', 'field', 'where', 'which', 'shape', 'answer', 'value', 'their', 'there', 'other', 'about', 'every', 'after', 'before', 'error', 'items', 'shown', 'using', 'while', 'whole', 'application']);
  const storyWords = new Set((text.match(/[a-z]{5,}/g) ?? []).map((w) => w.replace(/s$/, '')));
  const storyPaths = [...eps.map((e) => e.split(' ')[1]), ...mentionedPaths].map((p) => segments(p)[0]).filter(Boolean);
  const noteMatch = (e: KnowledgeEntry) => {
    const v = e.best.value as { topic?: string; text?: string; appWide?: boolean };
    if (v.appWide) return true;
    const t = `${v.topic ?? ''} ${v.text ?? ''}`.toLowerCase();
    const paths = [...t.matchAll(/(?<![\w.])(\/[a-z][\w\-/{}:<>]*)/g)].map((m) => segments(m[1])[0]).filter(Boolean);
    if (paths.length) return paths.some((p) => storyPaths.includes(p)) || [...pageRoutes].some((r) => r.length > 1 && t.includes(r.toLowerCase()));
    const topicWords = [...new Set((`${v.topic ?? ''}`.toLowerCase().match(/[a-z]{5,}/g) ?? []).map((w) => w.replace(/s$/, '')).filter((w) => !GENERIC.has(w)))];
    return topicWords.filter((w) => storyWords.has(w)).length >= Math.min(2, topicWords.length);
  };
  return all.filter((e) => {
    if (e.kind === 'app') return true;
    if (e.kind === 'note') return noteMatch(e);
    if (e.kind === 'endpoint') return epMatch(e.key);
    if (e.kind === 'page') return pages.includes(e);
    if (e.kind === 'locator') { const r = normRoute(String((e.best.value as { route?: string }).route ?? '')); return pageRoutes.has(r) || routeNamed(r); }
    if (e.kind === 'seed') { const n = String((e.best.value as { entity?: string }).entity ?? '').toLowerCase().replace(/s$/, ''); return n.length >= 3 && text.includes(n); }
    return false;
  });
}

// ---- rendering ------------------------------------------------------------------------------------

const ago = (iso?: string) => (iso ? iso.slice(0, 10) : '');
export function describeValue(e: Pick<KnowledgeEntry, 'kind'> & { best: Pick<KnowledgeRecord, 'value'> }): string {
  const v = e.best.value as Record<string, unknown>;
  const list = (x: unknown) => (Array.isArray(x) && x.length ? x.join(', ') : '');
  switch (e.kind) {
    case 'app': return Object.entries(v).map(([k, x]) => `${k}: ${String(x)}`).join(' · ');
    case 'page': return [v.name ? `"${String(v.name)}"` : '', v.purpose ? `(${String(v.purpose)} page)` : '', v.ready ? `ready: ${String(v.ready)}` : '', v.reach ? `reach: ${String(v.reach)}` : '', v.signedIn ? 'signed in' : ''].filter(Boolean).join(' · ');
    case 'locator': return `${String(v.element)}: ${String(v.locator)}`;
    case 'endpoint': return [v.auth ? `auth ${String(v.auth)}` : '', v.authHeader ? `header ${String(v.authHeader)}` : '', list(v.query) ? `query ${list(v.query)}` : '', v.envelope ? `envelope ${String(v.envelope)}` : '', list(v.requestFields) ? `fields ${list(v.requestFields)}` : '', list(v.required) ? `required ${list(v.required)}` : '', v.contentType ? String(v.contentType) : ''].filter(Boolean).join(' · ') || 'exists';
    case 'seed': return [`create ${String(v.create)}`, v.id ? `id at ${String(v.id)}` : '', list(v.fields) ? `fields ${list(v.fields)}` : '', v.cleanup ? `cleanup ${String(v.cleanup)}` : ''].filter(Boolean).join(' · ');
    case 'note': return String(v.text);
  }
}
export function describeEntry(e: KnowledgeEntry): string {
  const r = e.best;
  const who = e.status === 'proven' ? `proven by ${r.stories.join(', ')}, ${ago(r.provenAt)}` : e.status === 'seen' ? `seen ${ago(r.seenAt)}` : `STALE since ${ago(r.staleAt)}`;
  const alt = e.alternatives.length ? `\n      also ${e.alternatives.map((a) => `${describeValue({ kind: e.kind, best: a })} (${statusOf(a)})`).join('; ')}` : '';
  return `${e.key.padEnd(34)} ${describeValue(e)}   [${who}]${alt}`;
}
