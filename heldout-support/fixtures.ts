/**
 * Held-out test fixtures (scaffolded by the heldout-evaluator skill — AUT-agnostic).
 *
 *  - `data`    : evaluations/<KEY>/test-data.json, with ${env:NAME} placeholders resolved (keep secrets in .env).
 *  - `journey` : wraps each Gherkin line in a test.step(). Captures an ARIA snapshot of the page
 *                after every step when HELDOUT_CAPTURE=1 (hardening tier 3) and always on step failure
 *                (triage evidence). Snapshots land in <run dir>/snapshots/<SCN-ID>/.
 *  - `api`     : HTTP client bound to the AUT's API origin (AUT_API_BASE_URL). Every exchange is
 *                attached to the report as `api-exchange NN …` (secrets redacted) — triage and the
 *                verdict use it as evidence.
 *  - `unique()`: collision-free values for shared/sandbox AUTs.
 *
 * Assertion convention: every assertion that encodes a requirement carries a message tagged
 * `[REQ AC-n] ...` — triage uses the tag to separate application behaviour from script mechanics.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test as base, expect, request as pwRequest, type APIRequestContext } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TestData = Record<string, any>;
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export interface Journey {
  /** One Gherkin line == one step. Title should be the Gherkin text verbatim. */
  step<T>(title: string, body: () => Promise<T>): Promise<T>;
  /** Manually capture an ARIA snapshot (attached to the report). */
  capture(label: string): Promise<void>;
}

export interface ApiCallOptions {
  /** JSON-serialisable body (sent as application/json) or a raw string (sent as-is, e.g. malformed JSON). */
  data?: unknown;
  /** Form fields sent as application/x-www-form-urlencoded (APIs that do not take JSON). */
  form?: Record<string, string | number | boolean>;
  /** null drops a header the fixture would send (e.g. { Accept: null } for "a request without Accept"). */
  headers?: Record<string, string | null>;
  params?: Record<string, string | number | boolean>;
  /** Cookie header shortcut, e.g. { token: '…' }. */
  cookies?: Record<string, string>;
  /** Redirects are followed by default; 0 returns the 3xx itself (to assert a redirect's status and Location). */
  maxRedirects?: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  /** Parsed JSON when the response is JSON, otherwise the raw text. */
  body: T;
  text: string;
  durationMs: number;
  url: string;
}

export interface Api {
  call<T = unknown>(method: string, urlPath: string, options?: ApiCallOptions): Promise<ApiResponse<T>>;
  get<T = unknown>(urlPath: string, options?: ApiCallOptions): Promise<ApiResponse<T>>;
  post<T = unknown>(urlPath: string, options?: ApiCallOptions): Promise<ApiResponse<T>>;
  put<T = unknown>(urlPath: string, options?: ApiCallOptions): Promise<ApiResponse<T>>;
  patch<T = unknown>(urlPath: string, options?: ApiCallOptions): Promise<ApiResponse<T>>;
  delete<T = unknown>(urlPath: string, options?: ApiCallOptions): Promise<ApiResponse<T>>;
}

function resolveEnv(value: Json): Json {
  if (typeof value === 'string') {
    return value.replace(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name: string) => {
      const v = process.env[name];
      if (v === undefined) throw new Error(`test-data.json references \${env:${name}} but it is not set (.env)`);
      return v;
    });
  }
  if (Array.isArray(value)) return value.map(resolveEnv);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveEnv(v)]));
  return value;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

/** Scenario id from a test title: "SCN-006.3: …" → "SCN-006.3". */
export const scenarioIdOf = (title: string) => title.match(/^(SCN-\d+(?:\.\d+)?)/)?.[1];

/**
 * Which phase API calls belong to. Seed/cleanup calls are tagged so triage keeps them out of the
 * evidence for the requirement under test (one test runs at a time per worker, so a module-level flag is safe).
 */
let apiPhase: 'test' | 'seed' | 'cleanup' = 'test';

let uniqueCounter = 0;
/** Collision-free value for shared AUTs: unique('Guest') → "Guest k3x9q2-1". */
export function unique(prefix = 'heldout'): string {
  uniqueCounter += 1;
  return `${prefix} ${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 4)}-${uniqueCounter}`;
}
/** unique() without spaces, for e-mails, user names and slugs: uniqueId('qa') → "qa-k3x9q2-1". Keep prefixes short where the AUT limits length. */
export const uniqueId = (prefix = 'qa'): string => unique(prefix).replace(/\s+/g, '-');

// ---- data seeding -------------------------------------------------------------------------------

export interface SeedRecord {
  label: string;
  kind: 'data' | 'pre-step' | 'auth' | 'readiness' | 'scenario-created';
  created?: unknown; cleanup?: 'done' | 'skipped' | 'failed' | 'none'; reused?: boolean; error?: string;
}

/**
 * Preconditions ("Given …") — everything that must happen before the action under test.
 * Every method runs its calls in the `[seed]` phase (kept out of requirement evidence, shown in the verdict
 * as "preconditions via the API"), records a ledger entry, and turns any failure into `[SEED] <label>: …`,
 * which triage reports as BLOCKED (scenario not evaluated), never as the AC failing.
 */
export interface Seed {
  /** Short tag unique to this test run; prefix seeded names with it so leftovers are identifiable/sweepable. */
  readonly tag: string;
  /** Data prerequisite (may be a chain of calls, e.g. create → confirm → pay). `cleanup` runs after the test, reverse order. */
  create<T>(label: string, make: () => Promise<T>, cleanup?: (created: T) => Promise<unknown>): Promise<T>;
  /** Non-data pre-step: lookups/discovery (find an id), protocol values (ETag, CSRF), state checks. No cleanup. */
  step<T>(label: string, run: () => Promise<T>): Promise<T>;
  /**
   * Auth or other reusable context acquired once per worker and reused while fresh (default 10 min), e.g. a staff
   * token. Use only for values that are safe to share between tests and are not the subject of the scenario.
   */
  once<T>(key: string, label: string, make: () => Promise<T>, ttlMs?: number): Promise<T>;
  /** Readiness / eventual consistency: poll `probe` until `ready(value)` holds or the timeout expires (→ BLOCKED). */
  until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts?: { timeoutMs?: number; intervalMs?: number }): Promise<T>;
  /** Register cleanup for data the scenario itself created in a When-step (e.g. the record under test). */
  track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T;
}

/** Worker-scoped cache for seed.once (one worker runs one test at a time). */
const onceCache = new Map<string, { value: unknown; at: number }>();

/**
 * A path in a test is relative to the AUT profile's URL, including any path prefix: with baseURL
 * https://host/app/, '/login' is https://host/app/login (plain Playwright would go to https://host/login).
 * Full URLs pass through unchanged. `page.goto`, `gotoPage` and the `api` client all resolve paths this way.
 */
export function autUrl(base: string | undefined, target: string): string {
  if (!base || /^[a-z][a-z0-9+.-]*:/i.test(target)) return target;
  return new URL(target.replace(/^\/+/, ''), base.endsWith('/') ? base : `${base}/`).toString();
}

/** Abort requests to the profile's blockHosts (ads, analytics, consent banners): they are not the AUT and inject content. */
export async function blockThirdParty(context: import('@playwright/test').BrowserContext, hosts = ''): Promise<void> {
  const list = hosts.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
  if (!list.length) return;
  await context.route((url) => list.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)), (route) => route.abort());
}

/**
 * Robust entry-point navigation: wait for DOMContentLoaded, then let 'load' settle for at most
 * `settleMs` without failing (third-party assets can keep 'load' pending forever).
 */
export async function gotoPage(page: import('@playwright/test').Page, path: string, settleMs = 10_000): Promise<void> {
  await page.goto(autUrl(process.env.AUT_BASE_URL, path), { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load', { timeout: settleMs }).catch(() => undefined);
}

export type ShapeRule ='string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'string[]' | ((v: unknown) => boolean | string);

/**
 * Schema check for API bodies. Returns human-readable violations (empty = conforms), so a
 * requirement assertion reads `expect(checkShape(room, ROOM), '[REQ AC-n] Room schema').toEqual([])`
 * and a failure lists exactly which fields broke the contract.
 */
export function checkShape(value: unknown, schema: Record<string, ShapeRule>, label = 'value'): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${label} is not an object`];
  const obj = value as Record<string, unknown>;
  const out: string[] = [];
  for (const [key, rule] of Object.entries(schema)) {
    const v = obj[key];
    const where = `${label}.${key}`;
    if (v === undefined) { out.push(`${where} is missing`); continue; }
    if (typeof rule === 'function') {
      const r = rule(v);
      if (r !== true) out.push(typeof r === 'string' ? `${where} ${r}` : `${where} is invalid (${JSON.stringify(v)})`);
      continue;
    }
    const ok = rule === 'integer' ? Number.isInteger(v)
      : rule === 'array' ? Array.isArray(v)
      : rule === 'string[]' ? Array.isArray(v) && v.every((x) => typeof x === 'string')
      : rule === 'object' ? typeof v === 'object' && v !== null && !Array.isArray(v)
      : typeof v === rule;
    if (!ok) out.push(`${where} should be ${rule} but is ${JSON.stringify(v)}`);
  }
  return out;
}

const SECRET_KEY = /pass(word)?|token|secret|api[-_]?key|authorization|cookie|session/i;
// Header NAMES that carry credentials (incl. misspellings like "Authorisation") and VALUES that look like credentials.
const SECRET_HEADER = /auth|cookie|token|secret|api[-_]?key|session|password|credential/i;
const SECRET_VALUE = /^\s*(basic|bearer|digest|token)\s+\S+/i;

/** Redact secrets from headers / JSON bodies before they are attached to reports. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => [k, SECRET_KEY.test(k) && typeof v !== 'object' ? '***redacted***' : redact(v, depth + 1)]));
  }
  return value;
}
/**
 * ARIA snapshots include the current value of text fields — password fields too. Redact the values of the
 * page's password inputs wherever they appear, and any value shown for a textbox whose name looks secret.
 */
export function redactSnapshot(yaml: string, secretValues: string[] = []): string {
  let out = yaml;
  for (const v of secretValues.filter((x) => x && x.length >= 3)) out = out.split(v).join('***redacted***');
  return out.replace(/^(\s*- textbox "[^"]*(?:pass(?:word|code)?|pin|secret|token)[^"]*"[^:\n]*):\s*\S.*$/gim, '$1: ***redacted***');
}
const redactHeaders = (h: Record<string, string>) =>
  Object.fromEntries(Object.entries(h).map(([k, v]) => [k, SECRET_HEADER.test(k) || SECRET_VALUE.test(String(v)) ? '***redacted***' : v]));
const clip = (s: string, n = 4000) => (s.length > n ? `${s.slice(0, n)}… (${s.length - n} more chars)` : s);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Seconds a 429 asks us to wait (Retry-After header, or a retry_after field some WAFs put in the body). */
const retryAfter = (header: string | undefined, body = '') => Math.min(Number(header ?? body.match(/retry_after\D{0,5}(\d+)/i)?.[1] ?? 10) || 10, 120);

export const test = base.extend<{ data: TestData; journey: Journey; api: Api; apiContext: APIRequestContext; seed: Seed; pace: void }>({
  // The profile's minTestIntervalMs: tests start at least that far apart, across workers and worker restarts, so a
  // host that bans bursts of traffic (shared sandboxes behind a WAF) never sees one.
  pace: [async ({}, use) => {
    const interval = Number(process.env.AUT_MIN_TEST_INTERVAL_MS ?? 0);
    if (interval > 0) {
      const stamp = path.join(os.tmpdir(), `heldout-pace-${new URL(process.env.AUT_BASE_URL ?? 'http://aut').host.replace(/[^\w.-]/g, '_')}`);
      const last = Number(fs.existsSync(stamp) ? fs.readFileSync(stamp, 'utf8') : 0) || 0;
      const wait = last + interval - Date.now();
      if (wait > 0) await sleep(Math.min(wait, interval));
      fs.writeFileSync(stamp, String(Date.now()));
    }
    await use();
  }, { auto: true }],

  // Paths resolve against the profile URL including its path prefix (see autUrl). A 429 page (rate limit) is the
  // environment, not the application: wait as told and load again, twice at most.
  page: async ({ page }, use) => {
    await blockThirdParty(page.context(), process.env.AUT_BLOCK_HOSTS);
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      let res = await goto(autUrl(process.env.AUT_BASE_URL, url), options);
      for (let attempt = 0; res?.status() === 429 && attempt < 2; attempt++) {
        await sleep(retryAfter(res.headers()['retry-after'], await res.text().catch(() => '')) * 1000);
        res = await goto(autUrl(process.env.AUT_BASE_URL, url), options);
      }
      return res;
    };
    await use(page);
  },

  // Depends on `api` so the API client (used by cleanups) is torn down only after the seed teardown ran.
  seed: async ({ api }, use, testInfo) => {
    void api;
    const ledger: SeedRecord[] = [];
    const cleanups: { rec: SeedRecord; run: () => Promise<unknown> }[] = [];
    const tag = `hx${Date.now().toString(36).slice(-5)}${testInfo.workerIndex}${testInfo.repeatEachIndex}`;
    /** Run a precondition in the [seed] phase with ledger + BLOCKED semantics. */
    const pre = async <T,>(rec: SeedRecord, run: () => Promise<T>): Promise<T> => {
      ledger.push(rec);
      try {
        apiPhase = 'seed';
        const value = await base.step(`[SEED] ${rec.label}`, run).finally(() => { apiPhase = 'test'; });
        rec.created = redact(value);
        return value;
      } catch (err) {
        rec.error = (err as Error).message.split('\n')[0];
        throw new Error(`[SEED] ${rec.label}: precondition could not be established — ${(err as Error).message}`);
      }
    };
    await use({
      tag,
      async create<T>(label: string, make: () => Promise<T>, cleanup?: (created: T) => Promise<unknown>): Promise<T> {
        const rec: SeedRecord = { label, kind: 'data', cleanup: cleanup ? undefined : 'none' };
        const created = await pre(rec, make);
        if (cleanup) cleanups.push({ rec, run: () => cleanup(created) });
        return created;
      },
      step<T>(label: string, run: () => Promise<T>): Promise<T> {
        return pre({ label, kind: 'pre-step', cleanup: 'none' }, run);
      },
      async once<T>(key: string, label: string, make: () => Promise<T>, ttlMs = 10 * 60_000): Promise<T> {
        const hit = onceCache.get(key);
        if (hit && Date.now() - hit.at < ttlMs) {
          ledger.push({ label, kind: 'auth', cleanup: 'none', reused: true, created: '(reused within this worker)' });
          return hit.value as T;
        }
        const value = await pre({ label, kind: 'auth', cleanup: 'none' }, make);
        onceCache.set(key, { value, at: Date.now() });
        return value;
      },
      until<T>(label: string, probe: () => Promise<T>, ready: (value: T) => boolean, opts: { timeoutMs?: number; intervalMs?: number } = {}): Promise<T> {
        const { timeoutMs = 15_000, intervalMs = 500 } = opts;
        return pre({ label, kind: 'readiness', cleanup: 'none' }, async () => {
          const deadline = Date.now() + timeoutMs;
          let last: T;
          for (;;) {
            last = await probe();
            if (ready(last)) return last;
            if (Date.now() > deadline) throw new Error(`not ready after ${timeoutMs} ms (last value: ${JSON.stringify(redact(last)).slice(0, 200)})`);
            await new Promise((r) => setTimeout(r, intervalMs));
          }
        });
      },
      track<T>(label: string, created: T, cleanup: (created: T) => Promise<unknown>): T {
        const rec: SeedRecord = { label: `${label} (created by the scenario)`, kind: 'scenario-created', created: redact(created) };
        ledger.push(rec);
        cleanups.push({ rec, run: () => cleanup(created) });
        return created;
      },
    });
    // Teardown: undo in reverse order; never fail the test because of cleanup. HELDOUT_KEEP_DATA=1 keeps data for debugging.
    for (const c of cleanups.reverse()) {
      if (process.env.HELDOUT_KEEP_DATA === '1') { c.rec.cleanup = 'skipped'; continue; }
      apiPhase = 'cleanup';
      try { await c.run(); c.rec.cleanup = 'done'; } catch (e) { c.rec.cleanup = 'failed'; c.rec.error = (e as Error).message.split('\n')[0]; } finally { apiPhase = 'test'; }
    }
    if (ledger.length) await testInfo.attach('seed-ledger', { body: JSON.stringify({ tag, records: ledger }, null, 2), contentType: 'application/json' });
  },

  data: async ({}, use, testInfo) => {
    // spec lives in evaluations/<KEY>/tests/**  →  evaluations/<KEY>/test-data.json
    let dir = path.dirname(testInfo.file);
    while (path.basename(dir) !== 'tests' && path.dirname(dir) !== dir) dir = path.dirname(dir);
    const file = path.join(path.dirname(dir), 'test-data.json');
    const raw = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Json) : {};
    await use(resolveEnv(raw) as TestData);
  },

  journey: async ({ page }, use, testInfo) => {
    const capture = process.env.HELDOUT_CAPTURE === '1';
    const runDir = process.env.HELDOUT_RUN_DIR;
    const scenario = scenarioIdOf(testInfo.title) ?? slug(testInfo.title);
    let n = 0;

    const snap = async (label: string) => {
      // API-only tests never navigate: skip empty snapshots.
      if (page.url() === 'about:blank') return;
      const raw = await page.locator('body').ariaSnapshot({ timeout: 3_000 })
        .catch((e: Error) => `# snapshot unavailable: ${e.message.split('\n')[0]}`);
      const yaml = redactSnapshot(raw, await page.$$eval('input[type="password"]', (els) => els.map((el) => (el as HTMLInputElement).value)).catch(() => []));
      const body = `# url: ${page.url()}\n# step: ${label}\n${yaml}\n`;
      const name = `${String(n).padStart(2, '0')}-${slug(label)}`;
      await testInfo.attach(`aria-snapshot ${name}`, { body, contentType: 'text/yaml' });
      if (runDir) {
        const file = path.join(runDir, 'snapshots', scenario, `retry${testInfo.retry}`, `${name}.yml`);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, body);
      }
    };

    await use({
      step: <T>(title: string, body: () => Promise<T>) =>
        base.step(title, async () => {
          n++;
          try {
            const result = await body();
            if (capture) await snap(title);
            return result;
          } catch (err) {
            await snap(`FAILED ${title}`).catch(() => undefined);
            throw err;
          }
        }),
      capture: snap,
    });
  },

  apiContext: async ({}, use) => {
    const ctx = await pwRequest.newContext({ baseURL: process.env.AUT_API_BASE_URL ?? process.env.AUT_BASE_URL });
    await use(ctx);
    await ctx.dispose();
  },

  api: async ({ apiContext }, use, testInfo) => {
    let n = 0;
    const call = async <T,>(method: string, urlPath: string, o: ApiCallOptions = {}): Promise<ApiResponse<T>> => {
      const headers = Object.fromEntries(Object.entries({ Accept: 'application/json', ...o.headers })
        .filter((kv): kv is [string, string] => kv[1] !== null));
      if (o.cookies) headers.Cookie = Object.entries(o.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
      const raw = typeof o.data === 'string';
      if (o.data !== undefined) headers['Content-Type'] ??= 'application/json';
      const formBody = o.form ? new URLSearchParams(Object.entries(o.form).map(([k, v]) => [k, String(v)])).toString() : undefined;
      if (formBody !== undefined) headers['Content-Type'] ??= 'application/x-www-form-urlencoded';
      const send = () => apiContext.fetch(autUrl(process.env.AUT_API_BASE_URL ?? process.env.AUT_BASE_URL, urlPath), {
        method, headers, params: o.params, ...(o.maxRedirects !== undefined ? { maxRedirects: o.maxRedirects } : {}),
        ...(o.data !== undefined ? { data: raw ? (o.data as string) : JSON.stringify(o.data) } : formBody !== undefined ? { data: formBody } : {}),
        failOnStatusCode: false,
      });
      let started = Date.now();
      let res = await send();
      // A shared host rate-limiting us (429) is the environment, not the answer under test: wait as told, twice at most.
      for (let attempt = 0; res.status() === 429 && attempt < 2; attempt++) {
        await sleep(retryAfter(res.headers()['retry-after'], await res.text().catch(() => '')) * 1000);
        started = Date.now();
        res = await send();
      }
      const durationMs = Date.now() - started;
      const text = await res.text();
      let body: unknown = text;
      if (/json/i.test(res.headers()['content-type'] ?? '') || /^\s*[[{]/.test(text)) { try { body = JSON.parse(text); } catch { /* keep text */ } }
      const exchange = {
        request: { method, url: res.url(), headers: redactHeaders(headers), body: raw ? clip(o.data as string) : o.form ? redact(o.form) : redact(o.data) },
        response: { status: res.status(), durationMs, headers: redactHeaders(res.headers()), body: typeof body === 'string' ? clip(body) : redact(body) },
      };
      n++;
      // Name format: "api-exchange NN [seed|cleanup] METHOD /path → status" — triage excludes seed/cleanup from evidence.
      await testInfo.attach(`api-exchange ${String(n).padStart(2, '0')}${apiPhase === 'test' ? '' : ` [${apiPhase}]`} ${method} ${new URL(res.url()).pathname} → ${res.status()}`,
        { body: JSON.stringify(exchange, null, 2), contentType: 'application/json' });
      return { status: res.status(), ok: res.ok(), headers: res.headers(), body: body as T, text, durationMs, url: res.url() };
    };
    await use({
      call,
      get: (p, o) => call('GET', p, o),
      post: (p, o) => call('POST', p, o),
      put: (p, o) => call('PUT', p, o),
      patch: (p, o) => call('PATCH', p, o),
      delete: (p, o) => call('DELETE', p, o),
    });
  },
});

export { expect };
