# One story in GitHub Copilot: the owner's checklist

GitHub Copilot is the primary app, and it can't be run where the skill is developed
([optimization-plan.md](optimization-plan.md), 5.11). So at each gate of the plan the owner runs one story there
and notes what happened. A difference found here outranks a benchmark result from Claude Code.

## Before

1. Start the benchmark's application: `npx tsx dev/bench.ts up` (Docker; `BENCH_APP_PASSWORD` set to the demo
   accounts' password, `HELDOUT_ROUNDS_DIR` to the folder for run projects).
2. Make a project with one small story and no overview: `npx tsx dev/bench.ts new copilot-<date> --stories SHOP-1 --no-overview`.
3. Switch the story's faults on: `npx tsx dev/bench.ts faults <ids from demo/bench/keys/SHOP-1.json>`.
4. Open the project's folder (not this repository) in VS Code, reload the window, pick the `heldout-evaluator`
   agent and Opus, and ask: "Write the application's overview, then evaluate SHOP-1."

## What to note

| Check | Result |
| --- | --- |
| The `heldout-evaluator` agent is offered in the agents dropdown | |
| The skill and the five subagents load once (from `.github/`, not from `.claude/` as well) | |
| Each agent's model: the first name in its `model` list is one Copilot knows and uses | |
| `browser` is a tool name Copilot knows; the Playwright MCP server starts and its tools reach the hardener and the triager | |
| The `heldout` command runs without an approval prompt (`.vscode/settings.json`), in every kind of session tried | |
| Which permission levels the session offers (Manual, Assisted, Allow all), and which was used | |
| Every call that still asked for approval, and what it was | |
| Each subagent ran in a context of its own, and the coordinator did none of a phase's work itself | |
| Whether Copilot reports what each subagent cost (tokens, time), and whether `note --usage` recorded it | |
| The story ran from its fetch to its published verdict without a question to the user | |
| Wall-clock minutes from the request to `✔ SHOP-1 is complete` | |
| Anything that behaved differently from the skill's instructions | |

## After

5. Score it: `npx tsx dev/bench.ts score copilot-<date> SHOP-1` (the cost columns stay empty: only Claude Code's
   headless runs report them to the tool).
6. Put the table's results under the gate's row in the plan's Progress section.
