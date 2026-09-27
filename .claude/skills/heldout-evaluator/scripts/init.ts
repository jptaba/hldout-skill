/**
 * Setup — scaffold everything a project needs to run held-out evaluations (idempotent; never overwrites).
 *
 *   heldout init --base-url https://aut.example.com [--api-base-url …] [--name "My App"] [--profile app]
 *                [--test-id-attr data-testid] [--healthcheck "/,api:/health"]
 *                [--jira mock|cloud] [--jira-url https://<site>.atlassian.net] [--ac-field customfield_10035]
 *                [--install] [--ci]
 *   heldout add-aut <profile> --base-url … [--api-base-url …] [--name …] [--test-id-attr …] [--healthcheck …]
 *
 * Creates or completes: heldout.config.json (with $schema for editor help), playwright.config.ts,
 * heldout-support/fixtures.ts, tsconfig.json, .mcp.json (Playwright MCP = tier 2), .env + .env.example,
 * package.json (the `heldout` npm script and dev dependencies), .gitignore entries, mock-jira/, evaluations/.
 * --install runs `npm install` and installs Chromium. --ci adds .github/workflows/heldout.yml.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SKILL_DIR, flagStr, main, parseArgs, rel, unmangleMsysPath, type Flags } from './lib/config';
import { describeCounts, detectTestIdAttribute } from './lib/detect';

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

function profileFrom(flags: Flags, base: Record<string, unknown> = {}) {
  const baseURL = flagStr(flags, 'base-url') ?? (base.baseURL as string);
  const hc = flagStr(flags, 'healthcheck');
  return {
    ...base,
    name: flagStr(flags, 'name') ?? base.name ?? 'Application Under Test',
    baseURL,
    // A new --base-url implies the API lives there too unless --api-base-url says otherwise.
    apiBaseURL: flagStr(flags, 'api-base-url') ?? (flagStr(flags, 'base-url') ? baseURL : (base.apiBaseURL ?? baseURL)),
    testIdAttribute: flagStr(flags, 'test-id-attr') ?? base.testIdAttribute ?? 'data-testid',
    healthcheck: hc ? hc.split(',').map((x) => unmangleMsysPath(x.trim())).filter(Boolean) : (base.healthcheck ?? ['/']),
  };
}

/** Without --test-id-attr, look at the rendered page and record the test-id attribute it actually uses. */
async function detectTestId(configFile: string, id: string, flags: Flags): Promise<void> {
  if (flagStr(flags, 'test-id-attr')) return;
  const cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const profile = cfg.auts[id];
  if (!profile) return;
  const d = await detectTestIdAttribute(profile.baseURL);
  if (!d.attribute) {
    say('•', `test-id attribute: none found on ${profile.baseURL} (${d.error ?? describeCounts(d)}) — keeping "${profile.testIdAttribute}"; tests will use roles and labels`);
    return;
  }
  if (d.attribute !== profile.testIdAttribute) {
    profile.testIdAttribute = d.attribute;
    fs.writeFileSync(configFile, `${JSON.stringify(cfg, null, 2)}\n`);
  }
  say('✔', `test-id attribute: ${d.attribute} (on ${profile.baseURL}: ${describeCounts(d)}${d.via === 'html' ? '; served HTML only — install Chromium for a rendered check' : ''})`);
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
    await detectTestId(configFile, addAut, flags);
    return;
  }

  for (const [tpl, target] of FILES) {
    const dest = path.join(ROOT, target);
    if (fs.existsSync(dest)) { say('•', `keep    ${target}`); continue; }
    let content = fs.readFileSync(path.join(SKILL_DIR, 'templates', tpl), 'utf8');
    if (tpl === 'heldout.config.json') {
      if (!flagStr(flags, 'base-url')) throw new Error('--base-url is required the first time (the web address of the application to evaluate). Add --api-base-url if the API lives elsewhere.');
      const cfg = JSON.parse(content);
      const id = flagStr(flags, 'profile') ?? cfg.defaultAut;
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
    const dest = path.join(ROOT, '.github', 'workflows', 'heldout.yml');
    if (fs.existsSync(dest)) say('•', 'keep    .github/workflows/heldout.yml');
    else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(SKILL_DIR, 'templates', 'ci', 'heldout.yml'), dest);
      say('✔', 'created .github/workflows/heldout.yml');
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
  if (flagStr(flags, 'base-url')) await detectTestId(configFile, flagStr(flags, 'profile') ?? JSON.parse(fs.readFileSync(configFile, 'utf8')).defaultAut, flags);

  console.log('\nNext:');
  if (needInstall && !flags.install) console.log('  1. npm install && npx playwright install chromium   (or re-run init with --install)');
  console.log(`  ${needInstall && !flags.install ? '2' : '1'}. npm run heldout -- doctor          checks config, AUT reachability, Jira, browser`);
  console.log(`  ${needInstall && !flags.install ? '3' : '2'}. Ask Claude: "Run a held-out evaluation of ABC-123"   (no Jira? npm run heldout -- new ABC-1 --from story.md)`);
  console.log('  Restart Claude Code once so it loads .mcp.json (Playwright MCP, browser tier 2).');
});
