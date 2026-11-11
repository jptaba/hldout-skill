/**
 * The subagents' files in both agent apps (this repository only, never copied by init as a tool): each
 * `.github/agents/<role>.agent.md` and `.claude/agents/<role>.md` is what `.github/scripts/core/agent-text.ts` writes
 * from the role, so nobody edits one by hand and the two apps can't differ.
 *
 *   npx tsx dev/agents.ts            check every file against its definition (exit 1 on a difference)
 *   npx tsx dev/agents.ts --write    write the files from the definition
 *
 * To change what an agent is told, change agent-text.ts (its role and limits) or its brief in the skill's briefs/,
 * then run this with --write. The coordinator's file is written by hand.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { AGENT_TEXT, claudeAgentFile, copilotAgentFile, type RoleName } from '../.github/scripts/core/agent-text';

const REPO = path.resolve(import.meta.dirname, '..');

/** Every generated file, by its path in the repository, with the text it must have. */
export function agentFiles(): [file: string, text: string][] {
  return (Object.keys(AGENT_TEXT) as RoleName[]).flatMap((name): [string, string][] => [
    [`.github/agents/${name}.agent.md`, copilotAgentFile(name)],
    [`.claude/agents/${name}.md`, claudeAgentFile(name)],
  ]);
}

/** The files that differ from their definition (line endings aside: a checkout may have CRLF). */
export function drifted(): string[] {
  const onDisk = (f: string) => (fs.existsSync(path.join(REPO, f)) ? fs.readFileSync(path.join(REPO, f), 'utf8').replace(/\r\n/g, '\n') : undefined);
  return agentFiles().filter(([f, text]) => onDisk(f) !== text).map(([f]) => f);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  if (process.argv.includes('--write')) {
    for (const [f, text] of agentFiles()) { fs.mkdirSync(path.dirname(path.join(REPO, f)), { recursive: true }); fs.writeFileSync(path.join(REPO, f), text); console.log(`✔ ${f}`); }
  } else {
    const off = drifted();
    for (const f of off) console.log(`✖ ${f} differs from core/agent-text.ts — npx tsx dev/agents.ts --write`);
    if (off.length) process.exit(1);
    console.log(`✔ ${agentFiles().length} agent files are as defined`);
  }
}
