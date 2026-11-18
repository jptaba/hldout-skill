/**
 * A note in a story's history, from a subagent or a person: something no command could do (a tool gap), a place where
 * the application and the story differ (a discrepancy, which the verdict lists), or a remark the review of the
 * evaluation should read.
 *
 *   heldout note KEY --tool-gap "what was needed, and what was done by hand instead"
 *   heldout note KEY --discrepancy "what the story says, and what the application showed" [--evidence P7]
 *   heldout note KEY --remark "…"
 *   heldout note KEY --usage "<agent> tokens=<n> minutes=<m>"
 *
 * Tool gaps are what the skill's developers turn into commands: the round audit counts them. A discrepancy never
 * changes what a check expects: the story wins, and the verdict puts the difference before the story's owner. Usage
 * is what a subagent cost, as the agent app reported it when the subagent handed back; `heldout stats` sums it per
 * story and agent.
 */
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel } from '../core/files';
import { recordEvent } from '../core/history';
import { evalPaths } from '../core/paths';
import { citeProbes } from '../core/probe-log';

export const spec: CommandSpec = {
  name: 'note', group: 'Report', usage: 'KEY --tool-gap "…" | --discrepancy "…" [--evidence Pn] | --remark "…" | --usage "<agent> tokens=<n> minutes=<m>"',
  about: 'a note in the story\'s history: a tool gap, where the application and the story differ, a remark, or what a subagent cost',
  flags: ['discrepancy', 'evidence', 'remark', 'tool-gap', 'usage'],
};

/** What a hand-back can plausibly cost: beyond this, a figure is a typo, not a measurement. */
const MAX = { tokens: 1e10, minutes: 1e5 };

/**
 * "<agent> tokens=<n> minutes=<m>": what one subagent's hand-back cost, as the agent app reported it. Either figure
 * may be left out, not both; each at most once, and within reason.
 */
export function parseUsage(text: string): { agent: string; tokens?: number; minutes?: number } {
  const bad = () => new Error(`--usage takes "<agent> tokens=<n> minutes=<m>" (either figure may be left out, each once), not "${text}"`);
  const m = /^\s*([\w.-]+)((?:\s+(?:tokens|minutes)=\d+(?:\.\d+)?)+)\s*$/.exec(text);
  if (!m) throw bad();
  const figures = [...m[2].matchAll(/(tokens|minutes)=(\d+(?:\.\d+)?)/g)].map(([, name, v]) => [name, Number(v)] as const);
  if (new Set(figures.map(([name]) => name)).size !== figures.length) throw bad();
  const out: { agent: string; tokens?: number; minutes?: number } = { agent: m[1] };
  for (const [name, v] of figures) {
    if (v > MAX[name as keyof typeof MAX]) throw new Error(`--usage: ${name}=${v} is more than a hand-back can cost (at most ${MAX[name as keyof typeof MAX]})`);
    if (name === 'tokens') out.tokens = Math.round(v); else out.minutes = Math.round(v * 10) / 10;
  }
  return out;
}

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const gap = flagStr(flags, 'tool-gap'); const remark = flagStr(flags, 'remark'); const usage = flagStr(flags, 'usage'); const discrepancy = flagStr(flags, 'discrepancy');
  if ([gap, remark, usage, discrepancy].filter(Boolean).length !== 1) throw new Error('Give one of --tool-gap "…", --discrepancy "…", --remark "…" or --usage "<agent> tokens=<n> minutes=<m>"');
  const evidence = flagStr(flags, 'evidence');
  if (evidence && !discrepancy) throw new Error('--evidence goes with --discrepancy');
  // The probe that showed it is kept in the record, as any cited probe is.
  const probes = evidence ? citeProbes(cfg, key, evidence) : [];
  recordEvent(p.history, 'note', gap ? { kind: 'tool-gap', text: gap } : remark ? { kind: 'remark', text: remark }
    : discrepancy ? { kind: 'discrepancy', text: discrepancy, ...(probes.length ? { probes } : {}) } : { kind: 'usage', ...parseUsage(usage!) });
  console.log(`✔ noted in ${rel(p.history)}`);
}
