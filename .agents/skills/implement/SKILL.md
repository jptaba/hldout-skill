---
name: implement
description: Implement exactly what a change contract names (a contract file or a plan section) and prove it with the project's proof steps. Use when building or fixing anything in this repository; ends at a proven, staged change ready for independent review, never at a commit you approved yourself.
---

# Implement

1. **Find the contract.** A plan section (`docs/<plan>.md#<section>`), a finding, or a file in `docs/contracts/`.
   None that fits? Write one first with the `contract` skill: it takes a minute and it is what the review judges.
2. **Change only what the contract names.** Anything else is another contract.
3. **Code and tests together.** New behaviour ships with a test; a bug fix with a regression test. Follow
   `AGENTS.md` for the project's rules.
4. **Stage everything, then prove it:**
   `node .agents/scripts/agentctl.mjs verify --contract <file>[#section]`
   It runs the project's proof steps (`.agents/config.json`), writes `.agents/runs/packet.md` and records the result
   for the staged tree. Exit 0 is required. A red step means fix and run it again; never weaken a test to go green.
5. **Hand over for review.** `node .agents/scripts/agentctl.mjs status` says how many independent reviews the change's
   tier needs. Ask the `code-reviewer` agent for each (a fresh context; for a second review, another model). Do not
   restage after a review: a new tree needs new reviews.
6. **Then the gate** (the `pr-packet` skill): the commit carries the record and your restatement.

Never: commit with `--no-verify`, approve your own diff, push a red tree, add a dependency the contract doesn't name,
or widen the task beyond the contract.
