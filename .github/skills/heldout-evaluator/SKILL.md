---
name: heldout-evaluator
description: Held-out acceptance evaluation of a Jira story against any web application or API (AUT-agnostic). Fetches the story's title, description and acceptance criteria from Jira Data Center (or the file-based mock), with the screenshots they show and the Confluence pages they link, turns them into a reviewed requirement contract, writes independent Playwright TypeScript UI and API tests from the requirement only (each tied to its acceptance criteria, its requirement source and a test type: functional, negative, boundary, security, idempotency, concurrency, composition, integration, contract or accessibility) on top of reusable journeys per application domain, hardens them against the live AUT (tier 1 IDE browser tool, tier 2 Playwright MCP, tier 3 bundled inspector/API probe), runs them, triages every failure as a script defect or an application defect, and writes a verdict markdown with a full traceability matrix, reproduction steps and evidence that is published back to the Jira story for a human to review. Use when the user asks to evaluate, verify or accept a Jira story/ticket, to create held-out or independent acceptance tests, or for a test verdict on a story.
---

# Held-out Evaluator

Works in any agent app that loads skills. The skill lives in `.github/skills/heldout-evaluator/`, its scripts (the
`heldout` command, `npm run heldout`) in `.github/scripts/`, the phase subagents in
`.github/agents/*.agent.md` and the Playwright MCP server in `.vscode/mcp.json`; GitHub Copilot reads them there. Claude Code
reads only `.claude/`, so `.claude/skills/heldout-evaluator/SKILL.md` and `.claude/agents/*.md` are short bridges that
point here, and it reads MCP servers only from the root `.mcp.json`, which `init` and `update` write from
`.vscode/mcp.json`. Tool names below such as `AskUserQuestion` (used during setup only) and the Agent tool are Claude Code's examples. In
GitHub Copilot, ask the setup questions in the chat, run each subagent with Copilot's `agent` tool (or as a fresh chat
with the agent's instructions), and pass `--quiet` to `heldout run` so it prints a digest.

A **held-out test** is an independent oracle: written from the requirement alone, never from the
application's code or its developers' tests, so it catches an implementation that drifted from what
the story asked for. This skill runs the whole loop for one Jira story:

```
Jira story (title, description, AC) + its screenshots + linked Confluence pages ─► requirement contract (open questions → verdict) ─► review
  ─► Playwright UI/API spec from the contract (AC + test type + source per test), steps on the app's journeys
  ─► freeze ─► harden vs live AUT (tests and journeys) ─► preflight ─► run
  ─► triage (script vs application, confirmed live) ─► repair script defects & re-run
  ─► verdict.md (traceability, reproduction, evidence) ─► Jira comment + attachment ─► human decides
  ─► the journey registry records what the passing tests proved, for the next story
```

Everything about the AUT lives in the project's `heldout.config.json` (named **AUT profiles**), `.env`, the story
itself and the project's **journeys** (`journeys/`: the reusable HOW of the application, one file per domain in
`fixtures/`, mapped by `registry.yml`). **Nothing in this skill may name, assume or special-case a particular application.** The skill
never files issues: it reports findings with evidence, and a person decides what is a defect.

## Setup (first use in a project, about 2 minutes)

If `heldout.config.json` is missing, set the project up before anything else:

1. Ask the user, in one `AskUserQuestion` call, for anything you can't infer. Setup is the only time questions are
   asked: once a story is fetched, the evaluation runs to its published verdict without the user (see "Unattended"
   below), so settle here everything a story may need.
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
- the Claude Code bridges in `.claude/`, its fallback models and the approval of the `heldout` command and the
  Playwright MCP server (`.claude/settings.json`), so an evaluation isn't interrupted by approval prompts for them
- `.vscode/settings.json`, so Copilot loads the skill and subagents from `.github/` only and runs the `heldout`
  command without an approval prompt

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
Cookie and welcome dialogs the app shows go in `overlays` (see references/hardening.md).

More applications: `npm run heldout -- add-aut <id> --base-url <url>`, and give that profile its own journeys folder
(`"journeysDir": "journeys-<id>"` in its profile).

**Test accounts** (record the answer; never ask for or handle a password yourself):
- *Existing, `.env`/CI:* `$H accounts --add-existing --username <user> --password-env APP_PASSWORD_1`, then tell the user to
  run `npm run heldout -- secret APP_PASSWORD_1 --ask` in a terminal of their own (hidden prompt), or to set it as a CI variable.
- *Existing, Vault:* put `VAULT_ADDR` in `.env`; the user runs `vault login` once (or sets `VAULT_TOKEN` / AppRole). Then
  `$H accounts --add-existing --username-vault <path#field> --password-vault <path#field>`.
- *Created by the tests:* nothing now; the recipe is saved while hardening the first story that needs users (from the
  API probe chain, or from the sign-up page when the app has no API for it: `$H accounts --sign-up-json …`).
Repeat `--add-existing` for more accounts: each parallel worker needs its own, and runs use no more workers than
there are accounts. `$H accounts --check` (and `doctor`) signs each one in. Existing accounts are shared with later runs:
when tests change them, save the call that restores one while hardening (`$H accounts --reset "METHOD path"`).

Jira: `JIRA_MODE=mock` (default) or `datacenter` (Jira and Confluence Data Center, `JIRA_PAT`); `doctor --jira` finds
the acceptance-criteria custom field. See
[references/jira.md](references/jira.md). Tell the user to restart their agent app (Claude Code, GitHub Copilot…) once so the Playwright MCP server and the subagents load.

## Pipeline

`H="npm run heldout --"`. In Windows PowerShell, quote the dashes (`npm run heldout '--' …`): PowerShell drops a bare
`--`, and npm then keeps the command's flags for itself (`heldout` stops with this hint when it notices). Every command takes the issue key. `$H status [KEY]` shows where a story is and the next command.

**Drive a story with `$H advance KEY`.** It runs every script step that comes next (fetch, the evidence pack, lint and
the freeze, the integrity check and the evaluation run, the automatic triage, the verdict, publish, the journey
registry) and stops where a subagent has work to do, printing the subagent, its task and the command that follows:

```
■ Next: the heldout-test-author subagent — from the reviewed contract, without a browser
  Task: "Write the tests for KEY"
  Then: npm run heldout -- advance KEY
```

Run that subagent with that task, then the `Then:` command, until it prints `✔ KEY is complete`. It reads where the
story is from the files on disk, so a new session picks a story up with the same command. The table below is what it
runs, and what to run by hand when a step needs a closer look.

**Unattended.** From the fetch to the published verdict, never stop to ask the user anything, and never wait for an
answer or a go-ahead. Whatever is unclear or missing becomes part of the result:

| What comes up | Where it goes |
| --- | --- |
| The requirement doesn't say what is correct (an open oracle gap), or its sources disagree | `// OPEN-QUESTION:` or `@needs-clarification` in the tests; the verdict lists the question for the story's owner |
| One reasonable reading exists | `assumed`, `// ASSUMPTION:` in the spec; the verdict lists it, and says so when the application contradicts it |
| The story has no acceptance criteria | `advance` writes an INCONCLUSIVE verdict saying so, and publishes it |
| An account, role or secret the tests need is missing and the application can't create it | Those tests end BLOCKED; the verdict names what is missing |
| The application is down or degraded, or a failure stays unexplained after 3 repair cycles | ENVIRONMENT_ISSUE or NEEDS_INVESTIGATION; verdict INCONCLUSIVE |
| An assertion's implementation is wrong (not its expected value) | You decide on the audited amendment yourself; the verdict shows it |

The owner's later answer to an open question enters the next evaluation: a revised story is fetched again, or
`$H contract KEY --answer G<n> --value "…" --by "<who>"` records it (then a fresh review).

| # | Phase | You do | Command / output |
| --- | --- | --- | --- |
| 1 | **Fetch** | Pull the story's title, description and acceptance criteria, the screenshots they show and the Confluence pages they link (comments and other attachments are not requirement), into the folder of its AUT profile. A re-fetch detects requirement revisions | `$H fetch KEY [--aut <profile>]` → `output/<profile>/KEY/requirement/`, `evaluation.json` (+ `CHANGES.md`, `history/`) |
| 1b | **Contract** | `$H contract KEY --pack`, then **delegate** the building to the `heldout-contract-extractor` subagent. From the evidence pack alone it writes: each AC verbatim with cited lines; rules, endpoints, error cases, auth and test data; **gaps**, each either *mechanics* (HOW: left open, discovered in phase 3) or *oracle* (WHAT: found in the requirement, otherwise left open or assumed for the verdict to report); and a coverage ledger for every source line. Then delegate an **independent review** to the `heldout-contract-reviewer` subagent, in a fresh context. Send findings back to the builder and re-review until `$H contract KEY` is clean (after 3 rounds, what is still disputed becomes an open question). **Don't ask the user** the open oracle questions it lists: they go to the tests and the verdict | `requirement-contract.json`, `requirement-contract.review.json` — [requirement-contract](references/requirement-contract.md) |
| 2 | **Write the tests** | **Delegate** to the `heldout-test-author` subagent ("Write the tests for KEY"). With no browser and from the reviewed contract alone, it runs `$H scaffold KEY`, lists the application's journeys (`$H journeys KEY`) and writes the Playwright TS tests: one user journey each, tagged with its `@AC-n`, one `@type` (what it truly proves) and a `// from` source, written in two passes: one test per criterion first, then round the test types per criterion for what the requirement implies; the steps call journeys, adding the missing ones to their domain's file (`journeys/fixtures/<domain>.ts`); every data precondition seeded; every expectation in the test (`expectResponse(…, '[REQ AC-n] …')`, `[REQ AC-n]` messages, `@req-constants`); guessed mechanics marked `// TODO(harden)`; lint clean (`--allow-unhardened`). The open questions it returns are already in the tests (`// OPEN-QUESTION:`, `@needs-clarification`) and reach the verdict; nobody is asked | `tests/*.spec.ts`, `test-data.json`, `journeys/fixtures/<domain>.ts` — [test-authoring](references/test-authoring.md), [journeys](references/journeys.md), [data-and-journeys](references/data-and-journeys.md) |
| 3 | **Freeze + harden** | **You** freeze the draft together with the contract's oracle (and a hash of each journey it uses): `$H integrity KEY --snapshot`. Then **delegate** to the `heldout-hardener` subagent ("Harden the tests for KEY"). It makes the mechanics work against the live AUT with the browser and API tiers, in the tests and the journeys they call, resolves the open mechanics gaps (`discovered-in-aut`, which changes no reviewed content), saves an accounts recipe when the story needs users, and proves stability with `$H run KEY --label harden --repeat-each 3 --workers 2`. Check `$H integrity KEY` yourself afterwards. When it reports an over-strict assertion implementation, **you** decide on `$H integrity KEY --amend` | `hardening/` — [hardening](references/hardening.md) |
| 4 | **Run** | **You** run the full suite. Preflight (lint, contract and review, journeys, 3-sample healthcheck) runs automatically; a down or **degraded** AUT aborts the run (`--allow-degraded` overrides) | `$H run KEY --label eval` → `runs/NN-eval/` |
| 5 | **Triage** | **Delegate** to the `heldout-triager` subagent ("Triage run NN-eval of KEY"). It auto-classifies, **reproduces each failure live** and records each decision with evidence; it never edits the tests or the journeys. Send the script defects it confirms to the `heldout-hardener` ("Repair these script defects for KEY: …"), re-run everything (`$H run KEY --label rerun`) and triage again (the triager uses `--carry-from auto`). At most 3 cycles | `runs/NN/triage.json`, `confirm/` — [triage](references/triage.md) |
| 6 | **Verdict** | Render the recommendation with traceability, reproduction and evidence | `$H verdict KEY` → `verdict.md`, `verdict.json` — [verdict-and-publish](references/verdict-and-publish.md) |
| 7 | **Publish** | Attach the verdict, post a summary comment, set a label. Nothing else. Part of the evaluation, with no confirmation; a project that wants a person to publish sets `jira.publish` to `"manual"`, and `advance` then leaves this step out | `$H publish KEY` |
| 8 | **Journey registry** | Record in `journeys/registry.yml` the journeys this story's passing tests used (this story as their proof, and what ran before each), and the stale marks. Journeys only failing tests used are left out. Preview, then apply; commit `registry.yml` with the journey files and the story's output. After merging other people's work, `$H journeys --check` lints every journey and lists possible duplicates; a merge conflict in `registry.yml` is settled by `$H journeys --resolve` | `$H journeys KEY --harvest` → `--harvest --apply` → `journeys/registry.yml` — [journeys](references/journeys.md) |

Work through the phases in order and do not skip the freeze. **You orchestrate:** each subagent runs in a fresh
context, works from the files on disk and the scripts, and replies with a summary; `$H advance KEY` runs the steps
between them (freeze, runs, verdict, publish, journey registry) and names the next subagent with its task. Keep the
questions and missing pieces the subagents report for your closing summary; they are never a reason to pause. Give
each one the story KEY, and the run or findings when there are any. If your app can't run subagents, do the subagent's work yourself in the same order, following its
instructions in `.github/agents/<name>.agent.md`.
Self-tests for the skill's own logic: `npm run test:skill`.

## Browser and API tiers for hardening and triage

Pick the first tier whose tools are actually available in this session (check your tool list):

1. **Tier 1 — IDE browser tool**: the browser-control tools the host IDE exposes (an integrated
   browser, or a browser extension the agent drives, such as `mcp__claude-in-chrome__*`).
2. **Tier 2 — Playwright MCP** (`mcp__playwright__browser_*`), configured by `.vscode/mcp.json` (Copilot) and the root `.mcp.json` (Claude Code). If the tools are not loaded natively (pending approval, CI), drive the same server with `heldout mcp-probe` (bundled stdio client). Always wait for a readiness anchor on SPAs, and never conclude absence from an unrendered snapshot.
3. **Tier 3 — bundled tools** (always available): `heldout inspect` (ARIA snapshot, ranked unique
   locators, `--probe`, `--steps-json`, `--wait-for`), `heldout run KEY --label harden --capture`
   (snapshot after every step), and `heldout api-probe` for APIs (single calls or `--chain` sequences; status, timing, redacted body, type
   shape, `--login` token chaining, `--repeat`).

Verify every final locator with a probe (exactly one match, in the right state) and every API
mechanic with `heldout api-probe`. Record the tiers you actually used in the hardening log
(`**Tiers used:** …`).

## Non-negotiable guardrails

- **Held-out isolation.** Derive tests only from the story (title, description, acceptance criteria, the screenshots
  they show, the Confluence pages they link) and black-box
  observation of the AUT. Never read the AUT's source, its tests or its fixtures.
- **Hardening changes HOW, never WHAT.** Locators, waits, navigation and API plumbing may change.
  Expected values, `[REQ …]` assertions and the `@req-constants` block may not. `[REQ AC-n strict]`
  also freezes the locator, for accessibility and other requirements where the locator *is* the
  requirement. If the AUT contradicts the requirement, keep the assertion and log an *observed
  deviation*.
- **Only two audited exceptions:**
  - `heldout integrity --amend` fixes a buggy assertion *implementation* (e.g. an over-strict regex).
  - `heldout integrity --snapshot --reason` re-freezes after a **requirement revision**.
  Both are logged and shown in the verdict. Anything else makes integrity VIOLATED and the verdict INCONCLUSIVE.
- **No application defect without live reproduction.** The automatic triage is a hypothesis.
  Reproduce in the browser or with `heldout api-probe` before `--set … APPLICATION_DEFECT`.
- **The human decides.** The verdict is a recommendation with evidence and a decision checkbox per
  finding. Never create, transition or assign Jira issues.
- **Bounded repair loop.** At most 3 repair → full re-run cycles. Whatever is still unexplained
  stays NEEDS_INVESTIGATION (verdict INCONCLUSIVE).
- **Runs are history.** Never delete, rename or renumber a run folder, including a broken or superseded one. The
  verdict lists every run; a gap in it would hide an earlier result.
- **Observations outside the criteria** (something the story's goal implies but no AC states) go in the spec as
  `// OBSERVATION: …`. The verdict lists them for the owner, and they don't change it.
- **Evidence, not recall.** The requirement contract is built by a model but must be proven. Each criterion is quoted from cited lines; every source line is accounted for; every expected literal (status, number, message, path) exists in the sources or in an answered gap. An independent reviewer subagent confirms each item, and its review is bound to the contract hash. The builder never writes its own review.
- **Journeys are HOW, never WHAT.** The journeys in `journeys/fixtures/` hold routes, readiness anchors, locators,
  calls, seeding and cleanup, never a `[REQ …]` assertion, an `expectResponse`, or a status, message, limit or value the
  application answers: the lint refuses them, and integrity marks a `[REQ …]` inside one as a violation. That is why the
  test author may read and call them before the freeze while every expected value still comes from the requirement
  alone and stays in the frozen spec. A journey is mechanics to verify, never evidence. It is shared: fix HOW it works
  for every caller, never bend it to one story.
- **One file per domain, one registry, written by the tools.** Each area of the application has one file of journeys
  (`fixtures/products.ts`), every journey documented; `registry.yml` is written by `journeys --sync` and the harvest,
  never by hand, and `journeys --resolve` settles a merge conflict in it. `journeys --check` finds the same journey
  added twice.
- **Gaps: find, then report; never read the oracle off the AUT.** A missing element about HOW to exercise the AUT is discovered from it during hardening, with evidence. A missing element about WHAT is correct (status, message, limit) comes from the requirement, or stays an explicit assumption or an open question that the verdict puts to the story's owner. Nobody is asked while an evaluation runs.
- **Surface ambiguity; don't resolve it silently.** Use `# ASSUMPTION:`, `# OPEN-QUESTION:` and
  `@needs-clarification`. All three appear in the verdict.
- **Pre-steps are preconditions.** API calls needed before the call under test (auth, parent data, state chains, lookups, readiness) use `seed.once/create/step/until`; they are validated by output, BLOCKED on failure, and replayable as P1…Pn in the verdict. Cross-test reliance is declared with `@depends:SCN-x`.
- **Seed, don't assume.** Each test creates (and cleans up) the data it needs, tagged uniquely. It never relies on records that happen to exist. Seed failures are BLOCKED, not requirement failures. Start journeys where the AC starts. See [data-and-journeys](references/data-and-journeys.md).
- **Secrets** go in `.env`, referenced from `test-data.json` as `${env:NAME}`. API logs, curl
  reproductions and snapshots (password-field values) are redacted automatically, and `heldout run` scrubs the
  story's secrets from every text artifact after each run (`heldout scrub KEY` does this retroactively). Use test
  secrets that aren't plain words: a word like `password` can't be scrubbed without rewriting the evidence.
  Traces and the HTML report stay local.
- **Shared environments:** create data with `unique()` names (`uniqueId()` where spaces aren't allowed: e-mails,
  user names, slugs), and keep traffic modest. Every name starts with the profile's data prefix (`hldout` unless the
  app's rules need another: `init --profile <id> --data-prefix <prefix>`), so test data is easy to find and sweep.

## Output layout

```
journeys/                                   ← shared by every story on the application (grows story by story)
  fixtures/<domain>.ts                      ← the journeys of one area, UI and API (phases 2–3)
  registry.yml                              ← ids, what each touches and requires, who proved it (phase 8)

output/<profile>/KEY/                       ← everything of one story
  evaluation.json                                                        ← phase 1 (when, for which profile)
  requirement/story.md raw-issue.json linked/ transcripts/ CHANGES.md history/   ← phase 1
  requirement-contract.json requirement-contract.md requirement-contract.review.json   ← phase 1b
  tests/*.spec.ts test-data.json   draft/*.spec.ts (frozen) draft/journeys.json   ← phases 2–3
  hardening/hardening-log.md integrity.json amendments.json refreeze-log.json draft-history/ inspect-*.md api-*.md
            journeys-staged.json journeys-harvest.json                   ← stale marks, what the harvest kept
  runs/NN-label/ results.json junit.xml html/ artifacts/ snapshots/ confirm/ triage.json triage.md run-meta.json
  verdict.md verdict.json                                                ← phase 6
```

## Finishing

Tell the user:
- the verdict (PASS / PASS_WITH_WARNINGS / FAIL / INCONCLUSIVE, a recommendation) and why
- each finding: AC, test type, expected vs actual, how to reproduce
- script defects that were repaired
- the integrity status, including any amendments or re-freezes
- the tiers actually used, and the journeys: reused, added, fixed after the freeze, recorded in the registry, stale
- requirement gaps and how each was filled (found, discovered, answered by the owner earlier, assumed or open)
- the open questions for the story's owner, and anything that was missing (an account, a role, a secret) with the
  tests it blocked: this summary and the verdict are where they are raised
- where `verdict.md` and the Jira comment/attachment ended up
