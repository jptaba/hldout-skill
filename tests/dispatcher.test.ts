/**
 * The dispatcher and the command contract: every command loads without running, says who it is, and declares exactly
 * the flags it reads and documents; `heldout help` and `--help` work for every command.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { COMMANDS, loadCommand } from '../.github/scripts/heldout';

const DIR = path.join(import.meta.dirname, '..', '.github', 'scripts');
const DISPATCHER = path.join(DIR, 'heldout.ts');
const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');

/** The flags a source reads: flags.x, flags['x'], flagStr/flagList(flags, 'x'). */
const flagsRead = (src: string) => new Set([...src.matchAll(/flags\.([A-Za-z_]\w*)|flags\[['"]([a-z-]+)['"]\]|flag(?:Str|List)\(flags, ['"]([a-z-]+)['"]\)/g)].map((m) => m[1] ?? m[2] ?? m[3]));
/** A module's source and that of the modules of its own area it imports (where a command's helpers read its flags). */
function sourceWithHelpers(file: string): string {
  const src = fs.readFileSync(path.join(DIR, file), 'utf8');
  const local = [...src.matchAll(/^import\s+(?!type\s)[^;]*?\sfrom\s+'\.\/([^']+)';/gm)].map((m) => path.posix.join(path.posix.dirname(file), `${m[1]}.ts`));
  return [src, ...local.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8'))].join('\n');
}
const documented = (file: string) => new Set([...(fs.readFileSync(path.join(DIR, file), 'utf8').match(/^\/\*\*([\s\S]*?)\*\//)?.[1] ?? '')
  .matchAll(/(?<![\w-])--([a-z][a-z-]+)/g)].map((m) => m[1]).filter((f) => f !== 'help'));

describe('the command contract', () => {
  it('every command loads without running and names itself', async () => {
    for (const name of Object.keys(COMMANDS)) {
      const command = await loadCommand(name);
      assert.equal(command.spec.name, name, `${COMMANDS[name]} spec.name`);
      assert.equal(typeof command.run, 'function', `${COMMANDS[name]} exports run`);
      assert.ok(command.spec.about && command.spec.usage !== undefined, `${name}: about and usage`);
    }
  });

  it('every command declares exactly the flags it reads, and documents none it does not take', async () => {
    const problems: string[] = [];
    for (const [name, file] of Object.entries(COMMANDS)) {
      const declared = new Set((await loadCommand(name)).spec.flags);
      const read = flagsRead(sourceWithHelpers(file));
      for (const f of read) if (!declared.has(f)) problems.push(`${name} reads --${f} but does not declare it`);
      for (const f of declared) if (!read.has(f)) problems.push(`${name} declares --${f} but never reads it`);
      for (const f of documented(file)) if (!declared.has(f)) problems.push(`${name} documents --${f} but does not take it`);
    }
    assert.deepEqual(problems, []);
  });

  it('every command declares how many words it reads, and the dispatcher refuses more', async () => {
    const problems: string[] = [];
    for (const [name, file] of Object.entries(COMMANDS)) {
      const src = sourceWithHelpers(file);
      // The highest positional index read (`_[n]`, or `const [a, b] = _`).
      const indexed = [...src.matchAll(/\b_\[(\d+)\]/g)].map((m) => Number(m[1]) + 1);
      const destructured = [...src.matchAll(/const \[([^\]]+)\] = _;/g)].map((m) => m[1].split(',').length);
      const used = Math.max(0, ...indexed, ...destructured);
      const words = (await loadCommand(name)).spec.words ?? 1;
      // Exactly: a command that declares more than it reads would still drop a stray word without a word.
      if (used !== words) problems.push(`${name} reads ${used} word(s) but declares ${words}`);
      if (/\b_\.(?:slice|length|join|map|filter)\b|\.\.\._\b/.test(src)) problems.push(`${name} reads its words in a way this check can't count`);
    }
    assert.deepEqual(problems, []);
    // An unquoted value with spaces keeps its first word only: stopped, with the reason.
    const r = spawnSync(process.execPath, [TSX, DISPATCHER, 'note', 'ABC-1', '--remark', 'two', 'words'], { encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /note takes at most 1 word\(s\) besides its flags, and got 2: "ABC-1" "words"[\s\S]*in quotes/);
  });
});

describe('the dispatcher', () => {
  const heldout = (...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, ...args], { encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });

  it('lists every command in help', () => {
    const r = heldout('help');
    assert.equal(r.status, 0, r.stderr);
    for (const name of Object.keys(COMMANDS)) assert.match(r.stdout, new RegExp(`^  ${name.replace('-', '\\-')} `, 'm'));
  });

  it('prints the usage of every command with --help', () => {
    for (const name of Object.keys(COMMANDS)) {
      const r = heldout(name, '--help');
      assert.equal(r.status, 0, `${name}: ${r.stderr}`);
      assert.match(r.stdout, new RegExp(`heldout(?:\\.ts)? ${name}\\b`), `${name} --help shows its usage`);
    }
  });

  it('rejects a flag the command does not take, and an unknown command', () => {
    const flag = heldout('status', '--nonsense');
    assert.equal(flag.status, 1);
    assert.match(flag.stderr, /status does not take --nonsense/);
    const cmd = heldout('stat');
    assert.equal(cmd.status, 1);
    assert.match(cmd.stderr, /Did you mean: status/);
  });
});
