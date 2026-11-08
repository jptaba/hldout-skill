/**
 * Secret redaction, shared by the scripts and the tests' fixtures (heldout-support/fixtures.ts imports it from the
 * installed skill). Node built-ins only, so it loads anywhere.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { readZip, scrubZip } from './zip';
// It reads every report's evidence, so it names what holds a secret, not what merely speaks of one: `author`, `authorized`,
// `authenticated`, `authType`, `assessment`, `passenger`, `credentialType` and a bare `key` (an issue's, a map's) stay readable.
const SECRET_KEY = /(?<!com|by)pass(?!enger|port|ed\b|es\b|age|ive|ion)|token|secret|(?:api|access|private|signing|auth)[-_]?key|oauth|auth$|auth[-_]?code|authori[sz]ation|cookie|sess(?:ion|id|key)|(?:^|[-_.])sess(?:[-_]|$)|jwt|pwd|bearer|credentials?$/i;
// Header NAMES that carry credentials (incl. misspellings like "Authorisation") and VALUES that look like credentials.
const SECRET_HEADER = /auth|cookie|token|secret|api[-_]?key|session|password|credential/i;
const SECRET_VALUE = /^\s*(basic|bearer|digest|token)\s+\S+/i;

export interface RedactOptions {
  /** Values shown even under a secret-looking key: the literals a probe step was written with (literalsOf). */
  keep?: ReadonlySet<unknown>;
  /** A request a test sends: a short value under a secret-looking key is a test value (a deliberately too-short
   *  password is the evidence, and a reviewer must see it to reproduce); real secrets are longer, and every run
   *  scrubs their values from its artifacts. */
  testValues?: boolean;
}

const TAG_KEY = crypto.randomBytes(16);
const tagOf = (v: string) => crypto.createHmac('sha256', TAG_KEY).update(v).digest('hex').slice(0, 4);

/** Redact secrets from JSON bodies before they reach a report. An object with toJSON (a seed.account() account) is
 *  recorded as that says (its id and user name only). */
export function redact(value: unknown, opts: RedactOptions = {}, depth = 0): unknown {
  if (depth > 8 || value == null) return value;
  const toJSON = (value as { toJSON?: () => unknown }).toJSON;
  if (typeof value === 'object' && typeof toJSON === 'function' && !(value instanceof Date)) return redact(toJSON.call(value), opts, depth + 1);
  if (Array.isArray(value)) return value.map((v) => redact(v, opts, depth + 1));
  if (typeof value === 'object') {
    // A yes or no is no secret, and often the evidence itself.
    const hide = (k: string, v: unknown) => SECRET_KEY.test(k) && typeof v !== 'object' && typeof v !== 'boolean' && !opts.keep?.has(v)
      && !(opts.testValues && typeof v === 'string' && v.length < 8);
    // In a test's requests, two different hidden values stay told apart (the right password and a wrong one): a tag
    // from a keyed hash whose key lives only in this process, so it says "same" or "different" and nothing else.
    const hidden = (v: unknown) => (opts.testValues ? `***redacted:${tagOf(String(v))}***` : '***redacted***');
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      // A list under a secret's name holds secrets (`tokens`, `cookies`, what `data.*.token` reads).
      .map(([k, v]) => [k, Array.isArray(v) && SECRET_KEY.test(k) ? v.map((x) => (hide(k, x) ? hidden(x) : redact(x, opts, depth + 1))) : hide(k, v) ? hidden(v) : redact(v, opts, depth + 1)]));
  }
  return value;
}

/** Whether a field by this name holds a secret, by any segment of a dotted path. */
export const isSecretField = (path: string) => path.split('.').some((k) => SECRET_KEY.test(k));

/** A value read from a field by its path (`data.password`): redacted as it would be inside its object. */
export function redactField(dotted: string, value: unknown): unknown {
  // The field's own name, not a list's index or `*` after it (`tokens.0`).
  const name = dotted.split('.').filter((k) => k !== '*' && !/^-?\d+$/.test(k)).at(-1) ?? dotted;
  return (redact({ [name]: value }) as Record<string, unknown>)[name];
}

/** The literal values a request written by the evaluator contains (not ${env:…}/${vault:…} references): test values such
 *  as a deliberately short password, shown in reports even under a secret-looking key, since the request file holds them. */
export function literalsOf(value: unknown, out = new Set<unknown>()): Set<unknown> {
  if (typeof value === 'string') { if (!/\$\{/.test(value)) out.add(value); }
  else if (Array.isArray(value)) value.forEach((v) => literalsOf(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => literalsOf(v, out));
  return out;
}

export const redactHeaders = (h: Record<string, string>) =>
  Object.fromEntries(Object.entries(h).map(([k, v]) => [k, SECRET_HEADER.test(k) || SECRET_VALUE.test(String(v)) ? '***redacted***' : v]));

/** Type skeleton of a JSON value — lets tests assert structure without copying AUT values. */
export function shapeOf(value: unknown, depth = 0): unknown {
  if (depth > 6) return '…';
  if (Array.isArray(value)) return value.length ? [shapeOf(value[0], depth + 1)] : [];
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shapeOf(v, depth + 1)]));
  return value === null ? 'null' : typeof value;
}

/**
 * ARIA snapshots include the current value of text fields — password fields too. Redact the given secret
 * values (e.g. the page's password inputs) wherever they appear, and any value shown for a textbox whose
 * accessible name looks secret.
 */
export function redactSnapshot(yaml: string, secretValues: string[] = []): string {
  let out = yaml;
  for (const v of secretForms(secretValues.filter((x) => x && x.length >= 3))) out = out.split(v).join('***redacted***');
  return out.replace(/^(\s*- textbox "[^"]*(?:pass(?:word|code)?|pin|secret|token)[^"]*"[^:\n]*):\s*\S.*$/gim, '$1: ***redacted***');
}

/**
 * An answer that is an HTML page (an application's error page behind an API call), as what the page says: its text,
 * marked as a page, without the markup, the scripts and the head. Anything else comes back as it is.
 */
export function pageText(body: string): string {
  if (!/<html[\s>]|<!doctype html/i.test(body)) return body;
  return `(an HTML page) ${body.replace(/<!--[\s\S]*?-->|<(script|style|head)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`;
}

// ---- run-level scrubbing --------------------------------------------------------------------------
// Playwright writes page snapshots itself (artifacts/**/error-context.md, html/data/*.md), including field values,
// outside the fixture's control. After every run the run directory's text artifacts are scrubbed of known
// secret values, and so are the files inside every trace archive (a trace records each request the browser made,
// passwords in addresses and forms included) and inside the archive the HTML report carries in its page. These
// stay local all the same (git-ignored): the verdict is the only artifact that leaves the machine.

/**
 * A value is safe to scrub by literal replacement only if it can't be ordinary text. A plain word such as
 * "password" or "hello" would also rewrite every occurrence of that word in the evidence (it did once: see
 * the evaluator test report, defect #23). Such values are refused and reported; field-level redaction
 * (password textboxes, secret JSON keys, credential headers) still covers them.
 */
export const safeToScrub = (v: string) => v.length >= 6 && !/^[A-Za-z]+$/.test(v) && !/^\d+$/.test(v);

/** Whether replacing a value leaves the evidence whole: what is short or a plain word stays, unless it is long. */
export const scrubbable = (v: string) => safeToScrub(v) || v.length >= 16;

/** Every form a value takes on the way into a report: in an address, a form body, a JSON string, a table cell. */
function formsOf(v: string): string[] {
  // Writers differ on the symbols a generated password holds: an address keeps `!` and `*`, a form encodes `!`, strict
  // encoders both, and a space can be `+` in any of them.
  const uri = encodeURIComponent(v);
  const percent = [uri, encodeURI(v), new URLSearchParams({ x: v }).toString().slice(2), uri.replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)];
  const encoded = percent.flatMap((e) => [e, e.replace(/%20/g, '+')]);
  // A trace keeps a JSON body as a string inside JSON: escaped twice.
  const inJson = JSON.stringify(v).slice(1, -1);
  return [...encoded, ...encoded.map((e) => e.replace(/%[0-9A-F]{2}/g, (h) => h.toLowerCase())),
    inJson, JSON.stringify(inJson).slice(1, -1), v.replace(/&/g, '&amp;'), v.replace(/\|/g, '\\|'), v.replace(/\|/g, '/'), v.replace(/`/g, "'"), v.replace(/\s+/g, ' ')];
}

/**
 * Every form of these values, the longest first: one that starts another must not leave its rest. A form is kept only
 * if it would be replaced as a value of its own or is percent-encoded, so none can rewrite ordinary text; the value
 * itself always is.
 */
export const secretForms = (values: string[]) => [...new Set(values.flatMap((v) => [v, ...formsOf(v).filter((f) => scrubbable(f) || /%[0-9A-Fa-f]{2}/.test(f))]))].filter(Boolean).sort((a, b) => b.length - a.length);

/** Takes values out of a text, each in every form. */
export function scrubValues(text: string, values: string[]): string {
  return secretForms(values.filter(scrubbable)).reduce((acc, v) => acc.split(v).join('***redacted***'), text);
}

/**
 * A form body or an address's query, also inside other text: a field that holds a secret is hidden by its name, as
 * `redact` does in JSON. A field starts after a query's or a fragment's mark, a separator, a space or a quote, so what
 * is in an address's path is never a name. A harmless field's value is read on, for a field inside it; a secret one's
 * runs to the end of its quotes, or to what ends a field (`?`, `#` and `;` only when a field follows, as a value can
 * hold them), leaving what closes around it (a step's `)`, a selector's `]`).
 */
export function redactForm(text: string): string {
  const field = /(?<=^|[?&;#\s"',=:])([^=&?#;/:\s"',!<>]+)=(?!=)/g;
  const value = /\\"(?:(?!\\")[\s\S])*\\"|"(?:[^"\\]|\\.)*"|'[^']*'|(?:[^&\s"'?#;]|[?#;](?![^=&\s"'?#;]*=))*/y;
  let out = ''; let done = 0;
  for (let m = field.exec(text); m; m = field.exec(text)) {
    if (!m[1].split(/[[\].]|%5[BD]/i).some((part) => SECRET_KEY.test(part))) continue;
    value.lastIndex = field.lastIndex;
    const whole = value.exec(text)?.[0] ?? '';
    if (/^(?:true|false|""|'')?$/.test(whole)) continue;
    const closing = /^["'\\]/.test(whole) ? '' : /[)\]]*$/.exec(whole)![0];
    out += `${text.slice(done, field.lastIndex)}***redacted***${closing}`;
    done = field.lastIndex + whole.length;
    field.lastIndex = done;
  }
  return out + text.slice(done);
}

/** The HTML report packs its data as an archive inside the page: splits a page's text from those (at odd places). */
const ARCHIVE_HEAD = 'data:application/zip;base64,';
const pageParts = (page: string) => page.split(/(data:application\/zip;base64,[A-Za-z0-9+/=]+)/);

/** What a report says of the saved values it took out, by name only, and of those it couldn't. */
export function scrubNotes(saved: Record<string, string[]>): string[] {
  const names = Object.keys(saved);
  const taken = names.filter((k) => saved[k].some(scrubbable));
  const left = names.filter((k) => saved[k].some((v) => !scrubbable(v)));
  return [...(taken.length ? [`Taken out of this report wherever they appeared, as they look like secrets: ${taken.join(', ')}.`] : []),
    ...(left.length ? [`Too short or plain to take out of this report: ${left.join(', ')}.`] : [])];
}

/**
 * Secret values to scrub: ONLY the env vars this story's test-data.json references (${env:NAME}) plus explicit
 * extras. Never the whole machine environment. `weak` lists names whose value is refused as unsafe.
 */
export function secretValuesFor(testDataFile: string | undefined, env: NodeJS.ProcessEnv = process.env, extras: string[] = []): { values: string[]; weak: string[] } {
  const names = new Set<string>();
  if (testDataFile && fs.existsSync(testDataFile)) for (const m of fs.readFileSync(testDataFile, 'utf8').matchAll(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g)) names.add(m[1]);
  const values: string[] = []; const weak: string[] = [];
  for (const [name, v] of [...[...names].map((n) => [n, env[n]] as const), ...extras.map((x) => ['--value', x] as const)]) {
    if (typeof v !== 'string' || !v) continue;
    if (safeToScrub(v)) values.push(v); else weak.push(name);
  }
  return { values, weak };
}

const TEXT_ARTIFACT = /\.(md|ya?ml|txt|xml|json|jsonl|log|http)$/i;
const scrubText = (s: string, forms: string[]) => redactSnapshot(forms.reduce((acc, v) => acc.split(v).join('***redacted***'), s));
/** A base64 body in a run's record (a Playwright attachment): the scrub and the check read the same ones. */
const BASE64_BODY = /("body":\s*")([A-Za-z0-9+/=]{8,})(")/g;
/** A text and the base64 bodies in it, cleaned; a body is rewritten only if it held something. */
const scrubWithBodies = (s: string, forms: string[]) => scrubText(s, forms).replace(BASE64_BODY, (whole, head: string, b64: string, tail: string) => {
  const text = Buffer.from(b64, 'base64').toString('utf8');
  const clean = scrubText(text, forms);
  return clean === text ? whole : head + Buffer.from(clean, 'utf8').toString('base64') + tail;
});

/**
 * Run artifacts (stack traces, junit, results) name files by their absolute path, which carries the machine's user
 * and folder names into committed evidence: make them relative to the project ("./output/…").
 */
export function relativizePaths(dir: string, root: string): { files: number } {
  let files = 0;
  if (!fs.existsSync(dir)) return { files };
  const native = path.resolve(root);
  // The root as it is written natively, with forward slashes, and inside JSON (backslashes doubled); longest first.
  const roots = [...new Set([native, native.split(path.sep).join('/'), JSON.stringify(native).slice(1, -1)])];
  const pairs: [string, string][] = roots.flatMap((r) => [[`${r}\\\\`, './'], [`${r}\\`, './'], [`${r}/`, './'], [r, '.']] as [string, string][])
    .sort((a, b) => b[0].length - a[0].length);
  for (const rel of fs.readdirSync(dir, { recursive: true, encoding: 'utf8' })) {
    const file = path.join(dir, rel);
    if (!TEXT_ARTIFACT.test(file) || !fs.statSync(file).isFile()) continue;
    const before = fs.readFileSync(file, 'utf8');
    const after = pairs.reduce((s, [from, to]) => s.split(from).join(to), before);
    if (after !== before) { fs.writeFileSync(file, after); files++; }
  }
  return { files };
}

/** Scrub secret values from every text artifact under `dir`, the base64 bodies in them, and the archives. */
export function scrubDir(dir: string, secrets: string[]): { files: number } {
  let files = 0;
  if (!fs.existsSync(dir)) return { files };
  const forms = secretForms(secrets);
  for (const rel of fs.readdirSync(dir, { recursive: true, encoding: 'utf8' })) {
    const file = path.join(dir, rel);
    // A trace archive records every request the browser made: a password an application takes in an address or a
    // form is in it. Its files are scrubbed in place; an archive that can't be read is left as it is.
    if (/\.zip$/i.test(file) && secrets.length && fs.statSync(file).isFile()) {
      const scrubbed = scrubZip(fs.readFileSync(file), forms);
      if (scrubbed?.changed) { fs.writeFileSync(file, scrubbed.zip); files++; }
      continue;
    }
    // The HTML report packs its data as an archive inside the page: the same scrub, on that archive.
    if (/\.html$/i.test(file) && secrets.length && fs.statSync(file).isFile()) {
      const page = fs.readFileSync(file, 'utf8');
      const clean = pageParts(page).map((part, i) => {
        if (!(i % 2)) return scrubWithBodies(part, forms);
        const scrubbed = scrubZip(Buffer.from(part.slice(ARCHIVE_HEAD.length), 'base64'), forms);
        return scrubbed?.changed ? ARCHIVE_HEAD + scrubbed.zip.toString('base64') : part;
      }).join('');
      if (clean !== page) { fs.writeFileSync(file, clean); files++; }
      continue;
    }
    if (!TEXT_ARTIFACT.test(file) || !fs.statSync(file).isFile()) continue;
    const before = fs.readFileSync(file, 'utf8');
    const after = scrubWithBodies(before, forms);
    if (after !== before) { fs.writeFileSync(file, after); files++; }
  }
  return { files };
}

/**
 * Where secret values still are under `dir`, without changing anything: text files, the files inside trace archives,
 * and the base64 attachments of Playwright's results. Each hit names the file (and the archive entry).
 */
export function findSecrets(dir: string, secrets: string[]): string[] {
  const hits: string[] = [];
  if (!fs.existsSync(dir) || !secrets.length) return hits;
  const forms = secretForms(secrets);
  const has = (s: string) => forms.some((v) => s.includes(v));
  for (const rel of fs.readdirSync(dir, { recursive: true, encoding: 'utf8' })) {
    const file = path.join(dir, rel);
    if (!fs.statSync(file).isFile()) continue;
    if (/\.zip$/i.test(file)) {
      for (const e of readZip(fs.readFileSync(file)) ?? []) if (has(e.data.toString('utf8'))) hits.push(`${file} › ${e.name}`);
      continue;
    }
    const html = /\.html$/i.test(file);
    if (!TEXT_ARTIFACT.test(file) && !html) continue;
    const parts = html ? pageParts(fs.readFileSync(file, 'utf8')) : [fs.readFileSync(file, 'utf8')];
    for (const part of parts.filter((_, i) => i % 2)) for (const e of readZip(Buffer.from(part.slice(ARCHIVE_HEAD.length), 'base64')) ?? []) if (has(e.data.toString('utf8'))) hits.push(`${file} › ${e.name}`);
    const text = parts.filter((_, i) => !(i % 2)).join('\n');
    const decoded = [...text.matchAll(BASE64_BODY)].map((m) => Buffer.from(m[2], 'base64').toString('utf8')).join('\n');
    if (has(text) || has(decoded)) hits.push(file);
  }
  return hits;
}

/** A strong random secret: upper and lower case, digits and a symbol, never a plain word (so it can be scrubbed). */
// Upper and lower case, a digit and a symbol, each at least once: what most password policies ask for. The symbols are the
// ones those policies accept (many reject - _ .) that are also safe in a URL path, JSON, a shell and .env.
const SECRET_SETS = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@*'];

export function strongSecret(length = 20): string {
  const all = SECRET_SETS.join('');
  const chars = [...SECRET_SETS.map((s) => s[crypto.randomInt(s.length)]), ...Array.from({ length: length - SECRET_SETS.length }, () => all[crypto.randomInt(all.length)])];
  for (let i = chars.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}
