import type { HeldoutConfig } from './config';
import { ConfluenceDataCenterClient } from './confluence';
import { JiraDataCenterClient } from './jira-datacenter';
import type { IssueTracker, JiraAttachmentMeta, WikiReader } from './jira-types';
import { MockConfluenceClient } from './mock/confluence-client';
import { MockJiraClient } from './mock/jira-client';

export * from './jira-types';
export { confluenceLinks } from './confluence';

/** JIRA_MODE=mock (default, file-backed simulator) | datacenter (Jira Data Center / Server, REST v2). */
export function createTracker(cfg: HeldoutConfig): IssueTracker {
  if (cfg.jira.mode === 'datacenter') {
    return new JiraDataCenterClient(cfg.jira.baseUrl ?? '', process.env.JIRA_PAT ?? '', cfg.jira.acceptanceCriteriaField ? [cfg.jira.acceptanceCriteriaField] : []);
  }
  return new MockJiraClient(cfg.jira.mockRoot, cfg.jira.baseUrl);
}

/** Confluence for the pages a story links to: Confluence Data Center beside Jira Data Center, or the mock. */
export function createWiki(cfg: HeldoutConfig): WikiReader {
  if (cfg.jira.mode === 'datacenter') return new ConfluenceDataCenterClient(process.env.CONFLUENCE_PAT ?? process.env.JIRA_PAT ?? '');
  return new MockConfluenceClient(cfg.jira.mockRoot);
}

/** The files a text shows as images: Jira wiki markup !shot.png! / !shot.png|thumbnail!, and [attachment: shot.png] from a page. */
export function embeddedFiles(text: string): string[] {
  return [...new Set([...[...text.matchAll(/!([^!|\n\s][^!|\n]*?)(?:\|[^!\n]*)?!/g)].map((m) => m[1].trim()),
    ...[...text.matchAll(/\[attachment: ([^\]]+)\]/g)].map((m) => m[1].trim())])];
}

/** The attached files a description, the acceptance criteria or a page show inline. Only these are requirement. */
export function embeddedAttachments<T extends JiraAttachmentMeta>(attachments: T[], text: string): T[] {
  const shown = embeddedFiles(text);
  return attachments.filter((a) => shown.includes(a.filename));
}
