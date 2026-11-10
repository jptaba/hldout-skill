# Setup (first use in a project, about 2 minutes)

Read this when `heldout.config.json` is missing, when an application is added, or when an app doesn't load the skill,
its subagents or the browser. `H="npm run heldout --"` (in Windows PowerShell, `npm run heldout '--' …`).

## Set the project up

1. Ask the user, in one question (in Claude Code one `AskUserQuestion` call, in GitHub Copilot the chat), for anything
   you can't infer. Setup is the only time questions are asked: once a story is fetched, the evaluation runs to its
   published verdict without the user (SKILL.md, "Unattended"), so settle here everything a story may need.
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
- the coordinator agent for GitHub Copilot, `.github/agents/heldout-evaluator.agent.md`
- the Claude Code bridges in `.claude/`, its fallback models and the approval of the `heldout` command, the
  Playwright MCP server and edits in `output/`, `.heldout/` and the journeys (`.claude/settings.json`), so an
  evaluation isn't interrupted by approval prompts for them
- `.vscode/settings.json`, so GitHub Copilot loads the skill and subagents from `.github/` and not the bridges as
  well, and runs the `heldout` command and edits in the `.heldout/` scratch area without an approval prompt

Then, from the project's own copy of the scripts, `init` scaffolds, and never overwrites:

- `heldout.config.json` (with a JSON schema for editor help)
- `.env`
- the `heldout` npm script and dev dependencies
- `.gitignore` entries
- `mock-jira/`, `output/` (one folder per application profile, one per story under it) and `journeys/fixtures/`

A later skill version: the same setup command, without the URL, in the project's folder (on any machine; the project
records the skill's remote and commit in `SOURCE.json`, never a local path).

Setup also installs the dependencies and Chromium. `-Ci gitlab|github` (`--ci` in setup.sh) adds a regression pipeline. Unless flags give
them, one visit of the start page fills in the profile: its id (from the host, or the title for localhost), name (page
title), test-id attribute, API host (where the page's own API calls go) and `blockHosts` (ad/analytics networks).
Cookie and welcome dialogs the app shows go in `overlays` (see [hardening-cases](hardening-cases.md)).

More applications: `npm run heldout -- add-aut <id> --base-url <url>`, and give that profile its own journeys folder
(`"journeysDir": "journeys-<id>"` in its profile). When the new profile is another environment or build of an
application that already has journeys, `npm run heldout -- journeys --aut <id> --copy-from <profile>` starts it from
those: copied as drafts, each marked `TODO(harden)`, proven by nothing until a story's passing tests prove them there.

## Test accounts

Record the answer; never ask for or handle a password yourself; every way to set them up is in
[accounts](accounts.md).
- *Existing, `.env`/CI:* `$H accounts --add-existing --username <user> --password-env APP_PASSWORD_1`, then tell the user to
  run `npm run heldout -- secret APP_PASSWORD_1 --ask` in a terminal of their own (hidden prompt), or to set it as a CI variable.
- *Existing, Vault:* put `VAULT_ADDR` in `.env`; the user runs `vault login` once (or sets `VAULT_TOKEN` / AppRole). Then
  `$H accounts --add-existing --username-vault <path#field> --password-vault <path#field>`.
- *Created by the tests:* nothing now; the recipe is saved while hardening the first story that needs users (from the
  API probe chain, or from the sign-up page when the app has no API for it: `$H accounts --sign-up-json …`).

Repeat `--add-existing` for more accounts: each parallel worker needs its own, and runs use no more workers than
there are accounts (of the scarcest role, when accounts have roles: `--role admin`). An account that only acts on
other records, such as the one administrator, takes `--shared`: it serves every worker and sets no limit, provided the
application keeps an earlier sign-in valid when the account signs in again. `$H accounts --check` (and `doctor`) signs each one in. Existing accounts are shared with later runs:
when tests change them, save the call that restores one while hardening (`$H accounts --reset "METHOD path"`).

## Jira

`JIRA_MODE=mock` (default) or `datacenter` (Jira and Confluence Data Center, `JIRA_PAT`); `doctor --jira` finds
the acceptance-criteria custom field. See [jira](jira.md).

## The two apps

Tell the user to restart their agent app (GitHub Copilot in VS Code: reload the window; Claude Code: a new session)
once, so the Playwright MCP server and the subagents load. Then, for an evaluation:

| | GitHub Copilot in VS Code | Claude Code |
| --- | --- | --- |
| Who coordinates | the `heldout-evaluator` agent: pick it in the chat's agents dropdown, then ask for an evaluation of a story | the main agent; the skill loads when an evaluation is asked for |
| The skill and the subagents | `.github/skills/heldout-evaluator/`, `.github/agents/*.agent.md` | the bridges in `.claude/skills/` and `.claude/agents/`, which point at the same files |
| Model | pick Opus in the model picker. Each agent file lists Opus first, with fallbacks; a subagent whose model is above the session model's tier doesn't run on it | each bridge names `opus`; `.claude/settings.json` holds the fallback |
| Playwright MCP server (tier 2) | `.vscode/mcp.json`, which VS Code passes on to the session; a Copilot session also reads the root `.mcp.json`. Start or trust the server when VS Code asks | the root `.mcp.json`; approve the project's server when Claude Code asks |
| Approvals | `.vscode/settings.json` approves the `heldout` command (`chat.tools.terminal.autoApprove`) and edits in the scratch area. Every other call (the browser's tools, the MCP server's, an edit elsewhere) follows the session's permission level, which is Manual unless `chat.permissions.default` says otherwise: it asks. For a run nobody watches, the user picks a level that doesn't wait for them in the chat's permissions picker | `.claude/settings.json` approves the `heldout` command, the Playwright MCP server and edits in `output/`, `.heldout/` and the journeys |

The permission level is the user's choice, never yours: say what will ask, and let them pick. An evaluation that
waits at a prompt has not failed; `npm run heldout -- advance KEY` picks the story up where it stopped.

When an app doesn't offer the `heldout-evaluator` agent, a subagent or the browser tools: `npm run heldout -- doctor`
checks the agent files and the MCP configuration and prints the command that mends each. If your app can't run
subagents at all, do each subagent's work yourself in the same order, following `.github/agents/<name>.agent.md`.

## The application's overview

Last, for each profile (`--aut <id>` for another one): `$H map --survey` prints what a person sees before signing in
(the start page's headings and links, the sign-in form's fields, the calls the pages make, the API's own description
when it serves one); it signs in nowhere and writes nothing. From it, write what the application is, one entry each:
`$H map --about <part> --add "…"`, with the parts `purpose`, `area` (each area, named as its journeys' domain will
be), `user` (each kind of user), `sign-in`, `api` (its style and base path) and `term` (a word of the application and
its meaning). Every agent reads it (`$H map --overview`), the contract's and the test author too, so it says what the
application is and never what it does: the command refuses a figure, a quoted text, a rule or a judgement. It lives in
`application-map/<profile>/app.yml`, committed; `$H status` says when a profile has none.

Setup is the overview's only writer. While a story is between its fetch and its freeze the command is refused (its
contract and tests are being written from what the overview says); a story's agents never add to it. They mark an
entry their probe contradicts as stale and say in their reply what it lacks; the closing summary lists that, and a
person adds it between stories with the same command. Writing a stale entry's text again restores it.
