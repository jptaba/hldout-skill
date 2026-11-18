/**
 * A story from wherever it is to its published verdict with nobody watching: `advance`'s steps, and at each stop the
 * subagent it names started headlessly through Claude Code's command line, in this project, with the project's own
 * settings and browser server. What each subagent cost, as the app reports it, goes into the story's history as a
 * usage note. For rounds, the benchmark and CI; a person asks for an evaluation through the skill instead, and
 * in GitHub Copilot the coordinator agent stays the entry point.
 *
 *   heldout drive KEY [--aut <profile>] [--max-agents 12]
 *
 * Stops when the story is complete or not evaluable, when a subagent's run ends in an error (run it again to go on:
 * it picks the story up from the files), or after --max-agents subagents. HELDOUT_AGENT_CLI names another command
 * that takes Claude Code's flags (default `claude`).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { ROOT } from '../core/files';
import { recordEvent } from '../core/history';
import { evalPaths } from '../core/paths';
import { advanceStory, printStop, type Stop } from './steps';

/** What one headless run reported (Claude Code's `--output-format json`). */
export interface AgentRun { is_error?: boolean; result?: string; duration_ms?: number; total_cost_usd?: number; modelUsage?: Record<string, { inputTokens?: number; outputTokens?: number; cacheCreationInputTokens?: number }> }

/** Tokens the model read for the first time or wrote, and minutes: what `note --usage` records. */
export function usageOf(r: AgentRun): { tokens: number; minutes: number } {
  const tokens = Object.values(r.modelUsage ?? {}).reduce((n, u) => n + (u.inputTokens ?? 0) + (u.cacheCreationInputTokens ?? 0) + (u.outputTokens ?? 0), 0);
  return { tokens, minutes: Math.round((r.duration_ms ?? 0) / 6000) / 10 };
}

/**
 * The command line that starts a subagent: its own agent file, Opus, the project's MCP servers only, and the project's
 * approvals passed on (a project nobody opened by hand is not trusted, and its own approvals would be ignored; on
 * Windows the app also runs commands in PowerShell, which the project's list names as Bash). The task goes on stdin.
 */
export function agentArgs(agent: string, allow: string[]): string[] {
  const tools = allow.flatMap((a) => (a.startsWith('Bash(') ? [a, a.replace(/^Bash/, 'PowerShell')] : [a]));
  return ['-p', '--agent', agent, '--model', 'opus', '--output-format', 'json', '--mcp-config', '.mcp.json', '--strict-mcp-config', '--setting-sources', 'project,local', '--allowedTools', ...tools];
}

/** The task as the subagent gets it: the one `advance` printed, with its brief. */
export const promptOf = (key: string, s: Extract<Stop, { kind: 'agent' }>) => `${s.task}. Start with: npm run heldout -- brief ${key}. Ask nothing: what is unclear goes to the verdict.`;

function startAgent(key: string, s: Extract<Stop, { kind: 'agent' }>): AgentRun {
  const settings = path.join(ROOT, '.claude', 'settings.json');
  const allow = fs.existsSync(settings) ? (JSON.parse(fs.readFileSync(settings, 'utf8')) as { permissions?: { allow?: string[] } }).permissions?.allow ?? [] : [];
  const cli = process.env.HELDOUT_AGENT_CLI || 'claude';
  // A shell finds `claude.cmd` on Windows; every argument is quoted for it, and the task goes on stdin, untouched.
  const windows = process.platform === 'win32';
  const args = agentArgs(s.agent, allow).map((a) => (windows ? `"${a}"` : a));
  console.log(`\n▶ ${s.agent}: ${s.task}`);
  const r = spawnSync(cli, args, { cwd: ROOT, input: promptOf(key, s), encoding: 'utf8', shell: windows, maxBuffer: 256 * 1024 * 1024, timeout: 5 * 60 * 60 * 1000 });
  try { return JSON.parse(r.stdout) as AgentRun; } catch { return { is_error: true, result: `${r.stdout ?? ''}\n${r.stderr ?? ''}`.trim().slice(-2000) || `no output (exit ${r.status}${r.error ? `: ${r.error.message}` : ''})` }; }
}

export const spec: CommandSpec = {
  name: 'drive', group: 'Setup', usage: 'KEY [--aut id] [--max-agents n]',
  about: 'the story to its published verdict with nobody watching: advance, and each subagent started headlessly (Claude Code)',
  flags: ['aut', 'max-agents'],
};

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const aut = flagStr(flags, 'aut');
  const max = Number(flagStr(flags, 'max-agents') ?? 12);
  let rerun = false;
  for (let n = 0; ; n++) {
    const stop = advanceStory(key, { aut, rerun });
    printStop(key, stop);
    if (stop.kind !== 'agent') return;
    if (n >= max) { console.log(`\n■ ${max} subagents started: stopping here (--max-agents). Run drive again to go on.`); process.exitCode = 2; return; }
    const result = startAgent(key, stop);
    const used = usageOf(result);
    if (used.tokens || used.minutes) recordEvent(evalPaths(loadConfig({ key, aut }), key).history, 'note', { kind: 'usage', agent: stop.agent, ...used, ...(result.total_cost_usd ? { usd: result.total_cost_usd } : {}) });
    console.log(`${result.is_error ? '✖' : '✔'} ${stop.agent}: ${used.tokens} new tokens, ${used.minutes} minutes`);
    if (result.is_error) {
      console.log(`  ${String(result.result ?? '').split('\n').slice(-3).join('\n  ')}\n■ The subagent's run ended in an error (a usage limit?): run drive again to go on.`);
      process.exitCode = 2;
      return;
    }
    rerun = /--rerun\b/.test(stop.then);
  }
}
