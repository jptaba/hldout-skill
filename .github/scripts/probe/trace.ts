/**
 * What a failed test's trace holds, as text: its steps, the calls the browser and the API client made, the console.
 * Reads the trace the run kept (the failing attempt's, in the scratch area) with nothing but Node; secrets the story
 * uses are masked.
 *
 *   heldout trace KEY SCN-012 [--run 04-eval]      the steps (with the one that failed) and the calls, in short
 *   heldout trace KEY SCN-012 --network [--grep orders]   each call: method, address, status, time, the bodies sent and
 *                                                         received (redacted, cut to --body-limit N characters; 600)
 *   heldout trace KEY SCN-012 --steps              every step, nested as the test ran them
 *   heldout trace KEY SCN-012 --console            what the page wrote to its console
 *
 * The run defaults to the latest one in which the test did not pass. The trace exists while the run's raw output is
 * kept (the last two runs, and any run still in triage).
 */
import fs from 'node:fs';
import path from 'node:path';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { ROOT, rel } from '../core/files';
import { currentTestData, evalPaths, listRuns, movedRunNote, runFile } from '../core/paths';
import { pageText, redact, secretValuesFor } from '../core/redact';
import { readZip, type ZipEntry } from '../core/zip';
import { envNamesIn } from './accounts-recipe';

interface TraceEvent { type: string; callId?: string; parentId?: string; title?: string; error?: { message?: string }; messageType?: string; text?: string; snapshot?: Snapshot }
interface Snapshot {
  startedDateTime?: string; time?: number;
  request: { method: string; url: string; postData?: { text?: string; _file?: string } };
  response: { status: number; content?: { mimeType?: string; text?: string; _file?: string } };
}

export const spec: CommandSpec = {
  name: 'trace', group: 'Run', usage: 'KEY SCN-x [--run NN-label] [--network [--grep text]] [--steps] [--console]',
  about: 'a failed test\'s trace as text: its steps, its calls, the console (secrets masked)',
  flags: ['body-limit', 'console', 'grep', 'network', 'run', 'steps'], words: 2,
};

const lines = (e: ZipEntry | undefined): TraceEvent[] => (e ? e.data.toString('utf8').split('\n').filter((l) => l.trim()).flatMap((l) => { try { return [JSON.parse(l) as TraceEvent]; } catch { return []; } }) : []);

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const test = _[1];
  if (!test) throw new Error('Usage: heldout trace KEY SCN-x [--run NN-label] [--network] [--steps] [--console]');
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const runs = listRuns(p.runs);
  const entryIn = (r: string) => JSON.parse(fs.readFileSync(runFile(p, r), 'utf8')).entries.find((e: { scenario: string; status: string }) => e.scenario === test && e.status !== 'passed') as { evidence: { trace?: string } } | undefined;
  const runName = flagStr(flags, 'run') ?? [...runs].reverse().find((r) => entryIn(r)?.evidence.trace);
  if (!runName) throw new Error(`${test} did not fail in any run of ${key} with a trace (runs: ${runs.join(', ') || 'none'})`);
  if (!fs.existsSync(runFile(p, runName))) throw new Error(`No run ${runName} of ${key} (runs: ${runs.join(', ') || 'none'})${movedRunNote(p, runName)}`);
  const traceRel = entryIn(runName)?.evidence.trace;
  const file = traceRel && path.join(ROOT, traceRel);
  if (!file || !fs.existsSync(file)) throw new Error(`The trace of ${test} in ${runName} is gone: a run's raw output is kept for the last two runs and any run still in triage. Run the test again (heldout run ${key} --label repro --grep "${test}") for a new one.`);
  const zip = readZip(fs.readFileSync(file));
  if (!zip) throw new Error(`${rel(file)} could not be read`);
  const secrets = secretValuesFor(currentTestData(p), process.env, envNamesIn(cfg.aut.accounts).map((n) => process.env[n] ?? '').filter(Boolean)).values;
  const mask = (s: string) => secrets.reduce((acc, v) => acc.split(v).join('***'), s);
  const limit = Number(flagStr(flags, 'body-limit') ?? 600);
  const resource = (name?: string) => (name ? zip.find((e) => e.name === name)?.data.toString('utf8') : undefined);
  const body = (text?: string, mime = '') => {
    if (!text) return '';
    let shown = text;
    try { shown = JSON.stringify(redact(JSON.parse(text))); } catch { if (/html/i.test(mime) || /^\s*</.test(text)) shown = pageText(text); }
    const one = mask(shown).replace(/\s+/g, ' ');
    return one.length > limit ? `${one.slice(0, limit)}… (${one.length} characters)` : one;
  };

  const all = zip.filter((e) => e.name.endsWith('.trace')).flatMap(lines);
  const steps = lines(zip.find((e) => e.name === 'test.trace'));
  const calls = zip.filter((e) => e.name.endsWith('.network')).flatMap(lines).filter((e) => e.type === 'resource-snapshot' && e.snapshot).map((e) => e.snapshot!)
    .filter((s) => !/\.(png|jpe?g|gif|svg|woff2?|ttf|css|js|ico|webp)(\?|$)/i.test(s.request.url))
    .filter((s) => !flagStr(flags, 'grep') || s.request.url.includes(flagStr(flags, 'grep')!));
  const want = { network: Boolean(flags.network), steps: Boolean(flags.steps), console: Boolean(flags.console) };
  const none = !want.network && !want.steps && !want.console;
  console.log(`Trace of ${test} in ${runName} (${rel(file)})`);

  if (want.steps || none) {
    // Each step with the test's own nesting; the fixtures' set-up and tear-down are left out unless they failed.
    const ended = new Map(steps.filter((e) => e.type === 'after').map((e) => [e.callId, e]));
    const depth = new Map<string, number>();
    console.log('\nSteps');
    for (const s of steps.filter((e) => e.type === 'before')) {
      const d = s.parentId ? (depth.get(s.parentId) ?? 0) + 1 : 0;
      depth.set(s.callId!, d);
      const failed = ended.get(s.callId)?.error?.message;
      if (!want.steps && !failed && /^(Before|After) Hooks$|^Fixture /.test(s.title ?? '')) continue;
      console.log(`  ${'  '.repeat(want.steps ? d : 0)}${failed ? '✖' : '·'} ${mask(s.title ?? '')}${failed ? `\n      ${mask(failed.split('\n')[0]).replace(/\u001b\[[0-9;]*m/g, '')}` : ''}`);
    }
  }
  if (want.network || none) {
    console.log(`\nCalls (${calls.length}${flagStr(flags, 'grep') ? ` matching "${flagStr(flags, 'grep')}"` : ''})`);
    for (const s of calls) {
      console.log(`  ${s.request.method} ${mask(s.request.url)} → ${s.response.status} (${Math.round(s.time ?? 0)} ms)`);
      if (!want.network) continue;
      const sent = body(s.request.postData?.text || resource(s.request.postData?._file));
      if (sent) console.log(`      sent: ${sent}`);
      const got = body(s.response.content?.text || resource(s.response.content?._file), s.response.content?.mimeType);
      if (got) console.log(`      answer: ${got}`);
    }
  }
  if (want.console || none) {
    const out = all.filter((e) => e.type === 'console');
    if (out.length || want.console) console.log(`\nConsole (${out.length})`);
    for (const c of out) console.log(`  [${c.messageType ?? 'log'}] ${mask(c.text ?? '').slice(0, 300)}`);
  }
}
