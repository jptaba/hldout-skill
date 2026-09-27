/**
 * API probe — hardening + live confirmation tool for API scenarios (the API counterpart of inspect.ts).
 *
 *   heldout api-probe [--key KEY | --aut <profile>] <METHOD> <path>
 *       [--data '<json>' | --data-file body.json | --raw-data '<string>' | --form 'a=1&b=2']   (values support ${env:NAME})
 *   heldout api-probe [--key KEY] --chain chain.json [--out repro.md]   (multi-call sequence; see runChain)
 *       [--header "Name: value"]... [--cookie "name=value"]...
 *       [--login '{"method":"POST","path":"api/auth/login","data":{...},"extract":"token","as":"cookie:token"}']
 *       [--repeat N] [--out report.md] [--json]
 *
 * Paths resolve against the profile's apiBaseURL. Under Git Bash omit the leading "/" (api/room), or
 * set MSYS_NO_PATHCONV=1 — MSYS rewrites "/…" arguments into Windows paths.
 * Prints status, timing, redacted headers, body and a type *shape* (write schema assertions from the
 * requirement + shape, never by copying AUT values into expectations).
 */
import fs from 'node:fs';
import { flagList, flagStr, loadConfig, main, parseArgs, resolveUrl, writeFile } from './lib/config';
import { redact, redactHeaders, shapeOf } from './lib/redact';

const env = (s: string) => s.replace(/\$\{env:(\w+)\}/g, (_, n: string) => {
  if (process.env[n] === undefined) throw new Error(`\${env:${n}} is not set (.env)`);
  return process.env[n]!;
});

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

const dig = (obj: unknown, dotted: string) => dotted.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);

/**
 * --chain chain.json: a reproducible multi-call sequence (pre-steps + the call under test), e.g. for live
 * confirmation of a finding. Values `${name}` come from "vars", from earlier steps' "save", from `${env:NAME}`,
 * and `${uid}` (unique per chain run). "form" sends application/x-www-form-urlencoded; "setup": true marks
 * pre-steps (listed, but not the evidence). "expect" (status or list) marks each step ✔/✖.
 *   { "vars": {...}, "steps": [ { "name", "method", "path", "headers"?, "json"? | "form"? | "raw"?, "save"?: { "var": "dotted.path" }, "expect"?: 201, "setup"?: true, "show"?: ["total", "data.length"] } ] }
 */
interface ChainStep { name?: string; method?: string; path: string; headers?: Record<string, string>; json?: unknown; form?: Record<string, string>; raw?: string; save?: Record<string, string>; expect?: number | number[]; setup?: boolean; show?: string[] }
async function runChain(file: string, base: string, cfgName: string, outFile?: string): Promise<void> {
  const chain = JSON.parse(fs.readFileSync(file, 'utf8')) as { vars?: Record<string, string>; steps: ChainStep[] };
  const vars: Record<string, string> = { uid: `${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 5)}` };
  const interp = (s: string): string => env(s).replace(/\$\{([A-Za-z_][\w]*)\}/g, (m, n: string) => (vars[n] !== undefined ? vars[n] : m));
  const deep = (v: unknown): unknown => (typeof v === 'string' ? interp(v) : Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : v);
  for (const [k, v] of Object.entries(chain.vars ?? {})) vars[k] = interp(v);
  const lines = [`# API chain — ${file}`, '', `- AUT: ${cfgName} · ${base} · captured ${new Date().toISOString()}`, ''];
  let failed = 0;
  for (const [i, s] of chain.steps.entries()) {
    const method = (s.method ?? 'GET').toUpperCase();
    const url = resolveUrl(base, interp(s.path));
    const headers: Record<string, string> = { Accept: 'application/json', ...(deep(s.headers ?? {}) as Record<string, string>) };
    let body: string | undefined;
    if (s.json !== undefined) { body = JSON.stringify(deep(s.json)); headers['Content-Type'] ??= 'application/json'; }
    else if (s.form) { body = new URLSearchParams(deep(s.form) as Record<string, string>).toString(); headers['Content-Type'] ??= 'application/x-www-form-urlencoded'; }
    else if (s.raw !== undefined) body = interp(s.raw);
    const r = await send(url, method, headers, body);
    for (const [name, dotted] of Object.entries(s.save ?? {})) { const v = dig(r.json, dotted); if (v !== undefined) vars[name] = String(v); }
    const exp = s.expect === undefined ? undefined : ([] as number[]).concat(s.expect);
    const ok = !exp || exp.includes(r.status);
    if (!ok) failed++;
    let shownBody = body ?? '';
    try { shownBody = s.form ? new URLSearchParams(Object.entries(redact(Object.fromEntries(new URLSearchParams(body))) as Record<string, string>)).toString() : JSON.stringify(redact(JSON.parse(body ?? ''))); } catch { /* raw */ }
    const resp = r.json !== undefined ? JSON.stringify(redact(r.json)) : r.text;
    lines.push(`${i + 1}. ${s.setup ? '_(setup)_ ' : ''}${s.name ? `**${s.name}** — ` : ''}\`${method} ${new URL(url).pathname}${new URL(url).search}\`${body ? ` body \`${shownBody.slice(0, 200)}\`` : ''} → **${r.status}**${exp ? (ok ? ' ✔' : ` ✖ expected ${exp.join('/')}`) : ''} (${r.ms} ms)`);
    // "show": the fields that matter as evidence (dotted paths; "data.length" counts arrays) — large bodies get truncated otherwise.
    if (s.show?.length) lines.push(`   ${s.show.map((f) => { const v = f.endsWith('.length') ? (dig(r.json, f.slice(0, -7)) as unknown[] | undefined)?.length : dig(r.json, f); return `\`${f}\` = \`${JSON.stringify(redact(v))}\``; }).join(' · ')}`);
    else lines.push(`   \`${resp.replace(/\s+/g, ' ').slice(0, 300).replace(/`/g, "'")}\``);
  }
  lines.push('', failed ? `**${failed} step(s) did not return the expected status.**` : 'All expectations held.', '');
  const out = lines.join('\n');
  if (outFile) { writeFile(outFile, out); console.log(`✔ chain of ${chain.steps.length} call(s) → ${outFile}${failed ? ` (${failed} unexpected)` : ''}`); } else console.log(out);
}

main(async () => {
  const { _, flags } = parseArgs();
  const chainFile = flagStr(flags, 'chain');
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
  const url = resolveUrl(base, pathArg);

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

  if (flags.json) {
    console.log(JSON.stringify({ request: { method, url, headers: redactHeaders(headers), body: body && redactBody(body, headers['Content-Type']) }, response: { status: r.status, ms: r.ms, headers: redactHeaders(r.headers), body: r.json !== undefined ? redact(r.json) : r.text } }, null, 2));
    return;
  }
  let reqBody = body ?? '';
  if (body !== undefined) { const b = redactBody(body, headers['Content-Type']); reqBody = typeof b === 'string' ? b : JSON.stringify(b, null, 2); }
  const pretty = r.json !== undefined ? JSON.stringify(redact(r.json), null, 2) : r.text;
  const out = [
    `# API probe — ${method} ${url}`, '',
    `- AUT: ${cfg.aut.name} (profile \`${cfg.autId}\`) · captured ${new Date().toISOString()}`,
    `- Status: **${r.status}**${repeat > 1 ? ` (all runs: ${results.map((x) => x.status).join(', ')})` : ''}`,
    `- Time: ${r.ms} ms${repeat > 1 ? ` (min ${Math.min(...results.map((x) => x.ms))} / max ${Math.max(...results.map((x) => x.ms))})` : ''}`,
    `- Content-Type: ${r.headers['content-type'] ?? '-'}`, '',
    ...(body !== undefined ? ['## Request body', '', '```json', reqBody, '```', ''] : []),
    '## Response headers (redacted)', '', '```json', JSON.stringify(redactHeaders(r.headers), null, 2), '```', '',
    '## Response body (redacted, first 4000 chars)', '', '```json', pretty.slice(0, 4000), '```', '',
    ...(r.json !== undefined ? ['## Shape (types only)', '', '```json', JSON.stringify(shapeOf(r.json), null, 2), '```', ''] : []),
  ].join('\n');
  const file = flagStr(flags, 'out');
  if (file) { writeFile(file, out); console.log(`✔ ${method} ${url} → ${r.status} (${r.ms} ms) — written to ${file}`); } else console.log(out);
});
