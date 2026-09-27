/**
 * Preflight gates run before every official run (scripts/run.ts) and on demand (scripts/lint.ts):
 *   1. Traceability lint — requirement ⇄ scenarios ⇄ tests ⇄ [REQ] assertions are consistent.
 *   2. AUT healthcheck   — the target is reachable, so environment noise never reaches triage.
 */
import fs from 'node:fs';
import path from 'node:path';
import { evalPaths, rel, resolveUrl, type HeldoutConfig } from './config';
import { checkContract, checkFeatureAgainstContract, readContract } from './contract';
import { checkReview, readReview } from './evidence';
import { TEST_TYPES, baseScenarioId, normaliseTestType, readFeature } from './gherkin';

export interface Finding { level: 'error' | 'warn'; code: string; message: string }

const specFiles = (dir: string): string[] => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.spec.ts')).map((f) => path.join(dir, f))
  : []);

/** Scenario ids referenced by test titles, including template-literal outlines (`SCN-006.${i + 1}: …`). */
export function testIdsIn(source: string): Set<string> {
  return new Set([...source.matchAll(/\btest(?:\.\w+)?\(\s*[`'"](SCN-\d+)/g)].map((m) => m[1]));
}

/** Static tags per scenario id: test('SCN-003: …', { tag: ['@AC-3', '@type:negative'] }, …). */
export function testTagsIn(source: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const m of source.matchAll(/\btest(?:\.\w+)?\(\s*[`'"](SCN-\d+)[^\n]*?\{\s*tag:\s*\[([^\]]*)\]/g)) {
    const tags = [...m[2].matchAll(/['"`](@[^'"`]+)['"`]/g)].map((t) => t[1]);
    out.set(m[1], [...new Set([...(out.get(m[1]) ?? []), ...tags])]);
  }
  return out;
}

export function lintEvaluation(cfg: HeldoutConfig, key: string, opts: { allowUnhardened?: boolean } = {}): Finding[] {
  const p = evalPaths(cfg, key);
  const out: Finding[] = [];
  const err = (code: string, message: string) => out.push({ level: 'error', code, message });
  const warn = (code: string, message: string) => out.push({ level: 'warn', code, message });

  if (!fs.existsSync(p.evaluationMeta)) warn('no-aut-binding', `No evaluation.json — using default AUT profile "${cfg.defaultAut}". Bind the story explicitly: {"key":"${key}","aut":"<profile>"}`);
  if (!fs.existsSync(p.scenarios)) { err('no-scenarios', 'scenarios.feature is missing'); return out; }
  const f = readFeature(p.scenarios);
  if (!f.acs.length) err('no-acs', 'No "# AC-n:" lines in scenarios.feature — acceptance criteria drive coverage.');

  const ids = new Map<string, number>();
  for (const s of f.scenarios) {
    ids.set(s.id, (ids.get(s.id) ?? 0) + 1);
    if (!s.acs.length) err('scenario-without-ac', `${s.id} has no @AC-n tag`);
    for (const ac of s.acs) if (!f.acs.some((a) => a.id === ac)) err('unknown-ac', `${s.id} is tagged @${ac}, which is not in the AC list`);
    if (s.outline && s.examples.length < 2) err('outline-without-examples', `${s.id} is a Scenario Outline without Examples rows`);
    if (!s.steps.some((x) => /^Then\b/.test(x))) warn('no-then', `${s.id} has no Then step (nothing observable is asserted)`);
    for (const d of s.depends) if (!f.scenarios.some((x) => x.id === d)) err('unknown-depends', `${s.id} is tagged @depends:${d}, which is not a scenario in this feature`);
    if (!s.sources.length) warn('no-source', `${s.id} has no "# from <story section / attachment>" line above it — the verdict cannot trace it to a requirement source`);
    if (!s.rawType) err('scenario-without-type', `${s.id} has no @type:<t> tag (one of ${TEST_TYPES.join(', ')})`);
    else if (!s.testType) err('unknown-type', `${s.id} has @type:${s.rawType}, not in the taxonomy (${TEST_TYPES.join(', ')})`);
  }
  for (const [id, n] of ids) if (n > 1) err('duplicate-scenario-id', `${id} is used by ${n} scenarios`);

  // Requirement contract (phase 1b): the feature must agree with the normalised, source-anchored requirement.
  const contract = readContract(p.base);
  if (!contract) err('no-contract', 'No requirement-contract.json — phase 1b comes first: heldout contract KEY --pack, then the extractor and reviewer subagents');
  else {
    // By preflight time the user has been asked; open gaps must be surfaced in the feature instead.
    for (const x of checkContract(contract, p.requirement, { hasApiBase: Boolean(cfg.aut.apiBaseURL ?? cfg.aut.baseURL) })) {
      // An assumed oracle value that the feature already surfaces as "# ASSUMPTION: G<n>" needs no further warning.
      const gap = x.code === 'oracle-assumed' ? x.message.match(/^(G\d+):/)?.[1] : undefined;
      if (gap && f.assumptions.some((a) => a.startsWith(gap))) continue;
      out.push({ ...x, code: `contract/${x.code}` });
    }
    // Independent review: required, current (hash-bound) and without findings.
    // Reviewer observations are notes for the contract's builder (shown by `heldout contract`), not test-suite problems.
    for (const x of checkReview(contract, readReview(p.base), { requireReview: true }).filter((f) => f.code !== 'review-observation')) out.push({ ...x, code: `contract/${x.code}` });
    out.push(...checkFeatureAgainstContract(contract, f));
  }
  for (const ac of f.acs) if (!f.scenarios.some((s) => s.acs.includes(ac.id))) warn('ac-uncovered', `${ac.id} is not covered by any scenario`);

  const specs = specFiles(p.tests);
  if (!specs.length) { err('no-tests', `No *.spec.ts under tests/`); return out; }
  const src = specs.map((s) => fs.readFileSync(s, 'utf8')).join('\n');
  // A control character in source (a "\b" that became a backspace through a shell edit) silently changes a regex.
  for (const s of specs) {
    const lines = fs.readFileSync(s, 'utf8').split('\n');
    const bad = lines.map((l, i) => (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(l) ? i + 1 : 0)).filter(Boolean);
    if (bad.length) err('control-character', `${rel(s)} line(s) ${bad.slice(0, 5).join(', ')} contain a control character — likely an escape (\\b, \\t) mangled by a shell edit`);
  }
  const testIds = testIdsIn(src);
  for (const s of f.scenarios) if (!testIds.has(s.id)) err('scenario-without-test', `${s.id} "${s.title}" has no test`);
  for (const id of testIds) if (!f.scenarios.some((s) => s.id === baseScenarioId(id))) err('test-without-scenario', `Test ${id} has no scenario in scenarios.feature`);
  const tags = testTagsIn(src);
  for (const s of f.scenarios.filter((x) => testIds.has(x.id))) {
    const t = tags.get(s.id);
    if (!t) { err('test-without-tags', `${s.id}: test has no { tag: [...] } — add its @AC-n and @type:<t> tags`); continue; }
    const missingAcs = s.acs.filter((ac) => !t.includes(`@${ac}`));
    if (missingAcs.length) err('test-ac-tags', `${s.id}: test tags miss ${missingAcs.map((a) => `@${a}`).join(', ')} (from the scenario)`);
    const testType = normaliseTestType(t.find((x) => x.startsWith('@type:'))?.slice(6));
    if (s.testType && testType !== s.testType) err('test-type-tag', `${s.id}: test must be tagged @type:${s.testType} (scenario type), found ${t.find((x) => x.startsWith('@type:')) ?? 'none'}`);
  }
  for (const ac of f.acs) {
    const covered = f.scenarios.some((s) => s.acs.includes(ac.id));
    if (covered && !new RegExp(`\\[REQ [^\\]]*\\b${ac.id}\\b`).test(src)) err('ac-without-req-assertion', `${ac.id} has scenarios but no "[REQ ${ac.id}]" assertion in the spec — write the tag literally in each assertion message (a helper that builds it from a variable also hides the assertion from the integrity freeze)`);
  }
  const stubs = (src.match(/TODO\(scenario\)/g) ?? []).length + (fs.readFileSync(p.scenarios, 'utf8').match(/TODO\(scenario\)/g) ?? []).length;
  if (stubs) err('unfinished-scaffold', `${stubs} TODO(scenario) marker(s) from "heldout scaffold" remain in scenarios.feature / the spec — write the journeys and assertions`);
  const todo = (src.match(/TODO\(harden\)/g) ?? []).length;
  if (todo) (opts.allowUnhardened ? warn : err)('unhardened', `${todo} TODO(harden) marker(s) remain`);
  if (/\bwaitForTimeout\(/.test(src)) warn('hard-wait', 'page.waitForTimeout() found — use web-first assertions instead');
  if (/\btest\.(only|fixme)\(|\.skip\(/.test(src)) err('focused-or-skipped', 'test.only / test.fixme / skip found — requirement scenarios must all run');

  // Entry point: UI/e2e journeys must say where they start (a Given, directly or via Background).
  for (const s of f.scenarios.filter((x) => x.layer !== 'api')) {
    const first = [...f.background, ...s.steps][0] ?? '';
    if (!/^Given\b/.test(first)) warn('no-entry-point', `${s.id} starts with "${first.slice(0, 50)}" — state the entry point / preconditions as a Given (deep-link to the page under test unless navigation is part of the AC)`);
  }
  // Data preconditions ("Given … exists / I am signed in / I created …") should be seeded, not assumed.
  // Only the Given block counts: an "And" after a Then is an outcome ("And the list shows Created"), not a precondition.
  const givens = (steps: string[]) => { const out: string[] = []; let inGiven = false; for (const st of steps) { if (/^Given\b/.test(st)) inGiven = true; else if (/^(When|Then)\b/.test(st)) inGiven = false; if (inGiven && /^(Given|And|But)\b/.test(st)) out.push(st); } return out; };
  const needsData = f.scenarios.filter((x) => givens([...f.background, ...x.steps]).some((st) => /\b(exists?|created|signed in|have added|know (the|an) id|registered)\b/i.test(st)));
  // Lookups ("I know the id of …") are satisfied by seed.step; data by seed.create/track; auth by seed.once.
  if (needsData.length && !/\bseed\.(create|track|step|once|until|account)\(/.test(src)) {
    warn('no-seeding', `${needsData.length} scenario(s) have data/state preconditions (${needsData.slice(0, 4).map((x) => x.id).join(', ')}…) but the spec never uses seed.* — seed data via the API (seed.create), look ids up with seed.step, so setup failures read as BLOCKED`);
  }

  // An assertion whose message starts from a variable (a local helper building "[REQ …]") is invisible to the integrity
  // freeze: its expected value could change unnoticed. expectResponse() or a literal message keeps it frozen.
  const hidden = [...src.matchAll(/expect(?:\.soft)?\([^;]*?,\s*`\$\{/g)].length;
  if (hidden) warn('req-message-not-literal', `${hidden} assertion(s) take their message from a variable (e.g. a helper that builds "[REQ …]"), so the integrity freeze can't see them — use expectResponse(res, { status, body }, '[REQ AC-n] …') for API answers, or write the [REQ] message literally`);

  for (const ep of f.endpoints) {
    const prefix = ep.path.split(/[{:]/)[0].replace(/\/+$/, '');
    // The profile's accounts recipe calls endpoints on the tests' behalf (seed.account()).
    if (prefix && !src.includes(prefix) && !JSON.stringify(cfg.aut.accounts ?? {}).includes(prefix)) warn('endpoint-unused', `Declared endpoint ${ep.method} ${ep.path} is not referenced by any test`);
  }

  if (fs.existsSync(p.testData)) {
    const refs = [...fs.readFileSync(p.testData, 'utf8').matchAll(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((m) => m[1]);
    for (const name of new Set(refs)) if (process.env[name] === undefined) err('env-missing', `test-data.json needs \${env:${name}} — set it in .env`);
  }
  return out;
}

/**
 * Rewrite each test's { tag: [...] } so it carries its scenario's @AC-n, @type:<t> and @layer:<l>
 * (keeps any other tags). Tags are traceability metadata, not assertions — integrity is unaffected.
 * Returns the number of tag arrays changed.
 */
export function syncTestTags(cfg: HeldoutConfig, key: string): number {
  const p = evalPaths(cfg, key);
  const f = readFeature(p.scenarios);
  let changed = 0;
  for (const file of specFiles(p.tests)) {
    const src = fs.readFileSync(file, 'utf8');
    const next = src.replace(/(\btest(?:\.\w+)?\(\s*[`'"](SCN-\d+)[^\n]*?\{\s*tag:\s*)\[([^\]]*)\]/g, (all, head: string, id: string, list: string) => {
      const s = f.scenarios.find((x) => x.id === id);
      if (!s) return all;
      const existing = [...list.matchAll(/['"`](@[^'"`]+)['"`]/g)].map((t) => t[1]);
      const keep = existing.filter((t) => !/^@AC-\d+$/.test(t) && !t.startsWith('@type:') && !t.startsWith('@layer:') && !['@ui', '@api', '@e2e', '@a11y'].includes(t));
      const tags = [...s.acs.map((a) => `@${a}`), ...(s.testType ? [`@type:${s.testType}`] : []), ...(s.layer ? [`@layer:${s.layer}`] : []), ...keep];
      const rendered = `[${tags.map((t) => `'${t}'`).join(', ')}]`;
      if (rendered !== `[${list}]`) changed++;
      return `${head}${rendered}`;
    });
    if (next !== src) fs.writeFileSync(file, next);
  }
  return changed;
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
