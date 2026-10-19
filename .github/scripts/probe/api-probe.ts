/**
 * API probe — hardening + live confirmation tool for API scenarios (the API counterpart of inspect.ts).
 *
 *   heldout api-probe [--key KEY | --aut <profile>] <METHOD> <path>
 *       [--data '<json>' | --data-file body.json | --raw-data '<string>' | --form 'a=1&b=2' or --form '{"a":1}']   (values support ${env:NAME})
 *   heldout api-probe [--key KEY] --chain chain.json   multi-call sequence, chain.json =
 *       { "steps": [ { "name", "method", "path", "headers"?, "json"? | "form"? | "raw"?, "save"?: { "token": "data.token" },
 *                      "expect"?: 201 | [200, 201], "expectBody"?: { "code": "1200" }, "show"?: ["books", "token|jwt", "data.*.price"],
 *                      "notContains"?: [{ "field": "token", "decode": "jwt", "value": "${env:PASSWORD}" }], "setup"?: true, "parallel"?: 3 } ] }
 *       ${token} reads a saved value, ${uid} is unique per chain, ${env:NAME} a secret (in a path, a header or a
 *       value: always write the reference, never the secret itself; the report shows ***);
 *       "save" paths are relative to the answer's body ("id", "data.0.id", "data.token")
 *       [--header "Name: value"]... [--cookie "name=value"]...
 *       [--login '{"method":"POST","path":"api/auth/login","data":{...},"extract":"token","as":"cookie:token"}']
 *       [--repeat N] [--json] [--body-limit N]   (report shows the first N body characters; default 4000)
 *   heldout api-probe --key KEY --chain P7 [--set 2.json.country=AT]...   re-run an earlier probe's chain, values changed
 *       (--set <step number>.<dotted field>=<value>; the value is read as JSON when it is JSON, e.g. 3.expect=422)
 *   [--vars-from P7]   with --chain: start with the values chain P7 saved (the ids it made, as ${name}); a chain's
 *       saved values are logged with it (tokens and other secrets are not)
 *
 * A list answer, without a script (the items are the body when it is a list, else its first list field):
 *   [--pages <param>[=from..to]]   follow the pages (?page=1, 2…) until one is empty, last_page is reached or the range ends
 *   [--where <field>~<regex>]...   keep the items whose field matches (dotted path; repeatable, all must match)
 *   [--pick <field>]...            show this field of each item ("price", "category.name"; an answer that is no list: of the body)
 *   [--count]                      how many items there are (after --where)
 * Values may use ${text:N} (N characters of generated text, starting with the profile's data prefix) and ${now}.
 *
 * With --key a call or chain is logged as the story's next probe (P1, P2…: 4-evidence/probes.jsonl) and its full
 * report written to the scratch area; cite it as Pn. Without --key (or with --json) the report is printed.
 * Paths resolve against the profile's apiBaseURL. Under Git Bash omit the leading "/" (api/room), or
 * set MSYS_NO_PATHCONV=1 — MSYS rewrites "/…" arguments into Windows paths.
 * Prints status, timing, redacted headers, body and a type *shape* (write schema assertions from the
 * requirement + shape, never by copying AUT values into expectations).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { flagList, flagStr, resolveUrl, type Args, type CommandSpec } from '../core/cli';
import { loadConfig } from '../core/config';
import { literalsOf, pageText, redact, redactHeaders, shapeOf } from '../core/redact';
import { expandGenerated, expandSecrets, loadedVaultSecrets, requireVaultSecrets } from '../core/secrets';
import { chainOfProbe, deliverProbe, requireFrozen, savedOf } from '../core/probe-log';

/** ${env:NAME} and ${vault:path#field} (read at the start of the command) → their values. */
const env = (s: string) => {
  const out = expandSecrets(s);
  const missing = out.match(/\$\{(env|vault):[^}]+\}/)?.[0];
  if (missing) throw new Error(`${missing} is not set (.env, the environment or Vault)`);
  return out;
};

/** A path with a secret reference: the value is URL-encoded into the request, and shown as *** in every report. */
const envPath = (s: string) => expandGenerated(s.replace(/\$\{(?:env|vault):[^}]+\}/g, (m) => encodeURIComponent(env(m))));
const maskEnv = (s: string) => s.replace(/\$\{(?:env|vault):[^}]+\}/g, '***');
/** Last line of defence: the value of every secret reference the input mentions never reaches a report, raw or encoded. */
function scrubEnv(report: string, input: string): string {
  const values = [...new Set([...[...input.matchAll(/\$\{(?:env|vault):[^}]+\}/g)].map((m) => expandSecrets(m[0])).filter((v) => !v.startsWith('${')),
    ...Object.values(loadedVaultSecrets())].filter((v) => v.length >= 3)),
    // A secret typed into the command as its value (a password an application takes in the path) is caught by what
    // the environment holds under a secret's name.
    ...Object.entries(process.env).filter(([name, v]) => /PASS|SECRET|TOKEN|KEY/i.test(name) && v && v.length >= 6).map(([, v]) => v!)];
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

// "data.-1" is the last element of an array (a record just added to a list); "data.*.price" is that field of every
// element (the order of a sorted list, the ids of a page).
const dig = (obj: unknown, dotted: string): unknown => {
  const [k, ...rest] = dotted.split('.');
  if (k === '*' && Array.isArray(obj)) return obj.map((x) => (rest.length ? dig(x, rest.join('.')) : x));
  const next = Array.isArray(obj) && /^-\d+$/.test(k) ? obj[obj.length + Number(k)] : obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[k] : undefined;
  return rest.length ? dig(next, rest.join('.')) : next;
};

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
async function runChain(file: string, label: string, base: string, cfgName: string, chainBodyLimit: number, preset: Record<string, string> = {}): Promise<{ report: string; digest: string[]; chain: unknown; saved: Record<string, string> }> {
  const chain = JSON.parse(fs.readFileSync(file, 'utf8')) as { vars?: Record<string, unknown>; steps: ChainStep[] };
  const vars: Record<string, string> = { ...preset, uid: `${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 5)}` };
  const interpVars = (s: string): string => s.replace(/\$\{([A-Za-z_][\w]*)\}/g, (m, n: string) => (vars[n] !== undefined ? vars[n] : m));
  const interp = (s: string): string => interpVars(env(s));
  // A body value that is exactly "${name}" keeps the saved value's JSON type ({"BasketId": "${bid}"} sends 6, not "6").
  const typed: Record<string, unknown> = {};
  const whole = (s: string) => s.match(/^\$\{([A-Za-z_][\w]*)\}$/)?.[1];
  const deep = (v: unknown): unknown => (typeof v === 'string' ? (whole(v) !== undefined && typed[whole(v)!] !== undefined ? typed[whole(v)!] : interp(v))
    : Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : v);
  for (const [k, v] of Object.entries(chain.vars ?? {})) { if (typeof v === 'string') vars[k] = interp(v); else { vars[k] = String(v); typed[k] = v; } }
  const lines = [`# API chain — ${label}`, '', `- AUT: ${cfgName} · ${base} · captured ${new Date().toISOString()}`, ''];
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
    // An HTML error page on one line of a chain's report: what it says, not its markup.
    const resp = r.json !== undefined ? JSON.stringify(redact(r.json)) : pageText(r.text);
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
    else lines.push(`   \`${resp.replace(/\s+/g, ' ').slice(0, chainBodyLimit).replace(/`/g, "'")}\``);
    if (checks.length) lines.push(`   ${checks.join(' · ')}`);
  }
  lines.push('', failed ? `**${failed} step(s) did not meet their expectation (status, expectBody or notContains).**`
    : chain.steps.some((s) => s.expect !== undefined || s.expectBody || s.notContains?.length) ? 'All expectations held.' : 'No expectation was declared: the statuses and bodies above are what the application answered, not a pass.', '');
  const out = scrubEnv(lines.join('\n'), fs.readFileSync(file, 'utf8'));
  // The digest: each call and its status, and whether the expectations held.
  const digest = [...out.split('\n').filter((l) => /^\d+\. /.test(l)).map((l) => l.slice(0, 240)).slice(0, 40), ...(failed ? [`${failed} step(s) did not meet their expectation`] : [])];
  // What the chain saved (ids it made), for a later chain or walk (--vars-from); a token or other secret is not kept.
  const saved = Object.fromEntries(Object.entries(vars).filter(([k, v]) => k !== 'uid' && !(k in (chain.vars ?? {})) && !/token|secret|pass|key|auth|cookie|session/i.test(k) && v.length < 200));
  return { report: out, digest, chain, saved };
}

export const spec: CommandSpec = {
  name: 'api-probe', group: 'Hardening', usage: '--key KEY <METHOD> <path> | --chain chain.json   (logged as the story\'s next probe, Pn)',
  about: 'call the API (or a chain of calls) with redacted output',
  flags: ['aut', 'body-limit', 'chain', 'cookie', 'count', 'data', 'data-file', 'form', 'header', 'json', 'key', 'login', 'pages', 'pick', 'raw-data', 'repeat', 'set', 'vars-from', 'where'], words: 2,
};

const requireKey = (flags: Args['flags']) => flagStr(flags, 'key') ?? (() => { throw new Error('--chain Pn and --vars-from Pn name a probe of a story: give the story with --key'); })();

/**
 * A chain with values changed for one call: each --set is <step number>.<dotted field>=<value> (the value read as JSON
 * when it is JSON, otherwise as text), e.g. 2.json.billing_country=AT or 3.expect=422. A temporary file: the probe log
 * keeps the chain that ran.
 */
function withSets(file: string, sets: string[]): string {
  const chain = JSON.parse(fs.readFileSync(file, 'utf8')) as { steps: Record<string, unknown>[] };
  for (const s of sets) {
    const m = s.match(/^(\d+)\.([^=]+)=(.*)$/s);
    if (!m) throw new Error(`--set ${s}: write <step number>.<field>=<value>, e.g. 2.json.country=AT`);
    const step = chain.steps[Number(m[1]) - 1];
    if (!step) throw new Error(`--set ${s}: the chain has ${chain.steps.length} step(s)`);
    const keys = m[2].split('.');
    let at: Record<string, unknown> = step;
    for (const k of keys.slice(0, -1)) at = (at[k] ??= {}) as Record<string, unknown>;
    let value: unknown = m[3];
    try { value = JSON.parse(m[3]); } catch { /* text */ }
    at[keys.at(-1)!] = value;
  }
  const out = path.join(os.tmpdir(), `heldout-chain-${process.pid}-${path.basename(file)}`);
  fs.writeFileSync(out, `${JSON.stringify(chain, null, 2)}\n`);
  return out;
}

/** The items of a list answer: the body itself when it is a list, else its first list field (data, items, results…). */
const itemsOf = (body: unknown): unknown[] | undefined => (Array.isArray(body) ? body
  : body && typeof body === 'object' ? Object.values(body as Record<string, unknown>).find(Array.isArray) as unknown[] | undefined : undefined);

const withParam = (url: string, param: string, n: number) => { const u = new URL(url); u.searchParams.set(param, String(n)); return u.toString(); };

/**
 * --pages / --where / --pick / --count over a list answer, as report lines (redacted). `fetchPage` asks for page n.
 * Paging stops at an empty page, the answer's last_page, the end of the range, or after 50 pages.
 */
export async function listView(flags: Args['flags'], first: unknown, fetchPage: (param: string, n: number) => Promise<unknown>): Promise<string[]> {
  const pages = flagStr(flags, 'pages');
  const picks = flagList(flags, 'pick');
  const wheres = flagList(flags, 'where').map((w) => {
    const i = w.indexOf('~');
    if (i < 1) throw new Error(`--where ${w}: write <field>~<regex>, e.g. category.name~^Hand`);
    return { field: w.slice(0, i), re: new RegExp(w.slice(i + 1), 'i'), text: w };
  });
  if (!pages && !picks.length && !wheres.length && !flags.count) return [];
  const lines: string[] = [];
  let items = itemsOf(first);
  if (pages) {
    const m = pages.match(/^([^=]+)(?:=(\d+)\.\.(\d+)?)?$/);
    if (!m) throw new Error(`--pages ${pages}: write <param> or <param>=<from>..<to>, e.g. page=1..5`);
    const [param, from = '1', to] = [m[1], m[2], m[3]];
    items = [];
    let n = Number(from);
    let body = await fetchPage(param, n);
    for (let fetched = 1; ; fetched++) {
      const got = itemsOf(body) ?? [];
      items.push(...got);
      const last = Number((body as { last_page?: unknown; meta?: { last_page?: unknown } } | undefined)?.last_page ?? (body as { meta?: { last_page?: unknown } } | undefined)?.meta?.last_page);
      if (!got.length || (last && n >= last) || (to && n >= Number(to)) || fetched >= 50) break;
      body = await fetchPage(param, ++n);
    }
    lines.push(`pages ${param}=${from}..${n}: ${items.length} item(s)`);
  }
  if (!items) {
    // An answer that is no list: --pick reads the body itself.
    if (wheres.length || flags.count) lines.push('the answer holds no list: --where and --count need one');
    lines.push(...picks.map((p) => `${p} = ${JSON.stringify(redact(dig(first, p)))}`));
    return lines;
  }
  const textOfField = (v: unknown) => (v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''));
  const kept = items.filter((x) => wheres.every((w) => w.re.test(textOfField(dig(x, w.field)))));
  if (flags.count || wheres.length) lines.push(`count${wheres.length ? ` where ${wheres.map((w) => w.text).join(' and ')}` : ''}: ${kept.length} of ${items.length}`);
  if (picks.length) for (const [i, x] of kept.slice(0, 200).entries()) lines.push(`${i + 1}. ${picks.map((p) => `${p} = ${JSON.stringify(redact(dig(x, p)))}`).join(' · ')}`);
  if (picks.length && kept.length > 200) lines.push(`… ${kept.length - 200} more`);
  return lines;
}

export async function run({ _, flags, argv }: Args): Promise<void> {
  if (flagStr(flags, 'key')) requireFrozen(loadConfig({ key: flagStr(flags, 'key'), aut: flagStr(flags, 'aut') }), flagStr(flags, 'key'), 'api-probe');
  const bodyLimit = Number(flagStr(flags, 'body-limit') ?? 4000);
  const chainArg = flagStr(flags, 'chain');
  // --chain P7: the chain an earlier probe of the story ran. --set 2.json.country=AT: one value changed for this call.
  const chainFile = chainArg && /^P[1-9]\d*$/.test(chainArg)
    ? chainOfProbe(loadConfig({ key: flagStr(flags, 'key'), aut: flagStr(flags, 'aut') }), requireKey(flags), chainArg)
    : chainArg;
  if (flagStr(flags, 'vars-from') && !chainFile) throw new Error('--vars-from gives a chain the values an earlier chain saved: use it with --chain');
  const sets = flagList(flags, 'set');
  if (sets.length && !chainFile) throw new Error('--set changes a value of a chain: use it with --chain');
  const chainToRun = chainFile && sets.length ? withSets(chainFile, sets) : chainFile;
  await requireVaultSecrets([argv.join(' '), chainToRun && fs.existsSync(chainToRun) ? fs.readFileSync(chainToRun, 'utf8') : '']);
  if (chainToRun) {
    const cfg = loadConfig({ key: flagStr(flags, 'key'), aut: flagStr(flags, 'aut') });
    // Each answer is shown in one line: its first 300 characters, or --body-limit N of them ("show" picks fields).
    const preset = flagStr(flags, 'vars-from') ? savedOf(cfg, requireKey(flags), flagStr(flags, 'vars-from')!) : {};
    const done = await runChain(chainToRun, [chainArg, ...sets.map((s) => `--set ${s}`)].join(' '), cfg.aut.apiBaseURL ?? cfg.aut.baseURL, `${cfg.aut.name} (profile \`${cfg.autId}\`)`, Number(flagStr(flags, 'body-limit') ?? 300), preset)
      .finally(() => { if (chainToRun !== chainFile) fs.rmSync(chainToRun, { force: true }); });
    const saved = Object.keys(done.saved).length ? done.saved : undefined;
    deliverProbe(cfg, flagStr(flags, 'key'), { tool: 'api-probe', tier: 3, input: { chain: done.chain, ...(saved ? { saved } : {}) }, report: done.report, digest: [...done.digest, ...(saved ? [`saved: ${Object.entries(saved).map(([k, v]) => `${k}=${v}`).join(', ').slice(0, 300)}`] : [])] });
    return;
  }
  const [methodArg, pathArg] = _;
  if (!methodArg || pathArg === undefined) throw new Error('Usage: heldout api-probe <METHOD> <path> [options]   or   heldout api-probe --chain chain.json');
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
  const input = [...argv, dataFile ? fs.readFileSync(dataFile, 'utf8') : ''].join(' ');
  const picked = await listView(flags, r.json, async (param, n) => (await send(withParam(url, param, n), method, headers, body)).json);

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
    ? Object.entries(redacted as Record<string, unknown>).filter(([, v]) => v === null || typeof v !== 'object' || Array.isArray(v)).map(([k, v]) => `${k}: ${Array.isArray(v) ? `a list of ${v.length}` : JSON.stringify(v)}`) : [];
  const out = scrubEnv([
    `# API probe — ${method} ${shownUrl}`, '',
    `- AUT: ${cfg.aut.name} (profile \`${cfg.autId}\`) · captured ${new Date().toISOString()}`,
    `- Status: **${r.status}**${repeat > 1 ? ` (all runs: ${results.map((x) => x.status).join(', ')})` : ''}`,
    `- Time: ${r.ms} ms${repeat > 1 ? ` (min ${Math.min(...results.map((x) => x.ms))} / max ${Math.max(...results.map((x) => x.ms))})` : ''}`,
    `- Content-Type: ${r.headers['content-type'] ?? '-'}`, '',
    ...(body !== undefined ? ['## Request body', '', '```json', reqBody, '```', ''] : []),
    '## Response headers (redacted)', '', '```json', JSON.stringify(redactHeaders(r.headers), null, 2), '```', '',
    ...(picked.length ? ['## Picked', '', ...picked.map((x) => `- ${x}`), ''] : []),
    // A listing's wrapper values (per_page, total, how many items) come first: the clipped body below ends before them.
    ...(topLevel.length ? ['## Top-level values (the body below is clipped)', '', ...topLevel.map((x) => `- ${x}`), ''] : []),
    `## Response body (redacted${pretty.length > bodyLimit ? `, first ${bodyLimit} of ${pretty.length} chars; --body-limit N for more` : ''})`, '', '```json', pretty.slice(0, bodyLimit), '```', '',
    ...(r.json !== undefined ? ['## Shape (types only)', '', '```json', JSON.stringify(shapeOf(r.json), null, 2), '```', ''] : []),
  ].join('\n'), input);
  deliverProbe(cfg, flagStr(flags, 'key'), {
    tool: 'api-probe', tier: 3, report: out, input: { call: argv.filter((a) => a !== '--key' && a !== flagStr(flags, 'key')) },
    digest: [scrubEnv(`${method} ${shownUrl} → ${r.status} (${r.ms} ms)${repeat > 1 ? `, all runs: ${results.map((x) => x.status).join(', ')}` : ''}`, input), ...picked.slice(0, 20).map((x) => scrubEnv(x, input)), ...topLevel.slice(0, 10)],
  });
}
