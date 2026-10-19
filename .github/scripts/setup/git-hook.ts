/**
 * The project's pre-commit hook, opt-in (`heldout init --git-hooks`): it runs `heldout precommit`, which refuses a
 * commit carrying a secret value or an oversized file in the output folder. Installed where git looks for this
 * repository's hooks (its hooks folder, or core.hooksPath when that is inside the repository); git runs a hook from the
 * repository's top folder, so a project in a sub-folder gets a hook that goes there first. Never written over a
 * pre-commit hook the project already has, nor into a hooks folder outside the repository (a global core.hooksPath
 * runs for every repository the user has): init then prints what to add instead.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const HOOK_LINE = 'npm run --silent heldout -- precommit';

/** The shell command that goes to the project at `prefix` inside its repository ('' at the top): the folder name quoted. */
const cdTo = (prefix: string) => (prefix ? `cd "$(git rev-parse --show-toplevel)"/'${prefix.replace(/\/+$/, '').replace(/'/g, `'\\''`)}'` : '');

/** The hook, for a project at `prefix` inside its repository. */
export function hookScript(prefix = ''): string {
  return `#!/bin/sh\n# heldout: no secret value and no oversized run artifact in a commit (heldout init --git-hooks)\n${prefix ? `${cdTo(prefix)} || exit 1\n` : ''}${HOOK_LINE} || exit 1\n`;
}

const inside = (dir: string, root: string) => { const r = path.relative(root, dir); return r === '' || (!r.startsWith('..') && !path.isAbsolute(r)); };

/** Install the hook in the git repository the project at `root` is in; reports what it did through `say`. */
export function installGitHook(root: string, say: (mark: string, msg: string) => void): void {
  const ask = (...args: string[]) => spawnSync('git', ['rev-parse', ...args], { cwd: root, encoding: 'utf8' });
  const top = ask('--show-toplevel');
  if (top.status !== 0) { say('⚠', 'not a git repository — the pre-commit hook needs one (git init, then heldout init --git-hooks)'); return; }
  const toplevel = path.resolve(top.stdout.trim());
  const prefix = ask('--show-prefix').stdout.trim();
  const hooks = path.resolve(root, ask('--git-path', 'hooks').stdout.trim());
  const script = hookScript(prefix);
  const show = (f: string) => (inside(f, toplevel) ? path.relative(toplevel, f) : f).split(path.sep).join('/');
  const addLine = `${prefix ? `${cdTo(prefix)} && ` : ''}${HOOK_LINE} || exit 1`;
  // This repository's own folders: its work tree and its git folders (a linked worktree's hooks are the main one's).
  const own = [toplevel, ...['--git-dir', '--git-common-dir'].map((a) => path.resolve(root, ask(a).stdout.trim()))];
  if (!own.some((d) => inside(hooks, d))) {
    say('⚠', `git's hooks folder ${show(hooks)} is outside this repository (a global core.hooksPath runs for every repository) — not installed there; add this line to its pre-commit hook for this repository: ${addLine}`);
    return;
  }
  const file = path.join(hooks, 'pre-commit');
  if (fs.existsSync(file)) {
    if (fs.readFileSync(file, 'utf8').includes(HOOK_LINE)) { say('•', `keep    ${show(file)} (runs heldout precommit)`); return; }
    say('⚠', `${show(file)} exists and is yours — add this line to it: ${addLine}`);
    return;
  }
  fs.mkdirSync(hooks, { recursive: true });
  fs.writeFileSync(file, script, { mode: 0o755 });
  say('✔', `installed the pre-commit hook ${show(file)}: a commit with a secret value or a file over 1 MB in the output folder is refused`);
}
