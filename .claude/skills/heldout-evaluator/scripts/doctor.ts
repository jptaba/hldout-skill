/**
 * Setup check — is everything wired up? Each problem comes with the command that fixes it.
 *
 *   heldout doctor [--jira] [--offline] [--aut <profile>]
 *
 *   --jira     also authenticate against Jira Cloud and list custom fields that may hold acceptance criteria
 *   --offline  skip network checks (AUT reachability, Jira)
 *
 * Exit 1 when any check fails (warnings don't fail).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT, SKILL_DIR, loadConfig, loadEnv, main, parseArgs, rel, resolveUrl, validateConfig, type HeldoutConfig } from './lib/config';
import { describeCounts, discoverApp } from './lib/detect';
import { createTracker } from './lib/jira';
import { safeToScrub } from './lib/redact';
import { checkAccountRecipe, envNamesIn } from './lib/accounts';
import { loadVaultSecrets, loadedVaultSecrets, vaultRefsIn, vaultSettings } from './lib/secrets';

type Level = 'ok' | 'warn' | 'fail';
const results: { level: Level; area: string; msg: string; fix?: string }[] = [];
const check = (level: Level, area: string, msg: string, fix?: string) => results.push({ level, area, msg, fix });
const H = 'npm run heldout --';

async function reachable(url: string): Promise<{ ok: boolean; detail: string }> {
  const t = Date.now();
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15_000), redirect: 'follow' });
    return { ok: r.status < 500, detail: `${r.status} in ${Date.now() - t} ms` };
  } catch (e) {
    const cause = (e as { cause?: { code?: string } }).cause?.code;
    return { ok: false, detail: `${(e as Error).message}${cause ? ` (${cause})` : ''}` };
  }
}

main(async () => {
  const { flags } = parseArgs();
  loadEnv();

  // ---- skill --------------------------------------------------------------------------------------
  const sourceFile = path.join(SKILL_DIR, 'SOURCE.json');
  if (fs.existsSync(sourceFile)) {
    const s = JSON.parse(fs.readFileSync(sourceFile, 'utf8')) as { from: string; update: string; remote?: string; commit?: string; installedAt: string };
    const update = fs.existsSync(s.from) ? `${s.update} (from this folder)` : `clone ${s.remote ?? 'the skill repository'} (README "Adopt it") and run its init from this folder`;
    check('ok', 'skill', `installed ${s.installedAt.slice(0, 10)} from ${s.remote ?? s.from}${s.commit ? ` @ ${s.commit}` : ''} — to update: ${update}`);
  }

  // ---- runtime ------------------------------------------------------------------------------------
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major > 20 || (major === 20 && minor >= 11)) check('ok', 'runtime', `Node ${process.versions.node}`);
  else check('fail', 'runtime', `Node ${process.versions.node} is too old (need ≥ 20.11)`, 'install Node 20 LTS or newer');
  const req = createRequire(path.join(ROOT, 'package.json'));
  for (const dep of ['@playwright/test', 'tsx', 'typescript']) {
    try { req.resolve(`${dep}/package.json`); check('ok', 'runtime', `${dep} installed`); } catch { check('fail', 'runtime', `${dep} is not installed in this project`, `${H} init --install   (or: npm i -D ${dep})`); }
  }
  try {
    const pw = await import(pathToFile(req.resolve('@playwright/test')));
    // ESM import of the CommonJS package exposes it on `default` in some Node versions.
    const chromium = (pw.chromium ?? pw.default?.chromium) as { executablePath(): string } | undefined;
    if (!chromium) check('warn', 'runtime', 'could not load Playwright to check the browser');
    else if (fs.existsSync(chromium.executablePath())) check('ok', 'runtime', 'Chromium installed');
    else check('fail', 'runtime', 'Chromium browser is not installed', 'npx playwright install chromium');
  } catch (e) {
    if (results.some((r) => r.msg.startsWith('@playwright/test is not'))) { /* already reported */ } else check('warn', 'runtime', `could not check the browser: ${(e as Error).message.split('\n')[0]}`);
  }

  // ---- project files ------------------------------------------------------------------------------
  const cfgFile = path.join(ROOT, 'heldout.config.json');
  let cfg: HeldoutConfig | undefined;
  if (!fs.existsSync(cfgFile)) check('fail', 'config', 'heldout.config.json not found', `${H} init --base-url https://your-app`);
  else {
    let raw: unknown;
    try { raw = JSON.parse(fs.readFileSync(cfgFile, 'utf8')); } catch (e) { check('fail', 'config', `heldout.config.json is not valid JSON: ${(e as Error).message}`); }
    if (raw) {
      const issues = validateConfig(raw);
      for (const i of issues) check('fail', 'config', i, 'edit heldout.config.json (your editor validates it against the schema)');
      if (!issues.length) { cfg = loadConfig(); check('ok', 'config', `heldout.config.json valid — ${Object.keys(cfg.auts).length} AUT profile(s), default "${cfg.defaultAut}"`); }
    }
  }
  for (const [file, fix] of [['playwright.config.ts', `${H} init`], ['heldout-support/fixtures.ts', `${H} init`], ['tsconfig.json', `${H} init`]] as const) {
    if (fs.existsSync(path.join(ROOT, file))) check('ok', 'files', file);
    else check('fail', 'files', `${file} is missing`, fix);
  }
  const fixtures = path.join(ROOT, 'heldout-support', 'fixtures.ts');
  if (fs.existsSync(fixtures) && fs.readFileSync(fixtures, 'utf8') !== fs.readFileSync(path.join(SKILL_DIR, 'templates', 'fixtures.ts'), 'utf8')) {
    check('warn', 'files', 'heldout-support/fixtures.ts differs from the skill template (older copy or local edits)', `compare with ${rel(path.join(SKILL_DIR, 'templates', 'fixtures.ts'))} and update`);
  }
  if (!fs.existsSync(path.join(ROOT, '.env'))) check('warn', 'files', '.env not found (secrets for tests go there)', `${H} init`);
  const gi = fs.existsSync(path.join(ROOT, '.gitignore')) ? fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8') : '';
  if (!/^\.env\s*$/m.test(gi)) check('warn', 'files', '.env is not git-ignored — secrets could be committed', `${H} init   (adds the .gitignore entries)`);
  const agentsDir = path.join(SKILL_DIR, 'templates', 'agents');
  for (const f of fs.existsSync(agentsDir) ? fs.readdirSync(agentsDir) : []) {
    if (fs.existsSync(path.join(ROOT, '.claude', 'agents', f))) check('ok', 'subagents', `.claude/agents/${f}`);
    else check('warn', 'subagents', `.claude/agents/${f} is missing (contract building / independent review subagent)`, `${H} init   (then restart Claude Code)`);
  }
  const mcp = path.join(ROOT, '.mcp.json');
  if (fs.existsSync(mcp) && /playwright\/mcp/.test(fs.readFileSync(mcp, 'utf8'))) check('ok', 'browser tiers', 'Playwright MCP configured (.mcp.json) — tier 2 after a Claude Code restart');
  else check('warn', 'browser tiers', 'Playwright MCP not configured — hardening falls back to the bundled inspector', `${H} init`);

  /**
   * Secret values from .env that appear in files git would commit (tracked, or untracked and not ignored). Values a
   * story itself publishes (a sandbox's documented demo password, found under evaluations/<KEY>/requirement/) are not
   * secrets and are skipped, as are weak values (plain words) that can't be told apart from ordinary text.
   */
  function committableLeaks(evalDir: string): Map<string, string[]> {
    const git = spawnSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (git.status !== 0) return new Map();
    const files = git.stdout.split('\0').filter(Boolean);
    const read = (f: string) => { try { return fs.statSync(path.join(ROOT, f)).size < 5_000_000 ? fs.readFileSync(path.join(ROOT, f), 'utf8') : ''; } catch { return ''; } };
    const published = files.filter((f) => f.startsWith(`${rel(evalDir)}/`) && f.split('/')[2] === 'requirement').map(read).join('\n');
    const secrets = [...Object.entries(process.env).filter(([k, v]) => /PASS|TOKEN|SECRET|API_KEY/.test(k) && v && safeToScrub(v) && !published.includes(v)) as [string, string][],
      ...Object.entries(loadedVaultSecrets()).filter(([, v]) => safeToScrub(v) && !published.includes(v)).map(([ref, v]) => [`${'$'}{vault:${ref}}`, v] as [string, string])];
    const leaks = new Map<string, string[]>();
    if (!secrets.length) return leaks;
    for (const f of files) {
      const text = read(f);
      for (const [name, v] of secrets) if (text.includes(v)) leaks.set(name, [...(leaks.get(name) ?? []), f]);
    }
    return leaks;
  }

  // ---- secrets referenced by evaluations ----------------------------------------------------------
  if (cfg) {
    const evalDir = path.join(ROOT, cfg.evaluationsDir);
    const missing = new Map<string, string[]>();
    if (fs.existsSync(evalDir)) for (const key of fs.readdirSync(evalDir)) {
      const td = path.join(evalDir, key, 'test-data.json');
      if (!fs.existsSync(td)) continue;
      for (const m of fs.readFileSync(td, 'utf8').matchAll(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g)) if (!process.env[m[1]]) missing.set(m[1], [...(missing.get(m[1]) ?? []), key]);
    }
    // The accounts recipes' secrets too (seed.account() reads them in every test that makes an account).
    for (const [id, prof] of Object.entries(cfg.auts)) for (const n of envNamesIn(prof.accounts)) if (!process.env[n]) missing.set(n, [...(missing.get(n) ?? []), `auts.${id}.accounts`]);
    // An existing account's password is typed in (hidden); one for accounts the tests create can be generated.
    const existingNames = new Set(Object.values(cfg.auts).flatMap((prof) => envNamesIn(prof.accounts?.existing)));
    for (const [name, keys] of missing) check('fail', 'secrets', `${name} is referenced by ${[...new Set(keys)].join(', ')} but not set`,
      existingNames.has(name) ? `in a terminal of your own: ${H} secret ${name} --ask   (or set it as an environment / CI variable)` : `${H} secret ${name} --generate   (accounts the tests create), or ${H} secret ${name} --ask (an existing account)`);
    if (!missing.size) check('ok', 'secrets', 'every ${env:…} referenced by test data and accounts is set');

    // HashiCorp Vault: every ${vault:…} reference in test data and accounts recipes resolves.
    const testData = fs.existsSync(evalDir) ? fs.readdirSync(evalDir).map((k) => path.join(evalDir, k, 'test-data.json')).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, 'utf8')) : [];
    const vaultUsers = [...testData, ...Object.values(cfg.auts).map((prof) => prof.accounts)];
    const refs = vaultUsers.flatMap(vaultRefsIn);
    if (refs.length && flags.offline) check('warn', 'vault', `${refs.length} ${'$'}{vault:…} reference(s) not checked (--offline)`);
    else if (refs.length) {
      const vs = vaultSettings();
      const problems = await loadVaultSecrets(vaultUsers);
      if (problems.length) for (const pr of problems) check('fail', 'vault', pr, !vs.addr ? 'add VAULT_ADDR=https://… to .env' : !vs.tokenSource ? 'run `vault login` once (the token is picked up), or set VAULT_TOKEN, or VAULT_ROLE_ID + VAULT_SECRET_ID for AppRole' : 'check the path and field with: vault kv get <path>');
      else check('ok', 'vault', `${refs.length} reference(s) read from ${vs.addr}${vs.namespace ? ` (namespace ${vs.namespace})` : ''} with the token from ${vs.tokenSource}`);
    }
    const leaks = committableLeaks(evalDir);
    for (const [name, files] of leaks) check('fail', 'secrets', `the value of ${name} is in ${files.length} file(s) git would commit: ${files.slice(0, 4).join(', ')}${files.length > 4 ? ', …' : ''}`, `replace it with \${env:${name}} or a made-up value; if it was already pushed, change the secret`);
    if (!leaks.size) check('ok', 'secrets', 'no .env secret value in files git would commit');
  }

  // ---- network: AUTs and Jira ---------------------------------------------------------------------
  if (cfg && !flags.offline) {
    const ids = typeof flags.aut === 'string' ? [flags.aut] : Object.keys(cfg.auts);
    // Probe in parallel, report in profile order.
    const perAut = await Promise.all(ids.map(async (id) => {
      const p = cfg!.auts[id];
      if (!p) return [{ ok: false, url: `profile "${id}"`, detail: 'not found in heldout.config.json' }];
      const norm = (u: string) => { try { return new URL(u).href; } catch { return u; } };
      const resolve = (h: string) => { try { return h.startsWith('api:') ? resolveUrl(p.apiBaseURL ?? p.baseURL, h.slice(4)) : resolveUrl(p.baseURL, h); } catch (e) { return `invalid healthcheck "${h}": ${(e as Error).message}`; } };
      const targets = [...new Set([p.baseURL, ...(p.apiBaseURL ? [p.apiBaseURL] : []),
        ...(p.healthcheck ?? []).map(resolve)].map(norm))];
      return Promise.all(targets.map(async (url) => (url.startsWith('invalid') ? { url: `auts.${id}.healthcheck`, ok: false, detail: url } : { url, ...(await reachable(url)) })));
    }));
    // Rendering each app is slow, so the start page is checked for one profile (a single-app project or --aut).
    const testIds = ids.length === 1 && cfg.auts[ids[0]] ? { [ids[0]]: await discoverApp(cfg.auts[ids[0]].baseURL) } : {};
    ids.forEach((id, i) => {
      for (const r of perAut[i]) check(r.ok ? 'ok' : 'fail', `AUT ${id}`, `${r.url} → ${r.detail}`, r.ok ? undefined : 'check the URL in heldout.config.json, VPN/proxy, or whether the environment is up');
      const d = testIds[id];
      const configured = cfg!.auts[id]?.testIdAttribute ?? 'data-testid';
      if (!d || d.via === 'none') return;
      if (!d.attribute) check('ok', `AUT ${id}`, 'no test-id attributes on the start page or the pages its navigation links to — tests will locate by role and label');
      else if (d.attribute === configured) check('ok', `AUT ${id}`, `test-id attribute ${configured} is used by the app (${describeCounts(d)})`);
      else check('warn', `AUT ${id}`, `testIdAttribute is "${configured}" but the app renders ${describeCounts(d)}`, `set auts.${id}.testIdAttribute to "${d.attribute}" in heldout.config.json`);
      const unblocked = d.adDomains.filter((h) => !(cfg!.auts[id]?.blockHosts ?? []).includes(h));
      if (unblocked.length) check('warn', `AUT ${id}`, `the start page loads ad/analytics networks that are not blocked: ${unblocked.join(', ')}`, `add them to auts.${id}.blockHosts in heldout.config.json (they inject content and make tests flaky)`);
      const apiBase = cfg!.auts[id]?.apiBaseURL ?? cfg!.auts[id]?.baseURL;
      if (d.apiOrigin && apiBase && !apiBase.startsWith(d.apiOrigin)) check('warn', `AUT ${id}`, `the web app sends its API requests to ${d.apiOrigin}, but apiBaseURL is ${apiBase}`, `set auts.${id}.apiBaseURL to "${d.apiOrigin}" in heldout.config.json if that is the API the requirements describe`);
    });
    // Accounts recipes, run live (create → token → delete) so a broken one never surfaces as BLOCKED scenarios.
    for (const id of ids) {
      const p = cfg.auts[id];
      if (!p?.accounts || envNamesIn(p.accounts).some((n) => !process.env[n])) continue;
      try {
        const steps = await checkAccountRecipe(p.accounts, p.apiBaseURL ?? p.baseURL, { ui: { baseURL: p.baseURL, blockHosts: p.blockHosts, testIdAttribute: p.testIdAttribute } });
        const bad = steps.find((x) => !x.ok);
        if (bad) check('fail', `AUT ${id}`, `accounts recipe: ${bad.step} → ${bad.detail}`, `fix auts.${id}.accounts in heldout.config.json (try the calls with heldout api-probe --chain)`);
        else if (!p.accounts.create) check('ok', `AUT ${id}`, `${p.accounts.existing?.length ?? 0} existing test account(s) sign in${p.accounts.lookup ? ' and resolve their ids' : ''} (runs use at most ${Math.max(1, Math.floor((p.accounts.existing?.length ?? 0) / Math.max(1, p.accounts.perTest ?? 1)))} parallel workers)`);
        else check('ok', `AUT ${id}`, `accounts recipe works: ${steps.map((x) => x.step.split(' ')[0]).join(' → ')}`);
      } catch (e) { check('fail', `AUT ${id}`, `accounts recipe: ${(e as Error).message}`, 'check the recipe paths and the API URL'); }
    }
    if (cfg.jira.mode === 'cloud') {
      for (const v of ['JIRA_EMAIL', 'JIRA_API_TOKEN']) if (!process.env[v]) check('fail', 'Jira', `${v} is not set`, `add ${v}=… to .env (token: https://id.atlassian.com/manage-profile/security/api-tokens)`);
      if (process.env.JIRA_EMAIL && process.env.JIRA_API_TOKEN) {
        try {
          const d = await createTracker(cfg).diagnose();
          check('ok', 'Jira', `authenticated to ${cfg.jira.baseUrl} as ${d.user}`);
          if (flags.jira || !cfg.jira.acceptanceCriteriaField) {
            if (d.acFieldCandidates.length) {
              const hint = d.acFieldCandidates.map((f) => `${f.id} ("${f.name}")`).join(', ');
              check(cfg.jira.acceptanceCriteriaField ? 'ok' : 'warn', 'Jira', `custom fields that may hold acceptance criteria: ${hint}`, cfg.jira.acceptanceCriteriaField ? undefined : 'set jira.acceptanceCriteriaField in heldout.config.json if your stories use one');
            } else check('ok', 'Jira', 'no acceptance-criteria custom field found — ACs are read from the description');
          }
          if (cfg.jira.acceptanceCriteriaField && !d.acFieldCandidates.some((f) => f.id === cfg!.jira.acceptanceCriteriaField)) {
            check('warn', 'Jira', `jira.acceptanceCriteriaField ${cfg.jira.acceptanceCriteriaField} is not among the fields named like acceptance criteria`, 'double-check the id with: heldout doctor --jira');
          }
        } catch (e) { check('fail', 'Jira', (e as Error).message.slice(0, 200), 'check JIRA_BASE_URL, JIRA_EMAIL and JIRA_API_TOKEN'); }
      }
    } else {
      check('ok', 'Jira', `mock mode — stories live in ${cfg.jira.mockRoot}/ (create one: ${H} new ABC-1 --from story.md)`);
    }
  }

  // ---- report -------------------------------------------------------------------------------------
  const mark = { ok: '✔', warn: '⚠', fail: '✖' } as const;
  let area = '';
  for (const r of results) {
    if (r.area !== area) { area = r.area; console.log(`\n${area}`); }
    console.log(`  ${mark[r.level]} ${r.msg}${r.fix ? `\n      → ${r.fix}` : ''}`);
  }
  const fails = results.filter((r) => r.level === 'fail').length;
  const warns = results.filter((r) => r.level === 'warn').length;
  console.log(`\n${fails ? '✖' : '✔'} ${fails} problem(s), ${warns} warning(s).${fails ? '' : ' Ready — ask Claude: "Run a held-out evaluation of <KEY>".'}`);
  if (fails) process.exit(1);
});

function pathToFile(p: string): string { return `file:///${p.replace(/\\/g, '/').replace(/^\//, '')}`; }
