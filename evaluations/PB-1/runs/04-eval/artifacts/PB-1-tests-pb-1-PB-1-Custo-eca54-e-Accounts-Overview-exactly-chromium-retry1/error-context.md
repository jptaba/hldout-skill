# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-014: The customer and accounts services match the login response and the Accounts Overview exactly
- Location: evaluations\PB-1\tests\pb-1.spec.ts:488:3

# Error details

```
Error: [SEED] read account numbers from Accounts Overview: precondition could not be established — account numbers rendered (precondition)

expect(locator).toBeVisible() failed

Locator: locator('#accountTable tbody a').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - account numbers rendered (precondition) locator('#accountTable tbody a').first() with timeout 5000ms
  - waiting for locator('#accountTable tbody a').first()

```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - generic [ref=f2e3]:
      - link:
        - /url: admin.htm
        - img [ref=f2e4] [cursor=pointer]
      - link "ParaBank":
        - /url: index.htm
        - img "ParaBank" [ref=f2e5] [cursor=pointer]
      - paragraph [ref=f2e6]: Experience the difference
    - generic [ref=f2e7]:
      - list [ref=f2e8]:
        - listitem [ref=f2e9]: Solutions
        - listitem [ref=f2e10]:
          - link "About Us" [ref=f2e11] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f2e12]:
          - link "Services" [ref=f2e13] [cursor=pointer]:
            - /url: services.htm
        - listitem [ref=f2e14]:
          - link "Products" [ref=f2e15] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/products.jsp
        - listitem [ref=f2e16]:
          - link "Locations" [ref=f2e17] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - listitem [ref=f2e18]:
          - link "Admin Page" [ref=f2e19] [cursor=pointer]:
            - /url: admin.htm
      - list [ref=f2e20]:
        - listitem [ref=f2e21]:
          - link "home" [ref=f2e22] [cursor=pointer]:
            - /url: index.htm
        - listitem [ref=f2e23]:
          - link "about" [ref=f2e24] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f2e25]:
          - link "contact" [ref=f2e26] [cursor=pointer]:
            - /url: contact.htm
    - generic [ref=f2e27]:
      - generic [ref=f2e28]:
        - paragraph [ref=f2e29]: Welcome Hana Heldouta100
        - heading "Account Services" [level=2] [ref=f2e30]
        - list [ref=f2e31]:
          - listitem [ref=f2e32]:
            - link "Open New Account" [ref=f2e33] [cursor=pointer]:
              - /url: openaccount.htm
          - listitem [ref=f2e34]:
            - link "Accounts Overview" [ref=f2e35] [cursor=pointer]:
              - /url: overview.htm
          - listitem [ref=f2e36]:
            - link "Transfer Funds" [ref=f2e37] [cursor=pointer]:
              - /url: transfer.htm
          - listitem [ref=f2e38]:
            - link "Bill Pay" [ref=f2e39] [cursor=pointer]:
              - /url: billpay.htm
          - listitem [ref=f2e40]:
            - link "Find Transactions" [ref=f2e41] [cursor=pointer]:
              - /url: findtrans.htm
          - listitem [ref=f2e42]:
            - link "Update Contact Info" [ref=f2e43] [cursor=pointer]:
              - /url: updateprofile.htm
          - listitem [ref=f2e44]:
            - link "Request Loan" [ref=f2e45] [cursor=pointer]:
              - /url: requestloan.htm
          - listitem [ref=f2e46]:
            - link "Log Out" [ref=f2e47] [cursor=pointer]:
              - /url: logout.htm
      - generic [ref=f2e50]:
        - heading "Error!" [level=1] [ref=f2e51]
        - paragraph [ref=f2e52]: An internal error has occurred and has been logged.
  - generic [ref=f2e54]:
    - list [ref=f2e55]:
      - listitem [ref=f2e56]:
        - link "Home" [ref=f2e57] [cursor=pointer]:
          - /url: index.htm
        - text: "|"
      - listitem [ref=f2e58]:
        - link "About Us" [ref=f2e59] [cursor=pointer]:
          - /url: about.htm
        - text: "|"
      - listitem [ref=f2e60]:
        - link "Services" [ref=f2e61] [cursor=pointer]:
          - /url: services.htm
        - text: "|"
      - listitem [ref=f2e62]:
        - link "Products" [ref=f2e63] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/products.jsp
        - text: "|"
      - listitem [ref=f2e64]:
        - link "Locations" [ref=f2e65] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - text: "|"
      - listitem [ref=f2e66]:
        - link "Forum" [ref=f2e67] [cursor=pointer]:
          - /url: http://forums.parasoft.com/
        - text: "|"
      - listitem [ref=f2e68]:
        - link "Site Map" [ref=f2e69] [cursor=pointer]:
          - /url: sitemap.htm
        - text: "|"
      - listitem [ref=f2e70]:
        - link "Contact Us" [ref=f2e71] [cursor=pointer]:
          - /url: contact.htm
    - paragraph [ref=f2e72]: © Parasoft. All rights reserved.
    - list [ref=f2e73]:
      - listitem [ref=f2e74]: "Visit us at:"
      - listitem [ref=f2e75]:
        - link "www.parasoft.com" [ref=f2e76] [cursor=pointer]:
          - /url: http://www.parasoft.com/
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
      |               ^ Error: [SEED] read account numbers from Accounts Overview: precondition could not be established — account numbers rendered (precondition)
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