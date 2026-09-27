/**
 * Black-box discovery of profile settings, so a new project needs no guesswork: which test-id attribute the
 * web app renders (data-testid, data-test, data-qa, …). The page is rendered in Chromium (SPAs add their
 * attributes client-side); without a browser the served HTML is scanned instead.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './config';

export const TEST_ID_ATTRIBUTES = ['data-testid', 'data-test', 'data-test-id', 'data-qa', 'data-cy', 'data-automation-id', 'data-e2e'] as const;

export interface TestIdDetection { attribute?: string; counts: Record<string, number>; via: 'browser' | 'html' | 'none'; error?: string }

const countIn = (html: string) => Object.fromEntries(TEST_ID_ATTRIBUTES.map((a) => [a, (html.match(new RegExp(`\\s${a}=`, 'g')) ?? []).length]));
const best = (counts: Record<string, number>) => Object.entries(counts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0]?.[0];

async function renderedCounts(url: string): Promise<Record<string, number> | undefined> {
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
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);
    return await page.evaluate((attrs: readonly string[]) => Object.fromEntries(attrs.map((a) => [a, document.querySelectorAll(`[${a}]`).length])), TEST_ID_ATTRIBUTES);
  } finally { await browser.close(); }
}
interface PageLike {
  goto(url: string, o: object): Promise<unknown>;
  waitForLoadState(state: string, o: object): Promise<unknown>;
  evaluate<T, A>(fn: (arg: A) => T, arg: A): Promise<T>;
}

export async function detectTestIdAttribute(url: string): Promise<TestIdDetection> {
  try {
    const counts = await renderedCounts(url);
    if (counts) return { attribute: best(counts), counts, via: 'browser' };
  } catch (e) { /* no usable browser: fall back to the served HTML */ void e; }
  try {
    const html = await (await fetch(url, { signal: AbortSignal.timeout(15_000) })).text();
    const counts = countIn(html);
    return { attribute: best(counts), counts, via: 'html' };
  } catch (e) {
    return { counts: {}, via: 'none', error: (e as Error).message };
  }
}

export const describeCounts = (d: TestIdDetection) => Object.entries(d.counts).filter(([, n]) => n > 0).map(([a, n]) => `${a} ×${n}`).join(', ') || 'no test-id attributes';
