# Held-out Evaluator — Claude Code skill

A project skill ([.claude/skills/heldout-evaluator](.claude/skills/heldout-evaluator/SKILL.md)) that
evaluates a Jira story against any web application or API using **held-out** Playwright tests,
written from the requirement alone:

```
Jira story + attachments + comments
  → requirement contract: built by a subagent from any story format, every item cited to source lines,
    every line accounted for, every expected value grounded — then checked by an independent reviewer subagent
  → Gherkin scenarios + Playwright UI/API tests (scaffolded from the contract) → freeze → harden vs the live AUT
  → run → triage (script defect vs application defect, reproduced live) → repair & re-run
  → verdict.md (traceability, reproduction steps, evidence) → Jira comment + attachment → you decide
```

## Adopt it in another project (about 1 minute)

Get the skill once, from wherever your team keeps it (GitLab, GitHub, a file share). Then run its `init` from the
root of the project that will hold the evaluations:

```bash
git clone --depth 1 <skill-repository-url> "$HOME/heldout-skill"
npx -y tsx "$HOME/heldout-skill/.claude/skills/heldout-evaluator/scripts/heldout.ts" init --base-url https://your-app --install
```

The same two lines work in bash, zsh and PowerShell. `init` copies the skill into `.claude/skills/heldout-evaluator/`
and scaffolds the project. Then it visits your app once and fills in the profile:
- the profile id, from the host name;
- the app's name, from its page title (shown in verdicts);
- the test-id attribute the app renders;
- `blockHosts`, the ad and analytics networks the page loads.

Add `--api-base-url` if the API lives elsewhere, and `--ci` for a regression pipeline (GitLab CI, or GitHub Actions
when the remote is GitHub). Then:

1. `npm run heldout -- doctor`. It checks Node, dependencies, the browser, config, reachability, Jira, subagents,
   secrets (including any secret value that has slipped into a file git would commit) and the accounts recipe. Every
   problem comes with the command that fixes it.
2. Restart Claude Code once, so the Playwright MCP server and the two subagents load.
3. Ask Claude: **"Run a held-out evaluation of ABC-123"**. No Jira yet? Run `npm run heldout -- new ABC-1 --from story.md` first.

**Update:** `git -C "$HOME/heldout-skill" pull`, then run the same `init` line again. It replaces the project's copy of
the skill. It also refreshes `playwright.config.ts`, `heldout-support/fixtures.ts` and the subagents, unless you changed
them, and it never touches your config, `.env` or evaluations. `doctor` shows which version is installed.

Or just ask Claude to "set up held-out evaluation for https://your-app". The skill asks for anything it can't infer,
then runs the steps above.

## Point it at your application and Jira

| What | Where |
| --- | --- |
| Applications (UI URL, API URL, test-id attribute (detected by `init`), healthcheck, `blockHosts` for ads/analytics, `maxWorkers` and `minTestIntervalMs` for rate-limited hosts) | [heldout.config.json](heldout.config.json) → `auts` (schema-validated) · `npm run heldout -- add-aut <id> --base-url …` |
| Test accounts (how to create, sign in and delete a user on this app, written once; `seed.account()` and `signIn()` use it in every story) | `auts.<id>.accounts` in heldout.config.json — [data-and-journeys.md §4a](.claude/skills/heldout-evaluator/references/data-and-journeys.md) |
| Which application a story targets | `npm run heldout -- fetch KEY --aut <id>` (writes `evaluations/KEY/evaluation.json`) |
| Secrets used by tests | `.env` → referenced from `evaluations/<KEY>/test-data.json` as `${env:NAME}` |
| Jira | `JIRA_MODE=mock` (file-based, [mock-jira/](mock-jira/)) or `cloud` + `JIRA_BASE_URL/JIRA_EMAIL/JIRA_API_TOKEN`; `doctor --jira` finds your acceptance-criteria custom field |
| Browser tier 2 (Playwright MCP) | [.mcp.json](.mcp.json) |
| Subagents (contract extractor, independent reviewer) | [.claude/agents/](.claude/agents/) |
| CI regression run | `heldout init --ci` → a GitLab CI job (`.gitlab/heldout.gitlab-ci.yml`, included from `.gitlab-ci.yml`) or, for a GitHub remote, `.github/workflows/heldout.yml`; `--ci gitlab\|github` chooses |

## Commands

Everything goes through one entry point: `npm run heldout -- <command>`. `npm run heldout -- help` lists the commands.

| Command | Purpose |
| --- | --- |
| `init`, `add-aut`, `doctor`, `status [KEY]` | set up, check the setup, see where each story is and the next step |
| `new KEY --from story.md [--attach f] [--ac-from f] [--comment-from f]` | write a story into the mock Jira |
| `fetch KEY [--aut id]` | story, attachments and comments; binds the AUT; detects requirement revisions |
| `contract KEY --pack` · `contract KEY` · `contract KEY --review-prompt` | evidence pack; checks for the model-built contract (anchoring, coverage, grounded literals, review) |
| `scaffold KEY` | feature header and test stubs generated from the contract |
| `lint`, `integrity`, `inspect`, `api-probe [--chain]`, `mcp-probe` | traceability, freeze/verify, UI and API probing (tiers 2 and 3) |
| `run`, `triage`, `verdict`, `publish`, `scrub` | run → triage → verdict → Jira; remove secrets from artifacts |
| `npm run test:skill` · `npm run typecheck` | the skill's own tests (including a fake Jira Cloud) · TypeScript |

## Requirement contract: any story format, evidence not recall

A model reads the story, whatever its shape: AC field or bullets, Given/When/Then, tables, prose, rules in a CSV,
an API spec in an attachment, a mock-up image, clarifications in comments. It writes
`requirement-contract.json`, and everything downstream works from that. Four guards keep it factual:

- Each AC is quoted verbatim from cited lines, and the quote is verified.
- Every source line is accounted for, either captured or dismissed with a reason.
- Every expected status, number, message and path appears in the sources, or in an answered gap.
- A separate reviewer subagent confirms each item. Its review is bound to the contract's hash.

Missing elements become gaps, resolved in this order: the requirement, then the application (only for **how**
to exercise it), then config, then **you**. **What** is correct is never read off the application.
See [requirement-contract.md](.claude/skills/heldout-evaluator/references/requirement-contract.md).

## Data seeding, API pre-steps and entry points

Tests create (and clean up) their own data through the AUT's API, run auth, lookup and readiness pre-steps
as validated preconditions, and start where the AC starts. A failed precondition is reported as BLOCKED,
never as the requirement failing. Strategy:
[data-and-journeys.md](.claude/skills/heldout-evaluator/references/data-and-journeys.md).

## Demos and evaluator testing

Nine stories across three AUTs (three each, mixing UI and API), each with a machine-readable answer key written
by a separate author agent before evaluation ([demo/answer-keys/](demo/answer-keys/)). Each was evaluated **blind**:
a fresh agent with only the skill and the story. **Result: 8/9 verdicts as expected, 12/12 defects found, 1 disputed
false positive.** See [demo/SCORECARD.md](demo/SCORECARD.md) (`npx tsx demo/score.ts`) and the full
[evaluator test report](demo/EVALUATOR-TEST-REPORT.md).

| Story | AUT | Designed to test | Verdict |
| --- | --- | --- | --- |
| [AE-1](evaluations/AE-1/verdict.md) | Automation Exercise | search API + UI, a loosely worded status | ⚠️ PASS WITH WARNINGS |
| [AE-2](evaluations/AE-2/verdict.md) | Automation Exercise | account API with in-body result codes + sign-in UI | ❌ FAIL (3) |
| [AE-3](evaluations/AE-3/verdict.md) | Automation Exercise | brands API ↔ UI, a form specified by an image mock-up | ⚠️ PASS WITH WARNINGS |
| [PB-1](evaluations/PB-1/verdict.md) | ParaBank | registration, sign-in, customer REST | ❌ FAIL (1) |
| [PB-2](evaluations/PB-2/verdict.md) | ParaBank | opening accounts, rules in a CSV attachment | ❌ FAIL (3) |
| [PB-3](evaluations/PB-3/verdict.md) | ParaBank | transfers, a PO comment replacing an AC | ❌ FAIL (2) |
| [DQ-1](evaluations/DQ-1/verdict.md) | DemoQA | token API, a PO status override, a JWT leak | ❌ FAIL (2) |
| [DQ-2](evaluations/DQ-2/verdict.md) | DemoQA | Book Store API + UI, a 401 matrix | ✅ PASS |
| [DQ-3](evaluations/DQ-3/verdict.md) | DemoQA | new-tab and status links, a PO path correction | ❌ FAIL (2) |

Robustness checks (tampering, AUT down or degraded, malformed evaluation, Jira Cloud adapter, pre-step failure, contract gates):
[demo/robustness/](demo/robustness/). Simulated Jira results are in `mock-jira/issues/<KEY>/ISSUE_VIEW.md`, and the
REST calls a real Jira would have received are in [mock-jira/outbox/](mock-jira/outbox/). Human-readable answer key:
[demo/INJECTED_DEFECTS.md](demo/INJECTED_DEFECTS.md) (the evaluator does not read it).
