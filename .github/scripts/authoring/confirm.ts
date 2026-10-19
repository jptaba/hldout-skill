/**
 * Hardening — the guesses that turned out right. A draft marks every guessed locator, route and field with
 * `// TODO(harden)`. When the probe shows a file's guesses were right, this removes its marks in one go (the code stays
 * as it is) and notes it in the hardening log, instead of one edit per mark. A guess that was wrong is edited by hand
 * first: what is left when this runs is what the evidence confirmed.
 *
 *   heldout confirm KEY --file journeys/fixtures/cart.ts [--file …] --evidence P7
 *
 * The evidence is the probe that showed it (Pn: its report is kept in the story's 4-evidence/), or the run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { flagList, flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { ROOT, rel } from '../core/files';
import { evalPaths } from '../core/paths';
import { citeProbes } from '../core/probe-log';

const MARK = 'TODO(harden)';

interface Comment { start: number; end: number; block: boolean }

/** Words after which a `/` starts a regular expression, not a division. */
const BEFORE_REGEX = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'void', 'yield', 'await', 'delete', 'instanceof', 'new', 'throw']);

/**
 * The comments of a TypeScript source, found in one pass that knows strings, template literals (with their `${…}`
 * parts) and regular expressions, so a `//` or `/*` inside any of them is never taken for a comment. A line comment
 * ends before its line ending.
 */
export function commentsOf(src: string): Comment[] {
  const out: Comment[] = [];
  const templates: number[] = []; // brace depth at which each open template resumes
  let depth = 0;
  let prev = ''; // the last token: '' at the start, a punctuator, or 'a' for a value
  let i = 0;
  const n = src.length;
  const template = (from: number): number => { // scans a template body from `from`; returns where scanning resumes
    let j = from;
    while (j < n) {
      if (src[j] === '\\') { j += 2; continue; }
      if (src[j] === '`') return j + 1;
      if (src[j] === '$' && src[j + 1] === '{') { templates.push(depth); depth++; return j + 2; }
      j++;
    }
    return n;
  };
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') {
      let end = src.indexOf('\n', i);
      if (end < 0) end = n; else if (src[end - 1] === '\r') end--;
      out.push({ start: i, end, block: false }); i = end; continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const close = src.indexOf('*/', i + 2);
      const end = close < 0 ? n : close + 2;
      out.push({ start: i, end, block: true }); i = end; continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      i = j + 1; prev = 'a'; continue;
    }
    if (c === '`') { i = template(i + 1); prev = 'a'; continue; }
    if (c === '/' && (prev === '' || prev === 'kw' || '(,=:[!&|?{};+-*%<>~^'.includes(prev))) {
      let j = i + 1; let inClass = false;
      while (j < n && src[j] !== '\n') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '[') inClass = true; else if (src[j] === ']') inClass = false; else if (src[j] === '/' && !inClass) break;
        j++;
      }
      i = j + 1;
      while (i < n && /[a-z]/i.test(src[i])) i++;
      prev = 'a'; continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w$]/.test(src[j])) j++;
      prev = BEFORE_REGEX.has(src.slice(i, j)) ? 'kw' : 'a'; i = j; continue;
    }
    if (c === '{') depth++;
    if (c === '}') {
      if (templates.length && templates.at(-1) === depth - 1) { templates.pop(); depth--; i = template(i + 1); prev = 'a'; continue; }
      depth--;
    }
    if (!/\s/.test(c)) prev = /[\w)\]]/.test(c) ? 'a' : c;
    i++;
  }
  return out;
}

/** Text before a mark, without the separator that led into it (`:`, a dash, spaces); a sentence's full stop stays. */
const beforeMark = (s: string) => s.replace(/[ \t]*(?:[:\-–—][ \t]*)?$/, '');

/**
 * The source with every TODO(harden) mark that sits in a comment removed, the code unchanged: the mark and the rest of
 * its comment line go (a line comment's `//` too when nothing is left of it; a block comment keeps its `*\/`, and one
 * left empty goes), and a line left blank or holding only a `*` goes, its line ending with it. Line endings are kept as
 * they are. A mark outside a comment (in code, a string or a template) is left, and counted in `left`.
 */
export function withoutMarks(src: string): { out: string; removed: number; left: number } {
  const marks: number[] = [];
  for (let at = src.indexOf(MARK); at >= 0; at = src.indexOf(MARK, at + MARK.length)) marks.push(at);
  // The source's lines, each with its offsets and its own line ending.
  const lines = src.split(/(?<=\n)/).reduce<{ start: number; end: number; text: string; ending: string }[]>((acc, raw) => {
    const start = acc.length ? acc.at(-1)!.end + acc.at(-1)!.ending.length : 0;
    const text = raw.replace(/\r?\n$/, '');
    acc.push({ start, end: start + text.length, text, ending: raw.slice(text.length) });
    return acc;
  }, []);
  const lineOf = (at: number) => lines.findIndex((l) => at >= l.start && at <= l.end);
  /** Deletions, each within one line: [start, end) in source offsets. */
  const cuts: [number, number][] = [];
  const leadingSpace = (at: number) => at - (src.slice(lines[lineOf(at)].start, at).match(/[ \t]*$/)?.[0].length ?? 0);
  let removed = 0;
  for (const c of commentsOf(src)) {
    const inside = marks.filter((m) => m >= c.start && m < c.end);
    if (!inside.length) continue;
    removed += inside.length;
    if (!c.block) {
      const kept = beforeMark(src.slice(c.start + 2, inside[0]));
      cuts.push(kept.trim() ? [c.start + 2 + kept.length, c.end] : [leadingSpace(c.start), c.end]);
      continue;
    }
    // A block comment: from each mark to the end of its line, or to the `*/` on that line (kept, a space before it).
    const blockCuts: [number, number][] = [];
    for (const m of inside) {
      const line = lines[lineOf(m)];
      const close = src.indexOf('*/', m);
      const stop = close >= 0 && close < line.end && close + 2 === c.end ? close : line.end;
      const head = beforeMark(src.slice(line.start, m));
      blockCuts.push([line.start + head.length + (stop === close && head.trim() ? 1 : 0), stop]);
    }
    // Nothing left but the comment's own punctuation: the whole comment goes, line by line.
    let rest = src.slice(c.start, c.end);
    for (const [a, b] of [...blockCuts].sort((x, y) => y[0] - x[0])) rest = rest.slice(0, a - c.start) + rest.slice(b - c.start);
    if (/^\/\*[\s*]*\*\/$/.test(rest)) {
      for (let k = lineOf(c.start); k <= lineOf(c.end); k++) cuts.push([Math.max(lines[k].start, k === lineOf(c.start) ? leadingSpace(c.start) : 0), Math.min(lines[k].end, c.end)]);
    } else cuts.push(...blockCuts);
  }
  // Apply the cuts line by line: a line they leave blank or holding only a `*` goes with its line ending; a `* */`
  // line keeps only ` */`. Every other line, and every line ending, stays as it was.
  const out = lines.map((line) => {
    // Overlapping cuts (two marks on one line) merged, then applied from the end of the line.
    const mine = cuts.filter(([a]) => a >= line.start && a <= line.end).sort((x, y) => x[0] - y[0])
      .reduce<[number, number][]>((acc, [a, b]) => { const last = acc.at(-1); if (last && a <= last[1]) last[1] = Math.max(last[1], b); else acc.push([a, b]); return acc; }, [])
      .reverse();
    if (!mine.length) return line.text + line.ending;
    let text = line.text;
    for (const [a, b] of mine) text = text.slice(0, a - line.start) + text.slice(b - line.start);
    text = text.replace(/[ \t]+$/, '');
    if (!text.trim() || /^[ \t]*\*+[ \t]*$/.test(text)) return '';
    const closing = /^([ \t]*)\*[ \t]+\*\/$/.exec(text);
    return `${closing ? `${closing[1]} */` : text}${line.ending}`;
  }).join('');
  return { out, removed, left: marks.length - removed };
}

export const spec: CommandSpec = {
  name: 'confirm', group: 'Hardening', usage: 'KEY --file <spec or journey file>… --evidence Pn',
  about: 'remove the TODO(harden) marks of guesses the probe showed were right, in one go',
  flags: ['evidence', 'file'],
};

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const files = flagList(flags, 'file');
  const evidence = flagStr(flags, 'evidence');
  if (!files.length) throw new Error('--file <path> names the spec or journey file whose guesses the probe confirmed (repeat it for more files)');
  if (!evidence) throw new Error('--evidence "<the probe (Pn) or the run>" says what showed the guesses were right');
  citeProbes(cfg, key, evidence);
  const noted: string[] = [];
  for (const f of files) {
    const file = path.resolve(ROOT, f);
    if (!file.startsWith(ROOT) || !file.endsWith('.ts') || !fs.existsSync(file)) throw new Error(`${f} is not a .ts file of this project`);
    const { out, removed: marks, left } = withoutMarks(fs.readFileSync(file, 'utf8'));
    if (!marks && !left) { console.log(`• ${rel(file)}: no TODO(harden) mark`); continue; }
    if (left) console.log(`⚠ ${rel(file)}: ${left} TODO(harden) outside a comment (in code or a string) left as it is — edit it by hand`);
    if (!marks) continue;
    fs.writeFileSync(file, out);
    console.log(`✔ ${rel(file)}: ${marks} TODO(harden) mark(s) removed, the code unchanged`);
    noted.push(`- ${rel(file)}: ${marks} guess(es) confirmed as drafted — ${evidence}`);
  }
  if (noted.length && fs.existsSync(p.hardeningLog)) {
    const heading = '**Guesses confirmed unchanged** (`heldout confirm`):';
    const log = fs.readFileSync(p.hardeningLog, 'utf8').replace(/\s+$/, '');
    // A second call adds to the list of the first when that list still ends the log.
    const last = log.lastIndexOf(heading);
    const joins = last >= 0 && log.slice(last + heading.length).split('\n').every((l) => !l.trim() || l.startsWith('- '));
    fs.writeFileSync(p.hardeningLog, `${log}\n${joins ? '' : `\n${heading}\n`}${noted.join('\n')}\n`);
    console.log(`  noted in ${rel(p.hardeningLog)} — the log changed: read it again before you edit it`);
  }
  if (noted.length) console.log(`Next: npm run heldout -- integrity ${key}   (must say PRESERVED)`);
}
