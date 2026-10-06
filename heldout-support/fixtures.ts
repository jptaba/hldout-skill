/**
 * Held-out test fixtures (scaffolded by the heldout-evaluator skill — AUT-agnostic).
 *
 *  - `data`    : output/<profile>/<KEY>/test-data.json, with ${env:NAME} placeholders resolved (keep secrets in .env).
 *  - `journey` : wraps each Given / When / Then step in a test.step(). Captures an ARIA snapshot of the page
 *                after every step when HELDOUT_CAPTURE=1 (hardening tier 3) and always on step failure
 *                (triage evidence). Snapshots land in <run dir>/snapshots/<SCN-ID>/.
 *  - `api`     : HTTP client bound to the AUT's API origin (AUT_API_BASE_URL). Every exchange is
 *                attached to the report as `api-exchange NN …` (secrets redacted) — triage and the
 *                verdict use it as evidence.
 *  - `unique()`: collision-free values for shared/sandbox AUTs.
 *  - `seed.account()` / `signIn()`: a test account from the AUT profile's `accounts` recipe (created by the test and
 *                deleted if the app allows it, or one of the existing accounts) and the UI sign-in for it.
 *
 * Assertion convention: every assertion that encodes a requirement carries a message tagged
 * `[REQ AC-n] ...` — triage uses the tag to separate application behaviour from script mechanics. Those assertions live
 * in the story's spec only; the shared journeys (journeys/fixtures/<domain>.ts) import from here and assert nothing a
 * story expects.
 *
 * Secret redaction and the page helpers come from the skill installed in this project, so the tests and the skill's
 * own tools (inspect, the accounts check) redact and locate the same way.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test as base, expect, request as pwRequest, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { closeOverlays, locateOn } from '../.github/scripts/page';
import { redact, redactHeaders, redactSnapshot } from '../.github/scripts/redact';

export { redact, redactSnapshot };
/** Playwright's own types, so journeys and specs import everything from here. */
export type { Locator, Page };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TestData = Record<string, any>;
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export interface Journey {
  /** One observable action or outcome per step, titled as the user or client sees it ("Given …", "When …", "Then …"). */
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

/** Vault values `heldout run` read before the tests started (never written to disk). */
const vaultValues = (): Record<string, string> => { try { return JSON.parse(process.env.HELDOUT_VAULT_SECRETS ?? '{}') as Record<string, string>; } catch { return {}; } };

/** ${env:NAME} (.env or the environment) and ${vault:path#field} (HashiCorp Vault, read by `heldout run`). */
function resolveEnv(value: Json): Json {
  if (typeof value === 'string') {
    return value.replace(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name: string) => {
      const v = process.env[name];
      if (v === undefined) throw new Error(`\${env:${name}} is not set (.env or the environment)`);
      return v;
    }).replace(/\$\{vault:([^}#]+)#([^}]+)\}/g, (_, p: string, f: string) => {
      const v = vaultValues()[`${p.trim()}#${f.trim()}`];
      if (v === undefined) throw new Error(`\${vault:${p}#${f}} was not read — start the tests with "heldout run", which reads Vault first`);
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

/** The AUT profile's data prefix (default "hldout"): every name the tests make starts with it, so test data is easy to find and sweep. */
export const DATA_PREFIX = process.env.AUT_DATA_PREFIX || 'hldout';

let uniqueCounter = 0;
/** Collision-free value for shared AUTs: unique() → "hldout k3x9q2-1", unique('Guest') → "Guest k3x9q2-1". */
export function unique(prefix = DATA_PREFIX): string {
  uniqueCounter += 1;
  return `${prefix} ${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 4)}-${uniqueCounter}`;
}
/** unique() without spaces, for e-mails, user names and slugs: uniqueId() → "hldout-k3x9q2-1". Keep prefixes short where the AUT limits length. */
export const uniqueId = (prefix = DATA_PREFIX): string => unique(prefix).replace(/\s+/g, '-');

// ---- data seeding -------------------------------------------------------------------------------

export interface SeedRecord {
  label: string;
  kind: 'data' | 'pre-step' | 'auth' | 'readiness' | 'scenario-created' | 'account';
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
  /** Register cleanup for data the scenario itself created in a When-step (e.g. the record under test). Without a
   *  cleanup (the application offers no way to delete it), the record is listed as kept by design. */
  track<T>(label: string, created: T, cleanup?: (created: T) => Promise<unknown>): T;
  /**
   * A test account from the AUT profile's `accounts` recipe, signed in over the API when the recipe has a `token` call.
   * Created (unique user name, deleted after the test when the recipe has `delete`), or one of the `existing` accounts:
   * each parallel worker gets its own share, and each call in a test the next one (never deleted; the recipe's `reset`,
   * when set, restores it before and after the test). A failure is BLOCKED.
   */
  account(label?: string, options?: { username?: string }): Promise<Account>;
}

/** A test account from seed.account(). `headers` authenticate API calls as it: api.get(path, { headers: acct.headers }). */
export interface Account {
  id: string; username: string; password: string; token?: string;
  headers: Record<string, string>;
  /** The body of the latest sign-in answer (or of the create answer when it carried the token), for values it carries
   *  besides the token, e.g. `(me.signInBody as { authentication: { bid: number } }).authentication.bid`. */
  signInBody?: Json;
  /** Sign in over the API again (a UI sign-in revokes earlier tokens on many applications). */
  refresh(): Promise<void>;
}

interface RecipeCall { method: string; path: string; body?: Json; form?: Record<string, string> }
interface AccountRecipe {
  password?: string; username?: string; authHeader?: string; before?: (RecipeCall & { save: Record<string, string> })[];
  create?: RecipeCall & { id: string; token?: string }; existing?: { username: string; password: string; id?: string }[];
  token?: RecipeCall & { token: string; id?: string }; lookup?: RecipeCall & { id: string }; delete?: RecipeCall; reset?: RecipeCall;
  signIn?: UiForm; signUp?: UiForm;
}
const accountRecipe = (): AccountRecipe | undefined => (process.env.AUT_ACCOUNTS ? JSON.parse(process.env.AUT_ACCOUNTS) as AccountRecipe : undefined);
const NO_RECIPE = 'the AUT profile has no "accounts" recipe in heldout.config.json (how to create, sign in and delete a test account on this application; see references/data-and-journeys.md)';

/** Fill ${env:NAME} and ${name} placeholders of a recipe value. */
function fillRecipe(value: Json, vars: Record<string, unknown>): Json {
  // A value that is exactly "${name}" keeps the saved value's JSON type (a number stays a number).
  const whole = typeof value === 'string' ? value.match(/^\$\{(\w+)\}$/)?.[1] : undefined;
  if (whole !== undefined && (typeof vars[whole] === 'number' || typeof vars[whole] === 'boolean')) return vars[whole] as Json;
  if (typeof value === 'string') return (resolveEnv(value) as string).replace(/\$\{(\w+)\}/g, (m, n: string) => (vars[n] === undefined ? m : String(vars[n])));
  if (Array.isArray(value)) return value.map((v) => fillRecipe(v, vars));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillRecipe(v, vars)]));
  return value;
}
/** The recipe's auth header for a token ("Authorization: Bearer ${token}" by default) as a headers object. */
function authHeader(r: AccountRecipe, token: string): Record<string, string> {
  const line = String(fillRecipe(r.authHeader ?? 'Authorization: Bearer ${token}', { token }));
  const i = line.indexOf(':');
  return { [line.slice(0, i).trim()]: line.slice(i + 1).trim() };
}
const dig = (o: unknown, dotted: string): unknown => dotted.split('.').reduce<unknown>((a, k) => (a && typeof a === 'object' ? (a as Record<string, unknown>)[k] : undefined), o);

/** A page-locator expression from config ("getByPlaceholder('UserName')") evaluated against the page. */
const locate = (page: Page, expr: string) => locateOn<Locator>(page, expr);

type UiForm = { path: string; steps: { fill?: string; click?: string; value?: string }[]; done?: string };
/** Open the form's page, fill/click its steps (recipe placeholders filled from vars) and wait until it is done. */
async function fillForm(page: Page, form: UiForm, vars: Record<string, unknown>): Promise<void> {
  await gotoPage(page, form.path);
  for (const s of form.steps) {
    if (s.fill !== undefined) await locate(page, s.fill).fill(String(fillRecipe(s.value ?? '', vars)));
    else if (s.click !== undefined) await locate(page, s.click).click();
  }
  if (form.done?.startsWith('url:')) await expect(page).toHaveURL(new RegExp(form.done.slice(4).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 15_000 });
  else if (form.done) await expect(locate(page, form.done).first()).toBeVisible({ timeout: 15_000 });
}

/**
 * Sign in through the UI as a seed.account() account, with the recipe's `signIn` steps. A precondition: a failure is
 * `[SEED] …` (BLOCKED). Afterwards call account.refresh() before API calls if the application revokes older tokens.
 */
export async function signIn(page: Page, account: Account): Promise<void> {
  const r = accountRecipe()?.signIn;
  await base.step(`[SEED] sign in as ${account.username}`, async () => {
    try {
      if (!r) throw new Error(`${NO_RECIPE.replace('"accounts" recipe', '"accounts.signIn" recipe')}`);
      await fillForm(page, r, { username: account.username, password: account.password, id: account.id });
    } catch (err) {
      throw new Error(`[SEED] sign in as ${account.username}: precondition could not be established — ${(err as Error).message}`);
    }
  });
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

/** Close the profile's overlays (cookie consent, welcome dialogs) whenever they appear, before any action or check. */
export async function dismissOverlays(page: Page, overlays = process.env.AUT_OVERLAYS ?? '[]'): Promise<void> {
  await closeOverlays(page, JSON.parse(overlays || '[]') as string[]);
}

/**
 * Robust entry-point navigation: wait for DOMContentLoaded, then let 'load' settle for at most
 * `settleMs` without failing (third-party assets can keep 'load' pending forever).
 */
export async function gotoPage(page: import('@playwright/test').Page, path: string, settleMs = 10_000): Promise<void> {
  // A 429 page (rate limit) is the environment: wait as told and load again, twice at most (any page, fixture or not).
  let res = await page.goto(autUrl(process.env.AUT_BASE_URL, path), { waitUntil: 'domcontentloaded' });
  for (let attempt = 0; res?.status() === 429 && attempt < 2; attempt++) {
    await new Promise((r) => setTimeout(r, Math.min(Number(res!.headers()['retry-after']) || 10, 120) * 1000));
    res = await page.goto(autUrl(process.env.AUT_BASE_URL, path), { waitUntil: 'domcontentloaded' });
  }
  if (res?.status() === 429) throw new Error(`${path} answered 429 (rate limited) three times: the host is throttling the tests — pace them with the profile's maxWorkers / minTestIntervalMs`);
  await page.waitForLoadState('load', { timeout: settleMs }).catch(() => undefined);
}

export type ShapeRule ='string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'string[]' | ((v: unknown) => boolean | string);

/**
 * Schema check for API bodies. Returns human-readable violations (empty = conforms), so a
 * requirement assertion reads `expect(checkShape(room, ROOM), '[REQ AC-n] Room schema').toEqual([])`
 * and a failure lists exactly which fields broke the contract.
 */
/**
 * A requirement check of an API answer: its status and, if given, its exact body, as two soft assertions.
 * Write the message literally at the call site — `expectResponse(res, { status: 400, body: REQ.ERR.X }, '[REQ AC-8] POST /books duplicate')`
 * — the integrity freeze then holds the expected status and body like any other [REQ] assertion.
 */
export function expectResponse(res: ApiResponse, expected: { status: number; body?: unknown }, message: string): void {
  expect.soft(res.status, `${message} (expects status ${expected.status})`).toBe(expected.status);
  if ('body' in expected) expect.soft(res.body, `${message} (expects the body)`).toEqual(expected.body);
}

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
    await dismissOverlays(page);
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
  seed: async ({ api, playwright }, use, testInfo) => {
    void api;
    const ledger: SeedRecord[] = [];
    const cleanups: { rec: SeedRecord; run: () => Promise<unknown> }[] = [];
    let accountsTaken = 0; // existing accounts handed out in this test
    const tag = `${DATA_PREFIX}${Date.now().toString(36).slice(-5)}${testInfo.workerIndex}${testInfo.repeatEachIndex}`;
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
    const seedApi: Seed = {
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
      track<T>(label: string, created: T, cleanup?: (created: T) => Promise<unknown>): T {
        const rec: SeedRecord = { label: `${label} (created by the scenario)`, kind: 'scenario-created', created: redact(created), ...(cleanup ? {} : { cleanup: 'none' as const }) };
        ledger.push(rec);
        if (cleanup) cleanups.push({ rec, run: () => cleanup(created) });
        return created;
      },
      async account(label = 'account', options = {}): Promise<Account> {
        const r = accountRecipe();
        const vars: Record<string, unknown> = { uid: uniqueId('').replace(/^-/, '') };
        const send = async (c: RecipeCall, token?: string) => {
          // A placeholder without a value would be sent literally (e.g. an e-mail "hldout-${uid}@…"): never send that.
          const unfilled = JSON.stringify([fillRecipe(c.path, { ...vars, token }), c.body !== undefined ? fillRecipe(c.body, { ...vars, token }) : null, c.form ? fillRecipe(c.form, { ...vars, token }) : null]).match(/\$\{[^}]+\}/)?.[0];
          if (unfilled) throw new Error(`${c.method} ${c.path}: ${unfilled} has no value here, so the request was not sent`);
          return api.call(c.method, String(fillRecipe(c.path, { ...vars, token })), {
            ...(c.body !== undefined ? { data: fillRecipe(c.body, { ...vars, token }) } : {}),
            ...(c.form ? { form: fillRecipe(c.form, { ...vars, token }) as Record<string, string> } : {}),
            ...(token ? { headers: authHeader(r!, token) } : {}),
          });
        };
        // The recipe's "before" calls (a CSRF token, a valid security-question id…), run before creating or signing in.
        const before = async () => {
          for (const b of r?.before ?? []) {
            const res = await send(b);
            if (!res.ok) throw new Error(`${b.method} ${b.path} → ${res.status} ${res.text.slice(0, 200)}`);
            for (const [n, dotted] of Object.entries(b.save)) {
              const v = dig(res.body, dotted);
              if (v === undefined || v === null) throw new Error(`${b.method} ${b.path} → ${res.status}, but the answer has no "${dotted}"`);
              vars[n] = v;
            }
          }
        };
        const account = {} as Account;
        // In the seed ledger and the verdict, an account is its id and user name (not its token or sign-in answer).
        Object.defineProperty(account, 'toJSON', { value: () => ({ id: account.id, username: account.username }), enumerable: false });
        const ready = async (tokenFromCreate?: unknown, createBody?: Json) => {
          Object.assign(account, {
            id: vars.id, username: vars.username, password: vars.password, headers: {},
            async refresh() {
              if (!r?.token) return;
              await before();
              const t = await send(r.token);
              const token = dig(t.body, r.token.token);
              if (typeof token !== 'string' || !token) throw new Error(`${r.token.method} ${r.token.path} → ${t.status}, but the response has no "${r.token.token}"${t.status === 400 || t.status === 401 ? ' (wrong user name or password?)' : ''}`);
              account.token = token;
              account.headers = authHeader(r, token);
              account.signInBody = t.body as Json;
              if (!account.id && r.token.id) { const id = dig(t.body, r.token.id); if (id !== undefined && id !== null) account.id = String(id); }
            },
          });
          // The create answer may already carry a token; otherwise sign in.
          if (typeof tokenFromCreate === 'string' && tokenFromCreate) { account.token = tokenFromCreate; account.headers = authHeader(r!, tokenFromCreate); account.signInBody = createBody; } else await account.refresh();
          if (!account.id && r?.lookup) {
            const l = await send(r.lookup, account.token);
            const id = dig(l.body, r.lookup.id);
            if (id === undefined || id === null || id === '') throw new Error(`${r.lookup.method} ${r.lookup.path} → ${l.status}, but the answer has no "${r.lookup.id}"`);
            account.id = vars.id = String(id);
          }
          return account;
        };
        /** The recipe's reset of an existing account; a 401/403 (a sign-in during the test revoked the token) retries once. */
        const reset = async (first: boolean) => {
          let res = await send(r!.reset!, account.token);
          if ((res.status === 401 || res.status === 403) && r!.token) { await account.refresh(); res = await send(r!.reset!, account.token); }
          if (first && !res.ok) throw new Error(`reset ${r!.reset!.method} ${r!.reset!.path} for ${account.username} → ${res.status} ${res.text.slice(0, 200)}`);
          return res;
        };
        if (r && !r.create && !r.signUp) {
          // Existing accounts: this worker's share of the list, one per call within a test; never created or deleted.
          const rec: SeedRecord = { label, kind: 'account', cleanup: r.reset ? undefined : 'none' };
          const taken = await pre(rec, async () => {
            const pool = r.existing ?? [];
            const workers = Math.max(1, testInfo.config.workers);
            const mine = pool.filter((_, i) => i % workers === testInfo.parallelIndex);
            const a = mine[accountsTaken++];
            if (!a) throw new Error(`tests use ${accountsTaken} accounts at once: npm run heldout -- accounts --aut ${process.env.HELDOUT_AUT ?? '<profile>'} --per-test ${accountsTaken} (runs then use fewer workers), or add accounts — worker ${testInfo.parallelIndex + 1} of ${workers} has ${mine.length} of ${pool.length}`);
            vars.username = String(resolveEnv(a.username));
            vars.password = String(resolveEnv(a.password));
            vars.id = a.id ? String(resolveEnv(a.id)) : undefined;
            await ready();
            // An account the tests change starts clean, whatever an earlier (crashed) run left.
            if (r.reset) await reset(true);
            return account;
          });
          if (r.reset) cleanups.push({ rec, run: () => reset(false) });
          return taken;
        }
        return seedApi.create(label, async () => {
          if (!r?.create && !r?.signUp) throw new Error(NO_RECIPE);
          vars.password = String(resolveEnv(r.password ?? ''));
          vars.username = options.username ?? String(fillRecipe(r.username ?? `${DATA_PREFIX}-\${uid}`, vars));
          await before();
          if (!r.create) {
            // Only the sign-up page makes accounts: fill it in a browser of its own, then sign in over the API / look up the id.
            const browser = await playwright.chromium.launch({ headless: !process.env.HELDOUT_HEADED });
            try {
              const context = await browser.newContext({ baseURL: process.env.AUT_BASE_URL });
              await blockThirdParty(context, process.env.AUT_BLOCK_HOSTS);
              const page = await context.newPage();
              await dismissOverlays(page);
              await fillForm(page, r.signUp!, vars);
            } catch (err) {
              throw new Error(`sign-up at ${r.signUp!.path} as ${String(vars.username)}: ${(err as Error).message.split('\n')[0]}`);
            } finally { await browser.close(); }
            return ready();
          }
          const res = await send(r.create);
          if (!res.ok) throw new Error(`${r.create.method} ${r.create.path} → ${res.status} ${res.text.slice(0, 200)}`);
          const id = dig(res.body, r.create.id);
          if (id === undefined || id === null || id === '') throw new Error(`${r.create.method} ${r.create.path} → ${res.status}, but the response has no "${r.create.id}"`);
          vars.id = String(id);
          return ready(r.create.token ? dig(res.body, r.create.token) : undefined, res.body as Json);
        }, r?.delete ? async () => {
          let res = await send(r.delete!, account.token);
          // A sign-in during the test (UI or API) may have revoked the token: take a fresh one and retry once.
          if ((res.status === 401 || res.status === 403) && r.token) { await account.refresh(); res = await send(r.delete!, account.token); }
          return res;
        } : undefined);
      },
    };
    await use(seedApi);
    // Teardown: undo in reverse order; never fail the test because of cleanup. HELDOUT_KEEP_DATA=1 keeps data for debugging.
    for (const c of cleanups.reverse()) {
      if (process.env.HELDOUT_KEEP_DATA === '1') { c.rec.cleanup = 'skipped'; continue; }
      apiPhase = 'cleanup';
      // A cleanup answered 404/410 finds the data already gone (the scenario deleted it): that is clean. Any other
      // HTTP error answer (e.g. a DELETE refused with 401) did not clean up.
      try {
        const out = await c.run() as { status?: unknown } | undefined;
        const status = typeof out?.status === 'number' ? out.status : undefined;
        if (status === 404 || status === 410) { c.rec.cleanup = 'done'; c.rec.error = `already gone (HTTP ${status})`; }
        else if (status !== undefined && status >= 400) throw new Error(`HTTP ${status}`);
        else c.rec.cleanup = 'done';
      } catch (e) { c.rec.cleanup = 'failed'; c.rec.error = (e as Error).message.split('\n')[0]; } finally { apiPhase = 'test'; }
    }
    if (ledger.length) await testInfo.attach('seed-ledger', { body: JSON.stringify({ tag, records: ledger }, null, 2), contentType: 'application/json' });
  },

  data: async ({}, use, testInfo) => {
    // spec lives in output/<profile>/<KEY>/tests/**  →  output/<profile>/<KEY>/test-data.json
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
      // Preconditions read the application as it is now: a cached answer (a CDN, max-age) can hold ids from before a
      // shared sandbox was reset. The request under test is sent as the test wrote it.
      if (apiPhase !== 'test' && !Object.keys(headers).some((h) => h.toLowerCase() === 'cache-control')) headers['Cache-Control'] = 'no-cache';
      const send = () => apiContext.fetch(autUrl(process.env.AUT_API_BASE_URL ?? process.env.AUT_BASE_URL, urlPath), {
        method, headers, params: o.params, ...(o.maxRedirects !== undefined ? { maxRedirects: o.maxRedirects } : {}),
        ...(o.data !== undefined ? { data: raw ? (o.data as string) : JSON.stringify(o.data) } : formBody !== undefined ? { data: formBody } : {}),
        failOnStatusCode: false,
      });
      let started = Date.now();
      // A dropped connection (no answer at all) is the environment. Preconditions and cleanups, and idempotent requests,
      // are sent once more; the request under test is never repeated when it isn't idempotent (its outcome is the finding).
      let retriedAfter: string | undefined;
      const resend = async () => {
        try { return await send(); } catch (e) {
          const message = (e as Error).message.split('\n')[0];
          const idempotent = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'].includes(method.toUpperCase());
          if (retriedAfter || !(apiPhase !== 'test' || idempotent) || !/socket hang up|ECONNRESET|ETIMEDOUT|EPIPE|ECONNREFUSED/i.test(message)) throw e;
          retriedAfter = message;
          await sleep(1000);
          started = Date.now();
          return send();
        }
      };
      let res = await resend();
      // A shared host rate-limiting us (429) is the environment, not the answer under test: wait as told, twice at most.
      for (let attempt = 0; res.status() === 429 && attempt < 2; attempt++) {
        await sleep(retryAfter(res.headers()['retry-after'], await res.text().catch(() => '')) * 1000);
        started = Date.now();
        res = await send();
      }
      // A gateway error while setting up or cleaning up (502/503/504) is the environment: one more try after a pause.
      // The request under test is never repeated: its answer is what the test judges.
      if (apiPhase !== 'test' && [502, 503, 504].includes(res.status()) && !retriedAfter) {
        retriedAfter = `HTTP ${res.status()}`;
        await sleep(2000);
        started = Date.now();
        res = await send();
      }
      const durationMs = Date.now() - started;
      const text = await res.text();
      let body: unknown = text;
      if (/json/i.test(res.headers()['content-type'] ?? '') || /^\s*[[{]/.test(text)) { try { body = JSON.parse(text); } catch { /* keep text */ } }
      const exchange = {
        request: { method, url: res.url(), headers: redactHeaders(headers), body: raw ? clip(o.data as string) : o.form ? redact(o.form, { testValues: true }) : redact(o.data, { testValues: true }), ...(retriedAfter ? { retriedAfter } : {}) },
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
