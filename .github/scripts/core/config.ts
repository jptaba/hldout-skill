/**
 * Loading and checking heldout.config.json, resolving the AUT profile of a command, and where the skill itself is.
 * Everything AUT-specific lives in the project's heldout.config.json / .env — never in the skill.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, rel } from './files';
import { PHASE_FOLDERS, SCRATCH_DIR } from './paths';
import { JIRA_MODES, dataPrefix, type HeldoutConfig, type JiraMode } from './profile';
import { ROLES } from './roles';

/** The skill's scripts (.github/scripts) and the skill itself (.github/skills/heldout-evaluator: SKILL.md, references). */
export const SCRIPTS_DIR = path.resolve(import.meta.dirname, '..');
export const SKILL_DIR = path.resolve(SCRIPTS_DIR, '..', 'skills', 'heldout-evaluator');
/** How a project updates the skill: setup pulls the clone, then updates the project it is run in. */
export const UPDATE_HINT = 'in this folder, run setup from your clone of the skill — <clone>/setup.ps1 (PowerShell) or <clone>/setup.sh (bash, zsh)';
/** The JSON schema of heldout.config.json (its $schema, for editor help). */
export const CONFIG_SCHEMA = path.join(SCRIPTS_DIR, 'heldout.config.schema.json');

/**
 * The subagents, one per phase that needs a model (separate contexts by design: the reviewer never sees the builder's
 * reasoning, the test author never sees the application, the triager never wrote the tests), as GitHub Copilot custom
 * agents, the one source of their instructions, and the Claude Code bridges to them and to the skill (Claude Code reads
 * only .claude/). The main agent runs the scripts between them. Paths are the same in the skill repository and in a
 * project.
 */
const SUBAGENTS = Object.keys(ROLES);
export const AGENT_FILES: string[] = [
  ...SUBAGENTS.flatMap((a) => [`.github/agents/${a}.agent.md`, `.claude/agents/${a}.md`]),
  '.claude/skills/heldout-evaluator/SKILL.md',
];

/** What a project keeps out of git: secrets, the scratch area and bulky local run artifacts (the record stays tracked). */
export const GITIGNORE = ['.env', 'node_modules/', 'test-results/', 'playwright-report/', `${SCRATCH_DIR}/`, `output/*/*/${PHASE_FOLDERS[4]}/*/html/`, `output/*/*/${PHASE_FOLDERS[4]}/*/artifacts/`, '*.trace.zip', '.playwright-mcp/', '.claude/settings.local.json'];
/** How git merges a story's append-only logs (history, probes): two branches that each added lines keep both. */
export const GITATTRIBUTES = ['output/**/*.jsonl merge=union'];

/** Add the lines a project's dot-file doesn't have yet (init, and update when a version adds one). */
function ensureLines(name: string, wanted: string[], why: string, say: (mark: string, msg: string) => void): void {
  const file = path.join(ROOT, name);
  const have = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const lines = new Set(have.split(/\r?\n/).map((l) => l.trim()));
  const add = wanted.filter((l) => !lines.has(l) && !lines.has(l.replace(/\/$/, '')));
  if (!add.length) { say('•', `keep    ${name}`); return; }
  fs.writeFileSync(file, `${have}${have && !have.endsWith('\n') ? '\n' : ''}\n# held-out evaluator (${why})\n${add.join('\n')}\n`);
  say('✔', `${have ? 'updated' : 'created'} ${name} (+ ${add.length} entries)`);
}
export const ensureGitignore = (say: (mark: string, msg: string) => void) => ensureLines('.gitignore', GITIGNORE, 'secrets, scratch and bulky local artifacts; the record stays tracked', say);
export const ensureGitattributes = (say: (mark: string, msg: string) => void) => ensureLines('.gitattributes', GITATTRIBUTES, 'append-only story logs merge by keeping both sides', say);

/** Minimal .env loader (no dependency). Existing process.env values win. */
export function loadEnv(file = path.join(ROOT, '.env')): void {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

/**
 * Load heldout.config.json and resolve the AUT profile for this command.
 * Profile precedence: opts.aut (--aut) > HELDOUT_AUT env > the profile folder the story is in (output/<profile>/<key>/)
 * > defaultAut.
 * AUT_BASE_URL / AUT_API_BASE_URL env vars override the resolved profile's URLs (e.g. CI → staging).
 */
export function loadConfig(opts: { key?: string; aut?: string } = {}): HeldoutConfig {
  loadEnv();
  const file = path.join(ROOT, 'heldout.config.json');
  if (!fs.existsSync(file)) {
    throw new Error(`heldout.config.json not found in ${ROOT}. Run: npx tsx ${rel(SCRIPTS_DIR)}/heldout.ts init --base-url <url>`);
  }
  let raw: Partial<HeldoutConfig>;
  try { raw = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { throw new Error(`heldout.config.json is not valid JSON: ${(e as Error).message}`); }
  const issues = validateConfig(raw);
  if (issues.length) throw new Error(`heldout.config.json has ${issues.length} problem(s):\n${issues.map((i) => `  - ${i}`).join('\n')}\nRun the doctor for details: npx tsx ${rel(SCRIPTS_DIR)}/heldout.ts doctor`);
  const cfg = raw as HeldoutConfig;
  cfg.jira ??= { mode: 'mock', mockRoot: 'mock-jira' };
  cfg.run ??= { retries: 1 };
  cfg.defaultAut ??= Object.keys(cfg.auts)[0];
  cfg.outputDir ??= 'output';
  cfg.journeysDir ??= 'journeys';

  const bound = opts.key && !opts.aut && !process.env.HELDOUT_AUT ? boundProfile(cfg, opts.key) : undefined;
  const autId = opts.aut ?? process.env.HELDOUT_AUT ?? bound ?? cfg.defaultAut;
  const profile = cfg.auts[autId];
  if (!profile) throw new Error(`AUT profile "${autId}" not found in heldout.config.json (have: ${Object.keys(cfg.auts).join(', ')})`);
  cfg.autId = autId;
  cfg.aut = { ...profile };
  if (process.env.AUT_BASE_URL) cfg.aut.baseURL = process.env.AUT_BASE_URL;
  if (process.env.AUT_API_BASE_URL) cfg.aut.apiBaseURL = process.env.AUT_API_BASE_URL;
  cfg.aut.apiBaseURL ??= cfg.aut.baseURL;

  if (process.env.JIRA_MODE) cfg.jira.mode = process.env.JIRA_MODE as JiraMode;
  if (process.env.JIRA_BASE_URL) cfg.jira.baseUrl = process.env.JIRA_BASE_URL;
  cfg.jira.mockRoot ??= 'mock-jira';
  cfg.jira.verdictLabelPrefix ??= 'heldout-';
  // The prefix of every name the tests and probes make (${text:N} in a probe starts with it).
  process.env.AUT_DATA_PREFIX ??= dataPrefix(cfg.aut);
  return cfg;
}

/**
 * Structural validation with messages a new user can act on (the JSON schema beside the scripts gives the same
 * rules to editors). Returns a list of problems; empty = valid.
 */
export function validateConfig(raw: unknown): string[] {
  const out: string[] = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return ['the file must contain a JSON object'];
  const c = raw as Record<string, unknown>;
  const isUrl = (v: unknown) => typeof v === 'string' && /^https?:\/\/[^\s/]+/.test(v);
  const auts = c.auts as Record<string, unknown> | undefined;
  if (!auts || typeof auts !== 'object' || !Object.keys(auts).length) out.push('"auts" must define at least one AUT profile, e.g. {"app": {"name": "My app", "baseURL": "https://…"}}');
  else for (const [id, p] of Object.entries(auts)) {
    if (!/^[A-Za-z0-9][\w.-]*$/.test(id)) out.push(`auts.${id}: profile ids may contain letters, digits, ".", "_" and "-"`);
    if (!p || typeof p !== 'object') { out.push(`auts.${id} must be an object`); continue; }
    const prof = p as Record<string, unknown>;
    if (!isUrl(prof.baseURL)) out.push(`auts.${id}.baseURL must be an http(s) URL (got ${JSON.stringify(prof.baseURL)})`);
    if (prof.apiBaseURL !== undefined && !isUrl(prof.apiBaseURL)) out.push(`auts.${id}.apiBaseURL must be an http(s) URL (got ${JSON.stringify(prof.apiBaseURL)})`);
    if (prof.overlays !== undefined && (!Array.isArray(prof.overlays) || prof.overlays.some((h) => typeof h !== 'string' || !h.trim()))) out.push(`auts.${id}.overlays must be a list of page-locator expressions, e.g. ["getByRole('button', { name: 'Accept cookies' })"]`);
    if (prof.blockHosts !== undefined && (!Array.isArray(prof.blockHosts) || prof.blockHosts.some((h) => typeof h !== 'string'))) out.push(`auts.${id}.blockHosts must be a list of host names, e.g. ["doubleclick.net"]`);
    const acc = prof.accounts as Record<string, Record<string, unknown> | string | undefined> | undefined;
    if (acc !== undefined) {
      const call = (k: string) => typeof acc[k] === 'object' && typeof (acc[k] as Record<string, unknown>).method === 'string' && typeof (acc[k] as Record<string, unknown>).path === 'string';
      const existing = acc.existing as unknown;
      if (acc.create === undefined && acc.signUp === undefined && existing === undefined) out.push(`auts.${id}.accounts needs "create" (tests make their accounts over the API), "signUp" (on the sign-up page) or "existing" (accounts that already exist)`);
      if (acc.create !== undefined && (!call('create') || typeof (acc.create as Record<string, unknown>).id !== 'string')) out.push(`auts.${id}.accounts.create needs method, path and id (the dotted path of the new account's id in the response)`);
      if ((acc.create !== undefined || acc.signUp !== undefined) && typeof acc.password !== 'string') out.push(`auts.${id}.accounts.password is required when tests make accounts (e.g. "\${env:APP_USER_PASSWORD}")`);
      for (const k of ['signIn', 'signUp']) {
        const form = acc[k] as Record<string, unknown> | undefined;
        if (form !== undefined && (typeof form !== 'object' || typeof form.path !== 'string' || !Array.isArray(form.steps))) out.push(`auts.${id}.accounts.${k} needs path and steps`);
      }
      if (existing !== undefined) {
        const list = Array.isArray(existing) ? existing as Record<string, unknown>[] : [];
        if (!list.length) out.push(`auts.${id}.accounts.existing must be a list of { username, password }`);
        list.forEach((a, i) => {
          if (a?.role !== undefined && !(typeof a.role === 'string' && /^[a-z][a-z0-9-]*$/.test(a.role))) out.push(`auts.${id}.accounts.existing[${i}].role must be a lower-case name such as "admin" or "customer"`);
          if (typeof a?.username !== 'string' || typeof a?.password !== 'string') out.push(`auts.${id}.accounts.existing[${i}] needs a username and a password`);
          // This file is committed: a password must be a reference to .env / the environment or to Vault.
          else if (!/^\$\{(env|vault):[^}]+\}$/.test(a.password)) out.push(`auts.${id}.accounts.existing[${i}].password must be "\${env:NAME}" or "\${vault:path#field}", never the password itself (heldout.config.json is committed)`);
        });
      }
      if (typeof acc.password === 'string' && !/^\$\{(env|vault):[^}]+\}$/.test(acc.password)) out.push(`auts.${id}.accounts.password must be "\${env:NAME}" or "\${vault:path#field}", never the password itself`);
      if (acc.token !== undefined && (!call('token') || typeof (acc.token as Record<string, unknown>).token !== 'string')) out.push(`auts.${id}.accounts.token needs method, path and token (the dotted path of the token in the response)`);
      if (acc.lookup !== undefined && (!call('lookup') || typeof (acc.lookup as Record<string, unknown>).id !== 'string')) out.push(`auts.${id}.accounts.lookup needs method, path and id (the dotted path of the account id in the answer)`);
      if (acc.delete !== undefined && !call('delete')) out.push(`auts.${id}.accounts.delete needs method and path`);
      if (acc.before !== undefined) {
        const list = Array.isArray(acc.before) ? acc.before as Record<string, unknown>[] : [];
        if (!list.length) out.push(`auts.${id}.accounts.before must be a list of calls`);
        list.forEach((b, i) => {
          if (typeof b?.method !== 'string' || typeof b?.path !== 'string' || !b.save || typeof b.save !== 'object') out.push(`auts.${id}.accounts.before[${i}] needs method, path and save ({ "name": "dotted.path" })`);
        });
      }
    }
    if (prof.dataPrefix !== undefined && !(typeof prof.dataPrefix === 'string' && /^[A-Za-z][A-Za-z0-9._-]{0,15}$/.test(prof.dataPrefix))) out.push(`auts.${id}.dataPrefix must start with a letter and use at most 16 letters, digits, dots, dashes or underscores`);
    if (prof.minTestIntervalMs !== undefined && !(Number.isInteger(prof.minTestIntervalMs) && (prof.minTestIntervalMs as number) >= 0)) out.push(`auts.${id}.minTestIntervalMs must be a whole number of milliseconds`);
    if (prof.maxWorkers !== undefined && !(Number.isInteger(prof.maxWorkers) && (prof.maxWorkers as number) >= 1)) out.push(`auts.${id}.maxWorkers must be a whole number ≥ 1`);
    if (prof.healthcheck !== undefined && (!Array.isArray(prof.healthcheck) || prof.healthcheck.some((h) => typeof h !== 'string'))) out.push(`auts.${id}.healthcheck must be a list of paths, e.g. ["/", "api:/health"]`);
    else for (const h of (prof.healthcheck as string[] | undefined) ?? []) {
      if (!/^(\/|api:\/|https?:\/\/)/.test(h) && h !== '') out.push(`auts.${id}.healthcheck entry ${JSON.stringify(h)} must start with "/", "api:/" or http(s):// (a Windows path here usually means Git Bash rewrote the argument)`);
    }
  }
  // Journeys are one application's: two applications in one folder would mix their journeys and registries.
  if (auts && typeof auts === 'object' && Object.keys(auts).length > 1) {
    const dirs = new Map<string, string[]>();
    for (const [id, p] of Object.entries(auts)) {
      const d = path.normalize(String((p as Record<string, unknown>)?.journeysDir ?? c.journeysDir ?? 'journeys'));
      dirs.set(d, [...(dirs.get(d) ?? []), id]);
    }
    for (const [d, ids] of dirs) if (ids.length > 1) out.push(`auts ${ids.join(', ')} share the journeys folder ${d} — give each application its own: "journeysDir": "journeys-<profile>" in its profile`);
  }
  if (c.defaultAut !== undefined && auts && !(String(c.defaultAut) in auts)) out.push(`defaultAut "${String(c.defaultAut)}" is not one of the profiles (${Object.keys(auts).join(', ')})`);
  const j = c.jira as Record<string, unknown> | undefined;
  if (j !== undefined) {
    if (j.mode !== undefined && !(JIRA_MODES as readonly string[]).includes(String(j.mode))) out.push(`jira.mode must be ${JIRA_MODES.map((m) => `"${m}"`).join(', ')} (got ${JSON.stringify(j.mode)})`);
    if (j.mode !== undefined && j.mode !== 'mock' && !isUrl(j.baseUrl) && !process.env.JIRA_BASE_URL) out.push(`jira.mode is "${j.mode}" but jira.baseUrl (or JIRA_BASE_URL) is not an https URL`);
    if (j.publish !== undefined && j.publish !== 'auto' && j.publish !== 'manual') out.push(`jira.publish must be "auto" or "manual" (got ${JSON.stringify(j.publish)})`);
    if (j.acceptanceCriteriaField &&!/^customfield_\d+$/.test(String(j.acceptanceCriteriaField))) out.push(`jira.acceptanceCriteriaField looks wrong (${JSON.stringify(j.acceptanceCriteriaField)}); expected "customfield_12345" — list fields with: heldout doctor --jira`);
  }
  const r = c.run as Record<string, unknown> | undefined;
  if (r) for (const k of ['retries', 'workers', 'actionTimeoutMs', 'expectTimeoutMs', 'testTimeoutMs']) {
    if (r[k] !== undefined && (typeof r[k] !== 'number' || (r[k] as number) < 0)) out.push(`run.${k} must be a non-negative number`);
  }
  return out;
}

/**
 * The profile whose output folder already holds the story (output/<profile>/<KEY>/), so later commands need no --aut.
 * A story fetched for two applications needs --aut to say which one.
 */
export function boundProfile(cfg: Pick<HeldoutConfig, 'outputDir' | 'auts'>, key: string): string | undefined {
  const out = path.resolve(ROOT, cfg.outputDir);
  if (!fs.existsSync(out)) return undefined;
  const found = fs.readdirSync(out, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(out, d.name, key)))
    .map((d) => d.name);
  if (found.length > 1) throw new Error(`${key} is in more than one profile folder (${found.map((p) => `${cfg.outputDir}/${p}/${key}`).join(', ')}) — say which with --aut <profile>`);
  return found[0];
}

export function assertIssueKey(key: string | undefined): string {
  if (!key || !/^[A-Z][A-Z0-9_]+-\d+$/.test(key)) {
    throw new Error(`A Jira issue key like ABC-123 is required (got: ${key ?? 'nothing'})`);
  }
  return key;
}
