/**
 * Phase 1 — Fetch a story + its attachments from Jira (mock or cloud) and normalise it.
 *
 *   heldout fetch <KEY>
 *
 * Output (evaluations/<KEY>/requirement/):
 *   story.md          normalised requirement (front-matter + description + AC field + attachment index)
 *   raw-issue.json    untouched API payload
 *   attachments/*     downloaded attachment files (the evaluator's own published verdicts are skipped)
 *   CHANGES.md        appended when a re-fetch finds the requirement changed (previous revision → history/)
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { assertIssueKey, evalPaths, flagStr, loadConfig, main, parseArgs, rel, timestamp, writeFile } from './lib/config';
import { adfToMarkdown, createTracker } from './lib/jira';

const TEXT_EXT = new Set(['.md', '.txt', '.csv', '.json', '.feature', '.yml', '.yaml', '.xml', '.html']);
/** Files this skill itself uploads to the story — never treat them as requirement input. */
const OWN_OUTPUT = /^heldout-(verdict|evidence)-/;

const hashDir = (dir: string): Map<string, string> => new Map(fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile())
    .map((f) => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, f))).digest('hex')])
  : []);
const body = (md: string) => md.replace(/^fetchedAt: .*$/m, '').trim();

main(async () => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  const p = evalPaths(cfg, key);
  const tracker = createTracker(cfg);
  // Bind the story to an AUT profile on first fetch (--aut, else the default) so every later command targets it.
  const bindingNote = (() => {
    if (fs.existsSync(p.evaluationMeta)) {
      const bound = (JSON.parse(fs.readFileSync(p.evaluationMeta, 'utf8')) as { aut?: string }).aut;
      if (flagStr(flags, 'aut') && bound !== flagStr(flags, 'aut')) throw new Error(`${key} is bound to AUT "${bound}" (evaluation.json); edit that file to re-bind it`);
      return `bound to AUT "${bound ?? cfg.autId}"`;
    }
    writeFile(p.evaluationMeta, `${JSON.stringify({ key, aut: cfg.autId, createdAt: new Date().toISOString().slice(0, 10) }, null, 2)}\n`);
    return `bound to AUT "${cfg.autId}" (${cfg.aut.name}) → ${rel(p.evaluationMeta)}${Object.keys(cfg.auts).length > 1 && !flagStr(flags, 'aut') ? ' — the default profile; pass --aut <id> to pick another' : ''}`;
  })();

  const previousStory = fs.existsSync(p.storyMd) ? fs.readFileSync(p.storyMd, 'utf8') : undefined;
  const previousAttachments = hashDir(p.attachments);
  const stamp = timestamp();
  if (previousStory) { // keep the old revision until we know whether it changed
    const hist = path.join(p.requirement, 'history', stamp);
    fs.mkdirSync(path.join(hist, 'attachments'), { recursive: true });
    fs.writeFileSync(path.join(hist, 'story.md'), previousStory);
    for (const f of previousAttachments.keys()) fs.copyFileSync(path.join(p.attachments, f), path.join(hist, 'attachments', f));
  }

  const issue = await tracker.getIssue(key);
  writeFile(p.rawIssue, `${JSON.stringify(issue, null, 2)}\n`);

  const f = issue.fields;
  const attachments = (f.attachment ?? []).filter((a) => !OWN_OUTPUT.test(a.filename));
  const skipped = (f.attachment ?? []).length - attachments.length;
  fs.mkdirSync(p.attachments, { recursive: true });
  const index: string[] = [];
  for (const att of attachments) {
    const dest = path.join(p.attachments, att.filename);
    await tracker.downloadAttachment(key, att, dest);
    const kind = TEXT_EXT.has(path.extname(att.filename).toLowerCase()) ? 'text — read directly'
      : att.mimeType.startsWith('image/') ? 'image — open with the Read tool (vision)'
      : att.mimeType === 'application/pdf' ? 'PDF — open with the Read tool'
      : 'binary — inspect manually';
    index.push(`| ${att.filename} | ${att.mimeType} | ${att.size} | ${kind} | attachments/${att.filename} |`);
  }

  const OWN_COMMENT = /Posted automatically by the heldout-evaluator|Held-out evaluation: /;
  const humanComments = (f.comment?.comments ?? []).filter((c) => !OWN_COMMENT.test(typeof c.body === 'string' ? c.body : JSON.stringify(c.body)));
  const acField = cfg.jira.acceptanceCriteriaField;
  const acRaw = acField ? f[acField] : undefined;
  const md = [
    '---',
    `key: ${issue.key}`,
    `summary: ${JSON.stringify(f.summary)}`,
    `type: ${f.issuetype?.name ?? 'unknown'}`,
    `status: ${f.status?.name ?? 'unknown'}`,
    `priority: ${f.priority?.name ?? 'unknown'}`,
    `labels: [${(f.labels ?? []).join(', ')}]`,
    `source: ${tracker.mode === 'mock' ? 'mock-jira' : 'jira-cloud'}`,
    `url: ${tracker.browseUrl(key)}`,
    `fetchedAt: ${new Date().toISOString()}`,
    '---',
    '',
    `# ${issue.key}: ${f.summary}`,
    '',
    '## Description',
    '',
    adfToMarkdown(f.description) || '_(empty)_',
    '',
    ...(acRaw ? ['## Acceptance criteria (custom field)', '', adfToMarkdown(acRaw as never), ''] : []),
    // Clarifications often live in comments. The evaluator's own published comments are not requirement input.
    ...(humanComments.length ? ['## Comments (clarifications from the issue)', '',
      ...humanComments.flatMap((c) => [`**${c.author.displayName}** — ${c.created.slice(0, 10)}:`, '', typeof c.body === 'string' ? c.body : adfToMarkdown(c.body), '']), ''] : []),
    '## Attachments',
    '',
    ...(index.length
      ? ['| File | MIME | Bytes | How to read | Local path |', '| --- | --- | --- | --- | --- |', ...index]
      : ['_None_']),
    '',
  ].join('\n');
  writeFile(p.storyMd, md);

  console.log(`✔ Fetched ${key} from ${tracker.mode} Jira: "${f.summary}"`);
  console.log(`  AUT:         ${bindingNote}`);
  console.log(`  story:       ${rel(p.storyMd)}`);
  console.log(`  attachments: ${attachments.length} → ${rel(p.attachments)}/${skipped ? ` (skipped ${skipped} of the evaluator's own uploads)` : ''}`);
  for (const a of attachments) console.log(`    - ${a.filename} (${a.mimeType})`);

  // ---- revision detection ----
  const hist = path.join(p.requirement, 'history', stamp);
  if (!previousStory) { console.log(`\nNext (phase 1b): heldout contract ${key} --pack, then the heldout-contract-extractor and heldout-contract-reviewer subagents.`); return; }
  const now = hashDir(p.attachments);
  const attChanges = [
    ...[...now.keys()].filter((k) => !previousAttachments.has(k)).map((k) => `added ${k}`),
    ...[...previousAttachments.keys()].filter((k) => !now.has(k)).map((k) => `removed ${k}`),
    ...[...now.keys()].filter((k) => previousAttachments.has(k) && previousAttachments.get(k) !== now.get(k)).map((k) => `changed ${k}`),
  ];
  if (body(previousStory) === body(md) && !attChanges.length) {
    fs.rmSync(hist, { recursive: true, force: true });
    const histRoot = path.dirname(hist);
    if (fs.existsSync(histRoot) && !fs.readdirSync(histRoot).length) fs.rmdirSync(histRoot);
    console.log('\n= Requirement unchanged since the last fetch.');
    return;
  }
  const oldLines = new Set(body(previousStory).split('\n'));
  const newLines = new Set(body(md).split('\n'));
  const added = [...newLines].filter((l) => l.trim() && !oldLines.has(l));
  const removed = [...oldLines].filter((l) => l.trim() && !newLines.has(l));
  const entry = [
    `## Revision detected ${new Date().toISOString()}`, '',
    `Previous revision archived at \`requirement/history/${stamp}/\`.`, '',
    ...(attChanges.length ? ['**Attachments:** ' + attChanges.join(', '), ''] : []),
    ...(added.length ? ['**Added lines:**', '', ...added.map((l) => `+ ${l}`), ''] : []),
    ...(removed.length ? ['**Removed lines:**', '', ...removed.map((l) => `- ${l}`), ''] : []),
    '**Action:** rebuild requirement-contract.json (it is now stale), then update requirement-review.md and scenarios.feature. New/changed tests need a re-freeze (`integrity.ts KEY --snapshot --reason …`) before hardening.', '',
  ].join('\n');
  const changesFile = path.join(p.requirement, 'CHANGES.md');
  writeFile(changesFile, `${fs.existsSync(changesFile) ? fs.readFileSync(changesFile, 'utf8') + '\n' : '# Requirement changes\n\n'}${entry}`);
  console.log(`\n⚠ REQUIREMENT CHANGED since the last fetch: +${added.length}/-${removed.length} lines${attChanges.length ? `; attachments: ${attChanges.join(', ')}` : ''}`);
  for (const l of added.slice(0, 8)) console.log(`    + ${l.slice(0, 140)}`);
  for (const l of removed.slice(0, 8)) console.log(`    - ${l.slice(0, 140)}`);
  console.log(`  → ${rel(changesFile)} (previous revision in requirement/history/${stamp}/)`);
  if (fs.existsSync(p.scenarios)) console.log('  Scenarios/tests were written against the previous revision — re-review them before the next run.');
});
