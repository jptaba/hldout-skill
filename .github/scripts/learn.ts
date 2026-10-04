/**
 * `doctor --learn`: the first app knowledge, read from the running application without changing anything. It visits
 * the start page and the pages its navigation links to, and records for each its route, its name (the link text), a
 * readiness anchor (a heading that is on the page exactly once) and whether it is a sign-in or sign-up page; and the API
 * calls those pages make on the app's own site (method and path) — never what they answer (the oracle). It assumes no
 * API document: an OpenAPI or Swagger definition is a requirement source only when a story provides it.
 *
 * Run again later, it re-checks the pages it knows (not those behind a sign-in): a page that no longer loads, or whose
 * anchor is gone, is marked stale. Only new values and stale marks are written.
 */
import { AD_DOMAINS, loadChromium } from './detect';
import { resolveUrl, type AutProfile } from './config';
import { keys, normRoute, statusOf, valueId, type KnowledgeEntry, type KnowledgeRecord, type Observation } from './knowledge-store';
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

/** stale: known values the application no longer shows; replaced: values only doctor saw, now seen differently. */
export interface LearnResult { facts: Observation[]; pages: number; endpoints: number; stale: number; replaced: number; error?: string }

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

  // One value per key from this visit.
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
    stale: facts.filter((f) => f.status === 'stale' && !superseded(f)).length, replaced: facts.filter(superseded).length, ...(error ? { error } : {}) };
}

const staleOf = (r: KnowledgeRecord, at: string, evidence: string): Observation => ({ key: r.key, kind: r.kind, value: r.value, status: 'stale', at, by: 'doctor', evidence });
