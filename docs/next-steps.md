# Next steps

What is still open, most important first. Finished work is in git history and the guide
([heldout-evaluator.html](heldout-evaluator.html)); a change starts with `/speckit-specify`.

## Proof waiting for a round

Rounds start from scratch: a new round project, a fresh onboarding, freshly started applications.

| What | Where |
| --- | --- |
| The record's size. Round 41 against round 38, in real bytes: PB-2 54% (1,932 of 3,582 KB, 121 tests), TOOL-8 40% (1,233 of 3,045), PB-1 53% (715 of 1,346). Targets: 50%, 50%, 70%. A compressed screenshot takes about 52 KB against 110 and reads well; PB-2's run record (626 KB) and triage (258 KB) are the largest parts left | `specs/004-lean-context` SC-005 |
| What agents take in: below target, see the table under this one (`specs/004-lean-context` SC-001 to SC-003, `specs/001-phase-separation` SC-002) | `npx tsx dev/context.ts <subagents folder> --filter r41` |
| The stories round 38 did not reach | `specs/001-phase-separation` T016 |
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
| What fills a hardener's context | PB-2's hardener peaked at 254k with about 138k visible in its transcript (27k of it the spec), so about 116k is what transcripts don't show, the model's thinking. Trimming what it reads can win about 10%; a real drop needs smaller tasks, such as one hardening session per domain or per group of tests, which changes how a story is run. `heldout status` is small (under 1k): the larger figures were commands chained after it, which the report files under the first |
| A finding that splits a keyed defect shows as a false positive | Keys name the story's text now (ADR 0005), and rounds 39 to 41 pair every defect with its finding, but a second finding on the same part of the story with few keywords still counts against precision (round 40's APP-4, PB-2). And 100% recall doesn't prove each pairing: about one defect in three stays "found" with its real findings removed, on one generic keyword under the right criterion, so a round's report reads the pairings |
| Keys tested blind | `storyText` was written after rounds 39 to 41 had been read (ADR 0005); only a new round tests it unseen, and no kept round exercises the other 8 keys with defects or a contract that splits those lines |
| `contract --resolve-from` says "Nothing was written" after a part-way refusal | It cites gap by gap, so a later gap's refusal leaves an earlier gap's probe reports kept |
| `specOutline`'s two low findings | An odd backtick in a string or comment misleads a test's range; a top-level declaration holding a multi-line literal gets a one-line range |
| Round 41's smaller gaps | `show contract` takes only the last of several `--ac`; `inspect --then` with a regex locator fails under Git Bash; `inspect --probe` doesn't expand `${var:name}`; step 0 of the hardener's file says "the tests you are on" where a mark can sit in a declaration, and no test keeps it a step; whether assistant text is also written twice in a transcript (`dev/context.ts`); an expected value taken from the application after a repair (PB-2's SCN-051.2 and SCN-055 now check the search against the API's own list) |
| What the hardener and triager learn about an application, kept for the next story: routes, endpoints, answer shapes, quirks, each citing the probe that proved it | Measured before building, little to win so far: a second story of an application already probes far less than the first, because the journeys carry what the first proved (hardening probes, rounds 39 to 41: PB-2 26, 26, 28; PB-1, its second, 8, 12, 12). Round 41's PB-1 hardener took in about 12k of its 141k peak from probes, so 8.5% is the most a map could spare, before the cost of reading and writing it, and many of those walks check this story's own pages. Only ParaBank's second story has been measured. Built anyway, to give agents that knowledge (`specs/007-application-map`). Round 42 (PB-2, then PB-1, from scratch): no saving to tell from noise. PB-1's hardener against round 41: probes 10 and 12, peak 141k and 141k, 20 turns and 28; its triager 8 probes and 8, peak 133k and 106k (with a usage limit in the middle and a large read of its own). PB-2's hardening probes halved in the same round (14 against 28) with an empty map, so the differences are within what a round varies by. Cost: the whole map is about 1k tokens to read. No agent before a freeze used it (transcripts), its 11 entries read by hand hold mechanics only, and verdicts stayed as keyed, 16 of 17 defects paired and the 17th raised as a question for the owner. Keep or remove: the figures don't decide it; one story of one application can't |
| The map's filter refuses a real mechanic | "a walk goes on with no login step" was refused as saying what the application lets through (`no login` in `probe/app-map.ts`), and the triager gave up on the entry after two tries: the sign-in forms belong only where the words describe a call |
| `triage` wrote no chains for round 42's evaluation runs | Both triagers looked for `6-triage/chains/05-eval/` and wrote replay chains by hand, though the runs have API failures. Check `triage/triage.ts`' conditions against a run through the `api` fixture |
| Tool gaps from rounds 39 and 40 | `seed.shared(() => seed.account())` silently loses the password, so the record can't sign in after a worker restart; an `api-probe` chain's `parallel` step reports every status but one answer body; a `request` step in an `inspect` walk can't carry a token kept in browser storage |
| A test's "today" and the application's day | Twice a hardener or the orchestrator had to move a date helper to the application's UTC date by hand; the rule belongs in the test-authoring reference |
| An assertion that matches a success as a refusal | PB-1's SCN-020.1 (round 41) and SCN-025.1 (round 42) took the word LOAN in a successful answer as the "clear reason"; the reason's check should require a refusal first. Two rounds in a row: the test-authoring reference should say so |
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
