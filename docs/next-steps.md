# Next steps

What is still open, most important first. Finished work is in git history and the guide
([heldout-evaluator.html](heldout-evaluator.html)); a change starts with `/speckit-specify`.

## Proof waiting for a round

Rounds start from scratch: a new round project, a fresh onboarding, freshly started applications.

| What | Where |
| --- | --- |
| The phase separation, live: record size at most 40% of round 38's PB-2 (about 2.1 MB), agents reading at least half as much, verdicts scoring as before; then the stories round 38 did not reach | `specs/001-phase-separation` T016 |
| If the size target is missed: slim the verdict report (PB-2's was 206 KB) | `specs/001-phase-separation` T013c |
| The Playwright tools reach the hardener and triager through `mcp__playwright__*` in a session started in the project | round 38 ran the agents from the skill repository |
| A live Jira Data Center rendering of what the skill posts | |
| The opt-in pre-commit hook through POSIX sh, and a live Vault | Git for Windows' sh is proven |
| Whether GitHub Copilot reports each subagent's cost (Claude Code does) | `note --usage` |

## Improvements

| What | Why it matters |
| --- | --- |
| Measure the context each agent takes in, per round | Round 38's test author, hardener and triager peaked at 150k–210k tokens; whole spec files, references and triage reports read several times were the largest part |
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
