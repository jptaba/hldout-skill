/**
 * Preflight on demand: traceability lint + AUT healthcheck for one story.
 *
 *   heldout lint <KEY> [--allow-unhardened] [--no-health]
 *   heldout lint <KEY> --allow-unhardened --no-health --draft-finished    the test author's last step: the draft lints
 *                                                                         clean and is complete; the freeze waits for this
 *
 * Exit 1 on any lint error or failed healthcheck. run.ts runs the same gates automatically.
 */
import type { Args, CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel } from '../core/files';
import { evalPaths } from '../core/paths';
import { markDraftFinished } from './draft';
import { healthcheck, lintEvaluation, printFindings } from './preflight';

export const spec: CommandSpec = {
  name: 'lint', group: 'Tests', usage: 'KEY [--allow-unhardened] [--no-health] [--draft-finished]',
  about: 'traceability lint + AUT healthcheck',
  flags: ['allow-unhardened', 'no-health', 'draft-finished'],
};

export async function run({ _, flags }: Args): Promise<void> {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  console.log(`Preflight ${key} → AUT profile "${cfg.autId}" (${cfg.aut.name})`);
  const findings = lintEvaluation(cfg, key, { allowUnhardened: Boolean(flags['allow-unhardened']) });
  printFindings(findings);
  let healthy = true;
  if (!flags['no-health']) {
    for (const h of await healthcheck(cfg)) {
      healthy &&= h.ok;
      console.log(`  ${h.ok && !h.slow ? "✔" : h.ok ? "⚠" : "✖"} health ${h.url} → ${h.status ?? h.error} (slowest ${h.ms} ms)`);
    }
  }
  if (findings.some((f) => f.level === 'error') || !healthy) process.exit(1);
  if (flags['draft-finished']) {
    const p = evalPaths(cfg, key);
    markDraftFinished(p);
    console.log(`✔ the draft of ${key} is marked finished (${rel(p.tests)} as it is now): it can be frozen`);
  }
}
