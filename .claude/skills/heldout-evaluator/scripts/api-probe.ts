/**
 * API probe — hardening + live confirmation tool for API scenarios (the API counterpart of inspect.ts).
 *
 *   heldout api-probe [--key KEY | --aut <profile>] <METHOD> <path>
 *       [--data '<json>' | --data-file body.json | --raw-data '<string>' | --form 'a=1&b=2' or --form '{"a":1}']   (values support ${env:NAME})
 *   heldout api-probe [--key KEY] --chain chain.json [--out repro.md]   multi-call sequence, chain.json =
 *       { "steps": [ { "name", "method", "path", "headers"?, "json"? | "form"? | "raw"?, "save"?: { "token": "data.token" },
 *                      "expect"?: 201 | [200, 201], "expectBody"?: { "code": "1200" }, "show"?: ["books", "token|jwt"],
 *                      "notContains"?: [{ "field": "token", "decode": "jwt", "value": "${env:PASSWORD}" }], "setup"?: true, "parallel"?: 3 } ] }
 *       ${token} reads a saved value, ${uid} is unique per chain, ${env:NAME} a secret (redacted in the report);
 *       "save" paths are relative to the answer's body ("id", "data.0.id", "data.token")
 *       [--header "Name: value"]... [--cookie "name=value"]...
 *       [--login '{"method":"POST","path":"api/auth/login","data":{...},"extract":"token","as":"cookie:token"}']
 *       [--repeat N] [--out report.md] [--json] [--body-limit N]   (report shows the first N body characters; default 4000)
 *
 * Paths resolve against the profile's apiBaseURL. Under Git Bash omit the leading "/" (api/room), or
 * set MSYS_NO_PATHCONV=1 — MSYS rewrites "/…" arguments into Windows paths.
 * Prints status, timing, redacted headers, body and a type *shape* (write schema assertions from the
 * requirement + shape, never by copying AUT values into expectations).
 */
import fs from 'node:fs';
import { flagList, flagStr, loadConfig, main, parseArgs, resolveUrl, writeFile } from './lib/config';
import { literalsOf, redact, redactHeaders, shapeOf } from './lib/redact';
import { expandSecrets, loadedVaultSecrets, requireVaultSecrets } from './lib/secrets';

/** ${env:NAME} and ${vault:path#field} (read at the start of the command) → their values. */
const env = (s: string) => {
  const out = expandSecrets(s);
  const missing = out.match(/\$\{(env|vault):[^}]+\}/)?.[0];
  if (missing) throw new Error(`${missing} is not set (.env, the environment or Vault)`);
  return out;
};

/** A path with a secret reference: the value is URL-encoded into the request, and shown as *** in every report. */
const envPath = (s: string) => s.replace(/\$\{(?:env|vault):[^}]+\}/g, (m) => encodeURIComponent(env(m)));
const maskEnv = (s: string) => s.replace(/\$\{(?:env|vault):[^}]+\}/g, '***');
/** Last line of defence: the value of every secret reference the input mentions never reaches a report, raw or encoded. */
function scrubEnv(report: string, input: string): string {
  const values = [...new Set([...[...input.matchAll(/\$\{(?:env|vault):[^}]+\}/g)].map((m) => expandSecrets(m[0])).filter((v) => !v.startsWith('${')),
    ...Object.values(loadedVaultSecrets())].filter((v) => v.length >= 3))];
  return values.flatMap((v) => [v, encodeURIComponent(v)]).reduce((acc, v) => acc.split(v).join('***redacted***'), report);
}

interface Login { method?: string; path: string; data?: unknown; extract: string; as: string }

async function send(url: string, method: string, headers: Record<string, string>, body?: string) {
  const started = Date.now();
  const res = await fetch(url, { method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(30_000) });
  const text = await res.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, ms: Date.now() - started, headers: Object.fromEntries(res.headers.entries()), text, json };
}

/** Redacted view of a request body: JSON → redacted object; form-encoded → redacted query string; else raw. */
function redactBody(body: string, contentType = ''): unknown {
  if (/x-www-form-urlencoded/.test(contentType)) return new URLSearchParams(Object.entries(redact(Object.fromEntries(new URLSearchParams(body))) as Record<string, string>)).toString();
  try { return redact(JSON.parse(body)); } catch { return body; }
}

// "data.-1" is the last element of an array (a record just added to a list).
const dig = (obj: unknown, dotted: string) => dotted.split('.').reduce<unknown>((o, k) => (Array.isArray(o) && /^-\d+$/.test(k) ? o[o.length + Number(k)]
  : o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);

/**
 * --chain chain.json: a reproducible multi-call sequence (pre-steps + the call under test), e.g. for live
 * confirmation of a finding. Values `${name}` come from "vars", from earlier steps' "save", from `${env:NAME}`,
 * and `${uid}` (unique per chain run). "form" sends application/x-www-form-urlencoded; "setup": true marks
 * pre-steps (listed, but not the evidence). "expect" (status or list) marks each step ✔/✖; "expectBody"
 * ({ "dotted.path": value }) does the same for body fields — for APIs that answer HTTP 200 and put the outcome
 * in the body (e.g. { "responseCode": 400 }).
 *   { "vars": {...}, "steps": [ { "name", "method", "path", "headers"?, "json"? | "form"? | "raw"?, "save"?: { "var": "dotted.path" }, "expect"?: 201, "setup"?: true, "show"?: ["total", "data.length", "token|jwt", "header:content-type"] } ] }   (a 3xx always shows its Location; "data.-1" is an array's last element)
 * "field|jwt" / "field|base64" decodes a field before showing it (secret-named keys stay redacted).
 * "notContains": [{ "field": "token", "decode"?: "jwt", "value": "${env:PASSWORD}" }] checks a value does NOT appear
 * in a field (a leak check) without ever printing the value; a hit marks the step ✖.
 * "parallel": N sends the step N times at the same moment (reproducing a concurrency finding); every status is listed,
 * "expect" must hold for each, and "save" / "show" read the first answer.
 */
interface NotContains { field: string; decode?: 'jwt' | 'base64'; value: string }
interface ChainStep { name?: string; method?: string; path: string; headers?: Record<string, string>; json?: unknown; form?: Record<string, string>; raw?: string; save?: Record<string, string>; expect?: number | number[]; expectBody?: Record<string, unknown>; setup?: boolean; show?: string[]; notContains?: NotContains[]; parallel?: number }

const b64 = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
const parsed = (s: string): unknown => { try { return JSON.parse(s); } catch { return s; } };
/** A JWT as its decoded parts (the signature is left encoded); anything else decoded as base64. */
function decode(v: unknown, how?: string): unknown {
  if (typeof v !== 'string' || !how) return v;
  if (how === 'jwt') { const [h, p, sig] = v.split('.'); return { header: parsed(b64(h ?? '')), payload: parsed(b64(p ?? '')), signature: sig ?? '' }; }
  return parsed(b64(v));
}
async function runChain(file: string, base: string, cfgName: string, outFile?: string): Promise<void> {
  const chain = JSON.parse(fs.readFileSync(file, 'utf8')) as { vars?: Record<string, unknown>; steps: ChainStep[] };
  const vars: Record<string, string> = { uid: `${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 5)}` };
  const interpVars = (s: string): string => s.replace(/\$\{([A-Za-z_][\w]*)\}/g, (m, n: string) => (vars[n] !== undefined ? vars[n] : m));
  const interp = (s: string): string => interpVars(env(s));
  // A body value that is exactly "${name}" keeps the saved value's JSON type ({"BasketId": "${bid}"} sends 6, not "6").
  const typed: Record<string, unknown> = {};
  const whole = (s: string) => s.match(/^\$\{([A-Za-z_][\w]*)\}$/)?.[1];
  const deep = (v: unknown): unknown => (typeof v === 'string' ? (whole(v) !== undefined && typed[whole(v)!] !== undefined ? typed[whole(v)!] : interp(v))
    : Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : v);
  for (const [k, v] of Object.entries(chain.vars ?? {})) { if (typeof v === 'string') vars[k] = interp(v); else { vars[k] = String(v); typed[k] = v; } }
  const lines = [`# API chain — ${file}`, '', `- AUT: ${cfgName} · ${base} · captured ${new Date().toISOString()}`, ''];
  let failed = 0;
  for (const [i, s] of chain.steps.entries()) {
    const method = (s.method ?? 'GET').toUpperCase();
    const url = resolveUrl(base, envPath(interpVars(s.path)));
    const shownUrl = new URL(resolveUrl(base, maskEnv(interpVars(s.path))));
    const headers: Record<string, string> = { Accept: 'application/json', ...(deep(s.headers ?? {}) as Record<string, string>) };
    let body: string | undefined;
    if (s.json !== undefined) { body = JSON.stringify(deep(s.json)); headers['Content-Type'] ??= 'application/json'; }
    else if (s.form) { body = new URLSearchParams(deep(s.form) as Record<string, string>).toString(); headers['Content-Type'] ??= 'application/x-www-form-urlencoded'; }
    else if (s.raw !== undefined) body = interp(s.raw);
    // A value an earlier step should have saved but didn't: never send "${id}" literally.
    const unfilled = [...new Set([...JSON.stringify([s.path, s.headers ?? null, body ?? null]).matchAll(/\$\{([A-Za-z_]\w*)\}/g)].map((m) => m[1]).filter((n) => vars[n] === undefined))];
    if (unfilled.length) {
      failed++;
      lines.push(`${i + 1}. **${s.name ?? `step ${i + 1}`}** — \`${method} ${s.path}\` → not sent: ${unfilled.map((n) => `\${${n}}`).join(', ')} has no value (the step that saves it failed or didn't run)`, '');
      continue;
    }
    // "parallel": N sends the same call N times at once (a concurrency finding); save and show read the first answer.
    const copies = Math.max(1, Math.floor(s.parallel ?? 1));
    const all = await Promise.all(Array.from({ length: copies }, () => send(url, method, headers, body)));
    const r = all[0];
    // A save path is read from the answer's body ("id", "data.0.id", "token"); one that finds nothing is said here, where
    // it happened, since every later step that needs the value is then not sent.
    const missedSaves: string[] = [];
    for (const [name, dotted] of Object.entries(s.save ?? {})) {
      const v = dig(r.json, dotted);
      if (v === undefined) { missedSaves.push(`${name} ← "${dotted}"`); continue; }
      vars[name] = String(v);
      if (typeof v === 'number' || typeof v === 'boolean') typed[name] = v; else delete typed[name];
    }
    const exp = s.expect === undefined ? undefined : ([] as number[]).concat(s.expect);
    const checks = (s.notContains ?? []).map((c) => {
      const d = decode(dig(r.json, c.field), c.decode);
      const parts = d && typeof d === 'object' && c.decode === 'jwt' ? Object.entries(d as Record<string, unknown>) : [['value', d] as const];
      const secret = interp(c.value);
      const hits = secret ? parts.filter(([, x]) => JSON.stringify(x ?? '').includes(secret)).map(([k]) => k) : [];
      return `\`${c.field}\`${c.decode ? ` (${c.decode})` : ''} ${hits.length ? `✖ contains ${c.value} in: ${hits.join(', ')}` : `does not contain ${c.value} ✔`}`;
    });
    const bodyMisses = Object.entries(s.expectBody ?? {}).filter(([f, want]) => JSON.stringify(dig(r.json, f)) !== JSON.stringify(deep(want)))
      .map(([f, want]) => `\`${f}\` ✖ expected ${JSON.stringify(redact(deep(want)))}, got ${JSON.stringify(redact(dig(r.json, f)))}`);
    if (s.expectBody && !bodyMisses.length) checks.push(`body ${Object.keys(s.expectBody).map((f) => `\`${f}\``).join(', ')} as expected ✔`);
    checks.push(...bodyMisses);
    if (missedSaves.length) checks.push(`save ✖ nothing at ${missedSaves.join(', ')} in the answer's body (paths are relative to the body, e.g. "id", "data.0.id")`);
    const statusOk = !exp || all.every((x) => exp.includes(x.status));
    const ok = statusOk && !checks.some((l) => l.includes('✖'));
    if (!ok) failed++;
    let shownBody = body ?? '';
    // The step's own literal values stay readable (a deliberately short test password is the point of the call).
    const literals = literalsOf(s.json ?? s.form);
    try { shownBody = s.form ? new URLSearchParams(Object.entries(redact(Object.fromEntries(new URLSearchParams(body)), { keep: literals }) as Record<string, string>)).toString() : JSON.stringify(redact(JSON.parse(body ?? ''), { keep: literals })); } catch { /* raw */ }
    const resp = r.json !== undefined ? JSON.stringify(redact(r.json)) : r.text;
    lines.push(`${i + 1}. ${s.setup ? '_(setup)_ ' : ''}${s.name ? `**${s.name}** — ` : ''}\`${method} ${shownUrl.pathname}${shownUrl.search}\`${body ? ` body \`${shownBody.slice(0, 200)}\`` : ''}${copies > 1 ? ` ×${copies} at once` : ''} → **${copies > 1 ? all.map((x) => x.status).join(', ') : r.status}**${exp ? (!statusOk ? ` ✖ expected ${exp.join('/')}` : ok ? ' ✔' : ' ✔ status (✖ below)') : ''} (${r.ms} ms)`);
    // "show": the fields that matter as evidence (dotted paths; "data.length" counts arrays) — large bodies get truncated otherwise.
    // A redirect is its Location header: always show it (or its absence). "header:<name>" in show reads any header.
    if (r.status >= 300 && r.status < 400) lines.push(`   \`Location\` = \`${r.headers.location ?? '(none)'}\``);
    if (s.show?.length) lines.push(`   ${s.show.map((f) => {
      const [field, how] = f.split('|');
      if (field.startsWith('header:')) return `\`${f}\` = \`${JSON.stringify(redactHeaders({ [field.slice(7)]: r.headers[field.slice(7).toLowerCase()] ?? '(none)' })[field.slice(7)])}\``;
      const v = field.endsWith('.length') ? (dig(r.json, field.slice(0, -7)) as unknown[] | undefined)?.length : decode(dig(r.json, field), how);
      return `\`${f}\` = \`${JSON.stringify(redact(v))}\``;
    }).join(' · ')}`);
    else lines.push(`   \`${resp.replace(/\s+/g, ' ').slice(0, 300).replace(/`/g, "'")}\``);
    if (checks.length) lines.push(`   ${checks.join(' · ')}`);
  }
  lines.push('', failed ? `**${failed} step(s) did not meet their expectation (status, expectBody or notContains).**` : 'All expectations held.', '');
  const out = scrubEnv(lines.join('\n'), fs.readFileSync(file, 'utf8'));
  if (outFile) { writeFile(outFile, out); console.log(`✔ chain of ${chain.steps.length} call(s) → ${outFile}${failed ? ` (${failed} unexpected)` : ''}`); } else console.log(out);
}

main(async () => {
  const { _, flags } = parseArgs();
  const bodyLimit = Number(flagStr(flags, 'body-limit') ?? 4000);
  const chainFile = flagStr(flags, 'chain');
  await requireVaultSecrets([process.argv.slice(2).join(' '), chainFile && fs.existsSync(chainFile) ? fs.readFileSync(chainFile, 'utf8') : '']);
  if (chainFile) {
    const cfg = loadConfig({ key: flagStr(flags, 'key'), aut: flagStr(flags, 'aut') });
    await runChain(chainFile, cfg.aut.apiBaseURL ?? cfg.aut.baseURL, `${cfg.aut.name} (profile \`${cfg.autId}\`)`, flagStr(flags, 'out'));
    return;
  }
  const [methodArg, pathArg] = _;
  if (!methodArg || pathArg === undefined) throw new Error('Usage: api-probe.ts <METHOD> <path> [options]   or   api-probe.ts --chain chain.json');
  const method = methodArg.toUpperCase();
  const cfg = loadConfig({ key: flagStr(flags, 'key'), aut: flagStr(flags, 'aut') });
  const base = cfg.aut.apiBaseURL ?? cfg.aut.baseURL;
  const url = resolveUrl(base, envPath(pathArg));
  const shownUrl = resolveUrl(base, maskEnv(pathArg));

  const headers: Record<string, string> = { Accept: 'application/json' };
  for (const h of flagList(flags, 'header')) { const i = h.indexOf(':'); headers[h.slice(0, i).trim()] = env(h.slice(i + 1).trim()); }
  const cookies = flagList(flags, 'cookie').map(env);

  const loginSpec = flagStr(flags, 'login');
  if (loginSpec) {
    const login = JSON.parse(env(loginSpec)) as Login;
    const r = await send(resolveUrl(base, login.path), (login.method ?? 'POST').toUpperCase(), { 'Content-Type': 'application/json', Accept: 'application/json' }, JSON.stringify(login.data ?? {}));
    const token = dig(r.json, login.extract);
    if (typeof token !== 'string') throw new Error(`Login returned ${r.status}; no "${login.extract}" in the body`);
    const [kind, name, prefix] = login.as.split(':');
    if (kind === 'cookie') cookies.push(`${name}=${token}`);
    else headers[name] = prefix ? `${prefix} ${token}` : token;
    console.error(`(login ${login.path} → ${r.status}; token applied as ${kind} ${name})`);
  }
  if (cookies.length) headers.Cookie = cookies.join('; ');

  let body: string | undefined;
  const dataFile = flagStr(flags, 'data-file');
  if (flagStr(flags, 'raw-data') !== undefined) body = env(flagStr(flags, 'raw-data')!);
  else if (dataFile) body = env(fs.readFileSync(dataFile, 'utf8'));
  else if (flagStr(flags, 'data') !== undefined) body = env(flagStr(flags, 'data')!);
  else if (flagStr(flags, 'form') !== undefined) {
    // --form 'a=1&b=2' or --form '{"a":"1"}' → application/x-www-form-urlencoded
    const f = env(flagStr(flags, 'form')!);
    body = f.trim().startsWith('{') ? new URLSearchParams(JSON.parse(f) as Record<string, string>).toString() : f;
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  if (body !== undefined) headers['Content-Type'] ??= 'application/json';

  const repeat = Number(flagStr(flags, 'repeat') ?? 1);
  const results = [];
  for (let i = 0; i < repeat; i++) results.push(await send(url, method, headers, body));
  const r = results.at(-1)!;
  const input = [...process.argv.slice(2), dataFile ? fs.readFileSync(dataFile, 'utf8') : ''].join(' ');

  if (flags.json) {
    console.log(scrubEnv(JSON.stringify({ request: { method, url: shownUrl, headers: redactHeaders(headers), body: body && redactBody(body, headers['Content-Type']) }, response: { status: r.status, ms: r.ms, headers: redactHeaders(r.headers), body: r.json !== undefined ? redact(r.json) : r.text } }, null, 2), input));
    return;
  }
  let reqBody = body ?? '';
  if (body !== undefined) { const b = redactBody(body, headers['Content-Type']); reqBody = typeof b === 'string' ? b : JSON.stringify(b, null, 2); }
  const pretty = r.json !== undefined ? JSON.stringify(redact(r.json), null, 2) : r.text;
  // A clipped body hides what often sits at its end (paging: total, per_page, last_page): its top-level values in full.
  const redacted = r.json !== undefined ? redact(r.json) : undefined;
  const topLevel = pretty.length > bodyLimit && redacted && typeof redacted === 'object' && !Array.isArray(redacted)
    ? Object.entries(redacted as Record<string, unknown>).filter(([, v]) => v === null || typeof v !== 'object').map(([k, v]) => `${k}: ${JSON.stringify(v)}`) : [];
  const out = scrubEnv([
    `# API probe — ${method} ${shownUrl}`, '',
    `- AUT: ${cfg.aut.name} (profile \`${cfg.autId}\`) · captured ${new Date().toISOString()}`,
    `- Status: **${r.status}**${repeat > 1 ? ` (all runs: ${results.map((x) => x.status).join(', ')})` : ''}`,
    `- Time: ${r.ms} ms${repeat > 1 ? ` (min ${Math.min(...results.map((x) => x.ms))} / max ${Math.max(...results.map((x) => x.ms))})` : ''}`,
    `- Content-Type: ${r.headers['content-type'] ?? '-'}`, '',
    ...(body !== undefined ? ['## Request body', '', '```json', reqBody, '```', ''] : []),
    '## Response headers (redacted)', '', '```json', JSON.stringify(redactHeaders(r.headers), null, 2), '```', '',
    `## Response body (redacted${pretty.length > bodyLimit ? `, first ${bodyLimit} of ${pretty.length} chars; --body-limit N for more` : ''})`, '', '```json', pretty.slice(0, bodyLimit), '```', '',
    ...(topLevel.length ? ['## Top-level values (the clipped body in brief)', '', ...topLevel.map((x) => `- ${x}`), ''] : []),
    ...(r.json !== undefined ? ['## Shape (types only)', '', '```json', JSON.stringify(shapeOf(r.json), null, 2), '```', ''] : []),
  ].join('\n'), input);
  const file = flagStr(flags, 'out');
  if (file) { writeFile(file, out); console.log(`✔ ${method} ${shownUrl} → ${r.status} (${r.ms} ms) — written to ${file}`); } else console.log(out);
});
