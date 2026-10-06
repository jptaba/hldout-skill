/**
 * Setup check — is everything wired up? Each problem comes with the command that fixes it.
 *
 *   heldout doctor [--jira] [--offline] [--aut <profile>]
 *
 *   --jira     also authenticate against Jira Data Center and list custom fields that may hold acceptance criteria
 *   --offline  skip network checks (AUT reachability, Jira)
 *
 * Exit 1 when any check fails (warnings don't fail).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { AGENT_FILES, ROOT, SKILL_DIR, UPDATE_HINT, journeyPaths, createsAccounts, fileHash, dataPrefix, listStories, loadConfig, loadEnv, main, parseArgs, rel, resolveUrl, validateConfig, type HeldoutConfig } from './config';
import { appRootOf, describeCounts, discoverApp } from './detect';
import { createTracker } from './jira';
import { safeToScrub } from './redact';
import { checkAccountRecipe, envNamesIn } from './accounts-recipe';
import { loadVaultSecrets, loadedVaultSecrets, vaultRefsIn, vaultSettings } from './secrets';
import { allJourneys, duplicateJourneys, journeyFiles, lintJourneys, readRegistry, syncRegistry } from './journeys-store';
import { CLAUDE_MCP_FILE, MCP_FILE } from './mcp-config';

type Level = 'ok' | 'warn' | 'fail';
const results: { level: Level; area: string; msg: string; fix?: string }[] = [];
const check = (level: Level, area: string, msg: string, fix?: string) => results.push({ level, area, msg, fix });
const H = 'npm run heldout --';

async function reachable(url: string): Promise<{ ok: boolean; detail: string }> {
  const t = Date.now();
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15_000), redirect: 'follow' });
    const ms = Date.now() - t;
    // A 4xx still proves the server is up and answering (APIs often have nothing at their root).
    return { ok: r.status < 500, detail: r.status < 400 ? `${r.status} in ${ms} ms` : `reachable in ${ms} ms (the server answers ${r.status} at this address; APIs often have nothing at their root)` };
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
    const s = JSON.parse(fs.readFileSync(sourceFile, 'utf8')) as { remote?: string; commit?: string; installedAt: string };
    check('ok', 'skill', `installed ${s.installedAt.slice(0, 10)} from ${s.remote ?? 'a local copy of the skill'}${s.commit ? ` @ ${s.commit}` : ''} — to update: ${UPDATE_HINT}`);
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
  for (const file of ['playwright.config.ts', 'heldout-support/fixtures.ts', 'tsconfig.json']) {
    if (fs.existsSync(path.join(ROOT, file))) check('ok', 'files', file);
    else check('fail', 'files', `${file} is missing`, UPDATE_HINT);
  }
  // Files init copied from the skill repository: one changed here is kept on updates, so it may fall behind.
  const installed = fs.existsSync(sourceFile) ? (JSON.parse(fs.readFileSync(sourceFile, 'utf8')) as { files?: Record<string, string> }).files ?? {} : {};
  for (const [file, hash] of Object.entries(installed)) {
    if (fs.existsSync(path.join(ROOT, file)) && fileHash(path.join(ROOT, file)) !== hash) {
      check('warn', 'files', `${file} was changed in this project, so skill updates keep it as it is`, 'compare it with the same file in the skill repository');
    }
  }
  if (!fs.existsSync(path.join(ROOT, '.env'))) check('warn', 'files', '.env not found (secrets for tests go there)', `${H} init`);
  const gi = fs.existsSync(path.join(ROOT, '.gitignore')) ? fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8') : '';
  if (!/^\.env\s*$/m.test(gi)) check('warn', 'files', '.env is not git-ignored — secrets could be committed', `${H} init   (adds the .gitignore entries)`);
  for (const target of AGENT_FILES) {
    const what = target.startsWith('.claude/') ? 'Claude Code bridge' : 'phase subagent';
    if (fs.existsSync(path.join(ROOT, target))) check('ok', 'subagents', target);
    else check('warn', 'subagents', `${target} is missing (${what})`, `${UPDATE_HINT}; then restart your agent app`);
  }
  // Playwright MCP (tier 2): .vscode/mcp.json for GitHub Copilot, the root .mcp.json for Claude Code.
  for (const [file, app, fix] of [[MCP_FILE, 'GitHub Copilot', UPDATE_HINT], [CLAUDE_MCP_FILE, 'Claude Code', `${H} init`]] as const) {
    const at = path.join(ROOT, file);
    if (fs.existsSync(at) && /playwright\/mcp/.test(fs.readFileSync(at, 'utf8'))) check('ok', 'browser tiers', `Playwright MCP configured for ${app} (${file}) — tier 2 after restarting it`);
    else check('warn', 'browser tiers', `Playwright MCP not configured for ${app} (${file}) — hardening there falls back to heldout mcp-probe and the bundled inspector`, fix);
  }

  /**
   * Secret values from .env that appear in files git would commit (tracked, or untracked and not ignored). Values a
   * story itself publishes (a sandbox's documented demo password, found under output/<profile>/<KEY>/requirement/) are
   * not secrets and are skipped, as are weak values (plain words) that can't be told apart from ordinary text.
   */
  function committableLeaks(outDir: string): Map<string, string[]> {
    const git = spawnSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (git.status !== 0) return new Map();
    const files = git.stdout.split('\0').filter(Boolean);
    const read = (f: string) => { try { return fs.statSync(path.join(ROOT, f)).size < 5_000_000 ? fs.readFileSync(path.join(ROOT, f), 'utf8') : ''; } catch { return ''; } };
    const published = files.filter((f) => f.startsWith(`${rel(outDir)}/`) && f.split('/')[3] === 'requirement').map(read).join('\n');
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

  // ---- secrets referenced by the stories ----------------------------------------------------------
  if (cfg) {
    const outDir = path.resolve(ROOT, cfg.outputDir);
    const testDataFiles = listStories(cfg).map((s) => ({ key: s.key, file: path.join(s.dir, 'test-data.json') })).filter((s) => fs.existsSync(s.file));
    const missing = new Map<string, string[]>();
    for (const { key, file } of testDataFiles) {
      for (const m of fs.readFileSync(file, 'utf8').matchAll(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g)) if (!process.env[m[1]]) missing.set(m[1], [...(missing.get(m[1]) ?? []), key]);
    }
    // The accounts recipes' secrets too (seed.account() reads them in every test that makes an account).
    for (const [id, prof] of Object.entries(cfg.auts)) for (const n of envNamesIn(prof.accounts)) if (!process.env[n]) missing.set(n, [...(missing.get(n) ?? []), `auts.${id}.accounts`]);
    // An existing account's password is typed in (hidden); one for accounts the tests create can be generated.
    const existingNames = new Set(Object.values(cfg.auts).flatMap((prof) => envNamesIn(prof.accounts?.existing)));
    for (const [name, keys] of missing) check('fail', 'secrets', `${name} is referenced by ${[...new Set(keys)].join(', ')} but not set`,
      existingNames.has(name) ? `in a terminal of your own: ${H} secret ${name} --ask   (or set it as an environment / CI variable)` : `${H} secret ${name} --generate   (accounts the tests create), or ${H} secret ${name} --ask (an existing account)`);
    if (!missing.size) check('ok', 'secrets', 'every ${env:…} referenced by test data and accounts is set');

    // HashiCorp Vault: every ${vault:…} reference in test data and accounts recipes resolves.
    const testData = testDataFiles.map((s) => fs.readFileSync(s.file, 'utf8'));
    const vaultUsers = [...testData, ...Object.values(cfg.auts).map((prof) => prof.accounts)];
    const refs = vaultUsers.flatMap(vaultRefsIn);
    if (refs.length && flags.offline) check('warn', 'vault', `${refs.length} ${'$'}{vault:…} reference(s) not checked (--offline)`);
    else if (refs.length) {
      const vs = vaultSettings();
      const problems = await loadVaultSecrets(vaultUsers);
      if (problems.length) for (const pr of problems) check('fail', 'vault', pr, !vs.addr ? 'add VAULT_ADDR=https://… to .env' : !vs.tokenSource ? 'run `vault login` once (the token is picked up), or set VAULT_TOKEN, or VAULT_ROLE_ID + VAULT_SECRET_ID for AppRole' : 'check the path and field with: vault kv get <path>');
      else check('ok', 'vault', `${refs.length} reference(s) read from ${vs.addr}${vs.namespace ? ` (namespace ${vs.namespace})` : ''} with the token from ${vs.tokenSource}`);
    }
    const leaks = committableLeaks(outDir);
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
    // A base URL that is one page of the app ("…/books") makes every path resolve under that page.
    for (const id of Object.keys(testIds)) {
      const base = cfg.auts[id].baseURL;
      const root = await appRootOf(base);
      if (root !== base && root !== `${base}/`) check('warn', `AUT ${id}`, `baseURL ${base} is a page of the app, not its root: paths such as /login would resolve under it`, `set auts.${id}.baseURL (and apiBaseURL, if the same) to "${root}" in heldout.config.json`);
    }
    // Accounts recipes, run live (create → token → delete) so a broken one never surfaces as BLOCKED scenarios.
    for (const id of ids) {
      const p = cfg.auts[id];
      if (!p?.accounts || envNamesIn(p.accounts).some((n) => !process.env[n])) continue;
      try {
        const steps = await checkAccountRecipe(p.accounts, p.apiBaseURL ?? p.baseURL, { profile: id, dataPrefix: dataPrefix(p), ui: { baseURL: p.baseURL, blockHosts: p.blockHosts, testIdAttribute: p.testIdAttribute, overlays: p.overlays } });
        const bad = steps.find((x) => !x.ok);
        if (bad) check('fail', `AUT ${id}`, `accounts recipe: ${bad.step} → ${bad.detail}`, `fix auts.${id}.accounts in heldout.config.json (try the calls with heldout api-probe --chain)`);
        else if (!createsAccounts(p.accounts)) check('ok', `AUT ${id}`, `${p.accounts.existing?.length ?? 0} existing test account(s) ${p.accounts.token ? `sign in over the API${p.accounts.lookup ? ' and resolve their ids' : ''}` : p.accounts.signIn ? 'set; the first signs in through the UI' : 'set; how to sign in is saved while hardening the first story that signs in'}; runs use at most ${Math.max(1, Math.floor((p.accounts.existing?.length ?? 0) / Math.max(1, p.accounts.perTest ?? 1)))} parallel workers`);
        else check('ok', `AUT ${id}`, `accounts recipe works: ${steps.map((x) => x.step.split(' ')[0]).join(' → ')}`);
      } catch (e) { check('fail', `AUT ${id}`, `accounts recipe: ${(e as Error).message}`, 'check the recipe paths and the API URL'); }
    }
    if (cfg.jira.mode === 'datacenter') {
      if (!process.env.JIRA_PAT) check('fail', 'Jira', 'JIRA_PAT is not set', `${H} secret JIRA_PAT --ask   (a personal access token: your Jira profile → Personal Access Tokens)`);
      if (!process.env.CONFLUENCE_PAT) check('ok', 'Jira', 'linked Confluence pages are read with JIRA_PAT (set CONFLUENCE_PAT if your Confluence needs its own token)');
      if (process.env.JIRA_PAT) {
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
        } catch (e) { check('fail', 'Jira', (e as Error).message.slice(0, 200), 'check JIRA_BASE_URL and JIRA_PAT'); }
      }
    } else {
      check('ok', 'Jira', `mock mode — stories live in ${cfg.jira.mockRoot}/ (create one: ${H} new ABC-1 --from story.md)`);
    }
  }

  // ---- journeys (journeys/fixtures/<domain>.ts, journeys/registry.yml) ----------------------------
  if (cfg) {
    const ids = typeof flags.aut === 'string' ? [flags.aut] : Object.keys(cfg.auts);
    for (const id of ids.filter((x) => cfg!.auts[x])) {
      const jp = journeyPaths(cfg, id);
      const files = journeyFiles(cfg, id);
      const aut = ids.length > 1 ? `${id}: ` : '';
      if (!files.length) { check('ok', 'journeys', `${aut}no journeys yet — the first story's tests start them in ${rel(jp.fixtures)}/<domain>.ts`); continue; }
      const journeys = allJourneys(cfg, id);
      const findings = lintJourneys(files, undefined, jp.base);
      for (const e of findings.filter((f) => f.level === 'error')) check('fail', 'journeys', e.message, 'move what a story expects into its test; journeys hold HOW only');
      const layout = findings.filter((f) => f.code === 'layout').length;
      const dups = duplicateJourneys(journeys).length;
      if (layout || dups) check('warn', 'journeys', `${aut}${layout ? `${layout} file(s) outside ${rel(jp.fixtures)}/<domain>.ts` : ''}${layout && dups ? '; ' : ''}${dups ? `${dups} group(s) of possible duplicate journeys` : ''}`, `${H} journeys${ids.length > 1 ? ` --aut ${id}` : ''} --check`);
      let registry;
      try { registry = readRegistry(cfg, id); } catch (e) { check('fail', 'journeys', (e as Error).message, `${H} journeys${ids.length > 1 ? ` --aut ${id}` : ''} --resolve`); continue; }
      const s = syncRegistry(registry, journeys);
      const counts = (st: string) => Object.values(s.registry.journeys).filter((e) => e.status === st).length;
      check('ok', 'journeys', `${aut}${journeys.length} journey(s) in ${files.length} file(s); ${rel(jp.registry)}: ${counts('proven')} proven, ${counts('changed')} changed since proven, ${counts('stale')} stale, ${counts('unproven')} not proven yet`);
      if (s.added.length || s.removed.length || s.updated.length) check('warn', 'journeys', `${aut}${rel(jp.registry)} is behind the code (${s.added.length} new, ${s.updated.length} changed, ${s.removed.length} gone; a story's harvest records them after its verdict)`, `${H} journeys${ids.length > 1 ? ` --aut ${id}` : ''} --sync   (to bring it in line now)`);
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
  console.log(`\n${fails ? '✖' : '✔'} ${fails} problem(s), ${warns} warning(s).${fails ? '' : ' Ready — ask Opus: "Run a held-out evaluation of <KEY>".'}`);
  if (fails) process.exit(1);
});

function pathToFile(p: string): string { return `file:///${p.replace(/\\/g, '/').replace(/^\//, '')}`; }
