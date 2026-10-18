/**
 * Rounds of the demo stories, for the skill's developers (this repository only, never copied by init).
 *
 *   npx tsx demo/round.ts new <name> --base-url <url> [--stories PB-1,PB-2] [other setup options: --api-base-url, --name, --profile …]
 *        a fresh round project in $HELDOUT_ROUNDS_DIR/<name>: set up from this clone (setup.sh), and each story
 *        created in its mock Jira from demo/stories/<KEY>/ (story.md; ac-field.md as the criteria field; any other
 *        page as the Confluence page the story links by its title)
 *   npx tsx demo/round.ts stats <project> [KEY]
 *        per story, from its history and record: runs, failures, script defects, amendments and re-freezes, review
 *        rounds, probes per phase, time per phase, stray files and tool gaps; with KEY, the details
 *
 * The rounds folder comes from the environment, so the repository holds no machine path.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { readHistory, type HistoryEvent } from '../.github/scripts/core/history';
import { NON_EVAL_RUN, listRuns, runFile } from '../.github/scripts/core/paths';
import { readProbes } from '../.github/scripts/core/probe-log';
import { readRunRecord } from '../.github/scripts/triage/triage-model';

const REPO = path.resolve(import.meta.dirname, '..');
const [cmd, ...rest] = process.argv.slice(2);

function sh(command: string, args: string[], cwd: string): void {
  console.log(`\n▶ ${command} ${args.join(' ')}`);
  const r = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' && command === 'npm' });
  if (r.status !== 0) throw new Error(`${command} ${args[0] ?? ''} failed (exit ${r.status})`);
}

/** The `heldout new` options for a demo story: its criteria field and the pages it links, matched by title. */
function storyArgs(key: string): string[] {
  const dir = path.join(REPO, 'demo', 'stories', key);
  if (!fs.existsSync(path.join(dir, 'story.md'))) throw new Error(`demo/stories/${key}/story.md does not exist`);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'story.md');
  const args = ['--from', path.join(dir, 'story.md')];
  const text = ['story.md', ...files].map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  for (const f of files) {
    if (f === 'ac-field.md') { args.push('--ac-from', path.join(dir, f)); continue; }
    const title = fs.readFileSync(path.join(dir, f), 'utf8').match(/^# (.+)$/m)?.[1]?.trim();
    const id = title && text.match(new RegExp(`\\[${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\|[^\\]]*pageId=(\\d+)`))?.[1];
    if (!id) throw new Error(`demo/stories/${key}/${f}: no link [${title ?? '?'}|…pageId=<id>] to it in the story`);
    args.push('--page', `${id}=${path.join(dir, f)}`);
  }
  return args;
}

function newRound(args: string[]): void {
  const [name, ...opts] = args;
  const roundsDir = process.env.HELDOUT_ROUNDS_DIR;
  if (!name) throw new Error('Usage: demo/round.ts new <name> --base-url <url> [--stories A-1,B-2] [setup options]');
  if (!roundsDir) throw new Error('Set HELDOUT_ROUNDS_DIR to the folder the round projects go in');
  const project = path.resolve(roundsDir, name);
  if (fs.existsSync(project)) throw new Error(`${project} exists: a round starts from an empty project`);
  const at = opts.indexOf('--stories');
  const stories = at >= 0 ? opts.splice(at, 2)[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
  fs.mkdirSync(project, { recursive: true });
  sh('bash', [path.join(REPO, 'setup.sh').split(path.sep).join('/'), '--no-pull', ...opts], project);
  for (const key of stories) sh('npm', ['run', 'heldout', '--', 'new', key, ...storyArgs(key)], project);
  console.log(`\n✔ round ${name}: ${project}${stories.length ? ` with ${stories.join(', ')} in its mock Jira` : ''}. Next: npm run heldout -- advance ${stories[0] ?? 'KEY'}`);
}

interface Stats {
  key: string; runs: string[]; failed: number | null; scriptDefects: number; amendments: number; refreezes: number; reviews: number;
  probes: Record<string, number>; times: Record<string, number | null>; stray: string[]; gaps: string[]; remarks: string[];
}

const minutes = (a?: HistoryEvent, b?: HistoryEvent) => (a && b ? Math.round((Date.parse(b.at) - Date.parse(a.at)) / 60_000) : null);

function statsOf(dir: string, key: string): Stats {
  const events = readHistory(path.join(dir, 'history.jsonl'));
  const first = (name: string, where: (e: HistoryEvent) => boolean = () => true) => events.find((e) => e.event === name && where(e));
  const last = (name: string) => events.filter((e) => e.event === name).at(-1);
  const all = (name: string) => events.filter((e) => e.event === name);
  const runsDir = path.join(dir, '5-runs');
  const runs = listRuns(runsDir);
  const lastEval = runs.filter((r) => !NON_EVAL_RUN.test(r)).at(-1);
  const isEval = (e: HistoryEvent) => typeof e.run === 'string' && !NON_EVAL_RUN.test(e.run);
  const probes = readProbes({ evidence: path.join(dir, '4-evidence') });
  return {
    key, runs,
    failed: lastEval ? readRunRecord(runFile({ runs: runsDir }, lastEval)).entries.filter((e) => e.status === 'failed').length : null,
    scriptDefects: all('decided').filter((e) => e.category === 'SCRIPT_DEFECT').reduce((n, e) => n + ((e.tests as string[] | undefined)?.length ?? 1), 0),
    amendments: all('amended').length, refreezes: all('refrozen').length, reviews: all('review-bound').length,
    probes: probes.reduce<Record<string, number>>((m, p) => ({ ...m, [p.phase]: (m[p.phase] ?? 0) + 1 }), {}),
    times: {
      requirement: minutes(first('fetched'), last('review-bound')),
      tests: minutes(last('review-bound'), first('draft-finished')),
      harden: minutes(first('frozen'), first('run', isEval)),
      triage: minutes(first('run', isEval), last('verdict')),
      total: minutes(events[0], events.at(-1)),
    },
    stray: all('stray-moved').flatMap((e) => (e.files as string[] | undefined) ?? []),
    gaps: all('note').filter((e) => e.kind === 'tool-gap').map((e) => String(e.text)),
    remarks: all('note').filter((e) => e.kind !== 'tool-gap').map((e) => String(e.text ?? e.remark)),
  };
}

function stats(args: string[]): void {
  const [project, only] = args;
  if (!project) throw new Error('Usage: demo/round.ts stats <project> [KEY]');
  const out = path.resolve(project, 'output');
  if (!fs.existsSync(out)) throw new Error(`${out} does not exist`);
  const stories = fs.readdirSync(out, { withFileTypes: true }).filter((d) => d.isDirectory()).flatMap((p) => fs.readdirSync(path.join(out, p.name))
    .filter((k) => (!only || k === only) && fs.existsSync(path.join(out, p.name, k, 'history.jsonl'))).map((k) => statsOf(path.join(out, p.name, k), k)))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
  if (!stories.length) throw new Error(only ? `${only} has no history in ${out}` : `no story with a history in ${out}`);
  const t = (n: number | null) => (n === null ? '-' : `${n}m`);
  console.log(`| Story | Runs | Failed (last eval) | Script defects | Amend / refreeze | Reviews | Probes harden / triage | Minutes req / tests / harden / triage / total | Stray | Tool gaps |`);
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const s of stories) {
    console.log(`| ${s.key} | ${s.runs.length} | ${s.failed ?? '-'} | ${s.scriptDefects} | ${s.amendments} / ${s.refreezes} | ${s.reviews} | ${s.probes.harden ?? 0} / ${s.probes.triage ?? 0} | ${['requirement', 'tests', 'harden', 'triage', 'total'].map((k) => t(s.times[k])).join(' / ')} | ${s.stray.length} | ${s.gaps.length} |`);
  }
  if (only) {
    const s = stories[0];
    console.log(`\nRuns: ${s.runs.join(', ') || 'none'}`);
    if (s.stray.length) console.log(`Stray files moved: ${s.stray.join(', ')}`);
    for (const g of s.gaps) console.log(`Tool gap: ${g}`);
    for (const r of s.remarks) console.log(`Remark: ${r}`);
  }
}

if (cmd === 'new') newRound(rest);
else if (cmd === 'stats') stats(rest);
else {
  console.log(fs.readFileSync(import.meta.filename, 'utf8').match(/^\/\*\*([\s\S]*?)\*\//)![1].replace(/^ \* ?/gm, '').trim());
  process.exitCode = cmd ? 1 : 0;
}
