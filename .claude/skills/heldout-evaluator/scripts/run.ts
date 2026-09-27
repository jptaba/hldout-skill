/**
 * Phase 5 — Execute the held-out suite for one story against its AUT profile.
 *
 *   heldout run <KEY> [--label eval] [--grep SCN-003] [--capture]
 *       [--retries N] [--workers N] [--repeat-each N] [--headed] [--aut <profile>] [--skip-preflight] [--allow-degraded]
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
import fs from 'node:fs';
import path from 'node:path';
import { assertIssueKey, autEnv, evalPaths, flagStr, listRuns, loadConfig, main, parseArgs, readJson, rel, writeFile } from './lib/config';
import { healthcheck, lintEvaluation, printFindings } from './lib/preflight';
import { scrubDir, secretValuesFor } from './lib/redact';

interface Stats { expected: number; unexpected: number; flaky: number; skipped: number; duration: number }

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
    for (const h of health) console.log(`  ${h.ok && !h.slow ? '✔' : h.ok ? '⚠' : '✖'} health ${h.url} → ${h.status ?? h.error} (slowest ${h.ms} ms${h.samples ? ` of ${h.samples.join('/')}` : ''})`);
    if (findings.some((f) => f.level === 'error')) throw new Error('Traceability lint failed — fix the errors above (or --skip-preflight to override).');
    if (health.some((h) => !h.ok)) throw new Error('ENVIRONMENT: AUT healthcheck failed — not running tests against an unavailable AUT.');
    if (health.some((h) => h.slow) && !flags['allow-degraded']) {
      throw new Error('ENVIRONMENT: AUT is degraded (slow healthcheck samples) — results would be timeout noise. Retry later, or pass --allow-degraded to run anyway.');
    }
    console.log('');
  }

  const runs = listRuns(p.runs);
  const next = runs.length ? Number(runs.at(-1)!.split('-')[0]) + 1 : 1;
  const runName = `${String(next).padStart(2, '0')}-${label}`;
  const runDir = path.join(p.runs, runName);
  fs.mkdirSync(runDir, { recursive: true });

  const args = ['playwright', 'test', rel(p.tests) + '/'];
  const grep = flagStr(flags, 'grep');
  if (grep) args.push('--grep', grep);
  if (flagStr(flags, 'workers')) args.push('--workers', flagStr(flags, 'workers')!);
  // Stability check during hardening: run each test N times to expose races that one green run hides.
  if (flagStr(flags, 'repeat-each')) args.push('--repeat-each', flagStr(flags, 'repeat-each')!);

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...autEnv(cfg),
    HELDOUT_KEY: key,
    HELDOUT_RUN_DIR: runDir,
    ...(flags.capture ? { HELDOUT_CAPTURE: '1' } : {}),
    ...(flags.headed ? { HELDOUT_HEADED: '1' } : {}),
    ...(flagStr(flags, 'retries') !== undefined ? { HELDOUT_RETRIES: flagStr(flags, 'retries') } : {}),
  };

  const startedAt = new Date().toISOString();
  console.log(`▶ ${key} run ${runName} against ${cfg.aut.name} (UI ${cfg.aut.baseURL}${cfg.aut.apiBaseURL !== cfg.aut.baseURL ? `, API ${cfg.aut.apiBaseURL}` : ''})\n  npx ${args.join(' ')}\n`);
  const res = spawnSync('npx', args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  // Playwright's own error-context / report files embed page snapshots with field values: scrub known secrets.
  const secrets = secretValuesFor(p.testData);
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
    exitCode: res.status, stats,
  };
  writeFile(path.join(runDir, 'run-meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

  if (!produced) throw new Error(`Playwright produced no results.json (exit ${res.status}). Check config / environment.`);
  console.log(`\n■ ${runName}: passed ${stats!.expected}, failed ${stats!.unexpected}, flaky ${stats!.flaky}, skipped ${stats!.skipped}`);
  console.log(`  run dir: ${rel(runDir)}`);
  console.log(`  html:    npx playwright show-report ${rel(path.join(runDir, 'html'))}`);
  if (stats!.unexpected || stats!.flaky) console.log(`\nNext: npm run heldout -- triage ${key}`);
});
