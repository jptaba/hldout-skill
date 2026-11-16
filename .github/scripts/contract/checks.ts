/**
 * The checks of a requirement contract: what is tested and what is expected, as data. Each criterion lists the
 * fewest checks that could prove it false; each check says its starting state and its action in words, and each
 * expectation holds a comparator, a value and the source line the value comes from. The tests are generated from
 * them (scaffold) and assert by reference (`expectCheck('C3.1.a', actual)`): no expected value is in test code, so
 * whoever makes the tests run has nothing to weaken.
 *
 * This module validates mechanically what a script can: shape, ids, the budget, and that every expected value is in
 * the line it cites (or in the answered or assumed gap the check rests on). Whether a check would prove its
 * criterion false is the reviewer's to judge.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { ContractFinding, Layer, RequirementContract } from './contract-model';
import { numbersIn, parseRange } from './evidence';

export const COMPARATORS = ['equals', 'contains', 'matches', 'one-of', 'at-least', 'at-most', 'status', 'absent'] as const;
export type Comparator = typeof COMPARATORS[number];
export const CHECK_TYPES = ['concurrency', 'idempotency', 'security', 'boundary', 'contract', 'composition', 'integration', 'accessibility', 'negative', 'functional'] as const;
export type ExpectedValue = string | number | boolean | (string | number)[];

export interface Expectation {
  /** The check's id and a letter: "C3.1.a". */
  id: string;
  /** What is observed, in the story's words: "the status", "the message shown", "the number of products listed". */
  what: string;
  /**
   * equals, contains, at-least, at-most: against the value. matches: the value is a pattern of the story's own words.
   * one-of: the value is a list. status: the value is a status (204) or a class ("2xx", "4xx") for "is accepted" and
   * "is refused" with no stated status. absent: what is observed must not be there; no value.
   */
  comparator: Comparator;
  value?: ExpectedValue;
  /** The line the value comes from: "story.md#L27", "linked/confluence-1-rules.md#L4-L6". */
  source: string;
}
/** One variant of a check: the same action with other input, and, where the story states it, another expected value. */
export interface CheckRow {
  label: string;
  /** The input of this row, by name, as the story gives it. */
  values?: Record<string, string | number | boolean>;
  /** Expected values that differ in this row, by expectation id. */
  expect?: Record<string, ExpectedValue>;
}
export interface Check {
  /** "C3.1": the first check of AC-3. */
  id: string;
  /** What is checked, in a line a reader who doesn't read code follows. */
  title: string;
  /** A label: what a failure would mean (a limit, a refusal, who may do it…). Never a reason for the check. */
  type: typeof CHECK_TYPES[number];
  layer: Layer;
  /** The starting state and the action, in words: one step a line, as a person would do it. */
  given: string[];
  when: string[];
  expect: Expectation[];
  rows?: CheckRow[];
  /** Gaps the expected values rest on: an assumed value, or an open question tested by its literal reading. */
  restsOn?: string[];
}

/** The most checks a criterion gets without `budget` saying what it states that needs more. */
export const CHECK_BUDGET = 4;
/** The most rows a check gets. */
export const ROW_BUDGET = 6;

export const checksOf = (c: Pick<RequirementContract, 'acceptanceCriteria'>): { ac: string; check: Check }[] =>
  (c.acceptanceCriteria ?? []).flatMap((a) => (a.checks ?? []).map((check) => ({ ac: a.id, check })));
export const hasChecks = (c: Pick<RequirementContract, 'acceptanceCriteria'>) => checksOf(c).length > 0;

const plain = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[*_`|]+/g, '').replace(/\s+/g, ' ');

/** The text of the lines a source reference cites, or undefined when the file or the lines don't exist. */
export function citedText(reqDir: string, ref: string): string | undefined {
  const r = parseRange(ref);
  const file = path.join(reqDir, r?.file ?? ref.replace(/#.*$/, ''));
  if (!r || !fs.existsSync(file)) return undefined;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  return r.from >= 1 && r.to <= lines.length ? lines.slice(r.from - 1, r.to).join('\n') : undefined;
}

/** Is the value in the text? A number as a figure or a number word, a pattern by its words, anything else as it reads. */
export function grounded(value: ExpectedValue, comparator: Comparator, text: string): boolean {
  if (Array.isArray(value)) return value.every((v) => grounded(v, 'equals', text));
  if (typeof value === 'boolean') return true;
  if (comparator === 'status' && typeof value === 'string' && /^[1-5]xx$/.test(value)) return true;
  if (typeof value === 'number') return numbersIn(text).has(value);
  if (comparator === 'matches') return (value.toLowerCase().match(/[a-z]{3,}/g) ?? []).every((w) => plain(text).includes(w));
  return plain(text).includes(plain(value)) || (/^\d+(\.\d+)?$/.test(value) && numbersIn(text).has(Number(value)));
}

/** What is wrong with the contract's checks: [] when they are sound. Nothing when the contract has none. */
export function checkChecks(c: RequirementContract, reqDir: string): ContractFinding[] {
  const out: ContractFinding[] = [];
  const err = (code: string, message: string) => out.push({ level: 'error', code, message });
  if (!hasChecks(c)) return out;
  const gaps = new Map((c.gaps ?? []).map((g) => [g.id, g]));
  const seen = new Set<string>();
  for (const ac of c.acceptanceCriteria) {
    const checks = ac.checks ?? [];
    if (!checks.length) { err('no-checks', `${ac.id} has no check: give it the fewest that could prove it false (its plain case, each limit and each refusal it states)`); continue; }
    if (checks.length > CHECK_BUDGET && !ac.budget?.trim()) err('over-budget', `${ac.id} has ${checks.length} checks, more than ${CHECK_BUDGET}: make variants rows of one check, or say in ${ac.id}.budget what the criterion states that needs more`);
    const n = ac.id.replace(/^AC-/, '');
    for (const k of checks) {
      const at = `${ac.id} ${k.id ?? '(a check without id)'}`;
      if (!new RegExp(`^C${n}\\.\\d+$`).test(k.id ?? '')) err('check-id', `${at}: a check of ${ac.id} is C${n}.1, C${n}.2…`);
      if (seen.has(k.id)) err('check-id', `${k.id} appears twice`);
      seen.add(k.id);
      if (!k.title?.trim()) err('check-shape', `${at} has no title`);
      if (!CHECK_TYPES.includes(k.type)) err('check-shape', `${at}: type is one of ${CHECK_TYPES.join(', ')}`);
      if (!['ui', 'api', 'e2e'].includes(k.layer)) err('check-shape', `${at}: layer is ui, api or e2e`);
      if (!Array.isArray(k.given) || !Array.isArray(k.when) || !k.when?.length) err('check-shape', `${at}: given and when are lists of steps in words, and when has at least one`);
      if (!Array.isArray(k.expect) || !k.expect.length) { err('check-shape', `${at} expects nothing`); continue; }
      for (const g of k.restsOn ?? []) {
        if (!gaps.has(g)) err('unknown-gap', `${at} rests on ${g}, which is not in gaps[]`);
        else if (gaps.get(g)!.kind !== 'oracle') err('rests-on-mechanics', `${at} rests on ${g}, a mechanics gap: restsOn names only oracle gaps (what is correct), never how a step is done`);
      }
      // A value may also come from the gap the check rests on, once that gap has an answer or an assumption.
      const gapText = (k.restsOn ?? []).map((g) => gaps.get(g)?.value ?? '').join('\n');
      if ((k.rows?.length ?? 0) > ROW_BUDGET) err('over-budget', `${at} has ${k.rows!.length} rows, more than ${ROW_BUDGET}: a row on each limit, one just past it, and the values the story names`);
      const labels = (k.rows ?? []).map((r) => r.label);
      if (labels.some((l, i) => !l?.trim() || labels.indexOf(l) !== i)) err('check-shape', `${at}: each row has a label of its own`);
      const ids = new Set<string>();
      for (const e of k.expect) {
        const where = `${at} ${e.id ?? '(an expectation without id)'}`;
        if (!new RegExp(`^${(k.id ?? '').replace('.', '\\.')}\\.[a-z]$`).test(e.id ?? '') || ids.has(e.id)) err('check-id', `${where}: the expectations of ${k.id} are ${k.id}.a, ${k.id}.b…, each once`);
        ids.add(e.id);
        if (!e.what?.trim()) err('check-shape', `${where} doesn't say what is observed`);
        if (!COMPARATORS.includes(e.comparator)) { err('check-shape', `${where}: comparator is one of ${COMPARATORS.join(', ')}`); continue; }
        if (e.comparator === 'absent' ? e.value !== undefined : e.value === undefined) err('check-shape', `${where}: ${e.comparator === 'absent' ? '"absent" takes no value' : 'no expected value'}`);
        if (e.comparator === 'one-of' && !Array.isArray(e.value)) err('check-shape', `${where}: "one-of" takes a list of values`);
        if (e.comparator === 'absent') continue;
        const text = citedText(reqDir, e.source ?? '');
        if (text === undefined) { err('check-source', `${where}: ${e.source || 'no source'} is not a line of the story's sources (story.md#L12, linked/<page>.md#L4-L6)`); continue; }
        const values = [e.value, ...(k.rows ?? []).map((r) => r.expect?.[e.id])].filter((v): v is ExpectedValue => v !== undefined);
        for (const v of values) {
          if (!grounded(v, e.comparator, `${text}\n${gapText}`)) err('ungrounded-value', `${where}: ${JSON.stringify(v)} is not in ${e.source}${k.restsOn?.length ? ` nor in the answer of ${k.restsOn.join(', ')}` : ''} — an expected value is copied from the line it cites; what the story doesn't state is a gap the check rests on`);
        }
      }
      for (const r of k.rows ?? []) for (const id of Object.keys(r.expect ?? {})) if (!ids.has(id)) err('check-shape', `${at}, row "${r.label}": ${id} is not an expectation of ${k.id}`);
    }
  }
  return out;
}
