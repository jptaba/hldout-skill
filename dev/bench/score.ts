/**
 * The benchmark's score, from what is known exactly: which faults were on, and which of a finding's tests fail
 * because of which fault (each test run again with no fault on, then with one fault on at a time). No keyword is
 * matched and no prose is read.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface Key {
  key: string; size: 'small' | 'medium' | 'large';
  /** The verdicts that are right while no fault is on. */
  clean: string[];
  faults: { id: string; storyText: string[]; seen: string }[];
  traps: { kind: 'contradiction' | 'figure-twice' | 'no-oracle'; storyText: string[]; expected: string }[];
}
/** A finding the verdict reports as an application defect, or a failure it turned into a question for the owner. */
export interface Finding { id: string; title: string; tests: string[] }
export interface Evidence {
  /** The faults that were on while the story was evaluated. */
  on: string[];
  verdict: string;
  findings: Finding[];
  questions: Finding[];
  /** Tests that fail with no fault on. */
  failsClean: string[];
  /** Per fault that was on: the tests that fail with only it on. */
  failsWith: Record<string, string[]>;
}
export interface Score {
  expected: string[]; verdict: string; verdictAsKeyed: boolean;
  /** Faults a finding's test fails on, and on no clean application. */
  found: string[];
  /** Faults that only a question's test fails on: surfaced, not reported as a defect. */
  asQuestion: string[];
  missed: string[];
  /** Findings every test of which fails with no fault on: the application is right and the finding is not. */
  falsePositives: string[];
  /** Findings no single fault explains and the clean application doesn't either (two faults together, or a test that is not stable): read by hand. */
  unexplained: string[];
}

export const KEYS_DIR = path.resolve(import.meta.dirname, '..', '..', 'demo', 'bench', 'keys');
export const readKey = (key: string): Key => JSON.parse(fs.readFileSync(path.join(KEYS_DIR, `${key}.json`), 'utf8')) as Key;
export const keyNames = (): string[] => (fs.existsSync(KEYS_DIR) ? fs.readdirSync(KEYS_DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : []);

const norm = (v: string) => v.toUpperCase().replace(/[\s-]+/g, '_');

export function score(key: Key, e: Evidence): Score {
  const inScope = e.on.filter((id) => key.faults.some((f) => f.id === id));
  const expected = inScope.length ? ['FAIL'] : key.clean.map(norm);
  const clean = new Set(e.failsClean);
  // A fault explains a test that fails with it on and passes with nothing on.
  const explains = (tests: string[]) => inScope.filter((id) => tests.some((t) => !clean.has(t) && (e.failsWith[id] ?? []).includes(t)));
  const found = new Set<string>(); const falsePositives: string[] = []; const unexplained: string[] = [];
  for (const f of e.findings) {
    const by = explains(f.tests);
    for (const id of by) found.add(id);
    if (by.length) continue;
    (f.tests.length && f.tests.every((t) => clean.has(t)) ? falsePositives : unexplained).push(f.id);
  }
  const asQuestion = [...new Set(e.questions.flatMap((q) => explains(q.tests)))].filter((id) => !found.has(id));
  return {
    expected, verdict: norm(e.verdict), verdictAsKeyed: expected.includes(norm(e.verdict)),
    found: [...found].sort(), asQuestion: asQuestion.sort(),
    missed: inScope.filter((id) => !found.has(id) && !asQuestion.includes(id)).sort(),
    falsePositives, unexplained,
  };
}

/** What a key says that its story doesn't hold, or that the catalogue doesn't: [] when the key is sound. */
export function keyProblems(key: Key, storyText: string, faultIds: string[]): string[] {
  const plain = (s: string) => s.toLowerCase().replace(/\s+/g, ' ');
  const story = plain(storyText);
  const missing = (phrases: string[]) => phrases.filter((p) => !story.includes(plain(p)));
  return [
    ...(key.clean.length && key.clean.every((v) => ['PASS', 'PASS_WITH_WARNINGS'].includes(v)) ? [] : ['clean: PASS and/or PASS_WITH_WARNINGS']),
    ...key.faults.filter((f) => !faultIds.includes(f.id)).map((f) => `${f.id}: no such fault`),
    ...key.faults.flatMap((f) => (f.storyText.length ? missing(f.storyText).map((p) => `${f.id}: "${p}" is not in the story`) : [`${f.id}: names no text of the story`])),
    ...key.traps.flatMap((t, i) => (t.storyText.length ? missing(t.storyText).map((p) => `trap ${i + 1}: "${p}" is not in the story`) : [`trap ${i + 1}: names no text of the story`])),
  ];
}
