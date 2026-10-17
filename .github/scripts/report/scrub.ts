/**
 * Retroactively scrub secret values from everything of a story: its record and its scratch area (`heldout run` does
 * this after every run).
 *
 *   heldout scrub <KEY> [--value "<extra literal to redact>"]...
 *
 * Secrets = env vars referenced by this story's test-data.json, plus any --value given
 * (e.g. a public demo password that lives in test-data.json as a literal). Password-textbox values in
 * snapshots are redacted regardless. Trace archives and the HTML report are scrubbed inside.
 */
import { flagList, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel } from '../core/files';
import { evalPaths } from '../core/paths';
import { scrubDir, secretValuesFor } from '../core/redact';
import { envNamesIn } from '../probe/accounts-recipe';

export const spec: CommandSpec = {
  name: 'scrub', group: 'Report', usage: 'KEY [--value <literal>]',
  about: 'remove the story\'s secrets from existing artifacts',
  flags: ['value'],
};

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const secrets = secretValuesFor(p.testData, process.env, [...flagList(flags, 'value'), ...envNamesIn(cfg.aut.accounts).map((n) => process.env[n] ?? '').filter(Boolean)]);
  let files = 0;
  for (const dir of [p.base, p.work.base]) files += scrubDir(dir, secrets.values).files;
  console.log(`🔒 ${key}: scrubbed ${files} artifact(s) under ${rel(p.base)} and ${rel(p.work.base)} (${secrets.values.length} secret value(s) + password-field values)`);
  if (secrets.weak.length) console.log(`  ⚠ refused as unsafe to replace literally (plain word / too short): ${secrets.weak.join(', ')}`);
}
