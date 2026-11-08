# Feature Specification: A lean coordinator; the phase commands belong to the subagents

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-08 | **Status**: Draft

**Input**: the owner (2026-11-08): the skill is too large for something that only coordinates, and it still names
commands the subagents should run. Both the skill and the Copilot coordinator agent should be as lean as possible.
The owner chose that a fresh triager, not the coordinator, decides an audited amendment proposed by the hardener.

Today SKILL.md is 317 lines (33 KB) and the coordinator reads it whole. Most of it repeats what the phase agents
and their references already hold (each agent names its own commands and reads its own references; none reads
SKILL.md), and parts are stale: `advance` already freezes, checks integrity, runs the evaluation and the re-run,
renders the verdict, publishes and harvests. The one decision left to the coordinator, `integrity --amend`, is a
decision about WHAT a test checks, which governance.md says the orchestrator never makes; and
`hardening-cases.md` tells the hardener to run `--amend`, which its agent file forbids.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The skill holds what the coordinator needs (Priority: P1)

1. **Given** SKILL.md, **Then** it holds only: what the skill is, who coordinates in each app, when to set up (the
   steps in `references/setup.md`), the loop on `heldout advance KEY`, what "unattended" means, what the coordinator
   never does, and what to tell the user at the end; at most 120 lines. The phases, browser tiers, rules every phase
   keeps and the output layout move unchanged in meaning to `references/pipeline.md`, for people and for a
   coordinator whose app can't run subagents.
2. **Given** SKILL.md and the coordinator agent, **Then** the only `heldout` commands they tell the coordinator to
   run are `advance`, `status`, `note`, `show` (the history, at the end) and `stats`, plus the setup commands in
   `references/setup.md`. No phase command (`contract`, `scaffold`, `lint`, `integrity`, `run`, `triage`, `verdict`,
   `publish`, `journeys --harvest`), however it is written.
3. **Given** the coordinator agent, **Then** it holds only how it works in Copilot (the `agent` tool, its five
   agents, what to pass them, asking only in setup), and sends everything else to SKILL.md, the cost note included;
   no rule is stated in both. SKILL.md keeps the rules the coordinator follows (no `cd`, no scripts, the cost note).

### User Story 2 - A fresh triager decides an audited amendment (Priority: P1)

1. **Given** the hardener has fixed an assertion's implementation, **When** it runs
   `heldout integrity KEY --propose "<assertion>" --reason "…"`, **Then** the proposal is recorded in the history
   with the assertion's current text, and only for an assertion integrity lists as changed.
2. **Given** a pending proposal, **When** `advance` finds integrity not preserved (before the evaluation run or
   before a re-run), **Then** it hands the triager "Review the proposed amendment(s) for KEY: …"; the triager judges
   the change against the contract and runs `integrity KEY --amend … --reason …` or
   `integrity KEY --reject … --reason …`. A rejected proposal sends the hardener to restore the assertion; a change
   nobody proposed sends the hardener as today. A rejection stands for the text it judged: `--propose` refuses the
   same change again, and a re-freeze that changed the draft starts the review anew.
3. **Given** no pending proposal for an assertion's current text, **Then** `integrity --amend` refuses it.

### User Story 3 - The phase agents carry their own commands (Priority: P2)

1. **Given** the owner's later answer to an open question, **Then** the coordinator hands it to the contract
   extractor ("Record the story owner's answer to G<n> of KEY: …"), which runs `contract KEY --answer`.
2. **Given** the hardener and the triager, **Then** each says that no run or run record is deleted, renamed or
   renumbered (a rule SKILL.md held alone). governance.md's roles say the orchestrator decides nothing and the
   triager decides a proposed amendment.

## Requirements *(mandatory)*

- **FR-001**: US1 to US3 as stated. No held-out rule is weakened: each rule SKILL.md held is in
  `references/pipeline.md`, and those that bind a phase are also where that phase's agent reads.
- **FR-002**: The hardener still never runs `--amend` or `--snapshot`; the agent that proposes never approves.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for US1.1 (size, sections), US1.2 (no phase command in
  SKILL.md or the coordinator), US2.1 to US2.3 (proposal state, routing, refusal) and US3.2.
- **SC-002**: SKILL.md at most 120 lines; the coordinator agent at most 20 lines.
- **SC-003**: A round shows an evaluation reaching its verdict from the lean skill (with `specs/016` SC-002).

## Assumptions

- A subagent's identity is not checked by the commands: who runs `--amend` is fixed by the agent files, as today.
- The proposal lives in `history.jsonl` (`amend-proposed`, `amend-rejected`), next to `amended`; `freeze.json` is
  unchanged.
