/**
 * What one subagent needs to start on a story, in one call: where the story's files are, where the story stands,
 * what the application is, and the role's procedure. Each agent file holds the role and its limits and sends the
 * agent here, so the procedure is kept once (the skill's briefs/<role>.md) and reads the same in GitHub Copilot and
 * Claude Code.
 *
 *   heldout brief KEY --role heldout-hardener [--aut id]
 *
 * It prints nothing a role may not know before a story's freeze: the overview is every agent's at any time; the map's
 * entries and the rules stay behind `heldout map KEY`, which refuses a story that isn't frozen.
 */
import fs from 'node:fs';
import path from 'node:path';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { SKILL_DIR, assertIssueKey, loadConfig } from '../core/config';
import { rel } from '../core/files';
import { evalPaths } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';
import { ROLES } from '../core/roles';
import { overviewText } from '../probe/app-knowledge';
import { phasesOf } from './phases';

export const spec: CommandSpec = {
  name: 'brief', group: 'Setup', usage: 'KEY --role <subagent> [--aut id]',
  about: 'what a subagent needs to start: the story\'s folders, where it stands, the overview and the role\'s procedure',
  flags: ['aut', 'role'],
};

/** The role's procedure as the skill keeps it, with the story's key where it writes KEY: commands can be run as printed. */
export function procedureOf(role: string, key: string): string {
  const file = path.join(SKILL_DIR, 'briefs', `${role}.md`);
  if (!fs.existsSync(file)) throw new Error(`The skill has no brief for ${role} (${rel(file)}): update the skill in this project.`);
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\bKEY\b/g, key).trimEnd();
}

/** The whole brief. The order is the reader's: where things are, what is done, what is known, what to do. */
export function briefText(cfg: HeldoutConfig, key: string, role: string): string {
  const p = evalPaths(cfg, key);
  const stands = phasesOf(cfg, key).map((ph) => `  ${ph.done ? '✔' : '·'} ${ph.name.padEnd(9)} ${ph.folder.padEnd(14)} ${ph.detail}`);
  return [
    `Brief for ${role} — story ${key}, application ${cfg.aut.name ?? cfg.autId}`,
    `  record:  ${rel(p.base)}/   (committed: one folder per phase)`,
    `  scratch: ${rel(p.work.base)}/   (git-ignored: views, step files, raw run output)`,
    '', 'Where the story stands', ...stands,
    '', overviewText(cfg, true),
    '', `Your procedure (${role})`, '', procedureOf(role, key), '',
  ].join('\n');
}

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const role = flagStr(flags, 'role');
  const roles = Object.keys(ROLES);
  // The coordinator has no brief: SKILL.md is what it follows.
  if (!role || !roles.includes(role)) throw new Error(`${role ? `"${role}" is not a subagent's role` : '--role says whose brief'}: ${roles.join(', ')}`);
  console.log(briefText(loadConfig({ key, aut: flagStr(flags, 'aut') }), key, role));
}
