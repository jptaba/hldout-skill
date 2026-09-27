/**
 * Secret references, wherever secrets are written (test-data.json, the AUT profile's accounts recipe, probe inputs):
 *
 *   ${env:NAME}                      .env (git-ignored) or a real environment variable (CI variables win over .env)
 *   ${vault:secret/qa/app#password}  HashiCorp Vault: KV v2 or v1, path as `vault kv get` takes it, #field in the secret
 *
 * Vault is reached at VAULT_ADDR (optional VAULT_NAMESPACE) with the first token found: VAULT_TOKEN, an AppRole login
 * (VAULT_ROLE_ID + VAULT_SECRET_ID), or the token file `vault login` leaves (~/.vault-token, so OIDC/SSO logins work).
 * Values are fetched once per command, kept in memory only, and never printed.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const VAULT_REF = /\$\{vault:([^}#]+)#([^}]+)\}/g;
export const ENV_REF = /\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g;

/** Every ${vault:path#field} in a value (any JSON), as "path#field". */
export const vaultRefsIn = (value: unknown): string[] => [...new Set([...JSON.stringify(value ?? '').matchAll(VAULT_REF)].map((m) => `${m[1].trim()}#${m[2].trim()}`))];

/** Values loaded for this process ("path#field" → value). */
const loaded = new Map<string, string>();

/** The loaded Vault values as a JSON map, for a child process (heldout run → Playwright) through HELDOUT_VAULT_SECRETS. */
export const loadedVaultSecrets = (): Record<string, string> => Object.fromEntries(loaded);

/** Replace ${env:…} and ${vault:…} in a string. Unknown env names are left as they are (callers report them). */
export function expandSecrets(s: string): string {
  return s.replace(ENV_REF, (m, n: string) => process.env[n] ?? m).replace(VAULT_REF, (m, p: string, f: string) => loaded.get(`${p.trim()}#${f.trim()}`) ?? m);
}

export interface VaultSettings { addr?: string; namespace?: string; token?: string; tokenSource?: string; roleId?: string; secretId?: string }

export function vaultSettings(env: NodeJS.ProcessEnv = process.env, home = os.homedir()): VaultSettings {
  const file = path.join(home, '.vault-token');
  const fileToken = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : undefined;
  const token = env.VAULT_TOKEN || (env.VAULT_ROLE_ID && env.VAULT_SECRET_ID ? undefined : fileToken);
  return {
    addr: env.VAULT_ADDR?.replace(/\/+$/, ''), namespace: env.VAULT_NAMESPACE || undefined, token,
    tokenSource: env.VAULT_TOKEN ? 'VAULT_TOKEN' : env.VAULT_ROLE_ID && env.VAULT_SECRET_ID ? 'AppRole (VAULT_ROLE_ID / VAULT_SECRET_ID)' : fileToken ? '~/.vault-token (vault login)' : undefined,
    roleId: env.VAULT_ROLE_ID, secretId: env.VAULT_SECRET_ID,
  };
}

/** KV v2 API path for a CLI-style path ("secret/qa/app" → "secret/data/qa/app"); a path that already has /data/ is kept. */
export const kv2Path = (p: string) => (/^[^/]+\/data\//.test(p) ? p : p.replace(/^([^/]+)\//, '$1/data/'));

async function vaultToken(s: VaultSettings): Promise<string> {
  if (s.token) return s.token;
  if (s.roleId && s.secretId) {
    const r = await fetch(`${s.addr}/v1/auth/approle/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(s.namespace ? { 'X-Vault-Namespace': s.namespace } : {}) },
      body: JSON.stringify({ role_id: s.roleId, secret_id: s.secretId }), signal: AbortSignal.timeout(15_000) });
    const body = await r.json().catch(() => ({})) as { auth?: { client_token?: string } };
    if (!r.ok || !body.auth?.client_token) throw new Error(`Vault AppRole login failed (HTTP ${r.status})`);
    return body.auth.client_token;
  }
  throw new Error('no Vault token: set VAULT_TOKEN, or VAULT_ROLE_ID + VAULT_SECRET_ID (AppRole), or run `vault login` once');
}

/**
 * Fetch the ${vault:…} references found in the given values into memory. Returns one problem per reference that
 * could not be read (the path, the field and why — never a value). Nothing to do when there are no references.
 */
export async function loadVaultSecrets(values: unknown[], env: NodeJS.ProcessEnv = process.env): Promise<string[]> {
  const refs = values.flatMap(vaultRefsIn).filter((r) => !loaded.has(r));
  if (!refs.length) return [];
  const s = vaultSettings(env);
  if (!s.addr) return [`${refs.length} \${vault:…} reference(s) but VAULT_ADDR is not set (add it to .env, e.g. VAULT_ADDR=https://vault.example.com)`];
  let token: string;
  try { token = await vaultToken(s); } catch (e) { return [(e as Error).message]; }
  const headers = { 'X-Vault-Token': token, ...(s.namespace ? { 'X-Vault-Namespace': s.namespace } : {}) };
  type KvBody = { data?: Record<string, unknown> & { data?: Record<string, unknown> } };
  const read = async (apiPath: string): Promise<{ status: number; body: KvBody }> => {
    try {
      const r = await fetch(`${s.addr}/v1/${apiPath}`, { headers, signal: AbortSignal.timeout(15_000) });
      return { status: r.status, body: await r.json().catch(() => ({})) as KvBody };
    } catch { return { status: 0, body: {} }; }
  };
  const byPath = new Map<string, { fields?: Record<string, unknown>; error?: string }>();
  const problems: string[] = [];
  for (const ref of refs) {
    const [p, field] = ref.split('#');
    if (!byPath.has(p)) {
      const v2 = await read(kv2Path(p));
      let entry: { fields?: Record<string, unknown>; error?: string };
      if (v2.status === 200 && v2.body.data?.data) entry = { fields: v2.body.data.data };
      else {
        const v1 = await read(p);
        entry = v1.status === 200 && v1.body.data ? { fields: v1.body.data }
          : { error: v2.status === 403 || v1.status === 403 ? 'permission denied (check the token\'s policy)' : v2.status === 0 ? `Vault unreachable at ${s.addr}` : 'no such secret (KV v2 or v1)' };
      }
      byPath.set(p, entry);
    }
    const entry = byPath.get(p)!;
    const value = entry.fields?.[field];
    if (entry.error) problems.push(`\${vault:${ref}}: ${entry.error}`);
    else if (typeof value !== 'string' && typeof value !== 'number') problems.push(`\${vault:${ref}}: the secret at ${p} has no field "${field}" (fields: ${Object.keys(entry.fields ?? {}).join(', ') || 'none'})`);
    else loaded.set(ref, String(value));
  }
  return problems;
}

/** Load, and throw one readable error if anything is missing (for commands that can't continue without the values). */
export async function requireVaultSecrets(values: unknown[]): Promise<void> {
  const problems = await loadVaultSecrets(values);
  if (problems.length) throw new Error(`Vault: ${problems.join('; ')}`);
}
