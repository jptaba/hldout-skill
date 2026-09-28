/**
 * Black-box discovery of profile settings from one visit of the start page, so a new project needs no guesswork:
 * the test-id attribute the web app renders (data-testid, data-test, data-qa, …), the app's name (page title), and
 * the ad/analytics networks it loads (candidates for blockHosts: they inject content and make pages flaky). The page
 * is rendered in Chromium (SPAs add their attributes client-side); without a browser the served HTML is scanned.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './config';

export const TEST_ID_ATTRIBUTES = ['data-testid', 'data-test', 'data-test-id', 'data-qa', 'data-cy', 'data-automation-id', 'data-e2e'] as const;

/** Ad, tracking and analytics networks — never part of an application under test. */
export const AD_DOMAINS = ['doubleclick.net', 'googlesyndication.com', 'googleadservices.com', 'adservice.google.com', 'google-analytics.com',
  'googletagmanager.com', 'googletagservices.com', 'amazon-adsystem.com', 'adnxs.com', 'criteo.com', 'criteo.net', 'taboola.com', 'outbrain.com',
  'pubmatic.com', 'rubiconproject.com', 'openx.net', 'casalemedia.com', 'scorecardresearch.com', 'quantserve.com', 'hotjar.com', 'facebook.net',
  'adsrvr.org', 'moatads.com', '33across.com', 'sharethrough.com', 'id5-sync.com', 'ezoic.net', 'media.net', 'yieldmo.com', 'lijit.com',
  'teads.tv', 'smartadserver.com', 'bidswitch.net', 'adform.net', 'quantcount.com', 'clarity.ms', 'fundingchoicesmessages.google.com'] as const;

/** The AD_DOMAINS entries that the given request hosts belong to. */
export const adDomainsOf = (hosts: Iterable<string>) => [...new Set([...hosts].flatMap((h) => AD_DOMAINS.filter((d) => h === d || h.endsWith(`.${d}`))))].sort();

export interface AppDiscovery {
  attribute?: string; counts: Record<string, number>; via: 'browser' | 'html' | 'none'; error?: string;
  /** document.title of the start page. */
  title?: string;
  /** The origin the web app sends its JSON requests to, when that isn't its own (an API on another host). */
  apiOrigin?: string;
  /** Ad/analytics networks the start page loaded (AD_DOMAINS entries). */
  adDomains: string[];
}

const countIn = (html: string) => Object.fromEntries(TEST_ID_ATTRIBUTES.map((a) => [a, (html.match(new RegExp(`\\s${a}=`, 'g')) ?? []).length]));
const best = (counts: Record<string, number>) => Object.entries(counts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0]?.[0];

async function rendered(url: string, also: string[] = []): Promise<{ counts: Record<string, number>; title: string; hosts: Set<string>; apiCalls: string[] } | undefined> {
  let chromium: { launch(o: object): Promise<{ newPage(): Promise<PageLike>; close(): Promise<void> }> } | undefined;
  try {
    const req = createRequire(path.join(ROOT, 'package.json'));
    const pw = await import(pathToFileURL(req.resolve('@playwright/test')).href);
    chromium = pw.chromium ?? pw.default?.chromium;
  } catch { return undefined; }
  if (!chromium) return undefined;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const hosts = new Set<string>();
    page.on('request', (r) => { try { hosts.add(new URL(r.url()).hostname); } catch { /* data: and the like */ } });
    // JSON answers to the page's own fetch/XHR calls: where the application's API lives.
    const apiCalls: string[] = [];
    page.on('response', (r) => { try { if (['xhr', 'fetch'].includes(r.request().resourceType()) && /json/i.test(r.headers()['content-type'] ?? '')) apiCalls.push(new URL(r.url()).origin); } catch { /* ignore */ } });
    const countOnPage = () => page.evaluate((attrs: readonly string[]) => Object.fromEntries(attrs.map((a) => [a, document.querySelectorAll(`[${a}]`).length])), TEST_ID_ATTRIBUTES);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);
    const title = (await page.title()).trim();
    const counts = await countOnPage();
    // Test ids often sit on forms, not on the start page: add up to 4 pages linked from the navigation (same origin).
    const links = await page.evaluate((origin: string) => [...new Set([...document.querySelectorAll('header a[href], nav a[href], [role="navigation"] a[href]')]
      .map((a) => (a as HTMLAnchorElement).href).filter((h) => h.startsWith(origin) && !h.includes('#') && !/logout|signout|delete/i.test(h)))].slice(0, 4), new URL(url).origin)
      .catch(() => [] as string[]);
    for (const link of [...new Set([...also, ...links])].filter((l) => l.replace(/\/$/, '') !== url.replace(/\/$/, ''))) {
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => undefined);
      await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => undefined);
      const more = await countOnPage().catch(() => ({} as Record<string, number>));
      for (const [k, n] of Object.entries(more)) counts[k] = (counts[k] ?? 0) + n;
    }
    return { counts, title, hosts, apiCalls };
  } finally { await browser.close(); }
}
interface PageLike {
  on(event: 'request', fn: (r: { url(): string }) => void): void;
  on(event: 'response', fn: (r: { url(): string; headers(): Record<string, string>; request(): { resourceType(): string } }) => void): void;
  title(): Promise<string>;
  goto(url: string, o: object): Promise<unknown>;
  waitForLoadState(state: string, o: object): Promise<unknown>;
  evaluate<T, A>(fn: (arg: A) => T, arg: A): Promise<T>;
}

export async function discoverApp(url: string, also: string[] = []): Promise<AppDiscovery> {
  try {
    const r = await rendered(url, also);
    if (r) {
      const own = new URL(url).origin;
      const byOrigin = r.apiCalls.filter((o) => o !== own && !adDomainsOf([new URL(o).hostname]).length).reduce<Record<string, number>>((a, o) => ({ ...a, [o]: (a[o] ?? 0) + 1 }), {});
      const [apiOrigin] = Object.entries(byOrigin).sort((a, b) => b[1] - a[1]).map(([o]) => o);
      // Only when the app calls that origin more than its own (a CDN or widget answering JSON now and then is not the API).
      const ownCalls = r.apiCalls.filter((o) => o === own).length;
      return { attribute: best(r.counts), counts: r.counts, via: 'browser', title: r.title || undefined, adDomains: adDomainsOf(r.hosts), ...(apiOrigin && byOrigin[apiOrigin] > ownCalls ? { apiOrigin } : {}) };
    }
  } catch (e) { /* no usable browser: fall back to the served HTML */ void e; }
  try {
    const html = await (await fetch(url, { signal: AbortSignal.timeout(15_000) })).text();
    const counts = countIn(html);
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || undefined;
    const hosts = [...html.matchAll(/(?:src|href)=["']https?:\/\/([^/"':]+)/gi)].map((m) => m[1].toLowerCase());
    return { attribute: best(counts), counts, via: 'html', title, adDomains: adDomainsOf(hosts) };
  } catch (e) {
    return { counts: {}, via: 'none', error: (e as Error).message, adDomains: [] };
  }
}

/**
 * The app's name from its page title: "ParaBank | Welcome | Online Banking" → "ParaBank" (the segment naming the host),
 * else the first segment. Undefined when there is no usable title.
 */
export function appNameFrom(title: string | undefined, id: string): string | undefined {
  const parts = (title ?? '').split(/\s+[|–—:-]\s+/).map((x) => x.trim()).filter(Boolean);
  const squash = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = parts.find((x) => squash(id).includes(squash(x)) || squash(x).includes(squash(id))) ?? parts[0];
  return name && name.length <= 40 ? name : undefined;
}

/** A short, readable profile id from the host: https://www.shop.example.com → "shop"; localhost or an IP → "app". */
export function profileIdFor(baseURL: string): string {
  const host = new URL(baseURL).hostname.toLowerCase();
  if (host === 'localhost' || /^[\d.]+$/.test(host) || host.includes(':')) return 'app';
  // The first label that names the application: not the top-level domain, not a hosting provider
  // (x.herokuapp.com, x.netlify.app), not a generic prefix (www., demo., staging.).
  const generic = new Set(['www', 'app', 'web', 'demo', 'test', 'qa', 'dev', 'uat', 'staging', 'stage', 'preprod', 'sandbox', 'api']);
  const hosting = new Set(['herokuapp', 'netlify', 'vercel', 'azurewebsites', 'cloudfront', 'github', 'gitlab', 'onrender', 'fly', 'pages', 'appspot', 'firebaseapp', 'amplifyapp', 'railway', 'glitch', 'repl', 'ngrok', 'azurestaticapps']);
  const labels = host.split('.').slice(0, -1).filter((l) => !generic.has(l) && !hosting.has(l));
  return (labels[0] ?? host.split('.')[0]).replace(/[^a-z0-9-]/g, '-') || 'app';
}

export const describeCounts = (d: AppDiscovery) => Object.entries(d.counts).filter(([, n]) => n > 0).map(([a, n]) => `${a} ×${n}`).join(', ') || 'no test-id attributes';

/**
 * The address of a page someone copied from the browser ("…/parabank/index.htm", "…/#/login", "…?lang=en") as a base
 * URL: its folder, so that paths such as "billpay.htm" resolve beside it.
 */
export function baseUrlOf(url: string): string {
  const u = new URL(url);
  u.hash = ''; u.search = '';
  if (/\/[^/]+\.[a-z0-9]{2,5}$/i.test(u.pathname)) u.pathname = u.pathname.replace(/[^/]+$/, '');
  return u.toString();
}

/**
 * The root of the application a page belongs to. Someone may paste the address of any page ("https://host/books"): paths
 * such as "/profile" must resolve from the app's root, not from that page. The candidates are the page's parent folders,
 * shortest first; the first that serves the same app (the same page title in its HTML) is the root. An app mounted
 * under a folder ("https://host/app/…") keeps that folder when the host's root is something else.
 */
export async function appRootOf(url: string, fetchTitle: (u: string) => Promise<string | undefined> = htmlTitle): Promise<string> {
  const u = new URL(baseUrlOf(url));
  const parts = u.pathname.split('/').filter(Boolean);
  if (!parts.length) return u.toString();
  const own = await fetchTitle(u.toString());
  if (!own) return u.toString();
  for (let n = 0; n < parts.length; n++) {
    const candidate = new URL(`/${parts.slice(0, n).map((p) => `${p}/`).join('')}`, u.origin).toString();
    if ((await fetchTitle(candidate)) === own) return candidate;
  }
  return u.toString();
}
async function htmlTitle(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), redirect: 'follow' });
    if (!res.ok || !/html/i.test(res.headers.get('content-type') ?? '')) return undefined;
    return (await res.text()).match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || undefined;
  } catch { return undefined; }
}

/** An id a framework or the server generated, likely different on the next page load (a UUID, a long hex or number run). */
export const generatedId = (id: string) => /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i.test(id) || /[0-9a-f]{12,}/i.test(id) || /\d{5,}/.test(id) || /^:r[\w]*:$/.test(id);
