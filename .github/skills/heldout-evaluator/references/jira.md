# Jira and Confluence (Data Center / Server)

The skill reads a story from Jira and the Confluence pages it links, and publishes the verdict back to the story. It
never creates or transitions issues. `jira.mode` in `heldout.config.json` (or `JIRA_MODE`) picks the installation:
`datacenter` for your Jira and Confluence Data Center / Server, or `mock` for files that behave exactly like them.

## What a story's requirement is

`heldout fetch KEY` reads only:

- the **title**, the **description** and the **acceptance criteria** (the description, or the custom field
  `jira.acceptanceCriteriaField`, e.g. `customfield_10035`), kept as Jira holds them: wiki markup;
- the **images they show**: a screenshot embedded as `!shot.png!` (or `!shot.png|thumbnail!`) is downloaded to
  `requirement/linked/` so its text can be read (the evaluator transcribes it);
- the **Confluence pages they link**, in any form Confluence uses (`…/pages/viewpage.action?pageId=123`,
  `…/display/SPACE/Page+Title`, `…/spaces/SPACE/pages/123/…`, a `…/x/AbCd` short link). Each page becomes
  `requirement/linked/confluence-<id>-<title>.md` (its storage format turned into Markdown: headings, lists, tables, code
  blocks with their language, so an OpenAPI or YAML excerpt stays verbatim), and each image the page shows is saved
  beside it as `confluence-<id>-<file>`.

Nothing else: **comments are not read, and no attachment is downloaded or used** — on the issue or on a page — except
the images the description, the criteria or a page body show. There is no API document unless one of these sources
contains it. A page that can't be read (no access, deleted) is listed in `story.md` as **not read**, and the contract
records what that leaves open.

## Data Center

```
JIRA_MODE=datacenter
JIRA_BASE_URL=https://jira.example.com
JIRA_PAT=<a personal access token: your Jira profile → Personal Access Tokens>
CONFLUENCE_PAT=<only if Confluence needs its own token; JIRA_PAT otherwise>
```

Put the tokens in `.env` without showing them: `npm run heldout -- secret JIRA_PAT --ask`. `heldout doctor --jira`
signs in and lists the custom fields that may hold acceptance criteria. Both are called with `Authorization: Bearer <PAT>`.

Jira REST v2:
- `GET /rest/api/2/issue/{key}?fields=summary,description,…,attachment,<AC field>` (no comments)
- `GET <attachment.content>` for an embedded image only
- `POST /rest/api/2/issue/{key}/attachments` (`X-Atlassian-Token: no-check`, multipart): the verdict
- `POST /rest/api/2/issue/{key}/comment` (wiki markup body): the summary
- `PUT /rest/api/2/issue/{key}` (label update)

Confluence REST, on the link's own server and context path:
- `GET /rest/api/content/{id}?expand=body.storage`, or `GET /rest/api/content?spaceKey=…&title=…&expand=body.storage`
  for a `/display/…` link (a short link is followed to its page first)
- `GET /rest/api/content/{id}/child/attachment` to find the images the page body shows, then their download links

## Mock (default: nothing to connect to)

Files that hold exactly what Jira and Confluence Data Center answer, so switching to the real servers is only
`jira.mode` and `jira.baseUrl`, and a real response can be dropped in unchanged.

```
mock-jira/
  issues/<KEY>/issue.json                    GET /rest/api/2/issue/<KEY> (attachment URLs …/secure/attachment/<id>/<file>)
  issues/<KEY>/attachments/<file>            the files behind those URLs (the images the story shows, uploaded verdicts)
  issues/<KEY>/ISSUE_VIEW.md                 regenerated after every write (what a person would see)
  confluence/<id>/content.json               GET /rest/api/content/<id>?expand=body.storage
  confluence/<id>/attachments.json           GET /rest/api/content/<id>/child/attachment
  confluence/<id>/files/<file>               the files behind its download links
  outbox/<ts>__<KEY>__<op>.http              every write, as the REST call Jira Data Center would receive
```

### Authoring a story

```bash
npm run heldout -- new ABC-7 --from story.md [--ac-from ac.md] [--page SHOP:880001=cart-api.md]... [--force]
```

- The first `# ` heading of `story.md` is the summary; the rest is the description, stored as written (write it as you
  would in Jira: `!shot.png!` for a screenshot, `[text|url]` for a link).
- `--ac-from` puts the criteria in the custom field.
- `--page [<SPACE>:]<id>=<file>` creates a linked Confluence page: a `.md` file (its first `# ` heading is the title) is
  stored in storage format, and a `.html` file is taken as storage format already (e.g. exported from a real page).
  Link it from the story as `https://<confluence>/pages/viewpage.action?pageId=<id>` or `…/display/<SPACE>/<Title>`.
- Each image the story, the criteria or a page shows is taken from beside its file.
- `--force` replaces the story, e.g. to publish a new **revision**. The next `fetch` detects it, diffs it into
  `requirement/CHANGES.md` and archives the previous version under `requirement/history/`.
