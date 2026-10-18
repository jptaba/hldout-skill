/**
 * The shape of heldout.config.json: the AUT profiles, their test accounts and the project's settings. Everything
 * AUT-specific lives in the project's heldout.config.json / .env — never in the skill.
 */

export interface AutProfile {
  name: string;
  /** Web UI origin (Playwright baseURL). */
  baseURL: string;
  /** API origin for the `api` fixture and api-probe; defaults to baseURL. */
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
  /** Prefix of every name the tests make on this AUT (users, records, seed tags), so its test data is easy to find and
   *  sweep. Default "hldout"; set another one where the application's rules need it (letters only, a length limit). */
  dataPrefix?: string;
  /** This application's journeys folder, when the project holds more than one application (default: journeysDir). */
  journeysDir?: string;
  /** How to make a test account on this AUT (mechanics, found while hardening the first story): seed.account() and signIn(). */
  accounts?: AccountRecipe;
  notes?: string;
}

/** An HTTP call of an account recipe. Strings may use ${username}, ${password}, ${id}, ${token}, ${env:NAME}. */
export interface RecipeCall { method: string; path: string; body?: unknown; form?: Record<string, string> }

/** An account that already exists in the AUT. Secrets as ${env:NAME} or ${vault:path#field}, never literal. */
export interface ExistingAccount {
  username: string; password: string; id?: string;
  /** The kind of user it is ("admin", "customer"): seed.account({ role }) hands out only accounts of that role. */
  role?: string;
  /**
   * Several parallel workers may use this account at once: it only acts on other records (an administrator who
   * manages the catalogue), the tests never change the account itself, and the application keeps earlier sign-ins
   * valid when the account signs in again. It then doesn't limit how many workers a run uses.
   */
  shared?: boolean;
}

/**
 * How tests get accounts on this AUT. Either the tests create them (`create`, with `delete` when the application
 * allows it), or they use accounts that already exist (`existing`), shared out among parallel workers.
 */
export interface AccountRecipe {
  /** Password for the accounts the tests create, normally "${env:NAME}" (a strong value, so artifacts can be scrubbed). */
  password?: string;
  /** User-name template for created accounts; ${uid} is unique per account. Default "<dataPrefix>-${uid}". */
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
  /** Existing accounts the tests change: restores one (e.g. clears its collection), with its auth header. Run when a test
   *  takes the account, so a crashed earlier run leaves nothing behind, and again after the test. */
  reset?: RecipeCall;
  /** UI sign-in: open `path`, run the steps (fill/click with a page-locator expression), then wait for `done`
   *  ("url:/profile" or a locator expression). */
  signIn?: UiForm;
  /** UI sign-up, for applications whose accounts can only be made on their sign-up page (no API): the same shape as
   *  signIn, run in a browser of its own before the test. The id comes from `lookup` or the `token` answer. */
  signUp?: UiForm;
}
/** A form filled in the browser: open `path`, fill/click the steps (page-locator expressions), wait for `done`. */
export interface UiForm { path: string; steps: { fill?: string; click?: string; value?: string }[]; done?: string }
/** Whether the tests make their own accounts (over the API, or on the sign-up page). */
export const createsAccounts = (r?: AccountRecipe) => Boolean(r?.create || r?.signUp);

/** The roles the existing accounts have, with how many accounts each. */
export function accountRoles(r?: AccountRecipe): Map<string, number> {
  const out = new Map<string, number>();
  for (const a of r?.existing ?? []) if (a.role) out.set(a.role, (out.get(a.role) ?? 0) + 1);
  return out;
}

/**
 * The most parallel workers the existing accounts allow: each worker has accounts of its own. Without roles, the pool
 * divided by the accounts one test takes (perTest); with roles, also each role's count (a test takes at most one
 * account of a role at a time, unless perTest says more). Undefined when the tests make every account they use.
 */
export function existingAccountWorkers(r?: AccountRecipe, onlyRoles?: Set<string> | Map<string, number>): number | undefined {
  // When every account a story's tests take names its role, only those roles limit the run: tests that need the
  // administrator alone are not held back by how many customers there are. A map also says how many accounts of the
  // role one test takes at once (the story's tests ask for "a customer" and "another customer": 2).
  if (onlyRoles && r?.existing?.length) {
    const perOf = (role: string) => Math.max(1, r.perTest ?? 1, onlyRoles instanceof Map ? onlyRoles.get(role) ?? 1 : 1);
    const caps = [...onlyRoles.keys()].filter((role) => !r.existing!.some((a) => a.role === role && a.shared))
      .map((role) => [r.existing!.filter((a) => a.role === role).length, perOf(role)]).filter(([n]) => n > 0).map(([n, per]) => Math.floor(n / per));
    return caps.length ? Math.max(1, Math.min(...caps)) : undefined;
  }
  const roles = accountRoles(r);
  if (!r?.existing?.length || (createsAccounts(r) && !roles.size)) return undefined;
  const per = Math.max(1, r.perTest ?? 1);
  // A shared account serves every worker: a role that has one, and a pool that has one, set no limit.
  const sharedRoles = new Set(r.existing.filter((a) => a.shared && a.role).map((a) => a.role!));
  const anyShared = r.existing.some((a) => a.shared && !a.role);
  const caps = [...(createsAccounts(r) || anyShared || sharedRoles.size ? [] : [Math.floor(r.existing.length / per)]), ...[...roles].filter(([role]) => !sharedRoles.has(role)).map(([, n]) => (per > 1 ? Math.floor(n / per) : n))];
  return caps.length ? Math.max(1, Math.min(...caps)) : undefined;
}

export interface HeldoutConfig {
  /** Named AUT profiles. A story is bound to one by its folder, output/<profile>/<KEY>/. */
  auts: Record<string, AutProfile>;
  defaultAut: string;
  /** The profile resolved for the current command (see loadConfig). */
  aut: AutProfile;
  autId: string;
  jira: {
    /** mock = file-backed; datacenter = Jira and Confluence Data Center / Server (REST, personal access token). */
    mode: JiraMode;
    /** Folder that simulates a Jira instance (and the Confluence it links to) when mode=mock. */
    mockRoot: string;
    /** https://jira.example.com — REST calls, and links / outbox logs in mock mode. */
    baseUrl?: string;
    /** Optional custom field that stores acceptance criteria, e.g. customfield_10035. */
    acceptanceCriteriaField?: string;
    /** Labels written on publish: <prefix>pass | <prefix>fail | ... */
    verdictLabelPrefix?: string;
    /** auto (default): `heldout advance` publishes the verdict to the story itself. manual: it leaves that to a person (`heldout publish KEY`). */
    publish?: 'auto' | 'manual';
  };
  /** Everything of a story, per AUT profile: <outputDir>/<profile>/<KEY>/. */
  outputDir: string;
  /** The application's journeys: fixtures/<domain>.ts and registry.yml (a profile's own journeysDir wins). */
  journeysDir: string;
  /** Keep a story's scratch area (raw run output, traces) when it is complete; by default `advance` removes it. */
  keepScratch?: boolean;
  run: {
    retries: number;
    workers?: number;
    headless?: boolean;
    actionTimeoutMs?: number;
    expectTimeoutMs?: number;
    testTimeoutMs?: number;
  };
}

export const JIRA_MODES = ['mock', 'datacenter'] as const;
export type JiraMode = (typeof JIRA_MODES)[number];

/** Prefix of the names tests make on an AUT (users, records, seed tags). */
export const dataPrefix = (aut: Pick<AutProfile, 'dataPrefix'>): string => aut.dataPrefix ?? 'hldout';

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
    AUT_DATA_PREFIX: dataPrefix(cfg.aut),
    ...(cfg.aut.accounts ? { AUT_ACCOUNTS: JSON.stringify(cfg.aut.accounts) } : {}),
  };
}
