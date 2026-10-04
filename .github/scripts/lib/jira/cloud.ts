/**
 * Jira Cloud REST v3 client. Auth: basic (JIRA_EMAIL + JIRA_API_TOKEN). Uses Node's global fetch/FormData.
 * Not exercised in the demo (no Jira subscription) but implements the same contract as the mock.
 */
import fs from 'node:fs';
import path from 'node:path';
import { mimeOf } from './mock';
import type { AdfNode, IssueTracker, JiraAttachmentMeta, JiraIssue } from './types';

export class JiraCloudClient implements IssueTracker {
  readonly mode = 'cloud' as const;
  private readonly auth: string;

  constructor(private readonly baseUrl: string, email: string, token: string, private readonly extraFields: string[] = []) {
    if (!baseUrl || !email || !token) throw new Error('Cloud mode needs JIRA_BASE_URL, JIRA_EMAIL and JIRA_API_TOKEN');
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.auth = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
  }

  private async call(method: string, urlOrPath: string, init: { json?: unknown; body?: FormData; headers?: Record<string, string> } = {}): Promise<Response> {
    const url = urlOrPath.startsWith('http') ? urlOrPath : `${this.baseUrl}${urlOrPath}`;
    const headers: Record<string, string> = { Authorization: this.auth, Accept: 'application/json', ...init.headers };
    if (init.json !== undefined) headers['Content-Type'] = 'application/json';
    const res = await fetch(url, { method, headers, body: init.body ?? (init.json !== undefined ? JSON.stringify(init.json) : undefined), redirect: 'follow' });
    if (!res.ok) throw new Error(`Jira ${method} ${url} → ${res.status} ${res.statusText}: ${(await res.text()).slice(0, 500)}`);
    return res;
  }

  async getIssue(key: string): Promise<JiraIssue> {
    const fields = ['summary', 'description', 'issuetype', 'status', 'priority', 'labels', 'attachment', 'comment', ...this.extraFields].join(',');
    return (await this.call('GET', `/rest/api/3/issue/${encodeURIComponent(key)}?fields=${fields}`)).json() as Promise<JiraIssue>;
  }

  async downloadAttachment(_key: string, att: JiraAttachmentMeta, destFile: string): Promise<void> {
    const res = await this.call('GET', att.content, { headers: { Accept: '*/*' } });
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.writeFileSync(destFile, Buffer.from(await res.arrayBuffer()));
  }

  async addAttachment(key: string, filePath: string, uploadName = path.basename(filePath)): Promise<JiraAttachmentMeta> {
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(filePath)], { type: mimeOf(uploadName) }), uploadName);
    const res = await this.call('POST', `/rest/api/3/issue/${encodeURIComponent(key)}/attachments`, { body: form, headers: { 'X-Atlassian-Token': 'no-check' } });
    return ((await res.json()) as JiraAttachmentMeta[])[0];
  }

  async addComment(key: string, body: AdfNode): Promise<{ id: string }> {
    return (await this.call('POST', `/rest/api/3/issue/${encodeURIComponent(key)}/comment`, { json: { body } })).json() as Promise<{ id: string }>;
  }

  async setLabels(key: string, add: string[], removePrefix?: string): Promise<string[]> {
    const current = (await this.getIssue(key)).fields.labels ?? [];
    const remove = removePrefix ? current.filter((l) => l.startsWith(removePrefix) && !add.includes(l)) : [];
    await this.call('PUT', `/rest/api/3/issue/${encodeURIComponent(key)}`, {
      json: { update: { labels: [...remove.map((l) => ({ remove: l })), ...add.map((l) => ({ add: l }))] } },
    });
    return [...new Set([...current.filter((l) => !remove.includes(l)), ...add])];
  }

  async diagnose(): Promise<{ user: string; acFieldCandidates: { id: string; name: string }[] }> {
    const me = (await (await this.call('GET', '/rest/api/3/myself')).json()) as { displayName?: string; emailAddress?: string };
    const fields = (await (await this.call('GET', '/rest/api/3/field')).json()) as { id: string; name: string; custom?: boolean }[];
    return {
      user: me.displayName ?? me.emailAddress ?? 'unknown',
      acFieldCandidates: fields.filter((f) => f.custom && /accept|criteria|\bAC\b|definition of done|DoD/i.test(f.name)).map((f) => ({ id: f.id, name: f.name })),
    };
  }

  browseUrl(key: string): string {
    return `${this.baseUrl}/browse/${key}`;
  }
}
