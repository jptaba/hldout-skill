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

const MARK = /[ \t]*\/\/[ \t]*TODO\(harden\)[^\n]*/g;

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
    const src = fs.readFileSync(file, 'utf8');
    const marks = src.match(MARK)?.length ?? 0;
    if (!marks) { console.log(`• ${rel(file)}: no TODO(harden) mark`); continue; }
    // A line holding only the mark goes; a mark after code is cut off the line.
    const out = src.split('\n').filter((l) => !/^[ \t]*\/\/[ \t]*TODO\(harden\)/.test(l)).join('\n').replace(MARK, '');
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
