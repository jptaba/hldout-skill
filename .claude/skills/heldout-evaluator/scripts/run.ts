/**
 * Phase 5 — Execute the held-out suite for one story against its AUT profile.
 *
 *   heldout run <KEY> [--label eval] [--grep SCN-003] [--capture]
 *       [--retries N] [--workers N] [--repeat-each N] [--headed] [--aut <profile>] [--skip-preflight] [--allow-degraded] [--wait-healthy <seconds>] [--quiet | --verbose]
 *   --repeat-each N: stability check during hardening (exposes races that a single green run hides)
 *
 * Preflight (unless --skip-preflight): traceability lint (TODO(harden) allowed only for --label harden*)
 * and an AUT healthcheck (3 samples per URL) — an unreachable or degraded (slow) AUT aborts before any test runs.
 *
 * Each invocation gets its own folder: evaluations/<KEY>/runs/<NN>-<label>/
 *   results.json (Playwright JSON), junit.xml, html/, artifacts/ (screenshots, traces, error-context),
 *   snapshots/ (ARIA snapshots per step when --capture), run-meta.json
 * Exit code is 0 whenever a results.json was produced — failing tests are data for triage, not a crash.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { assertIssueKey, autEnv, evalPaths, flagStr, listRuns, loadConfig, main, parseArgs, readJson, rel, writeFile } from './lib/config';
import { healthcheck, lintEvaluation, printFindings } from './lib/preflight';
import { scrubDir, secretValuesFor } from './lib/redact';
import { failedTests } from './lib/triage-model';
import { envNamesIn } from './lib/accounts';
import { loadedVaultSecrets, requireVaultSecrets } from './lib/secrets';

interface Stats { expected: number; unexpected: number; flaky: number; skipped: number; duration: number }

/** What the tests' seeding did, from the seed-ledger attachments: data created, cleaned, already gone, kept, and left behind. */
function seedSummary(results: unknown): { created: number; cleaned: number; alreadyGone: number; kept: number; leftovers: string[] } {
  const sum = { created: 0, cleaned: 0, alreadyGone: 0, kept: 0, leftovers: [] as string[] };
  const walk = (v: unknown, title: string): void => {
    if (Array.isArray(v)) { v.forEach((x) => walk(x, title)); return; }
    if (!v || typeof v !== 'object') return;
    const o = v as Record<string, unknown>;
    const t = typeof o.title === 'string' && Array.isArray(o.tests) ? o.title : title;
    if (o.name === 'seed-ledger' && typeof o.body === 'string') {
      try {
        const ledger = JSON.parse(Buffer.from(o.body, 'base64').toString('utf8')) as { records?: { label: string; kind?: string; cleanup?: string; created?: unknown; error?: string; reused?: boolean }[] };
        for (const r of (ledger.records ?? []).filter((x) => (x.kind === 'data' || x.kind === 'scenario-created') && !x.reused)) {
          sum.created++;
          if (r.cleanup === 'done') { if (/already gone/.test(r.error ?? '')) sum.alreadyGone++; else sum.cleaned++; }
          else if (r.cleanup === 'failed') sum.leftovers.push(`${t}: ${r.label} — ${r.error ?? 'failed'} (${JSON.stringify(r.created ?? null).slice(0, 100)})`);
          else sum.kept++;
        }
      } catch { /* not a ledger */ }
    }
    for (const x of Object.values(o)) walk(x, t);
  };
  walk(results, '');
  return sum;
}

/** Hash of the skill's scripts and the test support code, so two runs can be told apart if the skill changed between them. */
function skillFingerprint(): string {
  const files = fs.readdirSync(import.meta.dirname, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.ts')).sort()
    .map((f) => path.join(import.meta.dirname, f));
  const support = path.resolve('heldout-support', 'fixtures.ts');
  const h = createHash('sha256');
  for (const f of [...files, ...(fs.existsSync(support) ? [support] : [])]) h.update(fs.readFileSync(f));
  return h.digest('hex').slice(0, 16);
}

main(async () => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  const p = evalPaths(cfg, key);
  if (!fs.existsSync(p.tests)) throw new Error(`No tests at ${rel(p.tests)} — generate them first.`);
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
  const testDataRaw = fs.existsSync(p.testData) ? JSON.parse(fs.readFileSync(p.testData, 'utf8')) as unknown : {};
  await requireVaultSecrets([testDataRaw, cfg.aut.accounts]);
  const vaultValues = loadedVaultSecrets();

  const runs = listRuns(p.runs);
  const next = runs.length ? Number(runs.at(-1)!.split('-')[0]) + 1 : 1;
  const runName = `${String(next).padStart(2, '0')}-${label}`;
  const runDir = path.join(p.runs, runName);
  fs.mkdirSync(runDir, { recursive: true });

  const args = ['playwright', 'test', rel(p.tests) + '/'];
  const grep = flagStr(flags, 'grep');
  if (grep) args.push('--grep', grep);
  // The profile's maxWorkers caps parallelism for hosts that rate-limit or challenge bursts of traffic.
  // Existing accounts are shared out among workers, so there are never more workers than accounts.
  const pool = cfg.aut.accounts && !cfg.aut.accounts.create && cfg.aut.accounts.existing?.length
    ? Math.max(1, Math.floor(cfg.aut.accounts.existing.length / Math.max(1, cfg.aut.accounts.perTest ?? 1))) : undefined;
  const cap = [cfg.aut.maxWorkers, pool].filter((x): x is number => Boolean(x)).reduce<number | undefined>((a, b) => (a === undefined ? b : Math.min(a, b)), undefined);
  const asked = flagStr(flags, 'workers') ? Number(flagStr(flags, 'workers')) : cfg.run.workers;
  const workers = cap ? Math.min(asked ?? cap, cap) : asked;
  if (workers) args.push('--workers', String(workers));
  if (cap && asked && asked > cap) console.log(`  (workers capped at ${cap}: ${cap === pool ? `${cfg.aut.accounts?.existing?.length} existing test account(s)${(cfg.aut.accounts?.perTest ?? 1) > 1 ? `, ${cfg.aut.accounts?.perTest} per test,` : ''} in the "${cfg.autId}" profile` : `the "${cfg.autId}" profile's maxWorkers`})`);
  // Stability check during hardening: run each test N times to expose races that one green run hides.
  if (flagStr(flags, 'repeat-each')) args.push('--repeat-each', flagStr(flags, 'repeat-each')!);

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...autEnv(cfg),
    HELDOUT_KEY: key,
    HELDOUT_RUN_DIR: runDir,
    ...(Object.keys(vaultValues).length ? { HELDOUT_VAULT_SECRETS: JSON.stringify(vaultValues) } : {}),
    ...(flags.capture ? { HELDOUT_CAPTURE: '1' } : {}),
    ...(flags.headed ? { HELDOUT_HEADED: '1' } : {}),
    ...(flagStr(flags, 'retries') !== undefined ? { HELDOUT_RETRIES: flagStr(flags, 'retries') } : {}),
  };

  const startedAt = new Date().toISOString();
  console.log(`▶ ${key} run ${runName} against ${cfg.aut.name} (UI ${cfg.aut.baseURL}${cfg.aut.apiBaseURL !== cfg.aut.baseURL ? `, API ${cfg.aut.apiBaseURL}` : ''})\n  npx ${args.join(' ')}\n`);
  // Playwright's CLI straight through node, no shell: arguments such as --grep "SCN-01|SCN-00[89]" reach it intact.
  const cli = path.resolve('node_modules', '@playwright', 'test', 'cli.js');
  if (!fs.existsSync(cli)) throw new Error('@playwright/test is not installed in this project — run: npm run heldout -- init --install (or npm i -D @playwright/test)');
  // An agent (Claude Code sets CLAUDECODE=1) reads every line it is shown: keep Playwright's full output in the run
  // folder and print a digest. People see the live output; --verbose forces it, --quiet forces the digest.
  const quiet = Boolean(flags.quiet) || (process.env.CLAUDECODE === '1' && !flags.verbose);
  const res = spawnSync(process.execPath, [cli, ...args.slice(1)], { stdio: quiet ? ['inherit', 'pipe', 'pipe'] : 'inherit', env, maxBuffer: 256 * 1024 * 1024 });
  if (quiet) writeFile(path.join(runDir, 'console.log'), `${res.stdout ?? ''}${res.stderr ?? ''}`);
  // Playwright's own error-context / report files embed page snapshots with field values: scrub known secrets.
  const secrets = secretValuesFor(p.testData, process.env, [...envNamesIn(cfg.aut.accounts).map((n) => process.env[n] ?? ''), ...Object.values(vaultValues)].filter(Boolean));
  const scrubbed = scrubDir(runDir, secrets.values);
  if (scrubbed.files) console.log(`
  🔒 scrubbed secret values from ${scrubbed.files} run artifact(s)`);
  if (secrets.weak.length) console.log(`  ⚠ not scrubbed literally (value is a plain word or too short — use a stronger test secret): ${secrets.weak.join(', ')}`);
  // Post-run healthcheck: lets triage correlate unrelated timeouts with a degraded AUT.
  const postHealth = await healthcheck(cfg);

  const resultsFile = path.join(runDir, 'results.json');
  const produced = fs.existsSync(resultsFile);
  const stats = produced ? readJson<{ stats: Stats }>(resultsFile).stats : undefined;
  const meta = {
    key, run: runName, label, startedAt, finishedAt: new Date().toISOString(),
    autId: cfg.autId, aut: { name: cfg.aut.name, baseURL: cfg.aut.baseURL, apiBaseURL: cfg.aut.apiBaseURL },
    command: `npx ${args.join(' ')}`, grep: grep ?? null, capture: Boolean(flags.capture),
    preflight: flags['skip-preflight'] ? 'skipped' : { health },
    postflight: { health: postHealth },
    skill: skillFingerprint(),
    exitCode: res.status, stats,
  };
  writeFile(path.join(runDir, 'run-meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

  if (!produced) throw new Error(`Playwright produced no results.json (exit ${res.status}). Check config / environment.`);
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
  console.log(`  run dir: ${rel(runDir)}`);
  console.log(`  html:    npx playwright show-report ${rel(path.join(runDir, 'html'))}`);
  // Seed data whose cleanup failed is left behind in a shared AUT: name it so it can be removed.
  const seeded = seedSummary(readJson<unknown>(resultsFile));
  const leftovers = seeded.leftovers;
  if (seeded.created) console.log(`  🧹 test data: ${seeded.created} created — ${seeded.cleaned} cleaned up${seeded.alreadyGone ? `, ${seeded.alreadyGone} already gone (the test deleted it)` : ''}${seeded.kept ? `, ${seeded.kept} kept (no way to delete it, or HELDOUT_KEEP_DATA)` : ''}, ${leftovers.length} left behind`);
  if (leftovers.length) {
    console.log(`\n⚠ ${leftovers.length} seed cleanup(s) failed — this data is still in the AUT:`);
    for (const l of leftovers.slice(0, 20)) console.log(`  - ${l}`);
    console.log('  Remove it (api-probe --chain), then fix the cleanup:');
    if (leftovers.some((l) => /HTTP 40[13]/.test(l))) console.log('    HTTP 401/403: the token was revoked (often by a UI sign-in in the test) — take a fresh one in the cleanup and retry, as seed.account() does');
    if (leftovers.some((l) => !/HTTP 40[13]/.test(l))) console.log('    other errors: replay the cleanup call with heldout api-probe to see what the application answers');
  }
  if (stats!.unexpected || stats!.flaky) console.log(`\nNext: npm run heldout -- triage ${key}`);
});
