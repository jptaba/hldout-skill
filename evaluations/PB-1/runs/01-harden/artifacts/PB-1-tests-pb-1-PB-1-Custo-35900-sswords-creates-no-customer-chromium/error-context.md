# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-003: A registration rejected for mismatched passwords creates no customer
- Location: evaluations\PB-1\tests\pb-1.spec.ts:202:3

# Error details

```
Error: apiRequestContext.fetch: getaddrinfo ENOTFOUND parabank.parasoft.com
Call log:
  - → GET https://parabank.parasoft.com/parabank/services/bank/login/pb1hxeaai7201tm3/***redacted***
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.12 Safari/537.36
    - accept: application/json
    - accept-encoding: gzip,deflate,br

```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - generic [ref=f1e2]:
    - generic [ref=f1e3]:
      - link:
        - /url: admin.htm
        - img [ref=f1e4] [cursor=pointer]
      - link "ParaBank":
        - /url: index.htm
        - img "ParaBank" [ref=f1e5] [cursor=pointer]
      - paragraph [ref=f1e6]: Experience the difference
    - generic [ref=f1e7]:
      - list [ref=f1e8]:
        - listitem [ref=f1e9]: Solutions
        - listitem [ref=f1e10]:
          - link "About Us" [ref=f1e11] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f1e12]:
          - link "Services" [ref=f1e13] [cursor=pointer]:
            - /url: services.htm
        - listitem [ref=f1e14]:
          - link "Products" [ref=f1e15] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/products.jsp
        - listitem [ref=f1e16]:
          - link "Locations" [ref=f1e17] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - listitem [ref=f1e18]:
          - link "Admin Page" [ref=f1e19] [cursor=pointer]:
            - /url: admin.htm
      - list [ref=f1e20]:
        - listitem [ref=f1e21]:
          - link "home" [ref=f1e22] [cursor=pointer]:
            - /url: index.htm
        - listitem [ref=f1e23]:
          - link "about" [ref=f1e24] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f1e25]:
          - link "contact" [ref=f1e26] [cursor=pointer]:
            - /url: contact.htm
    - generic [ref=f1e27]:
      - generic [ref=f1e28]:
        - heading "Customer Login" [level=2] [ref=f1e29]
        - generic [ref=f1e30]:
          - generic [ref=f1e31]:
            - paragraph [ref=f1e32]: Username
            - textbox [active] [ref=f1e34]
            - paragraph [ref=f1e35]: Password
            - textbox [ref=f1e37]
            - button "Log In" [ref=f1e39] [cursor=pointer]
          - paragraph [ref=f1e40]:
            - link "Forgot login info?" [ref=f1e41] [cursor=pointer]:
              - /url: lookup.htm
          - paragraph [ref=f1e42]:
            - link "Register" [ref=f1e43] [cursor=pointer]:
              - /url: register.htm
      - generic [ref=f1e44]:
        - heading "Signing up is easy!" [level=1] [ref=f1e45]
        - paragraph [ref=f1e46]: If you have an account with us you can sign-up for free instant online access. You will have to provide some personal information.
        - table [ref=f1e48]:
          - rowgroup [ref=f1e49]:
            - row [ref=f1e50]:
              - cell "First Name:" [ref=f1e51]
              - cell [ref=f1e52]:
                - textbox [ref=f1e53]: Hana
              - cell [ref=f1e54]
            - row [ref=f1e55]:
              - cell "Last Name:" [ref=f1e56]
              - cell [ref=f1e57]:
                - textbox [ref=f1e58]: Heldouti720
              - cell [ref=f1e59]
            - row [ref=f1e60]:
              - cell "Address:" [ref=f1e61]
              - cell [ref=f1e62]:
                - textbox [ref=f1e63]: 12 Heldout Lane
              - cell [ref=f1e64]
            - row [ref=f1e65]:
              - cell "City:" [ref=f1e66]
              - cell [ref=f1e67]:
                - textbox [ref=f1e68]: Testville
              - cell [ref=f1e69]
            - row [ref=f1e70]:
              - cell "State:" [ref=f1e71]
              - cell [ref=f1e72]:
                - textbox [ref=f1e73]: CA
              - cell [ref=f1e74]
            - row [ref=f1e75]:
              - cell "Zip Code:" [ref=f1e76]
              - cell [ref=f1e77]:
                - textbox [ref=f1e78]: "94016"
              - cell [ref=f1e79]
            - row [ref=f1e80]:
              - 'cell "Phone #:" [ref=f1e81]'
              - cell [ref=f1e82]:
                - textbox [ref=f1e83]: "5551234567"
              - cell [ref=f1e84]
            - row [ref=f1e85]:
              - cell "SSN:" [ref=f1e86]
              - cell [ref=f1e87]:
                - textbox [ref=f1e88]: 123-45-6789
              - cell [ref=f1e89]
            - row [ref=f1e90]:
              - cell [ref=f1e91]
            - row [ref=f1e92]:
              - cell "Username:" [ref=f1e93]
              - cell [ref=f1e94]:
                - textbox [ref=f1e95]: pb1hxeaai7201tm3
              - cell [ref=f1e96]
            - row [ref=f1e97]:
              - cell "Password:" [ref=f1e98]
              - cell [ref=f1e99]:
                - textbox [ref=f1e100]
              - cell [ref=f1e101]
            - row [ref=f1e102]:
              - cell "Confirm:" [ref=f1e103]
              - cell [ref=f1e104]:
                - textbox [ref=f1e105]
              - cell "Passwords did not match." [ref=f1e106]
            - row [ref=f1e107]:
              - cell [ref=f1e108]
              - cell [ref=f1e109]:
                - button "Register" [ref=f1e110] [cursor=pointer]
  - generic [ref=f1e112]:
    - list [ref=f1e113]:
      - listitem [ref=f1e114]:
        - link "Home" [ref=f1e115] [cursor=pointer]:
          - /url: index.htm
        - text: "|"
      - listitem [ref=f1e116]:
        - link "About Us" [ref=f1e117] [cursor=pointer]:
          - /url: about.htm
        - text: "|"
      - listitem [ref=f1e118]:
        - link "Services" [ref=f1e119] [cursor=pointer]:
          - /url: services.htm
        - text: "|"
      - listitem [ref=f1e120]:
        - link "Products" [ref=f1e121] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/products.jsp
        - text: "|"
      - listitem [ref=f1e122]:
        - link "Locations" [ref=f1e123] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - text: "|"
      - listitem [ref=f1e124]:
        - link "Forum" [ref=f1e125] [cursor=pointer]:
          - /url: http://forums.parasoft.com/
        - text: "|"
      - listitem [ref=f1e126]:
        - link "Site Map" [ref=f1e127] [cursor=pointer]:
          - /url: sitemap.htm
        - text: "|"
      - listitem [ref=f1e128]:
        - link "Contact Us" [ref=f1e129] [cursor=pointer]:
          - /url: contact.htm
    - paragraph [ref=f1e130]: © Parasoft. All rights reserved.
    - list [ref=f1e131]:
      - listitem [ref=f1e132]: "Visit us at:"
      - listitem [ref=f1e133]:
        - link "www.parasoft.com" [ref=f1e134] [cursor=pointer]:
          - /url: http://www.parasoft.com/
```

# Test source

```ts
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
  330 |   apiContext: async ({}, use) => {
  331 |     const ctx = await pwRequest.newContext({ baseURL: process.env.AUT_API_BASE_URL ?? process.env.AUT_BASE_URL });
  332 |     await use(ctx);
  333 |     await ctx.dispose();
  334 |   },
  335 | 
  336 |   api: async ({ apiContext }, use, testInfo) => {
  337 |     let n = 0;
  338 |     const call = async <T,>(method: string, urlPath: string, o: ApiCallOptions = {}): Promise<ApiResponse<T>> => {
  339 |       const headers: Record<string, string> = { Accept: 'application/json', ...o.headers };
  340 |       if (o.cookies) headers.Cookie = Object.entries(o.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  341 |       const raw = typeof o.data === 'string';
  342 |       if (o.data !== undefined) headers['Content-Type'] ??= 'application/json';
  343 |       const formBody = o.form ? new URLSearchParams(Object.entries(o.form).map(([k, v]) => [k, String(v)])).toString() : undefined;
  344 |       if (formBody !== undefined) headers['Content-Type'] ??= 'application/x-www-form-urlencoded';
  345 |       const started = Date.now();
> 346 |       const res = await apiContext.fetch(autUrl(process.env.AUT_API_BASE_URL ?? process.env.AUT_BASE_URL, urlPath), {
      |                                    ^ Error: apiRequestContext.fetch: getaddrinfo ENOTFOUND parabank.parasoft.com
  347 |         method, headers, params: o.params,
  348 |         ...(o.data !== undefined ? { data: raw ? (o.data as string) : JSON.stringify(o.data) } : formBody !== undefined ? { data: formBody } : {}),
  349 |         failOnStatusCode: false,
  350 |       });
  351 |       const durationMs = Date.now() - started;
  352 |       const text = await res.text();
  353 |       let body: unknown = text;
  354 |       if (/json/i.test(res.headers()['content-type'] ?? '') || /^\s*[[{]/.test(text)) { try { body = JSON.parse(text); } catch { /* keep text */ } }
  355 |       const exchange = {
  356 |         request: { method, url: res.url(), headers: redactHeaders(headers), body: raw ? clip(o.data as string) : o.form ? redact(o.form) : redact(o.data) },
  357 |         response: { status: res.status(), durationMs, headers: redactHeaders(res.headers()), body: typeof body === 'string' ? clip(body) : redact(body) },
  358 |       };
  359 |       n++;
  360 |       // Name format: "api-exchange NN [seed|cleanup] METHOD /path → status" — triage excludes seed/cleanup from evidence.
  361 |       await testInfo.attach(`api-exchange ${String(n).padStart(2, '0')}${apiPhase === 'test' ? '' : ` [${apiPhase}]`} ${method} ${new URL(res.url()).pathname} → ${res.status()}`,
  362 |         { body: JSON.stringify(exchange, null, 2), contentType: 'application/json' });
  363 |       return { status: res.status(), ok: res.ok(), headers: res.headers(), body: body as T, text, durationMs, url: res.url() };
  364 |     };
  365 |     await use({
  366 |       call,
  367 |       get: (p, o) => call('GET', p, o),
  368 |       post: (p, o) => call('POST', p, o),
  369 |       put: (p, o) => call('PUT', p, o),
  370 |       patch: (p, o) => call('PATCH', p, o),
  371 |       delete: (p, o) => call('DELETE', p, o),
  372 |     });
  373 |   },
  374 | });
  375 | 
  376 | export { expect };
  377 | 
```