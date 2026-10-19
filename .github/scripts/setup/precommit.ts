/**
 * The check a project's pre-commit hook runs (installed, opt-in, by init's git-hooks option): a commit is refused
 * when a staged file holds one of the project's secret values, or when a staged file in the output folder is over 1 MB
 * (run artifacts belong in the git-ignored scratch area, not the record).
 *
 *   heldout precommit
 *
 * The secret values are those `doctor` looks for: environment variables (.env included) whose name says secret (PASS,
 * TOKEN, SECRET, API_KEY) and the values of the project's `${vault:…}` references, read from Vault when it can be
 * reached (when it can't, the check says so and goes on with the rest). Values too weak to look for (plain words,
 * short numbers) are not looked for. A value a story publishes in its requirement (a sandbox's demo password) is not
 * a secret: only requirement files the index holds count, never untracked or ignored ones, never a symbolic link.
 *
 * Everything is read from the index, by blob id, in one `git cat-file` process: the project's staged files (the
 * project may sit in a folder of a larger repository), inside zip archives too, and the base64 bodies of a run's
 * results. Each refusal names the file and the secret's name, never its value.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import type { Args, CommandSpec } from '../core/cli';
import { loadConfig, loadEnv } from '../core/config';
import { ROOT } from '../core/files';
import { PHASE_FOLDERS, evalPaths, listStories } from '../core/paths';
import { safeToScrub } from '../core/redact';
import { loadVaultSecrets, projectSecrets } from '../core/secrets';
import { readZip } from '../core/zip';

/** Bigger than this, a staged file in the output folder is a run artifact, not the record. */
export const MAX_RECORD_FILE = 1024 * 1024;
/** How long a commit waits for Vault. */
const VAULT_WAIT_MS = 5000;

export const spec: CommandSpec = {
  name: 'precommit', group: 'Setup', usage: '',
  about: 'the pre-commit check (the hook init installs on request): no secret value and no file over 1 MB in the output folder staged',
  flags: [], words: 0,
};

const git = (args: string[], cwd: string, input?: string) => {
  const r = spawnSync('git', args, { cwd, input, maxBuffer: 1024 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args[0]} failed: ${r.error?.message ?? (r.stderr?.toString().trim() || `exit ${r.status}`)}`);
  return r.stdout;
};

/** The blobs of these ids, in order, from one `git cat-file --batch`; a missing object gives an empty buffer. */
function blobs(ids: string[], cwd: string): Buffer[] {
  if (!ids.length) return [];
  const out = git(['cat-file', '--batch'], cwd, `${ids.join('\n')}\n`);
  const res: Buffer[] = [];
  let at = 0;
  for (let i = 0; i < ids.length; i++) {
    const eol = out.indexOf(0x0a, at);
    const head = / (\w+) (\d+)$/.exec(out.subarray(at, eol).toString());
    if (!head) { res.push(Buffer.alloc(0)); at = eol + 1; continue; } // "<id> missing"
    const size = Number(head[2]);
    res.push(head[1] === 'blob' ? out.subarray(eol + 1, eol + 1 + size) : Buffer.alloc(0));
    at = eol + 1 + size + 1;
  }
  return res;
}

/**
 * The project's staged files (every change but a deletion: added, modified, a type change, a rename's new path) with
 * their staged content, paths
 * relative to the project (`cwd`). Read by blob id, so any file name works; a submodule entry has no content to read.
 */
export function stagedFiles(cwd = ROOT): { file: string; data: Buffer }[] {
  const raw = git(['diff', '--cached', '--raw', '-z', '--no-abbrev', '--no-renames', '--diff-filter=d', '--relative'], cwd).toString('utf8').split('\0');
  const entries: { file: string; id: string }[] = [];
  for (let i = 0; i + 1 < raw.length; i += 2) {
    const [, , mode, , id] = /^:(\d+) (\d+) (\w+) (\w+) /.exec(raw[i]) ?? [];
    if (mode !== undefined && mode !== '160000' && mode !== '120000') entries.push({ file: raw[i + 1], id });
  }
  const data = blobs(entries.map((e) => e.id), cwd);
  return entries.map((e, i) => ({ file: e.file, data: data[i] }));
}

/** The requirement files the index holds under `<outputDir>/<profile>/<KEY>/1-requirement/`: what the stories publish. */
export function publishedFiles(outputDir: string, cwd = ROOT): { file: string; text: string }[] {
  const prefix = `${outputDir.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '')}/`;
  const lines = git(['ls-files', '-s', '-z', '--', prefix], cwd).toString('utf8').split('\0').filter(Boolean);
  const files = lines.map((l) => /^(\d+) (\w+) \d+\t(.*)$/s.exec(l)).filter((m): m is RegExpExecArray => m !== null)
    .filter(([, mode, , file]) => mode !== '120000' && file.startsWith(prefix) && file.slice(prefix.length).split('/')[2] === PHASE_FOLDERS[0]);
  const data = blobs(files.map(([, , id]) => id), cwd);
  return files.map(([, , , file], i) => ({ file, text: data[i].toString('utf8') }));
}

/** The texts to look in: the file itself, the entries of a zip archive (its raw bytes when it can't be opened), and a run record's base64 bodies. */
function textsOf(file: string, data: Buffer): { where: string; text: string }[] {
  if (/\.zip$/i.test(file)) {
    try {
      const entries = readZip(data);
      if (entries) return entries.flatMap((e) => textsOf(`${file} › ${e.name}`, e.data));
    } catch { /* an archive it can't open is read as bytes */ }
    return [{ where: `${file} (as bytes: the archive couldn't be opened)`, text: data.toString('latin1') }];
  }
  const text = data.toString('utf8');
  const bodies = /\.jsonl?$/i.test(file) ? [...text.matchAll(/"body":\s*"([A-Za-z0-9+/=]{8,})"/g)].map((m) => Buffer.from(m[1], 'base64').toString('utf8')) : [];
  return [{ where: file, text }, ...(bodies.length ? [{ where: `${file} (a base64 body)`, text: bodies.join('\n') }] : [])];
}

/** Why each staged file may not be committed: [] when every one may. */
export function precommitProblems(staged: { file: string; data: Buffer }[], secrets: [string, string][], outputDir = 'output'): string[] {
  const problems: string[] = [];
  const out = `${outputDir.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '')}/`;
  for (const { file, data } of staged) {
    if (file.startsWith(out) && data.length > MAX_RECORD_FILE) problems.push(`${file}: ${(data.length / 1024 / 1024).toFixed(1)} MB in the output folder — run artifacts belong in the scratch area (git-ignored); unstage it`);
    for (const { where, text } of textsOf(file, data)) for (const [name] of secrets.filter(([, v]) => text.includes(v))) problems.push(`${where}: holds the value of ${name}`);
  }
  return problems;
}

// Written at once (not buffered): the process may end while Vault's request is still open.
const out = (s: string) => fs.writeSync(1, `${s}\n`);
const err = (s: string) => fs.writeSync(2, `${s}\n`);

export async function run(_: Args): Promise<void> {
  loadEnv();
  let outputDir = 'output';
  let vaultLate = false;
  const notes: string[] = [];
  let cfg: ReturnType<typeof loadConfig> | undefined;
  try { cfg = loadConfig(); outputDir = cfg.outputDir; } catch (e) {
    notes.push(`heldout.config.json not read (${(e as Error).message.split('\n')[0]}): the output folder is taken as "output", and Vault values are not checked`);
  }
  if (cfg) {
    // The Vault values the project uses (test data and accounts recipes), as doctor reads them.
    const conf = cfg;
    const users = [...listStories(conf).map((s) => evalPaths({ outputDir: conf.outputDir, autId: s.profile }, s.key).testData).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, 'utf8')),
      ...Object.values(conf.auts).map((a) => a.accounts)];
    // A commit waits for Vault at most a few seconds: one that can't be reached in time is said, not waited for.
    const late = new Promise<string[]>((done) => { const t = setTimeout(() => { vaultLate = true; done([`Vault didn't answer within ${VAULT_WAIT_MS / 1000} s`]); }, VAULT_WAIT_MS); t.unref(); });
    try {
      const problems = await Promise.race([loadVaultSecrets(users), late]);
      if (problems.length) notes.push(`Vault values not checked: ${problems.join('; ')}`);
    } catch (e) { notes.push(`Vault values not checked: ${(e as Error).message.split('\n')[0]}`); }
  }
  for (const n of notes) err(`⚠ heldout precommit: ${n}`);
  const staged = stagedFiles();
  const published = publishedFiles(outputDir);
  // Said, so a reviewer sees it: which secrets a requirement file publishes, and so aren't looked for (names only).
  for (const [name, value] of projectSecrets('', safeToScrub)) {
    const where = published.filter((p) => p.text.includes(value)).map((p) => p.file);
    if (where.length) out(`• ${name} is published in ${where.slice(0, 3).join(', ')}${where.length > 3 ? ', …' : ''}: not looked for`);
  }
  const problems = precommitProblems(staged, projectSecrets(published.map((p) => p.text).join('\n'), safeToScrub), outputDir);
  if (!problems.length) out(`✔ heldout precommit: ${staged.length} staged file(s), no secret value, no oversized record file`);
  else {
    err(`✖ heldout precommit: commit refused\n${problems.map((p) => `  - ${p}`).join('\n')}\n  A secret goes in .env or Vault and is referenced as \${env:NAME} or \${vault:path#field}; to scrub a story: heldout scrub KEY`);
    process.exitCode = 1;
  }
  // Vault's request may still be open: the commit doesn't wait for it.
  if (vaultLate) process.exit(process.exitCode ?? 0);
}
