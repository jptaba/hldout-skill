/**
 * One entry point for every held-out evaluator command.
 *
 *   npx tsx .github/scripts/heldout.ts <command> [args]
 *   npm run heldout -- <command> [args]          (after `init`, which adds the npm script)
 *
 * Run without a command (or with `help`) for the list.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { main, parseArgs, type CommandModule } from './core/cli';
import { setCommandLine } from './core/history';

/** Every command and its module, in the order `help` lists them. Each module exports its spec and its run. */
export const COMMANDS: Record<string, string> = {
  init: 'setup/init.ts',
  update: 'setup/update.ts',
  'add-aut': 'setup/add-aut.ts',
  doctor: 'setup/doctor.ts',
  secret: 'setup/secret.ts',
  accounts: 'setup/accounts.ts',
  precommit: 'setup/precommit.ts',
  status: 'flow/status.ts',
  advance: 'flow/advance.ts',
  new: 'requirement/mock/new.ts',
  fetch: 'requirement/fetch.ts',
  contract: 'requirement/contract.ts',
  scaffold: 'authoring/scaffold.ts',
  journeys: 'authoring/journeys/journeys.ts',
  lint: 'authoring/lint.ts',
  integrity: 'authoring/integrity.ts',
  inspect: 'probe/inspect.ts',
  confirm: 'authoring/confirm.ts',
  'api-probe': 'probe/api-probe.ts',
  'mcp-probe': 'probe/mcp-probe.ts',
  run: 'run/run.ts',
  triage: 'triage/triage.ts',
  trace: 'probe/trace.ts',
  verdict: 'report/verdict.ts',
  publish: 'report/publish.ts',
  show: 'flow/show.ts',
  note: 'flow/note.ts',
  stats: 'flow/stats.ts',
  scrub: 'report/scrub.ts',
  prune: 'flow/prune.ts',
};

const fileOf = (name: string) => path.join(import.meta.dirname, COMMANDS[name]);
export const loadCommand = async (name: string): Promise<CommandModule> => await import(pathToFileURL(fileOf(name)).href) as CommandModule;

async function help(): Promise<void> {
  console.log('Held-out evaluator — usage: heldout <command> [args]\n');
  let group = '';
  for (const name of Object.keys(COMMANDS)) {
    const { spec } = await loadCommand(name);
    if (spec.group !== group) { group = spec.group; console.log(`${group}`); }
    console.log(`  ${name.padEnd(10)} ${spec.about}\n  ${' '.repeat(10)} ${spec.usage}`);
  }
  console.log('\nFirst time here?  heldout init --base-url https://your-app --install   then   heldout doctor');
  console.log('A newer skill?    git pull the skill repository, then run its heldout update in this folder');
  console.log('Then ask Opus:     "Run a held-out evaluation of ABC-123"');
}

/** The usage a command's module documents in its leading comment. */
const usageOf = (name: string) => (fs.readFileSync(fileOf(name), 'utf8').match(/^\/\*\*([\s\S]*?)\*\//)?.[1] ?? '')
  .split('\n').map((l) => l.replace(/^ ?\* ?/, '')).join('\n').trim();

async function dispatch(cmd: string | undefined, rest: string[]): Promise<void> {
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') { await help(); return; }
  if (!COMMANDS[cmd]) {
    const near = Object.keys(COMMANDS).filter((k) => k.startsWith(cmd.slice(0, 3)));
    throw new Error(`Unknown command "${cmd}".${near.length ? ` Did you mean: ${near.join(', ')}?` : ''} Run "heldout help".`);
  }
  if (rest.includes('--help') || rest.includes('-h')) { console.log(usageOf(cmd)); return; }
  const command = await loadCommand(cmd);
  const known = new Set(command.spec.flags);
  // Windows PowerShell drops a bare `--`, so `npm run heldout -- run KEY --label eval` reaches npm as
  // `npm run heldout run KEY --label eval`: npm keeps the flags for itself (as npm_config_*, `--aut` expanded to
  // `--auth-type`) and passes their values on as plain arguments. Stop rather than run the command without them.
  if (process.env.npm_lifecycle_event) {
    const npmKeys = Object.keys(process.env).filter((k) => /^npm_config_/i.test(k)).map((k) => k.slice(11).toLowerCase().replace(/_/g, '-'));
    const passed = new Set(rest.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')[0]));
    const swallowed = [...known].filter((f) => !passed.has(f) && npmKeys.some((k) => k === f || (f.length >= 3 && k.startsWith(f))));
    if (swallowed.length) {
      throw new Error(`npm kept ${swallowed.map((f) => `--${f}`).join(', ')} for itself: the "--" after "npm run heldout" didn't reach npm (Windows PowerShell drops it).\n`
        + `  In PowerShell, quote it: npm run heldout '--' ${cmd} …   (or use npm.cmd: npm.cmd run heldout -- ${cmd} …)`);
    }
  }
  // Reject flags the command doesn't read (a typo or a guessed flag would otherwise be silently ignored).
  const unknown = rest.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')[0]).filter((f) => !known.has(f));
  if (unknown.length) {
    throw new Error(`${cmd} does not take ${unknown.map((f) => `--${f}`).join(', ')}. It takes: ${[...known].sort().map((f) => `--${f}`).join(' ')}\n`
      + `  usage: heldout ${cmd} ${command.spec.usage}`);
  }
  setCommandLine(cmd, rest);
  await command.run({ ...parseArgs(rest), argv: rest });
}

// Run as a program, not when the self-tests import the command table (drive letters differ in case on Windows).
const same = (a: string, b: string) => (process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b);
if (process.argv[1] && same(path.resolve(process.argv[1]), path.resolve(import.meta.filename))) {
  const [cmd, ...rest] = process.argv.slice(2);
  main(() => dispatch(cmd, rest));
}
