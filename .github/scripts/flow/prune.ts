/**
 * Remove a story's scratch area (.heldout/<profile>/KEY/): the raw run output, the views and the working files. The
 * record is never touched. `heldout advance` does this when a story is complete, unless the project sets
 * "keepScratch": true.
 *
 *   heldout prune KEY
 *   heldout prune --all [--older-than 14d]     every story's scratch area (left untouched for that long)
 */
import fs from 'node:fs';
import path from 'node:path';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { ROOT, rel, removeDir } from '../core/files';
import { recordEvent } from '../core/history';
import { SCRATCH_DIR, evalPaths } from '../core/paths';

export const spec: CommandSpec = {
  name: 'prune', group: 'Report', usage: 'KEY | --all [--older-than 14d]',
  about: 'remove a story\'s scratch area (raw run output, views, working files); the record stays',
  flags: ['all', 'older-than'],
};

const newest = (dir: string): number => Math.max(fs.statSync(dir).mtimeMs, ...fs.readdirSync(dir, { recursive: true, withFileTypes: true }).map((d) => fs.statSync(path.join(d.parentPath, d.name)).mtimeMs));

export function run({ _, flags }: Args): void {
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (flags.all) {
    const root = path.join(ROOT, SCRATCH_DIR);
    const days = Number((flagStr(flags, 'older-than') ?? '0').replace(/d$/, ''));
    if (!fs.existsSync(root)) { console.log('Nothing to prune.'); return; }
    let freed = 0; let n = 0;
    for (const profile of fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      for (const story of fs.readdirSync(path.join(root, profile.name), { withFileTypes: true }).filter((d) => d.isDirectory())) {
        const dir = path.join(root, profile.name, story.name);
        if (days && Date.now() - newest(dir) < days * 86_400_000) continue;
        freed += removeDir(dir); n++;
      }
    }
    console.log(`✔ ${n} story scratch area(s) removed, ${mb(freed)} freed`);
    return;
  }
  const key = assertIssueKey(_[0]);
  const p = evalPaths(loadConfig({ key }), key);
  const freed = removeDir(p.work.base);
  if (freed && fs.existsSync(p.base)) recordEvent(p.history, 'pruned', { bytes: freed });
  console.log(freed ? `✔ ${rel(p.work.base)}/ removed, ${mb(freed)} freed (the record in ${rel(p.base)}/ is untouched)` : `Nothing to prune for ${key}.`);
}
