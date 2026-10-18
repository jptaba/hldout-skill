/**
 * Hardening tier 3 — bundled headless inspector (used when neither the IDE browser tool (tier 1)
 * nor Playwright MCP (tier 2) is available, and for scripted probing/verification in any tier).
 *
 *   heldout inspect [--key KEY | --aut <profile>] [--url login]   (path relative to the AUT base URL, or a full URL)
 *       [--steps steps.json]... [--steps-json '[{"do":"fill","target":"getByLabel(\'Email\')","value":"a@b.c"}]']
 *       [--sign-in <role or user name>]   start with the profile's recorded UI sign-in of that existing account
 *       [--from P7[:k]]   start from the steps of an earlier walk of the story (its first k)
 *       [--then '<step>']...   add one step after the others (in bash; in PowerShell write a step file instead)
 *       In that order: sign-in, --from, the step files, --steps-json, --then.
 *       [--probe "getByRole('button', { name: 'Sign in' })"]...   verify candidate locators (count/visible/text)
 *       [--probes probes.txt]   the same, one locator per line in a file (regexes and nested quotes survive any shell)
 *       [--html "<locator>"]...   the element's HTML (how a list or a filter nests, a select's option values; what was
 *                                 typed into fields left out)
 *       [--wait-for "<locator>"]   after the steps, wait until an element is in the DOM (SPAs); network idle is always awaited (≤10 s)
 *       [--var name=value]... [--screenshot shot.png] [--headed] [--no-snapshot]
 *   With --key the walk is logged as the story's next probe (P1, P2…: 4-evidence/probes.jsonl) and its full report
 *   written to the scratch area; cite it as Pn. Without --key the report is printed.
 *       [--body-limit N]   the API calls table shows the first N characters of each request body (default 200), and
 *                          a "request" step that much of its answer
 *
 * Steps (run in order before inspecting): { do: goto|fill|click|press|select|check|uncheck|hover|wait|probe|dialog|force|rewrite|request, target?, value?, url? }
 *   { "do": "force", "target": "<a select or a field>", "value": "2" } gives the control a value it does not offer;
 *   { "do": "rewrite", "url": "createAccount", "value": "fromAccountId=123" } changes those fields of the page's next
 *   request to an address containing `url` (query, JSON or form body): together they replay a forced submission.
 *   { "do": "request", "url": "POST transfer?amount=5", "value": "<JSON body>" } makes a call of the walk's own
 *   against the API (the path resolves against the profile's apiBaseURL, not the page), with the page's cookies; the
 *   step table shows its status and the start of its answer (300 characters, or --body-limit N).
 *   The report lists each rewritten request with the values it would have sent and the ones that went out.
 *   A "probe" step counts its target's matches at that point of the walk (what is gone by the end of it, such as a
 *   toast after a click): the step table shows the count, whether it is visible and its text.
 *   { "do": "dialog", "value": "accept" | "dismiss" } answers the next browser dialog (alert, confirm, prompt) that way;
 *   dialogs nobody answers are dismissed. Every dialog shown is listed in the report.
 *   target = a Playwright page-locator expression WITHOUT the leading "page.", e.g. getByTestId('x').first()
 *   value, target, url = support ${env:NAME} and ${vault:path#field} (secrets), ${var:name} (from --var name=value, per-run
 *   data), ${text:N} (a text of N characters starting with the data prefix) and ${now} (the time)
 *   A "wait" step with a target waits until its first match is in the DOM; "url:/profile" waits for the address;
 *   without a target, value is a load state (load, networkidle) or a number of milliseconds ("1500"; at most
 *   60000 in one step).
 *   The report lists the API calls the page made (fetch/XHR on the app's site), on load and after each step: method,
 *   path, what was sent (query parameter names, the body with secrets redacted), status and the answer's shape
 *   and what the page keeps in localStorage / sessionStorage (long values and tokens by length only).
 */
import fs from 'node:fs';
import { chromium, selectors, type Locator, type Page } from '@playwright/test';
import { flagList, flagStr, resolveUrl as autUrl, type Args, type CommandSpec } from '../core/cli';
import { loadConfig } from '../core/config';
import { pageText, redact, redactSnapshot, shapeOf } from '../core/redact';
import { expandSecrets, loadedVaultSecrets, requireVaultSecrets } from '../core/secrets';
import { generatedId, siteOf } from './detect';
import { composeSteps } from './compose';
import { closeOverlays, locateOn } from './page';
import { deliverProbe, tableRows } from '../core/probe-log';

interface Step { do: string; target?: string; value?: string; url?: string }
interface Candidate {
  tag: string; role: string; name: string; testId: string; id: string; placeholder: string; label: string;
  type: string; visible: boolean; text: string;
  /** The form field's name attribute (stable, and what the server reads). */
  field: string;
}

const vars: Record<string, string> = {};
/** ${env:NAME} (.env or the environment) and ${vault:path#field} (secrets), ${var:name} from --var name=value (per-run data such as a user created a moment ago). */
const env = (s = '') => expandSecrets(s).replace(/\$\{var:(\w+)\}/g, (m, n: string) => vars[n] ?? m);

/** A step's target as the step table shows it: per-run values filled in, secret references left as references. */
const labelOf = (s: Step) => (s.target ?? s.url ?? '').replace(/\$\{var:(\w+)\}/g, (m, n: string) => vars[n] ?? m);

const locate = (page: Page, expr: string) => locateOn<Locator>(page, expr);

/** How to answer the next browser dialog (a "dialog" step), and every dialog seen, for the report. */
const dialogs = { next: [] as string[], seen: [] as string[] };
/** The requests a "rewrite" step changed, for the report. */
const rewritten: string[] = [];
/** How much of a "request" step's answer the step table shows (--body-limit; at least 300 characters). */
let answerLimit = 300;

async function runStep(page: Page, s: Step, baseURL: string, apiBaseURL = baseURL): Promise<string | void> {
  const t = () => locate(page, env(s.target ?? ''));
  switch (s.do) {
    // A probe at this point of the walk, for what is gone by the end of it (a toast): waits up to 5 s for a match.
    case 'probe': {
      await t().first().waitFor({ state: 'attached', timeout: 5_000 }).catch(() => undefined);
      const count = await t().count();
      const visible = count ? await t().first().isVisible() : false;
      const text = count ? (await t().first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 80) : '';
      return `${count} match(es)${count === 1 ? ' ✔' : count ? ' ⚠ not unique' : ' ✖'} · visible ${visible}${text ? ` · "${text}"` : ''}`;
    }
    case 'goto': await page.goto(autUrl(baseURL, env(s.url ?? s.value))); break;
    case 'fill': await t().fill(env(s.value)); break;
    case 'click': await t().click(); break;
    case 'press': await (s.target ? t().press(s.value ?? 'Enter') : page.keyboard.press(s.value ?? 'Enter')); break;
    case 'select': await t().selectOption(env(s.value)); break;
    case 'check': await t().check(); break;
    case 'uncheck': await t().uncheck(); break;
    case 'hover': await t().hover(); break;
    case 'dialog': dialogs.next.push(s.value === 'accept' ? 'accept' : 'dismiss'); break;
    // A value the control does not offer (a third account type in a list of two, another customer's account): the
    // control is given it the way a tampering user would, and the page's own script then sends it.
    case 'force': {
      const value = env(s.value);
      const how = await t().first().evaluate((el, v) => {
        if (el instanceof HTMLSelectElement) {
          const offered = [...el.options].some((o) => o.value === v);
          if (!offered) el.add(new Option(v, v));
          el.value = v;
          el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
          return offered ? 'the list offers this value' : 'added to the list and chosen';
        }
        (el as HTMLInputElement).removeAttribute('readonly'); (el as HTMLInputElement).removeAttribute('disabled');
        (el as HTMLInputElement).value = v;
        el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
        return 'value set';
      }, value);
      return `✔ ${how}`;
    }
    // The page's next request whose address contains `url` is sent with these fields changed ("a=1&b=2": in its
    // query, and in its JSON or form body when it has them): what a page's script won't send, sent as the page.
    case 'rewrite': {
      const part = env(s.url); const fields = new URLSearchParams(env(s.value));
      await page.route((u) => u.href.includes(part), async (route) => {
        const req = route.request(); const u = new URL(req.url());
        // What the page meant to send and what went out instead, field by field (secrets masked by their field name).
        const was = new Map<string, string>();
        const show = (k: string, v: unknown) => String((redact({ [k]: v }) as Record<string, unknown>)[k] ?? '(not sent)').slice(0, 60);
        for (const [k, v] of fields) if (u.searchParams.has(k) || !req.postData()) { was.set(k, show(k, u.searchParams.get(k) ?? undefined)); u.searchParams.set(k, v); }
        let postData = req.postData() ?? undefined;
        if (postData) {
          try { const o = JSON.parse(postData) as Record<string, unknown>; for (const [k, v] of fields) if (k in o) { was.set(k, show(k, o[k])); o[k] = v; } postData = JSON.stringify(o); }
          catch { const f = new URLSearchParams(postData); for (const [k, v] of fields) if (f.has(k)) { was.set(k, show(k, f.get(k))); f.set(k, v); } postData = f.toString(); }
        }
        const changes = [...fields].map(([k, v]) => (!was.has(k) ? `${k}: not in the request, left out`
          : was.get(k) === show(k, v) ? `${k}: ${show(k, v)} (the page sent this value itself: nothing to change)` : `${k}: ${was.get(k)} → ${show(k, v)}`));
        rewritten.push(`${req.method()} ${u.pathname.replace(/;jsessionid=[^?#]*/i, '')} sent with ${changes.join(', ')}`);
        await route.continue({ url: u.toString(), ...(postData ? { postData } : {}) });
      }, { times: 1 });
      return `✔ armed for the next request to …${part}`;
    }
    // A call of the walk's own, with the page's cookies ("POST transfer?amount=5", value = a JSON body): data another
    // user changes in the middle of a walk, a record made before the page is opened.
    case 'request': {
      const [method, ...rest] = env(s.url).trim().split(/\s+/);
      const body = s.value ? env(s.value) : undefined;
      const res = await page.request.fetch(autUrl(apiBaseURL, rest.join(' ')), { method, headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { data: body } : {}) });
      const text = await res.text();
      let shown: string;
      try { shown = JSON.stringify(redact(JSON.parse(text))); } catch { shown = redactSnapshot(pageText(text)); }
      return `${res.status()} · ${shown.replace(/\s+/g, ' ').replace(/\|/g, '/').slice(0, Math.max(300, answerLimit))}`;
    }
    // Wait until the first match is in the DOM: never-visible elements (<option>) and several matches both work.
    // "url:/profile" waits for the address to contain that text, as an accounts recipe's "done" does.
    case 'wait': await (s.target?.startsWith('url:') ? page.waitForURL((u) => u.href.includes(s.target!.slice(4)), { timeout: 15_000 }) : s.target ? t().first().waitFor({ state: 'attached' }) : /^\d+$/.test(s.value ?? '') ? page.waitForTimeout(Math.min(Number(s.value), 60_000)) : page.waitForLoadState(s.value as 'load' | 'networkidle' ?? 'load')); break;
    default: throw new Error(`Unknown step "${s.do}"`);
  }
}

const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

export const spec: CommandSpec = {
  name: 'inspect', group: 'Hardening', usage: '--key KEY --url <path> [--steps steps.json] [--probe <locator>]…   (logged as the story\'s next probe, Pn)',
  about: 'tier-3 UI inspector: ARIA snapshot + ranked locators',
  flags: ['aut', 'body-limit', 'from', 'headed', 'html', 'key', 'no-snapshot', 'probe', 'probes', 'screenshot', 'sign-in', 'steps', 'steps-json', 'then', 'url', 'var', 'wait-for'],
};

export async function run({ flags, argv }: Args): Promise<void> {
  for (const v of flagList(flags, 'var')) { const i = v.indexOf('='); if (i > 0) vars[v.slice(0, i)] = v.slice(i + 1); }
  const cfg = loadConfig({ key: flagStr(flags, 'key'), aut: flagStr(flags, 'aut') });
  const testIdAttr = cfg.aut.testIdAttribute ?? 'data-testid';
  const target = autUrl(cfg.aut.baseURL, flagStr(flags, 'url'));
  // Git Bash turns "--url /" into a Windows path before it gets here: say that it was read as the path it stood for.
  if (/^#?[A-Za-z]:[\\/]/.test(flagStr(flags, 'url') ?? '')) console.log(`• --url arrived as "${flagStr(flags, 'url')}" (Git Bash rewrote it) and was read as ${target}: the right page, nothing to repeat`);
  const steps = composeSteps(cfg, flags, flagStr(flags, 'sign-in')) as unknown as Step[];
  await requireVaultSecrets([argv.join(' '), JSON.stringify(steps)]);

  const sentLimit = Number(flagStr(flags, 'body-limit') ?? 200);
  answerLimit = sentLimit;
  selectors.setTestIdAttribute(testIdAttr);
  const browser = await chromium.launch({ headless: !flags.headed });
  const context = await browser.newContext({ baseURL: cfg.aut.baseURL });
  // tsx/esbuild wraps named functions with __name(); functions shipped to page.evaluate need the helper too.
  await context.addInitScript('globalThis.__name = globalThis.__name || ((fn) => fn);');
  const blocked = (cfg.aut.blockHosts ?? []).map((h) => h.toLowerCase());
  if (blocked.length) await context.route((u) => blocked.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`)), (r) => r.abort());
  const page = await context.newPage();
  page.on('dialog', async (d) => {
    const how = dialogs.next.shift() ?? 'dismiss';
    dialogs.seen.push(`${d.type()} "${d.message()}" → ${how}`);
    await (how === 'accept' ? d.accept() : d.dismiss()).catch(() => undefined);
  });
  // The application's own API calls (fetch/XHR on its site): how the UI does what it does, e.g. which call returns an id.
  const sites = new Set([cfg.aut.baseURL, cfg.aut.apiBaseURL].filter((u): u is string => Boolean(u)).map((u) => siteOf(new URL(u).hostname)));
  const calls: Promise<string>[] = [];
  // Which step a call followed ("load" for the page itself), and calls still in flight (a step's call may start late).
  let phase = 'load';
  let inFlight = 0;
  let lastActivity = Date.now();
  const api = (r: { resourceType(): string }) => ['fetch', 'xhr'].includes(r.resourceType());
  const startedIn = new WeakMap<object, string>();
  page.on('request', (r) => { if (api(r)) { inFlight++; lastActivity = Date.now(); startedIn.set(r, phase); } });
  const settled = (r: { resourceType(): string }) => { if (api(r)) { inFlight = Math.max(0, inFlight - 1); lastActivity = Date.now(); } };
  page.on('requestfinished', settled);
  page.on('requestfailed', settled);
  page.on('response', (res) => {
    const req = res.request();
    if (!['fetch', 'xhr'].includes(req.resourceType())) return;
    const after = startedIn.get(req) ?? phase;
    const u = new URL(res.url());
    if (!sites.has(siteOf(u.hostname))) return;
    // A CDN's own beacons and challenges, and the app's static files (translations, config) are not its API.
    if (/^\/cdn-cgi\//.test(u.pathname) || /\/(assets|static|i18n|locales?)\//i.test(u.pathname) || /\.(js|css|map|svg|png|jpe?g|gif|webp|woff2?|ttf)$/i.test(u.pathname)) return;
    // A realtime transport's long-polling (Socket.IO, SockJS) is not a call the page makes for its data.
    if (/^\/(socket\.io|sockjs)(\/|$)/i.test(u.pathname)) return;
    calls.push((async () => {
      const isJson = /json/i.test(res.headers()['content-type'] ?? '');
      const json: unknown = isJson ? await res.json().catch(() => undefined) : undefined;
      // A browser drops an answer's body once the page navigates away (a sign-in that redirects): api-probe reads it.
      const shape = json !== undefined ? `\`${JSON.stringify(shapeOf(json)).replace(/\|/g, '\\|').slice(0, 300)}\`` : isJson ? '(JSON not kept: the page moved on; read it with heldout api-probe)' : '-';
      // The host too when the call goes to another one than the page's (an API on its own host).
      const host = u.host === new URL(cfg.aut.baseURL).host ? '' : u.host;
      // What the page sent: the query's parameter names and the body, secrets redacted (a select's code, a filter's
      // id: the values the endpoint really takes).
      const params = [...u.searchParams.keys()];
      const body = req.postData();
      let sent: unknown;
      try { sent = body ? redact(JSON.parse(body)) : undefined; } catch { sent = body ? `(${body.length} characters, not JSON)` : undefined; }
      const request = [params.length ? `?${[...new Set(params)].join('&')}` : '', sent !== undefined ? `body \`${JSON.stringify(sent).replace(/\|/g, '\\|').slice(0, sentLimit)}\`` : ''].filter(Boolean).join(' · ') || '-';
      return `| ${after} | ${req.method()} | \`${host}${u.pathname}\` | ${request} | ${res.status()} | ${shape} |`;
    })());
  });
  // The profile's overlays (cookie consent, welcome dialogs) are closed as in the tests, so the snapshot shows the page.
  await closeOverlays(page, cfg.aut.overlays);
  const out: string[] = [];
  try {
    // Until the page's own calls have settled (none in flight and none started for a moment; ≤10 s).
    const quiet = async () => { for (const until = Date.now() + 10_000; Date.now() < until && (inFlight > 0 || Date.now() - lastActivity < 700);) await page.waitForTimeout(100); };
    await page.goto(target);
    // The calls of the page's load are its own: a step's calls are the ones it starts.
    if (steps.length) await quiet();
    const stepLog: string[] = [];
    // Messages the page announces (alerts, status and live regions, toasts): gone again by the end of the walk, so
    // the ones a step makes appear are noted on that step.
    const announced = (): Promise<string[]> => page.evaluate(() => [...document.querySelectorAll('[role="alert"], [role="status"], [aria-live="polite"], [aria-live="assertive"], [class*="toast" i], [class*="snackbar" i]')]
      .filter((e) => (e as HTMLElement).getClientRects().length > 0).map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()).filter((t) => t && t.length <= 200)).catch(() => []);
    const heard = new Set(await announced());
    for (const [i, s] of steps.entries()) {
      phase = `step ${i + 1}`;
      try {
        const before = page.url();
        const seen = await runStep(page, s, cfg.aut.baseURL, cfg.aut.apiBaseURL);
        let fresh: string[] = [];
        // An action's message may take a moment (it follows the call the action makes): look for up to 1.5 s.
        for (let tries = /^(click|press|select|check|uncheck)$/.test(s.do) ? 4 : 1; tries > 0 && !fresh.length; tries--) {
          fresh = [...new Set((await announced()).filter((t) => !heard.has(t)))];
          if (!fresh.length && tries > 1) await page.waitForTimeout(500);
        }
        fresh.forEach((t) => heard.add(t));
        // Where an action landed (a click that signs out, a form that leads on): shown when the address changed.
        const at = s.do !== 'goto' && page.url() !== before ? ` · now at ${(() => { const u = new URL(page.url()); return (u.pathname + u.search).replace(/;jsessionid=[^?#]*/i, '').replace(/\|/g, '/'); })()}` : '';
        stepLog.push(`| ${i + 1} | ${s.do} | \`${labelOf(s)}\` | ${seen ?? '✔'}${at}${fresh.length ? ` · the page announced: ${fresh.slice(0, 3).map((t) => `"${t.replace(/\|/g, '/')}"`).join(', ')}` : ''} |`);
      }
      catch (e) {
        stepLog.push(`| ${i + 1} | ${s.do} | \`${labelOf(s)}\` | ✖ ${(e as Error).message.split('\n')[0]} |`);
        break;
      }
    }
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    // "networkidle" is reached once per page: wait for the calls the last step started as well (≤10 s).
    await quiet();
    const waitFor = flagStr(flags, 'wait-for');
    // "attached", not "visible": some elements are never visible (<option>, hidden inputs) yet prove the page is ready.
    if (waitFor) await locate(page, waitFor).first().waitFor({ state: 'attached', timeout: 15_000 });

    out.push(`# AUT inspection (tier 3 — bundled inspector)`, '',
      `- AUT: ${cfg.aut.name} (profile \`${cfg.autId}\`) — ${cfg.aut.baseURL}`,
      `- URL: ${page.url()}`, `- Title: ${await page.title()}`, `- Captured: ${new Date().toISOString()}`,
      `- testIdAttribute: \`${testIdAttr}\``, '');
    if (steps.length) out.push('## Setup steps', '', '| # | action | target | result |', '| --- | --- | --- | --- |', ...stepLog, '');
    if (dialogs.seen.length) out.push('## Browser dialogs', '', ...dialogs.seen.map((x) => `- ${x}`), '');
    if (steps.some((s) => s.do === 'rewrite')) out.push('## Requests the walk rewrote', '', ...(rewritten.length ? rewritten.map((x) => `- ${x}`) : ['- none: no request matched a "rewrite" step']), '');
    // The same call answered the same way several times (a config the page reloads) is one row: "×N".
    const counts = new Map<string, number>();
    for (const row of await Promise.all(calls)) counts.set(row, (counts.get(row) ?? 0) + 1);
    const made = [...counts].map(([row, n]) => (n > 1 ? row.replace(/^\| ([^|]+) \| (\S+) \|/, `| $1 | $2 ×${n} |`) : row));
    if (made.length) out.push('## API calls the page made (what it sent, secrets redacted; the answers as types only)', '', '| after | method | path | sent | status | answer shape |', '| --- | --- | --- | --- | --- | --- |', ...made, '');
    // Where the page keeps its state (a guest cart id, a session flag): how a test can find or set it. Long values and
    // tokens are shown by length only.
    const stored = await page.evaluate(() => (['localStorage', 'sessionStorage'] as const).flatMap((area) => {
      const s = window[area];
      return Array.from({ length: s.length }, (_, i) => { const k = s.key(i) ?? ''; return { area, key: k, value: s.getItem(k) ?? '' }; });
    })).catch(() => [] as { area: string; key: string; value: string }[]);
    const shown = (v: string) => (v.length > 60 || /^eyJ|token|bearer/i.test(v) ? `(${v.length} characters)` : `\`${v.replace(/\|/g, '\\|')}\``);
    if (stored.length) out.push('## Browser storage', '', '| storage | key | value |', '| --- | --- | --- |', ...stored.map((x) => `| ${x.area} | \`${x.key}\` | ${shown(x.value)} |`), '');

    if (!flags['no-snapshot']) {
      // Snapshots echo field values: redact whatever is typed into password inputs.
      const secrets = await page.$$eval('input[type="password"]', (els) => els.map((el) => (el as HTMLInputElement).value)).catch(() => [] as string[]);
      out.push('## Accessibility snapshot', '', '```yaml', redactSnapshot(await page.locator('body').ariaSnapshot(), secrets), '```', '');
    }

    const candidates = await page.evaluate((attr: string): Candidate[] => {
      const implicitRole = (el: Element): string => {
        const tag = el.tagName.toLowerCase();
        const type = (el.getAttribute('type') ?? '').toLowerCase();
        if (el.getAttribute('role')) return el.getAttribute('role')!;
        if (tag === 'a' && el.hasAttribute('href')) return 'link';
        if (tag === 'button' || (tag === 'input' && ['submit', 'button', 'reset', 'image'].includes(type))) return 'button';
        if (tag === 'input' && type === 'checkbox') return 'checkbox';
        if (tag === 'input' && type === 'radio') return 'radio';
        if (tag === 'select') return (el as HTMLSelectElement).multiple ? 'listbox' : 'combobox';
        if (tag === 'textarea' || (tag === 'input' && ['', 'text', 'email', 'search', 'tel', 'url', 'password', 'number'].includes(type))) return type === 'search' ? 'searchbox' : type === 'number' ? 'spinbutton' : 'textbox';
        if (/^h[1-6]$/.test(tag)) return 'heading';
        if (tag === 'img') return 'img';
        return '';
      };
      const labelOf = (el: Element): string => {
        const id = el.getAttribute('id');
        const byFor = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
        const wrap = el.closest('label');
        const lb = el.getAttribute('aria-labelledby');
        const byLb = lb ? lb.split(/\s+/).map((x) => document.getElementById(x)?.textContent ?? '').join(' ') : '';
        return (byFor?.textContent ?? wrap?.textContent ?? byLb ?? '').trim();
      };
      const sel = `a,button,input,select,textarea,[role],[${attr}],h1,h2,h3,[contenteditable="true"]`;
      return Array.from(document.querySelectorAll(sel)).slice(0, 250).map((el) => {
        const h = el as HTMLElement;
        const inputLike = el as HTMLInputElement;
        const type = (el.getAttribute('type') ?? '').toLowerCase();
        const label = labelOf(el);
        // textContent, not innerText: accessible names ignore CSS text-transform (innerText would say "ALL PRODUCTS").
        // Text nodes joined with spaces, as accessible names are: <span>(6)</span>Polo reads "(6) Polo".
        const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
        const parts: string[] = [];
        for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent?.trim()) parts.push(n.textContent.trim());
        const text = parts.join(' ').replace(/\s+/g, ' ').slice(0, 80);
        const name = (el.getAttribute('aria-label') ?? label ?? '') || (['submit', 'button'].includes(type) ? inputLike.value : '')
          || text || el.getAttribute('title') || el.getAttribute('alt') || el.getAttribute('placeholder') || '';
        const rect = h.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(), role: implicitRole(el), name: name.trim().slice(0, 80),
          testId: el.getAttribute(attr) ?? '', id: el.id, placeholder: el.getAttribute('placeholder') ?? '', label,
          type, visible: rect.width > 0 && rect.height > 0 && getComputedStyle(h).visibility !== 'hidden', text,
          field: ['input', 'select', 'textarea'].includes(el.tagName.toLowerCase()) ? el.getAttribute('name') ?? '' : '',
        };
      });
    }, testIdAttr);

    // Rank candidate locators by resilience and keep the first unique one.
    const rows: string[] = [];
    for (const c of candidates.filter((x) => x.visible)) {
      const options: string[] = [];
      if (c.role && c.name) options.push(`getByRole(${q(c.role)}, { name: ${q(c.name)}, exact: true })`);
      if (c.label) options.push(`getByLabel(${q(c.label)}, { exact: true })`);
      if (c.placeholder) options.push(`getByPlaceholder(${q(c.placeholder)}, { exact: true })`);
      if (c.testId) options.push(`getByTestId(${q(c.testId)})`);
      // "#customer.firstName" would mean id=customer + class=firstName: ids that aren't plain CSS identifiers use [id="…"].
      const idLocator = c.id ? `locator(${q(/^[A-Za-z_][\w-]*$/.test(c.id) ? `#${c.id}` : `[id="${c.id.replace(/"/g, '\\"')}"]`)})` : '';
      if (idLocator && !generatedId(c.id)) options.push(idLocator);
      if (c.field) options.push(`locator(${q(`[name="${c.field.replace(/"/g, '\\"')}"]`)})`);
      // A generated id changes from one page load to the next: only when nothing else identifies the element, and flagged.
      if (idLocator && generatedId(c.id)) options.push(`${idLocator} ⚠ generated id: may change on every load`);
      let best = ''; let count = 0;
      for (const o of options) {
        count = await locate(page, o.replace(/ ⚠ .*$/, '')).count().catch(() => 0);
        if (count === 1) { best = o; break; }
      }
      // No unique candidate: offer the non-exact role locator when it matches, never one that matches nothing.
      if (!best && c.role && c.name) {
        const loose = `getByRole(${q(c.role)}, { name: ${q(c.name)} })`;
        const n = await locate(page, loose).count().catch(() => 0);
        if (n) best = n === 1 ? loose : `${loose} ⚠ matches ${n}: add .nth() or scope it`;
      }
      rows.push(`| ${c.role || c.tag} | ${c.name.replace(/\|/g, '\\|') || (c.field ? `(name="${c.field}")` : '-')} | ${c.testId || '-'} | ${c.type || '-'} | \`${best || '(no stable locator)'}\` |`);
    }
    out.push('## Visible interactive / test-id elements (best unique locator)', '',
      '| role | accessible name | test id | type | suggested locator |', '| --- | --- | --- | --- | --- |', ...[...new Set(rows)], '');

    // Read-only text a test checks (a detail page's fields, a total, a message) often has an id but no role: list it too.
    const texts = await page.evaluate(() => [...document.querySelectorAll('[id]')].filter((el) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      if (!r.width || !r.height || el.matches('a,button,input,select,textarea,label,[role],script,style')) return false;
      if (el.querySelector('a,button,input,select,textarea')) return false;
      if (document.querySelectorAll(`[id="${CSS.escape(el.id)}"]`).length !== 1) return false; // repeated ids locate nothing reliably
      const t = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      return t.length > 0 && t.length <= 120;
    }).map((el) => ({ id: el.id, text: (el.textContent ?? '').replace(/\s+/g, ' ').trim() })).slice(0, 80)).catch(() => [] as { id: string; text: string }[]);
    const stable = texts.filter((t) => !generatedId(t.id));
    if (stable.length) {
      out.push('## Text with a stable id (read-only values: details, totals, messages)', '', '| locator | text |', '| --- | --- |',
        ...stable.map((t) => `| \`locator(${q(/^[A-Za-z_][\w-]*$/.test(t.id) ? `#${t.id}` : `[id="${t.id}"]`)})\` | ${t.text.replace(/\|/g, '\\|').slice(0, 100)} |`), '');
    }

    // --probes <file>: one locator per line, for locators a shell would mangle (regexes, nested quotes).
    const probesFile = flagStr(flags, 'probes');
    const probes = [...flagList(flags, 'probe'), ...(probesFile ? fs.readFileSync(probesFile, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : [])];
    if (probes.length) {
      out.push('## Locator probes', '', '| expression | count | visible | text / value |', '| --- | --- | --- | --- |');
      for (const expr of probes) {
        try {
          const loc = locate(page, expr);
          const count = await loc.count();
          const first = loc.first();
          const visible = count ? await first.isVisible() : false;
          const text = count ? ((await first.innerText().catch(() => '')) || (await first.inputValue().catch(() => ''))).slice(0, 80) : '';
          out.push(`| \`${expr}\` | ${count}${count === 1 ? ' ✔' : count ? ' ⚠ not unique' : ' ✖'} | ${visible} | ${text.replace(/\n/g, ' ')} |`);
        } catch (e) {
          out.push(`| \`${expr}\` | error | - | ${(e as Error).message.split('\n')[0]} |`);
        }
      }
      out.push('');
    }

    // How an element is built (nesting the accessibility tree doesn't show), for locators that walk the structure.
    for (const expr of flagList(flags, 'html')) {
      try {
        const loc = locate(page, expr);
        const count = await loc.count();
        const html = count ? await loc.first().evaluate((el) => el.outerHTML) : '';
        // Field values never leave the page: the HTML shows structure, not what was typed.
        const clean = html.replace(/(<(?:input|textarea)\b[^>]*?\s)value="[^"]*"/g, '$1value="…"').replace(/<!--[\s\S]*?-->/g, '').slice(0, 20_000);
        out.push(`## HTML of \`${expr}\`${count > 1 ? ` (first of ${count})` : ''}`, '', count ? '```html' : '_no match_', ...(count ? [clean, '```'] : []), '');
      } catch (e) {
        out.push(`## HTML of \`${expr}\``, '', `error: ${(e as Error).message.split('\n')[0]}`, '');
      }
    }

    const shot = flagStr(flags, 'screenshot');
    if (shot) { await page.screenshot({ path: shot, fullPage: true }); out.push(`Screenshot: ${shot}`, ''); }
  } finally {
    await browser.close();
  }
  // Last line of defence: no secret the steps used reaches the report (a path or address can carry one), raw or encoded.
  const used = JSON.stringify([steps, argv]);
  const secrets = [...new Set([...[...used.matchAll(/\$\{(?:env|vault):[^}]+\}/g)].map((m) => expandSecrets(m[0])).filter((v) => !v.startsWith('${')),
    ...Object.values(loadedVaultSecrets())].filter((v) => v.length >= 3))];
  const report = secrets.flatMap((v) => [v, encodeURIComponent(v)]).reduce((acc, v) => acc.split(v).join('***redacted***'), out.join('\n'));
  deliverProbe(cfg, flagStr(flags, 'key'), {
    tool: 'inspect', tier: 3, report,
    input: { url: flagStr(flags, 'url') ?? '', steps, probes: flagList(flags, 'probe'), ...(flagStr(flags, 'probes') ? { probesFile: fs.readFileSync(flagStr(flags, 'probes')!, 'utf8') } : {}), html: flagList(flags, 'html'), waitFor: flagStr(flags, 'wait-for') },
    digest: tableRows(report, ['Setup steps', 'Locator probes', 'API calls the page made']),
  });
}
