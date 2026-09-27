# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-1\tests\tool-1.spec.ts >> TOOL-1 Catalogue search, sorting and category filter >> SCN-008: An empty search returns all products
- Location: evaluations\TOOL-1\tests\tool-1.spec.ts:160:3

# Error details

```
TimeoutError: apiRequestContext.fetch: Timeout 10000ms exceeded.
Call log:
  - → GET https://api.practicesoftwaretesting.com/products
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.12 Safari/537.36
    - accept: application/json
    - accept-encoding: gzip,deflate,br

```

# Test source

```ts
  229 |           ledger.push({ label, kind: 'auth', cleanup: 'none', reused: true, created: '(reused within this worker)' });
  230 |           return hit.value as T;
  231 |         }
  232 |         const value = await pre({ label, kind: 'auth', cleanup: 'none' }, make);
  233 |         onceCache.set(key, { value, at: Date.now() });
  234 |         return value;
  235 |       },
  236 |       until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts: { timeoutMs?: number; intervalMs?: number } = {}): Promise<T> {
  237 |         const { timeoutMs = 15_000, intervalMs = 500 } = opts;
  238 |         return pre({ label, kind: 'readiness', cleanup: 'none' }, async () => {
  239 |           const deadline = Date.now() + timeoutMs;
  240 |           let last: T;
  241 |           for (;;) {
  242 |             last = await probe();
  243 |             if (ready(last)) return last;
  244 |             if (Date.now() > deadline) throw new Error(`not ready after ${timeoutMs} ms (last value: ${JSON.stringify(redact(last)).slice(0, 200)})`);
  245 |             await new Promise((r) => setTimeout(r, intervalMs));
  246 |           }
  247 |         });
  248 |       },
  249 |       track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T {
  250 |         const rec: SeedRecord = { label: `${label} (created by the scenario)`, kind: 'scenario-created', created: redact(created) };
  251 |         ledger.push(rec);
  252 |         cleanups.push({ rec, run: () => cleanup(created) });
  253 |         return created;
  254 |       },
  255 |     });
  256 |     // Teardown: undo in reverse order; never fail the test because of cleanup. HELDOUT_KEEP_DATA=1 keeps data for debugging.
  257 |     for (const c of cleanups.reverse()) {
  258 |       if (process.env.HELDOUT_KEEP_DATA === '1') { c.rec.cleanup = 'skipped'; continue; }
  259 |       apiPhase = 'cleanup';
  260 |       try { await c.run(); c.rec.cleanup = 'done'; } catch (e) { c.rec.cleanup = 'failed'; c.rec.error = (e as Error).message.split('\n')[0]; } finally { apiPhase = 'test'; }
  261 |     }
  262 |     if (ledger.length) await testInfo.attach('seed-ledger', { body: JSON.stringify({ tag, records: ledger }, null, 2), contentType: 'application/json' });
  263 |   },
  264 | 
  265 |   data: async ({}, use, testInfo) => {
  266 |     // spec lives in evaluations/<KEY>/tests/**  →  evaluations/<KEY>/test-data.json
  267 |     let dir = path.dirname(testInfo.file);
  268 |     while (path.basename(dir) !== 'tests' && path.dirname(dir) !== dir) dir = path.dirname(dir);
  269 |     const file = path.join(path.dirname(dir), 'test-data.json');
  270 |     const raw = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Json) : {};
  271 |     await use(resolveEnv(raw) as TestData);
  272 |   },
  273 | 
  274 |   journey: async ({ page }, use, testInfo) => {
  275 |     const capture = process.env.HELDOUT_CAPTURE === '1';
  276 |     const runDir = process.env.HELDOUT_RUN_DIR;
  277 |     const scenario = scenarioIdOf(testInfo.title) ?? slug(testInfo.title);
  278 |     let n = 0;
  279 | 
  280 |     const snap = async (label: string) => {
  281 |       // API-only tests never navigate: skip empty snapshots.
  282 |       if (page.url() === 'about:blank') return;
  283 |       const raw = await page.locator('body').ariaSnapshot({ timeout: 3_000 })
  284 |         .catch((e: Error) => `# snapshot unavailable: ${e.message.split('\n')[0]}`);
  285 |       const yaml = redactSnapshot(raw, await page.$$eval('input[type="password"]', (els) => els.map((el) => (el as HTMLInputElement).value)).catch(() => []));
  286 |       const body = `# url: ${page.url()}\n# step: ${label}\n${yaml}\n`;
  287 |       const name = `${String(n).padStart(2, '0')}-${slug(label)}`;
  288 |       await testInfo.attach(`aria-snapshot ${name}`, { body, contentType: 'text/yaml' });
  289 |       if (runDir) {
  290 |         const file = path.join(runDir, 'snapshots', scenario, `retry${testInfo.retry}`, `${name}.yml`);
  291 |         fs.mkdirSync(path.dirname(file), { recursive: true });
  292 |         fs.writeFileSync(file, body);
  293 |       }
  294 |     };
  295 | 
  296 |     await use({
  297 |       step: <T>(title: string, body: () => Promise<T>) =>
  298 |         base.step(title, async () => {
  299 |           n++;
  300 |           try {
  301 |             const result = await body();
  302 |             if (capture) await snap(title);
  303 |             return result;
  304 |           } catch (err) {
  305 |             await snap(`FAILED ${title}`).catch(() => undefined);
  306 |             throw err;
  307 |           }
  308 |         }),
  309 |       capture: snap,
  310 |     });
  311 |   },
  312 | 
  313 |   apiContext: async ({}, use) => {
  314 |     const ctx = await pwRequest.newContext({ baseURL: process.env.AUT_API_BASE_URL ?? process.env.AUT_BASE_URL });
  315 |     await use(ctx);
  316 |     await ctx.dispose();
  317 |   },
  318 | 
  319 |   api: async ({ apiContext }, use, testInfo) => {
  320 |     let n = 0;
  321 |     const call = async <T,>(method: string, urlPath: string, o: ApiCallOptions = {}): Promise<ApiResponse<T>> => {
  322 |       const headers: Record<string, string> = { Accept: 'application/json', ...o.headers };
  323 |       if (o.cookies) headers.Cookie = Object.entries(o.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  324 |       const raw = typeof o.data === 'string';
  325 |       if (o.data !== undefined) headers['Content-Type'] ??= 'application/json';
  326 |       const formBody = o.form ? new URLSearchParams(Object.entries(o.form).map(([k, v]) => [k, String(v)])).toString() : undefined;
  327 |       if (formBody !== undefined) headers['Content-Type'] ??= 'application/x-www-form-urlencoded';
  328 |       const started = Date.now();
> 329 |       const res = await apiContext.fetch(urlPath, {
      |                                    ^ TimeoutError: apiRequestContext.fetch: Timeout 10000ms exceeded.
  330 |         method, headers, params: o.params,
  331 |         ...(o.data !== undefined ? { data: raw ? (o.data as string) : JSON.stringify(o.data) } : formBody !== undefined ? { data: formBody } : {}),
  332 |         failOnStatusCode: false,
  333 |       });
  334 |       const durationMs = Date.now() - started;
  335 |       const text = await res.text();
  336 |       let body: unknown = text;
  337 |       if (/json/i.test(res.headers()['content-type'] ?? '') || /^\s*[[{]/.test(text)) { try { body = JSON.parse(text); } catch { /* keep text */ } }
  338 |       const exchange = {
  339 |         request: { method, url: res.url(), headers: redactHeaders(headers), body: raw ? clip(o.data as string) : o.form ? redact(o.form) : redact(o.data) },
  340 |         response: { status: res.status(), durationMs, headers: redactHeaders(res.headers()), body: typeof body === 'string' ? clip(body) : redact(body) },
  341 |       };
  342 |       n++;
  343 |       // Name format: "api-exchange NN [seed|cleanup] METHOD /path → status" — triage excludes seed/cleanup from evidence.
  344 |       await testInfo.attach(`api-exchange ${String(n).padStart(2, '0')}${apiPhase === 'test' ? '' : ` [${apiPhase}]`} ${method} ${new URL(res.url()).pathname} → ${res.status()}`,
  345 |         { body: JSON.stringify(exchange, null, 2), contentType: 'application/json' });
  346 |       return { status: res.status(), ok: res.ok(), headers: res.headers(), body: body as T, text, durationMs, url: res.url() };
  347 |     };
  348 |     await use({
  349 |       call,
  350 |       get: (p, o) => call('GET', p, o),
  351 |       post: (p, o) => call('POST', p, o),
  352 |       put: (p, o) => call('PUT', p, o),
  353 |       patch: (p, o) => call('PATCH', p, o),
  354 |       delete: (p, o) => call('DELETE', p, o),
  355 |     });
  356 |   },
  357 | });
  358 | 
  359 | export { expect };
  360 | 
```