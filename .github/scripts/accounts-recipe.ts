/**
 * The AUT profile's `accounts` recipe: how tests get an account, and a live check of it (`heldout doctor`,
 * `heldout accounts --check`), so a broken recipe shows up before any scenario is BLOCKED.
 *
 *   created   `create` (+ `delete` when the application allows it): each test makes its own account
 *   existing  `existing`: accounts someone already made; the tests share them out and never create or delete them
 *
 * Strings may use ${username}, ${password}, ${id}, ${token}, ${uid}, ${env:NAME} and ${vault:path#field}.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, resolveUrl, type AccountRecipe, type ExistingAccount, type RecipeCall } from './config';
import { closeOverlays, locateOn } from './page';
import { ENV_REF, expandSecrets } from './secrets';

export const envNamesIn = (value: unknown): string[] => [...new Set([...JSON.stringify(value ?? {}).matchAll(ENV_REF)].map((m) => m[1]))];

function fill(value: unknown, vars: Record<string, unknown>): unknown {
  // A value that is exactly "${name}" keeps the saved value's JSON type (a number stays a number).
  const whole = typeof value === 'string' ? value.match(/^\$\{(\w+)\}$/)?.[1] : undefined;
  if (whole !== undefined && (typeof vars[whole] === 'number' || typeof vars[whole] === 'boolean')) return vars[whole];
  if (typeof value === 'string') return expandSecrets(value).replace(/\$\{(\w+)\}/g, (m, n: string) => (vars[n] === undefined ? m : String(vars[n])));
  if (Array.isArray(value)) return value.map((v) => fill(v, vars));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v, vars)]));
  return value;
}
const dig = (o: unknown, dotted: string): unknown => dotted.split('.').reduce<unknown>((a, k) => (a && typeof a === 'object' ? (a as Record<string, unknown>)[k] : undefined), o);
const SECRET = /\$\{(?:env|vault):[^}]+\}/;

interface ChainStep { name?: string; method?: string; path: string; headers?: Record<string, string>; json?: unknown; form?: Record<string, string>; save?: Record<string, string>; expect?: number | number[] }
/** Names the recipe fills itself; anything else a call uses must come from a `before` call. */
const RECIPE_VARS = new Set(['uid', 'username', 'password', 'id', 'token']);
interface InspectStep { do: string; target?: string; value?: string }

/**
 * An accounts recipe from the api-probe chain hardening already ran:
 *  - a step saving "id" (and not "token") creates the account; its body value holding ${uid} is the user name;
 *  - the step saving "token" signs in (its saved "id", if any, is where the sign-in answer carries the account id);
 *  - a DELETE on the account that the chain expects to succeed ("expect": 2xx) removes it.
 * Without a create step the chain signed in as an existing account: the token step's user-name and password values
 * (${env:…} or ${vault:…}) become the first entry of `existing`. UI sign-in steps come from inspect
 * (${var:…} → ${username}, secret references → ${password}).
 */
export function recipeFromChain(chain: { steps: ChainStep[] }, signIn?: { path: string; steps: InspectStep[]; done?: string }): AccountRecipe {
  const saves = (s: ChainStep, k: string) => Boolean(s.save && k in s.save);
  // Creating an account: a step saving the new account's "id" whose body is unique per run (${uid}); it may also
  // answer with a token. Signing in: another step saving "token". Looking the id up: a later step saving "id".
  const createAt = chain.steps.findIndex((s) => saves(s, 'id') && JSON.stringify(s.json ?? s.form ?? {}).includes('${uid}'));
  const create = createAt >= 0 ? chain.steps[createAt] : undefined;
  const tokenAt = chain.steps.findIndex((s, i) => i !== createAt && saves(s, 'token'));
  const token = tokenAt >= 0 ? chain.steps[tokenAt] : undefined;
  const lookupAt = chain.steps.findIndex((s, i) => i !== createAt && i !== tokenAt && saves(s, 'id') && (tokenAt < 0 || i > tokenAt));
  const lookup = lookupAt >= 0 ? chain.steps[lookupAt] : undefined;
  // Deleting the account: a DELETE on the account itself (its ${id}, or …/me), not one that removes other test data.
  // Only one the chain expects to succeed: a DELETE without a 2xx "expect" probes whether the application allows it.
  const expectsSuccess = (s: ChainStep) => [s.expect ?? []].flat().some((x) => x >= 200 && x < 300);
  const del = chain.steps.find((s) => (s.method ?? 'GET').toUpperCase() === 'DELETE' && (/\$\{id\}/.test(s.path) || /(^|\/)me\/?$/.test(s.path)) && expectsSuccess(s));
  if (!create && !token) throw new Error('the chain neither creates an account (a step saving "id") nor signs in (a step saving "token")');
  const source = create ?? token!;
  const fields = (source.json ?? source.form ?? {}) as Record<string, unknown>;
  const entries = Object.entries(fields).filter(([, v]) => typeof v === 'string') as [string, string][];
  const password = entries.find(([k, v]) => /pass/i.test(k) && SECRET.test(v))?.[1] ?? entries.find(([, v]) => SECRET.test(v))?.[1];
  if (!password) throw new Error(`the ${create ? 'create' : 'sign-in'} step's body has no \${env:NAME} or \${vault:path#field} password`);
  const username = create ? entries.find(([, v]) => v.includes('${uid}'))?.[1] : entries.find(([k, v]) => /user|login|email|name/i.test(k) && v !== password)?.[1];
  if (!create && !username) throw new Error('the sign-in step\'s body has no user-name field (userName, email, login…)');
  const swap = (v: unknown): unknown => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)
    .split(password).join('${password}').split(username ?? '\u0000').join('${username}')));
  const call = (s: ChainStep): RecipeCall => ({ method: (s.method ?? 'GET').toUpperCase(), path: `/${s.path.replace(/^\/+/, '')}`,
    ...(s.json !== undefined ? { body: swap(s.json) } : {}), ...(s.form ? { form: swap(s.form) as Record<string, string> } : {}) });
  const authLine = [...chain.steps].flatMap((s) => Object.entries(s.headers ?? {})).find(([, v]) => v.includes('${token}'));
  // Values the account calls take from earlier steps (a security-question id, a CSRF token): those steps run first.
  const firstAt = Math.min(...[createAt, tokenAt].filter((i) => i >= 0));
  const used = new Set([create, token, lookup, del].filter(Boolean).flatMap((s) => [...JSON.stringify([s!.path, s!.json ?? s!.form ?? null, s!.headers ?? null]).matchAll(/\$\{(\w+)\}/g)].map((m) => m[1]))
    .filter((n) => !RECIPE_VARS.has(n)));
  const before = chain.steps.slice(0, firstAt).filter((s) => Object.keys(s.save ?? {}).some((n) => used.has(n)));
  const missing = [...used].filter((n) => !before.some((s) => s.save && n in s.save));
  if (missing.length) throw new Error(`the account calls use ${missing.map((n) => `\${${n}}`).join(', ')}, which no earlier step of the chain saves — save it in a step before the account is created or signed in`);
  return {
    ...(before.length ? { before: before.map((s) => ({ ...call(s), save: Object.fromEntries(Object.entries(s.save!).filter(([n]) => used.has(n))) })) } : {}),
    ...(create ? { password, ...(username ? { username } : {}), create: { ...call(create), id: create.save!.id, ...(saves(create, 'token') ? { token: create.save!.token } : {}) } } : { existing: [{ username: username!, password }] }),
    ...(token ? { token: { ...call(token), token: token.save!.token, ...(token.save!.id ? { id: token.save!.id } : {}) } } : {}),
    ...(lookup ? { lookup: { ...call(lookup), id: lookup.save!.id } } : {}),
    ...(authLine ? { authHeader: `${authLine[0]}: ${authLine[1]}` } : {}),
    ...(del && create ? { delete: call(del) } : {}),
    ...(signIn ? { signIn: signInFromSteps(signIn, create ? [] : [{ username: username!, password }]) } : {}),
  };
}

/** The recipe's UI sign-in from inspect steps: ${var:…} → ${username}, secret references → ${password}. */
export function signInFromSteps(signIn: { path: string; steps: InspectStep[]; done?: string }, existing: ExistingAccount[] = []): NonNullable<AccountRecipe['signIn']> {
  // A secret reference is the user name when an existing account names it so, or when it fills a user-name / e-mail
  // field (the inspected steps of an account whose user name is in Vault too); otherwise the password.
  const isUsername = (ref: string, target = '') => existing.some((a) => a.username === ref)
    || (!existing.some((a) => a.password === ref) && !/pass/i.test(target) && /user|e-?mail|login|name/i.test(target));
  // A user name typed as it is (the steps were recorded as one account) stands for whichever account signs in.
  const toUi = (v = '', target = '') => (existing.some((a) => a.username === v) ? '${username}'
    : v.replace(/\$\{var:\w+\}/g, '${username}').replace(/\$\{(?:env|vault):[^}]+\}/g, (ref) => (isUsername(ref, target) ? '${username}' : '${password}')));
  // Inspect steps ({"do": "fill", "target": …}) or steps already in the recipe's own shape ({"fill": …} / {"click": …}).
  type UiStep = { fill?: string; click?: string; value?: string };
  const steps = signIn.steps.flatMap((s): UiStep[] => {
    const r = s as InspectStep & { fill?: string; click?: string };
    if (r.do === 'fill' && r.target) return [{ fill: r.target, value: toUi(r.value, r.target) }];
    if (r.do === 'click' && r.target) return [{ click: r.target }];
    if (typeof r.fill === 'string') return [{ fill: r.fill, value: toUi(r.value, r.fill) }];
    if (typeof r.click === 'string') return [{ click: r.click }];
    return [];
  });
  if (!steps.length) throw new Error(`the sign-in steps have no fill or click step: give them as inspect steps ([{"do":"fill","target":"getByLabel('Email')","value":"\${username}"}, {"do":"click","target":"…"}]) or as {"fill": …, "value": …} / {"click": …}`);
  return { path: signIn.path, done: signIn.done, steps };
}


export interface RecipeStep { step: string; ok: boolean; detail: string }

/** Run the recipe's UI sign-in in a headless browser as the given account; the error message, or undefined when it worked. */
async function uiForm(form: NonNullable<AccountRecipe['signIn']>, baseURL: string, vars: Record<string, unknown>, blockHosts: string[] = [], testIdAttribute = 'data-testid', overlays: string[] = []): Promise<string | undefined> {
  const signIn = form;
  let chromium: { launch(o: object): Promise<{ newContext(): Promise<UiContext>; close(): Promise<void> }> };
  try {
    const pw = await import(pathToFileURL(createRequire(path.join(ROOT, 'package.json')).resolve('@playwright/test')).href);
    chromium = pw.chromium ?? pw.default?.chromium;
    (pw.selectors ?? pw.default?.selectors).setTestIdAttribute(testIdAttribute); // getByTestId as the tests resolve it
  } catch { return 'Playwright is not installed here (npm run heldout -- init --install)'; }
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    if (blockHosts.length) await context.route((u: URL) => blockHosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`)), (route: { abort(): Promise<void> }) => route.abort());
    const page = await context.newPage();
    const locate = (expr: string) => locateOn<UiLocator>(page, expr);
    await closeOverlays(page, overlays);
    await page.goto(resolveUrl(baseURL, signIn.path), { waitUntil: 'domcontentloaded' });
    for (const st of signIn.steps) {
      if (st.fill !== undefined) await locate(st.fill).fill(String(fill(st.value ?? '', vars)), { timeout: 15_000 });
      else if (st.click !== undefined) await locate(st.click).click({ timeout: 15_000 });
    }
    if (signIn.done?.startsWith('url:')) await page.waitForURL((u: URL) => u.pathname.includes(signIn.done!.slice(4)) || u.href.includes(signIn.done!.slice(4)), { timeout: 15_000 });
    else if (signIn.done) await locate(signIn.done).first().waitFor({ state: 'visible', timeout: 15_000 });
    return undefined;
  } catch (err) {
    return (err as Error).message.split('\n')[0];
  } finally { await browser.close(); }
}
interface UiLocator { fill(v: string, o: object): Promise<void>; click(o: object): Promise<void>; dispatchEvent(type: string): Promise<void>; first(): UiLocator; waitFor(o: object): Promise<void> }
interface UiContext { route(match: (u: URL) => boolean, handler: (route: { abort(): Promise<void> }) => Promise<void>): Promise<void>; newPage(): Promise<UiPage> }
interface UiPage { addLocatorHandler(l: UiLocator, h: (l: UiLocator) => Promise<void>): Promise<void>; goto(url: string, o: object): Promise<unknown>; waitForURL(match: (u: URL) => boolean, o: object): Promise<void> }

/**
 * Check the recipe live. Existing accounts: each signs in over the API (nothing is created or deleted). Created
 * accounts: create → token → delete; when the application offers no delete, nothing is created unless `createUndeletable`.
 */
export async function checkAccountRecipe(r: AccountRecipe, apiBaseURL: string, opts: { createUndeletable?: boolean; profile?: string; dataPrefix?: string; ui?: { baseURL: string; blockHosts?: string[]; testIdAttribute?: string; overlays?: string[] } } = {}): Promise<RecipeStep[]> {
  const out: RecipeStep[] = [];
  const send = async (c: RecipeCall, vars: Record<string, unknown>, token?: string) => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    let body: string | undefined;
    if (c.body !== undefined) { body = JSON.stringify(fill(c.body, { ...vars, token })); headers['Content-Type'] = 'application/json'; }
    else if (c.form) { body = new URLSearchParams(fill(c.form, { ...vars, token }) as Record<string, string>).toString(); headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
    if (token) {
      const line = String(fill(r.authHeader ?? 'Authorization: Bearer ${token}', { token }));
      headers[line.slice(0, line.indexOf(':')).trim()] = line.slice(line.indexOf(':') + 1).trim();
    }
    // A placeholder without a value would be sent literally (e.g. an e-mail "hldout-${uid}@…"): never send that.
    const unfilled = `${fill(c.path, { ...vars, token })} ${body ?? ''}`.match(/\$\{[^}]+\}/)?.[0];
    if (unfilled) throw new Error(`${c.method} ${c.path}: ${unfilled} has no value here, so the request was not sent`);
    const res = await fetch(resolveUrl(apiBaseURL, String(fill(c.path, { ...vars, token }))), { method: c.method, headers, body, signal: AbortSignal.timeout(30_000) });
    const text = await res.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = undefined; }
    return { status: res.status, ok: res.ok, json, text };
  };
  /** The recipe's `before` calls, their saved values put into vars; false when one failed (recorded). */
  const runBefore = async (vars: Record<string, unknown>) => {
    for (const b of r.before ?? []) {
      const res = await send(b, vars);
      const got = Object.entries(b.save).map(([n, d]) => [n, dig(res.json, d)] as const);
      const lacking = got.filter(([, v]) => v === undefined || v === null).map(([n]) => b.save[n]);
      out.push({ step: `before ${b.method} ${b.path}`, ok: res.ok && !lacking.length, detail: !res.ok ? `${res.status} ${res.text.replace(/\s+/g, ' ').slice(0, 120)}` : lacking.length ? `${res.status}, no "${lacking.join('", "')}" in the answer` : `${res.status}, ${Object.keys(b.save).join(', ')} found` });
      if (!res.ok || lacking.length) return false;
      for (const [n, v] of got) vars[n] = v;
    }
    return true;
  };
  const signInOverApi = async (vars: Record<string, unknown>, label: string) => {
    if (!r.token) return undefined;
    const t = await send(r.token, vars);
    const value = dig(t.json, r.token.token);
    const token = typeof value === 'string' && value ? value : undefined;
    out.push({ step: `token ${label}`, ok: Boolean(token), detail: token ? `${t.status}, signed in` : `${t.status}, no "${r.token.token}" in the answer${t.status === 401 || t.status === 400 ? ' (wrong user name or password?)' : ''}` });
    return token;
  };

  if (!r.create && !r.signUp) {
    for (const a of r.existing ?? []) {
      const vars = { username: String(fill(a.username, {})), password: String(fill(a.password, {})), id: a.id ? String(fill(a.id, {})) : undefined };
      const unresolved = [a.username, a.password].filter((v) => /\$\{(env|vault):/.test(String(fill(v, {}))));
      if (unresolved.length) { out.push({ step: `account ${a.username}`, ok: false, detail: `not set: ${unresolved.join(', ')}` }); continue; }
      if (!r.token) { out.push({ step: `account ${a.username}`, ok: true, detail: r.signIn ? 'credentials set; the UI sign-in is checked by the first test that signs in' : 'credentials set; they are checked once a way to sign in is saved' }); continue; }
      if (!(await runBefore(vars))) return out;
      const token = await signInOverApi(vars, a.username);
      if (token && !vars.id && r.lookup) {
        const l = await send(r.lookup, vars, token);
        const id = dig(l.json, r.lookup.id);
        out.push({ step: `id of ${a.username}`, ok: id !== undefined && id !== null, detail: id !== undefined && id !== null ? `${l.status}, ${r.lookup.id} found` : `${l.status}, no "${r.lookup.id}" in the answer` });
      }
    }
    if (r.reset && out.every((x) => x.ok)) out.push({ step: `reset ${r.reset.method} ${r.reset.path}`, ok: true, detail: 'runs when a test takes an account and after it (not run by this check: it changes the accounts\' data)' });
    // The UI sign-in, once, as the first account.
    const first = r.existing?.[0];
    if (opts.ui && r.signIn && first && out.every((x) => x.ok)) {
      const failed = await uiForm(r.signIn, opts.ui.baseURL, { username: String(fill(first.username, {})), password: String(fill(first.password, {})) }, opts.ui.blockHosts, opts.ui.testIdAttribute, opts.ui.overlays);
      out.push({ step: `UI sign-in at ${r.signIn.path}`, ok: !failed, detail: failed ?? `signed in as ${first.username}` });
    }
    return out;
  }

  const how = r.create ? `create ${r.create.method} ${r.create.path}` : `sign-up at ${r.signUp!.path}`;
  if (!r.delete && !opts.createUndeletable) {
    out.push({ step: how, ok: true, detail: 'not run: the application offers no delete, so a check account would stay behind (heldout accounts --check --create makes one on purpose)' });
    return out;
  }
  const vars: Record<string, unknown> = { uid: `${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 4)}`, password: String(fill(r.password ?? '', {})) };
  vars.username = String(fill(r.username ?? `${opts.dataPrefix ?? 'hldout'}-\${uid}`, vars));
  if (!(await runBefore(vars))) return out;
  let fromCreate: unknown;
  if (r.create) {
    const created = await send(r.create, vars);
    const id = dig(created.json, r.create.id);
    // An application whose password rules reject the test password says so: the fix is a new generated one.
    const passwordEnv = /\$\{env:(\w+)\}/.exec(r.password ?? '')?.[1];
    const policy = !created.ok && /passw/i.test(created.text) && passwordEnv ? ` — if the application's password rules reject ${passwordEnv}: npm run heldout -- secret ${passwordEnv} --generate --force (upper and lower case, digits and one of ! @ *)` : '';
    // …and one whose rules reject the generated name: another prefix (or the recipe's username template).
    const naming = !created.ok && !policy && /user ?name|e-?mail|login|name/i.test(created.text) ? ` — if the application's rules reject the name ${String(vars.username)}: npm run heldout -- init${opts.profile ? ` --profile ${opts.profile}` : ''} --data-prefix <letters>, or set the recipe's "username" template` : '';
    out.push({ step: how, ok: created.ok && id !== undefined, detail: created.ok ? (id === undefined ? `${created.status}, but no "${r.create.id}" in the response` : `${created.status}, ${r.create.id} found`) : `${created.status} ${created.text.replace(/\s+/g, ' ').slice(0, 160)}${policy}${naming}` });
    if (!created.ok || id === undefined) return out;
    vars.id = String(id);
    fromCreate = r.create.token ? dig(created.json, r.create.token) : undefined;
    if (r.create.token) out.push({ step: 'token from the create answer', ok: typeof fromCreate === 'string' && Boolean(fromCreate), detail: typeof fromCreate === 'string' && fromCreate ? `${r.create.token} found` : `no "${r.create.token}" in the answer` });
  } else {
    // The sign-up page is the only way to make an account: fill it in a browser, as the tests do.
    const failed = opts.ui ? await uiForm(r.signUp!, opts.ui.baseURL, vars, opts.ui.blockHosts, opts.ui.testIdAttribute, opts.ui.overlays) : 'no browser settings given';
    out.push({ step: how, ok: !failed, detail: failed ?? `made ${String(vars.username)}` });
    if (failed) return out;
  }
  const signedIn = r.token ? await signInOverApi(vars, `${r.token.method} ${r.token.path}`) : undefined;
  let token = signedIn ?? (typeof fromCreate === 'string' ? fromCreate : undefined);
  if (!vars.id && r.lookup) {
    const l = await send(r.lookup, vars, token);
    const id = dig(l.json, r.lookup.id);
    out.push({ step: `id ${r.lookup.method} ${r.lookup.path}`, ok: id !== undefined && id !== null, detail: id !== undefined && id !== null ? `${l.status}, ${r.lookup.id} found` : `${l.status}, no "${r.lookup.id}" in the answer` });
    if (id === undefined || id === null) return out;
    vars.id = String(id);
  }
  if (opts.ui && r.signIn) {
    const failed = await uiForm(r.signIn, opts.ui.baseURL, vars, opts.ui.blockHosts, opts.ui.testIdAttribute, opts.ui.overlays);
    out.push({ step: `UI sign-in at ${r.signIn.path}`, ok: !failed, detail: failed ?? `signed in as the check account` });
    // Many applications revoke earlier tokens at a UI sign-in: take a fresh one for the delete.
    if (r.token) token = (await signInOverApi(vars, 'again after the UI sign-in')) ?? token;
  }
  if (r.delete) {
    const d = await send(r.delete, vars, token);
    const refused = d.status === 401 || d.status === 403;
    out.push({ step: `delete ${r.delete.method} ${r.delete.path}`, ok: d.ok, detail: `${d.status}${d.ok ? '' : ` ${d.text.replace(/\s+/g, ' ').slice(0, 120)} — the check account ${vars.username} was left behind${refused ? `. The application does not let tests delete accounts: heldout accounts --aut ${opts.profile ?? '<profile>'} --no-delete keeps them (named ${String(r.username ?? `${opts.dataPrefix ?? 'hldout'}-…`).replace('${uid}', '…')}, so they can be found) instead` : ''}`}` });
  } else out.push({ step: 'delete', ok: true, detail: `none in the recipe: the check account ${vars.username} stays in the application` });
  return out;
}
