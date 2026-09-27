/**
 * Held-out integrity: hardening/repair may change HOW a test drives the AUT (locators, waits, navigation),
 * never WHAT it expects. We compare every `[REQ …]` assertion and the `@req-constants` block between the
 * pre-hardening draft snapshot and the current spec.
 *
 * Amendments: an assertion whose *implementation* was wrong (e.g. an over-strict regex) may be fixed
 * only through an audited amendment (hardening/amendments.json, written by `integrity.ts --amend`),
 * which records draft → current text and a reason. Amendments are listed in the verdict. Any other
 * change is a violation.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface IntegrityResult {
  status: 'PRESERVED' | 'AMENDED' | 'VIOLATED' | 'NO_DRAFT';
  checkedAt: string;
  files: { file: string; draftAssertions: number; currentAssertions: number }[];
  removed: string[];
  changed: { assertion: string; draft: string; current: string }[];
  amended: Amendment[];
  added: string[];
  constantsChanged: string[];
  /** The requirement contract's oracle part (ACs, outcomes, rules, error model) changed since the freeze. */
  contractChanged?: boolean;
  unhardenedMarkers: { file: string; line: number; text: string }[];
}

export interface Amendment { assertion: string; draft: string; current: string; reason: string; approvedAt: string }

export function readAmendments(file: string): Amendment[] {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Amendment[]) : [];
}

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

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
    map.set(n > 1 ? `${message} #${n}` : message, squash(strict ? `${subject} ${withoutTimeout(matcher)}` : withoutTimeout(matcher)));
  };
  // The subject may not cross a statement boundary (`;`) — otherwise a lazy match starting at an
  // earlier non-REQ expect( would swallow unrelated code up to the next [REQ …] message.
  const plain = /expect(?:\.soft)?\(\s*([^;]*?),\s*(['"`])(\[REQ [^\]]+\][^'"`]*)\2\s*\)\s*((?:\.not)?\.to\w+\([\s\S]*?\))\s*;/g;
  for (const m of source.matchAll(plain)) add(m[3], m[1], m[4]);
  const poll = /expect\.poll\(((?:(?!expect[.(])[\s\S])*?)message:\s*(['"`])(\[REQ [^\]]+\][^'"`]*)\2[\s\S]*?\}\s*\)\s*((?:\.not)?\.to\w+\([\s\S]*?\))\s*;/g;
  for (const m of source.matchAll(poll)) add(m[3], m[1], m[4]);
  return map;
}

export function reqConstants(source: string): string {
  return squash(source.match(/@req-constants-start([\s\S]*?)@req-constants-end/)?.[1] ?? '');
}

const specFiles = (dir: string): string[] => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.spec.ts')).map((f) => path.join(dir, f))
  : []);

/** Frozen alongside the draft specs when a requirement contract exists (see lib/contract.ts oracleDigest). */
export const CONTRACT_ORACLE_FILE = 'contract-oracle.json';

/** Freeze the draft specs together with the requirement contract's oracle (lib/contract.ts oracleDigest). */
export function snapshotDraft(testsDir: string, draftDir: string, contractOracle: string): string[] {
  const copied: string[] = [];
  fs.mkdirSync(draftDir, { recursive: true });
  fs.writeFileSync(path.join(draftDir, CONTRACT_ORACLE_FILE), contractOracle);
  for (const file of specFiles(testsDir)) {
    const dest = path.join(draftDir, path.relative(testsDir, file));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file, dest);
    copied.push(dest);
  }
  return copied;
}

export function checkIntegrity(testsDir: string, draftDir: string, amendmentsFile: string | undefined, contractOracle: string): IntegrityResult {
  const result: IntegrityResult = { status: 'PRESERVED', checkedAt: new Date().toISOString(), files: [], removed: [], changed: [], amended: [], added: [], constantsChanged: [], unhardenedMarkers: [] };
  const amendments = amendmentsFile ? readAmendments(amendmentsFile) : [];
  const current = specFiles(testsDir);
  for (const file of current) {
    const src = fs.readFileSync(file, 'utf8');
    src.split(/\r?\n/).forEach((text, i) => {
      if (/TODO\(harden\)/.test(text)) result.unhardenedMarkers.push({ file: path.relative(testsDir, file), line: i + 1, text: text.trim() });
    });
  }
  const drafts = specFiles(draftDir);
  if (!drafts.length) return { ...result, status: 'NO_DRAFT' };
  for (const draftFile of drafts) {
    const relName = path.relative(draftDir, draftFile);
    const curFile = path.join(testsDir, relName);
    const draftSrc = fs.readFileSync(draftFile, 'utf8');
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
  const frozenOracle = path.join(draftDir, CONTRACT_ORACLE_FILE);
  // A draft frozen without the contract oracle, or with a different one, no longer proves what was expected.
  if (!fs.existsSync(frozenOracle) || fs.readFileSync(frozenOracle, 'utf8') !== contractOracle) result.contractChanged = true;
  if (result.removed.length || result.changed.length || result.constantsChanged.length || result.contractChanged) result.status = 'VIOLATED';
  else if (result.amended.length || amendments.length) {
    // Amendments stay visible even after a re-freeze absorbed them into the draft.
    for (const a of amendments) if (!result.amended.some((x) => x.assertion === a.assertion)) result.amended.push(a);
    result.status = 'AMENDED';
  }
  return result;
}
