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

## Open after round 35

| What | Why it matters |
| --- | --- |
| A guess in a journey that is new to the story always calls the hardener | One new one-line journey cost a hardening pass in step 3. Settling it by the run is possible when every test that calls it passed, but a wrong guess in a journey that returns a yes or no can still pass |
| The HTML report's own bundle is not scrubbed | Trace archives now are: after a run, known secrets are taken out of the files inside each one (all 44 traces of one ParaBank run held the test password before). The report's `index.html` packs its data in a form the scrub does not open; it is kept out of git |
| The triage report repeats long error bodies | 115 KB for 57 failures in PB-2 |
| The new inspector steps and the merged chain have not been used by an agent in a round yet | Tried by hand on the local application only |
