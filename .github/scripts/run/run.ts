/**
 * Phase 4 — Execute the held-out suite for one story against its AUT profile.
 *
 *   heldout run <KEY> [--label eval] [--grep SCN-003] [--capture]
 *       [--retries N] [--workers N] [--repeat-each N] [--headed] [--aut <profile>] [--skip-preflight] [--allow-degraded] [--wait-healthy <seconds>] [--quiet | --verbose]
 *       [--junit] [--html]
 *   --repeat-each N: stability check during hardening (exposes races that a single green run hides)
 *   --junit, --html: Playwright's JUnit file (for a CI server) and HTML report (for a person debugging), in the raw output
 *
 * Preflight (unless --skip-preflight): traceability lint (TODO(harden) allowed only for --label harden*)
 * and an AUT healthcheck (3 samples per URL) — an unreachable or degraded (slow) AUT aborts before any test runs.
 *
 * Each run is numbered and named NN-label, and leaves:
 *   output/<profile>/<KEY>/5-run/NN-label.json    its record: how it ran, its seeding, every test (one line for a test
 *                                                 that passed; for a failure, its evidence and an automatic class)
 *   .heldout/<profile>/<KEY>/5-run/NN-label/      the raw output (Playwright's JSON, the failures' traces, screenshots
 *                                                 and page snapshots, console.log, snapshots/ with --capture); only
 *                                                 the last two runs' raw output is kept, and any run still in triage
 *   a line in the story's history
 * Exit code is 0 whenever Playwright produced results — failing tests are data for triage, not a crash.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { journeysUsedBy } from '../authoring/journeys/registry';
import { healthcheck, lintEvaluation, printFindings } from '../authoring/preflight';
import { specFiles } from '../authoring/spec-model';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { ROOT, readJson, rel, writeFile } from '../core/files';
import { readHistory, recordEvent, skillFingerprint } from '../core/history';
import { NON_EVAL_RUN, evalPaths, listRuns, runFile, runRaw, type StoryPaths } from '../core/paths';
import { accountRoles, autEnv, dataPrefix, existingAccountWorkers } from '../core/profile';
import { relativizePaths, scrubDir, secretValuesFor } from '../core/redact';
import { loadedVaultSecrets, requireVaultSecrets } from '../core/secrets';
import { envNamesIn } from '../probe/accounts-recipe';
import { digestRun } from '../triage/record';
import { pendingOf, readRunRecord, writeRunRecord, type RunMeta, type RunRecord, type SeedSummary } from '../triage/triage-model';
import { failedTests } from './results';

interface Stats { expected: number; unexpected: number; flaky: number; skipped: number; duration: number }

/**
 * Keep a story's raw run output bounded: the last two runs', and that of any evaluation run whose failures are not
 * all decided yet (the triager still needs its traces). The records stay: runs are history.
 */
function rotateRaw(p: StoryPaths, runs: string[]): void {
  if (!fs.existsSync(p.work.runs)) return;
  const keep = new Set(runs.slice(-2));
  for (const r of runs) {
    if (!NON_EVAL_RUN.test(r) && fs.existsSync(runFile(p, r)) && pendingOf(readRunRecord(runFile(p, r))).length) keep.add(r);
  }
  for (const d of fs.readdirSync(p.work.runs, { withFileTypes: true })) {
    if (d.isDirectory() && /^\d{2,}-/.test(d.name) && !keep.has(d.name)) fs.rmSync(path.join(p.work.runs, d.name), { recursive: true, force: true });
  }
}

/**
 * Of a run's artifacts, keep the folders its record points at: the failing attempt of each test. Earlier attempts of a
 * retried test hold the same failure again.
 */
function keepEvidenceOnly(runDir: string, record: RunRecord): void {
  const artifacts = path.join(runDir, 'artifacts');
  if (!fs.existsSync(artifacts)) return;
  const used = new Set(record.entries.flatMap((e) => [e.evidence.screenshot, e.evidence.trace, e.evidence.errorContext])
    .filter((f): f is string => Boolean(f)).map((f) => path.relative(artifacts, path.join(ROOT, f)).split(path.sep)[0]));
  for (const d of fs.readdirSync(artifacts, { withFileTypes: true })) {
    if (d.isDirectory() && !used.has(d.name)) fs.rmSync(path.join(artifacts, d.name), { recursive: true, force: true });
  }
}

/** What the tests' seeding did, from the seed-ledger attachments: data created, cleaned, already gone, kept, and left behind. */
function seedSummary(results: unknown, prefix: string): SeedSummary {
  const sum = { created: 0, cleaned: 0, alreadyGone: 0, kept: 0, keptBy: {} as Record<string, number>, leftovers: [] as string[], accounts: { used: 0, reset: 0, notReset: [] as string[] } };
  const keptSeen = new Set<string>();
  const walk = (v: unknown, title: string): void => {
    if (Array.isArray(v)) { v.forEach((x) => walk(x, title)); return; }
    if (!v || typeof v !== 'object') return;
    const o = v as Record<string, unknown>;
    const t = typeof o.title === 'string' && Array.isArray(o.tests) ? o.title : title;
    if (o.name === 'seed-ledger' && typeof o.body === 'string') {
      try {
        const ledger = JSON.parse(Buffer.from(o.body, 'base64').toString('utf8')) as { records?: { label: string; kind?: string; cleanup?: string; created?: unknown; error?: string; reused?: boolean }[] };
        // Existing accounts are taken, not created: counted apart, with their reset.
        for (const r of (ledger.records ?? []).filter((x) => x.kind === 'account' && x.created !== undefined)) {
          sum.accounts.used++;
          if (r.cleanup === 'done') sum.accounts.reset++;
          else if (r.cleanup === 'failed') sum.accounts.notReset.push(`${t}: ${JSON.stringify(r.created ?? null).slice(0, 100)} — ${r.error ?? 'reset failed'}`);
        }
        for (const r of (ledger.records ?? []).filter((x) => (x.kind === 'data' || x.kind === 'scenario-created') && !x.reused && !(x.error && x.created === undefined && x.cleanup !== 'failed'))) {
          sum.created++;
          if (r.cleanup === 'done') { if (/already gone/.test(r.error ?? '')) sum.alreadyGone++; else sum.cleaned++; }
          else if (r.cleanup === 'failed') sum.leftovers.push(`${t}: ${r.label} — ${r.error ?? 'failed'} (${JSON.stringify(r.created ?? null).slice(0, 100)})`);
          else {
            // Counted per kind of record: the run's own names (prefixed test data) and seed.track's
            // "(created by the scenario)" are dropped, so 13 customers read "registered customer ×13".
            const label = r.label.replace(/ \(created by the scenario\)$/, '').split(/\s+/)
              .filter((w) => !(prefix && w.toLowerCase().replace(/^["'`]/, '').startsWith(prefix.toLowerCase()))).join(' ') || r.label;
            // A record shared by several tests (made once per worker) is in each test's ledger: counted once.
            const same = `${r.label}|${JSON.stringify(r.created ?? null)}`;
            if (keptSeen.has(same)) { sum.created--; continue; }
            keptSeen.add(same);
            sum.kept++; sum.keptBy[label] = (sum.keptBy[label] ?? 0) + 1;
          }
        }
      } catch { /* not a ledger */ }
    }
    for (const x of Object.values(o)) walk(x, t);
  };
  walk(results, '');
  return sum;
}

export const spec: CommandSpec = {
  name: 'run', group: 'Run', usage: 'KEY [--label eval] [--grep …] [--repeat-each N] [--capture] [--wait-healthy 300]',
  about: 'preflight + run the held-out suite',
  flags: ['allow-degraded', 'aut', 'capture', 'grep', 'headed', 'html', 'junit', 'label', 'quiet', 'repeat-each', 'retries', 'skip-preflight', 'verbose', 'wait-healthy', 'workers'],
};

/**
 * The next run's number: one past every run the story has had, by its history and by the records in the record and
 * in the scratch area (the verdict keeps only the final run's record), so a number is never used twice.
 */
export function nextRunNumber(p: Pick<StoryPaths, 'runs' | 'history' | 'work'>): number {
  const names = [...listRuns(p.runs), ...listRuns(p.work.runs),
    ...readHistory(p.history).filter((e) => e.event === 'run').map((e) => String(e.run ?? ''))];
  return Math.max(0, ...names.map((r) => Number(r.split('-')[0])).filter(Number.isFinite)) + 1;
}

export async function run({ _, flags }: Args): Promise<void> {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  const p = evalPaths(cfg, key);
  // What runs is the hardener's copy, made when the draft was frozen.
  if (!fs.existsSync(p.freeze) || !fs.existsSync(p.hardened)) throw new Error(`No frozen tests for ${key} (${rel(p.hardened)}/) — the draft is frozen first: heldout integrity ${key} --snapshot`);
  const label = (flagStr(flags, 'label') ?? 'eval').replace(/[^a-z0-9-]+/gi, '-').toLowerCase();

  let health: Awaited<ReturnType<typeof healthcheck>> = [];
  if (!flags['skip-preflight']) {
    console.log(`Preflight ${key} → AUT "${cfg.autId}" (${cfg.aut.name})`);
    const findings = lintEvaluation(cfg, key, { allowUnhardened: label.startsWith('harden') });
    printFindings(findings);
    health = await healthcheck(cfg);
    // --wait-healthy S: a shared sandbox restarting or rate-limiting us usually recovers within minutes; poll, don't fail.
    const waitUntil = Date.now() + Number(flagStr(flags, 'wait-healthy') ?? 0) * 1000;
    while (health.some((h) => !h.ok) && Date.now() < waitUntil) {
      console.log(`  … AUT not healthy (${health.filter((h) => !h.ok).map((h) => h.status ?? h.error).join(', ')}), checking again in 30 s`);
      await new Promise((r) => setTimeout(r, 30_000));
      health = await healthcheck(cfg);
    }
    for (const h of health) console.log(`  ${h.ok && !h.slow ? '✔' : h.ok ? '⚠' : '✖'} health ${h.url} → ${h.status ?? h.error} (slowest ${h.ms} ms${h.samples ? ` of ${h.samples.join('/')}` : ''})`);
    if (findings.some((f) => f.level === 'error')) throw new Error('Traceability lint failed — fix the errors above (or --skip-preflight to override).');
    if (health.some((h) => !h.ok)) throw new Error('ENVIRONMENT: AUT healthcheck failed — not running tests against an unavailable AUT.');
    if (health.some((h) => h.slow) && !flags['allow-degraded']) {
      throw new Error('ENVIRONMENT: AUT is degraded (slow healthcheck samples) — results would be timeout noise. Retry later, or pass --allow-degraded to run anyway.');
    }
    console.log('');
  }

  // Secrets from HashiCorp Vault (${vault:…} in test-data.json or the accounts recipe): read once, before any run
  // folder exists, and handed to the test process in memory only.
  const testDataRaw = fs.existsSync(p.hardenedData) ? JSON.parse(fs.readFileSync(p.hardenedData, 'utf8')) as unknown : {};
  await requireVaultSecrets([testDataRaw, cfg.aut.accounts]);
  const vaultValues = loadedVaultSecrets();

  const runs = listRuns(p.runs);
  const runName = `${String(nextRunNumber(p)).padStart(2, '0')}-${label}`;
  rotateRaw(p, runs);
  // Playwright's raw output goes to the scratch area; the run's record (5-run/NN-label.json) is written from it.
  const runDir = runRaw(p, runName);
  fs.rmSync(runDir, { recursive: true, force: true });
  fs.mkdirSync(runDir, { recursive: true });

  const args = ['playwright', 'test', rel(p.hardened) + '/'];
  const grep = flagStr(flags, 'grep');
  // Playwright greps the title and the tags: "SCN-001" would also pick every test tagged @depends:SCN-001.
  if (grep) args.push('--grep', /SCN-/.test(grep) ? `(?<!@depends:)(?:${grep})` : grep);
  // The profile's maxWorkers caps parallelism for hosts that rate-limit or challenge bursts of traffic.
  // Existing accounts are shared out among workers, so there are never more workers than accounts (of each role) — when
  // the story's tests take accounts at all.
  const specsHere = specFiles(p.hardened);
  const accountCalls = [...specsHere, ...journeysUsedBy(cfg, cfg.autId, specsHere)].flatMap((f) => fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').match(/\bseed\.account\([^)]*\)/g) ?? []);
  const takesAccounts = accountCalls.length > 0;
  // Every call names its role as a literal: only those roles limit the workers. One that doesn't may take any account.
  const namedRoles = accountCalls.map((c) => c.match(/\brole:\s*['"`]([a-z][a-z0-9-]*)['"`]/)?.[1]);
  // A role asked for under several labels ("customer", "another customer") is taken that many times by one test, at
  // most: each worker then needs that many accounts of the role.
  const labelsOf = new Map<string, Set<string>>();
  for (const c of accountCalls) {
    const role = c.match(/\brole:\s*['"`]([a-z][a-z0-9-]*)['"`]/)?.[1]; const label = c.match(/\(\s*['"`]([^'"`]*)['"`]/)?.[1];
    if (role) labelsOf.set(role, (labelsOf.get(role) ?? new Set()).add(label ?? ''));
  }
  const pool = takesAccounts ? existingAccountWorkers(cfg.aut.accounts, namedRoles.every(Boolean) ? new Map([...labelsOf].map(([role, labels]) => [role, labels.size])) : undefined) : undefined;
  const cap = [cfg.aut.maxWorkers, pool].filter((x): x is number => Boolean(x)).reduce<number | undefined>((a, b) => (a === undefined ? b : Math.min(a, b)), undefined);
  const asked = flagStr(flags, 'workers') ? Number(flagStr(flags, 'workers')) : cfg.run.workers;
  const workers = cap ? Math.min(asked ?? cap, cap) : asked;
  if (workers) args.push('--workers', String(workers));
  if (cap && asked && asked > cap) console.log(`  (workers capped at ${cap}: ${cap === pool ? `${cfg.aut.accounts?.existing?.length} existing test account(s)${accountRoles(cfg.aut.accounts).size ? ` (${[...accountRoles(cfg.aut.accounts)].map(([r, n]) => `${n} ${r}`).join(', ')})` : ''}${(cfg.aut.accounts?.perTest ?? 1) > 1 ? `, ${cfg.aut.accounts?.perTest} per test,` : ''} in the "${cfg.autId}" profile` : `the "${cfg.autId}" profile's maxWorkers`})`);
  // Stability check during hardening: run each test N times to expose races that one green run hides. Passed to the
  // config, not the CLI: a test tagged @irreversible (it locks an account, sends a real e-mail…) still runs once, and is
  // never retried (playwright.config.ts).
  const repeatEach = flagStr(flags, 'repeat-each');

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...autEnv(cfg),
    HELDOUT_KEY: key,
    HELDOUT_RUN_DIR: runDir,
    ...(Object.keys(vaultValues).length ? { HELDOUT_VAULT_SECRETS: JSON.stringify(vaultValues) } : {}),
    ...(flags.capture ? { HELDOUT_CAPTURE: '1' } : {}),
    ...(flags.headed ? { HELDOUT_HEADED: '1' } : {}),
    // A hardening run repeats each test to show what is unstable: a retry would only hide it, and send a failing
    // test's requests (and the records it leaves) a second time. Evaluation runs keep the profile's retries.
    ...(flagStr(flags, 'retries') !== undefined ? { HELDOUT_RETRIES: flagStr(flags, 'retries') } : NON_EVAL_RUN.test(runName) ? { HELDOUT_RETRIES: '0' } : {}),
    ...(repeatEach ? { HELDOUT_REPEAT_EACH: repeatEach } : {}),
    // Two more reports, on request: JUnit for a CI server, Playwright's HTML report for a person debugging.
    ...(flags.junit ? { HELDOUT_JUNIT: '1' } : {}),
    ...(flags.html ? { HELDOUT_HTML: '1' } : {}),
  };

  const startedAt = new Date().toISOString();
  console.log(`▶ ${key} run ${runName} against ${cfg.aut.name} (UI ${cfg.aut.baseURL}${cfg.aut.apiBaseURL !== cfg.aut.baseURL ? `, API ${cfg.aut.apiBaseURL}` : ''})\n  npx ${args.join(' ')}${repeatEach ? `   (each test ${repeatEach} times; @irreversible ones once)` : ''}\n`);
  // Playwright's CLI straight through node, no shell: arguments such as --grep "SCN-01|SCN-00[89]" reach it intact.
  const cli = path.resolve('node_modules', '@playwright', 'test', 'cli.js');
  if (!fs.existsSync(cli)) throw new Error('@playwright/test is not installed in this project — run: npm run heldout -- init --install (or npm i -D @playwright/test)');
  // An agent reads every line it is shown: keep Playwright's full output in the run folder and print a digest. Claude Code
  // says it is there (CLAUDECODE=1); other agent apps set HELDOUT_QUIET=1 or pass --quiet. --verbose forces the live output.
  const quiet = Boolean(flags.quiet) || ((process.env.CLAUDECODE === '1' || process.env.HELDOUT_QUIET === '1') && !flags.verbose);
  // Quiet runs keep Playwright's output for console.log and say once a minute how far they are: a long run (many
  // tests on one worker, repeated) is otherwise silent until it ends.
  const res = quiet ? await new Promise<{ status: number | null; stdout: string }>((resolve) => {
    const child = spawn(process.execPath, [cli, ...args.slice(1)], { stdio: ['inherit', 'pipe', 'pipe'], env });
    let out = ''; const started = Date.now();
    child.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    child.stderr.on('data', (d: Buffer) => { out += d.toString(); });
    const done = () => (out.match(/^\s*(?:✓|✘|ok|x|-|±)\s+\d+\s/gm) ?? []).length;
    const tick = setInterval(() => console.log(`  … ${done()} test result(s) after ${Math.round((Date.now() - started) / 60_000)} min`), 60_000);
    child.on('close', (status) => { clearInterval(tick); resolve({ status, stdout: out }); });
  }) : spawnSync(process.execPath, [cli, ...args.slice(1)], { stdio: 'inherit', env, maxBuffer: 256 * 1024 * 1024 });
  if (quiet) writeFile(path.join(runDir, 'console.log'), String(res.stdout ?? ''));
  // Playwright's own error-context / report files embed page snapshots with field values: scrub known secrets.
  const secrets = secretValuesFor(p.hardenedData, process.env, [...envNamesIn(cfg.aut.accounts).map((n) => process.env[n] ?? ''), ...Object.values(vaultValues)].filter(Boolean));
  const scrubbed = scrubDir(runDir, secrets.values);
  // …and the machine's own folder names: paths in the evidence are relative to the project.
  relativizePaths(runDir, ROOT);
  if (scrubbed.files) console.log(`
  🔒 scrubbed secret values from ${scrubbed.files} run artifact(s)`);
  if (secrets.weak.length) console.log(`  ⚠ not scrubbed literally (value is a plain word or too short — use a stronger test secret): ${secrets.weak.join(', ')}`);
  // Post-run healthcheck: lets triage correlate unrelated timeouts with a degraded AUT.
  const postHealth = await healthcheck(cfg);

  const resultsFile = path.join(runDir, 'results.json');
  const produced = fs.existsSync(resultsFile);
  const stats = produced ? readJson<{ stats: Stats }>(resultsFile).stats : undefined;
  const meta: RunMeta = {
    label, startedAt, finishedAt: new Date().toISOString(),
    autId: cfg.autId, aut: { name: cfg.aut.name, baseURL: cfg.aut.baseURL, apiBaseURL: cfg.aut.apiBaseURL },
    command: `npx ${args.join(' ')}`, workers: workers ?? null, repeatEach: repeatEach ? Number(repeatEach) : null, grep: grep ?? null, capture: Boolean(flags.capture),
    preflight: flags['skip-preflight'] ? 'skipped' : { health },
    postflight: { health: postHealth },
    skill: skillFingerprint(),
    exitCode: res.status, stats, raw: rel(runDir),
    ...(produced ? {} : { error: `Playwright produced no results (exit ${res.status})` }),
  };
  // Seed data whose cleanup failed is left behind in a shared AUT: name it so it can be removed.
  const seeded = produced ? seedSummary(readJson<unknown>(resultsFile), dataPrefix(cfg.aut)) : undefined;
  // Data made once per worker (seed.shared) is removed when the run is over: the teardown reports what it did.
  const sharedFile = path.join(runDir, 'shared-data.json');
  const shared = fs.existsSync(sharedFile) ? readJson<{ label: string; cleanup: string; error?: string; created?: unknown }[]>(sharedFile) : [];
  for (const s of shared.filter((x) => x.cleanup === 'failed')) seeded?.leftovers.push(`shared: ${s.label} — ${s.error ?? 'failed'} (${JSON.stringify(s.created ?? null).slice(0, 100)})`);
  // The record of the run: kept, committed, and what triage, the verdict and every later review read. A run that
  // produced nothing is recorded all the same: runs are history.
  const digest = produced ? digestRun(cfg, key, runName, resultsFile, [...(Array.isArray(health) ? health : []), ...postHealth])
    : { key, run: runName, generatedAt: new Date().toISOString(), summary: { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0 }, entries: [] };
  const record: RunRecord = { ...digest, meta, ...(seeded ? { seed: seeded } : {}) };
  const recordFile = runFile(p, runName);
  writeRunRecord(recordFile, record);
  scrubDir(p.runs, secrets.values);
  keepEvidenceOnly(runDir, record);
  recordEvent(p.history, 'run', {
    run: runName, label, ...(grep ? { grep } : {}), ...(repeatEach ? { repeatEach: Number(repeatEach) } : {}), workers: workers ?? null,
    exitCode: res.status, stats: stats ? { passed: stats.expected, failed: stats.unexpected, flaky: stats.flaky, skipped: stats.skipped, seconds: Math.round(stats.duration / 1000) } : null,
  });

  if (!produced) throw new Error(`Playwright produced no results (exit ${res.status}). Check config / environment. The run is recorded in ${rel(recordFile)}.`);
  console.log(`\n■ ${runName}: passed ${stats!.expected}, failed ${stats!.unexpected}, flaky ${stats!.flaky}, skipped ${stats!.skipped} (${Math.round(stats!.duration / 1000)} s)`);
  if (quiet) {
    // Repeats of one test with the same error are one line with a count.
    const lines = new Map<string, number>();
    for (const f of failedTests(readJson<unknown>(resultsFile))) {
      const line = `  ${f.flaky ? '≈' : '✖'} ${f.title}\n      ${f.error}`;
      lines.set(line, (lines.get(line) ?? 0) + 1);
    }
    for (const [line, n] of lines) console.log(n > 1 ? line.replace('\n', ` (×${n})\n`) : line);
    console.log(`  full output: ${rel(path.join(runDir, 'console.log'))}`);
  }
  console.log(`  record:  ${rel(recordFile)}`);
  console.log(`  raw:     ${rel(runDir)}/ (traces and screenshots of the failures; scratch, removed when the story is complete)`);
  if (flags.html) console.log(`  html:    npx playwright show-report ${rel(path.join(runDir, 'html'))}`);
  if (shared.length) {
    const kept = shared.filter((s) => s.cleanup === 'none' || s.cleanup === 'skipped').length;
    console.log(`  🧹 shared test data (made once per worker): ${shared.length} — ${shared.filter((s) => s.cleanup === 'done').length} removed when the run ended${kept ? `, ${kept} kept (no undo given, or HELDOUT_KEEP_DATA)` : ''}`);
  }
  const seed = seeded!;
  const leftovers = seed.leftovers;
  const acc = seed.accounts;
  if (acc.used) {
    const reset = acc.reset || acc.notReset.length ? ` — reset after the test ${acc.reset} time(s)${acc.notReset.length ? `, NOT reset ${acc.notReset.length} time(s)` : ''}` : ' (the recipe has no reset: what a test adds to them stays)';
    console.log(`  👤 existing accounts: taken ${acc.used} time(s)${reset}`);
    for (const x of acc.notReset) console.log(`     ${x}`);
  }
  if (seed.created) console.log(`  🧹 test data: ${seed.created} created — ${seed.cleaned} cleaned up${seed.alreadyGone ? `, ${seed.alreadyGone} already gone (the test deleted it)` : ''}${seed.kept ? `, ${seed.kept} kept by design (${Object.entries(seed.keptBy).map(([l, n]) => `${l} ×${n}`).join(', ')}: the application offers no delete, or HELDOUT_KEEP_DATA; their names start with "${dataPrefix(cfg.aut)}")` : ''}, ${leftovers.length} left behind`);
  if (leftovers.length) {
    console.log(`\n⚠ ${leftovers.length} seed cleanup(s) failed — this data is still in the AUT:`);
    for (const l of leftovers.slice(0, 20)) console.log(`  - ${l}`);
    console.log('  Remove it (api-probe --chain), then fix the cleanup:');
    if (leftovers.some((l) => /HTTP 40[13]/.test(l))) console.log('    HTTP 401/403: the token was revoked (often by a UI sign-in in the test) — take a fresh one in the cleanup and retry, as seed.account() does');
    if (leftovers.some((l) => !/HTTP 40[13]/.test(l))) console.log('    other errors: replay the cleanup call with heldout api-probe to see what the application answers');
  }
  // A host that rate-limited this run will do it again: say how to pace the tests, with the command that does it.
  // The signs: a 429 in the health checks or the output, or a rate-limit page in a failed test's page snapshot (a WAF
  // such as Cloudflare "Error 1015 · You are being rate limited" answers the browser; the test then only times out).
  // A 429 counts only as a status ("HTTP 429", "status 429", "429 Too Many Requests"), never a bare number: code frames
  // in the output and in error-context.md show source line numbers ("429 |   let res…"), which are left out too.
  const RATE_LIMITED = /\b(?:HTTP|status(?:Code)?|code|received|answer(?:ed|s)?)\W{0,3}429\b|\b429\s+too many|rate[ -]?limit(?:ed|ing)?\b|too many requests|error 1015/i;
  const withoutCodeFrames = (s: string) => s.split(/\r?\n/).filter((l) => !/^\s*>?\s*\d+\s*\|/.test(l)).join('\n');
  // Only the page snapshot of an error context is the application's answer; the rest is the test's own source.
  const snapshots = fs.existsSync(path.join(runDir, 'artifacts')) ? fs.readdirSync(path.join(runDir, 'artifacts'), { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('error-context.md')).map((f) => fs.readFileSync(path.join(runDir, 'artifacts', f), 'utf8').match(/# Page snapshot\s*```(?:yaml)?\r?\n([\s\S]*?)```/)?.[1] ?? '') : [];
  const throttled = [...(Array.isArray(health) ? health : []), ...postHealth].some((h) => h.status === 429)
    || RATE_LIMITED.test(withoutCodeFrames(fs.existsSync(path.join(runDir, 'console.log')) ? fs.readFileSync(path.join(runDir, 'console.log'), 'utf8') : ''))
    || snapshots.some((s) => RATE_LIMITED.test(s));
  if (throttled && !(cfg.aut.maxWorkers === 1 && cfg.aut.minTestIntervalMs)) {
    console.log(`\n⚠ ${cfg.aut.name} rate-limited this run (HTTP 429). Pace the tests on this host, then run again:`);
    console.log(`  npm run heldout -- init --profile ${cfg.autId} --max-workers 1 --min-test-interval-ms 10000`);
    console.log('  (one worker, test starts at least 10 s apart; the failures above are the environment, not the application)');
  }
  if (stats!.unexpected || stats!.flaky) console.log(`\nNext: npm run heldout -- triage ${key}`);
  else if (grep) console.log(`\nA run of some of the tests is never the evaluation: the verdict comes from a run of them all (npm run heldout -- advance ${key}${/repair/.test(runName) ? ' --rerun' : ''}).`);
  else if (!NON_EVAL_RUN.test(runName)) console.log(`\nNext: npm run heldout -- verdict ${key}`);
  else if (/harden/.test(runName)) console.log(`\nNext: record what hardening found (any mechanics gap still open: contract ${key} --resolve Gn …; ${rel(p.hardeningLog)}), then: npm run heldout -- advance ${key}`);
}
