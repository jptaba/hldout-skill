/**
 * Rounds of the demo stories, for the skill's developers (this repository only, never copied by init).
 *
 *   npx tsx demo/round.ts new <name> --base-url <url> [--stories PB-1,PB-2] [other setup options: --api-base-url, --name, --profile …]
 *        a fresh round project in $HELDOUT_ROUNDS_DIR/<name>: set up from this clone (setup.sh), and each story
 *        created in its mock Jira from demo/stories/<KEY>/ (story.md; ac-field.md as the criteria field; any other
 *        page as the Confluence page the story links by its title)
 *
 * A round's numbers come from the shipped command, run in the round project: `npm run heldout -- stats [KEY]`.
 * The rounds folder comes from the environment, so the repository holds no machine path.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

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

if (cmd === 'new') newRound(rest);
else {
  console.log(fs.readFileSync(import.meta.filename, 'utf8').match(/^\/\*\*([\s\S]*?)\*\//)![1].replace(/^ \* ?/gm, '').trim());
  process.exitCode = cmd ? 1 : 0;
}
