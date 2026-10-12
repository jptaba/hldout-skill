/**
 * Preflight on demand: traceability lint + AUT healthcheck for one story.
 *
 *   heldout lint <KEY> [--allow-unhardened] [--no-health]
 *   heldout lint <KEY> --allow-unhardened --no-health --draft-finished    the test author's last step: the draft lints
 *                                                                         clean and is complete; the freeze waits for this
 *
 * Exit 1 on any lint error or failed healthcheck. run.ts runs the same gates automatically.
 */
import { assertIssueKey, evalPaths, loadConfig, main, parseArgs, rel } from './config';
import { markDraftFinished } from './phases';
import { healthcheck, lintEvaluation, printFindings } from './preflight';

main(async () => {
  const { _, flags } = parseArgs();
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
    markDraftFinished(p.base, p.tests);
    console.log(`✔ the draft of ${key} is marked finished (${rel(p.tests)} as it is now): it can be frozen`);
  }
});
