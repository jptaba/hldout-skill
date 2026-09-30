/**
 * `doctor --learn`: the first app knowledge, read from the running application without changing anything. It visits
 * the start page and the pages its navigation links to, and records for each its route, its name (the link text), a
 * readiness anchor (a heading that is on the page exactly once) and whether it is a sign-in or sign-up page; the API
 * calls those pages make on the app's own site (method and path); and, when the application publishes an OpenAPI or
 * Swagger document, its paths, methods, request fields and whether they need auth — never its responses, which
 * describe what the application answers (the oracle).
 *
 * Run again later, it re-checks the pages it knows (not those behind a sign-in): a page that no longer loads, or whose
 * anchor is gone, is marked stale. Only new values and stale marks are written.
 */
import { AD_DOMAINS, loadChromium } from './detect';
import { resolveUrl, type AutProfile } from './config';
import { keys, normRoute, statusOf, valueId, type KnowledgeEntry, type KnowledgeRecord, type Observation } from './knowledge';
import { closeOverlays, locateOn } from './page';

interface Loc { count(): Promise<number>; first(): { waitFor(o: object): Promise<void> } }
/** Whether a known anchor shows up on the page. It is waited for: a page may render its content after it loads. */
const shows = (page: PwPage, expr: string) => locateOn<Loc>(page, expr).first().waitFor({ state: 'attached', timeout: 10_000 }).then(() => true, () => false);
interface Resp { status(): number }
interface PwPage {
  on(event: 'response', fn: (r: { url(): string; headers(): Record<string, string>; request(): { method(): string; resourceType(): string } }) => void): void;
  route(url: string, fn: (r: { abort(): Promise<void>; request(): { url(): string } }) => Promise<void>): Promise<void>;
  goto(url: string, o: object): Promise<Resp | null>;
  waitForLoadState(state: string, o: object): Promise<unknown>;
  evaluate<T, A>(fn: (arg: A) => T, arg: A): Promise<T>;
  getByRole(role: string, o: object): Loc;
  addLocatorHandler(l: never, h: (l: never) => Promise<unknown>): Promise<unknown>;
}

const SIGN_IN = /\b(log ?in|sign ?in)\b/i;
const SIGN_UP = /\b(sign ?up|register|registration|create (an )?account)\b/i;
/** A path segment that is one record's id: a number, a UUID, a long hex run (Mongo ids). */
const idSegment = (s: string) => /^\d+$/.test(s) || /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s) || /^[0-9a-f]{16,}$/i.test(s);
/** Where applications publish their API document: the JSON itself, or a Swagger UI / Redoc page that names it. */
const OPENAPI_PATHS = ['openapi.json', 'swagger.json', 'v3/api-docs', 'api-docs', 'swagger/v1/swagger.json', 'api/openapi.json', 'api/swagger.json',
  'api-docs/swagger.json', 'docs/openapi.json', 'swagger', 'swagger-ui', 'swagger-ui.html', 'api/documentation', 'api-docs/', 'docs', 'redoc'];

/** A page address as a route of the app: the path under the base URL, plus a hash route ("/#/login"). */
export function routeOf(url: string, baseURL: string): string | undefined {
  const u = new URL(url); const b = new URL(baseURL);
  if (u.origin !== b.origin) return undefined;
  const basePath = b.pathname.endsWith('/') ? b.pathname : b.pathname.replace(/[^/]*$/, '');
  const pathPart = u.pathname.startsWith(basePath) ? `/${u.pathname.slice(basePath.length)}` : u.pathname;
  return normRoute(`${pathPart}${u.hash.startsWith('#/') || u.hash.startsWith('#!/') ? u.hash : ''}`);
}

/** An API call's path relative to the API base, with record ids as {id}. */
export function endpointPathOf(url: string, apiBaseURL: string): string | undefined {
  const u = new URL(url); const b = new URL(apiBaseURL);
  if (u.origin !== b.origin) return undefined;
  const base = b.pathname.replace(/\/+$/, '');
  const rest = base && u.pathname.startsWith(`${base}/`) ? u.pathname.slice(base.length) : u.pathname;
  return rest.split('/').map((s) => (s && idSegment(s) ? '{id}' : s)).join('/') || '/';
}

type Json = Record<string, unknown>;
/** Top-level field names of a request body schema ($ref resolved, one level). */
function fieldsOf(schema: Json | undefined, doc: Json): string[] {
  let s = schema;
  for (let i = 0; i < 3 && s && typeof s.$ref === 'string'; i++) s = (s.$ref as string).replace(/^#\//, '').split('/').reduce<unknown>((o, k) => (o as Json)?.[k], doc) as Json | undefined;
  return s && typeof s.properties === 'object' ? Object.keys(s.properties as Json) : [];
}

/** Endpoints of an OpenAPI 3 / Swagger 2 document: method, path, request fields, auth. Responses are left out. */
export function endpointsOfApiDoc(doc: Json, apiBaseURL: string): { method: string; path: string; query?: string[]; requestFields?: string[]; auth?: string }[] {
  const servers = doc.servers as { url?: string }[] | undefined;
  const serverPath = (() => { try { return new URL(servers?.[0]?.url ?? '', apiBaseURL).pathname.replace(/\/+$/, ''); } catch { return ''; } })();
  const basePath = typeof doc.basePath === 'string' ? doc.basePath.replace(/\/+$/, '') : serverPath;
  const apiPath = new URL(apiBaseURL).pathname.replace(/\/+$/, '');
  const out: { method: string; path: string; query?: string[]; requestFields?: string[]; auth?: string }[] = [];
  const deref = (x: Json) => (typeof x.$ref === 'string' ? ((x.$ref as string).replace(/^#\//, '').split('/').reduce<unknown>((o, k) => (o as Json)?.[k], doc) as Json | undefined) ?? x : x);
  for (const [p, item] of Object.entries((doc.paths ?? {}) as Record<string, Json>)) {
    for (const [m, op] of Object.entries(item ?? {})) {
      if (!/^(get|post|put|patch|delete)$/i.test(m) || !op || typeof op !== 'object') continue;
      const o = op as Json;
      const full = `${basePath}${p}`;
      const rel = apiPath && full.startsWith(`${apiPath}/`) ? full.slice(apiPath.length) : full;
      const content = ((o.requestBody as Json | undefined)?.content ?? {}) as Record<string, { schema?: Json }>;
      const bodySchema = content['application/json']?.schema ?? content['application/x-www-form-urlencoded']?.schema ?? Object.values(content)[0]?.schema;
      const params = [...((item.parameters ?? []) as Json[]), ...((o.parameters ?? []) as Json[])].map(deref);
      const query = [...new Set(params.filter((x) => x.in === 'query').map((x) => String(x.name)))];
      const swaggerBody = params.find((x) => x.in === 'body')?.schema as Json | undefined;
      const formFields = params.filter((x) => x.in === 'formData').map((x) => String(x.name));
      const fields = [...new Set([...fieldsOf(bodySchema ?? swaggerBody, doc), ...formFields])];
      const security = (o.security ?? doc.security) as unknown[] | undefined;
      const auth = Array.isArray(security) ? (security.some((s) => s && Object.keys(s as Json).length) ? 'required' : 'none') : undefined;
      out.push({ method: m.toUpperCase(), path: rel, ...(query.length ? { query } : {}), ...(fields.length ? { requestFields: fields } : {}), ...(auth ? { auth } : {}) });
    }
  }
  return out.slice(0, 400);
}

/** The document a Swagger UI / Redoc page loads: `url: "…"`, `spec-url="…"` or a docs-URL variable in its HTML. */
export function specUrlInHtml(html: string, pageUrl: string): string | undefined {
  const m = html.match(/\burl\s*:\s*["']([^"']+)["']/) ?? html.match(/spec-url=["']([^"']+)["']/) ?? html.match(/DOCS_URL__\s*=\s*["']([^"']+)["']/);
  if (!m || /oauth2|redirect/i.test(m[1])) return undefined;
  try { return new URL(m[1], pageUrl).toString(); } catch { return undefined; }
}

async function apiDocAt(url: string, depth = 0): Promise<{ url: string; doc: Json } | undefined> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8_000), headers: { accept: 'application/json, text/html' } });
    if (!r.ok) return undefined;
    const type = r.headers.get('content-type') ?? '';
    if (/json/i.test(type)) {
      const doc = await r.json() as Json;
      return (doc.openapi || doc.swagger) && doc.paths && typeof doc.paths === 'object' ? { url, doc } : undefined;
    }
    if (/html/i.test(type) && depth === 0) {
      const spec = specUrlInHtml(await r.text(), url);
      return spec ? apiDocAt(spec, 1) : undefined;
    }
  } catch { /* not there */ }
  return undefined;
}

async function findApiDoc(bases: string[]): Promise<{ url: string; doc: Json } | undefined> {
  for (const base of [...new Set(bases)]) for (const p of OPENAPI_PATHS) {
    const found = await apiDocAt(resolveUrl(base, p));
    if (found) return found;
  }
  return undefined;
}

/** stale: known values the application no longer shows; replaced: values only doctor saw, now seen differently. */
export interface LearnResult { facts: Observation[]; pages: number; endpoints: number; stale: number; replaced: number; apiDoc?: string; error?: string }

export async function learnApp(profile: AutProfile, known: KnowledgeEntry[], at = new Date().toISOString()): Promise<LearnResult> {
  const apiBase = profile.apiBaseURL ?? profile.baseURL;
  const obs: Observation[] = [];
  const seen = (key: string, kind: Observation['kind'], value: Record<string, unknown>, evidence: string) => obs.push({ key, kind, value, status: 'seen', at, by: 'doctor', evidence });
  let error: string | undefined;

  const chromium = await loadChromium<PwPage>();
  if (!chromium) error = 'Playwright is not installed: pages were not visited';
  else {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const blocked = [...(profile.blockHosts ?? []), ...AD_DOMAINS];
      await page.route('**/*', async (r) => {
        const host = (() => { try { return new URL(r.request().url()).hostname; } catch { return ''; } })();
        if (blocked.some((h) => host === h || host.endsWith(`.${h}`))) await r.abort(); else await (r as unknown as { continue(): Promise<void> }).continue();
      });
      await closeOverlays(page as never, profile.overlays);
      const calls = new Map<string, { method: string; path: string }>();
      page.on('response', (r) => {
        try {
          if (!['xhr', 'fetch'].includes(r.request().resourceType()) || !/json/i.test(r.headers()['content-type'] ?? '')) return;
          const p = endpointPathOf(r.url(), apiBase);
          if (p) calls.set(`${r.request().method()} ${p}`, { method: r.request().method(), path: p });
        } catch { /* ignore */ }
      });
      const settle = async () => { await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined); };
      /** The page's first heading that is on it exactly once, as a readiness anchor. */
      const anchor = async (): Promise<string | undefined> => {
        const texts = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3')].map((h) => (h as HTMLElement).innerText.replace(/\s+/g, ' ').trim()).filter((t) => t && t.length <= 60), null).catch(() => [] as string[]);
        for (const t of texts.slice(0, 3)) if (await page.getByRole('heading', { name: t, exact: true }).count().catch(() => 0) === 1) return `getByRole('heading', { name: '${t.replace(/'/g, "\\'")}' })`;
        return undefined;
      };
      const hasPassword = () => page.evaluate(() => document.querySelectorAll('input[type=password]').length, null).catch(() => 0);

      await page.goto(profile.baseURL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await settle();
      const links = await page.evaluate((origin: string) => [...document.querySelectorAll('header a[href], nav a[href], [role="navigation"] a[href], a[href*="login"], a[href*="register"], a[href*="signup"]')]
        .map((a) => ({ href: (a as HTMLAnchorElement).href, text: ((a as HTMLElement).innerText || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim() }))
        .filter((l) => l.href.startsWith(origin) && !/logout|signout|sign-out|log-out|delete/i.test(l.href)), new URL(profile.baseURL).origin).catch(() => [] as { href: string; text: string }[]);
      const targets = new Map<string, string>([[routeOf(profile.baseURL, profile.baseURL) ?? '/', '']]);
      for (const l of links) { const r = routeOf(l.href, profile.baseURL); if (r && !targets.has(r) && targets.size < 16) targets.set(r, l.text); }

      const knownPages = known.filter((e) => e.kind === 'page');
      const visited = new Set<string>();
      const visit = async (route: string) => {
        const res = await page.goto(resolveUrl(profile.baseURL, route.replace(/^\//, '')), { waitUntil: 'domcontentloaded', timeout: 20_000 }).catch(() => null);
        await settle();
        visited.add(route);
        return res;
      };
      for (const [route, text] of targets) {
        const res = await visit(route);
        if (res && res.status() >= 400) continue;
        const ready = await anchor();
        const pw = await hasPassword();
        const purpose = SIGN_UP.test(`${text} ${route}`) ? 'sign-up' : SIGN_IN.test(`${text} ${route}`) ? 'sign-in' : undefined;
        const value = { route, ...(text ? { name: text } : route === '/' ? { name: 'start page' } : {}), ...(ready ? { ready } : {}), ...(purpose || pw ? { purpose: purpose ?? 'sign-in' } : {}) };
        seen(keys.page(route), 'page', value, `doctor --learn visited ${route}`);
        // A known value whose anchor is gone from the page it names is stale.
        for (const e of knownPages.filter((k) => normRoute(String(k.best.value.route ?? '')) === route && !k.best.value.signedIn)) {
          for (const r of [e.best, ...e.alternatives]) {
            if (statusOf(r) === 'stale' || !r.value.ready) continue;
            if (!await shows(page, String(r.value.ready))) { obs.push(staleOf(r, at, `doctor --learn: ${String(r.value.ready)} is not on ${route}`)); }
          }
        }
      }
      // Known pages the navigation no longer links to (and that need no sign-in): do they still load?
      for (const e of knownPages.filter((k) => k.status !== 'stale' && !k.best.value.signedIn).slice(0, 25)) {
        const route = normRoute(String(e.best.value.route ?? ''));
        if (visited.has(route)) continue;
        const res = await visit(route);
        const ready = e.best.value.ready ? await shows(page, String(e.best.value.ready)) : true;
        if (!res || res.status() >= 400 || !ready) { obs.push(staleOf(e.best, at, `doctor --learn: ${route} ${!res || res.status() >= 400 ? `answered ${res?.status() ?? 'nothing'}` : `has no ${String(e.best.value.ready)}`}`)); }
      }
      for (const c of calls.values()) seen(keys.endpoint(c.method, c.path), 'endpoint', { method: c.method, path: c.path }, 'doctor --learn: called by the web app while loading its pages');
    } catch (e) {
      error = (e as Error).message.split('\n')[0];
    } finally { await browser.close(); }
  }

  const doc = await findApiDoc([apiBase, profile.baseURL]);
  if (doc) {
    seen(keys.app('api-docs'), 'app', { apiDocs: doc.url }, 'doctor --learn: published API document');
    for (const e of endpointsOfApiDoc(doc.doc, apiBase)) seen(keys.endpoint(e.method, e.path), 'endpoint', { method: e.method, path: e.path, ...(e.query ? { query: e.query } : {}), ...(e.requestFields ? { requestFields: e.requestFields } : {}), ...(e.auth ? { auth: e.auth } : {}) }, `doctor --learn: ${doc.url}`);
  }

  // One value per key from this visit: an endpoint seen in a page's calls and in the API document is one entry.
  const sightings = new Map<string, Observation>();
  for (const o of obs.filter((x) => x.status === 'seen')) {
    const prev = sightings.get(o.key);
    sightings.set(o.key, prev ? { ...o, value: { ...prev.value, ...o.value }, evidence: `${prev.evidence}; ${o.evidence}` } : o);
  }
  // Only what is new: a value already known (and not stale) is not written again. A value only doctor ever saw, that
  // this visit sees differently, is superseded (stale); what a story proved stays until its anchor is gone.
  const live = known.flatMap((e) => [e.best, ...e.alternatives]).filter((r) => statusOf(r) !== 'stale');
  const have = new Set(live.map((r) => valueId(r.key, r.value)));
  const facts: Observation[] = obs.filter((o) => o.status === 'stale');
  for (const o of sightings.values()) {
    if (have.has(valueId(o.key, o.value))) continue;
    facts.push(o);
    for (const r of live.filter((x) => x.key === o.key && !x.stories.length && !facts.some((f) => f.status === 'stale' && valueId(f.key, f.value) === valueId(x.key, x.value)))) {
      facts.push(staleOf(r, at, 'doctor --learn: superseded by what the application shows now'));
    }
  }
  const superseded = (f: Observation) => f.status === 'stale' && f.evidence?.includes('superseded');
  return { facts, pages: facts.filter((f) => f.kind === 'page' && f.status === 'seen').length, endpoints: facts.filter((f) => f.kind === 'endpoint' && f.status === 'seen').length,
    stale: facts.filter((f) => f.status === 'stale' && !superseded(f)).length, replaced: facts.filter(superseded).length, ...(doc ? { apiDoc: doc.url } : {}), ...(error ? { error } : {}) };
}

const staleOf = (r: KnowledgeRecord, at: string, evidence: string): Observation => ({ key: r.key, kind: r.kind, value: r.value, status: 'stale', at, by: 'doctor', evidence });
