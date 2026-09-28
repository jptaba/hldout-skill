/**
 * Shared configuration + path helpers for the held-out evaluator scripts.
 * Everything AUT-specific lives in the project's heldout.config.json / .env — never in the skill.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface AutProfile {
  name: string;
  /** Web UI origin (Playwright baseURL). */
  baseURL: string;
  /** API origin for the `api` fixture and api-probe.ts; defaults to baseURL. */
  apiBaseURL?: string;
  /** Attribute used by getByTestId() — e.g. data-testid, data-test, data-qa. */
  testIdAttribute?: string;
  /** Paths checked before a run: UI paths resolve against baseURL, "api:" paths against apiBaseURL. */
  healthcheck?: string[];
  /** Third-party hosts (ads, analytics, consent) the browser blocks: not part of the AUT, and a source of flakiness. */
  blockHosts?: string[];
  /** Banners and dialogs that can cover the page at any time (cookie consent, a welcome dialog, a newsletter pop-up): a
   *  page-locator expression of the button that closes each. Tests, the UI sign-in and heldout inspect click it
   *  whenever it appears (Playwright's addLocatorHandler). */
  overlays?: string[];
  /** Most parallel workers the host tolerates (shared sandboxes behind rate limits / bot protection); caps --workers. */
  maxWorkers?: number;
  /** Minimum gap between test starts (ms), across workers: for hosts that ban bursts of traffic. */
  minTestIntervalMs?: number;
  /** How to make a test account on this AUT (mechanics, found while hardening the first story): seed.account() and signIn(). */
  accounts?: AccountRecipe;
  notes?: string;
}

/** An HTTP call of an account recipe. Strings may use ${username}, ${password}, ${id}, ${token}, ${env:NAME}. */
export interface RecipeCall { method: string; path: string; body?: unknown; form?: Record<string, string> }

/** An account that already exists in the AUT. Secrets as ${env:NAME} or ${vault:path#field}, never literal. */
export interface ExistingAccount { username: string; password: string; id?: string }

/**
 * How tests get accounts on this AUT. Either the tests create them (`create`, with `delete` when the application
 * allows it), or they use accounts that already exist (`existing`), shared out among parallel workers.
 */
export interface AccountRecipe {
  /** Password for the accounts the tests create, normally "${env:NAME}" (a strong value, so artifacts can be scrubbed). */
  password?: string;
  /** User-name template for created accounts; ${uid} is unique per account. Default "qa-${uid}". */
  username?: string;
  /** Calls made first, each time an account is made or signed in (a CSRF token, a valid security-question id…): `save`
   *  maps a name to the dotted path of a value in the answer, usable as ${name} in the calls below. */
  before?: (RecipeCall & { save: Record<string, string> })[];
  /** Creates the account; `id` (and optionally `token`) are where the answer carries the new id (and a token). */
  create?: RecipeCall & { id: string; token?: string };
  /** Accounts that already exist (someone made them; the tests never create or delete them). */
  existing?: ExistingAccount[];
  /** The most existing accounts one test uses at once (default 1): runs use at most existing.length / perTest workers. */
  perTest?: number;
  /** Signs in over the API; `token` is the dotted path of the token in the response body, `id` optionally of the account id. */
  token?: RecipeCall & { token: string; id?: string };
  /** Reads the account id after signing in (a "who am I" call, with the auth header); `id` is where the answer carries it. */
  lookup?: RecipeCall & { id: string };
  /** Header that authenticates API calls. Default "Authorization: Bearer ${token}". */
  authHeader?: string;
  /** Deletes the account after the test (a 401/403 answer gets a fresh token and one retry). */
  delete?: RecipeCall;
  /** UI sign-in: open `path`, run the steps (fill/click with a page-locator expression), then wait for `done`
   *  ("url:/profile" or a locator expression). */
  signIn?: { path: string; steps: { fill?: string; click?: string; value?: string }[]; done?: string };
}

export interface HeldoutConfig {
  /** Named AUT profiles. A story is bound to one via evaluations/<KEY>/evaluation.json. */
  auts: Record<string, AutProfile>;
  defaultAut: string;
  /** The profile resolved for the current command (see loadConfig). */
  aut: AutProfile;
  autId: string;
  jira: {
    mode: 'mock' | 'cloud';
    /** Folder that simulates a Jira instance when mode=mock. */
    mockRoot: string;
    /** https://<site>.atlassian.net — used for REST calls (cloud) and for links / outbox logs (mock). */
    baseUrl?: string;
    /** Optional custom field that stores acceptance criteria, e.g. customfield_10035. */
    acceptanceCriteriaField?: string;
    /** Labels written on publish: <prefix>pass | <prefix>fail | ... */
    verdictLabelPrefix?: string;
  };
  evaluationsDir: string;
  run: {
    retries: number;
    workers?: number;
    headless?: boolean;
    actionTimeoutMs?: number;
    expectTimeoutMs?: number;
    testTimeoutMs?: number;
  };
}

export const ROOT = process.cwd();
export const SKILL_DIR = path.resolve(import.meta.dirname, '..', '..');

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
 * Profile precedence: opts.aut (--aut) > HELDOUT_AUT env > evaluations/<key>/evaluation.json > defaultAut.
 * AUT_BASE_URL / AUT_API_BASE_URL env vars override the resolved profile's URLs (e.g. CI → staging).
 */
export function loadConfig(opts: { key?: string; aut?: string } = {}): HeldoutConfig {
  loadEnv();
  const file = path.join(ROOT, 'heldout.config.json');
  if (!fs.existsSync(file)) {
    throw new Error(`heldout.config.json not found in ${ROOT}. Run: npx tsx ${rel(SKILL_DIR)}/scripts/heldout.ts init --base-url <url>`);
  }
  let raw: Partial<HeldoutConfig>;
  try { raw = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { throw new Error(`heldout.config.json is not valid JSON: ${(e as Error).message}`); }
  const issues = validateConfig(raw);
  if (issues.length) throw new Error(`heldout.config.json has ${issues.length} problem(s):\n${issues.map((i) => `  - ${i}`).join('\n')}\nRun the doctor for details: npx tsx ${rel(SKILL_DIR)}/scripts/heldout.ts doctor`);
  const cfg = raw as HeldoutConfig;
  cfg.jira ??= { mode: 'mock', mockRoot: 'mock-jira' };
  cfg.run ??= { retries: 1 };
  cfg.defaultAut ??= Object.keys(cfg.auts)[0];
  cfg.evaluationsDir ??= 'evaluations';

  const bound = opts.key ? readEvaluationMeta(cfg, opts.key).aut : undefined;
  const autId = opts.aut ?? process.env.HELDOUT_AUT ?? bound ?? cfg.defaultAut;
  const profile = cfg.auts[autId];
  if (!profile) throw new Error(`AUT profile "${autId}" not found in heldout.config.json (have: ${Object.keys(cfg.auts).join(', ')})`);
  cfg.autId = autId;
  cfg.aut = { ...profile };
  if (process.env.AUT_BASE_URL) cfg.aut.baseURL = process.env.AUT_BASE_URL;
  if (process.env.AUT_API_BASE_URL) cfg.aut.apiBaseURL = process.env.AUT_API_BASE_URL;
  cfg.aut.apiBaseURL ??= cfg.aut.baseURL;

  if (process.env.JIRA_MODE) cfg.jira.mode = process.env.JIRA_MODE as 'mock' | 'cloud';
  if (process.env.JIRA_BASE_URL) cfg.jira.baseUrl = process.env.JIRA_BASE_URL;
  cfg.jira.mockRoot ??= 'mock-jira';
  cfg.jira.verdictLabelPrefix ??= 'heldout-';
  return cfg;
}

/**
 * Structural validation with messages a new user can act on (the JSON schema in templates/ gives the same
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
      if (acc.create === undefined && existing === undefined) out.push(`auts.${id}.accounts needs "create" (tests make their accounts) or "existing" (accounts that already exist)`);
      if (acc.create !== undefined) {
        if (!call('create') || typeof (acc.create as Record<string, unknown>).id !== 'string') out.push(`auts.${id}.accounts.create needs method, path and id (the dotted path of the new account's id in the response)`);
        if (typeof acc.password !== 'string') out.push(`auts.${id}.accounts.password is required with create (e.g. "\${env:APP_USER_PASSWORD}")`);
      }
      if (existing !== undefined) {
        const list = Array.isArray(existing) ? existing as Record<string, unknown>[] : [];
        if (!list.length) out.push(`auts.${id}.accounts.existing must be a list of { username, password }`);
        list.forEach((a, i) => {
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
    if (prof.minTestIntervalMs !== undefined && !(Number.isInteger(prof.minTestIntervalMs) && (prof.minTestIntervalMs as number) >= 0)) out.push(`auts.${id}.minTestIntervalMs must be a whole number of milliseconds`);
    if (prof.maxWorkers !== undefined && !(Number.isInteger(prof.maxWorkers) && (prof.maxWorkers as number) >= 1)) out.push(`auts.${id}.maxWorkers must be a whole number ≥ 1`);
    if (prof.healthcheck !== undefined && (!Array.isArray(prof.healthcheck) || prof.healthcheck.some((h) => typeof h !== 'string'))) out.push(`auts.${id}.healthcheck must be a list of paths, e.g. ["/", "api:/health"]`);
    else for (const h of (prof.healthcheck as string[] | undefined) ?? []) {
      if (!/^(\/|api:\/|https?:\/\/)/.test(h) && h !== '') out.push(`auts.${id}.healthcheck entry ${JSON.stringify(h)} must start with "/", "api:/" or http(s):// (a Windows path here usually means Git Bash rewrote the argument)`);
    }
  }
  if (c.defaultAut !== undefined && auts && !(String(c.defaultAut) in auts)) out.push(`defaultAut "${String(c.defaultAut)}" is not one of the profiles (${Object.keys(auts).join(', ')})`);
  const j = c.jira as Record<string, unknown> | undefined;
  if (j !== undefined) {
    if (j.mode !== undefined && !['mock', 'cloud'].includes(String(j.mode))) out.push(`jira.mode must be "mock" or "cloud" (got ${JSON.stringify(j.mode)})`);
    if (j.mode === 'cloud' && !isUrl(j.baseUrl) && !process.env.JIRA_BASE_URL) out.push('jira.mode is "cloud" but jira.baseUrl (or JIRA_BASE_URL) is not an https URL');
    if (j.acceptanceCriteriaField && !/^customfield_\d+$/.test(String(j.acceptanceCriteriaField))) out.push(`jira.acceptanceCriteriaField looks wrong (${JSON.stringify(j.acceptanceCriteriaField)}); expected "customfield_12345" — list fields with: heldout doctor --jira`);
  }
  const r = c.run as Record<string, unknown> | undefined;
  if (r) for (const k of ['retries', 'workers', 'actionTimeoutMs', 'expectTimeoutMs', 'testTimeoutMs']) {
    if (r[k] !== undefined && (typeof r[k] !== 'number' || (r[k] as number) < 0)) out.push(`run.${k} must be a non-negative number`);
  }
  return out;
}

export interface EvaluationMeta { key: string; aut?: string; createdAt?: string; notes?: string }

/** evaluations/<KEY>/evaluation.json — binds a story to an AUT profile. */
export function readEvaluationMeta(cfg: Pick<HeldoutConfig, 'evaluationsDir'>, key: string): EvaluationMeta {
  const file = path.join(ROOT, cfg.evaluationsDir ?? 'evaluations', key, 'evaluation.json');
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as EvaluationMeta) : { key };
}

/** Environment passed to Playwright so config + fixtures target the resolved profile. */
export function autEnv(cfg: HeldoutConfig): Record<string, string> {
  return {
    HELDOUT_AUT: cfg.autId,
    AUT_BASE_URL: cfg.aut.baseURL,
    AUT_API_BASE_URL: cfg.aut.apiBaseURL ?? cfg.aut.baseURL,
    AUT_TEST_ID_ATTRIBUTE: cfg.aut.testIdAttribute ?? 'data-testid',
    AUT_BLOCK_HOSTS: (cfg.aut.blockHosts ?? []).join(','),
    AUT_OVERLAYS: JSON.stringify(cfg.aut.overlays ?? []),
    AUT_MIN_TEST_INTERVAL_MS: String(cfg.aut.minTestIntervalMs ?? 0),
    ...(cfg.aut.accounts ? { AUT_ACCOUNTS: JSON.stringify(cfg.aut.accounts) } : {}),
  };
}

/**
 * Git Bash (MSYS) rewrites arguments that start with "/" into Windows paths under the Git install:
 * "/" → "C:/Program Files/Git/", "/products" → "C:/Program Files/Git/products". Undo that when recognisable.
 */
export function unmangleMsysPath(value: string): string {
  // Path-list form: "api:/products" → "api;C:\Program Files\Git\products".
  const list = value.match(/^([A-Za-z]+);[A-Za-z]:[\\/](?:Program Files(?: \(x86\))?[\\/])?Git[\\/](.*)$/i);
  if (list) return `${list[1]}:/${list[2].replace(/\\/g, '/')}`;
  // A hash route ("#/login", "#!/login") is rewritten too: "#C:/Program Files/Git/login".
  const m = value.match(/^(#!?)?[A-Za-z]:[\\/](?:Program Files(?: \(x86\))?[\\/])?Git[\\/](.*)$/i) ?? value.match(/^(#!?)?[A-Za-z]:[\\/](?:msys64|msys2)[\\/](.*)$/i);
  return m ? `${m[1] ?? ''}/${m[2].replace(/\\/g, '/')}` : value;
}

/** Resolve a path against an origin ("", "/", "cart", "/app/cart" or a full URL). */
export function resolveUrl(base: string, rawTarget = ''): string {
  const target = unmangleMsysPath(rawTarget);
  if (/^[A-Za-z]:[\\/]/.test(target)) {
    throw new Error(`"${target}" looks like a Windows path — Git Bash rewrote a "/…" argument. Drop the leading slash (e.g. cart.html) or set MSYS_NO_PATHCONV=1.`);
  }
  if (/^https?:\/\//.test(target)) return target;
  return new URL(target.replace(/^\/+/, ''), base.endsWith('/') ? base : `${base}/`).toString();
}

export function assertIssueKey(key: string | undefined): string {
  if (!key || !/^[A-Z][A-Z0-9_]+-\d+$/.test(key)) {
    throw new Error(`A Jira issue key like ABC-123 is required (got: ${key ?? 'nothing'})`);
  }
  return key;
}

export function evalPaths(cfg: HeldoutConfig, key: string) {
  const base = path.join(ROOT, cfg.evaluationsDir, key);
  return {
    base,
    requirement: path.join(base, 'requirement'),
    storyMd: path.join(base, 'requirement', 'story.md'),
    rawIssue: path.join(base, 'requirement', 'raw-issue.json'),
    attachments: path.join(base, 'requirement', 'attachments'),
    evaluationMeta: path.join(base, 'evaluation.json'),
    requirementReview: path.join(base, 'requirement-review.md'),
    scenarios: path.join(base, 'scenarios.feature'),
    testData: path.join(base, 'test-data.json'),
    tests: path.join(base, 'tests'),
    draft: path.join(base, 'draft'),
    hardening: path.join(base, 'hardening'),
    hardeningLog: path.join(base, 'hardening', 'hardening-log.md'),
    integrity: path.join(base, 'hardening', 'integrity.json'),
    runs: path.join(base, 'runs'),
    verdictMd: path.join(base, 'verdict.md'),
    verdictJson: path.join(base, 'verdict.json'),
  };
}

export type Flags = Record<string, string | boolean | string[]>;

/** Tiny argv parser: positionals + `--flag value` / `--flag=value` / `--flag`. Repeated flags become arrays. */
export function parseArgs(argv = process.argv.slice(2)): { _: string[]; flags: Flags } {
  const _: string[] = [];
  const flags: Flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { _.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq === -1 ? a.slice(2) : a.slice(2, eq);
    let value: string | boolean;
    if (eq !== -1) value = a.slice(eq + 1);
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) value = argv[++i];
    else value = true;
    const prev = flags[name];
    flags[name] = prev === undefined ? value : ([] as string[]).concat(prev as string | string[], String(value));
  }
  return { _, flags };
}

export const flagStr = (f: Flags, name: string): string | undefined => {
  const v = f[name];
  return typeof v === 'string' ? v : Array.isArray(v) ? v.at(-1) : undefined;
};

export const flagList = (f: Flags, name: string): string[] =>
  f[name] === undefined || f[name] === true ? [] : ([] as string[]).concat(f[name] as string | string[]);

export function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export function writeFile(file: string, content: string | Buffer): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Project-relative POSIX path (for reports and links). */
export const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join('/');

export const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

/** Runs that are not evaluations (hardening, reproductions, probes, robustness drills) — never the verdict's final run. */
export const NON_EVAL_RUN = /^\d+-(harden|repro|probe|robustness)/;

/** Run folders (NN-label), oldest → newest. */
export function listRuns(runsDir: string): string[] {
  if (!fs.existsSync(runsDir)) return [];
  return fs.readdirSync(runsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{2,}-/.test(d.name))
    .map((d) => d.name)
    .sort();
}

export function main(fn: () => Promise<void> | void): void {
  // Piping into `head` etc. closes stdout early — exit quietly instead of crashing with EPIPE.
  for (const stream of [process.stdout, process.stderr]) {
    stream.on('error', (e: NodeJS.ErrnoException) => { if (e.code === 'EPIPE') process.exit(process.exitCode ?? 0); else throw e; });
  }
  Promise.resolve()
    .then(fn)
    .catch((err: unknown) => {
      console.error(`\n✖ ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    });
}

/** The flags a command script reads (flags.x, flags['x'], flagStr/flagList(flags, 'x')): the dispatcher rejects others. */
export function knownFlags(src: string): Set<string> {
  return new Set([...src.matchAll(/flags\.([A-Za-z_]\w*)|flags\[['"]([a-z-]+)['"]\]|flag(?:Str|List)\(flags, ['"]([a-z-]+)['"]\)/g)].map((m) => m[1] ?? m[2] ?? m[3]));
}
