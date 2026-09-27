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
