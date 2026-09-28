/**
 * Hardening tier 3 — bundled headless inspector (used when neither the IDE browser tool (tier 1)
 * nor Playwright MCP (tier 2) is available, and for scripted probing/verification in any tier).
 *
 *   heldout inspect [--key KEY | --aut <profile>] [--url login]   (path relative to the AUT base URL, or a full URL)
 *       [--steps steps.json | --steps-json '[{"do":"fill","target":"getByLabel(\'Email\')","value":"a@b.c"}]']
 *       [--probe "getByRole('button', { name: 'Sign in' })"]...   verify candidate locators (count/visible/text)
 *       [--wait-for "<locator>"]   after the steps, wait until an element is in the DOM (SPAs); network idle is always awaited (≤10 s)
 *       [--var name=value]... [--out report.md] [--screenshot shot.png] [--headed] [--no-snapshot]
 *
 * Steps (run in order before inspecting): { do: goto|fill|click|press|select|check|uncheck|hover|wait|dialog, target?, value?, url? }
 *   { "do": "dialog", "value": "accept" | "dismiss" } answers the next browser dialog (alert, confirm, prompt) that way;
 *   dialogs nobody answers are dismissed. Every dialog shown is listed in the report.
 *   target = a Playwright page-locator expression WITHOUT the leading "page.", e.g. getByTestId('x').first()
 *   value, target, url = support ${env:NAME} and ${vault:path#field} (secrets) and ${var:name} (from --var name=value, per-run data)
 *   A "wait" step with a target waits until its first match is in the DOM; "url:/profile" waits for the address.
 */
import fs from 'node:fs';
import { chromium, selectors, type Locator, type Page } from '@playwright/test';
import { flagList, flagStr, loadConfig, main, parseArgs, resolveUrl as autUrl, writeFile } from './lib/config';
import { generatedId } from './lib/detect';
import { redactSnapshot } from './lib/redact';
import { expandSecrets, requireVaultSecrets } from './lib/secrets';

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

function locate(page: Page, expr: string): Locator {
  // Deliberately evaluates a locator expression authored by the evaluator (local tool, trusted input).
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  // Nested locators inside the expression (filter({ has: getByTestId('x') })) resolve against the page too.
  const helpers = ['getByRole', 'getByTestId', 'getByText', 'getByLabel', 'getByPlaceholder', 'getByAltText', 'getByTitle', 'locator'] as const;
  return new Function('page', ...helpers, `return page.${expr.replace(/^page\./, '')};`)(page, ...helpers.map((h) => (page[h] as (...a: unknown[]) => Locator).bind(page))) as Locator;
}

/** How to answer the next browser dialog (a "dialog" step), and every dialog seen, for the report. */
const dialogs = { next: [] as string[], seen: [] as string[] };

async function runStep(page: Page, s: Step, baseURL: string): Promise<void> {
  const t = () => locate(page, env(s.target ?? ''));
  switch (s.do) {
    case 'goto': await page.goto(autUrl(baseURL, env(s.url ?? s.value))); break;
    case 'fill': await t().fill(env(s.value)); break;
    case 'click': await t().click(); break;
    case 'press': await (s.target ? t().press(s.value ?? 'Enter') : page.keyboard.press(s.value ?? 'Enter')); break;
    case 'select': await t().selectOption(env(s.value)); break;
    case 'check': await t().check(); break;
    case 'uncheck': await t().uncheck(); break;
    case 'hover': await t().hover(); break;
    case 'dialog': dialogs.next.push(s.value === 'accept' ? 'accept' : 'dismiss'); break;
    // Wait until the first match is in the DOM: never-visible elements (<option>) and several matches both work.
    // "url:/profile" waits for the address to contain that text, as an accounts recipe's "done" does.
    case 'wait': await (s.target?.startsWith('url:') ? page.waitForURL((u) => u.href.includes(s.target!.slice(4)), { timeout: 15_000 }) : s.target ? t().first().waitFor({ state: 'attached' }) : page.waitForLoadState(s.value as 'load' | 'networkidle' ?? 'load')); break;
    default: throw new Error(`Unknown step "${s.do}"`);
  }
}

const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

main(async () => {
  const { flags } = parseArgs();
  for (const v of flagList(flags, 'var')) { const i = v.indexOf('='); if (i > 0) vars[v.slice(0, i)] = v.slice(i + 1); }
  const cfg = loadConfig({ key: flagStr(flags, 'key'), aut: flagStr(flags, 'aut') });
  const testIdAttr = cfg.aut.testIdAttribute ?? 'data-testid';
  const target = autUrl(cfg.aut.baseURL, flagStr(flags, 'url'));
  const stepsFile = flagStr(flags, 'steps');
  await requireVaultSecrets([process.argv.slice(2).join(' '), stepsFile && fs.existsSync(stepsFile) ? fs.readFileSync(stepsFile, 'utf8') : '']);
  const steps: Step[] = stepsFile ? JSON.parse(fs.readFileSync(stepsFile, 'utf8'))
    : flagStr(flags, 'steps-json') ? JSON.parse(flagStr(flags, 'steps-json')!) : [];

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
  // The profile's overlays (cookie consent, welcome dialogs) are closed as in the tests, so the snapshot shows the page.
  for (const expr of cfg.aut.overlays ?? []) await page.addLocatorHandler(locate(page, expr), async (l) => { await l.click({ timeout: 5_000 }).catch(() => undefined); });
  const out: string[] = [];
  try {
    await page.goto(target);
    const stepLog: string[] = [];
    for (const [i, s] of steps.entries()) {
      try { await runStep(page, s, cfg.aut.baseURL); stepLog.push(`| ${i + 1} | ${s.do} | \`${s.target ?? s.url ?? ''}\` | ✔ |`); }
      catch (e) {
        stepLog.push(`| ${i + 1} | ${s.do} | \`${s.target ?? s.url ?? ''}\` | ✖ ${(e as Error).message.split('\n')[0]} |`);
        break;
      }
    }
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    const waitFor = flagStr(flags, 'wait-for');
    // "attached", not "visible": some elements are never visible (<option>, hidden inputs) yet prove the page is ready.
    if (waitFor) await locate(page, waitFor).first().waitFor({ state: 'attached', timeout: 15_000 });

    out.push(`# AUT inspection (tier 3 — bundled inspector)`, '',
      `- AUT: ${cfg.aut.name} (profile \`${cfg.autId}\`) — ${cfg.aut.baseURL}`,
      `- URL: ${page.url()}`, `- Title: ${await page.title()}`, `- Captured: ${new Date().toISOString()}`,
      `- testIdAttribute: \`${testIdAttr}\``, '');
    if (steps.length) out.push('## Setup steps', '', '| # | action | target | result |', '| --- | --- | --- | --- |', ...stepLog, '');
    if (dialogs.seen.length) out.push('## Browser dialogs', '', ...dialogs.seen.map((x) => `- ${x}`), '');

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

    const probes = flagList(flags, 'probe');
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

    const shot = flagStr(flags, 'screenshot');
    if (shot) { await page.screenshot({ path: shot, fullPage: true }); out.push(`Screenshot: ${shot}`, ''); }
  } finally {
    await browser.close();
  }
  const report = out.join('\n');
  const file = flagStr(flags, 'out');
  if (file) { writeFile(file, report); console.log(`✔ inspection written to ${file}`); } else console.log(report);
});
