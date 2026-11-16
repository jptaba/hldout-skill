# Optimization plan: the held-out evaluator, from its goal

Status: being built since 2026-11-15, with the owner's decisions of the same day in section 10; the Progress
section below says how far. It starts from what the evaluator is for, not from how it is built today, and ends with
a phased roadmap in which every phase must earn the next one with numbers.

## Progress

Work resumes from the first step here that is not done. A gate's figures go beside it when it is measured.

| Step | State |
| --- | --- |
| 0.1 Clean slate: scorecard, round history, the guide's and README's results, the old end-to-end recording | done |
| 0.2 The benchmark's tools: the application with switchable faults, a headless run with its cost, an exact score | done: `dev/bench.ts`, `dev/bench/`, `demo/bench/` |
| 0.3 New stories and their keys, by an author who has not read the evaluator; the old stories and keys removed | done: SHOP-1 to SHOP-5, 14 faults; the web-shop side of the stories was written from the application's source, not seen in a browser |
| 0.4 Baseline: every story once, two stories three times (the noise band) | cut to a minimum on the owner's word (2026-11-16): SHOP-1, SHOP-2 and SHOP-3 are measured, and SHOP-3 is the last. **b03-shop3 (SHOP-3, F06 F07 F08):** FAIL as keyed, 3 of 3 found, no false positive, 35 tests, 14 failed; 1,940k new tokens, 66 minutes, $41.14 (the run went on over three usage limits, which costs context read again each time); subagents 824k tokens, 60 minutes (hardener 212k, triager 173k, extractor 170k, reviewer 129k over three review rounds, author 139k). No repeats, so no noise band: a later difference smaller than about a fifth of a figure can't be told from chance, and the plan's gates are read with that in mind. The baseline build is the tag `bench-baseline`; its projects are set up from a worktree of that tag (`HELDOUT_SKILL_DIR`), one project per run, named `b01-shop1` and on, one evaluation at a time. Still to run: SHOP-3 to SHOP-5 once, SHOP-1 and SHOP-5 twice more, SHOP-1 once with no fault on. **b02-shop2 (SHOP-2, F04 F05):** FAIL as keyed, 2 of 2 found, no false positive, 12 tests, 8 failed; 969k new tokens, 64 minutes, $23.68 over two headless runs; subagents 591k tokens, 55 minutes (hardener 194k, author 152k, triager 123k, extractor 80k, reviewer 42k). Four tests failed in the score's clean run on favourites the faulty run had left; the score now starts from fresh data. **b01-shop1 (SHOP-1, F01 F02 F03):** FAIL as keyed, 3 of 3 faults found, 30 tests, 11 failed; the tool's figures: 1,172k new tokens, 73 minutes, $28.86 over two headless runs (a usage limit between them); the subagents as the app reported them: 624k tokens, 67 minutes (author 198k, hardener 212k, triager 115k, extractor 43k, reviewer 55k). One finding failed with no fault on (APP-4, the overview stays on its page when the range or the order changes): the untouched web shop really does that, so the story was wrong, not the evaluator; that sentence is removed from SHOP-1 for the runs that follow. Two more tests failed with no fault on and were rightly left NEEDS_INVESTIGATION (the slider moves in whole amounts). At this cost one evaluation takes more than one 5-hour usage window beside the session that drives it |
| 0.5 Gate: a deliberately broken build scores visibly worse | not run (the baseline was cut to a minimum): the benchmark's power to see a worse build is unproven |
| 0.6 The owner's GitHub Copilot checklist, written; run by the owner | written: `docs/copilot-checklist.md`; not yet run |
| 1.1 Check budget and "fewest checks that could falsify" | built (at most 4 tests a criterion, a table as one; lint `over-budget`); not yet measured. The records asked for in 5.5, read first (rounds 41, 42, 44: 26 findings of PB-1, PB-2, TOOL-8): every finding had a functional, negative, boundary or security test of its own criterion, except one in round 42 raised by two concurrency tests alone, which rounds 41 and 44 raised with boundary and negative tests too. One finding took up to 20 tests (security through the API) |
| 1.2 Failures grouped by cause before triage | already in the build: the triage report groups failures by criterion, call and status, and one decision takes a group. Nothing added |
| 1.3 Mechanical replay of API failure groups | built (`triage --replay`, run by `advance`): a sure API failure whose calls were not sent signed in is sent again outside the test, twice, and confirmed on the same answer; not yet measured. Signed-in calls still go to the triager: the record keeps no token |
| 1.4 A brief per role, printed by the tool | moved to phase 3: five briefs for roles about to become three would be written twice |
| 1.5 The one-screen verdict | built: the verdict, each finding in a line, the owner's questions and what was not tested come first; the findings in full follow; the rest is "The record" below. Checked on round 47's TOOL-3 rendered again |
| 1.6 One knowledge store per application | moved to phase 3: the store's reading rules go with decision 9, which that phase builds |
| 1 Gate | to measure, at a minimum: one story with the phase 1 build (1.1, 1.3, 1.5) against its baseline run |
| 2 The oracle as data, and its gate | built, not yet measured. The checks live in the contract (`acceptanceCriteria[].checks`: steps in words, each expected value with its comparator and the line it cites), validated by `contract` (shape, ids, a budget of 4 a criterion and 6 rows, every value in its cited line or in the gap the check rests on), reviewed with their criterion, frozen with the contract's oracle. `advance` generates the spec from them and no test author runs; tests assert by `expectCheck(id, actual)`, and integrity refuses an expectation written in a test. The contract rendered for people has a "What is tested" section in plain words: the first form of the test catalogue (6.6). Tried by hand on SHOP-2's contract: generated, linted, two checks filled in and run. Not built: API checks run from a call description without a test (5.12), the record of where an actual value came from (6.5), the discrepancy record. Still in the tree though unused: the test author agent, its reference and the hand-written spec path (phase 5) |
| 3 Three roles, and its gate | |
| 4 A headless run, and its gate | |
| 5 Delete, and its gate | |
| 6 The guide, made again | |

## 1. Summary

**The goal.** A person who must accept or reject a story gets a verdict they can trust and check, without doing the
testing: does the running application do what the story asked, judged only from what the story says, by really
testing the live application. The tests are a deliverable too: anyone, technical or not, can read in plain English
what was tested, and run it again when they need to.

**The main finding.** The evaluator reaches that goal today, but the way it reaches it is the expensive way round.
It writes complete test code before seeing the application, then spends most of its effort repairing that code
against the application and proving the repair did not change what the tests expect. Three costs follow from that
one choice: a blind author guessing mechanics, a hardener undoing the guesses, and a body of lint, freeze and
integrity code that polices the boundary between the two. Suite size, which nothing bounds, multiplies all three.

**The direction.** Keep the rule that matters (what is correct comes from the requirement; where the story and the
live application disagree, the story wins) and hold it in data, not in code and not in who may look at the
application (decision 9: no agent is kept away from it, in any phase):

1. The oracle becomes a small reviewed data file of checks. It is frozen by its hash, and nothing after the freeze
   can write to it.
2. One agent with the application in front of it turns each check into something that runs, runs it, and explains
   each failure. It cannot change an expected value, because expected values are not in the files it edits.
3. Everything that can be mechanical is: grouping failures by cause, replaying an API finding, rendering the
   verdict.
4. Fewer checks per story, chosen by what could falsify each criterion, with a budget.

**The first step is not a redesign.** It is a benchmark that can tell an improvement from noise, which the project
does not have today (section 4.3). Without it this plan cannot be judged, and neither can the current design.

**Expected effect, as a hypothesis to prove:** about half the tokens and minutes per story, a skill about half its
present size, and the same or better verdicts. Section 9 has the targets and how each is measured.

## 2. What this plan rests on

- The skill's own description of itself (`SKILL.md`, the references, the agent files, `README.md`).
- The records of rounds 38 to 47 in `docs/next-steps.md` and `demo/SCORECARD.md`.
- Two round projects read directly: round 47 (one small story) and round 42 (two large ones), with `heldout stats`.
- The size and layout of the code, not a line-by-line reading of it.

**Weak point.** The code was surveyed, not audited: a claim here about what a module costs to keep is a judgement
from its size and its role. And every figure comes from 14 stories on 3 applications, the same ones the skill was
tuned on. Section 4.3 treats that as a finding of its own.

## 3. The end goal

### 3.1 What it is for

| The reader needs | So the evaluator must |
| --- | --- |
| A verdict on the story | say PASS, PASS WITH WARNINGS, FAIL or INCONCLUSIVE, per criterion |
| To trust it | take what is correct from the requirement only, and show where each expectation came from |
| To check it | give each finding with steps a person can repeat in minutes |
| To know its limits | say what was not tested, what was assumed, and what the story leaves open |
| To read what was tested | describe every test in plain English, for QA and for people who don't read code |
| To run it again | rerun a story's tests, or one of them, on demand, with one command |
| Not to babysit it | run unattended from the story to the published verdict |
| To afford it on every story | cost little enough, in tokens and minutes, to be routine |

Two more goals shape the design but are not the purpose: it works on any web application or API, and it works in
GitHub Copilot and in Claude Code.

### 3.2 What "held-out" protects against

The skill never states its threat model in one place, and its controls are easier to judge once it is stated:

1. **Oracle contamination.** The evaluator sees what the application does and, without meaning to, starts expecting
   it. This is the risk nearly every guardrail in the skill addresses, today by keeping the test author away from
   the application. By decision 9 no agent is kept away from it, so the control becomes what an expected value
   must cite, not what an agent may see (6.5).
2. **Invented requirements.** The model reads a story and adds a criterion, a status or a message the story never
   stated.
3. **Vacuous passes.** A check passes because of how it was built, not because the application is right: it reads
   the value it just sent, or compares the application with itself.
4. **Teaching to the test.** Whoever implements the story sees the tests and builds to them. The stories are
   implemented by another group of agents, outside this project (decision 1), so this threat is real. Today
   nothing addresses it: the tests are committed to the evaluation project, and nothing says who may read it.

### 3.3 What it is not for

It does not file defects or decide acceptance. The tests it leaves behind are a deliverable (decision 2): readable
and rerunnable. They are not a promise to maintain a regression suite as the application changes.

**Weak point.** "Readable by a non-technical person" is a quality nobody measures today. Section 9 gives it a
check, and that check is a person's judgement, not a number.

## 4. Where the design stands

### 4.1 Shape

| Part | Size |
| --- | --- |
| Phases a story passes through | 10 (fetch to knowledge) |
| Subagent roles | 5, each in a fresh context, plus a coordinator |
| `heldout` commands | about 30 |
| Scripts | about 13,600 lines in 75 files |
| Instructions an agent may read | about 3,000 lines (`SKILL.md`, 16 references, 7 agent files) |
| Test support (`fixtures.ts`) | 856 lines |
| Stores of knowledge about an application | 4 (overview, map, rules, journeys) plus the probe log |
| The skill's own tests | 498 |

### 4.2 What a story costs

| Story | Size of story | Tests | Subagent tokens | Subagent minutes | Notes |
| --- | --- | --- | --- | --- | --- |
| TOOL-3, round 47 | 279 words | 22 | 297k | 17 | 2 findings; the verdict file is 25 KB |
| PB-1, round 42 | | | 486k | 30 | 5 runs |
| PB-2, round 42 | 498 words | 149 | 660k | 63 | 5 runs; 85 failing tests for 11 keyed defects |

- The test author, who has no browser, is the largest single cost of the small story (95k of 297k).
- A hardener on a large story peaks at 178k to 254k of context and reads 56k to 114k before its first real probe.
- The same story gives a different suite each round: PB-2 had 109, 121 and 149 tests in rounds 44, 41 and 42.

### 4.3 What it achieves, and how well that is known

| Round | Verdicts as keyed | Defects found | False positives |
| --- | --- | --- | --- |
| 32, Toolshop, 9 stories | 9 of 9 | 12 of 13, the other raised as a question | 0 |
| 35, ParaBank, 3 stories | 2 of 3 | 16 of 17, the other raised as a question | 2 |

These are good results. They are also weaker evidence than they look:

- **The exam is the textbook.** The skill's rules were written after reading rounds on these same stories. Only
  ParaBank's keys were written by someone who had not seen the evaluator, and that is where precision fell to 89%
  and a verdict was missed.
- **The scorer is soft.** `docs/next-steps.md` records that about one defect in three stays "found" with its real
  finding removed, on one generic keyword.
- **Noise is unmeasured.** Several experiments ended with "no saving to tell from noise" (the application map,
  hardening sessions). No story has been run several times unchanged to learn what noise is.
- **A round is slow and costly**, so few are run, so each change is judged on one sample.
- **GitHub Copilot has never run a story end to end.**

The project cannot currently tell whether a change made it better. That is the first thing to fix.

**Weak point.** The cost figures are what the agent app reported per subagent; they are comparable with each other,
not exact. Rounds 42 and 47 are single runs, with the noise this section complains about.

## 5. The design, challenged

Each part below is judged against the goal, not against the effort already spent on it.

### 5.1 Writing whole tests blind, then repairing them

**Today.** An author with no browser writes a full Playwright spec from the contract, marks its guesses
`TODO(harden)`, and the spec is frozen. A hardener then makes it work against the application.

**Challenge.** Independence needs the *expected values* to come from the story. It does not need anyone to work
blind (decision 9), and least of all the *clicks and calls*. Writing them blind produces guesses by design, and the
costliest phase of a story is removing them. The author spends 95k tokens partly on code that will be rewritten.

**Better.** Split the test in two at the line the skill already draws between WHAT and HOW. The oracle author
writes only WHAT, as data, every value cited to a line of the story. It may open the application to understand
what the story is talking about, never as the source of a value; what it sees that differs from the story is
recorded as a discrepancy, and the story's value stands. The operator writes HOW once, correctly, the first time.

**Verdict: change.** This is the centre of the plan (section 6).

**What could be wrong.** An author who has seen the application may read an unclear line of the story the way the
application behaves, and nothing mechanical can see that: the value still cites a real line. The reviewer and the
benchmark are the only checks on it (section 12). And an author who must name steps ("add the product on its
page") is forced to think the journey through, which may be part of why tests are thorough; the checks file keeps
the steps in words for that reason.

### 5.2 Policing the freeze in code

**Today.** The freeze snapshots the spec; `integrity` compares assertions before and after hardening; lint refuses
expected values inside journeys; two audited exceptions (`--amend`, re-freeze) handle the cases the comparison is
too strict for.

**Challenge.** This is enforcement after the fact, on source code, of a property that could hold by construction.
It is also incomplete: `docs/next-steps.md` records a repaired test that took its expected value from the
application (PB-2's search checked against the API's own list), which the comparison did not catch.

**Better.** Expected values live only in the frozen checks file. Test code asserts by reference
(`expectCheck('C7.2', actual)`), and the runner supplies the expected value. The agent that edits test code has
nothing to weaken. `integrity` becomes a hash comparison, and `--amend` disappears, because an over-strict
comparison is a property of the check's comparator, fixed by a reviewed revision of the checks file.

**Verdict: change.**

**What could be wrong.** It closes contamination of the *expected* side only. The *actual* side stays open: a
check can still be fed the wrong value (threat 3). Today's design has the same hole. Section 6.5 adds a control for
it, and that control is the least proven idea in this plan.

### 5.3 Three statements of one requirement

**Today.** The requirement is stated in `contract.json`, again in the spec (constants, tags, source comments), and
again in the verdict. Scripts keep the three in step (`preflight`, `spec-model`, `contract-model`: about 1,100
lines).

**Challenge.** The project's own rule is that one fact lives in one place.

**Better.** The checks file is the contract. A criterion, its quoted source lines, its checks and their expected
values sit in one record; the verdict renders from it and the run results.

**Verdict: change, together with 5.1.**

**What could be wrong.** Merging the two makes the review bigger per pass: the reviewer now judges checks as well
as criteria. If the reviewer's attention is the limit, reviewing in two passes over one file is the fallback.

### 5.4 The contract's evidence rules and independent review

**Today.** Every criterion is quoted from cited lines, every source line is accounted for, every literal must exist
in the sources, and a reviewer in a fresh context confirms each item, for up to 3 rounds.

**Challenge.** It costs about a quarter of a small story (76k of 297k). Is it worth it?

**Assessment.** Yes. It is the only defence against invented requirements (threat 2), the mechanical half (literals
exist in the sources) is cheap and exact, and it is what lets a reader trust a verdict they did not produce.

**Verdict: keep, and narrow the reviewer.** The reviewer should not re-confirm what a script already proved. Its
job is what a script cannot do: a criterion missed, a meaning bent, a check that would not falsify its criterion.
Cap the exchange at 2 rounds; what is still disputed becomes an open question, as it does now after 3.

**What could be wrong.** A narrower reviewer may miss an error the mechanical checks also miss. The benchmark needs
stories with traps in the requirement text (contradictions, a figure stated twice) to see this.

### 5.5 Suite size

**Today.** The authoring reference has two passes: every criterion, then "round the test types". A 498-word story
produced 109 to 149 tests. Nothing limits the number.

**Challenge.** Every later cost scales with tests: hardening, the run record, triage, the verdict's length. And 85
failing tests for 11 defects means roughly 8 tests told the reader the same thing. More tests did not find more
defects; they found the same defects more often.

**Better.** For each criterion, write the fewest checks that could prove it false: its plain case, each boundary
the story states, each refusal the story states. A test type is a label on a check that exists for another reason,
never a reason to add one. Give the story a budget (a number of checks per criterion, with a stated reason to
exceed it), and let variants of one check be rows of a table, so that 8 rejected quantities are one check with 8
rows and one result.

**Verdict: change. Probably the largest saving for the least work**, and it needs no redesign (phase 1).

**What could be wrong.** Some of the 11 defects may have been found only by a "rounding" test. The answer is in the
records: for each keyed defect of rounds 41 to 45, find the smallest set of tests that would still have raised it.
Do that before setting the budget, not after.

### 5.6 Triage, one failure at a time

**Today.** An automatic classifier proposes a class per failed test (in the scorecards it agrees with the final
decision 81% to 100% of the time, abstains on the rest, and is never wrong). A triager then reproduces each failure live. No
application defect is recorded without a live reproduction.

**Challenge.** The rule is right; the unit is wrong. The triager reproduces tests, and the reader wants causes.
For API checks the reproduction is itself mechanical: the runner already knows the calls, so it can replay them
outside the test and compare.

**Better.**
1. Group failures by cause before any agent sees them: same call, same expected, same actual.
2. For an API group, the runner replays the chain standalone, twice. Same result both times is a reproduction, with
   no model involved.
3. An agent looks only at what is left: UI failures, groups whose replay disagrees with the test, and anything the
   classifier abstained on.

**Verdict: change.** Keep the rule, mechanise the routine part.

**What could be wrong.** A mechanical replay repeats the test's own mistake: if the check sends a malformed request,
the replay fails the same way and looks like a defect. So a group counts as reproduced mechanically only when the
failure is on the response, not on getting there, and a script-defect suspicion from the classifier always goes to
the agent.

### 5.7 Five roles in five fresh contexts

**Today.** Extractor, reviewer, author, hardener, triager. Each starts cold and reads its instructions and the
story's state before acting: 60k to 80k per hardening session before the first probe.

**Challenge.** Independence needs one wall: the reviewer must not see the author's reasoning. Access to the
application is not a wall at all (decision 9). The wall between hardener and triager protects nothing in the
threat model, and it costs a second cold start plus everything the hardener learned and the triager must learn
again.

**Better.** Three roles, each free to use the live application:

| Role | Uses the application to | Writes |
| --- | --- | --- |
| Oracle author | understand the story; note where the two differ | the checks file, every value from the story |
| Oracle reviewer (fresh context) | check a discrepancy the author noted, or find one it missed | its review |
| Operator | make each check run, and reproduce each failure | the runnable form of each check, the journeys, the diagnosis of each failure group |

**Verdict: change, after 5.1 and 5.6 are in place.** With those two, the operator's work per story is much smaller
than the hardener's and triager's today.

**What could be wrong.** This is the riskiest merge. An agent that built a check is inclined to blame the
application when it fails, and a fresh triager is a real second opinion. Two things replace it: the mechanical
replay of 5.6, and the verifier of section 6.5. If the benchmark shows more false positives after the merge, undo
it; the roadmap puts it late for that reason. A large story may also still need the operator's work split by
domain to fit a context.

### 5.8 Four stores of application knowledge

**Today.** The overview (written at setup), the map (mechanics, citing probes), the rules (required and observed),
and the journeys with their registry. Rules decide who may read which before a freeze.

**Challenge.** The project measured this itself. The journeys carry what a second story needs (an application's
second story took 8 to 12 hardening probes where its first took 26 to 28). The map's saving could not be told from noise, and it was "kept on the owner's
decision". Each store adds commands, instructions, and a rule about who may read it.

**Better.** Knowledge of the application is kept and grows with every story (decision 10): what any agent learns
from the live application is saved, and the next agent or story starts from it. The fault today is not that
knowledge is kept; it is four stores with four sets of commands and reading rules, and no measure of what each
saves. Make it one store per application with one way to write and one way to read (6.7), and let the benchmark
tune what goes into it.

**Verdict: keep and consolidate. The benchmark decides the store's shape, not its existence.**

**What could be wrong.** The saving from anything but the journeys is so far unmeasured, and a store that grows
costs tokens to read. Saved knowledge also goes stale when the application changes, and a stale entry trusted
costs more than a probe. Section 6.7 has the guards: an agent is given the slice its work needs, not the store,
and an entry is corrected in the step that finds it wrong. Entries carry no record of when they were last
confirmed (decision 11), so staleness shows only when something fails; that is the price of a store that does not
churn. The benchmark includes a sequence of stories on one application long enough to see the curve.

### 5.9 Thirty commands and three thousand lines of instructions

**Today.** Agents may not write scripts; every need becomes a command, and every incident in a round became a rule
in a reference.

**Challenge.** Each rule was a reasonable answer to something that happened. Together they are a large text that
every fresh context pays to read, tuned to three applications. Rules that fix one story's mistake can cost every
other story, and nobody measures that side.

**Better.**
- Print each role its brief from the tool: its task, its slice of the checks, and only the rules of its step. This
  is already in `docs/next-steps.md`; with three roles it is three briefs.
- Give every rule a reason to exist that the benchmark can test. Remove a rule, run the benchmark; if nothing gets
  worse, it stays removed.
- With checks as data, whole families of rules and their commands go: the lint of journeys for expected values, the
  spec views, the amend flow, the tag conventions the scripts parse.

**Verdict: shrink, by measurement rather than by taste.**

**What could be wrong.** Some rules guard against rare, expensive failures the benchmark will not reproduce in a
few runs. Rules about safety (secrets, untrusted content, never filing issues, live side effects) are kept without
needing to earn it.

### 5.10 The verdict as a document

**Today.** 25 KB for a story with two findings.

**Challenge.** The reader's questions are few: what is the verdict, what failed and how do I see it, what was not
tested, what must I answer. Length hides the two findings that matter.

**Better.** One screen first: verdict, findings (one line each), open questions, what was not tested. Each finding
then has its requirement, expected against actual, and the shortest reproduction. The traceability matrix, the
passing checks and the run history go to the attachment.

**Verdict: change. Cheap, and it is the only part of the system its users read.**

**What could be wrong.** An auditor may want everything inline. The attachment keeps it all; only the order changes.

### 5.11 A chat session as the engine

**Today.** A person asks an agent app to evaluate a story. A deterministic command (`advance`) decides what comes
next, and the app's agent runs the subagents it names.

**Challenge.** `advance` as a state machine is the right core. But a chat session as the only way to run it makes
runs hard to repeat, impossible to run side by side, and dependent on each app's approvals and subagent support.
That is why GitHub Copilot is still unproven and why a round takes a day.

**Better.** Keep the skill as the way a person asks. Add a headless way to run the same state machine, in which
`advance` starts each role itself through the agent app's command line or SDK. Rounds, the benchmark and CI use
that.

**Verdict: add, after the roles are simpler.** Three roles are much easier to drive headlessly than five.

GitHub Copilot is the primary app and Claude Code is where the skill is developed (decision 3). So the design may
rely only on what both have: a skill, subagents with their own tools, a terminal. Whatever only one app offers is
a convenience on top, never the path quality depends on. The headless driver is built for Claude Code, as the
development and benchmark tool; in GitHub Copilot the coordinator agent stays the entry point.

**What could be wrong.** GitHub Copilot can't be run where the skill is developed, so parity is a claim until
someone runs it there. Phase 0 and each later gate include a checklist the owner runs in Copilot on one story, and
a difference found there outranks a benchmark result from Claude Code.

### 5.12 Generated Playwright code at all

**Challenge.** Could an agent simply operate the application and report, with no test code?

**Assessment.** No, for three reasons from the goal: a person must be able to repeat a finding; a flaky result must
be told from a real one by running it again unchanged; and a result that exists only in a model's account of what
it saw cannot be audited. Code that runs is the evidence.

**But** much of it need not be *written*. Most checks in the API-heavy stories are "send this, expect that". Those
can be run from the checks file plus a small description of the call, with no generated test. Playwright code is
then written only for UI checks and for the journeys.

Because the tests are a deliverable (decision 2), a check run from data must be as readable and as rerunnable as a
coded one. It is more so: its plain-English steps and its expected values are the checks file itself, and
`heldout run KEY` reruns it. Section 6.6 has the catalogue a reader opens.

**Verdict: keep code as the evidence; generate less of it.**

**What could be wrong.** A declarative format for calls grows, one exception at a time, into a worse programming
language. The guard is a hard line: a call chain that needs a loop, a condition or a computed value is written as
code in a journey, not expressed in the format.

## 6. The target design

### 6.1 One story, end to end

```
story + linked sources
  → checks file        written from the sources; every value cited                (oracle author)
  → review             fresh context; mechanical grounding first                  (oracle reviewer)
  → freeze             the hash of the checks file
  → realise            each check made runnable against the live application      (operator)
  → run                every check, twice when stability is in doubt              (script)
  → group and replay   failures grouped by cause; API groups replayed standalone  (script)
  → diagnose           only what the replay could not settle                      (operator)
  → verify             each finding's reproduction, repeated from the verdict     (script, or a fresh agent for UI)
  → verdict            rendered from the checks file and the results; published   (script)
  → test catalogue     every check in plain English, with how to rerun it         (script)
```

### 6.2 The checks file

One reviewed file holds what the contract, the frozen draft and the requirement constants hold today:

- each criterion, quoted, with its source lines;
- each check of it: the starting state and the action in words, the layer (UI or API), and each expectation with
  its comparator, its value and the source line the value came from;
- variants of a check as rows;
- assumptions and open questions, each naming the checks that rest on it.

Nothing in it says how to reach a page or which endpoint to call unless the story says so. After the freeze it is
read-only to every agent; a requirement revision makes a new version with a reason, as a re-freeze does now.

### 6.3 Making a check runnable

- **API checks:** a description of the calls (a journey for the preconditions, then the call under test). The
  runner sends them, takes the actual value from the response, and compares it with the frozen expectation.
- **UI checks:** a short Playwright test that calls journeys and ends in `expectCheck(id, actual)`.
- **Journeys:** as today, the shared mechanics of the application, one file per area, never holding an expected
  value. They are the durable knowledge.

### 6.4 What a script does and what an agent does

| Script, every time the same | Agent, where judgement is needed |
| --- | --- |
| fetch, evidence pack, grounding of literals | reading the story into checks |
| freeze, run, stability reruns | reviewing the checks |
| grouping failures, replaying API groups | finding how the application is operated |
| redaction and scrubbing | explaining a failure the replay did not settle |
| rendering and publishing the verdict | |

### 6.5 The controls, against the threats of section 3.2

| Threat | Control in the target design |
| --- | --- |
| Oracle contamination | Any agent may use the live application in any phase; the story wins wherever the two differ. Expected values exist only in the frozen checks file, each citing the story line it came from, and a value with no such line is refused. A difference an agent sees is recorded as a discrepancy and reaches the verdict as a finding or an open question; it never changes a value. The operator's files cannot hold an expected value |
| Invented requirements | Quoted criteria, cited values, mechanical grounding, a fresh reviewer |
| Vacuous passes | The runner records where each actual value came from; a value not taken from a response or the page fails the run. A sample of passing checks is read by the reviewer role after the run |
| A wrong finding | Mechanical replay; then each finding's written reproduction is repeated from the verdict alone before publishing |
| Teaching to the test | The evaluation project is separate from the application's repository, and the implementing agents get no access to it. They receive the published verdict only: findings and reproductions, not the checks that passed. `SKILL.md` states the rule, and `doctor` warns when the project sits inside the application's repository |

The control for vacuous passes is new and unproven. It is the part of this design most likely to need a second
attempt.

### 6.6 The tests as a deliverable

Each story leaves, beside its verdict, a test catalogue rendered from the checks file and the last run:

- per criterion, each check as a short paragraph a non-technical reader follows: the starting state, what is done,
  what is expected and where the story says so, and the result;
- the same steps as the run performed them, so QA can repeat a check by hand;
- one command to rerun the whole story and one to rerun a single check, with what must be running first;
- what was not tested and why.

The catalogue is written by a script from words the oracle author wrote and the reviewer read, so it cannot
describe a test that differs from the one that ran. A rerun uses the frozen checks and the current journeys; if the
application has changed since, a failure says whether the check failed or the way to it broke.

**What could be wrong.** Plain English written by an agent for a script can be stiff or vague. The reviewer is
asked to judge the wording as a reader would, and the benchmark includes a person reading two catalogues cold.

### 6.7 What is learned about the application is kept

Every use of the live application, by any agent in any phase, leaves what it learned in one store per application,
so that the next subagent or story reuses it and goes to the application only for what is missing (decision 10).
It holds three kinds of knowledge:

| Kind | What it is | Form |
| --- | --- | --- |
| Domain knowledge | the application's areas, terms, roles and the behaviour agents observed | short notes per area, each marked as observed |
| User journeys | how each thing is done: routes, locators, calls, request fields | journey code, exercised by every run |
| Data seeding | how each precondition is created, which accounts and data exist, what a run leaves behind | seeding journeys, and notes on accounts and clean-up |

- **Written only when something is new.** The store grows by new knowledge and by nothing else (decision 11). An
  agent that learns what the store lacks adds it; nothing learned stays in one agent's context. Using an entry,
  or finding again that it works, writes nothing.
- **Nothing about its use.** An entry holds the knowledge only: no story or requirement that used it, no date or
  run it was last read or confirmed in, no counters or status. Fields whose values change often are avoided
  throughout, so a story that learned nothing new leaves the store byte for byte as it found it.
- **Read first.** Each role's brief (5.9) carries the slice of the store its checks touch. An agent opens the live
  application for what the slice lacks, or when something in it fails.
- **Corrected only when wrong.** An entry changes when it is found to be wrong, in the step that found it. A
  journey that breaks in a run is the signal; git history has who changed what and when.
- **Never an oracle.** Observed behaviour is knowledge of how the application is operated, never of what is
  correct. No expected value may cite the store; the story wins (decision 9).

**What could be wrong.** The store is the easiest path for the application's behaviour to become what the next
story expects, one story later and with nobody noticing. The citation rule of 6.5 is the guard, and it is the same
guard weak point 7 of section 12 already leans on.

### 6.8 What goes

The frozen draft spec and its comparison, the amend flow, the lint of expected values in journeys, the spec views
and tag conventions, the per-failure triage flow, the separate overview, map and rules stores with their commands
(their content moves into the one store of 6.7), and the instructions that explain all of these. A fair estimate is that the scripts and the instructions each fall by about half. That is an estimate
from the list, not from the code.

**Weak point of the whole section.** It is a design on paper by someone who has read the system's records, not run
it. Each arrow hides cases the present design met in rounds and solved with a rule. The roadmap is ordered so that
the paper design is tested in the smallest piece first (phase 2 runs on one story before anything is deleted).

## 7. Alternatives considered

| Alternative | Why not |
| --- | --- |
| An agent explores the application and reports, with no tests | Not repeatable, not auditable, flaky results cannot be told from real ones (5.12) |
| Take what is expected from the application | Cheapest, and it destroys the one property the evaluator exists for. Looking is allowed (decision 9); the application is never the source of an expected value |
| A Gherkin layer between the story and the tests | A fourth statement of the requirement; the checks file does the job with expected values a script can read |
| Generate tests from an OpenAPI document | The document describes what the application does, not what the story asked. Useful only as mechanics for the operator |
| One agent does everything | Nobody in a fresh context would review the checks, and one context would have to hold the whole story |
| Keep the design and only tune it | Phase 1 does exactly this first. If it reaches the targets, phases 2 to 5 are not needed, and the plan says so |
| A smaller model for the routine roles | The owner's standing decision is Opus for every agent. The benchmark measures the reviewer alone on a smaller model, under the condition in decision 5 |

## 8. Roadmap

Each phase ends at a gate. A phase that misses its gate is stopped or redone; the next one does not start on hope.

### Phase 0: a clean slate, and a benchmark that can see a difference

Start fresh (decision 6). The old results describe a build that is about to change, on stories the skill was tuned
on, so they are removed rather than carried along:

- from the repository: `demo/SCORECARD.md`, the round history in `docs/next-steps.md` (what is still open moves
  into this plan or is dropped), the rounds and results sections of the guide and the README, and recordings that
  show the old flow;
- the old demo stories and answer keys, once the new benchmark's stories exist: until then they are the only
  stories there are;
- outside the repository, for the owner: the round projects of rounds 38 to 47 and the published consumer project.

Git history keeps all of it. The present build is measured once on the new benchmark before anything changes: that
run is the baseline every later phase is compared with.

- **A fault-injected application.** One demo application the round can start with chosen defects switched on, so
  that what should be found is known exactly and changes per run. This replaces keyword matching against prose keys
  with an exact comparison.
- **Stories nobody tuned on.** A handful of new stories for it, written by someone who has not read the evaluator,
  including traps in the requirement text.
- **Noise.** Three unchanged runs of two stories, to learn how far verdict, findings, suite size, tokens and
  minutes vary with nothing changed.
- **Cost captured by the tool**, not reported by hand, for every role.
- **One story end to end in GitHub Copilot, run by the owner** from a checklist (it can't be run where the skill
  is developed), to learn what that app really supports before designing for it.

Gate: the benchmark gives the same score to the same build within a known band, and a deliberately broken build
(the reviewer removed, say) scores visibly worse.

**Weak point.** Building a fault-injected application is real work on something that is not the product. Keep it
small: 10 to 15 switchable defects in an application that already exists in the demo set. If it takes more than a
few days, fall back to a second independent author's keys on the existing applications.

### Phase 1: the savings that need no redesign

In the present architecture, each measured against phase 0:

1. A check budget and the "fewest checks that could falsify" rule in authoring (5.5).
2. Failures grouped by cause before triage (5.6, step 1).
3. Mechanical replay of API failure groups (5.6, step 2).
4. A brief per role, printed by the tool (5.9).
5. The one-screen verdict (5.10).
6. The four knowledge stores made one, written only when something new is learned and read through the briefs
   (5.8, 6.7). The benchmark runs a sequence of stories on one application with the store and with it emptied, to learn
   what each kind of knowledge saves.

Gate: tokens and minutes per story down by at least 30% with verdicts, recall and precision inside the noise band.
If this phase alone reaches the targets of section 9, stop here and say so.

**Weak point.** Six changes at once cannot be told apart. Land them in the order above and run the cheap half of
the benchmark after each.

### Phase 2: the oracle as data

- The checks file, its grounding checks and its review, for one story, beside the present flow.
- `expectCheck` and the runner supplying expected values; the freeze as a hash.
- API checks run from a call description, without a generated test.

Gate: on the benchmark, the same verdicts and findings as phase 1's build, with the author's cost at least halved,
and no expected value reachable from any file the operator edits.

**Weak point.** Two flows side by side double the maintenance for as long as the phase lasts. Time-box it; if the
gate is missed twice, the idea is wrong for a reason worth writing down, and phase 1's build stands.

### Phase 3: three roles

- Hardener and triager become the operator; the verification step is added (6.5).
- Extractor and author become the oracle author.

Gate: no more false positives than phase 2's build across the whole benchmark, and a further fall in cost.

**Weak point.** As 5.7 says, this is the merge most likely to cost precision. The gate is on false positives for
that reason, and the phase is separable: phases 2 and 4 stand without it.

### Phase 4: a headless run

- `advance` can start each role itself, in Claude Code (5.11).
- The benchmark runs that way, several stories side by side where they share no journeys.
- The owner's GitHub Copilot checklist is run on this build.

Gate: a full benchmark run completes without a person, in under a third of the time a round takes today.

### Phase 5: delete

Remove what phases 1 to 3 made unused, with its tests and instructions. Greenfield: nothing is kept for
compatibility.

Gate: the skill's own suite passes, the benchmark is unchanged, and the sizes of section 9 are met.

### Phase 6: the guide, made again

When everything above is done, `docs/heldout-evaluator.html` is revamped and recreated from the final build
(decision 8): written new, not patched section by section. It explains the design that exists then: the checks
file, the three roles, the verdict and the test catalogue, with new diagrams and, where a recording still helps,
new recordings. The README's account of the flow is brought in line with it.

Phase 0 only removes the guide's rounds and results; until this phase the rest of it describes the old flow, and
says so in one line at its top.

Gate: nothing in the guide describes a command, role, phase or file the final build lacks, and a reader new to the
project can say from it alone what the evaluator does and how to ask for a verdict.

**Weak point.** A guide written last is out of date for the whole of phases 1 to 5. Writing it earlier would mean
writing it several times, about a design that each gate may still change.

**Weak point of the roadmap.** It assumes rounds resume. They are paused for the redesign, and phase 0 is itself a
round and more. If rounds cannot be afforded, only phase 1's items 1, 4 and 5 can be done responsibly,
judged by reading the outputs of the three stories already recorded.

## 9. Targets

Measured on the phase 0 benchmark, against the present build's figures on the same benchmark.

| Measure | Today (single runs) | Target |
| --- | --- | --- |
| Verdict as keyed | 11 of 12 across rounds 32 and 35 | no worse, on stories nobody tuned on |
| Defects found | 28 of 30 | no worse |
| False positives | 2 | no more; none on stories with no defect |
| Tokens, small story | about 300k | 150k or less |
| Tokens, large story | about 660k | 330k or less |
| Subagent minutes, large story | 63 | 30 or less |
| Checks for the largest story | 109 to 149 | 50 or fewer, same defects found |
| Failures an agent must examine, largest story | 85 | the number of causes, about 15 |
| Live probes, a later story on a known application | 8 to 12, against 26 to 28 for its first story | falling with each story; a story inside known areas needs none before its run |
| Scripts | about 13,600 lines | about 7,000 |
| Instructions | about 3,000 lines | about 1,500 |
| A full benchmark run | about a day, attended | under 3 hours, unattended |
| The test catalogue | none | a person who doesn't read code can say what two stories' tests checked, and QA can rerun one check from it |
| GitHub Copilot | never run end to end | the owner's checklist passes on one story at each gate |

**The budget per story** (decision 4): 150k tokens and 10 minutes for a small story, 330k and 30 minutes for a
large one. A story that reaches twice its budget stops adding checks and repairs, finishes with what it has, and
says so in the verdict. The figures are set from today's costs and the savings of section 5; phase 0 replaces them
with measured ones.

**Weak point.** Every target figure is a round number chosen from the mechanisms in section 5, not derived. Their
use is to make "better" falsifiable. Replace them with the noise band's figures once phase 0 has them.

## 10. Decisions taken (the owner, 2026-11-15)

| # | Question | Decision | Where it lands |
| --- | --- | --- | --- |
| 1 | Who implements the stories? | Another group of agents, outside this project. This project checks that what they built is right, by testing the live application | Threat 4 is real: 3.2, 6.5 |
| 2 | Are the tests a deliverable? | Yes: readable in plain English by technical and non-technical readers and QA, and reproducible when needed | 3.1, 5.12, 6.6 |
| 3 | Which agent app is primary? | GitHub Copilot, with Claude Code as the entry point for development; both must work with no loss of quality | 5.11, phases 0 and 4 |
| 4 | What may a story cost? | Left to this plan's judgement | The budget in section 9 |
| 5 | A smaller model for some roles? | Left to this plan's recommendation: every role stays on Opus; the benchmark measures the reviewer on a smaller model, and it moves only if verdicts, recall and precision stay inside the noise band on the whole benchmark. The oracle author and the operator are not candidates | Phase 1, after its gate |
| 6 | Is phase 0 affordable now? | Yes, and it starts from a clean slate: old artifacts and results are removed | Phase 0 |
| 7 | Is the goal right? | Yes, with two additions: tests can be rerun on demand, and are explained in plain English | 1, 3.1, 6.6 |
| 8 | What happens to the guide? | `docs/heldout-evaluator.html` is revamped and recreated when everything else is done | Phase 6 |
| 9 | Who may use the live application? | Every agent and subagent, in every phase (extraction, review, authoring, runs, triage), to do or to check anything. Where the application differs from the story, the story always wins | 1, 3.2, 5.1, 5.7, 6.5, 11, 12 |
| 10 | What happens to what an agent learns from the live application? | It is saved and reused: domain knowledge, user journeys and data seeding build up per application, so later subagents and stories spend fewer tokens and go to the live application only for what is not already known | 5.8, 6.7, phase 1, 9, 11 |
| 11 | When is the knowledge written? | Only for new knowledge. Using an entry, or confirming again that it works, changes nothing. An entry never records which story or requirement used it or when it was last picked, and frequently changing key-value pairs are limited or avoided | 5.8, 6.7 |

## 11. What stays, whatever else changes

- What is correct comes from the requirement. Any agent may use the live application in any phase; where it
  differs from the story, the story wins.
- Every expected value cites the line it came from.
- No application defect without a reproduction against the live application.
- Unattended from the story to the published verdict; what is unclear goes into the verdict, never to a person
  mid-run.
- The verdict is a recommendation. A person decides, and the evaluator files nothing.
- Nothing in the skill names an application.
- Secrets are referenced, never written, and what is written is redacted.
- A deterministic command decides what happens next; agents do the steps that need judgement.
- Journeys as the shared, checked knowledge of how an application is operated, inside a store of everything
  learned about it that each story adds to and the next one starts from.
- Every test explained in plain English and rerunnable on demand.
- The same quality in GitHub Copilot and in Claude Code.

## 12. The plan's own weakest points

1. **It trusts a benchmark that does not exist.** If phase 0 turns out too costly, the plan loses its means of
   proof, and most of sections 5 to 9 become opinion.
2. **The checks file is the bet.** The saving from 5.1 to 5.3 depends on a data format that stays simple under real
   stories. The stories recorded so far suggest it can; fourteen stories are not many.
3. **The vacuous-pass control is unproven**, and today's design has no better one. Neither is a reason to skip it.
4. **Merging hardener and triager may cost precision.** It is separable and gated on exactly that.
5. **The plan may be too large for one maintainer.** Phase 1 is deliberately worth doing alone, and the plan says
   to stop there if it is enough.
6. **It was written from records, not from running the system.** The first hour of phase 2 on a real story will
   correct it, and the plan should be revised then rather than defended.
7. **Open access trades a wall for a rule.** Today the test author cannot expect what the application does, because
   it never sees it. Under decision 9 it can see it, and "the story wins" holds only as far as each value's
   citation and the reviewer make it hold. An unclear line read the application's way passes both. The benchmark
   must watch for exactly this: a switched-on defect that is missed because the checks expected the defective
   behaviour. `AGENTS.md` and the skill's references still state the old rule and change when this is built.
