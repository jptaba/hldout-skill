/**
 * Held-out integrity: making the tests run may change HOW a test drives the application, never WHAT it expects. The
 * tests are generated from the contract's checks and assert by reference (`expectCheck('C3.1.a', actual)`): what is
 * expected lives in the contract alone, frozen by its oracle digest. The generated draft stays as frozen in 3-tests/
 * (freeze.json holds its hashes); the operator works on its copy in 4-hardening/. A violation: the draft or the
 * contract changed after the freeze, an expectation the draft names is gone or one is added, a test states an
 * expectation of its own, an actual value is not read from the application (a literal, or the row's own input: a
 * check that compares what it sent with itself passes vacuously), or a journey asserts anything.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { specFiles } from '../authoring/spec-model';

const sha256 = (s: string) => createHash('sha256').update(s.replace(/\r\n/g, '\n')).digest('hex');

/** The journeys a story's specs use: their files (checked for assertions) and a hash per journey id (frozen, compared). */
export interface StoryJourneys { files: string[]; hashes: Record<string, string> }
const NO_JOURNEYS: StoryJourneys = { files: [], hashes: {} };

export interface IntegrityResult {
  status: 'PRESERVED' | 'VIOLATED' | 'NO_DRAFT';
  checkedAt: string;
  /** Draft files changed or gone since the freeze: the draft is the frozen record, never edited after it. */
  draftChanged: string[];
  files: { file: string; draftChecks: number; currentChecks: number }[];
  /** Expectations the draft names that a test no longer asserts, and ones added after the freeze. */
  removed: string[];
  added: string[];
  /** Lines of a test that state an expectation of their own. */
  own: string[];
  /** expectCheck calls whose actual value is not read from the application. */
  echoed: string[];
  /** The requirement contract's oracle (criteria, checks, rules, errors) changed since the freeze. */
  contractChanged?: boolean;
  /** Journeys the tests use that changed (or are new) since the freeze: HOW, so not a violation; listed by id. */
  journeysChanged?: string[];
  /** Assertions inside journey files: an expectation there escapes the freeze. */
  journeyAssertions?: string[];
  unhardenedMarkers: { file: string; line: number; text: string }[];
}

/** One frozen draft: the hashes of the generated specs, the expectations each names, the contract's oracle and the journeys. */
export interface FrozenDraft {
  frozenAt: string;
  /** Each spec file (relative to the tests folder) and the SHA-256 of its source (line endings as LF). */
  specs: Record<string, string>;
  /** Per spec file, the expectation ids it asserts (expectCheck), each once a call. */
  checks: Record<string, string[]>;
  /** The requirement contract's oracle at the freeze (contract-model oracleDigest). */
  contractOracle: string;
  /** The hash of each journey the draft used, at the freeze. */
  journeys: Record<string, string>;
}

/** A re-freeze after a requirement revision or a corrected check: why, what it absorbed, and the draft it replaced. */
export interface Refreeze {
  at: string;
  reason: string;
  absorbed: { added: string[]; removed: string[]; contractOracleChanged?: boolean };
  previous: FrozenDraft;
}

/** The story's freeze.json: the frozen draft and its re-freezes. */
export interface Freeze extends FrozenDraft { refreezes: Refreeze[] }

export function readFreeze(file: string): Freeze | undefined {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Freeze) : undefined;
}

export function writeFreeze(file: string, freeze: Freeze): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(freeze, null, 2)}\n`);
}

const withoutComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[\s,;{(\[])\/\/[^\n]*/g, '$1');
const CALL = /\bexpectCheck\(\s*(['"`])(C\d+\.\d+\.[a-z])\1\s*,\s*([^,)]+?)\s*(?:,[^)]*)?\)/g;

/** The expectation ids a spec asserts, in order: each expectCheck call once. */
export function checkRefs(source: string): string[] {
  return [...withoutComments(source).matchAll(CALL)].map((m) => m[2]);
}

/** The lines of a spec that state an expectation of their own (expect(…), expectResponse(…)). */
export function ownExpectations(source: string): number[] {
  return source.split(/\r?\n/).map((l, i) => (/\bexpect(?:\.soft|\.poll)?\(|\bexpectResponse\(/.test(l.replace(/\/\/.*$/, '')) ? i + 1 : 0)).filter(Boolean);
}

/** A value that was not read from the application: a literal, or what the test itself sends (a row's input, its data). */
const NOT_READ = /^(?:-?\d[\d_.]*|true|false|null|undefined|(['"`])[^]*\1|\[[^]*\]|\{[^]*\}|row\.values\b[\w.[\]'"]*|data\.[\w.[\]'"]+)$/;

/**
 * The expectCheck calls whose actual value is not read from the application: given as a literal or as the test's own
 * input, directly or through a const assigned so in the same file. The value reached otherwise (a call, a locator's
 * text, a field of a response) is the application's.
 */
export function echoedActuals(source: string): string[] {
  const src = withoutComments(source);
  const out: string[] = [];
  for (const m of src.matchAll(CALL)) {
    const arg = m[3].trim();
    let why = NOT_READ.test(arg) ? arg : undefined;
    if (!why && /^[A-Za-z_$][\w$]*$/.test(arg)) {
      const before = src.slice(0, m.index);
      const decl = [...before.matchAll(new RegExp(`\\b(?:const|let|var)\\s+${arg.replace(/\$/g, '\\$')}\\s*(?::[^=;]+)?=\\s*([^;\\n]+)`, 'g'))].at(-1);
      const assigned = [...before.matchAll(new RegExp(`(?<![\\w$.])${arg.replace(/\$/g, '\\$')}\\s*=(?!=)\\s*([^;\\n]+)`, 'g'))].at(-1);
      const value = (assigned && (!decl || (assigned.index ?? 0) > (decl.index ?? 0)) ? assigned[1] : decl?.[1])?.trim();
      if (value && NOT_READ.test(value)) why = `${arg} = ${value}`;
    }
    if (why) out.push(`${m[2]}: ${why.slice(0, 80)}`);
  }
  return out;
}

/** The draft as it is now: the hashes of its specs, the expectations they name, the contract's oracle and the journeys. */
export function draftOf(testsDir: string, contractOracle: string, journeys: StoryJourneys = NO_JOURNEYS): FrozenDraft {
  const sources = specFiles(testsDir).map((f) => [path.relative(testsDir, f).split(path.sep).join('/'), fs.readFileSync(f, 'utf8')] as const);
  return {
    frozenAt: new Date().toISOString(), specs: Object.fromEntries(sources.map(([name, src]) => [name, sha256(src)])),
    checks: Object.fromEntries(sources.map(([name, src]) => [name, checkRefs(src)])), contractOracle, journeys: journeys.hashes,
  };
}

/** The operator's copy of the draft: the spec files and the test data, written over any earlier copy. */
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

/** What a draft generated again changes in the expectations it names, against the freeze's own record: for the audit of a re-freeze. */
export function revisionOf(previous: Pick<FrozenDraft, 'checks'>, testsDir: string): Pick<Refreeze['absorbed'], 'added' | 'removed'> {
  const was = new Set(Object.values(previous.checks ?? {}).flat());
  const now = new Set(Object.values(draftOf(testsDir, '').checks).flat());
  return { added: [...now].filter((c) => !was.has(c)), removed: [...was].filter((c) => !now.has(c)) };
}

/** Each id as often as it is asserted, so a call removed while a second of the same id stays is still a removal. */
const counted = (ids: string[]) => ids.map((id, i) => `${id}${ids.slice(0, i).filter((x) => x === id).length ? ` #${ids.slice(0, i).filter((x) => x === id).length + 1}` : ''}`);

export function checkIntegrity(testsDir: string, hardenedDir: string, freeze: Freeze | undefined, contractOracle: string, journeys: StoryJourneys = NO_JOURNEYS): IntegrityResult {
  const result: IntegrityResult = { status: 'PRESERVED', checkedAt: new Date().toISOString(), draftChanged: [], files: [], removed: [], added: [], own: [], echoed: [], unhardenedMarkers: [] };
  for (const file of specFiles(hardenedDir)) {
    fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((text, i) => {
      if (/TODO\(harden\)/.test(text)) result.unhardenedMarkers.push({ file: path.relative(hardenedDir, file), line: i + 1, text: text.trim() });
    });
  }
  if (!freeze || !Object.keys(freeze.specs).length) return { ...result, status: 'NO_DRAFT' };
  for (const [relName, hash] of Object.entries(freeze.specs)) {
    const draftFile = path.join(testsDir, relName);
    if (sha256(fs.existsSync(draftFile) ? fs.readFileSync(draftFile, 'utf8') : '') !== hash) result.draftChanged.push(relName);
    const curFile = path.join(hardenedDir, relName);
    const cur = fs.existsSync(curFile) ? fs.readFileSync(curFile, 'utf8') : '';
    const d = counted(freeze.checks?.[relName] ?? []); const c = counted(checkRefs(cur));
    result.files.push({ file: relName, draftChecks: d.length, currentChecks: c.length });
    result.removed.push(...d.filter((k) => !c.includes(k)).map((k) => `${relName}: ${k}`));
    result.added.push(...c.filter((k) => !d.includes(k)).map((k) => `${relName}: ${k}`));
    result.own.push(...ownExpectations(cur).map((l) => `${relName}: line ${l}`));
    result.echoed.push(...echoedActuals(cur).map((x) => `${relName}: ${x}`));
  }
  // A draft frozen with a different contract oracle no longer proves what was expected.
  if (freeze.contractOracle !== contractOracle) result.contractChanged = true;
  // Journeys are HOW and may change after the freeze (listed); an expectation hidden in one escapes the freeze.
  const before = freeze.journeys ?? {};
  result.journeysChanged = Object.keys(journeys.hashes).filter((id) => before[id] !== journeys.hashes[id]);
  // A wait for a page to be ready (`expect(…).toBeVisible()`) is a journey's mechanics; a requirement's expectation is not.
  result.journeyAssertions = journeys.files.flatMap((f) => fs.readFileSync(f, 'utf8').split(/\r?\n/).map((l, i) => (/\bexpectCheck\(|\bexpectResponse\(|\[REQ /.test(l.replace(/\/\/.*$/, '')) ? `${path.basename(f)}: line ${i + 1}` : '')).filter(Boolean));
  if (result.draftChanged.length || result.removed.length || result.added.length || result.own.length || result.echoed.length || result.contractChanged || result.journeyAssertions.length) result.status = 'VIOLATED';
  return result;
}
