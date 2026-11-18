/**
 * Preflight gates run before every official run (scripts/run.ts) and on demand (scripts/lint.ts):
 *   1. Lint — the contract and its review hold, the tests generated from its checks compile and run in full, and the
 *      journeys hold no expectation.
 *   2. AUT healthcheck — the target is reachable, so environment noise never reaches triage.
 * The tests are generated from the contract's checks, so what a lint of hand-written tests checked (tags, sources,
 * types, a requirement assertion per criterion) holds by construction and is not checked again.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { resolveUrl } from '../core/cli';
import { ROOT, rel } from '../core/files';
import { currentTests, evalPaths, journeyPaths, knowledgeIds, strayFiles } from '../core/paths';
import { duplicateProbeIds } from '../core/probe-log';
import { accountRoles, type HeldoutConfig } from '../core/profile';
import { checkContract, readContract } from '../contract/contract-model';
import { checkReview, readReview } from '../contract/evidence';
import { allJourneys, describeJourney, duplicateJourneys, journeysUsedBy, lintJourneys, readRegistry } from './journeys/registry';
import { readSuite, specFiles } from './spec-model';

export interface Finding { level: 'error' | 'warn'; code: string; message: string }

export function lintEvaluation(cfg: HeldoutConfig, key: string, opts: { allowUnhardened?: boolean; draft?: boolean } = {}): Finding[] {
  const p = evalPaths(cfg, key);
  const out: Finding[] = [];
  const err = (code: string, message: string) => out.push({ level: 'error', code, message });
  const warn = (code: string, message: string) => out.push({ level: 'warn', code, message });

  // The record holds only what its layout has (`advance` moves the rest to the scratch area's stray/ before the verdict),
  // and each probe id once (`advance` renumbers the later of two).
  for (const s of strayFiles(p)) warn('stray-file', `${s.file} is not part of a story's record: it belongs in ${s.home}`);
  for (const id of duplicateProbeIds(p)) warn('probe-id-twice', `${id} is in the story's probe logs more than once (two branches merged): heldout advance gives the later one a new id`);

  const contract = readContract(p.contract);
  if (!contract) { err('no-contract', `No requirement contract (${rel(p.contract)}) — phase 1b comes first: heldout contract KEY --pack, then the extractor and reviewer subagents`); return out; }
  const tests = opts.draft ? p.tests : currentTests(p);
  const specs = specFiles(tests);
  if (!specs.length) { err('no-tests', `No *.spec.ts under ${rel(tests)}/ — heldout advance generates them from the contract's checks`); return out; }
  const f = readSuite(tests, contract);
  if (!f.acs.length) err('no-acs', 'The contract has no acceptance criteria.');

  // The contract as checked and reviewed: its errors only (its warnings are the extractor's and the reviewer's).
  for (const x of checkContract(contract, p.requirement, { hasApiBase: Boolean(cfg.aut.apiBaseURL ?? cfg.aut.baseURL), apiBaseURL: cfg.aut.apiBaseURL ?? cfg.aut.baseURL, knowledgeIds: knowledgeIds(cfg) })) if (x.level === 'error') out.push({ ...x, code: `contract/${x.code}` });
  for (const x of checkReview(contract, readReview(p.review), { requireReview: true }).filter((r) => r.code !== 'review-observation')) out.push({ ...x, code: `contract/${x.code}` });
  for (const n of contract.nonFunctional ?? []) {
    if (!f.scenarios.some((s) => s.nfrs.includes(n.id))) warn('nfr-not-verified', `${n.id} is not verified by any test: the verdict lists it as not verified (at most PASS WITH WARNINGS)`);
  }
  for (const ac of f.acs) if (!f.scenarios.some((s) => s.acs.includes(ac.id))) warn('ac-uncovered', `${ac.id} has no check, so no test`);
  for (const e of typeErrors(tests)) err('spec-type-error', e);

  const src = specs.map((s) => fs.readFileSync(s, 'utf8')).join('\n');
  const journeys = journeysUsedBy(cfg, cfg.autId, specs);
  const journeySrc = journeys.map((a) => fs.readFileSync(a, 'utf8'));
  // A control character in source (a "\b" that became a backspace through a shell edit) silently changes a regex.
  for (const s of [...specs, ...journeys]) {
    const lines = fs.readFileSync(s, 'utf8').split('\n');
    const bad = lines.map((l, i) => (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(l) ? i + 1 : 0)).filter(Boolean);
    if (bad.length) err('control-character', `${rel(s)} line(s) ${bad.slice(0, 5).join(', ')} contain a control character — likely an escape (\\b, \\t) mangled by a shell edit`);
  }
  // The journeys the tests use: HOW only, never an expected value (they are not frozen with the tests), one file per domain.
  for (const x of lintJourneys(journeys, contract, journeyPaths(cfg, cfg.autId).base)) out.push({ ...x, code: `journeys/${x.code}` });
  // A journey this story adds (not in the registry yet) that makes the same calls as one already there: reuse that one.
  const registry = readRegistry(cfg, cfg.autId).journeys;
  for (const group of duplicateJourneys(allJourneys(cfg, cfg.autId))) {
    const added = group.filter((j) => !registry[j.id]);
    const known = group.filter((j) => registry[j.id]);
    if (added.length && known.length) warn('journeys/possible-duplicate', `${added.map((j) => j.id).join(', ')} (new) ${added.length > 1 ? 'do' : 'does'} what ${known.map((j) => j.id).join(', ')} already ${known.length > 1 ? 'do' : 'does'} (${describeJourney(known[0])}) — call the existing journey, from the test or from the new journey, instead of repeating its calls`);
  }
  const todo = [src, ...journeySrc].reduce((n, s) => n + (s.match(/TODO\(harden\)/g) ?? []).length, 0);
  if (todo) (opts.allowUnhardened ? warn : err)('unhardened', `${todo} TODO(harden) marker(s) remain (in the spec or the journey files it uses)`);
  // Once the tests run, the log says which browser/API tiers were used; the verdict quotes it.
  if (!opts.allowUnhardened && fs.existsSync(p.hardeningLog) && !/^\*\*Tiers? used:\*\*[ \t]*\S/m.test(fs.readFileSync(p.hardeningLog, 'utf8'))) {
    err('hardening-log-empty', `${rel(p.hardeningLog)} has no "Tiers used" — record the tiers you used and what you changed before the evaluation run (the verdict quotes it)`);
  }
  if (/\bwaitForTimeout\(/.test(src)) warn('hard-wait', 'page.waitForTimeout() found — wait for what you act on instead');
  if (/\btest\.(only|fixme)\(|\.skip\(/.test(src)) err('focused-or-skipped', 'test.only / test.fixme / skip found — every test of the requirement must run');

  // Accounts with roles: a step that asks for "an account" without one may be handed any kind of user.
  const roles = accountRoles(cfg.aut.accounts);
  const roleless = [src, ...journeySrc].join('\n').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').match(/\bseed\.account\(\s*(?:(['"`])[^'"`]*\1\s*)?\)/g) ?? [];
  if (roles.size && roleless.length) warn('account-without-role', `${roleless.length} seed.account() call(s) ask for no role, so they may get any of the profile's accounts (${[...roles.keys()].join(', ')}) — pass the kind of user the step needs: seed.account('admin', { role: '${[...roles.keys()][0]}' })`);

  const testData = path.join(tests, 'test-data.json');
  if (fs.existsSync(testData)) {
    const refs = [...fs.readFileSync(testData, 'utf8').matchAll(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((m) => m[1]);
    for (const name of new Set(refs)) if (process.env[name] === undefined) err('env-missing', `test-data.json needs \${env:${name}} — set it in .env`);
  }
  return out;
}

export interface HealthResult { url: string; ok: boolean; status?: number; ms: number; error?: string; samples?: number[]; slow?: boolean }

async function probeOnce(url: string, timeoutMs: number): Promise<{ ok: boolean; status?: number; ms: number; error?: string }> {
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
    // 429 = the host is rate-limiting us: tests would fail on the limit, not on the application.
    return { ok: res.status < 500 && res.status !== 429, status: res.status, ms: Date.now() - started, ...(res.status === 429 ? { error: `rate limited (429${res.headers.get('retry-after') ? `, retry after ${res.headers.get('retry-after')} s` : ''}) — wait, then run again` } : {}) };
  } catch (e) {
    const cause = (e as { cause?: { code?: string; message?: string } }).cause;
    return { ok: false, ms: Date.now() - started, error: `${(e as Error).message}${cause ? ` (${cause.code ?? cause.message})` : ''}` };
  }
}

/**
 * Health = reachable AND responsive. Each URL is sampled `samples` times sequentially (a single sample
 * hides bimodal latency, e.g. sandboxes that stall every few requests). `ms` is the SLOWEST sample;
 * `slow` is set when it exceeds the profile's healthSlowMs (default 5000). One failed sample is
 * retried after a short backoff so a single network blip does not count as an outage.
 */
export async function healthcheck(cfg: HeldoutConfig, samples = 3): Promise<HealthResult[]> {
  const checks = cfg.aut.healthcheck?.length ? cfg.aut.healthcheck : ['/'];
  const slowMs = (cfg.aut as { healthSlowMs?: number }).healthSlowMs ?? 5000;
  return Promise.all(checks.map(async (c) => {
    const url = c.startsWith('api:') ? resolveUrl(cfg.aut.apiBaseURL ?? cfg.aut.baseURL, c.slice(4)) : resolveUrl(cfg.aut.baseURL, c);
    const results = [];
    for (let i = 0; i < samples; i++) {
      let r = await probeOnce(url, 20_000);
      if (!r.ok) { await new Promise((res) => setTimeout(res, 3_000)); r = await probeOnce(url, 20_000); }
      results.push(r);
      if (!r.ok || r.ms > slowMs) break; // verdict already known (down or degraded) — don't keep waiting
    }
    const failed = results.find((r) => !r.ok);
    const ms = Math.max(...results.map((r) => r.ms));
    return {
      url, ok: !failed, status: (failed ?? results.at(-1))?.status, ms, samples: results.map((r) => r.ms),
      slow: !failed && ms > slowMs, error: failed?.error ?? (ms > slowMs ? `slow: ${results.map((r) => r.ms).join('/')} ms` : undefined),
    };
  }));
}

export function printFindings(findings: Finding[]): void {
  if (!findings.length) { console.log('  ✔ lint clean'); return; }
  for (const f of findings) console.log(`  ${f.level === 'error' ? '✖' : '⚠'} [${f.code}] ${f.message}`);
}

/**
 * TypeScript errors in one story's specs (a draft that doesn't compile can't be frozen or run). Checks only those files,
 * with the project's compiler options, through a temporary tsconfig that extends the project's.
 */
export function typeErrors(testsDir: string): string[] {
  const tsc = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
  const project = path.join(ROOT, 'tsconfig.json');
  const files = specFiles(testsDir);
  if (!files.length || !fs.existsSync(tsc) || !fs.existsSync(project)) return [];
  const tmp = path.join(ROOT, `.heldout-tsc-${process.pid}.json`); // beside the project config: type roots resolve from there
  fs.writeFileSync(tmp, JSON.stringify({ extends: project, compilerOptions: { noEmit: true }, include: [], files }));
  try {
    const r = spawnSync(process.execPath, [tsc, '-p', tmp], { encoding: 'utf8', cwd: ROOT });
    return (r.stdout ?? '').split(/\r?\n/).filter((l) => /error TS\d+/.test(l)).map((l) => l.replace(ROOT + path.sep, '').trim()).slice(0, 10);
  } finally { fs.rmSync(tmp, { force: true }); }
}
