/**
 * The AUT profile's `accounts` recipe: how tests get an account, and a live check of it (`heldout doctor`,
 * `heldout accounts --check`), so a broken recipe shows up before any scenario is BLOCKED.
 *
 *   created   `create` (+ `delete` when the application allows it): each test makes its own account
 *   existing  `existing`: accounts someone already made; the tests share them out and never create or delete them
 *
 * Strings may use ${username}, ${password}, ${id}, ${token}, ${uid}, ${env:NAME} and ${vault:path#field}.
 */
import { resolveUrl, type AccountRecipe, type ExistingAccount, type RecipeCall } from './config';
import { ENV_REF, expandSecrets } from './secrets';

export const envNamesIn = (value: unknown): string[] => [...new Set([...JSON.stringify(value ?? {}).matchAll(ENV_REF)].map((m) => m[1]))];

function fill(value: unknown, vars: Record<string, string | undefined>): unknown {
  if (typeof value === 'string') return expandSecrets(value).replace(/\$\{(\w+)\}/g, (m, n: string) => vars[n] ?? m);
  if (Array.isArray(value)) return value.map((v) => fill(v, vars));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v, vars)]));
  return value;
}
const dig = (o: unknown, dotted: string): unknown => dotted.split('.').reduce<unknown>((a, k) => (a && typeof a === 'object' ? (a as Record<string, unknown>)[k] : undefined), o);
const SECRET = /\$\{(?:env|vault):[^}]+\}/;

interface ChainStep { method?: string; path: string; headers?: Record<string, string>; json?: unknown; form?: Record<string, string>; save?: Record<string, string> }
interface InspectStep { do: string; target?: string; value?: string }

/**
 * An accounts recipe from the api-probe chain hardening already ran:
 *  - a step saving "id" (and not "token") creates the account; its body value holding ${uid} is the user name;
 *  - the step saving "token" signs in (its saved "id", if any, is where the sign-in answer carries the account id);
 *  - a DELETE removes the account.
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
  const del = chain.steps.find((s) => (s.method ?? 'GET').toUpperCase() === 'DELETE');
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
  const toUi = (v = '') => v.replace(/\$\{var:\w+\}/g, '${username}').replace(/\$\{(?:env|vault):[^}]+\}/g, '${password}');
  return {
    ...(create ? { password, ...(username ? { username } : {}), create: { ...call(create), id: create.save!.id, ...(saves(create, 'token') ? { token: create.save!.token } : {}) } } : { existing: [{ username: username!, password }] }),
    ...(token ? { token: { ...call(token), token: token.save!.token, ...(token.save!.id ? { id: token.save!.id } : {}) } } : {}),
    ...(lookup ? { lookup: { ...call(lookup), id: lookup.save!.id } } : {}),
    ...(authLine ? { authHeader: `${authLine[0]}: ${authLine[1]}` } : {}),
    ...(del && create ? { delete: call(del) } : {}),
    ...(signIn ? { signIn: { path: signIn.path, done: signIn.done, steps: signIn.steps.filter((s) => s.do === 'fill' || s.do === 'click').map((s) => (s.do === 'fill' ? { fill: s.target!, value: toUi(s.value) } : { click: s.target! })) } } : {}),
  };
}


export interface RecipeStep { step: string; ok: boolean; detail: string }

/**
 * Check the recipe live. Existing accounts: each signs in over the API (nothing is created or deleted). Created
 * accounts: create → token → delete; when the application offers no delete, nothing is created unless `createUndeletable`.
 */
export async function checkAccountRecipe(r: AccountRecipe, apiBaseURL: string, opts: { createUndeletable?: boolean } = {}): Promise<RecipeStep[]> {
  const out: RecipeStep[] = [];
  const send = async (c: RecipeCall, vars: Record<string, string | undefined>, token?: string) => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    let body: string | undefined;
    if (c.body !== undefined) { body = JSON.stringify(fill(c.body, { ...vars, token })); headers['Content-Type'] = 'application/json'; }
    else if (c.form) { body = new URLSearchParams(fill(c.form, { ...vars, token }) as Record<string, string>).toString(); headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
    if (token) {
      const line = String(fill(r.authHeader ?? 'Authorization: Bearer ${token}', { token }));
      headers[line.slice(0, line.indexOf(':')).trim()] = line.slice(line.indexOf(':') + 1).trim();
    }
    // A placeholder without a value would be sent literally (e.g. an e-mail "qa-${uid}@…"): never send that.
    const unfilled = `${fill(c.path, { ...vars, token })} ${body ?? ''}`.match(/\$\{[^}]+\}/)?.[0];
    if (unfilled) throw new Error(`${c.method} ${c.path}: ${unfilled} has no value here, so the request was not sent`);
    const res = await fetch(resolveUrl(apiBaseURL, String(fill(c.path, { ...vars, token }))), { method: c.method, headers, body, signal: AbortSignal.timeout(30_000) });
    const text = await res.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = undefined; }
    return { status: res.status, ok: res.ok, json, text };
  };
  const signInOverApi = async (vars: Record<string, string | undefined>, label: string) => {
    if (!r.token) return undefined;
    const t = await send(r.token, vars);
    const value = dig(t.json, r.token.token);
    const token = typeof value === 'string' && value ? value : undefined;
    out.push({ step: `token ${label}`, ok: Boolean(token), detail: token ? `${t.status}, signed in` : `${t.status}, no "${r.token.token}" in the answer${t.status === 401 || t.status === 400 ? ' (wrong user name or password?)' : ''}` });
    return token;
  };

  if (!r.create) {
    for (const a of r.existing ?? []) {
      const vars = { username: String(fill(a.username, {})), password: String(fill(a.password, {})), id: a.id ? String(fill(a.id, {})) : undefined };
      const unresolved = [a.username, a.password].filter((v) => /\$\{(env|vault):/.test(String(fill(v, {}))));
      if (unresolved.length) { out.push({ step: `account ${a.username}`, ok: false, detail: `not set: ${unresolved.join(', ')}` }); continue; }
      if (!r.token) { out.push({ step: `account ${a.username}`, ok: true, detail: 'credentials set; the UI sign-in is checked by the first test that signs in' }); continue; }
      const token = await signInOverApi(vars, a.username);
      if (token && !vars.id && r.lookup) {
        const l = await send(r.lookup, vars, token);
        const id = dig(l.json, r.lookup.id);
        out.push({ step: `id of ${a.username}`, ok: id !== undefined && id !== null, detail: id !== undefined && id !== null ? `${l.status}, ${r.lookup.id} found` : `${l.status}, no "${r.lookup.id}" in the answer` });
      }
    }
    return out;
  }

  if (!r.delete && !opts.createUndeletable) {
    out.push({ step: `create ${r.create.method} ${r.create.path}`, ok: true, detail: 'not run: the application offers no delete, so a check account would stay behind (heldout accounts --check --create makes one on purpose)' });
    return out;
  }
  const vars: Record<string, string | undefined> = { uid: `${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 4)}`, password: String(fill(r.password ?? '', {})) };
  vars.username = String(fill(r.username ?? 'qa-${uid}', vars));
  const created = await send(r.create, vars);
  const id = dig(created.json, r.create.id);
  out.push({ step: `create ${r.create.method} ${r.create.path}`, ok: created.ok && id !== undefined, detail: created.ok ? (id === undefined ? `${created.status}, but no "${r.create.id}" in the response` : `${created.status}, ${r.create.id} found`) : `${created.status} ${created.text.slice(0, 120)}` });
  if (!created.ok || id === undefined) return out;
  vars.id = String(id);
  const fromCreate = r.create.token ? dig(created.json, r.create.token) : undefined;
  if (r.create.token) out.push({ step: 'token from the create answer', ok: typeof fromCreate === 'string' && Boolean(fromCreate), detail: typeof fromCreate === 'string' && fromCreate ? `${r.create.token} found` : `no "${r.create.token}" in the answer` });
  const signedIn = r.token ? await signInOverApi(vars, `${r.token.method} ${r.token.path}`) : undefined;
  const token = signedIn ?? (typeof fromCreate === 'string' ? fromCreate : undefined);
  if (r.delete) {
    const d = await send(r.delete, vars, token);
    out.push({ step: `delete ${r.delete.method} ${r.delete.path}`, ok: d.ok, detail: `${d.status}${d.ok ? '' : ` ${d.text.slice(0, 120)} — the check account ${vars.username} was left behind`}` });
  } else out.push({ step: 'delete', ok: true, detail: `none in the recipe: the check account ${vars.username} stays in the application` });
  return out;
}
