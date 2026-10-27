/**
 * Retroactively scrub secret values from everything of a story: its record and its scratch area (`heldout run` does
 * this after every run).
 *
 *   heldout scrub <KEY> [--value "<extra literal to redact>"]...
 *   heldout scrub <KEY> --check     only list the files that still hold a secret value (exit 1 when any does)
 *
 * Secrets = env vars referenced by this story's test-data.json, plus any --value given
 * (e.g. a public demo password that lives in test-data.json as a literal). Password-textbox values in
 * snapshots are redacted regardless. Trace archives and the HTML report are scrubbed inside.
 */
import { flagList, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel } from '../core/files';
import { currentTestData, evalPaths } from '../core/paths';
import { findSecrets, scrubDir, secretValuesFor } from '../core/redact';
import { envNamesIn } from '../probe/accounts-recipe';

export const spec: CommandSpec = {
  name: 'scrub', group: 'Report', usage: 'KEY [--value <literal>] [--check]',
  about: 'remove the story\'s secrets from its record and scratch area (--check: only list where they are)',
  flags: ['check', 'value'],
};

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const secrets = secretValuesFor(currentTestData(p), process.env, [...flagList(flags, 'value'), ...envNamesIn(cfg.aut.accounts).map((n) => process.env[n] ?? '').filter(Boolean)]);
  if (flags.check) {
    const hits = [p.base, p.work.base].flatMap((dir) => findSecrets(dir, secrets.values));
    if (!hits.length) { console.log(`✔ ${key}: no secret value in ${rel(p.base)} or ${rel(p.work.base)} (${secrets.values.length} value(s) checked)`); return; }
    console.log(`✖ ${key}: a secret value is in ${hits.length} file(s) — scrub them: heldout scrub ${key}`);
    for (const h of hits.slice(0, 30)) console.log(`  ${rel(h.split(' › ')[0])}${h.includes(' › ') ? ` › ${h.split(' › ')[1]}` : ''}`);
    process.exitCode = 1;
    return;
  }
  let files = 0;
  for (const dir of [p.base, p.work.base]) files += scrubDir(dir, secrets.values).files;
  console.log(`🔒 ${key}: scrubbed ${files} artifact(s) under ${rel(p.base)} and ${rel(p.work.base)} (${secrets.values.length} secret value(s) + password-field values)`);
  if (secrets.weak.length) console.log(`  ⚠ refused as unsafe to replace literally (plain word / too short): ${secrets.weak.join(', ')}`);
}
