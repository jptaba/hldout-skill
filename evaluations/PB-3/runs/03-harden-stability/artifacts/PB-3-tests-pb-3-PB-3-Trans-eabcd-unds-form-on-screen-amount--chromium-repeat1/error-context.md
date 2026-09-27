# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-3\tests\pb-3.spec.ts >> PB-3 Transfer funds between my own accounts >> SCN-004.1: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "")
- Location: evaluations\PB-3\tests\pb-3.spec.ts:250:5

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
    - generic [ref=e6]: "Ray ID: a41a9db0de53204a •"
    - generic [ref=e7]: 2026-09-27 12:47:16 UTC
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
      - strong [ref=e22]: a41a9db0de53204a
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
  142 | 
  143 | /** Abort requests to the profile's blockHosts (ads, analytics, consent banners): they are not the AUT and inject content. */
  144 | export async function blockThirdParty(context: import('@playwright/test').BrowserContext, hosts = ''): Promise<void> {
  145 |   const list = hosts.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
  146 |   if (!list.length) return;
  147 |   await context.route((url) => list.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)), (route) => route.abort());
  148 | }
  149 | 
  150 | /**
  151 |  * Robust entry-point navigation: wait for DOMContentLoaded, then let 'load' settle for at most
  152 |  * `settleMs` without failing (third-party assets can keep 'load' pending forever).
  153 |  */
  154 | export async function gotoPage(page: import('@playwright/test').Page, path: string, settleMs = 10_000): Promise<void> {
  155 |   await page.goto(autUrl(process.env.AUT_BASE_URL, path), { waitUntil: 'domcontentloaded' });
  156 |   await page.waitForLoadState('load', { timeout: settleMs }).catch(() => undefined);
  157 | }
  158 | 
  159 | export type ShapeRule ='string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'string[]' | ((v: unknown) => boolean | string);
  160 | 
  161 | /**
  162 |  * Schema check for API bodies. Returns human-readable violations (empty = conforms), so a
  163 |  * requirement assertion reads `expect(checkShape(room, ROOM), '[REQ AC-n] Room schema').toEqual([])`
  164 |  * and a failure lists exactly which fields broke the contract.
  165 |  */
  166 | export function checkShape(value: unknown, schema: Record<string, ShapeRule>, label = 'value'): string[] {
  167 |   if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${label} is not an object`];
  168 |   const obj = value as Record<string, unknown>;
  169 |   const out: string[] = [];
  170 |   for (const [key, rule] of Object.entries(schema)) {
  171 |     const v = obj[key];
  172 |     const where = `${label}.${key}`;
  173 |     if (v === undefined) { out.push(`${where} is missing`); continue; }
  174 |     if (typeof rule === 'function') {
  175 |       const r = rule(v);
  176 |       if (r !== true) out.push(typeof r === 'string' ? `${where} ${r}` : `${where} is invalid (${JSON.stringify(v)})`);
  177 |       continue;
  178 |     }
  179 |     const ok = rule === 'integer' ? Number.isInteger(v)
  180 |       : rule === 'array' ? Array.isArray(v)
  181 |       : rule === 'string[]' ? Array.isArray(v) && v.every((x) => typeof x === 'string')
  182 |       : rule === 'object' ? typeof v === 'object' && v !== null && !Array.isArray(v)
  183 |       : typeof v === rule;
  184 |     if (!ok) out.push(`${where} should be ${rule} but is ${JSON.stringify(v)}`);
  185 |   }
  186 |   return out;
  187 | }
  188 | 
  189 | const SECRET_KEY = /pass(word)?|token|secret|api[-_]?key|authorization|cookie|session/i;
  190 | // Header NAMES that carry credentials (incl. misspellings like "Authorisation") and VALUES that look like credentials.
  191 | const SECRET_HEADER = /auth|cookie|token|secret|api[-_]?key|session|password|credential/i;
  192 | const SECRET_VALUE = /^\s*(basic|bearer|digest|token)\s+\S+/i;
  193 | 
  194 | /** Redact secrets from headers / JSON bodies before they are attached to reports. */
  195 | export function redact(value: unknown, depth = 0): unknown {
  196 |   if (depth > 8 || value == null) return value;
  197 |   if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  198 |   if (typeof value === 'object') {
  199 |     return Object.fromEntries(Object.entries(value as Record<string, unknown>)
  200 |       .map(([k, v]) => [k, SECRET_KEY.test(k) && typeof v !== 'object' ? '***redacted***' : redact(v, depth + 1)]));
  201 |   }
  202 |   return value;
  203 | }
  204 | /**
  205 |  * ARIA snapshots include the current value of text fields — password fields too. Redact the values of the
  206 |  * page's password inputs wherever they appear, and any value shown for a textbox whose name looks secret.
  207 |  */
  208 | export function redactSnapshot(yaml: string, secretValues: string[] = []): string {
  209 |   let out = yaml;
  210 |   for (const v of secretValues.filter((x) => x && x.length >= 3)) out = out.split(v).join('***redacted***');
  211 |   return out.replace(/^(\s*- textbox "[^"]*(?:pass(?:word|code)?|pin|secret|token)[^"]*"[^:\n]*):\s*\S.*$/gim, '$1: ***redacted***');
  212 | }
  213 | const redactHeaders = (h: Record<string, string>) =>
  214 |   Object.fromEntries(Object.entries(h).map(([k, v]) => [k, SECRET_HEADER.test(k) || SECRET_VALUE.test(String(v)) ? '***redacted***' : v]));
  215 | const clip = (s: string, n = 4000) => (s.length > n ? `${s.slice(0, n)}… (${s.length - n} more chars)` : s);
  216 | 
  217 | export const test = base.extend<{ data: TestData; journey: Journey; api: Api; apiContext: APIRequestContext; seed: Seed }>({
  218 |   // Paths resolve against the profile URL including its path prefix (see autUrl).
  219 |   page: async ({ page }, use) => {
  220 |     await blockThirdParty(page.context(), process.env.AUT_BLOCK_HOSTS);
  221 |     const goto = page.goto.bind(page);
  222 |     page.goto = (url, options) => goto(autUrl(process.env.AUT_BASE_URL, url), options);
  223 |     await use(page);
  224 |   },
  225 | 
  226 |   // Depends on `api` so the API client (used by cleanups) is torn down only after the seed teardown ran.
  227 |   seed: async ({ api }, use, testInfo) => {
  228 |     void api;
  229 |     const ledger: SeedRecord[] = [];
  230 |     const cleanups: { rec: SeedRecord; run: () => Promise<unknown> }[] = [];
  231 |     const tag = `hx${Date.now().toString(36).slice(-5)}${testInfo.workerIndex}${testInfo.repeatEachIndex}`;
  232 |     /** Run a precondition in the [seed] phase with ledger + BLOCKED semantics. */
  233 |     const pre = async <T,>(rec: SeedRecord, run: () => Promise<T>): Promise<T> => {
  234 |       ledger.push(rec);
  235 |       try {
  236 |         apiPhase = 'seed';
  237 |         const value = await base.step(`[SEED] ${rec.label}`, run).finally(() => { apiPhase = 'test'; });
  238 |         rec.created = redact(value);
  239 |         return value;
  240 |       } catch (err) {
  241 |         rec.error = (err as Error).message.split('\n')[0];
> 242 |         throw new Error(`[SEED] ${rec.label}: precondition could not be established — ${(err as Error).message}`);
      |               ^ Error: [SEED] customer who owns accounts A and B (register + Open New Account): precondition could not be established — locator.fill: Timeout 10000ms exceeded.
  243 |       }
  244 |     };
  245 |     await use({
  246 |       tag,
  247 |       async create<T>(label: string, make: () => Promise<T>, cleanup?: (created: T) => Promise<unknown>): Promise<T> {
  248 |         const rec: SeedRecord = { label, kind: 'data', cleanup: cleanup ? undefined : 'none' };
  249 |         const created = await pre(rec, make);
  250 |         if (cleanup) cleanups.push({ rec, run: () => cleanup(created) });
  251 |         return created;
  252 |       },
  253 |       step<T>(label: string, run: () => Promise<T>): Promise<T> {
  254 |         return pre({ label, kind: 'pre-step', cleanup: 'none' }, run);
  255 |       },
  256 |       async once<T>(key: string, label: string, make: () => Promise<T>, ttlMs = 10 * 60_000): Promise<T> {
  257 |         const hit = onceCache.get(key);
  258 |         if (hit && Date.now() - hit.at < ttlMs) {
  259 |           ledger.push({ label, kind: 'auth', cleanup: 'none', reused: true, created: '(reused within this worker)' });
  260 |           return hit.value as T;
  261 |         }
  262 |         const value = await pre({ label, kind: 'auth', cleanup: 'none' }, make);
  263 |         onceCache.set(key, { value, at: Date.now() });
  264 |         return value;
  265 |       },
  266 |       until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts: { timeoutMs?: number; intervalMs?: number } = {}): Promise<T> {
  267 |         const { timeoutMs = 15_000, intervalMs = 500 } = opts;
  268 |         return pre({ label, kind: 'readiness', cleanup: 'none' }, async () => {
  269 |           const deadline = Date.now() + timeoutMs;
  270 |           let last: T;
  271 |           for (;;) {
  272 |             last = await probe();
  273 |             if (ready(last)) return last;
  274 |             if (Date.now() > deadline) throw new Error(`not ready after ${timeoutMs} ms (last value: ${JSON.stringify(redact(last)).slice(0, 200)})`);
  275 |             await new Promise((r) => setTimeout(r, intervalMs));
  276 |           }
  277 |         });
  278 |       },
  279 |       track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T {
  280 |         const rec: SeedRecord = { label: `${label} (created by the scenario)`, kind: 'scenario-created', created: redact(created) };
  281 |         ledger.push(rec);
  282 |         cleanups.push({ rec, run: () => cleanup(created) });
  283 |         return created;
  284 |       },
  285 |     });
  286 |     // Teardown: undo in reverse order; never fail the test because of cleanup. HELDOUT_KEEP_DATA=1 keeps data for debugging.
  287 |     for (const c of cleanups.reverse()) {
  288 |       if (process.env.HELDOUT_KEEP_DATA === '1') { c.rec.cleanup = 'skipped'; continue; }
  289 |       apiPhase = 'cleanup';
  290 |       try { await c.run(); c.rec.cleanup = 'done'; } catch (e) { c.rec.cleanup = 'failed'; c.rec.error = (e as Error).message.split('\n')[0]; } finally { apiPhase = 'test'; }
  291 |     }
  292 |     if (ledger.length) await testInfo.attach('seed-ledger', { body: JSON.stringify({ tag, records: ledger }, null, 2), contentType: 'application/json' });
  293 |   },
  294 | 
  295 |   data: async ({}, use, testInfo) => {
  296 |     // spec lives in evaluations/<KEY>/tests/**  →  evaluations/<KEY>/test-data.json
  297 |     let dir = path.dirname(testInfo.file);
  298 |     while (path.basename(dir) !== 'tests' && path.dirname(dir) !== dir) dir = path.dirname(dir);
  299 |     const file = path.join(path.dirname(dir), 'test-data.json');
  300 |     const raw = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Json) : {};
  301 |     await use(resolveEnv(raw) as TestData);
  302 |   },
  303 | 
  304 |   journey: async ({ page }, use, testInfo) => {
  305 |     const capture = process.env.HELDOUT_CAPTURE === '1';
  306 |     const runDir = process.env.HELDOUT_RUN_DIR;
  307 |     const scenario = scenarioIdOf(testInfo.title) ?? slug(testInfo.title);
  308 |     let n = 0;
  309 | 
  310 |     const snap = async (label: string) => {
  311 |       // API-only tests never navigate: skip empty snapshots.
  312 |       if (page.url() === 'about:blank') return;
  313 |       const raw = await page.locator('body').ariaSnapshot({ timeout: 3_000 })
  314 |         .catch((e: Error) => `# snapshot unavailable: ${e.message.split('\n')[0]}`);
  315 |       const yaml = redactSnapshot(raw, await page.$$eval('input[type="password"]', (els) => els.map((el) => (el as HTMLInputElement).value)).catch(() => []));
  316 |       const body = `# url: ${page.url()}\n# step: ${label}\n${yaml}\n`;
  317 |       const name = `${String(n).padStart(2, '0')}-${slug(label)}`;
  318 |       await testInfo.attach(`aria-snapshot ${name}`, { body, contentType: 'text/yaml' });
  319 |       if (runDir) {
  320 |         const file = path.join(runDir, 'snapshots', scenario, `retry${testInfo.retry}`, `${name}.yml`);
  321 |         fs.mkdirSync(path.dirname(file), { recursive: true });
  322 |         fs.writeFileSync(file, body);
  323 |       }
  324 |     };
  325 | 
  326 |     await use({
  327 |       step: <T>(title: string, body: () => Promise<T>) =>
  328 |         base.step(title, async () => {
  329 |           n++;
  330 |           try {
  331 |             const result = await body();
  332 |             if (capture) await snap(title);
  333 |             return result;
  334 |           } catch (err) {
  335 |             await snap(`FAILED ${title}`).catch(() => undefined);
  336 |             throw err;
  337 |           }
  338 |         }),
  339 |       capture: snap,
  340 |     });
  341 |   },
  342 | 
```