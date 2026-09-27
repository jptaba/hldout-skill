/**
 * File-backed Jira simulator. Layout:
 *   <mockRoot>/issues/<KEY>/issue.json        Jira REST v3 issue payload
 *   <mockRoot>/issues/<KEY>/attachments/*     attachment binaries (issue.json → fields.attachment[].content)
 *   <mockRoot>/issues/<KEY>/ISSUE_VIEW.md     human-readable rendering, regenerated after every write
 *   <mockRoot>/outbox/*.http                  the exact REST calls a real Jira would have received
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, timestamp, writeFile } from '../config';
import { adfToMarkdown } from './adf';
import type { AdfNode, IssueTracker, JiraAttachmentMeta, JiraIssue } from './types';

const MIME: Record<string, string> = {
  '.md': 'text/markdown', '.txt': 'text/plain', '.csv': 'text/csv', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf',
  '.feature': 'text/plain', '.html': 'text/html', '.zip': 'application/zip',
};
export const mimeOf = (file: string) => MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';

export class MockJiraClient implements IssueTracker {
  readonly mode = 'mock' as const;
  private readonly root: string;

  constructor(mockRoot: string, private readonly baseUrl = 'https://your-domain.atlassian.net', private readonly actor = 'Held-out Evaluator (bot)') {
    this.root = path.resolve(ROOT, mockRoot);
  }

  private issueDir(key: string) { return path.join(this.root, 'issues', key); }
  private issueFile(key: string) { return path.join(this.issueDir(key), 'issue.json'); }

  private load(key: string): JiraIssue {
    const file = this.issueFile(key);
    if (!fs.existsSync(file)) throw new Error(`[mock-jira] Issue ${key} does not exist (${file}). 404 Issue does not exist or you do not have permission to see it.`);
    return JSON.parse(fs.readFileSync(file, 'utf8')) as JiraIssue;
  }

  private save(issue: JiraIssue): void {
    writeFile(this.issueFile(issue.key), `${JSON.stringify(issue, null, 2)}\n`);
    writeFile(path.join(this.issueDir(issue.key), 'ISSUE_VIEW.md'), renderIssueView(issue, this.browseUrl(issue.key)));
  }

  /** Log the request a real Jira Cloud instance would receive, so the simulation is auditable. */
  private outbox(key: string, op: string, method: string, urlPath: string, headers: Record<string, string>, body: string): string {
    const file = path.join(this.root, 'outbox', `${timestamp()}__${key}__${op}.http`);
    const lines = [
      `### ${op} (simulated — no Jira subscription; this request was NOT sent)`,
      `${method} ${this.baseUrl}${urlPath}`,
      'Authorization: Basic <base64(JIRA_EMAIL:JIRA_API_TOKEN)>',
      ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`),
      '',
      body,
      '',
    ];
    writeFile(file, lines.join('\n'));
    return file;
  }

  async getIssue(key: string): Promise<JiraIssue> {
    return this.load(key);
  }

  async downloadAttachment(key: string, att: JiraAttachmentMeta, destFile: string): Promise<void> {
    const src = path.resolve(this.issueDir(key), att.content);
    if (!fs.existsSync(src)) throw new Error(`[mock-jira] attachment binary missing: ${src}`);
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.copyFileSync(src, destFile);
  }

  async addAttachment(key: string, filePath: string, uploadName = path.basename(filePath)): Promise<JiraAttachmentMeta> {
    const issue = this.load(key);
    const dest = path.join(this.issueDir(key), 'attachments', uploadName);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(filePath, dest);
    const existing = issue.fields.attachment ?? [];
    const meta: JiraAttachmentMeta = {
      id: String(10000 + existing.length + 1 + Math.floor(Math.random() * 1000)),
      filename: uploadName,
      mimeType: mimeOf(uploadName),
      size: fs.statSync(dest).size,
      content: `attachments/${uploadName}`,
      created: new Date().toISOString(),
      author: { displayName: this.actor },
    };
    issue.fields.attachment = [...existing.filter((a) => a.filename !== uploadName), meta];
    this.save(issue);
    this.outbox(key, 'add-attachment', 'POST', `/rest/api/3/issue/${key}/attachments`,
      { 'X-Atlassian-Token': 'no-check', 'Content-Type': 'multipart/form-data; boundary=----heldout' },
      [`------heldout`, `Content-Disposition: form-data; name="file"; filename="${uploadName}"`, `Content-Type: ${meta.mimeType}`, '',
        `<${meta.size} bytes from ${path.relative(ROOT, filePath)}>`, `------heldout--`].join('\n'));
    return meta;
  }

  async addComment(key: string, body: AdfNode): Promise<{ id: string }> {
    const issue = this.load(key);
    const comments = issue.fields.comment?.comments ?? [];
    const id = String(20000 + comments.length + 1);
    comments.push({ id, author: { displayName: this.actor }, body, created: new Date().toISOString() });
    issue.fields.comment = { comments, total: comments.length };
    this.save(issue);
    this.outbox(key, 'add-comment', 'POST', `/rest/api/3/issue/${key}/comment`,
      { 'Content-Type': 'application/json' }, JSON.stringify({ body }, null, 2));
    return { id };
  }

  async setLabels(key: string, add: string[], removePrefix?: string): Promise<string[]> {
    const issue = this.load(key);
    const before = issue.fields.labels ?? [];
    const removed = removePrefix ? before.filter((l) => l.startsWith(removePrefix) && !add.includes(l)) : [];
    issue.fields.labels = [...new Set([...before.filter((l) => !removed.includes(l)), ...add])];
    this.save(issue);
    this.outbox(key, 'update-labels', 'PUT', `/rest/api/3/issue/${key}`, { 'Content-Type': 'application/json' },
      JSON.stringify({ update: { labels: [...removed.map((l) => ({ remove: l })), ...add.map((l) => ({ add: l }))] } }, null, 2));
    return issue.fields.labels;
  }

  async diagnose(): Promise<{ user: string; acFieldCandidates: { id: string; name: string }[] }> {
    return { user: 'mock (file-backed Jira)', acFieldCandidates: [] };
  }

  browseUrl(key: string): string {
    return `${this.baseUrl}/browse/${key}`;
  }
}

/** Render the mock issue the way a person would see it in Jira (for the simulated "upload"). */
export function renderIssueView(issue: JiraIssue, url: string): string {
  const f = issue.fields;
  const out = [
    `<!-- Generated by the mock Jira adapter. Simulates ${url} -->`,
    `# ${issue.key}: ${f.summary}`,
    '',
    `| Type | Status | Priority | Labels |`,
    `| --- | --- | --- | --- |`,
    `| ${f.issuetype?.name ?? '-'} | ${f.status?.name ?? '-'} | ${f.priority?.name ?? '-'} | ${(f.labels ?? []).map((l) => `\`${l}\``).join(' ') || '-'} |`,
    '',
    '## Description',
    '',
    adfToMarkdown(f.description),
    '',
    '## Attachments',
    '',
    ...(f.attachment?.length
      ? f.attachment.map((a) => `- 📎 [${a.filename}](${a.content}) — ${a.mimeType}, ${a.size} B${a.author ? `, by ${a.author.displayName}` : ''}${a.created ? ` on ${a.created}` : ''}`)
      : ['_None_']),
    '',
    '## Activity — Comments',
    '',
  ];
  for (const c of f.comment?.comments ?? []) {
    out.push(`### 💬 ${c.author.displayName} — ${c.created}`, '', adfToMarkdown(c.body), '', '---', '');
  }
  if (!f.comment?.comments?.length) out.push('_No comments yet_', '');
  return out.join('\n');
}
