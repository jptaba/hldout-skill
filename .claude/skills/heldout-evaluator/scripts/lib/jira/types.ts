/** Jira REST v3-shaped types. The mock store uses the same shapes so one normaliser serves both. */

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
  /** Cloud: absolute download URL. Mock: path relative to the issue folder. */
  content: string;
  created?: string;
  author?: { displayName: string };
}

export interface JiraComment {
  id: string;
  author: { displayName: string };
  body: AdfNode | string;
  created: string;
}

export interface JiraIssue {
  id?: string;
  key: string;
  self?: string;
  fields: {
    summary: string;
    description?: AdfNode | string | null;
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
  readonly mode: 'mock' | 'cloud';
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
