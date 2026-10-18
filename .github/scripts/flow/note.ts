/**
 * A note in a story's history, from a subagent or a person: something no command could do (a tool gap), or a remark
 * the review of the evaluation should read.
 *
 *   heldout note KEY --tool-gap "what was needed, and what was done by hand instead"
 *   heldout note KEY --remark "…"
 *
 * Tool gaps are what the skill's developers turn into commands: the round audit counts them.
 */
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel } from '../core/files';
import { recordEvent } from '../core/history';
import { evalPaths } from '../core/paths';

export const spec: CommandSpec = {
  name: 'note', group: 'Report', usage: 'KEY --tool-gap "…" | --remark "…"',
  about: 'a note in the story\'s history: a tool gap (a need no command met) or a remark',
  flags: ['remark', 'tool-gap'],
};

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const p = evalPaths(loadConfig({ key }), key);
  const gap = flagStr(flags, 'tool-gap'); const remark = flagStr(flags, 'remark');
  if (!gap === !remark) throw new Error('Give one of --tool-gap "…" or --remark "…"');
  recordEvent(p.history, 'note', gap ? { kind: 'tool-gap', text: gap } : { kind: 'remark', text: remark });
  console.log(`✔ noted in ${rel(p.history)}`);
}
