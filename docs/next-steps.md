# Next steps

What is still open, most important first. Finished work is in git history and the guide
([heldout-evaluator.html](heldout-evaluator.html)); a change starts with `/speckit-specify`.

## Proof waiting for a round

Rounds start from scratch: a new round project, a fresh onboarding, freshly started applications.

| What | Where |
| --- | --- |
| The record's size. Round 40 against round 38, in real bytes: PB-2 53% (1,913 of 3,582 KB), TOOL-8 42% (1,289 of 3,045), PB-1 82% (1,106 of 1,346), with every verdict and keyed defect as expected. Target: at most 50% each. Page screenshots are the largest part left (418–570 KB a story) | `specs/003-lean-record` SC-001 |
| What agents read: not halved (`specs/001-phase-separation` SC-002). The hardener still peaks at 170k–260k tokens | see "Measure the context" below |
| The stories round 38 did not reach | `specs/001-phase-separation` T016 |
| The Playwright tools reach the hardener and triager through `mcp__playwright__*` in a session started in the project | round 38 ran the agents from the skill repository |
| A live Jira Data Center rendering of what the skill posts | |
| The opt-in pre-commit hook through POSIX sh, and a live Vault | Git for Windows' sh is proven |
| Whether GitHub Copilot reports each subagent's cost (Claude Code does) | `note --usage` |

## Improvements

| What | Why it matters |
| --- | --- |
| Measure the context each agent takes in, per round, and hand agents one test or failure group at a time | Round 40's test author, hardener and triager peaked at 130k–260k tokens; whole spec files, references and triage reports read several times were the largest part |
| Tool gaps from rounds 39 and 40 | `seed.shared(() => seed.account())` silently loses the password, so the record can't sign in after a worker restart; an `api-probe` chain's `parallel` step reports every status but one answer body; a `request` step in an `inspect` walk can't carry a token kept in browser storage |
| A test's "today" and the application's day | Twice a hardener or the orchestrator had to move a date helper to the application's UTC date by hand; the rule belongs in the test-authoring reference |
| An assertion that matches a success as a refusal | PB-1's SCN-020.1 took the word LOAN in a successful answer as the "clear reason"; the reason's check should require a refusal first |
| `hardening/confirm.ts` and `core/probe-log.ts` in the guardrail tier | They enforce held-out rules (the frozen draft, no probe before the freeze) with one review |
| The channel rule checked against TOOLB-1 | The rule's change for refusals has no live proof |
| A reading assumed in the contract and contradicted by the application | PB-2's self-transfer (keyed D4) went to the owner because the contract assumed its plain reading; whether such a gap may let the triager confirm a defect is open |
| Array fields in contracts | A field that holds a list can't be stated today |
| `--vars-from` inheritance for composed probes | A probe built on another repeats its variables |
| A wizard for connecting Jira Data Center | Onboarding asks for the settings one by one |
| Housekeeping: duplicate ParaBank journeys in the demo; over-long lines in GOVERNANCE.md and `references/test-authoring.md` | |

## Decided

- A verdict whose open questions block no criterion stays PASS; the first line and the summary posted to the story
  count them. A question a criterion can't be judged without makes it PASS WITH WARNINGS.
- A guess in a new journey is settled by the run only in the narrow case (a statement of the journey itself that
  clicks, fills or waits for what it locates, every test using it passing twice); every other guess is the
  hardener's. Not to be loosened.
