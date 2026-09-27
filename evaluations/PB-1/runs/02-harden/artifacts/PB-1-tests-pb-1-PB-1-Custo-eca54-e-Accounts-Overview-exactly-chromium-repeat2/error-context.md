# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-014: The customer and accounts services match the login response and the Accounts Overview exactly
- Location: evaluations\PB-1\tests\pb-1.spec.ts:483:3

# Error details

```
Error: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[id="customer.firstName"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - heading "Error 1015" [level=1] [ref=e5]
    - generic [ref=e6]: "Ray ID: a4183c4c7dbab4c6 •"
    - generic [ref=e7]: 2026-09-27 05:51:15 UTC
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
      - strong [ref=e22]: a4183c4c7dbab4c6
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
  129 |  * A path in a test is relative to the AUT profile's URL, including any path prefix: with baseURL
  130 |  * https://host/app/, '/login' is https://host/app/login (plain Playwright would go to https://host/login).
  131 |  * Full URLs pass through unchanged. `page.goto`, `gotoPage` and the `api` client all resolve paths this way.
  132 |  */
  133 | export function autUrl(base: string | undefined, target: string): string {
  134 |   if (!base || /^[a-z][a-z0-9+.-]*:/i.test(target)) return target;
  135 |   return new URL(target.replace(/^\/+/, ''), base.endsWith('/') ? base : `${base}/`).toString();
  136 | }
  137 | 
  138 | /**
  139 |  * Robust entry-point navigation: wait for DOMContentLoaded, then let 'load' settle for at most
  140 |  * `settleMs` without failing (third-party assets can keep 'load' pending forever).
  141 |  */
  142 | export async function gotoPage(page: import('@playwright/test').Page, path: string, settleMs = 10_000): Promise<void> {
  143 |   await page.goto(autUrl(process.env.AUT_BASE_URL, path), { waitUntil: 'domcontentloaded' });
  144 |   await page.waitForLoadState('load', { timeout: settleMs }).catch(() => undefined);
  145 | }
  146 | 
  147 | export type ShapeRule ='string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'string[]' | ((v: unknown) => boolean | string);
  148 | 
  149 | /**
  150 |  * Schema check for API bodies. Returns human-readable violations (empty = conforms), so a
  151 |  * requirement assertion reads `expect(checkShape(room, ROOM), '[REQ AC-n] Room schema').toEqual([])`
  152 |  * and a failure lists exactly which fields broke the contract.
  153 |  */
  154 | export function checkShape(value: unknown, schema: Record<string, ShapeRule>, label = 'value'): string[] {
  155 |   if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${label} is not an object`];
  156 |   const obj = value as Record<string, unknown>;
  157 |   const out: string[] = [];
  158 |   for (const [key, rule] of Object.entries(schema)) {
  159 |     const v = obj[key];
  160 |     const where = `${label}.${key}`;
  161 |     if (v === undefined) { out.push(`${where} is missing`); continue; }
  162 |     if (typeof rule === 'function') {
  163 |       const r = rule(v);
  164 |       if (r !== true) out.push(typeof r === 'string' ? `${where} ${r}` : `${where} is invalid (${JSON.stringify(v)})`);
  165 |       continue;
  166 |     }
  167 |     const ok = rule === 'integer' ? Number.isInteger(v)
  168 |       : rule === 'array' ? Array.isArray(v)
  169 |       : rule === 'string[]' ? Array.isArray(v) && v.every((x) => typeof x === 'string')
  170 |       : rule === 'object' ? typeof v === 'object' && v !== null && !Array.isArray(v)
  171 |       : typeof v === rule;
  172 |     if (!ok) out.push(`${where} should be ${rule} but is ${JSON.stringify(v)}`);
  173 |   }
  174 |   return out;
  175 | }
  176 | 
  177 | const SECRET_KEY = /pass(word)?|token|secret|api[-_]?key|authorization|cookie|session/i;
  178 | // Header NAMES that carry credentials (incl. misspellings like "Authorisation") and VALUES that look like credentials.
  179 | const SECRET_HEADER = /auth|cookie|token|secret|api[-_]?key|session|password|credential/i;
  180 | const SECRET_VALUE = /^\s*(basic|bearer|digest|token)\s+\S+/i;
  181 | 
  182 | /** Redact secrets from headers / JSON bodies before they are attached to reports. */
  183 | export function redact(value: unknown, depth = 0): unknown {
  184 |   if (depth > 8 || value == null) return value;
  185 |   if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  186 |   if (typeof value === 'object') {
  187 |     return Object.fromEntries(Object.entries(value as Record<string, unknown>)
  188 |       .map(([k, v]) => [k, SECRET_KEY.test(k) && typeof v !== 'object' ? '***redacted***' : redact(v, depth + 1)]));
  189 |   }
  190 |   return value;
  191 | }
  192 | /**
  193 |  * ARIA snapshots include the current value of text fields — password fields too. Redact the values of the
  194 |  * page's password inputs wherever they appear, and any value shown for a textbox whose name looks secret.
  195 |  */
  196 | export function redactSnapshot(yaml: string, secretValues: string[] = []): string {
  197 |   let out = yaml;
  198 |   for (const v of secretValues.filter((x) => x && x.length >= 3)) out = out.split(v).join('***redacted***');
  199 |   return out.replace(/^(\s*- textbox "[^"]*(?:pass(?:word|code)?|pin|secret|token)[^"]*"[^:\n]*):\s*\S.*$/gim, '$1: ***redacted***');
  200 | }
  201 | const redactHeaders = (h: Record<string, string>) =>
  202 |   Object.fromEntries(Object.entries(h).map(([k, v]) => [k, SECRET_HEADER.test(k) || SECRET_VALUE.test(String(v)) ? '***redacted***' : v]));
  203 | const clip = (s: string, n = 4000) => (s.length > n ? `${s.slice(0, n)}… (${s.length - n} more chars)` : s);
  204 | 
  205 | export const test = base.extend<{ data: TestData; journey: Journey; api: Api; apiContext: APIRequestContext; seed: Seed }>({
  206 |   // Paths resolve against the profile URL including its path prefix (see autUrl).
  207 |   page: async ({ page }, use) => {
  208 |     const goto = page.goto.bind(page);
  209 |     page.goto = (url, options) => goto(autUrl(process.env.AUT_BASE_URL, url), options);
  210 |     await use(page);
  211 |   },
  212 | 
  213 |   // Depends on `api` so the API client (used by cleanups) is torn down only after the seed teardown ran.
  214 |   seed: async ({ api }, use, testInfo) => {
  215 |     void api;
  216 |     const ledger: SeedRecord[] = [];
  217 |     const cleanups: { rec: SeedRecord; run: () => Promise<unknown> }[] = [];
  218 |     const tag = `hx${Date.now().toString(36).slice(-5)}${testInfo.workerIndex}${testInfo.repeatEachIndex}`;
  219 |     /** Run a precondition in the [seed] phase with ledger + BLOCKED semantics. */
  220 |     const pre = async <T,>(rec: SeedRecord, run: () => Promise<T>): Promise<T> => {
  221 |       ledger.push(rec);
  222 |       try {
  223 |         apiPhase = 'seed';
  224 |         const value = await base.step(`[SEED] ${rec.label}`, run).finally(() => { apiPhase = 'test'; });
  225 |         rec.created = redact(value);
  226 |         return value;
  227 |       } catch (err) {
  228 |         rec.error = (err as Error).message.split('\n')[0];
> 229 |         throw new Error(`[SEED] ${rec.label}: precondition could not be established — ${(err as Error).message}`);
      |               ^ Error: [SEED] customer registered via register.htm: precondition could not be established — locator.fill: Timeout 10000ms exceeded.
  230 |       }
  231 |     };
  232 |     await use({
  233 |       tag,
  234 |       async create<T>(label: string, make: () => Promise<T>, cleanup?: (created: T) => Promise<unknown>): Promise<T> {
  235 |         const rec: SeedRecord = { label, kind: 'data', cleanup: cleanup ? undefined : 'none' };
  236 |         const created = await pre(rec, make);
  237 |         if (cleanup) cleanups.push({ rec, run: () => cleanup(created) });
  238 |         return created;
  239 |       },
  240 |       step<T>(label: string, run: () => Promise<T>): Promise<T> {
  241 |         return pre({ label, kind: 'pre-step', cleanup: 'none' }, run);
  242 |       },
  243 |       async once<T>(key: string, label: string, make: () => Promise<T>, ttlMs = 10 * 60_000): Promise<T> {
  244 |         const hit = onceCache.get(key);
  245 |         if (hit && Date.now() - hit.at < ttlMs) {
  246 |           ledger.push({ label, kind: 'auth', cleanup: 'none', reused: true, created: '(reused within this worker)' });
  247 |           return hit.value as T;
  248 |         }
  249 |         const value = await pre({ label, kind: 'auth', cleanup: 'none' }, make);
  250 |         onceCache.set(key, { value, at: Date.now() });
  251 |         return value;
  252 |       },
  253 |       until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts: { timeoutMs?: number; intervalMs?: number } = {}): Promise<T> {
  254 |         const { timeoutMs = 15_000, intervalMs = 500 } = opts;
  255 |         return pre({ label, kind: 'readiness', cleanup: 'none' }, async () => {
  256 |           const deadline = Date.now() + timeoutMs;
  257 |           let last: T;
  258 |           for (;;) {
  259 |             last = await probe();
  260 |             if (ready(last)) return last;
  261 |             if (Date.now() > deadline) throw new Error(`not ready after ${timeoutMs} ms (last value: ${JSON.stringify(redact(last)).slice(0, 200)})`);
  262 |             await new Promise((r) => setTimeout(r, intervalMs));
  263 |           }
  264 |         });
  265 |       },
  266 |       track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T {
  267 |         const rec: SeedRecord = { label: `${label} (created by the scenario)`, kind: 'scenario-created', created: redact(created) };
  268 |         ledger.push(rec);
  269 |         cleanups.push({ rec, run: () => cleanup(created) });
  270 |         return created;
  271 |       },
  272 |     });
  273 |     // Teardown: undo in reverse order; never fail the test because of cleanup. HELDOUT_KEEP_DATA=1 keeps data for debugging.
  274 |     for (const c of cleanups.reverse()) {
  275 |       if (process.env.HELDOUT_KEEP_DATA === '1') { c.rec.cleanup = 'skipped'; continue; }
  276 |       apiPhase = 'cleanup';
  277 |       try { await c.run(); c.rec.cleanup = 'done'; } catch (e) { c.rec.cleanup = 'failed'; c.rec.error = (e as Error).message.split('\n')[0]; } finally { apiPhase = 'test'; }
  278 |     }
  279 |     if (ledger.length) await testInfo.attach('seed-ledger', { body: JSON.stringify({ tag, records: ledger }, null, 2), contentType: 'application/json' });
  280 |   },
  281 | 
  282 |   data: async ({}, use, testInfo) => {
  283 |     // spec lives in evaluations/<KEY>/tests/**  →  evaluations/<KEY>/test-data.json
  284 |     let dir = path.dirname(testInfo.file);
  285 |     while (path.basename(dir) !== 'tests' && path.dirname(dir) !== dir) dir = path.dirname(dir);
  286 |     const file = path.join(path.dirname(dir), 'test-data.json');
  287 |     const raw = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Json) : {};
  288 |     await use(resolveEnv(raw) as TestData);
  289 |   },
  290 | 
  291 |   journey: async ({ page }, use, testInfo) => {
  292 |     const capture = process.env.HELDOUT_CAPTURE === '1';
  293 |     const runDir = process.env.HELDOUT_RUN_DIR;
  294 |     const scenario = scenarioIdOf(testInfo.title) ?? slug(testInfo.title);
  295 |     let n = 0;
  296 | 
  297 |     const snap = async (label: string) => {
  298 |       // API-only tests never navigate: skip empty snapshots.
  299 |       if (page.url() === 'about:blank') return;
  300 |       const raw = await page.locator('body').ariaSnapshot({ timeout: 3_000 })
  301 |         .catch((e: Error) => `# snapshot unavailable: ${e.message.split('\n')[0]}`);
  302 |       const yaml = redactSnapshot(raw, await page.$$eval('input[type="password"]', (els) => els.map((el) => (el as HTMLInputElement).value)).catch(() => []));
  303 |       const body = `# url: ${page.url()}\n# step: ${label}\n${yaml}\n`;
  304 |       const name = `${String(n).padStart(2, '0')}-${slug(label)}`;
  305 |       await testInfo.attach(`aria-snapshot ${name}`, { body, contentType: 'text/yaml' });
  306 |       if (runDir) {
  307 |         const file = path.join(runDir, 'snapshots', scenario, `retry${testInfo.retry}`, `${name}.yml`);
  308 |         fs.mkdirSync(path.dirname(file), { recursive: true });
  309 |         fs.writeFileSync(file, body);
  310 |       }
  311 |     };
  312 | 
  313 |     await use({
  314 |       step: <T>(title: string, body: () => Promise<T>) =>
  315 |         base.step(title, async () => {
  316 |           n++;
  317 |           try {
  318 |             const result = await body();
  319 |             if (capture) await snap(title);
  320 |             return result;
  321 |           } catch (err) {
  322 |             await snap(`FAILED ${title}`).catch(() => undefined);
  323 |             throw err;
  324 |           }
  325 |         }),
  326 |       capture: snap,
  327 |     });
  328 |   },
  329 | 
```