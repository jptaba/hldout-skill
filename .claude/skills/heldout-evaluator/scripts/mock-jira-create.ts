/**
 * Author a story in the file-based mock Jira from Markdown (no Jira subscription needed).
 *
 *   heldout new <KEY> --from story.md
 *       [--summary "..."] [--type Story] [--status "Ready for QA"] [--priority High] [--label a --label b]
 *       [--attach file]... [--ac-from ac.md] [--comment-from note.md]... [--force]
 *
 *   --ac-from       acceptance criteria in a custom field (jira.acceptanceCriteriaField, default customfield_10035), as many teams do
 *   --comment-from  a comment on the issue (e.g. a PO clarification); author "Product Owner" unless the file starts with "Author: <name>"
 *
 * The first "# " heading of the markdown becomes the summary unless --summary is given; the rest
 * becomes the ADF description. Attachments are copied into the issue. Produces a Jira REST v3-shaped
 * issue.json, so jira-fetch.ts treats it exactly like a real Jira Cloud issue.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, assertIssueKey, flagList, flagStr, loadConfig, main, parseArgs, rel, writeFile } from './lib/config';
import { markdownToAdf } from './lib/jira/adf';
import { mimeOf, renderIssueView } from './lib/jira/mock';
import type { JiraIssue } from './lib/jira/types';

main(() => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const from = flagStr(flags, 'from');
  if (!from) throw new Error('--from <story.md> is required');
  const cfg = loadConfig();
  const dir = path.join(ROOT, cfg.jira.mockRoot, 'issues', key);
  if (fs.existsSync(path.join(dir, 'issue.json')) && !flags.force) throw new Error(`${key} already exists in the mock (use --force to overwrite)`);

  let md = fs.readFileSync(from, 'utf8');
  const h1 = md.match(/^#\s+(.+)$/m);
  const summary = flagStr(flags, 'summary') ?? h1?.[1].replace(new RegExp(`^${key}:?\\s*`), '') ?? key;
  if (h1 && !flagStr(flags, 'summary')) md = md.replace(h1[0], '');

  fs.mkdirSync(path.join(dir, 'attachments'), { recursive: true });
  const attachment = flagList(flags, 'attach').map((file, i) => {
    const name = path.basename(file);
    fs.copyFileSync(file, path.join(dir, 'attachments', name));
    return { id: String(20000 + Number(key.split('-')[1]) * 10 + i), filename: name, mimeType: mimeOf(name), size: fs.statSync(file).size,
      content: `attachments/${name}`, created: new Date().toISOString(), author: { displayName: 'Product Owner' } };
  });

  const acFrom = flagStr(flags, 'ac-from');
  const acField = cfg.jira.acceptanceCriteriaField || 'customfield_10035';
  if (acFrom && !cfg.jira.acceptanceCriteriaField) console.log(`⚠ --ac-from writes ${acField}; set jira.acceptanceCriteriaField to it in heldout.config.json so fetch reads it`);
  const comments = flagList(flags, 'comment-from').map((file, i) => {
    let text = fs.readFileSync(file, 'utf8').trim();
    const author = text.match(/^Author:\s*(.+)$/m)?.[1] ?? 'Product Owner';
    text = text.replace(/^Author:.*\n?/m, '').trim();
    return { id: String(30000 + i), author: { displayName: author }, body: markdownToAdf(text), created: new Date(Date.now() - (9 - i) * 3600_000).toISOString() };
  });
  const issue: JiraIssue = {
    id: String(10000 + Number(key.split('-')[1])),
    key,
    self: `${cfg.jira.baseUrl ?? 'https://your-domain.atlassian.net'}/rest/api/3/issue/${key}`,
    fields: {
      summary,
      issuetype: { name: flagStr(flags, 'type') ?? 'Story' },
      status: { name: flagStr(flags, 'status') ?? 'Ready for QA' },
      priority: { name: flagStr(flags, 'priority') ?? 'High' },
      labels: flagList(flags, 'label'),
      description: markdownToAdf(md.trim()),
      attachment,
      comment: { comments, total: comments.length },
      ...(acFrom ? { [acField]: markdownToAdf(fs.readFileSync(acFrom, 'utf8').trim()) } : {}),
    },
  };
  writeFile(path.join(dir, 'issue.json'), `${JSON.stringify(issue, null, 2)}\n`);
  writeFile(path.join(dir, 'ISSUE_VIEW.md'), renderIssueView(issue, `${cfg.jira.baseUrl}/browse/${key}`));
  console.log(`✔ mock Jira issue ${key} "${summary}" → ${rel(dir)}/ (${attachment.length} attachment(s))`);
  console.log(`\nNext: npm run heldout -- fetch ${key}   (or ask Claude: "Run a held-out evaluation of ${key}")`);
});
