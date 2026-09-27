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
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT, SKILL_DIR, loadConfig, loadEnv, main, parseArgs, rel, resolveUrl, validateConfig, type HeldoutConfig } from './lib/config';
import { describeCounts, detectTestIdAttribute } from './lib/detect';
import { createTracker } from './lib/jira';

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

  // ---- secrets referenced by evaluations ----------------------------------------------------------
  if (cfg) {
    const evalDir = path.join(ROOT, cfg.evaluationsDir);
    const missing = new Map<string, string[]>();
    if (fs.existsSync(evalDir)) for (const key of fs.readdirSync(evalDir)) {
      const td = path.join(evalDir, key, 'test-data.json');
      if (!fs.existsSync(td)) continue;
      for (const m of fs.readFileSync(td, 'utf8').matchAll(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g)) if (!process.env[m[1]]) missing.set(m[1], [...(missing.get(m[1]) ?? []), key]);
    }
    for (const [name, keys] of missing) check('fail', 'secrets', `${name} is referenced by ${[...new Set(keys)].join(', ')} but not set`, `add ${name}=… to .env`);
    if (!missing.size) check('ok', 'secrets', 'every ${env:…} referenced by test data is set');
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
    // Rendering each app is slow, so the test-id attribute is checked for one profile (a single-app project or --aut).
    const testIds = ids.length === 1 && cfg.auts[ids[0]] ? { [ids[0]]: await detectTestIdAttribute(cfg.auts[ids[0]].baseURL) } : {};
    ids.forEach((id, i) => {
      for (const r of perAut[i]) check(r.ok ? 'ok' : 'fail', `AUT ${id}`, `${r.url} → ${r.detail}`, r.ok ? undefined : 'check the URL in heldout.config.json, VPN/proxy, or whether the environment is up');
      const d = testIds[id];
      const configured = cfg!.auts[id]?.testIdAttribute ?? 'data-testid';
      if (!d || d.via === 'none') return;
      if (!d.attribute) check('ok', `AUT ${id}`, 'no test-id attributes on the start page — tests will locate by role and label');
      else if (d.attribute === configured) check('ok', `AUT ${id}`, `test-id attribute ${configured} is used by the app (${describeCounts(d)})`);
      else check('warn', `AUT ${id}`, `testIdAttribute is "${configured}" but the app renders ${describeCounts(d)}`, `set auts.${id}.testIdAttribute to "${d.attribute}" in heldout.config.json`);
    });
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
