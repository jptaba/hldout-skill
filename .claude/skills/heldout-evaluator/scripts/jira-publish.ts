/**
 * Phase 8 — Publish the verdict back to the Jira story, for a human to review.
 *
 *   heldout publish <KEY> [--dry-run]
 *
 * 1. attaches verdict.md as  heldout-verdict-<KEY>-<timestamp>.md  (full findings: traceability,
 *    reproduction steps, curl commands, evidence, reviewer decision checkboxes)
 * 2. posts an ADF summary comment: verdict, counts, coverage by test type, findings table
 * 3. sets label <prefix><verdict> (removing previous <prefix>* labels)
 *
 * It deliberately raises nothing else (no Bugs, no transitions): deciding what is a defect is the
 * reviewer's call, based on the evidence in the report.
 *
 * JIRA_MODE=mock → writes into mock-jira/ (issue.json, ISSUE_VIEW.md) and logs the would-be REST calls to mock-jira/outbox/.
 * JIRA_MODE=cloud → real Jira Cloud REST v3 (outward-facing: confirm with the user first).
 */
import fs from 'node:fs';
import path from 'node:path';
import { assertIssueKey, evalPaths, loadConfig, main, parseArgs, readJson, rel, writeFile } from './lib/config';
import { createTracker } from './lib/jira';
import { doc, h, p, panel, table, txt, ul } from './lib/jira/adf';

interface VerdictJson {
  key: string; verdict: string; reason: string; finalRun: string; integrity: string; amendments?: number;
  aut: { name: string; baseURL: string };
  summary: { total: number; passed: number; failed: number; flaky: number; skipped: number };
  applicationDefects: { id: string; title: string; confirmed: boolean; severity: string | null; criteria: string[]; tests: string[]; testType?: string; expected: string | null; actual: string | null }[];
  scriptDefectsRepaired: { run: string; scenario: string }[];
  uncoveredCriteria: string[];
  openQuestions?: string[];
  coverageByType?: { type: string; tests: number; passed: number; failed: number; defects: string[] }[];
}

const PANEL: Record<string, 'success' | 'error' | 'warning' | 'note'> = { PASS: 'success', FAIL: 'error', PASS_WITH_WARNINGS: 'warning', INCONCLUSIVE: 'note' };
const short = (v: unknown, n = 120) => { const s = String(v ?? '-'); return s.length > n ? `${s.slice(0, n)}…` : s; };

main(async () => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const pth = evalPaths(cfg, key);
  if (!fs.existsSync(pth.verdictJson)) throw new Error(`No verdict for ${key}. Run: heldout verdict ${key} first.`);
  const v = readJson<VerdictJson>(pth.verdictJson);
  const tracker = createTracker(cfg);

  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const uploadName = `heldout-verdict-${key}-${stamp}.md`;
  const label = `${cfg.jira.verdictLabelPrefix}${v.verdict.toLowerCase().replace(/_/g, '-')}`;
  const findings = v.applicationDefects.filter((d) => d.confirmed);

  const body = doc(
    h(3, `🧪 Held-out evaluation: ${v.verdict.replace(/_/g, ' ')} (recommendation)`),
    panel(PANEL[v.verdict] ?? 'note', p(txt(v.reason))),
    p(txt('AUT: ', 'strong'), `${v.aut.name} (${v.aut.baseURL})`),
    p(txt('Tests: ', 'strong'), `${v.summary.passed}/${v.summary.total} passed, ${v.summary.failed} failed, ${v.summary.flaky} flaky`,
      txt('  ·  Held-out integrity: ', 'strong'), `${v.integrity}${v.amendments ? ` (${v.amendments} audited amendment(s))` : ''}`,
      txt('  ·  Script defects self-repaired: ', 'strong'), String(v.scriptDefectsRepaired.length)),
    ...(v.coverageByType?.length ? [
      h(4, 'Coverage by test type'),
      table(['Test type', 'Tests', 'Passed', 'Failed', 'Findings'], v.coverageByType.map((c) => [c.type, String(c.tests), String(c.passed), String(c.failed), c.defects.join(', ') || '-'])),
    ] : []),
    ...(findings.length ? [
      h(4, `Findings for review (${findings.length})`),
      table(['ID', 'Suggested severity', 'Criteria', 'Type', 'Finding', 'Expected (requirement)', 'Actual (AUT)'],
        findings.map((d) => [d.id, d.severity ?? '-', d.criteria.join(', '), d.testType ?? '-', d.title, short(d.expected), short(d.actual)])),
      p(txt('Each finding in the attached report has reproduction steps (manual, curl and automated re-run), evidence and a reviewer-decision checkbox. No issues were raised automatically.', 'em')),
    ] : []),
    ...(v.openQuestions?.length ? [p(txt('Open questions (not tested): ', 'strong'), v.openQuestions.join(' · '))] : []),
    ...(v.uncoveredCriteria.length ? [p(txt('Not covered: ', 'strong'), v.uncoveredCriteria.join(', '))] : []),
    ul([[txt('Full report attached: '), txt(uploadName, 'code')], [txt(`Final run: ${v.finalRun}`)]]),
    p(txt('Posted automatically by the heldout-evaluator Claude skill.', 'em')),
  );

  if (flags['dry-run']) {
    console.log(`[dry-run] would attach ${rel(pth.verdictMd)} as ${uploadName}, set label ${label}, and comment:\n`);
    console.log(JSON.stringify(body, null, 2));
    return;
  }

  const att = await tracker.addAttachment(key, pth.verdictMd, uploadName);
  const comment = await tracker.addComment(key, body);
  const labels = await tracker.setLabels(key, [label], cfg.jira.verdictLabelPrefix);
  // Local record of what was published (status.ts and audits read it).
  const logFile = path.join(pth.base, 'publish-log.json');
  const log = fs.existsSync(logFile) ? readJson<unknown[]>(logFile) : [];
  log.push({ at: new Date().toISOString(), mode: tracker.mode, verdict: v.verdict, attachment: att.filename, commentId: comment.id, labels });
  writeFile(logFile, `${JSON.stringify(log, null, 2)}\n`);

  console.log(`✔ Published ${key} verdict to ${tracker.mode === 'mock' ? 'mock Jira (simulated upload)' : 'Jira Cloud'}`);
  console.log(`  attachment: ${att.filename} (id ${att.id}, ${att.size} B)`);
  console.log(`  comment:    id ${comment.id}`);
  console.log(`  labels:     ${labels.join(', ')}`);
  console.log(`  issue:      ${tracker.browseUrl(key)}`);
  if (tracker.mode === 'mock') {
    console.log(`  view:       ${cfg.jira.mockRoot}/issues/${key}/ISSUE_VIEW.md`);
    console.log(`  REST log:   ${cfg.jira.mockRoot}/outbox/ (requests a real Jira would have received)`);
  }
});
