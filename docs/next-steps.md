# Next steps

Recommended after round 34 (2026-10-12) and worked through in order in round 35. Results are in the guide
([heldout-evaluator.html](heldout-evaluator.html), "Round 35").

| # | Step | Why | Outcome |
| --- | --- | --- | --- |
| 1 | Run the skill on a second application | Every fix since round 31 came from one application, so "works on any application" was a design claim, not a measured one | Done. ParaBank: pages rendered on the server, a session cookie, an API that takes no credentials, sign-up on a page only, nothing deletable. Three stories from one onboarding; thirteen things it showed were fixed |
| 2 | Fresh stories, with answer keys the evaluator's developer does not touch afterwards | TOOL-8 and TOOL-9 had been run three times and both keys were edited after runs | Done. PB-1 to PB-3 and their keys were written by an independent author before the runs and are as that author left them: 2 of 3 verdicts as keyed, 16 of 17 defects, 2 findings the keys do not list |
| 3 | Put the fast path through a real story | "A guess left in a test is settled by the test's own run" had unit tests only | Done, with a caveat. A second draft of PB-3 left two guesses; one sat in a new journey, so the hardener was called (both guesses were right; about 100,000 tokens). Replayed from the same frozen draft with that journey proven, `advance` settled the guess in the test by its run and went to the evaluation without a hardener |
| 4 | Write the standing rules into the agent files | Rules known to the main agent only were broken by subagents | Done: files are changed with the file tools only; records that can't be deleted are kept to a minimum and counted in the reply |
| 5 | Move the rounds off shared live demos | One round left about ninety undeletable records on a public demo | Done for round 35: a local container started for the round and removed after it. Rounds on Toolshop still use the public demo |
| 6 | Two conveniences that were left out | Neither blocked a run | Done: `triage` writes one chain with every distinct failing call (`confirm/all.chain.json`); the inspector has `request`, `force` and `rewrite` steps (a call in the middle of a walk; a forced submission replayed) |

## Decided after round 35

A verdict whose only open questions block no criterion stays PASS: the criteria were judged in full, and a warning
on every loosely written story would make warnings mean nothing. What changed is where the questions are seen: the
verdict's first line, and the summary posted to the story, now count them and point to the section that lists them.
A question the criteria can't be judged without is recorded as required and makes the verdict PASS WITH WARNINGS,
as before.

## Done after round 35

- **Secrets in traces.** After a run, known secrets are taken out of the files inside every trace archive and out of
  the archive the HTML report carries in its page. All 44 traces of one ParaBank run, and its report, held the test
  users' password before; none does after, and the archives still open.

- **The new triage tools, used by an agent.** PB-1 was run again on a fresh instance and triaged from nothing: all 22
  failures confirmed as before, with the merged chain as the starting point, a loan account opened by `force`,
  another customer's money taken by `rewrite`, and eight `request` calls inside the walk; no script of the triager's
  own. What that use showed was fixed: the chain now lists the call that made a state before the check that read it,
  carries the headers that shape the answer and says which failures it leaves out; a rewritten request is reported
  with the value it would have sent and the one that went out.

- **A triage report that is read, not searched.** It opens with the failures that look alike (the same criterion and
  the same call and status, or the same locator); the first of a group is written out, the others show what differs.
  Of an HTML error page it shows what the page says, not its markup; the tests that passed are one line; a decision
  written out once is named after that. PB-2's report for 57 failures went from 115 KB to about 70 KB before the
  decisions and from 144 KB to 80 KB with them; TOOL-8's from 47 KB to 27 KB. Not yet read by a triager in a round.

## Open after round 35

| What | Why it matters |
| --- | --- |
| A guess in a journey that is new to the story always calls the hardener | One new one-line journey cost a hardening pass in step 3. Settling it by the run is possible when every test that calls it passed, but a wrong guess in a journey that returns a yes or no can still pass |
