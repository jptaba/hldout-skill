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
import { knownFlags } from './lib/config';

interface Command { script: string; args: string; about: string; group: string }
const COMMANDS: Record<string, Command> = {
  init: { script: 'init.ts', group: 'Setup', args: '--base-url <url> [--api-base-url <url>] [--name …] [--profile id] [--install]', about: 'scaffold config, npm script, .gitignore, .env (never overwrites)' },
  'add-aut': { script: 'init.ts', group: 'Setup', args: '<id> --base-url <url> [--api-base-url <url>]', about: 'add another application profile' },
  doctor: { script: 'doctor.ts', group: 'Setup', args: '[--jira] [--offline] [--learn]', about: 'check that everything is wired up, with a fix for each problem; --learn records the app\'s pages and endpoints' },
  secret: { script: 'secret.ts', group: 'Setup', args: 'NAME --generate | --ask  [--force]', about: 'a secret into .env without showing it: generated, or typed at a hidden prompt' },
  accounts: { script: 'accounts.ts', group: 'Setup', args: '--add-existing --username … --password-env NAME|--password-vault path#field  | --key KEY --from-chain chain.json  | --check', about: 'test accounts: existing ones (.env, environment, Vault) or created by the tests; checked live' },
  status: { script: 'status.ts', group: 'Setup', args: '[KEY]', about: 'where each story is in the pipeline and the next command' },
  new: { script: 'mock-jira-create.ts', group: 'Requirement', args: 'KEY --from story.md [--attach file]…', about: 'create a story in the mock Jira (no Jira needed)' },
  fetch: { script: 'jira-fetch.ts', group: 'Requirement', args: 'KEY [--aut id]', about: 'fetch story + attachments; binds the story to an AUT profile' },
  contract: { script: 'contract.ts', group: 'Requirement', args: 'KEY [--pack | --review-prompt | --questions | --resolve G1 --value … --evidence … | --answer G2 --value … --by … | --allow-unreviewed]', about: 'evidence pack + checks for the model-built, independently reviewed requirement contract' },
  scaffold: { script: 'scaffold.ts', group: 'Requirement', args: 'KEY', about: 'generate scenarios.feature + spec skeletons from the contract' },
  lint: { script: 'lint.ts', group: 'Tests', args: 'KEY [--fix-tags] [--allow-unhardened] [--no-health]', about: 'traceability lint + AUT healthcheck' },
  integrity: { script: 'integrity.ts', group: 'Tests', args: 'KEY [--snapshot [--reason …] | --amend "<assertion>" --reason …]', about: 'freeze the draft / verify nothing expected changed' },
  inspect: { script: 'inspect.ts', group: 'Hardening', args: '--key KEY --url <path> [--steps steps.json] [--probe <locator>]… [--out report.md]', about: 'tier-3 UI inspector: ARIA snapshot + ranked locators' },
  'api-probe': { script: 'api-probe.ts', group: 'Hardening', args: '--key KEY <METHOD> <path> | --chain chain.json', about: 'call the API (or a chain of calls) with redacted output' },
  'mcp-probe': { script: 'mcp-probe.ts', group: 'Hardening', args: '--key KEY --steps steps.json [--var name=value]… [--out report.md]', about: 'tier 2: drive the Playwright MCP server over stdio' },
  knowledge: { script: 'knowledge.ts', group: 'Hardening', args: 'KEY [--all | --add <kind> … --for SCN | --stale <key> | --harvest [--apply]]  |  --aut id [--log | --compact]', about: 'app knowledge: how to drive the app, reused by later stories (opens after the freeze)' },
  run: { script: 'run.ts', group: 'Run', args: 'KEY [--label eval] [--grep …] [--repeat-each N] [--capture] [--wait-healthy 300]', about: 'preflight + run the held-out suite' },
  triage: { script: 'triage.ts', group: 'Run', args: 'KEY [--set SCN --category … --rationale …] [--carry-from auto]', about: 'classify failures; record confirmed decisions' },
  verdict: { script: 'verdict.ts', group: 'Report', args: 'KEY', about: 'render verdict.md / verdict.json' },
  publish: { script: 'jira-publish.ts', group: 'Report', args: 'KEY', about: 'attach the verdict, comment, label (never creates issues)' },
  scrub: { script: 'scrub.ts', group: 'Report', args: 'KEY [--value <literal>]', about: 'remove the story\'s secrets from existing artifacts' },
};

function help(): void {
  console.log('Held-out evaluator — usage: heldout <command> [args]\n');
  let group = '';
  for (const [name, c] of Object.entries(COMMANDS)) {
    if (c.group !== group) { group = c.group; console.log(`${group}`); }
    console.log(`  ${name.padEnd(10)} ${c.about}\n  ${' '.repeat(10)} ${c.args}`);
  }
  console.log('\nFirst time here?  heldout init --base-url https://your-app --install   then   heldout doctor');
  console.log('Then ask Opus:     "Run a held-out evaluation of ABC-123"');
}

const [cmd, ...rest] = process.argv.slice(2);
if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') { help(); process.exit(0); }
const c = COMMANDS[cmd];
if (!c) {
  const near = Object.keys(COMMANDS).filter((k) => k.startsWith(cmd.slice(0, 3)));
  console.error(`✖ Unknown command "${cmd}".${near.length ? ` Did you mean: ${near.join(', ')}?` : ''} Run "heldout help".`);
  process.exit(1);
}
const script = path.join(import.meta.dirname, c.script);
// Reject flags the command doesn't read (a typo or a guessed flag would otherwise be silently ignored).
const src = fs.readFileSync(script, 'utf8');
if (rest.includes('--help') || rest.includes('-h')) {
  // Each script documents its usage in its leading comment.
  console.log((src.match(/^\/\*\*([\s\S]*?)\*\//)?.[1] ?? '').split('\n').map((l) => l.replace(/^ ?\* ?/, '')).join('\n').trim());
  process.exit(0);
}
const known = knownFlags(src);
const unknown = rest.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')[0]).filter((f) => !known.has(f));
if (unknown.length) {
  console.error(`✖ ${cmd} does not take ${unknown.map((f) => `--${f}`).join(', ')}. It takes: ${[...known].sort().map((f) => `--${f}`).join(' ')}`);
  console.error(`  usage: heldout ${cmd} ${c.args}`);
  process.exit(1);
}
// Each script reads process.argv.slice(2) and runs on import.
process.argv = [process.argv[0], script, ...(cmd === 'add-aut' ? ['--add-aut', ...rest] : rest)];
await import(pathToFileURL(script).href);
