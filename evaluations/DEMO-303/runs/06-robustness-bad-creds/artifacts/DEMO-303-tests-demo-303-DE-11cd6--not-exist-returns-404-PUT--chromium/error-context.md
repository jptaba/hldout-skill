# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-303\tests\demo-303.spec.ts >> DEMO-303 Partner booking API >> SCN-014.1: Writing to a booking that does not exist returns 404 (PUT)
- Location: evaluations\DEMO-303\tests\demo-303.spec.ts:236:5

# Error details

```
Error: [SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  101 |  * Every method runs its calls in the `[seed]` phase (kept out of requirement evidence, shown in the verdict
  102 |  * as "preconditions via the API"), records a ledger entry, and turns any failure into `[SEED] <label>: …`,
  103 |  * which triage reports as BLOCKED (scenario not evaluated), never as the AC failing.
  104 |  */
  105 | export interface Seed {
  106 |   /** Short tag unique to this test run; prefix seeded names with it so leftovers are identifiable/sweepable. */
  107 |   readonly tag: string;
  108 |   /** Data prerequisite (may be a chain of calls, e.g. create → confirm → pay). `cleanup` runs after the test, reverse order. */
  109 |   create<T>(label: string, make: () => Promise<T>, cleanup?: (created: T) => Promise<unknown>): Promise<T>;
  110 |   /** Non-data pre-step: lookups/discovery (find an id), protocol values (ETag, CSRF), state checks. No cleanup. */
  111 |   step<T>(label: string, run: () => Promise<T>): Promise<T>;
  112 |   /**
  113 |    * Auth or other reusable context acquired once per worker and reused while fresh (default 10 min), e.g. a staff
  114 |    * token. Use only for values that are safe to share between tests and are not the subject of the scenario.
  115 |    */
  116 |   once<T>(key: string, label: string, make: () => Promise<T>, ttlMs?: number): Promise<T>;
  117 |   /** Readiness / eventual consistency: poll `probe` until `ready(value)` holds or the timeout expires (→ BLOCKED). */
  118 |   until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts?: { timeoutMs?: number; intervalMs?: number }): Promise<T>;
  119 |   /** Register cleanup for data the scenario itself created in a When-step (e.g. the record under test). */
  120 |   track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T;
  121 | }
  122 | 
  123 | /** Worker-scoped cache for seed.once (one worker runs one test at a time). */
  124 | const onceCache = new Map<string, { value: unknown; at: number }>();
  125 | 
  126 | /**
  127 |  * Robust entry-point navigation: wait for DOMContentLoaded, then let 'load' settle for at most
  128 |  * `settleMs` without failing (third-party assets can keep 'load' pending forever).
  129 |  */
  130 | export async function gotoPage(page: import('@playwright/test').Page, path: string, settleMs = 10_000): Promise<void> {
  131 |   await page.goto(path, { waitUntil: 'domcontentloaded' });
  132 |   await page.waitForLoadState('load', { timeout: settleMs }).catch(() => undefined);
  133 | }
  134 | 
  135 | export type ShapeRule ='string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'string[]' | ((v: unknown) => boolean | string);
  136 | 
  137 | /**
  138 |  * Schema check for API bodies. Returns human-readable violations (empty = conforms), so a
  139 |  * requirement assertion reads `expect(checkShape(room, ROOM), '[REQ AC-n] Room schema').toEqual([])`
  140 |  * and a failure lists exactly which fields broke the contract.
  141 |  */
  142 | export function checkShape(value: unknown, schema: Record<string, ShapeRule>, label = 'value'): string[] {
  143 |   if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${label} is not an object`];
  144 |   const obj = value as Record<string, unknown>;
  145 |   const out: string[] = [];
  146 |   for (const [key, rule] of Object.entries(schema)) {
  147 |     const v = obj[key];
  148 |     const where = `${label}.${key}`;
  149 |     if (v === undefined) { out.push(`${where} is missing`); continue; }
  150 |     if (typeof rule === 'function') {
  151 |       const r = rule(v);
  152 |       if (r !== true) out.push(typeof r === 'string' ? `${where} ${r}` : `${where} is invalid (${JSON.stringify(v)})`);
  153 |       continue;
  154 |     }
  155 |     const ok = rule === 'integer' ? Number.isInteger(v)
  156 |       : rule === 'array' ? Array.isArray(v)
  157 |       : rule === 'string[]' ? Array.isArray(v) && v.every((x) => typeof x === 'string')
  158 |       : rule === 'object' ? typeof v === 'object' && v !== null && !Array.isArray(v)
  159 |       : typeof v === rule;
  160 |     if (!ok) out.push(`${where} should be ${rule} but is ${JSON.stringify(v)}`);
  161 |   }
  162 |   return out;
  163 | }
  164 | 
  165 | const SECRET_KEY = /pass(word)?|token|secret|api[-_]?key|authorization|cookie|session/i;
  166 | // Header NAMES that carry credentials (incl. misspellings like "Authorisation") and VALUES that look like credentials.
  167 | const SECRET_HEADER = /auth|cookie|token|secret|api[-_]?key|session|password|credential/i;
  168 | const SECRET_VALUE = /^\s*(basic|bearer|digest|token)\s+\S+/i;
  169 | 
  170 | /** Redact secrets from headers / JSON bodies before they are attached to reports. */
  171 | export function redact(value: unknown, depth = 0): unknown {
  172 |   if (depth > 8 || value == null) return value;
  173 |   if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  174 |   if (typeof value === 'object') {
  175 |     return Object.fromEntries(Object.entries(value as Record<string, unknown>)
  176 |       .map(([k, v]) => [k, SECRET_KEY.test(k) && typeof v !== 'object' ? 'password' : redact(v, depth + 1)]));
  177 |   }
  178 |   return value;
  179 | }
  180 | const redactHeaders = (h: Record<string, string>) =>
  181 |   Object.fromEntries(Object.entries(h).map(([k, v]) => [k, SECRET_HEADER.test(k) || SECRET_VALUE.test(String(v)) ? 'password' : v]));
  182 | const clip = (s: string, n = 4000) => (s.length > n ? `${s.slice(0, n)}… (${s.length - n} more chars)` : s);
  183 | 
  184 | export const test = base.extend<{ data: TestData; journey: Journey; api: Api; apiContext: APIRequestContext; seed: Seed }>({
  185 |   // Depends on `api` so the API client (used by cleanups) is torn down only after the seed teardown ran.
  186 |   seed: async ({ api }, use, testInfo) => {
  187 |     void api;
  188 |     const ledger: SeedRecord[] = [];
  189 |     const cleanups: { rec: SeedRecord; run: () => Promise<unknown> }[] = [];
  190 |     const tag = `hx${Date.now().toString(36).slice(-5)}${testInfo.workerIndex}${testInfo.repeatEachIndex}`;
  191 |     /** Run a precondition in the [seed] phase with ledger + BLOCKED semantics. */
  192 |     const pre = async <T,>(rec: SeedRecord, run: () => Promise<T>): Promise<T> => {
  193 |       ledger.push(rec);
  194 |       try {
  195 |         apiPhase = 'seed';
  196 |         const value = await base.step(`[SEED] ${rec.label}`, run).finally(() => { apiPhase = 'test'; });
  197 |         rec.created = redact(value);
  198 |         return value;
  199 |       } catch (err) {
  200 |         rec.error = (err as Error).message.split('\n')[0];
> 201 |         throw new Error(`[SEED] ${rec.label}: precondition could not be established — ${(err as Error).message}`);
      |               ^ Error: [SEED] booking id that no longer exists: precondition could not be established — delete booking (seed)
  202 |       }
  203 |     };
  204 |     await use({
  205 |       tag,
  206 |       async create<T>(label: string, make: () => Promise<T>, cleanup?: (created: T) => Promise<unknown>): Promise<T> {
  207 |         const rec: SeedRecord = { label, kind: 'data', cleanup: cleanup ? undefined : 'none' };
  208 |         const created = await pre(rec, make);
  209 |         if (cleanup) cleanups.push({ rec, run: () => cleanup(created) });
  210 |         return created;
  211 |       },
  212 |       step<T>(label: string, run: () => Promise<T>): Promise<T> {
  213 |         return pre({ label, kind: 'pre-step', cleanup: 'none' }, run);
  214 |       },
  215 |       async once<T>(key: string, label: string, make: () => Promise<T>, ttlMs = 10 * 60_000): Promise<T> {
  216 |         const hit = onceCache.get(key);
  217 |         if (hit && Date.now() - hit.at < ttlMs) {
  218 |           ledger.push({ label, kind: 'auth', cleanup: 'none', reused: true, created: '(reused within this worker)' });
  219 |           return hit.value as T;
  220 |         }
  221 |         const value = await pre({ label, kind: 'auth', cleanup: 'none' }, make);
  222 |         onceCache.set(key, { value, at: Date.now() });
  223 |         return value;
  224 |       },
  225 |       until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts: { timeoutMs?: number; intervalMs?: number } = {}): Promise<T> {
  226 |         const { timeoutMs = 15_000, intervalMs = 500 } = opts;
  227 |         return pre({ label, kind: 'readiness', cleanup: 'none' }, async () => {
  228 |           const deadline = Date.now() + timeoutMs;
  229 |           let last: T;
  230 |           for (;;) {
  231 |             last = await probe();
  232 |             if (ready(last)) return last;
  233 |             if (Date.now() > deadline) throw new Error(`not ready after ${timeoutMs} ms (last value: ${JSON.stringify(redact(last)).slice(0, 200)})`);
  234 |             await new Promise((r) => setTimeout(r, intervalMs));
  235 |           }
  236 |         });
  237 |       },
  238 |       track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T {
  239 |         const rec: SeedRecord = { label: `${label} (created by the scenario)`, kind: 'scenario-created', created: redact(created) };
  240 |         ledger.push(rec);
  241 |         cleanups.push({ rec, run: () => cleanup(created) });
  242 |         return created;
  243 |       },
  244 |     });
  245 |     // Teardown: undo in reverse order; never fail the test because of cleanup. HELDOUT_KEEP_DATA=1 keeps data for debugging.
  246 |     for (const c of cleanups.reverse()) {
  247 |       if (process.env.HELDOUT_KEEP_DATA === '1') { c.rec.cleanup = 'skipped'; continue; }
  248 |       apiPhase = 'cleanup';
  249 |       try { await c.run(); c.rec.cleanup = 'done'; } catch (e) { c.rec.cleanup = 'failed'; c.rec.error = (e as Error).message.split('\n')[0]; } finally { apiPhase = 'test'; }
  250 |     }
  251 |     if (ledger.length) await testInfo.attach('seed-ledger', { body: JSON.stringify({ tag, records: ledger }, null, 2), contentType: 'application/json' });
  252 |   },
  253 | 
  254 |   data: async ({}, use, testInfo) => {
  255 |     // spec lives in evaluations/<KEY>/tests/**  →  evaluations/<KEY>/test-data.json
  256 |     let dir = path.dirname(testInfo.file);
  257 |     while (path.basename(dir) !== 'tests' && path.dirname(dir) !== dir) dir = path.dirname(dir);
  258 |     const file = path.join(path.dirname(dir), 'test-data.json');
  259 |     const raw = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Json) : {};
  260 |     await use(resolveEnv(raw) as TestData);
  261 |   },
  262 | 
  263 |   journey: async ({ page }, use, testInfo) => {
  264 |     const capture = process.env.HELDOUT_CAPTURE === '1';
  265 |     const runDir = process.env.HELDOUT_RUN_DIR;
  266 |     const scenario = scenarioIdOf(testInfo.title) ?? slug(testInfo.title);
  267 |     let n = 0;
  268 | 
  269 |     const snap = async (label: string) => {
  270 |       // API-only tests never navigate: skip empty snapshots.
  271 |       if (page.url() === 'about:blank') return;
  272 |       const yaml = await page.locator('body').ariaSnapshot({ timeout: 3_000 })
  273 |         .catch((e: Error) => `# snapshot unavailable: ${e.message.split('\n')[0]}`);
  274 |       const body = `# url: ${page.url()}\n# step: ${label}\n${yaml}\n`;
  275 |       const name = `${String(n).padStart(2, '0')}-${slug(label)}`;
  276 |       await testInfo.attach(`aria-snapshot ${name}`, { body, contentType: 'text/yaml' });
  277 |       if (runDir) {
  278 |         const file = path.join(runDir, 'snapshots', scenario, `retry${testInfo.retry}`, `${name}.yml`);
  279 |         fs.mkdirSync(path.dirname(file), { recursive: true });
  280 |         fs.writeFileSync(file, body);
  281 |       }
  282 |     };
  283 | 
  284 |     await use({
  285 |       step: <T>(title: string, body: () => Promise<T>) =>
  286 |         base.step(title, async () => {
  287 |           n++;
  288 |           try {
  289 |             const result = await body();
  290 |             if (capture) await snap(title);
  291 |             return result;
  292 |           } catch (err) {
  293 |             await snap(`FAILED ${title}`).catch(() => undefined);
  294 |             throw err;
  295 |           }
  296 |         }),
  297 |       capture: snap,
  298 |     });
  299 |   },
  300 | 
  301 |   apiContext: async ({}, use) => {
```