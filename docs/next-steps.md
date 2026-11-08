# Next steps

What is still open, most important first. Finished work is in git history and the guide
([heldout-evaluator.html](heldout-evaluator.html)); a change starts with `/speckit-specify`.

## Proof waiting for a round

Rounds start from scratch: a new round project, a fresh onboarding, freshly started applications.

| What | Where |
| --- | --- |
| The lean coordinator and the shipped approvals: one story of a fresh round, run end to end in a session started in the round project, reaches its verdict from the 97-line SKILL.md; the permission denials it meets are counted; an amendment, if one comes up, goes hardener → triager | `specs/016-coordinator-agent` SC-002, `specs/017-lean-coordinator` SC-003 |
| The record's size. Round 41 against round 38, in real bytes: PB-2 54% (1,932 of 3,582 KB, 121 tests), TOOL-8 40% (1,233 of 3,045), PB-1 53% (715 of 1,346). Targets: 50%, 50%, 70%. A compressed screenshot takes about 52 KB against 110 and reads well; PB-2's run record (626 KB) and triage (258 KB) are the largest parts left | `specs/004-lean-context` SC-005 |
| What agents take in: below target, see the table under this one (`specs/004-lean-context` SC-001 to SC-003, `specs/001-phase-separation` SC-002) | `npx tsx dev/context.ts <subagents folder> --filter r41` |
| The stories round 38 did not reach | `specs/001-phase-separation` T016 |
| The date rules: nobody moves a date helper by hand, and a date defect stays catchable; an author without a date in the requirement raises no false positive (PB-1) | `specs/012-small-fixes` US1.4 |
| The Playwright tools reach the hardener and triager through `mcp__playwright__*` in a session started in the project | round 38 ran the agents from the skill repository |
| A live Jira Data Center rendering of what the skill posts | |
| The opt-in pre-commit hook through POSIX sh, and a live Vault | Git for Windows' sh is proven |
| Whether GitHub Copilot reports each subagent's cost (Claude Code does) | `note --usage` |

What agents took in, in thousands of tokens, rounds 38 → 40 → 41 (handoffs are estimated from characters; a peak also holds the model's thinking, which transcripts don't show; each round writes its own tests, PB-2 121 in round 41):

| Agent, story | Handoffs | Peak |
| --- | --- | --- |
| Triager, PB-2 | 57 → 58 → 46 | 176 → 190 → 174 |
| Triager, TOOL-8 | 32 → 53 → 22 | 140 → 189 → 116 |
| Triager, PB-1 | 26 → 41 → 26 | 95 → 159 → 106 |
| Hardener, PB-2 | 47 → 34 → 50 | 210 → 205 → 254 |
| Hardener, TOOL-8 | 25 → 26 → 32 | 219 → 263 → 246 |
| Hardener, PB-1 | 22 → 29 → 21 | 161 → 174 → 141 |

Test authors, their instructions and support files, rounds 38 → 41 (`specs/004-lean-context` SC-003, at least 30% less): TOOL-8 34 → 20, PB-2 32 → 25, PB-1 about 29 → 29 (round 38 has two PB-1 authors).

The triagers use the views and fall against round 40; against round 38, PB-1's is level on handoffs and higher at its peak. The hardeners read the outline and then most of the spec, in ranges: hardening seems to need it, so instructions alone won't halve it.

## Improvements

| What | Why it matters |
| --- | --- |
| What fills a hardener's context | Reading, not thinking: round 42's PB-2 hardener reached 114k of its 218k peak before its first real probe, and wrote 51k tokens in all. Round 41's "about 116k is thinking" was wrong: characters underestimate code (about 2.4 to a token). `specs/008-hardening-sessions` gives a large story a session per domain. Round 43 (PB-2 alone, from scratch, five sessions) against round 42: largest peak 143k against 218k (target 109k, missed), context summed over the turns 9.62M against 7.47M (target lower, missed), tokens the sessions ended on 627k against 220k, 70 minutes against 45. Each session spends about 60 to 80k on reading before its first probe, so what would help either way is reading less at the start: the references, and chained `status`, `journeys`, `show probes` and `contract`. Verdict as keyed, 11 of 11 by the scorer, no script defect; read by hand D6 pairs with the fractions-of-a-cent finding instead of the internal-error one, and that finding counts among the 2 false positives. The sessions are removed, and `specs/010-hardener-reads-less` has the hardener read less. Round 44 (PB-2 alone, from scratch) against round 42's one session: context at the first real probe about 56k against 114k (target 70k, met), sum 4.25M against 7.47M (target 5M, met), peak 178k against 218k (target 150k, missed), 39 minutes against 45. The spec took about 2k of it, and the journeys held 81 guesses against 69, but the suite was smaller, 109 tests against 149, which a stability run's output follows: part of the gain may be that. Verdict as keyed, integrity PRESERVED, 11 of 11 pairings right read by hand, no script defect, and read by hand the hardener searched the contract before changing a guess's words. The peak is what is left: after the first probe, probes, runs and writing add about 120k. `heldout status` is small (under 1k): the larger figures were commands chained after it, which the report files under the first |
| A finding that splits a keyed defect shows as a false positive | Keys name the story's text now (ADR 0005), and rounds 39 to 41 pair every defect with its finding, but a second finding on the same part of the story with few keywords still counts against precision (round 40's APP-4, PB-2). And 100% recall doesn't prove each pairing: about one defect in three stays "found" with its real findings removed, on one generic keyword under the right criterion, so a round's report reads the pairings |
| Keys tested blind | `storyText` was written after rounds 39 to 41 had been read (ADR 0005); only a new round tests it unseen, and no kept round exercises the other 8 keys with defects or a contract that splits those lines |
| An expected value taken from the application after a repair | Round 41: PB-2's SCN-051.2 and SCN-055 check the search against the API's own list |
| What the hardener and triager learn about an application, kept for the next story: routes, endpoints, answer shapes, quirks, each citing the probe that proved it | Measured before building, little to win so far: a second story of an application already probes far less than the first, because the journeys carry what the first proved (hardening probes, rounds 39 to 41: PB-2 26, 26, 28; PB-1, its second, 8, 12, 12). Round 41's PB-1 hardener took in about 12k of its 141k peak from probes, so 8.5% is the most a map could spare, before the cost of reading and writing it, and many of those walks check this story's own pages. Only ParaBank's second story has been measured. Built anyway, to give agents that knowledge (`specs/007-application-map`). Round 42 (PB-2, then PB-1, from scratch): no saving to tell from noise. PB-1's hardener against round 41: probes 10 and 12, peak 141k and 141k, 20 turns and 28; its triager 8 probes and 8, peak 133k and 106k (with a usage limit in the middle and a large read of its own). PB-2's hardening probes halved in the same round (14 against 28) with an empty map, so the differences are within what a round varies by. Cost: the whole map is about 1k tokens to read. No agent before a freeze used it (transcripts), its 11 entries read by hand hold mechanics only, and verdicts stayed as keyed, 16 of 17 defects paired and the 17th raised as a question for the owner. Kept on the owner's decision: the figures don't settle it, as one story of one application can't |
| A `request` step in an `inspect` walk can't carry a token kept in browser storage | Round 40; needs an application that keeps one, to prove it on |
| `seed.shared(() => seed.account())` loses the password | An account's `toJSON` keeps only its id and user name, so the run folder's copy can't sign in after a worker restart, and `reviveAccounts` doesn't recognise it. Round 41 hit this; `references/data-and-journeys.md` suggests a returned test user survives |
| An assertion that matches a success as a refusal | PB-1's SCN-020.1 (round 41) and SCN-025.1 (round 42) took the word LOAN in a successful answer as the "clear reason"; the test-authoring reference says now that the reason's check requires a refusal first (`specs/009-round-43-gaps`), and a round shows whether authors follow it |
| The channel rule checked against TOOLB-1 | The rule's change for refusals has no live proof |
| A reading assumed in the contract and contradicted by the application | PB-2's self-transfer (keyed D4) went to the owner because the contract assumed its plain reading; whether such a gap may let the triager confirm a defect is open |
| Array fields in contracts | A field that holds a list can't be stated today |
| A wizard for connecting Jira Data Center | Onboarding asks for the settings one by one |
| Housekeeping: over-long lines in `references/test-authoring.md` | |

## Decided

- A verdict whose open questions block no criterion stays PASS; the first line and the summary posted to the story
  count them. A question a criterion can't be judged without makes it PASS WITH WARNINGS.
- A guess in a new journey is settled by the run only in the narrow case (a statement of the journey itself that
  clicks, fills or waits for what it locates, every test using it passing twice); every other guess is the
  hardener's. Not to be loosened.
