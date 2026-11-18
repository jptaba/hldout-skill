/**
 * Run a story's next steps, as far as scripts can take it: every deterministic step in order, stopping where a
 * subagent has work to do and naming it with its task and its brief. Run it again after each subagent; it picks the
 * story up from the files on disk. The steps are in flow/steps.ts.
 *
 *   heldout advance KEY [--aut <profile>]     from wherever the story is
 *   heldout advance KEY --rerun               after the operator repaired confirmed script defects: run again first
 */
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey } from '../core/config';
import { advanceStory, printStop } from './steps';

export const spec: CommandSpec = {
  name: 'advance', group: 'Setup', usage: 'KEY [--aut id] [--rerun]',
  about: 'run the story\'s next script steps, up to the next subagent (run it again after each one)',
  flags: ['aut', 'rerun'],
};

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  printStop(key, advanceStory(key, { aut: flagStr(flags, 'aut'), rerun: Boolean(flags.rerun) }));
}
