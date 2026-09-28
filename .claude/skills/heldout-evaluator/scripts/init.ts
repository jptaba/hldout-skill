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
 * Creates or completes: heldout.config.json (with $schema for editor help), playwright.config.ts,
 * heldout-support/fixtures.ts, tsconfig.json, .mcp.json (Playwright MCP = tier 2), .env + .env.example,
 * package.json (the `heldout` npm script and dev dependencies), .gitignore entries, mock-jira/, evaluations/.
 * --install runs `npm install` and installs Chromium. --ci [gitlab|github] adds a CI pipeline (default: from the git remote).
 * Run from a skill outside the project (a clone anywhere, any git host), it first installs the skill into
 * .claude/skills/heldout-evaluator, or updates an older copy; re-running it after a pull updates the skill.
 * Unless given, the profile id comes from the host name, and one visit of the start page supplies the name (page
 * title), the test-id attribute and blockHosts (the ad/analytics networks the page loads).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SKILL_DIR, flagStr, main, parseArgs, rel, unmangleMsysPath, type Flags } from './lib/config';
import { appNameFrom, appRootOf, baseUrlOf, describeCounts, discoverApp, profileIdFor } from './lib/detect';

const FILES: [template: string, target: string][] = [
  ['heldout.config.json', 'heldout.config.json'],
  ['playwright.config.ts', 'playwright.config.ts'],
  ['fixtures.ts', 'heldout-support/fixtures.ts'],
  ['tsconfig.json', 'tsconfig.json'],
  ['mcp.json', '.mcp.json'],
  ['env.example', '.env.example'],
];
/** Versions the skill is tested with (caret ranges — npm resolves the latest compatible). */
const DEV_DEPENDENCIES: Record<string, string> = { '@playwright/test': '^1.63.0', tsx: '^4.23.0', typescript: '^7.0.0', '@types/node': '^26.0.0' };
const GITIGNORE = ['.env', 'node_modules/', 'test-results/', 'playwright-report/', 'evaluations/*/runs/*/html/', 'evaluations/*/runs/*/artifacts/', '*.trace.zip', '.playwright-mcp/', '.claude/settings.local.json'];

const say = (mark: string, msg: string) => console.log(`${mark} ${msg}`);

const PROJECT_SKILL = path.join(ROOT, '.claude', 'skills', 'heldout-evaluator');
/** Project files that are copies of skill templates: refreshed on a skill update unless the project changed them. */
const TEMPLATE_COPIES: [template: string, target: string][] = [
  ['playwright.config.ts', 'playwright.config.ts'],
  ['fixtures.ts', 'heldout-support/fixtures.ts'],
  ...['heldout-contract-extractor.md', 'heldout-contract-reviewer.md'].map((f) => [`agents/${f}`, `.claude/agents/${f}`] as [string, string]),
];
const git = (dir: string, ...args: string[]) => {
  const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : undefined;
};

/**
 * Run from a skill outside this project (a clone anywhere, on any git host): copy the skill into the project, or
 * replace an older copy, then continue from the copy. Template copies the project hasn't changed are refreshed.
 */
function installSkillFrom(source: string): void {
  // Line endings don't count as a change (git on Windows checks out CRLF; editors may normalise either way).
  const read = (f: string) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n') : undefined);
  const before = read(path.join(PROJECT_SKILL, 'SOURCE.json'));
  const refresh = fs.existsSync(PROJECT_SKILL) ? TEMPLATE_COPIES.filter(([tpl, target]) => {
    const current = read(path.join(ROOT, target));
    return current !== undefined && current === read(path.join(PROJECT_SKILL, 'templates', tpl));
  }) : [];
  const edited = fs.existsSync(PROJECT_SKILL) ? TEMPLATE_COPIES.filter(([, t]) => fs.existsSync(path.join(ROOT, t)) && !refresh.some(([, r]) => r === t)) : [];
  fs.rmSync(PROJECT_SKILL, { recursive: true, force: true });
  fs.cpSync(source, PROJECT_SKILL, { recursive: true, filter: (f) => !path.relative(source, f).split(/[\\/]/).some((p) => p === 'node_modules' || p === '.git') });
  // A working tree with uncommitted changes to the skill is not that commit: say so.
  const head = git(source, 'rev-parse', '--short', 'HEAD');
  const commit = head && git(source, 'status', '--porcelain', '--', '.') ? `${head}+local changes` : head;
  // Where to pull from and what to run again to update (paths in the form the local git prints them).
  const repo = git(source, 'rev-parse', '--show-toplevel');
  const info = { from: repo ?? source, update: `${repo ? `git -C "${repo}" pull, then ` : ''}npx -y tsx "${path.join(source, 'scripts', 'heldout.ts').split(path.sep).join('/')}" init`,
    remote: git(source, 'remote', 'get-url', 'origin'), commit, installedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(PROJECT_SKILL, 'SOURCE.json'), `${JSON.stringify(info, null, 2)}\n`);
  const was = before ? (JSON.parse(before) as { commit?: string }).commit : undefined;
  say('✔', `${before ? `updated the skill${was || commit ? ` (${was ?? '?'} → ${commit ?? '?'})` : ''}` : 'installed the skill'} → ${rel(PROJECT_SKILL)} (from ${info.remote ?? source})`);
  for (const [tpl, target] of refresh) {
    if (read(path.join(ROOT, target)) === read(path.join(PROJECT_SKILL, 'templates', tpl))) continue; // unchanged in this version
    fs.copyFileSync(path.join(PROJECT_SKILL, 'templates', tpl), path.join(ROOT, target));
    say('✔', `refreshed ${target} (new in this version of the skill)`);
  }
  for (const [tpl, target] of edited) say('⚠', `kept ${target} (changed in this project) — compare it with ${rel(path.join(PROJECT_SKILL, 'templates', tpl))}`);
}

function profileFrom(flags: Flags, base: Record<string, unknown> = {}) {
  const given = flagStr(flags, 'base-url');
  const baseURL = given ? baseUrlOf(given) : (base.baseURL as string);
  if (given && baseURL !== given && baseURL !== `${given}/`) say('✔', `base URL: ${baseURL} (the folder of the page you gave, so paths like "page.htm" resolve beside it)`);
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
  fs.writeFileSync(configFile, `${JSON.stringify(cfg, null, 2)}\n`);
}

const schemaRef = () => rel(path.join(SKILL_DIR, 'templates', 'heldout.config.schema.json'));

function ensurePackageJson(): boolean {
  const file = path.join(ROOT, 'package.json');
  const pkg = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { name: path.basename(ROOT).toLowerCase().replace(/[^a-z0-9-]+/g, '-'), private: true, version: '0.0.0' };
  const created = !fs.existsSync(file);
  pkg.scripts ??= {};
  pkg.devDependencies ??= {};
  let changed = created;
  const script = `tsx ${rel(path.join(SKILL_DIR, 'scripts', 'heldout.ts'))}`;
  if (!pkg.scripts.heldout) { pkg.scripts.heldout = script; changed = true; }
  const missing = Object.entries(DEV_DEPENDENCIES).filter(([d]) => !pkg.devDependencies[d] && !pkg.dependencies?.[d]);
  for (const [d, v] of missing) pkg.devDependencies[d] = v;
  if (missing.length) changed = true;
  if (changed) fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
  say(changed ? '✔' : '•', `${created ? 'created' : changed ? 'updated' : 'keep   '} package.json${missing.length ? ` (+ ${missing.map(([d]) => d).join(', ')})` : ''}${changed ? ' — npm script "heldout"' : ''}`);
  return missing.length > 0 || created;
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
    installSkillFrom(SKILL_DIR);
    const cmd = flags['add-aut'] ? 'add-aut' : 'init';
    const args = process.argv.slice(2).filter((a) => a !== '--add-aut');
    const again = spawnSync(process.execPath, [...process.execArgv, path.join(PROJECT_SKILL, 'scripts', 'heldout.ts'), cmd, ...args], { stdio: 'inherit', cwd: ROOT });
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

  for (const [tpl, target] of FILES) {
    const dest = path.join(ROOT, target);
    if (fs.existsSync(dest)) { say('•', `keep    ${target}`); continue; }
    let content = fs.readFileSync(path.join(SKILL_DIR, 'templates', tpl), 'utf8');
    if (tpl === 'heldout.config.json') {
      if (!flagStr(flags, 'base-url')) throw new Error('--base-url is required the first time (the web address of the application to evaluate). Add --api-base-url if the API lives elsewhere.');
      const cfg = JSON.parse(content);
      const id = flagStr(flags, 'profile') ?? profileIdFor(flagStr(flags, 'base-url')!);
      const tplProfile = cfg.auts[cfg.defaultAut];
      delete cfg.auts[cfg.defaultAut];
      cfg.auts[id] = profileFrom(flags, tplProfile);
      cfg.defaultAut = id;
      const jiraMode = flagStr(flags, 'jira');
      if (jiraMode) cfg.jira.mode = jiraMode;
      if (flagStr(flags, 'jira-url')) cfg.jira.baseUrl = flagStr(flags, 'jira-url');
      if (flagStr(flags, 'ac-field')) cfg.jira.acceptanceCriteriaField = flagStr(flags, 'ac-field');
      content = `${JSON.stringify({ $schema: schemaRef(), ...cfg }, null, 2)}\n`;
    }
    if (tpl === 'mcp.json' && process.platform !== 'win32') {
      content = content.replace('"command": "cmd"', '"command": "npx"').replace('"/c", "npx", ', '');
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
    say('✔', `created ${target}`);
  }
  const envFile = path.join(ROOT, '.env');
  if (!fs.existsSync(envFile)) {
    let env = fs.readFileSync(path.join(SKILL_DIR, 'templates', 'env.example'), 'utf8');
    if (flagStr(flags, 'jira')) env = env.replace(/^JIRA_MODE=.*$/m, `JIRA_MODE=${flagStr(flags, 'jira')}`);
    if (flagStr(flags, 'jira-url')) env = env.replace(/^JIRA_BASE_URL=.*$/m, `JIRA_BASE_URL=${flagStr(flags, 'jira-url')}`);
    fs.writeFileSync(envFile, env);
    say('✔', 'created .env (git-ignored — secrets go here)');
  } else say('•', 'keep    .env');
  const needInstall = ensurePackageJson();
  ensureGitignore();
  if (flags.ci) {
    // GitLab unless the project is evidently on GitHub (or --ci says which).
    const remote = git(ROOT, 'remote', 'get-url', 'origin') ?? '';
    const ci = flagStr(flags, 'ci') ?? (fs.existsSync(path.join(ROOT, '.gitlab-ci.yml')) ? 'gitlab' : /github\.com/.test(remote) || fs.existsSync(path.join(ROOT, '.github')) ? 'github' : 'gitlab');
    if (ci !== 'gitlab' && ci !== 'github') throw new Error(`--ci takes gitlab or github, not "${ci}"`);
    const target = ci === 'github' ? '.github/workflows/heldout.yml' : '.gitlab/heldout.gitlab-ci.yml';
    const dest = path.join(ROOT, target);
    if (fs.existsSync(dest)) say('•', `keep    ${target}`);
    else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(SKILL_DIR, 'templates', 'ci', ci === 'github' ? 'github-actions.yml' : 'gitlab-ci.yml'), dest);
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
  // Subagents: the contract builder and its independent reviewer (separate contexts by design).
  const agentsSrc = path.join(SKILL_DIR, 'templates', 'agents');
  for (const f of fs.existsSync(agentsSrc) ? fs.readdirSync(agentsSrc) : []) {
    const dest = path.join(ROOT, '.claude', 'agents', f);
    if (fs.existsSync(dest)) { say('•', `keep    .claude/agents/${f}`); continue; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(agentsSrc, f), dest);
    say('✔', `created .claude/agents/${f}`);
  }

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
  console.log(`  ${needInstall && !flags.install ? '2' : '1'}. npm run heldout -- doctor          checks config, AUT reachability, Jira, browser`);
  console.log(`  ${needInstall && !flags.install ? '3' : '2'}. Ask Opus: "Run a held-out evaluation of ABC-123"   (no Jira? npm run heldout -- new ABC-1 --from story.md)`);
  console.log('  Test users, when stories need them (Opus asks when it gets there):');
  console.log('     accounts that already exist  npm run heldout -- accounts --add-existing --username qa.user1@example.com --password-env APP_PASSWORD_1');
  console.log('                                  (password in .env: npm run heldout -- secret APP_PASSWORD_1 --ask; or in Vault: --password-vault secret/qa/app#password)');
  console.log('     accounts the tests create    saved while hardening the first story that needs them (npm run heldout -- accounts --from-chain …)');
  console.log('  Restart your agent app (Claude Code, GitHub Copilot…) once so it loads the Playwright MCP server (browser tier 2) and the subagents.');
});
