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
  /** Ad/analytics networks the start page loaded (AD_DOMAINS entries). */
  adDomains: string[];
}

const countIn = (html: string) => Object.fromEntries(TEST_ID_ATTRIBUTES.map((a) => [a, (html.match(new RegExp(`\\s${a}=`, 'g')) ?? []).length]));
const best = (counts: Record<string, number>) => Object.entries(counts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0]?.[0];

async function rendered(url: string): Promise<{ counts: Record<string, number>; title: string; hosts: Set<string> } | undefined> {
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
    const countOnPage = () => page.evaluate((attrs: readonly string[]) => Object.fromEntries(attrs.map((a) => [a, document.querySelectorAll(`[${a}]`).length])), TEST_ID_ATTRIBUTES);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);
    const title = (await page.title()).trim();
    const counts = await countOnPage();
    // Test ids often sit on forms, not on the start page: add up to 4 pages linked from the navigation (same origin).
    const links = await page.evaluate((origin: string) => [...new Set([...document.querySelectorAll('header a[href], nav a[href], [role="navigation"] a[href]')]
      .map((a) => (a as HTMLAnchorElement).href).filter((h) => h.startsWith(origin) && !h.includes('#') && !/logout|signout|delete/i.test(h)))].slice(0, 4), new URL(url).origin)
      .catch(() => [] as string[]);
    for (const link of links.filter((l) => l.replace(/\/$/, '') !== url.replace(/\/$/, ''))) {
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => undefined);
      await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => undefined);
      const more = await countOnPage().catch(() => ({} as Record<string, number>));
      for (const [k, n] of Object.entries(more)) counts[k] = (counts[k] ?? 0) + n;
    }
    return { counts, title, hosts };
  } finally { await browser.close(); }
}
interface PageLike {
  on(event: 'request', fn: (r: { url(): string }) => void): void;
  title(): Promise<string>;
  goto(url: string, o: object): Promise<unknown>;
  waitForLoadState(state: string, o: object): Promise<unknown>;
  evaluate<T, A>(fn: (arg: A) => T, arg: A): Promise<T>;
}

export async function discoverApp(url: string): Promise<AppDiscovery> {
  try {
    const r = await rendered(url);
    if (r) return { attribute: best(r.counts), counts: r.counts, via: 'browser', title: r.title || undefined, adDomains: adDomainsOf(r.hosts) };
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
  const labels = host.split('.').filter((l) => !['www', 'app', 'web'].includes(l));
  return (labels.length > 1 ? labels.slice(0, -1) : labels).join('-').replace(/[^a-z0-9-]/g, '-') || 'app';
}

export const describeCounts = (d: AppDiscovery) => Object.entries(d.counts).filter(([, n]) => n > 0).map(([a, n]) => `${a} ×${n}`).join(', ') || 'no test-id attributes';
