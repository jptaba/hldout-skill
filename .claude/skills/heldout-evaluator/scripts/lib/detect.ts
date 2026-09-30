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
  /** Buttons that close a banner or dialog covering the start page (cookie consent, a welcome dialog): profile overlays. */
  overlays?: string[];
}

/**
 * Of the names of the buttons visible on the start page, those that close something covering it: "Close Welcome
 * Banner", "dismiss cookie message", "Accept all cookies", "Got it". Buttons that act on the app itself are left alone.
 */
export function overlayButtonsIn(names: string[]): string[] {
  const closes = /^(close|dismiss|hide)\b.*\b(banner|cookies?|consent|dialog|message|notice|popup|pop-up|welcome|newsletter|announcement)\b|^(accept|allow|agree to)( all)? cookies\b|^(got it|i agree|accept all)!?$/i;
  return [...new Set(names.map((n) => n.replace(/\s+/g, ' ').trim()).filter((n) => n.length <= 60 && closes.test(n)))];
}

const countIn = (html: string) => Object.fromEntries(TEST_ID_ATTRIBUTES.map((a) => [a, (html.match(new RegExp(`\\s${a}=`, 'g')) ?? []).length]));
const best = (counts: Record<string, number>) => Object.entries(counts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0]?.[0];

/** The project's Playwright Chromium, or undefined when Playwright is not installed. */
export async function loadChromium<P = PageLike>(): Promise<{ launch(o: object): Promise<{ newPage(): Promise<P>; close(): Promise<void> }> } | undefined> {
  try {
    const req = createRequire(path.join(ROOT, 'package.json'));
    const pw = await import(pathToFileURL(req.resolve('@playwright/test')).href);
    return pw.chromium ?? pw.default?.chromium;
  } catch { return undefined; }
}

async function rendered(url: string, also: string[] = []): Promise<{ counts: Record<string, number>; title: string; hosts: Set<string>; apiCalls: string[]; buttons: string[] } | undefined> {
  const chromium = await loadChromium();
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
    // The names of the visible buttons, for the banners and dialogs that cover the page (overlays).
    const buttons = await page.evaluate((sel: string) => [...document.querySelectorAll(sel)]
      .filter((el) => { const r = (el as HTMLElement).getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((el) => (el.getAttribute('aria-label') || (el as HTMLElement).innerText || '').trim()), 'button, [role="button"]')
      .catch(() => [] as string[]);
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
    return { counts, title, hosts, apiCalls, buttons };
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
      // The app's own API lives on its own site (api.example.com for www.example.com); ad and analytics scripts call
      // JSON endpoints of their own too, on other sites, and are never the API.
      const sameSite = (o: string) => siteOf(new URL(o).hostname) === siteOf(new URL(url).hostname);
      const byOrigin = r.apiCalls.filter((o) => o !== own && sameSite(o) && !adDomainsOf([new URL(o).hostname]).length).reduce<Record<string, number>>((a, o) => ({ ...a, [o]: (a[o] ?? 0) + 1 }), {});
      const [apiOrigin] = Object.entries(byOrigin).sort((a, b) => b[1] - a[1]).map(([o]) => o);
      // Only when the app calls that origin more than its own (a CDN or widget answering JSON now and then is not the API).
      const ownCalls = r.apiCalls.filter((o) => o === own).length;
      return { attribute: best(r.counts), counts: r.counts, via: 'browser', title: r.title || undefined, adDomains: adDomainsOf(r.hosts), overlays: overlayButtonsIn(r.buttons), ...(apiOrigin && byOrigin[apiOrigin] > ownCalls ? { apiOrigin } : {}) };
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

/** The site a host belongs to: its last two labels, or three under a two-letter second level ("shop.co.uk"). */
export function siteOf(host: string): string {
  const labels = host.toLowerCase().split('.');
  if (labels.length <= 2 || /^\d+$/.test(labels.at(-1)!)) return host.toLowerCase();
  const n = labels.at(-2)!.length <= 3 && labels.at(-1)!.length === 2 ? 3 : 2;
  return labels.slice(-n).join('.');
}

/**
 * The root of the application a page belongs to. Someone may paste the address of any page ("https://host/books"): paths
 * such as "/profile" must resolve from the app's root, not from that page. The candidates are the page's parent folders,
 * shortest first; the first that serves the same app (the same page title in its HTML) is the root. An app mounted
 * under a folder ("https://host/app/…") keeps that folder when the host's root is something else.
 */
export interface PageFacts { title?: string; links: string[] }
export async function appRootOf(url: string, fetchPage: (u: string) => Promise<PageFacts | undefined> = pageFacts): Promise<string> {
  const u = new URL(baseUrlOf(url));
  const parts = u.pathname.split('/').filter(Boolean);
  if (!parts.length) return u.toString();
  const page = await fetchPage(u.toString());
  if (!page) return u.toString();
  // 1. The page's own links: a site's links share its root ("/parabank/…" on ParaBank, "/" on most sites).
  const dirs = page.links.map((l) => { try { const x = new URL(l, u); return x.origin === u.origin ? x.pathname.replace(/[^/]*$/, '') : undefined; } catch { return undefined; } })
    .filter((d): d is string => Boolean(d));
  if (dirs.length >= 3) {
    let prefix = dirs[0];
    for (const d of dirs) while (!d.startsWith(prefix)) prefix = prefix.replace(/[^/]*\/$/, '');
    if (u.pathname.startsWith(prefix)) return new URL(prefix, u.origin).toString();
  }
  // 2. No usable links (a single-page app's HTML): the shortest parent folder that serves the same app (same title).
  if (page.title) {
    for (let n = 0; n < parts.length; n++) {
      const candidate = new URL(`/${parts.slice(0, n).map((p) => `${p}/`).join('')}`, u.origin).toString();
      if ((await fetchPage(candidate))?.title === page.title) return candidate;
    }
  }
  // 3. One page name ("/contactList", no trailing slash) on a host whose root serves a page: the root. A folder given
  //    with a trailing slash ("/app/") is kept as it is.
  if (parts.length === 1 && !u.pathname.endsWith('/') && await fetchPage(new URL('/', u.origin).toString())) return new URL('/', u.origin).toString();
  return u.toString();
}
async function pageFacts(url: string): Promise<PageFacts | undefined> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), redirect: 'follow' });
    if (!res.ok || !/html/i.test(res.headers.get('content-type') ?? '')) return undefined;
    const html = await res.text();
    return {
      title: html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || undefined,
      links: [...html.matchAll(/<a\s[^>]*href=["']([^"'#][^"']*)["']/gi)].map((m) => m[1]).filter((h) => !/^(mailto|tel|javascript):/i.test(h)),
    };
  } catch { return undefined; }
}

/** An id a framework or the server generated, likely different on the next page load (a UUID, a long hex or number run). */
export const generatedId = (id: string) => /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i.test(id) || /[0-9a-f]{12,}/i.test(id) || /\d{5,}/.test(id) || /^:r[\w]*:$/.test(id);
