/**
 * Setup — scaffold everything a project needs to run held-out evaluations (idempotent; never overwrites).
 *
 *   heldout init --base-url https://aut.example.com [--api-base-url …] [--name "My App"] [--profile <id>]
 *                [--test-id-attr data-testid] [--healthcheck "/,api:/health"]
 *                [--jira mock|cloud] [--jira-url https://<site>.atlassian.net] [--ac-field customfield_10035]
 *                [--install] [--ci]
 *   heldout init [--profile <id>] --data-prefix qa        the prefix of the names tests make (default "hldout")
 *   heldout init [--profile <id>] --max-workers 1 --min-test-interval-ms 10000   pacing for a rate-limited host
 *   heldout add-aut <profile> --base-url … [--api-base-url …] [--name …] [--test-id-attr …] [--healthcheck …]
 *
 * Creates or completes: heldout.config.json (with $schema for editor help), .env, package.json (the `heldout` npm
 * script and dev dependencies), .gitignore entries, mock-jira/, evaluations/, and the workspace files, copied as they
 * are in the skill repository (same paths; there are no templates): playwright.config.ts, heldout-support/fixtures.ts,
 * tsconfig.json, .mcp.json (Playwright MCP = tier 2), .env.example, the subagents (.github/agents/*.agent.md), the
 * Claude Code bridges (.claude/skills, .claude/agents: Claude Code reads only .claude/, so they point at the skill and
 * agents in .github/), and the settings merged into the project's: .claude/settings.json (Claude Code fallback models)
 * and .vscode/settings.json (Copilot reads .github/ only, so it doesn't load the bridges too).
 * --install runs `npm install` and installs Chromium. --ci [gitlab|github] adds a CI pipeline (default: from the git remote).
 * Run from the skill repository (a clone anywhere, any git host), it first installs the skill into
 * .github/skills/heldout-evaluator and its scripts into .github/scripts, or updates an older copy; re-running it after a
 * pull updates the skill and refreshes the workspace files the project hasn't changed. Scripts of the project's own in
 * .github/scripts are left alone (init stops rather than overwrite one).
 * Unless given, the profile id comes from the host name, and one visit of the start page supplies the name (page
 * title), the test-id attribute and blockHosts (the ad/analytics networks the page loads).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { AGENT_FILES, CONFIG_SCHEMA, ROOT, SCRIPTS_DIR, SKILL_DIR, fileHash, flagStr, main, parseArgs, rel, unmangleMsysPath, type Flags } from './lib/config';
import { appNameFrom, appRootOf, baseUrlOf, describeCounts, discoverApp, profileIdFor } from './lib/detect';

/**
 * Files a project gets from the skill repository, as they are developed there and at the same path. Created when
 * missing; on an update, refreshed unless the project changed them (SOURCE.json keeps the hash of each one init wrote).
 */
const WORKSPACE_FILES = ['playwright.config.ts', 'tsconfig.json', '.mcp.json', '.env.example', 'heldout-support/fixtures.ts', ...AGENT_FILES];
/** Settings merged into the project's own (keys it already has are kept), from the same files in the skill repository. */
const SETTINGS: [file: string, why: string][] = [
  ['.claude/settings.json', 'Claude Code fallback models, also used by the subagents'],
  ['.vscode/settings.json', 'GitHub Copilot loads the skill and subagents from .github/ only, not the Claude Code bridges'],
];
/** The regression pipeline (--ci), from the same paths in the skill repository. */
const CI_FILES = { github: '.github/workflows/heldout.yml', gitlab: '.gitlab/heldout.gitlab-ci.yml' };
/** What a sparse clone of the skill repository needs (top-level files come with it). */
const SPARSE = '.github .claude .vscode .gitlab heldout-support';
/** A new project's heldout.config.json: flags and one visit of the application fill in the profile. */
const STARTER_CONFIG = {
  jira: { mode: 'mock', mockRoot: 'mock-jira', baseUrl: 'https://your-domain.atlassian.net', acceptanceCriteriaField: '', verdictLabelPrefix: 'heldout-' },
  evaluationsDir: 'evaluations',
  run: { retries: 1, workers: 4, headless: true, actionTimeoutMs: 10000, expectTimeoutMs: 5000, testTimeoutMs: 60000 },
};
const STARTER_PROFILE = {
  testIdAttribute: 'data-testid',
  healthcheck: ['/'],
  notes: 'Everything AUT-specific belongs here or in .env, never inside the skill. Add one profile per application; bind a story with evaluations/<KEY>/evaluation.json.',
};
/** Versions the skill is tested with (caret ranges — npm resolves the latest compatible). */
const DEV_DEPENDENCIES: Record<string, string> = { '@playwright/test': '^1.63.0', tsx: '^4.23.0', typescript: '^7.0.0', '@types/node': '^26.0.0' };
const GITIGNORE = ['.env', 'node_modules/', 'test-results/', 'playwright-report/', 'evaluations/*/runs/*/html/', 'evaluations/*/runs/*/artifacts/', '*.trace.zip', '.playwright-mcp/', '.claude/settings.local.json'];

const say = (mark: string, msg: string) => console.log(`${mark} ${msg}`);

const PROJECT_SKILL = path.join(ROOT, '.github', 'skills', 'heldout-evaluator');
const PROJECT_SCRIPTS = path.join(ROOT, '.github', 'scripts');
const SOURCE_FILE = path.join(PROJECT_SKILL, 'SOURCE.json');
/**
 * The skill repository files come from: the clone init was started from (passed on as HELDOUT_SOURCE when init
 * continues from the project's copy), otherwise the repository these scripts are in (the project itself, after install).
 */
const SOURCE_ROOT = process.env.HELDOUT_SOURCE ?? path.resolve(SCRIPTS_DIR, '..', '..');
type SourceInfo = { from: string; update: string; remote?: string; commit?: string; installedAt: string; scripts: string[]; files: Record<string, string> };
const readSource = (): SourceInfo | undefined => (fs.existsSync(SOURCE_FILE) ? JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8')) : undefined);
// Line endings don't count as a change (git on Windows checks out CRLF; editors may normalise either way).
const normalised = (s: string) => s.replace(/\r\n/g, '\n');
const git = (dir: string, ...args: string[]) => {
  const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : undefined;
};

/** Every file under dir, relative to it with / separators (node_modules and .git left out). */
const filesUnder = (dir: string) => fs.readdirSync(dir, { recursive: true, encoding: 'utf8' }).map((f) => f.split(path.sep).join('/'))
  .filter((f) => !f.split('/').some((p) => p === 'node_modules' || p === '.git') && fs.statSync(path.join(dir, f)).isFile());

/**
 * Run from a skill repository outside this project (a clone anywhere, on any git host): copy the skill and its scripts
 * into the project, or replace an older copy. init then continues from the copy and brings the workspace files over.
 */
function installSkillFrom(sourceRoot: string): void {
  const source = path.join(sourceRoot, '.github', 'skills', 'heldout-evaluator');
  const scriptsSource = path.join(sourceRoot, '.github', 'scripts');
  const before = readSource();
  // .github/scripts may hold the project's own scripts as well: replace only the files the skill installed last time.
  const installed = before?.scripts ?? [];
  const scripts = filesUnder(scriptsSource);
  const clash = scripts.filter((f) => !installed.includes(f) && fs.existsSync(path.join(PROJECT_SCRIPTS, f)));
  if (clash.length) throw new Error(`${rel(PROJECT_SCRIPTS)} already has ${clash.join(', ')}, which the skill's scripts would overwrite — move or rename them, then run init again`);
  fs.rmSync(PROJECT_SKILL, { recursive: true, force: true });
  fs.cpSync(source, PROJECT_SKILL, { recursive: true, filter: (f) => !path.relative(source, f).split(/[\\/]/).some((p) => p === 'node_modules' || p === '.git') });
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
  const head = git(sourceRoot, 'rev-parse', '--short', 'HEAD');
  const shipped = ['.github/skills/heldout-evaluator', '.github/scripts', ...WORKSPACE_FILES, ...SETTINGS.map(([f]) => f), ...Object.values(CI_FILES)];
  const commit = head && git(sourceRoot, 'status', '--porcelain', '--', ...shipped) ? `${head}+local changes` : head;
  // Where to pull from and what to run again to update (paths in the form the local git prints them).
  const repo = git(sourceRoot, 'rev-parse', '--show-toplevel');
  const info: SourceInfo = { from: repo ?? sourceRoot, update: `${repo ? `git -C "${repo}" pull, then ` : ''}npx -y tsx "${path.join(scriptsSource, 'heldout.ts').split(path.sep).join('/')}" init`,
    remote: git(sourceRoot, 'remote', 'get-url', 'origin'), commit, installedAt: new Date().toISOString(), scripts, files: before?.files ?? {} };
  fs.writeFileSync(SOURCE_FILE, `${JSON.stringify(info, null, 2)}\n`);
  const was = before?.commit;
  say('✔', `${before ? `updated the skill${was || commit ? ` (${was ?? '?'} → ${commit ?? '?'})` : ''}` : 'installed the skill'} → ${rel(PROJECT_SKILL)} + ${rel(PROJECT_SCRIPTS)} (from ${commit?.endsWith('+local changes') || !info.remote ? `the folder ${info.from}${commit ? ` @ ${commit}` : ''}` : `${info.remote}${commit ? ` @ ${commit}` : ''}`})`);
}

/** A workspace file as the project gets it (.mcp.json starts npx directly outside Windows). */
function contentFor(file: string): string {
  const content = fs.readFileSync(path.join(SOURCE_ROOT, file), 'utf8');
  return file === '.mcp.json' && process.platform !== 'win32' ? content.replace('"command": "cmd"', '"command": "npx"').replace('"/c", "npx", ', '') : content;
}

/**
 * Bring the workspace files over from the skill repository: create a missing one, refresh one the project hasn't
 * changed since init wrote it, keep the rest. Run inside a set-up project (not from a clone), it only checks them.
 */
function syncWorkspaceFiles(): void {
  const source = readSource();
  const written = source?.files ?? {};
  const fromClone = path.resolve(SOURCE_ROOT) !== path.resolve(ROOT);
  for (const file of WORKSPACE_FILES) {
    const dest = path.join(ROOT, file);
    if (!fromClone) {
      if (fs.existsSync(dest)) say('•', `keep    ${file}`);
      else say('⚠', `${file} is missing — run init from the skill repository to restore it (README "Update")`);
      continue;
    }
    if (!fs.existsSync(path.join(SOURCE_ROOT, file))) { say('⚠', `${file} is not in ${SOURCE_ROOT} — a sparse clone needs: git sparse-checkout set ${SPARSE}`); continue; }
    const want = contentFor(file);
    const write = (verb: string) => {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, want);
      written[file] = fileHash(dest);
      say('✔', `${verb} ${file}`);
    };
    if (!fs.existsSync(dest)) { write('created'); continue; }
    const current = fileHash(dest);
    if (written[file] === undefined) say('•', `keep    ${file} (the project's own)`);
    else if (current !== written[file]) say('⚠', `kept ${file} (changed in this project) — compare it with ${path.join(SOURCE_ROOT, file)}`);
    else if (normalised(fs.readFileSync(dest, 'utf8')) === normalised(want)) say('•', `keep    ${file}`);
    else write('refreshed');
  }
  if (source) fs.writeFileSync(SOURCE_FILE, `${JSON.stringify({ ...source, files: written }, null, 2)}\n`);
}

function profileFrom(flags: Flags, base: Record<string, unknown> = {}) {
  const given = flagStr(flags, 'base-url');
  const baseURL = given ? baseUrlOf(given) : (base.baseURL as string);
  if (given && baseURL !== given && baseURL !== `${given}/`) {
    const route = new URL(given).hash;
    say('✔', `base URL: ${baseURL} (${route ? `the app's address without the ${route} route; tests open routes such as #/login from it` : 'the folder of the page you gave, so paths like "page.htm" resolve beside it'})`);
  }
  const hc = flagStr(flags, 'healthcheck');
  return {
    ...base,
    name: flagStr(flags, 'name') ?? (baseURL ? profileIdFor(baseURL) : base.name),
    baseURL,
    // A new --base-url implies the API lives there too unless --api-base-url says otherwise.
    apiBaseURL: (flagStr(flags, 'api-base-url') ? baseUrlOf(flagStr(flags, 'api-base-url')!) : undefined) ?? (flagStr(flags, 'base-url') ? baseURL : (base.apiBaseURL ?? baseURL)),
    testIdAttribute: flagStr(flags, 'test-id-attr') ?? base.testIdAttribute ?? 'data-testid',
    healthcheck: hc ? hc.split(',').map((x) => unmangleMsysPath(x.trim())).filter(Boolean) : (base.healthcheck ?? ['/']),
  };
}

/** Visit the start page once and fill in what the flags didn't give: name, test-id attribute, blockHosts. */
async function discover(configFile: string, id: string, flags: Flags, renameGeneric = false): Promise<void> {
  const cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const profile = cfg.auts[id];
  if (!profile) return;
  // The address given may be one page of the app ("…/books"): paths resolve from the app's root.
  const given = profile.baseURL as string;
  const root = await appRootOf(given);
  if (root !== profile.baseURL && root !== `${profile.baseURL}/`) {
    const page = new URL(profile.baseURL).pathname;
    if (profile.apiBaseURL === profile.baseURL && !flagStr(flags, 'api-base-url')) profile.apiBaseURL = root;
    profile.baseURL = root;
    say('✔', `base URL: ${root} (the root of the app ${page} belongs to; the tests' paths resolve from it. An app under a folder: give the folder with a trailing slash)`);
  }
  // The page that was given is the one its owner cares about: discovery visits it too (its ads, its test ids).
  const d = await discoverApp(profile.baseURL, given !== profile.baseURL ? [given] : []);
  if (d.error) { say('•', `could not open ${profile.baseURL} (${d.error}) — profile left as configured; heldout doctor re-checks it`); return; }
  const name = appNameFrom(d.title, id);
  if (!flagStr(flags, 'name') && name) {
    profile.name = name;
    say('✔', `name: "${name}" (from the page title, shown in verdicts; --name overrides)`);
  }
  // localhost or an IP address says nothing about the application: name the profile after its title instead.
  const slug = (name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  if (renameGeneric && id === 'app' && slug && slug !== id && !cfg.auts[slug]) {
    cfg.auts = Object.fromEntries(Object.entries(cfg.auts).map(([k, v]) => [k === id ? slug : k, v]));
    if (cfg.defaultAut === id) cfg.defaultAut = slug;
    say('✔', `profile id: ${slug} (from the page title; ${new URL(profile.baseURL).host} doesn't name the app; --profile overrides)`);
  }
  if (flagStr(flags, 'test-id-attr')) { /* given */ } else if (d.attribute) {
    profile.testIdAttribute = d.attribute;
    say('✔', `test-id attribute: ${d.attribute} (on ${profile.baseURL}: ${describeCounts(d)}${d.via === 'html' ? '; served HTML only — install Chromium for a rendered check' : ''})`);
  } else if (d.via === 'html') say('•', `test-id attribute: none in the served HTML — keeping "${profile.testIdAttribute}"; heldout doctor renders the app once Playwright is installed and reports the attribute and the API host`);
  else say('•', `test-id attribute: none on the start page or the pages its navigation links to — keeping "${profile.testIdAttribute}"; tests will use roles and labels`);
  if (!flagStr(flags, 'api-base-url') && d.apiOrigin && (!profile.apiBaseURL || profile.apiBaseURL === profile.baseURL)) {
    profile.apiBaseURL = d.apiOrigin;
    say('✔', `API: ${d.apiOrigin} (the web app sends its requests there; --api-base-url overrides)`);
  }
  const block = d.adDomains.filter((h) => !(profile.blockHosts ?? []).includes(h));
  if (block.length) {
    profile.blockHosts = [...(profile.blockHosts ?? []), ...block];
    say('✔', `blockHosts: ${block.join(', ')} (ad/analytics networks the pages loaded; they inject content and make tests flaky)`);
  }
  const overlays = (d.overlays ?? []).map((n) => `getByRole('button', { name: '${n.replace(/'/g, "\\'")}' })`).filter((o) => !(profile.overlays ?? []).includes(o));
  if (overlays.length) {
    profile.overlays = [...(profile.overlays ?? []), ...overlays];
    say('✔', `overlays: ${d.overlays!.map((n) => `"${n}"`).join(', ')} (buttons that close what covers the start page; tests, the UI sign-in and inspect click them whenever they appear)`);
  }
  const prefix = profile.dataPrefix ?? 'hldout';
  say('•', `test data: every name the tests make here starts with "${prefix}" (users ${prefix}-…, records "${prefix} …"), so it is easy to find and sweep; --data-prefix <letters> if the app's rules need another`);
  fs.writeFileSync(configFile, `${JSON.stringify(cfg, null, 2)}\n`);
}


function ensurePackageJson(): boolean {
  const file = path.join(ROOT, 'package.json');
  const pkg = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { name: path.basename(ROOT).toLowerCase().replace(/[^a-z0-9-]+/g, '-'), private: true, version: '0.0.0' };
  const created = !fs.existsSync(file);
  pkg.scripts ??= {};
  pkg.devDependencies ??= {};
  let changed = created;
  const script = `tsx ${rel(path.join(SCRIPTS_DIR, 'heldout.ts'))}`;
  if (!pkg.scripts.heldout) { pkg.scripts.heldout = script; changed = true; }
  const missing = Object.entries(DEV_DEPENDENCIES).filter(([d]) => !pkg.devDependencies[d] && !pkg.dependencies?.[d]);
  for (const [d, v] of missing) pkg.devDependencies[d] = v;
  if (missing.length) changed = true;
  if (changed) fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
  say(changed ? '✔' : '•', `${created ? 'created' : changed ? 'updated' : 'keep   '} package.json${missing.length ? ` (+ ${missing.map(([d]) => d).join(', ')})` : ''}${changed ? ' — npm script "heldout"' : ''}`);
  return missing.length > 0 || created;
}

/** Add the skill repository's settings the project doesn't have yet; an object setting gains only its missing entries. */
function ensureSettings(): void {
  for (const [target, why] of SETTINGS) {
    const file = path.join(ROOT, target);
    if (!fs.existsSync(path.join(SOURCE_ROOT, target))) { say('⚠', `${target} is not in ${SOURCE_ROOT} — a sparse clone needs: git sparse-checkout set ${SPARSE}`); continue; }
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

function ensureGitignore(): void {
  const file = path.join(ROOT, '.gitignore');
  const have = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const lines = new Set(have.split(/\r?\n/).map((l) => l.trim()));
  const add = GITIGNORE.filter((l) => !lines.has(l) && !lines.has(l.replace(/\/$/, '')));
  if (!add.length) { say('•', 'keep    .gitignore'); return; }
  fs.writeFileSync(file, `${have}${have && !have.endsWith('\n') ? '\n' : ''}\n# held-out evaluator (secrets and bulky local artifacts; verdicts and evidence summaries stay tracked)\n${add.join('\n')}\n`);
  say('✔', `${have ? 'updated' : 'created'} .gitignore (+ ${add.length} entries)`);
}

main(async () => {
  const { _, flags } = parseArgs();
  const configFile = path.join(ROOT, 'heldout.config.json');
  const existingProject = fs.existsSync(configFile);

  // Started from a skill outside this project: install (or update) the project's copy, then continue from it.
  const toSkill = path.relative(ROOT, SKILL_DIR);
  if (toSkill.startsWith('..') || path.isAbsolute(toSkill)) {
    installSkillFrom(SOURCE_ROOT);
    const cmd = flags['add-aut'] ? 'add-aut' : 'init';
    const args = process.argv.slice(2).filter((a) => a !== '--add-aut');
    const again = spawnSync(process.execPath, [...process.execArgv, path.join(PROJECT_SCRIPTS, 'heldout.ts'), cmd, ...args],
      { stdio: 'inherit', cwd: ROOT, env: { ...process.env, HELDOUT_SOURCE: SOURCE_ROOT } });
    process.exit(again.status ?? 1);
  }

  const addAut = flagStr(flags, 'add-aut') ?? (flags['add-aut'] === true ? _[0] : undefined);
  if (addAut || flags['add-aut']) {
    if (!addAut) throw new Error('Usage: heldout add-aut <profile-id> --base-url <url> [--api-base-url <url>]');
    if (!fs.existsSync(configFile)) throw new Error('heldout.config.json not found — run "heldout init" first.');
    if (!flagStr(flags, 'base-url')) throw new Error('--base-url is required with add-aut');
    const cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    if (cfg.auts[addAut]) throw new Error(`AUT profile "${addAut}" already exists`);
    cfg.auts[addAut] = profileFrom(flags);
    fs.writeFileSync(configFile, `${JSON.stringify(cfg, null, 2)}\n`);
    say('✔', `added AUT profile "${addAut}". Stories bind to it with: heldout fetch KEY --aut ${addAut}`);
    await discover(configFile, addAut, flags);
    return;
  }

  if (fs.existsSync(configFile)) say('•', 'keep    heldout.config.json');
  else {
    if (!flagStr(flags, 'base-url')) throw new Error('--base-url is required the first time (the web address of the application to evaluate). Add --api-base-url if the API lives elsewhere.');
    const id = flagStr(flags, 'profile') ?? profileIdFor(flagStr(flags, 'base-url')!);
    const cfg = structuredClone(STARTER_CONFIG);
    if (flagStr(flags, 'jira')) cfg.jira.mode = flagStr(flags, 'jira')!;
    if (flagStr(flags, 'jira-url')) cfg.jira.baseUrl = flagStr(flags, 'jira-url')!;
    if (flagStr(flags, 'ac-field')) cfg.jira.acceptanceCriteriaField = flagStr(flags, 'ac-field')!;
    fs.writeFileSync(configFile, `${JSON.stringify({ $schema: rel(CONFIG_SCHEMA), defaultAut: id, auts: { [id]: profileFrom(flags, STARTER_PROFILE) }, ...cfg }, null, 2)}\n`);
    say('✔', 'created heldout.config.json');
  }
  syncWorkspaceFiles();
  const envFile = path.join(ROOT, '.env');
  if (fs.existsSync(envFile)) say('•', 'keep    .env');
  else if (!fs.existsSync(path.join(SOURCE_ROOT, '.env.example'))) say('⚠', '.env not created: no .env.example to start it from');
  else {
    let env = fs.readFileSync(path.join(SOURCE_ROOT, '.env.example'), 'utf8');
    if (flagStr(flags, 'jira')) env = env.replace(/^JIRA_MODE=.*$/m, `JIRA_MODE=${flagStr(flags, 'jira')}`);
    if (flagStr(flags, 'jira-url')) env = env.replace(/^JIRA_BASE_URL=.*$/m, `JIRA_BASE_URL=${flagStr(flags, 'jira-url')}`);
    fs.writeFileSync(envFile, env);
    say('✔', 'created .env (git-ignored — secrets go here)');
  }
  const needInstall = ensurePackageJson();
  ensureGitignore();
  if (flags.ci) {
    // GitLab unless the project is evidently on GitHub (or --ci says which).
    const remote = git(ROOT, 'remote', 'get-url', 'origin') ?? '';
    const ci = flagStr(flags, 'ci') ?? (fs.existsSync(path.join(ROOT, '.gitlab-ci.yml')) ? 'gitlab' : /github\.com/.test(remote) || fs.existsSync(path.join(ROOT, '.github', 'workflows')) ? 'github' : 'gitlab');
    if (ci !== 'gitlab' && ci !== 'github') throw new Error(`--ci takes gitlab or github, not "${ci}"`);
    const target = CI_FILES[ci];
    const dest = path.join(ROOT, target);
    if (fs.existsSync(dest)) say('•', `keep    ${target}`);
    else if (!fs.existsSync(path.join(SOURCE_ROOT, target))) say('⚠', `${target} is not in ${SOURCE_ROOT} — a sparse clone needs: git sparse-checkout set ${SPARSE}`);
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
  for (const d of ['mock-jira/issues', 'mock-jira/outbox', 'evaluations']) fs.mkdirSync(path.join(ROOT, d), { recursive: true });
  ensureSettings();

  if (flags.install) {
    const npm = (args: string[]) => spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, { stdio: 'inherit', cwd: ROOT, shell: process.platform === 'win32' });
    const npx = (args: string[]) => spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, { stdio: 'inherit', cwd: ROOT, shell: process.platform === 'win32' });
    console.log('\n▶ npm install'); if (npm(['install', '--no-fund', '--no-audit']).status !== 0) throw new Error('npm install failed — see the output above');
    console.log('▶ npx playwright install chromium'); if (npx(['playwright', 'install', 'chromium']).status !== 0) throw new Error('Chromium install failed — see the output above');
  }
  // Pacing for a host that rate-limits bursts of traffic (heldout run suggests it after a 429).
  const maxWorkers = flagStr(flags, 'max-workers'); const interval = flagStr(flags, 'min-test-interval-ms');
  if (maxWorkers || interval) {
    const cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const id = flagStr(flags, 'profile') ?? cfg.defaultAut;
    if (!cfg.auts[id]) throw new Error(`no AUT profile "${id}" in heldout.config.json`);
    const n = (v: string, name: string, min: number) => { const x = Number(v); if (!Number.isInteger(x) || x < min) throw new Error(`--${name} takes a whole number ≥ ${min}`); return x; };
    if (maxWorkers) cfg.auts[id].maxWorkers = n(maxWorkers, 'max-workers', 1);
    if (interval) cfg.auts[id].minTestIntervalMs = n(interval, 'min-test-interval-ms', 0);
    fs.writeFileSync(configFile, `${JSON.stringify(cfg, null, 2)}\n`);
    say('✔', `auts.${id}: ${maxWorkers ? `at most ${cfg.auts[id].maxWorkers} worker(s)` : ''}${maxWorkers && interval ? ', ' : ''}${interval ? `tests start at least ${cfg.auts[id].minTestIntervalMs} ms apart` : ''}`);
  }
  // The prefix of every name the tests make on this AUT (default "hldout"), for an application whose rules need another.
  const prefix = flagStr(flags, 'data-prefix');
  if (prefix) {
    const cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const id = flagStr(flags, 'profile') ?? cfg.defaultAut;
    if (!cfg.auts[id]) throw new Error(`no AUT profile "${id}" in heldout.config.json`);
    if (!/^[A-Za-z][A-Za-z0-9._-]{0,15}$/.test(prefix)) throw new Error('--data-prefix starts with a letter and uses at most 16 letters, digits, dots, dashes or underscores');
    cfg.auts[id].dataPrefix = prefix;
    fs.writeFileSync(configFile, `${JSON.stringify(cfg, null, 2)}\n`);
    say('✔', `auts.${id}: names the tests make start with "${prefix}" (users ${prefix}-…, records "${prefix} …")`);
  }
  if (flagStr(flags, 'base-url')) await discover(configFile, flagStr(flags, 'profile') ?? JSON.parse(fs.readFileSync(configFile, 'utf8')).defaultAut, flags, !flagStr(flags, 'profile'));

  // Run again in a set-up project (a skill update): nothing to onboard.
  if (existingProject && !flagStr(flags, 'base-url') && !(needInstall && !flags.install)) {
    console.log('\nNext: npm run heldout -- doctor   (checks the project with this version of the skill; evaluations carry on as before)');
    return;
  }
  console.log('\nNext:');
  if (needInstall && !flags.install) console.log('  1. npm install && npx playwright install chromium   (or re-run init with --install)');
  console.log(`  ${needInstall && !flags.install ? '2' : '1'}. npm run heldout -- doctor --learn  checks config, AUT reachability, Jira, browser; records the app's pages and endpoints (app knowledge)`);
  console.log(`  ${needInstall && !flags.install ? '3' : '2'}. Ask Opus: "Run a held-out evaluation of ABC-123"   (no Jira? npm run heldout -- new ABC-1 --from story.md)`);
  console.log('  Test users, when stories need them (Opus asks when it gets there):');
  console.log('     accounts that already exist  npm run heldout -- accounts --add-existing --username qa.user1@example.com --password-env APP_PASSWORD_1');
  console.log('                                  (password in .env: npm run heldout -- secret APP_PASSWORD_1 --ask; or in Vault: --password-vault secret/qa/app#password)');
  console.log('     accounts the tests create    saved while hardening the first story that needs them (npm run heldout -- accounts --from-chain …)');
  console.log('  Restart your agent app (Claude Code, GitHub Copilot…) once so it loads the Playwright MCP server (browser tier 2) and the subagents.');
});
