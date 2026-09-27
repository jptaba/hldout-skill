/**
 * The AUT profile's `accounts` recipe, checked live: create an account, sign in over the API, delete it. The same
 * steps seed.account() takes in a test, so a broken recipe shows up in `heldout doctor`, not as BLOCKED scenarios.
 */
import { resolveUrl, type AccountRecipe, type RecipeCall } from './config';

export const envNamesIn = (value: unknown): string[] => [...new Set([...JSON.stringify(value ?? {}).matchAll(/\$\{env:(\w+)\}/g)].map((m) => m[1]))];

function fill(value: unknown, vars: Record<string, string | undefined>): unknown {
  if (typeof value === 'string') return value.replace(/\$\{env:(\w+)\}/g, (_, n: string) => process.env[n] ?? '').replace(/\$\{(\w+)\}/g, (m, n: string) => vars[n] ?? m);
  if (Array.isArray(value)) return value.map((v) => fill(v, vars));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v, vars)]));
  return value;
}
const dig = (o: unknown, dotted: string): unknown => dotted.split('.').reduce<unknown>((a, k) => (a && typeof a === 'object' ? (a as Record<string, unknown>)[k] : undefined), o);

interface ChainStep { method?: string; path: string; headers?: Record<string, string>; json?: unknown; form?: Record<string, string>; save?: Record<string, string> }
interface InspectStep { do: string; target?: string; value?: string }

/**
 * An accounts recipe from an api-probe chain that made an account: the step saving `id` creates it, the step saving
 * `token` signs in, a DELETE removes it. The value holding ${uid} becomes ${username}, the ${env:…} one ${password}.
 * Optional UI sign-in from inspect steps (fill/click; ${var:…} → ${username}, ${env:…} → ${password}).
 */
export function recipeFromChain(chain: { steps: ChainStep[] }, signIn?: { path: string; steps: InspectStep[]; done?: string }): AccountRecipe {
  const create = chain.steps.find((s) => s.save && 'id' in s.save);
  if (!create) throw new Error('no chain step saves "id" (the new account\'s id), e.g. "save": { "id": "userID" }');
  const token = chain.steps.find((s) => s.save && 'token' in s.save);
  const del = chain.steps.find((s) => (s.method ?? 'GET').toUpperCase() === 'DELETE');
  const flat = JSON.stringify(create.json ?? create.form ?? {});
  const password = flat.match(/\$\{env:\w+\}/)?.[0];
  if (!password) throw new Error('the create step\'s body has no ${env:NAME} password');
  const username = [...flat.matchAll(/"([^"]*\$\{uid\}[^"]*)"/g)][0]?.[1];
  const swap = (v: unknown): unknown => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)
    .split(password).join('${password}').split(username ?? '\u0000').join('${username}')));
  const call = (s: ChainStep): RecipeCall => ({ method: (s.method ?? 'GET').toUpperCase(), path: `/${s.path.replace(/^\/+/, '')}`,
    ...(s.json !== undefined ? { body: swap(s.json) } : {}), ...(s.form ? { form: swap(s.form) as Record<string, string> } : {}) });
  const authLine = Object.entries(del?.headers ?? {}).find(([, v]) => v.includes('${token}'));
  const toUi = (v = '') => v.replace(/\$\{var:\w+\}/g, '${username}').replace(/\$\{env:\w+\}/g, '${password}');
  return {
    password,
    ...(username ? { username } : {}),
    create: { ...call(create), id: create.save!.id },
    ...(token ? { token: { ...call(token), token: token.save!.token } } : {}),
    ...(authLine ? { authHeader: `${authLine[0]}: ${authLine[1]}` } : {}),
    ...(del ? { delete: call(del) } : {}),
    ...(signIn ? { signIn: { path: signIn.path, done: signIn.done, steps: signIn.steps.filter((s) => s.do === 'fill' || s.do === 'click').map((s) => (s.do === 'fill' ? { fill: s.target!, value: toUi(s.value) } : { click: s.target! })) } } : {}),
  };
}

export interface RecipeStep { step: string; ok: boolean; detail: string }

export async function checkAccountRecipe(r: AccountRecipe, apiBaseURL: string): Promise<RecipeStep[]> {
  const vars: Record<string, string | undefined> = { uid: `${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 4)}`, password: String(fill(r.password, {})) };
  vars.username = String(fill(r.username ?? 'qa-${uid}', vars));
  const out: RecipeStep[] = [];
  const send = async (name: string, c: RecipeCall, token?: string) => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    let body: string | undefined;
    if (c.body !== undefined) { body = JSON.stringify(fill(c.body, { ...vars, token })); headers['Content-Type'] = 'application/json'; }
    else if (c.form) { body = new URLSearchParams(fill(c.form, { ...vars, token }) as Record<string, string>).toString(); headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
    if (token) {
      const line = String(fill(r.authHeader ?? 'Authorization: Bearer ${token}', { token }));
      headers[line.slice(0, line.indexOf(':')).trim()] = line.slice(line.indexOf(':') + 1).trim();
    }
    const res = await fetch(resolveUrl(apiBaseURL, String(fill(c.path, { ...vars, token }))), { method: c.method, headers, body, signal: AbortSignal.timeout(30_000) });
    const text = await res.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = undefined; }
    return { name, status: res.status, ok: res.ok, json, text };
  };
  const created = await send('create', r.create);
  const id = dig(created.json, r.create.id);
  out.push({ step: `create ${r.create.method} ${r.create.path}`, ok: created.ok && id !== undefined, detail: created.ok ? (id === undefined ? `${created.status}, but no "${r.create.id}" in the response` : `${created.status}, ${r.create.id} found`) : `${created.status} ${created.text.slice(0, 120)}` });
  if (!created.ok || id === undefined) return out;
  vars.id = String(id);
  let token: string | undefined;
  if (r.token) {
    const t = await send('token', r.token);
    const value = dig(t.json, r.token.token);
    token = typeof value === 'string' && value ? value : undefined;
    out.push({ step: `token ${r.token.method} ${r.token.path}`, ok: Boolean(token), detail: token ? `${t.status}, ${r.token.token} found` : `${t.status}, no "${r.token.token}" in the response` });
  }
  if (r.delete) {
    const d = await send('delete', r.delete, token);
    out.push({ step: `delete ${r.delete.method} ${r.delete.path}`, ok: d.ok, detail: `${d.status}${d.ok ? '' : ` ${d.text.slice(0, 120)} — the check account ${vars.username} was left behind`}` });
  }
  return out;
}
