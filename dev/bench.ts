/**
 * The benchmark, for the skill's developers (this repository only, never copied by init): an application whose
 * defects are switched on per run, stories nobody tuned the skill on, an evaluation run without a person, and a
 * score that compares exactly. docs/optimization-plan.md, phase 0, says why.
 *
 *   npx tsx dev/bench.ts up                      start the application and the fault proxy, with fresh data
 *   npx tsx dev/bench.ts down                    stop both and remove the data
 *   npx tsx dev/bench.ts reset                   fresh data, every fault off
 *   npx tsx dev/bench.ts faults [F01,F02|none]   show which faults are on, or switch exactly these on
 *   npx tsx dev/bench.ts new <run> [--stories SHOP-1,SHOP-2] [--no-overview]
 *        a project of its own in $HELDOUT_ROUNDS_DIR/<run>: set up from this clone, the application's accounts,
 *        the stories in its mock Jira (default: every story with a key), and the application's overview, written
 *        by an agent as setup asks
 *   npx tsx dev/bench.ts eval <run> <KEY> [--faults F01,F02|none]
 *        switch the story's faults on (default: all its key lists) and evaluate it with the agent app's command
 *        line, nobody watching; what the app says it cost is kept. Run it again to go on after a usage limit
 *   npx tsx dev/bench.ts score <run> <KEY>       run the story's tests again with no fault and with each fault
 *        alone, and score the verdict against the faults that were on
 *   npx tsx dev/bench.ts report [<run> …]        the scores and costs side by side, and how far unchanged runs differ
 *
 * One evaluation or score at a time: the faults are switched for the whole application. The application, its
 * accounts and how its data is made fresh are in demo/bench/app.json; the demo accounts' password comes from the
 * environment variable it names. A run's bench files are in <project>/.bench/.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONTROL } from './bench/proxy';
import { keyNames, readKey, score, type Evidence, type Finding, type Score } from './bench/score';
import { newRound, roundProject } from './round';

const REPO = path.resolve(import.meta.dirname, '..');
interface App { name: string; baseUrl: string; apiBaseUrl: string; upstream: string; composeProject: string; freshData: string[]; passwordEnv: string; accounts: { username: string; role: string; shared?: boolean }[] }
const app = JSON.parse(fs.readFileSync(path.join(REPO, 'demo', 'bench', 'app.json'), 'utf8')) as App;
const PID_FILE = path.join(os.tmpdir(), 'heldout-bench-proxy.pid');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** What one headless run of the agent app reported. */
export interface AgentResult { is_error?: boolean; result?: string; total_cost_usd?: number; duration_ms?: number; num_turns?: number; permission_denials?: unknown[]; modelUsage?: Record<string, { inputTokens?: number; outputTokens?: number; cacheReadInputTokens?: number; cacheCreationInputTokens?: number }> }
export interface Cost { usd: number; minutes: number; turns: number; runs: number; newTokens: number; outputTokens: number; cachedTokens: number }

/** The cost of a story: every headless run it took, added up. New tokens are what the model read for the first time or wrote. */
export function costOf(results: AgentResult[]): Cost {
  const usage = results.flatMap((r) => Object.values(r.modelUsage ?? {}));
  const sum = (f: (u: (typeof usage)[number]) => number | undefined) => usage.reduce((a, u) => a + (f(u) ?? 0), 0);
  return {
    usd: Math.round(results.reduce((a, r) => a + (r.total_cost_usd ?? 0), 0) * 100) / 100,
    minutes: Math.round(results.reduce((a, r) => a + (r.duration_ms ?? 0), 0) / 6000) / 10,
    turns: results.reduce((a, r) => a + (r.num_turns ?? 0), 0),
    runs: results.length,
    newTokens: sum((u) => (u.inputTokens ?? 0) + (u.cacheCreationInputTokens ?? 0) + (u.outputTokens ?? 0)),
    outputTokens: sum((u) => u.outputTokens),
    cachedTokens: sum((u) => u.cacheReadInputTokens),
  };
}

/** Lowest and highest of a figure over unchanged runs: the band a change has to leave to be seen. */
export const band = (values: number[]): string => (values.length ? (Math.min(...values) === Math.max(...values) ? String(values[0]) : `${Math.min(...values)}–${Math.max(...values)}`) : '');

async function control(on?: string[]): Promise<{ on: string[]; hits: Record<string, number> }> {
  const init: RequestInit = on ? { method: 'PUT', headers: { 'content-type': 'application/json', connection: 'close' }, body: JSON.stringify({ on }) } : { headers: { connection: 'close' } };
  // After a long run the connection kept from the last call is gone: one more try on a new one.
  const r = await fetch(app.apiBaseUrl + CONTROL, init).catch(() => fetch(app.apiBaseUrl + CONTROL, init));
  if (!r.ok) throw new Error(`the fault proxy answered ${r.status}: ${await r.text()}`);
  return await r.json() as { on: string[]; hits: Record<string, number> };
}
const answers = async (url: string) => { try { return (await fetch(url)).ok; } catch { return false; } };
async function waitFor(url: string, seconds: number, what: string): Promise<void> {
  for (let i = 0; i < seconds / 2; i++) { if (await answers(url)) return; await sleep(2000); }
  throw new Error(`${what} does not answer at ${url} after ${seconds} s`);
}
function must(command: string, args: string[], cwd = REPO): void {
  const r = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (exit ${r.status})`);
}
const compose = (...args: string[]) => must('docker', ['compose', '-p', app.composeProject, '-f', path.join('demo', 'bench', 'docker-compose.yml'), ...args]);
const freshData = () => must(app.freshData[0], app.freshData.slice(1));

async function up(): Promise<void> {
  compose('up', '-d');
  // The containers are up before the database answers: making the data is the readiness check.
  for (let i = 0; ; i++) { try { freshData(); break; } catch (e) { if (i >= 10) throw e; await sleep(5000); } }
  if (!await answers(app.apiBaseUrl + CONTROL)) {
    const child = spawn(process.execPath, ['--import', 'tsx', path.join('dev', 'bench', 'proxy.ts'), '--port', new URL(app.apiBaseUrl).port, '--upstream', app.upstream], { cwd: REPO, detached: true, stdio: 'ignore' });
    child.unref();
    fs.writeFileSync(PID_FILE, String(child.pid));
    await waitFor(app.apiBaseUrl + CONTROL, 30, 'the fault proxy');
  }
  await control([]);
  await waitFor(app.baseUrl, 600, 'the web shop');
  console.log(`✔ ${app.name} at ${app.baseUrl}, its API through the fault proxy at ${app.apiBaseUrl}, every fault off`);
}

function down(): void {
  if (fs.existsSync(PID_FILE)) { try { process.kill(Number(fs.readFileSync(PID_FILE, 'utf8'))); } catch { /* already gone */ } fs.rmSync(PID_FILE); }
  compose('down', '-v');
}

const benchDir = (project: string) => path.join(project, '.bench');
const storyDir = (project: string, key: string): string | undefined => {
  const out = path.join(project, 'output');
  return fs.existsSync(out) ? fs.readdirSync(out).map((p) => path.join(out, p, key)).find((d) => fs.existsSync(d)) : undefined;
};
const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8')) as T;
const agentRuns = (project: string, name: string): AgentResult[] => (fs.existsSync(benchDir(project)) ? fs.readdirSync(benchDir(project)) : [])
  .filter((f) => new RegExp(`^${name}-\\d+\\.json$`).test(f)).sort().map((f) => readJson<AgentResult>(path.join(benchDir(project), f)));

/** The project's own heldout command, through node and not a shell: an argument such as "SCN-1|SCN-2" arrives whole. */
function heldout(project: string, args: string[], quiet = false): { status: number | null; out: string } {
  const r = spawnSync(process.execPath, [path.join(project, 'node_modules', 'tsx', 'dist', 'cli.mjs'), path.join('.github', 'scripts', 'heldout.ts'), ...args], { cwd: project, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: { ...process.env, HELDOUT_QUIET: '1' } });
  if (!quiet) process.stdout.write(r.stdout + r.stderr);
  return { status: r.status, out: r.stdout + r.stderr };
}

/**
 * One headless run of the agent app in the project, with the project's own settings and its browser server only,
 * so nothing of the developer's machine shapes it. What it reports (cost, turns, denials) is kept as <name>-<n>.json.
 */
function agent(project: string, name: string, prompt: string): AgentResult {
  if (/["`$\\\n]/.test(prompt)) throw new Error('a prompt goes through a shell: no quotes, backslashes or line breaks in it');
  fs.mkdirSync(benchDir(project), { recursive: true });
  const n = agentRuns(project, name).length + 1;
  const file = path.join(benchDir(project), `${name}-${n}.json`);
  console.log(`\n▶ agent: ${prompt}`);
  // A project nobody opened by hand is not trusted, and its own approvals are then ignored: they go on the command line.
  // On Windows the app also runs commands in PowerShell, which the project's list doesn't name yet.
  const allow = (readJson<{ permissions?: { allow?: string[] } }>(path.join(project, '.claude', 'settings.json')).permissions?.allow ?? [])
    .flatMap((a) => (a.startsWith('Bash(') ? [a, a.replace(/^Bash/, 'PowerShell')] : [a]));
  const r = spawnSync('claude', ['-p', `"${prompt}"`, '--model', 'opus', '--output-format', 'json', '--mcp-config', '.mcp.json', '--strict-mcp-config', '--setting-sources', 'project,local', '--allowedTools', ...allow.map((a) => `"${a}"`)],
    { cwd: project, encoding: 'utf8', shell: true, maxBuffer: 256 * 1024 * 1024, timeout: 5 * 60 * 60 * 1000 });
  let result: AgentResult;
  try { result = JSON.parse(r.stdout) as AgentResult; } catch { result = { is_error: true, result: `${r.stdout}\n${r.stderr}`.trim().slice(-2000) || `no output (exit ${r.status})` }; }
  fs.writeFileSync(file, JSON.stringify(result, null, 1));
  const c = costOf([result]);
  console.log(`${result.is_error ? '✖' : '✔'} ${name} run ${n}: ${c.minutes} min, $${c.usd}, ${c.newTokens} new tokens, ${c.turns} turns${result.permission_denials?.length ? `, ${result.permission_denials.length} call(s) denied` : ''}`);
  if (result.is_error) console.log(`  ${String(result.result ?? '').split('\n').slice(-3).join('\n  ')}`);
  return result;
}

function newRun(args: string[]): void {
  const [run, ...opts] = args;
  if (!run) throw new Error('Usage: dev/bench.ts new <run> [--stories SHOP-1,SHOP-2] [--no-overview]');
  const password = process.env[app.passwordEnv];
  if (!password) throw new Error(`Set ${app.passwordEnv} to the password of the application's demo accounts (its own README lists it)`);
  const at = opts.indexOf('--stories');
  const stories = at >= 0 ? opts[at + 1] : keyNames().join(',');
  const project = newRound([run, '--base-url', app.baseUrl, '--api-base-url', app.apiBaseUrl, '--name', app.name, ...(stories ? ['--stories', stories] : [])]);
  fs.appendFileSync(path.join(project, '.env'), `\nAPP_PASSWORD=${password}\n`);
  for (const a of app.accounts) {
    if (heldout(project, ['accounts', '--add-existing', '--username', a.username, '--password-env', 'APP_PASSWORD', '--role', a.role, ...(a.shared ? ['--shared'] : [])]).status !== 0) throw new Error(`could not add the account ${a.username}`);
  }
  if (heldout(project, ['accounts', '--check']).status !== 0) throw new Error('an account does not sign in');
  if (!opts.includes('--no-overview')) agent(project, 'overview', 'This project is already set up for held-out evaluation and its test accounts are added. Do the last step of the heldout-evaluator skill setup now: write the overview of the application as its setup reference says. Ask nothing.');
  console.log(`\n✔ bench run ${run}: ${project}`);
}

async function evaluate(args: string[]): Promise<void> {
  const [run, key, ...opts] = args;
  if (!run || !key) throw new Error('Usage: dev/bench.ts eval <run> <KEY> [--faults F01,F02|none]');
  const project = roundProject(run);
  const at = opts.indexOf('--faults');
  const onFile = path.join(benchDir(project), `${key}.on.json`);
  // A story that goes on after a limit keeps the faults it started with.
  const wanted = fs.existsSync(onFile) ? readJson<string[]>(onFile) : at >= 0 ? (opts[at + 1] === 'none' ? [] : opts[at + 1].split(',')) : readKey(key).faults.map((f) => f.id);
  fs.mkdirSync(benchDir(project), { recursive: true });
  const first = !fs.existsSync(onFile);
  fs.writeFileSync(onFile, JSON.stringify(wanted));
  // The counts start with the story and survive a second run of it: only a first run resets them.
  if (first || (await control()).on.join() !== [...wanted].sort().join()) await control(wanted);
  console.log(`faults on: ${wanted.join(', ') || 'none'}`);
  const result = agent(project, `${key}-eval`, `Use the heldout-evaluator skill to evaluate the story ${key}, from its fetch to its published verdict. Ask nothing.`);
  fs.writeFileSync(path.join(benchDir(project), `${key}.hits.json`), JSON.stringify((await control()).hits));
  const dir = storyDir(project, key);
  const verdictFile = dir && path.join(dir, '7-verdict', 'verdict.json');
  if (!verdictFile || !fs.existsSync(verdictFile)) {
    console.log(`✖ ${key} has no verdict yet${result.is_error ? ' (the run ended in an error: run eval again to go on)' : ''}`);
    process.exitCode = 2;
    return;
  }
  console.log(`✔ ${key}: ${readJson<{ verdict: string }>(verdictFile).verdict}. Next: npx tsx dev/bench.ts score ${run} ${key}`);
}

interface Verdict { verdict: string; summary: { total: number; failed: number }; applicationDefects?: { id: string; title: string; tests?: string[]; confirmed?: boolean }[]; contradictedReadings?: { test: string; title: string }[]; openQuestions?: unknown[] }
interface RunRecord { entries: { scenario: string; status: string }[] }
export interface Scored { run: string; key: string; on: string[]; score: Score; evidence: Evidence; hits: Record<string, number>; tests: number; failed: number; openQuestions: number; cost: Cost }

/** Runs the story's tests (all, or those named) and returns the scenarios that failed. */
function failing(project: string, key: string, label: string, only?: string[]): string[] {
  const dir = storyDir(project, key)!;
  const r = heldout(project, ['run', key, '--label', label, '--retries', '1', '--quiet', ...(only ? ['--grep', only.map((t) => `${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d.])`).join('|')] : [])], true);
  const record = fs.readdirSync(path.join(dir, '5-run')).filter((f) => f.endsWith(`-${label}.json`)).sort().at(-1);
  if (!record) throw new Error(`the run ${label} left no record:\n${r.out.slice(-1500)}`);
  return readJson<RunRecord>(path.join(dir, '5-run', record)).entries.filter((e) => e.status === 'failed').map((e) => e.scenario);
}

async function scoreStory(args: string[]): Promise<void> {
  const [run, key] = args;
  if (!run || !key) throw new Error('Usage: dev/bench.ts score <run> <KEY>');
  const project = roundProject(run);
  const dir = storyDir(project, key);
  if (!dir || !fs.existsSync(path.join(dir, '7-verdict', 'verdict.json'))) throw new Error(`${key} has no verdict in ${project}`);
  const verdict = readJson<Verdict>(path.join(dir, '7-verdict', 'verdict.json'));
  const on = readJson<string[]>(path.join(benchDir(project), `${key}.on.json`));
  const findings: Finding[] = (verdict.applicationDefects ?? []).filter((d) => d.confirmed !== false).map((d) => ({ id: d.id, title: d.title, tests: d.tests ?? [] }));
  const questions: Finding[] = (verdict.contradictedReadings ?? []).map((q) => ({ id: q.test, title: q.title, tests: [q.test] }));
  // What the evaluation left behind while a fault was on (a record a faulty delete kept) must not fail the clean run.
  freshData();
  // The labels start with "harden": such a run is never taken for an evaluation, so the verdict stands as it is.
  await control([]);
  const failsClean = failing(project, key, 'harden-bench-clean');
  const toExplain = [...new Set([...findings, ...questions].flatMap((f) => f.tests))].filter((t) => !failsClean.includes(t));
  const failsWith: Record<string, string[]> = {};
  for (const id of on) {
    if (!toExplain.length) { failsWith[id] = []; continue; }
    await control([id]);
    failsWith[id] = failing(project, key, `harden-bench-${id.toLowerCase()}`, toExplain);
  }
  await control([]);
  const evidence: Evidence = { on, verdict: verdict.verdict, findings, questions, failsClean, failsWith };
  const hitsFile = path.join(benchDir(project), `${key}.hits.json`);
  const scored: Scored = {
    run, key, on, score: score(readKey(key), evidence), evidence, hits: fs.existsSync(hitsFile) ? readJson(hitsFile) : {},
    tests: verdict.summary.total, failed: verdict.summary.failed, openQuestions: verdict.openQuestions?.length ?? 0, cost: costOf(agentRuns(project, `${key}-eval`)),
  };
  fs.writeFileSync(path.join(benchDir(project), `${key}.score.json`), JSON.stringify(scored, null, 1));
  console.log(row(scored).join(' | '));
}

const HEAD = ['Run', 'Story', 'Faults on', 'Verdict', 'Found', 'As question', 'Missed', 'False positives', 'Unexplained', 'Tests', 'Failed', 'New tokens', 'Minutes', '$'];
const row = (s: Scored): string[] => [
  s.run, s.key, s.on.join(' ') || 'none', `${s.score.verdict}${s.score.verdictAsKeyed ? '' : ` (key: ${s.score.expected.join(' or ')})`}`,
  `${s.score.found.length} of ${s.on.length}`, s.score.asQuestion.join(' '), s.score.missed.join(' '), s.score.falsePositives.join(' '), s.score.unexplained.join(' '),
  String(s.tests), String(s.failed), `${Math.round(s.cost.newTokens / 1000)}k`, String(s.cost.minutes), String(s.cost.usd),
];

/** The report: one row per scored story, then, for a story scored in several runs with the same faults, each figure's band. */
export function report(all: Scored[]): string {
  const table = (rows: string[][]) => [HEAD, HEAD.map(() => '---'), ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n');
  const groups = new Map<string, Scored[]>();
  for (const s of all) { const k = `${s.key} ${s.on.join(' ')}`; groups.set(k, [...(groups.get(k) ?? []), s]); }
  const bands = [...groups.values()].filter((g) => g.length > 1).map((g) => [
    `${g.length} runs`, g[0].key, g[0].on.join(' ') || 'none', `${g.filter((s) => s.score.verdictAsKeyed).length} of ${g.length} as keyed`,
    band(g.map((s) => s.score.found.length)), band(g.map((s) => s.score.asQuestion.length)), band(g.map((s) => s.score.missed.length)), band(g.map((s) => s.score.falsePositives.length)), band(g.map((s) => s.score.unexplained.length)),
    band(g.map((s) => s.tests)), band(g.map((s) => s.failed)), `${band(g.map((s) => Math.round(s.cost.newTokens / 1000)))}k`, band(g.map((s) => s.cost.minutes)), band(g.map((s) => s.cost.usd)),
  ]);
  return [table(all.map(row)), ...(bands.length ? ['', 'Unchanged runs of one story, lowest to highest:', '', table(bands)] : [])].join('\n');
}

function reportRuns(runs: string[]): void {
  const root = roundProject('.');
  const names = runs.length ? runs : fs.readdirSync(root).filter((d) => fs.existsSync(path.join(root, d, '.bench')));
  const all = names.flatMap((r) => fs.readdirSync(benchDir(roundProject(r))).filter((f) => f.endsWith('.score.json')).map((f) => readJson<Scored>(path.join(benchDir(roundProject(r)), f))));
  console.log(report(all.sort((a, b) => a.key.localeCompare(b.key) || a.run.localeCompare(b.run, undefined, { numeric: true }))));
}

async function main([cmd, ...rest]: string[]): Promise<void> {
  if (cmd === 'up') await up();
  else if (cmd === 'down') down();
  else if (cmd === 'reset') { freshData(); await control([]); }
  else if (cmd === 'faults') console.log(JSON.stringify(await control(rest[0] ? (rest[0] === 'none' ? [] : rest[0].split(',')) : undefined), null, 1));
  else if (cmd === 'new') newRun(rest);
  else if (cmd === 'eval') await evaluate(rest);
  else if (cmd === 'score') await scoreStory(rest);
  else if (cmd === 'report') reportRuns(rest);
  else {
    console.log(fs.readFileSync(import.meta.filename, 'utf8').match(/^\/\*\*([\s\S]*?)\*\//)![1].replace(/^ \* ?/gm, '').trim());
    process.exitCode = cmd ? 1 : 0;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main(process.argv.slice(2));
