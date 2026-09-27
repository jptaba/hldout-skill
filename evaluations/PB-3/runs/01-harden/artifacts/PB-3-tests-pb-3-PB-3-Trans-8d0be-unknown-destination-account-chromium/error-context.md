# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-3\tests\pb-3.spec.ts >> PB-3 Transfer funds between my own accounts >> SCN-009: The REST service refuses an unknown destination account
- Location: evaluations\PB-3\tests\pb-3.spec.ts:345:3

# Error details

```
Error: [SEED] customer who owns accounts A and B (register + Open New Account): precondition could not be established — locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[id="customer.firstName"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - heading "Error 1015" [level=1] [ref=e5]
    - generic [ref=e6]: "Ray ID: a41a93eb194f2142 •"
    - generic [ref=e7]: 2026-09-27 12:40:36 UTC
    - heading "You are being rate limited" [level=2] [ref=e8]
  - generic [ref=e10]:
    - heading "What happened?" [level=2] [ref=e11]
    - paragraph [ref=e12]: The owner of this website (parabank.parasoft.com) has banned you temporarily from accessing this website.
    - paragraph [ref=e13]:
      - text: Please see
      - link "https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/" [ref=e14] [cursor=pointer]:
        - /url: https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/
      - text: for more details.
  - generic [ref=e16]:
    - text: Was this page helpful?
    - button "Yes" [ref=e17] [cursor=pointer]
    - button "No" [ref=e18] [cursor=pointer]
  - paragraph [ref=e20]:
    - generic [ref=e21]:
      - text: "Cloudflare Ray ID:"
      - strong [ref=e22]: a41a93eb194f2142
    - text: •
    - generic [ref=e23]:
      - text: "Your IP:"
      - button "Click to reveal" [ref=e24] [cursor=pointer]
      - text: •
    - generic [ref=e25]:
      - text: Performance & security by
      - link "Cloudflare" [ref=e26] [cursor=pointer]:
        - /url: https://www.cloudflare.com/5xx-error-landing
```

# Test source

```ts
  140 | 
  141 | /** Abort requests to the profile's blockHosts (ads, analytics, consent banners): they are not the AUT and inject content. */
  142 | export async function blockThirdParty(context: import('@playwright/test').BrowserContext, hosts = ''): Promise<void> {
  143 |   const list = hosts.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
  144 |   if (!list.length) return;
  145 |   await context.route((url) => list.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)), (route) => route.abort());
  146 | }
  147 | 
  148 | /**
  149 |  * Robust entry-point navigation: wait for DOMContentLoaded, then let 'load' settle for at most
  150 |  * `settleMs` without failing (third-party assets can keep 'load' pending forever).
  151 |  */
  152 | export async function gotoPage(page: import('@playwright/test').Page, path: string, settleMs = 10_000): Promise<void> {
  153 |   await page.goto(autUrl(process.env.AUT_BASE_URL, path), { waitUntil: 'domcontentloaded' });
  154 |   await page.waitForLoadState('load', { timeout: settleMs }).catch(() => undefined);
  155 | }
  156 | 
  157 | export type ShapeRule ='string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'string[]' | ((v: unknown) => boolean | string);
  158 | 
  159 | /**
  160 |  * Schema check for API bodies. Returns human-readable violations (empty = conforms), so a
  161 |  * requirement assertion reads `expect(checkShape(room, ROOM), '[REQ AC-n] Room schema').toEqual([])`
  162 |  * and a failure lists exactly which fields broke the contract.
  163 |  */
  164 | export function checkShape(value: unknown, schema: Record<string, ShapeRule>, label = 'value'): string[] {
  165 |   if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${label} is not an object`];
  166 |   const obj = value as Record<string, unknown>;
  167 |   const out: string[] = [];
  168 |   for (const [key, rule] of Object.entries(schema)) {
  169 |     const v = obj[key];
  170 |     const where = `${label}.${key}`;
  171 |     if (v === undefined) { out.push(`${where} is missing`); continue; }
  172 |     if (typeof rule === 'function') {
  173 |       const r = rule(v);
  174 |       if (r !== true) out.push(typeof r === 'string' ? `${where} ${r}` : `${where} is invalid (${JSON.stringify(v)})`);
  175 |       continue;
  176 |     }
  177 |     const ok = rule === 'integer' ? Number.isInteger(v)
  178 |       : rule === 'array' ? Array.isArray(v)
  179 |       : rule === 'string[]' ? Array.isArray(v) && v.every((x) => typeof x === 'string')
  180 |       : rule === 'object' ? typeof v === 'object' && v !== null && !Array.isArray(v)
  181 |       : typeof v === rule;
  182 |     if (!ok) out.push(`${where} should be ${rule} but is ${JSON.stringify(v)}`);
  183 |   }
  184 |   return out;
  185 | }
  186 | 
  187 | const SECRET_KEY = /pass(word)?|token|secret|api[-_]?key|authorization|cookie|session/i;
  188 | // Header NAMES that carry credentials (incl. misspellings like "Authorisation") and VALUES that look like credentials.
  189 | const SECRET_HEADER = /auth|cookie|token|secret|api[-_]?key|session|password|credential/i;
  190 | const SECRET_VALUE = /^\s*(basic|bearer|digest|token)\s+\S+/i;
  191 | 
  192 | /** Redact secrets from headers / JSON bodies before they are attached to reports. */
  193 | export function redact(value: unknown, depth = 0): unknown {
  194 |   if (depth > 8 || value == null) return value;
  195 |   if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  196 |   if (typeof value === 'object') {
  197 |     return Object.fromEntries(Object.entries(value as Record<string, unknown>)
  198 |       .map(([k, v]) => [k, SECRET_KEY.test(k) && typeof v !== 'object' ? '***redacted***' : redact(v, depth + 1)]));
  199 |   }
  200 |   return value;
  201 | }
  202 | /**
  203 |  * ARIA snapshots include the current value of text fields — password fields too. Redact the values of the
  204 |  * page's password inputs wherever they appear, and any value shown for a textbox whose name looks secret.
  205 |  */
  206 | export function redactSnapshot(yaml: string, secretValues: string[] = []): string {
  207 |   let out = yaml;
  208 |   for (const v of secretValues.filter((x) => x && x.length >= 3)) out = out.split(v).join('***redacted***');
  209 |   return out.replace(/^(\s*- textbox "[^"]*(?:pass(?:word|code)?|pin|secret|token)[^"]*"[^:\n]*):\s*\S.*$/gim, '$1: ***redacted***');
  210 | }
  211 | const redactHeaders = (h: Record<string, string>) =>
  212 |   Object.fromEntries(Object.entries(h).map(([k, v]) => [k, SECRET_HEADER.test(k) || SECRET_VALUE.test(String(v)) ? '***redacted***' : v]));
  213 | const clip = (s: string, n = 4000) => (s.length > n ? `${s.slice(0, n)}… (${s.length - n} more chars)` : s);
  214 | 
  215 | export const test = base.extend<{ data: TestData; journey: Journey; api: Api; apiContext: APIRequestContext; seed: Seed }>({
  216 |   // Paths resolve against the profile URL including its path prefix (see autUrl).
  217 |   page: async ({ page }, use) => {
  218 |     await blockThirdParty(page.context(), process.env.AUT_BLOCK_HOSTS);
  219 |     const goto = page.goto.bind(page);
  220 |     page.goto = (url, options) => goto(autUrl(process.env.AUT_BASE_URL, url), options);
  221 |     await use(page);
  222 |   },
  223 | 
  224 |   // Depends on `api` so the API client (used by cleanups) is torn down only after the seed teardown ran.
  225 |   seed: async ({ api }, use, testInfo) => {
  226 |     void api;
  227 |     const ledger: SeedRecord[] = [];
  228 |     const cleanups: { rec: SeedRecord; run: () => Promise<unknown> }[] = [];
  229 |     const tag = `hx${Date.now().toString(36).slice(-5)}${testInfo.workerIndex}${testInfo.repeatEachIndex}`;
  230 |     /** Run a precondition in the [seed] phase with ledger + BLOCKED semantics. */
  231 |     const pre = async <T,>(rec: SeedRecord, run: () => Promise<T>): Promise<T> => {
  232 |       ledger.push(rec);
  233 |       try {
  234 |         apiPhase = 'seed';
  235 |         const value = await base.step(`[SEED] ${rec.label}`, run).finally(() => { apiPhase = 'test'; });
  236 |         rec.created = redact(value);
  237 |         return value;
  238 |       } catch (err) {
  239 |         rec.error = (err as Error).message.split('\n')[0];
> 240 |         throw new Error(`[SEED] ${rec.label}: precondition could not be established — ${(err as Error).message}`);
      |               ^ Error: [SEED] customer who owns accounts A and B (register + Open New Account): precondition could not be established — locator.fill: Timeout 10000ms exceeded.
  241 |       }
  242 |     };
  243 |     await use({
  244 |       tag,
  245 |       async create<T>(label: string, make: () => Promise<T>, cleanup?: (created: T) => Promise<unknown>): Promise<T> {
  246 |         const rec: SeedRecord = { label, kind: 'data', cleanup: cleanup ? undefined : 'none' };
  247 |         const created = await pre(rec, make);
  248 |         if (cleanup) cleanups.push({ rec, run: () => cleanup(created) });
  249 |         return created;
  250 |       },
  251 |       step<T>(label: string, run: () => Promise<T>): Promise<T> {
  252 |         return pre({ label, kind: 'pre-step', cleanup: 'none' }, run);
  253 |       },
  254 |       async once<T>(key: string, label: string, make: () => Promise<T>, ttlMs = 10 * 60_000): Promise<T> {
  255 |         const hit = onceCache.get(key);
  256 |         if (hit && Date.now() - hit.at < ttlMs) {
  257 |           ledger.push({ label, kind: 'auth', cleanup: 'none', reused: true, created: '(reused within this worker)' });
  258 |           return hit.value as T;
  259 |         }
  260 |         const value = await pre({ label, kind: 'auth', cleanup: 'none' }, make);
  261 |         onceCache.set(key, { value, at: Date.now() });
  262 |         return value;
  263 |       },
  264 |       until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts: { timeoutMs?: number; intervalMs?: number } = {}): Promise<T> {
  265 |         const { timeoutMs = 15_000, intervalMs = 500 } = opts;
  266 |         return pre({ label, kind: 'readiness', cleanup: 'none' }, async () => {
  267 |           const deadline = Date.now() + timeoutMs;
  268 |           let last: T;
  269 |           for (;;) {
  270 |             last = await probe();
  271 |             if (ready(last)) return last;
  272 |             if (Date.now() > deadline) throw new Error(`not ready after ${timeoutMs} ms (last value: ${JSON.stringify(redact(last)).slice(0, 200)})`);
  273 |             await new Promise((r) => setTimeout(r, intervalMs));
  274 |           }
  275 |         });
  276 |       },
  277 |       track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T {
  278 |         const rec: SeedRecord = { label: `${label} (created by the scenario)`, kind: 'scenario-created', created: redact(created) };
  279 |         ledger.push(rec);
  280 |         cleanups.push({ rec, run: () => cleanup(created) });
  281 |         return created;
  282 |       },
  283 |     });
  284 |     // Teardown: undo in reverse order; never fail the test because of cleanup. HELDOUT_KEEP_DATA=1 keeps data for debugging.
  285 |     for (const c of cleanups.reverse()) {
  286 |       if (process.env.HELDOUT_KEEP_DATA === '1') { c.rec.cleanup = 'skipped'; continue; }
  287 |       apiPhase = 'cleanup';
  288 |       try { await c.run(); c.rec.cleanup = 'done'; } catch (e) { c.rec.cleanup = 'failed'; c.rec.error = (e as Error).message.split('\n')[0]; } finally { apiPhase = 'test'; }
  289 |     }
  290 |     if (ledger.length) await testInfo.attach('seed-ledger', { body: JSON.stringify({ tag, records: ledger }, null, 2), contentType: 'application/json' });
  291 |   },
  292 | 
  293 |   data: async ({}, use, testInfo) => {
  294 |     // spec lives in evaluations/<KEY>/tests/**  →  evaluations/<KEY>/test-data.json
  295 |     let dir = path.dirname(testInfo.file);
  296 |     while (path.basename(dir) !== 'tests' && path.dirname(dir) !== dir) dir = path.dirname(dir);
  297 |     const file = path.join(path.dirname(dir), 'test-data.json');
  298 |     const raw = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Json) : {};
  299 |     await use(resolveEnv(raw) as TestData);
  300 |   },
  301 | 
  302 |   journey: async ({ page }, use, testInfo) => {
  303 |     const capture = process.env.HELDOUT_CAPTURE === '1';
  304 |     const runDir = process.env.HELDOUT_RUN_DIR;
  305 |     const scenario = scenarioIdOf(testInfo.title) ?? slug(testInfo.title);
  306 |     let n = 0;
  307 | 
  308 |     const snap = async (label: string) => {
  309 |       // API-only tests never navigate: skip empty snapshots.
  310 |       if (page.url() === 'about:blank') return;
  311 |       const raw = await page.locator('body').ariaSnapshot({ timeout: 3_000 })
  312 |         .catch((e: Error) => `# snapshot unavailable: ${e.message.split('\n')[0]}`);
  313 |       const yaml = redactSnapshot(raw, await page.$$eval('input[type="password"]', (els) => els.map((el) => (el as HTMLInputElement).value)).catch(() => []));
  314 |       const body = `# url: ${page.url()}\n# step: ${label}\n${yaml}\n`;
  315 |       const name = `${String(n).padStart(2, '0')}-${slug(label)}`;
  316 |       await testInfo.attach(`aria-snapshot ${name}`, { body, contentType: 'text/yaml' });
  317 |       if (runDir) {
  318 |         const file = path.join(runDir, 'snapshots', scenario, `retry${testInfo.retry}`, `${name}.yml`);
  319 |         fs.mkdirSync(path.dirname(file), { recursive: true });
  320 |         fs.writeFileSync(file, body);
  321 |       }
  322 |     };
  323 | 
  324 |     await use({
  325 |       step: <T>(title: string, body: () => Promise<T>) =>
  326 |         base.step(title, async () => {
  327 |           n++;
  328 |           try {
  329 |             const result = await body();
  330 |             if (capture) await snap(title);
  331 |             return result;
  332 |           } catch (err) {
  333 |             await snap(`FAILED ${title}`).catch(() => undefined);
  334 |             throw err;
  335 |           }
  336 |         }),
  337 |       capture: snap,
  338 |     });
  339 |   },
  340 | 
```