# Next steps

Recommended after round 34 (2026-10-12), in the order to work on them. Each item is done when its check is met;
results go to the guide ([heldout-evaluator.html](heldout-evaluator.html)) like every round.

| # | Step | Why | Done when |
| --- | --- | --- | --- |
| 1 | Run the skill on a second application | Every fix since round 31 came from one application, so "works on any application" is a design claim, not a measured one. An application with another way of signing in and pages rendered on the server is the most likely to show real gaps | A fresh onboarding and two or three stories on it are evaluated, and what they showed is fixed |
| 2 | Fresh stories, with answer keys the evaluator's developer does not touch afterwards | TOOL-8 and TOOL-9 have been run three times and both keys were edited after runs. The scores are honest but no longer blind in a strong sense | The stories of step 1 are scored against keys written before the runs by someone who takes no part in them, and the keys are left as they are |
| 3 | Put the fast path through a real story | "A guess left in a test is settled by the test's own run" has unit tests only | One story goes from frozen draft to evaluation without a hardener, or the run shows why it can't |
| 4 | Write the standing rules into the agent files | Rules such as "change files with the edit tool only" and "keep records that can't be deleted to a minimum" are known to the main agent only, and subagents break them | The agent files state them and a round shows no breach |
| 5 | Move the rounds off shared live demos | One round left about ninety records that can't be deleted, and a data reset in the middle of a triage cost a retry | Rounds run against an instance started for the round and thrown away after it |
| 6 | Two conveniences that were left out | Neither blocked a run | `triage` writes one merged starting chain for failures that need the same record; the inspector can make an API call in the middle of a walk |

Not planned until step 1 shows whether today's behaviour holds elsewhere: further work on the hardener's cost and on
the triage report.
