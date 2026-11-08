# Feature Specification: A coordinator agent, and approvals where the blocks are

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-08 | **Status**: Draft

**Input**: the review of the agent setup (2026-11-08): a skill runs nothing, the main agent orchestrates either way,
and a subagent's tools and approvals come from its own definition and the app's permission settings, not from who
orchestrates it. In GitHub Copilot a coordinator custom agent still helps: its tools, the only agents it may call and
its model are fixed, and it is an entry point that can't be skipped. The blocks seen in rounds came from the round
project sitting outside the open workspace and from approvals the setup doesn't give (file edits).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A coordinator for GitHub Copilot (Priority: P1)

**Independent Test**: the agent files' tests; `doctor` in a project.

**Acceptance Scenarios**:

1. **Given** a project set up by `init` or `update`, **Then** it has `.github/agents/heldout-evaluator.agent.md`: user
   invocable, with the `agent` tool among read, search, edit and execute, `agents:` naming exactly the five phase
   agents, the Opus model list, and a short body that drives a story with `heldout advance KEY` and sends the rules
   to the skill. Claude Code gets no bridge for it: its main agent with the skill is the coordinator there.
2. **Given** that file with a wider tool list, another agent in `agents:` or an unknown key, **Then** the check that
   guards the phase agents' tools (`doctor`, the agent files' tests) reports it.

### User Story 2 - SKILL.md is the reference, not the app's delegation manual (Priority: P1)

1. **Given** SKILL.md, **Then** it says which agent coordinates in each app (Copilot: the `heldout-evaluator` agent;
   Claude Code: the main agent with this skill) and keeps the rules, setup, phases and references; the Copilot-only
   delegation details (the `agent` tool, `--quiet`) are in the coordinator.

### User Story 3 - The approvals an evaluation needs (Priority: P1)

1. **Given** a project set up by `init` or `update`, **Then** Claude Code's settings allow file edits in the story
   record, the scratch area and the journeys folders (`output/`, `.heldout/`, `journeys/`, `journeys-*/`, at the
   project root) without a prompt; Copilot, which already approves edits in the workspace except dotfiles, gets the
   scratch area (`.heldout/`). Nothing else is widened: no file the skill ships matches an approval.
2. **Given** an agent file whose `name:` isn't its file's, or a project's own agent named like one of the skill's,
   **Then** the agent files' check (and `doctor`) reports it: Copilot calls agents by name.
3. **Given** a development round, **Then** `dev/round.ts` says to open the round project itself in the agent app
   (its workspace and working directory), not to drive it from the skill repository.

## Requirements *(mandatory)*

- **FR-001**: US1 to US3 as stated. The coordinator is shipped like the phase agents (`AGENT_FILES`) and checked by
  the same least-privilege rule (`core/roles.ts`).

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for US1.1, US1.2, US3.1 and US3.2.
- **SC-002**: One story of a fresh round, run end to end in a session started in the round project with the shipped
  settings only, reaches its verdict; the permission denials it meets are counted and reported.

## Assumptions

- Copilot's `agents:` takes agent names, and a custom agent's `tools` override the main agent's selection (VS Code
  docs, read 2026-11-08). Claude Code's `"agent"` setting is not used: it would replace Claude Code's system prompt.
- VS Code asks before edits to dotfiles, system folders and files outside the workspace by default (1.104 release
  notes), and merges a workspace's `chat.tools.edits.autoApprove` with that default; Claude Code's `Edit(/path)` is
  relative to the project root for project settings. SC-002's round shows the Claude Code side; Copilot's is not run.
- The edit approvals don't cover `heldout.config.json`, `.env` or the agent files: those change at setup, with a person.
