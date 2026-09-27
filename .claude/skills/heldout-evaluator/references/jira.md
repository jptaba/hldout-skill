# Jira integration

Both adapters implement the same `IssueTracker` contract (`scripts/lib/jira/types.ts`): `getIssue`,
`downloadAttachment`, `addAttachment`, `addComment`, `setLabels` and `browseUrl`. That is the full
surface. The skill reads stories and publishes reports; it never creates or transitions issues.
Select the adapter with `JIRA_MODE` (env) or `jira.mode` (`heldout.config.json`).

## Mock (default — no subscription needed)

A folder that behaves like a Jira instance. Payloads use the **Jira Cloud REST v3 shape**, so the
same normaliser handles mock and cloud, and a real export can be dropped in unchanged.

```
mock-jira/
  issues/<KEY>/issue.json          GET /rest/api/3/issue/<KEY> response body
  issues/<KEY>/attachments/<file>  binaries; fields.attachment[].content = "attachments/<file>"
  issues/<KEY>/ISSUE_VIEW.md       regenerated after every write (what a person would see)
  outbox/<ts>__<KEY>__<op>.http    every write, as the REST call Jira Cloud would receive
```

### Authoring a story (Markdown → ADF)

```bash
npm run heldout -- new ABC-7 --from story.md --label api --attach rules.csv --attach contract.md [--force]
```

The first `# ` heading becomes the summary, and the rest becomes the ADF description. Headings,
lists (2-space nesting), tables, code fences, quotes, bold, italics, code and links are supported.
`--force` replaces an existing story, for example to publish a new **revision**. On the next
`jira-fetch`, the revision is detected, diffed into `requirement/CHANGES.md` and the previous
version is archived under `requirement/history/`.

You can also drop in a real export: `GET /rest/api/3/issue/<KEY>`, saved as `issue.json`.

## Cloud

```
JIRA_MODE=cloud
JIRA_BASE_URL=https://<site>.atlassian.net
JIRA_EMAIL=<account email>
JIRA_API_TOKEN=<https://id.atlassian.com/manage-profile/security/api-tokens>
```

Optional `jira.acceptanceCriteriaField` (e.g. `customfield_10035`), if your instance keeps
acceptance criteria in a custom field. It is fetched and appended to `story.md`.

Endpoints used:
- `GET /rest/api/3/issue/{key}`
- `GET <attachment.content>`
- `POST /rest/api/3/issue/{key}/attachments` (`X-Atlassian-Token: no-check`, multipart)
- `POST /rest/api/3/issue/{key}/comment` (ADF body)
- `PUT /rest/api/3/issue/{key}` (label update)
