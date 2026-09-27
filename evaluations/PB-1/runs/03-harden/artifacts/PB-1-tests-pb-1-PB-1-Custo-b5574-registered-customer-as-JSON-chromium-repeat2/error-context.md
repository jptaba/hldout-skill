# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-010: REST login with valid credentials returns the registered customer as JSON
- Location: evaluations\PB-1\tests\pb-1.spec.ts:374:3

# Error details

```
Error: [SEED] customer registered via register.htm: precondition could not be established — registration succeeded (precondition)

expect(locator).toBeVisible() failed

Locator: getByText('Your account was created successfully. You are now logged in.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - registration succeeded (precondition) getByText('Your account was created successfully. You are now logged in.') with timeout 5000ms
  - waiting for getByText('Your account was created successfully. You are now logged in.')

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - main [ref=f1e2]:
    - generic [ref=f1e3]:
      - heading "parabank.parasoft.com" [level=1] [ref=f1e5]
      - heading "Performing security verification" [level=2] [ref=f1e6]
      - paragraph [ref=f1e7]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
  - contentinfo [ref=f1e12]:
    - generic [ref=f1e14]:
      - generic [ref=f1e16]:
        - text: "Ray ID:"
        - code [ref=f1e17]: a41842ba9826b731
      - generic [ref=f1e18]:
        - generic [ref=f1e19]:
          - text: Performance and Security by
          - link "Cloudflare, opens in a new tab" [ref=f1e20] [cursor=pointer]:
            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
            - text: Cloudflare
        - link "Privacy, opens in a new tab" [ref=f1e22] [cursor=pointer]:
          - /url: https://www.cloudflare.com/privacypolicy/
          - text: Privacy
```

# Test source

```ts
  137 | 
  138 | /** Abort requests to the profile's blockHosts (ads, analytics, consent banners): they are not the AUT and inject content. */
  139 | export async function blockThirdParty(context: import('@playwright/test').BrowserContext, hosts = ''): Promise<void> {
  140 |   const list = hosts.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
  141 |   if (!list.length) return;
  142 |   await context.route((url) => list.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)), (route) => route.abort());
  143 | }
  144 | 
  145 | /**
  146 |  * Robust entry-point navigation: wait for DOMContentLoaded, then let 'load' settle for at most
  147 |  * `settleMs` without failing (third-party assets can keep 'load' pending forever).
  148 |  */
  149 | export async function gotoPage(page: import('@playwright/test').Page, path: string, settleMs = 10_000): Promise<void> {
  150 |   await page.goto(autUrl(process.env.AUT_BASE_URL, path), { waitUntil: 'domcontentloaded' });
  151 |   await page.waitForLoadState('load', { timeout: settleMs }).catch(() => undefined);
  152 | }
  153 | 
  154 | export type ShapeRule ='string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'string[]' | ((v: unknown) => boolean | string);
  155 | 
  156 | /**
  157 |  * Schema check for API bodies. Returns human-readable violations (empty = conforms), so a
  158 |  * requirement assertion reads `expect(checkShape(room, ROOM), '[REQ AC-n] Room schema').toEqual([])`
  159 |  * and a failure lists exactly which fields broke the contract.
  160 |  */
  161 | export function checkShape(value: unknown, schema: Record<string, ShapeRule>, label = 'value'): string[] {
  162 |   if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${label} is not an object`];
  163 |   const obj = value as Record<string, unknown>;
  164 |   const out: string[] = [];
  165 |   for (const [key, rule] of Object.entries(schema)) {
  166 |     const v = obj[key];
  167 |     const where = `${label}.${key}`;
  168 |     if (v === undefined) { out.push(`${where} is missing`); continue; }
  169 |     if (typeof rule === 'function') {
  170 |       const r = rule(v);
  171 |       if (r !== true) out.push(typeof r === 'string' ? `${where} ${r}` : `${where} is invalid (${JSON.stringify(v)})`);
  172 |       continue;
  173 |     }
  174 |     const ok = rule === 'integer' ? Number.isInteger(v)
  175 |       : rule === 'array' ? Array.isArray(v)
  176 |       : rule === 'string[]' ? Array.isArray(v) && v.every((x) => typeof x === 'string')
  177 |       : rule === 'object' ? typeof v === 'object' && v !== null && !Array.isArray(v)
  178 |       : typeof v === rule;
  179 |     if (!ok) out.push(`${where} should be ${rule} but is ${JSON.stringify(v)}`);
  180 |   }
  181 |   return out;
  182 | }
  183 | 
  184 | const SECRET_KEY = /pass(word)?|token|secret|api[-_]?key|authorization|cookie|session/i;
  185 | // Header NAMES that carry credentials (incl. misspellings like "Authorisation") and VALUES that look like credentials.
  186 | const SECRET_HEADER = /auth|cookie|token|secret|api[-_]?key|session|password|credential/i;
  187 | const SECRET_VALUE = /^\s*(basic|bearer|digest|token)\s+\S+/i;
  188 | 
  189 | /** Redact secrets from headers / JSON bodies before they are attached to reports. */
  190 | export function redact(value: unknown, depth = 0): unknown {
  191 |   if (depth > 8 || value == null) return value;
  192 |   if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  193 |   if (typeof value === 'object') {
  194 |     return Object.fromEntries(Object.entries(value as Record<string, unknown>)
  195 |       .map(([k, v]) => [k, SECRET_KEY.test(k) && typeof v !== 'object' ? '***redacted***' : redact(v, depth + 1)]));
  196 |   }
  197 |   return value;
  198 | }
  199 | /**
  200 |  * ARIA snapshots include the current value of text fields — password fields too. Redact the values of the
  201 |  * page's password inputs wherever they appear, and any value shown for a textbox whose name looks secret.
  202 |  */
  203 | export function redactSnapshot(yaml: string, secretValues: string[] = []): string {
  204 |   let out = yaml;
  205 |   for (const v of secretValues.filter((x) => x && x.length >= 3)) out = out.split(v).join('***redacted***');
  206 |   return out.replace(/^(\s*- textbox "[^"]*(?:pass(?:word|code)?|pin|secret|token)[^"]*"[^:\n]*):\s*\S.*$/gim, '$1: ***redacted***');
  207 | }
  208 | const redactHeaders = (h: Record<string, string>) =>
  209 |   Object.fromEntries(Object.entries(h).map(([k, v]) => [k, SECRET_HEADER.test(k) || SECRET_VALUE.test(String(v)) ? '***redacted***' : v]));
  210 | const clip = (s: string, n = 4000) => (s.length > n ? `${s.slice(0, n)}… (${s.length - n} more chars)` : s);
  211 | 
  212 | export const test = base.extend<{ data: TestData; journey: Journey; api: Api; apiContext: APIRequestContext; seed: Seed }>({
  213 |   // Paths resolve against the profile URL including its path prefix (see autUrl).
  214 |   page: async ({ page }, use) => {
  215 |     await blockThirdParty(page.context(), process.env.AUT_BLOCK_HOSTS);
  216 |     const goto = page.goto.bind(page);
  217 |     page.goto = (url, options) => goto(autUrl(process.env.AUT_BASE_URL, url), options);
  218 |     await use(page);
  219 |   },
  220 | 
  221 |   // Depends on `api` so the API client (used by cleanups) is torn down only after the seed teardown ran.
  222 |   seed: async ({ api }, use, testInfo) => {
  223 |     void api;
  224 |     const ledger: SeedRecord[] = [];
  225 |     const cleanups: { rec: SeedRecord; run: () => Promise<unknown> }[] = [];
  226 |     const tag = `hx${Date.now().toString(36).slice(-5)}${testInfo.workerIndex}${testInfo.repeatEachIndex}`;
  227 |     /** Run a precondition in the [seed] phase with ledger + BLOCKED semantics. */
  228 |     const pre = async <T,>(rec: SeedRecord, run: () => Promise<T>): Promise<T> => {
  229 |       ledger.push(rec);
  230 |       try {
  231 |         apiPhase = 'seed';
  232 |         const value = await base.step(`[SEED] ${rec.label}`, run).finally(() => { apiPhase = 'test'; });
  233 |         rec.created = redact(value);
  234 |         return value;
  235 |       } catch (err) {
  236 |         rec.error = (err as Error).message.split('\n')[0];
> 237 |         throw new Error(`[SEED] ${rec.label}: precondition could not be established — ${(err as Error).message}`);
      |               ^ Error: [SEED] customer registered via register.htm: precondition could not be established — registration succeeded (precondition)
  238 |       }
  239 |     };
  240 |     await use({
  241 |       tag,
  242 |       async create<T>(label: string, make: () => Promise<T>, cleanup?: (created: T) => Promise<unknown>): Promise<T> {
  243 |         const rec: SeedRecord = { label, kind: 'data', cleanup: cleanup ? undefined : 'none' };
  244 |         const created = await pre(rec, make);
  245 |         if (cleanup) cleanups.push({ rec, run: () => cleanup(created) });
  246 |         return created;
  247 |       },
  248 |       step<T>(label: string, run: () => Promise<T>): Promise<T> {
  249 |         return pre({ label, kind: 'pre-step', cleanup: 'none' }, run);
  250 |       },
  251 |       async once<T>(key: string, label: string, make: () => Promise<T>, ttlMs = 10 * 60_000): Promise<T> {
  252 |         const hit = onceCache.get(key);
  253 |         if (hit && Date.now() - hit.at < ttlMs) {
  254 |           ledger.push({ label, kind: 'auth', cleanup: 'none', reused: true, created: '(reused within this worker)' });
  255 |           return hit.value as T;
  256 |         }
  257 |         const value = await pre({ label, kind: 'auth', cleanup: 'none' }, make);
  258 |         onceCache.set(key, { value, at: Date.now() });
  259 |         return value;
  260 |       },
  261 |       until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts: { timeoutMs?: number; intervalMs?: number } = {}): Promise<T> {
  262 |         const { timeoutMs = 15_000, intervalMs = 500 } = opts;
  263 |         return pre({ label, kind: 'readiness', cleanup: 'none' }, async () => {
  264 |           const deadline = Date.now() + timeoutMs;
  265 |           let last: T;
  266 |           for (;;) {
  267 |             last = await probe();
  268 |             if (ready(last)) return last;
  269 |             if (Date.now() > deadline) throw new Error(`not ready after ${timeoutMs} ms (last value: ${JSON.stringify(redact(last)).slice(0, 200)})`);
  270 |             await new Promise((r) => setTimeout(r, intervalMs));
  271 |           }
  272 |         });
  273 |       },
  274 |       track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T {
  275 |         const rec: SeedRecord = { label: `${label} (created by the scenario)`, kind: 'scenario-created', created: redact(created) };
  276 |         ledger.push(rec);
  277 |         cleanups.push({ rec, run: () => cleanup(created) });
  278 |         return created;
  279 |       },
  280 |     });
  281 |     // Teardown: undo in reverse order; never fail the test because of cleanup. HELDOUT_KEEP_DATA=1 keeps data for debugging.
  282 |     for (const c of cleanups.reverse()) {
  283 |       if (process.env.HELDOUT_KEEP_DATA === '1') { c.rec.cleanup = 'skipped'; continue; }
  284 |       apiPhase = 'cleanup';
  285 |       try { await c.run(); c.rec.cleanup = 'done'; } catch (e) { c.rec.cleanup = 'failed'; c.rec.error = (e as Error).message.split('\n')[0]; } finally { apiPhase = 'test'; }
  286 |     }
  287 |     if (ledger.length) await testInfo.attach('seed-ledger', { body: JSON.stringify({ tag, records: ledger }, null, 2), contentType: 'application/json' });
  288 |   },
  289 | 
  290 |   data: async ({}, use, testInfo) => {
  291 |     // spec lives in evaluations/<KEY>/tests/**  →  evaluations/<KEY>/test-data.json
  292 |     let dir = path.dirname(testInfo.file);
  293 |     while (path.basename(dir) !== 'tests' && path.dirname(dir) !== dir) dir = path.dirname(dir);
  294 |     const file = path.join(path.dirname(dir), 'test-data.json');
  295 |     const raw = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Json) : {};
  296 |     await use(resolveEnv(raw) as TestData);
  297 |   },
  298 | 
  299 |   journey: async ({ page }, use, testInfo) => {
  300 |     const capture = process.env.HELDOUT_CAPTURE === '1';
  301 |     const runDir = process.env.HELDOUT_RUN_DIR;
  302 |     const scenario = scenarioIdOf(testInfo.title) ?? slug(testInfo.title);
  303 |     let n = 0;
  304 | 
  305 |     const snap = async (label: string) => {
  306 |       // API-only tests never navigate: skip empty snapshots.
  307 |       if (page.url() === 'about:blank') return;
  308 |       const raw = await page.locator('body').ariaSnapshot({ timeout: 3_000 })
  309 |         .catch((e: Error) => `# snapshot unavailable: ${e.message.split('\n')[0]}`);
  310 |       const yaml = redactSnapshot(raw, await page.$$eval('input[type="password"]', (els) => els.map((el) => (el as HTMLInputElement).value)).catch(() => []));
  311 |       const body = `# url: ${page.url()}\n# step: ${label}\n${yaml}\n`;
  312 |       const name = `${String(n).padStart(2, '0')}-${slug(label)}`;
  313 |       await testInfo.attach(`aria-snapshot ${name}`, { body, contentType: 'text/yaml' });
  314 |       if (runDir) {
  315 |         const file = path.join(runDir, 'snapshots', scenario, `retry${testInfo.retry}`, `${name}.yml`);
  316 |         fs.mkdirSync(path.dirname(file), { recursive: true });
  317 |         fs.writeFileSync(file, body);
  318 |       }
  319 |     };
  320 | 
  321 |     await use({
  322 |       step: <T>(title: string, body: () => Promise<T>) =>
  323 |         base.step(title, async () => {
  324 |           n++;
  325 |           try {
  326 |             const result = await body();
  327 |             if (capture) await snap(title);
  328 |             return result;
  329 |           } catch (err) {
  330 |             await snap(`FAILED ${title}`).catch(() => undefined);
  331 |             throw err;
  332 |           }
  333 |         }),
  334 |       capture: snap,
  335 |     });
  336 |   },
  337 | 
```