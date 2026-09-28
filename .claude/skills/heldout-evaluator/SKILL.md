---
name: heldout-evaluator
description: Held-out acceptance evaluation of a Jira story against any web application or API (AUT-agnostic). Fetches the story and its attachments from Jira (or the file-based mock Jira), reviews the requirement, rewrites it as traceable Gherkin scenarios (each tied to its acceptance criteria and a test type such as functional, negative, boundary, security, idempotency, performance, accessibility, integration or contract), writes independent Playwright TypeScript UI and API tests from the requirement only, hardens them against the live AUT (tier 1 IDE browser tool, tier 2 Playwright MCP, tier 3 bundled inspector/API probe), runs them, triages every failure as a script defect or an application defect, and writes a verdict markdown with a full traceability matrix, reproduction steps and evidence that is published back to the Jira story for a human to review. Use when the user asks to evaluate, verify or accept a Jira story/ticket, to create held-out or independent acceptance tests, or for a test verdict on a story.
---

# Held-out Evaluator

A **held-out test** is an independent oracle: written from the requirement alone, never from the
application's code or its developers' tests, so it catches an implementation that drifted from what
the story asked for. This skill runs the whole loop for one Jira story:

```
Jira story + attachments ─► requirement contract (gaps → ask) ─► review ─► scenarios.feature (AC + test type + source per scenario)
  ─► draft Playwright UI/API spec ─► freeze ─► harden vs live AUT ─► preflight ─► run
  ─► triage (script vs application, confirmed live) ─► repair script defects & re-run
  ─► verdict.md (traceability, reproduction, evidence) ─► Jira comment + attachment ─► human decides
```

Everything about the AUT lives in the project's `heldout.config.json` (named **AUT profiles**),
`.env` and the story itself. **Nothing in this skill may name, assume or special-case a particular
application.** The skill never files issues: it reports findings with evidence, and a person
decides what is a defect.

## Setup (first use in a project, about 2 minutes)

If `heldout.config.json` is missing, set the project up before anything else:

1. Ask the user, in one `AskUserQuestion` call, for anything you can't infer:
   - the web app URL
   - the API URL (if different)
   - Jira: mock (no subscription) or cloud (site URL)
   - test accounts: the tests create their own / existing accounts with passwords in `.env` or CI variables /
     existing accounts in HashiCorp Vault / none needed
2. Run:

```bash
npx tsx <skill folder>/scripts/heldout.ts init --base-url <url> [--api-base-url <url>] [--name "<app>"] [--profile <id>] [--jira mock|cloud] [--install]
npm run heldout -- doctor          # every problem comes with the command that fixes it
```

Run from a skill folder outside the project (a clone anywhere), `init` first copies the skill into
`.claude/skills/heldout-evaluator/`, or updates an older copy. It then scaffolds, and never overwrites, the following:

- `heldout.config.json` (with a JSON schema for editor help)
- `playwright.config.ts`
- `heldout-support/fixtures.ts`
- `tsconfig.json`
- `.mcp.json` (Playwright MCP, tier 2)
- `.env` and `.env.example`
- the `heldout` npm script and dev dependencies
- `.gitignore` entries
- the subagents in `.claude/agents/` (the contract extractor and reviewer)
- `mock-jira/` and `evaluations/`

`--install` also installs the dependencies and Chromium. `--ci [gitlab|github]` adds a regression pipeline (GitLab CI unless the remote is GitHub). Unless flags give
them, one visit of the start page fills in the profile: its id (from the host, or the title for localhost), name (page
title), test-id attribute, API host (where the page's own API calls go) and `blockHosts` (ad/analytics networks).
Cookie and welcome dialogs the app shows go in `overlays` (see references/hardening.md).

More applications: `npm run heldout -- add-aut <id> --base-url <url>`.

**Test accounts** (record the answer; never ask for or handle a password yourself):
- *Existing, `.env`/CI:* `$H accounts --add-existing --username <user> --password-env APP_PASSWORD_1`, then tell the user to
  run `npm run heldout -- secret APP_PASSWORD_1 --ask` in a terminal of their own (hidden prompt), or to set it as a CI variable.
- *Existing, Vault:* put `VAULT_ADDR` in `.env`; the user runs `vault login` once (or sets `VAULT_TOKEN` / AppRole). Then
  `$H accounts --add-existing --username-vault <path#field> --password-vault <path#field>`.
- *Created by the tests:* nothing now; the recipe is saved while hardening the first story that needs users.
Repeat `--add-existing` for more accounts: each parallel worker needs its own, and runs use no more workers than
there are accounts. `$H accounts --check` (and `doctor`) signs each one in.

Jira: `JIRA_MODE=mock` (default) or `cloud`; `doctor --jira` finds the acceptance-criteria custom field. See
[references/jira.md](references/jira.md). Tell the user to restart Claude Code once so `.mcp.json` and the subagents load.

## Pipeline

`H="npm run heldout --"`. Every command takes the issue key. `$H status [KEY]` shows where a story is and the next command.

| # | Phase | You do | Command / output |
| --- | --- | --- | --- |
| 1 | **Fetch** | Pull the story, attachments and comments, and bind it to an AUT profile. A re-fetch detects requirement revisions | `$H fetch KEY [--aut <profile>]` → `requirement/`, `evaluation.json` (+ `CHANGES.md`, `history/`) |
| 1b | **Contract** | `$H contract KEY --pack`, then **delegate** the building to the `heldout-contract-extractor` subagent. From the evidence pack alone it writes: each AC verbatim with cited lines; rules, endpoints, error cases, auth and test data; **gaps**, each either *mechanics* (HOW: left open, discovered in phase 4) or *oracle* (WHAT: found in the requirement, or a question for the user); and a coverage ledger for every source line. Then delegate an **independent review** to the `heldout-contract-reviewer` subagent, in a fresh context. Send findings back to the builder and re-review until `$H contract KEY` is clean. **Ask the user** the oracle questions it lists (`AskUserQuestion`, interactive sessions); record answers as `provided-by-user` and re-review | `requirement-contract.json`, `requirement-contract.review.json` — [requirement-contract](references/requirement-contract.md) |
| 2 | **Review + scenarios** | `$H scaffold KEY` writes the feature header (ACs verbatim, endpoints, assumptions, open questions) and test stubs from the contract. Write the testability review and the scenarios: one `@type`, the `@AC-n` tags and a `# from` source per scenario | `requirement-review.md`, `scenarios.feature`, `test-data.json` — [scenario-format](references/scenario-format.md) |
| 3 | **Draft tests** | Translate the scenarios 1:1 into Playwright TS (UI via `page`, API via `api`). **Seed every data precondition** with `seed.*` (API first, with cleanup); test users with `seed.account()` / `signIn()` when the profile has an accounts recipe (save it while hardening the first story that needs users: `$H accounts --key KEY --from-chain <probe chain>`). API answers are checked with `expectResponse(res, { status, body }, '[REQ AC-n] …')`. Deep-link to the page the AC names (`gotoPage`). Guessed locators get `// TODO(harden)` | `tests/*.spec.ts`, then `$H lint KEY --fix-tags --allow-unhardened` — [test-authoring](references/test-authoring.md), [data-and-journeys](references/data-and-journeys.md) |
| 4 | **Freeze + harden** | Freeze the draft together with the contract's oracle, then make the mechanics work against the live AUT. Record each open mechanics gap once found: `$H contract KEY --resolve G<n> --value … --evidence …` (`discovered-in-aut`), plus what it unlocks (endpoints, `requestFields`, `envelope`, entry points). This changes no reviewed content. Prove stability with `$H run KEY --label harden --repeat-each 3 --workers 2` (on a profile with `maxWorkers`, the workers are capped; for a rate-limited host use `--repeat-each 2` on the failing and timing-sensitive scenarios only) | `$H integrity KEY --snapshot` → harden → `$H integrity KEY` — [hardening](references/hardening.md) |
| 5 | **Run** | Full suite. Preflight (lint, contract and review, 3-sample healthcheck) runs automatically; a down or **degraded** AUT aborts the run (`--allow-degraded` overrides) | `$H run KEY --label eval` → `runs/NN-eval/` |
| 6 | **Triage** | Auto-classify, then **reproduce each failure live** (`$H api-probe --chain`, `$H inspect`) and record the decision. Repair script defects (HOW only) and re-run everything | `$H triage KEY` · `--set …` · `--carry-from auto` — [triage](references/triage.md) |
| 7 | **Verdict** | Render the recommendation with traceability, reproduction and evidence | `$H verdict KEY` → `verdict.md`, `verdict.json` — [verdict-and-publish](references/verdict-and-publish.md) |
| 8 | **Publish** | Attach the verdict, post a summary comment, set a label. Nothing else | `$H publish KEY` |

Work through the phases in order and do not skip the freeze. Track them with a todo list.
Self-tests for the skill's own logic: `npm run test:skill`.

## Browser and API tiers for hardening and triage

Pick the first tier whose tools are actually available in this session (check your tool list):

1. **Tier 1 — IDE browser tool**: the browser-control tools the host IDE exposes (an integrated
   browser, or Claude in Chrome `mcp__claude-in-chrome__*`).
2. **Tier 2 — Playwright MCP** (`mcp__playwright__browser_*`), configured by `.mcp.json`. If the tools are not loaded natively (pending approval, CI), drive the same server with `heldout mcp-probe` (bundled stdio client). Always wait for a readiness anchor on SPAs, and never conclude absence from an unrendered snapshot.
3. **Tier 3 — bundled tools** (always available): `heldout inspect` (ARIA snapshot, ranked unique
   locators, `--probe`, `--steps-json`, `--wait-for`), `heldout run KEY --label harden --capture`
   (snapshot after every step), and `heldout api-probe` for APIs (single calls or `--chain` sequences; status, timing, redacted body, type
   shape, `--login` token chaining, `--repeat`).

Verify every final locator with a probe (exactly one match, in the right state) and every API
mechanic with `heldout api-probe`. Record the tiers you actually used in the hardening log
(`**Tiers used:** …`).

## Non-negotiable guardrails

- **Held-out isolation.** Derive tests only from the story, its attachments and black-box
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
- **Observations outside the criteria** (something the story's goal implies but no AC states) go in the feature as
  `# OBSERVATION: …`. The verdict lists them for the owner, and they don't change it.
- **Evidence, not recall.** The requirement contract is built by a model but must be proven. Each criterion is quoted from cited lines; every source line is accounted for; every expected literal (status, number, message, path) exists in the sources or in an answered gap. An independent reviewer subagent confirms each item, and its review is bound to the contract hash. The builder never writes its own review.
- **Gaps: find, then ask; never read the oracle off the AUT.** A missing element about HOW to exercise the AUT is discovered from it during hardening, with evidence. A missing element about WHAT is correct (status, message, limit) comes from the requirement or the user, or stays an explicit assumption or open question. Ask the user with `AskUserQuestion` when a session is interactive.
- **Surface ambiguity; don't resolve it silently.** Use `# ASSUMPTION:`, `# OPEN-QUESTION:` and
  `@needs-clarification`. All three appear in the verdict.
- **Pre-steps are preconditions.** API calls needed before the call under test (auth, parent data, state chains, lookups, readiness) use `seed.once/create/step/until`; they are validated by output, BLOCKED on failure, and replayable as P1…Pn in the verdict. Cross-scenario reliance is declared with `@depends:SCN-x`.
- **Seed, don't assume.** Each test creates (and cleans up) the data it needs, tagged uniquely. It never relies on records that happen to exist. Seed failures are BLOCKED, not requirement failures. Start journeys where the AC starts. See [data-and-journeys](references/data-and-journeys.md).
- **Secrets** go in `.env`, referenced from `test-data.json` as `${env:NAME}`. API logs, curl
  reproductions and snapshots (password-field values) are redacted automatically, and `heldout run` scrubs the
  story's secrets from every text artifact after each run (`heldout scrub KEY` does this retroactively). Use test
  secrets that aren't plain words: a word like `password` can't be scrubbed without rewriting the evidence.
  Traces and the HTML report stay local.
- **Shared environments:** create data with `unique()` names (`uniqueId()` where spaces aren't allowed: e-mails,
  user names, slugs), and keep traffic modest.

## Output layout (per story)

```
evaluations/KEY/
  evaluation.json                                   ← phase 0 (AUT binding)
  requirement/story.md raw-issue.json attachments/ CHANGES.md history/   ← phase 1
  requirement-contract.json requirement-contract.md                      ← phase 1b
  requirement-review.md scenarios.feature test-data.json                 ← phase 2
  tests/*.spec.ts   draft/*.spec.ts (frozen)                             ← phases 3–4
  hardening/hardening-log.md integrity.json amendments.json refreeze-log.json draft-history/ inspect-*.md api-*.md
  runs/NN-label/ results.json junit.xml html/ artifacts/ snapshots/ confirm/ triage.json triage.md run-meta.json
  verdict.md verdict.json                                                ← phase 7
```

## Finishing

Tell the user:
- the verdict (PASS / PASS_WITH_WARNINGS / FAIL / INCONCLUSIVE, a recommendation) and why
- each finding: AC, test type, expected vs actual, how to reproduce
- script defects that were repaired
- the integrity status, including any amendments or re-freezes
- the tiers actually used
- requirement gaps and how each was filled (found, discovered, answered by the user, assumed or open)
- open questions
- where `verdict.md` and the Jira comment/attachment ended up
