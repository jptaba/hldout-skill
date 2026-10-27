/**
 * Jira Data Center / Server REST v2 shapes. Text fields (description, the acceptance-criteria custom field, comments)
 * are wiki markup. The mock stores the same shapes, so one fetch serves both.
 */

/** Atlassian Document Format: how the verdict comment is assembled before it becomes wiki markup (jira-adf.ts). */
export interface AdfNode {
  type: string;
  version?: number;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: AdfNode[];
}

export interface JiraAttachmentMeta {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  /** Data Center: absolute download URL. Mock: path relative to the issue (or page) folder. */
  content: string;
  created?: string;
  author?: { displayName: string };
}

export interface JiraComment {
  id: string;
  author: { displayName: string };
  body: string;
  created: string;
}

export interface JiraIssue {
  id?: string;
  key: string;
  self?: string;
  fields: {
    summary: string;
    description?: string | null;
    issuetype?: { name: string };
    status?: { name: string };
    priority?: { name: string };
    labels?: string[];
    attachment?: JiraAttachmentMeta[];
    comment?: { comments: JiraComment[]; total: number };
    [customField: string]: unknown;
  };
}

export interface IssueTracker {
  readonly mode: 'mock' | 'datacenter';
  getIssue(key: string): Promise<JiraIssue>;
  downloadAttachment(key: string, att: JiraAttachmentMeta, destFile: string): Promise<void>;
  addAttachment(key: string, filePath: string, uploadName?: string): Promise<JiraAttachmentMeta>;
  addComment(key: string, body: AdfNode): Promise<{ id: string }>;
  /** Adds labels, first removing existing labels that start with removePrefix. Returns the new label set. */
  setLabels(key: string, add: string[], removePrefix?: string): Promise<string[]>;
  browseUrl(key: string): string;
  /** Setup check: who we are authenticated as, and custom fields that may hold acceptance criteria. */
  diagnose(): Promise<{ user: string; acFieldCandidates: { id: string; name: string }[] }>;
}

/** A Confluence page a story links to: its body as Markdown (images named [attachment: <file>]) and its files. */
export interface WikiPage {
  id: string;
  title: string;
  url: string;
  body: string;
  attachments: JiraAttachmentMeta[];
}

export interface WikiReader {
  readonly mode: 'mock' | 'datacenter';
  getPage(url: string): Promise<WikiPage>;
  downloadAttachment(page: WikiPage, att: JiraAttachmentMeta, destFile: string): Promise<void>;
}
