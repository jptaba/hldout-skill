/**
 * Setup — scaffold everything a project needs to run held-out evaluations (idempotent; never overwrites).
 *
 *   heldout init --base-url https://aut.example.com [--api-base-url …] [--name "My App"] [--profile <id>]
 *                [--test-id-attr data-testid] [--healthcheck "/,api:/health"]
 *                [--jira mock|datacenter] [--jira-url https://jira.example.com] [--ac-field customfield_10035]
 *                [--install] [--ci]
 *   heldout init [--profile <id>] --data-prefix qa        the prefix of the names tests make (default "hldout")
 *   heldout init [--profile <id>] --max-workers 1 --min-test-interval-ms 10000   pacing for a rate-limited host
 *   heldout add-aut <profile> --base-url … [--api-base-url …] [--name …] [--test-id-attr …] [--healthcheck …]
 *
 * Run from the skill repository (a clone anywhere, any git host), it first runs that repository's `update`, which
 * installs the skill, its scripts, the subagents and the workspace files (and the CI pipeline with --ci [gitlab|github]),
 * then continues from the project's own copy of the scripts. There it creates or completes, and never overwrites:
 * heldout.config.json (with $schema for editor help), .env (from .env.example), package.json (the `heldout` npm script
 * and dev dependencies), .gitignore entries, mock-jira/, output/ and actions/, and the root .mcp.json (Claude Code reads MCP
 * servers only there) with the skill's servers from .vscode/mcp.json, added to any the project already has. --install runs `npm install` and installs
 * Chromium. Unless given, the profile id comes from the host name, and one visit of the start page supplies the name
 * (page title), the test-id attribute and blockHosts (the ad/analytics networks the page loads).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { AGENT_FILES, CONFIG_SCHEMA, JIRA_MODES, ROOT, SCRIPTS_DIR, SKILL_DIR, ensureGitignore, flagStr, main, parseArgs, rel, unmangleMsysPath, type Flags } from './config';
import { appNameFrom, appRootOf, baseUrlOf, describeCounts, discoverApp, profileIdFor } from './detect';
import { MCP_FILE, mcpServersIn, writeClaudeCodeMcp } from './mcp-config';

/** Files update copies from the skill repository; init only checks they are there. */
const WORKSPACE_FILES = ['playwright.config.ts', 'tsconfig.json', MCP_FILE, '.env.example', 'heldout-support/fixtures.ts', ...AGENT_FILES];
/** A new project's heldout.config.json: flags and one visit of the application fill in the profile. */
const STARTER_CONFIG = {
  jira: { mode: 'mock', mockRoot: 'mock-jira', baseUrl: 'https://jira.example.com', acceptanceCriteriaField: '', verdictLabelPrefix: 'heldout-' },
  outputDir: 'output',
  actionsDir: 'actions',
  run: { retries: 1, workers: 4, headless: true, actionTimeoutMs: 10000, expectTimeoutMs: 5000, testTimeoutMs: 60000 },
};
const STARTER_PROFILE = {
  testIdAttribute: 'data-testid',
  healthcheck: ['/'],
  notes: 'Everything AUT-specific belongs here or in .env, never inside the skill. Add one profile per application: its stories go to output/<profile>/<KEY>/, its actions to actions/<profile>/.',
};
/** Versions the skill is tested with (caret ranges — npm resolves the latest compatible). */
const DEV_DEPENDENCIES: Record<string, string> = { '@playwright/test': '^1.63.0', tsx: '^4.23.0', typescript: '^7.0.0', '@types/node': '^26.0.0' };

const say = (mark: string, msg: string) => console.log(`${mark} ${msg}`);

const PROJECT_SCRIPTS = path.join(ROOT, '.github', 'scripts');

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


main(async () => {
  const { _, flags } = parseArgs();
  const configFile = path.join(ROOT, 'heldout.config.json');
  const existingProject = fs.existsSync(configFile);

  // Started from the skill repository: its update installs the skill and the workspace files (and the CI pipeline with
  // --ci), then init continues from the project's own copy of the scripts.
  const toSkill = path.relative(ROOT, SKILL_DIR);
  if (toSkill.startsWith('..') || path.isAbsolute(toSkill)) {
    const node = (script: string, args: string[], env: NodeJS.ProcessEnv = process.env) =>
      spawnSync(process.execPath, [...process.execArgv, script, ...args], { stdio: 'inherit', cwd: ROOT, env }).status ?? 1;
    const argv = process.argv.slice(2);
    const ciAt = argv.indexOf('--ci');
    const ciArgs = ciAt < 0 ? [] : ['--ci', ...(['gitlab', 'github'].includes(argv[ciAt + 1]) ? [argv[ciAt + 1]] : [])];
    const updated = node(path.join(SCRIPTS_DIR, 'update.ts'), ciArgs, { ...process.env, HELDOUT_INIT: '1' });
    if (updated !== 0) process.exit(updated);
    const cmd = flags['add-aut'] ? 'add-aut' : 'init';
    const rest = argv.filter((a, i) => a !== '--add-aut' && (ciAt < 0 || (i !== ciAt && !(i === ciAt + 1 && ciArgs.length === 2))));
    process.exit(node(path.join(PROJECT_SCRIPTS, 'heldout.ts'), [cmd, ...rest]));
  }
  // The CI pipeline comes from the skill repository: init passes --ci on to update when started from there.
  if (flags.ci) say('⚠', 'the CI pipeline is copied from the skill repository: run update --ci from there (README "Update")');
  for (const file of WORKSPACE_FILES) if (!fs.existsSync(path.join(ROOT, file))) say('⚠', `${file} is missing — run update from the skill repository to restore it (README "Update")`);

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
    const jira = flagStr(flags, 'jira');
    if (jira && !(JIRA_MODES as readonly string[]).includes(jira)) throw new Error(`--jira takes ${JIRA_MODES.join(' or ')}, not "${jira}"`);
    if (jira) cfg.jira.mode = jira;
    if (flagStr(flags, 'jira-url')) cfg.jira.baseUrl = flagStr(flags, 'jira-url')!;
    if (flagStr(flags, 'ac-field')) cfg.jira.acceptanceCriteriaField = flagStr(flags, 'ac-field')!;
    fs.writeFileSync(configFile, `${JSON.stringify({ $schema: rel(CONFIG_SCHEMA), defaultAut: id, auts: { [id]: profileFrom(flags, STARTER_PROFILE) }, ...cfg }, null, 2)}\n`);
    say('✔', 'created heldout.config.json');
  }
  const envFile = path.join(ROOT, '.env');
  if (fs.existsSync(envFile)) say('•', 'keep    .env');
  else if (!fs.existsSync(path.join(ROOT, '.env.example'))) say('⚠', '.env not created: no .env.example to start it from');
  else {
    let env = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
    if (flagStr(flags, 'jira')) env = env.replace(/^JIRA_MODE=.*$/m, `JIRA_MODE=${flagStr(flags, 'jira')}`);
    if (flagStr(flags, 'jira-url')) env = env.replace(/^JIRA_BASE_URL=.*$/m, `JIRA_BASE_URL=${flagStr(flags, 'jira-url')}`);
    fs.writeFileSync(envFile, env);
    say('✔', 'created .env (git-ignored — secrets go here)');
  }
  const needInstall = ensurePackageJson();
  ensureGitignore(say);
  for (const d of ['mock-jira/issues', 'mock-jira/outbox', 'output', 'actions']) fs.mkdirSync(path.join(ROOT, d), { recursive: true });
  // Claude Code reads MCP servers only from the root .mcp.json: give it the skill's servers from .vscode/mcp.json (those
  // update recorded; the project's own VS Code servers stay VS Code's). Update already reported the file: say only a change.
  const servers = mcpServersIn(path.join(ROOT, MCP_FILE));
  if (servers) {
    const sourceFile = path.join(SKILL_DIR, 'SOURCE.json');
    const shipped = fs.existsSync(sourceFile) ? (JSON.parse(fs.readFileSync(sourceFile, 'utf8')) as { mcpServers?: string[] }).mcpServers : undefined;
    writeClaudeCodeMcp(ROOT, Object.fromEntries(Object.entries(servers).filter(([name]) => !shipped || shipped.includes(name))), (mark, msg) => { if (mark !== '•') say(mark, msg); });
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

  // Run again in a set-up project: nothing to onboard.
  if (existingProject && !flagStr(flags, 'base-url') && !(needInstall && !flags.install)) {
    console.log('\nNext: npm run heldout -- doctor   (checks the project; stories and actions carry on as before)');
    return;
  }
  console.log('\nNext:');
  if (needInstall && !flags.install) console.log('  1. npm install && npx playwright install chromium   (or re-run init with --install)');
  console.log(`  ${needInstall && !flags.install ? '2' : '1'}. npm run heldout -- doctor  checks config, AUT reachability, Jira, browser, the actions`);
  console.log(`  ${needInstall && !flags.install ? '3' : '2'}. Ask Opus: "Run a held-out evaluation of ABC-123"   (no Jira? npm run heldout -- new ABC-1 --from story.md)`);
  console.log('  Test users, when stories need them (Opus asks when it gets there):');
  console.log('     accounts that already exist  npm run heldout -- accounts --add-existing --username qa.user1@example.com --password-env APP_PASSWORD_1');
  console.log('                                  (password in .env: npm run heldout -- secret APP_PASSWORD_1 --ask; or in Vault: --password-vault secret/qa/app#password)');
  console.log('     accounts the tests create    saved while hardening the first story that needs them (npm run heldout -- accounts --from-chain …)');
  console.log('  Restart your agent app (Claude Code, GitHub Copilot…) once so it loads the Playwright MCP server (browser tier 2) and the subagents.');
});
