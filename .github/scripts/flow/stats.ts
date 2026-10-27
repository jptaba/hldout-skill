/**
 * How the evaluations went, per story, from what they already wrote (histories, run records, probe logs): for the
 * team that runs the evaluator, to see where time, repairs and cost go.
 *
 *   heldout stats [KEY] [--aut <profile>]
 *
 * One row per story with a history: runs, failures in the last evaluation run, script defects repaired, amendments
 * and re-freezes, contract review rounds, probes while hardening and triaging, minutes per phase, stray files, tool
 * gaps, and what the subagents cost (as the orchestrator recorded it with the note command). A story is shown as
 * <profile>/<KEY> when the project has several profiles; --aut keeps one profile's stories (and says which, for a key
 * in several). With KEY, also the runs, each subagent's cost, the probes refused before the freeze, the tool gaps and the remarks.
 * A record that can't be read is named on stderr and counted as unknown, never fatal to the table.
 */
import fs from 'node:fs';
import path from 'node:path';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel } from '../core/files';
import { readHistory, type HistoryEvent } from '../core/history';
import { NON_EVAL_RUN, PHASE_FOLDERS, STORY_ROOT_FILES, listRuns, listStories, runFile } from '../core/paths';
import { readProbes } from '../core/probe-log';
import { readRunRecord } from '../triage/triage-model';

export interface Usage { agent: string; tokens: number; minutes: number }

export interface StoryStats {
  profile: string; key: string; runs: string[]; failed: number | null; scriptDefects: number; amendments: number; refreezes: number;
  reviews: number; probes: Record<string, number>; times: Record<string, number | null>; stray: string[]; gaps: string[];
  refused: string[]; remarks: string[]; usage: Usage[]; unreadable: string[];
}

export const PHASES = ['requirement', 'tests', 'harden', 'triage', 'total'] as const;

const minutes = (a?: HistoryEvent, b?: HistoryEvent) => {
  const m = a && b ? Math.round((Date.parse(b.at) - Date.parse(a.at)) / 60_000) : null;
  return m === null || Number.isFinite(m) ? m : null;
};
/** A recorded figure: a finite number of zero or more, else nothing (a hand-edited or damaged line). */
const figure = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);

/** One story's numbers, from its folder (output/<profile>/<KEY>/). */
export function storyStats(dir: string, profile: string, key: string): StoryStats {
  const events = readHistory(path.join(dir, STORY_ROOT_FILES[0]));
  const first = (name: string, where: (e: HistoryEvent) => boolean = () => true) => events.find((e) => e.event === name && where(e));
  const last = (name: string) => events.filter((e) => e.event === name).at(-1);
  const all = (name: string) => events.filter((e) => e.event === name);
  const notes = all('note');
  const text = (e: HistoryEvent) => String(e.text ?? e.remark ?? '');
  const [, , , HARDENING, RUN, TRIAGE] = PHASE_FOLDERS;
  const runsDir = path.join(dir, RUN);
  const runs = listRuns(runsDir);
  const lastEval = runs.filter((r) => !NON_EVAL_RUN.test(r)).at(-1);
  const isEval = (e: HistoryEvent) => typeof e.run === 'string' && !NON_EVAL_RUN.test(e.run);
  const unreadable: string[] = [];
  let failed: number | null = null;
  if (lastEval) {
    const file = runFile({ runs: runsDir }, lastEval);
    try { failed = readRunRecord(file).entries.filter((e) => e.status === 'failed').length; } catch { unreadable.push(rel(file)); }
  }
  const probes = readProbes({ hardened: path.join(dir, HARDENING), triage: path.join(dir, TRIAGE) });
  return {
    profile, key, runs, failed, unreadable,
    scriptDefects: all('decided').filter((e) => e.category === 'SCRIPT_DEFECT').reduce((n, e) => n + (Array.isArray(e.tests) ? e.tests.length : 1), 0),
    amendments: all('amended').length, refreezes: all('refrozen').length, reviews: all('review-bound').length,
    probes: probes.reduce<Record<string, number>>((m, p) => ({ ...m, [p.phase]: (m[p.phase] ?? 0) + 1 }), {}),
    times: {
      requirement: minutes(first('fetched'), last('review-bound')),
      tests: minutes(last('review-bound'), first('draft-finished')),
      harden: minutes(first('frozen'), first('run', isEval)),
      triage: minutes(first('run', isEval), last('verdict')),
      total: minutes(events[0], events.at(-1)),
    },
    stray: all('stray-moved').flatMap((e) => (Array.isArray(e.files) ? e.files.map(String) : [])),
    gaps: notes.filter((e) => e.kind === 'tool-gap').map(text),
    refused: notes.filter((e) => e.kind === 'isolation').map(text),
    // Every other note is a remark, whoever wrote it.
    remarks: notes.filter((e) => !['tool-gap', 'isolation', 'usage'].includes(String(e.kind))).map(text),
    usage: notes.filter((e) => e.kind === 'usage').map((e) => ({ agent: String(e.agent), tokens: figure(e.tokens), minutes: figure(e.minutes) })),
  };
}

/** Each agent's cost, summed: tokens and minutes over every hand-back recorded for the story. */
export function usageByAgent(usage: Usage[]): Usage[] {
  const by = new Map<string, Usage>();
  for (const u of usage) {
    const sum = by.get(u.agent) ?? { agent: u.agent, tokens: 0, minutes: 0 };
    sum.tokens += u.tokens; sum.minutes += u.minutes;
    by.set(u.agent, sum);
  }
  return [...by.values()].map((u) => ({ ...u, minutes: Math.round(u.minutes * 10) / 10 }));
}

/** The table, one row per story; the profile is named when the stories come from more than one. */
export function statsTable(stories: StoryStats[]): string[] {
  const several = new Set(stories.map((s) => s.profile)).size > 1;
  const t = (n: number | null) => (n === null ? '-' : `${n}m`);
  const cost = (s: StoryStats) => {
    if (!s.usage.length) return '-';
    const tokens = s.usage.reduce((n, u) => n + u.tokens, 0);
    return `${tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : tokens} tok / ${Math.round(s.usage.reduce((n, u) => n + u.minutes, 0))}m`;
  };
  return [
    '| Story | Runs | Failed (last eval) | Script defects | Amend / refreeze | Reviews | Probes harden / triage | Minutes req / tests / harden / triage / total | Stray | Tool gaps | Subagents |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...stories.map((s) => `| ${several ? `${s.profile}/` : ''}${s.key} | ${s.runs.length} | ${s.failed ?? (s.unreadable.length ? '?' : '-')} | ${s.scriptDefects} | ${s.amendments} / ${s.refreezes} | ${s.reviews} | ${s.probes.hardening ?? 0} / ${s.probes.triage ?? 0} | ${PHASES.map((k) => t(s.times[k])).join(' / ')} | ${s.stray.length} | ${s.gaps.length} | ${cost(s)} |`),
  ];
}

export const spec: CommandSpec = {
  name: 'stats', group: 'Report', usage: '[KEY] [--aut <profile>]',
  about: 'per story: runs, repairs, reviews, probes, minutes per phase, tool gaps and subagent cost',
  flags: ['aut'],
};

export function run({ _, flags }: Args): void {
  const only = _[0] ? assertIssueKey(_[0]) : undefined;
  const aut = flagStr(flags, 'aut');
  const cfg = loadConfig({ ...(only ? { key: only } : {}), ...(aut ? { aut } : {}) });
  const found = listStories(cfg).filter((s) => fs.existsSync(path.join(s.dir, STORY_ROOT_FILES[0])) && (!only || s.key === only) && (!aut || s.profile === aut));
  // A key in several profiles: the one the config resolves it to (--aut, or the profile the story is bound to).
  const chosen = only && found.length > 1 ? found.filter((s) => s.profile === cfg.autId) : found;
  const stories = chosen.map((s) => storyStats(s.dir, s.profile, s.key))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }) || a.profile.localeCompare(b.profile));
  if (!stories.length) throw new Error(only ? `${only} has no story with a history under ${cfg.outputDir}/${found.length ? ` for profile ${cfg.autId}` : ''}` : `no story with a history under ${cfg.outputDir}/${aut ? ` for profile ${aut}` : ''} yet`);
  for (const s of stories) for (const f of s.unreadable) console.error(`⚠ ${s.key}: can't read ${f} — counted as unknown`);
  for (const line of statsTable(stories)) console.log(line);
  if (!only) return;
  const s = stories[0];
  console.log(`\nRuns: ${s.runs.join(', ') || 'none'}`);
  for (const u of usageByAgent(s.usage)) console.log(`Subagent ${u.agent}: ${u.tokens} tokens, ${u.minutes} minutes`);
  if (s.stray.length) console.log(`Stray files moved: ${s.stray.join(', ')}`);
  for (const r of s.refused) console.log(`Refused before the freeze: ${r}`);
  for (const g of s.gaps) console.log(`Tool gap: ${g}`);
  for (const r of s.remarks) console.log(`Remark: ${r}`);
}
