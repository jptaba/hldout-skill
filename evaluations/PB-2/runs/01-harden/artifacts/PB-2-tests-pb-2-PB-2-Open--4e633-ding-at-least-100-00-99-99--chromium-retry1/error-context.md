# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-2\tests\pb-2.spec.ts >> PB-2 Open a new CHECKING or SAVINGS account online >> SCN-009.2: The service opens an account only from a funding account holding at least 100.00 (99.99)
- Location: evaluations\PB-2\tests\pb-2.spec.ts:376:5

# Error details

```
Error: [SEED] second account holding exactly 99.99: precondition could not be established — read account 22002 (precondition)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 429
```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - generic [ref=f3e2]:
    - generic [ref=f3e3]:
      - link:
        - /url: admin.htm
        - img [ref=f3e4] [cursor=pointer]
      - link "ParaBank":
        - /url: index.htm
        - img "ParaBank" [ref=f3e5] [cursor=pointer]
      - paragraph [ref=f3e6]: Experience the difference
    - generic [ref=f3e7]:
      - list [ref=f3e8]:
        - listitem [ref=f3e9]: Solutions
        - listitem [ref=f3e10]:
          - link "About Us" [ref=f3e11] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f3e12]:
          - link "Services" [ref=f3e13] [cursor=pointer]:
            - /url: services.htm
        - listitem [ref=f3e14]:
          - link "Products" [ref=f3e15] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/products.jsp
        - listitem [ref=f3e16]:
          - link "Locations" [ref=f3e17] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - listitem [ref=f3e18]:
          - link "Admin Page" [ref=f3e19] [cursor=pointer]:
            - /url: admin.htm
      - list [ref=f3e20]:
        - listitem [ref=f3e21]:
          - link "home" [ref=f3e22] [cursor=pointer]:
            - /url: index.htm
        - listitem [ref=f3e23]:
          - link "about" [ref=f3e24] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f3e25]:
          - link "contact" [ref=f3e26] [cursor=pointer]:
            - /url: contact.htm
    - generic [ref=f3e27]:
      - generic [ref=f3e28]:
        - paragraph [ref=f3e29]: Welcome Heldout Tester
        - heading "Account Services" [level=2] [ref=f3e30]
        - list [ref=f3e31]:
          - listitem [ref=f3e32]:
            - link "Open New Account" [ref=f3e33] [cursor=pointer]:
              - /url: openaccount.htm
          - listitem [ref=f3e34]:
            - link "Accounts Overview" [ref=f3e35] [cursor=pointer]:
              - /url: overview.htm
          - listitem [ref=f3e36]:
            - link "Transfer Funds" [ref=f3e37] [cursor=pointer]:
              - /url: transfer.htm
          - listitem [ref=f3e38]:
            - link "Bill Pay" [ref=f3e39] [cursor=pointer]:
              - /url: billpay.htm
          - listitem [ref=f3e40]:
            - link "Find Transactions" [ref=f3e41] [cursor=pointer]:
              - /url: findtrans.htm
          - listitem [ref=f3e42]:
            - link "Update Contact Info" [ref=f3e43] [cursor=pointer]:
              - /url: updateprofile.htm
          - listitem [ref=f3e44]:
            - link "Request Loan" [ref=f3e45] [cursor=pointer]:
              - /url: requestloan.htm
          - listitem [ref=f3e46]:
            - link "Log Out" [ref=f3e47] [cursor=pointer]:
              - /url: logout.htm
      - generic [ref=f3e50]:
        - heading "Accounts Overview" [level=1] [ref=f3e51]
        - table [ref=f3e52]:
          - rowgroup [ref=f3e53]:
            - row [ref=f3e54]:
              - columnheader "Account" [ref=f3e55]
              - columnheader "Balance*" [ref=f3e56]
              - columnheader "Available Amount" [ref=f3e57]
          - rowgroup [ref=f3e58]:
            - row [ref=f3e59]:
              - cell [ref=f3e60]:
                - link "21891" [ref=f3e61] [cursor=pointer]:
                  - /url: activity.htm?id=21891
              - cell "$515.50" [ref=f3e62]
              - cell "$515.50" [ref=f3e63]
            - row [ref=f3e64]:
              - cell "Total" [ref=f3e65]
              - cell "$515.50" [ref=f3e66]
              - cell [ref=f3e67]
          - rowgroup [ref=f3e68]:
            - row [ref=f3e69]:
              - cell "*Balance includes deposits that may be subject to holds" [ref=f3e70]
  - generic [ref=f3e72]:
    - list [ref=f3e73]:
      - listitem [ref=f3e74]:
        - link "Home" [ref=f3e75] [cursor=pointer]:
          - /url: index.htm
        - text: "|"
      - listitem [ref=f3e76]:
        - link "About Us" [ref=f3e77] [cursor=pointer]:
          - /url: about.htm
        - text: "|"
      - listitem [ref=f3e78]:
        - link "Services" [ref=f3e79] [cursor=pointer]:
          - /url: services.htm
        - text: "|"
      - listitem [ref=f3e80]:
        - link "Products" [ref=f3e81] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/products.jsp
        - text: "|"
      - listitem [ref=f3e82]:
        - link "Locations" [ref=f3e83] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - text: "|"
      - listitem [ref=f3e84]:
        - link "Forum" [ref=f3e85] [cursor=pointer]:
          - /url: http://forums.parasoft.com/
        - text: "|"
      - listitem [ref=f3e86]:
        - link "Site Map" [ref=f3e87] [cursor=pointer]:
          - /url: sitemap.htm
        - text: "|"
      - listitem [ref=f3e88]:
        - link "Contact Us" [ref=f3e89] [cursor=pointer]:
          - /url: contact.htm
    - paragraph [ref=f3e90]: © Parasoft. All rights reserved.
    - list [ref=f3e91]:
      - listitem [ref=f3e92]: "Visit us at:"
      - listitem [ref=f3e93]:
        - link "www.parasoft.com" [ref=f3e94] [cursor=pointer]:
          - /url: http://www.parasoft.com/
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
      |               ^ Error: [SEED] second account holding exactly 99.99: precondition could not be established — read account 22002 (precondition)
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