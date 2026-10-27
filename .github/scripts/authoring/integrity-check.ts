/**
 * Held-out integrity: hardening/repair may change HOW a test drives the AUT (locators, waits, navigation),
 * never WHAT it expects. The test author's draft stays as frozen in 3-tests/ (freeze.json holds its hashes); the
 * hardener works on its copy in 4-hardening/. We compare every `[REQ …]` assertion and the `@req-constants` block
 * between the two, and refuse a draft that changed since the freeze.
 *
 * Amendments: an assertion whose *implementation* was wrong (e.g. an over-strict regex) may be fixed
 * only through an audited amendment (recorded in freeze.json by `heldout integrity --amend`),
 * which records draft → current text and a reason. Amendments are listed in the verdict. Any other
 * change is a violation.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { specFiles } from './spec-model';

const sha256 = (s: string) => createHash('sha256').update(s.replace(/\r\n/g, '\n')).digest('hex');

/** The journeys a story's specs use: their files (for [REQ …] checks) and a hash per journey id (frozen, compared). */
export interface StoryJourneys { files: string[]; hashes: Record<string, string> }
const NO_JOURNEYS: StoryJourneys = { files: [], hashes: {} };

export interface IntegrityResult {
  status: 'PRESERVED' | 'AMENDED' | 'VIOLATED' | 'NO_DRAFT';
  checkedAt: string;
  /** Draft files changed or gone since the freeze: the draft is the frozen record, never edited after it. */
  draftChanged: string[];
  files: { file: string; draftAssertions: number; currentAssertions: number }[];
  removed: string[];
  changed: { assertion: string; draft: string; current: string }[];
  amended: Amendment[];
  added: string[];
  constantsChanged: string[];
  /** The requirement contract's oracle part (ACs, outcomes, rules, error model) changed since the freeze. */
  contractChanged?: boolean;
  /** Journeys the tests use that changed (or are new) since the freeze: HOW, so not a violation; listed by id. */
  journeysChanged?: string[];
  /** [REQ …] assertions inside journey files: they would escape the freeze, so they are a violation. */
  journeyAssertions?: string[];
  unhardenedMarkers: { file: string; line: number; text: string }[];
}

export interface Amendment { assertion: string; draft: string; current: string; reason: string; approvedAt: string }

/** One frozen draft: the hashes of the specs as the author left them, the contract's oracle and the journeys they used. */
export interface FrozenDraft {
  frozenAt: string;
  /** Each spec file (relative to the tests folder) and the SHA-256 of its source (line endings as LF). */
  specs: Record<string, string>;
  /** Per spec file, the SHA-256 of each requirement assertion as frozen and of its @req-constants block: what a later re-freeze is audited against. */
  assertions: Record<string, { req: Record<string, string>; constants: string }>;
  /** The requirement contract's oracle at the freeze (contract-model oracleDigest). */
  contractOracle: string;
  /** The hash of each journey the draft used, at the freeze. */
  journeys: Record<string, string>;
}

/** A re-freeze after a requirement revision: why, what it absorbed, and the draft it replaced. */
export interface Refreeze {
  at: string;
  reason: string;
  absorbed: { changed: string[]; removed: string[]; constantsChanged: string[]; added: string[]; contractOracleChanged?: boolean };
  previous: FrozenDraft;
}

/** The story's freeze.json: the frozen draft, its re-freezes and the audited amendments. */
export interface Freeze extends FrozenDraft { refreezes: Refreeze[]; amendments: Amendment[] }

export function readFreeze(file: string): Freeze | undefined {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Freeze) : undefined;
}

export function writeFreeze(file: string, freeze: Freeze): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(freeze, null, 2)}\n`);
}

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();
/** Comments inside an assertion (a `// TODO(harden)` mark) are not what it expects: removing one changes nothing. */
const withoutComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[\s,;{(\[])\/\/[^\n]*/g, '$1');

/**
 * A literal timeout-only options argument is mechanics (how long to wait), so hardening may add or change it:
 * `.toHaveCount(1, { timeout: 15_000 })` freezes as `.toHaveCount(1)`. Other options (ignoreCase, …) stay frozen.
 */
const withoutTimeout = (matcher: string) => matcher
  .replace(/,\s*\{\s*timeout:\s*[\d_]+\s*,?\s*\}\s*\)$/, ')')
  .replace(/\(\s*\{\s*timeout:\s*[\d_]+\s*,?\s*\}\s*\)$/, '()');

/**
 * Map "[REQ …] message #n" → frozen text for every requirement assertion.
 * Normally only the matcher (WHAT is expected) is frozen — the subject/locator is mechanics.
 * `[REQ AC-n strict]` freezes the whole assertion including its subject, for requirements where the
 * locator *is* the requirement (accessible names, roles, alt text).
 * Supports expect(…, '[REQ …]'), expect.soft(…) and expect.poll(fn, { message: '[REQ …]' }).
 */
export function reqAssertions(source: string): Map<string, string> {
  const map = new Map<string, string>();
  const seen = new Map<string, number>();
  const add = (message: string, subject: string, matcher: string) => {
    const n = (seen.get(message) ?? 0) + 1;
    seen.set(message, n);
    const strict = /^\[REQ [^\]]*\bstrict\b/.test(message);
    const [subj, match] = [withoutComments(subject), withoutComments(matcher)];
    map.set(n > 1 ? `${message} #${n}` : message, squash(strict ? `${subj} ${withoutTimeout(match)}` : withoutTimeout(match)));
  };
  // The subject may not cross a statement boundary (`;`) — otherwise a lazy match starting at an
  // earlier non-REQ expect( would swallow unrelated code up to the next [REQ …] message.
  // A message runs to the closing quote of its own kind: other quotes inside it (`[REQ AC-7] "Home" shown`) are text.
  const plain = /expect(?:\.soft)?\(\s*([^;]*?),\s*(['"`])(\[REQ [^\]]+\](?:(?!\2)[^\\\n]|\\.)*)\2\s*\)\s*((?:\.not)?\.to\w+\([\s\S]*?\))\s*;/g;
  for (const m of source.matchAll(plain)) add(m[3], m[1], m[4]);
  // expectResponse(res, { status, body }, '[REQ …]') from the fixtures: the expected status and body are the oracle.
  const response = /expectResponse\(\s*([^;]*?),\s*(\{[\s\S]*?\}),\s*(['"`])(\[REQ [^\]]+\](?:(?!\3)[^\\\n]|\\.)*)\3\s*\)\s*;/g;
  for (const m of source.matchAll(response)) add(m[4], m[1], `expectResponse ${m[2]}`);
  const poll = /expect\.poll\(((?:(?!expect[.(])[\s\S])*?)message:\s*(['"`])(\[REQ [^\]]+\](?:(?!\2)[^\\\n]|\\.)*)\2[\s\S]*?\}\s*\)\s*((?:\.not)?\.to\w+\([\s\S]*?\))\s*;/g;
  for (const m of source.matchAll(poll)) add(m[3], m[1], m[4]);
  return map;
}

export function reqConstants(source: string): string {
  return squash(source.match(/@req-constants-start([\s\S]*?)@req-constants-end/)?.[1] ?? '');
}

/** The draft as it is now: the hashes of its specs, the requirement contract's oracle and the hashes of the journeys they use. */
export function draftOf(testsDir: string, contractOracle: string, journeys: StoryJourneys = NO_JOURNEYS): FrozenDraft {
  const sources = specFiles(testsDir).map((f) => [path.relative(testsDir, f).split(path.sep).join('/'), fs.readFileSync(f, 'utf8')] as const);
  const specs = Object.fromEntries(sources.map(([name, src]) => [name, sha256(src)]));
  const assertions = Object.fromEntries(sources.map(([name, src]) => [name, assertionHashes(src)]));
  return { frozenAt: new Date().toISOString(), specs, assertions, contractOracle, journeys: journeys.hashes };
}

const assertionHashes = (src: string) => ({ req: Object.fromEntries([...reqAssertions(src)].map(([k, v]) => [k, sha256(v)])), constants: sha256(reqConstants(src)) });

/** The hardener's copy of the draft: the spec files and the test data, written over any earlier copy. */
export function copyDraft(testsDir: string, hardenedDir: string): string[] {
  fs.mkdirSync(hardenedDir, { recursive: true });
  for (const f of specFiles(hardenedDir)) fs.rmSync(f);
  const files = [...specFiles(testsDir), ...['test-data.json'].map((n) => path.join(testsDir, n)).filter((f) => fs.existsSync(f))];
  for (const f of files) {
    const to = path.join(hardenedDir, path.relative(testsDir, f));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(f, to);
  }
  return files.map((f) => path.relative(testsDir, f).split(path.sep).join('/'));
}

/**
 * What a revised draft changes in what the tests expect, against the assertion hashes frozen with the draft it
 * replaces (the freeze's own record, not a copy anyone can edit): for the audit of a re-freeze.
 */
export function revisionOf(previous: Pick<FrozenDraft, 'assertions'>, testsDir: string): Refreeze['absorbed'] {
  const out: Refreeze['absorbed'] = { changed: [], removed: [], constantsChanged: [], added: [] };
  const now = draftOf(testsDir, '').assertions;
  for (const relName of [...new Set([...Object.keys(previous.assertions), ...Object.keys(now)])]) {
    const d = previous.assertions[relName] ?? { req: {}, constants: sha256('') };
    const c = now[relName] ?? { req: {}, constants: sha256('') };
    for (const [k, v] of Object.entries(d.req)) if (!(k in c.req)) out.removed.push(`${relName}: ${k}`); else if (c.req[k] !== v) out.changed.push(`${relName}: ${k}`);
    for (const k of Object.keys(c.req)) if (!(k in d.req)) out.added.push(`${relName}: ${k}`);
    if (d.constants !== c.constants) out.constantsChanged.push(relName);
  }
  return out;
}

export function checkIntegrity(testsDir: string, hardenedDir: string, freeze: Freeze | undefined, contractOracle: string, journeys: StoryJourneys = NO_JOURNEYS): IntegrityResult {
  const result: IntegrityResult = { status: 'PRESERVED', checkedAt: new Date().toISOString(), draftChanged: [], files: [], removed: [], changed: [], amended: [], added: [], constantsChanged: [], unhardenedMarkers: [] };
  const amendments = freeze?.amendments ?? [];
  for (const file of specFiles(hardenedDir)) {
    const src = fs.readFileSync(file, 'utf8');
    src.split(/\r?\n/).forEach((text, i) => {
      if (/TODO\(harden\)/.test(text)) result.unhardenedMarkers.push({ file: path.relative(hardenedDir, file), line: i + 1, text: text.trim() });
    });
  }
  if (!freeze || !Object.keys(freeze.specs).length) return { ...result, status: 'NO_DRAFT' };
  for (const [relName, hash] of Object.entries(freeze.specs)) {
    const draftFile = path.join(testsDir, relName);
    const draftSrc = fs.existsSync(draftFile) ? fs.readFileSync(draftFile, 'utf8') : '';
    if (sha256(draftSrc) !== hash) result.draftChanged.push(relName);
    const curFile = path.join(hardenedDir, relName);
    const curSrc = fs.existsSync(curFile) ? fs.readFileSync(curFile, 'utf8') : '';
    const d = reqAssertions(draftSrc);
    const c = reqAssertions(curSrc);
    result.files.push({ file: relName, draftAssertions: d.size, currentAssertions: c.size });
    for (const [k, v] of d) {
      if (!c.has(k)) result.removed.push(`${relName}: ${k}`);
      else if (c.get(k) !== v) {
        const key = `${relName}: ${k}`;
        const ok = amendments.find((a) => a.assertion === key && a.draft === v && a.current === c.get(k));
        if (ok) result.amended.push(ok);
        else result.changed.push({ assertion: key, draft: v, current: c.get(k)! });
      }
    }
    for (const k of c.keys()) if (!d.has(k)) result.added.push(`${relName}: ${k}`);
    if (reqConstants(draftSrc) !== reqConstants(curSrc)) result.constantsChanged.push(relName);
  }
  // A draft frozen without the contract oracle, or with a different one, no longer proves what was expected.
  if (freeze.contractOracle !== contractOracle) result.contractChanged = true;
  // Journeys are HOW and may change after the freeze (listed); an expectation hidden in one escapes the freeze.
  const before = freeze.journeys ?? {};
  result.journeysChanged = Object.keys(journeys.hashes).filter((id) => before[id] !== journeys.hashes[id]);
  result.journeyAssertions = journeys.files.flatMap((f) => [...reqAssertions(fs.readFileSync(f, 'utf8')).keys()].map((k) => `${path.basename(f)}: ${k}`));
  if (result.draftChanged.length || result.removed.length || result.changed.length || result.constantsChanged.length || result.contractChanged || result.journeyAssertions.length) result.status = 'VIOLATED';
  else if (result.amended.length || amendments.length) {
    // Amendments stay visible even after a re-freeze absorbed them into the draft.
    for (const a of amendments) if (!result.amended.some((x) => x.assertion === a.assertion)) result.amended.push(a);
    result.status = 'AMENDED';
  }
  return result;
}
