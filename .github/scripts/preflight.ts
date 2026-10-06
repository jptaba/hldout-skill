/**
 * Preflight gates run before every official run (scripts/run.ts) and on demand (scripts/lint.ts):
 *   1. Traceability lint — contract ⇄ tests ⇄ [REQ] assertions are consistent, and the journeys hold no oracle.
 *   2. AUT healthcheck   — the target is reachable, so environment noise never reaches triage.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, evalPaths, journeyPaths, rel, resolveUrl, type HeldoutConfig } from './config';
import { checkContract, checkSuiteAgainstContract, readContract } from './contract-model';
import { checkReview, readReview } from './evidence';
import { journeysUsedBy, lintJourneys } from './journeys-store';
import { TEST_TYPES, readSuite, specFiles, type Scenario, type TestType } from './spec-model';

export interface Finding { level: 'error' | 'warn'; code: string; message: string }

/**
 * What a test of a type has to do, checked on its own code (helpers it calls may do more, so this only warns):
 * concurrency sends requests together, idempotency sends the same request again, composition chains criteria,
 * integration drives the page and reads the API, boundary is a table of cases or names its limit value.
 */
export function typeMismatch(type: TestType, s: Pick<Scenario, 'code' | 'acs' | 'outline' | 'title' | 'steps'>): string | undefined {
  const code = s.code;
  switch (type) {
    case 'concurrency': return /Promise\.(all|allSettled)\(|parallel/.test(code) ? undefined : 'its code sends no requests together (Promise.all)';
    case 'idempotency': return /again|twice|repeat|second|retr(y|ies)|\bfor\s*\(|\.map\(/i.test(`${code}\n${s.steps.join('\n')}`) ? undefined : 'nothing in it sends the same request again';
    case 'composition': return s.acs.length >= 2 ? undefined : 'it chains no other criterion (a composition carries the @AC-n of every step it chains)';
    case 'integration': return /\bpage\b/.test(code) && /\bapi\b/.test(code) ? undefined : 'it does not drive the page and read the API both';
    case 'boundary': return s.outline || /\d/.test(s.title) ? undefined : 'it is neither a table of cases nor names the limit value it tries';
    default: return undefined;
  }
}

export function lintEvaluation(cfg: HeldoutConfig, key: string, opts: { allowUnhardened?: boolean } = {}): Finding[] {
  const p = evalPaths(cfg, key);
  const out: Finding[] = [];
  const err = (code: string, message: string) => out.push({ level: 'error', code, message });
  const warn = (code: string, message: string) => out.push({ level: 'warn', code, message });

  // Requirement contract (phase 1b): the tests are written from it, and its criteria drive coverage.
  const contract = readContract(p.base);
  if (!contract) { err('no-contract', 'No requirement-contract.json — phase 1b comes first: heldout contract KEY --pack, then the extractor and reviewer subagents'); return out; }
  const specs = specFiles(p.tests);
  if (!specs.length) { err('no-tests', 'No *.spec.ts under tests/ — the heldout-test-author subagent writes them from the contract'); return out; }
  const f = readSuite(p.tests, contract);
  if (!f.acs.length) err('no-acs', 'The contract has no acceptance criteria — they drive coverage.');

  for (const s of f.scenarios) {
    if (!s.acs.length && !s.nfrs.length) err('test-without-ac', `${s.id} has no @AC-n (or @NFR-n) tag`);
    for (const ac of s.acs) if (!f.acs.some((a) => a.id === ac)) err('unknown-ac', `${s.id} is tagged @${ac}, which is not a criterion of the contract`);
    if (s.declarations > 1) err('duplicate-scenario-id', `${s.id} is the id of ${s.declarations} tests — give each test its own SCN id (a table of cases is SCN-nnn.\${i + 1})`);
    if (!s.steps.some((x) => /^Then\b/.test(x))) warn('no-then', `${s.id} has no journey.step('Then …') (nothing observable is asserted)`);
    for (const d of s.depends) if (!f.scenarios.some((x) => x.id === d)) err('unknown-depends', `${s.id} is tagged @depends:${d}, which is not a test of this story`);
    if (!s.sources.length) warn('no-source', `${s.id} has no "// from <story section / linked page>" line above its test — the verdict cannot trace it to a requirement source`);
    if (!s.rawType) err('test-without-type', `${s.id} has no @type:<t> tag (one of ${TEST_TYPES.join(', ')})`);
    else if (!s.testType) err('unknown-type', `${s.id} has @type:${s.rawType}, not in the taxonomy (${TEST_TYPES.join(', ')})`);
    if (new Set(s.rawTypes).size > 1) err('several-types', `${s.id} has ${s.rawTypes.map((t) => `@type:${t}`).join(' and ')} — one type: what the test truly proves. If it fits two, take the more specific (${TEST_TYPES.join(' › ')}); if it proves two things, make it two tests`);
    // Is the type what the test truly is? Cheap signs from the test's own code; a warning to re-check, not a verdict.
    const mismatch = s.testType && typeMismatch(s.testType, s);
    if (mismatch) warn('type-mismatch', `${s.id} is @type:${s.testType}, but ${mismatch} — re-check its type (references/test-authoring.md "Choosing the type")`);
  }

  // By preflight time the user has been asked; open gaps must be surfaced in the specs instead.
  for (const x of checkContract(contract, p.requirement, { hasApiBase: Boolean(cfg.aut.apiBaseURL ?? cfg.aut.baseURL), apiBaseURL: cfg.aut.apiBaseURL ?? cfg.aut.baseURL })) {
    // An assumed oracle value that the specs already surface as "// ASSUMPTION: G<n>" needs no further warning.
    const gap = x.code === 'oracle-assumed' ? x.message.match(/^(G\d+):/)?.[1] : undefined;
    if (gap && f.assumptions.some((a) => a.startsWith(gap))) continue;
    // An open oracle question the specs already surface (OPEN-QUESTION line, or every affected test tagged
    // @needs-clarification) is handled.
    const open = x.code === 'oracle-gap-open' ? contract.gaps.find((g) => x.message.startsWith(`${g.id} `)) : undefined;
    if (open && (f.openQuestions.some((q) => q.startsWith(open.id)) || f.scenarios.filter((s) => s.acs.some((a) => open.affects.includes(a))).every((s) => s.needsClarification))) continue;
    out.push({ ...x, code: `contract/${x.code}` });
  }
  // Independent review: required, current (hash-bound) and without findings.
  // Reviewer observations are notes for the contract's builder (shown by `heldout contract`), not test-suite problems.
  for (const x of checkReview(contract, readReview(p.base), { requireReview: true }).filter((r) => r.code !== 'review-observation')) out.push({ ...x, code: `contract/${x.code}` });
  out.push(...checkSuiteAgainstContract(contract, f));
  // A non-functional requirement the story states is verified by a test tagged @NFR-n, or reported as not verified.
  for (const n of contract.nonFunctional ?? []) {
    if (!f.scenarios.some((s) => s.nfrs.includes(n.id))) warn('nfr-not-verified', `${n.id} is not verified by any test — tag the test that checks it @${n.id}; otherwise the verdict lists it as not verified (at most PASS WITH WARNINGS)`);
  }
  for (const e of typeErrors(p.tests)) err('spec-type-error', e);
  for (const ac of f.acs) if (!f.scenarios.some((s) => s.acs.includes(ac.id))) warn('ac-uncovered', `${ac.id} is not covered by any test`);

  const src = specs.map((s) => fs.readFileSync(s, 'utf8')).join('\n');
  const journeys = journeysUsedBy(cfg, cfg.autId, specs);
  const journeySrc = journeys.map((a) => fs.readFileSync(a, 'utf8'));
  // A control character in source (a "\b" that became a backspace through a shell edit) silently changes a regex.
  for (const s of [...specs, ...journeys]) {
    const lines = fs.readFileSync(s, 'utf8').split('\n');
    const bad = lines.map((l, i) => (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(l) ? i + 1 : 0)).filter(Boolean);
    if (bad.length) err('control-character', `${rel(s)} line(s) ${bad.slice(0, 5).join(', ')} contain a control character — likely an escape (\\b, \\t) mangled by a shell edit`);
  }
  for (const ac of f.acs) {
    const covered = f.scenarios.some((s) => s.acs.includes(ac.id));
    if (covered && !new RegExp(`\\[REQ [^\\]]*\\b${ac.id}\\b`).test(src)) err('ac-without-req-assertion', `${ac.id} has tests but no "[REQ ${ac.id}]" assertion in the spec — write the tag literally in each assertion message (a helper that builds it from a variable also hides the assertion from the integrity freeze)`);
  }
  const stubs = (src.match(/TODO\(test\)/g) ?? []).length;
  if (stubs) err('unfinished-scaffold', `${stubs} TODO(test) marker(s) from "heldout scaffold" remain in the spec — write the journeys and assertions`);
  // The journeys the tests use: HOW only, never an expected value (they are not frozen with the tests), one file per domain.
  for (const x of lintJourneys(journeys, contract, journeyPaths(cfg, cfg.autId).base)) out.push({ ...x, code: `journeys/${x.code}` });
  const todo = [src, ...journeySrc].reduce((n, s) => n + (s.match(/TODO\(harden\)/g) ?? []).length, 0);
  if (todo) (opts.allowUnhardened ? warn : err)('unhardened', `${todo} TODO(harden) marker(s) remain (in the spec or the journey files it uses)`);
  // Once hardened, the log says which browser/API tiers were used; the verdict quotes it.
  if (!opts.allowUnhardened && fs.existsSync(p.hardeningLog) && !/^\*\*Tiers? used:\*\*[ \t]*\S/m.test(fs.readFileSync(p.hardeningLog, 'utf8'))) {
    err('hardening-log-empty', `${rel(p.hardeningLog)} has no "Tiers used" — record the tiers you used and what hardening changed before the evaluation run (the verdict quotes it)`);
  }
  if (/\bwaitForTimeout\(/.test(src)) warn('hard-wait', 'page.waitForTimeout() found — use web-first assertions instead');
  if (/\btest\.(only|fixme)\(|\.skip\(/.test(src)) err('focused-or-skipped', 'test.only / test.fixme / skip found — every test of the requirement must run');

  // Entry point: UI/e2e journeys must say where they start (a Given step first).
  for (const s of f.scenarios.filter((x) => x.layer !== 'api')) {
    const first = s.steps[0] ?? '';
    if (!/^Given\b/.test(first)) warn('no-entry-point', `${s.id} starts with "${first.slice(0, 50)}" — state the entry point / preconditions as a journey.step('Given …') (deep-link to the page under test unless navigation is part of the AC)`);
  }
  // Data preconditions ("Given … exists / I am signed in / I created …") should be seeded, not assumed.
  // Only the Given block counts: an "And" after a Then is an outcome ("And the list shows Created"), not a precondition.
  const givens = (steps: string[]) => { const out: string[] = []; let inGiven = false; for (const st of steps) { if (/^Given\b/.test(st)) inGiven = true; else if (/^(When|Then)\b/.test(st)) inGiven = false; if (inGiven && /^(Given|And|But)\b/.test(st)) out.push(st); } return out; };
  const needsData = f.scenarios.filter((x) => givens(x.steps).some((st) => /\b(exists?|created|signed in|have added|know (the|an) id|registered)\b/i.test(st)));
  // Lookups ("I know the id of …") are satisfied by seed.step; data by seed.create/track; auth by seed.once — in the
  // spec or in the journeys it calls.
  const seeding = [src, ...journeySrc].some((s) => /\bseed\.(create|track|step|once|until|account)\(/.test(s));
  if (needsData.length && !seeding) {
    warn('no-seeding', `${needsData.length} test(s) have data/state preconditions (${needsData.slice(0, 4).map((x) => x.id).join(', ')}…) but neither the spec nor its journeys use seed.* — seed data via the API (seed.create), look ids up with seed.step, so setup failures read as BLOCKED`);
  }

  // An assertion whose message starts from a variable (a local helper building "[REQ …]") is invisible to the integrity
  // freeze: its expected value could change unnoticed. expectResponse() or a literal message keeps it frozen.
  const hidden = [...src.matchAll(/expect(?:\.soft)?\([^;]*?,\s*`\$\{/g)].length;
  if (hidden) warn('req-message-not-literal', `${hidden} assertion(s) take their message from a variable (e.g. a helper that builds "[REQ …]"), so the integrity freeze can't see them — use expectResponse(res, { status, body }, '[REQ AC-n] …') for API answers, or write the [REQ] message literally`);

  const used = [src, ...journeySrc].join('\n');
  for (const ep of f.endpoints) {
    const prefix = ep.path.split(/[{:]/)[0].replace(/\/+$/, '');
    // The profile's accounts recipe calls endpoints on the tests' behalf (seed.account()), and so do journeys.
    if (prefix && !used.includes(prefix) && !JSON.stringify(cfg.aut.accounts ?? {}).includes(prefix)) warn('endpoint-unused', `Declared endpoint ${ep.method} ${ep.path} is not referenced by any test or journey it uses`);
  }

  if (fs.existsSync(p.testData)) {
    const refs = [...fs.readFileSync(p.testData, 'utf8').matchAll(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((m) => m[1]);
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
  if (!findings.length) { console.log('  ✔ traceability lint clean'); return; }
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
