import type { HeldoutConfig } from '../config';
import { JiraCloudClient } from './cloud';
import { MockJiraClient } from './mock';
import type { IssueTracker } from './types';

export * from './types';
export { adfToMarkdown } from './adf';

/** JIRA_MODE=mock (default, file-backed simulator) | cloud (real Jira Cloud REST v3). */
export function createTracker(cfg: HeldoutConfig): IssueTracker {
  if (cfg.jira.mode === 'cloud') {
    return new JiraCloudClient(
      cfg.jira.baseUrl ?? '',
      process.env.JIRA_EMAIL ?? '',
      process.env.JIRA_API_TOKEN ?? '',
      cfg.jira.acceptanceCriteriaField ? [cfg.jira.acceptanceCriteriaField] : [],
    );
  }
  return new MockJiraClient(cfg.jira.mockRoot, cfg.jira.baseUrl);
}
