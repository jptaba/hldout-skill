/** Secret redaction shared by the scripts (the test-side copy lives in heldout-support/fixtures.ts). */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const SECRET_KEY = /pass(word)?|token|secret|api[-_]?key|authorization|cookie|session/i;
// Header NAMES that carry credentials (incl. misspellings like "Authorisation") and VALUES that look like credentials.
const SECRET_HEADER = /auth|cookie|token|secret|api[-_]?key|session|password|credential/i;
const SECRET_VALUE = /^\s*(basic|bearer|digest|token)\s+\S+/i;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => [k, SECRET_KEY.test(k) && typeof v !== 'object' ? '***redacted***' : redact(v, depth + 1)]));
  }
  return value;
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
 * accessible name looks secret. (Same logic as redactSnapshot in heldout-support/fixtures.ts.)
 */
export function redactSnapshot(yaml: string, secretValues: string[] = []): string {
  let out = yaml;
  for (const v of secretValues.filter((x) => x && x.length >= 3)) out = out.split(v).join('***redacted***');
  return out.replace(/^(\s*- textbox "[^"]*(?:pass(?:word|code)?|pin|secret|token)[^"]*"[^:\n]*):\s*\S.*$/gim, '$1: ***redacted***');
}

// ---- run-level scrubbing --------------------------------------------------------------------------
// Playwright writes page snapshots itself (artifacts/**/error-context.md, html/data/*.md), including field values,
// outside the fixture's control. After every run the run directory's text artifacts are scrubbed of known
// secret values. trace.zip and html/index.html are binary/bundled: they stay local (git-ignored) and are
// never published — the verdict is the only artifact that leaves the machine.

/**
 * A value is safe to scrub by literal replacement only if it can't be ordinary text. A plain word such as
 * "password" or "hello" would also rewrite every occurrence of that word in the evidence (it did once: see
 * the evaluator test report, defect #23). Such values are refused and reported; field-level redaction
 * (password textboxes, secret JSON keys, credential headers) still covers them.
 */
export const safeToScrub = (v: string) => v.length >= 6 && !/^[A-Za-z]+$/.test(v) && !/^\d+$/.test(v);

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

const TEXT_ARTIFACT = /\.(md|ya?ml|txt|xml|json|log)$/i;
const scrubText = (s: string, secrets: string[]) => redactSnapshot(secrets.reduce((acc, v) => acc.split(v).join('***redacted***'), s));

/** Scrub secret values from every text artifact under `dir` (incl. base64 attachment bodies in results.json). */
export function scrubDir(dir: string, secrets: string[]): { files: number } {
  let files = 0;
  if (!fs.existsSync(dir)) return { files };
  for (const rel of fs.readdirSync(dir, { recursive: true, encoding: 'utf8' })) {
    const file = path.join(dir, rel);
    if (!TEXT_ARTIFACT.test(file) || !fs.statSync(file).isFile()) continue;
    const before = fs.readFileSync(file, 'utf8');
    let after = scrubText(before, secrets);
    if (path.basename(file) === 'results.json') {
      try {
        const json = JSON.parse(after) as unknown;
        let changed = false;
        const walk = (v: unknown): void => {
          if (Array.isArray(v)) { v.forEach(walk); return; }
          if (!v || typeof v !== 'object') return;
          const o = v as Record<string, unknown>;
          if (typeof o.body === 'string' && typeof o.contentType === 'string' && /text|json|yaml|markdown/.test(o.contentType)) {
            const text = Buffer.from(o.body, 'base64').toString('utf8');
            const clean = scrubText(text, secrets);
            if (clean !== text) { o.body = Buffer.from(clean, 'utf8').toString('base64'); changed = true; }
          }
          Object.values(o).forEach(walk);
        };
        walk(json);
        if (changed) after = JSON.stringify(json, null, 2);
      } catch { /* keep the plain-text scrub */ }
    }
    if (after !== before) { fs.writeFileSync(file, after); files++; }
  }
  return { files };
}

/** A strong random secret: upper and lower case, digits and a symbol, never a plain word (so it can be scrubbed). */
const SECRET_SETS = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '-_!'];

export function strongSecret(length = 20): string {
  const all = SECRET_SETS.join('');
  const chars = [...SECRET_SETS.map((s) => s[crypto.randomInt(s.length)]), ...Array.from({ length: length - SECRET_SETS.length }, () => all[crypto.randomInt(all.length)])];
  for (let i = chars.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}
