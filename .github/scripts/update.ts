/**
 * Install or update the skill in a project — run it from the skill repository (a clone anywhere, any git host), in the
 * project's folder. `heldout init` runs it first, so a new project gets the same files.
 *
 *   npx tsx <skill repository>/.github/scripts/heldout.ts update [--ci [gitlab|github]]
 *
 * Copies, as they are in the skill repository (same paths; there are no templates):
 *   .github/skills/heldout-evaluator   the skill (replaced as a whole)
 *   .github/scripts                    its scripts (only the files it installed before are replaced or removed, so a
 *                                      project's own scripts there are never touched; it stops rather than overwrite one)
 *   workspace files                    playwright.config.ts, tsconfig.json, .env.example, heldout-support/fixtures.ts,
 *                                      the subagents (.github/agents/*.agent.md) and the Claude Code bridges
 *                                      (.claude/skills, .claude/agents: Claude Code reads only .claude/)
 * A workspace file is created when missing and refreshed unless the project changed it since it was copied
 * (SOURCE.json keeps the hash of each one written). Settings are merged into the project's own, keeping what it already
 * has and removing nothing: .claude/settings.json (Claude Code fallback models), .vscode/settings.json (Copilot reads
 * .github/ only, so it doesn't load the bridges too) and .vscode/mcp.json (the Playwright MCP server, browser tier 2),
 * whose servers also go into the root .mcp.json for Claude Code, which reads only that file.
 * --ci [gitlab|github] adds the regression pipeline (default: from the git remote).
 * Run inside a project (its own copy of the scripts), it checks the files and prints the command that updates them.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { AGENT_FILES, ROOT, SCRIPTS_DIR, SKILL_DIR, ensureGitignore, fileHash, flagStr, main, parseArgs, rel, type Flags } from './config';
import { MCP_FILE, mcpServersIn, writeClaudeCodeMcp } from './mcp-config';

/** Files a project gets from the skill repository, at the same path. */
const WORKSPACE_FILES = ['playwright.config.ts', 'tsconfig.json', '.env.example', 'heldout-support/fixtures.ts', ...AGENT_FILES];
/** Settings merged into the project's own, from the same files in the skill repository. */
const SETTINGS: [file: string, why: string][] = [
  ['.claude/settings.json', 'Claude Code fallback models, also used by the subagents'],
  ['.vscode/settings.json', 'GitHub Copilot loads the skill and subagents from .github/ only, not the Claude Code bridges'],
  [MCP_FILE, 'the Playwright MCP server, browser tier 2, for GitHub Copilot'],
];
/** The regression pipeline (--ci), from the same paths in the skill repository. */
const CI_FILES = { github: '.github/workflows/heldout.yml', gitlab: '.gitlab/heldout.gitlab-ci.yml' };
/** What a sparse clone of the skill repository needs (top-level files come with it). */
const SPARSE = '.github .claude .vscode .gitlab heldout-support';

const PROJECT_SKILL = path.join(ROOT, '.github', 'skills', 'heldout-evaluator');
const PROJECT_SCRIPTS = path.join(ROOT, '.github', 'scripts');
const SOURCE_FILE = path.join(PROJECT_SKILL, 'SOURCE.json');
/** The skill repository these scripts are in. */
const SOURCE_ROOT = path.resolve(SCRIPTS_DIR, '..', '..');
type SourceInfo = { from: string; update: string; remote?: string; commit?: string; installedAt: string; scripts: string[]; files: Record<string, string>; mcpServers?: string[] };

/** Files left exactly as they are: one summary line at the end instead of a line each. */
const unchanged: string[] = [];
const say = (mark: string, msg: string) => {
  const keep = mark === '•' && msg.match(/^keep\s+(\S+)$/);
  if (keep) unchanged.push(keep[1]); else console.log(`${mark} ${msg}`);
};
const sayUnchanged = () => {
  if (unchanged.length) console.log(`• unchanged: ${unchanged.length > 4 ? `${unchanged.slice(0, 3).join(', ')} and ${unchanged.length - 3} more` : unchanged.join(', ')}`);
};
const readSource = (): SourceInfo | undefined => (fs.existsSync(SOURCE_FILE) ? JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8')) : undefined);
const writeSource = (info: SourceInfo) => fs.writeFileSync(SOURCE_FILE, `${JSON.stringify(info, null, 2)}\n`);
// Line endings don't count as a change (git on Windows checks out CRLF; editors may normalise either way).
const normalised = (s: string) => s.replace(/\r\n/g, '\n');
const notInSource = (file: string) => `${file} is not in ${SOURCE_ROOT} — a sparse clone needs cone mode (older git leaves the top-level files out without it): git -C "${SOURCE_ROOT}" sparse-checkout init --cone, then git -C "${SOURCE_ROOT}" sparse-checkout set ${SPARSE}`;
const git = (dir: string, ...args: string[]) => {
  const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : undefined;
};
/** Every file under dir, relative to it with / separators (node_modules and .git left out). */
const filesUnder = (dir: string) => fs.readdirSync(dir, { recursive: true, encoding: 'utf8' }).map((f) => f.split(path.sep).join('/'))
  .filter((f) => !f.split('/').some((p) => p === 'node_modules' || p === '.git') && fs.statSync(path.join(dir, f)).isFile());

/** Copy the skill and its scripts into the project, or replace an older copy. */
function installSkill(): SourceInfo {
  const scriptsSource = path.join(SOURCE_ROOT, '.github', 'scripts');
  const before = readSource();
  // .github/scripts may hold the project's own scripts as well: replace only the files the skill installed last time.
  const installed = before?.scripts ?? [];
  const scripts = filesUnder(scriptsSource);
  const clash = scripts.filter((f) => !installed.includes(f) && fs.existsSync(path.join(PROJECT_SCRIPTS, f)));
  if (clash.length) throw new Error(`${rel(PROJECT_SCRIPTS)} already has ${clash.join(', ')}, which the skill's scripts would overwrite — move or rename them, then run update again`);
  fs.rmSync(PROJECT_SKILL, { recursive: true, force: true });
  fs.cpSync(SKILL_DIR, PROJECT_SKILL, { recursive: true, filter: (f) => !path.relative(SKILL_DIR, f).split(/[\\/]/).some((p) => p === 'node_modules' || p === '.git') });
  for (const f of installed) fs.rmSync(path.join(PROJECT_SCRIPTS, f), { force: true });
  // Folders the removed files leave empty (deepest first; a folder that still has files stays).
  for (const d of [...new Set(installed.map((f) => path.dirname(path.join(PROJECT_SCRIPTS, f))))].sort((a, b) => b.length - a.length)) {
    try { fs.rmdirSync(d); } catch { /* not empty */ }
  }
  for (const f of scripts) {
    fs.mkdirSync(path.dirname(path.join(PROJECT_SCRIPTS, f)), { recursive: true });
    fs.copyFileSync(path.join(scriptsSource, f), path.join(PROJECT_SCRIPTS, f));
  }
  // A working tree with uncommitted changes to the skill is not that commit: say so.
  const head = git(SOURCE_ROOT, 'rev-parse', '--short', 'HEAD');
  const shipped = ['.github/skills/heldout-evaluator', '.github/scripts', ...WORKSPACE_FILES, ...SETTINGS.map(([f]) => f), ...Object.values(CI_FILES)];
  const commit = head && git(SOURCE_ROOT, 'status', '--porcelain', '--', ...shipped) ? `${head}+local changes` : head;
  // Where to pull from and what to run again to update (paths in the form the local git prints them).
  const repo = git(SOURCE_ROOT, 'rev-parse', '--show-toplevel');
  const info: SourceInfo = { from: repo ?? SOURCE_ROOT, update: `${repo ? `git -C "${repo}" pull, then ` : ''}npx -y tsx "${path.join(scriptsSource, 'heldout.ts').split(path.sep).join('/')}" update`,
    remote: git(SOURCE_ROOT, 'remote', 'get-url', 'origin'), commit, installedAt: new Date().toISOString(), scripts, files: before?.files ?? {} };
  writeSource(info);
  const was = before?.commit;
  say('✔', `${before ? `updated the skill${was || commit ? ` (${was ?? '?'} → ${commit ?? '?'})` : ''}` : 'installed the skill'} → ${rel(PROJECT_SKILL)} + ${rel(PROJECT_SCRIPTS)} (from ${commit?.endsWith('+local changes') || !info.remote ? `the folder ${info.from}${commit ? ` @ ${commit}` : ''}` : `${info.remote}${commit ? ` @ ${commit}` : ''}`})`);
  return info;
}

/** Create a missing workspace file, refresh one the project hasn't changed since it was copied, keep the rest. */
function syncWorkspaceFiles(info: SourceInfo): void {
  // A file an earlier version installed and this one no longer ships (a retired subagent): removed when unchanged.
  for (const [file, hash] of Object.entries(info.files)) {
    if (WORKSPACE_FILES.includes(file)) continue;
    const dest = path.join(ROOT, file);
    if (fs.existsSync(dest) && fileHash(dest) !== hash) { say('⚠', `kept ${file} (no longer part of the skill, but changed in this project) — delete it if you don't need it`); continue; }
    fs.rmSync(dest, { force: true });
    delete info.files[file];
    say('✔', `removed ${file} (no longer part of the skill)`);
  }
  for (const file of WORKSPACE_FILES) {
    const dest = path.join(ROOT, file);
    if (!fs.existsSync(path.join(SOURCE_ROOT, file))) { say('⚠', notInSource(file)); continue; }
    const want = fs.readFileSync(path.join(SOURCE_ROOT, file), 'utf8');
    const write = (verb: string) => {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, want);
      info.files[file] = fileHash(dest);
      say('✔', `${verb} ${file}`);
    };
    if (!fs.existsSync(dest)) { write('created'); continue; }
    if (info.files[file] === undefined) say('•', `keep    ${file} (the project's own)`);
    else if (fileHash(dest) !== info.files[file]) say('⚠', `kept ${file} (changed in this project) — compare it with ${path.join(SOURCE_ROOT, file)}`);
    else if (normalised(fs.readFileSync(dest, 'utf8')) === normalised(want)) say('•', `keep    ${file}`);
    else write('refreshed');
  }
  writeSource(info);
}

/** Add the skill repository's settings the project doesn't have yet; an object setting gains only its missing entries. */
function ensureSettings(): void {
  for (const [target, why] of SETTINGS) {
    const file = path.join(ROOT, target);
    if (!fs.existsSync(path.join(SOURCE_ROOT, target))) { say('⚠', notInSource(target)); continue; }
    const want = JSON.parse(fs.readFileSync(path.join(SOURCE_ROOT, target), 'utf8')) as Record<string, unknown>;
    let have: Record<string, unknown> = {};
    if (fs.existsSync(file)) {
      try { have = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {
        say('⚠', `${target} has comments or is not plain JSON — add these settings yourself (${why}):\n${JSON.stringify(want, null, 2)}`);
        continue;
      }
    }
    let added = 0;
    for (const [k, v] of Object.entries(want)) {
      const cur = have[k];
      if (cur === undefined) { have[k] = v; added++; } else if (cur && typeof cur === 'object' && !Array.isArray(cur) && v && typeof v === 'object') {
        for (const [sk, sv] of Object.entries(v)) if (!(sk in cur)) { (cur as Record<string, unknown>)[sk] = sv; added++; }
      }
    }
    if (!added) { say('•', `keep    ${target}`); continue; }
    const created = !fs.existsSync(file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(have, null, 2)}\n`);
    say('✔', `${created ? 'created' : 'updated'} ${target} (${why})`);
  }
}

/** The regression pipeline: GitLab unless the project is evidently on GitHub (or --ci says which). */
function ensureCi(flags: Flags): void {
  const remote = git(ROOT, 'remote', 'get-url', 'origin') ?? '';
  const ci = flagStr(flags, 'ci') ?? (fs.existsSync(path.join(ROOT, '.gitlab-ci.yml')) ? 'gitlab' : /github\.com/.test(remote) || fs.existsSync(path.join(ROOT, '.github', 'workflows')) ? 'github' : 'gitlab');
  if (ci !== 'gitlab' && ci !== 'github') throw new Error(`--ci takes gitlab or github, not "${ci}"`);
  const target = CI_FILES[ci];
  const dest = path.join(ROOT, target);
  if (fs.existsSync(dest)) say('•', `keep    ${target}`);
  else if (!fs.existsSync(path.join(SOURCE_ROOT, target))) say('⚠', notInSource(target));
  else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(SOURCE_ROOT, target), dest);
    say('✔', `created ${target} (${ci === 'github' ? 'GitHub Actions: run it from the Actions tab' : 'GitLab CI: run a pipeline with HELDOUT_KEY=<story>'})`);
  }
  if (ci === 'gitlab') {
    const main = path.join(ROOT, '.gitlab-ci.yml');
    const include = 'include:\n  - local: .gitlab/heldout.gitlab-ci.yml\n';
    if (!fs.existsSync(main)) { fs.writeFileSync(main, include); say('✔', 'created .gitlab-ci.yml (includes the held-out job)'); }
    else if (!fs.readFileSync(main, 'utf8').includes('.gitlab/heldout.gitlab-ci.yml')) say('⚠', `add to .gitlab-ci.yml:\n${include}`);
  }
}

main(() => {
  const { flags } = parseArgs();
  const toSkill = path.relative(ROOT, SKILL_DIR);
  const fromRepository = toSkill.startsWith('..') || path.isAbsolute(toSkill);

  // The project's own copy: nothing to copy from, so check the files and say how to update.
  if (!fromRepository) {
    for (const file of WORKSPACE_FILES) if (!fs.existsSync(path.join(ROOT, file))) say('⚠', `${file} is missing`);
    const how = readSource()?.update;
    console.log(`Update runs from the skill repository, in this folder: ${how ?? 'npx -y tsx "<skill repository>/.github/scripts/heldout.ts" update'}`);
    return;
  }

  const info = installSkill();
  syncWorkspaceFiles(info);
  ensureSettings();
  // The same MCP servers for Claude Code; init keeps it in step later from the names recorded here.
  const servers = mcpServersIn(path.join(SOURCE_ROOT, MCP_FILE)) ?? {};
  writeClaudeCodeMcp(ROOT, servers, say);
  writeSource({ ...info, mcpServers: Object.keys(servers) });
  if (flags.ci) ensureCi(flags);
  // A set-up project gains the .gitignore entries a newer version needs (init adds them for a new one).
  if (fs.existsSync(path.join(ROOT, 'heldout.config.json'))) ensureGitignore(say);
  sayUnchanged();
  // init runs update first and prints its own next steps.
  if (!process.env.HELDOUT_INIT) {
    console.log(fs.existsSync(path.join(ROOT, 'heldout.config.json'))
      ? '\nNext: npm run heldout -- doctor   (checks the project with this version of the skill; stories and actions carry on as before)'
      : `\nNext: set the project up — npx -y tsx "${path.join(SCRIPTS_DIR, 'heldout.ts').split(path.sep).join('/')}" init --base-url https://your-app --install`);
  }
});
