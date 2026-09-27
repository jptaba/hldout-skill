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

## Adopt it in another project (about 2 minutes)

1. Copy `.claude/skills/heldout-evaluator/` into your repository.
2. `npx tsx .claude/skills/heldout-evaluator/scripts/heldout.ts init --base-url https://your-app [--api-base-url https://api.your-app] --install`
3. `npm run heldout -- doctor`. It checks Node, dependencies, the browser, config, reachability, Jira, subagents and secrets. Every problem comes with the command that fixes it.
4. Restart Claude Code once, so the Playwright MCP server and the two subagents load.
5. Ask Claude: **"Run a held-out evaluation of ABC-123"**. No Jira yet? Run `npm run heldout -- new ABC-1 --from story.md` first.

Or just ask Claude to "set up held-out evaluation for https://your-app". The skill asks for anything it can't infer, then runs the steps above.

## Point it at your application and Jira

| What | Where |
| --- | --- |
| Applications (UI URL, API URL, test-id attribute, healthcheck) | [heldout.config.json](heldout.config.json) → `auts` (schema-validated) · `npm run heldout -- add-aut <id> --base-url …` |
| Which application a story targets | `npm run heldout -- fetch KEY --aut <id>` (writes `evaluations/KEY/evaluation.json`) |
| Secrets used by tests | `.env` → referenced from `evaluations/<KEY>/test-data.json` as `${env:NAME}` |
| Jira | `JIRA_MODE=mock` (file-based, [mock-jira/](mock-jira/)) or `cloud` + `JIRA_BASE_URL/JIRA_EMAIL/JIRA_API_TOKEN`; `doctor --jira` finds your acceptance-criteria custom field |
| Browser tier 2 (Playwright MCP) | [.mcp.json](.mcp.json) |
| Subagents (contract extractor, independent reviewer) | [.claude/agents/](.claude/agents/) |
| CI regression run | `heldout init --ci` → `.github/workflows/heldout.yml` |

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

Seven stories across five AUTs, each with a machine-readable answer key written before evaluation
([demo/answer-keys/](demo/answer-keys/)). **Result: 7/7 verdicts correct, 26/26 findings, 0 false positives,
4/4 seeded script defects caught.** See [demo/SCORECARD.md](demo/SCORECARD.md) (`npx tsx demo/score.ts`)
and the full [evaluator test report](demo/EVALUATOR-TEST-REPORT.md).

| Story | AUT | Designed to test | Verdict |
| --- | --- | --- | --- |
| [DEMO-101](evaluations/DEMO-101/verdict.md) | saucedemo (UI) | UI journeys, a rule in an attachment | ❌ FAIL (3) |
| [DEMO-202](evaluations/DEMO-202/verdict.md) | Shady Meadows B&B (UI + API) | 16 ACs, boundaries, security, a11y, idempotency, requirement revision, seeding, API pre-steps | ❌ FAIL (9) |
| [DEMO-303](evaluations/DEMO-303/verdict.md) | restful-booker (API) | cookie/Basic auth, write methods, a seeded defect masking a real one, pre-step chains | ❌ FAIL (6) |
| [DEMO-404](evaluations/DEMO-404/verdict.md) | the-internet (UI) | false-positive resistance under mechanics traps | ✅ PASS |
| [DEMO-505](evaluations/DEMO-505/verdict.md) | the-internet (UI) | ambiguity and open questions | ⚠️ PASS WITH WARNINGS |
| [DEMO-606](evaluations/DEMO-606/verdict.md) | the-internet (UI) | an intermittent defect found by sampling | ❌ FAIL (1) |
| [DEMO-707](evaluations/DEMO-707/verdict.md) | Conduit (UI + API, JWT) | requirement-contract intake, per-user visibility, a seeded defect the AUT answers with 500 | ❌ FAIL (7) |

Robustness checks (tampering, AUT down or degraded, malformed evaluation, Jira Cloud adapter, pre-step failure, contract gates):
[demo/robustness/](demo/robustness/). Simulated Jira results are in `mock-jira/issues/<KEY>/ISSUE_VIEW.md`, and the
REST calls a real Jira would have received are in [mock-jira/outbox/](mock-jira/outbox/). Human-readable answer key:
[demo/INJECTED_DEFECTS.md](demo/INJECTED_DEFECTS.md) (the evaluator does not read it).
