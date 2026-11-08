# Setup: a project's first use, more applications, test accounts, upkeep

Read this when the project has no `heldout.config.json`, or when the user asks to add an application, an account or a
Jira connection. It takes about 2 minutes. `$H` is `npm run heldout --` (in Windows PowerShell `npm run heldout '--'`).

## First use in a project

1. Ask the user, in one question (`AskUserQuestion` in Claude Code, the chat in GitHub Copilot), for anything you can't
   infer. Setup is the only time questions are asked: once a story is fetched, the evaluation runs to its published
   verdict without the user, so settle here everything a story may need.
   - the web app URL
   - the API URL (if different)
   - Jira: mock (nothing to connect to) or your Jira Data Center (its URL; the user puts a personal access token in
     `.env` with `npm run heldout -- secret JIRA_PAT --ask`)
   - test accounts: the tests create their own / existing accounts with passwords in `.env` or CI variables /
     existing accounts in HashiCorp Vault / none needed; and, when the application has kinds of user a person must
     create (an administrator), an account of each kind
   - with a real Jira: whether each verdict is published to its story automatically (the default) or left for a
     person to publish (`"publish": "manual"` under `jira` in `heldout.config.json`)
2. Run setup from the user's clone of the skill (ask where it is if you don't know; usually `$HOME/heldout-skill`), in
   the project's folder:

```bash
& "$HOME/heldout-skill/setup.ps1" -BaseUrl <url> [--api-base-url <url>] [--name "<app>"] [--jira mock|datacenter] [--jira-url <url>]   # PowerShell
"$HOME/heldout-skill/setup.sh" --base-url <url> [--api-base-url <url>] [--name "<app>"] [--jira mock|datacenter] [--jira-url <url>]   # bash, zsh
```

Setup pulls the clone, checks Node, runs the skill's `init --install` and then `doctor` (every problem comes with the
command that fixes it). `init`, started from the clone, first runs its `update`, which copies, as they are in the skill
repository (refreshed on later updates unless the project changed them):

- the skill into `.github/skills/heldout-evaluator/` and its scripts into `.github/scripts/`
- `playwright.config.ts`, `heldout-support/fixtures.ts`, `tsconfig.json` and `.env.example`
- the Playwright MCP server (tier 2) into `.vscode/mcp.json` and the root `.mcp.json`, added to any servers the project
  already has
- the subagents in `.github/agents/` (contract extractor and reviewer, test author, hardener and triager, each with its
  model and fallbacks)
- the coordinator agent for Copilot, `.github/agents/heldout-evaluator.agent.md`
- the Claude Code bridges in `.claude/`, its fallback models and the approval of the `heldout` command, the
  Playwright MCP server and edits in `output/`, `.heldout/` and the journeys (`.claude/settings.json`), so an
  evaluation isn't interrupted by approval prompts for them
- `.vscode/settings.json`, so Copilot loads the skill and subagents from `.github/` only and runs the `heldout`
  command and edits in the `.heldout/` scratch area without an approval prompt

Then, from the project's own copy of the scripts, `init` scaffolds, and never overwrites:

- `heldout.config.json` (with a JSON schema for editor help)
- `.env`
- the `heldout` npm script and dev dependencies
- `.gitignore` entries
- `mock-jira/`, `output/` (one folder per application profile, one per story under it) and `journeys/fixtures/`

A later skill version: the same setup command, without the URL, in the project's folder (on any machine; the project
records the skill's remote and commit in `SOURCE.json`, never a local path).

Setup also installs the dependencies and Chromium. `-Ci gitlab|github` (`--ci` in setup.sh) adds a regression
pipeline. Unless flags give them, one visit of the start page fills in the profile: its id (from the host, or the title
for localhost), name (page title), test-id attribute, API host (where the page's own API calls go) and `blockHosts`
(ad/analytics networks). Cookie and welcome dialogs the app shows go in `overlays` (see
[hardening-cases](hardening-cases.md)). Every name the tests make starts with the profile's data prefix (`hldout`
unless the app's rules need another: `init --profile <id> --data-prefix <prefix>`), so test data is easy to find and
sweep.

Tell the user to restart their agent app (Claude Code, GitHub Copilot…) once so the Playwright MCP server and the
subagents load.

## More applications

`$H add-aut <id> --base-url <url>`, and give that profile its own journeys folder (`"journeysDir": "journeys-<id>"` in
its profile). When the new profile is another environment or build of an application that already has journeys,
`$H journeys --aut <id> --copy-from <profile>` starts it from those: copied as drafts, each marked `TODO(harden)`,
proven by nothing until a story's passing tests prove them there.

## Test accounts

Record the answer; never ask for or handle a password yourself. Every way to set them up is in
[accounts](accounts.md).

- *Existing, `.env`/CI:* `$H accounts --add-existing --username <user> --password-env APP_PASSWORD_1`, then tell the
  user to run `npm run heldout -- secret APP_PASSWORD_1 --ask` in a terminal of their own (hidden prompt), or to set it
  as a CI variable. Test secrets that aren't plain words: a word like `password` can't be scrubbed from the evidence
  without rewriting it.
- *Existing, Vault:* put `VAULT_ADDR` in `.env`; the user runs `vault login` once (or sets `VAULT_TOKEN` / AppRole).
  Then `$H accounts --add-existing --username-vault <path#field> --password-vault <path#field>`.
- *Created by the tests:* nothing now; the hardener saves the recipe while hardening the first story that needs users
  (from the API probe chain, or from the sign-up page when the app has no API for it).

Repeat `--add-existing` for more accounts: each parallel worker needs its own, and runs use no more workers than
there are accounts (of the scarcest role, when accounts have roles: `--role admin`). An account that only acts on
other records, such as the one administrator, takes `--shared`: it serves every worker and sets no limit, provided
the application keeps an earlier sign-in valid when the account signs in again. `$H accounts --check` (and `doctor`)
signs each one in.

## Jira

`JIRA_MODE=mock` (default) or `datacenter` (Jira and Confluence Data Center, `JIRA_PAT`); `doctor --jira` finds the
acceptance-criteria custom field. See [jira](jira.md).

## Upkeep between evaluations

- After merging other people's work, `$H journeys --check` lints every journey and lists possible duplicates; a merge
  conflict in `journeys/registry.yml` is settled by `$H journeys --resolve`.
- The story owner's answer to an open question enters the next evaluation: a revised story is fetched again by
  `advance`, or the contract extractor records the answer, as SKILL.md says.
