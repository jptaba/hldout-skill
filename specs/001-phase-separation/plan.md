# Implementation Plan: Phase separation of a story's evaluation

**Branch**: `master` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

## Summary

Seven phase folders, one producer each, keeping only handoffs ([data-model.md](data-model.md)); the hardener works
on its own copy of the tests, the triager writes its own decisions file; run records and probe logs keep only what
later phases cite; scripts move into one folder per phase. Decisions in [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript on Node 20.11+ (`node:` builtins), run with tsx
**Primary Dependencies**: Playwright test (existing); no new dependency
**Storage**: files: `output/<profile>/<KEY>/` (kept record), `.heldout/<profile>/<KEY>/` (scratch)
**Testing**: `node --test` (`npm run test:skill`), `npm run typecheck`; a round (`dev/round.ts`) for agent-facing proof
**Target Platform**: Windows, macOS, Linux; GitHub Copilot and Claude Code
**Project Type**: CLI and agent skill
**Performance Goals**: no phase slower than today
**Constraints**: held-out rules unchanged; `core/paths.ts` the only place that knows folder names; greenfield
**Scale/Scope**: about 60 script modules, 5 agent files, the skill's references, about 25 test files

## Constitution Check

| Principle | Check | Status |
| --- | --- | --- |
| I. Held-out integrity | the draft stays frozen in its own folder; integrity compares draft and hardened copy; who reads what is narrowed, never widened | pass |
| II. Agnostic | no application named; agent files name commands and phase folders only | pass |
| III. Spec-driven, reviewed | each increment: this spec, `agentctl verify`, two reviews (guardrail files), gate | pass |
| IV. Tests prove behaviour | each increment ships tests; the round proof waits for the owner (spec, Assumptions) | pass, round pending |
| V. Security | no secret moves; scrubbing unchanged | pass |
| VI. Greenfield and lean | no migration of old stories; the change exists to cut context | pass |

## Project Structure

### Documentation (this feature)

```text
specs/001-phase-separation/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── contracts/handoffs.md
```

### Source Code

```text
.github/scripts/
├── core/        shared: paths, config, files, history, cli, probe-log, secrets, redact
├── probe/       shared tools of hardening and triage: inspect, api-probe, mcp-probe, trace
├── fetch/       1 requirement   (from requirement/: fetch, jira, mock, evidence)
├── contract/    2 contract      (from requirement/: contract*)
├── authoring/   3 tests         (scaffold, lint, spec-model, draft, journeys)
├── hardening/   4 hardening     (from authoring/: integrity*, confirm, preflight; run/fast-harden)
├── run/         5 run           (run, results)
├── triage/      6 triage
├── verdict/     7 verdict       (from report/)
├── flow/        advance, status, show, stats, note, prune
└── setup/
```

**Structure Decision**: one folder per phase, named for what it does; `core/` and `probe/` are shared. The import
order becomes core ← probe ← fetch ← contract ← authoring ← hardening ← run ← triage ← verdict ← flow, setup.

## Increments

1. **Layout (US1)**: the seven phase folders; the hardened copy, its log and its probes in `4-hardening/`; the
   triager's decisions and probes in `6-triage/`; agents and references point at their inputs only; a test per agent.
2. **Lean (US2)**: slim run record; superseded runs dropped; uncited probes dropped; freeze record of hashes; scratch
   per phase, cleared at handoff.
3. **Scripts (US3)**: the moves above, the import-order test updated; no behaviour change.

## Complexity Tracking

None.
