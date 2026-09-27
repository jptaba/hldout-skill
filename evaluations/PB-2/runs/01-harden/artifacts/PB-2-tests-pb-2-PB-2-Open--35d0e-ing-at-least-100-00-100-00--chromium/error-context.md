# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-2\tests\pb-2.spec.ts >> PB-2 Open a new CHECKING or SAVINGS account online >> SCN-010.1: The page opens an account only from a funding account holding at least 100.00 (100.00)
- Location: evaluations\PB-2\tests\pb-2.spec.ts:398:5

# Error details

```
Error: [SEED] new customer (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[id="customer.firstName"]')

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - banner [ref=f1e4]:
    - heading "Error 1015" [level=1] [ref=f1e5]
    - generic [ref=f1e6]: "Ray ID: a41a605f5ad80cbc •"
    - generic [ref=f1e7]: 2026-09-27 12:05:25 UTC
    - heading "You are being rate limited" [level=2] [ref=f1e8]
  - generic [ref=f1e10]:
    - heading "What happened?" [level=2] [ref=f1e11]
    - paragraph [ref=f1e12]: The owner of this website (parabank.parasoft.com) has banned you temporarily from accessing this website.
    - paragraph [ref=f1e13]:
      - text: Please see
      - link "https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/" [ref=f1e14] [cursor=pointer]:
        - /url: https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/
      - text: for more details.
  - generic [ref=f1e16]:
    - text: Was this page helpful?
    - button "Yes" [ref=f1e17] [cursor=pointer]
    - button "No" [ref=f1e18] [cursor=pointer]
  - paragraph [ref=f1e20]:
    - generic [ref=f1e21]:
      - text: "Cloudflare Ray ID:"
      - strong [ref=f1e22]: a41a605f5ad80cbc
    - text: •
    - generic [ref=f1e23]:
      - text: "Your IP:"
      - button "Click to reveal" [ref=f1e24] [cursor=pointer]
      - text: •
    - generic [ref=f1e25]:
      - text: Performance & security by
      - link "Cloudflare" [ref=f1e26] [cursor=pointer]:
        - /url: https://www.cloudflare.com/5xx-error-landing
```

# Test source

```ts
  138 | 
  139 | /** Abort requests to the profile's blockHosts (ads, analytics, consent banners): they are not the AUT and inject content. */
  140 | export async function blockThirdParty(context: import('@playwright/test').BrowserContext, hosts = ''): Promise<void> {
  141 |   const list = hosts.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
  142 |   if (!list.length) return;
  143 |   await context.route((url) => list.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)), (route) => route.abort());
  144 | }
  145 | 
  146 | /**
  147 |  * Robust entry-point navigation: wait for DOMContentLoaded, then let 'load' settle for at most
  148 |  * `settleMs` without failing (third-party assets can keep 'load' pending forever).
  149 |  */
  150 | export async function gotoPage(page: import('@playwright/test').Page, path: string, settleMs = 10_000): Promise<void> {
  151 |   await page.goto(autUrl(process.env.AUT_BASE_URL, path), { waitUntil: 'domcontentloaded' });
  152 |   await page.waitForLoadState('load', { timeout: settleMs }).catch(() => undefined);
  153 | }
  154 | 
  155 | export type ShapeRule ='string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'string[]' | ((v: unknown) => boolean | string);
  156 | 
  157 | /**
  158 |  * Schema check for API bodies. Returns human-readable violations (empty = conforms), so a
  159 |  * requirement assertion reads `expect(checkShape(room, ROOM), '[REQ AC-n] Room schema').toEqual([])`
  160 |  * and a failure lists exactly which fields broke the contract.
  161 |  */
  162 | export function checkShape(value: unknown, schema: Record<string, ShapeRule>, label = 'value'): string[] {
  163 |   if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${label} is not an object`];
  164 |   const obj = value as Record<string, unknown>;
  165 |   const out: string[] = [];
  166 |   for (const [key, rule] of Object.entries(schema)) {
  167 |     const v = obj[key];
  168 |     const where = `${label}.${key}`;
  169 |     if (v === undefined) { out.push(`${where} is missing`); continue; }
  170 |     if (typeof rule === 'function') {
  171 |       const r = rule(v);
  172 |       if (r !== true) out.push(typeof r === 'string' ? `${where} ${r}` : `${where} is invalid (${JSON.stringify(v)})`);
  173 |       continue;
  174 |     }
  175 |     const ok = rule === 'integer' ? Number.isInteger(v)
  176 |       : rule === 'array' ? Array.isArray(v)
  177 |       : rule === 'string[]' ? Array.isArray(v) && v.every((x) => typeof x === 'string')
  178 |       : rule === 'object' ? typeof v === 'object' && v !== null && !Array.isArray(v)
  179 |       : typeof v === rule;
  180 |     if (!ok) out.push(`${where} should be ${rule} but is ${JSON.stringify(v)}`);
  181 |   }
  182 |   return out;
  183 | }
  184 | 
  185 | const SECRET_KEY = /pass(word)?|token|secret|api[-_]?key|authorization|cookie|session/i;
  186 | // Header NAMES that carry credentials (incl. misspellings like "Authorisation") and VALUES that look like credentials.
  187 | const SECRET_HEADER = /auth|cookie|token|secret|api[-_]?key|session|password|credential/i;
  188 | const SECRET_VALUE = /^\s*(basic|bearer|digest|token)\s+\S+/i;
  189 | 
  190 | /** Redact secrets from headers / JSON bodies before they are attached to reports. */
  191 | export function redact(value: unknown, depth = 0): unknown {
  192 |   if (depth > 8 || value == null) return value;
  193 |   if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  194 |   if (typeof value === 'object') {
  195 |     return Object.fromEntries(Object.entries(value as Record<string, unknown>)
  196 |       .map(([k, v]) => [k, SECRET_KEY.test(k) && typeof v !== 'object' ? '***redacted***' : redact(v, depth + 1)]));
  197 |   }
  198 |   return value;
  199 | }
  200 | /**
  201 |  * ARIA snapshots include the current value of text fields — password fields too. Redact the values of the
  202 |  * page's password inputs wherever they appear, and any value shown for a textbox whose name looks secret.
  203 |  */
  204 | export function redactSnapshot(yaml: string, secretValues: string[] = []): string {
  205 |   let out = yaml;
  206 |   for (const v of secretValues.filter((x) => x && x.length >= 3)) out = out.split(v).join('***redacted***');
  207 |   return out.replace(/^(\s*- textbox "[^"]*(?:pass(?:word|code)?|pin|secret|token)[^"]*"[^:\n]*):\s*\S.*$/gim, '$1: ***redacted***');
  208 | }
  209 | const redactHeaders = (h: Record<string, string>) =>
  210 |   Object.fromEntries(Object.entries(h).map(([k, v]) => [k, SECRET_HEADER.test(k) || SECRET_VALUE.test(String(v)) ? '***redacted***' : v]));
  211 | const clip = (s: string, n = 4000) => (s.length > n ? `${s.slice(0, n)}… (${s.length - n} more chars)` : s);
  212 | 
  213 | export const test = base.extend<{ data: TestData; journey: Journey; api: Api; apiContext: APIRequestContext; seed: Seed }>({
  214 |   // Paths resolve against the profile URL including its path prefix (see autUrl).
  215 |   page: async ({ page }, use) => {
  216 |     await blockThirdParty(page.context(), process.env.AUT_BLOCK_HOSTS);
  217 |     const goto = page.goto.bind(page);
  218 |     page.goto = (url, options) => goto(autUrl(process.env.AUT_BASE_URL, url), options);
  219 |     await use(page);
  220 |   },
  221 | 
  222 |   // Depends on `api` so the API client (used by cleanups) is torn down only after the seed teardown ran.
  223 |   seed: async ({ api }, use, testInfo) => {
  224 |     void api;
  225 |     const ledger: SeedRecord[] = [];
  226 |     const cleanups: { rec: SeedRecord; run: () => Promise<unknown> }[] = [];
  227 |     const tag = `hx${Date.now().toString(36).slice(-5)}${testInfo.workerIndex}${testInfo.repeatEachIndex}`;
  228 |     /** Run a precondition in the [seed] phase with ledger + BLOCKED semantics. */
  229 |     const pre = async <T,>(rec: SeedRecord, run: () => Promise<T>): Promise<T> => {
  230 |       ledger.push(rec);
  231 |       try {
  232 |         apiPhase = 'seed';
  233 |         const value = await base.step(`[SEED] ${rec.label}`, run).finally(() => { apiPhase = 'test'; });
  234 |         rec.created = redact(value);
  235 |         return value;
  236 |       } catch (err) {
  237 |         rec.error = (err as Error).message.split('\n')[0];
> 238 |         throw new Error(`[SEED] ${rec.label}: precondition could not be established — ${(err as Error).message}`);
      |               ^ Error: [SEED] new customer (register.htm): precondition could not be established — locator.fill: Timeout 10000ms exceeded.
  239 |       }
  240 |     };
  241 |     await use({
  242 |       tag,
  243 |       async create<T>(label: string, make: () => Promise<T>, cleanup?: (created: T) => Promise<unknown>): Promise<T> {
  244 |         const rec: SeedRecord = { label, kind: 'data', cleanup: cleanup ? undefined : 'none' };
  245 |         const created = await pre(rec, make);
  246 |         if (cleanup) cleanups.push({ rec, run: () => cleanup(created) });
  247 |         return created;
  248 |       },
  249 |       step<T>(label: string, run: () => Promise<T>): Promise<T> {
  250 |         return pre({ label, kind: 'pre-step', cleanup: 'none' }, run);
  251 |       },
  252 |       async once<T>(key: string, label: string, make: () => Promise<T>, ttlMs = 10 * 60_000): Promise<T> {
  253 |         const hit = onceCache.get(key);
  254 |         if (hit && Date.now() - hit.at < ttlMs) {
  255 |           ledger.push({ label, kind: 'auth', cleanup: 'none', reused: true, created: '(reused within this worker)' });
  256 |           return hit.value as T;
  257 |         }
  258 |         const value = await pre({ label, kind: 'auth', cleanup: 'none' }, make);
  259 |         onceCache.set(key, { value, at: Date.now() });
  260 |         return value;
  261 |       },
  262 |       until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts: { timeoutMs?: number; intervalMs?: number } = {}): Promise<T> {
  263 |         const { timeoutMs = 15_000, intervalMs = 500 } = opts;
  264 |         return pre({ label, kind: 'readiness', cleanup: 'none' }, async () => {
  265 |           const deadline = Date.now() + timeoutMs;
  266 |           let last: T;
  267 |           for (;;) {
  268 |             last = await probe();
  269 |             if (ready(last)) return last;
  270 |             if (Date.now() > deadline) throw new Error(`not ready after ${timeoutMs} ms (last value: ${JSON.stringify(redact(last)).slice(0, 200)})`);
  271 |             await new Promise((r) => setTimeout(r, intervalMs));
  272 |           }
  273 |         });
  274 |       },
  275 |       track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T {
  276 |         const rec: SeedRecord = { label: `${label} (created by the scenario)`, kind: 'scenario-created', created: redact(created) };
  277 |         ledger.push(rec);
  278 |         cleanups.push({ rec, run: () => cleanup(created) });
  279 |         return created;
  280 |       },
  281 |     });
  282 |     // Teardown: undo in reverse order; never fail the test because of cleanup. HELDOUT_KEEP_DATA=1 keeps data for debugging.
  283 |     for (const c of cleanups.reverse()) {
  284 |       if (process.env.HELDOUT_KEEP_DATA === '1') { c.rec.cleanup = 'skipped'; continue; }
  285 |       apiPhase = 'cleanup';
  286 |       try { await c.run(); c.rec.cleanup = 'done'; } catch (e) { c.rec.cleanup = 'failed'; c.rec.error = (e as Error).message.split('\n')[0]; } finally { apiPhase = 'test'; }
  287 |     }
  288 |     if (ledger.length) await testInfo.attach('seed-ledger', { body: JSON.stringify({ tag, records: ledger }, null, 2), contentType: 'application/json' });
  289 |   },
  290 | 
  291 |   data: async ({}, use, testInfo) => {
  292 |     // spec lives in evaluations/<KEY>/tests/**  →  evaluations/<KEY>/test-data.json
  293 |     let dir = path.dirname(testInfo.file);
  294 |     while (path.basename(dir) !== 'tests' && path.dirname(dir) !== dir) dir = path.dirname(dir);
  295 |     const file = path.join(path.dirname(dir), 'test-data.json');
  296 |     const raw = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Json) : {};
  297 |     await use(resolveEnv(raw) as TestData);
  298 |   },
  299 | 
  300 |   journey: async ({ page }, use, testInfo) => {
  301 |     const capture = process.env.HELDOUT_CAPTURE === '1';
  302 |     const runDir = process.env.HELDOUT_RUN_DIR;
  303 |     const scenario = scenarioIdOf(testInfo.title) ?? slug(testInfo.title);
  304 |     let n = 0;
  305 | 
  306 |     const snap = async (label: string) => {
  307 |       // API-only tests never navigate: skip empty snapshots.
  308 |       if (page.url() === 'about:blank') return;
  309 |       const raw = await page.locator('body').ariaSnapshot({ timeout: 3_000 })
  310 |         .catch((e: Error) => `# snapshot unavailable: ${e.message.split('\n')[0]}`);
  311 |       const yaml = redactSnapshot(raw, await page.$$eval('input[type="password"]', (els) => els.map((el) => (el as HTMLInputElement).value)).catch(() => []));
  312 |       const body = `# url: ${page.url()}\n# step: ${label}\n${yaml}\n`;
  313 |       const name = `${String(n).padStart(2, '0')}-${slug(label)}`;
  314 |       await testInfo.attach(`aria-snapshot ${name}`, { body, contentType: 'text/yaml' });
  315 |       if (runDir) {
  316 |         const file = path.join(runDir, 'snapshots', scenario, `retry${testInfo.retry}`, `${name}.yml`);
  317 |         fs.mkdirSync(path.dirname(file), { recursive: true });
  318 |         fs.writeFileSync(file, body);
  319 |       }
  320 |     };
  321 | 
  322 |     await use({
  323 |       step: <T>(title: string, body: () => Promise<T>) =>
  324 |         base.step(title, async () => {
  325 |           n++;
  326 |           try {
  327 |             const result = await body();
  328 |             if (capture) await snap(title);
  329 |             return result;
  330 |           } catch (err) {
  331 |             await snap(`FAILED ${title}`).catch(() => undefined);
  332 |             throw err;
  333 |           }
  334 |         }),
  335 |       capture: snap,
  336 |     });
  337 |   },
  338 | 
```